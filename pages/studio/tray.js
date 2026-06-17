// pages/studio/tray.js
//
// LESHEM.S OS — Clean Build: Work Tray (/studio/tray)
//
// Clean 3. Mounts the studio shell with the Work Tray section active and the
// WorkTray experience as content. Fully isolated from "/" (MVP) and "/v2".
// The Work Tray is a local, temporary draft — no Airtable, no writes, no
// network, no new packages.

import StudioShell from '../../components/studio/shell/StudioShell';
import WorkTray from '../../components/studio/tray/WorkTray';

export default function StudioTrayPage() {
  return (
    <StudioShell
      initialSection="workTray"
      renderContent={() => <WorkTray />}
    />
  );
}
