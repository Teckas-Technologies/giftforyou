import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Polyline } from 'react-native-svg';
import { getPlanStatus } from '../services/api';
import { getOfferings, purchasePackage, restorePurchases } from '../services/billing';
import { CustomAlert } from '../components';
import useAlert from '../hooks/useAlert';

const BackIcon = ({ size = 24, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

const PLAN_COPY = {
  free: { title: "You're on the Free Plan", subtitle: 'Subscribe to unlock everything Thoughtfully has to offer.' },
  individual: { title: "You're on the Individual Plan", subtitle: 'Thanks for supporting Thoughtfully! 💕' },
  organization: { title: "You're on the Organization Plan", subtitle: 'Access provided by your company.' },
};

const SubscriptionScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState('free');
  const [planExpiresAt, setPlanExpiresAt] = useState(null);
  const [offerings, setOfferings] = useState([]);
  const [offeringsError, setOfferingsError] = useState(false);
  const [purchasingId, setPurchasingId] = useState(null);
  const [restoring, setRestoring] = useState(false);

  const { alertConfig, showSuccess, showError, hideAlert } = useAlert();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const status = await getPlanStatus();
      setPlan(status.plan || 'free');
      setPlanExpiresAt(status.planExpiresAt || null);

      if ((status.plan || 'free') === 'free') {
        try {
          const packages = await getOfferings();
          setOfferings(packages);
          setOfferingsError(packages.length === 0);
        } catch {
          setOfferingsError(true);
        }
      }
    } catch (error) {
      showError(error.message || 'Failed to load your plan');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handlePurchase = async (pkg) => {
    setPurchasingId(pkg.identifier);
    try {
      const customerInfo = await purchasePackage(pkg);
      // DEBUG: confirms whether RevenueCat itself sees the entitlement as
      // active right after purchase — if this is empty, the problem is on
      // RevenueCat's side (entitlement/product setup). If it shows
      // "individual" active, RevenueCat is fine and the gap is purely the
      // webhook never reaching/updating our own backend.
      console.log('[DEBUG] customerInfo.entitlements.active:', JSON.stringify(customerInfo?.entitlements?.active));

      const statusAfterPurchase = await getPlanStatus();
      console.log('[DEBUG] backend plan status right after purchase:', JSON.stringify(statusAfterPurchase));

      showSuccess('Welcome to the Individual Plan! 💕', () => loadData());
    } catch (error) {
      console.log('[DEBUG] purchase error:', error?.message, error);
      if (!error.userCancelled) {
        showError(error.message || 'Purchase failed');
      }
    } finally {
      setPurchasingId(null);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await restorePurchases();
      showSuccess('Purchases restored!', () => loadData());
    } catch (error) {
      showError(error.message || 'Failed to restore purchases');
    } finally {
      setRestoring(false);
    }
  };

  const copy = PLAN_COPY[plan] || PLAN_COPY.free;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#ccf9ff', '#e0f7fa', '#FFFFFF']}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <BackIcon size={24} color="#6b3a8a" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <MaskedView maskElement={<Text style={styles.headerTitleMask}>Manage Subscription</Text>}>
            <LinearGradient colors={['#ca9ad6', '#70d0dd']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={[styles.headerTitleMask, { opacity: 0 }]}>Manage Subscription</Text>
            </LinearGradient>
          </MaskedView>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ca9ad6" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <LinearGradient
            colors={['#fbe5f5', '#f4cae8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statusCard}
          >
            <Text style={styles.statusTitle}>{copy.title}</Text>
            <Text style={styles.statusSubtitle}>{copy.subtitle}</Text>
            {planExpiresAt && (
              <Text style={styles.statusExpiry}>
                Renews {new Date(planExpiresAt).toLocaleDateString()}
              </Text>
            )}
          </LinearGradient>

          {plan === 'free' && (
            <>
              <Text style={styles.sectionLabel}>Choose a plan</Text>
              {offeringsError ? (
                <Text style={styles.emptyText}>
                  Subscriptions aren't available yet — check back soon.
                </Text>
              ) : (
                offerings.map((pkg) => (
                  <TouchableOpacity
                    key={pkg.identifier}
                    style={styles.planCard}
                    onPress={() => handlePurchase(pkg)}
                    disabled={!!purchasingId}
                    activeOpacity={0.85}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.planCardTitle}>{pkg.product.title}</Text>
                      <Text style={styles.planCardPrice}>{pkg.product.priceString}</Text>
                    </View>
                    {purchasingId === pkg.identifier ? (
                      <ActivityIndicator size="small" color="#ca9ad6" />
                    ) : (
                      <View style={styles.planCardChevron} />
                    )}
                  </TouchableOpacity>
                ))
              )}

              <TouchableOpacity onPress={handleRestore} disabled={restoring} style={styles.restoreButton}>
                <Text style={styles.restoreButtonText}>
                  {restoring ? 'Restoring...' : 'Restore Purchases'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('RedeemCoupon')} style={styles.restoreButton}>
                <Text style={styles.restoreButtonText}>
                  Have a company code? Redeem it here
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}

      <CustomAlert {...alertConfig} onClose={hideAlert} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleMask: {
    fontSize: 18,
    fontFamily: 'Handlee_400Regular',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  statusCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  statusTitle: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 19,
    color: '#330c54',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 14,
    color: '#6b3a8a',
    lineHeight: 20,
  },
  statusExpiry: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 12,
    color: '#6b3a8a',
    opacity: 0.7,
    marginTop: 10,
  },
  sectionLabel: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 17,
    color: '#6b3a8a',
    marginBottom: 10,
  },
  emptyText: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 14,
    color: '#999',
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#f4cae8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  planCardTitle: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 16,
    color: '#330c54',
  },
  planCardPrice: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 14,
    color: '#ca9ad6',
    marginTop: 2,
  },
  planCardChevron: {
    width: 10,
    height: 10,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#ca9ad6',
    transform: [{ rotate: '45deg' }],
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  restoreButtonText: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 14,
    color: '#6b3a8a',
  },
});

export default SubscriptionScreen;
