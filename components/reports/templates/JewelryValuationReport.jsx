/**
 * components/reports/templates/JewelryValuationReport.jsx  —  v4.3.2
 *
 * LESHEM.S — Jewelry Valuation Report
 *
 * Changes vs v4.3:
 *   + Root div: WebkitPrintColorAdjust + printColorAdjust added to inline style.
 *     Belt-and-suspenders alongside printCss.js — preserves backgrounds in PDF
 *     when the print CSS hasn't injected yet (first render, server-side, etc.)
 *   + SignatureBlock refactored to fixed-height:
 *       Fixed 18mm container for the image/signing area, always the same height.
 *       With image:    image aligned to bottom of 18mm box (max 16mm × 36mm).
 *       Without image: 18mm empty space for manual pen signing.
 *       Container overflow:hidden prevents oversized images from bleeding.
 *       Name and title always in the same position below the line.
 *   ~ Multi-image equal-size grid unchanged from v4.3:
 *       1 image  → single full-width square (52mm column)
 *       2–3 images → flex:"1 1 0" equal-width row
 *       4+ images → silently truncated to 3 (slice 0,3)
 *   ~ All other sections identical to v4.3.
 *
 * Print: className="printable-container" — lib/printCss.js anchor.
 * Direction: dir="ltr" explicit on root.
 */

import {
  hasValue,
  formatMeasurements,
  formatFluorescence,
} from "../../../lib/reports/reportUtils";

// ─── Design tokens ──────────────────────────────────────────────────────────
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

// ─── SpecRow ────────────────────────────────────────────────────────────────
function SpecRow({ label, value, noBorder }) {
  if (!hasValue(value)) return null;
  return (
    <tr>
      <td style={{
        padding: "3.4px 10px 3.4px 0", fontFamily: SANS, fontSize: 7.6, color: CHL,
        letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap",
        verticalAlign: "top", width: "38%",
        borderBottom: noBorder ? "none" : "0.5px solid rgba(54,69,79,0.07)",
      }}>
        {label}
      </td>
      <td style={{
        padding: "3.4px 0 3.4px 10px", fontFamily: SANS, fontSize: 9.4, color: CH,
        verticalAlign: "top", lineHeight: 1.42,
        borderBottom: noBorder ? "none" : "0.5px solid rgba(54,69,79,0.07)",
      }}>
        {value}
      </td>
    </tr>
  );
}

