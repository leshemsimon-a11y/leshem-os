/**
 * pages/index.js  —  LESHEM.S OS  v5.4
 *
 * Changes from M5.3.2:
 *
 * Task 6 — Use in Calculator clears previous data:
 *   prefillCalcFromItem now calls setCfg with DCFG spread first (full reset),
 *   then overlays only the relevant fields from the inventory item.
 *   This ensures stale calculator state from a previous item doesn't bleed through.
 *
 * Task 7 — Multiple Center Stones foundation:
 *   cfg.centerStones[] is managed in app state.
 *   prefillCalcFromItem("center") pushes a new entry to centerStones[].
 *   onRemoveCenterStone removes a stone from centerStones[] by index.
 *   centerStones is passed to CalculatorForm as a prop.
 *   CalculatorForm renders it as read-only chips above the center stone panel.
 *
 * Task 10 — CommandBar callbacks:
 *   onNavigateToCalc(calcSugg): navigates to calc tab.
 *     In a future version it will prefill cfg from calcSugg.
 *   onNavigateToCert: navigates to cert tab.
 *
 * calcSrcBanner, certSeed, all inventory fetch logic — unchanged from M5.3.2.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import Head from "next/head";

import { DCFG, C }                        from "../lib/constants";
import { calcApp, fmt, buildMetalPrices } from "../lib/calculations";
import { PRINT_CSS }                      from "../lib/printCss";

import { CalculatorForm }      from "../components/CalculatorForm";
import { CostSummary }         from "../components/CostSummary";
import { ReportEngine }        from "../components/reports/ReportEngine";
import { InventoryStudio }     from "../components/inventory/InventoryStudio";
import { ProductIntakeWizard } from "../components/inventory/ProductIntakeWizard";

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
  .editor-section-nav::-webkit-scrollbar { display: none; }
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
  { key: "calc",   icon: "🔢", label: "מחשבון", sublabel: "Calculator"   },
  { key: "cert",   icon: "📋", label: "תעודות", sublabel: "Certificates"  },
  { key: "malai",  icon: "💎", label: "מלאי",   sublabel: "Inventory"     },
  { key: "intake", icon: "🗂", label: "קליטה",  sublabel: "Intake"        },
];

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
          <button onClick={onCancel} style={{ height:40, padding:"0 18px", background:"transparent", border:"1px solid rgba(54,69,79,0.22)", borderRadius:7, cursor:"pointer", fontFamily:"'Assistant','Heebo',Arial,sans-serif", fontSize:13, color:"#7a8e98" }}>
            {cancelLabel}
          </button>
          <button onClick={onConfirm} style={{ height:40, padding:"0 18px", background:"#36454F", color:"#FAF9F6", border:"none", borderRadius:7, cursor:"pointer", fontFamily:"'Assistant','Heebo',Arial,sans-serif", fontSize:13, fontWeight:700 }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LeshemOS() {

  const [cfg,              setCfg]              = useState({ ...DCFG, centerStones: [] });
  const [currency,         setCurrency]         = useState("USD");
  const [tab,              setTab]              = useState("calc");
  const [pieceImg,         setPieceImg]         = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Certificate seed from inventory bridge
  const [certSeed,     setCertSeed]     = useState(null);

  // Prefill source banner (auto-dismisses after 4 s)
  const [calcSrcBanner, setCalcSrcBanner] = useState(null);

  const qNum    = useRef(`LS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`);
  const fileRef = useRef(null);

  // Inventory state
  const invFetched = useRef(false);
  const [invStones,  setInvStones]  = useState([]);
  const [invMetals,  setInvMetals]  = useState([]);
  const [invLoading, setInvLoading] = useState(false);
  const [invError,   setInvError]   = useState(null);
  const [metalPrices, setMetalPrices] = useState({});

  const sf    = useCallback((field, value) => setCfg((prev) => ({ ...prev, [field]: value })), []);
  const res   = useMemo(() => calcApp(cfg, metalPrices), [cfg, metalPrices]);
  const fmtFn = useCallback((v) => fmt(v, currency), [currency]);

  // Auto-dismiss calc source banner after 4 s
  useEffect(() => {
    if (!calcSrcBanner) return;
    const t = setTimeout(() => setCalcSrcBanner(null), 4000);
    return () => clearTimeout(t);
  }, [calcSrcBanner]);

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

  // Lazy inventory fetch + metal price bridge
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

  // ── prefillCalcFromItem ───────────────────────────────────────────────────
  /**
   * v5.4 Task 6: Clears previous calculator item data before loading new item.
   * Spreads DCFG first (full reset), then overlays only the relevant fields.
   *
   * v5.4 Task 7: Pushes to centerStones[] when useAs === "center".
   */
  const prefillCalcFromItem = useCallback((item, useAs) => {
    const totalCt = parseFloat(item.caratWeight) || 0;
    const count   = Math.max(1, parseInt(item.stoneCount, 10) || 1);
    const ctPer   = totalCt > 0 ? totalCt / count : 0;

    setCfg((prev) => {
      // v5.4: Start from DCFG (clear previous item data)
      const next = { ...DCFG, centerStones: prev.centerStones || [] };

      if (useAs === "center") {
        if (item.stoneType)  next.centerType    = item.stoneType;
        if (ctPer > 0)       next.centerCt      = ctPer.toFixed(2);
        next.centerCount     = String(count);
        if (item.color   && item.stoneType === "Diamond") next.centerColor   = item.color;
        if (item.clarity && item.stoneType === "Diamond") next.centerClarity = item.clarity;
        next.centerManual  = "";
        next.centerMode    = "total";

        // v5.4 Task 7: Append to centerStones[]
        const stoneEntry = {
          source:            "inventory",
          inventoryId:       item.id,
          stoneType:         item.stoneType || "",
          shape:             item.cutForm   || "",
          carat:             ctPer > 0 ? `${ctPer.toFixed(2)} ct` : "",
          color:             item.color     || "",
          clarity:           item.clarity   || "",
          cost:              item.costUsd   || 0,
          certificateLab:    item.certLab   || "",
          certificateNumber: item.certNumber || item.laserInscription || "",
        };
        // Add to array (don't duplicate by inventoryId)
        const already = next.centerStones.some(s => s.inventoryId === item.id);
        if (!already) next.centerStones = [...next.centerStones, stoneEntry];

      } else if (useAs === "side") {
        if (item.stoneType)  next.ss1Type      = item.stoneType;
        if (ctPer > 0)       next.ss1Ct        = ctPer.toFixed(3);
        next.ss1Count        = String(count);
        next.ss1Manual       = "";
        next.ss1PriceMode    = "total";
      }

      return next;
    });

    setCalcSrcBanner({
      name:  item.name || item.sku || item.stoneType || "פריט מלאי",
      useAs,
    });

    handleTabChange("calc");
  }, [handleTabChange]);

  // Remove a stone from centerStones[] by index
  const handleRemoveCenterStone = useCallback((index) => {
    setCfg(prev => ({
      ...prev,
      centerStones: (prev.centerStones || []).filter((_, i) => i !== index),
    }));
  }, []);

  // ── handleCertFromItem ────────────────────────────────────────────────────
  const handleCertFromItem = useCallback((item) => {
    const today = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit", month: "long", year: "numeric",
    }).format(new Date());

    const caratStr = item.caratWeight
      ? parseFloat(item.caratWeight).toFixed(2)
      : "";

    const measParts = [item.measLength, item.measWidth, item.measHeight]
      .filter(Boolean).map((v) => parseFloat(v).toFixed(2));
    const measurements = measParts.length >= 2
      ? measParts.join(" × ") + " mm"
      : "";

    const reportData = {
      reportType:   "inhouse_stone",
      productType:  item.productType || "natural_diamond",
      reportNumber: item.sku || `LS-INV-${Date.now().toString(36).toUpperCase()}`,
      reportDate:   today,

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

    setCertSeed({ reportType: "inhouse_stone", reportData, fromItemId: item.id });
    handleTabChange("cert");
  }, [handleTabChange]);

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

      {showResetConfirm && (
        <ConfirmDialog
          message="האם לאפס את המחשבון? שינויים שלא נשמרו יאבדו."
          confirmLabel="איפוס"
          cancelLabel="ביטול"
          onConfirm={doReset}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}

      <div dir="rtl" style={{ minHeight:"100vh", display:"flex", flexDirection:"column", background:C.iv }}>

        {/* HEADER */}
        <header className="no-print" style={{ background:C.ch, padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:60, flexShrink:0, borderBottom:`2px solid ${C.gd}` }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:10 }}>
            <span style={{ fontFamily:C.ser, fontSize:17, fontWeight:700, color:C.iv, letterSpacing:"0.18em" }}>LESHEM.S</span>
            <span style={{ fontFamily:C.dat, fontSize:9, color:C.chx, letterSpacing:"0.12em", textTransform:"uppercase" }}>OS v5</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ display:"flex", border:`1.5px solid ${C.chm}`, borderRadius:6, overflow:"hidden", height:38 }}>
              {[["USD","$ USD"],["ILS","₪ ILS"]].map(([c, label]) => (
                <button key={c} onClick={()=>setCurrency(c)} style={{ padding:"0 14px", height:"100%", background:currency===c?C.gd:"transparent", color:currency===c?C.ch:C.chx, border:"none", cursor:"pointer", fontFamily:C.heb, fontSize:12, fontWeight:700 }}>
                  {label}
                </button>
              ))}
            </div>
            <button onClick={()=>setShowResetConfirm(true)} title="איפוס המחשבון" style={{ display:"flex", alignItems:"center", gap:6, height:38, padding:"0 14px", background:"transparent", border:`1.5px solid ${C.chm}`, borderRadius:6, color:C.chx, cursor:"pointer", fontFamily:C.heb, fontSize:12, fontWeight:600 }}>
              ↺ איפוס
            </button>
          </div>
        </header>

        {/* TAB BAR */}
        <nav className="no-print" style={{ background:C.ch, display:"flex", flexShrink:0, borderBottom:"1px solid rgba(54,69,79,0.3)", overflowX:"auto", scrollbarWidth:"none" }}>
          {TABS.map(({ key, icon, label, sublabel }) => {
            const active = tab === key;
            return (
              <button key={key} onClick={()=>handleTabChange(key)} title={sublabel} style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2, padding:"0 20px", height:56, background:"transparent", border:"none", borderBottom:active?`3px solid ${C.gd}`:"3px solid transparent", cursor:"pointer", flexShrink:0, transition:"border-color 0.15s" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:14 }}>{icon}</span>
                  <span style={{ fontFamily:C.heb, fontSize:13, fontWeight:active?700:400, color:active?C.iv:C.chx, textShadow:active?"0 0 12px rgba(197,179,88,0.4)":"none", transition:"all 0.15s" }}>{label}</span>
                </div>
                <span style={{ fontFamily:C.dat, fontSize:9, color:active?C.chx:"rgba(168,188,196,0.5)", letterSpacing:"0.08em", textTransform:"uppercase" }}>{sublabel}</span>
              </button>
            );
          })}
        </nav>

        {/* MAIN CONTENT */}
        <main style={{ flex:1, overflowY:"auto", padding:"24px 16px 48px" }}>
          <div style={{ maxWidth:1360, margin:"0 auto" }}>

            {tab === "calc" && (
              <>
                {/* Prefill source banner */}
                {calcSrcBanner && (
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16, padding:"11px 16px", background:"rgba(197,179,88,0.10)", border:"1px solid rgba(197,179,88,0.35)", borderRadius:8 }}>
                    <span style={{ fontSize:18, flexShrink:0 }}>
                      {calcSrcBanner.useAs === "side" ? "✨" : calcSrcBanner.useAs === "part" ? "🔗" : "💎"}
                    </span>
                    <div style={{ flex:1, fontFamily:C.heb, fontSize:12.5, color:"#6a5a10" }}>
                      <strong>מולא ממלאי:</strong> {calcSrcBanner.name}
                      {calcSrcBanner.useAs === "center" && " ← אבן מרכזית"}
                      {calcSrcBanner.useAs === "side"   && " ← אבני צד (שורה א׳)"}
                      {calcSrcBanner.useAs === "part"   && " ← ניווט למחשבון"}
                    </div>
                    <button onClick={()=>setCalcSrcBanner(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(106,90,16,0.55)", fontSize:16, lineHeight:1, padding:"0 4px", flexShrink:0 }}>✕</button>
                  </div>
                )}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(340px, 1fr))", gap:20, alignItems:"start" }}>
                  {/* v5.4: pass centerStones + onRemoveCenterStone */}
                  <CalculatorForm
                    cfg={cfg}
                    res={res}
                    sf={sf}
                    fmtFn={fmtFn}
                    onRemoveCenterStone={handleRemoveCenterStone}
                  />
                  <CostSummary cfg={cfg} res={res} sf={sf} fmtFn={fmtFn} pieceImg={pieceImg} fileRef={fileRef} onImageUpload={handleImageUpload} onShowCert={()=>handleTabChange("cert")} />
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
                onUseInCalculator={prefillCalcFromItem}
                onCreateCertificate={handleCertFromItem}
                onNavigateToCalc={() => handleTabChange("calc")}
                onNavigateToCert={() => handleTabChange("cert")}
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
