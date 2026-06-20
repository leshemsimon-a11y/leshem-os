// pages/studio/projects.js
//
// LESHEM.S OS — Clean Build: Design Projects (/studio/projects)
//
// Clean 4A. Mounts the studio shell with the projects section active and the
// Design Projects library as content. Fully isolated from "/" (MVP) and "/v2".
// Local only — localStorage-backed projects, no Airtable, no writes, no
// network, no new packages.

import StudioShell from '../../components/studio/shell/StudioShell';
import DesignProjectsLibrary from '../../components/studio/projects/DesignProjectsLibrary';

export default function StudioProjectsPage() {
  return (
    <StudioShell
      initialSection="projects"
      renderContent={() => <DesignProjectsLibrary />}
    />
  );
}
