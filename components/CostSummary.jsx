/**
 * components/CostSummary.jsx  —  UX v2 (patch: StableInp for all overrides)
 *
 * Fix applied: KpiRow now uses StableInp (not a plain uncontrolled <input>)
 * for every editable override field: mcOv, lcOv, prodOv, wsOv, rxOv, riOv.
 *
 * Why this matters:
 *   The plain <input defaultValue={...}> was uncontrolled — when the parent
 *   called handleReset() and set cfg[ovField] back to "", the DOM element
 *   never re-rendered because React does not manage uncontrolled value after
 *   mount. StableInp is controlled via `value` and its internal useEffect
 *   syncs the local draft whenever the external value reference changes,
 *   which is exactly what a reset triggers.
 *
 * Nothing else changed:
 *   • Blur-commit behaviour        — StableInp already implements this
 *   • UX sizing (height, fonts)    — passed through the style prop
 *   • Calculation logic            — untouched
 *   • All other sections           — untouched
 */

import { C } from "../lib/constants";
import { Pnl, GR, LR, StableInp } from "./UI";

// ─── Shared style for override inputs inside KPI rows ─────────────────
// Passed as the `style` prop to StableInp, which merges it on top of its
// own defaults. We override height, width, font-size, and text-align only.
const OV_STYLE = {
  width:        140,
  height:       40,
  fontSize:     15,
  textAlign:    "left",
  borderRadius: 6,
  padding:      "0 12px",
};

// ─── KpiRow ──────────────────────────────────────────────────────────
/**
 * One line in the cost breakdown table.
 *
 * When ovField is provided → renders a StableInp so the user can override
 * the calculated value. The placeholder shows the current calculated amount.
 * When ovField is null     → renders a read-only formatted value span.
 *
 * Props:
 *   label        {string}    Hebrew label (right side in RTL)
 *   displayValue {number}    Calculated USD value (used for placeholder & display)
 *   ovField      {string|null} cfg key, e.g. "wsOv". null = read-only row.
 *   cfg          {object}    Full quote config — provides the current override string
 *   sf           {function}  Field setter
 *   fmtFn        {function}  Currency formatter
 */
function KpiRow({ label, displayValue, ovField, cfg, sf, fmtFn }) {
  return (
    <div
      style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        minHeight:      52,
        padding:        "6px 0",
        borderBottom:   "1px solid rgba(54,69,79,0.07)",
        gap:            12,
      }}
    >
      {/* Label — right side (RTL) */}
      <span
        style={{
          fontFamily: C.heb,
          fontSize:   14,
          color:      C.chm,
          fontWeight: 400,
          flexShrink: 0,
        }}
      >
        {label}
      </span>

      {/* Editable override (StableInp) or read-only value */}
      {ovField ? (
        <StableInp
          value={cfg[ovField]}
          onChange={(v) => sf(ovField, v)}
          placeholder={fmtFn(displayValue)}
          inputMode="decimal"
          style={OV_STYLE}
        />
      ) : (
        <span
          style={{
            fontFamily: "'DM Sans',Helvetica,Arial,sans-serif",
            fontSize:   15,
            fontWeight: 500,
            color:      C.ch,
          }}
        >
          {fmtFn(displayValue)}
        </span>
      )}
    </div>
  );
}

