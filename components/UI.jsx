/**
 * components/UI.jsx  —  LESHEM.S OS · UI Atoms  (UX v2)
 *
 * Changes from v1:
 *   • Inputs / selects: 48 px height, full 1 px border, 6 px radius, 16 px font
 *   • Labels: 13 px, semi-bold, 8 px margin-bottom
 *   • Pnl: white card on ivory page, 10 px radius, 24 px padding, gold-bar title
 *   • GR: auto-fit minmax(200 px, 1fr) — single-column on mobile automatically
 *   • PriceModeToggle: 36 px height, 11 px font, clearly readable
 *   • StableInp: blur-commit behaviour unchanged — only visual shell updated
 *
 * Zero business logic. Zero React state (except StableInp draft).
 */

import { useState, useRef, useEffect } from "react";
import { C } from "../lib/constants";

// ─── Shared token overrides for UX v2 ────────────────────────────────
const INPUT_HEIGHT   = 48;
const LABEL_SIZE     = 13;
const INPUT_FONT     = 16;
const CARD_RADIUS    = 10;
const CARD_PAD_V     = 24;
const CARD_PAD_H     = 24;
const FIELD_GAP      = 16;   // vertical gap between LR rows inside a card
const GRID_GAP       = 16;   // gap between columns in GR
const BORDER_COLOR   = "rgba(54,69,79,0.18)";
const BORDER_FOCUS   = C.gd;
const CARD_BG        = "#FFFFFF";

// ─── GR ──────────────────────────────────────────────────────────────
/**
 * Responsive two-column grid.
 * On screens narrower than ~440 px the two columns collapse into one
 * because minmax(200px, 1fr) cannot fit side-by-side — no JS/hooks needed.
 */
export function GR({ children, minColWidth = 200 }) {
  return (
    <div
      style={{
        display:             "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(${minColWidth}px, 1fr))`,
        gap:                 GRID_GAP,
        marginBottom:        FIELD_GAP,
      }}
    >
      {children}
    </div>
  );
}

// ─── LR ──────────────────────────────────────────────────────────────
/**
 * Label (top) + field (below).
 *
 * @prop {string}  label
 * @prop {number}  [mt]    Optional top margin (px) for manual spacing
 * @prop {node}    children
 */
