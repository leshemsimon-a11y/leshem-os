// components/studio/assets/AssetCatalogPanel.js
//
// LESHEM.S OS — Asset Catalog & Tags Panel (Clean 4B.4a)
//
// The "קיטלוג ותגיות" section for one Asset Object: catalog code (read-only,
// auto-generated), primary/secondary category, usage purpose, source, and an
// editable tags field with simple suggestions. Also surfaces linked items
// (inventory draft / model draft / projects / collections / files) — these are
// scaffolding now and get populated by later sprints.
//
// This catalog layer is ADDITIVE and SEPARATE from the canonical six-axis
// gemological taxonomy (lib/studio/taxonomy.js). App-facing Hebrew only; never
// customer-facing. Local only — no network, no Airtable.

import { useState } from 'react';
import { tokens } from '../shared/tokens';
import { CATALOG_HE } from '../../../lib/studio/labels';
import {
  PRIMARY_CATEGORY_VALUES,
  SECONDARY_CATEGORY_BY_FAMILY,
  USAGE_PURPOSE_VALUES,
  SOURCE_TYPE_VALUES,
  suggestTags,
} from '../../../lib/studio/assetsStore';

function secondaryOptionsFor(primaryCategory) {
  if (!primaryCategory) return [];
  return SECONDARY_CATEGORY_BY_FAMILY[primaryCategory] || [];
}

