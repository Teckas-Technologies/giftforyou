import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../contexts/AuthContext';
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
  // QuestionnaireScreen, // Handled via web form only
  NotificationsScreen,
  InvitationsScreen,
  AddEventScreen,
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
          <Ionicons name={iconName} size={22} color="#FFFFFF" />
        </LinearGradient>
      </View>
    );
  }
  return <Ionicons name={iconName} size={24} color={color} />;
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

// Auth Stack Navigator
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Login"
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

// Main App Stack Navigator (for authenticated users)
const MainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="MainApp"
    >
      <Stack.Screen name="MainApp" component={MainTabNavigator} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="AddContact" component={AddContactScreen} />
      {/* Questionnaire is handled via web form only - commented for potential future use */}
      {/* <Stack.Screen name="Questionnaire" component={QuestionnaireScreen} /> */}
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Invitations" component={InvitationsScreen} />
      <Stack.Screen name="AddEvent" component={AddEventScreen} />
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

  if (loading) {
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
      {isAuthenticated ? <MainStack /> : <AuthStack />}
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
    height: 110,
    paddingTop: 14,
    paddingBottom: 45,
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
    fontWeight: '500',
    marginTop: 4,
  },
  activeIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default AppNavigator;
