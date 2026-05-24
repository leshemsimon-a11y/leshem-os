import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Calculator, Gem, FileText, ChevronDown, X, Printer, RotateCcw, Search, Plus, Minus, AlertCircle, LayoutGrid, List, ImageIcon, Pencil, Lock, FileCheck, Package, ClipboardList, Eye, Database, Share2, Download, ShieldCheck, DollarSign, ToggleLeft, ToggleRight } from "lucide-react";

/* ── CONSTANTS & SYSTEM ── */
const C = {
  iv: "#FAF9F6", // Off-white
  iv2: "#F0EDE8",
  iv3: "#E5E0D5",
  ch: "#36454F", // Charcoal
  chm: "#4a5c68",
  chl: "#7a8e98",
  chx: "#a8bcc4",
  gd: "#8A9A86", // Dusty Sage Green 
  gdm: "#72826e",
  gds: "rgba(138, 154, 134, 0.12)",
  bl: "rgba(54,69,79,0.10)",
  blm: "rgba(54,69,79,0.18)",
  serif: "'Merriweather','Times New Roman',Georgia,serif",
  heb: "'Assistant','Heebo',Arial,sans-serif",
  eng: "'DM Sans',Helvetica,Arial,sans-serif",
};

const r2 = n => Math.round(n * 100) / 100;
const fmtD = () => new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date());
const ovr = (o, n) => o !== "" && o !== null && o !== undefined ? (parseFloat(o) || 0) : n;
const uid = () => Math.random().toString(36).slice(2, 8).toUpperCase();

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
const SET_HEB = { "Prong / Claw": "פרונג", "Pavé": "פאווה", "Burnish": "בורניש", "Bezel": "בזל" };
const SET_RATE = { "Prong / Claw": 14, "Pavé": 3.5, "Burnish": 8.5, "Bezel": 16 };
const SPECIES = { Diamond: "Natural Diamond", Sapphire: "Natural Corundum", Ruby: "Natural Corundum", Emerald: "Natural Beryl", Alexandrite: "Natural Chrysoberyl", Other: "" };
const MU = { ws: 2.30, rx: 1.65, vat: 0.18 };

const INIT_STONES = [
  { id: "s01", sku: "DIA-RND-210", nH: "יהלום עגול 2.10ct", nE: "Round Brilliant 2.10ct", type: "Diamond", tH: "יהלום", shape: "Round", sH: "עגול", ct: 2.10, color: "G", cla: "VS1", cost: 15200, img: null },
  { id: "s02", sku: "DIA-OVL-180", nH: "יהלום אובל 1.80ct", nE: "Oval Diamond 1.80ct", type: "Diamond", tH: "יהלום", shape: "Oval", sH: "אובל", ct: 1.80, color: "F", cla: "VVS2", cost: 18400, img: null },
];

/* ── LOGIC ENGINE ── */
function estStone(type, ct, color, clarity) {
  const base = SBASE[type] ?? 300;
  const cf = type === "Diamond" ? (CFACT[color] ?? 1) : 1;
  const kf = type === "Diamond" ? (KFACT[clarity] ?? 1) : 1;
  return r2(base * Math.pow(parseFloat(ct) || 1, 1.8) * cf * kf);
}

function calcCenter(cfg) {
  if (cfg.stoneMode === "real" && cfg.stone) return cfg.stone.cost;
  if (cfg.centerManual !== "") {
    const val = parseFloat(cfg.centerManual) || 0;
    return cfg.centerPriceMode === "per_carat" ? r2(val * (parseFloat(cfg.centerCt) || 1)) : val;
  }
  return estStone(cfg.centerType, cfg.centerCt, cfg.centerColor, cfg.centerClarity);
}

function calcSS(type, ct, count, manual, mode, realStone, priceMode) {
  if (mode === "real" && realStone) return realStone.cost;
  const n = parseInt(count) || 0;
  if (!n) return 0;
  if (manual !== "") {
    const val = parseFloat(manual) || 0;
    return priceMode === "per_carat" ? r2(val * (parseFloat(ct) || 0.01) * n) : val;
  }
  return r2(n * estStone(type, ct, "G", "VS1"));
}

