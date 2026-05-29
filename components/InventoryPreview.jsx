/**
 * components/InventoryPreview.jsx  —  v5.2.2
 *
 * Changes from v5.0:
 *
 * Task 3 — Inventory item detail modal:
 *   + Clicking any stone row opens ItemDetailModal.
 *   + Modal shows all normalized stone fields grouped by category.
 *   + Shows Airtable record ID.
 *   + Image display: shown when thumbnailUrl is present; placeholder otherwise.
 *   + Certificate: certLab / certNumber shown when available.
 *   + Close button (X) and backdrop click both close the modal.
 *   + Keyboard: Escape key closes modal.
 *
 *   NOTE — Images: the current normalizeStone() does not fetch attachment
 *   URLs from Airtable (attachment fields return null in current normalize.js).
 *   The thumbnailUrl field is shown when available. Full attachment support
 *   (inventoryImages array) is a future milestone enhancement.
 *
 *   NOTE — "Use in Calculator" / "Use in Report" buttons are scaffolded but
 *   call optional props (onUseInCalculator, onUseInReport).
 *   They will be wired in Milestone 5.3.
 *
 * + onAddNew prop now renders "קלוט מוצר חדש" button in the header.
 * + Status badge colors unchanged.
 * + MetalList and all other sections unchanged.
 *
 * Props:
 *   stones          {object[]}
 *   metals          {object[]}
 *   jewelry         {object[]}
 *   loading         {boolean}
 *   error           {string|null}
 *   onRetry         {function}
 *   onAddNew        {function}  — opens intake tab
 *   onUseInCalc     {function}  — [future] prefill calculator from stone
 *   onUseInReport   {function}  — [future] open report with stone data
 */

import { useState, useEffect } from "react";
import { C } from "../lib/constants";

// ─── Design tokens ────────────────────────────────────────────────────────────
const SANS = C.dat;
const HEB  = C.heb;
const CH   = C.ch;
const CHM  = "#4a5c68";
const CHL  = C.chl;
const CHX  = C.chx;
const IV   = C.iv;
const IV2  = "#F0EDE8";
const GD   = C.gd;
const SG   = C.sg;

const STATUS_COLORS = {
  "במלאי": { bg: "rgba(138,171,142,0.15)", color: "#3d7a44", border: "rgba(138,171,142,0.5)" },
  "נמכר":  { bg: "rgba(176,64,64,0.10)",  color: "#b04040", border: "rgba(176,64,64,0.35)"  },
  "שמור":  { bg: "rgba(197,179,88,0.12)", color: "#7a6a1a", border: "rgba(197,179,88,0.4)"  },
  "הזמנה": { bg: "rgba(74,92,104,0.1)",   color: "#4a5c68", border: "rgba(74,92,104,0.3)"   },
};
const DEFAULT_STATUS_COLOR = { bg: "rgba(54,69,79,0.07)", color: CHM, border: "rgba(54,69,79,0.18)" };

// ─── Shared atoms ─────────────────────────────────────────────────────────────

function SkeletonRow({ cols }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: "10px 12px", borderBottom: "1px solid rgba(54,69,79,0.07)" }}>
          <div style={{ height: 12, borderRadius: 4, background: "rgba(54,69,79,0.1)", width: `${40 + (i * 17 + 23) % 45}%`, animation: "pulse 1.5s ease-in-out infinite" }} />
        </td>
      ))}
    </tr>
  );
}

function StatusBadge({ status }) {
  if (!status) return null;
  const colors = STATUS_COLORS[status] ?? DEFAULT_STATUS_COLOR;
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontFamily: HEB, fontWeight: 600, background: colors.bg, color: colors.color, border: `1px solid ${colors.border}`, whiteSpace: "nowrap" }}>
      {status}
    </span>
  );
}

