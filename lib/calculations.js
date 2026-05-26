/**
 * lib/calculations.js
 *
 * Pure utility and formula functions.
 * Zero React imports — fully unit-testable, safe to import anywhere.
 *
 * Exports:
 *   fmt(value, currency)  — format a USD value as "$1,234" or "₪4,628"
 *   r2(n)                 — round to 2 decimal places
 *   fmtDate()             — today as "26 May 2026"
 *   ovr(override, calc)   — use manual override when non-empty, else calculated
 *   estDiamond(ct, color, clarity) — estimate diamond wholesale cost (USD)
 *   calcApp(cfg)          — full cost waterfall; returns all intermediate values
 */

import { ILS_RATE, METAL_SPOT, CMULT, MU } from "./constants";

// ─── Formatting helpers ───────────────────────────────────────────────

/**
 * Format a USD amount for display.
 * When currency === "ILS" the value is multiplied by ILS_RATE (3.75).
 */
export function fmt(value, currency = "USD") {
  const v      = Number(value) || 0;
  const amount = currency === "ILS" ? v * ILS_RATE : v;
  const sym    = currency === "ILS" ? "₪" : "$";
  return (
    sym +
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(amount))
  );
}

/** Round to 2 decimal places, guarding against NaN. */
export const r2 = (n) => Math.round((n || 0) * 100) / 100;

/** Today's date formatted as "26 May 2026". */
export const fmtDate = () =>
  new Intl.DateTimeFormat("en-GB", {
    day:   "2-digit",
    month: "long",
    year:  "numeric",
  }).format(new Date());

/**
 * Return the manual override when it is a non-empty, non-null string;
 * otherwise return the calculated fallback.
 */
export const ovr = (override, calculated) =>
  override !== "" && override !== null && override !== undefined
    ? parseFloat(override) || 0
    : calculated;

// ─── Diamond estimator ────────────────────────────────────────────────

/**
 * Estimate the wholesale USD cost of a round brilliant diamond.
 * Uses simplified Rapaport-style per-carat base prices multiplied by
 * color and clarity penalty factors.
 *
 * @param {number|string} ct      Carat weight
 * @param {string}        color   GIA color grade (D – L)
 * @param {string}        clarity GIA clarity grade (FL – I1)
 * @returns {number} Estimated wholesale cost in USD
 */
export function estDiamond(ct, color, clarity) {
  const colorMap = {
    D: 1, E: 0.97, F: 0.94, G: 0.88,
    H: 0.80, I: 0.70, J: 0.60, K: 0.50, L: 0.42,
  };
  const clarityMap = {
    FL: 1, IF: 0.98, VVS1: 0.95, VVS2: 0.90,
    VS1: 0.82, VS2: 0.74, SI1: 0.60, SI2: 0.48, I1: 0.32,
  };

  const c    = Number(ct) || 0;
  const base =
    c < 0.5 ? 1800 :
    c < 1   ? 3800 :
    c < 2   ? 7200 :
    c < 3   ? 11000 : 16000;

  return base * (colorMap[color] || 0.8) * (clarityMap[clarity] || 0.7) * c;
}

// ─── Main calculation waterfall ───────────────────────────────────────

/**
 * Run the full cost waterfall for a quote config object.
 *
 * @param {object} cfg  Quote config — matches the shape of DCFG
 * @returns {object} All intermediate and final cost values (USD)
 *
 * Waterfall order:
 *   rawMC  = grams × spot price          (metal raw cost)
 *   mc     = rawMC  or manual override (total | per_gram)
 *   centerCost = estimated or manual (total | per_carat)
 *   ss1/2Cost  = estimated or manual (total | per_carat)
 *   stones = centerCost + ss1Cost + ss2Cost
 *   lc     = grams × complexity-multiplier × labour rate
 *   oh     = (rawMC + lc + stones) × 8 %
 *   prod   = mc + lc + stones + oh   (or override)
 *   ws     = prod × 1.40              (or override) — wholesale
 *   rx     = ws   × 1.50              (or override) — retail ex-VAT
 *   ri     = rx   × 1.25              (or override) — retail incl. VAT ~17%
 */
export function calcApp(cfg) {
  const grams     = parseFloat(cfg.grams) || 0;
  const spotPrice = METAL_SPOT[cfg.metal] || 58;
  const rawMC     = grams * spotPrice;

  // ── Metal cost (with pricing mode) ──────────────────────────────────
  let mc;
  if (cfg.mcManual !== "") {
    const mv = parseFloat(cfg.mcManual) || 0;
    mc = cfg.mcMode === "per_gram" ? mv * grams : mv;
  } else {
    mc = rawMC;
  }

  // ── Center stone cost (with pricing mode) ───────────────────────────
  let centerCost = 0;
  if (cfg.centerManual !== "") {
    const cv = parseFloat(cfg.centerManual) || 0;
    centerCost =
      cfg.centerMode === "per_carat"
        ? cv * (parseFloat(cfg.centerCt) || 1)
        : cv;
  } else if (cfg.centerType === "Diamond") {
    centerCost = estDiamond(
      parseFloat(cfg.centerCt) || 0,
      cfg.centerColor,
      cfg.centerClarity
    );
  } else {
    centerCost = (parseFloat(cfg.centerCt) || 0) * 1200;
  }

  // ── Side-stone cost helper (with pricing mode) ───────────────────────
  function ssCost(typeF, ctF, countF, manualF, modeF) {
    const ct    = parseFloat(cfg[ctF]) || 0;
    const count = parseInt(cfg[countF], 10) || 0;
    if (count === 0) return 0;
    const totalCt = ct * count;
    if (cfg[manualF] !== "") {
      const mv = parseFloat(cfg[manualF]) || 0;
      return cfg[modeF] === "per_carat" ? mv * totalCt : mv;
    }
    return cfg[typeF] === "Diamond"
      ? estDiamond(ct, "H", "VS2") * count
      : totalCt * 1200;
  }

  const ss1Cost = ssCost("ss1Type", "ss1Ct", "ss1Count", "ss1Manual", "ss1PriceMode");
  const ss2Cost = ssCost("ss2Type", "ss2Ct", "ss2Count", "ss2Manual", "ss2PriceMode");
  const stones  = centerCost + ss1Cost + ss2Cost;

  // ── Labour & overheads ───────────────────────────────────────────────
  const lc  = grams * (CMULT[cfg.cmplx] || 1.35) * 20;
  const oh  = (rawMC + lc + stones) * 0.08;

  // ── Waterfall with manual overrides ─────────────────────────────────
  const mcF   = ovr(cfg.mcOv,   mc);           // metal override applied
  const lcF   = ovr(cfg.lcOv,   lc);
  const prodF = ovr(cfg.prodOv, mcF + lcF + stones + oh);
  const wsF   = ovr(cfg.wsOv,   prodF * MU.ws);
  const rxF   = ovr(cfg.rxOv,   wsF   * MU.rx);
  const riF   = ovr(cfg.riOv,   rxF   * MU.ri);

  return {
    mc: mcF,
    lc: lcF,
    centerCost,
    ss1Cost,
    ss2Cost,
    stones,
    prod: prodF,
    ws:   wsF,
    rx:   rxF,
    ri:   riF,
    // Raw values exposed for placeholders
    grams,
    rawMC,
  };
}
