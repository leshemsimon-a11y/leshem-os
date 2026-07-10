// components/studio/shared/WorkAssetsPanel.js
//
// LESHEM.S OS — Clean 7B: Asset-Aware Context v1 — "נכסי עבודה" panel.
//
// Displays the normalized Work Assets of the current Work File:
//   • image / sketch / render — thumbnail when a preview URL already exists
//   • STL / OBJ / GLB / GLTF — file card + on-demand 3D preview using the
//     EXISTING Asset3DViewer (three is an existing dependency; the viewer is
//     loaded lazily via next/dynamic with ssr:false and mounted only when
//     the user asks — nothing heavy renders by default)
//   • 3DM — honest status: "תצוגת 3DM תהיה זמינה בהמשך"
//
// Model preview URLs resolve on demand through the EXISTING public
// getFileUrl (IndexedDB blob → object URL). No new storage, no packages.

import * as React from 'react';
import dynamic from 'next/dynamic';
import { tokens } from './tokens';
import { ASSETS_OBJ_HE } from '../../../lib/studio/labels';
import { getFileUrl } from '../../../lib/studio/assetsStore';
import { isImageAsset, isPreviewableModel } from '../../../lib/studio/assetContext';

// Existing 3D viewer, loaded only in the browser and only when opened.
const Asset3DViewer = dynamic(() => import('../assets/Asset3DViewer'), { ssr: false });

export const WORK_ASSETS_HE = Object.freeze({
  title: 'נכסי עבודה',
  empty: 'עדיין לא נוספו נכסי עבודה',
  open3d: 'תצוגה תלת־ממדית',
  close3d: 'סגור תצוגה',
  status3dm: 'תצוגת 3DM תהיה זמינה בהמשך',
  statusObjSoon: 'תצוגת OBJ תהיה זמינה בהמשך',
  statusNoPreview: 'ללא תצוגה מקדימה',
  loading3d: 'טוען מודל…',
});

function AssetCard({ asset }) {
  const [viewerUrl, setViewerUrl] = React.useState(null);
  const [viewerOpen, setViewerOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const kindHe = ASSETS_OBJ_HE.fileKind[asset.type] || ASSETS_OBJ_HE.fileKind.other;

  const open3d = async () => {
    if (viewerOpen) {
      setViewerOpen(false);
      return;
    }
    if (!viewerUrl) {
      setLoading(true);
      try {
        const url = await getFileUrl(asset.id);
        setViewerUrl(url || null);
      } catch (e) {
        console.warn('[work-assets] model url unavailable', e);
      }
      setLoading(false);
    }
    setViewerOpen(true);
  };

  let media = null;
  let statusLine = null;
  if (isImageAsset(asset) && asset.previewUrl) {
    media = <img src={asset.previewUrl} alt="" style={styles.thumb} />;
  } else if (isImageAsset(asset)) {
    statusLine = WORK_ASSETS_HE.statusNoPreview;
  } else if (asset.fileType === '3dm') {
    statusLine = WORK_ASSETS_HE.status3dm;
  } else if (isPreviewableModel(asset)) {
    media = (
      <button type="button" onClick={open3d} style={styles.viewerBtn} disabled={loading}>
        {loading
          ? WORK_ASSETS_HE.loading3d
          : viewerOpen
            ? WORK_ASSETS_HE.close3d
            : WORK_ASSETS_HE.open3d}
      </button>
    );
  } else if (asset.type === 'model3d') {
    // Non-previewable model extension (defensive) — honest status.
    statusLine = WORK_ASSETS_HE.statusObjSoon;
  }

  return (
    <div style={styles.card} dir="rtl">
      <div style={styles.cardRow}>
        {media && isImageAsset(asset) ? <span style={styles.thumbWrap}>{media}</span> : null}
        <div style={styles.cardText}>
          <span style={styles.cardName} title={asset.name}>
            {asset.name}
          </span>
          <span style={styles.cardMeta}>
            {kindHe}
            {asset.fileType ? ` · ${asset.fileType.toUpperCase()}` : ''}
            {' · '}
            {asset.role}
          </span>
          {statusLine ? <span style={styles.cardStatus}>{statusLine}</span> : null}
        </div>
        {media && !isImageAsset(asset) ? media : null}
      </div>
      {viewerOpen && viewerUrl ? (
        <div style={styles.viewerWrap}>
          <Asset3DViewer
            url={viewerUrl}
            extension={asset.fileType}
            fileName={asset.name}
            purposeHe={asset.role}
          />
        </div>
      ) : null}
    </div>
  );
}

export default function WorkAssetsPanel({ assets, compact, showEmpty }) {
  const list = Array.isArray(assets) ? assets : [];
  if (list.length === 0 && !showEmpty) return null;

  return (
    <section
      style={{ ...styles.wrap, ...(compact ? styles.wrapCompact : null) }}
      dir="rtl"
      aria-label={WORK_ASSETS_HE.title}
    >
      <span style={styles.title}>{WORK_ASSETS_HE.title}</span>
      {list.length === 0 ? (
        <p style={styles.empty}>{WORK_ASSETS_HE.empty}</p>
      ) : (
        <div style={styles.grid}>
          {list.map((a) => (
            <AssetCard key={a.id} asset={a} />
          ))}
        </div>
      )}
    </section>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '11px 13px',
    borderRadius: tokens.radius.md,
    border: `1px solid ${tokens.color.goldFaint}`,
    background: tokens.color.pearl,
  },
  wrapCompact: {
    padding: '9px 12px',
  },
  title: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 800,
    color: tokens.color.gold,
    letterSpacing: '0.02em',
  },
  empty: {
    margin: 0,
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.inkFaint,
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '8px 10px',
    borderRadius: tokens.radius.sm,
    border: `1px solid ${tokens.color.goldFaint}`,
    background: '#FFFFFF',
  },
  cardRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: 0,
  },
  thumbWrap: {
    width: '44px',
    height: '44px',
    borderRadius: tokens.radius.sm,
    overflow: 'hidden',
    background: tokens.color.pearl,
    flexShrink: 0,
    display: 'inline-flex',
  },
  thumb: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  cardText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
    flex: '1 1 auto',
  },
  cardName: {
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardMeta: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.color.inkSoft,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardStatus: {
    fontFamily: tokens.font.body,
    fontSize: '10.5px',
    color: tokens.color.inkFaint,
  },
  viewerBtn: {
    minHeight: '28px',
    padding: '4px 12px',
    borderRadius: '999px',
    border: `1px solid ${tokens.color.charcoal}`,
    background: 'transparent',
    color: tokens.color.charcoal,
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  viewerWrap: {
    borderRadius: tokens.radius.sm,
    overflow: 'hidden',
    border: `1px solid ${tokens.color.goldFaint}`,
    minHeight: '220px',
  },
};
