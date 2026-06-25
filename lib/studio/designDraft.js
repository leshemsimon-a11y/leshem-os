// lib/studio/designDraft.js
//
// LESHEM.S OS — Jewelry Design Draft Layer (Clean 3 → Clean 3.2)
//
// Product language: this is the foundation of the JEWELRY DESIGN STUDIO. The
// system is stone-first — the stone is chosen first, then the design work
// begins around it. This module supplies the ROLE vocabulary used when the
// jeweller assigns each Work-Tray item a part in the design, plus small,
// pure helpers that turn the current tray into a design-draft view-model.
//
// SCOPE (Clean 3.2): roles + grouping + draft validation/summary for display
// only. No uploads, no models, no renders, no pricing, no certificates, no
// Airtable. Helper logic only — the user-facing route and language stay
// "Design / סטודיו עיצוב".
//
// DESIGN RULES honored:
//   • Center stones remain SEPARATE items — they are NEVER collapsed into a
//     quantity field. Each center stone is addressable on its own.
//   • Side stones may be grouped ONLY for presentation; grouping never
//     destroys or merges the underlying distinct items.
//   • Roles are canonical English values; Hebrew labels live alongside for UI.

// ---------------------------------------------------------------------------
// Canonical role values (English) — the only values logic compares.
// ---------------------------------------------------------------------------
export const DESIGN_ROLE = Object.freeze({
  UNASSIGNED: 'unassigned',
  CENTER_STONE: 'centerStone',
  SIDE_STONE: 'sideStone',
  ACCENT_STONE: 'accentStone',
  PAIR: 'pair',
  PARCEL: 'parcel',
  COMPONENT: 'component',
  REFERENCE_ONLY: 'referenceOnly',
});

export const DESIGN_ROLE_VALUES = Object.freeze(Object.values(DESIGN_ROLE));

// Roles offered in the role selector, in a deliberate order. "unassigned" is
// the starting state and is offered so a user can move an item back to it.
export const ASSIGNABLE_ROLES = Object.freeze([
  DESIGN_ROLE.UNASSIGNED,
  DESIGN_ROLE.CENTER_STONE,
  DESIGN_ROLE.SIDE_STONE,
  DESIGN_ROLE.ACCENT_STONE,
  DESIGN_ROLE.PAIR,
  DESIGN_ROLE.PARCEL,
  DESIGN_ROLE.COMPONENT,
  DESIGN_ROLE.REFERENCE_ONLY,
]);

// ---------------------------------------------------------------------------
// Hebrew UI labels for roles (app-facing). English report wording is NOT
// produced here — Clean 3.2 does not emit certificates.
// ---------------------------------------------------------------------------
const ROLE_HE = {
  [DESIGN_ROLE.UNASSIGNED]: 'ללא תפקיד',
  [DESIGN_ROLE.CENTER_STONE]: 'אבן מרכזית',
  [DESIGN_ROLE.SIDE_STONE]: 'אבני צד',
  [DESIGN_ROLE.ACCENT_STONE]: 'אבנים נוספות',
  [DESIGN_ROLE.PAIR]: 'זוג',
  [DESIGN_ROLE.PARCEL]: 'חבילה / פארסל',
  [DESIGN_ROLE.COMPONENT]: 'רכיב',
  [DESIGN_ROLE.REFERENCE_ONLY]: 'רפרנס בלבד',
};

export function roleHe(role) {
  if (role == null) return ROLE_HE[DESIGN_ROLE.UNASSIGNED];
  const label = ROLE_HE[role];
  if (label == null) {
    console.warn(`[designDraft] no Hebrew label for role="${role}"`);
    return ROLE_HE[DESIGN_ROLE.UNASSIGNED];
  }
  return label;
}

export function isValidRole(role) {
  return DESIGN_ROLE_VALUES.includes(role);
}

// Normalize any stored role to a valid canonical value (defaults to unassigned).
export function normalizeRole(role) {
  return isValidRole(role) ? role : DESIGN_ROLE.UNASSIGNED;
}

