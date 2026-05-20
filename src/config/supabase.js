import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env'
  );
}

console.log('[supabase] URL resolved to:', supabaseUrl);

// Logging fetch wrapper so unsourced "Network request failed" errors no
// longer disappear — every Supabase HTTPS call (auth/signIn, getSession,
// PostgREST query, etc.) prints its URL, status, timing, and error.
const loggingFetch = async (input, init = {}) => {
  const url = typeof input === 'string' ? input : (input && input.url) || '<unknown>';
  const method = (init.method || (typeof input !== 'string' && input?.method) || 'GET').toUpperCase();
  const startedAt = Date.now();
  console.log(`[supabase →] ${method} ${url}`);
  try {
    const res = await fetch(input, init);
    const elapsed = Date.now() - startedAt;
    console.log(`[supabase ←] ${method} ${url} ${res.status} in ${elapsed}ms`);
    return res;
  } catch (e) {
    const elapsed = Date.now() - startedAt;
    console.log(
      `[supabase ✗] ${method} ${url} failed after ${elapsed}ms — ${e.name || 'Error'}: ${e.message}`
    );
    if (e.stack) console.log(`[supabase ✗ stack] ${e.stack}`);
    throw e;
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    fetch: loggingFetch,
  },
});
