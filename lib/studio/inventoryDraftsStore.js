// lib/studio/inventoryDraftsStore.js
//
// LESHEM.S OS — Inventory Drafts Store (Clean 4B.4b)
//
// A small, SSR-safe, dependency-free LOCAL store for INVENTORY DRAFTS created
// from Asset Library objects ("טיוטות מלאי מנכסים"). This is the lightweight
// bridge that makes an asset marked as inventory/goods VISIBLE on the Inventory
// page — nothing more.
//
// HARD RULES honored:
//   • localStorage ONLY (versioned key). No Airtable, no network, no writes to
//     any real inventory schema, no full inventory intake, no pricing, no PDF.
//   • A draft is metadata only. The placeholder sub-objects (stoneData,
//     ownership, supplier, availability, pricing, certificate, measurements)
//     are reserved and remain empty until a future milestone.
//   • De-duped by assetObjectId so one asset yields at most one draft.
//   • Same pub/sub + same-tab CustomEvent + cross-tab storage pattern as
//     workTray.js / designProjects.js, and a createUseInventoryDrafts(React)
//     hook factory so components stay in sync.

export const INVENTORY_DRAFTS_KEY = 'leshem_studio_inventory_drafts_v1';
const DRAFTS_EVENT = 'leshem:inventoryDrafts:changed';

// ---------------------------------------------------------------------------
// Environment-safe storage access
// ---------------------------------------------------------------------------
function hasWindow() {
  return typeof window !== 'undefined';
}

function safeGetRaw() {
  if (!hasWindow()) return null;
  try {
    return window.localStorage.getItem(INVENTORY_DRAFTS_KEY);
  } catch (e) {
    console.warn('[inventoryDrafts] localStorage read unavailable; memory only.', e);
    return null;
  }
}

function safeSetRaw(value) {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(INVENTORY_DRAFTS_KEY, value);
  } catch (e) {
    console.warn('[inventoryDrafts] localStorage write unavailable; memory only.', e);
  }
}

let memory = null;

function makeId() {
  const rand = Math.random().toString(36).slice(2, 8);
  return `invd_${Date.now().toString(36)}_${rand}`;
}

// ---------------------------------------------------------------------------
// Normalization — every stored draft is coerced into a stable shape.
// ---------------------------------------------------------------------------
function normalizeDraft(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const assetObjectId =
    typeof raw.assetObjectId === 'string' && raw.assetObjectId ? raw.assetObjectId : null;
  if (!assetObjectId) return null;
  const now = Date.now();
  return {
    inventoryDraftId:
      typeof raw.inventoryDraftId === 'string' && raw.inventoryDraftId
        ? raw.inventoryDraftId
        : makeId(),
    source: 'assetLibrary',
    assetObjectId,
    title: typeof raw.title === 'string' && raw.title.trim() ? raw.title : 'טיוטת מלאי',
    ownerContextType:
      typeof raw.ownerContextType === 'string' ? raw.ownerContextType : 'internal',
    linkedClientName:
      typeof raw.linkedClientName === 'string' ? raw.linkedClientName : null,
    objectType: typeof raw.objectType === 'string' ? raw.objectType : null,
    primaryFileId: typeof raw.primaryFileId === 'string' ? raw.primaryFileId : null,
    status: 'draft',
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : now,

    // Reserved placeholders for future milestones — kept inert.
    stoneData: raw.stoneData && typeof raw.stoneData === 'object' ? raw.stoneData : null,
    ownership: raw.ownership && typeof raw.ownership === 'object' ? raw.ownership : null,
    supplier: raw.supplier && typeof raw.supplier === 'object' ? raw.supplier : null,
    availability:
      raw.availability && typeof raw.availability === 'object' ? raw.availability : null,
    pricing: raw.pricing && typeof raw.pricing === 'object' ? raw.pricing : null,
    certificate:
      raw.certificate && typeof raw.certificate === 'object' ? raw.certificate : null,
    measurements:
      raw.measurements && typeof raw.measurements === 'object' ? raw.measurements : null,
  };
}

