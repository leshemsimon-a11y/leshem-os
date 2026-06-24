// components/studio/inventory/InventoryQuickAdd.js
//
// LESHEM.S OS — Inventory Quick Add (Clean 4C)
//
// A simple, non-overwhelming flow to manually create a local inventory item:
// a single stone, melee parcel, jewelry part, chain, component, client-owned
// stone, or virtual supplier stone. Only title + type + source are required;
// basic stone data and notes are optional (collapsed by default). No pricing,
// no certificate parsing, no Airtable — local store only.

import { useState } from 'react';
import { tokens } from '../shared/tokens';
import { INV_HE } from '../../../lib/studio/labels';
import {
  INV_ITEM_TYPE_VALUES,
  INV_SOURCE,
  INV_STONE_TYPE_VALUES,
} from '../../../lib/studio/inventoryStore';

const SOURCE_OPTIONS = [
  INV_SOURCE.MANUAL,
  INV_SOURCE.SUPPLIER_VIRTUAL,
  INV_SOURCE.CLIENT_OWNED,
];

export default function InventoryQuickAdd({ onAdd, initialOpen = false, initialSource = null }) {
  const [open, setOpen] = useState(!!initialOpen);
  const [title, setTitle] = useState('');
  const [itemType, setItemType] = useState('stone');
  const [source, setSource] = useState(
    initialSource === 'clientOwned' ? INV_SOURCE.CLIENT_OWNED : INV_SOURCE.MANUAL
  );
  const [supplierName, setSupplierName] = useState('');
  const [clientName, setClientName] = useState('');
  const [notes, setNotes] = useState('');
  const [showStone, setShowStone] = useState(false);
  const [stone, setStone] = useState({
    stoneType: '', shape: '', weightCt: '', color: '', clarity: '',
    measurements: '', certificateNumber: '', lab: '', cut: '', fluorescence: '',
  });

  const reset = () => {
    setTitle(''); setItemType('stone'); setSource(INV_SOURCE.MANUAL);
    setSupplierName(''); setClientName(''); setNotes(''); setShowStone(false);
    setStone({ stoneType: '', shape: '', weightCt: '', color: '', clarity: '', measurements: '', certificateNumber: '', lab: '', cut: '', fluorescence: '' });
  };

  const submit = () => {
    if (!title.trim()) return;
    const stoneData = {};
    Object.keys(stone).forEach((k) => {
      const v = stone[k];
      if (v != null && String(v).trim()) stoneData[k] = String(v).trim();
    });
    onAdd({
      title: title.trim(),
      itemType,
      source,
      ownerContextType: source === INV_SOURCE.CLIENT_OWNED ? 'privateClient' : 'internal',
      supplierName: source === INV_SOURCE.SUPPLIER_VIRTUAL ? supplierName.trim() || null : null,
      linkedClientName: source === INV_SOURCE.CLIENT_OWNED ? clientName.trim() || null : null,
      notes: notes.trim(),
      stoneData,
    });
    reset();
    setOpen(false);
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} style={styles.openBtn}>
        ＋ {INV_HE.quickAddOpen}
      </button>
    );
  }

  return (
    <section style={styles.wrap} dir="rtl">
      <div style={styles.head}>
        <h3 style={styles.title}>{INV_HE.quickAddTitle}</h3>
        <button type="button" onClick={() => { reset(); setOpen(false); }} style={styles.closeBtn}>
          {INV_HE.quickAddClose}
        </button>
      </div>

      <label style={styles.label}>{INV_HE.titleLabel}</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={INV_HE.titlePlaceholder}
        style={styles.input}
        dir="rtl"
      />

      <div style={styles.row2}>
        <div style={styles.col}>
          <label style={styles.label}>{INV_HE.itemTypeLabel}</label>
          <select value={itemType} onChange={(e) => setItemType(e.target.value)} style={styles.select} dir="rtl">
            {INV_ITEM_TYPE_VALUES.map((t) => (
              <option key={t} value={t}>{INV_HE.itemType[t]}</option>
            ))}
          </select>
        </div>
        <div style={styles.col}>
          <label style={styles.label}>{INV_HE.sourceLabel}</label>
          <select value={source} onChange={(e) => setSource(e.target.value)} style={styles.select} dir="rtl">
            {SOURCE_OPTIONS.map((s) => (
              <option key={s} value={s}>{INV_HE.source[s]}</option>
            ))}
          </select>
        </div>
      </div>

      {source === INV_SOURCE.SUPPLIER_VIRTUAL && (
        <>
          <label style={styles.label}>{INV_HE.supplierNameLabel}</label>
          <input value={supplierName} onChange={(e) => setSupplierName(e.target.value)} style={styles.input} dir="rtl" />
        </>
      )}
      {source === INV_SOURCE.CLIENT_OWNED && (
        <>
          <label style={styles.label}>{INV_HE.clientNameLabel}</label>
          <input value={clientName} onChange={(e) => setClientName(e.target.value)} style={styles.input} dir="rtl" />
        </>
      )}

      <button type="button" onClick={() => setShowStone((s) => !s)} style={styles.stoneToggle}>
        {showStone ? '−' : '+'} {INV_HE.stoneDataToggle}
      </button>

      {showStone && (
        <div style={styles.stoneGrid}>
          <Field label={INV_HE.stoneTypeLabel}>
            <select
              value={stone.stoneType}
              onChange={(e) => setStone((s) => ({ ...s, stoneType: e.target.value }))}
              style={styles.select}
              dir="rtl"
            >
              <option value="">—</option>
              {INV_STONE_TYPE_VALUES.map((t) => (
                <option key={t} value={t}>{INV_HE.stoneType[t]}</option>
              ))}
            </select>
          </Field>
          <Field label={INV_HE.shapeLabel}><input value={stone.shape} onChange={(e) => setStone((s) => ({ ...s, shape: e.target.value }))} style={styles.input} dir="rtl" /></Field>
          <Field label={INV_HE.weightLabel}><input value={stone.weightCt} onChange={(e) => setStone((s) => ({ ...s, weightCt: e.target.value }))} style={styles.input} inputMode="decimal" dir="ltr" /></Field>
          <Field label={INV_HE.colorLabel}><input value={stone.color} onChange={(e) => setStone((s) => ({ ...s, color: e.target.value }))} style={styles.input} dir="ltr" /></Field>
          <Field label={INV_HE.clarityLabel}><input value={stone.clarity} onChange={(e) => setStone((s) => ({ ...s, clarity: e.target.value }))} style={styles.input} dir="ltr" /></Field>
          <Field label={INV_HE.measurementsLabel}><input value={stone.measurements} onChange={(e) => setStone((s) => ({ ...s, measurements: e.target.value }))} style={styles.input} dir="ltr" /></Field>
          <Field label={INV_HE.certNumberLabel}><input value={stone.certificateNumber} onChange={(e) => setStone((s) => ({ ...s, certificateNumber: e.target.value }))} style={styles.input} dir="ltr" /></Field>
          <Field label={INV_HE.labLabel}><input value={stone.lab} onChange={(e) => setStone((s) => ({ ...s, lab: e.target.value }))} style={styles.input} dir="ltr" /></Field>
          <Field label={INV_HE.cutLabel}><input value={stone.cut} onChange={(e) => setStone((s) => ({ ...s, cut: e.target.value }))} style={styles.input} dir="ltr" /></Field>
          <Field label={INV_HE.fluorescenceLabel}><input value={stone.fluorescence} onChange={(e) => setStone((s) => ({ ...s, fluorescence: e.target.value }))} style={styles.input} dir="ltr" /></Field>
        </div>
      )}

      <label style={styles.label}>{INV_HE.notesLabel}</label>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={INV_HE.notesPlaceholder} style={styles.textarea} rows={2} dir="rtl" />

      <div style={styles.actions}>
        <button type="button" onClick={() => { reset(); setOpen(false); }} style={styles.ghost}>{INV_HE.cancel}</button>
        <button type="button" onClick={submit} disabled={!title.trim()} style={{ ...styles.primary, ...(!title.trim() ? styles.disabled : null) }}>
          {INV_HE.add}
        </button>
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <div style={styles.col}>
      <label style={styles.miniLabel}>{label}</label>
      {children}
    </div>
  );
}

