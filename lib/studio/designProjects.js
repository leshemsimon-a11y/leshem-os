// lib/studio/designProjects.js
//
// LESHEM.S OS — Design Projects Store (Clean 4A)
//
// A local, persistent library of saved DESIGN PROJECTS (תיקי עיצוב). Each
// project is a snapshot of a design draft: the Work Tray items, their assigned
// roles, the design brief, and the computed design snapshot — plus reserved
// placeholders for future assets / model files / renders / collection.
//
// It is the persistence sibling to workTray.js and designBriefStore.js and
// follows the same conventions: versioned localStorage key, SSR-safe, degrades
// to in-memory if storage is unavailable, tiny pub/sub + same-tab CustomEvent
// + cross-tab storage listener, and a createUseDesignProjects(React) factory.
//
// HARD RULES honored: localStorage ONLY, NO Airtable, NO network, NO uploads,
// NO pricing, NO certificates, NO PDF, NO render generation, NO new packages,
// no commerce language. Center stones are stored as separate items (the tray
// snapshot is copied verbatim and never merged to a quantity).

import { emptyBrief, normalizeBrief } from './designDraft';

export const DESIGN_PROJECTS_KEY = 'leshem_studio_design_projects_v1';
const PROJECTS_EVENT = 'leshem:designProjects:changed';

// Canonical project statuses (English values; Hebrew labels live in labels.js).
export const PROJECT_STATUS = Object.freeze({
  DRAFT: 'draft',
  IN_REVIEW: 'inReview',
  APPROVED: 'approved',
  ARCHIVED: 'archived',
});

export const PROJECT_STATUS_VALUES = Object.freeze(
  Object.values(PROJECT_STATUS)
);

export function isValidStatus(s) {
  return PROJECT_STATUS_VALUES.includes(s);
}

// ---------------------------------------------------------------------------
// Environment-safe storage access
// ---------------------------------------------------------------------------
function hasWindow() {
  return typeof window !== 'undefined';
}

function safeGetRaw() {
  if (!hasWindow()) return null;
  try {
    return window.localStorage.getItem(DESIGN_PROJECTS_KEY);
  } catch (e) {
    console.warn('[designProjects] localStorage read unavailable; memory only.', e);
    return null;
  }
}

function safeSetRaw(value) {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(DESIGN_PROJECTS_KEY, value);
  } catch (e) {
    console.warn('[designProjects] localStorage write unavailable; memory only.', e);
  }
}

let memory = null;

// ---------------------------------------------------------------------------
// Id generation (no packages) — stable, unique enough for a local library.
// ---------------------------------------------------------------------------
function makeId() {
  const rand = Math.random().toString(36).slice(2, 8);
  return `proj_${Date.now().toString(36)}_${rand}`;
}

// ---------------------------------------------------------------------------
// Normalization (defensive) — every stored project is coerced into shape.
// ---------------------------------------------------------------------------
function normalizeProject(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const id = typeof raw.id === 'string' && raw.id ? raw.id : makeId();
  const status = isValidStatus(raw.status) ? raw.status : PROJECT_STATUS.DRAFT;
  return {
    id,
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name : 'תיק עיצוב',
    status,
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : Date.now(),
    clonedFromProjectId:
      typeof raw.clonedFromProjectId === 'string' ? raw.clonedFromProjectId : null,

    // Core design payload (copied verbatim; tray items stay separate items).
    trayItems: Array.isArray(raw.trayItems) ? raw.trayItems : [],
    // roles are already embedded in each tray item (item.role); we also keep an
    // explicit map for forward-compatibility / quick lookups.
    roles:
      raw.roles && typeof raw.roles === 'object' && !Array.isArray(raw.roles)
        ? raw.roles
        : {},
    brief: normalizeBrief(raw.brief),
    snapshot:
      raw.snapshot && typeof raw.snapshot === 'object' ? raw.snapshot : null,

    // Reserved placeholders for later milestones (always empty for now).
    assets: Array.isArray(raw.assets) ? raw.assets : [],
    // Clean 4B.2 — explicit links to Asset Library objects/files.
    linkedAssetObjectIds: Array.isArray(raw.linkedAssetObjectIds)
      ? raw.linkedAssetObjectIds
      : [],
    linkedAssetFileIds: Array.isArray(raw.linkedAssetFileIds)
      ? raw.linkedAssetFileIds
      : [],
    primaryAssetObjectId:
      typeof raw.primaryAssetObjectId === 'string' ? raw.primaryAssetObjectId : null,
    // Clean 4B.3 — inherited ownership / client context (stored only).
    ownerContextType:
      typeof raw.ownerContextType === 'string' ? raw.ownerContextType : 'internal',
    linkedClientId: typeof raw.linkedClientId === 'string' ? raw.linkedClientId : null,
    linkedClientName: typeof raw.linkedClientName === 'string' ? raw.linkedClientName : null,
    clientType: typeof raw.clientType === 'string' ? raw.clientType : null,
    clientTier: typeof raw.clientTier === 'string' ? raw.clientTier : null,
    visibilityLevel:
      typeof raw.visibilityLevel === 'string' ? raw.visibilityLevel : 'internalOnly',
    pricingVisibility:
      typeof raw.pricingVisibility === 'string' ? raw.pricingVisibility : 'hidden',
    sharingMode: typeof raw.sharingMode === 'string' ? raw.sharingMode : 'noSharingYet',
    modelFiles: Array.isArray(raw.modelFiles) ? raw.modelFiles : [],
    renders: Array.isArray(raw.renders) ? raw.renders : [],
    collectionId:
      typeof raw.collectionId === 'string' ? raw.collectionId : null,
  };
}

