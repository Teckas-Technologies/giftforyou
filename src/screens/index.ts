// Thoughtfully Screens - Main Export
// Screens live under src/features/<domain>/ (grouped by feature); this
// barrel is kept at its original path purely so AppNavigator's existing
// `from '../screens'` import doesn't need to change.

export { default as SplashScreen } from '../features/splash/SplashScreen';
export { default as OnboardingScreen } from '../features/onboarding/OnboardingScreen';
export { LoginScreen, SignUpScreen, ForgotPasswordScreen } from '../features/auth';
export { default as HomeScreen } from '../features/home/HomeScreen';
export { default as CalendarScreen } from '../features/calendar/CalendarScreen';
export { default as ContactsScreen } from '../features/contacts/ContactsScreen';
export { default as ProfileScreen } from '../features/profile/ProfileScreen';

// New screens
export { default as ProfileSetupScreen } from '../features/profile/ProfileSetupScreen';
export { default as AddContactScreen } from '../features/contacts/AddContactScreen';
export { default as QuestionnaireScreen } from '../features/questionnaire/QuestionnaireScreen';
export { default as NotificationsScreen } from '../features/notifications/NotificationsScreen';
export { default as InvitationsScreen } from '../features/invitations/InvitationsScreen';
export { default as AddEventScreen } from '../features/calendar/AddEventScreen';
export { default as EventDetailScreen } from '../features/calendar/EventDetailScreen';
export { default as ContactDetailScreen } from '../features/contacts/ContactDetailScreen';
export { default as SettingsScreen } from '../features/profile/SettingsScreen';
export { default as DiscoverScreen } from '../features/discover/DiscoverScreen';
export { default as SendLoveNoteScreen } from '../features/love-notes/SendLoveNoteScreen';
export { default as SubmitLoveNoteScreen } from '../features/love-notes/SubmitLoveNoteScreen';
export { default as SubscriptionScreen } from '../features/subscription/SubscriptionScreen';
export { default as RedeemCouponScreen } from '../features/subscription/RedeemCouponScreen';
export { default as CompanyCodeIntroScreen } from '../features/subscription/CompanyCodeIntroScreen';

// Legacy exports for compatibility
export { default as CirclesScreen } from '../features/contacts/CirclesScreen';
export { default as GiftsScreen } from '../features/gifts/GiftsScreen';
