/**
 * lib/reports/reportDefaults.js  —  v1.1
 *
 * Factory functions that create editable report data objects.
 *
 * Changes in v1.1:
 *   + buildNarrative(cfg) — auto-generates professional description
 *   + buildWorkmanshipDesc(cfg) — generates professional workmanship sentence
 *   + buildAccentDesc(cfg) — "22 Rubies · 1.10 ct total weight · Pavé"
 *   + verification: {} block added to both report types
 *   ~ Accent stone wording: professional count + total weight, pluralised type names
 */

import {
  generateReportNumber,
  fmtReportDate,
  hasValue,
  pluralize,
  formatStoneCount,
} from "./reportUtils";

// ─── Shared credentials ───────────────────────────────────────────────────────
const DEFAULT_CREDENTIALS = {
  signatoryName: "Leshem Simon",
  title:         "Founder · Certified Diamond Grader & Expert Jeweler",
  companyLine:   "LESHEM.S Jewelry · Tuval St 23, Ramat Gan · VAT: 046240016",
};

// ─── Empty verification block ─────────────────────────────────────────────────
/**
 * Verification fields are data-model support only in v1.1.
 * No backend or QR generation is implemented.
 * Future implementation must:
 *   - Use an unguessable token as verificationId
 *   - Expose only public-approved report data at verificationUrl
 *   - Support revocable access
 */
const EMPTY_VERIFICATION = {
  verificationId:  "",
  verificationUrl: "",
  qrImageUrl:      "",
};

// ─── Casting method labels ────────────────────────────────────────────────────
const CAST_LABELS = {
  "CAD / Casting":   "CAD production and casting",
  "Hand Fabricated": "hand fabrication",
  "Lost Wax":        "lost-wax casting",
  "Hand Engraving":  "hand engraving",
  "3D Printing":     "3D-printed form and casting",
};

// ─── Complexity labels ────────────────────────────────────────────────────────
const CMPLX_LABELS = {
  "Simple":       "standard",
  "Medium":       "moderately detailed",
  "Complex":      "high-complexity",
  "Very Complex": "very high-complexity",
  "Extreme":      "extraordinary-complexity",
};

// ─── buildWorkmanshipDesc ─────────────────────────────────────────────────────
/**
 * Build a professional workmanship sentence from calculator cfg.
 *
 * "CAD / Casting" + "Complex" → "CAD production and casting, high-complexity craftsmanship"
 * "Hand Fabricated" only      → "Hand fabrication"
 * "Complex" only              → "High-complexity craftsmanship"
 */
function buildWorkmanshipDesc(cfg) {
  if (!cfg) return "";
  const castLabel  = CAST_LABELS[cfg.cast]   || (cfg.cast  ? cfg.cast  : "");
  const cmplxAdj   = CMPLX_LABELS[cfg.cmplx] || (cfg.cmplx ? cfg.cmplx.toLowerCase() : "");

  if (castLabel && cmplxAdj) {
    return `${castLabel}, ${cmplxAdj} craftsmanship`;
  }
  if (castLabel) return castLabel;
  if (cmplxAdj)  return `${cmplxAdj.charAt(0).toUpperCase() + cmplxAdj.slice(1)} craftsmanship`;
  return "";
}

// ─── buildAccentDesc ──────────────────────────────────────────────────────────
/**
 * Build a professional accent-stone description from one side-stone group.
 *
 * count=22, ctEach=0.05, type="Ruby", setting="Pavé"
 *   → "22 Rubies · 1.10 ct total weight · Pavé"
 */
function buildAccentDesc(count, ctEach, type, setting) {
  const n   = parseInt(count, 10) || 0;
  if (n <= 0) return "";

  const totalCt = Math.round(n * (parseFloat(ctEach) || 0) * 100) / 100;
  const base    = formatStoneCount(n, totalCt, type);
  const setStr  = hasValue(setting) ? ` · ${setting}` : "";
  return base + setStr;
}

// ─── buildNarrative ───────────────────────────────────────────────────────────
/**
 * Generate an editable professional narrative from available calculator data.
 * Only includes facts that exist.
 *
 * Example output:
 *   "This report describes a handcrafted 18K Yellow Gold piece, set with
 *    a 1.02 ct Diamond center stone, complemented by rubies and diamond
 *    accent stones. The valuation reflects the materials, gemstone
 *    characteristics, craftsmanship, and LESHEM.S studio standards."
 */
function buildNarrative(cfg) {
  if (!cfg) return "";

  const metal   = cfg.metal     || "";
  const center  = cfg.centerType || "";
  const ct      = parseFloat(cfg.centerCt) || 0;
  const ss1n    = parseInt(cfg.ss1Count, 10) || 0;
  const ss2n    = parseInt(cfg.ss2Count, 10) || 0;

  if (!metal && !center) return "";

  // Opening sentence
  let s = "This report describes a handcrafted";
  if (metal) s += ` ${metal}`;
  s += " piece";

  if (hasValue(center)) {
    const ctStr = ct > 0 ? ` ${ct.toFixed(2)} ct ` : " ";
    s += `, set with a${ctStr}${center} center stone`;
  }

  // Accent stone types (plural, lower-case)
  const accentTypes = [];
  if (ss1n > 0 && hasValue(cfg.ss1Type)) {
    accentTypes.push(pluralize(cfg.ss1Type).toLowerCase());
  }
  if (ss2n > 0 && hasValue(cfg.ss2Type)) {
    accentTypes.push(pluralize(cfg.ss2Type).toLowerCase());
  }
  if (accentTypes.length > 0) {
    s += `, complemented by ${accentTypes.join(" and ")} accent stones`;
  }

  s += ".";

  // Concluding sentence (always appended when piece is described)
  s += " The valuation reflects the materials, gemstone characteristics, craftsmanship, and LESHEM.S studio standards.";

  return s;
}

