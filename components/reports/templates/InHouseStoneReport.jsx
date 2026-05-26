/**
 * components/reports/templates/InHouseStoneReport.jsx  —  v4.2
 *
 * LESHEM.S — In-House Stone Report
 *
 * Changes in v4.2:
 *   + productType-aware rendering — only shows fields relevant to:
 *       "natural_diamond"     → Shape, Carat, Color, Clarity, Cut, Polish,
 *                               Symmetry, Fluorescence, Measurements, Cert
 *       "lab_grown_diamond"   → same + Growth Method
 *       "fancy_color_diamond" → Shape, Carat, Fancy Color Grade, Color Origin,
 *                               Clarity, Polish, Symmetry, Fluorescence, Measurements
 *       "colored_gemstone"    → Species, Variety, Shape, Carat, Measurements,
 *                               Color Description, Transparency, Treatment, Origin
 *       (default / unknown)   → falls back to natural_diamond behavior
 *   + Multi-image support: hero + secondary strip (same as JVR)
 *   ~ dir="ltr" preserved from v1.1
 *   ~ Verification block preserved from v1.1
 *   ~ Empty-field contract (GradeRow returns null) unchanged
 *
 * Print:
 *   className="printable-container" — lib/printCss.js anchor.
 */

import { hasValue } from "../../../lib/reports/reportUtils";
import { PRODUCT_TYPE_LABELS } from "../../../lib/gemology/taxonomy";

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
const SG    = "#8aab8e";
const SGD   = "#5d8a62";

// ─── GradeRow ────────────────────────────────────────────────────────────────
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

