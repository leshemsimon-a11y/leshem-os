// lib/studio/workTray.js
//
// LESHEM.S OS — Work Tray Store (Clean 3)
//
// A small, dependency-free, SSR-safe store for the studio's WORK TRAY
// (מגש עבודה). The Work Tray is a TEMPORARY, draft selection of items the
// jeweller is currently working with — it is NOT saved inventory and never
// touches Airtable. Nothing here writes to any server.
//
// Persistence: localStorage under a clearly-namespaced, versioned key, so it
// survives a refresh but is obviously a local draft. If localStorage is
// unavailable (SSR, privacy mode), the store degrades to in-memory only and
// never throws.
//
// HARD RULES honored:
//   • The Airtable record id is used ONLY as a stable internal de-dupe key
//     (`id`). It is NEVER meant for display — UI components must render the
//     human fields (stone type, shape, SKU…) instead, exactly as elsewhere.
//   • No cart / commerce language anywhere. This is a Work Tray.
//   • No writes to Airtable, no network, no new packages.
//
// Subscription model: a tiny pub/sub plus a same-tab CustomEvent, so multiple
// mounted components (drawer button, nav, tray page) stay in sync. A storage
// event listener keeps other tabs in sync too.

export const WORK_TRAY_KEY = 'leshem_studio_work_tray_v1';
const TRAY_EVENT = 'leshem:workTray:changed';

const MAX_ITEMS = 60; // generous soft cap; a working tray is small by nature

// ---------------------------------------------------------------------------
// Environment-safe storage access
// ---------------------------------------------------------------------------
function hasWindow() {
  return typeof window !== 'undefined';
}

function safeGetRaw() {
  if (!hasWindow()) return null;
  try {
    return window.localStorage.getItem(WORK_TRAY_KEY);
  } catch (e) {
    console.warn('[workTray] localStorage read unavailable; using memory only.', e);
    return null;
  }
}

function safeSetRaw(value) {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(WORK_TRAY_KEY, value);
  } catch (e) {
    console.warn('[workTray] localStorage write unavailable; memory only.', e);
  }
}

// In-memory mirror so reads are synchronous and SSR-safe.
let memory = null;

// ---------------------------------------------------------------------------
// Serialization (defensive)
// ---------------------------------------------------------------------------
function parseList(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Keep only well-formed entries with a usable id.
    return parsed.filter(
      (it) => it && typeof it === 'object' && typeof it.id === 'string' && it.id
    );
  } catch (e) {
    console.warn('[workTray] could not parse stored tray; starting empty.', e);
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
  // Notify same-tab listeners.
  if (hasWindow()) {
    try {
      window.dispatchEvent(new CustomEvent(TRAY_EVENT));
    } catch (e) {
      // CustomEvent unavailable is non-fatal.
      console.warn('[workTray] could not dispatch change event.', e);
    }
  }
}

// ---------------------------------------------------------------------------
// View-model snapshot
// ---------------------------------------------------------------------------
// We store a SMALL display snapshot of the asset so the tray + design pages
// render even if the inventory list is not re-fetched. We do not store secrets
// and never surface the raw id in the UI. `role` defaults to unassigned.

export function assetToTrayItem(asset) {
  if (!asset || typeof asset !== 'object') return null;
  const id = typeof asset.key === 'string' ? asset.key : null;
  if (!id) {
    console.warn('[workTray] asset has no stable key; cannot add to tray.');
    return null;
  }
  return {
    id, // internal de-dupe key only — never rendered
    role: 'unassigned',
    addedAt: Date.now(),
    snapshot: {
      sku: asset.sku || null,
      name: asset.name || null,
      stoneTypeHe: asset.stoneTypeHe || null,
      productTypeHe: asset.productTypeHe || null,
      shapeHe: asset.shapeHe || null,
      stoneCategoryHe: asset.stoneCategoryHe || null,
      originHe: asset.originHe || null,
      statusHe: asset.statusHe || null,
      caratWeight: asset.caratWeight != null ? asset.caratWeight : null,
      stoneCount: asset.stoneCount != null ? asset.stoneCount : null,
      color: asset.color || null,
      clarity: asset.clarity || null,
      primaryImage: asset.primaryImage || null,
      // canonical axes kept for the design page grouping/suggestions only
      axes: asset.axes
        ? {
            stoneCategory: asset.axes.stoneCategory || null,
            origin: asset.axes.origin || null,
            stoneType: asset.axes.stoneType || null,
            shape: asset.axes.shape || null,
          }
        : null,
    },
  };
}

