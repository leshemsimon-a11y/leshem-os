import { useState } from 'react';
import styles from './atelier.module.css';
import JewelryIcon from './JewelryIcon';
import {
  ATELIER_PRODUCT_OPTIONS,
  ATELIER_STYLE_OPTIONS,
  ATELIER_METAL_OPTIONS,
  PENDANT_SETTING_OPTIONS,
  PENDANT_BAIL_OPTIONS,
  PENDANT_CHAIN_OPTIONS,
  ATELIER_SLIDERS,
} from '../../lib/atelier/livingAtelier';

function OptionPills({ options, value, onSelect, className }) {
  return (
    <div className={className || styles.optionPills}>
      {options.map((option) => {
        const active = value === option.key;
        return (
          <button
            key={option.key}
            type="button"
            className={`${styles.optionPill} ${active ? styles.optionPillActive : ''}`}
            onClick={() => onSelect(option.key)}
            aria-pressed={active}
          >
            <span>{option.he}</span>
            {option.hint ? <small>{option.hint}</small> : null}
          </button>
        );
      })}
    </div>
  );
}

export default function DesignPalette({ config, onChange }) {
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [showAllStyles, setShowAllStyles] = useState(false);
  const products = showAllProducts
    ? ATELIER_PRODUCT_OPTIONS
    : ATELIER_PRODUCT_OPTIONS.filter((item) => item.featured);
  const stylesList = showAllStyles
    ? ATELIER_STYLE_OPTIONS
    : ATELIER_STYLE_OPTIONS.filter((item) => item.featured);

  const updateSlider = (key, value) => {
    onChange({ sliders: { ...(config.sliders || {}), [key]: Number(value) } });
  };

  return (
    <div className={styles.designPalette}>
      <section className={styles.paletteSection}>
        <div className={styles.sectionHeadRow}>
          <div>
            <span className={styles.sectionKicker}>סוג התכשיט</span>
            <h3 className={styles.sectionTitle}>מה אנחנו מעצבים?</h3>
          </div>
          <button
            type="button"
            className={styles.textAction}
            onClick={() => setShowAllProducts((value) => !value)}
          >
            {showAllProducts ? 'הצג עיקריים' : 'כל הסוגים'}
          </button>
        </div>
        <div className={styles.productMenu}>
          {products.map((option) => {
            const active = config.product === option.key;
            return (
              <button
                key={option.key}
                type="button"
                className={`${styles.productTile} ${active ? styles.productTileActive : ''}`}
                onClick={() => onChange({ product: option.key })}
                aria-pressed={active}
              >
                <span className={styles.productIconWrap}>
                  <JewelryIcon type={option.icon} />
                </span>
                <span className={styles.productTileCopy}>
                  <strong>{option.he}</strong>
                  <small>{option.hint}</small>
                </span>
                {option.key === 'pendant' ? <span className={styles.recommendedBadge}>מסלול חי</span> : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.paletteSection}>
        <div className={styles.sectionHeadRow}>
          <div>
            <span className={styles.sectionKicker}>שפה עיצובית</span>
            <h3 className={styles.sectionTitle}>איך היצירה צריכה להרגיש?</h3>
          </div>
          <button
            type="button"
            className={styles.textAction}
            onClick={() => setShowAllStyles((value) => !value)}
          >
            {showAllStyles ? 'הצג עיקריים' : 'סגנונות נוספים'}
          </button>
        </div>
        <OptionPills
          options={stylesList}
          value={config.style}
          onSelect={(style) => onChange({ style })}
        />
      </section>

      <section className={styles.paletteSection}>
        <div className={styles.sectionHeadRow}>
          <div>
            <span className={styles.sectionKicker}>מתכת</span>
            <h3 className={styles.sectionTitle}>הגוון שמחזיק את העיצוב</h3>
          </div>
        </div>
        <div className={styles.metalMenu}>
          {ATELIER_METAL_OPTIONS.map((metal) => {
            const active = config.metalPreference === metal.key;
            return (
              <button
                key={metal.key}
                type="button"
                className={`${styles.metalOption} ${active ? styles.metalOptionActive : ''}`}
                onClick={() => onChange({ metalPreference: metal.key })}
                aria-pressed={active}
              >
                <span className={styles.metalSwatch} data-metal={metal.swatch} />
                <span>{metal.he}</span>
              </button>
            );
          })}
        </div>
      </section>

      {config.product === 'pendant' ? (
        <section className={`${styles.paletteSection} ${styles.pendantControls}`}>
          <div className={styles.sectionHeadRow}>
            <div>
              <span className={styles.sectionKicker}>מבנה התליון</span>
              <h3 className={styles.sectionTitle}>כמה החלטות שמעצבות את התוצאה</h3>
            </div>
          </div>
          <div className={styles.miniControlGrid}>
            <div className={styles.miniControl}>
              <span className={styles.controlLabel}>שיבוץ</span>
              <OptionPills
                options={PENDANT_SETTING_OPTIONS}
                value={config.setting}
                onSelect={(setting) => onChange({ setting })}
              />
            </div>
            <div className={styles.miniControl}>
              <span className={styles.controlLabel}>חיבור לשרשרת</span>
              <OptionPills
                options={PENDANT_BAIL_OPTIONS}
                value={config.bail}
                onSelect={(bail) => onChange({ bail })}
              />
            </div>
            <div className={styles.miniControl}>
              <span className={styles.controlLabel}>שרשרת</span>
              <OptionPills
                options={PENDANT_CHAIN_OPTIONS}
                value={config.chain}
                onSelect={(chain) => onChange({ chain })}
              />
            </div>
          </div>
        </section>
      ) : null}

      <section className={styles.paletteSection}>
        <div className={styles.sectionHeadRow}>
          <div>
            <span className={styles.sectionKicker}>אופי ופרופורציות</span>
            <h3 className={styles.sectionTitle}>כוון את התחושה, לא את הטכניקה</h3>
          </div>
        </div>
        <div className={styles.sliderStack}>
          {ATELIER_SLIDERS.map((slider) => (
            <label key={slider.key} className={styles.sliderRow}>
              <span className={styles.sliderLabelLine}>
                <strong>{slider.he}</strong>
                <span>{slider.minHe}</span>
                <span>{slider.maxHe}</span>
              </span>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={(config.sliders && config.sliders[slider.key]) || 0}
                onChange={(event) => updateSlider(slider.key, event.target.value)}
                className={styles.designSlider}
              />
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
