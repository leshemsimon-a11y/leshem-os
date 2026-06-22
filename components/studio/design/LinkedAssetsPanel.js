// components/studio/design/LinkedAssetsPanel.js
//
// LESHEM.S OS — Linked Assets Panel (Clean 4B.4b)
//
// Shows Asset Objects linked to a Design Project by name, context and thumbnail.
// Uses the same primary-image resolver as Work Tray / Asset Picker so a chosen
// cover image is respected everywhere. Local only.

import * as React from 'react';
import { tokens } from '../shared/tokens';
import { ASSET_FLOW_HE, ASSETS_OBJ_HE } from '../../../lib/studio/labels';
import { createUseAssets } from '../../../lib/studio/assetsStore';
import { createUseDesignProjects } from '../../../lib/studio/designProjects';
import { resolvePrimaryImageFileId } from '../../../lib/studio/assetImage';
import AssetThumbnail from '../assets/AssetThumbnail';

const useAssets = createUseAssets(React);
const useDesignProjects = createUseDesignProjects(React);

export default function LinkedAssetsPanel({ projectId, primaryAssetObjectId, onOpenAssets, compact }) {
  const store = useAssets();
  const projects = useDesignProjects();

  if (!store.hydrated || !projects.hydrated) {
    return <div style={styles.loading}>טוען נכסים…</div>;
  }

  const project = projectId ? projects.projects.find((p) => p.id === projectId) : null;
  const projectLinkedIds = project && Array.isArray(project.linkedAssetObjectIds)
    ? project.linkedAssetObjectIds
    : [];

  const linked = store.objects.filter((o) => {
    if (!o || o.status === 'archived') return false;
    return o.linkedDesignProjectId === projectId || projectLinkedIds.includes(o.objectId);
  });

  return (
    <div style={styles.wrap} dir="rtl">
      <div style={styles.head}>
        <span style={styles.title}>{ASSET_FLOW_HE.linkedTitle}</span>
        {onOpenAssets && (
          <button type="button" onClick={onOpenAssets} style={styles.link}>
            ניהול בספרייה ←
          </button>
        )}
      </div>

      {linked.length === 0 ? (
        <p style={styles.empty}>{ASSET_FLOW_HE.linkedEmpty}</p>
      ) : (
        <div style={styles.list}>
          {linked.map((o) => {
            const fileList = store.filesByObject[o.objectId] || [];
            const approved = fileList.filter((f) => f.status === 'approved').length;
            const isPrimary = primaryAssetObjectId === o.objectId || (project && project.primaryAssetObjectId === o.objectId);
            const previewFileId = resolvePrimaryImageFileId(o, fileList);
            return (
              <div key={o.objectId} style={styles.row}>
                <AssetThumbnail
                  fileId={previewFileId}
                  getFileUrl={store.getFileUrl}
                  alt={o.title}
                  size={compact ? 38 : 46}
                />
                <div style={styles.idCol}>
                  <span style={styles.name}>
                    {o.title}
                    {isPrimary && <span style={styles.primaryBadge}>{ASSET_FLOW_HE.primaryBadge}</span>}
                  </span>
                  <span style={styles.sub}>
                    {ASSETS_OBJ_HE.objectType[o.objectType] || o.objectType}
                    {approved > 0 ? ` · ${ASSET_FLOW_HE.approvedCount(approved)}` : ''}
                    {o.linkedClientName ? ` · ${o.linkedClientName}` : ''}
                  </span>
                </div>
                {!compact && onOpenAssets && (
                  <button type="button" onClick={onOpenAssets} style={styles.openBtn}>
                    {ASSET_FLOW_HE.linkedOpenAsset}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '8px' },
  loading: { fontFamily: tokens.font.body, fontSize: '13px', color: tokens.color.inkFaint },
  head: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px' },
  title: { fontFamily: tokens.font.body, fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', color: tokens.color.inkSoft },
  link: { fontFamily: tokens.font.body, fontSize: '12px', fontWeight: 600, color: tokens.color.gold, background: 'transparent', border: 'none', cursor: 'pointer' },
  empty: { fontFamily: tokens.font.body, fontSize: '13px', color: tokens.color.inkFaint, margin: 0 },
  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  row: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
    padding: '10px 12px', background: tokens.color.ivory, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md,
  },
  idCol: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 },
  name: { fontFamily: tokens.font.body, fontSize: '14px', fontWeight: 600, color: tokens.color.charcoal, display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexWrap: 'wrap' },
  primaryBadge: { fontFamily: tokens.font.body, fontSize: '10px', fontWeight: 600, color: tokens.color.gold, background: tokens.color.goldFaint, borderRadius: '999px', padding: '2px 8px' },
  sub: { fontFamily: tokens.font.body, fontSize: '12px', color: tokens.color.inkFaint },
  openBtn: {
    minHeight: '38px', padding: '7px 14px', fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 600,
    color: tokens.color.inkSoft, background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md, cursor: 'pointer', whiteSpace: 'nowrap',
  },
};
