/**
 * lib/reports/reportDefaults.js  —  v4.2
 *
 * Factory functions that create editable report data objects.
 *
 * Changes in v4.2:
 *   + productType field added to both report types
 *   + images[] was already an array — no migration needed
 *   + createDefaultStoneReport now accepts productType and pre-fills
 *     the appropriate stone sub-type fields
 *   + Stone data model: added fancyColor, growthMethod, transparency fields
 *   + PRODUCT_TYPE_TO_REPORT mapping used to set reportType from productType
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
const DEFAULT_CREDENTIALS = {
  signatoryName: "Leshem Simon",
  title:         "Founder · Certified Diamond Grader & Expert Jeweler",
  companyLine:   "LESHEM.S Jewelry · Tuval St 23, Ramat Gan · VAT: 046240016",
};

/**
 * Verification fields are data-model support only.
 * Future: unguessable token, public-approved data only, revocable access.
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
  const setStr  = hasValue(setting) ? ` · ${setting}` : "";
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
    productType:  "jewelry",              // ← new in v4.2
    reportNumber: qNum || generateReportNumber("LS-JV"),
    reportDate:   today,

    preparedFor:     cfg.clientName  || "",
    itemTitle:       cfg.quoteName   || "",
    itemDescription: buildNarrative(cfg),

    // images[] — already an array, supports multiple images
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
      color:        isDiamond ? (cfg.centerColor   || "") : "",
      clarity:      isDiamond ? (cfg.centerClarity || "") : "",
      cut:          "",
      setting:      cfg.centerSetting || "",
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
 * The productType field controls which field groups appear in the template:
 *   "natural_diamond"     — shape, carat, color grade, clarity, cut, polish, symmetry,
 *                           fluorescence, measurements, certLab/Number
 *   "lab_grown_diamond"   — same as natural + growthMethod, no origin
 *   "fancy_color_diamond" — shape, carat, fancyColor (hue+intensity+origin),
 *                           clarity, polish, symmetry, fluorescence, measurements
 *   "colored_gemstone"    — species, variety, shape, carat, measurements,
 *                           colorDescription, transparency, treatment, origin, comments
 *
 * Defaults to "natural_diamond" when productType is missing (graceful degradation).
 *
 * @param {object} stoneData   Flat stone data (from inventory or blank)
 * @param {string} productType "natural_diamond" | "lab_grown_diamond" | etc.
 */
export function createDefaultStoneReport(stoneData = {}, productType = "natural_diamond") {
  const resolvedType = productType || stoneData.productType || "natural_diamond";

  return {
    reportType:   "inhouse_stone",
    productType:  resolvedType,           // ← drives field visibility in template
    reportNumber: stoneData.reportNumber || generateReportNumber("LS-ST"),
    reportDate:   stoneData.reportDate   || fmtReportDate(),

    stone: {
      // ── Identity ── (all types)
      type:             stoneData.type             || "",   // "Diamond" / "Ruby" / etc.
      naturalOrLab:     stoneData.naturalOrLab     || "",   // "Natural" / "Lab-Grown"
      species:          stoneData.species          || "",   // gemstone: "Ruby", "Sapphire"
      variety:          stoneData.variety          || "",   // gemstone: "Pigeon Blood"

      // ── Shape & Weight ── (all types)
      shape:            stoneData.shape            || "",
      carat:            stoneData.carat            || "",
      measurements:     stoneData.measurements     || "",

      // ── Diamond grading ── (natural, lab, fancy color)
      color:            stoneData.color            || "",   // colorless grade: D–Z
      clarity:          stoneData.clarity          || "",
      cut:              stoneData.cut              || "",
      polish:           stoneData.polish           || "",
      symmetry:         stoneData.symmetry         || "",
      fluorescence:     stoneData.fluorescence     || "",

      // ── Fancy color diamond ── (fancy_color_diamond only)
      fancyColorHue:       stoneData.fancyColorHue       || "",  // "Pink", "Blue"
      fancyColorIntensity: stoneData.fancyColorIntensity || "",  // "Fancy Vivid"
      fancyColorOrigin:    stoneData.fancyColorOrigin    || "",  // "Natural"

      // ── Lab-grown ── (lab_grown_diamond only)
      growthMethod:     stoneData.growthMethod     || "",   // "CVD" / "HPHT"

      // ── Colored gemstone ──
      colorDescription: stoneData.colorDescription || "",
      transparency:     stoneData.transparency     || "",
      treatment:        stoneData.treatment        || "",
      countryOfOrigin:  stoneData.countryOfOrigin  || "",

      // ── Certificate ── (natural, lab, fancy color)
      certLab:          stoneData.certLab          || "",
      certNumber:       stoneData.certNumber       || "",
    },

    // images[] — array, supports multiple stone images
    images:          stoneData.images          || [],
    externalReports: stoneData.externalReports || [],
    comments:        stoneData.comments        || "",

    verification: { ...EMPTY_VERIFICATION },
    credentials:  { ...DEFAULT_CREDENTIALS },
  };
}
