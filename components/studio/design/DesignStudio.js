// components/studio/design/DesignStudio.js
//
// LESHEM.S OS — Jewelry Design Studio (Clean 5B.2 — Compact Pro Workspace)
//
// The Design Studio is now a COMPACT, PROFESSIONAL, CLIENT-FACING WORKSPACE
// rather than a long vertical page. The heavy lifting lives in DesignFlow,
// which provides:
//   • a top status bar (עבודה / מוצר / כיוון / מצב פלט / הצעד הבא)
//   • a right (RTL) control panel — direction summary + edit, stones in work,
//     save-to-work — i.e. the USEFUL legacy zones, relocated here
//   • a central work / result area (direction | concepts | output)
//   • flow-level stale banners that are ALWAYS visible (the 5B.2 stale fix)
//   • a docked single next-action bar
//
// This file's job is now thin: mount the workspace, show the empty-tray hint
// and asset picker, and tuck the remaining non-essential legacy panels
// (internal Snapshot, Linked Assets, reserved future zones) into CLOSED,
// reopenable summary cards BELOW the workspace so they no longer dominate the
// scroll. Nothing is deleted — every panel still mounts and works.
//
// Stone-first. Local only. No uploads, no model records, no render/Stability,
// no pricing, no certificates, no Airtable, no new packages. Future zones
// never look active.

import * as React from 'react';
import { useRouter } from 'next/router';
import { tokens } from '../shared/tokens';
import { DESIGN_HE, SNAPSHOT_HE, ASSET_FLOW_HE, PICKER_HE, FLOW_HE } from '../../../lib/studio/labels';
import { createUseWorkTray } from '../../../lib/studio/workTray';
import { createUseDesignProjects } from '../../../lib/studio/designProjects';
import { summarizeDraft } from '../../../lib/studio/designDraft';
import DesignFutureRail from './DesignFutureRail';
import DesignFlow from './DesignFlow';
import DesignSnapshotPanel from './DesignSnapshotPanel';
import LinkedAssetsPanel from './LinkedAssetsPanel';
import AssetPicker from '../assets/AssetPicker';
import ActiveWorkBadge from '../shared/ActiveWorkBadge';

const useWorkTray = createUseWorkTray(React);
const useDesignProjects = createUseDesignProjects(React);

// A closed-by-default, reopenable summary card for the non-essential legacy
// panels. Keeps them available without adding to the default scroll.
function MoreCard({ title, caption, future = false, defaultOpen = false, children }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div style={{ ...styles.moreCard, ...(future ? styles.moreCardFuture : null) }} dir="rtl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={styles.moreHeader}
        aria-expanded={open}
      >
        <span style={styles.moreTitleWrap}>
          <span style={styles.moreTitle}>{title}</span>
          {caption ? <span style={styles.moreCaption}>{caption}</span> : null}
        </span>
        <span style={styles.moreToggle}>{open ? FLOW_HE.panel.collapse : FLOW_HE.panel.expand}</span>
      </button>
      {open && <div style={styles.moreBody}>{children}</div>}
    </div>
  );
}

