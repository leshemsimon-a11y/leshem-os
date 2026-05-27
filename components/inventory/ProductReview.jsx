/**
 * components/inventory/ProductReview.jsx
 *
 * Step 4 of the Product Intake Wizard.
 *
 * Shows:
 *   1. Summary of filled fields
 *   2. "Generate LESHEM.S Report?" toggle (Yes / No)
 *   3. Default report type (pre-filled, editable)
 *   4. Save button
 *   5. Back button
 *
 * Also handles success and error display inline.
 *
 * Props:
 *   productType: string
 *   formData: object
 *   onChange(field, value): void
 *   onSave(): void
 *   onBack(): void
 *   saving: boolean
 *   saveError: string|null
 *   savedId: string|null        — set after successful save
 *   onReset(): void             — for "Add Another" after success
 */

import { C } from "../../lib/constants";
import { PRODUCT_TYPES } from "./ProductTypeSelector";

const SANS = "'DM Sans',Helvetica,Arial,sans-serif";
const HEB  = "'Assistant','Heebo',Arial,sans-serif";
const CH   = C.ch;
const CHM  = "#4a5c68";
const CHL  = C.chl;
const GD   = C.gd;
const IV2  = "#F0EDE8";

// ─── Report type options ──────────────────────────────────────────────────────
const REPORT_TYPES = [
  "Natural Diamond Report",
  "Lab-Grown Diamond Report",
  "Fancy Color Diamond Report",
  "Colored Gemstone Report",
  "Pair / Set Report",
  "In-House Stone Report",
  "Jewelry Valuation Report",
  "None",
];

// ─── Human-readable labels for form fields ────────────────────────────────────
const FIELD_LABELS = {
  sku:                  'מק"ט',
  title:                "Title / Description",
  inventoryStatus:      "סטטוס מלאי",
  stoneType:            "Stone Type",
  shape:                "Shape",
  cutForm:              "Cut / Form",
  caratWeight:          "Carat Weight",
  stoneCount:           "Stone Count",
  avgStoneWeight:       "Avg Stone Weight",
  color:                "Colour",
  clarity:              "Clarity",
  cutGrade:             "Cut Grade",
  polish:               "Polish",
  symmetry:             "Symmetry",
  fancyColorIntensity:  "Fancy Color Intensity",
  fancyColorHue:        "Fancy Color Hue",
  transparency:         "Transparency",
  gemClarity:           "Gemstone Clarity",
  treatment:            "Treatment",
  fluorescenceIntensity:"Fluorescence Intensity",
  fluorescenceColor:    "Fluorescence Color",
  growthMethod:         "Growth Method",
  lengthMm:             "Length (mm)",
  widthMm:              "Width (mm)",
  heightMm:             "Depth (mm)",
  certLab:              "Certificate Lab",
  origin:               "Country of Origin",
  laserInscription:     "Laser Inscription",
  certImportLab:        "External Cert Lab",
  certImportReportNumber:"External Report #",
  certImportUrl:        "External Cert URL",
  supplierName:         "Supplier",
  costUsd:              "Cost (USD)",
  internalNotes:        "Internal Notes",
  productModel:         "Product Model",
  metalColor:           "Metal Color",
  metalKarat:           "Metal Karat",
  metalWeight:          "Metal Weight (g)",
  castingMethod:        "Casting Method",
  complexity:           "Complexity",
  retailPrice:          "Retail Price (ILS)",
};

// Fields that should appear in the summary (exclude meta/step fields)
const SUMMARY_FIELDS = Object.keys(FIELD_LABELS);

// ─── SummaryRow ───────────────────────────────────────────────────────────────
function SummaryRow({ label, value, stripe }) {
  if (value === null || value === undefined || value === "" || value === false) return null;
  return (
    <div
      style={{
        display:    "flex",
        gap:         12,
        padding:    "7px 0",
        borderBottom:"1px solid rgba(54,69,79,0.07)",
        background: stripe ? "rgba(54,69,79,0.015)" : "transparent",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          fontFamily:    SANS,
          fontSize:      11,
          color:         CHL,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          minWidth:      140,
          flexShrink:    0,
          paddingTop:    2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: SANS,
          fontSize:   13,
          color:      CH,
          lineHeight: 1.5,
          wordBreak:  "break-word",
        }}
      >
        {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}
      </div>
    </div>
  );
}

