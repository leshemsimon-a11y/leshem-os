/**
 * lib/airtable/normalize.js  —  v5.4.2
 *
 * Changes from v5.4.1:
 *
 * Language normalization pass (Milestone 5.4.2):
 *   All string fields that may contain Hebrew or mixed values from Airtable
 *   now go through a canonicalization step.
 *
 *   normalizeStone() now adds three extra properties for each normalized field:
 *
 *     productTypeKey   — canonical key (e.g. "natural_diamond")
 *     stoneTypeKey     — canonical key (e.g. "diamond")
 *     cutFormKey       — canonical key (e.g. "round_brilliant")
 *     inventoryLayerKey — canonical key (e.g. "physical_stock")
 *     intendedUseKey   — canonical key (e.g. "center_stone")
 *
 *   The raw values (productType, stoneType, etc.) are preserved as returned
 *   by Airtable so the UI can display them.
 *
 *   The canonical keys are used by:
 *     • buildStoneClassification() for English report labels
 *     • InventoryCard/InventoryDrawer for consistent UI label lookup
 *     • handleCertFromItem() in pages/index.js
 *
 *   This is SERVER-SIDE only.
 *   Rules (unchanged):
 *     • Never crash on missing or null fields — always use safe access.
 *     • Never return `undefined` — use `null` as the absent sentinel.
 *     • Numeric fields from Airtable arrive as JS numbers — keep them as-is.
 */

import { STONE, METAL, JEWELRY } from "./fieldMap";
import { toCanonical }           from "../labels/productLabels";

// ─── Internal helpers ─────────────────────────────────────────────────────────

function g(fields, key, defaultValue = null) {
  if (!fields) return defaultValue;
  const val = fields[key];
  if (val === undefined || val === null || val === "") return defaultValue;
  return val;
}

function firstAttachmentUrl(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  return raw[0]?.url ?? null;
}

function allAttachmentUrls(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((a) => a?.url).filter(Boolean);
}

function firstThumbnailUrl(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const first = raw[0];
  if (!first) return null;
  return (
    first.thumbnails?.large?.url ??
    first.thumbnails?.small?.url ??
    first.url ??
    null
  );
}

