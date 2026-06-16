// components/studio/media/MediaPreview.js
//
// LESHEM.S OS — Media Preview (Clean 2)
//
// Renders an image if one exists and loads successfully; otherwise falls back
// to the elegant placeholder. Handles broken URLs gracefully (onError) so a
// dead Airtable attachment link never shows a broken-image icon.
//
// Plain <img> on purpose: Airtable attachment URLs are external/expiring and
// next/image would require remote-domain config we are not permitted to add.

import { useState, useEffect } from 'react';
import { tokens } from '../shared/tokens';
import MediaPlaceholder from './MediaPlaceholder';

export default function MediaPreview({
  src,
  alt = '',
  height = 200,
  rounded = true,
  cover = true,
}) {
  const [failed, setFailed] = useState(false);

  // Reset failure state if the src changes (e.g. drawer opens a new stone).
  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return <MediaPlaceholder height={height} />;
  }

  return (
    <div
      style={{
        ...styles.frame,
        height,
        borderRadius: rounded ? tokens.radius.md : 0,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        style={{
          ...styles.img,
          objectFit: cover ? 'cover' : 'contain',
        }}
      />
    </div>
  );
}

const styles = {
  frame: {
    width: '100%',
    overflow: 'hidden',
    background: tokens.color.pearl,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    width: '100%',
    height: '100%',
    display: 'block',
  },
};
