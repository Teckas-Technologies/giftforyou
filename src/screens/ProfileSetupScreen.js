import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';
import { setupProfile, setUserCredentials, getUserCredentials, getProfile } from '../services/api';
import { CustomAlert } from '../components';
import useAlert from '../hooks/useAlert';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// User Icon
const UserIcon = ({ size = 24, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

// Calendar Icon
const CalendarIcon = ({ size = 24, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <Line x1="16" y1="2" x2="16" y2="6" />
    <Line x1="8" y1="2" x2="8" y2="6" />
    <Line x1="3" y1="10" x2="21" y2="10" />
  </Svg>
);

// Check Icon
const CheckIcon = ({ size = 16, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 6L9 17l-5-5" />
  </Svg>
);

// Chevron Icons
const ChevronUpIcon = ({ size = 20, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="18 15 12 9 6 15" />
  </Svg>
);

const ChevronDownIcon = ({ size = 20, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
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
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate();
};

// Wheel Picker Item Height
const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

// Wheel Picker Component
const WheelPicker = ({ data, selectedIndex, onSelect, renderItem, keyExtractor }) => {
  const flatListRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);

  // Scroll to selected item on mount and when selectedIndex changes
  useEffect(() => {
    if (flatListRef.current && !isScrolling) {
      flatListRef.current.scrollToOffset({
        offset: selectedIndex * ITEM_HEIGHT,
        animated: false,
      });
    }
  }, [selectedIndex, isScrolling]);

  const handleMomentumScrollEnd = useCallback((event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, data.length - 1));

    if (clampedIndex !== selectedIndex) {
      onSelect(clampedIndex);
    }
    setIsScrolling(false);
  }, [data.length, selectedIndex, onSelect]);

  const handleScrollBegin = useCallback(() => {
    setIsScrolling(true);
  }, []);

  const getItemLayout = useCallback((_, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  const renderItemWrapper = useCallback(({ item, index }) => {
    const isSelected = index === selectedIndex;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          flatListRef.current?.scrollToOffset({
            offset: index * ITEM_HEIGHT,
            animated: true,
          });
          onSelect(index);
        }}
        style={[
          styles.wheelPickerItem,
          isSelected && styles.wheelPickerItemSelected,
        ]}
      >
        <Text style={[
          styles.wheelPickerItemText,
          isSelected && styles.wheelPickerItemTextSelected,
        ]}>
          {renderItem ? renderItem(item, index) : item.toString()}
        </Text>
      </TouchableOpacity>
    );
  }, [selectedIndex, onSelect, renderItem]);

  // Add padding items for scroll effect
  const paddedData = [
    { id: 'pad-top-1', isPadding: true },
    { id: 'pad-top-2', isPadding: true },
    ...data.map((item, index) => ({ value: item, id: keyExtractor ? keyExtractor(item, index) : index.toString() })),
    { id: 'pad-bottom-1', isPadding: true },
    { id: 'pad-bottom-2', isPadding: true },
  ];

  const renderPaddedItem = useCallback(({ item, index }) => {
    if (item.isPadding) {
      return <View style={styles.wheelPickerItem} />;
    }
    const actualIndex = index - 2; // Adjust for padding
    const isSelected = actualIndex === selectedIndex;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          flatListRef.current?.scrollToOffset({
            offset: actualIndex * ITEM_HEIGHT,
            animated: true,
          });
          onSelect(actualIndex);
        }}
        style={[
          styles.wheelPickerItem,
          isSelected && styles.wheelPickerItemSelected,
        ]}
      >
        <Text style={[
          styles.wheelPickerItemText,
          isSelected && styles.wheelPickerItemTextSelected,
        ]}>
          {renderItem ? renderItem(item.value, actualIndex) : item.value.toString()}
        </Text>
      </TouchableOpacity>
    );
  }, [selectedIndex, onSelect, renderItem]);

  return (
    <View style={styles.wheelPickerContainer}>
      <View style={styles.wheelPickerHighlight} />
      <FlatList
        ref={flatListRef}
        data={paddedData}
        renderItem={renderPaddedItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollBeginDrag={handleScrollBegin}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        style={styles.wheelPickerList}
        contentContainerStyle={styles.wheelPickerContent}
        initialScrollIndex={selectedIndex}
        onScrollToIndexFailed={() => {}}
      />
    </View>
  );
};

