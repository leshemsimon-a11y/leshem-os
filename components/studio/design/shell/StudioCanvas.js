// components/studio/design/shell/StudioCanvas.js
//
// Clean 5D-R3 — the central canvas, made usable before clever. It is never an
// empty grid: every state shows jewelry/stone/CAD visuals so a jeweler
// instantly sees what is being designed. All visuals are inline CSS/SVG
// placeholders — no asset files, no render generation, no AI. Business logic
// stays in the panels passed as `children`; the canvas only frames them.
//
// States (Clean 5D-R3 state model):
//   • hero      → State A: nothing selected yet (no stones, no concepts, not
//                 dismissed). A calm guided start with exactly 3 large visual
//                 choices. Never a blank canvas.
//   • selected  → State D: large split: jewelry preview | CAD blueprint.
//   • starter   → State B: stones/metal-only chosen but no concepts yet — the
//                 ring silhouette + slots + the embedded input panel.
//   • concepts (>0, none chosen) → State C: the panel's concept cards, framed.
//   • direction / output → the panel children on a calm CAD surface.
//
// Fills its grid cell and scrolls INTERNALLY. No business logic here — the
// three new hero callbacks are pure UI-level actions wired by the shell
// (open asset picker / proceed metal-only / go to work tray).
//
// UX Compression Pass: hero subtitle, each hero choice's description, the
// starter subtitle, the 3 slot captions, and the preview-pane hint sentence
// are no longer always-visible text. Each is either dropped from render and
// relocated to a hover `title` tooltip (values unchanged in labels.js) or
// shrunk to a 1-word badge with the fuller phrase kept as the tooltip. No
// label was deleted — only where and how it's shown changed.

import * as React from 'react';
import { tokens } from '../../shared/tokens';
import { STUDIO_5D_HE } from '../../../../lib/studio/labels';
import { RingSilhouette, StoneFacets, StoneIcon, MetalIcon, TrayIcon } from './StudioIcons';
import {
  getEmptyStateIllustration,
  getBlueprintPlaceholder,
  getJewelryPreviewPlaceholder,
} from '../../../../lib/studio/assetPack';

const BLUEPRINT_BG =
  'url("data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">' +
      '<rect width="80" height="80" fill="none"/>' +
      '<path d="M80 0H0V80" fill="none" stroke="rgba(127,168,184,0.10)" stroke-width="1"/>' +
      '<path d="M20 0V80M40 0V80M60 0V80M0 20H80M0 40H80M0 60H80" fill="none" stroke="rgba(127,168,184,0.05)" stroke-width="1"/>' +
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
        <circle cx="130" cy="150" r="62" stroke="#B9C3C8" strokeWidth="1.2" />
        <circle cx="130" cy="150" r="40" stroke="#CBD3D7" strokeWidth="1" strokeDasharray="3 4" />
        <path d="M130 18v74M70 150h120M104 92l8 16h36l8-16" stroke="#B9C3C8" strokeWidth="1.1" />
        <path d="M112 92l-6 16M148 92l6 16" stroke="#CBD3D7" strokeWidth="1" />
        <path d="M130 18l-10 22M130 18l10 22" stroke="#CBD3D7" strokeWidth="1" />
        <circle cx="130" cy="150" r="10" stroke="#B9C3C8" strokeWidth="1" />
      </svg>
    </div>
  );
}

// Clean 5D-R3 + Starter Asset Pack v1 — a jewelry preview photo (Asset Pack)
// filling the same circular frame as PreviewTile. Falls back to the original
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
// UX Compression Pass: accepts an optional `title` tooltip so the hero
// subtitle text (previously always-visible) is still reachable on hover.
function HeroIllustration({ src, title }) {
  const [failed, setFailed] = React.useState(false);
  if (!src || failed) return <PreviewTile size={116} />;
  return (
    <div style={styles.heroIllustration} title={title} aria-label={title}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" style={styles.heroIllustrationImg} onError={() => setFailed(true)} />
    </div>
  );
}

