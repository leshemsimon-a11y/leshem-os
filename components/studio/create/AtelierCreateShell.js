// components/studio/create/AtelierCreateShell.js
//
// LESHEM.S OS — Clean 8L: Flagship Atelier Creation Experience.
//
// The NEW primary content of /studio/create. ONE flagship scenario only —
// "יש לי אבן ואני רוצה לעצב לה תכשיט" — as five visible states:
//   1. Welcome            — "ברוך הבא לסטודיו התכשיטים שלך" / "מה ניצור יחד היום?"
//   2. Stone + Request    — the selected stone as visual focus + free text
//   3. Understanding      — "מה הבנתי" confirm/edit gate
//   4. Directions         — exactly 3 product-type-enforced directions
//   5. Refine+Presentation — free-text refinement, then a presentation
//                            summary, then save
//
// Navigation is owned ENTIRELY by local React state (`stage`). There is no
// URL/query-param synchronization anywhere in this file — that pattern is
// what caused flicker in a prior attempt and is deliberately not
// reintroduced. Every stage after Welcome shows a compact context bar (back /
// creation title / stage label / options menu) so the person can always go
// back, edit the request, replace the stone, restart, or cancel.
//
// PERSISTENCE — one moment only, same model as the existing stable flow:
// nothing is written until "שמור ביצירה" (or "שמור וצא"), via the EXISTING
// public projectsStore.save (designProjects.js) + setActiveWorkId. Everything
// before that lives in this component's own state — including the
// refinement text, which is kept on the direction's EXISTING `conceptNotes`
// field (no new persistence key). If the tab is closed or refreshed before
// saving, the in-progress creation is lost; this is an intentional,
// documented limitation (see CHANGELOG-CLEAN-8L.md), not a silent new
// persistence architecture.
//
// No new packages, no protected-store edits, no Airtable, no external AI.

import * as React from 'react';
import { useRouter } from 'next/router';
import { styles } from './atelierStyle';
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
  ATELIER_STAGE,
  previousAtelierStage,
  parseRequestHe,
  buildRequestUnderstandingHe,
  expectedProductTypeFor,
  enforceDirectionsProductType,
  centerStoneNameHe,
} from '../../../lib/studio/atelierCreate';
import AssetPicker from '../assets/AssetPicker';
import AssetThumbnail from '../assets/AssetThumbnail';
import { createUseAssets } from '../../../lib/studio/assetsStore';
import MediaPlaceholder from '../media/MediaPlaceholder';

const useWorkTray = createUseWorkTray(React);
const useDesignProjects = createUseDesignProjects(React);
const useAssets = createUseAssets(React);

