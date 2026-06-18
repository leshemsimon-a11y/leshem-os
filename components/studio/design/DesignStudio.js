// components/studio/design/DesignStudio.js
//
// LESHEM.S OS — Jewelry Design Studio (Clean 3.3 — Visual Board)
//
// A stone-first design BOARD. The page reads as a workspace of zones rather
// than an information page: the selected stones sit on the board as visual
// objects (the center stone visually dominant), followed by clearly reserved,
// disabled future zones for the rest of the Stone → Jewelry workflow.
//
// Seven board zones:
//   1. Stones / Work Tray   (ACTIVE — role-grouped object cards)
//   2. Design Direction     (future)
//   3. Reference            (future)
//   4. Model / Template     (future)
//   5. Render Brief         (future)
//   6. Visualization / Media(future)
//   7. Client Output        (future)
//
// Clean 3.3 is VISUAL/LAYOUT POLISH ONLY. No new functionality. Future zones
// never look active. No uploads, no model records, no render/Stability, no
// pricing, no certificates, no Airtable. Role logic + summary are reused as-is.
//
// Mobile-first: zones stack, cards wrap, nothing scrolls sideways, text is
// kept light, and future zones stay compact so they don't crowd the screen.

import * as React from 'react';
import { useRouter } from 'next/router';
import { tokens } from '../shared/tokens';
import { DESIGN_HE } from '../../../lib/studio/labels';
import { createUseWorkTray } from '../../../lib/studio/workTray';
import {
  buildDesignGroups,
  summarizeDraft,
  draftStatus,
} from '../../../lib/studio/designDraft';
import DesignBoardZone from './DesignBoardZone';
import RoleZone from './RoleZone';
import DesignFutureRail from './DesignFutureRail';

const useWorkTray = createUseWorkTray(React);

