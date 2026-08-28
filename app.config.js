// Inline config plugin: force android:allowBackup="false" on the manifest.
// The top-level `android.allowBackup` field in app.config.js is silently
// ignored by this Expo version's prebuild, so we patch the AndroidManifest
// directly via @expo/config-plugins (already a transitive dep of expo).
const { withAndroidManifest } = require('@expo/config-plugins');

const withAllowBackupFalse = (config) =>
  withAndroidManifest(config, (cfg) => {
    const app = cfg.modResults.manifest.application?.[0];
    if (app) app.$['android:allowBackup'] = 'false';
    return cfg;
  });

// Inline config plugin: set android:windowSoftInputMode="adjustResize" on the
// main activity, so the screen resizes (rather than doing nothing) when the
// keyboard opens. Needed now that Login/SignUp no longer have a ScrollView to
// fall back on — without this, Android leaves focused inputs hidden behind
// the keyboard. iOS gets the equivalent via each screen's KeyboardAvoidingView
// behavior="padding".
const withAdjustResize = (config) =>
  withAndroidManifest(config, (cfg) => {
    const app = cfg.modResults.manifest.application?.[0];
    const activity = app?.activity?.find(
      (a) => a.$['android:name'] === '.MainActivity'
    );
    if (activity) activity.$['android:windowSoftInputMode'] = 'adjustResize';
    return cfg;
  });

module.exports = {
  expo: {
    name: 'GiftBox4you',
    slug: 'GiftBox4you',
    // User-visible version (semver MAJOR.MINOR.PATCH). Bump for every
    // release: a patch fix → 0.3.1, a feature release → 0.4.0, etc.
    // Keep aligned with package.json, android.versionCode (integer), and
    // ios.buildNumber. Previous client APKs were v0.1, v0.2, v0.3.0, so this
    // ship (logo/emoji rebrand + Azure API URL) is v0.3.1 with versionCode 4.
    version: '0.3.1',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#FDEEF3',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.giftbox4you.app',
      // iOS equivalent of versionCode — must increase with every release.
      // Convention is to keep it identical to `version`.
      buildNumber: '0.3.1',
      infoPlist: {
        NSPhotoLibraryUsageDescription:
          'GiftBox4you needs access to your photos so you can set a profile picture.',
        NSCameraUsageDescription:
          'GiftBox4you needs access to your camera so you can take a profile picture.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FDEEF3',
      },
      edgeToEdgeEnabled: true,
      package: 'com.giftbox4you.app',
      // Integer Android uses to decide whether an APK is an upgrade.
      // MUST increase by at least 1 every release, otherwise installs
      // fail with INSTALL_FAILED_VERSION_DOWNGRADE. Prior client APKs
      // (v0.1, v0.2, v0.3.0) used 3 or lower; this release is 4.
      versionCode: 4,
      googleServicesFile: './google-services.json',
      // Android Auto Backup is disabled via the inline `withAllowBackupFalse`
      // plugin (registered below). The top-level `allowBackup` field is not
      // honored by this Expo version's prebuild.
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      [
        'expo-splash-screen',
        {
          backgroundColor: '#FDEEF3',
          image: './assets/splash-icon.png',
          imageWidth: 200,
        },
      ],
      [
        'expo-notifications',
        {
          icon: './assets/icon.png',
          color: '#ca9ad6',
        },
      ],
      [
        '@react-native-google-signin/google-signin',
        {
          iosUrlScheme:
            process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME ||
            'com.googleusercontent.apps.202233735305-kvcdb0g5nfq10h4jb4q3u4l0tavu206i',
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission:
            'GiftBox4you needs access to your photos so you can set a profile picture.',
          cameraPermission:
            'GiftBox4you needs access to your camera so you can take a profile picture.',
        },
      ],
      '@react-native-community/datetimepicker',
      [
        // Allow plaintext HTTP requests in the release APK (Android 9+
        // blocks them by default). Required while the backend is on
        // http://… — drop this entry once it moves to HTTPS.
        'expo-build-properties',
        {
          android: {
            usesCleartextTraffic: true,
          },
        },
      ],
      // Disable Android Auto Backup so AsyncStorage / Supabase sessions
      // don't get cloud-restored across reinstalls — keeps test-device
      // installs deterministic. Implemented as an inline plugin because
      // the top-level `android.allowBackup` field is ignored here.
      withAllowBackupFalse,
      withAdjustResize,
    ],
    extra: {
      eas: {
        projectId: '432ed620-8985-48e6-9bb7-ca52c267378e',
      },
    },
    owner: 'sharmila_blessy',
  },
};
