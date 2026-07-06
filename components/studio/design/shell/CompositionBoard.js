// components/studio/design/shell/CompositionBoard.js
//
// LESHEM.S OS — Clean 6A: Composition Board (לוח קומפוזיציה).
//
// A PRESENTATIONAL, role-grouped view of the CURRENT Work Tray items — the
// multi-stone composition of the active design session. Derived entirely
// from the tray items the shell already holds:
//   • Grouping comes from the EXISTING buildDesignGroups export
//     (lib/studio/designDraft.js) — center stones stay individually
//     addressable, never collapsed into a quantity.
//   • Role editing uses the EXISTING shared RoleChips component and reports
//     the chosen canonical role back via onSetRole — the shell wires it to
//     the EXISTING tray.setRole. Single source of truth: the Work Tray store.
//   • NO new store, NO persistence key, NO business logic. The only local
//     state is which item's role editor is expanded (pure UI).
//
// Density rule (approved): each item shows its current role as a badge plus
// a small "ערוך תפקיד" action; tapping it expands the full RoleChips inline
// for THAT item only. This keeps the board compact on desktop and mobile —
// eight 44px chips per item at all times would be unusably dense.
//
// Layout mirrors the Clean 5E intent drawer: side drawer on desktop, full-
// width bottom sheet on narrow viewports.

import * as React from 'react';
import { STUDIO_6A_HE } from '../../../../lib/studio/labels';
import {
  buildDesignGroups,
  normalizeRole,
  roleHe,
  trayItemTitle,
  DESIGN_ROLE,
} from '../../../../lib/studio/designDraft';
import { getShapeLabel } from '../../../../lib/studio/gemLabels';
import RoleChips from '../../shared/RoleChips';
import { StoneFacets, PlusIcon } from './StudioIcons';
import { reset } from './studioResetStyle';

const B = STUDIO_6A_HE.board;

function CloseIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

// One tray item row: thumbnail + human fields + role badge + role editor.
// SKU/name/labels come from the item snapshot — the internal id is never
// rendered, per the hard rule.
function BoardItem({ item, expanded, onToggleEdit, onSetRole }) {
  const s = item.snapshot || {};
  const role = normalizeRole(item.role);
  const isUnassigned = role === DESIGN_ROLE.UNASSIGNED;
  const title = trayItemTitle(item);
  const metaParts = [
    s.shapeHe || getShapeLabel(s.axes && s.axes.shape) || null,
    typeof s.caratWeight === 'number' ? `${s.caratWeight} ct` : null,
    s.color || null,
  ].filter(Boolean);

  return (
    <div style={styles.item} dir="rtl">
      <div style={styles.itemRow}>
        <span style={styles.thumb} aria-hidden="true">
          {s.primaryImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.primaryImage} alt="" style={styles.thumbImg} />
          ) : (
            <StoneFacets size={22} />
          )}
        </span>
        <span style={styles.itemText}>
          <span style={styles.itemTitle} title={title}>
            {title}
          </span>
          {metaParts.length > 0 && (
            <span style={styles.itemMeta} title={metaParts.join(' · ')}>
              {metaParts.join(' · ')}
            </span>
          )}
        </span>
        <span
          style={{
            ...styles.roleBadge,
            ...(isUnassigned ? styles.roleBadgeUnassigned : null),
          }}
        >
          {roleHe(role)}
        </span>
        <button
          type="button"
          onClick={onToggleEdit}
          style={styles.editBtn}
          title={expanded ? B.closeEditRole : B.editRole}
        >
          {expanded ? B.closeEditRole : B.editRole}
        </button>
      </div>
      {expanded && (
        <div style={styles.chipsWrap}>
          <RoleChips
            value={role}
            onChange={(next) => onSetRole && onSetRole(item.id, next)}
            ariaLabel={`${B.editRole}: ${title}`}
          />
        </div>
      )}
    </div>
  );
}

