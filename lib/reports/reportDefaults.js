/**
 * lib/reports/reportDefaults.js  —  v4.3
 *
 * Factory functions for report data objects.
 *
 * Changes in v4.3:
 *   + Measurements split: stone.measLength / measWidth / measDepth
 *     (stone.measurements kept as legacy passthrough for old reports)
 *   + Fluorescence split: stone.fluorescenceIntensity / fluorescenceColor
 *     (stone.fluorescence kept as legacy passthrough for old reports)
 *   + stone.cutForm field added
 *   + credentials.examinerName / examinerTitle / signatureImageUrl added to both
 *   + displaySettings.showReferencePanel (stone report only, default true)
 */

import {
  generateReportNumber,
  fmtReportDate,
  hasValue,
  pluralize,
  formatStoneCount,
} from "./reportUtils";

import { PRODUCT_TYPE_TO_REPORT } from "../gemology/taxonomy";

// ─── Shared credentials ───────────────────────────────────────────────────────
/**
 * Default credentials used in every new report.
 * examinerName / examinerTitle fall back to signatoryName / title in templates
 * when empty, so existing reports display identically without migration.
 * signatureImageUrl: optional base64 or URL; renders above signature line.
 */
const DEFAULT_CREDENTIALS = {
  signatoryName:     "Leshem Simon",
  title:             "Founder \u00b7 Certified Diamond Grader & Expert Jeweler",
  companyLine:       "LESHEM.S Jewelry \u00b7 Tuval St 23, Ramat Gan \u00b7 VAT: 046240016",
  examinerName:      "",   // if empty → signatoryName used in signature display
  examinerTitle:     "",   // if empty → title used in signature display
  signatureImageUrl: "",   // optional: scanned/digital signature image
};

/**
 * Verification fields — future backend.
 * Security requirements: unguessable token, public-approved data only, revocable.
 */
const EMPTY_VERIFICATION = {
  verificationId:  "",
  verificationUrl: "",
  qrImageUrl:      "",
};

// ─── Workmanship helpers ──────────────────────────────────────────────────────
const CAST_LABELS = {
  "CAD / Casting":   "CAD production and casting",
  "Hand Fabricated": "hand fabrication",
  "Lost Wax":        "lost-wax casting",
  "Hand Engraving":  "hand engraving",
  "3D Printing":     "3D-printed form and casting",
};

const CMPLX_LABELS = {
  "Simple":       "standard",
  "Medium":       "moderately detailed",
  "Complex":      "high-complexity",
  "Very Complex": "very high-complexity",
  "Extreme":      "extraordinary-complexity",
};

function buildWorkmanshipDesc(cfg) {
  if (!cfg) return "";
  const castLabel = CAST_LABELS[cfg.cast]   || (cfg.cast  ? cfg.cast  : "");
  const cmplxAdj  = CMPLX_LABELS[cfg.cmplx] || (cfg.cmplx ? cfg.cmplx.toLowerCase() : "");
  if (castLabel && cmplxAdj) return `${castLabel}, ${cmplxAdj} craftsmanship`;
  if (castLabel) return castLabel;
  if (cmplxAdj)  return `${cmplxAdj.charAt(0).toUpperCase() + cmplxAdj.slice(1)} craftsmanship`;
  return "";
}

function buildAccentDesc(count, ctEach, type, setting) {
  const n = parseInt(count, 10) || 0;
  if (n <= 0) return "";
  const totalCt = Math.round(n * (parseFloat(ctEach) || 0) * 100) / 100;
  const base    = formatStoneCount(n, totalCt, type);
  const setStr  = hasValue(setting) ? ` \u00b7 ${setting}` : "";
  return base + setStr;
}

