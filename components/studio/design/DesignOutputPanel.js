// components/studio/design/DesignOutputPanel.js
//
// LESHEM.S OS — Design Output Panel (Clean 5B — Practical Output Layer)
//
// The "פלט עיצוב" section of the Design Studio, shown right after the Design
// Core. It turns the SELECTED design concept (+ brief + tray) into a single
// structured output that reads as a Design Result / Client Preview / Render
// Brief / internal production summary.
//
//   • If no concept is selected → a gentle hint to pick a direction first.
//   • If a concept is selected → "צור פלט עיצוב" generates the output locally.
//   • The output renders in clean sections (Part 3 order).
//   • "שמור פלט לעבודה" / "עדכן פלט קיים" persist it on the brief, which already
//     flows into Active Work / Design Projects and survives refresh.
//
// Local only: reads the live Work Tray + brief stores, builds the output via
// the pure generator, and writes it back to the brief store. NO external AI,
// NO render/image generation, NO pricing, NO PDF, NO Airtable, no new packages.

import * as React from 'react';
import { tokens } from '../shared/tokens';
import { OUTPUT_HE, FLOW_HE } from '../../../lib/studio/labels';
import {
  getSelectedConcept,
  getActiveOutput,
  buildDesignSnapshot,
  outputIsStale,
} from '../../../lib/studio/designDraft';
import { createUseWorkTray } from '../../../lib/studio/workTray';
import {
  createUseDesignBrief,
  addOutput as persistOutput,
  updateOutput as persistOutputUpdate,
  updateOutputNotes as persistOutputNotes,
} from '../../../lib/studio/designBriefStore';
import { generateOutput, regenerateOutputBody } from '../../../lib/studio/designOutputs';
import { getActiveWorkId } from '../../../lib/studio/activeWorkStore';
import { updateProject } from '../../../lib/studio/designProjects';

const useWorkTray = createUseWorkTray(React);
const useDesignBrief = createUseDesignBrief(React);

// A single text section.
function Section({ title, children }) {
  return (
    <div style={styles.section} dir="rtl">
      <span style={styles.sectionTitle}>{title}</span>
      {children}
    </div>
  );
}

function TextSection({ title, body }) {
  if (!body || !body.trim()) return null;
  return (
    <Section title={title}>
      <p style={styles.body}>{body}</p>
    </Section>
  );
}

function ListSection({ title, items }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <Section title={title}>
      <ul style={styles.list}>
        {items.map((it, i) => (
          <li key={i} style={styles.listItem}>
            {it}
          </li>
        ))}
      </ul>
    </Section>
  );
}

function OutputView({ output }) {
  const S = OUTPUT_HE.sections;
  return (
    <div style={styles.outputCard} dir="rtl">
      <div style={styles.outputHead}>
        <span style={styles.outputTitle}>{output.clientFacingTitle || output.outputTitle}</span>
      </div>

      <TextSection title={S.clientDescription} body={output.clientDescription} />
      <TextSection title={S.internalDesignSummary} body={output.internalDesignSummary} />

      <Section title={S.materials}>
        <p style={styles.body}>{output.materialsSummary}</p>
        {output.stoneSummary && output.stoneSummary.trim() ? (
          <p style={styles.bodyMuted}>{output.stoneSummary}</p>
        ) : null}
        {output.metalSummary && output.metalSummary.trim() ? (
          <p style={styles.bodyMuted}>{output.metalSummary}</p>
        ) : null}
        {output.sourceContext && output.sourceContext.trim() ? (
          <p style={styles.sourceLine}>{output.sourceContext}</p>
        ) : null}
      </Section>

      <TextSection title={S.renderBrief} body={output.renderBrief} />
      <TextSection title={S.productionNotes} body={output.productionNotes} />
      <ListSection title={S.assumptions} items={output.assumptions} />
      <ListSection title={S.nextSteps} items={output.nextSteps} />
    </div>
  );
}

