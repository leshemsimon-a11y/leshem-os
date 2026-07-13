// lib/studio/renderSceneLibrary.js
//
// LESHEM.S OS — Clean 8J: Render Studio Scene Library.
//
// PURE helper — constants and pure functions only. Adds a structured layer
// of render PACKS and SCENES on top of the Clean 8I prompt finalizer, plus
// quality levels with credit/USD cost estimates and BATCH PLANNING (a
// planned set of scenes and outputs — nothing is generated or sent
// anywhere). NO external API, NO image generation, NO render engine, NO
// package, NO store, NO new persistence key.
//
// Integration with Clean 8I (not a rebuild of it): buildRenderBatchPlan()
// calls the EXISTING lib/studio/renderPromptFinalizer.js buildRenderPackage
// / buildNegativePromptEn — reusing every bit of its product/style/metal/
// stone/cluster/direction/asset/warning logic — and supplies a `sceneOverride`
// (the additive, optional 3rd param added in Clean 8J) so the opener/closing
// sentence and recommended settings reflect the chosen scene instead of a
// flat preset. The Clean 8I preset-based flow (RenderPromptPanel) is
// completely untouched and keeps working exactly as it did.
//
// PERSISTENCE (public API only): a render batch plan is stored as ONE
// `kind: 'renderBatchPlan'` record inside the project's EXISTING reserved
// `renders` array — the same Clean 8E/8I kind-discriminated,
// foreign-record-preserving upsert pattern. Saving happens ONLY in the
// caller through the EXISTING public updateProject(id, { renders }). This is
// NOT a new persistence key: it is one more record kind inside the array
// that has held media-workflow state, media results, and the 8I render
// package since Clean 8E/8I.

import {
  RENDER_PRESET,
  buildRenderPackage,
} from './renderPromptFinalizer';
import { MEDIA_TOOL } from './mediaWorkflow';

// ---------------------------------------------------------------------------
// Quality levels — canonical English values + Hebrew labels + suggested
// engine + credit cost per image (1 credit = $0.01, per spec).
// ---------------------------------------------------------------------------
export const RENDER_QUALITY = Object.freeze({
  DRAFT: 'draft',
  STANDARD: 'standard',
  HIGH: 'high',
});

export const RENDER_QUALITY_VALUES = Object.freeze(Object.values(RENDER_QUALITY));

export const DEFAULT_RENDER_QUALITY = RENDER_QUALITY.HIGH;

export const CREDIT_USD_RATE = 0.01; // 1 credit = $0.01

const QUALITY_PROFILE = Object.freeze({
  draft: Object.freeze({
    nameHe: 'טיוטה',
    purposeHe: 'טיוטה מהירה לבדיקת כיוון',
    suggestedEngineEn: 'Stable Image Core',
    costPerImageCredits: 3,
  }),
  standard: Object.freeze({
    nameHe: 'סטנדרטי',
    purposeHe: 'תוצאה משופרת לבחירה',
    suggestedEngineEn: 'SD3.5 Large or Core',
    costPerImageCredits: 6.5,
  }),
  high: Object.freeze({
    nameHe: 'גבוהה',
    purposeHe: 'איכות ברמת לקוח',
    suggestedEngineEn: 'Stable Image Ultra',
    costPerImageCredits: 8,
  }),
});

export function isValidRenderQuality(v) {
  return RENDER_QUALITY_VALUES.includes(v);
}

export function getQualityProfile(v) {
  return QUALITY_PROFILE[isValidRenderQuality(v) ? v : DEFAULT_RENDER_QUALITY];
}

export function qualityNameHe(v) {
  return getQualityProfile(v).nameHe;
}

export function listQualityLevels() {
  return RENDER_QUALITY_VALUES.map((v) => ({ id: v, ...QUALITY_PROFILE[v] }));
}

