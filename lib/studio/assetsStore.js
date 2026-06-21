// lib/studio/assetsStore.js
//
// LESHEM.S OS — Asset Library Store (Clean 4B.1, upgraded)
//
// Replaces the Clean 4B flat "one file = one asset" model with a two-level
// OBJECT + FILES model persisted in IndexedDB (see assetsDb.js):
//   • AssetObject — a piece of reusable design knowledge (a stone, a jewelry
//     model, a design project reference, a collection, a render output…).
//   • AssetFile   — one file belonging to an object (image / video / 3D / pdf /
//     sketch / render / document). The binary Blob lives in IndexedDB.
//
// This module owns the canonical enums, defensive normalization, and an async
// API that orchestrates assetsDb. It also exposes a React hook that hydrates
// from IndexedDB on mount so uploads survive a refresh.
//
// HARD RULES: local only. No cloud, no backend, no Airtable, no network, no
// paid services, no API keys, no new npm packages, no commerce wording.

import {
  dbPutObject,
  dbGetAllObjects,
  dbDeleteObject,
  dbPutFile,
  dbPutFileMetaOnly,
  dbGetAllFiles,
  dbGetFilesForObject,
  dbDeleteFile,
  dbDeleteFilesForObject,
  dbGetBlobUrl,
} from './assetsDb';

// ---------------------------------------------------------------------------
// Canonical enums (English values; Hebrew labels live in labels.js)
// ---------------------------------------------------------------------------
export const OBJECT_TYPE = Object.freeze({
  STONE: 'stone',
  JEWELRY_MODEL: 'jewelryModel',
  DESIGN_PROJECT: 'designProject',
  COLLECTION: 'collection',
  RENDER_OUTPUT: 'renderOutput',
  CLIENT_REFERENCE: 'clientReference',
  INSPIRATION: 'inspiration',
  OTHER: 'other',
});
export const OBJECT_TYPE_VALUES = Object.freeze(Object.values(OBJECT_TYPE));

export const FILE_KIND = Object.freeze({
  IMAGE: 'image',
  VIDEO: 'video',
  MODEL_3D: 'model3d',
  PDF: 'pdf',
  SKETCH: 'sketch',
  RENDER: 'render',
  DOCUMENT: 'document',
  OTHER: 'other',
});
export const FILE_KIND_VALUES = Object.freeze(Object.values(FILE_KIND));

export const FILE_PURPOSE = Object.freeze({
  PRODUCTION_MODEL: 'productionModel',
  PRESENTATION_MODEL: 'presentationModel',
  STONE_SCAN: 'stoneScan',
  MEASUREMENT_REFERENCE: 'measurementReference',
  RENDER_REFERENCE: 'renderReference',
  NONE: 'none',
});
export const FILE_PURPOSE_VALUES = Object.freeze(Object.values(FILE_PURPOSE));

// File categories carried forward from Clean 4B (still useful on files).
export const FILE_CATEGORY = Object.freeze({
  STONE_IMAGE: 'stoneImage',
  MODEL_3D: 'model3d',
  SKETCH: 'sketch',
  CERTIFICATE: 'certificate',
  CLIENT_REFERENCE: 'clientReference',
  INSPIRATION: 'inspiration',
  RENDER_IMAGE: 'renderImage',
  OTHER: 'other',
});
export const FILE_CATEGORY_VALUES = Object.freeze(Object.values(FILE_CATEGORY));

// Backward-compatible aliases for older Clean 4B components still present in some deployments.
export const ASSET_CATEGORY_VALUES = FILE_CATEGORY_VALUES;

export const STATUS = Object.freeze({
  DRAFT: 'draft',
  REFERENCE: 'reference',
  APPROVED: 'approved',
  ARCHIVED: 'archived',
});
export const STATUS_VALUES = Object.freeze(Object.values(STATUS));

// Backward-compatible alias for older Clean 4B components still present in some deployments.
export const ASSET_STATUS_VALUES = STATUS_VALUES;

// --- Clean 4B.3: ownership / client context + intake / destination ---------
export const OWNER_CONTEXT = Object.freeze({
  INTERNAL: 'internal',
  PRIVATE_CLIENT: 'privateClient',
  BUSINESS_CLIENT: 'businessClient',
  SUPPLIER: 'supplier',
  AGENT: 'agent',
  OTHER: 'other',
});
export const OWNER_CONTEXT_VALUES = Object.freeze(Object.values(OWNER_CONTEXT));

export const CLIENT_TYPE = Object.freeze({
  PRIVATE: 'privateClient',
  BUSINESS: 'businessClient',
  SUPPLIER: 'supplier',
  AGENT: 'agent',
  INTERNAL: 'internal',
  OTHER: 'other',
});
export const CLIENT_TYPE_VALUES = Object.freeze(Object.values(CLIENT_TYPE));

