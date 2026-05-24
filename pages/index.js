import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Calculator, Gem, FileText, ChevronDown, X, Printer, RotateCcw, Search, Plus, Minus, AlertCircle, LayoutGrid, List, ImageIcon, Pencil, Lock, FileCheck, Package, ClipboardList, Eye, Database, Share2, Download, ShieldCheck, DollarSign, Star, GripVertical } from "lucide-react";

/* ── CONSTANTS & SYSTEM ── */
const C = { 
  iv: "#FAF9F6", iv2: "#F0EDE8", iv3: "#E5E0D5", 
  ch: "#36454F", chm: "#4a5c68", chl: "#7a8e98", chx: "#a8bcc4", 
  gd: "#8A9A86", gdm: "#72826e", gds: "rgba(138, 154, 134, 0.12)", 
  bl: "rgba(54,69,79,0.10)", blm: "rgba(54,69,79,0.18)", 
  serif: "'Merriweather','Times New Roman',Georgia,serif", 
  heb: "'Assistant','Heebo',Arial,sans-serif", 
  eng: "'DM Sans',Helvetica,Arial,sans-serif" 
};

const r2 = n => Math.round(n * 100) / 100;
const fmtD = () => new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date());
const ovr = (o, n) => o !== "" && o !== null && o !== undefined ? (parseFloat(o) || 0) : n;
const uid = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const formatMoney = (v, currency) => (currency === "ILS" ? "₪" : "$") + new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round((v || 0) * (currency === "ILS" ? 3.75 : 1)));

/* ── DATA & TABLES ── */
const METALS = ["18K Yellow", "18K White", "18K Rose", "14K Yellow", "14K White", "14K Rose", "Platinum 950"];
const PURITY = { "18K Yellow": 0.75, "18K White": 0.75, "18K Rose": 0.75, "14K Yellow": 0.585, "14K White": 0.585, "14K Rose": 0.585, "Platinum 950": 0.95 };
const ALLOYS = { "18K Yellow": 1.8, "18K White": 4.2, "18K Rose": 2.1, "14K Yellow": 1.5, "14K White": 3.8, "14K Rose": 1.8, "Platinum 950": 2.5 };
const MSPOT = { "18K Yellow": 62.4, "18K White": 62.4, "18K Rose": 62.4, "14K Yellow": 62.4, "14K White": 62.4, "14K Rose": 62.4, "Platinum 950": 31.6 };
const CASTS = ["CAD / Casting", "Lost Wax Casting", "Hand Fabrication", "Die Striking"];
const CLOSS = { "CAD / Casting": 0.08, "Lost Wax Casting": 0.12, "Hand Fabrication": 0.05, "Die Striking": 0.03 };
const CMULT = { Simple: 1.0, Medium: 1.35, Complex: 1.70, Bespoke: 2.20 };
const CHEB = { Simple: "פשוט", Medium: "בינוני", Complex: "מורכב", Bespoke: "ייחודי" };
const STYPES = ["Diamond", "Sapphire", "Ruby", "Emerald", "Alexandrite", "Other"];
const SBASE = { Diamond: 2800, Sapphire: 1200, Ruby: 1500, Emerald: 900, Alexandrite: 3500, Other: 300 };
const CFACT = { D: 1.80, E: 1.65, F: 1.50, G: 1.30, H: 1.15, I: 1.00, J: 0.88, K: 0.75 };
const KFACT = { IF: 2.00, VVS1: 1.70, VVS2: 1.55, VS1: 1.35, VS2: 1.20, SI1: 1.00, SI2: 0.85, I1: 0.65 };
const SET_ENG = ["Prong / Claw", "Pavé", "Burnish", "Bezel"];
const SET_RATE = { "Prong / Claw": 14, "Pavé": 3.5, "Burnish": 8.5, "Bezel": 16 };
const SPECIES = { Diamond: "Natural Diamond", Sapphire: "Natural Corundum", Ruby: "Natural Corundum", Emerald: "Natural Beryl", Alexandrite: "Natural Chrysoberyl", Other: "" };
const MU = { ws: 2.30, rx: 1.65, vat: 0.18 };

const INIT_STONES = [
  { id: "s01", sku: "DIA-RND-210", nH: "יהלום עגול 2.10ct", nE: "Round Brilliant 2.10ct", type: "Diamond", tH: "יהלום", shape: "Round", sH: "עגול", ct: 2.10, color: "G", cla: "VS1", cost: 15200, img: null },
  { id: "s02", sku: "DIA-OVL-180", nH: "יהלום אובל 1.80ct", nE: "Oval Diamond 1.80ct", type: "Diamond", tH: "יהלום", shape: "Oval", sH: "אובל", ct: 1.80, color: "F", cla: "VVS2", cost: 18400, img: null },
  { id: "s03", sku: "DIA-CSH-302", nH: "יהלום כרית 3.02ct", nE: "Cushion Diamond 3.02ct", type: "Diamond", tH: "יהלום", shape: "Cushion", sH: "כרית", ct: 3.02, color: "D", cla: "IF", cost: 68000, img: null },
  { id: "s04", sku: "DIA-PER-121", nH: "יהלום טיפה 1.21ct", nE: "Pear Diamond 1.21ct", type: "Diamond", tH: "יהלום", shape: "Pear", sH: "טיפה", ct: 1.21, color: "H", cla: "SI1", cost: 4850, img: null }
];

/* ── LOGIC ENGINE ── */
function estStone(type, ct, color, clarity) { 
  return r2((SBASE[type] ?? 300) * Math.pow(parseFloat(ct) || 1, 1.8) * (type === "Diamond" ? (CFACT[color] ?? 1) : 1) * (type === "Diamond" ? (KFACT[clarity] ?? 1) : 1)); 
}

function calcCenter(cfg) {
  if (cfg.stoneMode === "real" && cfg.stone) return cfg.stone.cost;
  if (cfg.centerManual !== "") return cfg.centerPriceMode === "per_carat" ? r2((parseFloat(cfg.centerManual) || 0) * (parseFloat(cfg.centerCt) || 1)) : (parseFloat(cfg.centerManual) || 0);
  return estStone(cfg.centerType, cfg.centerCt, cfg.centerColor, cfg.centerClarity);
}

function calcSS(type, ct, count, manual, mode, realStone, priceMode) {
  if (mode === "real" && realStone) return realStone.cost;
  const n = parseInt(count) || 0; if (!n) return 0;
  if (manual !== "") return priceMode === "per_carat" ? r2((parseFloat(manual) || 0) * (parseFloat(ct) || 0.01) * n) : (parseFloat(manual) || 0);
  return r2(n * estStone(type, ct, "G", "VS1"));
}

function matchScore(target, cand) {
  if (!target || target.id === cand.id || target.type !== cand.type) return 0;
  const diff = Math.abs(target.ct - cand.ct); if (diff > 0.20) return 0;
  let s = diff <= 0.05 ? 40 : diff <= 0.10 ? 28 : 14;
  if (target.shape === cand.shape) s += 30;
  if (target.type === "Diamond") {
    const g = ["D", "E", "F", "G", "H", "I", "J", "K"], ti = g.indexOf(target.color), ci = g.indexOf(cand.color);
    if (ti !== -1 && ci !== -1) { if (ti === ci) s += 20; else if (Math.abs(ti - ci) <= 1) s += 8; }
  }
  if (target.cla === cand.cla) s += 10;
  return Math.min(s, 100);
}

function sBadge(s) {
  if (s >= 80) return { l: "מצוינת", bg: "rgba(138,154,134,0.18)", c: C.gdm };
  if (s >= 60) return { l: "טובה", bg: "rgba(90,160,100,0.13)", c: "#4a8e56" };
  if (s >= 30) return { l: "חלשה", bg: C.iv3, c: C.chl }; 
  return null;
}

function gemInsight(data) {
  if (!data || !data.type) return "";
  const ct = parseFloat(data.ct) || 0;
  if (data.type === "Diamond") return `This ${ct ? ct + "ct " : ""}${data.shape || ""} diamond exhibits ${data.color ? data.color + "-color" : "fine"} coloration with ${data.cla || ""} clarity.`;
  return `This ${ct ? ct + "ct " : ""}${data.shape || ""} ${data.type} displays characteristic coloration.`;
}

