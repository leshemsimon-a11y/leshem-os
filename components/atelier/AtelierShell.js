import styles from './atelier.module.css';

const STEPS = [
  { id: 1, label: 'בחירה' },
  { id: 2, label: 'קליטה' },
  { id: 3, label: 'כיוונים' },
  { id: 4, label: 'הכנה' },
];

export default function AtelierShell({ children, onReset, showReset, currentStep = 1 }) {
  return (
    <div className={styles.shell} dir="rtl">
      <div className={styles.topBar}>
        <div className={styles.wordmark}>
          <span className={styles.wordmarkMain}>LESHEM.S</span>
          <span className={styles.wordmarkSub}>OS</span>
        </div>

        {currentStep > 1 && (
          <div className={styles.stepper} aria-label={`שלב ${currentStep} מתוך 4`}>
            {STEPS.map((step, index) => {
              const complete = step.id < currentStep;
              const active = step.id === currentStep;
              return (
                <div key={step.id} className={styles.stepItem}>
                  <span
                    className={`${styles.stepDot} ${complete ? styles.stepDotComplete : ''} ${
                      active ? styles.stepDotActive : ''
                    }`}
                  >
                    {complete ? '✓' : step.id}
                  </span>
                  <span className={`${styles.stepLabel} ${active ? styles.stepLabelActive : ''}`}>
                    {step.label}
                  </span>
                  {index < STEPS.length - 1 && <span className={styles.stepLine} />}
                </div>
              );
            })}
          </div>
        )}

        <div className={styles.topActions}>
          {showReset && (
            <button type="button" className={styles.resetBtn} onClick={onReset}>
              התחלה מחדש
            </button>
          )}
        </div>
      </div>
      <main className={styles.screen}>{children}</main>
    </div>
  );
}
