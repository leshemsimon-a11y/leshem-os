/**
 * components/inventory/ProductIntakeWizard.jsx
 *
 * Product Intake Wizard — Milestone 5.2
 *
 * Steps:
 *   1 — Product Type Selection (ProductTypeSelector)
 *   2 — Intake Method (IntakeMethodSelector)
 *   3 — Form Fields (ProductFormFields)
 *   4 — Review + Report Choice + Save (ProductReview)
 *
 * State:
 *   step:      1–4
 *   formData:  flat object containing all form fields + wizard meta
 *   saving:    boolean — POST in progress
 *   saveError: string|null
 *   savedId:   string|null — Airtable record ID after successful save
 *
 * Save logic:
 *   Finished Jewelry → POST /api/airtable/create-jewelry
 *   All other types  → POST /api/airtable/create-stone
 *
 * Security: API routes handle Airtable token server-side.
 *   The browser never sees the token.
 */

import { useState, useCallback } from "react";
import { C } from "../../lib/constants";
import { ProductTypeSelector }  from "./ProductTypeSelector";
import { IntakeMethodSelector } from "./IntakeMethodSelector";
import { ProductFormFields }    from "./ProductFormFields";
import { ProductReview }        from "./ProductReview";

const SANS = "'DM Sans',Helvetica,Arial,sans-serif";
const HEB  = "'Assistant','Heebo',Arial,sans-serif";
const CH   = C.ch;
const CHL  = C.chl;
const GD   = C.gd;

// ─── Product type → report defaults (mirrors create-stone.js API) ─────────────
// Duplicated here (client-side) so the wizard can set the initial `generateReport`
// and `reportType` state when the user picks a product type.
const TYPE_DEFAULTS = {
  natural_diamond:     { reportAutoGenerate: true,  defaultReportType: "Natural Diamond Report"      },
  lab_grown_diamond:   { reportAutoGenerate: true,  defaultReportType: "Lab-Grown Diamond Report"    },
  fancy_color_diamond: { reportAutoGenerate: true,  defaultReportType: "Fancy Color Diamond Report"  },
  colored_gemstone:    { reportAutoGenerate: true,  defaultReportType: "Colored Gemstone Report"     },
  stone_pair_set:      { reportAutoGenerate: true,  defaultReportType: "Pair / Set Report"           },
  stone_parcel:        { reportAutoGenerate: false, defaultReportType: "In-House Stone Report"       },
  jewelry_part:        { reportAutoGenerate: false, defaultReportType: "None"                        },
  finished_jewelry:    { reportAutoGenerate: false, defaultReportType: "Jewelry Valuation Report"    },
};

// ─── Initial blank form state ─────────────────────────────────────────────────
const INITIAL_FORM = {
  // Wizard meta (steps 1–2)
  productType:    null,
  intakeMethod:   null,

  // Certificate import
  certImportLab:          "",
  certImportReportNumber: "",
  certImportUrl:          "",

  // Common stone fields
  sku:              "",
  title:            "",
  inventoryStatus:  "במלאי",
  stoneType:        "",
  shape:            "",
  caratWeight:      "",
  stoneCount:       "",
  avgStoneWeight:   "",
  supplierName:     "",
  costUsd:          "",
  certLab:          "",
  color:            "",
  clarity:          "",
  measurements:     "",
  lengthMm:         "",
  widthMm:          "",
  heightMm:         "",
  treatment:        "",
  origin:           "",
  laserInscription: "",

  // Diamond grading
  cutGrade:  "",
  polish:    "",
  symmetry:  "",

  // Fluorescence
  fluorescenceIntensity: "",
  fluorescenceColor:     "",

  // Lab grown
  growthMethod: "",

  // Fancy color
  fancyColorIntensity: "",
  fancyColorHue:       "",

  // Gemstone
  transparency: "",
  gemClarity:   "",
  cutForm:      "",

  // Report generation
  generateReport: false,
  reportType:     "",

  // Misc
  verificationId:  "",
  verificationUrl: "",
  internalNotes:   "",

  // Jewelry-specific (finished_jewelry only)
  productModel:         "",
  jewelryProductType:   "Finished Jewelry",
  metalColor:           "",
  metalKarat:           "",
  metalWeight:          "",
  castingMethod:        "",
  complexity:           "",
  retailPrice:          "",
};

