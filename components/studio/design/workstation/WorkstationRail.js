// components/studio/design/workstation/WorkstationRail.js
//
// LESHEM.S OS — Clean 6D: Studio Workstation Prototype — Zone 2.
//
// Left vertical tool rail — icon-first with short labels only:
// שולחן / אבנים / תפריט / כיוונים / בריף / פלט. Purely presentational: the
// shell owns which view is active and what each item does. Icons are reused
// from the EXISTING StudioIcons (not modified).

import * as React from 'react';
import { ws } from './wsStyle';
import { WS_HE } from './wsLabels';
import {
  HomeIcon,
  StoneIcon,
  DesignIcon,
  SparkIcon,
  BriefIcon,
  CopyIcon,
} from '../shell/StudioIcons';

const ITEMS = [
  { key: 'table', Icon: HomeIcon },
  { key: 'stones', Icon: StoneIcon },
  { key: 'menu', Icon: DesignIcon },
  { key: 'directions', Icon: SparkIcon },
  { key: 'brief', Icon: BriefIcon },
  { key: 'output', Icon: CopyIcon },
];

export default function WorkstationRail({ active, menuOpen, onSelect }) {
  return (
    <nav style={styles.rail} dir="rtl" aria-label={WS_HE.title}>
      {ITEMS.map(({ key, Icon }) => {
        const isActive = key === 'menu' ? menuOpen : active === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect && onSelect(key)}
            style={{ ...styles.item, ...(isActive ? styles.itemActive : null) }}
            aria-pressed={isActive ? 'true' : 'false'}
            title={WS_HE.rail[key]}
          >
            <span style={{ ...styles.icon, ...(isActive ? styles.iconActive : null) }}>
              <Icon size={17} />
            </span>
            <span style={styles.itemLabel}>{WS_HE.rail[key]}</span>
          </button>
        );
      })}
    </nav>
  );
}

const styles = {
  rail: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '6px',
    padding: '10px 8px',
    borderRadius: ws.radius.lg,
    background: ws.color.surface,
    border: `1px solid ${ws.color.border}`,
    boxShadow: ws.shadow.card,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    width: '78px',
    flexShrink: 0,
    alignSelf: 'start',
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '9px 4px',
    borderRadius: ws.radius.md,
    border: '1px solid transparent',
    background: 'transparent',
    cursor: 'pointer',
  },
  itemActive: {
    border: `1px solid ${ws.color.gold}`,
    background: ws.color.goldFaint,
  },
  icon: {
    display: 'inline-flex',
    color: ws.color.textMuted,
  },
  iconActive: {
    color: ws.color.gold,
  },
  itemLabel: {
    fontFamily: ws.font.body,
    fontSize: '10.5px',
    fontWeight: 700,
    color: ws.color.text,
    whiteSpace: 'nowrap',
  },
};
