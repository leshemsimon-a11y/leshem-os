// components/studio/design/DesignStudio.js
//
// LESHEM.S OS — Jewelry Design Studio (Clean 3 foundation → Clean 3.2)
//
// The first design surface. Stone-first: it begins from the items chosen in
// the Work Tray, shows each with its assigned role, and reserves clearly
// disabled space for the future Reference + Stone → Jewelry Design
// Visualization workflow (reference/media, models, render brief).
//
// Clean 3.2 adds a DESIGN DRAFT SUMMARY + STATUS at the top of the board:
//   • a calm status line (needs-role / ready)
//   • counts — total stones, center stones, side stones, and parcel/component/
//     pair/reference counts when present
// Center stones stay SEPARATE items (never collapsed into a quantity).
//
// Still NOT in scope: uploads, links, sketches, 3D, model records, renders,
// pricing, certificates, Airtable. All future affordances remain visibly
// disabled, exactly as before.
//
// Mobile-first: everything stacks; the design board reads top-to-bottom with
// generous spacing and no wide tables or hover-only actions.

import * as React from 'react';
import { useRouter } from 'next/router';
import { tokens } from '../shared/tokens';
import { DESIGN_HE } from '../../../lib/studio/labels';
import { createUseWorkTray } from '../../../lib/studio/workTray';
import {
  buildDesignGroups,
  summarizeDraft,
  draftStatus,
  trayItemTitle,
  DESIGN_ROLE,
} from '../../../lib/studio/designDraft';
import MediaPreview from '../media/MediaPreview';
import DesignFutureRail from './DesignFutureRail';

const useWorkTray = createUseWorkTray(React);

function StoneMini({ item }) {
  const s = item.snapshot || {};
  const title = trayItemTitle(item);
  const carat = s.caratWeight != null ? `${s.caratWeight} ct` : null;
  const colorClarity = [s.color, s.clarity].filter(Boolean).join(' · ');
  return (
    <div style={styles.stone} dir="rtl">
      <div style={styles.stoneThumb}>
        <MediaPreview src={s.primaryImage} alt={title} height={72} cover />
      </div>
      <div style={styles.stoneInfo}>
        <div style={styles.stoneTitleRow}>
          <span style={styles.stoneTitle}>{title}</span>
          {carat && <span style={styles.stoneCarat}>{carat}</span>}
        </div>
        {s.shapeHe && <span style={styles.stoneSub}>{s.shapeHe}</span>}
        {colorClarity && <span style={styles.stoneSub}>{colorClarity}</span>}
        {s.sku && <span style={styles.stoneSku}>{s.sku}</span>}
      </div>
    </div>
  );
}

function RoleGroup({ group }) {
  return (
    <div style={styles.group} dir="rtl">
      <div style={styles.groupHead}>
        <span style={styles.groupRole}>{group.roleHe}</span>
        {group.role === DESIGN_ROLE.CENTER_STONE && (
          <span style={styles.groupNote}>פריט נפרד</span>
        )}
      </div>
      <div style={styles.groupItems}>
        {group.items.map((it) => (
          <StoneMini key={it.id} item={it} />
        ))}
      </div>
    </div>
  );
}

