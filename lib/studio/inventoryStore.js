// lib/studio/inventoryStore.js
//
// LESHEM.S OS — Local Inventory Items Store (Clean 4C)
//
// A SSR-safe, dependency-free LOCAL store for inventory ITEMS that the studio
// owns directly: manually-added goods, virtual supplier stones, and
// client-owned goods. This is the working source for the daily flow
//   Inventory → select → Work Tray → Design Studio → Design Project.
//
// This store is SEPARATE from:
//   • the read-only Airtable inventory (physical stock, via lib/studio/assets)
//   • inventoryDraftsStore.js (drafts created FROM Asset Library objects)
// Each surface stays its own concern; this store never touches Airtable, never
// writes any real inventory schema, and adds no pricing/OCR/PDF logic. Fields
// like price/certificate are inert placeholders for manual entry only.
//
// Same conventions as workTray.js / inventoryDraftsStore.js: versioned
// localStorage key, in-memory fallback, pub/sub + same-tab CustomEvent +
// cross-tab storage listener, and a createUseInventory(React) hook factory.

export const INVENTORY_ITEMS_KEY = 'leshem_studio_inventory_items_v1';
const INVENTORY_EVENT = 'leshem:inventoryItems:changed';

// ---------------------------------------------------------------------------
// Canonical enums (English values; Hebrew labels live in labels.js)
// ---------------------------------------------------------------------------
export const INV_SOURCE = Object.freeze({
  MANUAL: 'manual',
  ASSET_LIBRARY: 'assetLibrary',
  SUPPLIER_VIRTUAL: 'supplierVirtual',
  CLIENT_OWNED: 'clientOwned',
});
export const INV_SOURCE_VALUES = Object.freeze(Object.values(INV_SOURCE));

export const INV_ITEM_TYPE = Object.freeze({
  STONE: 'stone',
  MELEE: 'melee',
  JEWELRY_PART: 'jewelryPart',
  CHAIN: 'chain',
  COMPONENT: 'component',
  OTHER: 'other',
});
export const INV_ITEM_TYPE_VALUES = Object.freeze(Object.values(INV_ITEM_TYPE));

export const INV_OWNERSHIP = Object.freeze({
  OWNED_PHYSICAL: 'ownedPhysical',
  SUPPLIER_VIRTUAL: 'supplierVirtual',
  CLIENT_OWNED: 'clientOwned',
  INTERNAL_DRAFT: 'internalDraft',
});
export const INV_OWNERSHIP_VALUES = Object.freeze(Object.values(INV_OWNERSHIP));

export const INV_AVAILABILITY = Object.freeze({
  AVAILABLE: 'available',
  NEEDS_CONFIRMATION: 'needsConfirmation',
  RESERVED: 'reserved',
  UNAVAILABLE: 'unavailable',
  DRAFT: 'draft',
});
export const INV_AVAILABILITY_VALUES = Object.freeze(Object.values(INV_AVAILABILITY));

export const INV_STONE_TYPE = Object.freeze({
  NATURAL_DIAMOND: 'naturalDiamond',
  LAB_DIAMOND: 'labDiamond',
  GEMSTONE: 'gemstone',
  NATURAL_MELEE: 'naturalMelee',
  LAB_MELEE: 'labMelee',
  OTHER: 'other',
});
export const INV_STONE_TYPE_VALUES = Object.freeze(Object.values(INV_STONE_TYPE));

export function isValidSource(v) { return INV_SOURCE_VALUES.includes(v); }
export function isValidItemType(v) { return INV_ITEM_TYPE_VALUES.includes(v); }
export function isValidOwnership(v) { return INV_OWNERSHIP_VALUES.includes(v); }
export function isValidAvailability(v) { return INV_AVAILABILITY_VALUES.includes(v); }
export function isValidStoneType(v) { return INV_STONE_TYPE_VALUES.includes(v); }

