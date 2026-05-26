/**
 * components/CertificateEditor.jsx
 *
 * Three exports:
 *   CERT_DEFAULTS   — canonical blank cert data object
 *   buildCertData   — prefill from calculator cfg + res
 *   CertificateEditor — the editor UI component
 *
 * The editor is a scrollable card-column of form sections.
 * Every field uses StableInp (blur-commit, reset-safe) or a plain
 * controlled textarea (for multi-line fields — no formula recalculation
 * risk there, so focus-loss is not a concern).
 *
 * Props:
 *   certData      {object}    Current cert data
 *   onFieldChange {function}  scf(field, value) — partial update
 *   onRefresh     {function}  Called when user clicks "Refresh from Calculator"
 */

import { C }          from "../lib/constants";
import { r2, fmtDate } from "../lib/calculations";
import { Pnl, LR, GR, StableInp } from "./UI";

// ─── CERT_DEFAULTS ───────────────────────────────────────────────────
/**
 * Canonical initial state for a blank certificate.
 * Spread this when initialising certData state:
 *   const [certData, setCertData] = useState({ ...CERT_DEFAULTS });
 */
export const CERT_DEFAULTS = {
  // Header
  reportTitle:    "Jewelry Valuation Report",
  reportNumber:   "",
  reportDate:     "",

  // Client
  clientName:     "",

  // Item
  itemDescription: "",

  // Metal
  metalType:      "",
  metalWeight:    "",
  metalPurity:    "",

  // Center stone
  centerStoneType:          "",
  centerStoneCt:            "",
  centerStoneColor:         "",
  centerStoneClarity:       "",
  centerStoneCut:           "",
  centerStoneSetting:       "",
  centerStoneCertNo:        "",
  centerStoneFluorescence:  "",
  centerStoneOrigin:        "",

  // Side stones
  sideStonesDesc:   "",

  // Workmanship
  workmanshipDesc:  "",

  // Valuation
  valuationAmount:  "",
  valuationBasis:   "Retail Replacement Value",
  valuationDate:    "",

  // Notes
  notes:            "",

  // Footer credentials
  credentialsLine1: "Leshem Simon",
  credentialsLine2: "Founder · Certified Diamond Grader & Expert Jeweler",
  credentialsLine3: "LESHEM.S Jewelry · Tuval St 23, Ramat Gan · VAT: 046240016",

  // Image (base64 data URL or null)
  pieceImg:         null,
};

// ─── buildCertData ───────────────────────────────────────────────────
/**
 * Pre-fill a cert data object from the current calculator state.
 * Every field is still independently editable after this — this just
 * provides a starting point so the user doesn't type everything twice.
 *
 * @param {object}   cfg      Quote config (DCFG shape)
 * @param {object}   res      Results from calcApp(cfg)
 * @param {function} fmtFn    Currency formatter
 * @param {string|null} pieceImg Base64 data URL or null
 * @param {string}   qNum     Quote reference number
 * @returns {object}  New certData object (safe to use as useState initial value)
 */