// ---------------------------------------------------------------------------
// Grouping for the Design Studio view.
// ---------------------------------------------------------------------------
// Returns an ordered list of groups for rendering. Center stones are emitted
// as INDIVIDUAL groups (one item each) so they are never collapsed together.
// Side stones / parcels / components / reference / unassigned are gathered
// into one group per role for a calm layout, but each underlying item is kept
// intact and individually addressable (remove / re-assign still works).
//
// Group shape: { id, role, roleHe, items: [...trayItems], collapsedToQuantity:false }

const GROUP_ORDER = [
  DESIGN_ROLE.CENTER_STONE,
  DESIGN_ROLE.PAIR,
  DESIGN_ROLE.SIDE_STONE,
  DESIGN_ROLE.ACCENT_STONE,
  DESIGN_ROLE.PARCEL,
  DESIGN_ROLE.COMPONENT,
  DESIGN_ROLE.REFERENCE_ONLY,
  DESIGN_ROLE.UNASSIGNED,
];

// Roles that are presented as ONE combined group (still distinct items inside).
const COMBINED_ROLES = new Set([
  DESIGN_ROLE.SIDE_STONE,
  DESIGN_ROLE.ACCENT_STONE,
  DESIGN_ROLE.PARCEL,
  DESIGN_ROLE.COMPONENT,
  DESIGN_ROLE.REFERENCE_ONLY,
  DESIGN_ROLE.UNASSIGNED,
]);

export function buildDesignGroups(trayItems) {
  const items = Array.isArray(trayItems) ? trayItems : [];

  const byRole = new Map();
  items.forEach((it) => {
    const role = isValidRole(it.role) ? it.role : DESIGN_ROLE.UNASSIGNED;
    if (!byRole.has(role)) byRole.set(role, []);
    byRole.get(role).push(it);
  });

  const groups = [];

  GROUP_ORDER.forEach((role) => {
    const list = byRole.get(role);
    if (!list || list.length === 0) return;

    if (COMBINED_ROLES.has(role)) {
      // One combined group; items remain distinct (NOT a quantity collapse).
      groups.push({
        id: `group-${role}`,
        role,
        roleHe: roleHe(role),
        items: list,
        collapsedToQuantity: false,
      });
    } else {
      // CENTER_STONE (and PAIR) — emit each item as its own group so center
      // stones are never merged. PAIR is conceptually two stones; we keep it
      // as a single addressable item here (its "pair" nature is the role).
      list.forEach((it, i) => {
        groups.push({
          id: `group-${role}-${it.id}-${i}`,
          role,
          roleHe: roleHe(role),
          items: [it],
          collapsedToQuantity: false,
        });
      });
    }
  });

  return groups;
}

// ---------------------------------------------------------------------------
// Draft summary (Clean 3.2)
// ---------------------------------------------------------------------------
// A richer, fully BACKWARD-COMPATIBLE summary. The original keys (`total`,
// `assigned`, `unassigned`) are preserved exactly, so every existing caller
// keeps working; new per-role counts and a `readyToBegin` flag are ADDED.
//
// readyToBegin is true once at least one CENTER STONE exists — that is the
// signal a design draft can meaningfully begin (stone-first).
export function summarizeDraft(trayItems) {
  const items = Array.isArray(trayItems) ? trayItems : [];

  const counts = {
    [DESIGN_ROLE.UNASSIGNED]: 0,
    [DESIGN_ROLE.CENTER_STONE]: 0,
    [DESIGN_ROLE.SIDE_STONE]: 0,
    [DESIGN_ROLE.ACCENT_STONE]: 0,
    [DESIGN_ROLE.PAIR]: 0,
    [DESIGN_ROLE.PARCEL]: 0,
    [DESIGN_ROLE.COMPONENT]: 0,
    [DESIGN_ROLE.REFERENCE_ONLY]: 0,
  };

  items.forEach((it) => {
    const role = normalizeRole(it && it.role);
    counts[role] += 1;
  });

  const total = items.length;
  const unassigned = counts[DESIGN_ROLE.UNASSIGNED];
  const assigned = total - unassigned;

  return {
    // --- original keys (unchanged, do not remove) ---
    total,
    assigned,
    unassigned,
    // --- added per-role counts ---
    centerStoneCount: counts[DESIGN_ROLE.CENTER_STONE],
    sideStoneCount: counts[DESIGN_ROLE.SIDE_STONE],
    accentStoneCount: counts[DESIGN_ROLE.ACCENT_STONE],
    pairCount: counts[DESIGN_ROLE.PAIR],
    parcelCount: counts[DESIGN_ROLE.PARCEL],
    componentCount: counts[DESIGN_ROLE.COMPONENT],
    referenceCount: counts[DESIGN_ROLE.REFERENCE_ONLY],
    // --- readiness (stone-first) ---
    readyToBegin: counts[DESIGN_ROLE.CENTER_STONE] > 0,
  };
}

