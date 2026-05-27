/**
 * components/inventory/ProductFormFields.jsx
 *
 * Step 3 of the Product Intake Wizard.
 * Renders the correct fields for the selected product type.
 * If intakeMethod === "certificate", shows cert-import fields first.
 *
 * NOTE: AI/OCR auto-extraction from certificates is not implemented here.
 * It will be connected in a later milestone.
 * The certificate import section collects metadata only; the user manually
 * reviews and edits the grading fields below.
 *
 * Props:
 *   productType: string
 *   intakeMethod: "manual" | "certificate"
 *   formData: object
 *   onChange(field: string, value: any): void
 *   onNext(): void
 *   onBack(): void
 */

import {
  stoneShapes,
  diamondColorGrades,
  diamondClarityGrades,
  diamondCutGrades,
  polishSymmetryGrades,
  fluorescenceIntensities,
  fluorescenceColors,
  fancyColorHues,
  fancyColorIntensities,
  gemstoneSpecies,
  gemstoneTransparency,
  gemstoneTreatments,
  gemstoneClarityGrades,
  certificateLabs,
  labGrowthMethods,
  cutFormOptions,
} from "../../lib/gemology/taxonomy";
import { C } from "../../lib/constants";

// ─── Design ────────────────────────────────────────────────────────────────
const SANS = "'DM Sans',Helvetica,Arial,sans-serif";
const HEB  = "'Assistant','Heebo',Arial,sans-serif";
const CH   = C.ch;
const CHM  = "#4a5c68";
const CHL  = C.chl;
const GD   = C.gd;
const IV2  = "#F0EDE8";

const INPUT_STYLE = {
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
  direction:    "ltr",
};

const LABEL_STYLE = {
  display:       "block",
  fontFamily:    SANS,
  fontSize:      10.5,
  fontWeight:    600,
  color:         CHL,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  marginBottom:  5,
};

const TA_STYLE = {
  ...INPUT_STYLE,
  height:    "auto",
  minHeight: 80,
  padding:   "10px 12px",
  resize:    "vertical",
  lineHeight:1.6,
};

// ─── Atom helpers ──────────────────────────────────────────────────────────

function Inp({ label, field, formData, onChange, placeholder, type = "text", required }) {
  return (
    <div>
      <label style={LABEL_STYLE}>
        {label}
        {required && <span style={{ color: "#b04040", marginLeft: 3 }}>*</span>}
      </label>
      <input
        type={type}
        value={formData[field] ?? ""}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={placeholder}
        style={INPUT_STYLE}
      />
    </div>
  );
}

