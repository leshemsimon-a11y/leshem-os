/**
 * components/reports/ReportEditor.jsx  —  v4.4.1 hotfix
 *
 * Changes in v4.4:
 *   + MultiImageSection: per-image crop controls
 *       Each image thumbnail shows: Scale (slider 0.5–3×), X position (nudge),
 *       Y position (nudge), Reset button.
 *       Crop stored in reportData.imageCrops[idx] = { scale, offsetX, offsetY }
 *       Non-destructive: original image URL unchanged.
 *       Crop arrays kept in sync with image arrays on add/remove.
 *   + Signature size toggle: Small / Medium / Large
 *       Written to credentials.signatureSize
 *   + Hotfix v4.4.1: crop controls always visible + per-image replace
 *   + Hotfix v4.4.1: real signature upload/replace/remove in editor
 *   ~ All other sections identical to v4.3.2.
 */

import { useState, useRef, useCallback } from "react";
import { C }        from "../../lib/constants";
import { Pnl, LR, GR, StableInp } from "../UI";
import { hasValue } from "../../lib/reports/reportUtils";
import { defaultCrop } from "../../lib/reports/reportDefaults";
import {
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
  stoneShapes,
  labGrowthMethods,
  cutFormOptions,
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

// ─── Option lists (non-taxonomy) ─────────────────────────────────────────────
const OPT_STONE_TYPE      = ["Diamond", "Ruby", "Emerald", "Sapphire", "Pearl", "Alexandrite", "Tanzanite", "Spinel", "Aquamarine", "Opal"];
const OPT_ORIGIN          = ["Natural", "Lab-Grown", "Treated", "Unknown"];
const OPT_SETTING         = ["Prong / Claw", "Bezel", "Pavé", "Channel", "Flush / Burnish", "Tension", "Invisible", "Bar"];
const OPT_VALUATION_BASIS = ["Retail Replacement Value", "Insurance Value", "Fair Market Value", "Liquidation Value"];
const OPT_CURRENCY        = ["USD", "ILS", "EUR", "GBP"];
const OPT_NATURAL_LAB     = ["Natural", "Lab-Grown"];

const STONE_PRODUCT_TYPES = [
  "natural_diamond", "lab_grown_diamond",
  "fancy_color_diamond", "colored_gemstone",
];

// ─── Atom helpers ─────────────────────────────────────────────────────────────
function inp(value, onChange, placeholder) {
  return <StableInp value={value ?? ""} onChange={onChange} placeholder={placeholder} />;
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

// ─── ImageCropControls ────────────────────────────────────────────────────────
/**
 * Per-image crop controls.
 * Crop stored in imageCrops[idx] = { scale, offsetX, offsetY }
 * Non-destructive: original image URL unchanged.
 * Print: objectPosition + transform applied in template to the <img>.
 */
function ImageCropControls({ idx, crop, onCropChange }) {
  const c = crop || defaultCrop();

  const update = (field, val) => onCropChange(idx, { ...c, [field]: val });
  const reset  = () => onCropChange(idx, defaultCrop());

  return (
    <div
      style={{
        background:   "rgba(54,69,79,0.04)",
        borderRadius: 5,
        padding:      "8px 10px",
        marginTop:    6,
      }}
    >
      {/* Scale */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
          <span style={{ fontFamily: C.heb, fontSize: 10, color: C.chl }}>Scale</span>
          <span style={{ fontFamily: C.dat, fontSize: 10, color: C.ch }}>{c.scale.toFixed(1)}×</span>
        </div>
        <input
          type="range"
          min={0.5} max={3.0} step={0.1}
          value={c.scale}
          onChange={(e) => update("scale", parseFloat(e.target.value))}
          style={{ width: "100%", accentColor: C.gd }}
        />
      </div>

      {/* X and Y position */}
      <div style={{ display: "flex", gap: 12, marginBottom: 6 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontFamily: C.heb, fontSize: 10, color: C.chl }}>Pos X</span>
            <span style={{ fontFamily: C.dat, fontSize: 10, color: C.ch }}>{Math.round(c.offsetX)}%</span>
          </div>
          <input
            type="range"
            min={0} max={100} step={1}
            value={c.offsetX}
            onChange={(e) => update("offsetX", parseInt(e.target.value, 10))}
            style={{ width: "100%", accentColor: C.gd }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontFamily: C.heb, fontSize: 10, color: C.chl }}>Pos Y</span>
            <span style={{ fontFamily: C.dat, fontSize: 10, color: C.ch }}>{Math.round(c.offsetY)}%</span>
          </div>
          <input
            type="range"
            min={0} max={100} step={1}
            value={c.offsetY}
            onChange={(e) => update("offsetY", parseInt(e.target.value, 10))}
            style={{ width: "100%", accentColor: C.gd }}
          />
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={reset}
        style={{
          height:       26, padding: "0 10px",
          border:       "1px solid rgba(54,69,79,0.18)",
          borderRadius: 4, background: "transparent",
          cursor:       "pointer", fontFamily: C.heb,
          fontSize:     10, color: C.chl,
        }}
      >
        ↺ Reset framing
      </button>
    </div>
  );
}

// ─── MultiImageSection ────────────────────────────────────────────────────────
/**
 * Multiple images with per-image crop controls.
 * imageCrops[] is kept parallel to images[]:
 *   - On add:    new defaultCrop() appended
 *   - On remove: crop at same index removed
 */
function MultiImageSection({ data, setField, label }) {
  const fileInputRef     = useRef(null);
  const replaceInputRef = useRef(null);
  const replaceIdxRef   = useRef(null);
  const images          = Array.isArray(data.images)     ? data.images     : [];
  const imageCrops      = Array.isArray(data.imageCrops) ? data.imageCrops : images.map(() => defaultCrop());

  const handleAdd = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setField("images",     [...images, ev.target.result]);
      setField("imageCrops", [...imageCrops, defaultCrop()]);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleReplace = (e) => {
    const file = e.target.files?.[0];
    const idx  = replaceIdxRef.current;
    if (!file || idx === null || idx === undefined) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const next = [...images];
      next[idx] = ev.target.result;
      setField("images", next);
      const crops = [...imageCrops];
      while (crops.length <= idx) crops.push(defaultCrop());
      crops[idx] = defaultCrop();
      setField("imageCrops", crops);
      replaceIdxRef.current = null;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const openReplace = (idx) => {
    replaceIdxRef.current = idx;
    replaceInputRef.current?.click();
  };

  const handleRemove = (idx) => {
    setField("images",     images.filter((_, i) => i !== idx));
    setField("imageCrops", imageCrops.filter((_, i) => i !== idx));
  };

  const handleCropChange = (idx, newCrop) => {
    const updated = [...imageCrops];
    while (updated.length <= idx) updated.push(defaultCrop());
    updated[idx] = newCrop;
    setField("imageCrops", updated);
  };

  return (
    <Pnl title={label || "Images"}>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleAdd}
        style={{ display: "none" }}
      />
      <input
        type="file"
        ref={replaceInputRef}
        accept="image/*"
        onChange={handleReplace}
        style={{ display: "none" }}
      />

      {/* Thumbnails */}
      {images.length > 0 && (
        <div
          style={{
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
            gap:                 8,
            marginBottom:        10,
          }}
        >
          {images.map((src, idx) => (
            <div key={idx}>
              <div style={{ position: "relative" }}>
                {/* Thumbnail with current crop preview */}
                <div
                  style={{
                    width:        "100%",
                    aspectRatio:  "1 / 1",
                    overflow:     "hidden",
                    borderRadius: 5,
                    border:       "1px solid rgba(54,69,79,0.14)",
                    background:   "#f0ede8",
                    cursor:       "default",
                  }}
                  title="Image preview"
                >
                  <img
                    src={src}
                    alt={`image ${idx + 1}`}
                    style={{
                      width:          "100%",
                      height:         "100%",
                      objectFit:      "cover",
                      objectPosition: `${imageCrops[idx]?.offsetX ?? 50}% ${imageCrops[idx]?.offsetY ?? 50}%`,
                      transform:      `scale(${imageCrops[idx]?.scale ?? 1})`,
                      transformOrigin:`${imageCrops[idx]?.offsetX ?? 50}% ${imageCrops[idx]?.offsetY ?? 50}%`,
                      display:        "block",
                    }}
                  />
                </div>

                {/* Remove button */}
                <button
                  onClick={() => handleRemove(idx)}
                  title="Remove"
                  style={{
                    position:       "absolute", top: 3, right: 3,
                    width:          20, height: 20, borderRadius: "50%",
                    background:     "rgba(54,69,79,0.7)", border: "none",
                    color:          "#faf9f6", fontSize: 10, fontWeight: 700,
                    cursor:         "pointer", display: "flex",
                    alignItems:     "center", justifyContent: "center",
                    lineHeight:     1, padding: 0,
                  }}
                >✕</button>

                {/* Main-image label */}
                <div
                  style={{
                    position:   "absolute", bottom: 3, left: 3,
                    background: "rgba(54,69,79,0.55)",
                    borderRadius: 3, padding: "1px 5px",
                    fontFamily: C.dat, fontSize: 8, color: "#fff",
                  }}
                >
                  {idx === 0 ? "main" : `view ${idx + 1}`}
                </div>
              </div>

              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <button
                  onClick={() => openReplace(idx)}
                  style={{
                    flex: 1, height: 28, border: "1px solid rgba(54,69,79,0.18)",
                    borderRadius: 4, background: "#fff", cursor: "pointer",
                    fontFamily: C.heb, fontSize: 11, color: C.chl,
                  }}
                >
                  Replace
                </button>
                <button
                  onClick={() => handleRemove(idx)}
                  style={{
                    flex: 1, height: 28, border: "1px solid rgba(54,69,79,0.18)",
                    borderRadius: 4, background: "transparent", cursor: "pointer",
                    fontFamily: C.heb, fontSize: 11, color: C.chl,
                  }}
                >
                  Remove
                </button>
              </div>

              <div style={{ marginTop: 8 }}>
                <div style={{ fontFamily: C.heb, fontSize: 11, color: C.ch, fontWeight: 700, marginBottom: 4 }}>
                  Image Crop / Framing
                </div>
                <ImageCropControls
                  idx={idx}
                  crop={imageCrops[idx]}
                  onCropChange={handleCropChange}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        style={{
          width:          "100%", height: 44,
          border:         "1px dashed rgba(54,69,79,0.28)", borderRadius: 6,
          background:     "transparent", cursor: "pointer",
          fontFamily:     C.heb, fontSize: 13, color: C.chl,
          display:        "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}
      >
        📷 {images.length === 0 ? "Upload Image" : "Add Another Image"}
      </button>

      {images.length > 0 && (
        <p style={{ fontFamily: C.heb, fontSize: 11, color: C.chl, marginTop: 6, lineHeight: 1.4 }}>
          {images.length} image{images.length > 1 ? "s" : ""} · first is main · use Image Crop / Framing to adjust each image
        </p>
      )}
    </Pnl>
  );
}

// ─── MeasurementInputs ────────────────────────────────────────────────────────
function MeasurementInputs({ data, setField }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontFamily: C.heb, fontSize: 11, color: C.chl, lineHeight: 1.4, fontStyle: "italic" }}>
        mm — displays as Length × Width × Depth mm
      </div>
      <div
        style={{
          direction:  "ltr",
          display:    "flex",
          gap:        8,
          flexWrap:   "nowrap",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: "1 1 0", minWidth: 0 }}>
          <LR label="Length">{inp(data.stone?.measLength, (v) => setField("stone.measLength", v), "6.42")}</LR>
        </div>
        <div style={{ flex: "1 1 0", minWidth: 0 }}>
          <LR label="Width">{inp(data.stone?.measWidth, (v) => setField("stone.measWidth", v), "6.44")}</LR>
        </div>
        <div style={{ flex: "1 1 0", minWidth: 0 }}>
          <LR label="Depth">{inp(data.stone?.measDepth, (v) => setField("stone.measDepth", v), "3.90")}</LR>
        </div>
      </div>
    </div>
  );
}

// ─── FluorescenceInputs ───────────────────────────────────────────────────────
function FluorescenceInputs({ data, setField }) {
  return (
    <GR minColWidth={150}>
      <LR label="Fluorescence Intensity">
        <Drp value={data.stone?.fluorescenceIntensity}
             onChange={(v) => setField("stone.fluorescenceIntensity", v)}
             options={fluorescenceIntensities} placeholder="Select intensity…" />
      </LR>
      <LR label="Fluorescence Colour">
        <Drp value={data.stone?.fluorescenceColor}
             onChange={(v) => setField("stone.fluorescenceColor", v)}
             options={fluorescenceColors} placeholder="Blue (if not None)…" />
      </LR>
    </GR>
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
  const sigSize = data.credentials?.signatureSize || "medium";
  const signatureInputRef = useRef(null);

  const handleSignatureUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setField("credentials.signatureImageUrl", ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const clearSignature = () => setField("credentials.signatureImageUrl", "");

  return (
    <>
      <Pnl title="Report Credentials">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <LR label="Signatory Name">
            {inp(data.credentials?.signatoryName, (v) => setField("credentials.signatoryName", v), "Leshem Simon")}
          </LR>
          <LR label="Title">
            {inp(data.credentials?.title, (v) => setField("credentials.title", v), "Founder · Certified Diamond Grader & Expert Jeweler")}
          </LR>
          <LR label="Contact Line">
            {inp(data.credentials?.companyLine, (v) => setField("credentials.companyLine", v), "LESHEM.S Jewelry · Tuval St 23, Ramat Gan")}
          </LR>
        </div>
      </Pnl>

      <Pnl title="Signature">
        <div style={{ fontFamily: C.heb, fontSize: 11, color: C.chl, marginBottom: 12, lineHeight: 1.5, fontStyle: "italic" }}>
          Choose one method: upload a default signature image, draw a manual signature in the preview toolbar, or leave blank for a printed signature line.
        </div>
        <input
          type="file"
          ref={signatureInputRef}
          accept="image/*"
          onChange={handleSignatureUpload}
          style={{ display: "none" }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <LR label="Examiner Name (blank = Signatory)">
            {inp(data.credentials?.examinerName, (v) => setField("credentials.examinerName", v), "Leave blank to use Signatory Name")}
          </LR>
          <LR label="Examiner Title (blank = Title above)">
            {inp(data.credentials?.examinerTitle, (v) => setField("credentials.examinerTitle", v), "Leave blank to use above Title")}
          </LR>

          <LR label="Signature Image">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={() => signatureInputRef.current?.click()}
                style={{
                  height: 40, padding: "0 14px", border: "1px solid rgba(54,69,79,0.22)",
                  borderRadius: 6, background: "#fff", cursor: "pointer",
                  fontFamily: C.heb, fontSize: 12, color: C.ch,
                }}
              >
                {hasValue(data.credentials?.signatureImageUrl) ? "Replace Uploaded Signature" : "Upload Signature"}
              </button>
              {hasValue(data.credentials?.signatureImageUrl) && (
                <button
                  onClick={clearSignature}
                  style={{
                    height: 40, padding: "0 14px", border: "1px solid rgba(54,69,79,0.18)",
                    borderRadius: 6, background: "transparent", cursor: "pointer",
                    fontFamily: C.heb, fontSize: 12, color: C.chl,
                  }}
                >
                  Remove Signature
                </button>
              )}
            </div>
            {hasValue(data.credentials?.signatureImageUrl) && (
              <div style={{ marginTop: 10, border: "1px solid rgba(54,69,79,0.12)", borderRadius: 6, padding: 8, background: "#faf9f6", maxWidth: 260 }}>
                <img
                  src={data.credentials.signatureImageUrl}
                  alt="signature preview"
                  style={{ maxWidth: "100%", maxHeight: 70, objectFit: "contain", display: "block" }}
                />
              </div>
            )}
          </LR>

          {/* Signature size toggle */}
          <LR label="Signature Size">
            <div style={{ display: "flex", gap: 6 }}>
              {["small", "medium", "large"].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setField("credentials.signatureSize", sz)}
                  style={{
                    height:       36, padding: "0 14px",
                    border:       `1px solid ${sz === sigSize ? C.gd : "rgba(54,69,79,0.2)"}`,
                    borderRadius: 5,
                    background:   sz === sigSize ? "rgba(197,179,88,0.1)" : "transparent",
                    color:        sz === sigSize ? "#8a7a2a" : C.chl,
                    fontFamily:   C.heb, fontSize: 12,
                    fontWeight:   sz === sigSize ? 700 : 400,
                    cursor:       "pointer",
                    textTransform:"capitalize",
                  }}
                >
                  {sz.charAt(0).toUpperCase() + sz.slice(1)}
                </button>
              ))}
            </div>
          </LR>
        </div>
      </Pnl>
    </>
  );
}

function VerificationSection({ data, setField }) {
  return (
    <Pnl title="Verification (Optional)">
      <div style={{ fontFamily: C.heb, fontSize: 11, color: C.chl, marginBottom: 10, lineHeight: 1.5, fontStyle: "italic" }}>
        Reserved for future online verification. Leave blank — block only appears when filled.
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

// ─── Diamond grading fields ────────────────────────────────────────────────────
function DiamondGradingFields({ data, setField, showGrowthMethod }) {
  return (
    <>
      <Pnl title="Shape & Cut">
        <GR minColWidth={150}>
          <LR label="Cut Form">
            <Drp value={data.stone?.cutForm} onChange={(v) => setField("stone.cutForm", v)}
                 options={cutFormOptions} placeholder="Faceted / Cabochon…" />
          </LR>
          <LR label="Shape">
            <Drp value={data.stone?.shape} onChange={(v) => setField("stone.shape", v)}
                 options={stoneShapes} placeholder="Select shape…" />
          </LR>
        </GR>
      </Pnl>

      <Pnl title="Weight & Measurements">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <LR label="Carat Weight">
            {inp(data.stone?.carat, (v) => setField("stone.carat", v), "1.02")}
          </LR>
          <LR label="Measurements"><MeasurementInputs data={data} setField={setField} /></LR>
        </div>
      </Pnl>

      <Pnl title="Grading">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <GR minColWidth={150}>
            <LR label="Colour Grade">
              <Drp value={data.stone?.color} onChange={(v) => setField("stone.color", v)}
                   options={diamondColorGrades} placeholder="D–Z…" />
            </LR>
            <LR label="Clarity Grade">
              <Drp value={data.stone?.clarity} onChange={(v) => setField("stone.clarity", v)}
                   options={diamondClarityGrades} placeholder="FL–I3…" />
            </LR>
          </GR>
          <GR minColWidth={150}>
            <LR label="Cut Grade">
              <Drp value={data.stone?.cut} onChange={(v) => setField("stone.cut", v)}
                   options={diamondCutGrades} placeholder="Select grade…" />
            </LR>
            <LR label="Polish">
              <Drp value={data.stone?.polish} onChange={(v) => setField("stone.polish", v)}
                   options={polishSymmetryGrades} placeholder="Select grade…" />
            </LR>
          </GR>
          <GR minColWidth={150}>
            <LR label="Symmetry">
              <Drp value={data.stone?.symmetry} onChange={(v) => setField("stone.symmetry", v)}
                   options={polishSymmetryGrades} placeholder="Select grade…" />
            </LR>
            <div />
          </GR>
          <FluorescenceInputs data={data} setField={setField} />
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

// ─── Fancy color fields ───────────────────────────────────────────────────────
function FancyColorFields({ data, setField }) {
  return (
    <>
      <Pnl title="Shape & Cut">
        <GR minColWidth={150}>
          <LR label="Cut Form">
            <Drp value={data.stone?.cutForm} onChange={(v) => setField("stone.cutForm", v)}
                 options={cutFormOptions} placeholder="Faceted / Cabochon…" />
          </LR>
          <LR label="Shape">
            <Drp value={data.stone?.shape} onChange={(v) => setField("stone.shape", v)}
                 options={stoneShapes} placeholder="Select shape…" />
          </LR>
        </GR>
      </Pnl>
      <Pnl title="Weight & Measurements">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <LR label="Carat Weight">
            {inp(data.stone?.carat, (v) => setField("stone.carat", v), "1.02")}
          </LR>
          <LR label="Measurements"><MeasurementInputs data={data} setField={setField} /></LR>
        </div>
      </Pnl>
      <Pnl title="Fancy Colour Grading">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <GR minColWidth={150}>
            <LR label="Colour Hue">
              <Drp value={data.stone?.fancyColorHue} onChange={(v) => setField("stone.fancyColorHue", v)}
                   options={fancyColorHues} placeholder="Select hue…" />
            </LR>
            <LR label="Colour Intensity">
              <Drp value={data.stone?.fancyColorIntensity} onChange={(v) => setField("stone.fancyColorIntensity", v)}
                   options={fancyColorIntensities} placeholder="Select intensity…" />
            </LR>
          </GR>
          <GR minColWidth={150}>
            <LR label="Colour Origin">
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
          <FluorescenceInputs data={data} setField={setField} />
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

// ─── Colored gemstone fields ───────────────────────────────────────────────────
function ColoredGemstoneFields({ data, setField }) {
  return (
    <>
      <Pnl title="Identification">
        <GR minColWidth={150}>
          <LR label="Species">
            <Drp value={data.stone?.species} onChange={(v) => setField("stone.species", v)}
                 options={gemstoneSpecies} placeholder="Select species…" />
          </LR>
          <LR label="Variety">
            {inp(data.stone?.variety, (v) => setField("stone.variety", v), "e.g. Pigeon Blood")}
          </LR>
        </GR>
      </Pnl>
      <Pnl title="Shape & Cut">
        <GR minColWidth={150}>
          <LR label="Cut Form">
            <Drp value={data.stone?.cutForm} onChange={(v) => setField("stone.cutForm", v)}
                 options={cutFormOptions} placeholder="Faceted / Cabochon…" />
          </LR>
          <LR label="Shape">
            <Drp value={data.stone?.shape} onChange={(v) => setField("stone.shape", v)}
                 options={stoneShapes} placeholder="Select shape…" />
          </LR>
        </GR>
      </Pnl>
      <Pnl title="Weight & Measurements">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <LR label="Carat Weight">
            {inp(data.stone?.carat, (v) => setField("stone.carat", v), "2.15")}
          </LR>
          <LR label="Measurements"><MeasurementInputs data={data} setField={setField} /></LR>
        </div>
      </Pnl>
      <Pnl title="Colour & Appearance">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <LR label="Colour Description">
            {inp(data.stone?.colorDescription, (v) => setField("stone.colorDescription", v), "Vivid red with purplish hue")}
          </LR>
          <GR minColWidth={150}>
            <LR label="Transparency">
              <Drp value={data.stone?.transparency} onChange={(v) => setField("stone.transparency", v)}
                   options={gemstoneTransparency} placeholder="Select…" />
            </LR>
            <LR label="Clarity">
              <Drp value={data.stone?.clarity} onChange={(v) => setField("stone.clarity", v)}
                   options={gemstoneClarityGrades} placeholder="Eye Clean…" />
            </LR>
          </GR>
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
      <Pnl title="Fluorescence (Optional)">
        <FluorescenceInputs data={data} setField={setField} />
      </Pnl>
    </>
  );
}

// ─── Jewelry Valuation editor sections ────────────────────────────────────────
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
            <LR label="Colour Grade">
              <Drp value={data.centerStone?.color} onChange={(v) => setField("centerStone.color", v)}
                   options={diamondColorGrades} placeholder="D–Z…" />
            </LR>
            <LR label="Clarity Grade">
              <Drp value={data.centerStone?.clarity} onChange={(v) => setField("centerStone.clarity", v)}
                   options={diamondClarityGrades} placeholder="FL–I3…" />
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
              {inp(data.centerStone?.fluorescence, (v) => setField("centerStone.fluorescence", v), "e.g. Medium Blue")}
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

// ─── Stone editor (productType-aware) ─────────────────────────────────────────
function StoneEditorSections({ data, setField }) {
  const pt         = data.productType || "natural_diamond";
  const extReports = data.externalReports || [];
  const showPanel  = data.displaySettings?.showReferencePanel !== false;

  const handleAddExt = () =>
    setField("externalReports", [...extReports, { lab: "", reportNumber: "", attachmentName: "", attachmentUrl: "" }]);

  const handleRemoveExt = (idx) =>
    setField("externalReports", extReports.filter((_, i) => i !== idx));

  return (
    <>
      <ReportInfoSection data={data} setField={setField} />

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
          <div style={{ marginTop: 12 }}>
            <LR label="Natural / Lab-Grown">
              <Drp value={data.stone?.naturalOrLab} onChange={(v) => setField("stone.naturalOrLab", v)}
                   options={OPT_NATURAL_LAB} placeholder="Select…" />
            </LR>
          </div>
        )}
      </Pnl>

      <MultiImageSection data={data} setField={setField} label="Stone Images" />

      {pt === "natural_diamond"     && <DiamondGradingFields data={data} setField={setField} showGrowthMethod={false} />}
      {pt === "lab_grown_diamond"   && <DiamondGradingFields data={data} setField={setField} showGrowthMethod={true}  />}
      {pt === "fancy_color_diamond" && <FancyColorFields     data={data} setField={setField} />}
      {pt === "colored_gemstone"    && <ColoredGemstoneFields data={data} setField={setField} />}

      <Pnl title="External Lab Reports">
        {extReports.length === 0 && (
          <p style={{ fontFamily: C.heb, fontSize: 12, color: C.chl, marginBottom: 12 }}>No external reports added.</p>
        )}
        {extReports.map((rpt, idx) => (
          <div key={idx} style={{ border: "1px solid rgba(54,69,79,0.1)", borderRadius: 6, padding: "12px 14px", marginBottom: 10, background: "#FAFAF8" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontFamily: C.heb, fontSize: 12, fontWeight: 600, color: C.chm }}>Report {idx + 1}</span>
              <button onClick={() => handleRemoveExt(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: C.chl, fontSize: 12 }}>✕ Remove</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <GR minColWidth={130}>
                <LR label="Lab Name">{inp(rpt.lab, (v) => setField(`externalReports.${idx}.lab`, v), "GIA")}</LR>
                <LR label="Report Number">{inp(rpt.reportNumber, (v) => setField(`externalReports.${idx}.reportNumber`, v), "2473659812")}</LR>
              </GR>
              <LR label="Attachment Name">{inp(rpt.attachmentName, (v) => setField(`externalReports.${idx}.attachmentName`, v), "GIA_Certificate.pdf")}</LR>
            </div>
          </div>
        ))}
        <button onClick={handleAddExt} style={{ width: "100%", height: 40, border: "1px dashed rgba(54,69,79,0.25)", borderRadius: 6, background: "transparent", cursor: "pointer", fontFamily: C.heb, fontSize: 13, color: C.chl, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          + Add External Report
        </button>
      </Pnl>

      <Pnl title="Comments">
        <LR label="Comments (leave blank to hide)">
          {ta(data.comments, (v) => setField("comments", v), "Additional observations…", 3)}
        </LR>
      </Pnl>

      <Pnl title="Display Options">
        <LR label="Reference Panel">
          <button
            onClick={() => setField("displaySettings.showReferencePanel", !showPanel)}
            style={{
              height: 44, padding: "0 18px",
              border: `1px solid ${showPanel ? "rgba(138,171,142,0.6)" : "rgba(54,69,79,0.2)"}`,
              borderRadius: 6, background: showPanel ? "rgba(138,171,142,0.1)" : "transparent",
              color: showPanel ? "#5d8a62" : C.chl, fontFamily: C.heb, fontSize: 13, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            {showPanel ? "✓ Visible" : "Hidden"}
          </button>
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
