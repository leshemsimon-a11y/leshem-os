// components/studio/demo/DemoInventoryWorkspace.js
// LESHEM.S OS — clean temporary Demo Inventory screen.
// Self-contained page-level component. No Airtable writes, no schema changes.

import * as React from 'react';
import { useRouter } from 'next/router';
import {
  getDemoInventorySnapshot,
  saveDemoInventorySnapshot,
  resetDemoInventorySnapshot,
  getDemoActivityFeed,
  getSourceLabelHe,
  getStatusLabelHe,
} from '../../../lib/studio/demoInventoryLayer';

const SOURCE_OPTIONS = [
  { value: 'owned', label: 'מלאי שלנו' },
  { value: 'supplier', label: 'ספק / וירטואלי' },
  { value: 'client-owned', label: 'אבן לקוח' },
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
  { value: 'Paraiba Tourmaline', label: 'פראיבה' },
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
  return (
    <article
      style={{ ...styles.card, ...(active ? styles.cardActive : null) }}
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
        {item.selectedForTray ? <span style={styles.cardSelectedPill}>במגש</span> : null}
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
          <span style={styles.pill}>{getStatusLabelHe(item.status)}</span>
        </div>
        <button
          type="button"
          style={{ ...styles.trayBtn, ...(item.selectedForTray ? styles.trayBtnOn : null) }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleTray(item.id);
          }}
        >
          {item.selectedForTray ? 'הסר מ־Work Tray' : 'שלח ל־Work Tray'}
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
    persist(next, 'עודכן Work Tray דמו');
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
            מסך נקי לבחירה, בדיקה וקסטום של אבני הדמו. כל שינוי נשמר רק בדפדפן ולא נוגע במלאי האמיתי.
          </p>
        </div>
        <div style={styles.headerActions}>
          <button type="button" style={styles.secondaryBtn} onClick={resetDemo}>אפס דמו</button>
          <button type="button" style={styles.primaryBtn} onClick={() => router.push('/studio/design')}>פתח Design Studio</button>
        </div>
      </section>

      <section style={styles.statsRow}>
        <Stat label="אבנים במלאי דמו" value={items.length || '—'} />
        <Stat label="ב־Work Tray" value={selectedCount} />
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
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חפש אבן, צבע, מספר מלאי…"
            style={styles.searchInput}
          />
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
                  {activeItem.selectedForTray ? 'הסר מ־Work Tray' : 'שלח ל־Work Tray'}
                </button>
                <button type="button" style={styles.secondaryBtnFull} onClick={() => router.push('/studio/design')}>
                  עבור לעיצוב עם האבנים
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
    padding: '18px',
    boxSizing: 'border-box',
    background: '#f6f1e8',
    color: '#24211d',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '20px',
    maxWidth: '1480px',
    margin: '0 auto 14px',
  },
  kicker: { fontSize: '11px', letterSpacing: '0.18em', fontWeight: 900, color: '#9f7e43' },
  title: { margin: '4px 0 4px', fontSize: '30px', lineHeight: 1.1, letterSpacing: '-0.04em' },
  subtitle: { margin: 0, color: '#6f6a61', maxWidth: '760px', lineHeight: 1.5, fontSize: '14px' },
  headerActions: { display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 },
  primaryBtn: { border: 'none', background: '#27231f', color: '#fff9ef', borderRadius: '14px', padding: '12px 18px', fontWeight: 800, cursor: 'pointer' },
  secondaryBtn: { border: '1px solid rgba(39,35,31,0.16)', background: '#fffaf2', color: '#27231f', borderRadius: '14px', padding: '12px 18px', fontWeight: 800, cursor: 'pointer' },
  statsRow: { maxWidth: '1480px', margin: '0 auto 12px', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '10px' },
  stat: { background: '#fffaf2', border: '1px solid rgba(161,130,74,0.22)', borderRadius: '18px', padding: '12px 16px', boxShadow: '0 10px 24px rgba(39,35,31,0.04)' },
  statValue: { display: 'block', fontSize: '18px', fontWeight: 900, color: '#27231f' },
  statLabel: { display: 'block', marginTop: '2px', fontSize: '11px', color: '#877c6b', fontWeight: 800 },
  activityRow: { maxWidth: '1480px', margin: '0 auto 12px', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '10px' },
  activityItem: { display: 'flex', alignItems: 'center', gap: '8px', background: '#fffdf8', border: '1px solid rgba(39,35,31,0.08)', borderRadius: '16px', padding: '10px 12px', fontSize: '12px', fontWeight: 800, color: '#514a41' },
  activityDot: { width: '8px', height: '8px', borderRadius: '99px', background: '#b99658', flexShrink: 0 },
  workspace: { maxWidth: '1480px', margin: '0 auto', display: 'grid', gridTemplateColumns: '230px minmax(0, 1fr) 360px', gap: '12px', alignItems: 'start' },
  leftPanel: { background: '#fffaf2', border: '1px solid rgba(39,35,31,0.09)', borderRadius: '22px', padding: '14px', position: 'sticky', top: '14px' },
  panelHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' },
  panelTitle: { fontSize: '14px', fontWeight: 900 },
  softBadge: { fontSize: '10px', fontWeight: 900, borderRadius: '999px', padding: '5px 8px', background: '#efe5d2', color: '#85683b' },
  searchInput: { width: '100%', boxSizing: 'border-box', borderRadius: '14px', border: '1px solid rgba(39,35,31,0.12)', background: '#fffdf8', padding: '12px 12px', fontSize: '13px', outline: 'none' },
  filterList: { display: 'flex', flexDirection: 'column', gap: '7px', marginTop: '12px' },
  filterBtn: { minHeight: '38px', borderRadius: '14px', border: '1px solid rgba(39,35,31,0.1)', background: '#fffdf8', color: '#514a41', fontWeight: 800, cursor: 'pointer', textAlign: 'right', padding: '8px 12px' },
  filterBtnActive: { background: '#27231f', color: '#fff9ef' },
  noteBox: { marginTop: '14px', padding: '12px', borderRadius: '16px', background: '#efe5d2', color: '#6e5d42', display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', lineHeight: 1.45 },
  gridPanel: { minWidth: 0 },
  gridHead: { height: '42px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' },
  gridTitle: { fontSize: '16px', fontWeight: 900 },
  gridCount: { fontSize: '12px', color: '#7b7162', fontWeight: 800 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '12px' },
  card: { background: '#fffdf8', border: '1px solid rgba(39,35,31,0.08)', borderRadius: '22px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 12px 28px rgba(39,35,31,0.06)' },
  cardActive: { outline: '2px solid #b99658', boxShadow: '0 16px 34px rgba(185,150,88,0.22)' },
  cardImageWrap: { position: 'relative', aspectRatio: '1 / 0.78', background: '#fff', overflow: 'hidden' },
  cardImage: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  cardDemoPill: { position: 'absolute', top: '9px', right: '9px', background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(39,35,31,0.12)', borderRadius: '999px', padding: '4px 8px', fontSize: '9px', fontWeight: 900, letterSpacing: '0.12em' },
  cardSelectedPill: { position: 'absolute', bottom: '9px', right: '9px', background: '#27231f', color: '#fff9ef', borderRadius: '999px', padding: '5px 9px', fontSize: '10px', fontWeight: 900 },
  cardBody: { padding: '12px', display: 'flex', flexDirection: 'column', gap: '7px' },
  cardTopLine: { display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center' },
  inventoryNo: { fontSize: '11px', color: '#9f7e43', fontWeight: 900, letterSpacing: '0.08em' },
  price: { fontSize: '12px', color: '#27231f', fontWeight: 900 },
  cardTitle: { margin: 0, fontSize: '16px', letterSpacing: '-0.02em' },
  cardSub: { margin: 0, fontSize: '12px', color: '#746b5e' },
  pills: { display: 'flex', flexWrap: 'wrap', gap: '5px' },
  pillsWide: { display: 'flex', flexWrap: 'wrap', gap: '7px' },
  pill: { background: '#f1eadc', borderRadius: '999px', padding: '5px 8px', fontSize: '10px', color: '#5d5348', fontWeight: 900 },
  trayBtn: { marginTop: '4px', border: '1px solid rgba(39,35,31,0.13)', background: '#fffaf2', borderRadius: '13px', minHeight: '34px', fontSize: '12px', fontWeight: 900, cursor: 'pointer' },
  trayBtnOn: { background: '#27231f', color: '#fff9ef' },
  inspector: { background: '#fffaf2', border: '1px solid rgba(39,35,31,0.09)', borderRadius: '22px', padding: '14px', position: 'sticky', top: '14px', boxShadow: '0 12px 30px rgba(39,35,31,0.06)' },
  inspectImageWrap: { position: 'relative', borderRadius: '18px', overflow: 'hidden', background: '#fff', aspectRatio: '1 / 0.78', border: '1px solid rgba(39,35,31,0.08)' },
  inspectImage: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  inspectPill: { position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(39,35,31,0.12)', borderRadius: '999px', padding: '5px 8px', fontSize: '9px', fontWeight: 900, letterSpacing: '0.12em' },
  inspectHead: { marginTop: '12px' },
  inspectTitle: { margin: '4px 0 2px', fontSize: '22px', letterSpacing: '-0.04em' },
  inspectSub: { margin: 0, color: '#746b5e', fontSize: '13px' },
  formGrid: { marginTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0 },
  fieldLabel: { fontSize: '11px', fontWeight: 900, color: '#7b7162' },
  input: { minHeight: '38px', borderRadius: '12px', border: '1px solid rgba(39,35,31,0.12)', background: '#fffdf8', padding: '8px 10px', fontSize: '12px', outline: 'none', boxSizing: 'border-box', width: '100%' },
  inspectActions: { display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginTop: '14px' },
  primaryBtnFull: { minHeight: '42px', border: 'none', borderRadius: '14px', background: '#27231f', color: '#fff9ef', fontWeight: 900, cursor: 'pointer' },
  secondaryBtnFull: { minHeight: '42px', border: '1px solid rgba(39,35,31,0.14)', borderRadius: '14px', background: '#fffdf8', color: '#27231f', fontWeight: 900, cursor: 'pointer' },
  emptyInspector: { minHeight: '300px', display: 'grid', placeItems: 'center', color: '#7b7162', fontWeight: 800 },
};
