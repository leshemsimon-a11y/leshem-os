// lib/studio/renderPromptFinalizer.js
//
// LESHEM.S OS — Clean 8I: Render Engine Prep + One-Click Prompt Finalizer.
//
// PURE helper — constants and pure functions only. Builds the FINAL
// media-ready render package for a Work File (Design Project) from data the
// project already holds: one click on «הכן הדמיה» → final English prompt,
// English negative prompt, recommended settings, Hebrew understanding
// summary, and Hebrew missing-context feedback. NO external API, NO render
// engine, NO package, NO store, NO persistence key — data preparation only.
//
// Shared prompt context comes from lib/studio/outputPack.js
// (buildPromptContextEn — the same enum maps buildOutputPack uses), so the
// Output Pack and the Render Finalizer never drift apart.
//
// PERSISTENCE (public API only): the finalized package is stored as ONE
// record inside the project's EXISTING reserved `renders` array — the exact
// Clean 8E media-workflow pattern (kind-discriminated records; foreign
// records always preserved untouched). Saving happens ONLY in the caller
// through the EXISTING public updateProject(id, { renders }).
//
// Language rules (strict):
//   • finalPromptEnglish / negativePromptEnglish — ENGLISH ONLY, built from
//     canonical enum values and ASCII-safe fields; every emitted line passes
//     an ASCII guard. Hebrew is never embedded.
//   • title / promptHebrewSummary / sourceContextSummary / warnings — Hebrew,
//     app-facing only.

import { buildPromptContextEn } from './outputPack';
import { CONCEPT_HE, BRIEF_HE } from './labels';
import { MEDIA_TOOL } from './mediaWorkflow';

// ---------------------------------------------------------------------------
// Presets — canonical English values + Hebrew UI labels (default: catalog).
// ---------------------------------------------------------------------------
export const RENDER_PRESET = Object.freeze({
  CATALOG: 'catalog',
  SKETCH: 'sketch',
  PRESENTATION: 'presentation',
  MACRO: 'macro',
  CREATIVE: 'creative',
});

export const RENDER_PRESET_VALUES = Object.freeze(Object.values(RENDER_PRESET));

export const DEFAULT_RENDER_PRESET = RENDER_PRESET.CATALOG;

export const RENDER_PRESET_HE = Object.freeze({
  catalog: 'הדמיית קטלוג ריאליסטית',
  sketch: 'סקיצת קונספט',
  presentation: 'פרזנטציה ללקוח',
  macro: 'מאקרו אבן / פרטים',
  creative: 'חופשי / יצירתי',
});

export function isValidRenderPreset(v) {
  return RENDER_PRESET_VALUES.includes(v);
}

export function renderPresetHe(v) {
  return RENDER_PRESET_HE[v] || RENDER_PRESET_HE.catalog;
}

// ---------------------------------------------------------------------------
// Per-preset recommended settings + English scene language (ASCII only).
// aspect ratio 1:1 for the catalog / jewelry-object presets per spec.
// ---------------------------------------------------------------------------
const PRESET_PROFILE = Object.freeze({
  catalog: Object.freeze({
    aspectRatio: '1:1',
    outputCount: 4,
    quality: 'high',
    openerEn: 'Ultra-realistic luxury jewelry catalog photograph',
    sceneEn:
      'Clean studio luxury catalog background, softbox premium product photography lighting, realistic reflections and materials, precise macro-level detail, high resolution.',
  }),
  sketch: Object.freeze({
    aspectRatio: '4:3',
    outputCount: 2,
    quality: 'high',
    openerEn: 'Jewelry design concept sketch',
    sceneEn:
      'Hand-drawn designer sketch style: clean line work, subtle shading, annotated proportions, top and side views, neutral paper background.',
  }),
  presentation: Object.freeze({
    aspectRatio: '4:5',
    outputCount: 4,
    quality: 'high',
    openerEn: 'Client presentation render of luxury jewelry',
    sceneEn:
      'Pure white client-facing background, soft premium studio lighting, elegant catalog composition, no text or watermarks, high resolution.',
  }),
  macro: Object.freeze({
    aspectRatio: '1:1',
    outputCount: 4,
    quality: 'high',
    openerEn: 'Extreme macro jewelry photograph focused on gemstone and setting detail',
    sceneEn:
      'Shallow depth of field on the featured stone, softbox studio lighting, crisp facet reflections, visible setting craftsmanship, dark neutral background, high resolution.',
  }),
  creative: Object.freeze({
    aspectRatio: '1:1',
    outputCount: 4,
    quality: 'high',
    openerEn: 'Creative editorial visualization of luxury jewelry',
    sceneEn:
      'Artistic premium composition with dramatic soft lighting, refined color palette, elegant styling, high resolution.',
  }),
});

