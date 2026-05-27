/**
 * lib/airtable/client.js  —  SERVER-SIDE ONLY
 *
 * ══ SECURITY: DO NOT import this file in client-side components ══
 *
 * This file reads AIRTABLE_TOKEN from process.env.
 * In Next.js, process.env variables WITHOUT the NEXT_PUBLIC_ prefix
 * are stripped from client bundles at build time — they exist only
 * in Node.js API route handlers and server-side functions.
 *
 * Importing this file in a client component would silently produce
 * undefined for all env vars (and no token would be sent), but to
 * be explicit: this file belongs only in:
 *   - pages/api/**
 *   - getServerSideProps / getStaticProps
 *   - lib/airtable/normalize.js (imported only by API routes)
 *
 * Uses native fetch — no external packages required (available in
 * Node.js 18+ which Next.js 13+ requires).
 */

const AIRTABLE_API = "https://api.airtable.com/v0";

/**
 * Maximum pages to fetch per request.
 * Airtable returns up to 100 records per page.
 * 10 pages × 100 = 1,000 records max. Increase if needed.
 */
const MAX_PAGES = 10;

/**
 * Fetch all records from an Airtable table, handling pagination automatically.
 *
 * @param {string} tableId
 *   The Airtable table ID or name. Pass the value of the relevant
 *   AIRTABLE_*_TABLE environment variable.
 *
 * @param {object} [options]
 * @param {string} [options.filterByFormula]
 *   Airtable formula to filter records, e.g. "{סטטוס מלאי}='במלאי'"
 * @param {number} [options.maxRecords]
 *   Hard cap on total records returned across all pages.
 *
 * @returns {Promise<{ records: object[], error: string|null }>}
 *   records — array of raw Airtable record objects { id, fields, createdTime }
 *   error   — null on success, human-readable string on failure
 */
export async function fetchAirtableTable(tableId, options = {}) {
  // ── Validate env vars ─────────────────────────────────────────────────────
  const token  = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!token || !baseId) {
    return {
      records: [],
      error: [
        "Airtable is not configured.",
        !token  && "AIRTABLE_TOKEN is missing.",
        !baseId && "AIRTABLE_BASE_ID is missing.",
      ].filter(Boolean).join(" "),
    };
  }

  if (!tableId) {
    return {
      records: [],
      error:   "Table ID is missing. Check the relevant AIRTABLE_*_TABLE env var.",
    };
  }

  // ── Paginated fetch ───────────────────────────────────────────────────────
  const allRecords = [];
  let   offset     = null;
  let   page       = 0;

  while (page < MAX_PAGES) {
    // Respect maxRecords if set
    if (options.maxRecords && allRecords.length >= options.maxRecords) break;

    // Build URL
    const url = new URL(
      `${AIRTABLE_API}/${encodeURIComponent(baseId)}/${encodeURIComponent(tableId)}`
    );

    if (options.filterByFormula) {
      url.searchParams.set("filterByFormula", options.filterByFormula);
    }
    if (options.maxRecords) {
      // Tell Airtable how many we need this page (remaining)
      const remaining = options.maxRecords - allRecords.length;
      url.searchParams.set("pageSize", String(Math.min(100, remaining)));
    }
    if (offset) {
      url.searchParams.set("offset", offset);
    }

    // HTTP request
    let res;
    try {
      res = await fetch(url.toString(), {
        method:  "GET",
        headers: {
          Authorization:  `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (netErr) {
      return {
        records: allRecords,
        error:   `Network error reaching Airtable: ${netErr.message}`,
      };
    }

    // HTTP error response
    if (!res.ok) {
      let body = "";
      try { body = await res.text(); } catch (_) {}
      // Redact token from any error messages
      const sanitized = body.replace(/pat[A-Za-z0-9._-]{20,}/g, "[REDACTED]").slice(0, 300);
      return {
        records: allRecords,
        error:   `Airtable responded with HTTP ${res.status}${sanitized ? `: ${sanitized}` : ""}`,
      };
    }

    // Parse JSON
    let data;
    try {
      data = await res.json();
    } catch (parseErr) {
      return {
        records: allRecords,
        error:   `Failed to parse Airtable JSON response: ${parseErr.message}`,
      };
    }

    // Accumulate records
    if (Array.isArray(data.records)) {
      allRecords.push(...data.records);
    }

    // Check for next page
    if (data.offset) {
      offset = data.offset;
      page++;
    } else {
      break; // No more pages — we have everything
    }
  }

  return { records: allRecords, error: null };
}
