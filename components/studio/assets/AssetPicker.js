// components/studio/assets/AssetPicker.js
//
// LESHEM.S OS — Asset Picker (Clean 4B.4b)
//
// A modal that lets the jeweller PULL assets from the library into the work
// process (rather than only pushing from the library). Used from the Work Tray
// ("בחר נכס מספריית נכסים") and the Design Studio ("הוסף נכס מספריית נכסים").
//
// Features: search by title / catalog code / tag, filter by object type and
// destination, primary-image thumbnail, owner/client context, and per-asset
// actions — add to Work Tray, link to the currently open Design Project (when
// one is open), and open asset details (routes to the library).
//
// Local only. Uses the existing assets store (IndexedDB metadata + getFileUrl),
// the work tray's addItem (asset-bridge path — kept separate from addToTray),
// and the design projects store for linking. No Airtable, no network.

import * as React from 'react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { tokens } from '../shared/tokens';
import { PICKER_HE, ASSETS_OBJ_HE, INTAKE_HE } from '../../../lib/studio/labels';
import {
  createUseAssets,
  OBJECT_TYPE_VALUES,
  DESTINATION_TYPE_VALUES,
} from '../../../lib/studio/assetsStore';
import { assetObjectToTrayItem } from '../../../lib/studio/assetWorkflowBridge';
import { resolvePrimaryImageFileId } from '../../../lib/studio/assetImage';
import AssetThumbnail from './AssetThumbnail';

const useAssets = createUseAssets(React);

