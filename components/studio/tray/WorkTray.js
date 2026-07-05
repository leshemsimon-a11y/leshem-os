// components/studio/tray/WorkTray.js
//
// LESHEM.S OS — Work Tray (Clean 3 → Clean 3.2)
//
// The review surface for the current creative selection (מגש עבודה). It is a
// TEMPORARY draft — not saved inventory — and says so plainly. From here the
// jeweller can review each selected item, assign its design role (now via
// tap-friendly chips), remove an item, clear the whole tray (with
// confirmation), and open the Jewelry Design Studio to begin working around
// the stones.
//
// Clean 3.2 adds honest draft validation:
//   • An elegant status strip reflects three states — empty / needs-role /
//     ready — without ever blocking progress (continuing is always allowed).
//   • Readiness is stone-first: at least one CENTER STONE marks the draft as
//     ready to begin. Until then the strip gently suggests assigning roles.
//
// Mobile-first: stacked item cards, generous tap targets, and a sticky bottom
// action bar holding the primary "open design" action so it is always within
// thumb reach. No commerce language. No Airtable. No network.

import { useState } from 'react';
import * as React from 'react';
import { useRouter } from 'next/router';
import { tokens } from '../shared/tokens';
import useIsMobile from '../shared/useIsMobile';
import { TRAY_HE } from '../../../lib/studio/labels';
import { createUseWorkTray } from '../../../lib/studio/workTray';
import { summarizeDraft, draftStatus } from '../../../lib/studio/designDraft';
import TrayItemCard from './TrayItemCard';
import ClearTrayConfirm from './ClearTrayConfirm';
import AssetPicker from '../assets/AssetPicker';
import InlineInventoryPicker from '../shared/InlineInventoryPicker';
import ActiveWorkBadge from '../shared/ActiveWorkBadge';
import { createUseDesignProjects } from '../../../lib/studio/designProjects';
import { createUseDesignBrief } from '../../../lib/studio/designBriefStore';
import { createUseActiveWork } from '../../../lib/studio/activeWorkStore';
import { buildDesignSnapshot } from '../../../lib/studio/designDraft';
import { PICKER_HE, ACTIVE_WORK_HE, USABILITY_D_HE } from '../../../lib/studio/labels';
// Patch D — Work Tray inline add. READ-ONLY use of existing demo inventory
// exports; additions go to the REAL Work Tray via the existing bridge
// (toStudioTrayItem → tray.addItem). No new store, no new persistence key.
import {
  getDemoInventorySnapshot,
  toStudioTrayItem,
  getSourceLabelHe,
} from '../../../lib/studio/demoInventoryLayer';

const useWorkTray = createUseWorkTray(React);
const useDesignProjects = createUseDesignProjects(React);
const useDesignBrief = createUseDesignBrief(React);
const useActiveWork = createUseActiveWork(React);

// Small inline icons — self-contained, matching the convention already used
// in DemoInventoryWorkspace.js and TrayItemCard.js (no cross-import from the
// Design Studio shell's icon set).
function DesignIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 17.5L14 6.5l3.5 3.5L6.5 21H3v-3.5z" />
      <path d="M13 7.5l3.5 3.5" />
    </svg>
  );
}
function BackIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5l-6 7 6 7M5 12h14" />
    </svg>
  );
}
function ClearIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13" />
    </svg>
  );
}
function PickIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function StatusStrip({ status }) {
  if (!status || status.key === 'empty') return null;

  const ready = status.tone === 'ready';
  const stripStyle = {
    ...styles.statusStrip,
    ...(ready ? styles.statusReady : styles.statusPending),
  };
  const title = ready
    ? TRAY_HE.status.readyTitle
    : TRAY_HE.status.needsRoleTitle;
  const body = ready ? TRAY_HE.status.readyBody : TRAY_HE.status.needsRoleBody;

  // Patch D — text reduction: the explanatory body is no longer always
  // visible; it moves to a hover tooltip (title attr). Nothing removed —
  // same strings, relocated.
  return (
    <div style={stripStyle} dir="rtl" title={body}>
      <span
        style={{
          ...styles.statusDot,
          background: ready ? tokens.color.gold : tokens.color.goldSoft,
        }}
        aria-hidden="true"
      />
      <div style={styles.statusText}>
        <span style={styles.statusTitle}>{title}</span>
      </div>
    </div>
  );
}

