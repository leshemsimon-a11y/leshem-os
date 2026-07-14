// lib/studio/goldenPath.js
//
// LESHEM.S OS — Clean 8K-R4: Golden Path Reset — pure helpers.
//
// PURE, deterministic, local logic only. NO store, NO persistence, NO
// network, NO AI service. Everything here is a pure function over plain
// data, used by components/studio/create/CreateFlowShell.js to run the ONE
// canonical golden-path scenario ("יש לי אבן ואני רוצה ליצור תכשיט"):
//   select stone -> write request -> understanding gate -> 3 directions
//   (product-type enforced) -> select -> refine -> presentation -> save.
//
// This file adds exactly one new idea beyond what already existed in
// lib/studio/createFlow.js (the product/style vocabulary + direction
// generator): PARSING a free-text Hebrew request into that SAME
// product/style vocabulary (CREATE_PRODUCT_OPTIONS / CREATE_STYLE_OPTIONS),
// plus a metal preference using the EXISTING valid METAL_PREFERENCE values
// (designDraft.js). It also adds an explicit product-type enforcement guard
// over generated directions, and a resume-stage inference that reads ONLY
// already-existing, already-validated brief fields (productType / concepts
// / selectedConceptId) — NO new persistence key, NO new store field, NO
// schema change anywhere.

import {
  CREATE_PRODUCT_OPTIONS,
  CREATE_STYLE_OPTIONS,
  PRODUCT_TO_BRIEF,
  productHe,
  styleHe,
} from './createFlow';
import { BRIEF_HE } from './labels';
import { DESIGN_ROLE, normalizeRole, trayItemTitle } from './designDraft';

// The SAME mapping generateCreateDirections/buildCreateBrief already use
// internally, computed independently and BEFORE generation so the
// enforcement check below is a real guard, not a tautology against the
// generator's own output. 'other'-mapped products (e.g. clusterPiece) have
// no single strict product type by existing design — expectedProductType is
// null for them, exactly as buildCreateBrief already treats them.
export function expectedProductTypeFor(productKey) {
  const mapped = PRODUCT_TO_BRIEF[productKey];
  return mapped && mapped !== 'other' ? mapped : null;
}

// ---------------------------------------------------------------------------
// Stage model — the ONE canonical golden-path sequence (spec §1 / §8).
// ---------------------------------------------------------------------------
export const GOLDEN_STAGE = Object.freeze({
  STONE: 'stone',
  REQUEST: 'request',
  UNDERSTANDING: 'understanding',
  DIRECTIONS: 'directions',
  REFINE: 'refine',
  PRESENTATION: 'presentation',
  SAVED: 'saved',
});

export const GOLDEN_STAGE_ORDER = Object.freeze([
  GOLDEN_STAGE.STONE,
  GOLDEN_STAGE.REQUEST,
  GOLDEN_STAGE.UNDERSTANDING,
  GOLDEN_STAGE.DIRECTIONS,
  GOLDEN_STAGE.REFINE,
  GOLDEN_STAGE.PRESENTATION,
]);

export function previousStage(stage) {
  const i = GOLDEN_STAGE_ORDER.indexOf(stage);
  return i > 0 ? GOLDEN_STAGE_ORDER[i - 1] : null;
}

// ---------------------------------------------------------------------------
// Metal detection — existing METAL_PREFERENCE values only (designDraft.js).
// Most-specific phrase first so a color qualifier always wins over a bare
// "זהב". A bare "זהב" with NO color word is deliberately left unset (null)
// rather than guessed — a wrong metal guess is worse than none, and the
// understanding gate always gives the person a chance to correct it.
// ---------------------------------------------------------------------------
const METAL_RULES = [
  { key: 'whiteGold', test: /זהב\s*לבן/ },
  { key: 'roseGold', test: /זהב\s*(אדום|ורוד)/ },
  { key: 'yellowGold', test: /זהב\s*צהוב/ },
  { key: 'platinum', test: /פלטינ/ },
  { key: 'silver', test: /כסף/ },
];

