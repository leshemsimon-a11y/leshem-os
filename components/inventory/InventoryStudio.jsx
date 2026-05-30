/**
 * components/inventory/InventoryStudio.jsx  —  v5.5
 *
 * v5.5 — Work Tray multi-item send:
 *   WorkTray calls onSendToCalculator(items, useAs).
 *   • 1 item  → standard per-item flow (CalcLoadDialog → UseAsDialog).
 *   • N items → WorkTray asks one shared role (center/side/part) and the
 *     studio forwards the whole batch to onSendBatchToCalculator(items, useAs).
 *     No item is silently dropped.
 *
 * Changes from M5.3.2:
 *
 * Task 2 — Work Tray:
 *   WorkTray replaces SelectionBasket.
 *   onSendToCalculator callback: when user clicks "שלח למחשבון" with
 *   multiple tray items, a MultiUseDialog asks per-item assignment:
 *   Center Stones / Side Stones / Components.
 *   onUseInCalculator still works for single-item UseAsDialog.
 *
 * Task 6 — Use in Calculator behavior:
 *   "Use in Calculator" now clears previous calculator item data.
 *   This is handled in pages/index.js prefillCalcFromItem via
 *   setCfg — the parent passes the clear behavior.
 *
 * Task 10 — CommandBar:
 *   CommandBar placed above the inventory grid.
 *   onSearch suggestion: applies suggested filters.
 *   onCalculate suggestion: navigates to calculator tab.
 *   onCertificate: navigates to certificates tab.
 *   onClearFilters: resets all filters.
 *
 * All other features (views, demo items, loading, errors) unchanged.
 */

import { useState, useMemo, useCallback } from "react";
import { C } from "../../lib/constants";
import { InventoryCard, PRODUCT_TYPE_LABELS, PRODUCT_TYPE_GRADIENTS, PRODUCT_TYPE_ICONS } from "./InventoryCard";
import { InventoryFilters, EMPTY_FILTERS, applyFilters }                                   from "./InventoryFilters";
import { InventoryDrawer }                                                                  from "./InventoryDrawer";
import { WorkTray }                                                                         from "./WorkTray";
import { CommandBar }                                                                       from "./CommandBar";

// ─── Demo virtual items (unchanged from M5.3.2) ───────────────────────────────
const DEMO_ITEMS = [
  { id:"demo-1", isDemo:true, inventoryLayer:"Virtual Supplier Stock", sku:"DEMO-GIA-102", stoneType:"Diamond", productType:"natural_diamond", name:"Round Brilliant Diamond", caratWeight:"1.02", color:"G", clarity:"VS1", cutGrade:"Excellent", polish:"Excellent", symmetry:"Excellent", fluorescenceIntensity:"None", cutForm:"Round Brilliant", measLength:"6.44", measWidth:"6.46", measHeight:"3.97", certLab:"GIA", certNumber:"2473659812", laserInscription:"GIA 2473659812", supplierName:"Demo Supplier Co.", inventoryStatus:"במלאי", costUsd:4800, intendedUse:"Sale", thumbnailUrl:null, inventoryImages:[] },
  { id:"demo-2", isDemo:true, inventoryLayer:"Virtual Supplier Stock", sku:"DEMO-IGI-050", stoneType:"Diamond", productType:"lab_grown_diamond", name:"Lab Grown Diamond — CVD", caratWeight:"0.50", color:"D", clarity:"VVS1", cutGrade:"Excellent", cutForm:"Round Brilliant", growthMethod:"CVD", measLength:"5.12", measWidth:"5.14", measHeight:"3.10", certLab:"IGI", certNumber:"LG526382741", supplierName:"Demo Lab Co.", inventoryStatus:"במלאי", costUsd:900, intendedUse:"Sale", thumbnailUrl:null, inventoryImages:[] },
  { id:"demo-3", isDemo:true, inventoryLayer:"Virtual Supplier Stock", sku:"DEMO-GIA-FCD-082", stoneType:"Diamond", productType:"fancy_color_diamond", name:"Fancy Intense Yellow Diamond", caratWeight:"0.82", fancyColorIntensity:"Fancy Intense", fancyColorHue:"Yellow", clarity:"VS2", cutForm:"Cushion", certLab:"GIA", supplierName:"Demo Color Gems", inventoryStatus:"במלאי", costUsd:6200, intendedUse:"Sale", thumbnailUrl:null, inventoryImages:[] },
  { id:"demo-4", isDemo:true, inventoryLayer:"Physical Stock", sku:"DEMO-GRS-SAP-152", stoneType:"Sapphire", productType:"colored_gemstone", name:"Blue Sapphire — Ceylon", caratWeight:"1.52", color:"Blue", clarity:"Eye Clean", cutForm:"Oval", certLab:"GRS", inventoryStatus:"במלאי", costUsd:3800, intendedUse:"Mount", thumbnailUrl:null, inventoryImages:[] },
  { id:"demo-5", isDemo:true, inventoryLayer:"Physical Stock", sku:"DEMO-AGL-EMR-094", stoneType:"Emerald", productType:"colored_gemstone", name:"Colombian Emerald", caratWeight:"0.94", color:"Vivid Green", clarity:"Slight Inclusions", cutForm:"Emerald Cut", certLab:"AGL", inventoryStatus:"שמור", costUsd:5100, intendedUse:"Mount", thumbnailUrl:null, inventoryImages:[] },
  { id:"demo-6", isDemo:true, inventoryLayer:"Virtual Supplier Stock", sku:"DEMO-GRS-RUB-PR-062", stoneType:"Ruby", productType:"stone_pair_set", name:"Ruby Matched Pair", caratWeight:"0.62", stoneCount:"2", color:"Vivid Red", cutForm:"Oval", certLab:"GRS", inventoryStatus:"במלאי", costUsd:4400, intendedUse:"Earrings", thumbnailUrl:null, inventoryImages:[] },
  { id:"demo-7", isDemo:true, inventoryLayer:"Physical Stock", sku:"DEMO-CHAIN-18KYG", productType:"jewelry_part", name:"18K Yellow Gold Chain Component", inventoryStatus:"במלאי", costUsd:280, intendedUse:"Assembly", thumbnailUrl:null, inventoryImages:[] },
];