// ---------------------------------------------------------------------------
// Environment-safe storage access
// ---------------------------------------------------------------------------
function hasWindow() {
  return typeof window !== 'undefined';
}
function safeGetRaw() {
  if (!hasWindow()) return null;
  try {
    return window.localStorage.getItem(INVENTORY_ITEMS_KEY);
  } catch (e) {
    console.warn('[inventory] localStorage read unavailable; memory only.', e);
    return null;
  }
}
function safeSetRaw(value) {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(INVENTORY_ITEMS_KEY, value);
  } catch (e) {
    console.warn('[inventory] localStorage write unavailable; memory only.', e);
  }
}

let memory = null;

function makeId() {
  const rand = Math.random().toString(36).slice(2, 8);
  return `inv_${Date.now().toString(36)}_${rand}`;
}

// Derive the default ownership from a source when not supplied explicitly.
function ownershipForSource(source) {
  switch (source) {
    case INV_SOURCE.SUPPLIER_VIRTUAL:
      return INV_OWNERSHIP.SUPPLIER_VIRTUAL;
    case INV_SOURCE.CLIENT_OWNED:
      return INV_OWNERSHIP.CLIENT_OWNED;
    case INV_SOURCE.ASSET_LIBRARY:
      return INV_OWNERSHIP.INTERNAL_DRAFT;
    default:
      return INV_OWNERSHIP.OWNED_PHYSICAL;
  }
}

// ---------------------------------------------------------------------------
// Normalization — every stored item is coerced into a stable shape.
// ---------------------------------------------------------------------------
function normalizeStoneData(raw) {
  const s = raw && typeof raw === 'object' ? raw : {};
  return {
    stoneType: isValidStoneType(s.stoneType) ? s.stoneType : null,
    shape: typeof s.shape === 'string' ? s.shape : null,
    weightCt: typeof s.weightCt === 'number' ? s.weightCt : (typeof s.weightCt === 'string' && s.weightCt.trim() ? s.weightCt.trim() : null),
    color: typeof s.color === 'string' ? s.color : null,
    clarity: typeof s.clarity === 'string' ? s.clarity : null,
    measurements: typeof s.measurements === 'string' ? s.measurements : null,
    certificateNumber: typeof s.certificateNumber === 'string' ? s.certificateNumber : null,
    lab: typeof s.lab === 'string' ? s.lab : null,
    cut: typeof s.cut === 'string' ? s.cut : null,
    fluorescence: typeof s.fluorescence === 'string' ? s.fluorescence : null,
    // price placeholders only — NO pricing logic anywhere.
    pricePlaceholder: typeof s.pricePlaceholder === 'string' ? s.pricePlaceholder : null,
  };
}

function normalizeItem(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const now = Date.now();
  const source = isValidSource(raw.source) ? raw.source : INV_SOURCE.MANUAL;
  return {
    inventoryItemId:
      typeof raw.inventoryItemId === 'string' && raw.inventoryItemId
        ? raw.inventoryItemId
        : makeId(),
    source,
    title: typeof raw.title === 'string' && raw.title.trim() ? raw.title : 'פריט מלאי',
    itemType: isValidItemType(raw.itemType) ? raw.itemType : INV_ITEM_TYPE.STONE,
    ownershipType: isValidOwnership(raw.ownershipType)
      ? raw.ownershipType
      : ownershipForSource(source),
    ownerContextType:
      typeof raw.ownerContextType === 'string' ? raw.ownerContextType : 'internal',
    linkedClientName:
      typeof raw.linkedClientName === 'string' && raw.linkedClientName.trim()
        ? raw.linkedClientName.trim()
        : null,
    supplierName:
      typeof raw.supplierName === 'string' && raw.supplierName.trim()
        ? raw.supplierName.trim()
        : null,
    availabilityStatus: isValidAvailability(raw.availabilityStatus)
      ? raw.availabilityStatus
      : INV_AVAILABILITY.AVAILABLE,
    // Image support — link to an Asset Object's primary image if present.
    primaryAssetObjectId:
      typeof raw.primaryAssetObjectId === 'string' ? raw.primaryAssetObjectId : null,
    primaryFileId: typeof raw.primaryFileId === 'string' ? raw.primaryFileId : null,
    notes: typeof raw.notes === 'string' ? raw.notes : '',
    stoneData: normalizeStoneData(raw.stoneData),
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : now,
  };
}

