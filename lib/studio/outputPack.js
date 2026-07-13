// lib/studio/outputPack.js
//
// LESHEM.S OS — Clean 7A: Work File Backbone MVP — Output Pack helper.
// Clean 8D — Output Pack Pro + Media Prep: additive upgrade to a full
// professional output package (extra prompts + production notes + asset
// view). Existing return fields keep their names and meaning.
//
// Pure formatting: builds a text-based Output Pack from an EXISTING saved
// Design Project (Work File). No storage, no persistence, no network, no
// image generation — structured text only, derived from data the project
// already holds. Reads ONLY public exports (labels + designDraft helpers).
//
// Language rules (strict):
//   • professionalHe / clientHe / productionNotesHe — Hebrew, app-facing.
//   • mediaPromptEn / sketchPromptEn / presentationPromptEn — ENGLISH ONLY,
//     built exclusively from canonical English enum values and ASCII-safe
//     fields. Hebrew values are NEVER mixed into the English prompts
//     (non-ASCII fields are filtered out). Hebrew fields may be INSPECTED
//     (e.g. cluster detection) but never embedded.

import { CONCEPT_HE, BRIEF_HE } from './labels';
import { getSelectedConcept, getActiveOutput, normalizeRole } from './designDraft';
// Clean 8C — attached-asset context (pure helpers; reads the project's
// existing `assets` array). English phrases are name-free and Hebrew-free.
import {
  getAttachedAssets,
  attachedRoleHe,
  attachedPromptPhrasesEn,
  ATTACHED_FILE_TYPE,
  ATTACHED_ROLE,
} from './attachedAssets';

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

// ---------------------------------------------------------------------------
// Clean 8D — additive pure helpers.
// ---------------------------------------------------------------------------

// Known inert placeholder strings written by lib/studio/designConcepts.js
// into studio-generated concepts. They are NOT real content, so the 8D
// production notes / prompts skip them (exact-match comparison only; the
// source file is never touched).
const CONCEPT_PLACEHOLDERS = Object.freeze([
  'הערות ייצור יתווספו בשלב מאוחר יותר.',
  'תקציר רינדור יתווסף בשלב מאוחר יותר.',
]);
const realText = (v) => {
  const t = typeof v === 'string' ? v.trim() : '';
  return t !== '' && !CONCEPT_PLACEHOLDERS.includes(t) ? t : null;
};

// Cluster detection (defensive): multiple stones, an explicit cluster style
// value, or cluster identity preserved in existing text fields (the Create
// Flow maps its cluster choices to valid enums and keeps the identity in
// text — see lib/studio/createFlow.js). Hebrew text is INSPECTED here for
// detection only and is never embedded into English output.
const CLUSTER_RE = /קלאסטר|cluster/i;
function detectCluster(brief, trayItems, selected) {
  const count = Array.isArray(trayItems) ? trayItems.length : 0;
  if (count > 1) return true;
  const b = brief || {};
  if (b.styleDirection === 'cluster' || b.productType === 'cluster') return true;
  const texts = [
    b.notes,
    b.designGoal,
    b.intention,
    selected && selected.conceptName,
    selected && selected.designStructure,
  ];
  return texts.some((t) => typeof t === 'string' && CLUSTER_RE.test(t));
}

// Hebrew labels for the compact «נכסים ורפרנסים» view (UI-facing only).
const FILE_TYPE_HE = Object.freeze({
  image: 'תמונה',
  // Clean 8G — GLB/GLTF now classify as usable model files too.
  model: 'קובץ מודל (STL/OBJ/GLB)',
  modelFuture: 'קובץ 3DM',
  // Clean 8G — documents + unknown per the file-type awareness spec.
  document: 'מסמך PDF',
  other: 'קובץ לא מזוהה',
});
const PREVIEW_HE = Object.freeze({
  available: 'תצוגה מקדימה קיימת',
  none: 'ללא תצוגה מקדימה',
  planned: 'תמיכה בתצוגה מתוכננת',
});

