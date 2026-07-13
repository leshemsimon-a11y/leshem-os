// components/studio/projects/RenderStudioPanel.js
//
// LESHEM.S OS — Clean 8J: Render Studio Scene Library.
//
// The «סטודיו הדמיות» overlay: opened as a secondary entry point from the
// Media Workflow panel, alongside (not instead of) the existing Clean 8I
// «הכן הדמיה» → RenderPromptPanel flow. Lets the user pick a render PACK,
// a SCENE within that pack, and a QUALITY level; the system auto-builds a
// full batch plan the moment the panel opens (zero configuration required)
// — final prompt, negative prompt, recommended settings, per-scene cost,
// and per-pack cost. Changing any selector instantly rebuilds the plan.
//
// Sections: פרטי החבילה (pack/scene/quality/count selectors + aspect ratio
// display) · תוכנית ההדמיה (included scenes + planned image count) ·
// פרומפט סופי להדמיה · Negative Prompt · עלות משוערת (per-scene + per-pack).
// Actions: «הכן הדמיה» (re-confirm/rebuild) · «העתק פרומפט» ·
// «העתק Negative Prompt» · «שמור תוכנית הדמיה» · «פתח מדיה והדמיות».
//
// PRESENTATIONAL + pure builders only: buildRenderBatchPlan (from
// lib/studio/renderSceneLibrary.js) is a pure helper that internally reuses
// the EXISTING Clean 8I lib/studio/renderPromptFinalizer.js
// buildRenderPackage / buildNegativePromptEn — this panel does not
// reimplement any prompt logic. Persistence goes ONLY through the EXISTING
// public updateProject (the same pattern MediaWorkflowPanel already uses for
// the Clean 8I render package). NO API, NO render engine, NO store
// internals, NO new persistence key, NO package.

import * as React from 'react';
import { tokens } from '../shared/tokens';
import {
  listPacks,
  listQualityLevels,
  scenesForPack,
  resolveSceneIdForPack,
  getPack,
  getScene,
  buildRenderBatchPlan,
  buildRenderBatchPlanPatch,
  DEFAULT_PACK_ID,
  DEFAULT_SCENE_ID,
  DEFAULT_RENDER_QUALITY,
} from '../../../lib/studio/renderSceneLibrary';
import { updateProject } from '../../../lib/studio/designProjects';

export const RENDER_STUDIO_HE = Object.freeze({
  title: 'סטודיו הדמיות',
  close: 'סגירה',
  sectionPack: 'פרטי החבילה',
  labelPack: 'חבילת הדמיה',
  labelScene: 'סצנה',
  labelQuality: 'איכות',
  labelCount: 'כמות תמונות לכל סצנה',
  labelAspect: 'יחס תמונה',
  labelEngine: 'מנוע מוצע',
  sectionPlan: 'תוכנית ההדמיה',
  planPackLabel: 'חבילה נבחרת',
  planScenesLabel: 'סצנות כלולות',
  planImagesLabel: 'סה"כ תמונות מתוכננות',
  sectionPrompt: 'פרומפט סופי להדמיה',
  sectionNegative: 'Negative Prompt',
  sectionCost: 'עלות משוערת',
  costSelectionLabel: 'עלות לסצנה הנבחרת',
  costPackLabel: 'עלות כוללת לחבילה (ברירת מחדל לכל סצנה)',
  prepareRender: 'שמור תוכנית הדמיה',
  copyPrompt: 'העתק פרומפט',
  copyNegative: 'העתק Negative Prompt',
  copied: 'הועתק',
  savePlan: 'שמור תוכנית הדמיה',
  planSaved: 'תוכנית ההדמיה נשמרה ✓',
  // Clean 8K — "מדיה והדמיות" now reads "הדמיות ותצוגה".
  openMedia: 'פתח הדמיות ותצוגה',
  prepNote: 'תכנון הדמיה בלבד — ללא חיבור לכלי AI חיצוני וללא הפקת תמונות בשלב זה.',
  missingLabel: 'מה חסר לשיפור התוצאה',
  missingNone: 'ההקשר מלא — אין מידע חסר.',
});

const countStep = (n, delta, min = 1, max = 12) => Math.min(max, Math.max(min, n + delta));

