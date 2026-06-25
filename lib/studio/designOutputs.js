// lib/studio/designOutputs.js
//
// LESHEM.S OS — Local Design Output Generator (Clean 5B — Practical Output Layer)
//
// The first PRACTICAL OUTPUT from the studio. Given the selected design
// concept + the brief + the Work Tray items, it produces ONE structured output
// that doubles as a Design Result, a Client Preview, a Render Brief, and an
// internal production/design summary.
//
// HARD SCOPE (Clean 5B):
//   • PURE + LOCAL ONLY. No external AI, no network, no image/render
//     generation, no pricing, no PDF, no certificates, no Airtable, no new
//     packages.
//   • Deterministic given the same inputs (ids vary by time only) so the
//     jeweller can regenerate and compare calmly.
//   • Flexible by design — NOTHING is assumed mandatory: no required center
//     stone, diamond, client, render, quote, or PDF. Metal-only, stone-led,
//     matching/complementary, chains, components and client-owned goods are
//     all first-class.
//
// COMPATIBILITY AWARENESS (addendums — awareness only, NOT full modules):
//   1) Parcels / lots / layouts: a design may use only PART of a parcel. When
//      parcel/lot/melee items are present the language stays partial ("אבנים
//      נבחרות מתוך הפרסל"), never implying the whole parcel is consumed, and
//      forward-looking assumptions/next-steps are added. No quantity tracking,
//      no consumption, no pricing, no Layout Builder are built here.
//   2) Inventory source hierarchy: outputs reference source context with safe
//      language (owned physical / supplier virtual / supplier physical /
//      generic virtual / client-owned / internal draft) WHEN it can be inferred
//      from the items. No supplier management, no prioritization, no
//      availability confirmation, no pricing are built here.

import {
  DESIGN_ROLE,
  PRODUCT_TYPE,
  STONE_USAGE,
  isMetalOnlyProductType,
  normalizeBrief,
  normalizeOutput,
  getSelectedConcept,
  trayItemTitle,
  computeOutputSignature,
} from './designDraft';

// Hebrew metal labels (mirror BRIEF_HE.metal; kept local to avoid a hard
// dependency on labels.js inside this pure logic module).
const METAL_HE = {
  yellowGold: 'זהב צהוב',
  whiteGold: 'זהב לבן',
  roseGold: 'זהב אדום',
  platinum: 'פלטינה',
  silver: 'כסף',
};
const METAL_DEFAULT_HE = 'מתכת לבחירה (זהב לבן / צהוב / פלטינה)';

const PRODUCT_TYPE_HE = {
  ring: 'טבעת',
  engagementRing: 'טבעת אירוסין',
  weddingBand: 'טבעת נישואים',
  pendant: 'תליון',
  necklace: 'שרשרת',
  earrings: 'עגילים',
  bracelet: 'צמיד',
  matchingPiece: 'תכשיט משלים / תואם',
  noStones: 'תכשיט ללא אבנים',
  other: 'תכשיט',
};

function metalPhrase(brief) {
  const m = brief.metalPreference;
  if (m && METAL_HE[m]) return METAL_HE[m];
  return METAL_DEFAULT_HE;
}

function productTypeHe(pt) {
  return (pt && PRODUCT_TYPE_HE[pt]) || PRODUCT_TYPE_HE.other;
}

// ---------------------------------------------------------------------------
// Parcel / lot awareness (addendum 1 — awareness only)
// ---------------------------------------------------------------------------
// We treat an item as parcel-like if its role is PARCEL, or if a forward-
// compatible itemType marks it as a parcel/lot/melee, or if the snapshot looks
// like a multi-stone lot (stoneCount > 1). This is a heuristic for LANGUAGE
// only — no quantities are tracked or consumed.
const PARCEL_ITEM_TYPES = new Set([
  'parcel',
  'lot',
  'melee',
  'gemstoneLot',
  'diamondParcel',
]);

