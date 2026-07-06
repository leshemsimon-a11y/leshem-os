// components/studio/design/shell/StudioCanvas.js
//
// LESHEM.S OS — Design Studio Layout Reset — Zone 3: Center Work Canvas.
//
// The central canvas, made usable before clever. It is never an empty grid:
// every state shows jewelry/stone/CAD visuals so a jeweller instantly sees
// what is being designed. All visuals are inline CSS/SVG placeholders — no
// asset files, no render generation, no AI. Business logic stays in the
// panels passed as `children`; the canvas only frames them.
//
// States (unchanged from Clean 5D-R3):
//   • hero      → State A: nothing selected yet (no stones, no concepts, not
//                 dismissed). A calm guided start with exactly 3 large visual
//                 choices. Never a blank canvas.
//   • selected  → State D: large split: jewelry preview | CAD blueprint.
//   • starter   → State B: stones/metal-only chosen but no concepts yet — the
//                 ring silhouette + slots + the embedded input panel.
//   • concepts (>0, none chosen) → State C: the panel's concept cards, framed.
//   • direction / output → the panel children on a calm CAD surface.
//
// Studio Layout Reset (Clean 5D-R4): visual-only pass. Palette relit to the
// near-white/graphite direction (see ./studioResetStyle.js) — less beige/
// ivory, no gold fills (the gold token is reserved for a hairline accent at
// most), border radius reduced across the board, decorative circular tiles
// squared off to match the "less rounded, more workbench" direction. The
// step indicator + current step title live in StudioShell.js just above
// this component (not inside it), so mode/prop contract here is UNCHANGED:
// same props (mode, selected, hasConcepts, hasStones, hero callbacks,
// children), same 4 mode branches, same business-logic-free framing role.

import * as React from 'react';
import { STUDIO_5D_HE, STUDIO_6A_HE } from '../../../../lib/studio/labels';
import { RingSilhouette, StoneFacets, StoneIcon, MetalIcon, ProductIcon, UploadIcon } from './StudioIcons';
import ConceptSketch from './ConceptSketch';
import {
  getEmptyStateIllustration,
  getBlueprintPlaceholder,
  getJewelryPreviewPlaceholder,
} from '../../../../lib/studio/assetPack';
import { reset } from './studioResetStyle';

const BLUEPRINT_BG =
  'url("data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">' +
      '<rect width="80" height="80" fill="none"/>' +
      '<path d="M80 0H0V80" fill="none" stroke="rgba(17,17,20,0.06)" stroke-width="1"/>' +
      '<path d="M20 0V80M40 0V80M60 0V80M0 20H80M0 40H80M0 60H80" fill="none" stroke="rgba(17,17,20,0.03)" stroke-width="1"/>' +
      '</svg>'
  ) +
  '")';

// Soft jewelry-preview tile placeholder (inline SVG fallback — always available).
function PreviewTile({ size = 132 }) {
  return (
    <div style={styles.previewTile} aria-hidden="true">
      <RingSilhouette size={size} stroke={1.4} />
    </div>
  );
}

// Blueprint technical sketch (inline SVG fallback — always available).
function BlueprintSketch() {
  return (
    <div style={styles.blueprintArt} aria-hidden="true">
      <svg width="100%" height="100%" viewBox="0 0 260 260" fill="none" preserveAspectRatio="xMidYMid meet">
        <circle cx="130" cy="150" r="62" stroke="#C7CBD1" strokeWidth="1.2" />
        <circle cx="130" cy="150" r="40" stroke="#D8DBDF" strokeWidth="1" strokeDasharray="3 4" />
        <path d="M130 18v74M70 150h120M104 92l8 16h36l8-16" stroke="#C7CBD1" strokeWidth="1.1" />
        <path d="M112 92l-6 16M148 92l6 16" stroke="#D8DBDF" strokeWidth="1" />
        <path d="M130 18l-10 22M130 18l10 22" stroke="#D8DBDF" strokeWidth="1" />
        <circle cx="130" cy="150" r="10" stroke="#C7CBD1" strokeWidth="1" />
      </svg>
    </div>
  );
}

// Clean 5D-R3 + Starter Asset Pack v1 — a jewelry preview photo (Asset Pack)
// filling the same square frame as PreviewTile. Falls back to the original
// inline ring silhouette on any load error, so the canvas is NEVER blank or
// broken even if a static asset is missing at deploy time.
function PreviewVisual({ size = 132, src }) {
  const [failed, setFailed] = React.useState(false);
  if (!src || failed) return <PreviewTile size={size} />;
  return (
    <div style={styles.previewTile} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" style={styles.previewTileImg} onError={() => setFailed(true)} />
    </div>
  );
}