function Sel({ label, field, formData, onChange, options, placeholder, required }) {
  return (
    <div>
      <label style={LABEL_STYLE}>
        {label}
        {required && <span style={{ color: "#b04040", marginLeft: 3 }}>*</span>}
      </label>
      <select
        value={formData[field] ?? ""}
        onChange={(e) => onChange(field, e.target.value)}
        style={INPUT_STYLE}
      >
        <option value="">{placeholder || "— select —"}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function TA({ label, field, formData, onChange, placeholder }) {
  return (
    <div>
      <label style={LABEL_STYLE}>{label}</label>
      <textarea
        value={formData[field] ?? ""}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={placeholder}
        style={TA_STYLE}
      />
    </div>
  );
}

// Two-column responsive grid
function Grid2({ children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
      {children}
    </div>
  );
}

// Labelled section with gold-accent heading
function SecTitle({ children }) {
  return (
    <div
      style={{
        display:       "flex",
        alignItems:    "center",
        gap:            8,
        marginTop:     22,
        marginBottom:  14,
      }}
    >
      <div style={{ width: 2, height: 14, background: GD, borderRadius: 1, flexShrink: 0 }} />
      <span
        style={{
          fontFamily:    SANS,
          fontSize:      11,
          fontWeight:    700,
          color:         CHM,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {children}
      </span>
      <div style={{ flex: 1, height: "0.5px", background: "rgba(54,69,79,0.1)" }} />
    </div>
  );
}

// ─── Product-type predicates ───────────────────────────────────────────────

const DIAMOND_TYPES  = ["natural_diamond", "lab_grown_diamond", "stone_pair_set"];
const FANCY_TYPES    = ["fancy_color_diamond"];
const GEM_TYPES      = ["colored_gemstone"];
const PAIR_PARCEL    = ["stone_pair_set", "stone_parcel"];
const HAS_SHAPE      = ["natural_diamond", "lab_grown_diamond", "fancy_color_diamond", "colored_gemstone", "stone_pair_set", "jewelry_part"];
const HAS_CERT       = ["natural_diamond", "lab_grown_diamond", "fancy_color_diamond", "colored_gemstone"];
const HAS_LASER      = ["natural_diamond", "lab_grown_diamond"];
const HAS_DIMENSIONS = ["natural_diamond", "lab_grown_diamond", "fancy_color_diamond", "colored_gemstone", "stone_pair_set"];
const HAS_FLUORESCENCE = ["natural_diamond", "lab_grown_diamond", "fancy_color_diamond", "stone_pair_set"];

const is    = (pt, arr) => arr.includes(pt);
const isDiamond = (pt) => is(pt, DIAMOND_TYPES);
const isFancy   = (pt) => is(pt, FANCY_TYPES);
const isGem     = (pt) => is(pt, GEM_TYPES);
const isPairParcel = (pt) => is(pt, PAIR_PARCEL);

const STATUS_OPTIONS = ["במלאי", "נמכר", "שמור", "הזמנה", "בדרך"];
const METAL_KARAT_OPTIONS = ["18K", "14K", "21K", "9K", "Platinum", "Silver 925"];
const CAST_OPTIONS = ["CAD / Casting", "Hand Fabricated", "Lost Wax", "3D Printing"];
const COMPLEXITY_OPTIONS = ["Simple", "Medium", "Complex", "Very Complex", "Extreme"];

// ─── Certificate import section ────────────────────────────────────────────

function CertImportSection({ formData, onChange }) {
  return (
    <div
      style={{
        padding:      "16px 18px",
        background:   "rgba(197,179,88,0.05)",
        border:       "1px solid rgba(197,179,88,0.25)",
        borderRadius: 8,
        marginBottom: 22,
      }}
    >
      <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: CHM, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
        External Certificate Details
      </div>

      {/*
        AI EXTRACTION PLACEHOLDER
        ──────────────────────────────────────────────────────────────────────
        TODO (future milestone): Connect an AI/OCR service here to automatically
        extract stone grading data from the certificate PDF or image.
        The extracted values should pre-fill the form fields below for review.
        Do NOT implement real extraction in Milestone 5.2.
        ──────────────────────────────────────────────────────────────────────
      */}
      <div
        style={{
          padding:     "10px 12px",
          background:  "rgba(54,69,79,0.04)",
          borderRadius: 6,
          fontFamily:  HEB,
          fontSize:    12,
          color:       CHL,
          marginBottom: 16,
          lineHeight:  1.55,
        }}
      >
        🤖 חילוץ נתונים אוטומטי מהתעודה ייתווסף בגרסה הבאה.
        הזן את פרטי התעודה ועדכן את שדות הגרעינות ידנית.
      </div>

      <Grid2>
        <Inp label="Certificate Lab" field="certImportLab" formData={formData} onChange={onChange} placeholder="GIA, IGI, HRD…" />
        <Inp label="Certificate / Report Number" field="certImportReportNumber" formData={formData} onChange={onChange} placeholder="e.g. 2473659812" />
      </Grid2>
      <div style={{ marginTop: 14 }}>
        <Inp label="Certificate URL (optional)" field="certImportUrl" formData={formData} onChange={onChange} placeholder="https://…" />
      </div>

      <div style={{ marginTop: 10, fontFamily: HEB, fontSize: 11, color: CHL, lineHeight: 1.5 }}>
        פרטי התעודה יישמרו בשדה "Internal Notes" ברשומת Airtable.
      </div>
    </div>
  );
}

// ─── Finished Jewelry form ─────────────────────────────────────────────────

function JewelryForm({ formData, onChange }) {
  return (
    <>
      <SecTitle>פרטי תכשיט</SecTitle>
      <Grid2>
        <Inp label='מק"ט' field="sku" formData={formData} onChange={onChange} placeholder="LS-RG-001" />
        <Inp label="Product Model / Name" field="productModel" formData={formData} onChange={onChange} placeholder="Diamond Solitaire Ring" required />
      </Grid2>

      <SecTitle>Metal</SecTitle>
      <Grid2>
        <Sel label="Metal Color" field="metalColor" formData={formData} onChange={onChange}
             options={["Yellow Gold", "White Gold", "Rose Gold", "Platinum", "Silver"]}
             placeholder="Select color…" />
        <Sel label="Karat / Material" field="metalKarat" formData={formData} onChange={onChange}
             options={METAL_KARAT_OPTIONS} placeholder="Select karat…" />
      </Grid2>
      <Grid2>
        <Inp label="Metal Weight (grams)" field="metalWeight" formData={formData} onChange={onChange} type="number" placeholder="4.20" />
        <Sel label="Casting Method" field="castingMethod" formData={formData} onChange={onChange}
             options={CAST_OPTIONS} placeholder="Select method…" />
      </Grid2>

      <SecTitle>Pricing</SecTitle>
      <Grid2>
        <Sel label="Complexity" field="complexity" formData={formData} onChange={onChange}
             options={COMPLEXITY_OPTIONS} placeholder="Select complexity…" />
        <Inp label="Retail Price (ILS incl. VAT)" field="retailPrice" formData={formData} onChange={onChange} type="number" placeholder="5800" />
      </Grid2>
    </>
  );
}

// ─── Stone form (all non-jewelry types) ───────────────────────────────────

function StoneForm({ productType, formData, onChange }) {
  const pt = productType;

  return (
    <>
      {/* Basic info */}
      <SecTitle>פרטי בסיס</SecTitle>
      <Grid2>
        <Inp label='מק"ט (ID)' field="sku" formData={formData} onChange={onChange} placeholder="LS-ND-001" />
        <Inp label="Title / Description" field="title" formData={formData} onChange={onChange} placeholder="e.g. Round Brilliant 1.02ct G VS1" />
      </Grid2>
      <Sel label="סטטוס מלאי" field="inventoryStatus" formData={formData} onChange={onChange}
           options={STATUS_OPTIONS} placeholder="—" />

      {/* Stone type (gemstones, pairs, parcels, parts) */}
      {(isGem(pt) || isPairParcel(pt) || pt === "jewelry_part") && (
        <>
          <SecTitle>Stone Identity</SecTitle>
          {isGem(pt) ? (
            <Sel label="Species" field="stoneType" formData={formData} onChange={onChange}
                 options={gemstoneSpecies} placeholder="Select species…" required />
          ) : (
            <Inp label="Stone Type" field="stoneType" formData={formData} onChange={onChange}
                 placeholder="Diamond, Ruby…" />
          )}
        </>
      )}

      {/* Shape and cut */}
      {is(pt, HAS_SHAPE) && (
        <>
          <SecTitle>Shape & Cut</SecTitle>
          <Grid2>
            <Sel label="Shape" field="shape" formData={formData} onChange={onChange}
                 options={stoneShapes} placeholder="Select shape…" />
            {isGem(pt) && (
              <Sel label="Cut / Form" field="cutForm" formData={formData} onChange={onChange}
                   options={cutFormOptions} placeholder="Faceted / Cabochon…" />
            )}
          </Grid2>
        </>
      )}

      {/* Weight */}
      <SecTitle>Weight</SecTitle>
      <Grid2>
        <Inp label="Carat Weight" field="caratWeight" formData={formData} onChange={onChange}
             type="number" placeholder="1.02" required={pt !== "jewelry_part"} />
        {(isPairParcel(pt) || isGem(pt)) && (
          <Inp label="Stone Count" field="stoneCount" formData={formData} onChange={onChange}
               type="number" placeholder="22" />
        )}
        {isPairParcel(pt) && (
          <Inp label="Avg Stone Weight (ct)" field="avgStoneWeight" formData={formData} onChange={onChange}
               type="number" placeholder="0.05" />
        )}
      </Grid2>

      {/* Diamond grading */}
      {isDiamond(pt) && (
        <>
          <SecTitle>Diamond Grading</SecTitle>
          <Grid2>
            <Sel label="Colour Grade" field="color" formData={formData} onChange={onChange}
                 options={diamondColorGrades} placeholder="D–Z…" />
            <Sel label="Clarity Grade" field="clarity" formData={formData} onChange={onChange}
                 options={diamondClarityGrades} placeholder="FL–I3…" />
          </Grid2>
          <Grid2>
            <Sel label="Cut Grade" field="cutGrade" formData={formData} onChange={onChange}
                 options={diamondCutGrades} placeholder="Select cut…" />
            <Sel label="Polish" field="polish" formData={formData} onChange={onChange}
                 options={polishSymmetryGrades} placeholder="Select polish…" />
          </Grid2>
          <Sel label="Symmetry" field="symmetry" formData={formData} onChange={onChange}
               options={polishSymmetryGrades} placeholder="Select symmetry…" />
        </>
      )}

      {/* Fancy color grading */}
      {isFancy(pt) && (
        <>
          <SecTitle>Fancy Colour Grading</SecTitle>
          <Grid2>
            <Sel label="Fancy Color Intensity" field="fancyColorIntensity" formData={formData} onChange={onChange}
                 options={fancyColorIntensities} placeholder="Select intensity…" />
            <Sel label="Fancy Color Hue" field="fancyColorHue" formData={formData} onChange={onChange}
                 options={fancyColorHues} placeholder="Select hue…" />
          </Grid2>
          <Grid2>
            <Sel label="Clarity Grade" field="clarity" formData={formData} onChange={onChange}
                 options={diamondClarityGrades} placeholder="FL–I3…" />
            <Sel label="Polish" field="polish" formData={formData} onChange={onChange}
                 options={polishSymmetryGrades} placeholder="Select polish…" />
          </Grid2>
          <Sel label="Symmetry" field="symmetry" formData={formData} onChange={onChange}
               options={polishSymmetryGrades} placeholder="Select symmetry…" />
        </>
      )}

      {/* Gemstone-specific grading */}
      {isGem(pt) && (
        <>
          <SecTitle>Gemstone Grading</SecTitle>
          <Inp label="Colour Description" field="color" formData={formData} onChange={onChange}
               placeholder="Vivid red with purplish hue" />
          <Grid2>
            <Sel label="Transparency" field="transparency" formData={formData} onChange={onChange}
                 options={gemstoneTransparency} placeholder="Select…" />
            <Sel label="Gemstone Clarity" field="gemClarity" formData={formData} onChange={onChange}
                 options={gemstoneClarityGrades} placeholder="Eye Clean…" />
          </Grid2>
          <Sel label="Treatment" field="treatment" formData={formData} onChange={onChange}
               options={gemstoneTreatments} placeholder="Select treatment…" />
        </>
      )}

      {/* Fluorescence */}
      {is(pt, HAS_FLUORESCENCE) && (
        <>
          <SecTitle>Fluorescence</SecTitle>
          <Grid2>
            <Sel label="Fluorescence Intensity" field="fluorescenceIntensity" formData={formData} onChange={onChange}
                 options={fluorescenceIntensities} placeholder="Select intensity…" />
            <Sel label="Fluorescence Color" field="fluorescenceColor" formData={formData} onChange={onChange}
                 options={fluorescenceColors} placeholder="Blue…" />
          </Grid2>
        </>
      )}

      {/* Lab-grown specific */}
      {pt === "lab_grown_diamond" && (
        <>
          <SecTitle>Laboratory Growth</SecTitle>
          <Sel label="Growth Method" field="growthMethod" formData={formData} onChange={onChange}
               options={labGrowthMethods} placeholder="CVD / HPHT…" />
        </>
      )}

      {/* Dimensions */}
      {is(pt, HAS_DIMENSIONS) && (
        <>
          <SecTitle>Measurements</SecTitle>
          <Grid2>
            <Inp label="Length (mm)" field="lengthMm" formData={formData} onChange={onChange} type="number" placeholder="6.42" />
            <Inp label="Width (mm)" field="widthMm" formData={formData} onChange={onChange} type="number" placeholder="6.44" />
            <Inp label="Depth (mm)" field="heightMm" formData={formData} onChange={onChange} type="number" placeholder="3.90" />
          </Grid2>
        </>
      )}

      {/* Certificate & origin */}
      {is(pt, HAS_CERT) && (
        <>
          <SecTitle>Certificate & Origin</SecTitle>
          <Grid2>
            <Sel label="Certificate Lab" field="certLab" formData={formData} onChange={onChange}
                 options={certificateLabs} placeholder="Select lab…" />
            <Inp label="Country of Origin" field="origin" formData={formData} onChange={onChange}
                 placeholder="Botswana, Colombia…" />
          </Grid2>
          {is(pt, HAS_LASER) && (
            <Inp label="Laser Inscription" field="laserInscription" formData={formData} onChange={onChange}
                 placeholder="GIA 2473659812" />
          )}
        </>
      )}

      {/* Cost & supplier */}
      <SecTitle>Cost & Supplier</SecTitle>
      <Grid2>
        <Inp label="Cost (USD)" field="costUsd" formData={formData} onChange={onChange}
             type="number" placeholder="4500" />
        <Inp label="Supplier Name" field="supplierName" formData={formData} onChange={onChange}
             placeholder="Supplier or vendor name" />
      </Grid2>

      {/* Internal notes */}
      <SecTitle>Notes</SecTitle>
      <TA label="Internal Notes" field="internalNotes" formData={formData} onChange={onChange}
          placeholder="Any internal notes…" />
    </>
  );
}

// ─── ProductFormFields (main export) ──────────────────────────────────────

export function ProductFormFields({ productType, intakeMethod, formData, onChange, onNext, onBack }) {
  const isJewelry = productType === "finished_jewelry";

  return (
    <div>
      {/* Certificate import section — always shown first when method = certificate */}
      {intakeMethod === "certificate" && !isJewelry && (
        <CertImportSection formData={formData} onChange={onChange} />
      )}

      {/* Main form fields */}
      {isJewelry
        ? <JewelryForm formData={formData} onChange={onChange} />
        : <StoneForm productType={productType} formData={formData} onChange={onChange} />
      }

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28, paddingTop: 20, borderTop: "1px solid rgba(54,69,79,0.1)" }}>
        <button
          onClick={onBack}
          style={{
            height:       44,
            padding:      "0 20px",
            border:       "1px solid rgba(54,69,79,0.2)",
            borderRadius: 6,
            background:   "transparent",
            color:        CHL,
            fontFamily:   HEB,
            fontSize:     13,
            cursor:       "pointer",
          }}
        >
          ← חזור
        </button>
        <button
          onClick={onNext}
          style={{
            height:       44,
            padding:      "0 28px",
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
          המשך לסיכום ←
        </button>
      </div>
    </div>
  );
}
