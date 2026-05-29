/**
 * lib/constants.js  —  v5.2.2
 *
 * Changes from v5.2.1:
 *
 * Task 1 — Calculator zero state:
 *   DCFG.centerCt: ""  (was "1.00")
 *     With an empty carat weight, calcApp() produces $0 center stone cost.
 *     Totals start at $0 until the user enters data. Supports metal-only
 *     products — select metal + grams, leave center stone empty.
 *   DCFG.grams: "" (already was "", confirming intention)
 *   Added DCFG.mcOv: "" — fixes silent bug where CostSummary's metal
 *   override StableInp read cfg.mcOv (undefined) instead of "".
 *
 * Task 6 — Terminology:
 *   "הגדרה" → "סוג שיבוץ" (see also CalculatorForm.jsx)
 *   All METALS entries confirmed to include "Gold" (v4.4+ compliant).
 *
 * All other constants (METAL_PURITY, METAL_SPOT, CASTS, CMPLX, CMULT,
 * STYPES, COLORS_D, CLARITIES, SETTINGS, MU) unchanged from v5.2.1.
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
 * Used by buildMetalPrices() in calculations.js to derive alloy $/g
 * from Airtable's pure-metal $/g value.
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
 * METAL_SPOT — fallback alloy prices (USD/g) when Airtable is unavailable.
 * Basis: pure gold ≈ $96/g. 18K = 0.75 × 96 ≈ $72/g.
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

// ─── Setting types (Task 6: "סוג שיבוץ") ─────────────────────────────────────
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
export const MU = {
  ws: 1.40,   // production cost → wholesale
  rx: 1.50,   // wholesale → retail ex-VAT
  ri: 1.25,   // retail ex-VAT → retail incl. ~17% VAT
};

// ─── Default calculator config ────────────────────────────────────────────────
/**
 * DCFG — canonical initial state for the calculator.
 * Spread when creating a fresh quote: const [cfg, setCfg] = useState({ ...DCFG });
 *
 * v5.2.2 changes:
 *   centerCt: ""   ← zero-state fix (was "1.00")
 *     With empty carat weight calcApp returns $0 center stone cost.
 *     Supports metal-only products: fill grams + metal, leave stone empty.
 *   mcOv: ""       ← fixes CostSummary metal override StableInp reading undefined
 */
export const DCFG = {
  // Metal
  metal:    "18K Yellow Gold",
  grams:    "",
  cast:     "CAD / Casting",
  cmplx:    "Medium",

  // Metal cost overrides
  mcManual: "",
  mcMode:   "total",   // "total" | "per_gram"
  mcOv:     "",        // v5.2.2: waterfall override (CostSummary summary row)

  // Center stone — v5.2.2: empty by default → $0 until user enters data
  centerType:    "Diamond",
  centerCt:      "",   // ← KEY: empty = $0 center stone cost
  centerCount:   "1",
  centerColor:   "G",
  centerClarity: "VS1",
  centerManual:  "",
  centerMode:    "total",  // "total" | "per_carat"
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
