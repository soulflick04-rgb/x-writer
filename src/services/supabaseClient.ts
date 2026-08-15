import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { storage } from './storage';

let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const settings = storage.getSettings();
  const url = settings.supabaseUrl || (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const key = settings.supabaseAnonKey || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    return null;
  }

  if (cachedClient && lastUrl === url && lastKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    lastUrl = url;
    lastKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export const supabaseService = {
  isConfigured(): boolean {
    return getSupabaseClient() !== null;
  },

  async testConnection(): Promise<{ success: boolean; message: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Supabase URL or Anon Key is missing in Settings.' };
    }

    try {
      const { error } = await client.from('profiles').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        // Table might not exist yet or connection error
        return { success: false, message: `Connected to Supabase project, but query returned: ${error.message}` };
      }
      return { success: true, message: 'Connected successfully to Supabase PostgreSQL & Auth!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Connection failed.' };
    }
  }
};
