/**
 * components/inventory/InventoryCard.jsx  —  v5.4
 *
 * Changes from M5.3.2:
 *
 * Task 2 — Work Tray terminology:
 *   "Add to Basket" / "Basket" → "הוסף למגש" / "במגש"
 *
 * Task 3 — Visual upgrade:
 *   + Card mode: larger gradient area (5:4 aspect ratio instead of 4:3)
 *   + Better placeholder gradients — more differentiated per product type
 *   + Clearer layer badge placement (bottom-left of image on cards)
 *   + Spec line now shows shape/cut form alongside carat/color/clarity
 *   + Cost display: more prominent, bottom-right of card
 *   + Selected state: gold ring shadow around entire card
 *
 * Task 11 — Mobile:
 *   + Card min-width reduced to support 2-column on small screens
 *   + List/compact rows: no horizontal overflow on narrow viewports
 *   + Quick-action buttons: min-width:0 so they never cause overflow
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

// v5.4: More differentiated gradient backgrounds
export const PRODUCT_TYPE_GRADIENTS = {
  natural_diamond:     "linear-gradient(145deg,#ddeef8 0%,#c0d9f2 60%,#b0cce8 100%)",
  lab_grown_diamond:   "linear-gradient(145deg,#edf2ff 0%,#c9d8f8 60%,#b8c9f5 100%)",
  fancy_color_diamond: "linear-gradient(145deg,#fff9e0 0%,#f0df80 60%,#e8cf60 100%)",
  colored_gemstone:    "linear-gradient(145deg,#e0f5e4 0%,#a8d8b0 60%,#90c898 100%)",
  stone_pair_set:      "linear-gradient(145deg,#f5eaff 0%,#d8a8f0 60%,#c890e8 100%)",
  stone_parcel:        "linear-gradient(145deg,#f5f0e8 0%,#d8ccb4 60%,#c4b898 100%)",
  jewelry_part:        "linear-gradient(145deg,#f8f5f0 0%,#e0d8c4 60%,#d0c8b0 100%)",
  finished_jewelry:    "linear-gradient(145deg,#fef8e0 0%,#f4d878 60%,#e8c850 100%)",
};

const LAYER_STYLES = {
  "Physical Stock":         { bg:"rgba(74,92,104,0.12)", color:"#3a5060", border:"rgba(74,92,104,0.28)" },
  "מלאי פיזי":              { bg:"rgba(74,92,104,0.12)", color:"#3a5060", border:"rgba(74,92,104,0.28)" },
  "Virtual Supplier Stock": { bg:"rgba(197,179,88,0.14)", color:"#7a6a1a", border:"rgba(197,179,88,0.4)" },
  "מלאי ספק וירטואלי":      { bg:"rgba(197,179,88,0.14)", color:"#7a6a1a", border:"rgba(197,179,88,0.4)" },
  "Client-Owned Item":      { bg:"rgba(138,171,142,0.17)", color:"#2e6636", border:"rgba(138,171,142,0.5)" },
  "פריט בבעלות לקוח":       { bg:"rgba(138,171,142,0.17)", color:"#2e6636", border:"rgba(138,171,142,0.5)" },
};
const DFL = { bg:"rgba(54,69,79,0.07)", color:C.chm, border:"rgba(54,69,79,0.18)" };

// ─── Utilities ────────────────────────────────────────────────────────────────
function buildSpecLine(item) {
  const p = [];
  if (item.caratWeight) p.push(`${parseFloat(item.caratWeight).toFixed(2)} ct`);
  if (item.fancyColorIntensity) {
    p.push([item.fancyColorIntensity, item.fancyColorHue].filter(Boolean).join(" "));
  } else if (item.color) {
    p.push(item.color);
  }
  if (item.clarity) p.push(item.clarity);
  if (item.cutForm) p.push(item.cutForm);
  return p.join(" · ");
}

function LayerBadge({ layer }) {
  if (!layer) return null;
  const s = LAYER_STYLES[layer] || DFL;
  return (
    <span style={{ display:"inline-block", padding:"2px 7px", borderRadius:10, fontSize:9.5, fontFamily:C.dat, fontWeight:700, background:s.bg, color:s.color, border:`1px solid ${s.border}`, whiteSpace:"nowrap", lineHeight:1.8, letterSpacing:"0.03em" }}>
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
  const color = status === "במלאי" ? "#3d7a44" : status === "נמכר" ? "#b04040" : C.chl;
  return <span style={{ fontFamily:C.heb, fontSize:10.5, color, whiteSpace:"nowrap" }}>● {status}</span>;
}

function ImageArea({ item, size }) {
  const img = item.thumbnailUrl || (item.inventoryImages && item.inventoryImages[0]);
  const gradient = PRODUCT_TYPE_GRADIENTS[item.productType] || "linear-gradient(145deg,#f0ede8,#d0c8b0)";
  const icon = PRODUCT_TYPE_ICONS[item.productType] || "💎";
  if (img) {
    return <img src={img} alt={item.name || ""} style={{ width:"100%", height:"100%", objectFit:"cover" }} />;
  }
  return (
    <div style={{ width:"100%", height:"100%", background:gradient, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.38 }}>
      {icon}
    </div>
  );
}

function Checkbox({ checked, onClick, size = 20 }) {
  return (
    <div
      onClick={onClick}
      style={{ width:size, height:size, borderRadius:5, background:checked?C.gd:"rgba(255,255,255,0.9)", border:`2px solid ${checked?C.gd:"rgba(54,69,79,0.32)"}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.14s", boxShadow:"0 1px 3px rgba(0,0,0,0.12)", flexShrink:0 }}
    >
      {checked && <span style={{ color:"#fff", fontSize:size*0.55, fontWeight:800, lineHeight:1 }}>✓</span>}
    </div>
  );
}

// ─── Standard Card (card mode) ────────────────────────────────────────────────
function StandardCard({ item, isSelected, onSelect, onOpenDrawer, onAddToBasket }) {
  const ptLabel  = PRODUCT_TYPE_LABELS[item.productType] || item.stoneType || "Item";
  const specLine = buildSpecLine(item);

  return (
    <div
      onClick={() => onOpenDrawer(item)}
      style={{
        background:"#fff", borderRadius:10,
        border:`1.5px solid ${isSelected?C.gd:"rgba(54,69,79,0.1)"}`,
        boxShadow: isSelected
          ? `0 0 0 3px rgba(197,179,88,0.2), 0 3px 12px rgba(54,69,79,0.1)`
          : "0 2px 8px rgba(54,69,79,0.07)",
        overflow:"hidden", cursor:"pointer",
        transition:"box-shadow 0.15s, border-color 0.15s",
        display:"flex", flexDirection:"column",
      }}
      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.boxShadow = "0 6px 20px rgba(54,69,79,0.15)"; }}
      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.boxShadow = "0 2px 8px rgba(54,69,79,0.07)"; }}
    >
      {/* Image area — v5.4: 5:4 aspect ratio */}
      <div style={{ position:"relative", aspectRatio:"5/4", overflow:"hidden" }}>
        <ImageArea item={item} size={80} />
        {/* Overlay: demo badge top-right, layer badge bottom-left */}
        {item.isDemo && (
          <div style={{ position:"absolute", top:7, right:7 }}><DemoBadge /></div>
        )}
        {item.inventoryLayer && (
          <div style={{ position:"absolute", bottom:7, left:7 }}>
            <LayerBadge layer={item.inventoryLayer} />
          </div>
        )}
        <div style={{ position:"absolute", top:7, left:7 }} onClick={(e) => { e.stopPropagation(); onSelect(item); }}>
          <Checkbox checked={isSelected} onClick={()=>{}} size={22} />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding:"11px 14px 10px", flex:1, display:"flex", flexDirection:"column", gap:4 }}>
        <div style={{ fontFamily:C.dat, fontSize:9.5, fontWeight:700, color:C.chl, letterSpacing:"0.12em", textTransform:"uppercase" }}>
          {ptLabel}
        </div>

        <div style={{ fontFamily:C.dat, fontSize:13, fontWeight:600, color:C.ch, lineHeight:1.3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {item.name || item.sku || ptLabel}
        </div>

        {specLine && (
          <div style={{ fontFamily:C.dat, fontSize:11.5, color:C.chm, lineHeight:1.4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {specLine}
          </div>
        )}

        <div style={{ height:"0.5px", background:"rgba(54,69,79,0.08)", margin:"3px 0" }} />

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, minWidth:0 }}>
            <StatusDot status={item.inventoryStatus} />
            {item.certLab && <span style={{ fontFamily:C.dat, fontSize:10.5, color:C.chx }}>{item.certLab}</span>}
          </div>
          {item.costUsd != null && (
            <div style={{ fontFamily:C.dat, fontSize:13.5, fontWeight:700, color:C.ch, flexShrink:0 }}>
              ${Number(item.costUsd).toLocaleString("en-US")}
            </div>
          )}
        </div>

        {/* Work Tray basket button (v5.4: renamed from "Basket") */}
        <button
          onClick={(e) => { e.stopPropagation(); onAddToBasket(item); }}
          style={{ height:28, padding:"0 10px", background:isSelected?C.gd:"transparent", border:`1px solid ${isSelected?C.gd:"rgba(54,69,79,0.2)"}`, borderRadius:5, cursor:"pointer", fontFamily:C.heb, fontSize:11, fontWeight:isSelected?700:400, color:isSelected?"#fff":C.chl, transition:"all 0.14s", marginTop:2 }}
        >
          {isSelected ? "✓ במגש עבודה" : "+ הוסף למגש"}
        </button>
      </div>
    </div>
  );
}

