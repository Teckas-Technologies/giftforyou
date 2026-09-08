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
import { redeemCoupon } from '../services/api';
import { CustomAlert } from '../components';
import useAlert from '../hooks/useAlert';

const BackIcon = ({ size = 24, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

const RedeemCouponScreen = ({ navigation }) => {
  const [code, setCode] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { alertConfig, showSuccess, showError, hideAlert } = useAlert();

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = !!code.trim() && isValidEmail(workEmail.trim()) && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await redeemCoupon(code.trim(), workEmail.trim());
      showSuccess('Coupon redeemed! Your account now has Organization Plan access. 🎉', () => navigation.goBack());
    } catch (error) {
      showError(error.message || 'Failed to redeem coupon');
    } finally {
      setSubmitting(false);
    }
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
          <Text style={styles.sectionHint}>
            If your company gives you access to Thoughtfully, enter the code they shared and your work email below.
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
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity
          disabled={!canSubmit}
          onPress={handleSubmit}
          activeOpacity={0.8}
          style={{ opacity: canSubmit ? 1 : 0.5 }}
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
              <Text style={styles.submitButtonText}>Redeem Code</Text>
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
