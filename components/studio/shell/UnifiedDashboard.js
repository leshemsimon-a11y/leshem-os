// components/studio/shell/UnifiedDashboard.js
//
// LESHEM.S OS — Dashboard Guided Actions (Clean 4C.2)
//
// The Dashboard is the guiding "action center" that answers "What do you want
// to do now?" rather than listing modules. It has three calm bands:
//   1. Active Work — the current Design Project (from the Clean 4C.1 active-work
//      mechanism), with quick open actions, or a gentle start-new prompt.
//   2. Guided action cards — business-language entry points into the core flows
//      (design from a stone, add goods, client-owned goods, continue work, open
//      tray, work with files), plus a disabled "build collection" future card.
//   3. Recent work + secondary module links (kept available but secondary).
//
// Reuses existing stores only (activeWorkStore + designProjects). No new module,
// no Airtable, no network, no new packages, no UI/UX redesign.

import * as React from 'react';
import { useRouter } from 'next/router';
import { tokens } from '../shared/tokens';
import { DASH_ACTIONS_HE, PROJECTS_HE } from '../../../lib/studio/labels';
import { createUseActiveWork } from '../../../lib/studio/activeWorkStore';
import { createUseDesignProjects } from '../../../lib/studio/designProjects';
import { createUseWorkTray } from '../../../lib/studio/workTray';
import { createUseDesignBrief } from '../../../lib/studio/designBriefStore';

const useActiveWork = createUseActiveWork(React);
const useDesignProjects = createUseDesignProjects(React);
const useWorkTray = createUseWorkTray(React);
const useDesignBrief = createUseDesignBrief(React);

const D = DASH_ACTIONS_HE;

// Guided action cards. `tone: 'gold'` marks the primary (design) card; the
// collection card is disabled (future). Routes use query hints for quick-add.
const GUIDED = [
  { key: 'createJewelry', route: '/studio/design', tone: 'gold' },
  { key: 'design', route: '/studio/inventory' },
  { key: 'addGoods', route: '/studio/inventory?add=1' },
  { key: 'clientStone', route: '/studio/inventory?add=client' },
  { key: 'continueWork', route: '/studio/projects' },
  { key: 'openTray', route: '/studio/tray' },
  { key: 'assets', route: '/studio/assets' },
];

const MODULES = [
  { key: 'inventory', route: '/studio/inventory' },
  { key: 'workTray', route: '/studio/tray' },
  { key: 'design', route: '/studio/design' },
  { key: 'projects', route: '/studio/projects' },
  { key: 'assets', route: '/studio/assets' },
];

function formatDate(ts) {
  if (!ts) return '';
  try {
    return new Date(ts).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
  } catch (e) {
    return '';
  }
}