function calc(cfg) {
  const wg = parseFloat(cfg.grams) || 0; if (!wg) return null;
  const gw = r2(wg * (1 + (CLOSS[cfg.cast] ?? 0.08)));
  const base_mc = gw * ((MSPOT[cfg.metal] ?? 62.4) * (PURITY[cfg.metal] ?? 0.75) + (ALLOYS[cfg.metal] ?? 1.8));
  let mc_nat = r2(base_mc), mc = mc_nat;
  if (cfg.mcOv !== "") mc = cfg.metalPriceMode === "per_gram" ? r2((parseFloat(cfg.mcOv) || 0) * wg) : (parseFloat(cfg.mcOv) || 0);
  const lc_nat = r2(((SET_RATE[cfg.centerSetting] ?? 14) + (parseInt(cfg.ss1Count) || 0) * (SET_RATE[cfg.ss1Setting] ?? 3.5) + (parseInt(cfg.ss2Count) || 0) * (SET_RATE[cfg.ss2Setting] ?? 3.5)) * (CMULT[cfg.cmplx] ?? 1));
  const lc = ovr(cfg.lcOv, lc_nat);
  const sc = calcCenter(cfg);
  const ss1 = calcSS(cfg.ss1Type, cfg.ss1Ct, cfg.ss1Count, cfg.ss1Manual, cfg.ss1Mode, cfg.ss1Stone, cfg.ss1PriceMode);
  const ss2 = calcSS(cfg.ss2Type, cfg.ss2Ct, cfg.ss2Count, cfg.ss2Manual, cfg.ss2Mode, cfg.ss2Stone, cfg.ss2PriceMode);
  const compCost = r2((cfg.selectedComponents || []).reduce((s, c) => s + (c.cost || 0), 0));
  const stones = r2(sc + ss1 + ss2);
  const oh = r2((mc + lc) * 0.18);
  const prod_nat = r2(mc + lc + stones + compCost + oh), prod = ovr(cfg.prodOv, prod_nat);
  const ws_nat = r2(prod * MU.ws), ws = ovr(cfg.wsOv, ws_nat);
  const rx_nat = r2(ws * MU.rx), rx = ovr(cfg.rxOv, rx_nat);
  const ri_nat = r2(rx * (1 + MU.vat)), ri = ovr(cfg.riOv, ri_nat);
  return { mc, lc, sc, ss1, ss2, compCost, stones, oh, prod, ws, rx, ri, gw, mc_nat, lc_nat, prod_nat, ws_nat, rx_nat, ri_nat };
}

/* ── UI HELPERS ── */
const GR = ({ soft, my = 0 }) => <div style={{ height: "0.5px", background: soft ? "rgba(138, 154, 134, 0.2)" : C.gd, marginTop: my, marginBottom: my }} />;
const EB = ({ dark, s = {}, children }) => <div style={{ fontFamily: C.heb, fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", color: dark ? C.ch : C.chl, marginBottom: 5, ...s }}>{children}</div>;
const Divider = () => <div style={{ height: "1px", background: C.bl, margin: "16px 0" }} />;

function Pills({ opts, val, onChange }) {
  return (<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
    {opts.map(([v, l]) => (<button key={v} onClick={() => onChange(v)} style={{ fontFamily: C.heb, fontSize: 13, cursor: "pointer", color: val === v ? C.iv : C.chm, background: val === v ? C.ch : "transparent", border: `0.5px solid ${val === v ? C.ch : C.blm}`, padding: "8px 16px", transition: "all 0.12s", borderRadius: 4 }}>{l}</button>))}
  </div>);
}

function ImgDrop({ img, onImg, h = 90, label = "לחץ או גרור תמונה", small, className }) {
  const [hov, setHov] = useState(false); const ref = useRef();
  function handle(file) { if (!file || !file.type.startsWith("image/")) return; const r = new FileReader(); r.onload = e => onImg(e.target.result); r.readAsDataURL(file); }
  return (
    <div className={className} onDragOver={e => { e.preventDefault(); setHov(true); }} onDragLeave={() => setHov(false)} onDrop={e => { e.preventDefault(); setHov(false); handle(e.dataTransfer.files[0]); }} onClick={() => ref.current?.click()} style={{ height: h, background: img ? "transparent" : hov ? C.iv3 : C.iv2, border: `0.5px dashed ${hov ? C.blm : C.bl}`, cursor: "pointer", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>
      {img ? (<><img src={img} style={{ width: "100%", height: "100%", objectFit: "contain" }} /><button onClick={e => { e.stopPropagation(); onImg(null); }} style={{ position: "absolute", top: 6, right: 6, background: "rgba(54,69,79,0.7)", border: "none", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}><X size={12} /></button></>) : (<><ImageIcon size={small ? 16 : 22} color={C.chx} strokeWidth={1.2} /><span style={{ fontFamily: C.heb, fontSize: small ? 11 : 12, color: C.chx, marginTop: 4 }}>{label}</span></>)}
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handle(e.target.files[0])} />
    </div>
  );
}

function Sel({ label, opts, half, value, onChange }) {
  return (<div style={{ display: "flex", flexDirection: "column", gap: 4, width: half ? "50%" : "100%" }}>
    {label && <EB>{label}</EB>}
    <div style={{ position: "relative" }}>
      <select value={value} onChange={onChange} style={{ fontFamily: C.heb, fontSize: 14, color: C.ch, background: C.iv2, border: `0.5px solid ${C.blm}`, padding: "10px 12px 10px 28px", outline: "none", appearance: "none", width: "100%", borderRadius: 4 }}>{opts.map(o => <option key={o} value={o}>{o}</option>)}</select>
      <ChevronDown size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.chl, pointerEvents: "none" }} />
    </div>
  </div>);
}

function Inp({ label, half, value, onChange, placeholder, readOnly, type = "text" }) {
  return (<div style={{ display: "flex", flexDirection: "column", gap: 4, width: half ? "50%" : "100%" }}>
    {label && <EB>{label}</EB>}
    <input type={type} inputMode={type === "number" ? "decimal" : "text"} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly} style={{ fontFamily: C.heb, fontSize: 14, color: C.ch, background: readOnly ? C.gds : C.iv2, border: `0.5px solid ${readOnly ? "rgba(138, 154, 134, 0.3)" : C.blm}`, padding: "10px 12px", outline: "none", width: "100%", borderRadius: 4 }} />
  </div>);
}

function ModeToggle({ mode, setMode, lblTotal, lblUnit }) {
  return (
    <div style={{ display: "flex", border: `1px solid ${C.blm}`, borderRadius: 4, overflow: "hidden", marginTop: 4 }}>
      <button onClick={() => setMode("total")} style={{ flex: 1, fontFamily: C.heb, fontSize: 11, cursor: "pointer", color: mode === "total" ? C.iv : C.chm, background: mode === "total" ? C.ch : C.iv, border: "none", padding: "4px 0" }}>{lblTotal}</button>
      <button onClick={() => setMode("per_unit")} style={{ flex: 1, fontFamily: C.heb, fontSize: 11, cursor: "pointer", color: mode === "per_unit" ? C.iv : C.chm, background: mode === "per_unit" ? C.ch : C.iv, border: "none", padding: "4px 0" }}>{lblUnit}</button>
    </div>
  );
}

function Pnl({ num, title, children }) {
  return (<div style={{ border: `0.5px solid ${C.bl}`, marginBottom: 16, background: C.iv, borderRadius: 4 }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "12px 16px 11px", borderBottom: `0.5px solid ${C.bl}` }}>
      <span style={{ fontFamily: C.eng, fontSize: 10, color: C.gdm, letterSpacing: "0.15em" }}>{num}</span>
      <span style={{ fontFamily: C.heb, fontSize: 14, fontWeight: 600, color: C.ch }}>{title}</span>
    </div>
    <div style={{ padding: "16px" }}>{children}</div>
  </div>);
}

