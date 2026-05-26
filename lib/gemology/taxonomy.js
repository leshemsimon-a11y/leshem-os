/**
 * lib/gemology/taxonomy.js  —  v4.3
 *
 * Canonical dropdown option lists for the LESHEM.S Report Engine.
 * Pure data. No React. No side-effects.
 *
 * Changes in v4.3:
 *   + fluorescenceIntensities  — replaces the old single fluorescenceGrades list
 *   + fluorescenceColors       — new: paired with intensity for "Medium Blue" display
 *   + gemstoneClarityGrades    — gemstone-specific clarity vocabulary
 *   + cutFormOptions           — Faceted / Cabochon / Rough / Carved / Bead / Other
 *   ~ fluorescenceGrades kept  — backwards compatibility alias
 */

// ─── Diamond ─────────────────────────────────────────────────────────────────

/** GIA colorless diamond color grades (D = most colorless) */
export const diamondColorGrades = [
  "D", "E", "F",
  "G", "H", "I", "J",
  "K", "L", "M",
  "N", "O-P", "Q-R",
  "S-T", "U-V", "W-X", "Y-Z",
];

/** GIA diamond clarity grades (FL = Flawless, I3 = heavily included) */
export const diamondClarityGrades = [
  "FL", "IF",
  "VVS1", "VVS2",
  "VS1",  "VS2",
  "SI1",  "SI2",
  "I1",   "I2",  "I3",
];

/** GIA cut grades — also used for Polish and Symmetry */
export const diamondCutGrades = [
  "Excellent",
  "Very Good",
  "Good",
  "Fair",
  "Poor",
];

/** Shared for Polish and Symmetry fields */
export const polishSymmetryGrades = [
  "Excellent",
  "Very Good",
  "Good",
  "Fair",
  "Poor",
];

// ─── Fluorescence ─────────────────────────────────────────────────────────────

/**
 * Fluorescence intensity grades — new structured field (v4.3)
 * Replaces the old single fluorescenceGrades list in new reports.
 * Paired with fluorescenceColors to produce display like "Medium Blue".
 */
export const fluorescenceIntensities = [
  "None",
  "Faint",
  "Medium",
  "Strong",
  "Very Strong",
];

/**
 * Fluorescence colour (only shown when intensity is not None)
 * GIA standard terminology
 */
export const fluorescenceColors = [
  "Blue",
  "Yellow",
  "Orange",
  "Orangy Yellow",
  "Red",
  "White",
  "Green",
  "Other",
];

/**
 * @deprecated Use fluorescenceIntensities for new reports.
 * Kept for backwards compatibility with v4.0–v4.2 reports.
 */
export const fluorescenceGrades = fluorescenceIntensities;

// ─── Fancy Color Diamond ──────────────────────────────────────────────────────

/** GIA fancy color hue descriptions */
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

/** GIA fancy color intensity grades (lightest → most saturated) */
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

/** Common gemstone species */
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

/** Gemstone transparency / diaphaneity grades */
export const gemstoneTransparency = [
  "Transparent",
  "Translucent",
  "Opaque",
];

/** Common gemstone treatments — all must be disclosed */
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

/**
 * Gemstone-specific clarity grades — v4.3 new.
 * Not diamond grades (FL/VVS/VS/etc.) — gemstone trade uses different terminology.
 * Use for productType === "colored_gemstone" in editor and template.
 */
export const gemstoneClarityGrades = [
  "Eye Clean",
  "Slightly Included",
  "Moderately Included",
  "Heavily Included",
  "Included",
  "Surface Reaching Inclusions",
  "Not Applicable",
];

// ─── Cut Form ────────────────────────────────────────────────────────────────

/**
 * Stone cut form options — v4.3 new.
 * Used alongside Shape to produce displays like "Faceted Oval" or "Form: Cabochon".
 */
export const cutFormOptions = [
  "Faceted",
  "Cabochon",
  "Rough",
  "Carved",
  "Bead",
  "Other",
];

// ─── Shared ───────────────────────────────────────────────────────────────────

/** Gemological certificate / grading laboratories */
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

/** Standard stone shapes / cutting styles */
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

/** Lab-grown diamond growth methods */
export const labGrowthMethods = [
  "CVD",
  "HPHT",
  "Unknown",
];

// ─── Product type mapping ─────────────────────────────────────────────────────

/** Maps productType slug → default reportType */
export const PRODUCT_TYPE_TO_REPORT = {
  jewelry:               "jewelry_valuation",
  natural_diamond:       "inhouse_stone",
  lab_grown_diamond:     "inhouse_stone",
  fancy_color_diamond:   "inhouse_stone",
  colored_gemstone:      "inhouse_stone",
  stone_pair_set:        "inhouse_stone",
};

/** Human-readable label for each productType */
export const PRODUCT_TYPE_LABELS = {
  jewelry:               "Jewelry Piece",
  natural_diamond:       "Natural Diamond",
  lab_grown_diamond:     "Lab-Grown Diamond",
  fancy_color_diamond:   "Fancy Color Diamond",
  colored_gemstone:      "Colored Gemstone",
  stone_pair_set:        "Stone Pair / Set",
};

/** All productType slugs as ordered array */
export const ALL_PRODUCT_TYPES = Object.keys(PRODUCT_TYPE_TO_REPORT);
