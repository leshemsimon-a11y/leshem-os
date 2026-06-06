/**
 * pages/index.js  —  LESHEM.S OS  v5.5.2
 *
 * v5.5.2 — v2 URL bridge (Milestone v2.3):
 *   useEffect detects ?v2item=recXXX&role=... and ?v2cert=recXXX query params.
 *   Finds matching item from invStones (already-normalized MVP shape).
 *   Triggers existing prefill / cert seed flows respectively.
 *   Params cleared after consumption to prevent re-fire.
 *   If invStones not yet loaded, triggers fetch then re-runs via effect dependency.
 *   No changes to pricing, calculator logic, certificate templates, or other MVP features.
 *
 * v5.5 — Work Tray multi-item → calculator:
 *   handleSendBatchToCalculator(items, useAs) loads every selected tray item
 *   with one shared role. "center" appends each as a separate center stone;
 *   "side" fills the two available side rows; "part" navigates for manual
 *   entry. Wired to InventoryStudio via onSendBatchToCalculator. The existing
 *   single-item two-step flow (CalcLoadDialog → UseAsDialog) is unchanged.
 *
 * Prior (v5.4.1) behaviour retained below:
 * Changes from v5.4:
 *
 * Task 5 — "Start New Product / Add to Current Product" dialog:
 *   When user clicks "Use in Calculator" from inventory, they first see:
 *     ○ Start New Product (default) — clears DCFG, loads item
 *     ○ Add to Current Product — appends item to existing cfg
 *   After choosing, UseAsDialog appears as before.
 *   The two-step flow is handled by CalcLoadDialog component.
 *
 * Task 6 — Global CommandBar in header:
 *   A compact CommandBar appears in the main header between the logo and
 *   the currency/reset controls. It can navigate between tabs and search
 *   inventory from anywhere in the app.
 *   The full CommandBar still appears inside InventoryStudio.
 *
 * Task 3 — Correct certificate mapping:
 *   handleCertFromItem now calls mapProductTypeToCertificate() from
 *   reportDefaults.js. stone_parcel → inhouse_stone/stone_parcel (not pair).
 *   jewelry_part shows a confirmation dialog before creating a cert.
 *   finished_jewelry → creates a jewelry_valuation report.
 *   classification metadata attached via buildStoneClassification().
 *
 * Task 7 — Terminology: no "Basket", no "הגדרה".
 */

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import { DCFG, C }                        from "../lib/constants";
import { calcApp, fmt, buildMetalPrices } from "../lib/calculations";
import { PRINT_CSS }                      from "../lib/printCss";
import {
  mapProductTypeToCertificate,
  buildStoneClassification,
}                                         from "../lib/reports/reportDefaults";

import { CalculatorForm }      from "../components/CalculatorForm";
import { CostSummary }         from "../components/CostSummary";
import { ReportEngine }        from "../components/reports/ReportEngine";
import { InventoryStudio }     from "../components/inventory/InventoryStudio";
import { ProductIntakeWizard } from "../components/inventory/ProductIntakeWizard";
import { CommandBar }          from "../components/inventory/CommandBar";

// v2.5: builder → calculator handoff (localStorage payload + ?v2build=1)
import {
  readBuildHandoff,
  clearBuildHandoff,
  composeBuildNote,
  BUILD_BRIDGE_FLAG,
  MVP_SIDE_ROW_LIMIT,
} from "../lib/v2/builderCalculatorBridge";

