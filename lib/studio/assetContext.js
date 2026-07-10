// lib/studio/assetContext.js
// Safe inert stub after Clean 7B rollback. No persistence, no store writes, no viewer imports.
export function collectProjectWorkAssets() { return []; }
export function countDirectLinkedAssets(project) {
  return project && Array.isArray(project.linkedAssetFileIds) ? project.linkedAssetFileIds.length : 0;
}
export function createUseWorkAssets(React) {
  const { useMemo } = React;
  return function useWorkAssets() {
    return useMemo(() => ({ assets: [], hydrated: true }), []);
  };
}
export function isImageAsset() { return false; }
export function isPreviewableModel() { return false; }
