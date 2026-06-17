// components/studio/drawer/AssetDrawer.js
//
// LESHEM.S OS — Asset Drawer / Inspect View (Clean 2.5)
//
// Opens over the inventory page (no navigation away). Organized into five
// clear sections per the Clean 2.5 spec:
//
//   1. Overview              — stone type, category, origin, shape, carat, measurements
//   2. Gemological Details   — color, clarity, cut/polish/symmetry, fluorescence,
//                              treatment, geographic origin (when available)
//   3. Certificate / Report  — lab, report number, report link, cert media,
//                              + future "Upload Certificate" / "Add Report Link"
//   4. Inventory / Internal  — layer, status, supplier, SKU, cost, internal notes
//   5. Media                 — image preview, extra media, + future "Upload Media"
//
// HARD RULES honored:
//   • The Airtable record id is NEVER rendered (SKU is the only visible id).
//   • Internal/studio fields are visibly separated + labelled internal.
//   • The client-facing preview uses ENGLISH-ready labels only — no Hebrew,
//     no internal IDs.
//   • Future affordances are non-functional placeholders, clearly marked.

import { useEffect } from 'react';
import { tokens } from '../shared/tokens';
import MediaPreview from '../media/MediaPreview';
import FuturePlaceholder from '../shared/FuturePlaceholder';
import { INVENTORY_HE, CLIENT_EN } from '../../../lib/studio/labels';

const F = INVENTORY_HE.fields;
const S = INVENTORY_HE.sections;

function Row({ label, value, ltr = false }) {
  if (value == null || value === '') return null;
  return (
    <div style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <span style={{ ...styles.rowValue, direction: ltr ? 'ltr' : 'rtl' }}>
        {value}
      </span>
    </div>
  );
}

function LinkRow({ label, href }) {
  if (!href) return null;
  return (
    <div style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <a href={href} target="_blank" rel="noopener noreferrer" style={styles.link}>
        {INVENTORY_HE.open}
      </a>
    </div>
  );
}

function Section({ title, accent, children }) {
  return (
    <section style={styles.section}>
      <h3
        style={{
          ...styles.sectionTitle,
          ...(accent ? styles.sectionAccent : null),
        }}
      >
        {title}
      </h3>
      <div style={styles.sectionBody}>{children}</div>
    </section>
  );
}