/* ── CERTIFICATES (PRINT TEMPLATES) ── */
function QuoteCert({ cfg, res, pieceImg, currency }) {
  const qref = useMemo(() => { const d = new Date(); return `QT-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${(cfg.clientName || "DRAFT").replace(/\s+/g, "-").toUpperCase().slice(0, 10)}`; }, [cfg.clientName]);
  const cDesc = cfg.stoneMode === "real" && cfg.stone ? `${cfg.stone.ct}ct ${cfg.stone.type}, ${cfg.stone.color}, ${cfg.stone.cla} · ${cfg.centerSetting}` : `${cfg.centerCt}ct ${cfg.centerType}${cfg.centerType === "Diamond" ? `, ${cfg.centerColor} color, ${cfg.centerClarity} clarity` : ""} · ${cfg.centerSetting}`;
  const comps = (cfg.selectedComponents || []);
  const Row = ({ l, v, first, it }) => (!v ? null : (
    <div style={{ display: "flex", padding: "14px 0", borderTop: first ? `0.5px solid rgba(138, 154, 134, 0.25)` : "none", borderBottom: `0.5px solid rgba(138, 154, 134, 0.15)`, position: "relative", zIndex: 2 }}>
      <div style={{ fontFamily: C.eng, fontSize: 10, fontWeight: 600, color: C.chl, letterSpacing: "0.1em", width: "35%", textTransform: "uppercase" }}>{l}</div>
      <div style={{ fontFamily: C.serif, fontSize: 13, fontWeight: 300, fontStyle: it ? "italic" : "normal", color: it ? C.chm : C.ch, flex: 1, lineHeight: 1.6 }}>{v}</div>
    </div>
  ));
  return (
    <div dir="ltr" className="a4-page" style={{ fontFamily: C.eng, background: C.iv, padding: "55px", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden", minHeight: "1000px" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: 480, fontFamily: C.serif, color: C.gd, opacity: 0.02, pointerEvents: "none", zIndex: 0 }}>L</div>
      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 35 }}>
          <div>
            <div style={{ width: 22, height: 22, border: `1px solid ${C.gd}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}><span style={{ fontFamily: C.serif, fontSize: 11, color: C.gd }}>L</span></div>
            <div style={{ fontFamily: C.serif, fontSize: 22, fontWeight: 300, color: C.ch, letterSpacing: 8, lineHeight: 1 }}>LESHEM.S</div>
          </div>
          <div style={{ textAlign: "right" }}><div style={{ fontFamily: C.eng, fontSize: 9, color: C.chl, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 4 }}>Quotation</div><div style={{ fontFamily: C.eng, fontSize: 12, fontWeight: 500, color: C.ch }}>{qref}</div></div>
        </div>
        <GR />
        <div style={{ display: "flex", justifyContent: "space-between", margin: "25px 0 35px" }}>
          <div><div style={{ fontFamily: C.eng, fontSize: 9, color: C.chl, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 4 }}>Prepared For</div><div style={{ fontFamily: C.serif, fontSize: 14, fontWeight: 300, color: C.ch }}>{cfg.clientName || "—"}</div></div>
          <div style={{ textAlign: "right" }}><div style={{ fontFamily: C.eng, fontSize: 9, color: C.chl, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 4 }}>Date of Issue</div><div style={{ fontFamily: C.serif, fontSize: 14, fontWeight: 300, color: C.ch }}>{fmtD()}</div></div>
        </div>
        {pieceImg && <div style={{ width: "100%", height: 260, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 45, position: "relative" }}><img src={pieceImg} alt="piece" style={{ width: "100%", height: "100%", objectFit: "contain" }} /></div>}
        <div style={{ marginBottom: 10, fontFamily: C.eng, fontSize: 9, color: C.chl, letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600 }}>Piece Specification</div>
        <Row first l="Metal Matrix" v={cfg.metal} />
        <Row l="Gross Weight" v={cfg.grams ? `${cfg.grams}g  (${res?.gw ?? cfg.grams}g allocation)` : ""} />
        <Row l="Center Core" v={cDesc} />
        {(parseInt(cfg.ss1Count) || 0) > 0 && <Row l="Accent Melee I" v={`${cfg.ss1Count} × ${cfg.ss1Ct}ct ${cfg.ss1Type}`} />}
        {(parseInt(cfg.ss2Count) || 0) > 0 && <Row l="Accent Melee II" v={`${cfg.ss2Count} × ${cfg.ss2Ct}ct ${cfg.ss2Type}`} />}
        {comps.length > 0 && <Row l="Additional Layout" v={comps.map(c => c.name).join(", ")} />}
        {cfg.quoteName && <Row l="Design Concept" v={cfg.quoteName} />}
        {cfg.notes && <Row l="Artisanal Notes" v={cfg.notes} it />}
      </div>
      <div style={{ marginTop: 40, position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", border: `0.5px solid rgba(138, 154, 134, 0.4)`, background: "rgba(138, 154, 134, 0.05)", marginBottom: 15 }}>
          <div><div style={{ fontFamily: C.eng, fontSize: 9, color: C.chl, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 4 }}>Total Value Estimate</div><div style={{ fontFamily: C.eng, fontSize: 10, color: C.chx }}>Includes Premium Fabrication & VAT</div></div>
          <div style={{ textAlign: "right" }}><div style={{ fontFamily: C.serif, fontSize: 32, fontWeight: 300, color: C.ch, lineHeight: 1 }}>{res ? formatMoney(res.ri, currency) : "—"}</div></div>
        </div>
        <div style={{ fontFamily: C.eng, fontSize: 8.5, color: C.chl, lineHeight: 1.8, marginBottom: 30, maxWidth: 600 }}>This valuation is a custom commercial calculation based on precise precious metal market indices and gemological criteria. Prices reflect initial engineering specs and are valid for 7 days.</div>
        <GR soft />
        <div style={{ marginTop: 25, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div><div style={{ borderBottom: `0.5px solid ${C.chm}`, marginBottom: 6, width: 140, opacity: 0.3 }} /><div style={{ fontFamily: C.serif, fontSize: 12, fontStyle: "italic", color: C.ch }}>Leshem Simon</div><div style={{ fontFamily: C.eng, fontSize: 8.5, color: C.chl, letterSpacing: "1px", textTransform: "uppercase", opacity: 0.7 }}>Founder & Expert Jeweler</div></div>
          <div style={{ textAlign: "right", fontFamily: C.eng, fontSize: 8.5, color: C.chl, opacity: 0.6, lineHeight: 1.6 }}>LESHEM.S Studio | Tuval St 23, Ramat Gan<br />VAT Registration ID: 046240016</div>
        </div>
      </div>
    </div>
  );
}

function StoneCert({ data }) {
  const [imgs, setImgs] = useState([null, null, null]);
  const setImg = (i, v) => setImgs(p => { const n = [...p]; n[i] = v; return n; });
  const filledImgs = imgs.filter(Boolean).length;
  const insight = gemInsight(data);
  const DR = ({ l, v, accent }) => (!v ? null : (
    <div style={{ display: "flex", borderBottom: `0.5px solid rgba(138, 154, 134, 0.15)`, padding: "11px 0", alignItems: "baseline", position: "relative", zIndex: 2 }}>
      <div style={{ fontFamily: C.eng, fontSize: 9, fontWeight: 600, color: C.chl, letterSpacing: "0.05em", textTransform: "uppercase", width: "42%", flexShrink: 0 }}>{l}</div>
      <div style={{ fontFamily: accent ? C.serif : C.eng, fontSize: accent ? 15 : 12, fontWeight: accent ? 300 : 400, color: accent ? C.ch : C.chm }}>{v}</div>
    </div>
  ));
  return (
    <div dir="ltr" className="a4-page" style={{ fontFamily: C.eng, background: C.iv, boxSizing: "border-box", minHeight: "1000px", display: "flex", flexDirection: "column", justifyContent: "space-between", border: `1px solid rgba(138, 154, 134, 0.25)`, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "55%", left: "50%", transform: "translate(-50%, -50%)", fontSize: 500, fontFamily: C.serif, color: C.gd, opacity: 0.02, pointerEvents: "none", zIndex: 0 }}>L</div>
      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ background: C.ch, padding: "22px 35px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}><div style={{ width: 18, height: 18, border: `1px solid ${C.gd}`, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontFamily: C.serif, fontSize: 9, color: C.gd }}>L</span></div><span style={{ fontFamily: C.serif, fontSize: 16, fontWeight: 300, color: "#E8E4DC", letterSpacing: 5 }}>LESHEM.S</span></div><div style={{ fontFamily: C.eng, fontSize: 8, color: C.gd, letterSpacing: "3px", textTransform: "uppercase" }}>Gemological Report</div></div>
            <div style={{ textAlign: "right" }}><div style={{ fontFamily: C.eng, fontSize: 8, color: "rgba(138, 154, 134, 0.6)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 2 }}>Report Code</div><div style={{ fontFamily: C.eng, fontSize: 12, fontWeight: 500, color: C.gd }}>{data.rptNum}</div></div>
          </div>
        </div>
        <div style={{ background: "rgba(240,237,232,0.8)", padding: "10px 35px", borderBottom: `0.5px solid rgba(138, 154, 134, 0.2)`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: C.eng, fontSize: 9, color: C.ch, letterSpacing: "1.5px", textTransform: "uppercase" }}>Laboratory Assessment Analysis</div><div style={{ fontFamily: C.eng, fontSize: 10, fontWeight: 600, color: C.gdm }}>{(data.type || "").toUpperCase()}</div>
        </div>
        <div style={{ display: "flex", padding: "35px 35px" }}>
          <div style={{ width: "40%", paddingRight: 25, borderRight: `0.5px solid rgba(138, 154, 134, 0.2)`, display: "flex", flexDirection: "column", gap: 12 }}>
            {filledImgs === 0 ? (<><ImgDrop img={imgs[0]} onImg={v => setImg(0, v)} h={160} label="Primary Photo" /><div style={{ display: "flex", gap: 8 }}><div style={{ flex: 1 }}><ImgDrop img={imgs[1]} onImg={v => setImg(1, v)} h={80} label="Ref" small /></div><div style={{ flex: 1 }}><ImgDrop img={imgs[2]} onImg={v => setImg(2, v)} h={80} label="Plot" small /></div></div></>) : filledImgs === 1 ? (<ImgDrop img={imgs[0]} onImg={v => setImg(0, v)} h={260} label="Primary Photo" />) : (<></>)}
            <div style={{ padding: "12px 14px", background: "rgba(255,255,255,0.4)", border: `0.5px solid rgba(138, 154, 134, 0.3)`, marginTop: 15, borderRadius: 4 }}><div style={{ fontFamily: C.eng, fontSize: 7.5, color: C.chl, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 3 }}>Internal SKU Reference</div><div style={{ fontFamily: C.eng, fontSize: 11, fontWeight: 500, color: C.ch }}>{data.sku}</div></div>
          </div>
          <div style={{ flex: 1, paddingLeft: 30 }}>
            <div style={{ fontFamily: C.eng, fontSize: 9, color: C.gdm, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 14, borderBottom: `0.5px solid rgba(138, 154, 134, 0.2)`, paddingBottom: 6, fontWeight: 600 }}>Gemstone Dimensions</div>
            <DR l="Variety" v={data.variety || data.type} /><DR l="Mineral Species" v={data.species || (SPECIES[data.type] || "Natural Mineral")} /><DR l="Carat Weight" v={data.ct ? `${data.ct} ct` : null} accent /><DR l="Shape Cut" v={data.shape} accent /><DR l="Color Grade" v={data.color} accent /><DR l="Clarity Grade" v={data.cla} accent /><DR l="Measurements" v={data.measurements} /><DR l="Treatments" v={data.treatment || "None Detected"} />
          </div>
        </div>
        {insight && <><div style={{ height: "0.5px", background: `linear-gradient(90deg,transparent,rgba(138, 154, 134, 0.3),transparent)`, margin: "0 35px" }} /><div style={{ padding: "25px 35px" }}><div style={{ fontFamily: C.eng, fontSize: 8.5, color: C.chl, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>Gemological Statement</div><div style={{ fontFamily: C.serif, fontSize: 13, fontStyle: "italic", color: C.chm, lineHeight: 1.8 }}>{insight}</div></div></>}
      </div>
      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ height: "0.5px", background: `linear-gradient(90deg,transparent,rgba(138, 154, 134, 0.3),transparent)`, margin: "0 35px" }} />
        <div style={{ padding: "25px 35px 35px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
            <div><div style={{ borderBottom: `0.5px solid ${C.chm}`, marginBottom: 6, width: 120, opacity: 0.3 }} /><div style={{ fontFamily: C.serif, fontSize: 11, fontStyle: "italic", color: C.ch }}>Leshem Simon</div><div style={{ fontFamily: C.eng, fontSize: 8, color: C.chl, letterSpacing: "1px", textTransform: "uppercase" }}>Certified Diamond Grader</div></div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: 0.7 }}><ShieldCheck size={28} color={C.gdm} strokeWidth={1} /><div style={{ fontFamily: C.eng, fontSize: 7, color: C.gdm, letterSpacing: "1px", textTransform: "uppercase" }}>Authentic</div></div>
          </div>
          <div style={{ fontFamily: C.eng, fontSize: 7.5, color: C.chl, opacity: 0.55, lineHeight: 1.7, borderTop: `0.5px dotted rgba(54,69,79,0.2)`, paddingTop: 12 }}>This report represents the professional opinion of LESHEM.S Studio gemologists at the time of examination. It is an internal studio audit and is not a guarantee, valuation, or appraisal. LESHEM.S Studio | Tuval St 23, Ramat Gan | VAT: 046240016 | Verification ID: {data.rptNum}</div>
        </div>
      </div>
    </div>
  );
}

/* ── COMPONENT OUTSIDE BUILDER TO PREVENT FOCUS LOSS ── */
function SsBlock({ cfg, sf, typeF, ctF, countF, manualF, setF, modeF, priceModeF, stoneF, stones }) {
  const [dh, setDh] = useState(false);
  const mode = cfg[modeF]; const real = cfg[stoneF];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", border: `1px solid ${C.blm}`, borderRadius: 4, overflow: "hidden" }}>
        {[["virtual", "הערכת מחשבון"], ["real", "משיכה ממלאי"]].map(([m, l]) => (
          <button key={m} onClick={() => { sf(modeF, m); if (m === "virtual") sf(stoneF, null); }} style={{ flex: 1, fontFamily: C.heb, fontSize: 13, cursor: "pointer", color: mode === m ? C.iv : C.chl, background: mode === m ? C.ch : "transparent", border: "none", padding: "8px 0" }}>{l}</button>
        ))}
      </div>
      {mode === "virtual" ? (
        <>
          <div style={{ display: "flex", gap: 12 }} className="mobile-col">
            <Sel label="סוג אבן" half opts={STYPES} value={cfg[typeF]} onChange={e => sf(typeF, e.target.value)} />
            <Sel label="סגנון שיבוץ" half opts={SET_ENG} value={cfg[setF]} onChange={e => sf(setF, e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 12 }} className="mobile-col">
            <Inp label="קרט ממוצע לאבן" type="number" half value={cfg[ctF]} onChange={e => sf(ctF, e.target.value)} />
            <Inp label="כמות" type="number" half value={cfg[countF]} onChange={e => sf(countF, e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}><Inp label="עלות ידנית" type="number" value={cfg[manualF]} onChange={e => sf(manualF, e.target.value)} placeholder="אוטומטי" /></div>
            <div style={{ width: 120 }}><ModeToggle mode={cfg[priceModeF]} setMode={v => sf(priceModeF, v)} lblTotal="סה״כ" lblUnit="לקרט" /></div>
          </div>
        </>
      ) : (
        real ? (
          <div style={{ border: `1px solid rgba(138, 154, 134, 0.45)`, padding: "14px 16px", background: C.gds, position: "relative", borderRadius: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}><Check size={14} color={C.gdm} /><span style={{ fontFamily: C.heb, fontSize: 14, fontWeight: 600, color: C.ch }}>{real.nH}</span></div>
            <div style={{ fontFamily: C.eng, fontSize: 11, color: C.chl }}>{real.sku} · {real.ct}ct · {usd(real.cost)}</div>
            <button onClick={() => sf(stoneF, null)} style={{ position: "absolute", top: 10, right: 12, background: "transparent", border: "none", cursor: "pointer", color: C.chl }}><X size={14} /></button>
          </div>
        ) : (
          <div onDragOver={e => { e.preventDefault(); setDh(true); }} onDragLeave={() => setDh(false)} onDrop={e => { e.preventDefault(); setDh(false); const id = e.dataTransfer.getData("stoneId"); const s = stones.find(x => x.id === id); if (s) sf(stoneF, s); }} style={{ border: `1.5px dashed ${dh ? "rgba(138, 154, 134, 0.8)" : C.blm}`, background: dh ? C.gds : "transparent", padding: "16px 20px", display: "flex", alignItems: "center", gap: 10, transition: "all 0.14s", cursor: "default", borderRadius: 4 }}><GripVertical size={18} color={dh ? C.gdm : C.chx} /><span style={{ fontFamily: C.heb, fontSize: 14, color: dh ? C.gdm : C.chx }}>גרור לכאן אבן ממלאי</span></div>
        )
      )}
    </div>
  );
}

/* ── BUILDER TAB ── */
const DCFG = {
  metal: "18K Yellow", grams: "", cast: "CAD / Casting", cmplx: "Medium", stoneMode: "virtual", stone: null,
  centerType: "Diamond", centerCt: "1.00", centerColor: "G", centerClarity: "VS1", centerManual: "", centerSetting: "Prong / Claw", centerPriceMode: "total",
  ss1Type: "Diamond", ss1Ct: "0.05", ss1Count: "0", ss1Manual: "", ss1Setting: "Pavé", ss1Mode: "virtual", ss1Stone: null, ss1PriceMode: "total",
  ss2Type: "Diamond", ss2Ct: "0.03", ss2Count: "0", ss2Manual: "", ss2Setting: "Pavé", ss2Mode: "virtual", ss2Stone: null, ss2PriceMode: "total",
  selectedComponents: [], mcOv: "", metalPriceMode: "total", lcOv: "", prodOv: "", wsOv: "", rxOv: "", riOv: "",
  clientName: "", quoteName: "", notes: "",
};

function QuoteBuilder({ stones, onExport, currency }) {
  const [cfg, setCfg] = useState({ ...DCFG });
  const [pieceImg, setPieceImg] = useState(null);
  const [mainDrop, setMD] = useState(false);
  const sf = useCallback((f, v) => setCfg(p => ({ ...p, [f]: v })), []);
  const res = useMemo(() => calc(cfg), [cfg]);

  return (
    <div style={{ height: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden" }} className="mobile-grid">
      <div style={{ borderLeft: `0.5px solid ${C.bl}`, overflowY: "auto", padding: "20px 24px 40px" }}>
        
        <div onDragOver={e => { e.preventDefault(); setMD(true); }} onDragLeave={() => setMD(false)} onDrop={e => { e.preventDefault(); setMD(false); const id = e.dataTransfer.getData("stoneId"); const s = stones.find(x => x.id === id); if (s) setCfg(p => ({ ...p, stoneMode: "real", stone: s })); }} style={{ border: `1.5px dashed ${mainDrop ? "rgba(138, 154, 134, 0.8)" : C.blm}`, background: mainDrop ? C.gds : "transparent", padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12, transition: "all 0.15s", borderRadius: 4 }}><GripVertical size={18} color={mainDrop ? C.gdm : C.chx} /><span style={{ fontFamily: C.heb, fontSize: 14, fontWeight: 600, color: mainDrop ? C.gdm : C.chx }}>{cfg.stone && cfg.stoneMode === "real" ? `✓ שובצה: ${cfg.stone.nH}` : "גרור לכאן אבן מרכזית מהמאגר"}</span>{cfg.stone && cfg.stoneMode === "real" && <button onClick={() => setCfg(p => ({ ...p, stone: null, stoneMode: "virtual" }))} style={{ marginRight: "auto", background: "transparent", border: "none", cursor: "pointer", color: C.chl }}><X size={16} /></button>}</div>

        <Pnl num="01" title="מתכת קסטינג ועבודה">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Sel label="סוג סגסוגת" opts={METALS} value={cfg.metal} onChange={e => sf("metal", e.target.value)} />
            <div style={{ display: "flex", gap: 12 }} className="mobile-col">
              <Inp label="משקל מתוכנן (g)" type="number" half value={cfg.grams} onChange={e => sf("grams", e.target.value)} placeholder="0.00" />
              <Inp label="ערך ספוט לגרם" half value={MSPOT[cfg.metal] ?? 62.4} readOnly sx={{ background: C.gds }} />
            </div>
            <Sel label="טכנולוגיית ייצור" opts={CASTS} value={cfg.cast} onChange={e => sf("cast", e.target.value)} />
            <div>
              <EB s={{ marginBottom: 8 }}>מורכבות עבודה</EB>
              <Pills opts={Object.keys(CMULT).map(k => [k, CHEB[k]])} val={cfg.cmplx} onChange={v => sf("cmplx", v)} />
            </div>
          </div>
        </Pnl>

        <Pnl num="02" title="אבן מרכזית">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", border: `1px solid ${C.blm}`, borderRadius: 4, overflow: "hidden" }}>{[["virtual", "הערכת מחשבון"], ["real", "משיכה ממלאי"]].map(([m, l]) => (<button key={m} onClick={() => sf("stoneMode", m)} style={{ flex: 1, fontFamily: C.heb, fontSize: 13, cursor: "pointer", color: cfg.stoneMode === m ? C.iv : C.chl, background: cfg.stoneMode === m ? C.ch : "transparent", border: "none", padding: "8px 0" }}>{l}</button>))}</div>
            {cfg.stoneMode === "virtual" ? (
              <>
                <div style={{ display: "flex", gap: 12 }} className="mobile-col"><Sel label="סוג אבן חן" half opts={STYPES} value={cfg.centerType} onChange={e => sf("centerType", e.target.value)} /><Sel label="סגנון שיבוץ" half opts={SET_ENG} value={cfg.centerSetting} onChange={e => sf("centerSetting", e.target.value)} /></div>
                <div style={{ display: "flex", gap: 12 }} className="mobile-col">
                  <Inp label="משקל קרט" type="number" half value={cfg.centerCt} onChange={e => sf("centerCt", e.target.value)} />
                  <div style={{ width: "50%", display: "flex", flexDirection: "column", gap: 4 }} className="mobile-full"><Inp label="מחיר עוקף ($)" type="number" value={cfg.centerManual} onChange={e => sf("centerManual", e.target.value)} placeholder="אוטומטי" /><ModeToggle mode={cfg.centerPriceMode} setMode={v => sf("centerPriceMode", v)} lblTotal="סה״כ" lblUnit="לקרט" /></div>
                </div>
                {cfg.centerType === "Diamond" && <div style={{ display: "flex", gap: 12 }} className="mobile-col"><Inp label="צבע (D-K)" half value={cfg.centerColor} onChange={e => sf("centerColor", e.target.value)} /><Sel label="ניקיון" half opts={Object.keys(KFACT)} value={cfg.centerClarity} onChange={e => sf("centerClarity", e.target.value)} /></div>}
              </>
            ) : (cfg.stone ? (<div style={{ border: `1px solid rgba(138, 154, 134, 0.45)`, padding: "14px 18px", background: C.gds, position: "relative", borderRadius: 4 }}><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><Check size={14} color={C.gdm} /><span style={{ fontFamily: C.heb, fontSize: 16, fontWeight: 600, color: C.ch }}>{cfg.stone.nH}</span></div><div style={{ fontFamily: C.eng, fontSize: 12, color: C.chl, marginBottom: 10 }}>{cfg.stone.sku} · {cfg.stone.ct}ct · {usd(cfg.stone.cost)}</div><Sel label="שינוי סגנון שיבוץ ייעודי" opts={SET_ENG} value={cfg.centerSetting} onChange={e => sf("centerSetting", e.target.value)} sx={{ border: `1px solid rgba(138, 154, 134, 0.35)`, background: "rgba(138, 154, 134, 0.05)" }} /><button onClick={() => sf("stone", null)} style={{ position: "absolute", top: 12, right: 14, background: "transparent", border: "none", cursor: "pointer", color: C.chl }}><X size={16} /></button></div>) : (<div style={{ fontFamily: C.heb, fontSize: 14, color: C.chx, textAlign: "center", padding: "24px 14px", border: `1.5px dashed ${C.blm}`, borderRadius: 4 }}>גרור אבן ממאגר האבנים הכללי</div>))}
          </div>
        </Pnl>

        <Pnl num="03" title="אבני צד I"><SsBlock cfg={cfg} sf={sf} typeF="ss1Type" ctF="ss1Ct" countF="ss1Count" manualF="ss1Manual" setF="ss1Setting" modeF="ss1Mode" priceModeF="ss1PriceMode" stoneF="ss1Stone" stones={stones} /></Pnl>
        <Pnl num="04" title="אבני צד II"><SsBlock cfg={cfg} sf={sf} typeF="ss2Type" ctF="ss2Ct" countF="ss2Count" manualF="ss2Manual" setF="ss2Setting" modeF="ss2Mode" priceModeF="ss2PriceMode" stoneF="ss2Stone" stones={stones} /></Pnl>
        
        <Pnl num="05" title="שיוך לקוח"><Inp label="שם לקוח מלא" value={cfg.clientName} onChange={e => sf("clientName", e.target.value)} /><div style={{ height: 10 }} /><Inp label="כותרת תעודה / תיאור פריט" value={cfg.quoteName} onChange={e => sf("quoteName", e.target.value)} /></Pnl>
        <Pnl num="06" title="מדיה וצילום קטלוג"><ImgDrop img={pieceImg} onImg={setPieceImg} h={140} label="העלה או גרור תמונה של התכשיט / רנדור" /></Pnl>
      </div>

      <div style={{ overflowY: "auto", padding: "20px 24px 40px", background: "#fff" }}>
        <div style={{ padding: "20px", border: `1px solid ${C.bl}`, background: C.iv2, borderRadius: 8, marginBottom: 20 }}>
          <div style={{ fontFamily: C.eng, fontSize: 12, color: C.chl, marginBottom: 5 }}>FINAL RETAIL PRICE (INC. VAT)</div>
          <div style={{ fontFamily: C.serif, fontSize: 36, color: C.gdm, fontWeight: 600 }}>{res ? formatMoney(res.ri, currency) : "—"}</div>
        </div>

        {res && (
          <div style={{ marginBottom: 20, fontFamily: C.heb, fontSize: 14 }}>
             <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.bl}` }}><span>מתכת + עבודה</span><span style={{ fontFamily: C.eng }}>{formatMoney(res.mc_nat + res.lc_nat, "USD")}</span></div>
             <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.bl}` }}><span>אבנים (מרכזי + צד)</span><span style={{ fontFamily: C.eng }}>{formatMoney(res.sc + res.ss1 + res.ss2, "USD")}</span></div>
             <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.bl}` }}><span>מס והוצאות סטודיו קבועות</span><span style={{ fontFamily: C.eng }}>{formatMoney(res.oh, "USD")}</span></div>
             <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", fontWeight: 600, color: C.gdm }}><span>עלות ייצור כוללת (Production)</span><span style={{ fontFamily: C.eng }}>{formatMoney(res.prod, "USD")}</span></div>
          </div>
        )}

        <button onClick={() => res && onExport(cfg, res, pieceImg)} disabled={!res}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: C.heb, fontSize: 16, fontWeight: 600, color: res ? C.iv : C.chl, background: res ? C.gd : C.iv2, border: "none", padding: "16px 0", cursor: res ? "pointer" : "not-allowed", borderRadius: 4 }}>
          <FileText size={18} /> {res ? "הפק תעודת יוקרה (PDF / שיתוף)" : "הזן נתונים כדי להפיק תעודה"}
        </button>
      </div>
    </div>
  );
}

