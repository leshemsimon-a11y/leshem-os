// components/studio/welcome/WelcomeStudio.js
//
// LESHEM.S OS — Clean 8K-R3: Atelier Experience System.
//
// Redesign of the Clean 8K-R2 Welcome Studio into a premium, image-first
// entry (section 2). Same four paths, same free-text Smart Intake, same
// `onChoosePath` / `onSubmitIntake` contract — only the VISUAL presentation
// changed: each path is now a large visual choice with one inline-SVG
// illustration (no icon/image package added), one short title, one short
// supporting line, and a real CSS hover/focus-visible state (via Next's
// built-in styled-jsx, already used elsewhere in this codebase — e.g.
// components/studio/shell/StudioShell.js's own <style jsx global>).
//
// Still shows ONLY the opening message, the four paths, and the Smart
// Intake — no dashboard statistics, no system summaries, no activity
// cards, no workflow explanations.

import * as React from 'react';
import { reset } from '../design/shell/studioResetStyle';
import { ENTRY_PATH, ENTRY_PATH_HE } from '../../../lib/studio/creationOrchestrator';

export const WELCOME_HE = Object.freeze({
  heading: 'ברוך הבא לסטודיו התכשיטים שלך',
  subheading: 'מה ניצור יחד היום?',
  intakeLabel: 'או ספר לי במילים שלך מה תרצה ליצור…',
  intakeSend: 'המשך',
});

// ---------------------------------------------------------------------------
// One small inline-SVG illustration per path — the "one strong visual
// preview" the spec asks for. Simple, restrained line art matching the
// atelier palette (graphite line, one muted-gold accent stroke). No icon
// or image package: plain inline SVG, same approach already used by
// components/studio/shared/CreativeAreaRail.js.
// ---------------------------------------------------------------------------
function StoneArt() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <path
        d="M18 16h20l10 12L28 46 8 28l10-12z"
        stroke={reset.color.text}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M8 28h40M18 16l-4 12 14 18 14-18-4-12"
        stroke={reset.color.accent}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IdeaArt() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <path
        d="M28 10c-8 0-14 6-14 13 0 5 3 8.5 6 11v6h16v-6c3-2.5 6-6 6-11 0-7-6-13-14-13z"
        stroke={reset.color.text}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M23 46h10" stroke={reset.color.text} strokeWidth="1.4" strokeLinecap="round" />
      <path
        d="M28 16v14M22 24l6 6 6-6"
        stroke={reset.color.accent}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CollectionArt() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <circle cx="19" cy="22" r="8" stroke={reset.color.text} strokeWidth="1.4" />
      <circle cx="37" cy="22" r="8" stroke={reset.color.text} strokeWidth="1.4" />
      <path d="M14 40h28" stroke={reset.color.accent} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="28" cy="38" r="6" stroke={reset.color.accent} strokeWidth="1.2" />
    </svg>
  );
}

function ExistingArt() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <rect x="10" y="12" width="36" height="28" rx="2" stroke={reset.color.text} strokeWidth="1.4" />
      <path d="M10 32l9-8 8 6 9-10 10 12" stroke={reset.color.text} strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="20" cy="20" r="2.4" fill={reset.color.accent} />
    </svg>
  );
}

const PATH_ORDER = [
  { key: ENTRY_PATH.STONE, Art: StoneArt },
  { key: ENTRY_PATH.IDEA, Art: IdeaArt },
  { key: ENTRY_PATH.COLLECTION, Art: CollectionArt },
  { key: ENTRY_PATH.EXISTING, Art: ExistingArt },
];

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
          {PATH_ORDER.map(({ key, Art }) => {
            const he = ENTRY_PATH_HE[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChoosePath && onChoosePath(key)}
                className="ws-path-card"
                style={styles.pathCard}
              >
                <span style={styles.pathArt} aria-hidden="true">
                  <Art />
                </span>
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

      {/* Real CSS hover/focus-visible state — inline style objects can't
          express :hover, so this small scoped block (Next.js built-in
          styled-jsx, already used elsewhere in this codebase, e.g.
          components/studio/shell/StudioShell.js) carries just that. Focus
          is reachable and visible via the keyboard, not only on mouse
          hover (section 8: accessibility). */}
      <style jsx>{`
        .ws-path-card {
          transition: border-color ${reset.transition.base}, box-shadow ${reset.transition.base},
            transform ${reset.transition.fast};
        }
        .ws-path-card:hover,
        .ws-path-card:focus-visible {
          border-color: ${reset.color.borderStrong};
          box-shadow: ${reset.shadow.lift};
          transform: translateY(-1px);
          outline: none;
        }
        .ws-path-card:focus-visible {
          outline: 2px solid ${reset.color.accent};
          outline-offset: 2px;
        }
      `}</style>
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
    margin: `0 0 ${reset.space.xl}`,
    fontFamily: reset.font.body,
    fontSize: '15px',
    fontWeight: 500,
    color: reset.color.textMuted,
  },
  pathGrid: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: reset.space.md,
    marginBottom: reset.space.xl,
  },
  pathCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: reset.space.xs,
    padding: `${reset.space.lg} ${reset.space.lg}`,
    borderRadius: reset.radius.md,
    border: `1px solid ${reset.color.border}`,
    background: reset.color.panel,
    cursor: 'pointer',
    textAlign: 'right',
  },
  pathArt: {
    display: 'inline-flex',
    marginBottom: reset.space.xs,
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
    gap: reset.space.sm,
  },
  intakeInput: {
    flex: '1 1 auto',
    minWidth: 0,
    minHeight: '42px',
    padding: `${reset.space.sm} 15px`,
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
    padding: `${reset.space.sm} 20px`,
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
