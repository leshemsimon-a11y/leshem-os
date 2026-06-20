// pages/studio/assets.js
//
// LESHEM.S OS — Clean Build: Asset Library (/studio/assets)
//
// Clean 4B.1. Mounts the studio shell with the assets section active and the
// Asset Library as content. Fully isolated from "/" (MVP) and "/v2". Local
// only — IndexedDB-backed asset objects and file blobs, no Airtable, no cloud,
// no backend, no paid services.

import StudioShell from '../../components/studio/shell/StudioShell';
import AssetLibraryPanel from '../../components/studio/assets/AssetLibraryPanel';

export default function StudioAssetsPage() {
  return (
    <StudioShell
      initialSection="assets"
      renderContent={() => <AssetLibraryPanel />}
    />
  );
}