/* ═══════════ STONE BROWSER ═══════════ */
function StoneCard({ stone, score, picked, onPick, onCert, onDragStart }) {
  const [hov, setHov] = useState(false); const b = score >= 30 ? sBadge(score) : null;
  return (
    <div draggable onDragStart={e => onDragStart(stone, e)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ border: `1px solid ${picked ? "rgba(138, 154, 134, 0.8)" : hov ? C.blm : C.bl}`, padding: "14px 16px 14px 22px", marginBottom: 10, background: picked ? C.gds : C.iv, cursor: "grab", position: "relative", transition: "border-color 0.12s", borderRadius: 4 }}>
      <div style={{ position: "absolute", top: "50%", left: 6, transform: "translateY(-50%)", color: hov ? C.chx : C.iv3 }}><GripVertical size={16} /></div>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ width: 50, height: 50, minWidth: 50, background: C.iv2, border: `0.5px solid ${C.bl}`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>{stone.img ? <img src={stone.img} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Gem size={20} color={C.chx} strokeWidth={1.2} />}</div>
        <div style={{ flex: 1 }}>
          {score > 0 && <div style={{ height: 3, background: C.iv3, borderRadius: 3, overflow: "hidden", marginBottom: 6 }}><div style={{ height: "100%", width: score + "%", background: score >= 80 ? C.gd : score >= 60 ? "#6aad76" : C.chx }} /></div>}
          {score > 0 && b && <span style={{ fontFamily: C.heb, fontSize: 11, padding: "2px 6px", background: b.bg, color: b.c, display: "inline-block", marginBottom: 4, borderRadius: 2 }}>{b.l}</span>}
          <div style={{ fontFamily: C.heb, fontSize: 14, fontWeight: 600, color: C.ch, marginBottom: 3 }}>{stone.nH}</div>
          <div style={{ fontFamily: C.eng, fontSize: 11, color: C.chl }}>{stone.sku} · {stone.ct}ct · {stone.sH} · {stone.tH === "יהלום" ? `${stone.color} / ${stone.cla}` : stone.color}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <div style={{ fontFamily: C.serif, fontSize: 15, color: C.gdm, whiteSpace: "nowrap", fontWeight: 600 }}>{usd(stone.cost)}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={e => { e.stopPropagation(); onCert(stone); }} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: C.heb, fontSize: 13, cursor: "pointer", color: C.chl, background: "transparent", border: `0.5px solid ${C.bl}`, padding: "6px 12px", whiteSpace: "nowrap", borderRadius: 4 }}><FileCheck size={14} /> תעודה גמולוגית</button>
            <button onClick={() => onPick(stone)} style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: C.heb, fontSize: 12, fontWeight: 600, cursor: "pointer", color: picked ? C.chl : C.ch, background: "transparent", border: `1px solid ${picked ? C.blm : "rgba(138, 154, 134, 0.5)"}`, padding: "5px 10px", borderRadius: 4 }}>{picked ? <><Minus size={12} />נבחרה</> : <><Plus size={12} />שבץ אבן</>}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InventoryBrowser({ stones, quoteStone, onPickStone, pickedId }) {
  const [q, setQ] = useState(""); const [tf, setTF] = useState("הכול"); const [showM, setSM] = useState(false);
  const [certStone, setCertStone] = useState(null);
  const TFS = [["הכול", "הכול"], ["Diamond", "יהלום"], ["Sapphire", "ספיר"], ["Ruby", "רובי"], ["Emerald", "אמרלד"]];
  const scored = useMemo(() => stones.map(s => ({ ...s, score: matchScore(quoteStone, s) })), [stones, quoteStone]);
  const filtered = useMemo(() => {
    let r = scored; if (tf !== "הכול") r = r.filter(s => s.type === tf);
    if (q.length >= 2) r = r.filter(s => s.nH.includes(q) || s.nE.toLowerCase().includes(q.toLowerCase()) || s.sku.toLowerCase().includes(q.toLowerCase()));
    if (showM && quoteStone) r = r.filter(s => s.score >= 30);
    return r.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }, [scored, tf, q, showM, quoteStone]);
  const topM = useMemo(() => quoteStone ? scored.filter(s => s.score >= 60).sort((a, b) => b.score - a.score).slice(0, 4) : [], [scored, quoteStone]);
  function drag(s, e) { e.dataTransfer.setData("stoneId", s.id); e.dataTransfer.effectAllowed = "copy"; }
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 26px 14px", borderBottom: `0.5px solid ${C.bl}`, background: C.iv }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }} className="mobile-col">
          <div style={{ position: "relative", flex: 1 }}><Search size={16} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: C.chl }} /><input style={{ fontFamily: C.heb, fontSize: 14, color: C.ch, background: C.iv2, border: `0.5px solid ${C.blm}`, padding: "12px 40px 12px 14px", outline: "none", width: "100%", borderRadius: 4 }} placeholder="חיפוש אבנים לפי מפרט, צורה או SKU..." value={q} onChange={e => setQ(e.target.value)} /></div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: quoteStone ? 10 : 0 }}>{TFS.map(([v, l]) => (<button key={v} onClick={() => setTF(v)} style={{ fontFamily: C.heb, fontSize: 12, cursor: "pointer", color: tf === v ? C.iv : C.chm, background: tf === v ? C.ch : "transparent", border: `0.5px solid ${tf === v ? C.ch : C.blm}`, padding: "6px 14px", borderRadius: 4 }}>{l}</button>))}</div>
        {quoteStone && (<button onClick={() => setSM(v => !v)} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: C.heb, fontSize: 12, fontWeight: 600, cursor: "pointer", color: showM ? C.ch : "rgba(138, 154, 134, 0.9)", background: showM ? "rgba(138, 154, 134, 0.14)" : "transparent", border: `1px solid ${showM ? "rgba(138, 154, 134, 0.48)" : C.blm}`, padding: "8px 16px", marginTop: 10, borderRadius: 4 }}><Star size={14} fill={showM ? C.gdm : "none"} color={showM ? C.gdm : C.chm} /> סינון התאמות חכמות לפי: {quoteStone.nH}</button>)}
      </div>
      {quoteStone && topM.length > 0 && !showM && (
        <div style={{ padding: "12px 26px", background: "rgba(138, 154, 134, 0.07)", borderBottom: `0.5px solid rgba(138, 154, 134, 0.18)` }}><EB s={{ fontSize: 11, marginBottom: 6, color: C.gdm }}>אבנים תואמות להשלמת סט</EB><div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{topM.map(s => (<div key={s.id} onClick={() => onPickStone(s)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", border: `1px solid rgba(138, 154, 134, 0.35)`, background: pickedId === s.id ? C.gds : C.iv, cursor: "pointer", borderRadius: 4 }}><span style={{ fontFamily: C.heb, fontSize: 12, fontWeight: 600, color: C.ch }}>{s.nH}</span><span style={{ fontFamily: C.eng, fontSize: 10, color: C.gdm, border: `0.5px solid rgba(138, 154, 134, 0.35)`, padding: "2px 6px", borderRadius: 2 }}>{s.score}%</span></div>))}</div></div>
      )}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 26px" }}>
        <EB s={{ marginBottom: 10 }}>{filtered.length} אבנים זמינות במטריצת המלאי</EB>
        {filtered.map(s => <StoneCard key={s.id} stone={s} score={quoteStone && s.score > 0 ? s.score : 0} picked={pickedId === s.id} onPick={onPickStone} onCert={setCertStone} onDragStart={drag} />)}
      </div>
      {certStone && <StoneCertModal stone={certStone} onClose={() => setCertStone(null)} />}
    </div>
  );
}

/* ═══════════ MANUAL CERT GENERATOR ═══════════ */
function ManualCertTab() {
  const [mode, setMode] = useState("quote");
  const [modal, setModal] = useState(false);
  const [qd, setQD] = useState({ clientName: "", quoteName: "", metal: "18K Yellow", grams: "", centerCt: "", centerType: "Diamond", centerColor: "", centerClarity: "", centerSetting: "Prong / Claw", ss1Count: "0", ss2Count: "0", ss1Type: "Diamond", ss1Ct: "0.05", ss2Type: "Diamond", ss2Ct: "0.05", ss1Manual: "", ss2Manual: "", centerManual: "", stoneMode: "virtual", stone: null, notes: "", mcOv: "", lcOv: "", prodOv: "", wsOv: "", rxOv: "", riOv: "", ss1Setting: "Pavé", ss2Setting: "Pavé", ss1Mode: "virtual", ss1Stone: null, ss2Mode: "virtual", ss2Stone: null, selectedComponents: [] });
  const [sd, setSD] = useState({ sku: "", variety: "", species: "", color: "", shape: "", ct: "", measurements: "", treatment: "" });
  const sfQ = (f, v) => setQD(p => ({ ...p, [f]: v }));
  const sfS = (f, v) => setSD(p => ({ ...p, [f]: v }));
  const qRes = useMemo(() => calc(qd), [qd]);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "16px 26px 14px", borderBottom: `0.5px solid ${C.bl}`, background: C.iv }}>
        <div style={{ fontFamily: C.heb, fontSize: 18, fontWeight: 600, color: C.ch, marginBottom: 14 }}>הפקת תעודה ידנית מהירה</div>
        <div style={{ display: "flex", border: `1px solid ${C.blm}`, width: 340, maxWidth: "100%", borderRadius: 4, overflow: "hidden" }}>{[["quote", "הצעת מחיר / שומה"], ["stone", "תעודת אבן עצמאית"]].map(([m, l]) => (<button key={m} onClick={() => setMode(m)} style={{ flex: 1, fontFamily: C.heb, fontSize: 14, cursor: "pointer", color: mode === m ? C.iv : C.chl, background: mode === m ? C.ch : "transparent", border: "none", padding: "10px 0" }}>{l}</button>))}</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 26px 40px" }}>
        {mode === "quote" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 600 }}>
            <Inp label="שם לקוח" type="text" value={qd.clientName} onChange={e => sfQ("clientName", e.target.value)} />
            <Inp label="תיאור התכשיט" type="text" value={qd.quoteName} onChange={e => sfQ("quoteName", e.target.value)} />
            <div style={{ display: "flex", gap: 14 }} className="mobile-col"><Sel label="סגסוגת" half opts={METALS} value={qd.metal} onChange={e => sfQ("metal", e.target.value)} /><Inp label="משקל (g)" half type="number" value={qd.grams} onChange={e => sfQ("grams", e.target.value)} /></div>
            <div style={{ display: "flex", gap: 14 }} className="mobile-col"><Sel label="אבן מרכזית" half opts={STYPES} value={qd.centerType} onChange={e => sfQ("centerType", e.target.value)} /><Inp label="משקל קרט" half type="number" value={qd.centerCt} onChange={e => sfQ("centerCt", e.target.value)} /></div>
            <Inp label="הזן ערך מחיר סופי (₪ / $)" type="number" value={qd.riOv} onChange={e => sfQ("riOv", e.target.value)} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}><EB>הערות ומפרט חופשי</EB><textarea style={{ fontFamily: C.heb, fontSize: 14, color: C.ch, background: C.iv2, border: `0.5px solid ${C.blm}`, padding: "10px 12px", outline: "none", resize: "vertical", lineHeight: 1.6, minHeight: 70, borderRadius: 4 }} rows={4} value={qd.notes} onChange={e => sfQ("notes", e.target.value)} /></div>
            <button onClick={() => setModal(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: C.heb, fontSize: 14, fontWeight: 600, color: C.ch, background: "rgba(138, 154, 134, 0.15)", border: `1px solid rgba(138, 154, 134, 0.5)`, padding: "14px", cursor: "pointer", borderRadius: 4, marginTop: 10 }}><Eye size={18} /> תצוגה מקדימה ובדיקת שטח מת</button>
          </div>
        )}
        {mode === "stone" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 600 }}>
            <Inp label="קוד אבן (SKU)" type="text" value={sd.sku} onChange={e => sfS("sku", e.target.value)} />
            <div style={{ display: "flex", gap: 14 }} className="mobile-col"><Inp label="Variety" half value={sd.variety} onChange={e => sfS("variety", e.target.value)} /><Inp label="Species" half value={sd.species} onChange={e => sfS("species", e.target.value)} /></div>
            <div style={{ display: "flex", gap: 14 }} className="mobile-col"><Inp label="Color" half value={sd.color} onChange={e => sfS("color", e.target.value)} /><Inp label="Shape" half value={sd.shape} onChange={e => sfS("shape", e.target.value)} /></div>
            <div style={{ display: "flex", gap: 14 }} className="mobile-col"><Inp label="Carat" half type="number" value={sd.ct} onChange={e => sfS("ct", e.target.value)} /><Inp label="Measurements" half value={sd.measurements} onChange={e => sfS("measurements", e.target.value)} /></div>
            <button onClick={() => setModal(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: C.heb, fontSize: 14, fontWeight: 600, color: C.ch, background: "rgba(138, 154, 134, 0.15)", border: `1px solid rgba(138, 154, 134, 0.5)`, padding: "14px", cursor: "pointer", borderRadius: 4, marginTop: 10 }}><Eye size={18} /> הפק תעודת אבן חכמה</button>
          </div>
        )}
      </div>
      {modal && mode === "quote" && <QuoteCertModal cfg={qd} res={qRes} pieceImg={null} onClose={() => setModal(false)} />}
      {modal && mode === "stone" && <StoneCertModal stone={{ ...sd, type: sd.variety || "Other" }} onClose={() => setModal(false)} />}
    </div>
  );
}

