// components/studio/projects/ContinueWorkFilesStrip.js
//
// LESHEM.S OS — Clean 6F: Continue Work File Flow.
//
// A small PRESENTATIONAL strip for /studio/projects: the saved Work Files as
// compact rows with a "המשך עבודה" action and a "תיק פעיל" mark on the
// current Active Work. The continue action ONLY sets the Active Work and
// routes to /studio/workstation (wired by the page) — it deliberately does
// NOT hydrate/overwrite the Work Tray or brief stores in this milestone.
//
// Presentational contract: everything arrives as props — `projects` (already
// filtered by the caller), `activeId`, `onContinue(project)`. No store
// imports, no persistence, no state of its own. The existing
// DesignProjectsLibrary below it is untouched.
//
// Reads the shared light `tokens` (read-only, like every projects-surface
// component) and the existing PROJECTS_HE.itemsCount for canonical Hebrew
// stone counts. Native Hebrew literals only.

import * as React from 'react';
import { tokens } from '../shared/tokens';
import { PROJECTS_HE } from '../../../lib/studio/labels';

// Clean 6F strip-only Hebrew chrome (native literals; app UI only).
export const CONTINUE_HE = Object.freeze({
  title: 'תיקי עבודה',
  hint: 'בחירת תיק ממשיכה את העבודה בסטודיו — בלי לשנות את המגש הנוכחי.',
  continueAction: 'המשך עבודה',
  activeBadge: 'תיק פעיל',
  empty: 'אין עדיין תיקי עבודה שמורים — אפשר לשמור משולחן העבודה.',
});

export default function ContinueWorkFilesStrip({ projects, activeId, onContinue }) {
  const list = Array.isArray(projects) ? projects : [];
  return (
    <section style={styles.wrap} dir="rtl" aria-label={CONTINUE_HE.title}>
      <div style={styles.headRow}>
        <span style={styles.title}>{CONTINUE_HE.title}</span>
        <span style={styles.hint}>{CONTINUE_HE.hint}</span>
      </div>

      {list.length === 0 ? (
        <p style={styles.empty}>{CONTINUE_HE.empty}</p>
      ) : (
        <div style={styles.rows}>
          {list.map((p) => {
            const isActive = p.id === activeId;
            const count = Array.isArray(p.trayItems) ? p.trayItems.length : 0;
            return (
              <div
                key={p.id}
                style={{ ...styles.row, ...(isActive ? styles.rowActive : null) }}
              >
                <div style={styles.rowText}>
                  <span style={styles.rowName}>{p.name}</span>
                  <span style={styles.rowMeta}>{PROJECTS_HE.itemsCount(count)}</span>
                </div>
                {isActive ? <span style={styles.activeBadge}>{CONTINUE_HE.activeBadge}</span> : null}
                <button
                  type="button"
                  onClick={() => onContinue && onContinue(p)}
                  style={styles.continueBtn}
                >
                  {CONTINUE_HE.continueAction}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

const styles = {
  wrap: {
    border: `1px solid ${tokens.color.goldFaint}`,
    borderRadius: tokens.radius.md,
    background: tokens.color.pearl,
    padding: '14px 16px',
    margin: '0 0 24px',
  },
  headRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '10px',
  },
  title: {
    fontFamily: tokens.font.display,
    fontSize: '17px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  hint: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.inkSoft,
  },
  empty: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    color: tokens.color.inkFaint,
    margin: 0,
  },
  rows: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 12px',
    borderRadius: tokens.radius.sm,
    border: `1px solid ${tokens.color.goldFaint}`,
    background: '#FFFFFF',
  },
  rowActive: {
    border: `1px solid ${tokens.color.gold}`,
    boxShadow: `0 0 0 1px ${tokens.color.gold}`,
  },
  rowText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
    flex: '1 1 auto',
  },
  rowName: {
    fontFamily: tokens.font.body,
    fontSize: '13.5px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowMeta: {
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    color: tokens.color.inkSoft,
  },
  activeBadge: {
    padding: '3px 10px',
    borderRadius: '999px',
    border: `1px solid ${tokens.color.gold}`,
    color: tokens.color.gold,
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 700,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  continueBtn: {
    minHeight: '32px',
    padding: '6px 15px',
    borderRadius: '999px',
    border: 'none',
    background: tokens.color.charcoal,
    color: '#FFFFFF',
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
};
