/**
 * lib/reports/reportDefaults.js  —  v5.4.2
 *
 * Changes from v5.4.1:
 *
 * Language normalization (Milestone 5.4.2):
 *
 *   buildStoneClassification() now calls toReportEn() on every string it places
 *   into the classification object that will appear in a certificate.
 *   This guarantees that productCategory, stoneCategory, stoneType, formFactor,
 *   intendedUse, and inventoryLayer are all English when they reach the template.
 *
 *   Stone type resolution:
 *     For productType "natural_diamond" / "lab_grown_diamond" / "fancy_color_diamond":
 *       st.stoneType is normalized via toReportEn().
 *       If the raw value is "יהלום" it becomes "Diamond".
 *       If it's already "Diamond" it stays "Diamond".
 *     For "colored_gemstone":
 *       st.stoneType is normalized via toReportEn().
 *       If the raw value is "ספיר" it becomes "Sapphire".
 *
 *   intendedUse normalization:
 *     "אבן מרכזית" → "Center Stone"
 *     "אבני צד"    → "Side Stones"
 *     "מכירה"      → "Sale"
 *     etc.
 *
 *   inventoryLayer normalization:
 *     "מלאי פיזי" → "Physical Stock"
 *     etc.
 *
 * Classification section de-duplication (Task 4 spec):
 *   For Natural Diamond:
 *     productCategory: "Natural Diamond"    (NOT just "Diamond" — more specific)
 *     stoneType: "Diamond"                  (species only)
 *     NO stoneCategory row (redundant with productCategory)
 *
 *   For Colored Gemstone:
 *     productCategory: "Coloured Gemstone"
 *     stoneType: the actual species (e.g. "Sapphire")
 *     NO stoneCategory (productCategory already says it's a gemstone)
 *
 *   For Stone Parcel:
 *     productCategory: "Stone Parcel"       (clear, not "Diamond")
 *     stoneType: if known, show it (e.g. "Diamond" for melee)
 *     formFactor: "Parcel / Melee"
 *
 * All other exports unchanged from v5.4.1.
 */

import {
  generateReportNumber,
  fmtReportDate,
  hasValue,
  pluralize,
  formatStoneCount,
} from "./reportUtils";

import { PRODUCT_TYPE_TO_REPORT } from "../gemology/taxonomy";
import { toReportEn, LABEL_MAP }  from "../labels/productLabels";

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
 * Maps a stone/item productType (canonical or raw) to the correct report type.
 * Accepts both canonical keys ("natural_diamond") and raw values ("יהלום טבעי").
 */
export function mapProductTypeToCertificate(productType) {
  // Resolve to canonical key first so Hebrew values work too
  const { toCanonical } = require("../labels/productLabels");
  const canonical = toCanonical(productType) ?? productType;

  switch (canonical) {
    case "natural_diamond":
      return { reportType: "inhouse_stone",     productType: "natural_diamond"     };
    case "lab_grown_diamond":
      return { reportType: "inhouse_stone",     productType: "lab_grown_diamond"   };
    case "fancy_color_diamond":
      return { reportType: "inhouse_stone",     productType: "fancy_color_diamond" };
    case "colored_gemstone":
      return { reportType: "inhouse_stone",     productType: "colored_gemstone"    };
    case "stone_pair_set":
      return { reportType: "inhouse_stone",     productType: "stone_pair_set"      };
    case "stone_parcel":
      return { reportType: "inhouse_stone",     productType: "stone_parcel"        };
    case "jewelry_part":
      return { reportType: null,                productType: "jewelry_part"        };
    case "finished_jewelry":
      return { reportType: "jewelry_valuation", productType: "jewelry"             };
    default:
      return { reportType: "inhouse_stone",     productType: "natural_diamond"     };
  }
}

// ─── buildStoneClassification ─────────────────────────────────────────────────
/**
 * v5.4.2: All string values are passed through toReportEn() so they are
 * English when they reach the InHouseStoneReport template.
 *
 * Classification section de-duplication rules:
 *   - productCategory is the primary descriptor (most specific English label)
 *   - stoneCategory is OMITTED when it would duplicate productCategory
 *   - stoneType shows the species ("Diamond", "Sapphire", etc.)
 *   - For natural/lab/fancy diamonds, stoneType = "Diamond" (always English)
 *   - For colored_gemstone, stoneType = English name of the specific gem
 *
 * @param {object} item  Normalized inventory item (from normalizeStone or demo)
 * @returns {object}     English-only classification metadata
 */
