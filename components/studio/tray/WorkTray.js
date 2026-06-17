// components/studio/tray/WorkTray.js
//
// LESHEM.S OS — Work Tray (Clean 3 → Clean 3.2)
//
// The review surface for the current creative selection (מגש עבודה). It is a
// TEMPORARY draft — not saved inventory — and says so plainly. From here the
// jeweller can review each selected item, assign its design role (now via
// tap-friendly chips), remove an item, clear the whole tray (with
// confirmation), and open the Jewelry Design Studio to begin working around
// the stones.
//
// Clean 3.2 adds honest draft validation:
//   • An elegant status strip reflects three states — empty / needs-role /
//     ready — without ever blocking progress (continuing is always allowed).
//   • Readiness is stone-first: at least one CENTER STONE marks the draft as
//     ready to begin. Until then the strip gently suggests assigning roles.
//
// Mobile-first: stacked item cards, generous tap targets, and a sticky bottom
// action bar holding the primary "open design" action so it is always within
// thumb reach. No commerce language. No Airtable. No network.

import { useState } from 'react';
import * as React from 'react';
import { useRouter } from 'next/router';
import { tokens } from '../shared/tokens';
import useIsMobile from '../shared/useIsMobile';
import { TRAY_HE } from '../../../lib/studio/labels';
import { createUseWorkTray } from '../../../lib/studio/workTray';
import { summarizeDraft, draftStatus } from '../../../lib/studio/designDraft';
import TrayItemCard from './TrayItemCard';
import ClearTrayConfirm from './ClearTrayConfirm';

const useWorkTray = createUseWorkTray(React);

function StatusStrip({ status }) {
  if (!status || status.key === 'empty') return null;

  const ready = status.tone === 'ready';
  const stripStyle = {
    ...styles.statusStrip,
    ...(ready ? styles.statusReady : styles.statusPending),
  };
  const title = ready
    ? TRAY_HE.status.readyTitle
    : TRAY_HE.status.needsRoleTitle;
  const body = ready ? TRAY_HE.status.readyBody : TRAY_HE.status.needsRoleBody;

  return (
    <div style={stripStyle} dir="rtl">
      <span
        style={{
          ...styles.statusDot,
          background: ready ? tokens.color.gold : tokens.color.goldSoft,
        }}
        aria-hidden="true"
      />
      <div style={styles.statusText}>
        <span style={styles.statusTitle}>{title}</span>
        <span style={styles.statusBody}>{body}</span>
      </div>
    </div>
  );
}

