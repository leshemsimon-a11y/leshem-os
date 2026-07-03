import * as React from 'react';
import { getDemoGemstoneRecords, getDemoActivityFeed } from '../../lib/studio/demoGemstoneAssets';

export default function DemoGemstonesPage() {
  const records = getDemoGemstoneRecords();
  const activity = getDemoActivityFeed();

  return (
    <main style={styles.page} dir="rtl">
      <section style={styles.head}>
        <span style={styles.kicker}>LESHEM.S OS</span>
        <h1 style={styles.title}>Demo Gemstone Operating Layer</h1>
        <p style={styles.sub}>
          דף בדיקה עצמאי: אם התמונות מופיעות כאן, המדיה עלתה נכון ל־GitHub והבעיה היא רק בחיבור למסך הספציפי.
        </p>
      </section>

      <section style={styles.activity}>
        {activity.map((item) => (
          <div key={item.id} style={styles.activityItem}>
            <span style={styles.dot} />
            <span>{item.textHe}</span>
          </div>
        ))}
      </section>

      <section style={styles.grid}>
        {records.map((stone) => (
          <article key={stone.id} style={styles.card}>
            <div style={styles.images}>
              <div style={styles.imageBox}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={stone.boxImage || stone.boxThumb} alt="" style={styles.img} />
                <span style={styles.label}>BOX</span>
              </div>
              <div style={styles.imageBox}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={stone.tweezerImage || stone.boxImage} alt="" style={styles.img} />
                <span style={styles.label}>INSPECT</span>
              </div>
            </div>
            <div style={styles.meta}>
              <h2 style={styles.cardTitle}>{stone.titleHe}</h2>
              <p style={styles.cardSub}>{stone.title}</p>
              <div style={styles.badges}>
                <span style={styles.badge}>{stone.estimatedCarat} ct</span>
                <span style={styles.badge}>{stone.color}</span>
                <span style={styles.badge}>{stone.sourceType}</span>
                <span style={styles.badge}>{stone.status}</span>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    padding: '32px',
    background: '#f7f3eb',
    color: '#1f2426',
    fontFamily: 'Arial, sans-serif',
  },
  head: { maxWidth: '980px', margin: '0 auto 18px', display: 'flex', flexDirection: 'column', gap: '6px' },
  kicker: { fontSize: '11px', letterSpacing: '0.18em', fontWeight: 800, color: '#9c7a3d' },
  title: { margin: 0, fontSize: '32px', letterSpacing: '-0.04em' },
  sub: { margin: 0, maxWidth: '760px', color: '#6f7477', lineHeight: 1.6 },
  activity: { maxWidth: '980px', margin: '0 auto 22px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' },
  activityItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '16px', background: '#fffaf1', border: '1px solid rgba(160,128,70,0.25)', fontSize: '13px', fontWeight: 700 },
  dot: { width: '8px', height: '8px', borderRadius: '50%', background: '#b8975a', flexShrink: 0 },
  grid: { maxWidth: '980px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' },
  card: { overflow: 'hidden', borderRadius: '22px', background: '#fffdf8', border: '1px solid rgba(31,36,38,0.08)', boxShadow: '0 12px 30px rgba(31,36,38,0.08)' },
  images: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(31,36,38,0.08)' },
  imageBox: { position: 'relative', aspectRatio: '1 / 1', background: '#fff', overflow: 'hidden' },
  img: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  label: { position: 'absolute', top: '8px', left: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.88)', padding: '4px 8px', fontSize: '9px', fontWeight: 900, letterSpacing: '0.12em' },
  meta: { padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: '7px' },
  cardTitle: { margin: 0, fontSize: '18px' },
  cardSub: { margin: 0, color: '#6f7477', fontSize: '13px' },
  badges: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' },
  badge: { borderRadius: '999px', background: '#f1ece2', padding: '5px 8px', fontSize: '11px', fontWeight: 700, color: '#4b5154' },
};
