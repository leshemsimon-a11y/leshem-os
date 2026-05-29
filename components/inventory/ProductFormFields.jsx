/**
 * components/inventory/ProductFormFields.jsx  —  v5.2.2
 *
 * Changes from v5.2:
 *
 * Task 4 — Media upload foundation:
 *   A new "Media — מדיה" section at the bottom of every form.
 *   Fields: imageUrl, certImageUrl, videoUrl (all plain text/URL inputs).
 *
 *   IMPLEMENTATION NOTE — File uploads:
 *   True Airtable attachment upload requires the Airtable Attachments API
 *   (POST with the file as a base64 data URL or public HTTPS URL).
 *   This is implemented server-side in a future milestone.
 *   For now, these fields accept plain HTTPS URLs only.
 *   The server-side create-stone.js and create-jewelry.js routes should
 *   be updated to pass imageUrl/certImageUrl as Airtable attachment
 *   objects: [{ url: "https://..." }] once attachment upload is built.
 *
 * Task 6 — Terminology:
 *   "סוג שיבוץ" used in jewelry form (was "הגדרה").
 *
 * All other fields, product type predicates, and navigation unchanged.
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

// ─── Design ───────────────────────────────────────────────────────────────────
const SANS = "'DM Sans',Helvetica,Arial,sans-serif";
const HEB  = "'Assistant','Heebo',Arial,sans-serif";
const CH   = C.ch;
const CHM  = "#4a5c68";
const CHL  = C.chl;
const GD   = C.gd;

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
  lineHeight: 1.6,
};

// ─── Atom helpers ─────────────────────────────────────────────────────────────

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

function Grid2({ children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
      {children}
    </div>
  );
}

function SecTitle({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 22, marginBottom: 14 }}>
      <div style={{ width: 2, height: 14, background: GD, borderRadius: 1, flexShrink: 0 }} />
      <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: CHM, letterSpacing: "0.12em", textTransform: "uppercase" }}>
        {children}
      </span>
      <div style={{ flex: 1, height: "0.5px", background: "rgba(54,69,79,0.1)" }} />
    </div>
  );
}

// ─── Product-type predicates ──────────────────────────────────────────────────

const DIAMOND_TYPES    = ["natural_diamond", "lab_grown_diamond", "stone_pair_set"];
const FANCY_TYPES      = ["fancy_color_diamond"];
const GEM_TYPES        = ["colored_gemstone"];
const PAIR_PARCEL      = ["stone_pair_set", "stone_parcel"];
const HAS_SHAPE        = ["natural_diamond", "lab_grown_diamond", "fancy_color_diamond", "colored_gemstone", "stone_pair_set", "jewelry_part"];
const HAS_CERT         = ["natural_diamond", "lab_grown_diamond", "fancy_color_diamond", "colored_gemstone"];
const HAS_LASER        = ["natural_diamond", "lab_grown_diamond"];
const HAS_DIMENSIONS   = ["natural_diamond", "lab_grown_diamond", "fancy_color_diamond"];
const HAS_FLUORESCENCE = ["natural_diamond", "lab_grown_diamond", "fancy_color_diamond", "stone_pair_set"];

const is           = (pt, arr) => arr.includes(pt);
const isDiamond    = (pt) => is(pt, DIAMOND_TYPES);
const isFancy      = (pt) => is(pt, FANCY_TYPES);
const isGem        = (pt) => is(pt, GEM_TYPES);

const STATUS_OPTIONS      = ["במלאי", "נמכר", "שמור", "הזמנה", "בדרך"];
const METAL_KARAT_OPTIONS = ["18K", "14K", "21K", "9K", "Platinum", "Silver 925"];
const CAST_OPTIONS        = ["CAD / Casting", "Hand Fabricated", "Lost Wax", "3D Printing"];
const COMPLEXITY_OPTIONS  = ["Simple", "Medium", "Complex", "Very Complex", "Extreme"];

// ─── CertImportSection ────────────────────────────────────────────────────────

function CertImportSection({ formData, onChange }) {
  return (
    <div
      style={{
        background:   "rgba(197,179,88,0.06)",
        border:       "1px solid rgba(197,179,88,0.25)",
        borderRadius: 7,
        padding:      "14px 16px",
        marginBottom: 20,
      }}
    >
      <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: CHM, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
        Certificate Import
      </div>
      <div style={{ fontFamily: HEB, fontSize: 11, color: CHL, marginBottom: 12, lineHeight: 1.6 }}>
        Enter the certificate lab and report number. AI auto-extraction will be available in a future version.
        Review all grading fields below after entry.
      </div>
      <Grid2>
        <Sel label="Certificate Lab" field="certLab" formData={formData} onChange={onChange}
             options={certificateLabs} placeholder="GIA, IGI, HRD…" />
        <Inp label="Report Number" field="certNumber" formData={formData} onChange={onChange}
             placeholder="2473659812" />
      </Grid2>
      <div style={{ marginTop: 14 }}>
        <TA label="Certificate Text (paste raw text if available)" field="rawCertText"
            formData={formData} onChange={onChange}
            placeholder="Paste certificate text here for future AI extraction…" />
      </div>
    </div>
  );
}

// ─── MediaSection — Task 4 ────────────────────────────────────────────────────
/**
 * Media URL placeholders for all product types.
 *
 * IMPLEMENTATION NOTE:
 *   These fields collect HTTPS URLs only. Future implementation will:
 *   1. Accept file uploads via <input type="file"> → convert to base64
 *   2. POST to /api/airtable/upload-attachment (to be built) which
 *      calls Airtable's attachment API: { url, filename }
 *   For now, any URL entered here should be sent as an Airtable
 *   attachment object: [{ url: formData.imageUrl }] in create-stone.js.
 *   This is not yet wired — see Task 4 TODO in create-stone.js.
 */
