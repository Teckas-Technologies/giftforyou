import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
  RefreshControl,
  Modal,
  ActivityIndicator,
  Share,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Path, Circle, Line, Polyline, Rect } from 'react-native-svg';
import { getInvitations, sendInvitation, resendInvitation } from '../services/api';
import { CustomAlert } from '../components';
import useAlert from '../hooks/useAlert';

// Icons
const BackIcon = ({ size = 24, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

const MailIcon = ({ size = 24, color = '#ca9ad6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <Polyline points="22,6 12,13 2,6" />
  </Svg>
);

const SendIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="22" y1="2" x2="11" y2="13" />
    <Polygon points="22 2 15 22 11 13 2 9 22 2" />
  </Svg>
);

const Polygon = ({ points, ...props }) => (
  <Svg {...props}>
    <Path d={`M${points.split(' ').map((p, i) => (i === 0 ? '' : 'L') + p.replace(',', ' ')).join(' ')}Z`} fill="none" stroke={props.stroke} strokeWidth={props.strokeWidth} />
  </Svg>
);

const PlusIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="12" y1="5" x2="12" y2="19" />
    <Line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
);

const ClockIcon = ({ size = 16, color = '#f9a825' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Polyline points="12 6 12 12 16 14" />
  </Svg>
);

const CheckCircleIcon = ({ size = 16, color = '#4caf50' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <Polyline points="22 4 12 14.01 9 11.01" />
  </Svg>
);

const XCircleIcon = ({ size = 16, color = '#e53935' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Line x1="15" y1="9" x2="9" y2="15" />
    <Line x1="9" y1="9" x2="15" y2="15" />
  </Svg>
);

const RefreshIcon = ({ size = 18, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="23 4 23 10 17 10" />
    <Path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </Svg>
);

const XIcon = ({ size = 24, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="18" y1="6" x2="6" y2="18" />
    <Line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
);

const ShareIcon = ({ size = 18, color = '#6b3a8a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="18" cy="5" r="3" />
    <Circle cx="6" cy="12" r="3" />
    <Circle cx="18" cy="19" r="3" />
    <Line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <Line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
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

const RELATIONSHIPS = [
  'Friend',
  'Family',
  'Colleague',
  'Partner',
  'Other',
];

const getStatusConfig = (status) => {
  switch (status) {
    case 'completed':
      return {
        icon: CheckCircleIcon,
        color: '#4caf50',
        bgColor: '#e8f5e9',
        label: 'Completed',
      };
    case 'opened':
      return {
        icon: ClockIcon,
        color: '#2196f3',
        bgColor: '#e3f2fd',
        label: 'Opened',
      };
    case 'expired':
      return {
        icon: XCircleIcon,
        color: '#e53935',
        bgColor: '#ffebee',
        label: 'Expired',
      };
    case 'pending':
    default:
      return {
        icon: ClockIcon,
        color: '#f9a825',
        bgColor: '#fff8e1',
        label: 'Pending',
      };
  }
};

const formatDate = (date) => {
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
};

const InvitationsScreen = ({ navigation, route }) => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newRelationship, setNewRelationship] = useState('Friend');
  const [filter, setFilter] = useState('all');
  const [prefillContactId, setPrefillContactId] = useState(null);

  // Custom alert hook
  const { alertConfig, showSuccess, showError, hideAlert } = useAlert();

  // Fetch invitations from API
  const fetchInvitations = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getInvitations();
      const invitationsList = response.invitations || [];

      // Transform API data
      const transformedInvitations = invitationsList.map(inv => ({
        id: inv.id || inv._id,
        email: inv.invitee_email || inv.inviteeEmail,
        name: inv.invitee_name || inv.inviteeName,
        status: inv.status,
        sent_at: new Date(inv.last_sent_at || inv.created_at || inv.sentAt || inv.createdAt),
        completed_at: inv.completed_at || inv.respondedAt ? new Date(inv.completed_at || inv.respondedAt) : null,
        relationship: inv.relationship,
        token: inv.token,
        inviteLink: inv.token ? `https://giftbox-frontend-psi.vercel.app/invite/${inv.token}` : null,
      }));

      setInvitations(transformedInvitations);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  // Handle auto-fill from route params (when navigating from a contact)
  useEffect(() => {
    if (route?.params?.contact) {
      const { contact } = route.params;
      setNewName(contact.name || '');
      setNewEmail(contact.email || '');
      setNewRelationship(contact.relationship || 'Friend');
      setPrefillContactId(contact.id || null);
      // Auto-open the modal with prefilled data
      setTimeout(() => {
        openModal();
      }, 300);
      // Clear the params to prevent re-opening on back navigation
      navigation.setParams({ contact: null });
    }
  }, [route?.params?.contact]);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;
  const fabAnim = useRef(new Animated.Value(0)).current;
  const fabPulse = useRef(new Animated.Value(1)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(listAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(fabAnim, {
          toValue: 1,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // FAB pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(fabPulse, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fabPulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const openModal = () => {
    setShowModal(true);
    Animated.spring(modalAnim, {
      toValue: 1,
      friction: 8,
      tension: 65,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowModal(false);
      setNewName('');
      setNewEmail('');
      setNewMessage('');
      setNewRelationship('Friend');
      setPrefillContactId(null);
    });
  };

  const handleShareLink = async (inviteLink, inviteeName) => {
    try {
      await Share.share({
        message: `Hey ${inviteeName}! I'd love to give you the perfect gift. Fill out this quick questionnaire so I know what you'd love: ${inviteLink}`,
        title: 'GiftBox4you Invitation',
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleSendInvitation = async () => {
    if (!newName.trim() || !newEmail.trim()) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      showError('Please enter a valid email address');
      return;
    }

    try {
      setSending(true);
      const response = await sendInvitation({
        inviteeName: newName.trim(),
        inviteeEmail: newEmail.trim().toLowerCase(),
        personalMessage: newMessage.trim() || null,
        relationship: newRelationship,
      });

      // Get the invite link from response
      const inviteLink = response.invitation?.inviteLink;

      // Refresh the list
      await fetchInvitations();
      closeModal();

      // Open share sheet with the invite link
      if (inviteLink) {
        await handleShareLink(inviteLink, newName.trim());
      }

      showSuccess('Invitation created! Share the link with your friend.');
    } catch (error) {
      // Show user-friendly message for already invited error
      if (error.message?.toLowerCase().includes('already')) {
        showError(`You've already invited ${newName.trim()}. Check your pending invitations.`);
      } else {
        showError(error.message || 'Failed to create invitation');
      }
    } finally {
      setSending(false);
    }
  };

  const handleResend = async (id) => {
    try {
      await resendInvitation(id);
      // Refresh the list
      await fetchInvitations();
      showSuccess('Invitation resent successfully!');
    } catch (error) {
      showError(error.message || 'Failed to resend invitation');
    }
  };

  const onRefresh = () => {
    fetchInvitations(true);
  };

  const filteredInvitations = invitations.filter(inv => {
    if (filter === 'all') return true;
    if (filter === 'pending') return inv.status === 'pending' || inv.status === 'opened';
    return inv.status === filter;
  });

  const stats = {
    total: invitations.length,
    pending: invitations.filter(i => i.status === 'pending' || i.status === 'opened').length,
    completed: invitations.filter(i => i.status === 'completed').length,
  };

  const filterOptions = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'completed', label: 'Completed' },
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
        <View style={styles.headerCenter}>
          <MaskedView
            maskElement={
              <Text style={styles.headerTitleMask}>Invite Friends</Text>
            }
          >
            <LinearGradient
              colors={['#ca9ad6', '#70d0dd']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={[styles.headerTitleMask, { opacity: 0 }]}>Invite Friends</Text>
            </LinearGradient>
          </MaskedView>
        </View>
        <View style={{ width: 44 }} />
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
        {/* Stats Cards */}
        <Animated.View style={[styles.statsContainer, { opacity: listAnim }]}>
          <LinearGradient
            colors={['#fbe5f5', '#ccf9ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statsCard}
          >
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total Sent</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#f9a825' }]}>{stats.pending}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#4caf50' }]}>{stats.completed}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Filter Tabs */}
        <Animated.View style={[styles.filterContainer, { opacity: listAnim }]}>
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              onPress={() => setFilter(option.key)}
              style={[
                styles.filterTab,
                filter === option.key && styles.filterTabActive,
              ]}
            >
              {filter === option.key ? (
                <LinearGradient
                  colors={['#ca9ad6', '#70d0dd']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.filterTabGradient}
                >
                  <Text style={styles.filterTextActive}>{option.label}</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.filterText}>{option.label}</Text>
              )}
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ca9ad6" />
          </View>
        )}

        {/* Invitations List */}
        {!loading && filteredInvitations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={['#fbe5f5', '#ccf9ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.emptyIconBg}
            >
              <UserPlusIcon size={40} color="#ca9ad6" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>No Invitations Yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap + to invite friends via WhatsApp, SMS, or any app. They'll fill a questionnaire about their gift preferences.
            </Text>
          </View>
        ) : !loading && (
          <Animated.View style={[styles.listContainer, { opacity: listAnim }]}>
            {filteredInvitations.map((invitation, index) => {
              const statusConfig = getStatusConfig(invitation.status);
              const StatusIcon = statusConfig.icon;

              return (
                <View key={invitation.id} style={styles.invitationCard}>
                  <View style={styles.invitationContent}>
                    <LinearGradient
                      colors={['#fbe5f5', '#ccf9ff']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.avatarContainer}
                    >
                      <Text style={styles.avatarText}>
                        {invitation.name.charAt(0).toUpperCase()}
                      </Text>
                    </LinearGradient>
                    <View style={styles.invitationDetails}>
                      <Text style={styles.invitationName}>{invitation.name}</Text>
                      <Text style={styles.invitationEmail}>{invitation.email}</Text>
                      <View style={styles.invitationMeta}>
                        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                          <StatusIcon size={12} color={statusConfig.color} />
                          <Text style={[styles.statusText, { color: statusConfig.color }]}>
                            {statusConfig.label}
                          </Text>
                        </View>
                        <Text style={styles.sentTime}>
                          Sent {formatDate(invitation.sent_at)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    {invitation.status === 'pending' && invitation.inviteLink && (
                      <TouchableOpacity
                        style={styles.shareButton}
                        onPress={() => handleShareLink(invitation.inviteLink, invitation.name)}
                      >
                        <ShareIcon size={18} color="#6b3a8a" />
                      </TouchableOpacity>
                    )}
                    {invitation.status === 'pending' && (
                      <TouchableOpacity
                        style={styles.resendButton}
                        onPress={() => handleResend(invitation.id)}
                      >
                        <RefreshIcon size={18} color="#6b3a8a" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </Animated.View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FAB */}
      <Animated.View style={[
        styles.fabContainer,
        {
          opacity: fabAnim,
          transform: [
            { scale: Animated.multiply(fabAnim, fabPulse) },
          ],
        }
      ]}>
        <TouchableOpacity onPress={openModal} activeOpacity={0.8}>
          <LinearGradient
            colors={['#ca9ad6', '#70d0dd']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fab}
          >
            <PlusIcon size={28} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Send Invitation Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlayInner}>
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                onPress={() => {
                  Keyboard.dismiss();
                  closeModal();
                }}
                activeOpacity={1}
              />
              <Animated.View style={[
                styles.modalContainer,
                {
                  opacity: modalAnim,
                  transform: [{
                    scale: modalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  }, {
                    translateY: modalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  }],
                }
              ]}>
                <LinearGradient
                  colors={['#FFFFFF', '#fbe5f5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalContent}
                >
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Invite Friend</Text>
                    <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                      <XIcon size={24} color="#6b3a8a" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.modalSubtitle}>
                    Create an invite link to share via WhatsApp, SMS, or any app
                  </Text>

                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    style={styles.modalScrollContent}
                  >
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Friend's Name *</Text>
                      <TextInput
                        style={styles.input}
                        value={newName}
                        onChangeText={setNewName}
                        placeholder="Enter their name"
                        placeholderTextColor="#999"
                        returnKeyType="next"
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Friend's Email *</Text>
                      <TextInput
                        style={styles.input}
                        value={newEmail}
                        onChangeText={setNewEmail}
                        placeholder="Enter their email"
                        placeholderTextColor="#999"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        returnKeyType="next"
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Relationship</Text>
                      <View style={styles.relationshipContainer}>
                        {RELATIONSHIPS.map((rel) => (
                          <TouchableOpacity
                            key={rel}
                            style={[
                              styles.relationshipChip,
                              newRelationship === rel && styles.relationshipChipActive,
                            ]}
                            onPress={() => {
                              Keyboard.dismiss();
                              setNewRelationship(rel);
                            }}
                          >
                            {newRelationship === rel ? (
                              <LinearGradient
                                colors={['#ca9ad6', '#70d0dd']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.relationshipChipGradient}
                              >
                                <Text style={styles.relationshipTextActive}>{rel}</Text>
                              </LinearGradient>
                            ) : (
                              <Text style={styles.relationshipText}>{rel}</Text>
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Personal Message (optional)</Text>
                      <TextInput
                        style={[styles.input, styles.inputMultiline]}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        placeholder="Add a personal note..."
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                        returnKeyType="done"
                        blurOnSubmit={true}
                        onSubmitEditing={Keyboard.dismiss}
                      />
                    </View>

                    <TouchableOpacity
                      style={[styles.sendButton, (!newName.trim() || !newEmail.trim()) && styles.sendButtonDisabled]}
                      onPress={() => {
                        Keyboard.dismiss();
                        handleSendInvitation();
                      }}
                      disabled={!newName.trim() || !newEmail.trim() || sending}
                    >
                      <LinearGradient
                        colors={(newName.trim() && newEmail.trim()) ? ['#ca9ad6', '#70d0dd'] : ['#ccc', '#ccc']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.sendButtonGradient}
                      >
                        {sending ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <>
                            <UserPlusIcon size={20} color="#FFFFFF" />
                            <Text style={styles.sendButtonText}>Create & Share Link</Text>
                          </>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                    <View style={{ height: 20 }} />
                  </ScrollView>
                </LinearGradient>
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

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
    fontSize: 22,
    fontFamily: 'Handlee_400Regular',
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(107, 58, 138, 0.2)',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  filterTabActive: {},
  filterTabGradient: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  filterText: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    textAlign: 'center',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  filterTextActive: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
  },
  listContainer: {
    gap: 12,
  },
  invitationCard: {
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
  invitationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
  },
  invitationDetails: {
    flex: 1,
  },
  invitationName: {
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  invitationEmail: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginTop: 2,
  },
  invitationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Handlee_400Regular',
  },
  sentTime: {
    fontSize: 11,
    fontFamily: 'Handlee_400Regular',
    color: '#999',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#e3f7fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 110,
    right: 20,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ca9ad6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalOverlayInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  modalScrollContent: {
    flexGrow: 0,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(107, 58, 138, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: 'Handlee_400Regular',
    color: '#330c54',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sendButton: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  sendButtonText: {
    fontSize: 16,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  relationshipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  relationshipChip: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  relationshipChipActive: {},
  relationshipChipGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  relationshipText: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#6b3a8a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    overflow: 'hidden',
  },
  relationshipTextActive: {
    fontSize: 14,
    fontFamily: 'Handlee_400Regular',
    color: '#FFFFFF',
  },
  inputMultiline: {
    height: 80,
    paddingTop: 14,
  },
});

export default InvitationsScreen;
