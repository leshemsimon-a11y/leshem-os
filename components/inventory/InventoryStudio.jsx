/**
 * components/inventory/InventoryStudio.jsx  —  v5.3.1
 *
 * Inventory Actions Bridge — adds:
 *
 *   "Use in Calculator" with UseAsDialog:
 *     User selects how the item should fill the calculator:
 *       Center Stone / Side Stones / Jewelry Part
 *     Then calls onUseInCalculator(item, useAs) where useAs ∈
 *     { "center", "side", "part" }. The parent (pages/index.js)
 *     maps item fields to cfg and navigates to the calc tab.
 *
 *   "Create Certificate" (unchanged from M5.3):
 *     Calls onCreateCertificate(item). pages/index.js builds a
 *     pre-populated InHouseStoneReport and seeds the ReportEngine.
 *
 * All other features unchanged from M5.3 (views, filters, basket, demo items).
 */

import { useState, useMemo, useCallback } from "react";
import { C } from "../../lib/constants";
import { InventoryCard, PRODUCT_TYPE_LABELS, PRODUCT_TYPE_GRADIENTS } from "./InventoryCard";
import { InventoryFilters, EMPTY_FILTERS, applyFilters }               from "./InventoryFilters";
import { InventoryDrawer }                                              from "./InventoryDrawer";
import { SelectionBasket }                                              from "./SelectionBasket";

// ─── Demo virtual inventory ───────────────────────────────────────────────────
// Shown when Airtable stones array is empty.
// isDemo:true — never saved to Airtable automatically.
const DEMO_ITEMS = [
  {
    id:"demo-1", isDemo:true,
    inventoryLayer:"Virtual Supplier Stock",
    sku:"DEMO-GIA-102", stoneType:"Diamond", productType:"natural_diamond",
    name:"Round Brilliant Diamond",
    caratWeight:"1.02", color:"G", clarity:"VS1",
    cutGrade:"Excellent", polish:"Excellent", symmetry:"Excellent",
    fluorescenceIntensity:"None", cutForm:"Round Brilliant",
    measLength:"6.44", measWidth:"6.46", measHeight:"3.97",
    certLab:"GIA", certNumber:"2473659812", laserInscription:"GIA 2473659812",
    supplierName:"Demo Supplier Co.", inventoryStatus:"במלאי",
    costUsd:4800, intendedUse:"Sale",
    thumbnailUrl:null, inventoryImages:[],
  },
  {
    id:"demo-2", isDemo:true,
    inventoryLayer:"Virtual Supplier Stock",
    sku:"DEMO-IGI-050", stoneType:"Diamond", productType:"lab_grown_diamond",
    name:"Lab Grown Diamond — CVD",
    caratWeight:"0.50", color:"D", clarity:"VVS1",
    cutGrade:"Excellent", polish:"Excellent", symmetry:"Excellent",
    fluorescenceIntensity:"None", cutForm:"Round Brilliant", growthMethod:"CVD",
    measLength:"5.12", measWidth:"5.14", measHeight:"3.10",
    certLab:"IGI", certNumber:"LG526382741", laserInscription:"LG526382741",
    supplierName:"Demo Lab Co.", inventoryStatus:"במלאי",
    costUsd:900, intendedUse:"Sale",
    thumbnailUrl:null, inventoryImages:[],
  },
  {
    id:"demo-3", isDemo:true,
    inventoryLayer:"Virtual Supplier Stock",
    sku:"DEMO-GIA-FCD-082", stoneType:"Diamond", productType:"fancy_color_diamond",
    name:"Fancy Intense Yellow Diamond",
    caratWeight:"0.82", fancyColorIntensity:"Fancy Intense", fancyColorHue:"Yellow",
    clarity:"VS2", cutForm:"Cushion",
    certLab:"GIA", certNumber:"6174823691", laserInscription:"GIA 6174823691",
    supplierName:"Demo Color Gems", inventoryStatus:"במלאי",
    costUsd:6200, intendedUse:"Sale",
    thumbnailUrl:null, inventoryImages:[],
  },
  {
    id:"demo-4", isDemo:true,
    inventoryLayer:"Physical Stock",
    sku:"DEMO-GRS-SAP-152", stoneType:"Sapphire", productType:"colored_gemstone",
    name:"Blue Sapphire — Ceylon",
    caratWeight:"1.52", color:"Blue", clarity:"Eye Clean", cutForm:"Oval",
    certLab:"GRS",
    supplierName:"Demo Gems Ltd.", inventoryStatus:"במלאי",
    costUsd:3800, intendedUse:"Mount",
    thumbnailUrl:null, inventoryImages:[],
  },
  {
    id:"demo-5", isDemo:true,
    inventoryLayer:"Physical Stock",
    sku:"DEMO-AGL-EMR-094", stoneType:"Emerald", productType:"colored_gemstone",
    name:"Colombian Emerald",
    caratWeight:"0.94", color:"Vivid Green", clarity:"Slight Inclusions",
    cutForm:"Emerald Cut", certLab:"AGL",
    supplierName:"Demo Gems Ltd.", inventoryStatus:"שמור",
    costUsd:5100, intendedUse:"Mount",
    thumbnailUrl:null, inventoryImages:[],
  },
  {
    id:"demo-6", isDemo:true,
    inventoryLayer:"Virtual Supplier Stock",
    sku:"DEMO-GRS-RUB-PR-062", stoneType:"Ruby", productType:"stone_pair_set",
    name:"Ruby Matched Pair",
    caratWeight:"0.62", stoneCount:"2", color:"Vivid Red", clarity:"Eye Clean",
    cutForm:"Oval", certLab:"GRS",
    supplierName:"Demo Ruby Source", inventoryStatus:"במלאי",
    costUsd:4400, intendedUse:"Earrings",
    thumbnailUrl:null, inventoryImages:[],
  },
  {
    id:"demo-7", isDemo:true,
    inventoryLayer:"Physical Stock",
    sku:"DEMO-CHAIN-18KYG", productType:"jewelry_part",
    name:"18K Yellow Gold Chain Component",
    inventoryStatus:"במלאי", costUsd:280, intendedUse:"Assembly",
    thumbnailUrl:null, inventoryImages:[],
  },
];

