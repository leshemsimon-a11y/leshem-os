/**
 * components/reports/templates/JewelryValuationReport.jsx
 *
 * LESHEM.S — Jewelry Valuation Report
 * Ultra-luxury A4 appraisal document.
 *
 * Design language:
 *   Quiet luxury. Professional fine jewelry appraisal aesthetic.
 *   Ivory background · Charcoal typography · Muted gold accents.
 *   Merriweather (serif) for brand and valuation amount.
 *   DM Sans for all data, labels, and body text.
 *
 * Empty-field contract:
 *   Every displayed value is checked through hasValue() before render.
 *   SpecRow returns null for empty values — no orphan labels, ever.
 *   Section blocks only render when at least one of their fields exists.
 *
 * Print:
 *   className="printable-container" on the outermost div is the
 *   @media print anchor — lib/printCss.js handles A4 isolation.
 *
 * Props:
 *   data  {object}  Report data from ReportEngine state
 */

import { hasValue } from "../../../lib/reports/reportUtils";

// ─── Design tokens ────────────────────────────────────────────────────
const SERIF = "'Merriweather','Times New Roman',Georgia,serif";
const SANS  = "'DM Sans',Helvetica,Arial,sans-serif";
const CH    = "#36454F";
const CHM   = "#4a5c68";
const CHL   = "#7a8e98";
const CHX   = "#a8bcc4";
const IV    = "#FAF9F6";
const IV2   = "#F0EDE8";
const IV3   = "#e8e4dc";
const GD    = "#C5B358";
const SG    = "#8aab8e";

// ─── SpecRow ─────────────────────────────────────────────────────────
/**
 * One row in a specification table.
 * Returns null when value is empty — enforces the empty-field contract.
 */
function SpecRow({ label, value, noBorder }) {
  if (!hasValue(value)) return null;
  return (
    <tr>
      <td
        style={{
          padding:       "5px 14px 5px 0",
          fontFamily:    SANS,
          fontSize:      8.5,
          color:         CHL,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          whiteSpace:    "nowrap",
          verticalAlign: "top",
          width:         "36%",
          borderBottom:  noBorder ? "none" : `0.5px solid rgba(54,69,79,0.08)`,
        }}
      >
        {label}
      </td>
      <td
        style={{
          padding:      "5px 0 5px 14px",
          fontFamily:   SANS,
          fontSize:     11.5,
          color:        CH,
          verticalAlign: "top",
          lineHeight:   1.55,
          borderBottom: noBorder ? "none" : `0.5px solid rgba(54,69,79,0.08)`,
        }}
      >
        {value}
      </td>
    </tr>
  );
}

