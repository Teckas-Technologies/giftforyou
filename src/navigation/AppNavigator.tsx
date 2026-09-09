import React, { ComponentProps, useEffect, useState } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQueryClient } from '@tanstack/react-query';

import { useAuth } from '../contexts/AuthContext';
import { getProfile, getPlanStatus } from '../services/api';
import { PLAN_STATUS_QUERY_KEY } from '../features/subscription/hooks';
import {
  SplashScreen,
  OnboardingScreen,
  LoginScreen,
  SignUpScreen,
  ForgotPasswordScreen,
  HomeScreen,
  CalendarScreen,
  ContactsScreen,
  ProfileScreen,
  ProfileSetupScreen,
  AddContactScreen,
  QuestionnaireScreen,
  NotificationsScreen,
  InvitationsScreen,
  AddEventScreen,
  EventDetailScreen,
  ContactDetailScreen,
  SettingsScreen,
  DiscoverScreen,
  SendLoveNoteScreen,
  SubmitLoveNoteScreen,
  SubscriptionScreen,
  RedeemCouponScreen,
  CompanyCodeIntroScreen,
} from '../screens';
import { colors } from '../theme';

export const navigationRef = createNavigationContainerRef();

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Tab Bar Icon Component
const TabIcon = ({
  focused,
  iconName,
  color,
}: {
  focused: boolean;
  iconName: IoniconName;
  color: string;
}) => {
  if (focused) {
    return (
      <View style={styles.activeIconContainer}>
        <LinearGradient
          colors={[colors.primaryAccent, colors.secondary]}
          style={styles.activeIconBg}
        >
          <Ionicons name={iconName} size={18} color="#FFFFFF" />
        </LinearGradient>
      </View>
    );
  }
  return <Ionicons name={iconName} size={22} color={color} />;
};