function calcLc(cfg, cm) {
  const raw = (SET_RATE[cfg.centerSetting] ?? 14) +
    (parseInt(cfg.ss1Count) || 0) * (SET_RATE[cfg.ss1Setting] ?? 3.5) +
    (parseInt(cfg.ss2Count) || 0) * (SET_RATE[cfg.ss2Setting] ?? 3.5);
  return r2(raw * cm);
}

function calc(cfg) {
  const wg = parseFloat(cfg.grams) || 0;
  if (!wg) return null;
  const gw = r2(wg * (1 + (CLOSS[cfg.cast] ?? 0.08)));
  const base_mc = gw * ((MSPOT[cfg.metal] ?? 62.4) * (PURITY[cfg.metal] ?? 0.75) + (ALLOYS[cfg.metal] ?? 1.8));

  // Determine metal cost based on manual override and price mode
  let mc_nat = r2(base_mc);
  let mc = mc_nat;
  if (cfg.mcOv !== "") {
    const val = parseFloat(cfg.mcOv) || 0;
    mc = cfg.metalPriceMode === "per_gram" ? r2(val * wg) : val;
  }

  const cm = CMULT[cfg.cmplx] ?? 1;
  const lc_nat = calcLc(cfg, cm);
  const lc = ovr(cfg.lcOv, lc_nat);
  
  const sc = calcCenter(cfg);
  const ss1 = calcSS(cfg.ss1Type, cfg.ss1Ct, cfg.ss1Count, cfg.ss1Manual, cfg.ss1Mode, cfg.ss1Stone, cfg.ss1PriceMode);
  const ss2 = calcSS(cfg.ss2Type, cfg.ss2Ct, cfg.ss2Count, cfg.ss2Manual, cfg.ss2Mode, cfg.ss2Stone, cfg.ss2PriceMode);
  
  const compCost = r2((cfg.selectedComponents || []).reduce((s, c) => s + (c.cost || 0), 0));
  const stones = r2(sc + ss1 + ss2);
  const oh = r2((mc + lc) * 0.18);
  
  const prod_nat = r2(mc + lc + stones + compCost + oh);
  const prod = ovr(cfg.prodOv, prod_nat);
  const ws_nat = r2(prod * MU.ws); const ws = ovr(cfg.wsOv, ws_nat);
  const rx_nat = r2(ws * MU.rx); const rx = ovr(cfg.rxOv, rx_nat);
  const ri_nat = r2(rx * (1 + MU.vat)); const ri = ovr(cfg.riOv, ri_nat);
  
  return { mc, lc, sc, ss1, ss2, compCost, stones, oh, prod, ws, rx, ri, gw, mc_nat, lc_nat, prod_nat, ws_nat, rx_nat, ri_nat };
}

