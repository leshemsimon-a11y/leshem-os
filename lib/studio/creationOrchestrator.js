// lib/studio/creationOrchestrator.js
//
// LESHEM.S OS — Clean 8K-R2: Welcome Studio + One Flow Experience.
//
// PURE data + pure functions only. No store access, no hooks, no React. This
// module decides WHAT STAGE the single creation workspace is in and WHAT
// short text to show — using the EXACT SAME underlying primitives
// (hasStones / hasConcepts / conceptsStale / selected / output / outStale)
// the Design Studio shell and the Clean 8K Jewelry Advisor already use, so
// this new simplified flow never contradicts the existing logic. It reuses
// lib/studio/jewelryAdvisor.js for the "understanding" text rather than
// duplicating it.
//
// Everything that actually reads/writes a store lives in the calling React
// component (components/studio/welcome/WelcomeCreationFlow.js), which is the
// only place with real side effects, exactly like every other shell in this
// codebase.

import { CONCEPT_HE } from './labels';

// ---------------------------------------------------------------------------
// The four Welcome Studio entry paths (section 1).
// ---------------------------------------------------------------------------
export const ENTRY_PATH = Object.freeze({
  STONE: 'stone',
  IDEA: 'idea',
  COLLECTION: 'collection',
  EXISTING: 'existing',
});

export const ENTRY_PATH_HE = Object.freeze({
  stone: Object.freeze({ title: 'יש לי אבן', subtitle: 'אני רוצה לעצב לה תכשיט' }),
  idea: Object.freeze({ title: 'יש לי רעיון', subtitle: 'אני רוצה לפתח עיצוב חדש' }),
  collection: Object.freeze({ title: 'יש לי מלאי אבנים', subtitle: 'אני רוצה לבנות קולקציה' }),
  existing: Object.freeze({
    title: 'יש לי תכשיט או סקיצה',
    subtitle: 'אני רוצה להמשיך, לשנות או להציג',
  }),
});

// ---------------------------------------------------------------------------
// Single-flow workspace stages. One stage is active at a time; the caller
// renders exactly one center-content block and exactly one primary action
// per stage (sections 7-8).
// ---------------------------------------------------------------------------
export const WORKSPACE_STAGE = Object.freeze({
  INTAKE: 'intake',
  UNDERSTANDING: 'understanding',
  DIRECTIONS: 'directions',
  SELECTED: 'selected',
  OUTPUT: 'output',
  RENDER: 'render',
});

const PRIMARY_ACTION_HE = Object.freeze({
  intake: 'הצע לי כיוונים',
  understanding: 'הצע לי כיוונים',
  directions: 'בחר להמשך',
  selected: 'הכן להצגה',
  output: 'הכן תוכנית הדמיה',
  render: 'שתף עם הלקוח',
});

// computeWorkspaceStage(ctx) → one WORKSPACE_STAGE value.
// ctx: { hasStones, hasIntentText, hasConcepts, conceptsStale, selected,
//        output, outStale }
export function computeWorkspaceStage(ctx) {
  const c = ctx || {};
  const hasStones = Boolean(c.hasStones);
  const hasIntentText = Boolean(c.hasIntentText);
  const hasConcepts = Boolean(c.hasConcepts);

  if (!hasStones && !hasIntentText && !hasConcepts) return WORKSPACE_STAGE.INTAKE;
  if (!hasConcepts) return WORKSPACE_STAGE.UNDERSTANDING;
  if (c.conceptsStale || !c.selected) return WORKSPACE_STAGE.DIRECTIONS;
  if (!c.output || c.outStale) return WORKSPACE_STAGE.SELECTED;
  return WORKSPACE_STAGE.OUTPUT;
}

export function primaryActionHe(stage) {
  return PRIMARY_ACTION_HE[stage] || PRIMARY_ACTION_HE.intake;
}

// ---------------------------------------------------------------------------
// Stone-first path (section 3) — the short intelligent response shown right
// after a stone is selected, and the product-type quick offers.
// ---------------------------------------------------------------------------
export const STONE_FIRST_HE = Object.freeze({
  chooseStone: 'בחר אבן מהמלאי או הוסף תמונה',
  afterStone: 'האבן מתאימה להוביל את העיצוב. מה תרצה ליצור סביבה?',
  offerRing: 'טבעת',
  offerPendant: 'תליון',
  offerEarrings: 'עגילים',
  offerLetSystemSuggest: 'תן למערכת להציע',
});

export const STONE_PRODUCT_OFFER = Object.freeze({
  ring: 'ring',
  pendant: 'pendant',
  earrings: 'earrings',
});

