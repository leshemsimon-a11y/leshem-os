/**
 * components/reports/templates/InHouseStoneReport.jsx  —  v1.1
 *
 * LESHEM.S — In-House Stone Report
 * Professional gemological report for individual stones.
 *
 * Changes from v1:
 *   + dir="ltr" explicit on root (page shell is dir="rtl")
 *   + Verification block (only when verificationId or verificationUrl exists)
 *   ~ Section header stripe improved (tighter padding, sharper label)
 *   ~ GradeRow noBorder applied consistently on last row of each section
 *   ~ Typography tightened for consistency with JewelryValuationReport
 *
 * Empty-field contract:
 *   GradeRow returns null for empty values.
 *   Section blocks guard via hasXxx booleans.
 *
 * Print:
 *   className="printable-container" — lib/printCss.js anchor.
 */

import { hasValue } from "../../../lib/reports/reportUtils";

// ─── Design tokens ─────────────────────────────────────────────────────────
const SERIF = "'Merriweather','Times New Roman',Georgia,serif";
const SANS  = "'DM Sans',Helvetica,Arial,sans-serif";
const MONO  = "'Courier New',Courier,monospace";
const CH    = "#36454F";
const CHM   = "#4a5c68";
const CHL   = "#7a8e98";
const CHX   = "#a8bcc4";
const IV    = "#FAF9F6";
const IV2   = "#F0EDE8";
const GD    = "#C5B358";
const SG    = "#8aab8e";
const SGD   = "#5d8a62";

// ─── GradeRow ─────────────────────────────────────────────────────────────────
/**
 * One row in a gemological data table.
 * Returns null when value is empty.
 */
function GradeRow({ label, value, highlight, noBorder }) {
  if (!hasValue(value)) return null;
  return (
    <tr>
      <td
        style={{
          padding:       "5px 12px 5px 0",
          fontFamily:    SANS,
          fontSize:      8.5,
          color:         CHL,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          whiteSpace:    "nowrap",
          verticalAlign: "top",
          width:         "42%",
          borderBottom:  noBorder ? "none" : "0.5px solid rgba(54,69,79,0.07)",
        }}
      >
        {label}
      </td>
      <td
        style={{
          padding:       "5px 0 5px 12px",
          fontFamily:    SANS,
          fontSize:      highlight ? 13 : 11.5,
          fontWeight:    highlight ? 700  : 400,
          color:         highlight ? CH   : CHM,
          verticalAlign: "top",
          lineHeight:    1.5,
          borderBottom:  noBorder ? "none" : "0.5px solid rgba(54,69,79,0.07)",
        }}
      >
        {value}
      </td>
    </tr>
  );
}

// ─── SectionBlock ─────────────────────────────────────────────────────────────
/**
 * Titled section with a sage accent bar.
 * Parent is responsible for guarding via hasXxx before rendering.
 */
