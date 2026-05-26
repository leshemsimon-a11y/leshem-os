/**
 * components/reports/ReportPreviewShell.jsx
 *
 * Thin shell that:
 *   1. Resolves which template to render based on reportType
 *   2. Provides a screen-view wrapper (light shadow, centred)
 *   3. Is NOT wrapped in no-print — its child template carries
 *      className="printable-container" which is the @media print anchor
 *
 * Props:
 *   reportType  {string}  "jewelry_valuation" | "inhouse_stone"
 *   reportData  {object}  Current report data from ReportEngine state
 */

import { JewelryValuationReport } from "./templates/JewelryValuationReport";
import { InHouseStoneReport }     from "./templates/InHouseStoneReport";

export function ReportPreviewShell({ reportType, reportData }) {
  // Resolve the correct template
  let Template = null;
  if (reportType === "jewelry_valuation") Template = JewelryValuationReport;
  if (reportType === "inhouse_stone")     Template = InHouseStoneReport;

  if (!Template) {
    return (
      <div
        style={{
          width:          "210mm",
          maxWidth:       "100%",
          minHeight:      "297mm",
          background:     "#FAF9F6",
          border:         "1px solid rgba(54,69,79,0.12)",
          borderRadius:   4,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          fontFamily:     "'DM Sans',sans-serif",
          fontSize:       13,
          color:          "#7a8e98",
        }}
      >
        No template for this report type yet.
      </div>
    );
  }

  return (
    // Screen wrapper — gives the A4 preview a subtle depth
    <div
      style={{
        boxShadow:   "0 2px 20px rgba(54,69,79,0.12)",
        borderRadius: 2,
        overflow:    "hidden",
        width:       "210mm",
        maxWidth:    "100%",
      }}
    >
      <Template data={reportData} />
    </div>
  );
}
