// lib/studio/attachedAssets.js
//
// LESHEM.S OS — Clean 8C: Attached Assets helper (shared, pure).
//
// Small formatting/record helper for assets ATTACHED to a Work File (Design
// Project). The attached list lives in the project's EXISTING reserved
// `assets` array (normalizeProject in lib/studio/designProjects.js already
// preserves it), persisted only through the EXISTING public updateProject
// API. This file adds NO store, NO persistence key, NO schema change — pure
// constants and pure functions only.
//
// Language rules:
//   • Internal role values — canonical English (designReference, …).
//   • UI labels — Hebrew (רפרנס עיצוב, …).
//   • English prompt phrases — English only; asset/file NAMES are never
//     placed into English output (they may contain Hebrew).

// ---------------------------------------------------------------------------
// Roles — canonical English values + Hebrew UI labels.
// ---------------------------------------------------------------------------
export const ATTACHED_ROLE = Object.freeze({
  DESIGN_REFERENCE: 'designReference',
  JEWELRY_MODEL: 'jewelryModel',
  SKETCH: 'sketch',
  CLIENT_FILE: 'clientFile',
  MEDIA_ASSET: 'mediaAsset',
});

export const ATTACHED_ROLE_VALUES = Object.freeze(Object.values(ATTACHED_ROLE));

export const ATTACHED_ROLE_HE = Object.freeze({
  designReference: 'רפרנס עיצוב',
  jewelryModel: 'מודל תכשיט',
  sketch: 'סקיצה',
  clientFile: 'קובץ לקוח',
  mediaAsset: 'נכס מדיה',
});

export function isValidAttachedRole(v) {
  return ATTACHED_ROLE_VALUES.includes(v);
}

export function attachedRoleHe(role) {
  return ATTACHED_ROLE_HE[role] || ATTACHED_ROLE_HE.mediaAsset;
}

// ---------------------------------------------------------------------------
// File-type classification (extension-based; self-contained, no imports).
// ---------------------------------------------------------------------------
const IMAGE_EXTS = Object.freeze(['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'avif']);
const MODEL_EXTS = Object.freeze(['stl', 'obj']);
const FUTURE_MODEL_EXTS = Object.freeze(['3dm']);

export const ATTACHED_FILE_TYPE = Object.freeze({
  IMAGE: 'image',
  MODEL: 'model', // STL / OBJ — usable now as attached model files
  MODEL_FUTURE: 'modelFuture', // 3DM — detected, viewer is future support
  OTHER: 'other',
});

export function classifyExtension(ext) {
  const e = typeof ext === 'string' ? ext.toLowerCase().replace(/^\./, '') : '';
  if (IMAGE_EXTS.includes(e)) return ATTACHED_FILE_TYPE.IMAGE;
  if (MODEL_EXTS.includes(e)) return ATTACHED_FILE_TYPE.MODEL;
  if (FUTURE_MODEL_EXTS.includes(e)) return ATTACHED_FILE_TYPE.MODEL_FUTURE;
  return ATTACHED_FILE_TYPE.OTHER;
}

// ---------------------------------------------------------------------------
// Record builder — the minimal attached-asset entry stored on the project.
// previewUrl is intentionally NOT stored: uploaded files resolve only to
// EPHEMERAL IndexedDB blob URLs (assetsStore.getFileUrl), which do not
// survive a session. We store the durable previewFileId instead, so a future
// milestone can resolve a thumbnail through the existing store.
// ---------------------------------------------------------------------------
export function buildAttachedAssetRecord({ object, files, role, previewFileId }) {
  if (!object || typeof object.objectId !== 'string') return null;
  const list = Array.isArray(files) ? files.filter((f) => f && f.status !== 'archived') : [];
  const primary =
    (previewFileId && list.find((f) => f.fileId === previewFileId)) ||
    list.find((f) => f.status === 'approved') ||
    list[0] ||
    null;
  const ext = primary && typeof primary.extension === 'string' ? primary.extension : '';
  return {
    assetId: object.objectId,
    name: typeof object.title === 'string' ? object.title : '',
    type: typeof object.objectType === 'string' ? object.objectType : 'other',
    fileType: classifyExtension(ext),
    fileExtension: ext ? ext.toLowerCase().replace(/^\./, '') : '',
    previewFileId: typeof previewFileId === 'string' ? previewFileId : null,
    role: isValidAttachedRole(role) ? role : ATTACHED_ROLE.MEDIA_ASSET,
    source: 'assetLibrary',
    attachedAt: Date.now(),
  };
}

// Upsert into an existing attached list (re-attaching the same asset updates
// its role/date instead of duplicating). Pure — returns a NEW array.
export function upsertAttachedAsset(existingAssets, record) {
  const list = Array.isArray(existingAssets) ? existingAssets.slice() : [];
  if (!record || !record.assetId) return list;
  const idx = list.findIndex((a) => a && a.assetId === record.assetId);
  if (idx >= 0) list[idx] = { ...list[idx], ...record };
  else list.push(record);
  return list;
}

// ---------------------------------------------------------------------------
// Read/format helpers (used by the projects panel + Output Pack).
// ---------------------------------------------------------------------------
export function getAttachedAssets(project) {
  return project && Array.isArray(project.assets)
    ? project.assets.filter((a) => a && typeof a.assetId === 'string')
    : [];
}

export function attachedCount(project) {
  return getAttachedAssets(project).length;
}

// Unique Hebrew role labels, in first-seen order (compact chips line).
export function attachedRoleLabelsHe(project) {
  const seen = [];
  getAttachedAssets(project).forEach((a) => {
    const label = attachedRoleHe(a.role);
    if (!seen.includes(label)) seen.push(label);
  });
  return seen;
}

// Compact Hebrew summary: «צורפו 3 נכסים» / «צורף נכס אחד».
export function attachedSummaryHe(project) {
  const n = attachedCount(project);
  if (n <= 0) return null;
  return n === 1 ? 'צורף נכס אחד' : `צורפו ${n} נכסים`;
}

// ---------------------------------------------------------------------------
// English media-prompt phrases (English only; no names, no Hebrew ever).
// ---------------------------------------------------------------------------
export function attachedPromptPhrasesEn(project) {
  const assets = getAttachedAssets(project);
  if (!assets.length) return [];
  const phrases = [];
  const hasImage = assets.some((a) => a.fileType === ATTACHED_FILE_TYPE.IMAGE);
  const hasModel = assets.some((a) => a.fileType === ATTACHED_FILE_TYPE.MODEL);
  const hasSketch = assets.some((a) => a.role === ATTACHED_ROLE.SKETCH);
  if (hasImage) {
    phrases.push('Use the attached jewelry reference image as design inspiration.');
  }
  if (hasModel) {
    phrases.push('Use the attached STL/OBJ model as a base jewelry form reference.');
  }
  if (hasSketch && !hasImage) {
    phrases.push('Follow the attached design sketch as the primary composition reference.');
  }
  return phrases;
}
