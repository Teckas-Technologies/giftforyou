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

// Mock data
const circles = [
  {
    id: '1',
    name: 'Family',
    emoji: '👨‍👩‍👧‍👦',
    count: 8,
    bgColor: colors.family,
  },
  {
    id: '2',
    name: 'Friends',
    emoji: '🤝',
    count: 12,
    bgColor: colors.friends,
  },
  {
    id: '3',
    name: 'Work',
    emoji: '💼',
    count: 5,
    bgColor: colors.work,
  },
  {
    id: '4',
    name: 'VIPs',
    emoji: '⭐',
    count: 3,
    bgColor: colors.special,
  },
];

const CirclesScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardAnims = useRef(circles.map(() => new Animated.Value(0))).current;

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

    Animated.stagger(100, cardAnims.map(anim =>
      Animated.spring(anim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    )).start();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <Text style={styles.title}>Your People</Text>
          <Text style={styles.subtitle}>Keep everyone organized</Text>
        </Animated.View>

        {/* Circles Grid */}
        <View style={styles.grid}>
          {circles.map((circle, index) => (
            <Animated.View
              key={circle.id}
              style={[
                styles.cardWrapper,
                {
                  opacity: cardAnims[index],
                  transform: [{
                    scale: cardAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    })
                  }]
                }
              ]}
            >
              <TouchableOpacity style={styles.circleCard} activeOpacity={0.8}>
                <View style={[styles.iconCircle, { backgroundColor: circle.bgColor }]}>
                  <Text style={styles.emoji}>{circle.emoji}</Text>
                </View>
                <Text style={styles.circleName}>{circle.name}</Text>
                <Text style={styles.circleCount}>{circle.count} people</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}

          {/* Add New Circle */}
          <Animated.View
            style={[
              styles.cardWrapper,
              { opacity: fadeAnim }
            ]}
          >
            <TouchableOpacity style={styles.addCard} activeOpacity={0.8}>
              <View style={styles.addIcon}>
                <Ionicons name="add" size={28} color={colors.textLight} />
              </View>
              <Text style={styles.addText}>Add Circle</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Caveat-SemiBold',
    fontSize: 32,
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Nunito-Regular',
    fontSize: 15,
    color: colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  cardWrapper: {
    width: (width - 56) / 2,
  },
  circleCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emoji: {
    fontSize: 30,
  },
  circleName: {
    fontFamily: 'Nunito-Bold',
    fontSize: 17,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  circleCount: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: colors.textLight,
  },
  addCard: {
    backgroundColor: 'transparent',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    minHeight: 160,
    justifyContent: 'center',
  },
  addIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  addText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 15,
    color: colors.textLight,
  },
});

export default CirclesScreen;
