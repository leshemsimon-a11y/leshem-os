/**
 * components/reports/ReportEditor.jsx  —  v4.2
 *
 * Changes in v4.2:
 *   + Taxonomy dropdowns from lib/gemology/taxonomy.js
 *   + ImageSection supports multiple images: add, remove per index, thumbnails
 *   + Stone editor sections branch on productType:
 *       natural_diamond     → diamond grading fields
 *       lab_grown_diamond   → diamond grading + growth method
 *       fancy_color_diamond → fancy color fields
 *       colored_gemstone    → gemstone species/variety/treatment/transparency
 *   + ProductType switcher in stone editor
 *   ~ Drp component unchanged
 *   ~ Verification and Credentials sections unchanged
 */

import { useState, useRef, useCallback } from "react";
import { C }        from "../../lib/constants";
import { Pnl, LR, GR, StableInp } from "../UI";
import { hasValue } from "../../lib/reports/reportUtils";
import {
  diamondColorGrades,
  diamondClarityGrades,
  diamondCutGrades,
  polishSymmetryGrades,
  fluorescenceGrades,
  fancyColorHues,
  fancyColorIntensities,
  gemstoneSpecies,
  gemstoneTransparency,
  gemstoneTreatments,
  certificateLabs,
  stoneShapes,
  labGrowthMethods,
  PRODUCT_TYPE_LABELS,
} from "../../lib/gemology/taxonomy";

// ─── Shared styles ────────────────────────────────────────────────────────────
const TA = {
  width:        "100%",
  border:       "1px solid rgba(54,69,79,0.18)",
  borderRadius: 6,
  background:   "#fff",
  padding:      "10px 12px",
  fontFamily:   C.heb,
  fontSize:     14,
  color:        C.ch,
  outline:      "none",
  resize:       "vertical",
  minHeight:    72,
  boxSizing:    "border-box",
  lineHeight:   1.6,
};

const SEL = {
  width:        "100%",
  height:       48,
  border:       "1px solid rgba(54,69,79,0.18)",
  borderRadius: 6,
  background:   "#fff",
  padding:      "0 12px",
  fontFamily:   C.heb,
  fontSize:     14,
  color:        C.ch,
  outline:      "none",
  cursor:       "pointer",
  boxSizing:    "border-box",
};

const FIELD_GAP = 14;

// ─── Drp — dropdown with manual override ─────────────────────────────────────
const OTHER = "__other__";

function Drp({ value, onChange, options, placeholder }) {
  const [customMode, setCustomMode] = useState(false);
  const isCustomValue = hasValue(value) && !options.includes(value);
  const showInput     = customMode || isCustomValue;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <select
        value={showInput ? OTHER : (value || "")}
        onChange={(e) => {
          const v = e.target.value;
          if (v === OTHER) {
            setCustomMode(true);
          } else {
            setCustomMode(false);
            onChange(v);
          }
        }}
        style={SEL}
      >
        <option value="">{placeholder || "— select —"}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
        <option disabled style={{ color: "rgba(54,69,79,0.3)" }}>──────</option>
        <option value={OTHER}>Other / type custom…</option>
      </select>
      {showInput && (
        <StableInp
          value={value ?? ""}
          onChange={(v) => {
            onChange(v);
            if (!hasValue(v)) setCustomMode(false);
          }}
          placeholder="Custom value…"
        />
      )}
    </div>
  );
}

// ─── Dropdown option lists (non-taxonomy) ─────────────────────────────────────
const OPT_STONE_TYPE      = ["Diamond", "Ruby", "Emerald", "Sapphire", "Pearl", "Alexandrite", "Tanzanite", "Spinel", "Aquamarine", "Opal"];
const OPT_ORIGIN          = ["Natural", "Lab-Grown", "Treated", "Unknown"];
const OPT_SETTING         = ["Prong / Claw", "Bezel", "Pavé", "Channel", "Flush / Burnish", "Tension", "Invisible", "Bar"];
const OPT_VALUATION_BASIS = ["Retail Replacement Value", "Insurance Value", "Fair Market Value", "Liquidation Value"];
const OPT_CURRENCY        = ["USD", "ILS", "EUR", "GBP"];
const OPT_NATURAL_LAB     = ["Natural", "Lab-Grown"];

