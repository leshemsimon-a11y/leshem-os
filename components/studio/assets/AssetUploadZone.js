// components/studio/assets/AssetUploadZone.js
//
// LESHEM.S OS — Asset Upload Zone (Clean 4B.3)
//
// Adds files to a GIVEN Asset Object via drag-drop, file picker, or clipboard
// paste. Files are auto-detected (kind / category / purpose) using the object's
// intake context, then shown in a review list before saving. By DEFAULT all
// selected files are added to the CURRENT object (no splitting); the user may
// opt to split into separate objects. Local only — files persist in IndexedDB.

import { useRef, useState, useEffect } from 'react';
import { tokens } from '../shared/tokens';
import { DETECT_HE } from '../../../lib/studio/labels';
import { detectFiles } from '../../../lib/studio/fileDetection';
import FileIntakeReview from './FileIntakeReview';

export default function AssetUploadZone({ object, store }) {
  const inputRef = useRef(null);
  const zoneRef = useRef(null);
  const [pending, setPending] = useState(null); // [{file, detected}] or null
  const [busy, setBusy] = useState(false);

  const context = {
    objectType: object.objectType,
    intakeType: object.intakeType,
    destinationType: object.destinationType,
  };

  const stage = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setPending(detectFiles(files, context));
  };

  const handlePaste = (e) => {
    if (!e.clipboardData) return;
    const files = [];
    for (const item of e.clipboardData.items || []) {
      if (item.kind === 'file') {
        const f = item.getAsFile();
        if (f) files.push(f);
      }
    }
    if (files.length > 0) {
      e.preventDefault();
      stage(files);
    }
  };

  // Clipboard paste — click/focus the upload zone, then Ctrl+V / Cmd+V.
  useEffect(() => {
    const node = zoneRef.current;
    if (node) node.addEventListener('paste', handlePaste);
    return () => {
      if (node) node.removeEventListener('paste', handlePaste);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [object.objectId, object.objectType, object.destinationType]);

  const commit = async (rows, split) => {
    setBusy(true);
    if (!split) {
      // default: all into current object
      for (const r of rows) {
        const meta = {
          fileName: r.fileName,
          mimeType: r.mimeType,
          extension: r.extension,
          fileSize: r.fileSize,
          fileKind: r.fileKind,
          filePurpose: r.filePurpose,
          category: r.category,
          status: r.status,
        };
        // eslint-disable-next-line no-await-in-loop
        await store.addFile(object.objectId, meta, r.file);
      }
    } else {
      // split: a new object per file, inheriting this object's context
      for (const r of rows) {
        // eslint-disable-next-line no-await-in-loop
        const obj = await store.createObject({
          title: r.fileName,
          objectType: object.objectType,
          ownerContextType: object.ownerContextType,
          ownerDisplayName: object.ownerDisplayName,
          linkedClientName: object.linkedClientName,
          clientType: object.clientType,
          clientTier: object.clientTier,
          destinationType: object.destinationType,
          status: 'draft',
        });
        const meta = {
          fileName: r.fileName,
          mimeType: r.mimeType,
          extension: r.extension,
          fileSize: r.fileSize,
          fileKind: r.fileKind,
          filePurpose: r.filePurpose,
          category: r.category,
          status: r.status,
        };
        // eslint-disable-next-line no-await-in-loop
        if (obj && obj.objectId) await store.addFile(obj.objectId, meta, r.file);
      }
    }
    setBusy(false);
    setPending(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div style={styles.wrap} dir="rtl" ref={zoneRef} tabIndex={0} onPaste={handlePaste}>
      {!pending && (
        <div
          style={styles.drop}
          onClick={() => zoneRef.current && zoneRef.current.focus()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            stage(e.dataTransfer && e.dataTransfer.files);
          }}
        >
          <span style={styles.glyph} aria-hidden="true">＋</span>
          <span style={styles.hint}>{DETECT_HE.dropHint}</span>
          <button
            type="button"
            onClick={() => inputRef.current && inputRef.current.click()}
            style={styles.button}
            disabled={busy}
          >
            {busy ? '…' : 'בחירת קבצים'}
          </button>
          <input
            ref={inputRef}
            type="file"
            onChange={(e) => stage(e.target.files)}
            style={{ display: 'none' }}
            accept="image/*,video/*,application/pdf,.stl,.obj,.3dm,.glb,.gltf"
            multiple
          />
        </div>
      )}

      {pending && (
        <FileIntakeReview
          pending={pending}
          onCommit={commit}
          onCancel={() => setPending(null)}
          allowSplit
        />
      )}
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', outline: 'none' },
  drop: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '22px', background: tokens.color.canvas, border: `1px dashed ${tokens.color.goldSoft}`, borderRadius: tokens.radius.md, textAlign: 'center' },
  glyph: { fontSize: '24px', color: tokens.color.goldSoft },
  hint: { fontFamily: tokens.font.body, fontSize: '13px', color: tokens.color.inkSoft },
  button: { minHeight: '44px', padding: '10px 22px', fontFamily: tokens.font.body, fontSize: '14px', fontWeight: 600, color: tokens.color.ivory, background: tokens.color.charcoal, border: 'none', borderRadius: tokens.radius.md, cursor: 'pointer' },
};
