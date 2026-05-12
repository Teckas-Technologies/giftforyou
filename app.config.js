module.exports = {
  expo: {
    name: 'GiftBox4you',
    slug: 'GiftBox4you',
    version: '1.0.0',
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
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FDEEF3',
      },
      edgeToEdgeEnabled: true,
      package: 'com.giftbox4you.app',
      usesCleartextTraffic: true,
      googleServicesFile: './google-services.json',
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
          iosUrlScheme: process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME,
        },
      ],
    ],
    extra: {
      eas: {
        projectId: '4b765adc-af4c-4925-bad7-debcb3ecfb98',
      },
    },
    owner: 'sathishteckas',
  },
};
