// pages/studio/projects.js
//
// LESHEM.S OS — Clean Build: Design Projects (/studio/projects)
//
// Clean 4A. Mounts the studio shell with the projects section active and the
// Design Projects library as content. Fully isolated from "/" (MVP) and "/v2".
// Local only — localStorage-backed projects, no Airtable, no writes, no
// network, no new packages.
//
// Clean 7A — Work File Backbone MVP: the "תיקי עבודה" strip is superseded by
// the richer WorkFilesPanel (the 6F ContinueWorkFilesStrip file remains on
// disk, unused — disclosed in the changelog). Per Work File:
//   • "המשך עבודה" — REAL continue: after a browser confirm, restores the
//     saved tray (tray.replace) and brief (brief.set) into the live session —
//     the exact same public-API pattern the library's own open flow uses —
//     sets the Active Work, and routes to the stable /studio/design.
//   • "פתח חבילת פלט" — opens the text-based Output Pack (Hebrew
//     professional summary, English media prompt, Hebrew client description,
//     references placeholder) built by lib/studio/outputPack from data the
//     Work File already holds. No API, no image generation.
// The existing DesignProjectsLibrary below is unchanged.

import * as React from 'react';
import { useRouter } from 'next/router';
import StudioShell from '../../components/studio/shell/StudioShell';
import DesignProjectsLibrary from '../../components/studio/projects/DesignProjectsLibrary';
import WorkFilesPanel from '../../components/studio/projects/WorkFilesPanel';
import OutputPackPanel from '../../components/studio/projects/OutputPackPanel';
import { createUseDesignProjects, updateProject } from '../../lib/studio/designProjects';
import { getActiveWorkId, setActiveWorkId } from '../../lib/studio/activeWorkStore';
import { createUseWorkTray } from '../../lib/studio/workTray';
import { createUseDesignBrief } from '../../lib/studio/designBriefStore';
import { buildOutputPack } from '../../lib/studio/outputPack';

const useDesignProjects = createUseDesignProjects(React);
const useWorkTray = createUseWorkTray(React);
const useDesignBrief = createUseDesignBrief(React);

// Clean 7A — confirm text shown before replacing the current Studio session.
const CONFIRM_REPLACE_HE = 'פתיחת תיק העבודה תחליף את העבודה הנוכחית בסטודיו. להמשיך?';

// Page-level container: owns the continue/output wiring so both panels stay
// purely presentational. Existing public exports only.
function ProjectsContent() {
  const router = useRouter();
  const projectsStore = useDesignProjects();
  const tray = useWorkTray();
  const briefStore = useDesignBrief();
  const [activeId, setActiveId] = React.useState(null);
  const [packProject, setPackProject] = React.useState(null);

  // Read the Active Work id client-side only (localStorage-backed).
  React.useEffect(() => {
    setActiveId(getActiveWorkId());
  }, []);

  // Clean 7A — REAL continue: browser confirm, then restore tray + brief
  // through the existing public APIs (tray.replace / brief.set — the exact
  // calls the library's own doOpen uses), set Active Work, route to the
  // stable Studio. No store internals touched.
  const handleContinue = (project) => {
    if (!project || !project.id) return;
    const hasCurrentWork =
      (Array.isArray(tray.items) && tray.items.length > 0) ||
      Boolean(briefStore.brief && briefStore.brief.productType);
    if (hasCurrentWork && typeof window !== 'undefined') {
      const okToReplace = window.confirm(CONFIRM_REPLACE_HE);
      if (!okToReplace) return;
    }
    tray.replace(project.trayItems || []);
    briefStore.set(project.brief || {});
    setActiveWorkId(project.id);
    setActiveId(project.id);
    router.push('/studio/design');
  };

  const openPack = (project) => setPackProject(project || null);
  const closePack = () => setPackProject(null);

  // Clean 8B — rename a Work File through the EXISTING public updateProject
  // (the projects hook refreshes automatically via the store's own event).
  const handleRename = (project, newName) => {
    if (!project || !project.id || !newName || !newName.trim()) return;
    updateProject(project.id, { name: newName.trim() });
  };

  return (
    <>
      {projectsStore.hydrated ? (
        <WorkFilesPanel
          projects={projectsStore.active}
          activeId={activeId}
          onContinue={handleContinue}
          onOpenPack={openPack}
          onRename={handleRename}
        />
      ) : null}
      <DesignProjectsLibrary />
      {packProject ? (
        <OutputPackPanel
          project={packProject}
          pack={buildOutputPack(packProject)}
          onClose={closePack}
        />
      ) : null}
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
