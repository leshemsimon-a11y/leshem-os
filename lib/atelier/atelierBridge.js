// lib/atelier/atelierBridge.js
//
// LESHEM.S OS — Clean 11A.1: Living Atelier functional bridge.
//
// A small adapter between components/atelier/* and the EXISTING public
// studio helpers/stores. Every function below either is a pure function or
// calls an existing PUBLIC store API verbatim. This file adds NO new
// persistence key, NO new store, and imports NOTHING from components/studio
// (legacy Studio UI) — only from lib/studio/* (pure helpers + existing
// stores) and lib/gemology/* where useful.
//
// Public APIs reused (all pre-existing, unmodified):
//   lib/studio/inventoryStore.js     — real manually-added inventory stones
//   lib/studio/demoGemstoneAssets.js — real seeded inventory layer (Clean 8H)
//   lib/studio/workTray.js           — Work Tray (temporary stone selection)
//   lib/studio/designDraft.js        — roles, brief schema, snapshot builder
//   lib/studio/designProjects.js     — Work File (Design Project) persistence
//   lib/studio/createFlow.js         — direction generator + brief builder
//   lib/studio/goldenPath.js         — free-text parsing + product-type
//                                       enforcement + resume-stage inference
//   lib/studio/fileDetection.js      — pure file-kind classifier
//
// Nothing here talks to Airtable, the network, or any protected store
// internals — every call below is a call to a function that file already
// exports for public use.

import { getItems as getInventoryItems } from '../studio/inventoryStore';
import {
  getDemoGemstoneRecords,
  getDemoStudioTrayItems,
} from '../studio/demoGemstoneAssets';
import {
  getTray,
  replaceTray,
  clearTray,
} from '../studio/workTray';
import {
  DESIGN_ROLE,
  normalizeRole,
  trayItemTitle,
  buildDesignSnapshot,
} from '../studio/designDraft';
import {
  saveProject,
  getProject,
  updateProject,
  getAllProjects,
} from '../studio/designProjects';
import {
  CREATE_PRODUCT_OPTIONS,
  CREATE_STYLE_OPTIONS,
  generateCreateDirections,
  buildCreateBrief,
  buildCreateWorkFileName,
} from '../studio/createFlow';
import {
  parseRequestHe,
  buildRequestUnderstandingHe,
  expectedProductTypeFor,
  enforceDirectionsProductType,
  isCreateFlowProject,
  deriveResumeStage,
  GOLDEN_STAGE,
} from '../studio/goldenPath';
import { detectFile } from '../studio/fileDetection';
import { createObjectWithFiles, linkObjectToProject } from '../studio/assetsStore';
import { buildRenderPackage, buildRenderPackagePatch } from '../studio/renderPromptFinalizer';
import {
  ATTACHED_ROLE,
  buildAttachedAssetRecord,
  upsertAttachedAsset,
} from '../studio/attachedAssets';
import {
  normalizeDesignConfig,
  designConfigSummaryHe,
  designConfigPromptEn,
  freedomLevelFromConfig,
  encodeConfigInNotes,
  decodeConfigFromNotes,
  renderPresetFromConfig,
  aspectRatioFromFormat,
} from './livingAtelier';

export { CREATE_PRODUCT_OPTIONS, CREATE_STYLE_OPTIONS, trayItemTitle };

// ---------------------------------------------------------------------------
// 1. Real stone selection
// ---------------------------------------------------------------------------

const STATUS_HE = {
  available: 'זמין',
  selected: 'נבחר',
  reserved: 'שמור',
  'in-design': 'בעיצוב',
  needsConfirmation: 'לאימות',
  unavailable: 'לא זמין',
  draft: 'טיוטה',
};

export function stoneAvailabilityHe(status) {
  return STATUS_HE[status] || 'במלאי';
}

function inventoryItemToStoneCard(item) {
  const s = item.stoneData || {};
  return {
    id: item.inventoryItemId,
    source: 'inventory',
    title: item.title,
    stoneType: s.stoneType,
    stoneTypeHe: s.stoneType || 'אבן',
    shape: s.shape,
    shapeHe: s.shape || '—',
    weightCt: typeof s.weightCt === 'number' ? s.weightCt : null,
    availability: item.availabilityStatus,
    image: null,
    raw: item,
  };
}

