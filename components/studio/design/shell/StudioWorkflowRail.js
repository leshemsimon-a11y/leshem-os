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
    gap: '6px',
    padding: '12px 8px',
    background: tokens.color.graphite,
    borderRadius: tokens.radius.md,
    minWidth: '72px',
  },
  railHorizontal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    minWidth: 0,
    padding: '8px',
  },
  step: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '10px 6px',
    background: 'transparent',
    border: 'none',
    borderRadius: tokens.radius.sm,
    cursor: 'pointer',
    color: tokens.color.platinum,
    opacity: 0.7,
    flex: '1 1 auto',
  },
  stepActive: {
    background: tokens.color.graphiteSoft,
    color: tokens.color.goldSoft,
    opacity: 1,
  },
  stepFuture: { opacity: 0.32, cursor: 'not-allowed' },
  iconWrap: { display: 'inline-flex' },
  label: {
    fontFamily: tokens.font.body,
    fontSize: '10.5px',
    fontWeight: 600,
    letterSpacing: '0.02em',
  },
  activeBar: {
    position: 'absolute',
    insetInlineStart: '2px',
    top: '20%',
    bottom: '20%',
    width: '2.5px',
    borderRadius: '2px',
    background: tokens.color.gold,
  },
};
