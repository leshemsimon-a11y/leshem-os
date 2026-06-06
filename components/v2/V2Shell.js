/**
 * LESHEM.S OS — v2 Shell — v2.4
 * Outer layout, navigation, screen routing via React state.
 * No Next.js routing changes. Isolated from MVP.
 *
 * v2.4: registers the 'builder' screen (JewelryBuilder). The Work Tray's
 * "התחל בניית תכשיט" flow creates a draft in WorkTray context and calls
 * onOpenBuilder to switch to it. The Builder nav entry appears only while a
 * draft is active, keeping navigation uncluttered when there is nothing to build.
 */

import { useState } from 'react';
import styles from './V2Shell.module.css';
import { WorkTrayProvider, useWorkTray } from '../../lib/v2/workTrayContext';
import InventoryStudio from './screens/InventoryStudio';
import StudioDashboard from './screens/StudioDashboard';
import JewelryBuilder from './screens/JewelryBuilder';
import WorkTray from './WorkTray';

// Screens available in v2
const SCREENS = {
  dashboard: 'dashboard',
  inventory: 'inventory',
  builder:   'builder',
};

function ShellInner() {
  const [currentScreen, setCurrentScreen] = useState(SCREENS.dashboard);
  const [trayOpen, setTrayOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const { itemCount, totalCaratWeight, currentDraft } = useWorkTray();

  const hasDraft = !!currentDraft;

  const navItems = [
    {
      id: SCREENS.dashboard,
      label: 'לוח בקרה',
      icon: '◈',
      screen: SCREENS.dashboard,
    },
    {
      id: SCREENS.inventory,
      label: 'מלאי',
      icon: '◇',
      screen: SCREENS.inventory,
    },
    // Builder nav entry appears only while a draft is active
    ...(hasDraft
      ? [{
          id: SCREENS.builder,
          label: 'בניית תכשיט',
          icon: '✦',
          screen: SCREENS.builder,
        }]
      : []),
  ];

  // External links — navigate to existing MVP screens
  const externalLinks = [
    { label: 'מחשבון (MVP)', icon: '⊞', href: '/' },
    { label: 'תעודות (MVP)', icon: '◻', href: '/' },
  ];

  const hasTrayItems = itemCount > 0;

  return (
    <div className={styles.shell}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerLogo}>
          <div>
            <div className={styles.logoText}>LESHEM.S</div>
            <div className={styles.logoSub}>OS · v2</div>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button
            className={`${styles.trayButton} ${hasTrayItems ? styles.trayButtonActive : ''}`}
            onClick={() => setTrayOpen(true)}
            aria-label="פתח מגש עבודה"
          >
            <span>◈</span>
            <span>מגש עבודה</span>
            {hasTrayItems && (
              <span className={styles.trayBadge}>{itemCount}</span>
            )}
          </button>
        </div>
      </header>

      <div className={styles.layout}>
        {/* ── Sidebar (desktop) ── */}
        <nav className={styles.sidebar}>
          <div className={styles.navSection}>
            <div className={styles.navSectionLabel}>סטודיו</div>
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`${styles.navItem} ${
                  currentScreen === item.screen ? styles.navItemActive : ''
                }`}
                onClick={() => setCurrentScreen(item.screen)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className={styles.navSection}>
            <div className={styles.navSectionLabel}>כלים</div>
            {externalLinks.map((link) => (
              <a
                key={link.href}
                className={styles.navItem}
                href={link.href}
              >
                <span className={styles.navIcon}>{link.icon}</span>
                <span>{link.label}</span>
              </a>
            ))}
          </div>

          <div className={styles.navSection} style={{ marginTop: 'auto' }}>
            <div className={styles.navSectionLabel}>מערכת</div>
            <a className={styles.navItem} href="/">
              <span className={styles.navIcon}>←</span>
              <span>חזור ל-MVP</span>
            </a>
          </div>
        </nav>

        {/* ── Main Content ── */}
        <main className={styles.main}>
          {currentScreen === SCREENS.dashboard && (
            <StudioDashboard
              onNavigate={setCurrentScreen}
              onOpenTray={() => setTrayOpen(true)}
            />
          )}
          {currentScreen === SCREENS.inventory && (
            <InventoryStudio
              onOpenTray={() => setTrayOpen(true)}
            />
          )}
          {currentScreen === SCREENS.builder && (
            <JewelryBuilder
              onBackToInventory={() => setCurrentScreen(SCREENS.inventory)}
            />
          )}
        </main>
      </div>

      {/* ── Work Tray panel ── */}
      {trayOpen && (
        <>
          <div
            className={styles.overlay}
            onClick={() => setTrayOpen(false)}
          />
          <WorkTray
            onClose={() => setTrayOpen(false)}
            onOpenBuilder={() => setCurrentScreen(SCREENS.builder)}
          />
        </>
      )}

      {/* ── Mobile: persistent tray bar ── */}
      <div
        className={`${styles.trayMobileBar} ${
          !hasTrayItems ? styles.trayMobileBarHidden : ''
        }`}
      >
        <div className={styles.trayMobileInfo} dir="rtl">
          <span className={styles.trayMobileInfoStrong}>{itemCount}</span>
          {' פריטים ·  '}
          <span className={styles.trayMobileInfoStrong}>
            {totalCaratWeight}
          </span>
          {' קרט'}
        </div>
        <button
          className={styles.trayMobileOpenBtn}
          onClick={() => setTrayOpen(true)}
        >
          פתח מגש
        </button>
      </div>

      {/* ── Mobile Tab Bar ── */}
      <div className={styles.tabBar}>
        <div className={styles.tabBarInner}>
          <button
            className={`${styles.tabItem} ${
              currentScreen === SCREENS.dashboard ? styles.tabItemActive : ''
            }`}
            onClick={() => setCurrentScreen(SCREENS.dashboard)}
          >
            <span className={styles.tabIcon}>◈</span>
            <span>בקרה</span>
          </button>
          <button
            className={`${styles.tabItem} ${
              currentScreen === SCREENS.inventory ? styles.tabItemActive : ''
            }`}
            onClick={() => setCurrentScreen(SCREENS.inventory)}
          >
            <span className={styles.tabIcon}>◇</span>
            <span>מלאי</span>
          </button>
          {hasDraft && (
            <button
              className={`${styles.tabItem} ${
                currentScreen === SCREENS.builder ? styles.tabItemActive : ''
              }`}
              onClick={() => setCurrentScreen(SCREENS.builder)}
            >
              <span className={styles.tabIcon}>✦</span>
              <span>בנייה</span>
            </button>
          )}
          <a className={styles.tabItem} href="/">
            <span className={styles.tabIcon}>⊞</span>
            <span>מחשבון</span>
          </a>
          <a className={styles.tabItem} href="/">
            <span className={styles.tabIcon}>◻</span>
            <span>תעודות</span>
          </a>
          <button
            className={`${styles.tabItem} ${hasTrayItems ? styles.tabItemActive : ''}`}
            onClick={() => setTrayOpen(true)}
          >
            <span className={styles.tabIcon}>◈</span>
            <span>מגש{hasTrayItems ? ` (${itemCount})` : ''}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function V2Shell() {
  return (
    <WorkTrayProvider>
      <ShellInner />
    </WorkTrayProvider>
  );
}
