/**
 * components/inventory/WorkTray.jsx  —  v5.4
 *
 * Replaces SelectionBasket.jsx from M5.3.
 *
 * "Work Tray" / "מגש עבודה" — a temporary selection of stones and
 * components used for calculator prefill, jewelry design, certificate
 * generation, quoting, and memo/consignment preparation.
 *
 * This is NOT a shopping cart. It is a studio work surface.
 *
 * Changes from SelectionBasket:
 *   • "Basket" / "Add to Basket" → "Work Tray" / "הוסף למגש עבודה"
 *   • "Items selected" → "פריטים במגש"
 *   • Action buttons: "עיצוב תכשיט — בקרוב" / "צור מזכר — בקרוב" / "הצעת מחיר — בקרוב" / "ייצוא — בקרוב"
 *   • Expanded view: shows per-item use-type chip (center/side/component)
 *     when item has a useAs assignment (set by onUseInCalculator flow)
 *   • Multi-select send flow: "שלח למחשבון" button visible when >0 items
 *
 * Props:
 *   items       {array}   — selected item objects (may have .useAs field)
 *   onRemove    {function(id)}
 *   onClear     {function}
 *   onSendToCalculator {function(items)} — send multiple items to calculator
 */

import { useState } from "react";
import { C } from "../../lib/constants";
import { PRODUCT_TYPE_ICONS } from "./InventoryCard";

const HEB = C.heb;
const DAT = C.dat;

const USE_AS_LABELS = {
  center: { label: "אבן מרכזית", color: "#4a5c68" },
  side:   { label: "אבני צד",    color: "#6a8c6e" },
  part:   { label: "רכיב",       color: "#8a7a2a" },
};

export function WorkTray({ items, onRemove, onClear, onSendToCalculator }) {
  const [expanded, setExpanded] = useState(false);

  if (!items || items.length === 0) return null;

  const totalCt   = items.reduce((s, i) => s + (parseFloat(i.caratWeight) || 0), 0);
  const totalCost = items.reduce((s, i) => s + (Number(i.costUsd) || 0), 0);
  const hasCt     = totalCt > 0;
  const hasCost   = totalCost > 0;

  const ACTIONS = [
    { label: "🎨 עיצוב תכשיט — בקרוב", soon: true,  key: "design"   },
    { label: "📄 צור מזכר / שטר",    soon: true,  key: "memo"     },
    { label: "💬 הצעת מחיר",          soon: true,  key: "quote"    },
    { label: "⬇ ייצוא",              soon: true,  key: "export"   },
  ];

  return (
    <div
      className="no-print"
      style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:1100,
        background:C.ch, color:C.iv, boxShadow:"0 -4px 20px rgba(54,69,79,0.25)",
      }}
    >
      {/* ── Collapsed bar ── */}
      <div style={{ display:"flex", alignItems:"center", gap:14, padding:"0 24px", height:52, flexWrap:"wrap" }}>

        {/* Identity */}
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ background:C.gd, color:C.ch, borderRadius:12, padding:"2px 10px", fontFamily:DAT, fontSize:12, fontWeight:800, lineHeight:1.7 }}>
            {items.length} {items.length === 1 ? "פריט" : "פריטים"} במגש
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

        <div style={{ flex:1 }} />

        {/* Send to Calculator (multi-item flow) */}
        {onSendToCalculator && items.length > 0 && (
          <button
            onClick={() => onSendToCalculator(items)}
            style={{ height:34, padding:"0 14px", background:"rgba(197,179,88,0.18)", color:C.gd, border:`1px solid ${C.gd}`, borderRadius:6, cursor:"pointer", fontFamily:HEB, fontSize:12, fontWeight:700, whiteSpace:"nowrap" }}
          >
            🔢 שלח למחשבון
          </button>
        )}

        {/* Action buttons */}
        <div style={{ display:"flex", gap:8 }}>
          {ACTIONS.map(({ label, soon, key }) => (
            <button
              key={key}
              disabled={soon}
              title={soon ? "בקרוב" : undefined}
              style={{ height:34, padding:"0 12px", background:soon?"transparent":"rgba(197,179,88,0.18)", color:soon?C.chm:C.gd, border:`1px solid ${soon?"rgba(168,188,196,0.2)":C.gd}`, borderRadius:6, cursor:soon?"not-allowed":"pointer", fontFamily:HEB, fontSize:12, fontWeight:soon?400:600, opacity:soon?0.5:1, whiteSpace:"nowrap" }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ height:34, padding:"0 12px", background:"transparent", color:C.chx, border:"1px solid rgba(168,188,196,0.25)", borderRadius:6, cursor:"pointer", fontFamily:DAT, fontSize:12, whiteSpace:"nowrap" }}
        >
          {expanded ? "▾ סגור" : "▴ הצג"}
        </button>

        {/* Clear */}
        <button
          onClick={onClear}
          style={{ height:34, padding:"0 12px", background:"transparent", color:"rgba(168,188,196,0.6)", border:"1px solid rgba(168,188,196,0.2)", borderRadius:6, cursor:"pointer", fontFamily:HEB, fontSize:12, whiteSpace:"nowrap" }}
          title="נקה מגש עבודה"
        >
          × נקה
        </button>
      </div>

      {/* ── Expanded item list ── */}
      {expanded && (
        <div style={{ borderTop:"1px solid rgba(168,188,196,0.15)", maxHeight:200, overflowY:"auto", padding:"8px 24px" }}>
          {items.map(item => {
            const ct   = item.caratWeight ? `${parseFloat(item.caratWeight).toFixed(2)} ct` : null;
            const cost = item.costUsd != null ? `$${Number(item.costUsd).toLocaleString()}` : null;
            const useAsInfo = item.useAs ? USE_AS_LABELS[item.useAs] : null;

            return (
              <div key={item.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 0", borderBottom:"0.5px solid rgba(168,188,196,0.1)" }}>
                <span style={{ fontSize:16, flexShrink:0 }}>{PRODUCT_TYPE_ICONS[item.productType] || "💎"}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:DAT, fontSize:12, color:C.iv, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {item.name || item.sku || "פריט"}
                  </div>
                  <div style={{ display:"flex", gap:6, alignItems:"center", marginTop:2 }}>
                    {(ct || cost) && (
                      <span style={{ fontFamily:DAT, fontSize:11, color:C.chx }}>
                        {[ct, cost].filter(Boolean).join(" · ")}
                      </span>
                    )}
                    {useAsInfo && (
                      <span style={{ fontFamily:HEB, fontSize:10, color:useAsInfo.color, background:"rgba(255,255,255,0.08)", padding:"1px 5px", borderRadius:4 }}>
                        {useAsInfo.label}
                      </span>
                    )}
                  </div>
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
