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

module.exports = {
  expo: {
    name: 'GiftBox4you',
    slug: 'GiftBox4you',
    // User-visible version (semver MAJOR.MINOR.PATCH). Bump for every
    // release: a patch fix → 0.3.1, a feature release → 0.4.0, etc.
    // Keep aligned with package.json, android.versionCode (integer), and
    // ios.buildNumber. Previous client APKs were v0.1 and v0.2, so the
    // next ship is v0.3.0 with versionCode 3.
    version: '0.3.0',
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
      buildNumber: '0.3.0',
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
      // (v0.1 and v0.2) used auto-derived values; v0.3 is the third
      // release so this is 3.
      versionCode: 3,
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
    ],
    extra: {
      eas: {
        projectId: '432ed620-8985-48e6-9bb7-ca52c267378e',
      },
    },
    owner: 'sharmila_blessy',
  },
};
