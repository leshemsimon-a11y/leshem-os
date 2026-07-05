// lib/studio/designConcepts.js
//
// LESHEM.S OS — Local Design Concept Generator (Clean 5A — Design Core)
//
// The first real DESIGN CORE logic: turn the current inputs (Work Tray items
// + their roles + the design brief) into THREE structured jewelry design
// concepts. This is the heart of the studio — it helps the jeweller move from
// "here are my goods" to "here are clear directions for a piece".
//
// HARD SCOPE (Clean 5A):
//   • PURE + LOCAL ONLY. No external AI, no network, no image/render
//     generation, no pricing, no PDF, no Airtable, no new packages.
//   • Deterministic given the same inputs (no randomness) so the user can
//     regenerate and compare calmly.
//   • Stones are COMMON but NOT required. Metal-only jewelry is fully
//     supported (wedding bands, plain rings, chains, matching/complementary
//     pieces). The generator NEVER forces a stone.
//
// Stone handling honors the studio's rules:
//   • Center stones are individual, addressable items — never collapsed to a
//     quantity. Layout text references "אבן מרכזית" per center stone.
//   • Side stones / accentStone (אבנים נוספות) are used as accents when present.
//   • A chain / component suggests pendant / necklace directions.
//
// Output: an array of 3 concept objects, each:
//   {
//     conceptId, conceptName, shortDescription, productType,
//     metalSuggestion, stoneLayout, designStructure, recommendedUse,
//     productionNotes (placeholder), renderBriefText (placeholder),
//     conceptNotes
//   }
// productionNotes / renderBriefText are PLACEHOLDERS only (later milestones).

import {
  DESIGN_ROLE,
  PRODUCT_TYPE,
  STONE_USAGE,
  DEFAULT_FREEDOM_LEVEL,
  isValidFreedomLevel,
  isMetalOnlyProductType,
  normalizeBrief,
  trayItemTitle,
} from './designDraft';

// Clean 5E — Hebrew freedom-level phrases threaded into concept TEXT only
// (existing string fields; no new concept schema fields — normalizeConcept
// whitelist untouched). Kept local like METAL_HE below.
const FREEDOM_PHRASE_HE = {
  locked: 'רמת חופש: מדויק — צמוד לנתוני האבנים ולרפרנס, מינימום סטייה יצירתית.',
  guided: 'רמת חופש: מאוזן — שמירה על הרעיון המרכזי עם שיפורים מקצועיים מדודים.',
  creative: 'רמת חופש: פתוח — פרשנות עיצובית חזקה ושיבוצים חלופיים מותרים.',
  exploratory: 'רמת חופש: חופשי — כיוונים נועזים ברמת קולקציה, ריאליסטיים ומודעים לייצור.',
};

function freedomPhraseHe(brief) {
  const level = isValidFreedomLevel(brief.freedomLevel)
    ? brief.freedomLevel
    : DEFAULT_FREEDOM_LEVEL;
  return FREEDOM_PHRASE_HE[level] || FREEDOM_PHRASE_HE[DEFAULT_FREEDOM_LEVEL];
}

// Hebrew metal labels (kept local to avoid a hard dependency on labels.js;
// values mirror BRIEF_HE.metal). Used only inside generated Hebrew copy.
const METAL_HE = {
  yellowGold: 'זהב צהוב',
  whiteGold: 'זהב לבן',
  roseGold: 'זהב אדום',
  platinum: 'פלטינה',
  silver: 'כסף',
};

// A neutral default metal phrase when none is chosen.
const METAL_DEFAULT_HE = 'מתכת לבחירה (זהב לבן / צהוב / פלטינה)';

function metalPhrase(brief) {
  const m = brief.metalPreference;
  if (m && METAL_HE[m]) return METAL_HE[m];
  return METAL_DEFAULT_HE;
}

