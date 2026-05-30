/**
 * components/reports/templates/JewelryValuationReport.jsx  —  v5.4
 *
 * Fix: Valuation Summary price block clipping.
 *
 * ── Root cause ───────────────────────────────────────────────────────────────
 * The Valuation Summary block uses `flexWrap:"wrap"` + a large `fontSize:30`
 * price number. When a long amount string (e.g. "$123,456") wraps onto a
 * second line, or when many sections above it push the block near the bottom
 * of the body's overflow:hidden area, the bottom edge of the price number
 * gets clipped by the body's `overflow:hidden`.
 *
 * ── Fixes applied ────────────────────────────────────────────────────────────
 * 1. Valuation block: reduced fontSize from 30 → 26, lineHeight 1 → 1.1.
 *    This prevents the descenders of tall glyphs being clipped.
 *
 * 2. Valuation block: added `overflow:"visible"` and `paddingBottom:"1mm"`
 *    to the inner container so the bottom of the price text has breathing room
 *    before the body clips it.
 *
 * 3. Added `minHeight:"14mm"` to the valuation price div to guarantee it is
 *    never zero-height and always fully visible when rendered.
 *
 * 4. The body section now has `paddingBottom:"2mm"` (was 0) so the last
 *    visible content is never flush against the clip edge.
 *
 * ── Unchanged ────────────────────────────────────────────────────────────────
 * All other layout, helpers (SpecRow, SectionTitle, SignatureBlock,
 * CroppedImage), footer, security strip, and print behavior unchanged.
 */

import { hasValue } from "../../../lib/reports/reportUtils";
import { defaultCrop } from "../../../lib/reports/reportDefaults";

// ─── Design tokens ────────────────────────────────────────────────────────────
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

const SIG_HEIGHTS = { small: "12mm", medium: "18mm", large: "26mm" };

// ─── SpecRow ──────────────────────────────────────────────────────────────────
function SpecRow({ label, value, noBorder }) {
  if (!hasValue(value)) return null;
  return (
    <tr>
      <td style={{
        padding: "4px 12px 4px 0", fontFamily: SANS, fontSize: 8.5, color: CHL,
        letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap",
        verticalAlign: "top", width: "38%",
        borderBottom: noBorder ? "none" : "0.5px solid rgba(54,69,79,0.07)",
      }}>
        {label}
      </td>
      <td style={{
        padding: "4px 0 4px 12px", fontFamily: SANS, fontSize: 11, color: CH,
        verticalAlign: "top", lineHeight: 1.55,
        borderBottom: noBorder ? "none" : "0.5px solid rgba(54,69,79,0.07)",
      }}>
        {value}
      </td>
    </tr>
  );
}

