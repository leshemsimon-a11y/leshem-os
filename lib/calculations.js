/**
 * lib/calculations.js  —  v5.2.1
 *
 * Changes from v4.x:
 *
 * Fix 3 — Airtable metal price integration:
 *   calcApp() now accepts an optional second argument `metalPrices`.
 *   When provided, it overrides METAL_SPOT fallbacks.
 *   The `metalPrices` object is built in pages/index.js from the
 *   Airtable metals API response (server-side, never exposes token).
 *
 *   Airtable metals table stores pure-metal base price per gram.
 *   calcApp() applies METAL_PURITY[alloy] to derive alloy spot price:
 *     alloySpotPrice = pureMetal$/g × purityFactor
 *
 *   Example: 18K Yellow Gold, pure gold $148/g:
 *     alloySpotPrice = 148 × 0.75 = $111/g
 *     rawMC (10g)    = 111 × 10   = $1,110 ✓
 *
 *   If `metalPrices` is absent or doesn't contain the current alloy,
 *   falls back to METAL_SPOT[alloy] (never crashes).
 *
 * Fix 5 — Multiple center stones:
 *   centerCount (default 1) is read from cfg.
 *   totalCenterCt = centerCt × centerCount
 *   centerCost now multiplies estDiamond() by centerCount.
 *   per_carat manual override is applied to totalCenterCt.
 *
 * Exports (unchanged public surface):
 *   fmt(value, currency)
 *   r2(n)
 *   fmtDate()
 *   ovr(override, calc)
 *   estDiamond(ct, color, clarity)
 *   calcApp(cfg, metalPrices?)
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
  const base =
    c < 0.5  ? 1800 :
    c < 1    ? 3800 :
    c < 2    ? 7200 :
    c < 3    ? 11000 : 16000;

  return base * (colorMap[color] || 0.8) * (clarityMap[clarity] || 0.7) * c;
}

// ─── calcApp — main cost waterfall ────────────────────────────────────────────

/**
 * Run the full cost waterfall for a quote config.
 *
 * @param {object}  cfg         Quote config matching DCFG shape.
 * @param {object}  [metalPrices]
 *   Optional map: { "18K Yellow Gold": 111, "14K Yellow Gold": 85, ... }
 *   Values are ALLOY prices in USD/g (already purity-adjusted).
 *   Built in pages/index.js from Airtable metals data:
 *     Object.fromEntries(
 *       metals.map(m => [m.metalType, m.pricePerGram * purity])
 *     )
 *   If the current alloy is absent, falls back to METAL_SPOT[alloy].
 *
 * @returns {object}  All intermediate and final cost values (USD).
 *
 * Waterfall:
 *   rawMC  = grams × alloySpot
 *   mc     = rawMC or manual override
 *   centerCost = estimated (× centerCount) or manual
 *   ss1/2Cost  = estimated or manual
 *   stones = centerCost + ss1Cost + ss2Cost
 *   lc     = grams × complexity-multiplier × $20/g labour rate
 *   oh     = (rawMC + lc + stones) × 8%  overhead
 *   prod   = mc + lc + stones + oh        (or override)
 *   ws     = prod × MU.ws                 (or override)
 *   rx     = ws   × MU.rx                 (or override)
 *   ri     = rx   × MU.ri                 (or override)
 */