// ---------------------------------------------------------------------------
// Scenes — canonical English background/angle values + Hebrew labels + the
// English opener/scene sentences buildRenderBatchPlan feeds into the Clean
// 8I finalizer's sceneOverride. Every English string is plain ASCII.
// ---------------------------------------------------------------------------
export const SCENE_BACKGROUND = Object.freeze({
  WHITE: 'white',
  LIGHT_NEUTRAL: 'lightNeutral',
  DARK_GRAPHITE: 'darkGraphite',
  SOFT_BRIGHT_STUDIO: 'softBrightStudio',
  NATURAL_HAND_STUDIO: 'naturalHandStudio',
  MODEL_BODY_CONTEXT: 'modelBodyContext',
  CLEAN_STUDIO: 'cleanStudio',
});

export const SCENE_ANGLE = Object.freeze({
  FRONT: 'front',
  THREE_QUARTER: 'threeQuarter',
  MACRO: 'macro',
  SLIGHT_ANGLE: 'slightAngle',
  ON_HAND: 'onHand',
  ON_MODEL: 'onModel',
});

const SCENES_BY_ID = Object.freeze({
  'SC-01': Object.freeze({
    id: 'SC-01',
    nameHe: 'קטלוג לבן — פרונט',
    background: SCENE_BACKGROUND.WHITE,
    angle: SCENE_ANGLE.FRONT,
    aspectRatio: '1:1',
    useHe: 'תמונת מוצר ראשית',
    openerEn: 'Professional catalog jewelry photograph, front-facing composition',
    sceneEn:
      'Clean white catalog background, accurate jewelry proportions, professional product photography, front-facing composition.',
  }),
  'SC-02': Object.freeze({
    id: 'SC-02',
    nameHe: 'קטלוג לבן — זווית 3/4',
    background: SCENE_BACKGROUND.WHITE,
    angle: SCENE_ANGLE.THREE_QUARTER,
    aspectRatio: '1:1',
    useHe: 'עומק ונוכחות המוצר',
    openerEn: 'Professional catalog jewelry photograph, three-quarter angle composition',
    sceneEn:
      'Clean white catalog background, three-quarter angle composition showing depth and dimension, professional product photography, accurate jewelry proportions.',
  }),
  'SC-03': Object.freeze({
    id: 'SC-03',
    nameHe: 'מאקרו פרטים',
    background: SCENE_BACKGROUND.LIGHT_NEUTRAL,
    angle: SCENE_ANGLE.MACRO,
    aspectRatio: '1:1',
    useHe: 'אבנים, שיבוץ ופרטי מתכת',
    openerEn: 'Professional macro jewelry photograph, extreme close-up detail',
    sceneEn:
      'Extreme macro close-up on stones, setting, and metalwork, soft neutral white-to-light-grey background, crisp facet and surface detail, professional macro product photography.',
  }),
  'SC-04': Object.freeze({
    id: 'SC-04',
    nameHe: 'יוקרתי כהה',
    background: SCENE_BACKGROUND.DARK_GRAPHITE,
    angle: SCENE_ANGLE.THREE_QUARTER,
    aspectRatio: '4:5',
    useHe: 'הצגה יוקרתית ללקוח',
    openerEn: 'Premium client-facing luxury jewelry photograph, dark editorial styling',
    sceneEn:
      'Dark graphite luxury studio background, premium jewelry presentation, controlled reflections, three-quarter angle composition.',
  }),
  'SC-05': Object.freeze({
    id: 'SC-05',
    nameHe: 'Editorial רך',
    background: SCENE_BACKGROUND.SOFT_BRIGHT_STUDIO,
    angle: SCENE_ANGLE.SLIGHT_ANGLE,
    aspectRatio: '4:5',
    useHe: 'שיווק ופרזנטציה',
    openerEn: 'Soft editorial marketing jewelry photograph',
    sceneEn:
      'Soft bright editorial studio background, gentle directional lighting, elegant slight-angle composition, marketing-ready presentation style.',
  }),
  'SC-06': Object.freeze({
    id: 'SC-06',
    nameHe: 'על יד',
    background: SCENE_BACKGROUND.NATURAL_HAND_STUDIO,
    angle: SCENE_ANGLE.ON_HAND,
    aspectRatio: '4:5',
    useHe: 'טבעות וצמידים',
    openerEn: 'Lifestyle jewelry photograph worn on a natural hand',
    sceneEn:
      'Jewelry worn on a natural elegant hand, realistic scale and proportions, soft studio lighting, natural hand pose.',
  }),
  'SC-07': Object.freeze({
    id: 'SC-07',
    nameHe: 'על דוגמנית',
    background: SCENE_BACKGROUND.MODEL_BODY_CONTEXT,
    angle: SCENE_ANGLE.ON_MODEL,
    aspectRatio: '4:5',
    // Spec allows 4:5 or 9:16 for this scene; 4:5 is the canonical default
    // kept consistent with the rest of the on-body scenes. No UI control
    // switches this — keeping the choice simple, per the milestone's "do
    // not make this technical" rule.
    altAspectRatio: '9:16',
    useHe: 'עגילים, שרשראות ותליונים',
    openerEn: 'Lifestyle jewelry photograph worn on a model',
    sceneEn:
      'Jewelry presented on a model in an elegant body context, realistic scale and natural pose, soft premium studio lighting.',
  }),
  'SC-08': Object.freeze({
    id: 'SC-08',
    nameHe: 'קומפוזיציית קלאסטר',
    background: SCENE_BACKGROUND.CLEAN_STUDIO,
    angle: SCENE_ANGLE.THREE_QUARTER,
    // Spec allows three_quarter or top_macro; three_quarter kept canonical.
    aspectRatio: '1:1',
    useHe: 'תכשיטים מרובי אבנים וקלאסטר',
    openerEn: 'Professional jewelry photograph featuring a cluster composition',
    sceneEn:
      'Balanced cluster composition, intentional gemstone grouping, production-feasible setting layout, clean studio background.',
  }),
});

