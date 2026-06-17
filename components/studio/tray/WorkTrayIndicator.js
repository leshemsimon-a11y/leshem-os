// components/studio/tray/WorkTrayIndicator.js
//
// LESHEM.S OS — Work Tray Indicator (Clean 3.1)
//
// A quiet, always-nearby reminder that the Work Tray (מגש עבודה) holds items.
// Mounted once by the studio shell, so it appears across every /studio* page
// without per-page wiring. It reads the existing Work Tray store only — no
// network, no Airtable, no new state.
//
// This is a JEWELER'S TRAY shortcut, NOT a shopping cart: neutral tray glyph,
// soft gold count bubble, no bag/cart iconography, no commerce language.
//
// Two variants:
//   • "desktop": a subtle top pill, right-aligned, shown only when count > 0.
//   • "mobile" : a compact floating tray button (bottom, thumb-reachable),
//                shown only when count > 0.
//
// Self-hides on the tray page itself (nothing to shortcut to). Starts hidden
// on the server / first paint and reveals after the store hydrates, so there
// is no hydration flash.

import * as React from 'react';
import { useRouter } from 'next/router';
import { tokens } from '../shared/tokens';
import { TRAY_HE } from '../../../lib/studio/labels';
import { createUseWorkTray } from '../../../lib/studio/workTray';

const useWorkTray = createUseWorkTray(React);

const TRAY_PATH = '/studio/tray';

export default function WorkTrayIndicator({ variant = 'desktop' }) {
  const router = useRouter();
  const tray = useWorkTray();

  // Don't show on the tray page, before hydration, or when empty.
  if (router.pathname === TRAY_PATH) return null;
  if (!tray.hydrated || tray.count === 0) return null;

  const go = () => router.push(TRAY_PATH);
  const countLabel =
    tray.count === 1 ? `${TRAY_HE.title} · 1` : TRAY_HE.itemsCount(tray.count);

  if (variant === 'mobile') {
    return (
      <button
        type="button"
        onClick={go}
        style={styles.floatBtn}
        aria-label={countLabel}
        dir="rtl"
      >
        <span style={styles.floatGlyph} aria-hidden="true">
          ▤
        </span>
        <span style={styles.floatCount}>{tray.count}</span>
      </button>
    );
  }

  // Desktop top pill.
  return (
    <div style={styles.pillWrap} dir="rtl">
      <button type="button" onClick={go} style={styles.pill} aria-label={countLabel}>
        <span style={styles.pillGlyph} aria-hidden="true">
          ▤
        </span>
        <span style={styles.pillLabel}>{TRAY_HE.title}</span>
        <span style={styles.pillCount}>{tray.count}</span>
      </button>
    </div>
  );
}

const styles = {
  // ---- Desktop top pill ----
  pillWrap: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: '18px',
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    minHeight: '40px',
    padding: '8px 16px',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.color.charcoal,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.goldFaint}`,
    borderRadius: '999px',
    cursor: 'pointer',
    boxShadow: tokens.shadow.soft,
    transition: 'background 140ms ease, border-color 140ms ease',
  },
  pillGlyph: {
    fontSize: '15px',
    lineHeight: 1,
    color: tokens.color.goldSoft,
  },
  pillLabel: {
    color: tokens.color.charcoal,
  },
  pillCount: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '22px',
    height: '22px',
    padding: '0 7px',
    fontSize: '12px',
    fontWeight: 700,
    color: tokens.color.ivory,
    background: tokens.color.gold,
    borderRadius: '999px',
  },

  // ---- Mobile floating tray button ----
  floatBtn: {
    position: 'fixed',
    insetInlineEnd: '18px',
    bottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
    zIndex: 24,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    minHeight: '54px',
    padding: '0 18px',
    fontFamily: tokens.font.body,
    color: tokens.color.ivory,
    background: tokens.color.charcoal,
    border: 'none',
    borderRadius: '999px',
    cursor: 'pointer',
    boxShadow: tokens.shadow.lift,
  },
  floatGlyph: {
    fontSize: '18px',
    lineHeight: 1,
    color: tokens.color.goldSoft,
  },
  floatCount: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '24px',
    height: '24px',
    padding: '0 7px',
    fontSize: '13px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    background: tokens.color.goldSoft,
    borderRadius: '999px',
  },
};
