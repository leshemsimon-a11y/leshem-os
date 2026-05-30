/**
 * pages/api/airtable/update-stone.js  —  v5.4.1
 *
 * PATCH /api/airtable/update-stone
 *
 * Updates an existing Airtable stone record.
 *
 * Security:
 *   - AIRTABLE_TOKEN stays in process.env — never exposed to the client
 *   - Computed fields (SKU, ATTACHMENT_SUMMARY, TOTAL_WEIGHT) are stripped
 *     before the PATCH so Airtable doesn't reject the request
 *   - Record ID comes from the request body, not a URL param
 *   - Method guard: only PATCH is allowed
 *
 * Body: { id: string, ...fieldValues }
 *   id     — Airtable record ID (recXXX)
 *   Other fields match the same shape as create-stone.js body.
 *
 * Returns:
 *   { id: string, success: true }   on success
 *   { error: string }               on failure
 *
 * Note on attachment fields (CERT_IMAGE, INVENTORY_IMAGES):
 *   Airtable attachments are updated by sending an array of { url } objects.
 *   This route accepts certImageUrl / imageUrl as plain URL strings and
 *   wraps them in the required format.
 *   Existing attachments are REPLACED when new URLs are sent.
 *   If no URL is provided for an attachment field, that field is NOT sent
 *   (i.e. existing attachments are preserved).
 */

import { STONE, STONE_COMPUTED_FIELDS } from "../../../lib/airtable/fieldMap";

const AIRTABLE_API = "https://api.airtable.com/v0";

function addIfPresent(fields, key, value) {
  if (value === null || value === undefined || value === "") return;
  fields[key] = value;
}