export const SCENE_IDS = Object.freeze(Object.keys(SCENES_BY_ID));

export function getScene(id) {
  return SCENES_BY_ID[id] || null;
}

export function listScenes() {
  return SCENE_IDS.map((id) => SCENES_BY_ID[id]);
}

// ---------------------------------------------------------------------------
// Render Packs — Hebrew label + purpose + ordered scene ids + default
// output count per scene (per spec).
// ---------------------------------------------------------------------------
const PACKS_BY_ID = Object.freeze({
  catalog: Object.freeze({
    id: 'catalog',
    nameHe: 'חבילת קטלוג',
    purposeHe: 'תמונות קטלוג מוצר',
    sceneIds: Object.freeze(['SC-01', 'SC-02', 'SC-03']),
    defaultOutputsPerScene: 4,
  }),
  client: Object.freeze({
    id: 'client',
    nameHe: 'חבילת לקוח',
    purposeHe: 'פרזנטציה ללקוח',
    sceneIds: Object.freeze(['SC-01', 'SC-04', 'SC-05']),
    defaultOutputsPerScene: 4,
  }),
  social: Object.freeze({
    id: 'social',
    nameHe: 'חבילת סושיאל',
    purposeHe: 'Instagram / שיווק',
    sceneIds: Object.freeze(['SC-05', 'SC-04', 'SC-08']),
    defaultOutputsPerScene: 3,
  }),
  handModel: Object.freeze({
    id: 'handModel',
    nameHe: 'חבילת יד / דוגמנית',
    purposeHe: 'תכשיט על הגוף',
    sceneIds: Object.freeze(['SC-06', 'SC-07']),
    defaultOutputsPerScene: 3,
  }),
});

export const PACK_IDS = Object.freeze(Object.keys(PACKS_BY_ID));

export const DEFAULT_PACK_ID = 'catalog';
export const DEFAULT_SCENE_ID = 'SC-02'; // Catalog White 3/4, per spec defaults