function parseList(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeProject).filter(Boolean);
  } catch (e) {
    console.warn('[designProjects] could not parse stored projects; starting empty.', e);
    return [];
  }
}

function loadInitial() {
  if (memory) return memory;
  memory = parseList(safeGetRaw());
  return memory;
}

function persist(list) {
  memory = list;
  safeSetRaw(JSON.stringify(list));
  if (hasWindow()) {
    try {
      window.dispatchEvent(new CustomEvent(PROJECTS_EVENT));
    } catch (e) {
      console.warn('[designProjects] could not dispatch change event.', e);
    }
  }
}

// Build an explicit role map from the tray items (id -> role).
function rolesFromTray(trayItems) {
  const map = {};
  (Array.isArray(trayItems) ? trayItems : []).forEach((it) => {
    if (it && typeof it.id === 'string') map[it.id] = it.role || 'unassigned';
  });
  return map;
}

// ---------------------------------------------------------------------------
// Public read API
// ---------------------------------------------------------------------------
export function getAllProjects() {
  return loadInitial().map((p) => ({ ...p }));
}

// Active = everything not archived (default list).
export function getActiveProjects() {
  return loadInitial()
    .filter((p) => p.status !== PROJECT_STATUS.ARCHIVED)
    .map((p) => ({ ...p }));
}

export function getArchivedProjects() {
  return loadInitial()
    .filter((p) => p.status === PROJECT_STATUS.ARCHIVED)
    .map((p) => ({ ...p }));
}

export function getProject(id) {
  const found = loadInitial().find((p) => p.id === id);
  return found ? { ...found } : null;
}

// ---------------------------------------------------------------------------
// Public mutation API (all local; never network)
// ---------------------------------------------------------------------------
// Save a NEW project from the current design state.
export function saveProject({
  name,
  trayItems,
  brief,
  snapshot,
  linkedAssetObjectIds,
  linkedAssetFileIds,
  primaryAssetObjectId,
  context,
}) {
  const now = Date.now();
  const ctx = context && typeof context === 'object' ? context : {};
  const project = normalizeProject({
    id: makeId(),
    name: name && name.trim() ? name.trim() : 'תיק עיצוב',
    status: PROJECT_STATUS.DRAFT,
    createdAt: now,
    updatedAt: now,
    clonedFromProjectId: null,
    trayItems: Array.isArray(trayItems) ? trayItems : [],
    roles: rolesFromTray(trayItems),
    brief,
    snapshot: snapshot || null,
    linkedAssetObjectIds: Array.isArray(linkedAssetObjectIds) ? linkedAssetObjectIds : [],
    linkedAssetFileIds: Array.isArray(linkedAssetFileIds) ? linkedAssetFileIds : [],
    primaryAssetObjectId:
      typeof primaryAssetObjectId === 'string' ? primaryAssetObjectId : null,
    // inherited context (defaults to internal via normalizeProject)
    ownerContextType: ctx.ownerContextType,
    linkedClientId: ctx.linkedClientId,
    linkedClientName: ctx.linkedClientName,
    clientType: ctx.clientType,
    clientTier: ctx.clientTier,
    visibilityLevel: ctx.visibilityLevel,
    pricingVisibility: ctx.pricingVisibility,
    sharingMode: ctx.sharingMode,
  });
  const list = loadInitial();
  persist([project, ...list]);
  return project;
}

// Create a Design Project FROM an Asset Object (Clean 4B.2 / 4B.3). Names the
// project after the object title, links the object (+ approved files), and
// INHERITS the asset's ownership / client context. Local only.
export function createProjectFromAssetObject(object, files, context) {
  const ids = {
    linkedAssetObjectIds: object && object.objectId ? [object.objectId] : [],
    linkedAssetFileIds: (Array.isArray(files) ? files : [])
      .filter((f) => f.status === 'approved')
      .map((f) => f.fileId),
    primaryAssetObjectId: object && object.objectId ? object.objectId : null,
  };
  // Inherit context: prefer an explicit context arg, else read off the object.
  const ctx =
    context && typeof context === 'object'
      ? context
      : {
          ownerContextType: (object && object.ownerContextType) || 'internal',
          linkedClientId: (object && object.linkedClientId) || null,
          linkedClientName: (object && object.linkedClientName) || null,
          clientType: (object && object.clientType) || null,
          clientTier: (object && object.clientTier) || null,
          visibilityLevel: (object && object.visibilityLevel) || 'internalOnly',
          pricingVisibility: (object && object.pricingVisibility) || 'hidden',
          sharingMode: (object && object.sharingMode) || 'noSharingYet',
        };
  return saveProject({
    name: object && object.title ? object.title : 'תיק עיצוב',
    trayItems: [],
    brief: null,
    snapshot: null,
    context: ctx,
    ...ids,
  });
}

