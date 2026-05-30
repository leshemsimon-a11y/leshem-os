/**
 * components/reports/templates/InHouseStoneReport.jsx  —  v5.4.2
 *
 * Changes from v5.4.1:
 *
 * Language normalization (Milestone 5.4.2):
 *   Every stone data value that reaches a rendered cell is passed through
 *   sanitizeForReport() — a final guard that calls toReportEn() to ensure
 *   no Hebrew ever appears inside the certificate.
 *
 *   Stone type:
 *     "יהלום" or "יהלום טבעי" → "Diamond"
 *     "ספיר"                   → "Sapphire"
 *     Already "Diamond"        → "Diamond" (unchanged)
 *
 *   This guard runs at RENDER time, not only at build time, so it catches
 *   values from any path (inventory bridge, manual report editor, demo items).
 *
 *   ClassificationSection now applies toReportEn() to every value before
 *   rendering, giving a double layer of protection.
 *
 *   getProductSubtitle() now derives the subtitle from toReportEn() with
 *   a canonical switch, ensuring "Stone Parcel · Melee" never says
 *   "Matched Pair" even for unknown productType strings.
 *
 * All field groups, layout, ReferencePanel, SignatureBlock — unchanged.
 */

import {
  hasValue,
  formatMeasurements,
  formatFluorescence,
  formatCutForm,
} from "../../../lib/reports/reportUtils";

import { PRODUCT_TYPE_LABELS } from "../../../lib/gemology/taxonomy";
import { toReportEn, toCanonical, isHebrew } from "../../../lib/labels/productLabels";

// ─── Design tokens ────────────────────────────────────────────────────────────
const SERIF = "'Merriweather','Times New Roman',Georgia,serif";
const SANS  = "'DM Sans',Helvetica,Arial,sans-serif";
const MONO  = "'Courier New',Courier,monospace";
const CH    = "#36454F";
const CHM   = "#4a5c68";
const CHL   = "#7a8e98";
const IV    = "#FAF9F6";
const IV2   = "#F0EDE8";
const SG    = "#8aab8e";
const SGD   = "#5d8a62";

// ─── sanitizeForReport ────────────────────────────────────────────────────────
/**
 * v5.4.2: Final English guard for any value that reaches a certificate cell.
 *
 * - Calls toReportEn() to map Hebrew/canonical values to English.
 * - If a value is already English (no Hebrew chars) and not in the map,
 *   it passes through unchanged.
 * - Hebrew values with no mapping return "" so the cell is skipped.
 *
 * Use on every string field from d.stone before rendering in a GradeRow.
 */
function sanitizeForReport(value) {
  if (!value) return value;
  return toReportEn(String(value));
}

// ─── GradeRow ─────────────────────────────────────────────────────────────────
function GradeRow({ label, value, highlight, noBorder }) {
  if (!hasValue(value)) return null;
  return (
    <tr>
      <td style={{
        padding: "5px 12px 5px 0", fontFamily: SANS, fontSize: 8.5, color: CHL,
        letterSpacing: "0.09em", textTransform: "uppercase", whiteSpace: "nowrap",
        verticalAlign: "top", width: "42%",
        borderBottom: noBorder ? "none" : "0.5px solid rgba(54,69,79,0.07)",
      }}>
        {label}
      </td>
      <td style={{
        padding: "5px 0 5px 12px", fontFamily: SANS,
        fontSize: highlight ? 13 : 11.5, fontWeight: highlight ? 700 : 400,
        color: highlight ? CH : CHM, verticalAlign: "top", lineHeight: 1.5,
        borderBottom: noBorder ? "none" : "0.5px solid rgba(54,69,79,0.07)",
      }}>
        {value}
      </td>
    </tr>
  );
}

// ─── SectionBlock ─────────────────────────────────────────────────────────────
function SectionBlock({ title, children, marginBottom = "5mm" }) {
  return (
    <div style={{ marginBottom }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "2.5mm" }}>
        <div style={{ width: 2, height: 12, background: SG, borderRadius: 1, flexShrink: 0 }} />
        <span style={{
          fontFamily: SANS, fontSize: 7.5, fontWeight: 700, color: CHL,
          letterSpacing: "0.2em", textTransform: "uppercase",
        }}>
          {title}
        </span>
        <div style={{ flex: 1, height: "0.5px", background: "rgba(54,69,79,0.1)" }} />
      </div>
      {children}
    </div>
  );
}

