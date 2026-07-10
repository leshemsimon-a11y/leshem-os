// lib/studio/outputPack.js
//
// LESHEM.S OS — Clean 7A: Work File Backbone MVP — Output Pack helper.
//
// Pure formatting: builds a text-based Output Pack from an EXISTING saved
// Design Project (Work File). No storage, no persistence, no network, no
// image generation — structured text only, derived from data the project
// already holds. Reads ONLY public exports (labels + designDraft helpers).
//
// Language rules (strict):
//   • professionalHe / clientHe — Hebrew, app-facing.
//   • mediaPromptEn — ENGLISH ONLY, built exclusively from canonical English
//     enum values and ASCII-safe stone fields. Hebrew values are NEVER mixed
//     into the English prompt (non-ASCII fields are filtered out).

import { CONCEPT_HE, BRIEF_HE } from './labels';
import { getSelectedConcept, getActiveOutput, normalizeRole } from './designDraft';

// ---------------------------------------------------------------------------
// English maps for canonical enum values (prompt-side only). Internal code
// values are already canonical English — these expand them to natural words.
// ---------------------------------------------------------------------------
const PRODUCT_EN = Object.freeze({
  ring: 'ring',
  engagementRing: 'engagement ring',
  weddingBand: 'wedding band',
  pendant: 'pendant',
  necklace: 'necklace',
  earrings: 'pair of earrings',
  bracelet: 'bracelet',
  matchingPiece: 'matching jewelry piece',
  noStones: 'metal jewelry piece without stones',
  other: 'jewelry piece',
});

const STYLE_EN = Object.freeze({
  classic: 'classic',
  modern: 'modern',
  vintage: 'vintage-inspired',
  minimal: 'minimalist',
  statement: 'bold statement',
  luxury: 'luxurious high-end',
  delicate: 'delicate refined',
  halo: 'halo-set',
  solitaire: 'solitaire',
  threeStone: 'three-stone',
  tennis: 'tennis-style',
  custom: 'custom-designed',
});

const METAL_EN = Object.freeze({
  yellowGold: '18k yellow gold',
  whiteGold: '18k white gold',
  roseGold: '18k rose gold',
  platinum: 'platinum',
  silver: 'sterling silver',
});

const SHAPE_EN = Object.freeze({
  round: 'round brilliant',
  oval: 'oval',
  cushion: 'cushion',
  princess: 'princess',
  emerald: 'emerald-cut',
  pear: 'pear',
  marquise: 'marquise',
  radiant: 'radiant',
  asscher: 'asscher',
  heart: 'heart',
});

const ROLE_EN = Object.freeze({
  centerStone: 'center stone',
  sideStone: 'side stone',
  accentStone: 'accent stone',
});

// Hebrew fallbacks for missing values.
const HE = Object.freeze({
  notChosen: 'טרם נבחר',
  noDirection: 'טרם נבחר כיוון עיצוב',
  outputReady: 'קיים בריף פלט לתיק זה',
  outputMissing: 'טרם הופק בריף פלט לתיק זה',
  noStones: 'אין אבנים שמורות בתיק זה',
  refsTitle: 'רפרנסים',
  refsEmpty: 'עדיין לא נוספו רפרנסים לתיק זה',
  refsLinkedFiles: (n) => `${n} קבצים מקושרים לתיק`,
});

const asciiOnly = (v) => typeof v === 'string' && v.trim() !== '' && /^[\x20-\x7E]+$/.test(v.trim());

const heLabel = (map, value) => (value && map && map[value]) || null;

function stoneLinesHe(trayItems) {
  const items = Array.isArray(trayItems) ? trayItems : [];
  return items
    .map((it) => {
      const s = (it && it.snapshot) || {};
      const role = CONCEPT_HE.roleLabels[normalizeRole(it.role)] || CONCEPT_HE.roleLabels.unassigned;
      const parts = [s.name, s.shapeHe, s.caratWeight ? `${s.caratWeight} קראט` : null].filter(Boolean);
      return `• ${role}: ${parts.length ? parts.join(', ') : '—'}`;
    })
    .filter(Boolean);
}

function stonePhrasesEn(trayItems) {
  const items = Array.isArray(trayItems) ? trayItems : [];
  return items
    .map((it) => {
      const s = (it && it.snapshot) || {};
      const role = ROLE_EN[normalizeRole(it.role)] || 'stone';
      const shape = (s.shape && SHAPE_EN[s.shape]) || (asciiOnly(s.shape) ? s.shape : null);
      const type = asciiOnly(s.stoneType) ? s.stoneType.toLowerCase() : 'gemstone';
      const carat = s.caratWeight ? `${s.caratWeight} ct` : null;
      const color = asciiOnly(s.color) ? `${s.color} color` : null;
      const bits = [carat, shape, type, `as ${role}`, color ? `(${color})` : null].filter(Boolean);
      return bits.join(' ');
    })
    .filter((p) => p && p.trim() !== '');
}

