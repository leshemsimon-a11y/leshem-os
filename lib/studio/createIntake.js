// lib/studio/createIntake.js
//
// LESHEM.S OS — Clean 8H: Create Flow intake normalization (pure helper).
//
// Normalizes everything the guided Create Flow can receive — pasted text,
// pasted URLs, pasted images, dragged files, uploaded files — into one
// session-held intake record shape, with detected type, Hebrew labels and a
// suggested attach role. Persistence happens ONLY at save time through the
// EXISTING public APIs (assetsStore.createObjectWithFiles +
// linkObjectToProject, designProjects.updateProject with 8C attach records).
// This file is pure constants + pure functions: NO store, NO persistence
// key, NO network, NO new package (browser File/Blob objects are only
// carried through, never created here).

import {
  ATTACHED_ROLE,
  ATTACHED_ROLE_HE,
  ATTACHED_FILE_TYPE,
  classifyExtension,
} from './attachedAssets';

// ---------------------------------------------------------------------------
// Intake kinds (how the item arrived) + item types (what it is).
// ---------------------------------------------------------------------------
export const INTAKE_KIND = Object.freeze({
  TEXT: 'text',
  URL: 'url',
  FILE: 'file', // uploaded or dragged file
  PASTED_IMAGE: 'pastedImage', // image blob from the clipboard
});

export const INTAKE_ITEM_TYPE = Object.freeze({
  IMAGE: 'image',
  TEXT_REF: 'textRef',
  URL: 'url',
  MODEL: 'model', // STL / OBJ / GLB / GLTF
  MODEL_FUTURE: 'modelFuture', // 3DM — future support
  DOCUMENT: 'document', // PDF / client document
  UNKNOWN: 'unknown',
});

export const INTAKE_TYPE_HE = Object.freeze({
  image: 'תמונה',
  textRef: 'רפרנס טקסטואלי',
  url: 'קישור (URL)',
  model: 'קובץ מודל תלת־ממד',
  modelFuture: 'קובץ 3DM — תמיכה בהמשך',
  document: 'מסמך PDF',
  unknown: 'קובץ לא מזוהה',
});

export const INTAKE_STATUS_HE = Object.freeze({
  received: 'נקלט',
  needsSave: 'דורש שמירת תיק',
  savedAsset: 'נשמר בספריית הנכסים וצורף לתיק ✓',
  savedInBrief: 'נשמר בתוך התיק ✓',
  failed: 'השמירה לספרייה נכשלה — נשמר כטקסט בתיק',
});

// ---------------------------------------------------------------------------
// Detection.
// ---------------------------------------------------------------------------
export function isLikelyUrl(text) {
  const t = typeof text === 'string' ? text.trim() : '';
  if (!t || /\s/.test(t)) return false;
  return /^https?:\/\/[^\s]+\.[^\s]+/i.test(t) || /^www\.[^\s]+\.[^\s]+/i.test(t);
}

export function extensionOfName(fileName) {
  if (typeof fileName !== 'string') return '';
  const m = fileName.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : '';
}

// File → intake item type (mime first, extension fallback; 8G classification
// reused so glb/gltf/3dm/pdf behave exactly like attached assets).
export function detectFileItemType(fileName, mimeType) {
  const mime = typeof mimeType === 'string' ? mimeType : '';
  if (mime.startsWith('image/')) return INTAKE_ITEM_TYPE.IMAGE;
  const cls = classifyExtension(extensionOfName(fileName));
  if (cls === ATTACHED_FILE_TYPE.IMAGE) return INTAKE_ITEM_TYPE.IMAGE;
  if (cls === ATTACHED_FILE_TYPE.MODEL) return INTAKE_ITEM_TYPE.MODEL;
  if (cls === ATTACHED_FILE_TYPE.MODEL_FUTURE) return INTAKE_ITEM_TYPE.MODEL_FUTURE;
  if (cls === ATTACHED_FILE_TYPE.DOCUMENT || mime === 'application/pdf') {
    return INTAKE_ITEM_TYPE.DOCUMENT;
  }
  return INTAKE_ITEM_TYPE.UNKNOWN;
}

// Suggested attach role per item type (canonical English values from 8C/8G).
export function suggestedRoleFor(itemType) {
  switch (itemType) {
    case INTAKE_ITEM_TYPE.MODEL:
    case INTAKE_ITEM_TYPE.MODEL_FUTURE:
      return ATTACHED_ROLE.JEWELRY_MODEL;
    case INTAKE_ITEM_TYPE.DOCUMENT:
      return ATTACHED_ROLE.CLIENT_FILE;
    case INTAKE_ITEM_TYPE.IMAGE:
    case INTAKE_ITEM_TYPE.TEXT_REF:
    case INTAKE_ITEM_TYPE.URL:
    default:
      return ATTACHED_ROLE.DESIGN_REFERENCE;
  }
}

export function suggestedRoleHe(itemType) {
  return ATTACHED_ROLE_HE[suggestedRoleFor(itemType)] || ATTACHED_ROLE_HE.designReference;
}

// ---------------------------------------------------------------------------
// Record builders (session records; ids are local to the flow session).
// ---------------------------------------------------------------------------
let seq = 0;
function makeIntakeId() {
  seq += 1;
  return `intake_${Date.now().toString(36)}_${seq}`;
}

export function buildTextIntakeItem(text) {
  const t = typeof text === 'string' ? text.trim() : '';
  if (!t) return null;
  const url = isLikelyUrl(t);
  const itemType = url ? INTAKE_ITEM_TYPE.URL : INTAKE_ITEM_TYPE.TEXT_REF;
  return {
    intakeId: makeIntakeId(),
    kind: url ? INTAKE_KIND.URL : INTAKE_KIND.TEXT,
    name: url ? t : t.length > 60 ? `${t.slice(0, 60)}…` : t,
    itemType,
    extension: '',
    suggestedRole: suggestedRoleFor(itemType),
    textContent: t,
    sizeBytes: null,
    blob: null,
    previewUrl: null,
    status: 'received',
  };
}

