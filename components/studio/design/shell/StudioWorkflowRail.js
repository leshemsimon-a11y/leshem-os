// components/studio/design/shell/StudioWorkflowRail.js
//
// Clean 5D — left icon workflow rail. A slim studio workflow (not a menu):
// Stones → Product → Design → Brief → Production. Icon + very short label.
// "Production" is an honest future/disabled affordance.
//
// Clean 5D-R3: relit to the light ivory/platinum chrome direction (was dark
// graphite). Selected state now reads via a soft gold chip + charcoal text
// (graphite reserved for small text contrast, not the whole rail surface).
// Targets enlarged for comfort; aria-label added for the icon-only exit
// control. Presentation + navigation only — no business logic changed.

import * as React from 'react';
import { tokens } from '../../shared/tokens';
import { STUDIO_5D_HE } from '../../../../lib/studio/labels';
import {
  StoneIcon,
  ProductIcon,
  DesignIcon,
  BriefIcon,
  ProductionIcon,
  HomeIcon,
} from './StudioIcons';

const STEPS = [
  { key: 'stones', Icon: StoneIcon },
  { key: 'product', Icon: ProductIcon },
  { key: 'design', Icon: DesignIcon },
  { key: 'brief', Icon: BriefIcon },
  { key: 'production', Icon: ProductionIcon, future: true },
];

export default function StudioWorkflowRail({ active, onSelect, onExit, horizontal = false }) {
  const L = STUDIO_5D_HE.rail;
  return (
    <nav
      style={{ ...styles.rail, ...(horizontal ? styles.railHorizontal : null) }}
      dir="rtl"
      aria-label={STUDIO_5D_HE.aria.workflowNav}
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

      {typeof onExit === 'function' && (
        <button
          type="button"
          onClick={onExit}
          title={STUDIO_5D_HE.exitStudio}
          aria-label={STUDIO_5D_HE.aria.exitStudio}
          style={{ ...styles.step, ...styles.exitStep }}
        >
          <span style={styles.iconWrap}>
            <HomeIcon size={20} />
          </span>
          <span style={styles.label}>{STUDIO_5D_HE.exitShort}</span>
        </button>
      )}
    </nav>
  );
}

const styles = {
  rail: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '16px 9px',
    height: '100%',
    minHeight: 0,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.lg,
    boxShadow: tokens.shadow.soft,
    minWidth: '78px',
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
    minHeight: '52px',
    padding: '12px 6px',
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
    color: tokens.color.inkSoft,
    flex: '1 1 auto',
    transition: 'background 140ms, border-color 140ms, color 140ms',
  },
  stepActive: {
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.goldSoft}`,
    color: tokens.color.charcoal,
  },
  stepFuture: { color: tokens.color.platinumSoft, opacity: 0.7, cursor: 'not-allowed' },
  exitStep: {
    marginTop: 'auto',
    color: tokens.color.inkFaint,
    borderTop: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: 0,
    paddingTop: '16px',
    minHeight: '48px',
  },
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
    top: '22%',
    bottom: '22%',
    width: '3px',
    borderRadius: '3px',
    background: `linear-gradient(180deg, ${tokens.color.gold}, ${tokens.color.goldSoft})`,
  },
};
