/**
 * components/inventory/SelectionBasket.jsx  —  v5.3
 *
 * Floating bottom bar shown when at least one item is in the basket.
 *
 * Collapsed state: count · total carat · total cost · expand toggle
 * Expanded state:  scrollable item list · placeholder action buttons
 *
 * Actions:
 *   "Design Jewelry" / "Create Memo" / "Create Quote" / "Export Selection"
 *   These are placeholder buttons — not yet wired to full functionality.
 *   They show "Coming soon" tooltip when not yet implemented.
 *
 * Props:
 *   items     {array}   — selected item objects
 *   onRemove  {function(id)}
 *   onClear   {function}
 */

import { useState } from "react";
import { C } from "../../lib/constants";
import { PRODUCT_TYPE_ICONS } from "./InventoryCard";

const HEB = C.heb;
const DAT = C.dat;

export function SelectionBasket({ items, onRemove, onClear }) {
  const [expanded, setExpanded] = useState(false);

  if (!items || items.length === 0) return null;

  const totalCt   = items.reduce((s, i) => s + (parseFloat(i.caratWeight) || 0), 0);
  const totalCost = items.reduce((s, i) => s + (Number(i.costUsd) || 0), 0);
  const hasCt     = totalCt > 0;
  const hasCost   = totalCost > 0;

  // Placeholder action buttons — v5.3.2: no broken actions.
  const ACTIONS = [
    { label: "💍 עיצוב תכשיט — בקרוב", soon: true },
    { label: "📄 Memo / Consignment — בקרוב", soon: true },
    { label: "💬 צור הצעת מחיר — בקרוב", soon: true },
    { label: "⬇ ייצוא בחירה — בקרוב", soon: true },
  ];

  return (
    <div
      className="no-print"
      style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:1100, background:C.ch, color:C.iv, boxShadow:"0 -4px 20px rgba(54,69,79,0.25)", transition:"max-height 0.25s" }}
    >
      {/* Collapsed bar */}
      <div style={{ display:"flex", alignItems:"center", gap:14, padding:"0 24px", height:52, flexWrap:"wrap" }}>
        {/* Count badge */}
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ background:C.gd, color:C.ch, borderRadius:12, padding:"2px 10px", fontFamily:DAT, fontSize:12, fontWeight:800, lineHeight:1.7 }}>
            {items.length} פריטים
          </div>
          {hasCt && (
            <span style={{ fontFamily:DAT, fontSize:11.5, color:C.chx }}>
              {totalCt.toFixed(2)} ct
            </span>
          )}
          {hasCost && (
            <span style={{ fontFamily:DAT, fontSize:12.5, fontWeight:700, color:C.iv }}>
              ${totalCost.toLocaleString("en-US")}
            </span>
          )}
        </div>

        {/* Spacer */}
        <div style={{ flex:1 }} />

        {/* Action buttons (from collapsed bar) */}
        <div style={{ display:"flex", gap:8 }}>
          {ACTIONS.map(({ label, soon }) => (
            <button
              key={label}
              disabled={soon}
              title={soon ? "בקרוב" : undefined}
              style={{ height:34, padding:"0 14px", background:soon?"transparent":"rgba(197,179,88,0.18)", color:soon?C.chm:C.gd, border:`1px solid ${soon?"rgba(168,188,196,0.2)":C.gd}`, borderRadius:6, cursor:soon?"not-allowed":"pointer", fontFamily:HEB, fontSize:12, fontWeight:soon?400:600, opacity:soon?0.55:1, whiteSpace:"nowrap", transition:"all 0.15s" }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ height:34, padding:"0 12px", background:"transparent", color:C.chx, border:"1px solid rgba(168,188,196,0.25)", borderRadius:6, cursor:"pointer", fontFamily:DAT, fontSize:12, display:"flex", alignItems:"center", gap:5, whiteSpace:"nowrap" }}
        >
          {expanded ? "▾ סגור" : "▴ הצג"}
        </button>

        {/* Clear all */}
        <button
          onClick={onClear}
          style={{ height:34, padding:"0 12px", background:"transparent", color:"rgba(168,188,196,0.6)", border:"1px solid rgba(168,188,196,0.2)", borderRadius:6, cursor:"pointer", fontFamily:HEB, fontSize:12, whiteSpace:"nowrap" }}
          title="נקה בחירה"
        >
          × נקה סל
        </button>
      </div>

      {/* Expanded item list */}
      {expanded && (
        <div style={{ borderTop:"1px solid rgba(168,188,196,0.15)", maxHeight:200, overflowY:"auto", padding:"8px 24px" }}>
          {items.map(item => {
            const ct = item.caratWeight ? `${parseFloat(item.caratWeight).toFixed(2)} ct` : null;
            const cost = item.costUsd != null ? `$${Number(item.costUsd).toLocaleString()}` : null;
            return (
              <div key={item.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 0", borderBottom:"0.5px solid rgba(168,188,196,0.1)" }}>
                <span style={{ fontSize:16, flexShrink:0 }}>{PRODUCT_TYPE_ICONS[item.productType] || "💎"}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:DAT, fontSize:12, color:C.iv, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {item.name || item.sku || "Item"}
                  </div>
                  {(ct || cost) && (
                    <div style={{ fontFamily:DAT, fontSize:11, color:C.chx }}>
                      {[ct, cost].filter(Boolean).join(" · ")}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onRemove(item.id)}
                  style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(168,188,196,0.55)", fontSize:16, lineHeight:1, padding:"0 4px", flexShrink:0 }}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