/* ═══════════ DATA ENTRY HUB ═══════════ */
function DataEntryHub({ onAddStone }) {
  const [sF, setSF] = useState({ sku: "", type: "Diamond", shape: "Round", ct: "", color: "", cla: "", cost: "", supplier: "" });
  const sfA = (f, v) => setSF(p => ({ ...p, [f]: v }));
  function saveStone() {
    if (!sF.sku || !sF.ct) return;
    onAddStone({ id: "u" + uid(), sku: sF.sku, nH: `${sF.type} ${sF.ct}ct ${sF.shape}`, type: sF.type, shape: sF.shape, ct: parseFloat(sF.ct) || 0, color: sF.color, cla: sF.cla, cost: parseFloat(sF.cost) || 0 });
    setSF({ sku: "", type: "Diamond", shape: "Round", ct: "", color: "", cla: "", cost: "", supplier: "" });
  }
  return (
    <div style={{ padding: "24px 26px 40px", overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 650 }}>
        <div style={{ fontFamily: C.heb, fontSize: 16, fontWeight: 600, color: C.ch }}>הזנת אבני חן ויהלומים</div>
        <div style={{ display: "flex", gap: 14 }} className="mobile-col"><Inp label="מק״ט אבן (SKU) *" half value={sF.sku} onChange={e => sfA("sku", e.target.value)} /><Sel label="קטגוריית אבן *" half opts={STYPES} value={sF.type} onChange={e => sfA("type", e.target.value)} /></div>
        <div style={{ display: "flex", gap: 14 }} className="mobile-col"><Inp label="צורת אבן (Shape)" half value={sF.shape} onChange={e => sfA("shape", e.target.value)} /><Inp label="משקל קרט (Carat) *" half type="number" value={sF.ct} onChange={e => sfA("ct", e.target.value)} /></div>
        <div style={{ display: "flex", gap: 14 }} className="mobile-col"><Inp label="דירוג צבע (Color)" half value={sF.color} onChange={e => sfA("color", e.target.value)} /><Inp label="דירוג ניקיון (Clarity)" half value={sF.cla} onChange={e => sfA("cla", e.target.value)} /></div>
        <Inp label="עלות רכישה נטו ($) *" type="number" value={sF.cost} onChange={e => sfA("cost", e.target.value)} />
        <button onClick={saveStone} style={{ fontFamily: C.heb, fontSize: 14, fontWeight: 600, color: C.ch, background: "rgba(138, 154, 134, 0.15)", border: `0.5px solid rgba(138, 154, 134, 0.5)`, padding: "14px", cursor: "pointer", borderRadius: 4, marginTop: 10 }}>שמור אבן במערכת</button>
      </div>
    </div>
  );
}

