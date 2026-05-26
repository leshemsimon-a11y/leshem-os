/**
 * components/CalculatorForm.jsx  —  UX v2
 *
 * Left column of the calculator grid.
 * Three card sections:
 *   1. מתכת         — Metal
 *   2. אבן מרכזית   — Center Stone
 *   3. אבני צד      — Side Stones (two SsBlock rows)
 *
 * Layout: single-column cards stacked vertically.
 * Internal field rows use GR (auto-fit) so they collapse on mobile.
 *
 * Props:
 *   cfg    {object}    Full quote config
 *   res    {object}    Results from calcApp(cfg)
 *   sf     {function}  Field setter
 *   fmtFn  {function}  Currency formatter
 *
 * Zero logic changes from v1.
 */

import { C, METALS, CASTS, CMPLX, STYPES, COLORS_D, CLARITIES, SETTINGS } from "../lib/constants";
import { GR, LR, Sel, Pnl, StableInp, PriceModeToggle } from "./UI";
import { SsBlock } from "./StoneBlock";

export function CalculatorForm({ cfg, res, sf, fmtFn }) {
  return (
    <div>

      {/* ══════════════════════════════════════════════════════════════
          1. METAL
      ══════════════════════════════════════════════════════════════ */}
      <Pnl title="מתכת">

        {/* Metal type full-width for clarity */}
        <LR label="סוג מתכת">
          <Sel
            value={cfg.metal}
            onChange={(v) => sf("metal", v)}
            options={METALS}
          />
        </LR>

        <div style={{ marginTop: 16 }}>
          <GR minColWidth={160}>
            <LR label="משקל (גרם)">
              <StableInp
                value={cfg.grams}
                onChange={(v) => sf("grams", v)}
                placeholder="0.00"
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
        </div>

        <LR label="שיטת יציקה">
          <Sel
            value={cfg.cast}
            onChange={(v) => sf("cast", v)}
            options={CASTS}
          />
        </LR>

        {/* Metal override — clearly separated */}
        <div
          style={{
            marginTop:    20,
            paddingTop:   20,
            borderTop:    "1px solid rgba(54,69,79,0.08)",
          }}
        >
          <LR label="עלות מתכת ידנית (השאר ריק לחישוב אוטומטי)">
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <StableInp
                  value={cfg.mcManual}
                  onChange={(v) => sf("mcManual", v)}
                  placeholder={`אוט. ${fmtFn(res.rawMC)}`}
                />
              </div>
              <div style={{ paddingTop: 6 }}>
                <PriceModeToggle
                  mode={cfg.mcMode}
                  onChange={(v) => sf("mcMode", v)}
                  labels={["סה״כ", "לגרם"]}
                  vals={["total", "per_gram"]}
                />
              </div>
            </div>
          </LR>
        </div>

      </Pnl>

      {/* ══════════════════════════════════════════════════════════════
          2. CENTER STONE
      ══════════════════════════════════════════════════════════════ */}
      <Pnl title="אבן מרכזית">

        <GR minColWidth={160}>
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

        {/* Diamond-specific fields */}
        {cfg.centerType === "Diamond" && (
          <GR minColWidth={160}>
            <LR label="צבע (Color)">
              <Sel
                value={cfg.centerColor}
                onChange={(v) => sf("centerColor", v)}
                options={COLORS_D}
              />
            </LR>
            <LR label="נקיון (Clarity)">
              <Sel
                value={cfg.centerClarity}
                onChange={(v) => sf("centerClarity", v)}
                options={CLARITIES}
              />
            </LR>
          </GR>
        )}

        <LR label="הגדרה (Setting)">
          <Sel
            value={cfg.centerSetting}
            onChange={(v) => sf("centerSetting", v)}
            options={SETTINGS}
          />
        </LR>

        {/* Center stone override */}
        <div
          style={{
            marginTop:  20,
            paddingTop: 20,
            borderTop:  "1px solid rgba(54,69,79,0.08)",
          }}
        >
          <LR label="מחיר אבן ידני (השאר ריק לחישוב אוטומטי)">
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <StableInp
                  value={cfg.centerManual}
                  onChange={(v) => sf("centerManual", v)}
                  placeholder={`אוט. ${fmtFn(res.centerCost)}`}
                />
              </div>
              <div style={{ paddingTop: 6 }}>
                <PriceModeToggle
                  mode={cfg.centerMode}
                  onChange={(v) => sf("centerMode", v)}
                  labels={["סה״כ", "לct"]}
                  vals={["total", "per_carat"]}
                />
              </div>
            </div>
          </LR>
        </div>

      </Pnl>

      {/* ══════════════════════════════════════════════════════════════
          3. SIDE STONES
      ══════════════════════════════════════════════════════════════ */}
      <Pnl title="אבני צד">
        <SsBlock cfg={cfg} sf={sf} prefix="ss1" label="שורה א׳" />
        <SsBlock cfg={cfg} sf={sf} prefix="ss2" label="שורה ב׳" />
      </Pnl>

    </div>
  );
}
