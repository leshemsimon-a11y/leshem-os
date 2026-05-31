/**
 * LESHEM.S OS — v2 Studio Dashboard
 * Landing screen. Metric cards + quick actions + recent assets.
 * Metrics derived from live Airtable data where possible; graceful fallback otherwise.
 */

import { useEffect, useState } from 'react';
import styles from './StudioDashboard.module.css';
import { normalizeAsset, getAssetDisplayTitle } from '../../../lib/v2/taxonomyHelpers';
import { useWorkTray } from '../../../lib/v2/workTrayContext';

export default function StudioDashboard({ onNavigate, onOpenTray }) {
  const [recentAssets, setRecentAssets] = useState([]);
  const [totalAssets, setTotalAssets] = useState(null);
  const [loading, setLoading] = useState(true);
  const { itemCount } = useWorkTray();

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Uses existing Airtable read endpoint — no new routes
        const res = await fetch('/api/airtable/stones');
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();

        // Handle both { records: [...] } and direct array responses
        const rawRecords = Array.isArray(data)
          ? data
          : data.stones || data.records || data.items || data.inventory || [];

        const normalized = rawRecords.map(normalizeAsset).filter(Boolean);
        setTotalAssets(normalized.length);

        // Most recent 5
        setRecentAssets(normalized.slice(0, 5));
      } catch (err) {
        // Graceful degradation — dashboard still renders without data
        console.error('[v2 Dashboard] Could not load inventory:', err);
        setTotalAssets('—');
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const today = new Date().toLocaleDateString('he-IL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className={styles.dashboard}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>שלום, סטודיו LESHEM.S</h1>
        <p className={styles.pageSubtitle}>{today}</p>
      </div>

      {/* ── Metric Cards ── */}
      <div className={styles.metricsRow}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>פריטים במלאי</div>
          <div className={styles.metricValue}>
            {loading ? '...' : totalAssets}
          </div>
          <div className={styles.metricDesc}>אבנים, חלקים ותכשיטים</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>מגש עבודה</div>
          <div className={styles.metricValue}>{itemCount}</div>
          <div className={styles.metricDesc}>פריטים נבחרים</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>תעודות ממתינות</div>
          <div className={styles.metricValue}>—</div>
          <div className={styles.metricDesc}>זמין בשלב הבא</div>
        </div>
      </div>

      <div className={styles.goldDivider} />

      {/* ── Quick Actions ── */}
      <div className={styles.quickActionsSection}>
        <div className={styles.sectionTitle}>פעולות מהירות</div>
        <div className={styles.quickActions}>
          <button
            className={`${styles.quickActionBtn} ${styles.quickActionPrimary}`}
            onClick={() => onNavigate && onNavigate('inventory')}
          >
            <span>◇</span>
            <span>פתח מלאי</span>
          </button>

          {itemCount > 0 && (
            <button
              className={`${styles.quickActionBtn} ${styles.quickActionPrimary}`}
              onClick={onOpenTray}
            >
              <span>◈</span>
              <span>פתח מגש ({itemCount})</span>
            </button>
          )}

          <a
            className={`${styles.quickActionBtn} ${styles.quickActionSecondary}`}
            href="/"
          >
            <span>⊞</span>
            <span>מחשבון</span>
          </a>

          <a
            className={`${styles.quickActionBtn} ${styles.quickActionSecondary}`}
            href="/"
          >
            <span>◻</span>
            <span>תעודות</span>
          </a>
        </div>
      </div>

      {/* ── Recent Assets ── */}
      <div className={styles.recentSection}>
        <div className={styles.recentHeader}>פריטים אחרונים</div>
        {loading ? (
          <div className={styles.loadingState}>טוען נתונים...</div>
        ) : recentAssets.length === 0 ? (
          <div className={styles.loadingState}>אין פריטים להצגה</div>
        ) : (
          recentAssets.map((asset, idx) => (
            <div key={asset._airtableId || idx} className={styles.recentItem}>
              <div className={styles.recentDot} />
              <div className={styles.recentName}>
                {getAssetDisplayTitle(asset)}
              </div>
              <div className={styles.recentMeta}>
                {asset.status
                  ? asset.status
                  : asset.caratWeight
                  ? `${asset.caratWeight} קרט`
                  : ''}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
