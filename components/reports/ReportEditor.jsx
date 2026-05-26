/**
 * components/reports/ReportEditor.jsx  —  v1.1
 *
 * Changes in v1.1:
 *   + Drp component  — select with "Other / custom…" fallback text input
 *   + Replace Image / Remove Image buttons in both image sections
 *   + Dropdowns for: centerStone.type, .certLab, .origin, .cut, .setting;
 *                    valuation.basis, valuation.currency
 *   + Stone report dropdowns: stone.type, .naturalOrLab, .shape,
 *                             .cut, .polish, .symmetry, .certLab
 *   + Verification fields section for both report types
 *   ~ useState added to React imports for Drp local state
 *   ~ hasValue imported from reportUtils for Drp logic
 */

import { useState, useRef, useCallback } from "react";
import { C }        from "../../lib/constants";
import { Pnl, LR, GR, StableInp } from "../UI";
import { hasValue } from "../../lib/reports/reportUtils";

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
/**
 * A styled <select> with a free-text fallback for custom values.
 *
 * UX:
 *   - If value is in options → select shows that option, no text input
 *   - If value is not in options and not empty → select shows "Other / custom…",
 *     text input visible below showing the current custom value
 *   - User selects "Other / custom…" → text input appears to type freely
 *   - User selects a standard option → text input hides
 *
 * This satisfies both requirements:
 *   ✓ Dropdowns for quick selection of common values
 *   ✓ Manual override/editing for every field
 */
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

// ─── Dropdown option lists ────────────────────────────────────────────────────
const OPT_STONE_TYPE   = ["Diamond", "Ruby", "Emerald", "Sapphire", "Pearl", "Alexandrite", "Tanzanite", "Spinel", "Aquamarine", "Opal"];
const OPT_ORIGIN       = ["Natural", "Lab-Grown", "Treated", "Unknown"];
const OPT_CERT_LAB     = ["GIA", "IGI", "AGS", "HRD", "LESHEM.S", "EGL", "None"];
const OPT_CUT_GRADE    = ["Excellent", "Very Good", "Good", "Fair", "Poor"];
const OPT_SETTING      = ["Prong / Claw", "Bezel", "Pavé", "Channel", "Flush / Burnish", "Tension", "Invisible", "Bar"];
const OPT_VALUATION_BASIS = [
  "Retail Replacement Value",
  "Insurance Value",
  "Fair Market Value",
  "Liquidation Value",
];
const OPT_CURRENCY     = ["USD", "ILS", "EUR", "GBP"];
const OPT_NATURAL_LAB  = ["Natural", "Lab-Grown"];
const OPT_SHAPE        = [
  "Round Brilliant",
  "Princess",
  "Oval",
  "Pear",
  "Cushion",
  "Marquise",
  "Heart",
  "Emerald Cut",
  "Radiant",
  "Asscher",
  "Old European",
];

// ─── Shared atom helpers ──────────────────────────────────────────────────────
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

// ─── Shared editor sections ───────────────────────────────────────────────────
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
          {inp(data.credentials?.title, (v) => setField("credentials.title", v), "Founder · Certified Diamond Grader & Expert Jeweler")}
        </LR>
        <LR label="Contact Line">
          {inp(data.credentials?.companyLine, (v) => setField("credentials.companyLine", v), "LESHEM.S Jewelry · Tuval St 23, Ramat Gan")}
        </LR>
      </div>
    </Pnl>
  );
}

/**
 * Verification fields.
 * Data model support only — no backend in v1.1.
 *
 * SECURITY NOTE (future):
 *   verificationId must be an unguessable token (UUID/CSPRNG).
 *   verificationUrl must serve only public-approved report data.
 *   Access must be revocable without regenerating the report.
 *   Do NOT expose internal cost data, supplier info, or margins.
 */
function VerificationSection({ data, setField, pathPrefix = "verification" }) {
  return (
    <Pnl title="Verification (Optional)">
      <div
        style={{
          fontFamily:   C.heb,
          fontSize:     11,
          color:        C.chl,
          marginBottom: 10,
          lineHeight:   1.5,
          fontStyle:    "italic",
        }}
      >
        These fields are reserved for future online verification.
        Leave blank for now — the Verification block only appears when filled.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
        <LR label="Verification ID">
          {inp(
            data.verification?.verificationId,
            (v) => setField(`${pathPrefix}.verificationId`, v),
            "Unguessable token — not yet implemented"
          )}
        </LR>
        <LR label="Verification URL">
          {inp(
            data.verification?.verificationUrl,
            (v) => setField(`${pathPrefix}.verificationUrl`, v),
            "https://leshem.studio/verify/…"
          )}
        </LR>
      </div>
    </Pnl>
  );
}

