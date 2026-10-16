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
import Svg, { Polyline, Rect, Line, Path, Circle } from 'react-native-svg';
import { getPlanStatus } from '../../services/api';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  openManageSubscriptions,
  getCustomerInfo,
  getProductPrice,
} from '../../services/billing';
import { CustomAlert, SkeletonRow } from '../../components';
import useAlert from '../../hooks/useAlert';
import { colors, fontSize as typeScale } from '../../theme';
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

const GearIcon = ({ size = 16, color = colors.textDark }: IconProps) => (
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
    <Circle cx="12" cy="12" r="3" />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
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
    subtitle: 'Enjoy unlimited access to Thoughtfully 💕',
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
  const [willRenew, setWillRenew] = useState(true);
  const [hasBillingIssue, setHasBillingIssue] = useState(false);
  const [activePeriodLabel, setActivePeriodLabel] = useState<string | null>(null);
  const [activePriceString, setActivePriceString] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const [isFoundingMember, setIsFoundingMember] = useState(false);
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
      setWillRenew(status.willRenew !== false);
      setHasBillingIssue(!!status.hasBillingIssue);
      setOrganizationName(status.organizationName || null);
      // Eligibility for the $24/year founding price — based on signup order
      // (first 5,000 accounts), not a separate purchase race.
      setIsFoundingMember(!!status.isFoundingMember);

      // Backend's `plan` only stores the tier ('individual'), not which
      // product backs it — read that straight from RevenueCat so the UI can
      // show "Monthly Plan" vs "Yearly Plan". Check founding_yearly before
      // the plain "yearly" check below, since that product id also contains
      // the substring "yearly".
      if (status.plan === 'individual') {
        try {
          const customerInfo = await getCustomerInfo();
          const productId = customerInfo?.entitlements?.active?.individual?.productIdentifier || '';
          setActivePeriodLabel(
            productId.includes('founding_yearly')
              ? 'Founding Yearly'
              : productId.includes('yearly')
                ? 'Yearly Plan'
                : productId.includes('monthly')
                  ? 'Monthly Plan'
                  : null,
          );
          setActivePriceString(productId ? await getProductPrice(productId) : null);
        } catch {
          setActivePeriodLabel(null);
          setActivePriceString(null);
        }
      } else {
        setActivePeriodLabel(null);
        setActivePriceString(null);
      }

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

  // RevenueCat gives the founding package a "CUSTOM" packageType (since it
  // uses a custom identifier, not the reserved "Annual" one — that's taken
  // by the regular Yearly package) — so it's matched by identifier instead.
  const isFoundingPackage = (pkg: any) => pkg.identifier === 'founding_yearly';

  // Monthly, then Yearly, then the $24/year founding option last (it's the
  // standout/exclusive choice) — and the founding package is stripped out
  // entirely for anyone who isn't eligible (signup-order based, see
  // `isFoundingMember` above), so non-Founding-Members never see it at all.
  const sortedOfferings = useMemo(() => {
    const rank = (pkg: any) => (isFoundingPackage(pkg) ? 2 : pkg.packageType === 'ANNUAL' ? 1 : 0);
    return [...offerings]
      .filter((pkg) => !isFoundingPackage(pkg) || isFoundingMember)
      .sort((a, b) => rank(a) - rank(b));
  }, [offerings, isFoundingMember]);

  const monthly = sortedOfferings.find((p) => p.packageType === 'MONTHLY');
  const yearly = sortedOfferings.find((p) => p.packageType === 'ANNUAL');
  const founding = sortedOfferings.find((p) => isFoundingPackage(p));
  // % saved per year choosing Yearly over paying Monthly x12, only
  // computable when both a monthly and yearly price actually exist.
  const yearlySavingsPercent =
    monthly && yearly
      ? Math.round((1 - yearly.product.price / (monthly.product.price * 12)) * 100)
      : null;

  // Default to whichever the offering itself marks as current/first, but
  // prefer the $24/year founding deal when it's available (best value, and
  // exclusive to Founding Members) — otherwise Yearly, same as before.
  useEffect(() => {
    if (!selectedId && sortedOfferings.length) {
      setSelectedId((founding || yearly || sortedOfferings[0]).identifier);
    }
  }, [sortedOfferings, yearly, founding, selectedId]);

  const selectedPackage =
    sortedOfferings.find((p) => p.identifier === selectedId) || sortedOfferings[0];

  // TEMPORARY — for capturing the App Store Connect subscription review
  // screenshot only. Real product data can't be fetched until Apple
  // approves the first subscription submission (the exact thing this
  // screenshot is for), so there's no way to screenshot real prices yet.
  // REMOVE this and the `displayOfferings` fallback below once a real
  // screenshot has been captured and this subscription is approved.
  const MOCK_OFFERINGS_FOR_SCREENSHOT = [
    {
      identifier: 'mock_monthly',
      packageType: 'MONTHLY',
      product: { priceString: '$2.99', price: 2.99, title: 'Monthly' },
    },
    {
      identifier: 'mock_yearly',
      packageType: 'ANNUAL',
      product: { priceString: '$29.99', price: 29.99, title: 'Yearly' },
    },
  ];

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

  // The ribbon/stat row already read this from RevenueCat's product id
  // (see loadData) — reuse it here instead of re-deriving it.
  const isFoundingActive = activePeriodLabel === 'Founding Yearly';

  const copy = PLAN_COPY[plan] || PLAN_COPY.free;
  const statusSubtitle =
    plan === 'organization' && organizationName
      ? `Access provided by ${organizationName}.`
      : isFoundingActive
        ? 'Welcome to our founding community 💕'
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
          {[0, 1, 2].map((i) => (
            <SkeletonRow key={`skeleton-${i}`} avatarSize={44} style={{ width: '100%' }} />
          ))}
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.statusCard}>
            {activePeriodLabel && (
              <View style={styles.ribbonWrap}>
                <LinearGradient
                  colors={['#E8B84B', '#F3D27A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ribbon}
                >
                  {/* "Founding Member" kept overflowing as one line (tried
                      auto-shrink, then a smaller fixed size — neither fit
                      reliably). Forcing an explicit line break instead of
                      hoping word-wrap kicks in at the right width: "FOUNDING"
                      / "MEMBER" each fit the ribbon easily on their own. */}
                  <Text
                    style={[
                      styles.ribbonText,
                      { width: '100%', textAlign: 'center' },
                      isFoundingActive && styles.ribbonTextLong,
                    ]}
                    numberOfLines={isFoundingActive ? 2 : 1}
                  >
                    {isFoundingActive
                      ? 'FOUNDING\nMEMBER'
                      : activePeriodLabel.replace(' Plan', '').toUpperCase()}
                  </Text>
                </LinearGradient>
              </View>
            )}
            <View style={styles.orbRing}>
              <LinearGradient
                colors={[colors.secondary, colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.orb}
              >
                <copy.Icon size={28} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.statusTitle}>{copy.title}</Text>
            <Text style={styles.statusSubtitle}>{statusSubtitle}</Text>

            {plan === 'individual' && planExpiresAt ? (
              <View style={styles.statRow}>
                <View style={styles.stat}>
                  <Text style={styles.statCap}>Plan</Text>
                  <Text style={styles.statVal}>{activePeriodLabel?.replace(' Plan', '')}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statCap}>Price</Text>
                  <Text style={styles.statVal}>{activePriceString || '—'}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statCap}>{willRenew ? 'Renews' : 'Access ends'}</Text>
                  <Text style={styles.statVal}>
                    {new Date(planExpiresAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            ) : (
              planExpiresAt && (
                <View style={styles.statusExpiryPill}>
                  <Text style={styles.statusExpiry}>
                    {willRenew ? 'Renews' : 'Access ends'}{' '}
                    {new Date(planExpiresAt).toLocaleDateString()}
                  </Text>
                </View>
              )
            )}

            {plan === 'individual' && hasBillingIssue && (
              <View style={styles.billingIssueBanner}>
                <Text style={styles.billingIssueText}>
                  ⚠️ We couldn't charge your payment method. Please update it to keep your plan
                  active.
                </Text>
              </View>
            )}

            {plan === 'individual' && (
              <TouchableOpacity
                onPress={handleManageSubscription}
                style={styles.manageButton}
                activeOpacity={0.8}
              >
                <GearIcon size={15} color={colors.textDark} />
                <Text style={styles.manageButtonText}>Manage or cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          {(plan === 'free' || plan === 'organization') && (
            <>
              <Text style={styles.sectionLabel}>
                {plan === 'organization' ? 'Also want to pay directly?' : 'Choose a plan'}
              </Text>
              {/* Visible-in-app tell for whether real RevenueCat data loaded
                  or the temporary mock fallback is showing — otherwise a
                  real fetch failure would be silently masked by the mock
                  and look identical to success. Remove alongside the mock
                  fallback once it's no longer needed. */}
              {offeringsError && (
                <Text style={styles.mockDataNotice}>
                  ⚠️ Showing test pricing — real product data not loaded (offeringsError)
                </Text>
              )}
              {
                <>
                  {/* TEMPORARY: falls back to MOCK_OFFERINGS_FOR_SCREENSHOT
                      when real products can't be fetched yet, purely so
                      there's something to screenshot for App Store
                      Connect's subscription review requirement. Revert to
                      the plain "not available" text once that screenshot
                      is captured and this is no longer needed. */}
                  <View style={styles.planOptionsRow}>
                    {(offeringsError ? MOCK_OFFERINGS_FOR_SCREENSHOT : sortedOfferings).map(
                      (pkg) => {
                        const isSelected = selectedId === pkg.identifier;
                        const isYearly = pkg.packageType === 'ANNUAL';
                        const isFounding = isFoundingPackage(pkg);
                        const periodLabel = isYearly
                          ? 'Yearly'
                          : pkg.packageType === 'MONTHLY'
                            ? 'Monthly'
                            : isFounding
                              ? 'Founding Member'
                              : pkg.product.title;
                        const periodSuffix = isYearly
                          ? '/ year'
                          : pkg.packageType === 'MONTHLY'
                            ? '/ month'
                            : isFounding
                              ? '/ year'
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
                            {isFounding && (
                              <View style={styles.savingsBadge}>
                                <Text style={styles.savingsBadgeText}>FOUNDER</Text>
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
                      },
                    )}
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
              }
            </>
          )}

          <View style={styles.sectionLabelRow}>
            <GiftIcon size={16} color={colors.secondary} />
            <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>What's included</Text>
          </View>
          <View style={styles.featureList}>
            {FEATURES.map((feature, i) => (
              <View key={feature} style={[styles.featureRow, i > 0 && styles.featureRowDivider]}>
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.featureCheck}
                >
                  <CheckIcon size={13} color="#FFFFFF" />
                </LinearGradient>
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
    fontSize: typeScale.xl,
    color: colors.textDark,
  },
  loadingContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  statusCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    paddingTop: 30,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.secondaryLight,
    shadowColor: colors.textDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  // Folded-ribbon corner tag (a gift-tag motif, not a generic badge) —
  // the card needs overflow:'hidden' above so the rotated ribbon's
  // off-card ends get clipped to the card's rounded corners.
  ribbonWrap: {
    position: 'absolute',
    top: 10,
    right: -46,
    transform: [{ rotate: '40deg' }],
  },
  ribbon: {
    width: 170,
    // Asymmetric on purpose: Handlee's line-height leaves extra invisible
    // space below each line's glyphs (not above), so a symmetric 4/4 pad
    // reads as noticeably bottom-heavy once ribbonTextLong's taller
    // lineHeight (needed to stop "FOUNDING" clipping) compounds it across
    // 2 lines. Shifting weight to paddingTop recenters the text visually.
    paddingTop: 7,
    paddingBottom: 1,
    paddingHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#B88A1E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  ribbonText: {
    fontFamily: 'Handlee_400Regular',
    fontSize: typeScale.sm,
    color: '#5A3C05',
    letterSpacing: 0.5,
  },
  // "FOUNDING" / "MEMBER" on 2 lines are each about the same length as
  // "MONTHLY"/"YEARLY" on 1 — same font size is fine, just tighten the
  // line spacing so the 2 lines sit close together. lineHeight must stay
  // >= ~14 even at this font size: Handlee's glyphs render taller than the
  // font size implies, so anything tighter clips the top of "FOUNDING".
  ribbonTextLong: {
    fontSize: 10,
    lineHeight: 14,
  },
  orbRing: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(112, 208, 221, 0.14)',
    marginBottom: 14,
  },
  orb: {
    width: 68,
    height: 68,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  statusTitle: {
    fontFamily: 'Handlee_400Regular',
    fontSize: typeScale['2xl'],
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 6,
  },
  statusSubtitle: {
    fontFamily: 'Handlee_400Regular',
    fontSize: typeScale.base,
    color: colors.textLight,
    // 20 was too tight for the 💕 emoji glyph — iOS crops its top edge
    // when the line box is shorter than the emoji needs, regardless of
    // the surrounding text fitting fine at that height.
    lineHeight: 26,
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
    fontSize: typeScale.sm,
    color: colors.textLight,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: 18,
    backgroundColor: colors.backgroundGray,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
  },
  statDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.inputBorder,
  },
  statCap: {
    fontFamily: 'Handlee_400Regular',
    fontSize: typeScale.sm,
    color: colors.textLight,
    marginBottom: 2,
  },
  statVal: {
    fontFamily: 'Handlee_400Regular',
    fontSize: typeScale.md,
    color: colors.textDark,
    textAlign: 'center',
  },
  billingIssueBanner: {
    marginTop: 16,
    backgroundColor: '#FFF4E5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F3C98B',
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: 'stretch',
  },
  billingIssueText: {
    fontFamily: 'Handlee_400Regular',
    fontSize: typeScale.sm,
    color: '#8A5A1E',
    textAlign: 'center',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    alignSelf: 'stretch',
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.secondary,
  },
  manageButtonText: {
    fontFamily: 'Handlee_400Regular',
    fontSize: typeScale.base,
    color: colors.textDark,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  sectionLabel: {
    fontFamily: 'Handlee_400Regular',
    fontSize: typeScale.xl,
    color: colors.textLight,
    marginBottom: 12,
  },
  mockDataNotice: {
    fontFamily: 'Handlee_400Regular',
    fontSize: typeScale.base,
    color: '#e53935',
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: 'Handlee_400Regular',
    fontSize: typeScale.base,
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
    fontSize: typeScale.xs,
    color: '#FFFFFF',
  },
  planOptionLabel: {
    fontFamily: 'Handlee_400Regular',
    fontSize: typeScale.md,
    color: colors.textLight,
    marginTop: 6,
    textAlign: 'center',
  },
  planOptionLabelSelected: {
    color: colors.textDark,
  },
  planOptionPrice: {
    fontFamily: 'Handlee_400Regular',
    fontSize: typeScale['3xl'],
    color: colors.textDark,
    marginTop: 6,
  },
  planOptionPriceSelected: {
    color: colors.textDark,
  },
  planOptionSuffix: {
    fontFamily: 'Handlee_400Regular',
    fontSize: typeScale.sm,
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
    fontSize: typeScale.xl,
    color: '#FFFFFF',
  },
  featureList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.secondaryLight,
    shadowColor: colors.textDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
    overflow: 'hidden',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  featureRowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.secondaryLight,
  },
  featureCheck: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 2,
  },
  featureText: {
    fontFamily: 'Handlee_400Regular',
    fontSize: typeScale.md,
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
    fontSize: typeScale.base,
    color: colors.textLight,
  },
});

export default SubscriptionScreen;
