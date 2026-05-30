/**
 * components/inventory/WorkTray.jsx  —  v5.5
 *
 * "Work Tray" / "מגש עבודה" — a temporary selection of stones and components.
 * NOT a shopping cart; a studio work surface.
 *
 * v5.5 — Multiple-item send:
 *   "שלח למחשבון" no longer silently uses the first item. When the tray holds
 *   more than one item it opens TrayUseDialog, which asks how to use ALL the
 *   selected items together:
 *       • all as Center Stones   (אבני מרכז)
 *       • all as Side Stones     (אבני צד)
 *       • all as Components      (רכיבים)
 *   The chosen role is passed up via onSendToCalculator(items, useAs).
 *   A single item skips the role choice here and defers to the standard
 *   per-item flow (CalcLoadDialog → UseAsDialog) handled by the studio.
 *
 *   Per-item role assignment (different role for each item) is intentionally
 *   left for a future milestone; the dialog says so, and the engine's batch
 *   path applies one role to the whole selection.
 *
 * Future actions (design / memo / quote / export) are all disabled and tagged
 * "— בקרוב". No "Basket" wording anywhere.
 *
 * Props:
 *   items {array}                       — selected item objects (may carry .useAs)
 *   onRemove {function(id)}
 *   onClear {function}
 *   onSendToCalculator {function(items, useAs|null)}
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

// ─── TrayUseDialog — how to use ALL selected items ────────────────────────────
function TrayUseDialog({ count, onSelect, onCancel }) {
  const OPTIONS = [
    { key:"center", icon:"💎", label:"כולן כאבני מרכז", sub:`Use all ${count} items as separate center stones` },
    { key:"side",   icon:"✨", label:"כולן כאבני צד",   sub:`Use the items as side stones (fills side rows)` },
    { key:"part",   icon:"🔗", label:"כולן כרכיבים",     sub:`Treat all ${count} items as components` },
  ];
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(54,69,79,0.6)", zIndex:1500, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={(e)=>{ if(e.target===e.currentTarget) onCancel(); }}>
      <div style={{ background:C.iv, borderRadius:12, padding:"22px 26px", maxWidth:460, width:"100%", boxShadow:"0 24px 60px rgba(54,69,79,0.3)" }}>
        <div style={{ fontFamily:DAT, fontSize:13.5, fontWeight:700, color:C.ch, marginBottom:3 }}>Send {count} items to Calculator</div>
        <div style={{ fontFamily:HEB, fontSize:12, color:C.chl, marginBottom:16, lineHeight:1.6 }}>
          כיצד להשתמש בכל {count} הפריטים שנבחרו? כל הפריטים יקבלו את אותו תפקיד.
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {OPTIONS.map(opt => (
            <button key={opt.key} onClick={() => onSelect(opt.key)}
              style={{ display:"flex", alignItems:"center", gap:13, padding:"11px 14px", background:"#fff", border:"1.5px solid rgba(54,69,79,0.14)", borderRadius:9, cursor:"pointer", textAlign:"left", transition:"border-color 0.13s" }}
              onMouseEnter={(e)=>{ e.currentTarget.style.borderColor=C.gd; e.currentTarget.style.background="rgba(197,179,88,0.07)"; }}
              onMouseLeave={(e)=>{ e.currentTarget.style.borderColor="rgba(54,69,79,0.14)"; e.currentTarget.style.background="#fff"; }}
            >
              <span style={{ fontSize:22, flexShrink:0 }}>{opt.icon}</span>
              <div>
                <div style={{ fontFamily:HEB, fontSize:13, fontWeight:700, color:C.ch }}>{opt.label}</div>
                <div style={{ fontFamily:DAT, fontSize:11, color:C.chl, marginTop:1 }}>{opt.sub}</div>
              </div>
            </button>
          ))}
        </div>
        <div style={{ fontFamily:HEB, fontSize:10.5, color:C.chx, marginTop:12, lineHeight:1.6 }}>
          * הקצאת תפקיד שונה לכל פריט בנפרד תתווסף בשלב הבא.
        </div>
        <button onClick={onCancel} style={{ marginTop:10, height:38, width:"100%", background:"transparent", border:"1px solid rgba(54,69,79,0.18)", borderRadius:8, cursor:"pointer", fontFamily:HEB, fontSize:12.5, color:C.chl }}>ביטול</button>
      </div>
    </div>
  );
}

export function WorkTray({ items, onRemove, onClear, onSendToCalculator }) {
  const [expanded, setExpanded] = useState(false);
  const [showUseDialog, setShowUseDialog] = useState(false);

  if (!items || items.length === 0) return null;

  const totalCt   = items.reduce((s, i) => s + (parseFloat(i.caratWeight) || 0), 0);
  const totalCost = items.reduce((s, i) => s + (Number(i.costUsd) || 0), 0);
  const hasCt     = totalCt > 0;
  const hasCost   = totalCost > 0;

  const ACTIONS = [
    { label: "🎨 עיצוב תכשיט — בקרוב", soon: true, key: "design" },
    { label: "📄 צור מזכר / שטר — בקרוב", soon: true, key: "memo" },
    { label: "💬 הצעת מחיר — בקרוב",    soon: true, key: "quote" },
    { label: "⬇ ייצוא — בקרוב",         soon: true, key: "export" },
  ];

  const handleSend = () => {
    if (!onSendToCalculator) return;
    if (items.length === 1) {
      // Single item: defer to the standard per-item flow in the studio.
      onSendToCalculator(items, null);
    } else {
      setShowUseDialog(true);
    }
  };

  const handleUseSelected = (useAs) => {
    setShowUseDialog(false);
    onSendToCalculator(items, useAs);
  };

  return (
    <>
      {showUseDialog && (
        <TrayUseDialog count={items.length} onSelect={handleUseSelected} onCancel={() => setShowUseDialog(false)} />
      )}

      <div
        className="no-print"
        style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:1100, background:C.ch, color:C.iv, boxShadow:"0 -4px 20px rgba(54,69,79,0.25)" }}
      >
        {/* ── Collapsed bar ── */}
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"0 16px", minHeight:54, flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ background:C.gd, color:C.ch, borderRadius:12, padding:"2px 10px", fontFamily:DAT, fontSize:12, fontWeight:800, lineHeight:1.7 }}>
              {items.length} {items.length === 1 ? "פריט" : "פריטים"} במגש
            </div>
            {hasCt && <span style={{ fontFamily:DAT, fontSize:11.5, color:C.chx }}>{totalCt.toFixed(2)} ct</span>}
            {hasCost && <span style={{ fontFamily:DAT, fontSize:12.5, fontWeight:700, color:C.iv }}>${totalCost.toLocaleString("en-US")}</span>}
          </div>

          <div style={{ flex:1, minWidth:8 }} />

          {/* Send to Calculator */}
          {onSendToCalculator && (
            <button
              onClick={handleSend}
              style={{ height:36, padding:"0 16px", background:C.gd, color:C.ch, border:"none", borderRadius:7, cursor:"pointer", fontFamily:HEB, fontSize:12.5, fontWeight:700, whiteSpace:"nowrap" }}
            >
              🔢 שלח למחשבון{items.length > 1 ? ` (${items.length})` : ""}
            </button>
          )}

          {/* Future actions */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {ACTIONS.map(({ label, soon, key }) => (
              <button
                key={key}
                disabled={soon}
                title={soon ? "בקרוב" : undefined}
                style={{ height:34, padding:"0 12px", background:"transparent", color:C.chm, border:"1px solid rgba(168,188,196,0.2)", borderRadius:6, cursor:"not-allowed", fontFamily:HEB, fontSize:12, fontWeight:400, opacity:0.5, whiteSpace:"nowrap" }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Expand toggle */}
          <button onClick={() => setExpanded(!expanded)} style={{ height:34, padding:"0 12px", background:"transparent", color:C.chx, border:"1px solid rgba(168,188,196,0.25)", borderRadius:6, cursor:"pointer", fontFamily:DAT, fontSize:12, whiteSpace:"nowrap" }}>
            {expanded ? "▾ סגור" : "▴ הצג"}
          </button>

          {/* Clear */}
          <button onClick={onClear} title="נקה מגש עבודה" style={{ height:34, padding:"0 12px", background:"transparent", color:"rgba(168,188,196,0.6)", border:"1px solid rgba(168,188,196,0.2)", borderRadius:6, cursor:"pointer", fontFamily:HEB, fontSize:12, whiteSpace:"nowrap" }}>
            × נקה מגש
          </button>
        </div>

        {/* ── Expanded item list ── */}
        {expanded && (
          <div style={{ borderTop:"1px solid rgba(168,188,196,0.15)", maxHeight:220, overflowY:"auto", padding:"8px 16px" }}>
            {items.map(item => {
              const ct   = item.caratWeight ? `${parseFloat(item.caratWeight).toFixed(2)} ct` : null;
              const cost = item.costUsd != null ? `$${Number(item.costUsd).toLocaleString()}` : null;
              const useAsInfo = item.useAs ? USE_AS_LABELS[item.useAs] : null;
              return (
                <div key={item.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 0", borderBottom:"0.5px solid rgba(168,188,196,0.1)" }}>
                  <span style={{ fontSize:16, flexShrink:0 }}>{PRODUCT_TYPE_ICONS[item.productType] || "💎"}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:DAT, fontSize:12, color:C.iv, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {item.name || item.sku || "פריט"}
                    </div>
                    <div style={{ display:"flex", gap:6, alignItems:"center", marginTop:2 }}>
                      {(ct || cost) && <span style={{ fontFamily:DAT, fontSize:11, color:C.chx }}>{[ct, cost].filter(Boolean).join(" · ")}</span>}
                      {useAsInfo && (
                        <span style={{ fontFamily:HEB, fontSize:10, color:useAsInfo.color, background:"rgba(255,255,255,0.08)", padding:"1px 5px", borderRadius:4 }}>{useAsInfo.label}</span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => onRemove(item.id)} title="הסר מהמגש" style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(168,188,196,0.55)", fontSize:16, lineHeight:1, padding:"0 4px", flexShrink:0 }}>✕</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
