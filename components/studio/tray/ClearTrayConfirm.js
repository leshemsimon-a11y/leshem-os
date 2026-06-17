// components/studio/tray/ClearTrayConfirm.js
//
// LESHEM.S OS — Clear Work Tray Confirmation (Clean 3)
//
// A small, elegant Hebrew confirmation dialog used before clearing the Work
// Tray. Avoids the native window.confirm so the experience stays on-brand and
// thumb-friendly on mobile (large tap targets, centered card). Honest copy:
// states clearly that clearing the tray does NOT change inventory.

import { useEffect } from 'react';
import { tokens } from '../shared/tokens';
import { TRAY_HE } from '../../../lib/studio/labels';

export default function ClearTrayConfirm({ open, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <>
      <div style={styles.scrim} onClick={onCancel} aria-hidden="true" />
      <div
        style={styles.card}
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-label={TRAY_HE.clearConfirmTitle}
      >
        <h3 style={styles.title}>{TRAY_HE.clearConfirmTitle}</h3>
        <p style={styles.body}>{TRAY_HE.clearConfirmBody}</p>
        <div style={styles.actions}>
          <button type="button" onClick={onCancel} style={styles.cancel}>
            {TRAY_HE.clearConfirmNo}
          </button>
          <button type="button" onClick={onConfirm} style={styles.confirm}>
            {TRAY_HE.clearConfirmYes}
          </button>
        </div>
      </div>
    </>
  );
}

const styles = {
  scrim: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(43,40,36,0.40)',
    zIndex: 60,
  },
  card: {
    position: 'fixed',
    zIndex: 61,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(420px, 92vw)',
    background: tokens.color.ivory,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.lg,
    boxShadow: tokens.shadow.lift,
    padding: '26px 24px 22px',
  },
  title: {
    fontFamily: tokens.font.display,
    fontWeight: 400,
    fontSize: '22px',
    color: tokens.color.charcoal,
    margin: '0 0 10px',
  },
  body: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
    margin: '0 0 22px',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  cancel: {
    minHeight: '48px',
    padding: '12px 22px',
    fontFamily: tokens.font.body,
    fontSize: '15px',
    fontWeight: 600,
    color: tokens.color.charcoal,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
  },
  confirm: {
    minHeight: '48px',
    padding: '12px 22px',
    fontFamily: tokens.font.body,
    fontSize: '15px',
    fontWeight: 600,
    color: tokens.color.ivory,
    background: tokens.color.charcoal,
    border: 'none',
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
    boxShadow: tokens.shadow.soft,
  },
};
