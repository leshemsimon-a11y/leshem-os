// components/studio/design/shell/ActiveWorkBanner.js
//
// LESHEM.S OS — Clean 6H: Active Work banner for the STABLE Studio.
//
// A compact, PURELY PRESENTATIONAL banner shown inside /studio/design when
// an Active Work (תיק פעיל) exists. It makes "continue work" feel real by
// naming the active Work File and summarizing WHAT IS SAVED IN IT — the
// project record's own stones / brief / selected-direction state.
//
// Honesty note (Clean 6H scope): this milestone does NOT hydrate stores.
// The numbers describe the SAVED file, not necessarily the live session —
// so the banner deliberately reads as the file's card, never as a claim
// about the current canvas. Full restoration is a future milestone.
//
// No store imports, no state, no persistence, no routing — the shell wires
// the two actions ("פתח תיקי עבודה", "נקה תיק פעיל") through existing
// public APIs. Hebrew labels are local native literals: lib/studio/labels.js
// is outside this milestone's approved file list (same precedent as the
// Clean 6G dashboard label override).

import * as React from 'react';
import { reset } from './studioResetStyle';

const HE = Object.freeze({
  activeBadge: 'תיק פעיל',
  stones: 'אבנים',
  brief: 'בריף',
  direction: 'כיוון נבחר',
  yes: 'יש',
  none: '—',
  openProjects: 'פתח תיקי עבודה',
  clearActive: 'נקה תיק פעיל',
  clearTitle: 'ניקוי הסימון של התיק הפעיל — התיק עצמו נשמר בספרייה',
});

// Pure reads of the SAVED project record.
function projectStats(project) {
  const p = project || {};
  const b = p.brief || {};
  const stones = Array.isArray(p.trayItems) ? p.trayItems.length : null;
  const briefSet = Boolean(
    b.productType || b.styleDirection || b.metalPreference || b.stoneUsage || b.designGoal
  );
  const directionChosen = Boolean(b.selectedConceptId);
  return { stones, briefSet, directionChosen };
}

function Stat({ label, value }) {
  return (
    <span style={styles.stat}>
      <span style={styles.statLabel}>{label}</span>
      <span style={styles.statValue}>{value}</span>
    </span>
  );
}

export default function ActiveWorkBanner({ project, onOpenProjects, onClear }) {
  if (!project) return null;
  const { stones, briefSet, directionChosen } = projectStats(project);

  return (
    <div style={styles.banner} dir="rtl" role="status" aria-label={`${HE.activeBadge}: ${project.name || ''}`}>
      <span style={styles.badge}>{HE.activeBadge}</span>
      <span style={styles.name} title={project.name || ''}>
        {project.name || ''}
      </span>
      <span style={styles.stats}>
        {stones !== null && <Stat label={HE.stones} value={String(stones)} />}
        <Stat label={HE.brief} value={briefSet ? HE.yes : HE.none} />
        <Stat label={HE.direction} value={directionChosen ? HE.yes : HE.none} />
      </span>
      <span style={styles.actions}>
        {typeof onOpenProjects === 'function' && (
          <button type="button" onClick={onOpenProjects} style={styles.actionBtn}>
            {HE.openProjects}
          </button>
        )}
        {typeof onClear === 'function' && (
          <button
            type="button"
            onClick={onClear}
            style={{ ...styles.actionBtn, ...styles.actionQuiet }}
            title={HE.clearTitle}
          >
            {HE.clearActive}
          </button>
        )}
      </span>
    </div>
  );
}

const styles = {
  banner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    padding: '7px 12px',
    background: reset.color.panel,
    border: `1px solid ${reset.color.borderStrong}`,
    borderRadius: reset.radius.md,
    minWidth: 0,
    flexShrink: 0,
  },
  badge: {
    fontFamily: reset.font.body,
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: reset.color.text,
    border: `1px solid ${reset.color.borderStrong}`,
    borderRadius: '999px',
    padding: '2px 9px',
    background: reset.color.page,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  name: {
    fontFamily: reset.font.body,
    fontSize: '12px',
    fontWeight: 700,
    color: reset.color.text,
    minWidth: 0,
    maxWidth: '280px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  stats: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: 0,
    flexWrap: 'wrap',
  },
  stat: {
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: '4px',
    whiteSpace: 'nowrap',
  },
  statLabel: {
    fontFamily: reset.font.body,
    fontSize: '10.5px',
    color: reset.color.textFaint,
    fontWeight: 700,
  },
  statValue: {
    fontFamily: reset.font.body,
    fontSize: '11px',
    color: reset.color.textMuted,
    fontWeight: 700,
  },
  actions: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginInlineStart: 'auto',
    flexShrink: 0,
  },
  actionBtn: {
    fontFamily: reset.font.body,
    fontSize: '11px',
    fontWeight: 700,
    color: reset.color.text,
    background: reset.color.page,
    border: `1px solid ${reset.color.border}`,
    borderRadius: reset.radius.sm,
    padding: '5px 11px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  actionQuiet: {
    color: reset.color.textMuted,
    border: `1px solid ${reset.color.border}`,
    background: 'transparent',
  },
};
