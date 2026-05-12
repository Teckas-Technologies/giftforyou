/**
 * GiftBox4you API Service
 * Base URL is read from EXPO_PUBLIC_API_BASE_URL (.env), with a prod fallback.
 * Uses Supabase Authentication
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'http://116.202.96.159:3000';

// Storage keys
const STORAGE_KEYS = {
  HAS_SEEN_ONBOARDING: '@giftbox_has_seen_onboarding',
};

/**
 * Check if user has seen onboarding (local storage)
 */
export const hasSeenOnboardingLocal = async () => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.HAS_SEEN_ONBOARDING);
    return value === 'true';
  } catch (error) {
    return false;
  }
};

/**
 * Mark onboarding as seen (local storage)
 */
export const markOnboardingSeenLocal = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_ONBOARDING, 'true');
  } catch (error) {
    console.error('Error saving onboarding status:', error);
  }
};

/**
 * Clear local storage on logout
 */
export const clearLocalStorage = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.HAS_SEEN_ONBOARDING);
  } catch (error) {
    console.error('Error clearing local storage:', error);
  }
};

/**
 * Clear user credentials and local storage on logout
 */
export const clearUserCredentials = async () => {
  try {
    // Clear all app-specific data
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.HAS_SEEN_ONBOARDING,
    ]);
  } catch (error) {
    console.error('Error clearing user credentials:', error);
    // Don't throw - logout should still proceed
  }
};

// In-memory credentials cache (for synchronous access)
let _cachedCredentials = { userId: null, email: null, name: null };

/**
 * Get user credentials (synchronous - returns cached values)
 */
export const getUserCredentials = () => {
  return _cachedCredentials;
};

/**
 * Set user credentials (updates cache)
 */
export const setUserCredentials = async (userId, email, name) => {
  _cachedCredentials = { userId, email, name };
  return _cachedCredentials;
};

/**
 * Initialize credentials from Supabase session
 */
export const initUserCredentials = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      _cachedCredentials = {
        userId: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.name || null,
      };
    }
  } catch (error) {
    console.log('Error initializing credentials:', error);
  }
  return _cachedCredentials;
};

/**
 * Get auth headers with Supabase JWT token
 */
const getHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();

  const headers = {
    'Content-Type': 'application/json',
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  return headers;
};

/**
 * Get auth headers for file uploads (without Content-Type)
 */
const getUploadHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();

  const headers = {};

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  return headers;
};

/**
 * API request helper
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;

  const headers = await getHeaders();
  const config = {
    headers,
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    // Use log (not error) so the dev LogBox doesn't pop a toast.
    // Callers handle the error via try/catch and show user-friendly alerts.
    console.log(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════════
// HEALTH & INFO
// ═══════════════════════════════════════════════════════════════

export const checkHealth = () => apiRequest('/health');
export const getApiInfo = () => apiRequest('/api');

// ═══════════════════════════════════════════════════════════════
// USERS API
// ═══════════════════════════════════════════════════════════════

/**
 * Get current user profile
 */
export const getProfile = () => apiRequest('/api/users/me');

/**
 * Setup profile (first time after signup)
 * @param {Object} data - { name, birthday, avatarType, showBirthYear }
 */
export const setupProfile = (data) =>
  apiRequest('/api/users/me/setup', {
    method: 'POST',
    body: JSON.stringify(data),
  });

/**
 * Update profile
 * @param {Object} data - { name, birthday, avatarType, showBirthYear }
 */
