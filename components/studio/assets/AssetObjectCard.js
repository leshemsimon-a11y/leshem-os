// components/studio/assets/AssetObjectCard.js
//
// LESHEM.S OS — Asset Object Card (Clean 4B.1)
//
// One Asset Object as a knowledge card (not a file row): object type, title,
// description, file + approved counts, link-to-project, and archive/restore.
// Expanding reveals the upload zone and the files panel for that object. Local
// only — no Airtable, no cloud, no commerce wording.

import { useState } from 'react';
import * as React from 'react';
import { tokens } from '../shared/tokens';
import { ASSETS_OBJ_HE, DELETE_HE, INTAKE_HE } from '../../../lib/studio/labels';
import { createUseWorkTray } from '../../../lib/studio/workTray';
import { createUseDesignProjects } from '../../../lib/studio/designProjects';
import AssetUploadZone from './AssetUploadZone';
import AssetFilesPanel from './AssetFilesPanel';
import AssetIntakeRouter from './AssetIntakeRouter';
import AssetNextActions from './AssetNextActions';
// Clean 8C — «צרף לתיק פעיל»: attach this asset (with a role) to the ACTIVE
// Work File through the existing public updateProject API only.
import AttachToActiveWork from './AttachToActiveWork';
import AssetThumbnail from './AssetThumbnail';
import AssetCoverSelector from './AssetCoverSelector';
import AssetCatalogPanel from './AssetCatalogPanel';
import { resolvePrimaryImageFileId } from '../../../lib/studio/assetImage';

const useWorkTray = createUseWorkTray(React);
const useDesignProjects = createUseDesignProjects(React);

const TYPE_GLYPH = {
  stone: '◆',
  jewelryModel: '◫',
  designProject: '❒',
  collection: '✦',
  renderOutput: '▦',
  clientReference: '◈',
  inspiration: '✧',
  other: '▣',
};

