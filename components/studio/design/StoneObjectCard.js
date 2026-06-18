// components/studio/design/StoneObjectCard.js
//
// LESHEM.S OS — Stone Object Card (Clean 3.3)
//
// A single selected stone rendered as a VISUAL OBJECT on the design board —
// not a table row, not a form field. The stone reads like something placed on
// a jeweller's tray: a generous facet-framed image, the name, and a compact
// set of gemmological tags. Low text, high visual weight.
//
// `dominant` makes the card larger and more present, used for the CENTER STONE
// (and PAIR) so the user instantly feels which stone the design is built
// around. Center stones remain SEPARATE cards — never collapsed to a quantity.
//
// Pure presentation. Reuses MediaPreview + the shared title helper. The
// Airtable record id is NEVER rendered. No network, no Airtable, no commerce.

import { tokens } from '../shared/tokens';
import MediaPreview from '../media/MediaPreview';
import { trayItemTitle } from '../../../lib/studio/designDraft';

export default function StoneObjectCard({ item, dominant = false }) {
  if (!item) return null;
  const s = item.snapshot || {};
  const title = trayItemTitle(item);
  const carat = s.caratWeight != null ? `${s.caratWeight} ct` : null;
  const tags = [s.shapeHe, s.color, s.clarity].filter(Boolean);

  const cardStyle = dominant
    ? { ...styles.card, ...styles.cardDominant }
    : styles.card;
  const frameStyle = dominant
    ? { ...styles.frame, ...styles.frameDominant }
    : styles.frame;
  const imgHeight = dominant ? 168 : 96;

  return (
    <div style={cardStyle} dir="rtl">
      <div style={frameStyle}>
        <MediaPreview src={s.primaryImage} alt={title} height={imgHeight} cover />
        {dominant && (
          <span style={styles.dominantMark} aria-hidden="true">
            ◆
          </span>
        )}
      </div>

      <div style={styles.body}>
        <div style={styles.titleRow}>
          <span style={dominant ? styles.titleDominant : styles.title}>
            {title}
          </span>
          {carat && <span style={styles.carat}>{carat}</span>}
        </div>

        {tags.length > 0 && (
          <div style={styles.tags}>
            {tags.map((t, i) => (
              <span key={i} style={styles.tag}>
                {t}
              </span>
            ))}
          </div>
        )}

        {s.sku && <span style={styles.sku}>{s.sku}</span>}
      </div>
    </div>
  );
}

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '12px',
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.lg,
    boxShadow: tokens.shadow.soft,
    minWidth: 0,
  },
  cardDominant: {
    padding: '16px',
    background: tokens.color.ivory,
    border: `1px solid ${tokens.color.goldSoft}`,
    boxShadow: tokens.shadow.lift,
  },
  frame: {
    position: 'relative',
    borderRadius: tokens.radius.md,
    overflow: 'hidden',
    border: `1px solid ${tokens.color.cardEdge}`,
    background: tokens.color.pearl,
  },
  frameDominant: {
    border: `1px solid ${tokens.color.goldFaint}`,
  },
  dominantMark: {
    position: 'absolute',
    top: '10px',
    insetInlineStart: '10px',
    width: '26px',
    height: '26px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    color: tokens.color.gold,
    background: 'rgba(251,248,242,0.86)',
    border: `1px solid ${tokens.color.goldFaint}`,
    borderRadius: '50%',
    backdropFilter: 'blur(2px)',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    minWidth: 0,
  },
  titleRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '8px',
  },
  title: {
    fontFamily: tokens.font.display,
    fontSize: '16px',
    color: tokens.color.charcoal,
    lineHeight: 1.3,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  titleDominant: {
    fontFamily: tokens.font.display,
    fontSize: '21px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    lineHeight: 1.25,
    minWidth: 0,
  },
  carat: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 700,
    color: tokens.color.gold,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  tag: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 500,
    color: tokens.color.inkSoft,
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: '999px',
    padding: '3px 10px',
    whiteSpace: 'nowrap',
  },
  sku: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    color: tokens.color.inkFaint,
    direction: 'ltr',
    textAlign: 'right',
  },
};