// ─── createDefaultJewelryReport ───────────────────────────────────────────────
/**
 * Build a Jewelry Valuation Report data object from the current calculator state.
 * Every field is pre-filled from available data and remains freely editable.
 *
 * @param {object} calculatorData  { cfg, res, fmtFn, pieceImg, qNum }
 */
export function createDefaultJewelryReport(calculatorData = {}) {
  const { cfg = {}, res = {}, fmtFn, pieceImg, qNum } = calculatorData;

  const safeFormat = fmtFn || ((v) => `$${Math.round(v || 0).toLocaleString()}`);
  const isDiamond  = cfg.centerType === "Diamond";
  const today      = fmtReportDate();

  // ── Accent stone descriptions ──
  const ss1n      = parseInt(cfg.ss1Count, 10) || 0;
  const ss2n      = parseInt(cfg.ss2Count, 10) || 0;
  const acc1      = buildAccentDesc(ss1n, cfg.ss1Ct, cfg.ss1Type, cfg.ss1Setting);
  const acc2      = buildAccentDesc(ss2n, cfg.ss2Ct, cfg.ss2Type, cfg.ss2Setting);
  const accentStonesDesc = [acc1, acc2].filter(Boolean).join("\n");

  return {
    // ── Meta ──
    reportType:   "jewelry_valuation",
    reportNumber: qNum || generateReportNumber("LS-JV"),
    reportDate:   today,

    // ── Identity ──
    preparedFor:     cfg.clientName  || "",
    itemTitle:       cfg.quoteName   || "",
    itemDescription: buildNarrative(cfg),

    // ── Images ──
    images: pieceImg ? [pieceImg] : [],

    // ── Metal ──
    metal: {
      alloy:   cfg.metal || "",
      weight:  cfg.grams ? `${parseFloat(cfg.grams).toFixed(2)} g` : "",
      purity:  "",          // not tracked in calculator — user fills manually
      casting: cfg.cast  || "",
    },

    // ── Center stone ──
    centerStone: {
      type:         cfg.centerType    || "",
      carat:        cfg.centerCt      ? `${parseFloat(cfg.centerCt).toFixed(2)} ct` : "",
      color:        isDiamond ? (cfg.centerColor   || "") : "",
      clarity:      isDiamond ? (cfg.centerClarity || "") : "",
      cut:          "",          // not tracked — user fills
      setting:      cfg.centerSetting || "",
      fluorescence: "",          // not tracked — user fills
      origin:       "",          // not tracked — user fills
      certLab:      "",          // not tracked — user fills
      certNumber:   "",          // not tracked — user fills
    },

    // ── Stones summary ──
    accentStonesDesc,
    workmanshipDesc: buildWorkmanshipDesc(cfg),

    // ── Valuation ──
    valuation: {
      enabled:  true,
      amount:   res.ri ? safeFormat(res.ri) : "",
      currency: "USD",
      basis:    "Retail Replacement Value",
      date:     today,
    },

    // ── Notes ──
    notes: cfg.notes || "",

    // ── Verification (future backend) ──
    verification: { ...EMPTY_VERIFICATION },

    // ── Footer ──
    credentials:     { ...DEFAULT_CREDENTIALS },
    displaySettings: { showValuation: true },
  };
}

// ─── createDefaultStoneReport ─────────────────────────────────────────────────
/**
 * Build an In-House Stone Report data object from stone source data.
 * Passing {} produces a blank report ready for manual entry.
 *
 * @param {object} stoneData  Flat stone data object (from inventory or manual)
 */
export function createDefaultStoneReport(stoneData = {}) {
  return {
    // ── Meta ──
    reportType:   "inhouse_stone",
    reportNumber: stoneData.reportNumber || generateReportNumber("LS-ST"),
    reportDate:   stoneData.reportDate   || fmtReportDate(),

    // ── Stone data ──
    stone: {
      type:             stoneData.type             || "",
      naturalOrLab:     stoneData.naturalOrLab     || "",
      species:          stoneData.species          || "",
      variety:          stoneData.variety          || "",
      shape:            stoneData.shape            || "",
      carat:            stoneData.carat            || "",
      measurements:     stoneData.measurements     || "",
      color:            stoneData.color            || "",
      colorDescription: stoneData.colorDescription || "",
      clarity:          stoneData.clarity          || "",
      cut:              stoneData.cut              || "",
      polish:           stoneData.polish           || "",
      symmetry:         stoneData.symmetry         || "",
      fluorescence:     stoneData.fluorescence     || "",
      treatment:        stoneData.treatment        || "",
      countryOfOrigin:  stoneData.countryOfOrigin  || "",
      certLab:          stoneData.certLab          || "",
      certNumber:       stoneData.certNumber       || "",
    },

    images:          stoneData.images          || [],
    externalReports: stoneData.externalReports || [],
    comments:        stoneData.comments        || "",

    // ── Verification (future backend) ──
    verification: { ...EMPTY_VERIFICATION },

    credentials: { ...DEFAULT_CREDENTIALS },
  };
}
