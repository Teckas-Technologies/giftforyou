import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Icons
const SuccessIcon = ({ size = 48 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="#4CAF50" />
    <Path d="M8 12l2.5 2.5L16 9" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ErrorIcon = ({ size = 48 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="#F44336" />
    <Path d="M15 9l-6 6M9 9l6 6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const WarningIcon = ({ size = 48 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L2 22h20L12 2z" fill="#FF9800" />
    <Path d="M12 9v4M12 17h.01" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const InfoIcon = ({ size = 48 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="#2196F3" />
    <Path d="M12 16v-4M12 8h.01" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CustomAlert = ({
  visible,
  type = 'info', // 'success', 'error', 'warning', 'info'
  title,
  message,
  buttons = [{ text: 'OK', onPress: () => {} }],
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
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

  const getGradientColors = () => {
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

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
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
            <View style={styles.buttonContainer}>
              {buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    index === buttons.length - 1 && styles.primaryButton,
                    buttons.length === 1 && styles.singleButton,
                  ]}
                  onPress={() => {
                    button.onPress?.();
                    onClose?.();
                  }}
                >
                  {index === buttons.length - 1 ? (
                    <LinearGradient
                      colors={['#ca9ad6', '#70d0dd']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.buttonGradient}
                    >
                      <Text style={styles.primaryButtonText}>{button.text}</Text>
                    </LinearGradient>
                  ) : (
                    <Text style={styles.buttonText}>{button.text}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
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
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    padding: 0,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  singleButton: {
    flex: 1,
  },
  buttonGradient: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  buttonText: {
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  primaryButtonText: {
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
  },
});

export default CustomAlert;
