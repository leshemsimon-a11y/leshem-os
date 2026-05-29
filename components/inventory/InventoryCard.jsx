/**
 * components/inventory/InventoryCard.jsx  —  v5.3
 *
 * Single component that renders one inventory item in four view modes:
 *   "card"    — large image, full details, primary mode
 *   "grid"    — compact square card, 4–5 per row
 *   "list"    — full-width horizontal row
 *   "compact" — dense text-only row
 *
 * All modes support:
 *   • Selection checkbox
 *   • Basket toggle
 *   • Drawer open on click
 *   • Demo badge when item.isDemo === true
 *   • Per-type gradient placeholder when no image
 *   • Inventory layer badge (Physical / Virtual / Client-Owned)
 *   • Status indicator
 */

import { C } from "../../lib/constants";

// ─── Display maps ─────────────────────────────────────────────────────────────
export const PRODUCT_TYPE_LABELS = {
  natural_diamond:     "Natural Diamond",
  lab_grown_diamond:   "Lab Grown Diamond",
  fancy_color_diamond: "Fancy Colour Diamond",
  colored_gemstone:    "Coloured Gemstone",
  stone_pair_set:      "Matched Pair",
  stone_parcel:        "Parcel",
  jewelry_part:        "Component",
  finished_jewelry:    "Finished Jewelry",
};

export const PRODUCT_TYPE_ICONS = {
  natural_diamond:     "💎",
  lab_grown_diamond:   "🔬",
  fancy_color_diamond: "✨",
  colored_gemstone:    "💠",
  stone_pair_set:      "♊",
  stone_parcel:        "📦",
  jewelry_part:        "🔗",
  finished_jewelry:    "💍",
};

// Per-type gradient backgrounds for image placeholders
export const PRODUCT_TYPE_GRADIENTS = {
  natural_diamond:     "linear-gradient(140deg,#e8f4fc 0%,#c6dff0 100%)",
  lab_grown_diamond:   "linear-gradient(140deg,#eef4ff 0%,#c4d2f8 100%)",
  fancy_color_diamond: "linear-gradient(140deg,#fffae8 0%,#f5e49a 100%)",
  colored_gemstone:    "linear-gradient(140deg,#edf8f0 0%,#b0d8bc 100%)",
  stone_pair_set:      "linear-gradient(140deg,#f4eafb 0%,#d4b0e0 100%)",
  stone_parcel:        "linear-gradient(140deg,#f0ede8 0%,#d0c8b8 100%)",
  jewelry_part:        "linear-gradient(140deg,#faf9f6 0%,#e0dcd0 100%)",
  finished_jewelry:    "linear-gradient(140deg,#fdf8e8 0%,#ead898 100%)",
};

// Inventory layer badge styles
const LAYER_STYLES = {
  "Physical Stock":         { bg:"rgba(74,92,104,0.11)",  color:"#3a5060", border:"rgba(74,92,104,0.26)"  },
  "מלאי פיזי":              { bg:"rgba(74,92,104,0.11)",  color:"#3a5060", border:"rgba(74,92,104,0.26)"  },
  "Virtual Supplier Stock": { bg:"rgba(197,179,88,0.13)", color:"#7a6a1a", border:"rgba(197,179,88,0.36)" },
  "מלאי ספק וירטואלי":      { bg:"rgba(197,179,88,0.13)", color:"#7a6a1a", border:"rgba(197,179,88,0.36)" },
  "Client-Owned Item":      { bg:"rgba(138,171,142,0.15)",color:"#3d7a44", border:"rgba(138,171,142,0.45)"},
  "פריט בבעלות לקוח":       { bg:"rgba(138,171,142,0.15)",color:"#3d7a44", border:"rgba(138,171,142,0.45)"},
};
const DEFAULT_LAYER = { bg:"rgba(54,69,79,0.07)", color:C.chm, border:"rgba(54,69,79,0.18)" };

