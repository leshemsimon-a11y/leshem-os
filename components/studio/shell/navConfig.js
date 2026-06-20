// components/studio/shell/navConfig.js
//
// LESHEM.S OS — Navigation Configuration (Clean 1)
//
// Declares every section, its Hebrew label, its group, and whether it is built
// yet. In Clean 1 only "dashboard" is "built" (it renders the shell home);
// everything else shows an honest future state. As later Clean milestones land,
// flip `built: true` for the relevant section — no structural change required.

import { UI_HE } from '../../../lib/studio/labels';

export const NAV_GROUPS = [
  { id: 'create', labelHe: UI_HE.groups.create },
  { id: 'visualize', labelHe: UI_HE.groups.visualize },
  { id: 'output', labelHe: UI_HE.groups.output },
  { id: 'system', labelHe: UI_HE.groups.system },
];

// Simple, dependency-free glyph marks (no icon package added).
export const NAV_ITEMS = [
  {
    id: 'dashboard',
    labelHe: UI_HE.nav.dashboard,
    group: 'create',
    glyph: '◇',
    built: true,
    descHe: 'מבט כללי על הסטודיו',
  },
  {
    id: 'inventory',
    labelHe: UI_HE.nav.inventory,
    group: 'create',
    glyph: '❖',
    built: true,
    descHe: 'ניהול אבנים, פרסלים, חלקים ותכשיטים כמרחב יצירה.',
  },
  {
    id: 'workTray',
    labelHe: UI_HE.nav.workTray,
    group: 'create',
    glyph: '▤',
    built: true,
    descHe: 'הפריטים שנבחרו לעבודה הנוכחית.',
  },
  {
    id: 'builder',
    labelHe: UI_HE.nav.builder,
    group: 'create',
    glyph: '✦',
    built: true,
    descHe: 'סטודיו עיצוב — תחילה האבן, וסביבה נבנה התכשיט.',
  },
  {
    id: 'projects',
    labelHe: UI_HE.nav.projects,
    group: 'create',
    glyph: '❒',
    built: true,
    descHe: 'תיקי עיצוב שמורים — פתיחה, שכפול וניהול.',
  },
  {
    id: 'assets',
    labelHe: UI_HE.nav.assets,
    group: 'create',
    glyph: '▣',
    built: true,
    descHe: 'ספריית נכסים — תמונות, סקיצות, קבצים, תעודות ורפרנסים.',
  },
  {
    id: 'models',
    labelHe: UI_HE.nav.models,
    group: 'visualize',
    glyph: '◈',
    built: false,
    descHe: 'ספריית דגמי תכשיטים והתאמה לאבן.',
  },
  {
    id: 'render',
    labelHe: UI_HE.nav.render,
    group: 'visualize',
    glyph: '✺',
    built: false,
    descHe: 'יצירת הדמיות מבוססות-מציאות לאבן ולדגם.',
  },
  {
    id: 'media',
    labelHe: UI_HE.nav.media,
    group: 'visualize',
    glyph: '▦',
    built: false,
    descHe: 'נכסי מדיה והדמיות להצגה ללקוח.',
  },
  {
    id: 'calculator',
    labelHe: UI_HE.nav.calculator,
    group: 'output',
    glyph: '∑',
    built: false,
    descHe: 'חישוב מחיר — הזנה ידנית ובחירה מהמלאי.',
  },
  {
    id: 'certificates',
    labelHe: UI_HE.nav.certificates,
    group: 'output',
    glyph: '❉',
    built: false,
    descHe: 'תעודות באנגלית בלבד עבור הלקוח.',
  },
  {
    id: 'quotes',
    labelHe: UI_HE.nav.quotes,
    group: 'output',
    glyph: '✎',
    built: false,
    descHe: 'הצעות מחיר ומסמכי לקוח.',
  },
  {
    id: 'settings',
    labelHe: UI_HE.nav.settings,
    group: 'system',
    glyph: '⚙',
    built: false,
    descHe: 'הגדרות מערכת והעדפות.',
  },
];

export function itemsByGroup(groupId) {
  return NAV_ITEMS.filter((item) => item.group === groupId);
}

export function findItem(id) {
  return NAV_ITEMS.find((item) => item.id === id) || null;
}
