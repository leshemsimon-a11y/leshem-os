/**
 * components/CalculatorForm.jsx  —  v5.2.2
 *
 * Changes from v5.2.1:
 *
 * Task 6 — Terminology fix:
 *   "הגדרה" → "סוג שיבוץ"  (Setting type label in Center Stone section)
 *
 * Task 1 — Calculator zero state UX:
 *   Center stone section now shows an empty-state note when centerCt is empty:
 *   "אבן מרכזית אינה חובה — מתאים גם למוצרי מתכת בלבד"
 *   The note disappears once the user enters a carat weight.
 *
 * All other logic and layout unchanged from v5.2.1.
 */

import { C, METALS, CASTS, CMPLX, STYPES, COLORS_D, CLARITIES, SETTINGS } from "../lib/constants";
import { GR, LR, Sel, Pnl, StableInp, PriceModeToggle } from "./UI";
import { SsBlock } from "./StoneBlock";

export function CalculatorForm({ cfg, res, sf, fmtFn }) {
  const centerCtEmpty = !cfg.centerCt || parseFloat(cfg.centerCt) === 0;
  const centerCountGt1 = (parseInt(cfg.centerCount, 10) || 1) > 1;

  return (
    <div>

      {/* ── 1. Metal ──────────────────────────────────────────────── */}
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

        {/* Metal cost manual override */}
        <div style={{ borderTop: `0.5px solid rgba(54,69,79,0.08)`, paddingTop: 8, marginTop: 4 }}>
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

      {/* ── 2. Center Stone ───────────────────────────────────────── */}
      <Pnl title="אבן מרכזית">

        {/* Zero-state tip — only shown when no carat weight entered */}
        {centerCtEmpty && (
          <div style={{
            fontFamily:   C.heb,
            fontSize:     11,
            color:        C.chl,
            background:   "rgba(197,179,88,0.06)",
            border:       "1px solid rgba(197,179,88,0.18)",
            borderRadius: 5,
            padding:      "7px 10px",
            marginBottom: 10,
            lineHeight:   1.55,
          }}>
            ❑ אבן מרכזית אינה חובה — מתאים גם למוצרי מתכת בלבד
          </div>
        )}

        <GR>
          <LR label="סוג">
            <Sel
              value={cfg.centerType}
              onChange={(v) => sf("centerType", v)}
              options={STYPES}
            />
          </LR>
          <LR label="קראט / אבן">
            <StableInp
              value={cfg.centerCt}
              onChange={(v) => sf("centerCt", v)}
              placeholder="1.00"
            />
          </LR>
        </GR>

        {/* Center stone count */}
        <GR>
          <LR label="כמות אבנות מרכזיות">
            <StableInp
              value={cfg.centerCount}
              onChange={(v) => sf("centerCount", v)}
              placeholder="1"
            />
          </LR>
          {centerCountGt1 && !centerCtEmpty && (
            <LR label="סה״כ קראט">
              <div style={{
                height: 36, display: "flex", alignItems: "center",
                fontFamily: C.dat, fontSize: 12, color: C.ch, fontWeight: 600,
              }}>
                {(
                  (parseFloat(cfg.centerCt) || 0) *
                  Math.max(1, parseInt(cfg.centerCount, 10) || 1)
                ).toFixed(2)} ct
              </div>
            </LR>
          )}
        </GR>

        {/* Color + Clarity — only for diamonds */}
        {cfg.centerType === "Diamond" && (
          <GR>
            <LR label="צבע">
              <Sel
                value={cfg.centerColor}
                onChange={(v) => sf("centerColor", v)}
                options={COLORS_D}
              />
            </LR>
            <LR label="ניקיון">
              <Sel
                value={cfg.centerClarity}
                onChange={(v) => sf("centerClarity", v)}
                options={CLARITIES}
              />
            </LR>
          </GR>
        )}

        {/* Setting — Task 6: "סוג שיבוץ" not "הגדרה" */}
        <LR label="סוג שיבוץ">
          <Sel
            value={cfg.centerSetting}
            onChange={(v) => sf("centerSetting", v)}
            options={SETTINGS}
          />
        </LR>

        {/* Center stone price manual override */}
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

      {/* ── 3. Side Stones (אבני צד) ──────────────────────────────── */}
      <Pnl title="אבני צד">
        <SsBlock cfg={cfg} sf={sf} prefix="ss1" label="שורה א׳" />
        <SsBlock cfg={cfg} sf={sf} prefix="ss2" label="שורה ב׳" />
      </Pnl>

    </div>
  );
}
