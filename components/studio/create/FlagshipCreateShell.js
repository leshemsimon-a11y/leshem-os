// components/studio/create/FlagshipCreateShell.js
//
// LESHEM.S OS — Clean 9A: Flagship Creation + Render Flow.
//
// The NEW primary content of /studio/create — a major reset of the flagship
// journey (replaces Clean 8L's AtelierCreateShell as what's mounted; that
// file, and the older CreateFlowShell/goldenPath, are left in the repo,
// untouched, simply no longer mounted here — same additive-only pattern as
// every prior milestone).
//
// Seven visible stages, one clear primary action at each:
//   1. Welcome        — 3 entry paths (stone / idea / collection) + free text
//   2. Intake         — stone/asset selection + CreateIntakeArea (drag/drop/
//                       upload/paste text/URL/image/STL/OBJ — reused as-is)
//   3. Understanding  — jewelry type / stone / style / metal / creative
//                       freedom level / key reference note; confirm/edit/cancel
//   4. Directions     — exactly 3 product-type-enforced directions, each with
//                       a single "select" action
//   5. Refine         — free text + quick chips, edit/regenerate/back
//   6. Render Prep    — scene / angle / format / output-count / creativity
//                       presets (preparation only — no external engine)
//   7. Save + Present — save work file, prepare media package, copy render
//                       brief, copy media prompt, present to client
//
// Navigation is owned ENTIRELY by local React state (`stage`) — no URL/query
// sync anywhere, per standing instruction. PERSISTENCE — one moment only:
// nothing is written until "שמור תיק יצירה" (or "שמור וצא"), via the
// EXISTING public projectsStore.save + setActiveWorkId. Render-prep choices
// and the inferred creative-freedom level are NOT persisted to the project
// schema (no new brief field) — they live in this component's state and are
// only baked into the copy-able render brief / media prompt text at Stage 7.
// This is a documented limitation, not a silent new persistence key.
//
// No new packages, no protected-store edits, no Airtable, no external AI,
// no external render engine, no pricing/certificates.

import * as React from 'react';
import { useRouter } from 'next/router';
import { styles } from './flagshipStyle';
import { createUseWorkTray } from '../../../lib/studio/workTray';
import { createUseDesignProjects } from '../../../lib/studio/designProjects';
import { setActiveWorkId } from '../../../lib/studio/activeWorkStore';
import { buildDesignSnapshot, DESIGN_ROLE } from '../../../lib/studio/designDraft';
import {
  generateCreateDirections,
  buildCreateBrief,
  buildCreateOutputPack,
  productHe,
  styleHe,
} from '../../../lib/studio/createFlow';
import {
  FLAGSHIP_STAGE,
  FLAGSHIP_STAGE_ORDER,
  previousFlagshipStage,
  ENTRY_MODE,
  requiresStone,
  inferCreativityLevel,
  parseRequestHe,
  buildRequestUnderstandingHe,
  expectedProductTypeFor,
  enforceDirectionsProductType,
  centerStoneNameHe,
} from '../../../lib/studio/flagshipCreate';
import {
  intakeToReferenceText,
  intakeSummaryHe,
  intakeCounts,
} from '../../../lib/studio/createIntake';
import {
  SCENE_PRESETS,
  ANGLE_PRESETS,
  FORMAT_PRESETS,
  OUTPUT_COUNT_OPTIONS,
  CREATIVITY_LEVELS,
  defaultRenderPrepSelection,
  buildRenderPrepLineHe,
  buildRenderPrepLineEn,
} from '../../../lib/studio/renderPrep';
import { BRIEF_HE } from '../../../lib/studio/labels';
import AssetPicker from '../assets/AssetPicker';
import CreateIntakeArea from './CreateIntakeArea';
import MediaPlaceholder from '../media/MediaPlaceholder';
import ConceptSketch from '../design/shell/ConceptSketch';
import { WelcomeArt, SceneThumb, RenderPreview } from './FlagshipVisuals';

const useWorkTray = createUseWorkTray(React);
const useDesignProjects = createUseDesignProjects(React);

