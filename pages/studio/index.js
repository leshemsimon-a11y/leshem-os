// pages/studio/index.js
//
// LESHEM.S OS — Clean Build entry (/studio)
//
// Clean 1: App Shell + Navigation + Taxonomy + Language Layer.
// This route is fully isolated from "/" (MVP) and "/v2". It connects to no
// inventory, no Airtable, no Stability, and adds no packages.
//
// Clean 8K-R2 — Welcome Studio + One Flow Experience: the primary entry
// now mounts the new simplified front-door experience (four creation paths
// + Smart Intake, then one continuous creation workspace) instead of the
// stats/activity dashboard, per the milestone's explicit product vision.
// The dashboard itself is NOT deleted — it is fully preserved and still
// reachable at /studio/dashboard-legacy (see navConfig.js / the outer
// StudioShell.js SECTION_ROUTES for the "dashboard" nav item, which now
// points there instead of here). Same fullBleed + renderContent pattern
// pages/studio/design.js already uses — no new mounting mechanism.

import StudioShell from '../../components/studio/shell/StudioShell';
import WelcomeCreationFlow from '../../components/studio/welcome/WelcomeCreationFlow';

export default function StudioPage() {
  return (
    <StudioShell
      initialSection="newCreation"
      fullBleed
      renderContent={() => <WelcomeCreationFlow />}
    />
  );
}
