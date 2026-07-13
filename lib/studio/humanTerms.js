// lib/studio/humanTerms.js
//
// LESHEM.S OS — Clean 8K: Human Jewelry Intelligence + Visual Workspace
// Consolidation.
//
// PURE data + pure functions only. Visible-terminology constants and short
// jewelry-aware feedback phrase builders for the new components this
// milestone adds (Advisor Panel, Smart Command Bar, Creative Area Rail) and
// for the small, surgical copy edits made in already-shipped files.
//
// Internal code names, store field names, route paths, and data structures
// are UNCHANGED — this file only supplies display strings. Nothing here
// reads or writes any store; every function is a pure string transform.

// ---------------------------------------------------------------------------
// Primary visible terms (Clean 8K section 1).
// ---------------------------------------------------------------------------
export const TERM = Object.freeze({
  activeWorkFile: 'היצירה הפעילה',
  workFiles: 'תיקי יצירה',
  workFile: 'תיק יצירה',
  assets: 'חומרי עבודה',
  references: 'השראה ורפרנסים',
  outputPack: 'ערכת הצגה',
  mediaWorkflow: 'הדמיות ותצוגה',
  renderPlan: 'תוכנית הדמיה',
});

// ---------------------------------------------------------------------------
// Creative-area rail (Clean 8K section 2) — short labels + tooltips for the
// 5 main creative areas. Icons live in components/studio/shared/
// CreativeAreaRail.js (inline SVG; no icon package).
// ---------------------------------------------------------------------------
export const CREATIVE_AREA = Object.freeze({
  STONES: 'stones',
  REFERENCES: 'references',
  DIRECTIONS: 'directions',
  RENDER: 'render',
  PRESENTATION: 'presentation',
});

export const CREATIVE_AREA_HE = Object.freeze({
  stones: Object.freeze({ label: 'אבנים', tooltip: 'אבני העבודה בתיק היצירה' }),
  references: Object.freeze({ label: 'השראה', tooltip: 'השראה ורפרנסים לעיצוב' }),
  directions: Object.freeze({ label: 'כיוונים', tooltip: 'כיווני עיצוב מוצעים' }),
  render: Object.freeze({ label: 'הדמיה', tooltip: 'סטודיו הדמיות ותוכנית הדמיה' }),
  presentation: Object.freeze({ label: 'הצגה', tooltip: 'ערכת הצגה ללקוח' }),
});

// ---------------------------------------------------------------------------
// Progressive disclosure — the one recurring label for secondary actions.
// (This exact string already exists in components/studio/create/
// CreateFlowShell.js as CREATE_HE.moreOptions; kept identical here so both
// surfaces read as the same product concept, not two different phrases.)
// ---------------------------------------------------------------------------
export const MORE_OPTIONS_HE = 'אפשרויות נוספות';

// ---------------------------------------------------------------------------
// Section 6 — terminology / microcopy pass. Small helper so every touched
// file applies the SAME preferred phrase for a given old phrase, rather than
// each file inventing its own wording.
// ---------------------------------------------------------------------------
export const MICROCOPY_HE = Object.freeze({
  suggestDirections: 'הצע כיוונים',
  suggestDirectionsAgain: 'הצע כיוונים מחדש',
  selectToContinue: 'בחר להמשך',
  saveToWorkFile: 'שמור בתיק היצירה',
  saveAsWorkFile: 'שמור כתיק יצירה',
  closeActiveWorkFile: 'סגור את היצירה הפעילה',
  openPresentationPack: 'ערכת הצגה',
  openMediaWorkflow: 'הדמיות ותצוגה',
  workMaterialsAndInspiration: 'חומרי עבודה והשראה',
});

// ---------------------------------------------------------------------------
// Section 7 — meaningful, jewelry-aware feedback (pure string builders; no
// store access). Each function degrades gracefully for the empty/partial
// case so it never reads as a dry, generic message.
// ---------------------------------------------------------------------------
export function stonesFeedbackHe(stoneCount) {
  if (!stoneCount || stoneCount <= 0) {
    return 'עדיין לא נבחרו אבנים — אפשר להתחיל גם ממתכת בלבד.';
  }
  if (stoneCount === 1) {
    return 'האבן שנבחרה מהווה בסיס טוב להתחיל ממנו.';
  }
  if (stoneCount === 2) {
    return 'שתי האבנים יוצרות זוגיות שאפשר לבנות סביבה קומפוזיציה.';
  }
  return 'האבנים יוצרות בסיס טוב לקומפוזיציה של כמה אבנים.';
}

export function metalFeedbackHe(metalHe) {
  if (!metalHe) {
    return 'עדיין לא בחרנו מתכת. אפשר להמשיך ולדייק אותה בהמשך.';
  }
  return `נבחרה ${metalHe} — התאמה שתלווה את שאר ההחלטות בעיצוב.`;
}

export function referenceFeedbackHe() {
  return 'הרפרנס נקלט וישמש כהשראה לשפה העיצובית.';
}

export function directionsFeedbackHe(count) {
  if (!count || count <= 0) {
    return 'עדיין לא הופקו כיווני עיצוב.';
  }
  if (count === 1) {
    return 'הכנתי כיוון עיצוב אחד שמתייחס לאבנים ולבקשה שלך.';
  }
  return `הכנתי ${count} כיווני עיצוב שמתייחסים לאבנים ולבקשה שלך.`;
}