function SectionBlock({ title, children, marginBottom = "5mm" }) {
  return (
    <div style={{ marginBottom }}>
      <div
        style={{
          display:      "flex",
          alignItems:   "center",
          gap:          8,
          marginBottom: "2.5mm",
        }}
      >
        <div
          style={{
            width:        2,
            height:       12,
            background:   SG,
            borderRadius: 1,
            flexShrink:   0,
          }}
        />
        <span
          style={{
            fontFamily:    SANS,
            fontSize:      7.5,
            fontWeight:    700,
            color:         CHL,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          {title}
        </span>
        <div
          style={{
            flex:       1,
            height:     "0.5px",
            background: "rgba(54,69,79,0.1)",
          }}
        />
      </div>
      {children}
    </div>
  );
}

// ─── InHouseStoneReport ──────────────────────────────────────────────────────
export function InHouseStoneReport({ data }) {
  if (!data) return null;
  const d  = data;
  const st = d.stone || {};

  // ── Presence guards ──────────────────────────────────────────────────────
  const hasImg       = Array.isArray(d.images) && d.images.length > 0;

  const hasIdentity  =
    hasValue(st.type)         ||
    hasValue(st.naturalOrLab) ||
    hasValue(st.species)      ||
    hasValue(st.variety);

  const hasMeasurements =
    hasValue(st.shape)        ||
    hasValue(st.carat)        ||
    hasValue(st.measurements);

  const hasGrading   =
    hasValue(st.color)            ||
    hasValue(st.colorDescription) ||
    hasValue(st.clarity)          ||
    hasValue(st.cut)              ||
    hasValue(st.polish)           ||
    hasValue(st.symmetry);

  const hasAdditional =
    hasValue(st.fluorescence)    ||
    hasValue(st.treatment)       ||
    hasValue(st.countryOfOrigin);

  const hasLab =
    hasValue(st.certLab)  ||
    hasValue(st.certNumber);

  const hasExtReports =
    Array.isArray(d.externalReports) &&
    d.externalReports.length > 0     &&
    d.externalReports.some((r) => hasValue(r.lab) || hasValue(r.reportNumber));

  const hasComments =
    hasValue(d.comments);

  const hasVerification =
    hasValue(d.verification?.verificationId) ||
    hasValue(d.verification?.verificationUrl);

  return (
    <div
      className="printable-container"
      dir="ltr"
      style={{
        width:      "210mm",
        maxWidth:   "100%",
        minHeight:  "297mm",
        background:  IV,
        fontFamily:  SANS,
        color:       CH,
        position:   "relative",
        overflow:   "hidden",
        boxSizing:  "border-box",
        margin:     "0 auto",
      }}
    >

      {/* ── Watermark ─────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position:      "absolute",
          top:           "50%",
          left:          "50%",
          transform:     "translate(-50%,-50%) rotate(-20deg)",
          fontFamily:    SERIF,
          fontSize:      220,
          fontWeight:    700,
          color:         "rgba(54,69,79,0.02)",
          userSelect:    "none",
          pointerEvents: "none",
          lineHeight:    1,
          zIndex:        0,
          whiteSpace:    "nowrap",
        }}
      >
        LS
      </div>

      {/* ── Sage security strip ───────────────────────────────── */}
      <div
        style={{
          height:     4,
          background: `linear-gradient(90deg, ${SGD} 0%, ${SG} 60%, #b0c8b2 100%)`,
        }}
      />

      {/* ══════════════ CONTENT LAYER ════════════════════════════ */}
      <div style={{ position: "relative", zIndex: 1, padding: "10mm 14mm 12mm" }}>

        {/* ─── HEADER ────────────────────────────────────────── */}
        <div
          style={{
            display:        "flex",
            justifyContent: "space-between",
            alignItems:     "flex-start",
            marginBottom:   "4mm",
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                fontFamily:    SERIF,
                fontSize:      22,
                fontWeight:    700,
                color:         CH,
                letterSpacing: "0.22em",
                lineHeight:    1,
              }}
            >
              LESHEM.S
            </div>
            <div
              style={{
                fontFamily:    SANS,
                fontSize:      7.5,
                color:         SG,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginTop:     4,
              }}
            >
              Fine Jewelry · Est. 2018
            </div>
          </div>

          {/* Report meta */}
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily:    SANS,
                fontSize:      8.5,
                fontWeight:    700,
                color:         CH,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                lineHeight:    1,
              }}
            >
              In-House Stone Report
            </div>
            {hasValue(d.reportNumber) && (
              <div
                style={{
                  fontFamily:    SANS,
                  fontSize:      8.5,
                  color:         CHL,
                  marginTop:     5,
                  letterSpacing: "0.04em",
                }}
              >
                Report No.{" "}
                <span style={{ color: CH, fontWeight: 600 }}>
                  {d.reportNumber}
                </span>
              </div>
            )}
            {hasValue(d.reportDate) && (
              <div style={{ fontFamily: SANS, fontSize: 8, color: CHL, marginTop: 2 }}>
                {d.reportDate}
              </div>
            )}
          </div>
        </div>

        {/* Sage rule */}
        <div
          style={{
            height:       "1px",
            background:   SG,
            marginBottom: "5mm",
          }}
        />

        {/* ─── STONE IMAGE ───────────────────────────────────── */}
        {hasImg && (
          <div
            style={{
              display:        "flex",
              justifyContent: "center",
              marginBottom:   "5mm",
            }}
          >
            <div
              style={{
                width:          "55mm",
                height:         "55mm",
                border:         "0.5px solid rgba(54,69,79,0.16)",
                background:     IV2,
                overflow:       "hidden",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
              }}
            >
              <img
                src={d.images[0]}
                alt="stone"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          </div>
        )}

        {/* ─── MAIN GRID: identification (left) + grading (right) */}
        {(hasIdentity || hasMeasurements || hasGrading) && (
          <div
            style={{
              display:             "grid",
              gridTemplateColumns: "1fr 1fr",
              gap:                 "4mm",
              marginBottom:        "5mm",
            }}
          >
            {/* Left column: identification + measurements */}
            <div>
              {hasIdentity && (
                <SectionBlock title="Identification" marginBottom="4mm">
                  <div style={{ background: IV2, padding: "3mm 3.5mm" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <tbody>
                        {hasValue(st.type)         && <GradeRow label="Type"         value={st.type}         highlight />}
                        {hasValue(st.naturalOrLab) && <GradeRow label="Natural / Lab" value={st.naturalOrLab} />}
                        {hasValue(st.species)      && <GradeRow label="Species"       value={st.species}      />}
                        {hasValue(st.variety)      && <GradeRow label="Variety"       value={st.variety}      noBorder />}
                      </tbody>
                    </table>
                  </div>
                </SectionBlock>
              )}

              {hasMeasurements && (
                <SectionBlock title="Weight & Measurements" marginBottom="0">
                  <div style={{ background: IV2, padding: "3mm 3.5mm" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <tbody>
                        {hasValue(st.shape)        && <GradeRow label="Shape / Cut"   value={st.shape}        />}
                        {hasValue(st.carat)        && <GradeRow label="Carat Weight"  value={`${st.carat} ct`} highlight />}
                        {hasValue(st.measurements) && <GradeRow label="Measurements"  value={st.measurements} noBorder />}
                      </tbody>
                    </table>
                  </div>
                </SectionBlock>
              )}
            </div>

            {/* Right column: grading results */}
            {hasGrading && (
              <div>
                <SectionBlock title="Grading Results" marginBottom="0">
                  <div
                    style={{
                      background: IV2,
                      padding:    "0 3.5mm 3mm",
                      border:     "0.5px solid rgba(138,171,142,0.28)",
                    }}
                  >
                    {/* Grading stripe header */}
                    <div
                      style={{
                        background:    "rgba(138,171,142,0.14)",
                        margin:        "0 -3.5mm",
                        padding:       "2mm 3.5mm",
                        marginBottom:  "3mm",
                        borderBottom:  "0.5px solid rgba(138,171,142,0.28)",
                        fontFamily:    SANS,
                        fontSize:      6.5,
                        color:         SGD,
                        fontWeight:    700,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                      }}
                    >
                      LESHEM.S Gemological Assessment
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <tbody>
                        {hasValue(st.color)            && <GradeRow label="Color Grade"       value={st.color}            highlight />}
                        {hasValue(st.colorDescription) && <GradeRow label="Color Description"  value={st.colorDescription} />}
                        {hasValue(st.clarity)          && <GradeRow label="Clarity Grade"      value={st.clarity}          highlight />}
                        {hasValue(st.cut)              && <GradeRow label="Cut Grade"          value={st.cut}              />}
                        {hasValue(st.polish)           && <GradeRow label="Polish"             value={st.polish}           />}
                        {hasValue(st.symmetry)         && <GradeRow label="Symmetry"           value={st.symmetry}         noBorder />}
                      </tbody>
                    </table>
                  </div>
                </SectionBlock>
              </div>
            )}
          </div>
        )}

        {/* Divider before additional content */}
        {(hasAdditional || hasLab || hasExtReports || hasComments || hasVerification) && (
          <div
            style={{
              height:       "0.5px",
              background:   "rgba(54,69,79,0.08)",
              marginBottom: "4mm",
            }}
          />
        )}

        {/* ─── ADDITIONAL PROPERTIES ─────────────────────────── */}
        {hasAdditional && (
          <SectionBlock title="Additional Properties">
            <div style={{ background: "#f4f1eb", padding: "3mm 3.5mm" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {hasValue(st.fluorescence)    && <GradeRow label="Fluorescence"      value={st.fluorescence}    />}
                  {hasValue(st.treatment)       && <GradeRow label="Treatment"          value={st.treatment}       />}
                  {hasValue(st.countryOfOrigin) && <GradeRow label="Country of Origin"  value={st.countryOfOrigin} noBorder />}
                </tbody>
              </table>
            </div>
          </SectionBlock>
        )}

        {/* ─── LABORATORY REFERENCE ──────────────────────────── */}
        {hasLab && (
          <SectionBlock title="Laboratory Reference">
            <div style={{ background: IV2, padding: "3mm 3.5mm" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {hasValue(st.certLab)    && <GradeRow label="Issuing Laboratory" value={st.certLab}    />}
                  {hasValue(st.certNumber) && <GradeRow label="Report Number"       value={st.certNumber} highlight noBorder />}
                </tbody>
              </table>
            </div>
          </SectionBlock>
        )}

        {/* ─── EXTERNAL REPORTS ──────────────────────────────── */}
        {hasExtReports && (
          <SectionBlock title="External Lab Reports">
            {d.externalReports
              .filter((r) => hasValue(r.lab) || hasValue(r.reportNumber))
              .map((rpt, idx) => (
                <div
                  key={idx}
                  style={{
                    display:     "flex",
                    gap:         "4mm",
                    padding:     "2.5mm 3.5mm",
                    background:  idx % 2 === 0 ? IV2 : "#f4f1eb",
                    alignItems:  "center",
                    flexWrap:    "wrap",
                  }}
                >
                  {hasValue(rpt.lab) && (
                    <span
                      style={{
                        fontFamily:    SANS,
                        fontSize:      10,
                        fontWeight:    700,
                        color:         CH,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {rpt.lab}
                    </span>
                  )}
                  {hasValue(rpt.reportNumber) && (
                    <span style={{ fontFamily: SANS, fontSize: 10, color: CHM }}>
                      No. {rpt.reportNumber}
                    </span>
                  )}
                  {hasValue(rpt.attachmentName) && (
                    <span style={{ fontFamily: SANS, fontSize: 9, color: CHL, fontStyle: "italic" }}>
                      {rpt.attachmentName}
                    </span>
                  )}
                </div>
              ))}
          </SectionBlock>
        )}

        {/* ─── COMMENTS ──────────────────────────────────────── */}
        {hasComments && (
          <SectionBlock title="Comments">
            <p
              style={{
                fontFamily:  SANS,
                fontSize:    10.5,
                color:       CHM,
                lineHeight:  1.82,
                margin:      0,
                padding:     "3mm 4mm",
                background:  IV2,
                borderLeft:  `2px solid ${SG}`,
                fontStyle:   "italic",
              }}
            >
              {d.comments}
            </p>
          </SectionBlock>
        )}

        {/* ─── VERIFICATION ──────────────────────────────────── */}
        {/*
          Only rendered when verificationId or verificationUrl is present.
          SECURITY NOTE (future): verificationId must be an unguessable token.
          Do NOT expose cost data, margins, or supplier info at the URL.
        */}
        {hasVerification && (
          <SectionBlock title="Verification">
            <div
              style={{
                display:     "flex",
                alignItems:  "center",
                gap:         "3.5mm",
                padding:     "3mm 4mm",
                background:  IV2,
                border:      "0.5px solid rgba(54,69,79,0.12)",
              }}
            >
              {hasValue(d.verification?.qrImageUrl) && (
                <img
                  src={d.verification.qrImageUrl}
                  alt="Verification QR"
                  style={{ width: "13mm", height: "13mm", objectFit: "contain", flexShrink: 0 }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily:    SANS,
                    fontSize:      7,
                    fontWeight:    700,
                    color:         CHL,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    marginBottom:  3,
                  }}
                >
                  Authenticated Report
                </div>
                {hasValue(d.verification?.verificationId) && (
                  <div
                    style={{
                      fontFamily:    MONO,
                      fontSize:      9.5,
                      color:         CH,
                      letterSpacing: "0.08em",
                    }}
                  >
                    ID: {d.verification.verificationId}
                  </div>
                )}
                {hasValue(d.verification?.verificationUrl) && (
                  <div
                    style={{
                      fontFamily: SANS,
                      fontSize:   8,
                      color:      CHL,
                      fontStyle:  "italic",
                      marginTop:  2,
                    }}
                  >
                    {d.verification.verificationUrl}
                  </div>
                )}
              </div>
            </div>
          </SectionBlock>
        )}

        {/* ─── FOOTER / CREDENTIALS ──────────────────────────── */}
        <div
          style={{
            borderTop:      "0.5px solid rgba(138,171,142,0.55)",
            paddingTop:     "4.5mm",
            marginTop:      "4mm",
            display:        "flex",
            justifyContent: "space-between",
            alignItems:     "flex-end",
            flexWrap:       "wrap",
            gap:            "5mm",
          }}
        >
          {/* Signature */}
          <div>
            <div
              style={{
                width:        "40mm",
                height:       "0.5px",
                background:   "rgba(54,69,79,0.28)",
                marginBottom: 6,
              }}
            />
            {hasValue(d.credentials?.signatoryName) && (
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize:   11,
                  color:      CH,
                  fontStyle:  "italic",
                  lineHeight: 1.3,
                }}
              >
                {d.credentials.signatoryName}
              </div>
            )}
            {hasValue(d.credentials?.title) && (
              <div
                style={{
                  fontFamily:    SANS,
                  fontSize:      7.5,
                  color:         CHL,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  marginTop:     3,
                  lineHeight:    1.45,
                }}
              >
                {d.credentials.title}
              </div>
            )}
          </div>

          {/* Contact + disclaimer */}
          <div style={{ textAlign: "right", maxWidth: "70mm" }}>
            {hasValue(d.credentials?.companyLine) && (
              <div
                style={{
                  fontFamily:  SANS,
                  fontSize:    8,
                  color:       CHL,
                  lineHeight:  1.55,
                  marginBottom: 5,
                }}
              >
                {d.credentials.companyLine}
              </div>
            )}
            <div
              style={{
                fontFamily: SANS,
                fontSize:   7,
                color:      "rgba(54,69,79,0.38)",
                lineHeight: 1.65,
                fontStyle:  "italic",
              }}
            >
              This report reflects the professional assessment of LESHEM.S
              and is provided for informational purposes only.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
