/**
 * lib/printCss.js
 *
 * Injected once into <Head> by pages/index.js.
 *
 * Strategy — why visibility:hidden instead of display:none:
 *   display:none collapses elements, which causes the browser to
 *   recalculate the page height and produce a blank second page.
 *   visibility:hidden preserves the layout geometry, so only the
 *   .printable-container box flows into the print viewport.
 *
 * The .printable-container is pinned to position:fixed so it fills
 * exactly one A4 page regardless of screen scroll position.
 *
 * .no-print is the complementary utility class used on the header,
 * nav bar, and certificate toolbar — they disappear at print time
 * while remaining in the normal layout flow on screen.
 */

export const PRINT_CSS = `
  @media print {
    /* Hide the entire document tree … */
    * {
      visibility: hidden !important;
    }

    /* … then reveal only the certificate and every element inside it. */
    .printable-container,
    .printable-container * {
      visibility: visible !important;
    }

    /*
     * Pin the certificate to the top-left corner of the print viewport.
     * width/height match the A4 canvas declared in @page below.
     * overflow:hidden prevents any child overflow from spilling onto
     * a second blank page.
     */
    .printable-container {
      position:   fixed !important;
      inset:      0 !important;
      width:      210mm !important;
      height:     297mm !important;
      padding:    18mm !important;
      background: #FAF9F6 !important;
      box-sizing: border-box !important;
      overflow:   hidden !important;
      margin:     0 !important;
    }

    /* Remove browser-added page margins; guarantee portrait A4. */
    @page {
      size:   A4 portrait;
      margin: 0;
    }
  }

  /* Screen: utility class applied to header / nav / cert toolbar. */
  .no-print {
    display: block;
  }

  /* Print: hide all .no-print elements. */
  @media print {
    .no-print {
      display: none !important;
    }
  }
`;
