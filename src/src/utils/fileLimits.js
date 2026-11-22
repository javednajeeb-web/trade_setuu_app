import * as FileSystem from 'expo-file-system';

const MB = 1024 * 1024;

export const LIMITS = {
  DOCUMENT: 10 * MB,
  IMAGE: 10 * MB,
  VIDEO_STANDARD: 15 * MB,
  VIDEO_POST: 50 * MB,
};

export async function validateFileSize(uri, type, { isPostVideo = false } = {}) {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) {
    return { ok: false, message: 'फ़ाइल नहीं मिली या एक्सेस नहीं हो पा रही है।' };
  }

  const size = info.size ?? 0;
  let maxBytes = LIMITS.DOCUMENT;
  let label = '10 MB';

  if (type === 'image') {
    maxBytes = LIMITS.IMAGE;
    label = '10 MB';
  } else if (type === 'video') {
    maxBytes = isPostVideo ? LIMITS.VIDEO_POST : LIMITS.VIDEO_STANDARD;
    label = isPostVideo ? '50 MB (पोस्ट वीडियो)' : '15 MB';
  } else {
    maxBytes = LIMITS.DOCUMENT;
    label = '10 MB';
  }

  if (size > maxBytes) {
    return {
      ok: false,
      message: `फ़ाइल का साइज़ तय सीमा (${label}) से ज़्यादा है।`,
    };
  }

  return { ok: true, size, ur
    i };
}