export function buildCertData(cfg, res, fmtFn, pieceImg, qNum) {
  // Build side-stone description from cfg
  const ss1Count = parseInt(cfg.ss1Count, 10) || 0;
  const ss2Count = parseInt(cfg.ss2Count, 10) || 0;
  let sideStonesDesc = "";

  if (ss1Count > 0) {
    const ct1 = r2((parseFloat(cfg.ss1Ct) || 0) * ss1Count);
    sideStonesDesc = `${ct1} ct tw ${cfg.ss1Type}s — ${ss1Count} stones — ${cfg.ss1Setting}`;
  }
  if (ss2Count > 0) {
    const ct2 = r2((parseFloat(cfg.ss2Ct) || 0) * ss2Count);
    const line2 = `${ct2} ct tw ${cfg.ss2Type}s — ${ss2Count} stones — ${cfg.ss2Setting}`;
    sideStonesDesc = sideStonesDesc
      ? `${sideStonesDesc}\n${line2}`
      : line2;
  }

  const isDiamond = cfg.centerType === "Diamond";
  const today     = fmtDate();

  return {
    ...CERT_DEFAULTS,

    // Header
    reportTitle:  "Jewelry Valuation Report",
    reportNumber: qNum || "",
    reportDate:   today,

    // Client
    clientName:   cfg.clientName || "",

    // Item
    itemDescription: cfg.quoteName || "",

    // Metal
    metalType:    cfg.metal  || "",
    metalWeight:  cfg.grams  ? `${cfg.grams} g` : "",
    metalPurity:  "",   // not tracked in the calculator — user fills manually

    // Center stone
    centerStoneType:         cfg.centerType    || "",
    centerStoneCt:           cfg.centerCt      ? `${cfg.centerCt} ct` : "",
    centerStoneColor:        isDiamond ? (cfg.centerColor   || "") : "",
    centerStoneClarity:      isDiamond ? (cfg.centerClarity || "") : "",
    centerStoneCut:          "",   // not tracked — user fills manually
    centerStoneSetting:      cfg.centerSetting || "",
    centerStoneCertNo:       "",   // not tracked — user fills manually
    centerStoneFluorescence: "",   // not tracked — user fills manually
    centerStoneOrigin:       "",   // not tracked — user fills manually

    // Side stones
    sideStonesDesc,

    // Workmanship
    workmanshipDesc: [cfg.cmplx, cfg.cast].filter(Boolean).join(" complexity · "),

    // Valuation
    valuationAmount: fmtFn(res.ri),
    valuationBasis:  "Retail Replacement Value",
    valuationDate:   today,

    // Notes
    notes: cfg.notes || "",

    // Footer — keep defaults
    credentialsLine1: CERT_DEFAULTS.credentialsLine1,
    credentialsLine2: CERT_DEFAULTS.credentialsLine2,
    credentialsLine3: CERT_DEFAULTS.credentialsLine3,

    // Image
    pieceImg: pieceImg || null,
  };
}

// ─── CertificateEditor ───────────────────────────────────────────────