function parseList(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeItem).filter(Boolean);
  } catch (e) {
    console.warn('[inventory] could not parse stored items; starting empty.', e);
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
      window.dispatchEvent(new CustomEvent(INVENTORY_EVENT));
    } catch (e) {
      console.warn('[inventory] could not dispatch change event.', e);
    }
  }
}

// ---------------------------------------------------------------------------
// Public read API
// ---------------------------------------------------------------------------
export function getItems() {
  return loadInitial().map((it) => ({ ...it }));
}
export function getItem(id) {
  const f = loadInitial().find((it) => it.inventoryItemId === id);
  return f ? { ...f } : null;
}

// Group helpers for the four inventory sections.
export function getByOwnership(ownershipType) {
  return loadInitial()
    .filter((it) => it.ownershipType === ownershipType)
    .map((it) => ({ ...it }));
}

// ---------------------------------------------------------------------------
// Public mutation API (all local; never network)
// ---------------------------------------------------------------------------
export function addItem(input) {
  const now = Date.now();
  const item = normalizeItem({ ...input, inventoryItemId: makeId(), createdAt: now, updatedAt: now });
  if (!item) return null;
  const list = loadInitial();
  persist([item, ...list]);
  return item;
}

export function updateItem(id, patch) {
  if (!id) return null;
  const list = loadInitial();
  let updated = null;
  const next = list.map((it) => {
    if (it.inventoryItemId !== id) return it;
    updated = normalizeItem({
      ...it,
      ...patch,
      // merge stoneData rather than replace wholesale
      stoneData: { ...it.stoneData, ...(patch && patch.stoneData ? patch.stoneData : {}) },
      inventoryItemId: it.inventoryItemId,
      source: it.source,
      createdAt: it.createdAt,
      updatedAt: Date.now(),
    });
    return updated;
  });
  if (updated) persist(next);
  return updated ? { ...updated } : null;
}

export function setAvailability(id, availabilityStatus) {
  if (!isValidAvailability(availabilityStatus)) return null;
  return updateItem(id, { availabilityStatus });
}

export function removeItem(id) {
  const list = loadInitial();
  const next = list.filter((it) => it.inventoryItemId !== id);
  if (next.length !== list.length) persist(next);
  return getItems();
}

// ---------------------------------------------------------------------------
// React hook factory — SSR-safe initial value, then live updates.
// ---------------------------------------------------------------------------
export function createUseInventory(React) {
  const { useState, useEffect, useCallback } = React;
  return function useInventory() {
    const [items, setItems] = useState([]);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
      setItems(getItems());
      setHydrated(true);
      const sync = () => setItems(getItems());
      window.addEventListener(INVENTORY_EVENT, sync);
      const onStorage = (e) => {
        if (!e || e.key === INVENTORY_ITEMS_KEY) sync();
      };
      window.addEventListener('storage', onStorage);
      return () => {
        window.removeEventListener(INVENTORY_EVENT, sync);
        window.removeEventListener('storage', onStorage);
      };
    }, []);

    return {
      items,
      hydrated,
      add: useCallback((input) => {
        const it = addItem(input);
        setItems(getItems());
        return it;
      }, []),
      update: useCallback((id, patch) => {
        updateItem(id, patch);
        setItems(getItems());
      }, []),
      setAvailability: useCallback((id, s) => {
        setAvailability(id, s);
        setItems(getItems());
      }, []),
      remove: useCallback((id) => {
        removeItem(id);
        setItems(getItems());
      }, []),
    };
  };
}
