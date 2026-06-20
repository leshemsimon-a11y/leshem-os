// components/studio/tray/TrayItemCard.js
//
// LESHEM.S OS — Work Tray Item Card (Clean 3 → Clean 3.2)
//
// One item in the Work Tray, designed mobile-first as a stacked card:
//   • thumbnail + identity (stone type, shape, carat, color/clarity, SKU)
//   • role selector (תפקיד בעיצוב) — tap-friendly CHIPS (Clean 3.2)
//   • an honest "עדיין לא הוגדר תפקיד" marker while unassigned
//   • remove action (הסרה)
//
// Clean 3.2 change: the role <select> is replaced by <RoleChips>, so choosing
// a role feels like choosing what an object IS on the tray — visual and
// thumb-friendly. The role can always be changed; the unassigned state stays
// clearly marked. Center stones remain SEPARATE items (no quantity collapse).
//
// The Airtable record id is NEVER displayed. Identity uses the same field
// precedence as the inventory card/drawer. No commerce language.

import { tokens } from '../shared/tokens';
import MediaPreview from '../media/MediaPreview';
import RoleChips from '../shared/RoleChips';
import { TRAY_HE } from '../../../lib/studio/labels';
import { DESIGN_ROLE, normalizeRole } from '../../../lib/studio/designDraft';

function identity(snapshot) {
  const s = snapshot || {};
  const title = s.name || s.stoneTypeHe || s.productTypeHe || 'פריט מלאי';
  const carat = s.caratWeight != null ? `${s.caratWeight} ct` : null;
  const colorClarity = [s.color, s.clarity].filter(Boolean).join(' · ');
  return { title, carat, colorClarity, shape: s.shapeHe || null, sku: s.sku || null };
}

export default function TrayItemCard({ item, onRole, onRemove }) {
  if (!item) return null;
  const { title, carat, colorClarity, shape, sku } = identity(item.snapshot);
  const role = normalizeRole(item.role);
  const isUnassigned = role === DESIGN_ROLE.UNASSIGNED;

  return (
    <div style={styles.card} dir="rtl">
      <div style={styles.top}>
        <div style={styles.thumb}>
          <MediaPreview
            src={item.snapshot && item.snapshot.primaryImage}
            alt={title}
            height={84}
            cover
          />
        </div>

        <div style={styles.identity}>
          <div style={styles.titleRow}>
            <span style={styles.title}>{title}</span>
            {carat && <span style={styles.carat}>{carat}</span>}
          </div>
          {shape && <span style={styles.shape}>{shape}</span>}
          {colorClarity && <span style={styles.detail}>{colorClarity}</span>}
          {sku && <span style={styles.sku}>{sku}</span>}

          {/* Honest, always-visible state marker while no role is set. */}
          {isUnassigned && (
            <span style={styles.unassignedMark}>
              <span style={styles.unassignedDot} aria-hidden="true" />
              {TRAY_HE.unassignedMark}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onRemove && onRemove(item.id)}
          style={styles.remove}
          aria-label={`${TRAY_HE.remove}: ${title}`}
        >
          {TRAY_HE.remove}
        </button>
      </div>

      <div style={styles.controls}>
        <div style={styles.roleCaptionRow}>
          <span style={styles.roleCaption}>{TRAY_HE.roleLabel}</span>
          <span style={styles.roleHint}>{TRAY_HE.roleChangeHint}</span>
        </div>
        <RoleChips
          value={role}
          onChange={(next) => onRole && onRole(item.id, next)}
          ariaLabel={`${TRAY_HE.roleLabel}: ${title}`}
        />
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
  unassignedMark: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '6px',
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 600,
    color: tokens.color.inkSoft,
  },
  unassignedDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: tokens.color.goldSoft,
    display: 'inline-block',
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingTop: '12px',
    borderTop: `1px solid ${tokens.color.cardEdge}`,
  },
  roleCaptionRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '10px',
    flexWrap: 'wrap',
  },
  roleCaption: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    color: tokens.color.inkSoft,
  },
  roleHint: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    color: tokens.color.inkFaint,
  },
  remove: {
    minHeight: '44px',
    padding: '10px 16px',
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.color.inkSoft,
    background: 'transparent',
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    alignSelf: 'flex-start',
  },
};
