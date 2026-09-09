import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
import Svg, { Polyline, Rect, Line, Path } from 'react-native-svg';
import { getPlanStatus } from '../../services/api';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  openManageSubscriptions,
} from '../../services/billing';
import { CustomAlert } from '../../components';
import useAlert from '../../hooks/useAlert';
import { colors } from '../../theme';
import type { ScreenProps, IconProps } from '../../types/navigation';

const BackIcon = ({ size = 24, color = colors.textLight }: IconProps) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

const GiftIcon = ({ size = 26, color = '#FFFFFF' }: IconProps) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Rect x="3" y="8" width="18" height="4" />
    <Rect x="5" y="12" width="14" height="9" />
    <Line x1="12" y1="8" x2="12" y2="21" />
    <Path d="M12 8c-1.5-4-6-5-6-2 0 2 3 2 6 2zM12 8c1.5-4 6-5 6-2 0 2-3 2-6 2z" />
  </Svg>
);

const StarIcon = ({ size = 26, color = '#FFFFFF' }: IconProps) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    stroke={color}
    strokeWidth={1}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6z" />
  </Svg>
);

const BuildingIcon = ({ size = 26, color = '#FFFFFF' }: IconProps) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Rect x="4" y="2" width="16" height="20" rx="1" />
    <Path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01" />
  </Svg>
);

const CheckIcon = ({ size = 16, color = colors.secondary }: IconProps) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Polyline points="20 6 9 17 4 12" />
  </Svg>
);

const PLAN_COPY: Record<
  string,
  { title: string; subtitle: string; Icon: React.ComponentType<IconProps> }
> = {
  free: {
    title: "You're on the Free Plan",
    subtitle: 'Subscribe to unlock everything Thoughtfully has to offer.',
    Icon: GiftIcon,
  },
  individual: {
    title: "You're on the Individual Plan",
    subtitle: 'Thanks for supporting Thoughtfully! 💕',
    Icon: StarIcon,
  },
  organization: {
    title: "You're on the Organization Plan",
    subtitle: 'Access provided by your company.',
    Icon: BuildingIcon,
  },
};

const FEATURES = [
  'Unlimited contacts in your gift circle',
  'Birthday & event reminders',
  'Send unlimited Love Notes',
];

