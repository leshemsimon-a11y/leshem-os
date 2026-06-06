/**
 * lib/v2/builderCalculatorBridge.js — v2.5
 *
 * Pure + localStorage bridge: hands a v2 JewelryBuildDraft off to the MVP
 * calculator WITHOUT trusting any v2-normalized data into the pricing engine.
 *
 * Mechanism (approved):
 *   • v2 writes a STRUCTURED payload to localStorage (record IDs + roles + a
 *     metal hint + a components/overflow note). It then navigates to /?v2build=1.
 *   • The MVP receiver reads the payload, RE-RESOLVES every record ID from its
 *     own invStones (normalizeStone shape), and dispatches each role group into
 *     the EXISTING prefill/batch functions. No pricing formula is touched.
 *
 * Safety:
 *   • Center stones stay separate (never collapsed to quantity).
 *   • Side groups map only to the engine's existing two rows (ss1/ss2).
 *     Third+ side groups are NOT dropped silently — they go into the note.
 *   • Components are a selected-components NOTE only (no pricing invented).
 *   • Metal maps ONLY on an exact safe match; otherwise left for manual choice.
 *   • Side group color/clarity are NOT mapped to calculator fields (no such
 *     fields exist) — they are surfaced in the note instead.
 *
 * No Airtable. No schema changes. No new API routes. No packages.
 */

import { getShapeLabel, getStoneTypeLabel } from './taxonomyHelpers';

export const BUILD_BRIDGE_KEY = 'leshem_v2_build_handoff';
export const BUILD_BRIDGE_FLAG = 'v2build';

// Max side rows the MVP engine exposes today (ss1, ss2).
export const MVP_SIDE_ROW_LIMIT = 2;

/* ─── Metal mapping (v2 canonical → MVP METALS string) ───────────────────────
 * Only EXACT, safe pairs map. Anything else returns null → manual selection.
 * Keys: `${metalType}|${karat}`. MVP strings must match lib/constants METALS.
 */
const METAL_MAP = {
  'yellow_gold|9k':  '9K Yellow Gold',
  'yellow_gold|14k': '14K Yellow Gold',
  'yellow_gold|18k': '18K Yellow Gold',
  'white_gold|9k':   '9K White Gold',
  'white_gold|14k':  '14K White Gold',
  'white_gold|18k':  '18K White Gold',
  'rose_gold|14k':   '14K Rose Gold',
  'rose_gold|18k':   '18K Rose Gold',
  'platinum|pt':     'Platinum',
  'platinum|':       'Platinum',
  'silver|':         'Silver (925)',
};

/**
 * Maps a v2 metal placeholder to an MVP METALS string, or null if unsafe.
 * @param {{metalType?: string|null, karat?: string|null}|null} metal
 * @returns {string|null}
 */
export function mapMetalToMvp(metal) {
  if (!metal || !metal.metalType) return null;
  const key = `${metal.metalType}|${metal.karat || ''}`;
  return METAL_MAP[key] || null;
}

/* ─── Setting mapping (v2 settingType → MVP SETTINGS string) ──────────────────
 * Only exact, safe pairs map. Unknown/empty → null (no setting forced).
 */
const SETTING_MAP = {
  prong:   'Prong / Claw',
  bezel:   'Bezel',
  pave:    'Pavé',
  channel: 'Channel',
  micro:   'Pavé',         // micro-pavé maps to the engine's Pavé row
};

/**
 * Maps a v2 side-group setting type to an MVP SETTINGS string, or null.
 * @param {string|null} settingType
 * @returns {string|null}
 */
export function mapSettingToMvp(settingType) {
  if (!settingType) return null;
  return SETTING_MAP[settingType] || null;
}

/**
 * Builds the structured handoff payload from a JewelryBuildDraft.
 * Carries IDs + roles only for stones (the MVP re-resolves them); side groups
 * also carry their mapped setting and a human note fragment because the engine
 * side path cannot hold every attribute. Pure — no side effects.
 *
 * @param {object} draft  a JewelryBuildDraft
 * @returns {object}      serializable payload
 */
