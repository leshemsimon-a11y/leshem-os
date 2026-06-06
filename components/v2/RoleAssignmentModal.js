/**
 * LESHEM.S OS — v2 Role Assignment Modal — v2.4
 *
 * Shown when the user clicks "התחל בניית תכשיט" in the Work Tray.
 * Lists every tray item with a per-item role selector:
 *   אבן מרכזית / אבני צד / רכיב / חלק תכשיט / לא להשתמש כרגע
 *
 * Defaults are suggested by asset type (suggestRole) and overridable.
 * On confirm, emits assignments[] = [{ asset, role }] to the parent,
 * which builds the JewelryBuildDraft.
 *
 * No commerce language. No pricing. No Airtable writes.
 */

import { useState } from 'react';
import styles from './RoleAssignmentModal.module.css';
import { getAssetDisplayTitle } from '../../lib/v2/taxonomyHelpers';
import { BUILD_ROLE_OPTIONS, suggestRole } from '../../lib/v2/jewelryBuildDraft';

const PLACEHOLDER_ICONS = {
  white_diamond:       '◇',
  fancy_color_diamond: '◈',
  colored_gemstone:    '○',
  parcel:              '⊡',
  part:                '⊟',
  finished_jewelry:    '◎',
};

function ItemThumb({ asset }) {
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
    <div className={styles.thumb}>
      {imageSrc
        ? <img src={imageSrc} alt="" className={styles.thumbImg} />
        : <span aria-hidden="true">{icon}</span>}
    </div>
  );
}

export default function RoleAssignmentModal({ items, onConfirm, onCancel }) {
  // Initialize role map keyed by tray index (stable for this modal session)
  const [roles, setRoles] = useState(() =>
    (items || []).map((asset) => suggestRole(asset))
  );

  if (!items || items.length === 0) return null;

  function setRoleAt(idx, role) {
    setRoles((prev) => prev.map((r, i) => (i === idx ? role : r)));
  }

  function handleConfirm() {
    const assignments = items.map((asset, idx) => ({ asset, role: roles[idx] }));
    onConfirm(assignments);
  }

  // Count how many will actually be included (not "skip")
  const includedCount = roles.filter((r) => r !== 'skip').length;

  return (
    <div
      className={styles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className={styles.modal} role="dialog" aria-label="הקצאת תפקידים">
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={styles.title}>התחל בניית תכשיט</div>
            <div className={styles.subtitle}>הקצה תפקיד לכל פריט במגש</div>
          </div>
          <button className={styles.closeBtn} onClick={onCancel} aria-label="סגור">×</button>
        </div>

        {/* Item list */}
        <div className={styles.itemList}>
          {items.map((asset, idx) => {
            const title = getAssetDisplayTitle(asset);
            const carat = asset.caratWeight || asset.totalCaratWeight;
            const meta = [asset.color, asset.clarity, carat ? `${carat} קרט` : null]
              .filter(Boolean).join(' · ');
            return (
              <div key={asset._airtableId || idx} className={styles.itemRow}>
                <div className={styles.itemHead}>
                  <ItemThumb asset={asset} />
                  <div className={styles.itemInfo}>
                    <div className={styles.itemTitle}>{title}</div>
                    {meta && <div className={styles.itemMeta}>{meta}</div>}
                  </div>
                </div>

                <div className={styles.roleChips} role="group" aria-label={`תפקיד עבור ${title}`}>
                  {BUILD_ROLE_OPTIONS.map((opt) => {
                    const active = roles[idx] === opt.role;
                    const isSkip = opt.role === 'skip';
                    return (
                      <button
                        key={opt.role}
                        type="button"
                        className={`${styles.roleChip} ${active ? styles.roleChipActive : ''} ${isSkip && active ? styles.roleChipSkipActive : ''}`}
                        onClick={() => setRoleAt(idx, opt.role)}
                        title={opt.sub}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerSummary} dir="rtl">
            {includedCount === 0
              ? 'לא נבחרו פריטים לבנייה'
              : `${includedCount} פריטים ייכללו בטיוטה`}
          </div>
          <div className={styles.footerActions}>
            <button className={styles.cancelBtn} onClick={onCancel}>ביטול</button>
            <button
              className={styles.confirmBtn}
              onClick={handleConfirm}
              disabled={includedCount === 0}
            >
              צור טיוטת בנייה
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
