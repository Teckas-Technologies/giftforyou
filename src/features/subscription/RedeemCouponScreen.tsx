import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polyline, Path } from 'react-native-svg';
import { requestCouponCode, verifyCouponCode } from '../../services/api';
import { CustomAlert } from '../../components';
import useAlert from '../../hooks/useAlert';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme';
import type { ScreenProps, IconProps } from '../../types/navigation';

const BackIcon = ({ size = 22, color = colors.textLight }: IconProps) => (
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

const MailIcon = ({ size = 16, color = colors.secondary }: IconProps) => (
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
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <Polyline points="22,6 12,13 2,6" />
  </Svg>
);

const RedeemCouponScreen = ({ navigation, route }: ScreenProps) => {
  const { user } = useAuth();
  // Set only when reached from the post-signup "Have a company code?"
  // intro screen — success should continue into the app instead of going
  // back to a Settings screen that was never opened.
  const nextRoute = route?.params?.nextRoute;
  const [step, setStep] = useState('code'); // 'code' | 'verify'
  const [code, setCode] = useState('');
  // Pre-filled with the account's own email — most people sign up with
  // their work email already, so this saves re-typing it. Still editable
  // for anyone who signed up with a personal email instead.
  const [workEmail, setWorkEmail] = useState(user?.email || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeInputFocused, setCodeInputFocused] = useState(false);
  const [codeFieldFocused, setCodeFieldFocused] = useState(false);
  const [emailFieldFocused, setEmailFieldFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sentToEmail, setSentToEmail] = useState('');
  const codeInputRef = useRef<any>(null);

  // Whole-screen entrance, once on mount.
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  // Re-triggered whenever `step` changes, so switching from the code form
  // to the verify screen feels like a deliberate transition, not a hard cut.
  const stepFade = useRef(new Animated.Value(1)).current;
  const stepSlide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    stepFade.setValue(0);
    stepSlide.setValue(16);
    Animated.parallel([
      Animated.timing(stepFade, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(stepSlide, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [step]);

  const { alertConfig, showSuccess, showError, hideAlert } = useAlert();

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSendCode = !!code.trim() && isValidEmail(workEmail.trim()) && !submitting;
  const canVerify = verificationCode.trim().length === 6 && !submitting;

  const handleSendCode = async () => {
    if (!canSendCode) return;

    setSubmitting(true);
    try {
      const result = await requestCouponCode(code.trim(), workEmail.trim());
      setSentToEmail(result.workEmail);
      setStep('verify');
    } catch (error) {
      showError(error.message || 'Failed to send verification code');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!canVerify) return;

    setSubmitting(true);
    try {
      await verifyCouponCode(verificationCode.trim());
      showSuccess('Verified! Your account now has Organization Plan access. 🎉', () => {
        if (nextRoute) {
          // reset, not replace — clears CompanyCodeIntro + this screen from
          // the stack entirely, so the back button can't loop into this
          // one-time flow again.
          navigation.reset({ index: 0, routes: [{ name: nextRoute }] });
        } else {
          navigation.goBack();
        }
      });
    } catch (error) {
      showError(error.message || 'Failed to verify code');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = () => {
    setStep('code');
    setVerificationCode('');
  };

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
          <BackIcon size={22} color={colors.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Company Access</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.stepIndicator}>
              <View style={[styles.stepBar, styles.stepBarActive]} />
              <View style={[styles.stepBar, step === 'verify' && styles.stepBarActive]} />
            </View>

            <Animated.View style={{ opacity: stepFade, transform: [{ translateX: stepSlide }] }}>
              {step === 'code' ? (
                <>
                  <Text style={styles.title}>Enter your code</Text>
                  <Text style={styles.sectionHint}>
                    {nextRoute
                      ? "Your company's code unlocks everything, instantly."
                      : "Your company's code unlocks everything, instantly — verify your work email to redeem it."}
                  </Text>

                  <Text style={styles.sectionLabel}>Company Code</Text>
                  <View style={[styles.inputWrap, codeFieldFocused && styles.inputWrapFocused]}>
                    <TextInput
                      style={styles.input}
                      value={code}
                      onChangeText={setCode}
                      onFocus={() => setCodeFieldFocused(true)}
                      onBlur={() => setCodeFieldFocused(false)}
                      placeholder="ACMECORP2026"
                      placeholderTextColor="#d9d0e3"
                      autoCapitalize="characters"
                      autoCorrect={false}
                    />
                  </View>

                  {nextRoute ? (
                    // Reached right after signup — the email is already known,
                    // so just confirm it instead of asking for it again.
                    <View style={styles.confirmedEmailRow}>
                      <MailIcon size={15} color={colors.secondary} />
                      <Text style={styles.confirmedEmail}>
                        Verifying <Text style={styles.confirmedEmailBold}>{workEmail}</Text>
                      </Text>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.sectionLabel}>Work Email</Text>
                      <View
                        style={[styles.inputWrap, emailFieldFocused && styles.inputWrapFocused]}
                      >
                        <TextInput
                          style={styles.input}
                          value={workEmail}
                          onChangeText={setWorkEmail}
                          onFocus={() => setEmailFieldFocused(true)}
                          onBlur={() => setEmailFieldFocused(false)}
                          placeholder="you@yourcompany.com"
                          placeholderTextColor="#d9d0e3"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Text style={styles.title}>Check your inbox</Text>
                  <Text style={styles.sectionHint}>
                    We sent a 6-digit code to{' '}
                    <Text style={styles.sectionHintBold}>{sentToEmail}</Text>
                  </Text>

                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => codeInputRef.current?.focus()}
                    style={styles.otpRow}
                  >
                    {Array.from({ length: 6 }).map((_, i) => {
                      const digit = verificationCode[i];
                      const isCursor = codeInputFocused && i === verificationCode.length;
                      return (
                        <View
                          key={i}
                          style={[
                            styles.otpBox,
                            (isCursor || (codeInputFocused && digit)) && styles.otpBoxActive,
                          ]}
                        >
                          <Text style={styles.otpDigit}>{digit || ''}</Text>
                        </View>
                      );
                    })}
                  </TouchableOpacity>
                  <TextInput
                    ref={codeInputRef}
                    value={verificationCode}
                    onChangeText={(text) =>
                      setVerificationCode(text.replace(/[^0-9]/g, '').slice(0, 6))
                    }
                    onFocus={() => setCodeInputFocused(true)}
                    onBlur={() => setCodeInputFocused(false)}
                    keyboardType="number-pad"
                    maxLength={6}
                    style={styles.hiddenInput}
                    autoFocus
                  />

                  <TouchableOpacity onPress={handleResend} style={styles.resendLink}>
                    <Text style={styles.resendLinkText}>Didn't get it? Resend</Text>
                  </TouchableOpacity>
                </>
              )}
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity
          disabled={step === 'code' ? !canSendCode : !canVerify}
          onPress={step === 'code' ? handleSendCode : handleVerify}
          activeOpacity={0.85}
          style={{ opacity: (step === 'code' ? canSendCode : canVerify) ? 1 : 0.5 }}
        >
          <LinearGradient
            colors={[colors.secondary, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitButton}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {step === 'code' ? 'Send Code' : 'Verify'}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 24,
  },
  stepBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.secondaryBg,
  },
  stepBarActive: {
    backgroundColor: colors.secondary,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Handlee_400Regular',
    color: colors.textDark,
    marginBottom: 8,
  },
  sectionHint: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.textLight,
    marginBottom: 24,
  },
  sectionHintBold: {
    fontFamily: 'Handlee_400Regular',
    color: colors.textDark,
  },
  sectionLabel: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 15,
    color: colors.textDark,
    marginBottom: 8,
  },
  inputWrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.inputBorder,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  inputWrapFocused: {
    borderColor: colors.inputFocusBorder,
  },
  input: {
    fontFamily: 'Handlee_400Regular',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  confirmedEmailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.secondaryBg,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  confirmedEmail: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 14,
    color: colors.textLight,
    flexShrink: 1,
  },
  confirmedEmailBold: {
    fontFamily: 'Handlee_400Regular',
    color: colors.textDark,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  otpBox: {
    width: 46,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  otpBoxActive: {
    borderColor: colors.inputFocusBorder,
  },
  otpDigit: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 22,
    color: colors.textDark,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },
  resendLink: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  resendLinkText: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 14,
    color: colors.textLight,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },
  submitButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 18,
    color: '#FFFFFF',
  },
});

export default RedeemCouponScreen;
