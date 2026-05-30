/**
 * components/inventory/InventoryCard.jsx  —  v5.5
 *
 * Substantive visual upgrade over v5.4:
 *
 *  • Card mode rebuilt with stronger hierarchy:
 *      - Larger media area (4:3) with per-product-type gradient placeholder
 *        that is clearly NOT a real photo (icon + subtle "אין תמונה" tag).
 *      - Top overlay row: selection checkbox (left) + layer / demo badges (right).
 *      - Price chip overlaid on the media bottom-right for instant scanning.
 *      - Content: product-type eyebrow, title, spec line, cert/report line.
 *      - A full quick-action row ALWAYS visible: פרטים · מגש · מחשבון · תעודה.
 *  • Grid mode: compact square with the same media + a two-action footer.
 *  • List / Compact rows: unchanged behaviour, retain all quick actions,
 *    no horizontal overflow (min-width:0 throughout).
 *  • Mobile-first: card min-width 160px so two columns fit ~360px screens;
 *    action buttons use flexible widths and never overflow.
 *
 * Terminology: Work Tray only. UI shows "מגש" / "במגש". No "Basket".
 * Internal prop name onAddToBasket is kept for wiring compatibility.
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
  "Physical Stock":         { bg:"rgba(74,92,104,0.14)", color:"#3a5060", border:"rgba(74,92,104,0.3)" },
  "מלאי פיזי":              { bg:"rgba(74,92,104,0.14)", color:"#3a5060", border:"rgba(74,92,104,0.3)" },
  "Virtual Supplier Stock": { bg:"rgba(197,179,88,0.16)", color:"#7a6a1a", border:"rgba(197,179,88,0.45)" },
  "מלאי ספק וירטואלי":      { bg:"rgba(197,179,88,0.16)", color:"#7a6a1a", border:"rgba(197,179,88,0.45)" },
  "Client-Owned Item":      { bg:"rgba(138,171,142,0.2)", color:"#2e6636", border:"rgba(138,171,142,0.55)" },
  "פריט בבעלות לקוח":       { bg:"rgba(138,171,142,0.2)", color:"#2e6636", border:"rgba(138,171,142,0.55)" },
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

function hasMedia(item) {
  return Boolean(item.thumbnailUrl || (item.inventoryImages && item.inventoryImages[0]) || item.imageUrl);
}
function mediaUrl(item) {
  return item.thumbnailUrl || (item.inventoryImages && item.inventoryImages[0]) || item.imageUrl || null;
}

function LayerBadge({ layer, small }) {
  if (!layer) return null;
  const s = LAYER_STYLES[layer] || DFL;
  return (
    <span style={{ display:"inline-block", padding: small ? "1px 6px" : "2px 8px", borderRadius:10, fontSize: small ? 9 : 9.5, fontFamily:C.dat, fontWeight:700, background:s.bg, color:s.color, border:`1px solid ${s.border}`, whiteSpace:"nowrap", lineHeight:1.8, letterSpacing:"0.03em", backdropFilter:"blur(2px)" }}>
      {layer}
    </span>
  );
}

function DemoBadge() {
  return (
    <span style={{ display:"inline-block", padding:"1px 6px", borderRadius:8, fontSize:8.5, fontFamily:C.dat, fontWeight:700, background:"rgba(255,255,255,0.85)", color:"#9a7820", border:"1px dashed rgba(197,179,88,0.6)", letterSpacing:"0.06em", lineHeight:1.8 }}>
      DEMO
    </span>
  );
}

function StatusDot({ status }) {
  if (!status) return null;
  const color = status === "במלאי" ? "#3d7a44" : status === "נמכר" ? "#b04040" : C.chl;
  return <span style={{ fontFamily:C.heb, fontSize:10.5, color, whiteSpace:"nowrap" }}>● {status}</span>;
}

function MediaArea({ item, iconSize }) {
  const img = mediaUrl(item);
  const gradient = PRODUCT_TYPE_GRADIENTS[item.productType] || "linear-gradient(145deg,#f0ede8,#d0c8b0)";
  const icon = PRODUCT_TYPE_ICONS[item.productType] || "💎";
  if (img) {
    return <img src={img} alt={item.name || ""} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />;
  }
  // Placeholder — visibly NOT a real photo.
  return (
    <div style={{ width:"100%", height:"100%", background:gradient, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4 }}>
      <span style={{ fontSize:iconSize, lineHeight:1, opacity:0.85 }}>{icon}</span>
      <span style={{ fontFamily:C.dat, fontSize:8.5, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(54,69,79,0.45)", fontWeight:700 }}>no image</span>
    </div>
  );
}

function MediaChips({ item }) {
  // Small indicators for video / certificate availability on the media area.
  const chips = [];
  if (item.videoUrl) chips.push("▶");
  if (item.certPdfUrl || item.certImageUrl) chips.push("📄");
  if (chips.length === 0) return null;
  return (
    <div style={{ position:"absolute", bottom:7, left:7, display:"flex", gap:4 }}>
      {chips.map((c,i) => (
        <span key={i} style={{ width:20, height:20, borderRadius:5, background:"rgba(255,255,255,0.85)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, border:"1px solid rgba(54,69,79,0.12)" }}>{c}</span>
      ))}
    </div>
  );
}

function Checkbox({ checked, onClick, size = 20 }) {
  return (
    <div
      onClick={onClick}
      style={{ width:size, height:size, borderRadius:5, background:checked?C.gd:"rgba(255,255,255,0.92)", border:`2px solid ${checked?C.gd:"rgba(54,69,79,0.32)"}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.14s", boxShadow:"0 1px 3px rgba(0,0,0,0.12)", flexShrink:0 }}
    >
      {checked && <span style={{ color:"#fff", fontSize:size*0.55, fontWeight:800, lineHeight:1 }}>✓</span>}
    </div>
  );
}

// ─── Quick-action button (card footer) ────────────────────────────────────────
function QA({ label, title, onClick, tone }) {
  const tones = {
    neutral: { bg:"transparent", bd:"rgba(54,69,79,0.18)", fg:C.chm, hover:C.gd },
    tray:    { bg:"transparent", bd:"rgba(54,69,79,0.2)",  fg:C.chl, hover:C.gd },
    traySel: { bg:C.gd,          bd:C.gd,                  fg:"#fff", hover:C.gd },
    calc:    { bg:"rgba(197,179,88,0.06)", bd:"rgba(197,179,88,0.5)", fg:"#7a6a1a", hover:C.gd },
    cert:    { bg:"rgba(138,171,142,0.07)", bd:"rgba(138,171,142,0.55)", fg:"#3d7a44", hover:"#6a8c6e" },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={title}
      style={{ flex:"1 1 0", minWidth:0, height:32, padding:"0 6px", background:t.bg, border:`1px solid ${t.bd}`, borderRadius:7, cursor:"pointer", fontFamily:C.heb, fontSize:11, fontWeight:600, color:t.fg, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", transition:"border-color 0.13s, background 0.13s" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.hover; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.bd; }}
    >
      {label}
    </button>
  );
}

// ─── Standard Card (card mode) ────────────────────────────────────────────────
function StandardCard({ item, isSelected, onSelect, onOpenDrawer, onAddToBasket, onUseInCalculator, onCreateCertificate }) {
  const ptLabel  = PRODUCT_TYPE_LABELS[item.productType] || item.stoneType || "Item";
  const specLine = buildSpecLine(item);
  const certLine = [item.certLab, item.certNumber || item.laserInscription].filter(Boolean).join(" · ");

  return (
    <div
      onClick={() => onOpenDrawer(item)}
      style={{
        background:"#fff", borderRadius:12,
        border:`1.5px solid ${isSelected?C.gd:"rgba(54,69,79,0.1)"}`,
        boxShadow: isSelected
          ? "0 0 0 3px rgba(197,179,88,0.22), 0 4px 14px rgba(54,69,79,0.12)"
          : "0 2px 9px rgba(54,69,79,0.07)",
        overflow:"hidden", cursor:"pointer",
        transition:"box-shadow 0.15s, border-color 0.15s, transform 0.15s",
        display:"flex", flexDirection:"column",
      }}
      onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.boxShadow = "0 8px 22px rgba(54,69,79,0.16)"; e.currentTarget.style.transform = "translateY(-2px)"; } }}
      onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.boxShadow = "0 2px 9px rgba(54,69,79,0.07)"; e.currentTarget.style.transform = "none"; } }}
    >
      {/* Media area — 4:3 */}
      <div style={{ position:"relative", aspectRatio:"4/3", overflow:"hidden", background:"rgba(54,69,79,0.04)" }}>
        <MediaArea item={item} iconSize={52} />

        {/* Top-left checkbox */}
        <div style={{ position:"absolute", top:8, left:8 }} onClick={(e) => { e.stopPropagation(); onSelect(item); }}>
          <Checkbox checked={isSelected} onClick={()=>{}} size={22} />
        </div>

        {/* Top-right badges */}
        <div style={{ position:"absolute", top:8, right:8, display:"flex", flexDirection:"column", gap:4, alignItems:"flex-end" }}>
          {item.isDemo && <DemoBadge />}
          {item.inventoryLayer && <LayerBadge layer={item.inventoryLayer} />}
        </div>

        {/* Media chips (video / cert) bottom-left */}
        <MediaChips item={item} />

        {/* Price chip bottom-right */}
        {item.costUsd != null && (
          <div style={{ position:"absolute", bottom:7, right:7, background:"rgba(54,69,79,0.92)", color:"#fff", borderRadius:7, padding:"3px 9px", fontFamily:C.dat, fontSize:12.5, fontWeight:700, letterSpacing:"0.02em" }}>
            ${Number(item.costUsd).toLocaleString("en-US")}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding:"10px 12px 11px", flex:1, display:"flex", flexDirection:"column", gap:3 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
          <span style={{ fontFamily:C.dat, fontSize:9.5, fontWeight:700, color:C.chl, letterSpacing:"0.12em", textTransform:"uppercase", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {ptLabel}
          </span>
          <StatusDot status={item.inventoryStatus} />
        </div>

        <div style={{ fontFamily:C.dat, fontSize:13.5, fontWeight:700, color:C.ch, lineHeight:1.3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {item.name || item.sku || ptLabel}
        </div>

        {specLine && (
          <div style={{ fontFamily:C.dat, fontSize:11.5, color:C.chm, lineHeight:1.4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {specLine}
          </div>
        )}

        {certLine && (
          <div style={{ fontFamily:"'Courier New',monospace", fontSize:10, color:C.chx, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {certLine}
          </div>
        )}

        <div style={{ height:"0.5px", background:"rgba(54,69,79,0.08)", margin:"5px 0 2px" }} />

        {/* Quick actions — always visible */}
        <div style={{ display:"flex", gap:5, flexWrap:"nowrap" }}>
          <QA label="פרטים"  title="פתח פרטים"        tone="neutral" onClick={() => onOpenDrawer(item)} />
          <QA label={isSelected ? "✓ מגש" : "+ מגש"} title="הוסף למגש עבודה" tone={isSelected ? "traySel" : "tray"} onClick={() => onAddToBasket(item)} />
          {onUseInCalculator  && <QA label="מחשבון" title="השתמש במחשבון" tone="calc" onClick={() => onUseInCalculator(item)} />}
          {onCreateCertificate && <QA label="תעודה"  title="צור תעודה"     tone="cert" onClick={() => onCreateCertificate(item)} />}
        </div>
      </div>
    </div>
  );
}

// ─── Grid Card ────────────────────────────────────────────────────────────────
function GridCard({ item, isSelected, onSelect, onOpenDrawer, onAddToBasket, onUseInCalculator, onCreateCertificate }) {
  const specLine = buildSpecLine(item);
  return (
    <div
      onClick={() => onOpenDrawer(item)}
      style={{ background:"#fff", borderRadius:9, border:`1.5px solid ${isSelected?C.gd:"rgba(54,69,79,0.1)"}`, boxShadow:isSelected?"0 0 0 2px rgba(197,179,88,0.22)":"0 1px 5px rgba(54,69,79,0.06)", overflow:"hidden", cursor:"pointer", transition:"all 0.14s" }}
      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.boxShadow = "0 4px 12px rgba(54,69,79,0.14)"; }}
      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.boxShadow = "0 1px 5px rgba(54,69,79,0.06)"; }}
    >
      <div style={{ position:"relative", aspectRatio:"1/1", overflow:"hidden", background:"rgba(54,69,79,0.04)" }}>
        <MediaArea item={item} iconSize={40} />
        {item.isDemo && <div style={{ position:"absolute", top:5, right:5 }}><DemoBadge /></div>}
        <div style={{ position:"absolute", top:5, left:5 }} onClick={(e) => { e.stopPropagation(); onSelect(item); }}>
          <Checkbox checked={isSelected} onClick={()=>{}} size={18} />
        </div>
        {item.costUsd != null && (
          <div style={{ position:"absolute", bottom:5, right:5, background:"rgba(54,69,79,0.9)", color:"#fff", borderRadius:6, padding:"2px 7px", fontFamily:C.dat, fontSize:11, fontWeight:700 }}>
            ${Number(item.costUsd).toLocaleString("en-US")}
          </div>
        )}
      </div>
      <div style={{ padding:"8px 10px" }}>
        <div style={{ fontFamily:C.dat, fontSize:11.5, fontWeight:700, color:C.ch, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:2 }}>
          {item.name || item.sku || PRODUCT_TYPE_LABELS[item.productType] || "Item"}
        </div>
        {specLine && <div style={{ fontFamily:C.dat, fontSize:10.5, color:C.chm, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:6 }}>{specLine}</div>}
        <div style={{ display:"flex", gap:5 }}>
          <QA label={isSelected ? "✓ מגש" : "+ מגש"} title="הוסף למגש עבודה" tone={isSelected ? "traySel" : "tray"} onClick={() => onAddToBasket(item)} />
          {onUseInCalculator && <QA label="מחשבון" title="השתמש במחשבון" tone="calc" onClick={() => onUseInCalculator(item)} />}
        </div>
      </div>
    </div>
  );
}

// ─── List Row ─────────────────────────────────────────────────────────────────
function ListRow({ item, isSelected, onSelect, onOpenDrawer, onAddToBasket, onUseInCalculator, onCreateCertificate }) {
  const specLine = buildSpecLine(item);
  const ptLabel  = PRODUCT_TYPE_LABELS[item.productType] || item.stoneType || "";
  const img      = mediaUrl(item);
  const gradient = PRODUCT_TYPE_GRADIENTS[item.productType] || "linear-gradient(145deg,#f0ede8,#d0c8b0)";
  const icon     = PRODUCT_TYPE_ICONS[item.productType] || "💎";

  return (
    <div
      onClick={() => onOpenDrawer(item)}
      style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:isSelected?"rgba(197,179,88,0.06)":"#fff", borderBottom:"1px solid rgba(54,69,79,0.07)", cursor:"pointer", transition:"background 0.1s", minWidth:0 }}
      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "rgba(54,69,79,0.025)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = isSelected?"rgba(197,179,88,0.06)":"#fff"; }}
    >
      <div onClick={(e) => { e.stopPropagation(); onSelect(item); }}><Checkbox checked={isSelected} onClick={()=>{}} size={18} /></div>
      {img
        ? <img src={img} alt="" style={{ width:40, height:40, objectFit:"cover", borderRadius:6, border:"1px solid rgba(54,69,79,0.1)", flexShrink:0 }} />
        : <div style={{ width:40, height:40, background:gradient, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{icon}</div>
      }
      <div style={{ flexShrink:0, minWidth:78 }}>
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
        {item.inventoryLayer && <LayerBadge layer={item.inventoryLayer} small />}
        <StatusDot status={item.inventoryStatus} />
      </div>
      <div style={{ flexShrink:0, textAlign:"right", minWidth:56 }}>
        {item.certLab && <div style={{ fontFamily:C.dat, fontSize:10, color:C.chl, marginBottom:2 }}>{item.certLab}</div>}
        {item.costUsd != null && <div style={{ fontFamily:C.dat, fontSize:13, fontWeight:700, color:C.ch }}>${Number(item.costUsd).toLocaleString()}</div>}
      </div>
      <button onClick={(e)=>{ e.stopPropagation(); onAddToBasket(item); }} title="הוסף למגש עבודה" style={{ flexShrink:0, height:30, padding:"0 10px", background:isSelected?C.gd:"transparent", border:`1px solid ${isSelected?C.gd:"rgba(54,69,79,0.2)"}`, borderRadius:6, cursor:"pointer", fontFamily:C.heb, fontSize:11, fontWeight:isSelected?700:400, color:isSelected?"#fff":C.chl, transition:"all 0.14s", whiteSpace:"nowrap" }}>
        {isSelected ? "✓ מגש" : "+ מגש"}
      </button>
      {onUseInCalculator && (
        <button onClick={(e)=>{ e.stopPropagation(); onUseInCalculator(item); }} title="השתמש במחשבון" style={{ flexShrink:0, height:30, width:30, padding:0, background:"transparent", border:"1px solid rgba(54,69,79,0.14)", borderRadius:6, cursor:"pointer", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center" }} onMouseEnter={(e)=>{ e.currentTarget.style.borderColor=C.gd; }} onMouseLeave={(e)=>{ e.currentTarget.style.borderColor="rgba(54,69,79,0.14)"; }}>
          🔢
        </button>
      )}
      {onCreateCertificate && (
        <button onClick={(e)=>{ e.stopPropagation(); onCreateCertificate(item); }} title="צור תעודה" style={{ flexShrink:0, height:30, width:30, padding:0, background:"transparent", border:"1px solid rgba(54,69,79,0.14)", borderRadius:6, cursor:"pointer", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center" }} onMouseEnter={(e)=>{ e.currentTarget.style.borderColor=C.sg; }} onMouseLeave={(e)=>{ e.currentTarget.style.borderColor="rgba(54,69,79,0.14)"; }}>
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
      style={{ display:"flex", alignItems:"center", gap:7, padding:"6px 12px", background:isSelected?"rgba(197,179,88,0.06)":"transparent", borderBottom:"1px solid rgba(54,69,79,0.055)", cursor:"pointer", transition:"background 0.1s", minWidth:0 }}
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
      <button onClick={(e)=>{ e.stopPropagation(); onAddToBasket(item); }} title="הוסף למגש עבודה" style={{ flexShrink:0, height:22, padding:"0 7px", background:isSelected?C.gd:"transparent", border:`1px solid ${isSelected?C.gd:"rgba(54,69,79,0.18)"}`, borderRadius:4, cursor:"pointer", fontSize:10, fontWeight:700, color:isSelected?"#fff":C.chl, fontFamily:C.heb, transition:"all 0.12s", whiteSpace:"nowrap" }}>
        {isSelected ? "✓" : "+ מגש"}
      </button>
      {onUseInCalculator && (
        <button onClick={(e)=>{ e.stopPropagation(); onUseInCalculator(item); }} title="השתמש במחשבון" style={{ flexShrink:0, height:22, width:22, padding:0, background:"transparent", border:"1px solid rgba(54,69,79,0.12)", borderRadius:4, cursor:"pointer", fontSize:11, display:"flex", alignItems:"center", justifyContent:"center" }}>🔢</button>
      )}
      {onCreateCertificate && (
        <button onClick={(e)=>{ e.stopPropagation(); onCreateCertificate(item); }} title="צור תעודה" style={{ flexShrink:0, height:22, width:22, padding:0, background:"transparent", border:"1px solid rgba(54,69,79,0.12)", borderRadius:4, cursor:"pointer", fontSize:11, display:"flex", alignItems:"center", justifyContent:"center" }}>📋</button>
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
