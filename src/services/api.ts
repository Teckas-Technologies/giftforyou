/**
 * GiftBox4you API Service
 * Base URL is read from EXPO_PUBLIC_API_BASE_URL (.env), with a prod fallback.
 * Uses Supabase Authentication
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'https://thoughtfully-backend-bxccfxcrb8cra0b2.canadacentral-01.azurewebsites.net';

// Plain RN `fetch` has no built-in timeout — on a flaky connection a request
// can hang far longer than any user will wait instead of failing fast. Every
// network call in this file goes through this wrapper so it aborts instead.
const DEFAULT_TIMEOUT_MS = 15000;
const UPLOAD_TIMEOUT_MS = 60000;

const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Check (server-side, bypasses RLS) whether an email already has an account.
 * Public endpoint — no auth token needed (used before login).
 * @returns true=registered, false=not, null=unknown (network/error — caller
 *          should not block login on null).
 */
export const checkEmailRegistered = async (email: string): Promise<boolean | null> => {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/auth/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: (email || '').trim().toLowerCase() }),
    });
    const data = await res.json();
    return typeof data.registered === 'boolean' ? data.registered : null;
  } catch (e) {
    return null; // network/unknown — fall back to normal sign-in
  }
};

// Storage keys
const STORAGE_KEYS = {
  HAS_SEEN_ONBOARDING: '@giftbox_has_seen_onboarding',
};

/**
 * Check if user has seen onboarding (local storage)
 */
export const hasSeenOnboardingLocal = async (): Promise<boolean> => {
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
export const markOnboardingSeenLocal = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_ONBOARDING, 'true');
  } catch (error) {
    console.error('Error saving onboarding status:', error);
  }
};

/**
 * Clear local storage on logout
 */
export const clearLocalStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.HAS_SEEN_ONBOARDING);
  } catch (error) {
    console.error('Error clearing local storage:', error);
  }
};

/**
 * Clear user credentials and local storage on logout
 */
export const clearUserCredentials = async (): Promise<void> => {
  try {
    // Clear all app-specific data
    await AsyncStorage.multiRemove([STORAGE_KEYS.HAS_SEEN_ONBOARDING]);
  } catch (error) {
    console.error('Error clearing user credentials:', error);
    // Don't throw - logout should still proceed
  }
};

interface UserCredentials {
  userId: string | null;
  email: string | null | undefined;
  name: string | null | undefined;
}

// In-memory credentials cache (for synchronous access)
let _cachedCredentials: UserCredentials = { userId: null, email: null, name: null };

/**
 * Get user credentials (synchronous - returns cached values)
 */
export const getUserCredentials = (): UserCredentials => {
  return _cachedCredentials;
};

/**
 * Set user credentials (updates cache)
 */
export const setUserCredentials = async (
  userId: string,
  email: string,
  name: string,
): Promise<UserCredentials> => {
  _cachedCredentials = { userId, email, name };
  return _cachedCredentials;
};

/**
 * Initialize credentials from Supabase session
 */
export const initUserCredentials = async (): Promise<UserCredentials> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
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
const getHeaders = async (): Promise<Record<string, string>> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
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
const getUploadHeaders = async (): Promise<Record<string, string>> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {};

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  return headers;
};

/** A non-2xx API response, carrying the server's own error envelope. */
export class ApiError extends Error {
  details?: any;
  code?: string;

  constructor(message: string, details?: any, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.details = details;
    this.code = code;
  }
}

interface ApiRequestOptions extends RequestInit {}

/**
 * API request helper
 */
