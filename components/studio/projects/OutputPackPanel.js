// components/studio/projects/OutputPackPanel.js
//
// LESHEM.S OS — Clean 7A: Work File Backbone MVP — Output Pack panel.
// Clean 8D — Output Pack Pro + Media Prep: upgraded into a professional
// output workspace with sections A–F, a compact attached-assets view, and
// per-section copy buttons (native clipboard API only — no package).
//
//   A. סיכום מקצועי (Hebrew professional summary)          + העתק סיכום
//   B. תיאור ללקוח (short polished Hebrew description)     + העתק תיאור לקוח
//      נכסים ורפרנסים (compact view — only when attached)
//   C. Media Prompt — Realistic Render (ENGLISH ONLY)      + העתק פרומפט הדמיה
//   D. Media Prompt — Design Concept / Sketch (EN ONLY)    + העתק פרומפט סקיצה
//   E. Media Prompt — Client Presentation (ENGLISH ONLY)   + העתק פרומפט מצגת
//   F. הערות ייצור (Hebrew practical production notes)     + העתק הערות ייצור
//   + רפרנסים (existing linkage counts line — unchanged behavior)
//
// PRESENTATIONAL only: receives the project + the pre-built pack (from
// lib/studio/outputPack — pure formatting over existing project data).
// No API, no image generation, no render engine, no persistence. Every new
// section renders DEFENSIVELY — only when its pack field exists — so the
// panel stays compatible with any previously-shaped pack object.

import * as React from 'react';
import { tokens } from '../shared/tokens';

export const OUTPUT_PACK_HE = Object.freeze({
  // Clean 8K — "חבילת פלט" now reads "ערכת הצגה" per the milestone's
  // terminology pass. Internal export name and component name unchanged.
  title: 'ערכת הצגה',
  close: 'סגירה',
  sectionProfessional: 'סיכום מקצועי',
  sectionPrompt: 'Media Prompt (EN)',
  sectionClient: 'תיאור ללקוח',
  copyPrompt: 'העתק פרומפט',
  copied: 'הועתק',
  mediaNote: 'פלט טקסטואלי בלבד בשלב זה — ללא הפקת תמונה.',
  // Clean 8D — Output Pack Pro labels (additive keys only).
  sectionPromptRealistic: 'פרומפט הדמיה ריאליסטית (EN)',
  sectionPromptSketch: 'פרומפט סקיצה / קונספט (EN)',
  sectionPromptPresentation: 'פרומפט מצגת ללקוח (EN)',
  sectionProduction: 'הערות ייצור',
  // Clean 8K — "נכסים ורפרנסים" now reads "חומרי עבודה והשראה".
  sectionAssets: 'חומרי עבודה והשראה',
  copySummary: 'העתק סיכום',
  copyClient: 'העתק תיאור לקוח',
  copyRender: 'העתק פרומפט הדמיה',
  copySketch: 'העתק פרומפט סקיצה',
  copyPresentation: 'העתק פרומפט מצגת',
  copyProduction: 'העתק הערות ייצור',
  // Clean 8E — Media Workflow call-to-action. Clean 8K — "מדיה והדמיות"
  // now reads "הדמיות ותצוגה".
  openMedia: 'העבר להדמיות ותצוגה',
});

