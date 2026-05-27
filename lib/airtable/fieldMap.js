/**
 * lib/airtable/fieldMap.js  —  updated M5.2
 *
 * Single source of truth for every Airtable Hebrew (and English) field name.
 *
 * SERVER-SIDE ONLY for write operations.
 * normalize.js also imports STONE / METAL / JEWELRY for reads.
 *
 * ── Special character notes ───────────────────────────────────────────────────
 *
 * U+05F4 ״ (Hebrew Gershayim) appears in:
 *   'מק"ט'  'סה"כ'  'מ"מ'  — written directly in source as "
 *   Single-quoted JS strings avoid having to escape it.
 *
 * Backslash \ in field names:
 *   "צורה \\ ליטוש"  →  runtime string: צורה \ ליטוש
 *   "תמונות \\ וידאו" →  runtime string: תמונות \ וידאו
 *   'ID \\ מק"ט'      →  runtime string: ID \ מק"ט
 *
 * Trailing space in COLOR:
 *   STONE.COLOR is "צבע " (with one trailing space).
 *   This matches the exact Airtable field name.
 *   !! Do not let code formatters or linters strip the trailing space !!
 *   The trailing space is intentional and required for Airtable field lookup.
 */

// ─── Stone / Gem table ────────────────────────────────────────────────────────
// Referenced by: ENV AIRTABLE_STONES_TABLE
// Used by:       normalize.js (reads), create-stone.js (writes)

export const STONE = {
  // Identity
  // eslint-disable-next-line no-tabs
  SKU:              'ID \\ מק"ט',       // Runtime: ID \ מק"ט
  TITLE:            "תיאור פריט",
  INVENTORY_STATUS: "סטטוס מלאי",

  // Classification
  SHAPE:            "צורה \\ ליטוש",    // Runtime: צורה \ ליטוש
  PRODUCT_TYPE:     "סוג פריט",
  STONE_TYPE:       "סוג אבן",

  // Weight
  CARAT_WEIGHT:     'משקל קראט סה"כ',   // Runtime: משקל קראט סה"כ
  STONE_COUNT:      "מספר אבנים",
  AVG_STONE_WEIGHT: "משקל אבן ממוצע",

  // Supplier
  SUPPLIER_NAME:    "שם ספק",

  // Cost
  COST_USD:         "עלות בדולר",

  // Certificate / lab
  CERT_LAB:         "מקור תעודה",

  // Grading
  // IMPORTANT: "צבע " has an intentional trailing space — do NOT remove it.
  // This is the exact field name in the Airtable base.
  COLOR:            "צבע ",             // ← trailing space is required

  CLARITY:          "ניקיון",
  MEASUREMENTS:     "מידות",
  TREATMENT:        "טיפול",
  ORIGIN:           "ארץ מקור",
  LASER_INSCRIPTION:"חריטת לייזר",

  // M5.2 — product type metadata
  EXACT_PRODUCT_TYPE:  "סוג מוצר מדויק",
  DEFAULT_REPORT_TYPE: "סוג תעודה דיפולטיבית",

  // M5.2 — dimensional mm fields
  LENGTH_MM:        'אורך מ"מ',          // Runtime: אורך מ"מ
  WIDTH_MM:         'רוחב מ"מ',          // Runtime: רוחב מ"מ
  HEIGHT_MM:        'גובה מ"מ',          // Runtime: גובה מ"מ

  // M5.2 — fluorescence (Hebrew fields)
  FLUORESCENCE_INTENSITY: "עוצמת פלורסנציה",
  FLUORESCENCE_COLOR:     "צבע פלורסנציה",

  // M5.2 — grading (English field names in Airtable)
  POLISH:           "Polish",
  SYMMETRY:         "Symmetry",
  CUT_GRADE:        "Cut Grade",

  // M5.2 — gemstone-specific Hebrew fields
  TRANSPARENCY:     "שקיפות",
  GEM_CLARITY:      "ניקיון אבן חן",

  // M5.2 — additional English field names in Airtable
  CUT_FORM:              "Cut / Form",
  GROWTH_METHOD:         "Growth Method",
  FANCY_COLOR_INTENSITY: "Fancy Color Intensity",
  FANCY_COLOR_HUE:       "Fancy Color Hue",

  // M5.2 — report automation fields (English names in Airtable)
  REPORT_AUTO_GENERATE: "Report Auto Generate",  // boolean (checkbox)
  VERIFICATION_ID:      "Verification ID",
  VERIFICATION_URL:     "Verification URL",
  INTERNAL_NOTES:       "Internal Notes",

  // M5.0 read-only attachment fields (kept for normalize.js compat)
  IMAGES:    "תמונות \\ וידאו מלאי", // Runtime: תמונות \ וידאו מלאי
  CERT_IMAGE:"תמונה לתעודה",
  CERT_FILE: "קובץ תעודה גמולוגית",
};

