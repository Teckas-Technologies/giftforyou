import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

const HeartIcon = ({ size = 26, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Svg>
);

// Drifts a heart/sparkle emoji upward on a loop, fading in then out —
// ambient background warmth behind the card, like the mockup.
const FloatingHeart = ({ emoji, left, delay }) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, {
          toValue: 1,
          duration: 4500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(progress, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, -220] });
  const opacity = progress.interpolate({ inputRange: [0, 0.12, 0.85, 1], outputRange: [0, 0.9, 0.35, 0] });
  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.05] });

  return (
    <Animated.Text
      style={[styles.floatHeart, { left, opacity, transform: [{ translateY }, { scale }] }]}
    >
      {emoji}
    </Animated.Text>
  );
};

// A purpose-made reveal for the random daily love note — deliberately not
// CustomAlert, since a generic info-dialog undercut the "sweet surprise"
// feel this is meant to have.
const LoveNotePopup = ({ visible, text, onClose }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1.25, duration: 1300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
          <FloatingHeart emoji="💕" left="18%" delay={200} />
          <FloatingHeart emoji="💗" left="72%" delay={1400} />
          <FloatingHeart emoji="✨" left="46%" delay={2500} />
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
              <View style={styles.iconWrap}>
                <Animated.View style={[styles.iconGlow, { transform: [{ scale: glowAnim }] }]} />
                <LinearGradient
                  colors={['#ca9ad6', '#70d0dd']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconCircle}
                >
                  <HeartIcon />
                </LinearGradient>
              </View>

              <Text style={styles.kicker}>Just for you</Text>
              <Text style={styles.title}>A Love Note</Text>

              <LinearGradient
                colors={['#fbe5f5', '#f4cae8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.noteBody}
              >
                <Text style={styles.noteText}>
                  <Text style={styles.quoteMark}>{'“'}</Text>
                  {text}
                  <Text style={styles.quoteMark}>{'”'}</Text>
                </Text>
              </LinearGradient>

              <TouchableOpacity activeOpacity={0.85} onPress={onClose} style={styles.closeButton}>
                <LinearGradient
                  colors={['#ca9ad6', '#70d0dd']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.closeButtonGradient}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(51, 12, 84, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  floatHeart: {
    position: 'absolute',
    bottom: 160,
    fontSize: 20,
  },
  card: {
    width: width - 64,
    maxWidth: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 40,
    alignItems: 'center',
    shadowColor: '#330c54',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 14,
  },
  iconWrap: {
    width: 64,
    height: 64,
    marginTop: -54,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlow: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ca9ad6',
    opacity: 0.35,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#6b3a8a',
    opacity: 0.7,
    marginBottom: 2,
  },
  title: {
    fontSize: 21,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    marginBottom: 16,
  },
  noteBody: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 20,
    width: '100%',
  },
  noteText: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 17,
    lineHeight: 25,
    color: '#330c54',
    textAlign: 'center',
  },
  quoteMark: {
    color: '#ca9ad6',
  },
  closeButton: {
    width: '100%',
  },
  closeButtonGradient: {
    borderRadius: 999,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 5,
  },
  closeButtonText: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default LoveNotePopup;
