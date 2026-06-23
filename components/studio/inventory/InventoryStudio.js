// components/studio/inventory/InventoryStudio.js
//
// LESHEM.S OS — Inventory Studio (Clean 2)
//
// Orchestrates the inventory experience: loads assets via lib/studio/assets,
// holds search + filter state, renders the display-case grid, and opens the
// Asset Drawer for inspection. All states (loading / empty / error) are honest
// and in Hebrew. Read-only — no writes, no Builder, no Stability.

import { useEffect, useMemo, useState, useCallback } from 'react';
import { tokens } from '../shared/tokens';
import useIsMobile from '../shared/useIsMobile';
import { LoadingState, EmptyState, ErrorState } from '../shared/StudioStates';
import { fetchInventory } from '../../../lib/studio/assets';
import InventoryToolbar from './InventoryToolbar';
import StoneCard from './StoneCard';
import InventoryDraftsPanel from './InventoryDraftsPanel';
import LocalInventorySections from './LocalInventorySections';
import AssetDrawer from '../drawer/AssetDrawer';

const EMPTY_FILTERS = {
  stoneCategory: 'all',
  origin: 'all',
  stoneType: 'all',
  shape: 'all',
  inventoryLayer: 'all',
  status: 'all',
};

export default function InventoryStudio() {
  const isMobile = useIsMobile(880);

  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [assets, setAssets] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selected, setSelected] = useState(null);

  const load = useCallback((signal) => {
    setStatus('loading');
    setErrorMsg(null);
    fetchInventory(signal)
      .then(({ assets: list, error }) => {
        if (signal && signal.aborted) return;
        setAssets(list);
        if (error) {
          setErrorMsg(error);
          // If we still got some assets despite the error, show them; else error state.
          setStatus(list.length > 0 ? 'ready' : 'error');
        } else {
          setStatus('ready');
        }
      })
      .catch((e) => {
        if (e && e.name === 'AbortError') return;
        console.warn('[InventoryStudio] unexpected load failure', e);
        setErrorMsg('אירעה תקלה בטעינת המלאי.');
        setStatus('error');
      });
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    load(ctrl.signal);
    return () => ctrl.abort();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assets.filter((a) => {
      if (q && !(a._search || '').includes(q)) return false;
      for (const key of Object.keys(EMPTY_FILTERS)) {
        const want = filters[key];
        if (want && want !== 'all') {
          const have = a.axes ? a.axes[key] : null;
          if (have !== want) return false;
        }
      }
      return true;
    });
  }, [assets, query, filters]);

  const onFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const onClear = useCallback(() => {
    setQuery('');
    setFilters(EMPTY_FILTERS);
  }, []);

  const gridStyle = {
    ...styles.grid,
    gridTemplateColumns: isMobile
      ? 'repeat(auto-fill, minmax(150px, 1fr))'
      : 'repeat(auto-fill, minmax(230px, 1fr))',
  };

  return (
    <div dir="rtl">
      <header style={styles.header}>
        <span style={styles.eyebrow}>מלאי הסטודיו</span>
        <h1 style={styles.title}>מלאי</h1>
        <p style={styles.lede}>
          חלל היצירה של הסטודיו — עיינו באבנים, חפשו וסננו, ובדקו כל פריט מקרוב.
        </p>
      </header>

      {/* Clean 4C — local working inventory: physical / supplier / client
          sections, quick-add, and multi-select → Work Tray. */}
      <LocalInventorySections />

      {/* Clean 4B.4b — local inventory drafts created from assets
          ("טיוטות מלאי מנכסים"). Renders only when drafts exist. */}
      <InventoryDraftsPanel />

      <div style={styles.airtableHead}>
        <h2 style={styles.airtableTitle}>{'מלאי פיזי — קטלוג הסטודיו'}</h2>
        <p style={styles.airtableCaption}>
          {'קטלוג האבנים לקריאה בלבד. עיון, חיפוש וסינון; ושליחה למגש העבודה.'}
        </p>
      </div>

      {status === 'loading' && <LoadingState />}

      {status === 'error' && (
        <ErrorState
          message={
            errorMsg ||
            'המלאי אינו זמין כרגע. נסו שוב מאוחר יותר.'
          }
          onRetry={() => load()}
        />
      )}

      {status === 'ready' && (
        <>
          {errorMsg && (
            <div style={styles.banner}>{errorMsg}</div>
          )}

          <InventoryToolbar
            assets={assets}
            query={query}
            onQuery={setQuery}
            filters={filters}
            onFilter={onFilter}
            onClear={onClear}
            resultCount={filtered.length}
          />

          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={gridStyle}>
              {filtered.map((asset) => (
                <StoneCard
                  key={asset.key}
                  asset={asset}
                  onInspect={setSelected}
                />
              ))}
            </div>
          )}
        </>
      )}

      <AssetDrawer asset={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

const styles = {
  header: {
    marginBottom: '28px',
  },
  eyebrow: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: tokens.color.gold,
  },
  title: {
    fontFamily: tokens.font.display,
    fontWeight: 700,
    fontSize: '34px',
    color: tokens.color.charcoal,
    margin: '8px 0 12px',
  },
  lede: {
    fontFamily: tokens.font.body,
    fontSize: '15px',
    lineHeight: 1.7,
    color: tokens.color.inkSoft,
    maxWidth: '560px',
    margin: 0,
  },
  banner: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    color: tokens.color.charcoal,
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.goldSoft}`,
    borderRadius: tokens.radius.sm,
    padding: '10px 14px',
    marginBottom: '18px',
  },
  airtableHead: { margin: '8px 0 16px' },
  airtableTitle: { fontFamily: tokens.font.display, fontWeight: 700, fontSize: '22px', color: tokens.color.charcoal, margin: 0 },
  airtableCaption: { fontFamily: tokens.font.body, fontSize: '13px', lineHeight: 1.6, color: tokens.color.inkSoft, margin: '6px 0 0', maxWidth: '620px' },
  grid: {
    display: 'grid',
    gap: '18px',
  },
};
