// components/studio/shared/CreativeAreaRail.js
//
// LESHEM.S OS — Clean 8K: Icon-First Workspace.
//
// A compact icon rail for the 5 main creative areas — אבנים / השראה /
// כיוונים / הדמיה / הצגה — each with one icon, one short Hebrew label, a
// tooltip on hover, and an active state. Inline SVG only (no icon package).
// This is a NEW, separate small rail — it does not replace or alter the
// existing components/studio/design/shell/StudioWorkflowRail.js (Clean
// 8H/8I/8J's own step indicator keeps working exactly as it did).
//
// PRESENTATIONAL only: the caller supplies `active` (a CREATIVE_AREA value
// or null) and `onSelect(area)`; all actual navigation/opening logic stays
// in the Design Studio shell.

import * as React from 'react';
import { reset } from '../design/shell/studioResetStyle';
import { CREATIVE_AREA, CREATIVE_AREA_HE } from '../../../lib/studio/humanTerms';

function StonesIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M8 3h8l4 5-10 13L2 8l6-5z" />
      <path d="M2 8h20M8 3l-2 5 6 13 6-13-2-5" />
    </svg>
  );
}

function ReferencesIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M4 4h11l5 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
      <path d="M15 4v5h5" />
      <path d="M8 13l2 2 4-4" />
    </svg>
  );
}

function DirectionsIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      <path d="M12 12l4-4" />
    </svg>
  );
}

function RenderIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="13" rx="1.5" />
      <path d="M3 15l5-4 4 3 4-5 5 6" />
      <circle cx="8" cy="9" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

function PresentationIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M4 4h16v10H4z" />
      <path d="M9 19h6M12 14v5" />
    </svg>
  );
}

const AREAS = [
  { key: CREATIVE_AREA.STONES, Icon: StonesIcon },
  { key: CREATIVE_AREA.REFERENCES, Icon: ReferencesIcon },
  { key: CREATIVE_AREA.DIRECTIONS, Icon: DirectionsIcon },
  { key: CREATIVE_AREA.RENDER, Icon: RenderIcon },
  { key: CREATIVE_AREA.PRESENTATION, Icon: PresentationIcon },
];

export default function CreativeAreaRail({ active, onSelect }) {
  return (
    <nav style={styles.rail} dir="rtl" aria-label="אזורי היצירה">
      {AREAS.map(({ key, Icon }) => {
        const he = CREATIVE_AREA_HE[key];
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect && onSelect(key)}
            title={he.tooltip}
            aria-label={he.tooltip}
            aria-current={isActive ? 'true' : undefined}
            style={{ ...styles.item, ...(isActive ? styles.itemActive : null) }}
          >
            <Icon size={16} />
            <span style={styles.itemLabel}>{he.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

const styles = {
  rail: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flexWrap: 'wrap',
  },
  item: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    minHeight: '32px',
    padding: '6px 10px',
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: reset.radius.sm,
    color: reset.color.textMuted,
    cursor: 'pointer',
    fontFamily: reset.font.body,
    fontSize: '11.5px',
    fontWeight: 700,
  },
  itemActive: {
    background: reset.color.page,
    border: `1px solid ${reset.color.borderStrong}`,
    color: reset.color.text,
  },
  itemLabel: { whiteSpace: 'nowrap' },
};