// ─── UseAsDialog ──────────────────────────────────────────────────────────────
/**
 * Modal asking how the selected inventory item should be used in the Calculator.
 * Three options: Center Stone / Side Stones / Jewelry Part
 */
function UseAsDialog({ item, onSelect, onCancel }) {
  if (!item) return null;

  const ptLabel = PRODUCT_TYPE_LABELS[item.productType] || item.stoneType || "Item";
  const ctStr   = item.caratWeight
    ? ` · ${parseFloat(item.caratWeight).toFixed(2)} ct`
    : "";

  const OPTIONS = [
    {
      key:    "center",
      icon:   "💎",
      label:  "אבן מרכזית",
      sub:    "Center Stone — fills center stone type, carats, colour & clarity",
    },
    {
      key:    "side",
      icon:   "✨",
      label:  "אבני צד",
      sub:    "Side Stones — fills Side Stone row 1 (type, ct/stone, count)",
    },
    {
      key:    "part",
      icon:   "🔗",
      label:  "חלק / רכיב",
      sub:    "Jewelry Part — navigate to Calculator (manual entry)",
    },
  ];

  return (
    <div
      style={{ position:"fixed", inset:0, background:"rgba(54,69,79,0.6)", zIndex:1300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{ background:C.iv, borderRadius:12, padding:"24px 28px", maxWidth:440, width:"100%", boxShadow:"0 24px 60px rgba(54,69,79,0.3)" }}>
        {/* Header */}
        <div style={{ marginBottom:18 }}>
          <div style={{ fontFamily:C.dat, fontSize:15, fontWeight:700, color:C.ch, marginBottom:4 }}>
            Use in Calculator
          </div>
          <div style={{ fontFamily:C.heb, fontSize:12, color:C.chl, lineHeight:1.6 }}>
            {ptLabel}{ctStr}
            <br />כיצד ברצונך להשתמש בפריט זה במחשבון?
          </div>
        </div>

        {/* Options */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => onSelect(opt.key)}
              style={{
                display:"flex", alignItems:"center", gap:14,
                padding:"13px 16px",
                background:"#fff",
                border:`1.5px solid rgba(54,69,79,0.15)`,
                borderRadius:9,
                cursor:"pointer",
                textAlign:"left",
                transition:"border-color 0.14s, background 0.14s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = C.gd;
                e.currentTarget.style.background  = "rgba(197,179,88,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(54,69,79,0.15)";
                e.currentTarget.style.background  = "#fff";
              }}
            >
              <span style={{ fontSize:26, flexShrink:0 }}>{opt.icon}</span>
              <div>
                <div style={{ fontFamily:C.heb, fontSize:14, fontWeight:700, color:C.ch }}>
                  {opt.label}
                </div>
                <div style={{ fontFamily:C.dat, fontSize:11, color:C.chl, marginTop:2 }}>
                  {opt.sub}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Cancel */}
        <button
          onClick={onCancel}
          style={{ marginTop:14, height:38, width:"100%", background:"transparent", border:"1px solid rgba(54,69,79,0.18)", borderRadius:8, cursor:"pointer", fontFamily:C.heb, fontSize:12.5, color:C.chl, transition:"border-color 0.12s" }}
        >
          ביטול
        </button>
      </div>
    </div>
  );
}

