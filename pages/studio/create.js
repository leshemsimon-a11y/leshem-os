// pages/studio/create.js
//
// LESHEM.S OS — Clean 8A: Create Flow MVP (/studio/create).
//
// A guided, mobile-friendly creation flow: what are we creating → style →
// Work Tray stones → references (text) → free request → 3 local design
// directions → save as a Work File (existing public designProjects API) +
// local Output Pack. Mounts the EXISTING app shell like every other studio
// page — /studio/design and /studio/workstation are untouched. No new
// packages, APIs, render engine, external AI, or persistence keys.

import StudioShell from '../../components/studio/shell/StudioShell';
import CreateFlowShell from '../../components/studio/create/CreateFlowShell';
// Clean 8G — «רפרנסים ונכסים»: read-only strip of the ACTIVE Work File's
// attached assets + «פתח ספריית נכסים». Mounted BELOW the existing flow —
// CreateFlowShell itself is untouched.
import ProjectAssetsStrip from '../../components/studio/projects/ProjectAssetsStrip';

export default function StudioCreatePage() {
  return (
    <StudioShell
      initialSection="builder"
      renderContent={() => (
        <>
          <CreateFlowShell />
          <ProjectAssetsStrip />
        </>
      )}
    />
  );
}
