// components/studio/demo/DemoInventoryWorkspace.js
// LESHEM.S OS — clean temporary Demo Inventory screen.
// No Airtable writes, no schema changes.
//
// Patch D — Inventory / Tray / Studio Usability V1: this screen is reworked
// into a familiar, compact CATALOG/product-grid browser (image-first cards,
// chip filters, drawer details, mobile-safe) instead of the previous wide
// 3-column workspace. WHAT DID NOT CHANGE — the entire data flow is
// preserved from the Patch A ("One Tray") version, byte-for-byte where it
// matters:
//   • persist / updateActive / toggleTray / resetDemo
//   • the one-time reconcile of the demo selectedForTray flag against REAL
//     Work Tray membership (same existing persist path)
//   • REAL tray membership (tray.has via trayIds) is still the single source
//     of truth for the "in tray" state
//   • every import from lib/studio/demoInventoryLayer.js and the
//     createUseWorkTray hook wiring
// WHAT CHANGED (visual/structural only):
//   • Compact catalog grid: square contain images, short title, one metadata
//     line (shape · carat · color), small source/status chips, icon actions
//     (inspect / add-remove tray / start design).
//   • Details + the existing edit fields moved into an overlay DRAWER
//     (side panel on desktop, bottom sheet on mobile) — cards stay short.
//   • Filters became chips: stone type visible, source/status collapsed
//     behind a "סינון" toggle. Filtering logic extended locally (additive).
//   • Mobile: 2-column grid, sticky bottom action bar for the active item,
//     no desktop-only side panels squeezing content.
//   • Text reduction: the subtitle paragraph, the activity feed row, the
//     stats row, and the explanatory note box are gone from the main screen;
//     status feedback became a small toast.

import * as React from 'react';
import { useRouter } from 'next/router';
import { tokens } from '../shared/tokens';
import useIsMobile from '../shared/useIsMobile';
import { TRAY_HE, STUDIO_5D_HE, USABILITY_D_HE } from '../../../lib/studio/labels';
import { createUseWorkTray } from '../../../lib/studio/workTray';
import {
  getDemoInventorySnapshot,
  saveDemoInventorySnapshot,
  resetDemoInventorySnapshot,
  getSourceLabelHe,
  getSourceContextBadge,
  getStatusLabelHe,
  toStudioTrayItem,
} from '../../../lib/studio/demoInventoryLayer';

const useWorkTray = createUseWorkTray(React);

// Clean 8K-R3 — bottom selection bar copy (section 5). Local literals,
// following this codebase's established pattern (e.g. Clean 8K's
// StudioCommandBar.js) of keeping small, surface-specific strings local
// rather than expanding the widely-shared lib/studio/labels.js, which is
// read by ~60 files including the off-limits /studio/workstation route.
const INV_SELECTION_HE = Object.freeze({
  oneSelected: 'נבחרה אבן אחת',
  manySelected: (n) => `נבחרו ${n} אבנים`,
  createWithOne: 'צור איתה',
  createWithMany: 'צור עם האבנים שנבחרו',
});

const SOURCE_OPTIONS = [
  { value: 'owned', label: 'מלאי שלנו' },
  { value: 'supplier', label: 'ספק' },
  { value: 'client-owned', label: 'של לקוח' },
];

const STATUS_OPTIONS = [
  { value: 'available', label: 'זמינה' },
  { value: 'selected', label: 'נבחרה' },
  { value: 'in-design', label: 'בעיצוב' },
  { value: 'reserved', label: 'שמורה' },
];

const TYPE_FILTERS = [
  { value: 'all', label: 'הכול' },
  { value: 'Diamond', label: 'יהלומים' },
  { value: 'Emerald', label: 'אמרלד' },
  { value: 'Ruby', label: 'רובי' },
  { value: 'Sapphire', label: 'ספיר' },
  { value: 'Paraiba Tourmaline', label: 'פאראיבה' },
];

function currency(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  } catch (e) {
    return `$${Math.round(n)}`;
  }
}

function cloneItems(items) {
  return Array.isArray(items) ? items.map((item) => ({ ...item })) : [];
}