// Clean 5D-R3 + Starter Asset Pack v1 — a real blueprint illustration (Asset
// Pack) in place of the inline CAD sketch. Falls back to BlueprintSketch on
// any load error.
function BlueprintVisual({ src }) {
  const [failed, setFailed] = React.useState(false);
  if (!src || failed) return <BlueprintSketch />;
  return (
    <div style={styles.blueprintArt} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" style={styles.blueprintArtImg} onError={() => setFailed(true)} />
    </div>
  );
}

// Clean 5D-R3 + Starter Asset Pack v1 — the guided-start hero illustration.
// Falls back to the original ring-silhouette PreviewTile on any load error.
function HeroIllustration({ src, title }) {
  const [failed, setFailed] = React.useState(false);
  if (!src || failed) return <PreviewTile size={112} />;
  return (
    <div style={styles.heroIllustration} title={title} aria-label={title}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" style={styles.heroIllustrationImg} onError={() => setFailed(true)} />
    </div>
  );
}

// One large tappable choice card for the guided start state. `desc` is a
// hover tooltip + accessible name, not a second always-visible line.
// Clean 6A (additive): `disabled` renders an HONEST future placeholder —
// visibly quieter, non-clickable, with a small "בקרוב" badge. Nothing is
// faked; the card promises nothing it cannot do.
function HeroChoiceCard({ Icon, title, desc, onClick, primary, disabled }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={Boolean(disabled)}
      style={{
        ...styles.heroCard,
        ...(primary ? styles.heroCardPrimary : null),
        ...(disabled ? styles.heroCardDisabled : null),
      }}
      dir="rtl"
      title={desc}
      aria-label={desc ? `${title} — ${desc}` : title}
    >
      {disabled ? (
        <span style={styles.heroSoonBadge}>{STUDIO_6A_HE.hero.soonBadge}</span>
      ) : null}
      <span style={{ ...styles.heroCardIcon, ...(primary ? styles.heroCardIconPrimary : null) }} aria-hidden="true">
        <Icon size={24} />
      </span>
      <span style={styles.heroCardTitle}>{title}</span>
    </button>
  );
}

