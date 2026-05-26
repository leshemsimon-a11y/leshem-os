/**
 * lib/reports/reportTypes.js  —  v4.2
 *
 * Central registry of all report types the LESHEM.S Report Engine
 * is designed to support.
 *
 * Changes in v4.2:
 *   - Added productTypes[] field to each registry entry — the list of
 *     productType slugs that can use this report type
 *   - No status changes — same 2 active / 5 coming_soon as v1.1
 *
 * When a new report type is implemented:
 *   1. Change its status to "active"
 *   2. Add createDefault* function in reportDefaults.js
 *   3. Add template in /components/reports/templates/
 *   4. Add editor sections in ReportEditor.jsx
 *   5. Add case in ReportPreviewShell.jsx
 */

export const REPORT_TYPES = {
  jewelry_valuation: {
    id:           "jewelry_valuation",
    label:        "Jewelry Valuation Report",
    description:  "Professional retail replacement appraisal for fine jewelry pieces",
    prefix:       "LS-JV",
    accent:       "#C5B358",   // muted gold
    status:       "active",
    productTypes: ["jewelry"],
  },
  inhouse_stone: {
    id:           "inhouse_stone",
    label:        "In-House Stone Report",
    description:  "LESHEM.S gemological identification and grading report for individual stones",
    prefix:       "LS-ST",
    accent:       "#8aab8e",   // dusty sage
    status:       "active",
    productTypes: [
      "natural_diamond",
      "lab_grown_diamond",
      "fancy_color_diamond",
      "colored_gemstone",
      "stone_pair_set",
    ],
  },
  natural_diamond: {
    id:           "natural_diamond",
    label:        "Natural Diamond Report",
    description:  "Dedicated grading report for natural diamonds",
    prefix:       "LS-ND",
    accent:       "#7a9bbf",
    status:       "coming_soon",
    productTypes: ["natural_diamond"],
  },
  lab_diamond: {
    id:           "lab_diamond",
    label:        "Lab-Grown Diamond Report",
    description:  "Dedicated grading report for laboratory-grown diamonds",
    prefix:       "LS-LD",
    accent:       "#a89bd0",
    status:       "coming_soon",
    productTypes: ["lab_grown_diamond"],
  },
  fancy_color: {
    id:           "fancy_color",
    label:        "Fancy Color Diamond Report",
    description:  "Color grading and origin report for fancy color diamonds",
    prefix:       "LS-FC",
    accent:       "#c7a85a",
    status:       "coming_soon",
    productTypes: ["fancy_color_diamond"],
  },
  colored_gem: {
    id:           "colored_gem",
    label:        "Colored Gemstone Report",
    description:  "Species identification and grading for colored gemstones",
    prefix:       "LS-CG",
    accent:       "#8abfa8",
    status:       "coming_soon",
    productTypes: ["colored_gemstone"],
  },
  pair_set: {
    id:           "pair_set",
    label:        "Pair / Set Report",
    description:  "Grading and valuation report for matched pairs or sets",
    prefix:       "LS-PS",
    accent:       "#b0a094",
    status:       "coming_soon",
    productTypes: ["stone_pair_set"],
  },
};

/** All types as an ordered array */
export const ALL_TYPES    = Object.values(REPORT_TYPES);

/** Only the currently implemented and selectable types */
export const ACTIVE_TYPES = ALL_TYPES.filter((t) => t.status === "active");