export function LR({ label, children, mt }) {
  return (
    <div
      style={{
        display:       "flex",
        flexDirection: "column",
        gap:           8,
        marginTop:     mt ?? 0,
      }}
    >
      <label
        style={{
          fontFamily:  C.heb,
          fontSize:    LABEL_SIZE,
          fontWeight:  600,
          color:       C.chm,
          lineHeight:  1,
          userSelect:  "none",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Sel ─────────────────────────────────────────────────────────────
/**
 * 48 px select with full border and clear chevron.
 *
 * @prop {string}   value
 * @prop {function} onChange(value: string)
 * @prop {string[]} options
 * @prop {object}   [style]
 */
export function Sel({ value, onChange, options, style }) {
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width:            "100%",
          height:           INPUT_HEIGHT,
          border:           `1px solid ${BORDER_COLOR}`,
          borderRadius:     6,
          background:       CARD_BG,
          padding:          "0 40px 0 14px",   // right room for chevron
          fontFamily:       C.heb,
          fontSize:         INPUT_FONT,
          color:            C.ch,
          outline:          "none",
          cursor:           "pointer",
          appearance:       "none",
          WebkitAppearance: "none",
          ...style,
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {/* Custom chevron */}
      <span
        aria-hidden="true"
        style={{
          position:      "absolute",
          left:          12,
          top:           "50%",
          transform:     "translateY(-50%)",
          pointerEvents: "none",
          fontSize:      11,
          color:         C.chl,
        }}
      >
        ▾
      </span>
    </div>
  );
}

// ─── Pnl ─────────────────────────────────────────────────────────────
/**
 * White card section with a gold-accented title bar.
 *
 * @prop {string} [title]   Section heading (Hebrew/English)
 * @prop {node}   children
 * @prop {object} [style]   Extra inline styles on the wrapper
 */
export function Pnl({ title, children, style }) {
  return (
    <div
      style={{
        background:   CARD_BG,
        border:       `1px solid rgba(54,69,79,0.12)`,
        borderRadius: CARD_RADIUS,
        padding:      `${CARD_PAD_V}px ${CARD_PAD_H}px`,
        marginBottom: 16,
        ...style,
      }}
    >
      {title && (
        <div
          style={{
            display:       "flex",
            alignItems:    "center",
            gap:           10,
            marginBottom:  20,
            paddingBottom: 14,
            borderBottom:  `1px solid rgba(54,69,79,0.08)`,
          }}
        >
          {/* Gold accent bar */}
          <div
            style={{
              width:        3,
              height:       18,
              background:   C.gd,
              borderRadius: 2,
              flexShrink:   0,
            }}
          />
          <span
            style={{
              fontFamily:    C.heb,
              fontSize:      12,
              fontWeight:    700,
              color:         C.ch,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {title}
          </span>
        </div>
      )}
      {children}
    </div>
  );
}

// ─── PriceModeToggle ─────────────────────────────────────────────────
/**
 * Two-button mode toggle: "Total" vs "Per Carat / Per Gram".
 * Minimum 36 px height, clear active state.
 *
 * @prop {string}   mode           Current mode value
 * @prop {function} onChange(v)
 * @prop {string[]} labels         e.g. ["סה״כ", "לct"]
 * @prop {string[]} [vals]         default ["total", "per_unit"]
 */
export function PriceModeToggle({ mode, onChange, labels, vals }) {
  const v = vals ?? ["total", "per_unit"];
  return (
    <div
      style={{
        display:      "flex",
        border:       `1px solid ${BORDER_COLOR}`,
        borderRadius: 6,
        overflow:     "hidden",
        flexShrink:   0,
        height:       36,
      }}
    >
      {v.map((m, i) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          style={{
            flex:       1,
            minWidth:   44,
            padding:    "0 10px",
            cursor:     "pointer",
            border:     "none",
            background: mode === m ? C.ch : "transparent",
            color:      mode === m ? C.iv  : C.chl,
            fontFamily: C.heb,
            fontSize:   11,
            fontWeight: mode === m ? 700 : 400,
            whiteSpace: "nowrap",
            transition: "background 0.15s, color 0.15s",
          }}
        >
          {labels[i]}
        </button>
      ))}
    </div>
  );
}

// ─── StableInp ───────────────────────────────────────────────────────
/**
 * Focus-safe decimal / text input — blur-commit pattern unchanged.
 *
 * Visual shell updated to match 48 px height, full border, 16 px font.
 * Behaviour is identical to v1:
 *   • Local `draft` state holds what the user is typing.
 *   • Parent `onChange` is called ONLY on blur or Enter.
 *   • External `value` synced into draft only on programmatic change (reset).
 *
 * @prop {string}   value
 * @prop {function} onChange(v: string)
 * @prop {string}   [placeholder]
 * @prop {string}   [inputMode]     "decimal" (default) | "numeric" | "text"
 * @prop {object}   [style]         Extra inline styles
 */
export function StableInp({
  value,
  onChange,
  placeholder,
  inputMode,
  style,
  ...rest
}) {
  const [draft, setDraft] = useState(value ?? "");
  const committed         = useRef(value);

  useEffect(() => {
    if (value !== committed.current) {
      committed.current = value;
      setDraft(value ?? "");
    }
  }, [value]);

  const commit = (v) => {
    committed.current = v;
    onChange(v);
  };

  return (
    <input
      value={draft}
      inputMode={inputMode ?? "decimal"}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => commit(draft)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          commit(draft);
          e.currentTarget.blur();
        }
      }}
      style={{
        width:        "100%",
        height:       INPUT_HEIGHT,
        border:       `1px solid ${BORDER_COLOR}`,
        borderRadius: 6,
        background:   CARD_BG,
        padding:      "0 14px",
        fontFamily:   C.heb,
        fontSize:     INPUT_FONT,
        color:        C.ch,
        outline:      "none",
        boxSizing:    "border-box",
        // Focus ring via CSS pseudo-class isn't possible in inline styles,
        // so we rely on the browser default outline only being suppressed here;
        // onFocus/onBlur border change can be added if needed without changing logic.
        ...style,
      }}
      {...rest}
    />
  );
}
