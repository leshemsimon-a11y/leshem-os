// components/studio/assets/AssetCoverSelector.js
//
// LESHEM.S OS — Asset Cover Selector (Clean 4B.4a)
//
// Shows the image files of one Asset Object as a small thumbnail grid and lets
// the user pick which one is the primary / cover image ("הגדר כתמונה ראשית").
// The current primary is marked. Writes via store.setPrimaryFile (additive).
// Local only — no network, no Airtable.

import { tokens } from '../shared/tokens';
import { WIZARD_HE } from '../../../lib/studio/labels';
import AssetThumbnail from './AssetThumbnail';

export default function AssetCoverSelector({ object, files, getFileUrl, onSetPrimary }) {
  const images = (Array.isArray(files) ? files : []).filter(
    (f) => f.fileKind === 'image' && f.status !== 'archived'
  );
  const primaryId = object && object.primaryFileId ? object.primaryFileId : null;

  if (images.length === 0) {
    return (
      <div style={styles.wrap} dir="rtl">
        <span style={styles.title}>{WIZARD_HE.coverTitle}</span>
        <p style={styles.empty}>{WIZARD_HE.noImages}</p>
      </div>
    );
  }

  return (
    <div style={styles.wrap} dir="rtl">
      <span style={styles.title}>{WIZARD_HE.coverTitle}</span>
      <p style={styles.hint}>{WIZARD_HE.coverHint}</p>
      <div style={styles.grid}>
        {images.map((f) => {
          const isPrimary = f.fileId === primaryId;
          return (
            <div key={f.fileId} style={styles.cell}>
              <AssetThumbnail
                fileId={f.fileId}
                getFileUrl={getFileUrl}
                alt={f.fileName}
                size={84}
              />
              {isPrimary ? (
                <span style={styles.primaryBadge}>{WIZARD_HE.isPrimary}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => onSetPrimary(object.objectId, f.fileId)}
                  style={styles.setBtn}
                >
                  {WIZARD_HE.setPrimary}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' },
  title: { fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 700, color: tokens.color.charcoal },
  hint: { fontFamily: tokens.font.body, fontSize: '12px', color: tokens.color.inkFaint, margin: 0 },
  empty: { fontFamily: tokens.font.body, fontSize: '13px', color: tokens.color.inkFaint, margin: 0 },
  grid: { display: 'flex', flexWrap: 'wrap', gap: '12px' },
  cell: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '84px' },
  primaryBadge: {
    fontFamily: tokens.font.body, fontSize: '11px', fontWeight: 600, color: tokens.color.gold,
    textAlign: 'center', whiteSpace: 'nowrap',
  },
  setBtn: {
    fontFamily: tokens.font.body, fontSize: '11px', fontWeight: 600, color: tokens.color.inkSoft,
    background: 'transparent', border: `1px solid ${tokens.color.cardEdge}`, borderRadius: '999px',
    padding: '4px 8px', cursor: 'pointer', whiteSpace: 'nowrap',
  },
};
