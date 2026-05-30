/**
 * components/inventory/InventoryFilters.jsx  —  v5.5
 *
 * Substantive upgrade over v5.4:
 *
 *  • Stronger search: prominent search field; the matched fields now also
 *    include memo number, physical location, growth method and report number.
 *  • Active-filter chips row: each active filter shows as a removable chip
 *    directly under the search bar, so the current filter state is always
 *    visible without opening the panel.
 *  • Reset: a single "× איפוס" clears search + all filters.
 *  • Mobile: the filter panel renders as a bottom sheet (slide-up) on narrow
 *    viewports with large touch targets; on desktop it's an inline panel.
 *    A backdrop closes the mobile sheet. No cramped controls, no overflow.
 *  • Roomier pills and inputs (height 30–34, generous padding).
 *
 * Props:
 *   searchText {string}  setSearchText {fn}
 *   filters {object}     setFilters {fn}
 *   items {array}        — all unfiltered items (for option derivation)
 */

import { useState, useMemo, useEffect } from "react";
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

// Human labels for active-filter chips
const FILTER_LABELS = {
  productType: "סוג מוצר", inventoryLayer: "שכבת מלאי", status: "סטטוס",
  intendedUse: "שימוש", stoneType: "סוג אבן", shape: "צורה",
  certLab: "מעבדה", caratMin: "קראט מ-", caratMax: "קראט עד",
  priceMin: "מחיר מ-$", priceMax: "מחיר עד $",
};

// ─── Pill ─────────────────────────────────────────────────────────────────────
function Pill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ height:30, padding:"0 13px", borderRadius:15, border:`1.5px solid ${active?C.gd:"rgba(54,69,79,0.18)"}`, background:active?C.gd:"transparent", color:active?"#fff":C.chm, fontFamily:DAT, fontSize:11.5, fontWeight:active?700:400, cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.14s" }}
    >
      {label}
    </button>
  );
}

// ─── Range pair ───────────────────────────────────────────────────────────────
function RangePair({ fieldMin, fieldMax, labelMin, labelMax, filters, setFilter }) {
  const INP = {
    flex:1, minWidth:0, height:34, border:"1px solid rgba(54,69,79,0.18)", borderRadius:7,
    background:"#fff", padding:"0 11px", fontFamily:DAT, fontSize:12.5,
    color:C.ch, outline:"none", boxSizing:"border-box",
  };
  return (
    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
      <input type="number" inputMode="decimal" value={filters[fieldMin]} onChange={(e) => setFilter(fieldMin, e.target.value)} placeholder={labelMin} style={INP} />
      <span style={{ fontFamily:DAT, fontSize:12, color:C.chl }}>–</span>
      <input type="number" inputMode="decimal" value={filters[fieldMax]} onChange={(e) => setFilter(fieldMax, e.target.value)} placeholder={labelMax} style={INP} />
    </div>
  );
}

// ─── FilterGroup ──────────────────────────────────────────────────────────────
function FilterGroup({ label, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom:16, breakInside:"avoid" }}>
      <button onClick={() => setOpen(!open)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:6, width:"100%", padding:"0 0 7px 0" }}>
        <span style={{ fontFamily:DAT, fontSize:9.5, fontWeight:700, color:C.chl, letterSpacing:"0.14em", textTransform:"uppercase", flex:1, textAlign:"left" }}>{label}</span>
        <span style={{ fontFamily:DAT, fontSize:11, color:C.chx }}>{open ? "▾" : "▸"}</span>
      </button>
      {open && <div style={{ marginTop:2 }}>{children}</div>}
    </div>
  );
}

// ─── useIsMobile ──────────────────────────────────────────────────────────────
function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = () => setMobile(typeof window !== "undefined" && window.innerWidth < 640);
    mq();
    window.addEventListener("resize", mq);
    return () => window.removeEventListener("resize", mq);
  }, []);
  return mobile;
}

