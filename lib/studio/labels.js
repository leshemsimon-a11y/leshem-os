// lib/studio/labels.js
//
// LESHEM.S OS — Language Layer (Clean 1, corrected for six axes)
//
// STRICT LANGUAGE SEPARATION:
//   - App UI text          -> Hebrew       (toAppHe)
//   - Certificates/Reports -> English ONLY (toReportEn)
//   - Code / logic values  -> canonical English (toCanonical)
//
// Hebrew values must NEVER leak into customer-facing certificate output, and
// canonical English values are the only thing logic ever compares against.
//
// Covers all six axes (stoneCategory, origin, stoneType, shape, assetType,
// inventoryLayer). assetType and inventoryLayer are internal — they have
// Hebrew UI labels for internal screens but are NOT customer-facing and have
// no place on certificates.
//
// Every lookup degrades gracefully: an unknown value returns a safe fallback
// rather than throwing, and logs a console.warn for visibility.

import {
  STONE_CATEGORY,
  ORIGIN,
  STONE_TYPE,
  SHAPE,
  ASSET_TYPE,
  INVENTORY_LAYER,
} from './taxonomy';

// ---------------------------------------------------------------------------
// Hebrew UI dictionaries (app-facing)
// ---------------------------------------------------------------------------
const HE = {
  stoneCategory: {
    [STONE_CATEGORY.WHITE_DIAMOND]: 'יהלום לבן',
    [STONE_CATEGORY.FANCY_COLOR_DIAMOND]: 'יהלום צבעוני',
    [STONE_CATEGORY.COLORED_GEMSTONE]: 'אבן חן צבעונית',
    [STONE_CATEGORY.OTHER]: 'אחר',
  },
  origin: {
    [ORIGIN.NATURAL]: 'טבעי',
    [ORIGIN.LAB_GROWN]: 'מעבדה',
    [ORIGIN.UNKNOWN]: 'לא ידוע',
  },
  stoneType: {
    [STONE_TYPE.DIAMOND]: 'יהלום',
    [STONE_TYPE.SAPPHIRE]: 'ספיר',
    [STONE_TYPE.RUBY]: 'אודם',
    [STONE_TYPE.EMERALD]: 'אזמרגד',
    [STONE_TYPE.TOURMALINE]: 'טורמלין',
    [STONE_TYPE.AQUAMARINE]: 'אקוומרין',
    [STONE_TYPE.TANZANITE]: 'טנזניט',
    [STONE_TYPE.SPINEL]: 'ספינל',
    [STONE_TYPE.GARNET]: 'גארנט',
    [STONE_TYPE.TOPAZ]: 'טופז',
    [STONE_TYPE.AMETHYST]: 'אמטיסט',
    [STONE_TYPE.CITRINE]: 'סיטרין',
    [STONE_TYPE.PERIDOT]: 'פרידוט',
    [STONE_TYPE.OPAL]: 'אופל',
    [STONE_TYPE.PEARL]: 'פנינה',
    [STONE_TYPE.OTHER]: 'אחר',
  },
  // Corrected canonical Hebrew shape labels (unchanged per spec) + "other".
  shape: {
    [SHAPE.ROUND]: 'עגול',
    [SHAPE.OVAL]: 'אובל',
    [SHAPE.EMERALD]: 'אמרלד',
    [SHAPE.CUSHION]: 'קושן',
    [SHAPE.RADIANT]: 'רדיאנט',
    [SHAPE.PEAR]: 'טיפה',
    [SHAPE.MARQUISE]: 'מרקיזה',
    [SHAPE.PRINCESS]: 'פרינסס',
    [SHAPE.HEART]: 'לב',
    [SHAPE.ASSCHER]: 'אשר',
    [SHAPE.BAGUETTE]: 'בגט',
    [SHAPE.TRILLION]: 'טריליון',
    [SHAPE.OTHER]: 'אחר',
  },
  // Internal axis — Hebrew labels for internal screens only.
  assetType: {
    [ASSET_TYPE.SINGLE_STONE]: 'אבן בודדת',
    [ASSET_TYPE.STONE_PAIR]: 'זוג אבנים',
    [ASSET_TYPE.STONE_SET]: 'סט אבנים',
    [ASSET_TYPE.STONE_PARCEL]: 'פרסל אבנים',
    [ASSET_TYPE.JEWELRY_PART]: 'חלק תכשיט',
    [ASSET_TYPE.FINISHED_JEWELRY]: 'תכשיט מוגמר',
    [ASSET_TYPE.MODEL_TEMPLATE]: 'דגם תבנית',
    [ASSET_TYPE.RENDER_OUTPUT]: 'תוצר הדמיה',
    [ASSET_TYPE.MEDIA_ASSET]: 'נכס מדיה',
  },
  // Internal axis — Hebrew labels for internal screens only.
  inventoryLayer: {
    [INVENTORY_LAYER.PHYSICAL_STOCK]: 'מלאי פיזי',
    [INVENTORY_LAYER.VIRTUAL_SUPPLIER_STOCK]: 'מלאי ספק וירטואלי',
    [INVENTORY_LAYER.CLIENT_OWNED]: 'בבעלות הלקוח',
    [INVENTORY_LAYER.INTERNAL_DRAFT]: 'טיוטה פנימית',
  },
};

