/**
 * components/InventoryPreview.jsx
 *
 * Read-only inventory display for LESHEM.S OS.
 * Milestone 5.0 — shows stone inventory and metal price list.
 *
 * Props:
 *   stones   {object[]}   Normalized stone objects from /api/airtable/stones
 *   metals   {object[]}   Normalized metal objects from /api/airtable/metals
 *   loading  {boolean}    True while fetching
 *   error    {string|null} Error message if fetch failed
 *   onRetry  {function}   Called when user clicks retry after error
 *
 * "Use in Calculator" and "Use in Report" hooks are scaffolded but
 * disabled — will be wired in Milestone 5.1.
 */

import { C } from "../lib/constants";

// ─── Design tokens (local) ────────────────────────────────────────────────────
const SANS  = C.dat;   // DM Sans — data/labels
const HEB   = C.heb;   // Assistant/Heebo
const CH    = C.ch;    // charcoal
const CHM   = "#4a5c68";
const CHL   = C.chl;
const CHX   = C.chx;
const IV    = C.iv;
const IV2   = "#F0EDE8";
const GD    = C.gd;
const SG    = C.sg;

// ─── Status badge colors ──────────────────────────────────────────────────────
const STATUS_COLORS = {
  "במלאי":  { bg: "rgba(138,171,142,0.15)", color: "#3d7a44", border: "rgba(138,171,142,0.5)" },  // In stock
  "נמכר":   { bg: "rgba(176,64,64,0.10)",  color: "#b04040", border: "rgba(176,64,64,0.35)"  },  // Sold
  "שמור":   { bg: "rgba(197,179,88,0.12)", color: "#7a6a1a", border: "rgba(197,179,88,0.4)"  },  // Reserved
  "הזמנה":  { bg: "rgba(74,92,104,0.1)",   color: "#4a5c68", border: "rgba(74,92,104,0.3)"   },  // On order
};

const DEFAULT_STATUS_COLOR = {
  bg: "rgba(54,69,79,0.07)", color: CHM, border: "rgba(54,69,79,0.18)",
};

// ─── SkeletonRow ──────────────────────────────────────────────────────────────
function SkeletonRow({ cols }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: "10px 12px", borderBottom: "1px solid rgba(54,69,79,0.07)" }}>
          <div
            style={{
              height:       12,
              borderRadius: 4,
              background:   "rgba(54,69,79,0.1)",
              width:        `${40 + (i * 17 + 23) % 45}%`,
              animation:    "pulse 1.5s ease-in-out infinite",
            }}
          />
        </td>
      ))}
    </tr>
  );
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  if (!status) return null;
  const colors = STATUS_COLORS[status] ?? DEFAULT_STATUS_COLOR;
  return (
    <span
      style={{
        display:      "inline-block",
        padding:      "2px 8px",
        borderRadius: 12,
        fontSize:     11,
        fontFamily:   HEB,
        fontWeight:   600,
        background:   colors.bg,
        color:        colors.color,
        border:       `1px solid ${colors.border}`,
        whiteSpace:   "nowrap",
      }}
    >
      {status}
    </span>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
function SectionHeader({ title, count, icon }) {
  return (
    <div
      style={{
        display:      "flex",
        alignItems:   "center",
        gap:          10,
        marginBottom: 14,
      }}
    >
      <div
        style={{
          width:      3,
          height:     18,
          background: GD,
          borderRadius: 2,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily:    SANS,
          fontSize:      13,
          fontWeight:    700,
          color:         CH,
          letterSpacing: "0.04em",
        }}
      >
        {icon && <span style={{ marginLeft: 6 }}>{icon}</span>}
        {title}
      </span>
      {count != null && (
        <span
          style={{
            fontFamily:   HEB,
            fontSize:     11,
            color:        CHL,
            background:   IV2,
            border:       "1px solid rgba(54,69,79,0.14)",
            borderRadius: 10,
            padding:      "1px 8px",
          }}
        >
          {count}
        </span>
      )}
      <div style={{ flex: 1, height: "1px", background: "rgba(54,69,79,0.1)" }} />
    </div>
  );
}

// ─── ErrorState ───────────────────────────────────────────────────────────────
function ErrorState({ message, onRetry }) {
  return (
    <div
      style={{
        padding:      "24px 20px",
        background:   "rgba(176,64,64,0.05)",
        border:       "1px solid rgba(176,64,64,0.18)",
        borderRadius: 8,
        textAlign:    "center",
      }}
    >
      <div style={{ fontSize: 24, marginBottom: 10 }}>⚠️</div>
      <p
        style={{
          fontFamily:   HEB,
          fontSize:     13,
          color:        "#b04040",
          margin:       "0 0 14px",
          lineHeight:   1.6,
        }}
      >
        {message || "Could not load inventory from Airtable."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            height:       36,
            padding:      "0 18px",
            background:   CH,
            color:        IV,
            border:       "none",
            borderRadius: 6,
            fontFamily:   HEB,
            fontSize:     12,
            fontWeight:   600,
            cursor:       "pointer",
          }}
        >
          ↺ נסה שוב
        </button>
      )}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
