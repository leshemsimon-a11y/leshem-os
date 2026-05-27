/**
 * lib/reports/reportDefaults.js  —  v4.4
 *
 * Changes in v4.4:
 *   + imageCrops[]  — per-image crop settings { scale, offsetX, offsetY }
 *     Parallel array to images[]. Non-destructive. Applied in template via
 *     objectPosition + transform on the img element.
 *   + credentials.signatureSize — "small" | "medium" | "large"
 *     Maps to container heights: small=12mm, medium=18mm, large=26mm
 *     Default: "medium" (safe — existing reports without this field render
 *     with 18mm container height, identical to v4.3 behavior)
 *
 * Production note (for both draft storage and future Airtable):
 *   imageCrops contains base64 images as part of the images[] array which
 *   will be large. localStorage drafts should warn users about storage limits.
 *   Future: move images to Airtable attachments / Supabase storage and store
 *   only URLs here.
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
 * signatureSize is new in v4.4.
 * Fallback in templates: `credentials?.signatureSize ?? "medium"`
 * so no migration needed for old reports.
 */
const DEFAULT_CREDENTIALS = {
  signatoryName:     "Leshem Simon",
  title:             "Founder \u00b7 Certified Diamond Grader & Expert Jeweler",
  companyLine:       "LESHEM.S Jewelry \u00b7 Tuval St 23, Ramat Gan \u00b7 VAT: 046240016",
  examinerName:      "",
  examinerTitle:     "",
  signatureImageUrl: "",
  signatureSize:     "medium",   // "small" | "medium" | "large"
};

const EMPTY_VERIFICATION = {
  verificationId:  "",
  verificationUrl: "",
  qrImageUrl:      "",
};

// ─── Default crop for one image ───────────────────────────────────────────────
/**
 * Returns a default crop object.
 * scale:   1.0  = no zoom (0.5–3.0 range in editor)
 * offsetX: 50   = centered horizontally (0–100 = CSS objectPosition %)
 * offsetY: 50   = centered vertically
 */
export function defaultCrop() {
  return { scale: 1.0, offsetX: 50, offsetY: 50 };
}

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
  if (cmplxAdj) {
    const c = cmplxAdj.charAt(0).toUpperCase() + cmplxAdj.slice(1);
    return `${c} craftsmanship`;
  }
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
  const metal  = cfg.metal      || "";
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

  // Build images + matching imageCrops arrays
  const images     = pieceImg ? [pieceImg] : [];
  const imageCrops = images.map(() => defaultCrop());

  return {
    reportType:   "jewelry_valuation",
    productType:  "jewelry",
    reportNumber: qNum || generateReportNumber("LS-JV"),
    reportDate:   today,

    preparedFor:     cfg.clientName   || "",
    itemTitle:       cfg.quoteName    || "",
    itemDescription: buildNarrative(cfg),

    // images + imageCrops are always parallel arrays
    images,
    imageCrops,

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
 * @param {object} stoneData    Flat source data
 * @param {string} productType  Stone product type slug
 */
export function createDefaultStoneReport(stoneData = {}, productType = "natural_diamond") {
  const resolvedType = productType || stoneData.productType || "natural_diamond";

  const images     = stoneData.images     || [];
  const imageCrops = stoneData.imageCrops || images.map(() => defaultCrop());

  return {
    reportType:  "inhouse_stone",
    productType: resolvedType,
    reportNumber: stoneData.reportNumber || generateReportNumber("LS-ST"),
    reportDate:   stoneData.reportDate   || fmtReportDate(),

    stone: {
      type:             stoneData.type             || "",
      naturalOrLab:     stoneData.naturalOrLab     || "",
      species:          stoneData.species          || "",
      variety:          stoneData.variety          || "",
      shape:            stoneData.shape            || "",
      cutForm:          stoneData.cutForm          || "",
      carat:            stoneData.carat            || "",
      measLength:       stoneData.measLength       || "",
      measWidth:        stoneData.measWidth        || "",
      measDepth:        stoneData.measDepth        || "",
      measurements:     stoneData.measurements     || "",
      color:            stoneData.color            || "",
      clarity:          stoneData.clarity          || "",
      cut:              stoneData.cut              || "",
      polish:           stoneData.polish           || "",
      symmetry:         stoneData.symmetry         || "",
      fluorescenceIntensity: stoneData.fluorescenceIntensity || "",
      fluorescenceColor:     stoneData.fluorescenceColor     || "",
      fluorescence:          stoneData.fluorescence          || "",
      fancyColorHue:       stoneData.fancyColorHue       || "",
      fancyColorIntensity: stoneData.fancyColorIntensity || "",
      fancyColorOrigin:    stoneData.fancyColorOrigin    || "",
      growthMethod:     stoneData.growthMethod     || "",
      colorDescription: stoneData.colorDescription || "",
      transparency:     stoneData.transparency     || "",
      treatment:        stoneData.treatment        || "",
      countryOfOrigin:  stoneData.countryOfOrigin  || "",
      certLab:          stoneData.certLab          || "",
      certNumber:       stoneData.certNumber       || "",
    },

    images,
    imageCrops,
    externalReports: stoneData.externalReports || [],
    comments:        stoneData.comments        || "",
    verification:    { ...EMPTY_VERIFICATION },
    credentials:     { ...DEFAULT_CREDENTIALS },

    displaySettings: {
      showReferencePanel: true,
    },
  };
}
