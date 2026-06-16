// components/studio/drawer/AssetDrawer.js
//
// LESHEM.S OS — Asset Drawer / Inspect View (Clean 2)
//
// Opens over the inventory page (no navigation away). Loupe-style inspection:
// large media, gemological detail, measurements, certificate/lab identifiers,
// a clearly-marked internal/studio section (cost, supplier, location, notes),
// and an English-ready preview of how the piece will read on a future
// client-facing certificate.
//
// HARD RULES honored:
//   • The Airtable record id is NEVER rendered.
//   • Internal/studio fields are visibly separated and labelled internal.
//   • The "client-facing preview" section uses ENGLISH-ready labels only and
//     never leaks Hebrew or internal IDs.

import { useEffect } from 'react';
import { tokens } from '../shared/tokens';
import MediaPreview from '../media/MediaPreview';

function Row({ label, value }) {
  if (value == null || value === '') return null;
  return (
    <div style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <span style={styles.rowValue}>{value}</span>
    </div>
  );
}

function Section({ title, accent, children, hasContent }) {
  if (!hasContent) return null;
  return (
    <section style={styles.section}>
      <h3 style={{ ...styles.sectionTitle, ...(accent ? styles.sectionAccent : null) }}>
        {title}
      </h3>
      <div style={styles.sectionBody}>{children}</div>
    </section>
  );
}