// ─── ImageSection — used by both report types ─────────────────────────────────
function ImageSection({ data, setField, fileInputRef, handleImageUpload, label }) {
  const hasImg = Array.isArray(data.images) && data.images.length > 0;

  const handleRemove = () => setField("images", []);

  return (
    <Pnl title={label || "Image"}>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: "none" }}
      />
      <div style={{ display: "flex", gap: 8, marginBottom: hasImg ? 10 : 0 }}>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={IMG_BTN}
        >
          📷 {hasImg ? "Replace" : "Upload Image"}
        </button>
        {hasImg && (
          <button
            onClick={handleRemove}
            style={{ ...IMG_BTN, color: "#b04040", borderColor: "rgba(176,64,64,0.3)" }}
          >
            ✕ Remove
          </button>
        )}
      </div>
      {hasImg && (
        <div
          style={{
            border:         "1px solid rgba(54,69,79,0.12)",
            borderRadius:   6,
            overflow:       "hidden",
            maxHeight:      140,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            background:     "#f8f6f2",
          }}
        >
          <img
            src={data.images[0]}
            alt="preview"
            style={{ maxWidth: "100%", maxHeight: 140, objectFit: "contain" }}
          />
        </div>
      )}
    </Pnl>
  );
}

const IMG_BTN = {
  flex:           1,
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
};

