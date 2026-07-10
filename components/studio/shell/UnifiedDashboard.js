// components/studio/shell/UnifiedDashboard.js
//
// LESHEM.S OS — Command Center Dashboard (Clean 5H)
//
// Command Center + Unified App Frame pass: full content rebuild. The
// Dashboard used to be a grid of guided-action cards (a "list of modules").
// It's now built around live operational zones — command header, quick
// launch, inventory pulse, active work tray, design pipeline, recent
// activity, next actions — using ONLY data that already exists:
//   • activeWorkStore + designProjects (unchanged — same openProject flow)
//   • the REAL Work Tray (createUseWorkTray) for Active Work Tray
//   • the REAL design brief (createUseDesignBrief) for concepts state
//   • the DEMO inventory snapshot (lib/studio/demoInventoryLayer.js) for
//     Inventory Pulse + Recent Activity — the same read-only source
//     DemoInventoryWorkspace.js already uses
//   • the Asset Library store (createUseAssets) for the "assets without a
//     cover photo" Next Action — read-only, same hook TrayItemCard.js
//     already uses elsewhere
//
// Nothing here writes to any store except openProject(), which is the exact
// same restore-and-navigate flow the previous Dashboard already had. No
// Airtable, no network, no new packages.
//
// One thing intentionally NOT done: Certificates/Reports aren't built under
// /studio yet (navConfig.js marks them built: false). The "Reports" quick
// launch tile and the "Reports to complete" next-action tile are shown in
// the same honest muted/future state used everywhere else in this app
// rather than fabricating a number.

import * as React from 'react';
import { useRouter } from 'next/router';
import { tokens } from '../shared/tokens';
import { DASH_ACTIONS_HE, COMMAND_CENTER_HE } from '../../../lib/studio/labels';
import { createUseActiveWork } from '../../../lib/studio/activeWorkStore';
import { createUseDesignProjects } from '../../../lib/studio/designProjects';
import { createUseWorkTray } from '../../../lib/studio/workTray';
import { createUseDesignBrief } from '../../../lib/studio/designBriefStore';
import { createUseAssets } from '../../../lib/studio/assetsStore';
import { getDemoInventorySnapshot, getDemoActivityFeed } from '../../../lib/studio/demoInventoryLayer';

const useActiveWork = createUseActiveWork(React);
const useDesignProjects = createUseDesignProjects(React);
const useWorkTray = createUseWorkTray(React);
const useDesignBrief = createUseDesignBrief(React);
const useAssets = createUseAssets(React);

const D = DASH_ACTIONS_HE;
const C = COMMAND_CENTER_HE;

// ---- small inline icons — self-contained, matching the convention already
// used in DemoInventoryWorkspace.js / WorkTray.js (no cross-import from the
// Design Studio's own scoped icon set). ----
function DesignGlyph({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 17.5L14 6.5l3.5 3.5L6.5 21H3v-3.5z" />
      <path d="M13 7.5l3.5 3.5" />
    </svg>
  );
}
function InventoryGlyph({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
    </svg>
  );
}
function TrayGlyph({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
      <path d="M4 13h4l2 3h4l2-3h4" />
      <path d="M5 13l1.6-7h10.8L19 13" />
      <path d="M4 13v5.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V13" />
    </svg>
  );
}
function AssetsGlyph({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
      <path d="M3.5 15l4.5-4.5 3 3 4-4 5 5.5" />
      <circle cx="8.2" cy="9" r="1.4" />
    </svg>
  );
}
function ReportGlyph({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
      <path d="M14 3.5V8h4" />
      <path d="M8.5 12.5h7M8.5 15.5h7M8.5 18h4" />
    </svg>
  );
}
function ProjectsGlyph({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 7.5v10a1.5 1.5 0 0 0 1.5 1.5h14a1.5 1.5 0 0 0 1.5-1.5v-8a1.5 1.5 0 0 0-1.5-1.5h-8l-2-2.5H5a1.5 1.5 0 0 0-1.5 1.5z" />
    </svg>
  );
}
function ArrowGlyph({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 5l-6 7 6 7M3 12h18" />
    </svg>
  );
}
function CheckGlyph({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12.5l5 5L20 6" />
    </svg>
  );
}

