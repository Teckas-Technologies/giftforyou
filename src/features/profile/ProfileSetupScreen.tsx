import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';
import {
  setupProfile,
  setUserCredentials,
  getUserCredentials,
  getProfile,
} from '../../services/api';
import { getDateParts } from '../../utils/date';
import { CustomAlert, SkeletonRow } from '../../components';
import useAlert from '../../hooks/useAlert';
import type { ScreenProps, IconProps } from '../../types/navigation';
import { fontSize as typeScale } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// User Icon
const UserIcon = ({ size = 24, color = '#6b3a8a' }: IconProps) => (
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
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

// Calendar Icon
const CalendarIcon = ({ size = 24, color = '#6b3a8a' }: IconProps) => (
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
    <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <Line x1="16" y1="2" x2="16" y2="6" />
    <Line x1="8" y1="2" x2="8" y2="6" />
    <Line x1="3" y1="10" x2="21" y2="10" />
  </Svg>
);

// Check Icon
const CheckIcon = ({ size = 16, color = '#FFFFFF' }: IconProps) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={3}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M20 6L9 17l-5-5" />
  </Svg>
);

// Chevron Icons
const ChevronUpIcon = ({ size = 20, color = '#6b3a8a' }: IconProps) => (
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
    <Polyline points="18 15 12 9 6 15" />
  </Svg>
);

const ChevronDownIcon = ({ size = 20, color = '#6b3a8a' }: IconProps) => (
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
    <Polyline points="6 9 12 15 18 9" />
  </Svg>
);