export default function RenderStudioPanel({ project, onClose }) {
  const [packId, setPackId] = React.useState(DEFAULT_PACK_ID);
  const [sceneId, setSceneId] = React.useState(DEFAULT_SCENE_ID);
  const [qualityId, setQualityId] = React.useState(DEFAULT_RENDER_QUALITY);
  const [outputCount, setOutputCount] = React.useState(null); // null = pack default
  const [copiedKey, setCopiedKey] = React.useState(null);
  const [savedMessage, setSavedMessage] = React.useState(false);
  const timerRef = React.useRef(null);
  React.useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const packs = React.useMemo(() => listPacks(), []);
  const qualityLevels = React.useMemo(() => listQualityLevels(), []);
  const scenesInPack = React.useMemo(() => scenesForPack(packId), [packId]);

  // Keep the scene selection valid whenever the pack changes.
  React.useEffect(() => {
    setSceneId((current) => resolveSceneIdForPack(packId, current));
  }, [packId]);

  const pack = getPack(packId) || getPack(DEFAULT_PACK_ID);
  const effectiveCount =
    typeof outputCount === 'number' && outputCount > 0 ? outputCount : pack.defaultOutputsPerScene;

  const plan = React.useMemo(
    () =>
      project
        ? buildRenderBatchPlan(project, {
            packId,
            sceneId,
            qualityId,
            outputCount: effectiveCount,
          })
        : null,
    [project, packId, sceneId, qualityId, effectiveCount]
  );

  if (!project || !plan) return null;

  const copyText = (key, text) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof text === 'string') {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopiedKey(null), 1800);
      }
    } catch (e) {
      console.warn('[render-studio] clipboard unavailable', e);
    }
  };

  // «שמור תוכנית הדמיה» — persists ONLY through the existing public
  // updateProject, using the same kind-discriminated upsert pattern the
  // Clean 8I render package already uses inside the reserved `renders`
  // array. Non-fatal if it fails; the plan still displays either way.
  const savePlan = () => {
    try {
      const patch = buildRenderBatchPlanPatch(project, plan);
      if (patch) updateProject(project.id, patch);
      setSavedMessage(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setSavedMessage(false), 2200);
    } catch (e) {
      console.warn('[render-studio] batch plan persistence unavailable', e);
    }
  };

  return (
    <div style={styles.backdrop} onClick={onClose} role="presentation">
      <div
        style={styles.panel}
        dir="rtl"
        role="dialog"
        aria-label={RENDER_STUDIO_HE.title}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.head}>
          <div style={styles.headText}>
            <span style={styles.title}>{RENDER_STUDIO_HE.title}</span>
            <span style={styles.subtitle}>{project.name}</span>
          </div>
          <button type="button" onClick={onClose} style={styles.closeBtn}>
            {RENDER_STUDIO_HE.close}
          </button>
        </div>

        <div style={styles.body}>
          {/* פרטי החבילה — pack / scene / quality / count selectors */}
          <section style={styles.section}>
            <span style={styles.sectionTitle}>{RENDER_STUDIO_HE.sectionPack}</span>

            <span style={styles.fieldLabel}>{RENDER_STUDIO_HE.labelPack}</span>
            <div style={styles.chipRow}>
              {packs.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPackId(p.id)}
                  style={{ ...styles.chip, ...(packId === p.id ? styles.chipActive : null) }}
                  title={p.purposeHe}
                >
                  {p.nameHe}
                </button>
              ))}
            </div>

            <span style={styles.fieldLabel}>{RENDER_STUDIO_HE.labelScene}</span>
            <div style={styles.chipRow}>
              {scenesInPack.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSceneId(s.id)}
                  style={{ ...styles.chip, ...(sceneId === s.id ? styles.chipActive : null) }}
                  title={s.useHe}
                >
                  {s.nameHe}
                </button>
              ))}
            </div>

            <span style={styles.fieldLabel}>{RENDER_STUDIO_HE.labelQuality}</span>
            <div style={styles.chipRow}>
              {qualityLevels.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setQualityId(q.id)}
                  style={{ ...styles.chip, ...(qualityId === q.id ? styles.chipActive : null) }}
                  title={q.purposeHe}
                >
                  {q.nameHe}
                </button>
              ))}
            </div>

            <div style={styles.inlineFieldsRow}>
              <span style={styles.inlineField}>
                <span style={styles.fieldLabel}>{RENDER_STUDIO_HE.labelCount}</span>
                <span style={styles.stepper}>
                  <button
                    type="button"
                    style={styles.stepBtn}
                    onClick={() => setOutputCount(countStep(effectiveCount, -1))}
                  >
                    −
                  </button>
                  <span style={styles.stepValue}>{effectiveCount}</span>
                  <button
                    type="button"
                    style={styles.stepBtn}
                    onClick={() => setOutputCount(countStep(effectiveCount, 1))}
                  >
                    +
                  </button>
                </span>
              </span>
              <span style={styles.inlineField}>
                <span style={styles.fieldLabel}>{RENDER_STUDIO_HE.labelAspect}</span>
                <span style={styles.readonlyValue} dir="ltr">
                  {plan.aspectRatio}
                </span>
              </span>
              <span style={styles.inlineField}>
                <span style={styles.fieldLabel}>{RENDER_STUDIO_HE.labelEngine}</span>
                <span style={styles.readonlyValue} dir="ltr">
                  {plan.engine}
                </span>
              </span>
            </div>
          </section>

          {/* תוכנית ההדמיה — batch overview */}
          <section style={styles.section}>
            <span style={styles.sectionTitle}>{RENDER_STUDIO_HE.sectionPlan}</span>
            <div style={styles.planBox}>
              <span style={styles.planLine}>
                {RENDER_STUDIO_HE.planPackLabel}: {plan.packNameHe} — {plan.packPurposeHe}
              </span>
              <span style={styles.planLine}>
                {RENDER_STUDIO_HE.planScenesLabel}:{' '}
                {plan.packScenes.map((s) => s.nameHe).join(' · ')}
              </span>
              <span style={styles.planLine}>
                {RENDER_STUDIO_HE.planImagesLabel}: {plan.packTotalImages}
              </span>
            </div>
          </section>

          {/* פרומפט סופי להדמיה */}
          <section style={styles.section}>
            <div style={styles.sectionHead}>
              <span style={styles.sectionTitle}>{RENDER_STUDIO_HE.sectionPrompt}</span>
              <button
                type="button"
                onClick={() => copyText('prompt', plan.finalPromptEnglish)}
                style={styles.copyBtn}
              >
                {copiedKey === 'prompt' ? RENDER_STUDIO_HE.copied : RENDER_STUDIO_HE.copyPrompt}
              </button>
            </div>
            <pre style={styles.textBlockEn} dir="ltr">
              {plan.finalPromptEnglish}
            </pre>
          </section>

          {/* Negative Prompt */}
          <section style={styles.section}>
            <div style={styles.sectionHead}>
              <span style={styles.sectionTitle}>{RENDER_STUDIO_HE.sectionNegative}</span>
              <button
                type="button"
                onClick={() => copyText('negative', plan.negativePromptEnglish)}
                style={styles.copyBtn}
              >
                {copiedKey === 'negative' ? RENDER_STUDIO_HE.copied : RENDER_STUDIO_HE.copyNegative}
              </button>
            </div>
            <pre style={styles.textBlockEn} dir="ltr">
              {plan.negativePromptEnglish}
            </pre>
          </section>

          {/* עלות משוערת */}
          <section style={styles.section}>
            <span style={styles.sectionTitle}>{RENDER_STUDIO_HE.sectionCost}</span>
            <div style={styles.costBox}>
              <span style={styles.costLine}>
                <span style={styles.costLabel}>{RENDER_STUDIO_HE.costSelectionLabel}:</span>{' '}
                {plan.estimatedCostLineHe}
              </span>
              <span style={styles.costLine}>
                <span style={styles.costLabel}>{RENDER_STUDIO_HE.costPackLabel}:</span>{' '}
                {plan.packCostLineHe}
              </span>
            </div>
          </section>

          {/* מה חסר לשיפור התוצאה */}
          {plan.warnings.length > 0 ? (
            <section style={styles.section}>
              <span style={styles.sectionTitle}>{RENDER_STUDIO_HE.missingLabel}</span>
              <div style={styles.warnBox}>
                {plan.warnings.map((w) => (
                  <span key={w} style={styles.warnLine}>
                    • {w}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {/* Actions — one primary action only. The plan is already prepared
              automatically; this button saves the complete multi-scene batch. */}
          <div style={styles.actionsRow}>
            <button type="button" onClick={savePlan} style={styles.prepareBtn}>
              {RENDER_STUDIO_HE.prepareRender}
            </button>
            <button type="button" onClick={onClose} style={styles.mediaBtn}>
              {RENDER_STUDIO_HE.openMedia}
            </button>
            {savedMessage ? <span style={styles.savedMessage}>{RENDER_STUDIO_HE.planSaved}</span> : null}
          </div>

          <span style={styles.prepNote}>{RENDER_STUDIO_HE.prepNote}</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(17,17,20,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 70,
  },
  panel: {
    width: 'min(700px, 100%)',
    maxHeight: '86vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#FFFFFF',
    borderRadius: tokens.radius.lg,
    border: `1px solid ${tokens.color.goldFaint}`,
    boxShadow: tokens.shadow.lift,
    overflow: 'hidden',
  },
  head: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    padding: '13px 16px',
    borderBottom: `1px solid ${tokens.color.goldFaint}`,
    flexShrink: 0,
  },
  headText: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  title: {
    fontFamily: tokens.font.display,
    fontSize: '15px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  subtitle: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.inkSoft,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  closeBtn: {
    minHeight: '30px',
    padding: '5px 13px',
    borderRadius: '999px',
    border: `1px solid ${tokens.color.cardEdge}`,
    background: 'transparent',
    color: tokens.color.charcoal,
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    flexShrink: 0,
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    padding: '14px 16px 18px',
    overflowY: 'auto',
    minHeight: 0,
  },
  section: { display: 'flex', flexDirection: 'column', gap: '7px' },
  sectionHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 800,
    color: tokens.color.gold,
    letterSpacing: '0.02em',
  },
  fieldLabel: {
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    fontWeight: 700,
    color: tokens.color.inkSoft,
    marginTop: '2px',
  },
  chipRow: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' },
  chip: {
    minHeight: '28px',
    padding: '4px 12px',
    borderRadius: '999px',
    border: `1px solid ${tokens.color.goldFaint}`,
    background: '#FFFFFF',
    color: tokens.color.inkSoft,
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  chipActive: {
    border: `1px solid ${tokens.color.charcoal}`,
    background: tokens.color.charcoal,
    color: '#FFFFFF',
  },
  inlineFieldsRow: { display: 'flex', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap', marginTop: '4px' },
  inlineField: { display: 'flex', flexDirection: 'column', gap: '4px' },
  stepper: { display: 'inline-flex', alignItems: 'center', gap: '8px' },
  stepBtn: {
    minWidth: '26px',
    minHeight: '26px',
    borderRadius: '999px',
    border: `1px solid ${tokens.color.goldFaint}`,
    background: '#FFFFFF',
    color: tokens.color.charcoal,
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    lineHeight: 1,
  },
  stepValue: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    minWidth: '18px',
    textAlign: 'center',
  },
  readonlyValue: {
    fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    fontSize: '12px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    padding: '4px 10px',
    borderRadius: tokens.radius.sm,
    border: `1px solid ${tokens.color.goldFaint}`,
    background: tokens.color.pearl,
  },
  planBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '9px 12px',
    borderRadius: tokens.radius.sm,
    border: `1px solid ${tokens.color.goldFaint}`,
    background: tokens.color.pearl,
  },
  planLine: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    lineHeight: 1.6,
    color: tokens.color.charcoal,
  },
  textBlockEn: {
    margin: 0,
    padding: '11px 13px',
    borderRadius: tokens.radius.sm,
    border: `1px solid ${tokens.color.goldFaint}`,
    background: tokens.color.pearl,
    fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    fontSize: '11.5px',
    lineHeight: 1.65,
    color: tokens.color.charcoal,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    textAlign: 'left',
  },
  copyBtn: {
    minHeight: '26px',
    padding: '3px 12px',
    borderRadius: '999px',
    border: `1px solid ${tokens.color.charcoal}`,
    background: 'transparent',
    color: tokens.color.charcoal,
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  costBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    padding: '9px 12px',
    borderRadius: tokens.radius.sm,
    border: `1px solid ${tokens.color.gold}`,
    background: tokens.color.goldFaint,
  },
  costLine: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    lineHeight: 1.6,
    color: tokens.color.charcoal,
  },
  costLabel: { fontWeight: 800 },
  warnBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    padding: '9px 12px',
    borderRadius: tokens.radius.sm,
    border: `1px solid ${tokens.color.goldFaint}`,
    background: '#FFFFFF',
  },
  warnLine: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
  },
  actionsRow: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  prepareBtn: {
    minHeight: '34px',
    padding: '7px 18px',
    borderRadius: '999px',
    border: 'none',
    background: tokens.color.charcoal,
    color: '#FFFFFF',
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  mediaBtn: {
    minHeight: '34px',
    padding: '7px 16px',
    borderRadius: '999px',
    border: `1px solid ${tokens.color.cardEdge}`,
    background: 'transparent',
    color: tokens.color.charcoal,
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  savedMessage: {
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    fontWeight: 700,
    color: tokens.color.gold,
  },
  prepNote: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    color: tokens.color.inkFaint,
  },
};
