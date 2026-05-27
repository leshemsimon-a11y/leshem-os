/**
 * components/reports/ReportEngine.jsx  —  v4.4
 *
 * Orchestrator for the entire Report Engine.
 *
 * Changes in v4.4:
 *   + DraftManager — localStorage-based save / load / delete / update.
 *     Keys prefixed with "ls_draft_". Schema:
 *       { id: string, name: string, reportType: string, reportData: object, savedAt: string }
 *     Future production storage: move to Airtable / Supabase with per-user
 *     access control, server-side encryption of sensitive data, and revocable
 *     tokens. DO NOT store cost breakdowns or margin data in cloud reports.
 *   + loadDraft(draft) — replaces both reportType + reportData atomically.
 *   + setReportData exposed so drafts can fully replace data.
 *   ~ All existing state, setField, sync-from-calculator, print architecture
 *     unchanged.
 *
 * Print architecture (unchanged):
 *   • Editor column:   className="no-print"  → hidden at print time
 *   • Preview column:  NO no-print class     → .printable-container is print anchor
 *   • Toolbar:         className="no-print"  → hidden at print time
 */

import { useState, useCallback, useRef } from "react";
import { C }                         from "../../lib/constants";
import { setDeep }                   from "../../lib/reports/reportUtils";
import { REPORT_TYPES }              from "../../lib/reports/reportTypes";
import { createDefaultJewelryReport,
         createDefaultStoneReport }  from "../../lib/reports/reportDefaults";

import { ReportTypeSelector }  from "./ReportTypeSelector";
import { ReportEditor }        from "./ReportEditor";
import { ReportPreviewShell }  from "./ReportPreviewShell";

// ─── localStorage draft helpers ───────────────────────────────────────────────
const DRAFT_PREFIX = "ls_draft_";

function draftKey(id) { return `${DRAFT_PREFIX}${id}`; }

function loadAllDrafts() {
  try {
    const drafts = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(DRAFT_PREFIX)) {
        try {
          const d = JSON.parse(localStorage.getItem(key));
          if (d && d.id) drafts.push(d);
        } catch (_) {}
      }
    }
    return drafts.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
  } catch (_) {
    return [];
  }
}

function saveDraftToStorage(draft) {
  // Future: replace with Airtable/Supabase API call with user auth token.
  // Note: base64 images inside reportData can be large (~1-2MB each).
  // If storage fails due to quota, notify the user.
  localStorage.setItem(draftKey(draft.id), JSON.stringify(draft));
}

function deleteDraftFromStorage(id) {
  localStorage.removeItem(draftKey(id));
}

// ─── DraftManager component ───────────────────────────────────────────────────
/**
 * Screen-only panel for managing saved report drafts.
 * Hidden in print via className="no-print".
 *
 * Future production storage note:
 *   This component currently reads/writes localStorage only.
 *   When connected to Airtable or Supabase, replace the load/save/delete
 *   functions with API calls. Keep the same draft schema so migration is
 *   a drop-in replacement. Add user authentication before cloud migration.
 */
