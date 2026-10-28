// App Configuration Constants
// Easy to change URLs and settings

export const APP_CONFIG = {
  // App Info
  appName: 'Thoughtfully',
  version: '1.0.0',
  // Matches ios.bundleIdentifier / android.package in app.config.js.
  packageName: 'com.thoughtfullyapp.mobile',

  // Support
  // Matches the real contact address used everywhere else (Privacy
  // Policy, backend emailService.js) — the earlier 'support@thoughtfully.com'
  // was a different, non-existent domain.
  supportEmail: 'info@giftthoughtfully.com',
  websiteUrl: 'https://giftthoughtfully.com',
  faqUrl: 'https://giftthoughtfully.com/#faq',
  privacyPolicyUrl: 'https://giftthoughtfully.com/privacy',
  termsUrl: 'https://giftthoughtfully.com/terms',

  // Store Links
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.thoughtfullyapp.mobile',
  // appStoreUrl's numeric id was already a placeholder (id123456789) before
  // this rename — replace with the real App Store id once the app is
  // actually published there.
  appStoreUrl: 'https://apps.apple.com/app/thoughtfully/id123456789',

  // Share
  shareMessage:
    'Never miss a birthday! Download Thoughtfully - the perfect app for remembering special moments and finding thoughtful gifts.',
  downloadUrl: 'https://thoughtfully.com/download',

  // Social Media
  instagramUrl: 'https://instagram.com/thoughtfully',
  facebookUrl: 'https://facebook.com/thoughtfully',
  twitterUrl: 'https://twitter.com/thoughtfully',
} as const;

export default APP_CONFIG;