function buildNarrative(cfg) {
  if (!cfg) return "";
  const metal  = cfg.metal     || "";
  const center = cfg.centerType || "";
  const ct     = parseFloat(cfg.centerCt) || 0;
  const ss1n   = parseInt(cfg.ss1Count, 10) || 0;
  const ss2n   = parseInt(cfg.ss2Count, 10) || 0;
  if (!metal && !center) return "";

  let s = "This report describes a handcrafted";
  if (metal) s += ` ${metal}`;
  s += " piece";
  if (hasValue(center)) {
    const ctStr = ct > 0 ? ` ${ct.toFixed(2)} ct ` : " ";
    s += `, set with a${ctStr}${center} center stone`;
  }
  const accentTypes = [];
  if (ss1n > 0 && hasValue(cfg.ss1Type)) accentTypes.push(pluralize(cfg.ss1Type).toLowerCase());
  if (ss2n > 0 && hasValue(cfg.ss2Type)) accentTypes.push(pluralize(cfg.ss2Type).toLowerCase());
  if (accentTypes.length > 0) s += `, complemented by ${accentTypes.join(" and ")} accent stones`;
  s += ".";
  s += " The valuation reflects the materials, gemstone characteristics, craftsmanship, and LESHEM.S studio standards.";
  return s;
}

// ─── createDefaultJewelryReport ───────────────────────────────────────────────
/**
 * @param {object} calculatorData  { cfg, res, fmtFn, pieceImg, qNum }
 */
export function createDefaultJewelryReport(calculatorData = {}) {
  const { cfg = {}, res = {}, fmtFn, pieceImg, qNum } = calculatorData;
  const safeFormat = fmtFn || ((v) => `$${Math.round(v || 0).toLocaleString()}`);
  const isDiamond  = cfg.centerType === "Diamond";
  const today      = fmtReportDate();

  const ss1n = parseInt(cfg.ss1Count, 10) || 0;
  const ss2n = parseInt(cfg.ss2Count, 10) || 0;
  const acc1 = buildAccentDesc(ss1n, cfg.ss1Ct, cfg.ss1Type, cfg.ss1Setting);
  const acc2 = buildAccentDesc(ss2n, cfg.ss2Ct, cfg.ss2Type, cfg.ss2Setting);

  return {
    reportType:   "jewelry_valuation",
    productType:  "jewelry",
    reportNumber: qNum || generateReportNumber("LS-JV"),
    reportDate:   today,

    preparedFor:     cfg.clientName  || "",
    itemTitle:       cfg.quoteName   || "",
    itemDescription: buildNarrative(cfg),

    images: pieceImg ? [pieceImg] : [],

    metal: {
      alloy:   cfg.metal || "",
      weight:  cfg.grams ? `${parseFloat(cfg.grams).toFixed(2)} g` : "",
      purity:  "",
      casting: cfg.cast  || "",
    },

    centerStone: {
      type:         cfg.centerType    || "",
      carat:        cfg.centerCt      ? `${parseFloat(cfg.centerCt).toFixed(2)} ct` : "",
      cutForm:      "",
      shape:        "",
      measLength:   "",
      measWidth:    "",
      measDepth:    "",
      measurements: "",
      color:        isDiamond ? (cfg.centerColor   || "") : "",
      clarity:      isDiamond ? (cfg.centerClarity || "") : "",
      cut:          "",
      setting:      cfg.centerSetting || "",
      fluorescenceIntensity: "",
      fluorescenceColor:     "",
      fluorescence: "",
      origin:       "",
      certLab:      "",
      certNumber:   "",
    },

    accentStonesDesc: [acc1, acc2].filter(Boolean).join("\n"),
    workmanshipDesc:  buildWorkmanshipDesc(cfg),

    valuation: {
      enabled:  true,
      amount:   res.ri ? safeFormat(res.ri) : "",
      currency: "USD",
      basis:    "Retail Replacement Value",
      date:     today,
    },

    notes:        cfg.notes || "",
    verification: { ...EMPTY_VERIFICATION },
    credentials:  { ...DEFAULT_CREDENTIALS },
    displaySettings: { showValuation: true },
  };
}

