// components/studio/create/CreateIntakeArea.js
//
// LESHEM.S OS — Clean 8H: «רפרנסים ונכסים» — the Create Flow intake area.
//
// Accepts, with INSTANT visible feedback (an item card per input):
//   • pasted text            → רפרנס טקסטואלי
//   • pasted URL             → קישור (URL)
//   • pasted image           → תמונה (clipboard files, when the browser
//                              provides them)
//   • dragged files          → per detected type
//   • uploaded files         → per detected type
//
// BROWSER APIs ONLY (paste/drop/File input; object URLs for session-only
// thumbnails). Items are SESSION records (lib/studio/createIntake) marked
// «נקלט» + «דורש שמירת תיק»; persistence happens at save time in the shell
// through EXISTING public APIs. Nothing is cleared except by the explicit
// «הסר» action on an item.

import * as React from 'react';
import { tokens } from '../shared/tokens';
import {
  INTAKE_TYPE_HE,
  INTAKE_STATUS_HE,
  INTAKE_ITEM_TYPE,
  buildTextIntakeItem,
  buildFileIntakeItem,
  suggestedRoleHe,
} from '../../../lib/studio/createIntake';
import { MODEL_3DM_NOTICE_HE } from '../../../lib/studio/attachedAssets';

const HE = Object.freeze({
  title: 'רפרנסים ונכסים',
  intro: 'הדבק תמונה, גרור קובץ, העלה מודל, או כתוב רפרנס טקסטואלי.',
  inputPlaceholder: 'הדבק כאן טקסט, קישור או תמונה — או כתוב רפרנס ולחץ "הוסף"',
  addText: 'הוסף רפרנס',
  upload: 'העלה קובץ',
  dropHint: 'אפשר גם לגרור קבצים לכאן',
  received: (n) => (n === 1 ? 'פריט אחד נקלט' : `${n} פריטים נקלטו`),
  suggestedRolePrefix: 'תפקיד מוצע: ',
  remove: 'הסר',
  emptyYet: 'עדיין לא נוספו רפרנסים — כל קלט יופיע כאן מיד ככרטיס פריט.',
  pastedToast: 'נקלט ✓',
});

