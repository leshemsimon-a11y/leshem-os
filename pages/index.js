/**
 * pages/index.js — LESHEM.S OS v3.0 (Sanitized & Vercel-Ready)
 */

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import Head from "next/head";

// ═══════════════════════════════════════════════════════════════════════
// 1. DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════
const C = {
  iv:    "#FAF9F6",   // ivory (background)
  iv2:   "#F0EDE8",   // ivory 2 (stone table bg)
  iv3:   "#E5E0D8",   // ivory 3 (subtle divider)
  ch:    "#36454F",   // charcoal
  chm:   "#4a5c68",   // charcoal mid
  chl:   "#7a8e98",   // charcoal light (labels)
  chx:   "#a8bcc4",   // charcoal extra-light (header labels)
  gd:    "#C5B358",   // muted gold (accent)
  gdm:   "#a8973f",   // muted gold dark
  sg:    "#8aab8e",   // dusty sage (optional accent)
  bl:    "rgba(54,69,79,0.10)",
  blm:   "rgba(54,69,79,0.18)",
  blh:   "rgba(54,69,79,0.04)",
  serif: "'Merriweather','Times New Roman',Georgia,serif",
  heb:   "'Assistant','Heebo',Arial,sans-serif",
  eng:   "'DM Sans',Helvetica,Arial,sans-serif",
};

// ═══════════════════════════════════════════════════════════════════════
// 2. PURE HELPERS
// ═══════════════════════════════════════════════════════════════════════
const ILS_RATE = 3.75;

/** Format a USD value, optionally converting to ILS. */
function fmt(value, currency = "USD") {
  const v      = Number(value) || 0;
  const amount = currency === "ILS" ? v * ILS_RATE : v;
  const sym    = currency === "ILS" ? "₪" : "$";
  return (
    sym +
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(amount))
  );
}

const r2      = (n) => Math.round((n || 0) * 100) / 100;
const fmtDate = () =>
  new Intl.DateTimeFormat("en-GB", {
    day:   "2-digit",
    month: "long",
    year:  "numeric",
  }).format(new Date());

/** Use manual override when provided; fall back to calculated value. */
const ovr = (o, n) =>
  o !== "" && o !== null && o !== undefined ? parseFloat(o) || 0 : n;

// ═══════════════════════════════════════════════════════════════════════
// 3. CONSTANTS / LOOKUP TABLES
// ═══════════════════════════════════════════════════════════════════════
const METALS = [
  "18K Yellow", "18K White", "18K Rose",
  "14K Yellow", "14K White", "Platinum 950", "Silver 925",
];
const METAL_SPOT = {
  "18K Yellow": 58, "18K White": 58, "18K Rose": 57,
  "14K Yellow": 47, "14K White": 47, "Platinum 950": 34, "Silver 925": 0.85,
};
const CASTS     = ["CAD / Casting", "Hand-made", "Semi-mount", "Findings only"];
const CMPLX     = ["Simple", "Medium", "Complex", "Very Complex"];
const CMULT     = { Simple: 1.0, Medium: 1.35, Complex: 1.8, "Very Complex": 2.4 };
const STYPES    = ["Diamond", "Ruby", "Emerald", "Sapphire", "Other"];
const COLORS_D  = ["D", "E", "F", "G", "H", "I", "J", "K", "L"];
const CLARITIES = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1"];
const SETTINGS  = ["Prong / Claw", "Bezel", "Pavé", "Channel", "Tension", "Invisible", "Bar"];
const MU        = { ws: 1.4, rx: 1.5, ri: 1.25 };

// ═══════════════════════════════════════════════════════════════════════
// 4. FORMULA ENGINE  (pure — zero React imports, fully unit-testable)
// ═══════════════════════════════════════════════════════════════════════

/** Estimate diamond wholesale cost (USD) from ct, color, clarity. */
function estDiamond(ct, color, clarity) {
  const cm = { D:1, E:0.97, F:0.94, G:0.88, H:0.80, I:0.70, J:0.60, K:0.50, L:0.42 };
  const cl = { FL:1, IF:0.98, VVS1:0.95, VVS2:0.90, VS1:0.82, VS2:0.74, SI1:0.60, SI2:0.48, I1:0.32 };
  const c  = Number(ct) || 0;
  const base = c < 0.5 ? 1800 : c < 1 ? 3800 : c < 2 ? 7200 : c < 3 ? 11000 : 16000;
  return base * (cm[color] || 0.8) * (cl[clarity] || 0.7) * c;
}

