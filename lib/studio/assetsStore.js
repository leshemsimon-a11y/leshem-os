// lib/studio/assetsStore.js
//
// LESHEM.S OS — Asset Library Store (Clean 4B)
//
// A local, persistent library of design ASSETS (ספריית נכסים): stone images,
// gemstone photos, sketches, 3D model files, certificates/PDFs, client
// references, inspiration, and render images. Every asset is treated as
// reusable design knowledge — not a random file — so each carries a category,
// a status, optional notes, and an optional link to a Design Project (the
// first of several future links: stone / model / collection / render brief).
//
// Persistence sibling to workTray / designBriefStore / designProjects. Same
// conventions: versioned localStorage key, SSR-safe, in-memory fallback, tiny
// pub/sub + same-tab CustomEvent + cross-tab storage listener, and a
// createUseAssets(React) factory.
//
// PROTOTYPE FILE PERSISTENCE (honest limitation):
//   localStorage is text-only and small. We persist asset METADATA always, and
//   a lightweight data-URL PREVIEW only for images under PREVIEW_MAX_BYTES.
//   Large/binary files (3D, PDF) are recorded by name/type/size but their bytes
//   are NOT stored — the UI says so. No cloud, no backend, no GitHub upload,
//   no Airtable, no network, no new packages.

export const ASSETS_KEY = 'leshem_studio_assets_v1';
const ASSETS_EVENT = 'leshem:assets:changed';

// Only small images get an inline preview persisted (keeps localStorage sane).
export const PREVIEW_MAX_BYTES = 600 * 1024; // ~600KB

// Canonical asset categories (English values; Hebrew labels in labels.js).
export const ASSET_CATEGORY = Object.freeze({
  STONE_IMAGE: 'stoneImage',
  MODEL_3D: 'model3d',
  SKETCH: 'sketch',
  CERTIFICATE: 'certificate',
  CLIENT_REFERENCE: 'clientReference',
  INSPIRATION: 'inspiration',
  RENDER_IMAGE: 'renderImage',
  OTHER: 'other',
});
export const ASSET_CATEGORY_VALUES = Object.freeze(
  Object.values(ASSET_CATEGORY)
);

// Canonical asset statuses (English values; Hebrew labels in labels.js).
export const ASSET_STATUS = Object.freeze({
  DRAFT: 'draft',
  REFERENCE: 'reference',
  APPROVED: 'approved',
  ARCHIVED: 'archived',
});
export const ASSET_STATUS_VALUES = Object.freeze(Object.values(ASSET_STATUS));

export function isValidCategory(c) {
  return ASSET_CATEGORY_VALUES.includes(c);
}
export function isValidStatus(s) {
  return ASSET_STATUS_VALUES.includes(s);
}

// ---------------------------------------------------------------------------
// Environment-safe storage access
// ---------------------------------------------------------------------------
function hasWindow() {
  return typeof window !== 'undefined';
}
function safeGetRaw() {
  if (!hasWindow()) return null;
  try {
    return window.localStorage.getItem(ASSETS_KEY);
  } catch (e) {
    console.warn('[assets] localStorage read unavailable; memory only.', e);
    return null;
  }
}
function safeSetRaw(value) {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(ASSETS_KEY, value);
  } catch (e) {
    // Most likely a quota error from too many/large previews — non-fatal.
    console.warn('[assets] localStorage write unavailable (quota?); memory only.', e);
  }
}

let memory = null;

function makeId() {
  const rand = Math.random().toString(36).slice(2, 8);
  return `asset_${Date.now().toString(36)}_${rand}`;
}

