// components/studio/shell/StudioShell.js
//
// LESHEM.S OS — Studio Shell (Clean 1, responsive)
//
// Top-level layout. Loads brand fonts and routes the active section to either
// the dashboard home or an honest future state.
//
// Responsive behavior (no packages, no routing changes):
//   - Desktop (> 880px): sticky right-side nav rail beside the content.
//   - Mobile  (<= 880px): a compact top bar with a menu button. Tapping it
//     opens a slide-in drawer holding the same nav. Content is never crushed
//     by the rail; it uses the full width and the drawer overlays on demand.

import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { tokens, FONT_HREF } from '../shared/tokens';
import useIsMobile from '../shared/useIsMobile';
import FutureSection from '../shared/FutureSection';
import NavRail from './NavRail';
import DashboardHome from './DashboardHome';
import UnifiedDashboard from './UnifiedDashboard';
import WorkTrayIndicator from '../tray/WorkTrayIndicator';
import { findItem } from './navConfig';
import { UI_HE } from '../../../lib/studio/labels';

export default function StudioShell({
  initialSection = 'dashboard',
  // Optional content override for built sub-pages (e.g. /studio/inventory).
  // When provided and the active section matches `initialSection`, this is
  // rendered instead of the default section content. Navigating to another
  // section still falls back to the default content/future-state behavior.
  renderContent = null,
}) {
  const [active, setActive] = useState(initialSection);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile(880);
  const router = useRouter();
  const item = findItem(active);

  // Sections that have a dedicated /studio sub-page route.
  const SECTION_ROUTES = {
    dashboard: '/studio',
    inventory: '/studio/inventory',
    workTray: '/studio/tray',
    builder: '/studio/design',
    projects: '/studio/projects',
  };

  const handleSelect = (id) => {
    setDrawerOpen(false);
    const route = SECTION_ROUTES[id];
    // If the section has its own route and we're not already there, navigate.
    if (route && route !== router.pathname) {
      router.push(route);
      return;
    }
    // Otherwise switch the active section in-page (future states, dashboard).
    setActive(id);
  };

  const Content = () => {
    if (renderContent && active === initialSection) {
      return renderContent();
    }
    if (item && item.built) {
      return <UnifiedDashboard />;
    }
    return (
      <FutureSection
        titleHe={item ? item.labelHe : ''}
        descriptionHe={item ? item.descHe : ''}
      />
    );
  };

  return (
    <>
      <Head>
        <title>LESHEM.S OS — Studio</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONT_HREF} />
      </Head>

      {isMobile ? (
        // ---------- Mobile layout ----------
        <div style={styles.mobileRoot}>
          <header style={styles.topBar} dir="rtl">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label={UI_HE.menu}
              aria-expanded={drawerOpen}
              style={styles.menuButton}
            >
              <span aria-hidden="true" style={styles.menuGlyph}>
                ☰
              </span>
            </button>
            <span style={styles.topBrand}>{UI_HE.appName}</span>
            <span style={styles.topSection}>
              {item ? item.labelHe : ''}
            </span>
          </header>

          <main style={styles.mobileMain}>
            <div style={styles.mobileContentWrap}>
              <Content />
            </div>
          </main>

          {/* Always-nearby Work Tray shortcut (shown only when tray has items) */}
          <WorkTrayIndicator variant="mobile" />

          {drawerOpen && (
            <>
              <div
                style={styles.backdrop}
                onClick={() => setDrawerOpen(false)}
                aria-hidden="true"
              />
              <div style={styles.drawer} role="dialog" aria-modal="true">
                <div style={styles.drawerHeader} dir="rtl">
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    aria-label={UI_HE.close}
                    style={styles.closeButton}
                  >
                    ✕
                  </button>
                </div>
                <NavRail active={active} onSelect={handleSelect} variant="mobile" />
              </div>
            </>
          )}
        </div>
      ) : (
        // ---------- Desktop layout ----------
        <div style={styles.desktopRoot}>
          <NavRail active={active} onSelect={handleSelect} variant="desktop" />
          <main style={styles.desktopMain}>
            <div style={styles.desktopContentWrap}>
              <WorkTrayIndicator variant="desktop" />
              <Content />
            </div>
          </main>
        </div>
      )}

      {/* Global resets scoped to the studio, kept minimal and non-invasive. */}
      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          background: ${tokens.color.ivory};
        }
        * {
          box-sizing: border-box;
        }
        button:focus-visible {
          outline: 2px solid ${tokens.color.focusRing};
          outline-offset: 2px;
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}

const styles = {
  // Desktop
  desktopRoot: {
    display: 'flex',
    flexDirection: 'row-reverse', // RTL: rail on the right
    minHeight: '100vh',
    background: tokens.color.ivory,
    fontFamily: tokens.font.body,
  },
  desktopMain: {
    flex: 1,
    minWidth: 0,
    background: tokens.color.ivory,
    overflowX: 'hidden',
  },
  desktopContentWrap: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '48px 40px 80px',
  },

  // Mobile
  mobileRoot: {
    minHeight: '100vh',
    background: tokens.color.ivory,
    fontFamily: tokens.font.body,
  },
  topBar: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    height: '58px',
    padding: '0 16px',
    background: tokens.color.ivory,
    borderBottom: `1px solid ${tokens.color.cardEdge}`,
  },
  menuButton: {
    border: `1px solid ${tokens.color.cardEdge}`,
    background: tokens.color.canvas,
    borderRadius: tokens.radius.sm,
    width: '38px',
    height: '38px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.color.charcoal,
  },
  menuGlyph: {
    fontSize: '16px',
    lineHeight: 1,
  },
  topBrand: {
    fontFamily: tokens.font.display,
    fontSize: '18px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    color: tokens.color.charcoal,
  },
  topSection: {
    marginInlineStart: 'auto',
    fontFamily: tokens.font.body,
    fontSize: '13px',
    color: tokens.color.inkFaint,
  },
  mobileMain: {
    background: tokens.color.ivory,
    overflowX: 'hidden',
  },
  mobileContentWrap: {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '28px 20px 64px',
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 30,
    background: 'rgba(43,40,36,0.32)',
  },
  drawer: {
    position: 'fixed',
    top: 0,
    right: 0, // RTL: drawer slides from the right
    bottom: 0,
    zIndex: 31,
    width: 'min(82vw, 300px)',
    background: tokens.color.ivory,
    boxShadow: tokens.shadow.lift,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  drawerHeader: {
    display: 'flex',
    justifyContent: 'flex-start',
    padding: '12px 14px 0',
  },
  closeButton: {
    border: 'none',
    background: 'transparent',
    fontSize: '18px',
    cursor: 'pointer',
    color: tokens.color.inkSoft,
    width: '34px',
    height: '34px',
    borderRadius: tokens.radius.sm,
  },
};