export default function WorkTray() {
  const isMobile = useIsMobile(880);
  const router = useRouter();
  const tray = useWorkTray();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const summary = summarizeDraft(tray.items);
  const { total, assigned, readyToBegin } = summary;
  const status = draftStatus(tray.items);
  const hasItems = tray.items.length > 0;

  const goDesign = () => router.push('/studio/design');
  const goInventory = () => router.push('/studio/inventory');

  const handleClear = () => {
    tray.clear();
    setConfirmOpen(false);
  };

  return (
    <div dir="rtl" style={isMobile ? styles.rootMobile : undefined}>
      <header style={styles.header}>
        <span style={styles.eyebrow}>{TRAY_HE.eyebrow}</span>
        <h1 style={styles.title}>{TRAY_HE.title}</h1>
        <p style={styles.draftNote}>{TRAY_HE.draftNote}</p>
      </header>

      {/* Don't render hydration-sensitive content until the store has synced. */}
      {!tray.hydrated ? (
        <div style={styles.loading}>טוען את מגש העבודה…</div>
      ) : !hasItems ? (
        <div style={styles.empty}>
          <div style={styles.emptyMark} aria-hidden="true">
            ▤
          </div>
          <h2 style={styles.emptyTitle}>{TRAY_HE.empty}</h2>
          <p style={styles.emptyHint}>{TRAY_HE.emptyHint}</p>
          <button type="button" onClick={goInventory} style={styles.secondaryBtn}>
            {TRAY_HE.backToInventory}
          </button>
        </div>
      ) : (
        <>
          <div style={styles.metaRow}>
            <span style={styles.count}>{TRAY_HE.itemsCount(total)}</span>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              style={styles.clearBtn}
            >
              {TRAY_HE.clear}
            </button>
          </div>

          <StatusStrip status={status} />

          <div style={styles.list}>
            {tray.items.map((item) => (
              <TrayItemCard
                key={item.id}
                item={item}
                onRole={tray.setRole}
                onRemove={tray.remove}
              />
            ))}
          </div>

          {/* Desktop: inline action row. Mobile: sticky bottom bar below. */}
          {!isMobile && (
            <div style={styles.desktopActions}>
              <button type="button" onClick={goInventory} style={styles.secondaryBtn}>
                {TRAY_HE.backToInventory}
              </button>
              <div style={styles.desktopPrimaryWrap}>
                <span style={styles.desktopReadyHint}>
                  {readyToBegin ? TRAY_HE.readyHint : TRAY_HE.notReadyHint}
                </span>
                <button type="button" onClick={goDesign} style={styles.primaryBtn}>
                  {TRAY_HE.openDesign}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Mobile sticky action bar — primary action always within thumb reach. */}
      {isMobile && tray.hydrated && hasItems && (
        <div style={styles.stickyBar}>
          <div style={styles.stickyInner}>
            <span style={styles.stickyHint}>
              {assigned}/{total} ·{' '}
              {readyToBegin ? TRAY_HE.readyHint : TRAY_HE.openDesignHint}
            </span>
            <button type="button" onClick={goDesign} style={styles.stickyBtn}>
              {TRAY_HE.openDesign}
            </button>
          </div>
        </div>
      )}

      <ClearTrayConfirm
        open={confirmOpen}
        onConfirm={handleClear}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

const styles = {
  rootMobile: {
    // Leave room so the sticky bottom bar never covers the last card.
    paddingBottom: '96px',
  },
  header: {
    marginBottom: '20px',
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
    fontSize: '34px',
    color: tokens.color.charcoal,
    margin: '8px 0 12px',
  },
  draftNote: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.goldFaint}`,
    borderRadius: tokens.radius.sm,
    padding: '10px 14px',
    margin: 0,
    maxWidth: '560px',
  },
  loading: {
    fontFamily: tokens.font.body,
    fontSize: '15px',
    color: tokens.color.inkFaint,
    padding: '40px 0',
    textAlign: 'center',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '12px',
    minHeight: '46vh',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  emptyMark: {
    fontSize: '30px',
    color: tokens.color.goldSoft,
  },
  emptyTitle: {
    fontFamily: tokens.font.display,
    fontWeight: 400,
    fontSize: '24px',
    color: tokens.color.charcoal,
    margin: 0,
  },
  emptyHint: {
    fontFamily: tokens.font.body,
    fontSize: '15px',
    lineHeight: 1.6,
    color: tokens.color.inkFaint,
    maxWidth: '420px',
    margin: '0 0 8px',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '12px',
  },
  count: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    color: tokens.color.inkSoft,
  },
  clearBtn: {
    minHeight: '44px',
    padding: '10px 18px',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.color.inkSoft,
    background: 'transparent',
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  statusStrip: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: tokens.radius.md,
    marginBottom: '16px',
  },
  statusPending: {
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.goldFaint}`,
  },
  statusReady: {
    background: tokens.color.sageFaint,
    border: `1px solid ${tokens.color.sage}`,
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    marginTop: '5px',
    flexShrink: 0,
  },
  statusText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  },
  statusTitle: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  statusBody: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  desktopActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginTop: '28px',
    paddingTop: '20px',
    borderTop: `1px solid ${tokens.color.cardEdge}`,
  },
  desktopPrimaryWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  desktopReadyHint: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    color: tokens.color.inkFaint,
  },
  primaryBtn: {
    minHeight: '50px',
    padding: '14px 28px',
    fontFamily: tokens.font.body,
    fontSize: '16px',
    fontWeight: 600,
    color: tokens.color.ivory,
    background: tokens.color.charcoal,
    border: 'none',
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
    boxShadow: tokens.shadow.soft,
  },
  secondaryBtn: {
    minHeight: '50px',
    padding: '14px 26px',
    fontFamily: tokens.font.body,
    fontSize: '15px',
    fontWeight: 600,
    color: tokens.color.charcoal,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
  },
  stickyBar: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 25,
    background: tokens.color.ivory,
    borderTop: `1px solid ${tokens.color.cardEdge}`,
    boxShadow: '0 -8px 24px rgba(43,40,36,0.06)',
    padding: '12px 16px calc(12px + env(safe-area-inset-bottom, 0px))',
  },
  stickyInner: {
    maxWidth: '720px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  stickyHint: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.inkFaint,
    flex: 1,
    minWidth: 0,
  },
  stickyBtn: {
    minHeight: '50px',
    padding: '14px 22px',
    fontFamily: tokens.font.body,
    fontSize: '16px',
    fontWeight: 600,
    color: tokens.color.ivory,
    background: tokens.color.charcoal,
    border: 'none',
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    boxShadow: tokens.shadow.soft,
  },
};
