// lib/studio/assetsStore.js
//
// LESHEM.S OS — Asset Library Store (Clean 4B.1, upgraded)
//
// Replaces the Clean 4B flat "one file = one asset" model with a two-level
// OBJECT + FILES model persisted in IndexedDB (see assetsDb.js):
//   • AssetObject — a piece of reusable design knowledge (a stone, a jewelry
//     model, a design project reference, a collection, a render output…).
//   • AssetFile   — one file belonging to an object (image / video / 3D / pdf /
//     sketch / render / document). The binary Blob lives in IndexedDB.
//
// This module owns the canonical enums, defensive normalization, and an async
// API that orchestrates assetsDb. It also exposes a React hook that hydrates
// from IndexedDB on mount so uploads survive a refresh.
//
// HARD RULES: local only. No cloud, no backend, no Airtable, no network, no
// paid services, no API keys, no new npm packages, no commerce wording.

import {
  dbPutObject,
  dbGetAllObjects,
  dbDeleteObject,
  dbPutFile,
  dbPutFileMetaOnly,
  dbGetAllFiles,
  dbGetFilesForObject,
  dbDeleteFile,
  dbDeleteFilesForObject,
  dbGetBlobUrl,
} from './assetsDb';

// ---------------------------------------------------------------------------
// Canonical enums (English values; Hebrew labels live in labels.js)
// ---------------------------------------------------------------------------
export const OBJECT_TYPE = Object.freeze({
  STONE: 'stone',
  JEWELRY_MODEL: 'jewelryModel',
  DESIGN_PROJECT: 'designProject',
  COLLECTION: 'collection',
  RENDER_OUTPUT: 'renderOutput',
  CLIENT_REFERENCE: 'clientReference',
  INSPIRATION: 'inspiration',
  OTHER: 'other',
});
export const OBJECT_TYPE_VALUES = Object.freeze(Object.values(OBJECT_TYPE));

export const FILE_KIND = Object.freeze({
  IMAGE: 'image',
  VIDEO: 'video',
  MODEL_3D: 'model3d',
  PDF: 'pdf',
  SKETCH: 'sketch',
  RENDER: 'render',
  DOCUMENT: 'document',
  OTHER: 'other',
});
export const FILE_KIND_VALUES = Object.freeze(Object.values(FILE_KIND));

export const FILE_PURPOSE = Object.freeze({
  PRODUCTION_MODEL: 'productionModel',
  PRESENTATION_MODEL: 'presentationModel',
  STONE_SCAN: 'stoneScan',
  MEASUREMENT_REFERENCE: 'measurementReference',
  RENDER_REFERENCE: 'renderReference',
  NONE: 'none',
});
export const FILE_PURPOSE_VALUES = Object.freeze(Object.values(FILE_PURPOSE));

// File categories carried forward from Clean 4B (still useful on files).
export const FILE_CATEGORY = Object.freeze({
  STONE_IMAGE: 'stoneImage',
  MODEL_3D: 'model3d',
  SKETCH: 'sketch',
  CERTIFICATE: 'certificate',
  CLIENT_REFERENCE: 'clientReference',
  INSPIRATION: 'inspiration',
  RENDER_IMAGE: 'renderImage',
  OTHER: 'other',
});
export const FILE_CATEGORY_VALUES = Object.freeze(Object.values(FILE_CATEGORY));

export const STATUS = Object.freeze({
  DRAFT: 'draft',
  REFERENCE: 'reference',
  APPROVED: 'approved',
  ARCHIVED: 'archived',
});
export const STATUS_VALUES = Object.freeze(Object.values(STATUS));

// 3D formats we recognize (preview attempted for stl/obj/3dm/glb/gltf).
export const MODEL_3D_EXT = Object.freeze(['stl', 'obj', '3dm', 'glb', 'gltf']);

export function isValidObjectType(v) { return OBJECT_TYPE_VALUES.includes(v); }
export function isValidFileKind(v) { return FILE_KIND_VALUES.includes(v); }
export function isValidFilePurpose(v) { return FILE_PURPOSE_VALUES.includes(v); }
export function isValidFileCategory(v) { return FILE_CATEGORY_VALUES.includes(v); }
export function isValidStatus(v) { return STATUS_VALUES.includes(v); }