export default function StudioCanvas({
  mode = 'concepts',
  selected,
  hasConcepts,
  hasStones,
  onChooseStones,
  onChooseNoStones,
  // Clean 6A — additive hero props. `onUploadAsset` opens the existing
  // AssetPicker/upload flow; `resumeChip` ({ text, title, onClick } | null)
  // renders the small SECONDARY "המשך תיק עבודה" context chip — deliberately
  // NOT one of the four primary start actions.
  onUploadAsset,
  resumeChip = null,
  // Clean 6A — the selected-direction blueprint pane can show a derived
  // concept sketch; the caller passes the current tray stone shapes.
  stoneShapes = [],
  fallbackProductType = null,
  children,
}) {
  const H = STUDIO_5D_HE.hero;
  const H6 = STUDIO_6A_HE.hero;

  // 0) Guided empty start (State A) — Clean 6A: exactly 4 primary creation
  //    actions (never blank), plus an optional small resume chip. The old
  //    third card ("פתח מגש עבודה") is replaced per the approved 6A spec —
  //    the tray stays reachable from the app nav and the stone strip.
  if (mode === 'hero') {
    return (
      <section style={styles.canvas} dir="rtl">
        <div style={styles.blueprint} aria-hidden="true" />
        <div style={styles.hero}>
          <div style={styles.heroIntro}>
            <HeroIllustration src={getEmptyStateIllustration()} title={H.subtitle} />
            <span style={styles.heroEyebrow}>{H.eyebrow}</span>
            <span style={styles.heroTitle}>{H.title}</span>
          </div>
          <div style={styles.heroChoices}>
            <HeroChoiceCard
              Icon={StoneIcon}
              title={H6.pickStonesTitle}
              desc={H6.pickStonesDesc}
              onClick={onChooseStones}
              primary
            />
            <HeroChoiceCard
              Icon={UploadIcon}
              title={H6.uploadTitle}
              desc={H6.uploadDesc}
              onClick={onUploadAsset}
            />
            <HeroChoiceCard
              Icon={ProductIcon}
              title={H6.fromModelTitle}
              desc={H6.fromModelDesc}
              disabled
            />
            <HeroChoiceCard
              Icon={MetalIcon}
              title={H6.noStonesTitle}
              desc={H6.noStonesDesc}
              onClick={onChooseNoStones}
            />
          </div>
          {resumeChip ? (
            <button
              type="button"
              onClick={resumeChip.onClick}
              style={styles.heroResumeChip}
              title={resumeChip.title || resumeChip.text}
            >
              {resumeChip.text}
            </button>
          ) : null}
        </div>
      </section>
    );
  }

  // 1) Selected direction → large split preview (State D).
  if (mode === 'selected' && selected) {
    return (
      <section style={styles.canvas} dir="rtl">
        <div style={styles.blueprint} aria-hidden="true" />
        <div style={styles.split}>
          <div style={styles.previewPane}>
            <span style={styles.paneTag}>{STUDIO_5D_HE.canvasRender}</span>
            <PreviewVisual size={150} src={getJewelryPreviewPlaceholder()} />
            <span style={styles.previewTitle}>{selected.conceptName}</span>
            <span style={styles.previewHint} title={STUDIO_5D_HE.canvasPreviewSoon}>
              {STUDIO_5D_HE.canvasPreviewBadge}
            </span>
          </div>
          <div style={styles.blueprintPane}>
            {/* Clean 6A — the selected direction shows its DERIVED schematic
                concept sketch (render-time only, nothing stored). Falls back
                to the original blueprint placeholder if the concept is
                somehow missing — the pane is never blank. */}
            {selected && selected.conceptId ? (
              <>
                <span style={styles.paneTag}>{STUDIO_6A_HE.sketch.paneTag}</span>
                <div style={styles.sketchArt} aria-hidden="false">
                  <ConceptSketch
                    concept={selected}
                    fallbackProductType={fallbackProductType}
                    stoneShapes={stoneShapes}
                    size={240}
                    title={STUDIO_6A_HE.sketch.thumbTitle(selected.conceptName)}
                  />
                </div>
                <span style={styles.sketchNote}>{STUDIO_6A_HE.sketch.schematicNote}</span>
              </>
            ) : (
              <>
                <span style={styles.paneTag}>{STUDIO_5D_HE.canvasBlueprint}</span>
                <BlueprintVisual src={getBlueprintPlaceholder()} />
              </>
            )}
          </div>
        </div>
      </section>
    );
  }

  // 2) Starter canvas (stones/metal-only chosen, no concepts yet — State B).
  if (mode === 'concepts' && !hasConcepts) {
    return (
      <section style={styles.canvas} dir="rtl">
        <div style={styles.blueprint} aria-hidden="true" />
        <div style={styles.starter}>
          <div style={styles.starterHero}>
            <PreviewTile size={140} />
            <div style={styles.starterHeroText}>
              <span style={styles.starterEyebrow}>{STUDIO_5D_HE.rail.design}</span>
              <span
                style={styles.starterTitle}
                title={hasStones ? STUDIO_5D_HE.canvasStarterStones : STUDIO_5D_HE.stonesMetalOnly}
              >
                {STUDIO_5D_HE.canvasStarterTitle}
              </span>
            </div>
          </div>

          {/* 3 empty preview concept slots — icon only, label on hover */}
          <div style={styles.slots}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={styles.slot} title={STUDIO_5D_HE.canvasSlot} aria-hidden="true">
                <StoneFacets size={30} />
              </div>
            ))}
          </div>

          {/* The panel (generate action + any inputs) lives here, framed. */}
          <div style={styles.starterPanel}>{children}</div>
        </div>
      </section>
    );
  }

  // 3) Concepts exist but none selected, OR direction/output views → framed flow.
  return (
    <section style={styles.canvas} dir="rtl">
      <div style={styles.blueprint} aria-hidden="true" />
      <div style={styles.flow}>
        {mode === 'concepts' && (
          <span style={styles.flowEyebrow}>{STUDIO_5D_HE.canvasPickDirection}</span>
        )}
        {children}
      </div>
    </section>
  );
}