export function renderPresetSettings(preset) {
  const p = PRESET_PROFILE[isValidRenderPreset(preset) ? preset : DEFAULT_RENDER_PRESET];
  return {
    recommendedAspectRatio: p.aspectRatio,
    recommendedOutputCount: p.outputCount,
    recommendedQuality: p.quality,
    suggestedTool: MEDIA_TOOL.STABILITY,
  };
}

// ---------------------------------------------------------------------------
// Hebrew strings (app-facing).
// ---------------------------------------------------------------------------
export const RENDER_FINALIZER_HE = Object.freeze({
  titlePrefix: 'הדמיה',
  fallbackName: 'תיק עיצוב',
  settingAspect: 'יחס תמונה',
  settingCount: 'מספר תוצאות מומלץ',
  settingQuality: 'איכות',
  settingTool: 'כלי מומלץ',
  qualityHigh: 'גבוהה',
  understoodProduct: (he) => `תכשיט: ${he}`,
  understoodStyle: (he) => `סגנון: ${he}`,
  understoodMetal: (he) => `מתכת: ${he}`,
  understoodStones: (n) => (n === 1 ? 'אבן אחת נבחרה לעבודה' : `${n} אבנים נבחרו לעבודה`),
  understoodDirection: (name) => `כיוון עיצוב נבחר: ${name}`,
  understoodAssets: (n) => (n === 1 ? 'נכס אחד מצורף לתיק' : `${n} נכסים מצורפים לתיק`),
  understoodRequest: 'בקשת עיצוב חופשית נכללה בהקשר',
  understoodReference: 'רפרנס טקסטואלי נכלל בהקשר',
  understoodCluster: 'זוהתה שפת קלאסטר — הפרומפט כולל קומפוזיציית ריבוי אבנים',
  warnNoMetal: 'לא נבחרה מתכת — הפרומפט ישתמש בזהב לבן כברירת מחדל.',
  warnNoRefs: 'לא צורפו רפרנסים — ההדמיה תתבסס על סוג התכשיט והסגנון בלבד.',
  warnNoStones: 'לא נבחרו אבנים — תיווצר הדמיה רעיונית.',
  warnNoProduct: 'לא נבחר סוג תכשיט — הפרומפט ישתמש בניסוח כללי.',
  warnNoStyle: 'לא נבחר סגנון — הפרומפט יתבסס על שפת קטלוג יוקרתית כללית.',
  warnNoDirection: 'לא נבחר כיוון עיצוב — הפרומפט יתבסס על הגדרות התיק בלבד.',
  summary: (productHe, presetHe) =>
    `פרומפט הדמיה סופי ל${productHe}, בפריסט «${presetHe}». הפרומפט באנגלית ומוכן להעתקה לכלי חיצוני.`,
});

// English metal default when none was chosen (warned in Hebrew).
const DEFAULT_METAL_EN = '18k white gold';

const ASCII_LINE_RE = /^[\x20-\x7E]*$/;
const asciiLinesOnly = (lines) => lines.filter((l) => typeof l === 'string' && ASCII_LINE_RE.test(l));

// ---------------------------------------------------------------------------
// Negative prompt — strong jewelry-render guard (English only).
// ---------------------------------------------------------------------------
export function buildNegativePromptEn(preset) {
  const parts = [
    'exaggerated oversized gemstones',
    'impossible or floating prongs',
    'distorted ring proportions',
    'warped or broken symmetry',
    'fake plastic look',
    'blurry or smudged metal',
    'extra stones not requested',
    'duplicated jewelry parts',
    'unreadable labels or text',
    'text, watermarks, logos',
    'hands, fingers, human body parts',
    'low-quality reflections',
    'deformed geometry',
    'noisy or grainy surfaces',
  ];
  // The free/creative preset allows artistic freedom but still blocks the
  // physical-defect failures above; only the style restriction is lifted.
  if (preset !== RENDER_PRESET.CREATIVE) {
    parts.splice(4, 0, 'overly fantasy style');
  }
  return parts.join(', ');
}