export const updateProfile = (data) =>
  apiRequest('/api/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

/**
 * Upload profile photo
 * @param {FormData} formData - Form data with 'photo' field
 */
export const uploadProfilePhoto = async (formData) => {
  const url = `${BASE_URL}/api/users/me/photo`;
  const headers = await getUploadHeaders();

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Upload failed');
  return data;
};

/**
 * Mark onboarding as seen
 */
export const markOnboardingSeen = () =>
  apiRequest('/api/users/me/onboarding-seen', { method: 'PUT' });

/**
 * Update settings
 * @param {Object} data - { showBirthYear, pushToken }
 */
export const updateSettings = (data) =>
  apiRequest('/api/users/me/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

/**
 * Delete account
 * @param {string} confirmation - Must be 'DELETE'
 */
export const deleteAccount = (confirmation) =>
  apiRequest('/api/users/me', {
    method: 'DELETE',
    body: JSON.stringify({ confirmation }),
  });

/**
 * Get dashboard stats
 */
export const getDashboardStats = () => apiRequest('/api/dashboard/stats');

// ═══════════════════════════════════════════════════════════════
// ANNIVERSARIES
// ═══════════════════════════════════════════════════════════════

/**
 * Get anniversaries
 */
export const getAnniversaries = () => apiRequest('/api/users/anniversaries');

/**
 * Add anniversary (max 3)
 * @param {Object} data - { date, title }
 */
export const addAnniversary = (data) =>
  apiRequest('/api/users/anniversaries', {
    method: 'POST',
    body: JSON.stringify(data),
  });

/**
 * Delete anniversary
 * @param {string} id - Anniversary ID
 */
export const deleteAnniversary = (id) =>
  apiRequest(`/api/users/anniversaries/${id}`, { method: 'DELETE' });

// ═══════════════════════════════════════════════════════════════
// QUESTIONNAIRE API
// ═══════════════════════════════════════════════════════════════

/**
 * Get questionnaire with completion status
 */
export const getQuestionnaire = () => apiRequest('/api/questionnaire');

/**
 * Save questionnaire answers
 * @param {Object} data - Questionnaire answers
 */
export const saveQuestionnaire = (data) =>
  apiRequest('/api/questionnaire', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

/**
 * Get completion status
 */
export const getQuestionnaireCompletion = () =>
  apiRequest('/api/questionnaire/completion');

/**
 * Get wishlist links
 */
export const getWishlistLinks = () =>
  apiRequest('/api/questionnaire/wishlist-links');

/**
 * Add wishlist link (max 3)
 * @param {Object} data - { url, title, linkType }
 */
export const addWishlistLink = (data) =>
  apiRequest('/api/questionnaire/wishlist-links', {
    method: 'POST',
    body: JSON.stringify(data),
  });

/**
 * Delete wishlist link
 * @param {string} id - Link ID
 */
export const deleteWishlistLink = (id) =>
  apiRequest(`/api/questionnaire/wishlist-links/${id}`, { method: 'DELETE' });

/**
 * Get registries
 */
export const getRegistries = () =>
  apiRequest('/api/questionnaire/registries');

/**
 * Add registry
 * @param {Object} data - { url, title, registryType, details, expiryDate }
 */
export const addRegistry = (data) =>
  apiRequest('/api/questionnaire/registries', {
    method: 'POST',
    body: JSON.stringify(data),
  });

/**
 * Update registry
 * @param {string} id - Registry ID
 * @param {Object} data - { url, title, details, expiryDate, isActive }
 */
export const updateRegistry = (id, data) =>
  apiRequest(`/api/questionnaire/registries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

/**
 * Delete registry
 * @param {string} id - Registry ID
 */
export const deleteRegistry = (id) =>
  apiRequest(`/api/questionnaire/registries/${id}`, { method: 'DELETE' });

// ═══════════════════════════════════════════════════════════════
// CIRCLES API (Contacts)
// ═══════════════════════════════════════════════════════════════

/**
 * Get all contacts
 * @param {Object} filters - { search, relationship, status }
 */
export const getCircles = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.relationship) params.append('relationship', filters.relationship);
  if (filters.status) params.append('status', filters.status);

  const query = params.toString();
  return apiRequest(`/api/circles${query ? `?${query}` : ''}`);
};

/**
 * Get contacts grouped by relationship
 */
export const getCirclesGrouped = () => apiRequest('/api/circles/grouped');

/**
 * Get single contact
 * @param {string} id - Contact ID
 */
export const getCircle = (id) => apiRequest(`/api/circles/${id}`);

/**
 * Get contact's preferences
 * @param {string} id - Contact ID
 */
export const getContactPreferences = (id) =>
  apiRequest(`/api/circles/${id}/preferences`);

/**
 * Add contact to circle
 * @param {Object} data - { memberId, guestName, guestEmail, relationship, nickname }
 */
export const addToCircle = (data) =>
  apiRequest('/api/circles', {
    method: 'POST',
    body: JSON.stringify(data),
  });

/**
 * Quick add from suggestions
 * @param {string} userId - User ID to add
 * @param {string} relationship - Relationship type
 */
export const quickAddToCircle = (userId, relationship = 'Friend') =>
  apiRequest(`/api/circles/quick-add/${userId}`, {
    method: 'POST',
    body: JSON.stringify({ relationship }),
  });

/**
 * Update contact
 * @param {string} id - Contact ID
 * @param {Object} data - { relationship, nickname, notes }
 */
export const updateCircle = (id, data) =>
  apiRequest(`/api/circles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

/**
 * Remove contact from circle
 * @param {string} id - Contact ID
 */
export const removeFromCircle = (id) =>
  apiRequest(`/api/circles/${id}`, { method: 'DELETE' });

// ═══════════════════════════════════════════════════════════════
// EVENTS API
// ═══════════════════════════════════════════════════════════════

/**
 * Get all events
 * @param {Object} filters - { month, year, upcoming }
 */
export const getEvents = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.month) params.append('month', filters.month);
  if (filters.year) params.append('year', filters.year);
  if (filters.upcoming) params.append('upcoming', 'true');

  const query = params.toString();
  return apiRequest(`/api/events${query ? `?${query}` : ''}`);
};

/**
 * Get upcoming events
 * @param {number} limit - Number of events to return
 */
export const getUpcomingEvents = (limit = 5) =>
  apiRequest(`/api/events/upcoming?limit=${limit}`);

/**
 * Get events by date
 * @param {string} date - Date in YYYY-MM-DD format
 */
export const getEventsByDate = (date) =>
  apiRequest(`/api/events/date/${date}`);

/**
 * Get event dates for calendar
 * @param {number} year
 * @param {number} month
 */
export const getEventDates = (year, month) =>
  apiRequest(`/api/events/calendar/${year}/${month}`);

/**
 * Get single event
 * @param {string} id - Event ID
 */
export const getEvent = (id) => apiRequest(`/api/events/${id}`);

/**
 * Create event
 * @param {Object} data - { title, eventType, eventDate, description, circleId, contactId, isRecurring, reminderDays, registryId }
 */
export const createEvent = (data) =>
  apiRequest('/api/events', {
    method: 'POST',
    body: JSON.stringify(data),
  });

/**
 * Update event
 * @param {string} id - Event ID
 * @param {Object} data - { title, eventType, eventDate, description, isRecurring, reminderDays, reminderEnabled }
 */
export const updateEvent = (id, data) =>
  apiRequest(`/api/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

/**
 * Delete event
 * @param {string} id - Event ID
 */
export const deleteEvent = (id) =>
  apiRequest(`/api/events/${id}`, { method: 'DELETE' });

// ═══════════════════════════════════════════════════════════════
// INVITATIONS API
// ═══════════════════════════════════════════════════════════════

/**
 * Get all invitations with stats
 * @param {string} status - Filter by status
 */
export const getInvitations = (status) => {
  const query = status ? `?status=${status}` : '';
  return apiRequest(`/api/invitations${query}`);
};

/**
 * Send invitation
 * @param {Object} data - { inviteeName, inviteeEmail, personalMessage, relationship }
 */
export const sendInvitation = (data) =>
  apiRequest('/api/invitations', {
    method: 'POST',
    body: JSON.stringify(data),
  });

/**
 * Resend invitation
 * @param {string} id - Invitation ID
 */
export const resendInvitation = (id) =>
  apiRequest(`/api/invitations/${id}/resend`, { method: 'PUT' });

/**
 * Delete invitation
 * @param {string} id - Invitation ID
 */
export const deleteInvitation = (id) =>
  apiRequest(`/api/invitations/${id}`, { method: 'DELETE' });

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS API
// ═══════════════════════════════════════════════════════════════

/**
 * Get notifications
 * @param {Object} options - { page, limit, unreadOnly }
 */
export const getNotifications = (options = {}) => {
  const params = new URLSearchParams();
  if (options.page) params.append('page', options.page);
  if (options.limit) params.append('limit', options.limit);
  if (options.unreadOnly) params.append('unreadOnly', 'true');

  const query = params.toString();
  return apiRequest(`/api/notifications${query ? `?${query}` : ''}`);
};

/**
 * Get unread count
 */
export const getUnreadCount = () =>
  apiRequest('/api/notifications/unread-count');

/**
 * Mark notification as read
 * @param {string} id - Notification ID
 */
export const markNotificationRead = (id) =>
  apiRequest(`/api/notifications/${id}/read`, { method: 'PUT' });

/**
 * Mark all notifications as read
 */
export const markAllNotificationsRead = () =>
  apiRequest('/api/notifications/read-all', { method: 'PUT' });

/**
 * Delete notification
 * @param {string} id - Notification ID
 */
export const deleteNotification = (id) =>
  apiRequest(`/api/notifications/${id}`, { method: 'DELETE' });

/**
 * Register push token
 * @param {string} token - Push notification token
 */
export const registerPushToken = (token) =>
  apiRequest('/api/users/me/push-token', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });

// ═══════════════════════════════════════════════════════════════
// DISCOVER API
// ═══════════════════════════════════════════════════════════════

/**
 * Get people you may know (friend suggestions)
 */
export const getPeopleYouMayKnow = () =>
  apiRequest('/api/discover/people-you-may-know');

/**
 * Dismiss suggestion
 * @param {string} userId - User ID to dismiss
 */
export const dismissSuggestion = (userId) =>
  apiRequest(`/api/discover/dismiss/${userId}`, { method: 'POST' });

// ═══════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════

export default {
  // Local Storage
  hasSeenOnboardingLocal,
  markOnboardingSeenLocal,
  clearLocalStorage,
  clearUserCredentials,
  getUserCredentials,
  setUserCredentials,
  initUserCredentials,

  // Health
  checkHealth,
  getApiInfo,

  // Users
  getProfile,
  setupProfile,
  updateProfile,
  uploadProfilePhoto,
  markOnboardingSeen,
  updateSettings,
  deleteAccount,
  getDashboardStats,

  // Anniversaries
  getAnniversaries,
  addAnniversary,
  deleteAnniversary,

  // Questionnaire
  getQuestionnaire,
  saveQuestionnaire,
  getQuestionnaireCompletion,
  getWishlistLinks,
  addWishlistLink,
  deleteWishlistLink,
  getRegistries,
  addRegistry,
  updateRegistry,
  deleteRegistry,

  // Circles
  getCircles,
  getCirclesGrouped,
  getCircle,
  getContactPreferences,
  addToCircle,
  quickAddToCircle,
  updateCircle,
  removeFromCircle,

  // Events
  getEvents,
  getUpcomingEvents,
  getEventsByDate,
  getEventDates,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,

  // Invitations
  getInvitations,
  sendInvitation,
  resendInvitation,
  deleteInvitation,

  // Notifications
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  registerPushToken,

  // Discover
  getPeopleYouMayKnow,
  dismissSuggestion,
};