function SectionHeader({ title, count, icon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <div style={{ width: 3, height: 18, background: GD, borderRadius: 2, flexShrink: 0 }} />
      <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: CH, letterSpacing: "0.04em" }}>
        {icon && <span style={{ marginLeft: 6 }}>{icon}</span>}
        {title}
      </span>
      {count != null && (
        <span style={{ fontFamily: HEB, fontSize: 11, color: CHL, background: IV2, border: "1px solid rgba(54,69,79,0.14)", borderRadius: 10, padding: "1px 8px" }}>
          {count}
        </span>
      )}
      <div style={{ flex: 1, height: "1px", background: "rgba(54,69,79,0.1)" }} />
    </div>
  );
}

function Cell({ children, style }) {
  return (
    <td style={{ padding: "9px 12px", fontFamily: SANS, fontSize: 12.5, color: CHM, verticalAlign: "middle", borderBottom: "1px solid rgba(54,69,79,0.07)", lineHeight: 1.4, ...style }}>
      {children ?? <span style={{ color: CHX }}>—</span>}
    </td>
  );
}

function StoneThumbnail({ url }) {
  if (!url) {
    return (
      <div style={{ width: 36, height: 36, borderRadius: 4, background: IV2, border: "1px solid rgba(54,69,79,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
        💎
      </div>
    );
  }
  return (
    <img src={url} alt="" loading="lazy" style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 4, border: "1px solid rgba(54,69,79,0.12)", display: "block", flexShrink: 0, background: IV2 }} />
  );
}

// ─── ItemDetailModal (Task 3) ─────────────────────────────────────────────────
/**
 * Modal overlay showing full details for a selected inventory item.
 * Opens on row click in StoneTable.
 *
 * Close: X button, backdrop click, or Escape key.
 */
