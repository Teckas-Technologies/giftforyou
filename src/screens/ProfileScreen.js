import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

const { width } = Dimensions.get('window');

const menuItems = [
  { id: '1', icon: 'settings-outline', title: 'Settings', emoji: '⚙️' },
  { id: '2', icon: 'notifications-outline', title: 'Notifications', emoji: '🔔' },
  { id: '3', icon: 'heart-outline', title: 'Premium', emoji: '💜' },
  { id: '4', icon: 'help-circle-outline', title: 'Help & Support', emoji: '❓' },
];

const ProfileScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardAnims = useRef(menuItems.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.stagger(80, cardAnims.map(anim =>
      Animated.spring(anim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    )).start();
  }, []);

  const handleLogout = () => {
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Card */}
        <Animated.View
          style={[
            styles.headerCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <LinearGradient
            colors={[colors.primaryLight, '#FFD6C8']}
            style={styles.headerGradient}
          >
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.avatar}
              >
                <Text style={styles.avatarEmoji}>👩</Text>
              </LinearGradient>
            </View>

            {/* Name & Email */}
            <Text style={styles.userName}>Sarah Johnson</Text>
            <Text style={styles.userEmail}>sarah@email.com</Text>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>24</Text>
                <Text style={styles.statLabel}>Events</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>15</Text>
                <Text style={styles.statLabel}>Gifts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>4</Text>
                <Text style={styles.statLabel}>Circles</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <Animated.View
              key={item.id}
              style={[
                styles.menuItemWrapper,
                {
                  opacity: cardAnims[index],
                  transform: [{
                    translateX: cardAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    })
                  }]
                }
              ]}
            >
              <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
                <View style={styles.menuIcon}>
                  <Text style={styles.menuEmoji}>{item.emoji}</Text>
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Logout Button */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Version */}
        <Text style={styles.version}>Version 1.0.0</Text>

        {/* Bottom spacing */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  headerCard: {
    marginBottom: 28,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  headerGradient: {
    padding: 28,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  avatarEmoji: {
    fontSize: 45,
  },
  userName: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 24,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 24,
    color: colors.primary,
  },
  statLabel: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 12,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  menuSection: {
    marginBottom: 24,
  },
  menuItemWrapper: {
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  menuIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuEmoji: {
    fontSize: 22,
  },
  menuTitle: {
    flex: 1,
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: colors.textPrimary,
  },
  logoutBtn: {
    backgroundColor: colors.primaryLight,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: colors.primary,
  },
  version: {
    fontFamily: 'Nunito-Regular',
    textAlign: 'center',
    fontSize: 13,
    color: colors.textLight,
  },
});

export default ProfileScreen;
