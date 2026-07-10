# LESHEM.S OS — Clean 7B Rollback to Clean 7A Stable

Purpose: restore the stable Clean 7A Work File Backbone MVP after Clean 7B caused a client-side Studio error.

Restored from Clean 7A:
- components/studio/design/shell/StudioShell.js
- components/studio/projects/OutputPackPanel.js
- components/studio/projects/WorkFilesPanel.js
- lib/studio/outputPack.js
- pages/studio/projects.js

Neutralized 7B-only helpers with inert stubs:
- components/studio/shared/WorkAssetsPanel.js
- lib/studio/assetContext.js

No store internals, packages, APIs, Airtable, pricing, certificates, render engine, or persistence keys are changed.