function normalizeAsset(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const id = typeof raw.id === 'string' && raw.id ? raw.id : makeId();
  const category = isValidCategory(raw.category) ? raw.category : ASSET_CATEGORY.OTHER;
  const status = isValidStatus(raw.status) ? raw.status : ASSET_STATUS.DRAFT;
  return {
    id,
    fileName: typeof raw.fileName === 'string' && raw.fileName ? raw.fileName : 'קובץ ללא שם',
    fileType: typeof raw.fileType === 'string' ? raw.fileType : '',
    fileSize: typeof raw.fileSize === 'number' ? raw.fileSize : null,
    category,
    status,
    notes: typeof raw.notes === 'string' ? raw.notes : '',
    linkedProjectId:
      typeof raw.linkedProjectId === 'string' ? raw.linkedProjectId : null,
    // Inline preview data URL — present ONLY for small images. null otherwise.
    previewDataUrl:
      typeof raw.previewDataUrl === 'string' ? raw.previewDataUrl : null,
    // Honest flag: were the file's bytes persisted locally?
    bytesPersisted: Boolean(raw.bytesPersisted),
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : Date.now(),
  };
}

function parseList(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeAsset).filter(Boolean);
  } catch (e) {
    console.warn('[assets] could not parse stored assets; starting empty.', e);
    return [];
  }
}

function loadInitial() {
  if (memory) return memory;
  memory = parseList(safeGetRaw());
  return memory;
}

function persist(list) {
  memory = list;
  safeSetRaw(JSON.stringify(list));
  if (hasWindow()) {
    try {
      window.dispatchEvent(new CustomEvent(ASSETS_EVENT));
    } catch (e) {
      console.warn('[assets] could not dispatch change event.', e);
    }
  }
}

// ---------------------------------------------------------------------------
// Public read API
// ---------------------------------------------------------------------------
export function getAllAssets() {
  return loadInitial().map((a) => ({ ...a }));
}
export function getActiveAssets() {
  return loadInitial()
    .filter((a) => a.status !== ASSET_STATUS.ARCHIVED)
    .map((a) => ({ ...a }));
}
export function getArchivedAssets() {
  return loadInitial()
    .filter((a) => a.status === ASSET_STATUS.ARCHIVED)
    .map((a) => ({ ...a }));
}
export function getAsset(id) {
  const f = loadInitial().find((a) => a.id === id);
  return f ? { ...f } : null;
}
// All (non-archived) assets linked to a given Design Project.
export function getAssetsForProject(projectId) {
  if (!projectId) return [];
  return loadInitial()
    .filter((a) => a.linkedProjectId === projectId && a.status !== ASSET_STATUS.ARCHIVED)
    .map((a) => ({ ...a }));
}

// Filter helper (pure) — category and/or status, excludes archived unless asked.
export function filterAssets(list, { category, status, includeArchived } = {}) {
  let out = Array.isArray(list) ? list.slice() : [];
  if (!includeArchived) out = out.filter((a) => a.status !== ASSET_STATUS.ARCHIVED);
  if (category) out = out.filter((a) => a.category === category);
  if (status) out = out.filter((a) => a.status === status);
  return out;
}

// ---------------------------------------------------------------------------
// Public mutation API (all local; never network)
// ---------------------------------------------------------------------------
export function addAsset(input) {
  const now = Date.now();
  const asset = normalizeAsset({
    ...input,
    id: makeId(),
    createdAt: now,
    updatedAt: now,
  });
  if (!asset) return null;
  const list = loadInitial();
  persist([asset, ...list]);
  return asset;
}

export function updateAsset(id, patch) {
  if (!id) return null;
  const list = loadInitial();
  let updated = null;
  const next = list.map((a) => {
    if (a.id !== id) return a;
    updated = normalizeAsset({ ...a, ...patch, id: a.id, updatedAt: Date.now() });
    return updated;
  });
  if (updated) persist(next);
  return updated ? { ...updated } : null;
}

