// components/studio/projects/RenderPromptPanel.js
//
// LESHEM.S OS — Clean 8I: Render Engine Prep + One-Click Prompt Finalizer.
//
// The «הדמיה מוכנה» overlay: opened by the primary «הכן הדמיה» action in the
// Media Workflow panel. The final render package is built AUTOMATICALLY from
// the Work File (default preset «הדמיית קטלוג ריאליסטית» pre-selected) — the
// user sees a complete result with zero configuration. Preset chips stay
// secondary; changing one instantly rebuilds the package.
//
// Sections: «מה המערכת הבינה» · «פרומפט סופי להדמיה» · «Negative Prompt» ·
// «הגדרות מומלצות» · «מה חסר לשיפור התוצאה».
// Actions: «העתק פרומפט» · «העתק Negative Prompt» · «סמן כמוכן להדמיה» ·
// «פתח מדיה והדמיות» (closes back to the Media Workflow beneath).
//
// PRESENTATIONAL + pure builders only: buildRenderPackage is a pure helper;
// persistence of the package happens in the PARENT (MediaWorkflowPanel →
// page callbacks / public updateProject pattern) via the onPersistPackage
// callback. NO API, NO render engine, NO store internals, NO persistence key.

import * as React from 'react';
import { tokens } from '../shared/tokens';
import {
  RENDER_PRESET_VALUES,
  DEFAULT_RENDER_PRESET,
  renderPresetHe,
  buildRenderPackage,
  RENDER_FINALIZER_HE,
} from '../../../lib/studio/renderPromptFinalizer';
import { mediaToolHe, getMediaState, mediaStatusHe } from '../../../lib/studio/mediaWorkflow';

export const RENDER_PANEL_HE = Object.freeze({
  title: 'הדמיה מוכנה',
  close: 'סגירה',
  presetLabel: 'פריסט (ברירת מחדל נבחרה אוטומטית)',
  sectionUnderstood: 'מה המערכת הבינה',
  sectionPrompt: 'פרומפט סופי להדמיה',
  sectionNegative: 'Negative Prompt',
  sectionSettings: 'הגדרות מומלצות',
  sectionMissing: 'מה חסר לשיפור התוצאה',
  missingNone: 'ההקשר מלא — אין מידע חסר.',
  copyPrompt: 'העתק פרומפט',
  copyNegative: 'העתק Negative Prompt',
  copied: 'הועתק',
  markReady: 'סמן כמוכן להדמיה',
  markedReady: 'סומן כמוכן להדמיה ✓',
  openMedia: 'פתח מדיה והדמיות',
  statusPrefix: 'סטטוס מדיה נוכחי',
  prepNote: 'הכנת הדמיה בלבד — ללא חיבור לכלי AI חיצוני בשלב זה.',
});

