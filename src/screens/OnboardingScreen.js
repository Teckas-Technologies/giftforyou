import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: '1',
    icon: 'clipboard-outline',
    title: 'Know What They\nReally Want',
    description: 'Send questionnaires to friends and family to discover their true gift preferences.',
    boxColors: ['#E07B5C', '#D06A4C'],
    lidColors: ['#E8856A', '#D57050'],
    ribbonColor: '#C4956A',
  },
  {
    id: '2',
    icon: 'people-outline',
    title: 'Build Your\nGift Circle',
    description: "Organize your loved ones into circles and keep track of everyone's special moments.",
    boxColors: ['#6B7FD7', '#5A6EC6'],
    lidColors: ['#7589E1', '#6478D0'],
    ribbonColor: '#A8B4E8',
  },
  {
    id: '3',
    icon: 'calendar-outline',
    title: 'Never Miss\nA Moment',
    description: 'Get smart reminders for birthdays, weddings, and all the important dates.',
    boxColors: ['#4CAF78', '#3D9E69'],
    lidColors: ['#5CBF88', '#4DAE79'],
    ribbonColor: '#8ED4A8',
  },
  {
    id: '4',
    icon: 'gift-outline',
    title: 'Give Perfect\nGifts, Every Time',
    description: 'Access wishlists, registries, and personalized gift ideas based on their preferences.',
    boxColors: ['#F5A623', '#E69612'],
    lidColors: ['#FFB633', '#F5A623'],
    ribbonColor: '#FFD580',
  },
];