const PAGE_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { font-size: 16px; }
  body { background: #FAF9F6; font-family: 'Assistant', 'Heebo', Arial, sans-serif; }
  @media screen {
    ::-webkit-scrollbar             { width: 7px; height: 7px; }
    ::-webkit-scrollbar-track       { background: rgba(54,69,79,0.04); border-radius: 4px; }
    ::-webkit-scrollbar-thumb       { background: rgba(54,69,79,0.22); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(54,69,79,0.40); }
  }
  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #C5B358 !important;
    box-shadow: 0 0 0 3px rgba(197,179,88,0.15);
  }
  button { font-family: 'Assistant', 'Heebo', Arial, sans-serif; }
  select option { background: #fff; color: #36454F; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

const TABS = [
  { key: "calc",   icon: "🔢", label: "מחשבון", sublabel: "Calculator"  },
  { key: "cert",   icon: "📋", label: "תעודות", sublabel: "Certificates" },
  { key: "malai",  icon: "💎", label: "מלאי",   sublabel: "Inventory"    },
  { key: "intake", icon: "🗂", label: "קליטה",  sublabel: "Intake"       },
];

// ─── ConfirmDialog ─────────────────────────────────────────────────────────────
function ConfirmDialog({ message, confirmLabel, cancelLabel, onConfirm, onCancel }) {
  return (
    <div
      style={{ position:"fixed", inset:0, background:"rgba(54,69,79,0.5)", zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{ background:"#FAF9F6", borderRadius:10, padding:"24px 28px", maxWidth:380, width:"100%", boxShadow:"0 20px 50px rgba(54,69,79,0.28)" }}>
        <p style={{ fontFamily:"'Assistant','Heebo',Arial,sans-serif", fontSize:15, color:"#36454F", marginBottom:20, lineHeight:1.6, direction:"rtl", textAlign:"right" }}>
          {message}
        </p>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
          <button onClick={onCancel}  style={{ height:40, padding:"0 18px", background:"transparent", border:"1px solid rgba(54,69,79,0.22)", borderRadius:7, cursor:"pointer", fontFamily:"'Assistant','Heebo',Arial,sans-serif", fontSize:13, color:"#7a8e98" }}>{cancelLabel}</button>
          <button onClick={onConfirm} style={{ height:40, padding:"0 18px", background:"#36454F", color:"#FAF9F6", border:"none", borderRadius:7, cursor:"pointer", fontFamily:"'Assistant','Heebo',Arial,sans-serif", fontSize:13, fontWeight:700 }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ─── CalcLoadDialog (Task 5) ──────────────────────────────────────────────────
/**
 * Shown before UseAsDialog when user clicks "Use in Calculator".
 * User chooses: Start New Product (default) or Add to Current Product.
 *
 * onSelect(mode) where mode ∈ { "new", "add" }
 */
function CalcLoadDialog({ item, onSelect, onCancel }) {
  if (!item) return null;
  const pt = item.productType || "";
  const nameStr = item.name || item.sku || item.stoneType || "פריט";
  const ctStr   = item.caratWeight ? ` · ${parseFloat(item.caratWeight).toFixed(2)} ct` : "";

  return (
    <div
      style={{ position:"fixed", inset:0, background:"rgba(54,69,79,0.6)", zIndex:1400, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={(e) => { if (e.target===e.currentTarget) onCancel(); }}
    >
      <div style={{ background:C.iv, borderRadius:12, padding:"22px 26px", maxWidth:430, width:"100%", boxShadow:"0 24px 60px rgba(54,69,79,0.3)" }}>
        <div style={{ fontFamily:C.dat, fontSize:13.5, fontWeight:700, color:C.ch, marginBottom:4 }}>
          Use in Calculator
        </div>
        <div style={{ fontFamily:C.heb, fontSize:12, color:C.chl, marginBottom:18, lineHeight:1.6 }}>
          {nameStr}{ctStr} — כיצד לטעון את הפריט?
        </div>

        {[
          {
            key: "new",
            icon: "🆕",
            label: "מוצר חדש",
            sub:   "Start New Product — clears all current data and loads this item",
            bold:  true,
          },
          {
            key: "add",
            icon: "➕",
            label: "הוסף למוצר הנוכחי",
            sub:   "Add to Current Product — appends this item to existing calculator data",
            bold:  false,
          },
        ].map(opt => (
          <button
            key={opt.key}
            onClick={() => onSelect(opt.key)}
            style={{ display:"flex", alignItems:"center", gap:13, padding:"12px 14px", background:opt.bold?"rgba(54,69,79,0.04)":"#fff", border:`1.5px solid ${opt.bold?"rgba(54,69,79,0.2)":"rgba(54,69,79,0.12)"}`, borderRadius:9, cursor:"pointer", textAlign:"left", width:"100%", marginBottom:8, transition:"border-color 0.13s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor=C.gd; e.currentTarget.style.background="rgba(197,179,88,0.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor=opt.bold?"rgba(54,69,79,0.2)":"rgba(54,69,79,0.12)"; e.currentTarget.style.background=opt.bold?"rgba(54,69,79,0.04)":"#fff"; }}
          >
            <span style={{ fontSize:22, flexShrink:0 }}>{opt.icon}</span>
            <div>
              <div style={{ fontFamily:C.heb, fontSize:13.5, fontWeight:opt.bold?700:400, color:C.ch }}>
                {opt.label}
                {opt.bold && <span style={{ fontFamily:C.dat, fontSize:9.5, fontWeight:400, color:C.gd, marginRight:8 }}> (ברירת מחדל)</span>}
              </div>
              <div style={{ fontFamily:C.dat, fontSize:11, color:C.chl, marginTop:2 }}>{opt.sub}</div>
            </div>
          </button>
        ))}

        <button onClick={onCancel} style={{ marginTop:6, height:36, width:"100%", background:"transparent", border:"1px solid rgba(54,69,79,0.18)", borderRadius:8, cursor:"pointer", fontFamily:C.heb, fontSize:12.5, color:C.chl }}>ביטול</button>
      </div>
    </div>
  );
}

// ─── Main app ─────────────────────────────────────────────────────────────────
export default function LeshemOS() {

  const router = useRouter();

  const [cfg,              setCfg]              = useState({ ...DCFG, centerStones: [] });
  const [currency,         setCurrency]         = useState("USD");
  const [tab,              setTab]              = useState("calc");
  const [pieceImg,         setPieceImg]         = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Certificate seed
  const [certSeed,     setCertSeed]     = useState(null);
  // Prefill source banner (4 s auto-dismiss)
  const [calcSrcBanner, setCalcSrcBanner] = useState(null);

  // v5.4.1 Task 5: CalcLoadDialog state
  // Stores { item } — shown before UseAsDialog so user picks new/add
  const [calcLoadItem,  setCalcLoadItem]  = useState(null);  // item awaiting New/Add choice
  const [calcRole,      setCalcRole]      = useState(null);  // chosen role: center/side/part
  const [calcBatch,     setCalcBatch]     = useState(null);  // { items, useAs } awaiting New/Add
  const [calcBuild,     setCalcBuild]     = useState(null);  // v2.5: { payload } awaiting New/Add

  // v5.4.1: jewelry_part cert confirmation
  const [certPartConfirm, setCertPartConfirm] = useState(null); // item

  const qNum    = useRef(`LS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`);
  const fileRef = useRef(null);

  const invFetched = useRef(false);
  const [invStones,  setInvStones]  = useState([]);
  const [invMetals,  setInvMetals]  = useState([]);
  const [invLoading, setInvLoading] = useState(false);
  const [invError,   setInvError]   = useState(null);
  const [metalPrices, setMetalPrices] = useState({});

  const sf    = useCallback((field, value) => setCfg((prev) => ({ ...prev, [field]: value })), []);
  const res   = useMemo(() => calcApp(cfg, metalPrices), [cfg, metalPrices]);
  const fmtFn = useCallback((v) => fmt(v, currency), [currency]);

  useEffect(() => {
    if (!calcSrcBanner) return;
    const t = setTimeout(() => setCalcSrcBanner(null), 4000);
    return () => clearTimeout(t);
  }, [calcSrcBanner]);

  // ── v5.5.2: v2 URL bridge ─────────────────────────────────────────────────
  /**
   * Detects query params set by the v2 UI:
   *   ?v2item=recXXX&role=center  → calculator prefill
   *   ?v2cert=recXXX              → certificate seed
   *
   * Finds the matching item from the already-loaded invStones array.
   * If invStones is empty (not yet fetched), triggers a fetch then re-runs
   * via the invStones dependency when the data arrives.
   *
   * Params are cleared after consumption (router.replace) to prevent
   * re-firing on back-navigation or re-render.
   *
   * Nothing happens if neither param is present — zero impact on MVP.
   */
  useEffect(() => {
    const v2item  = router.query?.v2item;
    const v2cert  = router.query?.v2cert;
    const v2build = router.query?.[BUILD_BRIDGE_FLAG];

    // No bridge params — exit immediately, no side effects.
    if (!v2item && !v2cert && !v2build) return;
    // Router not ready yet (SSR pass).
    if (!router.isReady) return;

    // If inventory not yet loaded, trigger a fetch.
    // The effect re-runs when invStones populates (dependency below).
    if (invStones.length === 0 && !invFetched.current) {
      invFetched.current = true;
      setInvLoading(true);
      Promise.all([
        fetch("/api/airtable/stones").then((r) => r.json()),
        fetch("/api/airtable/metals").then((r) => r.json()),
      ])
        .then(([stonesData, metalsData]) => {
          const metals = metalsData.metals || [];
          setInvStones(stonesData.stones || []);
          setInvMetals(metals);
          setInvLoading(false);
          const derived = buildMetalPrices(metals);
          if (Object.keys(derived).length > 0) setMetalPrices(derived);
        })
        .catch((err) => {
          setInvError("Failed to load inventory — " + err.message);
          setInvLoading(false);
        });
      return; // re-runs when invStones updates
    }

    // ── v2.5: full Builder draft handoff ──────────────────────────────────
    // Reads the structured payload from localStorage, re-resolves every record
    // ID from the MVP's own invStones, then opens the existing New/Add dialog.
    if (v2build) {
      const payload = readBuildHandoff();
      clearBuildHandoff();
      router.replace("/", undefined, { shallow: true });
      if (!payload) return;

      const findItem = (id) => invStones.find((s) => s.id === id) || null;
      const centerItems = (payload.centers || [])
        .map((c) => findItem(c.id))
        .filter(Boolean);
      const sideEntries = (payload.sides || [])
        .map((s) => ({ item: findItem(s.id), setting: s.setting }))
        .filter((e) => e.item);

      // Nothing resolvable — abort quietly (item may be out of inventory).
      if (centerItems.length === 0 && sideEntries.length === 0) return;

      // Stage the build and open the existing CalcLoadDialog (New / Add).
      setCalcBuild({ payload, centerItems, sideEntries });
      setCalcLoadItem({
        name: "טיוטת בניית תכשיט",
        caratWeight:
          centerItems.reduce((s, i) => s + (parseFloat(i.caratWeight) || 0), 0) || null,
        __build: true,
      });
      return;
    }

    // Inventory loaded — find the matching item (single-item bridges).
    // invStones is in normalizeStone() shape: item.id = Airtable record ID.
    const recordId = v2item || v2cert;
    const item = invStones.find((s) => s.id === recordId);
    if (!item) return; // item not found in current inventory — no action

    // Clear params before triggering flows to prevent re-fire.
    router.replace("/", undefined, { shallow: true });

    if (v2item) {
      // Calculator bridge: role comes from query param.
      const role = router.query?.role || "center";
      handleRoleChosenForCalc(item, role);
    } else if (v2cert) {
      // Certificate bridge: use existing handleCertFromItem flow.
      handleCertFromItem(item);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query, invStones]);

  const doReset = useCallback(() => {
    setCfg({ ...DCFG, centerStones: [] });
    setPieceImg(null);
    setTab("calc");
    setShowResetConfirm(false);
    qNum.current = `LS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  }, []);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPieceImg(ev.target.result);
    reader.readAsDataURL(file);
  }, []);

  const calculatorData = useMemo(() => ({ cfg, res, fmtFn, pieceImg, qNum: qNum.current }), [cfg, res, fmtFn, pieceImg]);

  const handleTabChange = useCallback((newTab) => {
    setTab(newTab);
    if (!invFetched.current && (newTab === "malai" || newTab === "intake")) {
      invFetched.current = true;
      setInvLoading(true);
      setInvError(null);
      Promise.all([
        fetch("/api/airtable/stones").then((r) => r.json()),
        fetch("/api/airtable/metals").then((r) => r.json()),
      ])
        .then(([stonesData, metalsData]) => {
          const metals = metalsData.metals || [];
          setInvStones(stonesData.stones || []);
          setInvMetals(metals);
          setInvLoading(false);
          const derived = buildMetalPrices(metals);
          if (Object.keys(derived).length > 0) setMetalPrices(derived);
        })
        .catch((err) => {
          setInvError("Failed to load inventory — " + err.message);
          setInvLoading(false);
        });
    }
  }, []);

  // ── v5.5.1: "Use in Calculator" — ROLE first, then New/Add ───────────────
  /**
   * Order (single item):
   *   1. InventoryStudio shows UseAsDialog (role: center / side / part).
   *   2. onRoleChosenForCalc(item, role) stores both and opens CalcLoadDialog.
   *   3. CalcLoadDialog resolves (new / add) → prefillCalcFromItem runs.
   *
   * calcRole holds the chosen role between step 2 and step 3.
   */
  const handleRoleChosenForCalc = useCallback((item, role) => {
    setCalcRole(role);
    setCalcLoadItem(item);   // opens CalcLoadDialog (New / Add)
  }, []);

  const handleCalcLoadSelected = useCallback((mode) => {
    // v2.5: full Builder draft takes priority when staged.
    if (calcBuild) {
      const build = calcBuild;
      setCalcBuild(null);
      setCalcLoadItem(null);
      applyBuildToCfg(build, mode);
      return;
    }
    // Batch path takes priority when a tray batch is awaiting New/Add.
    if (calcBatch) {
      const { items, useAs } = calcBatch;
      setCalcBatch(null);
      applyBatchToCfg(items, useAs, mode);
      return;
    }
    const item = calcLoadItem;
    const role = calcRole;
    setCalcLoadItem(null);
    setCalcRole(null);
    if (item) prefillCalcFromItem(item, role || "center", mode);
  }, [calcBuild, calcBatch, calcLoadItem, calcRole]);

  /**
   * Runs the actual prefill. mode ∈ { "new", "add" }, default "new".
   * Start New clears all prior calculator data (metal, stones, manual values)
   * via DCFG; Add appends to the current cfg. Multiple center stones are kept
   * as separate items. Manual override remains possible afterwards.
   */
  const prefillCalcFromItem = useCallback((item, useAs, mode) => {
    const isNew = mode !== "add";  // default to "new"

    const totalCt = parseFloat(item.caratWeight) || 0;
    const count   = Math.max(1, parseInt(item.stoneCount, 10) || 1);
    const ctPer   = totalCt > 0 ? totalCt / count : 0;

    setCfg((prev) => {
      // Start New: reset to DCFG, then overlay
      const base = isNew ? { ...DCFG, centerStones: [] } : { ...prev };
      if (!Array.isArray(base.centerStones)) base.centerStones = [];

      if (useAs === "center") {
        if (item.stoneType)  base.centerType    = item.stoneType;
        if (ctPer > 0)       base.centerCt      = ctPer.toFixed(2);
        base.centerCount     = String(count);
        if (item.color   && item.stoneType === "Diamond") base.centerColor   = item.color;
        if (item.clarity && item.stoneType === "Diamond") base.centerClarity = item.clarity;
        base.centerManual    = "";
        base.centerMode      = "total";

        const stoneEntry = {
          source:            "inventory",
          inventoryId:       item.id,
          stoneType:         item.stoneType || "",
          shape:             item.cutForm   || item.stoneShape || "",
          carat:             ctPer > 0 ? `${ctPer.toFixed(2)} ct` : "",
          color:             item.color     || "",
          clarity:           item.clarity   || "",
          cost:              item.costUsd   || 0,
          certificateLab:    item.certLab   || "",
          certificateNumber: item.certNumber || item.laserInscription || "",
        };
        const already = base.centerStones.some(s => s.inventoryId === item.id);
        if (!already) base.centerStones = [...base.centerStones, stoneEntry];

      } else if (useAs === "side") {
        if (item.stoneType)  base.ss1Type      = item.stoneType;
        if (ctPer > 0)       base.ss1Ct        = ctPer.toFixed(3);
        base.ss1Count        = String(count);
        base.ss1Manual       = "";
        base.ss1PriceMode    = "total";
        if (item.cutForm || item.stoneShape) base.ss1Shape = item.cutForm || item.stoneShape;
      }
      // "part": navigate for manual component entry; no engine fields forced.
      return base;
    });

    setCalcSrcBanner({
      name:  item.name || item.sku || item.stoneType || "פריט מלאי",
      useAs,
      mode:  isNew ? "new" : "add",
    });

    handleTabChange("calc");
  }, [handleTabChange]);

  const handleRemoveCenterStone = useCallback((index) => {
    setCfg(prev => ({ ...prev, centerStones: (prev.centerStones||[]).filter((_,i) => i !== index) }));
  }, []);

  // ── v5.5: Multi-item batch from Work Tray ──────────────────────────────────
  /**
   * Loads an array of inventory items into the calculator with a single shared
   * role. Starts a NEW product (clears prior data), then loads every item:
   *   • useAs "center" → each item appended as a separate center stone
   *     (true multiple-center-stone support; never collapsed into quantity).
   *   • useAs "side"   → items fill side row 1 (ss1) then side row 2 (ss2).
   *     The calculator engine currently exposes two side rows; if more than
   *     two side items are sent, only the two available rows are filled and the
   *     banner states how many were loaded. No silent fabrication of fields.
   *   • useAs "part"   → navigates to the calculator for manual component entry.
   */
  const handleSendBatchToCalculator = useCallback((items, useAs) => {
    if (!items || items.length === 0 || !useAs) return;
    // v5.5.1: role already chosen in WorkTray; now ask New/Add before loading.
    setCalcBatch({ items, useAs });
    setCalcLoadItem({
      name: `${items.length} פריטים מהמגש`,
      caratWeight: items.reduce((s, i) => s + (parseFloat(i.caratWeight) || 0), 0) || null,
      __batch: true,
    });
  }, []);

  /**
   * Applies a tray batch to the calculator with a shared role + load mode.
   * mode ∈ { "new", "add" } (default "new"). Start New clears prior data;
   * Add appends to current cfg. Center stones stay separate; side fills the
   * two engine rows; part navigates for manual entry. Manual override remains.
   */
  const applyBatchToCfg = useCallback((items, useAs, mode) => {
    const isNew = mode !== "add";

    setCfg((prev) => {
      const base = isNew ? { ...DCFG, centerStones: [] } : { ...prev };
      if (!Array.isArray(base.centerStones)) base.centerStones = [];

      if (useAs === "center") {
        items.forEach((item) => {
          const totalCt = parseFloat(item.caratWeight) || 0;
          const count   = Math.max(1, parseInt(item.stoneCount, 10) || 1);
          const ctPer   = totalCt > 0 ? totalCt / count : 0;
          const entry = {
            source:            "inventory",
            inventoryId:       item.id,
            stoneType:         item.stoneType || "",
            shape:             item.cutForm   || item.stoneShape || "",
            carat:             ctPer > 0 ? `${ctPer.toFixed(2)} ct` : "",
            color:             item.color     || "",
            clarity:           item.clarity   || "",
            cost:              item.costUsd   || 0,
            certificateLab:    item.certLab   || "",
            certificateNumber: item.certNumber || item.laserInscription || "",
          };
          if (!base.centerStones.some(s => s.inventoryId === item.id)) {
            base.centerStones = [...base.centerStones, entry];
          }
        });
        // Mirror first stone into editable center fields (engine source of truth).
        const first = items[0];
        const ft = parseFloat(first.caratWeight) || 0;
        const fc = Math.max(1, parseInt(first.stoneCount, 10) || 1);
        const fper = ft > 0 ? ft / fc : 0;
        if (first.stoneType) base.centerType = first.stoneType;
        if (fper > 0)        base.centerCt   = fper.toFixed(2);
        base.centerCount = String(fc);
        if (first.color   && first.stoneType === "Diamond") base.centerColor   = first.color;
        if (first.clarity && first.stoneType === "Diamond") base.centerClarity = first.clarity;

      } else if (useAs === "side") {
        const rows = ["ss1", "ss2"];
        items.slice(0, rows.length).forEach((item, idx) => {
          const prefix  = rows[idx];
          const totalCt = parseFloat(item.caratWeight) || 0;
          const count   = Math.max(1, parseInt(item.stoneCount, 10) || 1);
          const ctPer   = totalCt > 0 ? totalCt / count : 0;
          if (item.stoneType) base[`${prefix}Type`]  = item.stoneType;
          if (ctPer > 0)      base[`${prefix}Ct`]    = ctPer.toFixed(3);
          base[`${prefix}Count`]     = String(count);
          base[`${prefix}Manual`]    = "";
          base[`${prefix}PriceMode`] = "total";
          if (item.cutForm || item.stoneShape) base[`${prefix}Shape`] = item.cutForm || item.stoneShape;
        });
      }
      // "part": no engine fields forced — navigate for manual entry.
      return base;
    });

    const loadedNote =
      useAs === "center" ? `${items.length} אבני מרכז`
      : useAs === "side" ? `${Math.min(items.length, 2)} אבני צד${items.length > 2 ? ` (מתוך ${items.length} — שתי שורות זמינות)` : ""}`
      : `${items.length} רכיבים`;

    setCalcSrcBanner({
      name:  `${items.length} פריטים מהמגש → ${loadedNote}`,
      useAs,
      mode:  isNew ? "new" : "add",
    });

    handleTabChange("calc");
  }, [handleTabChange]);

  // ── v2.5: full Builder draft → calculator ──────────────────────────────────
  /**
   * Applies a v2 Jewelry Build draft to the calculator with a load mode.
   * mode ∈ { "new", "add" } (default "new").
   *
   * Mapping (safe-only; no pricing invented, no new cfg fields):
   *   • Center stones  → each a SEPARATE center stone (never collapsed),
   *     deduped by inventoryId. First stone mirrored into editable center fields.
   *   • Side groups    → first two only, into the engine's ss1/ss2 rows
   *     (type, carat, count, shape, setting). Third+ go into the note.
   *   • Components     → selected-components NOTE only.
   *   • Metal          → cfg.metal ONLY when an exact safe MVP mapping exists.
   *   • Side color/clarity, overflow, unmapped metal, draft notes → cfg.notes.
   *
   * Every item is the MVP's own normalizeStone shape (re-resolved in the bridge
   * receiver). Manual override remains possible afterward.
   */
  const applyBuildToCfg = useCallback((build, mode) => {
    const isNew = mode !== "add";
    const { payload, centerItems, sideEntries } = build;
    const centers = centerItems || [];
    const sides   = sideEntries || [];

    setCfg((prev) => {
      const base = isNew ? { ...DCFG, centerStones: [] } : { ...prev };
      if (!Array.isArray(base.centerStones)) base.centerStones = [];

      // ── Center stones — separate items ──
      centers.forEach((item) => {
        const totalCt = parseFloat(item.caratWeight) || 0;
        const count   = Math.max(1, parseInt(item.stoneCount, 10) || 1);
        const ctPer   = totalCt > 0 ? totalCt / count : 0;
        const entry = {
          source:            "inventory",
          inventoryId:       item.id,
          stoneType:         item.stoneType || "",
          shape:             item.cutForm   || item.stoneShape || "",
          carat:             ctPer > 0 ? `${ctPer.toFixed(2)} ct` : "",
          color:             item.color     || "",
          clarity:           item.clarity   || "",
          cost:              item.costUsd   || 0,
          certificateLab:    item.certLab   || "",
          certificateNumber: item.certNumber || item.laserInscription || "",
        };
        if (!base.centerStones.some((s) => s.inventoryId === item.id)) {
          base.centerStones = [...base.centerStones, entry];
        }
      });
      // Mirror first center into editable engine fields (source of truth).
      if (centers.length > 0) {
        const first = centers[0];
        const ft = parseFloat(first.caratWeight) || 0;
        const fc = Math.max(1, parseInt(first.stoneCount, 10) || 1);
        const fper = ft > 0 ? ft / fc : 0;
        if (first.stoneType) base.centerType = first.stoneType;
        if (fper > 0)        base.centerCt   = fper.toFixed(2);
        base.centerCount = String(fc);
        if (first.color   && first.stoneType === "Diamond") base.centerColor   = first.color;
        if (first.clarity && first.stoneType === "Diamond") base.centerClarity = first.clarity;
      }

      // ── Side groups — first two rows only ──
      const rows = ["ss1", "ss2"];
      sides.slice(0, MVP_SIDE_ROW_LIMIT).forEach((entry, idx) => {
        const item    = entry.item;
        const prefix  = rows[idx];
        const totalCt = parseFloat(item.caratWeight) || 0;
        const count   = Math.max(1, parseInt(item.stoneCount, 10) || 1);
        const ctPer   = totalCt > 0 ? totalCt / count : 0;
        if (item.stoneType) base[`${prefix}Type`] = item.stoneType;
        if (ctPer > 0)      base[`${prefix}Ct`]   = ctPer.toFixed(3);
        base[`${prefix}Count`]     = String(count);
        base[`${prefix}Manual`]    = "";
        base[`${prefix}PriceMode`] = "total";
        if (item.cutForm || item.stoneShape) base[`${prefix}Shape`] = item.cutForm || item.stoneShape;
        if (entry.setting) base[`${prefix}Setting`] = entry.setting; // mapped v2→MVP setting
      });

      // ── Metal — only on exact safe mapping ──
      if (payload && payload.metal) base.metal = payload.metal;

      // ── Notes — components, overflow, side grades, unmapped metal, draft notes ──
      const buildNote = composeBuildNote(payload || {});
      if (buildNote) {
        base.notes = isNew
          ? buildNote
          : [base.notes, buildNote].filter(Boolean).join("\n");
      }

      return base;
    });

    const sideMapped   = Math.min(sides.length, MVP_SIDE_ROW_LIMIT);
    const sideOverflow = Math.max(0, sides.length - MVP_SIDE_ROW_LIMIT);
    const parts = [
      centers.length ? `${centers.length} אבני מרכז` : null,
      sides.length ? `${sideMapped} אבני צד${sideOverflow ? ` (+${sideOverflow} בהערה)` : ""}` : null,
    ].filter(Boolean);

    setCalcSrcBanner({
      name:  `טיוטת בנייה → ${parts.join(" · ") || "טיוטה"}`,
      useAs: "build",
      mode:  isNew ? "new" : "add",
    });

    handleTabChange("calc");
  }, [handleTabChange]);

  // ── v5.4.1 Task 3: correct certificate creation ───────────────────────────
  const handleCertFromItem = useCallback((item) => {
    const mapping = mapProductTypeToCertificate(item.productType);

    // jewelry_part: ask for confirmation first
    if (mapping.reportType === null) {
      setCertPartConfirm(item);
      return;
    }

    _buildAndSeedCert(item, mapping);
  }, []);

  const handleCertPartConfirmed = useCallback(() => {
    const item = certPartConfirm;
    setCertPartConfirm(null);
    if (!item) return;
    _buildAndSeedCert(item, { reportType: "inhouse_stone", productType: "natural_diamond" });
  }, [certPartConfirm]);

  function _buildAndSeedCert(item, mapping) {
    const today = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit", month: "long", year: "numeric",
    }).format(new Date());

    const caratStr = item.caratWeight ? parseFloat(item.caratWeight).toFixed(2) : "";

    const measParts = [item.measLength, item.measWidth, item.measHeight]
      .filter(Boolean).map(v => parseFloat(v).toFixed(2));
    const measurements = measParts.length >= 2 ? measParts.join(" × ") + " mm" : "";

    // v5.4.1: build classification metadata for InHouseStoneReport
    const classification = buildStoneClassification({
      ...item,
      productType:  mapping.productType || item.productType,
    });

    const reportData = {
      reportType:     mapping.reportType,
      productType:    mapping.productType,  // ← uses CORRECT mapping, not item.productType raw
      reportNumber:   item.sku || `LS-INV-${Date.now().toString(36).toUpperCase()}`,
      reportDate:     today,
      classification, // v5.4.1

      stone: {
        type:             item.stoneType              || "",
        naturalOrLab:     item.growthMethod           ? "Lab" : "Natural",
        species:          "",
        variety:          "",
        shape:            item.stoneShape             || "",
        cutForm:          item.cutForm                || "",
        carat:            caratStr,
        measLength:       item.measLength             ? String(item.measLength) : "",
        measWidth:        item.measWidth              ? String(item.measWidth)  : "",
        measDepth:        item.measHeight             ? String(item.measHeight) : "",
        measurements,
        color:            item.color                  || "",
        clarity:          item.clarity                || "",
        cut:              item.cutGrade               || "",
        polish:           item.polish                 || "",
        symmetry:         item.symmetry               || "",
        fluorescenceIntensity: item.fluorescenceIntensity || "",
        fluorescenceColor:     item.fluorescenceColor     || "",
        fluorescence:     [item.fluorescenceIntensity, item.fluorescenceColor].filter(Boolean).join(" "),
        fancyColorHue:       item.fancyColorHue       || "",
        fancyColorIntensity: item.fancyColorIntensity || "",
        fancyColorOrigin:    "",
        growthMethod:     item.growthMethod            || "",
        colorDescription: item.color                  || "",
        transparency:     item.transparency            || "",
        treatment:        "",
        countryOfOrigin:  "",
        certLab:          item.certLab                || "",
        certNumber:       item.certNumber || item.laserInscription || "",
      },

      images:     (item.inventoryImages && item.inventoryImages.length > 0)
                    ? item.inventoryImages.slice(0, 3)
                    : (item.thumbnailUrl ? [item.thumbnailUrl] : []),
      imageCrops: [],

      externalReports: item.certLab
        ? [{ lab: item.certLab, reportNumber: item.certNumber || item.laserInscription || "" }]
        : [],

      comments: [
        item.internalNotes || null,
        item.name ? `Source: ${item.name}` : null,
      ].filter(Boolean).join("\n"),

      verification: {
        verificationId:  item.verificationId  || "",
        verificationUrl: item.verificationUrl || "",
        qrImageUrl:      "",
      },

      credentials: {
        signatoryName:     "Leshem Simon",
        title:             "Founder \u00b7 Certified Diamond Grader & Expert Jeweler",
        companyLine:       "LESHEM.S Jewelry \u00b7 Tuval St 23, Ramat Gan \u00b7 VAT: 046240016",
        examinerName:      "",
        examinerTitle:     "",
        signatureImageUrl: "",
        signatureSize:     "medium",
      },

      displaySettings: { showReferencePanel: true },
    };

    setCertSeed({ reportType: mapping.reportType, reportData, fromItemId: item.id });
    handleTabChange("cert");
  }

  return (
    <>
      <Head>
        <title>LESHEM.S OS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;1,400&family=Assistant:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
        <style>{PAGE_CSS}</style>
        <style>{PRINT_CSS}</style>
      </Head>

      {/* Global dialogs */}
      {showResetConfirm && (
        <ConfirmDialog
          message="האם לאפס את המחשבון? שינויים שלא נשמרו יאבדו."
          confirmLabel="איפוס" cancelLabel="ביטול"
          onConfirm={doReset} onCancel={() => setShowResetConfirm(false)}
        />
      )}

      {/* v5.5.1: CalcLoadDialog — "Start New / Add to Current" (shown after role) */}
      {calcLoadItem && (
        <CalcLoadDialog
          item={calcLoadItem}
          onSelect={handleCalcLoadSelected}
          onCancel={() => {
            setCalcLoadItem(null);
            setCalcRole(null);
            setCalcBatch(null);
            setCalcBuild(null);
          }}
        />
      )}

      {/* v5.4.1 Task 3: jewelry_part certificate confirmation */}
      {certPartConfirm && (
        <ConfirmDialog
          message={`פריט מסוג "חלק / רכיב תכשיט" אינו מוגדר לתעודה ברירת מחדל. האם ליצור תעודה אבן עבור ${certPartConfirm.name || certPartConfirm.sku || "פריט זה"}?`}
          confirmLabel="כן, צור תעודה" cancelLabel="ביטול"
          onConfirm={handleCertPartConfirmed}
          onCancel={() => setCertPartConfirm(null)}
        />
      )}

      <div dir="rtl" style={{ minHeight:"100vh", display:"flex", flexDirection:"column", background:C.iv }}>

        {/* HEADER */}
        <header className="no-print" style={{ background:C.ch, padding:"0 16px", display:"flex", alignItems:"center", gap:12, height:56, flexShrink:0, borderBottom:`2px solid ${C.gd}` }}>
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"baseline", gap:8, flexShrink:0 }}>
            <span style={{ fontFamily:C.ser, fontSize:16, fontWeight:700, color:C.iv, letterSpacing:"0.18em" }}>LESHEM.S</span>
            <span style={{ fontFamily:C.dat, fontSize:8.5, color:C.chx, letterSpacing:"0.12em", textTransform:"uppercase" }}>OS v5</span>
          </div>

          {/* v5.4.1 Task 6: Global CommandBar — compact mode in header */}
          <div style={{ flex:1, maxWidth:500 }}>
            <CommandBar
              compact
              onNavigate={handleTabChange}
              onSearch={() => { handleTabChange("malai"); }}
              onCalculate={() => handleTabChange("calc")}
              onCertificate={() => handleTabChange("cert")}
              onClearFilters={() => {}}
              allItems={invStones}
            />
          </div>

          {/* Currency + Reset */}
          <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
            <div style={{ display:"flex", border:`1.5px solid ${C.chm}`, borderRadius:6, overflow:"hidden", height:34 }}>
              {[["USD","$ USD"],["ILS","₪ ILS"]].map(([c,label]) => (
                <button key={c} onClick={() => setCurrency(c)} style={{ padding:"0 12px", height:"100%", background:currency===c?C.gd:"transparent", color:currency===c?C.ch:C.chx, border:"none", cursor:"pointer", fontFamily:C.heb, fontSize:11.5, fontWeight:700 }}>
                  {label}
                </button>
              ))}
            </div>
            <button onClick={() => setShowResetConfirm(true)} style={{ display:"flex", alignItems:"center", gap:5, height:34, padding:"0 12px", background:"transparent", border:`1.5px solid ${C.chm}`, borderRadius:6, color:C.chx, cursor:"pointer", fontFamily:C.heb, fontSize:11.5, fontWeight:600 }}>
              ↺ איפוס
            </button>
          </div>
        </header>

        {/* TAB BAR */}
        <nav className="no-print" style={{ background:C.ch, display:"flex", flexShrink:0, borderBottom:"1px solid rgba(54,69,79,0.3)", overflowX:"auto", scrollbarWidth:"none" }}>
          {TABS.map(({ key, icon, label, sublabel }) => {
            const active = tab === key;
            return (
              <button key={key} onClick={() => handleTabChange(key)} title={sublabel} style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2, padding:"0 20px", height:50, background:"transparent", border:"none", borderBottom:active?`3px solid ${C.gd}`:"3px solid transparent", cursor:"pointer", flexShrink:0, transition:"border-color 0.15s" }}>
                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ fontSize:13 }}>{icon}</span>
                  <span style={{ fontFamily:C.heb, fontSize:12.5, fontWeight:active?700:400, color:active?C.iv:C.chx, transition:"all 0.15s" }}>{label}</span>
                </div>
                <span style={{ fontFamily:C.dat, fontSize:8.5, color:active?C.chx:"rgba(168,188,196,0.5)", letterSpacing:"0.08em", textTransform:"uppercase" }}>{sublabel}</span>
              </button>
            );
          })}
        </nav>

        {/* MAIN CONTENT */}
        <main style={{ flex:1, overflowY:"auto", padding:"20px 16px 48px" }}>
          <div style={{ maxWidth:1360, margin:"0 auto" }}>

            {tab === "calc" && (
              <>
                {calcSrcBanner && (
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14, padding:"10px 14px", background:"rgba(197,179,88,0.10)", border:"1px solid rgba(197,179,88,0.35)", borderRadius:8 }}>
                    <span style={{ fontSize:16, flexShrink:0 }}>
                      {calcSrcBanner.useAs==="side"?"✨":calcSrcBanner.useAs==="part"?"🔗":"💎"}
                    </span>
                    <div style={{ flex:1, fontFamily:C.heb, fontSize:12.5, color:"#6a5a10" }}>
                      <strong>{calcSrcBanner.mode==="add"?"הוסף למוצר נוכחי":"מוצר חדש"} ממלאי:</strong> {calcSrcBanner.name}
                      {calcSrcBanner.useAs==="center" && " ← אבן מרכזית"}
                      {calcSrcBanner.useAs==="side"   && " ← אבני צד (שורה א׳)"}
                    </div>
                    <button onClick={() => setCalcSrcBanner(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(106,90,16,0.55)", fontSize:16, lineHeight:1, padding:"0 2px", flexShrink:0 }}>✕</button>
                  </div>
                )}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(340px, 1fr))", gap:20, alignItems:"start" }}>
                  <CalculatorForm
                    cfg={cfg} res={res} sf={sf} fmtFn={fmtFn}
                    onRemoveCenterStone={handleRemoveCenterStone}
                  />
                  <CostSummary cfg={cfg} res={res} sf={sf} fmtFn={fmtFn} pieceImg={pieceImg} fileRef={fileRef} onImageUpload={handleImageUpload} onShowCert={() => handleTabChange("cert")} />
                </div>
              </>
            )}

            {tab === "cert" && (
              <ReportEngine
                calculatorData={calculatorData}
                onBack={() => handleTabChange("calc")}
                seed={certSeed}
                onSeedConsumed={() => setCertSeed(null)}
              />
            )}

            {tab === "malai" && (
              <InventoryStudio
                stones={invStones}
                metals={invMetals}
                loading={invLoading}
                error={invError}
                onAddNew={() => handleTabChange("intake")}
                onUseInCalculator={handleRoleChosenForCalc}
                onCreateCertificate={handleCertFromItem}
                onNavigateToCalc={() => handleTabChange("calc")}
                onNavigateToCert={() => handleTabChange("cert")}
                // v5.5.1: ROLE-first. Studio asks role then calls
                // onRoleChosenForCalc(item, role); index then shows New/Add.
                onRoleChosenForCalc={handleRoleChosenForCalc}
                onSendBatchToCalculator={handleSendBatchToCalculator}
              />
            )}

            {tab === "intake" && (
              <ProductIntakeWizard
                onOpenInventory={() => handleTabChange("malai")}
                onCreateReport={() => handleTabChange("cert")}
              />
            )}

          </div>
        </main>
      </div>
    </>
  );
}