function wrapAttachment(url) {
  if (!url || typeof url !== "string" || !url.startsWith("http")) return null;
  return [{ url }];
}

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed — use PATCH" });
  }

  if (!process.env.AIRTABLE_TOKEN) {
    return res.status(500).json({ error: "Server configuration error: AIRTABLE_TOKEN missing" });
  }
  if (!process.env.AIRTABLE_STONES_TABLE) {
    return res.status(500).json({ error: "Server configuration error: AIRTABLE_STONES_TABLE missing" });
  }

  const form = req.body || {};
  const recordId = form.id;

  if (!recordId || typeof recordId !== "string" || !recordId.startsWith("rec")) {
    return res.status(400).json({ error: "Missing or invalid record id — must be an Airtable record ID (recXXX)" });
  }

  try {
    const fields = {};

    // ── Core identity (never send computed SKU) ───────────────────────────
    addIfPresent(fields, STONE.TYPE,               form.stoneType);
    addIfPresent(fields, STONE.NAME,               form.name || form.title);
    addIfPresent(fields, STONE.SHAPE,              form.shape);
    addIfPresent(fields, STONE.ITEM_TYPE,          form.itemType);
    addIfPresent(fields, STONE.STATUS,             form.inventoryStatus || form.status);
    addIfPresent(fields, STONE.SUPPLIER_NAME,      form.supplierName);
    addIfPresent(fields, STONE.EXACT_PRODUCT_TYPE, form.productType);
    addIfPresent(fields, STONE.DEFAULT_REPORT_TYPE,form.defaultReportType);
    addIfPresent(fields, STONE.INTERNAL_NOTES,     form.internalNotes);

    // ── Weight & count (never send TOTAL_WEIGHT — computed) ───────────────
    addIfPresent(fields, STONE.CARAT_WEIGHT, form.caratWeight);
    addIfPresent(fields, STONE.STONE_COUNT,  form.stoneCount);
    addIfPresent(fields, STONE.COST_USD,     form.costUsd);

    // ── Measurements ──────────────────────────────────────────────────────
    addIfPresent(fields, STONE.LENGTH_MM, form.measLength);
    addIfPresent(fields, STONE.WIDTH_MM,  form.measWidth);
    addIfPresent(fields, STONE.HEIGHT_MM, form.measHeight);

    // ── Colour ────────────────────────────────────────────────────────────
    addIfPresent(fields, STONE.COLOR,                 form.color);
    addIfPresent(fields, STONE.CLARITY,               form.clarity);
    addIfPresent(fields, STONE.FANCY_COLOR_INTENSITY, form.fancyColorIntensity);
    addIfPresent(fields, STONE.FANCY_COLOR_HUE,       form.fancyColorHue);

    // ── Grading ───────────────────────────────────────────────────────────
    addIfPresent(fields, STONE.CUT_GRADE,    form.cutGrade);
    addIfPresent(fields, STONE.POLISH,       form.polish);
    addIfPresent(fields, STONE.SYMMETRY,     form.symmetry);
    addIfPresent(fields, STONE.CUT_FORM,     form.cutForm);
    addIfPresent(fields, STONE.GEM_CLARITY,  form.gemClarity);
    addIfPresent(fields, STONE.TRANSPARENCY, form.transparency);
    addIfPresent(fields, STONE.GROWTH_METHOD,form.growthMethod);
    addIfPresent(fields, STONE.TREATMENT,    form.treatment);
    addIfPresent(fields, STONE.ORIGIN,       form.origin);

    // ── Fluorescence ──────────────────────────────────────────────────────
    addIfPresent(fields, STONE.FLUORESCENCE_INTENSITY, form.fluorescenceIntensity);
    addIfPresent(fields, STONE.FLUORESCENCE_COLOR,     form.fluorescenceColor);

    // ── Inventory Studio optional fields ─────────────────────────────────
    addIfPresent(fields, STONE.INVENTORY_LAYER,       form.inventoryLayer);
    addIfPresent(fields, STONE.INTENDED_USE,          form.intendedUse);
    addIfPresent(fields, STONE.PHYSICAL_LOCATION,     form.physicalLocation);
    addIfPresent(fields, STONE.OWNER_CLIENT,          form.ownerClient);
    addIfPresent(fields, STONE.VIRTUAL_SUPPLIER,      form.virtualSupplier);
    addIfPresent(fields, STONE.SUPPLIER_AVAILABILITY, form.supplierAvailability);
    addIfPresent(fields, STONE.MEMO_NUMBER,           form.memoNumber);

    // ── Certificate identifiers stored as text in internal notes ─────────
    // Airtable has no dedicated cert lab / cert number text fields on the
    // Stones table; they live in CERT_LAB and LASER_INSCRIPTION fields.
    addIfPresent(fields, STONE.CERTIFICATE_LAB,          form.certLab);
    addIfPresent(fields, STONE.LASER_INSCRIPTION, form.laserInscription || form.certNumber);

    // ── Verification ──────────────────────────────────────────────────────
    addIfPresent(fields, STONE.VERIFICATION_ID,  form.verificationId);
    addIfPresent(fields, STONE.VERIFICATION_URL, form.verificationUrl);

    // ── Attachment fields — wrap URL strings as Airtable attachment objects
    // Only sent when user explicitly provides a URL; otherwise field is left alone
    const certImageAttach = wrapAttachment(form.certImageUrl);
    const invImageAttach  = wrapAttachment(form.imageUrl); // primary image URL
    if (certImageAttach) fields[STONE.CERTIFICATE_IMAGE]        = certImageAttach;
    if (invImageAttach)  fields[STONE.INVENTORY_IMAGES]  = invImageAttach;

    // ── Safety net: strip any computed field that crept in ────────────────
    STONE_COMPUTED_FIELDS.forEach((f) => { delete fields[f]; });

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ error: "No fields to update — all values were empty." });
    }

    // ── PATCH to Airtable ─────────────────────────────────────────────────
    const token   = process.env.AIRTABLE_TOKEN;
    const baseId  = process.env.AIRTABLE_BASE_ID;
    const tableId = process.env.AIRTABLE_STONES_TABLE;
    const url     = `${AIRTABLE_API}/${encodeURIComponent(baseId)}/${encodeURIComponent(tableId)}`;

    const airtableRes = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization:  `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [{ id: recordId, fields }],
      }),
    });

    if (!airtableRes.ok) {
      let body = "";
      try { body = await airtableRes.text(); } catch (_) {}
      const safe = body
        .replace(/pat[A-Za-z0-9._-]{20,}/g, "[REDACTED]")
        .slice(0, 400);
      return res.status(airtableRes.status).json({
        error: `Airtable error HTTP ${airtableRes.status}${safe ? `: ${safe}` : ""}`,
      });
    }

    const data = await airtableRes.json();
    const updated = data?.records?.[0];
    if (!updated?.id) {
      return res.status(500).json({ error: "Airtable returned no record in response." });
    }

    return res.status(200).json({ id: updated.id, success: true });

  } catch (err) {
    const safe = String(err.message || err).replace(/pat[A-Za-z0-9._]*/g, "[TOKEN]");
    console.error("[update-stone]", safe);
    return res.status(500).json({ error: "Server error updating stone record" });
  }
}
