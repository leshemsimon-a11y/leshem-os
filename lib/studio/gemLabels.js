// lib/studio/gemLabels.js
//
// LESHEM.S OS — Terminology & Microcopy QA Pass.
//
// ONE centralized place for professional Hebrew display labels for
// gemstone shapes, stone types, and treatments — so future code has an
// authoritative source instead of improvising a translation inline (which is
// how "אגס"/"כרית" ended up hardcoded as display text in the first place).
//
// Display labels only. These functions never read or write any store, never
// touch Airtable, and never change a stored/canonical English value — they
// take a canonical English value (or, for getTreatmentLabel, a free-text
// description) and return the correct professional Hebrew term for display.
//
// getStatusLabel / getSourceTypeLabel are re-exported from
// lib/studio/demoInventoryLayer.js rather than reimplemented here, per
// "do not duplicate inconsistent labels across components" — that file
// already owns those two mappings (now corrected) and ~4 other files already
// import them from there; this just gives them a second, discoverable name
// alongside the new shape/stoneType/treatment helpers.

import { getStatusLabelHe, getSourceLabelHe, getSourceContextBadge } from './demoInventoryLayer';

// ---- Gemstone shapes — canonical English -> professional Hebrew term ----
const SHAPE_HE = {
  'Round Brilliant': 'עגול בריליאנט',
  Round: 'עגול',
  Oval: 'אובלי',
  Pear: 'טיפה',
  'Emerald Cut': 'אמרלד קאט',
  Cushion: 'קושן',
  Princess: 'פרינסס',
  Marquise: 'מרקיזה',
  Baguette: 'בגט',
  Radiant: 'רדיאנט',
  Asscher: 'אשר',
  Heart: 'לב',
  Trillion: 'טריליון',
};

// ---- Stone types — canonical English -> professional Hebrew term ----
const STONE_TYPE_HE = {
  Diamond: 'יהלום',
  Emerald: 'אמרלד',
  Ruby: 'רובי',
  Sapphire: 'ספיר',
  'Blue Sapphire': 'ספיר כחול',
  'Paraiba Tourmaline': 'טורמלין פאראיבה',
  Tourmaline: 'טורמלין',
  Tanzanite: 'טנזניט',
  Spinel: 'ספינל',
  Opal: 'אופל',
};

// ---- Treatments — free-text description -> professional Hebrew term ----
// The underlying `treatment` field in the demo data is a free-text
// description (e.g. "Minor oil / demo assumption"), not a clean enum, so
// this is a best-effort keyword classifier rather than an exact lookup.
// Order matters: the negative/uncertain cases are checked before the
// positive ones, because e.g. "unheated" contains the substring "heated"
// and "Heat unknown" contains the substring "heat" — checking the specific,
// negating phrase first avoids inverting the meaning.
const TREATMENT_HE = {
  none: 'ללא טיפול',
  untreated: 'ללא טיפול',
  unheated: 'לא מחומם',
  heated: 'מחומם',
  treated: 'מטופל',
  unknown: 'לא ידוע',
};

export function getShapeLabel(shape) {
  if (!shape || typeof shape !== 'string') return null;
  const key = shape.trim();
  return SHAPE_HE[key] || key;
}

export function getStoneTypeLabel(stoneType) {
  if (!stoneType || typeof stoneType !== 'string') return null;
  const key = stoneType.trim();
  return STONE_TYPE_HE[key] || key;
}

export function getTreatmentLabel(treatment) {
  if (!treatment || typeof treatment !== 'string') return TREATMENT_HE.unknown;
  const t = treatment.trim().toLowerCase();
  if (!t) return TREATMENT_HE.unknown;
  if (t.includes('unknown')) return TREATMENT_HE.unknown;
  if (t === 'none' || t.startsWith('none')) return TREATMENT_HE.none;
  if (t.includes('unheated')) return TREATMENT_HE.unheated;
  if (t.includes('untreated')) return TREATMENT_HE.untreated;
  if (t.includes('heat')) return TREATMENT_HE.heated;
  if (
    t.includes('treated') ||
    t.includes('oil') ||
    t.includes('copper') ||
    t.includes('fill') ||
    t.includes('irradiat') ||
    t.includes('diffus')
  ) {
    return TREATMENT_HE.treated;
  }
  return TREATMENT_HE.unknown;
}

// Re-exported, not reimplemented — see file header.
export { getStatusLabelHe as getStatusLabel, getSourceLabelHe as getSourceTypeLabel, getSourceContextBadge };
