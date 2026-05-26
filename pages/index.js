/**
 * pages/index.js — LESHEM.S OS v3.0
 *
 * App shell. This file's ONLY responsibilities are:
 *   • App-level React state (cfg, currency, tab, pieceImg)
 *   • The `sf` field-setter and `handleReset`
 *   • Memoised derived values (res, fmtFn)
 *   • The <Head> block (fonts + injected PRINT_CSS)
 *   • Header (brand, currency toggle, reset)
 *   • Tab bar (מחשבון / תעודה)
 *   • Routing: renders CalculatorForm + CostSummary, or Certificate
 *
 * Zero business logic. Zero styling decisions.
 * All of those live in lib/ and components/.
 */

import { useState, useCallback, useMemo, useRef } from "react";
import Head from "next/head";

// ── Lib
import { DCFG, C }   from "../lib/constants";
import { calcApp, fmt } from "../lib/calculations";
import { PRINT_CSS }  from "../lib/printCss";

// ── Components
import { CalculatorForm } from "../components/CalculatorForm";
import { CostSummary }    from "../components/CostSummary";
import { Certificate }    from "../components/Certificate";

// ─────────────────────────────────────────────────────────────────────
export default function LeshemOS() {

  // ── Core state ──────────────────────────────────────────────────────
  const [cfg,      setCfg]      = useState({ ...DCFG });
  const [currency, setCurrency] = useState("USD");    // "USD" | "ILS"
  const [tab,      setTab]      = useState("calc");   // "calc" | "cert"
  const [pieceImg, setPieceImg] = useState(null);

  // Stable quote number — regenerated only on reset, not on every render.
  const qNum = useRef(
    `LS-${new Date().getFullYear()}-${String(
      Math.floor(Math.random() * 9000) + 1000
    )}`
  );

  // Ref passed down to the hidden <input type="file"> in CostSummary.
  const fileRef = useRef(null);

  // ── Field setter ─────────────────────────────────────────────────────
  /**
   * sf (set field) — stable reference via useCallback.
   * Replaces a single key in cfg without touching any other field.
   * The new cfg triggers calcApp recalculation via the `res` memo below.
   */
  const sf = useCallback((field, value) => {
    setCfg((prev) => ({ ...prev, [field]: value }));
  }, []);

  // ── Derived values ───────────────────────────────────────────────────
  /** Full cost waterfall — recomputed only when cfg changes. */
  const res = useMemo(() => calcApp(cfg), [cfg]);

  /**
   * Currency formatter — recomputed only when currency changes.
   * Passed down to every component that needs to display a price.
   */
  const fmtFn = useCallback((v) => fmt(v, currency), [currency]);

  // ── Handlers ─────────────────────────────────────────────────────────
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

        {/* Google Fonts — Merriweather (serif) + Assistant (Hebrew) + DM Sans */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;1,400&family=Assistant:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />

        {/* Print isolation CSS — see lib/printCss.js for full explanation */}
        <style>{PRINT_CSS}</style>
      </Head>

      {/* ══════════════ ROOT SHELL ══════════════════════════════════════ */}
      <div
        dir="rtl"
        style={{
          minHeight:     "100vh",     // NOT height:100vh — allows mobile scroll
          display:       "flex",
          flexDirection: "column",
          background:    C.iv,
          fontFamily:    C.heb,
        }}
      >

        {/* ════════════ HEADER ══════════════════════════════════════════ */}
        <header
          className="no-print"
          style={{
            background:     C.ch,
            padding:        "0 20px",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            height:         48,
            flexShrink:     0,
          }}
        >
          {/* Brand wordmark */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                fontFamily:    C.serif,
                fontSize:      15,
                color:         C.iv,
                letterSpacing: "0.15em",
              }}
            >
              LESHEM.S
            </span>
            <span
              style={{
                fontFamily:    C.eng,
                fontSize:      9,
                color:         C.chx,
                letterSpacing: "0.1em",
              }}
            >
              OS v3.0
            </span>
          </div>

          {/* Header controls: currency toggle + reset */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

            {/* USD / ILS toggle */}
            <div
              style={{
                display:      "flex",
                border:       `0.5px solid ${C.chm}`,
                borderRadius: 3,
                overflow:     "hidden",
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
                    padding:    "5px 10px",
                    background: currency === c ? C.gd : "transparent",
                    color:      currency === c ? C.ch : C.chx,
                    border:     "none",
                    cursor:     "pointer",
                    fontFamily: C.heb,
                    fontSize:   11,
                    fontWeight: 600,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Reset button */}
            <button
              onClick={handleReset}
              style={{
                display:    "flex",
                alignItems: "center",
                gap:        4,
                background: "transparent",
                border:     `0.5px solid ${C.chm}`,
                color:      C.chx,
                padding:    "5px 10px",
                cursor:     "pointer",
                fontFamily: C.heb,
                fontSize:   11,
              }}
            >
              ↺ אפס
            </button>
          </div>
        </header>

        {/* ════════════ TABS ════════════════════════════════════════════ */}
        <nav
          className="no-print"
          style={{
            background:   C.ch,
            borderBottom: `1px solid rgba(197,179,88,0.3)`,
            display:      "flex",
            flexShrink:   0,
          }}
        >
          {[
            ["calc", "🔢 מחשבון"],
            ["cert", "📄 תעודה"],
          ].map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding:      "10px 20px",
                background:   "transparent",
                border:       "none",
                borderBottom: tab === t
                  ? `2px solid ${C.gd}`
                  : "2px solid transparent",
                color:      tab === t ? C.gd : C.chx,
                fontFamily: C.heb,
                fontSize:   12,
                cursor:     "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* ════════════ MAIN CONTENT ════════════════════════════════════ */}
        <main
          style={{
            flex:      1,
            overflowY: "auto",        // scrollable — not clipped
            padding:   "16px 12px",
          }}
        >

          {/* ── CALCULATOR TAB ──────────────────────────────────────── */}
          {tab === "calc" && (
            <div
              style={{
                maxWidth:            900,
                margin:              "0 auto",
                display:             "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
                gap:                 12,
              }}
            >
              {/* Left column — metal, center stone, side stones */}
              <CalculatorForm
                cfg={cfg}
                res={res}
                sf={sf}
                fmtFn={fmtFn}
              />

              {/* Right column — cost breakdown, client info, cert button */}
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

          {/* ── CERTIFICATE TAB ─────────────────────────────────────── */}
          {tab === "cert" && (
            <div>
              {/* Toolbar — hidden on print via .no-print */}
              <div
                className="no-print"
                style={{
                  display:        "flex",
                  justifyContent: "space-between",
                  alignItems:     "center",
                  maxWidth:       900,
                  margin:         "0 auto 12px",
                }}
              >
                <button
                  onClick={() => setTab("calc")}
                  style={{
                    background: "transparent",
                    border:     `0.5px solid rgba(54,69,79,0.2)`,
                    padding:    "6px 14px",
                    cursor:     "pointer",
                    fontFamily: C.heb,
                    fontSize:   11,
                    color:      C.chl,
                  }}
                >
                  ← חזור למחשבון
                </button>

                <button
                  onClick={() => window.print()}
                  style={{
                    background: C.ch,
                    color:      C.iv,
                    border:     "none",
                    padding:    "8px 18px",
                    cursor:     "pointer",
                    fontFamily: C.heb,
                    fontSize:   12,
                    display:    "flex",
                    alignItems: "center",
                    gap:        6,
                  }}
                >
                  🖨️ הדפס / שמור כ-PDF
                </button>
              </div>

              {/* The A4 certificate — className="printable-container" is the print anchor */}
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

        </main>
      </div>
    </>
  );
}