/* ═══════════ MODALS ═══════════ */
function QuoteCertModal({ cfg, res, pieceImg, onClose, currency }) {
  useEffect(() => { const h = e => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [onClose]);
  return (
    <div className="modal-backdrop" style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(30, 40, 45, 0.95)", display: "flex", flexDirection: "column", alignItems: "center", overflowY: "auto", padding: "30px 16px" }}>
      <div className="no-print" style={{ width: "100%", maxWidth: 720, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ fontFamily: C.heb, fontSize: 14, color: "rgba(225,215,195,0.6)", fontWeight: 600 }}>תצוגת הצעת מחיר</span>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: C.heb, fontSize: 14, color: C.iv, background: C.gd, border: "none", padding: "10px 20px", cursor: "pointer", borderRadius: 4, fontWeight: 600 }}><Printer size={16} /> שמור כ-PDF / הדפס</button>
          <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: C.heb, fontSize: 14, color: "#fff", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", padding: "10px 16px", cursor: "pointer", borderRadius: 4 }}><X size={16} /> חזור</button>
        </div>
      </div>
      <div className="printable-container-wrapper" style={{ boxShadow: "0 32px 64px rgba(0,0,0,0.6)", width: "100%", maxWidth: 720 }}><QuoteCert cfg={cfg} res={res} pieceImg={pieceImg} currency={currency || "USD"} /></div>
    </div>
  );
}

