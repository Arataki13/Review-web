import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Helper to validate the URL. Prevents static build compilation crashes when variables are placeholders.
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};

export const supabase = isValidUrl(supabaseUrl) && supabaseAnonKey && supabaseUrl !== 'your-supabase-url-here'
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      // Mock client to prevent crashes during next build when env vars are missing or placeholders
      from: () => {
        const chain = {
          select: () => chain,
          insert: () => chain,
          update: () => chain,
          delete: () => chain,
          eq: () => chain,
          order: () => chain,
          then: (resolve) => resolve({ data: [], error: null }),
        };
        return chain;
      }
    };

if (!isValidUrl(supabaseUrl) || supabaseUrl === 'your-supabase-url-here') {
  console.warn(
    'Warning: Supabase URL is not configured or invalid. Update NEXT_PUBLIC_SUPABASE_URL in .env.local'
  );
}
