/**
 * components/CalculatorForm.jsx
 *
 * Left column of the calculator grid.
 * Contains three Pnl sections:
 *   1. מתכת        — metal type, grams, casting, complexity, metal cost override
 *   2. אבן מרכזית  — center stone type, carat, color/clarity (diamond only),
 *                    setting, center stone price override
 *   3. אבני צד     — two SsBlock rows (ss1 / ss2)
 *
 * Props:
 *   cfg    {object}   Full quote config (from DCFG shape)
 *   res    {object}   Calculated results from calcApp(cfg)
 *   sf     {function} Field setter: sf(fieldName, value)
 *   fmtFn  {function} Currency formatter: fmtFn(usdValue) → "$1,234" | "₪4,628"
 */

import { C, METALS, CASTS, CMPLX, STYPES, COLORS_D, CLARITIES, SETTINGS } from "../lib/constants";
import { GR, LR, Sel, Pnl, StableInp, PriceModeToggle } from "./UI";
import { SsBlock } from "./StoneBlock";

export function CalculatorForm({ cfg, res, sf, fmtFn }) {
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
        <div
          style={{
            borderTop:  `0.5px solid rgba(54,69,79,0.08)`,
            paddingTop: 8,
            marginTop:  4,
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

      {/* ── 2. Center Stone ───────────────────────────────────────── */}
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

        {/* Color + Clarity only shown for diamonds */}
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

      {/* ── 3. Side Stones ────────────────────────────────────────── */}
      <Pnl title="אבני צד">
        <SsBlock cfg={cfg} sf={sf} prefix="ss1" label="שורה א׳" />
        <SsBlock cfg={cfg} sf={sf} prefix="ss2" label="שורה ב׳" />
      </Pnl>

    </div>
  );
}