// ─── CostSummary ─────────────────────────────────────────────────────
export function CostSummary({
  cfg,
  res,
  sf,
  fmtFn,
  pieceImg,
  fileRef,
  onImageUpload,
  onShowCert,
}) {
  const kpiRows = [
    { label: "מתכת",        value: res.mc,                   ovField: "mcOv"   },
    { label: "עבודה",       value: res.lc,                   ovField: "lcOv"   },
    { label: "אבן מרכזית", value: res.centerCost,            ovField: null     },
    { label: "אבני צד",    value: res.ss1Cost + res.ss2Cost, ovField: null     },
    { label: "ייצור סה״כ", value: res.prod,                  ovField: "prodOv" },
    { label: "סיטונאי",    value: res.ws,                    ovField: "wsOv"   },
    { label: "קמעונאי",    value: res.rx,                    ovField: "rxOv"   },
    { label: "כולל מע״מ",  value: res.ri,                    ovField: "riOv"   },
  ];

  return (
    <div>

      {/* ══════════════════════════════════════════════════════════════
          1. COST BREAKDOWN
      ══════════════════════════════════════════════════════════════ */}
      <Pnl title="סיכום עלויות">

        {kpiRows.map(({ label, value, ovField }) => (
          <KpiRow
            key={label}
            label={label}
            displayValue={value}
            ovField={ovField}
            cfg={cfg}
            sf={sf}
            fmtFn={fmtFn}
          />
        ))}

        {/* ── Retail price highlight ─────────────────────────────── */}
        <div
          style={{
            marginTop:      16,
            background:     C.ch,
            borderRadius:   8,
            padding:        "20px",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontFamily:    "'DM Sans',Helvetica,Arial,sans-serif",
                fontSize:      10,
                letterSpacing: "0.15em",
                color:         C.chx,
                textTransform: "uppercase",
                marginBottom:  4,
              }}
            >
              מחיר לצרכן
            </div>
            <div
              style={{
                fontFamily: "'Merriweather','Times New Roman',Georgia,serif",
                fontSize:   32,
                fontWeight: 700,
                color:      C.gd,
                lineHeight: 1,
              }}
            >
              {fmtFn(res.ri)}
            </div>
          </div>
          <div style={{ textAlign: "left" }}>
            <div
              style={{
                fontFamily:    "'DM Sans',Helvetica,Arial,sans-serif",
                fontSize:      10,
                color:         C.chx,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom:  4,
              }}
            >
              סיטונאי
            </div>
            <div
              style={{
                fontFamily: "'DM Sans',Helvetica,Arial,sans-serif",
                fontSize:   16,
                color:      "rgba(197,179,88,0.75)",
                fontWeight: 500,
              }}
            >
              {fmtFn(res.ws)}
            </div>
          </div>
        </div>

      </Pnl>

      {/* ══════════════════════════════════════════════════════════════
          2. CLIENT DETAILS
      ══════════════════════════════════════════════════════════════ */}
      <Pnl title="פרטי לקוח">

        <GR minColWidth={180}>
          <LR label="שם לקוח">
            <StableInp
              value={cfg.clientName}
              onChange={(v) => sf("clientName", v)}
              placeholder="שם מלא"
              inputMode="text"
            />
          </LR>
          <LR label="שם התכשיט / פריט">
            <StableInp
              value={cfg.quoteName}
              onChange={(v) => sf("quoteName", v)}
              placeholder="טבעת, צמיד, שרשרת..."
              inputMode="text"
            />
          </LR>
        </GR>

        <LR label="הערות" mt={4}>
          {/*
            Plain controlled textarea — sf("notes") does NOT trigger formula
            recalculation, so mid-keystroke re-renders do not occur and focus
            loss is not a risk. No StableInp needed here.
          */}
          <textarea
            value={cfg.notes}
            onChange={(e) => sf("notes", e.target.value)}
            placeholder="הערות חופשיות, בקשות מיוחדות..."
            rows={3}
            style={{
              width:        "100%",
              border:       "1px solid rgba(54,69,79,0.18)",
              borderRadius: 6,
              background:   "#fff",
              padding:      "12px 14px",
              fontFamily:   C.heb,
              fontSize:     15,
              color:        C.ch,
              outline:      "none",
              resize:       "vertical",
              minHeight:    80,
              boxSizing:    "border-box",
              lineHeight:   1.6,
            }}
          />
        </LR>

        {/* Image upload */}
        <div style={{ marginTop: 16 }}>
          <input
            type="file"
            ref={fileRef}
            accept="image/*"
            onChange={onImageUpload}
            style={{ display: "none" }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              width:          "100%",
              height:         48,
              border:         "1px dashed rgba(54,69,79,0.3)",
              borderRadius:   6,
              background:     "transparent",
              cursor:         "pointer",
              fontFamily:     C.heb,
              fontSize:       14,
              color:          C.chl,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              gap:            8,
            }}
          >
            <span style={{ fontSize: 20 }}>📷</span>
            {pieceImg ? "החלף תמונת תכשיט" : "העלה תמונת תכשיט"}
          </button>

          {pieceImg && (
            <div
              style={{
                marginTop:      12,
                border:         "1px solid rgba(54,69,79,0.12)",
                borderRadius:   6,
                overflow:       "hidden",
                maxHeight:      180,
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                background:     "#f8f6f2",
              }}
            >
              <img
                src={pieceImg}
                alt="piece preview"
                style={{
                  maxWidth:  "100%",
                  maxHeight: 180,
                  objectFit: "contain",
                }}
              />
            </div>
          )}
        </div>

      </Pnl>

      {/* ══════════════════════════════════════════════════════════════
          3. GENERATE CERTIFICATE
      ══════════════════════════════════════════════════════════════ */}
      <button
        onClick={onShowCert}
        style={{
          width:          "100%",
          height:         56,
          background:     C.ch,
          color:          C.iv,
          border:         "none",
          borderRadius:   8,
          cursor:         "pointer",
          fontFamily:     C.heb,
          fontSize:       16,
          fontWeight:     600,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          gap:            10,
          letterSpacing:  "0.02em",
        }}
      >
        <span style={{ fontSize: 20 }}>📄</span>
        הפק תעודה / הצעת מחיר
      </button>

    </div>
  );
}