// ---------------------------------------------------------------------------
// Draft status (Clean 3.2) — honest, three-state validation for the UI.
// ---------------------------------------------------------------------------
// Returns a small descriptor the tray + design pages can render directly:
//   { key, tone }
//     key:  'empty' | 'needsRole' | 'ready'
//     tone: 'neutral' | 'pending' | 'ready'  (drives accent colour only)
//
// Hebrew copy intentionally lives in the labels layer (DESIGN_HE.status),
// keeping this module language-light and reusable. Logic, not strings.
//
// Rules:
//   • no items                       → empty
//   • items, but no center stone yet → needsRole  (continuing is still allowed)
//   • at least one center stone      → ready
export function draftStatus(trayItems) {
  const { total, readyToBegin } = summarizeDraft(trayItems);
  if (total === 0) return { key: 'empty', tone: 'neutral' };
  if (readyToBegin) return { key: 'ready', tone: 'ready' };
  return { key: 'needsRole', tone: 'pending' };
}

// Best-effort display title for a tray item, reusing the same precedence the
// inventory card/drawer use. Never returns the raw record id.
export function trayItemTitle(item) {
  const s = (item && item.snapshot) || {};
  return s.name || s.stoneTypeHe || s.productTypeHe || 'פריט מלאי';
}

// ===========================================================================
// Jewelry Design Brief (Clean 3C)
// ===========================================================================
// The brief is the first creative layer ON TOP of the stone selection: once
// stones are on the tray and given roles, the jeweller records the design
// INTENT around them — what kind of piece, the metal, the style, a free-text
// intention, and notes. Reference material (image / video / sketch / 3D /
// link / text) is RESERVED here as inert placeholders only; real upload is a
// later milestone.
//
// SCOPE (Clean 3C): pure schema + option vocabularies + validation/status
// helpers for display. This module holds the BRIEF LOGIC; local persistence
// lives in lib/studio/designBriefStore.js (a sibling to workTray.js), exactly
// mirroring how role logic here is separate from the workTray store. No new
// competing "designBrief" logic module is created. No Airtable, no network.

// Canonical jewelry types (English values; Hebrew labels live in labels.js).
export const JEWELRY_TYPE = Object.freeze({
  RING: 'ring',
  PENDANT: 'pendant',
  EARRINGS: 'earrings',
  BRACELET: 'bracelet',
  NECKLACE: 'necklace',
});

export const JEWELRY_TYPE_VALUES = Object.freeze(Object.values(JEWELRY_TYPE));

// Canonical metal preferences (English values; Hebrew labels in labels.js).
export const METAL_PREFERENCE = Object.freeze({
  YELLOW_GOLD: 'yellowGold',
  WHITE_GOLD: 'whiteGold',
  ROSE_GOLD: 'roseGold',
  PLATINUM: 'platinum',
  SILVER: 'silver',
});

export const METAL_PREFERENCE_VALUES = Object.freeze(
  Object.values(METAL_PREFERENCE)
);

// Canonical style preferences (English values; Hebrew labels in labels.js).
export const STYLE_PREFERENCE = Object.freeze({
  CLASSIC: 'classic',
  MODERN: 'modern',
  VINTAGE: 'vintage',
  MINIMAL: 'minimal',
  STATEMENT: 'statement',
});

export const STYLE_PREFERENCE_VALUES = Object.freeze(
  Object.values(STYLE_PREFERENCE)
);