function GradeTable({ children, stripe }) {
  return (
    <div style={{ background: stripe ? "#f4f1eb" : IV2, padding: "3mm 3.5mm" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function GradingHeader() {
  return (
    <div style={{
      background: "rgba(138,171,142,0.14)", margin: "0 -3.5mm", padding: "2mm 3.5mm",
      marginBottom: "3mm", borderBottom: "0.5px solid rgba(138,171,142,0.28)",
      fontFamily: SANS, fontSize: 6.5, color: SGD, fontWeight: 700,
      letterSpacing: "0.14em", textTransform: "uppercase",
    }}>
      LESHEM.S Gemological Assessment
    </div>
  );
}

function GradingBlock({ children }) {
  return (
    <div style={{ background: IV2, padding: "0 3.5mm 3mm", border: "0.5px solid rgba(138,171,142,0.28)" }}>
      <GradingHeader />
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

// ─── ClassificationSection (v5.4.2) ──────────────────────────────────────────
/**
 * Shows the product/stone hierarchy for the report.
 * Only renders rows that have actual values.
 * v5.4.2: Each value is passed through toReportEn() so no Hebrew appears.
 */
function ClassificationSection({ classification, productType }) {
  const cl = classification || {};

  // Apply toReportEn to every value before building rows
  const rawRows = [
    { label: "Product Category",  value: cl.productCategory  },
    // stoneCategory is omitted from the rendered row list — it duplicates
    // productCategory for diamond types. See buildStoneClassification().
    { label: "Stone Type",        value: cl.stoneType        },
    { label: "Form",              value: cl.formFactor       },
    { label: "Quantity",          value: cl.quantity         },
    { label: "Growth Method",     value: cl.growthMethod     },
    { label: "Intended Use",      value: cl.intendedUse      },
    { label: "Inventory Layer",   value: cl.inventoryLayer   },
  ];

  // Filter to rows with values, applying English guard on each
  const rows = rawRows
    .map(r => ({ ...r, value: r.value ? toReportEn(String(r.value)) || r.value : null }))
    .filter(r => hasValue(r.value) && !isHebrew(r.value));

  if (rows.length === 0) return null;

  return (
    <SectionBlock title="Stone Classification" marginBottom="5mm">
      <div style={{
        border: "0.5px solid rgba(138,171,142,0.35)",
        overflow: "hidden",
      }}>
        {rows.map((row, i) => (
          <div
            key={row.label}
            style={{
              display: "flex", gap: 0, alignItems: "stretch",
              background: i % 2 === 0 ? IV2 : IV,
              borderBottom: i < rows.length - 1 ? "0.5px solid rgba(54,69,79,0.06)" : "none",
            }}
          >
            <div style={{
              width: "38%", padding: "4px 10px", flexShrink: 0,
              fontFamily: SANS, fontSize: 8.5, color: CHL,
              letterSpacing: "0.09em", textTransform: "uppercase",
              display: "flex", alignItems: "center",
              borderRight: "0.5px solid rgba(54,69,79,0.07)",
            }}>
              {row.label}
            </div>
            <div style={{
              flex: 1, padding: "4px 10px",
              fontFamily: SANS, fontSize: 11.5, fontWeight: i === 0 ? 700 : 400, color: CH,
              display: "flex", alignItems: "center",
            }}>
              {row.value}
            </div>
          </div>
        ))}
      </div>
    </SectionBlock>
  );
}

// ─── SignatureBlock ───────────────────────────────────────────────────────────
function SignatureBlock({ credentials }) {
  const c            = credentials || {};
  const displayName  = hasValue(c.examinerName)  ? c.examinerName  : (c.signatoryName || "");
  const displayTitle = hasValue(c.examinerTitle) ? c.examinerTitle : (c.title         || "");
  const hasSigImg    = hasValue(c.signatureImageUrl);

  return (
    <div>
      <div style={{ height: "18mm", display: "flex", alignItems: "flex-end", paddingBottom: "1mm", overflow: "hidden", boxSizing: "border-box" }}>
        {hasSigImg && (
          <img src={c.signatureImageUrl} alt="signature"
               style={{ maxWidth: "36mm", maxHeight: "16mm", width: "auto", height: "auto", objectFit: "contain", objectPosition: "bottom left", display: "block" }} />
        )}
      </div>
      <div style={{ width: "50mm", height: "0.5px", background: "rgba(54,69,79,0.3)", marginBottom: "3mm" }} />
      {hasValue(displayName) && (
        <div style={{ fontFamily: SERIF, fontSize: 12, color: CH, fontStyle: "italic", lineHeight: 1.3 }}>
          {displayName}
        </div>
      )}
      {hasValue(displayTitle) && (
        <div style={{ fontFamily: SANS, fontSize: 7.5, color: CHL, letterSpacing: "0.07em", textTransform: "uppercase", marginTop: 4, lineHeight: 1.5 }}>
          {displayTitle}
        </div>
      )}
    </div>
  );
}

// ─── ReferencePanel ───────────────────────────────────────────────────────────
const PANEL_STYLE = { border: "0.5px solid rgba(138,171,142,0.35)", background: "rgba(240,237,232,0.55)", padding: "3.5mm 4.5mm", marginBottom: "5mm" };
const PANEL_TITLE = { fontFamily: SANS, fontSize: 6.5, fontWeight: 700, color: CHL, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "3mm", paddingBottom: "1.5mm", borderBottom: "0.5px solid rgba(138,171,142,0.3)" };
const PANEL_ROW   = { display: "flex", gap: "3mm", alignItems: "baseline", marginBottom: "2mm" };
const PANEL_LABEL = { fontFamily: SANS, fontSize: 7, fontWeight: 700, color: CHL, letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap", width: "18mm", flexShrink: 0 };
const PANEL_VALUE = { fontFamily: SANS, fontSize: 7.5, color: CHM, lineHeight: 1.55 };

function ReferencePanel({ productType }) {
  if (productType === "natural_diamond" || productType === "stone_pair_set") {
    return (
      <div style={PANEL_STYLE}>
        <div style={PANEL_TITLE}>Diamond Quality Reference</div>
        <div style={PANEL_ROW}><span style={PANEL_LABEL}>Colour</span><span style={PANEL_VALUE}>D–F Colorless · G–J Near Colorless · K–M Faint · N–R Very Light · S–Z Light</span></div>
        <div style={PANEL_ROW}><span style={PANEL_LABEL}>Clarity</span><span style={PANEL_VALUE}>FL · IF · VVS1–VVS2 (Eye Clean) · VS1–VS2 (Eye Clean) · SI1–SI2 · I1–I2–I3</span></div>
        <div style={{ ...PANEL_ROW, marginBottom: 0 }}><span style={PANEL_LABEL}>Cut</span><span style={PANEL_VALUE}>Excellent · Very Good · Good · Fair · Poor — applies to Round Brilliant shape</span></div>
      </div>
    );
  }
  if (productType === "lab_grown_diamond") {
    return (
      <div style={PANEL_STYLE}>
        <div style={PANEL_TITLE}>Laboratory-Grown Diamond Notes</div>
        <div style={PANEL_ROW}><span style={PANEL_LABEL}>Growth Methods</span><span style={PANEL_VALUE}>CVD — Chemical Vapor Deposition · HPHT — High Pressure High Temperature</span></div>
        <div style={PANEL_ROW}><span style={PANEL_LABEL}>Grading</span><span style={PANEL_VALUE}>Identical 4C grading standards apply · Certifiable by IGI, GIA, and other laboratories</span></div>
        <div style={{ ...PANEL_ROW, marginBottom: 0 }}><span style={PANEL_LABEL}>Properties</span><span style={PANEL_VALUE}>Identical chemical, physical, and optical properties to natural diamond · Origin determinable by advanced testing</span></div>
      </div>
    );
  }
  if (productType === "fancy_color_diamond") {
    return (
      <div style={PANEL_STYLE}>
        <div style={PANEL_TITLE}>Fancy Colour Grading Reference</div>
        <div style={PANEL_ROW}><span style={PANEL_LABEL}>Intensity Scale</span><span style={PANEL_VALUE}>Faint · Very Light · Light · Fancy Light · Fancy · Fancy Intense · Fancy Vivid · Fancy Deep · Fancy Dark</span></div>
        <div style={PANEL_ROW}><span style={PANEL_LABEL}>Primary Hues</span><span style={PANEL_VALUE}>Yellow · Pink · Blue · Green · Orange · Purple · Red · Brown · Gray · Black</span></div>
        <div style={{ ...PANEL_ROW, marginBottom: 0 }}><span style={PANEL_LABEL}>Value Factors</span><span style={PANEL_VALUE}>Fancy Vivid represents peak saturation and commands the highest premiums</span></div>
      </div>
    );
  }
  if (productType === "colored_gemstone") {
    return (
      <div style={PANEL_STYLE}>
        <div style={PANEL_TITLE}>Colored Gemstone Quality Factors</div>
        <div style={PANEL_ROW}><span style={PANEL_LABEL}>Colour</span><span style={PANEL_VALUE}>Hue, saturation, and tone are the three primary components · Vivid, evenly-distributed color is most valued</span></div>
        <div style={PANEL_ROW}><span style={PANEL_LABEL}>Treatment</span><span style={PANEL_VALUE}>All enhancements must be disclosed · Heat treatment, oiling, and irradiation affect durability and value</span></div>
        <div style={{ ...PANEL_ROW, marginBottom: 0 }}><span style={PANEL_LABEL}>Origin</span><span style={PANEL_VALUE}>Geographic origin can substantially affect market value for ruby (Burma), sapphire (Kashmir), and emerald (Colombia)</span></div>
      </div>
    );
  }
  if (productType === "stone_parcel") {
    return (
      <div style={PANEL_STYLE}>
        <div style={PANEL_TITLE}>Stone Parcel — Assessment Note</div>
        <div style={PANEL_ROW}><span style={PANEL_LABEL}>Parcel</span><span style={PANEL_VALUE}>This report covers a parcel or melee lot of multiple stones. Individual stones may vary in grading characteristics.</span></div>
        <div style={{ ...PANEL_ROW, marginBottom: 0 }}><span style={PANEL_LABEL}>Weight</span><span style={PANEL_VALUE}>Carat weight stated is the total parcel weight. Average stone weight is derived when stone count is available.</span></div>
      </div>
    );
  }
  return null;
}

// ─── Field groups (unchanged from v4.3.2) ────────────────────────────────────

function NaturalDiamondFields({ st }) {
  const measStr    = formatMeasurements(st.measLength, st.measWidth, st.measDepth, st.measurements);
  const fluorStr   = formatFluorescence(st.fluorescenceIntensity, st.fluorescenceColor, st.fluorescence);
  const cutFormStr = formatCutForm(st.cutForm, st.shape);
  const cfLabel    = hasValue(st.cutForm) ? "Cut / Form" : "Shape";

  const hasMeasurements = hasValue(cutFormStr) || hasValue(st.carat) || hasValue(measStr);
  const hasGrading      = hasValue(st.color)   || hasValue(st.clarity)   || hasValue(st.cut) ||
                          hasValue(st.polish)  || hasValue(st.symmetry)  || hasValue(fluorStr);
  const hasLab          = hasValue(st.certLab) || hasValue(st.certNumber);

  if (!hasMeasurements && !hasGrading && !hasLab) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4mm", marginBottom: "5mm" }}>
      <div>
        {hasMeasurements && (
          <SectionBlock title="Weight & Shape" marginBottom={hasLab ? "4mm" : "0"}>
            <GradeTable>
              {hasValue(cutFormStr) && <GradeRow label={cfLabel}       value={cutFormStr}               />}
              {hasValue(st.carat)   && <GradeRow label="Carat Weight"  value={`${st.carat} ct`} highlight />}
              {hasValue(measStr)    && <GradeRow label="Measurements"  value={measStr}          noBorder />}
            </GradeTable>
          </SectionBlock>
        )}
        {hasLab && (
          <SectionBlock title="Laboratory" marginBottom="0">
            <GradeTable>
              {hasValue(st.certLab)    && <GradeRow label="Issuing Lab"   value={st.certLab}              />}
              {hasValue(st.certNumber) && <GradeRow label="Report Number" value={st.certNumber} highlight noBorder />}
            </GradeTable>
          </SectionBlock>
        )}
      </div>
      {hasGrading && (
        <div>
          <SectionBlock title="Grading Results" marginBottom="0">
            <GradingBlock>
              {hasValue(st.color)    && <GradeRow label="Colour Grade"  value={st.color}    highlight />}
              {hasValue(st.clarity)  && <GradeRow label="Clarity Grade" value={st.clarity}  highlight />}
              {hasValue(st.cut)      && <GradeRow label="Cut Grade"     value={st.cut}               />}
              {hasValue(st.polish)   && <GradeRow label="Polish"        value={st.polish}            />}
              {hasValue(st.symmetry) && <GradeRow label="Symmetry"      value={st.symmetry}          />}
              {hasValue(fluorStr)    && <GradeRow label="Fluorescence"  value={fluorStr}    noBorder />}
            </GradingBlock>
          </SectionBlock>
        </div>
      )}
    </div>
  );
}

function LabDiamondFields({ st }) {
  const measStr    = formatMeasurements(st.measLength, st.measWidth, st.measDepth, st.measurements);
  const fluorStr   = formatFluorescence(st.fluorescenceIntensity, st.fluorescenceColor, st.fluorescence);
  const cutFormStr = formatCutForm(st.cutForm, st.shape);
  const cfLabel    = hasValue(st.cutForm) ? "Cut / Form" : "Shape";

  const hasMeasurements = hasValue(cutFormStr) || hasValue(st.carat) || hasValue(measStr) || hasValue(st.growthMethod);
  const hasGrading      = hasValue(st.color)   || hasValue(st.clarity)   || hasValue(st.cut) ||
                          hasValue(st.polish)  || hasValue(st.symmetry)  || hasValue(fluorStr);
  const hasLab          = hasValue(st.certLab) || hasValue(st.certNumber);

  if (!hasMeasurements && !hasGrading && !hasLab) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4mm", marginBottom: "5mm" }}>
      <div>
        {hasMeasurements && (
          <SectionBlock title="Weight & Shape" marginBottom={hasLab ? "4mm" : "0"}>
            <GradeTable>
              {hasValue(cutFormStr)      && <GradeRow label={cfLabel}       value={cutFormStr}               />}
              {hasValue(st.carat)        && <GradeRow label="Carat Weight"  value={`${st.carat} ct`} highlight />}
              {hasValue(measStr)         && <GradeRow label="Measurements"  value={measStr}                  />}
              {hasValue(st.growthMethod) && <GradeRow label="Growth Method" value={st.growthMethod} noBorder />}
            </GradeTable>
          </SectionBlock>
        )}
        {hasLab && (
          <SectionBlock title="Laboratory" marginBottom="0">
            <GradeTable>
              {hasValue(st.certLab)    && <GradeRow label="Issuing Lab"   value={st.certLab}              />}
              {hasValue(st.certNumber) && <GradeRow label="Report Number" value={st.certNumber} highlight noBorder />}
            </GradeTable>
          </SectionBlock>
        )}
      </div>
      {hasGrading && (
        <div>
          <SectionBlock title="Grading Results" marginBottom="0">
            <GradingBlock>
              {hasValue(st.color)    && <GradeRow label="Colour Grade"  value={st.color}    highlight />}
              {hasValue(st.clarity)  && <GradeRow label="Clarity Grade" value={st.clarity}  highlight />}
              {hasValue(st.cut)      && <GradeRow label="Cut Grade"     value={st.cut}               />}
              {hasValue(st.polish)   && <GradeRow label="Polish"        value={st.polish}            />}
              {hasValue(st.symmetry) && <GradeRow label="Symmetry"      value={st.symmetry}          />}
              {hasValue(fluorStr)    && <GradeRow label="Fluorescence"  value={fluorStr}    noBorder />}
            </GradingBlock>
          </SectionBlock>
        </div>
      )}
    </div>
  );
}

function FancyColorDiamondFields({ st }) {
  const measStr       = formatMeasurements(st.measLength, st.measWidth, st.measDepth, st.measurements);
  const fluorStr      = formatFluorescence(st.fluorescenceIntensity, st.fluorescenceColor, st.fluorescence);
  const cutFormStr    = formatCutForm(st.cutForm, st.shape);
  const cfLabel       = hasValue(st.cutForm) ? "Cut / Form" : "Shape";
  const fancyGradeStr = [st.fancyColorIntensity, st.fancyColorHue].filter(hasValue).join(" ");

  const hasMeasurements = hasValue(cutFormStr) || hasValue(st.carat) || hasValue(measStr);
  const hasFancyGrading = hasValue(fancyGradeStr) || hasValue(st.fancyColorOrigin) ||
                          hasValue(st.clarity)    || hasValue(st.polish) ||
                          hasValue(st.symmetry)   || hasValue(fluorStr);
  const hasLab          = hasValue(st.certLab)    || hasValue(st.certNumber);

  if (!hasMeasurements && !hasFancyGrading && !hasLab) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4mm", marginBottom: "5mm" }}>
      <div>
        {hasMeasurements && (
          <SectionBlock title="Weight & Shape" marginBottom={hasLab ? "4mm" : "0"}>
            <GradeTable>
              {hasValue(cutFormStr) && <GradeRow label={cfLabel}      value={cutFormStr}               />}
              {hasValue(st.carat)   && <GradeRow label="Carat Weight" value={`${st.carat} ct`} highlight />}
              {hasValue(measStr)    && <GradeRow label="Measurements" value={measStr}          noBorder />}
            </GradeTable>
          </SectionBlock>
        )}
        {hasLab && (
          <SectionBlock title="Laboratory" marginBottom="0">
            <GradeTable>
              {hasValue(st.certLab)    && <GradeRow label="Issuing Lab"   value={st.certLab}              />}
              {hasValue(st.certNumber) && <GradeRow label="Report Number" value={st.certNumber} highlight noBorder />}
            </GradeTable>
          </SectionBlock>
        )}
      </div>
      {hasFancyGrading && (
        <div>
          <SectionBlock title="Colour Grading" marginBottom="0">
            <GradingBlock>
              {hasValue(fancyGradeStr)       && <GradeRow label="Fancy Colour Grade" value={fancyGradeStr}       highlight />}
              {hasValue(st.fancyColorOrigin) && <GradeRow label="Colour Origin"      value={st.fancyColorOrigin}           />}
              {hasValue(st.clarity)          && <GradeRow label="Clarity Grade"      value={st.clarity}                    />}
              {hasValue(st.polish)           && <GradeRow label="Polish"             value={st.polish}                     />}
              {hasValue(st.symmetry)         && <GradeRow label="Symmetry"           value={st.symmetry}                   />}
              {hasValue(fluorStr)            && <GradeRow label="Fluorescence"       value={fluorStr}            noBorder />}
            </GradingBlock>
          </SectionBlock>
        </div>
      )}
    </div>
  );
}

function ColoredGemstoneFields({ st }) {
  const measStr    = formatMeasurements(st.measLength, st.measWidth, st.measDepth, st.measurements);
  const cutFormStr = formatCutForm(st.cutForm, st.shape);
  const cfLabel    = hasValue(st.cutForm) ? "Cut / Form" : "Shape";
  const fluorStr   = formatFluorescence(st.fluorescenceIntensity, st.fluorescenceColor, st.fluorescence);

  const hasIdentity   = hasValue(st.species)          || hasValue(st.variety);
  const hasMeasure    = hasValue(cutFormStr)           || hasValue(st.carat) || hasValue(measStr);
  const hasAppearance = hasValue(st.colorDescription)  || hasValue(st.transparency) ||
                        hasValue(st.clarity)           || hasValue(fluorStr);
  const hasTreatment  = hasValue(st.treatment)         || hasValue(st.countryOfOrigin);

  if (!hasIdentity && !hasMeasure && !hasAppearance && !hasTreatment) return null;

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4mm", marginBottom: "5mm" }}>
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
                {hasValue(cutFormStr) && <GradeRow label={cfLabel}      value={cutFormStr}               />}
                {hasValue(st.carat)   && <GradeRow label="Carat Weight" value={`${st.carat} ct`} highlight />}
                {hasValue(measStr)    && <GradeRow label="Measurements" value={measStr}          noBorder />}
              </GradeTable>
            </SectionBlock>
          )}
        </div>
        {(hasAppearance || hasTreatment) && (
          <div>
            {hasAppearance && (
              <SectionBlock title="Colour & Appearance" marginBottom="4mm">
                <div style={{ background: IV2, padding: "0 3.5mm 3mm", border: "0.5px solid rgba(138,171,142,0.28)" }}>
                  <GradingHeader />
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      {hasValue(st.colorDescription) && <GradeRow label="Colour Description" value={st.colorDescription} highlight />}
                      {hasValue(st.transparency)     && <GradeRow label="Transparency"        value={st.transparency}              />}
                      {hasValue(st.clarity)          && <GradeRow label="Clarity"             value={st.clarity}                   />}
                      {hasValue(fluorStr)            && <GradeRow label="Fluorescence"        value={fluorStr}           noBorder />}
                    </tbody>
                  </table>
                </div>
              </SectionBlock>
            )}
            {hasTreatment && (
              <SectionBlock title="Treatment & Origin" marginBottom="0">
                <GradeTable stripe>
                  {hasValue(st.treatment)       && <GradeRow label="Treatment"         value={st.treatment}       />}
                  {hasValue(st.countryOfOrigin) && <GradeRow label="Country of Origin" value={st.countryOfOrigin} noBorder />}
                </GradeTable>
              </SectionBlock>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Subtitle helper (v5.4.2) ─────────────────────────────────────────────────
function getProductSubtitle(pt) {
  // Resolve the canonical key so Hebrew productType values also work
  const canonical = toCanonical(pt) ?? pt;
  switch (canonical) {
    case "natural_diamond":     return "Natural Diamond";
    case "lab_grown_diamond":   return "Laboratory-Grown Diamond";
    case "fancy_color_diamond": return "Fancy Colour Diamond";
    case "colored_gemstone":    return "Coloured Gemstone";
    case "stone_pair_set":      return "Matched Pair / Set";
    case "stone_parcel":        return "Stone Parcel · Melee";  // ← NOT "Matched Pair"
    case "jewelry_part":        return "Jewelry Component";
    case "finished_jewelry":    return "Finished Jewelry";
    default:                    return PRODUCT_TYPE_LABELS[pt] || "Stone Report";
  }
}

// ─── InHouseStoneReport ───────────────────────────────────────────────────────
export function InHouseStoneReport({ data }) {
  if (!data) return null;
  const d  = data;

  // v5.4.2: sanitize every stone string field through toReportEn() so no Hebrew
  // can appear in the certificate, regardless of how the data was built.
  const rawSt = d.stone || {};
  const st = {
    // Pass numeric fields and arrays through unchanged
    measLength:  rawSt.measLength,
    measWidth:   rawSt.measWidth,
    measDepth:   rawSt.measDepth,
    measurements: rawSt.measurements,
    carat:       rawSt.carat,
    // All string display fields → sanitize to English
    type:                sanitizeForReport(rawSt.type),
    naturalOrLab:        sanitizeForReport(rawSt.naturalOrLab),
    species:             sanitizeForReport(rawSt.species),
    variety:             sanitizeForReport(rawSt.variety),
    shape:               sanitizeForReport(rawSt.shape),
    cutForm:             sanitizeForReport(rawSt.cutForm),
    color:               rawSt.color,          // diamond colour grades are already English letters (D, G, etc.)
    clarity:             rawSt.clarity,        // clarity grades (VS1, SI2) are already English
    cut:                 sanitizeForReport(rawSt.cut),
    polish:              sanitizeForReport(rawSt.polish),
    symmetry:            sanitizeForReport(rawSt.symmetry),
    fluorescenceIntensity: sanitizeForReport(rawSt.fluorescenceIntensity),
    fluorescenceColor:     sanitizeForReport(rawSt.fluorescenceColor),
    fluorescence:          sanitizeForReport(rawSt.fluorescence),
    fancyColorHue:         sanitizeForReport(rawSt.fancyColorHue),
    fancyColorIntensity:   sanitizeForReport(rawSt.fancyColorIntensity),
    fancyColorOrigin:      sanitizeForReport(rawSt.fancyColorOrigin),
    growthMethod:          sanitizeForReport(rawSt.growthMethod),
    colorDescription:      sanitizeForReport(rawSt.colorDescription),
    transparency:          sanitizeForReport(rawSt.transparency),
    treatment:             sanitizeForReport(rawSt.treatment),
    countryOfOrigin:       sanitizeForReport(rawSt.countryOfOrigin),
    certLab:               rawSt.certLab,      // lab name (GIA, IGI) — always English, keep as-is
    certNumber:            rawSt.certNumber,   // report number — alphanumeric, keep as-is
    // Colored gemstone fields
    certSpecies:           sanitizeForReport(rawSt.species),
  };

  // v5.4.2: resolve productType to canonical key so Hebrew values route correctly
  const rawPt        = d.productType || "natural_diamond";
  const pt           = toCanonical(rawPt) ?? rawPt;
  const ptSubtitle   = getProductSubtitle(pt);
  const showRefPanel = d.displaySettings?.showReferencePanel !== false;

  const images        = Array.isArray(d.images) ? d.images.filter(Boolean) : (d.images ? [d.images] : []);
  const reportImages  = images.slice(0, 3);
  const hasImages     = reportImages.length > 0;
  const heroImg       = reportImages[0] || null;
  const secondaryImgs = reportImages.slice(1);

  const hasExtReports =
    Array.isArray(d.externalReports) && d.externalReports.length > 0 &&
    d.externalReports.some((r) => hasValue(r.lab) || hasValue(r.reportNumber));
  const hasComments     = hasValue(d.comments);
  const hasVerification =
    hasValue(d.verification?.verificationId) || hasValue(d.verification?.verificationUrl);

  // Which field group to render for this product type
  const GEMSTONE_TYPES = ["natural_diamond", "lab_grown_diamond", "fancy_color_diamond", "colored_gemstone"];

  return (
    <div
      className="printable-container"
      dir="ltr"
      style={{
        width:    "210mm",
        maxWidth: "100%",
        minHeight: "297mm",
        background: IV,
        fontFamily: SANS,
        color:      CH,
        position:   "relative",
        overflow:   "hidden",
        boxSizing:  "border-box",
        margin:     "0 auto",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust:       "exact",
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

      <div style={{ position: "relative", zIndex: 1, padding: "10mm 14mm 12mm" }}>

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
              In-House Stone Report
            </div>
            {/* v5.4.1: ptSubtitle uses correct mapping (stone_parcel ≠ Matched Pair) */}
            <div style={{ fontFamily: SANS, fontSize: 7.5, color: SG, letterSpacing: "0.12em", marginTop: 3, textTransform: "uppercase" }}>
              {ptSubtitle}
            </div>
            {hasValue(d.reportNumber) && (
              <div style={{ fontFamily: SANS, fontSize: 8.5, color: "#7a8e98", marginTop: 4, letterSpacing: "0.04em" }}>
                Report No. <span style={{ color: CH, fontWeight: 600 }}>{d.reportNumber}</span>
              </div>
            )}
            {hasValue(d.reportDate) && (
              <div style={{ fontFamily: SANS, fontSize: 8, color: "#7a8e98", marginTop: 2 }}>{d.reportDate}</div>
            )}
          </div>
        </div>

        {/* Sage rule */}
        <div style={{ height: "1px", background: SG, marginBottom: "5mm" }} />

        {/* IMAGES */}
        {hasImages && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "5mm", gap: "2mm" }}>
            <div style={{ width: "55mm", height: "55mm", border: "0.5px solid rgba(54,69,79,0.16)", background: IV2, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={heroImg} alt="stone" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            {secondaryImgs.length > 0 && (
              <div style={{ display: "flex", gap: "2mm" }}>
                {secondaryImgs.map((src, i) => (
                  <div key={i} style={{ width: "17mm", height: "17mm", border: "0.5px solid rgba(54,69,79,0.12)", background: IV2, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src={src} alt={`view ${i + 2}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* v5.4.1: CLASSIFICATION SECTION — above field-specific grading */}
        <ClassificationSection
          classification={d.classification}
          productType={pt}
        />

        {/* PRODUCT-TYPE CONDITIONAL FIELDS */}
        {pt === "natural_diamond"     && <NaturalDiamondFields     st={st} />}
        {pt === "lab_grown_diamond"   && <LabDiamondFields          st={st} />}
        {pt === "fancy_color_diamond" && <FancyColorDiamondFields   st={st} />}
        {pt === "colored_gemstone"    && <ColoredGemstoneFields     st={st} />}
        {/* stone_pair_set: use NaturalDiamondFields (pair of diamonds is most common) */}
        {pt === "stone_pair_set"      && <NaturalDiamondFields      st={st} />}
        {/* stone_parcel: use NaturalDiamondFields but classification section makes it clear */}
        {pt === "stone_parcel"        && <NaturalDiamondFields      st={st} />}
        {/* Fallback for unknown types — NOT parcel, NOT pair */}
        {!["natural_diamond","lab_grown_diamond","fancy_color_diamond","colored_gemstone","stone_pair_set","stone_parcel"].includes(pt) && (
          <NaturalDiamondFields st={st} />
        )}

        {(hasExtReports || hasComments || hasVerification || showRefPanel) && (
          <div style={{ height: "0.5px", background: "rgba(54,69,79,0.08)", marginBottom: "4mm" }} />
        )}

        {/* EXTERNAL REPORTS */}
        {hasExtReports && (
          <SectionBlock title="External Lab Reports">
            {d.externalReports
              .filter((r) => hasValue(r.lab) || hasValue(r.reportNumber))
              .map((rpt, idx) => (
                <div key={idx} style={{ display: "flex", gap: "4mm", padding: "2.5mm 3.5mm", background: idx % 2 === 0 ? IV2 : "#f4f1eb", alignItems: "center", flexWrap: "wrap" }}>
                  {hasValue(rpt.lab)          && <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: CH }}>{rpt.lab}</span>}
                  {hasValue(rpt.reportNumber) && <span style={{ fontFamily: SANS, fontSize: 10, color: CHM }}>No. {rpt.reportNumber}</span>}
                  {hasValue(rpt.attachmentName) && <span style={{ fontFamily: SANS, fontSize: 9, color: CHL, fontStyle: "italic" }}>{rpt.attachmentName}</span>}
                </div>
              ))}
          </SectionBlock>
        )}

        {/* COMMENTS */}
        {hasComments && (
          <SectionBlock title="Comments">
            <p style={{ fontFamily: SANS, fontSize: 10.5, color: CHM, lineHeight: 1.82, margin: 0, padding: "3mm 4mm", background: IV2, borderLeft: `2px solid ${SG}`, fontStyle: "italic" }}>
              {d.comments}
            </p>
          </SectionBlock>
        )}

        {/* VERIFICATION */}
        {hasVerification && (
          <SectionBlock title="Verification">
            <div style={{ display: "flex", alignItems: "center", gap: "3.5mm", padding: "3mm 4mm", background: IV2, border: "0.5px solid rgba(54,69,79,0.12)" }}>
              {hasValue(d.verification?.qrImageUrl) && (
                <img src={d.verification.qrImageUrl} alt="Verification QR" style={{ width: "13mm", height: "13mm", objectFit: "contain", flexShrink: 0 }} />
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

        {/* REFERENCE PANEL */}
        {showRefPanel && <ReferencePanel productType={pt} />}

        {/* FOOTER */}
        <div style={{ borderTop: "0.5px solid rgba(138,171,142,0.55)", paddingTop: "5mm", marginTop: "4mm", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "6mm" }}>
          <SignatureBlock credentials={d.credentials} />
          <div style={{ textAlign: "right", maxWidth: "70mm" }}>
            {hasValue(d.credentials?.companyLine) && (
              <div style={{ fontFamily: SANS, fontSize: 8, color: CHL, lineHeight: 1.55, marginBottom: 5 }}>
                {d.credentials.companyLine}
              </div>
            )}
            <div style={{ fontFamily: SANS, fontSize: 7, color: "rgba(54,69,79,0.38)", lineHeight: 1.65, fontStyle: "italic" }}>
              This report reflects the professional assessment of LESHEM.S and is provided for informational purposes only.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
