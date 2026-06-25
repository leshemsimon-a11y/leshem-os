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
    projects: 'תיקי עיצוב',
    assets: 'ספריית נכסים',
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
  // Clean 4C — availability labels for inventory-sourced tray items.
  availability: Object.freeze({
    available: 'זמין',
    needsConfirmation: 'דורש אישור',
    reserved: 'שמור',
    unavailable: 'לא זמין',
    draft: 'טיוטה',
  }),
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
    accentStones: 'אבנים נוספות',
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
  // Clean 3.3 — Design Board zones. Seven zones, short titles + one-line
  // captions to keep the board visual and low-text. The first zone is ACTIVE
  // (the stones / work tray); the rest are reserved future zones.
  zones: Object.freeze({
    stones: Object.freeze({
      title: 'אבנים · מגש העבודה',
      caption: 'האבנים שנבחרו, מסודרות לפי תפקיד בעיצוב.',
      glyph: '◆',
    }),
    direction: Object.freeze({
      title: 'כיוון עיצובי',
      caption: 'סגנון, השראה, מתכת וגימור.',
      glyph: '✎',
    }),
    reference: Object.freeze({
      title: 'רפרנס',
      caption: 'תמונה, סקיצה, קובץ תלת־ממד וקישור.',
      glyph: '▣',
    }),
    model: Object.freeze({
      title: 'דגם / תבנית',
      caption: 'התאמת דגם תכשיט לאבן ולכיוון.',
      glyph: '◈',
    }),
    renderBrief: Object.freeze({
      title: 'תקציר הדמיה',
      caption: 'הגדרת הבקשה להדמיה.',
      glyph: '✺',
    }),
    visualization: Object.freeze({
      title: 'הדמיה ומדיה',
      caption: 'הדמיות ונכסי מדיה להצגה.',
      glyph: '◆',
    }),
    clientOutput: Object.freeze({
      title: 'פלט ללקוח',
      caption: 'ייצוא מאורגן ללקוח או לאתר.',
      glyph: '⇧',
    }),
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

// ===========================================================================
// Jewelry Design Brief — Hebrew UI labels (Clean 3C)
// ===========================================================================
// App-facing Hebrew only. The brief is internal/working; it is NOT a
// customer-facing certificate, so Hebrew here is correct and never leaks into
// English certificate output.
export const BRIEF_HE = Object.freeze({
  eyebrow: 'תקציר עיצוב',
  title: 'תקציר עיצוב התכשיט',
  caption: 'מה רוצים לבנות סביב האבנים — סוג, מתכת, סגנון וכוונה.',
  localNote: 'טיוטה מקומית בלבד — נשמרת במכשיר זה, ללא חיבור לשרת.',

  jewelryTypeLabel: 'סוג תכשיט',
  jewelryType: Object.freeze({
    ring: 'טבעת',
    pendant: 'תליון',
    earrings: 'עגילים',
    bracelet: 'צמיד',
    necklace: 'שרשרת',
  }),

  metalLabel: 'העדפת מתכת',
  metal: Object.freeze({
    yellowGold: 'זהב צהוב',
    whiteGold: 'זהב לבן',
    roseGold: 'זהב אדום',
    platinum: 'פלטינה',
    silver: 'כסף',
  }),

  styleLabel: 'העדפת סגנון',
  style: Object.freeze({
    classic: 'קלאסי',
    modern: 'מודרני',
    vintage: 'וינטג׳',
    minimal: 'מינימליסטי',
    statement: 'סטייטמנט',
  }),

  intentionLabel: 'כוונת עיצוב',
  intentionPlaceholder: 'תיאור חופשי של הרעיון, ההשראה והכיוון…',

  notesLabel: 'הערות',
  notesPlaceholder: 'הערות פנימיות לעבודה…',

  clear: 'ניקוי תקציר',
  save: 'שמירת טיוטה מקומית',
  saved: 'נשמר מקומית ✓',
  none: 'ללא בחירה',

  status: Object.freeze({
    temporaryTitle: 'תקציר ריק',
    temporaryBody: 'אפשר להתחיל למלא סוג תכשיט, מתכת, סגנון וכוונה.',
    draftTitle: 'טיוטת תקציר בתהליך',
    draftBody: 'יש תוכן — נשמר מקומית במכשיר זה בלבד.',
    savedTitle: 'טיוטה מקומית נשמרה',
    savedBody: 'התקציר נשמר מקומית. אין חיבור לשרת בשלב זה.',
  }),

  // Reserved reference kinds — inert placeholders only in Clean 3C.
  referenceLabel: 'רפרנס',
  reference: Object.freeze({
    image: 'תמונת רפרנס',
    video: 'וידאו רפרנס',
    sketch: 'סקיצה',
    model3d: 'קובץ תלת־ממד',
    link: 'קישור חיצוני',
    text: 'רפרנס טקסט',
  }),
});

// ===========================================================================
// Design Core — Hebrew UI labels (Clean 5A)
// ===========================================================================
// App-facing Hebrew only. The Design Core is the main working section of the
// studio: choose what is being designed, see the inputs, set a short direction,
// and generate local design concepts. Never a customer-facing certificate, so
// Hebrew here never leaks into English certificate output.
export const CONCEPT_HE = Object.freeze({
  eyebrow: 'ליבת העיצוב',
  title: 'מה מעצבים?',
  caption: 'בוחרים סוג תכשיט, רואים עם מה עובדים, ומקבלים כיווני עיצוב.',
  localNote: 'עבודה מקומית בלבד — נשמרת במכשיר זה, ללא חיבור לשרת.',

  // Part 1 — product type ("מה מעצבים?")
  productTypeLabel: 'מה מעצבים?',
  productType: Object.freeze({
    ring: 'טבעת',
    engagementRing: 'טבעת אירוסין',
    weddingBand: 'טבעת נישואים',
    pendant: 'תליון',
    necklace: 'שרשרת',
    earrings: 'עגילים',
    bracelet: 'צמיד',
    matchingPiece: 'תכשיט משלים / תואם',
    noStones: 'תכשיט ללא אבנים',
    other: 'אחר',
  }),

  // Part 2 — input summary ("עם מה עובדים?")
  inputsTitle: 'עם מה עובדים?',
  inputsEmpty: 'אין כרגע פריטים במגש העבודה — אפשר לעצב גם ללא אבנים.',
  inputsHint: 'הפריטים נלקחים ממגש העבודה והתפקידים שהוקצו להם.',
  roleLabels: Object.freeze({
    unassigned: 'ללא תפקיד',
    centerStone: 'אבן מרכזית',
    sideStone: 'אבני צד',
    accentStone: 'אבנים נוספות',
    pair: 'זוג',
    parcel: 'חבילה / פארסל',
    component: 'רכיב',
    referenceOnly: 'רפרנס בלבד',
  }),
  sourceInternal: 'מלאי / סטודיו',

  // Part 3 — short design brief ("כיוון עיצוב")
  directionTitle: 'כיוון עיצוב',
  designGoalLabel: 'מטרת העיצוב',
  designGoalPlaceholder: 'מה אנחנו רוצים ליצור ולמי…',
  styleDirectionLabel: 'כיוון סגנוני',
  metalLabel: 'העדפת מתכת',
  stoneUsageLabel: 'שימוש באבנים',
  stoneUsage: Object.freeze({
    useSelected: 'שימוש באבנים שנבחרו',
    optional: 'אבנים אופציונליות',
    none: 'תכשיט ללא אבנים',
  }),
  targetClientLabel: 'לקוח יעד / אירוע',
  targetClientPlaceholder: 'לדוגמה: אירוסין, מתנת יום נישואים…',
  budgetLevelLabel: 'רמת תקציב (כללי בלבד)',
  budgetLevelPlaceholder: 'הערה כללית בלבד — אין תמחור בשלב זה',
  notesLabel: 'הערות',
  notesPlaceholder: 'הערות חופשיות לכיוון…',

  // Part 4 — generate
  generate: 'צור כיווני עיצוב',
  regenerate: 'צור כיוונים מחדש',
  generatedTitle: 'כיווני עיצוב מוצעים',
  generatedHint: 'נוצרו מקומית מתוך הקלט הנוכחי — בחרו כיוון אחד לשמירה.',

  // Concept card fields
  field: Object.freeze({
    metalSuggestion: 'מתכת מוצעת',
    stoneLayout: 'מבנה אבנים',
    designStructure: 'מבנה העיצוב',
    recommendedUse: 'מתאים ל',
    productionNotes: 'הערות ייצור',
    renderBriefText: 'תקציר רינדור',
    conceptNotes: 'הערות לכיוון',
  }),
  conceptNotesPlaceholder: 'הערות אישיות לכיוון הזה…',

  // Part 5 — select / save
  selectAsChosen: 'שמור ככיוון נבחר',
  chosen: 'כיוון נבחר ✓',
  chosenBadge: 'כיוון נבחר',
  selectedTitle: 'הכיוון הנבחר',

  // Status strip
  status: Object.freeze({
    emptyTitle: 'אין עדיין כיווני עיצוב',
    emptyBody: 'בחרו מה מעצבים ולחצו "צור כיווני עיצוב".',
    generatedTitle: 'נוצרו כיווני עיצוב',
    generatedBody: 'בחרו כיוון אחד כדי לשמור אותו כעבודה הפעילה.',
    chosenTitle: 'נשמר כיוון נבחר',
    chosenBody: 'הכיוון נשמר מקומית ויופיע בתיק העבודה.',
  }),
});

// ===========================================================================
// Design Output — Hebrew UI labels (Clean 5B — Practical Output Layer)
// ===========================================================================
// App-facing Hebrew only. The output is an internal/working artifact that can
// be read to a client; it is NOT a certificate, so Hebrew here never leaks into
// English certificate output. No pricing, no PDF, no render — text only.
export const OUTPUT_HE = Object.freeze({
  title: 'פלט עיצוב',
  caption: 'יצירת פלט מעשי מתוך הכיוון הנבחר — תיאור ללקוח, בריף הדמיה וסיכום פנימי.',
  localNote: 'נוצר מקומית מתוך הכיוון הנבחר — ללא חיבור לשרת, ללא תמחור וללא הדמיה.',

  needConcept: 'בחר כיוון עיצוב כדי ליצור פלט ראשוני',
  generate: 'צור פלט עיצוב',
  regenerate: 'צור פלט מחדש',

  saveToWork: 'שמור פלט לעבודה',
  updateExisting: 'עדכן פלט קיים',
  savedToast: 'הפלט נשמר ✓',
  updatedToast: 'הפלט עודכן ✓',

  // Section headings (Part 3 order)
  sections: Object.freeze({
    clientDescription: 'תיאור ללקוח',
    internalDesignSummary: 'סיכום עיצוב פנימי',
    materials: 'חומרים ואבנים',
    renderBrief: 'בריף הדמיה',
    productionNotes: 'הערות ייצור',
    assumptions: 'הנחות / מידע חסר',
    nextSteps: 'השלבים הבאים',
  }),

  sourceContextLabel: 'הקשר מקור',
  notesLabel: 'הערות לפלט',
  notesPlaceholder: 'הערות אישיות לפלט…',
  emptyList: '—',

  status: Object.freeze({
    emptyTitle: 'אין עדיין פלט עיצוב',
    emptyBody: 'לחצו "צור פלט עיצוב" כדי להפיק פלט מהכיוון הנבחר.',
    generatedTitle: 'נוצר פלט עיצוב',
    generatedBody: 'אפשר לשמור אותו לעבודה הפעילה או לעדכן פלט קיים.',
    savedTitle: 'הפלט נשמר לעבודה',
    savedBody: 'הפלט נשמר מקומית ויופיע בתיק העבודה.',
  }),

  // Clean 5B.1 — stale + premium feedback
  readyToShow: 'פלט מוכן להצגה',
  staleTitle: 'הפלט מבוסס על כיוון קודם',
  staleBody: 'כדאי לעדכן את הפלט לפי הכיוון הנבחר העדכני.',
  updateOutput: 'עדכן פלט עיצוב',
  updatedToastCalm: 'הפלט עודכן ✓',
  savedToastCalm: 'הפלט נשמר לעבודה ✓',
  canUpdateForClient: 'אפשר לעדכן לפי בחירת הלקוח',

  // Clean 5B.1 — trend awareness PLACEHOLDER only (future-ready; not live)
  trendTitle: 'השראת שוק / טרנדים',
  trendFuture: 'Market Pulse — future',
  trendEmpty: 'אין כרגע נתוני שוק — יתווסף בשלב עתידי.',
});

// ===========================================================================
// Design Studio Flow — Hebrew UI labels (Clean 5B.1)
// ===========================================================================
// App-facing Hebrew only. Drives the staged, client-facing flow inside the
// Design Studio: the three stages, the next-step bar, stale warnings, and calm
// premium feedback. Never customer-facing certificate output.
export const FLOW_HE = Object.freeze({
  // Stage titles
  stages: Object.freeze({
    direction: 'בחירת כיוון',
    concepts: 'כיווני עיצוב',
    output: 'פלט עיצוב',
  }),
  stageStep: (n) => `שלב ${n}`,
  edit: 'עריכה',
  reopen: 'פתיחה מחדש',
  collapse: 'מזער',

  // Next-step bar — one obvious primary action
  nextStepPrefix: 'השלב הבא: ',
  next: Object.freeze({
    fillDirection: 'בחר כיוון עיצוב',
    generateConcepts: 'צור כיווני עיצוב',
    chooseConcept: 'בחר כיוון עיצוב',
    generateOutput: 'צור פלט עיצוב',
    saveOutput: 'שמור פלט לעבודה',
    allDone: 'העבודה מוכנה להצגה',
  }),

  // Concept reset / replace (premium, non-scary)
  cancelSelected: 'בטל כיוון נבחר',
  replaceConcept: 'החלף כיוון',
  newConcepts: 'צור כיוונים חדשים',
  updateConcepts: 'עדכן כיווני עיצוב',

  // Stale warnings
  conceptsStaleTitle: 'הבחירות השתנו',
  conceptsStaleBody: 'כדאי לעדכן את כיווני העיצוב לפי הבחירות העדכניות.',

  // Calm success feedback
  toast: Object.freeze({
    conceptsCreated: 'כיווני העיצוב נוצרו',
    conceptChosen: 'כיוון עיצוב נבחר',
    conceptCanceled: 'הכיוון בוטל',
    outputSaved: 'הפלט נשמר לעבודה',
    inputsUpdated: 'הבחירות עודכנו',
  }),

  // Stage summary chips (collapsed cards)
  summary: Object.freeze({
    directionEmpty: 'טרם נבחר כיוון',
    conceptChosenPrefix: 'כיוון נבחר: ',
    conceptsCountPrefix: 'נוצרו כיוונים: ',
    noConcepts: 'טרם נוצרו כיוונים',
    outputReady: 'פלט מוכן להצגה',
    noOutput: 'טרם נוצר פלט',
  }),
});
// ===========================================================================
// App-facing Hebrew only. The snapshot is an INTERNAL working summary of the
// current design draft — never a customer-facing certificate, so Hebrew here
// is correct and never leaks into English certificate output.
export const SNAPSHOT_HE = Object.freeze({
  title: 'תמונת מצב של העיצוב',
  caption: 'סיכום פנימי של הטיוטה הנוכחית — אבנים, תפקידים ותקציר.',

  // Section headings
  stonesHeading: 'אבנים לפי תפקיד',
  briefHeading: 'תקציר העיצוב',

  // Brief field labels (reused wording, kept local to the snapshot)
  jewelryType: 'סוג תכשיט',
  metal: 'מתכת',
  style: 'סגנון',
  intention: 'כוונת עיצוב',
  notes: 'הערות',
  notSet: '—',

  // Count helpers
  itemsCount: (n) => (n === 1 ? 'פריט אחד' : `${n} פריטים`),
  separateNote: 'כל אבן מרכזית נשמרת כפריט נפרד',

  // Snapshot status copy
  status: Object.freeze({
    missingCenterTitle: 'חסרה אבן מרכזית',
    missingCenterBody:
      'יש להגדיר לפחות אבן מרכזית אחת כדי שהטיוטה תהיה מוכנה להתחלה.',
    readyTitle: 'טיוטת עיצוב מוכנה להתחלה',
    readyBody: 'יש אבן מרכזית ותקציר עיצוב — אפשר להתחיל לבנות סביב האבן.',
    savedLocalTitle: 'טיוטה נשמרה מקומית',
    savedLocalBody: 'הטיוטה נשמרה במכשיר זה בלבד. אין חיבור לשרת בשלב זה.',
    draftTitle: 'טיוטה בתהליך',
    draftBody: 'יש אבן מרכזית — אפשר להוסיף סוג תכשיט וכוונת עיצוב לתקציר.',
  }),
});

// ===========================================================================
// Unified Dashboard + Design Projects — Hebrew UI labels (Clean 4A)
// ===========================================================================
// App-facing Hebrew only. Internal/working surfaces — never customer-facing
// certificates, so Hebrew here never leaks into English certificate output.
export const DASHBOARD_HE = Object.freeze({
  eyebrow: 'מערכת ההפעלה של הסטודיו',
  title: 'LESHEM.S OS',
  lede:
    'הכול תחת קורת גג אחת — תחילה האבן, וסביבה נבנה התכשיט. בחרו לאן להמשיך.',
  tiles: Object.freeze({
    inventory: Object.freeze({
      title: 'מלאי',
      desc: 'אבנים, פרסלים, חלקים ותכשיטים — כמרחב יצירה.',
      glyph: '❖',
    }),
    workTray: Object.freeze({
      title: 'מגש עבודה',
      desc: 'הפריטים שנבחרו לעבודה הנוכחית.',
      glyph: '▤',
    }),
    design: Object.freeze({
      title: 'סטודיו עיצוב',
      desc: 'בניית התכשיט סביב האבנים שנבחרו.',
      glyph: '✦',
    }),
    projects: Object.freeze({
      title: 'תיקי עיצוב',
      desc: 'טיוטות עיצוב שמורות — פתיחה, שכפול וניהול.',
      glyph: '❒',
    }),
    assets: Object.freeze({
      title: 'ספריית נכסים',
      desc: 'תמונות אבנים, סקיצות, קבצי תלת־ממד, תעודות ורפרנסים.',
      glyph: '▣',
    }),
  }),
});

export const PROJECTS_HE = Object.freeze({
  eyebrow: 'תיקי עיצוב',
  title: 'תיקי עיצוב',
  caption: 'טיוטות עיצוב שנשמרו מקומית — פתיחה חזרה לסטודיו, שכפול וניהול.',
  localNote: 'נשמר מקומית במכשיר זה בלבד — ללא חיבור לשרת.',

  // Save-from-snapshot
  saveTitle: 'שמירת העיצוב הנוכחי כתיק',
  saveButton: 'שמירת תיק עיצוב',
  namePlaceholder: 'שם התיק (לדוגמה: טבעת סוליטר — יהלום 1.52)',
  saveHint: 'נשמרים: האבנים, התפקידים, התקציר ותמונת המצב.',

  // List
  activeHeading: 'תיקים פעילים',
  archivedHeading: 'תיקים בארכיון',
  showArchived: 'הצגת ארכיון',
  hideArchived: 'הסתרת ארכיון',
  emptyActive: 'אין עדיין תיקי עיצוב שמורים.',
  emptyArchived: 'אין תיקים בארכיון.',

  // Item actions
  open: 'פתיחה בסטודיו',
  duplicate: 'שכפול כוריאציה',
  rename: 'שינוי שם',
  archive: 'העברה לארכיון',
  unarchive: 'שחזור מארכיון',
  save: 'שמירה',
  cancel: 'ביטול',

  // Meta
  createdAt: 'נוצר',
  updatedAt: 'עודכן',
  clonedFrom: 'שוכפל מתוך תיק',
  linkedAssets: 'נכסים מקושרים',
  linkedAssetsEmpty: 'אין נכסים מקושרים',
  itemsCount: (n) => (n === 1 ? 'אבן אחת' : `${n} אבנים`),

  // Statuses
  status: Object.freeze({
    draft: 'טיוטה',
    inReview: 'בבדיקה',
    approved: 'מאושר',
    archived: 'בארכיון',
  }),

  // Open-into-studio confirmation
  openConfirmTitle: 'פתיחת תיק בסטודיו',
  openConfirmBody:
    'פעולה זו תחליף את מגש העבודה והתקציר הנוכחיים בתוכן התיק. להמשיך?',
  openConfirmYes: 'פתיחה',
  openConfirmNo: 'ביטול',
});

// ===========================================================================
// Asset Library — Hebrew UI labels (Clean 4B)
// ===========================================================================
// App-facing Hebrew only. Internal working surface — never a customer-facing
// certificate, so Hebrew here never leaks into English certificate output.
export const ASSETS_HE = Object.freeze({
  eyebrow: 'ספריית נכסים',
  title: 'ספריית נכסים',
  caption:
    'תמונות אבנים, סקיצות, קבצי תלת־ממד, תעודות ורפרנסים — ידע עיצובי לשימוש חוזר.',
  localNote:
    'אבטיפוס מקומי: הפרטים נשמרים במכשיר זה. תצוגה מקדימה נשמרת לתמונות קטנות בלבד; קבצים גדולים (תלת־ממד, PDF) נרשמים לפי שם וסוג אך אינם נשמרים פיזית בשלב זה.',

  // Upload
  uploadTitle: 'הוספת נכס',
  uploadHint: 'בחרו קובץ מהמכשיר — תמונה, סקיצה, תלת־ממד, תעודה או רפרנס.',
  uploadButton: 'בחירת קובץ',
  uploadDrop: 'גררו קובץ לכאן או בחרו מהמכשיר',
  notPersistedNote: 'הקובץ נרשם אך לא נשמר פיזית (אבטיפוס מקומי).',

  // Lists
  activeHeading: 'נכסים פעילים',
  archivedHeading: 'נכסים בארכיון',
  showArchived: 'הצגת ארכיון',
  hideArchived: 'הסתרת ארכיון',
  emptyActive: 'אין עדיין נכסים. הוסיפו נכס ראשון למעלה.',
  emptyArchived: 'אין נכסים בארכיון.',
  resultsCount: (n) => (n === 1 ? 'נכס אחד' : `${n} נכסים`),

  // Fields
  categoryLabel: 'קטגוריה',
  statusLabel: 'סטטוס',
  notesLabel: 'הערות',
  notesPlaceholder: 'הערות על הנכס…',
  linkLabel: 'שיוך לתיק עיצוב',
  linkNone: 'ללא שיוך',
  fileType: 'סוג קובץ',

  // Actions
  archive: 'העברה לארכיון',
  unarchive: 'שחזור מארכיון',
  save: 'שמירה',
  cancel: 'ביטול',
  filterAll: 'הכול',

  // Categories
  category: Object.freeze({
    stoneImage: 'תמונת אבן',
    model3d: 'קובץ תלת־ממד',
    sketch: 'סקיצה',
    certificate: 'תעודה / PDF',
    clientReference: 'רפרנס לקוח',
    inspiration: 'השראה',
    renderImage: 'הדמיה',
    other: 'אחר',
  }),

  // Statuses
  status: Object.freeze({
    draft: 'טיוטה',
    reference: 'רפרנס',
    approved: 'מאושר',
    archived: 'בארכיון',
  }),

  // Project-side linked assets
  linkedHeading: 'נכסים מקושרים',
  linkedEmpty: 'אין נכסים מקושרים לתיק זה עדיין.',
  linkedManage: 'ניהול נכסים בספרייה ←',
});

// ===========================================================================
// Asset Library — object + file model labels (Clean 4B.1)
// ===========================================================================
// Extends ASSETS_HE (Clean 4B) with the object/file vocabulary. App-facing
// Hebrew only; never customer-facing certificate output.
export const ASSETS_OBJ_HE = Object.freeze({
  // Object creation
  newObjectTitle: 'יצירת אובייקט נכס',
  newObjectHint: 'אובייקט מאגד מספר קבצים — לדוגמה: אבן עם תמונות, תעודה וסריקת תלת־ממד.',
  objectNamePlaceholder: 'שם האובייקט (לדוגמה: יהלום אובל 2ct — רפרנס)',
  objectTypeLabel: 'סוג אובייקט',
  createObject: 'יצירת אובייקט',
  descriptionLabel: 'תיאור',
  descriptionPlaceholder: 'תיאור קצר של האובייקט…',

  // Object card
  filesCount: (n) => (n === 1 ? 'קובץ אחד' : `${n} קבצים`),
  approvedCount: (n) => `${n} מאושרים`,
  addFiles: 'הוספת קבצים',
  openObject: 'פתיחה',
  closeObject: 'סגירה',
  linkProject: 'שיוך לתיק עיצוב',
  linkNone: 'ללא שיוך',
  archiveObject: 'העברת אובייקט לארכיון',
  unarchiveObject: 'שחזור אובייקט',

  // Files panel
  filesHeading: 'קבצים באובייקט',
  noFiles: 'אין עדיין קבצים. הוסיפו קובץ ראשון.',
  approve: 'אישור',
  approved: 'מאושר ✓',
  archiveFile: 'ארכיון',
  unarchiveFile: 'שחזור',
  purposeLabel: 'ייעוד',
  fileKindLabel: 'סוג קובץ',
  preview: 'תצוגה',
  hidePreview: 'הסתרת תצוגה',
  notStored: 'נרשם ללא שמירת קובץ',

  // Object types
  objectType: Object.freeze({
    stone: 'אבן',
    jewelryModel: 'דגם תכשיט',
    designProject: 'תיק עיצוב',
    collection: 'אוסף',
    renderOutput: 'תוצר הדמיה',
    clientReference: 'רפרנס לקוח',
    inspiration: 'השראה',
    other: 'אחר',
  }),

  // File kinds
  fileKind: Object.freeze({
    image: 'תמונה',
    video: 'וידאו',
    model3d: 'תלת־ממד',
    pdf: 'PDF',
    sketch: 'סקיצה',
    render: 'הדמיה',
    document: 'מסמך',
    other: 'אחר',
  }),

  // File purposes
  filePurpose: Object.freeze({
    productionModel: 'מודל ייצור',
    presentationModel: 'מודל תצוגה',
    stoneScan: 'סריקת אבן',
    measurementReference: 'רפרנס מדידה',
    renderReference: 'רפרנס הדמיה',
    none: 'ללא ייעוד',
  }),

  // Filters
  filterObjectType: 'סוג אובייקט',
  filterFileKind: 'סוג קובץ',
  filterPurpose: 'ייעוד',
  filterStatus: 'סטטוס',
  filterAll: 'הכול',

  // 3D viewer
  viewer3dRotateHint: 'גרירה לסיבוב · גלגלת לזום · לחיצה ימנית להזזה',
  viewer3dLoading: 'טוען תצוגת תלת־ממד…',
  viewer3dUnsupported: 'הקובץ נשמר. תצוגת 3D לפורמט הזה תתווסף בהמשך.',
  viewer3dError: 'לא ניתן לטעון את התצוגה כעת. הקובץ נשמר.',
  viewer3dRhino: 'קובץ 3DM נשמר. תצוגת Rhino מלאה תתווסף בשלב הבא.',
});

// ===========================================================================
// Asset Workflow Bridge — Hebrew UI labels (Clean 4B.2)
// ===========================================================================
export const ASSET_FLOW_HE = Object.freeze({
  createProject: 'צור תיק עיצוב מהנכס',
  createProjectFirst: 'צור תיק עיצוב חדש מהנכס הזה',
  addToTray: 'הוסף למגש עבודה',
  inTray: 'נמצא במגש העבודה ✓',
  linkProject: 'קשר לתיק עיצוב',
  openProject: 'פתח תיק עיצוב',
  openInStudio: 'פתח בסטודיו',
  openAsset: 'פתח נכס',
  noProjectsYet: 'אין עדיין תיקי עיצוב — אפשר ליצור תיק חדש ישירות מהנכס.',
  createdToast: 'נוצר תיק עיצוב מהנכס ✓',

  // file purpose groupings shown on cards
  approvedFiles: 'קבצים מאושרים',
  productionFiles: 'קבצי ייצור',
  presentationFiles: 'קבצי תצוגה',
  stoneScan: 'סריקת אבן',

  // Linked assets panel (projects + studio)
  linkedTitle: 'נכסים מקושרים',
  linkedEmpty: 'אין נכסים מקושרים לתיק זה עדיין.',
  linkedOpenAsset: 'פתח נכס',
  linkedOpenStudio: 'פתח בסטודיו',
  approvedCount: (n) => `${n} מאושרים`,
  primaryBadge: 'נכס ראשי',
});

// ===========================================================================
// Asset Intake Router + Ownership/Client Context — Hebrew (Clean 4B.3)
// ===========================================================================
export const INTAKE_HE = Object.freeze({
  // Ownership question
  ownerQuestion: 'למי הנכס הזה שייך?',
  ownerOptions: Object.freeze({
    internal: 'פנימי / שלי',
    privateClient: 'לקוח פרטי',
    businessClient: 'לקוח עסקי',
    supplier: 'ספק',
    agent: 'סוכן',
    other: 'אחר',
  }),
  clientNameLabel: 'שם',
  clientRoleLabel: 'תפקיד / סוג קשר',
  clientTierLabel: 'מעמד',
  clientNotesLabel: 'הערות',
  clientTier: Object.freeze({
    regular: 'רגיל',
    vip: 'VIP',
    business: 'עסקי',
    agent: 'סוכן',
    temporary: 'זמני',
    other: 'אחר',
  }),

  // Destination question
  destinationQuestion: 'מה הנכס הזה אמור להיות?',
  destinationOptions: Object.freeze({
    inventory: 'אבן / סחורה למלאי',
    modelLibrary: 'מודל תכשיט לשימוש חוזר',
    designProject: 'רפרנס לתיק עיצוב',
    inspiration: 'השראה כללית',
    workTrayOnly: 'נכס לעבודה זמנית במגש',
    approvedMedia: 'מדיה מאושרת / רנדר',
    other: 'אחר',
  }),
  changeLater: 'אפשר לשנות בעלות ויעד גם בהמשך.',

  // Owner badge on cards
  ownerInternal: 'פנימי',
  ownerClientPrefix: 'לקוח: ',
});

export const NEXT_ACTIONS_HE = Object.freeze({
  // Inventory destination
  createInventory: 'צור פריט מלאי מהנכס',
  inventoryDraftCreated: 'טיוטת פריט מלאי נוצרה — חיבור מלא למלאי יתווסף בשלב הבא.',
  // Model destination
  createModel: 'צור מודל תכשיט מהנכס',
  modelDraftCreated: 'טיוטת מודל נוצרה — ספריית מודלים מלאה תתווסף בשלב הבא.',
  // shared
  addToTray: 'הוסף למגש עבודה',
  createProject: 'צור תיק עיצוב מהנכס',
  createProjectNew: 'צור תיק עיצוב חדש מהנכס',
  linkProject: 'קשר לתיק עיצוב קיים',
  openProject: 'פתח תיק עיצוב',
  saveInspiration: 'שמור כהשראה',
  savedInspiration: 'נשמר כהשראה ✓',
});

export const DETECT_HE = Object.freeze({
  reviewTitle: 'סקירת קבצים לפני שמירה',
  detectedType: 'סוג שזוהה',
  detectedPurpose: 'ייעוד שזוהה',
  detectedCategory: 'קטגוריה שזוהתה',
  status: 'סטטוס',
  lowConfidence: 'זיהוי לא ודאי — נא לאשר סוג קובץ',
  saveFiles: 'שמור קבצים לנכס',
  addAllToCurrent: 'הוסף את כל הקבצים לנכס הנוכחי',
  splitSeparate: 'צור נכסים נפרדים לכל קובץ',
  dropHint: 'אפשר לגרור, לבחור או להדביק קבצים כאן',
  cancel: 'ביטול',
});

export const DELETE_HE = Object.freeze({
  permanentDelete: 'מחיקה לצמיתות',
  confirmTitle: 'מחיקה לצמיתות',
  confirmObjectBody: 'פעולה זו תמחק את האובייקט וכל קבציו לצמיתות מהמכשיר. לא ניתן לשחזר. להמשיך?',
  confirmFileBody: 'פעולה זו תמחק את הקובץ לצמיתות מהמכשיר. לא ניתן לשחזר. להמשיך?',
  confirmYes: 'מחק לצמיתות',
  confirmNo: 'ביטול',
});

// ===========================================================================
// Clean 4B.4a — Catalog / cataloging layer Hebrew labels (app-facing only)
// ===========================================================================
export const CATALOG_HE = Object.freeze({
  sectionTitle: 'קיטלוג ותגיות',
  catalogCode: 'קוד קטלוג',
  primaryCategory: 'קטגוריה',
  secondaryCategory: 'תת־קטגוריה',
  assetFamily: 'משפחת נכס',
  usagePurpose: 'ייעוד שימוש',
  sourceType: 'מקור',
  sourceName: 'שם מקור',
  tags: 'תגיות',
  tagsPlaceholder: 'הוספת תגית ואנטר…',
  tagsSuggested: 'הצעות',
  noTags: 'אין תגיות עדיין',
  linkedItems: 'פריטים מקושרים',
  noLinks: 'אין קישורים עדיין',
  pickCategoryFirst: 'בחרו קטגוריה תחילה',
  notSet: '—',

  primaryCategoryOptions: Object.freeze({
    goods: 'סחורה',
    stone: 'אבן',
    jewelryModel: 'דגם תכשיט',
    media: 'מדיה',
    certificate: 'תעודה',
    sketch: 'סקיצה',
    clientReference: 'רפרנס לקוח',
    inspiration: 'השראה',
    renderOutput: 'תוצר הדמיה',
    productionFile: 'קובץ ייצור',
    collectionAsset: 'נכס אוסף',
    other: 'אחר',
  }),

  secondaryCategoryOptions: Object.freeze({
    // stone / goods
    naturalDiamond: 'יהלום טבעי',
    labDiamond: 'יהלום מעבדה',
    gemstone: 'אבן חן',
    naturalMelee: 'מלה טבעי',
    labMelee: 'מלה מעבדה',
    stonePair: 'זוג אבנים',
    stoneSet: 'סט אבנים',
    clientStone: 'אבן לקוח',
    supplierVirtualStone: 'אבן ספק וירטואלית',
    // jewelry model
    ring: 'טבעת',
    pendant: 'תליון',
    earrings: 'עגילים',
    bracelet: 'צמיד',
    necklace: 'שרשרת',
    setting: 'משבצת',
    chain: 'שרשרת/חוליה',
    component: 'רכיב',
    // media
    stonePhoto: 'תמונת אבן',
    stoneVideo: 'וידאו אבן',
    productPhoto: 'תמונת מוצר',
    productVideo: 'וידאו מוצר',
    renderImage: 'תמונת הדמיה',
    renderVideo: 'וידאו הדמיה',
    approvedMedia: 'מדיה מאושרת',
    referenceImage: 'תמונת רפרנס',
    referenceVideo: 'וידאו רפרנס',
    other: 'אחר',
  }),

  usagePurposeOptions: Object.freeze({
    inventory: 'מלאי',
    modelLibrary: 'ספריית מודלים',
    workTray: 'מגש עבודה',
    designProject: 'תיק עיצוב',
    collection: 'אוסף',
    renderBrief: 'תקציר הדמיה',
    clientReview: 'סקירת לקוח',
    marketing: 'שיווק',
    production: 'ייצור',
    internalReference: 'רפרנס פנימי',
    approvedOutput: 'תוצר מאושר',
  }),

  sourceTypeOptions: Object.freeze({
    internal: 'פנימי',
    client: 'לקוח',
    supplier: 'ספק',
    agent: 'סוכן',
    importedFile: 'קובץ מיובא',
    manualUpload: 'העלאה ידנית',
    generatedBySystem: 'נוצר במערכת',
    externalReference: 'רפרנס חיצוני',
    other: 'אחר',
  }),

  linkLabels: Object.freeze({
    inventoryDraft: 'טיוטת מלאי',
    modelDraft: 'טיוטת מודל',
    designProjects: 'תיקי עיצוב',
    collections: 'אוספים',
    files: 'קבצים',
  }),
});

// ===========================================================================
// Clean 4B.4a — Quick Create Wizard + cover image + archive labels
// ===========================================================================
export const WIZARD_HE = Object.freeze({
  openWizard: 'יצירת נכס מהירה',
  title: 'יצירת נכס מהירה',
  subtitle: 'שם, בעלות, יעד, קיטלוג, קבצים ותמונה ראשית — בזרימה אחת.',
  classicHint: 'אפשר גם ליצור נכס בטופס המלא למטה.',

  // Steps
  stepTitle: 'פרטי נכס',
  stepOwner: 'בעלות / לקוח',
  stepDestination: 'יעד וסוג',
  stepCatalog: 'קיטלוג ותגיות',
  stepFiles: 'קבצים ומדיה',
  stepCover: 'תמונה ראשית',
  stepNext: 'פעולה הבאה',

  next: 'הבא',
  back: 'חזרה',
  saveAsset: 'שמור נכס',
  cancel: 'ביטול',
  titlePlaceholder: 'שם הנכס (לדוגמה: יהלום אובל 2ct — רפרנס)',
  objectTypeLabel: 'סוג אובייקט',
  filesOptional: 'אפשר להוסיף קבצים עכשיו או מאוחר יותר.',
  filesAdded: (n) => (n === 1 ? 'קובץ אחד נוסף' : `${n} קבצים נוספו`),
  noFilesYet: 'לא נבחרו קבצים עדיין.',

  // Cover image
  coverTitle: 'תמונה ראשית',
  coverHint: 'התמונה שתוצג בכרטיס הנכס. התמונה הראשונה נבחרת אוטומטית.',
  setPrimary: 'הגדר כתמונה ראשית',
  isPrimary: 'תמונה ראשית ✓',
  noImages: 'אין תמונות להצגה. אפשר להוסיף תמונה בשלב הקבצים.',

  // Next action (4B.4a: only save-only is active)
  nextActionQuestion: 'מה לעשות אחרי השמירה?',
  saveOnly: 'שמור בלבד',
  createInventory: 'צור פריט מלאי',
  addToTray: 'הוסף למגש עבודה',
  createProject: 'צור תיק עיצוב',
  openInStudio: 'פתח בסטודיו',
  deferredBadge: 'יופעל בשלב 4B.4b',
  deferredNote: 'בשלב זה פעיל "שמור בלבד". שאר הפעולות יחוברו בשלב 4B.4b.',
  nextActionActiveNote: 'בחרו מה יקרה מיד אחרי השמירה. תמיד אפשר לשמור בלבד ולהמשיך מאוחר יותר.',
  savedToast: 'הנכס נשמר ✓',
});

export const ARCHIVE_HE = Object.freeze({
  tab: 'ארכיון',
  activeTab: 'נכסים פעילים',
  title: 'ארכיון נכסים',
  subtitle: 'נכסים שהועברו לארכיון מוסתרים מהתצוגה הפעילה. מחיקה לצמיתות זמינה כאן בלבד.',
  empty: 'אין נכסים בארכיון.',
  restore: 'שחזור מארכיון',
  openObject: 'פתיחה',
  closeObject: 'סגירה',
});

// ===========================================================================
// Clean 4B.4b — Workflow Bridge: Asset Picker, Inventory Drafts, Open chooser
// ===========================================================================

export const PICKER_HE = Object.freeze({
  openFromTray: 'בחר נכס מספריית נכסים',
  openFromStudio: 'הוסף נכס מספריית נכסים',
  title: 'בחירת נכס מהספרייה',
  subtitle: 'חיפוש וסינון נכסים, ומשיכה שלהם אל העבודה.',
  searchPlaceholder: 'חיפוש לפי שם, קוד קטלוג או תגית…',
  filterType: 'סוג נכס',
  filterDestination: 'יעד',
  all: 'הכול',
  empty: 'לא נמצאו נכסים מתאימים.',
  emptyLibrary: 'ספריית הנכסים ריקה עדיין.',
  addToTray: 'הוסף למגש עבודה',
  inTray: 'נמצא במגש ✓',
  linkToProject: 'קשר לתיק הפתוח',
  linkedToProject: 'קושר לתיק ✓',
  noOpenProject: 'אין תיק עיצוב פתוח כרגע',
  openDetails: 'פרטי נכס',
  close: 'סגירה',
  ownerInternal: 'פנימי',
  ownerClient: 'לקוח',
});

export const INV_DRAFTS_HE = Object.freeze({
  sectionTitle: 'טיוטות מלאי מנכסים',
  sectionCaption: 'פריטים שסומנו כסחורה/מלאי בספריית הנכסים. טיוטה מקומית בלבד — אינה נשמרת במלאי האמיתי.',
  empty: 'אין טיוטות מלאי מנכסים עדיין.',
  openAsset: 'פתח נכס מקושר',
  addToTray: 'הוסף למגש עבודה',
  inTray: 'נמצא במגש ✓',
  createProject: 'צור תיק עיצוב',
  remove: 'הסר טיוטה',
  draftBadge: 'טיוטה',
  ownerInternal: 'פנימי',
  ownerClientPrefix: 'לקוח: ',
  createdFromAsset: 'נוצר מנכס',
});

export const OPEN_STUDIO_HE = Object.freeze({
  title: 'פתיחה בסטודיו',
  bodyAsset: 'איך להביא את הנכס לעבודה?',
  bodyProject: 'איך לפתוח את התיק בסטודיו?',
  addToCurrent: 'הוסף לעבודה הנוכחית',
  openAsNew: 'פתח כעיצוב חדש',
  saveCurrentFirst: 'שמור את העבודה הנוכחית לפני מעבר',
  replaceCurrent: 'החלף את העבודה הנוכחית',
  cancel: 'ביטול',
  addToCurrentHint: 'הנכס יתווסף למגש העבודה הקיים, מבלי לאבד דבר.',
  openAsNewHint: 'נשמור תחילה את העבודה הנוכחית כתיק, ואז נתחיל עבודה חדשה נקייה.',
  saveFirstHint: 'נשמור את העבודה הנוכחית כתיק עיצוב, ורק לאחר הצלחה נמשיך.',
  replaceHint: 'העבודה הנוכחית במגש תוחלף. כדאי לשמור קודם אם היא חשובה.',
  savedOkPrefix: 'נשמר כתיק: ',
  saveFailed: 'לא ניתן היה לשמור את העבודה הנוכחית. העבודה לא הוחלפה.',
  defaultProjectName: 'עבודה שמורה',
  proceed: 'המשך',
});

// ===========================================================================
// Inventory + Work Tray Core Flow — Hebrew (Clean 4C)
// ===========================================================================
export const INV_HE = Object.freeze({
  // Section titles
  sectionPhysical: 'מלאי פיזי',
  sectionSupplier: 'מלאי ספקים וירטואלי',
  sectionClient: 'סחורה של לקוח',
  sectionAssetDrafts: 'טיוטות מלאי מנכסים',
  physicalCaption: 'אבני וסחורת הסטודיו — כולל מלאי קריאה מ-Airtable ופריטים מקומיים.',
  supplierCaption: 'אבנים וירטואליות מספקים — לא במלאי הפיזי, זמינות לאישור.',
  clientCaption: 'סחורה בבעלות לקוח שהופקדה לעבודה.',
  emptyPhysical: 'אין עדיין פריטים מקומיים. הוסיפו פריט מלאי למעלה.',
  emptySupplier: 'אין אבני ספק וירטואליות.',
  emptyClient: 'אין סחורה של לקוח.',

  // Quick add
  quickAddTitle: 'הוסף פריט מלאי',
  quickAddOpen: 'הוסף פריט מלאי',
  quickAddClose: 'סגירה',
  titleLabel: 'שם הפריט',
  titlePlaceholder: 'לדוגמה: יהלום אובל 2ct',
  itemTypeLabel: 'סוג פריט',
  sourceLabel: 'מקור / בעלות',
  supplierNameLabel: 'שם ספק',
  clientNameLabel: 'שם לקוח',
  notesLabel: 'הערות',
  notesPlaceholder: 'הערות על הפריט…',
  stoneDataToggle: 'נתוני אבן (רשות)',
  add: 'הוספה',
  cancel: 'ביטול',

  // Item type options
  itemType: Object.freeze({
    stone: 'אבן',
    melee: 'חבילת מיליי',
    jewelryPart: 'חלק תכשיט',
    chain: 'שרשרת',
    component: 'רכיב',
    other: 'אחר',
  }),

  // Source options (for quick add)
  source: Object.freeze({
    manual: 'מלאי פיזי (שלי)',
    supplierVirtual: 'ספק וירטואלי',
    clientOwned: 'בבעלות לקוח',
  }),

  // Ownership labels
  ownership: Object.freeze({
    ownedPhysical: 'מלאי פיזי',
    supplierVirtual: 'ספק וירטואלי',
    clientOwned: 'בבעלות לקוח',
    internalDraft: 'טיוטה פנימית',
  }),

  // Availability
  availabilityLabel: 'זמינות',
  availability: Object.freeze({
    available: 'זמין',
    needsConfirmation: 'דורש אישור',
    reserved: 'שמור',
    unavailable: 'לא זמין',
    draft: 'טיוטה',
  }),

  // Stone fields
  stoneType: Object.freeze({
    naturalDiamond: 'יהלום טבעי',
    labDiamond: 'יהלום מעבדה',
    gemstone: 'אבן חן',
    naturalMelee: 'מיליי טבעי',
    labMelee: 'מיליי מעבדה',
    other: 'אחר',
  }),
  stoneTypeLabel: 'סוג אבן',
  shapeLabel: 'צורה',
  weightLabel: 'משקל (ct)',
  colorLabel: 'צבע',
  clarityLabel: 'ניקיון',
  measurementsLabel: 'מידות',
  certNumberLabel: "מס' תעודה",
  labLabel: 'מעבדה',
  cutLabel: 'חיתוך',
  fluorescenceLabel: 'פלואורסצנטיות',

  // Selection + actions
  select: 'בחירה',
  selected: 'נבחר',
  selectedCount: (n) => (n === 1 ? 'פריט אחד נבחר' : `${n} פריטים נבחרו`),
  clearSelection: 'נקה בחירה',
  addToTray: 'הוסף למגש עבודה',
  startDesign: 'התחל עיצוב מהבחירה',
  openTray: 'פתח במגש עבודה',
  startCollection: 'התחל קולקציה',
  startCollectionSoon: 'התחל קולקציה (בקרוב)',
  addedToTray: 'נוסף למגש העבודה ✓',
  inTray: 'במגש ✓',
  remove: 'הסרה',
  openAsset: 'פתח נכס',

  // Client / supplier inline
  clientPrefix: 'לקוח: ',
  supplierPrefix: 'ספק: ',
});

// ===========================================================================
// Clean 4C.1 — Inventory Item Detail + Active Work
// ===========================================================================

export const ACTIVE_WORK_HE = Object.freeze({
  activePrefix: 'עבודה פעילה: ',
  none: 'אין עבודה פעילה — ניתן לשמור את המגש כתיק עבודה',
  saveAsWork: 'שמור כעבודה',
  createNewWork: 'צור תיק עבודה חדש',
  updateExisting: 'עדכן עבודה קיימת',
  namePlaceholder: 'שם תיק העבודה',
  defaultName: 'תיק עבודה',
  savedToast: 'העבודה נשמרה ✓',
  updatedToast: 'העבודה עודכנה ✓',
  openProjects: 'פתח תיקי עבודה',
  needItems: 'הוסיפו פריטים למגש לפני שמירה כעבודה',
});

export const ITEM_DETAIL_HE = Object.freeze({
  openItem: 'פתח פריט מלאי',
  editItem: 'ערוך פריט מלאי',
  title: 'פריט מלאי',
  close: 'סגירה',
  save: 'שמור שינויים',
  saved: 'נשמר ✓',
  addToTray: 'הוסף למגש עבודה',
  inTray: 'נמצא במגש ✓',
  createWork: 'צור תיק עבודה מהפריט',
  openLinkedAsset: 'פתח נכס מקושר',
  addFilesViaAssets: 'הוסף קבצים דרך ספריית נכסים',
  noLinkedAsset: 'אין נכס מקושר לפריט זה',

  // field labels
  fieldTitle: 'שם הפריט',
  fieldItemType: 'סוג פריט',
  fieldOwnership: 'בעלות / מקור',
  fieldAvailability: 'זמינות',
  fieldClientName: 'שם לקוח',
  fieldSupplierName: 'שם ספק',
  fieldNotes: 'הערות',
  notesPlaceholder: 'הערות פנימיות על הפריט…',

  // stone fields
  stoneHeading: 'נתוני אבן',
  fieldStoneType: 'סוג אבן',
  fieldShape: 'צורה',
  fieldWeight: 'משקל (ct)',
  fieldColor: 'צבע',
  fieldClarity: 'ניקיון',
  fieldMeasurements: 'מידות',
  fieldCertNumber: 'מספר תעודה',
  fieldLab: 'מעבדה',
  notSet: '—',
  none: 'ללא',
});

// ===========================================================================
// Clean 4C.2 — Dashboard Guided Actions
// ===========================================================================

export const DASH_ACTIONS_HE = Object.freeze({
  eyebrow: 'מה תרצו לעשות עכשיו?',
  title: 'LESHEM.S OS',

  // Active Work section
  activeTitle: 'עבודה פעילה',
  activePrefix: 'עבודה פעילה: ',
  noActive: 'אין עבודה פעילה',
  noActiveHint: 'אפשר להתחיל עבודה חדשה — בחרו אבן או פריט והמשיכו לעיצוב.',
  openWork: 'פתח עבודה',
  openStudio: 'פתח סטודיו',
  openTray: 'פתח מגש',
  updateWork: 'עדכן עבודה',
  startNewWork: 'התחל עבודה חדשה',

  // Guided action cards
  guidedTitle: 'פעולות מהירות',
  cards: Object.freeze({
    design: Object.freeze({
      title: 'יש לי אבן ואני רוצה לעצב תכשיט',
      desc: 'התחילו מהמלאי — בחרו אבן והמשיכו לעיצוב.',
      cta: 'התחל עיצוב',
      glyph: '✦',
    }),
    addGoods: Object.freeze({
      title: 'הוסף סחורה למלאי',
      desc: 'הוספת אבן, פרסל, חלק או תכשיט למלאי.',
      cta: 'הוסף סחורה',
      glyph: '❖',
    }),
    clientStone: Object.freeze({
      title: 'לקוח הביא לי אבן או פריט',
      desc: 'הוספת סחורה בבעלות לקוח לעבודה.',
      cta: 'הוסף סחורת לקוח',
      glyph: '◈',
    }),
    continueWork: Object.freeze({
      title: 'המשך עבודה קיימת',
      desc: 'חזרה לעבודות ולתיקים האחרונים.',
      cta: 'המשך עבודה',
      glyph: '❒',
    }),
    openTray: Object.freeze({
      title: 'פתח מגש עבודה',
      desc: 'הפריטים שנבחרו לעבודה הנוכחית.',
      cta: 'פתח מגש עבודה',
      glyph: '▤',
    }),
    assets: Object.freeze({
      title: 'עבוד עם קבצים ונכסים',
      desc: 'תמונות, סקיצות, קבצי תלת־ממד ותעודות.',
      cta: 'עבוד עם קבצים',
      glyph: '▣',
    }),
    collection: Object.freeze({
      title: 'בנה קולקציה',
      desc: 'איגוד עבודות לקולקציה.',
      cta: 'בקרוב',
      glyph: '◇',
    }),
  }),
  comingSoon: 'בקרוב',

  // Recent work
  recentTitle: 'עבודות אחרונות',
  recentEmpty: 'אין עדיין עבודות שמורות.',
  recentOpen: 'פתח',
  recentUpdated: 'עודכן ',

  // Secondary module links
  modulesTitle: 'מעבר מהיר',
  modules: Object.freeze({
    inventory: 'מלאי',
    workTray: 'מגש עבודה',
    design: 'סטודיו עיצוב',
    projects: 'תיקי עבודה',
    assets: 'ספריית נכסים',
  }),
});