// ─── Grid Card ────────────────────────────────────────────────────────────────
function GridCard({ item, isSelected, onSelect, onOpenDrawer, onAddToBasket }) {
  const specLine = buildSpecLine(item);
  return (
    <div
      onClick={() => onOpenDrawer(item)}
      style={{ background:"#fff", borderRadius:8, border:`1.5px solid ${isSelected?C.gd:"rgba(54,69,79,0.1)"}`, boxShadow:isSelected?`0 0 0 2px rgba(197,179,88,0.2)`:"0 1px 5px rgba(54,69,79,0.06)", overflow:"hidden", cursor:"pointer", transition:"all 0.14s" }}
      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.boxShadow = "0 4px 12px rgba(54,69,79,0.14)"; }}
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
          <button onClick={(e) => { e.stopPropagation(); onAddToBasket(item); }} style={{ height:22, padding:"0 7px", background:isSelected?C.gd:"transparent", border:`1px solid ${isSelected?C.gd:"rgba(54,69,79,0.2)"}`, borderRadius:4, cursor:"pointer", fontSize:10.5, fontWeight:700, color:isSelected?"#fff":C.chl, fontFamily:C.heb, transition:"all 0.12s" }}>
            {isSelected ? "✓" : "+"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── List Row ─────────────────────────────────────────────────────────────────
function ListRow({ item, isSelected, onSelect, onOpenDrawer, onAddToBasket, onUseInCalculator, onCreateCertificate }) {
  const specLine = buildSpecLine(item);
  const ptLabel  = PRODUCT_TYPE_LABELS[item.productType] || item.stoneType || "";
  const img      = item.thumbnailUrl || (item.inventoryImages && item.inventoryImages[0]);
  const gradient = PRODUCT_TYPE_GRADIENTS[item.productType] || "linear-gradient(145deg,#f0ede8,#d0c8b0)";
  const icon     = PRODUCT_TYPE_ICONS[item.productType] || "💎";

  return (
    <div
      onClick={() => onOpenDrawer(item)}
      style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:isSelected?"rgba(197,179,88,0.06)":"#fff", borderBottom:"1px solid rgba(54,69,79,0.07)", cursor:"pointer", transition:"background 0.1s", minWidth:0 }}
      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "rgba(54,69,79,0.025)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = isSelected?"rgba(197,179,88,0.06)":"#fff"; }}
    >
      <div onClick={(e) => { e.stopPropagation(); onSelect(item); }}><Checkbox checked={isSelected} onClick={()=>{}} size={18} /></div>
      {img
        ? <img src={img} alt="" style={{ width:38, height:38, objectFit:"cover", borderRadius:5, border:"1px solid rgba(54,69,79,0.1)", flexShrink:0 }} />
        : <div style={{ width:38, height:38, background:gradient, borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{icon}</div>
      }
      <div style={{ flexShrink:0, minWidth:80 }}>
        <div style={{ fontFamily:C.dat, fontSize:10, fontWeight:700, color:C.chl, letterSpacing:"0.09em", textTransform:"uppercase" }}>{ptLabel}</div>
        {item.sku && <div style={{ fontFamily:"'Courier New',monospace", fontSize:9.5, color:C.chx, marginTop:1 }}>{item.sku}</div>}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:C.dat, fontSize:13, fontWeight:600, color:C.ch, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {item.name || ptLabel}
        </div>
        <div style={{ fontFamily:C.dat, fontSize:11, color:C.chm, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginTop:1 }}>
          {specLine}
        </div>
      </div>
      <div style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3 }}>
        {item.inventoryLayer && <LayerBadge layer={item.inventoryLayer} />}
        <StatusDot status={item.inventoryStatus} />
      </div>
      <div style={{ flexShrink:0, textAlign:"right", minWidth:56 }}>
        {item.certLab && <div style={{ fontFamily:C.dat, fontSize:10, color:C.chl, marginBottom:2 }}>{item.certLab}</div>}
        {item.costUsd != null && <div style={{ fontFamily:C.dat, fontSize:13, fontWeight:700, color:C.ch }}>${Number(item.costUsd).toLocaleString()}</div>}
      </div>
      {/* Work Tray basket button */}
      <button onClick={(e)=>{ e.stopPropagation(); onAddToBasket(item); }} style={{ flexShrink:0, height:30, padding:"0 10px", background:isSelected?C.gd:"transparent", border:`1px solid ${isSelected?C.gd:"rgba(54,69,79,0.2)"}`, borderRadius:6, cursor:"pointer", fontFamily:C.heb, fontSize:11, fontWeight:isSelected?700:400, color:isSelected?"#fff":C.chl, transition:"all 0.14s" }}>
        {isSelected ? "✓" : "+ מגש"}
      </button>
      {onUseInCalculator && (
        <button onClick={(e)=>{ e.stopPropagation(); onUseInCalculator(item); }} title="Use in Calculator" style={{ flexShrink:0, height:30, width:30, padding:0, background:"transparent", border:"1px solid rgba(54,69,79,0.14)", borderRadius:6, cursor:"pointer", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center" }} onMouseEnter={(e)=>{ e.currentTarget.style.borderColor=C.gd; }} onMouseLeave={(e)=>{ e.currentTarget.style.borderColor="rgba(54,69,79,0.14)"; }}>
          🔢
        </button>
      )}
      {onCreateCertificate && (
        <button onClick={(e)=>{ e.stopPropagation(); onCreateCertificate(item); }} title="Create Certificate" style={{ flexShrink:0, height:30, width:30, padding:0, background:"transparent", border:"1px solid rgba(54,69,79,0.14)", borderRadius:6, cursor:"pointer", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center" }} onMouseEnter={(e)=>{ e.currentTarget.style.borderColor=C.sg; }} onMouseLeave={(e)=>{ e.currentTarget.style.borderColor="rgba(54,69,79,0.14)"; }}>
          📋
        </button>
      )}
    </div>
  );
}

// ─── Compact Row ──────────────────────────────────────────────────────────────
function CompactRow({ item, isSelected, onSelect, onOpenDrawer, onAddToBasket, onUseInCalculator, onCreateCertificate }) {
  const specLine = buildSpecLine(item);
  return (
    <div
      onClick={() => onOpenDrawer(item)}
      style={{ display:"flex", alignItems:"center", gap:7, padding:"5px 12px", background:isSelected?"rgba(197,179,88,0.06)":"transparent", borderBottom:"1px solid rgba(54,69,79,0.055)", cursor:"pointer", transition:"background 0.1s", minWidth:0 }}
      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "rgba(54,69,79,0.02)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = isSelected?"rgba(197,179,88,0.06)":"transparent"; }}
    >
      <div onClick={(e)=>{ e.stopPropagation(); onSelect(item); }}><Checkbox checked={isSelected} onClick={()=>{}} size={14} /></div>
      <div style={{ fontFamily:"'Courier New',monospace", fontSize:10, color:C.chm, flexShrink:0, minWidth:75, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.sku || "—"}</div>
      <div style={{ flex:1, fontFamily:C.dat, fontSize:12, color:C.ch, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
        {item.name || PRODUCT_TYPE_LABELS[item.productType] || "Item"}
      </div>
      <div style={{ fontFamily:C.dat, fontSize:11, color:C.chm, flexShrink:0, whiteSpace:"nowrap", overflow:"hidden", maxWidth:120, textOverflow:"ellipsis" }}>{specLine}</div>
      <StatusDot status={item.inventoryStatus} />
      {item.costUsd != null && <div style={{ fontFamily:C.dat, fontSize:12, fontWeight:700, color:C.ch, flexShrink:0, minWidth:50, textAlign:"right" }}>${Number(item.costUsd).toLocaleString()}</div>}
      <button onClick={(e)=>{ e.stopPropagation(); onAddToBasket(item); }} style={{ flexShrink:0, height:22, padding:"0 6px", background:isSelected?C.gd:"transparent", border:`1px solid ${isSelected?C.gd:"rgba(54,69,79,0.18)"}`, borderRadius:4, cursor:"pointer", fontSize:10, fontWeight:700, color:isSelected?"#fff":C.chl, fontFamily:C.heb, transition:"all 0.12s", whiteSpace:"nowrap" }}>
        {isSelected ? "✓" : "+"}
      </button>
      {onUseInCalculator && (
        <button onClick={(e)=>{ e.stopPropagation(); onUseInCalculator(item); }} title="Use in Calculator" style={{ flexShrink:0, height:22, width:22, padding:0, background:"transparent", border:"1px solid rgba(54,69,79,0.12)", borderRadius:4, cursor:"pointer", fontSize:11, display:"flex", alignItems:"center", justifyContent:"center" }}>🔢</button>
      )}
      {onCreateCertificate && (
        <button onClick={(e)=>{ e.stopPropagation(); onCreateCertificate(item); }} title="Create Certificate" style={{ flexShrink:0, height:22, width:22, padding:0, background:"transparent", border:"1px solid rgba(54,69,79,0.12)", borderRadius:4, cursor:"pointer", fontSize:11, display:"flex", alignItems:"center", justifyContent:"center" }}>📋</button>
      )}
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
