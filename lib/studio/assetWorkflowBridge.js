// lib/studio/assetWorkflowBridge.js
//
// LESHEM.S OS — Asset Workflow Bridge (Clean 4B.2)
//
// Connects the Asset Library to the rest of the OS (Work Tray + Design
// Projects) so the experience reads as "choose a stone / model / reference and
// start designing" — never as a file manager. Pure functions only; no storage,
// no network, no Airtable.
//
// The central helper, assetObjectToTrayItem(object, files), produces a Work
// Tray item that is shape-compatible with the existing tray items (same
// { id, role, addedAt, snapshot } contract used by inventory items) while
// adding asset-source provenance. Inventory → tray behavior is untouched.

import { OBJECT_TYPE } from './assetsStore';
import { resolvePrimaryImageFile } from './assetImage';

// Pick a primary preview image fileId from an object's files, if any.
// Clean 4B.4b QA: use the shared resolver so the user-defined primary image
// is honored consistently everywhere, with safe fallback when old objects do
// not yet carry primaryFileId / coverImageFileId.
function pickPrimaryImage(files, object) {
  return resolvePrimaryImageFile(object, files);
}

function approvedFileIds(files) {
  return (Array.isArray(files) ? files : [])
    .filter((f) => f.status === 'approved')
    .map((f) => f.fileId);
}

// Map an asset object type to a tray-friendly Hebrew descriptor so the tray
// item reads like a stone/reference or a model/reference (not a raw file).
function trayKindHe(objectType) {
  switch (objectType) {
    case OBJECT_TYPE.STONE:
      return 'אבן / רפרנס';
    case OBJECT_TYPE.JEWELRY_MODEL:
      return 'דגם / רפרנס';
    case OBJECT_TYPE.COLLECTION:
      return 'אוסף / רפרנס';
    case OBJECT_TYPE.RENDER_OUTPUT:
      return 'הדמיה / רפרנס';
    default:
      return 'רפרנס';
  }
}

// Build a Work Tray item from an Asset Object. The item's id is derived from
// the objectId so the same object can't be added twice, and is clearly an
// asset-sourced item (source: 'assetLibrary'). previewImageFileId points at a
// stored blob the UI can resolve to a thumbnail via the assets store.
export function assetObjectToTrayItem(object, files) {
  if (!object || typeof object !== 'object' || !object.objectId) return null;
  const primary = pickPrimaryImage(files, object);
  const isStone = object.objectType === OBJECT_TYPE.STONE;
  const isModel = object.objectType === OBJECT_TYPE.JEWELRY_MODEL;

  return {
    id: `asset:${object.objectId}`, // stable, derived from objectId
    role: 'unassigned',
    addedAt: Date.now(),
    source: 'assetLibrary',
    objectId: object.objectId,
    objectType: object.objectType,
    destinationType: object.destinationType || 'undecided',
    ownerContextType: object.ownerContextType || 'internal',
    ownerDisplayName: object.ownerDisplayName || null,
    linkedClientName: object.linkedClientName || null,
    approvedFileIds: approvedFileIds(files),
    previewImageFileId: primary ? primary.fileId : null,
    snapshot: {
      // Keep the uploaded asset's real title as the primary display name.
      // Generic descriptors are kept separately so the tray/design UI does not
      // collapse user assets into names like "אבן / רפרנס".
      name: object.title || null,
      stoneTypeHe: null,
      productTypeHe: null,
      assetKindHe: trayKindHe(object.objectType),
      objectType: object.objectType,
      primaryImage: null, // resolved lazily from IndexedDB by fileId
      primaryImageFileId: primary ? primary.fileId : null,
    },
  };
}

// Build the linked-asset fields to attach to a Design Project payload when
// creating a project from an asset object (or linking one in).
export function projectLinkFromObject(object, files) {
  if (!object || !object.objectId) {
    return { linkedAssetObjectIds: [], linkedAssetFileIds: [], primaryAssetObjectId: null };
  }
  return {
    linkedAssetObjectIds: [object.objectId],
    linkedAssetFileIds: approvedFileIds(files),
    primaryAssetObjectId: object.objectId,
  };
}

// Extract the ownership / client context to INHERIT onto a Design Project
// created from an asset object. Internal stays internal; client context is
// remembered (stored only — never exposed to clients yet). (Clean 4B.3)
export function clientContextFromObject(object) {
  if (!object || typeof object !== 'object') {
    return {
      ownerContextType: 'internal',
      linkedClientId: null,
      linkedClientName: null,
      clientType: null,
      clientTier: null,
      visibilityLevel: 'internalOnly',
      pricingVisibility: 'hidden',
      sharingMode: 'noSharingYet',
    };
  }
  return {
    ownerContextType: object.ownerContextType || 'internal',
    linkedClientId: object.linkedClientId || null,
    linkedClientName: object.linkedClientName || null,
    clientType: object.clientType || null,
    clientTier: object.clientTier || null,
    visibilityLevel: object.visibilityLevel || 'internalOnly',
    pricingVisibility: object.pricingVisibility || 'hidden',
    sharingMode: object.sharingMode || 'noSharingYet',
  };
}