const styles = {
  canvas: {
    position: 'relative',
    background: reset.color.panel,
    border: `1px solid ${reset.color.border}`,
    borderRadius: reset.radius.lg,
    overflow: 'hidden',
    minHeight: 0,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  blueprint: {
    position: 'absolute',
    inset: 0,
    backgroundColor: reset.color.panel,
    backgroundImage: `radial-gradient(circle at 50% 0%, rgba(255,255,255,0.7), transparent 55%), ${BLUEPRINT_BG}`,
    backgroundSize: 'auto, 80px 80px',
    pointerEvents: 'none',
  },

  // ---- hero (State A — guided empty start) ----
  hero: {
    position: 'relative',
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '32px 28px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '26px',
  },
  heroIntro: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    textAlign: 'center',
    maxWidth: '440px',
  },
  heroIllustration: {
    width: '188px',
    height: '188px',
    borderRadius: reset.radius.lg,
    overflow: 'hidden',
    border: `1px solid ${reset.color.border}`,
    background: reset.color.page,
  },
  heroIllustrationImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  heroEyebrow: {
    fontFamily: reset.font.body,
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.14em',
    color: reset.color.textMuted,
    marginTop: '4px',
  },
  heroTitle: {
    fontFamily: reset.font.display,
    fontWeight: 700,
    fontSize: '22px',
    color: reset.color.text,
    lineHeight: 1.2,
  },
  // Clean 6A — 4 primary actions; auto-fit lets the grid wrap 4→2→1 on
  // narrow viewports without a media query or a viewport prop.
  heroChoices: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(158px, 1fr))',
    gap: '12px',
    width: '100%',
    maxWidth: '760px',
  },
  heroCard: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '10px',
    minHeight: '150px',
    padding: '20px 16px',
    background: reset.color.panel,
    border: `1px solid ${reset.color.border}`,
    borderRadius: reset.radius.md,
    cursor: 'pointer',
    justifyContent: 'center',
  },
  // Clean 6A — honest future placeholder: quieter, non-interactive.
  heroCardDisabled: {
    cursor: 'default',
    opacity: 0.55,
  },
  heroSoonBadge: {
    position: 'absolute',
    top: '8px',
    insetInlineStart: '8px',
    fontFamily: reset.font.body,
    fontSize: '9.5px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: reset.color.textMuted,
    border: `1px solid ${reset.color.border}`,
    borderRadius: '999px',
    padding: '2px 8px',
    background: reset.color.page,
  },
  // Clean 6A — small SECONDARY resume chip (never one of the 4 main cards).
  heroResumeChip: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: '32px',
    padding: '6px 14px',
    borderRadius: '999px',
    border: `1px solid ${reset.color.borderStrong}`,
    background: reset.color.panel,
    color: reset.color.text,
    fontFamily: reset.font.body,
    fontSize: '11.5px',
    fontWeight: 700,
    cursor: 'pointer',
    maxWidth: '92%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  heroCardPrimary: {
    border: `1.5px solid ${reset.color.text}`,
  },
  heroCardIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    borderRadius: reset.radius.sm,
    color: reset.color.textMuted,
    background: reset.color.page,
  },
  heroCardIconPrimary: {
    color: reset.color.text,
  },
  heroCardTitle: {
    fontFamily: reset.font.body,
    fontSize: '13px',
    fontWeight: 700,
    color: reset.color.text,
  },

  // ---- split (selected) ----
  split: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    flex: 1,
    minHeight: 0,
  },
  previewPane: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '22px',
  },
  blueprintPane: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '22px',
    borderInlineStart: `1px solid ${reset.color.border}`,
  },
  paneTag: {
    position: 'absolute',
    top: '12px',
    insetInlineEnd: '14px',
    fontFamily: reset.font.body,
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    color: reset.color.textFaint,
  },
  previewTile: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '200px',
    height: '200px',
    borderRadius: reset.radius.lg,
    overflow: 'hidden',
    color: reset.color.textMuted,
    background: reset.color.page,
    border: `1px solid ${reset.color.border}`,
  },
  previewTileImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  previewTitle: {
    fontFamily: reset.font.display,
    fontWeight: 700,
    fontSize: '18px',
    color: reset.color.text,
    textAlign: 'center',
  },
  previewHint: {
    fontFamily: reset.font.body,
    fontSize: '11px',
    color: reset.color.textFaint,
  },
  blueprintArt: {
    width: '100%',
    maxWidth: '280px',
    aspectRatio: '1 / 1',
    color: reset.color.textMuted,
    borderRadius: reset.radius.md,
    overflow: 'hidden',
  },
  blueprintArtImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  // Clean 6A — derived concept sketch pane (selected direction).
  sketchArt: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '280px',
    aspectRatio: '1 / 1',
    color: reset.color.textMuted,
    borderRadius: reset.radius.md,
    border: `1px dashed ${reset.color.border}`,
    background: reset.color.page,
    overflow: 'hidden',
  },
  sketchNote: {
    fontFamily: reset.font.body,
    fontSize: '10.5px',
    color: reset.color.textFaint,
    marginTop: '8px',
  },

  // ---- starter (State B) ----
  starter: {
    position: 'relative',
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '22px 24px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  starterHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    flexWrap: 'wrap',
  },
  starterHeroText: { display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 },
  starterEyebrow: {
    fontFamily: reset.font.body,
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.14em',
    color: reset.color.textMuted,
  },
  starterTitle: {
    fontFamily: reset.font.display,
    fontWeight: 700,
    fontSize: '20px',
    color: reset.color.text,
    lineHeight: 1.15,
  },
  slots: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  slot: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    minHeight: '100px',
    borderRadius: reset.radius.md,
    border: `1px dashed ${reset.color.border}`,
    background: reset.color.page,
    color: reset.color.textFaint,
  },
  starterPanel: {
    background: reset.color.page,
    border: `1px solid ${reset.color.border}`,
    borderRadius: reset.radius.md,
    padding: '16px 18px',
  },

  // ---- flow (concepts list / direction / output — State C) ----
  flow: {
    position: 'relative',
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '20px 22px',
  },
  flowEyebrow: {
    display: 'block',
    fontFamily: reset.font.body,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    color: reset.color.textMuted,
    marginBottom: '12px',
  },
};