// Count tray items by role (without collapsing center stones into a quantity —
// we keep the individual list too, for layout text).
function analyzeTray(trayItems) {
  const items = Array.isArray(trayItems) ? trayItems : [];
  const centers = items.filter((it) => it && it.role === DESIGN_ROLE.CENTER_STONE);
  const pairs = items.filter((it) => it && it.role === DESIGN_ROLE.PAIR);
  const sides = items.filter((it) => it && it.role === DESIGN_ROLE.SIDE_STONE);
  const accents = items.filter((it) => it && it.role === DESIGN_ROLE.ACCENT_STONE);
  const parcels = items.filter((it) => it && it.role === DESIGN_ROLE.PARCEL);
  const components = items.filter((it) => it && it.role === DESIGN_ROLE.COMPONENT);
  return {
    total: items.length,
    centers,
    pairs,
    sides,
    accents,
    parcels,
    components,
    hasCenter: centers.length > 0,
    hasPair: pairs.length > 0,
    hasSide: sides.length > 0,
    hasAccent: accents.length > 0,
    hasComponent: components.length > 0,
    hasAnyStone:
      centers.length + pairs.length + sides.length + accents.length + parcels.length > 0,
  };
}

// Whether the design should be treated as metal-only (no stones), based on the
// explicit stoneUsage, the product type, and what is actually on the tray.
function isMetalOnlyDesign(brief, info) {
  if (brief.stoneUsage === STONE_USAGE.NONE) return true;
  if (isMetalOnlyProductType(brief.productType)) return true;
  // No explicit usage chosen and nothing stone-like on the tray → metal-only.
  if (!brief.stoneUsage && !info.hasAnyStone) return true;
  return false;
}

// A short, readable center-stone reference list (titles), e.g.
// "אבן מרכזית: יהלום עגול 1.52 + ספיר אובל". Never a bare record id.
function centerStoneList(info) {
  if (!info.hasCenter) return '';
  const titles = info.centers.map((it) => trayItemTitle(it)).filter(Boolean);
  return titles.join(' + ');
}

function accentPhrase(info) {
  const bits = [];
  if (info.hasSide) bits.push('אבני צד');
  if (info.hasAccent) bits.push('אבנים נוספות');
  if (info.hasPair) bits.push('זוג אבנים');
  return bits.join(' + ');
}

// Build the stone-layout sentence for a concept, honoring the role structure.
function stoneLayoutText(info, { soloCenter } = {}) {
  if (!info.hasAnyStone) return 'ללא אבנים — עיצוב מתכת בלבד.';
  const parts = [];
  if (info.hasCenter) {
    const list = centerStoneList(info);
    if (info.centers.length === 1) {
      parts.push(`אבן מרכזית אחת${list ? ` (${list})` : ''}`);
    } else {
      parts.push(`${info.centers.length} אבנים מרכזיות נפרדות${list ? ` (${list})` : ''}`);
    }
  }
  if (!soloCenter) {
    const acc = accentPhrase(info);
    if (acc) parts.push(`משובצות ב${acc}`);
  }
  if (!info.hasCenter && info.hasPair) parts.push('בנוי סביב זוג אבנים תואם');
  if (!info.hasCenter && !info.hasPair && (info.hasSide || info.hasAccent)) {
    parts.push('שורת אבנים מפוזרת לאורך הפריט');
  }
  return parts.length ? `${parts.join(', ')}.` : 'אבנים נבחרות משולבות בעיצוב.';
}

// ID generator — stable enough for local concepts; no packages.
let conceptSeq = 0;
function makeConceptId() {
  conceptSeq += 1;
  return `cpt_${Date.now().toString(36)}_${conceptSeq}`;
}

function concept(partial) {
  return {
    conceptId: makeConceptId(),
    conceptName: '',
    shortDescription: '',
    productType: null,
    metalSuggestion: '',
    stoneLayout: '',
    designStructure: '',
    recommendedUse: '',
    // Placeholders for later milestones — intentionally inert text.
    productionNotes: 'הערות ייצור יתווספו בשלב מאוחר יותר.',
    renderBriefText: 'תקציר רינדור יתווסף בשלב מאוחר יותר.',
    conceptNotes: '',
    ...partial,
  };
}

// ---------------------------------------------------------------------------
// Concept builders by context
// ---------------------------------------------------------------------------

