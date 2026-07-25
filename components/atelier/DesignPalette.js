import { useState } from 'react';
import styles from './atelier.module.css';
import JewelryIcon from './JewelryIcon';
import {
  ATELIER_PRODUCT_OPTIONS,
  ATELIER_STYLE_OPTIONS,
} from '../../lib/atelier/livingAtelier';
import {
  METAL_ALLOY_OPTIONS,
  METAL_COLOR_OPTIONS,
  METALS,
  MELEE_TYPES,
  MELEE_SIZES,
  SETTING_TYPES,
  CHAIN_TYPES,
  EARRING_BACKS,
  BAIL_TYPES,
  metalOption,
  meleeOption,
  meleeSizeOption,
  metalForSelection,
  componentGroupsFor,
  meleeTotalCarat,
} from '../../lib/atelier/componentsBank';

// ---------------------------------------------------------------------------
// Clean 11A.3 — the palette is now a set of standalone panels.
// Each panel is one decision. The guided flow renders them one at a time;
// the composed default export keeps a single-page view available.
// Selection logic is unchanged — only how the choices are presented.
// ---------------------------------------------------------------------------

export function OptionPills({ options, value, onSelect }) {
  return (
    <div className={styles.optionPills}>
      {options.map((option) => {
        const active = value === option.key;
        const hint = option.hint || option.hintHe;
        return (
          <button
            key={option.key}
            type="button"
            className={`${styles.optionPill} ${active ? styles.optionPillActive : ''}`}
            onClick={() => onSelect(option.key)}
            aria-pressed={active}
          >
            <span>{option.he}</span>
            {hint ? <small>{hint}</small> : null}
          </button>
        );
      })}
    </div>
  );
}

function SectionHead({ kicker, title, action }) {
  return (
    <div className={styles.sectionHeadRow}>
      <div>
        <span className={styles.sectionKicker}>{kicker}</span>
        <h3 className={styles.sectionTitle}>{title}</h3>
      </div>
      {action || null}
    </div>
  );
}

function panelClass(bare) {
  return bare ? styles.stepPanel : styles.paletteSection;
}

// --- Panel: what are we making -------------------------------------------

export function ProductPanel({ config, onChange, bare = false }) {
  const [showAll, setShowAll] = useState(false);
  const products = showAll
    ? ATELIER_PRODUCT_OPTIONS
    : ATELIER_PRODUCT_OPTIONS.filter((item) => item.featured);

  return (
    <section className={panelClass(bare)}>
      <SectionHead
        kicker="סוג התכשיט"
        title="מה אנחנו מעצבים?"
        action={
          <button
            type="button"
            className={styles.textAction}
            onClick={() => setShowAll((value) => !value)}
          >
            {showAll ? 'הצג עיקריים' : 'כל הסוגים'}
          </button>
        }
      />
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
            </button>
          );
        })}
      </div>
    </section>
  );
}

// --- Panel: design language ----------------------------------------------

export function StylePanel({ config, onChange, bare = false }) {
  const [showAll, setShowAll] = useState(false);
  const list = showAll
    ? ATELIER_STYLE_OPTIONS
    : ATELIER_STYLE_OPTIONS.filter((item) => item.featured);

  return (
    <section className={panelClass(bare)}>
      <SectionHead
        kicker="שפה עיצובית"
        title="איך היצירה צריכה להרגיש?"
        action={
          <button
            type="button"
            className={styles.textAction}
            onClick={() => setShowAll((value) => !value)}
          >
            {showAll ? 'הצג עיקריים' : 'סגנונות נוספים'}
          </button>
        }
      />
      <OptionPills options={list} value={config.style} onSelect={(style) => onChange({ style })} />
    </section>
  );
}

// --- Panel: metal ---------------------------------------------------------

export function MetalPanel({ config, onChange, bare = false }) {
  const metal = metalOption(config.metalKey) || METALS[0];
  const isGold = metal.alloy !== 'platinum950';

  const chooseAlloy = (alloy) => {
    const next = metalForSelection(alloy, alloy === 'platinum950' ? 'natural' : metal.color);
    if (next) onChange({ metalKey: next.key });
  };

  const chooseColor = (color) => {
    const next = metalForSelection(metal.alloy, color);
    if (next) onChange({ metalKey: next.key });
  };

  return (
    <section className={panelClass(bare)}>
      <SectionHead kicker="מתכת" title="הסגסוגת שממנה נייצר" />
      <div className={styles.alloyRow}>
        {METAL_ALLOY_OPTIONS.map((alloy) => {
          const active = metal.alloy === alloy.key;
          return (
            <button
              key={alloy.key}
              type="button"
              className={`${styles.alloyPill} ${active ? styles.alloyPillActive : ''}`}
              onClick={() => chooseAlloy(alloy.key)}
              aria-pressed={active}
            >
              <strong>{alloy.he}</strong>
              <small>{alloy.hallmark}</small>
            </button>
          );
        })}
      </div>
      {isGold ? (
        <div className={styles.metalMenu}>
          {METAL_COLOR_OPTIONS.map((color) => {
            const active = metal.color === color.key;
            return (
              <button
                key={color.key}
                type="button"
                className={`${styles.metalOption} ${active ? styles.metalOptionActive : ''}`}
                onClick={() => chooseColor(color.key)}
                aria-pressed={active}
              >
                <span className={styles.metalSwatch} data-metal={color.swatch} />
                <span>{color.he}</span>
              </button>
            );
          })}
        </div>
      ) : null}
      <p className={styles.componentNote}>{metal.he}</p>
    </section>
  );
}

