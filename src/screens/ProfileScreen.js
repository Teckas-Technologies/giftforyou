import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

const menuItems = [
  {
    id: '1',
    icon: 'settings-outline',
    title: 'Settings',
    subtitle: 'Preferences & account',
    color: '#E07B5C',
    bgColor: '#FEF3F0',
  },
  {
    id: '2',
    icon: 'notifications-outline',
    title: 'Notifications',
    subtitle: 'Reminders & alerts',
    color: '#5B7FD7',
    bgColor: '#F0F4FE',
  },
  {
    id: '3',
    icon: 'help-circle-outline',
    title: 'Help & Support',
    subtitle: 'FAQs & contact us',
    color: '#4CAF78',
    bgColor: '#F0FBF5',
  },
];

const ProfileScreen = () => {
  // Animation values
  const avatarAnim = useRef(new Animated.Value(0)).current;
  const nameAnim = useRef(new Animated.Value(0)).current;
  const statsAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const menuAnims = useRef(menuItems.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(avatarAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(nameAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.stagger(100, statsAnims.map(anim =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      )),
      Animated.stagger(80, menuAnims.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        })
      )),
    ]).start();
  }, []);

  const createFadeStyle = (anim) => ({
    opacity: anim,
    transform: [{
      translateY: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [15, 0],
      }),
    }],
  });

  const createSlideStyle = (anim) => ({
    opacity: anim,
    transform: [{
      translateX: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [-15, 0],
      }),
    }],
  });

  return (
    <View style={styles.container}>
      {/* Background Glow */}
      <View style={styles.backgroundGlow} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Top */}
        <View style={styles.profileTop}>
          <Animated.View style={[
            styles.avatarContainer,
            {
              opacity: avatarAnim,
              transform: [{
                scale: avatarAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              }],
            },
          ]}>
            <LinearGradient
              colors={['#E07B5C', '#D06A4C']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>SJ</Text>
            </LinearGradient>
          </Animated.View>

          <Animated.Text style={[styles.profileName, createFadeStyle(nameAnim)]}>
            Sarah Johnson
          </Animated.Text>
          <Animated.Text style={[styles.profileEmail, createFadeStyle(nameAnim)]}>
            sarah@example.com
          </Animated.Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <Animated.View style={[styles.statBox, createFadeStyle(statsAnims[0])]}>
            <Text style={[styles.statNum, { color: '#6B7FD7' }]}>48</Text>
            <Text style={styles.statLabel}>Contacts</Text>
          </Animated.View>
          <Animated.View style={[styles.statBox, createFadeStyle(statsAnims[1])]}>
            <Text style={[styles.statNum, { color: '#4CAF78' }]}>23</Text>
            <Text style={styles.statLabel}>Gifts</Text>
          </Animated.View>
          <Animated.View style={[styles.statBox, createFadeStyle(statsAnims[2])]}>
            <Text style={[styles.statNum, { color: '#E6A756' }]}>5</Text>
            <Text style={styles.statLabel}>Circles</Text>
          </Animated.View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <Animated.View
              key={item.id}
              style={[styles.menuItem, createSlideStyle(menuAnims[index])]}
            >
              <TouchableOpacity style={styles.menuItemInner} activeOpacity={0.8}>
                <View style={[styles.menuIcon, { backgroundColor: item.bgColor }]}>
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <View style={styles.menuInfo}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#CCCCCC" />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#E07B5C" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundGlow: {
    position: 'absolute',
    top: 20,
    left: '50%',
    marginLeft: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(224, 123, 92, 0.1)',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  profileTop: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarContainer: {
    marginBottom: 18,
    shadowColor: '#E07B5C',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.35,
    shadowRadius: 25,
    elevation: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 15,
    color: '#888888',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  statNum: {
    fontSize: 26,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
  },
  menuSection: {
    marginBottom: 20,
  },
  menuItem: {
    marginBottom: 10,
  },
  menuItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  menuIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#888888',
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#FEF3F0',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E07B5C',
  },
});

export default ProfileScreen;