function demoRecordToStoneCard(record) {
  return {
    id: record.id,
    source: 'demo',
    title: record.titleHe || record.title,
    stoneType: record.stoneType,
    stoneTypeHe: record.stoneTypeHe,
    shape: record.shape,
    shapeHe: record.shapeHe,
    weightCt: record.estimatedCarat,
    availability: record.status,
    image: record.boxThumb || record.boxImage,
    raw: record,
  };
}

// The real, available stone catalog for the Atelier drawer: the studio's own
// manually-added inventory (usually empty on a fresh browser) PLUS the
// existing seeded demo inventory layer that already backs Work Tray / Asset
// Library elsewhere in the app. Both are real public read APIs; nothing here
// is fabricated for this milestone.
export function listAvailableStones() {
  const inventory = getInventoryItems()
    .filter((it) => it.itemType === 'stone')
    .map(inventoryItemToStoneCard);
  const demo = getDemoGemstoneRecords().map(demoRecordToStoneCard);
  return [...inventory, ...demo];
}

export function searchStones(query) {
  const q = (query || '').trim().toLowerCase();
  const all = listAvailableStones();
  if (!q) return all;
  return all.filter((s) =>
    [s.title, s.stoneTypeHe, s.shapeHe]
      .filter(Boolean)
      .some((v) => v.toLowerCase().includes(q))
  );
}

// Build a workTray-compatible item from a stone card. Demo stones reuse the
// demo layer's own richer tray-item snapshot (getDemoStudioTrayItems) so
// downstream logic (direction generation, brief building) sees an identical
// shape whether the stone came from the demo layer or real manual inventory.
function stoneCardToTrayItem(card, role) {
  if (card.source === 'demo') {
    const demoTrayItems = getDemoStudioTrayItems(50);
    const match = demoTrayItems.find((t) => t.id === `demo-tray-${card.raw.key}`);
    if (match) return { ...match, role: normalizeRole(role) };
  }
  return {
    id: card.id,
    role: normalizeRole(role),
    addedAt: Date.now(),
    snapshot: {
      name: card.title,
      productTypeHe: 'אבן מרכזית',
      stoneTypeHe: card.stoneTypeHe,
      shapeHe: card.shapeHe,
      caratWeight: card.weightCt,
      primaryImage: card.image,
      title: card.title,
      titleHe: card.title,
      stoneType: card.stoneType,
      shape: card.shape,
    },
  };
}

// Commit chosen stone card(s) as the Atelier's Work Tray selection. The
// first selection becomes the center stone; any further selections become
// side stones. Replaces the tray outright — an Atelier session works with
// one active stone selection at a time (existing workTray.replaceTray API).
export function commitStoneSelection(stoneCards) {
  const cards = Array.isArray(stoneCards) ? stoneCards : [];
  const items = cards.map((card, i) =>
    stoneCardToTrayItem(card, i === 0 ? DESIGN_ROLE.CENTER_STONE : DESIGN_ROLE.SIDE_STONE)
  );
  return replaceTray(items);
}

export function getCurrentTray() {
  return getTray();
}

export function getCenterStoneItem(trayItems) {
  const items = Array.isArray(trayItems) ? trayItems : getTray();
  return items.find((it) => normalizeRole(it.role) === DESIGN_ROLE.CENTER_STONE) || null;
}

export function getSelectedStoneCardIds(trayItems) {
  return (Array.isArray(trayItems) ? trayItems : getTray())
    .map((item) => {
      if (!item || typeof item.id !== 'string') return null;
      if (item.id.startsWith('demo-tray-')) return `demo-${item.id.slice('demo-tray-'.length)}`;
      return item.id;
    })
    .filter(Boolean);
}

export function clearStoneSelection() {
  return clearTray();
}

