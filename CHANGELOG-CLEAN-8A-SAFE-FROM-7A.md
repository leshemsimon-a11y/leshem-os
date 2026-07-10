# Clean 8A Safe From 7A — Create Flow MVP

This package combines the 7B rollback-to-7A stable files with Clean 8A Create Flow MVP.

Purpose:
- Ensure `/studio/design` returns to the Clean 7A stable state if GitHub is still on broken 7B.
- Add the new guided Create Flow at `/studio/create`.
- Add a dashboard entry for “צור תכשיט חדש”.

Safety:
- `/studio/design` is restored to 7A stable via the rollback files.
- `/studio/workstation` is not promoted.
- No protected store internals are edited.
- No packages, APIs, Airtable, pricing, certificates, render engine, external AI, or persistence keys.

New capability:
- Guided creation flow: product type → style → Work Tray stones → reference text → free request → 3 local design directions → output pack → save as Work File.
