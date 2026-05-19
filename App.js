import React, { useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import {
  registerForPushNotifications,
  addNotificationReceivedListener,
  addNotificationResponseListener,
} from './src/services/notifications';
import { getRouteForNotification } from './src/services/notificationRouter';
import { navigationRef } from './src/navigation';
import { supabase } from './src/config/supabase';
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
  const notificationListener = useRef();
  const responseListener = useRef();

  // Initialize notifications and register push token
  useEffect(() => {
    // Register push notifications if user is authenticated
    const initPushNotifications = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('App start: User authenticated, registering push token...');
          const token = await registerForPushNotifications();
          console.log('App start: Push token result:', token ? 'Success' : 'Failed');
        }
      } catch (error) {
        console.log('App start: Push notification error:', error);
      }
    };

    initPushNotifications();

    // Listen for notifications received while app is foregrounded
    notificationListener.current = addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Navigate based on a push payload, waiting until the nav tree is mounted
    // (matters for cold-start taps fired before NavigationContainer is ready).
    const handlePushTap = (data) => {
      console.log('[push] tapped, raw data:', JSON.stringify(data));
      if (!data) return;
      const route = getRouteForNotification({
        type: data.type,
        data,
        related_id: data.circleId || data.eventId || data.relatedId,
      });
      console.log('[push] resolved route:', JSON.stringify(route));
      if (!route) return;

      let attempts = 0;
      const tryNavigate = () => {
        const ready = navigationRef.isReady();
        if (ready) {
          try {
            navigationRef.navigate(route.screen, route.params);
            console.log('[push] navigated to', route.screen);
          } catch (e) {
            console.log('[push] navigate error:', e?.message || String(e));
          }
        } else if (attempts++ < 50) {
          setTimeout(tryNavigate, 100);
        } else {
          console.log('[push] navigationRef never became ready — giving up');
        }
      };
      tryNavigate();
    };

    // Warm tap: app is running (foreground or background) when user taps banner.
    responseListener.current = addNotificationResponseListener(response => {
      handlePushTap(response.notification.request.content.data);
    });

    // Cold start: app was killed and launched by tapping the notification.
    // The response listener does NOT fire in this case — Expo stores the tap
    // and we have to read it explicitly.
    Notifications.getLastNotificationResponseAsync().then(response => {
      if (response) {
        handlePushTap(response.notification.request.content.data);
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

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
