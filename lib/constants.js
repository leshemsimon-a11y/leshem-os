/**
 * lib/constants.js
 *
 * Single source of truth for:
 *   • Design tokens (C)
 *   • Exchange rate
 *   • All lookup tables (METALS, CASTS, STYPES, …)
 *   • Markup multipliers (MU, CMULT)
 *   • Default quote config (DCFG)
 *
 * Zero React imports. Zero side-effects. Safe to import anywhere.
 */

// ─── Design tokens ────────────────────────────────────────────────────
export const C = {
  iv:    "#FAF9F6",   // ivory (page background)
  iv2:   "#F0EDE8",   // ivory 2 (stone table background)
  iv3:   "#E5E0D8",   // ivory 3 (subtle divider)
  ch:    "#36454F",   // charcoal (primary text / header bg)
  chm:   "#4a5c68",   // charcoal mid
  chl:   "#7a8e98",   // charcoal light (labels)
  chx:   "#a8bcc4",   // charcoal extra-light (header sub-labels)
  gd:    "#C5B358",   // muted gold (accent)
  gdm:   "#a8973f",   // muted gold dark
  sg:    "#8aab8e",   // dusty sage (optional secondary accent)
  bl:    "rgba(54,69,79,0.10)",
  blm:   "rgba(54,69,79,0.18)",
  blh:   "rgba(54,69,79,0.04)",
  // Font stacks
  serif: "'Merriweather','Times New Roman',Georgia,serif",
  heb:   "'Assistant','Heebo',Arial,sans-serif",
  eng:   "'DM Sans',Helvetica,Arial,sans-serif",
  // aliases for newer report components
  dat:   "'DM Sans',Helvetica,Arial,sans-serif",
  ser:   "'Merriweather','Times New Roman',Georgia,serif",
};

// ─── Currency ─────────────────────────────────────────────────────────
export const ILS_RATE = 3.75;

// ─── Metal options ────────────────────────────────────────────────────
export const METALS = [
  "18K Yellow",
  "18K White",
  "18K Rose",
  "14K Yellow",
  "14K White",
  "14K Rose",
  "21K Yellow",
  "Platinum 950",
  "Silver 925",
];

/** Spot-derived cost per gram (USD) for each alloy. */
export const METAL_SPOT = {
  "18K Yellow":   58,
  "18K White":    58,
  "18K Rose":     57,
  "14K Yellow":   47,
  "14K White":    47,
  "14K Rose":     47,
  "21K Yellow":   68,
  "Platinum 950": 34,
  "Silver 925":    0.85,
};

// ─── Casting / complexity ─────────────────────────────────────────────
export const CASTS = [
  "CAD / Casting",
  "Hand-made",
  "Semi-mount",
  "Findings only",
];

export const CMPLX = ["Simple", "Medium", "Complex", "Very Complex"];

/** Labour multiplier per complexity level. */
export const CMULT = {
  "Simple":       1.0,
  "Medium":       1.35,
  "Complex":      1.8,
  "Very Complex": 2.4,
};

// ─── Stone options ────────────────────────────────────────────────────
export const STYPES = ["Diamond", "Ruby", "Emerald", "Sapphire", "Other"];

export const COLORS_D  = ["D", "E", "F", "G", "H", "I", "J", "K", "L"];

export const CLARITIES = [
  "FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1",
];

export const SETTINGS = [
  "Prong / Claw",
  "Bezel",
  "Pavé",
  "Channel",
  "Tension",
  "Invisible",
  "Bar",
];

// ─── Margin / markup multipliers ──────────────────────────────────────
/** ws = wholesale, rx = retail ex-VAT, ri = retail incl. VAT (~17%). */
export const MU = { ws: 1.4, rx: 1.5, ri: 1.25 };

// ─── Default quote config ─────────────────────────────────────────────
/**
 * DCFG is the canonical initial state for the calculator.
 * Spread it when you need a fresh blank quote:
 *   const [cfg, setCfg] = useState({ ...DCFG });
 */
export const DCFG = {
  // Metal
  metal:     "18K Yellow",
  grams:     "",
  cast:      "CAD / Casting",
  cmplx:     "Medium",

  // Metal cost override
  mcManual:  "",
  mcMode:    "total",        // "total" | "per_gram"

  // Center stone
  centerType:     "Diamond",
  centerCt:       "1.00",
  centerColor:    "G",
  centerClarity:  "VS1",
  centerManual:   "",
  centerMode:     "total",   // "total" | "per_carat"
  centerSetting:  "Prong / Claw",

  // Side stones — row 1
  ss1Type:       "Diamond",
  ss1Ct:         "0.05",
  ss1Count:      "0",
  ss1Manual:     "",
  ss1PriceMode:  "total",    // "total" | "per_carat"
  ss1Setting:    "Pavé",

  // Side stones — row 2
  ss2Type:       "Diamond",
  ss2Ct:         "0.03",
  ss2Count:      "0",
  ss2Manual:     "",
  ss2PriceMode:  "total",
  ss2Setting:    "Pavé",

  // Waterfall overrides (empty string = use calculated value)
  lcOv:    "",
  prodOv:  "",
  wsOv:    "",
  rxOv:    "",
  riOv:    "",

  // Client information
  clientName: "",
  quoteName:  "",
  notes:      "",
};