// ===========================================================================
// Product Type (Clean 5A — Design Core)
// ===========================================================================
// Canonical product types for "מה מעצבים?" (what are we designing). English
// values; Hebrew labels live in labels.js (CONCEPT_HE.productType). These are a
// SUPERSET of the older JEWELRY_TYPE vocabulary — JEWELRY_TYPE is left intact
// and untouched so every existing caller (brief panel, snapshot) keeps working.
//
// IMPORTANT product rule: stones are common but NOT required. Several product
// types are explicitly metal-only / non-stone (wedding band, matching piece,
// plain metal, no-stones). The Design Core never forces a stone.
export const PRODUCT_TYPE = Object.freeze({
  RING: 'ring',
  ENGAGEMENT_RING: 'engagementRing',
  WEDDING_BAND: 'weddingBand',
  PENDANT: 'pendant',
  NECKLACE: 'necklace',
  EARRINGS: 'earrings',
  BRACELET: 'bracelet',
  MATCHING_PIECE: 'matchingPiece', // תכשיט משלים / תואם
  NO_STONES: 'noStones', // תכשיט ללא אבנים (metal-only)
  OTHER: 'other',
});

export const PRODUCT_TYPE_VALUES = Object.freeze(Object.values(PRODUCT_TYPE));

export function isValidProductType(v) {
  return PRODUCT_TYPE_VALUES.includes(v);
}

// Product types that are inherently metal-only / do not assume a stone.
export const METAL_ONLY_PRODUCT_TYPES = Object.freeze([
  PRODUCT_TYPE.WEDDING_BAND,
  PRODUCT_TYPE.NO_STONES,
]);

export function isMetalOnlyProductType(v) {
  return METAL_ONLY_PRODUCT_TYPES.includes(v);
}

// ---------------------------------------------------------------------------
// Stone usage intent (Clean 5A) — how the design should treat stones.
// ---------------------------------------------------------------------------
// 'useSelected' — build around the stones currently selected (stone-led)
// 'optional'    — stones are welcome but not central
// 'none'        — metal-only, no stones at all
export const STONE_USAGE = Object.freeze({
  USE_SELECTED: 'useSelected',
  OPTIONAL: 'optional',
  NONE: 'none',
});

export const STONE_USAGE_VALUES = Object.freeze(Object.values(STONE_USAGE));

export function isValidStoneUsage(v) {
  return STONE_USAGE_VALUES.includes(v);
}

// Reserved reference KINDS — inert placeholders in Clean 3C (no upload).
export const REFERENCE_KIND = Object.freeze({
  IMAGE: 'image',
  VIDEO: 'video',
  SKETCH: 'sketch',
  MODEL_3D: 'model3d',
  LINK: 'link',
  TEXT: 'text',
});

export const REFERENCE_KIND_VALUES = Object.freeze(
  Object.values(REFERENCE_KIND)
);

// A fresh, empty brief. All optional — the brief never blocks the user.
//
// Clean 5A (Design Core) ADDS fields to the brief — all optional, all
// backward-compatible. Older stored briefs/projects that lack these keys load
// cleanly via normalizeBrief (defaults below). The brief remains the single
// persistence carrier for the design direction, and now also for the generated
// design concepts + the selected one (so they round-trip through Active Work /
// Design Projects with zero changes to the project save mechanism).
export function emptyBrief() {
  return {
    jewelryType: null, // one of JEWELRY_TYPE_VALUES or null (legacy, kept)
    intention: '', // free text (legacy, kept)
    metalPreference: null, // one of METAL_PREFERENCE_VALUES or null
    stylePreference: null, // one of STYLE_PREFERENCE_VALUES or null
    notes: '', // free text
    // reference is RESERVED — not editable in Clean 3C. Kept so the shape is
    // forward-compatible; always an empty list for now.
    references: [],

    // --- Clean 5A — Design Core (all optional, additive) ---
    productType: null, // one of PRODUCT_TYPE_VALUES or null ("מה מעצבים?")
    designGoal: '', // free text — what the piece is for
    styleDirection: null, // one of STYLE_PREFERENCE_VALUES or null
    stoneUsage: null, // one of STONE_USAGE_VALUES or null
    targetClient: '', // free text — target client / occasion
    budgetLevel: '', // PLACEHOLDER only (no pricing) — free text hint
    // Locally-generated design concepts + the selected direction. Concepts are
    // produced by lib/studio/designConcepts.js (pure, local, no AI/network).
    concepts: [], // array of concept objects (see designConcepts.js shape)
    selectedConceptId: null, // id of the chosen concept, or null

    // --- Clean 5B — Practical Output Layer (all optional, additive) ---
    // Structured design outputs (Design Result / Client Preview / Render Brief /
    // internal production summary), produced locally by designOutputs.js. Kept
    // on the brief so they round-trip through Active Work / Design Projects with
    // no competing store. Each output is a flat, Airtable-friendly object.
    designOutputs: [], // array of output objects (see designOutputs.js shape)
    latestOutputId: null, // id of the most recently generated/saved output
    selectedOutputId: null, // id of the explicitly chosen output, or null

    // --- Clean 5B.1 — Flow / stale-state awareness (all optional, additive) ---
    // Deterministic input signature captured WHEN concepts were last generated.
    // If the current inputs no longer match, the concepts are considered stale.
    conceptsSignature: null, // string | null
    // --- Clean 5B.1 — Trend awareness PLACEHOLDER only (future-ready) ---
    // No live trend engine, no web search, no API. These are inert optional
    // fields so future market-aware features can attach context without a
    // schema change. Never fake current trends — empty means "no data".
    trendContext: '', // free text (future "השראת שוק / טרנדים")
    marketNotes: '', // free text (future market notes)

    updatedAt: null,
  };
}

