/**
 * lib/labels/productLabels.js  —  v5.4.2
 *
 * Canonical label mapping for LESHEM.S OS.
 *
 * ── Architecture ──────────────────────────────────────────────────────────────
 *
 * Airtable stores values in Hebrew, English, or mixed.
 * The app must show Hebrew in the UI and English-only in certificates.
 *
 * Three layers:
 *
 *   1. Raw Airtable value  (e.g. "יהלום טבעי", "Natural Diamond", "diamond")
 *   2. Canonical key       (e.g. "natural_diamond")
 *   3. Display value       (appLabelHe: "יהלום טבעי" | reportLabelEn: "Natural Diamond")
 *
 * Workflow:
 *   normalizeStone() calls toCanonical() on selected string fields.
 *   The canonical key is stored alongside (or instead of) the raw value.
 *   buildStoneClassification() and handleCertFromItem() call toReportEn()
 *   so all values that reach the certificate template are English.
 *   The inventory drawer calls toAppHe() for Hebrew UI display.
 *
 * ── Key rules ────────────────────────────────────────────────────────────────
 *   • toReportEn(value) — ALWAYS returns English, never Hebrew.
 *     If the value is already English and not in the map, returns it as-is.
 *     If the value is Hebrew and not in the map, returns "" (never puts Hebrew
 *     into a certificate).
 *   • toAppHe(value)    — Returns Hebrew label. Falls back to the English value
 *     if no Hebrew mapping exists, since English is better than nothing.
 *   • toCanonical(value) — Maps raw Airtable values (Hebrew or English) to
 *     canonical keys used throughout the app.
 *   • isHebrew(str)     — Detects if a string contains Hebrew characters.
 *
 * ── Adding new values ─────────────────────────────────────────────────────────
 *   1. Add the canonical key → { appLabelHe, reportLabelEn } to LABEL_MAP.
 *   2. Add all known raw Airtable aliases to RAW_TO_CANONICAL.
 *   The rest is automatic.
 */

// ─── LABEL_MAP ────────────────────────────────────────────────────────────────
// canonical key → { appLabelHe, reportLabelEn }

