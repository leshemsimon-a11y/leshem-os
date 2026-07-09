// pages/studio/projects.js
//
// LESHEM.S OS — Clean Build: Design Projects (/studio/projects)
//
// Clean 4A. Mounts the studio shell with the projects section active and the
// Design Projects library as content. Fully isolated from "/" (MVP) and "/v2".
// Local only — localStorage-backed projects, no Airtable, no writes, no
// network, no new packages.
//
// Clean 6F/6G — Continue Work File Flow: a compact "תיקי עבודה" strip above
// the (untouched) library. Each saved Work File gets a "המשך עבודה" action
// that ONLY sets the Active Work (existing setActiveWorkId) and — since
// Clean 6G — routes to the STABLE Studio at /studio/design; the current
// Active Work is marked "תיק פעיל"
// (existing getActiveWorkId). Deliberately NO tray/brief hydration here —
// per the Clean 6F spec the continue loop is context-only. The existing
// "פתיחה בסטודיו" flow inside the library is unchanged.

import * as React from 'react';
import { useRouter } from 'next/router';
import StudioShell from '../../components/studio/shell/StudioShell';
import DesignProjectsLibrary from '../../components/studio/projects/DesignProjectsLibrary';
import ContinueWorkFilesStrip from '../../components/studio/projects/ContinueWorkFilesStrip';
import { createUseDesignProjects } from '../../lib/studio/designProjects';
import { getActiveWorkId, setActiveWorkId } from '../../lib/studio/activeWorkStore';

const useDesignProjects = createUseDesignProjects(React);

// Small page-level container: owns the continue wiring so the strip itself
// stays purely presentational. Existing public exports only.
function ProjectsContent() {
  const router = useRouter();
  const projectsStore = useDesignProjects();
  const [activeId, setActiveId] = React.useState(null);

  // Read the Active Work id client-side only (localStorage-backed).
  React.useEffect(() => {
    setActiveId(getActiveWorkId());
  }, []);

  const handleContinue = (project) => {
    if (!project || !project.id) return;
    setActiveWorkId(project.id);
    setActiveId(project.id);
    // Clean 6G — the product loop continues in the STABLE Studio.
    router.push('/studio/design');
  };

  return (
    <>
      {projectsStore.hydrated ? (
        <ContinueWorkFilesStrip
          projects={projectsStore.active}
          activeId={activeId}
          onContinue={handleContinue}
        />
      ) : null}
      <DesignProjectsLibrary />
    </>
  );
}

export default function StudioProjectsPage() {
  return (
    <StudioShell
      initialSection="projects"
      renderContent={() => <ProjectsContent />}
    />
  );
}
