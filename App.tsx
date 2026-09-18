import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/lib/queryClient';
import {
  registerForPushNotifications,
  addNotificationReceivedListener,
  addNotificationResponseListener,
} from './src/services/notifications';
import { getRouteForNotification } from './src/services/notificationRouter';
import { navigationRef, AppNavigator } from './src/navigation';
import { supabase } from './src/config/supabase';
import { useFonts } from 'expo-font';
import { StyleScript_400Regular } from '@expo-google-fonts/style-script';
import { Handlee_400Regular } from '@expo-google-fonts/handlee';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/contexts/AuthContext';

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

export default function App() {
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  // Initialize notifications and register push token
  useEffect(() => {
    // Register push notifications if user is authenticated
    const initPushNotifications = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
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
    notificationListener.current = addNotificationReceivedListener((notification: any) => {
      console.log('Notification received:', notification);
    });

    // Navigate based on a push payload, waiting until the nav tree is mounted
    // (matters for cold-start taps fired before NavigationContainer is ready).
    const handlePushTap = (data: any) => {
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
            (navigationRef.navigate as any)(route.screen, route.params);
            console.log('[push] navigated to', route.screen);
          } catch (e: any) {
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
    responseListener.current = addNotificationResponseListener((response: any) => {
      handlePushTap(response.notification.request.content.data);
    });

    // Cold start: app was killed and launched by tapping the notification.
    // The response listener does NOT fire in this case — Expo stores the tap
    // and we have to read it explicitly.
    Notifications.getLastNotificationResponseAsync().then((response) => {
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

  const [fontsLoaded, fontError] = useFonts({
    // Logo font
    StyleScript_400Regular,
    // App content font
    Handlee_400Regular,
  });

  // If something is stuck (fonts never resolve, or any other silent hang)
  // before this component gets to render its first frame, the native splash
  // just stays up forever with nothing to look at. This surfaces whatever
  // the actual blocking state is as plain on-screen text after a few
  // seconds, so a stuck device can just be screenshotted instead of needing
  // native device logs.
  const [showDebug, setShowDebug] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => {
      setShowDebug(true);
      // Hide the native splash so the debug text below is actually visible
      // instead of staying covered by it.
      SplashScreen.hideAsync().catch(() => {});
    }, 5000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (fontError) {
      console.error('Font loading error:', fontError);
    }
  }, [fontError]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    if (showDebug) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ textAlign: 'center' }}>
            Still loading fonts…{'\n'}fontsLoaded: {String(fontsLoaded)}
            {'\n'}fontError: {fontError ? String(fontError) : 'none'}
          </Text>
        </View>
      );
    }
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthProvider>
          <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <StatusBar style="dark" />
            <AppNavigator />
          </View>
        </AuthProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