export const CLIENT_TIER = Object.freeze({
  REGULAR: 'regular',
  VIP: 'vip',
  BUSINESS: 'business',
  AGENT: 'agent',
  TEMPORARY: 'temporary',
  OTHER: 'other',
});
export const CLIENT_TIER_VALUES = Object.freeze(Object.values(CLIENT_TIER));

export const VISIBILITY_LEVEL = Object.freeze({
  INTERNAL_ONLY: 'internalOnly',
  CLIENT_VISIBLE: 'clientVisible',
  SHARED_PREVIEW: 'sharedPreview',
  RESTRICTED: 'restricted',
});
export const VISIBILITY_LEVEL_VALUES = Object.freeze(Object.values(VISIBILITY_LEVEL));

export const PRICING_VISIBILITY = Object.freeze({
  HIDDEN: 'hidden',
  RETAIL_ONLY: 'retailOnly',
  FULL_BREAKDOWN: 'fullBreakdown',
  CUSTOM: 'custom',
});
export const PRICING_VISIBILITY_VALUES = Object.freeze(Object.values(PRICING_VISIBILITY));

export const SHARING_MODE = Object.freeze({
  NONE: 'noSharingYet',
  CLIENT_REVIEW: 'clientReview',
  AGENT_REVIEW: 'agentReview',
  PUBLIC_MEDIA: 'publicMedia',
  CUSTOM: 'custom',
});
export const SHARING_MODE_VALUES = Object.freeze(Object.values(SHARING_MODE));

export const DESTINATION_TYPE = Object.freeze({
  INVENTORY: 'inventory',
  MODEL_LIBRARY: 'modelLibrary',
  DESIGN_PROJECT: 'designProject',
  WORK_TRAY_ONLY: 'workTrayOnly',
  COLLECTION: 'collection',
  INSPIRATION: 'inspiration',
  APPROVED_MEDIA: 'approvedMedia',
  UNDECIDED: 'undecided',
});
export const DESTINATION_TYPE_VALUES = Object.freeze(Object.values(DESTINATION_TYPE));

// --- Clean 4B.4a: Catalog / cataloging layer ------------------------------
// IMPORTANT: this is a NEW, additive catalog layer for the Asset Library. It
// is intentionally SEPARATE from the canonical six-axis gemological taxonomy in
// lib/studio/taxonomy.js (stoneCategory/origin/stoneType/shape/assetType/
// inventoryLayer). It exists so assets/media/models stay classifiable and
// retrievable. It never feeds customer-facing certificate output.

export const PRIMARY_CATEGORY = Object.freeze({
  GOODS: 'goods',
  STONE: 'stone',
  JEWELRY_MODEL: 'jewelryModel',
  MEDIA: 'media',
  CERTIFICATE: 'certificate',
  SKETCH: 'sketch',
  CLIENT_REFERENCE: 'clientReference',
  INSPIRATION: 'inspiration',
  RENDER_OUTPUT: 'renderOutput',
  PRODUCTION_FILE: 'productionFile',
  COLLECTION_ASSET: 'collectionAsset',
  OTHER: 'other',
});
export const PRIMARY_CATEGORY_VALUES = Object.freeze(Object.values(PRIMARY_CATEGORY));

// Secondary categories, grouped by the family they belong to. A flat value
// list is also exposed for validation. Groups drive the wizard's dependent
// dropdown without hardcoding combinations in the UI.
export const SECONDARY_CATEGORY_BY_FAMILY = Object.freeze({
  stone: Object.freeze([
    'naturalDiamond', 'labDiamond', 'gemstone', 'naturalMelee', 'labMelee',
    'stonePair', 'stoneSet', 'clientStone', 'supplierVirtualStone', 'other',
  ]),
  goods: Object.freeze([
    'naturalDiamond', 'labDiamond', 'gemstone', 'naturalMelee', 'labMelee',
    'stonePair', 'stoneSet', 'clientStone', 'supplierVirtualStone', 'other',
  ]),
  jewelryModel: Object.freeze([
    'ring', 'pendant', 'earrings', 'bracelet', 'necklace', 'setting',
    'chain', 'component', 'other',
  ]),
  media: Object.freeze([
    'stonePhoto', 'stoneVideo', 'productPhoto', 'productVideo', 'renderImage',
    'renderVideo', 'approvedMedia', 'referenceImage', 'referenceVideo', 'other',
  ]),
});
// Flat list of every secondary value (deduped) for graceful validation.
export const SECONDARY_CATEGORY_VALUES = Object.freeze(
  Array.from(
    new Set(
      Object.values(SECONDARY_CATEGORY_BY_FAMILY).reduce((acc, arr) => acc.concat(arr), [])
    )
  )
);

