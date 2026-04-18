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

// Mock data
const circles = [
  {
    id: '1',
    name: 'Family',
    emoji: '👨‍👩‍👧',
    members: ['M', 'D', 'S'],
    extraCount: 5,
    memberColors: ['#E07B5C', '#5B7FD7', '#4CAF78'],
  },
  {
    id: '2',
    name: 'Work Friends',
    emoji: '💼',
    members: ['J', 'A'],
    extraCount: 3,
    memberColors: ['#E6A756', '#5B7FD7'],
  },
  {
    id: '3',
    name: 'College Buddies',
    emoji: '🎓',
    members: ['R'],
    extraCount: 2,
    memberColors: ['#4CAF78'],
  },
];

const CirclesScreen = () => {
  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(circles.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.stagger(120, cardAnims.map(anim =>
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

  const renderCircleCard = (circle, index) => (
    <Animated.View
      key={circle.id}
      style={[styles.circleCard, createFadeStyle(cardAnims[index])]}
    >
      <TouchableOpacity style={styles.circleCardInner} activeOpacity={0.8}>
        {/* Header */}
        <View style={styles.circleTop}>
          <View style={styles.circleEmoji}>
            <Text style={styles.emojiText}>{circle.emoji}</Text>
          </View>
          <Text style={styles.circleName}>{circle.name}</Text>
          <Text style={styles.memberCount}>
            {circle.members.length + circle.extraCount} members
          </Text>
        </View>

        {/* Member Avatars */}
        <View style={styles.avatarsRow}>
          {circle.members.map((initial, idx) => (
            <LinearGradient
              key={idx}
              colors={[circle.memberColors[idx], circle.memberColors[idx]]}
              style={[
                styles.memberAvatar,
                { marginLeft: idx > 0 ? -10 : 0, zIndex: 5 - idx }
              ]}
            >
              <Text style={styles.avatarInitial}>{initial}</Text>
            </LinearGradient>
          ))}
          {circle.extraCount > 0 && (
            <View style={[styles.memberAvatar, styles.moreAvatar, { marginLeft: -10 }]}>
              <Text style={styles.moreText}>+{circle.extraCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, createFadeStyle(headerAnim)]}>
        <Text style={styles.headerTitle}>My Circles</Text>
        <TouchableOpacity activeOpacity={0.9}>
          <LinearGradient
            colors={['#E07B5C', '#D06A4C']}
            style={styles.addBtn}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Circle Cards */}
        {circles.map((circle, index) => renderCircleCard(circle, index))}

        {/* Create New Circle */}
        <TouchableOpacity style={styles.createCard} activeOpacity={0.8}>
          <View style={styles.createIcon}>
            <Ionicons name="add" size={24} color="#E07B5C" />
          </View>
          <Text style={styles.createText}>Create New Circle</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E07B5C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  circleCard: {
    marginBottom: 14,
  },
  circleCardInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  circleTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  circleEmoji: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FDF8F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  emojiText: {
    fontSize: 22,
  },
  circleName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  memberCount: {
    fontSize: 13,
    color: '#888888',
  },
  avatarsRow: {
    flexDirection: 'row',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarInitial: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  moreAvatar: {
    backgroundColor: '#F5F0EB',
  },
  moreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888888',
  },
  createCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#F0EBE6',
    borderStyle: 'dashed',
    gap: 12,
  },
  createIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FEF3F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E07B5C',
  },
});

export default CirclesScreen;
