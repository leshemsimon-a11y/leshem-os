import { useState } from 'react';
import styles from './atelier.module.css';
import JewelryIcon from './JewelryIcon';

const CHOICES = [
  {
    id: 'stone',
    title: 'לעצב סביב אבן',
    sub: 'בחר אבן מהמלאי והתחל יצירה חיה',
    icon: 'pendant',
    primary: true,
  },
  {
    id: 'idea',
    title: 'להתחיל מרעיון',
    sub: 'כתוב מה תרצה ליצור והמערכת תוביל',
    icon: 'other',
  },
  {
    id: 'inventory',
    title: 'לבנות מהמלאי',
    sub: 'בחר כמה אבנים לכיוון או קולקציה',
    icon: 'matchingPiece',
  },
];

export default function WelcomeScreen({ intakeText, onIntakeChange, onSelectPath }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={styles.welcomeScreen}>
      <section className={styles.welcomeHero}>
        <span className={styles.eyebrow}>LESHEM.S Living Atelier</span>
        <h1 className={styles.heading}>האבן שלך. תכשיט שנולד סביבה.</h1>
        <p className={styles.subheading}>
          מרחב יצירה מונחה שמחבר בין מלאי אמיתי, שיקול דעת מקצועי והדמיה — בלי להעמיס על הדרך.
        </p>
      </section>

      <div className={styles.choiceGrid}>
        {CHOICES.map((choice) => (
          <button
            key={choice.id}
            type="button"
            className={`${styles.choiceCard} ${choice.primary ? styles.choiceCardPrimary : ''}`}
            onClick={() => onSelectPath(choice.id)}
          >
            <span className={styles.choiceCardImageWrap}>
              <JewelryIcon type={choice.icon} size={38} />
            </span>
            <span className={styles.choiceCardText}>
              <span className={styles.choiceCardLabel}>{choice.title}</span>
              <span className={styles.choiceCardSub}>{choice.sub}</span>
            </span>
            <span className={styles.choiceArrow}>←</span>
          </button>
        ))}
      </div>

      <div className={`${styles.intakeWrap} ${focused ? styles.intakeWrapFocused : ''}`}>
        <textarea
          className={styles.intakeField}
          placeholder="אפשר גם להתחיל במשפט אחד: תליון עדין סביב אמרלד…"
          value={intakeText}
          onChange={(event) => onIntakeChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={2}
        />
        <button
          type="button"
          className={styles.intakeSubmit}
          onClick={() => onSelectPath('intake')}
          disabled={!intakeText.trim()}
        >
          התחל
        </button>
      </div>

      <div className={styles.welcomeTrustRow}>
        <span>שומר את ההקשר</span>
        <span>עובד עם המלאי הקיים</span>
        <span>מוכן למנוע רינדור אמיתי</span>
      </div>
    </div>
  );
}
