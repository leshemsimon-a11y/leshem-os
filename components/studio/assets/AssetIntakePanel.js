// components/studio/assets/AssetIntakePanel.js
//
// LESHEM.S OS — Clean 8G: Asset Intake action area — «מה לעשות עם הנכס?».
//
// Groups the asset-decision actions on every Asset Object card:
//   • Role classification («השתמש כרפרנס», «סמן כאבן / מלאי», «סמן כמודל
//     תכשיט», «סמן כסקיצה», «סמן כקובץ לקוח», «סמן כתוצאת מדיה») — the role
//     persists on the asset object through the EXISTING public
//     assetsStore.setCatalog API (normalizeObject already preserves the
//     `assetRole` string field since Clean 4B.4a). No store internals, no
//     new persistence key.
//   • «צרף לתיק פעיל» — the EXISTING Clean 8C AttachToActiveWork flow,
//     rendered as a child of this area (behavior unchanged).
//   • «פתח פרטים» — callback to the card's existing expand action.
//   • File-type awareness line (תמונה / מודל תלת־ממד / 3DM / PDF / לא
//     מזוהה) + the 3DM future-support notice.
//
// PRESENTATIONAL + public-API calls only. Local only — no Airtable, no
// network, no commerce wording.

import * as React from 'react';
import { useState } from 'react';
import { tokens } from '../shared/tokens';
import {
  ATTACHED_ROLE,
  ATTACHED_ROLE_HE,
  ATTACHED_FILE_TYPE,
  ATTACHED_FILE_TYPE_HE,
  MODEL_3DM_NOTICE_HE,
  classifyExtension,
  isValidAttachedRole,
} from '../../../lib/studio/attachedAssets';

const HE = Object.freeze({
  title: 'מה לעשות עם הנכס?',
  currentRolePrefix: 'תפקיד הנכס: ',
  noRole: 'טרם הוגדר תפקיד לנכס',
  useAsReference: 'השתמש כרפרנס',
  markInventoryStone: 'סמן כאבן / מלאי',
  markJewelryModel: 'סמן כמודל תכשיט',
  markSketch: 'סמן כסקיצה',
  markClientFile: 'סמן כקובץ לקוח',
  markMediaResult: 'סמן כתוצאת מדיה',
  openDetails: 'פתח פרטים',
  roleSavedToast: 'תפקיד הנכס נשמר ✓',
  fileTypePrefix: 'סוג קובץ: ',
});

// Ordered role actions (label per the 8G spec; value = canonical English).
const ROLE_ACTIONS = Object.freeze([
  { role: ATTACHED_ROLE.DESIGN_REFERENCE, label: HE.useAsReference },
  { role: ATTACHED_ROLE.INVENTORY_STONE, label: HE.markInventoryStone },
  { role: ATTACHED_ROLE.JEWELRY_MODEL, label: HE.markJewelryModel },
  { role: ATTACHED_ROLE.SKETCH, label: HE.markSketch },
  { role: ATTACHED_ROLE.CLIENT_FILE, label: HE.markClientFile },
  { role: ATTACHED_ROLE.MEDIA_ASSET, label: HE.markMediaResult },
]);

// Primary file-type of the object's visible files (first non-archived file's
// extension; same "primary" notion buildAttachedAssetRecord uses).
function primaryFileType(files) {
  const list = Array.isArray(files) ? files.filter((f) => f && f.status !== 'archived') : [];
  const primary = list.find((f) => f.status === 'approved') || list[0] || null;
  if (!primary) return null;
  return classifyExtension(primary.extension || '');
}

function has3dmFile(files) {
  const list = Array.isArray(files) ? files.filter((f) => f && f.status !== 'archived') : [];
  return list.some(
    (f) => classifyExtension(f.extension || '') === ATTACHED_FILE_TYPE.MODEL_FUTURE
  );
}

