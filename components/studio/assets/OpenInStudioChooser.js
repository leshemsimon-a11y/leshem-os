// components/studio/assets/OpenInStudioChooser.js
//
// LESHEM.S OS — Open in Studio / Open Project Chooser (Clean 4B.4b)
//
// Replaces the old scary overwrite warning ("פעולה זו תחליף את מגש העבודה…")
// with a clear, choice-based flow. Used in two places:
//   • Asset → "פתח בסטודיו" (mode="asset"): bring an asset item into the studio.
//   • Saved project → open (mode="project"): restore a project into the studio.
//
// Choices (no destructive language; "החלף" still needs an explicit click):
//   • הוסף לעבודה הנוכחית      — additive; nothing is lost.
//   • פתח כעיצוב חדש           — save current work first, then start clean.
//   • שמור את העבודה הנוכחית לפני מעבר — save current work, proceed only on success.
//   • החלף את העבודה הנוכחית   — explicit replace.
//
// GUARD (per approval): any path that would replace current work first attempts
// to SAVE it as a local Design Project with a simple default name. We only
// proceed if the save SUCCEEDS (a project object with an id is returned). If the
// save cannot complete, we show a clear message and DO NOT replace the work.
//
// Local only. No Airtable, no network, no new packages.

import { useState } from 'react';
import { tokens } from '../shared/tokens';
import { OPEN_STUDIO_HE } from '../../../lib/studio/labels';