export function setAssetCategory(id, category) {
  if (!isValidCategory(category)) return null;
  return updateAsset(id, { category });
}
export function setAssetStatus(id, status) {
  if (!isValidStatus(status)) return null;
  return updateAsset(id, { status });
}
export function setAssetNotes(id, notes) {
  return updateAsset(id, { notes: typeof notes === 'string' ? notes : '' });
}
export function linkAssetToProject(id, projectId) {
  return updateAsset(id, {
    linkedProjectId: projectId && typeof projectId === 'string' ? projectId : null,
  });
}
export function archiveAsset(id) {
  return setAssetStatus(id, ASSET_STATUS.ARCHIVED);
}
export function unarchiveAsset(id) {
  return setAssetStatus(id, ASSET_STATUS.DRAFT);
}
export function deleteAsset(id) {
  const list = loadInitial();
  const next = list.filter((a) => a.id !== id);
  if (next.length !== list.length) persist(next);
  return getAllAssets();
}

// ---------------------------------------------------------------------------
// File → asset helper (browser only). Reads a small image into a data-URL
// preview; for large/binary files keeps metadata only (bytesPersisted=false).
// Returns a Promise<assetInput> (NOT yet stored — caller decides category etc).
// ---------------------------------------------------------------------------
export function fileToAssetInput(file) {
  return new Promise((resolve) => {
    const base = {
      fileName: file && file.name ? file.name : 'קובץ ללא שם',
      fileType: file && file.type ? file.type : '',
      fileSize: file && typeof file.size === 'number' ? file.size : null,
      previewDataUrl: null,
      bytesPersisted: false,
    };
    const isImage = file && typeof file.type === 'string' && file.type.startsWith('image/');
    if (!isImage || !file || file.size > PREVIEW_MAX_BYTES || !hasWindow() || typeof FileReader === 'undefined') {
      resolve(base);
      return;
    }
    try {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          ...base,
          previewDataUrl: typeof reader.result === 'string' ? reader.result : null,
          bytesPersisted: typeof reader.result === 'string',
        });
      };
      reader.onerror = () => resolve(base);
      reader.readAsDataURL(file);
    } catch (e) {
      resolve(base);
    }
  });
}

// ---------------------------------------------------------------------------
// React hook factory
// ---------------------------------------------------------------------------
export function createUseAssets(React) {
  const { useState, useEffect, useCallback } = React;
  return function useAssets() {
    const [assets, setAssets] = useState([]);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
      setAssets(getAllAssets());
      setHydrated(true);
      const sync = () => setAssets(getAllAssets());
      window.addEventListener(ASSETS_EVENT, sync);
      const onStorage = (e) => {
        if (!e || e.key === ASSETS_KEY) sync();
      };
      window.addEventListener('storage', onStorage);
      return () => {
        window.removeEventListener(ASSETS_EVENT, sync);
        window.removeEventListener('storage', onStorage);
      };
    }, []);

    const active = assets.filter((a) => a.status !== ASSET_STATUS.ARCHIVED);
    const archived = assets.filter((a) => a.status === ASSET_STATUS.ARCHIVED);

    return {
      assets,
      active,
      archived,
      hydrated,
      add: useCallback((input) => {
        const a = addAsset(input);
        setAssets(getAllAssets());
        return a;
      }, []),
      update: useCallback((id, patch) => {
        updateAsset(id, patch);
        setAssets(getAllAssets());
      }, []),
      setCategory: useCallback((id, c) => {
        setAssetCategory(id, c);
        setAssets(getAllAssets());
      }, []),
      setStatus: useCallback((id, s) => {
        setAssetStatus(id, s);
        setAssets(getAllAssets());
      }, []),
      setNotes: useCallback((id, n) => {
        setAssetNotes(id, n);
        setAssets(getAllAssets());
      }, []),
      link: useCallback((id, pid) => {
        linkAssetToProject(id, pid);
        setAssets(getAllAssets());
      }, []),
      archive: useCallback((id) => {
        archiveAsset(id);
        setAssets(getAllAssets());
      }, []),
      unarchive: useCallback((id) => {
        unarchiveAsset(id);
        setAssets(getAllAssets());
      }, []),
      remove: useCallback((id) => {
        deleteAsset(id);
        setAssets(getAllAssets());
      }, []),
    };
  };
}
