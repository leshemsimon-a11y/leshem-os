/**
 * lib/gemology/taxonomy.js
 *
 * Canonical dropdown option lists for the LESHEM.S Report Engine.
 *
 * Rules:
 *   - No React imports. No side-effects. Pure data.
 *   - All arrays are plain strings — ready to pass directly to <select> options.
 *   - Industry-standard ordering preserved (GIA grading scale ordering etc.)
 *   - Used by ReportEditor.jsx dropdowns and InHouseStoneReport type-routing.
 *   - Import only what you need: `import { diamondColorGrades } from "…/taxonomy"`
 *
 * Milestone 4.2  —  Gemology Taxonomy
 */

// ─── Diamond ─────────────────────────────────────────────────────────────────

/**
 * GIA colorless diamond color grades (D–Z, D = most colorless)
 */
export const diamondColorGrades = [
  "D", "E", "F",           // Colorless
  "G", "H", "I", "J",      // Near Colorless
  "K", "L", "M",           // Faint
  "N", "O-P", "Q-R",       // Very Light
  "S-T", "U-V", "W-X", "Y-Z", // Light
];

/**
 * GIA diamond clarity grades (FL = Flawless, I3 = included)
 */
export const diamondClarityGrades = [
  "FL", "IF",
  "VVS1", "VVS2",
  "VS1",  "VS2",
  "SI1",  "SI2",
  "I1",   "I2",  "I3",
];

/**
 * GIA cut / polish / symmetry grades
 */
export const diamondCutGrades = [
  "Excellent",
  "Very Good",
  "Good",
  "Fair",
  "Poor",
];

/** Shared list — used for Polish and Symmetry fields as well */
export const polishSymmetryGrades = [
  "Excellent",
  "Very Good",
  "Good",
  "Fair",
  "Poor",
];

/**
 * GIA fluorescence grades
 */
export const fluorescenceGrades = [
  "None",
  "Faint",
  "Medium",
  "Strong",
  "Very Strong",
];

// ─── Fancy Color Diamond ──────────────────────────────────────────────────────

/**
 * GIA fancy color hue descriptions
 */
export const fancyColorHues = [
  "Yellow",
  "Pink",
  "Blue",
  "Green",
  "Orange",
  "Purple",
  "Red",
  "Brown",
  "Gray",
  "Black",
  "Champagne",
  "Cognac",
  "Chameleon",
];

/**
 * GIA fancy color intensity grades (lightest → most saturated)
 */
export const fancyColorIntensities = [
  "Faint",
  "Very Light",
  "Light",
  "Fancy Light",
  "Fancy",
  "Fancy Intense",
  "Fancy Vivid",
  "Fancy Deep",
  "Fancy Dark",
];

// ─── Colored Gemstone ────────────────────────────────────────────────────────

/**
 * Common gemstone species for identification
 */
export const gemstoneSpecies = [
  "Ruby",
  "Sapphire",
  "Emerald",
  "Spinel",
  "Tourmaline",
  "Aquamarine",
  "Morganite",
  "Tanzanite",
  "Garnet",
  "Topaz",
  "Opal",
  "Peridot",
  "Amethyst",
  "Citrine",
  "Other",
];

/**
 * Gemstone transparency / diaphaneity grades
 */
export const gemstoneTransparency = [
  "Transparent",
  "Translucent",
  "Opaque",
];

/**
 * Common gemstone treatments for disclosure
 */
export const gemstoneTreatments = [
  "None",
  "Heated",
  "Oiled",
  "Irradiated",
  "Diffusion",
  "Dyed",
  "Resin Filled",
  "Clarity Enhanced",
  "Unknown",
];

// ─── Shared ───────────────────────────────────────────────────────────────────

/**
 * Gemological certificate / grading laboratories
 */
export const certificateLabs = [
  "None",
  "GIA",
  "IGI",
  "HRD",
  "Gübelin",
  "SSEF",
  "GRS",
  "AGL",
  "Lotus",
  "AGS",
  "Other",
];

/**
 * Standard stone shapes / cutting styles
 */
export const stoneShapes = [
  "Round",
  "Oval",
  "Cushion",
  "Emerald",
  "Radiant",
  "Pear",
  "Marquise",
  "Princess",
  "Asscher",
  "Heart",
  "Trillion",
  "Baguette",
  "Other",
];

/**
 * Lab-grown diamond growth methods (for Lab-Grown Diamond Reports)
 */
export const labGrowthMethods = [
  "CVD",             // Chemical Vapor Deposition
  "HPHT",            // High Pressure High Temperature
  "Unknown",
];

// ─── Product type → default report type mapping ───────────────────────────────
/**
 * Maps a productType slug to the default reportType for that product category.
 * Used by ReportEngine when auto-selecting a report for a given product.
 *
 * productType is set when:
 *   - A stone is added to inventory with a known category
 *   - A report is created with a known product context
 *   - The user selects a product type in the editor
 */
export const PRODUCT_TYPE_TO_REPORT = {
  jewelry:               "jewelry_valuation",
  natural_diamond:       "inhouse_stone",       // uses InHouseStoneReport with natural_diamond fields
  lab_grown_diamond:     "inhouse_stone",       // uses InHouseStoneReport with lab_grown_diamond fields
  fancy_color_diamond:   "inhouse_stone",       // uses InHouseStoneReport with fancy_color_diamond fields
  colored_gemstone:      "inhouse_stone",       // uses InHouseStoneReport with colored_gemstone fields
  stone_pair_set:        "inhouse_stone",       // pair/set — future dedicated template
};

/**
 * Human-readable label for each productType
 */
export const PRODUCT_TYPE_LABELS = {
  jewelry:               "Jewelry Piece",
  natural_diamond:       "Natural Diamond",
  lab_grown_diamond:     "Lab-Grown Diamond",
  fancy_color_diamond:   "Fancy Color Diamond",
  colored_gemstone:      "Colored Gemstone",
  stone_pair_set:        "Stone Pair / Set",
};

/**
 * All productType slugs as an ordered array
 */
export const ALL_PRODUCT_TYPES = Object.keys(PRODUCT_TYPE_TO_REPORT);
