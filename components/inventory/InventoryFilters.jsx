/**
 * components/inventory/InventoryFilters.jsx  —  v5.3
 *
 * Search bar + collapsible filter panel for the Inventory Studio.
 *
 * Props:
 *   searchText   {string}
 *   setSearchText {function}
 *   filters      {object}   — { productType, inventoryLayer, status, intendedUse, stoneType, shape, certLab, caratMin, caratMax, priceMin, priceMax }
 *   setFilters   {function} — setter for the entire filters object
 *   items        {array}    — all (unfiltered) items, used to derive filter options
 */

import { useState, useMemo } from "react";
import { C } from "../../lib/constants";
import { PRODUCT_TYPE_LABELS } from "./InventoryCard";

export const EMPTY_FILTERS = {
  productType: "", inventoryLayer: "", status: "",
  intendedUse: "", stoneType: "", shape: "",
  certLab: "", caratMin: "", caratMax: "",
  priceMin: "", priceMax: "",
};

const HEB = C.heb;
const DAT = C.dat;
const IV2 = "#F0EDE8";

// ─── Filter pill (single option) ─────────────────────────────────────────────
function Pill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ height:28, padding:"0 12px", borderRadius:14, border:`1.5px solid ${active?C.gd:"rgba(54,69,79,0.18)"}`, background:active?C.gd:"transparent", color:active?"#fff":C.chm, fontFamily:DAT, fontSize:11, fontWeight:active?700:400, cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.15s" }}
    >
      {label}
    </button>
  );
}

// ─── Range input pair ─────────────────────────────────────────────────────────
function RangePair({ labelMin, labelMax, fieldMin, fieldMax, filters, setFilter, placeholder = "—" }) {
  return (
    <div style={{ display:"flex", gap:6, alignItems:"center" }}>
      <input
        type="number"
        value={filters[fieldMin]}
        onChange={(e) => setFilter(fieldMin, e.target.value)}
        placeholder={`${labelMin} ${placeholder}`}
        style={{ flex:1, height:32, border:"1px solid rgba(54,69,79,0.18)", borderRadius:6, background:"#fff", padding:"0 10px", fontFamily:DAT, fontSize:12, color:C.ch, outline:"none", boxSizing:"border-box" }}
      />
      <span style={{ fontFamily:DAT, fontSize:11, color:C.chl }}>–</span>
      <input
        type="number"
        value={filters[fieldMax]}
        onChange={(e) => setFilter(fieldMax, e.target.value)}
        placeholder={`${labelMax} ${placeholder}`}
        style={{ flex:1, height:32, border:"1px solid rgba(54,69,79,0.18)", borderRadius:6, background:"#fff", padding:"0 10px", fontFamily:DAT, fontSize:12, color:C.ch, outline:"none", boxSizing:"border-box" }}
      />
    </div>
  );
}

