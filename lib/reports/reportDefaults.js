/**
 * lib/reports/reportDefaults.js  —  v5.2.1
 *
 * Changes from v4.4.2:
 *
 * Fix 5 — Multiple center stones:
 *   buildNarrative() now uses centerCount to generate:
 *     "1.00 ct Diamond center stone"                  (count = 1)
 *     "2 Diamonds, 1.00 ct each / 2.00 ct total"     (count > 1)
 *   createDefaultJewelryReport() reads cfg.centerCount.
 *
 * Fix 8 — Professional description from real data only:
 *   buildNarrative() only includes fields that have real values.
 *   Does not invent missing data.
 *   Returns "" when no meaningful data exists.
 *   The user can always edit manually in the Report Editor.
 *   A "Regenerate Description" capability is supported: calling
 *   buildNarrative(cfg) again and writing to itemDescription.
 *
 * Fix 9 — Workmanship empty by default (unchanged from v4.4.2):
 *   workmanshipDesc: "" — never auto-generated.
 *
 * All other behavior identical to v4.4.2.
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
  signatoryName:     "Leshem Simon",
  title:             "Founder \u00b7 Certified Diamond Grader & Expert Jeweler",
  companyLine:       "LESHEM.S Jewelry \u00b7 Tuval St 23, Ramat Gan \u00b7 VAT: 046240016",
  examinerName:      "",
  examinerTitle:     "",
  signatureImageUrl: "",
  signatureSize:     "medium",
};

const EMPTY_VERIFICATION = {
  verificationId:  "",
  verificationUrl: "",
  qrImageUrl:      "",
};

// ─── Default crop ─────────────────────────────────────────────────────────────
export function defaultCrop() {
  return { scale: 1.0, offsetX: 50, offsetY: 50 };
}

// ─── Workmanship builder (kept, NOT called automatically) ─────────────────────
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

export function buildWorkmanshipDesc(cfg) {
  if (!cfg) return "";
  const castLabel = CAST_LABELS[cfg.cast]   || (cfg.cast  ? cfg.cast  : "");
  const cmplxAdj  = CMPLX_LABELS[cfg.cmplx] || (cfg.cmplx ? cfg.cmplx.toLowerCase() : "");
  if (castLabel && cmplxAdj) return `${castLabel}, ${cmplxAdj} craftsmanship`;
  if (castLabel) return castLabel;
  if (cmplxAdj) return `${cmplxAdj.charAt(0).toUpperCase() + cmplxAdj.slice(1)} craftsmanship`;
  return "";
}

// ─── Narrative builder — Fix 8 ────────────────────────────────────────────────
/**
 * Build a professional description from ACTUAL calculator data only.
 *
 * Rules (Fix 8):
 *   • Only include data that is actually present in cfg.
 *   • Do not use generic fixed phrases if data is missing.
 *   • If no meaningful data exists, return "".
 *   • User can edit the result; calling buildNarrative again regenerates.
 *
 * Fix 5 integration:
 *   • centerCount > 1 → "2 Diamonds, 1.00 ct each / 2.00 ct total"
 *   • centerCount = 1 → "1.00 ct Diamond center stone"
 */
