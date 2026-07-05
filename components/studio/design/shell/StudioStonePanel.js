// components/studio/design/shell/StudioStonePanel.js
//
// LESHEM.S OS — Design Studio Layout Reset — Zone 2: Left Selected Stone
// Panel.
//
// A fixed, compact panel showing the ACTIVE stone selected from the top Work
// Tray Ribbon: a large square contain image (full gemstone visible, never
// cropped), a short title, 4-6 compact gem data rows, source/status badges,
// one primary action (Add / Remove Work Tray), and small icon actions
// (Start Design / Create Report / More).
//
// Read-only presentation + thin wiring only:
//   • It reads the already-selected tray item (real or demo) and the shared
//     buildStoneCore() view-model — see ./stoneView.js.
//   • Add/Remove Work Tray calls the onToggleTray callback the shell wires to
//     the EXISTING useWorkTray hook methods (tray.addItem / tray.remove).
//     This file does not import lib/studio/workTray.js directly and performs
//     no mutation of its own.
//   • "Create Report" and "More actions" are honest disabled placeholders —
//     Certificates are out of scope for this pass.
//
// New file — Studio Layout Reset (Clean 5D-R4). No existing exports,
// business logic, or feature functions removed.

import * as React from 'react';
import { STUDIO_5D_HE, USABILITY_D_HE } from '../../../../lib/studio/labels';
// Patch D — role badge on the ACTIVE stone, via EXISTING designDraft
// exports only (no store internals touched).
import { roleHe, normalizeRole, DESIGN_ROLE } from '../../../../lib/studio/designDraft';
import { buildStoneCore } from './stoneView';
import { StoneIcon, DesignIcon, BriefIcon, PlusIcon, RemoveIcon } from './StudioIcons';
import { reset } from './studioResetStyle';

