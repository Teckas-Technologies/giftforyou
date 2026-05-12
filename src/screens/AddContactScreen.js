import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Path, Circle, Line, Polyline } from 'react-native-svg';
import { addToCircle, updateCircle } from '../services/api';
import { CustomAlert } from '../components';
import useAlert from '../hooks/useAlert';

// Icons
const BackIcon = ({ size = 24, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

const UserIcon = ({ size = 20, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

const MailIcon = ({ size = 20, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <Polyline points="22,6 12,13 2,6" />
  </Svg>
);

const CalendarIcon = ({ size = 20, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
    <Line x1="16" y1="2" x2="16" y2="6" />
    <Line x1="8" y1="2" x2="8" y2="6" />
    <Line x1="3" y1="10" x2="21" y2="10" />
  </Svg>
);

const HeartIcon = ({ size = 20, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Svg>
);

const EditIcon = ({ size = 20, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Svg>
);

const CheckIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="20 6 9 17 4 12" />
  </Svg>
);

const XIcon = ({ size = 24, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="18" y1="6" x2="6" y2="18" />
    <Line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
);

const relationshipTypes = [
  { id: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
  { id: 'friend', label: 'Friend', emoji: '👫' },
  { id: 'colleague', label: 'Colleague', emoji: '💼' },
  { id: 'partner', label: 'Partner', emoji: '❤️' },
  { id: 'other', label: 'Other', emoji: '👤' },
];

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate();
};

// Wheel picker constants
const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

// WheelPicker Component for smooth scrolling date selection
const WheelPicker = ({ data, selectedIndex, onSelect, renderItem, keyExtractor }) => {
  const flatListRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    if (flatListRef.current && !isScrolling && selectedIndex >= 0) {
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

  const handleScrollBeginDrag = useCallback(() => {
    setIsScrolling(true);
  }, []);

  // Add empty items at start and end for padding
  const paddedData = [
    { id: 'pad-start-1', empty: true },
    { id: 'pad-start-2', empty: true },
    ...data.map((item, index) => ({ value: item, id: keyExtractor ? keyExtractor(item) : `item-${index}` })),
    { id: 'pad-end-1', empty: true },
    { id: 'pad-end-2', empty: true },
  ];

  const renderWheelItem = useCallback(({ item, index }) => {
    if (item.empty) {
      return <View style={{ height: ITEM_HEIGHT }} />;
    }

    const actualIndex = index - 2; // Adjust for padding items
    const isSelected = actualIndex === selectedIndex;

    return (
      <TouchableOpacity
        style={[
          wheelStyles.wheelItem,
          isSelected && wheelStyles.wheelItemSelected,
        ]}
        onPress={() => {
          onSelect(actualIndex);
          flatListRef.current?.scrollToOffset({
            offset: actualIndex * ITEM_HEIGHT,
            animated: true,
          });
        }}
        activeOpacity={0.7}
      >
        <Text style={[
          wheelStyles.wheelItemText,
          isSelected && wheelStyles.wheelItemTextSelected,
        ]}>
          {renderItem ? renderItem(item.value) : item.value}
        </Text>
      </TouchableOpacity>
    );
  }, [selectedIndex, onSelect, renderItem]);

  return (
    <View style={wheelStyles.wheelContainer}>
      <View style={wheelStyles.selectionIndicator} />
      <FlatList
        ref={flatListRef}
        data={paddedData}
        renderItem={renderWheelItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollBeginDrag={handleScrollBeginDrag}
        getItemLayout={(data, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}
        contentContainerStyle={{ paddingVertical: 0 }}
      />
    </View>
  );
};

const AddContactScreen = ({ navigation, route }) => {
  // Check if editing existing contact
  const editContact = route?.params?.contact;
  const isEditMode = !!editContact;

  const [name, setName] = useState(editContact?.name || '');
  const [email, setEmail] = useState(editContact?.email || '');
  const [birthday, setBirthday] = useState(editContact?.birthday ? new Date(editContact.birthday) : null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(editContact?.birthday ? new Date(editContact.birthday).getMonth() : new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(editContact?.birthday ? new Date(editContact.birthday).getDate() : new Date().getDate());
  const [selectedYear, setSelectedYear] = useState(editContact?.birthday ? new Date(editContact.birthday).getFullYear() : new Date().getFullYear());
  const [relationship, setRelationship] = useState(editContact?.relationship?.toLowerCase() || 'friend');
  const [nickname, setNickname] = useState(editContact?.nickname || '');
  const [notes, setNotes] = useState(editContact?.notes || '');
  const [saving, setSaving] = useState(false);

  // Custom alert hook
  const { alertConfig, showSuccess, showError, hideAlert } = useAlert();

  // Focus states for inputs
  const [focusedInput, setFocusedInput] = useState(null);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const saveButtonAnim = useRef(new Animated.Value(0)).current;
  const inputAnims = useRef([...Array(6)].map(() => new Animated.Value(0))).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.stagger(60, inputAnims.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        })
      )),
      Animated.spring(saveButtonAnim, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const openDatePicker = () => {
    setShowDatePicker(true);
    Animated.spring(modalAnim, {
      toValue: 1,
      friction: 8,
      tension: 65,
      useNativeDriver: true,
    }).start();
  };

  const closeDatePicker = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowDatePicker(false));
  };

  const confirmDate = () => {
    const date = new Date(selectedYear, selectedMonth, selectedDay);
    setBirthday(date);
    closeDatePicker();
  };

  const formatDate = (date) => {
    if (!date) return 'Select birthday';
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Format relationship for API
      const relationshipMap = {
        'family': 'Family',
        'friend': 'Friend',
        'colleague': 'Colleague',
        'partner': 'Partner',
        'other': 'Other',
      };

      // Format birthday in local timezone
      let formattedBirthday;
      if (birthday) {
        const year = birthday.getFullYear();
        const month = String(birthday.getMonth() + 1).padStart(2, '0');
        const day = String(birthday.getDate()).padStart(2, '0');
        formattedBirthday = `${year}-${month}-${day}`;
      }

      if (isEditMode) {
        // Update existing contact
        const updateData = {
          relationship: relationshipMap[relationship] || 'Friend',
          nickname: nickname.trim() || undefined,
          notes: notes.trim() || undefined,
          guestBirthday: formattedBirthday,
        };

        await updateCircle(editContact.id, updateData);
        showSuccess('Contact updated successfully!', () => navigation.goBack());
      } else {
        // Add new contact
        const contactData = {
          guestName: name.trim(),
          guestEmail: email.trim(),
          relationship: relationshipMap[relationship] || 'Friend',
          nickname: nickname.trim() || undefined,
          notes: notes.trim() || undefined,
          guestBirthday: formattedBirthday,
        };

        await addToCircle(contactData);
        showSuccess('Contact added successfully!', () => navigation.goBack());
      }
    } catch (error) {
      showError(error.message || `Failed to ${isEditMode ? 'update' : 'add'} contact`);
    } finally {
      setSaving(false);
    }
  };

  const createSlideStyle = (anim) => ({
    opacity: anim,
    transform: [{
      translateY: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0],
      }),
    }],
  });

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValid = name.trim().length > 0 && email.trim().length > 0 && isValidEmail(email);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const days = Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => i + 1);

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

      {/* Header */}
      <Animated.View style={[
        styles.header,
        {
          opacity: headerAnim,
          transform: [{
            translateY: headerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 0],
            }),
          }],
        }
      ]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <BackIcon size={24} color="#6b3a8a" />
        </TouchableOpacity>
        <MaskedView
          maskElement={
            <Text style={styles.headerTitleMask}>{isEditMode ? 'Edit Contact' : 'Add Contact'}</Text>
          }
        >
          <LinearGradient
            colors={['#ca9ad6', '#70d0dd']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[styles.headerTitleMask, { opacity: 0 }]}>{isEditMode ? 'Edit Contact' : 'Add Contact'}</Text>
          </LinearGradient>
        </MaskedView>
        <View style={{ width: 44 }} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[styles.formContainer, { opacity: formAnim }]}>
          {/* Name Input */}
          <Animated.View style={[styles.inputSection, createSlideStyle(inputAnims[0])]}>
            <View style={styles.inputRow}>
              <View style={[styles.iconContainer, focusedInput === 'name' && styles.iconContainerFocused]}>
                <UserIcon size={20} color={focusedInput === 'name' ? '#ca9ad6' : '#6b3a8a'} />
              </View>
              <TextInput
                style={[styles.input, focusedInput === 'name' && styles.inputFocused]}
                placeholder="Full Name *"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          </Animated.View>

          {/* Email Input */}
          <Animated.View style={[styles.inputSection, createSlideStyle(inputAnims[1])]}>
            <View style={styles.inputRow}>
              <View style={[styles.iconContainer, focusedInput === 'email' && styles.iconContainerFocused]}>
                <MailIcon size={20} color={focusedInput === 'email' ? '#ca9ad6' : '#6b3a8a'} />
              </View>
              <TextInput
                style={[styles.input, focusedInput === 'email' && styles.inputFocused]}
                placeholder="Email Address *"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          </Animated.View>

          {/* Birthday Input */}
          <Animated.View style={[styles.inputSection, createSlideStyle(inputAnims[2])]}>
            <TouchableOpacity style={styles.inputRow} onPress={openDatePicker}>
              <View style={styles.iconContainer}>
                <CalendarIcon size={20} color="#6b3a8a" />
              </View>
              <Text style={[styles.dateText, !birthday && styles.datePlaceholder]}>
                {formatDate(birthday)}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Relationship Selector */}
          <Animated.View style={[styles.inputSection, createSlideStyle(inputAnims[3])]}>
            <View style={styles.sectionHeader}>
              <HeartIcon size={18} color="#ca9ad6" />
              <Text style={styles.sectionTitle}>Relationship</Text>
            </View>
            <View style={styles.relationshipGrid}>
              {relationshipTypes.map((type) => {
                const isSelected = relationship === type.id;
                return (
                  <TouchableOpacity
                    key={type.id}
                    style={styles.relationshipOption}
                    onPress={() => setRelationship(type.id)}
                  >
                    <LinearGradient
                      colors={isSelected ? ['#ca9ad6', '#70d0dd'] : ['#f8f9fa', '#f8f9fa']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.relationshipGradient}
                    >
                      <Text style={styles.relationshipEmoji}>{type.emoji}</Text>
                      <Text style={isSelected ? styles.relationshipTextSelected : styles.relationshipText}>
                        {type.label}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>

          {/* Nickname Input */}
          <Animated.View style={[styles.inputSection, createSlideStyle(inputAnims[4])]}>
            <View style={styles.inputRow}>
              <View style={[styles.iconContainer, focusedInput === 'nickname' && styles.iconContainerFocused]}>
                <EditIcon size={20} color={focusedInput === 'nickname' ? '#ca9ad6' : '#6b3a8a'} />
              </View>
              <TextInput
                style={[styles.input, focusedInput === 'nickname' && styles.inputFocused]}
                placeholder="Nickname (optional)"
                placeholderTextColor="#999"
                value={nickname}
                onChangeText={setNickname}
                onFocus={() => setFocusedInput('nickname')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          </Animated.View>

          {/* Notes Input */}
          <Animated.View style={[styles.inputSection, createSlideStyle(inputAnims[5])]}>
            <Text style={styles.notesLabel}>Notes</Text>
            <TextInput
              style={[styles.notesInput, focusedInput === 'notes' && styles.inputFocused]}
              placeholder="Add notes about gift preferences, interests, etc."
              placeholderTextColor="#999"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              onFocus={() => setFocusedInput('notes')}
              onBlur={() => setFocusedInput(null)}
            />
          </Animated.View>

        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Save Button */}
      <Animated.View style={[
        styles.saveButtonContainer,
        {
          opacity: saveButtonAnim,
          transform: [{
            translateY: saveButtonAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          }],
        }
      ]}>
        <TouchableOpacity
          style={[styles.saveButton, (!isValid || saving) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!isValid || saving}
        >
          <LinearGradient
            colors={isValid && !saving ? ['#ca9ad6', '#70d0dd'] : ['#ccc', '#ccc']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveButtonGradient}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <CheckIcon size={22} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>{isEditMode ? 'Update Contact' : 'Save Contact'}</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="none"
        onRequestClose={closeDatePicker}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={closeDatePicker}
            activeOpacity={1}
          />
          <Animated.View style={[
            styles.datePickerContainer,
            {
              opacity: modalAnim,
              transform: [{
                scale: modalAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                }),
              }, {
                translateY: modalAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              }],
            }
          ]}>
            <LinearGradient
              colors={['#FFFFFF', '#fbe5f5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.datePickerContent}
            >
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Select Birthday</Text>
                <TouchableOpacity onPress={closeDatePicker} style={styles.closeButton}>
                  <XIcon size={24} color="#6b3a8a" />
                </TouchableOpacity>
              </View>

              <View style={styles.dateSelectors}>
                {/* Month Selector */}
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Month</Text>
                  <WheelPicker
                    data={months}
                    selectedIndex={selectedMonth}
                    onSelect={(index) => setSelectedMonth(index)}
                    keyExtractor={(item) => `month-${item}`}
                    renderItem={(item) => item.substring(0, 3)}
                  />
                </View>

                {/* Day Selector */}
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Day</Text>
                  <WheelPicker
                    data={days}
                    selectedIndex={days.indexOf(selectedDay)}
                    onSelect={(index) => setSelectedDay(days[index])}
                    keyExtractor={(item) => `day-${item}`}
                  />
                </View>

                {/* Year Selector */}
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

              <TouchableOpacity style={styles.confirmButton} onPress={confirmDate}>
                <LinearGradient
                  colors={['#ca9ad6', '#70d0dd']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.confirmButtonGradient}
                >
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
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
  headerTitleMask: {
    fontSize: 22,
    fontFamily: 'Handlee_400Regular',
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  formContainer: {
    gap: 16,
  },
  inputSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fbe5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconContainerFocused: {
    backgroundColor: '#f4cae8',
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    paddingVertical: 14,
  },
  inputFocused: {
    color: '#330c54',
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    paddingVertical: 14,
  },
  datePlaceholder: {
    color: '#999',
    fontFamily: 'Handlee_400Regular',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  relationshipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 14,
  },
  relationshipOption: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  relationshipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  relationshipEmoji: {
    fontSize: 16,
  },
  relationshipText: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  relationshipTextSelected: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
  },
  notesLabel: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  notesInput: {
    marginHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 50,
    paddingTop: 16,
    backgroundColor: 'transparent',
  },
  saveButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonDisabled: {
    shadowOpacity: 0,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  saveButtonText: {
    fontSize: 17,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  datePickerContainer: {
    width: '100%',
    maxWidth: 400,
  },
  datePickerContent: {
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  datePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  datePickerTitle: {
    fontSize: 20,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(107, 58, 138, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateSelectors: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 12,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  confirmButtonGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
  },
});

// Wheel picker styles
const wheelStyles = StyleSheet.create({
  wheelContainer: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    width: '100%',
  },
  selectionIndicator: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 4,
    right: 4,
    height: ITEM_HEIGHT,
    backgroundColor: '#fbe5f5',
    borderRadius: 10,
    zIndex: 0,
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelItemSelected: {
    // Selection handled by indicator
  },
  wheelItemText: {
    fontSize: 16,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  wheelItemTextSelected: {
    color: '#ca9ad6',
    fontFamily: 'Handlee_400Regular',
  },
});

export default AddContactScreen;
