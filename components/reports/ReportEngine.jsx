/**
 * components/reports/ReportEngine.jsx
 *
 * Orchestrator for the entire Report Engine.
 *
 * State:
 *   reportType  {string|null}   null = show ReportTypeSelector
 *   reportData  {object|null}   null before a type is chosen
 *
 * setField(dotPath, value) — uses setDeep from reportUtils to do
 *   immutable nested updates on reportData. Handles paths like:
 *   "metal.weight", "stone.clarity", "externalReports.0.lab"
 *
 * Print architecture:
 *   • Editor column:      className="no-print"  → hidden at print time
 *   • Preview column:     NO no-print class     → .printable-container
 *     inside the template is the @media print anchor
 *   • Toolbar:            className="no-print"  → hidden at print time
 *   This mirrors the established pattern in lib/printCss.js.
 *
 * Props:
 *   calculatorData  {object}    { cfg, res, fmtFn, pieceImg, qNum }
 *   onBack          {function}  Navigate back to calculator tab
 */

import { useState, useCallback } from "react";
import { C }                         from "../../lib/constants";
import { setDeep }                   from "../../lib/reports/reportUtils";
import { REPORT_TYPES }              from "../../lib/reports/reportTypes";
import { createDefaultJewelryReport,
         createDefaultStoneReport }  from "../../lib/reports/reportDefaults";

import { ReportTypeSelector }  from "./ReportTypeSelector";
import { ReportEditor }        from "./ReportEditor";
import { ReportPreviewShell }  from "./ReportPreviewShell";

export function ReportEngine({ calculatorData = {}, onBack }) {
  const [reportType, setReportType] = useState(null);
  const [reportData, setReportData] = useState(null);

  // ── Dot-path field setter ──────────────────────────────────────────
  const setField = useCallback((path, value) => {
    setReportData((prev) =>
      prev ? setDeep(prev, path, value) : prev
    );
  }, []);

  // ── Type selected → create default data, enter editor ─────────────
  const handleSelectType = useCallback((type) => {
    const data =
      type === "jewelry_valuation"
        ? createDefaultJewelryReport(calculatorData)
        : createDefaultStoneReport({});
    setReportType(type);
    setReportData(data);
  }, [calculatorData]);

  // ── Re-sync jewelry report from current calculator state ───────────
  const handleRefreshFromCalc = useCallback(() => {
    if (reportType === "jewelry_valuation") {
      setReportData(createDefaultJewelryReport(calculatorData));
    }
  }, [reportType, calculatorData]);

  // ── Back to type selector ──────────────────────────────────────────
  const handleChangeType = useCallback(() => {
    setReportType(null);
    setReportData(null);
  }, []);

  // ── No type selected → show selector ──────────────────────────────
  if (!reportType || !reportData) {
    return (
      <ReportTypeSelector
        onSelect={handleSelectType}
        onBack={onBack}
      />
    );
  }

  const typeInfo = REPORT_TYPES[reportType];

  return (
    <div>

      {/* ════ TOOLBAR (hidden on print) ══════════════════════════════ */}
      <div
        className="no-print"
        style={{
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
          marginBottom:   20,
          gap:            12,
          flexWrap:       "wrap",
        }}
      >
        {/* Left actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={onBack}
            style={TOOL_BTN}
          >
            ← מחשבון
          </button>
          <button
            onClick={handleChangeType}
            style={{ ...TOOL_BTN, fontSize: 12, color: C.chl }}
          >
            ⇄ Report Type
          </button>
          {reportType === "jewelry_valuation" && (
            <button
              onClick={handleRefreshFromCalc}
              style={{ ...TOOL_BTN, fontSize: 12, color: C.chl }}
              title="Re-sync report fields from the current calculator state"
            >
              ↺ Sync from Calculator
            </button>
          )}
        </div>

        {/* Centre label */}
        <span
          style={{
            fontFamily: "'DM Sans',Helvetica,Arial,sans-serif",
            fontSize:   12,
            color:      C.chl,
            fontStyle:  "italic",
          }}
        >
          {typeInfo.label} · Edit any field · preview updates on blur
        </span>

        {/* Print */}
        <button
          onClick={() => window.print()}
          style={{
            height:         44,
            padding:        "0 24px",
            background:     C.ch,
            color:          C.iv,
            border:         "none",
            borderRadius:   6,
            cursor:         "pointer",
            fontFamily:     C.heb,
            fontSize:       14,
            fontWeight:     600,
            display:        "flex",
            alignItems:     "center",
            gap:            8,
          }}
        >
          <span style={{ fontSize: 18 }}>🖨️</span>
          הדפס / PDF
        </button>
      </div>

      {/* ════ EDITOR + PREVIEW ═══════════════════════════════════════ */}
      {/*
        CRITICAL PRINT STRUCTURE:
        • The flex wrapper has NO no-print class.
        • Editor column has className="no-print" → display:none at print time.
        • Preview column has NO class → its .printable-container child is the
          @media print target (visibility:visible + position:fixed A4).
        • An element with visibility:visible CAN override an ancestor's
          visibility:hidden (CSS spec), but NOT an ancestor's display:none.
          Therefore the preview column must NEVER be inside no-print.
      */}
      <div
        style={{
          display:    "flex",
          gap:        24,
          alignItems: "flex-start",
          flexWrap:   "wrap",
        }}
      >
        {/* Editor column — hidden on print */}
        <div
          className="no-print"
          style={{
            flex:      "0 0 360px",
            minWidth:  280,
            maxHeight: "calc(100vh - 180px)",
            overflowY: "auto",
          }}
        >
          <ReportEditor
            reportType={reportType}
            reportData={reportData}
            setField={setField}
          />
        </div>

        {/* Preview column — always rendered, is the print target */}
        <div
          dir="ltr"
          style={{
            flex:    "1 1 500px",
            minWidth: 280,
          }}
        >
          <ReportPreviewShell
            reportType={reportType}
            reportData={reportData}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Shared button style ──────────────────────────────────────────────
const TOOL_BTN = {
  height:       44,
  padding:      "0 16px",
  background:   "transparent",
  border:       `1px solid rgba(54,69,79,0.2)`,
  borderRadius: 6,
  cursor:       "pointer",
  fontFamily:   "'Assistant','Heebo',Arial,sans-serif",
  fontSize:     13,
  fontWeight:   600,
  color:        "#4a5c68",
  display:      "flex",
  alignItems:   "center",
  gap:          8,
  whiteSpace:   "nowrap",
};