function StoneCertModal({ stone, onClose }) {
  useEffect(() => { const h = e => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [onClose]);
  const data = useMemo(() => { const d = new Date(); return { sku: stone.sku, type: stone.type, shape: stone.shape, ct: stone.ct, color: stone.color, cla: stone.cla, variety: stone.type, species: SPECIES[stone.type] || "", measurements: stone.measurements || "—", treatment: stone.treatment || "None Detected", rptNum: `LC-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}-${stone.sku}` }; }, [stone]);
  return (
    <div className="modal-backdrop" style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(30, 40, 45, 0.95)", display: "flex", flexDirection: "column", alignItems: "center", overflowY: "auto", padding: "30px 16px" }}>
      <div className="no-print" style={{ width: "100%", maxWidth: 720, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ fontFamily: C.heb, fontSize: 14, color: "rgba(225,215,195,0.6)", fontWeight: 600 }}>תעודת אבן סטודיו</span>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: C.heb, fontSize: 14, color: C.iv, background: C.gd, border: "none", padding: "10px 20px", cursor: "pointer", borderRadius: 4, fontWeight: 600 }}><Printer size={16} /> שמור כ-PDF / הדפס</button>
          <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: C.heb, fontSize: 14, color: "#fff", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", padding: "10px 16px", cursor: "pointer", borderRadius: 4 }}><X size={16} /> סגור</button>
        </div>
      </div>
      <div className="printable-container-wrapper" style={{ boxShadow: "0 32px 64px rgba(0,0,0,0.6)", width: "100%", maxWidth: 720 }}><StoneCert data={data} /></div>
    </div>
  );
}

