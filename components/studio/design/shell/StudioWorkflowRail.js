// components/studio/design/shell/StudioWorkflowRail.js
//
// LESHEM.S OS — Design Studio Layout Reset — compact step indicator.
//
// Studio Layout Reset (Clean 5D-R4): this was previously a vertical icon
// rail occupying its own grid column. It is now a compact, icon-only,
// horizontal row embedded in the Center Work Canvas header (Zone 3),
// alongside a separate "current step title" — see StudioShell.js. Same
// steps, same order, same active-step semantics as before: Stones → Product
// → Design → Brief → Production (disabled/future). The "exit studio"
// control moved to StudioCommandBar (top bar) since it no longer fits
// naturally in a compact horizontal step row.
//
// Presentation + navigation only — no business logic. No existing step key,
// label, or navigation behavior removed; STUDIO_5D_HE.rail / .aria keys are
// unchanged and still used here.

import * as React from 'react';
import { STUDIO_5D_HE } from '../../../../lib/studio/labels';
import { StoneIcon, ProductIcon, DesignIcon, BriefIcon, ProductionIcon } from './StudioIcons';
import { reset } from './studioResetStyle';

const STEPS = [
  { key: 'stones', Icon: StoneIcon },
  { key: 'product', Icon: ProductIcon },
  { key: 'design', Icon: DesignIcon },
  { key: 'brief', Icon: BriefIcon },
  { key: 'production', Icon: ProductionIcon, future: true },
];

export default function StudioWorkflowRail({ active, onSelect }) {
  const L = STUDIO_5D_HE.rail;
  return (
    <nav style={styles.rail} dir="rtl" aria-label={STUDIO_5D_HE.aria.workflowNav}>
      {STEPS.map(({ key, Icon, future }) => {
        const isActive = active === key;
        const label = future ? STUDIO_5D_HE.railProductionSoon : L[key];
        return (
          <button
            key={key}
            type="button"
            disabled={future}
            onClick={() => !future && onSelect && onSelect(key)}
            title={label}
            aria-label={label}
            aria-current={isActive ? 'step' : undefined}
            style={{
              ...styles.step,
              ...(isActive ? styles.stepActive : null),
              ...(future ? styles.stepFuture : null),
            }}
          >
            <Icon size={14} />
            <span style={styles.stepLabel}>{L[key]}</span>
          </button>
        );
      })}
    </nav>
  );
}

const styles = {
  rail: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flexWrap: 'wrap',
  },
  step: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    minHeight: '30px',
    padding: '5px 9px',
    background: 'transparent',
    border: `1px solid transparent`,
    borderRadius: reset.radius.sm,
    color: reset.color.textMuted,
    cursor: 'pointer',
    fontFamily: reset.font.body,
    fontSize: '11.5px',
    fontWeight: 700,
  },
  stepActive: {
    background: reset.color.page,
    border: `1px solid ${reset.color.borderStrong}`,
    color: reset.color.text,
  },
  stepFuture: { color: reset.color.textFaint, opacity: 0.6, cursor: 'not-allowed' },
  stepLabel: { whiteSpace: 'nowrap' },
};
