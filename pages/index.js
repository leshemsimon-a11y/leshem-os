/**
 * pages/index.js  —  LESHEM.S OS  (Milestone 5.0 — Airtable Read-Only)
 *
 * Changes from v4.4:
 *   + "מלאי" inventory tab added (tab key: "inventory")
 *   + inventoryStones, inventoryMetals, inventoryLoading, inventoryError state
 *   + fetchInventory() — lazy, fires once when tab is first opened
 *   + <InventoryPreview> rendered in the inventory tab
 *
 * Unchanged from v4.4:
 *   + All calculator state and callbacks
 *   + ReportEngine + calculatorData bundle
 *   + Header, currency toggle, reset button
 *   + All report components
 */

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import Head from "next/head";

// ─── Lib ──────────────────────────────────────────────────────────────────────
import { DCFG, C }        from "../lib/constants";
import { calcApp, fmt }   from "../lib/calculations";
import { PRINT_CSS }      from "../lib/printCss";

// ─── Calculator components (unchanged) ───────────────────────────────────────
import { CalculatorForm }  from "../components/CalculatorForm";
import { CostSummary }     from "../components/CostSummary";

// ─── Report Engine (unchanged) ────────────────────────────────────────────────
import { ReportEngine }    from "../components/reports/ReportEngine";

// ─── Inventory Preview (Milestone 5.0) ───────────────────────────────────────
import { InventoryPreview } from "../components/InventoryPreview";

