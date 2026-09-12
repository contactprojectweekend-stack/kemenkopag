import { createBrowserClient } from '@supabase/ssr';

// Membersihkan URL otomatis jika ada trailing slash atau /rest/v1
const cleanUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '')
  .trim()
  .replace(/\/+$/, '')
  .replace(/\/rest\/v1.*$/, '');

export function createClient() {
  return createBrowserClient(
    cleanUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}