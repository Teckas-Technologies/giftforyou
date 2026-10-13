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
    const activity = app?.activity?.find((a) => a.$['android:name'] === '.MainActivity');
    if (activity) activity.$['android:windowSoftInputMode'] = 'adjustResize';
    return cfg;
  });

module.exports = {
  expo: {
    name: 'Thoughtfully',
    slug: 'thoughtfully',
    // Registers the thoughtfully:// custom URL scheme natively (iOS
    // CFBundleURLTypes / Android intent-filter) — required for
    // AuthContext's resetPassword redirectTo link to actually route back
    // into the app. Was missing entirely before, so that redirect never
    // worked. Takes effect on the next native build (not an OTA update).
    scheme: 'thoughtfully',
    // User-visible version (semver MAJOR.MINOR.PATCH). Bump for every
    // release: a patch fix → 1.0.1, a feature release → 1.1.0, etc.
    // Keep aligned with package.json, android.versionCode (integer), and
    // ios.buildNumber. Reset to 1.0.0 for the client's own App Store
    // Connect/Play Console apps (new bundle ID com.thoughtfullyapp.mobile)
    // — this is genuinely their first public submission, with zero
    // relation to the old app's 0.3.x history under the agency's account.
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    // Tried disabling this to work around RNGoogleSignin's TurboModule
    // registration failure (see expo-build-properties comment below), but
    // that pulls in an older C++ dependency chain (fmt/glog/boost, compiled
    // from source) that fails to build on this Xcode/Clang version
    // ("consteval function is not a constant expression" in fmt). Reverted
    // — New Architecture must stay on; fixing RNGoogleSignin needs a
    // different approach (e.g. upgrading the package).
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#FDEEF3',
    },
    ios: {
      // false: app is iPhone-only — this also means Apple won't require
      // iPad screenshots for the App Store listing.
      supportsTablet: false,
      // Changed from com.thoughtfully.app — that Bundle ID is permanently
      // locked to the agency's Apple Developer account once a TestFlight
      // build was uploaded under it (Apple does not release a Bundle ID
      // even after the app is deleted). This new app is being set up
      // directly under the client's own Apple Developer account instead.
      bundleIdentifier: 'com.thoughtfullyapp.mobile',
      // No buildNumber here on purpose — EAS now manages it remotely
      // (confirmed by its own build log: "buildNumber field in app config
      // is ignored when version source is set to remote"), since
      // autoIncrement + remote version source are enabled in eas.json.
      // Check the actual current value with `eas build:version:get`.
      // Was missing entirely — Android has the equivalent `googleServicesFile`
      // field below, but iOS needs its own. Without this, Expo's prebuild
      // never copies the file into the native project, so GoogleSignin.
      // configure() fails at runtime with "GoogleService-Info.plist was not
      // found" even though the file exists in the project root.
      googleServicesFile: './GoogleService-Info.plist',
      infoPlist: {
        // Answers Apple's export-compliance question at submission time —
        // the app only uses standard/exempt encryption (HTTPS), so this is
        // 'false'. Without it set here, EAS can't auto-save the answer into
        // a dynamic (.js) config file and asks again on every build.
        ITSAppUsesNonExemptEncryption: false,
        NSPhotoLibraryUsageDescription:
          'Thoughtfully needs access to your photos so you can set a profile picture.',
        NSCameraUsageDescription:
          'Thoughtfully needs access to your camera so you can take a profile picture.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        // Matches assets/icon.png's own background (#330c54, sampled
        // directly from the file) — was #FDEEF3 (the splash's light pink),
        // which made the Android app icon look like a completely different
        // color scheme from iOS's dark-purple icon (PL-06).
        backgroundColor: '#330c54',
      },
      edgeToEdgeEnabled: true,
      // Kept identical to ios.bundleIdentifier above, same convention as
      // before — see that comment for why this changed from
      // com.thoughtfully.app.
      package: 'com.thoughtfullyapp.mobile',
      // Integer Android uses to decide whether an APK is an upgrade.
      // MUST increase by at least 1 every release, otherwise installs
      // fail with INSTALL_FAILED_VERSION_DOWNGRADE. Reset to 1 for this
      // fresh Play Console app (see version comment above).
      versionCode: 1,
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
            'Thoughtfully needs access to your photos so you can set a profile picture.',
          cameraPermission:
            'Thoughtfully needs access to your camera so you can take a profile picture.',
        },
      ],
      '@react-native-community/datetimepicker',
      [
        // Allow plaintext HTTP requests in the release APK (Android 9+
        // blocks them by default). Required while the backend is on
        // http://… — drop this entry once it moves to HTTPS.
        //
        // NOTE ON HISTORY (iOS): this plugin previously also set
        // `ios.useFrameworks: 'static'` to work around a CocoaPods error
        // ("AppCheckCore... cannot yet be integrated as static libraries")
        // caused by Google Sign-In's AppCheckCore/GoogleUtilities/
        // RecaptchaInterop dependencies lacking modular headers. That
        // workaround affected the whole project's linking and had real
        // side effects: it broke RNGoogleSignin's TurboModule registration
        // under the New Architecture ("TurboModuleRegistry.getEnforcing
        // (...): 'RNGoogleSignin' could not be found" — confirmed live via
        // a local dev build; this is what caused the app to hang on the
        // splash screen, since GoogleSignin.configure() runs at
        // AuthContext's module top level and crashed before React ever
        // rendered). Switching to 'dynamic' fixed that but broke
        // RevenueCat's linker step instead. Disabling the New Architecture
        // avoided the TurboModule path but pulled in an older C++
        // dependency chain (fmt/glog/boost) that fails to compile here.
        // The real fix: @react-native-google-signin/google-signin 16.1.4+
        // declares AppCheckCore's modular-header dependencies directly in
        // its own podspec, so Expo's autolinking handles it per-pod
        // without a project-wide `useFrameworks` override at all. Removed.
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
        projectId: '0fca89a9-018f-4ab4-b372-9334d979b521',
      },
    },
    owner: 'teckas-technologies',
  },
};
