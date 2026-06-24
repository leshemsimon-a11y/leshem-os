// components/studio/projects/DesignProjectsLibrary.js
//
// LESHEM.S OS — Design Projects Library (Clean 4A)
//
// The /studio/projects surface. Lists saved Design Projects as elegant cards
// and offers the required actions:
//   • Open a saved project back into the studio (restores tray + brief)
//   • Duplicate a project as a new variation
//   • Rename a project
//   • Archive / restore (archived stay saved but hidden from the active list)
//
// Local only: reads the design-projects store and, on open, writes the saved
// tray + brief back into the work-tray and brief stores, then routes to the
// studio. NO Airtable, NO network, NO uploads, NO pricing, NO PDF, no commerce.

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { tokens } from '../shared/tokens';
import { PROJECTS_HE, OPEN_STUDIO_HE, CONCEPT_HE, OUTPUT_HE } from '../../../lib/studio/labels';
import { createUseDesignProjects } from '../../../lib/studio/designProjects';
import { createUseWorkTray } from '../../../lib/studio/workTray';
import { createUseDesignBrief } from '../../../lib/studio/designBriefStore';
import { getSelectedConcept, getActiveOutput } from '../../../lib/studio/designDraft';
import LinkedAssetsPanel from '../design/LinkedAssetsPanel';
import OpenInStudioChooser from '../assets/OpenInStudioChooser';
import { setActiveWorkId } from '../../../lib/studio/activeWorkStore';

const useDesignProjects = createUseDesignProjects(React);
const useWorkTray = createUseWorkTray(React);
const useDesignBrief = createUseDesignBrief(React);

function fmtDate(ts) {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return '—';
  }
}

function StatusPill({ status }) {
  const label = PROJECTS_HE.status[status] || status;
  const ready = status === 'approved';
  return (
    <span
      style={{
        ...styles.statusPill,
        ...(ready ? styles.statusApproved : null),
        ...(status === 'archived' ? styles.statusArchived : null),
      }}
    >
      {label}
    </span>
  );
}

function ProjectCard({ project, onOpenAssets, onOpen, onDuplicate, onRename, onArchive, onUnarchive }) {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(project.name);
  const archived = project.status === 'archived';
  const itemCount = Array.isArray(project.trayItems) ? project.trayItems.length : 0;
  const selectedConcept = getSelectedConcept(project.brief);
  const activeOutput = getActiveOutput(project.brief);

  const commitRename = () => {
    onRename(project.id, name);
    setRenaming(false);
  };

  return (
    <div style={styles.card} dir="rtl">
      <div style={styles.cardHead}>
        {renaming ? (
          <div style={styles.renameRow}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.renameInput}
              dir="rtl"
              autoFocus
            />
            <button type="button" onClick={commitRename} style={styles.miniPrimary}>
              {PROJECTS_HE.save}
            </button>
            <button
              type="button"
              onClick={() => {
                setName(project.name);
                setRenaming(false);
              }}
              style={styles.miniGhost}
            >
              {PROJECTS_HE.cancel}
            </button>
          </div>
        ) : (
          <div style={styles.titleRow}>
            <span style={styles.cardTitle}>{project.name}</span>
            <StatusPill status={project.status} />
          </div>
        )}
      </div>

      <div style={styles.meta}>
        <span>{PROJECTS_HE.itemsCount(itemCount)}</span>
        <span>·</span>
        <span>
          {PROJECTS_HE.updatedAt} {fmtDate(project.updatedAt)}
        </span>
        {project.clonedFromProjectId && (
          <span style={styles.clonedTag}>{PROJECTS_HE.clonedFrom}</span>
        )}
      </div>

      <div style={styles.linkedAssets}>
        <LinkedAssetsPanel
          projectId={project.id}
          primaryAssetObjectId={project.primaryAssetObjectId}
          onOpenAssets={onOpenAssets}
          compact
        />
      </div>

      {selectedConcept && (
        <div style={styles.conceptStrip} dir="rtl">
          <span style={styles.conceptStripBadge}>{CONCEPT_HE.chosenBadge}</span>
          <div style={styles.conceptStripText}>
            <span style={styles.conceptStripName}>{selectedConcept.conceptName}</span>
            {selectedConcept.shortDescription ? (
              <span style={styles.conceptStripDesc}>{selectedConcept.shortDescription}</span>
            ) : null}
          </div>
        </div>
      )}

      {activeOutput && (
        <div style={styles.outputStrip} dir="rtl">
          <span style={styles.outputStripBadge}>{OUTPUT_HE.title}</span>
          <div style={styles.outputStripText}>
            <span style={styles.outputStripName}>
              {activeOutput.clientFacingTitle || activeOutput.outputTitle}
            </span>
            {activeOutput.clientDescription ? (
              <span style={styles.outputStripDesc}>{activeOutput.clientDescription}</span>
            ) : null}
            {activeOutput.updatedAt ? (
              <span style={styles.outputStripMeta}>
                {PROJECTS_HE.updatedAt} {fmtDate(activeOutput.updatedAt)}
              </span>
            ) : null}
          </div>
        </div>
      )}

      <div style={styles.actions}>
        {!archived && (
          <button type="button" onClick={() => onOpen(project)} style={styles.primaryBtn}>
            {PROJECTS_HE.open}
          </button>
        )}
        <button type="button" onClick={() => onDuplicate(project.id)} style={styles.ghostBtn}>
          {PROJECTS_HE.duplicate}
        </button>
        {!renaming && (
          <button type="button" onClick={() => setRenaming(true)} style={styles.ghostBtn}>
            {PROJECTS_HE.rename}
          </button>
        )}
        {archived ? (
          <button type="button" onClick={() => onUnarchive(project.id)} style={styles.ghostBtn}>
            {PROJECTS_HE.unarchive}
          </button>
        ) : (
          <button type="button" onClick={() => onArchive(project.id)} style={styles.ghostBtn}>
            {PROJECTS_HE.archive}
          </button>
        )}
      </div>
    </div>
  );
}

