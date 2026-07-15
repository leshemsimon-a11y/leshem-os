import { useState } from 'react';
import styles from './atelier.module.css';

const CHOICES = [
  {
    id: 'stone',
    title: 'יש לי אבן',
    sub: 'אני רוצה לעצב סביבה',
    image:
      '/assets/leshems/starter-pack-v1/01_stones/gemstones/stone_emerald_emeraldcut_vividgreen_thumb_v01.png',
  },
  {
    id: 'idea',
    title: 'יש לי רעיון',
    sub: 'לתכשיט שאני רוצה ליצור',
    image:
      '/assets/leshems/starter-pack-v1/02_jewelry_placeholders/jewel_pendant_solitaire_whitegold_preview_v01.png',
  },
  {
    id: 'inventory',
    title: 'יש לי מלאי',
    sub: 'אני רוצה לבנות כיוון או קולקציה',
    image:
      '/assets/leshems/starter-pack-v1/05_empty_states/empty_studio_start_stones_to_jewelry_v01.png',
  },
];

export default function WelcomeScreen({ intakeText, onIntakeChange, onSelectPath }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={styles.welcomeScreen}>
      <div className={styles.welcomeHead}>
        <h1 className={styles.heading}>ברוך הבא לסטודיו התכשיטים שלך</h1>
        <p className={styles.subheading}>מה ניצור יחד היום?</p>
      </div>

      <div className={styles.choiceGrid}>
        {CHOICES.map((choice) => (
          <button
            key={choice.id}
            type="button"
            className={styles.choiceCard}
            onClick={() => onSelectPath(choice.id)}
          >
            <span className={styles.choiceCardImageWrap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={choice.image} alt="" className={styles.choiceCardImage} />
            </span>
            <span className={styles.choiceCardText}>
              <span className={styles.choiceCardLabel}>{choice.title}</span>
              <span className={styles.choiceCardSub}>{choice.sub}</span>
            </span>
          </button>
        ))}
      </div>

      <div className={`${styles.intakeWrap} ${focused ? styles.intakeWrapFocused : ''}`}>
        <textarea
          className={styles.intakeField}
          placeholder="כתוב לי חופשי מה תרצה ליצור…"
          value={intakeText}
          onChange={(e) => onIntakeChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={2}
        />
        {intakeText.trim().length > 0 && (
          <button
            type="button"
            className={styles.intakeSubmit}
            onClick={() => onSelectPath('intake')}
          >
            המשך
          </button>
        )}
      </div>
    </div>
  );
}
