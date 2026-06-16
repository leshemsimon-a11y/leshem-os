// components/studio/shell/DashboardHome.js
//
// LESHEM.S OS — Dashboard Home (Clean 1)
//
// The one "live" section in Clean 1. It is intentionally a quiet welcome
// surface, not a data dashboard (no inventory is connected yet). It also
// proves the language + taxonomy layers render correctly by previewing the
// shape vocabulary with its corrected Hebrew labels.

import { tokens } from '../shared/tokens';
import { UI_HE, toAppHe } from '../../../lib/studio/labels';
import { SHAPE, SHAPE_VALUES } from '../../../lib/studio/taxonomy';

export default function DashboardHome() {
  return (
    <div dir="rtl">
      <header style={styles.header}>
        <span style={styles.eyebrow}>ברוך הבא לסטודיו</span>
        <h1 style={styles.title}>{UI_HE.appName} OS</h1>
        <p style={styles.lede}>
          מערכת ההפעלה של הסטודיו — תחילה האבן, סביבה נבנה התכשיט. המלאי, הבנייה,
          התמחור, ההדמיה והפלט ללקוח חיים תחת קורת גג אחת.
        </p>
      </header>

      <section style={styles.card}>
        <h2 style={styles.cardTitle}>מילון הצורות</h2>
        <p style={styles.cardLede}>
          שכבת השפה פעילה — תוויות הצורה מוצגות בעברית עבור הממשק, ומוכנות
          באנגלית עבור תעודות הלקוח.
        </p>
        <ul style={styles.chips}>
          {SHAPE_VALUES.filter((shape) => shape !== SHAPE.OTHER).map((shape) => (
            <li key={shape} style={styles.chip}>
              {toAppHe('shape', shape)}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

const styles = {
  header: {
    marginBottom: '36px',
  },
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
    fontSize: '40px',
    color: tokens.color.charcoal,
    margin: '10px 0 14px',
    letterSpacing: '0.02em',
  },
  lede: {
    fontFamily: tokens.font.body,
    fontSize: '16px',
    lineHeight: 1.7,
    color: tokens.color.inkSoft,
    maxWidth: '560px',
    margin: 0,
  },
  card: {
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.lg,
    boxShadow: tokens.shadow.soft,
    padding: '28px',
    maxWidth: '720px',
  },
  cardTitle: {
    fontFamily: tokens.font.display,
    fontWeight: 400,
    fontSize: '22px',
    color: tokens.color.charcoal,
    margin: '0 0 8px',
  },
  cardLede: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    lineHeight: 1.6,
    color: tokens.color.inkFaint,
    margin: '0 0 20px',
  },
  chips: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  chip: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    color: tokens.color.ink,
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.goldFaint}`,
    borderRadius: '999px',
    padding: '7px 16px',
  },
};