/* ── UI COMPONENTS ── */
const GR = ({ soft, my = 0 }) => <div style={{ height: "0.5px", background: soft ? "rgba(138, 154, 134, 0.2)" : C.gd, marginTop: my, marginBottom: my }} />;
const EB = ({ dark, s = {}, children }) => <div style={{ fontFamily: C.heb, fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", color: dark ? C.ch : C.chl, marginBottom: 5, ...s }}>{children}</div>;
const Divider = () => <div style={{ height: "1px", background: C.bl, margin: "16px 0" }} />;

function formatMoney(v, currency) {
  const rate = currency === "ILS" ? 3.75 : 1;
  const symbol = currency === "ILS" ? "₪" : "$";
  return symbol + new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round((v || 0) * rate));
}

function Pills({ opts, val, onChange }) {
  return (<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
    {opts.map(([v, l]) => (
      <button key={v} onClick={() => onChange(v)} style={{ fontFamily: C.heb, fontSize: 13, cursor: "pointer", color: val === v ? C.iv : C.chm, background: val === v ? C.ch : "transparent", border: `0.5px solid ${val === v ? C.ch : C.blm}`, padding: "8px 16px", transition: "all 0.12s", borderRadius: 4 }}>{l}</button>
    ))}
  </div>);
}

function ImgDrop({ img, onImg, h = 90, label = "לחץ או גרור תמונה להעלאה", small, className }) {
  const [hov, setHov] = useState(false);
  const ref = useRef();
  function handle(file) { if (!file || !file.type.startsWith("image/")) return; const r = new FileReader(); r.onload = e => onImg(e.target.result); r.readAsDataURL(file); }
  return (
    <div className={className}
      onDragOver={e => { e.preventDefault(); setHov(true); }} onDragLeave={() => setHov(false)}
      onDrop={e => { e.preventDefault(); setHov(false); handle(e.dataTransfer.files[0]); }}
      onClick={() => ref.current?.click()}
      style={{ height: h, background: img ? "transparent" : hov ? C.iv3 : C.iv2, border: `0.5px dashed ${hov ? C.blm : C.bl}`, cursor: "pointer", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "background 0.12s", borderRadius: 4 }}>
      {img ? (<>
        <img src={img} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        <button onClick={e => { e.stopPropagation(); onImg(null); }} style={{ position: "absolute", top: 6, right: 6, background: "rgba(54,69,79,0.7)", border: "none", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}><X size={12} /></button>
      </>) : (
        <><ImageIcon size={small ? 16 : 22} color={C.chx} strokeWidth={1.2} /><span style={{ fontFamily: C.heb, fontSize: small ? 11 : 12, color: C.chx, marginTop: 4 }}>{label}</span></>
      )}
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handle(e.target.files[0])} />
    </div>
  );
}

function Sel({ label, opts, half, sx = {}, ...p }) {
  return (<div style={{ display: "flex", flexDirection: "column", gap: 4, width: half ? "50%" : "100%" }}>
    {label && <EB>{label}</EB>}
    <div style={{ position: "relative" }}>
      <select style={{ fontFamily: C.heb, fontSize: 14, color: C.ch, background: C.iv2, border: `0.5px solid ${C.blm}`, padding: "10px 12px 10px 28px", outline: "none", appearance: "none", width: "100%", borderRadius: 4, ...sx }} {...p}>
        {opts.map(o => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.chl, pointerEvents: "none" }} />
    </div>
  </div>);
}

function Inp({ label, half, sx = {}, ...p }) {
  return (<div style={{ display: "flex", flexDirection: "column", gap: 4, width: half ? "50%" : "100%" }}>
    {label && <EB>{label}</EB>}
    <input type="text" inputMode="decimal" style={{ fontFamily: C.heb, fontSize: 14, color: C.ch, background: C.iv2, border: `0.5px solid ${C.blm}`, padding: "10px 12px", outline: "none", width: "100%", borderRadius: 4, ...sx }} {...p} />
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

/* ── CERTIFICATES ── */
function QuoteCert({ cfg, res, pieceImg, currency }) {
  const qref = useMemo(() => { const d = new Date(); return `QT-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${(cfg.clientName || "DRAFT").replace(/\s+/g, "-").toUpperCase().slice(0, 10)}`; }, [cfg.clientName]);
  const cDesc = cfg.stoneMode === "real" && cfg.stone
    ? `${cfg.stone.ct}ct ${cfg.stone.type}, ${cfg.stone.color}, ${cfg.stone.cla} · ${cfg.centerSetting}`
    : `${cfg.centerCt}ct ${cfg.centerType}${cfg.centerType === "Diamond" ? `, ${cfg.centerColor} color, ${cfg.centerClarity} clarity` : ""} · ${cfg.centerSetting}`;
  const comps = (cfg.selectedComponents || []);

  const Row = ({ l, v, first, it }) => (!v ? null : (
    <div style={{ display: "flex", padding: "14px 0", borderTop: first ? `0.5px solid rgba(138, 154, 134, 0.25)` : "none", borderBottom: `0.5px solid rgba(138, 154, 134, 0.15)`, position: "relative", zIndex: 2 }}>
      <div style={{ fontFamily: C.eng, fontSize: 10, fontWeight: 600, color: C.chl, letterSpacing: "0.1em", width: "35%", textTransform: "uppercase" }}>{l}</div>
      <div style={{ fontFamily: C.serif, fontSize: 13, fontWeight: 300, fontStyle: it ? "italic" : "normal", color: it ? C.chm : C.ch, flex: 1, lineHeight: 1.6 }}>{v}</div>
    </div>
  ));

  return (
    <div dir="ltr" id="cert-root" className="a4-page" style={{ fontFamily: C.eng, background: C.iv, padding: 55, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: 480, fontFamily: C.serif, color: C.gd, opacity: 0.02, pointerEvents: "none", zIndex: 0 }}>L</div>

      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 35 }}>
          <div>
            <div style={{ width: 22, height: 22, border: `1px solid ${C.gd}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}><span style={{ fontFamily: C.serif, fontSize: 11, color: C.gd }}>L</span></div>
            <div style={{ fontFamily: C.serif, fontSize: 22, fontWeight: 300, color: C.ch, letterSpacing: 8, lineHeight: 1 }}>LESHEM.S</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: C.eng, fontSize: 9, color: C.chl, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 4 }}>Quotation</div>
            <div style={{ fontFamily: C.eng, fontSize: 12, fontWeight: 500, color: C.ch }}>{qref}</div>
          </div>
        </div>

        <GR />

        <div style={{ display: "flex", justifyContent: "space-between", margin: "25px 0 35px" }}>
          <div>
            <div style={{ fontFamily: C.eng, fontSize: 9, color: C.chl, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 4 }}>Prepared For</div>
            <div style={{ fontFamily: C.serif, fontSize: 14, fontWeight: 300, color: C.ch }}>{cfg.clientName || "—"}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: C.eng, fontSize: 9, color: C.chl, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 4 }}>Date of Issue</div>
            <div style={{ fontFamily: C.serif, fontSize: 14, fontWeight: 300, color: C.ch }}>{fmtD()}</div>
          </div>
        </div>

        {pieceImg && (
          <div style={{ width: "100%", height: 260, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 45, position: "relative" }}>
            <img src={pieceImg} alt="piece" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        )}

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
          <div>
            <div style={{ fontFamily: C.eng, fontSize: 9, color: C.chl, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 4 }}>Total Value Estimate</div>
            <div style={{ fontFamily: C.eng, fontSize: 10, color: C.chx }}>Includes Premium Fabrication & VAT</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: C.serif, fontSize: 32, fontWeight: 300, color: C.ch, lineHeight: 1 }}>{res ? formatMoney(res.ri, currency) : "—"}</div>
          </div>
        </div>

        <div style={{ fontFamily: C.eng, fontSize: 8.5, color: C.chl, lineHeight: 1.8, marginBottom: 30, maxWidth: 600 }}>
          This valuation is a custom commercial calculation based on precise precious metal market indices and gemological criteria. Prices reflect initial engineering specs and are valid for 7 days.
        </div>

        <GR soft />

        <div style={{ marginTop: 25, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ borderBottom: `0.5px solid ${C.chm}`, marginBottom: 6, width: 140, opacity: 0.3 }} />
            <div style={{ fontFamily: C.serif, fontSize: 12, fontStyle: "italic", color: C.ch }}>Leshem Simon</div>
            <div style={{ fontFamily: C.eng, fontSize: 8.5, color: C.chl, letterSpacing: "1px", textTransform: "uppercase", opacity: 0.7 }}>Founder & Expert Jeweler</div>
          </div>
          <div style={{ textAlign: "right", fontFamily: C.eng, fontSize: 8.5, color: C.chl, opacity: 0.6, lineHeight: 1.6 }}>
            LESHEM.S Studio | Tuval St 23, Ramat Gan<br />VAT Registration ID: 046240016
          </div>
        </div>
      </div>
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
  const sf = useCallback((f, v) => setCfg(p => ({ ...p, [f]: v })), []);
  const res = useMemo(() => calc(cfg), [cfg]);

  function SsBlock({ typeF, ctF, countF, manualF, setF, modeF, priceModeF }) {
    const mode = cfg[modeF];
    return (<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {mode === "virtual" ? (
        <>
          <div style={{ display: "flex", gap: 12 }} className="mobile-col">
            <Sel label="סוג אבן" half opts={STYPES} value={cfg[typeF]} onChange={e => sf(typeF, e.target.value)} />
            <Sel label="סגנון שיבוץ" half opts={SET_ENG} value={cfg[setF]} onChange={e => sf(setF, e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 12 }} className="mobile-col">
            <Inp label="קרט ממוצע" half value={cfg[ctF]} onChange={e => sf(ctF, e.target.value)} />
            <Inp label="כמות" half value={cfg[countF]} onChange={e => sf(countF, e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}><Inp label="עלות ידנית" value={cfg[manualF]} onChange={e => sf(manualF, e.target.value)} placeholder="אוטומטי" /></div>
            <ModeToggle mode={cfg[priceModeF]} setMode={v => sf(priceModeF, v)} lblTotal="סה״כ" lblUnit="לקרט" />
          </div>
        </>
      ) : null}
    </div>);
  }

  return (
    <div style={{ height: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden" }} className="mobile-grid">
      <div style={{ borderLeft: `0.5px solid ${C.bl}`, overflowY: "auto", padding: "20px 24px 40px" }}>
        
        <Pnl num="01" title="מתכת קסטינג ועבודה">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Sel label="סוג סגסוגת" opts={METALS} value={cfg.metal} onChange={e => sf("metal", e.target.value)} />
            <div style={{ display: "flex", gap: 12 }} className="mobile-col">
              <Inp label="משקל מתוכנן (g)" half value={cfg.grams} onChange={e => sf("grams", e.target.value)} placeholder="0.00" />
              <Inp label="ערך ספוט לגרם" half value={MSPOT[cfg.metal] ?? 62.4} readOnly sx={{ background: C.gds }} />
            </div>
            <Sel label="טכנולוגיית ייצור" opts={CASTS} value={cfg.cast} onChange={e => sf("cast", e.target.value)} />
            <div><EB s={{ marginBottom: 8 }}>מורכבות</EB><Pills opts={Object.keys(CMULT).map(k => [k, CHEB[k]])} val={cfg.cmplx} onChange={v => sf("cmplx", v)} /></div>
          </div>
        </Pnl>

        <Pnl num="02" title="אבן מרכזית">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 12 }} className="mobile-col">
              <Sel label="סוג אבן חן" half opts={STYPES} value={cfg.centerType} onChange={e => sf("centerType", e.target.value)} />
              <Sel label="סגנון שיבוץ" half opts={SET_ENG} value={cfg.centerSetting} onChange={e => sf("centerSetting", e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: 12 }} className="mobile-col">
              <Inp label="משקל קרט" half value={cfg.centerCt} onChange={e => sf("centerCt", e.target.value)} />
              <div style={{ width: "50%", display: "flex", flexDirection: "column", gap: 4 }}>
                <Inp label="מחיר עוקף" value={cfg.centerManual} onChange={e => sf("centerManual", e.target.value)} placeholder="אוטומטי" />
                <ModeToggle mode={cfg.centerPriceMode} setMode={v => sf("centerPriceMode", v)} lblTotal="סה״כ" lblUnit="לקרט" />
              </div>
            </div>
            {cfg.centerType === "Diamond" && <div style={{ display: "flex", gap: 12 }} className="mobile-col">
              <Inp label="צבע (D-K)" half value={cfg.centerColor} onChange={e => sf("centerColor", e.target.value)} />
              <Sel label="ניקיון" half opts={Object.keys(KFACT)} value={cfg.centerClarity} onChange={e => sf("centerClarity", e.target.value)} />
            </div>}
          </div>
        </Pnl>

        <Pnl num="03" title="אבני צד I"><SsBlock typeF="ss1Type" ctF="ss1Ct" countF="ss1Count" manualF="ss1Manual" setF="ss1Setting" modeF="ss1Mode" priceModeF="ss1PriceMode" /></Pnl>
        <Pnl num="04" title="אבני צד II"><SsBlock typeF="ss2Type" ctF="ss2Ct" countF="ss2Count" manualF="ss2Manual" setF="ss2Setting" modeF="ss2Mode" priceModeF="ss2PriceMode" /></Pnl>
        
        <Pnl num="05" title="שיוך לקוח"><Inp label="שם לקוח" value={cfg.clientName} onChange={e => sf("clientName", e.target.value)} /><div style={{ height: 10 }} /><Inp label="כותרת העבודה" value={cfg.quoteName} onChange={e => sf("quoteName", e.target.value)} /></Pnl>
        <Pnl num="06" title="צילום לתעודה"><ImgDrop img={pieceImg} onImg={setPieceImg} h={140} label="העלה או גרור תמונה של התכשיט" /></Pnl>
      </div>

      <div style={{ overflowY: "auto", padding: "20px 24px 40px", background: "#fff" }}>
        <div style={{ padding: "20px", border: `1px solid ${C.bl}`, background: C.iv2, borderRadius: 8, marginBottom: 20 }}>
          <div style={{ fontFamily: C.eng, fontSize: 12, color: C.chl, marginBottom: 5 }}>FINAL RETAIL PRICE (INC. VAT)</div>
          <div style={{ fontFamily: C.serif, fontSize: 36, color: C.gdm, fontWeight: 600 }}>{res ? formatMoney(res.ri, currency) : "—"}</div>
        </div>

        {res && (
          <div style={{ marginBottom: 20 }}>
             <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.bl}` }}><span>מתכת + עבודה</span><span>{formatMoney(res.mc_nat + res.lc_nat, "USD")}</span></div>
             <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.bl}` }}><span>אבנים (מרכזי + צד)</span><span>{formatMoney(res.sc + res.ss1 + res.ss2, "USD")}</span></div>
             <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.bl}` }}><span>מס והוצאות סטודיו</span><span>{formatMoney(res.oh, "USD")}</span></div>
             <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", fontWeight: 600, color: C.gdm }}><span>עלות ייצור (Production)</span><span>{formatMoney(res.prod, "USD")}</span></div>
          </div>
        )}

        <button onClick={() => res && onExport(cfg, res, pieceImg)} disabled={!res}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: C.heb, fontSize: 16, fontWeight: 600, color: res ? C.iv : C.chl, background: res ? C.gd : C.iv2, border: "none", padding: "16px 0", cursor: res ? "pointer" : "not-allowed", borderRadius: 4 }}>
          <FileText size={18} /> {res ? "הפק תעודת יוקרה (PDF / שיתוף)" : "הזן פרטים כדי להפיק תעודה"}
        </button>
      </div>
    </div>
  );
}

