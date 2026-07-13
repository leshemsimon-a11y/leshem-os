// lib/studio/smartCommand.js
//
// LESHEM.S OS — Clean 8K: Smart Command Bar foundation.
//
// PURE, deterministic, local classifier only. Reads a free-text Hebrew
// request and maps it to ONE of a small, fixed set of SAFE known intents
// that already correspond to existing, working functionality — or to
// UNKNOWN when nothing safe matches. NO AI API, NO network call: this is a
// keyword-based local foundation, and it never pretends otherwise — the
// UNKNOWN fallback message is explicit about that.
//
// classifyCommand() has NO side effects and touches no store — it only
// decides what SHOULD happen. The caller (components/studio/shared/
// SmartCommandBar.js via a handler supplied by the Design Studio shell)
// performs the actual safe action (setActiveStep / open a picker / route /
// briefStore.update) and is the only place with real side effects.

export const COMMAND_INTENT = Object.freeze({
  OPEN_STONES: 'openStones',
  OPEN_REFERENCES: 'openReferences',
  ADD_REFERENCE_TEXT: 'addReferenceText',
  OPEN_DIRECTIONS: 'openDirections',
  OPEN_RENDER_STUDIO: 'openRenderStudio',
  OPEN_PRESENTATION: 'openPresentation',
  EXPLAIN_NEXT_STEP: 'explainNextStep',
  UNKNOWN: 'unknown',
});

// The exact required fallback message (Clean 8K section 5) for anything
// that cannot be safely mapped to an existing action.
export const UNKNOWN_COMMAND_HE =
  'הבנתי את הכיוון. הפעולה הזו תתאפשר עם מנוע העיצוב החכם; בינתיים שמרתי אותה כהנחיה ליצירה.';

// Interpretation shown BEFORE performing a known action (Clean 8K section
// 5): "Before performing a known action, show a short interpretation."
const INTERPRETATION = Object.freeze({
  openStones: 'הבנתי — נעבור לאבנים ונבחן את סידור האבן המרכזית.',
  addReferenceText: 'הבנתי — אשמור את זה כהערת השראה בתיק היצירה.',
  openReferences: 'הבנתי — נפתח את חומרי העבודה וההשראה כדי לצרף קובץ.',
  openDirections: 'הבנתי — נעבור לכיווני העיצוב ונבחן אפשרות מתאימה.',
  openDirectionsGentle: 'הבנתי — נעבור לכיווני העיצוב ונבחן אפשרות עדינה יותר.',
  openDirectionsCommercial: 'הבנתי — נעבור לכיווני העיצוב ונבחן אפשרות מסחרית יותר.',
  openRenderStudio: 'הבנתי — ניכנס לסטודיו ההדמיות ונבחן את ההצגה המתאימה.',
  openRenderStudioHand: 'הבנתי — ניכנס לסטודיו ההדמיות ונבחן הצגה על יד.',
  openPresentation: 'הבנתי — נעבור להכנת ערכת ההצגה ללקוח.',
});

// Ordered keyword rules — first match wins. Each example command from the
// milestone spec is covered by exactly one rule below (verified in the
// logic sandbox).
const RULES = [
  {
    intent: COMMAND_INTENT.EXPLAIN_NEXT_STEP,
    test: (t) => /מה (כדאי|הצעד|לעשות)/.test(t),
    interpretation: () => null, // no interpretation line — the response IS the answer
  },
  {
    intent: COMMAND_INTENT.OPEN_RENDER_STUDIO,
    test: (t) => /על יד|דוגמני|הדמי|רנדר|render/.test(t),
    interpretation: (t) => (/על יד/.test(t) ? INTERPRETATION.openRenderStudioHand : INTERPRETATION.openRenderStudio),
  },
  {
    intent: COMMAND_INTENT.OPEN_PRESENTATION,
    test: (t) => /הצגה|ללקוח|פלט|presentation/.test(t),
    interpretation: () => INTERPRETATION.openPresentation,
  },
  {
    intent: COMMAND_INTENT.OPEN_DIRECTIONS,
    test: (t) => /כיוון|קונספט|עדין|מסחרי/.test(t),
    interpretation: (t) => {
      if (/עדין/.test(t)) return INTERPRETATION.openDirectionsGentle;
      if (/מסחרי/.test(t)) return INTERPRETATION.openDirectionsCommercial;
      return INTERPRETATION.openDirections;
    },
  },
  {
    intent: COMMAND_INTENT.OPEN_STONES,
    test: (t) => /אבן|אבנים|מרכזי/.test(t),
    interpretation: () => INTERPRETATION.openStones,
  },
  {
    intent: COMMAND_INTENT.OPEN_REFERENCES,
    test: (t) => /תעלה|העלאה|קובץ|תצרף/.test(t),
    interpretation: () => INTERPRETATION.openReferences,
  },
  {
    intent: COMMAND_INTENT.ADD_REFERENCE_TEXT,
    test: (t) => /רפרנס|השראה/.test(t),
    interpretation: () => INTERPRETATION.addReferenceText,
  },
];

// classifyCommand(rawText) → { intent, interpretationHe, rawText }
// Pure. Never throws on unexpected input; empty/whitespace-only text
// classifies as UNKNOWN like any other unmatched input.
export function classifyCommand(rawText) {
  const text = typeof rawText === 'string' ? rawText.trim() : '';
  if (!text) {
    return { intent: COMMAND_INTENT.UNKNOWN, interpretationHe: null, rawText: text };
  }
  for (const rule of RULES) {
    if (rule.test(text)) {
      return { intent: rule.intent, interpretationHe: rule.interpretation(text), rawText: text };
    }
  }
  return { intent: COMMAND_INTENT.UNKNOWN, interpretationHe: null, rawText: text };
}
