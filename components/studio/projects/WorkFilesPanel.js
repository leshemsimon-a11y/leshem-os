// components/studio/projects/WorkFilesPanel.js
//
// LESHEM.S OS — Clean 8K-R3: Atelier Experience System (Creations Gallery
// redesign of the Clean 7A/8K Work Files panel).
//
// Each card now shows exactly the four things section 6 asks for: cover
// image (from the center stone's existing snapshot image) or an elegant
// placeholder, creation name, one short state line, and last updated.
// Clicking the card body continues the creation (same `onContinue` this
// panel always had). Rename/duplicate/archive moved into one compact "⋯"
// options menu per card — duplicate/archive are NEW to this UI, but call
// the EXISTING public `projectsStore.duplicate` / `.archive` methods
// (already exposed by lib/studio/designProjects.js's hook, just not wired
// into any screen before now); the genuinely destructive delete action was
// deliberately left out of this visual-only sprint (see the changelog).
//
// PRESENTATIONAL only: projects/activeId/callbacks arrive as props; display
// values are derived here from fields Work Files already hold (no schema
// change, no store imports beyond pure read helpers, no persistence).

import * as React from 'react';
import { tokens } from '../shared/tokens';
import {
  getSelectedConcept,
  getActiveOutput,
  conceptsAreStale,
  outputIsStale,
  DESIGN_ROLE,
  normalizeRole,
} from '../../../lib/studio/designDraft';
import { computeWorkspaceStage, stageStateHe } from '../../../lib/studio/creationOrchestrator';

export const WORK_FILES_HE = Object.freeze({
  // Clean 8K — "תיקי עבודה" now reads "תיקי יצירה" per the milestone's
  // terminology pass ("Work Files → תיקי יצירה"). Internal export name and
  // component name unchanged.
  title: 'תיקי יצירה',
  hint: 'לחיצה על כרטיס ממשיכה את היצירה.',
  continueAction: 'המשך יצירה',
  // Clean 8F — card action clarity. Clean 8K — "חבילת פלט" now reads
  // "ערכת הצגה". Clean 8K-R3 — kept as one of the (max two) visible
  // secondary actions per card; management actions moved to the "⋯" menu.
  openPackAction: 'ערכת הצגה',
  activeBadge: 'היצירה הפעילה',
  empty: 'אין עדיין יצירות שמורות — אפשר להתחיל מ״יצירה חדשה״.',
  updatedPrefix: 'עודכן',
  createdPrefix: 'נוצר',
  // Clean 8B — rename Work File.
  renameAction: 'שנה שם',
  renameSave: 'שמור שם',
  renameCancel: 'ביטול',
  // Clean 8E — Media Workflow. Clean 8K — "מדיה והדמיות" now reads
  // "הדמיות ותצוגה".
  mediaAction: 'הדמיות ותצוגה',
  // Clean 8K-R3 — compact options menu (section 6).
  moreOptions: 'אפשרויות נוספות',
  duplicateAction: 'שכפל',
  archiveAction: 'העבר לארכיון',
});

const dateHe = (ts) =>
  typeof ts === 'number' && ts > 0 ? new Date(ts).toLocaleDateString('he-IL') : null;

function coverImage(project) {
  const trayItems = Array.isArray(project.trayItems) ? project.trayItems : [];
  const center =
    trayItems.find((it) => normalizeRole(it.role) === DESIGN_ROLE.CENTER_STONE) || trayItems[0] || null;
  return center && center.snapshot && center.snapshot.primaryImage ? center.snapshot.primaryImage : null;
}

// Reuses the EXACT same short-state vocabulary the single Creation
// Workspace's own top bar already shows (lib/studio/creationOrchestrator.js
// — Clean 8K-R2), so a creation reads the same way whether the person is
// looking at the gallery or already inside it.
function shortStateHe(project) {
  const brief = project.brief || {};
  const trayItems = Array.isArray(project.trayItems) ? project.trayItems : [];
  const hasStones = trayItems.length > 0;
  const hasConcepts = Array.isArray(brief.concepts) && brief.concepts.length > 0;
  const selected = getSelectedConcept(brief);
  const output = getActiveOutput(brief);
  const stage = computeWorkspaceStage({
    hasStones,
    hasIntentText: Boolean(
      (brief.designGoal && String(brief.designGoal).trim()) ||
        (brief.intention && String(brief.intention).trim())
    ),
    hasConcepts,
    conceptsStale: conceptsAreStale(brief, trayItems),
    selected,
    output,
    outStale: outputIsStale(brief, trayItems),
  });
  return stageStateHe(stage);
}

function lastUpdatedHe(project) {
  const updated = dateHe(project.updatedAt) || dateHe(project.createdAt);
  const prefix = dateHe(project.updatedAt) ? WORK_FILES_HE.updatedPrefix : WORK_FILES_HE.createdPrefix;
  return updated ? `${prefix} ${updated}` : null;
}

