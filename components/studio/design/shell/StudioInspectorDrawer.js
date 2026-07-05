// components/studio/design/shell/StudioInspectorDrawer.js
//
// LESHEM.S OS — Design Studio Layout Reset — Zone 4: Right Inspector.
//
// Detailed data only when needed:
//   • Concept selected  → title, compact icon rows, then collapsed detail
//     sections (design logic / stone usage / materials / production /
//     assumptions / next steps). Unchanged behavior from Clean 5D — this
//     branch is read-only, reads the already-computed selected concept and
//     (when present) the generated output, performs NO generation and owns
//     NO mutations.
//   • Stone selected, no concept yet → compact rows + source/status +ONE
//     collapsed "advanced details" section. Generalized (Studio Layout
//     Reset) to work for BOTH a real Work Tray selection and a Demo
//     Operating Layer stone, via the shared read-only view-model in
//     ./stoneView.js — previously this branch only handled demo stones.
//   • Nothing selected → a clean, short empty state.
//
// Studio Layout Reset (Clean 5D-R4) changes, visual/structural only:
//   • Palette relit to near-white/graphite (./studioResetStyle.js).
//   • The 4 demo-only action buttons (Send to Work Tray / Start Design /
//     Create Report / Open Asset) that lived here are REMOVED from this
//     panel — they were always inert placeholders (no onClick handler was
//     ever wired to them) and the same actions now live, properly wired,
//     on the new Zone 2 left stone panel (StudioStonePanel.js). No
//     functioning behavior is removed: these buttons never functioned.
//   • The optional primaryLabel/primaryDisabled/onPrimary CTA this component
//     could render was never invoked by the shell (StudioShell.js never
//     passed those props), so it never rendered in the live app. Removed as
//     dead code; the one dominant primary CTA remains solely in the bottom
//     strip, unchanged.

import * as React from 'react';
import { STUDIO_5D_HE, DESIGN_HE, USABILITY_D_HE } from '../../../../lib/studio/labels';
// Patch D — multi-stone session summary via the EXISTING summarizeDraft
// export (no designDraft internals touched).
import { summarizeDraft } from '../../../../lib/studio/designDraft';
import { buildStoneCore, buildStoneAdvanced } from './stoneView';
import {
  CenterStoneIcon,
  SideStoneIcon,
  MetalIcon,
  SettingIcon,
  StyleIcon,
  FeasibilityIcon,
  ChevronIcon,
} from './StudioIcons';
import { reset } from './studioResetStyle';

function Row({ Icon, label, value }) {
  if (!value || !String(value).trim()) return null;
  return (
    <div style={styles.row} dir="rtl">
      <span style={styles.rowIcon} aria-hidden="true">
        <Icon size={16} />
      </span>
      <span style={styles.rowText}>
        <span style={styles.rowLabel}>{label}</span>
        <span style={styles.rowValue}>{value}</span>
      </span>
    </div>
  );
}