// ---------------------------------------------------------------------------
// Ids + inference
// ---------------------------------------------------------------------------
function makeId(prefix) {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function extensionOf(fileName) {
  if (typeof fileName !== 'string') return '';
  const m = fileName.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : '';
}

export function inferFileKind(file) {
  const type = (file && file.type) || '';
  const ext = extensionOf(file && file.name);
  if (type.startsWith('image/')) return FILE_KIND.IMAGE;
  if (type.startsWith('video/')) return FILE_KIND.VIDEO;
  if (type === 'application/pdf' || ext === 'pdf') return FILE_KIND.PDF;
  if (MODEL_3D_EXT.includes(ext)) return FILE_KIND.MODEL_3D;
  return FILE_KIND.OTHER;
}

export function is3DExt(ext) {
  return MODEL_3D_EXT.includes(String(ext || '').toLowerCase());
}

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------
export function normalizeObject(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const objectId = typeof raw.objectId === 'string' && raw.objectId ? raw.objectId : makeId('obj');
  return {
    objectId,
    objectType: isValidObjectType(raw.objectType) ? raw.objectType : OBJECT_TYPE.OTHER,
    title: typeof raw.title === 'string' && raw.title.trim() ? raw.title : 'אובייקט ללא שם',
    description: typeof raw.description === 'string' ? raw.description : '',
    linkedDesignProjectId:
      typeof raw.linkedDesignProjectId === 'string' ? raw.linkedDesignProjectId : null,
    linkedStoneId: typeof raw.linkedStoneId === 'string' ? raw.linkedStoneId : null,
    linkedModelId: typeof raw.linkedModelId === 'string' ? raw.linkedModelId : null,
    linkedCollectionId:
      typeof raw.linkedCollectionId === 'string' ? raw.linkedCollectionId : null,
    status: isValidStatus(raw.status) ? raw.status : STATUS.DRAFT,
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : Date.now(),
    // future placeholders (reserved; inert in 4B.1)
    ownerUserId: typeof raw.ownerUserId === 'string' ? raw.ownerUserId : null,
    visibility: typeof raw.visibility === 'string' ? raw.visibility : 'private',
    permissions: Array.isArray(raw.permissions) ? raw.permissions : [],
    approvedFileIds: Array.isArray(raw.approvedFileIds) ? raw.approvedFileIds : [],
    renderBriefIds: Array.isArray(raw.renderBriefIds) ? raw.renderBriefIds : [],
  };
}

export function normalizeFile(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const fileId = typeof raw.fileId === 'string' && raw.fileId ? raw.fileId : makeId('file');
  return {
    fileId,
    objectId: typeof raw.objectId === 'string' ? raw.objectId : null,
    fileName: typeof raw.fileName === 'string' && raw.fileName ? raw.fileName : 'קובץ ללא שם',
    mimeType: typeof raw.mimeType === 'string' ? raw.mimeType : '',
    extension: typeof raw.extension === 'string' ? raw.extension : '',
    fileSize: typeof raw.fileSize === 'number' ? raw.fileSize : null,
    fileKind: isValidFileKind(raw.fileKind) ? raw.fileKind : FILE_KIND.OTHER,
    filePurpose: isValidFilePurpose(raw.filePurpose) ? raw.filePurpose : FILE_PURPOSE.NONE,
    category: isValidFileCategory(raw.category) ? raw.category : FILE_CATEGORY.OTHER,
    status: isValidStatus(raw.status) ? raw.status : STATUS.DRAFT,
    notes: typeof raw.notes === 'string' ? raw.notes : '',
    blobStored: Boolean(raw.blobStored),
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : Date.now(),
  };
}

// ---------------------------------------------------------------------------
// Object API (async, IndexedDB-backed)
// ---------------------------------------------------------------------------
export async function createObject(input) {
  const now = Date.now();
  const obj = normalizeObject({ ...input, objectId: makeId('obj'), createdAt: now, updatedAt: now });
  await dbPutObject(obj);
  return obj;
}

export async function getAllObjects() {
  const list = await dbGetAllObjects();
  return list.map(normalizeObject).filter(Boolean).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function updateObject(objectId, patch) {
  const all = await dbGetAllObjects();
  const existing = all.find((o) => o.objectId === objectId);
  if (!existing) return null;
  const next = normalizeObject({ ...existing, ...patch, objectId, updatedAt: Date.now() });
  await dbPutObject(next);
  return next;
}

export async function archiveObject(objectId) {
  return updateObject(objectId, { status: STATUS.ARCHIVED });
}
export async function unarchiveObject(objectId) {
  return updateObject(objectId, { status: STATUS.DRAFT });
}
export async function linkObjectToProject(objectId, projectId) {
  return updateObject(objectId, {
    linkedDesignProjectId: projectId && typeof projectId === 'string' ? projectId : null,
  });
}
export async function deleteObject(objectId) {
  await dbDeleteFilesForObject(objectId);
  await dbDeleteObject(objectId);
}

// ---------------------------------------------------------------------------
// File API
// ---------------------------------------------------------------------------
// Add a file (with its Blob) to an object. `blob` may be null for formats we
// only record by metadata; blobStored reflects whether bytes were persisted.
export async function addFile(objectId, input, blob) {
  const now = Date.now();
  const meta = normalizeFile({
    ...input,
    fileId: makeId('file'),
    objectId,
    blobStored: Boolean(blob),
    createdAt: now,
    updatedAt: now,
  });
  await dbPutFile(meta, blob || null);
  // touch parent updatedAt
  await updateObject(objectId, {});
  return meta;
}

export async function getFilesForObject(objectId) {
  const list = await dbGetFilesForObject(objectId);
  return list.map(normalizeFile).filter(Boolean).sort((a, b) => a.createdAt - b.createdAt);
}

export async function getAllFiles() {
  const list = await dbGetAllFiles();
  return list.map(normalizeFile).filter(Boolean);
}

export async function updateFile(fileId, patch) {
  const all = await dbGetAllFiles();
  const existing = all.find((f) => f.fileId === fileId);
  if (!existing) return null;
  const next = normalizeFile({ ...existing, ...patch, fileId, objectId: existing.objectId, updatedAt: Date.now() });
  await dbPutFileMetaOnly(next);
  return next;
}

export async function approveFile(fileId) {
  return updateFile(fileId, { status: STATUS.APPROVED });
}
export async function archiveFile(fileId) {
  return updateFile(fileId, { status: STATUS.ARCHIVED });
}
export async function unarchiveFile(fileId) {
  return updateFile(fileId, { status: STATUS.DRAFT });
}
export async function setFilePurpose(fileId, purpose) {
  if (!isValidFilePurpose(purpose)) return null;
  return updateFile(fileId, { filePurpose: purpose });
}
export async function setFileCategory(fileId, category) {
  if (!isValidFileCategory(category)) return null;
  return updateFile(fileId, { category });
}
export async function setFileNotes(fileId, notes) {
  return updateFile(fileId, { notes: typeof notes === 'string' ? notes : '' });
}
export async function deleteFile(fileId) {
  await dbDeleteFile(fileId);
}

// Short-lived object URL for previewing a stored file (caller revokes).
export async function getFileUrl(fileId) {
  return dbGetBlobUrl(fileId);
}

// ---------------------------------------------------------------------------
// Pure filter helper for files
// ---------------------------------------------------------------------------
export function filterFiles(list, { fileKind, filePurpose, status, includeArchived } = {}) {
  let out = Array.isArray(list) ? list.slice() : [];
  if (!includeArchived) out = out.filter((f) => f.status !== STATUS.ARCHIVED);
  if (fileKind) out = out.filter((f) => f.fileKind === fileKind);
  if (filePurpose) out = out.filter((f) => f.filePurpose === filePurpose);
  if (status) out = out.filter((f) => f.status === status);
  return out;
}

// ---------------------------------------------------------------------------
// React hook — hydrates objects + files from IndexedDB on mount.
// ---------------------------------------------------------------------------
export function createUseAssets(React) {
  const { useState, useEffect, useCallback, useRef } = React;
  return function useAssets() {
    const [objects, setObjects] = useState([]);
    const [filesByObject, setFilesByObject] = useState({});
    const [hydrated, setHydrated] = useState(false);
    const [error, setError] = useState(null);
    const mounted = useRef(true);

    const refresh = useCallback(async () => {
      try {
        const objs = await getAllObjects();
        const map = {};
        // eslint-disable-next-line no-restricted-syntax
        for (const o of objs) {
          // eslint-disable-next-line no-await-in-loop
          map[o.objectId] = await getFilesForObject(o.objectId);
        }
        if (mounted.current) {
          setObjects(objs);
          setFilesByObject(map);
          setHydrated(true);
        }
      } catch (e) {
        if (mounted.current) {
          setError(e);
          setHydrated(true);
        }
      }
    }, []);

    useEffect(() => {
      mounted.current = true;
      refresh();
      return () => {
        mounted.current = false;
      };
    }, [refresh]);

    const wrap = (fn) =>
      useCallback(async (...args) => {
        const r = await fn(...args);
        await refresh();
        return r;
      }, [refresh]);

    return {
      objects,
      filesByObject,
      hydrated,
      error,
      refresh,
      createObject: wrap(createObject),
      updateObject: wrap(updateObject),
      archiveObject: wrap(archiveObject),
      unarchiveObject: wrap(unarchiveObject),
      linkObjectToProject: wrap(linkObjectToProject),
      deleteObject: wrap(deleteObject),
      addFile: wrap(addFile),
      updateFile: wrap(updateFile),
      approveFile: wrap(approveFile),
      archiveFile: wrap(archiveFile),
      unarchiveFile: wrap(unarchiveFile),
      setFilePurpose: wrap(setFilePurpose),
      setFileCategory: wrap(setFileCategory),
      setFileNotes: wrap(setFileNotes),
      deleteFile: wrap(deleteFile),
      getFileUrl,
    };
  };
}