// ─── SpecSubGroup ────────────────────────────────────────────────────────────
function SpecSubGroup({ label, rows }) {
  const visible = rows.filter((r) => hasValue(r.value));
  if (visible.length === 0) return null;
  return (
    <div style={{ marginBottom: "2.6mm" }}>
      <div style={{
        fontFamily: SANS, fontSize: 6.5, fontWeight: 700, color: CHL,
        letterSpacing: "0.22em", textTransform: "uppercase",
        marginBottom: "1.4mm", paddingBottom: "0.8mm",
        borderBottom: "0.5px solid rgba(197,179,88,0.22)",
      }}>
        {label}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {visible.map((r, i) => (
            <SpecRow
              key={r.label}
              label={r.label}
              value={r.value}
              noBorder={i === visible.length - 1}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── SectionTitle ────────────────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "2mm" }}>
      <div style={{ width: 2, height: 11, background: GD, borderRadius: 1, flexShrink: 0 }} />
      <span style={{
        fontFamily: SANS, fontSize: 6.3, fontWeight: 700, color: CHL,
        letterSpacing: "0.22em", textTransform: "uppercase",
      }}>
        {children}
      </span>
      <div style={{ flex: 1, height: "0.5px", background: "rgba(54,69,79,0.1)" }} />
    </div>
  );
}

// ─── SignatureBlock ───────────────────────────────────────────────────────────
/**
 * Fixed-height signature area.
 *
 * Layout (always the same total height):
 *   ┌─────────────────────────────┐  ← 18mm fixed container
 *   │                             │
 *   │  [sig image if exists]      │  ← image aligned to bottom, max 16mm tall
 *   └─────────────────────────────┘
 *   ── 50mm line ─────────────────   ← 0.5px rule, 3mm below container
 *   Examiner Name                    ← italic serif 12pt
 *   EXAMINER TITLE                   ← caps sans 7.5pt
 *
 * When no image: the 18mm container is empty — provides blank signing space.
 * Container overflow:hidden prevents oversized images from bleeding.
 * Name uses examinerName → signatoryName fallback (hasValue check).
 */
function SignatureBlock({ credentials }) {
  const c            = credentials || {};
  const displayName  = hasValue(c.examinerName)  ? c.examinerName  : (c.signatoryName || "");
  const displayTitle = hasValue(c.examinerTitle) ? c.examinerTitle : (c.title         || "");
  const hasSigImg    = hasValue(c.signatureImageUrl);

  return (
    <div>
      {/* Fixed compact signature image / blank signing space */}
      <div
        style={{
          height:      "11mm",
          display:     "flex",
          alignItems:  "flex-end",
          paddingBottom: "1mm",
          overflow:    "hidden",
          boxSizing:   "border-box",
        }}
      >
        {hasSigImg && (
          <img
            src={c.signatureImageUrl}
            alt="signature"
            style={{
              maxWidth:       "34mm",
              maxHeight:      "10mm",
              width:          "auto",
              height:         "auto",
              objectFit:      "contain",
              objectPosition: "bottom left",
              display:        "block",
            }}
          />
        )}
        {/* No image → empty signing space for manual pen signing */}
      </div>

      {/* Signature line */}
      <div style={{ width: "48mm", height: "0.5px", background: "rgba(54,69,79,0.3)", marginBottom: "2mm" }} />

      {/* Examiner name */}
      {hasValue(displayName) && (
        <div style={{ fontFamily: SERIF, fontSize: 10.5, color: CH, fontStyle: "italic", lineHeight: 1.2 }}>
          {displayName}
        </div>
      )}

      {/* Examiner title */}
      {hasValue(displayTitle) && (
        <div style={{
          fontFamily:    SANS,
          fontSize:      6.5,
          color:         CHL,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          marginTop:     2,
          lineHeight:    1.35,
        }}>
          {displayTitle}
        </div>
      )}
    </div>
  );
}

// ─── JewelryValuationReport ──────────────────────────────────────────────────
export function JewelryValuationReport({ data }) {
  if (!data) return null;
  const d = data;

  // Images: normalise, deduplicate, max 3 shown in report
  const images       = Array.isArray(d.images) ? d.images.filter(Boolean) : (d.images ? [d.images] : []);
  const reportImages = images.slice(0, 3);
  const hasImages    = reportImages.length > 0;

  // ── Presence guards ──────────────────────────────────────────────────────
  const hasDescription = hasValue(d.itemDescription);
  const hasItemTitle   = hasValue(d.itemTitle);
  const hasItem        = hasItemTitle || hasImages;

  const hasMetal =
    hasValue(d.metal?.alloy)  || hasValue(d.metal?.weight) ||
    hasValue(d.metal?.purity) || hasValue(d.metal?.casting);

  const certStr = [d.centerStone?.certLab, d.centerStone?.certNumber]
    .filter(hasValue).join("  ");
  const centerMeasurements = formatMeasurements(
    d.centerStone?.measLength,
    d.centerStone?.measWidth,
    d.centerStone?.measDepth,
    d.centerStone?.measurements
  );
  const centerFluorescence = formatFluorescence(
    d.centerStone?.fluorescenceIntensity,
    d.centerStone?.fluorescenceColor,
    d.centerStone?.fluorescence
  );

  const hasCenterStone =
    hasValue(d.centerStone?.type)        || hasValue(d.centerStone?.carat)  ||
    hasValue(d.centerStone?.color)       || hasValue(d.centerStone?.clarity)||
    hasValue(d.centerStone?.cut)         || hasValue(d.centerStone?.setting)||
    hasValue(centerMeasurements)          || hasValue(centerFluorescence)    ||
    hasValue(d.centerStone?.origin)       ||
    hasValue(d.centerStone?.certLab)      || hasValue(d.centerStone?.certNumber);

  const hasSpecs =
    hasMetal || hasCenterStone ||
    hasValue(d.accentStonesDesc) || hasValue(d.workmanshipDesc);

  const hasValuation =
    d.valuation?.enabled !== false && hasValue(d.valuation?.amount);

  const hasVerification =
    hasValue(d.verification?.verificationId) || hasValue(d.verification?.verificationUrl);

  const hasNotes       = hasValue(d.notes);
  const hasPreparedFor = hasValue(d.preparedFor);


  return (
    <div
      className="printable-container"
      dir="ltr"
      style={{
        width:    "210mm",
        maxWidth: "100%",
        height: "297mm",
        minHeight: "297mm",
        background: IV,
        fontFamily: SANS,
        color:      CH,
        position:   "relative",
        overflow:   "hidden",        // screen: clip watermark bleed
        boxSizing:  "border-box",
        margin:     "0 auto",
        // Print fidelity: preserve backgrounds in PDF (belt+suspenders with printCss.js)
        WebkitPrintColorAdjust: "exact",
        printColorAdjust:       "exact",
      }}
    >
      {/* Watermark */}
      <div aria-hidden="true" style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%) rotate(-20deg)",
        fontFamily: SERIF, fontSize: 240, fontWeight: 700,
        color: "rgba(54,69,79,0.02)", userSelect: "none",
        pointerEvents: "none", lineHeight: 1, zIndex: 0, whiteSpace: "nowrap",
      }}>LS</div>

      {/* Security strip */}
      <div style={{
        height: 4,
        background: `linear-gradient(90deg, ${GD} 0%, #b8a24a 55%, ${SG} 100%)`,
      }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, padding: "8mm 12mm 32mm", height: "calc(297mm - 4px)", boxSizing: "border-box" }}>

        {/* ── HEADER ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "3mm" }}>
          <div>
            <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: CH, letterSpacing: "0.22em", lineHeight: 1 }}>
              LESHEM.S
            </div>
            <div style={{ fontFamily: SANS, fontSize: 7.5, color: SG, letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 4 }}>
              Fine Jewelry · Est. 2018
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: SANS, fontSize: 8.5, fontWeight: 700, color: CH, letterSpacing: "0.18em", textTransform: "uppercase", lineHeight: 1 }}>
              Jewelry Valuation Report
            </div>
            {hasValue(d.reportNumber) && (
              <div style={{ fontFamily: SANS, fontSize: 8.5, color: CHL, marginTop: 5, letterSpacing: "0.04em" }}>
                Report No. <span style={{ color: CH, fontWeight: 600 }}>{d.reportNumber}</span>
              </div>
            )}
            {hasValue(d.reportDate) && (
              <div style={{ fontFamily: SANS, fontSize: 8, color: CHL, marginTop: 2 }}>{d.reportDate}</div>
            )}
          </div>
        </div>

        {/* Gold rule */}
        <div style={{ height: "1px", background: GD, marginBottom: "2.6mm" }} />

        {/* ── PREPARED FOR ── */}
        {hasPreparedFor && (
          <div style={{ marginBottom: "2.6mm" }}>
            <SectionTitle>Prepared For</SectionTitle>
            <div style={{ padding: "1.5mm 0 2mm", borderBottom: "0.5px solid rgba(54,69,79,0.1)" }}>
              <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: CH, letterSpacing: "0.03em", lineHeight: 1.2 }}>
                {d.preparedFor}
              </div>
            </div>
          </div>
        )}

        {/* ── ITEM: images + title ── */}
        {hasItem && (
          <div style={{ marginBottom: "2.6mm" }}>
            <SectionTitle>Item</SectionTitle>
            <div style={{
              display:             "grid",
              gridTemplateColumns: hasImages ? "44mm 1fr" : "1fr",
              gap:                 "4mm",
              alignItems:          "start",
            }}>
              {/* Image column */}
              {hasImages && (
                <div>
                  {reportImages.length === 1 ? (
                    // Single image: full-width square
                    <div style={{
                      border: "0.5px solid rgba(54,69,79,0.16)", background: IV2,
                      aspectRatio: "1 / 1", overflow: "hidden",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <img
                        src={reportImages[0]}
                        alt={d.itemTitle || "jewelry"}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    </div>
                  ) : (
                    // 2–3 images: equal-width row
                    <div style={{ display: "flex", gap: "1.5mm" }}>
                      {reportImages.map((src, idx) => (
                        <div
                          key={idx}
                          style={{
                            flex:        "1 1 0",
                            aspectRatio: "1 / 1",
                            overflow:    "hidden",
                            border:      "0.5px solid rgba(54,69,79,0.16)",
                            background:  IV2,
                            display:     "flex",
                            alignItems:  "center",
                            justifyContent: "center",
                          }}
                        >
                          <img
                            src={src}
                            alt={`view ${idx + 1}`}
                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Title */}
              {hasItemTitle && (
                <div style={{
                  fontFamily: SERIF, fontSize: 15, fontWeight: 700, color: CH,
                  letterSpacing: "0.03em", lineHeight: 1.35,
                  paddingTop: hasImages ? "1mm" : 0,
                }}>
                  {d.itemTitle}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PROFESSIONAL DESCRIPTION ── */}
        {hasDescription && (
          <div style={{ marginBottom: "3.8mm" }}>
            <SectionTitle>Professional Description</SectionTitle>
            <p style={{
              fontFamily: SANS, fontSize: 9.2, color: CHM, lineHeight: 1.58,
              margin: 0, paddingLeft: "3mm", borderLeft: "1.5px solid rgba(54,69,79,0.1)",
            }}>
              {d.itemDescription}
            </p>
          </div>
        )}

        {/* ── JEWELRY SPECIFICATIONS ── */}
        {hasSpecs && (
          <div style={{ marginBottom: "3.8mm" }}>
            <SectionTitle>Jewelry Specifications</SectionTitle>
            <div style={{ background: IV2, padding: "2.8mm 4mm" }}>
              {hasMetal && (
                <SpecSubGroup label="Metal" rows={[
                  { label: "Alloy",          value: d.metal?.alloy },
                  { label: "Gross Weight",   value: d.metal?.weight },
                  { label: "Purity",         value: d.metal?.purity },
                  { label: "Casting Method", value: d.metal?.casting },
                ]} />
              )}
              {hasCenterStone && (
                <SpecSubGroup label="Center Stone" rows={[
                  { label: "Type",              value: d.centerStone?.type },
                  { label: "Carat Weight",      value: d.centerStone?.carat },
                  { label: "Measurements",      value: centerMeasurements },
                  { label: "Colour Grade",      value: d.centerStone?.color },
                  { label: "Clarity Grade",     value: d.centerStone?.clarity },
                  { label: "Cut Grade",         value: d.centerStone?.cut },
                  { label: "Setting Style",     value: d.centerStone?.setting },
                  { label: "Origin",            value: d.centerStone?.origin },
                  { label: "Fluorescence",      value: centerFluorescence },
                  { label: "Laboratory Report", value: certStr || undefined },
                ]} />
              )}
              {hasValue(d.accentStonesDesc) && (
                <SpecSubGroup label="Accent Stones" rows={[{ label: "Description", value: d.accentStonesDesc }]} />
              )}
              {hasValue(d.workmanshipDesc) && (
                <SpecSubGroup label="Workmanship" rows={[{ label: "Detail", value: d.workmanshipDesc }]} />
              )}
            </div>
          </div>
        )}

        {/* ── VALUATION SUMMARY ── */}
        {hasValuation && (
          <div style={{ marginBottom: "0" }}>
            <SectionTitle>Valuation Summary</SectionTitle>
            <div style={{
              background: CH, padding: "4.5mm 5.5mm",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              flexWrap: "wrap", gap: "4mm",
            }}>
              <div>
                <div style={{ fontFamily: SANS, fontSize: 6.5, color: CHX, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 4 }}>
                  {hasValue(d.valuation?.basis) ? d.valuation.basis : "Retail Replacement Value"}
                </div>
                <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, color: GD, lineHeight: 1 }}>
                  {d.valuation.amount}
                </div>
                {hasValue(d.valuation?.date) && (
                  <div style={{ fontFamily: SANS, fontSize: 7.5, color: CHX, marginTop: 5 }}>
                    Valuation date: {d.valuation.date}
                  </div>
                )}
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 11, color: "rgba(197,179,88,0.32)", letterSpacing: "0.18em", fontWeight: 700, textAlign: "right" }}>
                LESHEM.S
              </div>
            </div>
          </div>
        )}

        {/* ── VERIFICATION ── */}
        {hasVerification && (
          <div style={{ marginBottom: "3mm" }}>
            <SectionTitle>Verification</SectionTitle>
            <div style={{ display: "flex", alignItems: "center", gap: "3.5mm", padding: "3mm 4mm", background: IV2, border: "0.5px solid rgba(54,69,79,0.12)" }}>
              {hasValue(d.verification?.qrImageUrl) && (
                <img src={d.verification.qrImageUrl} alt="Verification QR"
                     style={{ width: "13mm", height: "13mm", objectFit: "contain", flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: SANS, fontSize: 6.3, fontWeight: 700, color: CHL, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 3 }}>
                  Authenticated Report
                </div>
                {hasValue(d.verification?.verificationId) && (
                  <div style={{ fontFamily: MONO, fontSize: 9.5, color: CH, letterSpacing: "0.08em" }}>
                    ID: {d.verification.verificationId}
                  </div>
                )}
                {hasValue(d.verification?.verificationUrl) && (
                  <div style={{ fontFamily: SANS, fontSize: 8, color: CHL, fontStyle: "italic", marginTop: 2 }}>
                    {d.verification.verificationUrl}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── NOTES ── */}
        {hasNotes && (
          <div style={{ marginBottom: "3mm" }}>
            <SectionTitle>Notes &amp; Remarks</SectionTitle>
            <p style={{
              fontFamily: SANS, fontSize: 10, color: CHM, lineHeight: 1.82,
              margin: 0, padding: "3mm 4mm", background: IV2,
              borderLeft: `2px solid ${GD}`, fontStyle: "italic",
            }}>
              {d.notes}
            </p>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{
          position: "absolute",
          left: "12mm",
          right: "12mm",
          bottom: "7mm",
          borderTop: "0.5px solid rgba(197,179,88,0.45)",
          paddingTop: "3mm",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "6mm",
          boxSizing: "border-box",
        }}>
          <SignatureBlock credentials={d.credentials} />

          <div style={{ textAlign: "right", maxWidth: "70mm" }}>
            {hasValue(d.credentials?.companyLine) && (
              <div style={{ fontFamily: SANS, fontSize: 6.8, color: CHL, lineHeight: 1.35, marginBottom: 3 }}>
                {d.credentials.companyLine}
              </div>
            )}
            <div style={{ fontFamily: SANS, fontSize: 6.2, color: "rgba(54,69,79,0.38)", lineHeight: 1.35, fontStyle: "italic" }}>
              This report is the professional opinion of LESHEM.S and is not a
              guarantee of value. Market conditions may affect valuation over time.
            </div>
          </div>
        </div>

      </div>{/* /content */}
    </div>
  );
}