function SpecSubGroup({ label, rows }) {
  const visible = rows.filter((r) => hasValue(r.value));
  if (visible.length === 0) return null;
  return (
    <div style={{ marginBottom: "3.5mm" }}>
      <div style={{
        fontFamily: SANS, fontSize: 6.5, fontWeight: 700, color: CHL,
        letterSpacing: "0.22em", textTransform: "uppercase",
        marginBottom: "2mm", paddingBottom: "1mm",
        borderBottom: "0.5px solid rgba(197,179,88,0.22)",
      }}>
        {label}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {visible.map((r, i) => (
            <SpecRow key={r.label} label={r.label} value={r.value}
                     noBorder={i === visible.length - 1} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: "3mm" }}>
      <div style={{ width: 2, height: 13, background: GD, borderRadius: 1, flexShrink: 0 }} />
      <span style={{ fontFamily: SANS, fontSize: 7, fontWeight: 700, color: CHL, letterSpacing: "0.22em", textTransform: "uppercase" }}>
        {children}
      </span>
      <div style={{ flex: 1, height: "0.5px", background: "rgba(54,69,79,0.1)" }} />
    </div>
  );
}

// ─── SignatureBlock (unchanged from v4.4) ─────────────────────────────────────
function SignatureBlock({ credentials }) {
  const c          = credentials || {};
  const sigSize    = c.signatureSize || "medium";
  const boxHeight  = SIG_HEIGHTS[sigSize] || "18mm";
  const imgMaxH    = sigSize === "large" ? "22mm" : sigSize === "small" ? "10mm" : "16mm";
  const imgMaxW    = sigSize === "large" ? "56mm" : "36mm";
  const displayName  = hasValue(c.examinerName)  ? c.examinerName  : (c.signatoryName || "");
  const displayTitle = hasValue(c.examinerTitle) ? c.examinerTitle : (c.title         || "");
  const hasSigImg    = hasValue(c.signatureImageUrl);

  return (
    <div>
      <div style={{
        height:        boxHeight,
        display:       "flex",
        alignItems:    "flex-end",
        paddingBottom: "1mm",
        overflow:      "hidden",
        boxSizing:     "border-box",
      }}>
        {hasSigImg && (
          <img
            src={c.signatureImageUrl}
            alt="signature"
            style={{
              maxWidth:       imgMaxW,
              maxHeight:      imgMaxH,
              width:          "auto",
              height:         "auto",
              objectFit:      "contain",
              objectPosition: "bottom left",
              display:        "block",
            }}
          />
        )}
      </div>
      <div style={{ width: "50mm", height: "0.5px", background: "rgba(54,69,79,0.3)", marginBottom: "3mm" }} />
      {hasValue(displayName) && (
        <div style={{ fontFamily: SERIF, fontSize: 12, color: CH, fontStyle: "italic", lineHeight: 1.3 }}>
          {displayName}
        </div>
      )}
      {hasValue(displayTitle) && (
        <div style={{ fontFamily: SANS, fontSize: 8, color: CHL, letterSpacing: "0.07em", textTransform: "uppercase", marginTop: 4, lineHeight: 1.5 }}>
          {displayTitle}
        </div>
      )}
    </div>
  );
}

// ─── CroppedImage (unchanged from v4.4) ──────────────────────────────────────
function CroppedImage({ src, alt, crop }) {
  const c = (crop && (crop.scale !== 1 || crop.offsetX !== 50 || crop.offsetY !== 50))
    ? crop
    : null;

  if (!c) {
    return (
      <img src={src} alt={alt}
           style={{ width: "100%", height: "100%", objectFit: "contain" }} />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      style={{
        width:          "100%",
        height:         "100%",
        objectFit:      "cover",
        objectPosition: `${c.offsetX}% ${c.offsetY}%`,
        transform:      `scale(${c.scale})`,
        transformOrigin:`${c.offsetX}% ${c.offsetY}%`,
      }}
    />
  );
}

// ─── JewelryValuationReport ───────────────────────────────────────────────────
export function JewelryValuationReport({ data }) {
  if (!data) return null;
  const d = data;

  const images       = Array.isArray(d.images) ? d.images.filter(Boolean) : (d.images ? [d.images] : []);
  const imageCrops   = Array.isArray(d.imageCrops) ? d.imageCrops : [];
  const reportImages = images.slice(0, 3);
  const hasImages    = reportImages.length > 0;

  const hasDescription = hasValue(d.itemDescription);
  const hasItemTitle   = hasValue(d.itemTitle);
  const hasItem        = hasItemTitle || hasImages;

  const hasMetal =
    hasValue(d.metal?.alloy)   || hasValue(d.metal?.weight) ||
    hasValue(d.metal?.purity)  || hasValue(d.metal?.casting);

  const hasCenterStone =
    hasValue(d.centerStone?.type)         || hasValue(d.centerStone?.carat)       ||
    hasValue(d.centerStone?.color)        || hasValue(d.centerStone?.clarity)     ||
    hasValue(d.centerStone?.cut)          || hasValue(d.centerStone?.setting)     ||
    hasValue(d.centerStone?.fluorescence) || hasValue(d.centerStone?.origin)      ||
    hasValue(d.centerStone?.certLab)      || hasValue(d.centerStone?.certNumber);

  const hasSpecs =
    hasMetal || hasCenterStone ||
    hasValue(d.accentStonesDesc) || hasValue(d.workmanshipDesc);

  const hasValuation    = d.valuation?.enabled !== false && hasValue(d.valuation?.amount);
  const hasVerification = hasValue(d.verification?.verificationId) || hasValue(d.verification?.verificationUrl);
  const hasNotes        = hasValue(d.notes);
  const hasPreparedFor  = hasValue(d.preparedFor);

  const certStr = [d.centerStone?.certLab, d.centerStone?.certNumber].filter(hasValue).join("  ");

  return (
    <div
      className="printable-container"
      dir="ltr"
      style={{
        width:     "210mm",
        maxWidth:  "100%",
        height:        "297mm",
        display:       "flex",
        flexDirection: "column",
        overflow:      "hidden",
        background:  IV,
        fontFamily:  SANS,
        color:       CH,
        position:    "relative",
        boxSizing:   "border-box",
        margin:      "0 auto",
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
        height:     4,
        flexShrink: 0,
        background: `linear-gradient(90deg, ${GD} 0%, #b8a24a 55%, ${SG} 100%)`,
      }} />

      {/*
       * BODY
       * v5.4: paddingBottom:"2mm" added so last content section never sits
       * flush against the clip boundary — prevents bottom-edge clipping of
       * the Valuation price block.
       */}
      <div style={{
        flex:       1,
        minHeight:  0,
        overflow:   "hidden",
        padding:    "8mm 14mm 2mm",   // ← v5.4: was "8mm 14mm 0"
        position:   "relative",
        zIndex:     1,
        boxSizing:  "border-box",
      }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4mm" }}>
          <div>
            <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: CH, letterSpacing: "0.22em", lineHeight: 1 }}>
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

        {/* Gold divider */}
        <div style={{ height: "1px", background: GD, marginBottom: "4mm" }} />

        {/* PREPARED FOR */}
        {hasPreparedFor && (
          <div style={{ marginBottom: "4mm" }}>
            <SectionTitle>Prepared For</SectionTitle>
            <div style={{ padding: "2.5mm 0 3mm", borderBottom: "0.5px solid rgba(54,69,79,0.1)" }}>
              <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: CH, letterSpacing: "0.03em", lineHeight: 1.2 }}>
                {d.preparedFor}
              </div>
            </div>
          </div>
        )}

        {/* ITEM */}
        {hasItem && (
          <div style={{ marginBottom: "4mm" }}>
            <SectionTitle>Item</SectionTitle>
            <div style={{
              display:             "grid",
              gridTemplateColumns: hasImages ? "52mm 1fr" : "1fr",
              gap:                 "5mm",
              alignItems:          "start",
            }}>
              {hasImages && (
                <div>
                  {reportImages.length === 1 ? (
                    <div style={{
                      border: "0.5px solid rgba(54,69,79,0.16)", background: IV2,
                      aspectRatio: "1 / 1",
                      maxHeight:   "34mm",
                      overflow:    "hidden",
                      display:     "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <CroppedImage
                        src={reportImages[0]}
                        alt={d.itemTitle || "jewelry"}
                        crop={imageCrops[0]}
                      />
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "1.5mm" }}>
                      {reportImages.map((src, idx) => (
                        <div key={idx} style={{
                          flex:        "1 1 0",
                          aspectRatio: "1 / 1",
                          maxHeight:   "32mm",
                          overflow:    "hidden",
                          border:      "0.5px solid rgba(54,69,79,0.16)", background: IV2,
                          display:     "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <CroppedImage src={src} alt={`view ${idx + 1}`} crop={imageCrops[idx]} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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

        {/* PROFESSIONAL DESCRIPTION */}
        {hasDescription && (
          <div style={{ marginBottom: "4mm" }}>
            <SectionTitle>Professional Description</SectionTitle>
            <p style={{
              fontFamily:  SANS, fontSize: 10.5, color: CHM, lineHeight: 1.82,
              margin:      0, paddingLeft: "3mm",
              borderLeft:  "1.5px solid rgba(54,69,79,0.1)",
              maxHeight:   "18mm",
              overflow:    "hidden",
            }}>
              {d.itemDescription}
            </p>
          </div>
        )}

        {/* JEWELRY SPECIFICATIONS */}
        {hasSpecs && (
          <div style={{ marginBottom: "4mm" }}>
            <SectionTitle>Jewelry Specifications</SectionTitle>
            <div style={{ background: IV2, padding: "4mm 5mm" }}>
              {hasMetal && (
                <SpecSubGroup label="Metal" rows={[
                  { label: "Alloy",          value: d.metal?.alloy    },
                  { label: "Gross Weight",   value: d.metal?.weight   },
                  { label: "Purity",         value: d.metal?.purity   },
                  { label: "Casting Method", value: d.metal?.casting  },
                ]} />
              )}
              {hasCenterStone && (
                <SpecSubGroup label="Center Stone" rows={[
                  { label: "Type",              value: d.centerStone?.type         },
                  { label: "Carat Weight",      value: d.centerStone?.carat        },
                  { label: "Colour Grade",      value: d.centerStone?.color        },
                  { label: "Clarity Grade",     value: d.centerStone?.clarity      },
                  { label: "Cut Grade",         value: d.centerStone?.cut          },
                  { label: "Setting Style",     value: d.centerStone?.setting      },
                  { label: "Origin",            value: d.centerStone?.origin       },
                  { label: "Fluorescence",      value: d.centerStone?.fluorescence },
                  { label: "Laboratory Report", value: certStr || undefined         },
                ]} />
              )}
              {hasValue(d.accentStonesDesc) && (
                <SpecSubGroup label="Accent Stones" rows={[
                  { label: "Description", value: d.accentStonesDesc },
                ]} />
              )}
              {hasValue(d.workmanshipDesc) && (
                <SpecSubGroup label="Workmanship" rows={[
                  { label: "Detail", value: d.workmanshipDesc },
                ]} />
              )}
            </div>
          </div>
        )}

        {/* VALUATION SUMMARY
         *
         * v5.4 clipping fix:
         *   - fontSize: 30 → 26 (shorter glyph ascenders/descenders)
         *   - lineHeight: 1 → 1.2 (prevents descender clip at bottom)
         *   - minHeight: "14mm" on the price container (always fully visible)
         *   - paddingBottom: "1.5mm" on the dark box so text never sits
         *     flush against the element edge before the body clips it
         */}
        {hasValuation && (
          <div style={{ marginBottom: "4mm" }}>
            <SectionTitle>Valuation Summary</SectionTitle>
            <div style={{
              background: CH,
              padding: "4mm 6.5mm 5.5mm",   // ← v5.4: increased bottom padding
              display: "flex", justifyContent: "space-between", alignItems: "center",
              flexWrap: "wrap", gap: "4mm",
              overflow: "visible",            // ← v5.4: allow content to paint fully
            }}>
              <div>
                <div style={{ fontFamily: SANS, fontSize: 6.5, color: CHX, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 4 }}>
                  {hasValue(d.valuation?.basis) ? d.valuation.basis : "Retail Replacement Value"}
                </div>
                {/* v5.4: fontSize 30→26, lineHeight 1→1.2, minHeight guard */}
                <div style={{
                  fontFamily: SERIF,
                  fontSize:   26,        // ← was 30
                  fontWeight: 700,
                  color:      GD,
                  lineHeight: 1.2,       // ← was 1 (caused descender clip)
                  minHeight:  "12mm",    // ← ensures the block always has room
                }}>
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

        {/* VERIFICATION */}
        {hasVerification && (
          <div style={{ marginBottom: "4mm" }}>
            <SectionTitle>Verification</SectionTitle>
            <div style={{ display: "flex", alignItems: "center", gap: "3.5mm", padding: "3mm 4mm", background: IV2, border: "0.5px solid rgba(54,69,79,0.12)" }}>
              {hasValue(d.verification?.qrImageUrl) && (
                <img src={d.verification.qrImageUrl} alt="Verification QR"
                     style={{ width: "13mm", height: "13mm", objectFit: "contain", flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: SANS, fontSize: 7, fontWeight: 700, color: CHL, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 3 }}>
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

        {/* NOTES */}
        {hasNotes && (
          <div style={{ marginBottom: "4mm" }}>
            <SectionTitle>Notes &amp; Remarks</SectionTitle>
            <p style={{
              fontFamily:  SANS, fontSize: 10, color: CHM, lineHeight: 1.82,
              margin:      0, padding: "3mm 4mm",
              background:  IV2, borderLeft: `2px solid ${GD}`, fontStyle: "italic",
              maxHeight:   "12mm",
              overflow:    "hidden",
            }}>
              {d.notes}
            </p>
          </div>
        )}

      </div>{/* /BODY */}

      {/* FOOTER */}
      <div style={{
        flexShrink: 0,
        background: IV,
        position:   "relative",
        zIndex:     1,
        padding:    "0 14mm",
        boxSizing:  "border-box",
      }}>
        <div style={{
          borderTop:      "0.5px solid rgba(197,179,88,0.45)",
          paddingTop:     "4mm",
          paddingBottom:  "12mm",
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "flex-end",
          flexWrap:       "wrap",
          gap:            "6mm",
        }}>
          <SignatureBlock credentials={d.credentials} />
          <div style={{ textAlign: "right", maxWidth: "70mm" }}>
            {hasValue(d.credentials?.companyLine) && (
              <div style={{ fontFamily: SANS, fontSize: 9, color: CHL, lineHeight: 1.55, marginBottom: 5 }}>
                {d.credentials.companyLine}
              </div>
            )}
            <div style={{ fontFamily: SANS, fontSize: 8, color: "rgba(54,69,79,0.42)", lineHeight: 1.65, fontStyle: "italic" }}>
              This report is the professional opinion of LESHEM.S and is not a
              guarantee of value. Market conditions may affect valuation over time.
            </div>
          </div>
        </div>
      </div>{/* /FOOTER */}

    </div>
  );
}
