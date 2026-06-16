// components/studio/media/MediaPlaceholder.js
//
// LESHEM.S OS — Media Placeholder (Clean 2)
//
// Shown when a stone has no image. Deliberately elegant — a soft ivory field
// with a faint gold facet mark — so an imageless card still reads as a luxury
// display tray, never a broken image.

import { tokens } from '../shared/tokens';

export default function MediaPlaceholder({ height = 200, label = null }) {
  return (
    <div style={{ ...styles.wrap, height }} aria-hidden={label ? undefined : true}>
      <svg
        width="46"
        height="46"
        viewBox="0 0 46 46"
        fill="none"
        style={styles.mark}
      >
        <path
          d="M23 3 L40 17 L23 43 L6 17 Z"
          stroke={tokens.color.goldSoft}
          strokeWidth="1.4"
          fill="none"
        />
        <path
          d="M6 17 L40 17 M23 3 L16 17 L23 43 M23 3 L30 17 L23 43"
          stroke={tokens.color.goldFaint}
          strokeWidth="1"
          fill="none"
        />
      </svg>
      {label && <span style={styles.label}>{label}</span>}
    </div>
  );
}

const styles = {
  wrap: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    background: `linear-gradient(135deg, ${tokens.color.pearl} 0%, ${tokens.color.ivory} 100%)`,
    borderRadius: tokens.radius.md,
  },
  mark: {
    opacity: 0.9,
  },
  label: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.inkFaint,
    letterSpacing: '0.04em',
  },
};
