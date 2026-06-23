// lib/studio/inventoryTrayBridge.js
//
// LESHEM.S OS — Inventory → Work Tray Bridge (Clean 4C)
//
// Pure functions that turn local inventory items (manual / supplier / client /
// asset-draft) into Work Tray items, shape-compatible with the existing tray
// item contract ({ id, role, addedAt, source, snapshot }). Inventory →
// Work Tray preserves title, image, source/ownership and client/supplier
// context; the role stays 'unassigned' so it can be set later in the Work Tray
// or Design Studio. Existing asset-to-tray behavior is untouched (that path
// uses assetWorkflowBridge.assetObjectToTrayItem).

// Hebrew descriptor for an inventory source/ownership, used so the tray card
// can show where the item came from without exposing internal ids.
export function inventorySourceHe(item) {
  const o = item && item.ownershipType;
  switch (o) {
    case 'ownedPhysical':
      return 'מלאי פיזי';
    case 'supplierVirtual':
      return 'מלאי ספק וירטואלי';
    case 'clientOwned':
      return 'סחורה של לקוח';
    case 'internalDraft':
      return 'טיוטת מלאי';
    default:
      return 'מלאי';
  }
}

// Build a Work Tray item from a local inventory item. The id is derived from
// the inventoryItemId so the same item can't be added twice and is clearly an
// inventory-sourced item (source: 'inventory'). When the item carries a linked
// asset primary image, both previewImageFileId and snapshot.primaryImageFileId
// are set so TrayItemCard resolves the thumbnail from IndexedDB; otherwise the
// tray falls back to its normal (empty) preview.
export function inventoryItemToTrayItem(item) {
  if (!item || typeof item !== 'object' || !item.inventoryItemId) return null;
  const fileId = item.primaryFileId || null;
  const sd = item.stoneData || {};
  const carat =
    sd.weightCt != null && sd.weightCt !== ''
      ? (typeof sd.weightCt === 'number' ? sd.weightCt : parseFloat(sd.weightCt))
      : null;

  return {
    id: `inventory:${item.inventoryItemId}`,
    role: 'unassigned',
    addedAt: Date.now(),
    source: 'inventory',
    inventoryItemId: item.inventoryItemId,
    inventorySource: item.source || 'manual',
    ownershipType: item.ownershipType || null,
    ownerContextType: item.ownerContextType || 'internal',
    linkedClientName: item.linkedClientName || null,
    supplierName: item.supplierName || null,
    availabilityStatus: item.availabilityStatus || null,
    itemType: item.itemType || null,
    previewImageFileId: fileId,
    snapshot: {
      name: item.title || null,
      // Generic descriptor of provenance (shown as a quiet line on the card).
      sourceHe: inventorySourceHe(item),
      ownershipType: item.ownershipType || null,
      availabilityStatus: item.availabilityStatus || null,
      linkedClientName: item.linkedClientName || null,
      supplierName: item.supplierName || null,
      itemType: item.itemType || null,
      // Optional stone identity (only what was entered).
      caratWeight: Number.isFinite(carat) ? carat : null,
      color: sd.color || null,
      clarity: sd.clarity || null,
      shapeHe: sd.shape || null,
      // Image: inventory items resolve via IndexedDB fileId when present.
      primaryImage: null,
      primaryImageFileId: fileId,
    },
  };
}
