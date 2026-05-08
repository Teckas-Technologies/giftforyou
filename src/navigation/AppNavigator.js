import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../contexts/AuthContext';
import { getProfile } from '../services/api';
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
} from '../screens';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Tab Bar Icon Component
const TabIcon = ({ focused, iconName, color }) => {
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
          let iconName;

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

// Main App Stack Navigator (for authenticated users)
const MainStack = ({ initialRoute = 'MainApp' }) => {
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
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Invitations" component={InvitationsScreen} />
      <Stack.Screen name="AddEvent" component={AddEventScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="ContactDetail" component={ContactDetailScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Discover" component={DiscoverScreen} />
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
  const { isAuthenticated, loading } = useAuth();
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [initialRoute, setInitialRoute] = useState('MainApp');
  const [profileChecked, setProfileChecked] = useState(false);

  // Check if questionnaire is completed when user is authenticated
  useEffect(() => {
    const checkQuestionnaireStatus = async () => {
      if (isAuthenticated && !profileChecked) {
        try {
          setCheckingProfile(true);
          const response = await getProfile();
          const user = response?.user;

          // Check if questionnaire is completed
          if (user && !user.questionnaireCompleted) {
            setInitialRoute('Questionnaire');
          } else {
            setInitialRoute('MainApp');
          }
        } catch (error) {
          console.log('Error checking profile:', error);
          setInitialRoute('MainApp');
        } finally {
          setCheckingProfile(false);
          setProfileChecked(true);
        }
      }
    };

    checkQuestionnaireStatus();
  }, [isAuthenticated, profileChecked]);

  // Reset profile check when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setProfileChecked(false);
      setInitialRoute('MainApp');
    }
  }, [isAuthenticated]);

  if (loading || (isAuthenticated && checkingProfile)) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Loading" component={LoadingScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack initialRoute={initialRoute} /> : <AuthStack />}
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