export default function StudioStonePanel({
  item,
  demoStone,
  demoMode,
  hasStones,
  inTray,
  onToggleTray,
  onStartDesign,
}) {
  const L = STUDIO_5D_HE;
  const view = buildStoneCore(item, demoStone);
  // Patch D — the assigned design role of the active stone (hidden while
  // unassigned). Read-only from the tray item; never mutated here.
  const role = item ? normalizeRole(item.role) : DESIGN_ROLE.UNASSIGNED;
  const roleLabel = role !== DESIGN_ROLE.UNASSIGNED ? roleHe(role) : null;

  if (!hasStones || !view) {
    return (
      <aside style={styles.panel} dir="rtl">
        <div style={styles.emptyWrap}>
          <span style={styles.emptyIcon} aria-hidden="true">
            <StoneIcon size={22} />
          </span>
          <span style={styles.emptyText}>{L.stonePanelEmpty}</span>
        </div>
      </aside>
    );
  }

  return (
    <aside style={styles.panel} dir="rtl">
      <div style={styles.scroll}>
        <div style={styles.imageWrap}>
          {view.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={view.image} alt="" style={styles.image} />
          ) : (
            <span style={styles.imagePlaceholder} aria-hidden="true">
              <StoneIcon size={30} />
            </span>
          )}
          {demoMode ? (
            <span style={styles.demoTag} title={L.demoThumbBadge}>
              {L.demoThumbBadge}
            </span>
          ) : null}
        </div>

        <div style={styles.titleRow}>
          <span style={styles.title}>{view.title}</span>
          {roleLabel ? (
            <span style={styles.roleBadge} title={USABILITY_D_HE.activeStoneLabel}>
              {roleLabel}
            </span>
          ) : null}
        </div>

        {view.badges.length > 0 && (
          <div style={styles.badges}>
            {view.badges.map((b, i) => (
              <span key={i} style={styles.badge}>
                {b}
              </span>
            ))}
          </div>
        )}

        <div style={styles.rows}>
          {view.rows.map((r) => (
            <div key={r.key} style={styles.row}>
              <span style={styles.rowLabel}>{r.label}</span>
              <span style={styles.rowValue} title={r.value}>
                {r.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.actions}>
        {typeof onToggleTray === 'function' ? (
          <button type="button" onClick={onToggleTray} style={styles.primaryBtn}>
            <span style={styles.btnIcon} aria-hidden="true">
              {inTray ? <RemoveIcon size={15} /> : <PlusIcon size={15} />}
            </span>
            {inTray ? L.removeFromTray : L.addToTray}
          </button>
        ) : (
          <span style={styles.primaryBtnMuted} title={L.futureSoon}>
            {L.addToTray}
          </span>
        )}

        <div style={styles.iconRow}>
          <button
            type="button"
            onClick={onStartDesign}
            disabled={typeof onStartDesign !== 'function'}
            title={L.startDesign}
            aria-label={L.startDesign}
            style={styles.iconBtn}
          >
            <DesignIcon size={16} />
          </button>
          <button
            type="button"
            disabled
            title={L.createReportSoon}
            aria-label={L.createReportSoon}
            style={{ ...styles.iconBtn, ...styles.iconBtnDisabled }}
          >
            <BriefIcon size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

const styles = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    background: reset.color.panel,
    border: `1px solid ${reset.color.border}`,
    borderRadius: reset.radius.lg,
    minWidth: 0,
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
  },
  emptyWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '24px 16px',
  },
  emptyIcon: { color: reset.color.textFaint, display: 'inline-flex' },
  emptyText: {
    fontFamily: reset.font.body,
    fontSize: '12.5px',
    fontWeight: 600,
    color: reset.color.textMuted,
    textAlign: 'center',
  },
  scroll: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '14px',
    overflowY: 'auto',
    flex: 1,
    minHeight: 0,
  },
  imageWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: '1 / 1',
    borderRadius: reset.radius.md,
    background: reset.color.page,
    border: `1px solid ${reset.color.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  image: { width: '100%', height: '100%', objectFit: 'contain', display: 'block' },
  imagePlaceholder: { display: 'inline-flex', color: reset.color.textFaint },
  demoTag: {
    position: 'absolute',
    top: '6px',
    insetInlineEnd: '6px',
    fontFamily: reset.font.body,
    fontSize: '9px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    color: reset.color.textMuted,
    background: reset.color.panel,
    border: `1px solid ${reset.color.border}`,
    borderRadius: reset.radius.xs,
    padding: '2px 6px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    flexWrap: 'wrap',
  },
  title: {
    fontFamily: reset.font.display,
    fontWeight: 700,
    fontSize: '15px',
    color: reset.color.text,
    lineHeight: 1.3,
    minWidth: 0,
  },
  // Patch D — the active stone's design role, small and unambiguous.
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    height: '20px',
    padding: '0 8px',
    borderRadius: reset.radius.xs,
    background: reset.color.page,
    border: `1px solid ${reset.color.borderStrong}`,
    color: reset.color.text,
    fontFamily: reset.font.body,
    fontSize: '10px',
    fontWeight: 700,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  badges: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    height: '20px',
    padding: '0 8px',
    borderRadius: reset.radius.xs,
    background: reset.color.page,
    border: `1px solid ${reset.color.border}`,
    color: reset.color.textMuted,
    fontFamily: reset.font.body,
    fontSize: '10.5px',
    fontWeight: 600,
  },
  rows: {
    display: 'flex',
    flexDirection: 'column',
    borderTop: `1px solid ${reset.color.border}`,
  },
  row: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '10px',
    padding: '7px 0',
    borderBottom: `1px solid ${reset.color.border}`,
  },
  rowLabel: {
    fontFamily: reset.font.body,
    fontSize: '10.5px',
    fontWeight: 700,
    color: reset.color.textFaint,
    letterSpacing: '0.02em',
    flexShrink: 0,
  },
  rowValue: {
    fontFamily: reset.font.body,
    fontSize: '12.5px',
    fontWeight: 600,
    color: reset.color.text,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px 14px',
    borderTop: `1px solid ${reset.color.border}`,
    flexShrink: 0,
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    minHeight: '42px',
    padding: '10px 14px',
    fontFamily: reset.font.body,
    fontSize: '13px',
    fontWeight: 700,
    color: reset.color.primaryText,
    background: reset.color.primaryBg,
    border: 'none',
    borderRadius: reset.radius.sm,
    cursor: 'pointer',
  },
  primaryBtnMuted: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '42px',
    padding: '10px 14px',
    fontFamily: reset.font.body,
    fontSize: '13px',
    fontWeight: 700,
    color: reset.color.textFaint,
    background: reset.color.page,
    border: `1px dashed ${reset.color.border}`,
    borderRadius: reset.radius.sm,
  },
  btnIcon: { display: 'inline-flex' },
  iconRow: { display: 'flex', gap: '8px' },
  iconBtn: {
    flex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '36px',
    background: reset.color.panel,
    border: `1px solid ${reset.color.border}`,
    borderRadius: reset.radius.sm,
    color: reset.color.text,
    cursor: 'pointer',
  },
  iconBtnDisabled: {
    color: reset.color.textFaint,
    cursor: 'not-allowed',
    background: reset.color.page,
  },
};
