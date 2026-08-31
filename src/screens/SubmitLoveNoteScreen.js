import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Polyline } from 'react-native-svg';
import { submitLoveNoteIdea } from '../services/api';
import { CustomAlert } from '../components';
import useAlert from '../hooks/useAlert';

const MAX_NOTE_LENGTH = 500;

const BackIcon = ({ size = 24, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

const SubmitLoveNoteScreen = ({ navigation }) => {
  const [noteText, setNoteText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { alertConfig, showSuccess, showError, hideAlert } = useAlert();

  const handleSubmit = async () => {
    if (!noteText.trim() || submitting) return;

    setSubmitting(true);
    try {
      await submitLoveNoteIdea(noteText.trim());
      showSuccess('Thanks! Your love note idea has been submitted for review. 💌', () => navigation.goBack());
    } catch (error) {
      showError(error.message || 'Failed to submit your love note');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = !!noteText.trim() && !submitting;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#ccf9ff', '#e0f7fa', '#FFFFFF']}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <BackIcon size={24} color="#6b3a8a" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <MaskedView maskElement={<Text style={styles.headerTitleMask}>Submit a Love Note</Text>}>
            <LinearGradient colors={['#ca9ad6', '#70d0dd']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={[styles.headerTitleMask, { opacity: 0 }]}>Submit a Love Note</Text>
            </LinearGradient>
          </MaskedView>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionLabel}>Your idea</Text>
          <Text style={styles.sectionHint}>
            Got a love note idea? Suggest it here — if we love it, we'll add it to the app!
          </Text>
          <TextInput
            style={styles.noteInput}
            value={noteText}
            onChangeText={setNoteText}
            placeholder="E.g., You are capable of amazing things"
            placeholderTextColor="#b8a5c4"
            multiline
            maxLength={MAX_NOTE_LENGTH}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{noteText.length}/{MAX_NOTE_LENGTH}</Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity
          disabled={!canSubmit}
          onPress={handleSubmit}
          activeOpacity={0.8}
          style={{ opacity: canSubmit ? 1 : 0.5 }}
        >
          <LinearGradient
            colors={['#ca9ad6', '#70d0dd']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitButton}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Love Note 💌</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <CustomAlert {...alertConfig} onClose={hideAlert} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleMask: {
    fontSize: 20,
    fontFamily: 'Handlee_400Regular',
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 17,
    color: '#6b3a8a',
    marginTop: 16,
    marginBottom: 2,
  },
  sectionHint: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 13,
    color: '#999',
    marginBottom: 14,
  },
  noteInput: {
    fontFamily: 'Handlee_400Regular',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    minHeight: 160,
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    borderWidth: 2,
    borderColor: '#f4cae8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  charCount: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 6,
  },
  footer: {
    padding: 16,
    paddingBottom: 30,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  submitButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 18,
    color: '#FFFFFF',
  },
});

export default SubmitLoveNoteScreen;