// file: browser File (upload/drag) or Blob (pasted image). previewUrl is an
// EPHEMERAL object URL created by the component (session display only —
// never persisted; durable storage happens via the public addFile blob path).
export function buildFileIntakeItem({ file, fileName, mimeType, pasted, previewUrl }) {
  if (!file) return null;
  const name =
    typeof fileName === 'string' && fileName
      ? fileName
      : pasted
        ? `תמונה שהודבקה ${new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}.png`
        : 'קובץ ללא שם';
  const mime = typeof mimeType === 'string' && mimeType ? mimeType : file.type || '';
  const itemType = detectFileItemType(name, mime);
  return {
    intakeId: makeIntakeId(),
    kind: pasted ? INTAKE_KIND.PASTED_IMAGE : INTAKE_KIND.FILE,
    name,
    itemType,
    extension: extensionOfName(name) || (mime.startsWith('image/') ? mime.split('/')[1] || 'png' : ''),
    suggestedRole: suggestedRoleFor(itemType),
    textContent: '',
    sizeBytes: typeof file.size === 'number' ? file.size : null,
    blob: file,
    previewUrl: previewUrl || null,
    status: 'received',
  };
}

export function isFileKindIntake(item) {
  return Boolean(
    item && (item.kind === INTAKE_KIND.FILE || item.kind === INTAKE_KIND.PASTED_IMAGE)
  );
}

// ---------------------------------------------------------------------------
// Reference-text synthesis — feeds the EXISTING createFlow generator/brief
// (Hebrew is fine there: the generator only clips it into Hebrew echoes and
// the brief persists it in the existing `intention` free-text field; the
// English prompt path never embeds it).
// ---------------------------------------------------------------------------
export function intakeToReferenceText(items, freeReferenceText) {
  const list = Array.isArray(items) ? items : [];
  const lines = [];
  const free = typeof freeReferenceText === 'string' ? freeReferenceText.trim() : '';
  if (free) lines.push(free);
  list.forEach((it) => {
    if (!it) return;
    if (it.kind === INTAKE_KIND.TEXT) lines.push(it.textContent);
    else if (it.kind === INTAKE_KIND.URL) lines.push(`קישור רפרנס: ${it.textContent}`);
    else lines.push(`קובץ מצורף: ${it.name} (${INTAKE_TYPE_HE[it.itemType] || INTAKE_TYPE_HE.unknown})`);
  });
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Persistence-row builders — inputs for the EXISTING public
// assetsStore.createObjectWithFiles (same shape the Quick Create wizard
// sends). Values are VALID existing enum members only.
// ---------------------------------------------------------------------------
const OBJECT_TYPE_BY_ITEM = Object.freeze({
  image: 'inspiration',
  model: 'jewelryModel',
  modelFuture: 'jewelryModel',
  document: 'clientReference',
  unknown: 'other',
});
const FILE_KIND_BY_ITEM = Object.freeze({
  image: 'image',
  model: 'model3d',
  modelFuture: 'model3d',
  document: 'pdf',
  unknown: 'other',
});
const FILE_CATEGORY_BY_ITEM = Object.freeze({
  image: 'inspiration',
  model: 'model3d',
  modelFuture: 'model3d',
  document: 'clientReference',
  unknown: 'other',
});

export function intakeObjectInput(item, workFileName) {
  if (!isFileKindIntake(item)) return null;
  return {
    title: item.name,
    objectType: OBJECT_TYPE_BY_ITEM[item.itemType] || 'other',
    description: workFileName ? `נקלט במסלול היצירה עבור: ${workFileName}` : 'נקלט במסלול היצירה',
    status: 'draft',
    destinationType: 'inspiration',
    sourceType: null,
    assetRole: item.suggestedRole,
  };
}

export function intakeFileRow(item) {
  if (!isFileKindIntake(item)) return null;
  return {
    file: item.blob,
    fileName: item.name,
    mimeType: (item.blob && item.blob.type) || '',
    extension: item.extension,
    fileSize: item.sizeBytes,
    fileKind: FILE_KIND_BY_ITEM[item.itemType] || 'other',
    filePurpose: 'renderReference',
    category: FILE_CATEGORY_BY_ITEM[item.itemType] || 'other',
    status: 'approved',
  };
}

// ---------------------------------------------------------------------------
// Summary helpers (step 4 «מה המערכת תשתמש בו» + counters).
// ---------------------------------------------------------------------------
export function intakeCounts(items) {
  const list = Array.isArray(items) ? items : [];
  return {
    total: list.length,
    files: list.filter(isFileKindIntake).length,
    texts: list.filter((it) => it && it.kind === INTAKE_KIND.TEXT).length,
    urls: list.filter((it) => it && it.kind === INTAKE_KIND.URL).length,
  };
}

export function intakeSummaryHe(items) {
  const c = intakeCounts(items);
  if (c.total === 0) return 'ללא רפרנסים ונכסים';
  const bits = [];
  if (c.files) bits.push(c.files === 1 ? 'קובץ אחד' : `${c.files} קבצים`);
  if (c.texts) bits.push(c.texts === 1 ? 'רפרנס טקסט אחד' : `${c.texts} רפרנסי טקסט`);
  if (c.urls) bits.push(c.urls === 1 ? 'קישור אחד' : `${c.urls} קישורים`);
  return bits.join(' · ');
}
