import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Path, Circle, Line, Polyline } from 'react-native-svg';
import { getPeopleYouMayKnow, dismissSuggestion, quickAddToCircle, searchUsers, getCircles } from '../services/api';
import { CustomAlert } from '../components';
import useAlert from '../hooks/useAlert';

// Icons
const BackIcon = ({ size = 24, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

const UsersIcon = ({ size = 24, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <Circle cx="9" cy="7" r="4" />
    <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
);

const UserPlusIcon = ({ size = 20, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <Circle cx="8.5" cy="7" r="4" />
    <Line x1="20" y1="8" x2="20" y2="14" />
    <Line x1="23" y1="11" x2="17" y2="11" />
  </Svg>
);

const XIcon = ({ size = 20, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="18" y1="6" x2="6" y2="18" />
    <Line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
);

const CheckIcon = ({ size = 18, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="20 6 9 17 4 12" />
  </Svg>
);

const SearchIcon = ({ size = 20, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="11" cy="11" r="8" />
    <Line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Svg>
);

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getMutualText = (count) => {
  if (!count || count === 0) return 'Suggested for you';
  if (count === 1) return '1 mutual friend';
  return `${count} mutual friends`;
};

const DiscoverScreen = ({ navigation }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addingIds, setAddingIds] = useState({});
  const [dismissingIds, setDismissingIds] = useState({});

  // Request pipeline — a React-state map of users we've sent a friend
  // request to (or that just accepted). Each entry holds the full card
  // data plus a status:
  //
  //   'requested' — request sent, waiting for the other side to accept.
  //                 Card shows muted "Requested" button.
  //   'accepted'  — the other side accepted. Card shows green "Accepted"
  //                 button and is removed ACCEPTED_HOLD_MS later.
  //
  // The render combines pipeline cards with backend lists (suggestions /
  // search results), so a pipeline card stays on screen regardless of
  // what `getPeopleYouMayKnow` returns. This is the fix for the bug
  // where tapping Add to Circle would make the card vanish — the backend
  // dismisses the suggestion immediately on quickAdd, but our pipeline
  // owns the card visually until the request resolves.
  const [pipeline, setPipeline] = useState({});  // { [userId]: { id, name, ..., status } }
  const ACCEPTED_HOLD_MS = 2000;

  // Latest searchQuery, mirrored into a ref so the polling interval below
  // can read the current value without stale-closure issues.
  const searchQueryRef = useRef('');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchDebounce = useRef(null);

  // Custom alert hook
  const { alertConfig, showSuccess, showError, hideAlert } = useAlert();

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef([]).current;

  // Pure transform of the backend suggestion response into card objects.
  // The `status` field is intentionally absent here — the pipeline owns
  // request/accept state, and the render combines both lists.
  const buildSuggestions = (rawSuggestions) =>
    (rawSuggestions || []).map((s) => {
      const id = s.user?.id || s.suggestionId || s.id;
      return {
        id,
        name: s.user?.name || s.name || 'Unknown',
        photo: s.user?.photo || s.photo,
        avatar: s.user?.avatar || s.avatar,
        mutualFriends: s.mutualFriend ? 1 : 0,
        reason: s.reason,
      };
    });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Refresh both backend lists. The pipeline state is updated separately
  // (it owns request/accept transitions), so this function only writes
  // to `suggestions` and `searchResults`.
  const refreshAll = useCallback(async () => {
    const q = (searchQueryRef.current || '').trim();
    try {
      const [suggResp, circlesResp, searchResp] = await Promise.all([
        getPeopleYouMayKnow().catch(() => ({ suggestions: [] })),
        getCircles().catch(() => ({ contacts: [] })),
        q.length >= 2 ? searchUsers(q).catch(() => ({ users: [] })) : Promise.resolve(null),
      ]);

      const contacts = circlesResp?.contacts || circlesResp?.circles || [];
      const acceptedIds = new Set(
        contacts
          .filter((c) => c.status === 'accepted')
          .map((c) => c.member?.id || c.member_id || c.memberId)
          .filter(Boolean)
      );

      // Flip any pipeline cards whose user just accepted into the green
      // "Accepted" state, then schedule their removal after the hold
      // window. We compare against the latest pipeline via the functional
      // updater so we don't miss anything that was added between polls.
      setPipeline((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const id of Object.keys(prev)) {
          if (acceptedIds.has(id) && prev[id].status === 'requested') {
            next[id] = { ...prev[id], status: 'accepted' };
            changed = true;
            // Schedule removal (side effect — fine here, but only run it
            // once per id since we only enter this branch when the status
            // transitions from requested → accepted).
            setTimeout(() => {
              setPipeline((curr) => {
                if (!curr[id]) return curr;
                const { [id]: _gone, ...rest } = curr;
                return rest;
              });
            }, ACCEPTED_HOLD_MS);
          }
        }
        return changed ? next : prev;
      });

      // Backend suggestions, minus already-accepted users (they live in
      // your contacts list, not Discover). No sticky merging — the
      // pipeline cards are added in the render layer.
      setSuggestions(
        buildSuggestions(suggResp?.suggestions || suggResp || []).filter(
          (u) => !acceptedIds.has(u.id)
        )
      );

      if (searchResp) {
        const users = (searchResp.users || []).map((u) => ({
          id: u.id,
          name: u.name,
          photo: u.photo,
          avatar: u.avatar,
          email: u.email,
          mutualFriends: 0,
          reason: u.email || 'Tap to send a request',
        }));
        setSearchResults(users.filter((u) => !acceptedIds.has(u.id)));
      }
    } catch (error) {
      console.log('Discover refresh failed:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch on focus, then poll every 12s while focused so a card flips off
  // the screen as soon as the recipient accepts — even when the user
  // never leaves Discover. Polling stops on blur.
  useFocusEffect(
    useCallback(() => {
      refreshAll();
      const interval = setInterval(refreshAll, 12000);
      return () => clearInterval(interval);
    }, [refreshAll])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    // Pull-to-refresh runs the same full refresh as the background poll
    // so the search list also re-runs and accepted users get removed.
    refreshAll().finally(() => setRefreshing(false));
  };

  // Debounced user search (300ms). Re-runs whenever searchQuery changes.
  useEffect(() => {
    // Mirror the live query so the polling closure can read it.
    searchQueryRef.current = searchQuery;

    if (searchDebounce.current) clearTimeout(searchDebounce.current);

    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    searchDebounce.current = setTimeout(async () => {
      try {
        const data = await searchUsers(q);
        const users = (data.users || []).map((u) => ({
          id: u.id,
          name: u.name,
          photo: u.photo,
          avatar: u.avatar,
          email: u.email,
          mutualFriends: 0,
          reason: u.email || 'Tap to send a request',
        }));
        setSearchResults(users);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
    };
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleAddToCircle = async (user) => {
    const userId = user._id || user.id;

    try {
      setAddingIds((prev) => ({ ...prev, [userId]: true }));

      await quickAddToCircle(userId, 'Friend');

      // Put the user into the pipeline so the card renders as "Requested"
      // and stays on screen until the other party accepts (or 2s after
      // they do). The render combines this with the backend list, so the
      // card is guaranteed visible even though the backend immediately
      // dismisses the suggestion when quickAdd runs.
      setPipeline((prev) => ({
        ...prev,
        [userId]: {
          id: userId,
          name: user.name,
          photo: user.photo,
          avatar: user.avatar,
          email: user.email,
          mutualFriends: user.mutualFriends || 0,
          reason: user.reason,
          status: 'requested',
        },
      }));

      showSuccess(
        `Request sent to ${user.name}. You'll see their preferences once they accept.`
      );
    } catch (error) {
      console.log('Error sending friend request:', error);
      showError('Failed to send request. Please try again.');
    } finally {
      setAddingIds((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleDismiss = async (user) => {
    const userId = user._id || user.id;

    try {
      setDismissingIds(prev => ({ ...prev, [userId]: true }));

      await dismissSuggestion(userId);

      // Remove from both lists
      setSuggestions(prev => prev.filter(s => (s._id || s.id) !== userId));
      setSearchResults(prev => prev.filter(s => (s._id || s.id) !== userId));
    } catch (error) {
      console.error('Error dismissing suggestion:', error);
    } finally {
      setDismissingIds(prev => ({ ...prev, [userId]: false }));
    }
  };

  const renderSuggestionCard = (user, index) => {
    const userId = user._id || user.id;
    const isAdding = addingIds[userId];
    const isDismissing = dismissingIds[userId];

    return (
      <View key={userId} style={styles.card}>
        <View style={styles.cardHeader}>
          <LinearGradient
            colors={['#ca9ad6', '#70d0dd']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarContainer}
          >
            <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
          </LinearGradient>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.mutualText}>{getMutualText(user.mutualFriends)}</Text>
          </View>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={() => handleDismiss(user)}
            disabled={isDismissing}
          >
            {isDismissing ? (
              <ActivityIndicator size="small" color="#6b3a8a" />
            ) : (
              <XIcon size={18} color="#6b3a8a" />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => !user.status && handleAddToCircle(user)}
          disabled={isAdding || !!user.status}
          activeOpacity={user.status ? 1 : 0.7}
        >
          <LinearGradient
            colors={
              user.status === 'accepted'
                ? ['#4caf50', '#66bb6a']
                : user.status === 'requested'
                  ? ['#e8dced', '#e8dced']
                  : ['#ca9ad6', '#70d0dd']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addButtonGradient}
          >
            {isAdding ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : user.status === 'accepted' ? (
              <>
                <CheckIcon size={18} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Accepted</Text>
              </>
            ) : user.status === 'requested' ? (
              <Text style={[styles.addButtonText, { color: '#6b3a8a' }]}>Requested</Text>
            ) : (
              <>
                <UserPlusIcon size={18} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add to Circle</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <BackIcon size={24} color="#6b3a8a" />
          </TouchableOpacity>
          <MaskedView
            maskElement={
              <Text style={styles.headerTitleMask}>Discover</Text>
            }
          >
            <LinearGradient
              colors={['#ca9ad6', '#70d0dd']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={[styles.headerTitleMask, { opacity: 0 }]}>Discover</Text>
            </LinearGradient>
          </MaskedView>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ca9ad6" />
          <Text style={styles.loadingText}>Finding people...</Text>
        </View>
      </View>
    );
  }

  // Combine backend lists with the pipeline so request/accept cards stay
  // on screen regardless of what the backend returns. Pipeline cards take
  // precedence (they carry the live `status`).
  const pipelineCards = Object.values(pipeline);
  const displayedSuggestions = [
    ...suggestions.filter((s) => !pipeline[s.id]),
    ...pipelineCards,
  ];
  const _q = searchQuery.trim().toLowerCase();
  const matchingPipelineCards = _q
    ? pipelineCards.filter((p) => p.name?.toLowerCase().includes(_q))
    : [];
  const displayedSearchResults = [
    ...searchResults.filter((s) => !pipeline[s.id]),
    ...matchingPipelineCards,
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#ccf9ff', '#e0f7fa', '#FFFFFF']}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <Animated.View style={[
        styles.header,
        {
          opacity: headerAnim,
          transform: [{
            translateY: headerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 0],
            }),
          }],
        }
      ]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <BackIcon size={24} color="#6b3a8a" />
        </TouchableOpacity>
        <MaskedView
          maskElement={
            <Text style={styles.headerTitleMask}>Discover</Text>
          }
        >
          <LinearGradient
            colors={['#ca9ad6', '#70d0dd']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[styles.headerTitleMask, { opacity: 0 }]}>Discover</Text>
          </LinearGradient>
        </MaskedView>
        <View style={styles.placeholder} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#ca9ad6"
            colors={['#ca9ad6']}
          />
        }
      >
        {/* Search Bar */}
        <Animated.View style={[styles.searchBar, { opacity: contentAnim }]}>
          <SearchIcon size={18} color="#ca9ad6" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email"
            placeholderTextColor="#b8a3c7"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} hitSlop={10} style={styles.searchClear}>
              <XIcon size={14} color="#6b3a8a" />
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* When user is searching, show search results and hide the
            People You May Know list. */}
        {searchQuery.trim().length >= 2 ? (
          <Animated.View style={{ opacity: contentAnim }}>
            <View style={styles.resultMeta}>
              <Text style={styles.resultMetaText}>
                {searching
                  ? 'Searching…'
                  : `${displayedSearchResults.length} ${displayedSearchResults.length === 1 ? 'result' : 'results'} for "${searchQuery.trim()}"`}
              </Text>
            </View>

            {searching ? (
              <View style={styles.searchLoading}>
                <ActivityIndicator size="small" color="#ca9ad6" />
              </View>
            ) : displayedSearchResults.length > 0 ? (
              displayedSearchResults.map((user, index) => renderSuggestionCard(user, index))
            ) : (
              <View style={styles.emptyCompact}>
                <View style={styles.emptyIconSmall}>
                  <SearchIcon size={32} color="#ca9ad6" />
                </View>
                <Text style={styles.emptyTitle}>No users found</Text>
                <Text style={styles.emptyText}>
                  Try a different name or email
                </Text>
              </View>
            )}
          </Animated.View>
        ) : (
          <Animated.View style={{ opacity: contentAnim }}>
            {displayedSuggestions.length > 0 ? (
              <>
                {/* Section header only appears when there ARE suggestions */}
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <UsersIcon size={22} color="#ca9ad6" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sectionTitle}>People You May Know</Text>
                    <Text style={styles.sectionSubtitle}>
                      Friends of your friends
                    </Text>
                  </View>
                </View>
                {displayedSuggestions.map((user, index) => renderSuggestionCard(user, index))}
              </>
            ) : (
              <View style={styles.emptyCompact}>
                <View style={styles.emptyIconSmall}>
                  <UsersIcon size={36} color="#ca9ad6" />
                </View>
                <Text style={styles.emptyTitle}>No Suggestions Yet</Text>
                <Text style={styles.emptyText}>
                  Search for a friend above, or invite people you know
                </Text>
                <TouchableOpacity
                  style={styles.inviteButton}
                  onPress={() => navigation.navigate('Invitations')}
                >
                  <Text style={styles.inviteButtonText}>Invite Friends Instead</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Custom Alert */}
      <CustomAlert {...alertConfig} onClose={hideAlert} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
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
  placeholder: {
    width: 44,
  },
  headerTitleMask: {
    fontSize: 22,
    fontFamily: 'Handlee_400Regular',
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(202, 154, 214, 0.25)',
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    padding: 0,
    height: 22,
  },
  searchClear: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fbe5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchLoading: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  resultMeta: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    marginBottom: 8,
  },
  resultMetaText: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  emptyCompact: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 32,
  },
  emptyIconSmall: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: '#fbe5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#fbe5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 17,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  mutualText: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginTop: 3,
  },
  dismissButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  addButtonText: {
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: '#fbe5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    textAlign: 'center',
    lineHeight: 22,
  },
  inviteButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#fbe5f5',
  },
  inviteButtonText: {
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#ca9ad6',
  },
});

export default DiscoverScreen;