// ---------------------------------------------------------------------------
// buildOutputPack(project) → { professionalHe, mediaPromptEn, clientHe,
//                              references: { linkedFilesCount, text } }
// ---------------------------------------------------------------------------
export function buildOutputPack(project) {
  const p = project || {};
  const brief = p.brief || {};
  const trayItems = Array.isArray(p.trayItems) ? p.trayItems : [];
  const selected = getSelectedConcept(brief);
  const output = getActiveOutput(brief);

  const productHe = heLabel(CONCEPT_HE.productType, brief.productType) || HE.notChosen;
  const styleHe = heLabel(BRIEF_HE.style, brief.styleDirection) || HE.notChosen;
  const metalHe = heLabel(BRIEF_HE.metal, brief.metalPreference) || HE.notChosen;

  // -------------------------------------------------------------------
  // A. Professional summary — Hebrew.
  // -------------------------------------------------------------------
  const stonesHe = stoneLinesHe(trayItems);
  const profLines = [
    `סיכום מקצועי — ${p.name || 'תיק עיצוב'}`,
    '',
    `תכשיט: ${productHe}`,
    `סגנון: ${styleHe} · מתכת: ${metalHe}`,
    '',
    'אבנים ופריטים:',
    ...(stonesHe.length ? stonesHe : [`• ${HE.noStones}`]),
    '',
    selected
      ? `כיוון נבחר: ${selected.conceptName}${selected.shortDescription ? ` — ${selected.shortDescription}` : ''}`
      : `כיוון נבחר: ${HE.noDirection}`,
  ];
  if (selected && selected.stoneLayout) profLines.push(`שיבוץ: ${selected.stoneLayout}`);
  if (brief.designGoal && String(brief.designGoal).trim()) {
    profLines.push('', `הערות עיצוב: ${String(brief.designGoal).trim()}`);
  }
  if (selected && selected.conceptNotes && String(selected.conceptNotes).trim()) {
    profLines.push(`הערות לכיוון: ${String(selected.conceptNotes).trim()}`);
  }
  profLines.push('', `סטטוס פלט: ${output ? HE.outputReady : HE.outputMissing}`);

  // -------------------------------------------------------------------
  // B. Media prompt — ENGLISH ONLY (canonical values + ASCII-safe fields).
  // -------------------------------------------------------------------
  const productEn = PRODUCT_EN[brief.productType] || 'jewelry piece';
  const styleEn = STYLE_EN[brief.styleDirection] || null;
  const metalEn = METAL_EN[brief.metalPreference] || 'precious metal';
  const stonesEn = stonePhrasesEn(trayItems);
  const promptLines = [
    `Professional jewelry visualization: a ${[styleEn, productEn].filter(Boolean).join(' ')} crafted in ${metalEn}.`,
  ];
  if (stonesEn.length) {
    promptLines.push(`Featuring ${stonesEn.join('; ')}.`);
  } else if (brief.productType === 'noStones') {
    promptLines.push('Metal-only design with no stones, focused on form and surface finish.');
  }
  promptLines.push(
    'Elegant studio product photography, soft neutral background, precise macro detail, realistic reflections and materials, high resolution.'
  );

  // -------------------------------------------------------------------
  // C. Client-facing short description — Hebrew, polished.
  // -------------------------------------------------------------------
  const firstStone = trayItems.length ? (trayItems[0].snapshot || {}) : null;
  const clientParts = [];
  clientParts.push(
    brief.productType && CONCEPT_HE.productType[brief.productType]
      ? `${CONCEPT_HE.productType[brief.productType]} בעיצוב אישי`
      : 'תכשיט בעיצוב אישי'
  );
  if (brief.styleDirection && BRIEF_HE.style[brief.styleDirection]) {
    clientParts.push(`בקו ${BRIEF_HE.style[brief.styleDirection]}`);
  }
  if (brief.metalPreference && BRIEF_HE.metal[brief.metalPreference]) {
    clientParts.push(`ב${BRIEF_HE.metal[brief.metalPreference]}`);
  }
  let clientHe = `${clientParts.join(' ')}.`;
  if (firstStone && firstStone.name) {
    const stoneBits = [firstStone.name, firstStone.shapeHe, firstStone.caratWeight ? `${firstStone.caratWeight} קראט` : null]
      .filter(Boolean)
      .join(', ');
    clientHe += ` במרכז העיצוב: ${stoneBits}.`;
  }
  if (selected && selected.conceptName) {
    clientHe += ` הכיוון הנבחר — ${selected.conceptName}.`;
  }
  clientHe += ' העבודה מלווה באופן אישי משלב הרעיון ועד הביצוע.';

  // -------------------------------------------------------------------
  // References — display existing linkage counts if present, else placeholder
  // (no schema change; upload is NOT part of this milestone).
  // -------------------------------------------------------------------
  const linkedFilesCount = Array.isArray(p.linkedAssetFileIds) ? p.linkedAssetFileIds.length : 0;
  const references = {
    linkedFilesCount,
    title: HE.refsTitle,
    text: linkedFilesCount > 0 ? HE.refsLinkedFiles(linkedFilesCount) : HE.refsEmpty,
  };

  return {
    professionalHe: profLines.join('\n'),
    mediaPromptEn: promptLines.join('\n'),
    clientHe,
    references,
  };
}
