# Clean 6C Hard Rollback to Clean 6B.1 Stable

Purpose: recover Studio stability after Clean 6C caused a client-side exception.

This patch restores the Studio shell files and labels to the last known stable Clean 6B.1 versions, and neutralizes the 6C-only StudioProcessStrip file with an inert stub.

Changed files:
- components/studio/design/shell/StudioShell.js — restored to Clean 6B.1
- components/studio/design/shell/StudioCanvas.js — restored to Clean 6B.1
- components/studio/design/shell/StudioBottomStrip.js — restored to Clean 6B.1
- components/studio/design/shell/StudioIntentDrawer.js — restored to Clean 6B.1
- components/studio/design/shell/StudioIcons.js — restored to Clean 6B.1
- components/studio/design/shell/StudioProcessStrip.js — safety stub, no imports, returns null
- lib/studio/labels.js — restored to Clean 6B.1

No protected stores changed. No new packages. No persistence changes. No render/API work.
