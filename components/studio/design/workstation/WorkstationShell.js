// components/studio/design/workstation/WorkstationShell.js
//
// LESHEM.S OS — Clean 6D: Studio Workstation Prototype (North Star direction).
//
// A SAFE PARALLEL workstation screen at /studio/workstation that explores the
// North Star direction WITHOUT touching the stable live Studio
// (/studio/design + components/studio/design/shell/*). Functional prototype,
// not a static mockup — it reads and writes through the SAME existing stores
// the stable Studio uses, via their PUBLIC exports only:
//
//   • Work Tray        — createUseWorkTray (lib/studio/workTray.js — NOT edited)
//   • Design brief     — createUseDesignBrief (lib/studio/designBriefStore.js —
//                        NOT edited): menu edits (updateBrief), concept
//                        persistence (setConcepts), selection (selectConcept)
//   • Concept engine   — generateConcepts (lib/studio/designConcepts.js) +
//                        computeInputSignature — the EXACT generate contract
//                        DesignConceptPanel uses, including the same
//                        defensive Active-Work sync (getActiveWorkId +
//                        updateProject + buildDesignSnapshot)
//   • Render brief     — the EXISTING DesignOutputPanel rendered unchanged
//                        in the canvas 'output' view
//   • Inventory add    — the EXACT Clean 6A pattern: read-only demo snapshot
//                        → InlineInventoryPicker → toStudioTrayItem →
//                        tray.addItem
//
// Layout zones (Clean 6D spec):
//   1. Top stone/material ribbon         — WorkstationRibbon
//   2. Left vertical tool rail           — WorkstationRail
//   3. Center workstation canvas (split) — WorkstationCanvas
//   4. Right docked Design Menu          — WorkstationMenu (desktop default on)
//   5. Bottom Design Directions palette  — WorkstationDirections (כיווני עיצוב)
//   6. Process strip                     — WorkstationProcessStrip (derived)
//
// No protected file edited. No new store, no new persistence key, no render
// engine, no WebGL, no pricing, no certificates, no Airtable, no new package.

import * as React from 'react';
import { useRouter } from 'next/router';
import { ws } from './wsStyle';
import { WS_HE } from './wsLabels';
import { FLOW_HE, USABILITY_D_HE } from '../../../../lib/studio/labels';
import { createUseWorkTray } from '../../../../lib/studio/workTray';
import {
  createUseDesignBrief,
  setConcepts as persistConcepts,
  selectConcept as persistSelectedConcept,
} from '../../../../lib/studio/designBriefStore';
import { updateProject } from '../../../../lib/studio/designProjects';
import { getActiveWorkId } from '../../../../lib/studio/activeWorkStore';
import {
  getSelectedConcept,
  getActiveOutput,
  conceptsAreStale,
  outputIsStale,
  computeInputSignature,
  buildDesignSnapshot,
} from '../../../../lib/studio/designDraft';
import { generateConcepts } from '../../../../lib/studio/designConcepts';
import {
  getDemoInspectStoneFromTrayItem,
  getDemoInventorySnapshot,
  toStudioTrayItem,
  getSourceLabelHe,
} from '../../../../lib/studio/demoInventoryLayer';
import { intentSummaryText } from '../shell/StudioIntentDrawer';
import InlineInventoryPicker from '../../shared/InlineInventoryPicker';

import WorkstationRibbon from './WorkstationRibbon';
import WorkstationRail from './WorkstationRail';
import WorkstationCanvas from './WorkstationCanvas';
import WorkstationMenu from './WorkstationMenu';
import WorkstationDirections from './WorkstationDirections';
import WorkstationProcessStrip, { PROCESS_LABELS } from './WorkstationProcessStrip';

const useWorkTray = createUseWorkTray(React);
const useDesignBrief = createUseDesignBrief(React);

function useViewport() {
  const [narrow, setNarrow] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const check = () => setNarrow(window.innerWidth < 1100);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return narrow;
}

