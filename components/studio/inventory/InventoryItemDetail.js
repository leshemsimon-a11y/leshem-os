// components/studio/inventory/InventoryItemDetail.js
//
// LESHEM.S OS — Inventory Item Detail / Edit (Clean 4C.1)
//
// A right-side drawer that opens a single local inventory item for viewing and
// editing: title, item type, ownership/source, availability, owner/client/
// supplier context, basic stone fields and notes. Shows the linked asset's
// primary image when present, and offers actions: save changes, add to Work
// Tray, create a work (Design Project) from the item, and open the linked
// asset. File/image uploads are NOT done here — if the user wants to add media
// we point them to the Asset Library (link an existing asset).
//
// Writes go through the inventory store's update (local, de-bounced by Save).
// No Airtable, no pricing, no PDF, no uploads. Local only.

import * as React from 'react';
import { useState, useEffect } from 'react';
import { tokens } from '../shared/tokens';
import { ITEM_DETAIL_HE, INV_HE } from '../../../lib/studio/labels';
import {
  INV_ITEM_TYPE_VALUES,
  INV_OWNERSHIP_VALUES,
  INV_AVAILABILITY_VALUES,
  INV_STONE_TYPE_VALUES,
} from '../../../lib/studio/inventoryStore';
import { getFileUrl } from '../../../lib/studio/assetsStore';
import AssetThumbnail from '../assets/AssetThumbnail';

const blankFrom = (item) => ({
  title: item.title || '',
  itemType: item.itemType || 'stone',
  ownershipType: item.ownershipType || 'ownedPhysical',
  availabilityStatus: item.availabilityStatus || 'available',
  linkedClientName: item.linkedClientName || '',
  supplierName: item.supplierName || '',
  notes: item.notes || '',
  stoneData: {
    stoneType: (item.stoneData && item.stoneData.stoneType) || '',
    shape: (item.stoneData && item.stoneData.shape) || '',
    weightCt: (item.stoneData && item.stoneData.weightCt) || '',
    color: (item.stoneData && item.stoneData.color) || '',
    clarity: (item.stoneData && item.stoneData.clarity) || '',
    measurements: (item.stoneData && item.stoneData.measurements) || '',
    certificateNumber: (item.stoneData && item.stoneData.certificateNumber) || '',
    lab: (item.stoneData && item.stoneData.lab) || '',
  },
});