// ---------------------------------------------------------------------------
// 2. Universal intake — pure classification only. Nothing here touches
//    storage; the caller (the Atelier page) keeps the returned items in
//    local session state and passes them along at save time.
// ---------------------------------------------------------------------------

export const INTAKE_ROLE = Object.freeze({
  REFERENCE: 'reference', // image -> inspiration/reference
  SKETCH: 'sketch', // image with a sketch-like name -> sketch
  MODEL: 'model', // STL / OBJ / GLB / GLTF / 3DM -> model/reference
  CLIENT_FILE: 'clientFile', // PDF -> client file
  INSTRUCTION: 'instruction', // pasted/typed text -> design instruction
  LINK: 'link', // pasted URL -> reference link
  OTHER: 'other',
});

const INTAKE_ROLE_HE = {
  [INTAKE_ROLE.REFERENCE]: 'השראה / רפרנס',
  [INTAKE_ROLE.SKETCH]: 'סקיצה',
  [INTAKE_ROLE.MODEL]: 'קובץ מודל',
  [INTAKE_ROLE.CLIENT_FILE]: 'קובץ לקוח',
  [INTAKE_ROLE.INSTRUCTION]: 'הנחיית עיצוב',
  [INTAKE_ROLE.LINK]: 'קישור רפרנס',
  [INTAKE_ROLE.OTHER]: 'קובץ',
};

export function intakeRoleHe(role) {
  return INTAKE_ROLE_HE[role] || INTAKE_ROLE_HE[INTAKE_ROLE.OTHER];
}

let intakeSeq = 0;
function makeIntakeId() {
  intakeSeq += 1;
  return `atl_intake_${Date.now().toString(36)}_${intakeSeq}`;
}

// Classify a File using the EXISTING pure fileDetection.detectFile helper —
// data-only reuse of already-reviewed logic; no legacy intake UI, no writes.
export function classifyFile(file) {
  const detected = detectFile(file, {});
  let role = INTAKE_ROLE.OTHER;
  let attachedRole = ATTACHED_ROLE.MEDIA_ASSET;
  if (detected.fileKind === 'image') {
    role = detected.category === 'sketch' ? INTAKE_ROLE.SKETCH : INTAKE_ROLE.REFERENCE;
    attachedRole = detected.category === 'sketch' ? ATTACHED_ROLE.SKETCH : ATTACHED_ROLE.DESIGN_REFERENCE;
  } else if (detected.fileKind === 'model3d') {
    role = INTAKE_ROLE.MODEL;
    attachedRole = ATTACHED_ROLE.JEWELRY_MODEL;
  } else if (detected.fileKind === 'pdf') {
    role = INTAKE_ROLE.CLIENT_FILE;
    attachedRole = ATTACHED_ROLE.CLIENT_FILE;
  }
  let previewUrl = null;
  if (detected.fileKind === 'image' && typeof URL !== 'undefined' && URL.createObjectURL) {
    try {
      previewUrl = URL.createObjectURL(file);
    } catch (e) {
      previewUrl = null;
    }
  }
  const fileName = detected.fileName || (file && file.name) || 'קובץ';
  const extensionMatch = String(fileName).toLowerCase().match(/\.([a-z0-9]+)$/);
  return {
    id: makeIntakeId(),
    kind: 'file',
    role,
    roleHe: intakeRoleHe(role),
    attachedRole,
    name: fileName,
    mimeType: detected.mimeType || (file && file.type) || '',
    fileSize: detected.fileSize || (file && typeof file.size === 'number' ? file.size : null),
    fileKind: detected.fileKind || 'other',
    category: detected.category || 'other',
    extension: extensionMatch ? extensionMatch[1] : '',
    blob: file || null,
    previewUrl,
    assetId: null,
    addedAt: Date.now(),
  };
}

const URL_RE = /^(https?:\/\/|www\.)\S+$/i;

