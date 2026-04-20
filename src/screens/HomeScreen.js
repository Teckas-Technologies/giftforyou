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
import { GradientText, UsersIcon, CalendarIcon, GiftIcon } from '../components';

// Mock data
const upcomingBirthdays = [
  {
    id: '1',
    name: 'Claude',
    relation: 'Girlfriend',
    date: '24. March',
    badge: 'tomorrow',
    badgeType: 'tomorrow',
    initials: 'C',
    avatarType: 'pink',
  },
  {
    id: '2',
    name: 'Susanne',
    relation: 'Friend',
    date: '25. March',
    badge: 'in 2 days',
    badgeType: 'soon',
    initials: 'SU',
    avatarType: 'blue',
  },
  {
    id: '3',
    name: 'Caroline',
    relation: 'Sister',
    date: '27. March',
    badge: 'in 4 days',
    badgeType: 'soon',
    initials: 'CA',
    avatarType: 'pink',
  },
];

const stats = [
  { iconType: 'users', value: '12', label: 'Contacts' },
  { iconType: 'calendar', value: '3', label: 'This month' },
  { iconType: 'gift', value: '5', label: 'Gift ideas' },
];

const HomeScreen = ({ navigation }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>HOME</Text>
          <Text style={styles.greeting}>{getGreeting()}, Anna!</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {stats.map((stat, index) => {
            const renderIcon = () => {
              switch (stat.iconType) {
                case 'users':
                  return <UsersIcon size={18} color={colors.primary} />;
                case 'calendar':
                  return <CalendarIcon size={18} color={colors.secondary} />;
                case 'gift':
                  return <GiftIcon size={18} color={colors.primary} />;
                default:
                  return null;
              }
            };
            return (
              <LinearGradient
                key={index}
                colors={index === 1 ? [colors.secondaryLight, colors.primaryLight] : [colors.primaryLight, colors.secondaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}
              >
                <View style={styles.statIcon}>
                  {renderIcon()}
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </LinearGradient>
            );
          })}
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming birthdays</Text>
          <TouchableOpacity>
            <GradientText
              style={styles.seeAll}
              colors={[colors.primary, colors.secondary]}
            >
              See all
            </GradientText>
          </TouchableOpacity>
        </View>

        {/* Birthday Cards */}
        {upcomingBirthdays.map((birthday) => (
          <TouchableOpacity key={birthday.id} style={styles.birthdayCard} activeOpacity={0.8}>
            <View style={[
              styles.birthdayAvatar,
              birthday.avatarType === 'blue' && styles.avatarBlue
            ]}>
              <Text style={[
                styles.avatarInitials,
                birthday.avatarType === 'blue' && styles.initialsBlue
              ]}>{birthday.initials}</Text>
            </View>

            <View style={styles.birthdayInfo}>
              <Text style={styles.birthdayName}>{birthday.name}</Text>
              <Text style={styles.birthdayRelation}>{birthday.relation}</Text>
            </View>

            <View style={styles.birthdayDateInfo}>
              <Text style={styles.birthdayDate}>{birthday.date}</Text>
              <LinearGradient
                colors={birthday.badgeType === 'tomorrow'
                  ? [colors.primaryAccent, colors.secondary]
                  : [colors.primaryLight, colors.secondaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.badge}
              >
                <Text style={[
                  styles.badgeText,
                  { color: birthday.badgeType === 'tomorrow' ? colors.textWhite : colors.primary }
                ]}>{birthday.badge}</Text>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        ))}

        {/* Quick Actions */}
        <View style={styles.quickSection}>
          <Text style={styles.quickTitle}>Quick actions</Text>
          <View style={styles.quickActionsRow}>
            <LinearGradient
              colors={[colors.primaryLight, colors.secondaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quickBtn}
            >
              <TouchableOpacity style={styles.quickBtnInner}>
                <Text style={styles.quickBtnText}>+ Add Contact</Text>
              </TouchableOpacity>
            </LinearGradient>
            <LinearGradient
              colors={[colors.secondaryLight, colors.primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quickBtn}
            >
              <TouchableOpacity style={styles.quickBtnInner}>
                <Text style={[styles.quickBtnText, { color: colors.secondary }]}>🎁 Gift Ideas</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>

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
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  headerLabel: {
    fontFamily: 'Outfit-Light',
    fontSize: 11,
    color: colors.textLight,
    letterSpacing: 2,
    marginBottom: 4,
  },
  greeting: {
    fontFamily: 'Gifted-Regular',
    fontSize: 24,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 28,
  },
  statCard: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 20,
    minWidth: 85,
  },
  statIcon: {
    width: 45,
    height: 45,
    backgroundColor: colors.background,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontFamily: 'Outfit-Medium',
    fontSize: 22,
    color: colors.textPrimary,
    letterSpacing: 0,
  },
  statLabel: {
    fontFamily: 'Outfit-Light',
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: 'Gifted-Regular',
    fontSize: 18,
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  seeAll: {
    fontFamily: 'Outfit-Medium',
    fontSize: 13,
    color: colors.primary,
    letterSpacing: 0.3,
  },
  birthdayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  birthdayAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBlue: {
    backgroundColor: colors.secondaryLight,
  },
  avatarInitials: {
    fontFamily: 'Outfit-Medium',
    fontSize: 14,
    color: colors.primary,
    letterSpacing: 0.3,
  },
  initialsBlue: {
    color: colors.secondary,
  },
  birthdayInfo: {
    flex: 1,
    marginLeft: 12,
  },
  birthdayName: {
    fontFamily: 'Outfit-Regular',
    fontSize: 15,
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  birthdayRelation: {
    fontFamily: 'Outfit-Light',
    fontSize: 12,
    color: colors.textLight,
    letterSpacing: 0.3,
  },
  birthdayDateInfo: {
    alignItems: 'flex-end',
  },
  birthdayDate: {
    fontFamily: 'Outfit-Light',
    fontSize: 13,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  badgeText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  quickSection: {
    marginTop: 20,
  },
  quickTitle: {
    fontFamily: 'Gifted-Regular',
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickBtn: {
    flex: 1,
    borderRadius: 14,
  },
  quickBtnInner: {
    padding: 12,
    alignItems: 'center',
  },
  quickBtnText: {
    fontFamily: 'Outfit-Regular',
    fontSize: 13,
    color: colors.primary,
    letterSpacing: 0.5,
  },
});

export default HomeScreen;
