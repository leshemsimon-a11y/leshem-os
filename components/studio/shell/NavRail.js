// components/studio/shell/NavRail.js
//
// LESHEM.S OS — Navigation Rail (Clean 1, responsive)
//
// A quiet, luminous navigation. Two variants share one implementation:
//   - "desktop": a sticky right-side rail (RTL)
//   - "mobile" : the same list rendered inside a slide-in drawer
//
// Grouped sections, RTL Hebrew labels, and an honest "בקרוב" badge on sections
// not yet built. Selecting an item updates the active section in the parent
// shell; on mobile it also closes the drawer via onSelect's side effect there.

import * as React from 'react';
import { tokens } from '../shared/tokens';
import { UI_HE } from '../../../lib/studio/labels';
import { NAV_GROUPS, itemsByGroup } from './navConfig';
import { createUseWorkTray } from '../../../lib/studio/workTray';

const useWorkTray = createUseWorkTray(React);

export default function NavRail({ active, onSelect, variant = 'desktop' }) {
  const isMobile = variant === 'mobile';
  const tray = useWorkTray();
  const trayCount = tray.hydrated ? tray.count : 0;

  return (
    <nav
      style={{ ...styles.rail, ...(isMobile ? styles.railMobile : null) }}
      dir="rtl"
      aria-label="ניווט ראשי"
    >
      <div style={styles.brand}>
        <span style={styles.brandMark} aria-hidden="true">
          ◆
        </span>
        <span style={styles.brandName}>{UI_HE.appName}</span>
        <span style={styles.brandTag}>{UI_HE.appTagline}</span>
      </div>

      <div style={styles.groups}>
        {NAV_GROUPS.map((group) => {
          const items = itemsByGroup(group.id);
          if (items.length === 0) return null;
          return (
            <div key={group.id} style={styles.group}>
              <div style={styles.groupLabel}>{group.labelHe}</div>
              {items.map((item) => {
                const isActive = item.id === active;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    style={{
                      ...styles.item,
                      ...(isActive ? styles.itemActive : null),
                    }}
                  >
                    <span style={styles.itemGlyph} aria-hidden="true">
                      {item.glyph}
                    </span>
                    <span style={styles.itemLabel}>{item.labelHe}</span>
                    {item.id === 'workTray' && trayCount > 0 && (
                      <span style={styles.itemCount}>{trayCount}</span>
                    )}
                    {!item.built && (
                      <span style={styles.itemBadge}>{UI_HE.futureBadge}</span>
                    )}
                    {isActive && <span style={styles.activeBar} aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

const styles = {
  rail: {
    width: '264px',
    flexShrink: 0,
    height: '100vh',
    position: 'sticky',
    top: 0,
    background: tokens.color.ivory,
    borderLeft: `1px solid ${tokens.color.cardEdge}`,
    padding: '28px 18px',
    boxSizing: 'border-box',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
  },
  // In the mobile drawer the rail fills the drawer; positioning is handled by
  // the drawer wrapper in StudioShell, so we relax sticky/height here.
  railMobile: {
    position: 'static',
    width: '100%',
    height: 'auto',
    minHeight: '100%',
    borderLeft: 'none',
  },
  brand: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gridTemplateRows: 'auto auto',
    columnGap: '12px',
    alignItems: 'center',
    padding: '4px 8px 20px',
    borderBottom: `1px solid ${tokens.color.cardEdge}`,
  },
  brandMark: {
    gridRow: '1 / span 2',
    fontSize: '22px',
    color: tokens.color.gold,
  },
  brandName: {
    fontFamily: tokens.font.display,
    fontSize: '20px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    color: tokens.color.charcoal,
  },
  brandTag: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.inkFaint,
    letterSpacing: '0.02em',
  },
  groups: {
    display: 'flex',
    flexDirection: 'column',
    gap: '22px',
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  groupLabel: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.12em',
    color: tokens.color.inkFaint,
    padding: '0 10px 8px',
  },
  item: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: '10px 12px',
    borderRadius: tokens.radius.sm,
    fontFamily: tokens.font.body,
    fontSize: '15px',
    color: tokens.color.ink,
    textAlign: 'right',
    transition: 'background 140ms ease, color 140ms ease',
  },
  itemActive: {
    background: tokens.color.canvas,
    color: tokens.color.charcoal,
    fontWeight: 600,
    boxShadow: tokens.shadow.soft,
  },
  itemGlyph: {
    width: '20px',
    textAlign: 'center',
    color: tokens.color.goldSoft,
    fontSize: '15px',
  },
  itemLabel: {
    flex: 1,
  },
  itemBadge: {
    fontFamily: tokens.font.body,
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: tokens.color.inkFaint,
    background: tokens.color.pearl,
    borderRadius: '999px',
    padding: '2px 8px',
  },
  itemCount: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '20px',
    height: '20px',
    padding: '0 6px',
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 700,
    color: tokens.color.ivory,
    background: tokens.color.gold,
    borderRadius: '999px',
  },
  activeBar: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: '3px',
    height: '20px',
    borderRadius: '999px',
    background: tokens.color.gold,
  },
};
