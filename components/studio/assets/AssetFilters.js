// components/studio/assets/AssetFilters.js
//
// LESHEM.S OS — Asset Filters (Clean 4B)
//
// Tap-friendly chip filters for the Asset Library: filter by category and by
// status. "הכול" clears each axis. Pure presentation; the parent owns state.

import { tokens } from '../shared/tokens';
import { ASSETS_HE } from '../../../lib/studio/labels';
import {
  ASSET_CATEGORY_VALUES,
  ASSET_STATUS_VALUES,
} from '../../../lib/studio/assetsStore';

function ChipRow({ label, options, labelMap, value, onChange }) {
  return (
    <div style={styles.row} dir="rtl">
      <span style={styles.rowLabel}>{label}</span>
      <div style={styles.chips}>
        <button
          type="button"
          onClick={() => onChange(null)}
          style={{ ...styles.chip, ...(!value ? styles.chipActive : null) }}
        >
          {ASSETS_HE.filterAll}
        </button>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(value === opt ? null : opt)}
            style={{ ...styles.chip, ...(value === opt ? styles.chipActive : null) }}
          >
            {labelMap[opt] || opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AssetFilters({ category, status, onCategory, onStatus }) {
  return (
    <div style={styles.wrap}>
      <ChipRow
        label={ASSETS_HE.categoryLabel}
        options={ASSET_CATEGORY_VALUES}
        labelMap={ASSETS_HE.category}
        value={category}
        onChange={onCategory}
      />
      <ChipRow
        label={ASSETS_HE.statusLabel}
        options={ASSET_STATUS_VALUES.filter((s) => s !== 'archived')}
        labelMap={ASSETS_HE.status}
        value={status}
        onChange={onStatus}
      />
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '18px',
  },
  row: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  rowLabel: {
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
    minHeight: '40px',
    padding: '8px 14px',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.color.charcoal,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: '999px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  chipActive: {
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.gold}`,
  },
};
