import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  Switch,
  ActivityIndicator,
  Linking,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Path, Circle, Line, Polyline, Rect } from 'react-native-svg';
import { updateSettings, clearUserCredentials } from '../services/api';
import { CustomAlert, GiftBoxIcon, Toast } from '../components';
import useAlert from '../hooks/useAlert';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import APP_CONFIG from '../config/constants';

// Icons
const BackIcon = ({ size = 24, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

const BellIcon = ({ size = 22, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Svg>
);

const LockIcon = ({ size = 22, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);

const UserIcon = ({ size = 22, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);


const HelpCircleIcon = ({ size = 22, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <Line x1="12" y1="17" x2="12.01" y2="17" />
  </Svg>
);

const MessageCircleIcon = ({ size = 22, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </Svg>
);

const StarIcon = ({ size = 22, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);

const ShareIcon = ({ size = 22, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="18" cy="5" r="3" />
    <Circle cx="6" cy="12" r="3" />
    <Circle cx="18" cy="19" r="3" />
    <Line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <Line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </Svg>
);

const LogOutIcon = ({ size = 22, color = '#e53935' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <Polyline points="16 17 21 12 16 7" />
    <Line x1="21" y1="12" x2="9" y2="12" />
  </Svg>
);

const ChevronRightIcon = ({ size = 20, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="9 18 15 12 9 6" />
  </Svg>
);

const SettingsScreen = ({ navigation }) => {
  const { signOut } = useAuth();

  const [notifications, setNotifications] = useState({
    eventReminders: true,
    invitations: true,
    questionnaires: true,
    marketing: false,
  });

  const [toast, setToast] = useState({ visible: false, message: '' });

  const showToast = (message) => {
    setToast({ visible: true, message });
  };

  const hideToast = () => {
    setToast({ visible: false, message: '' });
  };

  // Custom alert hook
  const { alertConfig, showAlert, showSuccess, showError, showConfirm, showOptions, showInfo, hideAlert } = useAlert();

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const sectionAnims = useRef([...Array(4)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.stagger(80, sectionAnims.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        })
      )),
    ]).start();
  }, []);

  const createSlideStyle = (anim) => ({
    opacity: anim,
    transform: [{
      translateY: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0],
      }),
    }],
  });

  const handleLogout = () => {
    showAlert({
      type: 'warning',
      title: 'Log Out',
      message: 'Are you sure you want to log out?',
      buttons: [
        {
          text: 'Cancel',
          onPress: () => {}
        },
        {
          text: 'Log Out',
          onPress: async () => {
            try {
              await clearUserCredentials();
              await signOut();
            } catch (error) {
              console.log('Logout error:', error);
            }
          }
        },
      ],
    });
  };

  const handleNotificationToggle = async (key, value) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    showSuccess('Notification preference updated');
  };

  const handleChangePassword = () => {
    showConfirm(
      'Change Password',
      'We will send a password reset link to your email address.',
      async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.email) {
            const { error } = await supabase.auth.resetPasswordForEmail(user.email);
            if (error) throw error;
            showToast('Password reset link sent to your email!');
          } else {
            showToast('Could not find your email address');
          }
        } catch (error) {
          showToast(error.message || 'Failed to send reset link');
        }
      },
      null,
      'Send Link',
      'Cancel'
    );
  };


  const handleHelpCenter = () => {
    showOptions(
      'Help Center',
      'How can we help you?',
      [
        {
          text: 'FAQs',
          onPress: () => Linking.openURL(APP_CONFIG.faqUrl).catch(() => showError('Could not open link'))
        },
        {
          text: 'Email Support',
          onPress: () => handleContactSupport()
        },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  const handleContactSupport = () => {
    const subject = `${APP_CONFIG.appName} App Support`;
    const body = 'Hi, I need help with...';
    const mailtoUrl = `mailto:${APP_CONFIG.supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.openURL(mailtoUrl).catch(() => {
      showInfo('Contact Support', `Email us at: ${APP_CONFIG.supportEmail}`);
    });
  };

  const handleRateApp = () => {
    showConfirm(
      `Rate ${APP_CONFIG.appName}`,
      'Enjoying the app? Please rate us on the Play Store!',
      () => {
        Linking.openURL(APP_CONFIG.playStoreUrl).catch(() => {
          showSuccess('Thank you for your support!');
        });
      },
      null,
      'Rate Now',
      'Maybe Later'
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${APP_CONFIG.shareMessage} ${APP_CONFIG.downloadUrl}`,
        title: `Share ${APP_CONFIG.appName}`,
      });
    } catch (error) {
      showError('Could not share the app');
    }
  };

  const SettingRow = ({ icon: Icon, iconColor, label, value, onPress, hasToggle, isEnabled, onToggle, isDanger }) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={hasToggle}
    >
      <View style={[styles.settingIconContainer, isDanger && styles.settingIconContainerDanger]}>
        <Icon size={22} color={isDanger ? '#e53935' : (iconColor || '#ca9ad6')} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, isDanger && styles.settingLabelDanger]}>{label}</Text>
        {value && <Text style={styles.settingValue}>{value}</Text>}
      </View>
      {hasToggle ? (
        <Switch
          value={isEnabled}
          onValueChange={onToggle}
          trackColor={{ false: '#e0e0e0', true: '#ccf9ff' }}
          thumbColor={isEnabled ? '#70d0dd' : '#f4f4f4'}
          ios_backgroundColor="#e0e0e0"
        />
      ) : (
        <ChevronRightIcon size={20} color={isDanger ? '#e53935' : '#ca9ad6'} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
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
            <Text style={styles.headerTitleMask}>Settings</Text>
          }
        >
          <LinearGradient
            colors={['#ca9ad6', '#70d0dd']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[styles.headerTitleMask, { opacity: 0 }]}>Settings</Text>
          </LinearGradient>
        </MaskedView>
        <View style={{ width: 44 }} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Account Section */}
        <Animated.View style={[styles.section, createSlideStyle(sectionAnims[0])]}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingRow
            icon={UserIcon}
            label="Edit Profile"
            onPress={() => navigation.navigate('ProfileSetup', { editMode: true })}
          />
          <SettingRow
            icon={LockIcon}
            label="Change Password"
            onPress={handleChangePassword}
          />
        </Animated.View>

        {/* Notifications Section */}
        <Animated.View style={[styles.section, createSlideStyle(sectionAnims[1])]}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <SettingRow
            icon={BellIcon}
            label="Event Reminders"
            hasToggle
            isEnabled={notifications.eventReminders}
            onToggle={(value) => setNotifications(prev => ({ ...prev, eventReminders: value }))}
          />
          <SettingRow
            icon={BellIcon}
            label="Invitation Updates"
            hasToggle
            isEnabled={notifications.invitations}
            onToggle={(value) => setNotifications(prev => ({ ...prev, invitations: value }))}
          />
          <SettingRow
            icon={BellIcon}
            label="Questionnaire Responses"
            hasToggle
            isEnabled={notifications.questionnaires}
            onToggle={(value) => setNotifications(prev => ({ ...prev, questionnaires: value }))}
          />
          <SettingRow
            icon={BellIcon}
            label="Tips & Updates"
            hasToggle
            isEnabled={notifications.marketing}
            onToggle={(value) => setNotifications(prev => ({ ...prev, marketing: value }))}
          />
        </Animated.View>

        {/* Support Section */}
        <Animated.View style={[styles.section, createSlideStyle(sectionAnims[3])]}>
          <Text style={styles.sectionTitle}>Support</Text>
          <SettingRow
            icon={HelpCircleIcon}
            label="Help Center"
            onPress={handleHelpCenter}
          />
          <SettingRow
            icon={MessageCircleIcon}
            label="Contact Support"
            onPress={handleContactSupport}
          />
          <SettingRow
            icon={StarIcon}
            label="Rate App"
            onPress={handleRateApp}
          />
          <SettingRow
            icon={ShareIcon}
            label="Share with Friends"
            onPress={handleShare}
          />
        </Animated.View>

        {/* Danger Zone */}
        <Animated.View style={[styles.section, styles.dangerSection, createSlideStyle(sectionAnims[3])]}>
          <SettingRow
            icon={LogOutIcon}
            label="Log Out"
            onPress={handleLogout}
            isDanger
          />
        </Animated.View>

        {/* App Info */}
        <Animated.View style={[styles.appInfo, { opacity: contentAnim }]}>
          <View style={styles.logoContainer}>
            <GiftBoxIcon size={40} />
          </View>
          <Text style={styles.appName}>{APP_CONFIG.appName}</Text>
          <Text style={styles.appVersion}>Version {APP_CONFIG.version}</Text>
          <Text style={styles.copyright}>Made with love for thoughtful gifters</Text>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Custom Alert */}
      <CustomAlert {...alertConfig} onClose={hideAlert} />

      {/* Toast */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        onHide={hideToast}
      />
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
  headerTitleMask: {
    fontSize: 22,
    fontFamily: 'Handlee_400Regular',
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 6,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  dangerSection: {
    backgroundColor: '#fff5f5',
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    textTransform: 'uppercase',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fbe5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingIconContainerDanger: {
    backgroundColor: '#ffebee',
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  settingLabelDanger: {
    color: '#e53935',
  },
  settingValue: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#999',
    marginTop: 2,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: '#330c54',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#330c54',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  appName: {
    fontSize: 24,
    fontFamily: 'StyleScript_400Regular',
    color: '#330c54',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginBottom: 8,
  },
  copyright: {
    fontSize: 12,
    fontFamily: 'Handlee_400Regular',
    color: '#999',
  },
});

export default SettingsScreen;