// ─── InventoryFilters ─────────────────────────────────────────────────────────
export function InventoryFilters({ searchText, setSearchText, filters, setFilters, items }) {
  const [panelOpen, setPanelOpen] = useState(false);
  const isMobile = useIsMobile();

  const activeEntries = useMemo(() => Object.entries(filters).filter(([, v]) => v !== ""), [filters]);
  const activeCount   = activeEntries.length;
  const setFilter   = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const toggle      = (key, value) => setFilter(key, filters[key] === value ? "" : value);
  const clearAll    = () => { setFilters({ ...EMPTY_FILTERS }); setSearchText(""); };
  const clearOne    = (key) => setFilter(key, "");

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

  // chip display value (use product-type label where relevant)
  const chipValue = (key, val) => key === "productType" ? (PRODUCT_TYPE_LABELS[val] || val) : val;

  const PanelBody = (
    <div style={{ columns: isMobile ? "1" : "220px 2", columnGap:24 }}>
      {opts.productTypes.length > 0 && (
        <FilterGroup label="Product Type">
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {opts.productTypes.map(pt => (
              <Pill key={pt} label={PRODUCT_TYPE_LABELS[pt] || pt} active={filters.productType === pt} onClick={() => toggle("productType", pt)} />
            ))}
          </div>
        </FilterGroup>
      )}
      {opts.layers.length > 0 && (
        <FilterGroup label="Inventory Layer">
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {opts.layers.map(l => <Pill key={l} label={l} active={filters.inventoryLayer === l} onClick={() => toggle("inventoryLayer", l)} />)}
          </div>
        </FilterGroup>
      )}
      {opts.statuses.length > 0 && (
        <FilterGroup label="Status">
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {opts.statuses.map(s => <Pill key={s} label={s} active={filters.status === s} onClick={() => toggle("status", s)} />)}
          </div>
        </FilterGroup>
      )}
      {opts.stoneTypes.length > 0 && (
        <FilterGroup label="Stone Type">
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {opts.stoneTypes.map(st => <Pill key={st} label={st} active={filters.stoneType === st} onClick={() => toggle("stoneType", st)} />)}
          </div>
        </FilterGroup>
      )}
      {opts.shapes.length > 0 && (
        <FilterGroup label="Shape / Cut">
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {opts.shapes.map(sh => <Pill key={sh} label={sh} active={filters.shape === sh} onClick={() => toggle("shape", sh)} />)}
          </div>
        </FilterGroup>
      )}
      {opts.certLabs.length > 0 && (
        <FilterGroup label="Certificate Lab">
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {opts.certLabs.map(cl => <Pill key={cl} label={cl} active={filters.certLab === cl} onClick={() => toggle("certLab", cl)} />)}
          </div>
        </FilterGroup>
      )}
      {opts.intendedUses.length > 0 && (
        <FilterGroup label="Intended Use">
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
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
  );

  return (
    <div>
      {/* ── Search bar + controls ── */}
      <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ flex:"1 1 220px", position:"relative", minWidth:0 }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:15, pointerEvents:"none", color:C.chl }}>🔍</span>
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="חיפוש: מק״ט, תיאור, סוג אבן, צבע, ניקיון, מעבדה, מספר תעודה, ספק…"
            dir="rtl"
            style={{ width:"100%", height:44, border:"1px solid rgba(54,69,79,0.2)", borderRadius:9, background:"#fff", paddingRight:14, paddingLeft:38, fontFamily:HEB, fontSize:13.5, color:C.ch, outline:"none", boxSizing:"border-box", transition:"border-color 0.14s, box-shadow 0.14s" }}
            onFocus={(e) => { e.currentTarget.style.borderColor=C.gd; e.currentTarget.style.boxShadow="0 0 0 3px rgba(197,179,88,0.13)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor="rgba(54,69,79,0.2)"; e.currentTarget.style.boxShadow="none"; }}
          />
          {searchText && (
            <button onClick={() => setSearchText("")} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.chl, fontSize:16, lineHeight:1 }}>✕</button>
          )}
        </div>

        <button
          onClick={() => setPanelOpen(!panelOpen)}
          style={{ height:44, padding:"0 16px", border:`1.5px solid ${panelOpen || activeCount>0 ? C.gd : "rgba(54,69,79,0.2)"}`, borderRadius:9, background:panelOpen?"rgba(197,179,88,0.08)":"transparent", color:panelOpen || activeCount>0 ?"#7a6a1a":C.chm, fontFamily:DAT, fontSize:12.5, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:7, whiteSpace:"nowrap" }}
        >
          <span>⊞ מסננים</span>
          {activeCount > 0 && (
            <span style={{ background:C.gd, color:"#fff", borderRadius:10, padding:"1px 7px", fontSize:10, fontWeight:700 }}>{activeCount}</span>
          )}
        </button>

        {(activeCount > 0 || searchText) && (
          <button
            onClick={clearAll}
            style={{ height:44, padding:"0 14px", border:"1px solid rgba(176,64,64,0.3)", borderRadius:9, background:"rgba(176,64,64,0.06)", color:"#b04040", fontFamily:HEB, fontSize:12, cursor:"pointer", whiteSpace:"nowrap" }}
          >
            × איפוס
          </button>
        )}
      </div>

      {/* ── Active filter chips ── */}
      {activeCount > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:10 }}>
          {activeEntries.map(([key, val]) => (
            <span key={key} style={{ display:"inline-flex", alignItems:"center", gap:6, height:26, padding:"0 6px 0 10px", borderRadius:13, background:"rgba(197,179,88,0.12)", border:"1px solid rgba(197,179,88,0.4)", fontFamily:DAT, fontSize:11, color:"#6a5a10", whiteSpace:"nowrap" }}>
              {FILTER_LABELS[key] || key}: <strong style={{ fontWeight:700 }}>{chipValue(key, val)}</strong>
              <button onClick={() => clearOne(key)} style={{ background:"none", border:"none", cursor:"pointer", color:"#6a5a10", fontSize:13, lineHeight:1, padding:0 }}>✕</button>
            </span>
          ))}
        </div>
      )}

      {/* ── Filter panel ── */}
      {panelOpen && !isMobile && (
        <div style={{ background:"#fff", border:"1px solid rgba(54,69,79,0.12)", borderRadius:11, padding:"18px 20px", marginTop:14 }}>
          {PanelBody}
        </div>
      )}

      {/* ── Mobile bottom sheet ── */}
      {panelOpen && isMobile && (
        <div style={{ position:"fixed", inset:0, zIndex:1500, display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
          <div onClick={() => setPanelOpen(false)} style={{ position:"absolute", inset:0, background:"rgba(54,69,79,0.5)" }} />
          <div style={{ position:"relative", background:C.iv, borderTopLeftRadius:16, borderTopRightRadius:16, maxHeight:"82vh", overflowY:"auto", boxShadow:"0 -8px 30px rgba(54,69,79,0.3)" }}>
            <div style={{ position:"sticky", top:0, background:C.iv, padding:"14px 18px 10px", borderBottom:"1px solid rgba(54,69,79,0.1)", display:"flex", alignItems:"center", justifyContent:"space-between", zIndex:1 }}>
              <span style={{ fontFamily:HEB, fontSize:15, fontWeight:700, color:C.ch }}>מסננים</span>
              <div style={{ display:"flex", gap:8 }}>
                {(activeCount > 0 || searchText) && (
                  <button onClick={clearAll} style={{ height:34, padding:"0 12px", border:"1px solid rgba(176,64,64,0.3)", borderRadius:7, background:"rgba(176,64,64,0.06)", color:"#b04040", fontFamily:HEB, fontSize:12, cursor:"pointer" }}>איפוס</button>
                )}
                <button onClick={() => setPanelOpen(false)} style={{ height:34, padding:"0 16px", border:"none", borderRadius:7, background:C.ch, color:C.iv, fontFamily:HEB, fontSize:12.5, fontWeight:700, cursor:"pointer" }}>סגור</button>
              </div>
            </div>
            <div style={{ padding:"16px 18px 28px" }}>
              {PanelBody}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── applyFilters ─────────────────────────────────────────────────────────────
// ─── buildSearchString ────────────────────────────────────────────────────────
/**
 * v5.5.1: Builds one robust, lower-cased searchable string per item so search
 * works on normalized + formatted values — not only what is visible on a card.
 *
 * Includes, when present:
 *   • identity / text fields (sku, name, types, color, clarity, lab, supplier,
 *     owner, shape, cut form, notes, memo, location, growth method, etc.)
 *   • carat in several forms so "0.5" and "0.50" both match a 0.50 ct stone:
 *       raw caratWeight, fixed(2), fixed(1), stripped-trailing-zero
 *   • total carat (caratWeight, already the total) and average stone weight
 *     (caratWeight / stoneCount) in the same numeric variants
 *   • cost as plain number and with separators
 *
 * Numbers are matched on substrings, so "0.5" matches "0.50" and "1" matches
 * "1.02". A normalized variant set avoids missing "0.5" vs "0.50".
 */
function caratVariants(value) {
  const n = parseFloat(value);
  if (!isFinite(n) || n <= 0) return [];
  const out = new Set();
  out.add(String(value));                 // raw, e.g. "0.50"
  out.add(String(n));                      // numeric, e.g. "0.5"
  out.add(n.toFixed(2));                   // "0.50"
  out.add(n.toFixed(1));                   // "0.5"
  out.add(n.toFixed(3));                   // "0.500"
  out.add(n.toFixed(2).replace(/\.?0+$/, "")); // trimmed "0.5" / "1"
  return [...out];
}

export function buildSearchString(item) {
  if (!item) return "";
  const parts = [];

  // Flatten all primitive string/number fields present on the item.
  for (const key of Object.keys(item)) {
    const v = item[key];
    if (v == null) continue;
    if (typeof v === "string" || typeof v === "number") {
      // skip pure media/URL noise from search to keep matches meaningful
      if (/^https?:\/\//i.test(String(v))) continue;
      parts.push(String(v));
    }
  }

  // Carat: total (caratWeight is the total) + average per stone.
  const total = parseFloat(item.caratWeight);
  const count = parseInt(item.stoneCount, 10) || 1;
  if (isFinite(total) && total > 0) {
    parts.push(...caratVariants(total));
    parts.push("ct", "carat", "קראט");
    if (count > 1) {
      const avg = total / count;
      parts.push(...caratVariants(avg));
    }
  }

  // Cost: plain and grouped.
  const cost = Number(item.costUsd);
  if (isFinite(cost) && cost > 0) {
    parts.push(String(cost));
    parts.push(cost.toLocaleString("en-US"));
  }

  // Cert number aliases.
  if (item.certNumber)       parts.push(String(item.certNumber));
  if (item.laserInscription) parts.push(String(item.laserInscription));

  return parts.join(" ").toLowerCase();
}

// ─── applyFilters ─────────────────────────────────────────────────────────────
export function applyFilters(items, searchText, filters) {
  let result = items;

  if (searchText && searchText.trim()) {
    // Support multi-token search: every whitespace-separated token must match.
    const tokens = searchText.toLowerCase().trim().split(/\s+/).filter(Boolean);
    result = result.filter(item => {
      const hay = buildSearchString(item);
      return tokens.every(t => hay.includes(t));
    });
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
