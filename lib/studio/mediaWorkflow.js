// lib/studio/mediaWorkflow.js
//
// LESHEM.S OS — Clean 8E: Media Workflow v1 — pure helper.
//
// Manual media workflow for a Work File (Design Project): media status,
// target tool, "sent" tracking, and MANUAL media result records (metadata /
// URL / notes only — no upload, no external AI/API, no render engine).
//
// STORAGE (public API only): all media-workflow data lives as records inside
// the project's EXISTING reserved `renders` array — the field normalizeProject
// in lib/studio/designProjects.js has preserved since Clean 4A explicitly as
// a placeholder for future renders/media. Persistence happens ONLY through
// the EXISTING public updateProject(id, { renders }) call (the exact pattern
// Clean 8B rename and Clean 8C attach already use). This file adds NO store,
// NO persistence key, NO schema change — pure constants and pure functions.
//
// Records (both carry a `kind` discriminator; foreign records in `renders`
// are always preserved untouched):
//   • ONE state record  — { renderId: 'mediaWorkflowState', kind:
//     'mediaWorkflowState', mediaStatus, selectedTool, selectedPromptKey,
//     sentAt, updatedAt }
//   • result records    — { renderId: 'media_…', kind: 'mediaResult',
//     title, tool, url, notes, status, createdAt }
//
// Language rules: internal values — canonical English; UI labels — Hebrew.

// ---------------------------------------------------------------------------
// Media statuses — canonical English values + Hebrew UI labels (per spec).
// ---------------------------------------------------------------------------
export const MEDIA_STATUS = Object.freeze({
  NOT_PREPARED: 'notPrepared',
  PROMPT_READY: 'promptReady',
  SENT_TO_TOOL: 'sentToTool',
  RESULT_RECEIVED: 'resultReceived',
  CLIENT_READY: 'clientReady',
});

export const MEDIA_STATUS_VALUES = Object.freeze(Object.values(MEDIA_STATUS));

export const MEDIA_STATUS_HE = Object.freeze({
  notPrepared: 'לא הוכן',
  promptReady: 'מוכן להדמיה',
  sentToTool: 'נשלח לכלי חיצוני',
  resultReceived: 'התקבלה תוצאה',
  clientReady: 'מוכן ללקוח',
});

export function isValidMediaStatus(v) {
  return MEDIA_STATUS_VALUES.includes(v);
}

export function mediaStatusHe(v) {
  return MEDIA_STATUS_HE[v] || MEDIA_STATUS_HE.notPrepared;
}

// ---------------------------------------------------------------------------
// Target tools — canonical English values + Hebrew/brand UI labels.
// ---------------------------------------------------------------------------
export const MEDIA_TOOL = Object.freeze({
  GEMINI: 'gemini',
  STABILITY: 'stability',
  SORA: 'sora',
  MIDJOURNEY: 'midjourney',
  OTHER: 'other',
});

export const MEDIA_TOOL_VALUES = Object.freeze(Object.values(MEDIA_TOOL));

export const MEDIA_TOOL_HE = Object.freeze({
  gemini: 'Gemini / Nano Banana',
  stability: 'Stability',
  sora: 'Sora',
  midjourney: 'Midjourney',
  other: 'אחר',
});

export function isValidMediaTool(v) {
  return MEDIA_TOOL_VALUES.includes(v);
}

export function mediaToolHe(v) {
  return MEDIA_TOOL_HE[v] || MEDIA_TOOL_HE.other;
}

// ---------------------------------------------------------------------------
// Prompt options — map the Clean 8D Output Pack fields to workflow choices.
// ---------------------------------------------------------------------------
export const MEDIA_PROMPT_OPTIONS = Object.freeze([
  Object.freeze({ key: 'render', he: 'פרומפט הדמיה ריאליסטית', packField: 'mediaPromptEn' }),
  Object.freeze({ key: 'sketch', he: 'פרומפט סקיצה / קונספט', packField: 'sketchPromptEn' }),
  Object.freeze({ key: 'presentation', he: 'פרומפט מצגת ללקוח', packField: 'presentationPromptEn' }),
]);

export function promptOptionHe(key) {
  const o = MEDIA_PROMPT_OPTIONS.find((x) => x.key === key);
  return o ? o.he : null;
}

// ---------------------------------------------------------------------------
// Record discriminators (foreign records in `renders` are always preserved).
// ---------------------------------------------------------------------------
export const MEDIA_STATE_KIND = 'mediaWorkflowState';
export const MEDIA_RESULT_KIND = 'mediaResult';
export const MEDIA_STATE_ID = 'mediaWorkflowState';

export function isMediaStateRecord(r) {
  return Boolean(r && typeof r === 'object' && r.kind === MEDIA_STATE_KIND);
}

export function isMediaResultRecord(r) {
  return Boolean(r && typeof r === 'object' && r.kind === MEDIA_RESULT_KIND);
}

function rendersOf(project) {
  return project && Array.isArray(project.renders) ? project.renders : [];
}

// ---------------------------------------------------------------------------
// State — read + patch builders (pure; persistence stays in the caller via
// the existing public updateProject).
// ---------------------------------------------------------------------------
const DEFAULT_STATE = Object.freeze({
  mediaStatus: MEDIA_STATUS.NOT_PREPARED,
  selectedTool: null,
  selectedPromptKey: null,
  sentAt: null,
  updatedAt: null,
});

export function getMediaState(project) {
  const raw = rendersOf(project).find(isMediaStateRecord);
  if (!raw) return { ...DEFAULT_STATE, exists: false };
  return {
    mediaStatus: isValidMediaStatus(raw.mediaStatus) ? raw.mediaStatus : MEDIA_STATUS.NOT_PREPARED,
    selectedTool: isValidMediaTool(raw.selectedTool) ? raw.selectedTool : null,
    selectedPromptKey:
      typeof raw.selectedPromptKey === 'string' && promptOptionHe(raw.selectedPromptKey)
        ? raw.selectedPromptKey
        : null,
    sentAt: typeof raw.sentAt === 'number' ? raw.sentAt : null,
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : null,
    exists: true,
  };
}

