// components/studio/assets/AssetFilesPanel.js
//
// LESHEM.S OS — Asset Files Panel (Clean 4B.1)
//
// Lists all files of one Asset Object as compact rows: kind glyph, name,
// purpose, approved badge, and actions (preview toggle, approve, archive /
// restore). Honors filters passed from the parent. Expanding a row mounts the
// AssetPreviewPanel for that file. Local only.

import { useState } from 'react';
import { tokens } from '../shared/tokens';
import { ASSETS_OBJ_HE, DELETE_HE } from '../../../lib/studio/labels';
import { filterFiles } from '../../../lib/studio/assetsStore';
import AssetPreviewPanel from './AssetPreviewPanel';

const KIND_GLYPH = {
  image: '▣',
  video: '▶',
  model3d: '◫',
  pdf: '❉',
  sketch: '✎',
  render: '▦',
  document: '▤',
  other: '◇',
};

export default function AssetFilesPanel({
  files,
  filters,
  getFileUrl,
  onApprove,
  onArchiveFile,
  onUnarchiveFile,
  onSetPurpose,
  onPermanentDeleteFile,
}) {
  const [openId, setOpenId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const visible = filterFiles(files, {
    fileKind: filters.fileKind,
    filePurpose: filters.filePurpose,
    status: filters.status,
    includeArchived: filters.includeArchived,
  });

  if (visible.length === 0) {
    return <p style={styles.empty}>{ASSETS_OBJ_HE.noFiles}</p>;
  }

  return (
    <div style={styles.list} dir="rtl">
      {visible.map((f) => {
        const approved = f.status === 'approved';
        const archived = f.status === 'archived';
        const isOpen = openId === f.fileId;
        return (
          <div
            key={f.fileId}
            style={{ ...styles.row, ...(approved ? styles.rowApproved : null) }}
          >
            <div style={styles.head}>
              <span style={styles.kindGlyph} aria-hidden="true">
                {KIND_GLYPH[f.fileKind] || '◇'}
              </span>
              <div style={styles.idCol}>
                <span style={styles.name} title={f.fileName}>{f.fileName}</span>
                <span style={styles.sub}>
                  {ASSETS_OBJ_HE.fileKind[f.fileKind]}
                  {f.filePurpose && f.filePurpose !== 'none'
                    ? ` · ${ASSETS_OBJ_HE.filePurpose[f.filePurpose]}`
                    : ''}
                </span>
              </div>
              {approved && <span style={styles.approvedBadge}>{ASSETS_OBJ_HE.approved}</span>}
              {archived && <span style={styles.archivedBadge}>{ASSETS_OBJ_HE.fileKind ? 'בארכיון' : ''}</span>}
            </div>

            <div style={styles.actions}>
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : f.fileId)}
                style={styles.ghost}
              >
                {isOpen ? ASSETS_OBJ_HE.hidePreview : ASSETS_OBJ_HE.preview}
              </button>
              {!approved && !archived && (
                <button type="button" onClick={() => onApprove(f.fileId)} style={styles.ghost}>
                  {ASSETS_OBJ_HE.approve}
                </button>
              )}
              {archived ? (
                <button type="button" onClick={() => onUnarchiveFile(f.fileId)} style={styles.ghost}>
                  {ASSETS_OBJ_HE.unarchiveFile}
                </button>
              ) : (
                <button type="button" onClick={() => onArchiveFile(f.fileId)} style={styles.ghost}>
                  {ASSETS_OBJ_HE.archiveFile}
                </button>
              )}
              {archived && onPermanentDeleteFile && (
                <button type="button" onClick={() => setConfirmId(f.fileId)} style={styles.danger}>
                  {DELETE_HE.permanentDelete}
                </button>
              )}
            </div>

            {confirmId === f.fileId && (
              <div style={styles.confirmBox}>
                <p style={styles.confirmBody}>{DELETE_HE.confirmFileBody}</p>
                <div style={styles.confirmRow}>
                  <button type="button" onClick={() => setConfirmId(null)} style={styles.ghost}>
                    {DELETE_HE.confirmNo}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onPermanentDeleteFile(f.fileId);
                      setConfirmId(null);
                    }}
                    style={styles.danger}
                  >
                    {DELETE_HE.confirmYes}
                  </button>
                </div>
              </div>
            )}

            {isOpen && (
              <div style={styles.previewWrap}>
                <AssetPreviewPanel file={f} getFileUrl={getFileUrl} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  danger: { minHeight: '40px', padding: '8px 14px', fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 600, color: '#8c2f2f', background: 'transparent', border: '1px solid #c9a3a3', borderRadius: tokens.radius.md, cursor: 'pointer' },
  confirmBox: { marginTop: '8px', padding: '12px', background: '#faf3f3', border: '1px solid #c9a3a3', borderRadius: tokens.radius.md },
  confirmBody: { fontFamily: tokens.font.body, fontSize: '13px', lineHeight: 1.6, color: tokens.color.charcoal, margin: '0 0 10px' },
  confirmRow: { display: 'flex', gap: '8px' },
  list: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' },
  row: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px',
    background: tokens.color.ivory,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
  },
  rowApproved: {
    border: `1px solid ${tokens.color.sage}`,
    background: tokens.color.sageFaint,
  },
  head: { display: 'flex', alignItems: 'center', gap: '10px' },
  kindGlyph: { fontSize: '20px', color: tokens.color.goldSoft, flexShrink: 0 },
  idCol: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 },
  name: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.color.charcoal,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sub: { fontFamily: tokens.font.body, fontSize: '12px', color: tokens.color.inkFaint },
  approvedBadge: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.color.charcoal,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.sage}`,
    borderRadius: '999px',
    padding: '2px 10px',
    whiteSpace: 'nowrap',
  },
  archivedBadge: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    color: tokens.color.inkFaint,
    whiteSpace: 'nowrap',
  },
  actions: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  ghost: {
    minHeight: '40px',
    padding: '8px 14px',
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.color.inkSoft,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
  },
  previewWrap: { marginTop: '4px' },
  empty: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    color: tokens.color.inkFaint,
    margin: '8px 0',
  },
};
