import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

// Shown once, right after signup, only for brand-new users (piggybacks on
// AppNavigator's existing "hasAnyAnswers" check — see checkQuestionnaireStatus).
// Never shown again on later logins.
const CompanyCodeIntroScreen = ({ navigation, route }) => {
  const nextRoute = route?.params?.nextRoute || 'MainApp';

  // reset (not replace/navigate) so this one-time screen — and RedeemCoupon,
  // if they went through it — are cleared from the stack entirely. Otherwise
  // the back button from nextRoute could loop back into this flow.
  const goNext = () => navigation.reset({ index: 0, routes: [{ name: nextRoute }] });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#ccf9ff', '#e0f7fa', '#FFFFFF']}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <MaskedView maskElement={<Text style={styles.titleMask}>Have a company code?</Text>}>
          <LinearGradient colors={['#ca9ad6', '#70d0dd']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={[styles.titleMask, { opacity: 0 }]}>Have a company code?</Text>
          </LinearGradient>
        </MaskedView>

        <Text style={styles.subtitle}>
          If your workplace partners with us, enter your code to unlock full access instantly.
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('RedeemCoupon', { nextRoute })}
          activeOpacity={0.85}
          style={{ width: '100%' }}
        >
          <LinearGradient
            colors={['#ca9ad6', '#70d0dd']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.enterButton}
          >
            <Text style={styles.enterButtonText}>Enter code</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={goNext} style={styles.skipButton}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  titleMask: {
    fontSize: 26,
    fontFamily: 'Handlee_400Regular',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 15,
    color: '#6b3a8a',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  enterButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enterButtonText: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 18,
    color: '#FFFFFF',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  skipButtonText: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 15,
    color: '#6b3a8a',
  },
});

export default CompanyCodeIntroScreen;