// Avatar types matching backend constraint
const avatarTypes = [
  { id: 'turtle', emoji: '🐢', label: 'Turtle' },
  { id: 'pig', emoji: '🐷', label: 'Pig' },
  { id: 'cow', emoji: '🐮', label: 'Cow' },
  { id: 'flowers', emoji: '🌸', label: 'Flowers' },
];

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const ProfileSetupScreen = ({ navigation, route }: ScreenProps) => {
  // Check if editing from Settings
  const isEditMode = route?.params?.editMode || false;
  const [profileLoaded, setProfileLoaded] = useState(false);

  const [name, setName] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedYear, setSelectedYear] = useState(2000);
  const [selectedAvatar, setSelectedAvatar] = useState('turtle');
  const [showBirthYear, setShowBirthYear] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [loading, setLoading] = useState(isEditMode);

  // Custom alert hook
  const { alertConfig, showSuccess, showError, showWarning, hideAlert } = useAlert();

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const avatarAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  // Load profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      // Always load the saved profile (not only in edit mode) so returning
      // to this screen after setup shows the existing values pre-filled.
      if (!profileLoaded) {
        try {
          setLoading(true);
          const response = await getProfile();
          const profile = response.user || response.profile || response;

          if (profile) {
            if (profile.name) {
              setName(profile.name);
            } else {
              const credentials = getUserCredentials();
              if (credentials?.name) setName(credentials.name);
            }
            if (profile.birthday) {
              // Parse via the TZ-safe util so the day doesn't shift.
              const p = getDateParts(profile.birthday);
              if (p) {
                setSelectedMonth(p.month - 1);
                setSelectedDay(p.day);
                setSelectedYear(p.year);
              }
            }
            if (profile.avatarType || profile.avatar_type) {
              setSelectedAvatar(profile.avatarType || profile.avatar_type);
            }
            if (profile.showBirthYear !== undefined || profile.show_birth_year !== undefined) {
              setShowBirthYear(profile.showBirthYear ?? profile.show_birth_year ?? true);
            }
          }
          setProfileLoaded(true);
        } catch (error) {
          console.error('Error loading profile:', error);
          // Try to get name from credentials as fallback
          const credentials = getUserCredentials();
          if (credentials?.name) {
            setName(credentials.name);
          }
        } finally {
          setLoading(false);
        }
      } else if (!isEditMode && !name) {
        // Pre-fill from credentials for new setup
        const credentials = getUserCredentials();
        if (credentials?.name) {
          setName(credentials.name);
        }
      }
    };

    loadProfile();

    Animated.stagger(150, [
      Animated.spring(headerAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(formAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(avatarAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(buttonAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatBirthday = () => {
    const monthName = months[selectedMonth];
    if (showBirthYear) {
      return `${monthName} ${selectedDay}, ${selectedYear}`;
    }
    return `${monthName} ${selectedDay}`;
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showWarning('Please enter your name to continue.');
      return;
    }

    try {
      setSaving(true);

      // Format date in local timezone to avoid UTC conversion issues
      const year = selectedYear;
      const month = String(selectedMonth + 1).padStart(2, '0');
      const day = String(selectedDay).padStart(2, '0');

      const profileData = {
        name: name.trim(),
        birthday: `${year}-${month}-${day}`,
        avatarType: selectedAvatar,
        showBirthYear,
      };

      // Try to save profile to API
      try {
        await setupProfile(profileData);
      } catch (apiError) {
        console.log('API save failed, continuing with local save:', apiError.message);
      }

      // Update local credentials with name
      const credentials = getUserCredentials();
      await setUserCredentials(
        credentials.userId as string,
        credentials.email as string,
        name.trim(),
      );

      // Navigate based on mode
      if (isEditMode) {
        navigation.goBack();
      } else {
        navigation.replace('MainApp');
      }
    } catch (error) {
      console.error('Error setting up profile:', error);
      showError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const createSlideStyle = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [30, 0],
        }),
      },
    ],
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={['#FFFFFF', '#ccf9ff', '#e0f7fa', '#FFFFFF']}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Loading state for Edit Mode — a sibling of the form, not an overlay
          drawn on top of it, so it never visually stacks with the form's
          own always-static header/labels underneath. */}
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
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View style={[styles.header, createSlideStyle(headerAnim)]}>
            <Text style={styles.title}>
              {isEditMode ? 'Edit Profile' : 'Complete Your Profile'}
            </Text>
            <Text style={styles.subtitle}>
              Tell us a bit about yourself so we can personalize your experience
            </Text>
          </Animated.View>

          {/* Name Input */}
          <Animated.View style={[styles.section, createSlideStyle(formAnim)]}>
            <Text style={styles.sectionTitle}>What's your name?</Text>
            <View style={[styles.inputContainer, nameFocused && styles.inputFocused]}>
              <View style={styles.inputIcon}>
                <UserIcon size={20} color="#6b3a8a" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                autoCapitalize="words"
              />
            </View>
          </Animated.View>

          {/* Birthday Input */}
          <Animated.View style={[styles.section, createSlideStyle(formAnim)]}>
            <Text style={styles.sectionTitle}>When's your birthday?</Text>
            <TouchableOpacity style={styles.inputContainer} onPress={() => setShowDatePicker(true)}>
              <View style={styles.inputIcon}>
                <CalendarIcon size={20} color="#6b3a8a" />
              </View>
              <Text style={styles.dateText}>{formatBirthday()}</Text>
            </TouchableOpacity>

            {/* Show Birth Year Toggle */}
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setShowBirthYear(!showBirthYear)}
            >
              <View style={[styles.checkbox, showBirthYear && styles.checkboxChecked]}>
                {showBirthYear && <CheckIcon size={14} color="#FFFFFF" />}
              </View>
              <Text style={styles.toggleLabel}>Show birth year to others</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Avatar Selection */}
          <Animated.View style={[styles.section, createSlideStyle(avatarAnim)]}>
            <Text style={styles.sectionTitle}>Choose your avatar style</Text>
            <View style={styles.avatarGrid}>
              {avatarTypes.map((avatar) => (
                <TouchableOpacity
                  key={avatar.id}
                  style={[
                    styles.avatarOption,
                    selectedAvatar === avatar.id && styles.avatarSelected,
                  ]}
                  onPress={() => setSelectedAvatar(avatar.id)}
                >
                  <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
                  <Text
                    style={[
                      styles.avatarLabel,
                      selectedAvatar === avatar.id && styles.avatarLabelSelected,
                    ]}
                  >
                    {avatar.label}
                  </Text>
                  {selectedAvatar === avatar.id && (
                    <View style={styles.avatarCheck}>
                      <CheckIcon size={12} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Save Button */}
          <Animated.View style={[styles.buttonContainer, createSlideStyle(buttonAnim)]}>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              <LinearGradient
                colors={['#ca9ad6', '#70d0dd']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.saveButton}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Continue</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => (isEditMode ? navigation.goBack() : navigation.replace('Main'))}
            >
              <Text style={styles.skipText}>{isEditMode ? 'Cancel' : 'Skip for now'}</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      )}

      {/* Date Picker — native OS picker (same as AddEventScreen/
          QuestionnaireScreen) instead of the old custom Month/Day/Year
          wheel columns, so jumping to an old birth year is a direct tap
          instead of scrolling a wheel decades back. */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showDatePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Your Birthday</Text>

              <DateTimePicker
                value={new Date(selectedYear, selectedMonth, selectedDay)}
                mode="date"
                display="inline"
                maximumDate={new Date()}
                minimumDate={new Date(1920, 0, 1)}
                accentColor="#ca9ad6"
                themeVariant="light"
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setSelectedMonth(selectedDate.getMonth());
                    setSelectedDay(selectedDate.getDate());
                    setSelectedYear(selectedDate.getFullYear());
                  }
                }}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmWrapper}
                  onPress={() => setShowDatePicker(false)}
                >
                  <LinearGradient
                    colors={['#ca9ad6', '#70d0dd']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.modalConfirmButton}
                  >
                    <Text style={styles.modalConfirmText}>Done</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={new Date(selectedYear, selectedMonth, selectedDay)}
          mode="date"
          display="calendar"
          maximumDate={new Date()}
          minimumDate={new Date(1920, 0, 1)}
          onChange={(event, selectedDate) => {
            // Android's dialog is its own native modal and closes itself
            // either way — 'set' = confirmed, 'dismissed' = cancelled.
            setShowDatePicker(false);
            if (event?.type === 'dismissed') return;
            if (selectedDate) {
              setSelectedMonth(selectedDate.getMonth());
              setSelectedDay(selectedDate.getDate());
              setSelectedYear(selectedDate.getFullYear());
            }
          }}
        />
      )}

      {/* Custom Alert */}
      <CustomAlert {...alertConfig} onClose={hideAlert} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 80,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: typeScale['6xl'],
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: typeScale.md,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: typeScale.lg,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  inputFocused: {
    borderColor: '#ca9ad6',
  },
  inputIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fbe5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: typeScale.lg,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  dateText: {
    flex: 1,
    fontSize: typeScale.lg,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ca9ad6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#ca9ad6',
    borderColor: '#ca9ad6',
  },
  toggleLabel: {
    fontSize: typeScale.base,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  avatarOption: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    position: 'relative',
  },
  avatarSelected: {
    borderColor: '#ca9ad6',
    backgroundColor: '#fbe5f5',
  },
  avatarEmoji: {
    fontSize: typeScale['7xl'],
    marginBottom: 6,
  },
  avatarLabel: {
    fontSize: typeScale.sm,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  avatarLabelSelected: {
    color: '#ca9ad6',
    fontFamily: 'Handlee_400Regular',
  },
  avatarCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ca9ad6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  saveButton: {
    paddingHorizontal: 60,
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  saveButtonText: {
    fontSize: typeScale.xl,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
  },
  skipButton: {
    marginTop: 20,
    padding: 10,
  },
  skipText: {
    fontSize: typeScale.md,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: typeScale['2xl'],
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    textAlign: 'center',
    marginBottom: 24,
  },
  pickerArrow: {
    padding: 8,
  },
  pickerValue: {
    backgroundColor: '#fbe5f5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  pickerValueText: {
    fontSize: typeScale.xl,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelButton: {
    flex: 1,
    minHeight: 50,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: typeScale.lg,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  modalConfirmWrapper: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  modalConfirmButton: {
    minHeight: 50,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    fontSize: typeScale.lg,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
  },
});

export default ProfileSetupScreen;
