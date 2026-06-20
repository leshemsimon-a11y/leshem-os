// components/studio/design/DesignSnapshotPanel.js
//
// LESHEM.S OS — Design Snapshot Panel (Clean 3D)
//
// A clean INTERNAL summary of the current design draft, shown inside the
// Design Studio. It combines the Work Tray (stones + assigned roles) with the
// Jewelry Design Brief into one read-only snapshot:
//   • stones grouped by role — CENTER STONES listed individually (never merged
//     into a single count), SIDE / אבנים נוספות (accent) / parcel / component /
//     reference summarized with a count while each item still exists in the
//     draft;
//   • the brief fields (jewelry type, metal, style, intention, notes);
//   • an honest snapshot status (missing center / ready / saved locally /
//     draft) that follows the brief's saved↔draft state.
//
// Read-only and local: it consumes the existing work-tray and design-brief
// stores. NO network, NO Airtable, NO new packages, no pricing, no PDF, no
// commerce language.

import * as React from 'react';
import { tokens } from '../shared/tokens';
import { SNAPSHOT_HE, BRIEF_HE, DESIGN_HE } from '../../../lib/studio/labels';
import { createUseWorkTray } from '../../../lib/studio/workTray';
import { createUseDesignBrief } from '../../../lib/studio/designBriefStore';
import {
  buildDesignSnapshot,
  trayItemTitle,
  DESIGN_ROLE,
} from '../../../lib/studio/designDraft';

const useWorkTray = createUseWorkTray(React);
const useDesignBrief = createUseDesignBrief(React);

// Roles whose stones we list INDIVIDUALLY (never merged into a count).
const INDIVIDUAL_ROLES = new Set([DESIGN_ROLE.CENTER_STONE, DESIGN_ROLE.PAIR]);

function stoneLine(item) {
  const s = (item && item.snapshot) || {};
  const carat = s.caratWeight != null ? `${s.caratWeight} ct` : null;
  const bits = [s.shapeHe, s.color, s.clarity].filter(Boolean).join(' · ');
  return { title: trayItemTitle(item), carat, bits, sku: s.sku || null };
}

