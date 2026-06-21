// components/studio/assets/AssetArchiveView.js
//
// LESHEM.S OS — Asset Archive View (Clean 4B.4a)
//
// Dedicated archive surface: lists archived Asset Objects (hidden from the
// active library), with restore and guarded permanent-delete. Permanent delete
// is available ONLY here, and only the store's already-guarded
// permanentlyDeleteObject (archived-only) performs it. Local only.

import { useState } from 'react';
import { tokens } from '../shared/tokens';
import { ARCHIVE_HE, ASSETS_OBJ_HE, DELETE_HE } from '../../../lib/studio/labels';
import AssetThumbnail from './AssetThumbnail';

export default function AssetArchiveView({ objects, store }) {
  const [confirmId, setConfirmId] = useState(null);
  const archived = (Array.isArray(objects) ? objects : []).filter((o) => o.status === 'archived');

  return (
    <div dir="rtl">
      <header style={styles.header}>
        <span style={styles.eyebrow}>{ARCHIVE_HE.tab}</span>
        <h1 style={styles.title}>{ARCHIVE_HE.title}</h1>
        <p style={styles.caption}>{ARCHIVE_HE.subtitle}</p>
      </header>

      {archived.length === 0 ? (
        <p style={styles.empty}>{ARCHIVE_HE.empty}</p>
      ) : (
        <div style={styles.grid}>
          {archived.map((o) => (
            <div key={o.objectId} style={styles.card}>
              <div style={styles.head}>
                <AssetThumbnail
                  fileId={o.primaryFileId}
                  getFileUrl={store.getFileUrl}
                  alt={o.title}
                  size={48}
                />
                <div style={styles.idCol}>
                  <span style={styles.cardTitle}>{o.title}</span>
                  <span style={styles.cardType}>{ASSETS_OBJ_HE.objectType[o.objectType]}</span>
                </div>
              </div>

              {o.catalogCode && <span style={styles.code}>{o.catalogCode}</span>}

              <div style={styles.actions}>
                <button type="button" onClick={() => store.unarchiveObject(o.objectId)} style={styles.ghost}>
                  {ARCHIVE_HE.restore}
                </button>
                <button type="button" onClick={() => setConfirmId(o.objectId)} style={styles.danger}>
                  {DELETE_HE.permanentDelete}
                </button>
              </div>

              {confirmId === o.objectId && (
                <div style={styles.confirmBox}>
                  <p style={styles.confirmBody}>{DELETE_HE.confirmObjectBody}</p>
                  <div style={styles.confirmRow}>
                    <button type="button" onClick={() => setConfirmId(null)} style={styles.ghost}>
                      {DELETE_HE.confirmNo}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        store.permanentlyDeleteObject(o.objectId);
                        setConfirmId(null);
                      }}
                      style={styles.danger}
                    >
                      {DELETE_HE.confirmYes}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  header: { marginBottom: '18px' },
  eyebrow: { fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em', color: tokens.color.gold },
  title: { fontFamily: tokens.font.display, fontWeight: 700, fontSize: '30px', color: tokens.color.charcoal, margin: '8px 0 10px' },
  caption: { fontFamily: tokens.font.body, fontSize: '14px', lineHeight: 1.6, color: tokens.color.inkSoft, margin: 0, maxWidth: '580px' },
  empty: { fontFamily: tokens.font.body, fontSize: '14px', color: tokens.color.inkFaint, margin: '0 0 24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
  card: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.lg, boxShadow: tokens.shadow.soft, opacity: 0.92 },
  head: { display: 'flex', alignItems: 'center', gap: '12px' },
  idCol: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  cardTitle: { fontFamily: tokens.font.display, fontSize: '17px', color: tokens.color.charcoal, lineHeight: 1.3 },
  cardType: { fontFamily: tokens.font.body, fontSize: '12px', color: tokens.color.inkFaint },
  code: { alignSelf: 'flex-start', fontFamily: tokens.font.body, fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', color: tokens.color.gold, background: tokens.color.goldFaint, border: `1px solid ${tokens.color.goldSoft}`, borderRadius: '999px', padding: '2px 9px' },
  actions: { display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' },
  ghost: { minHeight: '44px', padding: '10px 16px', fontFamily: tokens.font.body, fontSize: '14px', fontWeight: 600, color: tokens.color.inkSoft, background: 'transparent', border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md, cursor: 'pointer' },
  danger: { minHeight: '44px', padding: '10px 16px', fontFamily: tokens.font.body, fontSize: '14px', fontWeight: 600, color: '#8c2f2f', background: 'transparent', border: '1px solid #c9a3a3', borderRadius: tokens.radius.md, cursor: 'pointer' },
  confirmBox: { marginTop: '4px', padding: '12px', background: '#faf3f3', border: '1px solid #c9a3a3', borderRadius: tokens.radius.md },
  confirmBody: { fontFamily: tokens.font.body, fontSize: '13px', lineHeight: 1.6, color: tokens.color.charcoal, margin: '0 0 10px' },
  confirmRow: { display: 'flex', gap: '8px' },
};
