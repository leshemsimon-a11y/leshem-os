// components/studio/shared/ActiveWorkBadge.js
//
// LESHEM.S OS — Active Work indicator (Clean 4C.1)
//
// A small, calm strip shown in the Work Tray and Design Studio: "עבודה פעילה:
// [name]" when a work (Design Project) is active, or a gentle hint to save the
// tray as a work when none is active. Resolves the active work id (from the
// shared active-work pointer) against the design-projects store to show the
// name. Local only; read-only display.

import * as React from 'react';
import { tokens } from '../shared/tokens';
import { ACTIVE_WORK_HE } from '../../../lib/studio/labels';
import { createUseActiveWork } from '../../../lib/studio/activeWorkStore';
import { createUseDesignProjects } from '../../../lib/studio/designProjects';

const useActiveWork = createUseActiveWork(React);
const useDesignProjects = createUseDesignProjects(React);

export default function ActiveWorkBadge() {
  const active = useActiveWork();
  const projects = useDesignProjects();

  if (!active.hydrated || !projects.hydrated) return null;

  const project =
    active.activeWorkId && projects.projects.find((p) => p.id === active.activeWorkId);

  if (!project) {
    return (
      <div style={{ ...styles.strip, ...styles.none }} dir="rtl">
        <span style={styles.dot} aria-hidden="true" />
        <span style={styles.noneText}>{ACTIVE_WORK_HE.none}</span>
      </div>
    );
  }

  return (
    <div style={{ ...styles.strip, ...styles.active }} dir="rtl">
      <span style={{ ...styles.dot, background: tokens.color.gold }} aria-hidden="true" />
      <span style={styles.text}>
        {ACTIVE_WORK_HE.activePrefix}
        <strong style={styles.name}>{project.name}</strong>
      </span>
    </div>
  );
}

const styles = {
  strip: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: tokens.radius.md, marginBottom: '16px' },
  active: { background: tokens.color.goldFaint, border: `1px solid ${tokens.color.goldSoft}` },
  none: { background: tokens.color.pearl, border: `1px solid ${tokens.color.cardEdge}` },
  dot: { width: '9px', height: '9px', borderRadius: '50%', background: tokens.color.goldSoft, flexShrink: 0 },
  text: { fontFamily: tokens.font.body, fontSize: '13px', color: tokens.color.charcoal },
  name: { fontFamily: tokens.font.body, fontWeight: 700, color: tokens.color.charcoal },
  noneText: { fontFamily: tokens.font.body, fontSize: '13px', color: tokens.color.inkSoft },
};