export default function AssetDrawer({ asset, onClose }) {
  // Close on Escape.
  useEffect(() => {
    if (!asset) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [asset, onClose]);

  if (!asset) return null;

  const title =
    asset.name || asset.stoneTypeHe || asset.productTypeHe || 'פריט מלאי';

  const measurements =
    asset.measLength || asset.measWidth || asset.measHeight
      ? [asset.measLength, asset.measWidth, asset.measHeight]
          .map((m) => (m != null ? m : '—'))
          .join(' × ') + ' מ״מ'
      : null;

  const hasGemology =
    asset.color ||
    asset.clarity ||
    asset.cutGrade ||
    asset.polish ||
    asset.symmetry ||
    asset.caratWeight != null ||
    asset.stoneCount != null ||
    asset.fluorescenceIntensity ||
    asset.transparency ||
    asset.growthMethod ||
    asset.fancyColorHue ||
    asset.fancyColorIntensity;

  const hasCert =
    asset.certLab ||
    asset.laserInscription ||
    asset.verificationId ||
    asset.verificationUrl ||
    asset.certPdfUrl;

  const hasInternal =
    asset.costUsd != null ||
    asset.supplierName ||
    asset.physicalLocation ||
    asset.ownerClient ||
    asset.virtualSupplier ||
    asset.supplierAvailability ||
    asset.memoNumber ||
    asset.internalNotes;

  // English-ready client-facing preview (never Hebrew, never IDs).
  const clientLine = [
    asset.productTypeEn,
    asset.stoneTypeEn && asset.stoneTypeEn !== asset.productTypeEn
      ? asset.stoneTypeEn
      : null,
    asset.shapeEn,
    asset.caratWeight != null ? `${asset.caratWeight} ct` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      <div style={styles.scrim} onClick={onClose} aria-hidden="true" />
      <aside
        style={styles.drawer}
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-label={`פרטי פריט: ${title}`}
      >
        <header style={styles.header}>
          <button
            type="button"
            onClick={onClose}
            style={styles.close}
            aria-label="סגירה"
          >
            ✕ סגירה
          </button>
        </header>

        <div style={styles.scroll}>
          <div style={styles.heroMedia}>
            <MediaPreview
              src={asset.primaryImage}
              alt={title}
              height={260}
              cover
            />
          </div>

          {/* Extra images, if any */}
          {asset.images && asset.images.length > 1 && (
            <div style={styles.thumbs}>
              {asset.images.slice(0, 5).map((src, i) => (
                <div key={i} style={styles.thumb}>
                  <MediaPreview src={src} alt="" height={64} cover />
                </div>
              ))}
            </div>
          )}

          <div style={styles.titleBlock}>
            <h2 style={styles.title}>{title}</h2>
            <div style={styles.titleMeta}>
              {asset.shapeHe && <span style={styles.chip}>{asset.shapeHe}</span>}
              {asset.stoneTypeHe && (
                <span style={styles.chip}>{asset.stoneTypeHe}</span>
              )}
              {asset.statusHe && (
                <span style={styles.chipGold}>{asset.statusHe}</span>
              )}
            </div>
            {asset.sku && <div style={styles.sku}>מק״ט: {asset.sku}</div>}
          </div>

          <Section title="נתונים גמולוגיים" hasContent={hasGemology}>
            <Row label="משקל קראט" value={asset.caratWeight != null ? `${asset.caratWeight} ct` : null} />
            <Row label="מספר אבנים" value={asset.stoneCount} />
            <Row label="צבע" value={asset.color} />
            <Row label="ניקיון" value={asset.clarity} />
            <Row label="ליטוש (Cut)" value={asset.cutGrade} />
            <Row label="פוליש" value={asset.polish} />
            <Row label="סימטריה" value={asset.symmetry} />
            <Row label="שקיפות" value={asset.transparency} />
            <Row label="עוצמת פלורסנציה" value={asset.fluorescenceIntensity} />
            <Row label="צבע פלורסנציה" value={asset.fluorescenceColor} />
            <Row label="גוון Fancy" value={asset.fancyColorHue} />
            <Row label="עוצמת Fancy" value={asset.fancyColorIntensity} />
            <Row label="שיטת גידול" value={asset.growthMethod} />
          </Section>

          <Section title="מידות" hasContent={!!measurements}>
            <Row label="אורך × רוחב × גובה" value={measurements} />
          </Section>

          <Section title="תעודה ומעבדה" hasContent={hasCert}>
            <Row label="מעבדה" value={asset.certLab} />
            <Row label="חריטת לייזר" value={asset.laserInscription} />
            <Row label="מזהה אימות" value={asset.verificationId} />
            {asset.verificationUrl && (
              <div style={styles.row}>
                <span style={styles.rowLabel}>קישור אימות</span>
                <a
                  href={asset.verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.link}
                >
                  פתיחה
                </a>
              </div>
            )}
            {asset.certPdfUrl && (
              <div style={styles.row}>
                <span style={styles.rowLabel}>קובץ תעודה</span>
                <a
                  href={asset.certPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.link}
                >
                  פתיחה
                </a>
              </div>
            )}
          </Section>

          {/* Internal / studio-only — clearly marked, separated visually. */}
          <Section title="מידע פנימי לסטודיו" accent hasContent={hasInternal}>
            <div style={styles.internalNote}>
              מידע זה פנימי בלבד ואינו מופיע בתעודת הלקוח.
            </div>
            <Row label="עלות" value={asset.costUsd != null ? `$${asset.costUsd}` : null} />
            <Row label="ספק" value={asset.supplierName} />
            <Row label="ספק וירטואלי" value={asset.virtualSupplier} />
            <Row label="זמינות ספק" value={asset.supplierAvailability} />
            <Row label="מיקום פיזי" value={asset.physicalLocation} />
            <Row label="בעלים / לקוח" value={asset.ownerClient} />
            <Row label="מספר ממו" value={asset.memoNumber} />
            <Row label="הערות פנימיות" value={asset.internalNotes} />
          </Section>

          {/* English-ready client-facing preview. */}
          {clientLine && (
            <section style={styles.clientPreview}>
              <h3 style={styles.clientTitle}>Client-facing preview</h3>
              <p style={styles.clientLine}>{clientLine}</p>
              <span style={styles.clientHint}>
                English-only · prepared for future certificate output
              </span>
            </section>
          )}
        </div>
      </aside>
    </>
  );
}

const styles = {
  scrim: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(43,40,36,0.32)',
    zIndex: 40,
  },
  drawer: {
    position: 'fixed',
    top: 0,
    right: 0,
    height: '100vh',
    width: 'min(440px, 92vw)',
    background: tokens.color.ivory,
    borderLeft: `1px solid ${tokens.color.cardEdge}`,
    boxShadow: tokens.shadow.lift,
    zIndex: 41,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'flex-start',
    padding: '16px 18px 8px',
    flexShrink: 0,
  },
  close: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.color.inkSoft,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.sm,
    padding: '8px 14px',
    cursor: 'pointer',
  },
  scroll: {
    overflowY: 'auto',
    padding: '0 20px 40px',
    flex: 1,
  },
  heroMedia: {
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
    boxShadow: tokens.shadow.soft,
  },
  thumbs: {
    display: 'flex',
    gap: '8px',
    marginTop: '10px',
  },
  thumb: {
    width: '64px',
    height: '64px',
    borderRadius: tokens.radius.sm,
    overflow: 'hidden',
    border: `1px solid ${tokens.color.cardEdge}`,
  },
  titleBlock: {
    padding: '20px 0 8px',
    borderBottom: `1px solid ${tokens.color.cardEdge}`,
  },
  title: {
    fontFamily: tokens.font.display,
    fontWeight: 400,
    fontSize: '24px',
    color: tokens.color.charcoal,
    margin: '0 0 10px',
  },
  titleMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  chip: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.ink,
    background: tokens.color.pearl,
    borderRadius: '999px',
    padding: '4px 12px',
  },
  chipGold: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 600,
    color: tokens.color.gold,
    background: tokens.color.goldFaint,
    borderRadius: '999px',
    padding: '4px 12px',
  },
  sku: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    color: tokens.color.inkFaint,
    marginTop: '10px',
  },
  section: {
    paddingTop: '20px',
  },
  sectionTitle: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: tokens.color.inkSoft,
    margin: '0 0 10px',
  },
  sectionAccent: {
    color: tokens.color.gold,
  },
  sectionBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '8px 0',
    borderBottom: `1px solid ${tokens.color.goldFaint}`,
  },
  rowLabel: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    color: tokens.color.inkFaint,
    flexShrink: 0,
  },
  rowValue: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    color: tokens.color.charcoal,
    textAlign: 'left',
    direction: 'ltr',
  },
  link: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.color.gold,
    textDecoration: 'none',
  },
  internalNote: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.inkFaint,
    background: tokens.color.pearl,
    borderRadius: tokens.radius.sm,
    padding: '8px 12px',
    marginBottom: '8px',
  },
  clientPreview: {
    marginTop: '24px',
    padding: '16px',
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    direction: 'ltr',
    textAlign: 'left',
  },
  clientTitle: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: tokens.color.inkSoft,
    margin: '0 0 6px',
    textTransform: 'uppercase',
  },
  clientLine: {
    fontFamily: tokens.font.display,
    fontSize: '16px',
    color: tokens.color.charcoal,
    margin: '0 0 6px',
  },
  clientHint: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    color: tokens.color.inkFaint,
  },
};
