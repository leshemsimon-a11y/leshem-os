/**
 * lib/airtable/normalize.js — v5.3-safe
 *
 * Converts Airtable records with Hebrew field names into clean app objects.
 * Safe on missing fields. Never returns undefined; absent values become null/[] where useful.
 *
 * v5.3-safe:
 * - Preserves all v5.2.1 normalized fields used by calculator/intake.
 * - Adds Inventory Studio fields and media.
 * - Normalizes product type into the slug keys used by InventoryCard icons/labels.
 */

import { STONE, METAL, JEWELRY } from "./fieldMap";

function g(fields, key, defaultValue = null) {
  if (!fields || !key) return defaultValue;
  const val = fields[key];
  if (val === undefined || val === null || val === "") return defaultValue;
  return val;
}

function parseMoney(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const cleaned = String(value).replace(/[^0-9.\-]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
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
  return first.thumbnails?.large?.url ?? first.thumbnails?.small?.url ?? first.url ?? null;
}

function normalizeProductType(value, stoneType) {
  const raw = String(value || stoneType || "").trim().toLowerCase();
  if (!raw) return null;
  if (raw.includes("lab")) return "lab_grown_diamond";
  if (raw.includes("fancy")) return "fancy_color_diamond";
  if (raw.includes("colored") || raw.includes("coloured") || raw.includes("gemstone") || raw.includes("ruby") || raw.includes("sapphire") || raw.includes("emerald")) return "colored_gemstone";
  if (raw.includes("pair") || raw.includes("set") || raw.includes("זוג") || raw.includes("סט")) return "stone_pair_set";
  if (raw.includes("parcel") || raw.includes("חבילה")) return "stone_parcel";
  if (raw.includes("part") || raw.includes("component") || raw.includes("chain") || raw.includes("חלק")) return "jewelry_part";
  if (raw.includes("finished") || raw.includes("jewelry") || raw.includes("תכשיט")) return "finished_jewelry";
  if (raw.includes("diamond") || raw.includes("יהלום")) return "natural_diamond";
  return value || null;
}

export function normalizeStone(record) {
  if (!record) return null;
  const f = record.fields ?? {};

  const inventoryImagesRaw = g(f, STONE.INVENTORY_IMAGES, []);
  const certImageRaw = g(f, STONE.CERTIFICATE_IMAGE, []);
  const certFileRaw = g(f, STONE.CERTIFICATE_FILE, []);
  const attachmentsRaw = g(f, STONE.ATTACHMENTS, []);

  const rawProductType = g(f, STONE.EXACT_PRODUCT_TYPE);
  const stoneType = g(f, STONE.TYPE);
  const productType = normalizeProductType(rawProductType, stoneType);

  const certificateLab = g(f, STONE.CERTIFICATE_LAB);

  return {
    id: record.id ?? null,

    // Core
    sku: g(f, STONE.SKU),
    title: g(f, STONE.NAME),
    name: g(f, STONE.NAME),
    inventoryStatus: g(f, STONE.STATUS),
    shape: g(f, STONE.SHAPE),
    stoneShape: g(f, STONE.SHAPE),
    itemType: g(f, STONE.ITEM_TYPE),
    productType,
    productTypeRaw: rawProductType,
    stoneType,
    caratWeight: g(f, STONE.CARAT_WEIGHT),
    stoneCount: g(f, STONE.STONE_COUNT),
    averageStoneWeight: g(f, STONE.AVERAGE_STONE_WEIGHT),
    metalTypeParts: g(f, STONE.METAL_TYPE_PARTS),
    metalWeightParts: g(f, STONE.METAL_WEIGHT_PARTS),
    totalWeight: g(f, STONE.TOTAL_WEIGHT),
    supplierName: g(f, STONE.SUPPLIER_NAME),
    costUsd: parseMoney(g(f, STONE.COST_USD)),

    // Gemological data
    color: g(f, STONE.COLOR),
    clarity: g(f, STONE.CLARITY) ?? g(f, STONE.GEM_CLARITY),
    gemClarity: g(f, STONE.GEM_CLARITY),
    measurementsRaw: g(f, STONE.MEASUREMENTS_RAW),
    treatment: g(f, STONE.TREATMENT),
    origin: g(f, STONE.ORIGIN),
    laserInscription: g(f, STONE.LASER_INSCRIPTION),
    certificateLab,
    certLab: certificateLab,
    certNumber: null,

    // Media / certificate files
    certificateFile: firstAttachmentUrl(certFileRaw),
    certificateImage: firstAttachmentUrl(certImageRaw),
    certImageUrl: firstAttachmentUrl(certImageRaw),
    inventoryImages: allAttachmentUrls(inventoryImagesRaw),
    attachments: allAttachmentUrls(attachmentsRaw),
    thumbnailUrl: firstThumbnailUrl(certImageRaw) ?? firstThumbnailUrl(inventoryImagesRaw) ?? firstThumbnailUrl(attachmentsRaw),

    // Report automation
    defaultReportType: g(f, STONE.DEFAULT_REPORT_TYPE),
    reportAutoGenerate: g(f, STONE.REPORT_AUTO_GENERATE),
    verificationId: g(f, STONE.VERIFICATION_ID),
    verificationUrl: g(f, STONE.VERIFICATION_URL),

    // Measurements
    measLength: g(f, STONE.LENGTH_MM),
    measWidth: g(f, STONE.WIDTH_MM),
    measHeight: g(f, STONE.HEIGHT_MM),

    // Grading / attributes
    fluorescenceIntensity: g(f, STONE.FLUORESCENCE_INTENSITY),
    fluorescenceColor: g(f, STONE.FLUORESCENCE_COLOR),
    cutGrade: g(f, STONE.CUT_GRADE),
    polish: g(f, STONE.POLISH),
    symmetry: g(f, STONE.SYMMETRY),
    transparency: g(f, STONE.TRANSPARENCY),
    cutForm: g(f, STONE.CUT_FORM) ?? g(f, STONE.SHAPE),
    growthMethod: g(f, STONE.GROWTH_METHOD),
    fancyColorIntensity: g(f, STONE.FANCY_COLOR_INTENSITY),
    fancyColorHue: g(f, STONE.FANCY_COLOR_HUE),
    internalNotes: g(f, STONE.INTERNAL_NOTES),

    // Inventory Studio fields
    inventoryLayer: g(f, STONE.INVENTORY_LAYER),
    physicalLocation: g(f, STONE.PHYSICAL_LOCATION),
    ownerClient: g(f, STONE.OWNER_CLIENT),
    virtualSupplier: g(f, STONE.VIRTUAL_SUPPLIER),
    supplierAvailability: g(f, STONE.SUPPLIER_AVAILABILITY),
    memoNumber: g(f, STONE.MEMO_NUMBER),
    intendedUse: g(f, STONE.INTENDED_USE),
    visibleInInventory: g(f, STONE.VISIBLE_IN_INVENTORY),
    archiveReason: g(f, STONE.ARCHIVE_REASON),

    // Media text URL placeholders (not required in Airtable schema)
    videoUrl: null,
    certPdfUrl: null,
    imageUrlText: null,
  };
}

export function normalizeMetal(record) {
  if (!record) return null;
  const f = record.fields ?? {};
  return {
    id: record.id ?? null,
    metalType: g(f, METAL.TYPE),
    pricePerGram: parseMoney(g(f, METAL.PRICE_PER_GRAM)),
  };
}

export function normalizeJewelry(record) {
  if (!record) return null;
  const f = record.fields ?? {};
  return {
    id: record.id ?? null,
    sku: g(f, JEWELRY.SKU),
    name: g(f, JEWELRY.SKU),
    productType: g(f, JEWELRY.PRODUCT_TYPE),
    metalColor: g(f, JEWELRY.METAL_COLOR),
    metalKarat: g(f, JEWELRY.METAL_KARAT),
    metalWeight: g(f, JEWELRY.METAL_WEIGHT),
    castingMethod: g(f, JEWELRY.CASTING_METHOD),
    complexity: g(f, JEWELRY.COMPLEXITY),
    retailPrice: parseMoney(g(f, JEWELRY.RETAIL_PRICE)),
    status: g(f, JEWELRY.STATUS),
    notes: g(f, JEWELRY.NOTES),
  };
}
