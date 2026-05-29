/**
 * lib/printCss.js  —  v5.2.3.1
 *
 * HOTFIX — restores certificate print/PDF rendering.
 *
 * ── What broke in v5.2.3 ──────────────────────────────────────────────────
 *
 * v5.2.3 changed `.printable-container` to `position: fixed` in print media.
 * This caused a blank page on print / Save PDF in all major browsers.
 *
 * Root cause:
 *   The print strategy uses `body * { visibility: hidden }` to hide everything,
 *   then re-shows the report with `.printable-container * { visibility: visible }`.
 *   This trick requires the element to be part of the normal document render
 *   tree so that `visibility: visible !important` can override the parent's
 *   `visibility: hidden`.
 *
 *   `position: fixed` removes an element from the document flow and places it
 *   in the browser's overlay layer. In Chrome's print engine, fixed elements
 *   in a `body * { visibility: hidden }` context are NOT made visible even
 *   when their own `visibility: visible !important` is set — they render as
 *   a blank layer, producing a blank page.
 *
 *   Note: M4.3.2 also documented this: it explicitly changed FROM
 *   `position: fixed` TO `position: absolute` for this exact reason.
 *   M5.2.3 inadvertently reintroduced the known-broken pattern.
 *
 * ── Fix ───────────────────────────────────────────────────────────────────
 *
 * Reverted to `position: absolute` (the approach proven to work in v4.4.2).
 *
 * The printer-safe 12mm margins are preserved by adjusting the offset values
 * rather than changing the positioning model:
 *
 *   v4.4.2: position:absolute; top:0;   left:0;   width:210mm; height:297mm
 *   v5.2.3.1: position:absolute; top:12mm; left:12mm; width:186mm; height:273mm
 *
 *   Safe margin budget:
 *     Top:    12mm  (was 0 — adds safe top breathing room)
 *     Left:   12mm  (was 0 — adds safe left breathing room)
 *     Right:  12mm  (210 − 12 − 186 = 12mm implicit right margin)
 *     Bottom: 12mm  (297 − 12 − 273 = 12mm implicit bottom margin)
 *     Printable area: 186mm × 273mm (within A4 210mm × 297mm)
 *
 * ── Content budget at 273mm height ───────────────────────────────────────
 *
 *   The flex-column layout in the template (v4.4.3) adapts automatically:
 *   • Security strip:  ~4px (flexShrink:0)
 *   • Footer:         ~50mm (flexShrink:0, always visible at bottom)
 *   • Body:          ~221mm (flex:1, overflow:hidden)
 *
 *   The template's inline `height: "297mm"` is overridden by
 *   `height: 273mm !important` in print. The flex layout fills 273mm:
 *   footer stays at bottom, body clips any overflow.
 *
 *   Typical report body usage: ~160–185mm. No clipping in normal usage.
 *
 * ── Unchanged from v4.4.2 ────────────────────────────────────────────────
 * • `@page { size: A4 portrait; margin: 0 }` — page setup
 * • `body * { visibility: hidden }` — hide all content by default
 * • `.printable-container * { visibility: visible }` — show report
 * • `.no-print { display: none }` — remove editor/toolbar from print
 * • `transform: none` — cancel preview zoom scale
 * • `print-color-adjust: exact` — preserve backgrounds and gradients
 *
 * ── What was NOT changed in this hotfix ──────────────────────────────────
 * • "תעודות" terminology in ReportEngine.jsx and pages/index.js (from 5.2.3)
 * • Certificate templates (JewelryValuationReport, InHouseStoneReport)
 * • Report data model and calculations
 */

export const PRINT_CSS = `
  @media print {

    /* ── Page setup: A4, no browser default margins (we control margins below) */
    @page {
      size: A4 portrait;
      margin: 0;
    }

    html, body {
      width: 210mm !important;
      max-width: 210mm !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    /* ── Hide all content by default ────────────────────────────────────── */
    * {
      visibility: hidden;
    }

    /* ── Hard-remove editor column, toolbar, and navigation ─────────────── */
    .no-print {
      display: none !important;
      visibility: hidden !important;
    }

    /* ── Show only the certificate and its children ──────────────────────── */
    .printable-container,
    .printable-container * {
      visibility: visible !important;
    }

    /* ── Place certificate with 12mm printer-safe margins ───────────────────
     *
     * position: absolute — required (NOT fixed).
     *   - absolute works correctly with the visibility trick above.
     *   - fixed causes a blank page in Chrome because fixed elements in a
     *     body:visibility:hidden context are not re-shown by visibility:visible.
     *     (This was also the reason M4.3.2 switched away from position:fixed.)
     *
     * top: 12mm  — safe top margin (keeps content clear of printer hardware edge)
     * left: 12mm — safe left margin
     * width: 186mm = 210mm − 2×12mm — respects 12mm right margin implicitly
     * height: 273mm = 297mm − 2×12mm — respects 12mm bottom margin implicitly
     *
     * transform: none — cancels any preview zoom (e.g. 75%) from the
     *   preview shell's zoom wrapper so the certificate prints at 1:1 size.
     */
    .printable-container {
      position: absolute !important;
      top: 12mm !important;
      left: 12mm !important;
      right: auto !important;
      bottom: auto !important;

      width: 186mm !important;
      max-width: 186mm !important;

      /* Lock to safe A4 height (297mm − 24mm margins = 273mm) */
      height: 273mm !important;
      min-height: 0 !important;

      /* Clip any content that overflows — footer stays visible via flex */
      overflow: hidden !important;

      /* Re-enforce flex layout (some browsers ignore inline flex in print) */
      display: flex !important;
      flex-direction: column !important;

      /* Remove screen-only shadow */
      box-shadow: none !important;

      /* Cancel preview zoom transform */
      transform: none !important;

      margin: 0 !important;

      /* Preserve all background colours and gradients in PDF export */
      -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
    }

  }
`;
