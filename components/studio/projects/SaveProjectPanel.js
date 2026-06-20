// components/studio/projects/SaveProjectPanel.js
//
// LESHEM.S OS — Save Design Project Panel (Clean 4A)
//
// A small, calm panel shown in the Design Studio that lets the jeweller save
// the CURRENT design (tray items + roles + brief + snapshot) as a persistent
// Design Project. After saving it offers a quick link to the projects library.
//
// Local only: reads the live work-tray + brief stores, builds the snapshot via
// the pure helper, and writes a new project to the design-projects store. NO
// Airtable, NO network, NO uploads, no commerce wording.

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { tokens } from '../shared/tokens';
import { PROJECTS_HE } from '../../../lib/studio/labels';
import { createUseWorkTray } from '../../../lib/studio/workTray';
import { createUseDesignBrief } from '../../../lib/studio/designBriefStore';
import { createUseDesignProjects } from '../../../lib/studio/designProjects';
import { buildDesignSnapshot } from '../../../lib/studio/designDraft';

const useWorkTray = createUseWorkTray(React);
const useDesignBrief = createUseDesignBrief(React);
const useDesignProjects = createUseDesignProjects(React);

export default function SaveProjectPanel() {
  const router = useRouter();
  const tray = useWorkTray();
  const brief = useDesignBrief();
  const projects = useDesignProjects();
  const [name, setName] = useState('');
  const [savedId, setSavedId] = useState(null);

  if (!tray.hydrated || !brief.hydrated) {
    return <div style={styles.loading}>טוען…</div>;
  }

  const hasStones = tray.items.length > 0;

  const handleSave = () => {
    const snapshot = buildDesignSnapshot(tray.items, brief.brief);
    const project = projects.save({
      name,
      trayItems: tray.items,
      brief: brief.brief,
      snapshot,
    });
    setSavedId(project ? project.id : null);
    setName('');
  };

  return (
    <div style={styles.wrap} dir="rtl">
      <p style={styles.localNote}>{PROJECTS_HE.localNote}</p>
      <p style={styles.hint}>{PROJECTS_HE.saveHint}</p>

      <div style={styles.row}>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSavedId(null);
          }}
          placeholder={PROJECTS_HE.namePlaceholder}
          style={styles.input}
          dir="rtl"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasStones}
          style={{ ...styles.saveBtn, ...(!hasStones ? styles.saveBtnDisabled : null) }}
        >
          {PROJECTS_HE.saveButton}
        </button>
      </div>

      {savedId && (
        <div style={styles.savedRow}>
          <span style={styles.savedMark}>{PROJECTS_HE.status.draft} ✓</span>
          <button
            type="button"
            onClick={() => router.push('/studio/projects')}
            style={styles.linkBtn}
          >
            {PROJECTS_HE.title} ←
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  loading: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    color: tokens.color.inkFaint,
    padding: '8px 0',
  },
  localNote: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.goldFaint}`,
    borderRadius: tokens.radius.sm,
    padding: '8px 12px',
    margin: 0,
  },
  hint: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    color: tokens.color.inkFaint,
    margin: 0,
  },
  row: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minWidth: '200px',
    boxSizing: 'border-box',
    fontFamily: tokens.font.body,
    fontSize: '15px',
    color: tokens.color.ink,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    padding: '12px 14px',
    outline: 'none',
  },
  saveBtn: {
    minHeight: '48px',
    padding: '12px 24px',
    fontFamily: tokens.font.body,
    fontSize: '15px',
    fontWeight: 600,
    color: tokens.color.ivory,
    background: tokens.color.charcoal,
    border: 'none',
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
    boxShadow: tokens.shadow.soft,
    whiteSpace: 'nowrap',
  },
  saveBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  savedRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  savedMark: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.color.charcoal,
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.goldSoft}`,
    borderRadius: '999px',
    padding: '6px 14px',
  },
  linkBtn: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.color.gold,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
};
