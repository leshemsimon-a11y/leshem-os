// components/studio/create/CreateFlowShell.js
//
// LESHEM.S OS — Clean 8H: Guided Create Path + Instant Feedback.
//
// /studio/create is the MAIN guided creation path — eight visible steps, one
// primary action per step, instant feedback after every input:
//   1. הגדרת תיק העבודה (name · type · style · free request + live summary)
//   2. אבנים ופריטי עבודה (real Work Tray; continue-without allowed)
//   3. רפרנסים ונכסים (paste text/URL/image, drag, upload — CreateIntakeArea)
//   4. סיכום מוכן ליצירה («מה המערכת תשתמש בו» + gentle missing-warnings)
//   5. יצירת כיוונים (3 local structured directions — existing generator)
//   6. בחירת כיוון («נבחר כיוון: …» → הפעולה המומלצת: שמירה)
//   7. שמירת תיק עבודה (existing public designProjects API + intake persist)
//   8. הצלחה ופלט (next actions + output preview)
//
// PERSISTENCE (save time only; session until then — nothing silently lost):
//   • Work File — projectsStore.save (existing public API) + setActiveWorkId.
//   • Text/URL references — the brief's EXISTING `intention` free-text field.
//   • File/image intake — EXISTING PUBLIC assetsStore.createObjectWithFiles
//     (the Quick Create path) + linkObjectToProject, then attached to the
//     project as Clean 8C records via the EXISTING public updateProject.
// No new persistence keys, no store internals, no packages, no APIs.

import * as React from 'react';
import { useRouter } from 'next/router';
import { tokens } from '../shared/tokens';
import { CONCEPT_HE } from '../../../lib/studio/labels';
import { createUseWorkTray } from '../../../lib/studio/workTray';
import { createUseDesignProjects } from '../../../lib/studio/designProjects';
import { updateProject } from '../../../lib/studio/designProjects';
import { setActiveWorkId } from '../../../lib/studio/activeWorkStore';
import { buildDesignSnapshot, normalizeRole } from '../../../lib/studio/designDraft';
import {
  createObjectWithFiles,
  linkObjectToProject,
} from '../../../lib/studio/assetsStore';
import {
  buildAttachedAssetRecord,
  upsertAttachedAsset,
} from '../../../lib/studio/attachedAssets';
import {
  CREATE_PRODUCT_OPTIONS,
  CREATE_STYLE_OPTIONS,
  generateCreateDirections,
  buildCreateBrief,
  buildCreateOutputPack,
  productHe,
  styleHe,
} from '../../../lib/studio/createFlow';
import {
  intakeToReferenceText,
  intakeSummaryHe,
  intakeCounts,
  intakeObjectInput,
  intakeFileRow,
  isFileKindIntake,
} from '../../../lib/studio/createIntake';
import CreateIntakeArea from './CreateIntakeArea';

const useWorkTray = createUseWorkTray(React);
const useDesignProjects = createUseDesignProjects(React);

