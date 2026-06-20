// components/studio/assets/AssetUploadZone.js
//
// LESHEM.S OS — Asset Upload Zone (Clean 4B.1)
//
// Adds one or more files to a GIVEN Asset Object. Files (with their Blob) are
// persisted to IndexedDB via the store's addFile. File kind is inferred; for
// 3D files a default purpose can be chosen. Local only — no cloud, no backend,
// no Airtable, no network, no new packages, no commerce wording.

import { useRef, useState } from 'react';
import { tokens } from '../shared/tokens';
import { ASSETS_OBJ_HE } from '../../../lib/studio/labels';
import {
  inferFileKind,
  extensionOf,
  is3DExt,
  FILE_PURPOSE,
  FILE_PURPOSE_VALUES,
} from '../../../lib/studio/assetsStore';

export default function AssetUploadZone({ objectId, onAddFile }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [purpose, setPurpose] = useState(FILE_PURPOSE.NONE);

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setBusy(true);
    for (const file of files) {
      const ext = extensionOf(file.name);
      const kind = inferFileKind(file);
      const meta = {
        fileName: file.name,
        mimeType: file.type || '',
        extension: ext,
        fileSize: typeof file.size === 'number' ? file.size : null,
        fileKind: kind,
        filePurpose: is3DExt(ext) ? purpose : FILE_PURPOSE.NONE,
        status: 'draft',
      };
      // eslint-disable-next-line no-await-in-loop
      await onAddFile(objectId, meta, file);
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div style={styles.wrap} dir="rtl">
      <div style={styles.controls}>
        <label style={styles.purposeLabel}>{ASSETS_OBJ_HE.purposeLabel} (תלת־ממד)</label>
        <select
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          style={styles.select}
          dir="rtl"
        >
          {FILE_PURPOSE_VALUES.map((p) => (
            <option key={p} value={p}>
              {ASSETS_OBJ_HE.filePurpose[p]}
            </option>
          ))}
        </select>
      </div>

      <div
        style={styles.drop}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer && e.dataTransfer.files);
        }}
      >
        <span style={styles.glyph} aria-hidden="true">＋</span>
        <button
          type="button"
          onClick={() => inputRef.current && inputRef.current.click()}
          style={styles.button}
          disabled={busy}
        >
          {busy ? '…' : ASSETS_OBJ_HE.addFiles}
        </button>
        <input
          ref={inputRef}
          type="file"
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: 'none' }}
          accept="image/*,video/*,application/pdf,.stl,.obj,.3dm,.glb,.gltf"
          multiple
        />
      </div>
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' },
  controls: { display: 'flex', flexDirection: 'column', gap: '6px' },
  purposeLabel: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 700,
    color: tokens.color.inkSoft,
  },
  select: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    color: tokens.color.ink,
    background: tokens.color.ivory,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    padding: '9px 10px',
    minHeight: '42px',
    maxWidth: '240px',
  },
  drop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '18px',
    background: tokens.color.canvas,
    border: `1px dashed ${tokens.color.goldSoft}`,
    borderRadius: tokens.radius.md,
  },
  glyph: { fontSize: '22px', color: tokens.color.goldSoft },
  button: {
    minHeight: '44px',
    padding: '10px 22px',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.color.ivory,
    background: tokens.color.charcoal,
    border: 'none',
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
  },
};