// Clean 3.2 — design draft summary (counts) + honest status line.
function DraftSummary({ summary, status }) {
  const S = DESIGN_HE.summary;
  const ready = status.tone === 'ready';

  // Build the count chips; show optional roles only when they exist.
  const stats = [
    { key: 'total', label: S.totalStones, value: summary.total, always: true },
    {
      key: 'center',
      label: S.centerStones,
      value: summary.centerStoneCount,
      always: true,
      accent: true,
    },
    { key: 'side', label: S.sideStones, value: summary.sideStoneCount, always: true },
    { key: 'pair', label: S.pairs, value: summary.pairCount },
    { key: 'parcel', label: S.parcels, value: summary.parcelCount },
    { key: 'component', label: S.components, value: summary.componentCount },
    { key: 'reference', label: S.references, value: summary.referenceCount },
    { key: 'unassigned', label: S.unassigned, value: summary.unassigned },
  ].filter((s) => s.always || s.value > 0);

  return (
    <section style={styles.summarySection} dir="rtl">
      <div
        style={{
          ...styles.summaryStatus,
          ...(ready ? styles.summaryReady : styles.summaryPending),
        }}
      >
        <span
          style={{
            ...styles.summaryDot,
            background: ready ? tokens.color.gold : tokens.color.goldSoft,
          }}
          aria-hidden="true"
        />
        <div style={styles.summaryStatusText}>
          <span style={styles.summaryStatusTitle}>
            {ready
              ? DESIGN_HE.status.readyTitle
              : DESIGN_HE.status.needsRoleTitle}
          </span>
          <span style={styles.summaryStatusBody}>
            {ready ? DESIGN_HE.status.readyBody : DESIGN_HE.status.needsRoleBody}
          </span>
        </div>
      </div>

      <div style={styles.statGrid}>
        {stats.map((s) => (
          <div
            key={s.key}
            style={{
              ...styles.stat,
              ...(s.accent ? styles.statAccent : null),
            }}
          >
            <span style={styles.statValue}>{s.value}</span>
            <span style={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function FutureArea({ title, desc, children }) {
  return (
    <section style={styles.area}>
      <div style={styles.areaHead}>
        <h3 style={styles.areaTitle}>{title}</h3>
        <span style={styles.stageBadge}>{DESIGN_HE.futureStage}</span>
      </div>
      <p style={styles.areaDesc}>{desc}</p>
      {children}
    </section>
  );
}

export default function DesignStudio() {
  const router = useRouter();
  const tray = useWorkTray();

  const groups = buildDesignGroups(tray.items);
  const summary = summarizeDraft(tray.items);
  const status = draftStatus(tray.items);
  const hasItems = summary.total > 0;

  const goTray = () => router.push('/studio/tray');

  return (
    <div dir="rtl">
      <header style={styles.header}>
        <span style={styles.eyebrow}>{DESIGN_HE.eyebrow}</span>
        <h1 style={styles.title}>{DESIGN_HE.title}</h1>
        <p style={styles.lede}>{DESIGN_HE.lede}</p>
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
          <button type="button" onClick={goTray} style={styles.secondaryBtn}>
            {DESIGN_HE.goToTray}
          </button>
        </div>
      ) : (
        <>
          {/* 0. Design draft summary + status (Clean 3.2) */}
          <DraftSummary summary={summary} status={status} />

          {/* 1. Selected stones, grouped by role */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>{DESIGN_HE.sections.stones}</h2>
            <div style={styles.groups}>
              {groups.map((g) => (
                <RoleGroup key={g.id} group={g} />
              ))}
            </div>
            <button type="button" onClick={goTray} style={styles.editTrayLink}>
              {DESIGN_HE.goToTray}
            </button>
          </section>

          {/* 2. Design direction (placeholder, not an input yet) */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>{DESIGN_HE.sections.direction}</h2>
            <div style={styles.directionBox}>
              <p style={styles.directionText}>{DESIGN_HE.directionPlaceholder}</p>
              <span style={styles.inlineBadge}>{DESIGN_HE.futureBadge}</span>
            </div>
          </section>

          {/* 3. Reserved future areas — clearly disabled */}
          <FutureArea
            title={DESIGN_HE.sections.reference}
            desc={DESIGN_HE.areaDesc.reference}
          >
            <DesignFutureRail variant="reference" />
          </FutureArea>

          <FutureArea
            title={DESIGN_HE.sections.models}
            desc={DESIGN_HE.areaDesc.models}
          >
            <DesignFutureRail variant="models" />
          </FutureArea>

          <FutureArea
            title={DESIGN_HE.sections.render}
            desc={DESIGN_HE.areaDesc.render}
          >
            <DesignFutureRail variant="render" />
          </FutureArea>

          <FutureArea
            title={DESIGN_HE.sections.collection}
            desc={DESIGN_HE.areaDesc.collection}
          >
            <DesignFutureRail variant="collection" />
          </FutureArea>

          <FutureArea
            title={DESIGN_HE.sections.clientOutput}
            desc={DESIGN_HE.areaDesc.clientOutput}
          >
            <DesignFutureRail variant="clientOutput" />
          </FutureArea>
        </>
      )}
    </div>
  );
}

const styles = {
  header: {
    marginBottom: '24px',
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
    margin: '8px 0 12px',
  },
  lede: {
    fontFamily: tokens.font.body,
    fontSize: '15px',
    lineHeight: 1.7,
    color: tokens.color.inkSoft,
    maxWidth: '600px',
    margin: 0,
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

  // ---- Clean 3.2 draft summary ----
  summarySection: {
    marginBottom: '30px',
    paddingBottom: '26px',
    borderBottom: `1px solid ${tokens.color.cardEdge}`,
  },
  summaryStatus: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: tokens.radius.md,
    marginBottom: '16px',
  },
  summaryPending: {
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.goldFaint}`,
  },
  summaryReady: {
    background: tokens.color.sageFaint,
    border: `1px solid ${tokens.color.sage}`,
  },
  summaryDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    marginTop: '5px',
    flexShrink: 0,
  },
  summaryStatusText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  },
  summaryStatusTitle: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  summaryStatusBody: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
  },
  statGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  stat: {
    flex: '1 1 120px',
    minWidth: '110px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '12px 14px',
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
  },
  statAccent: {
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.goldSoft}`,
  },
  statValue: {
    fontFamily: tokens.font.display,
    fontWeight: 700,
    fontSize: '24px',
    color: tokens.color.charcoal,
    lineHeight: 1,
  },
  statLabel: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.inkSoft,
  },

  section: {
    marginBottom: '30px',
    paddingBottom: '26px',
    borderBottom: `1px solid ${tokens.color.cardEdge}`,
  },
  sectionTitle: {
    fontFamily: tokens.font.display,
    fontWeight: 400,
    fontSize: '20px',
    color: tokens.color.charcoal,
    margin: '0 0 16px',
  },
  groups: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  group: {
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.lg,
    boxShadow: tokens.shadow.soft,
    padding: '16px',
  },
  groupHead: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
  },
  groupRole: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: tokens.color.gold,
  },
  groupNote: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    color: tokens.color.inkFaint,
    background: tokens.color.pearl,
    borderRadius: '999px',
    padding: '2px 10px',
  },
  groupItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  stone: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  stoneThumb: {
    width: '72px',
    height: '72px',
    flexShrink: 0,
    borderRadius: tokens.radius.md,
    overflow: 'hidden',
    border: `1px solid ${tokens.color.cardEdge}`,
  },
  stoneInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
    flex: 1,
  },
  stoneTitleRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '8px',
  },
  stoneTitle: {
    fontFamily: tokens.font.display,
    fontSize: '17px',
    color: tokens.color.charcoal,
  },
  stoneCarat: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.color.gold,
    whiteSpace: 'nowrap',
  },
  stoneSub: {
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
    marginTop: '2px',
  },
  editTrayLink: {
    marginTop: '16px',
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
  directionBox: {
    position: 'relative',
    background: tokens.color.pearl,
    border: `1px dashed ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    padding: '18px',
  },
  directionText: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    lineHeight: 1.7,
    color: tokens.color.inkFaint,
    margin: 0,
    maxWidth: '560px',
  },
  inlineBadge: {
    position: 'absolute',
    top: '14px',
    insetInlineStart: '14px',
    fontFamily: tokens.font.body,
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: tokens.color.inkFaint,
    background: tokens.color.goldFaint,
    borderRadius: '999px',
    padding: '2px 8px',
  },
  area: {
    marginBottom: '26px',
  },
  areaHead: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  areaTitle: {
    fontFamily: tokens.font.display,
    fontWeight: 400,
    fontSize: '19px',
    color: tokens.color.charcoal,
    margin: 0,
  },
  stageBadge: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: tokens.color.gold,
    background: tokens.color.goldFaint,
    borderRadius: '999px',
    padding: '3px 12px',
  },
  areaDesc: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    lineHeight: 1.6,
    color: tokens.color.inkFaint,
    margin: '0 0 14px',
    maxWidth: '560px',
  },
  secondaryBtn: {
    minHeight: '50px',
    padding: '14px 26px',
    fontFamily: tokens.font.body,
    fontSize: '15px',
    fontWeight: 600,
    color: tokens.color.charcoal,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
  },
};
