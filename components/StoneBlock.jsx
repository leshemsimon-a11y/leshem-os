/**
 * components/StoneBlock.jsx  —  UX v2
 *
 * One side-stone configuration block (ss1 or ss2).
 * Visual layout updated for larger atoms; zero logic changes.
 *
 * Props:
 *   cfg    {object}    Full quote config
 *   sf     {function}  Field setter: sf(fieldName, value)
 *   prefix {string}    "ss1" | "ss2"
 *   label  {string}    Hebrew section heading, e.g. "שורה א׳"
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
        borderTop:  "1px solid rgba(54,69,79,0.08)",
        paddingTop: 20,
        marginTop:  4,
      }}
    >
      {/* Sub-section label */}
      <div
        style={{
          fontFamily:    C.heb,
          fontSize:      11,
          fontWeight:    700,
          color:         C.chl,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom:  16,
        }}
      >
        {label}
      </div>

      {/* Type + carat — 160 px min so they stay side-by-side on most screens */}
      <GR minColWidth={160}>
        <LR label="סוג">
          <Sel
            value={cfg[typeF]}
            onChange={(v) => sf(typeF, v)}
            options={STYPES}
          />
        </LR>
        <LR label="קראט / יחידה">
          <StableInp
            value={cfg[ctF]}
            onChange={(v) => sf(ctF, v)}
            placeholder="0.05"
          />
        </LR>
      </GR>

      {/* Count + manual price with mode toggle */}
      <GR minColWidth={160}>
        <LR label="כמות">
          <StableInp
            value={cfg[countF]}
            onChange={(v) => sf(countF, v)}
            placeholder="0"
            inputMode="numeric"
          />
        </LR>
        <LR label="מחיר ידני">
          {/* Input + toggle stacked — fits any column width */}
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <StableInp
                value={cfg[manF]}
                onChange={(v) => sf(manF, v)}
                placeholder="—  (אוטומטי)"
              />
            </div>
            <div style={{ paddingTop: 6 }}>
              <PriceModeToggle
                mode={cfg[pmF]}
                onChange={(v) => sf(pmF, v)}
                labels={["סה״כ", "לct"]}
                vals={["total", "per_carat"]}
              />
            </div>
          </div>
        </LR>
      </GR>

      {/* Setting */}
      <LR label="הגדרה (Setting)">
        <Sel
          value={cfg[setF]}
          onChange={(v) => sf(setF, v)}
          options={SETTINGS}
        />
      </LR>
    </div>
  );
}