export default function AssetDrawer({ asset, onClose }) {
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
    asset.stoneTypeHe || asset.productTypeHe || asset.name || 'פריט מלאי';

  const measurements =
    asset.measLength != null ||
    asset.measWidth != null ||
    asset.measHeight != null
      ? [asset.measLength, asset.measWidth, asset.measHeight]
          .map((m) => (m != null ? m : '—'))
          .join(' × ') + ' מ״מ'
      : null;

  const fluorescence = [asset.fluorescenceIntensity, asset.fluorescenceColor]
    .filter(Boolean)
    .join(' · ');

  const extraImages =
    asset.images && asset.images.length > 1 ? asset.images.slice(0, 5) : [];

  // English-ready client-facing preview (never Hebrew, never IDs).
  const clientLine = [
    asset.stoneCategoryEn || asset.productTypeEn,
    asset.stoneTypeEn && asset.stoneTypeEn !== asset.productTypeEn
      ? asset.stoneTypeEn
      : null,
    asset.shapeEn,
    asset.caratWeight != null ? `${asset.caratWeight} ct` : null,
    asset.color || null,
    asset.clarity || null,
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
          <button type="button" onClick={onClose} style={styles.close} aria-label="סגירה">
            ✕ סגירה
          </button>
        </header>

        <div style={styles.scroll}>
          {/* Hero media */}
          <div style={styles.heroMedia}>
            <MediaPreview src={asset.primaryImage} alt={title} height={260} cover />
          </div>

          {/* Title block */}
          <div style={styles.titleBlock}>
            <h2 style={styles.title}>{title}</h2>
            <div style={styles.titleMeta}>
              {asset.shapeHe && <span style={styles.chip}>{asset.shapeHe}</span>}
              {asset.stoneCategoryHe && (
                <span style={styles.chip}>{asset.stoneCategoryHe}</span>
              )}
              {asset.statusHe && <span style={styles.chipGold}>{asset.statusHe}</span>}
            </div>
          </div>

          {/* 1. Overview */}
          <Section title={S.overview}>
            <Row label={F.stoneType} value={asset.stoneTypeHe} />
            <Row label={F.stoneCategory} value={asset.stoneCategoryHe} />
            <Row label={F.origin} value={asset.originHe} />
            <Row label={F.shape} value={asset.shapeHe} />
            <Row
              label={F.carat}
              value={asset.caratWeight != null ? `${asset.caratWeight} ct` : null}
              ltr
            />
            <Row label={F.stoneCount} value={asset.stoneCount} ltr />
            <Row label={F.measurements} value={measurements} ltr />
          </Section>

          {/* 2. Gemological Details */}
          <Section title={S.gemology}>
            <Row label={F.color} value={asset.color} ltr />
            <Row label={F.clarity} value={asset.clarity} ltr />
            <Row label={F.cutGrade} value={asset.cutGrade} ltr />
            <Row label={F.polish} value={asset.polish} ltr />
            <Row label={F.symmetry} value={asset.symmetry} ltr />
            <Row label={F.fluorescence} value={fluorescence || null} />
            <Row label={F.transparency} value={asset.transparency} />
            <Row label={F.treatment} value={asset.treatment} />
            <Row label={F.geographicOrigin} value={asset.geographicOrigin} />
            <Row label={F.growthMethod} value={asset.growthMethod} ltr />
            <Row label={F.fancyHue} value={asset.fancyColorHue} />
            <Row label={F.fancyIntensity} value={asset.fancyColorIntensity} />
          </Section>

          {/* 3. Certificate / Report */}
          <Section title={S.certificate}>
            <Row label={F.labName} value={asset.certLab} ltr />
            <Row label={F.reportNumber} value={asset.reportNumber} ltr />
            <Row label={F.laserInscription} value={asset.laserInscription} ltr />
            <LinkRow label={F.reportLink} href={asset.verificationUrl} />
            <LinkRow label={F.certFile} href={asset.certPdfUrl} />
            <div style={styles.futureRow}>
              <FuturePlaceholder
                label={INVENTORY_HE.future.uploadCertificate}
                glyph="↥"
              />
              <FuturePlaceholder
                label={INVENTORY_HE.future.addReportLink}
                glyph="🔗"
              />
            </div>
          </Section>

          {/* 4. Inventory / Internal Studio */}
          <Section title={S.internal} accent>
            <div style={styles.internalNote}>{INVENTORY_HE.internalBanner}</div>
            <Row label={F.inventoryLayer} value={asset.layerHe} />
            <Row label={F.status} value={asset.statusHe} />
            <Row label={F.supplier} value={asset.supplierName} />
            <Row label={F.virtualSupplier} value={asset.virtualSupplier} />
            <Row label={F.supplierAvailability} value={asset.supplierAvailability} />
            <Row label={F.physicalLocation} value={asset.physicalLocation} />
            <Row label={F.ownerClient} value={asset.ownerClient} />
            <Row label={F.memoNumber} value={asset.memoNumber} ltr />
            <Row label={F.sku} value={asset.sku} ltr />
            <Row
              label={F.cost}
              value={asset.costUsd != null ? `$${asset.costUsd}` : null}
              ltr
            />
            <Row label={F.internalNotes} value={asset.internalNotes} />
          </Section>

          {/* 5. Media */}
          <Section title={S.media}>
            {extraImages.length > 0 ? (
              <div style={styles.thumbs}>
                {extraImages.map((src, i) => (
                  <div key={i} style={styles.thumb}>
                    <MediaPreview src={src} alt="" height={64} cover />
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.mediaEmpty}>אין מדיה נוספת</div>
            )}
            <div style={styles.futureRow}>
              <FuturePlaceholder label={INVENTORY_HE.future.uploadMedia} glyph="↥" />
            </div>
          </Section>

          {/* English-ready client-facing preview */}
          {clientLine && (
            <section style={styles.clientPreview}>
              <h3 style={styles.clientTitle}>{CLIENT_EN.previewLabel}</h3>
              <p style={styles.clientLine}>{clientLine}</p>
              <span style={styles.clientHint}>{CLIENT_EN.previewHint}</span>
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
    width: 'min(460px, 94vw)',
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
  titleBlock: {
    padding: '20px 0 16px',
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
  section: {
    paddingTop: '22px',
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
  thumbs: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  thumb: {
    width: '64px',
    height: '64px',
    borderRadius: tokens.radius.sm,
    overflow: 'hidden',
    border: `1px solid ${tokens.color.cardEdge}`,
  },
  mediaEmpty: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    color: tokens.color.inkFaint,
  },
  futureRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '12px',
  },
  clientPreview: {
    marginTop: '26px',
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
