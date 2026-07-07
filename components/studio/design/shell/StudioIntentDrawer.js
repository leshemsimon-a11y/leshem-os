// components/studio/design/shell/StudioIntentDrawer.js
//
// LESHEM.S OS — Clean 5E: Design Intent Layer ("כוונת עיצוב").
//
// A compact, chip-based drawer (desktop) / bottom sheet (narrow) that lets a
// non-technical jeweler state, in seconds: what we're creating, style, metal,
// stone usage intent, render/design freedom level, and a short optional note.
//
// Iceberg UX: chips + one textarea + one closing action. No long form, no
// tutorial text. Every tap writes straight to the EXISTING design brief via
// the existing store exports (updateBrief through createUseDesignBrief) —
// same persistence key, same pub/sub, same stale-signature participation.
// NO new store, NO new persistence key, NO render engine, NO network.
//
// The concept panel's fuller form remains the legacy/complete input surface;
// this drawer is the fast primary path. Both edit the same brief fields and
// stay in sync live through the store's existing event system.
//
// Structured deliberately as: summary → tap → sheet → confirm, so a future
// mobile voice-first flow (photo/video → voice → quick confirmation) can
// slot in without restructuring.

import * as React from 'react';
import { reset } from './studioResetStyle';
// Clean 6B — small section icons: the intent controls read as a studio tool,
// not a text form. Icons + the existing short labels; no control changed.
import { ProductIcon, StyleIcon, MetalIcon, GemIcon, FreedomIcon, NoteIcon } from './StudioIcons';
import { INTENT_HE, CONCEPT_HE, BRIEF_HE } from '../../../../lib/studio/labels';
import {
  PRODUCT_TYPE_VALUES,
  STYLE_PREFERENCE_VALUES,
  METAL_PREFERENCE_VALUES,
  STONE_USAGE_VALUES,
  FREEDOM_LEVEL_VALUES,
  DEFAULT_FREEDOM_LEVEL,
  normalizeBrief,
} from '../../../../lib/studio/designDraft';
import { createUseDesignBrief, updateBrief } from '../../../../lib/studio/designBriefStore';

const useDesignBrief = createUseDesignBrief(React);

// ---------------------------------------------------------------------------
// Compact intent summary line — exported so the shell renders the same text
// near the canvas header. Pure; Hebrew labels only; freedom level always
// shown (it always has a value), other parts only when set.
// Example: "טבעת · יוקרתי · זהב צהוב · שימוש באבנים שנבחרו · מאוזן"
// ---------------------------------------------------------------------------
export function intentSummaryText(brief) {
  const b = normalizeBrief(brief);
  const parts = [
    b.productType ? CONCEPT_HE.productType[b.productType] : null,
    b.styleDirection ? BRIEF_HE.style[b.styleDirection] : null,
    b.metalPreference ? BRIEF_HE.metal[b.metalPreference] : null,
    b.stoneUsage ? CONCEPT_HE.stoneUsage[b.stoneUsage] : null,
  ].filter(Boolean);
  const freedom = INTENT_HE.freedom[b.freedomLevel || DEFAULT_FREEDOM_LEVEL];
  // Freedom alone (nothing else set) is not a meaningful summary yet.
  if (parts.length === 0) return null;
  return [...parts, freedom].filter(Boolean).join(' · ');
}

function CloseIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