// ─── StepIndicator ────────────────────────────────────────────────────────────
function StepIndicator({ step }) {
  const steps = ["סוג מוצר", "שיטת קליטה", "פרטים", "סיכום ושמירה"];
  return (
    <div
      style={{
        display:      "flex",
        alignItems:   "center",
        gap:           0,
        marginBottom: 28,
        flexWrap:     "nowrap",
        overflowX:    "auto",
      }}
    >
      {steps.map((label, i) => {
        const num   = i + 1;
        const done  = step > num;
        const active = step === num;
        return (
          <div key={num} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            {/* Step circle */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  width:        30,
                  height:       30,
                  borderRadius: "50%",
                  display:      "flex",
                  alignItems:   "center",
                  justifyContent:"center",
                  fontFamily:   SANS,
                  fontSize:     13,
                  fontWeight:   700,
                  background:   done ? GD : active ? CH : "rgba(54,69,79,0.1)",
                  color:        done || active ? "#fff" : CHL,
                  transition:   "all 0.2s",
                }}
              >
                {done ? "✓" : num}
              </div>
              <span
                style={{
                  fontFamily:  HEB,
                  fontSize:    10,
                  color:       active ? CH : CHL,
                  fontWeight:  active ? 600 : 400,
                  whiteSpace:  "nowrap",
                }}
              >
                {label}
              </span>
            </div>

            {/* Connector line (not after last) */}
            {i < steps.length - 1 && (
              <div
                style={{
                  width:        24,
                  height:       2,
                  background:   step > num ? GD : "rgba(54,69,79,0.12)",
                  margin:       "0 4px 18px",
                  flexShrink:   0,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function SectionLabel({ step, productType }) {
  if (step === 1) return null; // ProductTypeSelector has its own label
  const labels = {
    2: "שיטת קליטה",
    3: "פרטי הפריט",
    4: "סיכום ושמירה",
  };
  return labels[step] ? (
    <div
      style={{
        fontFamily:    "'Merriweather','Times New Roman',Georgia,serif",
        fontSize:      16,
        fontWeight:    700,
        color:         CH,
        letterSpacing: "0.04em",
        marginBottom:  18,
      }}
    >
      {labels[step]}
    </div>
  ) : null;
}

// ─── ProductIntakeWizard ──────────────────────────────────────────────────────
export function ProductIntakeWizard() {
  const [step,      setStep]      = useState(1);
  const [formData,  setFormData]  = useState({ ...INITIAL_FORM });
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [savedId,   setSavedId]   = useState(null);

  // ── Single-field updater ──────────────────────────────────────────────────
  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // ── Step 1: product type selected ─────────────────────────────────────────
  const handleTypeSelect = useCallback((type) => {
    const d = TYPE_DEFAULTS[type] ?? { reportAutoGenerate: false, defaultReportType: "None" };
    setFormData((prev) => ({
      ...prev,
      productType:    type,
      generateReport: d.reportAutoGenerate,
      reportType:     d.defaultReportType,
    }));
    setStep(2);
  }, []);

  // ── Step 2: intake method selected ────────────────────────────────────────
  const handleMethodSelect = useCallback((method) => {
    setFormData((prev) => ({ ...prev, intakeMethod: method }));
    setStep(3);
  }, []);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveError(null);

    const isJewelry = formData.productType === "finished_jewelry";
    const endpoint  = isJewelry
      ? "/api/airtable/create-jewelry"
      : "/api/airtable/create-stone";

    try {
      const res  = await fetch(endpoint, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setSavedId(data.id || "saved");
    } catch (err) {
      setSaveError(err.message || "Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [formData]);

  // ── Reset to start a new intake ───────────────────────────────────────────
  const handleReset = useCallback(() => {
    setStep(1);
    setFormData({ ...INITIAL_FORM });
    setSaving(false);
    setSaveError(null);
    setSavedId(null);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        maxWidth: 780,
        margin:   "0 auto",
      }}
    >
      {/* Step progress indicator */}
      <StepIndicator step={step} />

      {/* Section label */}
      <SectionLabel step={step} productType={formData.productType} />

      {/* Step content */}
      {step === 1 && (
        <ProductTypeSelector
          onSelect={handleTypeSelect}
          selectedType={formData.productType}
        />
      )}

      {step === 2 && (
        <IntakeMethodSelector
          productType={formData.productType}
          onSelect={handleMethodSelect}
          onBack={() => setStep(1)}
          selectedMethod={formData.intakeMethod}
        />
      )}

      {step === 3 && (
        <ProductFormFields
          productType={formData.productType}
          intakeMethod={formData.intakeMethod}
          formData={formData}
          onChange={handleChange}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <ProductReview
          productType={formData.productType}
          formData={formData}
          onChange={handleChange}
          onSave={handleSave}
          onBack={() => setStep(3)}
          saving={saving}
          saveError={saveError}
          savedId={savedId}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
