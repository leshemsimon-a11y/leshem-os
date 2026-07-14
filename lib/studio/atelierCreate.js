// lib/studio/atelierCreate.js
//
// LESHEM.S OS — Clean 8L: Flagship Atelier Creation Experience — pure helpers.
//
// PURE, deterministic, local logic only. NO store, NO persistence, NO
// network, NO AI service. Used by
// components/studio/create/AtelierCreateShell.js to run the ONE flagship
// scenario ("יש לי אבן ואני רוצה לעצב לה תכשיט") as five visible states with
// component-owned stage state (no URL/query-param synchronization anywhere —
// that pattern caused flicker in a prior attempt and is deliberately not
// reintroduced here).
//
// This file adds exactly two things on top of what already exists:
//   1. ATELIER_STAGE — the five-state model + back/order helpers.
//   2. A thin, explicit re-export of the free-text parsing + product-type
//      enforcement helpers already reviewed and built in goldenPath.js
//      (parseRequestHe / buildRequestUnderstandingHe / expectedProductTypeFor
//      / enforceDirectionsProductType). Those are pure functions with no
//      state/stage/URL logic of their own — only createFlow.js's
//      PRODUCT_TO_BRIEF needed to become visible (one-line additive export)
//      for them to work in this baseline; nothing about them is unstable.

import {
  parseRequestHe,
  buildRequestUnderstandingHe,
  expectedProductTypeFor,
  directionsMatchProductType,
  enforceDirectionsProductType,
  centerStoneNameHe,
} from './goldenPath';

export {
  parseRequestHe,
  buildRequestUnderstandingHe,
  expectedProductTypeFor,
  directionsMatchProductType,
  enforceDirectionsProductType,
  centerStoneNameHe,
};

// ---------------------------------------------------------------------------
// Stage model — the five visible states (spec §1).
// ---------------------------------------------------------------------------
export const ATELIER_STAGE = Object.freeze({
  WELCOME: 'welcome',
  STONE_REQUEST: 'stoneRequest',
  UNDERSTANDING: 'understanding',
  DIRECTIONS: 'directions',
  REFINE: 'refine', // sub-view of STATE 5
  PRESENTATION: 'presentation', // sub-view of STATE 5
});

// STATE 5 covers both REFINE and PRESENTATION sub-views — kept as one entry
// here so "five visible states" stays literally true while still letting the
// component render two clearly different bodies for that one state.
export const ATELIER_STAGE_ORDER = Object.freeze([
  ATELIER_STAGE.WELCOME,
  ATELIER_STAGE.STONE_REQUEST,
  ATELIER_STAGE.UNDERSTANDING,
  ATELIER_STAGE.DIRECTIONS,
  ATELIER_STAGE.REFINE,
  ATELIER_STAGE.PRESENTATION,
]);

export function previousAtelierStage(stage) {
  const i = ATELIER_STAGE_ORDER.indexOf(stage);
  return i > 0 ? ATELIER_STAGE_ORDER[i - 1] : null;
}

// ---------------------------------------------------------------------------
// buildAtelierBrief — thin wrapper documenting the normalized creation brief
// shape the milestone asks for. It is DERIVED, not stored: every field here
// already exists on createFlow.js's buildCreateBrief output or is computed
// fresh from component state on every render.
// ---------------------------------------------------------------------------
export function describeAtelierBrief({ productType, style, metalPreference, selectedStone, freeTextIntention }) {
  return {
    productType: productType || null,
    style: style || null,
    metalPreference: metalPreference || null,
    selectedStone: selectedStone || null,
    freeTextIntention: freeTextIntention || '',
  };
}
