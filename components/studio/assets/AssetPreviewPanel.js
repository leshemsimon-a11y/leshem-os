// components/studio/assets/AssetPreviewPanel.js
//
// LESHEM.S OS — Asset Preview Panel (Clean 4B.1)
//
// Renders a preview for a single AssetFile by fetching its Blob from IndexedDB
// as a short-lived object URL:
//   • image  → <img>
//   • video  → <video controls>
//   • model3d→ Asset3DViewer (Three.js via CDN, graceful fallback)
//   • pdf    → open-in-new-tab card (no PDF generation; just a link)
//   • other  → simple file card
// The object URL is revoked on unmount / file change. Local only.

import { useEffect, useState } from 'react';
import { tokens } from '../shared/tokens';
import { ASSETS_OBJ_HE } from '../../../lib/studio/labels';
import { FILE_KIND } from '../../../lib/studio/assetsStore';
import Asset3DViewer from './Asset3DViewer';

export default function AssetPreviewPanel({ file, getFileUrl }) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let created = null;
    setLoading(true);
    setUrl(null);
    (async () => {
      try {
        const u = await getFileUrl(file.fileId);
        if (!active) {
          if (u) URL.revokeObjectURL(u);
          return;
        }
        created = u;
        setUrl(u);
      } catch (e) {
        // ignore — show not-stored card below
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      if (created) {
        try {
          URL.revokeObjectURL(created);
        } catch (e) {
          /* noop */
        }
      }
    };
  }, [file.fileId, getFileUrl]);

  const purposeHe =
    file.filePurpose && file.filePurpose !== 'none'
      ? ASSETS_OBJ_HE.filePurpose[file.filePurpose]
      : null;

  if (loading) {
    return <div style={styles.message}>{ASSETS_OBJ_HE.viewer3dLoading}</div>;
  }

  if (!url) {
    return <div style={styles.message}>{ASSETS_OBJ_HE.notStored}</div>;
  }

  // 3D handled by the dedicated viewer only AFTER the IndexedDB Blob URL is
  // available. Previously the viewer rendered once with url=null, switched
  // itself to an error state, and then had no canvas mounted when the real URL
  // arrived — so STL/OBJ previews stayed stuck on the generic error message.
  if (file.fileKind === FILE_KIND.MODEL_3D) {
    return (
      <Asset3DViewer
        url={url}
        extension={file.extension}
        fileName={file.fileName}
        purposeHe={purposeHe}
      />
    );
  }

  if (file.fileKind === FILE_KIND.IMAGE) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={file.fileName} style={styles.image} />;
  }

  if (file.fileKind === FILE_KIND.VIDEO) {
    return <video src={url} controls style={styles.video} />;
  }

  if (file.fileKind === FILE_KIND.PDF) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" style={styles.pdfCard} dir="rtl">
        <span style={styles.pdfGlyph} aria-hidden="true">❉</span>
        <span style={styles.pdfName}>{file.fileName}</span>
        <span style={styles.pdfOpen}>פתיחה ←</span>
      </a>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={styles.pdfCard} dir="rtl">
      <span style={styles.pdfGlyph} aria-hidden="true">▣</span>
      <span style={styles.pdfName}>{file.fileName}</span>
      <span style={styles.pdfOpen}>פתיחה ←</span>
    </a>
  );
}

const styles = {
  image: {
    width: '100%',
    maxHeight: '360px',
    objectFit: 'contain',
    borderRadius: tokens.radius.md,
    background: tokens.color.pearl,
  },
  video: {
    width: '100%',
    maxHeight: '360px',
    borderRadius: tokens.radius.md,
    background: '#000',
  },
  pdfCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    padding: '16px',
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
  },
  pdfGlyph: {
    fontSize: '24px',
    color: tokens.color.gold,
  },
  pdfName: {
    flex: 1,
    fontFamily: tokens.font.body,
    fontSize: '14px',
    color: tokens.color.charcoal,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  pdfOpen: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.color.gold,
  },
  message: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
    background: tokens.color.canvas,
    border: `1px dashed ${tokens.color.goldSoft}`,
    borderRadius: tokens.radius.sm,
    padding: '18px',
    textAlign: 'center',
  },
};