// A chip group bound to one brief field. Tapping the selected chip clears it
// back to null ("לא הוחלט") — same toggle contract as the concept panel.
function ChipGroup({ label, options, labelMap, value, onChange, Icon: Ic }) {
  return (
    <div style={styles.group}>
      <span style={styles.groupLabel}>
        {Ic ? <span style={styles.groupIcon} aria-hidden="true"><Ic size={12} /></span> : null}
        {label}
      </span>
      <div style={styles.chips}>
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(selected ? null : opt)}
              style={{ ...styles.chip, ...(selected ? styles.chipOn : null) }}
              aria-pressed={selected ? 'true' : 'false'}
            >
              {labelMap[opt] || opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Freedom level picker — always has a value (default GUIDED); radio-like
// rows with a one-line meaning under each name.
function FreedomPicker({ value, onChange }) {
  const current = value || DEFAULT_FREEDOM_LEVEL;
  return (
    <div style={styles.group}>
      <span style={styles.groupLabel}>
        <span style={styles.groupIcon} aria-hidden="true"><FreedomIcon size={12} /></span>
        {INTENT_HE.freedomLabel}
      </span>
      <div style={styles.freedomList} role="radiogroup" aria-label={INTENT_HE.freedomLabel}>
        {FREEDOM_LEVEL_VALUES.map((lvl) => {
          const selected = current === lvl;
          return (
            <button
              key={lvl}
              type="button"
              role="radio"
              aria-checked={selected ? 'true' : 'false'}
              onClick={() => onChange(lvl)}
              style={{ ...styles.freedomRow, ...(selected ? styles.freedomRowOn : null) }}
            >
              <span style={{ ...styles.freedomDot, ...(selected ? styles.freedomDotOn : null) }} aria-hidden="true" />
              <span style={styles.freedomText}>
                <span style={styles.freedomName}>{INTENT_HE.freedom[lvl]}</span>
                <span style={styles.freedomHint}>{INTENT_HE.freedomHint[lvl]}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function StudioIntentDrawer({ open, onClose, narrow }) {
  const briefStore = useDesignBrief();
  const brief = briefStore.brief;

  if (!open) return null;

  const set = (patch) => updateBrief(patch);
  const summary = intentSummaryText(brief);

  return (
    <div style={styles.overlay} dir="rtl" role="dialog" aria-modal="true" aria-label={INTENT_HE.drawerTitle}>
      <button type="button" style={styles.backdrop} onClick={onClose} aria-label={INTENT_HE.close} />
      <div style={{ ...styles.panel, ...(narrow ? styles.panelNarrow : null) }}>
        <div style={styles.head}>
          <span style={styles.title}>{INTENT_HE.drawerTitle}</span>
          <button type="button" onClick={onClose} style={styles.closeBtn} aria-label={INTENT_HE.close}>
            <CloseIcon />
          </button>
        </div>

        <div style={styles.scroll}>
          <ChipGroup
            label={INTENT_HE.jewelryTypeLabel}
            Icon={ProductIcon}
            options={PRODUCT_TYPE_VALUES}
            labelMap={CONCEPT_HE.productType}
            value={brief.productType}
            onChange={(v) => set({ productType: v })}
          />
          <ChipGroup
            label={INTENT_HE.styleLabel}
            Icon={StyleIcon}
            options={STYLE_PREFERENCE_VALUES}
            labelMap={BRIEF_HE.style}
            value={brief.styleDirection}
            onChange={(v) => set({ styleDirection: v })}
          />
          <ChipGroup
            label={INTENT_HE.metalLabel}
            Icon={MetalIcon}
            options={METAL_PREFERENCE_VALUES}
            labelMap={BRIEF_HE.metal}
            value={brief.metalPreference}
            onChange={(v) => set({ metalPreference: v })}
          />
          <ChipGroup
            label={INTENT_HE.stoneUsageLabel}
            Icon={GemIcon}
            options={STONE_USAGE_VALUES}
            labelMap={CONCEPT_HE.stoneUsage}
            value={brief.stoneUsage}
            onChange={(v) => set({ stoneUsage: v })}
          />

          <FreedomPicker
            value={brief.freedomLevel}
            onChange={(v) => set({ freedomLevel: v })}
          />

          <div style={styles.group}>
            <span style={styles.groupLabel}>
              <span style={styles.groupIcon} aria-hidden="true"><NoteIcon size={12} /></span>
              {INTENT_HE.noteLabel}
            </span>
            <textarea
              value={brief.designGoal || ''}
              onChange={(e) => set({ designGoal: e.target.value })}
              placeholder={INTENT_HE.notePlaceholder}
              style={styles.note}
              rows={2}
              dir="rtl"
            />
          </div>
        </div>

        <div style={styles.foot}>
          {summary ? (
            <span style={styles.footSummary} title={summary}>{summary}</span>
          ) : (
            <span style={styles.footSummaryEmpty}>{INTENT_HE.summaryEmpty}</span>
          )}
          <button type="button" onClick={onClose} style={styles.doneBtn}>
            {INTENT_HE.done}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 58,
    display: 'flex',
    justifyContent: 'flex-start',
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(17,17,20,0.42)',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    margin: 0,
  },
  // Desktop: side drawer (inline-start in RTL = right edge).
  panel: {
    position: 'relative',
    width: 'min(420px, 94vw)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: reset.color.panel,
    borderInlineEnd: `1px solid ${reset.color.border}`,
    boxShadow: reset.shadow.lift,
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  // Narrow/mobile: full-width bottom sheet, large targets, no side-by-side.
  panelNarrow: {
    width: '100%',
    height: 'auto',
    maxHeight: '88vh',
    marginTop: 'auto',
    borderInlineEnd: 'none',
    borderTop: `1px solid ${reset.color.border}`,
    borderRadius: `${reset.radius.lg} ${reset.radius.lg} 0 0`,
  },
  head: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    padding: '14px 16px 8px',
    flexShrink: 0,
  },
  title: {
    fontFamily: reset.font.display,
    fontWeight: 700,
    fontSize: '16px',
    color: reset.color.text,
  },
  closeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: reset.radius.sm,
    border: `1px solid ${reset.color.border}`,
    background: reset.color.page,
    color: reset.color.textMuted,
    cursor: 'pointer',
    flexShrink: 0,
  },
  scroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '4px 16px 14px',
  },
  group: { display: 'flex', flexDirection: 'column', gap: '8px' },
  groupLabel: {
    fontFamily: reset.font.body,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.05em',
    color: reset.color.textFaint,
  },
  // Clean 6B — small leading icon on each section label.
  groupIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    marginInlineEnd: '6px',
    color: reset.color.textFaint,
    verticalAlign: 'middle',
  },
  chips: { display: 'flex', flexWrap: 'wrap', gap: '7px' },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: '40px',
    padding: '8px 14px',
    borderRadius: '999px',
    border: `1px solid ${reset.color.border}`,
    background: reset.color.panel,
    color: reset.color.textMuted,
    fontFamily: reset.font.body,
    fontSize: '12.5px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  chipOn: {
    background: reset.color.primaryBg,
    borderColor: reset.color.primaryBg,
    color: reset.color.primaryText,
  },
  freedomList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
  },
  freedomRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    textAlign: 'right',
    padding: '10px 12px',
    minHeight: '48px',
    borderRadius: reset.radius.md,
    border: `1px solid ${reset.color.border}`,
    background: reset.color.panel,
    cursor: 'pointer',
    width: '100%',
    boxSizing: 'border-box',
  },
  freedomRowOn: {
    borderColor: reset.color.text,
    boxShadow: reset.shadow.hairline,
  },
  freedomDot: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    border: `1.5px solid ${reset.color.borderStrong}`,
    marginTop: '3px',
    flexShrink: 0,
    background: reset.color.panel,
  },
  freedomDotOn: {
    borderColor: reset.color.text,
    background: reset.color.text,
    boxShadow: `inset 0 0 0 3px ${reset.color.panel}`,
  },
  freedomText: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  freedomName: {
    fontFamily: reset.font.body,
    fontSize: '13px',
    fontWeight: 700,
    color: reset.color.text,
  },
  freedomHint: {
    fontFamily: reset.font.body,
    fontSize: '11px',
    lineHeight: 1.45,
    color: reset.color.textMuted,
  },
  note: {
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: reset.radius.sm,
    border: `1px solid ${reset.color.border}`,
    background: reset.color.panel,
    padding: '10px 12px',
    fontFamily: reset.font.body,
    fontSize: '13px',
    lineHeight: 1.5,
    color: reset.color.text,
    outline: 'none',
    resize: 'vertical',
    minHeight: '58px',
  },
  foot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    padding: '10px 16px calc(12px + env(safe-area-inset-bottom, 0px))',
    borderTop: `1px solid ${reset.color.border}`,
    flexShrink: 0,
  },
  footSummary: {
    fontFamily: reset.font.body,
    fontSize: '11.5px',
    fontWeight: 600,
    color: reset.color.textMuted,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  footSummaryEmpty: {
    fontFamily: reset.font.body,
    fontSize: '11.5px',
    fontWeight: 600,
    color: reset.color.textFaint,
  },
  doneBtn: {
    minHeight: '44px',
    padding: '10px 26px',
    fontFamily: reset.font.body,
    fontSize: '13.5px',
    fontWeight: 700,
    color: reset.color.primaryText,
    background: reset.color.primaryBg,
    border: 'none',
    borderRadius: reset.radius.md,
    cursor: 'pointer',
    flexShrink: 0,
  },
};
