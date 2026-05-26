/**
 * components/UI.jsx
 *
 * Primitive UI atoms shared across the app.
 *
 * Exports (in dependency order, simplest first):
 *   GR                — two-column grid row
 *   LR                — label + field wrapper
 *   Sel               — thin borderless-bottom select
 *   Pnl               — titled bordered panel
 *   PriceModeToggle   — two-button "Total / Per-unit" toggle
 *   StableInp         — blur-commit decimal / text input (focus-safe)
 *
 * All components are defined at module scope.
 * None of them import from each other in a circular way.
 * Zero business logic — pure presentation.
 */

import { useState, useRef, useEffect } from "react";
import { C } from "../lib/constants";

// ─── GR ──────────────────────────────────────────────────────────────
/**
 * Two-column equal-width grid with an 8px gap.
 * Used to pair label+field rows horizontally.
 */
export function GR({ children }) {
  return (
    <div
      style={{
        display:             "grid",
        gridTemplateColumns: "1fr 1fr",
        gap:                 8,
        marginBottom:        8,
      }}
    >
      {children}
    </div>
  );
}

// ─── LR ──────────────────────────────────────────────────────────────
/**
 * Label (top) + children (below) stacked vertically.
 *
 * @prop {string}  label   — Field label text (Hebrew)
 * @prop {number}  [mt]    — Optional top margin (pixels)
 * @prop {node}    children
 */
export function LR({ label, children, mt }) {
  return (
    <div
      style={{
        display:       "flex",
        flexDirection: "column",
        gap:           2,
        marginTop:     mt,
      }}
    >
      <span
        style={{
          fontFamily: C.heb,
          fontSize:   10,
          color:      C.chl,
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

// ─── Sel ─────────────────────────────────────────────────────────────
/**
 * Bottom-border-only select element styled to match the app's
 * "no-chrome, just the content" aesthetic.
 *
 * @prop {string}   value
 * @prop {function} onChange(value: string)
 * @prop {string[]} options
 * @prop {object}   [style]  — additional inline styles
 */
export function Sel({ value, onChange, options, style }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width:             "100%",
        border:            "none",
        borderBottom:      `0.5px solid rgba(54,69,79,0.2)`,
        background:        "transparent",
        padding:           "4px 2px",
        fontFamily:        C.heb,
        fontSize:          12,
        color:             C.ch,
        outline:           "none",
        cursor:            "pointer",
        appearance:        "none",
        WebkitAppearance:  "none",
        ...style,
      }}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

// ─── Pnl ─────────────────────────────────────────────────────────────
/**
 * Titled bordered panel — the primary grouping container.
 *
 * @prop {string} [title]  — Section heading (Hebrew, uppercase via CSS)
 * @prop {node}   children
 * @prop {object} [style]  — Additional inline styles on the wrapper div
 */
export function Pnl({ title, children, style }) {
  return (
    <div
      style={{
        border:       `0.5px solid rgba(54,69,79,0.12)`,
        padding:      "12px 14px",
        marginBottom: 10,
        ...style,
      }}
    >
      {title && (
        <div
          style={{
            fontFamily:    C.heb,
            fontSize:      10,
            color:         C.chl,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom:  10,
            paddingBottom: 6,
            borderBottom:  `0.5px solid rgba(54,69,79,0.1)`,
          }}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── PriceModeToggle ─────────────────────────────────────────────────
/**
 * Two-button toggle for switching between a total price and a
 * per-unit (per carat / per gram) price entry mode.
 *
 * @prop {string}   mode          — Current mode value (must match one of vals)
 * @prop {function} onChange(v)   — Called with the new mode string
 * @prop {string[]} labels        — Button labels, e.g. ["סה״כ", "לct"]
 * @prop {string[]} [vals]        — Mode values, default ["total", "per_unit"]
 */
export function PriceModeToggle({ mode, onChange, labels, vals }) {
  const v = vals ?? ["total", "per_unit"];
  return (
    <div
      style={{
        display:      "flex",
        border:       `0.5px solid rgba(54,69,79,0.2)`,
        borderRadius: 3,
        overflow:     "hidden",
        flexShrink:   0,
      }}
    >
      {v.map((m, i) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          style={{
            padding:    "3px 6px",
            cursor:     "pointer",
            border:     "none",
            background: mode === m ? C.ch : "transparent",
            color:      mode === m ? C.iv : C.chl,
            fontFamily: C.heb,
            fontSize:   9,
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
 * Focus-safe decimal / text input.
 *
 * Problem solved:
 *   Standard controlled React inputs lose focus when the parent
 *   re-renders mid-keystroke (e.g. formula recalculation triggered
 *   by every character).
 *
 * Solution — blur-commit pattern:
 *   • A local `draft` state mirrors what the user is currently typing.
 *   • `onChange` (the parent setter) is called ONLY on blur or Enter.
 *   • The external `value` prop is synced into `draft` ONLY when it
 *     changes programmatically (detected via a committed ref), which
 *     happens only on resets — never during an active typing session.
 *
 * @prop {string}   value           — Committed value from parent state
 * @prop {function} onChange(v)     — Called with draft string on blur/Enter
 * @prop {string}   [placeholder]
 * @prop {string}   [inputMode]     — "decimal" (default) | "numeric" | "text"
 * @prop {object}   [style]         — Additional inline styles
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

  // Sync external value → draft only when the parent changes it
  // programmatically (e.g. reset), not on every keystroke.
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
        border:       "none",
        borderBottom: `0.5px solid rgba(54,69,79,0.2)`,
        background:   "transparent",
        padding:      "4px 2px",
        fontFamily:   C.heb,
        fontSize:     12,
        color:        C.ch,
        outline:      "none",
        ...style,
      }}
      {...rest}
    />
  );
}