const HE = Object.freeze({
  // Stage 1 — Welcome.
  welcomeHeadline: 'ברוך הבא לסטודיו התכשיטים שלך',
  welcomeQuestion: 'מה ניצור יחד היום?',
  entryStoneTitle: 'יש לי אבן',
  entryStoneSub: 'ואני רוצה ליצור סביבה תכשיט',
  entryIdeaTitle: 'יש לי רעיון',
  entryIdeaSub: 'לתכשיט',
  entryCollectionTitle: 'יש לי מלאי',
  entryCollectionSub: 'ואני רוצה לבנות כיוון לקולקציה',
  intakeLabel: 'כתוב בחופשיות מה תרצה ליצור',
  intakePlaceholder: 'לדוגמה: תליון עדין ומודרני בזהב לבן',
  intakeContinue: 'המשך',

  // Stage 2 — Intake.
  intakeStage: 'קליטה',
  chooseStone: 'בחר אבן',
  changeStone: 'החלף אבן',
  addStoneOptional: 'הוסף אבן (רשות)',
  noStoneYet: 'עדיין לא נבחרה אבן.',
  requestLabel: 'מה תרצה ליצור?',
  requestPlaceholder: 'לדוגמה: תליון עדין ומודרני בזהב לבן',
  continueBtn: 'המשך',
  needStoneHint: 'בחר אבן כדי להמשיך.',

  // Stage 3 — Understanding.
  understandingStage: 'מה הבנתי',
  understandingEyebrow: 'מה הבנתי',
  understandingUnclear: 'לא הצלחתי לזהות את סוג התכשיט — אפשר לחזור ולנסח מחדש.',
  rowType: 'סוג תכשיט',
  rowStone: 'אבן / נכס',
  rowStyle: 'סגנון',
  rowMetal: 'מתכת',
  rowCreativity: 'רמת חופש יצירתי',
  rowRefNote: 'הערת רפרנס מרכזית',
  noneYet: '—',
  confirmBtn: 'אישור, הצע כיוונים',
  editBtn: 'ערוך',
  cancelBtn: 'בטל',

  // Stage 4 — Directions.
  directionsStage: 'כיווני עיצוב',
  selectDirection: 'בחר',
  anotherDirection: 'הצע כיוון אחר',
  backToEdit: 'חזור וערוך',
  stoneRoleLabel: 'אבן',

  // Stage 5 — Refine.
  refineStage: 'דיוק',
  refineLabel: 'מה תרצה לשנות או לדייק?',
  refinePlaceholder: 'לדוגמה: יותר עדין / פחות גבוה / שיניים דקות יותר',
  quickChips: ['עדין יותר', 'נועז יותר', 'גובה שיבוץ נמוך יותר', 'יותר נוכחות לאבן', 'קלאסי יותר'],
  refineEdit: 'ערוך בקשה',
  refineRegenerate: 'הצע כיוונים אחרים',
  continueToRender: 'המשך להכנת הדמיה',

  // Stage 6 — Render Prep.
  renderPrepStage: 'הכנת הדמיה',
  sceneLabel: 'סצנה',
  angleLabel: 'זווית',
  formatLabel: 'פורמט',
  countLabel: 'כמות תוצרים',
  creativityLabel: 'רמת יצירתיות',
  continueToSave: 'המשך לשמירה',

  // Stage 7 — Save + Present.
  savePresentStage: 'שמירה והצגה',
  saveBtn: 'שמור תיק יצירה',
  saving: 'שומר…',
  saveFailed: 'השמירה נכשלה — נסה שוב.',
  preparePackage: 'הכן חבילת מדיה',
  hidePackage: 'הסתר חבילת מדיה',
  copyBrief: 'העתק תדריך הדמיה',
  copyPrompt: 'העתק הנחיית מדיה',
  presentToClient: 'הצג ללקוח',
  hidePresentation: 'סגור תצוגת לקוח',
  copied: 'הועתק ✓',
  savedTitle: 'התיק נוצר ונשמר בהצלחה.',
  openProjects: 'פתח תיקי יצירה',
  createAnother: 'צור עוד תכשיט',

  // Context bar / options menu.
  changeRequestShortcut: 'שנה בקשה',
  optionsMenu: 'אפשרויות',
  saveAndExit: 'שמור וצא',
  restart: 'התחל מחדש',
  cancelCreation: 'בטל יצירה',
  defaultTitle: 'יצירה חדשה',
  loading: 'טוען…',
});

const STAGE_LABEL_HE = {
  [FLAGSHIP_STAGE.INTAKE]: HE.intakeStage,
  [FLAGSHIP_STAGE.UNDERSTANDING]: HE.understandingStage,
  [FLAGSHIP_STAGE.DIRECTIONS]: HE.directionsStage,
  [FLAGSHIP_STAGE.REFINE]: HE.refineStage,
  [FLAGSHIP_STAGE.RENDER_PREP]: HE.renderPrepStage,
  [FLAGSHIP_STAGE.SAVE_PRESENT]: HE.savePresentStage,
};

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}
function DotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  );
}