// Asset family — a coarse grouping that also drives the catalog code prefix.
export const ASSET_FAMILY = Object.freeze({
  STONE: 'stone',
  MODEL: 'model',
  MEDIA: 'media',
  PROJECT: 'project',
  COLLECTION: 'collection',
  REFERENCE: 'reference',
  OTHER: 'other',
});
export const ASSET_FAMILY_VALUES = Object.freeze(Object.values(ASSET_FAMILY));

export const USAGE_PURPOSE = Object.freeze({
  INVENTORY: 'inventory',
  MODEL_LIBRARY: 'modelLibrary',
  WORK_TRAY: 'workTray',
  DESIGN_PROJECT: 'designProject',
  COLLECTION: 'collection',
  RENDER_BRIEF: 'renderBrief',
  CLIENT_REVIEW: 'clientReview',
  MARKETING: 'marketing',
  PRODUCTION: 'production',
  INTERNAL_REFERENCE: 'internalReference',
  APPROVED_OUTPUT: 'approvedOutput',
});
export const USAGE_PURPOSE_VALUES = Object.freeze(Object.values(USAGE_PURPOSE));

export const SOURCE_TYPE = Object.freeze({
  INTERNAL: 'internal',
  CLIENT: 'client',
  SUPPLIER: 'supplier',
  AGENT: 'agent',
  IMPORTED_FILE: 'importedFile',
  MANUAL_UPLOAD: 'manualUpload',
  GENERATED_BY_SYSTEM: 'generatedBySystem',
  EXTERNAL_REFERENCE: 'externalReference',
  OTHER: 'other',
});
export const SOURCE_TYPE_VALUES = Object.freeze(Object.values(SOURCE_TYPE));

// Catalog code prefix per asset family / primary category.
export const CATALOG_PREFIX = Object.freeze({
  stone: 'STN',
  goods: 'STN',
  jewelryModel: 'MOD',
  model: 'MOD',
  media: 'MED',
  designProject: 'PRJ',
  project: 'PRJ',
  collection: 'COL',
  collectionAsset: 'COL',
  clientReference: 'REF',
  reference: 'REF',
  inspiration: 'REF',
});
export const CATALOG_PREFIX_DEFAULT = 'AST';

export function isValidPrimaryCategory(v) { return PRIMARY_CATEGORY_VALUES.includes(v); }
export function isValidSecondaryCategory(v) { return SECONDARY_CATEGORY_VALUES.includes(v); }
export function isValidAssetFamily(v) { return ASSET_FAMILY_VALUES.includes(v); }
export function isValidUsagePurpose(v) { return USAGE_PURPOSE_VALUES.includes(v); }
export function isValidSourceType(v) { return SOURCE_TYPE_VALUES.includes(v); }

export const INTERNAL_OWNER_NAME = 'LESHEM.S internal workspace';

export function isValidOwnerContext(v) { return OWNER_CONTEXT_VALUES.includes(v); }
export function isValidClientType(v) { return CLIENT_TYPE_VALUES.includes(v); }
export function isValidClientTier(v) { return CLIENT_TIER_VALUES.includes(v); }
export function isValidVisibility(v) { return VISIBILITY_LEVEL_VALUES.includes(v); }
export function isValidPricingVisibility(v) { return PRICING_VISIBILITY_VALUES.includes(v); }
export function isValidSharingMode(v) { return SHARING_MODE_VALUES.includes(v); }
export function isValidDestination(v) { return DESTINATION_TYPE_VALUES.includes(v); }

// 3D formats we recognize (preview attempted for stl/obj/3dm/glb/gltf).
export const MODEL_3D_EXT = Object.freeze(['stl', 'obj', '3dm', 'glb', 'gltf']);

export function isValidObjectType(v) { return OBJECT_TYPE_VALUES.includes(v); }
export function isValidFileKind(v) { return FILE_KIND_VALUES.includes(v); }
export function isValidFilePurpose(v) { return FILE_PURPOSE_VALUES.includes(v); }
export function isValidFileCategory(v) { return FILE_CATEGORY_VALUES.includes(v); }
export function isValidStatus(v) { return STATUS_VALUES.includes(v); }

