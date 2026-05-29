/**
 * lib/calculations.js  —  v5.2.2
 *
 * Changes from v5.2.1:
 *
 * Task 1 — Calculator zero state:
 *   centerCost calculation now has an explicit guard:
 *     if centerCtEach === 0 AND no manual override → centerCost = 0
 *   This makes the "metal-only product" case explicit and clear.
 *   Previously this worked via parseFloat("") = 0, but the intent
 *   was implicit. Now it is documented and tested.
 *
 *   calcApp return value now includes `centerCtEach` for display
 *   in CostSummary and reports.
 *
 * Task 1 — mcOv fix:
 *   DCFG now includes mcOv: "". calcApp correctly uses:
 *     const mcF = ovr(cfg.mcOv, mc)
 *   when both mcManual and mcOv can be set independently.
 *
 * All other logic identical to v5.2.1.
 */

import { ILS_RATE, METAL_SPOT, METAL_PURITY, CMULT, MU } from "./constants";

// ─── Formatting helpers ───────────────────────────────────────────────────────

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

export const r2 = (n) => Math.round((n || 0) * 100) / 100;

export const fmtDate = () =>
  new Intl.DateTimeFormat("en-GB", {
    day:   "2-digit",
    month: "long",
    year:  "numeric",
  }).format(new Date());

export const ovr = (override, calculated) =>
  override !== "" && override !== null && override !== undefined
    ? parseFloat(override) || 0
    : calculated;

// ─── Diamond estimator ────────────────────────────────────────────────────────

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
  if (c <= 0) return 0;   // explicit guard — no cost for empty/zero carat
  const base =
    c < 0.5  ? 1800 :
    c < 1    ? 3800 :
    c < 2    ? 7200 :
    c < 3    ? 11000 : 16000;

  return base * (colorMap[color] || 0.8) * (clarityMap[clarity] || 0.7) * c;
}

// ─── calcApp — main cost waterfall ────────────────────────────────────────────

/**
 * @param {object}  cfg          Quote config matching DCFG shape.
 * @param {object}  [metalPrices] Optional Airtable-derived alloy prices ($/g).
 *                               Built by buildMetalPrices() in pages/index.js.
 * @returns {object} All intermediate and final values in USD.
 *
 * Metal-only product:
 *   Set grams + metal, leave centerCt empty → centerCost = 0 ✓
 *   totals = metal cost + labor only
 *
 * Waterfall:
 *   rawMC  = grams × alloySpot
 *   mc     = rawMC or mcManual override
 *   mcF    = mc    or mcOv waterfall override
 *   centerCost = $0 when centerCt is empty or 0 (no stone entered)
 *   lc     = grams × cmplx_multiplier × $20/g
 *   oh     = (rawMC + lc + stones) × 8%
 *   prod   = mcF + lc + stones + oh  (or prodOv)
 *   ws     = prod × MU.ws            (or wsOv)
 *   rx     = ws   × MU.rx            (or rxOv)
 *   ri     = rx   × MU.ri            (or riOv)
 */
export function calcApp(cfg, metalPrices = {}) {
  const grams = parseFloat(cfg.grams) || 0;

  // ── Alloy spot price ─────────────────────────────────────────────────────
  const alloySpot =
    (metalPrices && typeof metalPrices[cfg.metal] === "number")
      ? metalPrices[cfg.metal]
      : (METAL_SPOT[cfg.metal] ?? 58);

  const rawMC = grams * alloySpot;

  // ── Metal cost (mcManual first-layer override) ────────────────────────────
  let mc;
  const hasMcManual = cfg.mcManual !== "" && cfg.mcManual !== undefined && cfg.mcManual !== null;
  if (hasMcManual) {
    const mv = parseFloat(cfg.mcManual) || 0;
    mc = cfg.mcMode === "per_gram" ? mv * grams : mv;
  } else {
    mc = rawMC;
  }

  // ── Center stone ─────────────────────────────────────────────────────────
  const centerCount   = Math.max(1, parseInt(cfg.centerCount, 10) || 1);
  const centerCtEach  = parseFloat(cfg.centerCt) || 0;
  const totalCenterCt = centerCtEach * centerCount;

  let centerCost = 0;
  const hasCenterManual = cfg.centerManual !== "" && cfg.centerManual !== undefined && cfg.centerManual !== null;

  if (hasCenterManual) {
    // Manual price always applies regardless of ct
    const cv = parseFloat(cfg.centerManual) || 0;
    centerCost = cfg.centerMode === "per_carat"
      ? cv * (totalCenterCt || 1)
      : cv;
  } else if (centerCtEach > 0) {
    // Auto-estimate only when carat weight is entered
    // This is the key zero-state fix: no ct → $0 center stone cost
    if (cfg.centerType === "Diamond") {
      centerCost = estDiamond(centerCtEach, cfg.centerColor, cfg.centerClarity) * centerCount;
    } else {
      centerCost = totalCenterCt * 1200;
    }
  }
  // else: centerCtEach === 0 and no manual → centerCost stays 0

  // ── Side-stone cost helper ─────────────────────────────────────────────────
  function ssCost(typeF, ctF, countF, manualF, modeF) {
    const ct    = parseFloat(cfg[ctF]) || 0;
    const count = parseInt(cfg[countF], 10) || 0;
    if (count === 0) return 0;
    const totalCt = ct * count;
    const hasManual = cfg[manualF] !== "" && cfg[manualF] !== undefined && cfg[manualF] !== null;
    if (hasManual) {
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

  // ── Labour & overheads ─────────────────────────────────────────────────────
  const lc = grams * (CMULT[cfg.cmplx] || 1.2) * 20;
  const oh = (rawMC + lc + stones) * 0.08;

  // ── Waterfall ──────────────────────────────────────────────────────────────
  const mcF   = ovr(cfg.mcOv,   mc);          // second-layer metal override (CostSummary)
  const lcF   = ovr(cfg.lcOv,   lc);
  const prodF = ovr(cfg.prodOv, mcF + lcF + stones + oh);
  const wsF   = ovr(cfg.wsOv,   prodF * MU.ws);
  const rxF   = ovr(cfg.rxOv,   wsF   * MU.rx);
  const riF   = ovr(cfg.riOv,   rxF   * MU.ri);

  return {
    mc:   mcF,
    lc:   lcF,
    centerCost,
    ss1Cost,
    ss2Cost,
    stones,
    prod: prodF,
    ws:   wsF,
    rx:   rxF,
    ri:   riF,
    // Diagnostic / display values
    grams,
    rawMC,
    alloySpot,
    centerCount,
    centerCtEach,
    totalCenterCt,
  };
}

/**
 * buildMetalPrices — convert Airtable metals (pure-metal $/g) to alloy $/g.
 * Called in pages/index.js after metals fetch.
 *
 * @param {Array<{ metalType: string, pricePerGram: number }>} metals
 * @returns {object}  { "18K Yellow Gold": 111, ... }
 */
export function buildMetalPrices(metals) {
  if (!Array.isArray(metals) || metals.length === 0) return {};
  const result = {};
  metals.forEach(({ metalType, pricePerGram }) => {
    if (!metalType || typeof pricePerGram !== "number") return;
    const purity = METAL_PURITY[metalType];
    result[metalType] = typeof purity === "number"
      ? pricePerGram * purity
      : pricePerGram;
  });
  return result;
}
