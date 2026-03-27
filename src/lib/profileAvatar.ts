import { File as ExpoFile } from 'expo-file-system';
import { Platform } from 'react-native';
import { supabase } from './supabase';

const AVATARS_BUCKET = 'avatars';
const AVATAR_OBJECT_NAME = 'avatar';

/** Overall deadline for read + Storage upload + profile row update (shows spinner in UI). */
export const PROFILE_AVATAR_UPLOAD_TIMEOUT_MS = 45_000;

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
]);

export function formatProfileAvatarFailureMessage(error: unknown): string {
  if (error instanceof Error) {
    const m = error.message.trim();
    if (/network request failed/i.test(m)) {
      return 'Network error. Check your connection and try again.';
    }
    if (/timed out|timeout/i.test(m)) {
      return m.length > 0 ? m : 'The request timed out. Try again.';
    }
    if (m.length > 0) return m;
  }
  if (typeof error === 'string' && error.trim().length > 0) {
    return error.trim();
  }
  return 'Something went wrong. Please try again.';
}

/**
 * Read image bytes from a picker URI. `fetch(file://...)` often throws "Network request failed" on native.
 */
async function readLocalImageAsArrayBuffer(uri: string): Promise<ArrayBuffer> {
  if (Platform.OS === 'web') {
    const fileResponse = await fetch(uri);
    if (!fileResponse.ok) {
      throw new Error(`Could not read the image (HTTP ${fileResponse.status}).`);
    }
    return fileResponse.arrayBuffer();
  }

  const file = new ExpoFile(uri);
  return file.arrayBuffer();
}

function normalizeMimeType(mime: string | undefined, uri: string): string {
  const lowerMime = mime?.toLowerCase();
  if (lowerMime && ALLOWED_MIME.has(lowerMime)) return lowerMime;

  const lower = uri.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.heic') || lower.endsWith('.heif')) return 'image/heic';
  return 'image/jpeg';
}

export type UploadProfileAvatarResult =
  | { ok: true; publicUrl: string }
  | { ok: false; message: string };

/**
 * Uploads a single image to Storage at `{userId}/avatar` (upsert) and saves the public URL on `profiles.avatar_url`.
 */
export async function uploadProfileAvatar(
  userId: string,
  localUri: string,
  mimeType: string | undefined,
): Promise<UploadProfileAvatarResult> {
  if (!userId?.trim()) {
    return { ok: false, message: 'You must be signed in to update your photo.' };
  }
  if (!localUri?.trim()) {
    return { ok: false, message: 'No image file was available.' };
  }

  try {
    const contentType = normalizeMimeType(mimeType, localUri);
    const path = `${userId}/${AVATAR_OBJECT_NAME}`;

    let bytes: ArrayBuffer;
    try {
      bytes = await readLocalImageAsArrayBuffer(localUri);
    } catch (e) {
      return { ok: false, message: formatProfileAvatarFailureMessage(e) };
    }

    if (!bytes || bytes.byteLength === 0) {
      return { ok: false, message: 'The selected image was empty. Try another photo.' };
    }

    const { error: uploadError } = await supabase.storage
      .from(AVATARS_BUCKET)
      .upload(path, bytes, { contentType, upsert: true });

    if (uploadError) {
      const msg = uploadError.message?.trim() || 'Upload failed.';
      return { ok: false, message: msg };
    }

    const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
    const baseUrl = data.publicUrl.split('?')[0];
    const publicUrl = `${baseUrl}?v=${Date.now()}`;

    const { error: dbError } = await supabase
      .from('profiles')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (dbError) {
      const msg = dbError.message?.trim() || 'Could not save your profile.';
      return { ok: false, message: msg };
    }

    return { ok: true, publicUrl };
  } catch (e) {
    return { ok: false, message: formatProfileAvatarFailureMessage(e) };
  }
}
