// components/studio/assets/AssetQuickCreateWizard.js
//
// LESHEM.S OS — Asset Quick Create Wizard (Clean 4B.4a)
//
// The primary one-flow path for creating an Asset Object: title + type →
// ownership/client context → destination → catalog & tags → files/media →
// primary image → next action. On save it creates ONE object, adds ALL files
// to that same object (no splitting), and sets the first image as primary.
//
// Next-action policy (Clean 4B.4a): only "שמור בלבד" executes. The other four
// actions are shown but DISABLED with a "יופעל בשלב 4B.4b" badge so the flow is
// visually prepared without pretending deferred actions work.
//
// Local only — IndexedDB-backed via the assets store. No Airtable, no network,
// no pricing, no certificates, no new packages.

import { useMemo, useState } from 'react';
import { tokens } from '../shared/tokens';
import {
  WIZARD_HE,
  CATALOG_HE,
  INTAKE_HE,
  ASSETS_OBJ_HE,
} from '../../../lib/studio/labels';
import {
  OBJECT_TYPE,
  OBJECT_TYPE_VALUES,
  OWNER_CONTEXT,
  OWNER_CONTEXT_VALUES,
  CLIENT_TIER_VALUES,
  DESTINATION_TYPE,
  PRIMARY_CATEGORY_VALUES,
  SECONDARY_CATEGORY_BY_FAMILY,
  USAGE_PURPOSE_VALUES,
  SOURCE_TYPE_VALUES,
  generateCatalogCode,
  suggestTags,
} from '../../../lib/studio/assetsStore';
import { detectFiles } from '../../../lib/studio/fileDetection';

const DEST_OPTIONS = [
  DESTINATION_TYPE.INVENTORY,
  DESTINATION_TYPE.MODEL_LIBRARY,
  DESTINATION_TYPE.DESIGN_PROJECT,
  DESTINATION_TYPE.INSPIRATION,
  DESTINATION_TYPE.WORK_TRAY_ONLY,
  DESTINATION_TYPE.APPROVED_MEDIA,
];

// 4B.4a: only saveOnly is active. The rest are deferred to 4B.4b.
const NEXT_ACTIONS = [
  { key: 'saveOnly', label: WIZARD_HE.saveOnly, active: true },
  { key: 'createInventory', label: WIZARD_HE.createInventory, active: false },
  { key: 'addToTray', label: WIZARD_HE.addToTray, active: false },
  { key: 'createProject', label: WIZARD_HE.createProject, active: false },
  { key: 'openInStudio', label: WIZARD_HE.openInStudio, active: false },
];

const STEPS = ['title', 'owner', 'destination', 'catalog', 'files', 'cover', 'next'];

