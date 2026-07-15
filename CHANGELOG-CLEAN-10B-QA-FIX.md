# Clean 10B — Atelier Functional Bridge — QA Fix

## QA fixes applied

- Require both a selected stone and a meaningful creation request before continuing.
- Include pasted text instructions in “מה הבנתי” and in direction generation.
- Pass actual reference text, URLs and file names into the existing brief/direction logic instead of only role counts.
- Preserve selected-stone order so the first selected stone remains the center stone.
- Reopen the inventory drawer with all currently selected stones marked.
- Persist uploaded/pasted files through the existing public Asset Library APIs (`createObjectWithFiles` + `linkObjectToProject`) and attach them to the Work File through the existing `assets` field.
- Prevent duplicate confirmation clicks while files and the Work File are being saved.
- Rebuild the brief after file persistence so saved reference metadata includes durable `assetId` values.
- Restore pasted text context when reopening a saved Atelier creation.

## Known limitation

- Existing asset metadata and file blobs are now persisted. Reopened reference thumbnails still depend on the existing Asset Library file-resolution UI, which is not yet rendered inside the Atelier chips.

## Safety

- No protected store internals changed.
- No new persistence key.
- No package changes.
- Legacy Studio UI untouched.
- `npm run build` passed on the merged Clean 10A baseline.