function isParcelLike(item) {
  if (!item || typeof item !== 'object') return false;
  if (item.role === DESIGN_ROLE.PARCEL) return true;
  const t = typeof item.itemType === 'string' ? item.itemType : null;
  if (t && PARCEL_ITEM_TYPES.has(t)) return true;
  const s = item.snapshot || {};
  if (typeof s.stoneCount === 'number' && s.stoneCount > 1) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Inventory source awareness (addendum 2 — awareness only)
// ---------------------------------------------------------------------------
// Future canonical source types (English). Kept here so the output can
// reference them, but Clean 5B builds NO source hierarchy UI or logic.
export const SOURCE_TYPE = Object.freeze({
  OWNED_PHYSICAL: 'ownedPhysical',
  SUPPLIER_VIRTUAL_SPECIFIC: 'supplierVirtualSpecific',
  SUPPLIER_PHYSICAL_EXTERNAL: 'supplierPhysicalExternal',
  GENERIC_VIRTUAL: 'genericVirtual',
  CLIENT_OWNED: 'clientOwned',
  INTERNAL_DRAFT: 'internalDraft',
});

// Safe Hebrew phrasing per source type (descriptive; never a guarantee).
const SOURCE_PHRASE_HE = {
  ownedPhysical: 'מבוסס על מלאי פיזי זמין',
  supplierVirtualSpecific: 'ניתן להתבסס על מלאי ספק',
  supplierPhysicalExternal: 'דורש אישור זמינות מספק',
  genericVirtual: 'ניתן להשגה ממספר מקורות',
  clientOwned: 'סחורה של לקוח — לא לשייך למלאי העסק',
  internalDraft: 'פריט טיוטה / תכנון פנימי',
};

// Best-effort source inference from an item snapshot. Returns a canonical
// SOURCE_TYPE or null. Uses the human statusHe/ownership text that the tray
// snapshot already carries — purely for descriptive language, no logic.
function inferSourceType(item) {
  if (!item || typeof item !== 'object') return null;
  // Forward-compatible explicit field wins if present.
  if (typeof item.sourceType === 'string' && SOURCE_PHRASE_HE[item.sourceType]) {
    return item.sourceType;
  }
  const s = item.snapshot || {};
  const status = `${s.statusHe || ''} ${s.originHe || ''}`;
  if (!status.trim()) return null;
  // Lightweight keyword hints (Hebrew), descriptive only.
  if (status.includes('לקוח')) return SOURCE_TYPE.CLIENT_OWNED;
  if (status.includes('ספק') && status.includes('פיזי')) return SOURCE_TYPE.SUPPLIER_PHYSICAL_EXTERNAL;
  if (status.includes('ספק')) return SOURCE_TYPE.SUPPLIER_VIRTUAL_SPECIFIC;
  if (status.includes('וירטואל')) return SOURCE_TYPE.GENERIC_VIRTUAL;
  if (status.includes('טיוטה')) return SOURCE_TYPE.INTERNAL_DRAFT;
  if (status.includes('פיזי') || status.includes('מלאי')) return SOURCE_TYPE.OWNED_PHYSICAL;
  return null;
}

// ---------------------------------------------------------------------------
// Tray analysis (roles + parcel + source), language-only.
// ---------------------------------------------------------------------------
function analyze(trayItems) {
  const items = Array.isArray(trayItems) ? trayItems : [];
  const centers = items.filter((it) => it && it.role === DESIGN_ROLE.CENTER_STONE);
  const pairs = items.filter((it) => it && it.role === DESIGN_ROLE.PAIR);
  const sides = items.filter((it) => it && it.role === DESIGN_ROLE.SIDE_STONE);
  const accents = items.filter((it) => it && it.role === DESIGN_ROLE.ACCENT_STONE);
  const parcels = items.filter((it) => it && it.role === DESIGN_ROLE.PARCEL);
  const components = items.filter((it) => it && it.role === DESIGN_ROLE.COMPONENT);
  const parcelLike = items.filter(isParcelLike);

  // Distinct inferred source types present (descriptive set).
  const sourceTypes = [];
  items.forEach((it) => {
    const st = inferSourceType(it);
    if (st && !sourceTypes.includes(st)) sourceTypes.push(st);
  });

  const hasAnyStone =
    centers.length + pairs.length + sides.length + accents.length + parcels.length > 0;

  return {
    items,
    centers,
    pairs,
    sides,
    accents,
    parcels,
    components,
    parcelLike,
    sourceTypes,
    hasCenter: centers.length > 0,
    hasPair: pairs.length > 0,
    hasSide: sides.length > 0,
    hasAccent: accents.length > 0,
    hasComponent: components.length > 0,
    hasParcel: parcelLike.length > 0,
    hasAnyStone,
  };
}

function isMetalOnly(brief, info) {
  if (brief.stoneUsage === STONE_USAGE.NONE) return true;
  if (isMetalOnlyProductType(brief.productType)) return true;
  if (!brief.stoneUsage && !info.hasAnyStone) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Section builders
// ---------------------------------------------------------------------------
function centerList(info) {
  if (!info.hasCenter) return '';
  return info.centers.map((it) => trayItemTitle(it)).filter(Boolean).join(' + ');
}

function buildStoneSummary(info, metalOnly) {
  if (metalOnly || !info.hasAnyStone) return '';
  const parts = [];
  if (info.hasCenter) {
    const list = centerList(info);
    parts.push(
      info.centers.length === 1
        ? `אבן מרכזית אחת${list ? ` (${list})` : ''}`
        : `${info.centers.length} אבנים מרכזיות נפרדות${list ? ` (${list})` : ''}`
    );
  }
  if (info.hasSide) parts.push('אבני צד');
  if (info.hasAccent) parts.push('אבנים נוספות');
  if (info.hasPair) parts.push('זוג אבנים תואם');
  if (info.hasParcel) {
    // Parcel awareness — partial use language, never "the whole parcel".
    parts.push('אבנים נבחרות מתוך הפרסל (שימוש חלקי בהתאם לעיצוב הסופי)');
  }
  return parts.length ? `${parts.join(', ')}.` : 'אבנים נבחרות משולבות בעיצוב.';
}

function buildMetalSummary(brief) {
  const metal = metalPhrase(brief);
  return `מתכת מוצעת: ${metal}.`;
}

function buildMaterialsSummary(info, brief, metalOnly) {
  const bits = [buildMetalSummary(brief).replace(/\.$/, '')];
  if (metalOnly || !info.hasAnyStone) {
    bits.push('ללא אבנים — דגש על המתכת, הגימור והפרופורציה');
  } else {
    const stone = buildStoneSummary(info, metalOnly).replace(/\.$/, '');
    if (stone) bits.push(stone);
  }
  if (info.hasComponent) bits.push('רכיב/שרשרת קיימים משולבים בעיצוב');
  return `${bits.join('. ')}.`;
}

function buildClientDescription(concept, brief, info, metalOnly, ptHe) {
  const name = concept.conceptName || ptHe;
  const desc = concept.shortDescription ? `${concept.shortDescription} ` : '';
  let stoneSentence;
  if (metalOnly || !info.hasAnyStone) {
    stoneSentence = `${ptHe} עשוי ${metalPhrase(brief)}, בעיצוב נקי שמדגיש את המתכת והפרופורציה.`;
  } else if (info.hasCenter) {
    const list = centerList(info);
    stoneSentence = `${ptHe} הבנוי סביב ${
      info.centers.length === 1 ? 'אבן מרכזית' : 'מספר אבנים מרכזיות'
    }${list ? ` (${list})` : ''}, ב${metalPhrase(brief)}.`;
  } else {
    stoneSentence = `${ptHe} המשלב אבנים נבחרות ב${metalPhrase(brief)}.`;
  }
  const occasion =
    brief.targetClient && brief.targetClient.trim()
      ? ` מתאים במיוחד ל${brief.targetClient.trim()}.`
      : '';
  return `${desc}${stoneSentence}${occasion}`.trim() + ` (${name})`;
}

function buildInternalSummary(concept, brief, info, metalOnly, ptHe) {
  const lines = [];
  lines.push(`סוג מוצר: ${ptHe}.`);
  if (concept.designStructure) lines.push(`מבנה: ${concept.designStructure}`);
  if (metalOnly || !info.hasAnyStone) {
    lines.push('ללא אבנים — עבודת מתכת בלבד.');
  } else {
    const s = buildStoneSummary(info, metalOnly);
    if (s) lines.push(`אבנים: ${s}`);
  }
  if (brief.styleDirection || brief.stylePreference) {
    lines.push('כיוון סגנוני נלקח מהתקציר.');
  }
  if (brief.notes && brief.notes.trim()) lines.push(`הערות תקציר: ${brief.notes.trim()}`);
  return lines.join(' ');
}

function buildRenderBrief(concept, brief, info, metalOnly, ptHe) {
  // A render BRIEF in words only — no image is generated in Clean 5B.
  const metal = metalPhrase(brief);
  const parts = [];
  parts.push(`נושא: ${concept.conceptName || ptHe}.`);
  parts.push(`מוצר: ${ptHe} ב${metal}.`);
  if (metalOnly || !info.hasAnyStone) {
    parts.push('דגש ויזואלי: גימור המתכת, השתקפויות עדינות, פרופורציה נקייה.');
  } else if (info.hasCenter) {
    parts.push('דגש ויזואלי: האבן המרכזית מוארת, ברק ונראות גבוהה, רקע ניטרלי.');
    if (info.hasSide || info.hasAccent) {
      parts.push('אבני הצד/הנוספות נראות סביב האבן המרכזית.');
    }
  } else {
    parts.push('דגש ויזואלי: שילוב האבנים והמתכת בתאורה רכה.');
  }
  if (info.hasParcel) {
    parts.push('הערה: להציג מספר אבנים מייצגות מתוך הפרסל, לא את כל הפרסל.');
  }
  parts.push('זווית: שלוש-רבעים + תקריב. סגנון: סטודיו תכשיטים יוקרתי.');
  parts.push('(בריף טקסטואלי בלבד — אין יצירת תמונה בשלב זה.)');
  return parts.join(' ');
}

function buildProductionNotes(concept, info, metalOnly) {
  const lines = [];
  if (concept.designStructure) lines.push(concept.designStructure);
  if (metalOnly || !info.hasAnyStone) {
    lines.push('עבודת מתכת בלבד — ללא שיבוץ אבנים.');
  } else {
    if (info.hasCenter) lines.push('להכין תושבת לאבן המרכזית בהתאם למידות בפועל.');
    if (info.hasSide || info.hasAccent) lines.push('להתאים שיבוץ לאבני הצד/הנוספות.');
    if (info.hasParcel) lines.push('כמות האבנים מהפרסל תיקבע לפי העיצוב הסופי.');
  }
  if (info.hasComponent) lines.push('להתאים את העיצוב לרכיב/שרשרת הקיימים.');
  lines.push('הערות ייצור מפורטות יושלמו בשלב מאוחר יותר.');
  return lines.join(' ');
}

function buildSourceContext(info) {
  if (!info.sourceTypes.length) return '';
  const phrases = info.sourceTypes
    .map((st) => SOURCE_PHRASE_HE[st])
    .filter(Boolean);
  if (!phrases.length) return '';
  return `הקשר מקור: ${phrases.join(' · ')}.`;
}

function buildAssumptions(info, brief, metalOnly) {
  const a = [];
  if (!metalOnly && info.hasAnyStone && !info.hasCenter) {
    a.push('לא הוגדרה אבן מרכזית — ניתן לעצב גם ללא אבן מרכזית מובהקת.');
  }
  if (info.hasParcel) {
    a.push('שימוש חלקי בפרסל בהתאם לעיצוב הסופי — לא נעשתה הנחה שכל הפרסל בשימוש.');
  }
  if (info.sourceTypes.includes(SOURCE_TYPE.SUPPLIER_PHYSICAL_EXTERNAL)) {
    a.push('חלק מהסחורה מצריך אישור זמינות מספק.');
  }
  if (info.sourceTypes.includes(SOURCE_TYPE.GENERIC_VIRTUAL)) {
    a.push('חלק מהסחורה ניתנת להשגה ממספר מקורות ואינה משויכת לספק יחיד.');
  }
  if (info.sourceTypes.includes(SOURCE_TYPE.CLIENT_OWNED)) {
    a.push('כולל סחורה של לקוח — לא לשייך למלאי העסק.');
  }
  if (!brief.metalPreference) a.push('סוג המתכת המדויק טרם נבחר.');
  return a;
}

function buildNextSteps(info, brief, metalOnly) {
  const n = [];
  if (info.hasParcel) {
    n.push('יש לבחור כמות מדויקת מתוך הפרסל בשלב הבא.');
    n.push('ניתן להפוך את שילוב האבנים ללייאאוט עצמאי או בסיס לתכשיט.');
  }
  if (!metalOnly && info.hasAnyStone) {
    n.push('לאשר מידות ומשקלים סופיים של האבנים.');
  }
  if (!brief.metalPreference) n.push('לבחור סוג וגוון מתכת.');
  n.push('לאשר את הכיוון מול הלקוח / היצרן ולהמשיך לשלב ההדמיה.');
  return n;
}

// ---------------------------------------------------------------------------
// ID generation (no packages).
// ---------------------------------------------------------------------------
let outSeq = 0;
function makeOutputId() {
  outSeq += 1;
  return `out_${Date.now().toString(36)}_${outSeq}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
// Generate a single structured output from the current selected concept +
// brief + tray. Returns a normalized output object, or null if there is no
// selected concept to base the output on.
export function generateOutput(trayItems, brief) {
  const b = normalizeBrief(brief);
  const concept = getSelectedConcept(b);
  if (!concept) return null;

  const info = analyze(trayItems);
  const metalOnly = isMetalOnly(b, info);
  const pt = b.productType || concept.productType || PRODUCT_TYPE.OTHER;
  const ptHe = productTypeHe(pt);
  const now = Date.now();

  const clientFacingTitle = concept.conceptName || ptHe;
  const raw = {
    outputId: makeOutputId(),
    outputTitle: `${ptHe} · ${concept.conceptName || 'כיוון עיצוב'}`,
    productType: pt,
    clientFacingTitle,
    clientDescription: buildClientDescription(concept, b, info, metalOnly, ptHe),
    internalDesignSummary: buildInternalSummary(concept, b, info, metalOnly, ptHe),
    materialsSummary: buildMaterialsSummary(info, b, metalOnly),
    stoneSummary: buildStoneSummary(info, metalOnly),
    metalSummary: buildMetalSummary(b),
    renderBrief: buildRenderBrief(concept, b, info, metalOnly, ptHe),
    productionNotes: buildProductionNotes(concept, info, metalOnly),
    sourceContext: buildSourceContext(info),
    assumptions: buildAssumptions(info, b, metalOnly),
    nextSteps: buildNextSteps(info, b, metalOnly),
    outputNotes: '',
    // Clean 5B.1 — stamp the signature of the inputs+concept this output was
    // built from, so the UI can detect staleness later.
    outputSourceSignature: computeOutputSignature(b, trayItems),
    createdAt: now,
    updatedAt: now,
  };
  return normalizeOutput(raw);
}

// Re-generate the BODY of an existing output (keeps its id + createdAt +
// outputNotes). Used by "עדכן פלט קיים". Returns a patch object (no id), or
// null if there is no selected concept.
export function regenerateOutputBody(trayItems, brief) {
  const fresh = generateOutput(trayItems, brief);
  if (!fresh) return null;
  const { outputId, createdAt, outputNotes, ...body } = fresh;
  return body;
}