export const CREATE_HE = Object.freeze({
  title: 'יצירת תכשיט',
  stepOf: (i, n) => `שלב ${i} מתוך ${n}`,
  back: 'חזרה',
  next: 'המשך',
  // Step 1 — define the Work File.
  step1: 'הגדרת תיק העבודה',
  nameLabel: 'שם תיק העבודה',
  namePlaceholder: 'לדוגמה: טבעת קלאסטר אמרלד ללקוחה',
  nameHelper: 'אפשר להשאיר ריק — ניצור שם חכם לפי הבחירות.',
  typeLabel: 'סוג התכשיט',
  styleLabel: 'סגנון',
  requestLabel: 'מה חשוב לך בעיצוב? (בקשה חופשית)',
  requestPlaceholder:
    'לדוגמה: טבעת קלאסטר מודרנית עם האבן המרכזית, שיבוץ נמוך, מראה יוקרתי ועדין.',
  liveSummary: (typeHe, sHe) =>
    sHe ? `אנחנו יוצרים: ${typeHe} בסגנון ${sHe}` : `אנחנו יוצרים: ${typeHe}`,
  step1Hint: 'בחר סוג וסגנון כדי להמשיך.',
  savedAsPrefix: 'נשמר בשם',
  // Step 2 — stones.
  step2: 'אבנים ופריטי עבודה',
  stonesCount: (n) => (n === 1 ? 'נבחרה אבן אחת לעבודה' : `נבחרו ${n} אבנים לעבודה`),
  stonesEmpty: 'אפשר להמשיך בלי אבנים, או לחזור למלאי כדי לבחור אבנים.',
  continueNoStones: 'המשך בלי אבנים',
  openInventory: 'פתח מלאי',
  // Step 3 — references / assets.
  step3: 'רפרנסים ונכסים',
  // Step 4 — ready-to-generate preview.
  step4: 'סיכום מוכן ליצירה',
  previewTitle: 'מה המערכת תשתמש בו:',
  previewName: 'שם התיק',
  previewType: 'סוג תכשיט',
  previewStyle: 'סגנון',
  previewStones: 'אבנים',
  previewRefs: 'רפרנסים ונכסים',
  previewRequest: 'בקשה חופשית',
  notChosen: 'טרם נבחר',
  autoName: 'ייווצר שם אוטומטי',
  noRequest: 'ללא בקשה חופשית',
  warnNoStones: 'לא נבחרו אבנים — הכיוונים יהיו רעיוניים בלבד.',
  warnNoRefs: 'ללא רפרנסים ונכסים — אפשר להוסיף בשלב הקודם.',
  continueToGenerate: 'המשך ליצירת כיוונים',
  // Step 5 — generate.
  step5: 'יצירת כיווני עיצוב',
  generate: 'צור כיווני עיצוב',
  regenerate: 'צור כיוונים מחדש',
  generateHint: 'ניצור שלושה כיוונים מקומיים לפי כל מה שסיכמנו.',
  generatedBanner: 'נוצרו 3 כיווני עיצוב. בחר כיוון כדי להמשיך.',
  // Step 6 — select.
  step6: 'בחירת כיוון',
  selectedPrefix: 'נבחר כיוון: ',
  selectHint: 'בחר כיוון כדי להמשיך.',
  nextRecommended: 'הפעולה המומלצת הבאה: שמור כתיק עבודה',
  continueToSave: 'המשך לשמירה',
  refInfluencePrefix: 'השפעת רפרנסים ומודלים: הכיוון מתחשב ב־',
  moreOptions: 'אפשרויות נוספות',
  stoneLayoutLabel: 'שיבוץ',
  structureLabel: 'מבנה',
  productionLabel: 'ייצור',
  promptHintLabel: 'Prompt hint (EN)',
  // Step 7 — save.
  step7: 'שמירת תיק עבודה',
  saveRecapTitle: 'מה יישמר בתיק:',
  saveRecapAssets: (n) =>
    n === 1
      ? 'קובץ אחד יישמר בספריית הנכסים ויצורף לתיק'
      : `${n} קבצים יישמרו בספריית הנכסים ויצורפו לתיק`,
  saveRecapTextRefs: 'רפרנסים טקסטואליים וקישורים יישמרו בתוך התיק',
  save: 'שמור כתיק עבודה',
  saving: 'שומר…',
  saveFailed: 'השמירה נכשלה — נסה שוב.',
  // Step 8 — success + output preview.
  step8: 'הצלחה ופלט',
  saveSuccess: 'התיק נוצר ונשמר בהצלחה.',
  assetsSaved: (n) =>
    n === 1
      ? 'קובץ אחד נשמר בספריית הנכסים וצורף לתיק ✓'
      : `${n} קבצים נשמרו בספריית הנכסים וצורפו לתיק ✓`,
  assetsFailed: (names) => `חלק מהקבצים לא נשמרו לספרייה (${names}) — הם נשמרו כטקסט בתוך התיק.`,
  openProjects: 'פתח תיק עבודה',
  openStudio: 'פתח בסטודיו',
  openMedia: 'הכן מדיה והדמיות',
  createAnother: 'צור עוד תכשיט',
  outputPreviewTitle: 'תצוגת פלט מקדימה',
  packClient: 'תיאור ללקוח',
  packPrompt: 'Realistic render prompt (EN)',
  openFullPack: 'פתח חבילת פלט מלאה',
  loading: 'טוען…',
});