/** Full cost waterfall. Returns all intermediate values for the breakdown. */
function calcApp(cfg) {
  const grams     = parseFloat(cfg.grams) || 0;
  const spotPrice = METAL_SPOT[cfg.metal] || 58;
  const rawMC     = grams * spotPrice;

  // ── Metal cost (with pricing mode)
  let mc;
  if (cfg.mcManual !== "") {
    const mv = parseFloat(cfg.mcManual) || 0;
    mc = cfg.mcMode === "per_gram" ? mv * grams : mv;
  } else {
    mc = rawMC;
  }

  // ── Center stone cost (with pricing mode)
  let centerCost = 0;
  if (cfg.centerManual !== "") {
    const cv = parseFloat(cfg.centerManual) || 0;
    centerCost =
      cfg.centerMode === "per_carat"
        ? cv * (parseFloat(cfg.centerCt) || 1)
        : cv;
  } else if (cfg.centerType === "Diamond") {
    centerCost = estDiamond(
      parseFloat(cfg.centerCt) || 0,
      cfg.centerColor,
      cfg.centerClarity
    );
  } else {
    centerCost = (parseFloat(cfg.centerCt) || 0) * 1200;
  }

  // ── Side-stone cost helper (with pricing mode)
  function ssCost(typeF, ctF, countF, manualF, modeF) {
    const ct    = parseFloat(cfg[ctF])       || 0;
    const count = parseInt(cfg[countF], 10)  || 0;
    if (count === 0) return 0;
    const totalCt = ct * count;
    if (cfg[manualF] !== "") {
      const mv = parseFloat(cfg[manualF]) || 0;
      return cfg[modeF] === "per_carat" ? mv * totalCt : mv;
    }
    return cfg[typeF] === "Diamond"
      ? estDiamond(ct, "H", "VS2") * count
      : totalCt * 1200;
  }

  const ss1Cost = ssCost("ss1Type","ss1Ct","ss1Count","ss1Manual","ss1PriceMode");
  const ss2Cost = ssCost("ss2Type","ss2Ct","ss2Count","ss2Manual","ss2PriceMode");
  const stones  = centerCost + ss1Cost + ss2Cost;

  // ── Labour & overheads
  const lc  = grams * (CMULT[cfg.cmplx] || 1.35) * 20;
  const oh  = (rawMC + lc + stones) * 0.08;

  // ── Waterfall (applying manual overrides where provided)
  const mcF   = ovr(cfg.mcOv,   mc);
  const lcF   = ovr(cfg.lcOv,   lc);
  const prodF = ovr(cfg.prodOv, mcF + lcF + stones + oh);
  const wsF   = ovr(cfg.wsOv,   prodF * MU.ws);
  const rxF   = ovr(cfg.rxOv,   wsF   * MU.rx);
  const riF   = ovr(cfg.riOv,   rxF   * MU.ri);

  return {
    mc: mcF, lc: lcF,
    centerCost, ss1Cost, ss2Cost, stones,
    prod: prodF, ws: wsF, rx: rxF, ri: riF,
    grams, rawMC,
  };
}

// ═══════════════════════════════════════════════════════════════════════
// 5. DEFAULT QUOTE CONFIG
// ═══════════════════════════════════════════════════════════════════════
const DCFG = {
  // Metal
  metal: "18K Yellow", grams: "", cast: "CAD / Casting", cmplx: "Medium",
  // Metal override
  mcManual: "", mcMode: "total",
  // Center stone
  centerType: "Diamond", centerCt: "1.00", centerColor: "G",
  centerClarity: "VS1", centerManual: "", centerMode: "total",
  centerSetting: "Prong / Claw",
  // Side stones 1
  ss1Type: "Diamond", ss1Ct: "0.05", ss1Count: "0",
  ss1Manual: "", ss1PriceMode: "total", ss1Setting: "Pavé",
  // Side stones 2
  ss2Type: "Diamond", ss2Ct: "0.03", ss2Count: "0",
  ss2Manual: "", ss2PriceMode: "total", ss2Setting: "Pavé",
  // Waterfall overrides
  lcOv: "", prodOv: "", wsOv: "", rxOv: "", riOv: "",
  // Client info
  clientName: "", quoteName: "", notes: "",
};

// ═══════════════════════════════════════════════════════════════════════
// 6. PRINT CSS  (injected once into <head>)
// ═══════════════════════════════════════════════════════════════════════
const PRINT_CSS = `
  @media print {
    /* Hide everything … */
    * { visibility: hidden !important; }
    /* … then reveal only the certificate and all its descendants. */
    .printable-container,
    .printable-container * { visibility: visible !important; }
    /* Pin the certificate to the A4 viewport with zero margins. */
    .printable-container {
      position: fixed !important;
      inset: 0 !important;
      width: 210mm !important;
      height: 297mm !important;
      padding: 18mm !important;
      background: #FAF9F6 !important;
      box-sizing: border-box !important;
      overflow: hidden !important;
      margin: 0 !important;
    }
    @page { size: A4 portrait; margin: 0; }
  }
  .no-print { display: block; }
  @media print { .no-print { display: none !important; } }
`;

