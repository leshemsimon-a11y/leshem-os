import { useState } from 'react';
import styles from './atelier.module.css';

const STONE_VARIANTS = [
  {
    id: 'emerald-oval',
    label: 'אמרלד אובלי',
    image:
      '/assets/leshems/starter-pack-v1/01_stones/gemstones/stone_emerald_emeraldcut_vividgreen_thumb_v01.png',
  },
  {
    id: 'ruby-oval',
    label: 'רובי אובלי',
    image:
      '/assets/leshems/starter-pack-v1/01_stones/gemstones/stone_ruby_oval_richred_thumb_v01.png',
  },
  {
    id: 'sapphire-oval',
    label: 'ספיר אובלי',
    image:
      '/assets/leshems/starter-pack-v1/01_stones/gemstones/stone_sapphire_oval_royalblue_thumb_v01.png',
  },
];

const CHIPS = ['תליון', 'טבעת', 'עדין', 'מודרני', 'זהב לבן', 'קלאסטר'];

export default function StoneRequestScreen({
  requestText,
  onRequestChange,
  selectedChips,
  onToggleChip,
  onBack,
  onContinue,
}) {
  const [stoneIndex, setStoneIndex] = useState(0);
  const stone = STONE_VARIANTS[stoneIndex];

  const showPrev = () =>
    setStoneIndex((i) => (i - 1 + STONE_VARIANTS.length) % STONE_VARIANTS.length);
  const showNext = () => setStoneIndex((i) => (i + 1) % STONE_VARIANTS.length);
  const canContinue = requestText.trim().length > 0 || selectedChips.length > 0;

  return (
    <div className={styles.stoneScreen}>
      <div className={styles.stoneColumn}>
        <div className={styles.stoneImageFrame}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={stone.image} alt={stone.label} className={styles.stoneImage} />
          <button type="button" className={styles.replaceStoneBtn} onClick={showNext}>
            החלף אבן
          </button>
        </div>
        <div className={styles.stoneNav}>
          <button
            type="button"
            className={styles.stoneNavBtn}
            onClick={showPrev}
            aria-label="האבן הקודמת"
          >
            ‹
          </button>
          <span className={styles.stoneNavLabel}>{stone.label}</span>
          <button
            type="button"
            className={styles.stoneNavBtn}
            onClick={showNext}
            aria-label="האבן הבאה"
          >
            ›
          </button>
        </div>
      </div>

      <div className={styles.requestColumn}>
        <span className={styles.eyebrow}>הכוונה שלך</span>
        <h2 className={styles.requestHeading}>מה תרצה ליצור סביב האבן?</h2>
        <textarea
          className={styles.requestTextarea}
          placeholder="למשל: תליון עדין ומודרני בזהב לבן…"
          value={requestText}
          onChange={(e) => onRequestChange(e.target.value)}
          rows={5}
        />
        <div className={styles.chipsRow}>
          {CHIPS.map((chip) => {
            const active = selectedChips.includes(chip);
            return (
              <button
                key={chip}
                type="button"
                className={`${styles.chip} ${active ? styles.chipActive : ''}`}
                onClick={() => onToggleChip(chip)}
                aria-pressed={active}
              >
                {chip}
              </button>
            );
          })}
        </div>
        <div className={styles.attachRow}>
          <button type="button" className={styles.attachBtn}>
            צרף תמונה
          </button>
          <button type="button" className={styles.attachBtn}>
            צרף קובץ
          </button>
          <button type="button" className={styles.attachBtn}>
            רפרנס / השראה
          </button>
        </div>
      </div>

      <div className={styles.bottomNav}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          חזור
        </button>
        <button
          type="button"
          className={styles.continueBtn}
          onClick={onContinue}
          disabled={!canContinue}
        >
          המשך
        </button>
      </div>
    </div>
  );
}
