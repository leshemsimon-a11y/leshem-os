/**
 * components/CalculatorForm.jsx  —  v5.4
 *
 * Changes from v5.2.2:
 *
 * Task 7 — Multiple Center Stones foundation:
 *   If cfg.centerStones[] is non-empty (set by prefillCalcFromItem or the
 *   future multi-stone UI), each stone is shown as a compact chip above
 *   the center stone panel. Each chip shows: type, carat, color, clarity,
 *   a source badge (inventory/manual), and a remove button.
 *   The chips are read-only display — editing routes through the existing
 *   centerCt/centerType/etc. fields in cfg, which remain the source of truth
 *   for calcApp().
 *
 * Task 8 — Side stones improvements:
 *   SsBlock now renders shape/cut, color, and clarity fields in addition to
 *   the existing type/count/carat/price fields.
 *   Label: "סוג שיבוץ" (not "הגדרה").
 *
 * Task 8 — Side stones color/clarity also added to cfg via DCFG in constants.js
 *   (handled in the constants file update, not here).
 *
 * All other logic unchanged from v5.2.2.
 */

import { C, METALS, CASTS, CMPLX, STYPES, COLORS_D, CLARITIES, SETTINGS } from "../lib/constants";
import { GR, LR, Sel, Pnl, StableInp, PriceModeToggle } from "./UI";

// ─── CenterStoneChip ─────────────────────────────────────────────────────────
function CenterStoneChip({ stone, index, onRemove }) {
  const spec = [stone.carat, stone.color, stone.clarity].filter(Boolean).join(" · ");
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:8,
      padding:"6px 10px",
      background: stone.source === "inventory" ? "rgba(197,179,88,0.08)" : "rgba(54,69,79,0.04)",
      border:`1px solid ${stone.source === "inventory" ? "rgba(197,179,88,0.35)" : "rgba(54,69,79,0.15)"}`,
      borderRadius:7, marginBottom:6,
    }}>
      <span style={{ fontSize:14, flexShrink:0 }}>💎</span>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:C.dat, fontSize:12, fontWeight:600, color:C.ch }}>
          {stone.stoneType || "Stone"} {index + 1}
          {stone.source === "inventory" && (
            <span style={{ fontFamily:C.dat, fontSize:9.5, fontWeight:400, color:"#8a7a2a", marginRight:6 }}>
              {" "}· ממלאי
            </span>
          )}
        </div>
        {spec && <div style={{ fontFamily:C.dat, fontSize:11, color:C.chl, marginTop:1 }}>{spec}</div>}
      </div>
      {onRemove && (
        <button
          onClick={() => onRemove(index)}
          style={{ background:"none", border:"none", cursor:"pointer", color:C.chx, fontSize:14, lineHeight:1, padding:"0 2px", flexShrink:0 }}
          title="הסר"
        >✕</button>
      )}
    </div>
  );
}

// ─── SsBlockV2 — Side stone row with shape/color/clarity (Task 8) ─────────────
function SsBlockV2({ cfg, sf, prefix, label }) {
  const typeF    = `${prefix}Type`;
  const ctF      = `${prefix}Ct`;
  const countF   = `${prefix}Count`;
  const manF     = `${prefix}Manual`;
  const pmF      = `${prefix}PriceMode`;
  const setF     = `${prefix}Setting`;
  const colorF   = `${prefix}Color`;
  const clarityF = `${prefix}Clarity`;
  const shapeF   = `${prefix}Shape`;

  return (
    <div style={{ borderTop:`0.5px solid rgba(54,69,79,0.08)`, paddingTop:8, marginTop:4 }}>
      <div style={{ fontFamily:C.heb, fontSize:10, color:C.chl, marginBottom:6 }}>
        {label}
      </div>

      {/* Type + carat per piece */}
      <GR>
        <LR label="סוג">
          <Sel value={cfg[typeF]} onChange={(v) => sf(typeF, v)} options={STYPES} />
        </LR>
        <LR label="ct / יח׳">
          <StableInp value={cfg[ctF]} onChange={(v) => sf(ctF, v)} placeholder="0.05" />
        </LR>
      </GR>

      {/* Count + manual price */}
      <GR>
        <LR label="כמות">
          <StableInp value={cfg[countF]} onChange={(v) => sf(countF, v)} placeholder="0" inputMode="numeric" />
        </LR>
        <LR label="מחיר ידני">
          <div style={{ display:"flex", gap:4, alignItems:"flex-end" }}>
            <StableInp value={cfg[manF]} onChange={(v) => sf(manF, v)} placeholder="—" />
            <PriceModeToggle mode={cfg[pmF]} onChange={(v) => sf(pmF, v)} labels={["סה״כ","לct"]} vals={["total","per_carat"]} />
          </div>
        </LR>
      </GR>

      {/* v5.4: Color + Clarity (Task 8) */}
      {cfg[typeF] === "Diamond" && (
        <GR>
          <LR label="צבע">
            <Sel value={cfg[colorF] || ""} onChange={(v) => sf(colorF, v)} options={COLORS_D} />
          </LR>
          <LR label="ניקיון">
            <Sel value={cfg[clarityF] || ""} onChange={(v) => sf(clarityF, v)} options={CLARITIES} />
          </LR>
        </GR>
      )}

      {/* v5.4: Shape (Task 8) */}
      <GR>
        <LR label="צורה">
          <StableInp
            value={cfg[shapeF] || ""}
            onChange={(v) => sf(shapeF, v)}
            placeholder="Round, Oval…"
          />
        </LR>
        {/* Setting — "סוג שיבוץ" never "הגדרה" (Task 8) */}
        <LR label="סוג שיבוץ">
          <Sel value={cfg[setF]} onChange={(v) => sf(setF, v)} options={SETTINGS} />
        </LR>
      </GR>
    </div>
  );
}

