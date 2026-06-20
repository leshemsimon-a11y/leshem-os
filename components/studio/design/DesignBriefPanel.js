// components/studio/design/DesignBriefPanel.js
//
// LESHEM.S OS — Jewelry Design Brief Panel (Clean 3C)
//
// The first ACTIVE creative layer in the Design Studio. It sits in the
// "Design Direction" board zone and lets the jeweller record the intent of
// the piece being built around the selected stones: jewelry type, metal,
// style, a free-text intention, and notes. Reference material is shown as
// clearly DISABLED future placeholders (image / video / sketch / 3D / link /
// text) — no upload is built in Clean 3C.
//
// Feel: calm, visual, chip-based — like jotting the direction of a piece, not
// filling a heavy form. Everything is optional and reversible; nothing blocks.
//
// Local only: reads/writes the design brief store (localStorage). NO Airtable,
// NO network, NO new packages, no commerce language.

import * as React from 'react';
import { tokens } from '../shared/tokens';
import { BRIEF_HE } from '../../../lib/studio/labels';
import {
  JEWELRY_TYPE_VALUES,
  METAL_PREFERENCE_VALUES,
  STYLE_PREFERENCE_VALUES,
  REFERENCE_KIND_VALUES,
  briefStatus,
} from '../../../lib/studio/designDraft';
import { createUseDesignBrief } from '../../../lib/studio/designBriefStore';

const useDesignBrief = createUseDesignBrief(React);

// A reusable single-select chip row (type / metal / style).
function ChipSelect({ label, options, labelMap, value, onChange }) {
  return (
    <div style={styles.field} dir="rtl">
      <span style={styles.fieldLabel}>{label}</span>
      <div style={styles.chips}>
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(selected ? null : opt)}
              style={{ ...styles.chip, ...(selected ? styles.chipSelected : null) }}
              aria-pressed={selected}
            >
              {selected && (
                <span style={styles.tick} aria-hidden="true">
                  ✓
                </span>
              )}
              {labelMap[opt] || opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// The reserved reference kinds, shown as inert disabled tiles (no upload).
function ReferencePlaceholders() {
  const glyphs = {
    image: '▣',
    video: '▶',
    sketch: '✎',
    model3d: '◫',
    link: '🔗',
    text: '✑',
  };
  return (
    <div style={styles.field} dir="rtl">
      <span style={styles.fieldLabel}>{BRIEF_HE.referenceLabel}</span>
      <div style={styles.refGrid}>
        {REFERENCE_KIND_VALUES.map((kind) => (
          <div
            key={kind}
            style={styles.refTile}
            aria-disabled="true"
            title="יתווסף בשלב מאוחר יותר"
          >
            <span style={styles.refGlyph} aria-hidden="true">
              {glyphs[kind] || '▣'}
            </span>
            <span style={styles.refLabel}>{BRIEF_HE.reference[kind]}</span>
            <span style={styles.refBadge}>בקרוב</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DesignBriefPanel() {
  const { brief, hydrated, update, save, clear } = useDesignBrief();

  if (!hydrated) {
    return <div style={styles.loading}>טוען תקציר…</div>;
  }

  const status = briefStatus(brief);
  const statusCopy =
    status.key === 'saved'
      ? { t: BRIEF_HE.status.savedTitle, b: BRIEF_HE.status.savedBody }
      : status.key === 'draft'
      ? { t: BRIEF_HE.status.draftTitle, b: BRIEF_HE.status.draftBody }
      : { t: BRIEF_HE.status.temporaryTitle, b: BRIEF_HE.status.temporaryBody };
  const ready = status.tone === 'ready';

  return (
    <div style={styles.wrap} dir="rtl">
      <p style={styles.localNote}>{BRIEF_HE.localNote}</p>

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

      <ChipSelect
        label={BRIEF_HE.jewelryTypeLabel}
        options={JEWELRY_TYPE_VALUES}
        labelMap={BRIEF_HE.jewelryType}
        value={brief.jewelryType}
        onChange={(v) => update({ jewelryType: v })}
      />

      <ChipSelect
        label={BRIEF_HE.metalLabel}
        options={METAL_PREFERENCE_VALUES}
        labelMap={BRIEF_HE.metal}
        value={brief.metalPreference}
        onChange={(v) => update({ metalPreference: v })}
      />

      <ChipSelect
        label={BRIEF_HE.styleLabel}
        options={STYLE_PREFERENCE_VALUES}
        labelMap={BRIEF_HE.style}
        value={brief.stylePreference}
        onChange={(v) => update({ stylePreference: v })}
      />

      <div style={styles.field}>
        <span style={styles.fieldLabel}>{BRIEF_HE.intentionLabel}</span>
        <textarea
          value={brief.intention}
          onChange={(e) => update({ intention: e.target.value })}
          placeholder={BRIEF_HE.intentionPlaceholder}
          style={styles.textarea}
          rows={3}
          dir="rtl"
        />
      </div>

      <div style={styles.field}>
        <span style={styles.fieldLabel}>{BRIEF_HE.notesLabel}</span>
        <textarea
          value={brief.notes}
          onChange={(e) => update({ notes: e.target.value })}
          placeholder={BRIEF_HE.notesPlaceholder}
          style={styles.textarea}
          rows={2}
          dir="rtl"
        />
      </div>

      <ReferencePlaceholders />

      <div style={styles.actions}>
        <button type="button" onClick={clear} style={styles.secondaryBtn}>
          {BRIEF_HE.clear}
        </button>
        <button type="button" onClick={save} style={styles.primaryBtn}>
          {status.key === 'saved' ? BRIEF_HE.saved : BRIEF_HE.save}
        </button>
      </div>
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
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  fieldLabel: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    color: tokens.color.inkSoft,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    minHeight: '44px',
    padding: '10px 16px',
    fontFamily: tokens.font.body,
    fontSize: '15px',
    fontWeight: 600,
    color: tokens.color.charcoal,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: '999px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background 140ms ease, border-color 140ms ease',
  },
  chipSelected: {
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.gold}`,
  },
  tick: {
    fontSize: '13px',
    lineHeight: 1,
    color: tokens.color.gold,
  },
  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: tokens.font.body,
    fontSize: '15px',
    lineHeight: 1.6,
    color: tokens.color.ink,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    padding: '12px 14px',
    resize: 'vertical',
    outline: 'none',
  },
  refGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  refTile: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    minHeight: '48px',
    padding: '10px 14px',
    borderRadius: tokens.radius.md,
    border: `1px dashed ${tokens.color.cardEdge}`,
    background: tokens.color.pearl,
    color: tokens.color.disabledText,
    cursor: 'not-allowed',
    userSelect: 'none',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    flex: '1 1 200px',
    minWidth: '170px',
  },
  refGlyph: {
    fontSize: '16px',
    lineHeight: 1,
    color: tokens.color.inkFaint,
  },
  refLabel: {
    fontWeight: 500,
    flex: 1,
  },
  refBadge: {
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: tokens.color.inkFaint,
    background: tokens.color.goldFaint,
    borderRadius: '999px',
    padding: '2px 8px',
    whiteSpace: 'nowrap',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingTop: '4px',
  },
  primaryBtn: {
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
  },
  secondaryBtn: {
    minHeight: '48px',
    padding: '12px 22px',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.color.inkSoft,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
  },
};
