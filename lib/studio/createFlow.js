// lib/studio/createFlow.js
//
// LESHEM.S OS — Clean 8A: Create Flow MVP — pure helper.
//
// Local, deterministic logic for the guided /studio/create flow:
//   • the flow's option lists (Hebrew-first, per spec)
//   • generateCreateDirections(input) — 3 structured, NON-generic design
//     directions built from product type, style, real tray stones, reference
//     text, the free request, and cluster logic
//   • buildCreateBrief(...) — maps the flow into a VALID design brief using
//     only existing enum values + the persisted free-text fields
//     (designGoal / intention / notes), and stores the directions as
//     studio-compatible concepts (each direction's English media-prompt hint
//     persists in the concept's existing renderBriefText field)
//   • buildCreateOutputPack(...) — Hebrew professional summary, ENGLISH-ONLY
//     media prompt, Hebrew client description
//
// No storage, no persistence, no network, no AI service — text generation is
// local and deterministic. Language rules: Hebrew for app-facing text; the
// media prompt is strictly English (Hebrew free-text is referenced neutrally,
// never embedded).

// ---------------------------------------------------------------------------
// Step options (Hebrew per spec) with canonical internal keys.
// ---------------------------------------------------------------------------
export const CREATE_PRODUCT_OPTIONS = Object.freeze([
  { key: 'ring', he: 'טבעת' },
  { key: 'pendant', he: 'תליון' },
  { key: 'earrings', he: 'עגילים' },
  { key: 'bracelet', he: 'צמיד' },
  { key: 'necklace', he: 'שרשרת' },
  { key: 'clusterPiece', he: 'תכשיט קלאסטר' },
  { key: 'other', he: 'אחר' },
]);

export const CREATE_STYLE_OPTIONS = Object.freeze([
  { key: 'classic', he: 'קלאסי' },
  { key: 'modern', he: 'מודרני' },
  { key: 'delicate', he: 'עדין' },
  { key: 'luxury', he: 'יוקרתי' },
  { key: 'vintage', he: 'וינטג׳' },
  { key: 'cluster', he: 'קלאסטר' },
  { key: 'minimal', he: 'מינימליסטי' },
  { key: 'free', he: 'חופשי / פתוח' },
]);

export const productHe = (key) => {
  const o = CREATE_PRODUCT_OPTIONS.find((x) => x.key === key);
  return o ? o.he : null;
};
export const styleHe = (key) => {
  const o = CREATE_STYLE_OPTIONS.find((x) => x.key === key);
  return o ? o.he : null;
};

// Mapping to VALID existing brief enums (no schema/enum change). Choices with
// no exact enum (cluster / free) map to the closest valid value; full
// fidelity is preserved in the concepts + free-text fields.
export const PRODUCT_TO_BRIEF = Object.freeze({
  ring: 'ring',
  pendant: 'pendant',
  earrings: 'earrings',
  bracelet: 'bracelet',
  necklace: 'necklace',
  clusterPiece: 'other',
  other: 'other',
});
const STYLE_TO_BRIEF = Object.freeze({
  classic: 'classic',
  modern: 'modern',
  delicate: 'delicate',
  luxury: 'luxury',
  vintage: 'vintage',
  cluster: 'halo', // closest existing value; cluster identity kept in text
  minimal: 'minimal',
  free: 'custom',
});

