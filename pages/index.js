/**
 * pages/index.js  —  LESHEM.S OS  (UX v2)
 *
 * Shell responsibilities (unchanged from v1):
 *   • App-level state: cfg, currency, tab, pieceImg
 *   • sf field-setter, handleReset, handleImageUpload
 *   • Memoised res (calcApp) and fmtFn (fmt)
 *   • <Head>: fonts + PRINT_CSS
 *   • Header, tab bar, routing
 *
 * UX v2 visual changes:
 *   • Ivory page background with a subtle top-of-page gold rule
 *   • Header: 56 px, cleaner layout, larger currency toggle buttons
 *   • Tab bar: 48 px height, gold underline on active, clear labels
 *   • Page content: max-width 1 100 px centred, generous padding
 *   • Calculator grid: auto-fit minmax(340 px, 1fr) — 2-col on desktop,
 *     1-col on mobile, no JS/resize listener needed
 *   • Certificate tab: back button 44 px, print button 44 px
 *
 * Zero logic changes.
 */

import { useState, useCallback, useMemo, useRef } from "react";
import Head from "next/head";

import { DCFG, C }          from "../lib/constants";
import { calcApp, fmt }     from "../lib/calculations";
import { PRINT_CSS }        from "../lib/printCss";
import { CalculatorForm }   from "../components/CalculatorForm";
import { CostSummary }      from "../components/CostSummary";
import { Certificate }      from "../components/Certificate";

// ─── Global page styles injected once ────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────
export default function LeshemOS() {

  // ── State ────────────────────────────────────────────────────────────
  const [cfg,      setCfg]      = useState({ ...DCFG });
  const [currency, setCurrency] = useState("USD");
  const [tab,      setTab]      = useState("calc");
  const [pieceImg, setPieceImg] = useState(null);

  const qNum   = useRef(
    `LS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`
  );
  const fileRef = useRef(null);

  // ── Callbacks ────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────
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

      {/* ══ ROOT SHELL ══════════════════════════════════════════════════ */}
      <div
        dir="rtl"
        style={{
          minHeight:     "100vh",
          display:       "flex",
          flexDirection: "column",
          background:    C.iv,
        }}
      >

        {/* ════════════ HEADER ════════════════════════════════════════ */}
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
            // Subtle gold bottom rule
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
              OS v3
            </span>
          </div>

          {/* Controls: currency + reset */}
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
              {[
                ["USD", "$ USD"],
                ["ILS", "₪ ILS"],
              ].map(([c, label]) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  style={{
                    padding:        "0 14px",
                    height:         "100%",
                    background:     currency === c ? C.gd : "transparent",
                    color:          currency === c ? C.ch : C.chx,
                    border:         "none",
                    cursor:         "pointer",
                    fontFamily:     C.heb,
                    fontSize:       12,
                    fontWeight:     700,
                    letterSpacing:  "0.03em",
                    transition:     "background 0.15s",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Reset */}
            <button
              onClick={handleReset}
              aria-label="אפס טופס"
              style={{
                display:        "flex",
                alignItems:     "center",
                gap:            6,
                height:         38,
                padding:        "0 14px",
                background:     "transparent",
                border:         `1.5px solid ${C.chm}`,
                borderRadius:   6,
                color:          C.chx,
                cursor:         "pointer",
                fontFamily:     C.heb,
                fontSize:       12,
                fontWeight:     600,
                whiteSpace:     "nowrap",
              }}
            >
              ↺ אפס
            </button>
          </div>
        </header>

        {/* ════════════ TAB BAR ════════════════════════════════════════ */}
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
            ["calc", "🔢", "מחשבון"],
            ["cert", "📄", "תעודה"],
          ].map(([t, icon, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                display:        "flex",
                alignItems:     "center",
                gap:            8,
                padding:        "0 24px",
                height:         48,
                background:     "transparent",
                border:         "none",
                borderBottom:   tab === t
                  ? `3px solid ${C.gd}`
                  : "3px solid transparent",
                color:          tab === t ? C.iv : C.chx,
                fontFamily:     C.heb,
                fontSize:       13,
                fontWeight:     tab === t ? 700 : 400,
                cursor:         "pointer",
                letterSpacing:  "0.02em",
                transition:     "color 0.15s",
              }}
            >
              <span style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        {/* ════════════ MAIN CONTENT ════════════════════════════════════ */}
        <main
          style={{
            flex:      1,
            overflowY: "auto",
            padding:   "24px 16px 48px",
          }}
        >
          {/* Inner width constraint — centred */}
          <div
            style={{
              maxWidth: 1100,
              margin:   "0 auto",
            }}
          >

            {/* ── CALCULATOR TAB ─────────────────────────────────────── */}
            {tab === "calc" && (
              <div
                style={{
                  display:             "grid",
                  // 2-col on desktop (≥700 px available), 1-col on mobile
                  gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                  gap:                 20,
                  alignItems:          "start",
                }}
              >
                {/* Left — form inputs */}
                <CalculatorForm
                  cfg={cfg}
                  res={res}
                  sf={sf}
                  fmtFn={fmtFn}
                />

                {/* Right — cost summary + client + action */}
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

            {/* ── CERTIFICATE TAB ────────────────────────────────────── */}
            {tab === "cert" && (
              <div>
                {/* Toolbar */}
                <div
                  className="no-print"
                  style={{
                    display:        "flex",
                    justifyContent: "space-between",
                    alignItems:     "center",
                    marginBottom:   20,
                    gap:            12,
                    flexWrap:       "wrap",
                  }}
                >
                  <button
                    onClick={() => setTab("calc")}
                    style={{
                      height:       44,
                      padding:      "0 20px",
                      background:   "transparent",
                      border:       "1px solid rgba(54,69,79,0.25)",
                      borderRadius: 6,
                      cursor:       "pointer",
                      fontFamily:   C.heb,
                      fontSize:     13,
                      fontWeight:   600,
                      color:        C.chm,
                      display:      "flex",
                      alignItems:   "center",
                      gap:          8,
                    }}
                  >
                    ← חזור למחשבון
                  </button>

                  <button
                    onClick={() => window.print()}
                    style={{
                      height:         44,
                      padding:        "0 24px",
                      background:     C.ch,
                      color:          C.iv,
                      border:         "none",
                      borderRadius:   6,
                      cursor:         "pointer",
                      fontFamily:     C.heb,
                      fontSize:       14,
                      fontWeight:     600,
                      display:        "flex",
                      alignItems:     "center",
                      gap:            8,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>🖨️</span>
                    הדפס / שמור כ-PDF
                  </button>
                </div>

                {/* A4 Certificate — className="printable-container" is the print anchor */}
                <Certificate
                  cfg={cfg}
                  res={res}
                  pieceImg={pieceImg}
                  fmtFn={fmtFn}
                  qNum={qNum.current}
                  currency={currency}
                />
              </div>
            )}

          </div>{/* /max-width container */}
        </main>
      </div>
    </>
  );
}