export default function AssetCatalogPanel({ object, files, store }) {
  const [tagInput, setTagInput] = useState('');

  const set = (patch) => store.setCatalog(object.objectId, patch);
  const secondaryOptions = secondaryOptionsFor(object.primaryCategory);
  const tags = Array.isArray(object.tags) ? object.tags : [];

  const fileNames = (Array.isArray(files) ? files : []).map((f) => f.fileName);
  const suggestions = suggestTags({
    title: object.title,
    fileNames,
    primaryCategory: object.primaryCategory,
    secondaryCategory: object.secondaryCategory,
    objectType: object.objectType,
    destinationType: object.destinationType,
  }).filter((t) => !tags.includes(t));

  const addTag = (t) => {
    const v = (t || '').trim();
    if (!v) return;
    store.addTag(object.objectId, v);
    setTagInput('');
  };

  const links = [
    { key: 'inventoryDraft', has: !!object.linkedInventoryDraftId, label: CATALOG_HE.linkLabels.inventoryDraft },
    { key: 'modelDraft', has: !!object.linkedModelDraftId, label: CATALOG_HE.linkLabels.modelDraft },
    {
      key: 'designProjects',
      has: Array.isArray(object.linkedDesignProjectIds) && object.linkedDesignProjectIds.length > 0,
      label: CATALOG_HE.linkLabels.designProjects,
      count: (object.linkedDesignProjectIds || []).length,
    },
    {
      key: 'collections',
      has: Array.isArray(object.linkedCollectionIds) && object.linkedCollectionIds.length > 0,
      label: CATALOG_HE.linkLabels.collections,
      count: (object.linkedCollectionIds || []).length,
    },
  ].filter((l) => l.has);

  return (
    <div style={styles.wrap} dir="rtl">
      <span style={styles.sectionTitle}>{CATALOG_HE.sectionTitle}</span>

      <div style={styles.codeRow}>
        <span style={styles.codeLabel}>{CATALOG_HE.catalogCode}</span>
        <span style={styles.codeValue}>{object.catalogCode || CATALOG_HE.notSet}</span>
      </div>

      <div style={styles.fieldGrid}>
        <label style={styles.fieldLabel}>{CATALOG_HE.primaryCategory}</label>
        <select
          value={object.primaryCategory || ''}
          onChange={(e) => set({ primaryCategory: e.target.value || null, secondaryCategory: null })}
          style={styles.select}
          dir="rtl"
        >
          <option value="">{CATALOG_HE.notSet}</option>
          {PRIMARY_CATEGORY_VALUES.map((c) => (
            <option key={c} value={c}>{CATALOG_HE.primaryCategoryOptions[c] || c}</option>
          ))}
        </select>

        <label style={styles.fieldLabel}>{CATALOG_HE.secondaryCategory}</label>
        <select
          value={object.secondaryCategory || ''}
          onChange={(e) => set({ secondaryCategory: e.target.value || null })}
          style={styles.select}
          dir="rtl"
          disabled={secondaryOptions.length === 0}
        >
          <option value="">
            {secondaryOptions.length === 0 ? CATALOG_HE.pickCategoryFirst : CATALOG_HE.notSet}
          </option>
          {secondaryOptions.map((c) => (
            <option key={c} value={c}>{CATALOG_HE.secondaryCategoryOptions[c] || c}</option>
          ))}
        </select>

        <label style={styles.fieldLabel}>{CATALOG_HE.usagePurpose}</label>
        <select
          value={object.usagePurpose || ''}
          onChange={(e) => set({ usagePurpose: e.target.value || null })}
          style={styles.select}
          dir="rtl"
        >
          <option value="">{CATALOG_HE.notSet}</option>
          {USAGE_PURPOSE_VALUES.map((u) => (
            <option key={u} value={u}>{CATALOG_HE.usagePurposeOptions[u] || u}</option>
          ))}
        </select>

        <label style={styles.fieldLabel}>{CATALOG_HE.sourceType}</label>
        <select
          value={object.sourceType || ''}
          onChange={(e) => set({ sourceType: e.target.value || null })}
          style={styles.select}
          dir="rtl"
        >
          <option value="">{CATALOG_HE.notSet}</option>
          {SOURCE_TYPE_VALUES.map((s) => (
            <option key={s} value={s}>{CATALOG_HE.sourceTypeOptions[s] || s}</option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div style={styles.tagsBlock}>
        <span style={styles.fieldLabel}>{CATALOG_HE.tags}</span>
        <div style={styles.tagRow}>
          {tags.length === 0 && <span style={styles.noTags}>{CATALOG_HE.noTags}</span>}
          {tags.map((t) => (
            <span key={t} style={styles.tagChip}>
              {t}
              <button
                type="button"
                onClick={() => store.removeTag(object.objectId, t)}
                style={styles.tagRemove}
                aria-label="remove"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div style={styles.tagInputRow}>
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(tagInput);
              }
            }}
            placeholder={CATALOG_HE.tagsPlaceholder}
            style={styles.tagInput}
            dir="rtl"
          />
        </div>
        {suggestions.length > 0 && (
          <div style={styles.suggestRow}>
            <span style={styles.suggestLabel}>{CATALOG_HE.tagsSuggested}:</span>
            {suggestions.map((s) => (
              <button key={s} type="button" onClick={() => addTag(s)} style={styles.suggestChip}>
                + {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Linked items */}
      <div style={styles.linksBlock}>
        <span style={styles.fieldLabel}>{CATALOG_HE.linkedItems}</span>
        {links.length === 0 ? (
          <span style={styles.noTags}>{CATALOG_HE.noLinks}</span>
        ) : (
          <div style={styles.tagRow}>
            {links.map((l) => (
              <span key={l.key} style={styles.linkChip}>
                {l.label}{typeof l.count === 'number' && l.count > 1 ? ` (${l.count})` : ''}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px', padding: '14px',
    background: tokens.color.pearl, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md,
  },
  sectionTitle: { fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 700, color: tokens.color.charcoal },
  codeRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  codeLabel: { fontFamily: tokens.font.body, fontSize: '12px', color: tokens.color.inkSoft },
  codeValue: {
    fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em',
    color: tokens.color.gold, background: tokens.color.goldFaint, border: `1px solid ${tokens.color.goldSoft}`,
    borderRadius: '999px', padding: '2px 10px',
  },
  fieldGrid: { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 10px', alignItems: 'center' },
  fieldLabel: { fontFamily: tokens.font.body, fontSize: '12px', fontWeight: 600, color: tokens.color.inkSoft, whiteSpace: 'nowrap' },
  select: {
    width: '100%', boxSizing: 'border-box', fontFamily: tokens.font.body, fontSize: '13px', color: tokens.color.ink,
    background: tokens.color.ivory, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.sm,
    padding: '8px 9px', minHeight: '40px',
  },
  tagsBlock: { display: 'flex', flexDirection: 'column', gap: '8px' },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' },
  noTags: { fontFamily: tokens.font.body, fontSize: '12px', color: tokens.color.inkFaint },
  tagChip: {
    display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: tokens.font.body, fontSize: '12px',
    fontWeight: 600, color: tokens.color.charcoal, background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`, borderRadius: '999px', padding: '3px 8px',
  },
  tagRemove: {
    fontFamily: tokens.font.body, fontSize: '14px', lineHeight: 1, color: tokens.color.inkFaint,
    background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
  },
  tagInputRow: { display: 'flex' },
  tagInput: {
    flex: 1, boxSizing: 'border-box', fontFamily: tokens.font.body, fontSize: '13px', color: tokens.color.ink,
    background: tokens.color.ivory, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.sm,
    padding: '9px 10px', minHeight: '40px',
  },
  suggestRow: { display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' },
  suggestLabel: { fontFamily: tokens.font.body, fontSize: '11px', color: tokens.color.inkFaint },
  suggestChip: {
    fontFamily: tokens.font.body, fontSize: '11px', fontWeight: 600, color: tokens.color.gold,
    background: 'transparent', border: `1px dashed ${tokens.color.goldSoft}`, borderRadius: '999px',
    padding: '3px 8px', cursor: 'pointer',
  },
  linksBlock: { display: 'flex', flexDirection: 'column', gap: '6px' },
  linkChip: {
    fontFamily: tokens.font.body, fontSize: '12px', fontWeight: 600, color: tokens.color.sage,
    background: tokens.color.sageFaint, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: '999px',
    padding: '3px 9px',
  },
};
