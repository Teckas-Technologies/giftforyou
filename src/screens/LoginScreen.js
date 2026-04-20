import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const formSlide = useRef(new Animated.Value(30)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(formSlide, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }, 300);
  }, []);

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigation.replace('MainApp');
    }, 1500);
  };

  const handleSocialLogin = (provider) => {
    navigation.replace('MainApp');
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Illustration */}
          <Animated.View
            style={[
              styles.headerSection,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.illustrationWrap}>
              <Text style={styles.waveEmoji}>👋</Text>
            </View>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.subtitleText}>We missed you</Text>
          </Animated.View>

          {/* Form Card */}
          <Animated.View
            style={[
              styles.formCard,
              { opacity: formOpacity, transform: [{ translateY: formSlide }] }
            ]}
          >
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="hello@example.com"
                  placeholderTextColor={colors.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="your secret..."
                  placeholderTextColor={colors.placeholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={20}
                    color={colors.textLight}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity onPress={handleLogin} activeOpacity={0.9}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.loginBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <Text style={styles.loginBtnText}>Please wait...</Text>
                ) : (
                  <>
                    <Text style={styles.loginBtnText}>Let's Go!</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Divider */}
          <Animated.View style={[styles.divider, { opacity: formOpacity }]}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </Animated.View>

          {/* Social Buttons */}
          <Animated.View style={[styles.socialRow, { opacity: formOpacity }]}>
            <TouchableOpacity
              style={[styles.socialBtn, styles.appleBtn]}
              onPress={() => handleSocialLogin('Apple')}
            >
              <Text style={styles.appleIcon}>🍎</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialBtn}
              onPress={() => handleSocialLogin('Google')}
            >
              <Text style={styles.googleLetter}>G</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialBtn}
              onPress={() => handleSocialLogin('Email')}
            >
              <Ionicons name="mail-outline" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </Animated.View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  illustrationWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  waveEmoji: {
    fontSize: 45,
  },
  welcomeText: {
    fontFamily: 'Caveat-SemiBold',
    fontSize: 32,
    color: colors.primary,
    marginBottom: 8,
  },
  subtitleText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: colors.textSecondary,
  },
  formCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: colors.textPrimary,
  },
  eyeBtn: {
    padding: 8,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: colors.primary,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 18,
    gap: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  loginBtnText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 17,
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerText: {
    fontFamily: 'Nunito-Regular',
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.textLight,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 40,
  },
  socialBtn: {
    width: 70,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  appleBtn: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  appleIcon: {
    fontSize: 24,
  },
  googleLetter: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: '#4285F4',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 15,
    color: colors.textSecondary,
  },
  footerLink: {
    fontFamily: 'Nunito-Bold',
    fontSize: 15,
    color: colors.primary,
  },
});

export default LoginScreen;