// ─── Global page styles ───────────────────────────────────────────────────────
const PAGE_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { font-size: 16px; }
  body { background: #FAF9F6; font-family: 'Assistant', 'Heebo', Arial, sans-serif; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(54,69,79,0.2); border-radius: 3px; }
  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #C5B358 !important;
    box-shadow: 0 0 0 3px rgba(197,179,88,0.15);
  }
  button { font-family: 'Assistant', 'Heebo', Arial, sans-serif; }
  select option { background: #fff; color: #36454F; }
`;

// ─────────────────────────────────────────────────────────────────────────────
export default function LeshemOS() {

  // ── Calculator state ──────────────────────────────────────────────────────
  const [cfg,      setCfg]      = useState({ ...DCFG });
  const [currency, setCurrency] = useState("USD");
  const [tab,      setTab]      = useState("calc");
  const [pieceImg, setPieceImg] = useState(null);

  const qNum    = useRef(
    `LS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`
  );
  const fileRef = useRef(null);

  // ── Inventory state (Milestone 5.0) ──────────────────────────────────────
  const [invStones,  setInvStones]  = useState([]);
  const [invMetals,  setInvMetals]  = useState([]);
  const [invLoading, setInvLoading] = useState(false);
  const [invError,   setInvError]   = useState(null);
  // Track whether we have fetched at least once so we don't re-fetch on re-visit
  const invFetched = useRef(false);

  // ── Calculator callbacks ──────────────────────────────────────────────────
  const sf = useCallback(
    (field, value) => setCfg((prev) => ({ ...prev, [field]: value })),
    []
  );

  const res   = useMemo(() => calcApp(cfg), [cfg]);
  const fmtFn = useCallback((v) => fmt(v, currency), [currency]);

  const handleReset = useCallback(() => {
    setCfg({ ...DCFG });
    setPieceImg(null);
    setTab("calc");
    qNum.current = `LS-${new Date().getFullYear()}-${String(
      Math.floor(Math.random() * 9000) + 1000
    )}`;
  }, []);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPieceImg(ev.target.result);
    reader.readAsDataURL(file);
  }, []);

  // ── Calculator data bundle — passed to ReportEngine ───────────────────────
  const calculatorData = useMemo(() => ({
    cfg,
    res,
    fmtFn,
    pieceImg,
    qNum: qNum.current,
  }), [cfg, res, fmtFn, pieceImg]);

  // ── Inventory fetch ───────────────────────────────────────────────────────
  /**
   * Fetches stones and metals from the server-side API routes.
   * Called lazily when the inventory tab is first opened, or explicitly
   * on retry after an error.
   *
   * The API routes proxy the Airtable token — it never reaches the browser.
   */
  const fetchInventory = useCallback(async () => {
    setInvLoading(true);
    setInvError(null);

    try {
      // Fetch stones and metals in parallel
      const [stonesRes, metalsRes] = await Promise.all([
        fetch("/api/airtable/stones"),
        fetch("/api/airtable/metals"),
      ]);

      // Parse JSON for both responses
      const [stonesData, metalsData] = await Promise.all([
        stonesRes.json(),
        metalsRes.json(),
      ]);

      // Check for API-level errors in the response body
      if (stonesData.error && !stonesRes.ok) {
        throw new Error(stonesData.error);
      }
      if (metalsData.error && !metalsRes.ok) {
        throw new Error(metalsData.error);
      }

      setInvStones(Array.isArray(stonesData.stones) ? stonesData.stones : []);
      setInvMetals(Array.isArray(metalsData.metals) ? metalsData.metals : []);
      invFetched.current = true;

      // Surface partial errors (e.g., one API configured, other not)
      const partialErrors = [stonesData.error, metalsData.error].filter(Boolean);
      if (partialErrors.length > 0) {
        setInvError(partialErrors.join(" | "));
      }
    } catch (err) {
      setInvError(err.message || "Failed to load inventory from Airtable.");
    } finally {
      setInvLoading(false);
    }
  }, []);

  // Lazy-load inventory the first time the tab is opened
  useEffect(() => {
    if (tab === "inventory" && !invFetched.current && !invLoading) {
      fetchInventory();
    }
  }, [tab, invLoading, fetchInventory]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>LESHEM.S OS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;1,400&family=Assistant:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <style>{PAGE_CSS}</style>
        <style>{PRINT_CSS}</style>
      </Head>

      {/* ══ ROOT SHELL ══════════════════════════════════════════════════════ */}
      <div
        dir="rtl"
        style={{
          minHeight:     "100vh",
          display:       "flex",
          flexDirection: "column",
          background:    C.iv,
        }}
      >

        {/* ════════ HEADER ════════════════════════════════════════════════ */}
        <header
          className="no-print"
          style={{
            background:     C.ch,
            padding:        "0 24px",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            height:         60,
            flexShrink:     0,
            borderBottom:   `2px solid ${C.gd}`,
          }}
        >
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span
              style={{
                fontFamily:    "'Merriweather','Times New Roman',Georgia,serif",
                fontSize:      17,
                fontWeight:    700,
                color:         C.iv,
                letterSpacing: "0.18em",
              }}
            >
              LESHEM.S
            </span>
            <span
              style={{
                fontFamily:    "'DM Sans',Helvetica,Arial,sans-serif",
                fontSize:      9,
                color:         C.chx,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              OS v5
            </span>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Currency toggle */}
            <div
              style={{
                display:      "flex",
                border:       `1.5px solid ${C.chm}`,
                borderRadius: 6,
                overflow:     "hidden",
                height:       38,
              }}
            >
              {[["USD", "$ USD"], ["ILS", "₪ ILS"]].map(([c, label]) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  style={{
                    padding:    "0 14px",
                    height:     "100%",
                    background: currency === c ? C.gd : "transparent",
                    color:      currency === c ? C.ch : C.chx,
                    border:     "none",
                    cursor:     "pointer",
                    fontFamily: C.heb,
                    fontSize:   12,
                    fontWeight: 700,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Reset */}
            <button
              onClick={handleReset}
              style={{
                display:      "flex",
                alignItems:   "center",
                gap:          6,
                height:       38,
                padding:      "0 14px",
                background:   "transparent",
                border:       `1.5px solid ${C.chm}`,
                borderRadius: 6,
                color:        C.chx,
                cursor:       "pointer",
                fontFamily:   C.heb,
                fontSize:     12,
                fontWeight:   600,
              }}
            >
              ↺ אפס
            </button>
          </div>
        </header>

        {/* ════════ TAB BAR ════════════════════════════════════════════════ */}
        <nav
          className="no-print"
          style={{
            background:   C.ch,
            display:      "flex",
            flexShrink:   0,
            borderBottom: "1px solid rgba(54,69,79,0.3)",
          }}
        >
          {[
            ["calc",      "🔢", "מחשבון"],
            ["cert",      "📋", "דוחות" ],
            ["inventory", "🗂", "מלאי"  ],
          ].map(([t, icon, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                display:       "flex",
                alignItems:    "center",
                gap:           8,
                padding:       "0 24px",
                height:        48,
                background:    "transparent",
                border:        "none",
                borderBottom:  tab === t ? `3px solid ${C.gd}` : "3px solid transparent",
                color:         tab === t ? C.iv : C.chx,
                fontFamily:    C.heb,
                fontSize:      13,
                fontWeight:    tab === t ? 700 : 400,
                cursor:        "pointer",
                letterSpacing: "0.02em",
              }}
            >
              <span style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        {/* ════════ MAIN CONTENT ══════════════════════════════════════════ */}
        <main
          style={{
            flex:      1,
            overflowY: "auto",
            padding:   "24px 16px 48px",
          }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>

            {/* ── CALCULATOR TAB ───────────────────────────────────────── */}
            {tab === "calc" && (
              <div
                style={{
                  display:             "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                  gap:                 20,
                  alignItems:          "start",
                }}
              >
                <CalculatorForm cfg={cfg} res={res} sf={sf} fmtFn={fmtFn} />
                <CostSummary
                  cfg={cfg}
                  res={res}
                  sf={sf}
                  fmtFn={fmtFn}
                  pieceImg={pieceImg}
                  fileRef={fileRef}
                  onImageUpload={handleImageUpload}
                  onShowCert={() => setTab("cert")}
                />
              </div>
            )}

            {/* ── REPORTS TAB ─────────────────────────────────────────── */}
            {/*
              ReportEngine manages all its own internal routing.
              Editor column: className="no-print" → hidden at print time.
              Preview column: NO class → .printable-container is print target.
            */}
            {tab === "cert" && (
              <ReportEngine
                calculatorData={calculatorData}
                onBack={() => setTab("calc")}
              />
            )}

            {/* ── INVENTORY TAB (Milestone 5.0) ────────────────────────── */}
            {/*
              Fetches lazily on first open via fetchInventory().
              The API routes proxy Airtable — no token in the browser.
              "Use in Calculator" / "Use in Report" wired in Milestone 5.1.
            */}
            {tab === "inventory" && (
              <InventoryPreview
                stones={invStones}
                metals={invMetals}
                loading={invLoading}
                error={invError}
                onRetry={() => {
                  invFetched.current = false;
                  fetchInventory();
                }}
              />
            )}

          </div>
        </main>
      </div>
    </>
  );
}
