// components/studio/shared/tokens.js
//
// LESHEM.S OS — Studio Design Tokens (Clean 1)
//
// Single source of truth for the premium studio aesthetic:
//   ivory / pearl background, charcoal text, soft gold accents, dusty sage.
// Light and elegant — never a dark dashboard, never a generic admin panel.
//
// Fonts follow the brand: Merriweather (serif display) + DM Sans (data/body).
// Loaded in the shell via a standard <link>, no new packages.

export const tokens = {
  color: {
    // Surfaces — warm ivory / pearl
    ivory: '#FBF8F2',
    pearl: '#F4EFE6',
    canvas: '#FDFBF7',
    cardEdge: '#EBE4D6',

    // Ink — charcoal family
    charcoal: '#2B2824',
    ink: '#3A352E',
    inkSoft: '#6E665A',
    inkFaint: '#9C9384',

    // Accents — soft / muted gold
    gold: '#B8975A',
    goldSoft: '#CDB988',
    goldFaint: '#EADFC4',

    // Secondary — dusty sage
    sage: '#8A9684',
    sageFaint: '#E6EAE2',

    // States
    disabledText: '#B4AC9D',
    focusRing: '#B8975A',
  },
  font: {
    display: '"Merriweather", "Times New Roman", serif',
    body: '"DM Sans", "Helvetica Neue", Arial, sans-serif',
  },
  radius: {
    sm: '8px',
    md: '14px',
    lg: '22px',
  },
  shadow: {
    soft: '0 1px 2px rgba(43,40,36,0.04), 0 8px 24px rgba(43,40,36,0.05)',
    lift: '0 2px 6px rgba(43,40,36,0.06), 0 16px 40px rgba(43,40,36,0.08)',
  },
};

// Google Fonts href for Merriweather + DM Sans (loaded via <link>, no package).
export const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Merriweather:wght@300;400;700&display=swap';