export const LABEL_MAP = {

  // ── Product types ──────────────────────────────────────────────────────────
  natural_diamond:     { appLabelHe: "יהלום טבעי",              reportLabelEn: "Natural Diamond"           },
  lab_grown_diamond:   { appLabelHe: "יהלום מעבדה",             reportLabelEn: "Laboratory-Grown Diamond"  },
  fancy_color_diamond: { appLabelHe: "יהלום צבעוני",            reportLabelEn: "Fancy Colour Diamond"      },
  colored_gemstone:    { appLabelHe: "אבן חן צבעונית",          reportLabelEn: "Coloured Gemstone"         },
  stone_pair_set:      { appLabelHe: "זוג / סט אבנים",          reportLabelEn: "Matched Pair / Set"        },
  stone_parcel:        { appLabelHe: "חבילת אבנים / מלה",       reportLabelEn: "Stone Parcel"              },
  jewelry_part:        { appLabelHe: "חלק תכשיט / רכיב",        reportLabelEn: "Jewelry Component"         },
  finished_jewelry:    { appLabelHe: "תכשיט מוגמר",             reportLabelEn: "Finished Jewelry"          },

  // ── Stone types ────────────────────────────────────────────────────────────
  diamond:             { appLabelHe: "יהלום",                   reportLabelEn: "Diamond"                   },
  ruby:                { appLabelHe: "אודם",                    reportLabelEn: "Ruby"                      },
  sapphire:            { appLabelHe: "ספיר",                    reportLabelEn: "Sapphire"                  },
  emerald:             { appLabelHe: "זמרד",                    reportLabelEn: "Emerald"                   },
  spinel:              { appLabelHe: "ספינל",                   reportLabelEn: "Spinel"                    },
  tourmaline:          { appLabelHe: "טורמלין",                 reportLabelEn: "Tourmaline"                },
  alexandrite:         { appLabelHe: "אלכסנדריט",              reportLabelEn: "Alexandrite"               },
  aquamarine:          { appLabelHe: "אקוומרין",                reportLabelEn: "Aquamarine"                },
  tanzanite:           { appLabelHe: "טנזניט",                  reportLabelEn: "Tanzanite"                 },
  amethyst:            { appLabelHe: "אמטיסט",                  reportLabelEn: "Amethyst"                  },
  opal:                { appLabelHe: "אופל",                    reportLabelEn: "Opal"                      },
  garnet:              { appLabelHe: "גרנט",                    reportLabelEn: "Garnet"                    },
  peridot:             { appLabelHe: "פרידוט",                  reportLabelEn: "Peridot"                   },
  topaz:               { appLabelHe: "טופז",                    reportLabelEn: "Topaz"                     },
  pearl:               { appLabelHe: "פנינה",                   reportLabelEn: "Pearl"                     },
  coral:               { appLabelHe: "אלמוג",                   reportLabelEn: "Coral"                     },
  moissanite:          { appLabelHe: "מויסנייט",                reportLabelEn: "Moissanite"                },
  zircon:              { appLabelHe: "זירקון",                   reportLabelEn: "Zircon"                    },

  // ── Shapes / cut forms ─────────────────────────────────────────────────────
  round:               { appLabelHe: "עגול",                    reportLabelEn: "Round Brilliant"           },
  round_brilliant:     { appLabelHe: "עגול ברליאנט",            reportLabelEn: "Round Brilliant"           },
  oval:                { appLabelHe: "אובל",                    reportLabelEn: "Oval"                      },
  emerald_cut:         { appLabelHe: "אמרלד קאט",               reportLabelEn: "Emerald Cut"               },
  cushion:             { appLabelHe: "קושן",                    reportLabelEn: "Cushion"                   },
  radiant:             { appLabelHe: "רדיאנט",                  reportLabelEn: "Radiant"                   },
  pear:                { appLabelHe: "פאר",                     reportLabelEn: "Pear"                      },
  marquise:            { appLabelHe: "מרקיזה",                  reportLabelEn: "Marquise"                  },
  princess:            { appLabelHe: "פרינסס",                  reportLabelEn: "Princess"                  },
  asscher:             { appLabelHe: "אשר",                     reportLabelEn: "Asscher"                   },
  heart:               { appLabelHe: "לב",                      reportLabelEn: "Heart"                     },
  trilliant:           { appLabelHe: "טרילאנט",                 reportLabelEn: "Trilliant"                 },
  baguette:            { appLabelHe: "בגט",                     reportLabelEn: "Baguette"                  },
  faceted:             { appLabelHe: "מלוטש",                   reportLabelEn: "Faceted"                   },
  cabochon:            { appLabelHe: "קבושון",                  reportLabelEn: "Cabochon"                  },
  rough:               { appLabelHe: "גולמי",                   reportLabelEn: "Rough"                     },

  // ── Intended use ──────────────────────────────────────────────────────────
  center_stone:        { appLabelHe: "אבן מרכזית",             reportLabelEn: "Center Stone"              },
  side_stones:         { appLabelHe: "אבני צד",                 reportLabelEn: "Side Stones"               },
  sale:                { appLabelHe: "מכירה",                   reportLabelEn: "Sale"                      },
  mount:               { appLabelHe: "הרכבה",                   reportLabelEn: "Mount"                     },
  assembly:            { appLabelHe: "הרכבה",                   reportLabelEn: "Assembly"                  },
  earrings:            { appLabelHe: "עגילים",                  reportLabelEn: "Earrings"                  },
  pair:                { appLabelHe: "זוג",                     reportLabelEn: "Pair"                      },
  consignment:         { appLabelHe: "קונסיגנציה",              reportLabelEn: "Consignment"               },
  display:             { appLabelHe: "תצוגה",                   reportLabelEn: "Display"                   },

  // ── Inventory layers ──────────────────────────────────────────────────────
  physical_stock:            { appLabelHe: "מלאי פיזי",          reportLabelEn: "Physical Stock"           },
  virtual_supplier_stock:    { appLabelHe: "מלאי וירטואלי מספק", reportLabelEn: "Virtual Supplier Stock"   },
  client_owned_item:         { appLabelHe: "פריט בבעלות לקוח",   reportLabelEn: "Client-Owned Item"        },

  // ── Inventory status ───────────────────────────────────────────────────────
  in_stock:            { appLabelHe: "במלאי",                   reportLabelEn: "In Stock"                  },
  reserved:            { appLabelHe: "שמור",                    reportLabelEn: "Reserved"                  },
  sold:                { appLabelHe: "נמכר",                    reportLabelEn: "Sold"                      },
  pending:             { appLabelHe: "ממתין",                   reportLabelEn: "Pending"                   },
  archived:            { appLabelHe: "ארכיון",                  reportLabelEn: "Archived"                  },

  // ── Growth methods ────────────────────────────────────────────────────────
  cvd:                 { appLabelHe: "CVD",                     reportLabelEn: "CVD"                       },
  hpht:                { appLabelHe: "HPHT",                    reportLabelEn: "HPHT"                      },

  // ── Fluorescence intensities ──────────────────────────────────────────────
  none_fluorescence:   { appLabelHe: "ללא פלורסנציה",          reportLabelEn: "None"                      },
  faint_fluorescence:  { appLabelHe: "חלשה",                   reportLabelEn: "Faint"                     },
  medium_fluorescence: { appLabelHe: "בינונית",                 reportLabelEn: "Medium"                    },
  strong_fluorescence: { appLabelHe: "חזקה",                   reportLabelEn: "Strong"                    },
  very_strong_fluorescence: { appLabelHe: "חזקה מאוד",         reportLabelEn: "Very Strong"               },

  // ── Form factors ──────────────────────────────────────────────────────────
  single_stone:        { appLabelHe: "אבן בודדת",               reportLabelEn: "Single Stone"              },
  matched_pair:        { appLabelHe: "זוג תואם",                reportLabelEn: "Matched Pair"              },
  parcel_melee:        { appLabelHe: "חבילה / מלה",             reportLabelEn: "Parcel / Melee"            },
};

