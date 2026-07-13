// components/studio/shell/ActiveSessionBar.js
//
// LESHEM.S OS — Active Session context bar (Patch C — OS Hardening V1).
//
// ONE compact, persistent app-frame strip that answers, at a glance:
// which work session (תיק עבודה) is active, how many stones are in the Work
// Tray, and what the single next logical action is. Mounted once by the
// app-frame StudioShell so it appears across the major studio screens —
// EXCEPT the full-bleed Design Studio page, which already carries its own
// command bar with the same session status (no duplication).
//
// READ-ONLY over existing stores: activeWorkStore + designProjects (which
// session is active), workTray (stone count), designBriefStore (whether a
// concept is selected). The one action is plain navigation — no restore
// logic here (restore stays where it already lives: the Projects library
// and the Command Center openProject flow). No new store, no persistence,
// no Airtable, no network.
//
// States (short text only, one CTA):
//   • active project           → name · tray count · «המשך עבודה» → /studio/design
//   • stones in tray, no proj. → «X אבנים במגש» · «פתח סטודיו»   → /studio/design
//   • nothing yet              → «אין תיק פעיל» · «התחל מהמלאי»  → /studio/inventory
//   • concept selected         → adds a quiet «כיוון נבחר» chip to either state.

import * as React from 'react';
import { useRouter } from 'next/router';
import { tokens } from '../shared/tokens';
import { SESSION_BAR_HE } from '../../../lib/studio/labels';
import { createUseActiveWork } from '../../../lib/studio/activeWorkStore';
import { createUseDesignProjects } from '../../../lib/studio/designProjects';
import { createUseWorkTray } from '../../../lib/studio/workTray';
import { createUseDesignBrief } from '../../../lib/studio/designBriefStore';

const useActiveWork = createUseActiveWork(React);
const useDesignProjects = createUseDesignProjects(React);
const useWorkTray = createUseWorkTray(React);
const useDesignBrief = createUseDesignBrief(React);

const L = Object.freeze({
  ...SESSION_BAR_HE,
  activeSession: 'היצירה הפעילה',
  noActiveSession: 'אין יצירה פעילה',
});

export default function ActiveSessionBar({ variant = 'desktop' }) {
  const router = useRouter();
  const active = useActiveWork();
  const projects = useDesignProjects();
  const tray = useWorkTray();
  const briefStore = useDesignBrief();

  // The Design Studio workstation carries its own command bar with the same
  // session status — never double up (covers the mobile layout, where the
  // shell renders this bar unconditionally).
  if (router.pathname === '/studio/design') return null;

  // Hidden before hydration — no flash, no SSR mismatch.
  if (!active.hydrated || !projects.hydrated || !tray.hydrated || !briefStore.hydrated) {
    return null;
  }

  const activeProject = active.activeWorkId
    ? projects.projects.find((p) => p.id === active.activeWorkId) || null
    : null;
  const trayCount = tray.count || 0;
  const brief = briefStore.brief || {};
  const conceptSelected = Boolean(brief.selectedConceptId);

  let statusText;
  let ctaLabel;
  let ctaRoute;
  if (activeProject) {
    statusText = activeProject.name;
    ctaLabel = L.continueWork;
    ctaRoute = '/studio/design';
  } else if (trayCount > 0) {
    statusText = L.stonesInTray(trayCount);
    ctaLabel = L.openStudio;
    ctaRoute = '/studio/design';
  } else {
    statusText = L.noActiveSession;
    ctaLabel = L.startFromInventory;
    ctaRoute = '/studio/inventory';
  }

  // No self-navigation CTA: on the destination page the button is hidden
  // (the status text still anchors context).
  const showCta = router.pathname !== ctaRoute;

  return (
    <div
      style={{ ...styles.bar, ...(variant === 'mobile' ? styles.barMobile : null) }}
      dir="rtl"
      role="status"
      aria-label={L.ariaBar}
    >
      <span style={styles.dot} aria-hidden="true" />
      <span style={styles.eyebrow}>
        {activeProject ? L.activeSession : ''}
      </span>
      <span style={styles.statusText} title={statusText}>
        {statusText}
      </span>

      {activeProject && trayCount > 0 && (
        <span style={styles.chip}>{L.stonesInTray(trayCount)}</span>
      )}
      {conceptSelected && (activeProject || trayCount > 0) && (
        <span style={styles.chip}>{L.conceptSelected}</span>
      )}

      {showCta && (
        <button type="button" onClick={() => router.push(ctaRoute)} style={styles.cta}>
          {ctaLabel}
        </button>
      )}
    </div>
  );
}

const styles = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minHeight: '40px',
    padding: '6px 14px',
    marginBottom: '18px',
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    boxShadow: tokens.shadow.soft,
    fontFamily: tokens.font.body,
  },
  barMobile: {
    marginBottom: '14px',
    padding: '6px 12px',
  },
  dot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: tokens.color.gold,
    flexShrink: 0,
  },
  eyebrow: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: tokens.color.inkFaint,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  statusText: {
    flex: '1 1 auto',
    minWidth: 0,
    fontSize: '13px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chip: {
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.color.inkSoft,
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: '999px',
    padding: '3px 10px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  cta: {
    minHeight: '30px',
    padding: '5px 14px',
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 700,
    color: tokens.color.ivory,
    background: tokens.color.charcoal,
    border: 'none',
    borderRadius: tokens.radius.sm,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
};
