/**
 * lib/reports/reportUtils.js  —  v4.2
 *
 * Pure utility functions for the Report Engine.
 * Zero React imports. Zero side-effects. Fully unit-testable.
 *
 * No changes from v1.1 — taxonomy lives in lib/gemology/taxonomy.js.
 * This file re-exported here for completeness in the milestone deliverable.
 *
 * Exports:
 *   hasValue(value)
 *   showField(label, value)
 *   pluralize(word)
 *   formatCarat(value)
 *   formatWeight(value)
 *   formatStoneCount(count, totalCt, type)
 *   formatMoney(value, currency)
 *   generateReportNumber(prefix)
 *   fmtReportDate()
 *   setDeep(obj, dotPath, value)
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
  if (/[^aeiou]y$/i.test(w)) return w.slice(0, -1) + "ies";
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

// ─── formatStoneCount ─────────────────────────────────────────────────────────
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
