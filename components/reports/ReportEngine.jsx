/**
 * components/reports/ReportEngine.jsx  —  v5.2.1-ui
 *
 * UI text and draft management fixes on top of v4.4:
 *
 * ── Unicode gibberish fixed ──────────────────────────────────────────────────
 *   \u2190 \u05de\u05d7...  →  ← מחשבון
 *   \u21c4 Report Type      →  ⇄ סוג דוח
 *   \u21ba Sync from Calc   →  ↺ סנכרון מהמחשבון
 *   \u00b7 Edit any field…  →  · ערוך שדה · התצוגה מתעדכנת
 *   \u05d4\u05d3\u05e4\u05e1 / PDF  →  הדפס / שמור PDF
 *   📂 Drafts               →  📂 טיוטות
 *
 * ── Reset confirmation (3 options) ──────────────────────────────────────────
 *   Before "← מחשבון" (back) and "⇄ סוג דוח" (change type):
 *   Shows ConfirmResetDialog with options: "איפוס" | "שמור טיוטה" | "ביטול"
 *   If "שמור טיוטה" is selected, auto-saves the current draft (using
 *   reportNumber / itemTitle as the auto-name), then performs the action.
 *
 * ── isDirty tracking ────────────────────────────────────────────────────────
 *   isDirty = true  whenever setField is called.
 *   isDirty = false after draft save, load, or new type selection.
 *   Toolbar shows a "● שינויים לא שמורים" indicator when isDirty.
 *   Confirmation dialog is skipped when !isDirty (nothing to lose).
 *
 * ── Enhanced DraftManager ───────────────────────────────────────────────────
 *   Operations:
 *     שמור טיוטה — save new draft (name pre-populated from reportNumber)
 *     שמור בשם   — same as above (user can rename before saving)
 *     טען        — load draft into editor
 *     שכפל       — duplicate: creates "עותק של X"
 *     עדכן       — overwrite existing draft slot with current report
 *     מחק        — delete with confirmation
 *
 * ── Print architecture (unchanged from v4.4) ────────────────────────────────
 *   Editor column:   className="no-print" → hidden at print time
 *   Preview column:  NO class              → .printable-container is print anchor
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
  } catch (_) { return []; }
}

function saveDraftToStorage(draft) {
  localStorage.setItem(draftKey(draft.id), JSON.stringify(draft));
}

function deleteDraftFromStorage(id) {
  localStorage.removeItem(draftKey(id));
}

function fmtDate(iso) {
  try {
    return new Intl.DateTimeFormat("he-IL", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }).format(new Date(iso));
  } catch (_) { return iso; }
}

/** Build an auto-save name from report data */
function autoSaveName(reportType, reportData) {
  const num   = reportData?.reportNumber  || "";
  const title = reportData?.itemTitle     || reportData?.stone?.type || "";
  const base  = [num, title].filter(Boolean).join(" · ");
  return base || `טיוטה ${new Date().toLocaleDateString("he-IL")}`;
}

// ─── ConfirmResetDialog ───────────────────────────────────────────────────────
/**
 * 3-option confirmation modal:
 *   "איפוס" (destructive) | "שמור טיוטה" (save then proceed) | "ביטול"
 *
 * @prop {string}        message     — Confirmation message (Hebrew)
 * @prop {string}        actionLabel — Label for the destructive confirm button (e.g. "איפוס")
 * @prop {function|null} onSaveDraft — Called when user picks "שמור טיוטה";
 *                                     if null the button is not shown.
 * @prop {function}      onConfirm   — Proceed without saving
 * @prop {function}      onCancel    — Dismiss
 */