export default function DesignProjectsLibrary() {
  const router = useRouter();
  const projectsStore = useDesignProjects();
  const tray = useWorkTray();
  const brief = useDesignBrief();
  const [showArchived, setShowArchived] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(null);

  const doOpen = (project) => {
    // Restore the saved design into the live studio stores, then route in.
    tray.replace(project.trayItems || []);
    brief.set(project.brief || {});
    // Mark this project as the active work (fires the active-work event).
    setActiveWorkId(project.id);
    setPendingOpen(null);
    router.push('/studio/design');
  };

  // Clean 4B.4b — additive open: append the project's items to the current tray
  // without discarding existing work, set the brief only if empty, then route.
  const doAddToCurrent = (project) => {
    const incoming = Array.isArray(project.trayItems) ? project.trayItems : [];
    incoming.forEach((it) => {
      if (it && it.id && !tray.has(it.id)) tray.addItem(it);
    });
    const currentBrief = brief.brief || {};
    const hasBrief = currentBrief && Object.keys(currentBrief).length > 0;
    if (!hasBrief && project.brief) brief.set(project.brief);
    setActiveWorkId(project.id);
    setPendingOpen(null);
    router.push('/studio/design');
  };

  // GUARD: save the CURRENT work as a local project with a simple default name.
  // Returns the saved project (truthy with .id) on success, or null on failure
  // so the chooser can refuse to replace work when saving did not succeed.
  const saveCurrentWork = () => {
    try {
      const items = tray.items || [];
      if (items.length === 0) return { id: '__nothing_to_save__', name: '' };
      const stamp = new Date().toLocaleString('he-IL');
      const saved = projectsStore.save({
        name: `${OPEN_STUDIO_HE.defaultProjectName} · ${stamp}`,
        trayItems: items,
        brief: brief.brief || {},
      });
      return saved && saved.id ? saved : null;
    } catch (e) {
      console.warn('[projects] saveCurrentWork failed', e);
      return null;
    }
  };

  if (!projectsStore.hydrated) {
    return (
      <div dir="rtl">
        <Header />
        <div style={styles.loading}>טוען תיקי עיצוב…</div>
      </div>
    );
  }

  const { active, archived } = projectsStore;

  return (
    <div dir="rtl">
      <Header />
      <p style={styles.localNote}>{PROJECTS_HE.localNote}</p>

      <section style={styles.section}>
        <div style={styles.sectionHeadRow}>
          <h2 style={styles.sectionHeading}>{PROJECTS_HE.activeHeading}</h2>
          {archived.length > 0 && (
            <button
              type="button"
              onClick={() => setShowArchived((s) => !s)}
              style={styles.toggleArchived}
            >
              {showArchived ? PROJECTS_HE.hideArchived : PROJECTS_HE.showArchived}
            </button>
          )}
        </div>

        {active.length === 0 ? (
          <p style={styles.emptyLine}>{PROJECTS_HE.emptyActive}</p>
        ) : (
          <div style={styles.list}>
            {active.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                onOpenAssets={() => router.push('/studio/assets')}
                onOpen={(proj) => setPendingOpen(proj)}
                onDuplicate={projectsStore.duplicate}
                onRename={projectsStore.rename}
                onArchive={projectsStore.archive}
                onUnarchive={projectsStore.unarchive}
              />
            ))}
          </div>
        )}
      </section>

      {showArchived && (
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>{PROJECTS_HE.archivedHeading}</h2>
          {archived.length === 0 ? (
            <p style={styles.emptyLine}>{PROJECTS_HE.emptyArchived}</p>
          ) : (
            <div style={styles.list}>
              {archived.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onOpenAssets={() => router.push('/studio/assets')}
                  onOpen={(proj) => setPendingOpen(proj)}
                  onDuplicate={projectsStore.duplicate}
                  onRename={projectsStore.rename}
                  onArchive={projectsStore.archive}
                  onUnarchive={projectsStore.unarchive}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Clean 4B.4b — choice-based open flow that protects unsaved work. */}
      <OpenInStudioChooser
        open={!!pendingOpen}
        mode="project"
        hasCurrentWork={(tray.items || []).length > 0}
        onAddToCurrent={() => pendingOpen && doAddToCurrent(pendingOpen)}
        saveCurrentWork={saveCurrentWork}
        proceedReplace={() => pendingOpen && doOpen(pendingOpen)}
        onClose={() => setPendingOpen(null)}
      />
    </div>
  );
}

function Header() {
  return (
    <header style={styles.header} dir="rtl">
      <span style={styles.eyebrow}>{PROJECTS_HE.eyebrow}</span>
      <h1 style={styles.title}>{PROJECTS_HE.title}</h1>
      <p style={styles.caption}>{PROJECTS_HE.caption}</p>
    </header>
  );
}

const styles = {
  header: { marginBottom: '16px' },
  eyebrow: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: tokens.color.gold,
  },
  title: {
    fontFamily: tokens.font.display,
    fontWeight: 700,
    fontSize: '34px',
    color: tokens.color.charcoal,
    margin: '8px 0 10px',
  },
  caption: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
    margin: 0,
    maxWidth: '560px',
  },
  localNote: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.goldFaint}`,
    borderRadius: tokens.radius.sm,
    padding: '8px 12px',
    margin: '0 0 20px',
    maxWidth: '560px',
  },
  loading: {
    fontFamily: tokens.font.body,
    fontSize: '15px',
    color: tokens.color.inkFaint,
    padding: '40px 0',
    textAlign: 'center',
  },
  section: { marginBottom: '26px' },
  sectionHeadRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '12px',
  },
  sectionHeading: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: tokens.color.inkSoft,
    margin: 0,
  },
  toggleArchived: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.color.gold,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  list: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '14px',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '16px',
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.lg,
    boxShadow: tokens.shadow.soft,
  },
  cardHead: {},
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
  },
  cardTitle: {
    fontFamily: tokens.font.display,
    fontSize: '18px',
    color: tokens.color.charcoal,
    lineHeight: 1.3,
    minWidth: 0,
  },
  statusPill: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.color.inkSoft,
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: '999px',
    padding: '3px 10px',
    whiteSpace: 'nowrap',
  },
  statusApproved: {
    color: tokens.color.charcoal,
    background: tokens.color.sageFaint,
    border: `1px solid ${tokens.color.sage}`,
  },
  statusArchived: {
    color: tokens.color.inkFaint,
  },
  meta: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '8px',
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.inkFaint,
  },
  clonedTag: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    color: tokens.color.gold,
    background: tokens.color.goldFaint,
    borderRadius: '999px',
    padding: '2px 8px',
  },
  linkedAssets: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.inkSoft,
  },
  conceptStrip: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '10px 12px',
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.goldSoft}`,
    borderRadius: tokens.radius.md,
    marginTop: '4px',
  },
  conceptStripBadge: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.gold}`,
    borderRadius: '999px',
    padding: '3px 10px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  conceptStripText: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  conceptStripName: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  conceptStripDesc: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    lineHeight: 1.55,
    color: tokens.color.inkSoft,
  },
  outputStrip: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '10px 12px',
    background: tokens.color.sageFaint,
    border: `1px solid ${tokens.color.sage}`,
    borderRadius: tokens.radius.md,
    marginTop: '8px',
  },
  outputStripBadge: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.sage}`,
    borderRadius: '999px',
    padding: '3px 10px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  outputStripText: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  outputStripName: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  outputStripDesc: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    lineHeight: 1.55,
    color: tokens.color.inkSoft,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  outputStripMeta: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    color: tokens.color.inkFaint,
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    paddingTop: '6px',
  },
  primaryBtn: {
    minHeight: '44px',
    padding: '10px 18px',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.color.ivory,
    background: tokens.color.charcoal,
    border: 'none',
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
    boxShadow: tokens.shadow.soft,
  },
  ghostBtn: {
    minHeight: '44px',
    padding: '10px 16px',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.color.inkSoft,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
  },
  renameRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  renameInput: {
    flex: 1,
    minWidth: '160px',
    boxSizing: 'border-box',
    fontFamily: tokens.font.body,
    fontSize: '15px',
    color: tokens.color.ink,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    padding: '10px 12px',
    outline: 'none',
  },
  miniPrimary: {
    minHeight: '40px',
    padding: '8px 14px',
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.color.ivory,
    background: tokens.color.charcoal,
    border: 'none',
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
  },
  miniGhost: {
    minHeight: '40px',
    padding: '8px 12px',
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.color.inkSoft,
    background: 'transparent',
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
  },
  emptyLine: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    color: tokens.color.inkFaint,
    margin: 0,
  },
  scrim: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(43,40,36,0.40)',
    zIndex: 60,
  },
  dialog: {
    position: 'fixed',
    zIndex: 61,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(420px, 92vw)',
    background: tokens.color.ivory,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.lg,
    boxShadow: tokens.shadow.lift,
    padding: '24px',
  },
  dialogTitle: {
    fontFamily: tokens.font.display,
    fontWeight: 400,
    fontSize: '22px',
    color: tokens.color.charcoal,
    margin: '0 0 10px',
  },
  dialogBody: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
    margin: '0 0 22px',
  },
  dialogActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
};
