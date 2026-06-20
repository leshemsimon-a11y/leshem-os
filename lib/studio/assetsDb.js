// lib/studio/assetsDb.js
//
// LESHEM.S OS — Asset Library IndexedDB layer (Clean 4B.1)
//
// Real local persistence for the Asset Library. Unlike localStorage (text-only,
// tiny), IndexedDB stores binary Blobs, so uploaded files survive a refresh.
//
// Three object stores in one database:
//   • objects  — AssetObject metadata (keyPath objectId)
//   • files    — AssetFile metadata   (keyPath fileId, index by objectId)
//   • blobs    — the raw file Blob     (keyPath fileId)
// Metadata and blobs are split so listing/filtering never loads megabytes of
// binary; a blob is fetched only when a file is previewed.
//
// HARD RULES: local only. No cloud, no backend, no Airtable, no network, no
// paid services, no API keys, no new npm packages. All calls are Promises and
// degrade safely when IndexedDB is unavailable (SSR or private mode).

export const DB_NAME = 'leshem_studio_assets_db_v1';
export const DB_VERSION = 1;
export const STORE_OBJECTS = 'objects';
export const STORE_FILES = 'files';
export const STORE_BLOBS = 'blobs';

function hasIDB() {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

let dbPromise = null;

export function openDb() {
  if (!hasIDB()) {
    return Promise.reject(new Error('IndexedDB unavailable'));
  }
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_OBJECTS)) {
        db.createObjectStore(STORE_OBJECTS, { keyPath: 'objectId' });
      }
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        const fs = db.createObjectStore(STORE_FILES, { keyPath: 'fileId' });
        fs.createIndex('byObject', 'objectId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_BLOBS)) {
        db.createObjectStore(STORE_BLOBS, { keyPath: 'fileId' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('open failed'));
  });
  return dbPromise;
}

function tx(db, stores, mode) {
  const t = db.transaction(stores, mode);
  return t;
}

function reqToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('request failed'));
  });
}

function getAllFromStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const out = [];
    const store = tx(db, [storeName], 'readonly').objectStore(storeName);
    const cur = store.openCursor();
    cur.onsuccess = () => {
      const c = cur.result;
      if (c) {
        out.push(c.value);
        c.continue();
      } else {
        resolve(out);
      }
    };
    cur.onerror = () => reject(cur.error || new Error('cursor failed'));
  });
}

// ---------------------------------------------------------------------------
// Objects
// ---------------------------------------------------------------------------
export async function dbPutObject(obj) {
  const db = await openDb();
  await reqToPromise(tx(db, [STORE_OBJECTS], 'readwrite').objectStore(STORE_OBJECTS).put(obj));
  return obj;
}
export async function dbGetAllObjects() {
  const db = await openDb();
  return getAllFromStore(db, STORE_OBJECTS);
}
export async function dbDeleteObject(objectId) {
  const db = await openDb();
  await reqToPromise(
    tx(db, [STORE_OBJECTS], 'readwrite').objectStore(STORE_OBJECTS).delete(objectId)
  );
}

// ---------------------------------------------------------------------------
// Files (metadata) + Blobs (binary)
// ---------------------------------------------------------------------------
export async function dbPutFile(fileMeta, blob) {
  const db = await openDb();
  await reqToPromise(
    tx(db, [STORE_FILES], 'readwrite').objectStore(STORE_FILES).put(fileMeta)
  );
  if (blob !== undefined && blob !== null) {
    await reqToPromise(
      tx(db, [STORE_BLOBS], 'readwrite')
        .objectStore(STORE_BLOBS)
        .put({ fileId: fileMeta.fileId, blob })
    );
  }
  return fileMeta;
}

export async function dbPutFileMetaOnly(fileMeta) {
  const db = await openDb();
  await reqToPromise(
    tx(db, [STORE_FILES], 'readwrite').objectStore(STORE_FILES).put(fileMeta)
  );
  return fileMeta;
}

export async function dbGetAllFiles() {
  const db = await openDb();
  return getAllFromStore(db, STORE_FILES);
}

export async function dbGetFilesForObject(objectId) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const out = [];
    const idx = tx(db, [STORE_FILES], 'readonly').objectStore(STORE_FILES).index('byObject');
    const cur = idx.openCursor(IDBKeyRange.only(objectId));
    cur.onsuccess = () => {
      const c = cur.result;
      if (c) {
        out.push(c.value);
        c.continue();
      } else {
        resolve(out);
      }
    };
    cur.onerror = () => reject(cur.error || new Error('cursor failed'));
  });
}

export async function dbGetBlob(fileId) {
  const db = await openDb();
  const rec = await reqToPromise(
    tx(db, [STORE_BLOBS], 'readonly').objectStore(STORE_BLOBS).get(fileId)
  );
  return rec ? rec.blob : null;
}

export async function dbDeleteFile(fileId) {
  const db = await openDb();
  await reqToPromise(
    tx(db, [STORE_FILES], 'readwrite').objectStore(STORE_FILES).delete(fileId)
  );
  await reqToPromise(
    tx(db, [STORE_BLOBS], 'readwrite').objectStore(STORE_BLOBS).delete(fileId)
  );
}

export async function dbDeleteFilesForObject(objectId) {
  const files = await dbGetFilesForObject(objectId);
  for (const f of files) {
    // eslint-disable-next-line no-await-in-loop
    await dbDeleteFile(f.fileId);
  }
}

// Create a short-lived object URL for a stored blob (caller revokes it).
export async function dbGetBlobUrl(fileId) {
  const blob = await dbGetBlob(fileId);
  if (!blob || typeof URL === 'undefined') return null;
  try {
    return URL.createObjectURL(blob);
  } catch (e) {
    return null;
  }
}