// ─── CalculatorForm ───────────────────────────────────────────────────────────
export function CalculatorForm({ cfg, res, sf, fmtFn, onRemoveCenterStone }) {
  const centerCtEmpty  = !cfg.centerCt || parseFloat(cfg.centerCt) === 0;
  const centerCountGt1 = (parseInt(cfg.centerCount, 10) || 1) > 1;
  const centerStones   = Array.isArray(cfg.centerStones) ? cfg.centerStones : [];

  return (
    <div>

      {/* ── 1. Metal ──────────────────────────────────────────────── */}
      <Pnl title="מתכת">
        <GR>
          <LR label="סוג מתכת">
            <Sel value={cfg.metal} onChange={(v) => sf("metal", v)} options={METALS} />
          </LR>
          <LR label="גרם">
            <StableInp value={cfg.grams} onChange={(v) => sf("grams", v)} placeholder="0.00" />
          </LR>
        </GR>
        <GR>
          <LR label="יציקה">
            <Sel value={cfg.cast} onChange={(v) => sf("cast", v)} options={CASTS} />
          </LR>
          <LR label="מורכבות">
            <Sel value={cfg.cmplx} onChange={(v) => sf("cmplx", v)} options={CMPLX} />
          </LR>
        </GR>
        <div style={{ borderTop:`0.5px solid rgba(54,69,79,0.08)`, paddingTop:8, marginTop:4 }}>
          <LR label="עלות מתכת ידנית">
            <div style={{ display:"flex", gap:6, alignItems:"flex-end" }}>
              <StableInp value={cfg.mcManual} onChange={(v) => sf("mcManual", v)} placeholder={`אוט. ${fmtFn(res.rawMC)}`} />
              <PriceModeToggle mode={cfg.mcMode} onChange={(v) => sf("mcMode", v)} labels={["סה״כ","לגרם"]} vals={["total","per_gram"]} />
            </div>
          </LR>
        </div>
      </Pnl>

      {/* ── 2. Center Stone ───────────────────────────────────────── */}
      <Pnl title="אבן מרכזית">

        {/* v5.4: Multiple center stone chips from inventory (Task 7) */}
        {centerStones.length > 0 && (
          <div style={{ marginBottom:10 }}>
            <div style={{ fontFamily:C.heb, fontSize:10, color:C.chl, marginBottom:6 }}>
              אבנות שנבחרו ממלאי:
            </div>
            {centerStones.map((stone, idx) => (
              <CenterStoneChip
                key={idx}
                stone={stone}
                index={idx}
                onRemove={onRemoveCenterStone}
              />
            ))}
          </div>
        )}

        {/* Zero-state tip */}
        {centerCtEmpty && centerStones.length === 0 && (
          <div style={{ fontFamily:C.heb, fontSize:11, color:C.chl, background:"rgba(197,179,88,0.06)", border:"1px solid rgba(197,179,88,0.18)", borderRadius:5, padding:"7px 10px", marginBottom:10, lineHeight:1.55 }}>
            ❑ אבן מרכזית אינה חובה — מתאים גם למוצרי מתכת בלבד
          </div>
        )}

        <GR>
          <LR label="סוג">
            <Sel value={cfg.centerType} onChange={(v) => sf("centerType", v)} options={STYPES} />
          </LR>
          <LR label="קראט / אבן">
            <StableInp value={cfg.centerCt} onChange={(v) => sf("centerCt", v)} placeholder="1.00" />
          </LR>
        </GR>

        <GR>
          <LR label="כמות אבנות מרכזיות">
            <StableInp value={cfg.centerCount} onChange={(v) => sf("centerCount", v)} placeholder="1" />
          </LR>
          {centerCountGt1 && !centerCtEmpty && (
            <LR label="סה״כ קראט">
              <div style={{ height:36, display:"flex", alignItems:"center", fontFamily:C.dat, fontSize:12, color:C.ch, fontWeight:600 }}>
                {((parseFloat(cfg.centerCt)||0) * Math.max(1, parseInt(cfg.centerCount,10)||1)).toFixed(2)} ct
              </div>
            </LR>
          )}
        </GR>

        {cfg.centerType === "Diamond" && (
          <GR>
            <LR label="צבע">
              <Sel value={cfg.centerColor} onChange={(v) => sf("centerColor", v)} options={COLORS_D} />
            </LR>
            <LR label="ניקיון">
              <Sel value={cfg.centerClarity} onChange={(v) => sf("centerClarity", v)} options={CLARITIES} />
            </LR>
          </GR>
        )}

        {/* סוג שיבוץ — Task 6/8: never "הגדרה" */}
        <LR label="סוג שיבוץ">
          <Sel value={cfg.centerSetting} onChange={(v) => sf("centerSetting", v)} options={SETTINGS} />
        </LR>

        <LR label="מחיר ידני" mt={8}>
          <div style={{ display:"flex", gap:6, alignItems:"flex-end" }}>
            <StableInp value={cfg.centerManual} onChange={(v) => sf("centerManual", v)} placeholder={`אוט. ${fmtFn(res.centerCost)}`} />
            <PriceModeToggle mode={cfg.centerMode} onChange={(v) => sf("centerMode", v)} labels={["סה״כ","לct"]} vals={["total","per_carat"]} />
          </div>
        </LR>
      </Pnl>

      {/* ── 3. Side Stones (אבני צד) — v5.4: improved with shape/color/clarity ── */}
      <Pnl title="אבני צד">
        <SsBlockV2 cfg={cfg} sf={sf} prefix="ss1" label="שורה א׳" />
        <SsBlockV2 cfg={cfg} sf={sf} prefix="ss2" label="שורה ב׳" />
      </Pnl>

    </div>
  );
}
