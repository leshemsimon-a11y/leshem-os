// components/studio/demo/DemoInventoryWorkspace.js
// LESHEM.S OS — clean temporary Demo Inventory screen.
// Self-contained page-level component. No Airtable writes, no schema changes.
//
// Global Visual Upgrade V1 (Clean 5E-Global): visual/layout pass only. All
// state, handlers, and data flow below are UNCHANGED from the previous
// version — persist/updateActive/toggleTray/resetDemo, the filtering logic,
// and every import from lib/studio/demoInventoryLayer.js are identical. What
// changed:
//   • Now uses the shared components/studio/shared/tokens.js palette instead
//     of its own hardcoded hex literals, so it matches the rest of the app
//     and the Design Studio Layout Reset direction (near-white/graphite,
//     less gold, tighter radius).
//   • Stone images: square contain frames (was a 1/0.78 cropped "cover"
//     rectangle) — the full gemstone is now always visible, never cropped.
//   • Tray actions get a small inline icon alongside their existing label
//     (icons for actions, per the visual upgrade brief) — same onClick,
//     same behavior.

import * as React from 'react';
import { useRouter } from 'next/router';
import { tokens } from '../shared/tokens';
import { TRAY_HE } from '../../../lib/studio/labels';
import {
  getDemoInventorySnapshot,
  saveDemoInventorySnapshot,
  resetDemoInventorySnapshot,
  getDemoActivityFeed,
  getSourceLabelHe,
  getSourceContextBadge,
  getStatusLabelHe,
} from '../../../lib/studio/demoInventoryLayer';

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

