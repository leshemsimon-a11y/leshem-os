import styles from './atelier.module.css';

// Cycled purely by position so every direction gets a distinct silhouette —
// this is the SAME deterministic sketch generator approved in Clean 10A,
// unchanged, now illustrating real generated directions instead of static
// demo copy.
const SKETCH_VARIANTS = ['geometric', 'ribbon', 'halo'];

function ConceptSketch({ variant }) {
  const halo = variant === 'halo' || variant === 'cluster';
  const ribbon = variant === 'ribbon' || variant === 'drop';
  const bezel = variant === 'bezel';
  const geometric = variant === 'geometric';
  const cluster = variant === 'cluster';

  return (
    <svg viewBox="0 0 320 260" className={styles.pendantSketch} role="img" aria-label="סקיצת כיוון עיצוב">
      <defs>
        <linearGradient id={`stone-${variant}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1f7b57" />
          <stop offset="55%" stopColor="#0e513b" />
          <stop offset="100%" stopColor="#082d24" />
        </linearGradient>
        <linearGradient id={`metal-${variant}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbfbfb" />
          <stop offset="45%" stopColor="#c9cdd0" />
          <stop offset="100%" stopColor="#f4f4f4" />
        </linearGradient>
      </defs>

      <path d="M160 0V55" stroke="#9b9b96" strokeWidth="2" strokeDasharray="4 7" />
      <path d="M152 8C148 28 148 40 160 55C172 40 172 28 168 8" fill="none" stroke="#9b9b96" strokeWidth="2" />

      {ribbon ? (
        <g fill="none" stroke={`url(#metal-${variant})`} strokeWidth="8" strokeLinecap="round">
          <path d="M132 54C145 70 170 72 184 94" />
          <path d="M188 54C175 70 150 72 136 94" />
        </g>
      ) : (
        <rect x="145" y="50" width="30" height="34" rx={geometric ? 4 : 15} fill="none" stroke="#a8aaac" strokeWidth="5" />
      )}

      {halo && (
        <ellipse cx="160" cy="157" rx="71" ry="83" fill="none" stroke="#bfc1c2" strokeWidth="4" />
      )}

      {cluster && (
        <g fill="#f7f7f7" stroke="#aeb1b2" strokeWidth="1.5">
          <circle cx="98" cy="119" r="8" />
          <circle cx="90" cy="151" r="7" />
          <circle cx="100" cy="188" r="8" />
          <circle cx="222" cy="119" r="8" />
          <circle cx="230" cy="151" r="7" />
          <circle cx="220" cy="188" r="8" />
        </g>
      )}

      {geometric ? (
        <rect x="111" y="88" width="98" height="132" rx="18" fill={`url(#stone-${variant})`} stroke="#bcc0c1" strokeWidth="7" />
      ) : bezel ? (
        <ellipse cx="160" cy="157" rx="58" ry="72" fill={`url(#stone-${variant})`} stroke="#b5b8ba" strokeWidth="10" />
      ) : (
        <ellipse cx="160" cy="157" rx="55" ry="70" fill={`url(#stone-${variant})`} stroke="#c6c8c9" strokeWidth="5" />
      )}

      {!bezel && !geometric && (
        <g fill="#f8f8f8" stroke="#aeb1b2" strokeWidth="1.3">
          <circle cx="160" cy="84" r="5" />
          <circle cx="160" cy="230" r="5" />
          <circle cx="103" cy="157" r="5" />
          <circle cx="217" cy="157" r="5" />
        </g>
      )}

      <path d="M130 118L190 198" stroke="rgba(255,255,255,.24)" strokeWidth="5" />
      <path d="M122 150L188 105" stroke="rgba(255,255,255,.18)" strokeWidth="4" />
    </svg>
  );
}

export default function DirectionsScreen({
  directions,
  selectedDirection,
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
      <div className={styles.welcomeHead}>
        <span className={styles.eyebrow}>כיווני עיצוב</span>
        <h2 className={styles.heading}>בחר כיוון להמשך</h2>
        <p className={styles.subheading}>שלוש הצעות סביב האבן והבקשה שכתבת</p>
      </div>

      <div className={styles.directionsGrid}>
        {list.map((direction, index) => {
          const selected = selectedDirection === direction.conceptId;
          const variant = SKETCH_VARIANTS[index % SKETCH_VARIANTS.length];
          return (
            <div
              key={direction.conceptId}
              className={`${styles.directionCard} ${selected ? styles.directionCardSelected : ''}`}
              onClick={() => onSelectDirection(direction.conceptId)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelectDirection(direction.conceptId);
              }}
            >
              <span className={styles.directionNumber}>0{index + 1}</span>
              <div className={styles.directionImageWrap}>
                <ConceptSketch variant={variant} />
              </div>
              <h3 className={styles.directionTitle}>{direction.conceptName}</h3>
              <p className={styles.directionText}>{direction.shortDescription}</p>
              {direction.productionNotes && (
                <p className={styles.directionProductionNote}>{direction.productionNotes}</p>
              )}
              <button
                type="button"
                className={`${styles.directionChoose} ${selected ? styles.directionChooseSelected : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  choose(direction);
                }}
              >
                בחר להמשך
              </button>
            </div>
          );
        })}
      </div>

      <div className={styles.directionsFooter}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          חזור וערוך
        </button>
        <button type="button" className={styles.ghostBtn} onClick={onRegenerate}>
          הצע שלושה אחרים
        </button>
      </div>
    </div>
  );
}