// buildStatePatch(project, partial) → { renders } — upserts the single state
// record with the given partial fields; every other record is kept as-is.
export function buildStatePatch(project, partial) {
  const current = getMediaState(project);
  const next = {
    renderId: MEDIA_STATE_ID,
    kind: MEDIA_STATE_KIND,
    mediaStatus: current.mediaStatus,
    selectedTool: current.selectedTool,
    selectedPromptKey: current.selectedPromptKey,
    sentAt: current.sentAt,
    updatedAt: Date.now(),
  };
  const p = partial || {};
  if (isValidMediaStatus(p.mediaStatus)) next.mediaStatus = p.mediaStatus;
  if (isValidMediaTool(p.selectedTool)) next.selectedTool = p.selectedTool;
  if (p.selectedTool === null) next.selectedTool = null;
  if (typeof p.selectedPromptKey === 'string' && promptOptionHe(p.selectedPromptKey)) {
    next.selectedPromptKey = p.selectedPromptKey;
  }
  if (typeof p.sentAt === 'number') next.sentAt = p.sentAt;
  const others = rendersOf(project).filter((r) => !isMediaStateRecord(r));
  return { renders: [next, ...others] };
}

// "סמן כנשלח" — status → sentToTool, tool saved, sent date/time saved.
export function buildMarkSentPatch(project, { selectedTool, selectedPromptKey } = {}) {
  return buildStatePatch(project, {
    mediaStatus: MEDIA_STATUS.SENT_TO_TOOL,
    selectedTool: isValidMediaTool(selectedTool) ? selectedTool : undefined,
    selectedPromptKey,
    sentAt: Date.now(),
  });
}

// ---------------------------------------------------------------------------
// Manual media results — read + patch builder.
// ---------------------------------------------------------------------------
let seq = 0;
function makeResultId() {
  seq += 1;
  const rand = Math.random().toString(36).slice(2, 8);
  return `media_${Date.now().toString(36)}_${rand}_${seq}`;
}

const str = (v) => (typeof v === 'string' ? v.trim() : '');

export function buildMediaResultRecord({ title, tool, url, notes, status } = {}) {
  const t = str(title);
  if (!t) return null; // a result needs at least a name
  return {
    renderId: makeResultId(),
    kind: MEDIA_RESULT_KIND,
    title: t,
    tool: isValidMediaTool(tool) ? tool : MEDIA_TOOL.OTHER,
    url: str(url),
    notes: str(notes),
    status: isValidMediaStatus(status) ? status : MEDIA_STATUS.RESULT_RECEIVED,
    createdAt: Date.now(),
  };
}

// buildResultPatch(project, record) → { renders } with the record appended
// (newest first); all existing records preserved.
export function buildResultPatch(project, record) {
  if (!record || record.kind !== MEDIA_RESULT_KIND) return null;
  return { renders: [record, ...rendersOf(project)] };
}

export function getMediaResults(project) {
  return rendersOf(project)
    .filter(isMediaResultRecord)
    .slice()
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export function mediaResultsCount(project) {
  return getMediaResults(project).length;
}

// ---------------------------------------------------------------------------
// URL safety (display-only decisions; nothing is ever fetched).
// ---------------------------------------------------------------------------
export function isSafeLinkUrl(url) {
  return typeof url === 'string' && /^https?:\/\/\S+$/i.test(url.trim());
}

export function isSafeImageUrl(url) {
  return (
    isSafeLinkUrl(url) &&
    /\.(png|jpe?g|webp|gif|avif)(\?[^\s]*)?(#[^\s]*)?$/i.test(url.trim())
  );
}

// ---------------------------------------------------------------------------
// Compact Hebrew lines for the Work File card + panel.
// ---------------------------------------------------------------------------

// «מדיה: מוכן להדמיה» — shown only once the workflow was actually touched
// (a state record exists) or results exist, so pre-8E cards stay unchanged.
export function mediaStatusLineHe(project) {
  const state = getMediaState(project);
  const count = mediaResultsCount(project);
  if (!state.exists && count === 0) return null;
  return `מדיה: ${mediaStatusHe(state.mediaStatus)}`;
}

// «2 תוצאות מדיה» / «תוצאת מדיה אחת» — null when there are none.
export function mediaResultsCountHe(project) {
  const n = mediaResultsCount(project);
  if (n <= 0) return null;
  return n === 1 ? 'תוצאת מדיה אחת' : `${n} תוצאות מדיה`;
}

// Next-action hint per status (Hebrew, panel-facing).
export const MEDIA_NEXT_ACTION_HE = Object.freeze({
  notPrepared: 'הצעד הבא: לבחור פרומפט מחבילת הפלט ולעדכן סטטוס ל"מוכן להדמיה".',
  promptReady: 'הצעד הבא: להעתיק את הפרומפט לכלי שנבחר וללחוץ "סמן כנשלח".',
  sentToTool: 'הצעד הבא: כשמתקבלת תוצאה מהכלי — לשמור אותה בטופס תוצאת המדיה.',
  resultReceived: 'הצעד הבא: לסקור את התוצאות ולעדכן סטטוס ל"מוכן ללקוח".',
  clientReady: 'המדיה מוכנה להצגה ללקוח.',
});

export function mediaNextActionHe(project) {
  const state = getMediaState(project);
  return MEDIA_NEXT_ACTION_HE[state.mediaStatus] || MEDIA_NEXT_ACTION_HE.notPrepared;
}
