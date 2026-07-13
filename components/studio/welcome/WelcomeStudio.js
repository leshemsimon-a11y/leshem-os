// components/studio/welcome/WelcomeStudio.js
//
// LESHEM.S OS — Clean 8K-R2: Welcome Studio + One Flow Experience.
//
// The new primary entry screen. Shows ONLY the opening message, the four
// creation paths, and a free-text Smart Intake field — nothing else
// (no dashboard statistics, no activity log, no Work Tray cards, no
// multiple shortcuts), per the milestone's explicit visual rules.
//
// PRESENTATIONAL only: `onChoosePath(path)` and `onSubmitIntake(text)` are
// owned by the caller (WelcomeCreationFlow.js), which performs the actual
// automatic behind-the-scenes actions through EXISTING public APIs. This
// component has no store access of its own.

import * as React from 'react';
import { reset } from '../design/shell/studioResetStyle';
import { ENTRY_PATH, ENTRY_PATH_HE } from '../../../lib/studio/creationOrchestrator';

export const WELCOME_HE = Object.freeze({
  heading: 'ברוך הבא לסטודיו התכשיטים שלך',
  subheading: 'מה נוכל ליצור יחד היום?',
  intakeLabel: 'או ספר לי במילים שלך מה תרצה לעשות…',
  intakeSend: 'המשך',
});

const PATH_ORDER = [ENTRY_PATH.STONE, ENTRY_PATH.IDEA, ENTRY_PATH.COLLECTION, ENTRY_PATH.EXISTING];

export default function WelcomeStudio({ onChoosePath, onSubmitIntake }) {
  const [intake, setIntake] = React.useState('');

  const submitIntake = () => {
    const value = intake.trim();
    if (!value || typeof onSubmitIntake !== 'function') return;
    onSubmitIntake(value);
    setIntake('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitIntake();
    }
  };

  return (
    <div style={styles.wrap} dir="rtl">
      <div style={styles.center}>
        <h1 style={styles.heading}>{WELCOME_HE.heading}</h1>
        <p style={styles.subheading}>{WELCOME_HE.subheading}</p>

        <div style={styles.pathGrid}>
          {PATH_ORDER.map((path) => {
            const he = ENTRY_PATH_HE[path];
            return (
              <button
                key={path}
                type="button"
                onClick={() => onChoosePath && onChoosePath(path)}
                style={styles.pathCard}
              >
                <span style={styles.pathTitle}>{he.title}</span>
                <span style={styles.pathSubtitle}>{he.subtitle}</span>
              </button>
            );
          })}
        </div>

        <div style={styles.intakeRow}>
          <input
            type="text"
            value={intake}
            onChange={(e) => setIntake(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={WELCOME_HE.intakeLabel}
            style={styles.intakeInput}
            aria-label={WELCOME_HE.intakeLabel}
          />
          <button
            type="button"
            onClick={submitIntake}
            style={styles.intakeBtn}
            disabled={!intake.trim()}
          >
            {WELCOME_HE.intakeSend}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    width: '100%',
    height: '100%',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: reset.color.page,
    padding: '32px 20px',
    boxSizing: 'border-box',
  },
  center: {
    width: 'min(720px, 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    textAlign: 'center',
  },
  heading: {
    margin: 0,
    fontFamily: reset.font.display,
    fontSize: '26px',
    fontWeight: 700,
    color: reset.color.text,
  },
  subheading: {
    margin: '0 0 22px',
    fontFamily: reset.font.body,
    fontSize: '15px',
    fontWeight: 500,
    color: reset.color.textMuted,
  },
  pathGrid: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '10px',
    marginBottom: '22px',
  },
  pathCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '4px',
    padding: '16px 18px',
    borderRadius: reset.radius.md,
    border: `1px solid ${reset.color.borderStrong}`,
    background: reset.color.panel,
    cursor: 'pointer',
    textAlign: 'right',
  },
  pathTitle: {
    fontFamily: reset.font.display,
    fontSize: '15.5px',
    fontWeight: 700,
    color: reset.color.text,
  },
  pathSubtitle: {
    fontFamily: reset.font.body,
    fontSize: '12px',
    fontWeight: 500,
    color: reset.color.textMuted,
  },
  intakeRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  intakeInput: {
    flex: '1 1 auto',
    minWidth: 0,
    minHeight: '42px',
    padding: '10px 15px',
    borderRadius: reset.radius.md,
    border: `1px solid ${reset.color.borderStrong}`,
    background: reset.color.panel,
    color: reset.color.text,
    fontFamily: reset.font.body,
    fontSize: '13.5px',
    textAlign: 'right',
  },
  intakeBtn: {
    minHeight: '42px',
    padding: '10px 20px',
    borderRadius: reset.radius.md,
    border: 'none',
    background: reset.color.primaryBg,
    color: reset.color.primaryText,
    fontFamily: reset.font.body,
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
};
