// components/studio/projects/OutputPackPanel.js
//
// LESHEM.S OS — Clean 7A: Work File Backbone MVP — Output Pack panel.
//
// A simple overlay showing the text-based Output Pack of one Work File:
//   A. סיכום מקצועי (Hebrew professional summary)
//   B. Media Prompt (ENGLISH ONLY — for future visualization generation)
//   C. תיאור ללקוח (short polished Hebrew client description)
//   + רפרנסים (existing linkage counts if present, otherwise an honest
//     placeholder — upload is NOT part of this milestone)
//
// PRESENTATIONAL only: receives the project + the pre-built pack (from
// lib/studio/outputPack — pure formatting over existing project data).
// No API, no image generation, no render engine, no persistence. The single
// copy action uses the native clipboard API (no package).

import * as React from 'react';
import { tokens } from '../shared/tokens';

export const OUTPUT_PACK_HE = Object.freeze({
  title: 'חבילת פלט',
  close: 'סגירה',
  sectionProfessional: 'סיכום מקצועי',
  sectionPrompt: 'Media Prompt (EN)',
  sectionClient: 'תיאור ללקוח',
  sectionAssets: 'נכסי עבודה',
  copyPrompt: 'העתק פרומפט',
  copied: 'הועתק',
  mediaNote: 'פלט טקסטואלי בלבד בשלב זה — ללא הפקת תמונה.',
});

export default function OutputPackPanel({ project, pack, onClose }) {
  const [copied, setCopied] = React.useState(false);
  if (!project || !pack) return null;

  const copyPrompt = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(pack.mediaPromptEn);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch (e) {
      console.warn('[output-pack] clipboard unavailable', e);
    }
  };

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
          <button type="button" onClick={onClose} style={styles.closeBtn}>
            {OUTPUT_PACK_HE.close}
          </button>
        </div>

        <div style={styles.body}>
          {/* A — Hebrew professional summary */}
          <section style={styles.section}>
            <span style={styles.sectionTitle}>{OUTPUT_PACK_HE.sectionProfessional}</span>
            <pre style={styles.textBlock}>{pack.professionalHe}</pre>
          </section>

          {/* B — English media prompt */}
          <section style={styles.section}>
            <div style={styles.sectionHead}>
              <span style={styles.sectionTitle}>{OUTPUT_PACK_HE.sectionPrompt}</span>
              <button type="button" onClick={copyPrompt} style={styles.copyBtn}>
                {copied ? OUTPUT_PACK_HE.copied : OUTPUT_PACK_HE.copyPrompt}
              </button>
            </div>
            <pre style={{ ...styles.textBlock, ...styles.promptBlock }} dir="ltr">
              {pack.mediaPromptEn}
            </pre>
            <span style={styles.mediaNote}>{OUTPUT_PACK_HE.mediaNote}</span>
          </section>

          {/* C — Hebrew client description */}
          <section style={styles.section}>
            <span style={styles.sectionTitle}>{OUTPUT_PACK_HE.sectionClient}</span>
            <p style={styles.clientText}>{pack.clientHe}</p>
          </section>

          {/* Clean 7B — Work Assets (name · type · role · preview status) */}
          {Array.isArray(pack.assets) && pack.assets.length > 0 ? (
            <section style={styles.section}>
              <span style={styles.sectionTitle}>{OUTPUT_PACK_HE.sectionAssets}</span>
              <pre style={styles.textBlock}>{pack.assets.join('\n')}</pre>
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
};
