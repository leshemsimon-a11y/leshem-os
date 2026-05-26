/**
 * lib/reports/reportUtils.js
 *
 * Pure utility functions for the Report Engine.
 * Zero React imports. Zero side-effects. Fully unit-testable.
 *
 * Exports:
 *   hasValue(value)
 *   showField(label, value)
 *   formatCarat(value)
 *   formatWeight(value)
 *   formatMoney(value, currency)
 *   generateReportNumber(prefix)
 *   fmtReportDate()
 *   setDeep(obj, dotPath, value)
 */

// ─── hasValue ────────────────────────────────────────────────────────
/**
 * Returns true only when a value is genuinely present and displayable.
 * Returns false for: null, undefined, "", "—", [], {}.
 *
 * This is the single source of truth for "should I show this field?"
 * Every template and section guard in the report system must use this.
 */
export function hasValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string")  return value.trim() !== "" && value.trim() !== "—";
  if (typeof value === "boolean") return value;
  if (typeof value === "number")  return !isNaN(value);
  if (Array.isArray(value))       return value.length > 0;
  if (typeof value === "object")  return Object.keys(value).length > 0;
  return Boolean(value);
}

// ─── showField ───────────────────────────────────────────────────────
/**
 * Returns { label, value } when value exists, null otherwise.
 * Intended for building field lists before rendering.
 *
 * @param {string} label
 * @param {*}      value
 * @returns {{ label: string, value: * } | null}
 */
export function showField(label, value) {
  if (!hasValue(value)) return null;
  return { label, value };
}

// ─── formatCarat ─────────────────────────────────────────────────────
/**
 * Format a carat value for display.
 * Input can be "1.02", 1.02, or "1.02 ct" (already formatted).
 * Returns "" for invalid input.
 */
export function formatCarat(value) {
  if (!hasValue(value)) return "";
  const s = String(value).replace(/[^\d.]/g, "");
  const n = parseFloat(s);
  if (isNaN(n)) return String(value); // pass-through if already formatted
  return `${n.toFixed(2)} ct`;
}

// ─── formatWeight ────────────────────────────────────────────────────
/**
 * Format a gram weight for display.
 * Returns "" for invalid input.
 */
export function formatWeight(value) {
  if (!hasValue(value)) return "";
  const s = String(value).replace(/[^\d.]/g, "");
  const n = parseFloat(s);
  if (isNaN(n)) return String(value);
  return `${n.toFixed(2)} g`;
}

// ─── formatMoney ─────────────────────────────────────────────────────
/**
 * Format a monetary amount for display.
 * If value is already a formatted string (e.g. "$18,500"), pass it through.
 * If numeric, format with currency symbol and thousands separator.
 */
export function formatMoney(value, currency = "USD") {
  if (!hasValue(value)) return "";
  // If already a formatted string with a currency symbol, pass through
  if (typeof value === "string" && /[₪$€£]/.test(value)) return value;
  const n = Number(String(value).replace(/[^\d.]/g, "")) || 0;
  const sym = currency === "ILS" ? "₪" : "$";
  return (
    sym +
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(n))
  );
}

// ─── generateReportNumber ─────────────────────────────────────────────
/**
 * Generate a unique report number with a given prefix.
 * Format: {PREFIX}-{YEAR}-{4-digit random}
 * e.g. "LS-JV-2026-4712"
 */
export function generateReportNumber(prefix = "LS") {
  const year = new Date().getFullYear();
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `${prefix}-${year}-${rand}`;
}

// ─── fmtReportDate ───────────────────────────────────────────────────
/**
 * Today's date formatted as "26 May 2026".
 */
export function fmtReportDate() {
  return new Intl.DateTimeFormat("en-GB", {
    day:   "2-digit",
    month: "long",
    year:  "numeric",
  }).format(new Date());
}

// ─── setDeep ─────────────────────────────────────────────────────────
/**
 * Immutably set a nested value using a dot-path string.
 * Handles both object and array segments.
 *
 * Examples:
 *   setDeep(state, "metal.weight", "4.20 g")
 *   setDeep(state, "stone.clarity", "VS1")
 *   setDeep(state, "externalReports.0.lab", "GIA")
 *   setDeep(state, "valuation.amount", "$18,500")
 *
 * @param {object|Array} obj    Root object to update
 * @param {string}       path   Dot-separated path
 * @param {*}            value  New value
 * @returns {object|Array}      New root object (shallow clone at each level)
 */
export function setDeep(obj, path, value) {
  const keys  = path.split(".");
  const root  = Array.isArray(obj) ? [...obj] : { ...obj };
  let cursor  = root;

  for (let i = 0; i < keys.length - 1; i++) {
    const key  = keys[i];
    const next = cursor[key];
    // Shallow-clone the next level so we don't mutate the original
    cursor[key] = Array.isArray(next)
      ? [...next]
      : (next && typeof next === "object" ? { ...next } : {});
    cursor = cursor[key];
  }

  cursor[keys[keys.length - 1]] = value;
  return root;
}