// Patch C — OS Hardening V1: the strip previously listed the Design Studio
// TWICE (newDesign + design → the same route) plus a dead disabled Reports
// tile. Now: one design entry, the real live destinations, and תיקי עבודה.
// No dead tiles, no duplicated navigation.
const QUICK_LAUNCH = [
  { key: 'newDesign', route: '/studio/design', Icon: DesignGlyph, primary: true },
  { key: 'inventory', route: '/studio/inventory', Icon: InventoryGlyph },
  { key: 'workTray', route: '/studio/tray', Icon: TrayGlyph },
  { key: 'projects', route: '/studio/projects', Icon: ProjectsGlyph },
  { key: 'assets', route: '/studio/assets', Icon: AssetsGlyph },
];

// Clean 6G — Stable Studio Product Loop: the primary Studio action opens the
// stable /studio/design (route unchanged) with product-loop wording. Local
// override only — lib/studio/labels.js untouched, and deliberately NO
// dashboard entry for /studio/workstation (sandbox, direct URL only).
const STUDIO_CTA_HE = Object.freeze({
  label: 'פתח סטודיו עיצוב',
  helper: 'עבודה על אבנים נבחרות, כיווני עיצוב ושמירת תיק עבודה',
});

export default function UnifiedDashboard() {
  const router = useRouter();
  const active = useActiveWork();
  const projects = useDesignProjects();
  const tray = useWorkTray();
  const briefStore = useDesignBrief();
  const assetsHook = useAssets();

  const go = (route) => router.push(route);

  // Same restore-and-navigate flow the previous Dashboard already had —
  // unchanged.
  const openProject = (project, route = '/studio/design') => {
    if (!project) return;
    tray.replace(project.trayItems || []);
    briefStore.set(project.brief || {});
    active.setActiveWork(project.id);
    router.push(route);
  };

  const activeProject =
    active.hydrated && projects.hydrated && active.activeWorkId
      ? projects.projects.find((p) => p.id === active.activeWorkId)
      : null;

  // Patch C — resume surface: the most recently touched saved session (by
  // updatedAt), used when no session is currently active. Read-only.
  const latestProject =
    projects.hydrated && Array.isArray(projects.active)
      ? projects.active.reduce(
          (best, p) => (!best || (p.updatedAt || 0) > (best.updatedAt || 0) ? p : best),
          null
        )
      : null;

  // ---- Inventory Pulse — real demo inventory snapshot (read-only) ----
  const inventoryItems = React.useMemo(() => getDemoInventorySnapshot(), []);
  const invStats = {
    total: inventoryItems.length,
    available: inventoryItems.filter((i) => i.status === 'available').length,
    inTray: inventoryItems.filter((i) => i.selectedForTray).length,
    reserved: inventoryItems.filter((i) => i.status === 'reserved').length,
    supplier: inventoryItems.filter((i) => i.sourceType === 'supplier').length,
    clientOwned: inventoryItems.filter((i) => i.sourceType === 'client-owned').length,
  };
  const pulseThumbs = inventoryItems.slice(0, 4);

  // ---- Active Work Tray — the REAL tray, not the demo one ----
  const realTrayItems = tray.hydrated && Array.isArray(tray.items) ? tray.items : [];

  // ---- Design Pipeline — current stage from real state ----
  const brief = briefStore.brief || {};
  const hasTrayItems = realTrayItems.length > 0;
  const hasConcepts = Array.isArray(brief.concepts) && brief.concepts.length > 0;
  const hasSelectedConcept = Boolean(brief.selectedConceptId);
  const pipelineReached = [true, hasTrayItems, hasTrayItems, hasConcepts];

  // ---- Recent Activity — real demo activity feed ----
  const activity = React.useMemo(() => getDemoActivityFeed(), []);

  // ---- Next Actions — real counts; reports stays muted/future ----
  const pendingConceptsCount = hasConcepts && !hasSelectedConcept ? brief.concepts.length : 0;
  const assetsNoPhotoCount = assetsHook.hydrated
    ? assetsHook.objects.filter((o) => !o.coverImageFileId).length
    : null;

  const notReady =
    !tray.hydrated || !briefStore.hydrated || !projects.hydrated || !active.hydrated;
  if (notReady) {
    return <div style={styles.loading}>טוען את מרכז השליטה…</div>;
  }

  return (
    <div dir="rtl">
      {/* A — Command Header. Patch C: state-aware launch/resume surface —
          the status line names the current session state and the header
          offers ONE obvious action:
            active session      → המשך עבודה (same openProject restore flow)
            stones, no session  → פתח סטודיו
            saved sessions only → המשך עבודה on the latest saved session
            nothing yet         → התחל מהמלאי */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.eyebrow}>{D.eyebrow}</span>
          <h1 style={styles.title}>{D.title}</h1>
          <span style={styles.statusLine}>
            <span style={styles.statusDot} aria-hidden="true" />
            {activeProject
              ? `${C.statusActiveWork} · ${activeProject.name}`
              : realTrayItems.length > 0
              ? C.stonesInTray(realTrayItems.length)
              : C.noActiveSession}
          </span>
        </div>
        <div style={styles.headerActions}>
          {activeProject ? (
            <button type="button" onClick={() => openProject(activeProject, '/studio/design')} style={styles.primaryBtn}>
              <DesignGlyph size={15} /> {C.continueWork}
            </button>
          ) : realTrayItems.length > 0 ? (
            <button type="button" onClick={() => go('/studio/design')} style={styles.primaryBtn}>
              <DesignGlyph size={15} /> {C.openStudio}
            </button>
          ) : latestProject ? (
            <button
              type="button"
              onClick={() => openProject(latestProject, '/studio/design')}
              style={styles.primaryBtn}
              title={`${C.resumeLatest} · ${latestProject.name}`}
            >
              <ProjectsGlyph size={15} /> {C.continueWork} · {latestProject.name}
            </button>
          ) : (
            <button type="button" onClick={() => go('/studio/inventory')} style={styles.primaryBtn}>
              <InventoryGlyph size={15} /> {C.startFromInventory}
            </button>
          )}
        </div>
      </header>

      {/* B — Quick Launch Strip */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>{C.quickLaunchTitle}</h2>
        <div style={styles.quickRow}>
          {QUICK_LAUNCH.map(({ key, route, Icon, primary }) => (
            <button
              key={key}
              type="button"
              onClick={() => go(route)}
              style={{ ...styles.quickTile, ...(primary ? styles.quickTilePrimary : null) }}
            >
              <span style={{ ...styles.quickGlyph, ...(primary ? styles.quickGlyphPrimary : null) }} aria-hidden="true">
                <Icon />
              </span>
              <span style={styles.quickLabel}>
                {primary ? STUDIO_CTA_HE.label : C.quickLaunch[key]}
              </span>
              {primary ? (
                <span style={styles.quickHelper}>{STUDIO_CTA_HE.helper}</span>
              ) : null}
            </button>
          ))}
        </div>
      </section>

      <div style={styles.twoCol}>
        {/* C — Inventory Pulse */}
        <section style={styles.card}>
          <div style={styles.cardHead}>
            <h2 style={styles.cardTitle}>{C.inventoryPulseTitle}</h2>
            <button type="button" onClick={() => go('/studio/inventory')} style={styles.cardLink}>
              {D.modules.inventory} <ArrowGlyph size={12} />
            </button>
          </div>
          <div style={styles.pulseGrid}>
            <PulseStat label={C.inventoryStat.total} value={invStats.total} />
            <PulseStat label={C.inventoryStat.available} value={invStats.available} />
            <PulseStat label={C.inventoryStat.inTray} value={invStats.inTray} />
            <PulseStat label={C.inventoryStat.reserved} value={invStats.reserved} />
            <PulseStat label={C.inventoryStat.supplier} value={invStats.supplier} />
            <PulseStat label={C.inventoryStat.clientOwned} value={invStats.clientOwned} />
          </div>
          {pulseThumbs.length > 0 && (
            <div style={styles.pulseThumbRow}>
              {pulseThumbs.map((item) => (
                <span key={item.id} style={styles.pulseThumb}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.boxImage || item.thumbImage} alt="" style={styles.pulseThumbImg} />
                </span>
              ))}
            </div>
          )}
        </section>

        {/* D — Active Work Tray */}
        <section style={styles.card}>
          <div style={styles.cardHead}>
            <h2 style={styles.cardTitle}>{C.activeTrayTitle}</h2>
            <button type="button" onClick={() => go('/studio/tray')} style={styles.cardLink}>
              {D.modules.workTray} <ArrowGlyph size={12} />
            </button>
          </div>
          {realTrayItems.length === 0 ? (
            <p style={styles.emptyLine}>{C.activeTrayEmpty}</p>
          ) : (
            <div style={styles.trayChipRow}>
              {realTrayItems.slice(0, 8).map((item) => {
                const s = item.snapshot || {};
                const title = s.name || s.stoneTypeHe || s.productTypeHe || '—';
                return (
                  <button key={item.id} type="button" onClick={() => go('/studio/design')} style={styles.trayChip} title={title}>
                    <span style={styles.trayChipThumb}>
                      {s.primaryImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.primaryImage} alt="" style={styles.trayChipImg} />
                      ) : (
                        <TrayGlyph size={14} />
                      )}
                    </span>
                    <span style={styles.trayChipLabel}>{title}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* E — Design Pipeline. Patch C: shows only the REAL stages of the
          working backbone (Inventory → Tray → Studio → Concepts). The future
          "product" stage is no longer rendered — no coming-soon clutter in
          the main path. */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>{C.pipelineTitle}</h2>
        <div style={styles.pipelineRow}>
          {['inventory', 'tray', 'studio', 'concepts'].map((key, i) => {
            const reached = pipelineReached[i];
            return (
              <React.Fragment key={key}>
                {i > 0 && (
                  <span style={styles.pipelineArrow} aria-hidden="true">
                    <ArrowGlyph size={13} />
                  </span>
                )}
                <span
                  style={{
                    ...styles.pipelineStage,
                    ...(reached ? styles.pipelineStageDone : null),
                  }}
                >
                  {reached ? <CheckGlyph /> : null}
                  {C.pipeline[key]}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      </section>

      <div style={styles.twoCol}>
        {/* F — Recent Activity */}
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>{C.activityTitle}</h2>
          {activity.length === 0 ? (
            <p style={styles.emptyLine}>{C.activityEmpty}</p>
          ) : (
            <div style={styles.activityList}>
              {activity.slice(0, 5).map((entry) => (
                <div key={entry.id} style={styles.activityRow}>
                  <span style={styles.activityDot} aria-hidden="true" />
                  <span style={styles.activityText}>{entry.textHe}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* G — Next Actions */}
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>{C.nextActionsTitle}</h2>
          <div style={styles.nextGrid}>
            <NextAction label={C.nextAction.trayStones} value={realTrayItems.length} onClick={() => go('/studio/tray')} />
            <NextAction label={C.nextAction.pendingConcepts} value={pendingConceptsCount} onClick={() => go('/studio/design')} />
            {/* Patch C — the dead "reports to complete" coming-soon card is
                replaced by a REAL work-pulse number: saved work sessions. */}
            <NextAction
              label={C.nextAction.savedSessions}
              value={projects.hydrated ? projects.active.length : null}
              onClick={() => go('/studio/projects')}
            />
            <NextAction
              label={C.nextAction.assetsNoPhoto}
              value={assetsNoPhotoCount}
              onClick={() => go('/studio/assets')}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function PulseStat({ label, value }) {
  return (
    <div style={styles.pulseStat}>
      <span style={styles.pulseValue}>{value}</span>
      <span style={styles.pulseLabel}>{label}</span>
    </div>
  );
}

function NextAction({ label, value, onClick, soon }) {
  if (soon) {
    return (
      <div style={{ ...styles.nextCard, ...styles.nextCardSoon }} aria-disabled="true">
        <span style={styles.nextValue}>—</span>
        <span style={styles.nextLabel}>{label}</span>
        <span style={styles.nextSoonTag}>{C.soon}</span>
      </div>
    );
  }
  return (
    <button type="button" onClick={onClick} style={styles.nextCard}>
      <span style={styles.nextValue}>{value == null ? '—' : value}</span>
      <span style={styles.nextLabel}>{label}</span>
    </button>
  );
}

const styles = {
  loading: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    color: tokens.color.inkFaint,
    padding: '60px 0',
    textAlign: 'center',
  },

  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px', marginBottom: '18px', flexWrap: 'wrap' },
  headerLeft: { display: 'flex', flexDirection: 'column', gap: '4px' },
  eyebrow: { fontFamily: tokens.font.body, fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', color: tokens.color.gold },
  title: { fontFamily: tokens.font.display, fontWeight: 700, fontSize: '24px', color: tokens.color.charcoal, margin: 0 },
  statusLine: { display: 'flex', alignItems: 'center', gap: '7px', fontFamily: tokens.font.body, fontSize: '12.5px', color: tokens.color.inkSoft, marginTop: '2px' },
  statusDot: { width: '7px', height: '7px', borderRadius: '50%', background: tokens.color.sage },
  headerActions: { display: 'flex', gap: '8px' },

  section: { marginBottom: '16px' },
  sectionTitle: { fontFamily: tokens.font.display, fontWeight: 700, fontSize: '14px', color: tokens.color.charcoal, margin: '0 0 8px' },

  quickRow: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  quickTile: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '92px',
    padding: '14px 12px', background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md, cursor: 'pointer', boxShadow: tokens.shadow.soft,
  },
  quickTilePrimary: { border: `1.5px solid ${tokens.color.charcoal}` },
  quickTileDisabled: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '92px',
    padding: '14px 12px', background: tokens.color.pearl, border: `1px dashed ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md, opacity: 0.75, cursor: 'default',
  },
  quickGlyph: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px',
    borderRadius: tokens.radius.sm, color: tokens.color.inkSoft, background: tokens.color.pearl,
  },
  quickGlyphPrimary: { color: tokens.color.charcoal, background: tokens.color.ivory },
  quickLabel: { fontFamily: tokens.font.body, fontSize: '12px', fontWeight: 700, color: tokens.color.charcoal, textAlign: 'center' },
  // Clean 6G — one-line helper under the primary Studio tile label only.
  quickHelper: { fontFamily: tokens.font.body, fontSize: '10.5px', fontWeight: 500, color: tokens.color.inkSoft, textAlign: 'center', lineHeight: 1.45, maxWidth: '180px' },
  quickSoon: { fontFamily: tokens.font.body, fontSize: '9px', fontWeight: 700, color: tokens.color.inkFaint, letterSpacing: '0.04em' },

  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', alignItems: 'start' },
  card: {
    background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.lg,
    padding: '14px', boxShadow: tokens.shadow.soft,
  },
  cardHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', gap: '10px' },
  cardTitle: { fontFamily: tokens.font.display, fontWeight: 700, fontSize: '14px', color: tokens.color.charcoal, margin: '0 0 10px' },
  cardLink: {
    display: 'inline-flex', alignItems: 'center', gap: '5px', fontFamily: tokens.font.body, fontSize: '11.5px', fontWeight: 700,
    color: tokens.color.inkSoft, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0,
  },

  pulseGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' },
  pulseStat: { background: tokens.color.ivory, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.sm, padding: '8px 10px' },
  pulseValue: { display: 'block', fontSize: '16px', fontWeight: 700, color: tokens.color.charcoal, fontFamily: tokens.font.display },
  pulseLabel: { display: 'block', marginTop: '1px', fontSize: '10px', color: tokens.color.inkFaint, fontWeight: 600 },
  pulseThumbRow: { display: 'flex', gap: '6px', marginTop: '10px' },
  pulseThumb: {
    width: '38px', height: '38px', borderRadius: tokens.radius.xs || tokens.radius.sm, overflow: 'hidden',
    background: tokens.color.pearl, border: `1px solid ${tokens.color.cardEdge}`, display: 'inline-flex', flexShrink: 0,
  },
  pulseThumbImg: { width: '100%', height: '100%', objectFit: 'contain' },

  emptyLine: { fontFamily: tokens.font.body, fontSize: '13px', color: tokens.color.inkFaint, margin: 0 },
  trayChipRow: { display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' },
  trayChip: {
    display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0, maxWidth: '150px',
    padding: '6px 10px 6px 6px', background: tokens.color.ivory, border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.sm, cursor: 'pointer',
  },
  trayChipThumb: {
    width: '26px', height: '26px', borderRadius: tokens.radius.xs || tokens.radius.sm, overflow: 'hidden',
    background: tokens.color.pearl, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    color: tokens.color.inkFaint, flexShrink: 0,
  },
  trayChipImg: { width: '100%', height: '100%', objectFit: 'contain' },
  trayChipLabel: { fontFamily: tokens.font.body, fontSize: '12px', fontWeight: 600, color: tokens.color.charcoal, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },

  pipelineRow: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' },
  pipelineStage: {
    display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
    background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md,
    fontFamily: tokens.font.body, fontSize: '12.5px', fontWeight: 700, color: tokens.color.inkSoft,
  },
  pipelineStageDone: { color: tokens.color.charcoal, border: `1px solid ${tokens.color.sage}`, background: tokens.color.sageFaint },
  pipelineStageFuture: { color: tokens.color.inkFaint, borderStyle: 'dashed' },
  pipelineFutureTag: { fontSize: '9.5px', fontWeight: 700, marginInlineStart: '4px', color: tokens.color.inkFaint },
  pipelineArrow: { color: tokens.color.inkFaint, display: 'inline-flex' },

  activityList: { display: 'flex', flexDirection: 'column', gap: '2px' },
  activityRow: { display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 0', borderBottom: `1px solid ${tokens.color.cardEdge}` },
  activityDot: { width: '5px', height: '5px', borderRadius: '50%', background: tokens.color.gold, flexShrink: 0 },
  activityText: { fontFamily: tokens.font.body, fontSize: '12.5px', color: tokens.color.inkSoft },

  nextGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  nextCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px', textAlign: 'right',
    padding: '10px 12px', background: tokens.color.ivory, border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.sm, cursor: 'pointer',
  },
  nextCardSoon: { opacity: 0.7, cursor: 'default', background: tokens.color.pearl, borderStyle: 'dashed' },
  nextValue: { fontSize: '16px', fontWeight: 700, color: tokens.color.charcoal, fontFamily: tokens.font.display },
  nextLabel: { fontSize: '11px', fontWeight: 600, color: tokens.color.inkSoft },
  nextSoonTag: { fontSize: '9.5px', fontWeight: 700, color: tokens.color.inkFaint, marginTop: '2px' },

  // Shared buttons
  primaryBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '7px', minHeight: '40px', padding: '9px 16px',
    fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 700, color: tokens.color.ivory,
    background: tokens.color.charcoal, border: 'none', borderRadius: tokens.radius.md, cursor: 'pointer',
  },
};
