# Clean 6B Rollback Hotfix — restore Clean 6A Studio stability

Purpose: restore the Studio files to the last verified Clean 6A baseline after a client-side runtime exception appeared in the deployed Clean 6B flow-clarity patch.

Changed files restored from Clean 6A GitHub baseline:
- lib/studio/labels.js
- components/studio/design/shell/StudioShell.js
- components/studio/design/shell/StudioCanvas.js
- components/studio/design/shell/StudioBottomStrip.js
- components/studio/design/shell/StudioCommandBar.js
- components/studio/design/shell/StudioIntentDrawer.js
- components/studio/design/shell/StudioIcons.js

Intentionally removed / rolled back:
- Clean 6B breadcrumb/escape row
- Clean 6B browse-directions state
- Clean 6B selected-state direction action chips
- Clean 6B next-step hint line
- Clean 6B duplicate-added icon changes

Preserved:
- Clean 6A Studio Entry
- Multi-Stone Composition Board
- Concept Sketches
- Clean 5E Design Intent Layer
- Patch D / One Tray foundations

No protected stores touched. No new packages. No new persistence keys. No API/Airtable/render changes.

Next step after Vercel green: re-plan Clean 6B as a smaller two-file patch, preferably starting with labels/terminology only or a single safe navigation chip, not the whole flow-clarity bundle at once.
