import { supabase } from './supabase';

/**
 * Parses a Supabase auth redirect URL (hash or query) and sets the session.
 * Used when the app is opened from email confirmation or magic link.
 */
export async function setSessionFromUrl(url: string): Promise<boolean> {
  try {
    const hash = url.includes('#') ? url.split('#')[1] : '';
    const query = url.includes('?') ? url.split('?')[1] : '';
    const params = new URLSearchParams(hash || query);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    if (!accessToken || !refreshToken) return false;
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    return !error;
  } catch {
    return false;
  }
}
