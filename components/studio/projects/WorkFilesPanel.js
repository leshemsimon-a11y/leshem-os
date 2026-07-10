// components/studio/projects/WorkFilesPanel.js
//
// LESHEM.S OS — Clean 7A: Work File Backbone MVP — Work Files panel.
//
// The richer successor of the Clean 6F ContinueWorkFilesStrip (that file is
// left untouched on disk; this panel replaces its usage in
// pages/studio/projects.js). Each Work File card shows its real context:
// name, created/updated dates, stone/item count, product type, style,
// selected direction title, output status, "תיק פעיל" badge — plus the two
// product-loop actions: "המשך עבודה" and "פתח חבילת פלט".
//
// PRESENTATIONAL only: projects/activeId/callbacks arrive as props; display
// values are derived here from fields Work Files already hold (no schema
// change, no store imports, no persistence).

import * as React from 'react';
import { tokens } from '../shared/tokens';
import { PROJECTS_HE, CONCEPT_HE, BRIEF_HE } from '../../../lib/studio/labels';
import { getSelectedConcept, getActiveOutput } from '../../../lib/studio/designDraft';

export const WORK_FILES_HE = Object.freeze({
  title: 'תיקי עבודה',
  hint: 'בחירת תיק ממשיכה את העבודה בסטודיו — התיק הנבחר נטען לשולחן.',
  continueAction: 'המשך עבודה',
  openPackAction: 'פתח חבילת פלט',
  activeBadge: 'תיק פעיל',
  empty: 'אין עדיין תיקי עבודה שמורים — אפשר לשמור מהסטודיו.',
  createdPrefix: 'נוצר',
  updatedPrefix: 'עודכן',
  directionPrefix: 'כיוון',
  noDirection: 'ללא כיוון נבחר',
  outputReady: 'בריף פלט קיים',
  outputMissing: 'ללא בריף פלט',
});

const dateHe = (ts) =>
  typeof ts === 'number' && ts > 0 ? new Date(ts).toLocaleDateString('he-IL') : null;

function metaLine(project) {
  const count = Array.isArray(project.trayItems) ? project.trayItems.length : 0;
  const brief = project.brief || {};
  const bits = [
    PROJECTS_HE.itemsCount(count),
    brief.productType ? CONCEPT_HE.productType[brief.productType] : null,
    brief.styleDirection ? BRIEF_HE.style[brief.styleDirection] : null,
  ].filter(Boolean);
  return bits.join(' · ');
}

function statusLine(project) {
  const brief = project.brief || {};
  const selected = getSelectedConcept(brief);
  const output = getActiveOutput(brief);
  const created = dateHe(project.createdAt);
  const updated = dateHe(project.updatedAt);
  const bits = [
    selected
      ? `${WORK_FILES_HE.directionPrefix}: ${selected.conceptName}`
      : WORK_FILES_HE.noDirection,
    output ? WORK_FILES_HE.outputReady : WORK_FILES_HE.outputMissing,
    created ? `${WORK_FILES_HE.createdPrefix} ${created}` : null,
    updated && updated !== created ? `${WORK_FILES_HE.updatedPrefix} ${updated}` : null,
  ].filter(Boolean);
  return bits.join(' · ');
}

export default function WorkFilesPanel({ projects, activeId, onContinue, onOpenPack }) {
  const list = Array.isArray(projects) ? projects : [];
  return (
    <section style={styles.wrap} dir="rtl" aria-label={WORK_FILES_HE.title}>
      <div style={styles.headRow}>
        <span style={styles.title}>{WORK_FILES_HE.title}</span>
        <span style={styles.hint}>{WORK_FILES_HE.hint}</span>
      </div>

      {list.length === 0 ? (
        <p style={styles.empty}>{WORK_FILES_HE.empty}</p>
      ) : (
        <div style={styles.rows}>
          {list.map((p) => {
            const isActive = p.id === activeId;
            return (
              <div key={p.id} style={{ ...styles.row, ...(isActive ? styles.rowActive : null) }}>
                <div style={styles.rowText}>
                  <span style={styles.rowName}>
                    {p.name}
                    {isActive ? <span style={styles.activeBadge}>{WORK_FILES_HE.activeBadge}</span> : null}
                  </span>
                  <span style={styles.rowMeta}>{metaLine(p)}</span>
                  <span style={styles.rowStatus}>{statusLine(p)}</span>
                </div>
                <div style={styles.actions}>
                  <button type="button" onClick={() => onContinue && onContinue(p)} style={styles.continueBtn}>
                    {WORK_FILES_HE.continueAction}
                  </button>
                  <button type="button" onClick={() => onOpenPack && onOpenPack(p)} style={styles.packBtn}>
                    {WORK_FILES_HE.openPackAction}
                  </button>
                </div>
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
    gap: '12px',
    flexWrap: 'wrap',
    padding: '10px 13px',
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
    gap: '3px',
    minWidth: 0,
    flex: '1 1 260px',
  },
  rowName: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: tokens.font.body,
    fontSize: '13.5px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    minWidth: 0,
  },
  activeBadge: {
    padding: '2px 9px',
    borderRadius: '999px',
    border: `1px solid ${tokens.color.gold}`,
    color: tokens.color.gold,
    fontFamily: tokens.font.body,
    fontSize: '10.5px',
    fontWeight: 700,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  rowMeta: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 600,
    color: tokens.color.inkSoft,
  },
  rowStatus: {
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    color: tokens.color.inkFaint,
  },
  actions: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
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
  },
  packBtn: {
    minHeight: '32px',
    padding: '6px 15px',
    borderRadius: '999px',
    border: `1px solid ${tokens.color.charcoal}`,
    background: 'transparent',
    color: tokens.color.charcoal,
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
};
