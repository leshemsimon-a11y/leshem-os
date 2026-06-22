// components/studio/inventory/InventoryDraftsPanel.js
//
// LESHEM.S OS — Inventory Drafts Panel (Clean 4B.4b)
//
// Renders the "טיוטות מלאי מנכסים" section on the Inventory page: inventory
// DRAFTS created from Asset Library objects. This is the visible end of the
// lightweight local bridge — it does NOT read or write the real Airtable
// inventory. Each draft offers: open the linked asset, add to Work Tray, and
// create a Design Project. Hidden entirely when there are no drafts.
//
// Local only. No Airtable, no schema, no pricing, no PDF, no network.

import * as React from 'react';
import { useRouter } from 'next/router';
import { tokens } from '../shared/tokens';
import { INV_DRAFTS_HE, ASSETS_OBJ_HE } from '../../../lib/studio/labels';
import { createUseInventoryDrafts } from '../../../lib/studio/inventoryDraftsStore';
import { createUseWorkTray } from '../../../lib/studio/workTray';
import { createUseDesignProjects } from '../../../lib/studio/designProjects';
import { createUseAssets } from '../../../lib/studio/assetsStore';
import { assetObjectToTrayItem } from '../../../lib/studio/assetWorkflowBridge';
import AssetThumbnail from '../assets/AssetThumbnail';

const useInventoryDrafts = createUseInventoryDrafts(React);
const useWorkTray = createUseWorkTray(React);
const useDesignProjects = createUseDesignProjects(React);
const useAssets = createUseAssets(React);