export default function WorkTray() {
  const isMobile = useIsMobile(880);
  const router = useRouter();
  const tray = useWorkTray();
  const projectsStore = useDesignProjects();
  const brief = useDesignBrief();
  const activeWork = useActiveWork();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  // Patch D — inline inventory add: overlay picker state + a read-only demo
  // inventory snapshot loaded when (and only when) the picker opens.
  const [invPickerOpen, setInvPickerOpen] = useState(false);
  const [invItems, setInvItems] = useState([]);
  const [workName, setWorkName] = useState('');
  const [workToast, setWorkToast] = useState(null);

  const openInvPicker = () => {
    setInvItems(getDemoInventorySnapshot());
    setInvPickerOpen(true);
  };

  // Generic display entries for the presentational picker. `raw` keeps the
  // original demo item so add can go through the EXISTING bridge unchanged.
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

  const invTrayIds = new Set((tray.items || []).map((it) => it.id));

  const onInvAdd = (entry) => {
    const trayItem = toStudioTrayItem(entry.raw);
    if (trayItem) tray.addItem(trayItem);
  };
  const onInvRemove = (entry) => {
    tray.remove(entry.id);
  };

  const flashWork = (m) => {
    setWorkToast(m);
    setTimeout(() => setWorkToast(null), 2000);
  };

  const activeProject =
    activeWork.activeWorkId && projectsStore.hydrated
      ? projectsStore.projects.find((p) => p.id === activeWork.activeWorkId)
      : null;

  const saveAsNewWork = () => {
    if (tray.items.length === 0) return;
    const snapshot = buildDesignSnapshot(tray.items, brief.brief || {});
    const project = projectsStore.save({
      name: workName.trim() || ACTIVE_WORK_HE.defaultName,
      trayItems: tray.items,
      brief: brief.brief || {},
      snapshot,
    });
    if (project && project.id) {
      activeWork.setActiveWork(project.id);
      setWorkName('');
      flashWork(ACTIVE_WORK_HE.savedToast);
    }
  };

  const updateExistingWork = () => {
    if (!activeProject) return;
    const snapshot = buildDesignSnapshot(tray.items, brief.brief || {});
    projectsStore.update(activeProject.id, {
      trayItems: tray.items,
      brief: brief.brief || {},
      snapshot,
    });
    flashWork(ACTIVE_WORK_HE.updatedToast);
  };

  const summary = summarizeDraft(tray.items);
  const { total, assigned, readyToBegin } = summary;
  const status = draftStatus(tray.items);
  const hasItems = tray.items.length > 0;

  const goDesign = () => router.push('/studio/design');
  const goInventory = () => router.push('/studio/inventory');

  const handleClear = () => {
    tray.clear();
    setConfirmOpen(false);
  };

  return (
    <div dir="rtl" style={isMobile ? styles.rootMobile : undefined}>
      {/* Patch D — text reduction: the draft-nature explanation is now a
          hover tooltip on the title instead of an always-visible paragraph.
          Same string (TRAY_HE.draftNote), relocated. */}
      <header style={styles.header}>
        <span style={styles.eyebrow}>{TRAY_HE.eyebrow}</span>
        <h1 style={styles.title} title={TRAY_HE.draftNote}>{TRAY_HE.title}</h1>
      </header>

      {tray.hydrated && <ActiveWorkBadge />}

      {/* Don't render hydration-sensitive content until the store has synced. */}
      {!tray.hydrated ? (
        <div style={styles.loading}>טוען את מגש העבודה…</div>
      ) : !hasItems ? (
        <div style={styles.empty}>
          <div style={styles.emptyMark} aria-hidden="true">
            ▤
          </div>
          <h2 style={styles.emptyTitle} title={TRAY_HE.emptyHint}>{TRAY_HE.empty}</h2>
          {/* Patch D — the primary way to fill an empty tray is now the
              inline inventory picker (no route jump). The Asset Library
              picker and the Inventory route stay available, untouched. */}
          <div style={styles.emptyActions}>
            <button type="button" onClick={openInvPicker} style={styles.primaryBtn}>
              <PickIcon /> {USABILITY_D_HE.addItems}
            </button>
            <button type="button" onClick={() => setPickerOpen(true)} style={styles.secondaryBtn}>
              {PICKER_HE.openFromTray}
            </button>
            <button type="button" onClick={goInventory} style={styles.secondaryBtn}>
              <BackIcon /> {TRAY_HE.backToInventory}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={styles.metaRow}>
            <span style={styles.count}>{TRAY_HE.itemsCount(total)}</span>
            <div style={styles.metaActions}>
              {/* Patch D — add more items from INSIDE the tray, no route jump. */}
              <button type="button" onClick={openInvPicker} style={styles.pickBtn}>
                <PickIcon /> {USABILITY_D_HE.addItems}
              </button>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                style={styles.pickBtn}
                title={PICKER_HE.openFromTray}
              >
                {PICKER_HE.openFromTray}
              </button>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                style={styles.clearBtn}
              >
                <ClearIcon /> {TRAY_HE.clear}
              </button>
            </div>
          </div>

          <StatusStrip status={status} />

          <div style={styles.list}>
            {tray.items.map((item) => (
              <TrayItemCard
                key={item.id}
                item={item}
                onRole={tray.setRole}
                onRemove={tray.remove}
              />
            ))}
          </div>

          {/* Clean 4C.1 — Save the tray as a work (Design Project). */}
          <div style={styles.workPanel}>
            <div style={styles.workRow}>
              <input
                value={workName}
                onChange={(e) => setWorkName(e.target.value)}
                placeholder={activeProject ? activeProject.name : ACTIVE_WORK_HE.namePlaceholder}
                style={styles.workInput}
                dir="rtl"
              />
              <button type="button" onClick={saveAsNewWork} style={styles.workSave}>
                {activeProject ? ACTIVE_WORK_HE.createNewWork : ACTIVE_WORK_HE.saveAsWork}
              </button>
            </div>
            {activeProject && (
              <button type="button" onClick={updateExistingWork} style={styles.workUpdate}>
                {ACTIVE_WORK_HE.updateExisting}
              </button>
            )}
            {workToast && <span style={styles.workToast}>{workToast}</span>}
          </div>

          {/* Desktop: inline action row. Mobile: sticky bottom bar below. */}
          {!isMobile && (
            <div style={styles.desktopActions}>
              <button type="button" onClick={goInventory} style={styles.secondaryBtn}>
                <BackIcon /> {TRAY_HE.backToInventory}
              </button>
              <div style={styles.desktopPrimaryWrap}>
                <span style={styles.desktopReadyHint}>
                  {readyToBegin ? TRAY_HE.readyHint : TRAY_HE.notReadyHint}
                </span>
                <button type="button" onClick={goDesign} style={styles.primaryBtn}>
                  <DesignIcon /> {TRAY_HE.createJewelry}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Mobile sticky action bar — primary action always within thumb reach. */}
      {isMobile && tray.hydrated && hasItems && (
        <div style={styles.stickyBar}>
          <div style={styles.stickyInner}>
            <span style={styles.stickyHint}>
              {assigned}/{total} ·{' '}
              {readyToBegin ? TRAY_HE.readyHint : TRAY_HE.openDesignHint}
            </span>
            <button type="button" onClick={goDesign} style={styles.stickyBtn}>
              <DesignIcon /> {TRAY_HE.openDesign}
            </button>
          </div>
        </div>
      )}

      <ClearTrayConfirm
        open={confirmOpen}
        onConfirm={handleClear}
        onCancel={() => setConfirmOpen(false)}
      />

      <AssetPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        tray={tray}
        projectsStore={projectsStore}
        currentProjectId={null}
      />

      {/* Patch D — inline inventory add. Presentational picker; membership
          truth and all writes go through the REAL Work Tray hook only. */}
      <InlineInventoryPicker
        open={invPickerOpen}
        title={USABILITY_D_HE.pickerTitle}
        items={invEntries}
        selectedIds={invTrayIds}
        onAdd={onInvAdd}
        onRemove={onInvRemove}
        onClose={() => setInvPickerOpen(false)}
      />
    </div>
  );
}

const styles = {
  rootMobile: {
    // Leave room so the sticky bottom bar never covers the last card.
    paddingBottom: '96px',
  },
  header: {
    marginBottom: '20px',
  },
  eyebrow: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: tokens.color.gold,
  },
  title: {
    fontFamily: tokens.font.display,
    fontWeight: 700,
    fontSize: '26px',
    color: tokens.color.charcoal,
    margin: '6px 0 10px',
  },
  draftNote: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.goldFaint}`,
    borderRadius: tokens.radius.sm,
    padding: '10px 14px',
    margin: 0,
    maxWidth: '560px',
  },
  loading: {
    fontFamily: tokens.font.body,
    fontSize: '15px',
    color: tokens.color.inkFaint,
    padding: '40px 0',
    textAlign: 'center',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '12px',
    minHeight: '46vh',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  emptyMark: {
    fontSize: '30px',
    color: tokens.color.goldSoft,
  },
  emptyTitle: {
    fontFamily: tokens.font.display,
    fontWeight: 400,
    fontSize: '24px',
    color: tokens.color.charcoal,
    margin: 0,
  },
  emptyHint: {
    fontFamily: tokens.font.body,
    fontSize: '15px',
    lineHeight: 1.6,
    color: tokens.color.inkFaint,
    maxWidth: '420px',
    margin: '0 0 8px',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '12px',
  },
  metaActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  emptyActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pickBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    minHeight: '44px',
    padding: '10px 16px',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.gold}`,
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  count: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    color: tokens.color.inkSoft,
  },
  clearBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    minHeight: '44px',
    padding: '10px 18px',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.color.inkSoft,
    background: 'transparent',
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  statusStrip: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: tokens.radius.md,
    marginBottom: '16px',
  },
  statusPending: {
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.goldFaint}`,
  },
  statusReady: {
    background: tokens.color.sageFaint,
    border: `1px solid ${tokens.color.sage}`,
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    marginTop: '5px',
    flexShrink: 0,
  },
  statusText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  },
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
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  workPanel: {
    display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px', padding: '16px',
    background: tokens.color.pearl, border: `1px solid ${tokens.color.goldFaint}`, borderRadius: tokens.radius.lg,
  },
  workRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  workInput: {
    flex: 1, minWidth: '180px', boxSizing: 'border-box', fontFamily: tokens.font.body, fontSize: '14px',
    color: tokens.color.ink, background: tokens.color.ivory, border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md, padding: '11px 13px', minHeight: '46px',
  },
  workSave: {
    minHeight: '46px', padding: '11px 22px', fontFamily: tokens.font.body, fontSize: '14px', fontWeight: 700,
    color: tokens.color.ivory, background: tokens.color.charcoal, border: 'none', borderRadius: tokens.radius.md, cursor: 'pointer',
  },
  workUpdate: {
    alignSelf: 'flex-start', minHeight: '44px', padding: '10px 18px', fontFamily: tokens.font.body, fontSize: '14px',
    fontWeight: 700, color: tokens.color.charcoal, background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.gold}`, borderRadius: tokens.radius.md, cursor: 'pointer',
  },
  workToast: { fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 600, color: tokens.color.sage },
  desktopActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginTop: '28px',
    paddingTop: '20px',
    borderTop: `1px solid ${tokens.color.cardEdge}`,
  },
  desktopPrimaryWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  desktopReadyHint: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    color: tokens.color.inkFaint,
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    minHeight: '50px',
    padding: '14px 28px',
    fontFamily: tokens.font.body,
    fontSize: '16px',
    fontWeight: 600,
    color: tokens.color.ivory,
    background: tokens.color.charcoal,
    border: 'none',
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
    boxShadow: tokens.shadow.soft,
  },
  secondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    minHeight: '50px',
    padding: '14px 26px',
    fontFamily: tokens.font.body,
    fontSize: '15px',
    fontWeight: 600,
    color: tokens.color.charcoal,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
  },
  stickyBar: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 25,
    background: tokens.color.ivory,
    borderTop: `1px solid ${tokens.color.cardEdge}`,
    boxShadow: '0 -8px 24px rgba(43,40,36,0.06)',
    padding: '12px 16px calc(12px + env(safe-area-inset-bottom, 0px))',
  },
  stickyInner: {
    maxWidth: '720px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  stickyHint: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.inkFaint,
    flex: 1,
    minWidth: 0,
  },
  stickyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    minHeight: '50px',
    padding: '14px 22px',
    fontFamily: tokens.font.body,
    fontSize: '16px',
    fontWeight: 600,
    color: tokens.color.ivory,
    background: tokens.color.charcoal,
    border: 'none',
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    boxShadow: tokens.shadow.soft,
  },
};