const TOTAL_STEPS = 8;

export default function CreateFlowShell() {
  const router = useRouter();
  const tray = useWorkTray();
  const projectsStore = useDesignProjects();

  const [step, setStep] = React.useState(1);
  const [workFileName, setWorkFileName] = React.useState('');
  const [product, setProduct] = React.useState(null);
  const [style, setStyle] = React.useState(null);
  const [requestText, setRequestText] = React.useState('');
  const [intakeItems, setIntakeItems] = React.useState([]);
  const [directions, setDirections] = React.useState([]);
  const [selectedDirectionId, setSelectedDirectionId] = React.useState(null);
  const [generatedBanner, setGeneratedBanner] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState(null);
  const [savedId, setSavedId] = React.useState(null);
  const [savedName, setSavedName] = React.useState(null);
  const [persistedCount, setPersistedCount] = React.useState(0);
  const [failedNames, setFailedNames] = React.useState([]);

  if (!tray.hydrated) {
    return <div style={styles.loading}>{CREATE_HE.loading}</div>;
  }

  const trayItems = Array.isArray(tray.items) ? tray.items : [];
  const referenceText = intakeToReferenceText(intakeItems, '');
  const input = { product, style, trayItems, referenceText, requestText };
  const pack =
    directions.length > 0 ? buildCreateOutputPack(input, directions, selectedDirectionId) : null;
  const selectedDirection =
    directions.find((d) => d.conceptId === selectedDirectionId) || null;
  const counts = intakeCounts(intakeItems);

  // ------------------------------------------------------------------
  // Actions.
  // ------------------------------------------------------------------
  const addIntakeItems = (newItems) =>
    setIntakeItems((prev) => prev.concat(newItems.filter(Boolean)));
  const removeIntakeItem = (id) =>
    setIntakeItems((prev) => prev.filter((it) => it.intakeId !== id));

  const handleGenerate = () => {
    const next = generateCreateDirections(input);
    setDirections(next);
    setSelectedDirectionId(null);
    setGeneratedBanner(true);
    setStep(6);
  };

  const resolveWorkFileName = () => {
    if (workFileName && workFileName.trim()) return workFileName.trim();
    const pHe = productHe(product);
    const sHe = styleHe(style);
    if (pHe || sHe) return ['תיק עיצוב', pHe, sHe].filter(Boolean).join(' · ');
    return `תיק עיצוב · ${new Date().toLocaleDateString('he-IL')} ${new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Save — the ONLY persistence moment. Project first (sync, public API),
  // then intake files through the EXISTING public asset APIs; per-item
  // failures never lose data (every file item is also echoed as text in the
  // brief's intention field via referenceText).
  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const brief = buildCreateBrief(input, directions, selectedDirectionId);
      const name = resolveWorkFileName();
      const saved = projectsStore.save({
        name,
        trayItems,
        brief,
        snapshot: buildDesignSnapshot(trayItems, brief),
      });
      if (!saved || !saved.id) {
        setSaveError(CREATE_HE.saveFailed);
        return;
      }
      setActiveWorkId(saved.id);

      let records = [];
      let okCount = 0;
      const failed = [];
      const fileItems = intakeItems.filter(isFileKindIntake);
      for (const it of fileItems) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const res = await createObjectWithFiles(
            intakeObjectInput(it, saved.name || name),
            [intakeFileRow(it)],
            0
          );
          if (res && res.object) {
            // eslint-disable-next-line no-await-in-loop
            await linkObjectToProject(res.object.objectId, saved.id);
            const record = buildAttachedAssetRecord({
              object: res.object,
              files: res.files || [],
              role: it.suggestedRole,
              previewFileId: (res.object && res.object.primaryFileId) || null,
            });
            if (record) records = upsertAttachedAsset(records, record);
            okCount += 1;
          } else {
            failed.push(it.name);
          }
        } catch (e) {
          failed.push(it.name);
        }
      }
      if (records.length) updateProject(saved.id, { assets: records });

      setPersistedCount(okCount);
      setFailedNames(failed);
      setSavedId(saved.id);
      setSavedName(saved.name || name);
      setStep(8);
    } catch (e) {
      setSaveError(CREATE_HE.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const resetFlow = () => {
    setStep(1);
    setWorkFileName('');
    setProduct(null);
    setStyle(null);
    setRequestText('');
    setIntakeItems([]);
    setDirections([]);
    setSelectedDirectionId(null);
    setGeneratedBanner(false);
    setSaving(false);
    setSaveError(null);
    setSavedId(null);
    setSavedName(null);
    setPersistedCount(0);
    setFailedNames([]);
  };

  // ------------------------------------------------------------------
  // Step bodies + one primary action per step.
  // ------------------------------------------------------------------
  let stepTitle = '';
  let body = null;
  let primary = null; // { label, onClick, disabled }
  let secondary = null; // optional small secondary in the nav row

  if (step === 1) {
    stepTitle = CREATE_HE.step1;
    const pHe = productHe(product);
    const sHe = styleHe(style);
    body = (
      <>
        <div style={styles.nameGroup}>
          <label style={styles.nameLabel} htmlFor="cf-work-file-name">
            {CREATE_HE.nameLabel}
          </label>
          <input
            id="cf-work-file-name"
            type="text"
            value={workFileName}
            onChange={(e) => setWorkFileName(e.target.value)}
            placeholder={CREATE_HE.namePlaceholder}
            style={styles.nameInput}
            dir="rtl"
          />
          <span style={styles.helper}>{CREATE_HE.nameHelper}</span>
        </div>
        <span style={styles.fieldLabel}>{CREATE_HE.typeLabel}</span>
        <div style={styles.chips}>
          {CREATE_PRODUCT_OPTIONS.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => setProduct(product === o.key ? null : o.key)}
              style={{ ...styles.chip, ...(product === o.key ? styles.chipOn : null) }}
              aria-pressed={product === o.key ? 'true' : 'false'}
            >
              {o.he}
            </button>
          ))}
        </div>
        <span style={styles.fieldLabel}>{CREATE_HE.styleLabel}</span>
        <div style={styles.chips}>
          {CREATE_STYLE_OPTIONS.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => setStyle(style === o.key ? null : o.key)}
              style={{ ...styles.chip, ...(style === o.key ? styles.chipOn : null) }}
              aria-pressed={style === o.key ? 'true' : 'false'}
            >
              {o.he}
            </button>
          ))}
        </div>
        <span style={styles.fieldLabel}>{CREATE_HE.requestLabel}</span>
        <textarea
          value={requestText}
          onChange={(e) => setRequestText(e.target.value)}
          placeholder={CREATE_HE.requestPlaceholder}
          style={styles.textarea}
          rows={3}
          dir="rtl"
        />
        {/* Live summary — instant feedback for the choices. */}
        {pHe ? (
          <div style={styles.liveSummary}>{CREATE_HE.liveSummary(pHe, sHe)}</div>
        ) : (
          <span style={styles.helper}>{CREATE_HE.step1Hint}</span>
        )}
      </>
    );
    primary = {
      label: CREATE_HE.next,
      onClick: () => setStep(2),
      disabled: !(product && style),
    };
  } else if (step === 2) {
    stepTitle = CREATE_HE.step2;
    body =
      trayItems.length === 0 ? (
        <div style={styles.emptyBox}>
          <p style={styles.emptyText}>{CREATE_HE.stonesEmpty}</p>
        </div>
      ) : (
        <>
          <div style={styles.banner}>{CREATE_HE.stonesCount(trayItems.length)}</div>
          <div style={styles.stoneList}>
            {trayItems.map((item) => {
              const s = item.snapshot || {};
              const roleHe =
                CONCEPT_HE.roleLabels[normalizeRole(item.role)] ||
                CONCEPT_HE.roleLabels.unassigned;
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
                      {[roleHe, s.shapeHe, s.caratWeight ? `${s.caratWeight} קראט` : null]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </>
      );
    primary = {
      label: trayItems.length === 0 ? CREATE_HE.continueNoStones : CREATE_HE.next,
      onClick: () => setStep(3),
      disabled: false,
    };
    secondary = {
      label: CREATE_HE.openInventory,
      onClick: () => router.push('/studio/inventory'),
    };
  } else if (step === 3) {
    stepTitle = CREATE_HE.step3;
    body = (
      <CreateIntakeArea
        items={intakeItems}
        onAddItems={addIntakeItems}
        onRemoveItem={removeIntakeItem}
      />
    );
    primary = { label: CREATE_HE.next, onClick: () => setStep(4), disabled: false };
  } else if (step === 4) {
    stepTitle = CREATE_HE.step4;
    const rows = [
      [CREATE_HE.previewName, workFileName.trim() || CREATE_HE.autoName],
      [CREATE_HE.previewType, productHe(product) || CREATE_HE.notChosen],
      [CREATE_HE.previewStyle, styleHe(style) || CREATE_HE.notChosen],
      [CREATE_HE.previewStones, String(trayItems.length)],
      [CREATE_HE.previewRefs, intakeSummaryHe(intakeItems)],
      [CREATE_HE.previewRequest, requestText.trim() ? requestText.trim() : CREATE_HE.noRequest],
    ];
    body = (
      <>
        <span style={styles.previewTitle}>{CREATE_HE.previewTitle}</span>
        <div style={styles.previewRows}>
          {rows.map(([k, v]) => (
            <div key={k} style={styles.previewRow}>
              <span style={styles.previewKey}>{k}</span>
              <span style={styles.previewVal}>{v}</span>
            </div>
          ))}
        </div>
        {trayItems.length === 0 ? <div style={styles.warn}>{CREATE_HE.warnNoStones}</div> : null}
        {counts.total === 0 ? <div style={styles.warn}>{CREATE_HE.warnNoRefs}</div> : null}
      </>
    );
    primary = { label: CREATE_HE.continueToGenerate, onClick: () => setStep(5), disabled: false };
  } else if (step === 5) {
    stepTitle = CREATE_HE.step5;
    body = <p style={styles.emptyText}>{CREATE_HE.generateHint}</p>;
    primary = {
      label: directions.length ? CREATE_HE.regenerate : CREATE_HE.generate,
      onClick: handleGenerate,
      disabled: false,
    };
  } else if (step === 6) {
    stepTitle = CREATE_HE.step6;
    body = (
      <>
        {generatedBanner ? <div style={styles.banner}>{CREATE_HE.generatedBanner}</div> : null}
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
                <span style={styles.directionName}>{d.conceptName}</span>
                <span style={styles.directionDesc}>{d.shortDescription}</span>
                <span style={styles.directionRow}>
                  <b>{CREATE_HE.stoneLayoutLabel}:</b> {d.stoneLayout}
                </span>
                <span style={styles.directionRow}>
                  <b>{CREATE_HE.structureLabel}:</b> {d.designStructure}
                </span>
                {counts.total > 0 ? (
                  <span style={styles.directionRow}>
                    {CREATE_HE.refInfluencePrefix}
                    {intakeSummaryHe(intakeItems)}.
                  </span>
                ) : null}
                <span style={styles.directionRow}>
                  <b>{CREATE_HE.productionLabel}:</b> {d.productionNotes}
                </span>
                <span style={{ ...styles.directionRow, ...styles.directionEn }} dir="ltr">
                  <b>{CREATE_HE.promptHintLabel}:</b> {d.renderBriefText}
                </span>
              </button>
            );
          })}
        </div>
        {selectedDirection ? (
          <>
            <div style={styles.banner}>
              {CREATE_HE.selectedPrefix}
              {selectedDirection.conceptName}
            </div>
            <span style={styles.helper}>{CREATE_HE.nextRecommended}</span>
          </>
        ) : (
          <span style={styles.helper}>{CREATE_HE.selectHint}</span>
        )}
      </>
    );
    primary = {
      label: CREATE_HE.continueToSave,
      onClick: () => setStep(7),
      disabled: !selectedDirection,
    };
    secondary = { label: CREATE_HE.regenerate, onClick: handleGenerate };
  } else if (step === 7) {
    stepTitle = CREATE_HE.step7;
    body = (
      <>
        <span style={styles.previewTitle}>{CREATE_HE.saveRecapTitle}</span>
        <div style={styles.previewRows}>
          <div style={styles.previewRow}>
            <span style={styles.previewKey}>{CREATE_HE.previewName}</span>
            <span style={styles.previewVal}>{resolveWorkFileName()}</span>
          </div>
          {selectedDirection ? (
            <div style={styles.previewRow}>
              <span style={styles.previewKey}>{CREATE_HE.step6}</span>
              <span style={styles.previewVal}>{selectedDirection.conceptName}</span>
            </div>
          ) : null}
          <div style={styles.previewRow}>
            <span style={styles.previewKey}>{CREATE_HE.previewStones}</span>
            <span style={styles.previewVal}>{String(trayItems.length)}</span>
          </div>
          <div style={styles.previewRow}>
            <span style={styles.previewKey}>{CREATE_HE.previewRefs}</span>
            <span style={styles.previewVal}>{intakeSummaryHe(intakeItems)}</span>
          </div>
        </div>
        {counts.files > 0 ? <div style={styles.banner}>{CREATE_HE.saveRecapAssets(counts.files)}</div> : null}
        {counts.texts + counts.urls > 0 ? (
          <span style={styles.helper}>{CREATE_HE.saveRecapTextRefs}</span>
        ) : null}
        {saveError ? <div style={styles.warn}>{saveError}</div> : null}
      </>
    );
    primary = {
      label: saving ? CREATE_HE.saving : CREATE_HE.save,
      onClick: handleSave,
      disabled: saving,
    };
  } else {
    // Step 8 — success + output preview (reached only through a real save).
    stepTitle = CREATE_HE.step8;
    body = (
      <>
        <div style={styles.successCard}>
          <span style={styles.successTitle}>{CREATE_HE.saveSuccess}</span>
          {savedName ? (
            <span style={styles.successName}>
              {CREATE_HE.savedAsPrefix}: {savedName}
            </span>
          ) : null}
          {persistedCount > 0 ? (
            <span style={styles.successAssets}>{CREATE_HE.assetsSaved(persistedCount)}</span>
          ) : null}
          {failedNames.length > 0 ? (
            <div style={styles.warn}>{CREATE_HE.assetsFailed(failedNames.join(', '))}</div>
          ) : null}
          <div style={styles.successActions}>
            <button
              type="button"
              style={styles.primaryBtn}
              onClick={() => router.push('/studio/projects')}
            >
              {CREATE_HE.openProjects}
            </button>
            <button
              type="button"
              style={styles.secondaryBtn}
              onClick={() => router.push('/studio/design')}
            >
              {CREATE_HE.openStudio}
            </button>
            <button
              type="button"
              style={styles.secondaryBtn}
              onClick={() =>
                router.push({ pathname: '/studio/projects', query: { focus: 'media' } })
              }
            >
              {CREATE_HE.openMedia}
            </button>
            <button type="button" style={styles.ghostBtn} onClick={resetFlow}>
              {CREATE_HE.createAnother}
            </button>
          </div>
        </div>
        {pack ? (
          <div style={styles.outputPreview}>
            <span style={styles.previewTitle}>{CREATE_HE.outputPreviewTitle}</span>
            <span style={styles.packTitle}>{CREATE_HE.packClient}</span>
            <p style={styles.packClient}>{pack.clientHe}</p>
            <span style={styles.packTitle}>{CREATE_HE.packPrompt}</span>
            <pre style={styles.packBlockEn} dir="ltr">
              {pack.mediaPromptEn}
            </pre>
            <button
              type="button"
              style={styles.secondaryBtn}
              onClick={() => router.push('/studio/projects')}
            >
              {CREATE_HE.openFullPack}
            </button>
          </div>
        ) : null}
      </>
    );
    primary = null;
  }

  return (
    <div style={styles.page} dir="rtl">
      <div style={styles.header}>
        <span style={styles.title}>{CREATE_HE.title}</span>
        <span style={styles.progress}>{CREATE_HE.stepOf(step, TOTAL_STEPS)}</span>
      </div>
      <div style={styles.dots} aria-hidden="true">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <span key={i} style={{ ...styles.dot, ...(i + 1 <= step ? styles.dotOn : null) }} />
        ))}
      </div>

      <div style={styles.card}>
        <span style={styles.stepTitle}>{stepTitle}</span>
        {body}
      </div>

      {step < 8 ? (
        <div style={styles.nav}>
          {step > 1 ? (
            <button type="button" style={styles.ghostBtn} onClick={() => setStep(step - 1)}>
              {CREATE_HE.back}
            </button>
          ) : (
            <span />
          )}
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
  chips: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  nameGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  nameLabel: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 800,
    color: tokens.color.gold,
  },
  nameInput: {
    width: '100%',
    boxSizing: 'border-box',
    minHeight: '42px',
    padding: '9px 13px',
    borderRadius: tokens.radius.sm,
    border: `1px solid ${tokens.color.goldFaint}`,
    background: tokens.color.pearl,
    color: tokens.color.charcoal,
    fontFamily: tokens.font.body,
    fontSize: '13.5px',
    fontWeight: 600,
    outline: 'none',
  },
  chip: {
    minHeight: '40px',
    padding: '8px 16px',
    borderRadius: '999px',
    border: `1px solid ${tokens.color.goldFaint}`,
    background: tokens.color.pearl,
    color: tokens.color.charcoal,
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  chipOn: {
    border: `1px solid ${tokens.color.gold}`,
    background: '#FFFFFF',
    boxShadow: `0 0 0 1px ${tokens.color.gold}`,
    color: tokens.color.charcoal,
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
  directionName: {
    fontFamily: tokens.font.display,
    fontSize: '14.5px',
    fontWeight: 700,
    color: tokens.color.charcoal,
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
  directionEn: { fontFamily: tokens.font.body, textAlign: 'left' },
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
  secondaryBtn: {
    minHeight: '44px',
    padding: '10px 18px',
    borderRadius: '999px',
    border: `1px solid ${tokens.color.charcoal}`,
    background: 'transparent',
    color: tokens.color.charcoal,
    fontFamily: tokens.font.body,
    fontSize: '13px',
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
  successAssets: {
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  successActions: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' },
  outputPreview: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '14px',
    borderRadius: tokens.radius.md,
    border: `1px solid ${tokens.color.goldFaint}`,
    background: '#FFFFFF',
  },
  packTitle: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 800,
    color: tokens.color.gold,
  },
  packClient: {
    margin: 0,
    fontFamily: tokens.font.body,
    fontSize: '13px',
    color: tokens.color.ink,
    lineHeight: 1.6,
  },
  packBlockEn: {
    margin: 0,
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    color: tokens.color.inkSoft,
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.goldFaint}`,
    borderRadius: tokens.radius.sm,
    padding: '10px 12px',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    textAlign: 'left',
    maxHeight: '180px',
    overflow: 'auto',
  },
};
