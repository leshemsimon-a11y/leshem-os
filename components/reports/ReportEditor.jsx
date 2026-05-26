/**
 * components/reports/ReportEditor.jsx
 *
 * Form editor for report data. Renders different sections based on
 * reportType. All fields use StableInp (blur-commit, reset-safe) or
 * plain controlled textareas (no formula recalculation risk there).
 *
 * Sections rendered per type:
 *   jewelry_valuation:
 *     Report Info · Client · Item · Image · Metal · Center Stone ·
 *     Accent Stones · Workmanship · Valuation · Notes · Credentials
 *
 *   inhouse_stone:
 *     Report Info · Image · Stone Identity · Shape & Weight ·
 *     Color · Clarity & Cut · Additional Properties · Laboratory ·
 *     External Reports · Comments · Credentials
 *
 * Props:
 *   reportType  {string}    "jewelry_valuation" | "inhouse_stone"
 *   reportData  {object}    Current report data
 *   setField    {function}  setField(dotPath, value)
 */

import { useRef, useCallback } from "react";
import { C }        from "../../lib/constants";
import { Pnl, LR, GR, StableInp } from "../UI";

// ─── Shared textarea style ────────────────────────────────────────────
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

const FIELD_GAP = 14;

// ─── EditorSection helpers ────────────────────────────────────────────
// These are plain functions, not React components, because they exist at
// module scope (no closures over reportData — they receive it as argument).

