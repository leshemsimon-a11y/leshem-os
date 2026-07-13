// components/studio/shell/NavRail.js
//
// LESHEM.S OS — Navigation Rail (Clean 1, responsive)
//
// A quiet, luminous navigation. Two variants share one implementation:
//   - "desktop": a sticky right-side rail (RTL)
//   - "mobile" : the same list rendered inside a slide-in drawer
//
// Patch C — OS Hardening V1: the primary nav now shows ONLY built, live
// destinations (Command Center, Inventory, Work Tray, Design Studio,
// תיקי עבודה, Asset Library) as one flat list — no group headers, no
// "בקרוב" spam. All not-yet-built sections still exist in navConfig.js
// (nothing deleted, no route removed) but render inside ONE quiet,
// collapsed "כלים עתידיים" area at the bottom, closed by default. Selecting
// any item still routes through the same onSelect flow as before.

import * as React from 'react';
import { tokens } from '../shared/tokens';
import { UI_HE } from '../../../lib/studio/labels';
import { NAV_ITEMS } from './navConfig';
import { createUseWorkTray } from '../../../lib/studio/workTray';

const useWorkTray = createUseWorkTray(React);

export default function NavRail({ active, onSelect, variant = 'desktop' }) {
  const isMobile = variant === 'mobile';
  const tray = useWorkTray();
  const trayCount = tray.hydrated ? tray.count : 0;
  // Clean 8K-R2 — secondary/professional tools stay reachable but folded
  // away; closed by default. (Renamed from "future tools": this group now
  // also holds fully BUILT, working destinations that are simply no longer
  // part of the reduced primary navigation — see navConfig.js's `primary`
  // flag. Nothing here was deleted or made unreachable.)
  const [secondaryOpen, setSecondaryOpen] = React.useState(false);

  const primaryItems = NAV_ITEMS.filter((item) => item.primary);
  const secondaryItems = NAV_ITEMS.filter((item) => !item.primary);

  const renderItem = (item, { quiet = false } = {}) => {
    const isActive = item.id === active;
    // The "בקרוב" badge is about BUILD STATUS only, never about primary vs
    // secondary placement — a built-but-secondary item (e.g. the legacy
    // dashboard) must never look unbuilt.
    const showFutureBadge = !item.built;
    const quietStyle = quiet || !item.built;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => onSelect(item.id)}
        aria-current={isActive ? 'page' : undefined}
        style={{
          ...styles.item,
          ...(quietStyle ? styles.itemFuture : null),
          ...(isActive ? styles.itemActive : null),
        }}
      >
        <span style={{ ...styles.itemGlyph, ...(quietStyle ? styles.itemGlyphFuture : null) }} aria-hidden="true">
          {item.glyph}
        </span>
        <span style={styles.itemLabel}>{item.labelHe}</span>
        {item.id === 'workTray' && trayCount > 0 && (
          <span style={styles.itemCount}>{trayCount}</span>
        )}
        {showFutureBadge && <span style={styles.itemBadge}>{UI_HE.futureBadge}</span>}
        {isActive && <span style={styles.activeBar} aria-hidden="true" />}
      </button>
    );
  };

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
        <div style={styles.group}>
          {primaryItems.map((item) => renderItem(item, { quiet: false }))}
        </div>

        {secondaryItems.length > 0 && (
          <div style={styles.group}>
            <button
              type="button"
              onClick={() => setSecondaryOpen((v) => !v)}
              aria-expanded={secondaryOpen}
              title="מסכים מקצועיים נוספים"
              style={styles.futureToggle}
            >
              <span style={styles.futureToggleLabel}>כלים נוספים</span>
              <span style={styles.futureToggleChevron} aria-hidden="true">
                {secondaryOpen ? '▾' : '◂'}
              </span>
            </button>
            {secondaryOpen && secondaryItems.map((item) => renderItem(item, { quiet: true }))}
          </div>
        )}
      </div>
    </nav>
  );
}

const styles = {
  rail: {
    width: '240px',
    flexShrink: 0,
    height: '100vh',
    position: 'sticky',
    top: 0,
    background: tokens.color.ivory,
    borderLeft: `1px solid ${tokens.color.cardEdge}`,
    padding: '20px 14px',
    boxSizing: 'border-box',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '22px',
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
  // Patch C — collapsed "כלים עתידיים" toggle: reads as a quiet secondary
  // control, not a primary destination.
  futureToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    width: '100%',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: '8px 10px',
    borderRadius: tokens.radius.sm,
    fontFamily: tokens.font.body,
    textAlign: 'right',
  },
  futureToggleLabel: {
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: tokens.color.inkFaint,
  },
  futureToggleChevron: {
    fontSize: '11px',
    color: tokens.color.inkFaint,
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
  // Global Visual Upgrade V1 — not-yet-built sections read as a quieter,
  // more compact secondary list (less clutter) rather than full-weight
  // items. Same onClick/navigation as before — visual only.
  itemFuture: {
    padding: '7px 12px',
    fontSize: '13px',
    color: tokens.color.inkFaint,
  },
  itemGlyphFuture: {
    color: tokens.color.inkFaint,
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