export function isValidJewelryType(v) {
  return JEWELRY_TYPE_VALUES.includes(v);
}
export function isValidMetal(v) {
  return METAL_PREFERENCE_VALUES.includes(v);
}
export function isValidStyle(v) {
  return STYLE_PREFERENCE_VALUES.includes(v);
}

// Defensive normalizer for a single design concept (Clean 5A). Concepts are
// generated locally; this guards anything loaded from storage so the panel
// never crashes on a malformed concept. Shape mirrors designConcepts.js.
export function normalizeConcept(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const id =
    typeof raw.conceptId === 'string' && raw.conceptId
      ? raw.conceptId
      : typeof raw.id === 'string' && raw.id
      ? raw.id
      : null;
  if (!id) return null;
  const str = (v) => (typeof v === 'string' ? v : '');
  return {
    conceptId: id,
    conceptName: str(raw.conceptName),
    shortDescription: str(raw.shortDescription),
    productType: isValidProductType(raw.productType) ? raw.productType : null,
    metalSuggestion: str(raw.metalSuggestion),
    stoneLayout: str(raw.stoneLayout),
    designStructure: str(raw.designStructure),
    recommendedUse: str(raw.recommendedUse),
    productionNotes: str(raw.productionNotes),
    renderBriefText: str(raw.renderBriefText),
    conceptNotes: str(raw.conceptNotes),
  };
}

// ===========================================================================
// Design Output (Clean 5B) — defensive normalizer for a single output object.
// ===========================================================================
// Outputs are generated locally by lib/studio/designOutputs.js. This guards
// anything loaded from storage so the panel never crashes on a malformed
// output. The shape is intentionally FLAT and string/array-based so it can map
// cleanly to a future Airtable table WITHOUT restructuring (Clean 5B keeps the
// system flexible; it does NOT build any Airtable integration).
//
// Schema note (future Airtable mapping — not built now):
//   outputId              -> single line text (external key candidate)
//   outputTitle           -> single line text
//   productType           -> single select (canonical English value)
//   clientFacingTitle     -> single line text
//   clientDescription     -> long text
//   internalDesignSummary -> long text
//   materialsSummary      -> long text
//   stoneSummary          -> long text (empty for metal-only)
//   metalSummary          -> long text
//   renderBrief           -> long text
//   productionNotes       -> long text
//   sourceContext         -> long text (inventory-source awareness; descriptive)
//   assumptions           -> array of long text (missing info / partial parcel)
//   nextSteps             -> array of long text
//   createdAt/updatedAt   -> number (ms epoch); map to date/createdTime later
export function normalizeOutput(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const id =
    typeof raw.outputId === 'string' && raw.outputId
      ? raw.outputId
      : typeof raw.id === 'string' && raw.id
      ? raw.id
      : null;
  if (!id) return null;
  const str = (v) => (typeof v === 'string' ? v : '');
  const list = (v) =>
    Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim()) : [];
  const num = (v) => (typeof v === 'number' ? v : null);
  return {
    outputId: id,
    outputTitle: str(raw.outputTitle),
    productType: isValidProductType(raw.productType) ? raw.productType : null,
    clientFacingTitle: str(raw.clientFacingTitle),
    clientDescription: str(raw.clientDescription),
    internalDesignSummary: str(raw.internalDesignSummary),
    materialsSummary: str(raw.materialsSummary),
    stoneSummary: str(raw.stoneSummary), // '' for metal-only outputs
    metalSummary: str(raw.metalSummary),
    renderBrief: str(raw.renderBrief),
    productionNotes: str(raw.productionNotes),
    // Inventory-source awareness (Clean 5B addendum) — descriptive text only.
    sourceContext: str(raw.sourceContext),
    assumptions: list(raw.assumptions),
    nextSteps: list(raw.nextSteps),
    // Free-text the jeweller can edit after generation (kept additively).
    outputNotes: str(raw.outputNotes),
    // Clean 5B.1 — signature of the inputs+concept this output was built from,
    // used to detect when the output has become stale. Optional/defensive.
    outputSourceSignature: str(raw.outputSourceSignature),
    // Clean 5B.1 — trend placeholder (future-ready; never faked). Optional.
    trendRationale: str(raw.trendRationale),
    createdAt: num(raw.createdAt) != null ? raw.createdAt : Date.now(),
    updatedAt: num(raw.updatedAt) != null ? raw.updatedAt : Date.now(),
  };
}

