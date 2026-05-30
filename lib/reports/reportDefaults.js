/**
 * lib/reports/reportDefaults.js  —  v5.4
 *
 * Changes from v5.2.1:
 *
 * Task 7 — Multiple Center Stones foundation:
 *   createDefaultJewelryReport() now returns a `centerStones[]` array
 *   alongside the existing `centerStone` singular object.
 *
 *   If cfg has data, centerStones[0] mirrors the primary center stone.
 *   The array is designed to be extended when multiple stones are added
 *   from inventory (see prefillCalcFromItem in pages/index.js).
 *
 *   Each entry shape:
 *     {
 *       source:           "inventory" | "manual"
 *       inventoryId:      string | null
 *       stoneType:        string
 *       shape:            string
 *       carat:            string   (formatted, e.g. "1.02 ct")
 *       color:            string
 *       clarity:          string
 *       cost:             number
 *       certificateLab:   string
 *       certificateNumber:string
 *     }
 *
 *   JewelryValuationReport.jsx continues to use the singular `centerStone`
 *   field for backward compatibility — no template changes required.
 *   When the multi-stone UI is built, it will map centerStones[] to the
 *   report's centerStone field and accentStonesDesc.
 *
 * All other exports and logic unchanged from v5.2.1.
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

// ─── Workmanship builder ──────────────────────────────────────────────────────
const CAST_LABELS = {
  "CAD / Casting":   "CAD production and casting",
  "Hand Fabricated": "hand fabrication",
  "Lost Wax":        "lost-wax casting",
  "3D Printing":     "3D printing",
  "Hand Engraving":  "hand engraving",
};

// ─── buildNarrative ───────────────────────────────────────────────────────────
export function buildNarrative(cfg) {
  const metal       = cfg.metal || "";
  const grams       = parseFloat(cfg.grams) || 0;
  const cast        = cfg.cast  || "";
  const complexity  = cfg.cmplx || "";
  const centerType  = cfg.centerType || "";
  const ct          = parseFloat(cfg.centerCt) || 0;
  const count       = Math.max(1, parseInt(cfg.centerCount, 10) || 1);
  const ss1n        = parseInt(cfg.ss1Count, 10) || 0;
  const ss2n        = parseInt(cfg.ss2Count, 10) || 0;

  if (!metal && !centerType) return "";

  const parts = [];

  if (hasValue(metal) && grams > 0) {
    const castStr = hasValue(cast) && CAST_LABELS[cast] ? ` crafted via ${CAST_LABELS[cast]}` : "";
    const cmplStr = hasValue(complexity) ? ` (${complexity.toLowerCase()} construction)` : "";
    parts.push(`${grams.toFixed(2)}g ${metal} setting${castStr}${cmplStr}`);
  } else if (hasValue(metal)) {
    parts.push(`${metal} setting`);
  }

  if (hasValue(centerType) && ct > 0) {
    if (count > 1) {
      parts.push(
        `set with ${count} ${pluralize(centerType)}, ` +
        `${ct.toFixed(2)} ct each (${(ct * count).toFixed(2)} ct total)`
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

  const accentTypes = [];
  if (ss1n > 0 && hasValue(cfg.ss1Type)) accentTypes.push(pluralize(cfg.ss1Type).toLowerCase());
  if (ss2n > 0 && hasValue(cfg.ss2Type)) accentTypes.push(pluralize(cfg.ss2Type).toLowerCase());
  if (accentTypes.length > 0) {
    parts.push(`accented with ${accentTypes.join(" and ")}`);
  }

  if (parts.length === 0) return "";

  let narrative = parts.join(", ") + ".";
  narrative =
    narrative.charAt(0).toUpperCase() + narrative.slice(1);
  narrative += " The valuation reflects the materials, gemstone characteristics, craftsmanship, and LESHEM.S studio standards.";
  return narrative;
}

// ─── makeDefaultCenterStone ───────────────────────────────────────────────────
/**
 * Build a single centerStones[] entry from cfg.
 * Used by createDefaultJewelryReport for the foundation array.
 */
function makeDefaultCenterStoneEntry(cfg) {
  const isDiamond   = cfg.centerType === "Diamond";
  const centerCount = Math.max(1, parseInt(cfg.centerCount, 10) || 1);
  const centerCt    = parseFloat(cfg.centerCt) || 0;
  const totalCt     = centerCt * centerCount;

  let caratDisplay = "";
  if (centerCt > 0) {
    caratDisplay = centerCount > 1
      ? `${centerCount} × ${centerCt.toFixed(2)} ct (${totalCt.toFixed(2)} ct total)`
      : `${centerCt.toFixed(2)} ct`;
  }

  return {
    source:            "manual",
    inventoryId:       null,
    stoneType:         cfg.centerType    || "",
    shape:             cfg.centerSetting || "",   // shape is not in cfg; setting used as proxy
    carat:             caratDisplay,
    color:             isDiamond ? (cfg.centerColor   || "") : "",
    clarity:           isDiamond ? (cfg.centerClarity || "") : "",
    cost:              0,
    certificateLab:    "",
    certificateNumber: "",
  };
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

    itemDescription: buildNarrative(cfg),

    images,
    imageCrops,

    metal: {
      alloy:   cfg.metal || "",
      weight:  cfg.grams ? `${parseFloat(cfg.grams).toFixed(2)} g` : "",
      purity:  "",
      casting: cfg.cast  || "",
    },

    // Singular center stone — backward compat with JewelryValuationReport template
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

    // v5.4: Multiple center stones array foundation (Task 7)
    // The UI to add/remove stones from this array is built in a future milestone.
    // For now it is pre-populated from cfg to mirror the singular centerStone.
    // pages/index.js prefillCalcFromItem populates this from inventory items.
    centerStones: centerCt > 0 || cfg.centerType
      ? [makeDefaultCenterStoneEntry(cfg)]
      : [],

    accentStonesDesc: [acc1, acc2].filter(Boolean).join("\n"),

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
