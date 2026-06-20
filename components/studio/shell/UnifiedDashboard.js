// components/studio/shell/UnifiedDashboard.js
//
// LESHEM.S OS — Unified Dashboard (Clean 4A)
//
// The single, clear entry surface for the whole system. Replaces the quiet
// Clean 1 welcome as the default "built" section content. It offers four
// elegant, tap-friendly tiles that navigate to the core areas of the OS:
//   • Inventory / מלאי
//   • Work Tray / מגש עבודה
//   • Design Studio / סטודיו עיצוב
//   • Design Projects / תיקי עיצוב
//
// Visual language: ivory/pearl, charcoal type, soft gold accents — luxury,
// calm, mobile-first. No commerce wording (no cart / basket / checkout). No
// Airtable, no network, no new packages.

import { useRouter } from 'next/router';
import { tokens } from '../shared/tokens';
import { DASHBOARD_HE } from '../../../lib/studio/labels';

const TILES = [
  { key: 'inventory', route: '/studio/inventory' },
  { key: 'workTray', route: '/studio/tray' },
  { key: 'design', route: '/studio/design' },
  { key: 'projects', route: '/studio/projects' },
];

export default function UnifiedDashboard() {
  const router = useRouter();
  const T = DASHBOARD_HE.tiles;

  return (
    <div dir="rtl">
      <header style={styles.header}>
        <span style={styles.eyebrow}>{DASHBOARD_HE.eyebrow}</span>
        <h1 style={styles.title}>{DASHBOARD_HE.title}</h1>
        <p style={styles.lede}>{DASHBOARD_HE.lede}</p>
      </header>

      <div style={styles.grid}>
        {TILES.map(({ key, route }) => {
          const tile = T[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => router.push(route)}
              style={styles.tile}
            >
              <span style={styles.tileGlyph} aria-hidden="true">
                {tile.glyph}
              </span>
              <span style={styles.tileTitle}>{tile.title}</span>
              <span style={styles.tileDesc}>{tile.desc}</span>
              <span style={styles.tileGo} aria-hidden="true">
                כניסה ←
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  header: {
    marginBottom: '24px',
  },
  eyebrow: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: tokens.color.gold,
  },
  title: {
    fontFamily: tokens.font.display,
    fontWeight: 700,
    fontSize: '36px',
    color: tokens.color.charcoal,
    margin: '8px 0 12px',
  },
  lede: {
    fontFamily: tokens.font.body,
    fontSize: '15px',
    lineHeight: 1.7,
    color: tokens.color.inkSoft,
    margin: 0,
    maxWidth: '560px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  tile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '8px',
    textAlign: 'right',
    padding: '22px',
    minHeight: '160px',
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.lg,
    boxShadow: tokens.shadow.soft,
    cursor: 'pointer',
    transition: 'border-color 140ms ease, box-shadow 140ms ease, transform 140ms ease',
  },
  tileGlyph: {
    fontSize: '26px',
    lineHeight: 1,
    color: tokens.color.gold,
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.goldSoft}`,
    borderRadius: tokens.radius.md,
    width: '46px',
    height: '46px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '6px',
  },
  tileTitle: {
    fontFamily: tokens.font.display,
    fontWeight: 700,
    fontSize: '20px',
    color: tokens.color.charcoal,
  },
  tileDesc: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
    flex: 1,
  },
  tileGo: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.color.gold,
    marginTop: '4px',
  },
};
