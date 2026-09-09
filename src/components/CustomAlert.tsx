import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

type GradientColors = readonly [string, string, ...string[]];

export interface AlertButton {
  text: string;
  onPress?: () => void | Promise<void>;
  // Not currently rendered differently by CustomAlert (styling is purely
  // position-based — see the button.map below) — kept so callers that pass
  // it (useAlert's showConfirm) type-check.
  style?: 'cancel' | 'destructive' | 'default';
}

interface CustomAlertProps {
  visible: boolean;
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message?: string;
  buttons?: AlertButton[];
  onClose?: () => void;
  // 'primaryTopLinkBottom': for exactly 3 buttons ([secondary, link,
  // primary]), renders the primary (last) button full-width on top, the
  // first button as a boxed secondary button below it, and the middle
  // button as a plain, unboxed text link at the bottom — for prompts where
  // the middle option (e.g. "Not now") is meaningfully less important than
  // the other two. Anything else keeps the default stacked/row layout.
  buttonLayout?: 'stacked' | 'primaryTopLinkBottom';
}

// Icons
const SuccessIcon = ({ size = 48 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="#4CAF50" />
    <Path
      d="M8 12l2.5 2.5L16 9"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ErrorIcon = ({ size = 48 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="#F44336" />
    <Path
      d="M15 9l-6 6M9 9l6 6"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const WarningIcon = ({ size = 48 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L2 22h20L12 2z" fill="#FF9800" />
    <Path
      d="M12 9v4M12 17h.01"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const InfoIcon = ({ size = 48 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="#2196F3" />
    <Path
      d="M12 16v-4M12 8h.01"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CustomAlert = ({
  visible,
  type = 'info',
  title,
  message,
  buttons = [{ text: 'OK', onPress: () => {} }],
  onClose,
  buttonLayout = 'stacked',
}: CustomAlertProps) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  // Which button (if any) has an async onPress currently in flight — shows
  // a spinner in place of its label instead of the modal just sitting there
  // with no feedback (e.g. "Log Out" while signOut() is still running).
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (visible) {
      setPendingIndex(null);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <SuccessIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getGradientColors = (): GradientColors => {
    switch (type) {
      case 'success':
        return ['#E8F5E9', '#C8E6C9'];
      case 'error':
        return ['#FFEBEE', '#FFCDD2'];
      case 'warning':
        return ['#FFF3E0', '#FFE0B2'];
      default:
        return ['#E3F2FD', '#BBDEFB'];
    }
  };

  if (!visible) return null;

  // Shared by both the default (map-based) rendering and the special
  // primaryTopLinkBottom layout, so the async-pending/spinner behavior
  // (see the pendingIndex comment above) only lives in one place.
  const handlePress = async (index: number, button: AlertButton) => {
    if (pendingIndex !== null) return;
    const result = button.onPress?.();
    // Only show a spinner when there's real async work — a sync handler
    // (e.g. Cancel's () => {}) closes instantly with no flash of loading
    // state.
    if (result && typeof (result as any).then === 'function') {
      setPendingIndex(index);
      try {
        await result;
      } finally {
        setPendingIndex(null);
      }
    }
    onClose?.();
  };

  const useLinkLayout = buttonLayout === 'primaryTopLinkBottom' && buttons.length === 3;

  const renderBoxButton = (
    button: AlertButton,
    index: number,
    variant: 'primary' | 'secondary',
  ) => {
    const isPending = pendingIndex === index;
    const anyPending = pendingIndex !== null;
    return (
      <TouchableOpacity
        key={index}
        disabled={anyPending}
        style={[
          styles.button,
          styles.buttonStacked,
          variant === 'primary' && styles.primaryButton,
          anyPending && !isPending && styles.buttonDimmed,
        ]}
        onPress={() => handlePress(index, button)}
      >
        {variant === 'primary' ? (
          <LinearGradient
            colors={['#ca9ad6', '#70d0dd']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            {isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText} numberOfLines={1}>
                {button.text}
              </Text>
            )}
          </LinearGradient>
        ) : isPending ? (
          <ActivityIndicator size="small" color="#6b3a8a" />
        ) : (
          <Text style={styles.buttonText} numberOfLines={1}>
            {button.text}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderLinkButton = (button: AlertButton, index: number) => {
    const isPending = pendingIndex === index;
    const anyPending = pendingIndex !== null;
    return (
      <TouchableOpacity
        key={index}
        disabled={anyPending}
        style={[styles.linkButton, anyPending && !isPending && styles.buttonDimmed]}
        onPress={() => handlePress(index, button)}
      >
        {isPending ? (
          <ActivityIndicator size="small" color="#999999" />
        ) : (
          <Text style={styles.linkButtonText} numberOfLines={1}>
            {button.text}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.alertContainer,
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
                },
              ]}
            >
              <LinearGradient
                colors={getGradientColors()}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.alertContent}
              >
                <View style={styles.iconContainer}>{getIcon()}</View>
                <Text style={styles.title}>{title}</Text>
                {message && <Text style={styles.message}>{message}</Text>}
                {useLinkLayout ? (
                  <View style={styles.buttonContainerLinkLayout}>
                    {renderBoxButton(buttons[2], 2, 'primary')}
                    {renderBoxButton(buttons[0], 0, 'secondary')}
                    {renderLinkButton(buttons[1], 1)}
                  </View>
                ) : (
                  <View
                    style={[
                      styles.buttonContainer,
                      buttons.length > 2 && styles.buttonContainerStacked,
                    ]}
                  >
                    {buttons.map((button, index) => {
                      const isPending = pendingIndex === index;
                      const anyPending = pendingIndex !== null;
                      return (
                        <TouchableOpacity
                          key={index}
                          disabled={anyPending}
                          style={[
                            styles.button,
                            // flex: 1 divides width evenly when buttons sit side
                            // by side (row); in the stacked (column-reverse, 3+
                            // buttons) layout that same flex: 1 instead divides
                            // vertical space inside an unbounded-height
                            // container, which collapses every button to
                            // near-zero height. Stacked buttons need a fixed
                            // width instead.
                            buttons.length > 2 ? styles.buttonStacked : styles.buttonInRow,
                            index === buttons.length - 1 && styles.primaryButton,
                            buttons.length === 1 && styles.singleButton,
                            anyPending && !isPending && styles.buttonDimmed,
                          ]}
                          onPress={() => handlePress(index, button)}
                        >
                          {index === buttons.length - 1 ? (
                            <LinearGradient
                              colors={['#ca9ad6', '#70d0dd']}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={styles.buttonGradient}
                            >
                              {isPending ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                              ) : (
                                <Text style={styles.primaryButtonText} numberOfLines={1}>
                                  {button.text}
                                </Text>
                              )}
                            </LinearGradient>
                          ) : isPending ? (
                            <ActivityIndicator size="small" color="#6b3a8a" />
                          ) : (
                            <Text style={styles.buttonText} numberOfLines={1}>
                              {button.text}
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </LinearGradient>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    width: width - 48,
    maxWidth: 340,
  },
  alertContent: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: 4,
  },
  buttonContainerStacked: {
    // The primary button is always LAST in the buttons array (see callers
    // like the upgrade prompt: [secondary, secondary, primary]).
    // column-reverse renders it at the TOP instead of the bottom — the
    // most prominent, gradient-styled action should be the first thing
    // seen in a stacked (3+ button) alert, not buried under the secondary
    // options.
    flexDirection: 'column-reverse',
  },
  buttonContainerLinkLayout: {
    flexDirection: 'column',
    gap: 12,
    width: '100%',
    marginTop: 4,
  },
  button: {
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(202, 154, 214, 0.3)',
  },
  buttonInRow: {
    flex: 1,
  },
  buttonStacked: {
    width: '100%',
  },
  buttonDimmed: {
    opacity: 0.5,
  },
  linkButton: {
    // No border/background — deliberately quieter than a boxed button, for
    // the least important option among the three (e.g. "Not now").
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkButtonText: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#999999',
    textAlign: 'center',
  },
  primaryButton: {
    padding: 0,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  singleButton: {
    flex: 1,
    maxWidth: 200,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    textAlign: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default CustomAlert;
