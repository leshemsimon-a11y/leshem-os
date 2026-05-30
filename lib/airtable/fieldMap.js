/**
 * lib/airtable/fieldMap.js — v5.3-safe
 *
 * Exact Airtable field names for LESHEM.S OS.
 * Important: some Airtable fields have Hebrew names and trailing spaces.
 * Do not trim or rename these constants unless the Airtable schema changes.
 *
 * v5.3-safe:
 * - Preserves the working v5.2.1 mappings.
 * - Adds Inventory Studio fields.
 * - Fixes Claude's incorrect field names for fluorescence / cut form / report defaults.
 */

// ─── Stones / inventory table ────────────────────────────────────────────────
export const STONE = {
  // Computed / formula / lookup / rollup fields — NEVER WRITE
  SKU: 'ID \\ מק"ט',
  AVERAGE_STONE_WEIGHT: 'משקל אבן ממוצע',
  TOTAL_WEIGHT: 'משקל כולל',
  ATTACHMENT_SUMMARY: 'Attachment Summary',
  LINKED_JEWELRY: 'ניהול ותמחור תכשיטים',

  // Editable core fields
  NAME: 'תיאור פריט',
  STATUS: 'סטטוס מלאי',
  SHAPE: 'צורה \\ ליטוש',
  ITEM_TYPE: 'סוג פריט',
  TYPE: 'סוג אבן',
  METAL_TYPE_PARTS: 'סוג מתכת - חלקים',
  CARAT_WEIGHT: 'משקל קראט סה"כ',
  STONE_COUNT: 'מספר אבנים',
  METAL_WEIGHT_PARTS: 'משקל מתכת - חלקים',
  SUPPLIER_NAME: 'שם ספק',
  COST_USD: 'עלות בדולר',

  INVENTORY_IMAGES: 'תמונות \\ וידאו מלאי',
  CERTIFICATE_IMAGE: 'תמונה לתעודה',
  CERT_IMAGE: 'תמונה לתעודה', // alias used by Inventory Studio
  CERTIFICATE_FILE: 'קובץ תעודה גמולוגית',
  CERTIFICATE_LAB: 'מקור תעודה',
  CERT_LAB: 'מקור תעודה', // alias
  ATTACHMENTS: 'Attachments',

  // eslint-disable-next-line no-trailing-spaces
  COLOR: 'צבע ', // trailing space is intentional
  CLARITY: 'ניקיון',
  MEASUREMENTS_RAW: 'מידות',
  TREATMENT: 'טיפול',
  ORIGIN: 'ארץ מקור',
  LASER_INSCRIPTION: 'חריטת לייזר',

  EXACT_PRODUCT_TYPE: 'סוג מוצר מדויק',
  DEFAULT_REPORT_TYPE: 'סוג תעודה דיפולטיבית',

  LENGTH_MM: 'אורך מ"מ',
  WIDTH_MM: 'רוחב מ"מ',
  HEIGHT_MM: 'גובה מ"מ',

  FLUORESCENCE_INTENSITY: 'עוצמת פלורסנציה',
  FLUORESCENCE_COLOR: 'צבע פלורסנציה',

  POLISH: 'Polish',
  SYMMETRY: 'Symmetry',
  CUT_GRADE: 'Cut Grade',
  TRANSPARENCY: 'שקיפות',
  GEM_CLARITY: 'ניקיון אבן חן',
  CUT_FORM: 'Cut / Form',
  GROWTH_METHOD: 'Growth Method',
  FANCY_COLOR_INTENSITY: 'Fancy Color Intensity',
  FANCY_COLOR_HUE: 'Fancy Color Hue',

  REPORT_AUTO_GENERATE: 'Report Auto Generate',
  VERIFICATION_ID: 'Verification ID',
  VERIFICATION_URL: 'Verification URL',
  INTERNAL_NOTES: 'Internal Notes',

  // Inventory Studio fields
  INVENTORY_LAYER: 'שכבת מלאי',
  PHYSICAL_LOCATION: 'מיקום פיזי',
  OWNER_CLIENT: 'בעלים / לקוח',
  VIRTUAL_SUPPLIER: 'ספק וירטואלי',
  SUPPLIER_AVAILABILITY: 'זמינות ספק',
  MEMO_NUMBER: 'Memo / Consignment No.',
  INTENDED_USE: 'מיועד לשימוש',
  VISIBLE_IN_INVENTORY: 'Visible in Inventory',
  ARCHIVE_REASON: 'Archive Reason',
};