function parseList(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeDraft).filter(Boolean);
  } catch (e) {
    console.warn('[inventoryDrafts] could not parse stored drafts; starting empty.', e);
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
      window.dispatchEvent(new CustomEvent(DRAFTS_EVENT));
    } catch (e) {
      console.warn('[inventoryDrafts] could not dispatch change event.', e);
    }
  }
}

// ---------------------------------------------------------------------------
// Pure builder — derive a draft payload from an Asset Object (no persistence).
// ---------------------------------------------------------------------------
export function inventoryDraftFromObject(object) {
  if (!object || typeof object !== 'object' || !object.objectId) return null;
  return {
    assetObjectId: object.objectId,
    title: object.title || 'טיוטת מלאי',
    ownerContextType: object.ownerContextType || 'internal',
    linkedClientName: object.linkedClientName || null,
    objectType: object.objectType || null,
    primaryFileId: object.primaryFileId || object.coverImageFileId || null,
  };
}

// ---------------------------------------------------------------------------
// Public read API
// ---------------------------------------------------------------------------
export function getDrafts() {
  return loadInitial().map((d) => ({ ...d }));
}

export function getDraftByAsset(assetObjectId) {
  const found = loadInitial().find((d) => d.assetObjectId === assetObjectId);
  return found ? { ...found } : null;
}

export function hasDraftForAsset(assetObjectId) {
  return loadInitial().some((d) => d.assetObjectId === assetObjectId);
}

export function getCount() {
  return loadInitial().length;
}

// ---------------------------------------------------------------------------
// Public mutation API (all local; never network)
// ---------------------------------------------------------------------------
// Create a draft FROM an asset object. De-duped by assetObjectId — if a draft
// already exists for that asset it is refreshed (title/owner/primary image) so
// the card stays accurate, rather than creating a duplicate.
export function createDraftFromObject(object) {
  const payload = inventoryDraftFromObject(object);
  if (!payload) return null;
  const list = loadInitial();
  const existing = list.find((d) => d.assetObjectId === payload.assetObjectId);
  if (existing) {
    const refreshed = normalizeDraft({
      ...existing,
      title: payload.title,
      ownerContextType: payload.ownerContextType,
      linkedClientName: payload.linkedClientName,
      objectType: payload.objectType,
      primaryFileId: payload.primaryFileId,
      updatedAt: Date.now(),
    });
    const next = list.map((d) => (d.assetObjectId === payload.assetObjectId ? refreshed : d));
    persist(next);
    return { ...refreshed };
  }
  const draft = normalizeDraft(payload);
  persist([draft, ...list]);
  return { ...draft };
}

export function removeDraft(inventoryDraftId) {
  const list = loadInitial();
  const next = list.filter((d) => d.inventoryDraftId !== inventoryDraftId);
  if (next.length !== list.length) persist(next);
  return getDrafts();
}

// ---------------------------------------------------------------------------
// React hook factory — SSR-safe initial value, then live updates.
// ---------------------------------------------------------------------------
export function createUseInventoryDrafts(React) {
  const { useState, useEffect, useCallback } = React;
  return function useInventoryDrafts() {
    const [drafts, setDrafts] = useState([]);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
      setDrafts(getDrafts());
      setHydrated(true);

      const sync = () => setDrafts(getDrafts());
      window.addEventListener(DRAFTS_EVENT, sync);
      const onStorage = (e) => {
        if (!e || e.key === INVENTORY_DRAFTS_KEY) sync();
      };
      window.addEventListener('storage', onStorage);

      return () => {
        window.removeEventListener(DRAFTS_EVENT, sync);
        window.removeEventListener('storage', onStorage);
      };
    }, []);

    return {
      drafts,
      count: drafts.length,
      hydrated,
      createFromObject: useCallback((object) => {
        const d = createDraftFromObject(object);
        setDrafts(getDrafts());
        return d;
      }, []),
      remove: useCallback((id) => {
        removeDraft(id);
        setDrafts(getDrafts());
      }, []),
      hasForAsset: useCallback((assetObjectId) => hasDraftForAsset(assetObjectId), []),
      getByAsset: useCallback((assetObjectId) => getDraftByAsset(assetObjectId), []),
    };
  };
}