export default function RenderPromptPanel({ project, onClose, onMarkReady, onPersistPackage }) {
  const [preset, setPreset] = React.useState(DEFAULT_RENDER_PRESET);
  const [copiedKey, setCopiedKey] = React.useState(null);
  const [readyMessage, setReadyMessage] = React.useState(false);
  const timerRef = React.useRef(null);
  const persistedPresetRef = React.useRef(null);
  React.useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // Build the package for the current preset (pure; recomputed on change).
  const pkg = React.useMemo(
    () => (project ? buildRenderPackage(project, preset) : null),
    [project, preset]
  );

  // Persist the finalized package once per preset choice (parent decides how;
  // the panel itself never writes). Safe to skip silently when unsupported.
  React.useEffect(() => {
    if (!project || !pkg) return;
    if (persistedPresetRef.current === preset) return;
    persistedPresetRef.current = preset;
    if (typeof onPersistPackage === 'function') onPersistPackage(project, pkg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project && project.id, preset]);

  if (!project || !pkg) return null;

  const state = getMediaState(project);

  const copyText = (key, text) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof text === 'string') {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopiedKey(null), 1800);
      }
    } catch (e) {
      console.warn('[render-prompt] clipboard unavailable', e);
    }
  };

  const markReady = () => {
    if (typeof onMarkReady === 'function') {
      onMarkReady(project);
      setReadyMessage(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setReadyMessage(false), 2200);
    }
  };

  const settingsRows = [
    [RENDER_FINALIZER_HE.settingAspect, pkg.recommendedAspectRatio],
    [RENDER_FINALIZER_HE.settingCount, String(pkg.recommendedOutputCount)],
    [
      RENDER_FINALIZER_HE.settingQuality,
      pkg.recommendedQuality === 'high' ? RENDER_FINALIZER_HE.qualityHigh : pkg.recommendedQuality,
    ],
    [RENDER_FINALIZER_HE.settingTool, mediaToolHe(pkg.suggestedTool)],
  ];

  return (
    <div style={styles.backdrop} onClick={onClose} role="presentation">
      <div
        style={styles.panel}
        dir="rtl"
        role="dialog"
        aria-label={RENDER_PANEL_HE.title}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.head}>
          <div style={styles.headText}>
            <span style={styles.title}>{RENDER_PANEL_HE.title}</span>
            <span style={styles.subtitle}>{pkg.title}</span>
          </div>
          <button type="button" onClick={onClose} style={styles.closeBtn}>
            {RENDER_PANEL_HE.close}
          </button>
        </div>

        <div style={styles.body}>
          {/* Hebrew one-line summary of what was prepared */}
          <p style={styles.summaryLine}>{pkg.promptHebrewSummary}</p>

          {/* Presets — secondary; default pre-selected, result already shown */}
          <section style={styles.section}>
            <span style={styles.presetLabel}>{RENDER_PANEL_HE.presetLabel}</span>
            <div style={styles.chipRow}>
              {RENDER_PRESET_VALUES.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setPreset(v)}
                  style={{ ...styles.chip, ...(preset === v ? styles.chipActive : null) }}
                >
                  {renderPresetHe(v)}
                </button>
              ))}
            </div>
          </section>

          {/* מה המערכת הבינה */}
          <section style={styles.section}>
            <span style={styles.sectionTitle}>{RENDER_PANEL_HE.sectionUnderstood}</span>
            <div style={styles.understoodBox}>
              {pkg.sourceContextSummary.map((line) => (
                <span key={line} style={styles.understoodLine}>
                  • {line}
                </span>
              ))}
            </div>
          </section>

          {/* פרומפט סופי להדמיה */}
          <section style={styles.section}>
            <div style={styles.sectionHead}>
              <span style={styles.sectionTitle}>{RENDER_PANEL_HE.sectionPrompt}</span>
              <button
                type="button"
                onClick={() => copyText('prompt', pkg.finalPromptEnglish)}
                style={styles.copyBtn}
              >
                {copiedKey === 'prompt' ? RENDER_PANEL_HE.copied : RENDER_PANEL_HE.copyPrompt}
              </button>
            </div>
            <pre style={styles.textBlockEn} dir="ltr">
              {pkg.finalPromptEnglish}
            </pre>
          </section>

          {/* Negative Prompt */}
          <section style={styles.section}>
            <div style={styles.sectionHead}>
              <span style={styles.sectionTitle}>{RENDER_PANEL_HE.sectionNegative}</span>
              <button
                type="button"
                onClick={() => copyText('negative', pkg.negativePromptEnglish)}
                style={styles.copyBtn}
              >
                {copiedKey === 'negative' ? RENDER_PANEL_HE.copied : RENDER_PANEL_HE.copyNegative}
              </button>
            </div>
            <pre style={styles.textBlockEn} dir="ltr">
              {pkg.negativePromptEnglish}
            </pre>
          </section>

          {/* הגדרות מומלצות */}
          <section style={styles.section}>
            <span style={styles.sectionTitle}>{RENDER_PANEL_HE.sectionSettings}</span>
            <div style={styles.settingsGrid}>
              {settingsRows.map(([label, value]) => (
                <div key={label} style={styles.settingRow}>
                  <span style={styles.settingLabel}>{label}</span>
                  <span style={styles.settingValue}>{value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* מה חסר לשיפור התוצאה */}
          <section style={styles.section}>
            <span style={styles.sectionTitle}>{RENDER_PANEL_HE.sectionMissing}</span>
            {pkg.warnings.length === 0 ? (
              <p style={styles.missingNone}>{RENDER_PANEL_HE.missingNone}</p>
            ) : (
              <div style={styles.warnBox}>
                {pkg.warnings.map((w) => (
                  <span key={w} style={styles.warnLine}>
                    • {w}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Actions */}
          <div style={styles.actionsRow}>
            <button type="button" onClick={markReady} style={styles.readyBtn}>
              {RENDER_PANEL_HE.markReady}
            </button>
            <button type="button" onClick={onClose} style={styles.mediaBtn}>
              {RENDER_PANEL_HE.openMedia}
            </button>
            {readyMessage ? (
              <span style={styles.readyMessage}>{RENDER_PANEL_HE.markedReady}</span>
            ) : (
              <span style={styles.statusInfo}>
                {RENDER_PANEL_HE.statusPrefix}: {mediaStatusHe(state.mediaStatus)}
              </span>
            )}
          </div>

          <span style={styles.prepNote}>{RENDER_PANEL_HE.prepNote}</span>
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
    zIndex: 70, // above the Media Workflow panel (60)
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
    gap: '15px',
    padding: '14px 16px 18px',
    overflowY: 'auto',
    minHeight: 0,
  },
  summaryLine: {
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
  presetLabel: {
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    fontWeight: 700,
    color: tokens.color.inkSoft,
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
  understoodBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    padding: '9px 12px',
    borderRadius: tokens.radius.sm,
    border: `1px solid ${tokens.color.goldFaint}`,
    background: tokens.color.pearl,
  },
  understoodLine: {
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
  settingsGrid: { display: 'flex', flexDirection: 'column', gap: '4px' },
  settingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    padding: '6px 12px',
    borderRadius: tokens.radius.sm,
    border: `1px solid ${tokens.color.goldFaint}`,
    background: '#FFFFFF',
  },
  settingLabel: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 700,
    color: tokens.color.inkSoft,
  },
  settingValue: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    direction: 'ltr',
  },
  missingNone: {
    margin: 0,
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.inkFaint,
  },
  warnBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    padding: '9px 12px',
    borderRadius: tokens.radius.sm,
    border: `1px solid ${tokens.color.gold}`,
    background: tokens.color.goldFaint,
  },
  warnLine: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    lineHeight: 1.6,
    color: tokens.color.charcoal,
  },
  actionsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  readyBtn: {
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
    border: `1px solid ${tokens.color.gold}`,
    background: 'transparent',
    color: tokens.color.charcoal,
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  readyMessage: {
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    fontWeight: 700,
    color: tokens.color.gold,
  },
  statusInfo: {
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    color: tokens.color.inkSoft,
  },
  prepNote: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    color: tokens.color.inkFaint,
  },
};
