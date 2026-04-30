import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Path, Circle, Line, Polyline } from 'react-native-svg';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../services/api';

// Icons
const BackIcon = ({ size = 24, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

const BellIcon = ({ size = 24, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Svg>
);

const CheckAllIcon = ({ size = 20, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="9 11 12 14 22 4" />
    <Path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </Svg>
);

const TrashIcon = ({ size = 18, color = '#e53935' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="3 6 5 6 21 6" />
    <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Svg>
);

const getNotificationIcon = (type) => {
  switch (type) {
    case 'event_reminder':
      return '🎂';
    case 'invitation_accepted':
      return '✉️';
    case 'profile_incomplete':
      return '👤';
    case 'new_friend':
      return '👥';
    case 'circle_added':
      return '💝';
    default:
      return '🔔';
  }
};

const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getNotifications();
      const notificationsList = response.notifications || [];

      // Transform API data
      const transformedNotifications = notificationsList.map(n => ({
        id: n.id || n._id,
        type: n.type,
        title: n.title,
        body: n.body || n.message,
        is_read: n.isRead || n.is_read,
        created_at: new Date(n.createdAt || n.created_at),
      }));

      setNotifications(transformedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(listAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const onRefresh = () => {
    fetchNotifications(true);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#ccf9ff', '#fbe5f5', '#FFFFFF']}
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
        <View style={styles.headerCenter}>
          <MaskedView
            maskElement={
              <Text style={styles.headerTitleMask}>Notifications</Text>
            }
          >
            <LinearGradient
              colors={['#ca9ad6', '#70d0dd']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={[styles.headerTitleMask, { opacity: 0 }]}>Notifications</Text>
            </LinearGradient>
          </MaskedView>
          {unreadCount > 0 && (
            <View style={styles.badgeContainer}>
              <LinearGradient
                colors={['#f4cae8', '#70d0dd']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.badge}
              >
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </LinearGradient>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.markAllButton}
          onPress={handleMarkAllRead}
        >
          <CheckAllIcon size={20} color="#6b3a8a" />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ca9ad6"
          />
        }
      >
        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ca9ad6" />
          </View>
        )}

        {!loading && notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={['#fbe5f5', '#ccf9ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.emptyIconBg}
            >
              <BellIcon size={40} color="#ca9ad6" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>
              You're all caught up! Check back later for updates.
            </Text>
          </View>
        ) : !loading && (
          <Animated.View style={[styles.listContainer, { opacity: listAnim }]}>
            {notifications.map((notification, index) => (
              <View
                key={notification.id}
                style={[
                  styles.notificationCard,
                  !notification.is_read && styles.unreadCard,
                ]}
              >
                <TouchableOpacity
                  style={styles.notificationContent}
                  onPress={() => handleMarkRead(notification.id)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={notification.is_read
                      ? ['#f8f9fa', '#f8f9fa']
                      : ['#fbe5f5', '#ccf9ff']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.notificationIcon}
                  >
                    <Text style={styles.notificationEmoji}>
                      {getNotificationIcon(notification.type)}
                    </Text>
                  </LinearGradient>
                  <View style={styles.notificationText}>
                    <View style={styles.notificationHeader}>
                      <Text style={[
                        styles.notificationTitle,
                        !notification.is_read && styles.unreadTitle
                      ]}>
                        {notification.title}
                      </Text>
                      {!notification.is_read && (
                        <View style={styles.unreadDot} />
                      )}
                    </View>
                    <Text style={styles.notificationBody} numberOfLines={2}>
                      {notification.body}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {getTimeAgo(notification.created_at)}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(notification.id)}
                >
                  <TrashIcon size={18} color="#e57373" />
                </TouchableOpacity>
              </View>
            ))}
          </Animated.View>
        )}

        <View style={{ height: 40 }} />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitleMask: {
    fontSize: 22,
    fontFamily: 'Handlee_400Regular',
    textAlign: 'center',
  },
  badgeContainer: {
    marginLeft: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
  },
  markAllButton: {
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  listContainer: {
    gap: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#ca9ad6',
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  notificationIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationEmoji: {
    fontSize: 24,
  },
  notificationText: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notificationTitle: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    flex: 1,
  },
  unreadTitle: {
    fontFamily: 'Handlee_400Regular',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ca9ad6',
  },
  notificationBody: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginTop: 4,
  },
  notificationTime: {
    fontSize: 11,
    fontFamily: 'Handlee_400Regular',
    color: '#999',
    marginTop: 6,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
});

export default NotificationsScreen;
