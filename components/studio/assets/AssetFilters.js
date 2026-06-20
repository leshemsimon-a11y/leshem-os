// components/studio/assets/AssetFilters.js
//
// LESHEM.S OS — Asset Filters (Clean 4B.1)
//
// Chip filters across four axes: object type, file kind, file purpose, status.
// Object type filters which objects show; file kind / purpose / status filter
// which files show inside each object. "הכול" clears an axis. Pure UI.

import { tokens } from '../shared/tokens';
import { ASSETS_OBJ_HE } from '../../../lib/studio/labels';
import {
  OBJECT_TYPE_VALUES,
  FILE_KIND_VALUES,
  FILE_PURPOSE_VALUES,
  STATUS_VALUES,
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
          {ASSETS_OBJ_HE.filterAll}
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

export default function AssetFilters({
  objectType,
  fileKind,
  filePurpose,
  status,
  onObjectType,
  onFileKind,
  onFilePurpose,
  onStatus,
}) {
  return (
    <div style={styles.wrap}>
      <ChipRow
        label={ASSETS_OBJ_HE.filterObjectType}
        options={OBJECT_TYPE_VALUES}
        labelMap={ASSETS_OBJ_HE.objectType}
        value={objectType}
        onChange={onObjectType}
      />
      <ChipRow
        label={ASSETS_OBJ_HE.filterFileKind}
        options={FILE_KIND_VALUES}
        labelMap={ASSETS_OBJ_HE.fileKind}
        value={fileKind}
        onChange={onFileKind}
      />
      <ChipRow
        label={ASSETS_OBJ_HE.filterPurpose}
        options={FILE_PURPOSE_VALUES.filter((p) => p !== 'none')}
        labelMap={ASSETS_OBJ_HE.filePurpose}
        value={filePurpose}
        onChange={onFilePurpose}
      />
      <ChipRow
        label={ASSETS_OBJ_HE.filterStatus}
        options={STATUS_VALUES.filter((s) => s !== 'archived')}
        labelMap={STATUS_LABELS}
        value={status}
        onChange={onStatus}
      />
    </div>
  );
}

const STATUS_LABELS = {
  draft: 'טיוטה',
  reference: 'רפרנס',
  approved: 'מאושר',
  archived: 'בארכיון',
};

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' },
  row: { display: 'flex', flexDirection: 'column', gap: '8px' },
  rowLabel: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    color: tokens.color.inkSoft,
  },
  chips: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
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
  chipActive: { background: tokens.color.goldFaint, border: `1px solid ${tokens.color.gold}` },
};