export default function InventoryItemDetail({
  item,
  onClose,
  onSave,
  onAddToTray,
  onCreateWork,
  onOpenLinkedAsset,
  onAddFilesViaAssets,
  inTray,
}) {
  const [form, setForm] = useState(() => (item ? blankFrom(item) : null));
  const [savedFlash, setSavedFlash] = useState(false);

  // Re-seed the form whenever a different item is opened.
  useEffect(() => {
    if (item) {
      setForm(blankFrom(item));
      setSavedFlash(false);
    }
  }, [item && item.inventoryItemId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!item || !form) return null;

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const setStone = (key, value) =>
    setForm((f) => ({ ...f, stoneData: { ...f.stoneData, [key]: value } }));

  const handleSave = () => {
    const patch = {
      title: form.title.trim() || 'פריט מלאי',
      itemType: form.itemType,
      ownershipType: form.ownershipType,
      availabilityStatus: form.availabilityStatus,
      linkedClientName: form.linkedClientName.trim() || null,
      supplierName: form.supplierName.trim() || null,
      notes: form.notes,
      stoneData: {
        stoneType: form.stoneData.stoneType || null,
        shape: form.stoneData.shape.trim() || null,
        weightCt: form.stoneData.weightCt === '' ? null : form.stoneData.weightCt,
        color: form.stoneData.color.trim() || null,
        clarity: form.stoneData.clarity.trim() || null,
        measurements: form.stoneData.measurements.trim() || null,
        certificateNumber: form.stoneData.certificateNumber.trim() || null,
        lab: form.stoneData.lab.trim() || null,
      },
    };
    onSave(item.inventoryItemId, patch);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1600);
  };

  const hasLinkedAsset = !!item.primaryAssetObjectId;

  return (
    <>
      <div style={styles.scrim} onClick={onClose} aria-hidden="true" />
      <aside style={styles.drawer} dir="rtl" role="dialog" aria-modal="true">
        <div style={styles.head}>
          <div style={styles.headId}>
            <AssetThumbnail fileId={item.primaryFileId} getFileUrl={getFileUrl} alt={item.title} size={44} />
            <div>
              <h2 style={styles.title}>{ITEM_DETAIL_HE.editItem}</h2>
              <span style={styles.sub}>{INV_HE.itemType[item.itemType] || ITEM_DETAIL_HE.title}</span>
            </div>
          </div>
          <button type="button" onClick={onClose} style={styles.close} aria-label="close">×</button>
        </div>

        <div style={styles.body}>
          {/* Core fields */}
          <Field label={ITEM_DETAIL_HE.fieldTitle}>
            <input value={form.title} onChange={(e) => set('title', e.target.value)} style={styles.input} dir="rtl" />
          </Field>

          <div style={styles.grid2}>
            <Field label={ITEM_DETAIL_HE.fieldItemType}>
              <select value={form.itemType} onChange={(e) => set('itemType', e.target.value)} style={styles.select} dir="rtl">
                {INV_ITEM_TYPE_VALUES.map((t) => (
                  <option key={t} value={t}>{INV_HE.itemType[t] || t}</option>
                ))}
              </select>
            </Field>
            <Field label={ITEM_DETAIL_HE.fieldOwnership}>
              <select value={form.ownershipType} onChange={(e) => set('ownershipType', e.target.value)} style={styles.select} dir="rtl">
                {INV_OWNERSHIP_VALUES.map((o) => (
                  <option key={o} value={o}>{INV_HE.ownership[o] || o}</option>
                ))}
              </select>
            </Field>
          </div>

          <div style={styles.grid2}>
            <Field label={ITEM_DETAIL_HE.fieldAvailability}>
              <select value={form.availabilityStatus} onChange={(e) => set('availabilityStatus', e.target.value)} style={styles.select} dir="rtl">
                {INV_AVAILABILITY_VALUES.map((a) => (
                  <option key={a} value={a}>{INV_HE.availability[a] || a}</option>
                ))}
              </select>
            </Field>
            <Field label={form.ownershipType === 'clientOwned' ? ITEM_DETAIL_HE.fieldClientName : ITEM_DETAIL_HE.fieldSupplierName}>
              {form.ownershipType === 'clientOwned' ? (
                <input value={form.linkedClientName} onChange={(e) => set('linkedClientName', e.target.value)} style={styles.input} dir="rtl" />
              ) : (
                <input value={form.supplierName} onChange={(e) => set('supplierName', e.target.value)} style={styles.input} dir="rtl" />
              )}
            </Field>
          </div>

          {/* Stone fields */}
          <h3 style={styles.stoneHeading}>{ITEM_DETAIL_HE.stoneHeading}</h3>
          <div style={styles.grid2}>
            <Field label={ITEM_DETAIL_HE.fieldStoneType}>
              <select value={form.stoneData.stoneType} onChange={(e) => setStone('stoneType', e.target.value)} style={styles.select} dir="rtl">
                <option value="">{ITEM_DETAIL_HE.none}</option>
                {INV_STONE_TYPE_VALUES.map((s) => (
                  <option key={s} value={s}>{INV_HE.stoneType[s] || s}</option>
                ))}
              </select>
            </Field>
            <Field label={ITEM_DETAIL_HE.fieldShape}>
              <input value={form.stoneData.shape} onChange={(e) => setStone('shape', e.target.value)} style={styles.input} dir="rtl" />
            </Field>
            <Field label={ITEM_DETAIL_HE.fieldWeight}>
              <input value={form.stoneData.weightCt} onChange={(e) => setStone('weightCt', e.target.value)} style={styles.input} dir="ltr" />
            </Field>
            <Field label={ITEM_DETAIL_HE.fieldColor}>
              <input value={form.stoneData.color} onChange={(e) => setStone('color', e.target.value)} style={styles.input} dir="ltr" />
            </Field>
            <Field label={ITEM_DETAIL_HE.fieldClarity}>
              <input value={form.stoneData.clarity} onChange={(e) => setStone('clarity', e.target.value)} style={styles.input} dir="ltr" />
            </Field>
            <Field label={ITEM_DETAIL_HE.fieldMeasurements}>
              <input value={form.stoneData.measurements} onChange={(e) => setStone('measurements', e.target.value)} style={styles.input} dir="ltr" />
            </Field>
            <Field label={ITEM_DETAIL_HE.fieldCertNumber}>
              <input value={form.stoneData.certificateNumber} onChange={(e) => setStone('certificateNumber', e.target.value)} style={styles.input} dir="ltr" />
            </Field>
            <Field label={ITEM_DETAIL_HE.fieldLab}>
              <input value={form.stoneData.lab} onChange={(e) => setStone('lab', e.target.value)} style={styles.input} dir="ltr" />
            </Field>
          </div>

          <Field label={ITEM_DETAIL_HE.fieldNotes}>
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder={ITEM_DETAIL_HE.notesPlaceholder} style={styles.textarea} rows={3} dir="rtl" />
          </Field>

          {/* Linked asset / files */}
          <div style={styles.assetRow}>
            {hasLinkedAsset ? (
              <button type="button" onClick={() => onOpenLinkedAsset(item)} style={styles.ghost}>
                {ITEM_DETAIL_HE.openLinkedAsset}
              </button>
            ) : (
              <span style={styles.noAsset}>{ITEM_DETAIL_HE.noLinkedAsset}</span>
            )}
            <button type="button" onClick={() => onAddFilesViaAssets(item)} style={styles.ghost}>
              {ITEM_DETAIL_HE.addFilesViaAssets}
            </button>
          </div>
        </div>

        {/* Sticky footer actions */}
        <div style={styles.footer}>
          <div style={styles.footerLeft}>
            <button type="button" onClick={() => onAddToTray(item)} disabled={inTray} style={{ ...styles.ghost, ...(inTray ? styles.disabled : null) }}>
              {inTray ? ITEM_DETAIL_HE.inTray : ITEM_DETAIL_HE.addToTray}
            </button>
            <button type="button" onClick={() => onCreateWork(item)} style={styles.ghost}>
              {ITEM_DETAIL_HE.createWork}
            </button>
          </div>
          <button type="button" onClick={handleSave} style={styles.save}>
            {savedFlash ? ITEM_DETAIL_HE.saved : ITEM_DETAIL_HE.save}
          </button>
        </div>
      </aside>
    </>
  );
}