export function buildNarrative(cfg) {
  if (!cfg) return "";

  const metal       = cfg.metal || "";
  const centerType  = cfg.centerType || "";
  const ct          = parseFloat(cfg.centerCt) || 0;
  const count       = Math.max(1, parseInt(cfg.centerCount, 10) || 1);
  const ss1n        = parseInt(cfg.ss1Count, 10) || 0;
  const ss2n        = parseInt(cfg.ss2Count, 10) || 0;

  // Need at least one real data point
  if (!metal && !centerType) return "";

  const parts = [];

  // Metal
  if (hasValue(metal)) {
    parts.push(`This report describes a handcrafted ${metal} piece`);
  } else {
    parts.push("This report describes a handcrafted piece");
  }

  // Center stone (with count support)
  if (hasValue(centerType) && ct > 0) {
    if (count > 1) {
      const totalCt = ct * count;
      parts.push(
        `set with ${count} ${pluralize(centerType)}, ` +
        `${ct.toFixed(2)} ct each / ${totalCt.toFixed(2)} ct total`
      );
    } else {
      parts.push(`set with a ${ct.toFixed(2)} ct ${centerType} center stone`);
    }
  } else if (hasValue(centerType)) {
    if (count > 1) {
      parts.push(`set with ${count} ${pluralize(centerType)}`);
    } else {
      parts.push(`set with a ${centerType} center stone`);
    }
  }

  // Accent stones
  const accentTypes = [];
  if (ss1n > 0 && hasValue(cfg.ss1Type)) accentTypes.push(pluralize(cfg.ss1Type).toLowerCase());
  if (ss2n > 0 && hasValue(cfg.ss2Type)) accentTypes.push(pluralize(cfg.ss2Type).toLowerCase());
  if (accentTypes.length > 0) {
    parts.push(`complemented by ${accentTypes.join(" and ")} accent stones`);
  }

  if (parts.length <= 1 && parts[0].includes("handcrafted piece")) return "";

  let narrative = parts.join(", ");
  if (!narrative.endsWith(".")) narrative += ".";
  narrative += " The valuation reflects the materials, gemstone characteristics, craftsmanship, and LESHEM.S studio standards.";

  return narrative;
}

// ─── Accent description helper ────────────────────────────────────────────────
function buildAccentDesc(count, ctEach, type, setting) {
  const n = parseInt(count, 10) || 0;
  if (n <= 0) return "";
  const totalCt = Math.round(n * (parseFloat(ctEach) || 0) * 100) / 100;
  const base    = formatStoneCount(n, totalCt, type);
  const setStr  = hasValue(setting) ? ` \u00b7 ${setting}` : "";
  return base + setStr;
}

// ─── createDefaultJewelryReport ───────────────────────────────────────────────
export function createDefaultJewelryReport(calculatorData = {}) {
  const { cfg = {}, res = {}, fmtFn, pieceImg, qNum } = calculatorData;
  const safeFormat = fmtFn || ((v) => `$${Math.round(v || 0).toLocaleString()}`);
  const isDiamond  = cfg.centerType === "Diamond";
  const today      = fmtReportDate();

  const centerCount = Math.max(1, parseInt(cfg.centerCount, 10) || 1);
  const centerCt    = parseFloat(cfg.centerCt) || 0;
  const totalCenterCt = centerCt * centerCount;

  const ss1n = parseInt(cfg.ss1Count, 10) || 0;
  const ss2n = parseInt(cfg.ss2Count, 10) || 0;
  const acc1 = buildAccentDesc(ss1n, cfg.ss1Ct, cfg.ss1Type, cfg.ss1Setting);
  const acc2 = buildAccentDesc(ss2n, cfg.ss2Ct, cfg.ss2Type, cfg.ss2Setting);

  const images     = pieceImg ? [pieceImg] : [];
  const imageCrops = images.map(() => defaultCrop());

  // Center stone carat display
  let caratDisplay = "";
  if (centerCt > 0) {
    caratDisplay = centerCount > 1
      ? `${centerCount} × ${centerCt.toFixed(2)} ct (${totalCenterCt.toFixed(2)} ct total)`
      : `${centerCt.toFixed(2)} ct`;
  }

  return {
    reportType:   "jewelry_valuation",
    productType:  "jewelry",
    reportNumber: qNum || generateReportNumber("LS-JV"),
    reportDate:   today,

    preparedFor:     cfg.clientName || "",
    itemTitle:       cfg.quoteName  || "",

    // Fix 8: narrative from real data only; user can regenerate
    itemDescription: buildNarrative(cfg),

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
      carat:        caratDisplay,
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

    // Fix 9: empty by default — only shown when user enters real data
    workmanshipDesc: "",

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
export function createDefaultStoneReport(stoneData = {}, productType = "natural_diamond") {
  const resolvedType = productType || stoneData.productType || "natural_diamond";

  const images     = stoneData.images     || [];
  const imageCrops = stoneData.imageCrops || images.map(() => defaultCrop());

  return {
    reportType:   "inhouse_stone",
    productType:  resolvedType,
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