// ---------------------------------------------------------------------------
// Ids + inference
// ---------------------------------------------------------------------------
function makeId(prefix) {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function extensionOf(fileName) {
  if (typeof fileName !== 'string') return '';
  const m = fileName.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : '';
}

export function inferFileKind(file) {
  const type = (file && file.type) || '';
  const ext = extensionOf(file && file.name);
  if (type.startsWith('image/')) return FILE_KIND.IMAGE;
  if (type.startsWith('video/')) return FILE_KIND.VIDEO;
  if (type === 'application/pdf' || ext === 'pdf') return FILE_KIND.PDF;
  if (MODEL_3D_EXT.includes(ext)) return FILE_KIND.MODEL_3D;
  return FILE_KIND.OTHER;
}

export function is3DExt(ext) {
  return MODEL_3D_EXT.includes(String(ext || '').toLowerCase());
}

// ---------------------------------------------------------------------------
// Clean 4B.4a: Catalog code + tag suggestions (pure, no side effects)
// ---------------------------------------------------------------------------
// Resolve the catalog prefix from primaryCategory / assetFamily / objectType.
export function catalogPrefixFor({ primaryCategory, assetFamily, objectType } = {}) {
  return (
    CATALOG_PREFIX[primaryCategory] ||
    CATALOG_PREFIX[assetFamily] ||
    CATALOG_PREFIX[objectType] ||
    CATALOG_PREFIX_DEFAULT
  );
}

// Generate a sequential catalog code like STN-2026-0001. The sequence is per
// prefix per year, computed by scanning existing objects' catalogCode values.
// Pure: callers pass the current object list; nothing is persisted here.
export function generateCatalogCode(input, existingObjects) {
  const prefix = catalogPrefixFor(input || {});
  const year = new Date().getFullYear();
  const head = `${prefix}-${year}-`;
  let max = 0;
  const list = Array.isArray(existingObjects) ? existingObjects : [];
  for (const o of list) {
    const code = o && typeof o.catalogCode === 'string' ? o.catalogCode : '';
    if (code.indexOf(head) === 0) {
      const n = parseInt(code.slice(head.length), 10);
      if (!Number.isNaN(n) && n > max) max = n;
    }
  }
  const seq = String(max + 1).padStart(4, '0');
  return `${head}${seq}`;
}

// Suggest basic tags from filename(s), category, objectType and destination.
// Returns a deduped array of short lowercase-ish tags (Hebrew preserved).
export function suggestTags({ title, fileNames, primaryCategory, secondaryCategory, objectType, destinationType } = {}) {
  const out = [];
  const push = (t) => {
    if (typeof t !== 'string') return;
    const v = t.trim();
    if (v && v.length <= 32 && !out.includes(v)) out.push(v);
  };
  const KNOWN = [
    'round', 'oval', 'emerald', 'cushion', 'radiant', 'pear', 'marquise',
    'princess', 'heart', 'asscher', 'baguette', 'trillion', 'solitaire',
    'halo', 'bridal', 'ring', 'pendant', 'earrings', 'bracelet', 'necklace',
    'yellow-gold', 'white-gold', 'rose-gold', 'platinum', 'diamond', 'sapphire',
    'ruby', 'production', 'render-ready', 'needs-review', 'vip-client',
  ];
  const scanText = (text) => {
    if (typeof text !== 'string') return;
    const lower = text.toLowerCase();
    for (const k of KNOWN) if (lower.indexOf(k) !== -1) push(k);
    const ct = lower.match(/(\d+(?:\.\d+)?)\s?ct\b/);
    if (ct) push(`${ct[1]}ct`);
  };
  scanText(title);
  (Array.isArray(fileNames) ? fileNames : []).forEach(scanText);
  if (secondaryCategory) push(secondaryCategory);
  else if (primaryCategory) push(primaryCategory);
  if (objectType) push(objectType);
  if (destinationType && destinationType !== 'undecided') push(destinationType);
  return out.slice(0, 12);
}

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------
export function normalizeObject(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const objectId = typeof raw.objectId === 'string' && raw.objectId ? raw.objectId : makeId('obj');
  return {
    objectId,
    objectType: isValidObjectType(raw.objectType) ? raw.objectType : OBJECT_TYPE.OTHER,
    title: typeof raw.title === 'string' && raw.title.trim() ? raw.title : 'אובייקט ללא שם',
    description: typeof raw.description === 'string' ? raw.description : '',
    linkedDesignProjectId:
      typeof raw.linkedDesignProjectId === 'string' ? raw.linkedDesignProjectId : null,
    linkedStoneId: typeof raw.linkedStoneId === 'string' ? raw.linkedStoneId : null,
    linkedModelId: typeof raw.linkedModelId === 'string' ? raw.linkedModelId : null,
    linkedCollectionId:
      typeof raw.linkedCollectionId === 'string' ? raw.linkedCollectionId : null,
    status: isValidStatus(raw.status) ? raw.status : STATUS.DRAFT,
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : Date.now(),

    // --- Clean 4B.3: intake + destination ---
    intakeType: typeof raw.intakeType === 'string' ? raw.intakeType : null,
    destinationType: isValidDestination(raw.destinationType)
      ? raw.destinationType
      : DESTINATION_TYPE.UNDECIDED,

    // --- Clean 4B.3: ownership / client context (default internal) ---
    ownerContextType: isValidOwnerContext(raw.ownerContextType)
      ? raw.ownerContextType
      : OWNER_CONTEXT.INTERNAL,
    ownerDisplayName:
      typeof raw.ownerDisplayName === 'string' && raw.ownerDisplayName.trim()
        ? raw.ownerDisplayName
        : INTERNAL_OWNER_NAME,
    linkedClientId: typeof raw.linkedClientId === 'string' ? raw.linkedClientId : null,
    linkedClientName: typeof raw.linkedClientName === 'string' ? raw.linkedClientName : null,
    clientType: isValidClientType(raw.clientType) ? raw.clientType : null,
    clientRole: typeof raw.clientRole === 'string' ? raw.clientRole : null,
    clientTier: isValidClientTier(raw.clientTier) ? raw.clientTier : null,
    clientNotes: typeof raw.clientNotes === 'string' ? raw.clientNotes : '',
    visibilityLevel: isValidVisibility(raw.visibilityLevel)
      ? raw.visibilityLevel
      : VISIBILITY_LEVEL.INTERNAL_ONLY,
    pricingVisibility: isValidPricingVisibility(raw.pricingVisibility)
      ? raw.pricingVisibility
      : PRICING_VISIBILITY.HIDDEN,
    sharingMode: isValidSharingMode(raw.sharingMode)
      ? raw.sharingMode
      : SHARING_MODE.NONE,

    // --- Clean 4B.3: link placeholders + tray flag + inventory/model drafts ---
    linkedInventoryItemId:
      typeof raw.linkedInventoryItemId === 'string' ? raw.linkedInventoryItemId : null,
    addedToWorkTray: Boolean(raw.addedToWorkTray),
    inventoryDraft:
      raw.inventoryDraft && typeof raw.inventoryDraft === 'object' ? raw.inventoryDraft : null,
    modelDraft:
      raw.modelDraft && typeof raw.modelDraft === 'object' ? raw.modelDraft : null,

    // --- Clean 4B.4a: primary / cover image ---
    // Explicit cover image fileId. coverImageFileId is an optional alias that
    // mirrors primaryFileId when not separately set.
    primaryFileId: typeof raw.primaryFileId === 'string' ? raw.primaryFileId : null,
    coverImageFileId:
      typeof raw.coverImageFileId === 'string'
        ? raw.coverImageFileId
        : (typeof raw.primaryFileId === 'string' ? raw.primaryFileId : null),

    // --- Clean 4B.4a: catalog / cataloging layer (additive, separate from
    // the six-axis gemological taxonomy) ---
    catalogCode: typeof raw.catalogCode === 'string' ? raw.catalogCode : null,
    primaryCategory: isValidPrimaryCategory(raw.primaryCategory) ? raw.primaryCategory : null,
    secondaryCategory: isValidSecondaryCategory(raw.secondaryCategory) ? raw.secondaryCategory : null,
    assetFamily: isValidAssetFamily(raw.assetFamily) ? raw.assetFamily : null,
    assetRole: typeof raw.assetRole === 'string' ? raw.assetRole : null,
    usagePurpose: isValidUsagePurpose(raw.usagePurpose) ? raw.usagePurpose : null,
    sourceType: isValidSourceType(raw.sourceType) ? raw.sourceType : null,
    sourceName: typeof raw.sourceName === 'string' ? raw.sourceName : null,
    tags: Array.isArray(raw.tags)
      ? raw.tags.filter((t) => typeof t === 'string' && t.trim()).map((t) => t.trim())
      : [],

    // --- Clean 4B.4a: relationship scaffolding (populated by later sprints) ---
    linkedInventoryDraftId:
      typeof raw.linkedInventoryDraftId === 'string' ? raw.linkedInventoryDraftId : null,
    linkedModelDraftId:
      typeof raw.linkedModelDraftId === 'string' ? raw.linkedModelDraftId : null,
    linkedDesignProjectIds: Array.isArray(raw.linkedDesignProjectIds)
      ? raw.linkedDesignProjectIds.filter((x) => typeof x === 'string')
      : [],
    linkedCollectionIds: Array.isArray(raw.linkedCollectionIds)
      ? raw.linkedCollectionIds.filter((x) => typeof x === 'string')
      : [],
    linkedFileIds: Array.isArray(raw.linkedFileIds)
      ? raw.linkedFileIds.filter((x) => typeof x === 'string')
      : [],

    // future placeholders (reserved; inert)
    ownerUserId: typeof raw.ownerUserId === 'string' ? raw.ownerUserId : null,
    createdByUserId: typeof raw.createdByUserId === 'string' ? raw.createdByUserId : null,
    assignedToUserId: typeof raw.assignedToUserId === 'string' ? raw.assignedToUserId : null,
    visibility: typeof raw.visibility === 'string' ? raw.visibility : 'private',
    permissions: Array.isArray(raw.permissions) ? raw.permissions : [],
    approvedFileIds: Array.isArray(raw.approvedFileIds) ? raw.approvedFileIds : [],
    renderBriefIds: Array.isArray(raw.renderBriefIds) ? raw.renderBriefIds : [],
  };
}

export function normalizeFile(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const fileId = typeof raw.fileId === 'string' && raw.fileId ? raw.fileId : makeId('file');
  return {
    fileId,
    objectId: typeof raw.objectId === 'string' ? raw.objectId : null,
    fileName: typeof raw.fileName === 'string' && raw.fileName ? raw.fileName : 'קובץ ללא שם',
    mimeType: typeof raw.mimeType === 'string' ? raw.mimeType : '',
    extension: typeof raw.extension === 'string' ? raw.extension : '',
    fileSize: typeof raw.fileSize === 'number' ? raw.fileSize : null,
    fileKind: isValidFileKind(raw.fileKind) ? raw.fileKind : FILE_KIND.OTHER,
    filePurpose: isValidFilePurpose(raw.filePurpose) ? raw.filePurpose : FILE_PURPOSE.NONE,
    category: isValidFileCategory(raw.category) ? raw.category : FILE_CATEGORY.OTHER,
    status: isValidStatus(raw.status) ? raw.status : STATUS.DRAFT,
    notes: typeof raw.notes === 'string' ? raw.notes : '',
    blobStored: Boolean(raw.blobStored),
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : Date.now(),
  };
}

// ---------------------------------------------------------------------------
// Object API (async, IndexedDB-backed)
// ---------------------------------------------------------------------------
export async function createObject(input) {
  const now = Date.now();
  const obj = normalizeObject({ ...input, objectId: makeId('obj'), createdAt: now, updatedAt: now });
  await dbPutObject(obj);
  return obj;
}

// Clean 4B.4a: one-flow creation used by the Quick Create Wizard. Creates the
// object, adds ALL provided files to that SAME object (no splitting), then sets
// the first image file as the primary/cover image unless one is specified.
// `fileRows` is [{ file, fileName, mimeType, extension, fileSize, fileKind,
// filePurpose, category, status }]. Returns { object, files }.
export async function createObjectWithFiles(input, fileRows, primaryHintIndex) {
  const obj = await createObject(input);
  const saved = [];
  const rows = Array.isArray(fileRows) ? fileRows : [];
  for (const r of rows) {
    const meta = {
      fileName: r.fileName,
      mimeType: r.mimeType,
      extension: r.extension,
      fileSize: r.fileSize,
      fileKind: r.fileKind,
      filePurpose: r.filePurpose,
      category: r.category,
      status: r.status,
    };
    // eslint-disable-next-line no-await-in-loop
    const meta2 = await addFile(obj.objectId, meta, r.file || null);
    saved.push(meta2);
  }
  // Choose primary image: explicit hint if it points at an image, else first image.
  let primary = null;
  if (
    typeof primaryHintIndex === 'number' &&
    saved[primaryHintIndex] &&
    saved[primaryHintIndex].fileKind === FILE_KIND.IMAGE
  ) {
    primary = saved[primaryHintIndex];
  } else {
    primary = saved.find((f) => f.fileKind === FILE_KIND.IMAGE) || null;
  }
  let finalObj = obj;
  if (primary) {
    finalObj = await updateObject(obj.objectId, {
      primaryFileId: primary.fileId,
      coverImageFileId: primary.fileId,
    });
  }
  return { object: finalObj || obj, files: saved };
}

export async function getAllObjects() {
  const list = await dbGetAllObjects();
  return list.map(normalizeObject).filter(Boolean).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function updateObject(objectId, patch) {
  const all = await dbGetAllObjects();
  const existing = all.find((o) => o.objectId === objectId);
  if (!existing) return null;
  const next = normalizeObject({ ...existing, ...patch, objectId, updatedAt: Date.now() });
  await dbPutObject(next);
  return next;
}

export async function archiveObject(objectId) {
  return updateObject(objectId, { status: STATUS.ARCHIVED });
}
export async function unarchiveObject(objectId) {
  return updateObject(objectId, { status: STATUS.DRAFT });
}
export async function linkObjectToProject(objectId, projectId) {
  return updateObject(objectId, {
    linkedDesignProjectId: projectId && typeof projectId === 'string' ? projectId : null,
  });
}
export async function deleteObject(objectId) {
  await dbDeleteFilesForObject(objectId);
  await dbDeleteObject(objectId);
}

// Permanent delete is allowed ONLY for archived items (guarded). Removes the
// metadata AND the stored blob from IndexedDB. Returns true if deleted.
export async function permanentlyDeleteObject(objectId) {
  const all = await dbGetAllObjects();
  const existing = all.find((o) => o.objectId === objectId);
  if (!existing || existing.status !== STATUS.ARCHIVED) {
    console.warn('[assets] permanent delete refused: object not archived.');
    return false;
  }
  await dbDeleteFilesForObject(objectId);
  await dbDeleteObject(objectId);
  return true;
}

export async function permanentlyDeleteFile(fileId) {
  const all = await dbGetAllFiles();
  const existing = all.find((f) => f.fileId === fileId);
  if (!existing || existing.status !== STATUS.ARCHIVED) {
    console.warn('[assets] permanent delete refused: file not archived.');
    return false;
  }
  await dbDeleteFile(fileId);
  return true;
}

// Inventory draft placeholder — stored INSIDE asset metadata only. Does NOT
// touch the real inventory schema or Airtable. (Clean 4B.3)
export async function createInventoryDraft(objectId) {
  const draft = {
    draftId: makeId('invdraft'),
    createdAt: Date.now(),
    note: 'inventory-draft-placeholder',
  };
  return updateObject(objectId, {
    inventoryDraft: draft,
    destinationType: DESTINATION_TYPE.INVENTORY,
  });
}

// Model draft placeholder — stored inside asset metadata only. (Clean 4B.3)
export async function createModelDraft(objectId) {
  const draft = {
    draftId: makeId('modeldraft'),
    createdAt: Date.now(),
    note: 'model-draft-placeholder',
  };
  return updateObject(objectId, {
    modelDraft: draft,
    destinationType: DESTINATION_TYPE.MODEL_LIBRARY,
  });
}

// ---------------------------------------------------------------------------
// Clean 4B.4a: primary image + catalog + tag mutators (thin updateObject wraps)
// ---------------------------------------------------------------------------
// Set the explicit primary/cover image for an object. Pass null to clear.
export async function setPrimaryFile(objectId, fileId) {
  const id = typeof fileId === 'string' && fileId ? fileId : null;
  return updateObject(objectId, { primaryFileId: id, coverImageFileId: id });
}

// Patch catalog fields on an object (only known keys are applied; normalize
// guards values). Useful for the quick-create wizard and the catalog section.
export async function setCatalog(objectId, patch) {
  const p = patch && typeof patch === 'object' ? patch : {};
  const allowed = {};
  const keys = [
    'catalogCode', 'primaryCategory', 'secondaryCategory', 'assetFamily',
    'assetRole', 'usagePurpose', 'sourceType', 'sourceName', 'tags',
  ];
  for (const k of keys) if (k in p) allowed[k] = p[k];
  return updateObject(objectId, allowed);
}

export async function addTag(objectId, tag) {
  const t = typeof tag === 'string' ? tag.trim() : '';
  if (!t) return null;
  const all = await dbGetAllObjects();
  const existing = all.find((o) => o.objectId === objectId);
  if (!existing) return null;
  const current = Array.isArray(existing.tags) ? existing.tags : [];
  if (current.includes(t)) return normalizeObject(existing);
  return updateObject(objectId, { tags: current.concat(t) });
}

export async function removeTag(objectId, tag) {
  const all = await dbGetAllObjects();
  const existing = all.find((o) => o.objectId === objectId);
  if (!existing) return null;
  const current = Array.isArray(existing.tags) ? existing.tags : [];
  return updateObject(objectId, { tags: current.filter((x) => x !== tag) });
}
// Add a file (with its Blob) to an object. `blob` may be null for formats we
// only record by metadata; blobStored reflects whether bytes were persisted.
export async function addFile(objectId, input, blob) {
  const now = Date.now();
  const meta = normalizeFile({
    ...input,
    fileId: makeId('file'),
    objectId,
    blobStored: Boolean(blob),
    createdAt: now,
    updatedAt: now,
  });
  await dbPutFile(meta, blob || null);
  // touch parent updatedAt
  await updateObject(objectId, {});
  return meta;
}

export async function getFilesForObject(objectId) {
  const list = await dbGetFilesForObject(objectId);
  return list.map(normalizeFile).filter(Boolean).sort((a, b) => a.createdAt - b.createdAt);
}

export async function getAllFiles() {
  const list = await dbGetAllFiles();
  return list.map(normalizeFile).filter(Boolean);
}

export async function updateFile(fileId, patch) {
  const all = await dbGetAllFiles();
  const existing = all.find((f) => f.fileId === fileId);
  if (!existing) return null;
  const next = normalizeFile({ ...existing, ...patch, fileId, objectId: existing.objectId, updatedAt: Date.now() });
  await dbPutFileMetaOnly(next);
  return next;
}

export async function approveFile(fileId) {
  return updateFile(fileId, { status: STATUS.APPROVED });
}
export async function archiveFile(fileId) {
  return updateFile(fileId, { status: STATUS.ARCHIVED });
}
export async function unarchiveFile(fileId) {
  return updateFile(fileId, { status: STATUS.DRAFT });
}
export async function setFilePurpose(fileId, purpose) {
  if (!isValidFilePurpose(purpose)) return null;
  return updateFile(fileId, { filePurpose: purpose });
}
export async function setFileCategory(fileId, category) {
  if (!isValidFileCategory(category)) return null;
  return updateFile(fileId, { category });
}
export async function setFileNotes(fileId, notes) {
  return updateFile(fileId, { notes: typeof notes === 'string' ? notes : '' });
}
export async function deleteFile(fileId) {
  await dbDeleteFile(fileId);
}

// Short-lived object URL for previewing a stored file (caller revokes).
export async function getFileUrl(fileId) {
  return dbGetBlobUrl(fileId);
}

// ---------------------------------------------------------------------------
// Pure filter helper for files
// ---------------------------------------------------------------------------
export function filterFiles(list, { fileKind, filePurpose, status, includeArchived } = {}) {
  let out = Array.isArray(list) ? list.slice() : [];
  if (!includeArchived) out = out.filter((f) => f.status !== STATUS.ARCHIVED);
  if (fileKind) out = out.filter((f) => f.fileKind === fileKind);
  if (filePurpose) out = out.filter((f) => f.filePurpose === filePurpose);
  if (status) out = out.filter((f) => f.status === status);
  return out;
}

// Backward-compatible helper for older Clean 4B AssetLibraryPanel/AssetCard builds.
// New code uses object-first filtering in AssetLibraryPanel and filterFiles() for files.
export function filterAssets(list, { category, status, includeArchived } = {}) {
  let out = Array.isArray(list) ? list.slice() : [];
  if (!includeArchived) out = out.filter((a) => a.status !== STATUS.ARCHIVED);
  if (category) out = out.filter((a) => a.category === category || a.objectType === category);
  if (status) out = out.filter((a) => a.status === status);
  return out;
}

// ---------------------------------------------------------------------------
// React hook — hydrates objects + files from IndexedDB on mount.
// ---------------------------------------------------------------------------
export function createUseAssets(React) {
  const { useState, useEffect, useCallback, useRef } = React;
  return function useAssets() {
    const [objects, setObjects] = useState([]);
    const [filesByObject, setFilesByObject] = useState({});
    const [hydrated, setHydrated] = useState(false);
    const [error, setError] = useState(null);
    const mounted = useRef(true);

    const refresh = useCallback(async () => {
      try {
        const objs = await getAllObjects();
        const map = {};
        // eslint-disable-next-line no-restricted-syntax
        for (const o of objs) {
          // eslint-disable-next-line no-await-in-loop
          map[o.objectId] = await getFilesForObject(o.objectId);
        }
        if (mounted.current) {
          setObjects(objs);
          setFilesByObject(map);
          setHydrated(true);
        }
      } catch (e) {
        if (mounted.current) {
          setError(e);
          setHydrated(true);
        }
      }
    }, []);

    useEffect(() => {
      mounted.current = true;
      refresh();
      return () => {
        mounted.current = false;
      };
    }, [refresh]);

    const wrap = (fn) =>
      useCallback(async (...args) => {
        const r = await fn(...args);
        await refresh();
        return r;
      }, [refresh]);

    return {
      objects,
      filesByObject,
      hydrated,
      error,
      refresh,
      createObject: wrap(createObject),
      createObjectWithFiles: wrap(createObjectWithFiles),
      updateObject: wrap(updateObject),
      setPrimaryFile: wrap(setPrimaryFile),
      setCatalog: wrap(setCatalog),
      addTag: wrap(addTag),
      removeTag: wrap(removeTag),
      archiveObject: wrap(archiveObject),
      unarchiveObject: wrap(unarchiveObject),
      linkObjectToProject: wrap(linkObjectToProject),
      deleteObject: wrap(deleteObject),
      permanentlyDeleteObject: wrap(permanentlyDeleteObject),
      permanentlyDeleteFile: wrap(permanentlyDeleteFile),
      createInventoryDraft: wrap(createInventoryDraft),
      createModelDraft: wrap(createModelDraft),
      addFile: wrap(addFile),
      updateFile: wrap(updateFile),
      approveFile: wrap(approveFile),
      archiveFile: wrap(archiveFile),
      unarchiveFile: wrap(unarchiveFile),
      setFilePurpose: wrap(setFilePurpose),
      setFileCategory: wrap(setFileCategory),
      setFileNotes: wrap(setFileNotes),
      deleteFile: wrap(deleteFile),
      getFileUrl,
    };
  };
}
