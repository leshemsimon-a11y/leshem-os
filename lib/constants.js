/**
 * lib/constants.js  —  v5.2.1
 *
 * Changes from v4.4:
 *   + METAL_PURITY — purity factor per alloy (24K=1.0 … Platinum=0.95)
 *   + DCFG.centerCount = 1 — multiple center stones (Fix 5)
 *   + DCFG override fields aligned to calculations.js (mcManual, mcMode, etc.)
 *   + MU keys aligned to calculations.js: MU.ws / MU.rx / MU.ri
 *   + Gold alloy names all include "Gold" (Fix 4):
 *       "18K Yellow" → "18K Yellow Gold"  (was already correct in v4.4)
 *       All entries were already correct in v4.4 — kept verbatim.
 *   ~ All other tokens unchanged.
 */

// ─── Brand tokens ─────────────────────────────────────────────────────────────
export const C = {
  iv:  "#FAF9F6",   // ivory
  ch:  "#36454F",   // charcoal
  chm: "#4a5c68",   // charcoal mid
  chl: "#7a8e98",   // charcoal light
  chx: "#a8bcc4",   // charcoal extra-light
  gd:  "#C5B358",   // muted gold
  sg:  "#8aab8e",   // dusty sage
  // Fonts
  ser: "'Merriweather','Times New Roman',Georgia,serif",
  heb: "'Assistant','Heebo',Arial,sans-serif",
  dat: "'DM Sans',Helvetica,Arial,sans-serif",
};

// ─── Currency ────────────────────────────────────────────────────────────────
export const ILS_RATE = 3.75;

// ─── Metal types ─────────────────────────────────────────────────────────────
/**
 * All gold alloy names include "Gold" explicitly.
 * "Silver (925)" and "Platinum" unchanged.
 */
export const METALS = [
  "18K Yellow Gold",
  "18K White Gold",
  "18K Rose Gold",
  "14K Yellow Gold",
  "14K White Gold",
  "14K Rose Gold",
  "21K Yellow Gold",
  "9K Yellow Gold",
  "9K White Gold",
  "Platinum",
  "Silver (925)",
];

/**
 * METAL_PURITY — fraction of pure metal per alloy.
 *
 * Used to derive alloy spot price from pure-metal base price:
 *   alloySpot = pureMetal$/g × METAL_PURITY[alloy]
 *
 * Pure gold: 24K = 1.0
 * 21K: 21/24 = 0.875
 * 18K: 18/24 = 0.75
 * 14K: 14/24 ≈ 0.5833  (using 0.585 per industry convention)
 *  9K:  9/24 = 0.375
 * Platinum 950: 0.95
 * Silver 925: 0.925
 */
export const METAL_PURITY = {
  "18K Yellow Gold":  0.75,
  "18K White Gold":   0.75,
  "18K Rose Gold":    0.75,
  "14K Yellow Gold":  0.585,
  "14K White Gold":   0.585,
  "14K Rose Gold":    0.585,
  "21K Yellow Gold":  0.875,
  "9K Yellow Gold":   0.375,
  "9K White Gold":    0.375,
  "Platinum":         0.95,
  "Silver (925)":     0.925,
};

/**
 * METAL_SPOT — fallback spot prices in USD per gram (alloy, not pure metal).
 *
 * These are used when Airtable metal prices are unavailable.
 * Basis: pure gold ≈ $96/g (mid-2025 working placeholder).
 *   18K = 0.75 × 96 ≈ $72/g
 *   14K = 0.585 × 96 ≈ $56/g
 *   21K = 0.875 × 96 ≈ $84/g
 *
 * When Airtable metals data IS available, calcApp() receives
 * metalPrices = { "18K Yellow Gold": 72, ... } and these values
 * are overridden. See lib/calculations.js for details.
 */
export const METAL_SPOT = {
  "18K Yellow Gold":  72,
  "18K White Gold":   72,
  "18K Rose Gold":    72,
  "14K Yellow Gold":  56,
  "14K White Gold":   56,
  "14K Rose Gold":    56,
  "21K Yellow Gold":  84,
  "9K Yellow Gold":   36,
  "9K White Gold":    36,
  "Platinum":        50,
  "Silver (925)":     1,
};

