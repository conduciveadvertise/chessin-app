import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const getEnvVar = (key: string): string => {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  return "";
};

const supabaseUrl = getEnvVar("EXPO_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = getEnvVar("EXPO_PUBLIC_SUPABASE_ANON_KEY");

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const dummyUrl = "https://placeholder-project.supabase.co";
const dummyKey = "placeholder-key";

export const supabase = createClient(
  supabaseUrl || dummyUrl,
  supabaseAnonKey || dummyKey,
  {
    auth: {
      storage: AsyncStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);