export function getPack(id) {
  return PACKS_BY_ID[id] || null;
}

export function listPacks() {
  return PACK_IDS.map((id) => PACKS_BY_ID[id]);
}

// Scene objects (not just ids) for a pack, in the pack's defined order.
export function scenesForPack(packId) {
  const pack = getPack(packId) || getPack(DEFAULT_PACK_ID);
  return pack.sceneIds.map((id) => getScene(id)).filter(Boolean);
}

// Resolve a valid scene id for a pack: keep the requested one if it actually
// belongs to the pack, otherwise fall back to the pack's first scene.
export function resolveSceneIdForPack(packId, requestedSceneId) {
  const scenes = scenesForPack(packId);
  if (requestedSceneId && scenes.some((s) => s.id === requestedSceneId)) return requestedSceneId;
  return scenes.length ? scenes[0].id : DEFAULT_SCENE_ID;
}

// ---------------------------------------------------------------------------
// Cost estimation — credits + USD, per image / per scene selection / per
// whole pack (summed across the pack's scenes at their own default output
// counts). 1 credit = $0.01 (CREDIT_USD_RATE).
// ---------------------------------------------------------------------------
function roundUsd(usd) {
  return Math.round(usd * 100) / 100;
}

export function estimateCost({ quality, outputCount } = {}) {
  const q = getQualityProfile(quality);
  const count = Number.isFinite(outputCount) && outputCount > 0 ? Math.round(outputCount) : 1;
  const credits = Math.round(q.costPerImageCredits * count * 100) / 100;
  const usd = roundUsd(credits * CREDIT_USD_RATE);
  return { perImageCredits: q.costPerImageCredits, outputCount: count, credits, usd };
}

// Hebrew cost line matching the exact spec example format:
// "עלות משוערת: 4 תמונות × 8 קרדיטים = 32 קרדיטים ≈ $0.32"
export function estimateCostLineHe({ quality, outputCount } = {}) {
  const est = estimateCost({ quality, outputCount });
  return `עלות משוערת: ${est.outputCount} תמונות × ${est.perImageCredits} קרדיטים = ${est.credits} קרדיטים ≈ $${est.usd.toFixed(2)}`;
}

// Total cost for an entire pack: every scene in the pack at the pack's own
// default-outputs-per-scene, at the given quality.
export function estimateForPack(packId, quality, outputCount) {
  const scenes = scenesForPack(packId);
  const pack = getPack(packId) || getPack(DEFAULT_PACK_ID);
  const perSceneOutputs =
    Number.isFinite(outputCount) && outputCount > 0
      ? Math.round(outputCount)
      : pack.defaultOutputsPerScene;
  const totalImages = scenes.length * perSceneOutputs;
  const est = estimateCost({ quality, outputCount: totalImages });
  return { ...est, sceneCount: scenes.length, perSceneOutputs, totalImages };
}

export function estimateForPackLineHe(packId, quality, outputCount) {
  const est = estimateForPack(packId, quality, outputCount);
  return `עלות כוללת לחבילה: ${est.sceneCount} סצנות × ${est.perSceneOutputs} תמונות לכל סצנה (${est.totalImages} סה"כ) × ${est.perImageCredits} קרדיטים = ${est.credits} קרדיטים ≈ $${est.usd.toFixed(2)}`;
}