export default function CreateIntakeArea({ items, onAddItems, onRemoveItem }) {
  const [draft, setDraft] = React.useState('');
  const [dragOver, setDragOver] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const fileInputRef = React.useRef(null);
  const timer = React.useRef(null);
  const urlsRef = React.useRef([]); // object URLs to revoke on unmount
  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      urlsRef.current.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch (e) {
          /* noop */
        }
      });
    },
    []
  );

  const flash = () => {
    setToast(HE.pastedToast);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 1800);
  };

  const addFiles = (fileList, pasted) => {
    const files = Array.from(fileList || []).filter(Boolean);
    if (!files.length) return;
    const next = files
      .map((f) => {
        let previewUrl = null;
        const isImage = (f.type || '').startsWith('image/');
        if (isImage && typeof URL !== 'undefined' && URL.createObjectURL) {
          previewUrl = URL.createObjectURL(f);
          urlsRef.current.push(previewUrl);
        }
        return buildFileIntakeItem({
          file: f,
          fileName: f.name,
          mimeType: f.type,
          pasted: Boolean(pasted),
          previewUrl,
        });
      })
      .filter(Boolean);
    if (next.length) {
      onAddItems(next);
      flash();
    }
  };

  const addText = (text) => {
    const item = buildTextIntakeItem(text);
    if (item) {
      onAddItems([item]);
      flash();
      return true;
    }
    return false;
  };

  // Paste: clipboard files (images) win; otherwise pasted text becomes an
  // item card IMMEDIATELY (spec: every input creates instant feedback).
  const handlePaste = (e) => {
    const dt = e.clipboardData;
    if (!dt) return;
    const files = dt.files && dt.files.length ? dt.files : null;
    if (files) {
      e.preventDefault();
      addFiles(files, true);
      return;
    }
    const text = dt.getData('text');
    if (text && text.trim()) {
      e.preventDefault();
      addText(text);
      setDraft('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
      addFiles(e.dataTransfer.files, false);
    }
  };

  const handleAddClick = () => {
    if (addText(draft)) setDraft('');
  };

  const list = Array.isArray(items) ? items : [];

  return (
    <div
      style={{ ...styles.wrap, ...(dragOver ? styles.wrapDrag : null) }}
      dir="rtl"
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <p style={styles.intro}>{HE.intro}</p>

      <div style={styles.inputRow}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onPaste={handlePaste}
          placeholder={HE.inputPlaceholder}
          style={styles.input}
          rows={2}
          dir="rtl"
        />
      </div>
      <div style={styles.actionsRow}>
        <button
          type="button"
          onClick={handleAddClick}
          disabled={!draft.trim()}
          style={{ ...styles.addBtn, ...(!draft.trim() ? styles.btnDisabled : null) }}
        >
          {HE.addText}
        </button>
        <button type="button" onClick={() => fileInputRef.current && fileInputRef.current.click()} style={styles.uploadBtn}>
          {HE.upload}
        </button>
        <span style={styles.dropHint}>{HE.dropHint}</span>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => {
            addFiles(e.target.files, false);
            e.target.value = '';
          }}
        />
      </div>

      {toast ? <div style={styles.toast}>{toast}</div> : null}

      {list.length === 0 ? (
        <p style={styles.empty}>{HE.emptyYet}</p>
      ) : (
        <>
          <span style={styles.countLine}>{HE.received(list.length)}</span>
          <div style={styles.cards}>
            {list.map((it) => (
              <div key={it.intakeId} style={styles.card}>
                {it.previewUrl ? (
                  <span style={styles.thumb}>
                    <img src={it.previewUrl} alt="" style={styles.thumbImg} />
                  </span>
                ) : null}
                <span style={styles.cardBody}>
                  <span style={styles.cardName}>{it.name}</span>
                  <span style={styles.cardMeta}>
                    {INTAKE_TYPE_HE[it.itemType] || INTAKE_TYPE_HE.unknown}
                    {' · '}
                    {HE.suggestedRolePrefix}
                    {suggestedRoleHe(it.itemType)}
                  </span>
                  {it.itemType === INTAKE_ITEM_TYPE.MODEL_FUTURE ? (
                    <span style={styles.notice3dm}>{MODEL_3DM_NOTICE_HE}</span>
                  ) : null}
                  <span style={styles.statusRow}>
                    <span style={styles.statusChip}>{INTAKE_STATUS_HE.received}</span>
                    {/* All items are session-held until the Work File is
                        saved, so the persistence note applies to each. */}
                    <span style={styles.needsSaveChip}>{INTAKE_STATUS_HE.needsSave}</span>
                  </span>
                </span>
                <button type="button" onClick={() => onRemoveItem(it.intakeId)} style={styles.removeBtn}>
                  {HE.remove}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    border: `1.5px dashed ${tokens.color.goldFaint}`,
    borderRadius: tokens.radius.md,
    padding: '12px',
    background: tokens.color.pearl,
  },
  wrapDrag: {
    border: `1.5px dashed ${tokens.color.gold}`,
    background: tokens.color.goldFaint,
  },
  intro: {
    margin: 0,
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.color.charcoal,
  },
  inputRow: { display: 'flex' },
  input: {
    flex: 1,
    fontFamily: tokens.font.body,
    fontSize: '13px',
    color: tokens.color.ink,
    background: '#FFFFFF',
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    padding: '10px 12px',
    resize: 'vertical',
    minHeight: '52px',
  },
  actionsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  addBtn: {
    minHeight: '36px',
    padding: '7px 15px',
    borderRadius: '999px',
    border: `1px solid ${tokens.color.gold}`,
    background: tokens.color.goldFaint,
    color: tokens.color.charcoal,
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  uploadBtn: {
    minHeight: '36px',
    padding: '7px 15px',
    borderRadius: '999px',
    border: `1px solid ${tokens.color.charcoal}`,
    background: 'transparent',
    color: tokens.color.charcoal,
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  btnDisabled: { opacity: 0.45, cursor: 'not-allowed' },
  dropHint: {
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    color: tokens.color.inkFaint,
  },
  toast: {
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    background: tokens.color.sageFaint,
    border: `1px solid ${tokens.color.sage}`,
    borderRadius: tokens.radius.md,
    padding: '6px 12px',
    alignSelf: 'flex-start',
  },
  empty: {
    margin: 0,
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.inkFaint,
  },
  countLine: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  cards: { display: 'flex', flexDirection: 'column', gap: '8px' },
  card: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    background: '#FFFFFF',
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    padding: '9px 11px',
  },
  thumb: {
    width: '44px',
    height: '44px',
    borderRadius: tokens.radius.sm,
    overflow: 'hidden',
    flex: '0 0 auto',
    border: `1px solid ${tokens.color.cardEdge}`,
    display: 'inline-flex',
  },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  cardBody: { display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0, flex: 1 },
  cardName: {
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cardMeta: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    color: tokens.color.inkSoft,
  },
  notice3dm: {
    fontFamily: tokens.font.body,
    fontSize: '10.5px',
    fontWeight: 600,
    color: tokens.color.inkSoft,
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.gold}`,
    borderRadius: tokens.radius.sm,
    padding: '1px 7px',
    alignSelf: 'flex-start',
  },
  statusRow: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  statusChip: {
    fontFamily: tokens.font.body,
    fontSize: '10.5px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    background: tokens.color.sageFaint,
    border: `1px solid ${tokens.color.sage}`,
    borderRadius: tokens.radius.sm,
    padding: '1px 7px',
  },
  needsSaveChip: {
    fontFamily: tokens.font.body,
    fontSize: '10.5px',
    fontWeight: 600,
    color: tokens.color.inkSoft,
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.sm,
    padding: '1px 7px',
  },
  removeBtn: {
    minHeight: '28px',
    padding: '4px 10px',
    borderRadius: '999px',
    border: `1px solid ${tokens.color.cardEdge}`,
    background: 'transparent',
    color: tokens.color.inkSoft,
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flex: '0 0 auto',
  },
};
