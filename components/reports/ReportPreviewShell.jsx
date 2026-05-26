/**
 * components/reports/ReportPreviewShell.jsx  —  v4.3.2
 *
 * Routes reportType → correct template component.
 * Adds a screen-only print/save button (hidden when printing via .no-print).
 *
 * Changes vs v1:
 *   + Print / Save PDF button with className="no-print"
 *   + Empty state placeholder when no reportType selected
 *   ~ Props interface unchanged: { reportType, reportData }
 *
 * The .printable-container class lives on the template root divs
 * (JewelryValuationReport, InHouseStoneReport) — not on this shell.
 * This shell wrapper is intentionally unstyled so it never interferes with
 * the printable area.
 */

import { C } from "../../lib/constants";
import { JewelryValuationReport } from "./templates/JewelryValuationReport";
import { InHouseStoneReport }      from "./templates/InHouseStoneReport";

// ─── PrintBar ────────────────────────────────────────────────────────────────
function PrintBar() {
  return (
    <div
      className="no-print"
      style={{
        padding:        "0 0 12px",
        display:        "flex",
        justifyContent: "flex-end",
        alignItems:     "center",
      }}
    >
      <button
        onClick={() => window.print()}
        style={{
          height:         38,
          padding:        "0 18px",
          border:         "1px solid rgba(54,69,79,0.22)",
          borderRadius:   6,
          background:     C.ch,
          color:          "#FAF9F6",
          fontFamily:     C.heb,
          fontSize:       13,
          letterSpacing:  "0.04em",
          cursor:         "pointer",
          display:        "flex",
          alignItems:     "center",
          gap:            7,
          flexShrink:     0,
        }}
      >
        🖨 Print / Save PDF
      </button>
    </div>
  );
}

// ─── EmptyState ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div
      style={{
        width:          "210mm",
        maxWidth:       "100%",
        minHeight:      "120mm",
        background:     "#F5F3EF",
        border:         "1px dashed rgba(54,69,79,0.18)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
      }}
    >
      <p style={{ fontFamily: C.heb, fontSize: 13, color: "rgba(54,69,79,0.38)", margin: 0 }}>
        Select a report type to preview
      </p>
    </div>
  );
}

// ─── ReportPreviewShell ───────────────────────────────────────────────────────
export function ReportPreviewShell({ reportType, reportData }) {
  return (
    <div>
      <PrintBar />

      {reportType === "jewelry_valuation" && (
        <JewelryValuationReport data={reportData} />
      )}
      {reportType === "inhouse_stone" && (
        <InHouseStoneReport data={reportData} />
      )}
      {!reportType && <EmptyState />}
    </div>
  );
}