// --- Panel: setting -------------------------------------------------------

export function SettingPanel({ config, onChange, bare = false }) {
  const groups = componentGroupsFor(config.product);
  if (!groups.setting) return null;

  return (
    <section className={panelClass(bare)}>
      <SectionHead kicker="שיבוץ" title="איך האבן מוחזקת" />
      <OptionPills
        options={SETTING_TYPES}
        value={config.settingKey}
        onSelect={(settingKey) => onChange({ settingKey })}
      />
    </section>
  );
}

// --- Panel: melee ---------------------------------------------------------

export function MeleePanel({ config, onChange, bare = false }) {
  const groups = componentGroupsFor(config.product);
  const melee = meleeOption(config.meleeKey);
  const size = meleeSizeOption(config.meleeSizeKey);
  const hasMelee = Boolean(melee && melee.key !== 'none');
  const totalCarat = hasMelee ? meleeTotalCarat(config.meleeSizeKey, config.meleeCount) : 0;

  if (!groups.melee) return null;

  const chooseMelee = (meleeKey) => {
    if (meleeKey === 'none') {
      onChange({ meleeKey, meleeCount: 0 });
      return;
    }
    const seed = config.meleeCount > 0 ? config.meleeCount : 16;
    onChange({ meleeKey, meleeCount: seed });
  };

  const stepMelee = (delta) => {
    const next = Math.max(1, Math.min(300, (Number(config.meleeCount) || 0) + delta));
    onChange({ meleeCount: next });
  };

  return (
    <section className={panelClass(bare)}>
      <SectionHead kicker="אבני לוואי" title="מה מקיף את האבן המרכזית" />
      <OptionPills options={MELEE_TYPES} value={config.meleeKey} onSelect={chooseMelee} />

      {hasMelee ? (
        <div className={styles.meleeDetail}>
          <div className={styles.meleeControl}>
            <span className={styles.controlLabel}>מידה</span>
            <div className={styles.sizeRow}>
              {MELEE_SIZES.map((option) => {
                const active = config.meleeSizeKey === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    className={`${styles.sizePill} ${active ? styles.sizePillActive : ''}`}
                    onClick={() => onChange({ meleeSizeKey: option.key })}
                    aria-pressed={active}
                  >
                    {option.mm}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.meleeControl}>
            <span className={styles.controlLabel}>כמות אבנים</span>
            <div className={styles.countStepper}>
              <button
                type="button"
                className={styles.countStepperBtn}
                onClick={() => stepMelee(-1)}
                aria-label="הפחת אבן"
              >
                −
              </button>
              <span className={styles.countStepperValue}>{config.meleeCount}</span>
              <button
                type="button"
                className={styles.countStepperBtn}
                onClick={() => stepMelee(1)}
                aria-label="הוסף אבן"
              >
                +
              </button>
            </div>
          </div>

          <p className={styles.meleeReadout}>
            {config.meleeCount} אבנים · {size ? `${size.mm} מ״מ` : '—'} · סה״כ {totalCarat} קראט
          </p>
        </div>
      ) : null}
    </section>
  );
}

// --- Panel: findings ------------------------------------------------------

export function FindingsPanel({ config, onChange, bare = false }) {
  const groups = componentGroupsFor(config.product);
  if (!groups.bail && !groups.chain && !groups.back) return null;

  return (
    <section className={panelClass(bare)}>
      <SectionHead kicker="פרזול" title="החלקים המוגמרים" />
      <div className={styles.miniControlGrid}>
        {groups.bail ? (
          <div className={styles.miniControl}>
            <span className={styles.controlLabel}>לולאה</span>
            <OptionPills
              options={BAIL_TYPES}
              value={config.bailKey}
              onSelect={(bailKey) => onChange({ bailKey })}
            />
          </div>
        ) : null}
        {groups.chain ? (
          <div className={styles.miniControl}>
            <span className={styles.controlLabel}>שרשרת</span>
            <OptionPills
              options={CHAIN_TYPES}
              value={config.chainKey}
              onSelect={(chainKey) => onChange({ chainKey })}
            />
          </div>
        ) : null}
        {groups.back ? (
          <div className={styles.miniControl}>
            <span className={styles.controlLabel}>סגירה</span>
            <OptionPills
              options={EARRING_BACKS}
              value={config.earringBackKey}
              onSelect={(earringBackKey) => onChange({ earringBackKey })}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

// --- Composed single-page form -------------------------------------------

export default function DesignPalette({ config, onChange }) {
  return (
    <div className={styles.designPalette}>
      <ProductPanel config={config} onChange={onChange} />
      <StylePanel config={config} onChange={onChange} />
      <MetalPanel config={config} onChange={onChange} />
      <SettingPanel config={config} onChange={onChange} />
      <MeleePanel config={config} onChange={onChange} />
      <FindingsPanel config={config} onChange={onChange} />
    </div>
  );
}
