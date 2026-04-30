// GiftBox4you Screens - Main Export

export { default as SplashScreen } from './SplashScreen';
export { default as OnboardingScreen } from './OnboardingScreen';
export { LoginScreen, SignUpScreen, ForgotPasswordScreen } from './auth';
export { default as HomeScreen } from './HomeScreen';
export { default as CalendarScreen } from './CalendarScreen';
export { default as ContactsScreen } from './ContactsScreen';
export { default as ProfileScreen } from './ProfileScreen';

// New screens
export { default as ProfileSetupScreen } from './ProfileSetupScreen';
export { default as AddContactScreen } from './AddContactScreen';
// Questionnaire is handled via web form only - commented for potential future use
// export { default as QuestionnaireScreen } from './QuestionnaireScreen';
export { default as NotificationsScreen } from './NotificationsScreen';
export { default as InvitationsScreen } from './InvitationsScreen';
export { default as AddEventScreen } from './AddEventScreen';
export { default as ContactDetailScreen } from './ContactDetailScreen';
export { default as SettingsScreen } from './SettingsScreen';
export { default as DiscoverScreen } from './DiscoverScreen';

// Legacy exports for compatibility
export { default as CirclesScreen } from './CirclesScreen';
export { default as GiftsScreen } from './GiftsScreen';
