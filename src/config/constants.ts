// App Configuration Constants
// Easy to change URLs and settings

export const APP_CONFIG = {
  // App Info
  appName: 'Thoughtfully',
  version: '1.0.0',
  // Matches ios.bundleIdentifier / android.package in app.config.js.
  packageName: 'com.thoughtfully.app',

  // Support
  // NOTE: renamed to match the thoughtfully.com domain per explicit
  // instruction — but this assumes that domain/inbox/social accounts
  // actually exist under the new name. Verify before shipping; a broken
  // support/legal link is worse than a working old-branded one.
  supportEmail: 'support@thoughtfully.com',
  websiteUrl: 'https://thoughtfully.com',
  faqUrl: 'https://thoughtfully.com/faq',
  privacyPolicyUrl: 'https://thoughtfully.com/privacy',
  termsUrl: 'https://thoughtfully.com/terms',

  // Store Links
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.thoughtfully.app',
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