export default function InventoryDraftsPanel() {
  const router = useRouter();
  const drafts = useInventoryDrafts();
  const tray = useWorkTray();
  const projects = useDesignProjects();
  const store = useAssets();
  const [toast, setToast] = React.useState(null);

  const flash = (m) => {
    setToast(m);
    setTimeout(() => setToast(null), 1800);
  };

  // Nothing to show → render nothing (keeps the inventory page unchanged).
  if (!drafts.hydrated || drafts.drafts.length === 0) return null;

  const openAsset = () => router.push('/studio/assets');

  const addToTray = (draft) => {
    const obj = store.hydrated
      ? store.objects.find((o) => o.objectId === draft.assetObjectId)
      : null;
    if (!obj) {
      // The asset is the source of truth for the tray item; if it's gone, guide
      // the user to the library rather than adding an empty item.
      openAsset();
      return;
    }
    const files = store.filesByObject[obj.objectId] || [];
    const item = assetObjectToTrayItem(obj, files);
    if (item && !tray.has(item.id)) {
      tray.addItem(item);
      flash(INV_DRAFTS_HE.inTray);
    }
  };

  const createProject = async (draft) => {
    const obj = store.hydrated
      ? store.objects.find((o) => o.objectId === draft.assetObjectId)
      : null;
    if (!obj) {
      openAsset();
      return;
    }
    const files = store.filesByObject[obj.objectId] || [];
    const project = await projects.createFromAsset(obj, files);
    if (project && project.id) {
      await store.linkObjectToProject(obj.objectId, project.id);
      router.push('/studio/projects');
    }
  };

  return (
    <section style={styles.wrap} dir="rtl">
      <div style={styles.head}>
        <h2 style={styles.title}>{INV_DRAFTS_HE.sectionTitle}</h2>
        <span style={styles.count}>{drafts.drafts.length}</span>
      </div>
      <p style={styles.caption}>{INV_DRAFTS_HE.sectionCaption}</p>

      <div style={styles.grid}>
        {drafts.drafts.map((d) => {
          const ownerLabel =
            d.ownerContextType === 'internal'
              ? INV_DRAFTS_HE.ownerInternal
              : `${INV_DRAFTS_HE.ownerClientPrefix}${d.linkedClientName || ''}`.trim();
          const obj =
            store.hydrated && store.objects.find((o) => o.objectId === d.assetObjectId);
          const item = obj
            ? assetObjectToTrayItem(obj, store.filesByObject[obj.objectId] || [])
            : null;
          const inTray = item && tray.has(item.id);
          return (
            <div key={d.inventoryDraftId} style={styles.card}>
              <div style={styles.cardHead}>
                <AssetThumbnail
                  fileId={d.primaryFileId}
                  getFileUrl={store.getFileUrl}
                  alt={d.title}
                  size={48}
                />
                <div style={styles.idCol}>
                  <span style={styles.name}>{d.title}</span>
                  <span style={styles.sub}>
                    {(d.objectType && ASSETS_OBJ_HE.objectType[d.objectType]) || INV_DRAFTS_HE.createdFromAsset}
                    {' · '}
                    {ownerLabel}
                  </span>
                </div>
                <span style={styles.draftBadge}>{INV_DRAFTS_HE.draftBadge}</span>
              </div>

              <div style={styles.actions}>
                <button type="button" onClick={openAsset} style={styles.ghost}>
                  {INV_DRAFTS_HE.openAsset}
                </button>
                <button
                  type="button"
                  onClick={() => addToTray(d)}
                  style={{ ...styles.ghost, ...(inTray ? styles.disabled : null) }}
                  disabled={inTray}
                >
                  {inTray ? INV_DRAFTS_HE.inTray : INV_DRAFTS_HE.addToTray}
                </button>
                <button type="button" onClick={() => createProject(d)} style={styles.gold}>
                  {INV_DRAFTS_HE.createProject}
                </button>
                <button type="button" onClick={() => drafts.remove(d.inventoryDraftId)} style={styles.removeBtn}>
                  {INV_DRAFTS_HE.remove}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {toast && <div style={styles.toast}>{toast}</div>}
    </section>
  );
}

const styles = {
  wrap: {
    marginBottom: '28px', padding: '18px', background: tokens.color.pearl,
    border: `1px solid ${tokens.color.goldFaint}`, borderRadius: tokens.radius.lg,
  },
  head: { display: 'flex', alignItems: 'center', gap: '10px' },
  title: { fontFamily: tokens.font.display, fontWeight: 700, fontSize: '22px', color: tokens.color.charcoal, margin: 0 },
  count: {
    fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 700, color: tokens.color.gold,
    background: tokens.color.goldFaint, border: `1px solid ${tokens.color.goldSoft}`, borderRadius: '999px', padding: '2px 10px',
  },
  caption: { fontFamily: tokens.font.body, fontSize: '13px', lineHeight: 1.6, color: tokens.color.inkSoft, margin: '8px 0 16px', maxWidth: '620px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' },
  card: {
    display: 'flex', flexDirection: 'column', gap: '12px', padding: '14px',
    background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.lg, boxShadow: tokens.shadow.soft,
  },
  cardHead: { display: 'flex', alignItems: 'center', gap: '12px' },
  idCol: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 },
  name: { fontFamily: tokens.font.display, fontSize: '17px', color: tokens.color.charcoal, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  sub: { fontFamily: tokens.font.body, fontSize: '12px', color: tokens.color.inkFaint },
  draftBadge: {
    fontFamily: tokens.font.body, fontSize: '11px', fontWeight: 600, color: tokens.color.gold,
    background: tokens.color.goldFaint, borderRadius: '999px', padding: '2px 8px', flexShrink: 0,
  },
  actions: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  ghost: {
    minHeight: '40px', padding: '8px 14px', fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 600,
    color: tokens.color.inkSoft, background: 'transparent', border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md, cursor: 'pointer',
  },
  gold: {
    minHeight: '40px', padding: '8px 14px', fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 700,
    color: tokens.color.charcoal, background: tokens.color.goldFaint, border: `1px solid ${tokens.color.gold}`, borderRadius: tokens.radius.md, cursor: 'pointer',
  },
  removeBtn: {
    minHeight: '40px', padding: '8px 12px', fontFamily: tokens.font.body, fontSize: '12px', fontWeight: 600,
    color: tokens.color.inkFaint, background: 'transparent', border: 'none', cursor: 'pointer',
  },
  disabled: { opacity: 0.5, cursor: 'not-allowed' },
  toast: {
    marginTop: '12px', fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 600, color: tokens.color.charcoal,
    background: tokens.color.sageFaint, border: `1px solid ${tokens.color.sage}`, borderRadius: tokens.radius.md, padding: '8px 14px', textAlign: 'center',
  },
};