// Classify pasted/typed content as a reference URL vs. free-text instruction.
export function classifyPastedText(text) {
  const t = (text || '').trim();
  if (!t) return null;
  if (URL_RE.test(t) && !t.includes(' ')) {
    return {
      id: makeIntakeId(),
      kind: 'url',
      role: INTAKE_ROLE.LINK,
      roleHe: intakeRoleHe(INTAKE_ROLE.LINK),
      url: t,
      name: t,
      addedAt: Date.now(),
    };
  }
  return {
    id: makeIntakeId(),
    kind: 'text',
    role: INTAKE_ROLE.INSTRUCTION,
    roleHe: intakeRoleHe(INTAKE_ROLE.INSTRUCTION),
    text: t,
    name: t.length > 40 ? `${t.slice(0, 40)}…` : t,
    addedAt: Date.now(),
  };
}

// Reduce session intake items to small, serializable metadata for
// persistence on brief.references — an EXISTING array field already
// round-tripped verbatim by designDraft.js's normalizeBrief. Binary content
// itself (object URLs / raw File blobs) is intentionally NOT persisted here
// — see the persistence-gap note in CHANGELOG-CLEAN-10B.md.
export function intakeItemsToReferenceMetadata(intakeItems) {
  return (Array.isArray(intakeItems) ? intakeItems : []).map((it) => ({
    id: it.id,
    kind: it.kind,
    role: it.role,
    roleHe: it.roleHe,
    name: it.name || null,
    url: it.url || null,
    text: it.text || null,
    mimeType: it.mimeType || null,
    assetId: it.assetId || null,
    addedAt: it.addedAt,
  }));
}

function intakeReferenceSummaryHe(intakeItems) {
  const items = Array.isArray(intakeItems) ? intakeItems : [];
  if (!items.length) return '';
  const lines = [];
  items.forEach((it) => {
    if (!it) return;
    if (it.kind === 'text' && it.text) lines.push(`הנחיית עיצוב: ${it.text}`);
    else if (it.kind === 'url' && it.url) lines.push(`קישור רפרנס: ${it.url}`);
    else if (it.kind === 'file') lines.push(`${it.roleHe || 'קובץ'}: ${it.name || 'ללא שם'}`);
  });
  return lines.join('\n');
}

function intakeInstructionText(intakeItems) {
  return (Array.isArray(intakeItems) ? intakeItems : [])
    .filter((it) => it && it.kind === 'text' && typeof it.text === 'string')
    .map((it) => it.text.trim())
    .filter(Boolean)
    .join(' ');
}

export function hasCreationIntent({ requestText, selectedChips, intakeItems }) {
  const composed = composeRequestText(requestText, selectedChips);
  return Boolean([composed, intakeInstructionText(intakeItems)].filter(Boolean).join(' ').trim());
}

// ---------------------------------------------------------------------------
// 3. Normalized creation brief + "מה הבנתי" understanding
// ---------------------------------------------------------------------------

// Chips are folded into the same free-text the parser already understands,
// so a clicked chip ("תליון", "עדין"...) is exactly as effective as typing
// the word — one parser, one vocabulary, no separate chip-only code path.
export function composeRequestText(requestText, selectedChips) {
  const chips = Array.isArray(selectedChips) ? selectedChips : [];
  return [requestText || '', ...chips].filter((s) => s && s.trim()).join(' ');
}

export function buildUnderstanding({ requestText, trayItems, intakeItems, designConfig }) {
  const instructionText = intakeInstructionText(intakeItems);
  const normalizedIntent = [requestText || '', instructionText].filter(Boolean).join(' ').trim();
  const parsed = parseRequestHe(normalizedIntent);
  const config = normalizeDesignConfig(designConfig);
  const product = config.product || parsed.product;
  const style = config.style || parsed.style;
  const metalPreference = config.metalPreference || parsed.metalPreference;
  const styleMatches = [style, ...(parsed.styleMatches || [])].filter(
    (value, index, all) => value && all.indexOf(value) === index
  );
  const understandingHe = buildRequestUnderstandingHe({
    product,
    styleMatches,
    metalPreference,
    trayItems,
  });
  return {
    ...parsed,
    product,
    style,
    styleMatches,
    metalPreference,
    normalizedIntent,
    understandingHe,
    designSummaryHe: designConfigSummaryHe({ ...config, product, style, metalPreference }),
    designConfig: { ...config, product, style, metalPreference },
  };
}

