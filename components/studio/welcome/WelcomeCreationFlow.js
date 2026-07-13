// components/studio/welcome/WelcomeCreationFlow.js
//
// LESHEM.S OS — Clean 8K-R2: Welcome Studio + One Flow Experience.
//
// The new primary front-door + orchestration layer (section 13). Owns the
// EXISTING hooks (Work Tray, Design Brief, Design Projects, Active Work) —
// the SAME ones components/studio/design/shell/StudioShell.js already
// uses — and performs the "automatic behavior" the milestone asks for
// (section 9) through those EXISTING public APIs only. It does not
// reimplement direction generation, output preparation, or render planning:
// it reuses DesignConceptPanel, DesignOutputPanel (via CreationWorkspace),
// outputPack.js, and renderSceneLibrary.js exactly as they already work.
//
// No protected store internals are edited. No new persistence key is
// created — everything is saved through the EXISTING public
// designProjects.js / designBriefStore.js / workTray.js / activeWorkStore.js
// functions, onto the EXISTING project/brief/tray shapes.
//
// Hook-order note: every React hook (useState/useRef/useCallback/useEffect,
// plus the store hooks below) is called unconditionally, on every render,
// BEFORE the hydration early-return — the exact same discipline
// components/studio/design/shell/StudioShell.js already follows. Only
// plain derived consts and the JSX are computed after that point.

import * as React from 'react';
import { useRouter } from 'next/router';
import { createUseWorkTray } from '../../../lib/studio/workTray';
import { createUseDesignBrief } from '../../../lib/studio/designBriefStore';
import {
  createUseDesignProjects,
  getProject,
  updateProject,
} from '../../../lib/studio/designProjects';
import { createUseActiveWork } from '../../../lib/studio/activeWorkStore';
import {
  getSelectedConcept,
  getActiveOutput,
  conceptsAreStale,
  outputIsStale,
  briefHasContent,
  buildDesignSnapshot,
  DESIGN_ROLE,
  normalizeRole,
  trayItemTitle,
} from '../../../lib/studio/designDraft';
import { buildAdvisorInsight } from '../../../lib/studio/jewelryAdvisor';
import { classifyCommand, COMMAND_INTENT, UNKNOWN_COMMAND_HE } from '../../../lib/studio/smartCommand';
import { buildOutputPack } from '../../../lib/studio/outputPack';
import {
  buildRenderBatchPlan,
  buildRenderBatchPlanPatch,
  DEFAULT_PACK_ID,
  DEFAULT_SCENE_ID,
  DEFAULT_RENDER_QUALITY,
} from '../../../lib/studio/renderSceneLibrary';
import {
  getDemoInventorySnapshot,
  toStudioTrayItem,
  getSourceLabelHe,
} from '../../../lib/studio/demoInventoryLayer';
import {
  ENTRY_PATH,
  computeWorkspaceStage,
  WORKSPACE_STAGE,
  buildCollectionSummaryHe,
} from '../../../lib/studio/creationOrchestrator';

import AssetPicker from '../assets/AssetPicker';
import InlineInventoryPicker from '../shared/InlineInventoryPicker';
import WelcomeStudio from './WelcomeStudio';
import CreationWorkspace from './CreationWorkspace';

const useWorkTray = createUseWorkTray(React);
const useDesignBrief = createUseDesignBrief(React);
const useDesignProjects = createUseDesignProjects(React);
const useActiveWork = createUseActiveWork(React);

const CHARACTER_TO_STYLE = Object.freeze({
  commercial: 'modern',
  luxury: 'luxury',
  capsule: 'custom',
  signature: 'statement',
});