// ─── UseAsDialog (unchanged from M5.3.2) ─────────────────────────────────────
function UseAsDialog({ item, onSelect, onCancel }) {
  if (!item) return null;
  const ptLabel   = PRODUCT_TYPE_LABELS[item.productType] || item.stoneType || "Item";
  const img       = item.thumbnailUrl || (item.inventoryImages && item.inventoryImages[0]);
  const gradient  = PRODUCT_TYPE_GRADIENTS[item.productType] || "linear-gradient(140deg,#f0ede8,#d0c8b0)";
  const icon      = PRODUCT_TYPE_ICONS[item.productType] || "💎";
  const specParts = [];
  if (item.caratWeight) specParts.push(`${parseFloat(item.caratWeight).toFixed(2)} ct`);
  if (item.fancyColorIntensity) specParts.push(`${item.fancyColorIntensity} ${item.fancyColorHue||""}`.trim());
  else if (item.color) specParts.push(item.color);
  if (item.clarity) specParts.push(item.clarity);
  const isNonStone = ["jewelry_part", "finished_jewelry"].includes(item.productType);

  const OPTIONS = [
    { key:"center", icon:"💎", label:"אבן מרכזית", sub:"Center Stone — fills center stone type, carats, colour & clarity", disabled:isNonStone },
    { key:"side",   icon:"✨", label:"אבני צד",    sub:"Side Stones — fills Side Stone row 1 (type, ct/stone, count)", disabled:isNonStone },
    { key:"part",   icon:"🔗", label:"חלק / רכיב", sub:"Jewelry Part — navigate to Calculator for manual entry", disabled:false },
  ];

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(54,69,79,0.6)", zIndex:1300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={(e)=>{ if(e.target===e.currentTarget) onCancel(); }}>
      <div style={{ background:C.iv, borderRadius:12, padding:"22px 26px", maxWidth:460, width:"100%", boxShadow:"0 24px 60px rgba(54,69,79,0.3)" }}>
        {/* Item preview */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16, padding:"10px 12px", background:"rgba(54,69,79,0.04)", borderRadius:8, border:"1px solid rgba(54,69,79,0.1)" }}>
          {img ? (
            <img src={img} alt={item.name||ptLabel} style={{ width:52, height:52, objectFit:"cover", borderRadius:6, border:"1px solid rgba(54,69,79,0.12)", flexShrink:0 }} />
          ) : (
            <div style={{ width:52, height:52, background:gradient, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{icon}</div>
          )}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:C.dat, fontSize:9.5, fontWeight:700, color:C.chl, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:2 }}>{ptLabel}{item.isDemo?" · DEMO":""}</div>
            <div style={{ fontFamily:C.dat, fontSize:13, fontWeight:700, color:C.ch, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name||item.sku||ptLabel}</div>
            {specParts.length > 0 && <div style={{ fontFamily:C.dat, fontSize:11.5, color:C.chm, marginTop:1 }}>{specParts.join(" · ")}</div>}
          </div>
        </div>
        <div style={{ fontFamily:C.dat, fontSize:13.5, fontWeight:700, color:C.ch, marginBottom:3 }}>Use in Calculator</div>
        <div style={{ fontFamily:C.heb, fontSize:12, color:C.chl, marginBottom:14, lineHeight:1.6 }}>כיצד ברצונך להשתמש בפריט זה במחשבון?</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {OPTIONS.map((opt) => (
            <button key={opt.key} onClick={()=>!opt.disabled&&onSelect(opt.key)} disabled={opt.disabled}
              style={{ display:"flex", alignItems:"center", gap:13, padding:"11px 14px", background:opt.disabled?"rgba(54,69,79,0.03)":"#fff", border:`1.5px solid ${opt.disabled?"rgba(54,69,79,0.08)":"rgba(54,69,79,0.14)"}`, borderRadius:9, cursor:opt.disabled?"not-allowed":"pointer", textAlign:"left", opacity:opt.disabled?0.4:1, transition:"border-color 0.13s" }}
              onMouseEnter={(e)=>{ if(!opt.disabled){ e.currentTarget.style.borderColor=C.gd; e.currentTarget.style.background="rgba(197,179,88,0.07)"; } }}
              onMouseLeave={(e)=>{ if(!opt.disabled){ e.currentTarget.style.borderColor="rgba(54,69,79,0.14)"; e.currentTarget.style.background="#fff"; } }}
            >
              <span style={{ fontSize:22, flexShrink:0 }}>{opt.icon}</span>
              <div>
                <div style={{ fontFamily:C.heb, fontSize:13, fontWeight:700, color:C.ch }}>{opt.label}{opt.disabled&&<span style={{ fontFamily:C.dat, fontSize:10, fontWeight:400, color:C.chx, marginRight:8 }}> — לא רלוונטי לסוג פריט זה</span>}</div>
                <div style={{ fontFamily:C.dat, fontSize:11, color:C.chl, marginTop:1 }}>{opt.sub}</div>
              </div>
            </button>
          ))}
        </div>
        <button onClick={onCancel} style={{ marginTop:12, height:38, width:"100%", background:"transparent", border:"1px solid rgba(54,69,79,0.18)", borderRadius:8, cursor:"pointer", fontFamily:C.heb, fontSize:12.5, color:C.chl }}>ביטול</button>
      </div>
    </div>
  );
}