// ---------------------------------------------------------------------------
// English report dictionaries (certificate / customer-facing where applicable)
// ---------------------------------------------------------------------------
const EN = {
  stoneCategory: {
    [STONE_CATEGORY.WHITE_DIAMOND]: 'White Diamond',
    [STONE_CATEGORY.FANCY_COLOR_DIAMOND]: 'Fancy Color Diamond',
    [STONE_CATEGORY.COLORED_GEMSTONE]: 'Colored Gemstone',
    [STONE_CATEGORY.OTHER]: 'Other',
  },
  origin: {
    [ORIGIN.NATURAL]: 'Natural',
    [ORIGIN.LAB_GROWN]: 'Laboratory-Grown',
    [ORIGIN.UNKNOWN]: 'Undetermined',
  },
  stoneType: {
    [STONE_TYPE.DIAMOND]: 'Diamond',
    [STONE_TYPE.SAPPHIRE]: 'Sapphire',
    [STONE_TYPE.RUBY]: 'Ruby',
    [STONE_TYPE.EMERALD]: 'Emerald',
    [STONE_TYPE.TOURMALINE]: 'Tourmaline',
    [STONE_TYPE.AQUAMARINE]: 'Aquamarine',
    [STONE_TYPE.TANZANITE]: 'Tanzanite',
    [STONE_TYPE.SPINEL]: 'Spinel',
    [STONE_TYPE.GARNET]: 'Garnet',
    [STONE_TYPE.TOPAZ]: 'Topaz',
    [STONE_TYPE.AMETHYST]: 'Amethyst',
    [STONE_TYPE.CITRINE]: 'Citrine',
    [STONE_TYPE.PERIDOT]: 'Peridot',
    [STONE_TYPE.OPAL]: 'Opal',
    [STONE_TYPE.PEARL]: 'Pearl',
    [STONE_TYPE.OTHER]: 'Other',
  },
  shape: {
    [SHAPE.ROUND]: 'Round',
    [SHAPE.OVAL]: 'Oval',
    [SHAPE.EMERALD]: 'Emerald',
    [SHAPE.CUSHION]: 'Cushion',
    [SHAPE.RADIANT]: 'Radiant',
    [SHAPE.PEAR]: 'Pear',
    [SHAPE.MARQUISE]: 'Marquise',
    [SHAPE.PRINCESS]: 'Princess',
    [SHAPE.HEART]: 'Heart',
    [SHAPE.ASSCHER]: 'Asscher',
    [SHAPE.BAGUETTE]: 'Baguette',
    [SHAPE.TRILLION]: 'Trillion',
    [SHAPE.OTHER]: 'Other',
  },
  // Internal axes — English provided for internal tooling, NOT for certificates.
  assetType: {
    [ASSET_TYPE.SINGLE_STONE]: 'Single Stone',
    [ASSET_TYPE.STONE_PAIR]: 'Stone Pair',
    [ASSET_TYPE.STONE_SET]: 'Stone Set',
    [ASSET_TYPE.STONE_PARCEL]: 'Stone Parcel',
    [ASSET_TYPE.JEWELRY_PART]: 'Jewelry Part',
    [ASSET_TYPE.FINISHED_JEWELRY]: 'Finished Jewelry',
    [ASSET_TYPE.MODEL_TEMPLATE]: 'Model Template',
    [ASSET_TYPE.RENDER_OUTPUT]: 'Render Output',
    [ASSET_TYPE.MEDIA_ASSET]: 'Media Asset',
  },
  inventoryLayer: {
    [INVENTORY_LAYER.PHYSICAL_STOCK]: 'Physical Stock',
    [INVENTORY_LAYER.VIRTUAL_SUPPLIER_STOCK]: 'Virtual Supplier Stock',
    [INVENTORY_LAYER.CLIENT_OWNED]: 'Client-Owned',
    [INVENTORY_LAYER.INTERNAL_DRAFT]: 'Internal Draft',
  },
};

