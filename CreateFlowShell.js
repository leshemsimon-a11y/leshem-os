// components/studio/create/CreateFlowShell.js
//
// LESHEM.S OS — Clean 8K-R4: Golden Path Reset.
//
// /studio/create is the ONE canonical guided creation path. This milestone
// REPLACES the prior 8-step flow (Clean 8H) with a single reliable scenario:
//
//   select stone -> write free-text request -> "מה הבנתי" understanding gate
//   (confirm or edit) -> exactly 3 product-type-enforced directions -> select
//   -> refine with free text -> "הכן להצגה" presentation -> "שמור ביצירה"
//
// Every stage exposes חזרה, a "שנה בקשה" shortcut back to the request text
// (once there is a request to change), and a compact options menu (שמור
// וצא / התחל מחדש / בטל יצירה). No stage is one-way. The Work Tray, Output
// Pack, Render Plan, and Media Workflow are NOT surfaced anywhere in this
// component — they remain reachable elsewhere as advanced tools, untouched.
//
// PERSISTENCE — existing public APIs only, no new key, no schema change:
//   • "שמור וצא" / "שמור ביצירה" both call the SAME commitProgress(), which
//     creates the Work File via the EXISTING projectsStore.save() the FIRST
//     time, then EXISTING updateProject(id, patch) on every save after that
//     (tracked locally by `projectId`, mirroring how the app already tracks
//     activeWorkId elsewhere) — never a duplicate project per save.
//   • Refinement text is stored in each concept's EXISTING conceptNotes
//     field (already a free-text field on every concept/direction) — not a
//     new field.
//   • Metal preference is stored in the brief's EXISTING metalPreference
//     field (already valid on designDraft.js's brief schema; Create Flow
//     simply never populated it before).
//   • RESUMING an in-progress creation (getActiveWorkId -> getProject) is
//     gated on lib/studio/goldenPath.js's isCreateFlowProject() marker check
//     so this never hijacks a project that belongs to the OTHER (/studio/
//     design) flow. The resume STAGE itself is DERIVED from the existing
//     brief shape (deriveResumeStage) — it is never itself stored. Known,
//     accepted gap: if the person closes the tab mid-flow WITHOUT ever
//     triggering שמור וצא, that in-progress state is not recoverable —
//     exactly the same "persistence only at an explicit save point" rule
//     the prior flow already followed; the options menu keeps שמור וצא one
//     tap away from every stage precisely so this is rarely reached.
//   • Browser-back safety: Next.js beforePopState intercepts a browser-back
//     attempt while the person is inside the flow and moves to the previous
//     local stage instead of leaving the page. This avoids synchronizing the
//     stage in both React state and the URL, which can race and cause visible
//     flicker. At the first stage, normal browser back is allowed.

import * as React from 'react';
import { useRouter } from 'next/router';
import { tokens } from '../shared/tokens';
import { CONCEPT_HE } from '../../../lib/studio/labels';
import { createUseWorkTray } from '../../../lib/studio/workTray';
import { createUseDesignProjects, updateProject } from '../../../lib/studio/designProjects';
import { getActiveWorkId, setActiveWorkId, clearActiveWork } from '../../../lib/studio/activeWorkStore';
import { buildDesignSnapshot, normalizeRole } from '../../../lib/studio/designDraft';
import {
  productHe,
  styleHe,
  generateCreateDirections,
  buildCreateBrief,
  buildCreateOutputPack,
} from '../../../lib/studio/createFlow';
import {
  GOLDEN_STAGE,
  GOLDEN_STAGE_ORDER,
  previousStage,
  parseRequestHe,
  buildRequestUnderstandingHe,
  enforceDirectionsProductType,
  expectedProductTypeFor,
  deriveResumeStage,
  isCreateFlowProject,
} from '../../../lib/studio/goldenPath';

const useWorkTray = createUseWorkTray(React);
const useDesignProjects = createUseDesignProjects(React);

