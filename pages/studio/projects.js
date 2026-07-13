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
// Clean 8E — Media Workflow v1 panel + pure helpers (persistence goes ONLY
// through the existing public updateProject into the reserved `renders`
// array; no new key, no store internals).
import MediaWorkflowPanel from '../../components/studio/projects/MediaWorkflowPanel';
import {
  buildStatePatch,
  buildMediaResultRecord,
  buildResultPatch,
} from '../../lib/studio/mediaWorkflow';
import { createUseDesignProjects, updateProject } from '../../lib/studio/designProjects';
import { getActiveWorkId, setActiveWorkId } from '../../lib/studio/activeWorkStore';
import { createUseWorkTray } from '../../lib/studio/workTray';
import { createUseDesignBrief } from '../../lib/studio/designBriefStore';
import { buildOutputPack } from '../../lib/studio/outputPack';

const useDesignProjects = createUseDesignProjects(React);
const useWorkTray = createUseWorkTray(React);
const useDesignBrief = createUseDesignBrief(React);

// Clean 7A — confirm text shown before replacing the current Studio session.
const CONFIRM_REPLACE_HE = 'פתיחת תיק היצירה תחליף את היצירה הנוכחית בסטודיו. להמשיך?';

// Clean 8F — top notice when the ?focus=media deep link cannot resolve the
// active Work File (the «מדיה והדמיות» button remains visible on each card).
const MEDIA_FOCUS_NOTICE_HE = 'פתח את היצירה הפעילה כדי לנהל הדמיות ותצוגה';
const MEDIA_FOCUS_NOTICE_STYLE = {
  margin: '0 0 16px',
  padding: '10px 14px',
  borderRadius: '7px',
  border: '1px solid #B8975A',
  background: '#F2ECDF',
  color: '#14161A',
  fontFamily: '"DM Sans", "Helvetica Neue", Arial, sans-serif',
  fontSize: '13px',
  fontWeight: 600,
};

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

  // Clean 8E — Media Workflow: track the OPEN project's id (not a snapshot)
  // so store updates re-render the panel with fresh state/results; the hook
  // refreshes automatically via the store's own event after updateProject.
  const [mediaProjectId, setMediaProjectId] = React.useState(null);
  const mediaProject = mediaProjectId
    ? (projectsStore.projects || []).find((p) => p.id === mediaProjectId) || null
    : null;

  const openMedia = (project) => {
    if (!project || !project.id) return;
    setPackProject(null); // «העבר למדיה והדמיות» — focus moves to the workflow
    setMediaProjectId(project.id);
  };
  const closeMedia = () => setMediaProjectId(null);

  // ------------------------------------------------------------------
  // Clean 8F — Media Access From Studio: ?focus=media deep link.
  // When the Studio's «פתח מדיה והדמיות» routes here, auto-open the ACTIVE
  // project's Media Workflow once (same local state the buttons above use —
  // no new store, no new key, no persistence). If the active Work File
  // cannot be resolved (cleared / archived meanwhile), fall back to a top
  // notice; the «מדיה והדמיות» button stays visible on every card.
  // ------------------------------------------------------------------
  const [mediaFocusNotice, setMediaFocusNotice] = React.useState(false);
  const mediaFocusHandled = React.useRef(false);
  React.useEffect(() => {
    if (mediaFocusHandled.current) return;
    if (!router.isReady || !projectsStore.hydrated) return;
    if (router.query.focus !== 'media') {
      mediaFocusHandled.current = true;
      return;
    }
    mediaFocusHandled.current = true;
    const wantedId = getActiveWorkId();
    const found = wantedId
      ? (projectsStore.projects || []).find((p) => p.id === wantedId) || null
      : null;
    if (found) {
      setActiveId(wantedId);
      setPackProject(null);
      setMediaProjectId(found.id);
    } else {
      setMediaFocusNotice(true);
    }
  }, [router.isReady, router.query.focus, projectsStore.hydrated, projectsStore.projects]);

  // Persist media-workflow state ONLY through the existing public
  // updateProject; buildStatePatch upserts the single state record inside
  // the reserved `renders` array and preserves every other record.
  const handleUpdateMediaState = (project, partial) => {
    if (!project || !project.id) return;
    updateProject(project.id, buildStatePatch(project, partial));
  };

  // Persist one manual media result (metadata / URL / notes — no upload).
  const handleSaveMediaResult = (project, fields) => {
    if (!project || !project.id) return false;
    const record = buildMediaResultRecord(fields);
    if (!record) return false;
    updateProject(project.id, buildResultPatch(project, record));
    return true;
  };

  // Clean 8B — rename a Work File through the EXISTING public updateProject
  // (the projects hook refreshes automatically via the store's own event).
  const handleRename = (project, newName) => {
    if (!project || !project.id || !newName || !newName.trim()) return;
    updateProject(project.id, { name: newName.trim() });
  };

  // Clean 8K-R3 — Atelier Experience System (section 6: Creations Gallery
  // compact options menu). Both call the EXISTING public
  // projectsStore.duplicate / .archive hook methods (already exposed by
  // lib/studio/designProjects.js's createUseDesignProjects — just not
  // wired into any screen before now). No new persistence, no new store.
  const handleDuplicate = (project) => {
    if (!project || !project.id) return;
    projectsStore.duplicate(project.id);
  };

  const handleArchive = (project) => {
    if (!project || !project.id) return;
    projectsStore.archive(project.id);
  };

  return (
    <>
      {/* Clean 8F — fallback notice when ?focus=media arrives without a
          resolvable active Work File. Inline style only (page-local). */}
      {mediaFocusNotice ? (
        <div style={MEDIA_FOCUS_NOTICE_STYLE} dir="rtl" role="status">
          {MEDIA_FOCUS_NOTICE_HE}
        </div>
      ) : null}
      {projectsStore.hydrated ? (
        <WorkFilesPanel
          projects={projectsStore.active}
          activeId={activeId}
          onContinue={handleContinue}
          onOpenPack={openPack}
          onRename={handleRename}
          onOpenMedia={openMedia}
          onDuplicate={handleDuplicate}
          onArchive={handleArchive}
        />
      ) : null}
      <DesignProjectsLibrary />
      {packProject ? (
        <OutputPackPanel
          project={packProject}
          pack={buildOutputPack(packProject)}
          onClose={closePack}
          onOpenMedia={openMedia}
        />
      ) : null}
      {mediaProject ? (
        <MediaWorkflowPanel
          project={mediaProject}
          pack={buildOutputPack(mediaProject)}
          onClose={closeMedia}
          onUpdateState={handleUpdateMediaState}
          onSaveResult={handleSaveMediaResult}
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