/** Shared textarea style */
const TA_STYLE = {
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

/** Shared section gap between card items */
const GAP = 14;

export function CertificateEditor({ certData: d, onFieldChange, onRefresh }) {
  const inp = (field, placeholder, inputMode = "text") => (
    <StableInp
      value={d[field]}
      onChange={(v) => onFieldChange(field, v)}
      placeholder={placeholder}
      inputMode={inputMode}
    />
  );

  const ta = (field, placeholder, rows = 2) => (
    <textarea
      value={d[field]}
      onChange={(e) => onFieldChange(field, e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={TA_STYLE}
    />
  );

  return (
    <div>
      {/* ── Refresh button ─────────────────────────────────────── */}
      <button
        onClick={onRefresh}
        style={{
          width:          "100%",
          height:         44,
          marginBottom:   16,
          background:     "transparent",
          border:         `1px solid rgba(54,69,79,0.2)`,
          borderRadius:   6,
          cursor:         "pointer",
          fontFamily:     C.heb,
          fontSize:       13,
          color:          C.chm,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          gap:            8,
        }}
      >
        ↺ Refresh from Calculator
      </button>

      {/* ════════ 1. REPORT INFO ════════════════════════════════ */}
      <Pnl title="Report Info">
        <div style={{ display: "flex", flexDirection: "column", gap: GAP }}>
          <LR label="Report Title">
            {inp("reportTitle", "Jewelry Valuation Report")}
          </LR>
          <GR minColWidth={140}>
            <LR label="Report Number">
              {inp("reportNumber", "LS-2026-0001")}
            </LR>
            <LR label="Report Date">
              {inp("reportDate", "26 May 2026")}
            </LR>
          </GR>
        </div>
      </Pnl>

      {/* ════════ 2. CLIENT ════════════════════════════════════ */}
      <Pnl title="Client">
        <LR label="Prepared for (Client Name)">
          {inp("clientName", "Leave blank to hide")}
        </LR>
      </Pnl>

      {/* ════════ 3. ITEM ════════════════════════════════════ */}
      <Pnl title="Item Description">
        <LR label="Description">
          {ta("itemDescription", "e.g. 18K yellow gold solitaire diamond ring…", 3)}
        </LR>
      </Pnl>

      {/* ════════ 4. METAL ══════════════════════════════════ */}
      <Pnl title="Metal">
        <div style={{ display: "flex", flexDirection: "column", gap: GAP }}>
          <GR minColWidth={140}>
            <LR label="Alloy">
              {inp("metalType", "18K Yellow Gold")}
            </LR>
            <LR label="Gross Weight">
              {inp("metalWeight", "4.20 g")}
            </LR>
          </GR>
          <LR label="Purity / Fineness">
            {inp("metalPurity", "750 ‰ (18 karat) — leave blank to hide")}
          </LR>
        </div>
      </Pnl>

      {/* ════════ 5. CENTER STONE ═══════════════════════════ */}
      <Pnl title="Center Stone">
        <div style={{ display: "flex", flexDirection: "column", gap: GAP }}>
          <GR minColWidth={140}>
            <LR label="Species / Type">
              {inp("centerStoneType", "Diamond")}
            </LR>
            <LR label="Carat Weight">
              {inp("centerStoneCt", "1.02 ct")}
            </LR>
          </GR>
          <GR minColWidth={140}>
            <LR label="Color Grade">
              {inp("centerStoneColor", "G")}
            </LR>
            <LR label="Clarity Grade">
              {inp("centerStoneClarity", "VS1")}
            </LR>
          </GR>
          <GR minColWidth={140}>
            <LR label="Cut Grade">
              {inp("centerStoneCut", "Excellent — leave blank to hide")}
            </LR>
            <LR label="Setting Style">
              {inp("centerStoneSetting", "Prong / Claw")}
            </LR>
          </GR>
          <GR minColWidth={140}>
            <LR label="Fluorescence">
              {inp("centerStoneFluorescence", "None — leave blank to hide")}
            </LR>
            <LR label="Country of Origin">
              {inp("centerStoneOrigin", "Leave blank to hide")}
            </LR>
          </GR>
          <LR label="Laboratory Certificate No.">
            {inp("centerStoneCertNo", "e.g. GIA 2473659812 — leave blank to hide")}
          </LR>
        </div>
      </Pnl>

      {/* ════════ 6. SIDE STONES ════════════════════════════ */}
      <Pnl title="Side / Accent Stones">
        <LR label="Description (leave blank to hide section)">
          {ta("sideStonesDesc", "e.g. 0.45 ct tw round brilliant Diamonds, pavé set", 2)}
        </LR>
      </Pnl>

      {/* ════════ 7. WORKMANSHIP ════════════════════════════ */}
      <Pnl title="Workmanship & Setting">
        <LR label="Description (leave blank to hide section)">
          {ta("workmanshipDesc", "e.g. Hand-finished, complex pavé setting with milgrain edge detail", 2)}
        </LR>
      </Pnl>

      {/* ════════ 8. VALUATION ══════════════════════════════ */}
      <Pnl title="Valuation">
        <div style={{ display: "flex", flexDirection: "column", gap: GAP }}>
          <LR label="Valuation Amount">
            {inp("valuationAmount", "$18,500", "text")}
          </LR>
          <GR minColWidth={140}>
            <LR label="Valuation Basis">
              {inp("valuationBasis", "Retail Replacement Value")}
            </LR>
            <LR label="Valuation Date">
              {inp("valuationDate", "26 May 2026")}
            </LR>
          </GR>
        </div>
      </Pnl>

      {/* ════════ 9. NOTES ══════════════════════════════════ */}
      <Pnl title="Notes & Remarks">
        <LR label="Notes (leave blank to hide section)">
          {ta("notes", "Additional remarks, special instructions, provenance notes…", 3)}
        </LR>
      </Pnl>

      {/* ════════ 10. FOOTER CREDENTIALS ════════════════════ */}
      <Pnl title="Footer Credentials">
        <div style={{ display: "flex", flexDirection: "column", gap: GAP }}>
          <LR label="Signatory Name">
            {inp("credentialsLine1", "Leshem Simon")}
          </LR>
          <LR label="Title / Credentials">
            {inp("credentialsLine2", "Founder · Certified Diamond Grader & Expert Jeweler")}
          </LR>
          <LR label="Contact Line">
            {inp("credentialsLine3", "LESHEM.S Jewelry · Tuval St 23, Ramat Gan · VAT: 046240016")}
          </LR>
        </div>
      </Pnl>

    </div>
  );
}
