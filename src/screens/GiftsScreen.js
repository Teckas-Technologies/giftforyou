import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Path, Circle, Line } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Search Icon
const SearchIcon = ({ size = 20, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="11" cy="11" r="8" />
    <Line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Svg>
);

// Heart Icon
const HeartIcon = ({ size = 24, filled = false, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Svg>
);

// Sparkle decoration component
const Sparkle = ({ style, size = 8, color = '#f4cae8' }) => (
  <Animated.View style={[styles.sparkle, style]}>
    <View style={[styles.sparkleInner, { width: size, height: size, backgroundColor: color }]} />
  </Animated.View>
);

const tabs = ['All', 'Saved', 'Purchased'];

const giftItems = [
  {
    id: '1',
    name: 'Wireless Earbuds',
    forPerson: "For Mom's Birthday",
    price: '$79.99',
    emoji: '🎧',
    saved: true,
    colorType: 'blue',
  },
  {
    id: '2',
    name: 'Book Collection',
    forPerson: "For Dad's Birthday",
    price: '$45.00',
    emoji: '📚',
    saved: false,
    colorType: 'pink',
  },
  {
    id: '3',
    name: 'Art Supplies Kit',
    forPerson: 'For Sister',
    price: '$59.99',
    emoji: '🎨',
    saved: true,
    colorType: 'blue',
  },
  {
    id: '4',
    name: 'Spa Gift Set',
    forPerson: 'For Best Friend',
    price: '$35.00',
    emoji: '💆',
    saved: false,
    colorType: 'pink',
  },
];

const GiftsScreen = () => {
  const [activeTab, setActiveTab] = useState('All');

  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const tabsAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(giftItems.map(() => new Animated.Value(0))).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Premium animations
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sparkleAnim1 = useRef(new Animated.Value(0)).current;
  const sparkleAnim2 = useRef(new Animated.Value(0)).current;
  const sparkleAnim3 = useRef(new Animated.Value(0)).current;
  const heartPulseAnims = useRef(giftItems.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(tabsAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.stagger(100, cardAnims.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        })
      )),
    ]).start();

    // Float animation for header icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
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

    // Search button pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Heart pulse animations
    heartPulseAnims.forEach((anim, index) => {
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1.2,
              duration: 800,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 1,
              duration: 800,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, index * 200);
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

  const floatTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
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

  const renderGiftCard = (gift, index) => (
    <Animated.View
      key={gift.id}
      style={[styles.giftCard, createSlideStyle(cardAnims[index], index)]}
    >
      <TouchableOpacity style={styles.giftCardInner} activeOpacity={0.8}>
        {/* Emoji with glow */}
        <Animated.View style={[
          styles.giftImageGlow,
          {
            shadowOpacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.2, 0.5],
            }),
            shadowColor: gift.colorType === 'pink' ? '#ca9ad6' : '#70d0dd',
          }
        ]}>
          <LinearGradient
            colors={gift.colorType === 'pink'
              ? ['#fbe5f5', '#f4cae8']
              : ['#ccf9ff', '#a8e6f0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.giftImage}
          >
            <Text style={styles.giftEmoji}>{gift.emoji}</Text>
          </LinearGradient>
        </Animated.View>

        <View style={styles.giftInfo}>
          <Text style={styles.giftName}>{gift.name}</Text>
          <Text style={styles.giftFor}>{gift.forPerson}</Text>
          <LinearGradient
            colors={gift.colorType === 'pink' ? ['#f4cae8', '#ca9ad6'] : ['#70d0dd', '#5bc0cd']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.priceTag}
          >
            <Text style={styles.priceText}>{gift.price}</Text>
          </LinearGradient>
        </View>

        {/* Heart button with pulse */}
        <Animated.View style={[
          styles.heartBtn,
          {
            transform: [{
              scale: gift.saved ? heartPulseAnims[index] : 1,
            }],
          }
        ]}>
          <TouchableOpacity>
            <HeartIcon
              size={24}
              filled={gift.saved}
              color={gift.saved ? '#ca9ad6' : '#d0d0d0'}
            />
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Background Gradient - Diagonal */}
      <LinearGradient
        colors={['#FFFFFF', '#ccf9ff', '#e0f7fa', '#FFFFFF']}
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
              <Text style={styles.headerTitleMask}>Gift Ideas</Text>
            }
          >
            <LinearGradient
              colors={['#ca9ad6', '#70d0dd']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={[styles.headerTitleMask, { opacity: 0 }]}>Gift Ideas</Text>
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
            {giftItems.length} ideas saved
          </Animated.Text>
        </View>
        <Animated.View style={{
          transform: [
            { translateY: floatTranslateY },
            { scale: pulseAnim },
          ],
        }}>
          <TouchableOpacity activeOpacity={0.8}>
            <LinearGradient
              colors={['#fbe5f5', '#ccf9ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.searchBtn}
            >
              <SearchIcon size={20} color="#6b3a8a" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Tabs */}
        <Animated.View style={[styles.tabsRow, createFadeStyle(tabsAnim)]}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={styles.tab}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              {activeTab === tab ? (
                <Animated.View style={{
                  transform: [{
                    scale: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.02],
                    }),
                  }],
                }}>
                  <LinearGradient
                    colors={['#f4cae8', '#70d0dd']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.activeTabGradient}
                  >
                    <Text style={styles.activeTabText}>{tab}</Text>
                  </LinearGradient>
                </Animated.View>
              ) : (
                <View style={styles.inactiveTab}>
                  <Text style={styles.tabText}>{tab}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Gift Cards */}
        <View style={styles.giftsList}>
          {giftItems.map((gift, index) => renderGiftCard(gift, index))}
        </View>

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
  searchBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  tab: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  activeTabGradient: {
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 14,
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  activeTabText: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
  },
  inactiveTab: {
    paddingHorizontal: 22,
    paddingVertical: 13,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  giftsList: {
    gap: 14,
  },
  giftCard: {
    marginBottom: 0,
  },
  giftCardInner: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  giftImageGlow: {
    borderRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
  },
  giftImage: {
    width: 75,
    height: 75,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftEmoji: {
    fontSize: 36,
  },
  giftInfo: {
    flex: 1,
  },
  giftName: {
    fontSize: 17,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    marginBottom: 3,
  },
  giftFor: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginBottom: 10,
  },
  priceTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  priceText: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
  },
  heartBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GiftsScreen;
