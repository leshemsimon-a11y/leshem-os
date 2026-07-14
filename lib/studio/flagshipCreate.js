// lib/studio/flagshipCreate.js
//
// LESHEM.S OS — Clean 9A: Flagship Creation + Render Flow — pure helpers.
//
// PURE, deterministic, local logic only. NO store, NO persistence, NO
// network. Component-owned stage state only (no URL/query-param sync
// anywhere) — same discipline as Clean 8L's atelierCreate.js, extended to
// seven stages and three entry modes.

import {
  parseRequestHe,
  buildRequestUnderstandingHe,
  expectedProductTypeFor,
  directionsMatchProductType,
  enforceDirectionsProductType,
  centerStoneNameHe,
} from './goldenPath';
import { CREATIVITY_LEVEL } from './renderPrep';

export {
  parseRequestHe,
  buildRequestUnderstandingHe,
  expectedProductTypeFor,
  directionsMatchProductType,
  enforceDirectionsProductType,
  centerStoneNameHe,
};

// ---------------------------------------------------------------------------
// Stage model — the seven visible stages (spec).
// ---------------------------------------------------------------------------
export const FLAGSHIP_STAGE = Object.freeze({
  WELCOME: 'welcome',
  INTAKE: 'intake',
  UNDERSTANDING: 'understanding',
  DIRECTIONS: 'directions',
  REFINE: 'refine',
  RENDER_PREP: 'renderPrep',
  SAVE_PRESENT: 'savePresent',
});

export const FLAGSHIP_STAGE_ORDER = Object.freeze([
  FLAGSHIP_STAGE.WELCOME,
  FLAGSHIP_STAGE.INTAKE,
  FLAGSHIP_STAGE.UNDERSTANDING,
  FLAGSHIP_STAGE.DIRECTIONS,
  FLAGSHIP_STAGE.REFINE,
  FLAGSHIP_STAGE.RENDER_PREP,
  FLAGSHIP_STAGE.SAVE_PRESENT,
]);

export function previousFlagshipStage(stage) {
  const i = FLAGSHIP_STAGE_ORDER.indexOf(stage);
  return i > 0 ? FLAGSHIP_STAGE_ORDER[i - 1] : null;
}

// ---------------------------------------------------------------------------
// Entry modes — Welcome's three primary options. Purely a framing/copy
// concern: all three share the SAME Intake stage (no parallel routes) —
// entryMode only changes which affordance is emphasized there and whether a
// stone is required to continue.
// ---------------------------------------------------------------------------
export const ENTRY_MODE = Object.freeze({
  STONE: 'stone',
  IDEA: 'idea',
  COLLECTION: 'collection',
});

export function requiresStone(entryMode) {
  return entryMode === ENTRY_MODE.STONE;
}

// ---------------------------------------------------------------------------
// Creative-freedom inference (Stage 3 display + Stage 6 default). Purely
// textual: the 'free' style option already exists in createFlow.js's
// CREATE_STYLE_OPTIONS ("חופשי / פתוח") — if it was detected in the request,
// default to the FREE creativity level; otherwise BALANCED. This is a
// starting suggestion only; Stage 6 always lets the person change it.
// ---------------------------------------------------------------------------
export function inferCreativityLevel(styleMatches) {
  const list = Array.isArray(styleMatches) ? styleMatches : [];
  if (list.includes('free')) return CREATIVITY_LEVEL.FREE;
  return CREATIVITY_LEVEL.BALANCED;
}