export default function CompositionBoard({
  open,
  onClose,
  narrow,
  trayItems,
  onSetRole,
  onAddStones,
}) {
  // Which item's role editor is expanded — pure UI state, one at a time.
  const [editingId, setEditingId] = React.useState(null);
  React.useEffect(() => {
    if (!open) setEditingId(null);
  }, [open]);

  if (!open) return null;

  const items = Array.isArray(trayItems) ? trayItems : [];
  const groups = buildDesignGroups(items);

  return (
    <div style={styles.overlay} dir="rtl" role="dialog" aria-modal="true" aria-label={B.title}>
      <button type="button" style={styles.backdrop} onClick={onClose} aria-label={B.close} />
      <div style={{ ...styles.panel, ...(narrow ? styles.panelNarrow : null) }}>
        <div style={styles.head}>
          <span style={styles.headText}>
            <span style={styles.title}>{B.title}</span>
            <span style={styles.subtitle} title={B.subtitle}>
              {B.stonesCount(items.length)}
            </span>
          </span>
          <button type="button" onClick={onClose} style={styles.closeBtn} title={B.close} aria-label={B.close}>
            <CloseIcon />
          </button>
        </div>

        <div style={styles.body}>
          {items.length === 0 ? (
            <div style={styles.empty}>{B.empty}</div>
          ) : (
            groups.map((group) => (
              <section key={group.id} style={styles.group}>
                <div style={styles.groupHead}>
                  <span style={styles.groupTitle}>{group.roleHe}</span>
                  {group.items.length > 1 && (
                    <span style={styles.groupCount}>{group.items.length}</span>
                  )}
                </div>
                {group.items.map((item) => (
                  <BoardItem
                    key={item.id}
                    item={item}
                    expanded={editingId === item.id}
                    onToggleEdit={() =>
                      setEditingId((cur) => (cur === item.id ? null : item.id))
                    }
                    onSetRole={onSetRole}
                  />
                ))}
              </section>
            ))
          )}
        </div>

        {typeof onAddStones === 'function' && (
          <div style={styles.foot}>
            <button type="button" onClick={onAddStones} style={styles.addBtn}>
              <PlusIcon size={14} />
              <span>{B.addStones}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 58,
    display: 'flex',
    justifyContent: 'flex-start',
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(17,17,20,0.42)',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    margin: 0,
  },
  // Desktop: side drawer (inline-start in RTL).
  panel: {
    position: 'relative',
    width: 'min(440px, 94vw)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: reset.color.panel,
    borderInlineEnd: `1px solid ${reset.color.border}`,
    boxShadow: reset.shadow.lift,
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  // Narrow/mobile: full-width bottom sheet.
  panelNarrow: {
    width: '100%',
    height: 'auto',
    maxHeight: '88vh',
    marginTop: 'auto',
    borderInlineEnd: 'none',
    borderTop: `1px solid ${reset.color.border}`,
    borderRadius: `${reset.radius.lg} ${reset.radius.lg} 0 0`,
  },
  head: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    padding: '14px 16px 10px',
    flexShrink: 0,
  },
  headText: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  title: {
    fontFamily: reset.font.display,
    fontWeight: 700,
    fontSize: '16px',
    color: reset.color.text,
  },
  subtitle: {
    fontFamily: reset.font.body,
    fontSize: '11.5px',
    color: reset.color.textMuted,
  },
  closeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '34px',
    height: '34px',
    borderRadius: reset.radius.sm,
    border: `1px solid ${reset.color.border}`,
    background: reset.color.page,
    color: reset.color.textMuted,
    cursor: 'pointer',
    flexShrink: 0,
  },
  body: {
    flex: '1 1 auto',
    minHeight: 0,
    overflowY: 'auto',
    padding: '4px 16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  empty: {
    fontFamily: reset.font.body,
    fontSize: '13px',
    color: reset.color.textMuted,
    padding: '22px 4px',
    textAlign: 'center',
  },
  group: { display: 'flex', flexDirection: 'column', gap: '8px' },
  groupHead: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingTop: '4px',
  },
  groupTitle: {
    fontFamily: reset.font.body,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: reset.color.textMuted,
  },
  groupCount: {
    fontFamily: reset.font.body,
    fontSize: '10.5px',
    fontWeight: 700,
    color: reset.color.textFaint,
    border: `1px solid ${reset.color.border}`,
    borderRadius: '999px',
    padding: '1px 7px',
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '9px 10px',
    background: reset.color.page,
    border: `1px solid ${reset.color.border}`,
    borderRadius: reset.radius.md,
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: 0,
  },
  thumb: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: reset.radius.sm,
    border: `1px solid ${reset.color.border}`,
    background: reset.color.panel,
    color: reset.color.textMuted,
    overflow: 'hidden',
    flexShrink: 0,
  },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  itemText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
    flex: '1 1 auto',
  },
  itemTitle: {
    fontFamily: reset.font.body,
    fontSize: '12.5px',
    fontWeight: 700,
    color: reset.color.text,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  itemMeta: {
    fontFamily: reset.font.body,
    fontSize: '11px',
    color: reset.color.textMuted,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  roleBadge: {
    fontFamily: reset.font.body,
    fontSize: '10.5px',
    fontWeight: 700,
    color: reset.color.text,
    background: reset.color.panel,
    border: `1px solid ${reset.color.borderStrong}`,
    borderRadius: '999px',
    padding: '3px 9px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  roleBadgeUnassigned: {
    color: reset.color.textFaint,
    border: `1px dashed ${reset.color.border}`,
  },
  editBtn: {
    fontFamily: reset.font.body,
    fontSize: '11px',
    fontWeight: 700,
    color: reset.color.textMuted,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '6px 2px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
  },
  chipsWrap: {
    paddingTop: '2px',
  },
  foot: {
    flexShrink: 0,
    padding: '10px 16px 14px',
    borderTop: `1px solid ${reset.color.border}`,
    background: reset.color.panel,
  },
  addBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    minHeight: '38px',
    padding: '8px 16px',
    fontFamily: reset.font.body,
    fontSize: '12.5px',
    fontWeight: 700,
    color: reset.color.primaryText,
    background: reset.color.primaryBg,
    border: 'none',
    borderRadius: reset.radius.sm,
    cursor: 'pointer',
  },
};
