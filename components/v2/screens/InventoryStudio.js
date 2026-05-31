/**
 * LESHEM.S OS — v2 Inventory Studio — v2.2
 *
 * Studio Mode: display-case card grid.
 * Data Mode:   compact professional list rows.
 * Both modes share the same filters, same data source, same WorkTray context.
 *
 * Loupe mode: passes { mode: 'inspect' } to AssetDrawer.
 * Inline tray column: appears on desktop when tray has items.
 *
 * No new API routes. No Airtable schema changes.
 */

import { useEffect, useState, useMemo } from 'react';
import styles from './InventoryStudio.module.css';
import { normalizeAsset, getAssetDisplayTitle } from '../../../lib/v2/taxonomyHelpers';
import { useWorkTray } from '../../../lib/v2/workTrayContext';
import InventoryCard from '../InventoryCard';
import InventoryDataRow from '../InventoryDataRow';
import FilterPanel from '../FilterPanel';
import AssetDrawer from '../AssetDrawer';
import WorkTrayColumn from '../WorkTrayColumn';

const DEFAULT_FILTERS = {
  categories: [],
  shapes: [],
  statuses: [],
  layers: [],
};

const VIEW_STUDIO = 'studio';
const VIEW_DATA   = 'data';

export default function InventoryStudio({ onOpenTray }) {
  const [allAssets, setAllAssets]         = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [searchQuery, setSearchQuery]     = useState('');
  const [filters, setFilters]             = useState(DEFAULT_FILTERS);
  const [filterPanelOpen, setFilterPanelOpen] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [drawerMode, setDrawerMode]       = useState('detail');
  const [viewMode, setViewMode]           = useState(VIEW_STUDIO);

  const { itemCount } = useWorkTray();
  const showTrayColumn = itemCount > 0;

  // Load from existing API endpoint — no new routes
  useEffect(() => {
    async function loadInventory() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/airtable/stones');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const rawRecords = Array.isArray(data)
          ? data
          : data.records || data.items || data.stones || data.inventory || [];
        setAllAssets(rawRecords.map(normalizeAsset).filter(Boolean));
      } catch (err) {
        console.error('[v2 InventoryStudio] Load error:', err);
        setError('לא ניתן לטעון את המלאי. אנא נסה שנית.');
      } finally {
        setLoading(false);
      }
    }
    loadInventory();
  }, []);

  // Client-side filtering + search (shared by both view modes)
  const filteredAssets = useMemo(() => {
    let result = allAssets;
    if (filters.categories.length > 0)
      result = result.filter((a) => filters.categories.includes(a.stoneCategory));
    if (filters.shapes.length > 0)
      result = result.filter((a) => filters.shapes.includes(a.shape));
    if (filters.statuses.length > 0)
      result = result.filter((a) => filters.statuses.includes(a.status));
    if (filters.layers.length > 0)
      result = result.filter((a) => filters.layers.includes(a.inventoryLayer));
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((a) => {
        const t = getAssetDisplayTitle(a).toLowerCase();
        return (
          t.includes(q) ||
          (a.color || '').toLowerCase().includes(q) ||
          (a.clarity || '').toLowerCase().includes(q) ||
          (a.reportNumber || '').toLowerCase().includes(q)
        );
      });
    }
    return result;
  }, [allAssets, filters, searchQuery]);

  const hasActiveFilters =
    filters.categories.length + filters.shapes.length +
    filters.statuses.length  + filters.layers.length > 0;

  const activeFilterCount =
    filters.categories.length + filters.shapes.length +
    filters.statuses.length  + filters.layers.length;

  // Unified handler for both card and row view-detail
  // options: { mode: 'detail' | 'inspect' }
  function handleViewDetail(asset, options = {}) {
    setDrawerMode(options.mode || 'detail');
    setSelectedAsset(asset);
  }

  function closeDrawer() {
    setSelectedAsset(null);
    setDrawerMode('detail');
  }

  // Pick the right content layout class
  function getContentClass() {
    if (filterPanelOpen && showTrayColumn) return styles.contentAreaWithTray;
    if (filterPanelOpen && !showTrayColumn) return styles.contentArea;
    if (!filterPanelOpen && showTrayColumn) return styles.contentAreaNoFilterWithTray;
    return styles.contentAreaNoFilter;
  }

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
          {/* Studio / Data mode toggle */}
          <div className={styles.viewModeToggle} role="group" aria-label="תצוגה">
            <button
              className={`${styles.viewModeBtn} ${viewMode === VIEW_STUDIO ? styles.viewModeBtnActive : ''}`}
              onClick={() => setViewMode(VIEW_STUDIO)}
              title="תצוגת כרטיסים"
              aria-label="תצוגת סטודיו"
            >
              ⊞
            </button>
            <button
              className={`${styles.viewModeBtn} ${viewMode === VIEW_DATA ? styles.viewModeBtnActive : ''}`}
              onClick={() => setViewMode(VIEW_DATA)}
              title="תצוגת רשימה"
              aria-label="תצוגת נתונים"
            >
              ≡
            </button>
          </div>

          {/* Filter toggle */}
          <button
            className={`${styles.filterToggleBtn} ${
              filterPanelOpen || hasActiveFilters ? styles.filterToggleBtnActive : ''
            }`}
            onClick={() => setFilterPanelOpen((v) => !v)}
          >
            <span>⊟</span>
            <span>
              סינון{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </span>
          </button>

          {!loading && (
            <span className={styles.resultCount}>{filteredAssets.length} פריטים</span>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className={getContentClass()}>
        {/* Filter panel */}
        {filterPanelOpen && (
          <FilterPanel filters={filters} onFilterChange={setFilters} />
        )}

        {/* Main content area */}
        <div>
          {error && <div className={styles.errorState}>{error}</div>}

          {loading && (
            <div className={styles.loadingDots}>
              <div className={styles.loadingDot} />
              <div className={styles.loadingDot} />
              <div className={styles.loadingDot} />
            </div>
          )}

          {!loading && !error && filteredAssets.length === 0 && (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>◇</span>
              <div>לא נמצאו פריטים</div>
            </div>
          )}

          {!loading && !error && filteredAssets.length > 0 && (
            <>
              {/* Studio Mode — display-case card grid */}
              {viewMode === VIEW_STUDIO && (
                <div className={styles.cardGrid}>
                  {filteredAssets.map((asset, idx) => (
                    <InventoryCard
                      key={asset._airtableId || idx}
                      asset={asset}
                      onViewDetail={handleViewDetail}
                    />
                  ))}
                </div>
              )}

              {/* Data Mode — compact professional list */}
              {viewMode === VIEW_DATA && (
                <div className={styles.dataList}>
                  {/* Column headers */}
                  <div className={styles.dataListHeader} aria-hidden="true">
                    <div style={{ width: 32, marginLeft: 10, flexShrink: 0 }} />
                    <div className={`${styles.dataListHeaderCell} ${styles.dataListHeaderIdentity}`}>
                      פריט
                    </div>
                    <div className={`${styles.dataListHeaderCell} ${styles.dataListHeaderCarat}`}>
                      קרט
                    </div>
                    <div className={`${styles.dataListHeaderCell} ${styles.dataListHeaderColor}`}>
                      צבע
                    </div>
                    <div className={`${styles.dataListHeaderCell} ${styles.dataListHeaderClarity}`}>
                      ניקיון
                    </div>
                    <div className={`${styles.dataListHeaderCell} ${styles.dataListHeaderLab}`}>
                      מעבדה
                    </div>
                    <div className={`${styles.dataListHeaderCell} ${styles.dataListHeaderLayer}`}>
                      שכבה
                    </div>
                    <div className={`${styles.dataListHeaderCell} ${styles.dataListHeaderStatus}`}>
                      סטטוס
                    </div>
                    <div className={`${styles.dataListHeaderCell} ${styles.dataListHeaderActions}`} />
                  </div>
                  {filteredAssets.map((asset, idx) => (
                    <InventoryDataRow
                      key={asset._airtableId || idx}
                      asset={asset}
                      onViewDetail={handleViewDetail}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Inline tray column — desktop only, shown when tray has items */}
        {showTrayColumn && (
          <div className={styles.inlineTrayColumn}>
            <WorkTrayColumn onOpenFullTray={onOpenTray} />
          </div>
        )}
      </div>

      {/* ── Asset Drawer ── */}
      {selectedAsset && (
        <AssetDrawer
          asset={selectedAsset}
          onClose={closeDrawer}
          mode={drawerMode}
        />
      )}
    </div>
  );
}
