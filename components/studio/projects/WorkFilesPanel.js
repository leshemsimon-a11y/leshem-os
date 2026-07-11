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
// Clean 8C — pure formatting helpers for the project's attached assets
// (reads the existing `assets` array; no store, no persistence).
import { attachedSummaryHe, attachedRoleLabelsHe } from '../../../lib/studio/attachedAssets';
// Clean 8E — compact media-workflow lines (pure reads of the project's
// existing reserved `renders` array; no store, no persistence).
import { mediaStatusLineHe, mediaResultsCountHe } from '../../../lib/studio/mediaWorkflow';

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
  // Clean 8B — rename Work File.
  renameAction: 'שנה שם',
  renameSave: 'שמור שם',
  renameCancel: 'ביטול',
  // Clean 8E — Media Workflow.
  mediaAction: 'מדיה והדמיות',
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

export default function WorkFilesPanel({ projects, activeId, onContinue, onOpenPack, onRename, onOpenMedia }) {
  const list = Array.isArray(projects) ? projects : [];
  // Clean 8B — inline rename (UI state only; persistence happens in the
  // caller through the existing public updateProject API).
  const [renamingId, setRenamingId] = React.useState(null);
  const [renameValue, setRenameValue] = React.useState('');

  const startRename = (p) => {
    setRenamingId(p.id);
    setRenameValue(p.name || '');
  };
  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue('');
  };
  const commitRename = (p) => {
    const next = renameValue.trim();
    if (next && onRename) onRename(p, next);
    cancelRename();
  };

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
            const isRenaming = renamingId === p.id;
            return (
              <div key={p.id} style={{ ...styles.row, ...(isActive ? styles.rowActive : null) }}>
                <div style={styles.rowText}>
                  {isRenaming ? (
                    <span style={styles.renameRow}>
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        style={styles.renameInput}
                        dir="rtl"
                        aria-label={WORK_FILES_HE.renameAction}
                      />
                      <button type="button" onClick={() => commitRename(p)} style={styles.renameSaveBtn}>
                        {WORK_FILES_HE.renameSave}
                      </button>
                      <button type="button" onClick={cancelRename} style={styles.renameCancelBtn}>
                        {WORK_FILES_HE.renameCancel}
                      </button>
                    </span>
                  ) : (
                    <span style={styles.rowName}>
                      {p.name}
                      {isActive ? <span style={styles.activeBadge}>{WORK_FILES_HE.activeBadge}</span> : null}
                      {typeof onRename === 'function' ? (
                        <button type="button" onClick={() => startRename(p)} style={styles.renameBtn}>
                          {WORK_FILES_HE.renameAction}
                        </button>
                      ) : null}
                    </span>
                  )}
                  <span style={styles.rowMeta}>{metaLine(p)}</span>
                  <span style={styles.rowStatus}>{statusLine(p)}</span>
                  {/* Clean 8C — compact attached-assets line: count + role
                      chips (only when the Work File has attached assets). */}
                  {attachedSummaryHe(p) ? (
                    <span style={styles.attachedRow}>
                      <span style={styles.attachedCount}>{attachedSummaryHe(p)}</span>
                      {attachedRoleLabelsHe(p).map((label) => (
                        <span key={label} style={styles.attachedChip}>
                          {label}
                        </span>
                      ))}
                    </span>
                  ) : null}
                  {/* Clean 8E — compact media line: «מדיה: סטטוס» + results
                      count (only once the media workflow was touched). */}
                  {mediaStatusLineHe(p) ? (
                    <span style={styles.attachedRow}>
                      <span style={styles.attachedCount}>{mediaStatusLineHe(p)}</span>
                      {mediaResultsCountHe(p) ? (
                        <span style={styles.attachedChip}>{mediaResultsCountHe(p)}</span>
                      ) : null}
                    </span>
                  ) : null}
                </div>
                <div style={styles.actions}>
                  <button type="button" onClick={() => onContinue && onContinue(p)} style={styles.continueBtn}>
                    {WORK_FILES_HE.continueAction}
                  </button>
                  <button type="button" onClick={() => onOpenPack && onOpenPack(p)} style={styles.packBtn}>
                    {WORK_FILES_HE.openPackAction}
                  </button>
                  {typeof onOpenMedia === 'function' ? (
                    <button type="button" onClick={() => onOpenMedia(p)} style={styles.packBtn}>
                      {WORK_FILES_HE.mediaAction}
                    </button>
                  ) : null}
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
  // Clean 8B — inline rename controls.
  renameBtn: {
    padding: '2px 10px',
    borderRadius: '999px',
    border: `1px solid ${tokens.color.goldFaint}`,
    background: 'transparent',
    color: tokens.color.inkSoft,
    fontFamily: tokens.font.body,
    fontSize: '10.5px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  renameRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
    minWidth: 0,
  },
  renameInput: {
    minHeight: '32px',
    minWidth: '200px',
    flex: '1 1 220px',
    boxSizing: 'border-box',
    padding: '6px 11px',
    borderRadius: tokens.radius.sm,
    border: `1px solid ${tokens.color.gold}`,
    background: '#FFFFFF',
    color: tokens.color.charcoal,
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 600,
    outline: 'none',
  },
  renameSaveBtn: {
    minHeight: '32px',
    padding: '5px 14px',
    borderRadius: '999px',
    border: 'none',
    background: tokens.color.charcoal,
    color: '#FFFFFF',
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  renameCancelBtn: {
    minHeight: '32px',
    padding: '5px 12px',
    borderRadius: '999px',
    border: `1px solid ${tokens.color.goldFaint}`,
    background: 'transparent',
    color: tokens.color.inkSoft,
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
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
  // Clean 8C — attached-assets line.
  attachedRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
    marginTop: '2px',
  },
  attachedCount: {
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    fontWeight: 700,
    color: tokens.color.inkSoft,
  },
  attachedChip: {
    fontFamily: tokens.font.body,
    fontSize: '10.5px',
    fontWeight: 600,
    color: tokens.color.charcoal,
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.gold}`,
    borderRadius: tokens.radius.sm,
    padding: '1px 7px',
    whiteSpace: 'nowrap',
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
