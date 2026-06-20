// components/studio/assets/AssetUploadZone.js
//
// LESHEM.S OS — Asset Upload Zone (Clean 4B)
//
// A simple, non-technical upload area. The jeweller picks a file from the
// device; we read small images into a local preview and record larger files
// (3D, PDF) by name/type/size. It is honest that this is prototype LOCAL
// storage — no cloud, no backend, no GitHub, no Airtable, no network.
//
// On select, a new asset is created (default category inferred from file type,
// status = draft) and the parent list refreshes. No commerce wording.

import { useRef, useState } from 'react';
import { tokens } from '../shared/tokens';
import { ASSETS_HE } from '../../../lib/studio/labels';
import { fileToAssetInput, ASSET_CATEGORY } from '../../../lib/studio/assetsStore';

// Infer a sensible default category from the file's MIME type / extension.
function inferCategory(file) {
  const type = (file && file.type) || '';
  const name = ((file && file.name) || '').toLowerCase();
  if (type.startsWith('image/')) return ASSET_CATEGORY.STONE_IMAGE;
  if (type === 'application/pdf' || name.endsWith('.pdf')) return ASSET_CATEGORY.CERTIFICATE;
  if (/\.(stl|obj|3dm|gltf|glb|step|stp|igs|iges)$/.test(name)) return ASSET_CATEGORY.MODEL_3D;
  return ASSET_CATEGORY.OTHER;
}

export default function AssetUploadZone({ onAdd }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [lastName, setLastName] = useState(null);

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setBusy(true);
    for (const file of files) {
      // eslint-disable-next-line no-await-in-loop
      const input = await fileToAssetInput(file);
      onAdd({ ...input, category: inferCategory(file), status: 'draft' });
      setLastName(file.name);
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div style={styles.wrap} dir="rtl">
      <p style={styles.localNote}>{ASSETS_HE.localNote}</p>

      <div
        style={styles.drop}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer && e.dataTransfer.files);
        }}
      >
        <span style={styles.dropGlyph} aria-hidden="true">
          ＋
        </span>
        <span style={styles.dropText}>{ASSETS_HE.uploadDrop}</span>
        <button
          type="button"
          onClick={() => inputRef.current && inputRef.current.click()}
          style={styles.button}
          disabled={busy}
        >
          {busy ? '…' : ASSETS_HE.uploadButton}
        </button>
        <input
          ref={inputRef}
          type="file"
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: 'none' }}
          accept="image/*,application/pdf,.stl,.obj,.3dm,.gltf,.glb,.step,.stp,.igs,.iges"
          multiple
        />
        {lastName && <span style={styles.added}>נוסף: {lastName}</span>}
      </div>
      <p style={styles.hint}>{ASSETS_HE.uploadHint}</p>
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '22px',
  },
  localNote: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.goldFaint}`,
    borderRadius: tokens.radius.sm,
    padding: '10px 14px',
    margin: 0,
  },
  drop: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '28px 20px',
    background: tokens.color.canvas,
    border: `1px dashed ${tokens.color.goldSoft}`,
    borderRadius: tokens.radius.lg,
    textAlign: 'center',
  },
  dropGlyph: {
    fontSize: '28px',
    lineHeight: 1,
    color: tokens.color.goldSoft,
  },
  dropText: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    color: tokens.color.inkSoft,
  },
  button: {
    minHeight: '48px',
    padding: '12px 26px',
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
  added: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.gold,
  },
  hint: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.inkFaint,
    margin: 0,
  },
};
