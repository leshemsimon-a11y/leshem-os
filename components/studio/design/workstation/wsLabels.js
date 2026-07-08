// components/studio/design/workstation/wsLabels.js
//
// LESHEM.S OS — Clean 6D: Studio Workstation Prototype — Hebrew UI labels.
//
// Workstation-ONLY chrome strings. Everything the stable Studio already
// names (תפריט עיצוב, כיווני עיצוב, roles, styles, metals, freedom levels…)
// is reused from lib/studio/labels.js — NOTHING there was edited. This file
// holds only strings that exist nowhere else. Native Hebrew string literals
// (never \uXXXX escapes). App-facing Hebrew only — never certificate output.

export const WS_HE = Object.freeze({
  title: 'שולחן עבודה — אב-טיפוס',
  prototypeBadge: 'אב-טיפוס 6D',
  backToStableStudio: 'לסטודיו היציב',
  loading: 'טוען את שולחן העבודה…',

  // Left tool rail — icon-first, short labels only.
  rail: Object.freeze({
    table: 'שולחן',
    stones: 'אבנים',
    menu: 'תפריט',
    directions: 'כיוונים',
    brief: 'בריף',
    output: 'פלט',
  }),

  // Top stone/material ribbon.
  ribbon: Object.freeze({
    inspect: 'עיון',
    remove: 'הסר מהמגש',
  }),

  // Center split canvas.
  canvas: Object.freeze({
    previewPane: 'תצוגת קונספט',
    sketchPane: 'סקיצה טכנית',
    previewEmpty: 'בחרו כיוון עיצוב כדי לראות קונספט',
    noDirectionsYet: 'עדיין אין כיווני עיצוב — אפשר להפיק בפלטת הכיוונים למטה',
    selectedPrefix: 'כיוון נבחר',
    stonesBoardTitle: 'אבני העבודה הנוכחית',
    stonesBoardEmpty: 'אין עדיין אבנים בעבודה — הוסיפו מהמלאי בסרגל העליון',
    briefSummaryTitle: 'תמונת מצב — בריף',
    briefSummaryEmpty: 'עדיין אין בריף — בחרו כיוון והפיקו פלט במסך הפלט',
    briefOpenOutput: 'למסך הפלט המלא',
    outputSheetTitle: 'פלט עיצוב ובריף הדמיה',
  }),

  // Right docked Design Menu (chrome only — field labels are reused).
  menu: Object.freeze({
    show: 'הצג תפריט עיצוב',
    hide: 'הסתר',
    clusterSoon: 'קלאסטר — בהמתנה לאישור',
  }),

  // Bottom Design Directions palette (chrome only — the palette title itself
  // reuses STUDIO_5D_HE.variantsTitle = 'כיווני עיצוב').
  directions: Object.freeze({
    backToAll: 'חזרה לכל הכיוונים',
    staleHint: 'הקלט השתנה — מומלץ לעדכן כיוונים',
    empty: 'עדיין אין כיוונים — הפיקו מתוך האבנים והתפריט',
  }),

  // Process strip (compact visual flow). Step names reuse existing
  // terminology exactly: אבנים → תפריט עיצוב → כיווני עיצוב → כיוון נבחר → בריף.
  process: Object.freeze({
    stones: 'אבנים',
    selectedDirection: 'כיוון נבחר',
    brief: 'בריף',
  }),

  toast: Object.freeze({
    removedFromTray: 'האבן הוסרה ממגש העבודה',
  }),

  // Clean 6E — save the current workstation state as a Work File
  // (Design Project) through the EXISTING projects store.
  save: Object.freeze({
    action: 'שמור כתיק עבודה',
    emptyGuard: 'צריך לבחור לפחות אבן אחת לפני שמירת תיק עבודה',
    successToast: 'העבודה נשמרה כתיק עבודה',
    openProjects: 'פתח תיקי עבודה',
    namePrefix: 'תיק עיצוב',
  }),
});
