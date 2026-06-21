// components/studio/assets/AssetThumbnail.js
//
// LESHEM.S OS — Asset Thumbnail (Clean 4B.4a)
//
// Resolves a stored image file (by fileId) to a short-lived object URL and
// renders it inside a consistent square frame. Used by the Asset Library card
// cover and the cover selector. If no fileId / blob is available it shows a
// neutral glyph placeholder. The object URL is revoked on unmount / change.
// Local only — no network, no Airtable, no new packages.

import { useEffect, useState } from 'react';
import { tokens } from '../shared/tokens';

export default function AssetThumbnail({
  fileId,
  getFileUrl,
  alt,
  size = 64,
  radius = tokens.radius.md,
  fit = 'cover',
  glyph = '▣',
}) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let active = true;
    let created = null;
    setUrl(null);
    if (!fileId || typeof getFileUrl !== 'function') return undefined;
    (async () => {
      try {
        const u = await getFileUrl(fileId);
        if (!active) {
          if (u) {
            try { URL.revokeObjectURL(u); } catch (e) { /* noop */ }
          }
          return;
        }
        created = u;
        setUrl(u);
      } catch (e) {
        /* ignore — show placeholder */
      }
    })();
    return () => {
      active = false;
      if (created) {
        try { URL.revokeObjectURL(created); } catch (e) { /* noop */ }
      }
    };
  }, [fileId, getFileUrl]);

  const frame = {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
    borderRadius: radius,
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.cardEdge}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  };

  if (url) {
    return (
      <span style={frame} aria-hidden={alt ? undefined : 'true'}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={alt || ''}
          style={{ width: '100%', height: '100%', objectFit: fit, display: 'block' }}
        />
      </span>
    );
  }

  return (
    <span style={frame} aria-hidden="true">
      <span style={{ fontSize: '20px', color: tokens.color.goldSoft }}>{glyph}</span>
    </span>
  );
}