export function buildHandoffPayload(draft) {
  if (!draft) {
    return { v: '2.5', centers: [], sides: [], components: [], metal: null, notes: '', overflow: [] };
  }

  const centers = (draft.centerStones || [])
    .filter((c) => c && c._ref)
    .map((c) => ({ id: c._ref }));

  // Side groups: keep order; only the first MVP_SIDE_ROW_LIMIT will map to rows.
  const sides = (draft.sideStoneGroups || []).map((g) => ({
    id:           (g._refs && g._refs[0]) || null,
    setting:      mapSettingToMvp(g.settingType),
    settingRaw:   g.settingType || null,
    quantity:     g.quantity || 1,
    grouped:      !!g.grouped,
    // Note-only attributes (no calculator fields exist for these):
    color:        g.color || '',
    clarity:      g.clarity || '',
    shapeLabelEn: getShapeLabel(g.shape, 'en'),
    typeLabelEn:  getStoneTypeLabel(g.stoneType, 'en'),
  }));

  const components = (draft.components || []).map((c) => ({
    title: c.title || 'Component',
  }));

  const metal = mapMetalToMvp(draft.metal);

  return {
    v:          '2.5',
    centers,                       // [{id}]
    sides,                         // [{id, setting, ...noteAttrs}]
    components,                    // [{title}]
    metal,                         // MVP METALS string | null
    metalUnmapped: !metal && !!(draft.metal && draft.metal.metalType),
    notes:      draft.notes || '',
    createdAt:  new Date().toISOString(),
  };
}

/**
 * Composes a single English+Hebrew note describing everything that could NOT be
 * mapped into calculator fields (components, overflow side groups beyond two,
 * side color/clarity, unmapped metal, original draft notes). Never fakes data.
 *
 * @param {object} payload  from buildHandoffPayload
 * @returns {string}
 */
export function composeBuildNote(payload) {
  if (!payload) return '';
  const lines = [];

  if (payload.components && payload.components.length) {
    const names = payload.components.map((c) => c.title).filter(Boolean).join(', ');
    lines.push(`Selected components / רכיבים שנבחרו: ${names}`);
  }

  const sides = payload.sides || [];
  if (sides.length > MVP_SIDE_ROW_LIMIT) {
    const overflow = sides.slice(MVP_SIDE_ROW_LIMIT);
    const desc = overflow
      .map((s) => {
        const parts = [s.typeLabelEn, s.shapeLabelEn, `x${s.quantity}`, s.color, s.clarity]
          .filter(Boolean)
          .join(' ');
        return parts;
      })
      .filter(Boolean)
      .join('; ');
    lines.push(
      `Additional side stone groups beyond the two calculator rows (enter manually) / קבוצות אבני צד נוספות מעבר לשתי השורות (הזן ידנית): ${desc}`
    );
  }

  // Side color/clarity for the mapped rows (engine has no field for these).
  const mappedSidesWithGrades = sides
    .slice(0, MVP_SIDE_ROW_LIMIT)
    .filter((s) => s.color || s.clarity);
  if (mappedSidesWithGrades.length) {
    const desc = mappedSidesWithGrades
      .map((s, i) => `Row ${i + 1}: ${[s.color, s.clarity].filter(Boolean).join(' ')}`)
      .join('; ');
    lines.push(`Side stone color/clarity (reference only): ${desc}`);
  }

  if (payload.metalUnmapped) {
    lines.push('Metal: select manually in calculator / בחר מתכת ידנית במחשבון.');
  }

  if (payload.notes) {
    lines.push(payload.notes);
  }

  return lines.join('\n');
}

/**
 * Writes the payload to localStorage. Returns true on success.
 * Guarded for SSR / disabled storage. No throw.
 *
 * @param {object} payload
 * @returns {boolean}
 */
export function writeBuildHandoff(payload) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    window.localStorage.setItem(BUILD_BRIDGE_KEY, JSON.stringify(payload));
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Reads and PARSES the payload from localStorage (does not clear it).
 * Returns null if absent/invalid. No throw.
 *
 * @returns {object|null}
 */
export function readBuildHandoff() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = window.localStorage.getItem(BUILD_BRIDGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (e) {
    return null;
  }
}

/** Removes the payload from localStorage. No throw. */
export function clearBuildHandoff() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.removeItem(BUILD_BRIDGE_KEY);
  } catch (e) {
    /* no-op */
  }
}

/** The URL the v2 Builder navigates to after writing the payload. */
export function buildHandoffUrl() {
  return `/?${BUILD_BRIDGE_FLAG}=1`;
}
