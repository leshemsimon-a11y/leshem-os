// components/studio/assets/AssetCard.js
//
// LESHEM.S OS — Asset Card (Clean 4B)
//
// One asset rendered as a clean, visual card (not a file-manager row): a
// preview (image data-URL when available, else a category glyph), the file
// name + type, and tap-friendly controls to set category, status, link to a
// Design Project, edit notes, and archive/restore. Local only.

import { useState } from 'react';
import { tokens } from '../shared/tokens';
import { ASSETS_HE } from '../../../lib/studio/labels';
import {
  ASSET_CATEGORY_VALUES,
  ASSET_STATUS_VALUES,
} from '../../../lib/studio/assetsStore';

const CATEGORY_GLYPH = {
  stoneImage: '◆',
  model3d: '◫',
  sketch: '✎',
  certificate: '❉',
  clientReference: '◈',
  inspiration: '✦',
  renderImage: '▦',
  other: '▣',
};

export default function AssetCard({
  asset,
  projects,
  onCategory,
  onStatus,
  onNotes,
  onLink,
  onArchive,
  onUnarchive,
}) {
  const [notes, setNotes] = useState(asset.notes || '');
  const [notesDirty, setNotesDirty] = useState(false);
  const archived = asset.status === 'archived';

  return (
    <div style={styles.card} dir="rtl">
      <div style={styles.preview}>
        {asset.previewDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset.previewDataUrl} alt={asset.fileName} style={styles.previewImg} />
        ) : (
          <span style={styles.previewGlyph} aria-hidden="true">
            {CATEGORY_GLYPH[asset.category] || '▣'}
          </span>
        )}
      </div>

      <div style={styles.body}>
        <div style={styles.titleRow}>
          <span style={styles.fileName} title={asset.fileName}>
            {asset.fileName}
          </span>
        </div>
        <span style={styles.fileType}>
          {asset.fileType || ASSETS_HE.fileType}
          {!asset.bytesPersisted && (
            <span style={styles.notPersisted}> · {ASSETS_HE.notPersistedNote}</span>
          )}
        </span>

        {/* Category */}
        <label style={styles.fieldLabel}>{ASSETS_HE.categoryLabel}</label>
        <select
          value={asset.category}
          onChange={(e) => onCategory(asset.id, e.target.value)}
          style={styles.select}
          dir="rtl"
        >
          {ASSET_CATEGORY_VALUES.map((c) => (
            <option key={c} value={c}>
              {ASSETS_HE.category[c]}
            </option>
          ))}
        </select>

        {/* Status */}
        <label style={styles.fieldLabel}>{ASSETS_HE.statusLabel}</label>
        <select
          value={asset.status}
          onChange={(e) => onStatus(asset.id, e.target.value)}
          style={styles.select}
          dir="rtl"
        >
          {ASSET_STATUS_VALUES.map((s) => (
            <option key={s} value={s}>
              {ASSETS_HE.status[s]}
            </option>
          ))}
        </select>

        {/* Link to project */}
        <label style={styles.fieldLabel}>{ASSETS_HE.linkLabel}</label>
        <select
          value={asset.linkedProjectId || ''}
          onChange={(e) => onLink(asset.id, e.target.value || null)}
          style={styles.select}
          dir="rtl"
        >
          <option value="">{ASSETS_HE.linkNone}</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Notes */}
        <label style={styles.fieldLabel}>{ASSETS_HE.notesLabel}</label>
        <textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setNotesDirty(e.target.value !== (asset.notes || ''));
          }}
          onBlur={() => {
            if (notesDirty) {
              onNotes(asset.id, notes);
              setNotesDirty(false);
            }
          }}
          placeholder={ASSETS_HE.notesPlaceholder}
          style={styles.textarea}
          rows={2}
          dir="rtl"
        />

        <div style={styles.actions}>
          {archived ? (
            <button type="button" onClick={() => onUnarchive(asset.id)} style={styles.ghostBtn}>
              {ASSETS_HE.unarchive}
            </button>
          ) : (
            <button type="button" onClick={() => onArchive(asset.id)} style={styles.ghostBtn}>
              {ASSETS_HE.archive}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.lg,
    boxShadow: tokens.shadow.soft,
    overflow: 'hidden',
  },
  preview: {
    aspectRatio: '4 / 3',
    background: tokens.color.pearl,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: `1px solid ${tokens.color.cardEdge}`,
    overflow: 'hidden',
  },
  previewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  previewGlyph: {
    fontSize: '40px',
    color: tokens.color.goldSoft,
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '14px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '8px',
  },
  fileName: {
    fontFamily: tokens.font.display,
    fontSize: '16px',
    color: tokens.color.charcoal,
    lineHeight: 1.3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  fileType: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    color: tokens.color.inkFaint,
    direction: 'ltr',
    textAlign: 'right',
    marginBottom: '4px',
  },
  notPersisted: {
    color: tokens.color.gold,
    direction: 'rtl',
  },
  fieldLabel: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    color: tokens.color.inkSoft,
    marginTop: '6px',
  },
  select: {
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    color: tokens.color.ink,
    background: tokens.color.ivory,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    padding: '9px 10px',
    minHeight: '42px',
  },
  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    lineHeight: 1.5,
    color: tokens.color.ink,
    background: tokens.color.ivory,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    padding: '9px 10px',
    resize: 'vertical',
    outline: 'none',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    marginTop: '10px',
  },
  ghostBtn: {
    minHeight: '42px',
    padding: '9px 16px',
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.color.inkSoft,
    background: 'transparent',
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
  },
};
