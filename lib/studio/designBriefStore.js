// lib/studio/designBriefStore.js
//
// LESHEM.S OS — Jewelry Design Brief Store (Clean 3C)
//
// A small, dependency-free, SSR-safe local store for the JEWELRY DESIGN BRIEF
// (תקציר עיצוב). It is the persistence SIBLING to lib/studio/workTray.js, and
// deliberately mirrors its shape and conventions:
//   • localStorage under a clearly-namespaced, versioned key
//   • degrades to in-memory only if storage is unavailable (never throws)
//   • a tiny pub/sub + same-tab CustomEvent + cross-tab storage listener
//   • a createUseDesignBrief(React) hook factory (no React import here)
//
// The brief LOGIC (schema, validation, status) lives in designDraft.js. This
// file only stores/loads it. This is NOT a competing logic module — it is the
// brief's equivalent of the workTray store.
//
// HARD RULES honored: local only, NO Airtable, NO network, NO new packages,
// no commerce language. The brief is a temporary local draft and says so.

import { emptyBrief, normalizeBrief } from './designDraft';

export const DESIGN_BRIEF_KEY = 'leshem_studio_design_brief_v1';
const BRIEF_EVENT = 'leshem:designBrief:changed';

function hasWindow() {
  return typeof window !== 'undefined';
}

function safeGetRaw() {
  if (!hasWindow()) return null;
  try {
    return window.localStorage.getItem(DESIGN_BRIEF_KEY);
  } catch (e) {
    console.warn('[designBrief] localStorage read unavailable; memory only.', e);
    return null;
  }
}

function safeSetRaw(value) {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(DESIGN_BRIEF_KEY, value);
  } catch (e) {
    console.warn('[designBrief] localStorage write unavailable; memory only.', e);
  }
}

// In-memory mirror so reads are synchronous and SSR-safe.
let memory = null;

function loadInitial() {
  if (memory) return memory;
  const raw = safeGetRaw();
  if (!raw) {
    memory = emptyBrief();
    return memory;
  }
  try {
    memory = normalizeBrief(JSON.parse(raw));
  } catch (e) {
    console.warn('[designBrief] could not parse stored brief; starting empty.', e);
    memory = emptyBrief();
  }
  return memory;
}

function persist(brief) {
  memory = normalizeBrief(brief);
  safeSetRaw(JSON.stringify(memory));
  if (hasWindow()) {
    try {
      window.dispatchEvent(new CustomEvent(BRIEF_EVENT));
    } catch (e) {
      console.warn('[designBrief] could not dispatch change event.', e);
    }
  }
}

// ---------------------------------------------------------------------------
// Public read / mutation API (all local; never network)
// ---------------------------------------------------------------------------
export function getBrief() {
  return { ...loadInitial() };
}

// Patch one or more fields. Does NOT stamp updatedAt — that is reserved for an
// explicit local "save" so status can distinguish draft vs saved.
export function updateBrief(patch) {
  if (!patch || typeof patch !== 'object') return getBrief();
  const next = normalizeBrief({ ...loadInitial(), ...patch });
  persist(next);
  return getBrief();
}

// Explicitly commit the current brief as a local saved draft (stamps time).
export function saveBriefLocal() {
  const next = normalizeBrief({ ...loadInitial(), updatedAt: Date.now() });
  persist(next);
  return getBrief();
}

// Reset to an empty brief (does not touch the Work Tray).
export function clearBrief() {
  persist(emptyBrief());
  return getBrief();
}

// ---------------------------------------------------------------------------
// React hook factory — SSR-safe initial value, then live updates.
// ---------------------------------------------------------------------------
export function createUseDesignBrief(React) {
  const { useState, useEffect, useCallback } = React;
  return function useDesignBrief() {
    const [brief, setBrief] = useState(emptyBrief());
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
      setBrief(getBrief());
      setHydrated(true);

      const sync = () => setBrief(getBrief());
      window.addEventListener(BRIEF_EVENT, sync);
      const onStorage = (e) => {
        if (!e || e.key === DESIGN_BRIEF_KEY) sync();
      };
      window.addEventListener('storage', onStorage);

      return () => {
        window.removeEventListener(BRIEF_EVENT, sync);
        window.removeEventListener('storage', onStorage);
      };
    }, []);

    return {
      brief,
      hydrated,
      update: useCallback((patch) => setBrief(updateBrief(patch)), []),
      save: useCallback(() => setBrief(saveBriefLocal()), []),
      clear: useCallback(() => setBrief(clearBrief()), []),
    };
  };
}
