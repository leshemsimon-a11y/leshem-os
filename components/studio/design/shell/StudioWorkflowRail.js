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
//
// UX Compression Pass: the rail is now icon-first — the short Hebrew word
// under each icon is no longer always rendered. Every step keeps its label
// as a hover tooltip (title, already present) and now also as an
// aria-label (previously only the exit control had one), so nothing is
// lost for either sighted or screen-reader users — it's just not printed
// on screen five times at once. The active step is still unambiguous via
// the existing gold chip + gold accent bar.

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
        const label = future ? STUDIO_5D_HE.railProductionSoon : L[key];
        return (
          <button
            key={key}
            type="button"
            disabled={future}
            onClick={() => !future && onSelect && onSelect(key)}
            title={label}
            aria-label={label}
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
    minWidth: '60px',
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
    justifyContent: 'center',
    minHeight: '46px',
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
    paddingTop: '14px',
    minHeight: '44px',
  },
  iconWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
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