// Link an existing Asset Object into an existing project (additive, de-duped).
export function linkAssetObjectToProject(projectId, objectId, fileIds) {
  const p = getProject(projectId);
  if (!p || !objectId) return null;
  const objs = Array.isArray(p.linkedAssetObjectIds) ? p.linkedAssetObjectIds.slice() : [];
  if (!objs.includes(objectId)) objs.push(objectId);
  const files = Array.isArray(p.linkedAssetFileIds) ? p.linkedAssetFileIds.slice() : [];
  (Array.isArray(fileIds) ? fileIds : []).forEach((fid) => {
    if (fid && !files.includes(fid)) files.push(fid);
  });
  return updateProject(projectId, {
    linkedAssetObjectIds: objs,
    linkedAssetFileIds: files,
    primaryAssetObjectId: p.primaryAssetObjectId || objectId,
  });
}

// Update arbitrary fields on a project (always stamps updatedAt).
export function updateProject(id, patch) {
  if (!id) return null;
  const list = loadInitial();
  let updated = null;
  const next = list.map((p) => {
    if (p.id !== id) return p;
    updated = normalizeProject({ ...p, ...patch, id: p.id, updatedAt: Date.now() });
    return updated;
  });
  if (updated) persist(next);
  return updated ? { ...updated } : null;
}

export function renameProject(id, name) {
  return updateProject(id, { name: name && name.trim() ? name.trim() : 'תיק עיצוב' });
}

export function setProjectStatus(id, status) {
  if (!isValidStatus(status)) return null;
  return updateProject(id, { status });
}

export function archiveProject(id) {
  return setProjectStatus(id, PROJECT_STATUS.ARCHIVED);
}

export function unarchiveProject(id) {
  return setProjectStatus(id, PROJECT_STATUS.DRAFT);
}

// Duplicate a project as a NEW variation (fresh id, draft status, linked back).
export function duplicateProject(id, newName) {
  const src = getProject(id);
  if (!src) return null;
  const now = Date.now();
  const copy = normalizeProject({
    ...src,
    id: makeId(),
    name: newName && newName.trim() ? newName.trim() : `${src.name} — וריאציה`,
    status: PROJECT_STATUS.DRAFT,
    createdAt: now,
    updatedAt: now,
    clonedFromProjectId: src.id,
  });
  const list = loadInitial();
  persist([copy, ...list]);
  return copy;
}

// Permanently remove (used rarely; archiving is the default "hide").
export function deleteProject(id) {
  const list = loadInitial();
  const next = list.filter((p) => p.id !== id);
  if (next.length !== list.length) persist(next);
  return getAllProjects();
}

// ---------------------------------------------------------------------------
// React hook factory — SSR-safe initial value, then live updates.
// ---------------------------------------------------------------------------
export function createUseDesignProjects(React) {
  const { useState, useEffect, useCallback } = React;
  return function useDesignProjects() {
    const [projects, setProjects] = useState([]);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
      setProjects(getAllProjects());
      setHydrated(true);

      const sync = () => setProjects(getAllProjects());
      window.addEventListener(PROJECTS_EVENT, sync);
      const onStorage = (e) => {
        if (!e || e.key === DESIGN_PROJECTS_KEY) sync();
      };
      window.addEventListener('storage', onStorage);

      return () => {
        window.removeEventListener(PROJECTS_EVENT, sync);
        window.removeEventListener('storage', onStorage);
      };
    }, []);

    const active = projects.filter((p) => p.status !== PROJECT_STATUS.ARCHIVED);
    const archived = projects.filter((p) => p.status === PROJECT_STATUS.ARCHIVED);

    return {
      projects,
      active,
      archived,
      hydrated,
      save: useCallback((payload) => {
        const p = saveProject(payload);
        setProjects(getAllProjects());
        return p;
      }, []),
      rename: useCallback((id, name) => {
        renameProject(id, name);
        setProjects(getAllProjects());
      }, []),
      setStatus: useCallback((id, status) => {
        setProjectStatus(id, status);
        setProjects(getAllProjects());
      }, []),
      archive: useCallback((id) => {
        archiveProject(id);
        setProjects(getAllProjects());
      }, []),
      unarchive: useCallback((id) => {
        unarchiveProject(id);
        setProjects(getAllProjects());
      }, []),
      duplicate: useCallback((id, newName) => {
        const p = duplicateProject(id, newName);
        setProjects(getAllProjects());
        return p;
      }, []),
      remove: useCallback((id) => {
        deleteProject(id);
        setProjects(getAllProjects());
      }, []),
      get: useCallback((id) => getProject(id), []),
      createFromAsset: useCallback((object, files) => {
        const p = createProjectFromAssetObject(object, files);
        setProjects(getAllProjects());
        return p;
      }, []),
      linkAssetObject: useCallback((projectId, objectId, fileIds) => {
        linkAssetObjectToProject(projectId, objectId, fileIds);
        setProjects(getAllProjects());
      }, []),
    };
  };
}
