/**
 * LESHEM.S OS — v2 Work Tray — v2.3
 *
 * Changes from v2.2:
 *
 * Single-item actions (v2.3):
 *   When exactly ONE item is in the tray and it has a valid _airtableId:
 *     • "פתח במחשבון" opens a role-selection modal then navigates to MVP.
 *     • "צור תעודה" navigates directly to MVP cert flow.
 *
 * Multi-item actions:
 *   When MORE THAN ONE item is in the tray:
 *     • Calculator button is disabled with honest label:
 *       "שליחת מספר פריטים למחשבון — בשלב הבא"
 *     • Certificate button is disabled (multiple certs = future milestone).
 *   No silent first-item-only fallback. No misleading behavior.
 *
 * Add/remove/clear: unchanged from v2.2.
 * Studio tray language only. No commerce language.
 */

import { useState } from 'react';
import styles from './WorkTray.module.css';
import { useWorkTray } from '../../lib/v2/workTrayContext';
import { getAssetDisplayTitle } from '../../lib/v2/taxonomyHelpers';
import { buildCalcBridgeUrl, ROLE_OPTIONS } from '../../lib/v2/calculatorBridge';
import { buildCertBridgeUrl }               from '../../lib/v2/certificateBridge';

const PLACEHOLDER_ICONS = {
  white_diamond:       '◇',
  fancy_color_diamond: '◈',
  colored_gemstone:    '○',
  parcel:              '⊡',
  part:                '⊟',
  finished_jewelry:    '◎',
};

function TrayItemThumb({ asset }) {
  let imageSrc = null;
  if (asset.imageUrl) {
    if (Array.isArray(asset.imageUrl) && asset.imageUrl[0]) {
      imageSrc = asset.imageUrl[0].thumbnails?.small?.url || asset.imageUrl[0].url;
    } else if (typeof asset.imageUrl === 'string') {
      imageSrc = asset.imageUrl;
    }
  }
  const icon = PLACEHOLDER_ICONS[asset.stoneCategory] || PLACEHOLDER_ICONS[asset.assetType] || '◇';
  return (
    <div className={styles.trayThumb}>
      {imageSrc
        ? <img src={imageSrc} alt="" className={styles.trayThumbImg} />
        : <span aria-hidden="true">{icon}</span>
      }
    </div>
  );
}

// ─── Role selection modal (for single-item calc) ───────────────────────────────
function TrayRoleModal({ asset, onSelect, onCancel }) {
  if (!asset) return null;
  const title    = getAssetDisplayTitle(asset);
  const caratStr = asset.caratWeight
    ? ` · ${parseFloat(asset.caratWeight).toFixed(2)} קרט`
    : '';

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>השתמש במחשבון</div>
          <button className={styles.modalClose} onClick={onCancel} aria-label="סגור">×</button>
        </div>
        <div className={styles.modalSubtitle} dir="rtl">
          {title}{caratStr} — בחר תפקיד האבן במוצר
        </div>

        <div className={styles.roleList}>
          {ROLE_OPTIONS.map((opt) => (
            <button
              key={opt.role}
              className={`${styles.roleOption} ${opt.primary ? styles.roleOptionPrimary : ''}`}
              onClick={() => onSelect(opt.role)}
            >
              <span className={styles.roleIcon}>{opt.icon}</span>
              <div className={styles.roleText}>
                <div className={styles.roleLabel}>
                  {opt.label}
                  {opt.primary && (
                    <span className={styles.roleDefault}> (ברירת מחדל)</span>
                  )}
                </div>
                <div className={styles.roleSub}>{opt.sub}</div>
              </div>
            </button>
          ))}
        </div>

        <button className={styles.modalCancelBtn} onClick={onCancel}>ביטול</button>
      </div>
    </div>
  );
}

