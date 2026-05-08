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
  Platform,
  KeyboardAvoidingView,
  Modal,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Path, Circle, Line, Polyline, Rect } from 'react-native-svg';
import { createEvent, getCircles } from '../services/api';
import { scheduleEventReminder } from '../services/notifications';
import { CustomAlert } from '../components';
import useAlert from '../hooks/useAlert';

// Icons
const BackIcon = ({ size = 24, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

const CalendarIcon = ({ size = 24, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <Line x1="16" y1="2" x2="16" y2="6" />
    <Line x1="8" y1="2" x2="8" y2="6" />
    <Line x1="3" y1="10" x2="21" y2="10" />
  </Svg>
);

const UserIcon = ({ size = 24, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

const BellIcon = ({ size = 24, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Svg>
);

const RepeatIcon = ({ size = 24, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="17 1 21 5 17 9" />
    <Path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <Polyline points="7 23 3 19 7 15" />
    <Path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </Svg>
);

const CheckIcon = ({ size = 20, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="20 6 9 17 4 12" />
  </Svg>
);

const ChevronDownIcon = ({ size = 20, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="6 9 12 15 18 9" />
  </Svg>
);

const XIcon = ({ size = 24, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="18" y1="6" x2="6" y2="18" />
    <Line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
);

// Event types
const eventTypes = [
  { id: 'birthday', label: 'Birthday', emoji: '🎂' },
  { id: 'anniversary', label: 'Anniversary', emoji: '💍' },
  { id: 'holiday', label: 'Holiday', emoji: '🎄' },
  { id: 'graduation', label: 'Graduation', emoji: '🎓' },
  { id: 'wedding', label: 'Wedding', emoji: '💒' },
  { id: 'baby_shower', label: 'Baby Shower', emoji: '👶' },
  { id: 'other', label: 'Other', emoji: '📅' },
];

// Reminder options
const reminderOptions = [
  { id: 'same_day', label: 'On the day', value: 0 },
  { id: '1_day', label: '1 day before', value: 1 },
  { id: '3_days', label: '3 days before', value: 3 },
  { id: '1_week', label: '1 week before', value: 7 },
  { id: '2_weeks', label: '2 weeks before', value: 14 },
  { id: '1_month', label: '1 month before', value: 30 },
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

const AddEventScreen = ({ navigation, route }) => {
  const contact = route?.params?.contact;

  const [eventName, setEventName] = useState('');
  const [selectedType, setSelectedType] = useState('birthday');
  const [eventDate, setEventDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isRecurring, setIsRecurring] = useState(true);
  const [selectedReminders, setSelectedReminders] = useState(['1_week']);
  const [notes, setNotes] = useState('');
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [saving, setSaving] = useState(false);

  // Contact selection
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(contact || null);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Custom alert hook
  const { alertConfig, showSuccess, showError, hideAlert } = useAlert();

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const saveButtonAnim = useRef(new Animated.Value(0)).current;
  const inputAnims = useRef([...Array(6)].map(() => new Animated.Value(0))).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  // Fetch contacts for picker
  const fetchContacts = async () => {
    try {
      setLoadingContacts(true);
      const response = await getCircles();
      const contactsList = response.circles || response.contacts || [];
      const transformedContacts = contactsList.map(c => ({
        id: c.id,
        name: c.member?.name || c.guest_name || c.guestName || c.memberName || 'Unknown',
        memberId: c.member_id || c.memberId || c.member?.id,
      }));
      setContacts(transformedContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoadingContacts(false);
    }
  };

  useEffect(() => {
    fetchContacts();

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
    setEventDate(date);
    closeDatePicker();
  };

  const toggleReminder = (id) => {
    setSelectedReminders(prev =>
      prev.includes(id)
        ? prev.filter(r => r !== id)
        : [...prev, id]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Format event type for API (must match database constraint)
      const eventTypeMap = {
        'birthday': 'birthday',
        'anniversary': 'anniversary',
        'holiday': 'holiday',
        'graduation': 'graduation',
        'wedding': 'wedding',
        'baby_shower': 'baby_shower',
        'other': 'other',
      };

      // Get reminder days from selected reminders
      const reminderDays = selectedReminders.map(id => {
        const option = reminderOptions.find(r => r.id === id);
        return option?.value || 7;
      });

      // Format date in local timezone (avoid UTC conversion issues)
      const year = eventDate.getFullYear();
      const month = String(eventDate.getMonth() + 1).padStart(2, '0');
      const day = String(eventDate.getDate()).padStart(2, '0');

      const eventData = {
        title: eventName,
        eventType: eventTypeMap[selectedType] || 'custom',
        eventDate: `${year}-${month}-${day}`,
        description: notes || undefined,
        isRecurring: isRecurring,
        reminderDays: reminderDays.length > 0 ? reminderDays : [7],
        circleId: selectedContact?.id || undefined,
        contactId: selectedContact?.memberId || undefined,
      };

      const response = await createEvent(eventData);

      // Schedule local notification reminders
      for (const days of reminderDays) {
        await scheduleEventReminder({
          eventId: response?.event?.id || Date.now().toString(),
          eventTitle: eventName,
          eventDate: eventDate,
          daysBefore: days,
        });
      }

      showSuccess('Event created with reminders!', () => navigation.goBack());
    } catch (error) {
      showError(error.message || 'Failed to create event');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
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

  const selectedTypeData = eventTypes.find(t => t.id === selectedType);
  const isValid = eventName.trim().length > 0;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
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
            <Text style={styles.headerTitleMask}>Add Event</Text>
          }
        >
          <LinearGradient
            colors={['#ca9ad6', '#70d0dd']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[styles.headerTitleMask, { opacity: 0 }]}>Add Event</Text>
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
          {/* Event Name */}
          <Animated.View style={[styles.inputSection, createSlideStyle(inputAnims[0])]}>
            <View style={styles.labelContainer}>
              <CalendarIcon size={18} color="#ca9ad6" />
              <Text style={styles.label}>Event Name *</Text>
            </View>
            <TextInput
              style={styles.input}
              value={eventName}
              onChangeText={setEventName}
              placeholder="e.g., Mom's Birthday"
              placeholderTextColor="#999"
            />
          </Animated.View>

          {/* Event Type */}
          <Animated.View style={[styles.inputSection, createSlideStyle(inputAnims[1])]}>
            <View style={styles.labelContainer}>
              <Text style={{ fontSize: 16 }}>{selectedTypeData?.emoji}</Text>
              <Text style={styles.label}>Event Type</Text>
            </View>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowTypeSelector(!showTypeSelector)}
            >
              <Text style={styles.selectorText}>
                {selectedTypeData?.emoji} {selectedTypeData?.label}
              </Text>
              <ChevronDownIcon size={20} color="#6b3a8a" />
            </TouchableOpacity>
            {showTypeSelector && (
              <View style={styles.typeGrid}>
                {eventTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeOption,
                      selectedType === type.id && styles.typeOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedType(type.id);
                      setShowTypeSelector(false);
                    }}
                  >
                    {selectedType === type.id ? (
                      <LinearGradient
                        colors={['#ca9ad6', '#70d0dd']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.typeOptionGradient}
                      >
                        <Text style={styles.typeEmoji}>{type.emoji}</Text>
                        <Text style={styles.typeTextSelected}>{type.label}</Text>
                      </LinearGradient>
                    ) : (
                      <>
                        <Text style={styles.typeEmoji}>{type.emoji}</Text>
                        <Text style={styles.typeText}>{type.label}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Animated.View>

          {/* Date Picker */}
          <Animated.View style={[styles.inputSection, createSlideStyle(inputAnims[2])]}>
            <View style={styles.labelContainer}>
              <CalendarIcon size={18} color="#ca9ad6" />
              <Text style={styles.label}>Event Date</Text>
            </View>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={openDatePicker}
            >
              <LinearGradient
                colors={['#fbe5f5', '#ccf9ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.dateButtonGradient}
              >
                <Text style={styles.dateText}>{formatDate(eventDate)}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Associated Contact */}
          <Animated.View style={[styles.inputSection, createSlideStyle(inputAnims[3])]}>
            <View style={styles.labelContainer}>
              <UserIcon size={18} color="#ca9ad6" />
              <Text style={styles.label}>For Whom? (Contact)</Text>
            </View>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowContactPicker(true)}
            >
              <Text style={[styles.selectorText, !selectedContact && { color: '#999' }]}>
                {selectedContact ? selectedContact.name : 'Select a contact (optional)'}
              </Text>
              <ChevronDownIcon size={20} color="#6b3a8a" />
            </TouchableOpacity>
            {selectedContact && (
              <TouchableOpacity
                style={styles.clearContact}
                onPress={() => setSelectedContact(null)}
              >
                <Text style={styles.clearContactText}>Clear selection</Text>
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* Recurring Toggle */}
          <Animated.View style={[styles.inputSection, createSlideStyle(inputAnims[4])]}>
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setIsRecurring(!isRecurring)}
            >
              <View style={styles.labelContainer}>
                <RepeatIcon size={18} color="#ca9ad6" />
                <Text style={styles.label}>Repeat Every Year</Text>
              </View>
              <View style={[styles.toggle, isRecurring && styles.toggleActive]}>
                {isRecurring && (
                  <LinearGradient
                    colors={['#ca9ad6', '#70d0dd']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.toggleGradient}
                  >
                    <View style={styles.toggleKnob} />
                  </LinearGradient>
                )}
                {!isRecurring && <View style={styles.toggleKnobInactive} />}
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Reminders */}
          <Animated.View style={[styles.inputSection, createSlideStyle(inputAnims[5])]}>
            <View style={styles.labelContainer}>
              <BellIcon size={18} color="#ca9ad6" />
              <Text style={styles.label}>Remind Me</Text>
            </View>
            <View style={styles.reminderGrid}>
              {reminderOptions.map((reminder) => {
                const isSelected = selectedReminders.includes(reminder.id);
                return (
                  <TouchableOpacity
                    key={reminder.id}
                    style={styles.reminderOption}
                    onPress={() => toggleReminder(reminder.id)}
                  >
                    <LinearGradient
                      colors={isSelected ? ['#ca9ad6', '#70d0dd'] : ['#f8f9fa', '#f8f9fa']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.reminderGradient}
                    >
                      <View style={{ width: 14, opacity: isSelected ? 1 : 0 }}>
                        <CheckIcon size={14} color="#FFFFFF" />
                      </View>
                      <Text style={isSelected ? styles.reminderTextSelected : styles.reminderText}>
                        {reminder.label}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>

          {/* Notes */}
          <Animated.View style={[styles.inputSection, createSlideStyle(inputAnims[5])]}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Notes</Text>
            </View>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes or gift ideas..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </Animated.View>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Save Button - Enhanced UI */}
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
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isValid && !saving ? ['#6b3a8a', '#ca9ad6', '#70d0dd'] : ['#ccc', '#ddd', '#ccc']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveButtonGradient}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <View style={styles.saveButtonIconWrapper}>
                  <Text style={styles.saveButtonEmoji}>🎉</Text>
                </View>
                <Text style={styles.saveButtonText}>Create Event</Text>
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
                <Text style={styles.datePickerTitle}>Select Date</Text>
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

      {/* Contact Picker Modal */}
      <Modal
        visible={showContactPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowContactPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setShowContactPicker(false)}
            activeOpacity={1}
          />
          <View style={styles.contactPickerContainer}>
            <LinearGradient
              colors={['#FFFFFF', '#fbe5f5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.contactPickerContent}
            >
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Select Contact</Text>
                <TouchableOpacity onPress={() => setShowContactPicker(false)} style={styles.closeButton}>
                  <XIcon size={24} color="#6b3a8a" />
                </TouchableOpacity>
              </View>

              {loadingContacts ? (
                <View style={styles.contactLoadingContainer}>
                  <ActivityIndicator size="large" color="#ca9ad6" />
                </View>
              ) : contacts.length === 0 ? (
                <View style={styles.contactEmptyContainer}>
                  <Text style={styles.contactEmptyText}>No contacts found</Text>
                  <Text style={styles.contactEmptySubtext}>Add contacts first to link events</Text>
                </View>
              ) : (
                <ScrollView style={styles.contactList} showsVerticalScrollIndicator={false}>
                  {contacts.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.contactItem,
                        selectedContact?.id === c.id && styles.contactItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedContact(c);
                        setShowContactPicker(false);
                      }}
                    >
                      <View style={styles.contactAvatar}>
                        <Text style={styles.contactAvatarText}>
                          {c.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </Text>
                      </View>
                      <Text style={styles.contactName}>{c.name}</Text>
                      {selectedContact?.id === c.id && (
                        <CheckIcon size={20} color="#ca9ad6" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </LinearGradient>
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
    gap: 20,
  },
  inputSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  notesInput: {
    height: 100,
    paddingTop: 14,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectorText: {
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    gap: 6,
  },
  typeOptionSelected: {
    padding: 0,
    overflow: 'hidden',
  },
  typeOptionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  typeEmoji: {
    fontSize: 16,
  },
  typeText: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  typeTextSelected: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
  },
  dateButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  dateButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggle: {
    width: 52,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: 'transparent',
  },
  toggleGradient: {
    flex: 1,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 2,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleKnobInactive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginLeft: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  reminderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reminderOption: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  reminderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  reminderText: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  reminderTextSelected: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
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
    gap: 12,
  },
  saveButtonIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonEmoji: {
    fontSize: 18,
  },
  saveButtonText: {
    fontSize: 18,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
    letterSpacing: 0.5,
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
  // Contact picker styles
  clearContact: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  clearContactText: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#ca9ad6',
  },
  contactPickerContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
  },
  contactPickerContent: {
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  contactLoadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  contactEmptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  contactEmptyText: {
    fontSize: 16,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  contactEmptySubtext: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#999',
    marginTop: 4,
  },
  contactList: {
    maxHeight: 300,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 12,
  },
  contactItemSelected: {
    backgroundColor: '#fbe5f5',
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ca9ad6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactAvatarText: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
  },
  contactName: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
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

export default AddEventScreen;