// Axes that are internal-only and must never feed customer-facing certificate
// text via toReportEn. Guarded explicitly below.
const INTERNAL_AXES = ['assetType', 'inventoryLayer'];

// ---------------------------------------------------------------------------
// Hebrew UI strings for the shell / navigation (Clean 1)
// Interface chrome, not taxonomy, so kept separate.
// ---------------------------------------------------------------------------
export const UI_HE = Object.freeze({
  appName: 'LESHEM.S',
  appTagline: 'סטודיו תכשיטים',
  futureBadge: 'בקרוב',
  futureHint: 'המקטע הזה ייפתח בשלב מאוחר יותר',
  menu: 'תפריט',
  close: 'סגירה',
  nav: {
    dashboard: 'לוח בקרה',
    inventory: 'מלאי',
    workTray: 'מגש עבודה',
    builder: 'סטודיו עיצוב',
    models: 'דגמים',
    render: 'הדמיה',
    media: 'מדיה',
    calculator: 'מחשבון',
    certificates: 'תעודות',
    quotes: 'הצעות מחיר',
    settings: 'הגדרות מערכת',
  },
  groups: {
    create: 'יצירה',
    visualize: 'הדמיה ומדיה',
    output: 'פלט ללקוח',
    system: 'מערכת',
  },
});

// ---------------------------------------------------------------------------
// Inventory UI strings (Clean 2.5) — Hebrew section headers + field labels.
// Interface chrome (not taxonomy values), kept separate from the axis dicts.
// English-ready / customer-facing labels live under `clientEn` and must never
// contain Hebrew.
// ---------------------------------------------------------------------------
export const INVENTORY_HE = Object.freeze({
  // Drawer section headers
  sections: {
    overview: 'סקירה כללית',
    gemology: 'נתונים גמולוגיים',
    certificate: 'תעודה / דוח',
    internal: 'מלאי / מידע פנימי לסטודיו',
    media: 'מדיה',
  },
  // Field labels (corrected per Clean 2.5 spec)
  fields: {
    stoneType: 'סוג אבן',
    stoneCategory: 'קטגוריית אבן',
    origin: 'מקור / גידול',
    shape: 'צורה',
    carat: 'קראט',
    stoneCount: 'מספר אבנים',
    measurements: 'מידות',
    color: 'צבע',
    clarity: 'ניקיון',
    cutGrade: 'ליטוש (Cut)',
    polish: 'פוליש',
    symmetry: 'סימטריה',
    fluorescence: 'פלורסנציה',
    fluorescenceColor: 'צבע פלורסנציה',
    transparency: 'שקיפות',
    treatment: 'טיפול',
    geographicOrigin: 'ארץ מקור',
    growthMethod: 'שיטת גידול',
    fancyHue: 'גוון Fancy',
    fancyIntensity: 'עוצמת Fancy',
    labName: 'מעבדה',
    reportNumber: 'מספר דוח',
    reportLink: 'קישור לדוח',
    laserInscription: 'חריטת לייזר',
    certFile: 'קובץ תעודה',
    inventoryLayer: 'שכבת מלאי',
    status: 'סטטוס',
    supplier: 'ספק',
    virtualSupplier: 'ספק וירטואלי',
    supplierAvailability: 'זמינות ספק',
    physicalLocation: 'מיקום פיזי',
    ownerClient: 'בעלים / לקוח',
    memoNumber: 'מספר ממו',
    sku: 'מק״ט',
    cost: 'עלות',
    internalNotes: 'הערות פנימיות',
  },
  // Generic UI bits
  internalBanner: 'מידע זה פנימי בלבד ואינו מופיע בתעודת הלקוח.',
  clientPreviewTitle: 'מידע ללקוח (תצוגה מקדימה)',
  open: 'פתיחה',
  // Future (not-yet-active) affordances — clearly marked as future.
  future: {
    badge: 'בקרוב',
    addStone: 'הוספת אבן',
    uploadCertificate: 'העלאת תעודה',
    addReportLink: 'הוספת קישור לדוח',
    uploadMedia: 'העלאת מדיה',
    hint: 'יתווסף בשלב מאוחר יותר',
  },
});

// English-ready strings for customer-facing preview. NEVER Hebrew.
export const CLIENT_EN = Object.freeze({
  previewLabel: 'Client-facing preview',
  previewHint: 'English-only · prepared for future certificate output',
});

