# LESHEM.S OS — Clean 11A.3 Import Hotfix

## Scope
Import-only Vercel build repair. No UX/UI styling, layout, component behavior, persistence, render, or backend logic changed.

## Modified
- `components/atelier/DesignPalette.js`

## Fix
- `ATELIER_PRODUCT_OPTIONS` and `ATELIER_STYLE_OPTIONS` remain imported from `lib/atelier/livingAtelier.js`.
- Components Bank constants and helpers are imported from `lib/atelier/componentsBank.js`:
  - metal alloys, colors and metal definitions
  - settings, melee types/sizes and findings options
  - chain, earring-back and bail definitions
  - Components Bank lookup/selection helpers
  - `meleeTotalCarat`

## Import-trace note
`components/atelier/StoneRequestScreen.js` and `pages/atelier/index.js` appear in the Vercel trace because they consume `DesignPalette.js` transitively. The provided Clean 11A.3 source contains no direct misplaced Components Bank import in `StoneRequestScreen.js`; `pages/atelier/index.js` was not included in the supplied ZIP and does not need to be replaced for this import-only hotfix.

## Verification
- TypeScript JSX parser: passed for `DesignPalette.js` and `StoneRequestScreen.js`.
- Static import audit: no Components Bank identifier remains imported from `livingAtelier.js` in the supplied JavaScript files.
- ZIP integrity test: passed.

## Recommended commit
`Fix Atelier Components Bank imports`