// Per-asset view rows for the panel's «נכסים ורפרנסים» section.
function attachedAssetsView(attached) {
  return attached.map((a) => ({
    assetId: a.assetId,
    name: a.name || '—',
    roleHe: attachedRoleHe(a.role),
    fileTypeHe: FILE_TYPE_HE[a.fileType] || FILE_TYPE_HE.other,
    previewHe:
      a.fileType === ATTACHED_FILE_TYPE.MODEL_FUTURE
        ? PREVIEW_HE.planned
        : a.previewFileId
          ? PREVIEW_HE.available
          : PREVIEW_HE.none,
  }));
}

// Extra English asset phrases beyond the Clean 8C set (3DM + client file) —
// name-free and Hebrew-free, computed locally so attachedAssets.js stays
// untouched.
function extraAssetPhrasesEn(attached) {
  const phrases = [];
  if (attached.some((a) => a.fileType === ATTACHED_FILE_TYPE.MODEL_FUTURE)) {
    // Clean 8G — pre-existing 8D em dash (U+2014) replaced with an ASCII
    // hyphen so ALL English prompt text passes the strict ASCII guard.
    phrases.push('A 3DM model file is attached; preview/use support is planned - treat it as a form reference only.');
  }
  if (attached.some((a) => a.role === ATTACHED_ROLE.CLIENT_FILE)) {
    phrases.push('A client-provided file is attached as contextual reference for the design.');
  }
  // Clean 8G — PDF documents attached as project context.
  if (attached.some((a) => a.fileType === ATTACHED_FILE_TYPE.DOCUMENT)) {
    phrases.push('A PDF document is attached as project context.');
  }
  return phrases;
}