// ---------------------------------------------------------------------------
// 4. Real direction generation (product type enforced in code)
// ---------------------------------------------------------------------------

export function generateDirectionsFor({
  product,
  style,
  trayItems,
  intakeItems,
  requestText,
  designConfig,
}) {
  const config = normalizeDesignConfig({ ...designConfig, product, style });
  const referenceText = [
    intakeReferenceSummaryHe(intakeItems),
    designConfigSummaryHe(config),
  ]
    .filter(Boolean)
    .join('\n');
  const structuredPrompt = designConfigPromptEn(config);
  const raw = generateCreateDirections({ product, style, trayItems, referenceText, requestText });
  const expected = expectedProductTypeFor(product);
  const { directions } = enforceDirectionsProductType(raw, expected);
  return directions.map((direction) => ({
    ...direction,
    renderBriefText: [direction.renderBriefText, structuredPrompt].filter(Boolean).join(' '),
  }));
}

// ---------------------------------------------------------------------------
// 5. Durable file intake persistence (existing Asset Library public APIs)
// ---------------------------------------------------------------------------

function objectTypeForIntake(item) {
  if (item.role === INTAKE_ROLE.MODEL) return 'jewelryModel';
  if (item.role === INTAKE_ROLE.CLIENT_FILE) return 'clientReference';
  return 'inspiration';
}

function fileKindForIntake(item) {
  if (item.fileKind === 'image') return 'image';
  if (item.fileKind === 'model3d') return 'model3d';
  if (item.fileKind === 'pdf') return 'pdf';
  return 'other';
}

export async function persistIntakeFiles({ projectId, intakeItems }) {
  const items = Array.isArray(intakeItems) ? intakeItems : [];
  if (!projectId) return { items, attachedAssets: [], failedNames: [] };
  const project = getProject(projectId);
  let attachedAssets = project && Array.isArray(project.assets) ? project.assets.slice() : [];
  const failedNames = [];
  const nextItems = [];

  for (const item of items) {
    if (!item || item.kind !== 'file' || !item.blob || item.assetId) {
      nextItems.push(item);
      continue;
    }
    try {
      // eslint-disable-next-line no-await-in-loop
      const result = await createObjectWithFiles(
        {
          title: item.name || 'חומר עבודה',
          objectType: objectTypeForIntake(item),
          description: 'נקלט דרך Atelier',
          status: 'draft',
          destinationType: 'inspiration',
          sourceType: null,
          assetRole: item.attachedRole || ATTACHED_ROLE.DESIGN_REFERENCE,
        },
        [
          {
            file: item.blob,
            fileName: item.name,
            mimeType: item.mimeType || (item.blob && item.blob.type) || '',
            extension: item.extension || '',
            fileSize: item.fileSize,
            fileKind: fileKindForIntake(item),
            filePurpose: 'renderReference',
            category: item.category || 'other',
            status: 'approved',
          },
        ],
        0
      );
      if (!result || !result.object) throw new Error('asset-create-failed');
      // eslint-disable-next-line no-await-in-loop
      await linkObjectToProject(result.object.objectId, projectId);
      const record = buildAttachedAssetRecord({
        object: result.object,
        files: result.files || [],
        role: item.attachedRole || ATTACHED_ROLE.DESIGN_REFERENCE,
        previewFileId: result.object.primaryFileId || null,
      });
      if (record) attachedAssets = upsertAttachedAsset(attachedAssets, record);
      nextItems.push({ ...item, assetId: result.object.objectId, blob: null });
    } catch (e) {
      failedNames.push(item.name || 'קובץ');
      nextItems.push(item);
    }
  }

  if (attachedAssets.length) updateProject(projectId, { assets: attachedAssets });
  return { items: nextItems, attachedAssets, failedNames };
}

// ---------------------------------------------------------------------------
// 6. Real Work File save (existing designProjects.js public API only)
// ---------------------------------------------------------------------------