function Field({ label, children }) {
  return (
    <label style={styles.field}>
      <span style={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

const styles = {
  scrim: { position: 'fixed', inset: 0, zIndex: 1090, background: 'rgba(43,40,36,0.38)' },
  drawer: {
    position: 'fixed', top: 0, bottom: 0, insetInlineStart: 0, zIndex: 1091, width: '100%', maxWidth: '460px',
    background: tokens.color.ivory, borderInlineEnd: `1px solid ${tokens.color.cardEdge}`,
    boxShadow: tokens.shadow.lift, display: 'flex', flexDirection: 'column',
  },
  head: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '16px 18px', borderBottom: `1px solid ${tokens.color.cardEdge}` },
  headId: { display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 },
  title: { fontFamily: tokens.font.display, fontSize: '20px', color: tokens.color.charcoal, margin: 0 },
  sub: { fontFamily: tokens.font.body, fontSize: '12px', color: tokens.color.inkFaint },
  close: { fontFamily: tokens.font.body, fontSize: '26px', lineHeight: 1, color: tokens.color.inkSoft, background: 'transparent', border: 'none', cursor: 'pointer' },
  body: { flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  fieldLabel: { fontFamily: tokens.font.body, fontSize: '12px', fontWeight: 600, color: tokens.color.inkSoft },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  input: { boxSizing: 'border-box', width: '100%', fontFamily: tokens.font.body, fontSize: '14px', color: tokens.color.ink, background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md, padding: '10px 12px', minHeight: '44px' },
  select: { boxSizing: 'border-box', width: '100%', fontFamily: tokens.font.body, fontSize: '14px', color: tokens.color.ink, background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md, padding: '10px 12px', minHeight: '44px' },
  textarea: { boxSizing: 'border-box', width: '100%', fontFamily: tokens.font.body, fontSize: '14px', lineHeight: 1.6, color: tokens.color.ink, background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md, padding: '10px 12px', resize: 'vertical' },
  stoneHeading: { fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 700, color: tokens.color.charcoal, margin: '6px 0 0' },
  assetRow: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px', alignItems: 'center' },
  noAsset: { fontFamily: tokens.font.body, fontSize: '12px', color: tokens.color.inkFaint },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '12px 18px', borderTop: `1px solid ${tokens.color.cardEdge}`, flexWrap: 'wrap' },
  footerLeft: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  ghost: { minHeight: '44px', padding: '10px 14px', fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 600, color: tokens.color.inkSoft, background: 'transparent', border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md, cursor: 'pointer' },
  save: { minHeight: '44px', padding: '10px 22px', fontFamily: tokens.font.body, fontSize: '14px', fontWeight: 700, color: tokens.color.ivory, background: tokens.color.charcoal, border: 'none', borderRadius: tokens.radius.md, cursor: 'pointer' },
  disabled: { opacity: 0.5, cursor: 'not-allowed' },
};
