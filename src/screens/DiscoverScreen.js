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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Path, Circle, Line, Polyline } from 'react-native-svg';
import { getPeopleYouMayKnow, dismissSuggestion, quickAddToCircle } from '../services/api';
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

  // Custom alert hook
  const { alertConfig, showSuccess, showError, hideAlert } = useAlert();

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef([]).current;

  const fetchSuggestions = useCallback(async () => {
    try {
      const data = await getPeopleYouMayKnow();
      const rawSuggestions = data.suggestions || data || [];

      // Transform API response to flat user objects
      const transformedSuggestions = rawSuggestions.map(s => ({
        id: s.user?.id || s.suggestionId || s.id,
        name: s.user?.name || s.name || 'Unknown',
        photo: s.user?.photo || s.photo,
        avatar: s.user?.avatar || s.avatar,
        mutualFriends: s.mutualFriend ? 1 : 0,
        reason: s.reason,
      }));

      setSuggestions(transformedSuggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();

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
  }, [fetchSuggestions]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSuggestions();
  };

  const handleAddToCircle = async (user) => {
    const userId = user._id || user.id;

    try {
      setAddingIds(prev => ({ ...prev, [userId]: true }));

      await quickAddToCircle(userId, 'Friend');

      // Remove from suggestions
      setSuggestions(prev => prev.filter(s => (s._id || s.id) !== userId));

      showSuccess(`${user.name} has been added to your circle.`);
    } catch (error) {
      console.error('Error adding to circle:', error);
      showError('Failed to add to circle. Please try again.');
    } finally {
      setAddingIds(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleDismiss = async (user) => {
    const userId = user._id || user.id;

    try {
      setDismissingIds(prev => ({ ...prev, [userId]: true }));

      await dismissSuggestion(userId);

      // Remove from suggestions
      setSuggestions(prev => prev.filter(s => (s._id || s.id) !== userId));
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
          onPress={() => handleAddToCircle(user)}
          disabled={isAdding}
        >
          <LinearGradient
            colors={['#ca9ad6', '#70d0dd']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addButtonGradient}
          >
            {isAdding ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
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
        {/* Section Header */}
        <Animated.View style={[styles.sectionHeader, { opacity: contentAnim }]}>
          <View style={styles.sectionIcon}>
            <UsersIcon size={22} color="#ca9ad6" />
          </View>
          <View>
            <Text style={styles.sectionTitle}>People You May Know</Text>
            <Text style={styles.sectionSubtitle}>
              Connect with friends and build your circle
            </Text>
          </View>
        </Animated.View>

        {/* Suggestions List */}
        <Animated.View style={{ opacity: contentAnim }}>
          {suggestions.length > 0 ? (
            suggestions.map((user, index) => renderSuggestionCard(user, index))
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <UsersIcon size={48} color="#ca9ad6" />
              </View>
              <Text style={styles.emptyTitle}>No Suggestions Yet</Text>
              <Text style={styles.emptyText}>
                We'll show you people you might know as you use the app more
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