/* ═══════════ MAIN APP ═══════════ */
export default function App() {
  const [tab, setTab] = useState("builder");
  const [currency, setCurrency] = useState("USD");
  const [modal, setModal] = useState(null);

  const handleWaShare = (cfg, res) => {
    const text = `*הצעת מחיר - LESHEM.S*\nלקוח: ${cfg.clientName || 'לקוח יקר'}\nפריט: ${cfg.quoteName || 'תכשיט בהתאמה אישית'}\n\nסה"כ לתשלום: ${formatMoney(res.ri, currency)}\n\n*נשמח לעמוד לרשותך לכל שאלה,* \nצוות סטודיו Leshem.S`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  return (
    <div dir="rtl" className="app-container" style={{ height: "100vh", display: "flex", background: C.iv, fontFamily: C.heb }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Assistant', sans-serif; background: #FAF9F6; color: #36454F; }
        input[type="text"], select, textarea { font-size: 16px !important; }
        
        @media (max-width: 768px) {
          .app-container { flex-direction: column !important; overflow-y: auto !important; height: auto !important; min-height: 100vh; display: block !important; }
          aside { width: 100% !important; min-width: 100% !important; flex-direction: row !important; align-items: center; justify-content: space-between; padding: 10px !important; }
          aside nav { display: none; }
          .mobile-col { flex-direction: column !important; }
          .mobile-grid { display: flex !important; flex-direction: column !important; overflow: visible !important; height: auto !important; }
          .mobile-grid > div { overflow: visible !important; height: auto !important; padding: 16px !important; border: none !important; }
        }

        /* ── STRICT PRINT LOGIC ── */
        @media print {
          @page { size: A4; margin: 0; }
          html, body { height: auto !important; overflow: visible !important; background: white !important; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .app-container, main { display: none !important; }
          
          /* Only show the a4-page inside the printable wrapper */
          .modal-backdrop { position: static !important; background: transparent !important; padding: 0 !important; overflow: visible !important; display: block !important; }
          .a4-page { 
             display: block !important; 
             width: 210mm !important; 
             height: 297mm !important; 
             margin: 0 !important; 
             padding: 20mm !important; 
             box-shadow: none !important; 
             background: white !important; 
             page-break-after: always;
          }
        }
      `}</style>
      
      <aside className="no-print" style={{ width: 220, minWidth: 220, background: C.ch, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "24px 20px 20px" }}>
          <div style={{ width: 22, height: 22, border: `1px solid ${C.gd}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}><span style={{ fontFamily: C.serif, fontSize: 10, color: C.gd }}>L</span></div>
          <div style={{ fontFamily: C.serif, fontSize: 15, color: "#E8E4DC", letterSpacing: "0.15em" }}>LESHEM.S</div>
        </div>
        <nav style={{ padding: "16px 0", flex: 1 }}>
          {[{ id: "builder", l: "מחשבון עלויות", i: Calculator }, { id: "stones", l: "מאגר מלאי", i: Gem }, { id: "data", l: "הזנת נתונים", i: Database }].map(t => (
            <div key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", cursor: "pointer", background: tab === t.id ? "rgba(138, 154, 134, 0.15)" : "transparent" }}>
              <t.i size={18} color={tab === t.id ? C.gd : "#5a7280"} />
              <span style={{ color: tab === t.id ? "#ddd8cc" : "#5a7280", fontSize: 15 }}>{t.l}</span>
            </div>
          ))}
        </nav>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 26px", borderBottom: `1px solid ${C.bl}`, background: C.iv }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: C.ch }}>LESHEM.S Studio</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
             <button onClick={() => setCurrency(currency === "USD" ? "ILS" : "USD")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: C.iv2, border: `1px solid ${C.bl}`, borderRadius: 20, cursor: "pointer", fontFamily: C.eng, fontWeight: 600, color: C.ch }}>
               {currency === "USD" ? <><DollarSign size={14}/> USD</> : <span style={{ fontSize: 14 }}>₪ ILS</span>}
             </button>
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: "auto" }}>
          {tab === "builder" && <QuoteBuilder stones={INIT_STONES} onExport={(cfg, res, img) => setModal({ cfg, res, img })} currency={currency} />}
          {tab === "stones" && <div style={{ padding: 40, textAlign: "center", color: C.chx }}>מאגר האבנים כאן (בגרסה הבאה יחובר ל-Airtable)</div>}
          {tab === "data" && <div style={{ padding: 40, textAlign: "center", color: C.chx }}>הזנת הנתונים תחובר ישירות לבסיס הנתונים בקרוב.</div>}
        </div>
      </div>

      {modal && (
        <div className="modal-backdrop" style={{ position: "fixed", inset: 0, background: "rgba(30, 40, 45, 0.95)", zIndex: 9999, overflowY: "auto", padding: "40px 16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="no-print" style={{ width: "100%", maxWidth: 720, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span style={{ color: "rgba(225,215,195,0.6)", fontWeight: 600 }}>הפקת תעודה ללקוח</span>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => handleWaShare(modal.cfg, modal.res)} style={{ display: "flex", alignItems: "center", gap: 8, color: "#fff", background: "#25D366", border: "none", padding: "10px 20px", cursor: "pointer", borderRadius: 4, fontWeight: 600 }}><Share2 size={16} /> שלח בוואטסאפ</button>
              <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 8, color: C.iv, background: C.gd, border: "none", padding: "10px 20px", cursor: "pointer", borderRadius: 4, fontWeight: 600 }}><Printer size={16} /> שמור PDF / הדפס</button>
              <button onClick={() => setModal(null)} style={{ display: "flex", alignItems: "center", gap: 8, color: "#fff", background: "transparent", border: "1px solid rgba(255,255,255,0.3)", padding: "10px 16px", cursor: "pointer", borderRadius: 4 }}><X size={16} /> סגור</button>
            </div>
          </div>
          <QuoteCert cfg={modal.cfg} res={modal.res} pieceImg={modal.img} currency={currency} />
        </div>
      )}
    </div>
  );
}