// ---------------------------------------------------------------------------
// buildRenderBatchPlan(project, selection) → the full Render Studio result:
// resolved pack/scene/quality, the Clean-8I-integrated final prompt +
// negative prompt (via sceneOverride), per-selection and per-pack cost
// estimates, and the Clean 8J "future API readiness" data shape (never
// called — data preparation only).
// ---------------------------------------------------------------------------
export function buildRenderBatchPlan(project, selection) {
  const sel = selection || {};
  const pack = getPack(sel.packId) || getPack(DEFAULT_PACK_ID);
  const sceneId = resolveSceneIdForPack(pack.id, sel.sceneId || DEFAULT_SCENE_ID);
  const quality = isValidRenderQuality(sel.qualityId) ? sel.qualityId : DEFAULT_RENDER_QUALITY;
  const outputCount =
    Number.isFinite(sel.outputCount) && sel.outputCount > 0
      ? Math.round(sel.outputCount)
      : pack.defaultOutputsPerScene;
  const qualityProfile = getQualityProfile(quality);

  // Build one complete API-ready item for every scene in the selected pack.
  // This is still planning-only: nothing is sent to an external service.
  const batchItems = scenesForPack(pack.id).map((scene) => {
    const pkg = buildRenderPackage(project, RENDER_PRESET.CATALOG, {
      openerEn: scene.openerEn,
      sceneEn: scene.sceneEn,
      aspectRatio: scene.aspectRatio,
      outputCount,
      quality,
      suggestedTool: MEDIA_TOOL.STABILITY,
    });
    const estimate = estimateCost({ quality, outputCount });
    return {
      sceneId: scene.id,
      sceneNameHe: scene.nameHe,
      sceneUseHe: scene.useHe,
      background: scene.background,
      angle: scene.angle,
      aspectRatio: scene.aspectRatio,
      outputCount,
      engine: qualityProfile.suggestedEngineEn,
      finalPromptEnglish: pkg.finalPromptEnglish,
      negativePromptEnglish: pkg.negativePromptEnglish,
      promptHebrewSummary: pkg.promptHebrewSummary,
      sourceContextSummary: pkg.sourceContextSummary,
      warnings: pkg.warnings,
      estimatedCredits: estimate.credits,
      estimatedUsd: estimate.usd,
      futureApiRequest: {
        engine: qualityProfile.suggestedEngineEn,
        prompt: pkg.finalPromptEnglish,
        negativePrompt: pkg.negativePromptEnglish,
        aspectRatio: scene.aspectRatio,
        outputCount,
        sceneId: scene.id,
        packId: pack.id,
        quality,
        estimatedCredits: estimate.credits,
        estimatedUsd: estimate.usd,
        workFileId: project && project.id ? project.id : null,
      },
    };
  });

  const selectedItem = batchItems.find((item) => item.sceneId === sceneId) || batchItems[0];
  const scene = getScene(selectedItem.sceneId);
  const selectionEstimate = estimateCost({ quality, outputCount });
  const packEstimate = estimateForPack(pack.id, quality, outputCount);

  return {
    packId: pack.id,
    packNameHe: pack.nameHe,
    packPurposeHe: pack.purposeHe,
    packScenes: scenesForPack(pack.id),
    sceneId: selectedItem.sceneId,
    sceneNameHe: selectedItem.sceneNameHe,
    sceneUseHe: selectedItem.sceneUseHe,
    qualityId: quality,
    qualityNameHe: qualityProfile.nameHe,
    qualityPurposeHe: qualityProfile.purposeHe,
    engine: qualityProfile.suggestedEngineEn,
    aspectRatio: scene.aspectRatio,
    outputCount,

    // Selected-scene preview.
    title: `${selectedItem.sceneNameHe} — ${pack.nameHe}`,
    finalPromptEnglish: selectedItem.finalPromptEnglish,
    negativePromptEnglish: selectedItem.negativePromptEnglish,
    promptHebrewSummary: selectedItem.promptHebrewSummary,
    sourceContextSummary: selectedItem.sourceContextSummary,
    warnings: selectedItem.warnings,

    // Real batch plan for the complete pack.
    batchItems,

    // Cost estimates.
    estimatedCredits: selectionEstimate.credits,
    estimatedUsd: selectionEstimate.usd,
    estimatedCostLineHe: estimateCostLineHe({ quality, outputCount }),
    packEstimatedCredits: packEstimate.credits,
    packEstimatedUsd: packEstimate.usd,
    packTotalImages: packEstimate.totalImages,
    packCostLineHe: estimateForPackLineHe(pack.id, quality, outputCount),

    // Backward-compatible selected-scene request plus a complete pack request.
    futureApiRequest: selectedItem.futureApiRequest,
    futureApiBatchRequest: {
      packId: pack.id,
      quality,
      outputCountPerScene: outputCount,
      estimatedCredits: packEstimate.credits,
      estimatedUsd: packEstimate.usd,
      totalImages: packEstimate.totalImages,
      workFileId: project && project.id ? project.id : null,
      items: batchItems.map((item) => item.futureApiRequest),
    },
  };
}