// Compact, low-text draft header: status dot + one line + small count chips.
function DraftHeader({ summary, status }) {
  const ready = status.tone === 'ready';
  const S = DESIGN_HE.summary;

  const chips = [
    { key: 'total', label: S.totalStones, value: summary.total },
    { key: 'center', label: S.centerStones, value: summary.centerStoneCount, accent: true },
    { key: 'side', label: S.sideStones, value: summary.sideStoneCount },
    { key: 'pair', label: S.pairs, value: summary.pairCount, optional: true },
    { key: 'parcel', label: S.parcels, value: summary.parcelCount, optional: true },
    { key: 'component', label: S.components, value: summary.componentCount, optional: true },
    { key: 'reference', label: S.references, value: summary.referenceCount, optional: true },
    { key: 'unassigned', label: S.unassigned, value: summary.unassigned, optional: true },
  ].filter((c) => !c.optional || c.value > 0);

  return (
    <div
      style={{
        ...styles.draftHeader,
        ...(ready ? styles.draftReady : styles.draftPending),
      }}
      dir="rtl"
    >
      <div style={styles.draftStatusRow}>
        <span
          style={{
            ...styles.draftDot,
            background: ready ? tokens.color.gold : tokens.color.goldSoft,
          }}
          aria-hidden="true"
        />
        <span style={styles.draftStatusText}>
          {ready ? DESIGN_HE.status.readyTitle : DESIGN_HE.status.needsRoleTitle}
        </span>
      </div>
      <div style={styles.chipRow}>
        {chips.map((c) => (
          <span
            key={c.key}
            style={{ ...styles.chip, ...(c.accent ? styles.chipAccent : null) }}
          >
            <span style={styles.chipValue}>{c.value}</span>
            <span style={styles.chipLabel}>{c.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function DesignStudio() {
  const router = useRouter();
  const tray = useWorkTray();

  const groups = buildDesignGroups(tray.items);
  const summary = summarizeDraft(tray.items);
  const status = draftStatus(tray.items);
  const hasItems = summary.total > 0;

  const Z = DESIGN_HE.zones;
  const goTray = () => router.push('/studio/tray');

  return (
    <div dir="rtl">
      <header style={styles.header}>
        <span style={styles.eyebrow}>{DESIGN_HE.eyebrow}</span>
        <h1 style={styles.title}>{DESIGN_HE.title}</h1>
      </header>

      {!tray.hydrated ? (
        <div style={styles.loading}>טוען את העיצוב…</div>
      ) : !hasItems ? (
        <div style={styles.empty}>
          <div style={styles.emptyMark} aria-hidden="true">
            ✦
          </div>
          <h2 style={styles.emptyTitle}>{DESIGN_HE.emptyTitle}</h2>
          <p style={styles.emptyHint}>{DESIGN_HE.emptyHint}</p>
          <button type="button" onClick={goTray} style={styles.primaryBtn}>
            {DESIGN_HE.goToTray}
          </button>
        </div>
      ) : (
        <div style={styles.board}>
          {/* ZONE 1 — Stones / Work Tray (ACTIVE) */}
          <DesignBoardZone title={Z.stones.title} caption={Z.stones.caption} glyph={Z.stones.glyph}>
            <DraftHeader summary={summary} status={status} />
            <div style={styles.roleZones}>
              {groups.map((g) => (
                <RoleZone key={g.id} group={g} />
              ))}
            </div>
            <button type="button" onClick={goTray} style={styles.trayLink}>
              {DESIGN_HE.status.backToTray}
            </button>
          </DesignBoardZone>

          {/* ZONES 2–7 — reserved future zones (clearly disabled) */}
          <DesignBoardZone title={Z.direction.title} caption={Z.direction.caption} glyph={Z.direction.glyph} future>
            <div style={styles.directionBox}>
              <p style={styles.directionText}>{DESIGN_HE.directionPlaceholder}</p>
            </div>
          </DesignBoardZone>

          <DesignBoardZone title={Z.reference.title} caption={Z.reference.caption} glyph={Z.reference.glyph} future>
            <DesignFutureRail variant="reference" />
          </DesignBoardZone>

          <DesignBoardZone title={Z.model.title} caption={Z.model.caption} glyph={Z.model.glyph} future>
            <DesignFutureRail variant="models" />
          </DesignBoardZone>

          <DesignBoardZone title={Z.renderBrief.title} caption={Z.renderBrief.caption} glyph={Z.renderBrief.glyph} future>
            <DesignFutureRail variant="renderBrief" />
          </DesignBoardZone>

          <DesignBoardZone title={Z.visualization.title} caption={Z.visualization.caption} glyph={Z.visualization.glyph} future>
            <DesignFutureRail variant="visualization" />
          </DesignBoardZone>

          <DesignBoardZone title={Z.clientOutput.title} caption={Z.clientOutput.caption} glyph={Z.clientOutput.glyph} future>
            <DesignFutureRail variant="clientOutput" />
          </DesignBoardZone>
        </div>
      )}
    </div>
  );
}

const styles = {
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
    fontSize: '34px',
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
  board: {
    display: 'flex',
    flexDirection: 'column',
  },
  // ---- draft header (compact) ----
  draftHeader: {
    borderRadius: tokens.radius.md,
    padding: '12px 14px',
    marginBottom: '16px',
  },
  draftPending: {
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.goldFaint}`,
  },
  draftReady: {
    background: tokens.color.sageFaint,
    border: `1px solid ${tokens.color.sage}`,
  },
  draftStatusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
  },
  draftDot: {
    width: '9px',
    height: '9px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  draftStatusText: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  chipRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: '6px',
    padding: '5px 12px',
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: '999px',
  },
  chipAccent: {
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.goldSoft}`,
  },
  chipValue: {
    fontFamily: tokens.font.display,
    fontWeight: 700,
    fontSize: '15px',
    color: tokens.color.charcoal,
  },
  chipLabel: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.inkSoft,
  },
  roleZones: {
    display: 'flex',
    flexDirection: 'column',
    gap: '22px',
  },
  trayLink: {
    marginTop: '18px',
    minHeight: '46px',
    padding: '11px 22px',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.color.charcoal,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
  },
  primaryBtn: {
    minHeight: '50px',
    padding: '14px 26px',
    fontFamily: tokens.font.body,
    fontSize: '15px',
    fontWeight: 600,
    color: tokens.color.ivory,
    background: tokens.color.charcoal,
    border: 'none',
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
    boxShadow: tokens.shadow.soft,
  },
  directionBox: {
    background: tokens.color.canvas,
    border: `1px dashed ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    padding: '16px',
  },
  directionText: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    lineHeight: 1.6,
    color: tokens.color.inkFaint,
    margin: 0,
    maxWidth: '560px',
  },
};
