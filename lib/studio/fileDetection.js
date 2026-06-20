// lib/studio/fileDetection.js
//
// LESHEM.S OS — Smart File Detection (Clean 4B.3)
//
// Pure helpers that inspect a File (name + mimeType) plus the surrounding
// intake context (object type, destination) to PRE-FILL fileKind, category,
// filePurpose and status. The user can always override; when detection is
// uncertain we flag low confidence so the UI can ask for confirmation.
// No storage, no network.

import {
  FILE_KIND,
  FILE_CATEGORY,
  FILE_PURPOSE,
  STATUS,
  OBJECT_TYPE,
  DESTINATION_TYPE,
} from './assetsStore';

export function extensionOf(fileName) {
  if (typeof fileName !== 'string') return '';
  const m = fileName.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : '';
}

const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'gif', 'bmp', 'tif', 'tiff'];
const VIDEO_EXT = ['mp4', 'mov', 'webm', 'm4v', 'avi'];
const MODEL_EXT = ['stl', 'obj', '3dm', 'glb', 'gltf'];

function detectKind(ext, mimeType) {
  const t = (mimeType || '').toLowerCase();
  if (t.startsWith('image/') || IMAGE_EXT.includes(ext)) return FILE_KIND.IMAGE;
  if (t.startsWith('video/') || VIDEO_EXT.includes(ext)) return FILE_KIND.VIDEO;
  if (t === 'application/pdf' || ext === 'pdf') return FILE_KIND.PDF;
  if (MODEL_EXT.includes(ext)) return FILE_KIND.MODEL_3D;
  return FILE_KIND.OTHER;
}

function nameHints(fileName) {
  const n = (fileName || '').toLowerCase();
  return {
    isCert: /(gia|igi|certificate|cert|report)/.test(n),
    isRender: /(render|final|approved)/.test(n),
    isSketch: /(sketch|drawing)/.test(n),
  };
}

// Returns { fileKind, category, filePurpose, status, confidence, needsConfirm }
export function detectFile(file, context = {}) {
  const ext = extensionOf(file && file.name);
  const mimeType = (file && file.type) || '';
  const kind = detectKind(ext, mimeType);
  const hints = nameHints(file && file.name);
  const objectType = context.objectType || null;
  const destinationType = context.destinationType || null;

  let category = FILE_CATEGORY.OTHER;
  let filePurpose = FILE_PURPOSE.NONE;
  let status = STATUS.DRAFT;
  let confidence = 0.6;

  if (kind === FILE_KIND.IMAGE) {
    category = FILE_CATEGORY.STONE_IMAGE;
    confidence = 0.7;
    if (hints.isRender) {
      category = FILE_CATEGORY.RENDER_IMAGE;
      status = STATUS.REFERENCE;
      confidence = 0.75;
    }
    if (hints.isSketch) {
      category = FILE_CATEGORY.SKETCH;
      confidence = 0.7;
    }
  } else if (kind === FILE_KIND.VIDEO) {
    category = FILE_CATEGORY.OTHER;
    confidence = 0.7;
  } else if (kind === FILE_KIND.PDF) {
    // PDF is a certificate candidate, especially with cert-like names.
    category = FILE_CATEGORY.CERTIFICATE;
    confidence = hints.isCert ? 0.85 : 0.6;
  } else if (kind === FILE_KIND.MODEL_3D) {
    category = FILE_CATEGORY.MODEL_3D;
    confidence = 0.75;
    // Purpose by context:
    if (
      (objectType === OBJECT_TYPE.STONE || context.intakeType === 'stone') &&
      ['stl', 'obj', '3dm'].includes(ext)
    ) {
      filePurpose = FILE_PURPOSE.STONE_SCAN;
      confidence = 0.8;
    } else if (destinationType === DESTINATION_TYPE.MODEL_LIBRARY) {
      if (['stl', '3dm'].includes(ext)) {
        filePurpose = FILE_PURPOSE.PRODUCTION_MODEL;
        confidence = 0.8;
      } else if (['obj', 'glb', 'gltf'].includes(ext)) {
        filePurpose = FILE_PURPOSE.PRESENTATION_MODEL;
        confidence = 0.8;
      }
    }
  } else {
    confidence = 0.4; // unknown kind
  }

  // Name-based certificate override for non-pdf too (rare but explicit).
  if (hints.isCert && kind !== FILE_KIND.MODEL_3D && kind !== FILE_KIND.IMAGE) {
    category = FILE_CATEGORY.CERTIFICATE;
  }

  const needsConfirm = confidence < 0.6 || kind === FILE_KIND.OTHER;

  return {
    fileName: (file && file.name) || 'קובץ ללא שם',
    mimeType,
    extension: ext,
    fileSize: file && typeof file.size === 'number' ? file.size : null,
    fileKind: kind,
    category,
    filePurpose,
    status,
    confidence,
    needsConfirm,
  };
}

export function detectFiles(fileList, context = {}) {
  return Array.from(fileList || []).map((f) => ({ file: f, detected: detectFile(f, context) }));
}
