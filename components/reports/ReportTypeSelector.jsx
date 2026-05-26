/**
 * components/reports/ReportTypeSelector.jsx
 *
 * Report type picker shown before a report is created.
 * Active types are clickable cards.
 * Coming-soon types are displayed with a badge and are not clickable.
 *
 * Props:
 *   onSelect(typeId)   — called when user picks an active report type
 *   onBack()           — called by "← Back to Calculator" button
 */

import { ALL_TYPES } from "../../lib/reports/reportTypes";

// ─── Tokens ──────────────────────────────────────────────────────────
const CH    = "#36454F";
const CHM   = "#4a5c68";
const CHL   = "#7a8e98";
const CHX   = "#a8bcc4";
const IV    = "#FAF9F6";
const IV2   = "#F0EDE8";
const GD    = "#C5B358";
const SERIF = "'Merriweather','Times New Roman',Georgia,serif";
const SANS  = "'DM Sans',Helvetica,Arial,sans-serif";
const HEB   = "'Assistant','Heebo',Arial,sans-serif";

export function ReportTypeSelector({ onSelect, onBack }) {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>

      {/* ── Back link ─────────────────────────────────────────────── */}
      <button
        onClick={onBack}
        style={{
          display:    "flex",
          alignItems: "center",
          gap:        8,
          background: "transparent",
          border:     "none",
          cursor:     "pointer",
          fontFamily: HEB,
          fontSize:   13,
          color:      CHL,
          padding:    0,
          marginBottom: 28,
        }}
      >
        ← חזור למחשבון
      </button>

      {/* ── Section heading ───────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontFamily:    SERIF,
            fontSize:      22,
            fontWeight:    700,
            color:         CH,
            letterSpacing: "0.04em",
            marginBottom:  8,
          }}
        >
          Report Engine
        </div>
        <div
          style={{
            fontFamily: SANS,
            fontSize:   13,
            color:      CHL,
            lineHeight: 1.6,
          }}
        >
          Select a report type to generate a professional A4 document.
          Every field is editable before printing.
        </div>
      </div>

      {/* ── Report type grid ──────────────────────────────────────── */}
      <div
        style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap:                 14,
        }}
      >
        {ALL_TYPES.map((type) => {
          const isActive = type.status === "active";
          return (
            <button
              key={type.id}
              onClick={() => isActive && onSelect(type.id)}
              disabled={!isActive}
              style={{
                background:  isActive ? "#FFFFFF" : IV2,
                border:      `1px solid ${isActive ? "rgba(54,69,79,0.14)" : "rgba(54,69,79,0.08)"}`,
                borderRadius: 10,
                padding:     "20px 20px 18px",
                cursor:      isActive ? "pointer" : "default",
                textAlign:   "left",
                transition:  "border-color 0.15s, box-shadow 0.15s",
                display:     "flex",
                flexDirection: "column",
                gap:         10,
                position:    "relative",
                opacity:     isActive ? 1 : 0.72,
              }}
              onMouseEnter={(e) => {
                if (isActive) {
                  e.currentTarget.style.borderColor = type.accent;
                  e.currentTarget.style.boxShadow   = `0 0 0 3px ${type.accent}22`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isActive
                  ? "rgba(54,69,79,0.14)"
                  : "rgba(54,69,79,0.08)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Accent line */}
              <div
                style={{
                  position:    "absolute",
                  top:         0,
                  left:        0,
                  right:       0,
                  height:      3,
                  background:  isActive ? type.accent : "rgba(54,69,79,0.12)",
                  borderRadius: "10px 10px 0 0",
                }}
              />

              {/* Label + badge */}
              <div
                style={{
                  display:        "flex",
                  justifyContent: "space-between",
                  alignItems:     "flex-start",
                  gap:            8,
                  paddingTop:     4,
                }}
              >
                <span
                  style={{
                    fontFamily: SANS,
                    fontSize:   14,
                    fontWeight: 600,
                    color:      isActive ? CH : CHL,
                    lineHeight: 1.3,
                    textAlign:  "left",
                  }}
                >
                  {type.label}
                </span>
                {!isActive && (
                  <span
                    style={{
                      fontFamily:    SANS,
                      fontSize:      9,
                      fontWeight:    700,
                      color:         CHX,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      background:    "rgba(54,69,79,0.07)",
                      padding:       "2px 7px",
                      borderRadius:  20,
                      whiteSpace:    "nowrap",
                      flexShrink:    0,
                    }}
                  >
                    Soon
                  </span>
                )}
              </div>

              {/* Description */}
              <p
                style={{
                  fontFamily: SANS,
                  fontSize:   12,
                  color:      CHL,
                  lineHeight: 1.6,
                  margin:     0,
                  textAlign:  "left",
                }}
              >
                {type.description}
              </p>

              {/* Prefix badge */}
              <div
                style={{
                  fontFamily:    SANS,
                  fontSize:      9,
                  fontWeight:    700,
                  color:         isActive ? type.accent : CHX,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {type.prefix}
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
}
