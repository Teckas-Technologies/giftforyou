import React, { useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Polyline } from 'react-native-svg';
import { requestCouponCode, verifyCouponCode } from '../services/api';
import { CustomAlert } from '../components';
import useAlert from '../hooks/useAlert';
import { useAuth } from '../contexts/AuthContext';

const BackIcon = ({ size = 24, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

const RedeemCouponScreen = ({ navigation, route }) => {
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
  const [submitting, setSubmitting] = useState(false);
  const [sentToEmail, setSentToEmail] = useState('');

  const { alertConfig, showSuccess, showError, hideAlert } = useAlert();

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
          <MaskedView maskElement={<Text style={styles.headerTitleMask}>Redeem Company Code</Text>}>
            <LinearGradient colors={['#ca9ad6', '#70d0dd']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={[styles.headerTitleMask, { opacity: 0 }]}>Redeem Company Code</Text>
            </LinearGradient>
          </MaskedView>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {step === 'code' ? (
            <>
              <Text style={styles.sectionHint}>
                {nextRoute
                  ? 'If your company gives you access to Thoughtfully, enter the code they shared below.'
                  : 'If your company gives you access to Thoughtfully, enter the code they shared and your work email below.'}
              </Text>

              <Text style={styles.sectionLabel}>Company Code</Text>
              <TextInput
                style={styles.input}
                value={code}
                onChangeText={setCode}
                placeholder="E.g., ACMECORP2026"
                placeholderTextColor="#b8a5c4"
                autoCapitalize="characters"
                autoCorrect={false}
              />

              {nextRoute ? (
                // Reached right after signup — the email is already known,
                // so just confirm it instead of asking for it again.
                <>
                  <Text style={styles.sectionLabel}>Work Email</Text>
                  <Text style={styles.confirmedEmail}>We'll verify {workEmail}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.sectionLabel}>Work Email</Text>
                  <TextInput
                    style={styles.input}
                    value={workEmail}
                    onChangeText={setWorkEmail}
                    placeholder="you@yourcompany.com"
                    placeholderTextColor="#b8a5c4"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </>
              )}
            </>
          ) : (
            <>
              <Text style={styles.sectionHint}>
                We sent a 6-digit code to {sentToEmail}. Enter it below to confirm this is your work email.
              </Text>

              <Text style={styles.sectionLabel}>Verification Code</Text>
              <TextInput
                style={styles.input}
                value={verificationCode}
                onChangeText={(text) => setVerificationCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="123456"
                placeholderTextColor="#b8a5c4"
                keyboardType="number-pad"
                maxLength={6}
              />

              <TouchableOpacity onPress={handleResend} style={styles.resendLink}>
                <Text style={styles.resendLinkText}>Resend code</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity
          disabled={step === 'code' ? !canSendCode : !canVerify}
          onPress={step === 'code' ? handleSendCode : handleVerify}
          activeOpacity={0.8}
          style={{ opacity: (step === 'code' ? canSendCode : canVerify) ? 1 : 0.5 }}
        >
          <LinearGradient
            colors={['#ca9ad6', '#70d0dd']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitButton}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>{step === 'code' ? 'Send Code' : 'Verify'}</Text>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionHint: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 14,
    color: '#6b3a8a',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  sectionLabel: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 15,
    color: '#330c54',
    marginBottom: 8,
  },
  confirmedEmail: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 16,
    color: '#330c54',
    marginBottom: 20,
  },
  resendLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  resendLinkText: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 14,
    color: '#6b3a8a',
  },
  input: {
    fontFamily: 'Handlee_400Regular',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    borderWidth: 2,
    borderColor: '#f4cae8',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  footer: {
    padding: 16,
    paddingBottom: 30,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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
