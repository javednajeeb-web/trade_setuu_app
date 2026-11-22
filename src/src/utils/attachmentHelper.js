// src/utils/attachmentHelper.js
// Centralized media/document rules, format checks & size limits for Trade SETUU

export const ATTACHMENT_LIMITS_MB = {
  DOCUMENT_MAX_MB: 10,
  IMAGE_MAX_MB: 10,
  VIDEO_CHAT_SHARE_MAX_MB: 15,
  VIDEO_POST_MAX_MB: 50,
};

export const ALLOWED_EXTENSIONS = {
  document: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'csv'],
  image: ['jpg', 'jpeg', 'png', 'webp', 'heic'],
  video: ['mp4', 'mov', 'm4v', 'mkv', 'webm'],
};

export const MIME_TYPE_MAP = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
  rtf: 'application/rtf',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  m4v: 'video/x-m4v',
  mkv: 'video/x-matroska',
  webm: 'video/webm',
};

export function getFileExtension(fileNameOrUri = '') {
  const clean = String(fileNameOrUri).split('?')[0].split('#')[0];
  const parts = clean.split('.');
  if (parts.length < 2) return '';
  return parts[parts.length - 1].toLowerCase().trim();
}

export function detectAttachmentKind(file = {}) {
  const ext =
    file.extension?.toLowerCase() ||
    getFileExtension(file.name || file.fileName || file.uri || '');

  if (ALLOWED_EXTENSIONS.document.includes(ext)) return 'document';
  if (ALLOWED_EXTENSIONS.image.includes(ext)) return 'image';
  if (ALLOWED_EXTENSIONS.video.includes(ext)) return 'video';

  const mime = String(file.mimeType || file.type || '').toLowerCase();
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (
    mime.includes('pdf') ||
    mime.includes('word') ||
    mime.includes('document') ||
    mime.includes('text') ||
    mime.includes('sheet') ||
    mime.includes('csv')
  ) {
    return 'document';
  }

  return 'unknown';
}

export function getMaxSizeMb(kind, context = 'share') {
  const normalizedContext = String(context || 'share').toLowerCase();

  if (kind === 'document') {
    return ATTACHMENT_LIMITS_MB.DOCUMENT_MAX_MB;
  }

  if (kind === 'image') {
    return ATTACHMENT_LIMITS_MB.IMAGE_MAX_MB;
  }

  if (kind === 'video') {
    if (normalizedContext === 'post') {
      return ATTACHMENT_LIMITS_MB.VIDEO_POST_MAX_MB;
    }
    return ATTACHMENT_LIMITS_MB.VIDEO_CHAT_SHARE_MAX_MB;
  }

  return ATTACHMENT_LIMITS_MB.DOCUMENT_MAX_MB;
}

export function bytesToMb(bytes = 0) {
  const num = Number(bytes) || 0;
  return num / (1024 * 1024);
}

export function validateAttachment(file = {}, context = 'share') {
  const rawName = (file.name || file.fileName || '').trim();
  const ext =
    file.extension?.toLowerCase() ||
    getFileExtension(rawName || file.uri || '');
  const kind = detectAttachmentKind({ ...file, name: rawName, extension: ext });

  if (kind === 'unknown') {
    return {
      ok: false,
      error:
        'Unsupported file format. Allowed: PDF, DOC, DOCX, TXT, XLS/XLSX/CSV, JPG, PNG, WEBP, MP4, MOV.',
    };
  }

  const maxMb = getMaxSizeMb(kind, context);
  const sizeBytes = Number(file.size ?? file.fileSize ?? 0);

  if (sizeBytes > 0) {
    const sizeMb = bytesToMb(sizeBytes);
    if (sizeMb > maxMb) {
      return {
        ok: false,
        error: `${kind.toUpperCase()} size (${sizeMb.toFixed(
          1
        )} MB) exceeds the ${maxMb} MB limit for ${context}. Please compress or select a smaller file.`,
      };
    }
  }

  const finalName =
    rawName || `attachment_${Date.now()}${ext ? `.${ext}` : ''}`;

  return {
    ok: true,
    normalized: {
      name: finalName,
      uri: file.uri || '',
      extension: ext,
      kind,
      sizeBytes,
      sizeMb: sizeBytes > 0 ? Number(bytesToMb(sizeBytes).toFixed(2)) : null,
      maxAllowedMb: maxMb,
      context,
      mimeType: file.mimeType || MIME_TYPE_MAP[ext] || 'application/octet-stream',
    },
  };
}

export function formatAttachmentsForBrief(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return '  None attached yet';
  }
  return items
    .map((item, index) => {
      const label = typeof item === 'string' ? item : item.name;
      const meta =
        typeof item === 'object' && item.sizeMb
          ? ` (${item.sizeMb} MB)`
          : '';
      return `  ${index + 1}. ${label}${meta}`;
    })
    .join('\n');
}