function matchesQuery(o, q) {
  if (!q) return true;
  const hay = [
    o.title,
    o.catalogCode,
    ...(Array.isArray(o.tags) ? o.tags : []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return hay.includes(q);
}

export default function AssetPicker({
  open,
  onClose,
  tray,
  projectsStore,
  currentProjectId,
}) {
  const router = useRouter();
  const store = useAssets();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [destFilter, setDestFilter] = useState('all');
  const [toast, setToast] = useState(null);

  const flash = (m) => {
    setToast(m);
    setTimeout(() => setToast(null), 1800);
  };

  const objects = store.hydrated ? store.objects.filter((o) => o.status !== 'archived') : [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return objects.filter((o) => {
      if (!matchesQuery(o, q)) return false;
      if (typeFilter !== 'all' && o.objectType !== typeFilter) return false;
      if (destFilter !== 'all' && (o.destinationType || 'undecided') !== destFilter) return false;
      return true;
    });
  }, [objects, query, typeFilter, destFilter]);

  if (!open) return null;

  const addToTray = (o) => {
    const files = store.filesByObject[o.objectId] || [];
    const item = assetObjectToTrayItem(o, files);
    if (item && !tray.has(item.id)) {
      tray.addItem(item);
      flash(PICKER_HE.inTray);
    }
  };

  const linkToProject = async (o) => {
    if (!currentProjectId) return;
    const files = store.filesByObject[o.objectId] || [];
    await projectsStore.linkAssetObject(
      currentProjectId,
      o.objectId,
      files.filter((f) => f.status === 'approved').map((f) => f.fileId)
    );
    await store.linkObjectToProject(o.objectId, currentProjectId);
    flash(PICKER_HE.linkedToProject);
  };

  const openDetails = () => router.push('/studio/assets');

  return (
    <div style={styles.overlay} dir="rtl" role="dialog" aria-modal="true">
      <div style={styles.modal}>
        <div style={styles.head}>
          <div>
            <h2 style={styles.title}>{PICKER_HE.title}</h2>
            <p style={styles.subtitle}>{PICKER_HE.subtitle}</p>
          </div>
          <button type="button" onClick={onClose} style={styles.close} aria-label="close">×</button>
        </div>

        <div style={styles.controls}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={PICKER_HE.searchPlaceholder}
            style={styles.search}
            dir="rtl"
          />
          <div style={styles.filterRow}>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={styles.select} dir="rtl">
              <option value="all">{PICKER_HE.filterType}: {PICKER_HE.all}</option>
              {OBJECT_TYPE_VALUES.map((t) => (
                <option key={t} value={t}>{ASSETS_OBJ_HE.objectType[t] || t}</option>
              ))}
            </select>
            <select value={destFilter} onChange={(e) => setDestFilter(e.target.value)} style={styles.select} dir="rtl">
              <option value="all">{PICKER_HE.filterDestination}: {PICKER_HE.all}</option>
              {DESTINATION_TYPE_VALUES.map((d) => (
                <option key={d} value={d}>{(INTAKE_HE.destinationOptions && INTAKE_HE.destinationOptions[d]) || d}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={styles.list}>
          {!store.hydrated ? (
            <p style={styles.empty}>טוען…</p>
          ) : objects.length === 0 ? (
            <p style={styles.empty}>{PICKER_HE.emptyLibrary}</p>
          ) : filtered.length === 0 ? (
            <p style={styles.empty}>{PICKER_HE.empty}</p>
          ) : (
            filtered.map((o) => {
              const files = store.filesByObject[o.objectId] || [];
              const item = assetObjectToTrayItem(o, files);
              const inTray = item && tray.has(item.id);
              const previewFileId = resolvePrimaryImageFileId(o, files);
              const ownerLabel =
                o.ownerContextType === 'internal'
                  ? PICKER_HE.ownerInternal
                  : (o.linkedClientName || PICKER_HE.ownerClient);
              return (
                <div key={o.objectId} style={styles.row}>
                  <AssetThumbnail
                    fileId={previewFileId}
                    getFileUrl={store.getFileUrl}
                    alt={o.title}
                    size={52}
                  />
                  <div style={styles.idCol}>
                    <span style={styles.name}>{o.title}</span>
                    <span style={styles.sub}>
                      {ASSETS_OBJ_HE.objectType[o.objectType] || o.objectType}
                      {' · '}
                      {ownerLabel}
                    </span>
                    {o.catalogCode && <span style={styles.code}>{o.catalogCode}</span>}
                  </div>
                  <div style={styles.actions}>
                    <button
                      type="button"
                      onClick={() => addToTray(o)}
                      style={{ ...styles.actionBtn, ...(inTray ? styles.actionDisabled : null) }}
                      disabled={inTray}
                    >
                      {inTray ? PICKER_HE.inTray : PICKER_HE.addToTray}
                    </button>
                    <button
                      type="button"
                      onClick={() => linkToProject(o)}
                      style={{ ...styles.actionGhost, ...(!currentProjectId ? styles.actionDisabled : null) }}
                      disabled={!currentProjectId}
                      title={!currentProjectId ? PICKER_HE.noOpenProject : ''}
                    >
                      {PICKER_HE.linkToProject}
                    </button>
                    <button type="button" onClick={openDetails} style={styles.actionGhost}>
                      {PICKER_HE.openDetails}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {toast && <div style={styles.toast}>{toast}</div>}

        <div style={styles.footer}>
          <button type="button" onClick={onClose} style={styles.ghost}>{PICKER_HE.close}</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1050, background: 'rgba(20,22,26,0.42)',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 14px', overflowY: 'auto',
  },
  modal: {
    width: '100%', maxWidth: '600px', background: tokens.color.ivory, border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.lg, boxShadow: tokens.shadow.lift, display: 'flex', flexDirection: 'column',
    gap: '12px', padding: '18px', maxHeight: 'calc(100vh - 48px)',
  },
  head: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' },
  title: { fontFamily: tokens.font.display, fontSize: '22px', color: tokens.color.charcoal, margin: 0 },
  subtitle: { fontFamily: tokens.font.body, fontSize: '13px', color: tokens.color.inkSoft, margin: '4px 0 0' },
  close: { fontFamily: tokens.font.body, fontSize: '24px', lineHeight: 1, color: tokens.color.inkSoft, background: 'transparent', border: 'none', cursor: 'pointer' },
  controls: { display: 'flex', flexDirection: 'column', gap: '8px' },
  search: {
    boxSizing: 'border-box', width: '100%', fontFamily: tokens.font.body, fontSize: '14px', color: tokens.color.ink,
    background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md,
    padding: '11px 13px', minHeight: '46px',
  },
  filterRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  select: {
    flex: 1, minWidth: '150px', fontFamily: tokens.font.body, fontSize: '13px', color: tokens.color.ink,
    background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md,
    padding: '9px 11px', minHeight: '44px',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' },
  empty: { fontFamily: tokens.font.body, fontSize: '14px', color: tokens.color.inkFaint, textAlign: 'center', padding: '20px 0' },
  row: {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
    background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md,
  },
  idCol: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 },
  name: { fontFamily: tokens.font.display, fontSize: '16px', color: tokens.color.charcoal, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  sub: { fontFamily: tokens.font.body, fontSize: '12px', color: tokens.color.inkFaint },
  code: { fontFamily: tokens.font.body, fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em', color: tokens.color.gold },
  actions: { display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 },
  actionBtn: {
    minHeight: '38px', padding: '8px 14px', fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 700,
    color: tokens.color.charcoal, background: tokens.color.goldFaint, border: `1px solid ${tokens.color.gold}`,
    borderRadius: tokens.radius.md, cursor: 'pointer', whiteSpace: 'nowrap',
  },
  actionGhost: {
    minHeight: '38px', padding: '8px 14px', fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 600,
    color: tokens.color.inkSoft, background: 'transparent', border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md, cursor: 'pointer', whiteSpace: 'nowrap',
  },
  actionDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  toast: {
    fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 600, color: tokens.color.charcoal,
    background: tokens.color.sageFaint, border: `1px solid ${tokens.color.sage}`, borderRadius: tokens.radius.md,
    padding: '8px 14px', textAlign: 'center',
  },
  footer: { display: 'flex', justifyContent: 'flex-end', borderTop: `1px solid ${tokens.color.cardEdge}`, paddingTop: '12px' },
  ghost: {
    minHeight: '44px', padding: '10px 18px', fontFamily: tokens.font.body, fontSize: '14px', fontWeight: 600,
    color: tokens.color.inkSoft, background: 'transparent', border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md, cursor: 'pointer',
  },
};
