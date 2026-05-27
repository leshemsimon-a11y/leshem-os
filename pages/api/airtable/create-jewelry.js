/**
 * pages/api/airtable/create-jewelry.js
 *
 * POST /api/airtable/create-jewelry
 *
 * Creates a new record in AIRTABLE_JEWELRY_TABLE.
 * Used for: finished_jewelry product type only.
 *
 * Response (201): { id: string, success: true }
 * Response (503): { error: string }  — env not configured
 * Response (500): { error: string }  — Airtable error
 *
 * Security: AIRTABLE_TOKEN stays server-side. Never returned to browser.
 */

import { JEWELRY } from "../../../lib/airtable/fieldMap";
import { createAirtableRecord } from "../../../lib/airtable/createRecords";

/** Returns a non-empty trimmed string or undefined */
function str(v) {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s !== "" ? s : undefined;
}

/** Returns a finite number or undefined */
function num(v) {
  if (v === null || v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const tableId = process.env.AIRTABLE_JEWELRY_TABLE;
  if (!tableId) {
    return res.status(503).json({
      error: "AIRTABLE_JEWELRY_TABLE environment variable is not set.",
    });
  }

  const body = req.body;
  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "Request body must be a JSON object." });
  }

  // ── Build Airtable fields object ──────────────────────────────────────────
  // Maps English form keys → exact Hebrew Airtable field names from fieldMap.js
  // If a field is missing in Airtable, createAirtableRecord returns an error
  // gracefully — the response will explain which field caused the issue.

  const skuOrModel = str(body.sku) || str(body.productModel);

  const fields = {
    // Airtable currently has one combined field: "מק״ט מוצר / דגם"
    [JEWELRY.SKU]:           skuOrModel,
    [JEWELRY.PRODUCT_TYPE]:  str(body.jewelryProductType) || "Finished Jewelry",
    [JEWELRY.METAL_COLOR]:   str(body.metalColor),
    [JEWELRY.METAL_KARAT]:   str(body.metalKarat),
    [JEWELRY.METAL_WEIGHT]:  num(body.metalWeight),
    [JEWELRY.CASTING_METHOD]:str(body.castingMethod),
    [JEWELRY.COMPLEXITY]:    str(body.complexity),
    [JEWELRY.RETAIL_PRICE]:  num(body.retailPrice),
  };

  const { record, error } = await createAirtableRecord(tableId, fields);

  if (error) {
    console.error("[POST /api/airtable/create-jewelry]", error);
    return res.status(500).json({ error });
  }

  return res.status(201).json({ id: record.id, success: true });
}