const SubscriptionScreen = ({ navigation }: ScreenProps) => {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState('free');
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const [offerings, setOfferings] = useState<any[]>([]);
  const [offeringsError, setOfferingsError] = useState(false);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { alertConfig, showSuccess, showError, showConfirm, hideAlert } = useAlert();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const status = await getPlanStatus();
      setPlan(status.plan || 'free');
      setPlanExpiresAt(status.planExpiresAt || null);
      setOrganizationName(status.organizationName || null);

      // Also offer Individual to Organization-plan users — if their company
      // access ever lapses, they'd otherwise have no way to keep paying on
      // their own. Not shown to Individual users, since they're already on it.
      if (['free', 'organization'].includes(status.plan || 'free')) {
        try {
          const packages = await getOfferings();
          setOfferings(packages);
          setOfferingsError(packages.length === 0);
        } catch {
          setOfferingsError(true);
        }
      }
    } catch (error: any) {
      showError(error.message || 'Failed to load your plan');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  // Monthly first, Yearly second — matches how most subscription pages lay
  // out the choice, cheapest-commitment to biggest-commitment.
  const sortedOfferings = useMemo(() => {
    const rank = (pkg: any) => (pkg.packageType === 'ANNUAL' ? 1 : 0);
    return [...offerings].sort((a, b) => rank(a) - rank(b));
  }, [offerings]);

  const monthly = sortedOfferings.find((p) => p.packageType === 'MONTHLY');
  const yearly = sortedOfferings.find((p) => p.packageType === 'ANNUAL');
  // % saved per year choosing Yearly over paying Monthly x12, only
  // computable when both a monthly and yearly price actually exist.
  const yearlySavingsPercent =
    monthly && yearly
      ? Math.round((1 - yearly.product.price / (monthly.product.price * 12)) * 100)
      : null;

  // Default to whichever the offering itself marks as current/first, but
  // prefer Yearly when both exist — it's the better deal, worth defaulting
  // to like most subscription pages do.
  useEffect(() => {
    if (!selectedId && sortedOfferings.length) {
      setSelectedId((yearly || sortedOfferings[0]).identifier);
    }
  }, [sortedOfferings, yearly, selectedId]);

  const selectedPackage =
    sortedOfferings.find((p) => p.identifier === selectedId) || sortedOfferings[0];

  // Organization users already have free access — warn before they pay for
  // something they may not realize they already get, instead of purchasing
  // silently the moment they tap a plan.
  const confirmAndPurchase = (pkg: any) => {
    if (plan === 'organization') {
      showConfirm(
        'You already have free access',
        `You already have free access via ${organizationName || 'your company'}. Subscribe anyway?`,
        () => handlePurchase(pkg),
        undefined,
        'Subscribe anyway',
        'Cancel',
      );
    } else {
      handlePurchase(pkg);
    }
  };

  const handlePurchase = async (pkg: any) => {
    setPurchasingId(pkg.identifier);
    try {
      const customerInfo = await purchasePackage(pkg);
      // DEBUG: confirms whether RevenueCat itself sees the entitlement as
      // active right after purchase — if this is empty, the problem is on
      // RevenueCat's side (entitlement/product setup). If it shows
      // "individual" active, RevenueCat is fine and the gap is purely the
      // webhook never reaching/updating our own backend.
      console.log(
        '[DEBUG] customerInfo.entitlements.active:',
        JSON.stringify(customerInfo?.entitlements?.active),
      );

      const statusAfterPurchase = await getPlanStatus();
      console.log(
        '[DEBUG] backend plan status right after purchase:',
        JSON.stringify(statusAfterPurchase),
      );

      showSuccess('Welcome to the Individual Plan! 💕', () => loadData());
    } catch (error: any) {
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
    } catch (error: any) {
      showError(error.message || 'Failed to restore purchases');
    } finally {
      setRestoring(false);
    }
  };

  // Opens Apple/Google's own subscription screen — where the real Cancel
  // button lives. Neither store gives apps an API to cancel directly.
  const handleManageSubscription = async () => {
    try {
      await openManageSubscriptions();
    } catch (error: any) {
      showError(error.message || 'Could not open subscription settings');
    }
  };

  const copy = PLAN_COPY[plan] || PLAN_COPY.free;
  const statusSubtitle =
    plan === 'organization' && organizationName
      ? `Access provided by ${organizationName}.`
      : copy.subtitle;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background, colors.primaryLight, colors.primaryBg, colors.background]}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <BackIcon size={24} color={colors.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Subscription</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.statusCard}>
            <LinearGradient
              colors={[colors.secondary, colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.planIconBadge}
            >
              <copy.Icon size={26} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.statusTitle}>{copy.title}</Text>
            <Text style={styles.statusSubtitle}>{statusSubtitle}</Text>
            {planExpiresAt && (
              <View style={styles.statusExpiryPill}>
                <Text style={styles.statusExpiry}>
                  Renews {new Date(planExpiresAt).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>

          {plan === 'individual' && (
            <TouchableOpacity onPress={handleManageSubscription} style={styles.footerLink}>
              <Text style={styles.footerLinkText}>Manage or cancel subscription</Text>
            </TouchableOpacity>
          )}

          {(plan === 'free' || plan === 'organization') && (
            <>
              <Text style={styles.sectionLabel}>
                {plan === 'organization' ? 'Also want to pay directly?' : 'Choose a plan'}
              </Text>
              {offeringsError ? (
                <Text style={styles.emptyText}>
                  Subscriptions aren't available yet — check back soon.
                </Text>
              ) : (
                <>
                  <View style={styles.planOptionsRow}>
                    {sortedOfferings.map((pkg) => {
                      const isSelected = selectedId === pkg.identifier;
                      const isYearly = pkg.packageType === 'ANNUAL';
                      const periodLabel = isYearly
                        ? 'Yearly'
                        : pkg.packageType === 'MONTHLY'
                          ? 'Monthly'
                          : pkg.product.title;
                      const periodSuffix = isYearly
                        ? '/ year'
                        : pkg.packageType === 'MONTHLY'
                          ? '/ month'
                          : '';
                      return (
                        <TouchableOpacity
                          key={pkg.identifier}
                          style={[styles.planOption, isSelected && styles.planOptionSelected]}
                          onPress={() => setSelectedId(pkg.identifier)}
                          activeOpacity={0.85}
                        >
                          {isYearly && !!yearlySavingsPercent && yearlySavingsPercent > 0 && (
                            <View style={styles.savingsBadge}>
                              <Text style={styles.savingsBadgeText}>
                                SAVE {yearlySavingsPercent}%
                              </Text>
                            </View>
                          )}
                          <Text
                            style={[
                              styles.planOptionLabel,
                              isSelected && styles.planOptionLabelSelected,
                            ]}
                          >
                            {periodLabel}
                          </Text>
                          <Text
                            style={[
                              styles.planOptionPrice,
                              isSelected && styles.planOptionPriceSelected,
                            ]}
                          >
                            {pkg.product.priceString}
                          </Text>
                          {!!periodSuffix && (
                            <Text
                              style={[
                                styles.planOptionSuffix,
                                isSelected && styles.planOptionSuffixSelected,
                              ]}
                            >
                              {periodSuffix}
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <TouchableOpacity
                    onPress={() => selectedPackage && confirmAndPurchase(selectedPackage)}
                    disabled={!!purchasingId || !selectedPackage}
                    activeOpacity={0.85}
                    style={styles.subscribeWrap}
                  >
                    <LinearGradient
                      colors={[colors.secondary, colors.primary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.subscribeButton}
                    >
                      {purchasingId ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.subscribeButtonText}>
                          Subscribe
                          {selectedPackage ? ` — ${selectedPackage.product.priceString}` : ''}
                        </Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}

          <Text style={styles.sectionLabel}>What's included</Text>
          <View style={styles.featureList}>
            {FEATURES.map((feature) => (
              <View key={feature} style={styles.featureRow}>
                <View style={styles.featureCheck}>
                  <CheckIcon size={13} color={colors.secondary} />
                </View>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {plan === 'free' && (
            <>
              <TouchableOpacity
                onPress={handleRestore}
                disabled={restoring}
                style={styles.footerLink}
              >
                <Text style={styles.footerLinkText}>
                  {restoring ? 'Checking your account...' : 'Already subscribed? Restore it here'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('RedeemCoupon')}
                style={styles.footerLink}
              >
                <Text style={styles.footerLinkText}>Have a company code? Redeem it here</Text>
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
    backgroundColor: colors.background,
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
  headerTitle: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 18,
    color: colors.textDark,
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
    alignItems: 'center',
    backgroundColor: colors.secondaryLight,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  planIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  statusTitle: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 20,
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 6,
  },
  statusSubtitle: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
    textAlign: 'center',
  },
  statusExpiryPill: {
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  statusExpiry: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 12,
    color: colors.textLight,
  },
  sectionLabel: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 17,
    color: colors.textLight,
    marginBottom: 12,
  },
  emptyText: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  planOptionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  planOption: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.inputBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  planOptionSelected: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondaryLight,
  },
  savingsBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  savingsBadgeText: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 11,
    color: '#FFFFFF',
  },
  planOptionLabel: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 15,
    color: colors.textLight,
    marginTop: 6,
  },
  planOptionLabelSelected: {
    color: colors.textDark,
  },
  planOptionPrice: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 22,
    color: colors.textDark,
    marginTop: 6,
  },
  planOptionPriceSelected: {
    color: colors.textDark,
  },
  planOptionSuffix: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  planOptionSuffixSelected: {
    color: colors.textLight,
  },
  subscribeWrap: {
    marginBottom: 24,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  subscribeButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeButtonText: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 18,
    color: '#FFFFFF',
  },
  featureList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.inputBorder,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  featureCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 15,
    color: colors.textDark,
    flexShrink: 1,
  },
  footerLink: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  footerLinkText: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 14,
    color: colors.textLight,
  },
});

export default SubscriptionScreen;
