// components/studio/assets/AttachToActiveWork.js
//
// LESHEM.S OS — Clean 8C: «צרף לתיק פעיל» — attach an Asset Object to the
// ACTIVE Work File with a chosen role.
//
// Persistence goes ONLY through the EXISTING public designProjects API
// (updateProject), writing into the project's EXISTING reserved `assets`
// array (preserved by normalizeProject since Clean 4A). No new store, no new
// persistence key, no store internals touched.
//
// When no active Work File exists, the control shows a disabled state with a
// helper line explaining how to enable it.

import * as React from 'react';
import { useState } from 'react';
import { tokens } from '../shared/tokens';
import { createUseActiveWork } from '../../../lib/studio/activeWorkStore';
import { getProject, updateProject } from '../../../lib/studio/designProjects';
import { resolvePrimaryImageFileId } from '../../../lib/studio/assetImage';
import {
  ATTACHED_ROLE,
  ATTACHED_ROLE_VALUES,
  ATTACHED_ROLE_HE,
  buildAttachedAssetRecord,
  upsertAttachedAsset,
  // Clean 8G — used to seed the attach role from the asset's persisted role.
  isValidAttachedRole,
} from '../../../lib/studio/attachedAssets';

const useActiveWork = createUseActiveWork(React);

const HE = Object.freeze({
  attach: 'צרף לתיק פעיל',
  noActive: 'אין תיק פעיל. צור או פתח תיק עבודה כדי לצרף נכס.',
  rolePlaceholder: 'תפקיד הנכס בתיק',
  attachedToast: 'הנכס צורף לתיק הפעיל ✓',
  updatedToast: 'תפקיד הנכס עודכן בתיק הפעיל ✓',
  attachedToPrefix: 'מצורף לתיק: ',
});

export default function AttachToActiveWork({ object, files }) {
  const { activeWorkId } = useActiveWork();
  // Clean 8G — the attach role starts from the asset's PERSISTED role (the
  // intake panel's classification) when valid; the manual select still
  // overrides freely per attach.
  const persistedRole = isValidAttachedRole(object.assetRole) ? object.assetRole : null;
  const [role, setRole] = useState(persistedRole || ATTACHED_ROLE.DESIGN_REFERENCE);
  // Follow later role classifications made in the intake panel (state only;
  // never fights an explicit manual selection mid-render cycle beyond this).
  React.useEffect(() => {
    if (persistedRole) setRole(persistedRole);
  }, [persistedRole]);
  const [toast, setToast] = useState(null);
  const timer = React.useRef(null);
  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  // Resolve the active project fresh at render (localStorage-backed read
  // through the existing public getProject; cheap and always current).
  const activeProject = activeWorkId ? getProject(activeWorkId) : null;
  const hasActive = Boolean(activeProject);
  const alreadyAttached =
    hasActive &&
    Array.isArray(activeProject.assets) &&
    activeProject.assets.some((a) => a && a.assetId === object.objectId);

  const flash = (m) => {
    setToast(m);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2400);
  };

  const attach = () => {
    if (!hasActive) return;
    const previewFileId = resolvePrimaryImageFileId(object, files);
    const record = buildAttachedAssetRecord({ object, files, role, previewFileId });
    if (!record) return;
    const next = upsertAttachedAsset(activeProject.assets, record);
    const updated = updateProject(activeProject.id, { assets: next });
    if (updated) flash(alreadyAttached ? HE.updatedToast : HE.attachedToast);
  };

  return (
    <div style={styles.wrap} dir="rtl">
      {hasActive ? (
        <>
          <div style={styles.row}>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={styles.select}
              dir="rtl"
              aria-label={HE.rolePlaceholder}
            >
              {ATTACHED_ROLE_VALUES.map((r) => (
                <option key={r} value={r}>
                  {ATTACHED_ROLE_HE[r]}
                </option>
              ))}
            </select>
            <button type="button" onClick={attach} style={styles.attachBtn}>
              {HE.attach}
            </button>
          </div>
          <span style={styles.target}>
            {HE.attachedToPrefix}
            {activeProject.name}
            {alreadyAttached ? ' · מצורף ✓' : ''}
          </span>
        </>
      ) : (
        <>
          <button type="button" disabled style={{ ...styles.attachBtn, ...styles.disabled }}>
            {HE.attach}
          </button>
          <span style={styles.helper}>{HE.noActive}</span>
        </>
      )}
      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: `1px dashed ${tokens.color.cardEdge}`,
  },
  row: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' },
  select: {
    flex: 1,
    minWidth: '150px',
    fontFamily: tokens.font.body,
    fontSize: '13px',
    color: tokens.color.ink,
    background: tokens.color.ivory,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    padding: '9px 12px',
    minHeight: '40px',
  },
  attachBtn: {
    minHeight: '40px',
    padding: '9px 16px',
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.gold}`,
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  disabled: { opacity: 0.5, cursor: 'not-allowed' },
  target: {
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    color: tokens.color.inkSoft,
  },
  helper: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.inkFaint,
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
