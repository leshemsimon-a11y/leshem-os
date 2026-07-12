// components/studio/projects/ProjectAssetsStrip.js
//
// LESHEM.S OS — Clean 8G: «רפרנסים ונכסים» — compact attached-assets strip.
//
// Shows the assets attached to the ACTIVE Work File (Design Project):
// name + Hebrew role chip + file-type label per asset, an empty-state helper
// when nothing is attached, and «פתח ספריית נכסים» → /studio/assets.
// Mounted by pages/studio/create.js below the Create Flow.
//
// READ-ONLY: resolves the active project through the EXISTING public
// activeWorkStore + designProjects APIs and the pure attachedAssets helpers.
// No persistence, no upload, no store internals, no new keys.

import * as React from 'react';
import { useRouter } from 'next/router';
import { tokens } from '../shared/tokens';
import { createUseActiveWork } from '../../../lib/studio/activeWorkStore';
import { createUseDesignProjects } from '../../../lib/studio/designProjects';
import {
  getAttachedAssets,
  attachedRoleHe,
  ATTACHED_FILE_TYPE_HE,
} from '../../../lib/studio/attachedAssets';

const useActiveWork = createUseActiveWork(React);
const useDesignProjects = createUseDesignProjects(React);

const HE = Object.freeze({
  title: 'רפרנסים ונכסים',
  empty: 'אפשר להוסיף רפרנסים וקבצים דרך ספריית הנכסים.',
  openAssets: 'פתח ספריית נכסים',
  activePrefix: 'תיק פעיל: ',
  noActive: 'אין תיק פעיל כרגע — נכסים שיצורפו יופיעו כאן לאחר שמירת תיק עבודה.',
});

export default function ProjectAssetsStrip() {
  const router = useRouter();
  const { activeWorkId, hydrated } = useActiveWork();
  const projectsStore = useDesignProjects();

  // Render only after both client-side stores hydrate (SSR renders nothing,
  // matching the studio pages' existing client-only content pattern).
  if (!hydrated || !projectsStore.hydrated) return null;

  const activeProject = activeWorkId
    ? (projectsStore.projects || []).find((p) => p.id === activeWorkId) || null
    : null;
  const attached = activeProject ? getAttachedAssets(activeProject) : [];

  return (
    <section style={styles.wrap} dir="rtl" aria-label={HE.title}>
      <div style={styles.headRow}>
        <span style={styles.title}>{HE.title}</span>
        {activeProject ? (
          <span style={styles.activeName}>
            {HE.activePrefix}
            {activeProject.name}
          </span>
        ) : null}
        <button type="button" onClick={() => router.push('/studio/assets')} style={styles.openBtn}>
          {HE.openAssets}
        </button>
      </div>

      {!activeProject ? (
        <p style={styles.empty}>{HE.noActive}</p>
      ) : attached.length === 0 ? (
        <p style={styles.empty}>{HE.empty}</p>
      ) : (
        <div style={styles.rows}>
          {attached.map((a) => (
            <div key={a.assetId} style={styles.row}>
              <span style={styles.name}>{a.name || '—'}</span>
              <span style={styles.roleChip}>{attachedRoleHe(a.role)}</span>
              <span style={styles.fileType}>
                {ATTACHED_FILE_TYPE_HE[a.fileType] || ATTACHED_FILE_TYPE_HE.other}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const styles = {
  wrap: {
    border: `1px solid ${tokens.color.goldFaint}`,
    borderRadius: tokens.radius.md,
    background: tokens.color.pearl,
    padding: '12px 14px',
    margin: '18px 0 0',
  },
  headRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '8px',
  },
  title: {
    fontFamily: tokens.font.display,
    fontSize: '15px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  activeName: {
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    color: tokens.color.inkSoft,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '260px',
  },
  openBtn: {
    marginInlineStart: 'auto',
    minHeight: '30px',
    padding: '5px 13px',
    borderRadius: '999px',
    border: `1px solid ${tokens.color.gold}`,
    background: 'transparent',
    color: tokens.color.charcoal,
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  empty: {
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    color: tokens.color.inkFaint,
    margin: 0,
  },
  rows: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    padding: '7px 11px',
    borderRadius: tokens.radius.sm,
    border: `1px solid ${tokens.color.goldFaint}`,
    background: '#FFFFFF',
  },
  name: {
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    minWidth: 0,
    flex: '1 1 160px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  roleChip: {
    fontFamily: tokens.font.body,
    fontSize: '10.5px',
    fontWeight: 600,
    color: tokens.color.charcoal,
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.gold}`,
    borderRadius: tokens.radius.sm,
    padding: '1px 7px',
    whiteSpace: 'nowrap',
  },
  fileType: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    color: tokens.color.inkSoft,
    whiteSpace: 'nowrap',
  },
};