// ---------------------------------------------------------------------------
// Work Tray UI strings (Clean 3) — Hebrew, app-facing chrome.
// Work Tray terminology ONLY — never "basket" / cart / commerce language.
// ---------------------------------------------------------------------------
export const TRAY_HE = Object.freeze({
  title: 'מגש עבודה',
  eyebrow: 'בחירה נוכחית',
  // Make the draft/temporary nature explicit and honest.
  draftNote:
    'מגש העבודה הוא בחירה זמנית לעבודה הנוכחית — אינו נשמר במלאי ואינו משנה את הנתונים.',
  addToTray: 'הוסף למגש עבודה',
  inTray: 'במגש העבודה',
  added: 'נוסף למגש ✓',
  removeFromTray: 'הסר מהמגש',
  remove: 'הסרה',
  clear: 'נקה מגש',
  clearConfirmTitle: 'לנקות את מגש העבודה?',
  clearConfirmBody: 'כל הפריטים שנבחרו יוסרו מהמגש. פעולה זו אינה משנה את המלאי.',
  clearConfirmYes: 'נקה מגש',
  clearConfirmNo: 'ביטול',
  empty: 'מגש העבודה ריק',
  emptyHint:
    'פתחו פריט מהמלאי ולחצו “הוסף למגש עבודה” כדי להתחיל לעבוד סביב האבן.',
  itemsCount: (n) => `${n} פריטים במגש`,
  roleLabel: 'תפקיד בעיצוב',
  rolePlaceholder: 'בחרו תפקיד',
  openDesign: 'פתחו את סטודיו העיצוב',
  openDesignHint: 'המשיכו לעיצוב התכשיט סביב האבן',
  backToInventory: 'חזרה למלאי',
  // Clean 3.2 — role clarity + honest draft validation (app-facing Hebrew).
  unassignedMark: 'עדיין לא הוגדר תפקיד',
  roleChangeHint: 'אפשר לשנות תפקיד בכל רגע',
  // Draft status strip — three honest states.
  status: Object.freeze({
    needsRoleTitle: 'אפשר להמשיך — כדאי להגדיר תפקידים',
    needsRoleBody:
      'הקצו תפקיד לפחות לאבן אחת. כשתהיה אבן מרכזית, טיוטת העיצוב מוכנה להתחלה.',
    readyTitle: 'טיוטת העיצוב מוכנה להתחלה',
    readyBody: 'יש אבן מרכזית — אפשר לפתוח את סטודיו העיצוב.',
  }),
  // Readiness hint shown near the primary action.
  readyHint: 'מוכן להתחלה',
  notReadyHint: 'אפשר להמשיך גם ללא תפקידים',
});

// ---------------------------------------------------------------------------
// Jewelry Design Studio UI strings (Clean 3) — Hebrew, app-facing chrome.
// Foundation screen only. Future affordances are clearly marked "בקרוב".
// ---------------------------------------------------------------------------
export const DESIGN_HE = Object.freeze({
  eyebrow: 'סטודיו עיצוב',
  title: 'סטודיו עיצוב תכשיטים',
  lede:
    'תחילה האבן — וסביבה נבנה העיצוב. כאן מתחילים מהאבנים שנבחרו, מגדירים את תפקידן, ומכינים את הבמה לעבודת העיצוב.',
  emptyTitle: 'אין אבנים בעיצוב עדיין',
  emptyHint:
    'הוסיפו פריטים למגש העבודה והקצו להם תפקיד, ואז פתחו את סטודיו העיצוב.',
  goToTray: 'מעבר למגש העבודה',
  // Section headers
  sections: {
    stones: 'האבנים שנבחרו',
    direction: 'כיוון עיצובי',
    reference: 'רפרנס ומדיה',
    models: 'דגמים והתאמה',
    render: 'תקציר הדמיה ופלט',
    collection: 'אוסף ועיצוב באצ׳',
    clientOutput: 'פלט ללקוח',
  },
  // Direction placeholder (not an input yet)
  directionPlaceholder:
    'תיאור הכיוון העיצובי יתווסף כאן — סגנון, השראה, מתכת, גימור ופרטים. שלב עתידי.',
  futureBadge: 'בקרוב',
  futureStage: 'שלב עתידי',
  futureHint: 'יתווסף בשלב מאוחר יותר של הסטודיו',
  // Clean 3.2 — design draft summary + status (app-facing Hebrew).
  summary: Object.freeze({
    title: 'טיוטת עיצוב',
    totalStones: 'סך הכל פריטים',
    centerStones: 'אבנים מרכזיות',
    sideStones: 'אבני צד',
    pairs: 'זוגות',
    parcels: 'חבילות / פארסל',
    components: 'רכיבים',
    references: 'רפרנס בלבד',
    unassigned: 'ללא תפקיד',
  }),
  status: Object.freeze({
    needsRoleTitle: 'טיוטה בתהליך — כדאי להגדיר תפקידים',
    needsRoleBody:
      'עדיין אין אבן מרכזית. אפשר להמשיך, אך הגדרת אבן מרכזית תסמן את הטיוטה כמוכנה.',
    readyTitle: 'טיוטת העיצוב מוכנה להתחלה',
    readyBody: 'יש אבן מרכזית — אפשר להתחיל לבנות את העיצוב סביבה.',
    backToTray: 'חזרה למגש העבודה',
  }),
  // Future affordance labels (all disabled in Clean 3)
  future: Object.freeze({
    addReferenceImage: 'הוספת תמונת רפרנס',
    addSketch: 'הוספת סקיצה',
    add3dFile: 'הוספת קובץ תלת־ממד',
    addDesignLink: 'הוספת קישור עיצוב',
    addWrittenDirection: 'הוספת כיוון עיצובי כתוב',
    matchModels: 'התאמת דגמי תכשיטים',
    generateRenderBrief: 'יצירת תקציר הדמיה',
    createVisualization: 'יצירת הדמיה',
    buildCollection: 'בניית אוסף',
    bulkDesign: 'עיצוב באצ׳ לפי כיוון',
    exportClient: 'ייצוא ללקוח / לאתר',
    clientDataTable: 'טבלת נתוני לקוח',
  }),
  // Short Hebrew descriptions for the reserved future areas.
  areaDesc: Object.freeze({
    reference:
      'אזור לרפרנסים: תמונה, סקיצה, קובץ תלת־ממד, קישור ותיאור כתוב. שמור לשלב עתידי.',
    models: 'התאמת דגמי תכשיטים לאבן ולכיוון העיצובי. שמור לשלב עתידי.',
    render:
      'הכנת תקציר הדמיה, יצירת הדמיה ופלט מוכן ללקוח. שמור לשלב עתידי.',
    collection:
      'בניית אוסף ממספר אבנים — לפי צורה, מגמה, דגם, שיבוץ, צבע מתכת או כיוון עיצובי. שמור לשלב עתידי.',
    clientOutput:
      'ייצוא ללקוח או לאתר: נתונים מאורגנים, תעודות וטבלת פריטים. שמור לשלב עתידי.',
  }),
});

