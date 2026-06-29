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

// Patch one or more fields. Editing any field returns the brief to an
// unsaved DRAFT: we clear `updatedAt` so a previously-"saved" local draft
// becomes "draft" again the moment the user changes something. Only an
// explicit saveBriefLocal() re-stamps it. (Clean 3D stability fix.)
export function updateBrief(patch) {
  if (!patch || typeof patch !== 'object') return getBrief();
  const next = normalizeBrief({ ...loadInitial(), ...patch, updatedAt: null });
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

// Replace the entire brief with a known-good object (used when OPENING a saved
// Design Project). Normalized defensively. Additive API; existing update/save/
// clear behavior is unchanged.
export function setBrief(brief) {
  persist(normalizeBrief(brief));
  return getBrief();
}

// ---------------------------------------------------------------------------
// Clean 5A — Design Core concept mutations (additive)
// ---------------------------------------------------------------------------
// Store newly-generated concepts. This is the result of an explicit user
// action ("צור כיווני עיצוב"), so we re-stamp updatedAt (committed locally)
// rather than treating it as an in-progress field edit.
export function setConcepts(concepts, signature) {
  const list = Array.isArray(concepts) ? concepts : [];
  const next = normalizeBrief({
    ...loadInitial(),
    concepts: list,
    // Clean 5B.1 — capture the input signature at generation time so the UI can
    // later detect when the concepts have gone stale. Optional/back-compatible.
    conceptsSignature: typeof signature === 'string' ? signature : null,
    // Keep a previously-selected concept only if it still exists in the new
    // list; normalizeBrief enforces this, but clear here for clarity.
    updatedAt: Date.now(),
  });
  persist(next);
  return getBrief();
}

// Mark one concept as the selected design direction. Explicit user action →
// re-stamp updatedAt so the direction reads as committed (not a dirty draft).
export function selectConcept(conceptId) {
  const next = normalizeBrief({
    ...loadInitial(),
    selectedConceptId: conceptId || null,
    updatedAt: Date.now(),
  });
  persist(next);
  return getBrief();
}

// Edit free-text notes on a single concept (kept local; re-stamps updatedAt).
export function updateConceptNotes(conceptId, conceptNotes) {
  const current = loadInitial();
  const concepts = (Array.isArray(current.concepts) ? current.concepts : []).map(
    (c) =>
      c && c.conceptId === conceptId
        ? { ...c, conceptNotes: typeof conceptNotes === 'string' ? conceptNotes : '' }
        : c
  );
  const next = normalizeBrief({ ...current, concepts, updatedAt: Date.now() });
  persist(next);
  return getBrief();
}

// Clean 5B.3 — Remove ONE design direction (additive). If the removed concept
// was the selected one, selection clears (normalizeBrief also enforces this).
// IMPORTANT: conceptsSignature is preserved as-is — removing a direction is a
// curation action, not a re-generation, so the stale comparison is unaffected.
export function removeConcept(conceptId) {
  if (!conceptId) return getBrief();
  const current = loadInitial();
  const concepts = (Array.isArray(current.concepts) ? current.concepts : []).filter(
    (c) => c && c.conceptId !== conceptId
  );
  const selectedConceptId =
    current.selectedConceptId === conceptId ? null : current.selectedConceptId;
  const next = normalizeBrief({
    ...current,
    concepts,
    selectedConceptId,
    updatedAt: Date.now(),
  });
  persist(next);
  return getBrief();
}

// Clean 5B.3 — Replace ONE design direction in place (additive). Used by the
// per-card "refresh this direction" control: only the targeted slot changes,
// every other direction is left exactly as-is. If the replaced concept was the
// selected one, the selection moves to the replacement so the user does not
// silently lose their chosen direction. conceptsSignature is preserved (this is
// an in-place swap of one card, not a full re-generation of the set).
export function replaceConcept(conceptId, replacement) {
  if (!conceptId || !replacement || typeof replacement !== 'object') return getBrief();
  const current = loadInitial();
  const list = Array.isArray(current.concepts) ? current.concepts : [];
  let replacedId = null;
  const concepts = list.map((c) => {
    if (c && c.conceptId === conceptId) {
      replacedId = replacement.conceptId || conceptId;
      return replacement;
    }
    return c;
  });
  const selectedConceptId =
    current.selectedConceptId === conceptId && replacedId
      ? replacedId
      : current.selectedConceptId;
  const next = normalizeBrief({
    ...current,
    concepts,
    selectedConceptId,
    updatedAt: Date.now(),
  });
  persist(next);
  return getBrief();
}
// Add a newly-generated output as a NEW entry (explicit "צור פלט עיצוב" /
// "שמור פלט לעבודה"). Becomes the latest output; stamps updatedAt.
export function addOutput(output) {
  if (!output || typeof output !== 'object' || !output.outputId) return getBrief();
  const current = loadInitial();
  const list = Array.isArray(current.designOutputs) ? current.designOutputs.slice() : [];
  list.push(output);
  const next = normalizeBrief({
    ...current,
    designOutputs: list,
    latestOutputId: output.outputId,
    updatedAt: Date.now(),
  });
  persist(next);
  return getBrief();
}

// Update an EXISTING output in place ("עדכן פלט קיים"). Re-stamps its own
// updatedAt and the brief's. If the id is not found, this is a no-op.
export function updateOutput(outputId, patch) {
  if (!outputId) return getBrief();
  const current = loadInitial();
  const list = (Array.isArray(current.designOutputs) ? current.designOutputs : []).map(
    (o) =>
      o && o.outputId === outputId
        ? { ...o, ...(patch && typeof patch === 'object' ? patch : {}), outputId, updatedAt: Date.now() }
        : o
  );
  const next = normalizeBrief({
    ...current,
    designOutputs: list,
    latestOutputId: outputId,
    updatedAt: Date.now(),
  });
  persist(next);
  return getBrief();
}

// Mark one output as the explicitly selected output (or clear with null).
export function selectOutput(outputId) {
  const next = normalizeBrief({
    ...loadInitial(),
    selectedOutputId: outputId || null,
    updatedAt: Date.now(),
  });
  persist(next);
  return getBrief();
}

// Edit free-text notes on a single output (re-stamps updatedAt).
export function updateOutputNotes(outputId, outputNotes) {
  return updateOutput(outputId, {
    outputNotes: typeof outputNotes === 'string' ? outputNotes : '',
  });
}

// ---------------------------------------------------------------------------
// React hook factory — SSR-safe initial value, then live updates.
// ---------------------------------------------------------------------------
export function createUseDesignBrief(React) {
  const { useState, useEffect, useCallback } = React;
  return function useDesignBrief() {
    const [brief, setBrief_state] = useState(emptyBrief());
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
      setBrief_state(getBrief());
      setHydrated(true);

      const sync = () => setBrief_state(getBrief());
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
      update: useCallback((patch) => setBrief_state(updateBrief(patch)), []),
      save: useCallback(() => setBrief_state(saveBriefLocal()), []),
      clear: useCallback(() => setBrief_state(clearBrief()), []),
      set: useCallback((b) => setBrief_state(setBrief(b)), []),
      // Clean 5A — Design Core concept mutations
      setConcepts: useCallback((c, sig) => setBrief_state(setConcepts(c, sig)), []),
      selectConcept: useCallback((id) => setBrief_state(selectConcept(id)), []),
      updateConceptNotes: useCallback(
        (id, notes) => setBrief_state(updateConceptNotes(id, notes)),
        []
      ),
      // Clean 5B.3 — single-direction curation
      removeConcept: useCallback((id) => setBrief_state(removeConcept(id)), []),
      replaceConcept: useCallback(
        (id, replacement) => setBrief_state(replaceConcept(id, replacement)),
        []
      ),
      // Clean 5B — Practical Output Layer mutations
      addOutput: useCallback((o) => setBrief_state(addOutput(o)), []),
      updateOutput: useCallback((id, patch) => setBrief_state(updateOutput(id, patch)), []),
      selectOutput: useCallback((id) => setBrief_state(selectOutput(id)), []),
      updateOutputNotes: useCallback(
        (id, notes) => setBrief_state(updateOutputNotes(id, notes)),
        []
      ),
    };
  };
}