export const GOLDEN_HE = Object.freeze({
  title: 'יצירת תכשיט',
  stepOf: (i, n) => `שלב ${i} מתוך ${n}`,
  back: 'חזרה',
  next: 'המשך',
  changeRequest: 'שנה בקשה',
  optionsToggle: 'אפשרויות',
  optionSaveExit: 'שמור וצא',
  optionRestart: 'התחל מחדש',
  optionCancel: 'בטל יצירה',
  loading: 'טוען…',

  // Stage: stone.
  stoneTitle: 'בחירת אבן',
  stonesCount: (n) => (n === 1 ? 'נבחרה אבן אחת ליצירה' : `נבחרו ${n} אבנים ליצירה`),
  stonesEmpty: 'עדיין לא נבחרה אבן — אפשר להמשיך גם בלי אבן, או לפתוח את המלאי ולבחור אחת.',
  continueNoStone: 'המשך בלי אבן',
  openInventory: 'פתח מלאי',
  replaceStone: 'החלף אבן',
  requestChanged: 'הבקשה השתנתה — אשר אותה מחדש לפני שנמשיך לכיוונים.',
  returnToUnderstanding: 'חזור למה הבנתי',

  // Stage: request.
  requestTitle: 'מה רוצים ליצור?',
  requestLabel: 'תיאור חופשי של התכשיט',
  requestPlaceholder: 'לדוגמה: תליון עדין ומודרני בזהב לבן',
  requestHint: 'אפשר לתאר סוג תכשיט, סגנון ומתכת במשפט אחד חופשי.',

  // Stage: understanding.
  understandingTitle: 'מה הבנתי',
  understandingConfirm: 'נכון, הצע כיוונים',
  understandingEdit: 'שנה את הבקשה',
  understandingUnclear:
    'לא זיהיתי סוג תכשיט ברור מהבקשה — אפשר לציין טבעת, תליון, עגילים, צמיד, שרשרת או תכשיט קלאסטר.',

  // Stage: directions.
  directionsTitle: 'כיוונים',
  directionSelect: 'בחר להמשך',
  directionSelectedBadge: 'נבחר ✓',
  tryAnotherDirection: 'נסה כיוון אחר',
  sketchPlaceholder: 'תצוגה חזותית תתאפשר בהמשך',
  stoneRoleLabel: 'תפקיד האבן',
  productionLabel: 'הערת ייצור',

  // Stage: refine.
  refineTitle: 'הכיוון שבחרת',
  refineLabel: 'מה תרצה לשנות או לדייק?',
  refinePlaceholder: 'לדוגמה: פחות גבוה, יותר עדין, תן לאבן יותר נוכחות…',
  refineSaved: 'ההנחיה נשמרה ותשמש בהכנת ההדמיה.',
  prepareForPresentation: 'הכן להצגה',

  // Stage: presentation.
  presentationTitle: 'הצגה ללקוח',
  presentationJewelry: 'סוג תכשיט',
  presentationStone: 'אבן מרכזית',
  presentationStoneNone: 'ללא אבן מרכזית',
  presentationDirection: 'כיוון',
  presentationRefinements: 'דיוקים',
  presentationNoRefinements: 'ללא דיוקים נוספים',
  presentationDescription: 'תיאור ללקוח',
  presentationRenderPlaceholder: 'הדמיה תתאפשר בהמשך.',
  saveIntoCreation: 'שמור ביצירה',
  backToRefine: 'חזור לדייק',

  // Saved / terminal.
  savedTitle: 'התיק נשמר בהצלחה',
  savedAsPrefix: 'נשמר בשם',
  openProjects: 'פתח תיקי יצירה',
  createAnother: 'צור עוד תכשיט',
  saveFailed: 'השמירה נכשלה — נסה שוב.',
  saving: 'שומר…',
});

const STAGE_TITLE_HE = Object.freeze({
  [GOLDEN_STAGE.STONE]: GOLDEN_HE.stoneTitle,
  [GOLDEN_STAGE.REQUEST]: GOLDEN_HE.requestTitle,
  [GOLDEN_STAGE.UNDERSTANDING]: GOLDEN_HE.understandingTitle,
  [GOLDEN_STAGE.DIRECTIONS]: GOLDEN_HE.directionsTitle,
  [GOLDEN_STAGE.REFINE]: GOLDEN_HE.refineTitle,
  [GOLDEN_STAGE.PRESENTATION]: GOLDEN_HE.presentationTitle,
});

