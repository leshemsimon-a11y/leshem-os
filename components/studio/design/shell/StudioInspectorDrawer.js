// components/studio/design/shell/StudioInspectorDrawer.js
//
// Clean 5D — right inspector drawer. A professional inspector panel (not a long
// report) for the selected design direction: title, compact preview, a short
// set of icon rows, then collapsed detail sections.
//
// Read-only. It reads the already-computed selected concept and (when present)
// the generated output. It performs NO generation and owns NO mutations — all
// of that stays in the existing panels. Closed-by-default sections keep it calm.
//
// Clean 5D-R3: this panel was already on the light ivory chrome direction —
// only comfort/readability polish here (larger section-toggle targets, more
// breathing room, bigger row icons). No logic, no data shape, no CTA behavior
// changed — the CTA remains OPTIONAL/omitted so the single dominant action
// stays in the bottom strip only.

import * as React from 'react';
import { tokens } from '../../shared/tokens';
import { STUDIO_5D_HE, CONCEPT_HE } from '../../../../lib/studio/labels';
import {
  CenterStoneIcon,
  SideStoneIcon,
  MetalIcon,
  SettingIcon,
  StyleIcon,
  FeasibilityIcon,
  ChevronIcon,
} from './StudioIcons';

function Row({ Icon, label, value }) {
  if (!value || !String(value).trim()) return null;
  return (
    <div style={styles.row} dir="rtl">
      <span style={styles.rowIcon} aria-hidden="true">
        <Icon size={18} />
      </span>
      <span style={styles.rowText}>
        <span style={styles.rowLabel}>{label}</span>
        <span style={styles.rowValue}>{value}</span>
      </span>
    </div>
  );
}