const apiRequest = async <T = any>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  const url = `${BASE_URL}${endpoint}`;

  const headers = await getHeaders();
  const config = {
    headers,
    ...options,
  };

  try {
    const response = await fetchWithTimeout(url, config);
    const data = await response.json();

    if (!response.ok) {
      // Include field-level validation details (backend sends `details`)
      // so failures are diagnosable instead of a bare "Validation failed".
      let message = data.error || data.message || 'API request failed';
      if (Array.isArray(data.details) && data.details.length) {
        const fields = data.details.map((d: any) => `${d.field}: ${d.message}`).join('; ');
        message += ` (${fields})`;
      }
      throw new ApiError(message, data.details, data.code);
    }

    return data;
  } catch (error: any) {
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
 * @param data - { name, birthday, avatarType, showBirthYear }
 */
export const setupProfile = (data: Record<string, any>) =>
  apiRequest('/api/users/me/setup', {
    method: 'POST',
    body: JSON.stringify(data),
  });

/**
 * Update profile
 * @param data - { name, birthday, avatarType, showBirthYear }
 */
export const updateProfile = (data: Record<string, any>) =>
  apiRequest('/api/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

/**
 * Upload profile photo
 * @param formData - Form data with 'photo' field
 */
export const uploadProfilePhoto = async (formData: FormData) => {
  const url = `${BASE_URL}/api/users/me/photo`;
  const headers = await getUploadHeaders();

  const response = await fetchWithTimeout(
    url,
    {
      method: 'POST',
      headers,
      body: formData,
    },
    UPLOAD_TIMEOUT_MS,
  );

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
 * @param data - { showBirthYear, pushToken }
 */
export const updateSettings = (data: Record<string, any>) =>
  apiRequest('/api/users/me/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

/**
 * Delete account
 * @param confirmation - Must be 'DELETE'
 */
export const deleteAccount = (confirmation: string) =>
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
 * @param data - { date, title }
 */
export const addAnniversary = (data: Record<string, any>) =>
  apiRequest('/api/users/anniversaries', {
    method: 'POST',
    body: JSON.stringify(data),
  });

/**
 * Delete anniversary
 * @param id - Anniversary ID
 */
export const deleteAnniversary = (id: string) =>
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
 * @param data - Questionnaire answers
 */
export const saveQuestionnaire = (data: Record<string, any>) =>
  apiRequest('/api/questionnaire', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

/**
 * Get completion status
 */
export const getQuestionnaireCompletion = () => apiRequest('/api/questionnaire/completion');

/**
 * Get wishlist links
 */
export const getWishlistLinks = () => apiRequest('/api/questionnaire/wishlist-links');

/**
 * Add wishlist link (max 3)
 * @param data - { url, title, linkType }
 */
export const addWishlistLink = (data: Record<string, any>) =>
  apiRequest('/api/questionnaire/wishlist-links', {
    method: 'POST',
    body: JSON.stringify(data),
  });

/**
 * Delete wishlist link
 * @param id - Link ID
 */
export const deleteWishlistLink = (id: string) =>
  apiRequest(`/api/questionnaire/wishlist-links/${id}`, { method: 'DELETE' });

/**
 * Get registries
 */
export const getRegistries = () => apiRequest('/api/questionnaire/registries');

/**
 * Add registry
 * @param data - { url, title, registryType, details, expiryDate }
 */
export const addRegistry = (data: Record<string, any>) =>
  apiRequest('/api/questionnaire/registries', {
    method: 'POST',
    body: JSON.stringify(data),
  });

/**
 * Update registry
 * @param id - Registry ID
 * @param data - { url, title, details, expiryDate, isActive }
 */
export const updateRegistry = (id: string, data: Record<string, any>) =>
  apiRequest(`/api/questionnaire/registries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

/**
 * Delete registry
 * @param id - Registry ID
 */
export const deleteRegistry = (id: string) =>
  apiRequest(`/api/questionnaire/registries/${id}`, { method: 'DELETE' });

// ═══════════════════════════════════════════════════════════════
// CIRCLES API (Contacts)
// ═══════════════════════════════════════════════════════════════

interface CircleFilters {
  search?: string;
  relationship?: string;
  status?: string;
}

/**
 * Get all contacts
 * @param filters - { search, relationship, status }
 */
export const getCircles = (filters: CircleFilters = {}) => {
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
 * @param id - Contact ID
 */
export const getCircle = (id: string) => apiRequest(`/api/circles/${id}`);

/**
 * Get contact's preferences
 * @param id - Contact ID
 */
export const getContactPreferences = (id: string) => apiRequest(`/api/circles/${id}/preferences`);

/**
 * Add contact to circle
 * @param data - { memberId, guestName, guestEmail, relationship, nickname }
 */
export const addToCircle = (data: Record<string, any>) =>
  apiRequest('/api/circles', {
    method: 'POST',
    body: JSON.stringify(data),
  });

/**
 * Quick add from suggestions
 * @param userId - User ID to add
 * @param relationship - Relationship type
 */
export const quickAddToCircle = (userId: string, relationship: string = 'Friend') =>
  apiRequest(`/api/circles/quick-add/${userId}`, {
    method: 'POST',
    body: JSON.stringify({ relationship }),
  });

/**
 * Update contact
 * @param id - Contact ID
 * @param data - { relationship, nickname, notes }
 */
export const updateCircle = (id: string, data: Record<string, any>) =>
  apiRequest(`/api/circles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

/**
 * Remove contact from circle
 * @param id - Contact ID
 */
export const removeFromCircle = (id: string) =>
  apiRequest(`/api/circles/${id}`, { method: 'DELETE' });

/**
 * Get pending friend requests (incoming + outgoing)
 */
export const getPendingRequests = () => apiRequest('/api/circles/requests');

/**
 * Accept a pending friend request (called by the receiver)
 * @param id - Circle row ID
 */
export const acceptFriendRequest = (id: string) =>
  apiRequest(`/api/circles/${id}/accept`, { method: 'POST' });

/**
 * Reject a pending friend request (called by the receiver)
 * @param id - Circle row ID
 */
export const rejectFriendRequest = (id: string) =>
  apiRequest(`/api/circles/${id}/reject`, { method: 'POST' });

/**
 * Cancel a pending friend request you sent (called by the sender)
 * @param id - Circle row ID
 */
export const cancelFriendRequest = (id: string) =>
  apiRequest(`/api/circles/${id}/cancel`, { method: 'DELETE' });

// ═══════════════════════════════════════════════════════════════
// EVENTS API
// ═══════════════════════════════════════════════════════════════

interface EventFilters {
  month?: number | string;
  year?: number | string;
  upcoming?: boolean;
}

/**
 * Get all events
 * @param filters - { month, year, upcoming }
 */
export const getEvents = (filters: EventFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.month) params.append('month', String(filters.month));
  if (filters.year) params.append('year', String(filters.year));
  if (filters.upcoming) params.append('upcoming', 'true');

  const query = params.toString();
  return apiRequest(`/api/events${query ? `?${query}` : ''}`);
};

/**
 * Get upcoming events
 * @param limit - Number of events to return
 */
export const getUpcomingEvents = (limit: number = 5) =>
  apiRequest(`/api/events/upcoming?limit=${limit}`);

/**
 * Get events by date
 * @param date - Date in YYYY-MM-DD format
 */
export const getEventsByDate = (date: string) => apiRequest(`/api/events/date/${date}`);

/**
 * Get event dates for calendar
 */
export const getEventDates = (year: number, month: number) =>
  apiRequest(`/api/events/calendar/${year}/${month}`);

/**
 * Get single event
 * @param id - Event ID
 */
export const getEvent = (id: string) => apiRequest(`/api/events/${id}`);

/**
 * Create event
 * @param data - { title, eventType, eventDate, description, circleId, contactId, isRecurring, reminderDays, registryId }
 */
export const createEvent = (data: Record<string, any>) =>
  apiRequest('/api/events', {
    method: 'POST',
    body: JSON.stringify(data),
  });

/**
 * Update event
 * @param id - Event ID
 * @param data - { title, eventType, eventDate, description, isRecurring, reminderDays, reminderEnabled }
 */
export const updateEvent = (id: string, data: Record<string, any>) =>
  apiRequest(`/api/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

/**
 * Delete event
 * @param id - Event ID
 */
export const deleteEvent = (id: string) => apiRequest(`/api/events/${id}`, { method: 'DELETE' });

// ═══════════════════════════════════════════════════════════════
// INVITATIONS API
// ═══════════════════════════════════════════════════════════════

/**
 * Get all invitations with stats
 * @param status - Filter by status
 */
export const getInvitations = (status?: string) => {
  const query = status ? `?status=${status}` : '';
  return apiRequest(`/api/invitations${query}`);
};

/**
 * Send invitation
 * @param data - { inviteeName, inviteeEmail, personalMessage, relationship }
 */
export const sendInvitation = (data: Record<string, any>) =>
  apiRequest('/api/invitations', {
    method: 'POST',
    body: JSON.stringify(data),
  });

/**
 * Resend invitation
 * @param id - Invitation ID
 */
export const resendInvitation = (id: string) =>
  apiRequest(`/api/invitations/${id}/resend`, { method: 'PUT' });

/**
 * Delete invitation
 * @param id - Invitation ID
 */
export const deleteInvitation = (id: string) =>
  apiRequest(`/api/invitations/${id}`, { method: 'DELETE' });

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS API
// ═══════════════════════════════════════════════════════════════

interface NotificationOptions {
  page?: number | string;
  limit?: number | string;
  unreadOnly?: boolean;
}

/**
 * Get notifications
 * @param options - { page, limit, unreadOnly }
 */
export const getNotifications = (options: NotificationOptions = {}) => {
  const params = new URLSearchParams();
  if (options.page) params.append('page', String(options.page));
  if (options.limit) params.append('limit', String(options.limit));
  if (options.unreadOnly) params.append('unreadOnly', 'true');

  const query = params.toString();
  return apiRequest(`/api/notifications${query ? `?${query}` : ''}`);
};

/**
 * Get unread count
 */
export const getUnreadCount = () => apiRequest('/api/notifications/unread-count');

/**
 * Mark notification as read
 * @param id - Notification ID
 */
export const markNotificationRead = (id: string) =>
  apiRequest(`/api/notifications/${id}/read`, { method: 'PUT' });

/**
 * Mark all notifications as read
 */
export const markAllNotificationsRead = () =>
  apiRequest('/api/notifications/read-all', { method: 'PUT' });

/**
 * Delete notification
 * @param id - Notification ID
 */
export const deleteNotification = (id: string) =>
  apiRequest(`/api/notifications/${id}`, { method: 'DELETE' });

/**
 * Register push token
 * @param token - Push notification token
 */
export const registerPushToken = (token: string) =>
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
export const getPeopleYouMayKnow = () => apiRequest('/api/discover/people-you-may-know');

/**
 * Dismiss suggestion
 * @param userId - User ID to dismiss
 */
export const dismissSuggestion = (userId: string) =>
  apiRequest(`/api/discover/dismiss/${userId}`, { method: 'POST' });

/**
 * Search users by name or email
 * @param query - Search text (min 2 chars)
 * @param limit - Max results (default 20)
 */
export const searchUsers = (query: string, limit: number = 20) =>
  apiRequest(`/api/users/search?q=${encodeURIComponent(query)}&limit=${limit}`);

// ═══════════════════════════════════════════════════════════════
// LOVE NOTES API
// ═══════════════════════════════════════════════════════════════

/**
 * Get the fixed list of love notes (to pick from when sending)
 */
export const getLoveNotes = () => apiRequest('/api/love-notes');

/**
 * Get a random love note (for the "on app open" popup)
 */
export const getRandomLoveNote = () => apiRequest('/api/love-notes/random');

/**
 * Send a love note to a friend
 * @param circleId - The accepted friend's circle/contact ID
 * @param text - The love note message to send
 */
export const sendLoveNote = (circleId: string, text: string) =>
  apiRequest('/api/love-notes/send', {
    method: 'POST',
    body: JSON.stringify({ circleId, text }),
  });

/**
 * Submit a new love note idea for admin review
 * @param text - The suggested love note text
 */
export const submitLoveNoteIdea = (text: string) =>
  apiRequest('/api/love-notes/submissions', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });

// ═══════════════════════════════════════════════════════════════
// BILLING API
// ═══════════════════════════════════════════════════════════════

/**
 * Get the current user's plan ('free' | 'individual' | 'organization')
 */
export const getPlanStatus = () => apiRequest('/api/billing/status');

/**
 * Validate a company coupon code + work email, and — if valid — email a
 * 6-digit verification code to that address. Nothing is granted yet; call
 * verifyCouponCode with the code the user receives to complete it.
 * @param code - The coupon code
 * @param workEmail - Email at the company's domain
 */
export const requestCouponCode = (code: string, workEmail: string) =>
  apiRequest('/api/billing/coupon/request-code', {
    method: 'POST',
    body: JSON.stringify({ code, workEmail }),
  });

/**
 * Submit the 6-digit code sent by requestCouponCode. Grants Organization
 * Plan access only if it matches and hasn't expired.
 * @param code - The 6-digit verification code
 */
export const verifyCouponCode = (code: string) =>
  apiRequest('/api/billing/coupon/verify-code', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });

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
  getPendingRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
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
  searchUsers,

  // Love Notes
  getLoveNotes,
  getRandomLoveNote,
  sendLoveNote,
  submitLoveNoteIdea,

  // Billing
  getPlanStatus,
  requestCouponCode,
  verifyCouponCode,
};
