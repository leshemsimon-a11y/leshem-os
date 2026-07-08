// components/studio/design/workstation/WorkstationProcessStrip.js
//
// LESHEM.S OS — Clean 6D: Studio Workstation Prototype — Zone 6.
//
// Compact visual process flow:
//   אבנים → תפריט עיצוב → כיווני עיצוב → כיוון נבחר → בריף
//
// Derived from EXISTING state only (the shell computes done/attention flags
// from the real tray + brief via existing helpers) — no new store, no
// persistence, no step state of its own. Step names reuse the canonical
// terminology: CONCEPT_HE.directionTitle ('תפריט עיצוב') and
// STUDIO_5D_HE.variantsTitle ('כיווני עיצוב').
//
// NOTE: the inert Clean 6C rollback stub
// components/studio/design/shell/StudioProcessStrip.js is left UNTOUCHED —
// this is a separate workstation-scoped component.

import * as React from 'react';
import { ws } from './wsStyle';
import { WS_HE } from './wsLabels';
import { STUDIO_5D_HE, CONCEPT_HE } from '../../../../lib/studio/labels';
import { CheckIcon, AlertIcon } from '../shell/StudioIcons';

// steps: [{ key, label, done, attention, onClick }]
export default function WorkstationProcessStrip({ steps }) {
  const list = Array.isArray(steps) ? steps : [];
  return (
    <div style={styles.strip} dir="rtl" role="list">
      {list.map((step, i) => (
        <React.Fragment key={step.key}>
          {i > 0 ? (
            <span style={styles.arrow} aria-hidden="true">
              ←
            </span>
          ) : null}
          <button
            type="button"
            role="listitem"
            onClick={step.onClick}
            style={{
              ...styles.step,
              ...(step.done ? styles.stepDone : null),
              ...(step.attention ? styles.stepAttention : null),
            }}
            title={step.label}
          >
            <span
              style={{
                ...styles.dot,
                ...(step.done ? styles.dotDone : null),
                ...(step.attention ? styles.dotAttention : null),
              }}
              aria-hidden="true"
            >
              {step.done ? <CheckIcon size={9} /> : step.attention ? <AlertIcon size={9} /> : null}
            </span>
            <span style={styles.stepLabel}>{step.label}</span>
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}

// Canonical step labels in flow order — reused by the shell.
export const PROCESS_LABELS = Object.freeze([
  { key: 'stones', label: WS_HE.process.stones },
  { key: 'menu', label: CONCEPT_HE.directionTitle },
  { key: 'directions', label: STUDIO_5D_HE.variantsTitle },
  { key: 'selected', label: WS_HE.process.selectedDirection },
  { key: 'brief', label: WS_HE.process.brief },
]);

const styles = {
  strip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '999px',
    background: ws.color.surface,
    border: `1px solid ${ws.color.border}`,
    overflowX: 'auto',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },
  arrow: {
    color: ws.color.textFaint,
    fontSize: '11px',
    flexShrink: 0,
  },
  step: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '999px',
    border: '1px solid transparent',
    background: 'transparent',
    cursor: 'pointer',
    flexShrink: 0,
  },
  stepDone: {
    border: `1px solid ${ws.color.goldSoft}`,
    background: ws.color.goldFaint,
  },
  stepAttention: {
    border: `1px solid ${ws.color.danger}`,
  },
  dot: {
    width: '15px',
    height: '15px',
    borderRadius: '50%',
    border: `1.5px solid ${ws.color.textFaint}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#14161A',
    flexShrink: 0,
  },
  dotDone: {
    border: `1.5px solid ${ws.color.gold}`,
    background: ws.color.gold,
  },
  dotAttention: {
    border: `1.5px solid ${ws.color.danger}`,
    color: ws.color.danger,
  },
  stepLabel: {
    fontFamily: ws.font.body,
    fontSize: '11px',
    fontWeight: 700,
    color: ws.color.text,
    whiteSpace: 'nowrap',
  },
};
