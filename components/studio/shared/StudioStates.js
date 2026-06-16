// components/studio/shared/StudioStates.js
//
// LESHEM.S OS — Shared Loading / Empty / Error states (Clean 2)
//
// Honest, elegant Hebrew states. The error state never blames the user and
// never exposes internal details (no env var names, no stack traces, no IDs).

import { tokens } from './tokens';

function Shell({ children }) {
  return (
    <div style={styles.wrap} dir="rtl">
      {children}
    </div>
  );
}

export function LoadingState() {
  return (
    <Shell>
      <div style={styles.spinner} aria-hidden="true" />
      <p style={styles.text}>טוען את המלאי…</p>
      <style jsx>{`
        @keyframes leshem-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Shell>
  );
}

export function EmptyState({
  title = 'אין פריטים להצגה',
  hint = 'לא נמצאו אבנים במלאי. נסו לשנות את החיפוש או הסינון.',
}) {
  return (
    <Shell>
      <div style={styles.mark} aria-hidden="true">
        ◇
      </div>
      <h2 style={styles.title}>{title}</h2>
      <p style={styles.text}>{hint}</p>
    </Shell>
  );
}

export function ErrorState({
  title = 'המלאי אינו זמין כרגע',
  message = 'אירעה תקלה בטעינת המלאי. נסו שוב מאוחר יותר.',
  onRetry = null,
}) {
  return (
    <Shell>
      <div style={styles.markWarn} aria-hidden="true">
        ◆
      </div>
      <h2 style={styles.title}>{title}</h2>
      <p style={styles.text}>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} style={styles.retry}>
          נסו שוב
        </button>
      )}
    </Shell>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    minHeight: '50vh',
    padding: '48px 24px',
    gap: '12px',
  },
  spinner: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    border: `2px solid ${tokens.color.goldFaint}`,
    borderTopColor: tokens.color.gold,
    animation: 'leshem-spin 0.9s linear infinite',
  },
  mark: {
    fontSize: '30px',
    color: tokens.color.goldSoft,
  },
  markWarn: {
    fontSize: '28px',
    color: tokens.color.gold,
  },
  title: {
    fontFamily: tokens.font.display,
    fontWeight: 400,
    fontSize: '24px',
    color: tokens.color.charcoal,
    margin: 0,
  },
  text: {
    fontFamily: tokens.font.body,
    fontSize: '15px',
    lineHeight: 1.6,
    color: tokens.color.inkFaint,
    maxWidth: '420px',
    margin: 0,
  },
  retry: {
    marginTop: '8px',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.color.charcoal,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.sm,
    padding: '9px 22px',
    cursor: 'pointer',
    boxShadow: tokens.shadow.soft,
  },
};
