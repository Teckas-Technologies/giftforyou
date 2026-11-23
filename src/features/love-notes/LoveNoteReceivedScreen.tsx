import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  ScrollView,
  AccessibilityInfo,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { formatDate } from '../../utils/date';
import { fontSize as typeScale } from '../../theme';
import type { ScreenProps } from '../../types/navigation';

const { width, height } = Dimensions.get('window');
const ENVELOPE_W = Math.min(220, width - 100);
const ENVELOPE_H = ENVELOPE_W * 0.65;
const CARD_W = width - 48;

const HEART_PATH =
  'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z';
const SPARKLE_PATH =
  'M12 2c.6 3.6 1.9 5.9 5 7-3.1 1.1-4.4 3.4-5 7-.6-3.6-1.9-5.9-5-7 3.1-1.1 4.4-3.4 5-7z';

// Timeline in ms. Short on purpose: the note is readable in ~1.6s
// (the old envelope → flap → paper → card sequence took ~3.5s).
const T = {
  wiggle: 450, // envelope gives a little wiggle once it has popped in
  flap: 900, // flap folds open
  reveal: 1250, // envelope fades away, card springs up in its place
  burst: 1350, // sparkles around the card
  content: 1500, // message, sender, buttons
};

const Heart = ({ size, color }: { size: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d={HEART_PATH} />
  </Svg>
);

const Sparkle = ({ size, color }: { size: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d={SPARKLE_PATH} />
  </Svg>
);

// A heart that drifts up from the bottom of the screen on a loop
const FloatingHeart = ({
  left,
  size,
  color,
  delay,
  duration,
}: {
  left: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
}) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(progress, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [delay, duration, progress]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.floatingHeart,
        {
          left,
          opacity: progress.interpolate({
            inputRange: [0, 0.15, 0.8, 1],
            outputRange: [0, 0.7, 0.5, 0],
          }),
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -height * 0.9],
              }),
            },
            {
              translateX: progress.interpolate({
                inputRange: [0, 0.25, 0.5, 0.75, 1],
                outputRange: [0, 10, 0, -10, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Heart size={size} color={color} />
    </Animated.View>
  );
};

const FLOATING_HEARTS = [
  { left: width * 0.06, size: 16, color: '#f4cae8', delay: 0, duration: 7000 },
  { left: width * 0.24, size: 11, color: '#70d0dd', delay: 1800, duration: 8000 },
  { left: width * 0.5, size: 18, color: '#ca9ad6', delay: 900, duration: 7500 },
  { left: width * 0.72, size: 13, color: '#f4cae8', delay: 2600, duration: 6500 },
  { left: width * 0.88, size: 16, color: '#70d0dd', delay: 400, duration: 8500 },
];

// Sparkles that burst out around the card once it appears
const BURST = [
  { x: -CARD_W * 0.42, y: -100, size: 18, color: '#ca9ad6' },
  { x: CARD_W * 0.42, y: -120, size: 22, color: '#70d0dd' },
  { x: -CARD_W * 0.38, y: 110, size: 16, color: '#70d0dd' },
  { x: CARD_W * 0.4, y: 100, size: 18, color: '#f4cae8' },
  { x: 0, y: -160, size: 14, color: '#f4cae8' },
];

/**
 * Opens when a love note notification is tapped — from the phone's
 * notification banner or from a card on the Notifications screen.
 *
 * Sequence (~1.6s): envelope pops in → little wiggle → flap folds open →
 * envelope fades away while the note card springs up in its place →
 * sparkles, then the message and buttons. Hearts float in the background.
 * With "Reduce motion" on, it shows the open card straight away.
 *
 * One way out: the "Close" button under "Send a love note back" (plus the
 * system back gesture). The old top-right ✕ did the same thing and was
 * removed.
 */
const LoveNoteReceivedScreen = ({ navigation, route }: ScreenProps) => {
  const insets = useSafeAreaInsets();
  const senderName: string = route?.params?.senderName || 'A friend';
  const noteText: string = route?.params?.noteText || '';
  const sentAt: string | undefined = route?.params?.sentAt;
  const senderId: string | null = route?.params?.senderId || null;
  const firstName = senderName.split(' ')[0];

  const envelopeIn = useRef(new Animated.Value(0)).current; // pop in
  const wiggle = useRef(new Animated.Value(0)).current; // little shake
  const flapOpen = useRef(new Animated.Value(0)).current; // 0 closed → 1 open
  const envelopeOut = useRef(new Animated.Value(0)).current; // fades away
  const cardIn = useRef(new Animated.Value(0)).current; // card springs up
  const burst = useRef(new Animated.Value(0)).current; // sparkles
  const contentIn = useRef(new Animated.Value(0)).current; // message + buttons

  useEffect(() => {
    let cancelled = false;
    const values = [envelopeIn, wiggle, flapOpen, envelopeOut, cardIn, burst, contentIn];
    const at = (delay: number, anim: Animated.CompositeAnimation) =>
      Animated.sequence([Animated.delay(delay), anim]);

    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) {
        // Final state: envelope gone, card and content showing
        [envelopeIn, flapOpen, envelopeOut, cardIn, contentIn].forEach((v) => v.setValue(1));
        return;
      }

      Animated.parallel([
        Animated.spring(envelopeIn, {
          toValue: 1,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }),
        at(
          T.wiggle,
          Animated.timing(wiggle, {
            toValue: 1,
            duration: 420,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ),
        at(
          T.flap,
          Animated.timing(flapOpen, {
            toValue: 1,
            duration: 320,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ),
        at(
          T.reveal,
          Animated.timing(envelopeOut, {
            toValue: 1,
            duration: 280,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ),
        at(
          T.reveal,
          Animated.spring(cardIn, {
            toValue: 1,
            friction: 7,
            tension: 60,
            useNativeDriver: true,
          }),
        ),
        at(
          T.burst,
          Animated.timing(burst, {
            toValue: 1,
            duration: 900,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ),
        at(
          T.content,
          Animated.timing(contentIn, {
            toValue: 1,
            duration: 450,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ),
      ]).start();
    });

    return () => {
      cancelled = true;
      values.forEach((v) => v.stopAnimation());
    };
  }, [envelopeIn, wiggle, flapOpen, envelopeOut, cardIn, burst, contentIn]);

  const sentLabel = sentAt
    ? formatDate(sentAt, { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '';

  const envelopeStyle = {
    opacity: Animated.multiply(
      envelopeIn.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }),
      envelopeOut.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
    ),
    transform: [
      {
        scale: Animated.multiply(
          envelopeIn.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
          envelopeOut.interpolate({ inputRange: [0, 1], outputRange: [1, 0.85] }),
        ),
      },
      {
        rotate: wiggle.interpolate({
          inputRange: [0, 0.25, 0.5, 0.75, 1],
          outputRange: ['0deg', '-6deg', '5deg', '-3deg', '0deg'],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#fbe5f5', '#ffffff', '#ccf9ff']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {FLOATING_HEARTS.map((h, i) => (
        <FloatingHeart key={i} {...h} />
      ))}

      <Animated.Text
        style={[
          styles.kicker,
          {
            marginTop: insets.top + 32,
            opacity: envelopeIn.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
          },
        ]}
      >
        {firstName} sent you a love note
      </Animated.Text>

      <View style={styles.stage}>
        {/* Envelope: body + front pocket + seal, with the flap on top */}
        <Animated.View pointerEvents="none" style={[styles.envelope, envelopeStyle]}>
          <LinearGradient
            colors={['#f4cae8', '#ca9ad6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.envelopeBody}
          />
          <Svg
            style={StyleSheet.absoluteFill}
            width={ENVELOPE_W}
            height={ENVELOPE_H}
            viewBox="0 0 100 65"
            preserveAspectRatio="none"
          >
            <Path d="M0 65 L0 10 L50 40 L100 10 L100 65 Z" fill="#fbe5f5" />
          </Svg>
          {/* Flap folds up around its top edge (scaleY 1 → -1) */}
          <Animated.View
            style={[
              styles.flap,
              {
                transform: [
                  {
                    scaleY: flapOpen.interpolate({ inputRange: [0, 1], outputRange: [1, -1] }),
                  },
                ],
              },
            ]}
          >
            <Svg
              width={ENVELOPE_W}
              height={ENVELOPE_H * 0.62}
              viewBox="0 0 100 60"
              preserveAspectRatio="none"
            >
              <Path d="M0 0 L100 0 L50 58 Z" fill="#e3b3ec" />
            </Svg>
          </Animated.View>
          <Animated.View
            style={[
              styles.seal,
              { opacity: flapOpen.interpolate({ inputRange: [0, 0.4], outputRange: [1, 0] }) },
            ]}
          >
            <Heart size={18} color="#ca9ad6" />
          </Animated.View>
        </Animated.View>

        {/* The note card — a normal, self-contained box: border, white
            inside, and the name + date are inside it too. */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardIn.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 1] }),
              transform: [
                { translateY: cardIn.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) },
                { scale: cardIn.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }) },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['#ca9ad6', '#70d0dd']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardBorder}
          >
            <View style={styles.cardInner}>
              <Text style={styles.cardEmoji}>💌</Text>
              <Animated.View
                style={[
                  styles.cardContent,
                  {
                    opacity: contentIn,
                    transform: [
                      {
                        translateY: contentIn.interpolate({
                          inputRange: [0, 1],
                          outputRange: [10, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <ScrollView
                  style={styles.noteScroll}
                  contentContainerStyle={styles.noteScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.noteText}>{noteText}</Text>
                </ScrollView>
                <View style={styles.divider} />
                <Text style={styles.signature}>— {senderName}</Text>
                {!!sentLabel && <Text style={styles.sentAt}>{sentLabel}</Text>}
              </Animated.View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Sparkle burst around the card */}
        {BURST.map((s, i) => (
          <Animated.View
            key={i}
            pointerEvents="none"
            style={[
              styles.burstSparkle,
              {
                opacity: burst.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] }),
                transform: [
                  { translateX: burst.interpolate({ inputRange: [0, 1], outputRange: [0, s.x] }) },
                  { translateY: burst.interpolate({ inputRange: [0, 1], outputRange: [0, s.y] }) },
                  {
                    scale: burst.interpolate({
                      inputRange: [0, 0.3, 1],
                      outputRange: [0.2, 1.2, 0.6],
                    }),
                  },
                ],
              },
            ]}
          >
            <Sparkle size={s.size} color={s.color} />
          </Animated.View>
        ))}
      </View>

      <Animated.View
        style={[
          styles.actions,
          {
            paddingBottom: insets.bottom + 20,
            opacity: contentIn,
            transform: [
              { translateY: contentIn.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
            ],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('SendLoveNote', { memberId: senderId })}
          accessibilityRole="button"
        >
          <LinearGradient
            colors={['#ca9ad6', '#70d0dd']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Send a love note back 💌</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.secondaryButton}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryButtonText}>Close</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  floatingHeart: {
    position: 'absolute',
    bottom: -30,
  },
  kicker: {
    textAlign: 'center',
    fontFamily: 'Handlee_400Regular',
    fontSize: typeScale['2xl'],
    color: '#330c54',
    paddingHorizontal: 24,
  },
  // Envelope and card are both centred here, card on top
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  envelope: {
    position: 'absolute',
    width: ENVELOPE_W,
    height: ENVELOPE_H,
  },
  envelopeBody: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
  },
  flap: {
    position: 'absolute',
    top: 0,
    left: 0,
    transformOrigin: 'top',
  },
  seal: {
    position: 'absolute',
    alignSelf: 'center',
    top: ENVELOPE_H * 0.42,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  burstSparkle: {
    position: 'absolute',
    zIndex: 3,
  },
  card: {
    width: CARD_W,
    zIndex: 2,
    // Shadow lives on a view that has a background + radius, so Android
    // draws it as a rounded card (no stray white box underneath).
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  cardBorder: {
    borderRadius: 24,
    padding: 2,
  },
  cardInner: {
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    paddingTop: 22,
    paddingBottom: 20,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  // Stretches to the card width so the name/date can sit on the right
  cardContent: {
    alignSelf: 'stretch',
  },
  noteScroll: {
    flexGrow: 0,
    maxHeight: height * 0.3,
  },
  noteScrollContent: {
    alignItems: 'center',
  },
  noteText: {
    fontFamily: 'Handlee_400Regular',
    fontSize: typeScale['2xl'],
    lineHeight: 32,
    color: '#330c54',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1e4f7',
    marginTop: 18,
    marginBottom: 10,
  },
  signature: {
    fontFamily: 'Handlee_400Regular',
    fontSize: typeScale.lg,
    color: '#8a4fa3',
    textAlign: 'right',
  },
  sentAt: {
    marginTop: 2,
    fontFamily: 'Handlee_400Regular',
    fontSize: typeScale.xs,
    color: '#7d6b8f',
    textAlign: 'right',
  },
  actions: {
    paddingHorizontal: 24,
    gap: 4,
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: 'Handlee_400Regular',
    fontSize: typeScale.lg,
    color: '#FFFFFF',
  },
  secondaryButton: {
    minHeight: 44,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: 'Handlee_400Regular',
    fontSize: typeScale.base,
    color: '#6b3a8a',
  },
});

export default LoveNoteReceivedScreen;