function MediaSection({ formData, onChange }) {
  return (
    <>
      <SecTitle>מדיה — Media</SecTitle>
      <div style={{ fontFamily: HEB, fontSize: 11, color: CHL, marginBottom: 12, lineHeight: 1.6 }}>
        הזן קישורי URL לתמונות ומסמכים. העלאת קבצים ישירה תהיה זמינה בגרסה הבאה.
        <span style={{ color: "#8a7a2a", fontWeight: 600 }}> URL בלבד לעת עתה.</span>
      </div>
      <Grid2>
        <Inp
          label="תמונת מוצר — Product Image URL"
          field="imageUrl"
          formData={formData}
          onChange={onChange}
          placeholder="https://..."
        />
        <Inp
          label="תמונת תעודה — Certificate Image URL"
          field="certImageUrl"
          formData={formData}
          onChange={onChange}
          placeholder="https://..."
        />
      </Grid2>
      <div style={{ marginTop: 14 }}>
        <Inp
          label="וידאו — Video URL (optional)"
          field="videoUrl"
          formData={formData}
          onChange={onChange}
          placeholder="https://youtube.com/... or https://..."
        />
      </div>
    </>
  );
}

// ─── StoneForm ────────────────────────────────────────────────────────────────

function StoneForm({ productType, formData, onChange }) {
  const pt = productType;

  return (
    <>
      {/* Identity */}
      <SecTitle>Identity</SecTitle>
      <Grid2>
        <Inp label="Name / Title" field="name" formData={formData} onChange={onChange}
             placeholder="GIA Diamond 1.00ct G VS1" />
        <Sel label="Status" field="status" formData={formData} onChange={onChange}
             options={STATUS_OPTIONS} placeholder="Status…" />
      </Grid2>

      {/* Shape and carat */}
      {is(pt, HAS_SHAPE) && (
        <>
          <SecTitle>Weight & Shape</SecTitle>
          <Grid2>
            <Inp label="Carat Weight" field="caratWeight" formData={formData} onChange={onChange}
                 type="number" placeholder="1.00" required />
            <Inp label="Stone Count" field="stoneCount" formData={formData} onChange={onChange}
                 type="number" placeholder="1" />
          </Grid2>
          <Grid2>
            <Sel label="Shape / Cut Form" field="cutForm" formData={formData} onChange={onChange}
                 options={cutFormOptions} placeholder="Round Brilliant…" />
            <Sel label="Stone Shape" field="stoneShape" formData={formData} onChange={onChange}
                 options={stoneShapes} placeholder="Round…" />
          </Grid2>
        </>
      )}

      {/* Diamond grading */}
      {isDiamond(pt) && (
        <>
          <SecTitle>Diamond Grading</SecTitle>
          <Grid2>
            <Sel label="Colour Grade" field="color" formData={formData} onChange={onChange}
                 options={diamondColorGrades} placeholder="D, E, F…" />
            <Sel label="Clarity Grade" field="clarity" formData={formData} onChange={onChange}
                 options={diamondClarityGrades} placeholder="FL, VVS1…" />
          </Grid2>
          <Grid2>
            <Sel label="Cut Grade" field="cutGrade" formData={formData} onChange={onChange}
                 options={diamondCutGrades} placeholder="Excellent…" />
            <Sel label="Polish" field="polish" formData={formData} onChange={onChange}
                 options={polishSymmetryGrades} placeholder="Excellent…" />
          </Grid2>
          <Grid2>
            <Sel label="Symmetry" field="symmetry" formData={formData} onChange={onChange}
                 options={polishSymmetryGrades} placeholder="Excellent…" />
          </Grid2>
        </>
      )}

      {/* Fancy colour grading */}
      {isFancy(pt) && (
        <>
          <SecTitle>Fancy Colour</SecTitle>
          <Grid2>
            <Sel label="Fancy Colour Intensity" field="fancyColorIntensity" formData={formData} onChange={onChange}
                 options={fancyColorIntensities} placeholder="Fancy Vivid…" />
            <Sel label="Fancy Colour Hue" field="fancyColorHue" formData={formData} onChange={onChange}
                 options={fancyColorHues} placeholder="Yellow, Pink…" />
          </Grid2>
          <Grid2>
            <Sel label="Clarity" field="clarity" formData={formData} onChange={onChange}
                 options={diamondClarityGrades} placeholder="VS1…" />
          </Grid2>
        </>
      )}

      {/* Coloured gemstone grading */}
      {isGem(pt) && (
        <>
          <SecTitle>Gemstone Quality</SecTitle>
          <Grid2>
            <Sel label="Species" field="species" formData={formData} onChange={onChange}
                 options={gemstoneSpecies} placeholder="Corundum…" />
            <Inp label="Variety" field="variety" formData={formData} onChange={onChange}
                 placeholder="Ruby, Sapphire…" />
          </Grid2>
          <Grid2>
            <Inp label="Colour Description" field="colorDescription" formData={formData} onChange={onChange}
                 placeholder="Vivid Red…" />
            <Sel label="Transparency" field="transparency" formData={formData} onChange={onChange}
                 options={gemstoneTransparency} placeholder="Transparent…" />
          </Grid2>
          <Grid2>
            <Sel label="Clarity" field="clarity" formData={formData} onChange={onChange}
                 options={gemstoneClarityGrades} placeholder="Eye Clean…" />
            <Sel label="Treatment" field="treatment" formData={formData} onChange={onChange}
                 options={gemstoneTreatments} placeholder="None…" />
          </Grid2>
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
            <Inp label="Width (mm)"  field="widthMm"  formData={formData} onChange={onChange} type="number" placeholder="6.44" />
            <Inp label="Depth (mm)"  field="heightMm" formData={formData} onChange={onChange} type="number" placeholder="3.90" />
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

      {/* Media — Task 4 */}
      <MediaSection formData={formData} onChange={onChange} />

      {/* Internal notes */}
      <SecTitle>Notes</SecTitle>
      <TA label="Internal Notes" field="internalNotes" formData={formData} onChange={onChange}
          placeholder="Any internal notes…" />
    </>
  );
}

// ─── JewelryForm ──────────────────────────────────────────────────────────────

function JewelryForm({ formData, onChange }) {
  return (
    <>
      <SecTitle>Item Details</SecTitle>
      <Inp label="Item Name" field="name" formData={formData} onChange={onChange}
           placeholder="Diamond Solitaire Ring" required />
      <div style={{ marginTop: 14 }}>
        <Grid2>
          <Sel label="Status" field="status" formData={formData} onChange={onChange}
               options={STATUS_OPTIONS} placeholder="Status…" />
          <Inp label="Category" field="category" formData={formData} onChange={onChange}
               placeholder="Ring, Necklace, Bracelet…" />
        </Grid2>
      </div>

      <SecTitle>Metal</SecTitle>
      <Grid2>
        <Sel label="Metal Karat" field="metalType" formData={formData} onChange={onChange}
             options={METAL_KARAT_OPTIONS} placeholder="18K…" />
        <Inp label="Metal Weight (g)" field="metalWeight" formData={formData} onChange={onChange}
             type="number" placeholder="4.20" />
      </Grid2>
      <Grid2>
        <Sel label="Casting Method" field="casting" formData={formData} onChange={onChange}
             options={CAST_OPTIONS} placeholder="CAD / Casting…" />
        <Sel label="Complexity" field="complexity" formData={formData} onChange={onChange}
             options={COMPLEXITY_OPTIONS} placeholder="Medium…" />
      </Grid2>

      {/* Task 6: "סוג שיבוץ" */}
      <SecTitle>Center Stone & Setting — אבן מרכזית וסוג שיבוץ</SecTitle>
      <Grid2>
        <Inp label="Stone Description" field="stoneDescription" formData={formData} onChange={onChange}
             placeholder="1.00ct G VS1 Diamond" />
        <Inp label="Setting Type — סוג שיבוץ" field="settingType" formData={formData} onChange={onChange}
             placeholder="Prong, Bezel, Pavé…" />
      </Grid2>

      <SecTitle>Pricing & Client</SecTitle>
      <Grid2>
        <Inp label="Retail Price (USD)" field="price" formData={formData} onChange={onChange}
             type="number" placeholder="12000" />
        <Inp label="Client Name" field="clientName" formData={formData} onChange={onChange}
             placeholder="Client or customer name" />
      </Grid2>

      {/* Media — Task 4 */}
      <MediaSection formData={formData} onChange={onChange} />

      <SecTitle>Notes</SecTitle>
      <TA label="Internal Notes" field="internalNotes" formData={formData} onChange={onChange}
          placeholder="Any internal notes…" />
    </>
  );
}

// ─── ProductFormFields (main export) ─────────────────────────────────────────

export function ProductFormFields({ productType, intakeMethod, formData, onChange, onNext, onBack }) {
  const isJewelry = productType === "finished_jewelry";

  return (
    <div>
      {/* Certificate import section — shown first when method = certificate */}
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
          style={{ height: 44, padding: "0 20px", border: "1px solid rgba(54,69,79,0.2)", borderRadius: 6, background: "transparent", color: CHL, fontFamily: HEB, fontSize: 13, cursor: "pointer" }}
        >
          ← חזרה
        </button>
        <button
          onClick={onNext}
          style={{ height: 44, padding: "0 28px", border: "none", borderRadius: 6, background: CH, color: "#FAF9F6", fontFamily: HEB, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          המשך לסיכום ←
        </button>
      </div>
    </div>
  );
}