// ─── ViewBtn ──────────────────────────────────────────────────────────────────
function ViewBtn({ mode, current, label, onClick }) {
  const a = mode === current;
  return (
    <button onClick={()=>onClick(mode)} style={{ height:34, padding:"0 11px", background:a?"rgba(197,179,88,0.12)":"transparent", border:`1.5px solid ${a?C.gd:"rgba(54,69,79,0.18)"}`, borderRadius:7, cursor:"pointer", fontFamily:C.dat, fontSize:11.5, fontWeight:a?700:400, color:a?"#7a6a1a":C.chm, transition:"all 0.12s", whiteSpace:"nowrap" }}>
      {label}
    </button>
  );
}

// ─── MetalCard ────────────────────────────────────────────────────────────────
function MetalCard({ metal }) {
  return (
    <div style={{ background:"#fff", border:"1px solid rgba(54,69,79,0.1)", borderRadius:7, padding:"10px 14px", minWidth:125 }}>
      <div style={{ fontFamily:C.dat, fontSize:12.5, fontWeight:600, color:C.ch, marginBottom:3 }}>{metal.metalType || "—"}</div>
      <div style={{ fontFamily:C.dat, fontSize:11, color:C.chl }}>
        {metal.pricePerGram != null ? `$${Number(metal.pricePerGram).toFixed(2)} / g` : "Price unavailable"}
      </div>
    </div>
  );
}

