// components/studio/assets/AssetLibraryPanel.js
//
// LESHEM.S OS — Asset Library Panel (Clean 4B.1, object-first)
//
// The /studio/assets surface. Create Asset Objects (stone, jewelry model,
// project reference…), then add multiple files to each. Objects are knowledge
// cards; files live inside them. Filters span object type / file kind / file
// purpose / status. Reads the design-projects store so objects link to a
// project. Persists via IndexedDB (assets store) — survives refresh. Local only.

import * as React from 'react';
import { useState } from 'react';
import { tokens } from '../shared/tokens';
import { ASSETS_HE, ASSETS_OBJ_HE, WIZARD_HE, ARCHIVE_HE } from '../../../lib/studio/labels';
import {
  createUseAssets,
  OBJECT_TYPE_VALUES,
  OBJECT_TYPE,
} from '../../../lib/studio/assetsStore';
import { createUseDesignProjects } from '../../../lib/studio/designProjects';
import AssetFilters from './AssetFilters';
import AssetObjectCard from './AssetObjectCard';
import AssetQuickCreateWizard from './AssetQuickCreateWizard';
import AssetArchiveView from './AssetArchiveView';

const useAssets = createUseAssets(React);
const useDesignProjects = createUseDesignProjects(React);

export default function AssetLibraryPanel() {
  const store = useAssets();
  const projectsStore = useDesignProjects();

  const [name, setName] = useState('');
  const [objectType, setObjectType] = useState(OBJECT_TYPE.STONE);
  const [description, setDescription] = useState('');

  const [fObjectType, setFObjectType] = useState(null);
  const [fFileKind, setFFileKind] = useState(null);
  const [fPurpose, setFPurpose] = useState(null);
  const [fStatus, setFStatus] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  // Clean 4B.4a: quick-create wizard + active/archive tab
  const [wizardOpen, setWizardOpen] = useState(false);
  const [tab, setTab] = useState('active'); // 'active' | 'archive'

  const projects = projectsStore.hydrated ? projectsStore.projects : [];

  const handleCreate = async () => {
    await store.createObject({ title: name, objectType, description, status: 'draft' });
    setName('');
    setDescription('');
  };

  if (!store.hydrated) {
    return (
      <div dir="rtl">
        <Header />
        <div style={styles.loading}>טוען את ספריית הנכסים…</div>
      </div>
    );
  }

  const allObjects = store.objects;
  const activeObjects = allObjects.filter((o) => o.status !== 'archived');
  const archivedObjects = allObjects.filter((o) => o.status === 'archived');
  const matchesType = (o) => !fObjectType || o.objectType === fObjectType;
  const shownActive = activeObjects.filter(matchesType);
  const shownArchived = archivedObjects.filter(matchesType);

  const fileFilters = {
    fileKind: fFileKind,
    filePurpose: fPurpose,
    status: fStatus,
    includeArchived: showArchived,
  };

  return (
    <div dir="rtl">
      <Header />

      {/* Clean 4B.4a: primary quick-create entry + tabs */}
      <div style={styles.topBar}>
        <button type="button" onClick={() => setWizardOpen(true)} style={styles.wizardBtn}>
          ＋ {WIZARD_HE.openWizard}
        </button>
        <div style={styles.tabs}>
          <button
            type="button"
            onClick={() => setTab('active')}
            style={{ ...styles.tab, ...(tab === 'active' ? styles.tabActive : null) }}
          >
            {ARCHIVE_HE.activeTab}
          </button>
          <button
            type="button"
            onClick={() => setTab('archive')}
            style={{ ...styles.tab, ...(tab === 'archive' ? styles.tabActive : null) }}
          >
            {ARCHIVE_HE.tab}
            {archivedObjects.length > 0 ? ` (${archivedObjects.length})` : ''}
          </button>
        </div>
      </div>

      {wizardOpen && (
        <AssetQuickCreateWizard
          store={store}
          existingObjects={allObjects}
          onClose={() => setWizardOpen(false)}
          onCreated={() => setTab('active')}
        />
      )}

      {tab === 'archive' ? (
        <AssetArchiveView objects={allObjects} store={store} />
      ) : (
      <>
      <section style={styles.createBox}>
        <h2 style={styles.createTitle}>{ASSETS_OBJ_HE.newObjectTitle}</h2>
        <p style={styles.createHint}>{WIZARD_HE.classicHint}</p>
        <div style={styles.createRow}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={ASSETS_OBJ_HE.objectNamePlaceholder}
            style={styles.input}
            dir="rtl"
          />
          <select
            value={objectType}
            onChange={(e) => setObjectType(e.target.value)}
            style={styles.select}
            dir="rtl"
          >
            {OBJECT_TYPE_VALUES.map((t) => (
              <option key={t} value={t}>
                {ASSETS_OBJ_HE.objectType[t]}
              </option>
            ))}
          </select>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={ASSETS_OBJ_HE.descriptionPlaceholder}
          style={styles.textarea}
          rows={2}
          dir="rtl"
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={!name.trim()}
          style={{ ...styles.createBtn, ...(!name.trim() ? styles.createBtnDisabled : null) }}
        >
          {ASSETS_OBJ_HE.createObject}
        </button>
        <p style={styles.localNote}>{ASSETS_HE.localNote}</p>
      </section>

      <AssetFilters
        objectType={fObjectType}
        fileKind={fFileKind}
        filePurpose={fPurpose}
        status={fStatus}
        onObjectType={setFObjectType}
        onFileKind={setFFileKind}
        onFilePurpose={setFPurpose}
        onStatus={setFStatus}
      />

      <div style={styles.headRow}>
        <h2 style={styles.heading}>{ASSETS_HE.activeHeading}</h2>
      </div>

      {shownActive.length === 0 ? (
        <p style={styles.empty}>{ASSETS_HE.emptyActive}</p>
      ) : (
        <div style={styles.grid}>
          {shownActive.map((o) => (
            <AssetObjectCard
              key={o.objectId}
              object={o}
              files={store.filesByObject[o.objectId] || []}
              projects={projects}
              filters={fileFilters}
              store={store}
            />
          ))}
        </div>
      )}

      {archivedObjects.length > 0 && (
        <>
          <div style={styles.headRow}>
            <h2 style={styles.heading}>{ASSETS_HE.archivedHeading}</h2>
            <button type="button" onClick={() => setShowArchived((s) => !s)} style={styles.toggle}>
              {showArchived ? ASSETS_HE.hideArchived : ASSETS_HE.showArchived}
            </button>
          </div>
          {showArchived && (
            <div style={styles.grid}>
              {shownArchived.map((o) => (
                <AssetObjectCard
                  key={o.objectId}
                  object={o}
                  files={store.filesByObject[o.objectId] || []}
                  projects={projects}
                  filters={fileFilters}
                  store={store}
                />
              ))}
            </div>
          )}
        </>
      )}
      </>
      )}
    </div>
  );
}

