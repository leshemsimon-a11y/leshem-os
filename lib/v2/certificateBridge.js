/**
 * lib/v2/certificateBridge.js — v2.3
 *
 * Pure helper: builds the URL to hand off a single v2 asset to the MVP certificate engine.
 *
 * Usage:
 *   import { buildCertBridgeUrl } from '../../lib/v2/certificateBridge';
 *   window.location.href = buildCertBridgeUrl(asset._airtableId);
 *
 * The MVP receives ?v2cert=recXXX, finds the matching item from its own
 * invStones array (normalizeStone shape), then calls handleCertFromItem(item)
 * which uses the existing certSeed → ReportEngine pipeline.
 *
 * No Airtable schema changes. No new API routes. No packages.
 */

/**
 * Builds the MVP handoff URL for certificate creation.
 *
 * @param {string} airtableId  - The _airtableId from the v2 asset (starts with 'rec').
 * @returns {string}           - e.g. "/?v2cert=recXXX"
 */
export function buildCertBridgeUrl(airtableId) {
  if (!airtableId) return '/';
  const safeId = encodeURIComponent(airtableId);
  return `/?v2cert=${safeId}`;
}