export function buildBriefFromAtelier({
  product,
  style,
  trayItems,
  intakeItems,
  requestText,
  directions,
  selectedDirectionId,
  designConfig,
}) {
  const config = normalizeDesignConfig({ ...designConfig, product, style });
  const referenceText = [
    intakeReferenceSummaryHe(intakeItems),
    designConfigSummaryHe(config),
  ]
    .filter(Boolean)
    .join('\n');
  const brief = buildCreateBrief(
    { product, style, trayItems, referenceText, requestText },
    directions,
    selectedDirectionId
  );
  return {
    ...brief,
    metalPreference: config.metalPreference || brief.metalPreference || null,
    styleDirection: config.style || brief.styleDirection || null,
    freedomLevel: freedomLevelFromConfig(config),
    notes: encodeConfigInNotes(brief.notes, config),
    references: intakeItemsToReferenceMetadata(intakeItems),
  };
}

export function saveAtelierWorkFile({ existingProjectId, product, trayItems, brief }) {
  const snapshot = buildDesignSnapshot(trayItems, brief);
  if (existingProjectId) {
    return updateProject(existingProjectId, { trayItems, brief, snapshot });
  }
  const name = buildCreateWorkFileName({ product });
  return saveProject({ name, trayItems, brief, snapshot, context: {} });
}

export function getDesignConfigFromBrief(brief) {
  return decodeConfigFromNotes(brief && brief.notes);
}

function renderSceneInstruction(renderConfig) {
  const config = renderConfig || {};
  const scene = {
    catalog: 'Pure white luxury jewelry catalog background with restrained premium reflections.',
    client: 'Elegant client-presentation composition on a soft warm neutral background.',
    macro: 'Extreme macro crop focused on the gemstone, setting and metal craftsmanship.',
    editorial: 'Refined editorial luxury composition with controlled dramatic lighting.',
  }[config.scene] || 'Pure white luxury jewelry catalog background.';
  const angle = {
    front: 'Direct front view with the pendant hanging naturally and centered.',
    threeQuarter: 'Three-quarter view showing depth, bail construction and stone setting.',
    side: 'Side profile view showing realistic setting height and production construction.',
  }[config.angle] || 'Three-quarter view showing realistic depth.';
  const creativity = {
    precise: 'Follow the selected stone, proportions and design direction very closely.',
    balanced: 'Preserve the selected design while allowing tasteful professional refinement.',
    expressive: 'Allow a stronger designer interpretation while keeping production feasibility.',
  }[config.creativity] || 'Preserve the selected design while allowing tasteful professional refinement.';
  return [scene, angle, creativity].join(' ');
}

export function prepareAtelierRender({ projectId, renderConfig }) {
  const project = getProject(projectId);
  if (!project) return null;
  const preset = renderPresetFromConfig(renderConfig);
  const pkg = buildRenderPackage(project, preset, {
    aspectRatio: aspectRatioFromFormat(renderConfig && renderConfig.format),
    outputCount:
      renderConfig && typeof renderConfig.count === 'number' ? renderConfig.count : 1,
    quality: renderConfig && renderConfig.quality === 'ultra' ? 'ultra' : 'high',
    suggestedTool: 'stability',
  });
  const instruction = renderSceneInstruction(renderConfig);
  const packageWithControls = {
    ...pkg,
    finalPromptEnglish: [pkg.finalPromptEnglish, instruction].filter(Boolean).join('\n'),
  };
  const patch = buildRenderPackagePatch(project, packageWithControls);
  const updatedProject = patch ? updateProject(projectId, patch) : project;
  return { project: updatedProject || project, package: packageWithControls };
}

function dataUrlToBlob(dataUrl) {
  if (typeof dataUrl !== 'string') return null;
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match || typeof atob !== 'function') return null;
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: match[1] || 'image/jpeg' });
}