function Header() {
  return (
    <header style={styles.header} dir="rtl">
      <span style={styles.eyebrow}>{ASSETS_HE.eyebrow}</span>
      <h1 style={styles.title}>{ASSETS_HE.title}</h1>
      <p style={styles.caption}>{ASSETS_HE.caption}</p>
    </header>
  );
}

const styles = {
  header: { marginBottom: '18px' },
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' },
  wizardBtn: { minHeight: '48px', padding: '12px 22px', fontFamily: tokens.font.body, fontSize: '15px', fontWeight: 700, color: tokens.color.ivory, background: tokens.color.gold, border: 'none', borderRadius: tokens.radius.md, cursor: 'pointer', boxShadow: tokens.shadow.soft },
  tabs: { display: 'flex', gap: '6px' },
  tab: { minHeight: '40px', padding: '8px 16px', fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 600, color: tokens.color.inkSoft, background: 'transparent', border: `1px solid ${tokens.color.cardEdge}`, borderRadius: '999px', cursor: 'pointer' },
  tabActive: { color: tokens.color.charcoal, background: tokens.color.goldFaint, border: `1px solid ${tokens.color.gold}` },
  eyebrow: { fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em', color: tokens.color.gold },
  title: { fontFamily: tokens.font.display, fontWeight: 700, fontSize: '34px', color: tokens.color.charcoal, margin: '8px 0 10px' },
  caption: { fontFamily: tokens.font.body, fontSize: '14px', lineHeight: 1.6, color: tokens.color.inkSoft, margin: 0, maxWidth: '580px' },
  loading: { fontFamily: tokens.font.body, fontSize: '15px', color: tokens.color.inkFaint, padding: '40px 0', textAlign: 'center' },
  createBox: { display: 'flex', flexDirection: 'column', gap: '10px', padding: '18px', background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.lg, marginBottom: '22px' },
  createTitle: { fontFamily: tokens.font.display, fontSize: '20px', color: tokens.color.charcoal, margin: 0 },
  createHint: { fontFamily: tokens.font.body, fontSize: '13px', color: tokens.color.inkFaint, margin: 0 },
  createRow: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  input: { flex: 1, minWidth: '200px', boxSizing: 'border-box', fontFamily: tokens.font.body, fontSize: '15px', color: tokens.color.ink, background: tokens.color.ivory, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md, padding: '12px 14px', outline: 'none' },
  select: { fontFamily: tokens.font.body, fontSize: '15px', color: tokens.color.ink, background: tokens.color.ivory, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md, padding: '12px 14px', minHeight: '48px', minWidth: '160px' },
  textarea: { width: '100%', boxSizing: 'border-box', fontFamily: tokens.font.body, fontSize: '15px', lineHeight: 1.6, color: tokens.color.ink, background: tokens.color.ivory, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md, padding: '12px 14px', resize: 'vertical', outline: 'none' },
  createBtn: { alignSelf: 'flex-start', minHeight: '48px', padding: '12px 26px', fontFamily: tokens.font.body, fontSize: '15px', fontWeight: 600, color: tokens.color.ivory, background: tokens.color.charcoal, border: 'none', borderRadius: tokens.radius.md, cursor: 'pointer', boxShadow: tokens.shadow.soft },
  createBtnDisabled: { opacity: 0.5, cursor: 'not-allowed', boxShadow: 'none' },
  localNote: { fontFamily: tokens.font.body, fontSize: '12px', lineHeight: 1.6, color: tokens.color.inkSoft, margin: 0 },
  headRow: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', margin: '8px 0 12px' },
  heading: { fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 700, letterSpacing: '0.06em', color: tokens.color.inkSoft, margin: 0 },
  toggle: { fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 600, color: tokens.color.gold, background: 'transparent', border: 'none', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' },
  empty: { fontFamily: tokens.font.body, fontSize: '14px', color: tokens.color.inkFaint, margin: '0 0 24px' },
};