export default function UnifiedDashboard() {
  const router = useRouter();
  const active = useActiveWork();
  const projects = useDesignProjects();
  const tray = useWorkTray();
  const brief = useDesignBrief();

  const go = (route) => router.push(route);

  // Open means: restore the saved work state into the live Work Tray + Design
  // Brief, mark it as the Active Work, then route to the requested work surface.
  // This keeps Dashboard actions focused and avoids making users hunt through
  // Projects just to continue the current job.
  const openProject = (project, route = '/studio/design') => {
    if (!project) return;
    tray.replace(project.trayItems || []);
    brief.set(project.brief || {});
    active.setActiveWork(project.id);
    router.push(route);
  };

  const activeProject =
    active.hydrated && projects.hydrated && active.activeWorkId
      ? projects.projects.find((p) => p.id === active.activeWorkId)
      : null;

  // Recent active (non-archived) works, newest first, capped small.
  const recent = projects.hydrated
    ? [...projects.active]
        .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
        .slice(0, 4)
    : [];

  return (
    <div dir="rtl">
      <header style={styles.header}>
        <span style={styles.eyebrow}>{D.eyebrow}</span>
        <h1 style={styles.title}>{D.title}</h1>
      </header>

      {/* 1 — Active Work band */}
      <section style={styles.activeBand}>
        {activeProject ? (
          <>
            <div style={styles.activeInfo}>
              <span style={styles.activeDot} aria-hidden="true" />
              <span style={styles.activeText}>
                {D.activePrefix}
                <strong style={styles.activeName}>{activeProject.name}</strong>
              </span>
            </div>
            <div style={styles.activeActions}>
              <button type="button" onClick={() => openProject(activeProject, '/studio/design')} style={styles.primaryBtn}>
                {D.openWork}
              </button>
              <button type="button" onClick={() => openProject(activeProject, '/studio/design')} style={styles.ghostBtn}>
                {D.openStudio}
              </button>
              <button type="button" onClick={() => openProject(activeProject, '/studio/tray')} style={styles.ghostBtn}>
                {D.openTray}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={styles.activeInfo}>
              <span style={{ ...styles.activeDot, background: tokens.color.cardEdge }} aria-hidden="true" />
              <div>
                <span style={styles.noActiveText}>{D.noActive}</span>
                <p style={styles.noActiveHint}>{D.noActiveHint}</p>
              </div>
            </div>
            <div style={styles.activeActions}>
              <button type="button" onClick={() => go('/studio/inventory')} style={styles.primaryBtn}>
                {D.startNewWork}
              </button>
            </div>
          </>
        )}
      </section>

      {/* 2 — Guided action cards */}
      <h2 style={styles.sectionTitle}>{D.guidedTitle}</h2>
      <div style={styles.grid}>
        {GUIDED.map(({ key, route, tone }) => {
          const c = D.cards[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => go(route)}
              style={{ ...styles.card, ...(tone === 'gold' ? styles.cardGold : null) }}
            >
              <span style={styles.cardGlyph} aria-hidden="true">{c.glyph}</span>
              <span style={styles.cardTitle}>{c.title}</span>
              <span style={styles.cardDesc}>{c.desc}</span>
              <span style={styles.cardCta} aria-hidden="true">{c.cta} ←</span>
            </button>
          );
        })}

        {/* Disabled future card — collection builder is NOT implemented. */}
        <div style={{ ...styles.card, ...styles.cardDisabled }} aria-disabled="true">
          <span style={styles.cardGlyph} aria-hidden="true">{D.cards.collection.glyph}</span>
          <span style={styles.cardTitle}>{D.cards.collection.title}</span>
          <span style={styles.cardDesc}>{D.cards.collection.desc}</span>
          <span style={styles.comingSoon}>{D.comingSoon}</span>
        </div>
      </div>

      {/* 3 — Recent work */}
      <h2 style={styles.sectionTitle}>{D.recentTitle}</h2>
      {recent.length === 0 ? (
        <p style={styles.recentEmpty}>{D.recentEmpty}</p>
      ) : (
        <div style={styles.recentList}>
          {recent.map((p) => (
            <div key={p.id} style={styles.recentRow}>
              <div style={styles.recentInfo}>
                <span style={styles.recentName}>{p.name}</span>
                <span style={styles.recentMeta}>
                  {(PROJECTS_HE.status && PROJECTS_HE.status[p.status]) || ''}
                  {p.updatedAt ? ` · ${D.recentUpdated}${formatDate(p.updatedAt)}` : ''}
                </span>
              </div>
              <button type="button" onClick={() => openProject(p, '/studio/design')} style={styles.recentOpen}>
                {D.recentOpen}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Secondary module links */}
      <h2 style={styles.sectionTitle}>{D.modulesTitle}</h2>
      <div style={styles.moduleRow}>
        {MODULES.map(({ key, route }) => (
          <button key={key} type="button" onClick={() => go(route)} style={styles.moduleChip}>
            {D.modules[key]}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  header: { marginBottom: '18px' },
  eyebrow: { fontFamily: tokens.font.body, fontSize: '14px', fontWeight: 600, letterSpacing: '0.06em', color: tokens.color.gold },
  title: { fontFamily: tokens.font.display, fontWeight: 700, fontSize: '32px', color: tokens.color.charcoal, margin: '6px 0 0' },

  // Active band
  activeBand: {
    display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px',
    padding: '18px 20px', marginBottom: '28px',
    background: tokens.color.goldFaint, border: `1px solid ${tokens.color.goldSoft}`, borderRadius: tokens.radius.lg,
  },
  activeInfo: { display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 },
  activeDot: { width: '10px', height: '10px', borderRadius: '50%', background: tokens.color.gold, flexShrink: 0 },
  activeText: { fontFamily: tokens.font.body, fontSize: '15px', color: tokens.color.charcoal },
  activeName: { fontFamily: tokens.font.body, fontWeight: 700, color: tokens.color.charcoal },
  noActiveText: { fontFamily: tokens.font.body, fontSize: '15px', fontWeight: 700, color: tokens.color.charcoal },
  noActiveHint: { fontFamily: tokens.font.body, fontSize: '13px', color: tokens.color.inkSoft, margin: '4px 0 0', maxWidth: '420px' },
  activeActions: { display: 'flex', flexWrap: 'wrap', gap: '8px' },

  sectionTitle: { fontFamily: tokens.font.display, fontWeight: 700, fontSize: '20px', color: tokens.color.charcoal, margin: '0 0 14px' },

  // Guided grid
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px', marginBottom: '30px' },
  card: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '7px', textAlign: 'right',
    padding: '20px', minHeight: '156px', background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.lg, boxShadow: tokens.shadow.soft,
    cursor: 'pointer', transition: 'border-color 140ms ease, box-shadow 140ms ease',
  },
  cardGold: { border: `1px solid ${tokens.color.gold}`, background: tokens.color.ivory },
  cardDisabled: { opacity: 0.6, cursor: 'default', boxShadow: 'none', background: tokens.color.pearl },
  cardGlyph: {
    fontSize: '24px', lineHeight: 1, color: tokens.color.gold, background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.goldSoft}`, borderRadius: tokens.radius.md,
    width: '44px', height: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px',
  },
  cardTitle: { fontFamily: tokens.font.display, fontWeight: 700, fontSize: '18px', color: tokens.color.charcoal, lineHeight: 1.3 },
  cardDesc: { fontFamily: tokens.font.body, fontSize: '13px', lineHeight: 1.55, color: tokens.color.inkSoft, flex: 1 },
  cardCta: { fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 700, color: tokens.color.gold, marginTop: '4px' },
  comingSoon: {
    fontFamily: tokens.font.body, fontSize: '12px', fontWeight: 600, color: tokens.color.inkSoft,
    background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: '999px', padding: '2px 10px', marginTop: '4px',
  },

  // Recent
  recentEmpty: { fontFamily: tokens.font.body, fontSize: '14px', color: tokens.color.inkFaint, margin: '0 0 30px' },
  recentList: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '30px' },
  recentRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '12px 16px',
    background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md,
  },
  recentInfo: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  recentName: { fontFamily: tokens.font.display, fontSize: '16px', color: tokens.color.charcoal, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  recentMeta: { fontFamily: tokens.font.body, fontSize: '12px', color: tokens.color.inkFaint },
  recentOpen: {
    minHeight: '40px', padding: '8px 18px', fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 700,
    color: tokens.color.charcoal, background: tokens.color.goldFaint, border: `1px solid ${tokens.color.gold}`,
    borderRadius: tokens.radius.md, cursor: 'pointer', flexShrink: 0,
  },

  // Secondary modules
  moduleRow: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  moduleChip: {
    minHeight: '42px', padding: '10px 18px', fontFamily: tokens.font.body, fontSize: '14px', fontWeight: 600,
    color: tokens.color.inkSoft, background: 'transparent', border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: '999px', cursor: 'pointer',
  },

  // Shared buttons
  primaryBtn: {
    minHeight: '44px', padding: '10px 20px', fontFamily: tokens.font.body, fontSize: '14px', fontWeight: 700,
    color: tokens.color.ivory, background: tokens.color.charcoal, border: 'none', borderRadius: tokens.radius.md, cursor: 'pointer',
  },
  ghostBtn: {
    minHeight: '44px', padding: '10px 16px', fontFamily: tokens.font.body, fontSize: '14px', fontWeight: 600,
    color: tokens.color.charcoal, background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md, cursor: 'pointer',
  },
};