// ─── SectionBlock ────────────────────────────────────────────────────────────
function SectionBlock({ title, children, marginBottom = "5mm" }) {
  return (
    <div style={{ marginBottom }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "2.5mm" }}>
        <div style={{ width: 2, height: 12, background: SG, borderRadius: 1, flexShrink: 0 }} />
        <span style={{ fontFamily: SANS, fontSize: 7.5, fontWeight: 700, color: CHL, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          {title}
        </span>
        <div style={{ flex: 1, height: "0.5px", background: "rgba(54,69,79,0.1)" }} />
      </div>
      {children}
    </div>
  );
}

// ─── Grade table wrapper ──────────────────────────────────────────────────────
function GradeTable({ children, stripe }) {
  return (
    <div style={{ background: stripe ? "#f4f1eb" : IV2, padding: "3mm 3.5mm" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

// ─── Grading header stripe ────────────────────────────────────────────────────
function GradingHeader() {
  return (
    <div style={{
      background:    "rgba(138,171,142,0.14)",
      margin:        "-3mm -3.5mm 3mm",
      padding:       "2mm 3.5mm",
      borderBottom:  "0.5px solid rgba(138,171,142,0.28)",
      fontFamily:    SANS, fontSize: 6.5, color: SGD,
      fontWeight:    700, letterSpacing: "0.14em", textTransform: "uppercase",
    }}>
      LESHEM.S Gemological Assessment
    </div>
  );
}

// ─── productType-specific field groups ───────────────────────────────────────

/**
 * Natural Diamond fields
 * Shape, Carat, Measurements | Color, Clarity, Cut, Polish, Symmetry, Fluorescence | Cert
 */
function NaturalDiamondFields({ st }) {
  const hasMeasurements = hasValue(st.shape) || hasValue(st.carat) || hasValue(st.measurements);
  const hasGrading      = hasValue(st.color) || hasValue(st.clarity) || hasValue(st.cut) ||
                          hasValue(st.polish) || hasValue(st.symmetry) || hasValue(st.fluorescence);
  const hasLab          = hasValue(st.certLab) || hasValue(st.certNumber);

  if (!hasMeasurements && !hasGrading && !hasLab) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4mm", marginBottom: "5mm" }}>
      {/* Left: shape + weight */}
      <div>
        {hasMeasurements && (
          <SectionBlock title="Weight & Shape" marginBottom={hasLab ? "4mm" : "0"}>
            <GradeTable>
              {hasValue(st.shape)        && <GradeRow label="Shape / Cut"   value={st.shape}        />}
              {hasValue(st.carat)        && <GradeRow label="Carat Weight"  value={`${st.carat} ct`} highlight />}
              {hasValue(st.measurements) && <GradeRow label="Measurements"  value={st.measurements} noBorder />}
            </GradeTable>
          </SectionBlock>
        )}
        {hasLab && (
          <SectionBlock title="Laboratory" marginBottom="0">
            <GradeTable>
              {hasValue(st.certLab)    && <GradeRow label="Issuing Lab"     value={st.certLab}    />}
              {hasValue(st.certNumber) && <GradeRow label="Report Number"   value={st.certNumber} highlight noBorder />}
            </GradeTable>
          </SectionBlock>
        )}
      </div>

      {/* Right: grading */}
      {hasGrading && (
        <div>
          <SectionBlock title="Grading Results" marginBottom="0">
            <div style={{ background: IV2, padding: "0 3.5mm 3mm", border: "0.5px solid rgba(138,171,142,0.28)" }}>
              <GradingHeader />
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {hasValue(st.color)       && <GradeRow label="Color Grade"   value={st.color}       highlight />}
                  {hasValue(st.clarity)     && <GradeRow label="Clarity Grade" value={st.clarity}     highlight />}
                  {hasValue(st.cut)         && <GradeRow label="Cut Grade"     value={st.cut}         />}
                  {hasValue(st.polish)      && <GradeRow label="Polish"        value={st.polish}      />}
                  {hasValue(st.symmetry)    && <GradeRow label="Symmetry"      value={st.symmetry}    />}
                  {hasValue(st.fluorescence)&& <GradeRow label="Fluorescence"  value={st.fluorescence} noBorder />}
                </tbody>
              </table>
            </div>
          </SectionBlock>
        </div>
      )}
    </div>
  );
}

/**
 * Lab-Grown Diamond — same as natural + growthMethod
 */
function LabDiamondFields({ st }) {
  const hasMeasurements = hasValue(st.shape) || hasValue(st.carat) || hasValue(st.measurements);
  const hasGrading      = hasValue(st.color) || hasValue(st.clarity) || hasValue(st.cut) ||
                          hasValue(st.polish) || hasValue(st.symmetry) || hasValue(st.fluorescence);
  const hasLab          = hasValue(st.certLab) || hasValue(st.certNumber);
  const hasGrowth       = hasValue(st.growthMethod);

  if (!hasMeasurements && !hasGrading && !hasLab && !hasGrowth) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4mm", marginBottom: "5mm" }}>
      <div>
        {hasMeasurements && (
          <SectionBlock title="Weight & Shape" marginBottom="4mm">
            <GradeTable>
              {hasValue(st.shape)        && <GradeRow label="Shape / Cut"     value={st.shape}        />}
              {hasValue(st.carat)        && <GradeRow label="Carat Weight"    value={`${st.carat} ct`} highlight />}
              {hasValue(st.measurements) && <GradeRow label="Measurements"    value={st.measurements} />}
              {hasGrowth                 && <GradeRow label="Growth Method"   value={st.growthMethod} noBorder />}
            </GradeTable>
          </SectionBlock>
        )}
        {hasLab && (
          <SectionBlock title="Laboratory" marginBottom="0">
            <GradeTable>
              {hasValue(st.certLab)    && <GradeRow label="Issuing Lab"   value={st.certLab}    />}
              {hasValue(st.certNumber) && <GradeRow label="Report Number" value={st.certNumber} highlight noBorder />}
            </GradeTable>
          </SectionBlock>
        )}
      </div>
      {hasGrading && (
        <div>
          <SectionBlock title="Grading Results" marginBottom="0">
            <div style={{ background: IV2, padding: "0 3.5mm 3mm", border: "0.5px solid rgba(138,171,142,0.28)" }}>
              <GradingHeader />
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {hasValue(st.color)       && <GradeRow label="Color Grade"   value={st.color}       highlight />}
                  {hasValue(st.clarity)     && <GradeRow label="Clarity Grade" value={st.clarity}     highlight />}
                  {hasValue(st.cut)         && <GradeRow label="Cut Grade"     value={st.cut}         />}
                  {hasValue(st.polish)      && <GradeRow label="Polish"        value={st.polish}      />}
                  {hasValue(st.symmetry)    && <GradeRow label="Symmetry"      value={st.symmetry}    />}
                  {hasValue(st.fluorescence)&& <GradeRow label="Fluorescence"  value={st.fluorescence} noBorder />}
                </tbody>
              </table>
            </div>
          </SectionBlock>
        </div>
      )}
    </div>
  );
}

/**
 * Fancy Color Diamond fields
 */
function FancyColorDiamondFields({ st }) {
  const hasMeasurements  = hasValue(st.shape) || hasValue(st.carat) || hasValue(st.measurements);
  const hasFancyColor    = hasValue(st.fancyColorHue) || hasValue(st.fancyColorIntensity) ||
                           hasValue(st.fancyColorOrigin);
  const hasGrading       = hasValue(st.clarity) || hasValue(st.polish) ||
                           hasValue(st.symmetry) || hasValue(st.fluorescence);
  const hasLab           = hasValue(st.certLab) || hasValue(st.certNumber);

  // Build fancy color grade string from components
  const fancyGradeStr = [st.fancyColorIntensity, st.fancyColorHue]
    .filter(hasValue).join(" ");

  if (!hasMeasurements && !hasFancyColor && !hasGrading && !hasLab) return null;

  return (
    <>
      {/* Two-col: measurements + fancy color grading */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4mm", marginBottom: "5mm" }}>
        <div>
          {hasMeasurements && (
            <SectionBlock title="Weight & Shape" marginBottom={hasLab ? "4mm" : "0"}>
              <GradeTable>
                {hasValue(st.shape)        && <GradeRow label="Shape / Cut"   value={st.shape}        />}
                {hasValue(st.carat)        && <GradeRow label="Carat Weight"  value={`${st.carat} ct`} highlight />}
                {hasValue(st.measurements) && <GradeRow label="Measurements"  value={st.measurements} noBorder />}
              </GradeTable>
            </SectionBlock>
          )}
          {hasLab && (
            <SectionBlock title="Laboratory" marginBottom="0">
              <GradeTable>
                {hasValue(st.certLab)    && <GradeRow label="Issuing Lab"   value={st.certLab}    />}
                {hasValue(st.certNumber) && <GradeRow label="Report Number" value={st.certNumber} highlight noBorder />}
              </GradeTable>
            </SectionBlock>
          )}
        </div>

        {/* Fancy color grading */}
        {(hasFancyColor || hasGrading) && (
          <div>
            <SectionBlock title="Colour Grading" marginBottom="0">
              <div style={{ background: IV2, padding: "0 3.5mm 3mm", border: "0.5px solid rgba(138,171,142,0.28)" }}>
                <GradingHeader />
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {hasValue(fancyGradeStr) && <GradeRow label="Fancy Colour Grade" value={fancyGradeStr} highlight />}
                    {hasValue(st.fancyColorOrigin) && <GradeRow label="Colour Origin"  value={st.fancyColorOrigin} />}
                    {hasValue(st.clarity)    && <GradeRow label="Clarity Grade"        value={st.clarity}    />}
                    {hasValue(st.polish)     && <GradeRow label="Polish"               value={st.polish}     />}
                    {hasValue(st.symmetry)   && <GradeRow label="Symmetry"             value={st.symmetry}   />}
                    {hasValue(st.fluorescence)&& <GradeRow label="Fluorescence"        value={st.fluorescence} noBorder />}
                  </tbody>
                </table>
              </div>
            </SectionBlock>
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Colored Gemstone fields
 */
function ColoredGemstoneFields({ st }) {
  const hasIdentity    = hasValue(st.species) || hasValue(st.variety);
  const hasMeasure     = hasValue(st.shape) || hasValue(st.carat) || hasValue(st.measurements);
  const hasAppearance  = hasValue(st.colorDescription) || hasValue(st.transparency);
  const hasTreatment   = hasValue(st.treatment) || hasValue(st.countryOfOrigin);

  if (!hasIdentity && !hasMeasure && !hasAppearance && !hasTreatment) return null;

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4mm", marginBottom: "5mm" }}>
        {/* Left column */}
        <div>
          {hasIdentity && (
            <SectionBlock title="Identification" marginBottom="4mm">
              <GradeTable>
                {hasValue(st.species) && <GradeRow label="Species" value={st.species} highlight />}
                {hasValue(st.variety) && <GradeRow label="Variety" value={st.variety} noBorder />}
              </GradeTable>
            </SectionBlock>
          )}
          {hasMeasure && (
            <SectionBlock title="Weight & Shape" marginBottom="0">
              <GradeTable>
                {hasValue(st.shape)        && <GradeRow label="Shape / Cut"   value={st.shape}        />}
                {hasValue(st.carat)        && <GradeRow label="Carat Weight"  value={`${st.carat} ct`} highlight />}
                {hasValue(st.measurements) && <GradeRow label="Measurements"  value={st.measurements} noBorder />}
              </GradeTable>
            </SectionBlock>
          )}
        </div>

        {/* Right column */}
        {(hasAppearance || hasTreatment) && (
          <div>
            {hasAppearance && (
              <SectionBlock title="Colour & Appearance" marginBottom="4mm">
                <div style={{ background: IV2, padding: "0 3.5mm 3mm", border: "0.5px solid rgba(138,171,142,0.28)" }}>
                  <GradingHeader />
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      {hasValue(st.colorDescription) && <GradeRow label="Colour Description" value={st.colorDescription} highlight />}
                      {hasValue(st.transparency)     && <GradeRow label="Transparency"        value={st.transparency}     noBorder />}
                    </tbody>
                  </table>
                </div>
              </SectionBlock>
            )}
            {hasTreatment && (
              <SectionBlock title="Treatment & Origin" marginBottom="0">
                <GradeTable stripe>
                  {hasValue(st.treatment)        && <GradeRow label="Treatment"         value={st.treatment}        />}
                  {hasValue(st.countryOfOrigin)  && <GradeRow label="Country of Origin" value={st.countryOfOrigin}  noBorder />}
                </GradeTable>
              </SectionBlock>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─── InHouseStoneReport ──────────────────────────────────────────────────────
export function InHouseStoneReport({ data }) {
  if (!data) return null;
  const d  = data;
  const st = d.stone || {};

  // Resolve productType — default to natural_diamond for backwards compat
  const pt = d.productType || "natural_diamond";
  const ptLabel = PRODUCT_TYPE_LABELS[pt] || "Stone Report";

  // Multi-image
  const images = Array.isArray(d.images) ? d.images.filter(Boolean) : (d.images ? [d.images] : []);
  const heroImg       = images[0] || null;
  const secondaryImgs = images.slice(1, 4);
  const hasImages     = images.length > 0;

  const hasExtReports =
    Array.isArray(d.externalReports) && d.externalReports.length > 0 &&
    d.externalReports.some((r) => hasValue(r.lab) || hasValue(r.reportNumber));
  const hasComments   = hasValue(d.comments);
  const hasVerification =
    hasValue(d.verification?.verificationId) ||
    hasValue(d.verification?.verificationUrl);

  return (
    <div
      className="printable-container"
      dir="ltr"
      style={{
        width: "210mm", maxWidth: "100%", minHeight: "297mm",
        background: IV, fontFamily: SANS, color: CH,
        position: "relative", overflow: "hidden",
        boxSizing: "border-box", margin: "0 auto",
      }}
    >
      {/* Watermark */}
      <div aria-hidden="true" style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%) rotate(-20deg)",
        fontFamily: SERIF, fontSize: 220, fontWeight: 700,
        color: "rgba(54,69,79,0.02)", userSelect: "none",
        pointerEvents: "none", lineHeight: 1, zIndex: 0, whiteSpace: "nowrap",
      }}>LS</div>

      {/* Sage strip */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${SGD} 0%, ${SG} 60%, #b0c8b2 100%)` }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, padding: "10mm 14mm 12mm" }}>

        {/* ── HEADER ── */}
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
              In-House Stone Report
            </div>
            {/* productType label — shown as sub-label */}
            <div style={{ fontFamily: SANS, fontSize: 7.5, color: SG, letterSpacing: "0.12em", marginTop: 3, textTransform: "uppercase" }}>
              {ptLabel}
            </div>
            {hasValue(d.reportNumber) && (
              <div style={{ fontFamily: SANS, fontSize: 8.5, color: CHL, marginTop: 4, letterSpacing: "0.04em" }}>
                Report No. <span style={{ color: CH, fontWeight: 600 }}>{d.reportNumber}</span>
              </div>
            )}
            {hasValue(d.reportDate) && (
              <div style={{ fontFamily: SANS, fontSize: 8, color: CHL, marginTop: 2 }}>{d.reportDate}</div>
            )}
          </div>
        </div>

        {/* Sage rule */}
        <div style={{ height: "1px", background: SG, marginBottom: "5mm" }} />

        {/* ── IMAGES ── */}
        {hasImages && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "5mm", flexDirection: "column", alignItems: "center", gap: "2mm" }}>
            {/* Hero */}
            <div style={{
              width: "55mm", height: "55mm",
              border: "0.5px solid rgba(54,69,79,0.16)", background: IV2,
              overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <img src={heroImg} alt="stone" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>

            {/* Secondary strip */}
            {secondaryImgs.length > 0 && (
              <div style={{ display: "flex", gap: "2mm" }}>
                {secondaryImgs.map((src, i) => (
                  <div key={i} style={{
                    width: "17mm", height: "17mm",
                    border: "0.5px solid rgba(54,69,79,0.12)", background: IV2,
                    overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <img src={src} alt={`view ${i + 2}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PRODUCT-TYPE CONDITIONAL FIELDS ── */}
        {(pt === "natural_diamond") && <NaturalDiamondFields st={st} />}
        {(pt === "lab_grown_diamond") && <LabDiamondFields st={st} />}
        {(pt === "fancy_color_diamond") && <FancyColorDiamondFields st={st} />}
        {(pt === "colored_gemstone") && <ColoredGemstoneFields st={st} />}

        {/* Unknown productType: fall back to natural diamond */}
        {!["natural_diamond","lab_grown_diamond","fancy_color_diamond","colored_gemstone"].includes(pt) && (
          <NaturalDiamondFields st={st} />
        )}

        {/* Divider */}
        {(hasExtReports || hasComments || hasVerification) && (
          <div style={{ height: "0.5px", background: "rgba(54,69,79,0.08)", marginBottom: "4mm" }} />
        )}

        {/* ── EXTERNAL REPORTS ── */}
        {hasExtReports && (
          <SectionBlock title="External Lab Reports">
            {d.externalReports
              .filter((r) => hasValue(r.lab) || hasValue(r.reportNumber))
              .map((rpt, idx) => (
                <div key={idx} style={{
                  display: "flex", gap: "4mm", padding: "2.5mm 3.5mm",
                  background: idx % 2 === 0 ? IV2 : "#f4f1eb",
                  alignItems: "center", flexWrap: "wrap",
                }}>
                  {hasValue(rpt.lab) && (
                    <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: CH, letterSpacing: "0.04em" }}>
                      {rpt.lab}
                    </span>
                  )}
                  {hasValue(rpt.reportNumber) && (
                    <span style={{ fontFamily: SANS, fontSize: 10, color: CHM }}>No. {rpt.reportNumber}</span>
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

        {/* ── COMMENTS ── */}
        {hasComments && (
          <SectionBlock title="Comments">
            <p style={{
              fontFamily: SANS, fontSize: 10.5, color: CHM, lineHeight: 1.82,
              margin: 0, padding: "3mm 4mm", background: IV2,
              borderLeft: `2px solid ${SG}`, fontStyle: "italic",
            }}>
              {d.comments}
            </p>
          </SectionBlock>
        )}

        {/* ── VERIFICATION ── */}
        {hasVerification && (
          <SectionBlock title="Verification">
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
          </SectionBlock>
        )}

        {/* ── FOOTER ── */}
        <div style={{
          borderTop: "0.5px solid rgba(138,171,142,0.55)", paddingTop: "4.5mm", marginTop: "4mm",
          display: "flex", justifyContent: "space-between", alignItems: "flex-end",
          flexWrap: "wrap", gap: "5mm",
        }}>
          <div>
            <div style={{ width: "40mm", height: "0.5px", background: "rgba(54,69,79,0.28)", marginBottom: 6 }} />
            {hasValue(d.credentials?.signatoryName) && (
              <div style={{ fontFamily: SERIF, fontSize: 11, color: CH, fontStyle: "italic", lineHeight: 1.3 }}>
                {d.credentials.signatoryName}
              </div>
            )}
            {hasValue(d.credentials?.title) && (
              <div style={{ fontFamily: SANS, fontSize: 7.5, color: CHL, letterSpacing: "0.07em", textTransform: "uppercase", marginTop: 3, lineHeight: 1.45 }}>
                {d.credentials.title}
              </div>
            )}
          </div>
          <div style={{ textAlign: "right", maxWidth: "70mm" }}>
            {hasValue(d.credentials?.companyLine) && (
              <div style={{ fontFamily: SANS, fontSize: 8, color: CHL, lineHeight: 1.55, marginBottom: 5 }}>
                {d.credentials.companyLine}
              </div>
            )}
            <div style={{ fontFamily: SANS, fontSize: 7, color: "rgba(54,69,79,0.38)", lineHeight: 1.65, fontStyle: "italic" }}>
              This report reflects the professional assessment of LESHEM.S
              and is provided for informational purposes only.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
