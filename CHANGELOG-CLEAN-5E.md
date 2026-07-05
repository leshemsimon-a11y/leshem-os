# Clean 5E — Design Intent Layer ("כוונת עיצוב")

Root-ready patch. 6 changed files + this changelog. Baseline: post-Patch-D GitHub export (Vercel-confirmed).

## Files changed
1. lib/studio/designDraft.js — PROTECTED, approved minimal additive change only:
   FREEDOM_LEVEL enum/values/validator/default; freedomLevel in emptyBrief +
   normalizeBrief whitelist; conditional `freedom=` token in computeInputSignature
   (only when level ≠ guided). Additive STYLE_PREFERENCE values (luxury, delicate,
   halo, solitaire, threeStone, tennis, custom) and STONE_USAGE.SYSTEM_SUGGEST.
   conceptsAreStale / outputIsStale NOT touched. Diff is 100% additions.
2. lib/studio/labels.js — additive: INTENT_HE export; new keys inside BRIEF_HE.style
   and CONCEPT_HE.stoneUsage. ONE display-label change (disclosed): style
   'statement' now shows "נוכח" instead of "סטייטמנט" per the approved "Bold / נוכח
   = existing statement value" mapping. Canonical value unchanged.
3. lib/studio/designConcepts.js — freedom phrase (Hebrew) appended to each generated
   concept's existing designStructure text. No new concept fields.
4. lib/studio/designOutputs.js — English "Design freedom: …" instruction appended to
   renderBriefText; Hebrew freedom line in the Hebrew render brief; STYLE_EN
   coverage for the new style values. No new output fields.
5. components/studio/design/shell/StudioIntentDrawer.js — NEW: chip-based intent
   drawer (desktop side drawer / narrow bottom sheet) editing the existing brief via
   existing designBriefStore exports only. Exports intentSummaryText().
6. components/studio/design/shell/StudioShell.js — tappable intent summary chip in
   the canvas header ("טבעת · יוקרתי · זהב צהוב · … · מאוזן" or "כוונת עיצוב" when
   empty); mounts the drawer with the shell's existing narrow flag.

## UX state explanation
The intent lives on the EXISTING design brief (leshem_studio_design_brief_v1) — no
new store, no new key. Fields: productType (what), styleDirection (style),
metalPreference (metal), stoneUsage (stones incl. "שהמערכת תציע"), designGoal (the
short note "מה אתה רוצה ליצור?"), freedomLevel (locked/guided/creative/exploratory,
default guided). Every chip tap persists immediately through updateBrief; the drawer
and the concept panel's fuller form edit the same fields and stay live-synced via
the store's existing pub/sub. The header chip always reflects current intent.
Freedom level threads into: concept designStructure (Hebrew), Hebrew render brief,
English render brief instruction line. Stale: the six intent inputs participate via
the existing signature (five were already in it; freedom joins conditionally).

## How to test
1. Open /studio/design with stones in the tray. 2. Tap the header intent chip →
drawer opens (bottom sheet on narrow). 3. Set type/style/metal/usage/freedom + a
short note; watch the footer summary build. 4. Close; header chip shows the summary.
5. Generate concepts → each concept's design-logic text ends with the freedom line.
6. Select a direction; prepare output → English render brief ends with
"Design freedom: …"; Hebrew brief includes "רמת חופש: …". 7. Change style, metal, or
freedom → stale banner appears; regenerate clears it. 8. Set stoneUsage = "תכשיט ללא
אבנים" with product weddingBand → metal-only flow still generates 3 concepts.
9. Verify legacy projects opened after deploy show NO stale banner until an input
actually changes.

## Known limitations
Freedom at default (guided) does not mark pre-5E concepts stale by design (approved).
The concept panel's style chip row now shows 12 styles — it wraps (existing
flexWrap); the drawer is the primary fast surface. Intent is text-threaded only; no
render engine is called. Real `next build` not run offline — Vercel is the gate.

## QA performed (offline)
node --check on all four libs; brace/JSX balance on both components; comm -23
additive-export proof per file; protected files beyond the approved one verified
byte-identical (designBriefStore, workTray, designProjects, DesignConceptPanel,
DesignOutputPanel, AssetPicker, tokens, pages/); forbidden-token scans clean.
Real-module sandboxes (stubbed browser env): legacy guided brief NOT stale after
deploy; guided→locked stale; locked→guided un-stale; style/metal/product stale;
new vocabulary persists + round-trips normalizeBrief; systemSuggest does not force
metal-only; concepts=3 with freedom phrase; generateOutput works; EN LOCKED
instruction + HE freedom line present; output stale on freedom change; metal-only
path intact. 27/27 checks passed.
