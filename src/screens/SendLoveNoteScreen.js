import React, { useState, useEffect, useCallback } from 'react';
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
import { getCircles, sendLoveNote } from '../services/api';
import { CustomAlert } from '../components';
import useAlert from '../hooks/useAlert';

const MAX_NOTE_LENGTH = 500;

const BackIcon = ({ size = 24, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

const CheckIcon = ({ size = 16, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="20 6 9 17 4 12" />
  </Svg>
);

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Preselect a friend/note passed in via navigation params, e.g. when opened
// from a contact's detail screen.
const SendLoveNoteScreen = ({ navigation, route }) => {
  const preselectedCircleId = route?.params?.circleId || null;

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedCircleIds, setSelectedCircleIds] = useState(
    preselectedCircleId ? [preselectedCircleId] : []
  );
  const [noteText, setNoteText] = useState('');

  const toggleFriend = (circleId) => {
    setSelectedCircleIds((prev) =>
      prev.includes(circleId)
        ? prev.filter((id) => id !== circleId)
        : [...prev, circleId]
    );
  };

  const { alertConfig, showSuccess, showError, hideAlert } = useAlert();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const circlesRes = await getCircles({ status: 'accepted' });

      const contactsList = circlesRes.contacts || [];
      const transformedFriends = contactsList.map((contact) => {
        const name = contact.member?.name || contact.name || 'Friend';
        return { id: contact.id, name, initials: getInitials(name) };
      });

      setFriends(transformedFriends);
    } catch (error) {
      showError(error.message || 'Failed to load your friends');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSend = async () => {
    if (selectedCircleIds.length === 0 || !noteText.trim() || sending) return;

    setSending(true);
    try {
      const text = noteText.trim();
      await Promise.all(selectedCircleIds.map((circleId) => sendLoveNote(circleId, text)));

      const message = selectedCircleIds.length === 1
        ? `Love note sent to ${friends.find((f) => f.id === selectedCircleIds[0])?.name || 'your friend'}! 💌`
        : `Love note sent to ${selectedCircleIds.length} friends! 💌`;
      showSuccess(message, () => navigation.goBack());
    } catch (error) {
      showError(error.message || 'Failed to send love note');
    } finally {
      setSending(false);
    }
  };

  const canSend = selectedCircleIds.length > 0 && !!noteText.trim() && !sending;

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
          <MaskedView maskElement={<Text style={styles.headerTitleMask}>Send a Love Note</Text>}>
            <LinearGradient colors={['#ca9ad6', '#70d0dd']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={[styles.headerTitleMask, { opacity: 0 }]}>Send a Love Note</Text>
            </LinearGradient>
          </MaskedView>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ca9ad6" />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionLabel}>To</Text>
            <Text style={styles.sectionHint}>
              {selectedCircleIds.length > 0
                ? `${selectedCircleIds.length} selected`
                : 'Tap to select a friend'}
            </Text>
            {friends.length === 0 ? (
              <Text style={styles.emptyText}>Add some friends first to send them a love note 💌</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.friendsRow}>
                {friends.map((friend) => {
                  const selected = selectedCircleIds.includes(friend.id);
                  return (
                    <TouchableOpacity
                      key={friend.id}
                      style={styles.friendItem}
                      onPress={() => toggleFriend(friend.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.friendAvatarRing, selected && styles.friendAvatarRingSelected]}>
                        <LinearGradient
                          colors={selected ? ['#ca9ad6', '#70d0dd'] : ['#fbe5f5', '#f4cae8']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.friendAvatar}
                        >
                          <Text style={[styles.friendInitials, selected && { color: '#FFFFFF' }]}>
                            {friend.initials}
                          </Text>
                        </LinearGradient>
                        {selected && (
                          <View style={styles.checkBadge}>
                            <CheckIcon size={12} color="#FFFFFF" />
                          </View>
                        )}
                      </View>
                      <Text style={[styles.friendName, selected && styles.friendNameSelected]} numberOfLines={1}>
                        {friend.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            <Text style={styles.sectionLabel}>Your love note</Text>
            <TextInput
              style={styles.noteInput}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Write something sweet..."
              placeholderTextColor="#b8a5c4"
              multiline
              maxLength={MAX_NOTE_LENGTH}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{noteText.length}/{MAX_NOTE_LENGTH}</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {!loading && (
        <View style={styles.footer}>
          <TouchableOpacity
            disabled={!canSend}
            onPress={handleSend}
            activeOpacity={0.8}
            style={{ opacity: canSend ? 1 : 0.5 }}
          >
            <LinearGradient
              colors={['#ca9ad6', '#70d0dd']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sendButton}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.sendButtonText}>Send Love Note 💌</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
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
    marginBottom: 10,
  },
  emptyText: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  },
  friendsRow: {
    marginBottom: 8,
  },
  friendItem: {
    alignItems: 'center',
    marginRight: 18,
    width: 72,
  },
  friendAvatarRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 2.5,
    borderColor: 'transparent',
  },
  friendAvatarRingSelected: {
    borderColor: '#ca9ad6',
  },
  friendAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendInitials: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 20,
    color: '#ca9ad6',
  },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ca9ad6',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendName: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
  },
  friendNameSelected: {
    color: '#6b3a8a',
  },
  noteInput: {
    fontFamily: 'Handlee_400Regular',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    minHeight: 140,
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 30,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sendButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    fontFamily: 'Handlee_400Regular',
    fontSize: 18,
    color: '#FFFFFF',
  },
});

export default SendLoveNoteScreen;