export function detectMetalPreference(text) {
  const t = typeof text === 'string' ? text : '';
  for (let i = 0; i < METAL_RULES.length; i += 1) {
    if (METAL_RULES[i].test.test(t)) return METAL_RULES[i].key;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Product-type detection — reuses the EXISTING CREATE_PRODUCT_OPTIONS
// vocabulary verbatim (same keys generateCreateDirections / buildCreateBrief
// already accept from the old chip-picker). "other" is intentionally
// excluded from auto-detection: a generic/ambiguous request should not
// silently become "other" — it should prompt the person to say the product
// type explicitly. The understanding gate's primary action stays disabled
// until a real product type is found (spec §4 — never rely on prompt
// wording alone for something this important).
// ---------------------------------------------------------------------------
function productCandidates() {
  return CREATE_PRODUCT_OPTIONS.filter((o) => o.key !== 'other');
}

export function detectProduct(text) {
  const t = typeof text === 'string' ? text : '';
  if (!t.trim()) return null;
  let best = null;
  productCandidates().forEach((o) => {
    const idx = t.indexOf(o.he);
    if (idx !== -1 && (best === null || idx < best.idx)) {
      best = { key: o.key, idx };
    }
  });
  return best ? best.key : null;
}

// Style detection — collects EVERY matched style (for a natural combined
// display phrase, e.g. "עדין ומודרני") but the leftmost (first-mentioned)
// match is treated as canonical for the single-value styleDirection field.
export function detectStyles(text) {
  const t = typeof text === 'string' ? text : '';
  if (!t.trim()) return [];
  const hits = [];
  CREATE_STYLE_OPTIONS.forEach((o) => {
    const idx = t.indexOf(o.he);
    if (idx !== -1) hits.push({ key: o.key, idx });
  });
  hits.sort((a, b) => a.idx - b.idx);
  return hits.map((h) => h.key);
}

// parseRequestHe(text) -> { product, style, styleMatches, metalPreference }
// Pure, deterministic, local — no AI, no network. `product` / `style` are
// the SAME CREATE_PRODUCT_OPTIONS / CREATE_STYLE_OPTIONS keys the existing
// generator already consumes; parsing only replaces HOW those two keys get
// chosen (free text instead of chip clicks) — nothing downstream changes.
export function parseRequestHe(text) {
  const styleMatches = detectStyles(text);
  return {
    product: detectProduct(text),
    style: styleMatches.length ? styleMatches[0] : null,
    styleMatches,
    metalPreference: detectMetalPreference(text),
  };
}

// ---------------------------------------------------------------------------
// "מה הבנתי" — the understanding-gate sentence (spec §3). Returns null when
// no product type was found; the caller gates the primary confirm action on
// this (never show "confirm" with nothing recognizable to confirm).
//
// The center-stone clause is deliberately phrased "כשהאבן המרכזית היא X"
// (rather than "X הוא/היא האבן המרכזית") so the pronoun always agrees with
// the feminine "האבן" regardless of the grammatical gender of the specific
// gem name — correct for every stone type without a per-gem gender table.
// ---------------------------------------------------------------------------
function joinHebrewList(items) {
  const arr = (items || []).filter(Boolean);
  if (arr.length === 0) return '';
  if (arr.length === 1) return arr[0];
  return `${arr.slice(0, -1).join(', ')} ו${arr[arr.length - 1]}`;
}

export function centerStoneNameHe(trayItems) {
  const items = Array.isArray(trayItems) ? trayItems : [];
  if (!items.length) return null;
  const center = items.find((it) => normalizeRole(it.role) === DESIGN_ROLE.CENTER_STONE);
  return trayItemTitle(center || items[0]) || null;
}

export function buildRequestUnderstandingHe({ product, styleMatches, metalPreference, trayItems }) {
  const pHe = productHe(product);
  if (!pHe) return null;
  const styleHeParts = joinHebrewList((styleMatches || []).map((k) => styleHe(k)).filter(Boolean));
  const metalHeVal = metalPreference ? BRIEF_HE.metal[metalPreference] : null;
  const head = [pHe, styleHeParts || null].filter(Boolean).join(' ');
  const withMetal = metalHeVal ? `${head} ב${metalHeVal}` : head;
  const stoneName = centerStoneNameHe(trayItems);
  const stoneClause = stoneName ? `, כשהאבן המרכזית היא ה${stoneName}` : '';
  return `${withMetal}${stoneClause}.`;
}

// ---------------------------------------------------------------------------
// Product-type enforcement (spec §4) — "Do not rely only on prompt
// wording." generateCreateDirections already derives ONE productType from
// the `product` input and stamps it identically on all 3 directions; this
// is the explicit guard that GUARANTEES the invariant independent of the
// generator's own internal logic, and self-heals if a direction is ever
// found not to match rather than silently rendering a mismatch.
// ---------------------------------------------------------------------------
export function directionsMatchProductType(directions, expectedProductType) {
  if (!expectedProductType) return true;
  return (Array.isArray(directions) ? directions : []).every(
    (d) => d && d.productType === expectedProductType
  );
}

export function enforceDirectionsProductType(directions, expectedProductType) {
  const list = Array.isArray(directions) ? directions : [];
  if (!expectedProductType) return { directions: list, corrected: false };
  let corrected = false;
  const fixed = list.map((d) => {
    if (d && d.productType !== expectedProductType) {
      corrected = true;
      return { ...d, productType: expectedProductType };
    }
    return d;
  });
  return { directions: fixed, corrected };
}

// ---------------------------------------------------------------------------
// Resume inference (spec §2 — "leave and return safely"). Reads ONLY
// existing, already-validated brief fields (productType / concepts /
// selectedConceptId) that already round-trip through designProjects.js's
// existing normalizeBrief — NO new field, NO new persistence key. The stage
// is DERIVED from data shape on load; it is never itself stored.
// ---------------------------------------------------------------------------
export const CREATE_FLOW_MARKER = 'נוצר במסלול היצירה';

export function isCreateFlowProject(project) {
  return Boolean(
    project &&
      project.brief &&
      typeof project.brief.notes === 'string' &&
      project.brief.notes.indexOf(CREATE_FLOW_MARKER) !== -1
  );
}

export function deriveResumeStage(brief, trayItems) {
  const b = brief || {};
  const hasStone = Array.isArray(trayItems) && trayItems.length > 0;
  const concepts = Array.isArray(b.concepts) ? b.concepts : [];
  if (b.selectedConceptId && concepts.some((c) => c.conceptId === b.selectedConceptId)) {
    return GOLDEN_STAGE.REFINE;
  }
  if (concepts.length > 0) return GOLDEN_STAGE.DIRECTIONS;
  if (b.productType) return GOLDEN_STAGE.UNDERSTANDING;
  if (hasStone) return GOLDEN_STAGE.REQUEST;
  return GOLDEN_STAGE.STONE;
}
