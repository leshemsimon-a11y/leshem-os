// components/studio/inventory/StoneCard.js
//
// LESHEM.S OS — Stone Card (Clean 2)
//
// A display-case card: media on top, a quiet caption below. Clicking the card
// opens the Asset Drawer (inspect) without leaving the page. The Airtable
// record id is NEVER shown — the visible identifier is the SKU only.

import { tokens } from '../shared/tokens';
import MediaPreview from '../media/MediaPreview';

export default function StoneCard({ asset, onInspect }) {
  if (!asset) return null;

  const title =
    asset.name ||
    asset.stoneTypeHe ||
    asset.productTypeHe ||
    'פריט מלאי';

  const subtitleParts = [asset.shapeHe, asset.stoneTypeHe].filter(Boolean);
  // Avoid repeating the title in the subtitle.
  const subtitle = subtitleParts.filter((p) => p !== title).join(' · ');

  const carat =
    asset.caratWeight != null ? `${asset.caratWeight} ct` : null;

  return (
    <button
      type="button"
      onClick={() => onInspect && onInspect(asset)}
      style={styles.card}
      dir="rtl"
      aria-label={`בדיקת פריט: ${title}`}
    >
      <div style={styles.media}>
        <MediaPreview src={asset.primaryImage} alt={title} height={190} />
        {asset.statusHe && (
          <span style={styles.statusChip}>{asset.statusHe}</span>
        )}
      </div>

      <div style={styles.body}>
        <div style={styles.titleRow}>
          <span style={styles.title}>{title}</span>
          {carat && <span style={styles.carat}>{carat}</span>}
        </div>
        {subtitle && <span style={styles.subtitle}>{subtitle}</span>}
        <div style={styles.metaRow}>
          {asset.color && <span style={styles.meta}>{asset.color}</span>}
          {asset.clarity && <span style={styles.meta}>{asset.clarity}</span>}
          {asset.sku && <span style={styles.sku}>{asset.sku}</span>}
        </div>
      </div>
    </button>
  );
}

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'right',
    width: '100%',
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.lg,
    background: tokens.color.canvas,
    boxShadow: tokens.shadow.soft,
    padding: '0',
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'box-shadow 160ms ease, transform 160ms ease',
    font: 'inherit',
    color: 'inherit',
  },
  media: {
    position: 'relative',
    padding: '12px 12px 0',
  },
  statusChip: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.color.charcoal,
    background: 'rgba(253,251,247,0.92)',
    border: `1px solid ${tokens.color.goldFaint}`,
    borderRadius: '999px',
    padding: '3px 10px',
    backdropFilter: 'blur(2px)',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '14px 16px 18px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '8px',
  },
  title: {
    fontFamily: tokens.font.display,
    fontSize: '17px',
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
  subtitle: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    color: tokens.color.inkSoft,
  },
  metaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '2px',
  },
  meta: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.inkSoft,
    background: tokens.color.pearl,
    borderRadius: '6px',
    padding: '2px 8px',
  },
  sku: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.inkFaint,
    marginInlineStart: 'auto',
  },
};