function CompactRow({ label, value }) {
  return (
    <div style={styles.compactRow} dir="rtl">
      <span style={styles.compactRowLabel}>{label}</span>
      <span style={styles.compactRowValue} title={value}>
        {value}
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
        aria-label={open ? STUDIO_5D_HE.aria.closeSection : STUDIO_5D_HE.aria.openSection}
      >
        <span style={styles.sectionTitle}>{title}</span>
        <span style={{ ...styles.chev, transform: open ? 'rotate(90deg)' : 'rotate(-90deg)' }}>
          <ChevronIcon size={14} />
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

export default function StudioInspectorDrawer({
  concept,
  output,
  selectedItem,
  selectedDemoStone,
  demoMode,
  // Patch D — the full work-session tray list, for the multi-stone summary.
  // Optional and read-only; older callers that omit it lose only the summary.
  trayItems,
}) {
  const L = STUDIO_5D_HE;

  // Stone-selected state (no design direction chosen yet).
  //
  // Patch D — de-duplication: the ACTIVE stone's image + core rows already
  // live on the LEFT panel (StudioStonePanel, via the same buildStoneCore
  // view-model). This drawer no longer repeats that card. It is now
  // DETAILS-focused:
  //   • work-session summary — total stones + per-role counts (multi-stone
  //     awareness, computed with the existing summarizeDraft export and
  //     rendered with the existing DESIGN_HE.summary Hebrew labels)
  //   • the active stone by NAME only (one compact row, no image)
  //   • advanced gem details, collapsed (existing buildStoneAdvanced)
  // The shared stoneView view-model is unchanged; only what THIS panel
  // chooses to render changed.
  if (!concept && (selectedItem || selectedDemoStone)) {
    const core = buildStoneCore(selectedItem, selectedDemoStone);
    const advanced = buildStoneAdvanced(selectedDemoStone);

    if (!core) {
      return (
        <aside style={styles.drawer} dir="rtl">
          <div style={styles.scroll}>
            <span style={styles.drawerTitle}>{L.inspectorTitle}</span>
            <p style={styles.empty}>{L.inspectorEmpty}</p>
          </div>
        </aside>
      );
    }

    const summary = summarizeDraft(Array.isArray(trayItems) ? trayItems : []);
    const summaryRows = [
      { key: 'total', label: DESIGN_HE.summary.totalStones, value: summary.total },
      { key: 'center', label: DESIGN_HE.summary.centerStones, value: summary.centerStoneCount },
      { key: 'side', label: DESIGN_HE.summary.sideStones, value: summary.sideStoneCount },
      { key: 'accent', label: DESIGN_HE.summary.accentStones, value: summary.accentStoneCount },
      { key: 'pairs', label: DESIGN_HE.summary.pairs, value: summary.pairCount },
      { key: 'parcels', label: DESIGN_HE.summary.parcels, value: summary.parcelCount },
      { key: 'components', label: DESIGN_HE.summary.components, value: summary.componentCount },
      { key: 'unassigned', label: DESIGN_HE.summary.unassigned, value: summary.unassigned },
    ].filter((r) => r.key === 'total' || r.value > 0);

    return (
      <aside style={styles.drawer} dir="rtl">
        <div style={styles.scroll}>
          <div style={styles.head}>
            <span style={styles.drawerTitle}>{USABILITY_D_HE.sessionDetailsTitle}</span>
          </div>

          {summary.total > 0 && (
            <div style={styles.compactRows}>
              {summaryRows.map((r) => (
                <CompactRow key={r.key} label={r.label} value={String(r.value)} />
              ))}
            </div>
          )}

          <div style={styles.compactRows}>
            <CompactRow label={USABILITY_D_HE.activeStoneLabel} value={core.title} />
          </div>

          {advanced.length > 0 && (
            <div style={styles.sections}>
              <Section title={L.advancedStoneDetails} items={advanced.map((a) => `${a.label}: ${a.value}`)} />
            </div>
          )}
        </div>
      </aside>
    );
  }

  if (!concept) {
    return (
      <aside style={styles.drawer} dir="rtl">
        <div style={styles.scroll}>
          <span style={styles.drawerTitle}>{L.inspectorTitle}</span>
          <p style={styles.empty}>{L.inspectorEmpty}</p>
        </div>
      </aside>
    );
  }

  // Concept-selected state — unchanged data/logic, visual-only pass.
  // Prefer richer output data when an output exists; fall back to concept text.
  const centerVal = output && output.stoneSummary ? output.stoneSummary : concept.stoneLayout;
  const metalVal = output && output.metalSummary ? output.metalSummary : concept.metalSuggestion;
  const settingVal = concept.designStructure;
  const styleVal = concept.recommendedUse;
  const feasibilityVal =
    output && output.productionNotes ? output.productionNotes : concept.productionNotes;

  return (
    <aside style={styles.drawer} dir="rtl">
      <div style={styles.scroll}>
        <div style={styles.head}>
          <span style={styles.drawerTitle}>{L.inspectorTitle}</span>
          <span style={styles.conceptName} title={concept.shortDescription || undefined}>
            {concept.conceptName}
          </span>
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
      </div>
    </aside>
  );
}

const styles = {
  drawer: {
    display: 'flex',
    flexDirection: 'column',
    background: reset.color.panel,
    border: `1px solid ${reset.color.border}`,
    borderRadius: reset.radius.lg,
    minWidth: 0,
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
  },
  scroll: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '16px',
    overflowY: 'auto',
    flex: 1,
    minHeight: 0,
  },
  demoPill: {
    position: 'absolute',
    top: '6px',
    insetInlineEnd: '6px',
    display: 'inline-flex',
    height: '20px',
    alignItems: 'center',
    padding: '0 8px',
    borderRadius: reset.radius.xs,
    background: reset.color.panel,
    border: `1px solid ${reset.color.border}`,
    color: reset.color.textMuted,
    fontFamily: reset.font.body,
    fontSize: '9px',
    fontWeight: 700,
    letterSpacing: '0.06em',
  },
  demoImageWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: '1 / 1',
    borderRadius: reset.radius.md,
    overflow: 'hidden',
    background: reset.color.page,
    border: `1px solid ${reset.color.border}`,
  },
  demoImage: { width: '100%', height: '100%', objectFit: 'contain', display: 'block' },
  demoBadges: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  demoBadgeText: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: '22px',
    padding: '0 9px',
    borderRadius: reset.radius.xs,
    background: reset.color.page,
    border: `1px solid ${reset.color.border}`,
    color: reset.color.textMuted,
    fontFamily: reset.font.body,
    fontSize: '10.5px',
    fontWeight: 700,
  },
  compactRows: {
    display: 'flex',
    flexDirection: 'column',
    borderTop: `1px solid ${reset.color.border}`,
  },
  compactRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '10px',
    padding: '8px 0',
    borderBottom: `1px solid ${reset.color.border}`,
  },
  compactRowLabel: {
    fontFamily: reset.font.body,
    fontSize: '10.5px',
    fontWeight: 700,
    color: reset.color.textFaint,
    flexShrink: 0,
  },
  compactRowValue: {
    fontFamily: reset.font.body,
    fontSize: '12.5px',
    fontWeight: 600,
    color: reset.color.text,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  head: { display: 'flex', flexDirection: 'column', gap: '5px' },
  drawerTitle: {
    fontFamily: reset.font.body,
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.14em',
    color: reset.color.textFaint,
  },
  conceptName: {
    fontFamily: reset.font.display,
    fontWeight: 700,
    fontSize: '17px',
    color: reset.color.text,
    lineHeight: 1.2,
  },
  empty: {
    fontFamily: reset.font.body,
    fontSize: '13px',
    lineHeight: 1.6,
    color: reset.color.textFaint,
    margin: 0,
  },
  rows: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    borderTop: `1px solid ${reset.color.border}`,
    paddingTop: '14px',
  },
  row: { display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 0' },
  rowIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    borderRadius: reset.radius.sm,
    background: reset.color.page,
    color: reset.color.textMuted,
    flexShrink: 0,
  },
  rowText: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, paddingTop: '2px' },
  rowLabel: {
    fontFamily: reset.font.body,
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: reset.color.textFaint,
  },
  rowValue: {
    fontFamily: reset.font.body,
    fontSize: '12.5px',
    lineHeight: 1.5,
    color: reset.color.text,
  },
  sections: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    borderTop: `1px solid ${reset.color.border}`,
    paddingTop: '12px',
  },
  section: {
    border: `1px solid ${reset.color.border}`,
    borderRadius: reset.radius.sm,
    overflow: 'hidden',
  },
  sectionHead: {
    width: '100%',
    boxSizing: 'border-box',
    minHeight: '40px',
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
    fontFamily: reset.font.body,
    fontSize: '12.5px',
    fontWeight: 700,
    color: reset.color.text,
  },
  chev: { display: 'inline-flex', color: reset.color.textFaint, transition: 'transform 120ms' },
  sectionBody: {
    padding: '2px 12px 12px',
    borderTop: `1px solid ${reset.color.border}`,
  },
  sectionText: {
    fontFamily: reset.font.body,
    fontSize: '12px',
    lineHeight: 1.6,
    color: reset.color.textMuted,
    margin: '8px 0 0',
  },
  list: { margin: '8px 0 0', paddingInlineStart: '18px' },
  listItem: {
    fontFamily: reset.font.body,
    fontSize: '12px',
    lineHeight: 1.6,
    color: reset.color.textMuted,
    marginBottom: '4px',
  },
};
