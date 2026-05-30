/**
 * components/JewelryValuationCertificate.jsx
 *
 * LESHEM.S — Jewelry Valuation Report
 * Ultra-luxury A4 certificate layout.
 *
 * Design language:
 *   Quiet luxury. Professional gemological laboratory aesthetic.
 *   Inspired by GIA / IGI / Gübelin — original LESHEM.S branding.
 *   Charcoal (#36454F) · Ivory (#FAF9F6) · Muted Gold (#C5B358)
 *   Serif (Merriweather) for brand + amounts. DM Sans for data.
 *
 * Empty-field contract:
 *   SpecRow       — returns null when value is falsy/blank.
 *   Section block — only renders when at least one of its fields is non-empty.
 *   No empty labels, no orphan rows, no blank sections ever appear.
 *
 * Print:
 *   className="printable-container" is the @media print anchor.
 *   The existing lib/printCss.js handles isolation — no changes needed there.
 *
 * Props:
 *   certData  {object}  Flat cert data object (from CertificateEditor state)
 */

// ─── Font / color shortcuts ───────────────────────────────────────────
const SERIF = "'Merriweather','Times New Roman',Georgia,serif";
const SANS  = "'DM Sans',Helvetica,Arial,sans-serif";
const CH    = "#36454F";
const CHM   = "#4a5c68";
const CHL   = "#7a8e98";
const CHX   = "#a8bcc4";
const IV    = "#FAF9F6";
const IV2   = "#F0EDE8";
const GD    = "#C5B358";
const SG    = "#8aab8e";

// ─── isEmpty ─────────────────────────────────────────────────────────
const isEmpty = (v) => !v || String(v).trim() === "";

// ─── SpecRow ─────────────────────────────────────────────────────────
/**
 * One row in a gemological specification table.
 * Returns null (renders nothing) when value is empty.
 */
function SpecRow({ label, value, noBorder }) {
  if (isEmpty(value)) return null;
  const border = noBorder ? "none" : `0.5px solid rgba(54,69,79,0.09)`;
  return (
    <tr>
      <td
        style={{
          padding:       "5.5px 16px 5.5px 0",
          fontFamily:    SANS,
          fontSize:      9,
          color:         CHL,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          whiteSpace:    "nowrap",
          verticalAlign: "top",
          width:         "38%",
          borderBottom:  border,
        }}
      >
        {label}
      </td>
      <td
        style={{
          padding:      "5.5px 0 5.5px 16px",
          fontFamily:   SANS,
          fontSize:     11.5,
          color:        CH,
          verticalAlign: "top",
          borderBottom:  border,
          lineHeight:   1.5,
        }}
      >
        {value}
      </td>
    </tr>
  );
}

// ─── SectionTitle ────────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <div
      style={{
        display:        "flex",
        alignItems:     "center",
        gap:            8,
        marginBottom:   "4mm",
      }}
    >
      <div
        style={{
          width:        "100%",
          display:      "flex",
          alignItems:   "center",
          gap:          10,
        }}
      >
        <span
          style={{
            fontFamily:    SANS,
            fontSize:      8,
            fontWeight:    700,
            color:         CHL,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            whiteSpace:    "nowrap",
          }}
        >
          {children}
        </span>
        <div
          style={{
            flex:       1,
            height:     "0.5px",
            background: `rgba(54,69,79,0.15)`,
          }}
        />
      </div>
    </div>
  );
}

