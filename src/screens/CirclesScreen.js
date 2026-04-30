import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Path, Line } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Plus Icon
const PlusIcon = ({ size = 22, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="12" y1="5" x2="12" y2="19" />
    <Line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
);

// Sparkle decoration component
const Sparkle = ({ style, size = 8, color = '#f4cae8' }) => (
  <Animated.View style={[styles.sparkle, style]}>
    <View style={[styles.sparkleInner, { width: size, height: size, backgroundColor: color }]} />
  </Animated.View>
);

// Mock data
const circles = [
  {
    id: '1',
    name: 'Family',
    emoji: '👨‍👩‍👧',
    members: ['M', 'D', 'S'],
    extraCount: 5,
    memberColors: ['#ca9ad6', '#70d0dd', '#f4cae8'],
    colorType: 'pink',
  },
  {
    id: '2',
    name: 'Work Friends',
    emoji: '💼',
    members: ['J', 'A'],
    extraCount: 3,
    memberColors: ['#70d0dd', '#ca9ad6'],
    colorType: 'blue',
  },
  {
    id: '3',
    name: 'College Buddies',
    emoji: '🎓',
    members: ['R', 'K'],
    extraCount: 4,
    memberColors: ['#f4cae8', '#70d0dd'],
    colorType: 'pink',
  },
];

const CirclesScreen = () => {
  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(circles.map(() => new Animated.Value(0))).current;
  const createAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Premium animations
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim1 = useRef(new Animated.Value(0)).current;
  const sparkleAnim2 = useRef(new Animated.Value(0)).current;
  const sparkleAnim3 = useRef(new Animated.Value(0)).current;
  const avatarPulseAnims = useRef(circles.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.stagger(120, cardAnims.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        })
      )),
      Animated.spring(createAnim, {
        toValue: 1,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for add button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Avatar pulse animations
    avatarPulseAnims.forEach((anim, index) => {
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1.08,
              duration: 1000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 1,
              duration: 1000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, index * 300);
    });

    // Sparkle animations
    const createSparkleAnimation = (anim, delay) => {
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 2500,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 2500,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, delay);
    };

    createSparkleAnimation(sparkleAnim1, 0);
    createSparkleAnimation(sparkleAnim2, 800);
    createSparkleAnimation(sparkleAnim3, 1600);
  }, []);

  const createFadeStyle = (anim) => ({
    opacity: anim,
    transform: [{
      translateY: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0],
      }),
    }],
  });

  const createSlideStyle = (anim, index) => ({
    opacity: anim,
    transform: [
      {
        translateX: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [index % 2 === 0 ? -25 : 25, 0],
        }),
      },
      {
        scale: anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.95, 1.02, 1],
        }),
      },
    ],
  });

  const getEmojiBackground = (colorType) => {
    return colorType === 'pink' ? '#fbe5f5' : '#ccf9ff';
  };

  // Sparkle styles
  const sparkle1Style = {
    opacity: sparkleAnim1,
    transform: [
      {
        translateY: floatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -12],
        }),
      },
      {
        rotate: sparkleAnim1.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
      {
        scale: sparkleAnim1.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.8, 1.2, 0.8],
        }),
      },
    ],
  };

  const sparkle2Style = {
    opacity: sparkleAnim2,
    transform: [
      {
        translateY: floatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -15],
        }),
      },
      {
        rotate: sparkleAnim2.interpolate({
          inputRange: [0, 1],
          outputRange: ['45deg', '225deg'],
        }),
      },
      {
        scale: sparkleAnim2.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.6, 1, 0.6],
        }),
      },
    ],
  };

  const sparkle3Style = {
    opacity: sparkleAnim3,
    transform: [
      {
        translateY: floatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -10],
        }),
      },
      {
        rotate: sparkleAnim3.interpolate({
          inputRange: [0, 1],
          outputRange: ['90deg', '270deg'],
        }),
      },
      {
        scale: sparkleAnim3.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 0.7, 1],
        }),
      },
    ],
  };

  const renderCircleCard = (circle, index) => (
    <Animated.View
      key={circle.id}
      style={[styles.circleCard, createSlideStyle(cardAnims[index], index)]}
    >
      <TouchableOpacity style={styles.circleCardInner} activeOpacity={0.8}>
        {/* Header */}
        <View style={styles.circleTop}>
          <Animated.View style={[
            styles.circleEmojiGlow,
            {
              shadowOpacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.2, 0.5],
              }),
              shadowColor: circle.colorType === 'pink' ? '#ca9ad6' : '#70d0dd',
            }
          ]}>
            <LinearGradient
              colors={circle.colorType === 'pink'
                ? ['#fbe5f5', '#f4cae8']
                : ['#ccf9ff', '#a8e6f0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.circleEmoji}
            >
              <Text style={styles.emojiText}>{circle.emoji}</Text>
            </LinearGradient>
          </Animated.View>
          <View style={styles.circleInfo}>
            <Text style={styles.circleName}>{circle.name}</Text>
            <Animated.Text style={[
              styles.memberCount,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              }
            ]}>
              {circle.members.length + circle.extraCount} members
            </Animated.Text>
          </View>
        </View>

        {/* Member Avatars with pulse */}
        <View style={styles.avatarsRow}>
          {circle.members.map((initial, idx) => (
            <Animated.View
              key={idx}
              style={[
                styles.memberAvatarWrapper,
                { marginLeft: idx > 0 ? -10 : 0, zIndex: 5 - idx },
                {
                  transform: [{
                    scale: avatarPulseAnims[index].interpolate({
                      inputRange: [1, 1.08],
                      outputRange: [1, idx === 0 ? 1.05 : 1],
                    }),
                  }],
                }
              ]}
            >
              <LinearGradient
                colors={[circle.memberColors[idx], circle.memberColors[idx]]}
                style={styles.memberAvatar}
              >
                <Text style={styles.avatarInitial}>{initial}</Text>
              </LinearGradient>
            </Animated.View>
          ))}
          {circle.extraCount > 0 && (
            <LinearGradient
              colors={['#fbe5f5', '#f4cae8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.memberAvatar, styles.moreAvatar, { marginLeft: -10 }]}
            >
              <Text style={styles.moreText}>+{circle.extraCount}</Text>
            </LinearGradient>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Background Gradient - Diagonal */}
      <LinearGradient
        colors={['#FFFFFF', '#ccf9ff', '#fbe5f5', '#FFFFFF']}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating Sparkles */}
      <Sparkle style={[{ top: 70, right: 25 }, sparkle1Style]} size={10} color="#f4cae8" />
      <Sparkle style={[{ top: 130, left: 20 }, sparkle2Style]} size={7} color="#70d0dd" />
      <Sparkle style={[{ top: 100, right: 80 }, sparkle3Style]} size={8} color="#ca9ad6" />

      {/* Header */}
      <Animated.View style={[styles.header, createFadeStyle(headerAnim)]}>
        <View style={styles.headerLeft}>
          <MaskedView
            maskElement={
              <Text style={styles.headerTitleMask}>My Circles</Text>
            }
          >
            <LinearGradient
              colors={['#ca9ad6', '#70d0dd']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={[styles.headerTitleMask, { opacity: 0 }]}>My Circles</Text>
            </LinearGradient>
          </MaskedView>
          <Animated.Text style={[
            styles.headerSubtitle,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            }
          ]}>
            {circles.length} circles created
          </Animated.Text>
        </View>
        <Animated.View style={[
          styles.addBtnWrapper,
          {
            transform: [{ scale: pulseAnim }],
          }
        ]}>
          {/* Glow ring */}
          <Animated.View style={[
            styles.addBtnGlowRing,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.7],
              }),
              transform: [{
                scale: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.3],
                }),
              }],
            }
          ]} />
          <TouchableOpacity activeOpacity={0.9}>
            <LinearGradient
              colors={['#f4cae8', '#70d0dd']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addBtn}
            >
              <PlusIcon size={22} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Circle Cards */}
        {circles.map((circle, index) => renderCircleCard(circle, index))}

        {/* Create New Circle */}
        <Animated.View style={[styles.createCardWrapper, createFadeStyle(createAnim)]}>
          <TouchableOpacity style={styles.createCard} activeOpacity={0.8}>
            <LinearGradient
              colors={['#fbe5f5', '#ccf9ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.createIcon}
            >
              <PlusIcon size={24} color="#ca9ad6" />
            </LinearGradient>
            <Text style={styles.createText}>Create New Circle</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  sparkle: {
    position: 'absolute',
    zIndex: 10,
  },
  sparkleInner: {
    borderRadius: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitleMask: {
    fontSize: 26,
    fontFamily: 'Handlee_400Regular',
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginTop: 4,
  },
  addBtnWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnGlowRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#f4cae8',
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  circleCard: {
    marginBottom: 16,
  },
  circleCardInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  circleTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  circleEmojiGlow: {
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
  },
  circleEmoji: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  emojiText: {
    fontSize: 26,
  },
  circleInfo: {
    flex: 1,
  },
  circleName: {
    fontSize: 18,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  memberCount: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginTop: 3,
  },
  avatarsRow: {
    flexDirection: 'row',
  },
  memberAvatarWrapper: {
    borderRadius: 14,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarInitial: {
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
  },
  moreAvatar: {
    // backgroundColor handled by LinearGradient
  },
  moreText: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  createCardWrapper: {
    marginTop: 4,
  },
  createCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    borderWidth: 2,
    borderColor: '#f4e8f7',
    borderStyle: 'dashed',
    gap: 14,
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  createIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  createText: {
    fontSize: 17,
    fontFamily: 'Handlee_400Regular',
    color: '#ca9ad6',
  },
});

export default CirclesScreen;
