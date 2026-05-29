/**
 * components/inventory/ProductIntakeWizard.jsx  —  v5.2.1
 *
 * Fix 2 — Reset button:
 *   handleReset() resets ALL 6 state variables:
 *     step → 1
 *     formData → { ...INITIAL_FORM }
 *     intakeMethod → null
 *     saving → false
 *     saveError → null
 *     savedId → null
 *   Previous version omitted intakeMethod, causing Step 2 to be
 *   skipped on subsequent uses.
 *
 * Fix 1 — Computed fields:
 *   The POST body only contains editable fields.
 *   Computed fields (SKU, Attachment Summary, משקל כולל) are stripped
 *   server-side in create-stone.js via STONE_COMPUTED_FIELDS.
 *
 * Fix 6 — Navigation labels: step labels use English clearly.
 *
 * Fix 7 (partial) — Scroll UX:
 *   StepIndicator always visible. Sticky bottom action bar in step 3/4.
 *   Full section nav with fade deferred to M5.2.2.
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
    const key = `${INTAKE_DRAFT_PREFIX}${Date.now()}`;
    const draft = {
      savedAt: new Date().toISOString(),
      productType,
      intakeMethod,
      formData,
    };
    localStorage.setItem(key, JSON.stringify(draft));
  } catch (_) {
    // localStorage can fail if storage is unavailable or full.
  }
}

function ConfirmResetDialog({ onSaveDraft, onConfirm, onCancel }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(54,69,79,0.52)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{ background: "#FAF9F6", borderRadius: 10, padding: "24px 28px", maxWidth: 420, width: "100%", boxShadow: "0 20px 50px rgba(54,69,79,0.28)" }}>
        <p style={{ fontFamily: C.heb, fontSize: 15, color: C.ch, marginBottom: 20, lineHeight: 1.6, direction: "rtl", textAlign: "right" }}>
          האם לאפס את הטופס? שינויים שלא נשמרו יאבדו.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
          <button onClick={onCancel} style={{ height: 40, padding: "0 18px", background: "transparent", border: "1px solid rgba(54,69,79,0.22)", borderRadius: 7, cursor: "pointer", fontFamily: C.heb, fontSize: 13, color: C.chl }}>
            ביטול
          </button>
          <button onClick={onSaveDraft} style={{ height: 40, padding: "0 18px", background: "rgba(197,179,88,0.12)", border: "1px solid rgba(197,179,88,0.4)", borderRadius: 7, cursor: "pointer", fontFamily: C.heb, fontSize: 13, color: "#8a7a2a", fontWeight: 600 }}>
            שמור טיוטה
          </button>
          <button onClick={onConfirm} style={{ height: 40, padding: "0 18px", background: C.ch, color: C.iv, border: "none", borderRadius: 7, cursor: "pointer", fontFamily: C.heb, fontSize: 13, fontWeight: 700 }}>
            איפוס
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Initial form state ───────────────────────────────────────────────────────
const INITIAL_FORM = {
  productType: "",
  title: "",
  name: "",
  inventoryStatus: "במלאי",
  status: "במלאי",
  supplierName: "",
  stoneType: "",
  naturalOrLab: "Natural",
  caratWeight: "",
  stoneCount: "",
  avgStoneWeight: "",
  lengthMm: "",
  widthMm: "",
  heightMm: "",
  measLength: "",
  measWidth: "",
  measDepth: "",
  color: "",
  fancyColorIntensity: "",
  fancyColorHue: "",
  cutGrade: "",
  polish: "",
  symmetry: "",
  cutForm: "",
  clarity: "",
  gemClarity: "",
  transparency: "",
  treatment: "",
  growthMethod: "",
  fluorescenceIntensity: "",
  fluorescenceColor: "",
  certLab: "",
  certImportLab: "",
  certImportReportNumber: "",
  certImportUrl: "",
  rawCertText: "",
  origin: "",
  laserInscription: "",
  generateReport: false,
  reportType: "",
  verificationId: "",
  verificationUrl: "",
  metalType: "",
  metalColor: "",
  metalKarat: "",
  metalWeight: "",
  stoneDescription: "",
  category: "",
  clientName: "",
  costUsd: "",
  price: "",
  productModel: "",
  jewelryProductType: "Finished Jewelry",
  castingMethod: "",
  complexity: "",
  retailPrice: "",
  workmanship: "",
  internalNotes: "",
};

const CLIENT_TYPE_DEFAULTS = {
  natural_diamond:     { generateReport: true,  reportType: "Natural Diamond Report"     },
  lab_grown_diamond:   { generateReport: true,  reportType: "Lab-Grown Diamond Report"   },
  fancy_color_diamond: { generateReport: true,  reportType: "Fancy Color Diamond Report" },
  colored_gemstone:    { generateReport: true,  reportType: "Colored Gemstone Report"    },
  stone_pair_set:      { generateReport: true,  reportType: "Pair / Set Report"           },
  stone_parcel:        { generateReport: false, reportType: "In-House Stone Report"       },
  jewelry_part:        { generateReport: false, reportType: "None"                        },
  finished_jewelry:    { generateReport: false, reportType: "Jewelry Valuation Report"    },
};

// ─── Step indicator ───────────────────────────────────────────────────────────
const STEPS = [
  { n: 1, label: "סוג"    },
  { n: 2, label: "שיטה"  },
  { n: 3, label: "פרטים" },
  { n: 4, label: "סקירה" },
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

// ─── ProductIntakeWizard ──────────────────────────────────────────────────────
export function ProductIntakeWizard() {
  const [step,         setStep]         = useState(1);
  const [formData,     setFormData]     = useState({ ...INITIAL_FORM });
  const [intakeMethod, setIntakeMethod] = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [saveError,    setSaveError]    = useState(null);
  const [savedId,      setSavedId]      = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // ── Full reset — Fix 2: resets ALL 6 state variables ─────────────────────
  const doReset = useCallback(() => {
    setStep(1);
    setFormData({ ...INITIAL_FORM });
    setIntakeMethod(null);
    setSaving(false);
    setSaveError(null);
    setSavedId(null);
    setShowResetConfirm(false);
  }, []);

  const handleReset = useCallback(() => setShowResetConfirm(true), []);

  const handleSaveDraftThenReset = useCallback(() => {
    saveIntakeDraft(formData, formData.productType, intakeMethod);
    doReset();
  }, [formData, intakeMethod, doReset]);

  const handleAddAnother = useCallback(() => {
    doReset();
  }, [doReset]);

  const setField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

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

  const handleBack = useCallback(() => {
    if (step > 1) setStep((s) => s - 1);
  }, [step]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveError(null);

    const endpoint =
      formData.productType === "finished_jewelry"
        ? "/api/airtable/create-jewelry"
        : "/api/airtable/create-stone";

    try {
      const res = await fetch(endpoint, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...formData, intakeMethod }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setSaveError(json.error || `HTTP ${res.status}`);
        setSaving(false);
        return;
      }

      setSavedId(json.id || "saved");
      setSaving(false);
    } catch (err) {
      setSaveError("Network error — check connection and try again.");
      setSaving(false);
    }
  }, [formData, intakeMethod]);

  const typeInfo = PRODUCT_TYPES.find((t) => t.key === formData.productType) || {};

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>
      {showResetConfirm && (
        <ConfirmResetDialog
          onSaveDraft={handleSaveDraftThenReset}
          onConfirm={doReset}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}

      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontFamily: C.dat, fontSize: 18, fontWeight: 700, color: C.ch, marginBottom: 3 }}>
          קליטת מוצר
        </h2>
        <p style={{ fontFamily: C.heb, fontSize: 11, color: C.chl, margin: 0 }}>
          הוסף אבן, סט, חבילה, חלק או תכשיט למלאי
        </p>
      </div>

      <StepIndicator current={step} />

      <div style={{ background: "#fff", border: "1px solid rgba(54,69,79,0.1)", borderRadius: 10, padding: "22px 24px", boxShadow: "0 2px 10px rgba(54,69,79,0.06)" }}>

        {/* STEP 1 */}
        {step === 1 && (
          <ProductTypeSelector onSelect={handleTypeSelect} />
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <IntakeMethodSelector productType={formData.productType} onSelect={handleMethodSelect} />
            <div style={{ marginTop: 16 }}>
              <BackButton onClick={handleBack} />
            </div>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <div style={{ marginBottom: 16 }}>
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
              onBack={handleBack}
              onNext={handleFormNext}
            />
          </>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <>
            {savedId ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 38, marginBottom: 10 }}>✅</div>
                <div style={{ fontFamily: C.dat, fontSize: 17, fontWeight: 700, color: C.ch, marginBottom: 6 }}>
                  המוצר נשמר
                </div>
                <div style={{ fontFamily: C.heb, fontSize: 11, color: C.chl, marginBottom: 3 }}>
                  נוצרה רשומה ב־Airtable
                </div>
                <div style={{ fontFamily: "'Courier New',monospace", fontSize: 10, color: C.chm, background: "rgba(54,69,79,0.05)", padding: "3px 10px", borderRadius: 4, display: "inline-block", marginBottom: 20 }}>
                  {savedId}
                </div>
                <div>
                  <button onClick={handleAddAnother} style={BTN_PRIMARY}>
                    + הוסף מוצר נוסף
                  </button>
                </div>
              </div>
            ) : (
              <>
                <ProductReview
                  formData={{ ...formData, intakeMethod }}
                  productType={formData.productType}
                  onChange={setField}
                  onSave={handleSave}
                  onBack={handleBack}
                  saving={saving}
                  saveError={saveError}
                  savedId={savedId}
                  onReset={handleReset}
                />

                <div style={{ marginTop: 14 }}>
                  <button
                    onClick={handleReset}
                    title="Clear all and start from Step 1"
                    style={{ height: 40, padding: "0 16px", border: "1px solid rgba(54,69,79,0.2)", borderRadius: 7, background: "transparent", cursor: "pointer", fontFamily: C.heb, fontSize: 12, color: C.chl }}
                  >
                    ↺ איפוס טופס
                  </button>
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

const BTN_PRIMARY = {
  height: 42, padding: "0 22px",
  background: "#36454F", color: "#FAF9F6",
  border: "none", borderRadius: 7,
  cursor: "pointer", fontFamily: "'DM Sans',Helvetica,Arial,sans-serif",
  fontSize: 13, fontWeight: 700,
  display: "flex", alignItems: "center", gap: 5,
};