// ─── normalizeStone ───────────────────────────────────────────────────────────
export function normalizeStone(record) {
  if (!record) return null;
  const f = record.fields ?? {};

  // Media fields: try inventory images first, fall back to cert image
  const inventoryImagesRaw = f[STONE.INVENTORY_IMAGES] ?? null;
  const certImageRaw       = f[STONE.CERT_IMAGE]       ?? null;

  const inventoryImages = allAttachmentUrls(inventoryImagesRaw);
  const certImageUrl    = firstAttachmentUrl(certImageRaw);
  const thumbnailUrl    =
    firstThumbnailUrl(inventoryImagesRaw) ??
    firstThumbnailUrl(certImageRaw) ??
    null;

  // Raw values from Airtable (may be Hebrew)
  const rawProductType    = g(f, STONE.EXACT_PRODUCT_TYPE);
  const rawStoneType      = g(f, STONE.TYPE);
  const rawCutForm        = g(f, STONE.CUT_FORM);
  const rawInventoryLayer = g(f, STONE.INVENTORY_LAYER);
  const rawIntendedUse    = g(f, STONE.INTENDED_USE);

  return {
    id:               record.id ?? null,

    // ── Core ────────────────────────────────────────────────────────────────
    sku:              g(f, STONE.SKU),
    inventoryStatus:  g(f, STONE.STATUS),

    // Raw Airtable value (may be Hebrew or English or canonical key)
    productType:      rawProductType,
    stoneType:        rawStoneType,
    name:             g(f, STONE.NAME),
    caratWeight:      g(f, STONE.CARAT_WEIGHT),
    stoneCount:       g(f, STONE.STONE_COUNT),
    color:            g(f, STONE.COLOR),
    clarity:          g(f, STONE.GEM_CLARITY),
    cutGrade:         g(f, STONE.CUT_GRADE),
    cutForm:          rawCutForm,
    polish:           g(f, STONE.POLISH),
    symmetry:         g(f, STONE.SYMMETRY),
    fluorescenceIntensity: g(f, STONE.FLUORESCENCE_INTENSITY),
    fluorescenceColor:     g(f, STONE.FLUORESCENCE_COLOR),
    fancyColorIntensity:   g(f, STONE.FANCY_COLOR_INTENSITY),
    fancyColorHue:         g(f, STONE.FANCY_COLOR_HUE),
    transparency:     g(f, STONE.TRANSPARENCY),
    growthMethod:     g(f, STONE.GROWTH_METHOD),
    supplierName:     g(f, STONE.SUPPLIER_NAME),
    internalNotes:    g(f, STONE.INTERNAL_NOTES),
    reportAutoGenerate: g(f, STONE.REPORT_AUTO_GENERATE),
    verificationId:   g(f, STONE.VERIFICATION_ID),
    verificationUrl:  g(f, STONE.VERIFICATION_URL),

    // ── Measurements ──────────────────────────────────────────────────────
    measLength:       g(f, STONE.LENGTH_MM),
    measWidth:        g(f, STONE.WIDTH_MM),
    measHeight:       g(f, STONE.HEIGHT_MM),

    // ── Inventory Studio optional fields (v5.3) ───────────────────────────
    inventoryLayer:       rawInventoryLayer,
    physicalLocation:     g(f, STONE.PHYSICAL_LOCATION),
    ownerClient:          g(f, STONE.OWNER_CLIENT),
    virtualSupplier:      g(f, STONE.VIRTUAL_SUPPLIER),
    supplierAvailability: g(f, STONE.SUPPLIER_AVAILABILITY),
    memoNumber:           g(f, STONE.MEMO_NUMBER),
    intendedUse:          rawIntendedUse,
    visibleInInventory:   g(f, STONE.VISIBLE_IN_INVENTORY),
    archiveReason:        g(f, STONE.ARCHIVE_REASON),

    // ── Media ────────────────────────────────────────────────────────────
    thumbnailUrl,
    inventoryImages,
    certImageUrl,

    // ── Certificate identifiers (v5.3.1) ────────────────────────────────
    certLab:           g(f, STONE.CERT_LAB),
    laserInscription:  g(f, STONE.LASER_INSCRIPTION),

    // ── Media text URL fields (v5.4.1) ───────────────────────────────────
    videoUrl:          g(f, STONE.VIDEO_URL),
    certPdfUrl:        g(f, STONE.CERT_PDF_URL),
    imageUrlText:      g(f, STONE.IMAGE_URL_TEXT),

    // ── v5.4.2: Canonical keys ────────────────────────────────────────────
    // These are ALWAYS canonical keys (e.g. "natural_diamond"), resolved from
    // the raw Airtable value which may be Hebrew, English, or already canonical.
    // Used for report label lookup and product type routing.
    // If the raw value cannot be resolved, falls back to the raw value itself
    // so nothing is silently lost.
    productTypeKey:    toCanonical(rawProductType)    ?? rawProductType    ?? null,
    stoneTypeKey:      toCanonical(rawStoneType)      ?? rawStoneType      ?? null,
    cutFormKey:        toCanonical(rawCutForm)        ?? rawCutForm        ?? null,
    inventoryLayerKey: toCanonical(rawInventoryLayer) ?? rawInventoryLayer ?? null,
    intendedUseKey:    toCanonical(rawIntendedUse)    ?? rawIntendedUse    ?? null,
  };
}

// ─── normalizeMetal ───────────────────────────────────────────────────────────
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
export function normalizeJewelry(record) {
  if (!record) return null;
  const f = record.fields ?? {};
  return {
    id:           record.id ?? null,
    name:         g(f, JEWELRY.NAME),
    status:       g(f, JEWELRY.STATUS),
    metalType:    g(f, JEWELRY.METAL_TYPE),
    metalWeight:  g(f, JEWELRY.METAL_WEIGHT),
    stoneDesc:    g(f, JEWELRY.STONE_DESC),
    category:     g(f, JEWELRY.CATEGORY),
    clientName:   g(f, JEWELRY.CLIENT_NAME),
    price:        g(f, JEWELRY.PRICE),
    notes:        g(f, JEWELRY.NOTES),
    internalNotes: g(f, JEWELRY.INTERNAL_NOTES),
  };
}
