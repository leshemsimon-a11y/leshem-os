/**
 * lib/reports/reportDefaults.js  —  v5.4.4
 *
 * Changes from v5.4.2:
 *
 * Milestone 5.4.4 — Context-Aware Stone Certificate Wording:
 *
 * 1. filterCertComments(rawComments) — new exported helper.
 *    Strips lines that must not appear in a customer-facing certificate:
 *      • "Source: …"   — internal inventory origin note added by handleCertFromItem
 *      • Lines that contain Airtable record IDs (rec[A-Za-z0-9]{14,})
 *      • Lines that start with internal prefixes ("Lab:", "Report:", "---")
 *      • Hebrew text (never goes in a cert)
 *      • Blank lines after stripping
 *    What it KEEPS:
 *      • Professional gemological comments that don't match the above patterns
 *    Returns null (not empty string) if no professional content remains,
 *    so the Comments section is skipped entirely.
 *
 * 2. buildStoneClassification() — now produces ONLY customer-facing fields.
 *    Removed from output:
 *      • inventoryLayer   — internal system field ("Physical Stock", etc.)
 *      • stoneCategory    — redundant / confusing alongside productCategory
 *    Kept:
 *      • productCategory  — stone identity for cert header (used by StoneIdentityBlock)
 *      • stoneType        — species ("Diamond", "Sapphire")
 *      • formFactor       — "Single Stone" / "Matched Pair" / "Parcel / Melee"
 *      • quantity         — stone count (parcel / pair)
 *      • growthMethod     — gemological (CVD, HPHT)
 *      • intendedUse      — ONLY when professionally useful:
 *                           "Center Stone" or "Side Stones" only.
 *                           Never "Sale", "Assembly", "Display", etc.
 *
 * All other exports unchanged from v5.4.2.
 */

import {
  generateReportNumber,
  fmtReportDate,
  hasValue,
  pluralize,
  formatStoneCount,
} from "./reportUtils";

import { PRODUCT_TYPE_TO_REPORT } from "../gemology/taxonomy";
import { toReportEn, toCanonical, LABEL_MAP, isHebrew } from "../labels/productLabels";

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

// ─── filterCertComments ───────────────────────────────────────────────────────
/**
 * v5.4.3: Removes internal/system lines from the comments field before
 * the value reaches a customer-facing certificate.
 *
 * Strips:
 *   • Lines beginning with "Source:"  — internal inventory origin
 *   • Lines beginning with "Lab:"     — cert import note (handled elsewhere)
 *   • Lines beginning with "Report:"  — cert import note
 *   • Lines beginning with "---"      — section dividers from cert import
 *   • Lines containing Airtable record IDs (rec + 14+ alphanumeric chars)
 *   • Lines containing Hebrew characters
 *   • Lines that look like demo/test notes ("DEMO", "demo", "virtual", "test")
 *   • Lines that are only whitespace after trimming
 *
 * Returns: cleaned string if professional content remains, or null to omit
 * the Comments section entirely.
 */
export function filterCertComments(rawComments) {
  if (!rawComments || typeof rawComments !== "string") return null;

  const STRIP_PATTERNS = [
    /^Source:/i,
    /^Lab:/i,
    /^Report:/i,
    /^---/,
    /rec[A-Za-z0-9]{14,}/,          // Airtable record ID
    /\bDEMO\b/i,                    // demo marker
    /\bdemo virtual\b/i,
    /\bvirtual\s+stock\b/i,
    /\btest\s+item\b/i,
    /\bairtable\b/i,
    /\binternal\b/i,
  ];

  const HEBREW_RE = /[\u0590-\u05FF\uFB1D-\uFB4F]/;

  const cleaned = rawComments
    .split("\n")
    .map(line => line.trim())
    .filter(line => {
      if (!line) return false;
      if (HEBREW_RE.test(line)) return false;
      for (const pattern of STRIP_PATTERNS) {
        if (pattern.test(line)) return false;
      }
      return true;
    })
    .join("\n")
    .trim();

  return cleaned.length > 0 ? cleaned : null;
}