// Normalize an arbitrary stored object into a well-formed brief (defensive).
export function normalizeBrief(raw) {
  const base = emptyBrief();
  if (!raw || typeof raw !== 'object') return base;
  const concepts = (Array.isArray(raw.concepts) ? raw.concepts : [])
    .map(normalizeConcept)
    .filter(Boolean);
  const selectedConceptId =
    typeof raw.selectedConceptId === 'string' &&
    concepts.some((c) => c.conceptId === raw.selectedConceptId)
      ? raw.selectedConceptId
      : null;
  // --- Clean 5B — design outputs (additive, defensive) ---
  const designOutputs = (Array.isArray(raw.designOutputs) ? raw.designOutputs : [])
    .map(normalizeOutput)
    .filter(Boolean);
  const hasOutput = (id) =>
    typeof id === 'string' && designOutputs.some((o) => o.outputId === id);
  const latestOutputId = hasOutput(raw.latestOutputId)
    ? raw.latestOutputId
    : designOutputs.length
    ? designOutputs[designOutputs.length - 1].outputId
    : null;
  const selectedOutputId = hasOutput(raw.selectedOutputId)
    ? raw.selectedOutputId
    : null;
  return {
    jewelryType: isValidJewelryType(raw.jewelryType) ? raw.jewelryType : null,
    intention: typeof raw.intention === 'string' ? raw.intention : '',
    metalPreference: isValidMetal(raw.metalPreference)
      ? raw.metalPreference
      : null,
    stylePreference: isValidStyle(raw.stylePreference)
      ? raw.stylePreference
      : null,
    notes: typeof raw.notes === 'string' ? raw.notes : '',
    references: Array.isArray(raw.references) ? raw.references : [],

    // --- Clean 5A — Design Core (additive, defaulted) ---
    productType: isValidProductType(raw.productType) ? raw.productType : null,
    designGoal: typeof raw.designGoal === 'string' ? raw.designGoal : '',
    styleDirection: isValidStyle(raw.styleDirection) ? raw.styleDirection : null,
    stoneUsage: isValidStoneUsage(raw.stoneUsage) ? raw.stoneUsage : null,
    targetClient: typeof raw.targetClient === 'string' ? raw.targetClient : '',
    budgetLevel: typeof raw.budgetLevel === 'string' ? raw.budgetLevel : '',
    concepts,
    selectedConceptId,

    // --- Clean 5B — Practical Output Layer (additive, defaulted) ---
    designOutputs,
    latestOutputId,
    selectedOutputId,

    // --- Clean 5B.1 — Flow / stale awareness + trend placeholders ---
    conceptsSignature:
      typeof raw.conceptsSignature === 'string' ? raw.conceptsSignature : null,
    trendContext: typeof raw.trendContext === 'string' ? raw.trendContext : '',
    marketNotes: typeof raw.marketNotes === 'string' ? raw.marketNotes : '',

    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : null,
  };
}

