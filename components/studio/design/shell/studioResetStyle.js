// components/studio/design/shell/studioResetStyle.js
//
// LESHEM.S OS — Design Studio Layout Reset (scoped visual constants).
//
// Deliberately SEPARATE from components/studio/shared/tokens.js, which is
// imported by ~60 files across Inventory / Work Tray / other Studio screens.
// Editing that shared file would leak this visual reset outside the Design
// Studio screen. This module is imported ONLY by the Design Studio shell
// files (components/studio/design/shell/*) and, for two narrowly-scoped
// additive pieces, by DesignConceptPanel.js (the Clean 5D-R4 Layout Reset
// exception approved for the 3-card quick style picker + concept carousel).
//
// Presentational constants only — no logic, no state, no side effects.
// Nothing here is exported from or read by any business-logic module.

export const reset = {
  color: {
    page: '#F6F7F8', // shell background — near-white, not beige/ivory
    panel: '#FFFFFF', // cards / panels
    border: '#E5E7EB',
    borderStrong: '#D1D5DB',

    text: '#14161A', // primary text — near-black / graphite
    textMuted: '#6B7280', // secondary text
    textFaint: '#9CA3AF',

    primaryBg: '#14161A', // primary button — black / graphite
    primaryText: '#FFFFFF',

    accent: '#B8975A', // tiny gold accent ONLY — never a background/surface
    accentFaint: '#F2ECDF',

    danger: '#B3452C',
  },
  radius: {
    xs: '3px',
    sm: '5px',
    md: '7px',
    lg: '10px',
  },
  shadow: {
    hairline: '0 0 0 1px rgba(17,17,20,0.04)',
    flat: '0 1px 2px rgba(17,17,20,0.05)',
    lift: '0 4px 16px rgba(17,17,20,0.10)',
  },
  font: {
    display: '"DM Sans", "Helvetica Neue", Arial, sans-serif',
    body: '"DM Sans", "Helvetica Neue", Arial, sans-serif',
  },
  // Clean 8K-R3 — Atelier Experience System (section 1: "consistent icon
  // size", "consistent spacing", "short, subtle transitions"). Purely
  // ADDITIVE — every value above is unchanged, so every existing consumer
  // of `reset` renders exactly as it did before this milestone.
  icon: {
    sm: '14px',
    md: '18px',
    lg: '22px',
  },
  space: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  transition: {
    fast: '120ms ease',
    base: '180ms ease',
  },
};
