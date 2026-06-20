// components/studio/assets/AssetLibraryPanel.js
//
// LESHEM.S OS — Asset Library Panel (Clean 4B)
//
// The /studio/assets surface. Combines the upload zone, category/status
// filters, the active asset grid, and an optional archived section. Reads the
// design-projects store so each asset can be linked to a project. Local only —
// no Airtable, no cloud, no network, no commerce wording.

import * as React from 'react';
import { useState } from 'react';
import { tokens } from '../shared/tokens';
import { ASSETS_HE } from '../../../lib/studio/labels';
import {
  createUseAssets,
  filterAssets,
} from '../../../lib/studio/assetsStore';
import { createUseDesignProjects } from '../../../lib/studio/designProjects';
import AssetUploadZone from './AssetUploadZone';
import AssetFilters from './AssetFilters';
import AssetCard from './AssetCard';

const useAssets = createUseAssets(React);
const useDesignProjects = createUseDesignProjects(React);

export default function AssetLibraryPanel() {
  const assetsStore = useAssets();
  const projectsStore = useDesignProjects();
  const [category, setCategory] = useState(null);
  const [status, setStatus] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const projects = projectsStore.hydrated ? projectsStore.projects : [];

  const cardHandlers = {
    onCategory: assetsStore.setCategory,
    onStatus: assetsStore.setStatus,
    onNotes: assetsStore.setNotes,
    onLink: assetsStore.link,
    onArchive: assetsStore.archive,
    onUnarchive: assetsStore.unarchive,
  };

  if (!assetsStore.hydrated) {
    return (
      <div dir="rtl">
        <Header />
        <div style={styles.loading}>טוען את ספריית הנכסים…</div>
      </div>
    );
  }

  const activeFiltered = filterAssets(assetsStore.active, { category, status });
  const archived = assetsStore.archived;

  return (
    <div dir="rtl">
      <Header />

      <AssetUploadZone onAdd={assetsStore.add} />

      <AssetFilters
        category={category}
        status={status}
        onCategory={setCategory}
        onStatus={setStatus}
      />

      <div style={styles.headRow}>
        <h2 style={styles.heading}>{ASSETS_HE.activeHeading}</h2>
        <span style={styles.count}>{ASSETS_HE.resultsCount(activeFiltered.length)}</span>
      </div>

      {activeFiltered.length === 0 ? (
        <p style={styles.empty}>{ASSETS_HE.emptyActive}</p>
      ) : (
        <div style={styles.grid}>
          {activeFiltered.map((a) => (
            <AssetCard key={a.id} asset={a} projects={projects} {...cardHandlers} />
          ))}
        </div>
      )}

      {archived.length > 0 && (
        <>
          <div style={styles.headRow}>
            <h2 style={styles.heading}>{ASSETS_HE.archivedHeading}</h2>
            <button
              type="button"
              onClick={() => setShowArchived((s) => !s)}
              style={styles.toggle}
            >
              {showArchived ? ASSETS_HE.hideArchived : ASSETS_HE.showArchived}
            </button>
          </div>
          {showArchived && (
            <div style={styles.grid}>
              {archived.map((a) => (
                <AssetCard key={a.id} asset={a} projects={projects} {...cardHandlers} />
              ))}
            </div>
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
  eyebrow: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: tokens.color.gold,
  },
  title: {
    fontFamily: tokens.font.display,
    fontWeight: 700,
    fontSize: '34px',
    color: tokens.color.charcoal,
    margin: '8px 0 10px',
  },
  caption: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
    margin: 0,
    maxWidth: '580px',
  },
  loading: {
    fontFamily: tokens.font.body,
    fontSize: '15px',
    color: tokens.color.inkFaint,
    padding: '40px 0',
    textAlign: 'center',
  },
  headRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '12px',
    margin: '8px 0 12px',
  },
  heading: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: tokens.color.inkSoft,
    margin: 0,
  },
  count: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.inkFaint,
  },
  toggle: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.color.gold,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '14px',
    marginBottom: '24px',
  },
  empty: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    color: tokens.color.inkFaint,
    margin: '0 0 24px',
  },
};