// ═══════════════════════════════════════════════════════════════════════
// 7. UI ATOMS — all at MODULE scope
// ═══════════════════════════════════════════════════════════════════════

/**
 * StableInp  ─  blur-commit text / decimal input.
 */
function StableInp({ value, onChange, placeholder, inputMode, style, ...rest }) {
  const [draft, setDraft] = useState(value ?? "");
  const committed         = useRef(value);

  useEffect(() => {
    if (value !== committed.current) {
      committed.current = value;
      setDraft(value ?? "");
    }
  }, [value]);

  return (
    <input
      value={draft}
      inputMode={inputMode ?? "decimal"}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        committed.current = draft;
        onChange(draft);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          committed.current = draft;
          onChange(draft);
          e.currentTarget.blur();
        }
      }}
      style={{
        width: "100%",
        border: "none",
        borderBottom: `0.5px solid rgba(54,69,79,0.2)`,
        background: "transparent",
        padding: "4px 2px",
        fontFamily: C.heb,
        fontSize: 12,
        color: C.ch,
        outline: "none",
        ...style,
      }}
      {...rest}
    />
  );
}

/** Two-button pricing-mode toggle ("סה״כ" vs "לct" / "לגרם"). */
function PriceModeToggle({ mode, onChange, labels, vals }) {
  const v = vals ?? ["total", "per_unit"];
  return (
    <div
      style={{
        display: "flex",
        border: `0.5px solid rgba(54,69,79,0.2)`,
        borderRadius: 3,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {v.map((m, i) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          style={{
            padding: "3px 6px",
            cursor: "pointer",
            border: "none",
            background: mode === m ? C.ch : "transparent",
            color:      mode === m ? C.iv : C.chl,
            fontFamily: C.heb,
            fontSize: 9,
          }}
        >
          {labels[i]}
        </button>
      ))}
    </div>
  );
}

/** Label + field wrapper. `mt` adds an optional top margin. */
function LR({ label, children, mt }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: mt }}>
      <span style={{ fontFamily: C.heb, fontSize: 10, color: C.chl }}>{label}</span>
      {children}
    </div>
  );
}

/** Thin bottom-bordered select. */
function Sel({ value, onChange, options, style }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        border: "none",
        borderBottom: `0.5px solid rgba(54,69,79,0.2)`,
        background: "transparent",
        padding: "4px 2px",
        fontFamily: C.heb,
        fontSize: 12,
        color: C.ch,
        outline: "none",
        cursor: "pointer",
        appearance: "none",
        WebkitAppearance: "none",
        ...style,
      }}
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

