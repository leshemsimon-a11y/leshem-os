// lib/studio/assetImage.js
//
// LESHEM.S OS — Asset Image Resolver (Clean 4B.4b QA)
//
// One small source of truth for the image that should represent an AssetObject
// outside the Asset Library. The chosen cover image must travel consistently to
// Work Tray, Design Projects, Design Studio and Inventory Drafts.

function isImage(file) {
  return file && file.fileKind === 'image' && file.status !== 'archived';
}

export function resolvePrimaryImageFileId(assetObject, files) {
  const list = Array.isArray(files) ? files : [];
  const explicitIds = [
    assetObject && assetObject.primaryFileId,
    assetObject && assetObject.coverImageFileId,
  ].filter(Boolean);

  for (const id of explicitIds) {
    const match = list.find((f) => f.fileId === id && isImage(f));
    if (match) return match.fileId;
  }

  const approved = list.find((f) => isImage(f) && f.status === 'approved');
  if (approved) return approved.fileId;

  const first = list.find(isImage);
  return first ? first.fileId : null;
}

export function resolvePrimaryImageFile(assetObject, files) {
  const id = resolvePrimaryImageFileId(assetObject, files);
  return id ? (Array.isArray(files) ? files.find((f) => f.fileId === id) : null) || null : null;
}
