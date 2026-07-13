// components/studio/shared/AdvisorPanel.js
// Clean 8K QA: compact, progressive-disclosure jewelry advisor.

import * as React from 'react';
import { reset } from '../design/shell/studioResetStyle';

export const ADVISOR_HE = Object.freeze({
  title: 'מבט מקצועי',
  understanding: 'מה הבנתי',
  recommendation: 'המלצת המעצב',
  nextStep: 'הצעד הבא',
  details: 'הצג נימוק',
  collapse: 'הסתר',
  goAction: 'נמשיך',
});

export default function AdvisorPanel({ insight, onNextStep }) {
  const [open, setOpen] = React.useState(false);
  if (!insight) return null;
  const canAct = typeof onNextStep === 'function' && Boolean(insight.nextStepTarget);

  return (
    <section style={styles.panel} dir="rtl" aria-label={ADVISOR_HE.title}>
      <div style={styles.head}>
        <span style={styles.title}>{ADVISOR_HE.title}</span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={styles.detailsBtn}
          aria-expanded={open}
        >
          {open ? ADVISOR_HE.collapse : ADVISOR_HE.details}
        </button>
      </div>

      <div style={styles.nextRow}>
        <span style={styles.nextText}>{insight.nextStepHe}</span>
        {canAct ? (
          <button type="button" onClick={() => onNextStep(insight.nextStepTarget)} style={styles.goBtn}>
            {ADVISOR_HE.goAction}
          </button>
        ) : null}
      </div>

      {open ? (
        <div style={styles.details}>
          <div style={styles.row}>
            <span style={styles.label}>{ADVISOR_HE.understanding}</span>
            <span style={styles.text}>{insight.understandingHe}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>{ADVISOR_HE.recommendation}</span>
            <span style={styles.text}>{insight.recommendationHe}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>{ADVISOR_HE.nextStep}</span>
            <span style={styles.text}>{insight.nextStepHe}</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}

const styles = {
  panel: {
    padding: '9px 11px',
    background: reset.color.panel,
    border: `1px solid ${reset.color.border}`,
    borderRadius: reset.radius.md,
  },
  head: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    marginBottom: '6px',
  },
  title: {
    fontFamily: reset.font.body,
    fontSize: '11px',
    fontWeight: 800,
    color: reset.color.textMuted,
  },
  detailsBtn: {
    border: 'none',
    background: 'transparent',
    color: reset.color.textMuted,
    fontFamily: reset.font.body,
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
    padding: 0,
  },
  nextRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  nextText: {
    flex: '1 1 auto',
    minWidth: 0,
    fontFamily: reset.font.body,
    fontSize: '12.5px',
    fontWeight: 600,
    color: reset.color.text,
    lineHeight: 1.45,
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
    marginTop: '9px',
    paddingTop: '9px',
    borderTop: `1px solid ${reset.color.border}`,
  },
  row: { display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' },
  label: {
    fontFamily: reset.font.body,
    fontSize: '10.5px',
    fontWeight: 800,
    color: reset.color.textMuted,
    whiteSpace: 'nowrap',
  },
  text: {
    flex: '1 1 auto',
    minWidth: 0,
    fontFamily: reset.font.body,
    fontSize: '12px',
    fontWeight: 500,
    color: reset.color.text,
    lineHeight: 1.45,
  },
  goBtn: {
    minHeight: '28px',
    padding: '4px 12px',
    borderRadius: reset.radius.sm,
    border: 'none',
    background: reset.color.primaryBg,
    color: reset.color.primaryText,
    fontFamily: reset.font.body,
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
};
