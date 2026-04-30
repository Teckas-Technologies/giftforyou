import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fpseupuhqukhcttjhsop.supabase.co';
const supabaseAnonKey = 'sb_publishable_M2R_n70XhIUPZm-6EErC9g_MNMhasVe';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
