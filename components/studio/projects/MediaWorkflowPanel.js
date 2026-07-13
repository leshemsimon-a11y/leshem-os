// components/studio/projects/MediaWorkflowPanel.js
//
// LESHEM.S OS — Clean 8E: Media Workflow v1 — «מדיה והדמיות» panel.
//
// A compact overlay (same pattern as OutputPackPanel) managing the MANUAL
// media workflow of one Work File: media status, target tool, prompt
// selection/copy from the Clean 8D Output Pack, "סמן כנשלח", a manual
// media-result form (metadata / URL / notes only — no upload), and the
// saved-results list. Image URLs render a small preview ONLY when they look
// like a plain https image link; nothing is ever fetched by code.
//
// PRESENTATIONAL only: receives the FRESH project (looked up by id in the
// caller so store updates re-render), the pre-built pack, and callbacks that
// persist through the EXISTING public updateProject API. No API, no external
// AI service, no render engine, no persistence here, no package.
//
// Clean 8J — «הכן הדמיה» is the single render entry point. One click opens
// the Render Studio with a complete default catalog plan already prepared.
// Optional pack/scene/quality controls remain inside that flow; the Clean 8I
// prompt finalizer is reused underneath. No external API or image generation.

import * as React from 'react';
import { tokens } from '../shared/tokens';
import {
  MEDIA_STATUS_VALUES,
  MEDIA_TOOL_VALUES,
  MEDIA_PROMPT_OPTIONS,
  mediaStatusHe,
  mediaToolHe,
  getMediaState,
  getMediaResults,
  mediaNextActionHe,
  isSafeLinkUrl,
  isSafeImageUrl,
} from '../../../lib/studio/mediaWorkflow';
// Clean 8J — one clear render entry point. The Render Studio reuses the
// Clean 8I prompt finalizer internally and adds scenes, packs, quality, cost,
// and complete batch planning without exposing two overlapping workflows.
import RenderStudioPanel from './RenderStudioPanel';

export const MEDIA_WORKFLOW_HE = Object.freeze({
  title: 'מדיה והדמיות',
  close: 'סגירה',
  sectionStatus: 'סטטוס מדיה',
  sectionTool: 'כלי יעד',
  sectionPrompts: 'פרומפטים מוכנים לשימוש',
  sectionResultForm: 'תוצאת מדיה ידנית',
  sectionResults: 'תוצאות מדיה שמורות',
  usePrompt: 'השתמש לפרומפט הדמיה',
  inUse: 'נבחר לפרומפט',
  copyPrompt: 'העתק פרומפט',
  copied: 'הועתק',
  markSent: 'סמן כנשלח',
  sentPrefix: 'נשלח',
  noPack: 'אין פרומפטים זמינים — יש לפתוח קודם את חבילת הפלט.',
  // Clean 8I — one-click render prompt finalizer (primary media action).
  prepareRender: 'הכן הדמיה',
  prepareRenderHint: 'המערכת תאסוף את פרטי התיק ותכין פרומפט הדמיה סופי אוטומטית.',
  resultTitle: 'שם תוצאה',
  resultTool: 'כלי',
  resultUrl: 'קישור או URL לתמונה',
  resultNotes: 'הערות',
  resultStatus: 'סטטוס',
  saveResult: 'שמור תוצאת מדיה',
  resultSaved: 'התוצאה נשמרה',
  titleRequired: 'יש להזין שם תוצאה',
  resultsEmpty: 'אין עדיין תוצאות מדיה שמורות לתיק זה.',
  openLink: 'פתיחת קישור',
  manualNote: 'זרימת עבודה ידנית בלבד — ללא חיבור לכלי AI חיצוני וללא העלאת קבצים בשלב זה.',
});

const dateTimeHe = (ts) =>
  typeof ts === 'number' && ts > 0
    ? `${new Date(ts).toLocaleDateString('he-IL')} ${new Date(ts).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`
    : null;

