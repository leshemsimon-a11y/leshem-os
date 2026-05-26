/**
 * lib/reports/reportUtils.js  —  v1.1
 *
 * Pure utility functions for the Report Engine.
 * Zero React imports. Zero side-effects. Fully unit-testable.
 *
 * Changes in v1.1:
 *   + pluralize(word)                      — "Ruby" → "Rubies" etc.
 *   + formatStoneCount(n, ct, type)        — "22 Rubies · 1.10 ct total weight"
 *   ~ formatCarat / formatWeight           — always 2 decimal places, passthrough guard
 *   ~ hasValue                             — unchanged, canonical
 *   ~ setDeep                              — unchanged, canonical
 */

// ─── hasValue ─────────────────────────────────────────────────────────────────
/**
 * Single source of truth for "does this field have renderable content?"
 * Returns false for: null · undefined · "" · "—" · [] · {}
 * Used by every template SpecRow / GradeRow and section guard.
 */
export function hasValue(value) {
  if (value === null || value === undefined)  return false;
  if (typeof value === "string")              return value.trim() !== "" && value.trim() !== "—";
  if (typeof value === "boolean")             return value;
  if (typeof value === "number")              return !isNaN(value);
  if (Array.isArray(value))                   return value.length > 0;
  if (typeof value === "object")              return Object.keys(value).length > 0;
  return Boolean(value);
}

// ─── showField ────────────────────────────────────────────────────────────────
export function showField(label, value) {
  if (!hasValue(value)) return null;
  return { label, value };
}

// ─── pluralize ────────────────────────────────────────────────────────────────
/**
 * Pluralize a gemstone or material name for professional display.
 * Handles gemstone-specific irregulars before falling back to English rules.
 *
 *   pluralize("Ruby")       → "Rubies"
 *   pluralize("Diamond")    → "Diamonds"
 *   pluralize("Sapphire")   → "Sapphires"
 *   pluralize("Topaz")      → "Topazes"
 *   pluralize("Aquamarine") → "Aquamarines"
 */
export function pluralize(word) {
  if (!word || typeof word !== "string") return word || "";
  const w     = word.trim();
  const lower = w.toLowerCase();

  // Gemstone-specific entries (irregular or worth being explicit)
  const IRREGULARS = {
    ruby:        "Rubies",
    topaz:       "Topazes",
    diamond:     "Diamonds",
    emerald:     "Emeralds",
    sapphire:    "Sapphires",
    pearl:       "Pearls",
    opal:        "Opals",
    garnet:      "Garnets",
    amethyst:    "Amethysts",
    aquamarine:  "Aquamarines",
    tanzanite:   "Tanzanites",
    tourmaline:  "Tourmalines",
    alexandrite: "Alexandrites",
    peridot:     "Peridots",
    morganite:   "Morganites",
    spinel:      "Spinels",
  };

  if (IRREGULARS[lower]) return IRREGULARS[lower];

  // Consonant + y → ies  (e.g. "Fancy" → "Fancies")
  if (/[^aeiou]y$/i.test(w)) return w.slice(0, -1) + "ies";

  // Sibilant endings → es
  if (/(?:s|sh|ch|x|z)$/i.test(w)) return w + "es";

  return w + "s";
}

// ─── formatCarat ──────────────────────────────────────────────────────────────
/**
 * Format a carat weight value for professional display.
 * Always uses exactly 2 decimal places.
 *
 *   formatCarat("1.02")       → "1.02 ct"
 *   formatCarat(1)            → "1.00 ct"
 *   formatCarat("1.02 ct")    → "1.02 ct"   (already formatted — normalised)
 *   formatCarat("")           → ""
 */
export function formatCarat(value) {
  if (!hasValue(value)) return "";
  const s = String(value);
  const n = parseFloat(s.replace(/[^\d.]/g, ""));
  if (isNaN(n)) return s;
  return `${n.toFixed(2)} ct`;
}

// ─── formatWeight ─────────────────────────────────────────────────────────────
/**
 * Format a gram weight for professional display.
 * Always uses exactly 2 decimal places.
 *
 *   formatWeight("4.2")   → "4.20 g"
 *   formatWeight(4)       → "4.00 g"
 *   formatWeight("4.2 g") → "4.20 g"
 */
export function formatWeight(value) {
  if (!hasValue(value)) return "";
  const s = String(value);
  const n = parseFloat(s.replace(/[^\d.]/g, ""));
  if (isNaN(n)) return s;
  return `${n.toFixed(2)} g`;
}

// ─── formatStoneCount ─────────────────────────────────────────────────────────
/**
 * Format a stone count with total carat weight for the specifications table.
 *
 *   formatStoneCount(22, 1.10, "Ruby")    → "22 Rubies · 1.10 ct total weight"
 *   formatStoneCount(1,  0.50, "Diamond") → "1 Diamond · 0.50 ct total weight"
 *   formatStoneCount(14, 0,    "Diamond") → "14 Diamonds"
 *   formatStoneCount(0,  1.10, "Ruby")    → ""
 */
export function formatStoneCount(count, totalCt, type) {
  const n = parseInt(count, 10);
  if (!n || n <= 0) return "";

  const ct      = parseFloat(totalCt);
  const typeStr = type
    ? (n === 1 ? type : pluralize(type))
    : (n === 1 ? "stone" : "stones");
  const ctStr   = (!isNaN(ct) && ct > 0)
    ? ` · ${ct.toFixed(2)} ct total weight`
    : "";

  return `${n} ${typeStr}${ctStr}`;
}

// ─── formatMoney ──────────────────────────────────────────────────────────────
/**
 * Format a monetary amount for display.
 * If value is already a formatted string with a symbol, pass it through.
 */
export function formatMoney(value, currency = "USD") {
  if (!hasValue(value)) return "";
  if (typeof value === "string" && /[₪$€£]/.test(value)) return value;
  const n   = Number(String(value).replace(/[^\d.]/g, "")) || 0;
  const sym = currency === "ILS" ? "₪" : "$";
  return (
    sym +
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(n))
  );
}

// ─── generateReportNumber ─────────────────────────────────────────────────────
/** "LS-JV-2026-4712" */
export function generateReportNumber(prefix = "LS") {
  const year = new Date().getFullYear();
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `${prefix}-${year}-${rand}`;
}

// ─── fmtReportDate ────────────────────────────────────────────────────────────
/** "26 May 2026" */
export function fmtReportDate() {
  return new Intl.DateTimeFormat("en-GB", {
    day:   "2-digit",
    month: "long",
    year:  "numeric",
  }).format(new Date());
}

// ─── setDeep ──────────────────────────────────────────────────────────────────
/**
 * Immutably set a nested value using a dot-path string.
 * Handles both object and array segments.
 *
 *   setDeep(state, "metal.weight", "4.20 g")
 *   setDeep(state, "stone.clarity", "VS1")
 *   setDeep(state, "externalReports.0.lab", "GIA")
 *   setDeep(state, "valuation.amount", "$18,500")
 */
export function setDeep(obj, path, value) {
  const keys = path.split(".");
  const root = Array.isArray(obj) ? [...obj] : { ...obj };
  let cursor = root;

  for (let i = 0; i < keys.length - 1; i++) {
    const key  = keys[i];
    const next = cursor[key];
    cursor[key] = Array.isArray(next)
      ? [...next]
      : (next && typeof next === "object" ? { ...next } : {});
    cursor = cursor[key];
  }

  cursor[keys[keys.length - 1]] = value;
  return root;
}