export default function OutputPackPanel({ project, pack, onClose, onOpenMedia }) {
  // Clean 8D — one copied-key state serves every copy button; the pressed
  // button shows «הועתק» for a short moment (same 1800ms pattern as 7A).
  const [copiedKey, setCopiedKey] = React.useState(null);
  const timerRef = React.useRef(null);
  React.useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);
  if (!project || !pack) return null;

  const copyText = (key, text) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof text === 'string') {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopiedKey(null), 1800);
      }
    } catch (e) {
      console.warn('[output-pack] clipboard unavailable', e);
    }
  };

  const copyBtn = (key, label, text) => (
    <button type="button" onClick={() => copyText(key, text)} style={styles.copyBtn}>
      {copiedKey === key ? OUTPUT_PACK_HE.copied : label}
    </button>
  );

  const assetsView = Array.isArray(pack.attachedAssets) ? pack.attachedAssets : [];

  return (
    <div style={styles.backdrop} onClick={onClose} role="presentation">
      <div
        style={styles.panel}
        dir="rtl"
        role="dialog"
        aria-label={OUTPUT_PACK_HE.title}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.head}>
          <div style={styles.headText}>
            <span style={styles.title}>{OUTPUT_PACK_HE.title}</span>
            <span style={styles.subtitle}>{project.name}</span>
          </div>
          <div style={styles.headActions}>
            {typeof onOpenMedia === 'function' ? (
              <button type="button" onClick={() => onOpenMedia(project)} style={styles.mediaCta}>
                {OUTPUT_PACK_HE.openMedia}
              </button>
            ) : null}
            <button type="button" onClick={onClose} style={styles.closeBtn}>
              {OUTPUT_PACK_HE.close}
            </button>
          </div>
        </div>

        <div style={styles.body}>
          {/* A — Hebrew professional summary */}
          <section style={styles.section}>
            <div style={styles.sectionHead}>
              <span style={styles.sectionTitle}>{OUTPUT_PACK_HE.sectionProfessional}</span>
              {copyBtn('summary', OUTPUT_PACK_HE.copySummary, pack.professionalHe)}
            </div>
            <pre style={styles.textBlock}>{pack.professionalHe}</pre>
          </section>

          {/* B — Hebrew client description */}
          <section style={styles.section}>
            <div style={styles.sectionHead}>
              <span style={styles.sectionTitle}>{OUTPUT_PACK_HE.sectionClient}</span>
              {copyBtn('client', OUTPUT_PACK_HE.copyClient, pack.clientHe)}
            </div>
            <p style={styles.clientText}>{pack.clientHe}</p>
          </section>

          {/* נכסים ורפרנסים — compact view, only when assets are attached */}
          {assetsView.length > 0 ? (
            <section style={styles.section}>
              <span style={styles.sectionTitle}>{OUTPUT_PACK_HE.sectionAssets}</span>
              <div style={styles.assetRows}>
                {assetsView.map((a) => (
                  <div key={a.assetId} style={styles.assetRow}>
                    <span style={styles.assetName}>{a.name}</span>
                    <span style={styles.assetChip}>{a.roleHe}</span>
                    <span style={styles.assetChip}>{a.fileTypeHe}</span>
                    <span style={styles.assetPreview}>{a.previewHe}</span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {/* C — English media prompt: realistic render */}
          <section style={styles.section}>
            <div style={styles.sectionHead}>
              <span style={styles.sectionTitle}>{OUTPUT_PACK_HE.sectionPromptRealistic}</span>
              {copyBtn('render', OUTPUT_PACK_HE.copyRender, pack.mediaPromptEn)}
            </div>
            <pre style={{ ...styles.textBlock, ...styles.promptBlock }} dir="ltr">
              {pack.mediaPromptEn}
            </pre>
            <span style={styles.mediaNote}>{OUTPUT_PACK_HE.mediaNote}</span>
          </section>

          {/* D — English media prompt: design concept / sketch */}
          {typeof pack.sketchPromptEn === 'string' && pack.sketchPromptEn ? (
            <section style={styles.section}>
              <div style={styles.sectionHead}>
                <span style={styles.sectionTitle}>{OUTPUT_PACK_HE.sectionPromptSketch}</span>
                {copyBtn('sketch', OUTPUT_PACK_HE.copySketch, pack.sketchPromptEn)}
              </div>
              <pre style={{ ...styles.textBlock, ...styles.promptBlock }} dir="ltr">
                {pack.sketchPromptEn}
              </pre>
            </section>
          ) : null}

          {/* E — English media prompt: client presentation */}
          {typeof pack.presentationPromptEn === 'string' && pack.presentationPromptEn ? (
            <section style={styles.section}>
              <div style={styles.sectionHead}>
                <span style={styles.sectionTitle}>{OUTPUT_PACK_HE.sectionPromptPresentation}</span>
                {copyBtn('presentation', OUTPUT_PACK_HE.copyPresentation, pack.presentationPromptEn)}
              </div>
              <pre style={{ ...styles.textBlock, ...styles.promptBlock }} dir="ltr">
                {pack.presentationPromptEn}
              </pre>
            </section>
          ) : null}

          {/* F — Hebrew production notes */}
          {typeof pack.productionNotesHe === 'string' && pack.productionNotesHe ? (
            <section style={styles.section}>
              <div style={styles.sectionHead}>
                <span style={styles.sectionTitle}>{OUTPUT_PACK_HE.sectionProduction}</span>
                {copyBtn('production', OUTPUT_PACK_HE.copyProduction, pack.productionNotesHe)}
              </div>
              <pre style={styles.textBlock}>{pack.productionNotesHe}</pre>
            </section>
          ) : null}

          {/* References — existing linkage or honest placeholder */}
          <section style={styles.section}>
            <span style={styles.sectionTitle}>{pack.references.title}</span>
            <p style={styles.refsText}>{pack.references.text}</p>
          </section>
        </div>
      </div>
    </div>
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
    width: 'min(640px, 100%)',
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
  // Clean 8E — header actions + Media Workflow CTA.
  headActions: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  mediaCta: {
    minHeight: '30px',
    padding: '5px 14px',
    borderRadius: '999px',
    border: `1px solid ${tokens.color.gold}`,
    background: tokens.color.goldFaint,
    color: tokens.color.charcoal,
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '14px 16px 18px',
    overflowY: 'auto',
    minHeight: 0,
  },
  section: { display: 'flex', flexDirection: 'column', gap: '6px' },
  sectionHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' },
  sectionTitle: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 800,
    color: tokens.color.gold,
    letterSpacing: '0.02em',
  },
  textBlock: {
    margin: 0,
    padding: '11px 13px',
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
  promptBlock: {
    fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    fontSize: '12px',
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
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  mediaNote: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    color: tokens.color.inkFaint,
  },
  clientText: {
    margin: 0,
    fontFamily: tokens.font.body,
    fontSize: '13px',
    lineHeight: 1.7,
    color: tokens.color.charcoal,
  },
  refsText: {
    margin: 0,
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    color: tokens.color.inkSoft,
  },
  // Clean 8D — compact attached-assets rows.
  assetRows: { display: 'flex', flexDirection: 'column', gap: '6px' },
  assetRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    flexWrap: 'wrap',
    padding: '7px 11px',
    borderRadius: tokens.radius.sm,
    border: `1px solid ${tokens.color.goldFaint}`,
    background: tokens.color.pearl,
  },
  assetName: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '46%',
  },
  assetChip: {
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
  assetPreview: {
    fontFamily: tokens.font.body,
    fontSize: '10.5px',
    color: tokens.color.inkFaint,
    whiteSpace: 'nowrap',
  },
};