// ---------------------------------------------------------------------------
// Persistence — ONE `kind: 'renderBatchPlan'` record inside the project's
// EXISTING reserved `renders` array (the exact Clean 8E/8I pattern; foreign
// records — media state, media results, the 8I render package — are always
// preserved untouched). Saved ONLY through the EXISTING public
// updateProject(id, patch) in the caller.
// ---------------------------------------------------------------------------
export const RENDER_BATCH_PLAN_KIND = 'renderBatchPlan';
export const RENDER_BATCH_PLAN_ID = 'renderBatchPlanPrimary';

export function isRenderBatchPlanRecord(r) {
  return Boolean(r && typeof r === 'object' && r.kind === RENDER_BATCH_PLAN_KIND);
}

function rendersOf(project) {
  return project && Array.isArray(project.renders) ? project.renders : [];
}

// Read the saved batch plan selection (null when none was saved yet).
export function getSavedRenderBatchPlan(project) {
  const raw = rendersOf(project).find(isRenderBatchPlanRecord);
  if (!raw) return null;
  return {
    packId: getPack(raw.packId) ? raw.packId : DEFAULT_PACK_ID,
    sceneId: typeof raw.sceneId === 'string' ? raw.sceneId : DEFAULT_SCENE_ID,
    qualityId: isValidRenderQuality(raw.qualityId) ? raw.qualityId : DEFAULT_RENDER_QUALITY,
    outputCount: typeof raw.outputCount === 'number' ? raw.outputCount : null,
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : null,
  };
}

// buildRenderBatchPlanPatch(project, plan) → { renders } — upserts the
// single batch-plan record; every other record (including the Clean 8I
// render package) is kept exactly as it is.
export function buildRenderBatchPlanPatch(project, plan) {
  if (!plan || typeof plan !== 'object') return null;
  const record = {
    renderId: RENDER_BATCH_PLAN_ID,
    kind: RENDER_BATCH_PLAN_KIND,
    packId: getPack(plan.packId) ? plan.packId : DEFAULT_PACK_ID,
    sceneId: typeof plan.sceneId === 'string' ? plan.sceneId : DEFAULT_SCENE_ID,
    qualityId: isValidRenderQuality(plan.qualityId) ? plan.qualityId : DEFAULT_RENDER_QUALITY,
    outputCount: typeof plan.outputCount === 'number' ? plan.outputCount : null,
    finalPromptEnglish: typeof plan.finalPromptEnglish === 'string' ? plan.finalPromptEnglish : '',
    negativePromptEnglish:
      typeof plan.negativePromptEnglish === 'string' ? plan.negativePromptEnglish : '',
    estimatedCredits: plan.estimatedCredits,
    estimatedUsd: plan.estimatedUsd,
    packEstimatedCredits: plan.packEstimatedCredits,
    packEstimatedUsd: plan.packEstimatedUsd,
    packTotalImages: plan.packTotalImages,
    batchItems: Array.isArray(plan.batchItems) ? plan.batchItems : [],
    futureApiBatchRequest:
      plan.futureApiBatchRequest && typeof plan.futureApiBatchRequest === 'object'
        ? plan.futureApiBatchRequest
        : null,
    updatedAt: Date.now(),
  };
  const others = rendersOf(project).filter((r) => !isRenderBatchPlanRecord(r));
  return { renders: [record, ...others] };
}