// ---------------------------------------------------------------------------
// Core helpers
// ---------------------------------------------------------------------------

// Hebrew UI label for a canonical taxonomy value (any axis).
export function toAppHe(axis, canonicalValue) {
  const dict = HE[axis];
  if (!dict) {
    console.warn(`[labels] Unknown axis for toAppHe: "${axis}"`);
    return canonicalValue ?? '';
  }
  const label = dict[canonicalValue];
  if (label == null) {
    console.warn(`[labels] No Hebrew label for ${axis}="${canonicalValue}"`);
    return canonicalValue ?? '';
  }
  return label;
}

// English label for a canonical value. Internal axes (assetType, inventoryLayer)
// are blocked from this path by default to prevent accidental leakage into
// customer-facing output; pass allowInternal=true for deliberate internal use.
export function toReportEn(axis, canonicalValue, { allowInternal = false } = {}) {
  if (INTERNAL_AXES.includes(axis) && !allowInternal) {
    console.warn(
      `[labels] Refusing to emit internal axis "${axis}" to report output. ` +
        `Pass { allowInternal: true } only for internal tooling.`
    );
    return '';
  }
  const dict = EN[axis];
  if (!dict) {
    console.warn(`[labels] Unknown axis for toReportEn: "${axis}"`);
    return canonicalValue ?? '';
  }
  const label = dict[canonicalValue];
  if (label == null) {
    console.warn(`[labels] No English label for ${axis}="${canonicalValue}"`);
    return canonicalValue ?? '';
  }
  return label;
}

// Resolve a possibly-localized or messy input back to a canonical value.
// Accepts a canonical value (returned as-is) or a known Hebrew/English label.
export function toCanonical(axis, input) {
  if (input == null) return input;

  const heDict = HE[axis];
  const enDict = EN[axis];
  if (!heDict || !enDict) {
    console.warn(`[labels] Unknown axis for toCanonical: "${axis}"`);
    return input;
  }
  if (Object.prototype.hasOwnProperty.call(heDict, input)) return input;

  const trimmed = String(input).trim();

  for (const [canonical, he] of Object.entries(heDict)) {
    if (he === trimmed) return canonical;
  }
  for (const [canonical, en] of Object.entries(enDict)) {
    if (en.toLowerCase() === trimmed.toLowerCase()) return canonical;
  }

  console.warn(`[labels] Could not resolve ${axis} input to canonical: "${input}"`);
  return input;
}