// ---------------------------------------------------------------------------
// Public read API
// ---------------------------------------------------------------------------
export function getTray() {
  return [...loadInitial()];
}

export function isInTray(assetOrId) {
  const id =
    typeof assetOrId === 'string' ? assetOrId : assetOrId && assetOrId.key;
  if (!id) return false;
  return loadInitial().some((it) => it.id === id);
}

export function getCount() {
  return loadInitial().length;
}

// ---------------------------------------------------------------------------
// Public mutation API (all local; never network)
// ---------------------------------------------------------------------------
export function addToTray(asset) {
  const item = assetToTrayItem(asset);
  if (!item) return getTray();
  const list = loadInitial();
  if (list.some((it) => it.id === item.id)) {
    return [...list]; // already present — Work Tray holds distinct items
  }
  if (list.length >= MAX_ITEMS) {
    console.warn('[workTray] tray is at capacity; not adding more.');
    return [...list];
  }
  const next = [...list, item];
  persist(next);
  return next;
}

export function removeFromTray(assetOrId) {
  const id =
    typeof assetOrId === 'string' ? assetOrId : assetOrId && assetOrId.key;
  if (!id) return getTray();
  const list = loadInitial();
  const next = list.filter((it) => it.id !== id);
  if (next.length !== list.length) persist(next);
  return next;
}

export function toggleTray(asset) {
  if (isInTray(asset)) return removeFromTray(asset);
  return addToTray(asset);
}

export function setRole(id, role) {
  if (!id || typeof role !== 'string') return getTray();
  const list = loadInitial();
  let changed = false;
  const next = list.map((it) => {
    if (it.id === id) {
      changed = true;
      return { ...it, role };
    }
    return it;
  });
  if (changed) persist(next);
  return next;
}

export function clearTray() {
  persist([]);
  return [];
}

// ---------------------------------------------------------------------------
// React hook — synchronous SSR-safe initial value, then live updates.
// ---------------------------------------------------------------------------
// Implemented here (no extra file) but kept framework-light: it only needs
// React's useState/useEffect, which the consuming components already import.
// We expose a factory that takes React so this module has no React import of
// its own and stays usable in non-React contexts too.

export function createUseWorkTray(React) {
  const { useState, useEffect, useCallback } = React;
  return function useWorkTray() {
    // Start empty on the server / first paint to avoid hydration mismatch,
    // then sync from storage after mount.
    const [items, setItems] = useState([]);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
      setItems(getTray());
      setHydrated(true);

      const sync = () => setItems(getTray());

      window.addEventListener(TRAY_EVENT, sync);
      // Cross-tab updates.
      const onStorage = (e) => {
        if (!e || e.key === WORK_TRAY_KEY) sync();
      };
      window.addEventListener('storage', onStorage);

      return () => {
        window.removeEventListener(TRAY_EVENT, sync);
        window.removeEventListener('storage', onStorage);
      };
    }, []);

    const api = {
      items,
      count: items.length,
      hydrated,
      add: useCallback((asset) => setItems(addToTray(asset)), []),
      remove: useCallback((idOrAsset) => setItems(removeFromTray(idOrAsset)), []),
      toggle: useCallback((asset) => setItems(toggleTray(asset)), []),
      setRole: useCallback((id, role) => setItems(setRole(id, role)), []),
      clear: useCallback(() => setItems(clearTray()), []),
      has: useCallback((idOrAsset) => isInTray(idOrAsset), []),
    };
    return api;
  };
}