// Shared English intro parts for the three prompts.
function promptBaseEn(brief, trayItems) {
  const productEn = PRODUCT_EN[(brief || {}).productType] || 'jewelry piece';
  const styleEn = STYLE_EN[(brief || {}).styleDirection] || null;
  const metalEn = METAL_EN[(brief || {}).metalPreference] || 'precious metal';
  const stonesEn = stonePhrasesEn(trayItems);
  return { productEn, styleEn, metalEn, stonesEn };
}

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
// Clean 8I — shared English prompt context (ADDITIVE export; nothing above
// changes). Exposes the exact same internal maps/derivations buildOutputPack
// uses, so lib/studio/renderPromptFinalizer.js builds its final prompt from
// ONE source of truth instead of duplicating the enum maps. English-only,
// ASCII-safe values; Hebrew is inspected for cluster detection only.
// ---------------------------------------------------------------------------
export function buildPromptContextEn(project) {
  const p = project || {};
  const brief = p.brief || {};
  const trayItems = Array.isArray(p.trayItems) ? p.trayItems : [];
  const selected = getSelectedConcept(brief);
  const attached = getAttachedAssets(p);
  const directionRaw = selected ? realText(selected.renderBriefText) : null;
  return {
    productEn: PRODUCT_EN[brief.productType] || 'jewelry piece',
    productKnown: Boolean(brief.productType && PRODUCT_EN[brief.productType]),
    styleEn: STYLE_EN[brief.styleDirection] || null,
    metalEn: METAL_EN[brief.metalPreference] || null,
    stonesEn: stonePhrasesEn(trayItems),
    stoneCount: trayItems.length,
    directionEn: directionRaw && asciiOnly(directionRaw) ? directionRaw : null,
    directionNameHe: selected && selected.conceptName ? selected.conceptName : null,
    hasDirection: Boolean(selected),
    isCluster: detectCluster(brief, trayItems, selected),
    attached,
    hasImage: attached.some((a) => a.fileType === ATTACHED_FILE_TYPE.IMAGE),
    hasModel: attached.some((a) => a.fileType === ATTACHED_FILE_TYPE.MODEL),
    hasModel3dm: attached.some((a) => a.fileType === ATTACHED_FILE_TYPE.MODEL_FUTURE),
    hasSketch: attached.some((a) => a.role === ATTACHED_ROLE.SKETCH),
    hasClientFile: attached.some((a) => a.role === ATTACHED_ROLE.CLIENT_FILE),
    hasDocument: attached.some((a) => a.fileType === ATTACHED_FILE_TYPE.DOCUMENT),
    hasRequestText: Boolean(brief.designGoal && String(brief.designGoal).trim()),
    hasReferenceText: Boolean(brief.intention && String(brief.intention).trim()),
  };
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
  // Clean 8D — cluster-aware output (multiple stones / explicit cluster
  // style / cluster identity preserved in existing text fields).
  const isCluster = detectCluster(brief, trayItems, selected);

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
    profLines.push('', `בקשת העיצוב: ${String(brief.designGoal).trim()}`);
  }
  // Clean 8D — reference/intention free text (the Create Flow persists the
  // reference description in brief.intention, already prefixed «רפרנס: »).
  if (brief.intention && String(brief.intention).trim()) {
    const intentionText = String(brief.intention).trim();
    profLines.push(/^רפרנס/.test(intentionText) ? intentionText : `כוונה: ${intentionText}`);
  }
  if (selected && selected.conceptNotes && String(selected.conceptNotes).trim()) {
    profLines.push(`הערות לכיוון: ${String(selected.conceptNotes).trim()}`);
  }
  // Clean 8C — attached assets: the design is based on the selected stones
  // AND on the attached references/assets, listed by role.
  const attached = getAttachedAssets(p);
  if (attached.length) {
    profLines.push('', 'נכסים מצורפים לתיק:');
    attached.forEach((a) => {
      const bits = [attachedRoleHe(a.role), a.name].filter(Boolean);
      profLines.push(`• ${bits.join(': ')}`);
    });
    profLines.push('העיצוב מתבסס על האבנים שנבחרו ועל הרפרנסים והנכסים המצורפים.');
  }
  // Clean 8D — cluster logic in the professional summary when relevant.
  if (isCluster) {
    profLines.push('', 'הערת שיבוץ: העבודה מתאימה לשפת קלאסטר (Cluster) — קיבוץ אבנים מכוון סביב מוקד, בקומפוזיציה מאוזנת.');
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
  // Clean 8C — attached-asset context (English-only, name-free phrases).
  const assetPhrasesEn = attachedPromptPhrasesEn(p);
  assetPhrasesEn.forEach((line) => promptLines.push(line));
  // Clean 8D — extra asset phrases (3DM + client file), computed locally.
  const extraPhrasesEn = extraAssetPhrasesEn(attached);
  extraPhrasesEn.forEach((line) => promptLines.push(line));
  if (assetPhrasesEn.length && stonesEn.length) {
    promptLines.push('Adapt the design to the selected gemstones.');
  }
  // Clean 8D — selected direction, ONLY when its render-brief text is real
  // English (Create Flow concepts carry an English renderBriefText; studio
  // placeholder text is Hebrew and is filtered out by realText + asciiOnly).
  const directionEn = selected ? realText(selected.renderBriefText) : null;
  if (directionEn && asciiOnly(directionEn)) {
    promptLines.push(`Selected design direction: ${directionEn}`);
  }
  // Clean 8C/8D — cluster design language (broadened detection: multiple
  // stones, explicit cluster style, or cluster identity kept in text).
  if (isCluster) {
    promptLines.push(
      'Compose the stones as a cohesive cluster arrangement: balanced multi-stone composition, intentional gemstone grouping, styled arrangement with unified flow and practical setting spacing.'
    );
  }
  promptLines.push(
    'Elegant luxury studio product photography, clean background, soft studio lighting, accurate proportions, precise macro detail, realistic reflections and materials, high resolution.'
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
  // Clean 8C — mention attached references when the Work File has them.
  if (attached.length) {
    clientHe +=
      trayItems.length > 0
        ? ' העיצוב נבנה סביב האבנים שנבחרו ובהשראת רפרנסים ונכסים שצורפו לתיק.'
        : ' העיצוב נבנה בהשראת רפרנסים ונכסים שצורפו לתיק.';
  }
  clientHe += ' העבודה מלווה באופן אישי משלב הרעיון ועד הביצוע.';

  // -------------------------------------------------------------------
  // References — display existing linkage counts if present, else placeholder
  // (no schema change; upload is NOT part of this milestone).
  // -------------------------------------------------------------------
  const linkedFilesCount = Array.isArray(p.linkedAssetFileIds) ? p.linkedAssetFileIds.length : 0;
  // Clean 8C — attached assets count alongside the existing linked-files
  // count (additive fields; existing fields/text keep their exact behavior
  // when nothing is attached).
  const attachedAssetsCount = attached.length;
  const attachedText =
    attachedAssetsCount > 0
      ? `${attachedAssetsCount === 1 ? 'נכס אחד מצורף לתיק' : `${attachedAssetsCount} נכסים מצורפים לתיק`}`
      : null;
  const baseRefsText = linkedFilesCount > 0 ? HE.refsLinkedFiles(linkedFilesCount) : HE.refsEmpty;
  const references = {
    linkedFilesCount,
    attachedAssetsCount,
    title: HE.refsTitle,
    text: attachedText
      ? linkedFilesCount > 0
        ? `${baseRefsText} · ${attachedText}`
        : attachedText
      : baseRefsText,
  };

  // -------------------------------------------------------------------
  // Clean 8D — D. Media Prompt — Design Concept / Sketch (ENGLISH ONLY).
  // -------------------------------------------------------------------
  const base = promptBaseEn(brief, trayItems);
  const sketchLines = [
    `Jewelry design concept sketch: a ${[base.styleEn, base.productEn].filter(Boolean).join(' ')} in ${base.metalEn}.`,
  ];
  if (base.stonesEn.length) sketchLines.push(`Featuring ${base.stonesEn.join('; ')}.`);
  assetPhrasesEn.forEach((line) => sketchLines.push(line));
  extraPhrasesEn.forEach((line) => sketchLines.push(line));
  if (directionEn && asciiOnly(directionEn)) {
    sketchLines.push(`Selected design direction: ${directionEn}`);
  }
  if (isCluster) {
    sketchLines.push('Show the multi-stone cluster composition clearly: intentional gemstone grouping with balanced spacing and a defined focal point.');
  }
  sketchLines.push(
    'Hand-drawn designer sketch / design board style: clean line work, subtle shading, annotated proportions, top and side views, neutral paper background.'
  );

  // -------------------------------------------------------------------
  // Clean 8D — E. Media Prompt — Client Presentation (ENGLISH ONLY).
  // -------------------------------------------------------------------
  const presentationLines = [
    `Client presentation render: a ${[base.styleEn, base.productEn].filter(Boolean).join(' ')} in ${base.metalEn}.`,
  ];
  if (base.stonesEn.length) presentationLines.push(`Featuring ${base.stonesEn.join('; ')}.`);
  assetPhrasesEn.forEach((line) => presentationLines.push(line));
  // Clean 8G — the presentation prompt now carries the extra asset phrases
  // too (3DM / client file / PDF), matching the render + sketch prompts.
  extraPhrasesEn.forEach((line) => presentationLines.push(line));
  if (isCluster) {
    presentationLines.push('Present the balanced multi-stone cluster composition as the centerpiece of the design.');
  }
  presentationLines.push(
    'Clean client-facing presentation: pure white background, soft premium studio lighting, accurate proportions, elegant catalog composition, no text or watermarks, high resolution.'
  );

  // -------------------------------------------------------------------
  // Clean 8D — F. Production Notes (Hebrew, practical).
  // -------------------------------------------------------------------
  const prodLines = [`הערות ייצור — ${p.name || 'תיק עיצוב'}`, ''];
  // Stone placement logic — the selected direction's layout when real,
  // otherwise a factual line derived from the tray composition.
  const layoutText = selected ? realText(selected.stoneLayout) : null;
  if (layoutText) {
    prodLines.push(`שיבוץ: ${layoutText}`);
  } else if (trayItems.length > 0) {
    prodLines.push(
      trayItems.length === 1
        ? 'שיבוץ: אבן אחת בתיק — שיבוץ ממוקד סביב האבן המרכזית.'
        : `שיבוץ: ${trayItems.length} אבנים בתיק — לתכנן היררכיה ברורה בין מרכז לליווי.`
    );
  } else {
    prodLines.push('שיבוץ: טרם נבחרו אבנים — לוגיקת השיבוץ תיקבע עם בחירת האבנים.');
  }
  const structureText = selected ? realText(selected.designStructure) : null;
  if (structureText) prodLines.push(`מבנה עיצובי: ${structureText}`);
  // Possible setting direction from the chosen style.
  if (styleHe && styleHe !== HE.notChosen) {
    prodLines.push(`כיוון שיבוץ אפשרי: בהתאם לסגנון ${styleHe}.`);
  }
  const conceptProdText = selected ? realText(selected.productionNotes) : null;
  if (conceptProdText) prodLines.push(`הערות הכיוון הנבחר: ${conceptProdText}`);
  // Model / reference influence — per attached asset type.
  if (attached.length) {
    prodLines.push('', 'השפעת מודלים ורפרנסים:');
    if (attached.some((a) => a.fileType === ATTACHED_FILE_TYPE.IMAGE)) {
      prodLines.push('• רפרנס ויזואלי מצורף — לשמור על רוח העיצוב מהרפרנס בהתאמות המקומיות.');
    }
    if (attached.some((a) => a.fileType === ATTACHED_FILE_TYPE.MODEL)) {
      prodLines.push('• קובץ מודל תלת־ממד מצורף (STL/OBJ/GLB) — משמש בסיס צורני; לוודא התאמת מידות האבנים למודל.');
    }
    if (attached.some((a) => a.fileType === ATTACHED_FILE_TYPE.MODEL_FUTURE)) {
      prodLines.push('• קובץ 3DM מצורף — תמיכה בתצוגה/שימוש מתוכננת; בשלב זה רפרנס בלבד.');
    }
    if (attached.some((a) => a.role === ATTACHED_ROLE.SKETCH)) {
      prodLines.push('• סקיצה מצורפת — הקומפוזיציה שבסקיצה מובילה את סידור האבנים.');
    }
    if (attached.some((a) => a.role === ATTACHED_ROLE.CLIENT_FILE)) {
      prodLines.push('• קובץ לקוח מצורף — לבדוק דרישות והעדפות מיוחדות מול הלקוח.');
    }
    // Clean 8G — previous media result attached: keep visual continuity.
    if (attached.some((a) => a.role === ATTACHED_ROLE.MEDIA_ASSET)) {
      prodLines.push('• תוצאת מדיה קודמת מצורפת — לשמור על המשכיות ויזואלית מול התוצאה הקודמת.');
    }
    // Clean 8G — PDF document attached: review before production.
    if (attached.some((a) => a.fileType === ATTACHED_FILE_TYPE.DOCUMENT)) {
      prodLines.push('• מסמך PDF מצורף — לעבור על המסמך ולוודא דרישות לפני ייצור.');
    }
  }
  if (isCluster) {
    prodLines.push('', 'קלאסטר: לוודא מרווחי שיבוץ אחידים בין האבנים ובדיקת חפיפות בשלב השעווה; לשמור על מוקד ברור בקומפוזיציה.');
  }
  prodLines.push(
    '',
    'לבדוק לפני ייצור: התאמת מידות אבן מול עומק/עובי השיבוץ, חוזק מתכת בנקודות עומס, גובה שיבוץ לנוחות ענידה.'
  );

  return {
    professionalHe: profLines.join('\n'),
    mediaPromptEn: promptLines.join('\n'),
    clientHe,
    references,
    // Clean 8D — additive fields (existing fields above are unchanged).
    sketchPromptEn: sketchLines.join('\n'),
    presentationPromptEn: presentationLines.join('\n'),
    productionNotesHe: prodLines.join('\n'),
    attachedAssets: attachedAssetsView(attached),
    isCluster,
  };
}
