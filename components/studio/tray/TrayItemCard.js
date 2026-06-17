// components/studio/tray/TrayItemCard.js
//
// LESHEM.S OS — Work Tray Item Card (Clean 3)
//
// One item in the Work Tray, designed mobile-first as a stacked card:
//   • thumbnail + identity (stone type, shape, carat, color/clarity, SKU)
//   • role selector (תפקיד בעיצוב) — large, thumb-friendly <select>
//   • remove action (הסרה)
//
// The Airtable record id is NEVER displayed. Identity uses the same field
// precedence as the inventory card/drawer. No commerce language.

import { tokens } from '../shared/tokens';
import MediaPreview from '../media/MediaPreview';
import { TRAY_HE } from '../../../lib/studio/labels';
import {
  ASSIGNABLE_ROLES,
  roleHe,
  DESIGN_ROLE,
} from '../../../lib/studio/designDraft';

function identity(snapshot) {
  const s = snapshot || {};
  const title = s.stoneTypeHe || s.productTypeHe || s.name || 'פריט מלאי';
  const carat = s.caratWeight != null ? `${s.caratWeight} ct` : null;
  const colorClarity = [s.color, s.clarity].filter(Boolean).join(' · ');
  return { title, carat, colorClarity, shape: s.shapeHe || null, sku: s.sku || null };
}

export default function TrayItemCard({ item, onRole, onRemove }) {
  if (!item) return null;
  const { title, carat, colorClarity, shape, sku } = identity(item.snapshot);
  const role = item.role || DESIGN_ROLE.UNASSIGNED;

  return (
    <div style={styles.card} dir="rtl">
      <div style={styles.top}>
        <div style={styles.thumb}>
          <MediaPreview src={item.snapshot && item.snapshot.primaryImage} alt={title} height={84} cover />
        </div>

        <div style={styles.identity}>
          <div style={styles.titleRow}>
            <span style={styles.title}>{title}</span>
            {carat && <span style={styles.carat}>{carat}</span>}
          </div>
          {shape && <span style={styles.shape}>{shape}</span>}
          {colorClarity && <span style={styles.detail}>{colorClarity}</span>}
          {sku && <span style={styles.sku}>{sku}</span>}
        </div>
      </div>

      <div style={styles.controls}>
        <label style={styles.roleField}>
          <span style={styles.roleCaption}>{TRAY_HE.roleLabel}</span>
          <select
            value={role}
            onChange={(e) => onRole && onRole(item.id, e.target.value)}
            style={styles.roleSelect}
            aria-label={TRAY_HE.roleLabel}
          >
            {ASSIGNABLE_ROLES.map((r) => (
              <option key={r} value={r}>
                {roleHe(r)}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => onRemove && onRemove(item.id)}
          style={styles.remove}
          aria-label={`${TRAY_HE.remove}: ${title}`}
        >
          {TRAY_HE.remove}
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.lg,
    boxShadow: tokens.shadow.soft,
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  top: {
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-start',
  },
  thumb: {
    width: '84px',
    height: '84px',
    flexShrink: 0,
    borderRadius: tokens.radius.md,
    overflow: 'hidden',
    border: `1px solid ${tokens.color.cardEdge}`,
  },
  identity: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    minWidth: 0,
    flex: 1,
  },
  titleRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '8px',
  },
  title: {
    fontFamily: tokens.font.display,
    fontSize: '18px',
    color: tokens.color.charcoal,
    lineHeight: 1.3,
  },
  carat: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.color.gold,
    whiteSpace: 'nowrap',
  },
  shape: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    color: tokens.color.inkSoft,
  },
  detail: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    color: tokens.color.ink,
  },
  sku: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    color: tokens.color.inkFaint,
    direction: 'ltr',
    textAlign: 'right',
    marginTop: '2px',
  },
  controls: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '10px',
    flexWrap: 'wrap',
  },
  roleField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    flex: 1,
    minWidth: '160px',
  },
  roleCaption: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: tokens.color.inkFaint,
    paddingInlineStart: '4px',
  },
  roleSelect: {
    width: '100%',
    minHeight: '48px',
    fontFamily: tokens.font.body,
    fontSize: '15px',
    color: tokens.color.charcoal,
    background: tokens.color.ivory,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    padding: '10px 14px',
    cursor: 'pointer',
  },
  remove: {
    minHeight: '48px',
    padding: '12px 18px',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.color.inkSoft,
    background: 'transparent',
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
};
