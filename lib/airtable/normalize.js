/**
 * lib/airtable/normalize.js
 *
 * Converts raw Airtable records { id, fields, createdTime } into clean,
 * flat, serializable objects with English camelCase keys.
 *
 * Rules enforced in every normalizer:
 *   • Never crash on missing or null fields — always use safe access
 *   • Never return `undefined` — use `null` as the absent sentinel
 *   • Attachment fields: return URL string(s), not the raw attachment object
 *   • Linked-record fields: return array of record ID strings, not objects
 *   • Numeric fields from Airtable arrive as JS numbers — keep them as-is
 *
 * Used only in pages/api/airtable/* — server-side only.
 */

import { STONE, METAL, JEWELRY } from "./fieldMap";

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Safely get a value from Airtable fields by Hebrew key.
 * Returns `defaultValue` (default: null) when field is absent, null, or "".
 */
function g(fields, key, defaultValue = null) {
  if (!fields) return defaultValue;
  const val = fields[key];
  if (val === undefined || val === null || val === "") return defaultValue;
  return val;
}

/**
 * Extract the URL from the first attachment in an Airtable attachment array.
 * Airtable attachment shape: [{ id, url, filename, size, type, thumbnails: {...} }]
 * Returns null if no valid attachment.
 */
function firstAttachmentUrl(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  return raw[0]?.url ?? null;
}

/**
 * Extract URLs from all attachments in an Airtable attachment array.
 * Returns [] if field is absent or not an array.
 */
function allAttachmentUrls(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((a) => a?.url).filter(Boolean);
}

/**
 * Extract thumbnail URL (small) from first attachment for preview use.
 * Falls back to full URL if thumbnail not present.
 */
function firstThumbnailUrl(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const first = raw[0];
  if (!first) return null;
  return (
    first.thumbnails?.large?.url   ??
    first.thumbnails?.small?.url   ??
    first.url                      ??
    null
  );
}

// ─── normalizeStone ───────────────────────────────────────────────────────────
/**
 * @param  {object} record   Raw Airtable record { id, fields, createdTime }
 * @returns {object|null}    Normalized stone object, or null if record is falsy
 */
export function normalizeStone(record) {
  if (!record) return null;
  const f = record.fields ?? {};

  return {
    // Airtable record ID (always present)
    id: record.id ?? null,

    // Core identity
    sku:              g(f, STONE.SKU),
    title:            g(f, STONE.TITLE),
    inventoryStatus:  g(f, STONE.INVENTORY_STATUS),

    // Classification
    productType:      g(f, STONE.PRODUCT_TYPE),
    stoneType:        g(f, STONE.STONE_TYPE),
    shape:            g(f, STONE.SHAPE),

    // Weight & grading
    caratWeight:        g(f, STONE.CARAT_WEIGHT),
    stoneCount:         g(f, STONE.STONE_COUNT),
    averageStoneWeight: g(f, STONE.AVG_STONE_WEIGHT),
    color:              g(f, STONE.COLOR),
    clarity:            g(f, STONE.CLARITY),
    measurementsRaw:    g(f, STONE.MEASUREMENTS),
    treatment:          g(f, STONE.TREATMENT),
    origin:             g(f, STONE.ORIGIN),
    laserInscription:   g(f, STONE.LASER_INSCRIPTION),

    // Cost
    costUsd: g(f, STONE.COST_USD),

    // Certificate
    certificateLab:   g(f, STONE.CERT_LAB),
    // Attachment fields: Airtable returns null or an array
    certificateFile:  firstAttachmentUrl(g(f, STONE.CERT_FILE, null)),
    certificateImage: firstThumbnailUrl(g(f, STONE.CERT_IMAGE, null)),

    // Inventory images (can be multiple)
    inventoryImages:  allAttachmentUrls(g(f, STONE.IMAGES, null)),
    // Convenience: first image thumbnail for list views
    thumbnailUrl:     firstThumbnailUrl(g(f, STONE.IMAGES, null)),
  };
}

// ─── normalizeMetal ───────────────────────────────────────────────────────────
/**
 * @param  {object} record
 * @returns {object|null}
 */
export function normalizeMetal(record) {
  if (!record) return null;
  const f = record.fields ?? {};

  return {
    id:           record.id ?? null,
    metalType:    g(f, METAL.TYPE),
    pricePerGram: g(f, METAL.PRICE_PER_GRAM),
  };
}

// ─── normalizeJewelry ─────────────────────────────────────────────────────────
/**
 * @param  {object} record
 * @returns {object|null}
 *
 * Note: `linkedStoneIds` is an array of Airtable record IDs (strings like "recXXX").
 * It does NOT contain the actual stone data. To resolve them, look them up in
 * the stones response by id.
 */
export function normalizeJewelry(record) {
  if (!record) return null;
  const f = record.fields ?? {};

  // Airtable linked-record fields return: ["recXXX", "recYYY", ...] or null
  const linkedRaw = g(f, JEWELRY.LINKED_STONES, null);

  return {
    id:             record.id ?? null,
    sku:            g(f, JEWELRY.SKU),
    productModel:   g(f, JEWELRY.PRODUCT_MODEL),
    productType:    g(f, JEWELRY.PRODUCT_TYPE),
    linkedStoneIds: Array.isArray(linkedRaw) ? linkedRaw : [],
    metalColor:     g(f, JEWELRY.METAL_COLOR),
    metalKarat:     g(f, JEWELRY.METAL_KARAT),
    metalWeight:    g(f, JEWELRY.METAL_WEIGHT),
    castingMethod:  g(f, JEWELRY.CASTING_METHOD),
    complexity:     g(f, JEWELRY.COMPLEXITY),
    retailPrice:    g(f, JEWELRY.RETAIL_PRICE),
  };
}
