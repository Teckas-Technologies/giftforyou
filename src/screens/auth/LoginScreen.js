import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { useAuth } from '../../contexts/AuthContext';
import { CustomAlert } from '../../components';
import useAlert from '../../hooks/useAlert';

// Icons
const MailIcon = ({ size = 20, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <Path d="M22 6l-10 7L2 6" />
  </Svg>
);

const LockIcon = ({ size = 20, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z" />
    <Path d="M7 11V7a5 5 0 0110 0v4" />
  </Svg>
);

const EyeIcon = ({ size = 20, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <Circle cx="12" cy="12" r="3" />
  </Svg>
);

const EyeOffIcon = ({ size = 20, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <Line x1="1" y1="1" x2="23" y2="23" />
  </Svg>
);

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const { signIn } = useAuth();
  const { alertConfig, showError, hideAlert } = useAlert();

  // Animations
  const logoAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(buttonAnim, {
        toValue: 1,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isFormValid = email.trim() && password.trim() && isValidEmail(email);

  const handleLogin = async () => {
    if (!isFormValid) return;

    setLoading(true);
    const { error } = await signIn(email.trim().toLowerCase(), password);
    setLoading(false);

    if (error) {
      showError(error.message || 'Failed to sign in. Please check your credentials.');
    }
    // Success is handled by AuthContext - user state changes and navigation updates
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#FFFFFF', '#fbe5f5', '#ccf9ff', '#FFFFFF']}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo Section */}
        <Animated.View style={[
          styles.logoSection,
          {
            opacity: logoAnim,
            transform: [{
              translateY: logoAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-30, 0],
              }),
            }],
          }
        ]}>
          <LinearGradient
            colors={['#fbe5f5', '#ccf9ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoContainer}
          >
            <Text style={styles.logoEmoji}>🎁</Text>
          </LinearGradient>
          <MaskedView
            maskElement={
              <Text style={styles.appNameMask}>GiftBox4you</Text>
            }
          >
            <LinearGradient
              colors={['#ca9ad6', '#70d0dd']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={[styles.appNameMask, { opacity: 0 }]}>GiftBox4you</Text>
            </LinearGradient>
          </MaskedView>
          <Text style={styles.tagline}>Never forget a special moment</Text>
        </Animated.View>

        {/* Form Section */}
        <Animated.View style={[
          styles.formSection,
          {
            opacity: formAnim,
            transform: [{
              translateY: formAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            }],
          }
        ]}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subtitleText}>Sign in to continue</Text>

          {/* Email Input */}
          <View style={[styles.inputContainer, emailFocused && styles.inputContainerFocused]}>
            <View style={styles.inputIcon}>
              <MailIcon color={emailFocused ? '#ca9ad6' : '#6b3a8a'} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>

          {/* Password Input */}
          <View style={[styles.inputContainer, passwordFocused && styles.inputContainerFocused]}>
            <View style={styles.inputIcon}>
              <LockIcon color={passwordFocused ? '#ca9ad6' : '#6b3a8a'} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOffIcon color="#6b3a8a" />
              ) : (
                <EyeIcon color="#6b3a8a" />
              )}
            </TouchableOpacity>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotButton}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Login Button */}
        <Animated.View style={[
          styles.buttonSection,
          {
            opacity: buttonAnim,
            transform: [{ scale: buttonAnim }],
          }
        ]}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={!isFormValid || loading}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={isFormValid && !loading ? ['#ca9ad6', '#70d0dd'] : ['#ccc', '#ccc']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.loginButtonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      <CustomAlert {...alertConfig} onClose={hideAlert} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 48,
  },
  appNameMask: {
    fontSize: 36,
    fontFamily: 'StyleScript_400Regular',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginTop: 8,
  },
  formSection: {
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputContainerFocused: {
    borderColor: '#ca9ad6',
  },
  inputIcon: {
    paddingLeft: 16,
    paddingRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
    fontSize: 16,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  eyeButton: {
    padding: 16,
  },
  forgotButton: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#ca9ad6',
  },
  buttonSection: {
    marginTop: 'auto',
  },
  loginButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  loginButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontSize: 18,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signupText: {
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  signupLink: {
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#ca9ad6',
  },
});

export default LoginScreen;