// ─── Metal table ──────────────────────────────────────────────────────────────
// Referenced by: ENV AIRTABLE_METALS_TABLE

export const METAL = {
  TYPE:           "סוג מתכת",
  PRICE_PER_GRAM: "מחיר לגרם",
};

// ─── Jewelry table ────────────────────────────────────────────────────────────
// Referenced by: ENV AIRTABLE_JEWELRY_TABLE

export const JEWELRY = {
  SKU:            'מק"ט מוצר / דגם',
  PRODUCT_MODEL:  'מק"ט מוצר / דגם',
  PRODUCT_TYPE:   "סוג המוצר",
  LINKED_STONES:  "אבנים ורכיבים מקושרים",   // linked record IDs
  METAL_COLOR:    "צבע מתכת",
  METAL_KARAT:    "קראט / חומר ",
  METAL_WEIGHT:   "משקל מתכת - יציקה (גרם)",
  CASTING_METHOD: "שיטת יציקה",
  COMPLEXITY:     "רמת מורכבות ",
  RETAIL_PRICE:   "מחיר לצרכן כולל מעמ",
};

// ─── Reference maps (documentation / future tooling) ─────────────────────────

export const STONE_FIELD_MAP = {
  [STONE.SKU]:                  "sku",
  [STONE.TITLE]:                "title",
  [STONE.INVENTORY_STATUS]:     "inventoryStatus",
  [STONE.SHAPE]:                "shape",
  [STONE.PRODUCT_TYPE]:         "productType",
  [STONE.STONE_TYPE]:           "stoneType",
  [STONE.CARAT_WEIGHT]:         "caratWeight",
  [STONE.STONE_COUNT]:          "stoneCount",
  [STONE.AVG_STONE_WEIGHT]:     "averageStoneWeight",
  [STONE.SUPPLIER_NAME]:        "supplierName",
  [STONE.COST_USD]:             "costUsd",
  [STONE.CERT_LAB]:             "certificateLab",
  [STONE.COLOR]:                "color",
  [STONE.CLARITY]:              "clarity",
  [STONE.MEASUREMENTS]:         "measurementsRaw",
  [STONE.TREATMENT]:            "treatment",
  [STONE.ORIGIN]:               "origin",
  [STONE.LASER_INSCRIPTION]:    "laserInscription",
  [STONE.EXACT_PRODUCT_TYPE]:   "exactProductType",
  [STONE.DEFAULT_REPORT_TYPE]:  "defaultReportType",
  [STONE.POLISH]:               "polish",
  [STONE.SYMMETRY]:             "symmetry",
  [STONE.CUT_GRADE]:            "cutGrade",
  [STONE.TRANSPARENCY]:         "transparency",
  [STONE.GEM_CLARITY]:          "gemClarity",
  [STONE.CUT_FORM]:             "cutForm",
  [STONE.GROWTH_METHOD]:        "growthMethod",
  [STONE.FANCY_COLOR_INTENSITY]:"fancyColorIntensity",
  [STONE.FANCY_COLOR_HUE]:      "fancyColorHue",
  [STONE.REPORT_AUTO_GENERATE]: "reportAutoGenerate",
  [STONE.INTERNAL_NOTES]:       "internalNotes",
};

export const METAL_FIELD_MAP = {
  [METAL.TYPE]:           "metalType",
  [METAL.PRICE_PER_GRAM]: "pricePerGram",
};

export const JEWELRY_FIELD_MAP = {
  [JEWELRY.SKU]:            "sku",
  [JEWELRY.PRODUCT_MODEL]:  "productModel",
  [JEWELRY.PRODUCT_TYPE]:   "productType",
  [JEWELRY.LINKED_STONES]:  "linkedStoneIds",
  [JEWELRY.METAL_COLOR]:    "metalColor",
  [JEWELRY.METAL_KARAT]:    "metalKarat",
  [JEWELRY.METAL_WEIGHT]:   "metalWeight",
  [JEWELRY.CASTING_METHOD]: "castingMethod",
  [JEWELRY.COMPLEXITY]:     "complexity",
  [JEWELRY.RETAIL_PRICE]:   "retailPrice",
};