function ConfirmResetDialog({ message, actionLabel, onSaveDraft, onConfirm, onCancel }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(54,69,79,0.52)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{ background: "#FAF9F6", borderRadius: 10, padding: "26px 28px", maxWidth: 420, width: "100%", boxShadow: "0 20px 50px rgba(54,69,79,0.28)" }}>
        <p style={{ fontFamily: C.heb, fontSize: 15, color: C.ch, marginBottom: 22, lineHeight: 1.65, direction: "rtl", textAlign: "right" }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
          {/* ביטול — leftmost / first tab stop */}
          <button
            onClick={onCancel}
            style={{ height: 40, padding: "0 18px", background: "transparent", border: "1px solid rgba(54,69,79,0.22)", borderRadius: 7, cursor: "pointer", fontFamily: C.heb, fontSize: 13, color: C.chl }}
          >
            ביטול
          </button>
          {/* שמור טיוטה — middle */}
          {onSaveDraft && (
            <button
              onClick={onSaveDraft}
              style={{ height: 40, padding: "0 18px", background: "rgba(197,179,88,0.12)", border: "1px solid rgba(197,179,88,0.4)", borderRadius: 7, cursor: "pointer", fontFamily: C.heb, fontSize: 13, color: "#8a7a2a", fontWeight: 600 }}
            >
              שמור טיוטה
            </button>
          )}
          {/* איפוס — rightmost / destructive */}
          <button
            onClick={onConfirm}
            style={{ height: 40, padding: "0 18px", background: C.ch, color: C.iv, border: "none", borderRadius: 7, cursor: "pointer", fontFamily: C.heb, fontSize: 13, fontWeight: 700 }}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DraftManager ─────────────────────────────────────────────────────────────
/**
 * Enhanced draft management panel.
 *
 * Operations:
 *   שמור טיוטה — create new draft (name pre-populated from report data)
 *   שמור בשם   — same; user can edit name before saving
 *   טען        — load draft; replaces current report (shows warning if isDirty)
 *   שכפל       — duplicate with "עותק של" prefix
 *   עדכן       — overwrite existing slot with current report
 *   מחק        — delete with window.confirm
 */
function DraftManager({ currentType, currentData, onLoad, onClose }) {
  const [drafts,      setDrafts]      = useState(() => loadAllDrafts());
  const [saveName,    setSaveName]    = useState(() => autoSaveName(currentType, currentData));
  const [saveError,   setSaveError]   = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [confirmLoad, setConfirmLoad] = useState(null); // draft to load after confirm

  const refreshDrafts = () => setDrafts(loadAllDrafts());

  // ── Save new draft ────────────────────────────────────────────────────────
  const handleSave = () => {
    const name = saveName.trim();
    if (!name) { setSaveError("הזן שם לטיוטה."); return; }
    if (!currentType || !currentData) { setSaveError("אין דוח פעיל לשמירה."); return; }
    setSaveError("");
    const draft = {
      id:           `${Date.now()}`,
      name,
      reportNumber: currentData?.reportNumber || "",
      reportType:   currentType,
      reportData:   currentData,
      savedAt:      new Date().toISOString(),
    };
    try {
      saveDraftToStorage(draft);
      refreshDrafts();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (_) {
      setSaveError("שגיאת אחסון — הסר טיוטות ישנות או הקטן תמונות.");
    }
  };

  // ── Update existing draft slot ────────────────────────────────────────────
  const handleUpdate = (draft) => {
    if (!currentType || !currentData) return;
    const updated = { ...draft, reportType: currentType, reportData: currentData, savedAt: new Date().toISOString() };
    try { saveDraftToStorage(updated); refreshDrafts(); } catch (_) {}
  };

  // ── Duplicate draft ────────────────────────────────────────────────────────
  const handleDuplicate = (draft) => {
    const dup = {
      ...draft,
      id:      `${Date.now()}`,
      name:    `עותק של ${draft.name}`,
      savedAt: new Date().toISOString(),
    };
    try { saveDraftToStorage(dup); refreshDrafts(); } catch (_) {}
  };

  // ── Delete draft ──────────────────────────────────────────────────────────
  const handleDelete = (id) => {
    if (!window.confirm("למחוק את הטיוטה? פעולה זו אינה הפיכה.")) return;
    deleteDraftFromStorage(id);
    refreshDrafts();
  };

  // ── Load draft (with unsaved-changes guard delegated to onLoad caller) ────
  const handleLoad = (draft) => {
    onLoad(draft);
    onClose();
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(54,69,79,0.52)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#FAF9F6", borderRadius: 10, padding: "24px 28px", width: "100%", maxWidth: 580, maxHeight: "88vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(54,69,79,0.25)" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontFamily: C.dat, fontSize: 16, fontWeight: 700, color: C.ch }}>📂 טיוטות</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.chl, fontSize: 18 }}>✕</button>
        </div>

        {/* Save / Save As section */}
        <div style={{ background: "rgba(197,179,88,0.07)", border: "1px solid rgba(197,179,88,0.28)", borderRadius: 7, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ fontFamily: C.heb, fontSize: 12, color: C.chl, marginBottom: 8, direction: "rtl" }}>
            שמירת הדוח הנוכחי כטיוטה
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={saveName}
              onChange={(e) => { setSaveName(e.target.value); setSaveError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
              placeholder="שם הטיוטה (למשל: טבעת סמית — GIA 2473…)"
              dir="rtl"
              style={{ flex: 1, height: 42, border: "1px solid rgba(54,69,79,0.2)", borderRadius: 6, background: "#fff", padding: "0 12px", fontFamily: C.heb, fontSize: 13, color: C.ch, outline: "none" }}
            />
            <button onClick={handleSave} style={BTN_PRIMARY}>
              שמור טיוטה
            </button>
          </div>
          {saveError && (
            <p style={{ fontFamily: C.heb, fontSize: 11, color: "#b04040", marginTop: 6, lineHeight: 1.5, direction: "rtl" }}>
              {saveError}
            </p>
          )}
          {saveSuccess && (
            <p style={{ fontFamily: C.heb, fontSize: 11, color: "#4a8a52", marginTop: 6, direction: "rtl" }}>
              ✓ הטיוטה נשמרה בהצלחה
            </p>
          )}
        </div>

        {/* Draft list */}
        {drafts.length === 0 ? (
          <p style={{ fontFamily: C.heb, fontSize: 13, color: C.chl, textAlign: "center", padding: "24px 0", direction: "rtl" }}>
            אין טיוטות שמורות.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {drafts.map((d) => (
              <div key={d.id} style={{ border: "1px solid rgba(54,69,79,0.12)", borderRadius: 7, padding: "12px 14px", background: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  {/* Draft info */}
                  <div style={{ flex: 1, minWidth: 0, direction: "rtl" }}>
                    <div style={{ fontFamily: C.dat, fontSize: 13, fontWeight: 600, color: C.ch, marginBottom: 3, wordBreak: "break-word" }}>
                      {d.name}
                    </div>
                    <div style={{ fontFamily: C.heb, fontSize: 11, color: C.chl }}>
                      {REPORT_TYPES[d.reportType]?.label || d.reportType}
                      {d.reportNumber && ` · ${d.reportNumber}`}
                    </div>
                    <div style={{ fontFamily: C.heb, fontSize: 10, color: C.chx, marginTop: 2 }}>
                      {fmtDate(d.savedAt)}
                    </div>
                  </div>
                  {/* Actions */}
                  <div style={{ display: "flex", gap: 5, flexShrink: 0, alignItems: "center" }}>
                    <button onClick={() => handleLoad(d)} style={BTN_SMALL} title="טעינת טיוטה לעורך">
                      טען
                    </button>
                    {currentType && currentData && (
                      <button
                        onClick={() => handleUpdate(d)}
                        style={{ ...BTN_SMALL, borderColor: "rgba(197,179,88,0.4)", color: "#8a7a2a" }}
                        title="עדכון הטיוטה עם הדוח הנוכחי"
                      >
                        עדכן
                      </button>
                    )}
                    <button
                      onClick={() => handleDuplicate(d)}
                      style={{ ...BTN_SMALL, borderColor: "rgba(54,69,79,0.18)", color: C.chm }}
                      title="שכפול הטיוטה"
                    >
                      שכפל
                    </button>
                    <button
                      onClick={() => handleDelete(d.id)}
                      style={{ ...BTN_SMALL, borderColor: "rgba(176,64,64,0.28)", color: "#b04040" }}
                      title="מחיקת הטיוטה"
                    >
                      מחק
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <p style={{ fontFamily: C.heb, fontSize: 10, color: C.chx, marginTop: 16, lineHeight: 1.55, fontStyle: "italic", direction: "rtl" }}>
          טיוטות נשמרות באחסון הדפדפן המקומי — פרטיות למכשיר זה.
          גרסאות עתידיות יתמכו בשמירה בענן עם חשבון משתמש.
        </p>
      </div>
    </div>
  );
}

// ─── ReportEngine ─────────────────────────────────────────────────────────────
export function ReportEngine({ calculatorData = {}, onBack }) {

  const [reportType, setReportType] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [showDrafts, setShowDrafts] = useState(false);

  // isDirty: true after any field edit, false after save/load/new report
  const [isDirty, setIsDirty] = useState(false);

  // Pending action blocked by confirmation dialog
  // shape: { action: "back" | "changeType" } | null
  const [pendingConfirm, setPendingConfirm] = useState(null);

  // ── Dot-path field setter — marks isDirty ─────────────────────────────────
  const setField = useCallback((path, value) => {
    setReportData((prev) => prev ? setDeep(prev, path, value) : prev);
    setIsDirty(true);
  }, []);

  // ── Type selected → create default data ──────────────────────────────────
  const handleSelectType = useCallback((type) => {
    const data = type === "jewelry_valuation"
      ? createDefaultJewelryReport(calculatorData)
      : createDefaultStoneReport({});
    setReportType(type);
    setReportData(data);
    setIsDirty(false);
  }, [calculatorData]);

  // ── Re-sync from calculator ───────────────────────────────────────────────
  const handleRefreshFromCalc = useCallback(() => {
    if (reportType === "jewelry_valuation") {
      setReportData(createDefaultJewelryReport(calculatorData));
      setIsDirty(false);
    }
  }, [reportType, calculatorData]);

  // ── Back to calculator ────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    if (isDirty) {
      setPendingConfirm({ action: "back" });
    } else {
      onBack();
    }
  }, [isDirty, onBack]);

  // ── Change report type ─────────────────────────────────────────────────────
  const handleChangeType = useCallback(() => {
    if (isDirty) {
      setPendingConfirm({ action: "changeType" });
    } else {
      setReportType(null);
      setReportData(null);
    }
  }, [isDirty]);

  // ── Auto-save draft then perform pending action ───────────────────────────
  const handleSaveDraftThenProceed = useCallback(() => {
    if (reportType && reportData) {
      const name = autoSaveName(reportType, reportData);
      const draft = {
        id:           `${Date.now()}`,
        name,
        reportNumber: reportData?.reportNumber || "",
        reportType,
        reportData,
        savedAt:      new Date().toISOString(),
      };
      try { saveDraftToStorage(draft); } catch (_) {}
    }
    setIsDirty(false);
    if (pendingConfirm?.action === "back") {
      setPendingConfirm(null);
      onBack();
    } else {
      setPendingConfirm(null);
      setReportType(null);
      setReportData(null);
    }
  }, [reportType, reportData, pendingConfirm, onBack]);

  // ── Confirm without saving ────────────────────────────────────────────────
  const handleConfirmProceed = useCallback(() => {
    if (pendingConfirm?.action === "back") {
      setPendingConfirm(null);
      onBack();
    } else {
      setPendingConfirm(null);
      setReportType(null);
      setReportData(null);
    }
  }, [pendingConfirm, onBack]);

  // ── Load draft ────────────────────────────────────────────────────────────
  const handleLoadDraft = useCallback((draft) => {
    setReportType(draft.reportType);
    setReportData(draft.reportData);
    setIsDirty(false);
  }, []);

  // ── No type selected ──────────────────────────────────────────────────────
  if (!reportType || !reportData) {
    return <ReportTypeSelector onSelect={handleSelectType} onBack={onBack} />;
  }

  const typeInfo = REPORT_TYPES[reportType];

  return (
    <div>

      {/* Confirmation dialog (back or change type) */}
      {pendingConfirm && (
        <ConfirmResetDialog
          message={
            pendingConfirm.action === "back"
              ? "לחזור למחשבון? שינויים שלא נשמרו יאבדו."
              : "לשנות סוג דוח? שינויים שלא נשמרו יאבדו."
          }
          actionLabel={pendingConfirm.action === "back" ? "חזרה" : "שנה סוג"}
          onSaveDraft={handleSaveDraftThenProceed}
          onConfirm={handleConfirmProceed}
          onCancel={() => setPendingConfirm(null)}
        />
      )}

      {/* Draft manager modal */}
      {showDrafts && (
        <DraftManager
          currentType={reportType}
          currentData={reportData}
          onLoad={handleLoadDraft}
          onClose={() => setShowDrafts(false)}
        />
      )}

      {/* ══ TOOLBAR (hidden on print) ════════════════════════════════════════ */}
      <div
        className="no-print"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 12, flexWrap: "wrap" }}
      >
        {/* Left actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button onClick={handleBack} style={TOOL_BTN}>
            ← מחשבון
          </button>
          <button onClick={handleChangeType} style={{ ...TOOL_BTN, fontSize: 12, color: C.chl }}>
            ⇄ סוג דוח
          </button>
          {reportType === "jewelry_valuation" && (
            <button
              onClick={handleRefreshFromCalc}
              style={{ ...TOOL_BTN, fontSize: 12, color: C.chl }}
              title="סנכרון שדות הדוח מהמחשבון"
            >
              ↺ סנכרון מהמחשבון
            </button>
          )}
          <button
            onClick={() => setShowDrafts(true)}
            style={{ ...TOOL_BTN, fontSize: 12, color: C.chl, borderColor: "rgba(197,179,88,0.4)" }}
            title="שמירה וטעינה של טיוטות"
          >
            📂 טיוטות
          </button>
        </div>

        {/* Centre status */}
        <span style={{ fontFamily: C.dat, fontSize: 11, color: isDirty ? "#b06a2a" : C.chl, fontStyle: "italic" }}>
          {isDirty
            ? "● שינויים לא שמורים"
            : `${typeInfo.label} · ערוך שדה · התצוגה מתעדכנת`
          }
        </span>

        {/* Print / PDF button */}
        <button
          onClick={() => window.print()}
          style={{ height: 44, padding: "0 24px", background: C.ch, color: C.iv, border: "none", borderRadius: 6, cursor: "pointer", fontFamily: C.heb, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}
        >
          <span style={{ fontSize: 18 }}>🖨️</span>
          הדפס / שמור PDF
        </button>
      </div>

      {/* ══ EDITOR + PREVIEW ═════════════════════════════════════════════════ */}
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>

        {/* Editor column — hidden on print */}
        <div
          className="no-print"
          style={{ flex: "0 0 380px", minWidth: 280, maxHeight: "calc(100vh - 180px)", overflowY: "auto" }}
        >
          <ReportEditor
            reportType={reportType}
            reportData={reportData}
            setField={setField}
          />
        </div>

        {/* Preview column — always rendered, is the print target */}
        <div dir="ltr" style={{ flex: "1 1 500px", minWidth: 280 }}>
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
  height:       42,
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
  flexShrink:   0,
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
