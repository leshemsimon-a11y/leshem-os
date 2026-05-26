/**
 * components/CostSummary.jsx
 *
 * Right column of the calculator grid.
 * Contains:
 *   1. סיכום עלויות  — KPI breakdown rows + retail price highlight
 *   2. פרטי לקוח     — client name, piece name, notes, image upload
 *   3. הפק תעודה     — button to switch to the certificate tab
 *
 * Props:
 *   cfg          {object}    Full quote config
 *   res          {object}    Calculated results from calcApp(cfg)
 *   sf           {function}  Field setter: sf(fieldName, value)
 *   fmtFn        {function}  Currency formatter
 *   pieceImg     {string|null} Base64 data URL for the uploaded piece image
 *   fileRef      {React.ref} ref forwarded to the hidden <input type="file">
 *   onImageUpload {function} onChange handler for the file input
 *   onShowCert   {function}  Called when the "הפק תעודה" button is clicked
 */

import { C } from "../lib/constants";
import { Pnl, GR, LR, StableInp } from "./UI";

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
  // KPI rows definition — [ display label, calculated value, override field | null ]
  // null in the third position = read-only row (no override input).
  const kpiRows = [
    { label: "מתכת",        value: res.mc,                   ovField: "mcOv"   },
    { label: "עבודה",       value: res.lc,                   ovField: "lcOv"   },
    { label: "אבן מרכזית", value: res.centerCost,            ovField: null     },
    { label: "אבני צד",    value: res.ss1Cost + res.ss2Cost, ovField: null     },
    { label: "סה״כ ייצור", value: res.prod,                  ovField: "prodOv" },
    { label: "סיטונאי",    value: res.ws,                    ovField: "wsOv"   },
    { label: "קמעונאי",    value: res.rx,                    ovField: "rxOv"   },
    { label: "כולל מע״מ",  value: res.ri,                    ovField: "riOv"   },
  ];

  return (
    <div>

      {/* ── Cost breakdown ────────────────────────────────────────── */}
      <Pnl title="סיכום עלויות">
        {kpiRows.map(({ label, value, ovField }) => (
          <div
            key={label}
            style={{
              display:        "flex",
              justifyContent: "space-between",
              alignItems:     "center",
              padding:        "5px 0",
              borderBottom:   `0.5px solid rgba(54,69,79,0.07)`,
            }}
          >
            <span
              style={{
                fontFamily: C.heb,
                fontSize:   11.5,
                color:      C.chm,
              }}
            >
              {label}
            </span>

            {/* Editable KPI: show StableInp with calculated value as placeholder */}
            {ovField ? (
              <StableInp
                value={cfg[ovField]}
                onChange={(v) => sf(ovField, v)}
                placeholder={fmtFn(value)}
                style={{
                  width:      90,
                  textAlign:  "left",
                  fontFamily: C.eng,
                  fontWeight: 500,
                }}
              />
            ) : (
              /* Read-only KPI: just display the formatted value */
              <span
                style={{
                  fontFamily: C.eng,
                  fontSize:   12,
                  fontWeight: 600,
                  color:      C.ch,
                }}
              >
                {fmtFn(value)}
              </span>
            )}
          </div>
        ))}

        {/* Retail price highlight bar */}
        <div
          style={{
            marginTop:      10,
            padding:        "8px 12px",
            background:     C.ch,
            display:        "flex",
            justifyContent: "space-between",
            alignItems:     "center",
          }}
        >
          <span
            style={{
              fontFamily: C.heb,
              fontSize:   12,
              color:      C.iv,
            }}
          >
            מחיר לצרכן
          </span>
          <span
            style={{
              fontFamily: C.serif,
              fontSize:   18,
              color:      C.gd,
              fontWeight: 700,
            }}
          >
            {fmtFn(res.ri)}
          </span>
        </div>
      </Pnl>

      {/* ── Client info & image ───────────────────────────────────── */}
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
          {/*
            Notes textarea is intentionally a plain controlled textarea (not
            StableInp) because it is multi-line and onChange → sf does not
            trigger a formula recalculation, so focus-loss is not a risk here.
          */}
          <textarea
            value={cfg.notes}
            onChange={(e) => sf("notes", e.target.value)}
            placeholder="הערות חופשיות..."
            style={{
              width:      "100%",
              border:     `0.5px solid rgba(54,69,79,0.2)`,
              background: "transparent",
              padding:    "6px 8px",
              fontFamily: C.heb,
              fontSize:   11.5,
              color:      C.ch,
              outline:    "none",
              resize:     "vertical",
              minHeight:  60,
              marginTop:  4,
            }}
          />
        </LR>

        {/* Hidden file input — triggered by the button below */}
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
            padding:        8,
            border:         `0.5px dashed rgba(54,69,79,0.3)`,
            background:     "transparent",
            cursor:         "pointer",
            fontFamily:     C.heb,
            fontSize:       11,
            color:          C.chl,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            gap:            6,
            marginTop:      6,
          }}
        >
          📷 {pieceImg ? "החלף תמונה" : "העלה תמונת תכשיט"}
        </button>

        {pieceImg && (
          <img
            src={pieceImg}
            alt="piece preview"
            style={{
              width:      "100%",
              marginTop:  8,
              maxHeight:  120,
              objectFit:  "contain",   // no distortion or clipping
              border:     `0.5px solid rgba(54,69,79,0.15)`,
            }}
          />
        )}
      </Pnl>

      {/* ── Generate certificate ──────────────────────────────────── */}
      <button
        onClick={onShowCert}
        style={{
          width:          "100%",
          padding:        11,
          background:     C.ch,
          color:          C.iv,
          border:         "none",
          cursor:         "pointer",
          fontFamily:     C.heb,
          fontSize:       12,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          gap:            6,
        }}
      >
        📄 הפק תעודה
      </button>

    </div>
  );
}