// ─── View-mode button ─────────────────────────────────────────────────────────
function ViewBtn({ mode, current, label, onClick }) {
  const active = mode === current;
  return (
    <button
      onClick={() => onClick(mode)}
      title={mode}
      style={{ height:34, padding:"0 12px", background:active?"rgba(197,179,88,0.12)":"transparent", border:`1.5px solid ${active?C.gd:"rgba(54,69,79,0.18)"}`, borderRadius:7, cursor:"pointer", fontFamily:C.dat, fontSize:12, fontWeight:active?700:400, color:active?"#7a6a1a":C.chm, transition:"all 0.12s", whiteSpace:"nowrap" }}
    >
      {label}
    </button>
  );
}

// ─── Metal price card ─────────────────────────────────────────────────────────
function MetalCard({ metal }) {
  return (
    <div style={{ background:"#fff", border:"1px solid rgba(54,69,79,0.1)", borderRadius:7, padding:"10px 14px", minWidth:130 }}>
      <div style={{ fontFamily:C.dat, fontSize:12.5, fontWeight:600, color:C.ch, marginBottom:3 }}>
        {metal.metalType || "—"}
      </div>
      <div style={{ fontFamily:C.dat, fontSize:11, color:C.chl }}>
        {metal.pricePerGram != null
          ? `$${Number(metal.pricePerGram).toFixed(2)} / g`
          : "Price unavailable"}
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
  onUseInCalculator,
  onCreateCertificate,
}) {
  const [viewMode,     setViewMode]     = useState("card");
  const [searchText,   setSearchText]   = useState("");
  const [filters,      setFilters]      = useState({ ...EMPTY_FILTERS });
  const [drawerItem,   setDrawerItem]   = useState(null);
  const [basketItems,  setBasketItems]  = useState([]);
  // v5.3.1: UseAsDialog state
  const [useAsItem,    setUseAsItem]    = useState(null);

  const isShowingDemo = !loading && stones.length === 0;
  const allItems      = useMemo(() => (isShowingDemo ? DEMO_ITEMS : stones), [stones, isShowingDemo]);
  const filteredItems = useMemo(() => applyFilters(allItems, searchText, filters), [allItems, searchText, filters]);

  const basketIds = useMemo(() => new Set(basketItems.map(i => i.id)), [basketItems]);

  const handleSelectItem = useCallback((item) => {
    setBasketItems(prev =>
      basketIds.has(item.id) ? prev.filter(i => i.id !== item.id) : [...prev, item]
    );
  }, [basketIds]);

  const addToBasket      = useCallback((item) => {
    setBasketItems(prev =>
      basketIds.has(item.id) ? prev.filter(i => i.id !== item.id) : [...prev, item]
    );
  }, [basketIds]);
  const removeFromBasket = useCallback((id) => setBasketItems(prev => prev.filter(i => i.id !== id)), []);
  const clearBasket      = useCallback(() => setBasketItems([]), []);

  // ── v5.3.1: "Use in Calculator" — show UseAsDialog before navigating ──────
  const handleUseInCalcRequest = useCallback((item) => {
    setUseAsItem(item);
    // Drawer stays open until user makes a selection or cancels
  }, []);

  const handleUseAsSelected = useCallback((useAs) => {
    const item = useAsItem;
    setUseAsItem(null);
    setDrawerItem(null);   // close drawer
    onUseInCalculator?.(item, useAs);
  }, [useAsItem, onUseInCalculator]);

  const handleUseAsCancel = useCallback(() => {
    setUseAsItem(null);
    // drawer remains open
  }, []);

  // ── "Create Certificate" — close drawer and delegate to parent ────────────
  const handleCertRequest = useCallback((item) => {
    setDrawerItem(null);
    onCreateCertificate?.(item);
  }, [onCreateCertificate]);

  const gridStyle = useMemo(() => {
    if (viewMode === "card")    return { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:16 };
    if (viewMode === "grid")    return { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))", gap:12 };
    if (viewMode === "list")    return { display:"flex", flexDirection:"column", background:"#fff", borderRadius:8, border:"1px solid rgba(54,69,79,0.1)", overflow:"hidden" };
    return { display:"flex", flexDirection:"column", background:"rgba(54,69,79,0.025)", borderRadius:8, overflow:"hidden" };
  }, [viewMode]);

  const activeFilterCount = useMemo(() => Object.values(filters).filter(v => v !== "").length, [filters]);

  return (
    <div style={{ maxWidth:1360, margin:"0 auto", paddingBottom: basketItems.length > 0 ? 64 : 0 }}>

      {/* UseAsDialog — rendered above the drawer (zIndex:1300 vs drawer:1200) */}
      {useAsItem && (
        <UseAsDialog
          item={useAsItem}
          onSelect={handleUseAsSelected}
          onCancel={handleUseAsCancel}
        />
      )}

      {/* ── Header ── */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ fontFamily:C.ser, fontSize:19, fontWeight:700, color:C.ch, margin:0, letterSpacing:"0.04em" }}>
            Inventory Studio
          </h2>
          <p style={{ fontFamily:C.heb, fontSize:11, color:C.chl, margin:"4px 0 0" }}>
            סטודיו מלאי · {isShowingDemo ? "Demo virtual stock" : `${stones.length} items from Airtable`}
          </p>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
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
            <button onClick={onAddNew} style={{ height:38, padding:"0 16px", background:C.ch, color:C.iv, border:"none", borderRadius:7, cursor:"pointer", fontFamily:C.heb, fontSize:12.5, fontWeight:600, display:"flex", alignItems:"center", gap:6 }}>
              + קלוט מוצר חדש
            </button>
          )}
        </div>
      </div>

      {/* Demo notice */}
      {isShowingDemo && (
        <div style={{ background:"rgba(197,179,88,0.07)", border:"1px solid rgba(197,179,88,0.28)", borderRadius:8, padding:"12px 16px", marginBottom:18, display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:20 }}>🔮</span>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:C.dat, fontSize:12.5, fontWeight:700, color:"#7a6a1a", marginBottom:2 }}>Showing Virtual Demo Inventory</div>
            <div style={{ fontFamily:C.heb, fontSize:11, color:C.chl, lineHeight:1.6 }}>
              No real items found in Airtable. These demo items are for preview only — they are NOT saved to your database.
            </div>
          </div>
          {onAddNew && (
            <button onClick={onAddNew} style={{ height:34, padding:"0 14px", background:C.gd, color:C.ch, border:"none", borderRadius:6, cursor:"pointer", fontFamily:C.heb, fontSize:11.5, fontWeight:700, flexShrink:0 }}>
              + הוסף פריט
            </button>
          )}
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div style={{ padding:"22px 20px", background:"rgba(176,64,64,0.05)", border:"1px solid rgba(176,64,64,0.18)", borderRadius:8, textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:22, marginBottom:8 }}>⚠️</div>
          <p style={{ fontFamily:C.heb, fontSize:13, color:"#b04040", margin:"0 0 12px" }}>{error}</p>
          {onRetry && (
            <button onClick={onRetry} style={{ height:36, padding:"0 18px", background:C.ch, color:C.iv, border:"none", borderRadius:6, fontFamily:C.heb, fontSize:12, fontWeight:600, cursor:"pointer" }}>
              ↺ נסה שוב
            </button>
          )}
        </div>
      )}

      {/* Search + Filters */}
      {(!error || loading) && (
        <div style={{ marginBottom:16 }}>
          <InventoryFilters
            searchText={searchText}
            setSearchText={setSearchText}
            filters={filters}
            setFilters={setFilters}
            items={allItems}
          />
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:16 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ borderRadius:10, overflow:"hidden", background:"#fff", border:"1px solid rgba(54,69,79,0.1)" }}>
              <div style={{ aspectRatio:"4/3", background:"rgba(54,69,79,0.08)", animation:"pulse 1.5s ease-in-out infinite" }} />
              <div style={{ padding:"12px 14px" }}>
                {[60, 90, 70, 50].map((w, j) => (
                  <div key={j} style={{ height:11, borderRadius:4, background:"rgba(54,69,79,0.07)", width:`${w}%`, marginBottom:8, animation:"pulse 1.5s ease-in-out infinite", animationDelay:`${j*0.1}s` }} />
                ))}
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
              {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"} found
              {activeFilterCount > 0 && ` · ${activeFilterCount} filter${activeFilterCount>1?"s":""} active`}
            </div>
          )}

          {filteredItems.length === 0 ? (
            <div style={{ textAlign:"center", padding:"48px 20px", color:C.chl }}>
              <div style={{ fontSize:36, marginBottom:12 }}>🔍</div>
              <p style={{ fontFamily:C.heb, fontSize:14, margin:0 }}>No items match your search or filters.</p>
              <button onClick={() => { setSearchText(""); setFilters({ ...EMPTY_FILTERS }); }} style={{ marginTop:14, height:36, padding:"0 18px", background:"transparent", border:`1px solid rgba(54,69,79,0.22)`, borderRadius:7, cursor:"pointer", fontFamily:C.heb, fontSize:12, color:C.chl }}>
                × Clear search & filters
              </button>
            </div>
          ) : (
            <div style={gridStyle}>
              {filteredItems.map(item => (
                <InventoryCard
                  key={item.id}
                  item={item}
                  mode={viewMode}
                  isSelected={basketIds.has(item.id)}
                  onSelect={handleSelectItem}
                  onOpenDrawer={setDrawerItem}
                  onAddToBasket={addToBasket}
                  onUseInCalculator={handleUseInCalcRequest}
                  onCreateCertificate={handleCertRequest}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Metals panel */}
      {metals.length > 0 && !loading && (
        <div style={{ marginTop:32 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <div style={{ width:3, height:16, background:C.gd, borderRadius:2 }} />
            <span style={{ fontFamily:C.dat, fontSize:12, fontWeight:700, color:C.ch }}>Metal Prices</span>
            <div style={{ flex:1, height:"1px", background:"rgba(54,69,79,0.1)" }} />
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
            {metals.map(m => <MetalCard key={m.id} metal={m} />)}
          </div>
        </div>
      )}

      {/* Item detail drawer */}
      {drawerItem && (
        <InventoryDrawer
          item={drawerItem}
          isSelected={basketIds.has(drawerItem.id)}
          onClose={() => setDrawerItem(null)}
          onAddToBasket={(item) => { addToBasket(item); }}
          onUseInCalculator={handleUseInCalcRequest}
          onCreateCertificate={handleCertRequest}
        />
      )}

      {/* Selection basket */}
      <SelectionBasket
        items={basketItems}
        onRemove={removeFromBasket}
        onClear={clearBasket}
      />

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }`}</style>
    </div>
  );
}
