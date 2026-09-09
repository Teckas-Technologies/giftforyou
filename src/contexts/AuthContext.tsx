import React, {
  createContext,
  ReactNode,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { registerForPushNotifications } from '../services/notifications';
import { initPurchases } from '../services/billing';
import { checkEmailRegistered } from '../services/api';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  offlineAccess: false,
});

interface AuthResult {
  data: any;
  error: { message: string } | Error | null;
  cancelled?: boolean;
}

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  // True only right after an explicit sign-in/sign-up action in this app
  // session (Supabase's 'SIGNED_IN' event) — never true for a session
  // restored from storage at cold start ('INITIAL_SESSION'). Lets
  // AppNavigator hold on a loading screen just long enough to route a
  // brand-new user straight to onboarding, without adding that same wait to
  // every normal app open.
  justSignedIn: boolean;
  signUp: (email: string, password: string, name: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<{ error: null }>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (newPassword: string) => Promise<AuthResult>;
  getAccessToken: () => string | undefined;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [justSignedIn, setJustSignedIn] = useState(false);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
      if (event === 'SIGNED_IN') {
        setJustSignedIn(true);
      } else if (event === 'SIGNED_OUT') {
        setJustSignedIn(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Register push token when user is authenticated
  useEffect(() => {
    if (session && user) {
      // User is authenticated, register push token
      registerForPushNotifications()
        .then((token) => {
          if (token) {
            console.log('Push token registered for user:', user.id);
          }
        })
        .catch((err) => {
          console.log('Push registration error:', err);
        });

      initPurchases(user.id).catch((err) => {
        console.log('RevenueCat init error:', err);
      });
    }
  }, [session, user]);

  // Sign up with email and password
  const signUp = useCallback(
    async (email: string, password: string, name: string): Promise<AuthResult> => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
          },
        });

        if (error) throw error;

        // Supabase does not return an error when the email is already
        // registered (anti email-enumeration). Instead it returns a user
        // with an empty `identities` array. Detect that and tell the user
        // to log in instead of silently "succeeding".
        if (
          data?.user &&
          Array.isArray(data.user.identities) &&
          data.user.identities.length === 0
        ) {
          return {
            data: null,
            error: { message: 'This email is already registered. Please log in instead.' },
          };
        }

        // Create user profile in our users table
        if (data.user) {
          const { error: profileError } = await supabase.from('users').upsert(
            {
              id: data.user.id,
              external_id: data.user.id,
              email: email.toLowerCase(),
              name: name || 'User',
              profile_completed: false,
            },
            {
              onConflict: 'id',
            },
          );

          if (profileError) {
            console.error('Profile creation error:', profileError);
          }
        }

        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    [],
  );

  // Sign in with Google (native flow → Supabase signInWithIdToken)
  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Clear any cached Google account so the account picker always appears.
      try {
        await GoogleSignin.signOut();
      } catch (_) {}

      const userInfo = await GoogleSignin.signIn();
      // `data.idToken` is the current SDK shape; `.idToken` at the top level
      // is a defensive fallback for an older response shape the installed
      // types no longer model.
      const idToken = userInfo?.data?.idToken ?? (userInfo as any)?.idToken;

      if (!idToken) {
        throw new Error('No ID token returned from Google');
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
        return { data: null, error: null, cancelled: true };
      }
      return { data: null, error };
    }
  }, []);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      // Pre-check: Supabase only returns a generic "Invalid login
      // credentials" (it won't distinguish unknown email from wrong
      // password). A server-side check (service-role, bypasses RLS) tells
      // us if the account truly doesn't exist so we can guide the user to
      // sign up. `null` = unknown (network/error) → don't block, fall
      // through to the normal sign-in flow.
      const registered = await checkEmailRegistered(email);
      if (registered === false) {
        return {
          data: null,
          error: { message: 'This email is not registered. Please create an account first.' },
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      try {
        await GoogleSignin.signOut();
      } catch (_) {}

      const { error } = await supabase.auth.signOut();
      // Always clear local state regardless of Supabase response
      setUser(null);
      setSession(null);
      if (error) {
        console.log('Supabase signOut error (local state cleared):', error);
      }
      return { error: null };
    } catch (error) {
      // Even if there's an error, clear local state
      setUser(null);
      setSession(null);
      console.log('SignOut exception (local state cleared):', error);
      return { error: null };
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'giftbox4you://reset-password',
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }, []);

  // Update password
  const updatePassword = useCallback(async (newPassword: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }, []);

  // Get access token for API calls
  const getAccessToken = useCallback(() => {
    return session?.access_token;
  }, [session]);

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      initialized,
      justSignedIn,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      resetPassword,
      updatePassword,
      getAccessToken,
      isAuthenticated: !!user,
    }),
    [
      user,
      session,
      loading,
      initialized,
      justSignedIn,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      resetPassword,
      updatePassword,
      getAccessToken,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
