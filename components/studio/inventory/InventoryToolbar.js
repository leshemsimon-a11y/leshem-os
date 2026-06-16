// components/studio/inventory/InventoryToolbar.js
//
// LESHEM.S OS — Inventory Toolbar (Clean 2)
//
// Search box + filter selects built on the clean six-axis taxonomy. Filter
// option lists are derived from the actual loaded assets (so we never show a
// filter value that matches nothing) and labelled in Hebrew.

import { tokens } from '../shared/tokens';
import { toAppHe as toAppHeAxis } from '../../../lib/studio/labels';
import { toAppHe as toAppHeExisting } from '../../../lib/labels/productLabels';

// Build distinct, sorted options for a given axis from the assets.
function optionsFor(assets, axisKey, labelFn) {
  const seen = new Map();
  assets.forEach((a) => {
    const v = a.axes ? a.axes[axisKey] : null;
    if (v == null || v === '') return;
    if (!seen.has(v)) seen.set(v, labelFn(v));
  });
  return Array.from(seen.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((x, y) => x.label.localeCompare(y.label, 'he'));
}

export default function InventoryToolbar({
  assets,
  query,
  onQuery,
  filters,
  onFilter,
  onClear,
  resultCount,
}) {
  const categoryOpts = optionsFor(assets, 'stoneCategory', (v) =>
    toAppHeAxis('stoneCategory', v)
  );
  const originOpts = optionsFor(assets, 'origin', (v) =>
    toAppHeAxis('origin', v)
  );
  const typeOpts = optionsFor(assets, 'stoneType', (v) =>
    toAppHeAxis('stoneType', v)
  );
  const shapeOpts = optionsFor(assets, 'shape', (v) =>
    toAppHeAxis('shape', v)
  );
  const layerOpts = optionsFor(assets, 'inventoryLayer', (v) =>
    toAppHeAxis('inventoryLayer', v)
  );
  const statusOpts = optionsFor(assets, 'status', (v) => toAppHeExisting(v));

  const hasActiveFilter =
    query ||
    Object.values(filters).some((v) => v && v !== 'all');

  const selects = [
    { key: 'stoneCategory', label: 'קטגוריה', opts: categoryOpts },
    { key: 'origin', label: 'מקור', opts: originOpts },
    { key: 'stoneType', label: 'סוג אבן', opts: typeOpts },
    { key: 'shape', label: 'צורה', opts: shapeOpts },
    { key: 'inventoryLayer', label: 'שכבת מלאי', opts: layerOpts },
    { key: 'status', label: 'סטטוס', opts: statusOpts },
  ].filter((s) => s.opts.length > 0);

  return (
    <div style={styles.wrap} dir="rtl">
      <div style={styles.searchRow}>
        <input
          type="text"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="חיפוש לפי סוג, צורה, צבע, מספר תעודה או מק״ט…"
          style={styles.search}
          aria-label="חיפוש במלאי"
        />
        {hasActiveFilter && (
          <button type="button" onClick={onClear} style={styles.clear}>
            ניקוי
          </button>
        )}
      </div>

      <div style={styles.filters}>
        {selects.map((s) => (
          <label key={s.key} style={styles.filterLabel}>
            <span style={styles.filterCaption}>{s.label}</span>
            <select
              value={filters[s.key] || 'all'}
              onChange={(e) => onFilter(s.key, e.target.value)}
              style={styles.select}
            >
              <option value="all">הכול</option>
              {s.opts.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div style={styles.count}>{resultCount} פריטים</div>
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginBottom: '24px',
  },
  searchRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  search: {
    flex: 1,
    fontFamily: tokens.font.body,
    fontSize: '15px',
    color: tokens.color.charcoal,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    padding: '12px 16px',
    outline: 'none',
  },
  clear: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.color.inkSoft,
    background: 'transparent',
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.sm,
    padding: '10px 18px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  filterLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  filterCaption: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: tokens.color.inkFaint,
    paddingInlineStart: '4px',
  },
  select: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    color: tokens.color.charcoal,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.sm,
    padding: '9px 12px',
    cursor: 'pointer',
    minWidth: '130px',
  },
  count: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    color: tokens.color.inkFaint,
  },
};