// Bottom Tab Navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          let iconName: IoniconName;

          switch (route.name) {
            case 'Calendar':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Contacts':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <TabIcon focused={focused} iconName={iconName} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMedium,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarShowLabel: true,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Contacts" component={ContactsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Auth Stack Navigator (includes Splash and Onboarding)
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Splash"
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

// Main App Stack Navigator (for authenticated users).
//
// A returning user (session restored at cold start) always mounts on
// MainApp — a one-time redirect to Questionnaire/CompanyCodeIntro for a
// user who somehow never finished onboarding happens imperatively (see
// checkQuestionnaireStatus below) once the profile check resolves, instead
// of blocking this navigator's first render on that network call.
//
// A user who just signed in/up THIS session mounts with the correct
// initialRoute already known (AppNavigator holds on a loading screen until
// the profile check resolves) — so a brand-new user goes straight to
// onboarding instead of flashing Home first and bouncing back.
const MainStack = ({
  initialRoute = 'MainApp',
  initialRouteParams,
}: {
  initialRoute?: string;
  initialRouteParams?: Record<string, any>;
}) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={initialRoute}
    >
      <Stack.Screen name="MainApp" component={MainTabNavigator} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="AddContact" component={AddContactScreen} />
      <Stack.Screen name="Questionnaire" component={QuestionnaireScreen} />
      <Stack.Screen
        name="CompanyCodeIntro"
        component={CompanyCodeIntroScreen}
        initialParams={initialRouteParams}
      />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Invitations" component={InvitationsScreen} />
      <Stack.Screen name="AddEvent" component={AddEventScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="ContactDetail" component={ContactDetailScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Discover" component={DiscoverScreen} />
      <Stack.Screen name="SendLoveNote" component={SendLoveNoteScreen} />
      <Stack.Screen name="SubmitLoveNote" component={SubmitLoveNoteScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="RedeemCoupon" component={RedeemCouponScreen} />
    </Stack.Navigator>
  );
};

// Loading Screen Component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <LinearGradient
      colors={['#FFFFFF', '#fbe5f5', '#ccf9ff', '#FFFFFF']}
      locations={[0, 0.3, 0.7, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

// Main App Navigator
const AppNavigator = () => {
  const { isAuthenticated, loading, justSignedIn } = useAuth();
  const [profileChecked, setProfileChecked] = useState(false);
  // Only used for the justSignedIn path — MainStack mounts with this once
  // known, instead of always mounting on MainApp and correcting after.
  const [resolvedInitialRoute, setResolvedInitialRoute] = useState('MainApp');
  const [resolvedInitialRouteParams, setResolvedInitialRouteParams] = useState<
    Record<string, any> | undefined
  >(undefined);
  const queryClient = useQueryClient();

  // Warm the plan-status cache as soon as the user is authenticated, well
  // before they'd ever reach Invitations/Discover. Without this, the free
  // contact-limit check on those screens has no cached data on the user's
  // very first attempt this session, so it still falls through to a real
  // network round-trip before showing the upgrade prompt — this is what
  // makes that check actually instant, not just on the second try.
  useEffect(() => {
    if (isAuthenticated) {
      queryClient.prefetchQuery({
        queryKey: PLAN_STATUS_QUERY_KEY,
        queryFn: getPlanStatus,
        staleTime: 30_000,
      });
    }
  }, [isAuthenticated, queryClient]);

  // Check whether the questionnaire is completed once authenticated.
  //
  // - Returning user (justSignedIn false): never blocks the initial render
  //   — MainApp is always the first thing shown (see the render logic
  //   below), and this only redirects a user who somehow never finished
  //   onboarding away from it once the check resolves.
  // - Just signed in/up this session (justSignedIn true): the render logic
  //   holds on a loading screen until this resolves, so instead of an
  //   imperative reset (there's no MainStack mounted yet to reset) this
  //   just records the destination MainStack should mount on directly —
  //   no flash of Home before bouncing to onboarding.
  //
  // Runs once per login, not on every screen focus.
  useEffect(() => {
    const checkQuestionnaireStatus = async () => {
      if (isAuthenticated && !profileChecked) {
        try {
          const response = await getProfile();
          const user = response?.user;

          // Only force the questionnaire for genuinely new users with no
          // answers at all. If they already have data — including answers
          // migrated from an invite they filled before signing up — skip
          // straight into the app; they can review/edit it any time via
          // Profile → My Gift Preferences.
          const hasAnyAnswers =
            user?.questionnaireCompleted || (user?.questionnaireCompletionPercent || 0) > 0;

          if (user && !hasAnyAnswers) {
            // Same "genuinely new user" signal also gates the one-time
            // "Have a company code?" prompt — shown once, right before the
            // questionnaire, never again on later logins. Free-plan users
            // only; anyone already upgraded has no reason to see it.
            const destination =
              (user.plan || 'free') === 'free'
                ? { name: 'CompanyCodeIntro', params: { nextRoute: 'Questionnaire' } }
                : { name: 'Questionnaire', params: undefined };

            if (justSignedIn) {
              setResolvedInitialRoute(destination.name);
              setResolvedInitialRouteParams(destination.params);
            } else if (navigationRef.isReady()) {
              navigationRef.reset({ index: 0, routes: [destination] });
            }
          }
        } catch (error) {
          console.log('Error checking profile:', error);
        } finally {
          setProfileChecked(true);
        }
      }
    };

    checkQuestionnaireStatus();
  }, [isAuthenticated, profileChecked, justSignedIn]);

  // Reset profile check when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setProfileChecked(false);
      setResolvedInitialRoute('MainApp');
      setResolvedInitialRouteParams(undefined);
    }
  }, [isAuthenticated]);

  // Block only for the brief, one-time window right after an explicit
  // sign-in/sign-up while the profile check is still resolving — a normal
  // "logging you in..." wait, not the every-app-open wait this replaced.
  if (loading || (isAuthenticated && justSignedIn && !profileChecked)) {
    return (
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Loading" component={LoadingScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {isAuthenticated ? (
        <MainStack
          initialRoute={resolvedInitialRoute}
          initialRouteParams={resolvedInitialRouteParams}
        />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    height: 95,
    paddingTop: 10,
    paddingBottom: 30,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  tabBarLabel: {
    fontSize: 11,
    fontFamily: 'Handlee_400Regular',
    marginTop: 4,
    marginBottom: 4,
  },
  activeIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
});

export default AppNavigator;
