// pages/studio/index.js
//
// LESHEM.S OS — Clean Build entry (/studio)
//
// Clean 1: App Shell + Navigation + Taxonomy + Language Layer.
// This route is fully isolated from "/" (MVP) and "/v2". It connects to no
// inventory, no Airtable, no Stability, and adds no packages. It simply mounts
// the studio shell.

import StudioShell from '../../components/studio/shell/StudioShell';

export default function StudioPage() {
  return <StudioShell />;
}
