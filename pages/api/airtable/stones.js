/**
 * pages/api/airtable/stones.js
 *
 * GET /api/airtable/stones
 *
 * Response (200):
 *   { stones: StoneObject[], count: number }
 *
 * Response (503 — not configured or Airtable error):
 *   { error: string, stones: [] }
 *
 * Response (405 — wrong method):
 *   { error: string }
 *
 * ── Security ───────────────────────────────────────────────────────────────
 *   AIRTABLE_TOKEN is read from process.env here on the server.
 *   It is NEVER included in the JSON response sent to the browser.
 *   Next.js strips non-NEXT_PUBLIC_ env vars from all client bundles.
 */

import { fetchAirtableTable } from "../../../lib/airtable/client";
import { normalizeStone }     from "../../../lib/airtable/normalize";

export default async function handler(req, res) {
  // Only GET is supported
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Validate table env var
  const tableId = process.env.AIRTABLE_STONES_TABLE;
  if (!tableId) {
    return res.status(503).json({
      error:  "AIRTABLE_STONES_TABLE environment variable is not set.",
      stones: [],
    });
  }

  // Fetch from Airtable (server-side)
  const { records, error } = await fetchAirtableTable(tableId);

  if (error) {
    // Log the full error server-side for debugging
    console.error("[/api/airtable/stones]", error);
    return res.status(503).json({
      error:  error,
      stones: [],
    });
  }

  // Normalize and filter out any null results
  const stones = records
    .map(normalizeStone)
    .filter(Boolean);

  return res.status(200).json({
    stones,
    count: stones.length,
  });
}
