import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const isNodeRuntime =
  typeof process !== 'undefined' &&
  !!process.versions?.node &&
  typeof window === 'undefined';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase credentials missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: isNodeRuntime ? undefined : AsyncStorage,
    autoRefreshToken: !isNodeRuntime,
    persistSession: !isNodeRuntime,
    detectSessionInUrl: false,
  },
});