// ---------------------------------------------------------------------------
// buildRenderPackage(project, preset) → structured render package.
// Pure: reads the project + shared prompt context; nothing is stored here.
// ---------------------------------------------------------------------------
export function buildRenderPackage(project, preset) {
  const p = project || {};
  const brief = p.brief || {};
  const chosenPreset = isValidRenderPreset(preset) ? preset : DEFAULT_RENDER_PRESET;
  const profile = PRESET_PROFILE[chosenPreset];
  const ctx = buildPromptContextEn(p);

  const metalKnown = Boolean(ctx.metalEn);
  const metalEn = ctx.metalEn || DEFAULT_METAL_EN;

  // -------------------------------------------------------------------
  // Final English prompt.
  // -------------------------------------------------------------------
  const lines = [];
  const subject = [ctx.styleEn, ctx.productEn].filter(Boolean).join(' ');
  lines.push(`${profile.openerEn}: a ${subject} crafted in ${metalEn}.`);

  if (ctx.stonesEn.length) {
    lines.push(`Featuring ${ctx.stonesEn.join('; ')}.`);
  } else if (brief.productType === 'noStones') {
    lines.push('Metal-only design with no stones, focused on form and surface finish.');
  } else {
    lines.push('Conceptual gemstone selection left open; present a refined, believable stone choice.');
  }

  if (ctx.stoneCount > 1 || ctx.isCluster) {
    lines.push(
      'Balanced cluster composition: intentional multi-stone arrangement, natural gemstone grouping, production-feasible setting layout with a clear focal point.'
    );
  }

  if (ctx.directionEn) {
    lines.push(`Selected design direction: ${ctx.directionEn}`);
  }

  // Free-text request/reference content may be Hebrew, so it is never copied
  // verbatim into the English prompt. The prompt still carries explicit,
  // actionable instructions that the recorded Work File text must guide the
  // result instead of merely reporting that the text exists.
  if (ctx.hasRequestText) {
    lines.push("Honor the client's stated design preferences recorded in the Work File.");
  }
  if (ctx.hasReferenceText) {
    lines.push('Follow the textual design reference recorded in the Work File as a guiding influence.');
  }

  // Prefer the more specific sketch instruction over the generic image
  // instruction when the attached image is classified as a sketch.
  if (ctx.hasSketch) {
    lines.push('Follow the attached design sketch as the primary composition reference.');
  } else if (ctx.hasImage) {
    lines.push('Use the attached reference as visual inspiration.');
  }
  if (ctx.hasModel) {
    lines.push('Use the attached model as a base jewelry form reference.');
  }
  if (ctx.hasModel3dm) {
    lines.push('A 3DM model is attached as production reference; preview support is planned.');
  }
  if (ctx.hasClientFile) {
    lines.push('Use the attached client-provided file as contextual design guidance.');
  } else if (ctx.hasDocument) {
    lines.push('Use the attached PDF document as additional project context.');
  }

  lines.push(
    'Realistic jewelry proportions, production-aware prong and setting construction, physically plausible stone seating, fine metalwork craftsmanship.'
  );
  lines.push(profile.sceneEn);

  const finalPromptEnglish = asciiLinesOnly(lines).join('\n');
  const negativePromptEnglish = buildNegativePromptEn(chosenPreset);

  // -------------------------------------------------------------------
  // Hebrew — what the system understood.
  // -------------------------------------------------------------------
  const productHe = (brief.productType && CONCEPT_HE.productType[brief.productType]) || null;
  const styleHe = (brief.styleDirection && BRIEF_HE.style[brief.styleDirection]) || null;
  const metalHe = (brief.metalPreference && BRIEF_HE.metal[brief.metalPreference]) || null;

  const sourceContextSummary = [];
  if (productHe) sourceContextSummary.push(RENDER_FINALIZER_HE.understoodProduct(productHe));
  if (styleHe) sourceContextSummary.push(RENDER_FINALIZER_HE.understoodStyle(styleHe));
  if (metalHe) sourceContextSummary.push(RENDER_FINALIZER_HE.understoodMetal(metalHe));
  if (ctx.stoneCount > 0) sourceContextSummary.push(RENDER_FINALIZER_HE.understoodStones(ctx.stoneCount));
  if (ctx.directionNameHe) sourceContextSummary.push(RENDER_FINALIZER_HE.understoodDirection(ctx.directionNameHe));
  if (ctx.attached.length) sourceContextSummary.push(RENDER_FINALIZER_HE.understoodAssets(ctx.attached.length));
  if (ctx.hasRequestText) sourceContextSummary.push(RENDER_FINALIZER_HE.understoodRequest);
  if (ctx.hasReferenceText) sourceContextSummary.push(RENDER_FINALIZER_HE.understoodReference);
  if (ctx.stoneCount > 1 || ctx.isCluster) sourceContextSummary.push(RENDER_FINALIZER_HE.understoodCluster);

  // -------------------------------------------------------------------
  // Hebrew — missing-context feedback (never blocking).
  // -------------------------------------------------------------------
  const warnings = [];
  if (!metalKnown) warnings.push(RENDER_FINALIZER_HE.warnNoMetal);
  if (!ctx.attached.length && !ctx.hasReferenceText) warnings.push(RENDER_FINALIZER_HE.warnNoRefs);
  if (ctx.stoneCount === 0 && brief.productType !== 'noStones') {
    warnings.push(RENDER_FINALIZER_HE.warnNoStones);
  }
  if (!ctx.productKnown) warnings.push(RENDER_FINALIZER_HE.warnNoProduct);
  if (!styleHe) warnings.push(RENDER_FINALIZER_HE.warnNoStyle);
  if (!ctx.hasDirection) warnings.push(RENDER_FINALIZER_HE.warnNoDirection);

  const settings = renderPresetSettings(chosenPreset);

  return {
    title: `${RENDER_FINALIZER_HE.titlePrefix} — ${p.name || RENDER_FINALIZER_HE.fallbackName}`,
    preset: chosenPreset,
    presetHe: renderPresetHe(chosenPreset),
    finalPromptEnglish,
    negativePromptEnglish,
    promptHebrewSummary: RENDER_FINALIZER_HE.summary(
      productHe || RENDER_FINALIZER_HE.fallbackName,
      renderPresetHe(chosenPreset)
    ),
    recommendedAspectRatio: settings.recommendedAspectRatio,
    recommendedOutputCount: settings.recommendedOutputCount,
    recommendedQuality: settings.recommendedQuality,
    suggestedTool: settings.suggestedTool,
    sourceContextSummary,
    warnings,
  };
}

