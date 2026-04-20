import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { GradientText } from '../components';

// Mock contacts data matching HTML preview
const contactsData = [
  { id: '1', name: 'Claude', initials: 'CL', birthday: '24 March', relation: 'Girlfriend', relationType: 'family', avatarColor: 'pink' },
  { id: '2', name: 'Susanne', initials: 'SU', birthday: '25 March', relation: 'Friend', relationType: 'friend', avatarColor: 'blue' },
  { id: '3', name: 'Caroline', initials: 'CA', birthday: '27 March', relation: 'Sister', relationType: 'family', avatarColor: 'pink' },
  { id: '4', name: 'John Miller', initials: 'JO', birthday: '15 April', relation: 'Colleague', relationType: 'work', avatarColor: 'blue' },
  { id: '5', name: 'Emma Wilson', initials: 'EM', birthday: '8 May', relation: 'Friend', relationType: 'friend', avatarColor: 'pink' },
];

const ContactsScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');

  const filteredContacts = contactsData.filter(contact =>
    contact.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const getRelationTagStyle = (relationType) => {
    switch (relationType) {
      case 'family':
        return styles.tagFamily;
      case 'friend':
        return styles.tagFriend;
      case 'work':
        return styles.tagWork;
      default:
        return styles.tagFamily;
    }
  };

  const getRelationTextStyle = (relationType) => {
    switch (relationType) {
      case 'family':
        return styles.tagFamilyText;
      case 'friend':
        return styles.tagFriendText;
      case 'work':
        return styles.tagWorkText;
      default:
        return styles.tagFamilyText;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <GradientText
            style={styles.headerTitle}
            colors={[colors.primary, colors.secondary]}
          >
            Contacts
          </GradientText>
          <Text style={styles.headerSubtitle}>{contactsData.length} contacts saved</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            placeholderTextColor={colors.textLight}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Contacts List */}
        <View style={styles.contactsList}>
          {filteredContacts.map((contact) => (
            <TouchableOpacity key={contact.id} style={styles.contactCard} activeOpacity={0.8}>
              <View style={[
                styles.contactAvatar,
                contact.avatarColor === 'blue' ? styles.avatarBlue : styles.avatarPink
              ]}>
                <Text style={[
                  styles.avatarInitials,
                  contact.avatarColor === 'blue' ? styles.initialsBlue : styles.initialsPink
                ]}>
                  {contact.initials}
                </Text>
              </View>

              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <View style={styles.birthdayRow}>
                  <Ionicons name="calendar-outline" size={12} color={colors.textLight} />
                  <Text style={styles.contactBirthday}>{contact.birthday}</Text>
                </View>
              </View>

              <View style={[styles.relationTag, getRelationTagStyle(contact.relationType)]}>
                <Text style={[styles.relationText, getRelationTextStyle(contact.relationType)]}>
                  {contact.relation}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom spacing for tab bar and FAB */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fabContainer} activeOpacity={0.9}>
        <LinearGradient
          colors={[colors.primaryAccent, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Ionicons name="add" size={28} color={colors.textWhite} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: 'Gifted-Regular',
    fontSize: 26,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontFamily: 'Outfit-Light',
    fontSize: 13,
    color: colors.textLight,
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Outfit-Regular',
    fontSize: 15,
    color: colors.textPrimary,
  },
  contactsList: {
    gap: 10,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPink: {
    backgroundColor: colors.primaryLight,
  },
  avatarBlue: {
    backgroundColor: colors.secondaryLight,
  },
  avatarInitials: {
    fontFamily: 'Outfit-Bold',
    fontSize: 16,
  },
  initialsPink: {
    color: colors.primary,
  },
  initialsBlue: {
    color: colors.secondary,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  birthdayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactBirthday: {
    fontFamily: 'Outfit-Light',
    fontSize: 12,
    color: colors.textLight,
  },
  relationTag: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  tagFamily: {
    backgroundColor: colors.primaryLight,
  },
  tagFriend: {
    backgroundColor: colors.secondaryLight,
  },
  tagWork: {
    backgroundColor: '#E8F5E9',
  },
  relationText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 12,
  },
  tagFamilyText: {
    color: colors.primary,
  },
  tagFriendText: {
    color: colors.secondary,
  },
  tagWorkText: {
    color: '#43A047',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 90,
    right: 20,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primaryAccent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 8,
  },
});

export default ContactsScreen;