const ATELIER_HE = Object.freeze({
  // State 1 — Welcome.
  welcomeHeadline: 'ברוך הבא לסטודיו התכשיטים שלך',
  welcomeQuestion: 'מה ניצור יחד היום?',
  primaryPathTitle: 'יש לי אבן',
  primaryPathSub: 'אני רוצה לעצב לה תכשיט',
  quietComingNext: ['יש לי רעיון', 'אני רוצה לבנות קולקציה', 'יש לי תכשיט או סקיצה'],
  intakeLabel: 'או ספר לי במילים שלך מה תרצה ליצור…',
  intakePlaceholder: 'לדוגמה: תליון עדין ומודרני בזהב לבן',
  intakeContinue: 'המשך',

  // State 2 — Stone + Request.
  stoneRequestStage: 'אבן ובקשה',
  chooseStone: 'בחר אבן',
  changeStone: 'החלף אבן',
  noStoneYet: 'עדיין לא נבחרה אבן לעבודה.',
  requestLabel: 'מה תרצה ליצור סביב האבן?',
  requestPlaceholder: 'לדוגמה: תליון עדין ומודרני בזהב לבן',
  continueBtn: 'המשך',
  needStoneHint: 'בחר אבן כדי להמשיך.',
  needRequestHint: 'כתוב בקצרה מה תרצה ליצור.',

  // State 3 — Understanding.
  understandingStage: 'מה הבנתי',
  understandingEyebrow: 'מה הבנתי',
  understandingUnclear: 'לא הצלחתי לזהות את סוג התכשיט מהבקשה — אפשר לחזור ולנסח מחדש.',
  confirmUnderstanding: 'נכון, הצע לי כיוונים',
  editRequest: 'ערוך',

  // State 4 — Directions.
  directionsStage: 'כיווני עיצוב',
  chooseDirection: 'בחר להמשך',
  anotherDirection: 'הצע כיוון אחר',
  backToEdit: 'חזור וערוך',
  stoneRoleLabel: 'אבן מרכזית',
  productionLabel: 'ייצור',

  // State 5 — Refine + Presentation.
  refineStage: 'דיוק',
  presentationStage: 'הצגה',
  refineLabel: 'מה תרצה לשנות או לדייק?',
  refinePlaceholder: 'לדוגמה: יותר עדין / פחות גבוה / שיניים דקות יותר',
  refineSavedNote: 'ההנחיה נשמרה ותשמש בהכנת ההדמיה.',
  prepareBtn: 'הכן להצגה',
  chooseAnotherDirection: 'בחר כיוון אחר',
  presTypeLabel: 'סוג תכשיט',
  presStoneLabel: 'האבן',
  presDirectionLabel: 'הכיוון',
  presRefineLabel: 'דיוקים',
  presDescLabel: 'תיאור ללקוח',
  presNoRefine: 'טרם נוספו דיוקים.',
  backToRefine: 'חזור לדייק',
  saveBtn: 'שמור ביצירה',
  saving: 'שומר…',
  saveFailed: 'השמירה נכשלה — נסה שוב.',
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

function ContextBar({ title, stageLabel, onBack, canBack, onChangeRequest, showChangeRequest, menuOpen, setMenuOpen, onSaveAndExit, onRestart, onCancel }) {
  return (
    <div style={styles.contextBar}>
      <div style={styles.contextBarLeft}>
        {canBack ? (
          <button type="button" style={styles.backBtn} onClick={onBack} aria-label={ATELIER_HE.editRequest}>
            <BackIcon />
          </button>
        ) : null}
        <span style={styles.contextTitle}>{title}</span>
        <span style={styles.contextStage}>{stageLabel}</span>
        {showChangeRequest ? (
          <button type="button" style={styles.ghostBtn} onClick={onChangeRequest}>
            {ATELIER_HE.changeRequestShortcut}
          </button>
        ) : null}
      </div>
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          style={styles.menuBtn}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={ATELIER_HE.optionsMenu}
          aria-expanded={menuOpen ? 'true' : 'false'}
        >
          <DotsIcon />
        </button>
        {menuOpen ? (
          <div style={styles.menuSheet} role="menu">
            <button type="button" style={styles.menuItem} onClick={onSaveAndExit}>
              {ATELIER_HE.saveAndExit}
            </button>
            <button type="button" style={styles.menuItem} onClick={onRestart}>
              {ATELIER_HE.restart}
            </button>
            <button type="button" style={styles.menuItem} onClick={onCancel}>
              {ATELIER_HE.cancelCreation}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function AtelierCreateShell() {
  const router = useRouter();
  const tray = useWorkTray();
  const projectsStore = useDesignProjects();
  const assetsStore = useAssets();

  const [stage, setStage] = React.useState(ATELIER_STAGE.WELCOME);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [welcomeIntakeText, setWelcomeIntakeText] = React.useState('');
  const [selectedStoneItemId, setSelectedStoneItemId] = React.useState(null);
  const [requestText, setRequestText] = React.useState('');
  const [directions, setDirections] = React.useState([]);
  const [selectedDirectionId, setSelectedDirectionId] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState(null);
  const [savedId, setSavedId] = React.useState(null);
  const [savedName, setSavedName] = React.useState(null);
  const pickerBaselineIdsRef = React.useRef(new Set());
  const pickerPreviousSelectionRef = React.useRef(null);
  const didInitStoneRef = React.useRef(false);

  const trayItems = Array.isArray(tray.items) ? tray.items : [];

  // Convenience default: if the person already had a stone selected before
  // opening the flagship flow, treat it as "already selected" rather than
  // making them pick again — read-only convenience, never mutates the tray.
  React.useEffect(() => {
    if (didInitStoneRef.current || !tray.hydrated) return;
    didInitStoneRef.current = true;
    if (trayItems.length > 0) {
      setSelectedStoneItemId(trayItems[0].id);
    }
    // Initial convenience only. Picker changes are handled explicitly below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tray.hydrated]);

  if (!tray.hydrated || !projectsStore.hydrated) {
    return <div style={styles.loading}>{ATELIER_HE.loading}</div>;
  }

  const selectedStoneItem = trayItems.find((it) => it.id === selectedStoneItemId) || null;
  const centerItem = selectedStoneItem ? { ...selectedStoneItem, role: DESIGN_ROLE.CENTER_STONE } : null;
  const centerTrayItems = centerItem ? [centerItem] : [];

  const parsed = parseRequestHe(requestText);
  const understandingSentence = buildRequestUnderstandingHe({ ...parsed, trayItems: centerTrayItems });
  const expectedProductType = expectedProductTypeFor(parsed.product);

  const input = {
    product: parsed.product,
    style: parsed.style,
    trayItems: centerTrayItems,
    referenceText: '',
    requestText,
  };

  const selectedDirection = directions.find((d) => d.conceptId === selectedDirectionId) || null;
  const pack =
    directions.length > 0 ? buildCreateOutputPack(input, directions, selectedDirectionId) : null;

  const creationTitle =
    [productHe(parsed.product), parsed.styleMatches[0] ? styleHe(parsed.styleMatches[0]) : null]
      .filter(Boolean)
      .join(' · ') || ATELIER_HE.defaultTitle;

  const stageLabelHe = {
    [ATELIER_STAGE.STONE_REQUEST]: ATELIER_HE.stoneRequestStage,
    [ATELIER_STAGE.UNDERSTANDING]: ATELIER_HE.understandingStage,
    [ATELIER_STAGE.DIRECTIONS]: ATELIER_HE.directionsStage,
    [ATELIER_STAGE.REFINE]: ATELIER_HE.refineStage,
    [ATELIER_STAGE.PRESENTATION]: ATELIER_HE.presentationStage,
  }[stage] || '';

  // ------------------------------------------------------------------
  // Actions.
  // ------------------------------------------------------------------
  const resetAll = () => {
    setStage(ATELIER_STAGE.WELCOME);
    setMenuOpen(false);
    setPickerOpen(false);
    setWelcomeIntakeText('');
    setRequestText('');
    setSelectedStoneItemId(null);
    setDirections([]);
    setSelectedDirectionId(null);
    setSaving(false);
    setSaveError(null);
    setSavedId(null);
    setSavedName(null);
  };

  const handleBack = () => {
    const prev = previousAtelierStage(stage);
    if (prev) setStage(prev);
  };

  const handleWelcomeIntakeSubmit = () => {
    if (!welcomeIntakeText.trim()) return;
    setRequestText(welcomeIntakeText.trim());
    setStage(ATELIER_STAGE.STONE_REQUEST);
  };

  const openStonePicker = () => {
    pickerBaselineIdsRef.current = new Set(trayItems.map((item) => item.id));
    pickerPreviousSelectionRef.current = selectedStoneItemId;
    setPickerOpen(true);
  };

  const handlePickerClose = () => {
    setPickerOpen(false);
    const items = Array.isArray(tray.items) ? tray.items : [];
    const added = items
      .filter((item) => !pickerBaselineIdsRef.current.has(item.id))
      .sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));

    if (added.length > 0) {
      setSelectedStoneItemId(added[0].id);
      setDirections([]);
      setSelectedDirectionId(null);
      return;
    }

    const previousId = pickerPreviousSelectionRef.current;
    if (previousId && items.some((item) => item.id === previousId)) {
      setSelectedStoneItemId(previousId);
    } else if (!selectedStoneItemId && items.length > 0) {
      setSelectedStoneItemId(items[0].id);
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
    setStage(ATELIER_STAGE.DIRECTIONS);
  };

  const handleRefineChange = (text) => {
    setDirections((prev) =>
      prev.map((d) => (d.conceptId === selectedDirectionId ? { ...d, conceptNotes: text } : d))
    );
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
      setSaveError(ATELIER_HE.saveFailed);
    }
    setSaving(false);
  };

  const handleSaveAndExit = () => {
    setMenuOpen(false);
    const saved = performSave();
    if (saved) router.push('/studio/projects');
  };

  const handleRestart = () => {
    resetAll();
  };

  const handleCancel = () => {
    resetAll();
  };

  // ------------------------------------------------------------------
  // Bodies per stage.
  // ------------------------------------------------------------------
  let body = null;

  if (stage === ATELIER_STAGE.WELCOME) {
    body = (
      <div style={styles.stateCard}>
        <h1 style={styles.headline}>{ATELIER_HE.welcomeHeadline}</h1>
        <p style={styles.question}>{ATELIER_HE.welcomeQuestion}</p>
        <button
          type="button"
          style={styles.primaryPathBtn}
          onClick={() => setStage(ATELIER_STAGE.STONE_REQUEST)}
        >
          <span style={styles.primaryPathTitle}>{ATELIER_HE.primaryPathTitle}</span>
          <span style={styles.primaryPathSub}>{ATELIER_HE.primaryPathSub}</span>
        </button>
        <div style={styles.quietRow}>
          {ATELIER_HE.quietComingNext.map((label) => (
            <span key={label} style={styles.quietChip}>
              {label}
            </span>
          ))}
        </div>
        <div style={styles.intakeWrap}>
          <span style={styles.intakeLabel}>{ATELIER_HE.intakeLabel}</span>
          <textarea
            value={welcomeIntakeText}
            onChange={(e) => setWelcomeIntakeText(e.target.value)}
            placeholder={ATELIER_HE.intakePlaceholder}
            style={styles.textarea}
            rows={2}
            dir="rtl"
          />
          <div style={styles.nav}>
            <span />
            <button
              type="button"
              style={{
                ...styles.primaryBtn,
                ...(welcomeIntakeText.trim() ? null : styles.primaryBtnDisabled),
              }}
              disabled={!welcomeIntakeText.trim()}
              onClick={handleWelcomeIntakeSubmit}
            >
              {ATELIER_HE.intakeContinue}
            </button>
          </div>
        </div>
      </div>
    );
  } else if (stage === ATELIER_STAGE.STONE_REQUEST) {
    body = (
      <div style={styles.stateCard}>
        {selectedStoneItem ? (
          <div style={styles.stoneFocus}>
            <span style={styles.stoneImageWrap}>
              {selectedStoneItem.snapshot && selectedStoneItem.snapshot.primaryImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedStoneItem.snapshot.primaryImage}
                  alt=""
                  style={styles.stoneImage}
                />
              ) : selectedStoneItem.snapshot && selectedStoneItem.snapshot.primaryImageFileId ? (
                <AssetThumbnail
                  fileId={selectedStoneItem.snapshot.primaryImageFileId}
                  getFileUrl={assetsStore.getFileUrl}
                  alt={(selectedStoneItem.snapshot && selectedStoneItem.snapshot.name) || ''}
                  size="100%"
                  radius="0"
                  fit="cover"
                />
              ) : (
                <MediaPlaceholder height={160} />
              )}
            </span>
            <span style={styles.stoneName}>
              {(selectedStoneItem.snapshot && selectedStoneItem.snapshot.name) || '—'}
            </span>
            <button type="button" style={styles.ghostBtn} onClick={openStonePicker}>
              {ATELIER_HE.changeStone}
            </button>
          </div>
        ) : (
          <div style={styles.emptyStoneBox}>
            <span>{ATELIER_HE.noStoneYet}</span>
            <button type="button" style={styles.secondaryBtn} onClick={openStonePicker}>
              {ATELIER_HE.chooseStone}
            </button>
          </div>
        )}

        <span style={styles.intakeLabel}>{ATELIER_HE.requestLabel}</span>
        <textarea
          value={requestText}
          onChange={(e) => setRequestText(e.target.value)}
          placeholder={ATELIER_HE.requestPlaceholder}
          style={styles.textarea}
          rows={3}
          dir="rtl"
        />

        <div style={styles.nav}>
          {!selectedStoneItem ? (
            <span style={{ ...styles.question, textAlign: 'right' }}>{ATELIER_HE.needStoneHint}</span>
          ) : !requestText.trim() ? (
            <span style={{ ...styles.question, textAlign: 'right' }}>{ATELIER_HE.needRequestHint}</span>
          ) : (
            <span />
          )}
          <button
            type="button"
            style={{
              ...styles.primaryBtn,
              ...(selectedStoneItem && requestText.trim() ? null : styles.primaryBtnDisabled),
            }}
            disabled={!selectedStoneItem || !requestText.trim()}
            onClick={() => setStage(ATELIER_STAGE.UNDERSTANDING)}
          >
            {ATELIER_HE.continueBtn}
          </button>
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
  } else if (stage === ATELIER_STAGE.UNDERSTANDING) {
    body = (
      <div style={styles.stateCard}>
        <div style={styles.understandingCard}>
          <span style={styles.understandingEyebrow}>{ATELIER_HE.understandingEyebrow}</span>
          <p style={styles.understandingText}>
            {understandingSentence || ATELIER_HE.understandingUnclear}
          </p>
        </div>
        <div style={styles.nav}>
          <button type="button" style={styles.secondaryBtn} onClick={() => setStage(ATELIER_STAGE.STONE_REQUEST)}>
            {ATELIER_HE.editRequest}
          </button>
          <button
            type="button"
            style={{
              ...styles.primaryBtn,
              ...(understandingSentence ? null : styles.primaryBtnDisabled),
            }}
            disabled={!understandingSentence}
            onClick={handleConfirmUnderstanding}
          >
            {ATELIER_HE.confirmUnderstanding}
          </button>
        </div>
      </div>
    );
  } else if (stage === ATELIER_STAGE.DIRECTIONS) {
    const stoneNameHe = centerStoneNameHe(centerTrayItems);
    body = (
      <div style={styles.stateCard}>
        <div style={styles.directionList}>
          {directions.map((d) => {
            const on = d.conceptId === selectedDirectionId;
            return (
              <button
                key={d.conceptId}
                type="button"
                onClick={() => setSelectedDirectionId(on ? null : d.conceptId)}
                style={{ ...styles.directionCard, ...(on ? styles.directionCardOn : null) }}
                aria-pressed={on ? 'true' : 'false'}
              >
                <span style={styles.directionVisual}>
                  <MediaPlaceholder height={120} />
                </span>
                <span style={styles.directionName}>{d.conceptName}</span>
                <span style={styles.directionDesc}>{d.shortDescription}</span>
                {stoneNameHe ? (
                  <span style={styles.directionMeta}>
                    <b>{ATELIER_HE.stoneRoleLabel}:</b> {stoneNameHe}
                  </span>
                ) : null}
                <span style={styles.directionMeta}>
                  <b>{ATELIER_HE.productionLabel}:</b> {d.productionNotes}
                </span>
              </button>
            );
          })}
        </div>
        <div style={styles.nav}>
          <div style={styles.navActions}>
            <button type="button" style={styles.ghostBtn} onClick={() => setStage(ATELIER_STAGE.UNDERSTANDING)}>
              {ATELIER_HE.backToEdit}
            </button>
            <button type="button" style={styles.ghostBtn} onClick={runGeneration}>
              {ATELIER_HE.anotherDirection}
            </button>
          </div>
          <button
            type="button"
            style={{
              ...styles.primaryBtn,
              ...(selectedDirectionId ? null : styles.primaryBtnDisabled),
            }}
            disabled={!selectedDirectionId}
            onClick={() => setStage(ATELIER_STAGE.REFINE)}
          >
            {ATELIER_HE.chooseDirection}
          </button>
        </div>
      </div>
    );
  } else if (stage === ATELIER_STAGE.REFINE) {
    body = (
      <div style={styles.stateCard}>
        {selectedDirection ? (
          <>
            <span style={styles.directionVisual}>
              <MediaPlaceholder height={160} />
            </span>
            <span style={styles.directionName}>{selectedDirection.conceptName}</span>
            <span style={styles.directionDesc}>{selectedDirection.shortDescription}</span>
          </>
        ) : null}
        <span style={styles.intakeLabel}>{ATELIER_HE.refineLabel}</span>
        <textarea
          value={(selectedDirection && selectedDirection.conceptNotes) || ''}
          onChange={(e) => handleRefineChange(e.target.value)}
          placeholder={ATELIER_HE.refinePlaceholder}
          style={styles.textarea}
          rows={2}
          dir="rtl"
        />
        {selectedDirection && selectedDirection.conceptNotes ? (
          <span style={styles.savedNote}>{ATELIER_HE.refineSavedNote}</span>
        ) : null}
        <div style={styles.nav}>
          <button type="button" style={styles.ghostBtn} onClick={() => setStage(ATELIER_STAGE.DIRECTIONS)}>
            {ATELIER_HE.chooseAnotherDirection}
          </button>
          <button type="button" style={styles.primaryBtn} onClick={() => setStage(ATELIER_STAGE.PRESENTATION)}>
            {ATELIER_HE.prepareBtn}
          </button>
        </div>
      </div>
    );
  } else if (stage === ATELIER_STAGE.PRESENTATION) {
    if (savedId) {
      body = (
        <div style={styles.stateCard}>
          <div style={styles.successCard}>
            <span style={styles.successTitle}>{ATELIER_HE.savedTitle}</span>
            <span>{savedName}</span>
            <div style={styles.successActions}>
              <button type="button" style={styles.primaryBtn} onClick={() => router.push('/studio/projects')}>
                {ATELIER_HE.openProjects}
              </button>
              <button type="button" style={styles.secondaryBtn} onClick={resetAll}>
                {ATELIER_HE.createAnother}
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      const rows = [
        [ATELIER_HE.presTypeLabel, productHe(parsed.product) || '—'],
        [
          ATELIER_HE.presStoneLabel,
          (selectedStoneItem && selectedStoneItem.snapshot && selectedStoneItem.snapshot.name) || '—',
        ],
        [ATELIER_HE.presDirectionLabel, (selectedDirection && selectedDirection.conceptName) || '—'],
        [
          ATELIER_HE.presRefineLabel,
          (selectedDirection && selectedDirection.conceptNotes) || ATELIER_HE.presNoRefine,
        ],
      ];
      body = (
        <div style={styles.stateCard}>
          <MediaPlaceholder height={200} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {rows.map(([k, v]) => (
              <div key={k} style={styles.presentationRow}>
                <span style={styles.presentationKey}>{k}</span>
                <span style={styles.presentationVal}>{v}</span>
              </div>
            ))}
          </div>
          {pack ? <p style={styles.directionDesc}>{pack.clientHe}</p> : null}
          {saveError ? <p style={{ color: 'crimson' }}>{saveError}</p> : null}
          <div style={styles.nav}>
            <div style={styles.navActions}>
              <button type="button" style={styles.ghostBtn} onClick={() => setStage(ATELIER_STAGE.REFINE)}>
                {ATELIER_HE.backToRefine}
              </button>
              <button type="button" style={styles.ghostBtn} onClick={() => setStage(ATELIER_STAGE.DIRECTIONS)}>
                {ATELIER_HE.chooseAnotherDirection}
              </button>
            </div>
            <button type="button" style={styles.primaryBtn} disabled={saving} onClick={handleSave}>
              {saving ? ATELIER_HE.saving : ATELIER_HE.saveBtn}
            </button>
          </div>
        </div>
      );
    }
  }

  return (
    <div style={styles.page} dir="rtl">
      {stage !== ATELIER_STAGE.WELCOME ? (
        <ContextBar
          title={creationTitle}
          stageLabel={stageLabelHe}
          onBack={handleBack}
          canBack
          onChangeRequest={() => setStage(ATELIER_STAGE.STONE_REQUEST)}
          showChangeRequest={
            stage === ATELIER_STAGE.UNDERSTANDING ||
            stage === ATELIER_STAGE.DIRECTIONS ||
            stage === ATELIER_STAGE.REFINE ||
            stage === ATELIER_STAGE.PRESENTATION
          }
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          onSaveAndExit={handleSaveAndExit}
          onRestart={handleRestart}
          onCancel={handleCancel}
        />
      ) : null}
      {body}
    </div>
  );
}