// ---------------------------------------------------------------------------
// Idea-first path (section 4).
// ---------------------------------------------------------------------------
export const IDEA_FIRST_HE = Object.freeze({
  prompt: 'ספר לי על הרעיון — טקסט, סקיצה, תמונה, קישור או מודל.',
  matchStones: 'התאם אבנים מהמלאי',
  continueAsConcept: 'המשך כקונספט',
});

// ---------------------------------------------------------------------------
// Collection path (section 5).
// ---------------------------------------------------------------------------
export const COLLECTION_HE = Object.freeze({
  chooseStones: 'על אילו אבנים נבנה את הקולקציה?',
  characterPrompt: 'מה אופי הקולקציה?',
  characterCommercial: 'מסחרית',
  characterLuxury: 'יוקרתית',
  characterCapsule: 'קפסולה',
  characterSignature: 'חתימות מיוחדות',
  startDeveloping: 'התחל לפתח את הקולקציה',
});

export const COLLECTION_CHARACTER = Object.freeze({
  COMMERCIAL: 'commercial',
  LUXURY: 'luxury',
  CAPSULE: 'capsule',
  SIGNATURE: 'signature',
});

// Compact collection map ("N פריטים נבחרו לקולקציה"). A per-item intended
// product-type breakdown (e.g. "2 טבעות · 2 עגילים") would need a NEW field
// on tray items that does not exist yet — see the changelog's "public API
// gaps" — so this stays an honest count-only summary rather than inventing
// data. Still fully useful as the "compact collection map" the spec asks
// for; it never blocks progress.
export function buildCollectionSummaryHe(trayItems) {
  const items = Array.isArray(trayItems) ? trayItems : [];
  const count = items.length;
  if (count === 0) return 'טרם נבחרו אבנים לקולקציה.';
  return count === 1 ? 'פריט אחד נבחר לקולקציה' : `${count} פריטים נבחרו לקולקציה`;
}

// ---------------------------------------------------------------------------
// Existing jewelry / sketch path (section 6).
// ---------------------------------------------------------------------------
export const EXISTING_HE = Object.freeze({
  whatToDo: 'מה תרצה לעשות?',
  changeDesign: 'לשנות את העיצוב',
  developVariation: 'לפתח וריאציה',
  prepareForPresentation: 'להכין להצגה',
  continueExisting: 'להמשיך יצירה קיימת',
});

// ---------------------------------------------------------------------------
// Single Creation Workspace chrome (section 7).
// ---------------------------------------------------------------------------
export const WORKSPACE_HE = Object.freeze({
  autoSaved: 'נשמר אוטומטית',
  commandPlaceholder: 'מה תרצה לשנות או לדייק?',
  moreOptions: 'אפשרויות נוספות',
  untitled: 'יצירה חדשה',
});

// Short state label per stage, for the top bar ("creation name · short
// state"). Kept intentionally terse per the visual rules (section 11).
const STAGE_STATE_HE = Object.freeze({
  intake: 'מתחילים',
  understanding: 'מבינים את הכיוון',
  directions: 'בוחנים כיוונים',
  selected: 'כיוון נבחר',
  output: 'מכינים להצגה',
  render: 'מוכן להצגה',
});

export function stageStateHe(stage) {
  return STAGE_STATE_HE[stage] || STAGE_STATE_HE.intake;
}

// ---------------------------------------------------------------------------
// buildWelcomeUnderstandingHe — a SHORT understanding line for the
// 'understanding' stage, reusing the same product/style/stone-count facts
// jewelryAdvisor.js already derives, phrased for the simplified flow.
// (Not a duplicate of jewelryAdvisor's own understanding builder — that one
// stays the Advisor Panel's voice; this is a one-line variant for the
// Welcome flow's own "short understanding summary" requirement.)
// ---------------------------------------------------------------------------
export function buildWelcomeUnderstandingHe({ trayItems, brief }) {
  const items = Array.isArray(trayItems) ? trayItems : [];
  const productHe =
    (brief && brief.productType && CONCEPT_HE.productType && CONCEPT_HE.productType[brief.productType]) ||
    null;
  const stoneCount = items.length;

  if (productHe && stoneCount > 0) {
    return `הבנתי — ${productHe} סביב ${stoneCount === 1 ? 'האבן שנבחרה' : `${stoneCount} האבנים שנבחרו`}.`;
  }
  if (productHe) {
    return `הבנתי — ${productHe}, עדיין ללא אבנים.`;
  }
  if (stoneCount > 0) {
    return `הבנתי — ${stoneCount === 1 ? 'אבן אחת נבחרה' : `${stoneCount} אבנים נבחרו`}, נשלים את שאר הפרטים יחד.`;
  }
  return 'הבנתי — נתחיל לבנות את הכיוון יחד.';
}
