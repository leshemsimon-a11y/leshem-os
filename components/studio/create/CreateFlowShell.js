// components/studio/create/CreateFlowShell.js
//
// LESHEM.S OS — Clean 8A: Create Flow MVP — the guided creation wizard.
//
// A simple, mobile-first, step-by-step flow (/studio/create):
//   1. מה ניצור?  2. באיזה סגנון?  3. אבני עבודה (real Work Tray, read-only)
//   4. רפרנסים (text only this milestone)  5. מה חשוב לך בעיצוב?
//   6. צור כיווני עיצוב (3 local structured directions)  7. שמור כתיק עבודה
//
// All generation is LOCAL and deterministic (lib/studio/createFlow). Saving
// uses the EXISTING public designProjects API + setActiveWorkId — the brief
// is built from valid existing enum values and persisted free-text fields
// only, and the directions are studio-compatible concepts, so the saved
// Work File opens correctly in /studio/projects and the stable Studio.
// Wizard state is LOCAL page state — no new persistence keys.

import * as React from 'react';
import { useRouter } from 'next/router';
import { tokens } from '../shared/tokens';
import { CONCEPT_HE } from '../../../lib/studio/labels';
import { createUseWorkTray } from '../../../lib/studio/workTray';
import { createUseDesignProjects } from '../../../lib/studio/designProjects';
import { setActiveWorkId } from '../../../lib/studio/activeWorkStore';
import { buildDesignSnapshot, normalizeRole } from '../../../lib/studio/designDraft';
import {
  CREATE_PRODUCT_OPTIONS,
  CREATE_STYLE_OPTIONS,
  generateCreateDirections,
  buildCreateBrief,
  buildCreateOutputPack,
  buildCreateWorkFileName,
} from '../../../lib/studio/createFlow';

const useWorkTray = createUseWorkTray(React);
const useDesignProjects = createUseDesignProjects(React);

export const CREATE_HE = Object.freeze({
  title: 'יצירת תכשיט',
  stepOf: (i, n) => `שלב ${i} מתוך ${n}`,
  back: 'חזרה',
  next: 'המשך',
  step1: 'מה ניצור?',
  step2: 'באיזה סגנון?',
  step3: 'אבני עבודה',
  stonesEmpty: 'עדיין לא נבחרו אבנים. אפשר להמשיך עם רעיון כללי או לחזור למלאי.',
  backToInventory: 'למלאי',
  step4: 'רפרנסים',
  refPlaceholder: 'הוסף תיאור של רפרנס, תמונה, מודל, STL, OBJ או השראה',
  refHelper: 'בשלב הבא נחבר העלאת קבצים אמיתית.',
  step5: 'מה חשוב לך בעיצוב?',
  requestPlaceholder:
    'לדוגמה: טבעת קלאסטר מודרנית עם האבן המרכזית, שיבוץ נמוך, מראה יוקרתי ועדין, מתאים ללקוחה שאוהבת עיצוב נקי.',
  step6: 'כיווני עיצוב',
  generate: 'צור כיווני עיצוב',
  regenerate: 'צור כיוונים מחדש',
  directionSelectHint: 'אפשר לבחור כיוון מועדף (לא חובה):',
  step7: 'חבילת פלט ושמירה',
  packProfessional: 'סיכום מקצועי',
  packPrompt: 'Media Prompt (EN)',
  packClient: 'תיאור ללקוח',
  save: 'שמור כתיק עבודה',
  saveSuccess: 'התיק נוצר ונשמר',
  openProjects: 'פתח תיקי עבודה',
  openStudio: 'פתח בסטודיו',
  createAnother: 'צור עוד תכשיט',
  stoneLayoutLabel: 'שיבוץ',
  structureLabel: 'מבנה',
  productionLabel: 'ייצור',
  promptHintLabel: 'Prompt hint (EN)',
  loading: 'טוען…',
});

const TOTAL_STEPS = 7;