// ─── CERT_SAFE_INTENDED_USES ──────────────────────────────────────────────────
// Only these intended use values are appropriate for a customer-facing cert.
// Internal/commercial values like "Sale", "Assembly", "Display" are omitted.
const CERT_SAFE_INTENDED_USES = new Set([
  "center stone",
  "center_stone",
  "Center Stone",
  "side stones",
  "side_stones",
  "Side Stones",
  "pair",
  "Pair",
  "earrings",
  "Earrings",
]);

// ─── mapProductTypeToCertificate ──────────────────────────────────────────────
export function mapProductTypeToCertificate(productType) {
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
 * v5.4.3: Returns ONLY customer-facing fields for the certificate.
 *
 * Removed from output vs v5.4.2:
 *   • inventoryLayer   — internal: "Physical Stock", "Virtual Supplier Stock"
 *   • stoneCategory    — redundant: covered by productCategory
 *
 * Intended use: only "Center Stone" / "Side Stones" / "Pair" / "Earrings"
 * are considered professionally relevant. Commercial values ("Sale",
 * "Assembly", "Display") are not shown in a cert.
 *
 * @param {object} item  Normalized inventory item (from normalizeStone or demo)
 * @returns {object}     English-only, cert-safe classification metadata
 */
export function buildStoneClassification(item) {
  if (!item) return {};
  const out = {};

  // v5.4.4: certificates created directly from inventory are standalone loose-stone reports.
  // In that context, Center Stone / Side Stones are internal intended-use hints and must NOT
  // appear as the customer-facing stone identity. Jewelry/calculator contexts may opt in.
  const reportContext = item.reportContext || "inventory_standalone";
  const isStandaloneInventoryReport = reportContext === "inventory_standalone";
  out.reportContext = reportContext;

  const pt = item.productTypeKey
    ?? toCanonical(item.productType)
    ?? item.productType
    ?? "";

  // ── productCategory ───────────────────────────────────────────────────────
  // Used by StoneIdentityBlock in the cert header — specific English label.
  const rawStoneTypeForIdentity = item.stoneType || item.species || item.variety || "";
  const stoneTypeEnForIdentity = toReportEn(rawStoneTypeForIdentity) || rawStoneTypeForIdentity;
  const isDiamondLike = /diamond/i.test(stoneTypeEnForIdentity) || ["natural_diamond","lab_grown_diamond","fancy_color_diamond"].includes(pt);

  switch (pt) {
    case "natural_diamond":
      out.productCategory = isStandaloneInventoryReport ? "Loose Natural Diamond" : "Natural Diamond";
      break;
    case "lab_grown_diamond":
      out.productCategory = isStandaloneInventoryReport ? "Loose Laboratory-Grown Diamond" : "Laboratory-Grown Diamond";
      break;
    case "fancy_color_diamond":
      out.productCategory = isStandaloneInventoryReport ? "Loose Fancy Colour Diamond" : "Fancy Colour Diamond";
      break;
    case "colored_gemstone":
      if (isStandaloneInventoryReport && stoneTypeEnForIdentity && !isHebrew(stoneTypeEnForIdentity)) {
        out.productCategory = `Loose ${stoneTypeEnForIdentity}`;
      } else {
        out.productCategory = isStandaloneInventoryReport ? "Loose Coloured Gemstone" : "Coloured Gemstone";
      }
      break;
    case "stone_pair_set":
      out.productCategory = isStandaloneInventoryReport ? "Loose Stone Pair / Set" : "Matched Pair / Set";
      break;
    case "stone_parcel":
      out.productCategory = isStandaloneInventoryReport
        ? (isDiamondLike ? "Loose Diamond Parcel" : "Loose Gemstone Parcel")
        : (isDiamondLike ? "Diamond Parcel" : "Gemstone Parcel");
      break;
    case "jewelry_part":
      out.productCategory = "Jewelry Component";
      break;
    case "finished_jewelry":
      out.productCategory = "Finished Jewelry";
      break;
    default:
      if (item.productType) {
        const en = toReportEn(item.productType);
        if (en) out.productCategory = isStandaloneInventoryReport && !/^Loose /i.test(en) ? `Loose ${en}` : en;
      }
  }

  // ── stoneType: English species ─────────────────────────────────────────────
  const rawStoneType = item.stoneType;
  if (hasValue(rawStoneType)) {
    const canonicalStone = item.stoneTypeKey ?? toCanonical(rawStoneType);
    if (canonicalStone && LABEL_MAP[canonicalStone]) {
      out.stoneType = LABEL_MAP[canonicalStone].reportLabelEn;
    } else {
      const en = toReportEn(rawStoneType);
      if (en) out.stoneType = en;
    }
  }
  // Diamond types always have stoneType = "Diamond"
  if (["natural_diamond","lab_grown_diamond","fancy_color_diamond"].includes(pt)) {
    out.stoneType = "Diamond";
  }

  // ── formFactor ─────────────────────────────────────────────────────────────
  const count = parseInt(item.stoneCount, 10) || 1;
  switch (pt) {
    case "stone_pair_set":
      out.quantity   = String(count);
      out.formFactor = count === 2 ? "Matched Pair" : `Set of ${count}`;
      break;
    case "stone_parcel":
      out.quantity   = count > 1 ? `${count} stones` : "Parcel";
      out.formFactor = count > 1 ? "Melee Parcel" : "Stone Parcel";
      break;
    default:
      if (count > 1) {
        out.quantity   = String(count);
        out.formFactor = `${count} stones`;
      } else {
        out.formFactor = "Single Stone";
      }
  }

  // ── growthMethod — gemological, cert-appropriate ──────────────────────────
  if (pt === "lab_grown_diamond" && hasValue(item.growthMethod)) {
    const gm = toReportEn(item.growthMethod) || item.growthMethod;
    if (gm && !isHebrew(gm)) out.growthMethod = gm;
  }

  // ── intendedUse — ONLY in jewelry/calculator context ─────────────────────
  // v5.4.4: Center Stone / Side Stones are roles inside a jewelry project, not
  // the identity of a loose inventory item. Hide them for standalone inventory certificates.
  if (!isStandaloneInventoryReport && hasValue(item.intendedUse)) {
    const rawUse = item.intendedUse;
    const enUse  = toReportEn(rawUse) || rawUse;

    // Only include if the value is in the cert-safe set
    const isCertSafe = CERT_SAFE_INTENDED_USES.has(rawUse)
      || CERT_SAFE_INTENDED_USES.has(enUse)
      || (item.intendedUseKey && CERT_SAFE_INTENDED_USES.has(item.intendedUseKey));

    if (isCertSafe && enUse && !isHebrew(enUse)) {
      out.intendedUse = enUse;
    }
  }

  // ── inventoryLayer — NOT included in cert output ──────────────────────────
  // "Physical Stock", "Virtual Supplier Stock", "Client-Owned Item" are
  // internal system fields and must not appear in customer-facing certificates.
  // (They remain visible in the Inventory Drawer UI via InventoryDrawer.jsx.)

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
  const reportContext = stoneData.reportContext || "inventory_standalone";

  const images     = stoneData.images     || [];
  const imageCrops = stoneData.imageCrops || images.map(() => defaultCrop());

  return {
    reportType:   "inhouse_stone",
    productType:  resolvedType,
    reportNumber: stoneData.reportNumber || generateReportNumber("LS-ST"),
    reportDate:   stoneData.reportDate   || fmtReportDate(),
    reportContext,

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

    // v5.4.3: classification contains only cert-safe fields
    // (no inventoryLayer, no internal-system values)
    classification: stoneData.classification || {},

    images,
    imageCrops,
    externalReports: stoneData.externalReports || [],
    // v5.4.3: comments are filtered at build time (pages/index.js uses
    // filterCertComments before setting this field) and again at render time
    // in InHouseStoneReport.jsx.
    comments:        stoneData.comments        || "",
    verification:    { ...EMPTY_VERIFICATION },
    credentials:     { ...DEFAULT_CREDENTIALS },

    displaySettings: {
      showReferencePanel: true,
    },
  };
}
