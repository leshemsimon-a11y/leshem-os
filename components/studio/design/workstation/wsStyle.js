// components/studio/design/workstation/wsStyle.js
//
// LESHEM.S OS — Clean 6D: Studio Workstation Prototype (scoped visual
// constants).
//
// Deliberately SEPARATE from BOTH components/studio/shared/tokens.js (the
// app-wide palette, imported by ~60 files) AND
// components/studio/design/shell/studioResetStyle.js (the stable live
// Studio's near-white reset). This module is imported ONLY by the Clean 6D
// workstation files under components/studio/design/workstation/* — the North
// Star dark/platinum/ivory direction never leaks into the live /studio/design
// screen or any other Studio surface.
//
// Presentational constants only — no logic, no state, no side effects.

export const ws = {
  color: {
    // Studio table / workstation depth — deep graphite, never pure black.
    page: '#111318',
    pageGlow:
      'radial-gradient(1200px 500px at 50% -10%, rgba(198,164,92,0.07), rgba(0,0,0,0) 60%), radial-gradient(900px 600px at 85% 110%, rgba(120,130,150,0.08), rgba(0,0,0,0) 55%)',

    // Layered glass/acrylic surfaces over the dark table.
    surface: 'rgba(255,255,255,0.045)',
    surfaceStrong: 'rgba(255,255,255,0.075)',
    surfaceSolid: '#181B21',
    sheet: '#FFFFFF', // light "document sheet" for reused light panels

    border: 'rgba(255,255,255,0.10)',
    borderStrong: 'rgba(255,255,255,0.18)',

    // Ivory / platinum text over the dark table.
    text: '#F2EEE6',
    textMuted: '#B4B7BE',
    textFaint: '#7E828B',

    // Subtle gold accents — hairlines, active states, never large fills.
    gold: '#C6A45C',
    goldSoft: 'rgba(198,164,92,0.16)',
    goldFaint: 'rgba(198,164,92,0.08)',

    // Primary action — ivory plate with graphite text (premium, not neon).
    primaryBg: '#F2EEE6',
    primaryText: '#14161A',

    danger: '#D8846B',
  },
  radius: {
    xs: '4px',
    sm: '7px',
    md: '10px',
    lg: '14px',
  },
  shadow: {
    hairline: '0 0 0 1px rgba(255,255,255,0.05)',
    card: '0 2px 10px rgba(0,0,0,0.35)',
    lift: '0 10px 34px rgba(0,0,0,0.45)',
  },
  font: {
    display: '"DM Sans", "Helvetica Neue", Arial, sans-serif',
    body: '"DM Sans", "Helvetica Neue", Arial, sans-serif',
  },
};