// ─── RAW_TO_CANONICAL ─────────────────────────────────────────────────────────
// Maps every known raw Airtable string (Hebrew or English) to a canonical key.
// Keys are lowercased for case-insensitive matching.
// Add aliases for new Airtable values here.

const RAW_TO_CANONICAL = {

  // Product types — English
  "natural diamond":           "natural_diamond",
  "natural_diamond":           "natural_diamond",
  "lab grown diamond":         "lab_grown_diamond",
  "lab-grown diamond":         "lab_grown_diamond",
  "laboratory-grown diamond":  "lab_grown_diamond",
  "lab_grown_diamond":         "lab_grown_diamond",
  "lab grown":                 "lab_grown_diamond",
  "fancy colour diamond":      "fancy_color_diamond",
  "fancy color diamond":       "fancy_color_diamond",
  "fancy_color_diamond":       "fancy_color_diamond",
  "coloured gemstone":         "colored_gemstone",
  "colored gemstone":          "colored_gemstone",
  "colored_gemstone":          "colored_gemstone",
  "matched pair":              "stone_pair_set",
  "matched pair / set":        "stone_pair_set",
  "stone pair":                "stone_pair_set",
  "stone pair set":            "stone_pair_set",
  "stone_pair_set":            "stone_pair_set",
  "stone parcel":              "stone_parcel",
  "parcel":                    "stone_parcel",
  "melee parcel":              "stone_parcel",
  "stone_parcel":              "stone_parcel",
  "jewelry part":              "jewelry_part",
  "jewelry component":         "jewelry_part",
  "component":                 "jewelry_part",
  "jewelry_part":              "jewelry_part",
  "finished jewelry":          "finished_jewelry",
  "finished_jewelry":          "finished_jewelry",

  // Product types — Hebrew
  "יהלום טבעי":                "natural_diamond",
  "יהלום מעבדה":               "lab_grown_diamond",
  "יהלום מגידול מעבדה":        "lab_grown_diamond",
  "יהלום מלאכותי":             "lab_grown_diamond",
  "יהלום צבעוני":              "fancy_color_diamond",
  "יהלום פאנסי":               "fancy_color_diamond",
  "יהלום פנסי":                "fancy_color_diamond",
  "אבן חן צבעונית":            "colored_gemstone",
  "אבן חן":                    "colored_gemstone",
  "זוג אבנים":                 "stone_pair_set",
  "זוג":                       "stone_pair_set",
  "סט אבנים":                  "stone_pair_set",
  "חבילת אבנים":               "stone_parcel",
  "חבילה":                     "stone_parcel",
  "מלה":                       "stone_parcel",
  "חלק תכשיט":                 "jewelry_part",
  "רכיב":                      "jewelry_part",
  "תכשיט מוגמר":               "finished_jewelry",

  // Stone types — Hebrew
  "יהלום":                     "diamond",
  "אודם":                      "ruby",
  "ספיר":                      "sapphire",
  "זמרד":                      "emerald",
  "אמרלד":                     "emerald",
  "ספינל":                     "spinel",
  "טורמלין":                   "tourmaline",
  "אלכסנדריט":                 "alexandrite",
  "אקוומרין":                  "aquamarine",
  "טנזניט":                    "tanzanite",
  "אמטיסט":                    "amethyst",
  "אופל":                      "opal",
  "גרנט":                      "garnet",
  "פרידוט":                    "peridot",
  "טופז":                      "topaz",
  "פנינה":                     "pearl",
  "אלמוג":                     "coral",
  "מויסנייט":                  "moissanite",
  "זירקון":                    "zircon",

  // Stone types — English
  "diamond":                   "diamond",
  "ruby":                      "ruby",
  "sapphire":                  "sapphire",
  "emerald":                   "emerald",
  "spinel":                    "spinel",
  "spinell":                   "spinel",
  "tourmaline":                "tourmaline",
  "alexandrite":               "alexandrite",
  "aquamarine":                "aquamarine",
  "tanzanite":                 "tanzanite",
  "amethyst":                  "amethyst",
  "opal":                      "opal",
  "garnet":                    "garnet",
  "peridot":                   "peridot",
  "topaz":                     "topaz",
  "pearl":                     "pearl",
  "coral":                     "coral",
  "moissanite":                "moissanite",
  "zircon":                    "zircon",

  // Shapes — Hebrew
  "עגול":                      "round",
  "עגול ברליאנט":              "round_brilliant",
  "אובל":                      "oval",
  "אמרלד קאט":                 "emerald_cut",
  "קושן":                      "cushion",
  "רדיאנט":                    "radiant",
  "פאר":                       "pear",
  "מרקיזה":                    "marquise",
  "פרינסס":                    "princess",
  "אשר":                       "asscher",
  "לב":                        "heart",
  "טרילאנט":                   "trilliant",
  "בגט":                       "baguette",
  "מלוטש":                     "faceted",
  "קבושון":                    "cabochon",
  "גולמי":                     "rough",

  // Shapes — English
  "round":                     "round",
  "round brilliant":           "round_brilliant",
  "oval":                      "oval",
  "emerald cut":               "emerald_cut",
  "emerald_cut":               "emerald_cut",
  "cushion":                   "cushion",
  "radiant":                   "radiant",
  "pear":                      "pear",
  "marquise":                  "marquise",
  "princess":                  "princess",
  "asscher":                   "asscher",
  "heart":                     "heart",
  "trilliant":                 "trilliant",
  "baguette":                  "baguette",
  "faceted":                   "faceted",
  "cabochon":                  "cabochon",
  "rough":                     "rough",

  // Intended use — Hebrew
  "אבן מרכזית":                "center_stone",
  "אבני צד":                   "side_stones",
  "מכירה":                     "sale",
  "הרכבה":                     "mount",
  "עגילים":                    "earrings",
  "זוג":                       "pair",
  "קונסיגנציה":                "consignment",
  "תצוגה":                     "display",

  // Intended use — English
  "center stone":              "center_stone",
  "center_stone":              "center_stone",
  "side stones":               "side_stones",
  "side_stones":               "side_stones",
  "sale":                      "sale",
  "mount":                     "mount",
  "assembly":                  "assembly",
  "earrings":                  "earrings",
  "pair":                      "pair",
  "consignment":               "consignment",
  "display":                   "display",

  // Inventory layers — Hebrew
  "מלאי פיזי":                 "physical_stock",
  "מלאי וירטואלי מספק":        "virtual_supplier_stock",
  "פריט בבעלות לקוח":          "client_owned_item",

  // Inventory layers — English
  "physical stock":            "physical_stock",
  "physical_stock":            "physical_stock",
  "virtual supplier stock":    "virtual_supplier_stock",
  "virtual_supplier_stock":    "virtual_supplier_stock",
  "client-owned item":         "client_owned_item",
  "client owned item":         "client_owned_item",
  "client_owned_item":         "client_owned_item",

  // Inventory status — Hebrew
  "במלאי":                     "in_stock",
  "שמור":                      "reserved",
  "נמכר":                      "sold",
  "ממתין":                     "pending",
  "ארכיון":                    "archived",

  // Inventory status — English
  "in stock":                  "in_stock",
  "in_stock":                  "in_stock",
  "reserved":                  "reserved",
  "sold":                      "sold",
  "pending":                   "pending",
  "archived":                  "archived",

  // Growth methods
  "cvd":                       "cvd",
  "hpht":                      "hpht",
  "lab grown cvd":             "cvd",
  "lab grown hpht":            "hpht",
};

