import styles from './atelier.module.css';

const STEPS = [
  { id: 1, label: 'התחלה' },
  { id: 2, label: 'כוונה' },
  { id: 3, label: 'כיוונים' },
  { id: 4, label: 'הדמיה' },
];

export default function AtelierShell({
  children,
  onReset,
  showReset,
  currentStep = 1,
  onOpenCreations,
}) {
  return (
    <div className={styles.shell} dir="rtl">
      <div className={styles.ambientGlow} aria-hidden="true" />
      <header className={styles.topBar}>
        <div className={styles.wordmark}>
          <span className={styles.wordmarkMain}>LESHEM.S</span>
          <span className={styles.wordmarkSub}>ATELIER</span>
        </div>

        <nav className={styles.stepper} aria-label={`שלב ${currentStep} מתוך 4`}>
          {STEPS.map((step, index) => {
            const complete = step.id < currentStep;
            const active = step.id === currentStep;
            return (
              <div key={step.id} className={styles.stepItem} data-state={active ? 'active' : complete ? 'complete' : 'idle'}>
                <span className={styles.stepDot}>{complete ? '✓' : step.id}</span>
                <span className={styles.stepLabel}>{step.label}</span>
                {index < STEPS.length - 1 ? <span className={styles.stepLine} /> : null}
              </div>
            );
          })}
        </nav>

        <div className={styles.topActions}>
          <button type="button" className={styles.creationsBtn} onClick={onOpenCreations}>
            <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 5.5h14v11H3v-11Z" stroke="currentColor" strokeWidth="1.4" />
              <path d="M6 5.5V3.8h8v1.7M6.5 9h7M6.5 12h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <span>היצירות שלי</span>
          </button>
          {showReset ? (
            <button type="button" className={styles.resetBtn} onClick={onReset} title="התחלה מחדש">
              <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4.2 7.3A6.3 6.3 0 1 1 3.8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M3.8 3.8v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>התחלה מחדש</span>
            </button>
          ) : null}
        </div>
      </header>
      <main className={styles.screen}>{children}</main>
    </div>
  );
}
