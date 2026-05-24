import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Calculator, Gem, FileText, ChevronDown, X, Printer, RotateCcw, Search, Plus, Minus, AlertCircle, LayoutGrid, List, ImageIcon, Pencil, Lock, FileCheck, Package, ClipboardList, Eye, Database, Share2, Download, ShieldCheck, DollarSign } from "lucide-react";

/* ── CONSTANTS & SYSTEM ── */
const C = {
  iv: "#FAF9F6",
  iv2: "#F0EDE8",
  iv3: "#E5E0D5",
  ch: "#36454F",
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
const SET_RATE = { "Prong / Claw": 14, "Pavé": 3.5, "Burnish": 8.5, "Bezel": 16 };
const SPECIES = { Diamond: "Natural Diamond", Sapphire: "Natural Corundum", Ruby: "Natural Corundum", Emerald: "Natural Beryl", Alexandrite: "Natural Chrysoberyl", Other: "" };
const MU = { ws: 2.30, rx: 1.65, vat: 0.18 };

const INIT_STONES = [
  { id: "s01", sku: "DIA-RND-210", nH: "יהלום עגול 2.10ct", type: "Diamond", shape: "Round", ct: 2.10, color: "G", cla: "VS1", cost: 15200, img: null },
  { id: "s02", sku: "DIA-OVL-180", nH: "יהלום אובל 1.80ct", type: "Diamond", shape: "Oval", ct: 1.80, color: "F", cla: "VVS2", cost: 18400, img: null },
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

function calc(cfg) {
  const wg = parseFloat(cfg.grams) || 0;
  if (!wg) return null;
  const gw = r2(wg * (1 + (CLOSS[cfg.cast] ?? 0.08)));
  const base_mc = gw * ((MSPOT[cfg.metal] ?? 62.4) * (PURITY[cfg.metal] ?? 0.75) + (ALLOYS[cfg.metal] ?? 1.8));

  let mc_nat = r2(base_mc);
  let mc = mc_nat;
  if (cfg.mcOv !== "") {
    const val = parseFloat(cfg.mcOv) || 0;
    mc = cfg.metalPriceMode === "per_gram" ? r2(val * wg) : val;
  }

  const cm = CMULT[cfg.cmplx] ?? 1;
  const lc_nat = r2(((SET_RATE[cfg.centerSetting] ?? 14) + (parseInt(cfg.ss1Count) || 0) * (SET_RATE[cfg.ss1Setting] ?? 3.5) + (parseInt(cfg.ss2Count) || 0) * (SET_RATE[cfg.ss2Setting] ?? 3.5)) * cm);
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
const EB = ({ dark, s = {}, children }) => <div style={{ fontFamily: C.heb, fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", color: dark ? C.ch : C