// ─── Main WorkTray ─────────────────────────────────────────────────────────────
export default function WorkTray({ onClose }) {
  const { items, itemCount, totalCaratWeight, removeItem, clearTray } = useWorkTray();
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [roleModalOpen,   setRoleModalOpen]   = useState(false);

  // Single eligible item: exactly 1 item with a valid Airtable ID
  const singleItem =
    itemCount === 1 &&
    items[0] &&
    items[0]._airtableId
      ? items[0]
      : null;

  const multipleItems = itemCount > 1;

  function handleClearConfirmed() {
    clearTray();
    setConfirmingClear(false);
  }

  function handleCalcClick() {
    // Multi-item: button is disabled — this handler should not fire
    if (!singleItem) return;
    setRoleModalOpen(true);
  }

  function handleRoleSelect(role) {
    setRoleModalOpen(false);
    if (!singleItem) return;
    window.location.href = buildCalcBridgeUrl(singleItem._airtableId, role);
  }

  function handleCertClick() {
    if (!singleItem) return;
    window.location.href = buildCertBridgeUrl(singleItem._airtableId);
  }

  return (
    <>
      {roleModalOpen && singleItem && (
        <TrayRoleModal
          asset={singleItem}
          onSelect={handleRoleSelect}
          onCancel={() => setRoleModalOpen(false)}
        />
      )}

      <div className={styles.tray} role="dialog" aria-label="מגש עבודה">
        {/* Header */}
        <div className={styles.trayHeader}>
          <div className={styles.trayTitleGroup}>
            <div className={styles.trayTitle}>מגש עבודה</div>
            <div className={styles.traySummary}>
              {itemCount === 0 ? 'ריק' : `${itemCount} פריטים · ${totalCaratWeight} קרט`}
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="סגור מגש">
            ×
          </button>
        </div>

        {/* Stats */}
        {itemCount > 0 && (
          <div className={styles.statsRow}>
            <div className={styles.statCell}>
              <div className={styles.statLabel}>פריטים</div>
              <div className={styles.statValue}>{itemCount}</div>
            </div>
            <div className={styles.statCell}>
              <div className={styles.statLabel}>משקל קרט</div>
              <div className={styles.statValue}>
                {totalCaratWeight}
                <span className={styles.statUnit}> קרט</span>
              </div>
            </div>
          </div>
        )}

        {/* Item list */}
        <div className={styles.itemList}>
          {itemCount === 0 ? (
            <div className={styles.emptyTray}>
              <div className={styles.emptyIcon}>◇</div>
              <div>המגש ריק</div>
              <div style={{ fontSize: 11, opacity: 0.5 }}>הוסף פריטים מהמלאי</div>
            </div>
          ) : (
            items.map((asset, idx) => {
              const title = getAssetDisplayTitle(asset);
              const carat = asset.caratWeight || asset.totalCaratWeight;
              return (
                <div key={asset._airtableId || idx} className={styles.trayItem}>
                  <TrayItemThumb asset={asset} />
                  <div className={styles.trayItemInfo}>
                    <div className={styles.trayItemTitle}>{title}</div>
                    <div className={styles.trayItemMeta}>
                      {[asset.color, asset.clarity, carat ? `${carat} קרט` : null]
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                  </div>
                  <button
                    className={styles.removeItemBtn}
                    onClick={() => removeItem(asset._airtableId || idx)}
                    aria-label="הסר מהמגש"
                  >
                    ×
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className={styles.trayFooter}>
          {/* Clear confirm */}
          {confirmingClear ? (
            <div className={styles.confirmBar}>
              <span>לנקות את המגש?</span>
              <button className={styles.confirmYes} onClick={handleClearConfirmed}>נקה</button>
              <button className={styles.confirmNo} onClick={() => setConfirmingClear(false)}>ביטול</button>
            </div>
          ) : (
            itemCount > 0 && (
              <button className={styles.clearBtn} onClick={() => setConfirmingClear(true)}>
                נקה מגש
              </button>
            )
          )}

          {/* ── Calculator action ── */}
          {itemCount > 0 && (
            <>
              {singleItem ? (
                /* Single item: live button */
                <button
                  className={`${styles.calcBtn} ${styles.calcBtnLive}`}
                  onClick={handleCalcClick}
                  type="button"
                >
                  פתח במחשבון
                </button>
              ) : (
                /* Multiple items: honest disabled state — no silent first-item fallback */
                <button
                  className={styles.calcBtn}
                  type="button"
                  disabled
                  aria-disabled="true"
                >
                  שליחת מספר פריטים למחשבון
                  <span className={styles.futureNote}>בשלב הבא</span>
                </button>
              )}
            </>
          )}

          {/* ── Certificate action ── */}
          {singleItem && (
            <button
              className={`${styles.certBtn} ${styles.certBtnLive}`}
              onClick={handleCertClick}
              type="button"
            >
              צור תעודה
            </button>
          )}

          {/* Multiple items: cert also disabled */}
          {multipleItems && (
            <button
              className={styles.certBtn}
              type="button"
              disabled
              aria-disabled="true"
            >
              צור תעודה
              <span className={styles.futureNote}>בחר פריט בודד</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
