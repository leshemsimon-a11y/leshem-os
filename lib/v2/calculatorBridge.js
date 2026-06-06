/**
 * lib/v2/calculatorBridge.js — v2.3
 *
 * Pure helper: builds the URL to hand off a single v2 asset to the MVP calculator.
 *
 * Usage:
 *   import { buildCalcBridgeUrl, CALC_ROLES } from '../../lib/v2/calculatorBridge';
 *   window.location.href = buildCalcBridgeUrl(asset._airtableId, 'center');
 *
 * The MVP receives ?v2item=recXXX&role=center and finds the matching item
 * from its own invStones array (normalizeStone shape), then calls
 * handleRoleChosenForCalc(item, role) → existing CalcLoadDialog → prefillCalcFromItem.
 *
 * No Airtable schema changes. No new API routes. No packages.
 */

/** Canonical role keys used by the MVP prefill logic. */
export const CALC_ROLES = {
  CENTER: 'center',
  SIDE:   'side',
  PART:   'part',
};

/**
 * Builds the MVP handoff URL.
 *
 * @param {string} airtableId  - The _airtableId from the v2 asset (starts with 'rec').
 * @param {string} role        - One of CALC_ROLES values.
 * @returns {string}           - e.g. "/?v2item=recXXX&role=center"
 */
export function buildCalcBridgeUrl(airtableId, role) {
  if (!airtableId || !role) return '/';
  const safeId   = encodeURIComponent(airtableId);
  const safeRole = encodeURIComponent(role);
  return `/?v2item=${safeId}&role=${safeRole}`;
}

/**
 * Role option definitions for the in-v2 role-selection modal.
 * Labels are Hebrew (UI language rule).
 * role values are canonical English (code rule).
 */
export const ROLE_OPTIONS = [
  {
    role:    CALC_ROLES.CENTER,
    icon:    '💎',
    label:   'אבן מרכזית',
    sub:     'Center Stone',
    primary: true,
  },
  {
    role:    CALC_ROLES.SIDE,
    icon:    '✦',
    label:   'אבני צד',
    sub:     'Side Stones',
    primary: false,
  },
  {
    role:    CALC_ROLES.PART,
    icon:    '⊟',
    label:   'רכיב / חלק תכשיט',
    sub:     'Jewelry Component',
    primary: false,
  },
];