// English phrases for the media prompt (canonical values only).
const PRODUCT_EN = Object.freeze({
  ring: 'ring',
  pendant: 'pendant',
  earrings: 'pair of earrings',
  bracelet: 'bracelet',
  necklace: 'necklace',
  clusterPiece: 'cluster-set jewelry piece',
  other: 'jewelry piece',
});
const STYLE_EN = Object.freeze({
  classic: 'classic',
  modern: 'modern',
  delicate: 'delicate refined',
  luxury: 'luxurious high-end',
  vintage: 'vintage-inspired',
  cluster: 'cluster-set',
  minimal: 'minimalist',
  free: 'free-form artistic',
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

const asciiOnly = (v) => typeof v === 'string' && v.trim() !== '' && /^[\x20-\x7E]+$/.test(v.trim());
const clip = (text, n) => {
  const t = String(text || '').trim().replace(/\s+/g, ' ');
  return t.length > n ? `${t.slice(0, n)}…` : t;
};

// ---------------------------------------------------------------------------
// Stone helpers (from REAL tray item snapshots).
// ---------------------------------------------------------------------------
function stoneHe(item) {
  const s = (item && item.snapshot) || {};
  return [s.name, s.shapeHe, s.caratWeight ? `${s.caratWeight} קראט` : null].filter(Boolean).join(', ');
}

function stonesHeList(trayItems) {
  return (Array.isArray(trayItems) ? trayItems : []).map(stoneHe).filter(Boolean);
}

function stoneEn(item) {
  const s = (item && item.snapshot) || {};
  const shape = (s.shape && SHAPE_EN[s.shape]) || (s.axes && SHAPE_EN[s.axes.shape]) || null;
  const type = asciiOnly(s.stoneType) ? s.stoneType.toLowerCase() : 'gemstone';
  const carat = s.caratWeight ? `${s.caratWeight} ct` : null;
  return [carat, shape, type].filter(Boolean).join(' ');
}

function stonesEnList(trayItems) {
  return (Array.isArray(trayItems) ? trayItems : []).map(stoneEn).filter((p) => p && p.trim() !== '');
}

export function isClusterContext({ product, style, trayItems }) {
  const count = Array.isArray(trayItems) ? trayItems.length : 0;
  return product === 'clusterPiece' || style === 'cluster' || count >= 2;
}

// ---------------------------------------------------------------------------
// generateCreateDirections(input) → 3 structured directions.
// Studio-compatible concept shape: conceptId / conceptName / shortDescription
// / stoneLayout / designStructure / productionNotes / renderBriefText (the
// English media-prompt hint) — all fields that survive the existing concept
// normalization, so they round-trip into Work Files untouched.
// ---------------------------------------------------------------------------
let seq = 0;
const makeId = (i) => {
  seq += 1;
  return `cf_${Date.now().toString(36)}_${seq}_${i}`;
};

export function generateCreateDirections(input) {
  const { product, style, trayItems, referenceText, requestText } = input || {};
  const items = Array.isArray(trayItems) ? trayItems : [];
  const count = items.length;
  const cluster = isClusterContext({ product, style, trayItems: items });
  const pHe = productHe(product) || 'תכשיט';
  const sHe = styleHe(style) || null;
  const centerHe = count ? stoneHe(items[0]) : null;
  const othersCount = Math.max(0, count - 1);
  const pEn = PRODUCT_EN[product] || 'jewelry piece';
  const sEn = STYLE_EN[style] || null;
  const stonesEn = stonesEnList(items);
  const reqEcho = requestText && requestText.trim() ? `בהתאם לבקשה: "${clip(requestText, 80)}"` : null;
  const refEcho = referenceText && referenceText.trim() ? `בהשראת הרפרנס שתואר: "${clip(referenceText, 70)}"` : null;
  const validProductType = PRODUCT_TO_BRIEF[product] && PRODUCT_TO_BRIEF[product] !== 'other' ? PRODUCT_TO_BRIEF[product] : null;

  const enBase = [
    `A ${[sEn, pEn].filter(Boolean).join(' ')} in precious metal`,
    stonesEn.length ? `featuring ${stonesEn.join('; ')}` : null,
  ]
    .filter(Boolean)
    .join(', ');

  const directions = [];

  // --- Direction 1 — the faithful centerpiece ------------------------------
  directions.push({
    conceptId: makeId(1),
    conceptName: cluster
      ? `קלאסטר ${sHe || 'קלאסי'} סביב האבן המרכזית`
      : `${pHe} ${sHe || ''} ממוקד${centerHe ? ' באבן המרכזית' : ' צורה'}`.trim(),
    shortDescription: [
      centerHe
        ? `ה${pHe} נבנה סביב ${centerHe} כנקודת המוקד.`
        : `ה${pHe} נבנה סביב צורה נקייה וממוקדת, ללא תלות באבן ספציפית.`,
      cluster && othersCount > 0 ? `שאר ${othersCount} האבנים עוטפות את המרכז בשיבוץ קלאסטר צמוד.` : null,
      sHe ? `הקו הכללי ${sHe}, נאמן לבחירה שלך.` : null,
      reqEcho,
    ]
      .filter(Boolean)
      .join(' '),
    productType: validProductType,
    metalSuggestion: '',
    stoneLayout: centerHe
      ? cluster
        ? `אבן מרכזית: ${centerHe}. סביבה שיבוץ קלאסטר של ${othersCount > 0 ? `${othersCount} אבנים נוספות` : 'אבנים משלימות קטנות'}.`
        : `אבן מרכזית: ${centerHe}. שיבוץ ממוקד ומאובטח, פרופיל נעים ליום־יום.`
      : 'ללא אבן מרכזית בשלב זה — הצורה מובילה; אפשר לשלב אבנים בהמשך.',
    designStructure: cluster
      ? 'מבנה קלאסטר קלאסי: מרכז ברור, טבעת אבנים סימטרית סביבו, גובה שיבוץ מבוקר.'
      : 'מבנה סימטרי וממוקד: המבט נמשך לנקודה אחת, גימור נקי בהיקף.',
    recommendedUse: '',
    productionNotes: cluster
      ? 'לוודא מרווחי שיבוץ אחידים בין אבני הקלאסטר; בדיקת חפיפה בשלב השעווה.'
      : 'שיבוץ מרכזי מאובטח; התאמת גובה השיבוץ לנוחות יומיומית.',
    renderBriefText: [
      enBase + '.',
      cluster ? 'Classic cluster arrangement: a defined center stone tightly encircled by the remaining stones.' : 'Centered, symmetrical composition with a single focal point.',
      'Realistic jewelry rendering, studio lighting, macro detail.',
    ].join(' '),
    conceptNotes: '',
  });

  // --- Direction 2 — the structural / spread composition -------------------
  directions.push({
    conceptId: makeId(2),
    conceptName: cluster ? 'קלאסטר פרוס — קומפוזיציית כוכבים' : `מבנה ${sHe || 'מודרני'} אסימטרי`,
    shortDescription: [
      cluster
        ? `האבנים ${count > 0 ? `(${count})` : ''} מפוזרות בקומפוזיציה פרוסה ושקולה, כמו קונסטלציה — כל אבן מקבלת נוכחות.`
        : `קומפוזיציה אסימטרית שקולה: המשקל הוויזואלי זז הצידה ויוצר עניין ${sHe ? `בשפה ${sHe}ת` : 'עכשווי'}.`,
      refEcho,
      reqEcho,
    ]
      .filter(Boolean)
      .join(' '),
    productType: validProductType,
    metalSuggestion: '',
    stoneLayout:
      count > 0
        ? `כל ${count} האבנים משתתפות: ${stonesHeList(items).join(' · ')} — במרווחים משתנים, שיבוץ נמוך יחסית.`
        : 'שיבוץ עתידי גמיש — המבנה מוכן לקליטת אבנים במרווחים משתנים.',
    designStructure: cluster
      ? 'קלאסטר פתוח: מרווחים משתנים בין האבנים, זרימה א־סימטרית, איזון משקל ויזואלי.'
      : 'קו זורם עם נקודת כובד מוסטת; משחק בין שטח מתכת נקי לאזור מעוטר.',
    recommendedUse: '',
    productionNotes: 'שיבוץ נמוך דורש בדיקת עומק חגורת האבן מול עובי המתכת; לוודא הגנה על פינות.',
    renderBriefText: [
      enBase + '.',
      cluster ? 'Open, constellation-style cluster: stones spread with varied spacing in a balanced asymmetric flow.' : 'Balanced asymmetric composition with a shifted visual anchor and clean metal surfaces.',
      'Low-set stones, realistic jewelry rendering, soft studio lighting, high detail.',
    ].join(' '),
    conceptNotes: '',
  });

  // --- Direction 3 — the contrast take (bold ↔ delicate) -------------------
  const delicateBase = style === 'delicate' || style === 'minimal';
  directions.push({
    conceptId: makeId(3),
    conceptName: delicateBase ? `גרסה נועזת — ${pHe} עם נוכחות` : `גרסה עדינה — ${pHe} מינימלי ומדויק`,
    shortDescription: [
      delicateBase
        ? 'אותם עקרונות — בהגזמה מבוקרת: פרופיל גבוה יותר, נוכחות חזקה, בלי לאבד את הניקיון.'
        : 'פרשנות עדינה ומאופקת של אותו רעיון: קווים דקים, שיבוץ נמוך, מראה נקי ואוורירי.',
      centerHe ? `האבן (${centerHe}) נשארת הגיבורה.` : null,
      refEcho,
      reqEcho,
    ]
      .filter(Boolean)
      .join(' '),
    productType: validProductType,
    metalSuggestion: '',
    stoneLayout: count > 0
      ? delicateBase
        ? 'האבנים מקבלות מסגור בולט יותר; אפשר תוספת אבני צד קטנות להעצמה.'
        : 'שיבוץ עדין וצמוד גוף; אבני הצד (אם קיימות) כמעט נעלמות בתוך הקו.'
      : 'מתאים גם ללא אבנים — הצורה נושאת את העיצוב.',
    designStructure: delicateBase
      ? 'הגדלת נפח מבוקרת, קצוות מעוגלים, איזון בין נוכחות לנוחות.'
      : 'חתכים דקים, פרופיל נמוך, דגש על דיוק גימור ומשקל קל.',
    recommendedUse: '',
    productionNotes: delicateBase
      ? 'לוודא שהמשקל נשאר נוח לענידה יומיומית למרות הנפח.'
      : 'עובי מינימלי מחייב בדיקת חוזק — במיוחד בנקודות השיבוץ.',
    renderBriefText: [
      enBase + '.',
      delicateBase ? 'A bolder statement take: stronger presence and higher profile while keeping clean lines.' : 'A delicate minimalist take: thin precise lines, low profile, airy clean look.',
      cluster ? 'Cluster grouping remains a key motif.' : null,
      'Realistic jewelry rendering, neutral background, precise reflections.',
    ]
      .filter(Boolean)
      .join(' '),
    conceptNotes: '',
  });

  return directions;
}

// ---------------------------------------------------------------------------
// buildCreateBrief — a VALID brief (existing enums + persisted free-text
// fields only) carrying the full create-flow context.
// ---------------------------------------------------------------------------
export function buildCreateBrief(input, directions, selectedDirectionId) {
  const { product, style, trayItems, referenceText, requestText } = input || {};
  const items = Array.isArray(trayItems) ? trayItems : [];
  return {
    productType: PRODUCT_TO_BRIEF[product] || null,
    styleDirection: STYLE_TO_BRIEF[style] || null,
    stoneUsage: items.length > 0 ? 'useSelected' : 'optional',
    designGoal: requestText && requestText.trim() ? requestText.trim() : '',
    intention: referenceText && referenceText.trim() ? `רפרנס: ${referenceText.trim()}` : '',
    notes: `נוצר במסלול היצירה (Create Flow) · ${productHe(product) || ''}${styleHe(style) ? ` · ${styleHe(style)}` : ''}`.trim(),
    concepts: Array.isArray(directions) ? directions : [],
    selectedConceptId: selectedDirectionId || null,
  };
}

export function buildCreateWorkFileName(input) {
  const dateHe = new Date().toLocaleDateString('he-IL');
  return ['תיק יצירה', productHe(input && input.product), dateHe].filter(Boolean).join(' · ');
}

// ---------------------------------------------------------------------------
// buildCreateOutputPack — { professionalHe, mediaPromptEn, clientHe }
// ---------------------------------------------------------------------------
export function buildCreateOutputPack(input, directions, selectedDirectionId) {
  const { product, style, trayItems, referenceText, requestText } = input || {};
  const items = Array.isArray(trayItems) ? trayItems : [];
  const cluster = isClusterContext({ product, style, trayItems: items });
  const pHe = productHe(product) || 'תכשיט';
  const sHe = styleHe(style);
  const list = Array.isArray(directions) ? directions : [];
  const selected = list.find((d) => d.conceptId === selectedDirectionId) || null;
  const stonesHe = stonesHeList(items);

  // A — Hebrew professional summary.
  const profLines = [
    `סיכום מקצועי — מסלול יצירה`,
    '',
    `תכשיט: ${pHe}${sHe ? ` · סגנון: ${sHe}` : ''}`,
    '',
    'אבנים ופריטים:',
    ...(stonesHe.length ? stonesHe.map((s) => `• ${s}`) : ['• טרם נבחרו אבנים — העיצוב מתחיל מרעיון כללי']),
  ];
  if (referenceText && referenceText.trim()) profLines.push('', `רפרנס: ${clip(referenceText, 160)}`);
  if (requestText && requestText.trim()) profLines.push('', `בקשת העיצוב: ${clip(requestText, 200)}`);
  profLines.push(
    '',
    selected
      ? `כיוון נבחר: ${selected.conceptName} — ${selected.shortDescription}`
      : list.length
        ? `נוצרו ${list.length} כיווני עיצוב — טרם נבחר כיוון.`
        : 'טרם נוצרו כיווני עיצוב.'
  );
  if (cluster) profLines.push('', 'הערת שיבוץ: העבודה מתאימה לשפת קלאסטר (Cluster) — ריבוי אבנים סביב מוקד.');

  // B — ENGLISH-ONLY media prompt (Hebrew free-text referenced, never embedded).
  const pEn = PRODUCT_EN[product] || 'jewelry piece';
  const sEn = STYLE_EN[style] || null;
  const stonesEn = stonesEnList(items);
  const promptLines = [
    `Professional jewelry visualization: a ${[sEn, pEn].filter(Boolean).join(' ')} in precious metal.`,
  ];
  if (stonesEn.length) promptLines.push(`Featuring ${stonesEn.join('; ')}.`);
  if (referenceText && referenceText.trim()) promptLines.push('Follow the attached design reference description provided by the studio.');
  if (requestText && requestText.trim()) promptLines.push("Honor the client's stated design preferences.");
  if (selected && selected.renderBriefText) promptLines.push(selected.renderBriefText);
  else if (cluster) promptLines.push('A cluster arrangement of the stones is the leading design language.');
  promptLines.push('Elegant studio product photography, soft neutral background, realistic materials and reflections, precise macro detail, high resolution.');

  // C — Hebrew client-facing description.
  let clientHe = `${pHe} בעיצוב אישי${sHe ? ` בקו ${sHe}` : ''}.`;
  if (stonesHe.length) clientHe += ` בלב העיצוב: ${stonesHe[0]}${stonesHe.length > 1 ? `, לצד ${stonesHe.length - 1} אבנים נוספות` : ''}.`;
  if (cluster) clientHe += ' שפת העיצוב — קלאסטר עשיר סביב מוקד מרכזי.';
  if (referenceText && referenceText.trim()) clientHe += ' העיצוב נשען על הרפרנסים וההשראה שהעברת אלינו.';
  if (selected) clientHe += ` הכיוון הנבחר — ${selected.conceptName}.`;
  clientHe += ' העבודה מלווה באופן אישי משלב הרעיון ועד הביצוע.';

  return {
    professionalHe: profLines.join('\n'),
    mediaPromptEn: promptLines.join('\n'),
    clientHe,
  };
}
