/**
 * pages/api/airtable/jewelry.js
 *
 * GET /api/airtable/jewelry
 *
 * Response (200):
 *   { jewelry: JewelryObject[], count: number }
 *
 * Response (503):
 *   { error: string, jewelry: [] }
 *
 * Note on linkedStoneIds:
 *   Each jewelry object contains linkedStoneIds: ["recXXX", ...]
 *   These are Airtable record IDs of the linked stones/components.
 *   To get full stone data, cross-reference with GET /api/airtable/stones.
 *   Resolving linked records is out of scope for Milestone 5.0.
 */

import { fetchAirtableTable } from "../../../lib/airtable/client";
import { normalizeJewelry }   from "../../../lib/airtable/normalize";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const tableId = process.env.AIRTABLE_JEWELRY_TABLE;
  if (!tableId) {
    return res.status(503).json({
      error:   "AIRTABLE_JEWELRY_TABLE environment variable is not set.",
      jewelry: [],
    });
  }

  const { records, error } = await fetchAirtableTable(tableId);

  if (error) {
    console.error("[/api/airtable/jewelry]", error);
    return res.status(503).json({
      error:   error,
      jewelry: [],
    });
  }

  const jewelry = records
    .map(normalizeJewelry)
    .filter(Boolean);

  return res.status(200).json({
    jewelry,
    count: jewelry.length,
  });
}