export async function persistAtelierRenderResult({
  projectId,
  dataUrl,
  provider,
  prompt,
  index,
}) {
  const project = getProject(projectId);
  if (!project) throw new Error('project-not-found');
  const blob = dataUrlToBlob(dataUrl);
  if (!blob) throw new Error('invalid-render-image');
  const extension = blob.type === 'image/png' ? 'png' : 'jpg';
  const fileName = `leshems-render-${Date.now()}-${Number(index || 0) + 1}.${extension}`;
  const result = await createObjectWithFiles(
    {
      title: `הדמיית Atelier · ${Number(index || 0) + 1}`,
      objectType: 'renderOutput',
      description: 'תוצאת הדמיה שנוצרה מתוך תיק היצירה ב-Atelier',
      status: 'approved',
      destinationType: 'approvedMedia',
      sourceType: 'generatedBySystem',
      assetRole: ATTACHED_ROLE.MEDIA_ASSET,
    },
    [
      {
        file: blob,
        fileName,
        mimeType: blob.type,
        extension,
        fileSize: blob.size,
        fileKind: 'image',
        filePurpose: 'renderReference',
        category: 'renderImage',
        status: 'approved',
      },
    ],
    0
  );
  if (!result || !result.object) throw new Error('render-asset-save-failed');
  await linkObjectToProject(result.object.objectId, projectId);
  const attached = buildAttachedAssetRecord({
    object: result.object,
    files: result.files || [],
    role: ATTACHED_ROLE.MEDIA_ASSET,
    previewFileId: result.object.primaryFileId || null,
  });
  const assets = attached ? upsertAttachedAsset(project.assets, attached) : project.assets;
  const renderRecord = {
    renderId: `atl_render_${Date.now().toString(36)}_${Number(index || 0) + 1}`,
    kind: 'atelierRenderResult',
    assetId: result.object.objectId,
    previewFileId: result.object.primaryFileId || null,
    provider: typeof provider === 'string' ? provider : 'stability',
    prompt: typeof prompt === 'string' ? prompt : '',
    createdAt: Date.now(),
  };
  const renders = [renderRecord, ...(Array.isArray(project.renders) ? project.renders : [])];
  const updatedProject = updateProject(projectId, { assets, renders });
  return {
    project: updatedProject,
    assetId: result.object.objectId,
    previewFileId: result.object.primaryFileId || null,
  };
}

// ---------------------------------------------------------------------------
// 7. Reopen an existing creation ("היצירות שלי")
// ---------------------------------------------------------------------------

const RESUME_SCREEN_BY_STAGE = {
  [GOLDEN_STAGE.STONE]: 'stone-request',
  [GOLDEN_STAGE.REQUEST]: 'stone-request',
  [GOLDEN_STAGE.UNDERSTANDING]: 'understanding',
  [GOLDEN_STAGE.DIRECTIONS]: 'directions',
  [GOLDEN_STAGE.REFINE]: 'render-studio',
  [GOLDEN_STAGE.PRESENTATION]: 'render-studio',
};

// Only Work Files created through the Atelier's create-flow brief marker are
// listed here (the SAME marker/guard createFlow.js + goldenPath.js already
// use) — Work Files created elsewhere in the app are not surfaced in this
// drawer, exactly as spec'd ("do not route to the legacy Projects UI").
export function listAtelierWorkFiles() {
  return getAllProjects()
    .filter(isCreateFlowProject)
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .map((p) => {
      const center = getCenterStoneItem(p.trayItems);
      const coverImage = center && center.snapshot ? center.snapshot.primaryImage || center.snapshot.boxImage : null;
      return {
        id: p.id,
        name: p.name,
        status: p.status,
        updatedAt: p.updatedAt,
        coverImage,
        stoneTitle: center ? trayItemTitle(center) : null,
        productType: p.brief ? p.brief.productType : null,
      };
    });
}

// Reopens a saved creation at the nearest safe state: replaces the real
// Work Tray with the project's saved stones (existing workTray.replaceTray),
// and derives which screen to resume on from the SAME resume-stage logic
// goldenPath.js already uses (no new inference, no new persisted field).
export function resumeAtelierWorkFile(id) {
  const project = getProject(id);
  if (!project) return null;
  replaceTray(project.trayItems);
  const stage = deriveResumeStage(project.brief, project.trayItems);
  return {
    project,
    screen: RESUME_SCREEN_BY_STAGE[stage] || 'stone-request',
  };
}