function inp(value, onChange, placeholder, inputMode = "text") {
  return (
    <StableInp
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      inputMode={inputMode}
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

// ─── Shared sections used by both report types ────────────────────────

function ReportInfoSection({ data, setField }) {
  return (
    <Pnl title="Report Info">
      <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
        <GR minColWidth={140}>
          <LR label="Report Number">
            {inp(data.reportNumber, (v) => setField("reportNumber", v), "LS-JV-2026-0001")}
          </LR>
          <LR label="Report Date">
            {inp(data.reportDate, (v) => setField("reportDate", v), "26 May 2026")}
          </LR>
        </GR>
      </div>
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

// ─── Jewelry Valuation editor sections ───────────────────────────────

function JewelryEditorSections({ data, setField, fileInputRef, handleImageUpload }) {
  const hasImg = data.images && data.images.length > 0;

  return (
    <>
      <ReportInfoSection data={data} setField={setField} />

      {/* Client */}
      <Pnl title="Client">
        <LR label="Prepared For">
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
              "Narrative description of the piece — provenance, design, craftsmanship…",
              3
            )}
          </LR>
        </div>
      </Pnl>

      {/* Image */}
      <Pnl title="Jewelry Image">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            width:          "100%",
            height:         48,
            border:         "1px dashed rgba(54,69,79,0.3)",
            borderRadius:   6,
            background:     "transparent",
            cursor:         "pointer",
            fontFamily:     C.heb,
            fontSize:       14,
            color:          C.chl,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            gap:            8,
          }}
        >
          📷 {hasImg ? "Replace Image" : "Upload Jewelry Image"}
        </button>
        {hasImg && (
          <div
            style={{
              marginTop:    10,
              border:       "1px solid rgba(54,69,79,0.12)",
              borderRadius: 6,
              overflow:     "hidden",
              maxHeight:    140,
              display:      "flex",
              alignItems:   "center",
              justifyContent: "center",
              background:   "#f8f6f2",
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
              {inp(data.metal?.purity, (v) => setField("metal.purity", v), "750 ‰ — leave blank to hide")}
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
          <GR minColWidth={140}>
            <LR label="Type">
              {inp(data.centerStone?.type, (v) => setField("centerStone.type", v), "Diamond")}
            </LR>
            <LR label="Carat Weight">
              {inp(data.centerStone?.carat, (v) => setField("centerStone.carat", v), "1.02 ct")}
            </LR>
          </GR>
          <GR minColWidth={140}>
            <LR label="Color Grade">
              {inp(data.centerStone?.color, (v) => setField("centerStone.color", v), "G")}
            </LR>
            <LR label="Clarity Grade">
              {inp(data.centerStone?.clarity, (v) => setField("centerStone.clarity", v), "VS1")}
            </LR>
          </GR>
          <GR minColWidth={140}>
            <LR label="Cut Grade">
              {inp(data.centerStone?.cut, (v) => setField("centerStone.cut", v), "Excellent — leave blank to hide")}
            </LR>
            <LR label="Setting Style">
              {inp(data.centerStone?.setting, (v) => setField("centerStone.setting", v), "Prong / Claw")}
            </LR>
          </GR>
          <GR minColWidth={140}>
            <LR label="Fluorescence">
              {inp(data.centerStone?.fluorescence, (v) => setField("centerStone.fluorescence", v), "None — leave blank to hide")}
            </LR>
            <LR label="Origin">
              {inp(data.centerStone?.origin, (v) => setField("centerStone.origin", v), "Natural — leave blank to hide")}
            </LR>
          </GR>
          <GR minColWidth={140}>
            <LR label="Cert. Lab">
              {inp(data.centerStone?.certLab, (v) => setField("centerStone.certLab", v), "GIA — leave blank to hide")}
            </LR>
            <LR label="Cert. Number">
              {inp(data.centerStone?.certNumber, (v) => setField("centerStone.certNumber", v), "2473659812")}
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
            "e.g. 0.45 ct tw round brilliant Diamonds, pavé set",
            2
          )}
        </LR>
      </Pnl>

      {/* Workmanship */}
      <Pnl title="Workmanship & Setting">
        <LR label="Description (leave blank to hide)">
          {ta(
            data.workmanshipDesc,
            (v) => setField("workmanshipDesc", v),
            "e.g. Hand-finished, complex pavé with milgrain detail",
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
          <GR minColWidth={140}>
            <LR label="Basis">
              {inp(data.valuation?.basis, (v) => setField("valuation.basis", v), "Retail Replacement Value")}
            </LR>
            <LR label="Valuation Date">
              {inp(data.valuation?.date, (v) => setField("valuation.date", v), "26 May 2026")}
            </LR>
          </GR>
        </div>
      </Pnl>

      {/* Notes */}
      <Pnl title="Notes & Remarks">
        <LR label="Notes (leave blank to hide)">
          {ta(data.notes, (v) => setField("notes", v), "Additional remarks, special instructions…", 3)}
        </LR>
      </Pnl>

      <CredentialsSection data={data} setField={setField} />
    </>
  );
}

// ─── In-House Stone editor sections ──────────────────────────────────

function StoneEditorSections({ data, setField, fileInputRef, handleImageUpload }) {
  const hasImg          = data.images && data.images.length > 0;
  const extReports      = data.externalReports || [];

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
      <Pnl title="Stone Image">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            width:          "100%",
            height:         48,
            border:         "1px dashed rgba(54,69,79,0.3)",
            borderRadius:   6,
            background:     "transparent",
            cursor:         "pointer",
            fontFamily:     C.heb,
            fontSize:       14,
            color:          C.chl,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            gap:            8,
          }}
        >
          📷 {hasImg ? "Replace Image" : "Upload Stone Image"}
        </button>
        {hasImg && (
          <div
            style={{
              marginTop: 10, border: "1px solid rgba(54,69,79,0.12)",
              borderRadius: 6, overflow: "hidden", maxHeight: 140,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "#f8f6f2",
            }}
          >
            <img
              src={data.images[0]}
              alt="stone preview"
              style={{ maxWidth: "100%", maxHeight: 140, objectFit: "contain" }}
            />
          </div>
        )}
      </Pnl>

      {/* Stone Identity */}
      <Pnl title="Stone Identity">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <GR minColWidth={140}>
            <LR label="Type">
              {inp(data.stone?.type, (v) => setField("stone.type", v), "Diamond")}
            </LR>
            <LR label="Natural / Lab-Grown">
              {inp(data.stone?.naturalOrLab, (v) => setField("stone.naturalOrLab", v), "Natural")}
            </LR>
          </GR>
          <GR minColWidth={140}>
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
          <GR minColWidth={140}>
            <LR label="Shape / Cut">
              {inp(data.stone?.shape, (v) => setField("stone.shape", v), "Round Brilliant")}
            </LR>
            <LR label="Carat Weight">
              {inp(data.stone?.carat, (v) => setField("stone.carat", v), "1.02")}
            </LR>
          </GR>
          <LR label="Measurements">
            {inp(data.stone?.measurements, (v) => setField("stone.measurements", v), "6.42 × 6.44 × 3.90 mm")}
          </LR>
        </div>
      </Pnl>

      {/* Color */}
      <Pnl title="Color">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <GR minColWidth={140}>
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
          <GR minColWidth={140}>
            <LR label="Clarity Grade">
              {inp(data.stone?.clarity, (v) => setField("stone.clarity", v), "VS1")}
            </LR>
            <LR label="Cut Grade">
              {inp(data.stone?.cut, (v) => setField("stone.cut", v), "Excellent")}
            </LR>
          </GR>
          <GR minColWidth={140}>
            <LR label="Polish">
              {inp(data.stone?.polish, (v) => setField("stone.polish", v), "Excellent")}
            </LR>
            <LR label="Symmetry">
              {inp(data.stone?.symmetry, (v) => setField("stone.symmetry", v), "Excellent")}
            </LR>
          </GR>
        </div>
      </Pnl>

      {/* Additional Properties */}
      <Pnl title="Additional Properties">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <GR minColWidth={140}>
            <LR label="Fluorescence">
              {inp(data.stone?.fluorescence, (v) => setField("stone.fluorescence", v), "None")}
            </LR>
            <LR label="Treatment">
              {inp(data.stone?.treatment, (v) => setField("stone.treatment", v), "None")}
            </LR>
          </GR>
          <LR label="Country of Origin">
            {inp(data.stone?.countryOfOrigin, (v) => setField("stone.countryOfOrigin", v), "Botswana — leave blank to hide")}
          </LR>
        </div>
      </Pnl>

      {/* Laboratory */}
      <Pnl title="Laboratory Reference">
        <div style={{ display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
          <GR minColWidth={140}>
            <LR label="Certificate Lab">
              {inp(data.stone?.certLab, (v) => setField("stone.certLab", v), "GIA — leave blank to hide")}
            </LR>
            <LR label="Certificate Number">
              {inp(data.stone?.certNumber, (v) => setField("stone.certNumber", v), "2473659812")}
            </LR>
          </GR>
        </div>
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

      <CredentialsSection data={data} setField={setField} />
    </>
  );
}

// ─── ReportEditor (main export) ───────────────────────────────────────
export function ReportEditor({ reportType, reportData, setField }) {
  const fileInputRef = useRef(null);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setField("images", [ev.target.result]);
    reader.readAsDataURL(file);
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
