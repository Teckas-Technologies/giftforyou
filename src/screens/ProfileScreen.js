import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';
import { GradientText, BellIcon, ClockIcon, DiamondIcon, HelpIcon, UserIcon, ChevronRightIcon } from '../components';

const menuItems = [
  { id: '1', iconType: 'bell', title: 'Notifications', gradientType: 'pinkBlue' },
  { id: '2', iconType: 'clock', title: 'Reminder Settings', gradientType: 'bluePink' },
  { id: '3', iconType: 'diamond', title: 'Premium', gradientType: 'pinkBlue' },
  { id: '4', iconType: 'help', title: 'Help & Support', gradientType: 'bluePink' },
];

const ProfileScreen = ({ navigation }) => {
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
        {/* Profile Card with Stats */}
        <LinearGradient
          colors={[colors.primaryLight, colors.secondaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <LinearGradient
            colors={[colors.primaryAccent, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <UserIcon size={36} color={colors.textWhite} />
          </LinearGradient>
          <Text style={styles.userName}>Anna Johnson</Text>
          <Text style={styles.userEmail}>anna@email.com</Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <GradientText
                style={styles.statValue}
                colors={[colors.primary, colors.secondary]}
              >
                12
              </GradientText>
              <Text style={styles.statLabel}>Contacts</Text>
            </View>
            <View style={styles.statItem}>
              <GradientText
                style={styles.statValue}
                colors={[colors.primary, colors.secondary]}
              >
                8
              </GradientText>
              <Text style={styles.statLabel}>This month</Text>
            </View>
            <View style={styles.statItem}>
              <GradientText
                style={styles.statValue}
                colors={[colors.primary, colors.secondary]}
              >
                5
              </GradientText>
              <Text style={styles.statLabel}>Gift ideas</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => {
            const iconColor = item.gradientType === 'pinkBlue' ? colors.primary : colors.secondary;
            const gradientColors = item.gradientType === 'pinkBlue'
              ? [colors.primaryLight, colors.secondaryLight]
              : [colors.secondaryLight, colors.primaryLight];

            const renderMenuIcon = () => {
              switch (item.iconType) {
                case 'bell':
                  return <BellIcon size={20} color={iconColor} />;
                case 'clock':
                  return <ClockIcon size={20} color={iconColor} />;
                case 'diamond':
                  return <DiamondIcon size={20} color={iconColor} />;
                case 'help':
                  return <HelpIcon size={20} color={iconColor} />;
                default:
                  return null;
              }
            };
            return (
              <TouchableOpacity key={item.id} style={styles.menuItem} activeOpacity={0.8}>
                <LinearGradient
                  colors={gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.menuIcon}
                >
                  {renderMenuIcon()}
                </LinearGradient>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <ChevronRightIcon size={20} color={colors.textLight} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* Bottom spacing for tab bar */}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  profileCard: {
    borderRadius: 24,
    padding: 25,
    alignItems: 'center',
    marginBottom: 25,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 4,
    borderColor: colors.background,
    shadowColor: colors.primaryAccent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 8,
  },
  userName: {
    fontFamily: 'Outfit-Bold',
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontFamily: 'Outfit-Light',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 18,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Outfit-Bold',
    fontSize: 22,
    color: colors.primary,
  },
  statLabel: {
    fontFamily: 'Outfit-Light',
    fontSize: 11,
    color: colors.textLight,
  },
  menuSection: {
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.backgroundGray,
    borderRadius: 16,
    marginBottom: 10,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTitle: {
    flex: 1,
    fontFamily: 'Outfit-Medium',
    fontSize: 15,
    color: colors.textPrimary,
  },
  logoutBtn: {
    backgroundColor: colors.backgroundGray,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 15,
    color: colors.textSecondary,
  },
});

export default ProfileScreen;