export default function AssetIntakePanel({ object, files, store, onOpenDetails, children }) {
  const [toast, setToast] = useState(null);
  const timer = React.useRef(null);
  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const currentRole = isValidAttachedRole(object.assetRole) ? object.assetRole : null;
  const fileType = primaryFileType(files);
  const show3dmNotice = has3dmFile(files);

  const flash = (m) => {
    setToast(m);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2400);
  };

  // Persist the role on the asset object through the EXISTING public
  // setCatalog (whitelisted assetRole field; normalize-guarded; the assets
  // hook refreshes automatically after the wrapped call).
  const setRole = async (role) => {
    if (!store || typeof store.setCatalog !== 'function') return;
    await store.setCatalog(object.objectId, { assetRole: role });
    flash(HE.roleSavedToast);
  };

  return (
    <div style={styles.wrap} dir="rtl" aria-label={HE.title}>
      <div style={styles.headRow}>
        <span style={styles.title}>{HE.title}</span>
        <span style={styles.roleLine}>
          {currentRole ? `${HE.currentRolePrefix}${ATTACHED_ROLE_HE[currentRole]}` : HE.noRole}
        </span>
      </div>

      {fileType ? (
        <div style={styles.fileTypeRow}>
          <span style={styles.fileTypeChip}>
            {HE.fileTypePrefix}
            {ATTACHED_FILE_TYPE_HE[fileType] || ATTACHED_FILE_TYPE_HE.other}
          </span>
          {show3dmNotice ? <span style={styles.notice3dm}>{MODEL_3DM_NOTICE_HE}</span> : null}
        </div>
      ) : null}

      <div style={styles.rolesRow}>
        {ROLE_ACTIONS.map(({ role, label }) => {
          const active = currentRole === role;
          return (
            <button
              key={role}
              type="button"
              onClick={() => setRole(role)}
              style={{ ...styles.roleBtn, ...(active ? styles.roleBtnActive : null) }}
            >
              {label}
              {active ? ' ✓' : ''}
            </button>
          );
        })}
        {typeof onOpenDetails === 'function' ? (
          <button type="button" onClick={onOpenDetails} style={styles.detailsBtn}>
            {HE.openDetails}
          </button>
        ) : null}
      </div>

      {/* «צרף לתיק פעיל» — the existing Clean 8C flow, unchanged, grouped
          inside this action area. */}
      {children}

      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '10px',
    padding: '10px 12px',
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.goldFaint}`,
    borderRadius: tokens.radius.md,
  },
  headRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '10px',
    flexWrap: 'wrap',
  },
  title: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  roleLine: {
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    color: tokens.color.inkSoft,
  },
  fileTypeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  fileTypeChip: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.color.charcoal,
    background: '#FFFFFF',
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.sm,
    padding: '2px 8px',
    whiteSpace: 'nowrap',
  },
  notice3dm: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.color.inkSoft,
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.gold}`,
    borderRadius: tokens.radius.sm,
    padding: '2px 8px',
  },
  rolesRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
  },
  roleBtn: {
    minHeight: '32px',
    padding: '5px 11px',
    borderRadius: '999px',
    border: `1px solid ${tokens.color.cardEdge}`,
    background: '#FFFFFF',
    color: tokens.color.charcoal,
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  roleBtnActive: {
    border: `1px solid ${tokens.color.gold}`,
    background: tokens.color.goldFaint,
    fontWeight: 700,
  },
  detailsBtn: {
    minHeight: '32px',
    padding: '5px 13px',
    borderRadius: '999px',
    border: `1px solid ${tokens.color.charcoal}`,
    background: 'transparent',
    color: tokens.color.charcoal,
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  toast: {
    fontFamily: tokens.font.body,
    fontSize: '12.5px',
    fontWeight: 600,
    color: tokens.color.charcoal,
    background: tokens.color.sageFaint,
    border: `1px solid ${tokens.color.sage}`,
    borderRadius: tokens.radius.md,
    padding: '7px 12px',
  },
};
