# Install — Clean 11A.2 + 11A.3 (cumulative)

The Vercel failure was caused by a **partial upload**, not a defective ZIP.
`componentsBank.js` shipped in the 11A.2 slim ZIP; the repository appears to
have received 11A.3's three files without 11A.2's eight underneath them.

Adding `componentsBank.js` alone will NOT fix the build — it fails next on
`manufacturingSpec`, then on 14 named exports that only exist in the 11A.2
`livingAtelier.js`. This package contains **every file from both milestones**.

## Copy these 12 files into the repo, preserving paths

    lib/atelier/componentsBank.js          <- NEW (was missing)
    lib/atelier/manufacturingSpec.js       <- NEW (also missing)
    lib/atelier/livingAtelier.js           <- REPLACE
    lib/atelier/atelierBridge.js           <- REPLACE
    components/atelier/DesignPalette.js    <- REPLACE
    components/atelier/StoneRequestScreen.js <- REPLACE
    components/atelier/UnderstandingScreen.js <- REPLACE
    components/atelier/DirectionsScreen.js  <- REPLACE
    components/atelier/RenderStudioScreen.js <- REPLACE
    components/atelier/PendantVisualizer.js <- REPLACE
    components/atelier/atelier.module.css   <- REPLACE
    pages/atelier/index.js                  <- REPLACE

Nothing else changes. `lib/studio/**`, `components/studio/**`, `package.json`
and `package-lock.json` are untouched by both milestones — do not replace them.

## Verify before pushing

Run from the repository root. All 12 must print OK:

    for f in lib/atelier/componentsBank.js lib/atelier/manufacturingSpec.js \
             lib/atelier/livingAtelier.js lib/atelier/atelierBridge.js \
             components/atelier/DesignPalette.js components/atelier/StoneRequestScreen.js \
             components/atelier/UnderstandingScreen.js components/atelier/DirectionsScreen.js \
             components/atelier/RenderStudioScreen.js components/atelier/PendantVisualizer.js \
             components/atelier/atelier.module.css pages/atelier/index.js; do
      [ -f "$f" ] && echo "OK   $f" || echo "MISSING $f"
    done

Then confirm the two new modules resolve:

    grep -c "export function metalComponent" lib/atelier/componentsBank.js      # 1
    grep -c "export function buildGeometryPromptEn" lib/atelier/manufacturingSpec.js  # 1
    grep -c "componentGroupsFor" lib/atelier/livingAtelier.js                   # >=1

Finally, run the build locally before pushing — it has never been verified in
my environment (no network for `npm ci`):

    npm ci && npm run build

## Checksums

See MANIFEST.sha256 in this package. Verify with:

    sha256sum -c MANIFEST.sha256

## Files that must ALREADY exist (unchanged since 11A.1)

These six are imported by the package but were never modified, so they are not
included. They shipped with your 11A.1 baseline. If any is missing, the build
will fail on it next — verify:

    for f in JewelryIcon IntakeArea AtelierShell WelcomeScreen \
             InventoryDrawer CreationsDrawer; do
      [ -f "components/atelier/$f.js" ] && echo "OK   $f.js" || echo "MISSING $f.js"
    done

Also required and unchanged: `lib/studio/**` (inventoryStore, workTray,
designDraft, designProjects, createFlow, goldenPath, fileDetection, assetsStore,
renderPromptFinalizer, attachedAssets, outputPack, demoGemstoneAssets) and
`pages/api/atelier/render.js`.

## Why the first fix attempt would have failed

Adding only `componentsBank.js` resolves one import. The build then fails on:

1. `lib/atelier/manufacturingSpec.js` — imported by `atelierBridge.js`,
   `livingAtelier.js` and `PendantVisualizer.js`
2. Fourteen named exports that exist only in the 11A.2 `livingAtelier.js`:
   `METALS`, `METAL_ALLOY_OPTIONS`, `METAL_COLOR_OPTIONS`, `MELEE_TYPES`,
   `MELEE_SIZES`, `SETTING_TYPES`, `CHAIN_TYPES`, `EARRING_BACKS`,
   `BAIL_TYPES`, `componentGroupsFor`, `metalForSelection`, `meleeOption`,
   `meleeSizeOption`, `earringBackOption`

All 46 relative imports across this package were checked and resolve, and all
named imports were matched against the exports of their target module.