const ProfileSetupScreen = ({ navigation, route }) => {
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1920 + 1 }, (_, i) => currentYear - i);
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);

  // Load profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (isEditMode && !profileLoaded) {
        try {
          setLoading(true);
          const response = await getProfile();
          const profile = response.user || response.profile || response;

          if (profile) {
            if (profile.name) setName(profile.name);
            if (profile.birthday) {
              const date = new Date(profile.birthday);
              setSelectedMonth(date.getMonth());
              setSelectedDay(date.getDate());
              setSelectedYear(date.getFullYear());
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

  // Adjust day if it exceeds days in the selected month
  useEffect(() => {
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [selectedMonth, selectedYear, daysInMonth]);

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
      await setUserCredentials(credentials.userId, credentials.email, name.trim());

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

  const createSlideStyle = (anim) => ({
    opacity: anim,
    transform: [{
      translateY: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [30, 0],
      }),
    }],
  });

  const adjustValue = (type, direction) => {
    if (type === 'month') {
      let newMonth = selectedMonth + direction;
      if (newMonth < 0) newMonth = 11;
      if (newMonth > 11) newMonth = 0;
      setSelectedMonth(newMonth);
    } else if (type === 'day') {
      let newDay = selectedDay + direction;
      if (newDay < 1) newDay = daysInMonth;
      if (newDay > daysInMonth) newDay = 1;
      setSelectedDay(newDay);
    } else if (type === 'year') {
      let newYear = selectedYear + direction;
      if (newYear < 1920) newYear = currentYear;
      if (newYear > currentYear) newYear = 1920;
      setSelectedYear(newYear);
    }
  };

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

      {/* Loading Overlay for Edit Mode */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ca9ad6" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Animated.View style={[styles.header, createSlideStyle(headerAnim)]}>
          <Text style={styles.title}>{isEditMode ? 'Edit Profile' : 'Complete Your Profile'}</Text>
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
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShowDatePicker(true)}
          >
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
                <Text style={[
                  styles.avatarLabel,
                  selectedAvatar === avatar.id && styles.avatarLabelSelected,
                ]}>
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
            onPress={() => isEditMode ? navigation.goBack() : navigation.replace('Main')}
          >
            <Text style={styles.skipText}>{isEditMode ? 'Cancel' : 'Skip for now'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Your Birthday</Text>

            <View style={styles.pickerContainer}>
              {/* Month Picker */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Month</Text>
                <WheelPicker
                  data={months}
                  selectedIndex={selectedMonth}
                  onSelect={setSelectedMonth}
                  renderItem={(item) => item.slice(0, 3)}
                  keyExtractor={(item, index) => `month-${index}`}
                />
              </View>

              {/* Day Picker */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Day</Text>
                <WheelPicker
                  data={Array.from({ length: daysInMonth }, (_, i) => i + 1)}
                  selectedIndex={selectedDay - 1}
                  onSelect={(index) => setSelectedDay(index + 1)}
                  keyExtractor={(item) => `day-${item}`}
                />
              </View>

              {/* Year Picker */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Year</Text>
                <WheelPicker
                  data={years}
                  selectedIndex={years.indexOf(selectedYear)}
                  onSelect={(index) => setSelectedYear(years[index])}
                  keyExtractor={(item) => `year-${item}`}
                />
              </View>
            </View>

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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
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
    fontSize: 28,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
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
    fontSize: 16,
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
    fontSize: 16,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  dateText: {
    flex: 1,
    fontSize: 16,
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
    fontSize: 14,
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
    fontSize: 32,
    marginBottom: 6,
  },
  avatarLabel: {
    fontSize: 12,
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
    fontSize: 18,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
  },
  skipButton: {
    marginTop: 20,
    padding: 10,
  },
  skipText: {
    fontSize: 15,
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
    fontSize: 20,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    textAlign: 'center',
    marginBottom: 24,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  pickerColumn: {
    alignItems: 'center',
    flex: 1,
  },
  pickerLabel: {
    fontSize: 12,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginBottom: 12,
    textTransform: 'uppercase',
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
    fontSize: 18,
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
    fontSize: 16,
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
    fontSize: 16,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
  },
  // Wheel Picker Styles
  wheelPickerContainer: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    overflow: 'hidden',
    position: 'relative',
  },
  wheelPickerList: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
  },
  wheelPickerContent: {
    paddingVertical: 0,
  },
  wheelPickerHighlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: '#fbe5f5',
    borderRadius: 12,
    zIndex: -1,
  },
  wheelPickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  wheelPickerItemSelected: {
    // Selected state handled by highlight background
  },
  wheelPickerItemText: {
    fontSize: 16,
    fontFamily: 'Handlee_400Regular',
    color: '#999',
  },
  wheelPickerItemTextSelected: {
    fontSize: 18,
    color: '#330c54',
    fontWeight: '500',
  },
});

export default ProfileSetupScreen;