function GroupBlock({ group }) {
  const individual = INDIVIDUAL_ROLES.has(group.role);
  const isCenter = group.role === DESIGN_ROLE.CENTER_STONE;

  return (
    <div
      style={{ ...styles.group, ...(isCenter ? styles.groupCenter : null) }}
      dir="rtl"
    >
      <div style={styles.groupHead}>
        <span style={isCenter ? styles.roleNameCenter : styles.roleName}>
          {group.roleHe}
        </span>
        <span style={styles.count}>{group.items.length}</span>
        {isCenter && <span style={styles.sepNote}>{SNAPSHOT_HE.separateNote}</span>}
      </div>

      {individual ? (
        // Center / pair: each stone on its own line — never collapsed.
        <ul style={styles.stoneList}>
          {group.items.map((it) => {
            const line = stoneLine(it);
            return (
              <li key={it.id} style={styles.stoneRow}>
                <span style={styles.stoneTitle}>{line.title}</span>
                <span style={styles.stoneMeta}>
                  {[line.carat, line.bits].filter(Boolean).join(' · ')}
                </span>
                {line.sku && <span style={styles.stoneSku}>{line.sku}</span>}
              </li>
            );
          })}
        </ul>
      ) : (
        // Side / accent / parcel / component / reference: clean grouped summary
        // with a count, but each item still exists individually in the draft.
        <div style={styles.summaryWrap}>
          <span style={styles.summaryCount}>
            {SNAPSHOT_HE.itemsCount(group.items.length)}
          </span>
          <div style={styles.tagRow}>
            {group.items.map((it) => (
              <span key={it.id} style={styles.tag}>
                {trayItemTitle(it)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BriefRow({ label, value }) {
  return (
    <div style={styles.briefRow} dir="rtl">
      <span style={styles.briefLabel}>{label}</span>
      <span style={value ? styles.briefValue : styles.briefValueEmpty}>
        {value || SNAPSHOT_HE.notSet}
      </span>
    </div>
  );
}

export default function DesignSnapshotPanel() {
  const tray = useWorkTray();
  const briefStore = useDesignBrief();

  if (!tray.hydrated || !briefStore.hydrated) {
    return <div style={styles.loading}>טוען תמונת מצב…</div>;
  }

  const snap = buildDesignSnapshot(tray.items, briefStore.brief);
  const { groups, brief, status } = snap;
  const ready = status.tone === 'ready';

  const statusCopy =
    status.key === 'missingCenter'
      ? { t: SNAPSHOT_HE.status.missingCenterTitle, b: SNAPSHOT_HE.status.missingCenterBody }
      : status.key === 'savedLocal'
      ? { t: SNAPSHOT_HE.status.savedLocalTitle, b: SNAPSHOT_HE.status.savedLocalBody }
      : status.key === 'ready'
      ? { t: SNAPSHOT_HE.status.readyTitle, b: SNAPSHOT_HE.status.readyBody }
      : { t: SNAPSHOT_HE.status.draftTitle, b: SNAPSHOT_HE.status.draftBody };

  // Map canonical brief values -> Hebrew display labels (internal UI only).
  const typeHe = brief.jewelryType ? BRIEF_HE.jewelryType[brief.jewelryType] : null;
  const metalHe = brief.metalPreference ? BRIEF_HE.metal[brief.metalPreference] : null;
  const styleHe = brief.stylePreference ? BRIEF_HE.style[brief.stylePreference] : null;
  const intention = brief.intention && brief.intention.trim() ? brief.intention.trim() : null;
  const notes = brief.notes && brief.notes.trim() ? brief.notes.trim() : null;

  return (
    <div style={styles.wrap} dir="rtl">
      {/* Status */}
      <div
        style={{
          ...styles.statusStrip,
          ...(ready ? styles.statusReady : styles.statusPending),
        }}
      >
        <span
          style={{
            ...styles.statusDot,
            background: ready ? tokens.color.gold : tokens.color.goldSoft,
          }}
          aria-hidden="true"
        />
        <div style={styles.statusText}>
          <span style={styles.statusTitle}>{statusCopy.t}</span>
          <span style={styles.statusBody}>{statusCopy.b}</span>
        </div>
      </div>

      {/* Stones by role */}
      <section style={styles.section}>
        <h3 style={styles.sectionHeading}>{SNAPSHOT_HE.stonesHeading}</h3>
        {groups.length === 0 ? (
          <p style={styles.emptyLine}>{DESIGN_HE.emptyTitle}</p>
        ) : (
          <div style={styles.groups}>
            {groups.map((g) => (
              <GroupBlock key={g.id} group={g} />
            ))}
          </div>
        )}
      </section>

      {/* Brief summary */}
      <section style={styles.section}>
        <h3 style={styles.sectionHeading}>{SNAPSHOT_HE.briefHeading}</h3>
        <div style={styles.briefBox}>
          <BriefRow label={SNAPSHOT_HE.jewelryType} value={typeHe} />
          <BriefRow label={SNAPSHOT_HE.metal} value={metalHe} />
          <BriefRow label={SNAPSHOT_HE.style} value={styleHe} />
          <BriefRow label={SNAPSHOT_HE.intention} value={intention} />
          <BriefRow label={SNAPSHOT_HE.notes} value={notes} />
        </div>
      </section>
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  loading: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    color: tokens.color.inkFaint,
    padding: '12px 0',
  },
  statusStrip: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: tokens.radius.md,
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
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sectionHeading: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: tokens.color.inkSoft,
    margin: 0,
  },
  groups: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  group: {
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    padding: '12px 14px',
  },
  groupCenter: {
    background: tokens.color.ivory,
    border: `1px solid ${tokens.color.goldSoft}`,
  },
  groupHead: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
    flexWrap: 'wrap',
  },
  roleName: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 700,
    color: tokens.color.inkSoft,
  },
  roleNameCenter: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 700,
    color: tokens.color.gold,
  },
  count: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 700,
    color: tokens.color.inkFaint,
    minWidth: '20px',
    height: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: '999px',
    padding: '0 6px',
  },
  sepNote: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    color: tokens.color.inkFaint,
    marginInlineStart: 'auto',
  },
  stoneList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  stoneRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    paddingBottom: '8px',
    borderBottom: `1px solid ${tokens.color.cardEdge}`,
  },
  stoneTitle: {
    fontFamily: tokens.font.display,
    fontSize: '16px',
    color: tokens.color.charcoal,
    lineHeight: 1.3,
  },
  stoneMeta: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    color: tokens.color.inkSoft,
  },
  stoneSku: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    color: tokens.color.inkFaint,
    direction: 'ltr',
    textAlign: 'right',
  },
  summaryWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  summaryCount: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.color.ink,
  },
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  tag: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 500,
    color: tokens.color.inkSoft,
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: '999px',
    padding: '3px 10px',
    whiteSpace: 'nowrap',
  },
  briefBox: {
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    padding: '4px 14px',
  },
  briefRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '14px',
    padding: '9px 0',
    borderBottom: `1px solid ${tokens.color.cardEdge}`,
  },
  briefLabel: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.color.inkSoft,
    flexShrink: 0,
  },
  briefValue: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    color: tokens.color.charcoal,
    textAlign: 'left',
    lineHeight: 1.5,
    minWidth: 0,
  },
  briefValueEmpty: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    color: tokens.color.inkFaint,
  },
  emptyLine: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    color: tokens.color.inkFaint,
    margin: 0,
  },
};