// Stone-led concepts (at least one stone present and stones are in use).
function stoneLedConcepts(brief, info) {
  const metal = metalPhrase(brief);
  const pt = brief.productType;
  const out = [];

  // Concept A — Classic solitaire / center-forward.
  out.push(
    concept({
      conceptName: 'סוליטר קלאסי',
      shortDescription: 'עיצוב נקי וממוקד שמעמיד את האבן המרכזית במרכז הבמה.',
      productType: pt || PRODUCT_TYPE.RING,
      metalSuggestion: metal,
      stoneLayout: stoneLayoutText(info, { soloCenter: true }),
      designStructure:
        'ראש שיבוץ מוגבה עם תושבת עדינה, חישוק חלק וצר שמדגיש את האבן. פרופורציה קלאסית ומאוזנת.',
      recommendedUse:
        brief.targetClient && brief.targetClient.trim()
          ? `מתאים ל${brief.targetClient.trim()}.`
          : 'מתאים לאירוסין, ציון דרך או חתיכת חתימה.',
    })
  );

  // Concept B — Accent / halo or side-stone direction (uses אבנים נוספות).
  const hasAccents = info.hasSide || info.hasAccent || info.hasPair;
  out.push(
    concept({
      conceptName: hasAccents ? 'אבן מרכזית עם אבנים נוספות' : 'אבן מרכזית עם הילה עדינה',
      shortDescription: hasAccents
        ? 'האבן המרכזית מוקפת באבנים נוספות שמעצימות נוכחות וברק.'
        : 'מסגרת עדינה של אבנים קטנות סביב האבן המרכזית להעצמת הגודל הנראה.',
      productType: pt || PRODUCT_TYPE.RING,
      metalSuggestion: metal,
      stoneLayout: stoneLayoutText(info),
      designStructure:
        'אבן מרכזית מוגבהת, מסגרת/שורת אבנים נוספות סביבה או לאורך הכתפיים, מעבר רך אל החישוק.',
      recommendedUse: 'מתאים למי שמחפש נוכחות וברק רב יותר סביב האבן.',
    })
  );

  // Concept C — Modern bezel / east-west, depends on a pendant context if a
  // chain/component exists, otherwise a contemporary ring.
  if (info.hasComponent) {
    out.push(
      concept({
        conceptName: 'תליון מודרני על שרשרת',
        shortDescription: 'האבן המרכזית הופכת לתליון על השרשרת/הרכיב הקיים.',
        productType: PRODUCT_TYPE.PENDANT,
        metalSuggestion: metal,
        stoneLayout: stoneLayoutText(info, { soloCenter: true }),
        designStructure:
          'שיבוץ מסגרת (bezel) נקי סביב האבן, לולאת תלייה עדינה, התאמה לשרשרת/רכיב שנבחרו.',
        recommendedUse: 'מתאים לחתיכה יומיומית או מתנה אישית.',
      })
    );
  } else {
    out.push(
      concept({
        conceptName: 'שיבוץ מסגרת מודרני',
        shortDescription: 'קו עכשווי ונקי עם שיבוץ מסגרת שמחבק את האבן.',
        productType: pt || PRODUCT_TYPE.RING,
        metalSuggestion: metal,
        stoneLayout: stoneLayoutText(info, { soloCenter: true }),
        designStructure:
          'שיבוץ מסגרת מלא או חלקי, קווים גיאומטריים נקיים, חישוק מעט רחב יותר לתחושה עכשווית.',
        recommendedUse: 'מתאים לסגנון מודרני, מינימליסטי או יומיומי-יוקרתי.',
      })
    );
  }

  return out;
}

