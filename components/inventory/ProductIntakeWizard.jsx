/**
 * components/inventory/ProductIntakeWizard.jsx  —  v5.2.2
 *
 * Changes from v5.2.1-ui:
 *
 * Task 2 — Intake navigation improvements:
 *   + After saving (savedId set), show 4 action buttons:
 *       "הוסף מוצר נוסף"  — reset wizard (was the only option before)
 *       "פתח במלאי"        — navigate to inventory tab (onOpenInventory prop)
 *       "צור דוח"          — navigate to reports tab  (onCreateReport prop)
 *       "הישאר ברשומה"     — stay on current record (dismiss success banner)
 *   + Review step (step 4, before save): "עריכה ←" button at top-right
 *     that returns to Step 3 with all data preserved.
 *
 * Task 4 — Media fields added to INITIAL_FORM:
 *   imageUrl, certImageUrl, videoUrl — all empty strings by default.
 *   Sent to create-stone.js / create-jewelry.js as text fields.
 *   True Airtable attachment upload is a future milestone.
 *
 * All v5.2.1-ui features unchanged:
 *   Full 6-variable reset, StepIndicator, 3-option ConfirmResetDialog,
 *   saveIntakeDraft to localStorage, computed-field-safe Airtable save.
 */

import { useState, useCallback } from "react";
import { C } from "../../lib/constants";

import { ProductTypeSelector, PRODUCT_TYPES } from "./ProductTypeSelector";
import { IntakeMethodSelector }               from "./IntakeMethodSelector";
import { ProductFormFields }                  from "./ProductFormFields";
import { ProductReview }                      from "./ProductReview";

// ─── localStorage intake draft helpers ───────────────────────────────────────
const INTAKE_DRAFT_PREFIX = "ls_intake_draft_";

function saveIntakeDraft(formData, productType, intakeMethod) {
  try {
    const key   = `${INTAKE_DRAFT_PREFIX}${Date.now()}`;
    const draft = {
      savedAt: new Date().toISOString(),
      productType, intakeMethod, formData,
    };
    localStorage.setItem(key, JSON.stringify(draft));
  } catch (_) {}
}

// ─── Initial form state ───────────────────────────────────────────────────────
const INITIAL_FORM = {
  // Identity
  productType:      "",
  name:             "",
  status:           "במלאי",
  supplierName:     "",
  stoneType:        "",
  naturalOrLab:     "Natural",

  // Weight
  caratWeight:      "",
  stoneCount:       "",

  // Measurements (mm)
  measLength:       "",
  measWidth:        "",
  measDepth:        "",
  lengthMm:         "",
  widthMm:          "",
  heightMm:         "",

  // Colour
  color:            "",
  fancyColorIntensity: "",
  fancyColorHue:    "",

  // Grading
  cutGrade:         "",
  polish:           "",
  symmetry:         "",
  cutForm:          "",
  stoneShape:       "",
  clarity:          "",
  transparency:     "",
  growthMethod:     "",
  species:          "",
  variety:          "",
  colorDescription: "",
  treatment:        "",
  laserInscription: "",
  origin:           "",
  costUsd:          "",

  // Fluorescence
  fluorescenceIntensity: "",
  fluorescenceColor:     "",

  // Certificate import
  certLab:          "",
  certNumber:       "",
  rawCertText:      "",

  // Report
  generateReport:   false,
  reportType:       "",

  // Verification
  verificationId:   "",
  verificationUrl:  "",

  // Jewelry-specific
  metalType:        "",
  metalWeight:      "",
  casting:          "",
  complexity:       "",
  stoneDescription: "",
  settingType:      "",
  category:         "",
  clientName:       "",
  price:            "",
  workmanship:      "",

  // Media (Task 4) — URL placeholders; true file upload in future milestone
  imageUrl:         "",
  certImageUrl:     "",
  videoUrl:         "",

  // Internal
  internalNotes:    "",
};

const CLIENT_TYPE_DEFAULTS = {
  natural_diamond:     { generateReport: true,  reportType: "natural_diamond"     },
  lab_grown_diamond:   { generateReport: true,  reportType: "lab_grown_diamond"   },
  fancy_color_diamond: { generateReport: true,  reportType: "fancy_color_diamond" },
  colored_gemstone:    { generateReport: true,  reportType: "colored_gemstone"    },
  stone_pair_set:      { generateReport: false, reportType: ""                    },
  stone_parcel:        { generateReport: false, reportType: ""                    },
  jewelry_part:        { generateReport: false, reportType: ""                    },
  finished_jewelry:    { generateReport: false, reportType: ""                    },
};

// ─── StepIndicator ────────────────────────────────────────────────────────────
const STEPS = [
  { n: 1, label: "סוג"    },
  { n: 2, label: "שיטה"  },
  { n: 3, label: "פרטים" },
  { n: 4, label: "סיכום" },
];

