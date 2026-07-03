LESHEM.S OS — ROOT READY 4
Demo Inventory + Design Studio UX Compression, safely combined.

Why this package exists:
The UX Compression package from Claude was useful visually, but it removed the previous Demo Operating Layer wiring from Design Studio:
- demo fallback tray in StudioShell
- clickable demo stone strip
- demo selected-stone Inspector state
- demoInventoryLayer dependency
- demo gemstone helper exports

This ROOT_READY_4 package preserves ROOT_READY_3 demo inventory behavior and adds the safe Design Studio compression changes.

What it preserves:
- /studio/inventory
- /studio/inventory-demo
- demo inventory records
- localStorage-based demo customization
- demo Work Tray fallback
- demo stones visible in Design Studio when no real tray stones exist
- selecting a demo stone opens Inspector
- demo inspect image/data/actions
- all existing upload/inventory/Airtable logic untouched

Compression changes kept:
- Design Studio workflow rail is icon-first
- stale warning body moved into hover tooltip
- rail column tightened
- labels shortened: e.g. “מתכת בלבד”, “בחרו כיוון”
- canvas explanatory copy reduced
- command/status copy compacted
- concept shortDescription moved into hover tooltip
- no new dependencies

Upload instructions:
1. Open this zip.
2. Copy the CONTENTS into the GitHub project root.
3. Do not upload the zip itself.
4. Commit.
5. Wait for Vercel.
6. Test:
   - /studio/inventory
   - /studio/inventory-demo
   - /studio/design

Expected behavior:
- Demo stones appear in inventory.
- You can edit/customize demo stone data.
- You can send stones to the demo Work Tray.
- Design Studio shows demo stones if the real Work Tray is empty.
- Clicking a stone in the top strip opens Inspector.
- The Design Studio UI should be visually quieter than before.

Disable later:
- lib/studio/demoInventoryLayer.js
  set ENABLE_DEMO_OPERATING_LAYER = false