function DraftManager({ currentType, currentData, onLoad, onClose }) {
  const [drafts,      setDrafts]      = useState(() => loadAllDrafts());
  const [saveName,    setSaveName]    = useState("");
  const [saveError,   setSaveError]   = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    const name = saveName.trim();
    if (!name) { setSaveError("Enter a draft name to save."); return; }
    if (!currentType || !currentData) { setSaveError("No active report to save."); return; }
    setSaveError("");

    const id    = `${Date.now()}`;
    const draft = {
      id,
      name,
      reportNumber: currentData?.reportNumber || "",
      reportType:   currentType,
      reportData:   currentData,
      savedAt:      new Date().toISOString(),
    };

    try {
      saveDraftToStorage(draft);
      setDrafts(loadAllDrafts());
      setSaveName("");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      // Most likely localStorage quota exceeded (large base64 images)
      setSaveError(
        "Storage full — remove old drafts or reduce image sizes. " +
        "Tip: drafts with high-res images can be several MB each."
      );
    }
  };

  const handleUpdate = (draft) => {
    const updated = {
      ...draft,
      reportType: currentType,
      reportData: currentData,
      savedAt:    new Date().toISOString(),
    };
    try {
      saveDraftToStorage(updated);
      setDrafts(loadAllDrafts());
    } catch (_) {}
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this draft? This cannot be undone.")) return;
    deleteDraftFromStorage(id);
    setDrafts(loadAllDrafts());
  };

  const fmtDate = (iso) => {
    try {
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      }).format(new Date(iso));
    } catch (_) { return iso; }
  };

  return (
    <div
      style={{
        position:   "fixed",
        top:        0, left: 0, right: 0, bottom: 0,
        background: "rgba(54,69,79,0.55)",
        zIndex:     1000,
        display:    "flex",
        alignItems: "center",
        justifyContent: "center",
        padding:    16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background:   "#FAF9F6",
          borderRadius: 10,
          padding:      "24px 28px",
          width:        "100%",
          maxWidth:     560,
          maxHeight:    "85vh",
          overflowY:    "auto",
          boxShadow:    "0 20px 60px rgba(54,69,79,0.25)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontFamily: C.dat, fontSize: 16, fontWeight: 700, color: C.ch }}>
            Report Drafts
          </span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: C.chl, fontSize: 18, lineHeight: 1 }}
          >✕</button>
        </div>

        {/* Save new draft */}
        <div style={{
          background: "rgba(197,179,88,0.07)",
          border: "1px solid rgba(197,179,88,0.28)",
          borderRadius: 7,
          padding: "14px 16px",
          marginBottom: 20,
        }}>
          <div style={{ fontFamily: C.heb, fontSize: 12, color: C.chl, marginBottom: 8 }}>
            Save current report as draft
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={saveName}
              onChange={(e) => { setSaveName(e.target.value); setSaveError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
              placeholder="Draft name (e.g. Smith Ring — GIA 2473…)"
              style={{
                flex: 1, height: 40,
                border: "1px solid rgba(54,69,79,0.2)", borderRadius: 6,
                background: "#fff", padding: "0 12px",
                fontFamily: C.heb, fontSize: 13, color: C.ch, outline: "none",
              }}
            />
            <button onClick={handleSave} style={BTN_PRIMARY}>
              💾 Save
            </button>
          </div>
          {saveError && (
            <p style={{ fontFamily: C.heb, fontSize: 11, color: "#b04040", marginTop: 6, lineHeight: 1.5 }}>
              {saveError}
            </p>
          )}
          {saveSuccess && (
            <p style={{ fontFamily: C.heb, fontSize: 11, color: "#4a8a52", marginTop: 6 }}>
              ✓ Draft saved successfully
            </p>
          )}
        </div>

        {/* Draft list */}
        {drafts.length === 0 ? (
          <p style={{ fontFamily: C.heb, fontSize: 13, color: C.chl, textAlign: "center", padding: "20px 0" }}>
            No saved drafts yet.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {drafts.map((d) => (
              <div
                key={d.id}
                style={{
                  border: "1px solid rgba(54,69,79,0.12)",
                  borderRadius: 7,
                  padding: "12px 14px",
                  background: "#fff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: C.dat, fontSize: 13, fontWeight: 600, color: C.ch, marginBottom: 3, wordBreak: "break-word" }}>
                      {d.name}
                    </div>
                    <div style={{ fontFamily: C.heb, fontSize: 11, color: C.chl, lineHeight: 1.5 }}>
                      {REPORT_TYPES[d.reportType]?.label || d.reportType}
                      {d.reportNumber && ` · ${d.reportNumber}`}
                    </div>
                    <div style={{ fontFamily: C.heb, fontSize: 10, color: C.chx, marginTop: 2 }}>
                      {fmtDate(d.savedAt)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => { onLoad(d); onClose(); }}
                      style={BTN_SMALL}
                      title="Load this draft into the editor"
                    >
                      📂 Load
                    </button>
                    {currentType && currentData && (
                      <button
                        onClick={() => handleUpdate(d)}
                        style={{ ...BTN_SMALL, borderColor: "rgba(197,179,88,0.4)", color: "#8a7a2a" }}
                        title="Overwrite with current report"
                      >
                        ↑ Update
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(d.id)}
                      style={{ ...BTN_SMALL, borderColor: "rgba(176,64,64,0.3)", color: "#b04040" }}
                      title="Delete this draft"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <p style={{ fontFamily: C.heb, fontSize: 10, color: C.chx, marginTop: 16, lineHeight: 1.5, fontStyle: "italic" }}>
          Drafts are saved in local browser storage — private to this browser and
          device. Future versions will support cloud storage with user accounts.
        </p>
      </div>
    </div>
  );
}

// ─── ReportEngine ─────────────────────────────────────────────────────────────
export function ReportEngine({ calculatorData = {}, onBack }) {
  const [reportType,   setReportType]   = useState(null);
  const [reportData,   setReportData]   = useState(null);
  const [showDrafts,   setShowDrafts]   = useState(false);

  // ── Dot-path field setter ─────────────────────────────────────────────────
  const setField = useCallback((path, value) => {
    setReportData((prev) =>
      prev ? setDeep(prev, path, value) : prev
    );
  }, []);

  // ── Type selected → create default data ──────────────────────────────────
  const handleSelectType = useCallback((type) => {
    const data =
      type === "jewelry_valuation"
        ? createDefaultJewelryReport(calculatorData)
        : createDefaultStoneReport({});
    setReportType(type);
    setReportData(data);
  }, [calculatorData]);

  // ── Re-sync jewelry report from calculator ────────────────────────────────
  const handleRefreshFromCalc = useCallback(() => {
    if (reportType === "jewelry_valuation") {
      setReportData(createDefaultJewelryReport(calculatorData));
    }
  }, [reportType, calculatorData]);

  // ── Back to type selector ─────────────────────────────────────────────────
  const handleChangeType = useCallback(() => {
    setReportType(null);
    setReportData(null);
  }, []);

  // ── Load a draft (full replacement of type + data) ────────────────────────
  const handleLoadDraft = useCallback((draft) => {
    setReportType(draft.reportType);
    setReportData(draft.reportData);
  }, []);

  // ── No type selected → show selector ─────────────────────────────────────
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

      {/* ══════ DRAFT MANAGER MODAL ══════════════════════════════════════════ */}
      {showDrafts && (
        <DraftManager
          currentType={reportType}
          currentData={reportData}
          onLoad={handleLoadDraft}
          onClose={() => setShowDrafts(false)}
        />
      )}

      {/* ══════ TOOLBAR (hidden on print) ════════════════════════════════════ */}
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
          <button onClick={onBack} style={TOOL_BTN}>
            \u2190 \u05de\u05d7\u05e9\u05d1\u05d5\u05df
          </button>
          <button
            onClick={handleChangeType}
            style={{ ...TOOL_BTN, fontSize: 12, color: C.chl }}
          >
            \u21c4 Report Type
          </button>
          {reportType === "jewelry_valuation" && (
            <button
              onClick={handleRefreshFromCalc}
              style={{ ...TOOL_BTN, fontSize: 12, color: C.chl }}
              title="Re-sync report fields from the current calculator state"
            >
              \u21ba Sync from Calculator
            </button>
          )}
          {/* Drafts button */}
          <button
            onClick={() => setShowDrafts(true)}
            style={{ ...TOOL_BTN, fontSize: 12, color: C.chl, borderColor: "rgba(197,179,88,0.4)" }}
            title="Save or load report drafts"
          >
            📂 Drafts
          </button>
        </div>

        {/* Centre label */}
        <span
          style={{
            fontFamily: C.dat,
            fontSize:   12,
            color:      C.chl,
            fontStyle:  "italic",
          }}
        >
          {typeInfo.label} \u00b7 Edit any field \u00b7 preview updates on blur
        </span>

        {/* Print */}
        <button
          onClick={() => window.print()}
          style={{
            height:     44,
            padding:    "0 24px",
            background: C.ch,
            color:      C.iv,
            border:     "none",
            borderRadius: 6,
            cursor:     "pointer",
            fontFamily: C.heb,
            fontSize:   14,
            fontWeight: 600,
            display:    "flex",
            alignItems: "center",
            gap:        8,
          }}
        >
          <span style={{ fontSize: 18 }}>🖨️</span>
          \u05d4\u05d3\u05e4\u05e1 / PDF
        </button>
      </div>

      {/* ══════ EDITOR + PREVIEW ══════════════════════════════════════════════ */}
      {/*
        CRITICAL PRINT STRUCTURE:
        • Editor column:   className="no-print" → display:none at print time
        • Preview column:  NO class → .printable-container is the print anchor
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
            flex:      "0 0 380px",
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
            flex:     "1 1 500px",
            minWidth: 280,
          }}
        >
          <ReportPreviewShell
            reportType={reportType}
            reportData={reportData}
            setField={setField}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Shared button styles ─────────────────────────────────────────────────────
const TOOL_BTN = {
  height:       44,
  padding:      "0 16px",
  background:   "transparent",
  border:       "1px solid rgba(54,69,79,0.2)",
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

const BTN_PRIMARY = {
  height:       40,
  padding:      "0 16px",
  background:   "#36454F",
  color:        "#FAF9F6",
  border:       "none",
  borderRadius: 6,
  cursor:       "pointer",
  fontFamily:   "'DM Sans',Helvetica,Arial,sans-serif",
  fontSize:     13,
  fontWeight:   600,
  whiteSpace:   "nowrap",
};

const BTN_SMALL = {
  height:       32,
  padding:      "0 10px",
  background:   "transparent",
  color:        "#4a5c68",
  border:       "1px solid rgba(54,69,79,0.2)",
  borderRadius: 5,
  cursor:       "pointer",
  fontFamily:   "'DM Sans',Helvetica,Arial,sans-serif",
  fontSize:     12,
  whiteSpace:   "nowrap",
};