// ─── Stone product-type options ───────────────────────────────────────────────
const STONE_PRODUCT_TYPES = [
  "natural_diamond",
  "lab_grown_diamond",
  "fancy_color_diamond",
  "colored_gemstone",
];

// ─── Atom helpers ─────────────────────────────────────────────────────────────
function inp(value, onChange, placeholder) {
  return (
    <StableInp
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
}

function ta(value, onChange, placeholder, rows = 2) {
  return (
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={TA}
    />
  );
}

// ─── Shared sections ──────────────────────────────────────────────────────────
function ReportInfoSection({ data, setField }) {
  return (
    <Pnl title="Report Info">
      <GR minColWidth={140}>
        <LR label="Report Number">
          {inp(data.reportNumber, (v) => setField("reportNumber", v), "LS-JV-2026-0001")}
        </LR>
        <LR label="Report Date">
          {inp(data.reportDate, (v) => setField("reportDate", v), "26 May 2026")}
        </LR>
      </GR>
    </Pnl>
  );
}

function CredentialsSection({ data, setField }) {
  return (
    <Pnl title="Footer Credentials">
      <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
        <LR label="Signatory Name">
          {inp(data.credentials?.signatoryName, (v) => setField("credentials.signatoryName", v), "Leshem Simon")}
        </LR>
        <LR label="Title / Credentials">
          {inp(data.credentials?.title, (v) => setField("credentials.title", v), "Founder · Certified Diamond Grader")}
        </LR>
        <LR label="Contact Line">
          {inp(data.credentials?.companyLine, (v) => setField("credentials.companyLine", v), "LESHEM.S Jewelry · Tuval St 23, Ramat Gan")}
        </LR>
      </div>
    </Pnl>
  );
}

/**
 * Verification fields — data model support only.
 * Security note: future verificationId must be unguessable token.
 * verificationUrl must serve only public-approved report data, revocable access.
 */
function VerificationSection({ data, setField }) {
  return (
    <Pnl title="Verification (Optional)">
      <div
        style={{
          fontFamily: C.heb, fontSize: 11, color: C.chl,
          marginBottom: 10, lineHeight: 1.5, fontStyle: "italic",
        }}
      >
        Reserved for future online verification. Leave blank — the block only
        appears in the report when filled.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
        <LR label="Verification ID">
          {inp(data.verification?.verificationId, (v) => setField("verification.verificationId", v), "Future unguessable token")}
        </LR>
        <LR label="Verification URL">
          {inp(data.verification?.verificationUrl, (v) => setField("verification.verificationUrl", v), "https://leshem.studio/verify/…")}
        </LR>
      </div>
    </Pnl>
  );
}

// ─── MultiImageSection ────────────────────────────────────────────────────────
/**
 * Handles multiple images.
 * - Upload button adds to images array
 * - Each thumbnail has a ✕ Remove button
 * - File input resets after each upload so same file can be re-added
 *
 * @param {object}   data         reportData
 * @param {function} setField     setField from ReportEngine
 * @param {string}   label        section panel label
 */
function MultiImageSection({ data, setField, label }) {
  const fileInputRef = useRef(null);
  const [replaceIndex, setReplaceIndex] = useState(null);
  const images = Array.isArray(data.images) ? data.images : [];

  const openPicker = (idx = null) => {
    setReplaceIndex(idx);
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target.result;
      if (typeof replaceIndex === "number") {
        setField("images", images.map((img, i) => (i === replaceIndex ? src : img)));
      } else {
        setField("images", [...images, src]);
      }
      setReplaceIndex(null);
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // allow selecting the same file again
  };

  const handleRemove = (idx) => {
    setField("images", images.filter((_, i) => i !== idx));
  };

  return (
    <Pnl title={label || "Images"}>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      {images.length > 0 && (
        <div
          style={{
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(92px, 1fr))",
            gap:                 10,
            marginBottom:        12,
          }}
        >
          {images.map((src, idx) => (
            <div key={idx}>
              <div style={{ position: "relative" }}>
                <img
                  src={src}
                  alt={`image ${idx + 1}`}
                  style={{
                    width:        "100%",
                    aspectRatio:  "1 / 1",
                    objectFit:    "cover",
                    borderRadius: 5,
                    border:       "1px solid rgba(54,69,79,0.14)",
                    background:   "#f0ede8",
                    display:      "block",
                  }}
                />
                {idx === 0 && (
                  <span
                    style={{
                      position:     "absolute",
                      left:         4,
                      top:          4,
                      background:   "rgba(197,179,88,0.9)",
                      color:        "#36454F",
                      fontFamily:   C.heb,
                      fontSize:     9,
                      fontWeight:   700,
                      padding:      "2px 5px",
                      borderRadius: 3,
                    }}
                  >
                    HERO
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 4, marginTop: 5 }}>
                <button
                  onClick={() => openPicker(idx)}
                  style={IMG_ACTION_BTN}
                >
                  Replace
                </button>
                <button
                  onClick={() => handleRemove(idx)}
                  style={{ ...IMG_ACTION_BTN, color: "#9a5b5b" }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => openPicker(null)}
        style={{
          width:          "100%",
          height:         44,
          border:         "1px dashed rgba(54,69,79,0.28)",
          borderRadius:   6,
          background:     "transparent",
          cursor:         "pointer",
          fontFamily:     C.heb,
          fontSize:       13,
          color:          C.chl,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          gap:            6,
        }}
      >
        📷 {images.length === 0 ? "Upload Image" : "Add Another Image"}
      </button>

      {images.length > 0 && (
        <p
          style={{
            fontFamily: C.heb, fontSize: 11, color: C.chl,
            marginTop: 6, lineHeight: 1.4,
          }}
        >
          {images.length} image{images.length > 1 ? "s" : ""} · first image is the hero image
        </p>
      )}
    </Pnl>
  );
}

const IMG_ACTION_BTN = {
  flex:       1,
  height:     28,
  border:     "1px solid rgba(54,69,79,0.14)",
  borderRadius: 4,
  background: "#fff",
  color:      "#4a5c68",
  cursor:     "pointer",
  fontFamily: "'Assistant','Heebo',Arial,sans-serif",
  fontSize:   11,
  fontWeight: 600,
};

// ─── Jewelry Valuation editor ─────────────────────────────────────────────────
function JewelryEditorSections({ data, setField }) {
  return (
    <>
      <ReportInfoSection data={data} setField={setField} />

      <Pnl title="Prepared For">
        <LR label="Client Name">
          {inp(data.preparedFor, (v) => setField("preparedFor", v), "Leave blank to hide")}
        </LR>
      </Pnl>

      <Pnl title="Item">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <LR label="Item Title">
            {inp(data.itemTitle, (v) => setField("itemTitle", v), "e.g. Diamond Solitaire Ring")}
          </LR>
          <LR label="Professional Description">
            {ta(data.itemDescription, (v) => setField("itemDescription", v),
              "Narrative description — auto-filled from calculator. Edit as needed.", 4)}
          </LR>
        </div>
      </Pnl>

      {/* Multi-image */}
      <MultiImageSection data={data} setField={setField} label="Jewelry Images" />

      <Pnl title="Metal">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <GR minColWidth={150}>
            <LR label="Alloy">
              {inp(data.metal?.alloy, (v) => setField("metal.alloy", v), "18K Yellow Gold")}
            </LR>
            <LR label="Gross Weight">
              {inp(data.metal?.weight, (v) => setField("metal.weight", v), "4.20 g")}
            </LR>
          </GR>
          <GR minColWidth={150}>
            <LR label="Purity / Fineness">
              {inp(data.metal?.purity, (v) => setField("metal.purity", v), "750 ‰ — leave blank to hide")}
            </LR>
            <LR label="Casting Method">
              {inp(data.metal?.casting, (v) => setField("metal.casting", v), "CAD / Casting")}
            </LR>
          </GR>
        </div>
      </Pnl>

      <Pnl title="Center Stone">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <GR minColWidth={150}>
            <LR label="Stone Type">
              <Drp value={data.centerStone?.type} onChange={(v) => setField("centerStone.type", v)}
                   options={OPT_STONE_TYPE} placeholder="Select type…" />
            </LR>
            <LR label="Carat Weight">
              {inp(data.centerStone?.carat, (v) => setField("centerStone.carat", v), "1.02 ct")}
            </LR>
          </GR>
          <GR minColWidth={150}>
            <LR label="Color Grade">
              <Drp value={data.centerStone?.color} onChange={(v) => setField("centerStone.color", v)}
                   options={diamondColorGrades} placeholder="Select grade…" />
            </LR>
            <LR label="Clarity Grade">
              <Drp value={data.centerStone?.clarity} onChange={(v) => setField("centerStone.clarity", v)}
                   options={diamondClarityGrades} placeholder="Select grade…" />
            </LR>
          </GR>
          <GR minColWidth={150}>
            <LR label="Cut Grade">
              <Drp value={data.centerStone?.cut} onChange={(v) => setField("centerStone.cut", v)}
                   options={diamondCutGrades} placeholder="Select grade…" />
            </LR>
            <LR label="Setting Style">
              <Drp value={data.centerStone?.setting} onChange={(v) => setField("centerStone.setting", v)}
                   options={OPT_SETTING} placeholder="Select setting…" />
            </LR>
          </GR>
          <GR minColWidth={150}>
            <LR label="Origin">
              <Drp value={data.centerStone?.origin} onChange={(v) => setField("centerStone.origin", v)}
                   options={OPT_ORIGIN} placeholder="Natural / Lab-Grown…" />
            </LR>
            <LR label="Fluorescence">
              <Drp value={data.centerStone?.fluorescence} onChange={(v) => setField("centerStone.fluorescence", v)}
                   options={fluorescenceGrades} placeholder="Select…" />
            </LR>
          </GR>
          <GR minColWidth={150}>
            <LR label="Certificate Lab">
              <Drp value={data.centerStone?.certLab} onChange={(v) => setField("centerStone.certLab", v)}
                   options={certificateLabs} placeholder="Select lab…" />
            </LR>
            <LR label="Certificate Number">
              {inp(data.centerStone?.certNumber, (v) => setField("centerStone.certNumber", v), "Leave blank to hide")}
            </LR>
          </GR>
        </div>
      </Pnl>

      <Pnl title="Accent / Side Stones">
        <LR label="Description (leave blank to hide)">
          {ta(data.accentStonesDesc, (v) => setField("accentStonesDesc", v),
            "e.g. 22 Rubies · 1.10 ct total weight · Pavé", 2)}
        </LR>
      </Pnl>

      <Pnl title="Workmanship">
        <LR label="Description (leave blank to hide)">
          {ta(data.workmanshipDesc, (v) => setField("workmanshipDesc", v),
            "e.g. CAD production and casting, high-complexity craftsmanship", 2)}
        </LR>
      </Pnl>

      <Pnl title="Valuation">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <LR label="Valuation Amount">
            {inp(data.valuation?.amount, (v) => setField("valuation.amount", v), "$18,500")}
          </LR>
          <GR minColWidth={150}>
            <LR label="Currency">
              <Drp value={data.valuation?.currency} onChange={(v) => setField("valuation.currency", v)}
                   options={OPT_CURRENCY} placeholder="USD" />
            </LR>
            <LR label="Valuation Date">
              {inp(data.valuation?.date, (v) => setField("valuation.date", v), "26 May 2026")}
            </LR>
          </GR>
          <LR label="Basis">
            <Drp value={data.valuation?.basis} onChange={(v) => setField("valuation.basis", v)}
                 options={OPT_VALUATION_BASIS} placeholder="Select basis…" />
          </LR>
        </div>
      </Pnl>

      <Pnl title="Notes & Remarks">
        <LR label="Notes (leave blank to hide)">
          {ta(data.notes, (v) => setField("notes", v), "Additional remarks…", 3)}
        </LR>
      </Pnl>

      <VerificationSection data={data} setField={setField} />
      <CredentialsSection  data={data} setField={setField} />
    </>
  );
}

// ─── Stone editor: productType-conditional field groups ───────────────────────

/** Natural diamond + Lab-grown diamond grading fields (shared) */
function DiamondGradingFields({ data, setField, showGrowthMethod }) {
  return (
    <>
      <Pnl title="Shape & Weight">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <LR label="Shape / Cut Style">
            <Drp value={data.stone?.shape} onChange={(v) => setField("stone.shape", v)}
                 options={stoneShapes} placeholder="Select shape…" />
          </LR>
          <GR minColWidth={150}>
            <LR label="Carat Weight">
              {inp(data.stone?.carat, (v) => setField("stone.carat", v), "1.02")}
            </LR>
            <LR label="Measurements">
              {inp(data.stone?.measurements, (v) => setField("stone.measurements", v), "6.42 × 6.44 × 3.90 mm")}
            </LR>
          </GR>
        </div>
      </Pnl>

      <Pnl title="Grading">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <GR minColWidth={150}>
            <LR label="Color Grade">
              <Drp value={data.stone?.color} onChange={(v) => setField("stone.color", v)}
                   options={diamondColorGrades} placeholder="Select grade…" />
            </LR>
            <LR label="Clarity Grade">
              <Drp value={data.stone?.clarity} onChange={(v) => setField("stone.clarity", v)}
                   options={diamondClarityGrades} placeholder="Select grade…" />
            </LR>
          </GR>
          <GR minColWidth={150}>
            <LR label="Cut Grade">
              <Drp value={data.stone?.cut} onChange={(v) => setField("stone.cut", v)}
                   options={diamondCutGrades} placeholder="Select grade…" />
            </LR>
            <LR label="Fluorescence">
              <Drp value={data.stone?.fluorescence} onChange={(v) => setField("stone.fluorescence", v)}
                   options={fluorescenceGrades} placeholder="Select…" />
            </LR>
          </GR>
          <GR minColWidth={150}>
            <LR label="Polish">
              <Drp value={data.stone?.polish} onChange={(v) => setField("stone.polish", v)}
                   options={polishSymmetryGrades} placeholder="Select grade…" />
            </LR>
            <LR label="Symmetry">
              <Drp value={data.stone?.symmetry} onChange={(v) => setField("stone.symmetry", v)}
                   options={polishSymmetryGrades} placeholder="Select grade…" />
            </LR>
          </GR>
          {showGrowthMethod && (
            <LR label="Growth Method">
              <Drp value={data.stone?.growthMethod} onChange={(v) => setField("stone.growthMethod", v)}
                   options={labGrowthMethods} placeholder="CVD / HPHT…" />
            </LR>
          )}
        </div>
      </Pnl>

      <Pnl title="Laboratory Reference">
        <GR minColWidth={150}>
          <LR label="Certificate Lab">
            <Drp value={data.stone?.certLab} onChange={(v) => setField("stone.certLab", v)}
                 options={certificateLabs} placeholder="Select lab…" />
          </LR>
          <LR label="Certificate Number">
            {inp(data.stone?.certNumber, (v) => setField("stone.certNumber", v), "Leave blank to hide")}
          </LR>
        </GR>
      </Pnl>
    </>
  );
}

/** Fancy color diamond fields */
function FancyColorFields({ data, setField }) {
  return (
    <>
      <Pnl title="Shape & Weight">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <LR label="Shape / Cut Style">
            <Drp value={data.stone?.shape} onChange={(v) => setField("stone.shape", v)}
                 options={stoneShapes} placeholder="Select shape…" />
          </LR>
          <GR minColWidth={150}>
            <LR label="Carat Weight">
              {inp(data.stone?.carat, (v) => setField("stone.carat", v), "1.02")}
            </LR>
            <LR label="Measurements">
              {inp(data.stone?.measurements, (v) => setField("stone.measurements", v), "6.42 × 6.44 × 3.90 mm")}
            </LR>
          </GR>
        </div>
      </Pnl>

      <Pnl title="Fancy Color Grading">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <GR minColWidth={150}>
            <LR label="Color Hue">
              <Drp value={data.stone?.fancyColorHue} onChange={(v) => setField("stone.fancyColorHue", v)}
                   options={fancyColorHues} placeholder="Select hue…" />
            </LR>
            <LR label="Color Intensity">
              <Drp value={data.stone?.fancyColorIntensity} onChange={(v) => setField("stone.fancyColorIntensity", v)}
                   options={fancyColorIntensities} placeholder="Select intensity…" />
            </LR>
          </GR>
          <GR minColWidth={150}>
            <LR label="Color Origin">
              {inp(data.stone?.fancyColorOrigin, (v) => setField("stone.fancyColorOrigin", v), "Natural — leave blank to hide")}
            </LR>
            <LR label="Clarity Grade">
              <Drp value={data.stone?.clarity} onChange={(v) => setField("stone.clarity", v)}
                   options={diamondClarityGrades} placeholder="Select grade…" />
            </LR>
          </GR>
          <GR minColWidth={150}>
            <LR label="Polish">
              <Drp value={data.stone?.polish} onChange={(v) => setField("stone.polish", v)}
                   options={polishSymmetryGrades} placeholder="Select grade…" />
            </LR>
            <LR label="Symmetry">
              <Drp value={data.stone?.symmetry} onChange={(v) => setField("stone.symmetry", v)}
                   options={polishSymmetryGrades} placeholder="Select grade…" />
            </LR>
          </GR>
          <LR label="Fluorescence">
            <Drp value={data.stone?.fluorescence} onChange={(v) => setField("stone.fluorescence", v)}
                 options={fluorescenceGrades} placeholder="Select…" />
          </LR>
        </div>
      </Pnl>

      <Pnl title="Laboratory Reference">
        <GR minColWidth={150}>
          <LR label="Certificate Lab">
            <Drp value={data.stone?.certLab} onChange={(v) => setField("stone.certLab", v)}
                 options={certificateLabs} placeholder="Select lab…" />
          </LR>
          <LR label="Certificate Number">
            {inp(data.stone?.certNumber, (v) => setField("stone.certNumber", v), "Leave blank to hide")}
          </LR>
        </GR>
      </Pnl>
    </>
  );
}

/** Colored gemstone fields */
function ColoredGemstoneFields({ data, setField }) {
  return (
    <>
      <Pnl title="Identification">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <GR minColWidth={150}>
            <LR label="Species">
              <Drp value={data.stone?.species} onChange={(v) => setField("stone.species", v)}
                   options={gemstoneSpecies} placeholder="Select species…" />
            </LR>
            <LR label="Variety">
              {inp(data.stone?.variety, (v) => setField("stone.variety", v), "e.g. Pigeon Blood")}
            </LR>
          </GR>
        </div>
      </Pnl>

      <Pnl title="Shape & Weight">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <LR label="Shape / Cut Style">
            <Drp value={data.stone?.shape} onChange={(v) => setField("stone.shape", v)}
                 options={stoneShapes} placeholder="Select shape…" />
          </LR>
          <GR minColWidth={150}>
            <LR label="Carat Weight">
              {inp(data.stone?.carat, (v) => setField("stone.carat", v), "2.15")}
            </LR>
            <LR label="Measurements">
              {inp(data.stone?.measurements, (v) => setField("stone.measurements", v), "8.10 × 6.20 × 4.80 mm")}
            </LR>
          </GR>
        </div>
      </Pnl>

      <Pnl title="Color & Appearance">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <LR label="Color Description">
            {inp(data.stone?.colorDescription, (v) => setField("stone.colorDescription", v), "Vivid red with purplish hue")}
          </LR>
          <LR label="Transparency">
            <Drp value={data.stone?.transparency} onChange={(v) => setField("stone.transparency", v)}
                 options={gemstoneTransparency} placeholder="Select…" />
          </LR>
        </div>
      </Pnl>

      <Pnl title="Treatment & Origin">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <LR label="Treatment">
            <Drp value={data.stone?.treatment} onChange={(v) => setField("stone.treatment", v)}
                 options={gemstoneTreatments} placeholder="Select treatment…" />
          </LR>
          <LR label="Country of Origin">
            {inp(data.stone?.countryOfOrigin, (v) => setField("stone.countryOfOrigin", v), "Mozambique — leave blank to hide")}
          </LR>
        </div>
      </Pnl>
    </>
  );
}

// ─── Stone Editor (productType-aware) ─────────────────────────────────────────
function StoneEditorSections({ data, setField }) {
  const pt          = data.productType || "natural_diamond";
  const extReports  = data.externalReports || [];

  const handleAddExtReport = () =>
    setField("externalReports", [...extReports, { lab: "", reportNumber: "", attachmentName: "", attachmentUrl: "" }]);

  const handleRemoveExtReport = (idx) =>
    setField("externalReports", extReports.filter((_, i) => i !== idx));

  return (
    <>
      <ReportInfoSection data={data} setField={setField} />

      {/* Product type switcher */}
      <Pnl title="Stone Category">
        <LR label="Stone Type">
          <select
            value={pt}
            onChange={(e) => setField("productType", e.target.value)}
            style={SEL}
          >
            {STONE_PRODUCT_TYPES.map((t) => (
              <option key={t} value={t}>{PRODUCT_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </LR>
        {(pt === "natural_diamond" || pt === "lab_grown_diamond") && (
          <LR label="Natural / Lab-Grown" style={{ marginTop: 10 }}>
            <Drp value={data.stone?.naturalOrLab} onChange={(v) => setField("stone.naturalOrLab", v)}
                 options={["Natural", "Lab-Grown"]} placeholder="Select…" />
          </LR>
        )}
      </Pnl>

      {/* Multi-image */}
      <MultiImageSection data={data} setField={setField} label="Stone Images" />

      {/* Conditional field groups by productType */}
      {pt === "natural_diamond" && (
        <DiamondGradingFields data={data} setField={setField} showGrowthMethod={false} />
      )}
      {pt === "lab_grown_diamond" && (
        <DiamondGradingFields data={data} setField={setField} showGrowthMethod={true} />
      )}
      {pt === "fancy_color_diamond" && (
        <FancyColorFields data={data} setField={setField} />
      )}
      {pt === "colored_gemstone" && (
        <ColoredGemstoneFields data={data} setField={setField} />
      )}

      {/* External Lab Reports */}
      <Pnl title="External Lab Reports">
        {extReports.length === 0 && (
          <p style={{ fontFamily: C.heb, fontSize: 12, color: C.chl, marginBottom: 12 }}>
            No external reports added yet.
          </p>
        )}
        {extReports.map((rpt, idx) => (
          <div
            key={idx}
            style={{
              border: "1px solid rgba(54,69,79,0.1)", borderRadius: 6,
              padding: "12px 14px", marginBottom: 10, background: "#FAFAF8",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontFamily: C.heb, fontSize: 12, fontWeight: 600, color: C.chm }}>
                Report {idx + 1}
              </span>
              <button
                onClick={() => handleRemoveExtReport(idx)}
                style={{ background: "none", border: "none", cursor: "pointer", color: C.chl, fontSize: 12 }}
              >
                ✕ Remove
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <GR minColWidth={130}>
                <LR label="Lab Name">
                  {inp(rpt.lab, (v) => setField(`externalReports.${idx}.lab`, v), "GIA")}
                </LR>
                <LR label="Report Number">
                  {inp(rpt.reportNumber, (v) => setField(`externalReports.${idx}.reportNumber`, v), "2473659812")}
                </LR>
              </GR>
              <LR label="Attachment Name">
                {inp(rpt.attachmentName, (v) => setField(`externalReports.${idx}.attachmentName`, v), "GIA_Certificate.pdf")}
              </LR>
            </div>
          </div>
        ))}
        <button
          onClick={handleAddExtReport}
          style={{
            width: "100%", height: 40, border: "1px dashed rgba(54,69,79,0.25)",
            borderRadius: 6, background: "transparent", cursor: "pointer",
            fontFamily: C.heb, fontSize: 13, color: C.chl,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          + Add External Report
        </button>
      </Pnl>

      {/* Comments */}
      <Pnl title="Comments">
        <LR label="Comments (leave blank to hide)">
          {ta(data.comments, (v) => setField("comments", v), "Additional observations, inclusions, remarks…", 3)}
        </LR>
      </Pnl>

      <VerificationSection data={data} setField={setField} />
      <CredentialsSection  data={data} setField={setField} />
    </>
  );
}

// ─── ReportEditor (main export) ───────────────────────────────────────────────
export function ReportEditor({ reportType, reportData, setField }) {
  if (reportType === "jewelry_valuation") {
    return <JewelryEditorSections data={reportData} setField={setField} />;
  }
  if (reportType === "inhouse_stone") {
    return <StoneEditorSections data={reportData} setField={setField} />;
  }
  return null;
}