/* ═══════════ MAIN APP ═══════════ */
export default function App() {
  const [tab, setTab] = useState("builder");
  const [currency, setCurrency] = useState("USD");
  const [stones, setStones] = useState(INIT_STONES);
  const [modal, setModal] = useState(null);

  const handleWaShare = () => {
    const text = `*LESHEM.S Studio - הצעת מחיר*\nנשמח לעמוד לרשותך. מצורף המסמך שיצרנו עבורך.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  return (
    <div dir="rtl" className="app-container" style={{ height: "100vh", display: "flex", background: C.iv, fontFamily: C.heb }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Assistant', sans-serif; background: #FAF9F6; color: #36454F; }
        input, select, textarea { font-size: 16px !important; }
        
        @media (max-width: 768px) {
          .app-container { flex-direction: column !important; overflow-y: visible !important; height: auto !important; min-height: 100vh; display: block !important; }
          aside { width: 100% !important; min-width: 100% !important; flex-direction: row !important; align-items: center; justify-content: space-between; padding: 10px !important; }
          aside nav { display: none; }
          .mobile-col { flex-direction: column !important; }
          .mobile-full { width: 100% !important; }
          .mobile-grid { display: flex !important; flex-direction: column !important; overflow: visible !important; height: auto !important; }
          .mobile-grid > div { overflow: visible !important; height: auto !important; padding: 16px !important; border: none !important; }
        }

        /* ── STRICT PRINT LOGIC ── */
        @media print {
          @page { size: A4; margin: 0; }
          html, body, #__next { height: 100% !important; overflow: visible !important; background: white !important; margin: 0 !important; padding: 0 !important; }
          .no-print { display: none !important; }
          .app-container, main { display: none !important; }
          
          .modal-backdrop { position: absolute !important; top: 0 !important; left: 0 !important; background: transparent !important; padding: 0 !important; overflow: visible !important; display: block !important; width: 100% !important; }
          .printable-container-wrapper { display: block !important; position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; box-shadow: none !important; }
          .a4-page { display: block !important; width: 210mm !important; min-height: 297mm !important; margin: 0 auto !important; padding: 20mm !important; box-shadow: none !important; background: white !important; border: none !important; page-break-after: always; }
        }
      `}</style>
      
      <aside className="no-print" style={{ width: 220, minWidth: 220, background: C.ch, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "24px 20px 20px" }}>
          <div style={{ width: 22, height: 22, border: `1px solid ${C.gd}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}><span style={{ fontFamily: C.serif, fontSize: 10, color: C.gd }}>L</span></div>
          <div style={{ fontFamily: C.serif, fontSize: 15, color: "#E8E4DC", letterSpacing: "0.15em" }}>LESHEM.S</div>
        </div>
        <nav style={{ padding: "16px 0", flex: 1 }}>
          {[{ id: "builder", l: "מחשבון עלויות", i: Calculator }, { id: "stones", l: "מאגר מלאי", i: Gem }, { id: "data", l: "הזנת נתונים", i: Database }, { id: "manual", l: "תעודות", i: FileText }].map(t => (
            <div key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", cursor: "pointer", background: tab === t.id ? "rgba(138, 154, 134, 0.15)" : "transparent" }}>
              <t.i size={18} color={tab === t.id ? C.gd : "#5a7280"} />
              <span style={{ color: tab === t.id ? "#ddd8cc" : "#5a7280", fontSize: 15 }}>{t.l}</span>
            </div>
          ))}
        </nav>
      </aside>

      <div className="no-print" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 26px", borderBottom: `1px solid ${C.bl}`, background: C.iv }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: C.ch }}>LESHEM.S Studio</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
             <button onClick={() => setCurrency(currency === "USD" ? "ILS" : "USD")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: C.iv2, border: `1px solid ${C.bl}`, borderRadius: 20, cursor: "pointer", fontFamily: C.eng, fontWeight: 600, color: C.ch }}>
               {currency === "USD" ? <><DollarSign size={14}/> USD</> : <span style={{ fontSize: 14, fontFamily: C.heb }}>₪ ILS</span>}
             </button>
             <button onClick={handleWaShare} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#25D366", color: "#fff", border: "none", borderRadius: 20, cursor: "pointer", fontFamily: C.heb, fontWeight: 600 }}><Share2 size={14}/> וואטסאפ</button>
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: "auto" }}>
          {tab === "builder" && <QuoteBuilder stones={stones} onExport={(cfg, res, img) => setModal({ cfg, res, img })} currency={currency} />}
          {tab === "stones" && <InventoryBrowser stones={stones} quoteStone={null} onPickStone={() => {}} pickedId={null} />}
          {tab === "data" && <DataEntryHub onAddStone={(s) => setStones([s, ...stones])} />}
          {tab === "manual" && <ManualCertTab />}
        </div>
      </div>

      {modal && modal.res && <QuoteCertModal cfg={modal.cfg} res={modal.res} pieceImg={modal.img} onClose={() => setModal(null)} currency={currency} />}
      {modal && modal.stone && <StoneCertModal stone={modal.stone} onClose={() => setModal(null)} />}
    </div>
  );
}