function EmptyState({ message }) {
  return (
    <div
      style={{
        padding:   "32px 20px",
        textAlign: "center",
        color:     CHL,
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
      <p style={{ fontFamily: HEB, fontSize: 13, margin: 0 }}>
        {message || "No records found."}
      </p>
    </div>
  );
}

// ─── Cell — table cell helper ─────────────────────────────────────────────────
function Cell({ children, style }) {
  return (
    <td
      style={{
        padding:     "9px 12px",
        fontFamily:  SANS,
        fontSize:    12.5,
        color:       CHM,
        verticalAlign:"middle",
        borderBottom:"1px solid rgba(54,69,79,0.07)",
        lineHeight:  1.4,
        ...style,
      }}
    >
      {children ?? <span style={{ color: CHX }}>—</span>}
    </td>
  );
}

// ─── StoneThumbnail ───────────────────────────────────────────────────────────
function StoneThumbnail({ url }) {
  if (!url) {
    return (
      <div
        style={{
          width:        36,
          height:       36,
          borderRadius: 4,
          background:   IV2,
          border:       "1px solid rgba(54,69,79,0.12)",
          display:      "flex",
          alignItems:   "center",
          justifyContent: "center",
          fontSize:     16,
          flexShrink:   0,
        }}
      >
        💎
      </div>
    );
  }
  return (
    <img
      src={url}
      alt=""
      loading="lazy"
      style={{
        width:        36,
        height:       36,
        objectFit:    "cover",
        borderRadius: 4,
        border:       "1px solid rgba(54,69,79,0.12)",
        display:      "block",
        flexShrink:   0,
        background:   IV2,
      }}
    />
  );
}

// ─── StoneTable ───────────────────────────────────────────────────────────────
function StoneTable({ stones, loading }) {
  const COL_HEADERS = [
    { label: "",           width: 46,  key: "thumb"  },
    { label: 'מק"ט',       width: 100, key: "sku"    },
    { label: "סוג אבן",    width: 90,  key: "type"   },
    { label: "צורה",       width: 90,  key: "shape"  },
    { label: "קרט",        width: 60,  key: "carat"  },
    { label: "צבע",        width: 50,  key: "color"  },
    { label: "ניקיון",     width: 70,  key: "clarity"},
    { label: "סטטוס",      width: 90,  key: "status" },
    { label: "עלות ($)",   width: 80,  key: "cost"   },
  ];

  return (
    <div
      style={{
        overflowX: "auto",
        border:    "1px solid rgba(54,69,79,0.1)",
        borderRadius: 7,
      }}
    >
      <table
        style={{
          width:          "100%",
          borderCollapse: "collapse",
          minWidth:       640,
        }}
      >
        <thead>
          <tr style={{ background: IV2 }}>
            {COL_HEADERS.map((h) => (
              <th
                key={h.key}
                style={{
                  padding:       "9px 12px",
                  fontFamily:    SANS,
                  fontSize:      10.5,
                  fontWeight:    700,
                  color:         CHL,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  textAlign:     "start",
                  width:         h.width || "auto",
                  borderBottom:  "1px solid rgba(54,69,79,0.12)",
                  whiteSpace:    "nowrap",
                }}
              >
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
              <td
                colSpan={COL_HEADERS.length}
                style={{ padding: 0 }}
              >
                <EmptyState message="אין אבנים במלאי כרגע." />
              </td>
            </tr>
          )}
          {!loading && stones.map((s) => (
            <tr
              key={s.id}
              style={{
                background:  "transparent",
                transition:  "background 0.12s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(54,69,79,0.03)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              {/* Thumbnail */}
              <td style={{ padding: "7px 12px", borderBottom: "1px solid rgba(54,69,79,0.07)", verticalAlign: "middle" }}>
                <StoneThumbnail url={s.thumbnailUrl} />
              </td>

              {/* SKU */}
              <Cell style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: CH }}>
                {s.sku}
              </Cell>

              {/* Stone type */}
              <Cell>
                {s.stoneType || s.productType}
              </Cell>

              {/* Shape */}
              <Cell>
                {s.shape}
              </Cell>

              {/* Carat weight */}
              <Cell style={{ textAlign: "end" }}>
                {s.caratWeight != null
                  ? `${parseFloat(s.caratWeight).toFixed(2)}`
                  : null}
              </Cell>

              {/* Color */}
              <Cell>
                {s.color}
              </Cell>

              {/* Clarity */}
              <Cell>
                {s.clarity}
              </Cell>

              {/* Status */}
              <td style={{ padding: "7px 12px", borderBottom: "1px solid rgba(54,69,79,0.07)", verticalAlign: "middle" }}>
                <StatusBadge status={s.inventoryStatus} />
              </td>

              {/* Cost */}
              <Cell style={{ textAlign: "end", fontFamily: SANS, color: CH, fontWeight: 500 }}>
                {s.costUsd != null
                  ? `$${Number(s.costUsd).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                  : null}
              </Cell>
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
          <div
            key={i}
            style={{
              width:        140,
              height:       56,
              borderRadius: 7,
              background:   "rgba(54,69,79,0.07)",
              animation:    "pulse 1.5s ease-in-out infinite",
            }}
          />
        ))}
      </div>
    );
  }

  if (metals.length === 0) {
    return <EmptyState message="אין מחירי מתכות." />;
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {metals.map((m) => (
        <div
          key={m.id}
          style={{
            background:   IV2,
            border:       "1px solid rgba(54,69,79,0.1)",
            borderRadius: 7,
            padding:      "10px 16px",
            minWidth:     130,
          }}
        >
          <div
            style={{
              fontFamily:  SANS,
              fontSize:    13,
              fontWeight:  600,
              color:       CH,
              marginBottom: 4,
            }}
          >
            {m.metalType ?? "—"}
          </div>
          <div
            style={{
              fontFamily: SANS,
              fontSize:   12,
              color:      CHL,
            }}
          >
            {m.pricePerGram != null
              ? `$${Number(m.pricePerGram).toFixed(2)} לגרם`
              : "מחיר לא זמין"}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── InventoryPreview (main export) ──────────────────────────────────────────
export function InventoryPreview({ stones = [], metals = [], loading = false, error = null, onRetry }) {
  return (
    <div>
      {/* Pulse animation style */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          display:      "flex",
          alignItems:   "center",
          justifyContent:"space-between",
          marginBottom: 20,
          flexWrap:     "wrap",
          gap:          10,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily:    "'Merriweather','Times New Roman',Georgia,serif",
              fontSize:      18,
              fontWeight:    700,
              color:         CH,
              letterSpacing: "0.06em",
              margin:        0,
            }}
          >
            LESHEM.S מלאי
          </h2>
          <p
            style={{
              fontFamily: HEB,
              fontSize:   12,
              color:      CHL,
              margin:     "4px 0 0",
            }}
          >
            Milestone 5.0 — תצוגה לקריאה בלבד · חיבור מלא למחשבון בגרסה הבאה
          </p>
        </div>

        {/* Live indicator */}
        {!loading && !error && (
          <div
            style={{
              display:    "flex",
              alignItems: "center",
              gap:        6,
              fontFamily: SANS,
              fontSize:   11,
              color:      "#3d7a44",
            }}
          >
            <div
              style={{
                width:        7,
                height:       7,
                borderRadius: "50%",
                background:   "#3d7a44",
              }}
            />
            מחובר ל-Airtable
          </div>
        )}
      </div>

      {/* Error state */}
      {error && !loading && (
        <div style={{ marginBottom: 24 }}>
          <ErrorState message={error} onRetry={onRetry} />
        </div>
      )}

      {/* Stones section */}
      {(!error || loading) && (
        <div style={{ marginBottom: 28 }}>
          <SectionHeader
            icon="💎"
            title="אבנים"
            count={loading ? null : stones.length}
          />
          <StoneTable stones={stones} loading={loading} />
        </div>
      )}

      {/* Metals section */}
      {(!error || loading) && (
        <div style={{ marginBottom: 28 }}>
          <SectionHeader
            icon="🪙"
            title="מחירי מתכות"
            count={loading ? null : metals.length}
          />
          <MetalList metals={metals} loading={loading} />
        </div>
      )}

      {/* Future milestone note */}
      {!loading && !error && (
        <div
          style={{
            padding:      "12px 16px",
            background:   "rgba(197,179,88,0.06)",
            border:       "1px solid rgba(197,179,88,0.2)",
            borderRadius: 7,
            fontFamily:   HEB,
            fontSize:     12,
            color:        CHL,
            lineHeight:   1.6,
          }}
        >
          🔗 <strong style={{ color: CHM }}>Milestone 5.1</strong> — כפתורי "השתמש במחשבון" ו"השתמש בדוח"
          יתווספו לכל שורה לחיבור מלא בין המלאי לכלים.
        </div>
      )}
    </div>
  );
}