function Field({ label, children }) {
  return (
    <label style={styles.field}>
      <span style={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value }) {
  return (
    <div style={styles.stat}>
      <span style={styles.statValue}>{value}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
}

function StoneCard({ item, active, onClick, onToggleTray }) {
  const inTray = Boolean(item.selectedForTray);
  return (
    <article
      style={{
        ...styles.card,
        ...(inTray ? styles.cardInTray : null),
        ...(active ? styles.cardActive : null),
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      dir="rtl"
    >
      <div style={styles.cardImageWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.boxImage || item.thumbImage} alt="" style={styles.cardImage} />
        <span style={styles.cardDemoPill}>DEMO</span>
        {inTray ? (
          <span style={styles.cardInTrayBadge} title={TRAY_HE.inTray} aria-label={TRAY_HE.inTray}>
            <CheckIcon size={11} />
          </span>
        ) : null}
      </div>
      <div style={styles.cardBody}>
        <div style={styles.cardTopLine}>
          <span style={styles.inventoryNo}>{item.inventoryNo}</span>
          <span style={styles.price}>{currency(item.askingPriceUsd)}</span>
        </div>
        <h3 style={styles.cardTitle}>{item.titleHe}</h3>
        <p style={styles.cardSub}>{item.estimatedCarat}ct · {item.color}</p>
        <div style={styles.pills}>
          <span style={styles.pill}>{getSourceLabelHe(item.sourceType)}</span>
          {getSourceContextBadge(item.sourceType) ? (
            <span style={styles.pill}>{getSourceContextBadge(item.sourceType)}</span>
          ) : null}
          <span style={styles.pill}>{getStatusLabelHe(item.status)}</span>
        </div>
        <button
          type="button"
          style={{ ...styles.trayBtn, ...(inTray ? styles.trayBtnOn : null) }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleTray(item.id);
          }}
        >
          {inTray ? <RemoveIcon /> : <TrayIcon />}
          {inTray ? TRAY_HE.removeFromTray : TRAY_HE.addToTray}
        </button>
      </div>
    </article>
  );
}

export default function DemoInventoryWorkspace() {
  const router = useRouter();
  const [items, setItems] = React.useState([]);
  const [activeId, setActiveId] = React.useState(null);
  const [query, setQuery] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [status, setStatus] = React.useState('ready');

  React.useEffect(() => {
    const snapshot = getDemoInventorySnapshot();
    setItems(snapshot);
    setActiveId((snapshot[0] && snapshot[0].id) || null);
  }, []);

  const activity = React.useMemo(() => getDemoActivityFeed(), [items.length]);
  const activeItem = items.find((item) => item.id === activeId) || items[0] || null;
  const selectedCount = items.filter((item) => item.selectedForTray).length;
  const totalValue = items.reduce((sum, item) => sum + (Number(item.askingPriceUsd) || 0), 0);

  const filtered = items.filter((item) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || [item.title, item.titleHe, item.inventoryNo, item.color, item.shape, item.stoneType]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(q);
    const matchesType = typeFilter === 'all' || item.stoneType === typeFilter;
    return matchesQuery && matchesType;
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

  const toggleTray = React.useCallback((id) => {
    const next = items.map((item) => (
      item.id === id ? { ...item, selectedForTray: !item.selectedForTray, status: !item.selectedForTray ? 'selected' : item.status } : item
    ));
    persist(next, 'מגש העבודה עודכן (דמו)');
  }, [items, persist]);

  const resetDemo = React.useCallback(() => {
    resetDemoInventorySnapshot();
    const snapshot = getDemoInventorySnapshot();
    setItems(snapshot);
    setActiveId((snapshot[0] && snapshot[0].id) || null);
    setStatus('איפוס דמו הושלם');
    window.setTimeout(() => setStatus('ready'), 1800);
  }, []);

  return (
    <main style={styles.page} dir="rtl">
      <section style={styles.header}>
        <div>
          <span style={styles.kicker}>LESHEM.S OS · Demo Inventory</span>
          <h1 style={styles.title}>מלאי אבנים — שכבת דמו פעילה</h1>
          <p style={styles.subtitle}>
            מסך לבחירה ובדיקה של אבני דמו. שינויים נשמרים בדפדפן בלבד.
          </p>
        </div>
        <div style={styles.headerActions}>
          <button type="button" style={styles.secondaryBtn} onClick={resetDemo}>
            <ResetIcon /> אפס דמו
          </button>
          <button type="button" style={styles.primaryBtn} onClick={() => router.push('/studio/design')}>
            <DesignIcon /> פתח Design Studio
          </button>
        </div>
      </section>

      <section style={styles.statsRow}>
        <Stat label="אבנים במלאי דמו" value={items.length || '—'} />
        <Stat label="במגש העבודה" value={selectedCount} />
        <Stat label="שווי דמו מוצג" value={currency(totalValue)} />
        <Stat label="סטטוס" value={status === 'ready' ? 'מוכן' : status} />
      </section>

      <section style={styles.activityRow}>
        {activity.slice(0, 4).map((entry) => (
          <div key={entry.id} style={styles.activityItem}>
            <span style={styles.activityDot} />
            <span>{entry.textHe}</span>
          </div>
        ))}
      </section>

      <section style={styles.workspace}>
        <aside style={styles.leftPanel}>
          <div style={styles.panelHead}>
            <span style={styles.panelTitle}>סינון מהיר</span>
            <span style={styles.softBadge}>Temporary</span>
          </div>
          <div style={styles.searchWrap}>
            <span style={styles.searchIcon} aria-hidden="true"><SearchIcon /></span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חפש אבן, צבע, מספר מלאי…"
              style={styles.searchInput}
            />
          </div>
          <div style={styles.filterList}>
            {TYPE_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setTypeFilter(filter.value)}
                style={{ ...styles.filterBtn, ...(typeFilter === filter.value ? styles.filterBtnActive : null) }}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div style={styles.noteBox}>
            <strong>מה זה עושה?</strong>
            <span>בחירה כאן משפיעה על מגש הדמו ב־Design Studio אם אין אבנים אמיתיות במגש.</span>
          </div>
        </aside>

        <section style={styles.gridPanel}>
          <div style={styles.gridHead}>
            <span style={styles.gridTitle}>אבני מלאי</span>
            <span style={styles.gridCount}>{filtered.length} פריטים</span>
          </div>
          <div style={styles.grid}>
            {filtered.map((item) => (
              <StoneCard
                key={item.id}
                item={item}
                active={activeItem && item.id === activeItem.id}
                onClick={() => setActiveId(item.id)}
                onToggleTray={toggleTray}
              />
            ))}
          </div>
        </section>

        <aside style={styles.inspector}>
          {activeItem ? (
            <>
              <div style={styles.inspectImageWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activeItem.inspectImage || activeItem.boxImage} alt="" style={styles.inspectImage} />
                <span style={styles.inspectPill}>INSPECT VIEW</span>
              </div>

              <div style={styles.inspectHead}>
                <span style={styles.inventoryNo}>{activeItem.inventoryNo}</span>
                <h2 style={styles.inspectTitle}>{activeItem.titleHe}</h2>
                <p style={styles.inspectSub}>{activeItem.title} · {activeItem.shape}</p>
              </div>

              <div style={styles.pillsWide}>
                <span style={styles.pill}>{getSourceLabelHe(activeItem.sourceType)}</span>
                {getSourceContextBadge(activeItem.sourceType) ? (
                  <span style={styles.pill}>{getSourceContextBadge(activeItem.sourceType)}</span>
                ) : null}
                <span style={styles.pill}>{getStatusLabelHe(activeItem.status)}</span>
                <span style={styles.pill}>Demo Asset</span>
              </div>

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

              <div style={styles.inspectActions}>
                <button type="button" style={styles.primaryBtnFull} onClick={() => toggleTray(activeItem.id)}>
                  {activeItem.selectedForTray ? <RemoveIcon /> : <TrayIcon />}
                  {activeItem.selectedForTray ? TRAY_HE.removeFromTray : TRAY_HE.addToTray}
                </button>
                <button type="button" style={styles.secondaryBtnFull} onClick={() => router.push('/studio/design')}>
                  <DesignIcon /> עבור לעיצוב עם האבנים
                </button>
              </div>
            </>
          ) : (
            <div style={styles.emptyInspector}>בחר אבן כדי לערוך אותה.</div>
          )}
        </aside>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    padding: '16px',
    boxSizing: 'border-box',
    background: tokens.color.ivory,
    color: tokens.color.charcoal,
    fontFamily: tokens.font.body,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '20px',
    maxWidth: '1480px',
    margin: '0 auto 14px',
  },
  kicker: { fontSize: '10px', letterSpacing: '0.14em', fontWeight: 700, color: tokens.color.gold },
  title: { margin: '4px 0 4px', fontSize: '24px', lineHeight: 1.15, fontFamily: tokens.font.display, fontWeight: 700, color: tokens.color.charcoal },
  subtitle: { margin: 0, color: tokens.color.inkSoft, maxWidth: '640px', lineHeight: 1.5, fontSize: '13px' },
  headerActions: { display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 },
  primaryBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '7px', border: 'none', background: tokens.color.charcoal,
    color: tokens.color.ivory, borderRadius: tokens.radius.md, padding: '10px 16px', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
  },
  secondaryBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '7px', border: `1px solid ${tokens.color.cardEdge}`, background: tokens.color.canvas,
    color: tokens.color.charcoal, borderRadius: tokens.radius.md, padding: '10px 16px', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
  },
  statsRow: { maxWidth: '1480px', margin: '0 auto 10px', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '10px' },
  stat: { background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md, padding: '11px 14px', boxShadow: tokens.shadow.soft },
  statValue: { display: 'block', fontSize: '17px', fontWeight: 700, color: tokens.color.charcoal },
  statLabel: { display: 'block', marginTop: '2px', fontSize: '10.5px', color: tokens.color.inkFaint, fontWeight: 600 },
  activityRow: { maxWidth: '1480px', margin: '0 auto 10px', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '10px' },
  activityItem: { display: 'flex', alignItems: 'center', gap: '8px', background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.sm, padding: '9px 11px', fontSize: '11.5px', fontWeight: 600, color: tokens.color.inkSoft },
  activityDot: { width: '6px', height: '6px', borderRadius: '50%', background: tokens.color.gold, flexShrink: 0 },
  workspace: { maxWidth: '1480px', margin: '0 auto', display: 'grid', gridTemplateColumns: '220px minmax(0, 1fr) 340px', gap: '12px', alignItems: 'start' },
  leftPanel: { background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.lg, padding: '14px', position: 'sticky', top: '14px' },
  panelHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' },
  panelTitle: { fontSize: '13px', fontWeight: 700, color: tokens.color.charcoal },
  softBadge: { fontSize: '9.5px', fontWeight: 700, borderRadius: tokens.radius.xs || tokens.radius.sm, padding: '3px 7px', background: tokens.color.goldFaint, color: tokens.color.inkSoft },
  searchWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', insetInlineStart: '10px', color: tokens.color.inkFaint, display: 'inline-flex', pointerEvents: 'none' },
  searchInput: { width: '100%', boxSizing: 'border-box', borderRadius: tokens.radius.sm, border: `1px solid ${tokens.color.cardEdge}`, background: tokens.color.ivory, padding: '10px 12px 10px 32px', fontSize: '12.5px', outline: 'none', fontFamily: tokens.font.body },
  filterList: { display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' },
  filterBtn: { minHeight: '36px', borderRadius: tokens.radius.sm, border: `1px solid ${tokens.color.cardEdge}`, background: tokens.color.ivory, color: tokens.color.inkSoft, fontWeight: 600, fontSize: '13px', cursor: 'pointer', textAlign: 'right', padding: '8px 12px', fontFamily: tokens.font.body },
  filterBtnActive: { background: tokens.color.charcoal, color: tokens.color.ivory, borderColor: tokens.color.charcoal },
  noteBox: { marginTop: '14px', padding: '11px', borderRadius: tokens.radius.sm, background: tokens.color.pearl, color: tokens.color.inkSoft, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11.5px', lineHeight: 1.5 },
  gridPanel: { minWidth: 0 },
  gridHead: { height: '38px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2px' },
  gridTitle: { fontSize: '14px', fontWeight: 700, color: tokens.color.charcoal, fontFamily: tokens.font.display },
  gridCount: { fontSize: '11.5px', color: tokens.color.inkFaint, fontWeight: 600 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' },
  card: { background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.lg, overflow: 'hidden', cursor: 'pointer', boxShadow: tokens.shadow.soft },
  // "In tray" (selectedForTray) and "active/inspecting" are two distinct,
  // composable states shown through different visual channels so they never
  // compete or get lost when both apply to the same card at once:
  //   • in tray  → sage top accent bar + a small checkmark badge on the image
  //   • active   → a stronger charcoal border (unchanged from before)
  cardInTray: { borderTop: `3px solid ${tokens.color.sage}` },
  cardActive: { border: `1.5px solid ${tokens.color.charcoal}`, boxShadow: tokens.shadow.lift },
  // Global Visual Upgrade V1 — square, contain image frame (was a 1/0.78
  // cropped "cover" rectangle). Full gemstone always visible, never cropped.
  cardImageWrap: { position: 'relative', aspectRatio: '1 / 1', background: tokens.color.pearl, overflow: 'hidden' },
  cardImage: { width: '100%', height: '100%', objectFit: 'contain', display: 'block' },
  cardDemoPill: { position: 'absolute', top: '8px', insetInlineEnd: '8px', background: 'rgba(255,255,255,0.9)', border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.xs || tokens.radius.sm, padding: '3px 7px', fontSize: '8.5px', fontWeight: 700, letterSpacing: '0.08em' },
  cardInTrayBadge: {
    position: 'absolute', bottom: '8px', insetInlineEnd: '8px',
    width: '22px', height: '22px', borderRadius: '50%',
    background: tokens.color.sage, color: tokens.color.ivory,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: tokens.shadow.soft,
  },
  cardBody: { padding: '11px', display: 'flex', flexDirection: 'column', gap: '6px' },
  cardTopLine: { display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center' },
  inventoryNo: { fontSize: '10.5px', color: tokens.color.gold, fontWeight: 700, letterSpacing: '0.04em' },
  price: { fontSize: '11.5px', color: tokens.color.charcoal, fontWeight: 700 },
  cardTitle: { margin: 0, fontSize: '15px', color: tokens.color.charcoal, fontFamily: tokens.font.display, fontWeight: 700 },
  cardSub: { margin: 0, fontSize: '11.5px', color: tokens.color.inkSoft },
  pills: { display: 'flex', flexWrap: 'wrap', gap: '5px' },
  pillsWide: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  pill: { background: tokens.color.pearl, borderRadius: tokens.radius.xs || tokens.radius.sm, padding: '4px 8px', fontSize: '10px', color: tokens.color.inkSoft, fontWeight: 600 },
  trayBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '4px', border: `1px solid ${tokens.color.cardEdge}`, background: tokens.color.ivory, color: tokens.color.charcoal, borderRadius: tokens.radius.sm, minHeight: '34px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' },
  trayBtnOn: { background: tokens.color.sage, color: tokens.color.ivory, borderColor: tokens.color.sage },
  inspector: { background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.lg, padding: '14px', position: 'sticky', top: '14px', boxShadow: tokens.shadow.soft },
  // Global Visual Upgrade V1 — square, contain (same reasoning as cardImage).
  inspectImageWrap: { position: 'relative', borderRadius: tokens.radius.md, overflow: 'hidden', background: tokens.color.pearl, aspectRatio: '1 / 1', border: `1px solid ${tokens.color.cardEdge}` },
  inspectImage: { width: '100%', height: '100%', objectFit: 'contain', display: 'block' },
  inspectPill: { position: 'absolute', top: '9px', insetInlineEnd: '9px', background: 'rgba(255,255,255,0.9)', border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.xs || tokens.radius.sm, padding: '4px 8px', fontSize: '8.5px', fontWeight: 700, letterSpacing: '0.08em' },
  inspectHead: { marginTop: '12px' },
  inspectTitle: { margin: '4px 0 2px', fontSize: '19px', color: tokens.color.charcoal, fontFamily: tokens.font.display, fontWeight: 700 },
  inspectSub: { margin: 0, color: tokens.color.inkSoft, fontSize: '12.5px' },
  formGrid: { marginTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0 },
  fieldLabel: { fontSize: '10.5px', fontWeight: 700, color: tokens.color.inkFaint },
  input: { minHeight: '36px', borderRadius: tokens.radius.sm, border: `1px solid ${tokens.color.cardEdge}`, background: tokens.color.ivory, padding: '8px 10px', fontSize: '12px', outline: 'none', boxSizing: 'border-box', width: '100%', fontFamily: tokens.font.body, color: tokens.color.charcoal },
  inspectActions: { display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginTop: '14px' },
  primaryBtnFull: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px', minHeight: '42px', border: 'none', borderRadius: tokens.radius.sm, background: tokens.color.charcoal, color: tokens.color.ivory, fontWeight: 700, fontSize: '13px', cursor: 'pointer' },
  secondaryBtnFull: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px', minHeight: '42px', border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.sm, background: tokens.color.ivory, color: tokens.color.charcoal, fontWeight: 700, fontSize: '13px', cursor: 'pointer' },
  emptyInspector: { minHeight: '280px', display: 'grid', placeItems: 'center', color: tokens.color.inkFaint, fontWeight: 600, fontSize: '13px' },
};
