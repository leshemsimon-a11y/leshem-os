// components/studio/inventory/LocalInventorySections.js
//
// LESHEM.S OS — Local Inventory Sections (Clean 4C)
//
// The local working layer of the Inventory page. Renders three local sections —
// physical, virtual supplier, client-owned — plus the quick-add flow and a
// multi-select action bar that sends the selected items to the Work Tray and
// optionally routes into the Design Studio ("התחל עיצוב מהבחירה").
//
// The read-only Airtable physical inventory and the "טיוטות מלאי מנכסים" panel
// remain owned by InventoryStudio; this component is purely the local-items
// surface and the selection bar. Local only — no Airtable, no pricing, no PDF.

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { tokens } from '../shared/tokens';
import { INV_HE } from '../../../lib/studio/labels';
import {
  createUseInventory,
  INV_OWNERSHIP,
} from '../../../lib/studio/inventoryStore';
import { createUseWorkTray } from '../../../lib/studio/workTray';
import { inventoryItemToTrayItem } from '../../../lib/studio/inventoryTrayBridge';
import InventoryQuickAdd from './InventoryQuickAdd';
import LocalInventoryItemCard from './LocalInventoryItemCard';

const useInventory = createUseInventory(React);
const useWorkTray = createUseWorkTray(React);