function StepIndicator({ current }) {
  return (
    <div className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 24 }}>
      {STEPS.map((s, i) => {
        const done   = current > s.n;
        const active = current === s.n;
        return (
          <div key={s.n} style={{ display: "flex", alignItems: "center" }}>
            {i > 0 && (
              <div style={{ width: 36, height: 2, background: done ? C.gd : "rgba(54,69,79,0.12)", flexShrink: 0 }} />
            )}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                border: `2px solid ${active ? C.gd : done ? C.gd : "rgba(54,69,79,0.2)"}`,
                background: active ? C.gd : done ? "rgba(197,179,88,0.12)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: C.dat, fontSize: 12, fontWeight: 700,
                color: active ? "#fff" : done ? "#8a7a2a" : C.chl,
                transition: "all 0.18s",
              }}>
                {done ? "✓" : s.n}
              </div>
              <span style={{ fontFamily: C.heb, fontSize: 10, color: active ? C.ch : C.chl, fontWeight: active ? 700 : 400, whiteSpace: "nowrap" }}>
                {s.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── ConfirmResetDialog ────────────────────────────────────────────────────────
function ConfirmResetDialog({ onSaveDraft, onConfirm, onCancel }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(54,69,79,0.52)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{ background: "#FAF9F6", borderRadius: 10, padding: "26px 28px", maxWidth: 400, width: "100%", boxShadow: "0 20px 50px rgba(54,69,79,0.28)" }}>
        <p style={{ fontFamily: C.heb, fontSize: 14, color: C.ch, marginBottom: 20, lineHeight: 1.7, direction: "rtl", textAlign: "right" }}>
          האם לאפס את הטופס?<br />שינויים שלא נשמרו יאבדו.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button onClick={onCancel} style={BTN_GHOST}>ביטול</button>
          <button onClick={onSaveDraft} style={BTN_DRAFT}>שמור טיוטה</button>
          <button onClick={onConfirm}  style={BTN_RESET}>איפוס</button>
        </div>
      </div>
    </div>
  );
}

// ─── ProductIntakeWizard ──────────────────────────────────────────────────────
/**
 * @prop {function} [onOpenInventory]  — Called when user clicks "פתח במלאי"
 * @prop {function} [onCreateReport]   — Called when user clicks "צור דוח"
 */
export function ProductIntakeWizard({ onOpenInventory, onCreateReport }) {
  const [step,             setStep]             = useState(1);
  const [formData,         setFormData]         = useState({ ...INITIAL_FORM });
  const [intakeMethod,     setIntakeMethod]     = useState(null);
  const [saving,           setSaving]           = useState(false);
  const [saveError,        setSaveError]        = useState(null);
  const [savedId,          setSavedId]          = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  // "stay on record" mode — show record summary without success banner
  const [viewingRecord,    setViewingRecord]    = useState(false);

  // ── Full reset ────────────────────────────────────────────────────────────
  const doReset = useCallback(() => {
    setStep(1);
    setFormData({ ...INITIAL_FORM });
    setIntakeMethod(null);
    setSaving(false);
    setSaveError(null);
    setSavedId(null);
    setShowResetConfirm(false);
    setViewingRecord(false);
  }, []);

  const handleSaveDraftAndReset = useCallback(() => {
    saveIntakeDraft(formData, formData.productType, intakeMethod);
    doReset();
  }, [formData, intakeMethod, doReset]);

  const handleResetRequest = useCallback(() => {
    const hasData = step > 1 || Object.values(formData).some(
      (v) => v !== "" && v !== false && v !== null && v !== undefined
    );
    if (hasData) setShowResetConfirm(true);
    else doReset();
  }, [step, formData, doReset]);

  // ── Field updates ─────────────────────────────────────────────────────────
  const setField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // ── Step navigation ───────────────────────────────────────────────────────
  const handleTypeSelect = useCallback((productType) => {
    const defaults = CLIENT_TYPE_DEFAULTS[productType] || {};
    setFormData((prev) => ({
      ...prev,
      productType,
      generateReport: defaults.generateReport ?? false,
      reportType:     defaults.reportType     ?? "",
    }));
    setStep(2);
  }, []);

  const handleMethodSelect = useCallback((method) => {
    setIntakeMethod(method);
    setStep(3);
  }, []);

  const handleFormNext = useCallback(() => setStep(4), []);
  const handleBack     = useCallback(() => { if (step > 1) setStep((s) => s - 1); }, [step]);

  // ── Edit from review — goes back to form with data preserved ─────────────
  const handleEditFromReview = useCallback(() => setStep(3), []);

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    const endpoint = formData.productType === "finished_jewelry"
      ? "/api/airtable/create-jewelry"
      : "/api/airtable/create-stone";
    try {
      const res  = await fetch(endpoint, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...formData, intakeMethod }),
      });
      const json = await res.json();
      if (!res.ok || json.error) { setSaveError(json.error || `HTTP ${res.status}`); setSaving(false); return; }
      setSavedId(json.id || "saved");
      setSaving(false);
    } catch (err) {
      setSaveError("שגיאת רשת — בדוק חיבור ונסה שוב.");
      setSaving(false);
    }
  }, [formData, intakeMethod]);

  const typeInfo = PRODUCT_TYPES.find((t) => t.id === formData.productType) || {};

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>

      {showResetConfirm && (
        <ConfirmResetDialog
          onSaveDraft={handleSaveDraftAndReset}
          onConfirm={doReset}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}

      {/* Title */}
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontFamily: C.dat, fontSize: 18, fontWeight: 700, color: C.ch, marginBottom: 3 }}>
          קליטת מוצר — Intake
        </h2>
        <p style={{ fontFamily: C.heb, fontSize: 11, color: C.chl, margin: 0 }}>
          הוספת אבן, חבילה, או תכשיט למלאי
        </p>
      </div>

      <StepIndicator current={step} />

      <div style={{ background: "#fff", border: "1px solid rgba(54,69,79,0.1)", borderRadius: 10, padding: "22px 24px", boxShadow: "0 2px 10px rgba(54,69,79,0.06)" }}>

        {/* STEP 1 — Type */}
        {step === 1 && <ProductTypeSelector onSelect={handleTypeSelect} />}

        {/* STEP 2 — Method */}
        {step === 2 && (
          <>
            <IntakeMethodSelector productType={formData.productType} onSelect={handleMethodSelect} />
            <div style={{ marginTop: 16 }}><BackButton onClick={handleBack} /></div>
          </>
        )}

        {/* STEP 3 — Form fields */}
        {step === 3 && (
          <>
            <div style={{ marginBottom: 14 }}>
              <span style={{ fontFamily: C.heb, fontSize: 11, color: C.chl }}>
                <span style={{ fontWeight: 700, color: C.chm }}>{typeInfo.label}</span>
                {" · "}
                <span style={{ textTransform: "capitalize" }}>{intakeMethod}</span>
              </span>
            </div>
            <ProductFormFields
              formData={formData}
              onChange={setField}
              productType={formData.productType}
              intakeMethod={intakeMethod}
              onNext={handleFormNext}
              onBack={handleBack}
            />
          </>
        )}

        {/* STEP 4 — Review, Save, Post-Save Actions */}
        {step === 4 && (
          <>
            {/* ── Success state: post-save actions ── */}
            {savedId && !viewingRecord && (
              <div style={{ padding: "8px 0" }}>
                {/* Success banner */}
                <div style={{ textAlign: "center", padding: "16px 0 20px" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                  <div style={{ fontFamily: C.dat, fontSize: 16, fontWeight: 700, color: C.ch, marginBottom: 4 }}>
                    המוצר נשמר
                  </div>
                  <div style={{ fontFamily: C.heb, fontSize: 11, color: C.chl, marginBottom: 3 }}>
                    רשומה נוצרה ב-Airtable
                  </div>
                  <div style={{ fontFamily: "'Courier New',monospace", fontSize: 10, color: C.chm, background: "rgba(54,69,79,0.05)", padding: "3px 10px", borderRadius: 4, display: "inline-block", marginBottom: 20 }}>
                    {savedId}
                  </div>
                </div>

                {/* 4 post-save actions (2×2 grid) — Task 2 */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {/* Primary: Add another */}
                  <button
                    onClick={handleResetRequest}
                    style={{ ...BTN_ACTION_PRIMARY, gridColumn: "1 / 3" }}
                  >
                    + הוסף מוצר נוסף
                  </button>
                  {/* Secondary trio */}
                  <button
                    onClick={() => { onOpenInventory?.(); }}
                    style={BTN_ACTION_SECONDARY}
                  >
                    💎 פתח במלאי
                  </button>
                  <button
                    onClick={() => { onCreateReport?.(); }}
                    style={BTN_ACTION_SECONDARY}
                  >
                    📋 צור דוח
                  </button>
                  <button
                    onClick={() => setViewingRecord(true)}
                    style={{ ...BTN_ACTION_SECONDARY, gridColumn: "1 / 3", color: C.chl, borderColor: "rgba(54,69,79,0.15)" }}
                  >
                    הישאר ברשומה הנוכחית
                  </button>
                </div>
              </div>
            )}

            {/* ── Viewing current record after "הישאר ברשומה" ── */}
            {savedId && viewingRecord && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontFamily: C.dat, fontSize: 13, fontWeight: 700, color: C.ch }}>
                    ✅ נשמר — {savedId}
                  </div>
                  <button onClick={() => setViewingRecord(false)} style={{ ...BTN_GHOST, fontSize: 12 }}>
                    חזרה לאפשרויות
                  </button>
                </div>
                <ProductReview formData={formData} setField={setField} productType={formData.productType} />
              </div>
            )}

            {/* ── Review & Save (before save) ── */}
            {!savedId && (
              <>
                {/* Edit button — returns to form with data preserved */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                  <button
                    onClick={handleEditFromReview}
                    style={{ ...BTN_GHOST, fontSize: 12 }}
                    title="חזרה לעריכת הפרטים"
                  >
                    ← עריכה
                  </button>
                </div>

                <ProductReview formData={formData} setField={setField} productType={formData.productType} />

                {saveError && (
                  <div style={{ background: "rgba(176,64,64,0.07)", border: "1px solid rgba(176,64,64,0.22)", borderRadius: 7, padding: "11px 14px", marginTop: 14, fontFamily: C.heb, fontSize: 12, color: "#b04040", lineHeight: 1.6, direction: "rtl" }}>
                    <strong>שמירה נכשלה:</strong> {saveError}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(54,69,79,0.1)", gap: 10, flexWrap: "wrap" }}>
                  <BackButton onClick={handleBack} />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={handleResetRequest}
                      title="איפוס כל השדות"
                      style={{ height: 42, padding: "0 16px", border: "1px solid rgba(54,69,79,0.2)", borderRadius: 7, background: "transparent", cursor: "pointer", fontFamily: C.heb, fontSize: 12, color: C.chl }}
                    >
                      ↺ איפוס
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      style={{ ...BTN_PRIMARY, opacity: saving ? 0.7 : 1, cursor: saving ? "not-allowed" : "pointer", minWidth: 130 }}
                    >
                      {saving ? <><SpinIcon /> שומר…</> : "💾 שמור ב-Airtable"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────
function BackButton({ onClick }) {
  return (
    <button onClick={onClick} style={{ height: 38, padding: "0 14px", border: "1px solid rgba(54,69,79,0.18)", borderRadius: 7, background: "transparent", cursor: "pointer", fontFamily: C.heb, fontSize: 12, color: C.chl, display: "flex", alignItems: "center", gap: 5 }}>
      ← חזרה
    </button>
  );
}

function SpinIcon() {
  return (
    <span style={{ display: "inline-block", width: 13, height: 13, border: "2px solid rgba(255,255,255,0.35)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", marginRight: 5, verticalAlign: "middle" }} />
  );
}

// ─── Button styles ────────────────────────────────────────────────────────────
const BTN_PRIMARY = {
  height: 42, padding: "0 22px",
  background: "#36454F", color: "#FAF9F6",
  border: "none", borderRadius: 7,
  cursor: "pointer", fontFamily: "'DM Sans',Helvetica,Arial,sans-serif",
  fontSize: 13, fontWeight: 700,
  display: "flex", alignItems: "center", gap: 5,
};

const BTN_GHOST = {
  height: 40, padding: "0 16px",
  background: "transparent", border: "1px solid rgba(54,69,79,0.22)",
  borderRadius: 7, cursor: "pointer",
  fontFamily: "'Assistant','Heebo',Arial,sans-serif",
  fontSize: 13, color: "#7a8e98",
};

const BTN_DRAFT = {
  height: 40, padding: "0 16px",
  background: "rgba(197,179,88,0.12)",
  border: "1px solid rgba(197,179,88,0.4)",
  borderRadius: 7, cursor: "pointer",
  fontFamily: "'Assistant','Heebo',Arial,sans-serif",
  fontSize: 13, color: "#8a7a2a", fontWeight: 600,
};

const BTN_RESET = {
  height: 40, padding: "0 16px",
  background: "#36454F", color: "#FAF9F6",
  border: "none", borderRadius: 7, cursor: "pointer",
  fontFamily: "'Assistant','Heebo',Arial,sans-serif",
  fontSize: 13, fontWeight: 700,
};

const BTN_ACTION_PRIMARY = {
  height: 48, padding: "0 20px",
  background: "#36454F", color: "#FAF9F6",
  border: "none", borderRadius: 8,
  cursor: "pointer", fontFamily: "'Assistant','Heebo',Arial,sans-serif",
  fontSize: 14, fontWeight: 700,
  display: "flex", alignItems: "center", justifyContent: "center",
};

const BTN_ACTION_SECONDARY = {
  height: 44, padding: "0 16px",
  background: "transparent",
  border: "1px solid rgba(54,69,79,0.2)",
  borderRadius: 8, cursor: "pointer",
  fontFamily: "'Assistant','Heebo',Arial,sans-serif",
  fontSize: 13, color: "#36454F",
  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
};
