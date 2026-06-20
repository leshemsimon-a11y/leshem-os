// components/studio/assets/FileIntakeReview.js
//
// LESHEM.S OS — File Intake Review (Clean 4B.3)
//
// After selecting / dropping / pasting files, the user reviews a simple list
// before saving: file name, detected kind, detected purpose, status — all
// editable. Low-confidence detections are flagged for confirmation. On save,
// the files are written to the current Asset Object (default) or split into
// separate objects. Local only.

import { useState } from 'react';
import { tokens } from '../shared/tokens';
import { DETECT_HE, ASSETS_OBJ_HE, ASSETS_HE } from '../../../lib/studio/labels';
import {
  FILE_KIND_VALUES,
  FILE_PURPOSE_VALUES,
  FILE_CATEGORY_VALUES,
  STATUS_VALUES,
} from '../../../lib/studio/assetsStore';

export default function FileIntakeReview({ pending, onCommit, onCancel, allowSplit }) {
  // pending: [{ file, detected }]
  const [rows, setRows] = useState(
    pending.map((p) => ({ file: p.file, ...p.detected }))
  );
  const [mode, setMode] = useState('current'); // current | separate

  const patch = (idx, key, value) => {
    setRows((rs) => rs.map((r, i) => (i === idx ? { ...r, [key]: value } : r)));
  };

  const commit = () => {
    onCommit(rows, mode === 'separate');
  };

  return (
    <div style={styles.wrap} dir="rtl">
      <div style={styles.head}>
        <span style={styles.title}>{DETECT_HE.reviewTitle}</span>
      </div>

      {allowSplit && (
        <div style={styles.modeRow}>
          <button
            type="button"
            onClick={() => setMode('current')}
            style={{ ...styles.modeChip, ...(mode === 'current' ? styles.modeActive : null) }}
          >
            {DETECT_HE.addAllToCurrent}
          </button>
          <button
            type="button"
            onClick={() => setMode('separate')}
            style={{ ...styles.modeChip, ...(mode === 'separate' ? styles.modeActive : null) }}
          >
            {DETECT_HE.splitSeparate}
          </button>
        </div>
      )}

      <div style={styles.list}>
        {rows.map((r, idx) => (
          <div key={idx} style={styles.row}>
            <div style={styles.nameCol}>
              <span style={styles.name} title={r.fileName}>{r.fileName}</span>
              {r.needsConfirm && <span style={styles.warn}>{DETECT_HE.lowConfidence}</span>}
            </div>
            <div style={styles.controls}>
              <label style={styles.miniLabel}>{DETECT_HE.detectedType}</label>
              <select value={r.fileKind} onChange={(e) => patch(idx, 'fileKind', e.target.value)} style={styles.select} dir="rtl">
                {FILE_KIND_VALUES.map((k) => (
                  <option key={k} value={k}>{ASSETS_OBJ_HE.fileKind[k]}</option>
                ))}
              </select>
              <label style={styles.miniLabel}>{DETECT_HE.detectedPurpose}</label>
              <select value={r.filePurpose} onChange={(e) => patch(idx, 'filePurpose', e.target.value)} style={styles.select} dir="rtl">
                {FILE_PURPOSE_VALUES.map((p) => (
                  <option key={p} value={p}>{ASSETS_OBJ_HE.filePurpose[p]}</option>
                ))}
              </select>
              <label style={styles.miniLabel}>{DETECT_HE.detectedCategory}</label>
              <select value={r.category} onChange={(e) => patch(idx, 'category', e.target.value)} style={styles.select} dir="rtl">
                {FILE_CATEGORY_VALUES.map((c) => (
                  <option key={c} value={c}>{ASSETS_HE.category[c]}</option>
                ))}
              </select>
              <label style={styles.miniLabel}>{DETECT_HE.status}</label>
              <select value={r.status} onChange={(e) => patch(idx, 'status', e.target.value)} style={styles.select} dir="rtl">
                {STATUS_VALUES.filter((s) => s !== 'archived').map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.actions}>
        <button type="button" onClick={onCancel} style={styles.ghost}>{DETECT_HE.cancel}</button>
        <button type="button" onClick={commit} style={styles.primary}>{DETECT_HE.saveFiles}</button>
      </div>
    </div>
  );
}

const STATUS_LABELS = { draft: 'טיוטה', reference: 'רפרנס', approved: 'מאושר' };

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '12px', padding: '14px', background: tokens.color.pearl, border: `1px solid ${tokens.color.goldSoft}`, borderRadius: tokens.radius.md, marginTop: '10px' },
  head: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  title: { fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 700, color: tokens.color.charcoal },
  modeRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  modeChip: { minHeight: '38px', padding: '7px 12px', fontFamily: tokens.font.body, fontSize: '12px', fontWeight: 600, color: tokens.color.charcoal, background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: '999px', cursor: 'pointer' },
  modeActive: { background: tokens.color.goldFaint, border: `1px solid ${tokens.color.gold}` },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  row: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md },
  nameCol: { display: 'flex', flexDirection: 'column', gap: '3px' },
  name: { fontFamily: tokens.font.body, fontSize: '14px', fontWeight: 600, color: tokens.color.charcoal, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  warn: { fontFamily: tokens.font.body, fontSize: '11px', color: tokens.color.gold },
  controls: { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 10px', alignItems: 'center' },
  miniLabel: { fontFamily: tokens.font.body, fontSize: '11px', color: tokens.color.inkSoft, whiteSpace: 'nowrap' },
  select: { fontFamily: tokens.font.body, fontSize: '13px', color: tokens.color.ink, background: tokens.color.ivory, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.sm, padding: '7px 8px', minHeight: '38px' },
  actions: { display: 'flex', gap: '8px', justifyContent: 'flex-start' },
  primary: { minHeight: '44px', padding: '10px 22px', fontFamily: tokens.font.body, fontSize: '14px', fontWeight: 600, color: tokens.color.ivory, background: tokens.color.charcoal, border: 'none', borderRadius: tokens.radius.md, cursor: 'pointer' },
  ghost: { minHeight: '44px', padding: '10px 16px', fontFamily: tokens.font.body, fontSize: '14px', fontWeight: 600, color: tokens.color.inkSoft, background: 'transparent', border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md, cursor: 'pointer' },
};