export default function AssetObjectCard({
  object,
  files,
  projects,
  filters,
  store,
}) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const tray = useWorkTray();
  const projectsStore = useDesignProjects();
  const archived = object.status === 'archived';
  const visibleFileCount = files.filter((f) => f.status !== 'archived').length;
  const approvedCount = files.filter((f) => f.status === 'approved').length;
  const previewFileId = resolvePrimaryImageFileId(object, files);

  return (
    <div style={{ ...styles.card, ...(archived ? styles.cardArchived : null) }} dir="rtl">
      <div style={styles.head}>
        {previewFileId ? (
          <AssetThumbnail
            fileId={previewFileId}
            getFileUrl={store.getFileUrl}
            alt={object.title}
            size={48}
            glyph={TYPE_GLYPH[object.objectType] || '▣'}
          />
        ) : (
          <span style={styles.typeGlyph} aria-hidden="true">
            {TYPE_GLYPH[object.objectType] || '▣'}
          </span>
        )}
        <div style={styles.idCol}>
          <span style={styles.title}>{object.title}</span>
          <span style={styles.type}>{ASSETS_OBJ_HE.objectType[object.objectType]}</span>
        </div>
      </div>

      {object.catalogCode && <span style={styles.catalogCode}>{object.catalogCode}</span>}

      {object.description ? <p style={styles.desc}>{object.description}</p> : null}

      {Array.isArray(object.tags) && object.tags.length > 0 && (
        <div style={styles.tagsRow}>
          {object.tags.slice(0, 6).map((t) => (
            <span key={t} style={styles.tagChip}>{t}</span>
          ))}
          {object.tags.length > 6 && (
            <span style={styles.tagMore}>+{object.tags.length - 6}</span>
          )}
        </div>
      )}

      <div style={styles.meta}>
        <span>{ASSETS_OBJ_HE.filesCount(visibleFileCount)}</span>
        {approvedCount > 0 && (
          <>
            <span>·</span>
            <span style={styles.approved}>{ASSETS_OBJ_HE.approvedCount(approvedCount)}</span>
          </>
        )}
      </div>

      {/* Owner badge */}
      <div style={styles.ownerLine}>
        {object.ownerContextType === 'internal'
          ? INTAKE_HE.ownerInternal
          : `${INTAKE_HE.ownerClientPrefix}${object.linkedClientName || object.ownerDisplayName || ''}`}
      </div>

      {/* Destination-aware next actions */}
      <AssetNextActions
        object={object}
        files={files}
        projects={projects}
        tray={tray}
        projectsStore={projectsStore}
        assetsStore={store}
      />

      {/* Clean 8C — attach to the active Work File (disabled + helper when
          no Active Work exists). */}
      <AttachToActiveWork object={object} files={files} />

      <div style={styles.actions}>
        <button type="button" onClick={() => setOpen((o) => !o)} style={styles.primary}>
          {open ? ASSETS_OBJ_HE.closeObject : ASSETS_OBJ_HE.openObject}
        </button>
        {archived ? (
          <>
            <button type="button" onClick={() => store.unarchiveObject(object.objectId)} style={styles.ghost}>
              {ASSETS_OBJ_HE.unarchiveObject}
            </button>
            <button type="button" onClick={() => setConfirmDelete(true)} style={styles.danger}>
              {DELETE_HE.permanentDelete}
            </button>
          </>
        ) : (
          <button type="button" onClick={() => store.archiveObject(object.objectId)} style={styles.ghost}>
            {ASSETS_OBJ_HE.archiveObject}
          </button>
        )}
      </div>

      {confirmDelete && (
        <div style={styles.confirmBox}>
          <p style={styles.confirmBody}>{DELETE_HE.confirmObjectBody}</p>
          <div style={styles.confirmRow}>
            <button type="button" onClick={() => setConfirmDelete(false)} style={styles.ghost}>
              {DELETE_HE.confirmNo}
            </button>
            <button
              type="button"
              onClick={() => {
                store.permanentlyDeleteObject(object.objectId);
                setConfirmDelete(false);
              }}
              style={styles.danger}
            >
              {DELETE_HE.confirmYes}
            </button>
          </div>
        </div>
      )}

      {open && (
        <div style={styles.expand}>
          {/* Intake: ownership + destination */}
          <AssetIntakeRouter object={object} store={store} />
          {/* Clean 4B.4a: catalog & tags */}
          <AssetCatalogPanel object={object} files={files} store={store} />
          <AssetUploadZone object={object} store={store} />
          {/* Clean 4B.4a: choose primary/cover image */}
          <AssetCoverSelector
            object={object}
            files={files}
            getFileUrl={store.getFileUrl}
            onSetPrimary={store.setPrimaryFile}
          />
          <h4 style={styles.filesHeading}>{ASSETS_OBJ_HE.filesHeading}</h4>
          <AssetFilesPanel
            files={files}
            filters={filters}
            getFileUrl={store.getFileUrl}
            onApprove={store.approveFile}
            onArchiveFile={store.archiveFile}
            onUnarchiveFile={store.unarchiveFile}
            onSetPurpose={store.setFilePurpose}
            onPermanentDeleteFile={store.permanentlyDeleteFile}
          />
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '16px',
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.lg,
    boxShadow: tokens.shadow.soft,
  },
  cardArchived: { opacity: 0.7 },
  head: { display: 'flex', alignItems: 'center', gap: '12px' },
  typeGlyph: {
    fontSize: '24px',
    color: tokens.color.gold,
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.goldSoft}`,
    borderRadius: tokens.radius.md,
    width: '44px',
    height: '44px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  idCol: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  title: {
    fontFamily: tokens.font.display,
    fontSize: '18px',
    color: tokens.color.charcoal,
    lineHeight: 1.3,
  },
  type: { fontFamily: tokens.font.body, fontSize: '12px', color: tokens.color.inkFaint },
  catalogCode: {
    alignSelf: 'flex-start', fontFamily: tokens.font.body, fontSize: '12px', fontWeight: 700,
    letterSpacing: '0.04em', color: tokens.color.gold, background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.goldSoft}`, borderRadius: '999px', padding: '2px 9px',
  },
  tagsRow: { display: 'flex', flexWrap: 'wrap', gap: '5px' },
  tagChip: {
    fontFamily: tokens.font.body, fontSize: '11px', fontWeight: 600, color: tokens.color.charcoal,
    background: tokens.color.pearl, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: '999px', padding: '2px 8px',
  },
  tagMore: { fontFamily: tokens.font.body, fontSize: '11px', color: tokens.color.inkFaint },
  desc: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
    margin: 0,
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.inkFaint,
  },
  approved: { color: tokens.color.sage, fontWeight: 600 },
  fieldLabel: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 700,
    color: tokens.color.inkSoft,
    marginTop: '6px',
  },
  select: {
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    color: tokens.color.ink,
    background: tokens.color.ivory,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    padding: '9px 10px',
    minHeight: '42px',
  },
  actions: { display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' },
  primary: {
    minHeight: '44px',
    padding: '10px 20px',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.color.ivory,
    background: tokens.color.charcoal,
    border: 'none',
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
  },
  ghost: {
    minHeight: '44px',
    padding: '10px 16px',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.color.inkSoft,
    background: 'transparent',
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
  },
  expand: {
    marginTop: '10px',
    paddingTop: '12px',
    borderTop: `1px solid ${tokens.color.cardEdge}`,
  },
  ownerLine: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.inkSoft,
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: '999px',
    padding: '3px 10px',
    alignSelf: 'flex-start',
  },
  danger: {
    minHeight: '44px',
    padding: '10px 16px',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: '#8c2f2f',
    background: 'transparent',
    border: '1px solid #c9a3a3',
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
  },
  confirmBox: {
    marginTop: '8px',
    padding: '12px',
    background: '#faf3f3',
    border: '1px solid #c9a3a3',
    borderRadius: tokens.radius.md,
  },
  confirmBody: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    lineHeight: 1.6,
    color: tokens.color.charcoal,
    margin: '0 0 10px',
  },
  confirmRow: { display: 'flex', gap: '8px' },
  filesHeading: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    color: tokens.color.inkSoft,
    margin: '12px 0 0',
  },
};
