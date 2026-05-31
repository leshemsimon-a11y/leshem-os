/**
 * LESHEM.S OS — v2 Inventory Studio
 *
 * Loads assets from existing Airtable read endpoint.
 * Applies client-side filtering and search.
 * Opens AssetDrawer on card click.
 * No Airtable schema changes. No new API routes.
 */

import { useEffect, useState, useMemo } from 'react';
import styles from './InventoryStudio.module.css';
import { normalizeAsset, getSearchText } from '../../../lib/v2/taxonomyHelpers';
import InventoryCard from '../InventoryCard';
import FilterPanel from '../FilterPanel';
import AssetDrawer from '../AssetDrawer';

const DEFAULT_FILTERS = {
  categories: [],
  shapes: [],
  statuses: [],
  layers: [],
};

export default function InventoryStudio({ onOpenTray }) {
  const [allAssets, setAllAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filterPanelOpen, setFilterPanelOpen] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Load from existing API endpoint
  useEffect(() => {
    async function loadInventory() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/airtable/stones');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Handle various response shapes from existing API
        const rawRecords = Array.isArray(data)
          ? data
          : data.stones || data.records || data.items || data.inventory || [];

        const normalized = rawRecords.map(normalizeAsset).filter(Boolean);
        setAllAssets(normalized);
      } catch (err) {
        console.error('[v2 InventoryStudio] Load error:', err);
        setError('לא ניתן לטעון את המלאי. אנא נסה שנית.');
      } finally {
        setLoading(false);
      }
    }
    loadInventory();
  }, []);

  // Client-side filtering + search
  const filteredAssets = useMemo(() => {
    let result = allAssets;

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter((a) => filters.categories.includes(a.stoneCategory));
    }

    // Shape filter
    if (filters.shapes.length > 0) {
      result = result.filter((a) => filters.shapes.includes(a.shape));
    }

    // Status filter
    if (filters.statuses.length > 0) {
      result = result.filter((a) => filters.statuses.includes(a.status));
    }

    // Layer filter
    if (filters.layers.length > 0) {
      result = result.filter((a) => filters.layers.includes(a.inventoryLayer));
    }

    // Search — normalized asset text, including carat variants like 0.50 / 0.5
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((a) => getSearchText(a).includes(q));
    }

    return result;
  }, [allAssets, filters, searchQuery]);

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.shapes.length > 0 ||
    filters.statuses.length > 0 ||
    filters.layers.length > 0;

  return (
    <div className={styles.studio}>
      {/* ── Top Bar ── */}
      <div className={styles.topBar}>
        <h1 className={styles.pageTitle}>מלאי</h1>

        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>◎</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="חיפוש..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            dir="rtl"
          />
        </div>

        <div className={styles.topBarRight}>
          <button
            className={`${styles.filterToggleBtn} ${
              filterPanelOpen || hasActiveFilters ? styles.filterToggleBtnActive : ''
            }`}
            onClick={() => setFilterPanelOpen((v) => !v)}
          >
            <span>⊟</span>
            <span>סינון{hasActiveFilters ? ` (${
              filters.categories.length + filters.shapes.length +
              filters.statuses.length + filters.layers.length
            })` : ''}</span>
          </button>

          {!loading && (
            <span className={styles.resultCount}>
              {filteredAssets.length} פריטים
            </span>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className={filterPanelOpen ? styles.contentArea : styles.contentAreaNoFilter}>
        {/* Filter panel */}
        {filterPanelOpen && (
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
          />
        )}

        {/* Card Grid */}
        <div>
          {error && (
            <div className={styles.errorState}>{error}</div>
          )}

          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.loadingDots}>
                <div className={styles.loadingDot} />
                <div className={styles.loadingDot} />
                <div className={styles.loadingDot} />
              </div>
            </div>
          )}

          {!loading && !error && filteredAssets.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>◇</div>
              <div>לא נמצאו פריטים</div>
            </div>
          )}

          {!loading && !error && filteredAssets.length > 0 && (
            <div className={styles.cardGrid}>
              {filteredAssets.map((asset, idx) => (
                <InventoryCard
                  key={asset._airtableId || idx}
                  asset={asset}
                  onViewDetail={setSelectedAsset}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Asset Drawer ── */}
      {selectedAsset && (
        <AssetDrawer
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </div>
  );
}