function resolveWorkFileName(product, style) {
  const pHe = productHe(product);
  const sHe = styleHe(style);
  if (pHe || sHe) return ['תיק יצירה', pHe, sHe].filter(Boolean).join(' · ');
  const now = new Date();
  return `תיק יצירה · ${now.toLocaleDateString('he-IL')} ${now.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export default function CreateFlowShell() {
  const router = useRouter();
  const tray = useWorkTray();
  const projectsStore = useDesignProjects();

  const [stage, setStage] = React.useState(GOLDEN_STAGE.STONE);
  const [requestText, setRequestText] = React.useState('');
  const [directions, setDirections] = React.useState([]);
  const [selectedDirectionId, setSelectedDirectionId] = React.useState(null);
  const [refinementText, setRefinementText] = React.useState('');
  const [projectId, setProjectId] = React.useState(null);
  const [optionsOpen, setOptionsOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState(null);
  const [savedName, setSavedName] = React.useState(null);
  const [resumeChecked, setResumeChecked] = React.useState(false);

  const stageRef = React.useRef(stage);

  const hydrated = tray.hydrated && projectsStore.hydrated;
  const trayItems = Array.isArray(tray.items) ? tray.items : [];

  // -------------------------------------------------------------------
  // Resume — once, after both stores hydrate. Only ever hydrates local
  // state from a project this SAME golden path created (isCreateFlowProject
  // marker check) so a Design Studio active project is never hijacked.
  // -------------------------------------------------------------------
  React.useEffect(() => {
    if (resumeChecked || !hydrated) return;
    const activeId = getActiveWorkId();
    const proj = activeId ? projectsStore.get(activeId) : null;
    if (proj && isCreateFlowProject(proj)) {
      const b = proj.brief || {};
      const concepts = Array.isArray(b.concepts) ? b.concepts : [];
      const selected = concepts.find((c) => c.conceptId === b.selectedConceptId) || null;
      setProjectId(proj.id);
      setRequestText(b.designGoal || '');
      setDirections(concepts);
      setSelectedDirectionId(b.selectedConceptId || null);
      setRefinementText(selected ? selected.conceptNotes || '' : '');
      setStage(deriveResumeStage(b, trayItems));
    }
    setResumeChecked(true);
    // trayItems intentionally excluded — resume runs exactly once; the live
    // tray is re-read on every subsequent render regardless.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeChecked, hydrated]);

  // -------------------------------------------------------------------
  // Browser-back safety — keep the stage in ONE source of truth (React
  // state). The previous URL<->state two-way synchronization could observe
  // a stale query value immediately after a stage change and bounce between
  // two stages, which appeared as rapid flicker and an unresponsive flow.
  //
  // beforePopState now intercepts only an actual browser-back attempt. While
  // inside the flow it moves one local stage back and cancels the route pop;
  // from the first stage, normal navigation out of the flow is allowed.
  // -------------------------------------------------------------------
  React.useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  React.useEffect(() => {
    if (!resumeChecked || !router.isReady) return undefined;

    router.beforePopState(() => {
      const currentStage = stageRef.current;
      const prev = previousStage(currentStage);
      if (prev) {
        setOptionsOpen(false);
        setStage(prev);
        return false;
      }
      return true;
    });

    return () => {
      router.beforePopState(() => true);
    };
  }, [resumeChecked, router]);

  if (!hydrated || !resumeChecked) {
    return <div style={styles.loading}>{GOLDEN_HE.loading}</div>;
  }

  // ------------------------------------------------------------------
  // Derived values (pure, recomputed every render — no separate state to
  // keep in sync).
  // ------------------------------------------------------------------
  const parsed = parseRequestHe(requestText);
  const understandingHe = buildRequestUnderstandingHe({
    product: parsed.product,
    styleMatches: parsed.styleMatches,
    metalPreference: parsed.metalPreference,
    trayItems,
  });
  const selectedDirection = directions.find((d) => d.conceptId === selectedDirectionId) || null;
  const directionsWithRefinement = selectedDirectionId
    ? directions.map((d) => (d.conceptId === selectedDirectionId ? { ...d, conceptNotes: refinementText } : d))
    : directions;
  const currentBriefInput = {
    product: parsed.product,
    style: parsed.style,
    trayItems,
    referenceText: '',
    requestText,
    metalPreference: parsed.metalPreference,
  };

  // ------------------------------------------------------------------
  // Actions.
  // ------------------------------------------------------------------
  const handleGenerate = () => {
    const raw = generateCreateDirections(currentBriefInput);
    const expected = expectedProductTypeFor(parsed.product);
    const { directions: checked } = enforceDirectionsProductType(raw, expected);
    setDirections(checked);
    setSelectedDirectionId(null);
    setStage(GOLDEN_STAGE.DIRECTIONS);
  };

  const handleSelectDirection = (id) => {
    const next = selectedDirectionId === id ? null : id;
    setSelectedDirectionId(next);
    if (next) {
      const dir = directions.find((d) => d.conceptId === next);
      setRefinementText((dir && dir.conceptNotes) || '');
    }
  };

  const commitProgress = () => {
    const brief = buildCreateBrief(currentBriefInput, directionsWithRefinement, selectedDirectionId);
    const name = resolveWorkFileName(parsed.product, parsed.style);
    const snapshot = buildDesignSnapshot(trayItems, brief);
    if (projectId) {
      return updateProject(projectId, { name, trayItems, brief, snapshot });
    }
    const saved = projectsStore.save({ name, trayItems, brief, snapshot });
    if (saved && saved.id) {
      setProjectId(saved.id);
      setActiveWorkId(saved.id);
    }
    return saved;
  };

  const handleSaveAndExit = () => {
    setOptionsOpen(false);
    const saved = commitProgress();
    if (saved && saved.id) {
      router.push('/studio/projects');
    } else {
      setSaveError(GOLDEN_HE.saveFailed);
    }
  };

  const handleRestart = () => {
    setOptionsOpen(false);
    // A real restart must not carry the previous stone selection or active
    // project into the next creation. Public APIs only; saved files remain.
    tray.clear();
    clearActiveWork();
    setStage(GOLDEN_STAGE.STONE);
    setRequestText('');
    setDirections([]);
    setSelectedDirectionId(null);
    setRefinementText('');
    setProjectId(null);
    setSaveError(null);
    setSavedName(null);
    // A prior שמור וצא, if any, stays safely saved as its own Work File —
    // restarting only clears THIS in-progress local session.
  };

  const handleCancel = () => {
    setOptionsOpen(false);
    tray.clear();
    clearActiveWork();
    router.push('/studio');
  };

  const handleFinalSave = async () => {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const saved = commitProgress();
      if (!saved || !saved.id) {
        setSaveError(GOLDEN_HE.saveFailed);
        return;
      }
      setSavedName(saved.name);
      setStage(GOLDEN_STAGE.SAVED);
    } catch (e) {
      setSaveError(GOLDEN_HE.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const handleRequestTextChange = (nextText) => {
    setRequestText(nextText);
    // Once the source request changes, every downstream direction belongs to
    // the old brief. Clear it immediately so browser/UI back cannot expose a
    // stale ring after the person changed the request to a pendant (or vice
    // versa). The new directions are created only after re-confirmation.
    if (directions.length || selectedDirectionId || refinementText) {
      setDirections([]);
      setSelectedDirectionId(null);
      setRefinementText('');
    }
  };

  const handleOpenInventory = () => router.push('/studio/inventory');

  const handleReplaceStone = () => {
    tray.clear();
    router.push('/studio/inventory');
  };

  const jumpToChangeRequest = () => setStage(GOLDEN_STAGE.REQUEST);

  // ------------------------------------------------------------------
  // Stage bodies + one primary action per stage.
  // ------------------------------------------------------------------
  let body = null;
  let primary = null; // { label, onClick, disabled }
  let secondary = null;
  const showChangeRequest =
    stage === GOLDEN_STAGE.UNDERSTANDING ||
    stage === GOLDEN_STAGE.DIRECTIONS ||
    stage === GOLDEN_STAGE.REFINE ||
    stage === GOLDEN_STAGE.PRESENTATION;

  if (stage === GOLDEN_STAGE.STONE) {
    body =
      trayItems.length === 0 ? (
        <div style={styles.emptyBox}>
          <p style={styles.emptyText}>{GOLDEN_HE.stonesEmpty}</p>
        </div>
      ) : (
        <>
          <div style={styles.banner}>{GOLDEN_HE.stonesCount(trayItems.length)}</div>
          <div style={styles.stoneList}>
            {trayItems.map((item) => {
              const s = item.snapshot || {};
              const roleHe = CONCEPT_HE.roleLabels[normalizeRole(item.role)] || CONCEPT_HE.roleLabels.unassigned;
              return (
                <div key={item.id} style={styles.stoneRow}>
                  {s.primaryImage ? (
                    <span style={styles.stoneThumb}>
                      <img src={s.primaryImage} alt="" style={styles.stoneImg} />
                    </span>
                  ) : null}
                  <span style={styles.stoneText}>
                    <span style={styles.stoneName}>{s.name || '—'}</span>
                    <span style={styles.stoneMeta}>
                      {[roleHe, s.shapeHe, s.caratWeight ? `${s.caratWeight} קראט` : null].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </>
      );
    primary = {
      label: trayItems.length === 0 ? GOLDEN_HE.continueNoStone : GOLDEN_HE.next,
      onClick: () => setStage(GOLDEN_STAGE.REQUEST),
      disabled: false,
    };
    secondary = trayItems.length
      ? { label: GOLDEN_HE.replaceStone, onClick: handleReplaceStone }
      : { label: GOLDEN_HE.openInventory, onClick: handleOpenInventory };
  } else if (stage === GOLDEN_STAGE.REQUEST) {
    body = (
      <>
        <span style={styles.fieldLabel}>{GOLDEN_HE.requestLabel}</span>
        <textarea
          value={requestText}
          onChange={(e) => handleRequestTextChange(e.target.value)}
          placeholder={GOLDEN_HE.requestPlaceholder}
          style={styles.textarea}
          rows={3}
          dir="rtl"
          autoFocus
        />
        <span style={styles.helper}>{GOLDEN_HE.requestHint}</span>
      </>
    );
    primary = {
      label: GOLDEN_HE.next,
      onClick: () => setStage(GOLDEN_STAGE.UNDERSTANDING),
      disabled: !requestText.trim(),
    };
  } else if (stage === GOLDEN_STAGE.UNDERSTANDING) {
    body = understandingHe ? (
      <div style={styles.liveSummary}>{understandingHe}</div>
    ) : (
      <div style={styles.warn}>{GOLDEN_HE.understandingUnclear}</div>
    );
    primary = {
      label: GOLDEN_HE.understandingConfirm,
      onClick: handleGenerate,
      disabled: !parsed.product,
    };
    secondary = { label: GOLDEN_HE.understandingEdit, onClick: jumpToChangeRequest };
  } else if (stage === GOLDEN_STAGE.DIRECTIONS) {
    if (directions.length === 0) {
      body = <div style={styles.warn}>{GOLDEN_HE.requestChanged}</div>;
      primary = {
        label: GOLDEN_HE.returnToUnderstanding,
        onClick: () => setStage(GOLDEN_STAGE.UNDERSTANDING),
        disabled: !requestText.trim(),
      };
    } else {
      body = (
        <div style={styles.directionList}>
          {directions.map((d) => {
          const on = d.conceptId === selectedDirectionId;
          return (
            <button
              key={d.conceptId}
              type="button"
              onClick={() => handleSelectDirection(d.conceptId)}
              style={{ ...styles.directionCard, ...(on ? styles.directionCardOn : null) }}
              aria-pressed={on ? 'true' : 'false'}
            >
              <span style={styles.sketchPlaceholder}>{GOLDEN_HE.sketchPlaceholder}</span>
              <span style={styles.directionNameRow}>
                <span style={styles.directionName}>{d.conceptName}</span>
                {on ? <span style={styles.selectedBadge}>{GOLDEN_HE.directionSelectedBadge}</span> : null}
              </span>
              <span style={styles.directionDesc}>{d.shortDescription}</span>
              <span style={styles.directionRow}>
                <b>{GOLDEN_HE.stoneRoleLabel}:</b> {d.stoneLayout}
              </span>
              <span style={styles.directionRow}>
                <b>{GOLDEN_HE.productionLabel}:</b> {d.productionNotes}
              </span>
            </button>
          );
          })}
        </div>
      );
      primary = {
        label: GOLDEN_HE.directionSelect,
        onClick: () => setStage(GOLDEN_STAGE.REFINE),
        disabled: !selectedDirection,
      };
      secondary = { label: GOLDEN_HE.tryAnotherDirection, onClick: handleGenerate };
    }
  } else if (stage === GOLDEN_STAGE.REFINE) {
    body = (
      <>
        {selectedDirection ? (
          <div style={styles.banner}>{selectedDirection.conceptName}</div>
        ) : null}
        <span style={styles.fieldLabel}>{GOLDEN_HE.refineLabel}</span>
        <textarea
          value={refinementText}
          onChange={(e) => setRefinementText(e.target.value)}
          placeholder={GOLDEN_HE.refinePlaceholder}
          style={styles.textarea}
          rows={3}
          dir="rtl"
        />
        {refinementText.trim() ? <span style={styles.helper}>{GOLDEN_HE.refineSaved}</span> : null}
      </>
    );
    primary = {
      label: GOLDEN_HE.prepareForPresentation,
      onClick: () => setStage(GOLDEN_STAGE.PRESENTATION),
      disabled: !selectedDirection,
    };
  } else if (stage === GOLDEN_STAGE.PRESENTATION) {
    const pack = buildCreateOutputPack(currentBriefInput, directionsWithRefinement, selectedDirectionId);
    const stoneName = trayItems.length ? trayItems[0].snapshot && trayItems[0].snapshot.name : null;
    const rows = [
      [GOLDEN_HE.presentationJewelry, productHe(parsed.product) || '—'],
      [GOLDEN_HE.presentationStone, stoneName || GOLDEN_HE.presentationStoneNone],
      [GOLDEN_HE.presentationDirection, selectedDirection ? selectedDirection.conceptName : '—'],
      [GOLDEN_HE.presentationRefinements, refinementText.trim() || GOLDEN_HE.presentationNoRefinements],
    ];
    body = (
      <>
        <div style={styles.previewRows}>
          {rows.map(([k, v]) => (
            <div key={k} style={styles.previewRow}>
              <span style={styles.previewKey}>{k}</span>
              <span style={styles.previewVal}>{v}</span>
            </div>
          ))}
        </div>
        <span style={styles.previewTitle}>{GOLDEN_HE.presentationDescription}</span>
        <p style={styles.packClient}>{pack.clientHe}</p>
        <span style={styles.helper}>{GOLDEN_HE.presentationRenderPlaceholder}</span>
        {saveError ? <div style={styles.warn}>{saveError}</div> : null}
      </>
    );
    primary = {
      label: saving ? GOLDEN_HE.saving : GOLDEN_HE.saveIntoCreation,
      onClick: handleFinalSave,
      disabled: saving,
    };
    secondary = { label: GOLDEN_HE.backToRefine, onClick: () => setStage(GOLDEN_STAGE.REFINE) };
  } else {
    // GOLDEN_STAGE.SAVED — terminal confirmation. No Output Pack / Render
    // Plan / Media Workflow wording or routing here — just confirmation and
    // two neutral next steps.
    body = (
      <div style={styles.successCard}>
        <span style={styles.successTitle}>{GOLDEN_HE.savedTitle}</span>
        {savedName ? (
          <span style={styles.successName}>
            {GOLDEN_HE.savedAsPrefix}: {savedName}
          </span>
        ) : null}
        <div style={styles.successActions}>
          <button type="button" style={styles.primaryBtn} onClick={() => router.push('/studio/projects')}>
            {GOLDEN_HE.openProjects}
          </button>
          <button type="button" style={styles.ghostBtn} onClick={handleRestart}>
            {GOLDEN_HE.createAnother}
          </button>
        </div>
      </div>
    );
    primary = null;
  }

  const stageIndex = GOLDEN_STAGE_ORDER.indexOf(stage);
  const canGoBack = stage !== GOLDEN_STAGE.STONE && stage !== GOLDEN_STAGE.SAVED;

  return (
    <div style={styles.page} dir="rtl">
      <div style={styles.header}>
        <span style={styles.title}>{GOLDEN_HE.title}</span>
        {stage !== GOLDEN_STAGE.SAVED ? (
          <span style={styles.progress}>{GOLDEN_HE.stepOf(stageIndex + 1, GOLDEN_STAGE_ORDER.length)}</span>
        ) : null}
      </div>

      {stage !== GOLDEN_STAGE.SAVED ? (
        <div style={styles.dots} aria-hidden="true">
          {GOLDEN_STAGE_ORDER.map((s, i) => (
            <span key={s} style={{ ...styles.dot, ...(i <= stageIndex ? styles.dotOn : null) }} />
          ))}
        </div>
      ) : null}

      {stage !== GOLDEN_STAGE.SAVED ? (
        <div style={styles.globalToolbar}>
          <span style={styles.globalToolbarLeft}>
            {canGoBack ? (
              <button
                type="button"
                style={styles.ghostBtn}
                onClick={() => {
                  const prev = previousStage(stage);
                  if (prev) setStage(prev);
                }}
              >
                {GOLDEN_HE.back}
              </button>
            ) : null}
            {showChangeRequest ? (
              <button type="button" style={styles.secondarySmallBtn} onClick={jumpToChangeRequest}>
                {GOLDEN_HE.changeRequest}
              </button>
            ) : null}
          </span>
          <span style={styles.optionsWrap}>
            <button type="button" style={styles.secondarySmallBtn} onClick={() => setOptionsOpen((v) => !v)}>
              {GOLDEN_HE.optionsToggle} ⋯
            </button>
            {optionsOpen ? (
              <div style={styles.optionsMenu}>
                <button type="button" style={styles.optionsMenuItem} onClick={handleSaveAndExit}>
                  {GOLDEN_HE.optionSaveExit}
                </button>
                <button type="button" style={styles.optionsMenuItem} onClick={handleRestart}>
                  {GOLDEN_HE.optionRestart}
                </button>
                <button type="button" style={styles.optionsMenuItem} onClick={handleCancel}>
                  {GOLDEN_HE.optionCancel}
                </button>
              </div>
            ) : null}
          </span>
        </div>
      ) : null}

      <div style={styles.card}>
        <span style={styles.stepTitle}>{STAGE_TITLE_HE[stage]}</span>
        {body}
      </div>

      {stage !== GOLDEN_STAGE.SAVED ? (
        <div style={styles.nav}>
          <span />
          <span style={styles.navActions}>
            {secondary ? (
              <button type="button" style={styles.secondarySmallBtn} onClick={secondary.onClick}>
                {secondary.label}
              </button>
            ) : null}
            {primary ? (
              <button
                type="button"
                style={{ ...styles.primaryBtn, ...(primary.disabled ? styles.btnDisabled : null) }}
                onClick={() => !primary.disabled && primary.onClick()}
                disabled={primary.disabled}
              >
                {primary.label}
              </button>
            ) : null}
          </span>
        </div>
      ) : null}
    </div>
  );
}

const styles = {
  page: {
    maxWidth: '600px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    padding: '6px 2px 40px',
  },
  loading: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    color: tokens.color.inkSoft,
    padding: '60px 0',
    textAlign: 'center',
  },
  header: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '10px',
  },
  title: {
    fontFamily: tokens.font.display,
    fontSize: '20px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  progress: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 600,
    color: tokens.color.inkSoft,
  },
  dots: { display: 'flex', gap: '6px' },
  dot: {
    width: '22px',
    height: '4px',
    borderRadius: '999px',
    background: tokens.color.goldFaint,
  },
  dotOn: { background: tokens.color.gold },
  globalToolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
  },
  globalToolbarLeft: { display: 'inline-flex', alignItems: 'center', gap: '8px' },
  optionsWrap: { position: 'relative', display: 'inline-flex' },
  optionsMenu: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    zIndex: 5,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: '150px',
    padding: '6px',
    borderRadius: tokens.radius.md,
    border: `1px solid ${tokens.color.cardEdge}`,
    background: '#FFFFFF',
    boxShadow: tokens.shadow.soft,
  },
  optionsMenuItem: {
    textAlign: 'right',
    padding: '9px 10px',
    borderRadius: tokens.radius.sm,
    border: 'none',
    background: 'transparent',
    color: tokens.color.charcoal,
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px',
    borderRadius: tokens.radius.md,
    border: `1px solid ${tokens.color.goldFaint}`,
    background: '#FFFFFF',
    boxShadow: tokens.shadow.soft,
  },
  stepTitle: {
    fontFamily: tokens.font.display,
    fontSize: '16px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  fieldLabel: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 800,
    color: tokens.color.gold,
  },
  liveSummary: {
    fontFamily: tokens.font.body,
    fontSize: '13.5px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.gold}`,
    borderRadius: tokens.radius.md,
    padding: '10px 13px',
  },
  banner: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    background: tokens.color.sageFaint,
    border: `1px solid ${tokens.color.sage}`,
    borderRadius: tokens.radius.md,
    padding: '9px 12px',
  },
  warn: {
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    fontWeight: 600,
    color: tokens.color.charcoal,
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.gold}`,
    borderRadius: tokens.radius.md,
    padding: '8px 12px',
  },
  emptyBox: { display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' },
  emptyText: {
    margin: 0,
    fontFamily: tokens.font.body,
    fontSize: '13px',
    color: tokens.color.inkSoft,
    lineHeight: 1.6,
  },
  helper: {
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    color: tokens.color.inkFaint,
  },
  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: tokens.font.body,
    fontSize: '13px',
    color: tokens.color.ink,
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.goldFaint}`,
    borderRadius: tokens.radius.md,
    padding: '10px 12px',
    resize: 'vertical',
  },
  stoneList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  stoneRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    borderRadius: tokens.radius.sm,
    border: `1px solid ${tokens.color.goldFaint}`,
    background: tokens.color.pearl,
  },
  stoneThumb: {
    width: '40px',
    height: '40px',
    borderRadius: tokens.radius.sm,
    overflow: 'hidden',
    flex: '0 0 auto',
    border: `1px solid ${tokens.color.cardEdge}`,
    display: 'inline-flex',
  },
  stoneImg: { width: '100%', height: '100%', objectFit: 'cover' },
  stoneText: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  stoneName: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  stoneMeta: {
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    color: tokens.color.inkSoft,
  },
  previewTitle: {
    fontFamily: tokens.font.body,
    fontSize: '13.5px',
    fontWeight: 800,
    color: tokens.color.charcoal,
  },
  previewRows: { display: 'flex', flexDirection: 'column', gap: '6px' },
  previewRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'baseline',
    padding: '6px 10px',
    borderRadius: tokens.radius.sm,
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.goldFaint}`,
  },
  previewKey: {
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    fontWeight: 800,
    color: tokens.color.gold,
    minWidth: '92px',
    flex: '0 0 auto',
  },
  previewVal: {
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    fontWeight: 600,
    color: tokens.color.charcoal,
    minWidth: 0,
    overflowWrap: 'anywhere',
  },
  packClient: {
    margin: 0,
    fontFamily: tokens.font.body,
    fontSize: '13px',
    color: tokens.color.ink,
    lineHeight: 1.6,
  },
  directionList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  directionCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    textAlign: 'right',
    padding: '12px 14px',
    borderRadius: tokens.radius.md,
    border: `1px solid ${tokens.color.goldFaint}`,
    background: tokens.color.pearl,
    cursor: 'pointer',
  },
  directionCardOn: {
    border: `1px solid ${tokens.color.gold}`,
    background: '#FFFFFF',
    boxShadow: `0 0 0 1px ${tokens.color.gold}`,
  },
  sketchPlaceholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '64px',
    borderRadius: tokens.radius.sm,
    background: tokens.color.goldFaint,
    color: tokens.color.inkFaint,
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 600,
  },
  directionNameRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' },
  directionName: {
    fontFamily: tokens.font.display,
    fontSize: '14.5px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  selectedBadge: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 800,
    color: tokens.color.gold,
    flex: '0 0 auto',
  },
  directionDesc: {
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    color: tokens.color.ink,
    lineHeight: 1.55,
  },
  directionRow: {
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    color: tokens.color.inkSoft,
    lineHeight: 1.5,
  },
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' },
  navActions: { display: 'inline-flex', alignItems: 'center', gap: '8px' },
  primaryBtn: {
    minHeight: '44px',
    padding: '10px 22px',
    borderRadius: '999px',
    border: 'none',
    background: tokens.color.charcoal,
    color: '#FFFFFF',
    fontFamily: tokens.font.body,
    fontSize: '13.5px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  secondarySmallBtn: {
    minHeight: '36px',
    padding: '7px 14px',
    borderRadius: '999px',
    border: `1px solid ${tokens.color.cardEdge}`,
    background: 'transparent',
    color: tokens.color.inkSoft,
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  ghostBtn: {
    minHeight: '40px',
    padding: '9px 16px',
    borderRadius: '999px',
    border: `1px solid ${tokens.color.cardEdge}`,
    background: 'transparent',
    color: tokens.color.inkSoft,
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  btnDisabled: { opacity: 0.45, cursor: 'not-allowed' },
  successCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '16px',
    borderRadius: tokens.radius.md,
    border: `1px solid ${tokens.color.sage}`,
    background: tokens.color.sageFaint,
  },
  successTitle: {
    fontFamily: tokens.font.display,
    fontSize: '17px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  successName: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 700,
    color: tokens.color.inkSoft,
  },
  successActions: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' },
};