// ─── createDefaultStoneReport ─────────────────────────────────────────────────
/**
 * Build an In-House Stone Report data object.
 *
 * productType controls which field groups appear:
 *   "natural_diamond"     — color/clarity/cut/polish/symmetry/fluorescence + cert
 *   "lab_grown_diamond"   — same + growthMethod
 *   "fancy_color_diamond" — fancyColor grading + clarity/polish/symmetry/fluorescence
 *   "colored_gemstone"    — species/variety/colorDesc/transparency/treatment/origin/clarity
 *
 * Defaults to "natural_diamond" when productType is missing.
 *
 * Measurement fields (v4.3):
 *   stone.measLength / measWidth / measDepth — new structured inputs
 *   stone.measurements — legacy passthrough kept for old reports
 *
 * Fluorescence fields (v4.3):
 *   stone.fluorescenceIntensity / fluorescenceColor — new structured inputs
 *   stone.fluorescence — legacy passthrough kept for old reports
 *
 * @param {object} stoneData    Flat source data (from inventory or manual entry)
 * @param {string} productType  One of the productType slugs
 */
export function createDefaultStoneReport(stoneData = {}, productType = "natural_diamond") {
  const resolvedType = productType || stoneData.productType || "natural_diamond";

  return {
    reportType:   "inhouse_stone",
    productType:  resolvedType,
    reportNumber: stoneData.reportNumber || generateReportNumber("LS-ST"),
    reportDate:   stoneData.reportDate   || fmtReportDate(),

    stone: {
      // ── Identity ──
      type:             stoneData.type             || "",
      naturalOrLab:     stoneData.naturalOrLab     || "",
      species:          stoneData.species          || "",
      variety:          stoneData.variety          || "",

      // ── Shape & Cut ──
      shape:            stoneData.shape            || "",
      cutForm:          stoneData.cutForm          || "",   // Faceted/Cabochon/Rough…

      // ── Weight & Measurements (v4.3 structured) ──
      carat:            stoneData.carat            || "",
      measLength:       stoneData.measLength       || "",
      measWidth:        stoneData.measWidth        || "",
      measDepth:        stoneData.measDepth        || "",
      measurements:     stoneData.measurements     || "",   // legacy passthrough

      // ── Diamond grading ──
      color:            stoneData.color            || "",
      clarity:          stoneData.clarity          || "",   // diamond OR gemstone grade
      cut:              stoneData.cut              || "",
      polish:           stoneData.polish           || "",
      symmetry:         stoneData.symmetry         || "",

      // ── Fluorescence (v4.3 structured) ──
      fluorescenceIntensity: stoneData.fluorescenceIntensity || "",
      fluorescenceColor:     stoneData.fluorescenceColor     || "",
      fluorescence:          stoneData.fluorescence          || "", // legacy passthrough

      // ── Fancy color diamond ──
      fancyColorHue:       stoneData.fancyColorHue       || "",
      fancyColorIntensity: stoneData.fancyColorIntensity || "",
      fancyColorOrigin:    stoneData.fancyColorOrigin    || "",

      // ── Lab-grown diamond ──
      growthMethod:     stoneData.growthMethod     || "",

      // ── Colored gemstone ──
      colorDescription: stoneData.colorDescription || "",
      transparency:     stoneData.transparency     || "",
      treatment:        stoneData.treatment        || "",
      countryOfOrigin:  stoneData.countryOfOrigin  || "",

      // ── Certificate ──
      certLab:          stoneData.certLab          || "",
      certNumber:       stoneData.certNumber       || "",
    },

    images:          stoneData.images          || [],
    externalReports: stoneData.externalReports || [],
    comments:        stoneData.comments        || "",
    verification:    { ...EMPTY_VERIFICATION },
    credentials:     { ...DEFAULT_CREDENTIALS },

    displaySettings: {
      showReferencePanel: true,   // shown by default; user can disable in editor
    },
  };
}
