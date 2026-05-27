/**
 * components/inventory/IntakeMethodSelector.jsx
 *
 * Step 2 of the Product Intake Wizard.
 * User chooses between Manual Entry and Certificate-Based Import.
 *
 * NOTE: AI/OCR extraction from certificates will be connected in a later
 * milestone. For now, the import flow collects certificate metadata and
 * presents the standard form for manual data entry/review.
 *
 * Props:
 *   productType: string
 *   onSelect(method: "manual" | "certificate")
 *   onBack()
 *   selectedMethod: string|null
 */

import { C } from "../../lib/constants";

const SANS = "'DM Sans',Helvetica,Arial,sans-serif";
const HEB  = "'Assistant','Heebo',Arial,sans-serif";
const CH   = C.ch;
const CHM  = "#4a5c68";
const CHL  = C.chl;
const GD   = C.gd;

// ─── Method card data ─────────────────────────────────────────────────────────
const METHODS = [
  {
    key:   "manual",
    icon:  "✏️",
    label: "Manual Entry",
    labelHe: "הזנה ידנית",
    desc:  "Enter all stone details manually using the standard form fields.",
    descHe:"הזן את פרטי הפריט באופן ידני",
  },
  {
    key:   "certificate",
    icon:  "📄",
    label: "Import External Certificate",
    labelHe: "ייבוא תעודה חיצונית",
    desc:  "Enter certificate details — data fields will be pre-filled for review.",
    descHe:"הזן פרטי תעודה חיצונית (GIA, IGI וכו')",
    badge: "AI בהמשך",
  },
];

// ─── MethodCard ───────────────────────────────────────────────────────────────
function MethodCard({ m, selected, onSelect }) {
  const isSelected = selected === m.key;
  return (
    <button
      onClick={() => onSelect(m.key)}
      style={{
        display:      "flex",
        flexDirection:"column",
        gap:           12,
        padding:      "20px 22px",
        border:       isSelected
          ? `2px solid ${GD}`
          : "1.5px solid rgba(54,69,79,0.14)",
        borderRadius: 10,
        background:   isSelected ? "rgba(197,179,88,0.07)" : "#fff",
        cursor:        "pointer",
        textAlign:     "start",
        flex:          "1 1 240px",
        minWidth:      200,
        transition:    "border-color 0.15s, background 0.15s",
        boxShadow:     isSelected ? `0 0 0 2px ${GD}22` : "none",
      }}
    >
      <span style={{ fontSize: 36, lineHeight: 1 }}>{m.icon}</span>

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span
            style={{
              fontFamily:    SANS,
              fontSize:      15,
              fontWeight:    700,
              color:         CH,
              letterSpacing: "0.01em",
            }}
          >
            {m.label}
          </span>
          {m.badge && (
            <span
              style={{
                fontFamily:    SANS,
                fontSize:      9,
                fontWeight:    700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color:         "#7a6800",
                background:    "rgba(197,179,88,0.15)",
                border:        "1px solid rgba(197,179,88,0.35)",
                borderRadius:  4,
                padding:       "2px 6px",
              }}
            >
              {m.badge}
            </span>
          )}
        </div>

        <div
          style={{
            fontFamily:   HEB,
            fontSize:     12,
            color:        isSelected ? "#8a6800" : CHL,
            fontWeight:   isSelected ? 600 : 400,
            marginBottom: 6,
          }}
        >
          {m.labelHe}
        </div>

        <div style={{ fontFamily: SANS, fontSize: 12, color: CHM, lineHeight: 1.55 }}>
          {m.desc}
        </div>

        {m.key === "certificate" && (
          <div
            style={{
              marginTop:   10,
              padding:     "8px 10px",
              background:  "rgba(197,179,88,0.06)",
              border:      "1px solid rgba(197,179,88,0.2)",
              borderRadius: 5,
              fontFamily:  HEB,
              fontSize:    11,
              color:       CHL,
              lineHeight:  1.5,
            }}
          >
            {/* AI extraction placeholder — will be connected in a later milestone */}
            🤖 חילוץ נתונים אוטומטי מהתעודה יתווסף בגרסה הבאה.
            כרגע: הזן פרטי תעודה ועדכן שדות ידנית.
          </div>
        )}
      </div>
    </button>
  );
}

// ─── IntakeMethodSelector ─────────────────────────────────────────────────────
export function IntakeMethodSelector({ productType, onSelect, onBack, selectedMethod }) {
  return (
    <div>
      <div
        style={{
          fontFamily:   HEB,
          fontSize:     13,
          color:        CHL,
          marginBottom: 20,
          lineHeight:   1.5,
        }}
      >
        כיצד תרצה להזין את הפריט?
      </div>

      {/* Method cards */}
      <div
        style={{
          display:  "flex",
          flexWrap: "wrap",
          gap:       14,
          marginBottom: 28,
        }}
      >
        {METHODS.map((m) => (
          <MethodCard
            key={m.key}
            m={m}
            selected={selectedMethod}
            onSelect={onSelect}
          />
        ))}
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          height:       40,
          padding:      "0 18px",
          border:       "1px solid rgba(54,69,79,0.2)",
          borderRadius: 6,
          background:   "transparent",
          color:        CHL,
          fontFamily:   HEB,
          fontSize:     13,
          cursor:       "pointer",
          display:      "flex",
          alignItems:   "center",
          gap:           6,
        }}
      >
        ← חזור לבחירת סוג מוצר
      </button>
    </div>
  );
}