// ---------------------------------------------------------------------------
// Persistence records inside the EXISTING reserved `renders` array — the
// exact Clean 8E kind-discriminated pattern. ONE upserted package record;
// every foreign record (media state / media results / anything else) is
// preserved untouched. The caller persists via the EXISTING public
// updateProject(id, patch).
// ---------------------------------------------------------------------------
export const RENDER_PACKAGE_KIND = 'renderPackage';
export const RENDER_PACKAGE_ID = 'renderPackagePrimary';

export function isRenderPackageRecord(r) {
  return Boolean(r && typeof r === 'object' && r.kind === RENDER_PACKAGE_KIND);
}

function rendersOf(project) {
  return project && Array.isArray(project.renders) ? project.renders : [];
}

// Read the saved package record (null when none was prepared yet).
export function getSavedRenderPackage(project) {
  const raw = rendersOf(project).find(isRenderPackageRecord);
  if (!raw) return null;
  return {
    preset: isValidRenderPreset(raw.preset) ? raw.preset : DEFAULT_RENDER_PRESET,
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : null,
  };
}

// buildRenderPackagePatch(project, pkg) → { renders } — upserts the single
// package record; all other records are kept exactly as they are.
export function buildRenderPackagePatch(project, pkg) {
  if (!pkg || typeof pkg !== 'object') return null;
  const record = {
    renderId: RENDER_PACKAGE_ID,
    kind: RENDER_PACKAGE_KIND,
    preset: isValidRenderPreset(pkg.preset) ? pkg.preset : DEFAULT_RENDER_PRESET,
    title: typeof pkg.title === 'string' ? pkg.title : '',
    finalPromptEnglish: typeof pkg.finalPromptEnglish === 'string' ? pkg.finalPromptEnglish : '',
    negativePromptEnglish:
      typeof pkg.negativePromptEnglish === 'string' ? pkg.negativePromptEnglish : '',
    promptHebrewSummary: typeof pkg.promptHebrewSummary === 'string' ? pkg.promptHebrewSummary : '',
    recommendedAspectRatio: pkg.recommendedAspectRatio,
    recommendedOutputCount: pkg.recommendedOutputCount,
    recommendedQuality: pkg.recommendedQuality,
    suggestedTool: pkg.suggestedTool,
    updatedAt: Date.now(),
  };
  const others = rendersOf(project).filter((r) => !isRenderPackageRecord(r));
  return { renders: [record, ...others] };
}
