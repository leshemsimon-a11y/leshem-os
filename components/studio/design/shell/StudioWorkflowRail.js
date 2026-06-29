// components/studio/design/shell/StudioWorkflowRail.js
//
// Clean 5D — left icon workflow rail. A slim studio workflow (not a menu):
// Stones → Product → Design → Brief → Production. Icon + very short label.
// "Production" is an honest future/disabled affordance.
//
// Presentation + navigation only. Selecting a step calls onSelect(step); the
// shell maps that to the existing canvas view. No business logic here.

import * as React from 'react';
import { tokens } from '../../shared/tokens';
import { STUDIO_5D_HE } from '../../../../lib/studio/labels';
import {
  StoneIcon,
  ProductIcon,
  DesignIcon,
  BriefIcon,
  ProductionIcon,
} from './StudioIcons';

const STEPS = [
  { key: 'stones', Icon: StoneIcon },
  { key: 'product', Icon: ProductIcon },
  { key: 'design', Icon: DesignIcon },
  { key: 'brief', Icon: BriefIcon },
  { key: 'production', Icon: ProductionIcon, future: true },
];

export default function StudioWorkflowRail({ active, onSelect, horizontal = false }) {
  const L = STUDIO_5D_HE.rail;
  return (
    <nav
      style={{ ...styles.rail, ...(horizontal ? styles.railHorizontal : null) }}
      dir="rtl"
      aria-label="workflow"
    >
      {STEPS.map(({ key, Icon, future }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            disabled={future}
            onClick={() => !future && onSelect && onSelect(key)}
            title={future ? STUDIO_5D_HE.railProductionSoon : L[key]}
            style={{
              ...styles.step,
              ...(isActive ? styles.stepActive : null),
              ...(future ? styles.stepFuture : null),
            }}
            aria-current={isActive ? 'step' : undefined}
          >
            <span style={styles.iconWrap}>
              <Icon size={20} />
            </span>
            <span style={styles.label}>{L[key]}</span>
            {isActive ? <span style={styles.activeBar} aria-hidden="true" /> : null}
          </button>
        );
      })}
    </nav>
  );
}

const styles = {
  rail: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '14px 9px',
    height: '100%',
    minHeight: 0,
    background: `linear-gradient(180deg, ${tokens.color.graphiteSoft} 0%, ${tokens.color.graphite} 100%)`,
    borderRadius: tokens.radius.lg,
    boxShadow: tokens.shadow.railGlow,
    minWidth: '76px',
  },
  railHorizontal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '4px',
    minWidth: 0,
    padding: '9px',
  },
  step: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '12px 6px',
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
    color: tokens.color.platinum,
    opacity: 0.62,
    flex: '1 1 auto',
    transition: 'opacity 140ms, background 140ms',
  },
  stepActive: {
    background: 'rgba(184,151,90,0.12)',
    border: '1px solid rgba(205,185,136,0.30)',
    color: tokens.color.goldSoft,
    opacity: 1,
  },
  stepFuture: { opacity: 0.28, cursor: 'not-allowed' },
  iconWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
  },
  label: {
    fontFamily: tokens.font.body,
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.05em',
  },
  activeBar: {
    position: 'absolute',
    insetInlineStart: '3px',
    top: '24%',
    bottom: '24%',
    width: '3px',
    borderRadius: '3px',
    background: `linear-gradient(180deg, ${tokens.color.gold}, ${tokens.color.goldSoft})`,
    boxShadow: '0 0 8px rgba(184,151,90,0.5)',
  },
};