// ─── Casting methods ──────────────────────────────────────────────────────────
export const CASTS = [
  "CAD / Casting",
  "Hand Fabricated",
  "Lost Wax",
  "Hand Engraving",
  "3D Printing",
];

// ─── Complexity levels ────────────────────────────────────────────────────────
export const CMPLX = [
  "Simple",
  "Medium",
  "Complex",
  "Very Complex",
  "Extreme",
];

// ─── Complexity multipliers ───────────────────────────────────────────────────
export const CMULT = {
  "Simple":       1.0,
  "Medium":       1.2,
  "Complex":      1.5,
  "Very Complex": 1.85,
  "Extreme":      2.3,
};

// ─── Stone types ──────────────────────────────────────────────────────────────
export const STYPES = [
  "Diamond",
  "Ruby",
  "Emerald",
  "Sapphire",
  "Pearl",
  "Alexandrite",
  "Tanzanite",
  "Spinel",
  "Aquamarine",
  "Opal",
  "Amethyst",
  "Citrine",
  "Other",
];

// ─── Diamond color grades ─────────────────────────────────────────────────────
export const COLORS_D = [
  "D","E","F","G","H","I","J","K","L","M","N",
];

// ─── Diamond clarity grades ───────────────────────────────────────────────────
export const CLARITIES = [
  "FL","IF","VVS1","VVS2","VS1","VS2","SI1","SI2","I1","I2","I3",
];

// ─── Setting types ────────────────────────────────────────────────────────────
export const SETTINGS = [
  "Prong / Claw",
  "Bezel",
  "Pavé",
  "Channel",
  "Flush / Burnish",
  "Tension",
  "Invisible",
  "Bar",
];

// ─── Markup ───────────────────────────────────────────────────────────────────
/**
 * MU keys aligned to calculations.js usage: MU.ws / MU.rx / MU.ri
 *   ws = wholesale multiplier from production cost
 *   rx = retail ex-VAT multiplier from wholesale
 *   ri = retail incl. VAT multiplier from retail ex-VAT
 */
export const MU = {
  ws: 1.40,   // production cost → wholesale
  rx: 1.50,   // wholesale → retail ex-VAT
  ri: 1.25,   // retail ex-VAT → retail incl. ~17% VAT
};

// ─── Default calculator config ────────────────────────────────────────────────
/**
 * DCFG is the canonical initial state for the calculator.
 * Spread it when creating a fresh quote:
 *   const [cfg, setCfg] = useState({ ...DCFG });
 *
 * v5.2.1: Added centerCount = 1 for multiple center stone support (Fix 5).
 * Override fields (mcManual, mcMode, etc.) added to match calculations.js.
 */
export const DCFG = {
  // Metal
  metal:    "18K Yellow Gold",
  grams:    "",
  cast:     "CAD / Casting",
  cmplx:    "Medium",

  // Metal cost override
  mcManual: "",
  mcMode:   "total",      // "total" | "per_gram"

  // Center stone
  centerType:    "Diamond",
  centerCt:      "1.00",
  centerCount:   "1",     // v5.2.1 — multiple center stones (Fix 5)
  centerColor:   "G",
  centerClarity: "VS1",
  centerManual:  "",
  centerMode:    "total", // "total" | "per_carat"
  centerSetting: "Prong / Claw",

  // Side stones — row 1
  ss1Type:      "Diamond",
  ss1Ct:        "0.05",
  ss1Count:     "0",
  ss1Manual:    "",
  ss1PriceMode: "total",  // "total" | "per_carat"
  ss1Setting:   "Pavé",

  // Side stones — row 2
  ss2Type:      "Diamond",
  ss2Ct:        "0.03",
  ss2Count:     "0",
  ss2Manual:    "",
  ss2PriceMode: "total",
  ss2Setting:   "Pavé",

  // Waterfall overrides (empty string = use calculated value)
  lcOv:   "",
  prodOv: "",
  wsOv:   "",
  rxOv:   "",
  riOv:   "",

  // Client information
  clientName: "",
  quoteName:  "",
  notes:      "",
};