// hasCurrentWork: boolean — is there anything in the tray worth protecting?
// onAddToCurrent(): bring payload into the existing tray (additive).
// onStartFresh(): clear tray + bring payload in (caller already saved/када).
// saveCurrentWork(): () => project|null  — must persist current work; returns
//   the saved project (truthy) on success, or null/false on failure.
// proceedReplace(): replace current work with the payload (tray.replace / etc).
export default function OpenInStudioChooser({
  open,
  mode = 'asset',
  hasCurrentWork,
  onAddToCurrent,
  saveCurrentWork,
  proceedReplace,
  onClose,
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [savedNote, setSavedNote] = useState(null);

  if (!open) return null;

  const body = mode === 'project' ? OPEN_STUDIO_HE.bodyProject : OPEN_STUDIO_HE.bodyAsset;

  const reset = () => {
    setBusy(false);
    setError(null);
    setSavedNote(null);
  };

  const closeAll = () => {
    reset();
    if (typeof onClose === 'function') onClose();
  };

  // Additive — never touches existing work.
  const handleAddToCurrent = () => {
    if (typeof onAddToCurrent === 'function') onAddToCurrent();
    closeAll();
  };

  // Save current work, then replace only if the save succeeded.
  const handleSaveThen = async (thenFresh) => {
    if (busy) return;
    setError(null);
    setSavedNote(null);
    // If there is nothing to protect, skip straight to proceeding.
    if (!hasCurrentWork) {
      proceedReplace();
      closeAll();
      return;
    }
    setBusy(true);
    try {
      const saved = await Promise.resolve(saveCurrentWork());
      if (!saved || !saved.id) {
        // GUARD: save did not complete safely — do NOT replace the work.
        setError(OPEN_STUDIO_HE.saveFailed);
        setBusy(false);
        return;
      }
      setSavedNote(`${OPEN_STUDIO_HE.savedOkPrefix}${saved.name || ''}`.trim());
      // Save succeeded → safe to proceed (start fresh / replace with payload).
      proceedReplace();
      // brief pause so the user sees the saved confirmation, then close
      setTimeout(() => closeAll(), 650);
    } catch (e) {
      console.warn('[OpenInStudioChooser] save-before-switch failed', e);
      setError(OPEN_STUDIO_HE.saveFailed);
      setBusy(false);
    }
  };

  // Explicit replace. Still protects unsaved work by saving first when present;
  // the difference from "save first" is intent/labeling, not safety.
  const handleReplace = async () => {
    await handleSaveThen(false);
  };

  return (
    <div style={styles.overlay} dir="rtl" role="dialog" aria-modal="true">
      <div style={styles.modal}>
        <div style={styles.head}>
          <h2 style={styles.title}>{OPEN_STUDIO_HE.title}</h2>
          <button type="button" onClick={closeAll} style={styles.close} aria-label="close">×</button>
        </div>
        <p style={styles.body}>{body}</p>

        <div style={styles.choices}>
          <button type="button" onClick={handleAddToCurrent} style={styles.choice} disabled={busy}>
            <span style={styles.choiceLabel}>{OPEN_STUDIO_HE.addToCurrent}</span>
            <span style={styles.choiceHint}>{OPEN_STUDIO_HE.addToCurrentHint}</span>
          </button>

          <button type="button" onClick={() => handleSaveThen(true)} style={styles.choice} disabled={busy}>
            <span style={styles.choiceLabel}>{OPEN_STUDIO_HE.openAsNew}</span>
            <span style={styles.choiceHint}>{OPEN_STUDIO_HE.openAsNewHint}</span>
          </button>

          <button type="button" onClick={() => handleSaveThen(false)} style={styles.choice} disabled={busy}>
            <span style={styles.choiceLabel}>{OPEN_STUDIO_HE.saveCurrentFirst}</span>
            <span style={styles.choiceHint}>{OPEN_STUDIO_HE.saveFirstHint}</span>
          </button>

          <button type="button" onClick={handleReplace} style={{ ...styles.choice, ...styles.choiceWarn }} disabled={busy}>
            <span style={styles.choiceLabel}>{OPEN_STUDIO_HE.replaceCurrent}</span>
            <span style={styles.choiceHint}>{OPEN_STUDIO_HE.replaceHint}</span>
          </button>
        </div>

        {busy && <p style={styles.note}>…</p>}
        {savedNote && <p style={styles.savedNote}>{savedNote}</p>}
        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.footer}>
          <button type="button" onClick={closeAll} style={styles.ghost} disabled={busy}>
            {OPEN_STUDIO_HE.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(43,40,36,0.38)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
  },
  modal: {
    width: '100%', maxWidth: '460px', background: tokens.color.ivory,
    border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.lg,
    boxShadow: tokens.shadow.lift, padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px',
  },
  head: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: tokens.font.display, fontSize: '21px', color: tokens.color.charcoal, margin: 0 },
  close: { fontFamily: tokens.font.body, fontSize: '24px', lineHeight: 1, color: tokens.color.inkSoft, background: 'transparent', border: 'none', cursor: 'pointer' },
  body: { fontFamily: tokens.font.body, fontSize: '14px', color: tokens.color.inkSoft, margin: 0 },
  choices: { display: 'flex', flexDirection: 'column', gap: '10px' },
  choice: {
    display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-start',
    padding: '13px 15px', background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md, cursor: 'pointer', textAlign: 'right', width: '100%',
  },
  choiceWarn: { borderColor: tokens.color.goldSoft, background: tokens.color.goldFaint },
  choiceLabel: { fontFamily: tokens.font.body, fontSize: '15px', fontWeight: 700, color: tokens.color.charcoal },
  choiceHint: { fontFamily: tokens.font.body, fontSize: '12px', color: tokens.color.inkFaint },
  note: { fontFamily: tokens.font.body, fontSize: '13px', color: tokens.color.inkFaint, margin: 0, textAlign: 'center' },
  savedNote: { fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 600, color: tokens.color.sage, margin: 0, textAlign: 'center' },
  error: {
    fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 600, color: '#8c2f2f',
    background: '#faf3f3', border: '1px solid #c9a3a3', borderRadius: tokens.radius.sm, padding: '10px 12px', margin: 0,
  },
  footer: { display: 'flex', justifyContent: 'flex-end' },
  ghost: {
    minHeight: '44px', padding: '10px 18px', fontFamily: tokens.font.body, fontSize: '14px', fontWeight: 600,
    color: tokens.color.inkSoft, background: 'transparent', border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md, cursor: 'pointer',
  },
};