export default function CreateFlowShell() {
  const router = useRouter();
  const tray = useWorkTray();
  const projectsStore = useDesignProjects();

  const [step, setStep] = React.useState(1);
  const [product, setProduct] = React.useState(null);
  const [style, setStyle] = React.useState(null);
  const [referenceText, setReferenceText] = React.useState('');
  const [requestText, setRequestText] = React.useState('');
  const [directions, setDirections] = React.useState([]);
  const [selectedDirectionId, setSelectedDirectionId] = React.useState(null);
  const [savedId, setSavedId] = React.useState(null);

  if (!tray.hydrated) {
    return <div style={styles.loading}>{CREATE_HE.loading}</div>;
  }

  const trayItems = Array.isArray(tray.items) ? tray.items : [];
  const input = { product, style, trayItems, referenceText, requestText };
  const pack =
    directions.length > 0 ? buildCreateOutputPack(input, directions, selectedDirectionId) : null;

  const handleGenerate = () => {
    const next = generateCreateDirections(input);
    setDirections(next);
    setSelectedDirectionId(null);
  };

  const handleSave = () => {
    const brief = buildCreateBrief(input, directions, selectedDirectionId);
    const saved = projectsStore.save({
      name: buildCreateWorkFileName(input),
      trayItems,
      brief,
      snapshot: buildDesignSnapshot(trayItems, brief),
    });
    if (saved && saved.id) {
      setActiveWorkId(saved.id);
      setSavedId(saved.id);
    }
  };

  const resetFlow = () => {
    setStep(1);
    setProduct(null);
    setStyle(null);
    setReferenceText('');
    setRequestText('');
    setDirections([]);
    setSelectedDirectionId(null);
    setSavedId(null);
  };

  const canNext =
    (step === 1 && Boolean(product)) ||
    (step === 2 && Boolean(style)) ||
    (step >= 3 && step < TOTAL_STEPS);

  // ------------------------------------------------------------------
  // Success state (after save).
  // ------------------------------------------------------------------
  if (savedId) {
    return (
      <div style={styles.page} dir="rtl">
        <div style={styles.successCard}>
          <span style={styles.successTitle}>{CREATE_HE.saveSuccess}</span>
          <div style={styles.successActions}>
            <button type="button" style={styles.primaryBtn} onClick={() => router.push('/studio/projects')}>
              {CREATE_HE.openProjects}
            </button>
            <button type="button" style={styles.secondaryBtn} onClick={() => router.push('/studio/design')}>
              {CREATE_HE.openStudio}
            </button>
            <button type="button" style={styles.ghostBtn} onClick={resetFlow}>
              {CREATE_HE.createAnother}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Step content.
  // ------------------------------------------------------------------
  let stepTitle = '';
  let body = null;

  if (step === 1) {
    stepTitle = CREATE_HE.step1;
    body = (
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
    );
  } else if (step === 2) {
    stepTitle = CREATE_HE.step2;
    body = (
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
    );
  } else if (step === 3) {
    stepTitle = CREATE_HE.step3;
    body =
      trayItems.length === 0 ? (
        <div style={styles.emptyBox}>
          <p style={styles.emptyText}>{CREATE_HE.stonesEmpty}</p>
          <button type="button" style={styles.ghostBtn} onClick={() => router.push('/studio/inventory')}>
            {CREATE_HE.backToInventory}
          </button>
        </div>
      ) : (
        <div style={styles.stoneList}>
          {trayItems.map((item) => {
            const s = item.snapshot || {};
            const roleHe =
              CONCEPT_HE.roleLabels[normalizeRole(item.role)] || CONCEPT_HE.roleLabels.unassigned;
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
      );
  } else if (step === 4) {
    stepTitle = CREATE_HE.step4;
    body = (
      <>
        <textarea
          value={referenceText}
          onChange={(e) => setReferenceText(e.target.value)}
          placeholder={CREATE_HE.refPlaceholder}
          style={styles.textarea}
          rows={4}
          dir="rtl"
        />
        <span style={styles.helper}>{CREATE_HE.refHelper}</span>
      </>
    );
  } else if (step === 5) {
    stepTitle = CREATE_HE.step5;
    body = (
      <textarea
        value={requestText}
        onChange={(e) => setRequestText(e.target.value)}
        placeholder={CREATE_HE.requestPlaceholder}
        style={styles.textarea}
        rows={5}
        dir="rtl"
      />
    );
  } else if (step === 6) {
    stepTitle = CREATE_HE.step6;
    body = (
      <>
        <button type="button" style={styles.primaryBtn} onClick={handleGenerate}>
          {directions.length ? CREATE_HE.regenerate : CREATE_HE.generate}
        </button>
        {directions.length > 0 ? (
          <>
            <span style={styles.helper}>{CREATE_HE.directionSelectHint}</span>
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
          </>
        ) : null}
      </>
    );
  } else {
    stepTitle = CREATE_HE.step7;
    body = pack ? (
      <>
        <div style={styles.packSection}>
          <span style={styles.packTitle}>{CREATE_HE.packProfessional}</span>
          <pre style={styles.packBlock}>{pack.professionalHe}</pre>
        </div>
        <div style={styles.packSection}>
          <span style={styles.packTitle}>{CREATE_HE.packPrompt}</span>
          <pre style={{ ...styles.packBlock, ...styles.packBlockEn }} dir="ltr">
            {pack.mediaPromptEn}
          </pre>
        </div>
        <div style={styles.packSection}>
          <span style={styles.packTitle}>{CREATE_HE.packClient}</span>
          <p style={styles.packClient}>{pack.clientHe}</p>
        </div>
        <button type="button" style={styles.primaryBtn} onClick={handleSave}>
          {CREATE_HE.save}
        </button>
      </>
    ) : (
      <>
        <p style={styles.emptyText}>עדיין לא נוצרו כיווני עיצוב — נחזור שלב אחורה וניצור אותם.</p>
        <button type="button" style={styles.secondaryBtn} onClick={() => setStep(6)}>
          {CREATE_HE.generate}
        </button>
      </>
    );
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

      <div style={styles.nav}>
        {step > 1 ? (
          <button type="button" style={styles.ghostBtn} onClick={() => setStep(step - 1)}>
            {CREATE_HE.back}
          </button>
        ) : (
          <span />
        )}
        {step < TOTAL_STEPS ? (
          <button
            type="button"
            style={{ ...styles.primaryBtn, ...(!canNext ? styles.btnDisabled : null) }}
            onClick={() => canNext && setStep(step + 1)}
            disabled={!canNext}
          >
            {CREATE_HE.next}
          </button>
        ) : null}
      </div>
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
  chips: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
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
  emptyBox: { display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' },
  emptyText: {
    margin: 0,
    fontFamily: tokens.font.body,
    fontSize: '13px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
  },
  stoneList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  stoneRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 11px',
    borderRadius: tokens.radius.sm,
    border: `1px solid ${tokens.color.goldFaint}`,
    background: tokens.color.pearl,
  },
  stoneThumb: {
    width: '40px',
    height: '40px',
    borderRadius: tokens.radius.sm,
    overflow: 'hidden',
    flexShrink: 0,
    display: 'inline-flex',
  },
  stoneImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  stoneText: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  stoneName: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  stoneMeta: { fontFamily: tokens.font.body, fontSize: '11.5px', color: tokens.color.inkSoft },
  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '11px 13px',
    borderRadius: tokens.radius.sm,
    border: `1px solid ${tokens.color.goldFaint}`,
    background: tokens.color.pearl,
    color: tokens.color.charcoal,
    fontFamily: tokens.font.body,
    fontSize: '13px',
    lineHeight: 1.6,
    resize: 'vertical',
    outline: 'none',
  },
  helper: { fontFamily: tokens.font.body, fontSize: '11.5px', color: tokens.color.inkFaint },
  directionList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  directionCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '12px 14px',
    borderRadius: tokens.radius.md,
    border: `1px solid ${tokens.color.goldFaint}`,
    background: tokens.color.pearl,
    cursor: 'pointer',
    textAlign: 'right',
  },
  directionCardOn: {
    border: `1px solid ${tokens.color.gold}`,
    background: '#FFFFFF',
    boxShadow: `0 0 0 1px ${tokens.color.gold}`,
  },
  directionName: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 800,
    color: tokens.color.charcoal,
  },
  directionDesc: {
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    lineHeight: 1.6,
    color: tokens.color.charcoal,
  },
  directionRow: {
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    lineHeight: 1.55,
    color: tokens.color.inkSoft,
  },
  directionEn: {
    fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    fontSize: '10.5px',
    textAlign: 'left',
  },
  packSection: { display: 'flex', flexDirection: 'column', gap: '5px' },
  packTitle: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 800,
    color: tokens.color.gold,
  },
  packBlock: {
    margin: 0,
    padding: '10px 12px',
    borderRadius: tokens.radius.sm,
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.goldFaint}`,
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    lineHeight: 1.65,
    color: tokens.color.charcoal,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  packBlockEn: {
    fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    fontSize: '11.5px',
    textAlign: 'left',
  },
  packClient: {
    margin: 0,
    fontFamily: tokens.font.body,
    fontSize: '13px',
    lineHeight: 1.7,
    color: tokens.color.charcoal,
  },
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' },
  primaryBtn: {
    minHeight: '42px',
    padding: '9px 22px',
    borderRadius: '999px',
    border: 'none',
    background: tokens.color.charcoal,
    color: '#FFFFFF',
    fontFamily: tokens.font.body,
    fontSize: '13.5px',
    fontWeight: 800,
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  secondaryBtn: {
    minHeight: '42px',
    padding: '9px 20px',
    borderRadius: '999px',
    border: `1px solid ${tokens.color.charcoal}`,
    background: 'transparent',
    color: tokens.color.charcoal,
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  ghostBtn: {
    minHeight: '40px',
    padding: '8px 16px',
    borderRadius: '999px',
    border: `1px solid ${tokens.color.goldFaint}`,
    background: 'transparent',
    color: tokens.color.inkSoft,
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  btnDisabled: { opacity: 0.45, cursor: 'not-allowed' },
  successCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    alignItems: 'center',
    padding: '36px 20px',
    borderRadius: tokens.radius.md,
    border: `1px solid ${tokens.color.gold}`,
    background: '#FFFFFF',
    boxShadow: tokens.shadow.soft,
    textAlign: 'center',
  },
  successTitle: {
    fontFamily: tokens.font.display,
    fontSize: '19px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  successActions: { display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' },
};
