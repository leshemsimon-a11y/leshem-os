/**
 * lib/printCss.js  —  v4.4.2
 *
 * ── What changed from v4.3.2 ────────────────────────────────────────────────
 *
 * ROOT CAUSE: The footer / signature was being pushed below the A4 page
 * because the print CSS had no height constraint on `.printable-container`
 * AND used `overflow:visible !important` which let content spill to page 2.
 *
 * FIX 1 — Lock container to exactly one A4 page:
 *   Added: `height: 297mm !important`
 *   This guarantees the container is exactly 297mm tall in print.
 *   Previously: no height → container grew with content → footer overflowed.
 *
 * FIX 2 — Stop content from pushing footer to page 2:
 *   Changed: `overflow: visible !important` → `overflow: hidden !important`
 *   The template now uses a flex-column layout (body + footer as separate
 *   flex children). The body has `minHeight:0; overflow:hidden` — it clips
 *   excess content. The footer has `flexShrink:0` — it cannot leave the page.
 *   `overflow:hidden` in print reinforces this at the container level.
 *   Previously: `overflow:visible` overrode the template's own overflow:hidden,
 *   allowing any content to bleed past A4 and push the footer to page 2.
 *
 * FIX 3 — Maintain flex layout in print context:
 *   Added: `display: flex !important; flex-direction: column !important`
 *   Some browsers strip or ignore inline flex in print media.
 *   Explicitly re-applying it in print CSS ensures the footer stays pinned.
 *
 * ── Unchanged from v4.3.2 ───────────────────────────────────────────────────
 * • `position: absolute !important; top:0; left:0` — report at page origin
 * • `transform: none !important` — cancels preview zoom scale in print
 * • `print-color-adjust: exact` — preserves backgrounds, gradients
 * • `.no-print { display:none !important }` — hides editor in print
 * • `@page { size: A4 portrait; margin: 0 }` — full 210×297mm canvas
 * • `html, body { width: 210mm }` — prevents browser auto-widening
 *
 * ── How the full print pipeline works ───────────────────────────────────────
 * 1. `* { visibility:hidden }` — hides everything by default.
 * 2. `.no-print { display:none !important }` — removes editor from print flow.
 * 3. `.printable-container, .printable-container * { visibility:visible }` —
 *    shows exactly the report and its children.
 * 4. `.printable-container { position:absolute; top:0; left:0 }` — places
 *    report at top-left of the A4 canvas.
 * 5. `height:297mm; overflow:hidden` — locks to one page, clips overflow.
 * 6. `display:flex; flex-direction:column` — maintains footer pinning.
 * 7. `print-color-adjust:exact` — preserves all background colors.
 * 8. `transform:none` — cancels any zoom transform from the preview shell.
 */

export const PRINT_CSS = `
  @media print {

    /* ── Page setup ── */
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

    /* ── Hide everything by default ── */
    * {
      visibility: hidden;
    }

    /* ── Hard-remove editor, toolbar, navigation from print flow ── */
    .no-print {
      display: none !important;
      visibility: hidden !important;
    }

    /* ── Show the report and all its children ── */
    .printable-container,
    .printable-container * {
      visibility: visible !important;
    }

    /* ── Position report at page origin; lock to exactly one A4 page ── */
    .printable-container {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      right: auto !important;
      bottom: auto !important;

      width: 210mm !important;
      max-width: 210mm !important;

      /* v4.4.2: Lock to exactly one A4 page height */
      height: 297mm !important;
      min-height: 0 !important;

      /* v4.4.2: Prevent content from spilling to page 2.
         Template uses flex-column: body clips overflow; footer always visible. */
      overflow: hidden !important;

      /* v4.4.2: Re-enforce flex layout in print context */
      display: flex !important;
      flex-direction: column !important;

      /* Preserve all background colors and gradients in PDF */
      -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;

      /* Remove screen-only decorative styles */
      box-shadow: none !important;

      /* Cancel any zoom/scale transform from the preview shell */
      transform: none !important;
      margin: 0 !important;
    }

  }
`;