function ContextBar({ title, stageLabel, onBack, onChangeRequest, showChangeRequest, menuOpen, setMenuOpen, onSaveAndExit, onRestart, onCancel }) {
  return (
    <div style={styles.contextBar}>
      <div style={styles.contextBarLeft}>
        <button type="button" style={styles.backBtn} onClick={onBack} aria-label={HE.editBtn}>
          <BackIcon />
        </button>
        <span style={styles.contextTitle}>{title}</span>
        <span style={styles.contextStage}>{stageLabel}</span>
        {showChangeRequest ? (
          <button type="button" style={styles.ghostBtn} onClick={onChangeRequest}>
            {HE.changeRequestShortcut}
          </button>
        ) : null}
      </div>
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          style={styles.menuBtn}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={HE.optionsMenu}
          aria-expanded={menuOpen ? 'true' : 'false'}
        >
          <DotsIcon />
        </button>
        {menuOpen ? (
          <div style={styles.menuSheet} role="menu">
            <button type="button" style={styles.menuItem} onClick={onSaveAndExit}>
              {HE.saveAndExit}
            </button>
            <button type="button" style={styles.menuItem} onClick={onRestart}>
              {HE.restart}
            </button>
            <button type="button" style={styles.menuItem} onClick={onCancel}>
              {HE.cancelCreation}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PresetGroup({ label, options, value, onChange, render }) {
  return (
    <div style={styles.presetGroup}>
      <span style={styles.presetGroupLabel}>{label}</span>
      <div style={styles.presetRow}>
        {options.map((o) => {
          const key = typeof o === 'object' ? o.key : o;
          const on = value === key;
          return (
            <button
              key={key}
              type="button"
              style={{ ...styles.presetChip, ...(on ? styles.presetChipOn : null) }}
              onClick={() => onChange(key)}
              aria-pressed={on ? 'true' : 'false'}
            >
              {render ? render(o) : (typeof o === 'object' ? o.he : o)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const PROGRESS_LABELS = [
  [FLAGSHIP_STAGE.WELCOME, 'ברוכים הבאים'],
  [FLAGSHIP_STAGE.INTAKE, 'קליטה'],
  [FLAGSHIP_STAGE.UNDERSTANDING, 'מה הבנתי'],
  [FLAGSHIP_STAGE.DIRECTIONS, 'כיוונים'],
  [FLAGSHIP_STAGE.REFINE, 'דיוק'],
  [FLAGSHIP_STAGE.RENDER_PREP, 'הדמיה'],
  [FLAGSHIP_STAGE.SAVE_PRESENT, 'שמירה'],
];

function StageProgress({ stage }) {
  const current = Math.max(0, PROGRESS_LABELS.findIndex(([key]) => key === stage));
  return (
    <div className="flagship-progress" style={styles.progressWrap} aria-label="התקדמות ביצירה">
      {PROGRESS_LABELS.map(([key, label], index) => {
        const done = index < current;
        const active = index === current;
        return (
          <React.Fragment key={key}>
            {index > 0 ? (
              <span style={{ ...styles.progressLine, ...(done || active ? styles.progressLineDone : null) }} />
            ) : null}
            <span style={styles.progressItem}>
              <span style={{
                ...styles.progressDot,
                ...(done ? styles.progressDotDone : null),
                ...(active ? styles.progressDotActive : null),
              }}>
                {done ? '✓' : index + 1}
              </span>
              <span>{label}</span>
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function ScenePresetGroup({ value, onChange }) {
  return (
    <div style={{ ...styles.presetGroup, ...styles.presetGroupWide }}>
      <span style={styles.presetGroupLabel}>{HE.sceneLabel}</span>
      <div className="flagship-scene-grid" style={styles.sceneGrid}>
        {SCENE_PRESETS.map((scene) => {
          const on = value === scene.key;
          return (
            <button
              key={scene.key}
              type="button"
              style={{ ...styles.sceneBtn, ...(on ? styles.sceneBtnOn : null) }}
              onClick={() => onChange(scene.key)}
              aria-pressed={on ? 'true' : 'false'}
            >
              <SceneThumb sceneKey={scene.key} selected={on} />
              <span>{scene.he}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FlagshipCreateShell() {
  const router = useRouter();
  const tray = useWorkTray();
  const projectsStore = useDesignProjects();

  const [stage, setStage] = React.useState(FLAGSHIP_STAGE.WELCOME);
  const [entryMode, setEntryMode] = React.useState(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [welcomeIntakeText, setWelcomeIntakeText] = React.useState('');
  const [selectedStoneItemId, setSelectedStoneItemId] = React.useState(null);
  const [requestText, setRequestText] = React.useState('');
  const [intakeItems, setIntakeItems] = React.useState([]);
  const [directions, setDirections] = React.useState([]);
  const [selectedDirectionId, setSelectedDirectionId] = React.useState(null);
  const [renderSel, setRenderSel] = React.useState(defaultRenderPrepSelection(null));
  const [creativityTouched, setCreativityTouched] = React.useState(false);
  const [packagePrepared, setPackagePrepared] = React.useState(false);
  const [presentingToClient, setPresentingToClient] = React.useState(false);
  const [copiedNote, setCopiedNote] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState(null);
  const [savedId, setSavedId] = React.useState(null);
  const [savedName, setSavedName] = React.useState(null);
  const pickerExistingIdsRef = React.useRef(new Set());

  const trayItems = Array.isArray(tray.items) ? tray.items : [];

  if (!tray.hydrated || !projectsStore.hydrated) {
    return <div style={styles.loading}>{HE.loading}</div>;
  }

  const selectedStoneItem = trayItems.find((it) => it.id === selectedStoneItemId) || null;

  // Collection mode represents every current tray item; stone/idea modes
  // represent a single "the stone" pointer. Read-only local copies only —
  // never mutates the shared Work Tray's own role assignments.
  const centerTrayItems =
    entryMode === ENTRY_MODE.COLLECTION
      ? trayItems.map((it, i) => ({
          ...it,
          role: i === 0 ? DESIGN_ROLE.CENTER_STONE : DESIGN_ROLE.ACCENT_STONE,
        }))
      : selectedStoneItem
        ? [{ ...selectedStoneItem, role: DESIGN_ROLE.CENTER_STONE }]
        : [];

  const stoneShapes = centerTrayItems
    .map((it) => (it.snapshot && it.snapshot.axes ? it.snapshot.axes.shape : null))
    .filter(Boolean);

  const referenceText = intakeToReferenceText(intakeItems, '');
  const parsed = parseRequestHe(requestText);
  const understandingSentence = buildRequestUnderstandingHe({ ...parsed, trayItems: centerTrayItems });
  const expectedProductType = expectedProductTypeFor(parsed.product);
  const inferredCreativity = inferCreativityLevel(parsed.styleMatches);

  const input = {
    product: parsed.product,
    style: parsed.style,
    trayItems: centerTrayItems,
    referenceText,
    requestText,
  };

  const selectedDirection = directions.find((d) => d.conceptId === selectedDirectionId) || null;
  const pack =
    directions.length > 0 ? buildCreateOutputPack(input, directions, selectedDirectionId) : null;

  const creationTitle =
    [productHe(parsed.product), parsed.styleMatches[0] ? styleHe(parsed.styleMatches[0]) : null]
      .filter(Boolean)
      .join(' · ') || HE.defaultTitle;

  const renderBriefHe = pack ? `${pack.professionalHe}\n\n${buildRenderPrepLineHe(renderSel)}` : '';
  const mediaPromptFull = pack ? `${pack.mediaPromptEn}\n${buildRenderPrepLineEn(renderSel)}` : '';

  const stoneSummaryHe = () => {
    if (entryMode === ENTRY_MODE.COLLECTION) {
      return trayItems.length
        ? `${trayItems.length} פריטים ממלאי הנכסים`
        : HE.noneYet;
    }
    return centerStoneNameHe(centerTrayItems) || (entryMode === ENTRY_MODE.IDEA ? 'רעיון חופשי — ללא אבן' : HE.noneYet);
  };

  // ------------------------------------------------------------------
  // Actions.
  // ------------------------------------------------------------------
  const resetAll = () => {
    setStage(FLAGSHIP_STAGE.WELCOME);
    setEntryMode(null);
    setMenuOpen(false);
    setPickerOpen(false);
    setWelcomeIntakeText('');
    setRequestText('');
    setIntakeItems([]);
    setSelectedStoneItemId(null);
    setDirections([]);
    setSelectedDirectionId(null);
    setRenderSel(defaultRenderPrepSelection(null));
    setCreativityTouched(false);
    setPackagePrepared(false);
    setPresentingToClient(false);
    setCopiedNote(null);
    setSaving(false);
    setSaveError(null);
    setSavedId(null);
    setSavedName(null);
  };

  const handleBack = () => {
    const prev = previousFlagshipStage(stage);
    if (prev) setStage(prev);
  };

  const selectEntry = (mode) => {
    setEntryMode(mode);
    setSelectedStoneItemId(null);
    setDirections([]);
    setSelectedDirectionId(null);
    setStage(FLAGSHIP_STAGE.INTAKE);
  };

  const handleWelcomeIntakeSubmit = () => {
    if (!welcomeIntakeText.trim()) return;
    setRequestText(welcomeIntakeText.trim());
    if (!entryMode) setEntryMode(ENTRY_MODE.IDEA);
    setStage(FLAGSHIP_STAGE.INTAKE);
  };

  const addIntakeItems = (newItems) =>
    setIntakeItems((prev) => prev.concat(newItems.filter(Boolean)));
  const removeIntakeItem = (id) =>
    setIntakeItems((prev) => prev.filter((it) => it.intakeId !== id));

  const openPicker = () => {
    pickerExistingIdsRef.current = new Set((Array.isArray(tray.items) ? tray.items : []).map((it) => it.id));
    setPickerOpen(true);
  };

  const handlePickerClose = () => {
    setPickerOpen(false);
    const items = Array.isArray(tray.items) ? tray.items : [];
    const newlyAdded = items.filter((it) => !pickerExistingIdsRef.current.has(it.id));
    if (newlyAdded.length) {
      const latest = newlyAdded.reduce(
        (a, b) => ((b.addedAt || 0) > (a.addedAt || 0) ? b : a),
        newlyAdded[0]
      );
      setSelectedStoneItemId(latest.id);
      setDirections([]);
      setSelectedDirectionId(null);
      setPackagePrepared(false);
      setPresentingToClient(false);
    }
  };

  const handleRequestChange = (text) => {
    setRequestText(text);
    if (directions.length || selectedDirectionId) {
      setDirections([]);
      setSelectedDirectionId(null);
      setPackagePrepared(false);
      setPresentingToClient(false);
    }
  };

  const runGeneration = () => {
    const raw = generateCreateDirections(input);
    const { directions: fixed } = enforceDirectionsProductType(raw, expectedProductType);
    setDirections(fixed);
    setSelectedDirectionId(null);
  };

  const handleConfirmUnderstanding = () => {
    if (!understandingSentence) return;
    runGeneration();
    if (!creativityTouched) {
      setRenderSel((prev) => ({ ...prev, creativityLevel: inferredCreativity }));
    }
    setStage(FLAGSHIP_STAGE.DIRECTIONS);
  };

  const handleSelectDirection = (id) => {
    setSelectedDirectionId(id);
    setStage(FLAGSHIP_STAGE.REFINE);
  };

  const handleRefineChange = (text) => {
    setDirections((prev) =>
      prev.map((d) => (d.conceptId === selectedDirectionId ? { ...d, conceptNotes: text } : d))
    );
  };

  const handleQuickChip = (label) => {
    const current = (selectedDirection && selectedDirection.conceptNotes) || '';
    if (current.indexOf(label) !== -1) return;
    handleRefineChange(current ? `${current}, ${label}` : label);
  };

  const performSave = () => {
    const brief = buildCreateBrief(input, directions, selectedDirectionId);
    const pHe = productHe(parsed.product);
    const sHe = parsed.styleMatches[0] ? styleHe(parsed.styleMatches[0]) : null;
    const name = pHe
      ? ['תיק יצירה', pHe, sHe].filter(Boolean).join(' · ')
      : `תיק יצירה · ${new Date().toLocaleDateString('he-IL')}`;
    const saved = projectsStore.save({
      name,
      trayItems: centerTrayItems,
      brief,
      snapshot: buildDesignSnapshot(centerTrayItems, brief),
    });
    if (saved && saved.id) {
      setActiveWorkId(saved.id);
      return saved;
    }
    return null;
  };

  const handleSave = () => {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    const saved = performSave();
    if (saved) {
      setSavedId(saved.id);
      setSavedName(saved.name);
    } else {
      setSaveError(HE.saveFailed);
    }
    setSaving(false);
  };

  const handleSaveAndExit = () => {
    setMenuOpen(false);
    const saved = performSave();
    if (saved) router.push('/studio/projects');
  };

  const handleCopy = (text, label) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text || '').catch(() => {});
    }
    setCopiedNote(label);
    setTimeout(() => setCopiedNote(null), 1800);
  };

  // ------------------------------------------------------------------
  // Bodies per stage.
  // ------------------------------------------------------------------
  let body = null;

  if (stage === FLAGSHIP_STAGE.WELCOME) {
    const entries = [
      { mode: ENTRY_MODE.STONE, title: HE.entryStoneTitle, sub: HE.entryStoneSub },
      { mode: ENTRY_MODE.IDEA, title: HE.entryIdeaTitle, sub: HE.entryIdeaSub },
      { mode: ENTRY_MODE.COLLECTION, title: HE.entryCollectionTitle, sub: HE.entryCollectionSub },
    ];
    body = (
      <div style={styles.stateCard}>
        <div style={styles.welcomeHero}>
          <h1 style={styles.headline}>{HE.welcomeHeadline}</h1>
          <p style={styles.question}>{HE.welcomeQuestion}</p>
        </div>
        <div className="flagship-entry-grid" style={styles.entryGrid}>
          {entries.map((e) => (
            <button
              key={e.mode}
              type="button"
              style={styles.entryCard}
              onClick={() => selectEntry(e.mode)}
            >
              <span style={styles.entryArt}><WelcomeArt mode={e.mode} /></span>
              <span style={styles.entryTitle}>{e.title}</span>
              <span style={styles.entrySub}>{e.sub}</span>
              <span style={styles.entryArrow} aria-hidden="true">←</span>
            </button>
          ))}
        </div>
        <div style={styles.smartIntake}>
          <textarea
            value={welcomeIntakeText}
            onChange={(e) => setWelcomeIntakeText(e.target.value)}
            placeholder={HE.intakePlaceholder}
            style={styles.smartTextarea}
            rows={1}
            dir="rtl"
            aria-label={HE.intakeLabel}
          />
          <button
            type="button"
            style={{ ...styles.sendBtn, opacity: welcomeIntakeText.trim() ? 1 : 0.35 }}
            disabled={!welcomeIntakeText.trim()}
            onClick={handleWelcomeIntakeSubmit}
            aria-label={HE.intakeContinue}
          >
            ←
          </button>
        </div>
      </div>
    );
  } else if (stage === FLAGSHIP_STAGE.INTAKE) {
    const needStone = requiresStone(entryMode) && !selectedStoneItem;
    const needRequest = !requestText.trim();
    const canContinue = !needStone && !needRequest;
    body = (
      <div style={styles.stateCard}>
        <div className="flagship-split" style={styles.splitLayout}>
          <div style={styles.visualPanel}>
            {selectedStoneItem ? (
              <>
                <span style={styles.stoneImageWrap}>
                  {selectedStoneItem.snapshot && selectedStoneItem.snapshot.primaryImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedStoneItem.snapshot.primaryImage} alt="" style={styles.stoneImage} />
                  ) : (
                    <MediaPlaceholder height={360} />
                  )}
                </span>
                <span style={styles.stoneName}>
                  {(selectedStoneItem.snapshot && selectedStoneItem.snapshot.name) || '—'}
                </span>
                <button type="button" style={styles.ghostBtn} onClick={openPicker}>
                  {entryMode === ENTRY_MODE.COLLECTION ? HE.chooseStone : HE.changeStone}
                </button>
              </>
            ) : (
              <div style={styles.emptyStoneBox}>
                <span>{entryMode === ENTRY_MODE.IDEA ? 'אפשר להתחיל מהרעיון ולהוסיף אבן בהמשך.' : HE.noStoneYet}</span>
                <button type="button" style={styles.secondaryBtn} onClick={openPicker}>
                  {entryMode === ENTRY_MODE.IDEA ? HE.addStoneOptional : HE.chooseStone}
                </button>
              </div>
            )}
          </div>

          <div style={styles.formPanel}>
            <h2 style={styles.stageTitle}>
              {entryMode === ENTRY_MODE.STONE ? 'מה תרצה ליצור סביב האבן?' : HE.requestLabel}
            </h2>
            <p style={styles.stageLead}>כתוב במילים שלך. המערכת תסכם את הבקשה לפני שתציע כיוונים.</p>
            <textarea
              value={requestText}
              onChange={(e) => handleRequestChange(e.target.value)}
              placeholder={HE.requestPlaceholder}
              style={styles.requestTextarea}
              rows={5}
              dir="rtl"
            />

            <CreateIntakeArea items={intakeItems} onAddItems={addIntakeItems} onRemoveItem={removeIntakeItem} />

            <div style={styles.nav}>
              <span style={{ ...styles.question, textAlign: 'right' }}>
                {needStone ? HE.needStoneHint : needRequest ? 'כתוב בקשה קצרה כדי להמשיך.' : ''}
              </span>
              <button
                type="button"
                style={{ ...styles.primaryBtn, ...(canContinue ? null : styles.primaryBtnDisabled) }}
                disabled={!canContinue}
                onClick={() => setStage(FLAGSHIP_STAGE.UNDERSTANDING)}
              >
                {HE.continueBtn}
              </button>
            </div>
          </div>
        </div>

        <AssetPicker
          open={pickerOpen}
          onClose={handlePickerClose}
          tray={tray}
          projectsStore={projectsStore}
          currentProjectId={savedId}
        />
      </div>
    );
  } else if (stage === FLAGSHIP_STAGE.UNDERSTANDING) {
    const metalHe = parsed.metalPreference ? BRIEF_HE.metal[parsed.metalPreference] : null;
    const refNote = (referenceText || requestText || '').trim();
    const rows = [
      [HE.rowType, productHe(parsed.product) || HE.noneYet],
      [HE.rowStone, stoneSummaryHe()],
      [HE.rowStyle, parsed.styleMatches.length ? parsed.styleMatches.map((k) => styleHe(k)).join(', ') : HE.noneYet],
      [HE.rowMetal, metalHe || HE.noneYet],
      [HE.rowCreativity, CREATIVITY_LEVELS.find((c) => c.key === inferredCreativity).he],
      [HE.rowRefNote, refNote ? (refNote.length > 90 ? `${refNote.slice(0, 90)}…` : refNote) : HE.noneYet],
    ];
    body = (
      <div style={styles.stateCard}>
        <div className="flagship-understanding" style={styles.understandingLayout}>
          <div style={styles.visualPanel}>
            {selectedStoneItem && selectedStoneItem.snapshot && selectedStoneItem.snapshot.primaryImage ? (
              <span style={styles.stoneImageWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedStoneItem.snapshot.primaryImage} alt="" style={styles.stoneImage} />
              </span>
            ) : (
              <WelcomeArt mode={entryMode || ENTRY_MODE.IDEA} />
            )}
          </div>
          <div style={styles.formPanel}>
            <div style={styles.understandingCard}>
              <span style={styles.understandingEyebrow}>{HE.understandingEyebrow}</span>
              {understandingSentence ? (
                <p style={styles.understandingText}>{understandingSentence}</p>
              ) : (
                <p style={styles.understandingText}>{HE.understandingUnclear}</p>
              )}
            </div>
            <div style={styles.summaryGrid}>
              {rows.map(([k, v]) => (
                <div key={k} style={styles.presentationRow}>
                  <span style={styles.presentationKey}>{k}</span>
                  <span style={styles.presentationVal}>{v}</span>
                </div>
              ))}
            </div>
            <div style={styles.nav}>
              <div style={styles.navActions}>
                <button type="button" style={styles.ghostBtn} onClick={() => setStage(FLAGSHIP_STAGE.INTAKE)}>
                  {HE.editBtn}
                </button>
                <button type="button" style={styles.ghostBtn} onClick={resetAll}>
                  {HE.cancelBtn}
                </button>
              </div>
              <button
                type="button"
                style={{ ...styles.primaryBtn, ...(understandingSentence ? null : styles.primaryBtnDisabled) }}
                disabled={!understandingSentence}
                onClick={handleConfirmUnderstanding}
              >
                {HE.confirmBtn}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (stage === FLAGSHIP_STAGE.DIRECTIONS) {
    const stoneNameHe = stoneSummaryHe();
    body = (
      <div style={styles.stateCard}>
        <div style={styles.welcomeHero}>
          <h2 style={styles.stageTitle}>בחר כיוון עיצוב להמשך</h2>
          <p style={styles.stageLead}>שלוש הצעות שנבנו לפי סוג התכשיט, האבן והבקשה שאישרת.</p>
        </div>
        <div className="flagship-directions" style={styles.directionList}>
          {directions.map((d) => (
            <div key={d.conceptId} style={styles.directionCard}>
              <span style={styles.directionVisual}>
                <ConceptSketch
                  concept={d}
                  fallbackProductType={expectedProductType}
                  stoneShapes={stoneShapes}
                  size={210}
                  title={d.conceptName}
                />
              </span>
              <span style={styles.directionName}>{d.conceptName}</span>
              <span style={styles.directionDesc}>{d.shortDescription}</span>
              {stoneNameHe && stoneNameHe !== HE.noneYet ? (
                <span style={styles.directionMeta}>
                  <b>{HE.stoneRoleLabel}:</b> {stoneNameHe}
                </span>
              ) : null}
              <button type="button" style={styles.primaryBtn} onClick={() => handleSelectDirection(d.conceptId)}>
                {HE.selectDirection}
              </button>
            </div>
          ))}
        </div>
        <div style={styles.nav}>
          <button type="button" style={styles.ghostBtn} onClick={() => setStage(FLAGSHIP_STAGE.UNDERSTANDING)}>
            {HE.backToEdit}
          </button>
          <button type="button" style={styles.ghostBtn} onClick={runGeneration}>
            {HE.anotherDirection}
          </button>
        </div>
      </div>
    );
  } else if (stage === FLAGSHIP_STAGE.REFINE) {
    body = (
      <div style={styles.stateCard}>
        <div className="flagship-refine" style={styles.refineLayout}>
          <div style={styles.visualPanel}>
            {selectedDirection ? (
              <ConceptSketch
                concept={selectedDirection}
                fallbackProductType={expectedProductType}
                stoneShapes={stoneShapes}
                size={300}
                title={selectedDirection.conceptName}
              />
            ) : null}
          </div>
          <div style={styles.formPanel}>
            {selectedDirection ? (
              <>
                <h2 style={styles.stageTitle}>{selectedDirection.conceptName}</h2>
                <p style={styles.stageLead}>{selectedDirection.shortDescription}</p>
              </>
            ) : null}
            <span style={styles.intakeLabel}>{HE.refineLabel}</span>
            <textarea
              value={(selectedDirection && selectedDirection.conceptNotes) || ''}
              onChange={(e) => handleRefineChange(e.target.value)}
              placeholder={HE.refinePlaceholder}
              style={styles.requestTextarea}
              rows={4}
              dir="rtl"
            />
            <div style={styles.quickChipRow}>
              {HE.quickChips.map((label) => (
                <button key={label} type="button" style={styles.quickChip} onClick={() => handleQuickChip(label)}>
                  {label}
                </button>
              ))}
            </div>
            <div style={styles.nav}>
              <div style={styles.navActions}>
                <button type="button" style={styles.ghostBtn} onClick={() => setStage(FLAGSHIP_STAGE.INTAKE)}>
                  {HE.refineEdit}
                </button>
                <button
                  type="button"
                  style={styles.ghostBtn}
                  onClick={() => {
                    runGeneration();
                    setStage(FLAGSHIP_STAGE.DIRECTIONS);
                  }}
                >
                  {HE.refineRegenerate}
                </button>
              </div>
              <button type="button" style={styles.primaryBtn} onClick={() => setStage(FLAGSHIP_STAGE.RENDER_PREP)}>
                {HE.continueToRender}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (stage === FLAGSHIP_STAGE.RENDER_PREP) {
    body = (
      <div style={styles.stateCard}>
        <div style={styles.welcomeHero}>
          <h2 style={styles.stageTitle}>הכנת ההדמיה</h2>
          <p style={styles.stageLead}>בחר את אופי התצוגה. ברירות המחדל כבר מותאמות להצגת תכשיט מקצועית.</p>
        </div>
        <div className="flagship-render" style={styles.renderLayout}>
          <RenderPreview
            sceneKey={renderSel.sceneKey}
            conceptTitle={selectedDirection ? selectedDirection.conceptName : ''}
            selectedStone={selectedStoneItem}
          />
          <div className="flagship-render-controls" style={styles.renderControls}>
            <ScenePresetGroup
              value={renderSel.sceneKey}
              onChange={(v) => setRenderSel((p) => ({ ...p, sceneKey: v }))}
            />
            <PresetGroup
              label={HE.angleLabel}
              options={ANGLE_PRESETS}
              value={renderSel.angleKey}
              onChange={(v) => setRenderSel((p) => ({ ...p, angleKey: v }))}
            />
            <PresetGroup
              label={HE.formatLabel}
              options={FORMAT_PRESETS}
              value={renderSel.formatKey}
              onChange={(v) => setRenderSel((p) => ({ ...p, formatKey: v }))}
            />
            <PresetGroup
              label={HE.countLabel}
              options={OUTPUT_COUNT_OPTIONS}
              value={renderSel.outputCount}
              onChange={(v) => setRenderSel((p) => ({ ...p, outputCount: v }))}
              render={(n) => String(n)}
            />
            <PresetGroup
              label={HE.creativityLabel}
              options={CREATIVITY_LEVELS}
              value={renderSel.creativityLevel}
              onChange={(v) => {
                setCreativityTouched(true);
                setRenderSel((p) => ({ ...p, creativityLevel: v }));
              }}
            />
            <div style={{ ...styles.nav, gridColumn: '1 / -1' }}>
              <button type="button" style={styles.ghostBtn} onClick={() => setStage(FLAGSHIP_STAGE.REFINE)}>
                {HE.backToEdit}
              </button>
              <button type="button" style={styles.primaryBtn} onClick={() => setStage(FLAGSHIP_STAGE.SAVE_PRESENT)}>
                {HE.continueToSave}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (stage === FLAGSHIP_STAGE.SAVE_PRESENT) {
    if (savedId) {
      body = (
        <div style={styles.stateCard}>
          <div style={styles.successCard}>
            <span style={styles.successTitle}>{HE.savedTitle}</span>
            <span>{savedName}</span>
            <div style={styles.successActions}>
              <button type="button" style={styles.primaryBtn} onClick={() => router.push('/studio/projects')}>
                {HE.openProjects}
              </button>
              <button type="button" style={styles.secondaryBtn} onClick={resetAll}>
                {HE.createAnother}
              </button>
            </div>
          </div>
        </div>
      );
    } else if (presentingToClient) {
      body = (
        <div style={styles.stateCard}>
          <div style={styles.clientCard}>
            <MediaPlaceholder height={200} />
            <p style={styles.clientDesc}>{pack ? pack.clientHe : ''}</p>
            <button type="button" style={styles.secondaryBtn} onClick={() => setPresentingToClient(false)}>
              {HE.hidePresentation}
            </button>
          </div>
        </div>
      );
    } else {
      body = (
        <div style={styles.stateCard}>
          <button type="button" style={styles.primaryBtn} disabled={saving} onClick={handleSave}>
            {saving ? HE.saving : HE.saveBtn}
          </button>
          {saveError ? <p style={{ color: 'crimson' }}>{saveError}</p> : null}
          <div style={styles.iconActionGrid}>
            <button
              type="button"
              style={styles.iconActionBtn}
              onClick={() => setPackagePrepared(!packagePrepared)}
            >
              {packagePrepared ? HE.hidePackage : HE.preparePackage}
            </button>
            <button type="button" style={styles.iconActionBtn} onClick={() => setPresentingToClient(true)}>
              {HE.presentToClient}
            </button>
          </div>
          {packagePrepared ? (
            <>
              <div style={styles.copyBlock}>
                <p style={styles.copyBlockText}>{renderBriefHe}</p>
                <button type="button" style={styles.ghostBtn} onClick={() => handleCopy(renderBriefHe, HE.copyBrief)}>
                  {HE.copyBrief}
                </button>
              </div>
              <div style={styles.copyBlock}>
                <p style={styles.copyBlockText}>{mediaPromptFull}</p>
                <button type="button" style={styles.ghostBtn} onClick={() => handleCopy(mediaPromptFull, HE.copyPrompt)}>
                  {HE.copyPrompt}
                </button>
              </div>
            </>
          ) : null}
          {copiedNote ? <span style={styles.savedNote}>{HE.copied}</span> : null}
        </div>
      );
    }
  }

  return (
    <div style={styles.page} dir="rtl">
      <div style={styles.shell}>
        {stage !== FLAGSHIP_STAGE.WELCOME ? <StageProgress stage={stage} /> : null}
        {stage !== FLAGSHIP_STAGE.WELCOME ? (
          <ContextBar
            title={creationTitle}
            stageLabel={STAGE_LABEL_HE[stage] || ''}
            onBack={handleBack}
            onChangeRequest={() => setStage(FLAGSHIP_STAGE.INTAKE)}
            showChangeRequest={stage !== FLAGSHIP_STAGE.INTAKE}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            onSaveAndExit={handleSaveAndExit}
            onRestart={resetAll}
            onCancel={resetAll}
          />
        ) : null}
        {body}
      </div>
      <style jsx>{`
        @media (max-width: 980px) {
          .flagship-entry-grid,
          .flagship-directions {
            grid-template-columns: 1fr !important;
          }
          .flagship-split,
          .flagship-understanding,
          .flagship-refine,
          .flagship-render {
            grid-template-columns: 1fr !important;
          }
          .flagship-render-controls {
            grid-template-columns: 1fr !important;
          }
          .flagship-scene-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .flagship-progress {
            justify-content: flex-start !important;
          }
        }
        @media (max-width: 620px) {
          .flagship-scene-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
