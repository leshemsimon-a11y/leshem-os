/**
 * lib/printCss.js  —  v5.2.3
 *
 * Change from v4.4.2:
 *
 * ── Printer-safe margins ─────────────────────────────────────────────────────
 *
 * BEFORE (v4.4.2): position:absolute; top:0; left:0; width:210mm; height:297mm
 *   → full-bleed print, certificate touches all four page edges.
 *   → some printers clip the top edge (security strip) or bottom (signature).
 *
 * AFTER (v5.2.3): position:fixed; top/left/right/bottom:12mm
 *   → 12mm safe margin on all sides.
 *   → Printable area: 186mm × 273mm (within A4 210mm × 297mm).
 *   → Certificate centred on the page with clean breathing room.
 *   → Signature / footer remains at bottom of the 273mm area (flex layout
 *     footer is flexShrink:0; body is flex:1; both adapt to 273mm).
 *
 * WHY position:fixed (not absolute):
 *   The preview shell wraps the certificate in a zoom div:
 *     <div style={{ transform: `scale(${zoom})` }}>
 *       <div className="printable-container" ... />
 *     </div>
 *   A CSS transform on a parent element establishes a new containing block for
 *   absolutely-positioned descendants. With position:absolute, the certificate
 *   would be positioned within the scaled coordinate space of the zoom wrapper,
 *   producing incorrect size and placement in print.
 *   position:fixed is ALWAYS relative to the viewport (page in print media),
 *   completely bypassing any ancestor transforms. This guarantees a 1:1
 *   size rendering at the stated dimensions regardless of the preview zoom
 *   level the user had set in the screen view.
 *
 * CONTENT BUDGET at 273mm:
 *   Security strip:  ~4px  (flexShrink:0)
 *   Footer:         ~50mm  (flexShrink:0 — always visible)
 *   Body:           ~221mm (flex:1, overflow:hidden — clips excess)
 *
 *   Typical fully-loaded report (header + sections + valuation): ~190–200mm.
 *   No clipping expected in normal usage.
 *   The body's content constraints (image maxHeight:34mm, description
 *   maxHeight:18mm, notes maxHeight:12mm from v4.4.3) prevent overflow.
 *
 * ── Unchanged from v4.4.2 ────────────────────────────────────────────────────
 * • @page { size: A4 portrait; margin: 0 } — precise page control
 * • body * { visibility: hidden } / .printable-container * { visible }
 * • .no-print { display: none } — hides editor and toolbar
 * • print-color-adjust: exact — preserves backgrounds and gradients
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

    /* ── Hide all content by default ── */
    * {
      visibility: hidden;
    }

    /* ── Remove editor, toolbar, navigation from print flow ── */
    .no-print {
      display: none !important;
      visibility: hidden !important;
    }

    /* ── Show only the certificate and its children ── */
    .printable-container,
    .printable-container * {
      visibility: visible !important;
    }

    /*
     * ── Position certificate with 12mm safe margins on all sides ──────────
     *
     * position: fixed   — relative to page, bypasses parent zoom transforms
     * top/left/right/bottom: 12mm — creates 12mm breathing room on every edge
     *
     * The explicit top/right/bottom/left constraints make width and height
     * implicit (auto):
     *   width  = 210mm − 12mm − 12mm = 186mm
     *   height = 297mm − 12mm − 12mm = 273mm
     *
     * The inline height:297mm on the template root is overridden by
     * height:auto !important here; the actual rendered height is 273mm
     * from the fixed positioning constraints.
     */
    .printable-container {
      position: fixed !important;
      top: 12mm !important;
      left: 12mm !important;
      right: 12mm !important;
      bottom: 12mm !important;

      width: auto !important;
      height: auto !important;
      min-height: 0 !important;
      max-height: none !important;

      overflow: hidden !important;

      /* Re-enforce flex layout (some browsers strip inline flex in print) */
      display: flex !important;
      flex-direction: column !important;

      box-shadow: none !important;
      transform: none !important;
      margin: 0 !important;

      /* Preserve all background colours and gradients in PDF export */
      -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
    }

  }
`;