export default function AssetQuickCreateWizard({ store, existingObjects, onClose, onCreated }) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  // Core fields
  const [title, setTitle] = useState('');
  const [objectType, setObjectType] = useState(OBJECT_TYPE.STONE);
  const [description, setDescription] = useState('');

  // Ownership
  const [ownerContextType, setOwnerContextType] = useState(OWNER_CONTEXT.INTERNAL);
  const [linkedClientName, setLinkedClientName] = useState('');
  const [clientRole, setClientRole] = useState('');
  const [clientTier, setClientTier] = useState('');

  // Destination
  const [destinationType, setDestinationType] = useState(DESTINATION_TYPE.UNDECIDED);

  // Catalog
  const [primaryCategory, setPrimaryCategory] = useState('');
  const [secondaryCategory, setSecondaryCategory] = useState('');
  const [usagePurpose, setUsagePurpose] = useState('');
  const [sourceType, setSourceType] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Files (staged rows: { file, ...detected })
  const [rows, setRows] = useState([]);
  const [primaryIndex, setPrimaryIndex] = useState(null);

  // Next action
  const [nextAction, setNextAction] = useState('saveOnly');

  const isInternal = ownerContextType === OWNER_CONTEXT.INTERNAL;
  const secondaryOptions = primaryCategory ? (SECONDARY_CATEGORY_BY_FAMILY[primaryCategory] || []) : [];

  const previewCode = useMemo(
    () => generateCatalogCode({ primaryCategory, objectType }, existingObjects),
    [primaryCategory, objectType, existingObjects]
  );

  const suggestions = useMemo(
    () =>
      suggestTags({
        title,
        fileNames: rows.map((r) => r.fileName),
        primaryCategory,
        secondaryCategory,
        objectType,
        destinationType,
      }).filter((t) => !tags.includes(t)),
    [title, rows, primaryCategory, secondaryCategory, objectType, destinationType, tags]
  );

  const stageFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    const detected = detectFiles(files, { objectType, destinationType });
    setRows((prev) => {
      const next = prev.concat(detected.map((p) => ({ file: p.file, ...p.detected })));
      // default primary = first image
      if (primaryIndex === null) {
        const idx = next.findIndex((r) => r.fileKind === 'image');
        if (idx !== -1) setPrimaryIndex(idx);
      }
      return next;
    });
  };

  const removeRow = (idx) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
    setPrimaryIndex((p) => {
      if (p === null) return p;
      if (p === idx) return null;
      if (p > idx) return p - 1;
      return p;
    });
  };

  const addTag = (t) => {
    const v = (t || '').trim();
    if (!v || tags.includes(v)) return;
    setTags((prev) => prev.concat(v));
    setTagInput('');
  };

  const canNext = () => {
    if (STEPS[step] === 'title') return title.trim().length > 0;
    return true;
  };

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSave = async () => {
    if (busy || !title.trim()) return;
    setBusy(true);
    try {
      const input = {
        title: title.trim(),
        objectType,
        description,
        status: 'draft',
        ownerContextType,
        ownerDisplayName: isInternal ? undefined : (linkedClientName || undefined),
        linkedClientName: isInternal ? null : (linkedClientName || null),
        clientRole: isInternal ? null : (clientRole || null),
        clientTier: isInternal ? null : (clientTier || null),
        destinationType,
        catalogCode: previewCode,
        primaryCategory: primaryCategory || null,
        secondaryCategory: secondaryCategory || null,
        usagePurpose: usagePurpose || null,
        sourceType: sourceType || null,
        tags,
      };
      const fileRows = rows.map((r) => ({
        file: r.file,
        fileName: r.fileName,
        mimeType: r.mimeType,
        extension: r.extension,
        fileSize: r.fileSize,
        fileKind: r.fileKind,
        filePurpose: r.filePurpose,
        category: r.category,
        status: r.status,
      }));
      const result = await store.createObjectWithFiles(input, fileRows, primaryIndex);
      if (typeof onCreated === 'function') onCreated(result, nextAction);
      if (typeof onClose === 'function') onClose();
    } finally {
      setBusy(false);
    }
  };

  const imageRows = rows
    .map((r, i) => ({ r, i }))
    .filter((x) => x.r.fileKind === 'image');

  return (
    <div style={styles.overlay} dir="rtl">
      <div style={styles.modal}>
        <div style={styles.headRow}>
          <div>
            <h2 style={styles.title}>{WIZARD_HE.title}</h2>
            <p style={styles.subtitle}>{WIZARD_HE.subtitle}</p>
          </div>
          <button type="button" onClick={onClose} style={styles.close} aria-label="close">×</button>
        </div>

        {/* Stepper */}
        <div style={styles.stepper}>
          {STEPS.map((s, i) => (
            <span
              key={s}
              style={{ ...styles.stepDot, ...(i === step ? styles.stepDotActive : null), ...(i < step ? styles.stepDotDone : null) }}
            />
          ))}
        </div>

        <div style={styles.body}>
          {STEPS[step] === 'title' && (
            <div style={styles.section}>
              <span style={styles.stepName}>{WIZARD_HE.stepTitle}</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={WIZARD_HE.titlePlaceholder}
                style={styles.input}
                dir="rtl"
                autoFocus
              />
              <label style={styles.fieldLabel}>{WIZARD_HE.objectTypeLabel}</label>
              <select value={objectType} onChange={(e) => setObjectType(e.target.value)} style={styles.select} dir="rtl">
                {OBJECT_TYPE_VALUES.map((t) => (
                  <option key={t} value={t}>{ASSETS_OBJ_HE.objectType[t]}</option>
                ))}
              </select>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={ASSETS_OBJ_HE.descriptionPlaceholder}
                style={styles.textarea}
                rows={2}
                dir="rtl"
              />
            </div>
          )}

          {STEPS[step] === 'owner' && (
            <div style={styles.section}>
              <span style={styles.stepName}>{INTAKE_HE.ownerQuestion}</span>
              <div style={styles.chips}>
                {OWNER_CONTEXT_VALUES.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setOwnerContextType(opt)}
                    style={{ ...styles.chip, ...(ownerContextType === opt ? styles.chipActive : null) }}
                  >
                    {INTAKE_HE.ownerOptions[opt]}
                  </button>
                ))}
              </div>
              {!isInternal && (
                <div style={styles.fields}>
                  <input value={linkedClientName} onChange={(e) => setLinkedClientName(e.target.value)} placeholder={INTAKE_HE.clientNameLabel} style={styles.input} dir="rtl" />
                  <input value={clientRole} onChange={(e) => setClientRole(e.target.value)} placeholder={INTAKE_HE.clientRoleLabel} style={styles.input} dir="rtl" />
                  <select value={clientTier} onChange={(e) => setClientTier(e.target.value)} style={styles.select} dir="rtl">
                    <option value="">{INTAKE_HE.clientTierLabel}</option>
                    {CLIENT_TIER_VALUES.map((t) => (
                      <option key={t} value={t}>{INTAKE_HE.clientTier[t]}</option>
                    ))}
                  </select>
                </div>
              )}
              <p style={styles.note}>{INTAKE_HE.changeLater}</p>
            </div>
          )}

          {STEPS[step] === 'destination' && (
            <div style={styles.section}>
              <span style={styles.stepName}>{INTAKE_HE.destinationQuestion}</span>
              <div style={styles.chips}>
                {DEST_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDestinationType(opt)}
                    style={{ ...styles.chip, ...(destinationType === opt ? styles.chipActive : null) }}
                  >
                    {INTAKE_HE.destinationOptions[opt] || opt}
                  </button>
                ))}
              </div>
              <p style={styles.note}>{INTAKE_HE.changeLater}</p>
            </div>
          )}

          {STEPS[step] === 'catalog' && (
            <div style={styles.section}>
              <span style={styles.stepName}>{CATALOG_HE.sectionTitle}</span>
              <div style={styles.codeRow}>
                <span style={styles.codeLabel}>{CATALOG_HE.catalogCode}</span>
                <span style={styles.codeValue}>{previewCode}</span>
              </div>
              <div style={styles.fieldGrid}>
                <label style={styles.fieldLabel}>{CATALOG_HE.primaryCategory}</label>
                <select value={primaryCategory} onChange={(e) => { setPrimaryCategory(e.target.value); setSecondaryCategory(''); }} style={styles.select} dir="rtl">
                  <option value="">{CATALOG_HE.notSet}</option>
                  {PRIMARY_CATEGORY_VALUES.map((c) => (
                    <option key={c} value={c}>{CATALOG_HE.primaryCategoryOptions[c] || c}</option>
                  ))}
                </select>
                <label style={styles.fieldLabel}>{CATALOG_HE.secondaryCategory}</label>
                <select value={secondaryCategory} onChange={(e) => setSecondaryCategory(e.target.value)} style={styles.select} dir="rtl" disabled={secondaryOptions.length === 0}>
                  <option value="">{secondaryOptions.length === 0 ? CATALOG_HE.pickCategoryFirst : CATALOG_HE.notSet}</option>
                  {secondaryOptions.map((c) => (
                    <option key={c} value={c}>{CATALOG_HE.secondaryCategoryOptions[c] || c}</option>
                  ))}
                </select>
                <label style={styles.fieldLabel}>{CATALOG_HE.usagePurpose}</label>
                <select value={usagePurpose} onChange={(e) => setUsagePurpose(e.target.value)} style={styles.select} dir="rtl">
                  <option value="">{CATALOG_HE.notSet}</option>
                  {USAGE_PURPOSE_VALUES.map((u) => (
                    <option key={u} value={u}>{CATALOG_HE.usagePurposeOptions[u] || u}</option>
                  ))}
                </select>
                <label style={styles.fieldLabel}>{CATALOG_HE.sourceType}</label>
                <select value={sourceType} onChange={(e) => setSourceType(e.target.value)} style={styles.select} dir="rtl">
                  <option value="">{CATALOG_HE.notSet}</option>
                  {SOURCE_TYPE_VALUES.map((s) => (
                    <option key={s} value={s}>{CATALOG_HE.sourceTypeOptions[s] || s}</option>
                  ))}
                </select>
              </div>
              <span style={styles.fieldLabel}>{CATALOG_HE.tags}</span>
              <div style={styles.tagRow}>
                {tags.map((t) => (
                  <span key={t} style={styles.tagChip}>
                    {t}
                    <button type="button" onClick={() => setTags((p) => p.filter((x) => x !== t))} style={styles.tagRemove}>×</button>
                  </span>
                ))}
              </div>
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); } }}
                placeholder={CATALOG_HE.tagsPlaceholder}
                style={styles.input}
                dir="rtl"
              />
              {suggestions.length > 0 && (
                <div style={styles.suggestRow}>
                  <span style={styles.suggestLabel}>{CATALOG_HE.tagsSuggested}:</span>
                  {suggestions.map((s) => (
                    <button key={s} type="button" onClick={() => addTag(s)} style={styles.suggestChip}>+ {s}</button>
                  ))}
                </div>
              )}
            </div>
          )}

          {STEPS[step] === 'files' && (
            <div style={styles.section}>
              <span style={styles.stepName}>{WIZARD_HE.stepFiles}</span>
              <p style={styles.note}>{WIZARD_HE.filesOptional}</p>
              <label style={styles.dropZone}>
                <span style={styles.dropGlyph} aria-hidden="true">＋</span>
                <span style={styles.dropHint}>{WIZARD_HE.stepFiles}</span>
                <input
                  type="file"
                  onChange={(e) => { stageFiles(e.target.files); e.target.value = ''; }}
                  style={{ display: 'none' }}
                  accept="image/*,video/*,application/pdf,.stl,.obj,.3dm,.glb,.gltf"
                  multiple
                />
              </label>
              {rows.length === 0 ? (
                <p style={styles.note}>{WIZARD_HE.noFilesYet}</p>
              ) : (
                <div style={styles.fileList}>
                  <span style={styles.fileCount}>{WIZARD_HE.filesAdded(rows.length)}</span>
                  {rows.map((r, idx) => (
                    <div key={idx} style={styles.fileRow}>
                      <span style={styles.fileName} title={r.fileName}>{r.fileName}</span>
                      <span style={styles.fileKind}>{ASSETS_OBJ_HE.fileKind[r.fileKind] || r.fileKind}</span>
                      <button type="button" onClick={() => removeRow(idx)} style={styles.fileRemove}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {STEPS[step] === 'cover' && (
            <div style={styles.section}>
              <span style={styles.stepName}>{WIZARD_HE.coverTitle}</span>
              <p style={styles.note}>{WIZARD_HE.coverHint}</p>
              {imageRows.length === 0 ? (
                <p style={styles.note}>{WIZARD_HE.noImages}</p>
              ) : (
                <div style={styles.coverGrid}>
                  {imageRows.map(({ r, i }) => {
                    const isPrimary = primaryIndex === i;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPrimaryIndex(i)}
                        style={{ ...styles.coverCell, ...(isPrimary ? styles.coverCellActive : null) }}
                      >
                        <span style={styles.coverThumb} aria-hidden="true">▣</span>
                        <span style={styles.coverName} title={r.fileName}>{r.fileName}</span>
                        <span style={isPrimary ? styles.coverPrimary : styles.coverSet}>
                          {isPrimary ? WIZARD_HE.isPrimary : WIZARD_HE.setPrimary}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {STEPS[step] === 'next' && (
            <div style={styles.section}>
              <span style={styles.stepName}>{WIZARD_HE.nextActionQuestion}</span>
              <div style={styles.nextList}>
                {NEXT_ACTIONS.map((a) => {
                  const selected = nextAction === a.key;
                  if (!a.active) {
                    return (
                      <div key={a.key} style={{ ...styles.nextItem, ...styles.nextItemDisabled }}>
                        <span style={styles.nextLabelDisabled}>{a.label}</span>
                        <span style={styles.deferredBadge}>{WIZARD_HE.deferredBadge}</span>
                      </div>
                    );
                  }
                  return (
                    <button
                      key={a.key}
                      type="button"
                      onClick={() => setNextAction(a.key)}
                      style={{ ...styles.nextItem, ...(selected ? styles.nextItemActive : null) }}
                    >
                      <span style={styles.nextLabel}>{a.label}</span>
                      {selected && <span style={styles.nextCheck}>✓</span>}
                    </button>
                  );
                })}
              </div>
              <p style={styles.note}>{WIZARD_HE.deferredNote}</p>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div style={styles.footer}>
          <div style={styles.footerLeft}>
            {step > 0 && (
              <button type="button" onClick={goBack} style={styles.ghost} disabled={busy}>{WIZARD_HE.back}</button>
            )}
          </div>
          <div style={styles.footerRight}>
            <button type="button" onClick={onClose} style={styles.ghost} disabled={busy}>{WIZARD_HE.cancel}</button>
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={goNext} style={{ ...styles.primary, ...(!canNext() ? styles.primaryDisabled : null) }} disabled={!canNext()}>
                {WIZARD_HE.next}
              </button>
            ) : (
              <button type="button" onClick={handleSave} style={{ ...styles.primary, ...(busy || !title.trim() ? styles.primaryDisabled : null) }} disabled={busy || !title.trim()}>
                {busy ? '…' : WIZARD_HE.saveAsset}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(43,40,36,0.38)',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 14px', overflowY: 'auto',
  },
  modal: {
    width: '100%', maxWidth: '560px', background: tokens.color.ivory, border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.lg, boxShadow: tokens.shadow.lift, display: 'flex', flexDirection: 'column',
    maxHeight: 'calc(100vh - 48px)',
  },
  headRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', padding: '18px 18px 8px' },
  title: { fontFamily: tokens.font.display, fontSize: '22px', color: tokens.color.charcoal, margin: 0 },
  subtitle: { fontFamily: tokens.font.body, fontSize: '13px', color: tokens.color.inkSoft, margin: '4px 0 0' },
  close: { fontFamily: tokens.font.body, fontSize: '24px', lineHeight: 1, color: tokens.color.inkSoft, background: 'transparent', border: 'none', cursor: 'pointer', padding: '0 4px' },
  stepper: { display: 'flex', gap: '6px', padding: '4px 18px 12px', flexWrap: 'wrap' },
  stepDot: { width: '22px', height: '4px', borderRadius: '999px', background: tokens.color.cardEdge },
  stepDotActive: { background: tokens.color.gold },
  stepDotDone: { background: tokens.color.goldSoft },
  body: { padding: '4px 18px 8px', overflowY: 'auto' },
  section: { display: 'flex', flexDirection: 'column', gap: '10px' },
  stepName: { fontFamily: tokens.font.body, fontSize: '14px', fontWeight: 700, color: tokens.color.charcoal },
  fieldLabel: { fontFamily: tokens.font.body, fontSize: '12px', fontWeight: 600, color: tokens.color.inkSoft },
  input: { boxSizing: 'border-box', width: '100%', fontFamily: tokens.font.body, fontSize: '15px', color: tokens.color.ink, background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md, padding: '11px 13px', minHeight: '46px', outline: 'none' },
  select: { boxSizing: 'border-box', width: '100%', fontFamily: tokens.font.body, fontSize: '14px', color: tokens.color.ink, background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md, padding: '10px 12px', minHeight: '46px' },
  textarea: { boxSizing: 'border-box', width: '100%', fontFamily: tokens.font.body, fontSize: '14px', lineHeight: 1.6, color: tokens.color.ink, background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md, padding: '10px 12px', resize: 'vertical' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  chip: { minHeight: '40px', padding: '8px 14px', fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 600, color: tokens.color.charcoal, background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: '999px', cursor: 'pointer', whiteSpace: 'nowrap' },
  chipActive: { background: tokens.color.goldFaint, border: `1px solid ${tokens.color.gold}` },
  fields: { display: 'flex', flexDirection: 'column', gap: '8px' },
  note: { fontFamily: tokens.font.body, fontSize: '12px', color: tokens.color.inkFaint, margin: 0 },
  codeRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  codeLabel: { fontFamily: tokens.font.body, fontSize: '12px', color: tokens.color.inkSoft },
  codeValue: { fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em', color: tokens.color.gold, background: tokens.color.goldFaint, border: `1px solid ${tokens.color.goldSoft}`, borderRadius: '999px', padding: '2px 10px' },
  fieldGrid: { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 10px', alignItems: 'center' },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  tagChip: { display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: tokens.font.body, fontSize: '12px', fontWeight: 600, color: tokens.color.charcoal, background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: '999px', padding: '3px 8px' },
  tagRemove: { fontFamily: tokens.font.body, fontSize: '14px', lineHeight: 1, color: tokens.color.inkFaint, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 },
  suggestRow: { display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' },
  suggestLabel: { fontFamily: tokens.font.body, fontSize: '11px', color: tokens.color.inkFaint },
  suggestChip: { fontFamily: tokens.font.body, fontSize: '11px', fontWeight: 600, color: tokens.color.gold, background: 'transparent', border: `1px dashed ${tokens.color.goldSoft}`, borderRadius: '999px', padding: '3px 8px', cursor: 'pointer' },
  dropZone: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '22px', background: tokens.color.canvas, border: `1px dashed ${tokens.color.goldSoft}`, borderRadius: tokens.radius.md, cursor: 'pointer', textAlign: 'center' },
  dropGlyph: { fontSize: '24px', color: tokens.color.goldSoft },
  dropHint: { fontFamily: tokens.font.body, fontSize: '13px', color: tokens.color.inkSoft },
  fileList: { display: 'flex', flexDirection: 'column', gap: '6px' },
  fileCount: { fontFamily: tokens.font.body, fontSize: '12px', fontWeight: 600, color: tokens.color.sage },
  fileRow: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.sm },
  fileName: { flex: 1, fontFamily: tokens.font.body, fontSize: '13px', color: tokens.color.charcoal, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  fileKind: { fontFamily: tokens.font.body, fontSize: '11px', color: tokens.color.inkFaint },
  fileRemove: { fontFamily: tokens.font.body, fontSize: '16px', lineHeight: 1, color: tokens.color.inkFaint, background: 'transparent', border: 'none', cursor: 'pointer' },
  coverGrid: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  coverCell: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', width: '96px', padding: '8px', background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md, cursor: 'pointer' },
  coverCellActive: { border: `1px solid ${tokens.color.gold}`, background: tokens.color.goldFaint },
  coverThumb: { fontSize: '26px', color: tokens.color.goldSoft },
  coverName: { fontFamily: tokens.font.body, fontSize: '11px', color: tokens.color.charcoal, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' },
  coverPrimary: { fontFamily: tokens.font.body, fontSize: '11px', fontWeight: 600, color: tokens.color.gold },
  coverSet: { fontFamily: tokens.font.body, fontSize: '11px', color: tokens.color.inkSoft },
  nextList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  nextItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '12px 14px', background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md, cursor: 'pointer', textAlign: 'right', width: '100%' },
  nextItemActive: { border: `1px solid ${tokens.color.gold}`, background: tokens.color.goldFaint },
  nextItemDisabled: { opacity: 0.7, cursor: 'not-allowed', background: tokens.color.pearl },
  nextLabel: { fontFamily: tokens.font.body, fontSize: '14px', fontWeight: 600, color: tokens.color.charcoal },
  nextLabelDisabled: { fontFamily: tokens.font.body, fontSize: '14px', fontWeight: 600, color: tokens.color.disabledText },
  nextCheck: { color: tokens.color.gold, fontWeight: 700 },
  deferredBadge: { fontFamily: tokens.font.body, fontSize: '11px', fontWeight: 600, color: tokens.color.inkSoft, background: tokens.color.sageFaint, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: '999px', padding: '3px 9px', whiteSpace: 'nowrap' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', padding: '12px 18px 18px', borderTop: `1px solid ${tokens.color.cardEdge}`, marginTop: '8px' },
  footerLeft: { display: 'flex' },
  footerRight: { display: 'flex', gap: '8px' },
  primary: { minHeight: '46px', padding: '11px 24px', fontFamily: tokens.font.body, fontSize: '14px', fontWeight: 600, color: tokens.color.ivory, background: tokens.color.charcoal, border: 'none', borderRadius: tokens.radius.md, cursor: 'pointer' },
  primaryDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  ghost: { minHeight: '46px', padding: '11px 16px', fontFamily: tokens.font.body, fontSize: '14px', fontWeight: 600, color: tokens.color.inkSoft, background: 'transparent', border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md, cursor: 'pointer' },
};
