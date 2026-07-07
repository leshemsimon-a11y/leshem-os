# Clean 6B Hotfix — Duplicate Icon Exports

Small build-fix patch after Vercel failed on duplicate named exports in:

- `components/studio/design/shell/StudioIcons.js`

## Fix

- Removed the duplicate Clean 6B `RefreshIcon` export.
- Removed the duplicate Clean 6B `StyleIcon` export.
- Reused the existing `RefreshIcon` and `StyleIcon` exports already present earlier in the same file.

## Not changed

- No protected files touched.
- No stores touched.
- No DesignConceptPanel changes.
- No package/dependency changes.
- No localStorage/API/Airtable/render changes.

## Reason

Next.js/Turbopack does not allow duplicate named exports in the same module. The original Clean 6B patch accidentally defined `RefreshIcon` and `StyleIcon` twice.
