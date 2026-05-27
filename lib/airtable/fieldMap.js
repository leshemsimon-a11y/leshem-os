/**
 * lib/airtable/fieldMap.js
 *
 * Single source of truth for every Airtable Hebrew field name.
 *
 * NEVER import this in client-side components directly — it is imported
 * only by lib/airtable/normalize.js which is only called from API routes.
 *
 * ── Special characters in Hebrew field names ──────────────────────────────────
 *
 * U+05F4  ״  (Hebrew Punctuation Gershayim)
 *   Appears as the " character in: מק"ט  and  סה"כ
 *   These look like plain double-quotes but are the Unicode Gershayim.
 *   JS string literals: 'מק"ט'  (single-quoted to avoid escaping).
 *
 * Backslash \  in field names:
 *   Field names like "צורה \ ליטוש" and "תמונות \ וידאו" use a literal
 *   backslash as a visual separator inside the Airtable field name.
 *   In a JS double-quoted string: "צורה \\ ליטוש" → the string  צורה \ ליטוש
 *
 * ── If a field lookup silently fails ─────────────────────────────────────────
 *   Check these constants against the actual Airtable field names first.
 *   Airtable field names are case-sensitive and space-sensitive.
 *   The normalizer functions return null for missing fields — they never crash.
 */

// ─── Stone / Gem table ────────────────────────────────────────────────────────
//     Referenced by ENV: AIRTABLE_STONES_TABLE

export const STONE = {
  SKU:              'מק"ט',                    // U+05F4 gershayim — NOT regular "
  TITLE:            "תיאור פריט",
  INVENTORY_STATUS: "סטטוס מלאי",
  SHAPE:            "צורה \\ ליטוש",           // literal backslash in Airtable name
  PRODUCT_TYPE:     "סוג פריט",
  STONE_TYPE:       "סוג אבן",
  CARAT_WEIGHT:     "משקל קראט",
  STONE_COUNT:      'סה"כ מספר אבנים',         // U+05F4 gershayim
  AVG_STONE_WEIGHT: "משקל אבן ממוצע",
  COST_USD:         "עלות בדולר",
  IMAGES:           "תמונות \\ וידאו",         // literal backslash in Airtable name
  CERT_IMAGE:       "מלאי תמונה לתעודה",
  CERT_FILE:        "קובץ תעודה גמולוגית",
  CERT_LAB:         "מקור תעודה",
  COLOR:            "צבע",
  CLARITY:          "ניקיון",
  MEASUREMENTS:     "מידות",
  TREATMENT:        "טיפול",
  ORIGIN:           "ארץ מקור",
  LASER_INSCRIPTION:"חריטת לייזר",
};

// ─── Metal table ──────────────────────────────────────────────────────────────
//     Referenced by ENV: AIRTABLE_METALS_TABLE

export const METAL = {
  TYPE:           "סוג מתכת",
  PRICE_PER_GRAM: "מחיר לגרם",
};

// ─── Jewelry table ────────────────────────────────────────────────────────────
//     Referenced by ENV: AIRTABLE_JEWELRY_TABLE

export const JEWELRY = {
  SKU:            'מק"ט',                           // U+05F4 gershayim
  PRODUCT_MODEL:  "מוצר / דגם",
  PRODUCT_TYPE:   "סוג המוצר",
  LINKED_STONES:  "אבנים ורכיבים מקושרים",          // returns array of linked record IDs
  METAL_COLOR:    "צבע מתכת",
  METAL_KARAT:    "קראט / חומר",
  METAL_WEIGHT:   "משקל מתכת - יציקה (גרם)",
  CASTING_METHOD: "שיטת יציקה",
  COMPLEXITY:     "רמת מורכבות",
  RETAIL_PRICE:   "מחיר לצרכן כולל מעמ",
};

// ─── Reference maps: Hebrew field name → English camelCase key ────────────────
//     Used for documentation and future auto-mapping utilities.

export const STONE_FIELD_MAP = {
  [STONE.SKU]:              "sku",
  [STONE.TITLE]:            "title",
  [STONE.INVENTORY_STATUS]: "inventoryStatus",
  [STONE.SHAPE]:            "shape",
  [STONE.PRODUCT_TYPE]:     "productType",
  [STONE.STONE_TYPE]:       "stoneType",
  [STONE.CARAT_WEIGHT]:     "caratWeight",
  [STONE.STONE_COUNT]:      "stoneCount",
  [STONE.AVG_STONE_WEIGHT]: "averageStoneWeight",
  [STONE.COST_USD]:         "costUsd",
  [STONE.IMAGES]:           "inventoryImages",
  [STONE.CERT_IMAGE]:       "certificateImage",
  [STONE.CERT_FILE]:        "certificateFile",
  [STONE.CERT_LAB]:         "certificateLab",
  [STONE.COLOR]:            "color",
  [STONE.CLARITY]:          "clarity",
  [STONE.MEASUREMENTS]:     "measurementsRaw",
  [STONE.TREATMENT]:        "treatment",
  [STONE.ORIGIN]:           "origin",
  [STONE.LASER_INSCRIPTION]:"laserInscription",
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