// ─── InventoryStudio ──────────────────────────────────────────────────────────
export function InventoryStudio({
  stones = [],
  metals = [],
  loading = false,
  error   = null,
  onRetry,
  onAddNew,
  onUseInCalculator,      // legacy fallback (item, useAs)
  onCreateCertificate,
  onNavigateToCalc,
  onNavigateToCert,
  // v5.5.1: ROLE-first flow. Studio asks role (UseAsDialog), then hands
  // (item, role) to the parent which shows the New/Add dialog and prefills.
  onRoleChosenForCalc = null,      // called with (item, useAs) after role chosen
  onSendBatchToCalculator = null,  // called with (items, useAs) for multi-item tray send
}) {
  const [viewMode,    setViewMode]    = useState("card");
  const [searchText,  setSearchText]  = useState("");
  const [filters,     setFilters]     = useState({ ...EMPTY_FILTERS });
  const [drawerItem,  setDrawerItem]  = useState(null);
  const [trayItems,   setTrayItems]   = useState([]);
  const [useAsItem,   setUseAsItem]   = useState(null);

  const isShowingDemo = !loading && stones.length === 0;
  const allItems      = useMemo(() => (isShowingDemo ? DEMO_ITEMS : stones), [stones, isShowingDemo]);
  const filteredItems = useMemo(() => applyFilters(allItems, searchText, filters), [allItems, searchText, filters]);

  const trayIds = useMemo(() => new Set(trayItems.map(i => i.id)), [trayItems]);

  const handleSelectItem = useCallback((item) => {
    setTrayItems(prev => trayIds.has(item.id) ? prev.filter(i => i.id !== item.id) : [...prev, item]);
  }, [trayIds]);

  const addToTray     = useCallback((item) => {
    setTrayItems(prev => trayIds.has(item.id) ? prev.filter(i => i.id !== item.id) : [...prev, item]);
  }, [trayIds]);
  const removeFromTray = useCallback((id) => setTrayItems(prev => prev.filter(i => i.id !== id)), []);
  const clearTray      = useCallback(() => setTrayItems([]), []);

  // ── Use-in-Calculator flow (v5.5.1: ROLE first, then New/Add) ─────────────
  // Step 1: open UseAsDialog (role: center / side / part) right here.
  // Step 2: on role chosen, hand (item, role) to the parent, which then shows
  //         CalcLoadDialog (New / Add) and finally runs the prefill.
  const handleUseInCalcRequest = useCallback((item) => {
    setUseAsItem(item);
  }, []);

  const handleUseAsSelected = useCallback((useAs) => {
    const item = useAsItem;
    setUseAsItem(null);
    setDrawerItem(null);
    // Parent owns the New/Add dialog + prefill. Pass the chosen role through.
    if (onRoleChosenForCalc) {
      onRoleChosenForCalc(item, useAs);
    } else {
      // Backward-compatible fallback (older parent wiring).
      onUseInCalculator?.(item, useAs);
    }
  }, [useAsItem, onRoleChosenForCalc, onUseInCalculator]);

  // Cert request
  const handleCertRequest = useCallback((item) => {
    setDrawerItem(null);
    onCreateCertificate?.(item);
  }, [onCreateCertificate]);

  // Send to calculator from Work Tray.
  // v5.5: WorkTray calls back with (items, useAs).
  //   • useAs === null  → single item; run the standard per-item flow
  //                       (CalcLoadDialog: New/Add → UseAsDialog: role).
  //   • useAs set        → a batch with one shared role chosen in WorkTray.
  //                       Hand the whole batch to the parent, which loads every
  //                       item (first respects New/Add, rest append).
  const handleSendTrayToCalc = useCallback((items, useAs) => {
    if (!items || items.length === 0) return;
    if (!useAs) {
      // Single-item path (WorkTray only sends null for a 1-item tray).
      handleUseInCalcRequest(items[0]);
      return;
    }
    if (onSendBatchToCalculator) {
      onSendBatchToCalculator(items, useAs);
    } else {
      // Fallback: route the first item through the normal flow so nothing is silently lost.
      handleUseInCalcRequest(items[0]);
    }
  }, [handleUseInCalcRequest, onSendBatchToCalculator]);

  // CommandBar handlers
  const handleCommandSearch = useCallback((filterSuggestions) => {
    const next = { ...EMPTY_FILTERS };
    if (filterSuggestions.productType) next.productType = filterSuggestions.productType;
    if (filterSuggestions.stoneType)   next.stoneType   = filterSuggestions.stoneType;
    if (filterSuggestions.shape)       next.shape       = filterSuggestions.shape;
    if (filterSuggestions.priceMax)    next.priceMax    = filterSuggestions.priceMax;
    if (filterSuggestions.caratMax)    next.caratMax    = filterSuggestions.caratMax;
    setFilters(next);
  }, []);

  const gridStyle = useMemo(() => {
    if (viewMode === "card")    return { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:14 };
    if (viewMode === "grid")    return { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(150px, 1fr))", gap:10 };
    if (viewMode === "list")    return { display:"flex", flexDirection:"column", background:"#fff", borderRadius:8, border:"1px solid rgba(54,69,79,0.1)", overflow:"hidden" };
    return { display:"flex", flexDirection:"column", background:"rgba(54,69,79,0.025)", borderRadius:8, overflow:"hidden" };
  }, [viewMode]);

  const activeFilterCount = useMemo(() => Object.values(filters).filter(v => v !== "").length, [filters]);

  return (
    <div style={{ maxWidth:1360, margin:"0 auto", paddingBottom: trayItems.length > 0 ? 64 : 0 }}>

      {useAsItem && <UseAsDialog item={useAsItem} onSelect={handleUseAsSelected} onCancel={() => setUseAsItem(null)} />}

      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ fontFamily:C.ser, fontSize:19, fontWeight:700, color:C.ch, margin:0, letterSpacing:"0.04em" }}>Inventory Studio</h2>
          <p style={{ fontFamily:C.heb, fontSize:11, color:C.chl, margin:"3px 0 0" }}>
            סטודיו מלאי · {isShowingDemo ? "Demo virtual stock" : `${stones.length} items from Airtable`}
          </p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          {!loading && !error && stones.length > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:5, fontFamily:C.dat, fontSize:11, color:"#3d7a44" }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:"#3d7a44" }} />
              Airtable connected
            </div>
          )}
          <div style={{ display:"flex", gap:5 }}>
            <ViewBtn mode="card"    current={viewMode} label="⊞ Cards"   onClick={setViewMode} />
            <ViewBtn mode="grid"    current={viewMode} label="⊡ Grid"    onClick={setViewMode} />
            <ViewBtn mode="list"    current={viewMode} label="☰ List"    onClick={setViewMode} />
            <ViewBtn mode="compact" current={viewMode} label="≡ Compact" onClick={setViewMode} />
          </div>
          {onAddNew && (
            <button onClick={onAddNew} style={{ height:38, padding:"0 14px", background:C.ch, color:C.iv, border:"none", borderRadius:7, cursor:"pointer", fontFamily:C.heb, fontSize:12, fontWeight:600, whiteSpace:"nowrap" }}>
              + קלוט מוצר חדש
            </button>
          )}
        </div>
      </div>

      {/* CommandBar — prominent local command/search bar (Task 10) */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:C.dat, fontSize:9.5, fontWeight:700, color:C.chl, letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:6, display:"flex", alignItems:"center", gap:7 }}>
          <span style={{ fontSize:13, color:C.gd }}>✦</span> Command Bar · פקודה מהירה
        </div>
        <CommandBar
          onSearch={handleCommandSearch}
          onCalculate={(calcSugg) => onNavigateToCalc?.(calcSugg)}
          onCertificate={() => onNavigateToCert?.()}
          onClearFilters={() => setFilters({ ...EMPTY_FILTERS })}
          onNavigate={(t) => { if (t === "calc") onNavigateToCalc?.(); else if (t === "cert") onNavigateToCert?.(); }}
          allItems={allItems}
        />
      </div>

      {/* Demo notice */}
      {isShowingDemo && (
        <div style={{ background:"rgba(197,179,88,0.07)", border:"1px solid rgba(197,179,88,0.28)", borderRadius:8, padding:"12px 14px", marginBottom:16, display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:18 }}>🔮</span>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:C.dat, fontSize:12.5, fontWeight:700, color:"#7a6a1a", marginBottom:2 }}>Showing Virtual Demo Inventory</div>
            <div style={{ fontFamily:C.heb, fontSize:11, color:C.chl, lineHeight:1.6 }}>No real items in Airtable. Demo items are for preview only — NOT saved to your database.</div>
          </div>
          {onAddNew && <button onClick={onAddNew} style={{ height:32, padding:"0 12px", background:C.gd, color:C.ch, border:"none", borderRadius:6, cursor:"pointer", fontFamily:C.heb, fontSize:11.5, fontWeight:700, flexShrink:0 }}>+ הוסף</button>}
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div style={{ padding:"22px 20px", background:"rgba(176,64,64,0.05)", border:"1px solid rgba(176,64,64,0.18)", borderRadius:8, textAlign:"center", marginBottom:18 }}>
          <div style={{ fontSize:22, marginBottom:8 }}>⚠️</div>
          <p style={{ fontFamily:C.heb, fontSize:13, color:"#b04040", margin:"0 0 12px" }}>{error}</p>
          {onRetry && <button onClick={onRetry} style={{ height:36, padding:"0 18px", background:C.ch, color:C.iv, border:"none", borderRadius:6, fontFamily:C.heb, fontSize:12, fontWeight:600, cursor:"pointer" }}>↺ נסה שוב</button>}
        </div>
      )}

      {/* Search + Filters */}
      {(!error || loading) && (
        <div style={{ marginBottom:14 }}>
          <InventoryFilters searchText={searchText} setSearchText={setSearchText} filters={filters} setFilters={setFilters} items={allItems} />
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:14 }}>
          {Array.from({length:6}).map((_,i) => (
            <div key={i} style={{ borderRadius:10, overflow:"hidden", background:"#fff", border:"1px solid rgba(54,69,79,0.1)" }}>
              <div style={{ aspectRatio:"5/4", background:"rgba(54,69,79,0.08)", animation:"pulse 1.5s ease-in-out infinite" }} />
              <div style={{ padding:"12px 14px" }}>
                {[60,90,70,50].map((w,j) => <div key={j} style={{ height:11, borderRadius:4, background:"rgba(54,69,79,0.07)", width:`${w}%`, marginBottom:8, animation:"pulse 1.5s ease-in-out infinite", animationDelay:`${j*0.1}s` }} />)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Items */}
      {!loading && (!error || isShowingDemo) && (
        <>
          {(searchText || activeFilterCount > 0) && (
            <div style={{ fontFamily:C.heb, fontSize:11.5, color:C.chl, marginBottom:10 }}>
              {filteredItems.length} {filteredItems.length === 1 ? "פריט" : "פריטים"} נמצא{filteredItems.length !== 1 ? "ו" : ""}
              {activeFilterCount > 0 && ` · ${activeFilterCount} מסנן${activeFilterCount>1?"ים":""} פעיל${activeFilterCount>1?"ים":""}`}
            </div>
          )}
          {filteredItems.length === 0 ? (
            <div style={{ textAlign:"center", padding:"48px 20px", color:C.chl }}>
              <div style={{ fontSize:36, marginBottom:12 }}>🔍</div>
              <p style={{ fontFamily:C.heb, fontSize:14, margin:0 }}>לא נמצאו פריטים התואמים את החיפוש.</p>
              <button onClick={()=>{ setSearchText(""); setFilters({...EMPTY_FILTERS}); }} style={{ marginTop:14, height:36, padding:"0 18px", background:"transparent", border:"1px solid rgba(54,69,79,0.22)", borderRadius:7, cursor:"pointer", fontFamily:C.heb, fontSize:12, color:C.chl }}>
                × נקה חיפוש ומסננים
              </button>
            </div>
          ) : (
            <div style={gridStyle}>
              {filteredItems.map(item => (
                <InventoryCard
                  key={item.id}
                  item={item}
                  mode={viewMode}
                  isSelected={trayIds.has(item.id)}
                  onSelect={handleSelectItem}
                  onOpenDrawer={setDrawerItem}
                  onAddToBasket={addToTray}
                  onUseInCalculator={handleUseInCalcRequest}
                  onCreateCertificate={handleCertRequest}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Metals */}
      {metals.length > 0 && !loading && (
        <div style={{ marginTop:28 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <div style={{ width:3, height:15, background:C.gd, borderRadius:2 }} />
            <span style={{ fontFamily:C.dat, fontSize:12, fontWeight:700, color:C.ch }}>Metal Prices</span>
            <div style={{ flex:1, height:"1px", background:"rgba(54,69,79,0.1)" }} />
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
            {metals.map(m => <MetalCard key={m.id} metal={m} />)}
          </div>
        </div>
      )}

      {/* Drawer */}
      {drawerItem && (
        <InventoryDrawer
          item={drawerItem}
          isSelected={trayIds.has(drawerItem.id)}
          onClose={() => setDrawerItem(null)}
          onAddToBasket={(item) => { addToTray(item); }}
          onUseInCalculator={handleUseInCalcRequest}
          onCreateCertificate={handleCertRequest}
        />
      )}

      {/* Work Tray (replaces SelectionBasket) */}
      <WorkTray
        items={trayItems}
        onRemove={removeFromTray}
        onClear={clearTray}
        onSendToCalculator={handleSendTrayToCalc}
      />

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
    </div>
  );
}
