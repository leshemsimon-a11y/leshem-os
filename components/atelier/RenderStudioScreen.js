import styles from './atelier.module.css';
import PendantVisualizer from './PendantVisualizer';

const SCENES = [
  { id: 'catalog', label: 'קטלוג לבן', hint: 'רקע נקי ואור רך' },
  { id: 'client', label: 'פרזנטציה', hint: 'גוון חם ואלגנטי' },
  { id: 'macro', label: 'מאקרו', hint: 'אבן ושיבוץ מקרוב' },
  { id: 'editorial', label: 'אדיטוריאל', hint: 'תאורה מכוונת' },
];

const ANGLES = [
  { id: 'front', label: 'חזית' },
  { id: 'threeQuarter', label: 'שלושה רבעים' },
  { id: 'side', label: 'פרופיל' },
];

const FORMATS = [
  { id: 'square', label: 'ריבוע' },
  { id: 'portrait', label: 'לאורך' },
  { id: 'landscape', label: 'לרוחב' },
];

const COUNTS = [1, 2, 3];

function statusCopy(renderState) {
  if (!renderState) return '';
  if (renderState.status === 'preparing') return 'מכין את מפרט הייצור…';
  if (renderState.status === 'generating') {
    return `יוצר הדמיה ${renderState.progress || 1} מתוך ${renderState.total || 1}…`;
  }
  if (renderState.status === 'saving') return 'שומר את התוצאה בתיק היצירה…';
  return renderState.message || '';
}

export default function RenderStudioScreen({
  direction,
  designConfig,
  stoneShape,
  stoneType,
  stoneTypeHe,
  specSummaryHe,
  renderConfig,
  onUpdateConfig,
  onBack,
  onGenerate,
  renderState,
}) {
  const busy = ['preparing', 'generating', 'saving'].includes(renderState && renderState.status);
  const results = renderState && Array.isArray(renderState.results) ? renderState.results : [];
  const prepared = renderState && renderState.renderPackage;
  const statusText = statusCopy(renderState);
  const specLine = (prepared && prepared.specSummaryHe) || specSummaryHe || '';
  const warnings = (prepared && prepared.warnings) || [];

  return (
    <div className={styles.renderWorkbench}>
      <section className={styles.renderCanvasPane}>
        <div className={styles.renderCanvasHead}>
          <div>
            <span className={styles.eyebrow}>שולחן ההדמיה</span>
            <h1 className={styles.renderCanvasTitle}>{direction?.conceptName || 'הכיוון הנבחר'}</h1>
          </div>
        </div>

        <div className={`${styles.renderCanvas} ${results.length ? styles.renderCanvasWithResult : ''}`}>
          {results.length ? (
            <div className={styles.renderResultsGrid} data-count={results.length}>
              {results.map((result, index) => (
                <figure key={`${result.dataUrl.slice(0, 32)}-${index}`} className={styles.renderResultCard}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={result.dataUrl} alt={`הדמיה ${index + 1}`} />
                  <figcaption>
                    <span>הדמיה {index + 1}</span>
                    <small>{result.saved ? 'נשמרה בתיק היצירה' : 'תוצאה זמנית'}</small>
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className={styles.renderConceptPreview}>
              <PendantVisualizer
                config={designConfig}
                shape={stoneShape}
                stoneType={stoneType}
                stoneTypeHe={stoneTypeHe}
              />
              <div>
                <span>המחשת מבנה</span>
                <small>התמונה תוחלף בהדמיה המלאה</small>
              </div>
            </div>
          )}

          {busy ? (
            <div className={styles.renderBusyOverlay} role="status">
              <span className={styles.renderSpinner} />
              <strong>{statusText}</strong>
              <small>היצירה נשארת פתוחה. אין צורך ללחוץ שוב.</small>
            </div>
          ) : null}
        </div>

        {specLine ? (
          <div className={styles.specStrip}>
            <span className={styles.specStripLabel}>מפרט הייצור</span>
            <p>{specLine}</p>
          </div>
        ) : null}

        {renderState && renderState.status === 'error' ? (
          <div className={styles.renderError} role="alert">
            <strong>ההדמיה לא הושלמה</strong>
            <span>{renderState.message}</span>
          </div>
        ) : null}
        {renderState && renderState.status === 'done' ? (
          <div className={styles.renderSuccess} role="status">
            <strong>התוצאות מוכנות ונשמרו</strong>
            <span>אפשר לחזור לכיוונים, ליצור וריאציה נוספת או לפתוח מאוחר יותר דרך “היצירות שלי”.</span>
          </div>
        ) : null}
      </section>

      <aside className={styles.renderControlsPane}>
        <div className={styles.renderControlsHead}>
          <span className={styles.eyebrow}>הצגת היצירה</span>
          <h2>איך לצלם את התכשיט?</h2>
          <p>המפרט כבר נעול. כאן בוחרים רק איך רואים אותו.</p>
        </div>

        <div className={styles.renderControlGroup}>
          <span className={styles.controlLabel}>סצנה</span>
          <div className={styles.renderSceneGrid}>
            {SCENES.map((scene) => {
              const active = renderConfig.scene === scene.id;
              return (
                <button
                  key={scene.id}
                  type="button"
                  className={`${styles.renderSceneCard} ${active ? styles.renderSceneCardActive : ''}`}
                  onClick={() => onUpdateConfig({ scene: scene.id })}
                  aria-pressed={active}
                >
                  <span className={styles.renderSceneVisual} data-scene={scene.id} />
                  <strong>{scene.label}</strong>
                  <small>{scene.hint}</small>
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.renderControlGroup}>
          <span className={styles.controlLabel}>זווית</span>
          <div className={styles.segmentedControl}>
            {ANGLES.map((angle) => (
              <button
                key={angle.id}
                type="button"
                className={renderConfig.angle === angle.id ? styles.segmentActive : ''}
                onClick={() => onUpdateConfig({ angle: angle.id })}
                aria-pressed={renderConfig.angle === angle.id}
              >
                {angle.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.renderControlColumns}>
          <div className={styles.renderControlGroup}>
            <span className={styles.controlLabel}>פורמט</span>
            <div className={styles.segmentedControl}>
              {FORMATS.map((format) => (
                <button
                  key={format.id}
                  type="button"
                  className={renderConfig.format === format.id ? styles.segmentActive : ''}
                  onClick={() => onUpdateConfig({ format: format.id })}
                  aria-pressed={renderConfig.format === format.id}
                >
                  {format.label}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.renderControlGroup}>
            <span className={styles.controlLabel}>כמה תמונות</span>
            <div className={styles.segmentedControl}>
              {COUNTS.map((count) => (
                <button
                  key={count}
                  type="button"
                  className={renderConfig.count === count ? styles.segmentActive : ''}
                  onClick={() => onUpdateConfig({ count })}
                  aria-pressed={renderConfig.count === count}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        </div>

        {warnings.length ? (
          <div className={styles.specWarnings}>
            {warnings.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        ) : null}

        <div className={styles.renderPrimaryArea}>
          <button type="button" className={styles.renderPrimaryBtn} onClick={onGenerate} disabled={busy}>
            {busy ? 'יוצר הדמיה…' : results.length ? 'צור וריאציה נוספת' : 'צור הדמיה'}
          </button>
        </div>
      </aside>

      <div className={styles.bottomNav}>
        <button type="button" className={styles.backBtn} onClick={onBack} disabled={busy}>חזור לכיוונים</button>
        <span className={styles.renderFooterNote}>המפרט נשמר אוטומטית בתיק היצירה</span>
      </div>
    </div>
  );
}