export default function WelcomeCreationFlow() {
  // ------------------------------------------------------------------
  // 1) Store hooks — unconditional, first, exactly like every other
  //    shell in this codebase.
  // ------------------------------------------------------------------
  const tray = useWorkTray();
  const briefStore = useDesignBrief();
  const projectsStore = useDesignProjects();
  const { activeWorkId, setActiveWork, clearActiveWork } = useActiveWork();
  const router = useRouter();

  // ------------------------------------------------------------------
  // 2) Local UI state — unconditional.
  // ------------------------------------------------------------------
  const [screen, setScreen] = React.useState('welcome'); // 'welcome' | 'creating'
  const [entryPath, setEntryPath] = React.useState(null);
  const [forceDirections, setForceDirections] = React.useState(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [invPickerOpen, setInvPickerOpen] = React.useState(false);
  const [invItems, setInvItems] = React.useState([]);
  const [toast, setToast] = React.useState(null);
  const [outputPackSummaryHe, setOutputPackSummaryHe] = React.useState(null);
  const [renderPlanSummaryHe, setRenderPlanSummaryHe] = React.useState(null);

  const toastTimer = React.useRef(null);
  const lastAutoSaveSig = React.useRef(null);
  const lastAutoPrepSig = React.useRef(null);

  const showToast = React.useCallback((msg) => {
    if (!msg) return;
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  // ------------------------------------------------------------------
  // 3) Plain derived values (NOT hooks) — safe to compute even before
  //    hydration, since the store hooks already initialize with safe
  //    empty defaults (emptyBrief() / []) prior to their own hydration
  //    effects running. Needed below so the effects (still to come) can
  //    reference them.
  // ------------------------------------------------------------------
  const brief = briefStore.brief;
  const realTrayItems = Array.isArray(tray.items) ? tray.items : [];
  const hasStones = realTrayItems.length > 0;
  const concepts = Array.isArray(brief.concepts) ? brief.concepts : [];
  const hasConcepts = concepts.length > 0;
  const selected = getSelectedConcept(brief);
  const output = getActiveOutput(brief);
  const conceptsStale = conceptsAreStale(brief, realTrayItems);
  const outStale = outputIsStale(brief, realTrayItems);
  const hasIntentText = Boolean(
    (brief.designGoal && String(brief.designGoal).trim()) ||
      (brief.intention && String(brief.intention).trim())
  );

  const activeProject =
    activeWorkId && projectsStore.hydrated
      ? projectsStore.projects.find((p) => p.id === activeWorkId)
      : null;

  const resumableProject =
    activeProject ||
    (projectsStore.hydrated && Array.isArray(projectsStore.active)
      ? projectsStore.active.reduce(
          (best, p) => (!best || (p.updatedAt || 0) > (best.updatedAt || 0) ? p : best),
          null
        )
      : null);

  // ------------------------------------------------------------------
  // 4) Effects — unconditional, still before the hydration early-return.
  //    Each effect body starts with its OWN hydration/readiness guard, so
  //    nothing runs against incomplete pre-hydration data.
  // ------------------------------------------------------------------
  React.useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );

  // Section 9 — automatic behavior, through EXISTING public APIs only.
  // Auto-creates or updates the active Work File whenever there is
  // something meaningful to save, and stamps "נשמר אוטומטית" in the top
  // bar. No new store, no new persistence key: this is the EXACT same
  // save path components/studio/design/shell/StudioShell.js already uses
  // behind its manual "שמור" button — just triggered automatically here.
  React.useEffect(() => {
    if (!tray.hydrated || !briefStore.hydrated) return;
    if (screen !== 'creating') return;
    const canSave = hasStones || briefHasContent(brief);
    if (!canSave) return;
    const sig = JSON.stringify({ n: realTrayItems.length, b: brief });
    if (sig === lastAutoSaveSig.current) return;
    lastAutoSaveSig.current = sig;

    const snapshot = buildDesignSnapshot(realTrayItems, brief);
    const existing = activeWorkId ? getProject(activeWorkId) : null;
    if (existing) {
      updateProject(existing.id, { trayItems: realTrayItems, brief, snapshot });
      return;
    }
    const project = projectsStore.save({
      name: buildAutoSessionName(entryPath, brief, realTrayItems),
      trayItems: realTrayItems,
      brief,
      snapshot,
    });
    if (project && project.id) setActiveWork(project.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tray.hydrated, briefStore.hydrated, screen, brief, realTrayItems.length, activeWorkId]);

  // Section 9 — auto-prepare Output Pack + Render Plan once there is a
  // saved project with a selected direction, so the user never has to
  // open either panel manually. Uses the EXISTING public buildOutputPack
  // / buildRenderBatchPlan + buildRenderBatchPlanPatch + updateProject —
  // the SAME functions Clean 8D-8J already ship, just invoked
  // automatically instead of from a button.
  React.useEffect(() => {
    if (!tray.hydrated || !briefStore.hydrated) return;
    if (screen !== 'creating' || !activeProject || !selected) return;
    const sig = `${activeProject.id}:${selected.conceptId}:${realTrayItems.length}`;
    if (sig === lastAutoPrepSig.current) return;
    lastAutoPrepSig.current = sig;

    try {
      const projectForPack = { ...activeProject, trayItems: realTrayItems, brief };
      const pack = buildOutputPack(projectForPack);
      setOutputPackSummaryHe(
        'ערכת ההצגה עודכנה אוטומטית — ' + (pack.clientHe ? pack.clientHe.slice(0, 90) : 'מוכנה לצפייה.')
      );
    } catch (e) {
      console.warn('[welcome-flow] output pack auto-prepare unavailable', e);
    }

    try {
      const projectForRender = { ...activeProject, trayItems: realTrayItems, brief };
      const plan = buildRenderBatchPlan(projectForRender, {
        packId: DEFAULT_PACK_ID,
        sceneId: DEFAULT_SCENE_ID,
        qualityId: DEFAULT_RENDER_QUALITY,
      });
      const patch = buildRenderBatchPlanPatch(activeProject, plan);
      if (patch) updateProject(activeProject.id, patch);
      setRenderPlanSummaryHe('תוכנית הדמיה הוכנה אוטומטית — ' + plan.estimatedCostLineHe);
    } catch (e) {
      console.warn('[welcome-flow] render plan auto-prepare unavailable', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tray.hydrated,
    briefStore.hydrated,
    screen,
    activeProject && activeProject.id,
    selected && selected.conceptId,
    realTrayItems.length,
  ]);

  // ------------------------------------------------------------------
  // 5) Hydration gate — every hook above has now been called
  //    unconditionally on every render, so it is safe to branch here.
  // ------------------------------------------------------------------
  if (!tray.hydrated || !briefStore.hydrated) {
    return <div style={{ padding: '60px', textAlign: 'center' }}>טוען…</div>;
  }

  // ------------------------------------------------------------------
  // 6) Render-only derived values (not hooks — safe to compute here).
  // ------------------------------------------------------------------
  const stage = forceDirections && !hasConcepts
    ? WORKSPACE_STAGE.DIRECTIONS
    : computeWorkspaceStage({
        hasStones,
        hasIntentText,
        hasConcepts,
        conceptsStale,
        selected,
        output,
        outStale,
      });

  const advisorInsight = buildAdvisorInsight({
    trayItems: realTrayItems,
    brief,
    hasStones,
    hasConcepts,
    conceptsStale,
    selected,
    output,
    outStale,
  });

  // ------------------------------------------------------------------
  // Path entry + intake handlers. Every one of these calls an EXISTING
  // safe public API — no protected file, no new persistence key.
  // ------------------------------------------------------------------
  const openInStudioInventoryPicker = () => {
    setInvItems(getDemoInventorySnapshot());
    setInvPickerOpen(true);
  };

  const invEntries = invItems.map((item) => ({
    id: item.id,
    title: item.titleHe || item.title || '—',
    subtitle: [
      item.shapeHe,
      item.estimatedCarat != null ? `${item.estimatedCarat}ct` : null,
      item.color,
      getSourceLabelHe(item.sourceType),
    ]
      .filter(Boolean)
      .join(' · '),
    image: item.thumbImage || item.boxImage || null,
    raw: item,
  }));
  const invTrayIds = new Set(realTrayItems.map((it) => it.id));
  const onInvAdd = (entry) => {
    const trayItem = toStudioTrayItem(entry.raw);
    if (trayItem) tray.addItem(trayItem);
  };
  const onInvRemove = (entry) => tray.remove(entry.id);

  const beginFreshCreation = (path, initialText = '') => {
    // "יצירה חדשה" must never silently overwrite the currently active
    // creation. Existing projects remain saved; only the temporary Studio
    // session is cleared before the new guided flow begins.
    tray.clear();
    briefStore.clear();
    clearActiveWork();
    lastAutoSaveSig.current = null;
    lastAutoPrepSig.current = null;
    setForceDirections(false);
    setOutputPackSummaryHe(null);
    setRenderPlanSummaryHe(null);
    setEntryPath(path);
    setScreen('creating');
    if (initialText && String(initialText).trim()) {
      briefStore.update({ designGoal: String(initialText).trim() });
    }
  };

  const onChoosePath = (path) => {
    beginFreshCreation(path);
  };

  const onSubmitWelcomeIntake = (text) => {
    // Free text on the Welcome screen is the fastest idea-first path.
    beginFreshCreation(ENTRY_PATH.IDEA, text);
  };

  const onChooseProductOffer = (offerKey) => {
    if (offerKey) {
      briefStore.update({ productType: offerKey });
      return;
    }
    briefStore.update({
      designGoal: 'הצע את סוג התכשיט המתאים ביותר לאבן שנבחרה',
    });
  };

  const onSubmitIdeaText = (text) => {
    briefStore.update({ designGoal: text });
  };

  const onChooseCollectionCharacter = (key) => {
    const styleValue = CHARACTER_TO_STYLE[key] || null;
    if (styleValue) briefStore.update({ styleDirection: styleValue });
  };

  const onResumeProject = () => {
    if (!resumableProject) return;
    tray.replace(resumableProject.trayItems || []);
    briefStore.set(resumableProject.brief || {});
    setActiveWork(resumableProject.id);
  };

  const onChooseExistingAction = (key) => {
    // Recorded as the design goal so it rides along in the existing brief
    // — no new field. Honest, safe, and visible in the Output Pack later.
    const label =
      key === 'change'
        ? 'שינוי העיצוב הקיים'
        : key === 'variation'
        ? 'פיתוח וריאציה על העיצוב הקיים'
        : key === 'presentation'
        ? 'הכנת העיצוב הקיים להצגה'
        : 'המשך היצירה הקיימת';
    briefStore.update({ designGoal: label });
    if (key === 'continue' && resumableProject) onResumeProject();
  };

  const onPrimaryAction = () => {
    // 'understanding' stage's ONE action — bridge into the existing
    // DesignConceptPanel (view="concepts"), where the real, protected
    // generate button lives. No generation logic is duplicated here.
    setForceDirections(true);
  };

  // Smart Command Bar — reuses the EXACT Clean 8K classifier untouched.
  // Since this simplified flow has no separate "stones"/"brief" step keys,
  // safe navigational intents fold into the SAME one-flow stage machine:
  // OPEN_STONES/OPEN_REFERENCES open the same pickers used above;
  // OPEN_DIRECTIONS bridges forward like the primary action does;
  // OPEN_RENDER_STUDIO/OPEN_PRESENTATION route to the existing full pages.
  const handleSmartCommand = (rawText) => {
    const classification = classifyCommand(rawText);
    switch (classification.intent) {
      case COMMAND_INTENT.OPEN_STONES:
        openInStudioInventoryPicker();
        return { responseHe: classification.interpretationHe };
      case COMMAND_INTENT.OPEN_REFERENCES:
        setPickerOpen(true);
        return { responseHe: classification.interpretationHe };
      case COMMAND_INTENT.ADD_REFERENCE_TEXT: {
        const note = `רפרנס: ${classification.rawText}`;
        briefStore.update({ intention: [brief.intention, note].filter(Boolean).join('\n') });
        return { responseHe: classification.interpretationHe };
      }
      case COMMAND_INTENT.OPEN_DIRECTIONS:
        setForceDirections(true);
        return { responseHe: classification.interpretationHe };
      case COMMAND_INTENT.OPEN_RENDER_STUDIO:
        router.push({ pathname: '/studio/projects', query: { focus: 'media' } });
        return { responseHe: classification.interpretationHe };
      case COMMAND_INTENT.OPEN_PRESENTATION:
        setForceDirections(true);
        return { responseHe: classification.interpretationHe };
      case COMMAND_INTENT.EXPLAIN_NEXT_STEP:
        return { responseHe: advisorInsight.nextStepHe };
      default: {
        const note = `הנחיה: ${classification.rawText}`;
        briefStore.update({ intention: [brief.intention, note].filter(Boolean).join('\n') });
        return { responseHe: UNKNOWN_COMMAND_HE };
      }
    }
  };

  const onOpenMore = () => router.push('/studio/design');

  if (screen === 'welcome') {
    return (
      <>
        <WelcomeStudio onChoosePath={onChoosePath} onSubmitIntake={onSubmitWelcomeIntake} />
        {toast ? <Toast text={toast} /> : null}
      </>
    );
  }

  return (
    <>
      <CreationWorkspace
        path={entryPath}
        creationName={activeProject ? activeProject.name : null}
        isSaved={Boolean(activeProject)}
        stage={stage}
        hasStones={hasStones}
        trayItems={realTrayItems}
        brief={brief}
        selected={selected}
        advisorInsight={advisorInsight}
        outputPackSummaryHe={outputPackSummaryHe}
        renderPlanSummaryHe={renderPlanSummaryHe}
        onPrimaryAction={onPrimaryAction}
        onOpenStonePicker={openInStudioInventoryPicker}
        onOpenUpload={() => setPickerOpen(true)}
        onChooseProductOffer={onChooseProductOffer}
        onSubmitIdeaText={onSubmitIdeaText}
        onChooseCollectionCharacter={onChooseCollectionCharacter}
        onChooseExistingAction={onChooseExistingAction}
        onResumeProject={onResumeProject}
        resumableProjectName={
          entryPath === ENTRY_PATH.EXISTING && resumableProject ? resumableProject.name : null
        }
        onOpenMore={onOpenMore}
        onSubmitCommand={handleSmartCommand}
        onToast={showToast}
      />

      <AssetPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        tray={tray}
        projectsStore={projectsStore}
        currentProjectId={activeWorkId}
      />

      <InlineInventoryPicker
        open={invPickerOpen}
        title="בחר אבנים מהמלאי"
        items={invEntries}
        selectedIds={invTrayIds}
        onAdd={onInvAdd}
        onRemove={onInvRemove}
        onClose={() => setInvPickerOpen(false)}
      />

      {toast ? <Toast text={toast} /> : null}
    </>
  );
}

function buildAutoSessionName(path, brief, trayItems) {
  if (path === ENTRY_PATH.COLLECTION) return `קולקציה — ${buildCollectionSummaryHe(trayItems)}`;
  const center = (Array.isArray(trayItems) ? trayItems : []).find(
    (it) => normalizeRole(it.role) === DESIGN_ROLE.CENTER_STONE
  );
  const centerTitle = center ? trayItemTitle(center) : '';
  return centerTitle ? `יצירה חדשה — ${centerTitle}` : 'יצירה חדשה';
}

function Toast({ text }) {
  return (
    <div
      dir="rtl"
      role="status"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: '24px',
        transform: 'translateX(-50%)',
        fontFamily: '"DM Sans", "Helvetica Neue", Arial, sans-serif',
        fontSize: '13.5px',
        fontWeight: 600,
        color: '#FFFFFF',
        background: '#14161A',
        padding: '9px 18px',
        borderRadius: '7px',
        zIndex: 50,
        pointerEvents: 'none',
      }}
    >
      {text}
    </div>
  );
}