// ─── Shared utilities ─────────────────────────────────────────────────────────

function buildSpecLine(item) {
  const p = [];
  if (item.caratWeight) p.push(`${parseFloat(item.caratWeight).toFixed(2)} ct`);
  if (item.fancyColorIntensity) {
    p.push([item.fancyColorIntensity, item.fancyColorHue].filter(Boolean).join(" "));
  } else if (item.color) {
    p.push(item.color);
  }
  if (item.clarity) p.push(item.clarity);
  return p.join(" · ");
}

function LayerBadge({ layer }) {
  if (!layer) return null;
  const s = LAYER_STYLES[layer] || DEFAULT_LAYER;
  return (
    <span style={{ display:"inline-block", padding:"1.5px 7px", borderRadius:10, fontSize:9.5, fontFamily:C.dat, fontWeight:700, background:s.bg, color:s.color, border:`1px solid ${s.border}`, whiteSpace:"nowrap", lineHeight:1.8, letterSpacing:"0.03em" }}>
      {layer}
    </span>
  );
}

function DemoBadge() {
  return (
    <span style={{ display:"inline-block", padding:"1px 6px", borderRadius:8, fontSize:8.5, fontFamily:C.dat, fontWeight:700, background:"rgba(197,179,88,0.09)", color:"#9a7820", border:"1px dashed rgba(197,179,88,0.5)", letterSpacing:"0.06em", lineHeight:1.8 }}>
      DEMO
    </span>
  );
}

function StatusDot({ status }) {
  if (!status) return null;
  const color = status === "במלאי" ? "#3d7a44" : status === "נמכר" ? "#b04040" : status === "שמור" ? "#7a6a1a" : C.chl;
  return (
    <span style={{ fontFamily:C.heb, fontSize:10.5, color, whiteSpace:"nowrap" }}>
      ● {status}
    </span>
  );
}

function ImageArea({ item, size }) {
  const img = item.thumbnailUrl || (item.inventoryImages && item.inventoryImages[0]);
  const gradient = PRODUCT_TYPE_GRADIENTS[item.productType] || "linear-gradient(140deg,#f0ede8 0%,#d8d0c0 100%)";
  const icon = PRODUCT_TYPE_ICONS[item.productType] || "💎";
  if (img) {
    return <img src={img} alt={item.name || ""} style={{ width:"100%", height:"100%", objectFit:"cover" }} />;
  }
  return (
    <div style={{ width:"100%", height:"100%", background:gradient, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size * 0.38 }}>
      {icon}
    </div>
  );
}

