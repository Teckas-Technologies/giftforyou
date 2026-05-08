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
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Path, Circle, Line, Polyline } from 'react-native-svg';
import { useAuth } from '../../contexts/AuthContext';
import { CustomAlert, GiftBoxIcon } from '../../components';
import useAlert from '../../hooks/useAlert';

const { height } = Dimensions.get('window');

// Icons
const UserIcon = ({ size = 20, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

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

const CheckIcon = ({ size = 14, color = '#4CAF50' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="20 6 9 17 4 12" />
  </Svg>
);

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const { signUp } = useAuth();
  const { alertConfig, showSuccess, showError, hideAlert } = useAlert();

  // Animations
  const logoAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 500,
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

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = (pass) => pass.length >= 6;
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const isFormValid =
    name.trim().length > 0 &&
    isValidEmail(email) &&
    isValidPassword(password) &&
    passwordsMatch;

  const handleSignUp = async () => {
    if (!isFormValid) return;

    setLoading(true);
    const { data, error } = await signUp(
      email.trim().toLowerCase(),
      password,
      name.trim()
    );
    setLoading(false);

    if (error) {
      showError(error.message || 'Failed to create account. Please try again.');
    } else {
      if (data?.session) {
        showSuccess('Account created successfully! Welcome to GiftBox4you!');
      } else {
        showSuccess('Account created successfully! Please check your email to verify your account.', () => {
          navigation.navigate('Login');
        });
      }
    }
  };

  const renderPasswordStrength = () => {
    if (!password) return null;

    const hasMinLength = password.length >= 6;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    return (
      <View style={styles.strengthContainer}>
        <View style={styles.strengthItem}>
          {hasMinLength ? <CheckIcon /> : <View style={styles.strengthDot} />}
          <Text style={[styles.strengthText, hasMinLength && styles.strengthTextValid]}>
            6+ chars
          </Text>
        </View>
        <View style={styles.strengthItem}>
          {hasUppercase ? <CheckIcon /> : <View style={styles.strengthDot} />}
          <Text style={[styles.strengthText, hasUppercase && styles.strengthTextValid]}>
            Uppercase
          </Text>
        </View>
        <View style={styles.strengthItem}>
          {hasNumber ? <CheckIcon /> : <View style={styles.strengthDot} />}
          <Text style={[styles.strengthText, hasNumber && styles.strengthTextValid]}>
            Number
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={['#FDEEF3', '#E8F4FD', '#FBDCE9', '#D6EAF8']}
        locations={[0, 0.4, 0.7, 1]}
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
          <View style={styles.logoBox}>
            <GiftBoxIcon size={50} />
          </View>
          <View style={styles.appNameContainer}>
            <Text style={styles.appName}>Gift</Text>
            <MaskedView
              maskElement={
                <Text style={styles.appNameMask}>Box</Text>
              }
            >
              <LinearGradient
                colors={['#ca9ad6', '#70d0dd']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={[styles.appNameMask, { opacity: 0 }]}>Box</Text>
              </LinearGradient>
            </MaskedView>
            <Text style={styles.appName}>4you</Text>
          </View>
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
          <Text style={styles.welcomeText}>Create Account</Text>
          <Text style={styles.subtitleText}>Join us and never miss a moment</Text>

          {/* Name Input */}
          <View style={[styles.inputContainer, focusedField === 'name' && styles.inputContainerFocused]}>
            <View style={styles.inputIcon}>
              <UserIcon color={focusedField === 'name' ? '#ca9ad6' : '#6b3a8a'} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {/* Email Input */}
          <View style={[styles.inputContainer, focusedField === 'email' && styles.inputContainerFocused]}>
            <View style={styles.inputIcon}>
              <MailIcon color={focusedField === 'email' ? '#ca9ad6' : '#6b3a8a'} />
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
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {/* Password Input */}
          <View style={[styles.inputContainer, focusedField === 'password' && styles.inputContainerFocused]}>
            <View style={styles.inputIcon}>
              <LockIcon color={focusedField === 'password' ? '#ca9ad6' : '#6b3a8a'} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOffIcon color="#6b3a8a" /> : <EyeIcon color="#6b3a8a" />}
            </TouchableOpacity>
          </View>

          {renderPasswordStrength()}

          {/* Confirm Password Input */}
          <View style={[
            styles.inputContainer,
            focusedField === 'confirmPassword' && styles.inputContainerFocused,
            confirmPassword && !passwordsMatch && styles.inputContainerError,
          ]}>
            <View style={styles.inputIcon}>
              <LockIcon color={focusedField === 'confirmPassword' ? '#ca9ad6' : '#6b3a8a'} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              onFocus={() => setFocusedField('confirmPassword')}
              onBlur={() => setFocusedField(null)}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOffIcon color="#6b3a8a" /> : <EyeIcon color="#6b3a8a" />}
            </TouchableOpacity>
          </View>
          {confirmPassword && !passwordsMatch && (
            <Text style={styles.errorText}>Passwords do not match</Text>
          )}
        </Animated.View>

        {/* Footer Section */}
        <Animated.View style={[
          styles.footerSection,
          {
            opacity: buttonAnim,
            transform: [{ scale: buttonAnim }],
          }
        ]}>
          <TouchableOpacity
            style={styles.signupButton}
            onPress={handleSignUp}
            disabled={!isFormValid || loading}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={isFormValid && !loading ? ['#ca9ad6', '#70d0dd'] : ['#ccc', '#ccc']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.signupButtonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
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
    paddingTop: 50,
    paddingBottom: 50,
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  logoBox: {
    width: 75,
    height: 75,
    backgroundColor: '#330c54',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#330c54',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  appNameContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  appName: {
    fontSize: 28,
    fontFamily: 'StyleScript_400Regular',
    color: '#330c54',
    letterSpacing: 0.5,
  },
  appNameMask: {
    fontSize: 28,
    fontFamily: 'StyleScript_400Regular',
    letterSpacing: 0.5,
  },
  formSection: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 15,
  },
  welcomeText: {
    fontSize: 24,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginBottom: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  inputContainerFocused: {
    borderColor: '#ca9ad6',
  },
  inputContainerError: {
    borderColor: '#F44336',
  },
  inputIcon: {
    paddingLeft: 14,
    paddingRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    paddingRight: 14,
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  eyeButton: {
    padding: 13,
  },
  strengthContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  strengthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  strengthDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#ddd',
  },
  strengthText: {
    fontSize: 11,
    fontFamily: 'Handlee_400Regular',
    color: '#999',
  },
  strengthTextValid: {
    color: '#4CAF50',
  },
  errorText: {
    fontSize: 11,
    fontFamily: 'Handlee_400Regular',
    color: '#F44336',
    marginTop: -6,
    marginBottom: 12,
    marginLeft: 4,
  },
  footerSection: {
    paddingTop: 15,
    paddingBottom: 20,
  },
  signupButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  signupButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupButtonText: {
    fontSize: 17,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  loginText: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  loginLink: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#ca9ad6',
  },
});

export default SignUpScreen;
