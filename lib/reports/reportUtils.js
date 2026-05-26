/**
 * lib/reports/reportUtils.js  —  v4.3
 *
 * Pure utility functions for the Report Engine.
 * Zero React imports. Zero side-effects. Fully unit-testable.
 *
 * Changes in v4.3:
 *   + formatMeasurements(length, width, depth, legacy)
 *       Formats L × W × D mm from three separate inputs.
 *       Falls back to legacy string when structured fields are empty.
 *   + formatFluorescence(intensity, color, legacy)
 *       Formats "Medium Blue" from structured fields.
 *       "None" intensity → "None" (no color appended).
 *       Falls back to legacy string when structured fields are empty.
 *   + formatCutForm(cutForm, shape)
 *       Combines cut form and shape: "Faceted Oval", "Cabochon", "Oval"
 */

// ─── hasValue ─────────────────────────────────────────────────────────────────
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
export function pluralize(word) {
  if (!word || typeof word !== "string") return word || "";
  const w     = word.trim();
  const lower = w.toLowerCase();

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
  if (/[^aeiou]y$/i.test(w))        return w.slice(0, -1) + "ies";
  if (/(?:s|sh|ch|x|z)$/i.test(w)) return w + "es";
  return w + "s";
}

// ─── formatCarat ──────────────────────────────────────────────────────────────
export function formatCarat(value) {
  if (!hasValue(value)) return "";
  const s = String(value);
  const n = parseFloat(s.replace(/[^\d.]/g, ""));
  if (isNaN(n)) return s;
  return `${n.toFixed(2)} ct`;
}

// ─── formatWeight ─────────────────────────────────────────────────────────────
export function formatWeight(value) {
  if (!hasValue(value)) return "";
  const s = String(value);
  const n = parseFloat(s.replace(/[^\d.]/g, ""));
  if (isNaN(n)) return s;
  return `${n.toFixed(2)} g`;
}

// ─── formatMeasurements ───────────────────────────────────────────────────────
/**
 * Format stone measurements from three structured inputs or a legacy string.
 *
 * Priority:
 *   1. Structured fields (any combination of length, width, depth)
 *   2. Legacy string (for reports created before v4.3)
 *
 * Examples:
 *   formatMeasurements("6.42", "6.44", "3.90")  → "6.42 × 6.44 × 3.90 mm"
 *   formatMeasurements("6.42", "6.44", "")       → "6.42 × 6.44 mm"
 *   formatMeasurements("",     "",     "3.90")   → "3.90 mm"
 *   formatMeasurements("",     "",     "",  "6.42 × 6.44 × 3.90 mm") → "6.42 × 6.44 × 3.90 mm"
 *   formatMeasurements("",     "",     "",  "")  → ""
 *
 * @param {string|number} length  L dimension
 * @param {string|number} width   W dimension
 * @param {string|number} depth   D / Height dimension
 * @param {string}        legacy  Optional legacy measurements string
 */
export function formatMeasurements(length, width, depth, legacy) {
  // Normalise each value: strip non-numeric chars except decimal point
  const parts = [length, width, depth]
    .map((v) => (hasValue(v) ? String(v).replace(/[^\d.]/g, "").trim() : ""))
    .filter(Boolean);

  if (parts.length > 0) return parts.join(" \u00d7 ") + " mm";

  // Fall back to legacy string unchanged
  if (hasValue(legacy)) return String(legacy);

  return "";
}

// ─── formatFluorescence ───────────────────────────────────────────────────────
/**
 * Format fluorescence from structured intensity + colour fields or legacy string.
 *
 * Priority:
 *   1. Structured fields (intensity is required; colour is optional)
 *   2. Legacy string (for reports created before v4.3)
 *
 * Rules:
 *   - Intensity "None"       → "None"  (colour never appended)
 *   - Intensity + colour     → "Medium Blue"
 *   - Intensity only         → "Medium"
 *   - Neither but legacy set → legacy string
 *   - Everything empty       → ""
 *
 * @param {string} intensity  e.g. "Medium"
 * @param {string} color      e.g. "Blue"   (optional)
 * @param {string} legacy     e.g. "Medium Blue" (pre-v4.3 single field)
 */
export function formatFluorescence(intensity, color, legacy) {
  if (hasValue(intensity)) {
    if (intensity === "None") return "None";
    return hasValue(color) ? `${intensity} ${color}` : intensity;
  }
  if (hasValue(legacy)) return String(legacy);
  return "";
}

// ─── formatCutForm ────────────────────────────────────────────────────────────
/**
 * Combine cut form and shape for professional display.
 *
 *   formatCutForm("Faceted", "Oval")    → "Faceted Oval"
 *   formatCutForm("Cabochon", "")       → "Cabochon"
 *   formatCutForm("", "Oval")           → "Oval"
 *   formatCutForm("", "")              → ""
 *
 * @param {string} cutForm  e.g. "Faceted"
 * @param {string} shape    e.g. "Oval"
 */
export function formatCutForm(cutForm, shape) {
  const cf = hasValue(cutForm) ? String(cutForm).trim() : "";
  const sh = hasValue(shape)   ? String(shape).trim()   : "";
  if (cf && sh) return `${cf} ${sh}`;
  if (cf) return cf;
  if (sh) return sh;
  return "";
}

// ─── formatStoneCount ─────────────────────────────────────────────────────────
export function formatStoneCount(count, totalCt, type) {
  const n = parseInt(count, 10);
  if (!n || n <= 0) return "";
  const ct      = parseFloat(totalCt);
  const typeStr = type
    ? (n === 1 ? type : pluralize(type))
    : (n === 1 ? "stone" : "stones");
  const ctStr   = (!isNaN(ct) && ct > 0)
    ? ` \u00b7 ${ct.toFixed(2)} ct total weight`
    : "";
  return `${n} ${typeStr}${ctStr}`;
}

// ─── formatMoney ──────────────────────────────────────────────────────────────
export function formatMoney(value, currency = "USD") {
  if (!hasValue(value)) return "";
  if (typeof value === "string" && /[\u20aa$\u20ac\u00a3]/.test(value)) return value;
  const n   = Number(String(value).replace(/[^\d.]/g, "")) || 0;
  const sym = currency === "ILS" ? "\u20aa" : "$";
  return (
    sym +
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(n))
  );
}

// ─── generateReportNumber ─────────────────────────────────────────────────────
export function generateReportNumber(prefix = "LS") {
  const year = new Date().getFullYear();
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `${prefix}-${year}-${rand}`;
}

// ─── fmtReportDate ────────────────────────────────────────────────────────────
export function fmtReportDate() {
  return new Intl.DateTimeFormat("en-GB", {
    day:   "2-digit",
    month: "long",
    year:  "numeric",
  }).format(new Date());
}

// ─── setDeep ──────────────────────────────────────────────────────────────────
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
