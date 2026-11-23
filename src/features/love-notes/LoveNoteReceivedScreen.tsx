import React, { useEffect, useRef, useState } from 'react';
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
import Svg, { Path } from 'react-native-svg';
import { formatDate } from '../../utils/date';
import { fontSize as typeScale } from '../../theme';
import type { ScreenProps } from '../../types/navigation';

const { width, height } = Dimensions.get('window');
const ENVELOPE_W = Math.min(260, width - 80);
const ENVELOPE_H = ENVELOPE_W * 0.65;
// The paper letter is a little smaller than the envelope so it fits inside it
const PAPER_W = ENVELOPE_W * 0.9;
const PAPER_H = ENVELOPE_H * 0.86;
// How far the paper slides up out of the envelope (about two thirds out)
const PAPER_SLIDE = ENVELOPE_H * 0.68;
const CARD_W = width - 48;

const HEART_PATH =
  'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z';
const SPARKLE_PATH =
  'M12 2c.6 3.6 1.9 5.9 5 7-3.1 1.1-4.4 3.4-5 7-.6-3.6-1.9-5.9-5-7 3.1-1.1 4.4-3.4 5-7z';

// Timeline in ms — kept in step with the Love Note Reveal preview
const T = {
  flapOpen: 900, // flap folds back
  paperOut: 1450, // paper slides up out of the envelope (flap moves behind it here)
  envelopeOut: 2300, // whole envelope drops away
  paperToCenter: 2450, // paper rises to the centre and fades into the card
  card: 2850, // note card appears
  burst: 3050, // sparkles
  content: 3200, // message, sender, buttons
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
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.floatingHeart,
        {
          left,
          opacity: progress.interpolate({
            inputRange: [0, 0.15, 0.8, 1],
            outputRange: [0, 0.8, 0.6, 0],
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
                outputRange: [0, 12, 0, -12, 0],
              }),
            },
            {
              rotate: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['-15deg', '15deg'],
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
  { left: width * 0.06, size: 18, color: '#f4cae8', delay: 0, duration: 7000 },
  { left: width * 0.22, size: 12, color: '#70d0dd', delay: 1800, duration: 8000 },
  { left: width * 0.42, size: 22, color: '#ca9ad6', delay: 900, duration: 7500 },
  { left: width * 0.62, size: 14, color: '#f4cae8', delay: 2600, duration: 6500 },
  { left: width * 0.8, size: 20, color: '#70d0dd', delay: 400, duration: 8500 },
  { left: width * 0.9, size: 11, color: '#ca9ad6', delay: 3200, duration: 7000 },
];

// Sparkles that burst out around the card once it appears
const BURST = [
  { x: -CARD_W * 0.42, y: -90, size: 18, color: '#ca9ad6' },
  { x: CARD_W * 0.42, y: -110, size: 22, color: '#70d0dd' },
  { x: -CARD_W * 0.36, y: 110, size: 16, color: '#70d0dd' },
  { x: CARD_W * 0.38, y: 100, size: 18, color: '#f4cae8' },
  { x: 0, y: -150, size: 14, color: '#f4cae8' },
  { x: -CARD_W * 0.15, y: 150, size: 12, color: '#ca9ad6' },
];

/**
 * Opens when a love note notification is tapped — from the phone's
 * notification banner or from a card on the Notifications screen.
 *
 * Sequence: envelope drops in → flap opens → a paper letter slides straight
 * up out of the envelope → the envelope drops away → the paper rises and
 * turns into the note card → sparkles, then the message and buttons.
 * Hearts float in the background the whole time. With "Reduce motion" on,
 * it skips straight to the open card.
 *
 * Layers, back to front: envelope back → paper → front pocket → flap. The
 * flap sits in front of the paper while closed and moves behind it once
 * open, like a real envelope.
 */
const LoveNoteReceivedScreen = ({ navigation, route }: ScreenProps) => {
  const senderName: string = route?.params?.senderName || 'A friend';
  const noteText: string = route?.params?.noteText || '';
  const sentAt: string | undefined = route?.params?.sentAt;
  const firstName = senderName.split(' ')[0];

  const envelopeIn = useRef(new Animated.Value(0)).current; // drop + settle
  const flapOpen = useRef(new Animated.Value(0)).current; // 0 closed → 1 open
  const paperSlide = useRef(new Animated.Value(0)).current; // slides up out of the envelope
  const envelopeOut = useRef(new Animated.Value(0)).current; // envelope drops away
  const paperToCenter = useRef(new Animated.Value(0)).current; // rises, grows, fades into the card
  const cardIn = useRef(new Animated.Value(0)).current; // note card appears
  const burst = useRef(new Animated.Value(0)).current; // sparkles
  const contentIn = useRef(new Animated.Value(0)).current; // message + buttons
  const [flapBehind, setFlapBehind] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const values = [
      envelopeIn,
      flapOpen,
      paperSlide,
      envelopeOut,
      paperToCenter,
      cardIn,
      burst,
      contentIn,
    ];
    let flapTimer: ReturnType<typeof setTimeout> | undefined;

    const at = (delay: number, anim: Animated.CompositeAnimation) =>
      Animated.sequence([Animated.delay(delay), anim]);

    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) {
        // Final state: envelope and paper gone, card and content showing
        values.forEach((v) => v.setValue(1));
        burst.setValue(0);
        setFlapBehind(true);
        return;
      }

      flapTimer = setTimeout(() => setFlapBehind(true), T.paperOut);

      Animated.parallel([
        Animated.timing(envelopeIn, {
          toValue: 1,
          duration: 750,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        at(
          T.flapOpen,
          Animated.timing(flapOpen, {
            toValue: 1,
            duration: 550,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ),
        at(
          T.paperOut,
          Animated.timing(paperSlide, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
        ),
        at(
          T.envelopeOut,
          Animated.timing(envelopeOut, {
            toValue: 1,
            duration: 450,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ),
        at(
          T.paperToCenter,
          Animated.timing(paperToCenter, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ),
        at(
          T.card,
          Animated.timing(cardIn, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.cubic),
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
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ),
      ]).start();
    });

    return () => {
      cancelled = true;
      if (flapTimer) clearTimeout(flapTimer);
      values.forEach((v) => v.stopAnimation());
    };
  }, []);

  // Shared by all three envelope layers so they move as one envelope.
  // Fully transparent by 70% of the drop, so nothing is left over the card.
  const envelopeStyle = {
    opacity: Animated.multiply(
      envelopeIn.interpolate({ inputRange: [0, 0.55, 1], outputRange: [0, 1, 1] }),
      envelopeOut.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 0, 0] }),
    ),
    transform: [
      {
        translateY: Animated.add(
          envelopeIn.interpolate({
            inputRange: [0, 0.55, 0.78, 1],
            outputRange: [-height * 0.4, 6, -2, 0],
          }),
          envelopeOut.interpolate({ inputRange: [0, 1], outputRange: [0, 170] }),
        ),
      },
      {
        rotate: envelopeIn.interpolate({
          inputRange: [0, 0.55, 0.78, 1],
          outputRange: ['-10deg', '4deg', '-2deg', '0deg'],
        }),
      },
    ],
  };

  const paperStyle = {
    opacity: Animated.multiply(
      paperSlide.interpolate({ inputRange: [0, 0.12, 1], outputRange: [0, 1, 1] }),
      paperToCenter.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 1, 0] }),
    ),
    transform: [
      {
        translateY: Animated.add(
          paperSlide.interpolate({ inputRange: [0, 1], outputRange: [10, -PAPER_SLIDE] }),
          paperToCenter.interpolate({ inputRange: [0, 1], outputRange: [0, PAPER_SLIDE] }),
        ),
      },
      { scale: paperToCenter.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] }) },
    ],
  };

  const sentLabel = sentAt
    ? formatDate(sentAt, { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '';

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

      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          hitSlop={10}
          accessibilityLabel="Close"
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <Animated.Text
        style={[
          styles.kicker,
          {
            opacity: envelopeIn,
            transform: [
              { translateY: envelopeIn.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) },
            ],
          },
        ]}
      >
        {firstName} sent you a love note
      </Animated.Text>

      <View style={styles.stage}>
        {/* Envelope back */}
        <Animated.View
          pointerEvents="none"
          style={[styles.envelope, styles.layerBack, envelopeStyle]}
        >
          <LinearGradient
            colors={['#f4cae8', '#ca9ad6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.envelopeBack}
          />
        </Animated.View>

        {/* Paper letter inside the envelope */}
        <Animated.View pointerEvents="none" style={[styles.paper, styles.layerPaper, paperStyle]}>
          <Text style={styles.paperEmoji}>💌</Text>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.paperLine} />
          ))}
        </Animated.View>

        {/* Envelope front pocket + seal — in front of the paper */}
        <Animated.View
          pointerEvents="none"
          style={[styles.envelope, styles.layerFront, envelopeStyle]}
        >
          <Svg
            style={StyleSheet.absoluteFill}
            width={ENVELOPE_W}
            height={ENVELOPE_H}
            viewBox="0 0 100 65"
            preserveAspectRatio="none"
          >
            <Path d="M0 65 L0 8 L50 40 L100 8 L100 65 Z" fill="#fbe5f5" />
          </Svg>
          <View style={styles.seal}>
            <Heart size={20} color="#ca9ad6" />
          </View>
        </Animated.View>

        {/* Flap — in front of the paper while closed, behind it once open */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.envelope,
            flapBehind ? styles.layerFlapBehind : styles.layerFlapFront,
            envelopeStyle,
          ]}
        >
          <Animated.View
            style={[
              styles.flap,
              {
                transform: [
                  { perspective: 800 },
                  {
                    rotateX: flapOpen.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '180deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <Svg
              width={ENVELOPE_W}
              height={ENVELOPE_H * 0.6}
              viewBox="0 0 100 60"
              preserveAspectRatio="none"
            >
              <Path d="M0 0 L100 0 L50 58 Z" fill="#e3b3ec" />
            </Svg>
          </Animated.View>
        </Animated.View>

        {/* The note card — always in front of every envelope layer */}
        <Animated.View
          style={[
            styles.letter,
            {
              opacity: cardIn,
              transform: [
                { scale: cardIn.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['#ca9ad6', '#70d0dd']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.letterBorder}
          >
            <View style={styles.letterInner}>
              <Text style={styles.letterEmoji}>💌</Text>
              <Animated.View
                style={{
                  opacity: contentIn,
                  transform: [
                    {
                      translateY: contentIn.interpolate({
                        inputRange: [0, 1],
                        outputRange: [14, 0],
                      }),
                    },
                  ],
                }}
              >
                <ScrollView
                  style={styles.noteScroll}
                  contentContainerStyle={styles.noteScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.noteText}>{noteText}</Text>
                </ScrollView>
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
            opacity: contentIn,
            transform: [
              { translateY: contentIn.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
            ],
          },
        ]}
      >
        <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('SendLoveNote')}>
          <LinearGradient
            colors={['#ca9ad6', '#70d0dd']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Send a love note back 💌</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.secondaryButton}>
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
  headerRow: {
    paddingTop: 54,
    paddingHorizontal: 20,
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  closeText: {
    fontSize: typeScale.lg,
    color: '#6b3a8a',
  },
  kicker: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Handlee_400Regular',
    fontSize: typeScale['2xl'],
    color: '#330c54',
    paddingHorizontal: 24,
  },
  // Every layer is absolutely placed and centred here, stacked by zIndex
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layerBack: { zIndex: 0 },
  layerFlapBehind: { zIndex: 0 },
  layerPaper: { zIndex: 1 },
  layerFront: { zIndex: 2 },
  layerFlapFront: { zIndex: 3 },
  envelope: {
    position: 'absolute',
    width: ENVELOPE_W,
    height: ENVELOPE_H,
  },
  envelopeBack: {
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
    top: ENVELOPE_H * 0.4,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6b3a8a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  paper: {
    position: 'absolute',
    width: PAPER_W,
    height: PAPER_H,
    borderRadius: 6,
    backgroundColor: '#fffdfe',
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 18,
    shadowColor: '#6b3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  paperEmoji: {
    fontSize: 20,
    marginBottom: 8,
  },
  paperLine: {
    alignSelf: 'stretch',
    height: 1,
    backgroundColor: '#f1e4f7',
    marginTop: 16,
  },
  burstSparkle: {
    position: 'absolute',
    zIndex: 6,
  },
  letter: {
    position: 'absolute',
    zIndex: 5,
    width: CARD_W,
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
  },
  letterBorder: {
    borderRadius: 24,
    padding: 2,
  },
  letterInner: {
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  letterEmoji: {
    fontSize: 34,
    marginBottom: 10,
  },
  noteScroll: {
    maxHeight: height * 0.32,
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
  signature: {
    marginTop: 18,
    fontFamily: 'Handlee_400Regular',
    fontSize: typeScale.lg,
    color: '#ca9ad6',
    textAlign: 'right',
    alignSelf: 'stretch',
  },
  sentAt: {
    marginTop: 4,
    fontFamily: 'Handlee_400Regular',
    fontSize: typeScale.xs,
    color: '#a89bb5',
    textAlign: 'right',
    alignSelf: 'stretch',
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 6,
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
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: 'Handlee_400Regular',
    fontSize: typeScale.base,
    color: '#6b3a8a',
  },
});

export default LoveNoteReceivedScreen;
