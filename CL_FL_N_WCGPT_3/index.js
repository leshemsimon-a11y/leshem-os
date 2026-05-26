/**
 * pages/index.js  —  LESHEM.S OS  (Certificate system v1)
 *
 * PRINT ARCHITECTURE (important):
 *   lib/printCss.js uses two rules that interact:
 *     1.  * { visibility: hidden }          — hides everything
 *     2. .printable-container { visibility: visible; position: fixed; … }
 *     3. .no-print { display: none }        — removes from layout
 *
 *   Rule: an element with visibility:visible CAN be seen even when its
 *   ancestor has visibility:hidden (CSS spec — descendant overrides ancestor).
 *   BUT: display:none on a parent prevents ALL descendants from rendering,
 *   and no child property can override it.
 *
 *   Therefore the JewelryValuationCertificate (.printable-container) must
 *   NEVER be a descendant of a .no-print element.
 *
 *   Solution in the cert tab layout:
 *     • The flex wrapper has NO no-print class.
 *     • Only the editor column has className="no-print".
 *     • The certificate column has no class — it is always rendered.
 *     • On print: editor vanishes (display:none), cert stays rendered,
 *       .printable-container overrides to visibility:visible + position:fixed.
 */

import { useState, useCallback, useMemo, useRef } from "react";
import Head from "next/head";

import { DCFG, C }        from "../lib/constants";
import { calcApp, fmt }   from "../lib/calculations";
import { PRINT_CSS }      from "../lib/printCss";

import { CalculatorForm }  from "../components/CalculatorForm";
import { CostSummary }     from "../components/CostSummary";
import {
  CertificateEditor,
  CERT_DEFAULTS,
  buildCertData,
}                          from "../components/CertificateEditor";
import { JewelryValuationCertificate } from "../components/JewelryValuationCertificate";

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

export default function LeshemOS() {

  // ── Calculator state ──────────────────────────────────────────────────
  const [cfg,      setCfg]      = useState({ ...DCFG });
  const [currency, setCurrency] = useState("USD");
  const [tab,      setTab]      = useState("calc");
  const [pieceImg, setPieceImg] = useState(null);

  const qNum   = useRef(
    `LS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`
  );
  const fileRef = useRef(null);

  // ── Certificate state ─────────────────────────────────────────────────
  const [certData, setCertData] = useState({ ...CERT_DEFAULTS });

  // ── Calculator callbacks ──────────────────────────────────────────────
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
    setCertData({ ...CERT_DEFAULTS });
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

  // ── Certificate callbacks ─────────────────────────────────────────────

  const scf = useCallback((field, value) => {
    setCertData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleOpenCert = useCallback(() => {
    setCertData(buildCertData(cfg, res, fmtFn, pieceImg, qNum.current));
    setTab("cert");
  }, [cfg, res, fmtFn, pieceImg]);

  const handleRefreshCert = useCallback(() => {
    setCertData(buildCertData(cfg, res, fmtFn, pieceImg, qNum.current));
  }, [cfg, res, fmtFn, pieceImg]);

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

      <div
        dir="rtl"
        style={{
          minHeight:     "100vh",
          display:       "flex",
          flexDirection: "column",
          background:    C.iv,
        }}
      >

        {/* ════════ HEADER ══════════════════════════════════════════ */}
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

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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

        {/* ════════ TAB BAR ════════════════════════════════════════ */}
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
            ["cert", "📄", "תעודת שמאות"],
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

        {/* ════════ MAIN CONTENT ════════════════════════════════════ */}
        <main
          style={{
            flex:      1,
            overflowY: "auto",
            padding:   "24px 16px 48px",
          }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>

            {/* ── CALCULATOR TAB ────────────────────────────────────── */}
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
                  onShowCert={handleOpenCert}
                />
              </div>
            )}

            {/* ── CERTIFICATE TAB ───────────────────────────────────── */}
            {tab === "cert" && (
              <div>

                {/* Toolbar — hidden on print */}
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

                  <span
                    style={{
                      fontFamily: "'DM Sans',Helvetica,Arial,sans-serif",
                      fontSize:   12,
                      color:      C.chl,
                      fontStyle:  "italic",
                    }}
                  >
                    Edit any field · preview updates on blur
                  </span>

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

                {/*
                  ── Side-by-side layout ──────────────────────────────────
                  This outer div has NO className="no-print".
                  On print: * { visibility:hidden } applies to this div,
                  but .printable-container overrides with visibility:visible
                  + position:fixed — it escapes the layout entirely.

                  Only the editor column carries no-print (display:none on print).
                  The certificate column is always rendered, never no-print.
                */}
                <div
                  style={{
                    display:    "flex",
                    gap:        24,
                    alignItems: "flex-start",
                    flexWrap:   "wrap",
                  }}
                >

                  {/* ── Editor column — hidden on print ─────────────── */}
                  <div
                    className="no-print"
                    style={{
                      flex:      "0 0 360px",
                      minWidth:  280,
                      maxHeight: "calc(100vh - 180px)",
                      overflowY: "auto",
                    }}
                  >
                    <CertificateEditor
                      certData={certData}
                      onFieldChange={scf}
                      onRefresh={handleRefreshCert}
                    />
                  </div>

                  {/*
                    ── Certificate preview column ───────────────────────
                    NO no-print on this column or any ancestor.
                    On screen: visible preview.
                    On print:  .printable-container inside becomes the
                               sole visible element via position:fixed + A4.
                  */}
                  <div
                    dir="ltr"
                    style={{
                      flex:    "1 1 480px",
                      minWidth: 280,
                    }}
                  >
                    <JewelryValuationCertificate certData={certData} />
                  </div>

                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  );
}