// Metal-only concepts (no stones at all). Wedding bands, plain rings, chains,
// matching/complementary pieces, signets.
function metalOnlyConcepts(brief, info) {
  const metal = metalPhrase(brief);
  const pt = brief.productType;
  const out = [];

  const isMatching = pt === PRODUCT_TYPE.MATCHING_PIECE;
  const isBand =
    pt === PRODUCT_TYPE.WEDDING_BAND || pt === PRODUCT_TYPE.RING || pt === PRODUCT_TYPE.NO_STONES;

  // Concept A — Clean classic band.
  out.push(
    concept({
      conceptName: isMatching ? 'טבעת נישואים תואמת' : 'טבעת נישואים קלאסית',
      shortDescription: isMatching
        ? 'בנד מתכת נקי שתוכנן להשתלב עם פריט קיים.'
        : 'בנד מתכת חלק ונצחי בפרופורציה נוחה לכל יום.',
      productType: pt || PRODUCT_TYPE.WEDDING_BAND,
      metalSuggestion: metal,
      stoneLayout: 'ללא אבנים — מתכת בלבד.',
      designStructure:
        'פרופיל מעוגל נוח (comfort fit), משטח חלק או מוברש קל, רוחב מותאם ליד.',
      recommendedUse: 'מתאים לטבעת נישואים, בנד יומיומי או פריט תואם.',
    })
  );

  // Concept B — Textured / modern metal direction.
  out.push(
    concept({
      conceptName: 'בנד מתכת מודרני עם מרקם',
      shortDescription: 'קו עכשווי עם פלייה במרקם או שילוב גימורים.',
      productType: pt || PRODUCT_TYPE.WEDDING_BAND,
      metalSuggestion: metal,
      stoneLayout: 'ללא אבנים — דגש על מרקם וגימור המתכת.',
      designStructure:
        'שילוב גימור מט ומבריק, או חריטה/מרקם עדין לאורך הבנד, קצוות נקיים.',
      recommendedUse: 'מתאים למי שמחפש בנד עם אופי בלי אבנים.',
    })
  );

  // Concept C — context-aware third option: chain/necklace if a component
  // exists, signet otherwise.
  if (info.hasComponent || pt === PRODUCT_TYPE.NECKLACE) {
    out.push(
      concept({
        conceptName: 'שרשרת זהב מינימליסטית',
        shortDescription: 'שרשרת מתכת נקייה שיכולה לעמוד לבדה או לשאת תליון בעתיד.',
        productType: PRODUCT_TYPE.NECKLACE,
        metalSuggestion: metal,
        stoneLayout: 'ללא אבנים — שרשרת מתכת בלבד.',
        designStructure:
          'חוליות אחידות בקנה מידה עדין, אורך מותאם, סוגר נקי. מוכנה לשאת תליון בהמשך.',
        recommendedUse: 'מתאים לפריט יומיומי או בסיס לתכשיט עתידי.',
      })
    );
  } else {
    out.push(
      concept({
        conceptName: 'טבעת חותם (Signet)',
        shortDescription: 'טבעת מתכת מלאה עם משטח עליון לחריטה אישית.',
        productType: pt || PRODUCT_TYPE.RING,
        metalSuggestion: metal,
        stoneLayout: 'ללא אבנים — משטח מתכת לחריטה.',
        designStructure:
          'ראש שטוח או מעט קמור לחריטת מונוגרמה/סמל, מעבר רך אל החישוק.',
        recommendedUse: 'מתאים לפריט חתימה, מתנה אישית או פריט תואם.',
      })
    );
  }

  return out;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
// Generate exactly 3 design concepts from the current tray + brief. Pure and
// local. Returns a fresh array each call (deterministic content; ids vary).
export function generateConcepts(trayItems, brief) {
  const b = normalizeBrief(brief);
  const info = analyzeTray(trayItems);
  const metalOnly = isMetalOnlyDesign(b, info);

  let concepts;
  if (metalOnly) {
    concepts = metalOnlyConcepts(b, info);
  } else if (info.hasAnyStone) {
    concepts = stoneLedConcepts(b, info);
  } else {
    // stoneUsage optional/useSelected but nothing on the tray yet → offer
    // stone-ready directions that still read clearly without forcing a stone.
    concepts = stoneLedConcepts(b, info);
  }

  // Always return exactly three.
  // Clean 5E — thread the design freedom level into each concept's existing
  // designStructure text (no new fields). Pure string decoration; content
  // stays deterministic for the same inputs.
  const freedom = freedomPhraseHe(b);
  return concepts.slice(0, 3).map((c) => ({
    ...c,
    designStructure: [c.designStructure, freedom].filter(Boolean).join(' '),
  }));
}

// A tiny, display-only summary of the inputs the generator will use. Pure.
export function describeInputs(trayItems, brief) {
  const b = normalizeBrief(brief);
  const info = analyzeTray(trayItems);
  return {
    total: info.total,
    centerCount: info.centers.length,
    sideCount: info.sides.length,
    accentCount: info.accents.length,
    pairCount: info.pairs.length,
    parcelCount: info.parcels.length,
    componentCount: info.components.length,
    metalOnly: isMetalOnlyDesign(b, info),
    productType: b.productType,
    stoneUsage: b.stoneUsage,
  };
}
