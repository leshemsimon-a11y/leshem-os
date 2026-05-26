/**
 * components/StoneBlock.jsx
 *
 * SsBlock — one side-stone configuration row.
 *
 * Renders the four fields for a single melee / side-stone group:
 *   stone type, carat per piece, count, and manual price with a
 *   Total / Per-Carat toggle.
 *
 * Used twice inside CalculatorForm.jsx:
 *   <SsBlock cfg={cfg} sf={sf} prefix="ss1" label="שורה א׳" />
 *   <SsBlock cfg={cfg} sf={sf} prefix="ss2" label="שורה ב׳" />
 *
 * Props:
 *   cfg    {object}   Full quote config — reads [prefix]Type/Ct/Count/etc.
 *   sf     {function} Field setter: sf(fieldName, value)
 *   prefix {string}   "ss1" or "ss2"
 *   label  {string}   Hebrew section heading
 */

import { C, STYPES, SETTINGS } from "../lib/constants";
import { GR, LR, Sel, StableInp, PriceModeToggle } from "./UI";

export function SsBlock({ cfg, sf, prefix, label }) {
  const typeF  = `${prefix}Type`;
  const ctF    = `${prefix}Ct`;
  const countF = `${prefix}Count`;
  const manF   = `${prefix}Manual`;
  const pmF    = `${prefix}PriceMode`;
  const setF   = `${prefix}Setting`;

  return (
    <div
      style={{
        borderTop:  `0.5px solid rgba(54,69,79,0.08)`,
        paddingTop: 8,
        marginTop:  4,
      }}
    >
      {/* Row label */}
      <div
        style={{
          fontFamily:   C.heb,
          fontSize:     10,
          color:        C.chl,
          marginBottom: 6,
        }}
      >
        {label}
      </div>

      {/* Type + carat per piece */}
      <GR>
        <LR label="סוג">
          <Sel
            value={cfg[typeF]}
            onChange={(v) => sf(typeF, v)}
            options={STYPES}
          />
        </LR>
        <LR label="ct / יח׳">
          <StableInp
            value={cfg[ctF]}
            onChange={(v) => sf(ctF, v)}
            placeholder="0.05"
          />
        </LR>
      </GR>

      {/* Count + manual price with mode toggle */}
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
            <StableInp
              value={cfg[manF]}
              onChange={(v) => sf(manF, v)}
              placeholder="—"
            />
            <PriceModeToggle
              mode={cfg[pmF]}
              onChange={(v) => sf(pmF, v)}
              labels={["סה״כ", "לct"]}
              vals={["total", "per_carat"]}
            />
          </div>
        </LR>
      </GR>

      {/* Setting */}
      <LR label="הגדרה">
        <Sel
          value={cfg[setF]}
          onChange={(v) => sf(setF, v)}
          options={SETTINGS}
        />
      </LR>
    </div>
  );
}