export default function LocalInventorySections() {
  const router = useRouter();
  const inv = useInventory();
  const tray = useWorkTray();
  const [selectedIds, setSelectedIds] = useState([]);
  const [toast, setToast] = useState(null);

  const flash = (m) => {
    setToast(m);
    setTimeout(() => setToast(null), 2000);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.concat(id)));
  };

  const isInTray = (item) => {
    const ti = inventoryItemToTrayItem(item);
    return ti ? tray.has(ti.id) : false;
  };

  const addOneToTray = (item) => {
    const ti = inventoryItemToTrayItem(item);
    if (ti && !tray.has(ti.id)) {
      tray.addItem(ti);
      flash(INV_HE.addedToTray);
    }
  };

  // Send all currently-selected items to the tray; returns how many were added.
  const sendSelectedToTray = () => {
    const all = inv.items;
    let added = 0;
    selectedIds.forEach((id) => {
      const item = all.find((it) => it.inventoryItemId === id);
      if (!item) return;
      const ti = inventoryItemToTrayItem(item);
      if (ti && !tray.has(ti.id)) {
        tray.addItem(ti);
        added += 1;
      }
    });
    return added;
  };

  const onAddSelected = () => {
    const n = sendSelectedToTray();
    if (n > 0) flash(INV_HE.addedToTray);
    setSelectedIds([]);
  };

  const onStartDesign = () => {
    sendSelectedToTray();
    setSelectedIds([]);
    router.push('/studio/design');
  };

  const onOpenTray = () => {
    router.push('/studio/tray');
  };

  if (!inv.hydrated) {
    return <InventoryQuickAdd onAdd={inv.add} />;
  }

  const physical = inv.items.filter((it) => it.ownershipType === INV_OWNERSHIP.OWNED_PHYSICAL);
  const supplier = inv.items.filter((it) => it.ownershipType === INV_OWNERSHIP.SUPPLIER_VIRTUAL);
  const client = inv.items.filter((it) => it.ownershipType === INV_OWNERSHIP.CLIENT_OWNED);

  const cardProps = {
    onToggleSelect: toggleSelect,
    onAvailability: inv.setAvailability,
    onAddToTray: addOneToTray,
    onRemove: (id) => {
      inv.remove(id);
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    },
  };

  const renderSection = (title, caption, items, emptyMsg) => (
    <section style={styles.section}>
      <div style={styles.secHead}>
        <h2 style={styles.secTitle}>{title}</h2>
        <span style={styles.secCount}>{items.length}</span>
      </div>
      <p style={styles.secCaption}>{caption}</p>
      {items.length === 0 ? (
        <p style={styles.empty}>{emptyMsg}</p>
      ) : (
        <div style={styles.grid}>
          {items.map((item) => (
            <LocalInventoryItemCard
              key={item.inventoryItemId}
              item={item}
              selected={selectedIds.includes(item.inventoryItemId)}
              inTray={isInTray(item)}
              {...cardProps}
            />
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div dir="rtl">
      <InventoryQuickAdd onAdd={inv.add} />

      {renderSection(INV_HE.sectionPhysical, INV_HE.physicalCaption, physical, INV_HE.emptyPhysical)}
      {renderSection(INV_HE.sectionSupplier, INV_HE.supplierCaption, supplier, INV_HE.emptySupplier)}
      {renderSection(INV_HE.sectionClient, INV_HE.clientCaption, client, INV_HE.emptyClient)}

      {/* Selection action bar — appears only when items are selected. */}
      {selectedIds.length > 0 && (
        <div style={styles.bar} dir="rtl">
          <span style={styles.barCount}>{INV_HE.selectedCount(selectedIds.length)}</span>
          <div style={styles.barActions}>
            <button type="button" onClick={onAddSelected} style={styles.barGhost}>{INV_HE.addToTray}</button>
            <button type="button" onClick={onStartDesign} style={styles.barPrimary}>{INV_HE.startDesign}</button>
            <button type="button" onClick={onOpenTray} style={styles.barGhost}>{INV_HE.openTray}</button>
            {/* Collection is a future milestone — shown disabled only as a hint. */}
            <button type="button" disabled style={styles.barDisabled} title={INV_HE.startCollectionSoon}>
              {INV_HE.startCollectionSoon}
            </button>
            <button type="button" onClick={() => setSelectedIds([])} style={styles.barClear}>{INV_HE.clearSelection}</button>
          </div>
        </div>
      )}

      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  );
}

const styles = {
  section: { marginBottom: '26px' },
  secHead: { display: 'flex', alignItems: 'center', gap: '10px' },
  secTitle: { fontFamily: tokens.font.display, fontWeight: 700, fontSize: '22px', color: tokens.color.charcoal, margin: 0 },
  secCount: {
    fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 700, color: tokens.color.gold,
    background: tokens.color.goldFaint, border: `1px solid ${tokens.color.goldSoft}`, borderRadius: '999px', padding: '2px 10px',
  },
  secCaption: { fontFamily: tokens.font.body, fontSize: '13px', lineHeight: 1.6, color: tokens.color.inkSoft, margin: '6px 0 14px', maxWidth: '620px' },
  empty: { fontFamily: tokens.font.body, fontSize: '13px', color: tokens.color.inkFaint, margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' },
  bar: {
    position: 'sticky', bottom: '12px', zIndex: 10, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px',
    marginTop: '20px', padding: '14px 18px', background: tokens.color.charcoal, borderRadius: tokens.radius.lg, boxShadow: tokens.shadow.soft,
  },
  barCount: { fontFamily: tokens.font.body, fontSize: '14px', fontWeight: 700, color: tokens.color.ivory },
  barActions: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginInlineStart: 'auto' },
  barPrimary: {
    minHeight: '44px', padding: '10px 18px', fontFamily: tokens.font.body, fontSize: '14px', fontWeight: 700,
    color: tokens.color.charcoal, background: tokens.color.gold, border: 'none', borderRadius: tokens.radius.md, cursor: 'pointer',
  },
  barGhost: {
    minHeight: '44px', padding: '10px 16px', fontFamily: tokens.font.body, fontSize: '14px', fontWeight: 600,
    color: tokens.color.ivory, background: 'transparent', border: `1px solid ${tokens.color.ivory}`, borderRadius: tokens.radius.md, cursor: 'pointer',
  },
  barDisabled: {
    minHeight: '44px', padding: '10px 16px', fontFamily: tokens.font.body, fontSize: '14px', fontWeight: 600,
    color: 'rgba(245,240,230,0.5)', background: 'transparent', border: '1px dashed rgba(245,240,230,0.4)', borderRadius: tokens.radius.md, cursor: 'not-allowed',
  },
  barClear: {
    minHeight: '44px', padding: '10px 12px', fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 600,
    color: 'rgba(245,240,230,0.8)', background: 'transparent', border: 'none', cursor: 'pointer',
  },
  toast: {
    position: 'fixed', bottom: '78px', left: '50%', transform: 'translateX(-50%)', zIndex: 20,
    fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 600, color: tokens.color.charcoal,
    background: tokens.color.sageFaint, border: `1px solid ${tokens.color.sage}`, borderRadius: tokens.radius.md, padding: '8px 16px', boxShadow: tokens.shadow.soft,
  },
};