export const STONE_COMPUTED_FIELDS = [
  STONE.SKU,
  STONE.AVERAGE_STONE_WEIGHT,
  STONE.TOTAL_WEIGHT,
  STONE.ATTACHMENT_SUMMARY,
  STONE.LINKED_JEWELRY,
];

// ─── Metals table ────────────────────────────────────────────────────────────
export const METAL = {
  TYPE: 'סוג מתכת',
  PRICE_PER_GRAM: 'מחיר לגרם',
  NOTES: 'Notes',
  ASSIGNEE: 'Assignee',
  STATUS: 'Status',
  ATTACHMENTS: 'Attachments',
  ATTACHMENT_SUMMARY: 'Attachment Summary',
  LINKED_JEWELRY: 'ניהול ותמחור תכשיטים',
};

export const METAL_COMPUTED_FIELDS = [
  METAL.ATTACHMENT_SUMMARY,
  METAL.LINKED_JEWELRY,
];

// ─── Jewelry table ───────────────────────────────────────────────────────────
export const JEWELRY = {
  SKU: 'מק"ט מוצר / דגם',
  PRODUCT_TYPE: 'סוג המוצר',
  LINKED_COMPONENTS: 'אבנים ורכיבים מקושרים',
  RAW_MATERIAL_COST: 'עלות חומרי גלם',
  CARAT_WEIGHT_ROLLUP: 'משקל קראט סה"כ Rollup (from אבנים ורכיבים מקושרים)',
  METAL_COLOR: 'צבע מתכת',
  // eslint-disable-next-line no-trailing-spaces
  METAL_KARAT: 'קראט / חומר ', // trailing space is intentional
  METAL_WEIGHT: 'משקל מתכת - יציקה (גרם)',
  CASTING_METHOD: 'שיטת יציקה',
  // eslint-disable-next-line no-trailing-spaces
  COMPLEXITY: 'רמת מורכבות ', // trailing space is intentional
  SETTING_MELEE: 'שיבוץ מלס (עד 0.04)',
  SETTING_SMALL: 'שיבוץ קטנות (0.05-0.19)',
  SETTING_MEDIUM_ROUND: 'שיבוץ בינוני עגול (0.20-0.99)',
  SETTING_MEDIUM_FANCY: 'שיבוץ בינוני פנטזי (0.20-0.99)',
  SETTING_LARGE: 'שיבוץ גדולות (1.00+)',
  FANCY_LARGE_SURCHARGE: 'תוספת פנטזי לגדולות',
  SETTING_STYLE: 'סגנון שיבוץ',
  SETTING_TOTAL_COST: 'סך עלות שיבוץ',
  // eslint-disable-next-line no-trailing-spaces
  METAL_PRICE_LINK: 'קישור למחירון מתכות ',
  PURE_METAL_PRICE: 'מחיר מתכת טהורה עדכני',
  // eslint-disable-next-line no-trailing-spaces
  METAL_COST_WITH_LOSS: 'עלות מתכת ופחת ',
  LABOR_AND_PLATING: 'עלויות עבודה וציפוי',
  PRODUCTION_COST: 'עלות ייצור',
  WHOLESALE_BEFORE_VAT: 'מחיר סיטונאי לפני מעמ',
  RETAIL_BEFORE_VAT: 'מחיר לצרכן לפני מעמ',
  RETAIL_PRICE: 'מחיר לצרכן כולל מעמ',
  NOTES: 'Notes',
  ASSIGNEE: 'Assignee',
  STATUS: 'Status',
  ATTACHMENTS: 'Attachments',
  ATTACHMENT_SUMMARY: 'Attachment Summary',

  // Backward-compatible aliases used by older UI/normalizers
  NAME: 'מק"ט מוצר / דגם',
  METAL_TYPE: 'צבע מתכת',
  STONE_DESC: 'אבנים ורכיבים מקושרים',
  CATEGORY: 'סוג המוצר',
  CLIENT_NAME: 'Assignee',
  PRICE: 'מחיר לצרכן כולל מעמ',
  INTERNAL_NOTES: 'Notes',
};

export const JEWELRY_COMPUTED_FIELDS = [
  JEWELRY.RAW_MATERIAL_COST,
  JEWELRY.CARAT_WEIGHT_ROLLUP,
  JEWELRY.SETTING_TOTAL_COST,
  JEWELRY.PURE_METAL_PRICE,
  JEWELRY.METAL_COST_WITH_LOSS,
  JEWELRY.PRODUCTION_COST,
  JEWELRY.WHOLESALE_BEFORE_VAT,
  JEWELRY.RETAIL_BEFORE_VAT,
  JEWELRY.ATTACHMENT_SUMMARY,
];
