// lib/studio/assetContext.js
//
// LESHEM.S OS — Clean 7B: Asset-Aware Context v1.
//
// Collects and normalizes asset-like data that ALREADY exists on Work Files
// (Design Projects) and the assets store, into a simple uniform shape:
//   { id, name, type, fileType, role, previewUrl, status, source }
//
// READ-ONLY by design: pure normalization over existing fields
// (project.linkedAssetFileIds / linkedAssetObjectIds / primaryAssetObjectId,
// plus asset objects whose linkedDesignProjectId points at the project) and
// the EXISTING public assets getters (getAllFiles / getAllObjects /
// getFileUrl). No new storage, no new persistence keys, no store internals.

import { getAllFiles, getAllObjects, getFileUrl, FILE_KIND } from './assetsStore';
import { ASSETS_OBJ_HE } from './labels';

// Clean 7B role vocabulary (Hebrew, per spec). Existing filePurpose labels
// win when a real purpose is set; otherwise we infer a display role.
const ROLE_HE = Object.freeze({
  model: 'מודל תכשיט',
  reference: 'רפרנס עיצוב',
  sketch: 'סקיצה',
  clientFile: 'קובץ לקוח',
  media: 'נכס מדיה',
});

const IMAGE_KINDS = [FILE_KIND.IMAGE, FILE_KIND.SKETCH, FILE_KIND.RENDER];
const MODEL_EXT_PREVIEWABLE = ['stl', 'obj', 'glb', 'gltf'];

export function isImageAsset(asset) {
  return Boolean(asset && IMAGE_KINDS.includes(asset.type));
}

export function isPreviewableModel(asset) {
  return Boolean(asset && asset.type === FILE_KIND.MODEL_3D && MODEL_EXT_PREVIEWABLE.includes(asset.fileType));
}

// Display role: existing purpose label if a real purpose is set; otherwise a
// sensible inferred role from the file kind / extension.
export function inferRoleHe(file) {
  if (!file) return ROLE_HE.media;
  if (file.filePurpose && file.filePurpose !== 'none' && ASSETS_OBJ_HE.filePurpose[file.filePurpose]) {
    return ASSETS_OBJ_HE.filePurpose[file.filePurpose];
  }
  if (file.fileKind === FILE_KIND.MODEL_3D) return ROLE_HE.model;
  if (file.fileKind === FILE_KIND.SKETCH) return ROLE_HE.sketch;
  if (file.fileKind === FILE_KIND.IMAGE || file.fileKind === FILE_KIND.RENDER) return ROLE_HE.reference;
  if (file.fileKind === FILE_KIND.DOCUMENT || file.fileKind === FILE_KIND.PDF) return ROLE_HE.clientFile;
  return ROLE_HE.media;
}

// Normalize one asset-file record into the uniform Work Asset shape.
export function normalizeWorkAsset(file, source) {
  if (!file || !file.fileId) return null;
  return {
    id: file.fileId,
    name: file.fileName || 'קובץ ללא שם',
    type: file.fileKind || 'other', // canonical kind: image|model3d|sketch|...
    fileType: (file.extension || '').toLowerCase(), // e.g. jpg / stl / obj / 3dm
    role: inferRoleHe(file),
    previewUrl: null, // resolved separately (async, blob-backed)
    status: file.status || 'draft',
    source: source || 'linked',
  };
}

// ---------------------------------------------------------------------------
// Pure collection: which asset files belong to this Work File?
//   • project.linkedAssetFileIds — direct file linkage
//   • project.linkedAssetObjectIds + primaryAssetObjectId — all their files
//   • asset objects whose linkedDesignProjectId === project.id — all their files
// Inputs are pre-loaded arrays (from the public getters / useAssets hook), so
// this stays synchronous, pure, and testable.
// ---------------------------------------------------------------------------
export function collectProjectWorkAssets(project, allFiles, allObjects) {
  const p = project || {};
  const files = Array.isArray(allFiles) ? allFiles : [];
  const objects = Array.isArray(allObjects) ? allObjects : [];

  const directFileIds = new Set(Array.isArray(p.linkedAssetFileIds) ? p.linkedAssetFileIds : []);
  const objectIds = new Set(Array.isArray(p.linkedAssetObjectIds) ? p.linkedAssetObjectIds : []);
  if (p.primaryAssetObjectId) objectIds.add(p.primaryAssetObjectId);
  objects.forEach((o) => {
    if (o && o.linkedDesignProjectId && p.id && o.linkedDesignProjectId === p.id) {
      objectIds.add(o.objectId);
    }
  });

  const seen = new Set();
  const out = [];
  files.forEach((f) => {
    if (!f || !f.fileId || seen.has(f.fileId)) return;
    let source = null;
    if (directFileIds.has(f.fileId)) source = 'workFile';
    else if (f.objectId && objectIds.has(f.objectId)) source = 'assetObject';
    if (!source) return;
    seen.add(f.fileId);
    const normalized = normalizeWorkAsset(f, source);
    if (normalized) out.push(normalized);
  });
  return out;
}

// Async preview resolution for image-like assets (existing public getFileUrl
// → IndexedDB blob object-URL). Model files are NOT resolved here — the
// panel resolves a model URL on demand only when the user opens the viewer.
export async function withPreviewUrls(assets) {
  const list = Array.isArray(assets) ? assets : [];
  const out = [];
  for (const a of list) {
    if (isImageAsset(a)) {
      try {
        const url = await getFileUrl(a.id);
        out.push({ ...a, previewUrl: url || null });
      } catch (e) {
        out.push(a);
      }
    } else {
      out.push(a);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// createUseWorkAssets(React) → useWorkAssets(project)
// Read-only hook: loads files+objects through the EXISTING public async
// getters, collects this project's Work Assets, and resolves image preview
// URLs. Fully guarded — in environments without IndexedDB it degrades to an
// empty list without throwing. No writes, no persistence.
// ---------------------------------------------------------------------------
export function createUseWorkAssets(React) {
  const { useState, useEffect } = React;
  return function useWorkAssets(project) {
    const [assets, setAssets] = useState([]);
    const [hydrated, setHydrated] = useState(false);
    const projectId = project && project.id ? project.id : null;

    useEffect(() => {
      let alive = true;
      if (!projectId) {
        setAssets([]);
        setHydrated(true);
        return undefined;
      }
      (async () => {
        try {
          const [allFiles, allObjects] = await Promise.all([getAllFiles(), getAllObjects()]);
          if (!alive) return;
          const collected = collectProjectWorkAssets(project, allFiles, allObjects);
          const resolved = await withPreviewUrls(collected);
          if (!alive) return;
          setAssets(resolved);
        } catch (e) {
          if (alive) setAssets([]);
        } finally {
          if (alive) setHydrated(true);
        }
      })();
      return () => {
        alive = false;
      };
      // project linkage arrays are stable per saved project revision; the id
      // is the meaningful dependency.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    return { assets, hydrated };
  };
}

// Sync count for compact displays (no async loads): direct file linkage only.
// Object-linked files require the files map, so lists that already loaded
// assets should prefer assets.length.
export function countDirectLinkedAssets(project) {
  const p = project || {};
  return Array.isArray(p.linkedAssetFileIds) ? p.linkedAssetFileIds.length : 0;
}
