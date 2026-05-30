/**
 * lib/reports/reportDefaults.js  —  v5.4.1
 *
 * Changes from v5.4:
 *
 * Task 3 — Fix certificate type mapping:
 *   handleCertFromItem (in pages/index.js) calls mapProductTypeToCertificate()
 *   exported here. Mapping:
 *
 *   natural_diamond     → { reportType: "inhouse_stone", productType: "natural_diamond" }
 *   lab_grown_diamond   → { reportType: "inhouse_stone", productType: "lab_grown_diamond" }
 *   fancy_color_diamond → { reportType: "inhouse_stone", productType: "fancy_color_diamond" }
 *   colored_gemstone    → { reportType: "inhouse_stone", productType: "colored_gemstone" }
 *   stone_pair_set      → { reportType: "inhouse_stone", productType: "stone_pair_set" }
 *   stone_parcel        → { reportType: "inhouse_stone", productType: "stone_parcel" }
 *   jewelry_part        → { reportType: null }  — no certificate unless user confirms
 *   finished_jewelry    → { reportType: "jewelry_valuation", productType: "jewelry" }
 *   (default)           → { reportType: "inhouse_stone", productType: "natural_diamond" }
 *
 *   stone_parcel is NEVER mapped to stone_pair_set.
 *   jewelry_part is NEVER mapped to natural_diamond.
 *
 * Task 4 — Stone classification metadata:
 *   buildStoneClassification(item) returns a structure with:
 *     { productCategory, stoneCategory, stoneType, quantity, formFactor, origin }
 *   Used by InHouseStoneReport to render the classification section.
 *
 * All other exports unchanged from v5.4.
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

export function defaultCrop() {
  return { scale: 1.0, offsetX: 50, offsetY: 50 };
}

// ─── mapProductTypeToCertificate ──────────────────────────────────────────────
/**
 * v5.4.1 Task 3: maps a stone/item productType to the correct report type.
 *
 * Returns { reportType, productType } or { reportType: null } when no
 * certificate is appropriate without user confirmation.
 *
 * IMPORTANT:
 *   stone_parcel → "stone_parcel" (NOT stone_pair_set, NOT matched_pair)
 *   jewelry_part → { reportType: null }
 *   finished_jewelry → "jewelry_valuation"
 */
export function mapProductTypeToCertificate(productType) {
  switch (productType) {
    case "natural_diamond":
      return { reportType: "inhouse_stone",       productType: "natural_diamond"     };
    case "lab_grown_diamond":
      return { reportType: "inhouse_stone",       productType: "lab_grown_diamond"   };
    case "fancy_color_diamond":
      return { reportType: "inhouse_stone",       productType: "fancy_color_diamond" };
    case "colored_gemstone":
      return { reportType: "inhouse_stone",       productType: "colored_gemstone"    };
    case "stone_pair_set":
      return { reportType: "inhouse_stone",       productType: "stone_pair_set"      };
    case "stone_parcel":
      // stone_parcel is NOT a matched pair — it is a parcel/melee of multiple stones
      return { reportType: "inhouse_stone",       productType: "stone_parcel"        };
    case "jewelry_part":
      // No certificate by default — caller must prompt user for confirmation
      return { reportType: null,                  productType: "jewelry_part"        };
    case "finished_jewelry":
      return { reportType: "jewelry_valuation",   productType: "jewelry"             };
    default:
      // Unknown product type → treat as natural_diamond (most common)
      return { reportType: "inhouse_stone",       productType: "natural_diamond"     };
  }
}

// ─── buildStoneClassification ─────────────────────────────────────────────────
/**
 * v5.4.1 Task 4: builds a structured classification object from an inventory
 * item for use in the InHouseStoneReport classification section.
 *
 * Only returns fields that have actual values — never returns empty strings
 * for fields that should not appear.
 *
 * @param {object} item  Normalized inventory item or stone data object
 * @returns {object}     Classification metadata
 */