// ─── Unicode Hebrew range detection ──────────────────────────────────────────
// \u0590–\u05FF = Hebrew block
// \uFB00–\uFB4F = Hebrew presentation forms
const HEBREW_RE = /[\u0590-\u05FF\uFB1D-\uFB4F]/;

export function isHebrew(str) {
  if (!str || typeof str !== "string") return false;
  return HEBREW_RE.test(str);
}

// ─── toCanonical ──────────────────────────────────────────────────────────────
/**
 * Maps a raw Airtable string to a canonical key.
 * Returns the canonical key (e.g. "natural_diamond") or null if not found.
 * Case-insensitive.
 */
export function toCanonical(rawValue) {
  if (!rawValue || typeof rawValue !== "string") return null;
  const key = rawValue.trim().toLowerCase();
  return RAW_TO_CANONICAL[key] ?? null;
}

// ─── toReportEn ───────────────────────────────────────────────────────────────
/**
 * Returns the English label for a value — for use ONLY in certificates/reports.
 *
 * Lookup order:
 *   1. toCanonical(value) → LABEL_MAP[canonical].reportLabelEn
 *   2. If value itself is already a canonical key → LABEL_MAP[value].reportLabelEn
 *   3. If value contains no Hebrew → return value as-is (already English)
 *   4. Hebrew value with no mapping → return "" (never put Hebrew in a cert)
 *
 * Always call this before placing any user-supplied or Airtable value
 * into a report/certificate field.
 */
