// components/studio/assets/AssetNextActions.js
//
// LESHEM.S OS — Asset Next Actions (Clean 4B.3)
//
// Shows the right next steps for an Asset Object based on its destinationType:
//   inventory     → create inventory DRAFT (placeholder) / add to tray / create project
//   modelLibrary  → create model DRAFT (placeholder) / add to tray / link project
//   designProject → link existing / create new / open project
//   workTrayOnly  → add to tray (temporary)
//   inspiration   → link project / save as inspiration
//   (undecided/other) → the general bridge actions
// No IDs are exposed. Inventory/model "creation" makes a metadata-only DRAFT —
// it does NOT touch the real inventory schema. Local only.

import { useState } from 'react';
import { useRouter } from 'next/router';
import { tokens } from '../shared/tokens';
import { NEXT_ACTIONS_HE } from '../../../lib/studio/labels';
import { DESTINATION_TYPE } from '../../../lib/studio/assetsStore';
import { assetObjectToTrayItem } from '../../../lib/studio/assetWorkflowBridge';

export default function AssetNextActions({ object, files, projects, tray, projectsStore, assetsStore }) {
  const router = useRouter();
  const [linkChoice, setLinkChoice] = useState('');
  const [toast, setToast] = useState(null);

  const dest = object.destinationType || DESTINATION_TYPE.UNDECIDED;
  const trayItem = assetObjectToTrayItem(object, files);
  const inTray = trayItem && tray.items.some((it) => it.id === trayItem.id);
  const hasProjects = projects.length > 0;

  const flash = (m) => {
    setToast(m);
    setTimeout(() => setToast(null), 2400);
  };

  const addToTray = () => {
    if (trayItem && !inTray) {
      tray.addItem(trayItem);
      assetsStore.updateObject(object.objectId, { addedToWorkTray: true });
      flash(NEXT_ACTIONS_HE.addToTray + ' ✓');
    }
  };

  const createProject = async () => {
    const project = await projectsStore.createFromAsset(object, files);
    if (project && project.id) {
      await assetsStore.linkObjectToProject(object.objectId, project.id);
      if (object.objectType === 'stone' || object.objectType === 'jewelryModel') {
        if (trayItem && !inTray) tray.addItem(trayItem);
      }
      router.push('/studio/projects');
    }
  };

  const linkProject = async () => {
    if (!linkChoice) return;
    await assetsStore.linkObjectToProject(object.objectId, linkChoice);
    await projectsStore.linkAssetObject(
      linkChoice,
      object.objectId,
      files.filter((f) => f.status === 'approved').map((f) => f.fileId)
    );
    setLinkChoice('');
    flash('קושר לתיק ✓');
  };

  const createInventoryDraft = async () => {
    await assetsStore.createInventoryDraft(object.objectId);
    flash(NEXT_ACTIONS_HE.inventoryDraftCreated);
  };

  const createModelDraft = async () => {
    await assetsStore.createModelDraft(object.objectId);
    flash(NEXT_ACTIONS_HE.modelDraftCreated);
  };

  const saveInspiration = async () => {
    await assetsStore.updateObject(object.objectId, { status: 'reference' });
    flash(NEXT_ACTIONS_HE.savedInspiration);
  };

  const Btn = ({ onClick, children, gold, disabled }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{ ...(gold ? styles.gold : styles.ghost), ...(disabled ? styles.disabled : null) }}
    >
      {children}
    </button>
  );

  const TrayBtn = () => (
    <Btn onClick={addToTray} disabled={inTray} gold={false}>
      {inTray ? 'נמצא במגש ✓' : NEXT_ACTIONS_HE.addToTray}
    </Btn>
  );
  const LinkRow = () =>
    hasProjects ? (
      <div style={styles.linkRow}>
        <select value={linkChoice} onChange={(e) => setLinkChoice(e.target.value)} style={styles.select} dir="rtl">
          <option value="">{NEXT_ACTIONS_HE.linkProject}…</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <Btn onClick={linkProject} disabled={!linkChoice}>{NEXT_ACTIONS_HE.linkProject}</Btn>
      </div>
    ) : null;

  let actions;
  if (dest === DESTINATION_TYPE.INVENTORY) {
    actions = (
      <>
        <div style={styles.row}>
          <Btn onClick={createInventoryDraft} gold>{NEXT_ACTIONS_HE.createInventory}</Btn>
          <TrayBtn />
          <Btn onClick={createProject}>{NEXT_ACTIONS_HE.createProject}</Btn>
        </div>
        {object.inventoryDraft && <p style={styles.draftNote}>{NEXT_ACTIONS_HE.inventoryDraftCreated}</p>}
      </>
    );
  } else if (dest === DESTINATION_TYPE.MODEL_LIBRARY) {
    actions = (
      <>
        <div style={styles.row}>
          <Btn onClick={createModelDraft} gold>{NEXT_ACTIONS_HE.createModel}</Btn>
          <TrayBtn />
        </div>
        <LinkRow />
        {object.modelDraft && <p style={styles.draftNote}>{NEXT_ACTIONS_HE.modelDraftCreated}</p>}
      </>
    );
  } else if (dest === DESTINATION_TYPE.DESIGN_PROJECT) {
    actions = (
      <>
        <div style={styles.row}>
          <Btn onClick={createProject} gold>{NEXT_ACTIONS_HE.createProjectNew}</Btn>
          {object.linkedDesignProjectId && (
            <Btn onClick={() => router.push('/studio/projects')}>{NEXT_ACTIONS_HE.openProject}</Btn>
          )}
        </div>
        <LinkRow />
      </>
    );
  } else if (dest === DESTINATION_TYPE.WORK_TRAY_ONLY) {
    actions = <div style={styles.row}><TrayBtn /></div>;
  } else if (dest === DESTINATION_TYPE.INSPIRATION || dest === DESTINATION_TYPE.APPROVED_MEDIA) {
    actions = (
      <>
        <div style={styles.row}>
          <Btn onClick={saveInspiration} gold>{NEXT_ACTIONS_HE.saveInspiration}</Btn>
        </div>
        <LinkRow />
      </>
    );
  } else {
    // undecided / other — general bridge
    actions = (
      <>
        <div style={styles.row}>
          <TrayBtn />
          {hasProjects ? (
            <Btn onClick={createProject}>{NEXT_ACTIONS_HE.createProject}</Btn>
          ) : (
            <Btn onClick={createProject} gold>{NEXT_ACTIONS_HE.createProjectNew}</Btn>
          )}
        </div>
        <LinkRow />
      </>
    );
  }

  return (
    <div style={styles.wrap} dir="rtl">
      {actions}
      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' },
  row: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  linkRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' },
  gold: { minHeight: '44px', padding: '10px 18px', fontFamily: tokens.font.body, fontSize: '14px', fontWeight: 700, color: tokens.color.charcoal, background: tokens.color.goldFaint, border: `1px solid ${tokens.color.gold}`, borderRadius: tokens.radius.md, cursor: 'pointer' },
  ghost: { minHeight: '44px', padding: '10px 16px', fontFamily: tokens.font.body, fontSize: '14px', fontWeight: 600, color: tokens.color.inkSoft, background: 'transparent', border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md, cursor: 'pointer' },
  disabled: { opacity: 0.5, cursor: 'not-allowed' },
  select: { flex: 1, minWidth: '160px', fontFamily: tokens.font.body, fontSize: '14px', color: tokens.color.ink, background: tokens.color.ivory, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md, padding: '10px 12px', minHeight: '44px' },
  draftNote: { fontFamily: tokens.font.body, fontSize: '12px', color: tokens.color.gold, margin: 0 },
  toast: { fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 600, color: tokens.color.charcoal, background: tokens.color.sageFaint, border: `1px solid ${tokens.color.sage}`, borderRadius: tokens.radius.md, padding: '8px 14px' },
};
