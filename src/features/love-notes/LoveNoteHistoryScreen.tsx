import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Polyline } from 'react-native-svg';
import { SkeletonRow } from '../../components';
import { formatDate } from '../../utils/date';
import { fontSize as typeScale } from '../../theme';
import type { ScreenProps, IconProps } from '../../types/navigation';
import { useLoveNoteHistory, LoveNoteHistoryItem } from './hooks';

const BackIcon = ({ size = 24, color = '#6b3a8a' }: IconProps) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

// "NOVEMBER 2026" → notes from that month, keeping newest-first order
const groupByMonth = (notes: LoveNoteHistoryItem[]) => {
  const groups: { month: string; notes: LoveNoteHistoryItem[] }[] = [];
  for (const note of notes) {
    const month = formatDate(note.created_at, { month: 'long', year: 'numeric' }).toUpperCase();
    const last = groups[groups.length - 1];
    if (last && last.month === month) last.notes.push(note);
    else groups.push({ month, notes: [note] });
  }
  return groups;
};

/**
 * Every love note between the user and one contact, with Sent / Received
 * tabs, grouped by month. Opened from "View all" on the contact page.
 */
const LoveNoteHistoryScreen = ({ navigation, route }: ScreenProps) => {
  const circleId = route?.params?.circleId;
  const firstName = String(route?.params?.name || 'friend').split(' ')[0];
  const title = `Love Notes with ${firstName}`;
  const [tab, setTab] = useState<'sent' | 'received'>(
    route?.params?.tab === 'received' ? 'received' : 'sent',
  );

  const { data: allNotes = [], isLoading } = useLoveNoteHistory(circleId);
  const sentCount = allNotes.filter((n) => n.direction === 'sent').length;
  const receivedCount = allNotes.length - sentCount;
  const notes = allNotes.filter((n) => n.direction === tab);
  const emptyMessage =
    tab === 'sent'
      ? `You haven't sent ${firstName} a love note yet.`
      : `${firstName} hasn't sent you a love note yet.`;

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
          <MaskedView maskElement={<Text style={styles.headerTitleMask}>{title}</Text>}>
            <LinearGradient
              colors={['#ca9ad6', '#70d0dd']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={[styles.headerTitleMask, { opacity: 0 }]}>{title}</Text>
            </LinearGradient>
          </MaskedView>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.tabs}>
        {(
          [
            { key: 'sent', label: `Sent (${sentCount})` },
            { key: 'received', label: `Received (${receivedCount})` },
          ] as const
        ).map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading && [0, 1, 2].map((i) => <SkeletonRow key={`skeleton-${i}`} avatarSize={0} />)}

        {!isLoading && notes.length === 0 && <Text style={styles.emptyText}>{emptyMessage}</Text>}

        {groupByMonth(notes).map((group) => (
          <View key={group.month}>
            <Text style={styles.monthLabel}>{group.month}</Text>
            {group.notes.map((note) => (
              <View
                key={note.id}
                style={[styles.noteCard, note.direction === 'received' && styles.noteCardReceived]}
              >
                <Text style={styles.noteText}>"{note.text}"</Text>
                <Text style={styles.noteDate}>
                  {formatDate(note.created_at, { day: 'numeric', month: 'short' })} ·{' '}
                  {formatDate(note.created_at, { hour: 'numeric', minute: '2-digit' })}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
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
    flex: 1,
    alignItems: 'center',
  },
  headerTitleMask: {
    fontSize: typeScale['2xl'],
    fontFamily: 'Handlee_400Regular',
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 4,
    borderRadius: 14,
    backgroundColor: '#f4e8f7',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: typeScale.base,
    fontFamily: 'Handlee_400Regular',
    color: '#a89bb5',
  },
  tabTextActive: {
    color: '#6b3a8a',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  monthLabel: {
    fontSize: typeScale.sm,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 8,
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  noteCardReceived: {
    backgroundColor: '#fdf6ff',
    borderLeftWidth: 3,
    borderLeftColor: '#ca9ad6',
  },
  noteText: {
    fontSize: typeScale.base,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    lineHeight: 22,
  },
  noteDate: {
    marginTop: 6,
    alignSelf: 'flex-end',
    fontSize: typeScale.xs,
    fontFamily: 'Handlee_400Regular',
    color: '#a89bb5',
  },
  emptyText: {
    fontSize: typeScale.base,
    fontFamily: 'Handlee_400Regular',
    color: '#999',
    textAlign: 'center',
    paddingVertical: 40,
  },
});

export default LoveNoteHistoryScreen;
