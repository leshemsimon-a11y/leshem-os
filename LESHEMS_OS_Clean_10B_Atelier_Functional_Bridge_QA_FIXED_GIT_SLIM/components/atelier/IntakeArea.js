import { useRef, useState } from 'react';
import styles from './atelier.module.css';

export default function IntakeArea({ items, onAddFiles, onAddText, onRemove }) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [pasteValue, setPasteValue] = useState('');

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
      onAddFiles(e.dataTransfer.files);
    }
  };

  const handlePasteSubmit = () => {
    if (!pasteValue.trim()) return;
    onAddText(pasteValue);
    setPasteValue('');
  };

  const handleTextareaPaste = (e) => {
    const clipboardItems = e.clipboardData && e.clipboardData.items;
    if (!clipboardItems) return;
    const imageItem = Array.from(clipboardItems).find((it) => it.type && it.type.startsWith('image/'));
    if (imageItem) {
      const file = imageItem.getAsFile();
      if (file) {
        e.preventDefault();
        onAddFiles([file]);
      }
    }
  };

  const list = Array.isArray(items) ? items : [];

  return (
    <div className={styles.intakeArea}>
      <div
        className={`${styles.intakeDropzone} ${dragOver ? styles.intakeDropzoneActive : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <span className={styles.intakeDropzoneText}>גרור לכאן תמונה, סקיצה או קובץ מודל</span>
        <div className={styles.intakeDropzoneActions}>
          <button type="button" className={styles.attachBtn} onClick={() => fileInputRef.current?.click()}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 8.5V4.5C3 3.12 4.12 2 5.5 2S8 3.12 8 4.5V10a2 2 0 1 1-4 0V5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
            העלאת קובץ
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className={styles.visuallyHidden}
            onChange={(e) => {
              if (e.target.files && e.target.files.length) onAddFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      <div className={styles.intakePasteRow}>
        <input
          type="text"
          className={styles.intakePasteInput}
          placeholder="הדבק כאן טקסט או קישור רפרנס…"
          value={pasteValue}
          onChange={(e) => setPasteValue(e.target.value)}
          onPaste={handleTextareaPaste}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handlePasteSubmit();
            }
          }}
        />
        <button type="button" className={styles.intakePasteAdd} onClick={handlePasteSubmit}>
          הוסף
        </button>
      </div>

      {list.length > 0 && (
        <div className={styles.intakeChipsRow}>
          {list.map((item) => (
            <span key={item.id} className={styles.intakeChip}>
              {item.kind === 'file' && item.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.previewUrl} alt="" className={styles.intakeChipThumb} />
              ) : (
                <span className={styles.intakeChipIcon} aria-hidden="true">
                  {item.kind === 'url' ? (
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                      <path d="M6.5 9.5L9.5 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      <path d="M7.8 4.2l.9-.9a2.6 2.6 0 013.7 3.7l-1.2 1.2M8.2 11.8l-.9.9a2.6 2.6 0 01-3.7-3.7l1.2-1.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  ) : item.kind === 'text' ? (
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                      <path d="M3 4h10M3 8h10M3 12h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                      <path d="M4 2h5l3 3v9H4V2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                      <path d="M9 2v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
              )}
              <span className={styles.intakeChipBody}>
                <span className={styles.intakeChipRole}>{item.roleHe}</span>
                <span className={styles.intakeChipName}>{item.name}</span>
              </span>
              <button
                type="button"
                className={styles.intakeChipRemove}
                onClick={() => onRemove(item.id)}
                aria-label={`הסר ${item.name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
