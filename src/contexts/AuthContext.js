import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../config/supabase';
import { registerForPushNotifications } from '../services/notifications';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Register push token when user is authenticated
  useEffect(() => {
    if (session && user) {
      // User is authenticated, register push token
      registerForPushNotifications().then(token => {
        if (token) {
          console.log('Push token registered for user:', user.id);
        }
      }).catch(err => {
        console.log('Push registration error:', err);
      });
    }
  }, [session, user]);

  // Sign up with email and password
  const signUp = async (email, password, name) => {
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

      // Create user profile in our users table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            external_id: data.user.id,
            email: email.toLowerCase(),
            name: name || 'User',
            profile_completed: false,
          }, {
            onConflict: 'id',
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
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
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'giftbox4you://reset-password',
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Update password
  const updatePassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Get access token for API calls
  const getAccessToken = () => {
    return session?.access_token;
  };

  const value = {
    user,
    session,
    loading,
    initialized,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    getAccessToken,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
