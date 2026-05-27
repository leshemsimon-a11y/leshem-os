/**
 * pages/api/airtable/create-stone.js
 *
 * POST /api/airtable/create-stone
 *
 * Creates a new record in AIRTABLE_STONES_TABLE.
 * Used for: natural_diamond, lab_grown_diamond, fancy_color_diamond,
 *           colored_gemstone, stone_pair_set, stone_parcel, jewelry_part.
 *
 * Request body: flat object with English camelCase keys (see INITIAL_FORM
 *   in ProductIntakeWizard.jsx).
 *
 * Response (201): { id: string, success: true }
 * Response (400): { error: string }
 * Response (500): { error: string }
 * Response (503): { error: string }  — env not configured
 *
 * Security: AIRTABLE_TOKEN stays server-side. Never returned to browser.
 */

import { STONE } from "../../../lib/airtable/fieldMap";
import { createAirtableRecord } from "../../../lib/airtable/createRecords";

// ─── Product type → Airtable defaults ────────────────────────────────────────
const TYPE_DEFAULTS = {
  natural_diamond: {
    exactProductType:  "Natural Diamond",
    defaultReportType: "Natural Diamond Report",
    reportAutoGenerate: true,
  },
  lab_grown_diamond: {
    exactProductType:  "Lab-Grown Diamond",
    defaultReportType: "Lab-Grown Diamond Report",
    reportAutoGenerate: true,
  },
  fancy_color_diamond: {
    exactProductType:  "Fancy Color Diamond",
    defaultReportType: "Fancy Color Diamond Report",
    reportAutoGenerate: true,
  },
  colored_gemstone: {
    exactProductType:  "Colored Gemstone",
    defaultReportType: "Colored Gemstone Report",
    reportAutoGenerate: true,
  },
  stone_pair_set: {
    exactProductType:  "Stone Pair / Set",
    defaultReportType: "Pair / Set Report",
    reportAutoGenerate: true,
  },
  stone_parcel: {
    exactProductType:  "Stone Parcel",
    defaultReportType: "In-House Stone Report",
    reportAutoGenerate: false,
  },
  jewelry_part: {
    exactProductType:  "Jewelry Part",
    defaultReportType: "None",
    reportAutoGenerate: false,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns a number or undefined (never NaN or "") */
function num(v) {
  if (v === null || v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** Returns a non-empty string or undefined */
function str(v) {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s !== "" ? s : undefined;
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const tableId = process.env.AIRTABLE_STONES_TABLE;
  if (!tableId) {
    return res.status(503).json({
      error: "AIRTABLE_STONES_TABLE environment variable is not set.",
    });
  }

  const body = req.body;
  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "Request body must be a JSON object." });
  }

  const { productType, generateReport } = body;

  // Look up product-type-specific defaults
  const defaults = TYPE_DEFAULTS[productType] ?? {
    exactProductType:  productType ?? "Unknown",
    defaultReportType: "None",
    reportAutoGenerate: false,
  };

  // ── Merge certificate-import source info into internal notes ─────────────
  const noteParts = [];
  if (body.certImportLab || body.certImportReportNumber || body.certImportUrl) {
    const certParts = [
      body.certImportLab          && `Lab: ${body.certImportLab}`,
      body.certImportReportNumber && `Report #${body.certImportReportNumber}`,
      body.certImportUrl          && `URL: ${body.certImportUrl}`,
    ].filter(Boolean);
    if (certParts.length > 0) {
      noteParts.push(`[External Cert] ${certParts.join(" | ")}`);
    }
  }
  if (str(body.internalNotes)) {
    noteParts.push(str(body.internalNotes));
  }
  const combinedNotes = noteParts.length > 0 ? noteParts.join("\n") : undefined;

  // ── Build Airtable fields object ─────────────────────────────────────────
  // Key = exact Hebrew/English Airtable field name from fieldMap.js
  // Undefined values are filtered by createAirtableRecord

  const fields = {
    // Identity
    [STONE.SKU]:              str(body.sku),
    [STONE.TITLE]:            str(body.title),
    [STONE.INVENTORY_STATUS]: str(body.inventoryStatus) || "במלאי",

    // Classification
    [STONE.SHAPE]:     str(body.shape),
    [STONE.STONE_TYPE]:str(body.stoneType),

    // Weight
    [STONE.CARAT_WEIGHT]:     num(body.caratWeight),
    [STONE.STONE_COUNT]:      num(body.stoneCount),
    [STONE.AVG_STONE_WEIGHT]: num(body.avgStoneWeight),

    // Supplier / cost
    [STONE.SUPPLIER_NAME]: str(body.supplierName),
    [STONE.COST_USD]:      num(body.costUsd),

    // Certificate lab — prefer manual entry; fall back to cert-import lab
    [STONE.CERT_LAB]: str(body.certLab) || str(body.certImportLab),

    // Diamond grading
    // NOTE: STONE.COLOR is "צבע " with a trailing space — exact Airtable field name
    [STONE.COLOR]:          str(body.color),
    [STONE.CLARITY]:        str(body.clarity),
    [STONE.CUT_GRADE]:      str(body.cutGrade),
    [STONE.POLISH]:         str(body.polish),
    [STONE.SYMMETRY]:       str(body.symmetry),

    // Fluorescence
    [STONE.FLUORESCENCE_INTENSITY]: str(body.fluorescenceIntensity),
    [STONE.FLUORESCENCE_COLOR]:     str(body.fluorescenceColor),

    // Lab-grown
    [STONE.GROWTH_METHOD]: str(body.growthMethod),

    // Fancy color
    [STONE.FANCY_COLOR_INTENSITY]: str(body.fancyColorIntensity),
    [STONE.FANCY_COLOR_HUE]:       str(body.fancyColorHue),

    // Gemstone-specific
    [STONE.TRANSPARENCY]: str(body.transparency),
    [STONE.GEM_CLARITY]:  str(body.gemClarity),
    [STONE.CUT_FORM]:     str(body.cutForm),

    // Physical details
    [STONE.MEASUREMENTS]: str(body.measurements),
    [STONE.LENGTH_MM]:    num(body.lengthMm),
    [STONE.WIDTH_MM]:     num(body.widthMm),
    [STONE.HEIGHT_MM]:    num(body.heightMm),

    // Origin / traceability
    [STONE.TREATMENT]:        str(body.treatment),
    [STONE.ORIGIN]:           str(body.origin),
    [STONE.LASER_INSCRIPTION]:str(body.laserInscription),

    // Product-type metadata (from defaults, overridable)
    [STONE.EXACT_PRODUCT_TYPE]:  defaults.exactProductType,
    [STONE.DEFAULT_REPORT_TYPE]: defaults.defaultReportType,
    // generateReport from body if explicitly set, otherwise use type default
    [STONE.REPORT_AUTO_GENERATE]:
      typeof generateReport === "boolean" ? generateReport : defaults.reportAutoGenerate,

    // Verification (future milestone)
    [STONE.VERIFICATION_ID]:  str(body.verificationId),
    [STONE.VERIFICATION_URL]: str(body.verificationUrl),

    // Notes (merged cert-import source + manual notes)
    [STONE.INTERNAL_NOTES]: combinedNotes,
  };

  // ── Create record ─────────────────────────────────────────────────────────
  const { record, error } = await createAirtableRecord(tableId, fields);

  if (error) {
    console.error("[POST /api/airtable/create-stone]", error);
    return res.status(500).json({ error });
  }

  return res.status(201).json({ id: record.id, success: true });
}
