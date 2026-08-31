import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Polyline } from 'react-native-svg';
import { getCircles, getLoveNotes, sendLoveNote } from '../services/api';
import { CustomAlert } from '../components';
import useAlert from '../hooks/useAlert';

const BackIcon = ({ size = 24, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
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
  const [notes, setNotes] = useState([]);
  const [selectedCircleId, setSelectedCircleId] = useState(preselectedCircleId);
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  const { alertConfig, showSuccess, showError, hideAlert } = useAlert();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [circlesRes, notesRes] = await Promise.all([
        getCircles({ status: 'accepted' }),
        getLoveNotes(),
      ]);

      const contactsList = circlesRes.contacts || [];
      const transformedFriends = contactsList.map((contact) => {
        const name = contact.member?.name || contact.name || 'Friend';
        return { id: contact.id, name, initials: getInitials(name) };
      });

      setFriends(transformedFriends);
      setNotes(notesRes.notes || []);
    } catch (error) {
      showError(error.message || 'Failed to load love notes');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSend = async () => {
    if (!selectedCircleId || !selectedNoteId || sending) return;

    setSending(true);
    try {
      await sendLoveNote(selectedCircleId, selectedNoteId);
      const friendName = friends.find((f) => f.id === selectedCircleId)?.name || 'your friend';
      showSuccess(`Love note sent to ${friendName}! 💌`, () => navigation.goBack());
    } catch (error) {
      showError(error.message || 'Failed to send love note');
    } finally {
      setSending(false);
    }
  };

  const canSend = !!selectedCircleId && !!selectedNoteId && !sending;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#fbe5f5', '#FDEEF3', '#FFFFFF']}
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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionLabel}>To</Text>
          {friends.length === 0 ? (
            <Text style={styles.emptyText}>Add some friends first to send them a love note 💌</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.friendsRow}>
              {friends.map((friend) => {
                const selected = friend.id === selectedCircleId;
                return (
                  <TouchableOpacity
                    key={friend.id}
                    style={styles.friendItem}
                    onPress={() => setSelectedCircleId(friend.id)}
                    activeOpacity={0.7}
                  >
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
                    <Text style={styles.friendName} numberOfLines={1}>{friend.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          <Text style={styles.sectionLabel}>Pick a note</Text>
          {notes.map((note) => {
            const selected = note.id === selectedNoteId;
            return (
              <TouchableOpacity
                key={note.id}
                style={[styles.noteCard, selected && styles.noteCardSelected]}
                onPress={() => setSelectedNoteId(note.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.noteText}>{note.text}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
    fontSize: 14,
    fontWeight: '700',
    color: '#6b3a8a',
    marginTop: 16,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  },
  friendsRow: {
    marginBottom: 8,
  },
  friendItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 68,
  },
  friendAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  friendInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ca9ad6',
  },
  friendName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#f4cae8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  noteCardSelected: {
    borderColor: '#ca9ad6',
    backgroundColor: '#fbe5f5',
  },
  noteText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 21,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default SendLoveNoteScreen;