// ─── Jewelry Valuation editor sections ───────────────────────────────────────
function JewelryEditorSections({ data, setField, fileInputRef, handleImageUpload }) {
  return (
    <>
      <ReportInfoSection data={data} setField={setField} />

      {/* Client */}
      <Pnl title="Prepared For">
        <LR label="Client Name">
          {inp(data.preparedFor, (v) => setField("preparedFor", v), "Leave blank to hide")}
        </LR>
      </Pnl>

      {/* Item */}
      <Pnl title="Item">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <LR label="Item Title">
            {inp(data.itemTitle, (v) => setField("itemTitle", v), "e.g. Diamond Solitaire Ring")}
          </LR>
          <LR label="Professional Description">
            {ta(
              data.itemDescription,
              (v) => setField("itemDescription", v),
              "Narrative description — auto-filled from calculator data. Edit as needed.",
              4
            )}
          </LR>
        </div>
      </Pnl>

      {/* Image */}
      <ImageSection
        data={data}
        setField={setField}
        fileInputRef={fileInputRef}
        handleImageUpload={handleImageUpload}
        label="Jewelry Image"
      />

      {/* Metal */}
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
              {inp(data.metal?.purity, (v) => setField("metal.purity", v), "750 ‰  — leave blank to hide")}
            </LR>
            <LR label="Casting Method">
              {inp(data.metal?.casting, (v) => setField("metal.casting", v), "CAD / Casting")}
            </LR>
          </GR>
        </div>
      </Pnl>

      {/* Center Stone */}
      <Pnl title="Center Stone">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <GR minColWidth={150}>
            <LR label="Stone Type">
              <Drp
                value={data.centerStone?.type}
                onChange={(v) => setField("centerStone.type", v)}
                options={OPT_STONE_TYPE}
                placeholder="Select type…"
              />
            </LR>
            <LR label="Carat Weight">
              {inp(data.centerStone?.carat, (v) => setField("centerStone.carat", v), "1.02 ct")}
            </LR>
          </GR>
          <GR minColWidth={150}>
            <LR label="Color Grade">
              {inp(data.centerStone?.color, (v) => setField("centerStone.color", v), "G")}
            </LR>
            <LR label="Clarity Grade">
              {inp(data.centerStone?.clarity, (v) => setField("centerStone.clarity", v), "VS1")}
            </LR>
          </GR>
          <GR minColWidth={150}>
            <LR label="Cut Grade">
              <Drp
                value={data.centerStone?.cut}
                onChange={(v) => setField("centerStone.cut", v)}
                options={OPT_CUT_GRADE}
                placeholder="Select grade…"
              />
            </LR>
            <LR label="Setting Style">
              <Drp
                value={data.centerStone?.setting}
                onChange={(v) => setField("centerStone.setting", v)}
                options={OPT_SETTING}
                placeholder="Select setting…"
              />
            </LR>
          </GR>
          <GR minColWidth={150}>
            <LR label="Origin">
              <Drp
                value={data.centerStone?.origin}
                onChange={(v) => setField("centerStone.origin", v)}
                options={OPT_ORIGIN}
                placeholder="Natural / Lab-Grown…"
              />
            </LR>
            <LR label="Fluorescence">
              {inp(data.centerStone?.fluorescence, (v) => setField("centerStone.fluorescence", v), "None — leave blank to hide")}
            </LR>
          </GR>
          <GR minColWidth={150}>
            <LR label="Certificate Lab">
              <Drp
                value={data.centerStone?.certLab}
                onChange={(v) => setField("centerStone.certLab", v)}
                options={OPT_CERT_LAB}
                placeholder="Select lab…"
              />
            </LR>
            <LR label="Certificate Number">
              {inp(data.centerStone?.certNumber, (v) => setField("centerStone.certNumber", v), "Leave blank to hide")}
            </LR>
          </GR>
        </div>
      </Pnl>

      {/* Accent Stones */}
      <Pnl title="Accent / Side Stones">
        <LR label="Description (leave blank to hide)">
          {ta(
            data.accentStonesDesc,
            (v) => setField("accentStonesDesc", v),
            "e.g. 22 Rubies · 1.10 ct total weight · Pavé",
            2
          )}
        </LR>
      </Pnl>

      {/* Workmanship */}
      <Pnl title="Workmanship">
        <LR label="Description (leave blank to hide)">
          {ta(
            data.workmanshipDesc,
            (v) => setField("workmanshipDesc", v),
            "e.g. CAD production and casting, high-complexity craftsmanship",
            2
          )}
        </LR>
      </Pnl>

      {/* Valuation */}
      <Pnl title="Valuation">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <LR label="Valuation Amount">
            {inp(data.valuation?.amount, (v) => setField("valuation.amount", v), "$18,500")}
          </LR>
          <GR minColWidth={150}>
            <LR label="Currency">
              <Drp
                value={data.valuation?.currency}
                onChange={(v) => setField("valuation.currency", v)}
                options={OPT_CURRENCY}
                placeholder="USD"
              />
            </LR>
            <LR label="Valuation Date">
              {inp(data.valuation?.date, (v) => setField("valuation.date", v), "26 May 2026")}
            </LR>
          </GR>
          <LR label="Basis">
            <Drp
              value={data.valuation?.basis}
              onChange={(v) => setField("valuation.basis", v)}
              options={OPT_VALUATION_BASIS}
              placeholder="Select basis…"
            />
          </LR>
        </div>
      </Pnl>

      {/* Notes */}
      <Pnl title="Notes & Remarks">
        <LR label="Notes (leave blank to hide)">
          {ta(data.notes, (v) => setField("notes", v), "Additional remarks, special instructions…", 3)}
        </LR>
      </Pnl>

      <VerificationSection data={data} setField={setField} />
      <CredentialsSection  data={data} setField={setField} />
    </>
  );
}

