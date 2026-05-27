/**
 * pages/api/airtable/metals.js
 *
 * GET /api/airtable/metals
 *
 * Response (200):
 *   { metals: MetalObject[], count: number }
 *
 * Response (503):
 *   { error: string, metals: [] }
 */

import { fetchAirtableTable } from "../../../lib/airtable/client";
import { normalizeMetal }     from "../../../lib/airtable/normalize";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const tableId = process.env.AIRTABLE_METALS_TABLE;
  if (!tableId) {
    return res.status(503).json({
      error:  "AIRTABLE_METALS_TABLE environment variable is not set.",
      metals: [],
    });
  }

  const { records, error } = await fetchAirtableTable(tableId);

  if (error) {
    console.error("[/api/airtable/metals]", error);
    return res.status(503).json({
      error:  error,
      metals: [],
    });
  }

  const metals = records
    .map(normalizeMetal)
    .filter(Boolean);

  return res.status(200).json({
    metals,
    count: metals.length,
  });
}