export function buildStoneClassification(item) {
  if (!item) return {};
  const out = {};

  // Use the canonical productTypeKey if available, otherwise try to resolve the raw value
  const { toCanonical } = require("../labels/productLabels");
  const pt = item.productTypeKey
    ?? toCanonical(item.productType)
    ?? item.productType
    ?? "";

  // ── productCategory: specific English label ──────────────────────────────
  switch (pt) {
    case "natural_diamond":
      out.productCategory = "Natural Diamond";    // not just "Diamond"
      break;
    case "lab_grown_diamond":
      out.productCategory = "Laboratory-Grown Diamond";
      break;
    case "fancy_color_diamond":
      out.productCategory = "Fancy Colour Diamond";
      break;
    case "colored_gemstone":
      out.productCategory = "Coloured Gemstone";
      break;
    case "stone_pair_set":
      out.productCategory = "Matched Pair / Set";
      break;
    case "stone_parcel":
      out.productCategory = "Stone Parcel";       // never "Diamond" or "Matched Pair"
      break;
    case "jewelry_part":
      out.productCategory = "Jewelry Component";
      break;
    case "finished_jewelry":
      out.productCategory = "Finished Jewelry";
      break;
    default:
      // Unknown canonical — try to derive from raw productType
      if (item.productType) {
        const en = toReportEn(item.productType);
        if (en) out.productCategory = en;
      }
  }

  // ── stoneCategory: OMIT when it duplicates productCategory ───────────────
  // We only show stoneCategory when it adds meaningful information beyond
  // productCategory. For natural/lab/fancy diamonds the productCategory
  // is already specific enough ("Natural Diamond", "Lab-Grown Diamond").
  // stoneCategory is still useful for stone_pair_set to clarify
  // that it IS a pair (not just "Matched Pair" from productCategory).
  switch (pt) {
    case "stone_parcel":
      // productCategory = "Stone Parcel" already says it all
      // Only show stoneCategory if we know the stone species
      break;
    // For all other types, stoneCategory is omitted — productCategory covers it
  }

  // ── stoneType: English species name ──────────────────────────────────────
  // Normalize the raw stoneType to English regardless of whether it came in
  // as "יהלום" or "Diamond".
  const rawStoneType = item.stoneType;
  if (hasValue(rawStoneType)) {
    // Use the stoneTypeKey if the canonical key was already resolved
    const canonicalStone = item.stoneTypeKey
      ?? toCanonical(rawStoneType);
    if (canonicalStone && LABEL_MAP[canonicalStone]) {
      out.stoneType = LABEL_MAP[canonicalStone].reportLabelEn;
    } else {
      // Not in canonical map — pass through toReportEn which will strip Hebrew
      const en = toReportEn(rawStoneType);
      if (en) out.stoneType = en;
    }
  }

  // For natural/lab/fancy diamond — stoneType should always be "Diamond"
  if (["natural_diamond","lab_grown_diamond","fancy_color_diamond"].includes(pt)) {
    out.stoneType = "Diamond";
  }

  // For stone_parcel with stoneType "diamond" / "יהלום" — show "Diamond"
  if (pt === "stone_parcel" && out.stoneType) {
    out.stoneType = out.stoneType; // already normalized
  }

  // ── formFactor ────────────────────────────────────────────────────────────
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

  // ── intendedUse: English → normalize ─────────────────────────────────────
  if (hasValue(item.intendedUse)) {
    const en = toReportEn(item.intendedUse);
    if (en) out.intendedUse = en;
    // If toReportEn returns "" (unknown Hebrew) we skip the row
  }

  // ── inventoryLayer: English → normalize ──────────────────────────────────
  if (hasValue(item.inventoryLayer)) {
    const en = toReportEn(item.inventoryLayer);
    if (en) out.inventoryLayer = en;
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