export default function WorkstationShell() {
  const tray = useWorkTray();
  const briefStore = useDesignBrief();
  const router = useRouter();
  const narrow = useViewport();

  // Canvas view + docked-menu visibility (UI-only, never persisted).
  const [view, setView] = React.useState('table');
  const [menuOpen, setMenuOpen] = React.useState(true); // desktop default: visible
  const [selectedItemId, setSelectedItemId] = React.useState(null);

  // In-workstation inventory add (identical Clean 6A pattern — UI-only state,
  // read-only demo snapshot loaded only when the picker opens).
  const [invPickerOpen, setInvPickerOpen] = React.useState(false);
  const [invItems, setInvItems] = React.useState([]);

  const [toast, setToast] = React.useState(null);
  const toastTimer = React.useRef(null);
  const showToast = React.useCallback((msg) => {
    if (!msg) return;
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);
  React.useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );

  if (!tray.hydrated || !briefStore.hydrated) {
    return <div style={styles.loading}>{WS_HE.loading}</div>;
  }

  const brief = briefStore.brief;
  const concepts = Array.isArray(brief.concepts) ? brief.concepts : [];
  const hasConcepts = concepts.length > 0;
  const realTrayItems = Array.isArray(tray.items) ? tray.items : [];
  const hasStones = realTrayItems.length > 0;

  const selected = getSelectedConcept(brief);
  const output = getActiveOutput(brief);
  const conceptsStale = conceptsAreStale(brief, realTrayItems);
  const outStale = outputIsStale(brief, realTrayItems);
  const intentSummary = intentSummaryText(brief);

  // Demo-SOURCED tray items resolve their richer view via the EXISTING helper
  // (returns null for non-demo items — per item, never an injected list).
  const demoStoneFor = (item) =>
    item && item.isDemoAsset ? getDemoInspectStoneFromTrayItem(item) : null;

  // Canonical stone shapes of the current composition — for the derived,
  // deterministic concept sketches (render-time only; nothing stored).
  const stoneShapes = realTrayItems
    .map((it) => (it.snapshot && it.snapshot.axes ? it.snapshot.axes.shape : null))
    .filter(Boolean);

  // ------------------------------------------------------------------
  // Concept generation / selection — the EXACT DesignConceptPanel contract:
  // generate → stamp input signature → persist via setConcepts → defensive
  // Active-Work sync through existing exports. No generation logic added.
  // ------------------------------------------------------------------
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
      console.warn('[workstation] active work sync skipped.', e);
    }
  };

  const handleGenerate = () => {
    const next = generateConcepts(tray.items, brief);
    const sig = computeInputSignature(brief, tray.items);
    const nextBrief = persistConcepts(next, sig);
    syncActiveWork(nextBrief);
    showToast(FLOW_HE.toast.conceptsCreated);
  };

  const handleSelectDirection = (conceptId) => {
    const nextId = conceptId === brief.selectedConceptId ? null : conceptId;
    const nextBrief = persistSelectedConcept(nextId);
    syncActiveWork(nextBrief);
    showToast(nextId ? FLOW_HE.toast.conceptChosen : FLOW_HE.toast.conceptCanceled);
  };

  const handleClearSelection = () => {
    const nextBrief = persistSelectedConcept(null);
    syncActiveWork(nextBrief);
    showToast(FLOW_HE.toast.conceptCanceled);
  };

  // ------------------------------------------------------------------
  // Inventory add — identical Clean 6A pattern (read-only snapshot →
  // presentational picker → existing bridge → real Work Tray only).
  // ------------------------------------------------------------------
  const openInventoryPicker = () => {
    setInvItems(getDemoInventorySnapshot());
    setInvPickerOpen(true);
  };
  const invEntries = invItems.map((item) => ({
    id: item.id,
    title: item.titleHe || item.title || '—',
    subtitle: [
      item.shapeHe,
      item.estimatedCarat != null ? `${item.estimatedCarat}ct` : null,
      item.color,
      getSourceLabelHe(item.sourceType),
    ]
      .filter(Boolean)
      .join(' · '),
    image: item.thumbImage || item.boxImage || null,
    raw: item,
  }));
  const invTrayIds = new Set(realTrayItems.map((it) => it.id));
  const onInvAdd = (entry) => {
    const trayItem = toStudioTrayItem(entry.raw);
    if (trayItem) tray.addItem(trayItem);
  };
  const onInvRemove = (entry) => {
    tray.remove(entry.id);
  };

  // ------------------------------------------------------------------
  // Rail — 'menu' toggles the docked Design Menu; everything else is a view.
  // ------------------------------------------------------------------
  const onRailSelect = (key) => {
    if (key === 'menu') {
      setMenuOpen((v) => !v);
      return;
    }
    setView(key);
  };

  // Process strip — derived from EXISTING state only.
  const stepState = {
    stones: { done: hasStones, attention: false, target: 'stones' },
    menu: { done: Boolean(intentSummary), attention: false, target: 'menu' },
    directions: { done: hasConcepts, attention: hasConcepts && conceptsStale, target: 'directions' },
    selected: { done: Boolean(selected), attention: false, target: 'directions' },
    brief: { done: Boolean(output), attention: Boolean(output) && outStale, target: 'output' },
  };
  const processSteps = PROCESS_LABELS.map(({ key, label }) => ({
    key,
    label,
    done: stepState[key].done,
    attention: stepState[key].attention,
    onClick: () => onRailSelect(stepState[key].target),
  }));

  const showMenuColumn = menuOpen && !narrow;

  return (
    <div style={styles.root} dir="rtl">
      <div style={styles.glow} aria-hidden="true" />

      {/* Header — prototype identity + quick way back to the stable Studio */}
      <div style={styles.header}>
        <span style={styles.headerTitle}>{WS_HE.title}</span>
        <span style={styles.badge}>{WS_HE.prototypeBadge}</span>
        <div style={styles.headerSpacer} />
        <WorkstationProcessStrip steps={processSteps} />
        <button
          type="button"
          onClick={() => router.push('/studio/design')}
          style={styles.backBtn}
        >
          {WS_HE.backToStableStudio}
        </button>
      </div>

      {/* Zone 1 — top stone/material ribbon */}
      <WorkstationRibbon
        trayItems={realTrayItems}
        demoStoneFor={demoStoneFor}
        selectedItemId={selectedItemId}
        onSelectItem={(item) => {
          if (item && item.id) setSelectedItemId(item.id);
        }}
        onAddStones={openInventoryPicker}
      />

      {/* Zones 2–4 — rail | canvas | docked menu */}
      <div
        style={{
          ...styles.middle,
          ...(narrow ? styles.middleNarrow : null),
          ...(!narrow && !showMenuColumn ? styles.middleNoMenu : null),
        }}
      >
        <WorkstationRail active={view} menuOpen={menuOpen} onSelect={onRailSelect} />

        <WorkstationCanvas
          view={view}
          narrow={narrow}
          selected={selected}
          hasConcepts={hasConcepts}
          stoneShapes={stoneShapes}
          fallbackProductType={brief.productType || null}
          trayItems={realTrayItems}
          demoStoneFor={demoStoneFor}
          intentSummary={intentSummary}
          output={output}
          outputStale={outStale}
          onOpenOutput={() => setView('output')}
          onToast={showToast}
        />

        {(showMenuColumn || (narrow && menuOpen)) && (
          <WorkstationMenu
            brief={brief}
            onUpdate={(patch) => briefStore.update(patch)}
            onHide={() => setMenuOpen(false)}
            narrow={narrow}
          />
        )}
      </div>

      {/* Zone 5 — bottom Design Directions palette */}
      <WorkstationDirections
        concepts={concepts}
        selectedId={brief.selectedConceptId}
        stale={conceptsStale}
        onSelect={handleSelectDirection}
        onClearSelection={handleClearSelection}
        onGenerate={handleGenerate}
        stoneShapes={stoneShapes}
        fallbackProductType={brief.productType || null}
      />

      {/* In-workstation inventory add — same presentational picker + bridge */}
      <InlineInventoryPicker
        open={invPickerOpen}
        title={USABILITY_D_HE.pickerTitle}
        items={invEntries}
        selectedIds={invTrayIds}
        onAdd={onInvAdd}
        onRemove={onInvRemove}
        onClose={() => setInvPickerOpen(false)}
      />

      {toast && (
        <div style={styles.toast} dir="rtl" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

const GAP = '10px';

const styles = {
  root: {
    position: 'relative',
    display: 'grid',
    gridTemplateRows: 'auto auto minmax(0, 1fr) auto',
    gap: GAP,
    minHeight: '100vh',
    padding: GAP,
    boxSizing: 'border-box',
    background: ws.color.page,
    overflow: 'auto',
  },
  glow: {
    position: 'absolute',
    inset: 0,
    background: ws.color.pageGlow,
    pointerEvents: 'none',
  },
  loading: {
    fontFamily: ws.font.body,
    fontSize: '14px',
    color: ws.color.textMuted,
    padding: '60px 0',
    textAlign: 'center',
    background: ws.color.page,
    minHeight: '100vh',
    boxSizing: 'border-box',
  },

  header: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    minHeight: '36px',
  },
  headerTitle: {
    fontFamily: ws.font.display,
    fontSize: '15px',
    fontWeight: 800,
    color: ws.color.text,
    whiteSpace: 'nowrap',
  },
  badge: {
    padding: '3px 10px',
    borderRadius: '999px',
    border: `1px solid ${ws.color.gold}`,
    color: ws.color.gold,
    fontFamily: ws.font.body,
    fontSize: '10.5px',
    fontWeight: 800,
    whiteSpace: 'nowrap',
  },
  headerSpacer: { flex: '1 1 auto' },
  backBtn: {
    minHeight: '32px',
    padding: '6px 14px',
    borderRadius: '999px',
    border: `1px solid ${ws.color.borderStrong}`,
    background: 'transparent',
    color: ws.color.text,
    fontFamily: ws.font.body,
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },

  middle: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr) minmax(280px, 330px)',
    gap: GAP,
    minHeight: 0,
    alignItems: 'stretch',
  },
  middleNoMenu: {
    gridTemplateColumns: 'auto minmax(0, 1fr)',
  },
  middleNarrow: {
    gridTemplateColumns: '1fr',
    gridAutoRows: 'min-content',
  },

  toast: {
    position: 'fixed',
    left: '50%',
    bottom: '24px',
    transform: 'translateX(-50%)',
    fontFamily: ws.font.body,
    fontSize: '13.5px',
    fontWeight: 600,
    color: ws.color.primaryText,
    background: ws.color.primaryBg,
    padding: '9px 18px',
    borderRadius: ws.radius.md,
    zIndex: 50,
    pointerEvents: 'none',
  },
};