function Section({ title, body, items, defaultOpen = false }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const hasBody = body && String(body).trim();
  const hasItems = Array.isArray(items) && items.length > 0;
  if (!hasBody && !hasItems) return null;
  return (
    <div style={styles.section} dir="rtl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={styles.sectionHead}
        aria-expanded={open}
        aria-label={open ? STUDIO_5D_HE.aria.closeSection : STUDIO_5D_HE.aria.openSection}
      >
        <span style={styles.sectionTitle}>{title}</span>
        <span style={{ ...styles.chev, transform: open ? 'rotate(90deg)' : 'rotate(-90deg)' }}>
          <ChevronIcon size={16} />
        </span>
      </button>
      {open && (
        <div style={styles.sectionBody}>
          {hasBody ? <p style={styles.sectionText}>{body}</p> : null}
          {hasItems ? (
            <ul style={styles.list}>
              {items.map((it, i) => (
                <li key={i} style={styles.listItem}>
                  {it}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function StudioInspectorDrawer({
  concept,
  output,
  selectedStone,
  demoMode,
  primaryLabel,
  primaryDisabled,
  onPrimary,
}) {
  const L = STUDIO_5D_HE;

  // Demo Operating Layer inspect state: visible only when no real design
  // direction is selected and the studio is currently showing demo tray stones.
  // It is read-only and does not write to any real data source.
  if (!concept && selectedStone) {
    const carat = typeof selectedStone.estimatedCarat === 'number' ? `${selectedStone.estimatedCarat} ct` : null;
    const sourceLabel = selectedStone.sourceType === 'client-owned'
      ? 'Client-owned'
      : selectedStone.sourceType === 'supplier'
        ? 'Supplier'
        : 'Owned';
    const statusLabel = selectedStone.status || 'demo';

    return (
      <aside style={styles.drawer} dir="rtl">
        <div style={styles.scroll}>
          <div style={styles.head}>
            <span style={styles.drawerTitle}>{L.inspectorTitle}</span>
            <span style={styles.demoPill}>{demoMode ? 'DEMO STONE' : 'STONE'}</span>
            <span style={styles.conceptName}>{selectedStone.titleHe || selectedStone.title}</span>
          </div>

          {selectedStone.inspectImage ? (
            <div style={styles.demoImageWrap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedStone.inspectImage} alt="" style={styles.demoImage} />
            </div>
          ) : null}

          <div style={styles.demoBadges}>
            <span style={styles.demoBadgeText}>{sourceLabel}</span>
            <span style={styles.demoBadgeText}>{statusLabel}</span>
            <span style={styles.demoBadgeText}>Temporary</span>
          </div>

          <div style={styles.rows}>
            <Row Icon={CenterStoneIcon} label="סוג אבן" value={selectedStone.stoneTypeHe || selectedStone.stoneType} />
            <Row Icon={SettingIcon} label="צורה" value={selectedStone.shapeHe || selectedStone.shape} />
            <Row Icon={SideStoneIcon} label="משקל משוער" value={carat} />
            <Row Icon={StyleIcon} label="צבע" value={selectedStone.color} />
            <Row Icon={FeasibilityIcon} label="איכות / ניקיון" value={selectedStone.clarity} />
            <Row Icon={MetalIcon} label="טיפול" value={selectedStone.treatment} />
          </div>

          <div style={styles.demoActions}>
            <button type="button" style={styles.demoAction}>Send to Work Tray</button>
            <button type="button" style={styles.demoAction}>Start Design</button>
            <button type="button" style={styles.demoActionMuted}>Create Report</button>
            <button type="button" style={styles.demoActionMuted}>Open Asset</button>
          </div>

          <p style={styles.demoNote}>
            שכבת דמו זמנית בלבד. לא נשמר במלאי האמיתי ולא מחליף את Work Tray / Upload / Inventory.
          </p>
        </div>
      </aside>
    );
  }

  if (!concept) {
    return (
      <aside style={styles.drawer} dir="rtl">
        <div style={styles.scroll}>
          <span style={styles.drawerTitle}>{L.inspectorTitle}</span>
          <p style={styles.empty}>{L.inspectorEmpty}</p>
        </div>
        {primaryLabel ? (
          <button
            type="button"
            onClick={onPrimary}
            disabled={primaryDisabled}
            style={{ ...styles.cta, ...(primaryDisabled ? styles.ctaDisabled : null) }}
          >
            {primaryLabel}
          </button>
        ) : null}
      </aside>
    );
  }

  // Prefer richer output data when an output exists; fall back to concept text.
  const centerVal = output && output.stoneSummary ? output.stoneSummary : concept.stoneLayout;
  const metalVal = output && output.metalSummary ? output.metalSummary : concept.metalSuggestion;
  const settingVal = concept.designStructure;
  const styleVal = concept.recommendedUse;
  const feasibilityVal =
    output && output.productionNotes ? output.productionNotes : concept.productionNotes;

  return (
    <aside style={styles.drawer} dir="rtl">
      <div style={styles.scroll}>
        <div style={styles.head}>
          <span style={styles.drawerTitle}>{L.inspectorTitle}</span>
          <span style={styles.conceptName}>{concept.conceptName}</span>
          {concept.shortDescription ? (
            <p style={styles.preview}>{concept.shortDescription}</p>
          ) : null}
        </div>

        <div style={styles.rows}>
          <Row Icon={CenterStoneIcon} label={L.rows.centerStone} value={centerVal} />
          <Row Icon={SideStoneIcon} label={L.rows.sideStones} value={output ? output.stoneSummary : null} />
          <Row Icon={MetalIcon} label={L.rows.metal} value={metalVal} />
          <Row Icon={SettingIcon} label={L.rows.setting} value={settingVal} />
          <Row Icon={StyleIcon} label={L.rows.style} value={styleVal} />
          <Row Icon={FeasibilityIcon} label={L.rows.feasibility} value={feasibilityVal} />
        </div>

        {output ? (
          <div style={styles.sections}>
            <Section title={L.sections.designLogic} body={output.internalDesignSummary} />
            <Section title={L.sections.stoneUsage} body={output.stoneSummary} />
            <Section title={L.sections.materials} body={output.materialsSummary} />
            <Section title={L.sections.production} body={output.productionNotes} />
            <Section title={L.sections.assumptions} items={output.assumptions} />
            <Section title={L.sections.nextSteps} items={output.nextSteps} />
          </div>
        ) : (
          <div style={styles.sections}>
            <Section title={L.sections.designLogic} body={concept.designStructure} />
            <Section title={L.sections.stoneUsage} body={concept.stoneLayout} />
          </div>
        )}
      </div>

      {primaryLabel ? (
        <button
          type="button"
          onClick={onPrimary}
          disabled={primaryDisabled}
          style={{ ...styles.cta, ...(primaryDisabled ? styles.ctaDisabled : null) }}
        >
          {primaryLabel}
        </button>
      ) : null}
    </aside>
  );
}

const styles = {
  drawer: {
    display: 'flex',
    flexDirection: 'column',
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.lg,
    boxShadow: tokens.shadow.canvas,
    minWidth: 0,
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
  },
  scroll: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    padding: '20px',
    overflowY: 'auto',
    flex: 1,
    minHeight: 0,
  },
  cta: {
    margin: '0 16px 16px',
    minHeight: '50px',
    padding: '13px 24px',
    fontFamily: tokens.font.body,
    fontSize: '15px',
    fontWeight: 700,
    letterSpacing: '0.02em',
    color: tokens.color.graphite,
    background: `linear-gradient(180deg, ${tokens.color.goldSoft} 0%, ${tokens.color.gold} 100%)`,
    border: 'none',
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
    boxShadow: '0 6px 18px rgba(184,151,90,0.26)',
    flexShrink: 0,
  },
  ctaDisabled: {
    background: tokens.color.platinumSoft,
    color: tokens.color.inkFaint,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  demoPill: {
    alignSelf: 'flex-start',
    display: 'inline-flex',
    height: '22px',
    alignItems: 'center',
    padding: '0 9px',
    borderRadius: '999px',
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.gold}`,
    color: tokens.color.charcoal,
    fontFamily: tokens.font.body,
    fontSize: '9px',
    fontWeight: 800,
    letterSpacing: '0.12em',
  },
  demoImageWrap: {
    width: '100%',
    aspectRatio: '1 / 1',
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
    background: tokens.color.ivory,
    border: `1px solid ${tokens.color.cardEdge}`,
    boxShadow: tokens.shadow.hairline,
  },
  demoImage: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  demoBadges: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  demoBadgeText: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: '24px',
    padding: '0 10px',
    borderRadius: '999px',
    background: tokens.color.platinumSoft,
    border: `1px solid ${tokens.color.cardEdge}`,
    color: tokens.color.inkSoft,
    fontFamily: tokens.font.body,
    fontSize: '10.5px',
    fontWeight: 700,
  },
  demoActions: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  demoAction: {
    minHeight: '38px',
    padding: '8px 10px',
    border: 'none',
    borderRadius: tokens.radius.sm,
    background: tokens.color.charcoal,
    color: tokens.color.ivory,
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    fontWeight: 800,
    cursor: 'default',
  },
  demoActionMuted: {
    minHeight: '38px',
    padding: '8px 10px',
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.sm,
    background: tokens.color.ivory,
    color: tokens.color.inkSoft,
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    fontWeight: 800,
    cursor: 'default',
  },
  demoNote: {
    margin: 0,
    padding: '10px 12px',
    borderRadius: tokens.radius.md,
    background: tokens.color.goldFaint,
    color: tokens.color.inkSoft,
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    lineHeight: 1.6,
  },
  head: { display: 'flex', flexDirection: 'column', gap: '6px' },
  drawerTitle: {
    fontFamily: tokens.font.body,
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.16em',
    color: tokens.color.gold,
  },
  conceptName: {
    fontFamily: tokens.font.display,
    fontWeight: 700,
    fontSize: '19px',
    letterSpacing: '0.01em',
    color: tokens.color.charcoal,
    lineHeight: 1.2,
  },
  preview: {
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
    margin: 0,
  },
  empty: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    lineHeight: 1.6,
    color: tokens.color.inkFaint,
    margin: 0,
  },
  rows: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    borderTop: `1px solid ${tokens.color.cardEdge}`,
    paddingTop: '16px',
  },
  row: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '9px 0' },
  rowIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: tokens.color.iceFaint,
    color: tokens.color.ice,
    flexShrink: 0,
  },
  rowText: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, paddingTop: '2px' },
  rowLabel: {
    fontFamily: tokens.font.body,
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: tokens.color.inkFaint,
  },
  rowValue: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    lineHeight: 1.5,
    color: tokens.color.charcoal,
  },
  sections: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    borderTop: `1px solid ${tokens.color.cardEdge}`,
    paddingTop: '14px',
  },
  section: {
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.sm,
    overflow: 'hidden',
  },
  sectionHead: {
    width: '100%',
    boxSizing: 'border-box',
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    padding: '12px 14px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'right',
  },
  sectionTitle: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  chev: { display: 'inline-flex', color: tokens.color.inkFaint, transition: 'transform 120ms' },
  sectionBody: {
    padding: '2px 14px 14px',
    borderTop: `1px solid ${tokens.color.cardEdge}`,
  },
  sectionText: {
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
    margin: '8px 0 0',
  },
  list: { margin: '8px 0 0', paddingInlineStart: '18px' },
  listItem: {
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
    marginBottom: '4px',
  },
};