export default function DesignStudio() {
  const router = useRouter();
  const tray = useWorkTray();
  const projectsStore = useDesignProjects();

  const summary = summarizeDraft(tray.items);
  const hasItems = summary.total > 0;

  const Z = DESIGN_HE.zones;
  const goTray = () => router.push('/studio/tray');

  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [currentProjectId, setCurrentProjectId] = React.useState(null);
  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        setCurrentProjectId(window.localStorage.getItem('leshem_studio_current_project_v1'));
      }
    } catch (e) {
      /* non-fatal */
    }
  }, []);

  return (
    <div dir="rtl">
      <header style={styles.header}>
        <span style={styles.eyebrow}>{DESIGN_HE.eyebrow}</span>
        <h1 style={styles.title}>{DESIGN_HE.title}</h1>
      </header>

      <ActiveWorkBadge />

      {!tray.hydrated ? (
        <div style={styles.loading}>טוען את העיצוב…</div>
      ) : (
        <div style={styles.board}>
          {/* Empty-tray hint — a metal-only design is still allowed, so this is
              a gentle prompt, never a hard block. */}
          {!hasItems && (
            <div style={styles.coreHint} dir="rtl">
              <p style={styles.coreHintText}>{DESIGN_HE.emptyHint}</p>
              <div style={styles.coreHintActions}>
                <button type="button" onClick={goTray} style={styles.trayLink}>
                  {DESIGN_HE.goToTray}
                </button>
                <button type="button" onClick={() => setPickerOpen(true)} style={styles.pickInline}>
                  {PICKER_HE.openFromStudio}
                </button>
              </div>
            </div>
          )}

          {/* PRIMARY — the compact pro workspace (status / control / work /
              actions). Dominant and above the fold. */}
          <DesignFlow />

          {/* Quick tray access kept available without crowding the workspace. */}
          {hasItems && (
            <div style={styles.trayBar} dir="rtl">
              <button type="button" onClick={goTray} style={styles.trayLink}>
                {DESIGN_HE.status.backToTray}
              </button>
              <button type="button" onClick={() => setPickerOpen(true)} style={styles.pickInline}>
                {PICKER_HE.openFromStudio}
              </button>
            </div>
          )}

          {/* MORE — non-essential legacy panels, collapsed by default. They
              still mount and work; they just don't dominate the scroll. */}
          <div style={styles.moreWrap}>
            <span style={styles.moreSectionTitle}>{FLOW_HE.panel.moreTitle}</span>

            <MoreCard title={SNAPSHOT_HE.title} caption={SNAPSHOT_HE.caption}>
              <DesignSnapshotPanel />
            </MoreCard>

            <MoreCard title={ASSET_FLOW_HE.linkedTitle} caption={ASSET_FLOW_HE.linkedEmpty}>
              <StudioLinkedAssets router={router} />
            </MoreCard>

            {/* Reserved future zones — clearly disabled, collapsed. */}
            <MoreCard title={Z.reference.title} caption={Z.reference.caption} future>
              <DesignFutureRail variant="reference" />
            </MoreCard>
            <MoreCard title={Z.model.title} caption={Z.model.caption} future>
              <DesignFutureRail variant="models" />
            </MoreCard>
            <MoreCard title={Z.renderBrief.title} caption={Z.renderBrief.caption} future>
              <DesignFutureRail variant="renderBrief" />
            </MoreCard>
            <MoreCard title={Z.visualization.title} caption={Z.visualization.caption} future>
              <DesignFutureRail variant="visualization" />
            </MoreCard>
            <MoreCard title={Z.clientOutput.title} caption={Z.clientOutput.caption} future>
              <DesignFutureRail variant="clientOutput" />
            </MoreCard>
          </div>
        </div>
      )}

      <AssetPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        tray={tray}
        projectsStore={projectsStore}
        currentProjectId={currentProjectId}
      />
    </div>
  );
}

// Reads the project most recently opened into the studio and shows its linked
// assets. Local only.
function StudioLinkedAssets({ router }) {
  const [projectId, setProjectId] = React.useState(null);
  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        setProjectId(window.localStorage.getItem('leshem_studio_current_project_v1'));
      }
    } catch (e) {
      /* non-fatal */
    }
  }, []);
  return (
    <LinkedAssetsPanel
      projectId={projectId}
      onOpenAssets={() => router.push('/studio/assets')}
    />
  );
}

const styles = {
  header: {
    marginBottom: '16px',
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
    fontSize: '30px',
    color: tokens.color.charcoal,
    margin: '8px 0 0',
  },
  loading: {
    fontFamily: tokens.font.body,
    fontSize: '15px',
    color: tokens.color.inkFaint,
    padding: '40px 0',
    textAlign: 'center',
  },
  board: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  // ---- empty-tray hint ----
  coreHint: {
    background: tokens.color.pearl,
    border: `1px dashed ${tokens.color.goldFaint}`,
    borderRadius: tokens.radius.md,
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  coreHintText: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
    margin: 0,
  },
  coreHintActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  trayBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  trayLink: {
    minHeight: '44px',
    padding: '10px 20px',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.color.charcoal,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
  },
  pickInline: {
    minHeight: '44px',
    padding: '10px 18px',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.gold}`,
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
  },
  // ---- "more in studio" collapsed legacy panels ----
  moreWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '6px',
  },
  moreSectionTitle: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: tokens.color.inkFaint,
    margin: '4px 2px',
  },
  moreCard: {
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    background: tokens.color.canvas,
    overflow: 'hidden',
  },
  moreCardFuture: {
    background: tokens.color.ivory,
    borderStyle: 'dashed',
  },
  moreHeader: {
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    padding: '12px 14px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'right',
  },
  moreTitleWrap: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  moreTitle: {
    fontFamily: tokens.font.display,
    fontWeight: 700,
    fontSize: '15px',
    color: tokens.color.charcoal,
  },
  moreCaption: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.inkSoft,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '70vw',
  },
  moreToggle: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 600,
    color: tokens.color.gold,
    flexShrink: 0,
  },
  moreBody: {
    padding: '4px 14px 16px',
    borderTop: `1px solid ${tokens.color.cardEdge}`,
  },
};
