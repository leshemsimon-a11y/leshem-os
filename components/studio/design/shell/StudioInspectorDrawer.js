// components/studio/design/shell/StudioInspectorDrawer.js
//
// Clean 5D — right inspector drawer. A professional inspector panel (not a long
// report) for the selected design direction: title, compact preview, a short
// set of icon rows, then collapsed detail sections.
//
// Read-only. It reads the already-computed selected concept and (when present)
// the generated output. It performs NO generation and owns NO mutations — all
// of that stays in the existing panels. Closed-by-default sections keep it calm.

import * as React from 'react';
import { tokens } from '../../shared/tokens';
import { STUDIO_5D_HE, CONCEPT_HE } from '../../../../lib/studio/labels';
import {
  CenterStoneIcon,
  SideStoneIcon,
  MetalIcon,
  SettingIcon,
  StyleIcon,
  FeasibilityIcon,
  ChevronIcon,
} from './StudioIcons';

function Row({ Icon, label, value }) {
  if (!value || !String(value).trim()) return null;
  return (
    <div style={styles.row} dir="rtl">
      <span style={styles.rowIcon} aria-hidden="true">
        <Icon size={18} />
      </span>
      <span style={styles.rowText}>
        <span style={styles.rowLabel}>{label}</span>
        <span style={styles.rowValue}>{value}</span>
      </span>
    </div>
  );
}

function Section({ title, body, items, defaultOpen = false }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const hasBody = body && String(body).trim();
  const hasItems = Array.isArray(items) && items.length > 0;
  if (!hasBody && !hasItems) return null;
  return (
    <div style={styles.section} dir="rtl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={styles.sectionHead}
        aria-expanded={open}
      >
        <span style={styles.sectionTitle}>{title}</span>
        <span style={{ ...styles.chev, transform: open ? 'rotate(90deg)' : 'rotate(-90deg)' }}>
          <ChevronIcon size={16} />
        </span>
      </button>
      {open && (
        <div style={styles.sectionBody}>
          {hasBody ? <p style={styles.sectionText}>{body}</p> : null}
          {hasItems ? (
            <ul style={styles.list}>
              {items.map((it, i) => (
                <li key={i} style={styles.listItem}>
                  {it}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function StudioInspectorDrawer({ concept, output }) {
  const L = STUDIO_5D_HE;

  if (!concept) {
    return (
      <aside style={styles.drawer} dir="rtl">
        <span style={styles.drawerTitle}>{L.inspectorTitle}</span>
        <p style={styles.empty}>{L.inspectorEmpty}</p>
      </aside>
    );
  }

  // Prefer richer output data when an output exists; fall back to concept text.
  const centerVal = output && output.stoneSummary ? output.stoneSummary : concept.stoneLayout;
  const metalVal = output && output.metalSummary ? output.metalSummary : concept.metalSuggestion;
  const settingVal = concept.designStructure;
  const styleVal = concept.recommendedUse;
  const feasibilityVal =
    output && output.productionNotes ? output.productionNotes : concept.productionNotes;

  return (
    <aside style={styles.drawer} dir="rtl">
      <div style={styles.head}>
        <span style={styles.drawerTitle}>{L.inspectorTitle}</span>
        <span style={styles.conceptName}>{concept.conceptName}</span>
        {concept.shortDescription ? (
          <p style={styles.preview}>{concept.shortDescription}</p>
        ) : null}
      </div>

      <div style={styles.rows}>
        <Row Icon={CenterStoneIcon} label={L.rows.centerStone} value={centerVal} />
        <Row Icon={SideStoneIcon} label={L.rows.sideStones} value={output ? output.stoneSummary : null} />
        <Row Icon={MetalIcon} label={L.rows.metal} value={metalVal} />
        <Row Icon={SettingIcon} label={L.rows.setting} value={settingVal} />
        <Row Icon={StyleIcon} label={L.rows.style} value={styleVal} />
        <Row Icon={FeasibilityIcon} label={L.rows.feasibility} value={feasibilityVal} />
      </div>

      {output ? (
        <div style={styles.sections}>
          <Section title={L.sections.designLogic} body={output.internalDesignSummary} />
          <Section title={L.sections.stoneUsage} body={output.stoneSummary} />
          <Section title={L.sections.materials} body={output.materialsSummary} />
          <Section title={L.sections.production} body={output.productionNotes} />
          <Section title={L.sections.assumptions} items={output.assumptions} />
          <Section title={L.sections.nextSteps} items={output.nextSteps} />
        </div>
      ) : (
        <div style={styles.sections}>
          <Section title={L.sections.designLogic} body={concept.designStructure} />
          <Section title={L.sections.stoneUsage} body={concept.stoneLayout} />
        </div>
      )}
    </aside>
  );
}

const styles = {
  drawer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.lg,
    boxShadow: tokens.shadow.soft,
    padding: '16px',
    minWidth: 0,
  },
  head: { display: 'flex', flexDirection: 'column', gap: '4px' },
  drawerTitle: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: tokens.color.gold,
  },
  conceptName: {
    fontFamily: tokens.font.display,
    fontWeight: 700,
    fontSize: '18px',
    color: tokens.color.charcoal,
  },
  preview: {
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    lineHeight: 1.55,
    color: tokens.color.inkSoft,
    margin: 0,
  },
  empty: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    color: tokens.color.inkFaint,
    margin: 0,
  },
  rows: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    borderTop: `1px solid ${tokens.color.cardEdge}`,
    paddingTop: '12px',
  },
  row: { display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '7px 0' },
  rowIcon: { display: 'inline-flex', color: tokens.color.ice, marginTop: '1px', flexShrink: 0 },
  rowText: { display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 },
  rowLabel: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 700,
    color: tokens.color.inkFaint,
  },
  rowValue: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    lineHeight: 1.45,
    color: tokens.color.charcoal,
  },
  sections: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    borderTop: `1px solid ${tokens.color.cardEdge}`,
    paddingTop: '12px',
  },
  section: {
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.sm,
    overflow: 'hidden',
  },
  sectionHead: {
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    padding: '10px 12px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'right',
  },
  sectionTitle: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  chev: { display: 'inline-flex', color: tokens.color.inkFaint, transition: 'transform 120ms' },
  sectionBody: {
    padding: '2px 12px 12px',
    borderTop: `1px solid ${tokens.color.cardEdge}`,
  },
  sectionText: {
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
    margin: '8px 0 0',
  },
  list: { margin: '8px 0 0', paddingInlineStart: '18px' },
  listItem: {
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
    marginBottom: '4px',
  },
};
