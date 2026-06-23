// lib/studio/activeWorkStore.js
//
// LESHEM.S OS — Active Work pointer (Clean 4C.1)
//
// "Active Work" (עבודה פעילה) is simply the Design Project that is currently
// open / being worked on. This is NOT a new module — it is a tiny shared
// accessor around the SAME localStorage key the studio already uses
// ('leshem_studio_current_project_v1'), so Work Tray, Design Studio and the
// Projects library all agree on which work is active.
//
// It stores only the project id (the project itself lives in designProjects).
// SSR-safe, dependency-free, with the same pub/sub + cross-tab pattern as the
// other studio stores. No Airtable, no network.

export const ACTIVE_WORK_KEY = 'leshem_studio_current_project_v1';
const ACTIVE_WORK_EVENT = 'leshem:activeWork:changed';

function hasWindow() {
  return typeof window !== 'undefined';
}

export function getActiveWorkId() {
  if (!hasWindow()) return null;
  try {
    const v = window.localStorage.getItem(ACTIVE_WORK_KEY);
    return v || null;
  } catch (e) {
    return null;
  }
}

export function setActiveWorkId(projectId) {
  if (!hasWindow()) return;
  try {
    if (projectId) {
      window.localStorage.setItem(ACTIVE_WORK_KEY, projectId);
    } else {
      window.localStorage.removeItem(ACTIVE_WORK_KEY);
    }
    window.dispatchEvent(new CustomEvent(ACTIVE_WORK_EVENT));
  } catch (e) {
    /* non-fatal */
  }
}

export function clearActiveWork() {
  setActiveWorkId(null);
}

// React hook factory — returns the active work id and a setter, kept in sync
// across same-tab events and cross-tab storage changes.
export function createUseActiveWork(React) {
  const { useState, useEffect, useCallback } = React;
  return function useActiveWork() {
    const [activeWorkId, setId] = useState(null);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
      setId(getActiveWorkId());
      setHydrated(true);

      const sync = () => setId(getActiveWorkId());
      window.addEventListener(ACTIVE_WORK_EVENT, sync);
      const onStorage = (e) => {
        if (!e || e.key === ACTIVE_WORK_KEY) sync();
      };
      window.addEventListener('storage', onStorage);
      return () => {
        window.removeEventListener(ACTIVE_WORK_EVENT, sync);
        window.removeEventListener('storage', onStorage);
      };
    }, []);

    return {
      activeWorkId,
      hydrated,
      setActiveWork: useCallback((id) => {
        setActiveWorkId(id);
        setId(getActiveWorkId());
      }, []),
      clearActiveWork: useCallback(() => {
        clearActiveWork();
        setId(null);
      }, []),
    };
  };
}