export function toReportEn(rawValue) {
  if (!rawValue || typeof rawValue !== "string") return rawValue ?? "";
  const trimmed = rawValue.trim();
  if (!trimmed) return "";

  // Try canonical lookup
  const canonical = toCanonical(trimmed) ?? (LABEL_MAP[trimmed.toLowerCase()] ? trimmed.toLowerCase() : null);
  if (canonical && LABEL_MAP[canonical]) {
    return LABEL_MAP[canonical].reportLabelEn;
  }

  // Not in map. If the value is already English, pass it through.
  if (!isHebrew(trimmed)) return trimmed;

  // Hebrew value with no mapping — do NOT put Hebrew in a certificate.
  return "";
}

// ─── toAppHe ─────────────────────────────────────────────────────────────────
/**
 * Returns the Hebrew UI label for a value — for use in the app UI (not certs).
 *
 * Lookup order:
 *   1. toCanonical(value) → LABEL_MAP[canonical].appLabelHe
 *   2. If value itself is already a canonical key → LABEL_MAP[value].appLabelHe
 *   3. Return the original value as-is (may be Hebrew already, or English)
 *
 * The UI can display Hebrew; this is more tolerant than toReportEn.
 */
export function toAppHe(rawValue) {
  if (!rawValue || typeof rawValue !== "string") return rawValue ?? "";
  const trimmed = rawValue.trim();
  if (!trimmed) return "";

  const canonical = toCanonical(trimmed) ?? (LABEL_MAP[trimmed.toLowerCase()] ? trimmed.toLowerCase() : null);
  if (canonical && LABEL_MAP[canonical]) {
    return LABEL_MAP[canonical].appLabelHe;
  }

  return trimmed;
}

// ─── toCanonicalKey ───────────────────────────────────────────────────────────
/**
 * Same as toCanonical() but falls back to the trimmed original if not found.
 * Use when you need a key that won't be null (e.g. for PRODUCT_TYPE_LABELS lookups).
 */
export function toCanonicalKey(rawValue) {
  if (!rawValue || typeof rawValue !== "string") return rawValue ?? "";
  return toCanonical(rawValue.trim()) ?? rawValue.trim();
}

// ─── Convenience re-exports ───────────────────────────────────────────────────
// Map of canonical → appLabelHe for dropdown building
export function getAppLabels() {
  return Object.fromEntries(
    Object.entries(LABEL_MAP).map(([k, v]) => [k, v.appLabelHe])
  );
}

// Map of canonical → reportLabelEn
export function getReportLabels() {
  return Object.fromEntries(
    Object.entries(LABEL_MAP).map(([k, v]) => [k, v.reportLabelEn])
  );
}