// True once the jeweller has entered ANY brief content (used for status).
// Clean 5A: also counts the Design Core fields and any generated/selected
// concept, so a metal-only brief (no stone, no jewelryType) still registers.
export function briefHasContent(brief) {
  const b = normalizeBrief(brief);
  return Boolean(
    b.jewelryType ||
      (b.intention && b.intention.trim()) ||
      b.metalPreference ||
      b.stylePreference ||
      (b.notes && b.notes.trim()) ||
      b.productType ||
      (b.designGoal && b.designGoal.trim()) ||
      b.styleDirection ||
      b.stoneUsage ||
      (b.targetClient && b.targetClient.trim()) ||
      (Array.isArray(b.concepts) && b.concepts.length > 0) ||
      b.selectedConceptId ||
      (Array.isArray(b.designOutputs) && b.designOutputs.length > 0)
  );
}

// Return the selected concept object for a brief, or null. Pure helper.
export function getSelectedConcept(brief) {
  const b = normalizeBrief(brief);
  if (!b.selectedConceptId) return null;
  return b.concepts.find((c) => c.conceptId === b.selectedConceptId) || null;
}

// ---------------------------------------------------------------------------
// Clean 5B — design output accessors (pure helpers)
// ---------------------------------------------------------------------------
// Prefer the explicitly selected output, then the latest, then the last in the
// list. Returns a single output object or null.
export function getActiveOutput(brief) {
  const b = normalizeBrief(brief);
  const outs = Array.isArray(b.designOutputs) ? b.designOutputs : [];
  if (!outs.length) return null;
  if (b.selectedOutputId) {
    const sel = outs.find((o) => o.outputId === b.selectedOutputId);
    if (sel) return sel;
  }
  if (b.latestOutputId) {
    const latest = outs.find((o) => o.outputId === b.latestOutputId);
    if (latest) return latest;
  }
  return outs[outs.length - 1];
}

// Back-compat-friendly aliases for callers that prefer explicit names.
export function getLatestOutput(brief) {
  const b = normalizeBrief(brief);
  const outs = Array.isArray(b.designOutputs) ? b.designOutputs : [];
  if (!outs.length) return null;
  if (b.latestOutputId) {
    const latest = outs.find((o) => o.outputId === b.latestOutputId);
    if (latest) return latest;
  }
  return outs[outs.length - 1];
}

// ===========================================================================
// Clean 5B.1 — Stale-state signatures (pure, deterministic)
// ===========================================================================
// Simple, deterministic signatures so the UI can tell when previously
// generated concepts / outputs no longer match the current inputs. These are
// intentionally lightweight strings — NOT hashing, NOT versioning, just a
// stable join of the key inputs. No randomness, no network.

// A stable, order-independent fingerprint of the tray items that matter to a
// design: each item's id, display title and role. Sorted so re-ordering the
// tray does not, by itself, look like a change.
function traySignature(trayItems) {
  const items = Array.isArray(trayItems) ? trayItems : [];
  return items
    .map((it) => {
      if (!it || typeof it !== 'object') return '';
      const id = typeof it.id === 'string' ? it.id : '';
      const role = typeof it.role === 'string' ? it.role : 'unassigned';
      const title = trayItemTitle(it) || '';
      return `${id}:${role}:${title}`;
    })
    .filter(Boolean)
    .sort()
    .join('|');
}

// The signature of the inputs that drive CONCEPT generation. If any of these
// change after concepts were generated, the concepts are considered stale.
export function computeInputSignature(brief, trayItems) {
  const b = normalizeBrief(brief);
  const parts = [
    `pt=${b.productType || ''}`,
    `style=${b.styleDirection || ''}`,
    `metal=${b.metalPreference || ''}`,
    `usage=${b.stoneUsage || ''}`,
    `goal=${(b.designGoal || '').trim()}`,
    `tray=${traySignature(trayItems)}`,
  ];
  return parts.join('||');
}

// The signature of the inputs that drive an OUTPUT: the concept-input signature
// PLUS the selected concept id. If the selected concept changes (or any input
// changes) after an output was generated, that output is considered stale.
export function computeOutputSignature(brief, trayItems) {
  const b = normalizeBrief(brief);
  return `${computeInputSignature(b, trayItems)}||concept=${b.selectedConceptId || ''}`;
}

