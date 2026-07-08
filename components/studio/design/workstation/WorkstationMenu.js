// components/studio/design/workstation/WorkstationMenu.js
//
// LESHEM.S OS — Clean 6D: Studio Workstation Prototype — Zone 4.
//
// Right docked Design Menu ("תפריט עיצוב") — visible by default on desktop.
// Product type, style, metal, stone usage, freedom level and a short note.
// Every tap writes straight to the EXISTING design brief through the
// onUpdate callback the shell wires to the existing brief store hook
// (createUseDesignBrief → updateBrief). Same fields the stable Studio's
// Intent drawer edits (productType / styleDirection / metalPreference /
// stoneUsage / freedomLevel / designGoal) — both surfaces stay in sync live
// through the store's existing event system. NO new store, NO new key.
//
// Cluster / קלאסטר: adding it as a real style value requires an enum change
// in the PROTECTED lib/studio/designDraft.js (STYLE_PREFERENCE +
// normalizeBrief validation would strip an unknown value). Per Clean 6D
// instructions that part is NOT coded — reported separately instead. The
// menu renders the existing style values only.

import * as React from 'react';
import { ws } from './wsStyle';
import { WS_HE } from './wsLabels';
import { INTENT_HE, CONCEPT_HE, BRIEF_HE } from '../../../../lib/studio/labels';
import {
  PRODUCT_TYPE_VALUES,
  STYLE_PREFERENCE_VALUES,
  METAL_PREFERENCE_VALUES,
  STONE_USAGE_VALUES,
  FREEDOM_LEVEL_VALUES,
  DEFAULT_FREEDOM_LEVEL,
} from '../../../../lib/studio/designDraft';

// A chip group bound to one brief field. Tapping the selected chip clears it
// back to null — the same toggle contract as the stable Intent drawer.
function ChipGroup({ label, options, labelMap, value, onChange }) {
  return (
    <div style={styles.group}>
      <span style={styles.groupLabel}>{label}</span>
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

function FreedomPicker({ value, onChange }) {
  const current = value || DEFAULT_FREEDOM_LEVEL;
  return (
    <div style={styles.group}>
      <span style={styles.groupLabel}>{INTENT_HE.freedomLabel}</span>
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
              title={INTENT_HE.freedomHint[lvl]}
            >
              <span
                style={{ ...styles.freedomDot, ...(selected ? styles.freedomDotOn : null) }}
                aria-hidden="true"
              />
              <span style={styles.freedomName}>{INTENT_HE.freedom[lvl]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function WorkstationMenu({ brief, onUpdate, onHide, narrow }) {
  const b = brief || {};
  const set = (patch) => onUpdate && onUpdate(patch);

  return (
    <aside
      style={{ ...styles.menu, ...(narrow ? styles.menuNarrow : null) }}
      dir="rtl"
      aria-label={CONCEPT_HE.directionTitle}
    >
      <div style={styles.header}>
        <span style={styles.title}>{CONCEPT_HE.directionTitle}</span>
        {typeof onHide === 'function' && (
          <button type="button" onClick={onHide} style={styles.hideBtn}>
            {WS_HE.menu.hide}
          </button>
        )}
      </div>

      <div style={styles.body}>
        <ChipGroup
          label={CONCEPT_HE.productTypeLabel}
          options={PRODUCT_TYPE_VALUES}
          labelMap={CONCEPT_HE.productType}
          value={b.productType || null}
          onChange={(v) => set({ productType: v })}
        />
        <ChipGroup
          label={INTENT_HE.styleLabel}
          options={STYLE_PREFERENCE_VALUES}
          labelMap={BRIEF_HE.style}
          value={b.styleDirection || null}
          onChange={(v) => set({ styleDirection: v })}
        />
        <ChipGroup
          label={INTENT_HE.metalLabel}
          options={METAL_PREFERENCE_VALUES}
          labelMap={BRIEF_HE.metal}
          value={b.metalPreference || null}
          onChange={(v) => set({ metalPreference: v })}
        />
        <ChipGroup
          label={INTENT_HE.stoneUsageLabel}
          options={STONE_USAGE_VALUES}
          labelMap={CONCEPT_HE.stoneUsage}
          value={b.stoneUsage || null}
          onChange={(v) => set({ stoneUsage: v })}
        />
        <FreedomPicker
          value={b.freedomLevel}
          onChange={(v) => set({ freedomLevel: v })}
        />

        <div style={styles.group}>
          <span style={styles.groupLabel}>{INTENT_HE.noteLabel}</span>
          <textarea
            value={b.designGoal || ''}
            onChange={(e) => set({ designGoal: e.target.value })}
            placeholder={INTENT_HE.notePlaceholder}
            style={styles.note}
            rows={3}
            dir="rtl"
          />
        </div>
      </div>
    </aside>
  );
}

const styles = {
  menu: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    borderRadius: ws.radius.lg,
    background: ws.color.surface,
    border: `1px solid ${ws.color.border}`,
    boxShadow: ws.shadow.card,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    overflow: 'hidden',
  },
  menuNarrow: {
    maxHeight: '60vh',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    padding: '12px 14px',
    borderBottom: `1px solid ${ws.color.border}`,
    flexShrink: 0,
  },
  title: {
    fontFamily: ws.font.display,
    fontSize: '13px',
    fontWeight: 800,
    color: ws.color.text,
  },
  hideBtn: {
    padding: '4px 10px',
    borderRadius: '999px',
    border: `1px solid ${ws.color.borderStrong}`,
    background: 'transparent',
    color: ws.color.textMuted,
    fontFamily: ws.font.body,
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    padding: '12px 14px 16px',
    overflowY: 'auto',
    minHeight: 0,
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
  },
  groupLabel: {
    fontFamily: ws.font.body,
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '0.3px',
    color: ws.color.gold,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  chip: {
    padding: '5px 11px',
    borderRadius: '999px',
    border: `1px solid ${ws.color.border}`,
    background: 'rgba(0,0,0,0.22)',
    color: ws.color.textMuted,
    fontFamily: ws.font.body,
    fontSize: '11.5px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  chipOn: {
    border: `1px solid ${ws.color.gold}`,
    background: ws.color.goldSoft,
    color: ws.color.text,
  },
  freedomList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  freedomRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '7px 10px',
    borderRadius: ws.radius.sm,
    border: `1px solid ${ws.color.border}`,
    background: 'rgba(0,0,0,0.22)',
    cursor: 'pointer',
    textAlign: 'right',
  },
  freedomRowOn: {
    border: `1px solid ${ws.color.gold}`,
    background: ws.color.goldFaint,
  },
  freedomDot: {
    width: '9px',
    height: '9px',
    borderRadius: '50%',
    border: `1.5px solid ${ws.color.textFaint}`,
    flexShrink: 0,
  },
  freedomDotOn: {
    border: `1.5px solid ${ws.color.gold}`,
    background: ws.color.gold,
  },
  freedomName: {
    fontFamily: ws.font.body,
    fontSize: '12px',
    fontWeight: 700,
    color: ws.color.text,
  },
  note: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '9px 11px',
    borderRadius: ws.radius.sm,
    border: `1px solid ${ws.color.border}`,
    background: 'rgba(0,0,0,0.25)',
    color: ws.color.text,
    fontFamily: ws.font.body,
    fontSize: '12px',
    lineHeight: 1.5,
    resize: 'vertical',
    outline: 'none',
  },
};