// ─── In-House Stone editor sections ──────────────────────────────────────────
function StoneEditorSections({ data, setField, fileInputRef, handleImageUpload }) {
  const extReports = data.externalReports || [];

  const handleAddExtReport = () => {
    setField("externalReports", [
      ...extReports,
      { lab: "", reportNumber: "", attachmentName: "", attachmentUrl: "" },
    ]);
  };

  const handleRemoveExtReport = (idx) => {
    setField("externalReports", extReports.filter((_, i) => i !== idx));
  };

  return (
    <>
      <ReportInfoSection data={data} setField={setField} />

      {/* Image */}
      <ImageSection
        data={data}
        setField={setField}
        fileInputRef={fileInputRef}
        handleImageUpload={handleImageUpload}
        label="Stone Image"
      />

      {/* Stone Identity */}
      <Pnl title="Stone Identity">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <GR minColWidth={150}>
            <LR label="Stone Type">
              <Drp
                value={data.stone?.type}
                onChange={(v) => setField("stone.type", v)}
                options={OPT_STONE_TYPE}
                placeholder="Select type…"
              />
            </LR>
            <LR label="Natural / Lab-Grown">
              <Drp
                value={data.stone?.naturalOrLab}
                onChange={(v) => setField("stone.naturalOrLab", v)}
                options={OPT_NATURAL_LAB}
                placeholder="Select…"
              />
            </LR>
          </GR>
          <GR minColWidth={150}>
            <LR label="Species">
              {inp(data.stone?.species, (v) => setField("stone.species", v), "Diamond")}
            </LR>
            <LR label="Variety">
              {inp(data.stone?.variety, (v) => setField("stone.variety", v), "Colorless")}
            </LR>
          </GR>
        </div>
      </Pnl>

      {/* Shape & Weight */}
      <Pnl title="Shape & Weight">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <LR label="Shape / Cut Style">
            <Drp
              value={data.stone?.shape}
              onChange={(v) => setField("stone.shape", v)}
              options={OPT_SHAPE}
              placeholder="Select shape…"
            />
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

      {/* Color */}
      <Pnl title="Color">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <GR minColWidth={150}>
            <LR label="Color Grade">
              {inp(data.stone?.color, (v) => setField("stone.color", v), "G")}
            </LR>
            <LR label="Color Description">
              {inp(data.stone?.colorDescription, (v) => setField("stone.colorDescription", v), "Fancy Vivid Blue — leave blank to hide")}
            </LR>
          </GR>
        </div>
      </Pnl>

      {/* Clarity & Cut */}
      <Pnl title="Clarity & Cut">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <GR minColWidth={150}>
            <LR label="Clarity Grade">
              {inp(data.stone?.clarity, (v) => setField("stone.clarity", v), "VS1")}
            </LR>
            <LR label="Cut Grade">
              <Drp
                value={data.stone?.cut}
                onChange={(v) => setField("stone.cut", v)}
                options={OPT_CUT_GRADE}
                placeholder="Select grade…"
              />
            </LR>
          </GR>
          <GR minColWidth={150}>
            <LR label="Polish">
              <Drp
                value={data.stone?.polish}
                onChange={(v) => setField("stone.polish", v)}
                options={OPT_CUT_GRADE}
                placeholder="Select grade…"
              />
            </LR>
            <LR label="Symmetry">
              <Drp
                value={data.stone?.symmetry}
                onChange={(v) => setField("stone.symmetry", v)}
                options={OPT_CUT_GRADE}
                placeholder="Select grade…"
              />
            </LR>
          </GR>
        </div>
      </Pnl>

      {/* Additional Properties */}
      <Pnl title="Additional Properties">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <GR minColWidth={150}>
            <LR label="Fluorescence">
              {inp(data.stone?.fluorescence, (v) => setField("stone.fluorescence", v), "None")}
            </LR>
            <LR label="Treatment">
              {inp(data.stone?.treatment, (v) => setField("stone.treatment", v), "None")}
            </LR>
          </GR>
          <LR label="Country of Origin">
            {inp(data.stone?.countryOfOrigin, (v) => setField("stone.countryOfOrigin", v), "Leave blank to hide")}
          </LR>
        </div>
      </Pnl>

      {/* Laboratory */}
      <Pnl title="Laboratory Reference">
        <GR minColWidth={150}>
          <LR label="Certificate Lab">
            <Drp
              value={data.stone?.certLab}
              onChange={(v) => setField("stone.certLab", v)}
              options={OPT_CERT_LAB}
              placeholder="Select lab…"
            />
          </LR>
          <LR label="Certificate Number">
            {inp(data.stone?.certNumber, (v) => setField("stone.certNumber", v), "Leave blank to hide")}
          </LR>
        </GR>
      </Pnl>

      {/* External Reports */}
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
              border:       "1px solid rgba(54,69,79,0.1)",
              borderRadius: 6,
              padding:      "12px 14px",
              marginBottom: 10,
              background:   "#FAFAF8",
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
            width:          "100%",
            height:         40,
            border:         "1px dashed rgba(54,69,79,0.25)",
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
  const fileInputRef = useRef(null);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader  = new FileReader();
    reader.onload = (ev) => setField("images", [ev.target.result]);
    reader.readAsDataURL(file);
    // Reset input so the same file can be selected again after removal
    e.target.value = "";
  }, [setField]);

  if (reportType === "jewelry_valuation") {
    return (
      <JewelryEditorSections
        data={reportData}
        setField={setField}
        fileInputRef={fileInputRef}
        handleImageUpload={handleImageUpload}
      />
    );
  }

  if (reportType === "inhouse_stone") {
    return (
      <StoneEditorSections
        data={reportData}
        setField={setField}
        fileInputRef={fileInputRef}
        handleImageUpload={handleImageUpload}
      />
    );
  }

  return null;
}
