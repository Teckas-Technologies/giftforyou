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
          iosUrlScheme:
            process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME ||
            'com.googleusercontent.apps.202233735305-kvcdb0g5nfq10h4jb4q3u4l0tavu206i',
        },
      ],
    ],
    extra: {
      eas: {
        projectId: '432ed620-8985-48e6-9bb7-ca52c267378e',
      },
    },
    owner: 'sharmila_blessy',
  },
};
