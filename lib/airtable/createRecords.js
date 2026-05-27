/**
 * lib/airtable/createRecords.js  —  SERVER-SIDE ONLY
 *
 * ══ SECURITY: DO NOT import this file in client-side components ══
 *
 * Reads AIRTABLE_TOKEN from process.env (server-only).
 * Uses native fetch — no external packages.
 * Intended for use only in pages/api/airtable/* handlers.
 */

const AIRTABLE_API = "https://api.airtable.com/v0";

/**
 * Create a single record in an Airtable table.
 *
 * @param {string} tableId
 *   Airtable table name or ID (from the relevant AIRTABLE_*_TABLE env var).
 *
 * @param {object} fields
 *   { "Exact Airtable Field Name": value, ... }
 *   Undefined, null, and empty-string values are filtered out automatically.
 *   Boolean and numeric values are sent as-is (Airtable needs typed values
 *   for checkbox and number fields).
 *
 * @returns {Promise<{ record: object|null, error: string|null }>}
 *   record — the created Airtable record object { id, fields, createdTime }
 *   error  — null on success, human-readable string on failure
 */
export async function createAirtableRecord(tableId, fields) {
  // ── Validate env vars ─────────────────────────────────────────────────────
  const token  = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!token || !baseId) {
    return {
      record: null,
      error: [
        "Airtable is not configured.",
        !token  && "AIRTABLE_TOKEN is missing.",
        !baseId && "AIRTABLE_BASE_ID is missing.",
      ].filter(Boolean).join(" "),
    };
  }

  if (!tableId) {
    return { record: null, error: "Table ID is missing. Check the AIRTABLE_*_TABLE env var." };
  }

  // ── Filter empty values ───────────────────────────────────────────────────
  // Keep booleans and zero — only discard null, undefined, and empty strings.
  const cleanFields = Object.fromEntries(
    Object.entries(fields).filter(([, v]) => v !== null && v !== undefined && v !== "")
  );

  if (Object.keys(cleanFields).length === 0) {
    return { record: null, error: "No valid fields to save. All values were empty." };
  }

  // ── POST to Airtable ──────────────────────────────────────────────────────
  const url = `${AIRTABLE_API}/${encodeURIComponent(baseId)}/${encodeURIComponent(tableId)}`;

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization:  `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ records: [{ fields: cleanFields }], typecast: true }),
    });
  } catch (netErr) {
    return { record: null, error: `Network error reaching Airtable: ${netErr.message}` };
  }

  // ── Handle HTTP errors ────────────────────────────────────────────────────
  if (!res.ok) {
    let body = "";
    try { body = await res.text(); } catch (_) {}
    // Redact any token that might appear in error messages
    const safe = body
      .replace(/pat[A-Za-z0-9._-]{20,}/g, "[REDACTED]")
      .slice(0, 400);
    return {
      record: null,
      error: `Airtable responded with HTTP ${res.status}${safe ? `: ${safe}` : ""}`,
    };
  }

  // ── Parse response ────────────────────────────────────────────────────────
  let data;
  try {
    data = await res.json();
  } catch (e) {
    return { record: null, error: `Failed to parse Airtable JSON response: ${e.message}` };
  }

  const created = data?.records?.[0];
  if (!created?.id) {
    return { record: null, error: "Airtable returned no record in its response." };
  }

  return { record: created, error: null };
}