// True when concepts exist but the current inputs no longer match the signature
// captured at generation time. If no concepts or no stored signature, not stale.
export function conceptsAreStale(brief, trayItems) {
  const b = normalizeBrief(brief);
  if (!Array.isArray(b.concepts) || b.concepts.length === 0) return false;
  if (!b.conceptsSignature) return false; // legacy concepts: don't nag
  return b.conceptsSignature !== computeInputSignature(b, trayItems);
}

// True when an active output exists but was generated from a different concept
// or different inputs than the current ones.
export function outputIsStale(brief, trayItems) {
  const b = normalizeBrief(brief);
  const out = getActiveOutput(b);
  if (!out) return false;
  if (!out.outputSourceSignature) return false; // legacy output: don't nag
  return out.outputSourceSignature !== computeOutputSignature(b, trayItems);
}

// Honest three-state brief status for the UI:
//   'temporary' — nothing entered yet (the brief is just a blank draft)
//   'draft'     — some content entered, but persistence is local only
//   'saved'     — a local draft has been explicitly committed (updatedAt set)
// NOTE: 'saved' means saved LOCALLY (localStorage). It never implies Airtable.
export function briefStatus(brief) {
  const b = normalizeBrief(brief);
  if (!briefHasContent(b)) return { key: 'temporary', tone: 'neutral' };
  if (b.updatedAt) return { key: 'saved', tone: 'ready' };
  return { key: 'draft', tone: 'pending' };
}

// ===========================================================================
// Design Snapshot (Clean 3D)
// ===========================================================================
// A pure, display-only view-model that combines the current tray (stones +
// roles) with the design brief into ONE internal summary for the Design
// Snapshot panel. No network, no Airtable, no persistence here — callers pass
// in the already-loaded trayItems + brief.
//
// Grouping reuses buildDesignGroups, so the same guarantees hold:
//   • CENTER STONE stays as INDIVIDUAL groups (never merged to a count).
//   • SIDE / ACCENT / PARCEL / COMPONENT / REFERENCE are combined groups whose
//     underlying items remain distinct and individually addressable.
//
// Snapshot status (stone-first, then brief), in priority order:
//   • no center stone            → 'missingCenter'  (tone neutral/pending)
//   • center + brief has type or
//     intention, not yet saved    → 'ready'          (tone ready)
//   • center + brief saved locally
//     and no edits since          → 'savedLocal'     (tone ready)
//   • center exists but brief has
//     no type/intention yet        → 'draft'          (tone pending)
// Editing the brief clears updatedAt (see designBriefStore.updateBrief), so a
// saved snapshot returns to 'ready'/'draft' automatically on the next edit.

export function buildDesignSnapshot(trayItems, brief) {
  const items = Array.isArray(trayItems) ? trayItems : [];
  const groups = buildDesignGroups(items);
  const summary = summarizeDraft(items);
  const b = normalizeBrief(brief);

  const hasCenter = summary.centerStoneCount > 0;
  const hasBriefContent = briefHasContent(b);
  const canProceedWithoutCenter = Boolean(
    hasBriefContent &&
      (b.stoneUsage === STONE_USAGE.NONE || isMetalOnlyProductType(b.productType) || b.productType)
  );
  const briefHasDirection = Boolean(
    b.jewelryType ||
      (b.intention && b.intention.trim()) ||
      b.productType ||
      (b.designGoal && b.designGoal.trim()) ||
      b.selectedConceptId
  );
  const savedLocally = Boolean(b.updatedAt);

  let status;
  if (!hasCenter && !canProceedWithoutCenter) {
    status = { key: 'missingCenter', tone: 'pending' };
  } else if (savedLocally) {
    status = { key: 'savedLocal', tone: 'ready' };
  } else if (briefHasDirection || canProceedWithoutCenter) {
    status = { key: 'ready', tone: 'ready' };
  } else {
    status = { key: 'draft', tone: 'pending' };
  }

  return {
    groups, // ordered role groups (center = individual groups)
    summary, // per-role counts (+ readyToBegin)
    brief: b, // normalized brief
    hasCenter,
    briefHasDirection,
    canProceedWithoutCenter,
    savedLocally,
    status,
  };
}
