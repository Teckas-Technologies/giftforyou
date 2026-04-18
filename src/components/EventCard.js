import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, shadows } from '../theme';
import Avatar from './Avatar';
import Badge, { getBadgeVariant, formatCountdown } from './Badge';

const EventCard = ({
  name,
  eventType = 'birthday', // birthday, wedding, babyShower, custom
  date,
  daysUntil,
  relationship,
  avatarSource,
  onPress,
  style,
}) => {
  const getEventIcon = () => {
    switch (eventType) {
      case 'wedding':
        return { name: 'heart', color: colors.wedding };
      case 'babyShower':
        return { name: 'balloon', color: colors.babyShower };
      case 'custom':
        return { name: 'star', color: colors.custom };
      default:
        return { name: 'gift', color: colors.birthday };
    }
  };

  const getEventTypeLabel = () => {
    switch (eventType) {
      case 'wedding':
        return 'Wedding';
      case 'babyShower':
        return 'Baby Shower';
      case 'custom':
        return 'Event';
      default:
        return 'Birthday';
    }
  };

  const eventIcon = getEventIcon();

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.leftSection}>
        <View style={styles.avatarContainer}>
          <Avatar name={name} source={avatarSource} size="base" />
          <View
            style={[
              styles.eventIconBadge,
              { backgroundColor: eventIcon.color },
            ]}
          >
            <Ionicons name={eventIcon.name} size={12} color={colors.textWhite} />
          </View>
        </View>
      </View>

      <View style={styles.middleSection}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        {relationship && (
          <Text style={styles.relationship}>{relationship}</Text>
        )}
        <View style={styles.dateRow}>
          <Ionicons
            name="calendar-outline"
            size={12}
            color={colors.textSecondary}
          />
          <Text style={styles.date}>{date}</Text>
          <Text style={styles.eventType}>({getEventTypeLabel()})</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Badge
          text={formatCountdown(daysUntil)}
          variant={getBadgeVariant(daysUntil)}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  leftSection: {
    marginRight: spacing.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  eventIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.backgroundCard,
  },
  middleSection: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  relationship: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  eventType: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 4,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
});

export default EventCard;
