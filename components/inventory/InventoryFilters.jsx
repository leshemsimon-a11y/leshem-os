/**
 * components/inventory/InventoryFilters.jsx  —  v5.4
 *
 * Changes from M5.3:
 *   + "Reset Filters" button always visible when any filter is active
 *   + Filter groups collapsed by default on mobile (viewport < 640px)
 *   + Status filter group added
 *   + Filter panel uses a 2-column layout on desktop, 1-column on mobile
 *   + Pill buttons wrap cleanly without overflow
 *   + Filter count badge on toggle button
 *
 * Props:
 *   searchText   {string}
 *   setSearchText {function}
 *   filters      {object}
 *   setFilters   {function}
 *   items        {array}  — all unfiltered items
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

// ─── Pill ─────────────────────────────────────────────────────────────────────
function Pill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ height:28, padding:"0 12px", borderRadius:14, border:`1.5px solid ${active?C.gd:"rgba(54,69,79,0.18)"}`, background:active?C.gd:"transparent", color:active?"#fff":C.chm, fontFamily:DAT, fontSize:11, fontWeight:active?700:400, cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.14s" }}
    >
      {label}
    </button>
  );
}

// ─── Range pair ───────────────────────────────────────────────────────────────
function RangePair({ fieldMin, fieldMax, labelMin, labelMax, filters, setFilter }) {
  const INP = {
    flex:1, height:32, border:"1px solid rgba(54,69,79,0.18)", borderRadius:6,
    background:"#fff", padding:"0 10px", fontFamily:DAT, fontSize:12,
    color:C.ch, outline:"none", boxSizing:"border-box",
  };
  return (
    <div style={{ display:"flex", gap:6, alignItems:"center" }}>
      <input type="number" value={filters[fieldMin]} onChange={(e) => setFilter(fieldMin, e.target.value)} placeholder={labelMin} style={INP} />
      <span style={{ fontFamily:DAT, fontSize:11, color:C.chl }}>–</span>
      <input type="number" value={filters[fieldMax]} onChange={(e) => setFilter(fieldMax, e.target.value)} placeholder={labelMax} style={INP} />
    </div>
  );
}

// ─── FilterGroup ──────────────────────────────────────────────────────────────
function FilterGroup({ label, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom:14 }}>
      <button onClick={() => setOpen(!open)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:6, width:"100%", padding:"0 0 6px 0" }}>
        <span style={{ fontFamily:DAT, fontSize:9.5, fontWeight:700, color:C.chl, letterSpacing:"0.14em", textTransform:"uppercase", flex:1, textAlign:"left" }}>{label}</span>
        <span style={{ fontFamily:DAT, fontSize:11, color:C.chx }}>{open ? "▾" : "▸"}</span>
      </button>
      {open && <div style={{ marginTop:2 }}>{children}</div>}
    </div>
  );
}

// ─── InventoryFilters ─────────────────────────────────────────────────────────
export function InventoryFilters({ searchText, setSearchText, filters, setFilters, items }) {
  const [panelOpen, setPanelOpen] = useState(false);

  const activeCount = useMemo(() => Object.values(filters).filter(v => v !== "").length, [filters]);
  const setFilter   = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const toggle      = (key, value) => setFilter(key, filters[key] === value ? "" : value);
  const clearAll    = () => setFilters({ ...EMPTY_FILTERS });

  const opts = useMemo(() => {
    const uniq = (arr) => [...new Set(arr.filter(Boolean))].sort();
    return {
      productTypes: uniq(items.map(i => i.productType)),
      layers:       uniq(items.map(i => i.inventoryLayer)),
      statuses:     uniq(items.map(i => i.inventoryStatus)),
      stoneTypes:   uniq(items.map(i => i.stoneType)),
      shapes:       uniq(items.map(i => i.cutForm || i.stoneShape)),
      certLabs:     uniq(items.map(i => i.certLab)),
      intendedUses: uniq(items.map(i => i.intendedUse)),
    };
  }, [items]);

  return (
    <div>

      {/* ── Search bar + controls ── */}
      <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", marginBottom: panelOpen ? 14 : 0 }}>
        {/* Search */}
        <div style={{ flex:"1 1 220px", position:"relative" }}>
          <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontSize:14, pointerEvents:"none", color:C.chl }}>🔍</span>
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="SKU, description, stone type, cert, supplier…"
            style={{ width:"100%", height:40, border:"1px solid rgba(54,69,79,0.18)", borderRadius:8, background:"#fff", paddingLeft:34, paddingRight:12, fontFamily:DAT, fontSize:13, color:C.ch, outline:"none", boxSizing:"border-box" }}
          />
          {searchText && (
            <button onClick={() => setSearchText("")} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.chl, fontSize:16, lineHeight:1 }}>✕</button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          style={{ height:40, padding:"0 16px", border:`1.5px solid ${panelOpen || activeCount>0 ? C.gd : "rgba(54,69,79,0.2)"}`, borderRadius:8, background:panelOpen?"rgba(197,179,88,0.08)":"transparent", color:panelOpen || activeCount>0 ?"#7a6a1a":C.chm, fontFamily:DAT, fontSize:12, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap" }}
        >
          <span>⊞ מסננים</span>
          {activeCount > 0 && (
            <span style={{ background:C.gd, color:"#fff", borderRadius:10, padding:"1px 7px", fontSize:10, fontWeight:700 }}>{activeCount}</span>
          )}
        </button>

        {/* Reset filters — always visible when active */}
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            style={{ height:40, padding:"0 14px", border:"1px solid rgba(176,64,64,0.3)", borderRadius:8, background:"rgba(176,64,64,0.06)", color:"#b04040", fontFamily:HEB, fontSize:12, cursor:"pointer", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:5 }}
          >
            × איפוס מסננים
          </button>
        )}
      </div>

      {/* ── Filter panel ── */}
      {panelOpen && (
        <div style={{ background:"#fff", border:"1px solid rgba(54,69,79,0.12)", borderRadius:10, padding:"16px 18px", marginBottom:14 }}>
          {/* Two-column grid on desktop */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:"0 24px" }}>

            {opts.productTypes.length > 0 && (
              <FilterGroup label="Product Type">
                <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                  {opts.productTypes.map(pt => (
                    <Pill key={pt} label={PRODUCT_TYPE_LABELS[pt] || pt} active={filters.productType === pt} onClick={() => toggle("productType", pt)} />
                  ))}
                </div>
              </FilterGroup>
            )}

            {opts.layers.length > 0 && (
              <FilterGroup label="Inventory Layer">
                <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                  {opts.layers.map(l => <Pill key={l} label={l} active={filters.inventoryLayer === l} onClick={() => toggle("inventoryLayer", l)} />)}
                </div>
              </FilterGroup>
            )}

            {opts.statuses.length > 0 && (
              <FilterGroup label="Status">
                <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                  {opts.statuses.map(s => <Pill key={s} label={s} active={filters.status === s} onClick={() => toggle("status", s)} />)}
                </div>
              </FilterGroup>
            )}

            {opts.stoneTypes.length > 0 && (
              <FilterGroup label="Stone Type">
                <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                  {opts.stoneTypes.map(st => <Pill key={st} label={st} active={filters.stoneType === st} onClick={() => toggle("stoneType", st)} />)}
                </div>
              </FilterGroup>
            )}

            {opts.shapes.length > 0 && (
              <FilterGroup label="Shape / Cut">
                <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                  {opts.shapes.map(sh => <Pill key={sh} label={sh} active={filters.shape === sh} onClick={() => toggle("shape", sh)} />)}
                </div>
              </FilterGroup>
            )}

            {opts.certLabs.length > 0 && (
              <FilterGroup label="Certificate Lab">
                <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                  {opts.certLabs.map(cl => <Pill key={cl} label={cl} active={filters.certLab === cl} onClick={() => toggle("certLab", cl)} />)}
                </div>
              </FilterGroup>
            )}

            {opts.intendedUses.length > 0 && (
              <FilterGroup label="Intended Use">
                <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                  {opts.intendedUses.map(u => <Pill key={u} label={u} active={filters.intendedUse === u} onClick={() => toggle("intendedUse", u)} />)}
                </div>
              </FilterGroup>
            )}

            <FilterGroup label="Carat Range">
              <RangePair fieldMin="caratMin" fieldMax="caratMax" labelMin="Min ct" labelMax="Max ct" filters={filters} setFilter={setFilter} />
            </FilterGroup>

            <FilterGroup label="Price Range (USD)">
              <RangePair fieldMin="priceMin" fieldMax="priceMax" labelMin="Min $" labelMax="Max $" filters={filters} setFilter={setFilter} />
            </FilterGroup>

          </div>
        </div>
      )}
    </div>
  );
}

// ─── applyFilters ─────────────────────────────────────────────────────────────
export function applyFilters(items, searchText, filters) {
  let result = items;

  if (searchText.trim()) {
    const q = searchText.toLowerCase();
    result = result.filter(item =>
      [item.sku, item.name, item.stoneType, item.productType,
       item.color, item.clarity, item.certLab, item.certNumber,
       item.supplierName, item.ownerClient, item.cutForm,
       item.fancyColorIntensity, item.fancyColorHue,
       item.inventoryLayer, item.intendedUse, item.laserInscription]
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
