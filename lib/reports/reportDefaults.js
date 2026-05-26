/**
 * lib/reports/reportDefaults.js
 *
 * Factory functions that create editable report data objects.
 * Every field is pre-filled where possible, but remains freely
 * editable in the ReportEditor before printing.
 *
 * Exports:
 *   createDefaultJewelryReport(calculatorData)
 *   createDefaultStoneReport(stoneData)
 *
 * Data shapes mirror the structures expected by:
 *   JewelryValuationReport.jsx
 *   InHouseStoneReport.jsx
 */

import { generateReportNumber, fmtReportDate } from "./reportUtils";

// ─── Shared defaults ──────────────────────────────────────────────────
const DEFAULT_CREDENTIALS = {
  signatoryName: "Leshem Simon",
  title:         "Founder · Certified Diamond Grader & Expert Jeweler",
  companyLine:   "LESHEM.S Jewelry · Tuval St 23, Ramat Gan · VAT: 046240016",
};

// ─── createDefaultJewelryReport ──────────────────────────────────────
/**
 * Build a Jewelry Valuation Report data object from the current
 * calculator state. Every field is pre-filled from available data
 * and can be manually overridden in the editor.
 *
 * @param {object} calculatorData
 *   { cfg, res, fmtFn, pieceImg, qNum }
 *   All fields are optional — passing {} produces a blank report.
 *
 * @returns {object} Editable report data for JewelryValuationReport
 */
export function createDefaultJewelryReport(calculatorData = {}) {
  const { cfg = {}, res = {}, fmtFn, pieceImg, qNum } = calculatorData;

  const safeFormat = fmtFn || ((v) => `$${Math.round(v || 0).toLocaleString()}`);
  const isDiamond  = cfg.centerType === "Diamond";
  const today      = fmtReportDate();

  // ── Build accent stones description ──
  const ss1Count = parseInt(cfg.ss1Count, 10) || 0;
  const ss2Count = parseInt(cfg.ss2Count, 10) || 0;
  let accentStonesDesc = "";

  if (ss1Count > 0) {
    const ct1 = Math.round((parseFloat(cfg.ss1Ct) || 0) * ss1Count * 100) / 100;
    accentStonesDesc = `${ct1} ct tw ${cfg.ss1Type || ""}s — ${ss1Count} stones — ${cfg.ss1Setting || ""}`;
  }
  if (ss2Count > 0) {
    const ct2 = Math.round((parseFloat(cfg.ss2Ct) || 0) * ss2Count * 100) / 100;
    const line = `${ct2} ct tw ${cfg.ss2Type || ""}s — ${ss2Count} stones — ${cfg.ss2Setting || ""}`;
    accentStonesDesc = accentStonesDesc ? `${accentStonesDesc}\n${line}` : line;
  }

  // ── Build workmanship description ──
  const parts = [cfg.cmplx, cfg.cast].filter(Boolean);
  const workmanshipDesc = parts.length ? parts.join(" complexity · ") : "";

  return {
    // ── Meta ──
    reportType:   "jewelry_valuation",
    reportNumber: qNum || generateReportNumber("LS-JV"),
    reportDate:   today,

    // ── Identity ──
    preparedFor:     cfg.clientName  || "",
    itemTitle:       cfg.quoteName   || "",
    itemDescription: "",   // intentionally blank — user writes a narrative

    // ── Images (array of base64 data URLs) ──
    images: pieceImg ? [pieceImg] : [],

    // ── Metal ──
    metal: {
      alloy:   cfg.metal || "",
      weight:  cfg.grams ? `${cfg.grams} g` : "",
      purity:  "",           // not tracked in calculator — user fills
      casting: cfg.cast  || "",
    },

    // ── Center stone ──
    centerStone: {
      type:         cfg.centerType    || "",
      carat:        cfg.centerCt      ? `${cfg.centerCt} ct` : "",
      color:        isDiamond ? (cfg.centerColor    || "") : "",
      clarity:      isDiamond ? (cfg.centerClarity  || "") : "",
      cut:          "",          // not tracked — user fills
      setting:      cfg.centerSetting || "",
      fluorescence: "",          // not tracked — user fills
      origin:       "",          // not tracked — user fills
      certLab:      "",          // not tracked — user fills
      certNumber:   "",          // not tracked — user fills
    },

    // ── Stones summary ──
    accentStonesDesc,
    workmanshipDesc,

    // ── Valuation ──
    valuation: {
      enabled:  true,
      amount:   res.ri ? safeFormat(res.ri) : "",
      currency: "USD",
      basis:    "Retail Replacement Value",
      date:     today,
    },

    // ── Miscellaneous ──
    notes:       cfg.notes || "",
    credentials: { ...DEFAULT_CREDENTIALS },

    // ── Display flags ──
    displaySettings: {
      showValuation: true,
    },
  };
}

// ─── createDefaultStoneReport ─────────────────────────────────────────
/**
 * Build an In-House Stone Report data object from stone source data.
 * When called with {} it produces a blank report ready for manual entry.
 * When called from an inventory record all available fields are pre-filled.
 *
 * @param {object} stoneData   Flat stone data object (from inventory or manual)
 * @returns {object} Editable report data for InHouseStoneReport
 */
export function createDefaultStoneReport(stoneData = {}) {
  return {
    // ── Meta ──
    reportType:   "inhouse_stone",
    reportNumber: stoneData.reportNumber || generateReportNumber("LS-ST"),
    reportDate:   stoneData.reportDate   || fmtReportDate(),

    // ── Stone data (all fields optional) ──
    stone: {
      type:             stoneData.type             || "",   // "Diamond"
      naturalOrLab:     stoneData.naturalOrLab     || "",   // "Natural" | "Lab-Grown"
      species:          stoneData.species          || "",   // "Diamond"
      variety:          stoneData.variety          || "",   // "Colorless" | "Fancy Color"
      shape:            stoneData.shape            || "",   // "Round Brilliant"
      carat:            stoneData.carat            || "",   // "1.02"
      measurements:     stoneData.measurements     || "",   // "6.42 × 6.44 × 3.90 mm"
      color:            stoneData.color            || "",   // "G"
      colorDescription: stoneData.colorDescription || "",   // "Fancy Vivid Blue"
      clarity:          stoneData.clarity          || "",   // "VS1"
      cut:              stoneData.cut              || "",   // "Excellent"
      polish:           stoneData.polish           || "",   // "Excellent"
      symmetry:         stoneData.symmetry         || "",   // "Excellent"
      fluorescence:     stoneData.fluorescence     || "",   // "None"
      treatment:        stoneData.treatment        || "",   // "None"
      countryOfOrigin:  stoneData.countryOfOrigin  || "",   // "Botswana"
      certLab:          stoneData.certLab          || "",   // "GIA"
      certNumber:       stoneData.certNumber       || "",   // "2473659812"
    },

    // ── Images ──
    images: stoneData.images || [],

    // ── External lab reports
    // Each: { lab, reportNumber, attachmentName, attachmentUrl }
    externalReports: stoneData.externalReports || [],

    // ── Comments ──
    comments: stoneData.comments || "",

    // ── Footer ──
    credentials: { ...DEFAULT_CREDENTIALS },
  };
}