const styles = {
  openBtn: {
    minHeight: '48px', padding: '12px 22px', fontFamily: tokens.font.body, fontSize: '15px', fontWeight: 600,
    color: tokens.color.ivory, background: tokens.color.charcoal, border: 'none', borderRadius: tokens.radius.md,
    cursor: 'pointer', boxShadow: tokens.shadow.soft, marginBottom: '20px',
  },
  wrap: {
    display: 'flex', flexDirection: 'column', gap: '10px', padding: '18px', marginBottom: '24px',
    background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.lg,
  },
  head: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: tokens.font.display, fontSize: '20px', color: tokens.color.charcoal, margin: 0 },
  closeBtn: { fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 600, color: tokens.color.inkSoft, background: 'transparent', border: 'none', cursor: 'pointer' },
  label: { fontFamily: tokens.font.body, fontSize: '12px', fontWeight: 700, color: tokens.color.inkSoft, marginTop: '4px' },
  miniLabel: { fontFamily: tokens.font.body, fontSize: '11px', fontWeight: 600, color: tokens.color.inkFaint },
  input: {
    width: '100%', boxSizing: 'border-box', fontFamily: tokens.font.body, fontSize: '14px', color: tokens.color.ink,
    background: tokens.color.ivory, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md, padding: '10px 12px', minHeight: '44px', outline: 'none',
  },
  select: {
    width: '100%', boxSizing: 'border-box', fontFamily: tokens.font.body, fontSize: '14px', color: tokens.color.ink,
    background: tokens.color.ivory, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md, padding: '10px 12px', minHeight: '44px',
  },
  textarea: {
    width: '100%', boxSizing: 'border-box', fontFamily: tokens.font.body, fontSize: '14px', lineHeight: 1.5, color: tokens.color.ink,
    background: tokens.color.ivory, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md, padding: '10px 12px', resize: 'vertical', outline: 'none',
  },
  row2: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  col: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '140px' },
  stoneToggle: {
    alignSelf: 'flex-start', fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 600, color: tokens.color.gold,
    background: 'transparent', border: 'none', cursor: 'pointer', marginTop: '4px',
  },
  stoneGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' },
  actions: { display: 'flex', gap: '8px', marginTop: '10px' },
  primary: {
    minHeight: '48px', padding: '12px 26px', fontFamily: tokens.font.body, fontSize: '15px', fontWeight: 600,
    color: tokens.color.ivory, background: tokens.color.charcoal, border: 'none', borderRadius: tokens.radius.md, cursor: 'pointer',
  },
  ghost: {
    minHeight: '48px', padding: '12px 18px', fontFamily: tokens.font.body, fontSize: '14px', fontWeight: 600,
    color: tokens.color.inkSoft, background: 'transparent', border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md, cursor: 'pointer',
  },
  disabled: { opacity: 0.5, cursor: 'not-allowed' },
};