// ─── SuccessState ─────────────────────────────────────────────────────────────
function SuccessState({ savedId, productLabel, onReset }) {
  return (
    <div
      style={{
        textAlign:    "center",
        padding:      "40px 24px",
        background:   "rgba(74,138,82,0.04)",
        border:       "1px solid rgba(74,138,82,0.2)",
        borderRadius: 10,
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
      <h3
        style={{
          fontFamily:    SANS,
          fontSize:      18,
          fontWeight:    700,
          color:         "#3d7a44",
          marginBottom:  8,
        }}
      >
        הפריט נשמר בהצלחה!
      </h3>
      <div style={{ fontFamily: HEB, fontSize: 14, color: CHM, marginBottom: 6 }}>
        {productLabel} נוסף למלאי Airtable
      </div>
      {savedId && (
        <div
          style={{
            fontFamily:    "'Courier New',monospace",
            fontSize:      12,
            color:         CHL,
            background:    IV2,
            display:       "inline-block",
            padding:       "4px 12px",
            borderRadius:  5,
            marginBottom:  24,
            letterSpacing: "0.05em",
          }}
        >
          ID: {savedId}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
        <button
          onClick={onReset}
          style={{
            height:       44,
            padding:      "0 24px",
            border:       "none",
            borderRadius: 6,
            background:   CH,
            color:        "#FAF9F6",
            fontFamily:   HEB,
            fontSize:     14,
            fontWeight:   600,
            cursor:       "pointer",
          }}
        >
          + הוסף פריט נוסף
        </button>
      </div>
    </div>
  );
}

// ─── ReportChoiceSection ──────────────────────────────────────────────────────
function ReportChoiceSection({ formData, onChange }) {
  const gen = formData.generateReport;
  return (
    <div
      style={{
        background:   "rgba(197,179,88,0.06)",
        border:       "1px solid rgba(197,179,88,0.25)",
        borderRadius: 8,
        padding:      "16px 18px",
        marginBottom: 20,
      }}
    >
      <div
        style={{
          fontFamily:    SANS,
          fontSize:      12,
          fontWeight:    700,
          color:         CHM,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom:  12,
        }}
      >
        דוח LESHEM.S
      </div>

      <div style={{ fontFamily: HEB, fontSize: 13, color: CH, marginBottom: 12 }}>
        האם לצור דוח LESHEM.S אוטומטי?
      </div>

      {/* Yes / No toggle */}
      <div style={{ display: "flex", gap: 10, marginBottom: gen ? 16 : 0 }}>
        {[{ val: true, label: "כן, צור דוח" }, { val: false, label: "לא כרגע" }].map(({ val, label }) => (
          <button
            key={String(val)}
            onClick={() => onChange("generateReport", val)}
            style={{
              height:       40,
              padding:      "0 18px",
              border:       gen === val
                ? `2px solid ${GD}`
                : "1.5px solid rgba(54,69,79,0.18)",
              borderRadius: 6,
              background:   gen === val ? "rgba(197,179,88,0.12)" : "#fff",
              color:        gen === val ? "#8a6800" : CHM,
              fontFamily:   HEB,
              fontSize:     13,
              fontWeight:   gen === val ? 700 : 400,
              cursor:       "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Report type dropdown — shown when Yes is selected */}
      {gen && (
        <div style={{ marginTop: 12 }}>
          <label
            style={{
              display:       "block",
              fontFamily:    SANS,
              fontSize:      10.5,
              fontWeight:    600,
              color:         CHL,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom:  5,
            }}
          >
            Report Type
          </label>
          <select
            value={formData.reportType || ""}
            onChange={(e) => onChange("reportType", e.target.value)}
            style={{
              width:        "100%",
              height:       44,
              border:       "1px solid rgba(54,69,79,0.18)",
              borderRadius: 6,
              background:   "#fff",
              padding:      "0 12px",
              fontFamily:   SANS,
              fontSize:     14,
              color:        CH,
              outline:      "none",
              boxSizing:    "border-box",
            }}
          >
            <option value="">— select report type —</option>
            {REPORT_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <p style={{ fontFamily: HEB, fontSize: 11, color: CHL, marginTop: 6, lineHeight: 1.5 }}>
            סוג הדוח נשמר ב-Airtable. חיבור לממשק הדוחות יתווסף בגרסה הבאה.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── ProductReview (main export) ──────────────────────────────────────────────
export function ProductReview({ productType, formData, onChange, onSave, onBack, saving, saveError, savedId, onReset }) {
  // If already saved — show success
  if (savedId) {
    const ptInfo = PRODUCT_TYPES.find((p) => p.key === productType);
    return (
      <SuccessState
        savedId={savedId}
        productLabel={ptInfo?.label ?? productType}
        onReset={onReset}
      />
    );
  }

  // Product type label
  const ptInfo = PRODUCT_TYPES.find((p) => p.key === productType);
  const ptLabel = ptInfo ? `${ptInfo.icon} ${ptInfo.label}` : productType;
  const methodLabel = formData.intakeMethod === "certificate" ? "ייבוא תעודה" : "הזנה ידנית";

  return (
    <div>
      {/* Summary header */}
      <div
        style={{
          display:      "flex",
          alignItems:   "center",
          gap:           10,
          marginBottom: 20,
          flexWrap:     "wrap",
        }}
      >
        <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: CH }}>{ptLabel}</span>
        <span style={{ fontFamily: HEB, fontSize: 12, color: CHL, background: IV2, padding: "2px 10px", borderRadius: 10, border: "1px solid rgba(54,69,79,0.12)" }}>
          {methodLabel}
        </span>
      </div>

      {/* Summary rows */}
      <div
        style={{
          border:       "1px solid rgba(54,69,79,0.1)",
          borderRadius: 8,
          padding:      "6px 14px",
          background:   "#fff",
          marginBottom: 20,
        }}
      >
        {SUMMARY_FIELDS.map((key, i) => (
          <SummaryRow
            key={key}
            label={FIELD_LABELS[key]}
            value={formData[key]}
            stripe={i % 2 === 0}
          />
        ))}

        {/* If no fields filled */}
        {SUMMARY_FIELDS.every((k) => !formData[k]) && (
          <p style={{ fontFamily: HEB, fontSize: 12, color: CHL, padding: "12px 0", textAlign: "center" }}>
            לא הוזנו פרטים
          </p>
        )}
      </div>

      {/* Report choice */}
      <ReportChoiceSection formData={formData} onChange={onChange} />

      {/* Error state */}
      {saveError && (
        <div
          style={{
            padding:      "12px 16px",
            background:   "rgba(176,64,64,0.06)",
            border:       "1px solid rgba(176,64,64,0.2)",
            borderRadius: 7,
            fontFamily:   HEB,
            fontSize:     13,
            color:        "#b04040",
            lineHeight:   1.55,
            marginBottom: 16,
          }}
        >
          ⚠️ {saveError}
        </div>
      )}

      {/* Navigation */}
      <div
        style={{
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
          paddingTop:     18,
          borderTop:      "1px solid rgba(54,69,79,0.1)",
          flexWrap:       "wrap",
          gap:             12,
        }}
      >
        <button
          onClick={onBack}
          disabled={saving}
          style={{
            height:       44,
            padding:      "0 20px",
            border:       "1px solid rgba(54,69,79,0.2)",
            borderRadius: 6,
            background:   "transparent",
            color:        saving ? CHL : CHM,
            fontFamily:   HEB,
            fontSize:     13,
            cursor:       saving ? "not-allowed" : "pointer",
          }}
        >
          ← עריכה
        </button>

        <button
          onClick={onSave}
          disabled={saving}
          style={{
            height:       48,
            padding:      "0 32px",
            border:       "none",
            borderRadius: 6,
            background:   saving ? "#a0b0b8" : CH,
            color:        "#FAF9F6",
            fontFamily:   HEB,
            fontSize:     15,
            fontWeight:   700,
            cursor:       saving ? "not-allowed" : "pointer",
            display:      "flex",
            alignItems:   "center",
            gap:           8,
            transition:   "background 0.15s",
          }}
        >
          {saving ? (
            <>
              <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span>
              שומר…
            </>
          ) : (
            <>💾 שמור ב-Airtable</>
          )}
        </button>
      </div>

      {/* Spin animation */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