// A quiet, elegant SVG placeholder for creations with no stone image yet —
// no image/icon package, plain inline SVG (same approach used throughout
// this milestone and Clean 8K's CreativeAreaRail.js).
function CoverPlaceholder() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
      <rect width="100" height="100" fill={tokens.color.pearl} />
      <path
        d="M35 32h30l15 18-30 26-30-26 15-18z"
        fill="none"
        stroke={tokens.color.goldFaint}
        strokeWidth="1.6"
      />
    </svg>
  );
}

export default function WorkFilesPanel({
  projects,
  activeId,
  onContinue,
  onOpenPack,
  onRename,
  onOpenMedia,
  // Clean 8K-R3 — OPTIONAL new management actions. Existing call sites
  // that don't pass these simply don't show them in the "⋯" menu; nothing
  // about the panel's existing behavior changes if they're omitted.
  onDuplicate,
  onArchive,
}) {
  const list = Array.isArray(projects) ? projects : [];
  // Clean 8B — inline rename (UI state only; persistence happens in the
  // caller through the existing public updateProject API).
  const [renamingId, setRenamingId] = React.useState(null);
  const [renameValue, setRenameValue] = React.useState('');
  // Clean 8K-R3 — which card's compact "⋯" menu is open (UI state only).
  const [menuOpenId, setMenuOpenId] = React.useState(null);

  const startRename = (p) => {
    setMenuOpenId(null);
    setRenamingId(p.id);
    setRenameValue(p.name || '');
  };
  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue('');
  };
  const commitRename = (p) => {
    const next = renameValue.trim();
    if (next && onRename) onRename(p, next);
    cancelRename();
  };

  return (
    <section style={styles.wrap} dir="rtl" aria-label={WORK_FILES_HE.title}>
      <div style={styles.headRow}>
        <span style={styles.title}>{WORK_FILES_HE.title}</span>
        <span style={styles.hint}>{WORK_FILES_HE.hint}</span>
      </div>

      {list.length === 0 ? (
        <p style={styles.empty}>{WORK_FILES_HE.empty}</p>
      ) : (
        <div style={styles.grid}>
          {list.map((p) => {
            const isActive = p.id === activeId;
            const isRenaming = renamingId === p.id;
            const isMenuOpen = menuOpenId === p.id;
            const image = coverImage(p);
            const hasManagementMenu =
              typeof onRename === 'function' ||
              typeof onDuplicate === 'function' ||
              typeof onArchive === 'function';

            return (
              <div key={p.id} style={{ ...styles.card, ...(isActive ? styles.cardActive : null) }}>
                <button
                  type="button"
                  style={styles.coverBtn}
                  onClick={() => onContinue && onContinue(p)}
                  aria-label={`${WORK_FILES_HE.continueAction}: ${p.name}`}
                >
                  <span style={styles.coverWrap}>
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt="" style={styles.coverImg} />
                    ) : (
                      <CoverPlaceholder />
                    )}
                  </span>
                  {isActive ? <span style={styles.activeBadge}>{WORK_FILES_HE.activeBadge}</span> : null}
                </button>

                <div style={styles.cardBody}>
                  {isRenaming ? (
                    <span style={styles.renameRow}>
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        style={styles.renameInput}
                        dir="rtl"
                        aria-label={WORK_FILES_HE.renameAction}
                        autoFocus
                      />
                      <button type="button" onClick={() => commitRename(p)} style={styles.renameSaveBtn}>
                        {WORK_FILES_HE.renameSave}
                      </button>
                      <button type="button" onClick={cancelRename} style={styles.renameCancelBtn}>
                        {WORK_FILES_HE.renameCancel}
                      </button>
                    </span>
                  ) : (
                    <div style={styles.nameRow}>
                      <button
                        type="button"
                        style={styles.nameBtn}
                        onClick={() => onContinue && onContinue(p)}
                        title={p.name}
                      >
                        {p.name}
                      </button>
                      {hasManagementMenu ? (
                        <span style={styles.menuWrap}>
                          <button
                            type="button"
                            style={styles.menuToggle}
                            onClick={() => setMenuOpenId(isMenuOpen ? null : p.id)}
                            aria-label={WORK_FILES_HE.moreOptions}
                            aria-expanded={isMenuOpen}
                            title={WORK_FILES_HE.moreOptions}
                          >
                            ⋯
                          </button>
                          {isMenuOpen ? (
                            <div style={styles.menu} role="menu">
                              {typeof onRename === 'function' ? (
                                <button type="button" style={styles.menuItem} onClick={() => startRename(p)}>
                                  {WORK_FILES_HE.renameAction}
                                </button>
                              ) : null}
                              {typeof onDuplicate === 'function' ? (
                                <button
                                  type="button"
                                  style={styles.menuItem}
                                  onClick={() => {
                                    setMenuOpenId(null);
                                    onDuplicate(p);
                                  }}
                                >
                                  {WORK_FILES_HE.duplicateAction}
                                </button>
                              ) : null}
                              {typeof onArchive === 'function' ? (
                                <button
                                  type="button"
                                  style={styles.menuItem}
                                  onClick={() => {
                                    setMenuOpenId(null);
                                    onArchive(p);
                                  }}
                                >
                                  {WORK_FILES_HE.archiveAction}
                                </button>
                              ) : null}
                            </div>
                          ) : null}
                        </span>
                      ) : null}
                    </div>
                  )}

                  <span style={styles.stateLine}>{shortStateHe(p)}</span>
                  <span style={styles.updatedLine}>{lastUpdatedHe(p)}</span>

                  <div style={styles.actions}>
                    <button type="button" onClick={() => onOpenPack && onOpenPack(p)} style={styles.packBtn}>
                      {WORK_FILES_HE.openPackAction}
                    </button>
                    {typeof onOpenMedia === 'function' ? (
                      <button type="button" onClick={() => onOpenMedia(p)} style={styles.mediaBtn}>
                        {WORK_FILES_HE.mediaAction}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
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
    padding: '14px 16px',
    margin: '0 0 24px',
  },
  headRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '10px',
  },
  title: {
    fontFamily: tokens.font.display,
    fontSize: '17px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  hint: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.inkSoft,
  },
  empty: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    color: tokens.color.inkFaint,
    margin: 0,
  },
  // Clean 8K-R3 — image-first gallery grid (was a row/list).
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
    gap: '12px',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: tokens.radius.md,
    border: `1px solid ${tokens.color.goldFaint}`,
    background: '#FFFFFF',
    overflow: 'hidden',
  },
  cardActive: {
    border: `1px solid ${tokens.color.gold}`,
    boxShadow: `0 0 0 1px ${tokens.color.gold}`,
  },
  coverBtn: {
    position: 'relative',
    display: 'block',
    width: '100%',
    aspectRatio: '1 / 1',
    border: 'none',
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    background: tokens.color.pearl,
  },
  coverWrap: { display: 'block', width: '100%', height: '100%' },
  coverImg: { width: '100%', height: '100%', objectFit: 'contain', display: 'block' },
  activeBadge: {
    position: 'absolute',
    top: '8px',
    insetInlineEnd: '8px',
    padding: '3px 10px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.92)',
    border: `1px solid ${tokens.color.gold}`,
    color: tokens.color.gold,
    fontFamily: tokens.font.body,
    fontSize: '10px',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    padding: '10px 11px 11px',
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '6px',
    minWidth: 0,
  },
  nameBtn: {
    flex: '1 1 auto',
    minWidth: 0,
    textAlign: 'right',
    border: 'none',
    background: 'transparent',
    padding: 0,
    cursor: 'pointer',
    fontFamily: tokens.font.body,
    fontSize: '13.5px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  menuWrap: { position: 'relative', flexShrink: 0 },
  menuToggle: {
    minWidth: '26px',
    minHeight: '26px',
    borderRadius: '999px',
    border: `1px solid ${tokens.color.goldFaint}`,
    background: 'transparent',
    color: tokens.color.inkSoft,
    cursor: 'pointer',
    fontSize: '14px',
    lineHeight: 1,
  },
  menu: {
    position: 'absolute',
    top: '30px',
    insetInlineEnd: 0,
    zIndex: 5,
    display: 'flex',
    flexDirection: 'column',
    minWidth: '130px',
    background: '#FFFFFF',
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.sm,
    boxShadow: tokens.shadow.lift,
    overflow: 'hidden',
  },
  menuItem: {
    textAlign: 'right',
    padding: '9px 12px',
    border: 'none',
    borderBottom: `1px solid ${tokens.color.cardEdge}`,
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    fontWeight: 600,
    color: tokens.color.charcoal,
  },
  // Clean 8B — inline rename controls.
  renameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
    minWidth: 0,
  },
  renameInput: {
    minHeight: '30px',
    flex: '1 1 100px',
    minWidth: 0,
    boxSizing: 'border-box',
    padding: '5px 9px',
    borderRadius: tokens.radius.sm,
    border: `1px solid ${tokens.color.gold}`,
    background: '#FFFFFF',
    color: tokens.color.charcoal,
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    fontWeight: 600,
    outline: 'none',
  },
  renameSaveBtn: {
    minHeight: '30px',
    padding: '4px 11px',
    borderRadius: '999px',
    border: 'none',
    background: tokens.color.charcoal,
    color: '#FFFFFF',
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  renameCancelBtn: {
    minHeight: '30px',
    padding: '4px 10px',
    borderRadius: '999px',
    border: `1px solid ${tokens.color.goldFaint}`,
    background: 'transparent',
    color: tokens.color.inkSoft,
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  stateLine: {
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    fontWeight: 600,
    color: tokens.color.inkSoft,
  },
  updatedLine: {
    fontFamily: tokens.font.body,
    fontSize: '10.5px',
    color: tokens.color.inkFaint,
    marginBottom: '4px',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
    marginTop: '2px',
  },
  packBtn: {
    minHeight: '28px',
    padding: '5px 12px',
    borderRadius: '999px',
    border: `1px solid ${tokens.color.charcoal}`,
    background: 'transparent',
    color: tokens.color.charcoal,
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  // Clean 8F — distinct media action (gold accent border).
  mediaBtn: {
    minHeight: '28px',
    padding: '5px 12px',
    borderRadius: '999px',
    border: `1px solid ${tokens.color.gold}`,
    background: 'transparent',
    color: tokens.color.charcoal,
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
};