// ─── SectionTitle ────────────────────────────────────────────────────
function SectionTitle({ children, accent = GD }) {
  return (
    <div
      style={{
        display:      "flex",
        alignItems:   "center",
        gap:          10,
        marginBottom: "3.5mm",
      }}
    >
      <div
        style={{
          width:        2,
          height:       14,
          background:   accent,
          borderRadius: 1,
          flexShrink:   0,
        }}
      />
      <span
        style={{
          fontFamily:    SANS,
          fontSize:      8,
          fontWeight:    700,
          color:         CHL,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}
      >
        {children}
      </span>
      <div
        style={{
          flex:       1,
          height:     "0.5px",
          background: "rgba(54,69,79,0.12)",
        }}
      />
    </div>
  );
}

// ─── JewelryValuationReport ──────────────────────────────────────────
export function JewelryValuationReport({ data }) {
  if (!data) return null;

  const d = data;

  // ── Presence guards ──
  const hasImg          = Array.isArray(d.images) && d.images.length > 0;
  const hasHero         = hasValue(d.preparedFor) || hasValue(d.itemTitle) || hasImg;
  const hasDescription  = hasValue(d.itemDescription);
  const hasMetal        = hasValue(d.metal?.alloy) || hasValue(d.metal?.weight) || hasValue(d.metal?.purity) || hasValue(d.metal?.casting);
  const hasCenterStone  =
    hasValue(d.centerStone?.type)     ||
    hasValue(d.centerStone?.carat)    ||
    hasValue(d.centerStone?.color)    ||
    hasValue(d.centerStone?.clarity)  ||
    hasValue(d.centerStone?.cut)      ||
    hasValue(d.centerStone?.setting)  ||
    hasValue(d.centerStone?.fluorescence) ||
    hasValue(d.centerStone?.origin)   ||
    hasValue(d.centerStone?.certLab)  ||
    hasValue(d.centerStone?.certNumber);
  const hasSpecs        = hasMetal || hasCenterStone || hasValue(d.accentStonesDesc) || hasValue(d.workmanshipDesc);
  const hasValuation    = d.valuation?.enabled !== false && hasValue(d.valuation?.amount);
  const hasNotes        = hasValue(d.notes);
  const hasReportMeta   = hasValue(d.reportNumber) || hasValue(d.reportDate);

  // ── Info band items ──
  const infoBand = [
    hasValue(d.preparedFor) && { label: "Prepared for",  val: d.preparedFor },
    hasValue(d.reportDate)  && { label: "Date",           val: d.reportDate },
    hasValue(d.reportNumber)&& { label: "Report no.",     val: d.reportNumber },
  ].filter(Boolean);

  return (
    <div
      className="printable-container"
      style={{
        width:     "210mm",
        maxWidth:  "100%",
        minHeight: "297mm",
        background: IV,
        fontFamily: SANS,
        color:      CH,
        position:  "relative",
        overflow:  "hidden",
        boxSizing: "border-box",
        margin:    "0 auto",
      }}
    >

      {/* ── Watermark ─────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position:      "absolute",
          top:           "50%",
          left:          "50%",
          transform:     "translate(-50%,-50%) rotate(-20deg)",
          fontFamily:    SERIF,
          fontSize:      240,
          fontWeight:    700,
          color:         "rgba(54,69,79,0.022)",
          userSelect:    "none",
          pointerEvents: "none",
          lineHeight:    1,
          zIndex:        0,
          whiteSpace:    "nowrap",
        }}
      >
        LS
      </div>

      {/* ── Gold security strip ───────────────────────────────────── */}
      <div
        style={{
          height:     4,
          background: `linear-gradient(90deg, ${GD} 0%, #b8a24a 50%, ${SG} 100%)`,
          width:      "100%",
        }}
      />

      {/* ── Content layer ─────────────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 1, padding: "10mm 14mm 12mm" }}>

        {/* ════ HEADER ════════════════════════════════════════════ */}
        <div
          style={{
            display:        "flex",
            justifyContent: "space-between",
            alignItems:     "flex-start",
            marginBottom:   "4.5mm",
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                fontFamily:    SERIF,
                fontSize:      21,
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
                fontSize:      8.5,
                fontWeight:    700,
                color:         CH,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                lineHeight:    1,
              }}
            >
              {hasValue(d.reportTitle) ? d.reportTitle : "Jewelry Valuation Report"}
            </div>
            {hasValue(d.reportNumber) && (
              <div
                style={{
                  fontFamily:    SANS,
                  fontSize:      8.5,
                  color:         CHL,
                  marginTop:     4,
                  letterSpacing: "0.04em",
                }}
              >
                Report No.&nbsp;
                <span style={{ color: CH, fontWeight: 600 }}>{d.reportNumber}</span>
              </div>
            )}
            {hasValue(d.reportDate) && (
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

        {/* Gold rule */}
        <div style={{ height: "1px", background: GD, marginBottom: "4.5mm" }} />

        {/* ════ INFO BAND ══════════════════════════════════════════ */}
        {infoBand.length > 0 && (
          <div
            style={{
              display:      "flex",
              gap:          "5mm",
              background:   IV2,
              padding:      "3mm 4.5mm",
              marginBottom: "5.5mm",
              borderLeft:   `3px solid ${GD}`,
              flexWrap:     "wrap",
            }}
          >
            {infoBand.map(({ label, val }) => (
              <div key={label} style={{ flex: "1 1 auto", minWidth: 80 }}>
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
                    fontSize:   label === "Prepared for" ? 13 : 11,
                    fontWeight: label === "Prepared for" ? 600 : 400,
                    color:      CH,
                    lineHeight: 1.2,
                  }}
                >
                  {val}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ════ HERO: IMAGE + ITEM TITLE ═══════════════════════════ */}
        {hasHero && (
          <div
            style={{
              display:             "grid",
              gridTemplateColumns: hasImg ? "52mm 1fr" : "1fr",
              gap:                 "5.5mm",
              marginBottom:        "5.5mm",
              alignItems:          "start",
            }}
          >
            {/* Image */}
            {hasImg && (
              <div
                style={{
                  border:          `0.5px solid rgba(54,69,79,0.18)`,
                  background:      IV2,
                  aspectRatio:     "1 / 1",
                  overflow:        "hidden",
                  display:         "flex",
                  alignItems:      "center",
                  justifyContent:  "center",
                }}
              >
                <img
                  src={d.images[0]}
                  alt="jewelry"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </div>
            )}

            {/* Item info */}
            <div>
              {hasValue(d.itemTitle) && (
                <div style={{ marginBottom: 6 }}>
                  <div
                    style={{
                      fontFamily:    SERIF,
                      fontSize:      15,
                      fontWeight:    700,
                      color:         CH,
                      letterSpacing: "0.03em",
                      lineHeight:    1.3,
                    }}
                  >
                    {d.itemTitle}
                  </div>
                </div>
              )}
              {/* Inline valuation teaser (hero) — only when showValuation + amount */}
              {hasValuation && d.displaySettings?.showValuation !== false && (
                <div
                  style={{
                    display:     "inline-block",
                    background:  `rgba(197,179,88,0.1)`,
                    border:      `0.5px solid ${GD}`,
                    padding:     "3px 10px",
                    marginTop:   4,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily:    SANS,
                      fontSize:      7,
                      color:         CHM,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      marginRight:   6,
                    }}
                  >
                    Appraised Value
                  </span>
                  <span
                    style={{
                      fontFamily: SERIF,
                      fontSize:   13,
                      fontWeight: 700,
                      color:      GD,
                    }}
                  >
                    {d.valuation.amount}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════ PROFESSIONAL DESCRIPTION ═══════════════════════════ */}
        {hasDescription && (
          <div style={{ marginBottom: "5.5mm" }}>
            <SectionTitle>Description</SectionTitle>
            <p
              style={{
                fontFamily:  SANS,
                fontSize:    11,
                color:       CHM,
                lineHeight:  1.75,
                margin:      0,
                paddingLeft: "3mm",
                borderLeft:  `1.5px solid rgba(54,69,79,0.1)`,
              }}
            >
              {d.itemDescription}
            </p>
          </div>
        )}

        {/* ════ JEWELRY SPECIFICATIONS ══════════════════════════════ */}
        {hasSpecs && (
          <div style={{ marginBottom: "5.5mm" }}>
            <SectionTitle>Jewelry Specifications</SectionTitle>

            <div style={{ background: IV2, padding: "3.5mm 4.5mm" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>

                  {/* Metal rows */}
                  {hasMetal && (
                    <>
                      {hasValue(d.metal?.alloy) && (
                        <SpecRow label="Metal" value={d.metal.alloy} />
                      )}
                      {hasValue(d.metal?.purity) && (
                        <SpecRow label="Purity" value={d.metal.purity} />
                      )}
                      {hasValue(d.metal?.weight) && (
                        <SpecRow label="Gross Weight" value={d.metal.weight} />
                      )}
                      {hasValue(d.metal?.casting) && (
                        <SpecRow label="Casting Method" value={d.metal.casting} />
                      )}
                    </>
                  )}

                  {/* Separator row between metal and stones */}
                  {hasMetal && hasCenterStone && (
                    <tr aria-hidden="true">
                      <td colSpan={2} style={{ padding: "2mm 0 0", height: 0 }} />
                    </tr>
                  )}

                  {/* Center stone rows */}
                  {hasCenterStone && (
                    <>
                      {hasValue(d.centerStone?.type)   && <SpecRow label="Center Stone"       value={d.centerStone.type} />}
                      {hasValue(d.centerStone?.carat)  && <SpecRow label="Carat Weight"        value={d.centerStone.carat} />}
                      {hasValue(d.centerStone?.color)  && <SpecRow label="Color Grade"         value={d.centerStone.color} />}
                      {hasValue(d.centerStone?.clarity)&& <SpecRow label="Clarity Grade"       value={d.centerStone.clarity} />}
                      {hasValue(d.centerStone?.cut)    && <SpecRow label="Cut Grade"           value={d.centerStone.cut} />}
                      {hasValue(d.centerStone?.setting)&& <SpecRow label="Setting"             value={d.centerStone.setting} />}
                      {hasValue(d.centerStone?.fluorescence) && <SpecRow label="Fluorescence"  value={d.centerStone.fluorescence} />}
                      {hasValue(d.centerStone?.origin) && <SpecRow label="Origin"              value={d.centerStone.origin} />}
                      {(hasValue(d.centerStone?.certLab) || hasValue(d.centerStone?.certNumber)) && (
                        <SpecRow
                          label="Laboratory Report"
                          value={[d.centerStone?.certLab, d.centerStone?.certNumber].filter(hasValue).join(" ")}
                        />
                      )}
                    </>
                  )}

                  {/* Accent stones */}
                  {hasValue(d.accentStonesDesc) && (
                    <SpecRow label="Accent Stones" value={d.accentStonesDesc} />
                  )}

                  {/* Workmanship */}
                  {hasValue(d.workmanshipDesc) && (
                    <SpecRow label="Workmanship" value={d.workmanshipDesc} noBorder />
                  )}

                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════ VALUATION SUMMARY ═══════════════════════════════════ */}
        {hasValuation && d.displaySettings?.showValuation !== false && (
          <div style={{ marginBottom: "5.5mm" }}>
            <SectionTitle>Valuation Summary</SectionTitle>
            <div
              style={{
                background: CH,
                padding:    "5.5mm 6mm",
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
                {/* Amount + basis */}
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
                    {hasValue(d.valuation?.basis) ? d.valuation.basis : "Retail Replacement Value"}
                  </div>
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontSize:   28,
                      fontWeight: 700,
                      color:      GD,
                      lineHeight: 1,
                    }}
                  >
                    {d.valuation.amount}
                  </div>
                  {hasValue(d.valuation?.date) && (
                    <div
                      style={{
                        fontFamily: SANS,
                        fontSize:   7.5,
                        color:      CHX,
                        marginTop:  5,
                      }}
                    >
                      Valuation date: {d.valuation.date}
                    </div>
                  )}
                </div>

                {/* LESHEM.S mark */}
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontFamily:    SERIF,
                      fontSize:      12,
                      color:         "rgba(197,179,88,0.45)",
                      letterSpacing: "0.18em",
                      fontWeight:    700,
                    }}
                  >
                    LESHEM.S
                  </div>
                  <div
                    style={{
                      fontFamily:    SANS,
                      fontSize:      7,
                      color:         "rgba(197,179,88,0.3)",
                      letterSpacing: "0.1em",
                      marginTop:     2,
                    }}
                  >
                    FINE JEWELRY
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════ NOTES ══════════════════════════════════════════════ */}
        {hasNotes && (
          <div style={{ marginBottom: "5.5mm" }}>
            <SectionTitle>Notes &amp; Remarks</SectionTitle>
            <p
              style={{
                fontFamily:  SANS,
                fontSize:    10.5,
                color:       CHM,
                lineHeight:  1.8,
                margin:      0,
                padding:     "3mm 4mm",
                background:  IV2,
                borderLeft:  `2px solid ${GD}`,
                fontStyle:   "italic",
              }}
            >
              {d.notes}
            </p>
          </div>
        )}

        {/* ════ FOOTER ═════════════════════════════════════════════ */}
        <div
          style={{
            borderTop:      `0.5px solid rgba(197,179,88,0.4)`,
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
                marginBottom: 5,
              }}
            />
            {hasValue(d.credentials?.signatoryName) && (
              <div style={{ fontFamily: SERIF, fontSize: 11, color: CH, fontStyle: "italic" }}>
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
                  marginTop:     2,
                }}
              >
                {d.credentials.title}
              </div>
            )}
          </div>

          {/* Contact + disclaimer */}
          <div style={{ textAlign: "right" }}>
            {hasValue(d.credentials?.companyLine) && (
              <div
                style={{
                  fontFamily: SANS,
                  fontSize:   8,
                  color:      CHL,
                  marginBottom: 4,
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
                maxWidth:   "68mm",
                lineHeight: 1.6,
                fontStyle:  "italic",
              }}
            >
              This report is the professional opinion of LESHEM.S and is not
              a guarantee of value. Market conditions may affect valuation over time.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