export default function MediaWorkflowPanel({ project, pack, onClose, onUpdateState, onSaveResult }) {
  const [copiedKey, setCopiedKey] = React.useState(null);
  const [formTitle, setFormTitle] = React.useState('');
  const [formTool, setFormTool] = React.useState('other');
  const [formUrl, setFormUrl] = React.useState('');
  const [formNotes, setFormNotes] = React.useState('');
  const [formStatus, setFormStatus] = React.useState('resultReceived');
  const [formMessage, setFormMessage] = React.useState(null);
  // Clean 8J — one render flow only. It opens with a useful default plan,
  // while scene/pack/quality controls remain optional.
  const [renderStudioOpen, setRenderStudioOpen] = React.useState(false);
  const timerRef = React.useRef(null);
  React.useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);
  if (!project) return null;

  const state = getMediaState(project);
  const results = getMediaResults(project);
  const prompts = MEDIA_PROMPT_OPTIONS.filter(
    (o) => pack && typeof pack[o.packField] === 'string' && pack[o.packField]
  );

  const copyText = (key, text) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof text === 'string') {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopiedKey(null), 1800);
      }
    } catch (e) {
      console.warn('[media-workflow] clipboard unavailable', e);
    }
  };

  const update = (partial) => {
    if (onUpdateState) onUpdateState(project, partial);
  };

  const markSent = () => {
    if (onUpdateState) {
      onUpdateState(project, {
        mediaStatus: 'sentToTool',
        selectedTool: state.selectedTool || 'other',
        sentAt: Date.now(),
      });
    }
  };

  const saveResult = () => {
    if (!formTitle.trim()) {
      setFormMessage(MEDIA_WORKFLOW_HE.titleRequired);
      return;
    }
    if (onSaveResult) {
      const ok = onSaveResult(project, {
        title: formTitle,
        tool: formTool,
        url: formUrl,
        notes: formNotes,
        status: formStatus,
      });
      if (ok !== false) {
        setFormTitle('');
        setFormUrl('');
        setFormNotes('');
        setFormMessage(MEDIA_WORKFLOW_HE.resultSaved);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setFormMessage(null), 1800);
      }
    }
  };


  return (
    <>
      <div style={styles.backdrop} onClick={onClose} role="presentation">
        <div
          style={styles.panel}
          dir="rtl"
          role="dialog"
          aria-label={MEDIA_WORKFLOW_HE.title}
          onClick={(e) => e.stopPropagation()}
        >
        <div style={styles.head}>
          <div style={styles.headText}>
            <span style={styles.title}>{MEDIA_WORKFLOW_HE.title}</span>
            <span style={styles.subtitle}>{project.name}</span>
          </div>
          <button type="button" onClick={onClose} style={styles.closeBtn}>
            {MEDIA_WORKFLOW_HE.close}
          </button>
        </div>

        <div style={styles.body}>
          {/* Next action hint */}
          <p style={styles.nextAction}>{mediaNextActionHe(project)}</p>

          {/* Clean 8I — «הכן הדמיה»: the PRIMARY media action. One click
              opens the finalized render package (default preset already
              selected) — no configuration required before seeing a result. */}
          <section style={styles.prepareCard}>
            <div style={styles.prepareText}>
              <span style={styles.prepareTitle}>{MEDIA_WORKFLOW_HE.prepareRender}</span>
              <span style={styles.prepareHint}>{MEDIA_WORKFLOW_HE.prepareRenderHint}</span>
            </div>
            <button
              type="button"
              onClick={() => setRenderStudioOpen(true)}
              style={styles.prepareBtn}
            >
              {MEDIA_WORKFLOW_HE.prepareRender}
            </button>
          </section>


          {/* Media status */}
          <section style={styles.section}>
            <span style={styles.sectionTitle}>{MEDIA_WORKFLOW_HE.sectionStatus}</span>
            <div style={styles.chipRow}>
              {MEDIA_STATUS_VALUES.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => update({ mediaStatus: v })}
                  style={{
                    ...styles.chip,
                    ...(state.mediaStatus === v ? styles.chipActive : null),
                  }}
                >
                  {mediaStatusHe(v)}
                </button>
              ))}
            </div>
          </section>

          {/* Target tool */}
          <section style={styles.section}>
            <span style={styles.sectionTitle}>{MEDIA_WORKFLOW_HE.sectionTool}</span>
            <div style={styles.chipRow}>
              {MEDIA_TOOL_VALUES.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => update({ selectedTool: v })}
                  style={{
                    ...styles.chip,
                    ...(state.selectedTool === v ? styles.chipActive : null),
                  }}
                >
                  {mediaToolHe(v)}
                </button>
              ))}
            </div>
          </section>

          {/* Prompts from the Clean 8D Output Pack */}
          <section style={styles.section}>
            <span style={styles.sectionTitle}>{MEDIA_WORKFLOW_HE.sectionPrompts}</span>
            {prompts.length === 0 ? (
              <p style={styles.emptyText}>{MEDIA_WORKFLOW_HE.noPack}</p>
            ) : (
              <div style={styles.promptRows}>
                {prompts.map((o) => {
                  const isSelected = state.selectedPromptKey === o.key;
                  return (
                    <div key={o.key} style={{ ...styles.promptRow, ...(isSelected ? styles.promptRowActive : null) }}>
                      <span style={styles.promptName}>{o.he}</span>
                      <span style={styles.promptActions}>
                        <button
                          type="button"
                          onClick={() => update({ selectedPromptKey: o.key })}
                          style={{ ...styles.smallBtn, ...(isSelected ? styles.smallBtnActive : null) }}
                        >
                          {isSelected ? MEDIA_WORKFLOW_HE.inUse : MEDIA_WORKFLOW_HE.usePrompt}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyText(o.key, pack[o.packField])}
                          style={styles.smallBtn}
                        >
                          {copiedKey === o.key ? MEDIA_WORKFLOW_HE.copied : MEDIA_WORKFLOW_HE.copyPrompt}
                        </button>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={styles.sentRow}>
              <button type="button" onClick={markSent} style={styles.markSentBtn}>
                {MEDIA_WORKFLOW_HE.markSent}
              </button>
              {state.sentAt ? (
                <span style={styles.sentInfo}>
                  {MEDIA_WORKFLOW_HE.sentPrefix} {dateTimeHe(state.sentAt)}
                  {state.selectedTool ? ` · ${mediaToolHe(state.selectedTool)}` : ''}
                </span>
              ) : null}
            </div>
          </section>

          {/* Manual media result form */}
          <section style={styles.section}>
            <span style={styles.sectionTitle}>{MEDIA_WORKFLOW_HE.sectionResultForm}</span>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder={MEDIA_WORKFLOW_HE.resultTitle}
              style={styles.input}
              dir="rtl"
              aria-label={MEDIA_WORKFLOW_HE.resultTitle}
            />
            <div style={styles.formRow}>
              <label style={styles.selectWrap}>
                <span style={styles.selectLabel}>{MEDIA_WORKFLOW_HE.resultTool}</span>
                <select
                  value={formTool}
                  onChange={(e) => setFormTool(e.target.value)}
                  style={styles.select}
                >
                  {MEDIA_TOOL_VALUES.map((v) => (
                    <option key={v} value={v}>
                      {mediaToolHe(v)}
                    </option>
                  ))}
                </select>
              </label>
              <label style={styles.selectWrap}>
                <span style={styles.selectLabel}>{MEDIA_WORKFLOW_HE.resultStatus}</span>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  style={styles.select}
                >
                  {MEDIA_STATUS_VALUES.map((v) => (
                    <option key={v} value={v}>
                      {mediaStatusHe(v)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <input
              type="text"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              placeholder={MEDIA_WORKFLOW_HE.resultUrl}
              style={{ ...styles.input, direction: 'ltr', textAlign: 'left' }}
              aria-label={MEDIA_WORKFLOW_HE.resultUrl}
            />
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder={MEDIA_WORKFLOW_HE.resultNotes}
              style={styles.textarea}
              dir="rtl"
              rows={2}
              aria-label={MEDIA_WORKFLOW_HE.resultNotes}
            />
            <div style={styles.formActions}>
              <button type="button" onClick={saveResult} style={styles.saveBtn}>
                {MEDIA_WORKFLOW_HE.saveResult}
              </button>
              {formMessage ? <span style={styles.formMessage}>{formMessage}</span> : null}
            </div>
          </section>

          {/* Saved results */}
          <section style={styles.section}>
            <span style={styles.sectionTitle}>{MEDIA_WORKFLOW_HE.sectionResults}</span>
            {results.length === 0 ? (
              <p style={styles.emptyText}>{MEDIA_WORKFLOW_HE.resultsEmpty}</p>
            ) : (
              <div style={styles.resultRows}>
                {results.map((r) => (
                  <div key={r.renderId} style={styles.resultRow}>
                    <div style={styles.resultHead}>
                      <span style={styles.resultTitle}>{r.title}</span>
                      <span style={styles.resultChip}>{mediaToolHe(r.tool)}</span>
                      <span style={styles.resultChip}>{mediaStatusHe(r.status)}</span>
                      {dateTimeHe(r.createdAt) ? (
                        <span style={styles.resultDate}>{dateTimeHe(r.createdAt)}</span>
                      ) : null}
                    </div>
                    {r.url && isSafeImageUrl(r.url) ? (
                      <img
                        src={r.url}
                        alt={r.title}
                        style={styles.resultImage}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : null}
                    {r.url ? (
                      isSafeLinkUrl(r.url) ? (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.resultLink}
                          dir="ltr"
                        >
                          {r.url}
                        </a>
                      ) : (
                        <span style={styles.resultUrlText} dir="ltr">
                          {r.url}
                        </span>
                      )
                    ) : null}
                    {r.notes ? <p style={styles.resultNotes}>{r.notes}</p> : null}
                  </div>
                ))}
              </div>
            )}
          </section>

          <span style={styles.manualNote}>{MEDIA_WORKFLOW_HE.manualNote}</span>
        </div>
        </div>
      </div>
      {/* Clean 8J — the single Render Studio overlay, rendered as a sibling
          of the Media Workflow backdrop so closing it keeps the media panel open. */}
      {renderStudioOpen ? (
        <RenderStudioPanel project={project} onClose={() => setRenderStudioOpen(false)} />
      ) : null}
    </>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(17,17,20,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 60,
  },
  panel: {
    width: 'min(680px, 100%)',
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
    gap: '16px',
    padding: '14px 16px 18px',
    overflowY: 'auto',
    minHeight: 0,
  },
  nextAction: {
    margin: 0,
    padding: '9px 12px',
    borderRadius: tokens.radius.sm,
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.gold}`,
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 600,
    color: tokens.color.charcoal,
  },
  // Clean 8I — the primary «הכן הדמיה» action card.
  prepareCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
    padding: '13px 15px',
    borderRadius: tokens.radius.md,
    border: `1px solid ${tokens.color.gold}`,
    background: `linear-gradient(135deg, ${tokens.color.goldFaint}, #FFFFFF)`,
  },
  prepareText: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  prepareTitle: {
    fontFamily: tokens.font.display,
    fontSize: '14px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  prepareHint: {
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    color: tokens.color.inkSoft,
  },
  prepareBtn: {
    minHeight: '36px',
    padding: '8px 20px',
    borderRadius: '999px',
    border: 'none',
    background: tokens.color.charcoal,
    color: '#FFFFFF',
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  section: { display: 'flex', flexDirection: 'column', gap: '7px' },
  sectionTitle: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 800,
    color: tokens.color.gold,
    letterSpacing: '0.02em',
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
  promptRows: { display: 'flex', flexDirection: 'column', gap: '6px' },
  promptRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    flexWrap: 'wrap',
    padding: '8px 11px',
    borderRadius: tokens.radius.sm,
    border: `1px solid ${tokens.color.goldFaint}`,
    background: tokens.color.pearl,
  },
  promptRowActive: {
    border: `1px solid ${tokens.color.gold}`,
    boxShadow: `0 0 0 1px ${tokens.color.gold}`,
  },
  promptName: {
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  promptActions: { display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' },
  smallBtn: {
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
  smallBtnActive: {
    background: tokens.color.charcoal,
    color: '#FFFFFF',
  },
  sentRow: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  markSentBtn: {
    minHeight: '32px',
    padding: '6px 16px',
    borderRadius: '999px',
    border: 'none',
    background: tokens.color.charcoal,
    color: '#FFFFFF',
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  sentInfo: {
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    color: tokens.color.inkSoft,
  },
  input: {
    minHeight: '34px',
    boxSizing: 'border-box',
    padding: '7px 11px',
    borderRadius: tokens.radius.sm,
    border: `1px solid ${tokens.color.goldFaint}`,
    background: '#FFFFFF',
    color: tokens.color.charcoal,
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    outline: 'none',
    width: '100%',
  },
  textarea: {
    boxSizing: 'border-box',
    padding: '7px 11px',
    borderRadius: tokens.radius.sm,
    border: `1px solid ${tokens.color.goldFaint}`,
    background: '#FFFFFF',
    color: tokens.color.charcoal,
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    outline: 'none',
    width: '100%',
    resize: 'vertical',
  },
  formRow: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  selectWrap: { display: 'inline-flex', alignItems: 'center', gap: '6px' },
  selectLabel: {
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    fontWeight: 700,
    color: tokens.color.inkSoft,
  },
  select: {
    minHeight: '30px',
    padding: '4px 8px',
    borderRadius: tokens.radius.sm,
    border: `1px solid ${tokens.color.goldFaint}`,
    background: '#FFFFFF',
    color: tokens.color.charcoal,
    fontFamily: tokens.font.body,
    fontSize: '12px',
  },
  formActions: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  saveBtn: {
    minHeight: '32px',
    padding: '6px 16px',
    borderRadius: '999px',
    border: 'none',
    background: tokens.color.charcoal,
    color: '#FFFFFF',
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  formMessage: {
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    fontWeight: 700,
    color: tokens.color.gold,
  },
  emptyText: {
    margin: 0,
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.inkFaint,
  },
  resultRows: { display: 'flex', flexDirection: 'column', gap: '8px' },
  resultRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    padding: '9px 12px',
    borderRadius: tokens.radius.sm,
    border: `1px solid ${tokens.color.goldFaint}`,
    background: tokens.color.pearl,
  },
  resultHead: { display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' },
  resultTitle: {
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  resultChip: {
    fontFamily: tokens.font.body,
    fontSize: '10.5px',
    fontWeight: 600,
    color: tokens.color.charcoal,
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.gold}`,
    borderRadius: tokens.radius.sm,
    padding: '1px 7px',
    whiteSpace: 'nowrap',
  },
  resultDate: {
    fontFamily: tokens.font.body,
    fontSize: '10.5px',
    color: tokens.color.inkFaint,
    whiteSpace: 'nowrap',
  },
  resultImage: {
    maxWidth: '180px',
    maxHeight: '120px',
    borderRadius: tokens.radius.sm,
    border: `1px solid ${tokens.color.goldFaint}`,
    objectFit: 'cover',
  },
  resultLink: {
    fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    fontSize: '11px',
    color: tokens.color.charcoal,
    wordBreak: 'break-all',
    textAlign: 'left',
  },
  resultUrlText: {
    fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    fontSize: '11px',
    color: tokens.color.inkSoft,
    wordBreak: 'break-all',
    textAlign: 'left',
  },
  resultNotes: {
    margin: 0,
    fontFamily: tokens.font.body,
    fontSize: '12px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
  },
  manualNote: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    color: tokens.color.inkFaint,
  },
};
