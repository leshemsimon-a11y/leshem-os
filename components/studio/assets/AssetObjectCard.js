// components/studio/assets/AssetObjectCard.js
//
// LESHEM.S OS — Asset Object Card (Clean 4B.1)
//
// One Asset Object as a knowledge card (not a file row): object type, title,
// description, file + approved counts, link-to-project, and archive/restore.
// Expanding reveals the upload zone and the files panel for that object. Local
// only — no Airtable, no cloud, no commerce wording.

import { useState } from 'react';
import { tokens } from '../shared/tokens';
import { ASSETS_OBJ_HE } from '../../../lib/studio/labels';
import AssetUploadZone from './AssetUploadZone';
import AssetFilesPanel from './AssetFilesPanel';

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
  const archived = object.status === 'archived';
  const visibleFileCount = files.filter((f) => f.status !== 'archived').length;
  const approvedCount = files.filter((f) => f.status === 'approved').length;

  return (
    <div style={{ ...styles.card, ...(archived ? styles.cardArchived : null) }} dir="rtl">
      <div style={styles.head}>
        <span style={styles.typeGlyph} aria-hidden="true">
          {TYPE_GLYPH[object.objectType] || '▣'}
        </span>
        <div style={styles.idCol}>
          <span style={styles.title}>{object.title}</span>
          <span style={styles.type}>{ASSETS_OBJ_HE.objectType[object.objectType]}</span>
        </div>
      </div>

      {object.description ? <p style={styles.desc}>{object.description}</p> : null}

      <div style={styles.meta}>
        <span>{ASSETS_OBJ_HE.filesCount(visibleFileCount)}</span>
        {approvedCount > 0 && (
          <>
            <span>·</span>
            <span style={styles.approved}>{ASSETS_OBJ_HE.approvedCount(approvedCount)}</span>
          </>
        )}
      </div>

      {/* Link to design project */}
      <label style={styles.fieldLabel}>{ASSETS_OBJ_HE.linkProject}</label>
      <select
        value={object.linkedDesignProjectId || ''}
        onChange={(e) => store.linkObjectToProject(object.objectId, e.target.value || null)}
        style={styles.select}
        dir="rtl"
      >
        <option value="">{ASSETS_OBJ_HE.linkNone}</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <div style={styles.actions}>
        <button type="button" onClick={() => setOpen((o) => !o)} style={styles.primary}>
          {open ? ASSETS_OBJ_HE.closeObject : ASSETS_OBJ_HE.openObject}
        </button>
        {archived ? (
          <button type="button" onClick={() => store.unarchiveObject(object.objectId)} style={styles.ghost}>
            {ASSETS_OBJ_HE.unarchiveObject}
          </button>
        ) : (
          <button type="button" onClick={() => store.archiveObject(object.objectId)} style={styles.ghost}>
            {ASSETS_OBJ_HE.archiveObject}
          </button>
        )}
      </div>

      {open && (
        <div style={styles.expand}>
          <AssetUploadZone objectId={object.objectId} onAddFile={store.addFile} />
          <h4 style={styles.filesHeading}>{ASSETS_OBJ_HE.filesHeading}</h4>
          <AssetFilesPanel
            files={files}
            filters={filters}
            getFileUrl={store.getFileUrl}
            onApprove={store.approveFile}
            onArchiveFile={store.archiveFile}
            onUnarchiveFile={store.unarchiveFile}
            onSetPurpose={store.setFilePurpose}
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
  filesHeading: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    color: tokens.color.inkSoft,
    margin: '12px 0 0',
  },
};
