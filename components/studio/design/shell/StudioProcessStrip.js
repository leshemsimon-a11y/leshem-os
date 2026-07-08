// components/studio/design/shell/StudioProcessStrip.js
//
// LESHEM.S OS — Clean 6C: the North Star process strip.
//
// A PURELY PRESENTATIONAL, DERIVED status line for the design flow:
//   אבנים → תפריט עיצוב → כיווני עיצוב → כיוון נבחר → בריף
// Every node's state (done / active / pending) is computed by the shell
// from state that ALREADY exists (tray, brief, concepts, selection, output)
// and passed in as booleans. This component holds NO state, NO store
// imports, NO persistence, and — deliberately — NO navigation: it shows
// where the work stands; the workflow rail remains the navigator.

import * as React from 'react';
import { STUDIO_6C_HE } from '../../../../lib/studio/labels';
import { StoneIcon, DesignIcon, BriefIcon, CheckIcon, DirectionsIcon, ChosenIcon } from './StudioIcons';
import { reset } from './studioResetStyle';

const P = STUDIO_6C_HE.process;

function Node({ Icon: Ic, label, state }) {
  const done = state === 'done';
  const active = state === 'active';
  return (
    <span
      style={{
        ...styles.node,
        ...(active ? styles.nodeActive : null),
        ...(done ? styles.nodeDone : null),
      }}
      title={`${label} — ${done ? P.done : active ? P.active : P.pending}`}
    >
      <span style={styles.nodeIcon} aria-hidden="true">
        {done ? <CheckIcon size={12} /> : <Ic size={13} />}
      </span>
      <span style={styles.nodeLabel}>{label}</span>
    </span>
  );
}

function Link({ reached }) {
  return <span style={{ ...styles.link, ...(reached ? styles.linkReached : null) }} aria-hidden="true" />;
}

// steps: { stones, menu, directions, chosen, brief } — each true when done.
export default function StudioProcessStrip({ steps }) {
  const s = steps || {};
  const order = [
    { key: 'stones', Icon: StoneIcon, label: P.stones, done: Boolean(s.stones) },
    { key: 'menu', Icon: DesignIcon, label: P.menu, done: Boolean(s.menu) },
    { key: 'directions', Icon: DirectionsIcon, label: P.directions, done: Boolean(s.directions) },
    { key: 'chosen', Icon: ChosenIcon, label: P.chosen, done: Boolean(s.chosen) },
    { key: 'brief', Icon: BriefIcon, label: P.brief, done: Boolean(s.brief) },
  ];
  // Active = first not-done node (if all done, none is active).
  const activeIdx = order.findIndex((n) => !n.done);
  return (
    <div style={styles.strip} dir="rtl" role="status" aria-label={P.aria}>
      {order.map((n, i) => (
        <React.Fragment key={n.key}>
          {i > 0 && <Link reached={n.done || i === activeIdx} />}
          <Node Icon={n.Icon} label={n.label} state={n.done ? 'done' : i === activeIdx ? 'active' : 'pending'} />
        </React.Fragment>
      ))}
    </div>
  );
}

const styles = {
  strip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    background: reset.color.panel,
    border: `1px solid ${reset.color.border}`,
    borderRadius: reset.radius.md,
    overflowX: 'auto',
    flexShrink: 0,
  },
  node: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '3px 9px',
    borderRadius: '999px',
    border: '1px solid transparent',
    color: reset.color.textFaint,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  nodeActive: {
    border: `1px solid ${reset.color.borderStrong}`,
    background: reset.color.page,
    color: reset.color.text,
  },
  nodeDone: {
    color: reset.color.textMuted,
  },
  nodeIcon: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  nodeLabel: {
    fontFamily: reset.font.body,
    fontSize: '10.5px',
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
  link: {
    display: 'inline-block',
    width: '18px',
    height: '1px',
    background: reset.color.border,
    flexShrink: 0,
  },
  linkReached: {
    background: reset.color.borderStrong,
  },
};