function Checkbox({ checked, onClick, size = 20 }) {
  return (
    <div
      onClick={onClick}
      style={{ width:size, height:size, borderRadius:5, background:checked?C.gd:"rgba(255,255,255,0.88)", border:`2px solid ${checked?C.gd:"rgba(54,69,79,0.32)"}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.15s", boxShadow:"0 1px 3px rgba(0,0,0,0.12)", flexShrink:0 }}
    >
      {checked && <span style={{ color:"#fff", fontSize:size*0.55, fontWeight:800, lineHeight:1 }}>✓</span>}
    </div>
  );
}

// ─── Card mode ────────────────────────────────────────────────────────────────
function StandardCard({ item, isSelected, onSelect, onOpenDrawer, onAddToBasket }) {
  const ptLabel  = PRODUCT_TYPE_LABELS[item.productType] || item.stoneType || "Item";
  const specLine = buildSpecLine(item);

  return (
    <div
      onClick={() => onOpenDrawer(item)}
      style={{ background:"#fff", borderRadius:10, border:`1.5px solid ${isSelected?C.gd:"rgba(54,69,79,0.1)"}`, boxShadow:isSelected?`0 0 0 3px rgba(197,179,88,0.15), 0 3px 12px rgba(54,69,79,0.1)`:"0 2px 8px rgba(54,69,79,0.07)", overflow:"hidden", cursor:"pointer", transition:"box-shadow 0.15s, border-color 0.15s", display:"flex", flexDirection:"column" }}
      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.boxShadow = "0 5px 18px rgba(54,69,79,0.14)"; }}
      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.boxShadow = "0 2px 8px rgba(54,69,79,0.07)"; }}
    >
      {/* Image */}
      <div style={{ position:"relative", aspectRatio:"4/3", overflow:"hidden" }}>
        <ImageArea item={item} size={80} />
        <div style={{ position:"absolute", top:8, right:8, display:"flex", gap:5 }}>
          {item.isDemo && <DemoBadge />}
        </div>
        <div style={{ position:"absolute", top:8, left:8 }} onClick={(e) => { e.stopPropagation(); onSelect(item); }}>
          <Checkbox checked={isSelected} onClick={() => {}} size={22} />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding:"12px 14px 10px", flex:1, display:"flex", flexDirection:"column", gap:5 }}>
        <div style={{ display:"flex", alignItems:"center", gap:5, flexWrap:"wrap" }}>
          <span style={{ fontFamily:C.dat, fontSize:9.5, fontWeight:700, color:C.chl, letterSpacing:"0.12em", textTransform:"uppercase" }}>
            {ptLabel}
          </span>
          {item.inventoryLayer && <LayerBadge layer={item.inventoryLayer} />}
        </div>

        <div style={{ fontFamily:C.dat, fontSize:13.5, fontWeight:600, color:C.ch, lineHeight:1.3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {item.name || item.sku || ptLabel}
        </div>

        {specLine && (
          <div style={{ fontFamily:C.dat, fontSize:12, color:C.chm }}>
            {specLine}
          </div>
        )}

        {(item.cutForm || item.stoneShape) && (
          <div style={{ fontFamily:C.heb, fontSize:11, color:C.chl }}>
            {[item.cutForm, item.stoneShape].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join(" · ")}
          </div>
        )}

        <div style={{ height:"0.5px", background:"rgba(54,69,79,0.08)", margin:"2px 0" }} />

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontFamily:C.dat, fontSize:11, color:C.chl }}>{item.certLab || ""}</span>
          {item.costUsd != null && (
            <span style={{ fontFamily:C.dat, fontSize:13.5, fontWeight:700, color:C.ch }}>
              ${Number(item.costUsd).toLocaleString("en-US")}
            </span>
          )}
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <StatusDot status={item.inventoryStatus} />
          <button
            onClick={(e) => { e.stopPropagation(); onAddToBasket(item); }}
            style={{ height:27, padding:"0 10px", background:isSelected?C.gd:"transparent", border:`1px solid ${isSelected?C.gd:"rgba(54,69,79,0.2)"}`, borderRadius:5, cursor:"pointer", fontFamily:C.dat, fontSize:11, fontWeight:600, color:isSelected?"#fff":C.chl, transition:"all 0.15s" }}
          >
            {isSelected ? "✓ Added" : "+ Basket"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Grid mode ────────────────────────────────────────────────────────────────
function GridCard({ item, isSelected, onSelect, onOpenDrawer, onAddToBasket }) {
  const specLine = buildSpecLine(item);
  return (
    <div
      onClick={() => onOpenDrawer(item)}
      style={{ background:"#fff", borderRadius:8, border:`1.5px solid ${isSelected?C.gd:"rgba(54,69,79,0.1)"}`, boxShadow:isSelected?`0 0 0 2px rgba(197,179,88,0.2)`:"0 1px 5px rgba(54,69,79,0.06)", overflow:"hidden", cursor:"pointer", transition:"all 0.15s" }}
      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.boxShadow = "0 4px 12px rgba(54,69,79,0.13)"; }}
      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.boxShadow = "0 1px 5px rgba(54,69,79,0.06)"; }}
    >
      <div style={{ position:"relative", aspectRatio:"1/1", overflow:"hidden" }}>
        <ImageArea item={item} size={60} />
        {item.isDemo && <div style={{ position:"absolute", top:4, right:4 }}><DemoBadge /></div>}
        <div style={{ position:"absolute", top:5, left:5 }} onClick={(e) => { e.stopPropagation(); onSelect(item); }}>
          <Checkbox checked={isSelected} onClick={()=>{}} size={18} />
        </div>
      </div>
      <div style={{ padding:"8px 10px" }}>
        <div style={{ fontFamily:C.dat, fontSize:11.5, fontWeight:600, color:C.ch, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:2 }}>
          {item.name || item.sku || PRODUCT_TYPE_LABELS[item.productType] || "Item"}
        </div>
        {specLine && <div style={{ fontFamily:C.dat, fontSize:10.5, color:C.chm, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:4 }}>{specLine}</div>}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontFamily:C.dat, fontSize:10, color:C.chl }}>{item.certLab || ""}</span>
          <button onClick={(e) => { e.stopPropagation(); onAddToBasket(item); }} style={{ height:22, padding:"0 7px", background:isSelected?C.gd:"transparent", border:`1px solid ${isSelected?C.gd:"rgba(54,69,79,0.2)"}`, borderRadius:4, cursor:"pointer", fontSize:10.5, fontWeight:700, color:isSelected?"#fff":C.chl, fontFamily:C.dat, transition:"all 0.12s" }}>
            {isSelected ? "✓" : "+"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── List mode ────────────────────────────────────────────────────────────────
function ListRow({ item, isSelected, onSelect, onOpenDrawer, onAddToBasket }) {
  const specLine = buildSpecLine(item);
  const ptLabel  = PRODUCT_TYPE_LABELS[item.productType] || item.stoneType || "";
  const img      = item.thumbnailUrl || (item.inventoryImages && item.inventoryImages[0]);
  const gradient = PRODUCT_TYPE_GRADIENTS[item.productType] || "linear-gradient(140deg,#f0ede8,#d8d0c0)";
  const icon     = PRODUCT_TYPE_ICONS[item.productType] || "💎";

  return (
    <div
      onClick={() => onOpenDrawer(item)}
      style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:isSelected?"rgba(197,179,88,0.06)":"#fff", borderBottom:"1px solid rgba(54,69,79,0.07)", cursor:"pointer", transition:"background 0.1s" }}
      onMouseEnter={(e)=>{ if (!isSelected) e.currentTarget.style.background="rgba(54,69,79,0.025)"; }}
      onMouseLeave={(e)=>{ e.currentTarget.style.background=isSelected?"rgba(197,179,88,0.06)":"#fff"; }}
    >
      <div onClick={(e)=>{ e.stopPropagation(); onSelect(item); }}><Checkbox checked={isSelected} onClick={()=>{}} size={18} /></div>
      {img
        ? <img src={img} alt="" style={{ width:40, height:40, objectFit:"cover", borderRadius:5, border:"1px solid rgba(54,69,79,0.1)", flexShrink:0 }} />
        : <div style={{ width:40, height:40, background:gradient, borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{icon}</div>
      }
      <div style={{ flexShrink:0, minWidth:100 }}>
        <div style={{ fontFamily:C.dat, fontSize:10, fontWeight:700, color:C.chl, letterSpacing:"0.09em", textTransform:"uppercase" }}>{ptLabel}</div>
        {item.sku && <div style={{ fontFamily:"'Courier New',monospace", fontSize:9.5, color:C.chx, marginTop:1 }}>{item.sku}</div>}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:C.dat, fontSize:13, fontWeight:600, color:C.ch, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {item.name || ptLabel}
        </div>
        <div style={{ fontFamily:C.dat, fontSize:11, color:C.chm, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginTop:2 }}>
          {[specLine, item.cutForm].filter(Boolean).join(" · ")}
        </div>
      </div>
      <div style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3 }}>
        {item.inventoryLayer && <LayerBadge layer={item.inventoryLayer} />}
        <StatusDot status={item.inventoryStatus} />
      </div>
      <div style={{ flexShrink:0, textAlign:"right", minWidth:65 }}>
        {item.certLab && <div style={{ fontFamily:C.dat, fontSize:10, color:C.chl, marginBottom:2 }}>{item.certLab}</div>}
        {item.costUsd != null && <div style={{ fontFamily:C.dat, fontSize:13, fontWeight:700, color:C.ch }}>${Number(item.costUsd).toLocaleString()}</div>}
      </div>
      <button onClick={(e)=>{ e.stopPropagation(); onAddToBasket(item); }} style={{ flexShrink:0, height:30, padding:"0 11px", background:isSelected?C.gd:"transparent", border:`1px solid ${isSelected?C.gd:"rgba(54,69,79,0.2)"}`, borderRadius:6, cursor:"pointer", fontFamily:C.dat, fontSize:11, fontWeight:600, color:isSelected?"#fff":C.chl, transition:"all 0.15s" }}>
        {isSelected ? "✓" : "+ Basket"}
      </button>
    </div>
  );
}

// ─── Compact mode ─────────────────────────────────────────────────────────────
function CompactRow({ item, isSelected, onSelect, onOpenDrawer, onAddToBasket }) {
  const specLine = buildSpecLine(item);
  return (
    <div
      onClick={() => onOpenDrawer(item)}
      style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 12px", background:isSelected?"rgba(197,179,88,0.06)":"transparent", borderBottom:"1px solid rgba(54,69,79,0.055)", cursor:"pointer", transition:"background 0.1s" }}
      onMouseEnter={(e)=>{ if (!isSelected) e.currentTarget.style.background="rgba(54,69,79,0.02)"; }}
      onMouseLeave={(e)=>{ e.currentTarget.style.background=isSelected?"rgba(197,179,88,0.06)":"transparent"; }}
    >
      <div onClick={(e)=>{ e.stopPropagation(); onSelect(item); }}><Checkbox checked={isSelected} onClick={()=>{}} size={14} /></div>
      <div style={{ fontFamily:"'Courier New',monospace", fontSize:10, color:C.chm, flexShrink:0, minWidth:85, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.sku || "—"}</div>
      <div style={{ flex:1, fontFamily:C.dat, fontSize:12, color:C.ch, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
        {item.name || PRODUCT_TYPE_LABELS[item.productType] || "Item"}
      </div>
      <div style={{ fontFamily:C.dat, fontSize:11.5, color:C.chm, flexShrink:0, whiteSpace:"nowrap" }}>{specLine}</div>
      <StatusDot status={item.inventoryStatus} />
      {item.costUsd != null && <div style={{ fontFamily:C.dat, fontSize:12, fontWeight:700, color:C.ch, flexShrink:0, minWidth:55, textAlign:"right" }}>${Number(item.costUsd).toLocaleString()}</div>}
      <button onClick={(e)=>{ e.stopPropagation(); onAddToBasket(item); }} style={{ flexShrink:0, height:22, padding:"0 7px", background:isSelected?C.gd:"transparent", border:`1px solid ${isSelected?C.gd:"rgba(54,69,79,0.18)"}`, borderRadius:4, cursor:"pointer", fontSize:10, fontWeight:700, color:isSelected?"#fff":C.chl, fontFamily:C.dat, transition:"all 0.12s" }}>
        {isSelected ? "✓" : "+"}
      </button>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function InventoryCard({ item, mode = "card", isSelected, onSelect, onOpenDrawer, onAddToBasket, onUseInCalculator, onCreateCertificate }) {
  const p = { item, isSelected, onSelect, onOpenDrawer, onAddToBasket, onUseInCalculator, onCreateCertificate };
  if (mode === "compact") return <CompactRow {...p} />;
  if (mode === "list")    return <ListRow    {...p} />;
  if (mode === "grid")    return <GridCard   {...p} />;
  return <StandardCard {...p} />;
}
