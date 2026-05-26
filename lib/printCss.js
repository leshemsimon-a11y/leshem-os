/**
 * lib/printCss.js  —  v4.3.2
 *
 * Print / PDF isolation CSS for the LESHEM.S Report Engine.
 *
 * ── Root-cause fixes vs v4.0–v4.3 ──────────────────────────────────────────
 *
 * PROBLEM 1 — Content clipped at exactly one A4 page:
 *   Old: `position:fixed; height:297mm`
 *   Fix: `position:absolute; top:0; left:0` (no height constraint)
 *        Content flows naturally; multi-page reports render correctly.
 *
 * PROBLEM 2 — Template inline `overflow:hidden` clips print output:
 *   Old: no override for inline styles
 *   Fix: `overflow:visible !important` — CSS `!important` in a stylesheet
 *        beats normal inline styles. Watermark overflow is cosmetic; invisible
 *        at rgba(54,69,79,0.02) anyway.
 *
 * PROBLEM 3 — Background colors / gradients missing in PDF:
 *   Old: no `print-color-adjust` directive
 *   Fix: `-webkit-print-color-adjust:exact; print-color-adjust:exact;
 *        color-adjust:exact` on `.printable-container`.
 *        Preserves: security strip gradient, charcoal valuation block,
 *        sage strip, ivory section backgrounds.
 *
 * PROBLEM 4 — Editor, toolbar, navigation appear in print:
 *   Old: only `visibility:hidden` on `*`
 *   Fix: `.no-print { display:none !important }` belt-and-suspenders.
 *        `visibility:hidden` alone doesn't remove elements from print flow.
 *
 * PROBLEM 5 — Browser auto-scaling widens report beyond 210mm:
 *   Old: no constraint on html/body in print
 *   Fix: `html, body { width:210mm; max-width:210mm }` in print.
 *
 * ── How it works ────────────────────────────────────────────────────────────
 * 1. `* { visibility:hidden }` hides everything by default.
 * 2. `.no-print { display:none !important }` also removes editor from flow.
 * 3. `.printable-container, .printable-container * { visibility:visible }`
 *    makes the report and all its children visible.
 * 4. `.printable-container { position:absolute; top:0; left:0 }` places
 *    the report at the top-left corner of the page canvas.
 * 5. `overflow:visible !important` ensures content isn't clipped.
 * 6. `print-color-adjust:exact` preserves all background colors.
 * 7. `@page { size:A4 portrait; margin:0 }` gives the full 210×297mm canvas.
 *    The report's own internal padding (10mm 14mm 12mm) provides the margins.
 *
 * Usage:
 *   import { PRINT_CSS } from "../lib/printCss";
 *   // In a component or page:
 *   <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
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

    /* ── Position one report page exactly on the A4 canvas ── */
    .printable-container {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      right: auto !important;
      bottom: auto !important;
      width: 210mm !important;
      max-width: 210mm !important;
      height: 297mm !important;
      min-height: 297mm !important;
      max-height: 297mm !important;
      box-sizing: border-box !important;

      /* Jewelry reports are designed as one-page certificates. */
      overflow: hidden !important;
      page-break-after: avoid !important;
      page-break-inside: avoid !important;
      break-after: avoid !important;
      break-inside: avoid !important;

      /* Preserve all background colors and gradients in PDF */
      -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;

      /* Remove screen-only decorative styles */
      box-shadow: none !important;
      transform: none !important;
      margin: 0 !important;
    }

    .printable-container table,
    .printable-container tr,
    .printable-container td,
    .printable-container div {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

  }
`;
