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

import * as React from 'react';
import { tokens } from '../../shared/tokens';
import { STUDIO_5D_HE } from '../../../../lib/studio/labels';
import { RingSilhouette, StoneFacets, StoneIcon, MetalIcon, TrayIcon } from './StudioIcons';

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

// Soft jewelry-preview tile placeholder.
function PreviewTile({ size = 132 }) {
  return (
    <div style={styles.previewTile} aria-hidden="true">
      <RingSilhouette size={size} stroke={1.4} />
    </div>
  );
}

// Blueprint technical sketch (decorative).
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

// Clean 5D-R3 — one large tappable choice card for the guided start state.
function HeroChoiceCard({ Icon, title, desc, onClick, primary }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ...styles.heroCard, ...(primary ? styles.heroCardPrimary : null) }}
      dir="rtl"
    >
      <span style={{ ...styles.heroCardIcon, ...(primary ? styles.heroCardIconPrimary : null) }} aria-hidden="true">
        <Icon size={26} />
      </span>
      <span style={styles.heroCardText}>
        <span style={styles.heroCardTitle}>{title}</span>
        <span style={styles.heroCardDesc}>{desc}</span>
      </span>
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
            <PreviewTile size={116} />
            <span style={styles.heroEyebrow}>{H.eyebrow}</span>
            <span style={styles.heroTitle}>{H.title}</span>
            <span style={styles.heroSubtitle}>{H.subtitle}</span>
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
            <PreviewTile size={150} />
            <span style={styles.previewTitle}>{selected.conceptName}</span>
            <span style={styles.previewHint}>{STUDIO_5D_HE.canvasPreviewSoon}</span>
          </div>
          <div style={styles.blueprintPane}>
            <span style={styles.paneTag}>{STUDIO_5D_HE.canvasBlueprint}</span>
            <BlueprintSketch />
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
              <span style={styles.starterTitle}>{STUDIO_5D_HE.canvasStarterTitle}</span>
              <span style={styles.starterSub}>
                {hasStones ? STUDIO_5D_HE.canvasStarterStones : STUDIO_5D_HE.stonesMetalOnly}
              </span>
            </div>
          </div>

          {/* 3 empty preview concept slots */}
          <div style={styles.slots}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={styles.slot} aria-hidden="true">
                <StoneFacets size={34} />
                <span style={styles.slotLabel}>{STUDIO_5D_HE.canvasSlot}</span>
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
  heroSubtitle: {
    fontFamily: tokens.font.body,
    fontSize: '13.5px',
    color: tokens.color.inkSoft,
    lineHeight: 1.5,
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
  heroCardText: { display: 'flex', flexDirection: 'column', gap: '4px' },
  heroCardTitle: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  heroCardDesc: {
    fontFamily: tokens.font.body,
    fontSize: '11.5px',
    lineHeight: 1.5,
    color: tokens.color.inkSoft,
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
    color: tokens.color.gold,
    background: 'radial-gradient(circle at 38% 32%, #FFFFFF, #F1ECE3 70%, #E6DFD2)',
    boxShadow: 'inset 0 2px 10px rgba(184,151,90,0.12), 0 10px 30px rgba(43,40,36,0.06)',
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
  starterSub: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    color: tokens.color.inkSoft,
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
  slotLabel: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.color.inkFaint,
    letterSpacing: '0.04em',
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