export function calcApp(cfg, metalPrices = {}) {
  const grams      = parseFloat(cfg.grams) || 0;

  // ── Resolve alloy spot price ─────────────────────────────────────────
  // Priority: Airtable-derived metalPrices → METAL_SPOT fallback → 58 $/g
  const alloySpot =
    (metalPrices && typeof metalPrices[cfg.metal] === "number")
      ? metalPrices[cfg.metal]
      : (METAL_SPOT[cfg.metal] ?? 58);

  const rawMC = grams * alloySpot;

  // ── Metal cost (with manual override) ───────────────────────────────
  let mc;
  if (cfg.mcManual !== "" && cfg.mcManual !== undefined && cfg.mcManual !== null) {
    const mv = parseFloat(cfg.mcManual) || 0;
    mc = cfg.mcMode === "per_gram" ? mv * grams : mv;
  } else {
    mc = rawMC;
  }

  // ── Center stone count (Fix 5) ───────────────────────────────────────
  const centerCount  = Math.max(1, parseInt(cfg.centerCount, 10) || 1);
  const centerCtEach = parseFloat(cfg.centerCt) || 0;
  const totalCenterCt = centerCtEach * centerCount;

  // ── Center stone cost ────────────────────────────────────────────────
  let centerCost = 0;
  if (cfg.centerManual !== "" && cfg.centerManual !== undefined && cfg.centerManual !== null) {
    const cv = parseFloat(cfg.centerManual) || 0;
    // per_carat applies to totalCenterCt, total applies as-is
    centerCost = cfg.centerMode === "per_carat" ? cv * totalCenterCt : cv;
  } else if (cfg.centerType === "Diamond") {
    // Estimate per stone, then multiply by count
    centerCost = estDiamond(centerCtEach, cfg.centerColor, cfg.centerClarity) * centerCount;
  } else {
    centerCost = totalCenterCt * 1200;
  }

  // ── Side-stone cost helper ───────────────────────────────────────────
  function ssCost(typeF, ctF, countF, manualF, modeF) {
    const ct      = parseFloat(cfg[ctF]) || 0;
    const count   = parseInt(cfg[countF], 10) || 0;
    if (count === 0) return 0;
    const totalCt = ct * count;
    if (cfg[manualF] !== "" && cfg[manualF] !== undefined && cfg[manualF] !== null) {
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
  const lc = grams * (CMULT[cfg.cmplx] || 1.2) * 20;
  const oh = (rawMC + lc + stones) * 0.08;

  // ── Waterfall with manual overrides ─────────────────────────────────
  const mcF   = ovr(cfg.mcOv,   mc);
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
    // Raw / diagnostic values
    grams,
    rawMC,
    alloySpot,
    centerCount,
    totalCenterCt,
  };
}

/**
 * buildMetalPrices — convert Airtable metals array to a calcApp-compatible
 * metalPrices map.
 *
 * Called in pages/index.js after the /api/airtable/metals fetch.
 * Airtable stores PURE metal price per gram (e.g. pure gold = $148/g).
 * We multiply by METAL_PURITY to get the alloy price.
 *
 * @param {Array<{ metalType: string, pricePerGram: number }>} metals
 * @returns {object}  { "18K Yellow Gold": 111, "14K Yellow Gold": 86, ... }
 */
export function buildMetalPrices(metals) {
  if (!Array.isArray(metals) || metals.length === 0) return {};

  const result = {};

  const normalizeName = (value) => String(value || "").trim().toLowerCase();
  const parsePrice = (value) => {
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    if (value === null || value === undefined || value === "") return null;
    const cleaned = String(value).replace(/[^0-9.\-]/g, "");
    if (!cleaned) return null;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  };

  // Airtable can store either exact alloy rows (e.g. “18K Yellow Gold”)
  // or pure material rows in Hebrew (e.g. “זהב טהור”). Support both.
  let pureGold = null;
  let purePlatinum = null;
  let pureSilver = null;

  metals.forEach(({ metalType, pricePerGram }) => {
    const name = normalizeName(metalType);
    const price = parsePrice(pricePerGram);
    if (!name || price === null) return;

    // Exact alloy already exists in the Airtable table. Treat as pure base if
    // it is explicitly pure, otherwise keep exact alloy as provided.
    if (METAL_PURITY[metalType] && !name.includes("טהור") && !name.includes("pure")) {
      result[metalType] = price;
      return;
    }

    if (name.includes("זהב") || name.includes("gold")) {
      if (name.includes("טהור") || name.includes("pure") || name.includes("24k")) pureGold = price;
    }
    if (name.includes("פלטינה") || name.includes("platinum")) {
      if (name.includes("טהור") || name.includes("pure")) purePlatinum = price;
    }
    if (name.includes("כסף") || name.includes("silver")) {
      if (name.includes("טהור") || name.includes("pure")) pureSilver = price;
    }
  });

  Object.entries(METAL_PURITY).forEach(([alloy, purity]) => {
    if (result[alloy] != null) return;
    if (alloy.includes("Gold") && pureGold != null) result[alloy] = pureGold * purity;
    if (alloy.includes("Platinum") && purePlatinum != null) result[alloy] = purePlatinum * purity;
    if (alloy.includes("Silver") && pureSilver != null) result[alloy] = pureSilver * purity;
  });

  return result;
}