function ItemDetailModal({ item, onClose }) {
  // Escape key to close
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!item) return null;
  const s = item;

  // Format a numeric value with fallback
  const val = (v) => (v !== null && v !== undefined && v !== "") ? String(v) : null;
  const carat = (v) => val(v) ? `${parseFloat(v).toFixed(2)} ct` : null;

  // Field group: label + value pairs (omit when value is null/empty)
  function FieldGroup({ title, fields }) {
    const visible = fields.filter((f) => f.value !== null && f.value !== undefined && f.value !== "");
    if (visible.length === 0) return null;
    return (
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ width: 2, height: 12, background: GD, borderRadius: 1 }} />
          <span style={{ fontFamily: SANS, fontSize: 9.5, fontWeight: 700, color: CHL, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            {title}
          </span>
          <div style={{ flex: 1, height: "0.5px", background: "rgba(54,69,79,0.1)" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "6px 14px" }}>
          {visible.map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, color: CHX, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
              <div style={{ fontFamily: SANS, fontSize: 12.5, color: CH, fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(54,69,79,0.55)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background:   IV,
          borderRadius: 12,
          padding:      "0",
          width:        "100%",
          maxWidth:     640,
          maxHeight:    "90vh",
          overflowY:    "auto",
          boxShadow:    "0 24px 70px rgba(54,69,79,0.28)",
        }}
      >
        {/* Modal header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px 24px 0", marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: CH, marginBottom: 4 }}>
              {s.stoneType || s.productType || "פריט מלאי"}
              {s.sku && (
                <span style={{ fontFamily: "'Courier New',monospace", fontSize: 11, color: CHL, marginRight: 10, fontWeight: 400 }}>
                  {s.sku}
                </span>
              )}
            </div>
            <div style={{ fontFamily: HEB, fontSize: 11, color: CHL }}>
              Airtable ID: <span style={{ fontFamily: "'Courier New',monospace", color: CHM }}>{s.id}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: CHL, fontSize: 20, lineHeight: 1, padding: "4px 8px", flexShrink: 0 }}>
            ✕
          </button>
        </div>

        {/* Image + status row */}
        <div style={{ padding: "0 24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
          {/* Image */}
          <div style={{ flexShrink: 0 }}>
            {s.thumbnailUrl ? (
              <img src={s.thumbnailUrl} alt="stone" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(54,69,79,0.16)", background: IV2 }} />
            ) : (
              <div style={{ width: 72, height: 72, borderRadius: 8, background: IV2, border: "1px solid rgba(54,69,79,0.14)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                💎
              </div>
            )}
            {!s.thumbnailUrl && (
              <div style={{ fontFamily: HEB, fontSize: 9, color: CHX, textAlign: "center", marginTop: 4 }}>
                תמונה תהיה זמינה<br/>בגרסה הבאה
              </div>
            )}
          </div>
          {/* Status + carat quick facts */}
          <div>
            <StatusBadge status={s.inventoryStatus} />
            {s.caratWeight && (
              <div style={{ fontFamily: SANS, fontSize: 22, fontWeight: 700, color: CH, marginTop: 6 }}>
                {parseFloat(s.caratWeight).toFixed(2)} <span style={{ fontSize: 13, fontWeight: 400, color: CHL }}>ct</span>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(54,69,79,0.1)", marginBottom: 20 }} />

        {/* Field groups */}
        <div style={{ padding: "0 24px 24px" }}>

          <FieldGroup title="Identity" fields={[
            { label: "Stone Type",    value: val(s.stoneType)   },
            { label: "Product Type",  value: val(s.productType) },
            { label: "Name",          value: val(s.name)        },
            { label: "Status",        value: val(s.inventoryStatus) },
            { label: "Stone Count",   value: val(s.stoneCount)  },
          ]} />

          <FieldGroup title="Grading" fields={[
            { label: "Colour Grade",     value: val(s.color)        },
            { label: "Clarity",          value: val(s.clarity)      },
            { label: "Cut Grade",        value: val(s.cutGrade)     },
            { label: "Cut Form",         value: val(s.cutForm)      },
            { label: "Polish",           value: val(s.polish)       },
            { label: "Symmetry",         value: val(s.symmetry)     },
            { label: "Fancy Color Int.", value: val(s.fancyColorIntensity) },
            { label: "Fancy Color Hue",  value: val(s.fancyColorHue)       },
          ]} />

          <FieldGroup title="Physical" fields={[
            { label: "Carat Weight",    value: carat(s.caratWeight)  },
            { label: "Length (mm)",     value: val(s.measLength)     },
            { label: "Width (mm)",      value: val(s.measWidth)      },
            { label: "Height (mm)",     value: val(s.measHeight)     },
            { label: "Transparency",    value: val(s.transparency)   },
            { label: "Growth Method",   value: val(s.growthMethod)   },
          ]} />

          <FieldGroup title="Fluorescence" fields={[
            { label: "Intensity",  value: val(s.fluorescenceIntensity) },
            { label: "Color",      value: val(s.fluorescenceColor)     },
          ]} />

          <FieldGroup title="Certificate & Verification" fields={[
            { label: "Cert Lab",         value: val(s.certificateLab || s.certLab) },
            { label: "Cert Number",      value: val(s.certNumber)       },
            { label: "Verification ID",  value: val(s.verificationId)   },
            { label: "Verification URL", value: val(s.verificationUrl)  },
          ]} />

          <FieldGroup title="Sourcing" fields={[
            { label: "Supplier",     value: val(s.supplierName) },
            { label: "Cost (USD)",   value: s.costUsd != null ? `$${Number(s.costUsd).toLocaleString("en-US")}` : null },
          ]} />

          {s.internalNotes && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 2, height: 12, background: GD, borderRadius: 1 }} />
                <span style={{ fontFamily: SANS, fontSize: 9.5, fontWeight: 700, color: CHL, letterSpacing: "0.14em", textTransform: "uppercase" }}>Notes</span>
              </div>
              <p style={{ fontFamily: HEB, fontSize: 12.5, color: CHM, lineHeight: 1.65, margin: 0, padding: "10px 14px", background: IV2, borderRadius: 6, borderLeft: `2px solid ${GD}` }}>
                {s.internalNotes}
              </p>
            </div>
          )}

          {/* Future actions — scaffolded */}
          <div style={{ display: "flex", gap: 10, paddingTop: 16, borderTop: "1px solid rgba(54,69,79,0.1)" }}>
            <button
              disabled
              title="יהיה זמין ב-Milestone 5.3"
              style={{ height: 38, padding: "0 14px", border: "1px solid rgba(54,69,79,0.15)", borderRadius: 6, background: "transparent", cursor: "not-allowed", fontFamily: HEB, fontSize: 12, color: CHX }}
            >
              🔢 השתמש במחשבון
            </button>
            <button
              disabled
              title="יהיה זמין ב-Milestone 5.3"
              style={{ height: 38, padding: "0 14px", border: "1px solid rgba(54,69,79,0.15)", borderRadius: 6, background: "transparent", cursor: "not-allowed", fontFamily: HEB, fontSize: 12, color: CHX }}
            >
              📋 צור דוח
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── StoneTable ───────────────────────────────────────────────────────────────

function StoneTable({ stones, loading, onRowClick }) {
  const COL_HEADERS = [
    { label: "",           width: 46,  key: "thumb"   },
    { label: 'מק"ט',       width: 100, key: "sku"     },
    { label: "סוג אבן",    width: 90,  key: "type"    },
    { label: "קרט",        width: 60,  key: "carat"   },
    { label: "צבע",        width: 50,  key: "color"   },
    { label: "ניקיון",     width: 70,  key: "clarity" },
    { label: "סטטוס",      width: 90,  key: "status"  },
  ];

  return (
    <div style={{ overflowX: "auto", border: "1px solid rgba(54,69,79,0.1)", borderRadius: 7 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
        <thead>
          <tr style={{ background: IV2 }}>
            {COL_HEADERS.map((h) => (
              <th key={h.key} style={{ padding: "9px 12px", fontFamily: SANS, fontSize: 10.5, fontWeight: 700, color: CHL, letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "start", width: h.width || "auto", borderBottom: "1px solid rgba(54,69,79,0.12)", whiteSpace: "nowrap" }}>
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <SkeletonRow key={i} cols={COL_HEADERS.length} />
          ))}
          {!loading && stones.length === 0 && (
            <tr>
              <td colSpan={COL_HEADERS.length} style={{ padding: "32px 20px", textAlign: "center", color: CHL, fontFamily: HEB, fontSize: 13 }}>
                אין אבנים במלאי כרגע.
              </td>
            </tr>
          )}
          {!loading && stones.map((s) => (
            <tr
              key={s.id}
              onClick={() => onRowClick && onRowClick(s)}
              style={{ cursor: onRowClick ? "pointer" : "default", transition: "background 0.1s" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(197,179,88,0.06)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              title="לחץ לפרטים מלאים"
            >
              <td style={{ padding: "7px 12px", borderBottom: "1px solid rgba(54,69,79,0.07)", verticalAlign: "middle" }}>
                <StoneThumbnail url={s.thumbnailUrl} />
              </td>
              <Cell style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: CH }}>{s.sku}</Cell>
              <Cell>{s.stoneType || s.productType}</Cell>
              <Cell style={{ textAlign: "end" }}>
                {s.caratWeight != null ? `${parseFloat(s.caratWeight).toFixed(2)}` : null}
              </Cell>
              <Cell>{s.color}</Cell>
              <Cell>{s.clarity}</Cell>
              <td style={{ padding: "7px 12px", borderBottom: "1px solid rgba(54,69,79,0.07)", verticalAlign: "middle" }}>
                <StatusBadge status={s.inventoryStatus} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── MetalList ────────────────────────────────────────────────────────────────

function MetalList({ metals, loading }) {
  if (loading) {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ width: 140, height: 56, borderRadius: 7, background: "rgba(54,69,79,0.07)", animation: "pulse 1.5s ease-in-out infinite" }} />
        ))}
      </div>
    );
  }
  if (metals.length === 0) {
    return <div style={{ fontFamily: HEB, fontSize: 13, color: CHL, padding: "20px 0", textAlign: "center" }}>אין מחירי מתכות.</div>;
  }
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {metals.map((m) => (
        <div key={m.id} style={{ background: IV2, border: "1px solid rgba(54,69,79,0.1)", borderRadius: 7, padding: "10px 16px", minWidth: 130 }}>
          <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: CH, marginBottom: 4 }}>
            {m.metalType ?? "—"}
          </div>
          <div style={{ fontFamily: SANS, fontSize: 12, color: CHL }}>
            {m.pricePerGram != null
              ? `$${Number(m.pricePerGram).toFixed(2)} / גרם`
              : "מחיר לא זמין"}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── InventoryPreview (main export) ──────────────────────────────────────────

export function InventoryPreview({
  stones   = [],
  metals   = [],
  jewelry  = [],
  loading  = false,
  error    = null,
  onRetry,
  onAddNew,
  onUseInCalc,
  onUseInReport,
}) {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <div>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
      `}</style>

      {/* Item detail modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontFamily: "'Merriweather','Times New Roman',Georgia,serif", fontSize: 18, fontWeight: 700, color: CH, letterSpacing: "0.06em", margin: 0 }}>
            מלאי — Inventory
          </h2>
          <p style={{ fontFamily: HEB, fontSize: 12, color: CHL, margin: "4px 0 0" }}>
            לחץ על שורה לפתיחת פרטים מלאים
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Airtable live indicator */}
          {!loading && !error && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: SANS, fontSize: 11, color: "#3d7a44" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#3d7a44" }} />
              מחובר ל-Airtable
            </div>
          )}

          {/* Add new product */}
          {onAddNew && (
            <button
              onClick={onAddNew}
              style={{ height: 38, padding: "0 16px", background: CH, color: IV, border: "none", borderRadius: 7, cursor: "pointer", fontFamily: HEB, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}
            >
              + קלוט מוצר חדש
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && !loading && (
        <div style={{ padding: "24px 20px", background: "rgba(176,64,64,0.05)", border: "1px solid rgba(176,64,64,0.18)", borderRadius: 8, textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 24, marginBottom: 10 }}>⚠️</div>
          <p style={{ fontFamily: HEB, fontSize: 13, color: "#b04040", margin: "0 0 14px", lineHeight: 1.6 }}>
            {error}
          </p>
          {onRetry && (
            <button onClick={onRetry} style={{ height: 36, padding: "0 18px", background: CH, color: IV, border: "none", borderRadius: 6, fontFamily: HEB, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              ↺ נסה שוב
            </button>
          )}
        </div>
      )}

      {/* Stones */}
      {(!error || loading) && (
        <div style={{ marginBottom: 28 }}>
          <SectionHeader icon="💎" title="אבנים" count={loading ? null : stones.length} />
          <StoneTable
            stones={stones}
            loading={loading}
            onRowClick={setSelectedItem}
          />
        </div>
      )}

      {/* Metals */}
      {(!error || loading) && (
        <div style={{ marginBottom: 28 }}>
          <SectionHeader icon="🪙" title="מחירי מתכות" count={loading ? null : metals.length} />
          <MetalList metals={metals} loading={loading} />
        </div>
      )}

      {/* Future milestone note */}
      {!loading && !error && (
        <div style={{ padding: "12px 16px", background: "rgba(197,179,88,0.06)", border: "1px solid rgba(197,179,88,0.2)", borderRadius: 7, fontFamily: HEB, fontSize: 12, color: CHL, lineHeight: 1.6 }}>
          🔗 <strong style={{ color: CHM }}>Milestone 5.3</strong> — כפתורי "השתמש במחשבון" ו"צור דוח" ישולבו מתוך תצוגת הפריט.
        </div>
      )}
    </div>
  );
}
