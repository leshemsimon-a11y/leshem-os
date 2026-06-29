// pages/studio/design.js
//
// LESHEM.S OS — Clean Build: Jewelry Design Studio (/studio/design)
//
// Clean 3. Mounts the studio shell with the design section active and the
// DesignStudio foundation experience as content. Stone-first: it begins from
// the items selected in the Work Tray. Fully isolated from "/" (MVP) and
// "/v2". No uploads, no models, no renders, no pricing, no certificates, no
// Airtable, no new packages.

import StudioShell from '../../components/studio/shell/StudioShell';
import StudioWorkstation from '../../components/studio/design/shell/StudioShell';

export default function StudioDesignPage() {
  return (
    <StudioShell
      initialSection="builder"
      fullBleed
      renderContent={() => <StudioWorkstation />}
    />
  );
}