// ─── Filter group ─────────────────────────────────────────────────────────────
function FilterGroup({ label, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom:14 }}>
      <button onClick={() => setOpen(!open)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:6, width:"100%", textAlign:"left", padding:"0 0 6px 0" }}>
        <span style={{ fontFamily:DAT, fontSize:9.5, fontWeight:700, color:C.chl, letterSpacing:"0.14em", textTransform:"uppercase", flex:1 }}>{label}</span>
        <span style={{ fontFamily:DAT, fontSize:11, color:C.chx }}>{open ? "▾" : "▸"}</span>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function InventoryFilters({ searchText, setSearchText, filters, setFilters, items }) {
  const [panelOpen, setPanelOpen] = useState(false);

  const activeCount = useMemo(() => Object.values(filters).filter(v => v !== "").length, [filters]);

  const setFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const toggleFilter = (key, value) => setFilter(key, filters[key] === value ? "" : value);
  const clearAll = () => { setFilters({ ...EMPTY_FILTERS }); };

  // Derive unique options from actual items
  const opts = useMemo(() => {
    const uniq = (arr) => [...new Set(arr.filter(Boolean))].sort();
    return {
      productTypes:  uniq(items.map(i => i.productType)),
      layers:        uniq(items.map(i => i.inventoryLayer)),
      statuses:      uniq(items.map(i => i.inventoryStatus)),
      stoneTypes:    uniq(items.map(i => i.stoneType)),
      shapes:        uniq(items.map(i => i.cutForm || i.stoneShape)),
      certLabs:      uniq(items.map(i => i.certLab)),
      intendedUses:  uniq(items.map(i => i.intendedUse)),
    };
  }, [items]);

  return (
    <div>
      {/* ── Search bar + controls row ── */}
      <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", marginBottom:panelOpen ? 14 : 0 }}>
        {/* Search input */}
        <div style={{ flex:"1 1 200px", position:"relative" }}>
          <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontSize:14, pointerEvents:"none", color:C.chl }}>🔍</span>
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by SKU, description, stone type, cert, supplier…"
            style={{ width:"100%", height:40, border:"1px solid rgba(54,69,79,0.18)", borderRadius:8, background:"#fff", paddingLeft:34, paddingRight:12, fontFamily:DAT, fontSize:13, color:C.ch, outline:"none", boxSizing:"border-box" }}
          />
          {searchText && (
            <button onClick={()=>setSearchText("")} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.chl, fontSize:16, lineHeight:1, padding:0 }}>✕</button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          style={{ height:40, padding:"0 16px", border:`1.5px solid ${panelOpen||activeCount>0?C.gd:"rgba(54,69,79,0.2)"}`, borderRadius:8, background:panelOpen?"rgba(197,179,88,0.08)":"transparent", color:panelOpen||activeCount>0?"#7a6a1a":C.chm, fontFamily:DAT, fontSize:12, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition:"all 0.15s", whiteSpace:"nowrap" }}
        >
          <span>⊞ מסננים</span>
          {activeCount > 0 && (
            <span style={{ background:C.gd, color:"#fff", borderRadius:10, padding:"1px 7px", fontSize:10, fontWeight:700 }}>{activeCount}</span>
          )}
        </button>

        {/* Clear all */}
        {activeCount > 0 && (
          <button onClick={clearAll} style={{ height:40, padding:"0 14px", border:"1px solid rgba(54,69,79,0.18)", borderRadius:8, background:"transparent", color:C.chl, fontFamily:HEB, fontSize:12, cursor:"pointer", whiteSpace:"nowrap" }}>
            × נקה הכל
          </button>
        )}
      </div>

      {/* ── Filter panel ── */}
      {panelOpen && (
        <div style={{ background:"#fff", border:"1px solid rgba(54,69,79,0.12)", borderRadius:10, padding:"16px 18px", marginBottom:14, display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:"0 24px" }}>

          {/* Product Type */}
          {opts.productTypes.length > 0 && (
            <FilterGroup label="Product Type">
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {opts.productTypes.map(pt => (
                  <Pill key={pt} label={PRODUCT_TYPE_LABELS[pt] || pt} active={filters.productType === pt} onClick={() => toggleFilter("productType", pt)} />
                ))}
              </div>
            </FilterGroup>
          )}

          {/* Inventory Layer */}
          {opts.layers.length > 0 && (
            <FilterGroup label="Inventory Layer">
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {opts.layers.map(l => (
                  <Pill key={l} label={l} active={filters.inventoryLayer === l} onClick={() => toggleFilter("inventoryLayer", l)} />
                ))}
              </div>
            </FilterGroup>
          )}

          {/* Status */}
          {opts.statuses.length > 0 && (
            <FilterGroup label="Status">
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {opts.statuses.map(s => (
                  <Pill key={s} label={s} active={filters.status === s} onClick={() => toggleFilter("status", s)} />
                ))}
              </div>
            </FilterGroup>
          )}

          {/* Stone Type */}
          {opts.stoneTypes.length > 0 && (
            <FilterGroup label="Stone Type">
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {opts.stoneTypes.map(st => (
                  <Pill key={st} label={st} active={filters.stoneType === st} onClick={() => toggleFilter("stoneType", st)} />
                ))}
              </div>
            </FilterGroup>
          )}

          {/* Shape */}
          {opts.shapes.length > 0 && (
            <FilterGroup label="Shape / Cut">
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {opts.shapes.map(sh => (
                  <Pill key={sh} label={sh} active={filters.shape === sh} onClick={() => toggleFilter("shape", sh)} />
                ))}
              </div>
            </FilterGroup>
          )}

          {/* Certificate Lab */}
          {opts.certLabs.length > 0 && (
            <FilterGroup label="Certificate Lab">
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {opts.certLabs.map(cl => (
                  <Pill key={cl} label={cl} active={filters.certLab === cl} onClick={() => toggleFilter("certLab", cl)} />
                ))}
              </div>
            </FilterGroup>
          )}

          {/* Intended Use */}
          {opts.intendedUses.length > 0 && (
            <FilterGroup label="Intended Use">
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {opts.intendedUses.map(u => (
                  <Pill key={u} label={u} active={filters.intendedUse === u} onClick={() => toggleFilter("intendedUse", u)} />
                ))}
              </div>
            </FilterGroup>
          )}

          {/* Carat range */}
          <FilterGroup label="Carat Range">
            <RangePair labelMin="Min" labelMax="Max" fieldMin="caratMin" fieldMax="caratMax" filters={filters} setFilter={setFilter} placeholder="ct" />
          </FilterGroup>

          {/* Price range */}
          <FilterGroup label="Price Range (USD)">
            <RangePair labelMin="Min" labelMax="Max" fieldMin="priceMin" fieldMax="priceMax" filters={filters} setFilter={setFilter} placeholder="$" />
          </FilterGroup>
        </div>
      )}
    </div>
  );
}

// ─── Filter application logic ─────────────────────────────────────────────────
export function applyFilters(items, searchText, filters) {
  let result = items;

  if (searchText.trim()) {
    const q = searchText.toLowerCase();
    result = result.filter(item =>
      [item.sku, item.name, item.stoneType, item.productType,
       item.color, item.clarity, item.certLab, item.certNumber,
       item.supplierName, item.ownerClient, item.cutForm,
       item.fancyColorIntensity, item.fancyColorHue,
       item.inventoryLayer, item.intendedUse]
        .some(f => f && String(f).toLowerCase().includes(q))
    );
  }

  if (filters.productType)    result = result.filter(i => i.productType === filters.productType);
  if (filters.inventoryLayer) result = result.filter(i => i.inventoryLayer === filters.inventoryLayer);
  if (filters.status)         result = result.filter(i => i.inventoryStatus === filters.status);
  if (filters.stoneType)      result = result.filter(i => i.stoneType === filters.stoneType);
  if (filters.shape)          result = result.filter(i => (i.cutForm || i.stoneShape) === filters.shape);
  if (filters.certLab)        result = result.filter(i => i.certLab === filters.certLab);
  if (filters.intendedUse)    result = result.filter(i => i.intendedUse === filters.intendedUse);
  if (filters.caratMin)       result = result.filter(i => parseFloat(i.caratWeight || 0) >= parseFloat(filters.caratMin));
  if (filters.caratMax)       result = result.filter(i => parseFloat(i.caratWeight || 0) <= parseFloat(filters.caratMax));
  if (filters.priceMin)       result = result.filter(i => Number(i.costUsd || 0) >= Number(filters.priceMin));
  if (filters.priceMax)       result = result.filter(i => Number(i.costUsd || 0) <= Number(filters.priceMax));

  return result;
}