// Clean 5D-R3 — one large tappable choice card for the guided start state.
// UX Compression Pass: only the icon + short title are always visible now;
// `desc` (unchanged text) becomes a hover tooltip + accessible name instead
// of a second always-visible line, per "turn choose-direction into compact
// visual buttons; hide why-this-direction text inside expandable details."
function HeroChoiceCard({ Icon, title, desc, onClick, primary }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ...styles.heroCard, ...(primary ? styles.heroCardPrimary : null) }}
      dir="rtl"
      title={desc}
      aria-label={desc ? `${title} — ${desc}` : title}
    >
      <span style={{ ...styles.heroCardIcon, ...(primary ? styles.heroCardIconPrimary : null) }} aria-hidden="true">
        <Icon size={26} />
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
  onOpenTray,
  children,
}) {
  const H = STUDIO_5D_HE.hero;

  // 0) Guided empty start (State A) — exactly 3 large choices, never blank.
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
              title={H.stonesTitle}
              desc={H.stonesDesc}
              onClick={onChooseStones}
              primary
            />
            <HeroChoiceCard
              Icon={MetalIcon}
              title={H.noStonesTitle}
              desc={H.noStonesDesc}
              onClick={onChooseNoStones}
            />
            <HeroChoiceCard
              Icon={TrayIcon}
              title={H.trayTitle}
              desc={H.trayDesc}
              onClick={onOpenTray}
            />
          </div>
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
            <span style={styles.paneTag}>{STUDIO_5D_HE.canvasBlueprint}</span>
            <BlueprintVisual src={getBlueprintPlaceholder()} />
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
            <PreviewTile size={150} />
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
                <StoneFacets size={34} />
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
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.lg,
    boxShadow: tokens.shadow.canvas,
    overflow: 'hidden',
    minHeight: 0,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  blueprint: {
    position: 'absolute',
    inset: 0,
    backgroundColor: tokens.color.canvas,
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
    padding: '36px 32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '30px',
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
    width: '208px',
    height: '208px',
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
    border: `1px solid ${tokens.color.cardEdge}`,
    boxShadow: tokens.shadow.hairline,
    background: tokens.color.ivory,
  },
  heroIllustrationImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  heroEyebrow: {
    fontFamily: tokens.font.body,
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.16em',
    color: tokens.color.gold,
    marginTop: '6px',
  },
  heroTitle: {
    fontFamily: tokens.font.display,
    fontWeight: 700,
    fontSize: '26px',
    color: tokens.color.charcoal,
    lineHeight: 1.2,
  },
  heroChoices: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(180px, 1fr))',
    gap: '14px',
    width: '100%',
    maxWidth: '760px',
  },
  heroCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '12px',
    minHeight: '168px',
    padding: '24px 18px',
    background: tokens.color.ivory,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.lg,
    boxShadow: tokens.shadow.hairline,
    cursor: 'pointer',
    transition: 'border-color 140ms, box-shadow 140ms, transform 140ms',
  },
  heroCardPrimary: {
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.goldSoft}`,
    boxShadow: '0 10px 24px rgba(184,151,90,0.16)',
  },
  heroCardIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    color: tokens.color.ice,
    background: tokens.color.iceFaint,
  },
  heroCardIconPrimary: {
    color: tokens.color.gold,
    background: tokens.color.ivory,
  },
  heroCardTitle: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 700,
    color: tokens.color.charcoal,
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
    gap: '14px',
    padding: '24px',
    background: 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.92), rgba(244,239,230,0.5))',
  },
  blueprintPane: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    borderInlineStart: `1px solid ${tokens.color.cardEdge}`,
  },
  paneTag: {
    position: 'absolute',
    top: '14px',
    insetInlineEnd: '16px',
    fontFamily: tokens.font.body,
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.14em',
    color: tokens.color.inkFaint,
  },
  previewTile: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '210px',
    height: '210px',
    borderRadius: '50%',
    overflow: 'hidden',
    color: tokens.color.gold,
    background: 'radial-gradient(circle at 38% 32%, #FFFFFF, #F1ECE3 70%, #E6DFD2)',
    boxShadow: 'inset 0 2px 10px rgba(184,151,90,0.12), 0 10px 30px rgba(43,40,36,0.06)',
  },
  previewTileImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  previewTitle: {
    fontFamily: tokens.font.display,
    fontWeight: 700,
    fontSize: '20px',
    color: tokens.color.charcoal,
    textAlign: 'center',
  },
  previewHint: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    color: tokens.color.inkFaint,
    letterSpacing: '0.02em',
  },
  blueprintArt: {
    width: '100%',
    maxWidth: '300px',
    aspectRatio: '1 / 1',
    color: tokens.color.ice,
    opacity: 0.9,
    borderRadius: tokens.radius.md,
    overflow: 'hidden',
  },
  blueprintArtImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },

  // ---- starter (State B) ----
  starter: {
    position: 'relative',
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '26px 28px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '22px',
  },
  starterHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '22px',
    flexWrap: 'wrap',
  },
  starterHeroText: { display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 },
  starterEyebrow: {
    fontFamily: tokens.font.body,
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.16em',
    color: tokens.color.gold,
  },
  starterTitle: {
    fontFamily: tokens.font.display,
    fontWeight: 700,
    fontSize: '24px',
    color: tokens.color.charcoal,
    lineHeight: 1.15,
  },
  slots: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '14px',
  },
  slot: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    minHeight: '112px',
    borderRadius: tokens.radius.md,
    border: `1px dashed ${tokens.color.goldFaint}`,
    background: 'rgba(255,255,255,0.5)',
    color: tokens.color.goldSoft,
  },
  starterPanel: {
    background: 'rgba(255,255,255,0.6)',
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    padding: '18px 20px',
  },

  // ---- flow (concepts list / direction / output — State C) ----
  flow: {
    position: 'relative',
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '22px 24px',
  },
  flowEyebrow: {
    display: 'block',
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.14em',
    color: tokens.color.gold,
    marginBottom: '14px',
  },
};
