// components/studio/shared/tokens.js
//
// LESHEM.S OS — Studio Design Tokens (Clean 1)
//
// Single source of truth for the studio aesthetic, shared by ~60 components
// across Inventory, Work Tray, Asset Library, Shell/Nav, Dashboard, and the
// Design Studio's untouched panels (DesignConceptPanel/DesignOutputPanel).
//
// Global Visual Upgrade V1 (Clean 5E-Global): VALUES ONLY changed here — no
// key added, renamed, or removed, so every existing consumer keeps working
// unmodified. The new values follow the Design Studio Layout Reset direction
// (near-white/graphite, less gold, less rounded, restrained shadows) so the
// whole app reads consistently with the reset Design Studio. Reference
// values mirror components/studio/design/shell/studioResetStyle.js, which
// remains the scoped source for Design-Studio-only pieces.
//
// Fonts follow the brand: DM Sans for both display and body (was Merriweather
// serif for display) — a cleaner, more app-like typographic voice, matching
// the Design Studio reset. Loaded in the shell via a standard <link>, no new
// packages.

export const tokens = {
  color: {
    // Surfaces — near-white / light neutral gray (was warm ivory/pearl)
    ivory: '#F6F7F8',
    pearl: '#F3F4F6',
    canvas: '#FFFFFF',
    cardEdge: '#E5E7EB',

    // Ink — graphite / near-black family
    charcoal: '#14161A',
    ink: '#1F2226',
    inkSoft: '#6B7280',
    inkFaint: '#9CA3AF',

    // Accents — muted, restrained gold. Kept recognizable as a small accent
    // color (icons, tiny badges) but no longer a "shiny luxury" tone, and
    // goldFaint (the large-surface fill used for selected/badge backgrounds
    // throughout the app) is now near-neutral rather than a beige/gold wash.
    gold: '#A6824A',
    goldSoft: '#B8AFA0',
    goldFaint: '#F1EFEA',

    // Secondary — dusty sage (kept close to original; already restrained)
    sage: '#7C8B7E',
    sageFaint: '#EAEDEA',

    // States
    disabledText: '#B0B4BA',
    focusRing: '#14161A',

    // ---- Clean 5D — Visual Studio Shell (kept for backward compatibility;
    // still read by a few non-Design-Studio consumers). Retinted to the same
    // near-white/graphite direction.
    graphite: '#14161A',
    graphiteSoft: '#2A2D33',
    platinum: '#E5E7EB',
    platinumSoft: '#F1F2F4',
    ice: '#8A97A0',
    iceFaint: '#EEF0F2',
    blueprintLine: 'rgba(20,22,26,0.08)',
  },
  font: {
    display: '"DM Sans", "Helvetica Neue", Arial, sans-serif',
    body: '"DM Sans", "Helvetica Neue", Arial, sans-serif',
  },
  radius: {
    sm: '5px',
    md: '8px',
    lg: '12px',
    // Global Visual Upgrade V1 — reduced significantly (was a softer pill +
    // large canvas radius). Existing keys untouched, values only.
    pill: '999px',
    xl: '16px',
  },
  shadow: {
    soft: '0 1px 2px rgba(17,17,20,0.05), 0 4px 12px rgba(17,17,20,0.05)',
    lift: '0 2px 6px rgba(17,17,20,0.06), 0 10px 24px rgba(17,17,20,0.07)',
    // Global Visual Upgrade V1 — restrained depth cues (no logic).
    hairline: '0 0 0 1px rgba(17,17,20,0.05)',
    insetTop: 'inset 0 1px 0 rgba(255,255,255,0.6)',
    canvas: '0 1px 2px rgba(17,17,20,0.05), 0 12px 32px rgba(17,17,20,0.06)',
    railGlow: '0 6px 20px rgba(17,17,20,0.12)',
  },
};

// Google Fonts href for DM Sans (loaded via <link>, no package). Merriweather
// weights dropped since font.display no longer uses it.
export const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap';
