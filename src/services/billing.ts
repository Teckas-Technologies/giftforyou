// RevenueCat SDK wrapper for the Individual Plan (Apple/Google in-app
// subscription). Backend calls (plan status, coupon redemption) live in
// api.js alongside every other endpoint — this file only talks to the
// native purchases SDK.
import { Platform, Linking } from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';

const REVENUECAT_API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
});

let configured = false;

/**
 * Configure RevenueCat and log in with the Supabase auth user id as
 * RevenueCat's appUserID, so the backend webhook can match events straight
 * back to `users.external_id` with no separate customer-id lookup.
 */
export const initPurchases = async (userId: string) => {
  if (!REVENUECAT_API_KEY) {
    console.log('RevenueCat API key not configured, skipping init');
    return;
  }

  try {
    if (!configured) {
      Purchases.configure({ apiKey: REVENUECAT_API_KEY, appUserID: userId });
      configured = true;
    } else {
      await Purchases.logIn(userId);
    }
  } catch (error) {
    console.log('RevenueCat init error:', error.message);
  }
};

/**
 * Fetch the current offering's available packages (e.g. monthly, annual).
 */
export const getOfferings = async () => {
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages || [];
};

/**
 * Purchase a package. The backend finds out via the RevenueCat webhook —
 * this just returns whether the purchase itself succeeded so the UI can
 * show a spinner/error, not the final entitlement state.
 */
export const purchasePackage = async (pkg: PurchasesPackage) => {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
};

export const restorePurchases = async () => {
  const customerInfo = await Purchases.restorePurchases();
  return customerInfo;
};

/**
 * Opens the platform's own subscription management screen (where the real
 * Cancel button lives — neither store gives apps an API to cancel directly).
 * iOS: Purchases.showManageSubscriptions() only works on iOS 13+; Android
 * has no equivalent SDK method, so we deep-link to the Play Store's
 * subscriptions page for this app instead.
 */
export const openManageSubscriptions = async () => {
  if (Platform.OS === 'ios') {
    await Purchases.showManageSubscriptions();
  } else {
    await Linking.openURL(
      'https://play.google.com/store/account/subscriptions?package=com.thoughtfully.app',
    );
  }
};