/** Titled bordered panel. */
function Pnl({ title, children, style }) {
  return (
    <div
      style={{
        border: `0.5px solid rgba(54,69,79,0.12)`,
        padding: "12px 14px",
        marginBottom: 10,
        ...style,
      }}
    >
      {title && (
        <div
          style={{
            fontFamily: C.heb,
            fontSize: 10,
            color: C.chl,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 10,
            paddingBottom: 6,
            borderBottom: `0.5px solid rgba(54,69,79,0.1)`,
          }}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

/** Two-column grid row with an 8px gap. */
function GR({ children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 8. SsBlock — side-stone configuration block
// ═══════════════════════════════════════════════════════════════════════
function SsBlock({ cfg, sf, prefix, label }) {
  const typeF  = `${prefix}Type`;
  const ctF    = `${prefix}Ct`;
  const countF = `${prefix}Count`;
  const manF   = `${prefix}Manual`;
  const pmF    = `${prefix}PriceMode`;
  const setF   = `${prefix}Setting`;

  return (
    <div
      style={{
        borderTop: `0.5px solid rgba(54,69,79,0.08)`,
        paddingTop: 8,
        marginTop: 4,
      }}
    >
      <div style={{ fontFamily: C.heb, fontSize: 10, color: C.chl, marginBottom: 6 }}>
        {label}
      </div>

      <GR>
        <LR label="סוג">
          <Sel value={cfg[typeF]} onChange={(v) => sf(typeF, v)} options={STYPES} />
        </LR>
        <LR label="ct / יח׳">
          <StableInp
            value={cfg[ctF]}
            onChange={(v) => sf(ctF, v)}
            placeholder="0.05"
          />
        </LR>
      </GR>

      <GR>
        <LR label="כמות">
          <StableInp
            value={cfg[countF]}
            onChange={(v) => sf(countF, v)}
            placeholder="0"
            inputMode="numeric"
          />
        </LR>
        <LR label="מחיר ידני">
          <div style={{ display: "flex", gap: 4, alignItems: "flex-end" }}>
            <StableInp value={cfg[manF]} onChange={(v) => sf(manF, v)} placeholder="—" />
            <PriceModeToggle
              mode={cfg[pmF]}
              onChange={(v) => sf(pmF, v)}
              labels={["סה״כ", "לct"]}
              vals={["total", "per_carat"]}
            />
          </div>
        </LR>
      </GR>

      <LR label="הגדרה">
        <Sel value={cfg[setF]} onChange={(v) => sf(setF, v)} options={SETTINGS} />
      </LR>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 9. Certificate — "Quiet Luxury" A4 layout
// ═══════════════════════════════════════════════════════════════════════
function Certificate({ cfg, res, pieceImg, fmtFn, qNum, currency }) {
  const ss1Count   = parseInt(cfg.ss1Count, 10) || 0;
  const ss1TotalCt = r2((parseFloat(cfg.ss1Ct) || 0) * ss1Count);
  const hasPieceImg = !!pieceImg;

  return (
    <div
      className="printable-container"
      style={{
        width: "210mm",
        maxWidth: "100%",
        minHeight: "297mm",
        background: C.iv,
        padding: "22mm 18mm 18mm",
        fontFamily: C.serif,
        color: C.ch,
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
        margin: "0 auto",
      }}
    >
      {/* ── Watermark "L" */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-15deg)",
          fontSize: 320,
          fontFamily: C.serif,
          color: "rgba(54,69,79,0.025)",
          fontWeight: 700,
          userSelect: "none",
          pointerEvents: "none",
          lineHeight: 1,
          zIndex: 0,
        }}
      >
        L
      </div>

      {/* ── Content layer (above watermark) */}
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div
          style={{
            borderBottom: `1px solid ${C.gd}`,
            paddingBottom: "6mm",
            marginBottom: "8mm",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 22,
                letterSpacing: "0.25em",
                fontFamily: C.serif,
                color: C.ch,
                fontWeight: 700,
              }}
            >
              LESHEM.S
            </div>
            <div
              style={{
                fontSize: 9,
                letterSpacing: "0.2em",
                color: C.chl,
                fontFamily: C.eng,
                marginTop: 2,
              }}
            >
              FINE JEWELRY · EST. 2018
            </div>
          </div>
          <div style={{ textAlign: "right", fontFamily: C.eng, fontSize: 9, color: C.chl }}>
            <div>JEWELRY QUOTATION</div>
            <div style={{ fontWeight: 600, color: C.ch, marginTop: 2 }}>#{qNum}</div>
            <div style={{ marginTop: 2 }}>{fmtDate()}</div>
          </div>
        </div>

        {/* Client & piece image */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: hasPieceImg ? "1fr 110px" : "1fr",
            gap: "8mm",
            marginBottom: "8mm",
          }}
        >
          <div>
            {cfg.clientName && (
              <div style={{ marginBottom: "4mm" }}>
                <div
                  style={{
                    fontSize: 8,
                    letterSpacing: "0.15em",
                    color: C.chl,
                    fontFamily: C.eng,
                    marginBottom: 3,
                  }}
                >
                  PREPARED FOR
                </div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{cfg.clientName}</div>
              </div>
            )}
            {cfg.quoteName && (
              <div>
                <div
                  style={{
                    fontSize: 8,
                    letterSpacing: "0.15em",
                    color: C.chl,
                    fontFamily: C.eng,
                    marginBottom: 3,
                  }}
                >
                  PIECE DESCRIPTION
                </div>
                <div style={{ fontSize: 12 }}>{cfg.quoteName}</div>
              </div>
            )}
            {!cfg.clientName && !cfg.quoteName && (
              <div style={{ fontSize: 11, color: C.chl, fontStyle: "italic" }}>
                Jewelry Quotation — {fmtDate()}
              </div>
            )}
          </div>

          {hasPieceImg && (
            <div
              style={{
                width: 110,
                height: 110,
                border: `0.5px solid rgba(54,69,79,0.2)`,
                overflow: "hidden",
              }}
            >
              <img
                src={pieceImg}
                alt="piece"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          )}
        </div>

        {/* Stone specifications table */}
        <div style={{ background: C.iv2, padding: "5mm 6mm", marginBottom: "8mm" }}>
          <div
            style={{
              fontSize: 8,
              letterSpacing: "0.15em",
              color: C.chl,
              fontFamily: C.eng,
              marginBottom: "3mm",
            }}
          >
            STONE SPECIFICATIONS
          </div>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontFamily: C.eng,
              fontSize: 10,
            }}
          >
            <thead>
              <tr style={{ borderBottom: `0.5px solid rgba(54,69,79,0.2)` }}>
                {["ITEM", "TYPE", "WEIGHT", "SPECIFICATIONS", "EST. VALUE"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "2mm 3mm 2mm 0",
                      fontWeight: 600,
                      color: C.chl,
                      fontSize: 8,
                      letterSpacing: "0.08em",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "2mm 3mm 2mm 0" }}>Center Stone</td>
                <td>{cfg.centerType}</td>
                <td>{cfg.centerCt} ct</td>
                <td>
                  {cfg.centerType === "Diamond"
                    ? `${cfg.centerColor} / ${cfg.centerClarity} · ${cfg.centerSetting}`
                    : "—"}
                </td>
                <td style={{ fontWeight: 600 }}>{fmtFn(res.centerCost)}</td>
              </tr>
              {ss1Count > 0 && (
                <tr>
                  <td style={{ padding: "2mm 3mm 2mm 0" }}>Side Stones</td>
                  <td>{cfg.ss1Type}</td>
                  <td>
                    {ss1TotalCt} ct ({ss1Count} pcs)
                  </td>
                  <td>{cfg.ss1Setting}</td>
                  <td style={{ fontWeight: 600 }}>{fmtFn(res.ss1Cost)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Metal row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "5mm",
            marginBottom: "8mm",
            borderTop: `0.5px solid rgba(54,69,79,0.12)`,
            paddingTop: "5mm",
          }}
        >
          {[
            ["METAL",   cfg.metal],
            ["WEIGHT",  (cfg.grams || "—") + " g"],
            ["CASTING", cfg.cast],
          ].map(([lbl, val]) => (
            <div key={lbl}>
              <div
                style={{
                  fontSize: 8,
                  color: C.chl,
                  fontFamily: C.eng,
                  letterSpacing: "0.1em",
                  marginBottom: 2,
                }}
              >
                {lbl}
              </div>
              <div style={{ fontSize: 11 }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Price block */}
        <div
          style={{
            background: C.ch,
            padding: "6mm 8mm",
            marginTop: "6mm",
            marginBottom: "10mm",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 8,
                  color: C.chx,
                  fontFamily: C.eng,
                  letterSpacing: "0.2em",
                }}
              >
                RETAIL PRICE (INCL. VAT)
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontFamily: C.serif,
                  color: C.iv,
                  fontWeight: 700,
                  marginTop: 2,
                }}
              >
                {fmtFn(res.ri)}
              </div>
              {currency === "ILS" && (
                <div
                  style={{
                    fontSize: 8,
                    color: C.chx,
                    fontFamily: C.eng,
                    marginTop: 4,
                  }}
                >
                  Exchange rate: 3.75 ILS / USD
                </div>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 8, color: C.chx, fontFamily: C.eng }}>
                WHOLESALE
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: C.gd,
                  fontWeight: 600,
                  marginTop: 2,
                }}
              >
                {fmtFn(res.ws)}
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {cfg.notes && (
          <div style={{ marginBottom: "8mm" }}>
            <div
              style={{
                fontSize: 8,
                letterSpacing: "0.15em",
                color: C.chl,
                fontFamily: C.eng,
                marginBottom: 3,
              }}
            >
              NOTES
            </div>
            <div style={{ fontSize: 10, lineHeight: 1.7, color: C.chm }}>
              {cfg.notes}
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            borderTop: `0.5px solid rgba(197,179,88,0.4)`,
            paddingTop: "5mm",
            marginTop: "6mm",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                fontFamily: C.serif,
                color: C.ch,
                fontStyle: "italic",
              }}
            >
              Leshem Simon
            </div>
            <div
              style={{
                fontSize: 7.5,
                fontFamily: C.eng,
                color: C.chl,
                letterSpacing: "0.1em",
                marginTop: 1,
              }}
            >
              FOUNDER · CERTIFIED DIAMOND GRADER &amp; EXPERT JEWELER
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: 7.5, fontFamily: C.eng, color: C.chl }}>
            <div>LESHEM.S Jewelry</div>
            <div>Tuval St 23, Ramat Gan · VAT: 046240016</div>
            <div style={{ color: C.gd, marginTop: 1 }}>leshem-s.com</div>
          </div>
        </div>

      </div>{/* /content layer */}
    </div>/* /printable-container */
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 10. MAIN APP  (pages/index.js default export)
// ═══════════════════════════════════════════════════════════════════════
export default function LeshemOS() {
  // ── Core state
  const [cfg,      setCfg]      = useState({ ...DCFG });
  const [currency, setCurrency] = useState("USD");   // "USD" | "ILS"
  const [tab,      setTab]      = useState("calc");  // "calc" | "cert"
  const [pieceImg, setPieceImg] = useState(null);

  // Stable quote number (regenerates only on reset)
  const qNum = useRef(
    `LS-${new Date().getFullYear()}-${String(
      Math.floor(Math.random() * 9000) + 1000
    )}`
  );
  const fileRef = useRef(null);

  // ── Field setter — stable reference, never causes extra renders
  const sf = useCallback((field, value) => {
    setCfg((prev) => ({ ...prev, [field]: value }));
  }, []);

  // ── Derived values (recalculate only when cfg changes)
  const res = useMemo(() => calcApp(cfg), [cfg]);

  // ── Currency formatter (recalculate only when currency changes)
  const fmtFn = useCallback((v) => fmt(v, currency), [currency]);

  // ── Reset handler
  const handleReset = useCallback(() => {
    setCfg({ ...DCFG });
    setPieceImg(null);
    setTab("calc");
    qNum.current = `LS-${new Date().getFullYear()}-${String(
      Math.floor(Math.random() * 9000) + 1000
    )}`;
  }, []);

  // ── Image upload handler
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPieceImg(ev.target.result);
    reader.readAsDataURL(file);
  }, []);

  // ── KPI breakdown rows for the summary panel
  const kpiRows = [
    { label: "מתכת",        value: res.mc,                    ovField: "mcOv"   },
    { label: "עבודה",       value: res.lc,                    ovField: "lcOv"   },
    { label: "אבן מרכזית", value: res.centerCost,             ovField: null     },
    { label: "אבני צד",    value: res.ss1Cost + res.ss2Cost, ovField: null     },
    { label: "סה״כ ייצור", value: res.prod,                  ovField: "prodOv" },
    { label: "סיטונאי",    value: res.ws,                    ovField: "wsOv"   },
    { label: "קמעונאי",    value: res.rx,                    ovField: "rxOv"   },
    { label: "כולל מע״מ",  value: res.ri,                    ovField: "riOv"   },
  ];

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
        <style>{PRINT_CSS}</style>
      </Head>

      {/* ── Root shell ──────────────────────────────────────────────── */}
      <div
        dir="rtl"
        style={{
          minHeight: "100vh",      // ← NOT height:100vh — allows mobile scroll
          display: "flex",
          flexDirection: "column",
          background: C.iv,
          fontFamily: C.heb,
        }}
      >

        {/* ════════════════ HEADER ════════════════ */}
        <header
          className="no-print"
          style={{
            background: C.ch,
            padding: "0 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 48,
            flexShrink: 0,
          }}
        >
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                fontFamily: C.serif,
                fontSize: 15,
                color: C.iv,
                letterSpacing: "0.15em",
              }}
            >
              LESHEM.S
            </span>
            <span
              style={{
                fontFamily: C.eng,
                fontSize: 9,
                color: C.chx,
                letterSpacing: "0.1em",
              }}
            >
              OS v3.0
            </span>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Currency toggle */}
            <div
              style={{
                display: "flex",
                border: `0.5px solid ${C.chm}`,
                borderRadius: 3,
                overflow: "hidden",
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
                    padding: "5px 10px",
                    background: currency === c ? C.gd : "transparent",
                    color:      currency === c ? C.ch : C.chx,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: C.heb,
                    fontSize: 11,
                    fontWeight: 600,
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
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "transparent",
                border: `0.5px solid ${C.chm}`,
                color: C.chx,
                padding: "5px 10px",
                cursor: "pointer",
                fontFamily: C.heb,
                fontSize: 11,
              }}
            >
              ↺ אפס
            </button>
          </div>
        </header>

        {/* ════════════════ TABS ════════════════ */}
        <nav
          className="no-print"
          style={{
            background: C.ch,
            borderBottom: `1px solid rgba(197,179,88,0.3)`,
            display: "flex",
            flexShrink: 0,
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
                padding: "10px 20px",
                background: "transparent",
                border: "none",
                borderBottom: tab === t ? `2px solid ${C.gd}` : "2px solid transparent",
                color:      tab === t ? C.gd : C.chx,
                fontFamily: C.heb,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* ════════════════ MAIN CONTENT ════════════════ */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",   // ← scrollable, not clipped
            padding: "16px 12px",
          }}
        >

          {/* ─── CALCULATOR TAB ───────────────────────── */}
          {tab === "calc" && (
            <div
              style={{
                maxWidth: 900,
                margin: "0 auto",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
                gap: 12,
              }}
            >
              {/* ── Left column */}
              <div>

                {/* Metal */}
                <Pnl title="מתכת">
                  <GR>
                    <LR label="סוג מתכת">
                      <Sel
                        value={cfg.metal}
                        onChange={(v) => sf("metal", v)}
                        options={METALS}
                      />
                    </LR>
                    <LR label="גרם">
                      <StableInp
                        value={cfg.grams}
                        onChange={(v) => sf("grams", v)}
                        placeholder="0.00"
                      />
                    </LR>
                  </GR>
                  <GR>
                    <LR label="יציקה">
                      <Sel
                        value={cfg.cast}
                        onChange={(v) => sf("cast", v)}
                        options={CASTS}
                      />
                    </LR>
                    <LR label="מורכבות">
                      <Sel
                        value={cfg.cmplx}
                        onChange={(v) => sf("cmplx", v)}
                        options={CMPLX}
                      />
                    </LR>
                  </GR>
                  <div
                    style={{
                      borderTop: `0.5px solid rgba(54,69,79,0.08)`,
                      paddingTop: 8,
                      marginTop: 4,
                    }}
                  >
                    <LR label="עלות מתכת ידנית">
                      <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
                        <StableInp
                          value={cfg.mcManual}
                          onChange={(v) => sf("mcManual", v)}
                          placeholder={`אוט. ${fmtFn(res.rawMC)}`}
                        />
                        <PriceModeToggle
                          mode={cfg.mcMode}
                          onChange={(v) => sf("mcMode", v)}
                          labels={["סה״כ", "לגרם"]}
                          vals={["total", "per_gram"]}
                        />
                      </div>
                    </LR>
                  </div>
                </Pnl>

                {/* Center Stone */}
                <Pnl title="אבן מרכזית">
                  <GR>
                    <LR label="סוג">
                      <Sel
                        value={cfg.centerType}
                        onChange={(v) => sf("centerType", v)}
                        options={STYPES}
                      />
                    </LR>
                    <LR label="קראט">
                      <StableInp
                        value={cfg.centerCt}
                        onChange={(v) => sf("centerCt", v)}
                        placeholder="1.00"
                      />
                    </LR>
                  </GR>
                  {cfg.centerType === "Diamond" && (
                    <GR>
                      <LR label="צבע">
                        <Sel
                          value={cfg.centerColor}
                          onChange={(v) => sf("centerColor", v)}
                          options={COLORS_D}
                        />
                      </LR>
                      <LR label="נקיון">
                        <Sel
                          value={cfg.centerClarity}
                          onChange={(v) => sf("centerClarity", v)}
                          options={CLARITIES}
                        />
                      </LR>
                    </GR>
                  )}
                  <LR label="הגדרה">
                    <Sel
                      value={cfg.centerSetting}
                      onChange={(v) => sf("centerSetting", v)}
                      options={SETTINGS}
                    />
                  </LR>
                  <LR label="מחיר ידני" mt={8}>
                    <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
                      <StableInp
                        value={cfg.centerManual}
                        onChange={(v) => sf("centerManual", v)}
                        placeholder={`אוט. ${fmtFn(res.centerCost)}`}
                      />
                      <PriceModeToggle
                        mode={cfg.centerMode}
                        onChange={(v) => sf("centerMode", v)}
                        labels={["סה״כ", "לct"]}
                        vals={["total", "per_carat"]}
                      />
                    </div>
                  </LR>
                </Pnl>

                {/* Side Stones */}
                <Pnl title="אבני צד">
                  <SsBlock cfg={cfg} sf={sf} prefix="ss1" label="שורה א׳" />
                  <SsBlock cfg={cfg} sf={sf} prefix="ss2" label="שורה ב׳" />
                </Pnl>

              </div>{/* /left col */}

              {/* ── Right column */}
              <div>

                {/* Cost summary */}
                <Pnl title="סיכום עלויות">
                  {kpiRows.map(({ label, value, ovField }) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "5px 0",
                        borderBottom: `0.5px solid rgba(54,69,79,0.07)`,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: C.heb,
                          fontSize: 11.5,
                          color: C.chm,
                        }}
                      >
                        {label}
                      </span>
                      {ovField ? (
                        <StableInp
                          value={cfg[ovField]}
                          onChange={(v) => sf(ovField, v)}
                          placeholder={fmtFn(value)}
                          style={{
                            width: 90,
                            textAlign: "left",
                            fontFamily: C.eng,
                            fontWeight: 500,
                          }}
                        />
                      ) : (
                        <span
                          style={{
                            fontFamily: C.eng,
                            fontSize: 12,
                            fontWeight: 600,
                            color: C.ch,
                          }}
                        >
                          {fmtFn(value)}
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Retail highlight */}
                  <div
                    style={{
                      marginTop: 10,
                      padding: "8px 12px",
                      background: C.ch,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontFamily: C.heb, fontSize: 12, color: C.iv }}>
                      מחיר לצרכן
                    </span>
                    <span
                      style={{
                        fontFamily: C.serif,
                        fontSize: 18,
                        color: C.gd,
                        fontWeight: 700,
                      }}
                    >
                      {fmtFn(res.ri)}
                    </span>
                  </div>
                </Pnl>

                {/* Client & image */}
                <Pnl title="פרטי לקוח ותמונה">
                  <GR>
                    <LR label="שם לקוח">
                      <StableInp
                        value={cfg.clientName}
                        onChange={(v) => sf("clientName", v)}
                        placeholder="שם מלא"
                        inputMode="text"
                      />
                    </LR>
                    <LR label="שם התכשיט">
                      <StableInp
                        value={cfg.quoteName}
                        onChange={(v) => sf("quoteName", v)}
                        placeholder="טבעת, צמיד..."
                        inputMode="text"
                      />
                    </LR>
                  </GR>

                  <LR label="הערות" mt={6}>
                    <textarea
                      value={cfg.notes}
                      onChange={(e) => sf("notes", e.target.value)}
                      placeholder="הערות חופשיות..."
                      style={{
                        width: "100%",
                        border: `0.5px solid rgba(54,69,79,0.2)`,
                        background: "transparent",
                        padding: "6px 8px",
                        fontFamily: C.heb,
                        fontSize: 11.5,
                        color: C.ch,
                        outline: "none",
                        resize: "vertical",
                        minHeight: 60,
                        marginTop: 4,
                      }}
                    />
                  </LR>

                  <input
                    type="file"
                    ref={fileRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    style={{
                      width: "100%",
                      padding: 8,
                      border: `0.5px dashed rgba(54,69,79,0.3)`,
                      background: "transparent",
                      cursor: "pointer",
                      fontFamily: C.heb,
                      fontSize: 11,
                      color: C.chl,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      marginTop: 6,
                    }}
                  >
                    📷 {pieceImg ? "החלף תמונה" : "העלה תמונת תכשיט"}
                  </button>

                  {pieceImg && (
                    <img
                      src={pieceImg}
                      alt="piece preview"
                      style={{
                        width: "100%",
                        marginTop: 8,
                        maxHeight: 120,
                        objectFit: "contain",   // ← no distortion
                        border: `0.5px solid rgba(54,69,79,0.15)`,
                      }}
                    />
                  )}
                </Pnl>

                {/* Go to certificate */}
                <button
                  onClick={() => setTab("cert")}
                  style={{
                    width: "100%",
                    padding: 11,
                    background: C.ch,
                    color: C.iv,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: C.heb,
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  📄 הפק תעודה
                </button>

              </div>{/* /right col */}
            </div>
          )}

          {/* ─── CERTIFICATE TAB ──────────────────────── */}
          {tab === "cert" && (
            <div>
              {/* Toolbar (hidden on print) */}
              <div
                className="no-print"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  maxWidth: 900,
                  margin: "0 auto 12px",
                }}
              >
                <button
                  onClick={() => setTab("calc")}
                  style={{
                    background: "transparent",
                    border: `0.5px solid rgba(54,69,79,0.2)`,
                    padding: "6px 14px",
                    cursor: "pointer",
                    fontFamily: C.heb,
                    fontSize: 11,
                    color: C.chl,
                  }}
                >
                  ← חזור למחשבון
                </button>
                <button
                  onClick={() => window.print()}
                  style={{
                    background: C.ch,
                    color: C.iv,
                    border: "none",
                    padding: "8px 18px",
                    cursor: "pointer",
                    fontFamily: C.heb,
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  🖨️ הדפס / שמור כ-PDF
                </button>
              </div>

              <Certificate
                cfg={cfg}
                res={res}
                pieceImg={pieceImg}
                currency={currency}
                fmtFn={fmtFn}
                qNum={qNum.current}
              />
            </div>
          )}

        </main>{/* /main */}
      </div>{/* /root shell */}
    </>
  );
}
