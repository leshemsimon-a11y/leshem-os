/**
 * pages/api/airtable/create-stone.js — v5.2.1-safe
 *
 * Creates inventory records in AIRTABLE_STONES_TABLE.
 * Security: Airtable token stays server-side only.
 */

import { STONE, STONE_COMPUTED_FIELDS } from "../../../lib/airtable/fieldMap";
import { createAirtableRecord } from "../../../lib/airtable/createRecords";

const PRODUCT_TYPE_LABELS = {
  natural_diamond: "Natural Diamond",
  lab_grown_diamond: "Lab-Grown Diamond",
  fancy_color_diamond: "Fancy Color Diamond",
  colored_gemstone: "Colored Gemstone",
  stone_pair_set: "Stone Pair / Set",
  stone_parcel: "Stone Parcel",
  jewelry_part: "Jewelry Part",
};

const REPORT_TYPE_LABELS = {
  natural_diamond: "Natural Diamond Report",
  lab_grown_diamond: "Lab-Grown Diamond Report",
  fancy_color_diamond: "Fancy Color Diamond Report",
  colored_gemstone: "Colored Gemstone Report",
  stone_pair_set: "Pair / Set Report",
  stone_parcel: "In-House Stone Report",
  jewelry_part: "None",
};

function str(value) {
  if (value === null || value === undefined) return undefined;
  const s = String(value).trim();
  return s !== "" ? s : undefined;
}

function num(value) {
  if (value === null || value === undefined || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function bool(value) {
  if (value === true || value === false) return value;
  return undefined;
}

function add(fields, key, value) {
  if (!key || value === null || value === undefined || value === "") return;
  fields[key] = value;
}

function itemTypeFor(productType) {
  if (productType === "stone_pair_set") return "Stone Pair / Set";
  if (productType === "stone_parcel") return "Stone Parcel";
  if (productType === "jewelry_part") return "Jewelry Part";
  return "Loose Stone";
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const tableId = process.env.AIRTABLE_STONES_TABLE;
  if (!tableId) {
    return res.status(503).json({ error: "AIRTABLE_STONES_TABLE environment variable is not set." });
  }

  try {
    const form = req.body || {};
    const fields = {};
    const productTypeKey = str(form.productType);
    const exactProductType = PRODUCT_TYPE_LABELS[productTypeKey] || str(form.productType);
    const defaultReportType = form.reportType === "None"
      ? "None"
      : (REPORT_TYPE_LABELS[form.reportType] || REPORT_TYPE_LABELS[productTypeKey] || str(form.reportType));

    // Core editable fields. Never send STONE.SKU — it is computed in Airtable.
    add(fields, STONE.NAME, str(form.title) || str(form.name));
    add(fields, STONE.STATUS, str(form.inventoryStatus) || str(form.status) || "במלאי");
    add(fields, STONE.SHAPE, str(form.shape));
    add(fields, STONE.ITEM_TYPE, itemTypeFor(productTypeKey));
    add(fields, STONE.TYPE, str(form.stoneType));
    add(fields, STONE.CARAT_WEIGHT, num(form.caratWeight) ?? num(form.carat));
    add(fields, STONE.STONE_COUNT, num(form.stoneCount));
    add(fields, STONE.SUPPLIER_NAME, str(form.supplierName) || str(form.supplier));
    add(fields, STONE.COST_USD, num(form.costUsd) ?? num(form.cost));

    // Certificate/external report info.
    add(fields, STONE.CERTIFICATE_LAB, str(form.certLab) || str(form.certImportLab));

    // Gemology.
    add(fields, STONE.COLOR, str(form.color) || str(form.colorGrade));
    add(fields, STONE.CLARITY, str(form.clarity));
    add(fields, STONE.TREATMENT, str(form.treatment));
    add(fields, STONE.ORIGIN, str(form.origin));
    add(fields, STONE.LASER_INSCRIPTION, str(form.laserInscription));

    add(fields, STONE.EXACT_PRODUCT_TYPE, exactProductType);
    add(fields, STONE.DEFAULT_REPORT_TYPE, defaultReportType);

    add(fields, STONE.LENGTH_MM, num(form.lengthMm) ?? num(form.measLength));
    add(fields, STONE.WIDTH_MM, num(form.widthMm) ?? num(form.measWidth));
    add(fields, STONE.HEIGHT_MM, num(form.heightMm) ?? num(form.measDepth));

    add(fields, STONE.FLUORESCENCE_INTENSITY, str(form.fluorescenceIntensity));
    add(fields, STONE.FLUORESCENCE_COLOR, str(form.fluorescenceColor));
    add(fields, STONE.POLISH, str(form.polish));
    add(fields, STONE.SYMMETRY, str(form.symmetry));
    add(fields, STONE.CUT_GRADE, str(form.cutGrade) || str(form.cut));
    add(fields, STONE.TRANSPARENCY, str(form.transparency));
    add(fields, STONE.GEM_CLARITY, str(form.gemClarity));
    add(fields, STONE.CUT_FORM, str(form.cutForm));
    add(fields, STONE.GROWTH_METHOD, str(form.growthMethod));
    add(fields, STONE.FANCY_COLOR_INTENSITY, str(form.fancyColorIntensity));
    add(fields, STONE.FANCY_COLOR_HUE, str(form.fancyColorHue));

    const reportAutoGenerate = bool(form.generateReport);
    if (reportAutoGenerate !== undefined) add(fields, STONE.REPORT_AUTO_GENERATE, reportAutoGenerate);
    add(fields, STONE.VERIFICATION_ID, str(form.verificationId));
    add(fields, STONE.VERIFICATION_URL, str(form.verificationUrl));

    // Store external certificate metadata in notes until dedicated upload/attachment flow exists.
    const certLines = [];
    if (form.certImportLab) certLines.push(`External lab: ${form.certImportLab}`);
    if (form.certImportReportNumber) certLines.push(`External report number: ${form.certImportReportNumber}`);
    if (form.certImportUrl) certLines.push(`External certificate URL: ${form.certImportUrl}`);
    if (form.intakeMethod === "certificate") certLines.push("AI extraction: pending future milestone.");
    if (form.rawCertText) {
      certLines.push("--- Certificate review text ---");
      certLines.push(String(form.rawCertText).slice(0, 800));
    }
    const noteParts = [];
    if (form.internalNotes) noteParts.push(String(form.internalNotes));
    if (certLines.length) noteParts.push(certLines.join("\n"));
    if (noteParts.length) add(fields, STONE.INTERNAL_NOTES, noteParts.join("\n\n"));

    // Safety net: strip all computed fields before POST.
    STONE_COMPUTED_FIELDS.forEach((fieldName) => { delete fields[fieldName]; });

    const { record, error } = await createAirtableRecord(tableId, fields);
    if (error) return res.status(500).json({ error });

    return res.status(201).json({ id: record.id, success: true });
  } catch (err) {
    const safe = String(err.message || err).replace(/pat[A-Za-z0-9._-]{20,}/g, "[TOKEN]");
    console.error("[create-stone]", safe);
    return res.status(500).json({ error: "Server error saving inventory item" });
  }
}