const GiftBox = ({ item, isActive }) => {
  const lidRotate = useRef(new Animated.Value(0)).current;
  const bowTranslateY = useRef(new Animated.Value(0)).current;
  const bowScale = useRef(new Animated.Value(1)).current;
  const bowRotate = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(30)).current;
  const contentScale = useRef(new Animated.Value(0.5)).current;
  const iconFloat = useRef(new Animated.Value(0)).current;
  const sparkle1 = useRef(new Animated.Value(0)).current;
  const sparkle2 = useRef(new Animated.Value(0)).current;
  const sparkle3 = useRef(new Animated.Value(0)).current;
  const sparkle4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      // Reset animations
      lidRotate.setValue(0);
      bowTranslateY.setValue(0);
      bowScale.setValue(1);
      bowRotate.setValue(0);
      contentOpacity.setValue(0);
      contentTranslateY.setValue(30);
      contentScale.setValue(0.5);

      // Lid opening animation
      Animated.timing(lidRotate, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }).start();

      // Bow bounce animation
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.spring(bowTranslateY, {
            toValue: -45,
            friction: 4,
            tension: 60,
            useNativeDriver: true,
          }),
          Animated.spring(bowScale, {
            toValue: 1.15,
            friction: 4,
            tension: 60,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(bowRotate, {
              toValue: -10,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(bowRotate, {
              toValue: 5,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(bowRotate, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();

      // Content reveal animation
      Animated.sequence([
        Animated.delay(500),
        Animated.parallel([
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(contentTranslateY, {
            toValue: -90,
            friction: 6,
            tension: 50,
            useNativeDriver: true,
          }),
          Animated.spring(contentScale, {
            toValue: 1,
            friction: 5,
            tension: 60,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Icon floating animation (continuous)
      Animated.loop(
        Animated.sequence([
          Animated.timing(iconFloat, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(iconFloat, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Sparkle animations
      const sparkleAnim = (anim, delay) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        );
      };

      sparkleAnim(sparkle1, 800).start();
      sparkleAnim(sparkle2, 1000).start();
      sparkleAnim(sparkle3, 1200).start();
      sparkleAnim(sparkle4, 1400).start();
    }
  }, [isActive]);

  const lidRotateInterpolate = lidRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-115deg'],
  });

  const bowRotateInterpolate = bowRotate.interpolate({
    inputRange: [-10, 0, 5],
    outputRange: ['-10deg', '0deg', '5deg'],
  });

  const iconFloatInterpolate = iconFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  const iconRotateInterpolate = iconFloat.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '5deg', '0deg'],
  });

  return (
    <View style={styles.giftBoxContainer}>
      {/* Sparkles */}
      <Animated.Text
        style={[
          styles.sparkle,
          { top: -25, left: -35 },
          {
            opacity: sparkle1,
            transform: [{ scale: sparkle1 }],
          },
        ]}
      >
        ✨
      </Animated.Text>
      <Animated.Text
        style={[
          styles.sparkle,
          { top: -5, right: -40 },
          {
            opacity: sparkle2,
            transform: [{ scale: sparkle2 }],
          },
        ]}
      >
        ✨
      </Animated.Text>
      <Animated.Text
        style={[
          styles.sparkle,
          { bottom: 35, left: -30 },
          {
            opacity: sparkle3,
            transform: [{ scale: sparkle3 }],
          },
        ]}
      >
        ✨
      </Animated.Text>
      <Animated.Text
        style={[
          styles.sparkle,
          { bottom: 20, right: -35 },
          {
            opacity: sparkle4,
            transform: [{ scale: sparkle4 }],
          },
        ]}
      >
        ✨
      </Animated.Text>

      {/* Gift Box Body */}
      <LinearGradient
        colors={item.boxColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.giftBoxBody}
      >
        {/* Ribbons */}
        <View style={[styles.ribbonV, { backgroundColor: item.ribbonColor }]} />
        <View style={[styles.ribbonH, { backgroundColor: item.ribbonColor }]} />
      </LinearGradient>

      {/* Gift Lid */}
      <Animated.View
        style={[
          styles.giftLidContainer,
          {
            transform: [
              { perspective: 800 },
              { rotateX: lidRotateInterpolate },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={item.lidColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.giftLid}
        />
        {/* Bow */}
        <Animated.Text
          style={[
            styles.bow,
            {
              transform: [
                { translateY: bowTranslateY },
                { scale: bowScale },
                { rotate: bowRotateInterpolate },
              ],
            },
          ]}
        >
          🎀
        </Animated.Text>
      </Animated.View>

      {/* Content Icon */}
      <Animated.View
        style={[
          styles.contentIcon,
          {
            opacity: contentOpacity,
            transform: [
              { translateY: Animated.add(contentTranslateY, iconFloatInterpolate) },
              { scale: contentScale },
              { rotate: iconRotateInterpolate },
            ],
          },
        ]}
      >
        <Ionicons name={item.icon} size={65} color={item.boxColors[0]} />
      </Animated.View>
    </View>
  );
};

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  // Text animations for each slide
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(25)).current;
  const descOpacity = useRef(new Animated.Value(0)).current;
  const descSlide = useRef(new Animated.Value(20)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    // Reset text animations
    titleOpacity.setValue(0);
    titleSlide.setValue(25);
    descOpacity.setValue(0);
    descSlide.setValue(20);
    buttonOpacity.setValue(0);
    buttonSlide.setValue(20);

    // Animate text in
    Animated.sequence([
      Animated.delay(900),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(titleSlide, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(descOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(descSlide, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(buttonSlide, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [currentIndex]);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.replace('Login');
    }
  };

  const skipToLogin = () => {
    navigation.replace('Login');
  };

  const renderItem = ({ item, index }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.slideContent}>
          <GiftBox item={item} isActive={currentIndex === index} />

          <Animated.Text
            style={[
              styles.title,
              {
                opacity: currentIndex === index ? titleOpacity : 0,
                transform: [{ translateY: currentIndex === index ? titleSlide : 25 }],
              },
            ]}
          >
            {item.title}
          </Animated.Text>

          <Animated.Text
            style={[
              styles.description,
              {
                opacity: currentIndex === index ? descOpacity : 0,
                transform: [{ translateY: currentIndex === index ? descSlide : 20 }],
              },
            ]}
          >
            {item.description}
          </Animated.Text>
        </View>
      </View>
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {onboardingData.map((item, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 30, 8],
            extrapolate: 'clamp',
          });

          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity: dotOpacity,
                  backgroundColor: onboardingData[currentIndex].boxColors[0],
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const currentColors = onboardingData[currentIndex].boxColors;

  return (
    <Animated.View style={[styles.container, { opacity: fadeIn }]}>
      {/* Skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={skipToLogin}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
      />

      {/* Bottom section */}
      <View style={styles.bottomContainer}>
        {renderPagination()}

        <Animated.View
          style={{
            opacity: buttonOpacity,
            transform: [{ translateY: buttonSlide }],
          }}
        >
          <TouchableOpacity onPress={scrollToNext} activeOpacity={0.9}>
            <LinearGradient
              colors={currentColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>
                {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <View style={styles.buttonIcon}>
                <Ionicons name="arrow-forward" size={20} color={currentColors[0]} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF8F3',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  skipText: {
    fontSize: 15,
    color: '#888',
    fontWeight: '600',
  },
  slide: {
    width,
    flex: 1,
  },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  giftBoxContainer: {
    width: 160,
    height: 160,
    position: 'relative',
    marginBottom: 100,
  },
  giftBoxBody: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 15,
  },
  ribbonV: {
    position: 'absolute',
    width: 24,
    height: '100%',
    left: '50%',
    marginLeft: -12,
    borderRadius: 4,
  },
  ribbonH: {
    position: 'absolute',
    width: '100%',
    height: 24,
    top: '50%',
    marginTop: -12,
    borderRadius: 4,
  },
  giftLidContainer: {
    position: 'absolute',
    top: -14,
    left: -6,
    width: 172,
    height: 50,
    transformOrigin: 'bottom center',
  },
  giftLid: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  bow: {
    position: 'absolute',
    top: -35,
    left: '50%',
    marginLeft: -30,
    fontSize: 60,
  },
  contentIcon: {
    position: 'absolute',
    top: 30,
    left: '50%',
    marginLeft: -32,
    backgroundColor: 'white',
    width: 90,
    height: 90,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#3D3D3D',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  bottomContainer: {
    paddingHorizontal: 28,
    paddingBottom: 50,
    backgroundColor: 'transparent',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 18,
    gap: 12,
    shadowColor: '#E07B5C',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  buttonIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default OnboardingScreen;
