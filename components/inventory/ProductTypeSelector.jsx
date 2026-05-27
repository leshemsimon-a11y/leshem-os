/**
 * components/inventory/ProductTypeSelector.jsx
 *
 * Step 1 of the Product Intake Wizard.
 * Displays 8 product type cards in a responsive grid.
 *
 * Props:
 *   onSelect(productTypeKey: string)  — called when user clicks a card
 *   selectedType: string|null         — currently selected key (for highlight)
 */

import { C } from "../../lib/constants";

const SANS = "'DM Sans',Helvetica,Arial,sans-serif";
const HEB  = "'Assistant','Heebo',Arial,sans-serif";
const CH   = C.ch;
const CHL  = C.chl;
const GD   = C.gd;
const IV2  = "#F0EDE8";

// ─── Product type definitions ─────────────────────────────────────────────────
// labelHe = Hebrew display label
// desc    = Short English description shown below label
// target  = "stones" | "jewelry" — which Airtable table is used
const PRODUCT_TYPES = [
  {
    key:     "natural_diamond",
    label:   "Natural Diamond",
    labelHe: "יהלום טבעי",
    icon:    "💎",
    desc:    "Round, princess, oval and other cuts",
    target:  "stones",
  },
  {
    key:     "lab_grown_diamond",
    label:   "Lab-Grown Diamond",
    labelHe: "יהלום מעבדה",
    icon:    "🔬",
    desc:    "CVD, HPHT and other growth methods",
    target:  "stones",
  },
  {
    key:     "fancy_color_diamond",
    label:   "Fancy Color Diamond",
    labelHe: "יהלום פנסי",
    icon:    "🌈",
    desc:    "Yellow, pink, blue and other fancy hues",
    target:  "stones",
  },
  {
    key:     "colored_gemstone",
    label:   "Colored Gemstone",
    labelHe: "אבן חן צבעונית",
    icon:    "🔴",
    desc:    "Ruby, emerald, sapphire and others",
    target:  "stones",
  },
  {
    key:     "stone_pair_set",
    label:   "Stone Pair / Set",
    labelHe: "זוג / סט אבנים",
    icon:    "✨",
    desc:    "Matched pair or coordinated set",
    target:  "stones",
  },
  {
    key:     "stone_parcel",
    label:   "Stone Parcel",
    labelHe: "חבילת אבנים",
    icon:    "📦",
    desc:    "Multiple loose stones as a lot",
    target:  "stones",
  },
  {
    key:     "jewelry_part",
    label:   "Jewelry Part",
    labelHe: "חלק תכשיט",
    icon:    "🔩",
    desc:    "Component or semi-finished part",
    target:  "stones",
  },
  {
    key:     "finished_jewelry",
    label:   "Finished Jewelry",
    labelHe: "תכשיט מוגמר",
    icon:    "💍",
    desc:    "Complete, sale-ready jewelry piece",
    target:  "jewelry",
  },
];

// ─── ProductTypeCard ──────────────────────────────────────────────────────────
function ProductTypeCard({ pt, selected, onSelect }) {
  const isSelected = selected === pt.key;
  return (
    <button
      onClick={() => onSelect(pt.key)}
      style={{
        display:      "flex",
        flexDirection:"column",
        alignItems:   "flex-start",
        gap:           8,
        padding:      "16px 18px",
        border:       isSelected
          ? `2px solid ${GD}`
          : "1.5px solid rgba(54,69,79,0.14)",
        borderRadius: 10,
        background:   isSelected ? "rgba(197,179,88,0.07)" : "#fff",
        cursor:        "pointer",
        textAlign:     "start",
        width:         "100%",
        transition:    "border-color 0.15s, background 0.15s",
        boxShadow:     isSelected ? `0 0 0 2px ${GD}22` : "none",
      }}
    >
      <span style={{ fontSize: 28, lineHeight: 1 }}>{pt.icon}</span>
      <div>
        <div
          style={{
            fontFamily:    SANS,
            fontSize:      14,
            fontWeight:    700,
            color:         CH,
            letterSpacing: "0.01em",
            marginBottom:  2,
          }}
        >
          {pt.label}
        </div>
        <div
          style={{
            fontFamily: HEB,
            fontSize:   12,
            color:      isSelected ? "#8a6800" : CHL,
            fontWeight: isSelected ? 600 : 400,
            marginBottom: 4,
          }}
        >
          {pt.labelHe}
        </div>
        <div
          style={{
            fontFamily: SANS,
            fontSize:   11,
            color:      CHL,
            lineHeight: 1.4,
          }}
        >
          {pt.desc}
        </div>
      </div>

      {/* Destination badge */}
      {pt.target === "jewelry" && (
        <span
          style={{
            alignSelf:    "flex-start",
            fontFamily:   SANS,
            fontSize:     9,
            fontWeight:   700,
            letterSpacing:"0.1em",
            textTransform:"uppercase",
            color:        "#4a8a52",
            background:   "rgba(74,138,82,0.1)",
            border:       "1px solid rgba(74,138,82,0.25)",
            borderRadius: 4,
            padding:      "2px 6px",
          }}
        >
          Jewelry Table
        </span>
      )}
    </button>
  );
}

// ─── ProductTypeSelector ──────────────────────────────────────────────────────
export function ProductTypeSelector({ onSelect, selectedType }) {
  return (
    <div>
      {/* Section label */}
      <div
        style={{
          fontFamily:    HEB,
          fontSize:      13,
          color:         CHL,
          marginBottom:  18,
          lineHeight:    1.5,
        }}
      >
        בחר את סוג המוצר לקליטה
      </div>

      {/* Grid */}
      <div
        style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
          gap:                 12,
        }}
      >
        {PRODUCT_TYPES.map((pt) => (
          <ProductTypeCard
            key={pt.key}
            pt={pt}
            selected={selectedType}
            onSelect={onSelect}
          />
        ))}
      </div>

      {/* Helper text */}
      {!selectedType && (
        <p
          style={{
            fontFamily:  HEB,
            fontSize:    12,
            color:       "rgba(54,69,79,0.45)",
            textAlign:   "center",
            marginTop:   20,
          }}
        >
          לחץ על כרטיס מוצר להמשך
        </p>
      )}
    </div>
  );
}

// Export the list for use in other components (e.g., wizard for label lookup)
export { PRODUCT_TYPES };