export function buildStoneClassification(item) {
  if (!item) return {};
  const out = {};

  const pt = item.productType || "";

  // Product Category
  switch (pt) {
    case "natural_diamond":
    case "lab_grown_diamond":
    case "fancy_color_diamond":
      out.productCategory = "Diamond";
      break;
    case "colored_gemstone":
      out.productCategory = "Coloured Gemstone";
      break;
    case "stone_pair_set":
      out.productCategory = "Diamond or Gemstone";
      break;
    case "stone_parcel":
      out.productCategory = "Stone Parcel / Melee";
      break;
    case "jewelry_part":
      out.productCategory = "Jewelry Component";
      break;
    case "finished_jewelry":
      out.productCategory = "Finished Jewelry";
      break;
  }

  // Stone Category (origin type)
  switch (pt) {
    case "natural_diamond":
      out.stoneCategory = "Natural Diamond";
      break;
    case "lab_grown_diamond":
      out.stoneCategory = "Laboratory-Grown Diamond";
      if (item.growthMethod) out.growthMethod = item.growthMethod;
      break;
    case "fancy_color_diamond":
      out.stoneCategory = "Fancy Colour Diamond";
      break;
    case "colored_gemstone":
      out.stoneCategory = item.stoneType || "Coloured Gemstone";
      break;
    case "stone_pair_set":
      out.stoneCategory = "Matched Pair / Set";
      break;
    case "stone_parcel":
      out.stoneCategory = "Stone Parcel";
      break;
  }

  // Stone Type (explicit species)
  if (hasValue(item.stoneType) && pt !== "stone_parcel") {
    out.stoneType = item.stoneType;
  }

  // Quantity / Stone Count
  const count = parseInt(item.stoneCount, 10) || 1;
  switch (pt) {
    case "stone_pair_set":
      out.quantity   = String(count);
      out.formFactor = count === 2 ? "Matched Pair" : `Set of ${count}`;
      break;
    case "stone_parcel":
      out.quantity   = count > 1 ? `${count} stones` : "Parcel";
      out.formFactor = "Parcel / Melee";
      break;
    default:
      if (count > 1) {
        out.quantity   = String(count);
        out.formFactor = `${count} stones`;
      } else {
        out.formFactor = "Single Stone";
      }
  }

  // Intended use → context label
  if (hasValue(item.intendedUse)) {
    out.intendedUse = item.intendedUse;
  }

  // Inventory layer
  if (hasValue(item.inventoryLayer)) {
    out.inventoryLayer = item.inventoryLayer;
  }

  return out;
}

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

  const CAST_LABELS = {
    "CAD / Casting":   "CAD production and casting",
    "Hand Fabricated": "hand fabrication",
    "Lost Wax":        "lost-wax casting",
    "3D Printing":     "3D printing",
    "Hand Engraving":  "hand engraving",
  };

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
  narrative = narrative.charAt(0).toUpperCase() + narrative.slice(1);
  narrative += " The valuation reflects the materials, gemstone characteristics, craftsmanship, and LESHEM.S studio standards.";
  return narrative;
}

// ─── makeDefaultCenterStoneEntry ─────────────────────────────────────────────
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
    shape:             cfg.centerSetting || "",
    carat:             caratDisplay,
    color:             isDiamond ? (cfg.centerColor   || "") : "",
    clarity:           isDiamond ? (cfg.centerClarity || "") : "",
    cost:              0,
    certificateLab:    "",
    certificateNumber: "",
  };
}

// ─── buildAccentDesc ──────────────────────────────────────────────────────────
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

    centerStones: centerCt > 0 || cfg.centerType
      ? [makeDefaultCenterStoneEntry(cfg)]
      : [],

    accentStonesDesc: [acc1, acc2].filter(Boolean).join("\n"),
    workmanshipDesc:  "",

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

    // v5.4.1: classification metadata for InHouseStoneReport header section
    classification: stoneData.classification || {},

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