// Small inline icon set — self-contained (no cross-import from the Design
// Studio shell), matching this file's own "self-contained" convention.
function TrayIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M4 13h4l2 3h4l2-3h4" />
      <path d="M5 13l1.6-7h10.8L19 13" />
      <path d="M4 13v5.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V13" />
    </svg>
  );
}
function RemoveIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13" />
    </svg>
  );
}
function DesignIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 17.5L14 6.5l3.5 3.5L6.5 21H3v-3.5z" />
      <path d="M13 7.5l3.5 3.5" />
    </svg>
  );
}
function ResetIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
      <path d="M20 11a8 8 0 1 0-.6 4M20 5v6h-6" />
    </svg>
  );
}
function SearchIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.3-4.3" />
    </svg>
  );
}
function CheckIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12.5l5 5L20 6" />
    </svg>
  );
}
function EyeIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}
function CloseIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
function FilterIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}

function Field({ label, children }) {
  return (
    <label style={styles.field}>
      <span style={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ...styles.chip, ...(active ? styles.chipActive : null) }}
    >
      {children}
    </button>
  );
}

// Compact, image-first catalog card. Short title, ONE metadata line, small
// source/status chips, icon actions. Details live in the drawer, never here.
// Clean 8K-R3 — Atelier Experience System (section 5: Inventory Visual
// Reduction). Always visible now: image, name, stone type + weight, and
// ONE status pill. Inspect / tray-toggle / design actions moved into a
// hover/focus-revealed control row (real CSS via the scoped <style jsx>
// block below — not display:none, so the controls stay reachable and
// focusable by keyboard at all times; only their VISUAL prominence is
// deferred until hover/focus, per section 8's "no important action
// available only on hover"). inventoryNo/price kept as a light
// informational line — not controls, so they don't count against the
// "always visible" reduction.
function CatalogCard({ item, active, inTray, onInspect, onToggleTray, onDesign }) {
  const meta = [item.shapeHe, item.estimatedCarat != null ? `${item.estimatedCarat}ct` : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <article
      className="inv-card"
      style={{
        ...styles.card,
        ...(inTray ? styles.cardInTray : null),
        ...(active ? styles.cardActive : null),
      }}
      dir="rtl"
    >
      <button
        type="button"
        style={styles.cardImageWrap}
        onClick={onInspect}
        aria-label={`${USABILITY_D_HE.invInspect}: ${item.titleHe || ''}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.boxImage || item.thumbImage} alt="" style={styles.cardImage} />
        <span style={styles.cardDemoPill}>DEMO</span>
        {inTray ? (
          <span style={styles.cardInTrayBadge} title={TRAY_HE.inTray} aria-label={TRAY_HE.inTray}>
            <CheckIcon size={11} />
          </span>
        ) : null}
      </button>
      <div style={styles.cardBody}>
        <div style={styles.cardTopLine}>
          <span style={styles.inventoryNo}>{item.inventoryNo}</span>
          <span style={styles.price}>{currency(item.askingPriceUsd)}</span>
        </div>
        <h3 style={styles.cardTitle}>{item.titleHe}</h3>
        <p style={styles.cardSub}>{meta || '\u00A0'}</p>
        <div style={styles.pills}>
          <span style={styles.pill}>{getStatusLabelHe(item.status)}</span>
        </div>
        {/* Hover/focus-revealed action row — see .inv-card-actions rule in
            the scoped <style jsx> block in the default export below. */}
        <div className="inv-card-actions" style={styles.cardActions}>
          <button
            type="button"
            style={styles.iconBtn}
            onClick={onInspect}
            title={USABILITY_D_HE.invInspect}
            aria-label={USABILITY_D_HE.invInspect}
          >
            <EyeIcon />
          </button>
          <button
            type="button"
            style={{ ...styles.iconBtn, ...(inTray ? styles.iconBtnOn : null) }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleTray(item.id);
            }}
            title={inTray ? TRAY_HE.removeFromTray : TRAY_HE.addToTray}
            aria-label={inTray ? TRAY_HE.removeFromTray : TRAY_HE.addToTray}
            aria-pressed={inTray ? 'true' : 'false'}
          >
            {inTray ? <RemoveIcon /> : <TrayIcon />}
          </button>
          <button
            type="button"
            style={styles.iconBtn}
            onClick={onDesign}
            title={STUDIO_5D_HE.startDesign}
            aria-label={STUDIO_5D_HE.startDesign}
          >
            <DesignIcon size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function DemoInventoryWorkspace() {
  const router = useRouter();
  const isMobile = useIsMobile(880);
  const tray = useWorkTray();
  const [items, setItems] = React.useState([]);
  const [activeId, setActiveId] = React.useState(null);
  const [query, setQuery] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('all');
  // Patch D — additive chip filters (local filtering only, no store logic).
  const [sourceFilter, setSourceFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [status, setStatus] = React.useState('ready');

  React.useEffect(() => {
    const snapshot = getDemoInventorySnapshot();
    setItems(snapshot);
    setActiveId((snapshot[0] && snapshot[0].id) || null);
  }, []);

  // One Tray — REAL tray membership is the single source of truth for the
  // "in tray" state on this screen. Demo item ids are preserved verbatim by
  // toStudioTrayItem (tray item id === demo item id), so membership is a
  // direct id lookup.
  const trayIds = React.useMemo(
    () => new Set((tray.items || []).map((it) => it.id)),
    [tray.items]
  );

  // One Tray — one-time reconcile after both sources hydrate: the demo
  // selectedForTray flag becomes a mirror of real tray membership, using
  // ONLY the existing persist path (saveDemoInventorySnapshot). This keeps
  // read-only demo consumers (Dashboard Inventory Pulse, activity feed)
  // truthful without editing them, and clears the seed's pre-selected flags
  // that previously fed the studio's demo fallback. Skipped entirely when
  // nothing differs, so it never writes on every visit.
  const reconciledRef = React.useRef(false);
  React.useEffect(() => {
    if (reconciledRef.current || !tray.hydrated || items.length === 0) return;
    reconciledRef.current = true;
    const differs = items.some(
      (item) => Boolean(item.selectedForTray) !== trayIds.has(item.id)
    );
    if (!differs) return;
    const next = items.map((item) => ({
      ...item,
      selectedForTray: trayIds.has(item.id),
    }));
    setItems(next);
    saveDemoInventorySnapshot(cloneItems(next));
  }, [tray.hydrated, items, trayIds]);

  const activeItem = items.find((item) => item.id === activeId) || items[0] || null;

  const filtered = items.filter((item) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || [item.title, item.titleHe, item.inventoryNo, item.color, item.shape, item.stoneType]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(q);
    const matchesType = typeFilter === 'all' || item.stoneType === typeFilter;
    const matchesSource = sourceFilter === 'all' || item.sourceType === sourceFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesQuery && matchesType && matchesSource && matchesStatus;
  });

  const persist = React.useCallback((nextItems, message) => {
    const cloned = cloneItems(nextItems);
    setItems(cloned);
    saveDemoInventorySnapshot(cloned);
    if (message) {
      setStatus(message);
      window.setTimeout(() => setStatus('ready'), 1800);
    }
  }, []);

  const updateActive = React.useCallback((patch) => {
    if (!activeItem) return;
    const next = items.map((item) => (item.id === activeItem.id ? { ...item, ...patch } : item));
    persist(next, 'נשמר בדמו');
  }, [activeItem, items, persist]);

  // One Tray — add/remove acts on the REAL Work Tray using ONLY existing
  // exports: tray.addItem (addItemToTray) with the existing toStudioTrayItem
  // bridge, and tray.remove (removeFromTray) by id. The demo selectedForTray
  // flag is updated in the same action as a mirror of real membership (same
  // existing persist path as before); the visible in-tray state itself reads
  // from the real tray (trayIds), never from the flag. Status behavior is
  // preserved: adding marks the demo item 'selected'; removing leaves the
  // status untouched, exactly as before.
  const toggleTray = React.useCallback((id) => {
    const item = items.find((it) => it.id === id);
    if (!item) return;
    const adding = !trayIds.has(id);
    if (adding) {
      const trayItem = toStudioTrayItem(item);
      if (!trayItem) return;
      tray.addItem(trayItem);
    } else {
      tray.remove(id);
    }
    const next = items.map((it) => (
      it.id === id
        ? { ...it, selectedForTray: adding, status: adding ? 'selected' : it.status }
        : it
    ));
    persist(next, adding ? STUDIO_5D_HE.toastAddedToTray : STUDIO_5D_HE.toastRemovedFromTray);
  }, [items, trayIds, tray, persist]);

  const resetDemo = React.useCallback(() => {
    resetDemoInventorySnapshot();
    const snapshot = getDemoInventorySnapshot();
    // One Tray — the reset restores the seed's demo flags, so let the mount
    // reconcile run once more and mirror them back to REAL tray membership.
    reconciledRef.current = false;
    setItems(snapshot);
    setActiveId((snapshot[0] && snapshot[0].id) || null);
    setStatus('איפוס דמו הושלם');
    window.setTimeout(() => setStatus('ready'), 1800);
  }, []);

  const openInspect = (id) => {
    setActiveId(id);
    setDrawerOpen(true);
  };

  const goDesign = () => router.push('/studio/design');
  const goTray = () => router.push('/studio/tray');

  const advancedFiltersActive = sourceFilter !== 'all' || statusFilter !== 'all';

  return (
    <main style={{ ...styles.page, ...(isMobile ? styles.pageMobile : null) }} dir="rtl">
      {/* Compact header — title + counters + two actions. No paragraphs. */}
      <section style={styles.header}>
        <div style={styles.headerTitleWrap}>
          <h1 style={styles.title}>{USABILITY_D_HE.invTitle}</h1>
          <span style={styles.countPill}>{USABILITY_D_HE.invItemsCount(items.length)}</span>
          <button type="button" style={styles.trayCountPill} onClick={goTray} title={USABILITY_D_HE.invOpenTray}>
            <TrayIcon size={12} /> {tray.hydrated ? USABILITY_D_HE.invInTrayCount(tray.count) : '—'}
          </button>
        </div>
        <div style={styles.headerActions}>
          <button
            type="button"
            style={styles.iconHeaderBtn}
            onClick={resetDemo}
            title={USABILITY_D_HE.invResetDemo}
            aria-label={USABILITY_D_HE.invResetDemo}
          >
            <ResetIcon />
          </button>
          <button type="button" style={styles.primaryBtn} onClick={goDesign}>
            <DesignIcon /> {USABILITY_D_HE.invOpenStudio}
          </button>
        </div>
      </section>

      {/* Toolbar — prominent-but-compact search + chip filters. */}
      <section style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon} aria-hidden="true"><SearchIcon /></span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חפש אבן, צבע, מספר מלאי…"
            style={styles.searchInput}
            dir="rtl"
          />
        </div>
        <div style={styles.chipRow}>
          {TYPE_FILTERS.map((filter) => (
            <Chip
              key={filter.value}
              active={typeFilter === filter.value}
              onClick={() => setTypeFilter(filter.value)}
            >
              {filter.label}
            </Chip>
          ))}
          <Chip active={filtersOpen || advancedFiltersActive} onClick={() => setFiltersOpen((v) => !v)}>
            <FilterIcon /> {USABILITY_D_HE.invFilters}
          </Chip>
        </div>
        {filtersOpen && (
          <div style={styles.advancedFilters}>
            <div style={styles.chipGroup}>
              <span style={styles.chipGroupLabel}>{USABILITY_D_HE.invFilterSource}</span>
              <Chip active={sourceFilter === 'all'} onClick={() => setSourceFilter('all')}>
                {USABILITY_D_HE.invAll}
              </Chip>
              {SOURCE_OPTIONS.map((opt) => (
                <Chip key={opt.value} active={sourceFilter === opt.value} onClick={() => setSourceFilter(opt.value)}>
                  {opt.label}
                </Chip>
              ))}
            </div>
            <div style={styles.chipGroup}>
              <span style={styles.chipGroupLabel}>{USABILITY_D_HE.invFilterStatus}</span>
              <Chip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
                {USABILITY_D_HE.invAll}
              </Chip>
              {STATUS_OPTIONS.map((opt) => (
                <Chip key={opt.value} active={statusFilter === opt.value} onClick={() => setStatusFilter(opt.value)}>
                  {opt.label}
                </Chip>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Catalog grid — familiar product-grid behavior, image-first. */}
      <section style={styles.gridPanel}>
        {filtered.length === 0 ? (
          <div style={styles.gridEmpty}>{USABILITY_D_HE.invEmpty}</div>
        ) : (
          <div style={{ ...styles.grid, ...(isMobile ? styles.gridMobile : null) }}>
            {filtered.map((item) => (
              <CatalogCard
                key={item.id}
                item={item}
                active={activeItem && item.id === activeItem.id}
                inTray={trayIds.has(item.id)}
                onInspect={() => openInspect(item.id)}
                onToggleTray={toggleTray}
                onDesign={goDesign}
              />
            ))}
          </div>
        )}
      </section>

      {/* Clean 8K-R3 — persistent bottom selection bar (section 5): a
          quiet visual surfacing of the EXISTING Work Tray membership, not
          a new selection concept. "בחר אבן/אבנים" already happens via the
          existing tray-toggle action on each card; this bar just makes the
          resulting count and the one obvious next action visible without
          requiring a separate Work Tray navigation step. Primary action
          reuses the EXISTING goDesign() navigation, unchanged. */}
      {trayIds.size > 0 ? (
        <div style={styles.selectionBar} dir="rtl" role="status">
          <span style={styles.selectionText}>
            {trayIds.size === 1 ? INV_SELECTION_HE.oneSelected : INV_SELECTION_HE.manySelected(trayIds.size)}
          </span>
          <button type="button" style={styles.selectionPrimaryBtn} onClick={goDesign}>
            {trayIds.size === 1 ? INV_SELECTION_HE.createWithOne : INV_SELECTION_HE.createWithMany}
          </button>
        </div>
      ) : null}

      {/* Details / edit DRAWER — side panel on desktop, bottom sheet on
          mobile. Holds the existing edit fields (same updateActive wiring),
          never inflating the cards. */}
      {drawerOpen && activeItem && (
        <div style={styles.drawerOverlay} dir="rtl" role="dialog" aria-modal="true" aria-label={USABILITY_D_HE.invInspect}>
          <button type="button" style={styles.drawerBackdrop} onClick={() => setDrawerOpen(false)} aria-label={USABILITY_D_HE.invClose} />
          <div style={{ ...styles.drawer, ...(isMobile ? styles.drawerMobile : null) }}>
            <div style={styles.drawerHead}>
              <div style={styles.drawerHeadText}>
                <span style={styles.inventoryNo}>{activeItem.inventoryNo}</span>
                <h2 style={styles.drawerTitle}>{activeItem.titleHe}</h2>
              </div>
              <button
                type="button"
                style={styles.iconHeaderBtn}
                onClick={() => setDrawerOpen(false)}
                title={USABILITY_D_HE.invClose}
                aria-label={USABILITY_D_HE.invClose}
              >
                <CloseIcon />
              </button>
            </div>

            <div style={styles.drawerScroll}>
              <div style={styles.inspectImageWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activeItem.inspectImage || activeItem.boxImage} alt="" style={styles.inspectImage} />
              </div>

              <div style={styles.pillsWide}>
                <span style={styles.pill}>{getSourceLabelHe(activeItem.sourceType)}</span>
                {getSourceContextBadge(activeItem.sourceType) ? (
                  <span style={styles.pill}>{getSourceContextBadge(activeItem.sourceType)}</span>
                ) : null}
                <span style={styles.pill}>{getStatusLabelHe(activeItem.status)}</span>
                <span style={styles.pill}>DEMO</span>
              </div>

              <span style={styles.drawerSectionLabel}>{USABILITY_D_HE.invEdit}</span>
              <div style={styles.formGrid}>
                <Field label="שם תצוגה">
                  <input style={styles.input} value={activeItem.titleHe || ''} onChange={(e) => updateActive({ titleHe: e.target.value })} />
                </Field>
                <Field label="משקל קראט">
                  <input style={styles.input} type="number" step="0.01" value={activeItem.estimatedCarat} onChange={(e) => updateActive({ estimatedCarat: e.target.value })} />
                </Field>
                <Field label="צבע">
                  <input style={styles.input} value={activeItem.color || ''} onChange={(e) => updateActive({ color: e.target.value })} />
                </Field>
                <Field label="ניקיון / איכות">
                  <input style={styles.input} value={activeItem.clarity || ''} onChange={(e) => updateActive({ clarity: e.target.value })} />
                </Field>
                <Field label="טיפול">
                  <input style={styles.input} value={activeItem.treatment || ''} onChange={(e) => updateActive({ treatment: e.target.value })} />
                </Field>
                <Field label="מחיר דמו USD">
                  <input style={styles.input} type="number" step="100" value={activeItem.askingPriceUsd} onChange={(e) => updateActive({ askingPriceUsd: e.target.value })} />
                </Field>
                <Field label="מקור">
                  <select style={styles.input} value={activeItem.sourceType} onChange={(e) => updateActive({ sourceType: e.target.value })}>
                    {SOURCE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </Field>
                <Field label="סטטוס">
                  <select style={styles.input} value={activeItem.status} onChange={(e) => updateActive({ status: e.target.value })}>
                    {STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </Field>
              </div>
            </div>

            <div style={styles.drawerActions}>
              <button type="button" style={styles.primaryBtnFull} onClick={() => toggleTray(activeItem.id)}>
                {trayIds.has(activeItem.id) ? <RemoveIcon /> : <TrayIcon />}
                {trayIds.has(activeItem.id) ? TRAY_HE.removeFromTray : TRAY_HE.addToTray}
              </button>
              <button type="button" style={styles.secondaryBtnFull} onClick={goDesign}>
                <DesignIcon /> {STUDIO_5D_HE.startDesign}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile — sticky bottom action bar for the active item (thumb reach). */}
      {isMobile && !drawerOpen && activeItem && tray.hydrated && (
        <div style={styles.stickyBar}>
          <span style={styles.stickyTitle}>{activeItem.titleHe}</span>
          <button
            type="button"
            style={styles.stickySecondary}
            onClick={() => setDrawerOpen(true)}
          >
            {USABILITY_D_HE.invInspect}
          </button>
          <button
            type="button"
            style={{ ...styles.stickyPrimary, ...(trayIds.has(activeItem.id) ? styles.stickyPrimaryOn : null) }}
            onClick={() => toggleTray(activeItem.id)}
          >
            {trayIds.has(activeItem.id) ? <RemoveIcon /> : <TrayIcon />}
            {trayIds.has(activeItem.id) ? TRAY_HE.removeFromTray : TRAY_HE.addToTray}
          </button>
        </div>
      )}

      {/* Save/reset feedback — small toast instead of a permanent stats row. */}
      {status !== 'ready' && (
        <div style={styles.toast} role="status">{status}</div>
      )}

      {/* Clean 8K-R3 — hover/focus-reveal for the per-card action row
          (section 5). Real CSS via Next's built-in styled-jsx (already
          used elsewhere in this codebase, e.g. components/studio/shell/
          StudioShell.js's <style jsx global>) since inline style objects
          can't express :hover. The controls stay in the DOM and in the
          keyboard tab order at all times — only their VISUAL prominence
          changes — so :focus-within also reveals them, satisfying section
          8's "no important action available only on hover". */}
      <style jsx global>{`
        .inv-card-actions {
          opacity: 0;
          transition: opacity 150ms ease;
        }
        .inv-card:hover .inv-card-actions,
        .inv-card:focus-within .inv-card-actions {
          opacity: 1;
        }
        @media (hover: none) {
          .inv-card-actions {
            opacity: 1;
          }
        }
      `}</style>
    </main>
  );
}

const styles = {
  page: {
    height: '100%',
    overflowY: 'auto',
    padding: '16px',
    boxSizing: 'border-box',
    background: tokens.color.ivory,
    color: tokens.color.charcoal,
    fontFamily: tokens.font.body,
  },
  pageMobile: {
    padding: '12px',
    // Leave room so the sticky bottom bar never covers the last cards.
    paddingBottom: '112px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    maxWidth: '1480px',
    margin: '0 auto 12px',
  },
  headerTitleWrap: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', minWidth: 0 },
  title: { margin: 0, fontSize: '21px', lineHeight: 1.15, fontFamily: tokens.font.display, fontWeight: 700, color: tokens.color.charcoal },
  countPill: {
    display: 'inline-flex', alignItems: 'center', height: '26px', padding: '0 10px',
    borderRadius: tokens.radius.sm, background: tokens.color.pearl, color: tokens.color.inkSoft,
    fontSize: '11px', fontWeight: 700,
  },
  trayCountPill: {
    display: 'inline-flex', alignItems: 'center', gap: '6px', height: '26px', padding: '0 10px',
    borderRadius: tokens.radius.sm, background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`,
    color: tokens.color.charcoal, fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: tokens.font.body,
  },
  headerActions: { display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 },
  iconHeaderBtn: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px',
    border: `1px solid ${tokens.color.cardEdge}`, background: tokens.color.canvas, color: tokens.color.inkSoft,
    borderRadius: tokens.radius.sm, cursor: 'pointer', flexShrink: 0,
  },
  primaryBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '7px', border: 'none', background: tokens.color.charcoal,
    color: tokens.color.ivory, borderRadius: tokens.radius.md, padding: '9px 15px', fontWeight: 700, fontSize: '13px',
    cursor: 'pointer', minHeight: '38px', fontFamily: tokens.font.body,
  },

  toolbar: { maxWidth: '1480px', margin: '0 auto 12px', display: 'flex', flexDirection: 'column', gap: '8px' },
  searchWrap: { position: 'relative', display: 'flex', alignItems: 'center', maxWidth: '460px' },
  searchIcon: { position: 'absolute', insetInlineStart: '10px', color: tokens.color.inkFaint, display: 'inline-flex', pointerEvents: 'none' },
  searchInput: {
    width: '100%', boxSizing: 'border-box', borderRadius: tokens.radius.sm, border: `1px solid ${tokens.color.cardEdge}`,
    background: tokens.color.canvas, padding: '10px 32px 10px 12px', fontSize: '13px', outline: 'none',
    fontFamily: tokens.font.body, minHeight: '40px',
  },
  chipRow: { display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' },
  chip: {
    display: 'inline-flex', alignItems: 'center', gap: '5px', minHeight: '32px', padding: '6px 12px',
    borderRadius: '999px', border: `1px solid ${tokens.color.cardEdge}`, background: tokens.color.canvas,
    color: tokens.color.inkSoft, fontWeight: 600, fontSize: '12px', cursor: 'pointer', fontFamily: tokens.font.body,
    whiteSpace: 'nowrap',
  },
  chipActive: { background: tokens.color.charcoal, color: tokens.color.ivory, borderColor: tokens.color.charcoal },
  advancedFilters: {
    display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 12px',
    background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md,
  },
  chipGroup: { display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' },
  chipGroupLabel: { fontSize: '10.5px', fontWeight: 700, color: tokens.color.inkFaint, flexShrink: 0, minWidth: '38px' },

  gridPanel: { maxWidth: '1480px', margin: '0 auto', minWidth: 0 },
  gridEmpty: {
    padding: '48px 0', textAlign: 'center', color: tokens.color.inkFaint, fontWeight: 600, fontSize: '13px',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '10px' },
  gridMobile: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' },
  card: {
    background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.lg,
    overflow: 'hidden', boxShadow: tokens.shadow.soft, display: 'flex', flexDirection: 'column',
  },
  // "In tray" (REAL Work Tray membership) and "active/inspecting" are two
  // distinct, composable states shown through different visual channels:
  //   • in tray  → sage top accent bar + a small checkmark badge on the image
  //   • active   → a stronger charcoal border
  cardInTray: { borderTop: `3px solid ${tokens.color.sage}` },
  cardActive: { border: `1.5px solid ${tokens.color.charcoal}`, boxShadow: tokens.shadow.lift },
  // Square, contain image frame — the full gemstone always visible, never
  // cropped. The image itself is the "inspect" tap target.
  cardImageWrap: {
    position: 'relative', aspectRatio: '1 / 1', background: tokens.color.pearl, overflow: 'hidden',
    border: 'none', padding: 0, cursor: 'pointer', display: 'block', width: '100%',
  },
  cardImage: { width: '100%', height: '100%', objectFit: 'contain', display: 'block' },
  cardDemoPill: {
    position: 'absolute', top: '7px', insetInlineEnd: '7px', background: 'rgba(255,255,255,0.9)',
    border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.xs || tokens.radius.sm,
    padding: '2px 6px', fontSize: '8px', fontWeight: 700, letterSpacing: '0.08em',
  },
  cardInTrayBadge: {
    position: 'absolute', bottom: '7px', insetInlineEnd: '7px',
    width: '21px', height: '21px', borderRadius: '50%',
    background: tokens.color.sage, color: tokens.color.ivory,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: tokens.shadow.soft,
  },
  cardBody: { padding: '9px 10px 10px', display: 'flex', flexDirection: 'column', gap: '5px' },
  cardTopLine: { display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center' },
  inventoryNo: { fontSize: '10px', color: tokens.color.gold, fontWeight: 700, letterSpacing: '0.04em' },
  price: { fontSize: '11px', color: tokens.color.charcoal, fontWeight: 700 },
  cardTitle: {
    margin: 0, fontSize: '13.5px', color: tokens.color.charcoal, fontFamily: tokens.font.display, fontWeight: 700,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  cardSub: {
    margin: 0, fontSize: '11px', color: tokens.color.inkSoft,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  pills: { display: 'flex', flexWrap: 'wrap', gap: '4px' },
  pillsWide: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  pill: {
    background: tokens.color.pearl, borderRadius: tokens.radius.xs || tokens.radius.sm, padding: '3px 7px',
    fontSize: '9.5px', color: tokens.color.inkSoft, fontWeight: 600,
  },
  cardActions: { display: 'flex', gap: '6px', marginTop: '3px' },
  iconBtn: {
    flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: '34px',
    border: `1px solid ${tokens.color.cardEdge}`, background: tokens.color.ivory, color: tokens.color.charcoal,
    borderRadius: tokens.radius.sm, cursor: 'pointer',
  },
  iconBtnOn: { background: tokens.color.sage, color: tokens.color.ivory, borderColor: tokens.color.sage },

  // Clean 8K-R3 — persistent bottom selection bar (section 5).
  selectionBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '12px 16px',
    marginTop: '4px',
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    boxShadow: tokens.shadow.lift,
  },
  selectionText: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  selectionPrimaryBtn: {
    minHeight: '38px',
    padding: '9px 20px',
    borderRadius: '999px',
    border: 'none',
    background: tokens.color.charcoal,
    color: tokens.color.ivory,
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },

  // Drawer — desktop side panel / mobile bottom sheet.
  drawerOverlay: { position: 'fixed', inset: 0, zIndex: 55, display: 'flex', justifyContent: 'flex-start' },
  drawerBackdrop: {
    position: 'absolute', inset: 0, background: 'rgba(43,40,36,0.42)', border: 'none', cursor: 'pointer',
    padding: 0, margin: 0,
  },
  drawer: {
    position: 'relative', width: 'min(400px, 92vw)', height: '100%', display: 'flex', flexDirection: 'column',
    background: tokens.color.canvas, borderInlineEnd: `1px solid ${tokens.color.cardEdge}`,
    boxShadow: tokens.shadow.lift, boxSizing: 'border-box', overflow: 'hidden',
  },
  drawerMobile: {
    width: '100%', height: 'auto', maxHeight: '86vh', marginTop: 'auto',
    borderInlineEnd: 'none', borderTop: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: `${tokens.radius.lg} ${tokens.radius.lg} 0 0`,
  },
  drawerHead: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px',
    padding: '14px 16px 10px', flexShrink: 0,
  },
  drawerHeadText: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  drawerTitle: {
    margin: 0, fontSize: '17px', color: tokens.color.charcoal, fontFamily: tokens.font.display, fontWeight: 700,
    lineHeight: 1.25,
  },
  drawerScroll: {
    flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px',
    padding: '0 16px 12px',
  },
  drawerSectionLabel: { fontSize: '10.5px', fontWeight: 700, color: tokens.color.inkFaint, letterSpacing: '0.06em' },
  inspectImageWrap: {
    position: 'relative', borderRadius: tokens.radius.md, overflow: 'hidden', background: tokens.color.pearl,
    aspectRatio: '1 / 1', border: `1px solid ${tokens.color.cardEdge}`, flexShrink: 0,
  },
  inspectImage: { width: '100%', height: '100%', objectFit: 'contain', display: 'block' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0 },
  fieldLabel: { fontSize: '10.5px', fontWeight: 700, color: tokens.color.inkFaint },
  input: {
    minHeight: '36px', borderRadius: tokens.radius.sm, border: `1px solid ${tokens.color.cardEdge}`,
    background: tokens.color.ivory, padding: '8px 10px', fontSize: '12px', outline: 'none', boxSizing: 'border-box',
    width: '100%', fontFamily: tokens.font.body, color: tokens.color.charcoal,
  },
  drawerActions: {
    display: 'grid', gridTemplateColumns: '1fr', gap: '8px', flexShrink: 0,
    padding: '10px 16px calc(12px + env(safe-area-inset-bottom, 0px))',
    borderTop: `1px solid ${tokens.color.cardEdge}`,
  },
  primaryBtnFull: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px', minHeight: '44px',
    border: 'none', borderRadius: tokens.radius.sm, background: tokens.color.charcoal, color: tokens.color.ivory,
    fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: tokens.font.body,
  },
  secondaryBtnFull: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px', minHeight: '44px',
    border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.sm, background: tokens.color.ivory,
    color: tokens.color.charcoal, fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: tokens.font.body,
  },

  // Mobile sticky action bar.
  stickyBar: {
    position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 25,
    display: 'flex', alignItems: 'center', gap: '8px',
    background: tokens.color.ivory, borderTop: `1px solid ${tokens.color.cardEdge}`,
    boxShadow: '0 -8px 24px rgba(43,40,36,0.06)',
    padding: '10px 12px calc(10px + env(safe-area-inset-bottom, 0px))',
  },
  stickyTitle: {
    flex: 1, minWidth: 0, fontSize: '12px', fontWeight: 700, color: tokens.color.charcoal,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  stickySecondary: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: '44px', padding: '10px 14px',
    fontSize: '13px', fontWeight: 700, color: tokens.color.charcoal, background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md, cursor: 'pointer',
    fontFamily: tokens.font.body, whiteSpace: 'nowrap', flexShrink: 0,
  },
  stickyPrimary: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px', minHeight: '44px',
    padding: '10px 16px', fontSize: '13px', fontWeight: 700, color: tokens.color.ivory,
    background: tokens.color.charcoal, border: 'none', borderRadius: tokens.radius.md, cursor: 'pointer',
    fontFamily: tokens.font.body, whiteSpace: 'nowrap', flexShrink: 0,
  },
  stickyPrimaryOn: { background: tokens.color.sage },

  toast: {
    position: 'fixed', left: '50%', bottom: '86px', transform: 'translateX(-50%)',
    fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 600,
    color: tokens.color.ivory, background: tokens.color.charcoal,
    padding: '9px 18px', borderRadius: tokens.radius.md, zIndex: 70, pointerEvents: 'none',
  },
};