// ─── JewelryValuationCertificate ─────────────────────────────────────
export function JewelryValuationCertificate({ certData }) {
  const d = certData; // shorthand

  // ── Determine which sections have content ──
  const hasClient   = !isEmpty(d.clientName);
  const hasItem     = !isEmpty(d.itemDescription);
  const hasMetal    = !isEmpty(d.metalType) || !isEmpty(d.metalWeight) || !isEmpty(d.metalPurity);
  const hasImg      = !!d.pieceImg;

  const hasCenter   =
    !isEmpty(d.centerStoneType)    ||
    !isEmpty(d.centerStoneCt)      ||
    !isEmpty(d.centerStoneColor)   ||
    !isEmpty(d.centerStoneClarity) ||
    !isEmpty(d.centerStoneCut)     ||
    !isEmpty(d.centerStoneSetting) ||
    !isEmpty(d.centerStoneCertNo)  ||
    !isEmpty(d.centerStoneFluorescence) ||
    !isEmpty(d.centerStoneOrigin);

  const hasSides    = !isEmpty(d.sideStonesDesc);
  const hasStones   = hasCenter || hasSides;
  const hasWork     = !isEmpty(d.workmanshipDesc);
  const hasVal      = !isEmpty(d.valuationAmount);
  const hasNotes    = !isEmpty(d.notes);

  // ── Info band row items (only non-empty) ──
  const metaBands = [
    hasClient  && { label: "Prepared for",  value: d.clientName },
    !isEmpty(d.reportDate) && { label: "Report date",   value: d.reportDate },
    !isEmpty(d.reportNumber) && { label: "Report no.",    value: d.reportNumber },
  ].filter(Boolean);

  return (
    <div
      className="printable-container"
      style={{
        width:      "210mm",
        maxWidth:   "100%",
        minHeight:  "297mm",
        background: IV,
        fontFamily: SANS,
        color:      CH,
        position:   "relative",
        overflow:   "hidden",
        boxSizing:  "border-box",
        margin:     "0 auto",
        // padding applied via inner layer so security strip goes edge-to-edge
      }}
    >

      {/* ── Watermark ─────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position:      "absolute",
          top:           "50%",
          left:          "50%",
          transform:     "translate(-50%, -50%) rotate(-22deg)",
          fontFamily:    SERIF,
          fontSize:      280,
          fontWeight:    700,
          color:         "rgba(54,69,79,0.022)",
          userSelect:    "none",
          pointerEvents: "none",
          lineHeight:    1,
          whiteSpace:    "nowrap",
          zIndex:        0,
        }}
      >
        LS
      </div>

      {/* ── Security strip ────────────────────────────────────────── */}
      <div
        style={{
          height:     4,
          background: `linear-gradient(90deg, ${GD} 0%, #a8973f 40%, ${SG} 100%)`,
          width:      "100%",
          flexShrink: 0,
        }}
      />

      {/* ── Content layer (above watermark, with page padding) ────── */}
      <div
        style={{
          position: "relative",
          zIndex:   1,
          padding:  "10mm 14mm 12mm",
        }}
      >

        {/* ════════════════ HEADER ════════════════════════════════ */}
        <div
          style={{
            display:        "flex",
            justifyContent: "space-between",
            alignItems:     "flex-start",
            marginBottom:   "5mm",
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
                marginTop:     3,
              }}
            >
              Fine Jewelry · Est. 2018
            </div>
          </div>

          {/* Report type + meta */}
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily:    SANS,
                fontSize:      9,
                fontWeight:    700,
                color:         CH,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                lineHeight:    1,
              }}
            >
              {d.reportTitle || "Jewelry Valuation Report"}
            </div>
            {!isEmpty(d.reportNumber) && (
              <div
                style={{
                  fontFamily:    SANS,
                  fontSize:      8.5,
                  color:         CHL,
                  marginTop:     4,
                  letterSpacing: "0.05em",
                }}
              >
                Report No.&nbsp;
                <span style={{ color: CH, fontWeight: 600 }}>
                  {d.reportNumber}
                </span>
              </div>
            )}
            {!isEmpty(d.reportDate) && (
              <div
                style={{
                  fontFamily: SANS,
                  fontSize:   8,
                  color:      CHL,
                  marginTop:  2,
                }}
              >
                {d.reportDate}
              </div>
            )}
          </div>
        </div>

        {/* Gold rule under header */}
        <div
          style={{
            height:       "1px",
            background:   GD,
            marginBottom: "5mm",
          }}
        />

        {/* ════════ INFO BAND (prepared for / date / no.) ═════════ */}
        {metaBands.length > 0 && (
          <div
            style={{
              display:         "flex",
              gap:             "6mm",
              background:      IV2,
              padding:         "3.5mm 5mm",
              marginBottom:    "6mm",
              borderLeft:      `3px solid ${GD}`,
            }}
          >
            {metaBands.map(({ label, value }) => (
              <div key={label} style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily:    SANS,
                    fontSize:      7,
                    color:         CHL,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    marginBottom:  2,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontFamily: SANS,
                    fontSize:   hasClient && label === "Prepared for" ? 14 : 11,
                    fontWeight: hasClient && label === "Prepared for" ? 600 : 400,
                    color:      CH,
                    lineHeight: 1.2,
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ════════ IMAGE + ITEM / METAL (2-col if image) ══════════ */}
        {(hasImg || hasItem || hasMetal) && (
          <div
            style={{
              display:             "grid",
              gridTemplateColumns: hasImg ? "52mm 1fr" : "1fr",
              gap:                 "6mm",
              marginBottom:        "6mm",
              alignItems:          "start",
            }}
          >
            {/* Image */}
            {hasImg && (
              <div
                style={{
                  border:       `0.5px solid rgba(54,69,79,0.2)`,
                  background:   IV2,
                  aspectRatio:  "1 / 1",
                  overflow:     "hidden",
                  display:      "flex",
                  alignItems:   "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={d.pieceImg}
                  alt="jewelry piece"
                  style={{
                    width:     "100%",
                    height:    "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}

            {/* Item description + metal */}
            <div>
              {hasItem && (
                <div style={{ marginBottom: hasMetal ? "4mm" : 0 }}>
                  <SectionTitle>Item Description</SectionTitle>
                  <p
                    style={{
                      fontFamily:  SANS,
                      fontSize:    11.5,
                      color:       CHM,
                      lineHeight:  1.7,
                      margin:      0,
                    }}
                  >
                    {d.itemDescription}
                  </p>
                </div>
              )}

              {hasMetal && (
                <div>
                  <SectionTitle>Metal Specifications</SectionTitle>
                  <table
                    style={{
                      width:          "100%",
                      borderCollapse: "collapse",
                    }}
                  >
                    <tbody>
                      <SpecRow label="Alloy"          value={d.metalType}   />
                      <SpecRow label="Gross Weight"   value={d.metalWeight} />
                      <SpecRow label="Purity / Fineness" value={d.metalPurity} noBorder />
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Thin divider */}
        {(hasImg || hasItem || hasMetal) && hasStones && (
          <div
            style={{
              height:       "0.5px",
              background:   "rgba(54,69,79,0.1)",
              marginBottom: "6mm",
            }}
          />
        )}

        {/* ════════════════ STONE SPECIFICATIONS ══════════════════ */}
        {hasStones && (
          <div style={{ marginBottom: "6mm" }}>
            <SectionTitle>Stone Specifications</SectionTitle>

            {/* Center stone table */}
            {hasCenter && (
              <div
                style={{
                  background:   IV2,
                  padding:      "3mm 4mm 2mm",
                  marginBottom: hasSides ? "3mm" : 0,
                }}
              >
                <div
                  style={{
                    fontFamily:    SANS,
                    fontSize:      7.5,
                    color:         SG,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom:  "2mm",
                    fontWeight:    700,
                  }}
                >
                  Center Stone
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    <SpecRow label="Species / Type"      value={d.centerStoneType}        />
                    <SpecRow label="Carat Weight"        value={d.centerStoneCt}          />
                    <SpecRow label="Color Grade"         value={d.centerStoneColor}       />
                    <SpecRow label="Clarity Grade"       value={d.centerStoneClarity}     />
                    <SpecRow label="Cut Grade"           value={d.centerStoneCut}         />
                    <SpecRow label="Setting Style"       value={d.centerStoneSetting}     />
                    <SpecRow label="Fluorescence"        value={d.centerStoneFluorescence}/>
                    <SpecRow label="Country of Origin"   value={d.centerStoneOrigin}      />
                    <SpecRow label="Laboratory Cert. No." value={d.centerStoneCertNo}    noBorder />
                  </tbody>
                </table>
              </div>
            )}

            {/* Side stones */}
            {hasSides && (
              <div
                style={{
                  background: "#f7f4ef",
                  padding:    "3mm 4mm",
                }}
              >
                <div
                  style={{
                    fontFamily:    SANS,
                    fontSize:      7.5,
                    color:         CHL,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom:  "2mm",
                    fontWeight:    700,
                  }}
                >
                  Side / Accent Stones
                </div>
                <p
                  style={{
                    fontFamily: SANS,
                    fontSize:   11.5,
                    color:      CHM,
                    margin:     0,
                    lineHeight: 1.6,
                  }}
                >
                  {d.sideStonesDesc}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ══════════════ WORKMANSHIP ═════════════════════════════ */}
        {hasWork && (
          <div style={{ marginBottom: "6mm" }}>
            <SectionTitle>Workmanship &amp; Setting</SectionTitle>
            <p
              style={{
                fontFamily:  SANS,
                fontSize:    11.5,
                color:       CHM,
                lineHeight:  1.7,
                margin:      0,
                paddingLeft: "2mm",
                borderLeft:  `2px solid rgba(54,69,79,0.12)`,
              }}
            >
              {d.workmanshipDesc}
            </p>
          </div>
        )}

        {/* ══════════════ VALUATION ═══════════════════════════════ */}
        {hasVal && (
          <div style={{ marginBottom: "6mm" }}>
            <SectionTitle>Valuation Summary</SectionTitle>
            <div
              style={{
                background: CH,
                padding:    "5mm 6mm",
              }}
            >
              <div
                style={{
                  display:        "flex",
                  justifyContent: "space-between",
                  alignItems:     "center",
                  flexWrap:       "wrap",
                  gap:            "4mm",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily:    SANS,
                      fontSize:      7,
                      color:         CHX,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      marginBottom:  3,
                    }}
                  >
                    {d.valuationBasis || "Retail Replacement Value"}
                  </div>
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontSize:   30,
                      fontWeight: 700,
                      color:      GD,
                      lineHeight: 1,
                    }}
                  >
                    {d.valuationAmount}
                  </div>
                  {!isEmpty(d.valuationDate) && (
                    <div
                      style={{
                        fontFamily: SANS,
                        fontSize:   7.5,
                        color:      CHX,
                        marginTop:  5,
                      }}
                    >
                      Valuation date: {d.valuationDate}
                    </div>
                  )}
                </div>

                {/* Right side: small LESHEM.S mark */}
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontFamily:    SERIF,
                      fontSize:      13,
                      color:         "rgba(197,179,88,0.5)",
                      letterSpacing: "0.18em",
                      fontWeight:    700,
                    }}
                  >
                    LESHEM.S
                  </div>
                  <div
                    style={{
                      fontFamily: SANS,
                      fontSize:   7,
                      color:      "rgba(197,179,88,0.35)",
                      letterSpacing: "0.12em",
                      marginTop:  2,
                    }}
                  >
                    FINE JEWELRY
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ NOTES ══════════════════════════════════ */}
        {hasNotes && (
          <div style={{ marginBottom: "6mm" }}>
            <SectionTitle>Notes &amp; Remarks</SectionTitle>
            <p
              style={{
                fontFamily:    SANS,
                fontSize:      10.5,
                color:         CHM,
                lineHeight:    1.8,
                margin:        0,
                padding:       "3mm 4mm",
                background:    IV2,
                borderLeft:    `2px solid ${GD}`,
                fontStyle:     "italic",
              }}
            >
              {d.notes}
            </p>
          </div>
        )}

        {/* ══════════════ FOOTER ═════════════════════════════════ */}
        <div
          style={{
            borderTop:      `0.5px solid rgba(197,179,88,0.45)`,
            paddingTop:     "5mm",
            marginTop:      "auto",
            display:        "flex",
            justifyContent: "space-between",
            alignItems:     "flex-end",
            gap:            "6mm",
            flexWrap:       "wrap",
          }}
        >
          {/* Signature block */}
          <div>
            {/* Signature line placeholder */}
            <div
              style={{
                width:        "42mm",
                height:       "0.5px",
                background:   "rgba(54,69,79,0.3)",
                marginBottom: 5,
              }}
            />
            {!isEmpty(d.credentialsLine1) && (
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize:   11,
                  color:      CH,
                  fontStyle:  "italic",
                }}
              >
                {d.credentialsLine1}
              </div>
            )}
            {!isEmpty(d.credentialsLine2) && (
              <div
                style={{
                  fontFamily:    SANS,
                  fontSize:      7.5,
                  color:         CHL,
                  letterSpacing: "0.08em",
                  marginTop:     2,
                  textTransform: "uppercase",
                }}
              >
                {d.credentialsLine2}
              </div>
            )}
          </div>

          {/* Contact + disclaimer */}
          <div style={{ textAlign: "right" }}>
            {!isEmpty(d.credentialsLine3) && (
              <div
                style={{
                  fontFamily: SANS,
                  fontSize:   8,
                  color:      CHL,
                  marginBottom: 4,
                }}
              >
                {d.credentialsLine3}
              </div>
            )}
            <div
              style={{
                fontFamily:  SANS,
                fontSize:    7,
                color:       "rgba(54,69,79,0.38)",
                maxWidth:    "70mm",
                lineHeight:  1.6,
                fontStyle:   "italic",
              }}
            >
              This report reflects the professional opinion of LESHEM.S and
              is not a guarantee of value. Market conditions may affect
              valuation over time.
            </div>
          </div>
        </div>

      </div>{/* /content layer */}
    </div>/* /printable-container */
  );
}
