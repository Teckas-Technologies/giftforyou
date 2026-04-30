import React, { useCallback } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import { StyleScript_400Regular } from '@expo-google-fonts/style-script';
import { Handlee_400Regular } from '@expo-google-fonts/handlee';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/contexts/AuthContext';
import { AppNavigator } from './src/navigation';

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    // Logo font
    StyleScript_400Regular,
    // App content font
    Handlee_400Regular,
    // Keeping Outfit as fallback during migration
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <StatusBar style="dark" />
          <AppNavigator />
        </View>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
