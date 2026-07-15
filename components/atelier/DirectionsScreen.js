import styles from './atelier.module.css';
import PendantVisualizer from './PendantVisualizer';

const DIRECTION_TAGS = [
  ['נאמן לאבן', 'מאוזן'],
  ['אדריכלי', 'עכשווי'],
  ['מעודן', 'פרימיום'],
];

export default function DirectionsScreen({
  directions,
  selectedDirection,
  designConfig,
  stoneShape,
  onSelectDirection,
  onBack,
  onContinue,
  onRegenerate,
}) {
  const list = Array.isArray(directions) ? directions : [];

  const choose = (direction) => {
    onSelectDirection(direction.conceptId);
    onContinue(direction.conceptId);
  };

  return (
    <div className={styles.directionsScreen}>
      <div className={styles.directionsHeader}>
        <div>
          <span className={styles.eyebrow}>שלושה כיוונים</span>
          <h1 className={styles.heading}>אותה אבן. שלוש פרשנויות מקצועיות.</h1>
          <p className={styles.subheading}>כל כיוון נשען על הבקשה, הרפרנסים והחלטות המבנה שבחרת.</p>
        </div>
        <button type="button" className={styles.ghostBtn} onClick={onRegenerate}>
          צור שלושה אחרים
        </button>
      </div>

      <div className={styles.directionsGrid}>
        {list.map((direction, index) => {
          const selected = selectedDirection === direction.conceptId;
          const tags = DIRECTION_TAGS[index % DIRECTION_TAGS.length];
          const visualConfig = {
            ...designConfig,
            setting:
              index === 1
                ? designConfig.product === 'pendant'
                  ? 'bezel'
                  : designConfig.setting
                : index === 2
                ? designConfig.product === 'pendant'
                  ? 'halo'
                  : designConfig.setting
                : designConfig.setting,
            sliders: {
              ...(designConfig.sliders || {}),
              presence: Math.min(100, (designConfig.sliders?.presence || 35) + index * 18),
              richness: Math.min(100, (designConfig.sliders?.richness || 30) + index * 16),
            },
          };
          return (
            <article
              key={direction.conceptId}
              className={`${styles.directionCard} ${selected ? styles.directionCardSelected : ''}`}
              onClick={() => onSelectDirection(direction.conceptId)}
            >
              <div className={styles.directionCardTopline}>
                <span className={styles.directionNumber}>0{index + 1}</span>
                <div className={styles.directionTags}>
                  {tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </div>

              <div className={styles.directionVisual}>
                <PendantVisualizer config={visualConfig} shape={stoneShape} variant={index} compact />
              </div>

              <div className={styles.directionBody}>
                <h2 className={styles.directionTitle}>{direction.conceptName}</h2>
                <p className={styles.directionText}>{direction.shortDescription}</p>
                <div className={styles.directionFacts}>
                  {direction.stoneLayout ? (
                    <div><span>מבנה אבנים</span><p>{direction.stoneLayout}</p></div>
                  ) : null}
                  {direction.designStructure ? (
                    <div><span>מבנה עיצוב</span><p>{direction.designStructure}</p></div>
                  ) : null}
                </div>
                {direction.productionNotes ? (
                  <p className={styles.directionProductionNote}>{direction.productionNotes}</p>
                ) : null}
              </div>

              <button
                type="button"
                className={`${styles.directionChoose} ${selected ? styles.directionChooseSelected : ''}`}
                onClick={(event) => {
                  event.stopPropagation();
                  choose(direction);
                }}
              >
                {selected ? 'המשך עם הכיוון הזה' : 'בחר כיוון'}
              </button>
            </article>
          );
        })}
      </div>

      <div className={styles.directionsFooter}>
        <button type="button" className={styles.backBtn} onClick={onBack}>חזור וערוך</button>
        <span>ניתן לחזור ולשנות בכל שלב</span>
      </div>
    </div>
  );
}