export default function DesignOutputPanel({ onToast } = {}) {
  const tray = useWorkTray();
  const briefStore = useDesignBrief();

  if (!tray.hydrated || !briefStore.hydrated) {
    return <div style={styles.loading}>טוען פלט עיצוב…</div>;
  }

  const brief = briefStore.brief;
  const concept = getSelectedConcept(brief);
  const activeOutput = getActiveOutput(brief);
  const stale = outputIsStale(brief, tray.items);
  const toast = (m) => {
    if (typeof onToast === 'function') onToast(m);
  };

  // Keep the selected output in sync with the currently-open Active Work when
  // one exists. This mirrors DesignConceptPanel and avoids a subtle 5B issue:
  // local brief output was saved, but an already-open project did not receive
  // the new output until the user manually saved the project again.
  const syncActiveWork = (nextBrief) => {
    try {
      const activeProjectId = getActiveWorkId();
      if (!activeProjectId) return;
      updateProject(activeProjectId, {
        trayItems: tray.items || [],
        brief: nextBrief,
        snapshot: buildDesignSnapshot(tray.items || [], nextBrief),
      });
    } catch (e) {
      console.warn('[designOutputs] active work sync skipped.', e);
    }
  };

  // No selected concept → cannot produce a meaningful output yet.
  if (!concept) {
    return (
      <div style={styles.wrap} dir="rtl">
        <p style={styles.localNote}>{OUTPUT_HE.localNote}</p>
        <div style={styles.needConcept}>
          <span style={styles.needMark} aria-hidden="true">
            ✦
          </span>
          <span style={styles.needText}>{OUTPUT_HE.needConcept}</span>
        </div>
      </div>
    );
  }

  const handleGenerate = () => {
    const out = generateOutput(tray.items, brief);
    if (!out) return;
    const nextBrief = persistOutput(out);
    syncActiveWork(nextBrief);
    toast(FLOW_HE.toast.outputSaved);
  };

  const handleUpdateExisting = () => {
    if (!activeOutput) return;
    const body = regenerateOutputBody(tray.items, brief);
    if (!body) return;
    const nextBrief = persistOutputUpdate(activeOutput.outputId, body);
    syncActiveWork(nextBrief);
    toast(OUTPUT_HE.updatedToastCalm);
  };

  const handleOutputNotes = (outputId, notes) => {
    const nextBrief = persistOutputNotes(outputId, notes);
    syncActiveWork(nextBrief);
  };

  const handleSaveToWork = () => {
    syncActiveWork(briefStore.brief);
    toast(OUTPUT_HE.savedToastCalm);
  };

  const hasOutput = Boolean(activeOutput);
  const statusCopy = hasOutput
    ? { t: OUTPUT_HE.status.savedTitle, b: OUTPUT_HE.status.savedBody, ready: true }
    : { t: OUTPUT_HE.status.emptyTitle, b: OUTPUT_HE.status.emptyBody, ready: false };

  return (
    <div style={styles.wrap} dir="rtl">
      <p style={styles.localNote}>{OUTPUT_HE.localNote}</p>

      <div style={styles.actionsTop}>
        <button type="button" onClick={handleGenerate} style={styles.primaryBtn}>
          {hasOutput ? OUTPUT_HE.regenerate : OUTPUT_HE.generate}
        </button>
        {hasOutput && (
          <button type="button" onClick={handleUpdateExisting} style={styles.secondaryBtn}>
            {OUTPUT_HE.updateExisting}
          </button>
        )}
      </div>

      {hasOutput && stale && (
        <div style={styles.staleBanner} dir="rtl">
          <div style={styles.staleText}>
            <span style={styles.staleTitle}>{OUTPUT_HE.staleTitle}</span>
            <span style={styles.staleBody}>{OUTPUT_HE.staleBody}</span>
          </div>
          <button type="button" onClick={handleUpdateExisting} style={styles.staleBtn}>
            {OUTPUT_HE.updateOutput}
          </button>
        </div>
      )}

      <div
        style={{
          ...styles.statusStrip,
          ...(statusCopy.ready ? styles.statusReady : styles.statusPending),
        }}
      >
        <span
          style={{
            ...styles.statusDot,
            background: statusCopy.ready ? tokens.color.gold : tokens.color.goldSoft,
          }}
          aria-hidden="true"
        />
        <div style={styles.statusText}>
          <span style={styles.statusTitle}>{statusCopy.t}</span>
          <span style={styles.statusBody}>{statusCopy.b}</span>
        </div>
      </div>

      {hasOutput && (
        <>
          <OutputView output={activeOutput} />

          <div style={styles.field}>
            <span style={styles.fieldLabel}>{OUTPUT_HE.notesLabel}</span>
            <textarea
              value={activeOutput.outputNotes || ''}
              onChange={(e) => handleOutputNotes(activeOutput.outputId, e.target.value)}
              placeholder={OUTPUT_HE.notesPlaceholder}
              style={styles.textarea}
              rows={2}
              dir="rtl"
            />
          </div>

          <div style={styles.actionsBottom}>
            <button type="button" onClick={handleSaveToWork} style={styles.secondaryBtn}>
              {OUTPUT_HE.saveToWork}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '16px' },
  staleBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '10px',
    padding: '12px 14px',
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.gold}`,
    borderRadius: tokens.radius.md,
  },
  staleText: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  staleTitle: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  staleBody: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    lineHeight: 1.55,
    color: tokens.color.inkSoft,
  },
  staleBtn: {
    minHeight: '44px',
    padding: '10px 18px',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.gold}`,
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  loading: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    color: tokens.color.inkFaint,
    padding: '12px 0',
  },
  localNote: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.goldFaint}`,
    borderRadius: tokens.radius.sm,
    padding: '8px 12px',
    margin: 0,
  },
  needConcept: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: tokens.color.pearl,
    border: `1px dashed ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    padding: '16px',
  },
  needMark: { fontSize: '18px', color: tokens.color.goldSoft },
  needText: { fontFamily: tokens.font.body, fontSize: '14px', color: tokens.color.inkSoft },
  actionsTop: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  actionsBottom: { display: 'flex', flexWrap: 'wrap', gap: '10px', paddingTop: '2px' },
  primaryBtn: {
    minHeight: '52px',
    padding: '14px 28px',
    fontFamily: tokens.font.body,
    fontSize: '16px',
    fontWeight: 700,
    color: tokens.color.ivory,
    background: tokens.color.charcoal,
    border: 'none',
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
    boxShadow: tokens.shadow.soft,
  },
  secondaryBtn: {
    minHeight: '48px',
    padding: '12px 22px',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.color.charcoal,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
  },
  statusStrip: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: tokens.radius.md,
  },
  statusPending: { background: tokens.color.pearl, border: `1px solid ${tokens.color.goldFaint}` },
  statusReady: { background: tokens.color.sageFaint, border: `1px solid ${tokens.color.sage}` },
  statusDot: { width: '10px', height: '10px', borderRadius: '50%', marginTop: '5px', flexShrink: 0 },
  statusText: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  statusTitle: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  statusBody: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
  },
  outputCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '18px',
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    boxShadow: tokens.shadow.soft,
  },
  outputHead: { borderBottom: `1px solid ${tokens.color.cardEdge}`, paddingBottom: '10px' },
  outputTitle: {
    fontFamily: tokens.font.display,
    fontWeight: 700,
    fontSize: '20px',
    color: tokens.color.charcoal,
  },
  section: { display: 'flex', flexDirection: 'column', gap: '6px' },
  sectionTitle: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    color: tokens.color.gold,
  },
  body: {
    fontFamily: tokens.font.body,
    fontSize: '15px',
    lineHeight: 1.65,
    color: tokens.color.charcoal,
    margin: 0,
  },
  bodyMuted: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
    margin: 0,
  },
  sourceLine: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.goldFaint}`,
    borderRadius: tokens.radius.sm,
    padding: '6px 10px',
    margin: '2px 0 0',
  },
  list: { margin: 0, paddingInlineStart: '20px', display: 'flex', flexDirection: 'column', gap: '4px' },
  listItem: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    lineHeight: 1.6,
    color: tokens.color.charcoal,
  },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  fieldLabel: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    color: tokens.color.inkSoft,
  },
  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: tokens.font.body,
    fontSize: '15px',
    lineHeight: 1.6,
    color: tokens.color.ink,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    padding: '12px 14px',
    resize: 'vertical',
    outline: 'none',
  },
};
