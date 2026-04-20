import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

const { width } = Dimensions.get('window');

// Contact colors
const avatarColors = [
  ['#E91E8A', '#FF6B9D'],
  ['#5DADE2', '#85C1E9'],
  ['#9C27B0', '#BA68C8'],
  ['#FF9800', '#FFB74D'],
  ['#4CAF50', '#81C784'],
];

// Mock contacts data grouped
const contactsData = [
  { id: '1', name: 'Anna Martinez', birthday: 'May 15', color: 0 },
  { id: '2', name: 'Ben Wilson', birthday: 'Aug 22', color: 1 },
  { id: '3', name: 'Caroline Smith', birthday: 'Apr 15', color: 2 },
  { id: '4', name: 'Claude Anderson', birthday: 'Mar 24', color: 0 },
  { id: '5', name: 'David Brown', birthday: 'Dec 10', color: 3 },
  { id: '6', name: 'Emma Davis', birthday: 'Jan 5', color: 4 },
  { id: '7', name: 'Mike Johnson', birthday: 'Apr 28', color: 1 },
  { id: '8', name: 'Susanne Lee', birthday: 'Mar 25', color: 2 },
];

const ContactsScreen = ({ navigation }) => {
  const [contacts, setContacts] = useState(contactsData);
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardAnims = useRef(contactsData.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.stagger(60, cardAnims.map(anim =>
      Animated.spring(anim, {
        toValue: 1,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      })
    )).start();
  }, []);

  const getInitials = (name) => {
    const parts = name.split(' ');
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`
      : name.substring(0, 2);
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Group contacts by first letter
  const groupedContacts = filteredContacts.reduce((groups, contact) => {
    const letter = contact.name[0].toUpperCase();
    if (!groups[letter]) {
      groups[letter] = [];
    }
    groups[letter].push(contact);
    return groups;
  }, {});

  const renderGridView = () => (
    <View style={styles.gridContainer}>
      {filteredContacts.map((contact, index) => (
        <Animated.View
          key={contact.id}
          style={[
            styles.gridCard,
            {
              opacity: cardAnims[index],
              transform: [{
                scale: cardAnims[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                })
              }]
            }
          ]}
        >
          <TouchableOpacity style={styles.gridCardInner} activeOpacity={0.9}>
            <LinearGradient
              colors={avatarColors[contact.color]}
              style={styles.gridAvatar}
            >
              <Text style={styles.gridAvatarText}>{getInitials(contact.name)}</Text>
            </LinearGradient>
            <Text style={styles.gridName} numberOfLines={1}>{contact.name.split(' ')[0]}</Text>
            <View style={styles.gridBirthdayTag}>
              <Ionicons name="gift-outline" size={10} color="#E91E8A" />
              <Text style={styles.gridBirthday}>{contact.birthday}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );

  const renderListView = () => (
    <View style={styles.listContainer}>
      {Object.keys(groupedContacts).sort().map(letter => (
        <View key={letter}>
          <Text style={styles.letterHeader}>{letter}</Text>
          {groupedContacts[letter].map((contact, index) => (
            <Animated.View
              key={contact.id}
              style={[
                styles.listCard,
                {
                  opacity: cardAnims[index],
                  transform: [{
                    translateX: cardAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    })
                  }]
                }
              ]}
            >
              <TouchableOpacity style={styles.listCardInner} activeOpacity={0.9}>
                <LinearGradient
                  colors={avatarColors[contact.color]}
                  style={styles.listAvatar}
                >
                  <Text style={styles.listAvatarText}>{getInitials(contact.name)}</Text>
                </LinearGradient>
                <View style={styles.listInfo}>
                  <Text style={styles.listName}>{contact.name}</Text>
                  <View style={styles.listMeta}>
                    <Ionicons name="gift-outline" size={12} color={colors.textSecondary} />
                    <Text style={styles.listBirthday}>{contact.birthday}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.listAction}>
                  <Ionicons name="chatbubble-outline" size={20} color="#5DADE2" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.listAction}>
                  <Ionicons name="ellipsis-vertical" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Contacts</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.viewToggle, viewMode === 'grid' && styles.viewToggleActive]}
              onPress={() => setViewMode('grid')}
            >
              <Ionicons
                name="grid-outline"
                size={18}
                color={viewMode === 'grid' ? '#FFFFFF' : colors.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewToggle, viewMode === 'list' && styles.viewToggleActive]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons
                name="list-outline"
                size={18}
                color={viewMode === 'list' ? '#FFFFFF' : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            placeholderTextColor={colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{contacts.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>3</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>2</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {viewMode === 'grid' ? renderGridView() : renderListView()}
        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab}>
        <LinearGradient
          colors={['#E91E8A', '#C91876']}
          style={styles.fabGradient}
        >
          <Ionicons name="person-add" size={24} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomAction}>
          <Ionicons name="funnel-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.bottomActionText}>Filter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomAction}>
          <Ionicons name="swap-vertical-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.bottomActionText}>Sort</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomActionPrimary}>
          <LinearGradient
            colors={['#5DADE2', '#3498DB']}
            style={styles.bottomActionGradient}
          >
            <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" />
            <Text style={styles.bottomActionPrimaryText}>Import</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 4,
  },
  viewToggle: {
    width: 36,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggleActive: {
    backgroundColor: '#E91E8A',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E91E8A',
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#F0F0F0',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  // Grid View
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    width: (width - 52) / 3,
  },
  gridCardInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  gridAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gridAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gridName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  gridBirthdayTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FDEEF3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gridBirthday: {
    fontSize: 10,
    color: '#E91E8A',
    fontWeight: '500',
  },
  // List View
  listContainer: {},
  letterHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E91E8A',
    marginBottom: 8,
    marginTop: 16,
  },
  listCard: {
    marginBottom: 10,
  },
  listCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  listAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listBirthday: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  listAction: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 160,
    right: 20,
    shadowColor: '#E91E8A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 88,
    left: 20,
    right: 20,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  bottomAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  bottomActionText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  bottomActionPrimary: {
    flex: 1.2,
  },
  bottomActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  bottomActionPrimaryText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ContactsScreen;
