/**
 * LESHEM.S OS — v2 Filter Panel
 * Client-side filtering for Inventory Studio.
 * No API calls. Filters are applied to already-fetched data.
 */

import styles from './FilterPanel.module.css';
import {
  getStoneCategoryLabel,
  getShapeLabel,
  getStatusLabel,
  getInventoryLayerLabel,
} from '../../lib/v2/taxonomyHelpers';

const CATEGORIES = ['white_diamond', 'fancy_color_diamond', 'colored_gemstone'];
const SHAPES = ['round', 'oval', 'cushion', 'emerald', 'pear', 'radiant', 'marquise', 'princess', 'heart', 'other'];
const STATUSES = ['available', 'reserved', 'in_use', 'sold', 'archived'];
const LAYERS = ['physical_stock', 'virtual_supplier_stock', 'client_owned_item'];

function FilterGroup({ title, options, selected, onToggle, labelFn }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionLabel}>{title}</div>
      <div className={styles.filterOptions}>
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              className={`${styles.filterOption} ${active ? styles.filterOptionActive : ''}`}
              onClick={() => onToggle(opt)}
            >
              <span className={`${styles.filterDot} ${active ? styles.filterDotActive : ''}`} />
              <span>{labelFn(opt)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FilterPanel({ filters, onFilterChange }) {
  const { categories = [], shapes = [], statuses = [], layers = [] } = filters;

  function toggle(key, value) {
    const current = filters[key] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilterChange({ ...filters, [key]: updated });
  }

  function clearAll() {
    onFilterChange({ categories: [], shapes: [], statuses: [], layers: [] });
  }

  const hasActiveFilters =
    categories.length > 0 || shapes.length > 0 ||
    statuses.length > 0 || layers.length > 0;

  return (
    <div className={styles.panel}>
      <div className={styles.panelTitle}>סינון</div>

      <FilterGroup
        title="קטגוריה"
        options={CATEGORIES}
        selected={categories}
        onToggle={(v) => toggle('categories', v)}
        labelFn={(v) => getStoneCategoryLabel(v, 'he')}
      />

      <div className={styles.divider} />

      <FilterGroup
        title="צורה"
        options={SHAPES}
        selected={shapes}
        onToggle={(v) => toggle('shapes', v)}
        labelFn={(v) => getShapeLabel(v, 'he')}
      />

      <div className={styles.divider} />

      <FilterGroup
        title="סטטוס"
        options={STATUSES}
        selected={statuses}
        onToggle={(v) => toggle('statuses', v)}
        labelFn={(v) => getStatusLabel(v, 'he')}
      />

      <div className={styles.divider} />

      <FilterGroup
        title="שכבת מלאי"
        options={LAYERS}
        selected={layers}
        onToggle={(v) => toggle('layers', v)}
        labelFn={(v) => getInventoryLayerLabel(v, 'he')}
      />

      {hasActiveFilters && (
        <button className={styles.clearBtn} onClick={clearAll}>
          נקה סינון
        </button>
      )}
    </div>
  );
}
