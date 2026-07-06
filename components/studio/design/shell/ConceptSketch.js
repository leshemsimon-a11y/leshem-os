// components/studio/design/shell/ConceptSketch.js
//
// LESHEM.S OS — Clean 6A: derived concept sketches.
//
// A PURE, PRESENTATIONAL, DETERMINISTIC schematic sketch of a design
// direction, derived AT RENDER TIME from data that already exists on the
// concept / brief / Work Tray. Honest by construction:
//   • No stored sketch field, no concept-schema change, no persistence —
//     the same concept always yields the same sketch, recomputed on render.
//   • Deliberately SCHEMATIC line art (construction lines, dashed guides),
//     never a photoreal preview — real renders remain an honest "בקרוב".
//   • No store imports, no state, no side effects. Reads ONLY the props the
//     caller passes; it never fabricates data (a missing product type simply
//     falls back to the generic ring schematic).
//
// Determinism: a tiny string hash of conceptId picks ONE of a few head/
// accent variants, so different directions read visually distinct while the
// same direction always looks identical — with zero randomness.
//
// Uses only existing exports: isMetalOnlyProductType / PRODUCT_TYPE from
// lib/studio/designDraft.js (pure helpers; the protected file is NOT edited).

import * as React from 'react';
import { PRODUCT_TYPE, isMetalOnlyProductType } from '../../../../lib/studio/designDraft';

// ---------------------------------------------------------------------------
// Deterministic seed — tiny FNV-style string hash, stable across renders.
// ---------------------------------------------------------------------------
function seedFrom(str) {
  const s = typeof str === 'string' ? str : '';
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

// Canonical shape (English, as stored on tray item axes) → head glyph kind.
function shapeGlyphKind(shape) {
  const s = typeof shape === 'string' ? shape.toLowerCase() : '';
  if (s.includes('pear')) return 'pear';
  if (s.includes('oval')) return 'oval';
  if (s.includes('cushion')) return 'cushion';
  if (s.includes('emerald') || s.includes('baguette') || s.includes('radiant') || s.includes('asscher') || s.includes('princess'))
    return 'step';
  if (s.includes('marquise')) return 'marquise';
  if (s.includes('heart')) return 'heart';
  if (s.includes('trillion')) return 'trillion';
  return 'round';
}

// Concept text hints that the direction is metal-only (generated concepts
// state this in stoneLayout, e.g. "ללא אבנים — מתכת בלבד."). Read-only hint.
function conceptReadsMetalOnly(concept) {
  const t = concept && typeof concept.stoneLayout === 'string' ? concept.stoneLayout : '';
  return t.includes('ללא אבנים');
}

// ---------------------------------------------------------------------------
// Stone head glyphs — small line-art paths centered on (cx, cy).
// ---------------------------------------------------------------------------
function StoneGlyph({ kind, cx, cy, r }) {
  switch (kind) {
    case 'oval':
      return <ellipse cx={cx} cy={cy} rx={r * 0.82} ry={r * 1.08} fill="none" stroke="currentColor" strokeWidth="1.3" />;
    case 'pear':
      return (
        <path
          d={`M ${cx} ${cy - r * 1.15} C ${cx + r} ${cy - r * 0.2}, ${cx + r * 0.85} ${cy + r}, ${cx} ${cy + r} C ${cx - r * 0.85} ${cy + r}, ${cx - r} ${cy - r * 0.2}, ${cx} ${cy - r * 1.15} Z`}
          fill="none" stroke="currentColor" strokeWidth="1.3"
        />
      );
    case 'cushion':
      return <rect x={cx - r * 0.9} y={cy - r * 0.9} width={r * 1.8} height={r * 1.8} rx={r * 0.5} fill="none" stroke="currentColor" strokeWidth="1.3" />;
    case 'step':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.3">
          <rect x={cx - r * 0.95} y={cy - r * 0.75} width={r * 1.9} height={r * 1.5} rx={1.5} />
          <rect x={cx - r * 0.6} y={cy - r * 0.45} width={r * 1.2} height={r * 0.9} strokeWidth="0.9" opacity="0.6" />
        </g>
      );
    case 'marquise':
      return (
        <path
          d={`M ${cx} ${cy - r * 1.2} C ${cx + r * 0.95} ${cy - r * 0.35}, ${cx + r * 0.95} ${cy + r * 0.35}, ${cx} ${cy + r * 1.2} C ${cx - r * 0.95} ${cy + r * 0.35}, ${cx - r * 0.95} ${cy - r * 0.35}, ${cx} ${cy - r * 1.2} Z`}
          fill="none" stroke="currentColor" strokeWidth="1.3"
        />
      );
    case 'heart':
      return (
        <path
          d={`M ${cx} ${cy + r} C ${cx - r * 1.2} ${cy - r * 0.1}, ${cx - r * 0.7} ${cy - r * 1.1}, ${cx} ${cy - r * 0.45} C ${cx + r * 0.7} ${cy - r * 1.1}, ${cx + r * 1.2} ${cy - r * 0.1}, ${cx} ${cy + r} Z`}
          fill="none" stroke="currentColor" strokeWidth="1.3"
        />
      );
    case 'trillion':
      return (
        <path
          d={`M ${cx} ${cy - r} L ${cx + r} ${cy + r * 0.75} L ${cx - r} ${cy + r * 0.75} Z`}
          fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"
        />
      );
    case 'round':
    default:
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.3">
          <circle cx={cx} cy={cy} r={r * 0.95} />
          <circle cx={cx} cy={cy} r={r * 0.5} strokeWidth="0.9" opacity="0.6" />
        </g>
      );
  }
}

// Small side/accent marks — up to 4, distinct marks (never a "quantity blob").
function SideMarks({ points, r }) {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1" opacity="0.75">
      {points.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={r} />
      ))}
    </g>
  );
}

// Prong / bezel / halo head treatment — the deterministic per-concept variant.
function HeadTreatment({ variant, cx, cy, r }) {
  if (variant === 1) {
    // Bezel — a calm outer ring.
    return <circle cx={cx} cy={cy} r={r * 1.45} fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.7" />;
  }
  if (variant === 2) {
    // Halo — dashed dot ring.
    return (
      <circle cx={cx} cy={cy} r={r * 1.6} fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 3.5" opacity="0.8" />
    );
  }
  // Prongs — 4 small ticks.
  const t = r * 1.25;
  return (
    <g stroke="currentColor" strokeWidth="1" opacity="0.8">
      <path d={`M ${cx - t} ${cy - t} l 3 3 M ${cx + t} ${cy - t} l -3 3 M ${cx - t} ${cy + t} l 3 -3 M ${cx + t} ${cy + t} l -3 -3`} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// Product silhouettes (viewBox 0 0 120 120) — schematic construction lines.
// ---------------------------------------------------------------------------
function RingSketch({ headKind, variant, metalOnly, sideCount }) {
  const cx = 60;
  const bandCy = 72;
  const bandR = 32;
  const headCy = 33;
  const headR = 11;
  const sidePts = [
    [38, 47],
    [82, 47],
    [30, 58],
    [90, 58],
  ].slice(0, sideCount);
  return (
    <g>
      {/* construction guides */}
      <path d={`M ${cx} 8 V 112`} stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 4" opacity="0.35" />
      <circle cx={cx} cy={bandCy} r={bandR} fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx={cx} cy={bandCy} r={bandR - 4} fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      {metalOnly ? (
        // Metal-only: texture ticks along the band shoulder instead of a head.
        <g stroke="currentColor" strokeWidth="1" opacity="0.7">
          <path d="M42 48 l4 4 M50 43 l4 4 M60 41 l0 5.5 M70 43 l-4 4 M78 48 l-4 4" />
        </g>
      ) : (
        <g>
          {/* shoulders rising to the head */}
          <path d={`M ${cx - 20} 47 Q ${cx - 9} 38 ${cx - headR} ${headCy + 3}`} fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.85" />
          <path d={`M ${cx + 20} 47 Q ${cx + 9} 38 ${cx + headR} ${headCy + 3}`} fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.85" />
          <HeadTreatment variant={variant} cx={cx} cy={headCy} r={headR} />
          <StoneGlyph kind={headKind} cx={cx} cy={headCy} r={headR} />
          {sideCount > 0 && <SideMarks points={sidePts} r={3.2} />}
        </g>
      )}
    </g>
  );
}

function PendantSketch({ headKind, variant, sideCount }) {
  const cx = 60;
  const headCy = 68;
  const headR = 13;
  const sidePts = [
    [60, 44],
    [49, 50],
    [71, 50],
  ].slice(0, sideCount);
  return (
    <g>
      {/* chain arc */}
      <path d="M14 22 Q 60 52 106 22" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M14 22 Q 60 44 106 22" fill="none" stroke="currentColor" strokeWidth="0.7" strokeDasharray="2 3.5" opacity="0.45" />
      {/* bail */}
      <circle cx={cx} cy={47} r={3.4} fill="none" stroke="currentColor" strokeWidth="1.1" />
      <path d={`M ${cx} 50.5 V ${headCy - headR - 4}`} stroke="currentColor" strokeWidth="1.1" />
      <HeadTreatment variant={variant} cx={cx} cy={headCy} r={headR} />
      <StoneGlyph kind={headKind} cx={cx} cy={headCy} r={headR} />
      {sideCount > 0 && <SideMarks points={sidePts} r={2.6} />}
    </g>
  );
}

function EarringsSketch({ headKind, variant }) {
  return (
    <g>
      {[38, 82].map((cx) => (
        <g key={cx}>
          <path d={`M ${cx} 30 q 8 -12 14 0`} fill="none" stroke="currentColor" strokeWidth="1.1" />
          <path d={`M ${cx + 7} 36 V 52`} stroke="currentColor" strokeWidth="1" opacity="0.85" />
          <HeadTreatment variant={variant} cx={cx + 7} cy={66} r={9.5} />
          <StoneGlyph kind={headKind} cx={cx + 7} cy={66} r={9.5} />
        </g>
      ))}
      <path d="M60 20 V 100" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 4" opacity="0.3" />
    </g>
  );
}

function BraceletSketch({ headKind, metalOnly, sideCount }) {
  const pts = [
    [36, 62],
    [84, 62],
    [24, 74],
    [96, 74],
  ].slice(0, sideCount);
  return (
    <g>
      <path d="M12 88 Q 60 40 108 88" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 88 Q 60 50 108 88" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      {metalOnly ? (
        <g stroke="currentColor" strokeWidth="1" opacity="0.7">
          <path d="M40 62 l4 4 M52 57 l4 4 M64 57 l4 4 M76 61 l4 4" />
        </g>
      ) : (
        <g>
          <StoneGlyph kind={headKind} cx={60} cy={57} r={8} />
          {sideCount > 0 && <SideMarks points={pts} r={2.6} />}
        </g>
      )}
      {/* clasp marks */}
      <path d="M10 88 l4 5 M110 88 l-4 5" stroke="currentColor" strokeWidth="1" opacity="0.7" />
    </g>
  );
}

function BandSketch() {
  return (
    <g>
      <circle cx={60} cy={62} r={33} fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx={60} cy={62} r={26} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <g stroke="currentColor" strokeWidth="1" opacity="0.7">
        <path d="M44 35 l4 5 M52 31.5 l3 5.5 M60 30 v6 M68 31.5 l-3 5.5 M76 35 l-4 5" />
      </g>
      <path d="M60 12 V 112" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 4" opacity="0.3" />
    </g>
  );
}

function silhouetteFor(productType) {
  switch (productType) {
    case PRODUCT_TYPE.PENDANT:
    case PRODUCT_TYPE.NECKLACE:
      return 'pendant';
    case PRODUCT_TYPE.EARRINGS:
      return 'earrings';
    case PRODUCT_TYPE.BRACELET:
      return 'bracelet';
    case PRODUCT_TYPE.WEDDING_BAND:
    case PRODUCT_TYPE.NO_STONES:
      return 'band';
    case PRODUCT_TYPE.RING:
    case PRODUCT_TYPE.ENGAGEMENT_RING:
    case PRODUCT_TYPE.MATCHING_PIECE:
    case PRODUCT_TYPE.OTHER:
    default:
      return 'ring';
  }
}

// ---------------------------------------------------------------------------
// ConceptSketch — the public component.
//   concept          — an existing (normalized) concept object; read-only.
//   fallbackProductType — brief.productType, used when the concept has none.
//   stoneShapes      — canonical shape strings from the CURRENT tray items
//                      (caller derives them; first = center by convention).
//   size             — rendered square size in px.
//   title            — optional accessible title / tooltip text.
// ---------------------------------------------------------------------------
export default function ConceptSketch({
  concept,
  fallbackProductType = null,
  stoneShapes = [],
  size = 96,
  title = '',
}) {
  const productType =
    concept && concept.productType ? concept.productType : fallbackProductType;
  const kind = silhouetteFor(productType);

  const shapes = Array.isArray(stoneShapes) ? stoneShapes.filter(Boolean) : [];
  const headKind = shapeGlyphKind(shapes[0]);
  // Distinct side marks, capped at 4 — a hint of composition, never a count claim.
  const sideCount = Math.min(Math.max(shapes.length - 1, 0), 4);

  const metalOnly =
    isMetalOnlyProductType(productType) || conceptReadsMetalOnly(concept);

  const variant = seedFrom(concept && concept.conceptId ? concept.conceptId : '') % 3;

  let body = null;
  if (kind === 'pendant') body = <PendantSketch headKind={headKind} variant={variant} sideCount={sideCount} />;
  else if (kind === 'earrings') body = <EarringsSketch headKind={headKind} variant={variant} />;
  else if (kind === 'bracelet') body = <BraceletSketch headKind={headKind} metalOnly={metalOnly} sideCount={sideCount} />;
  else if (kind === 'band' || metalOnly) body = <BandSketch />;
  else body = <RingSketch headKind={headKind} variant={variant} metalOnly={metalOnly} sideCount={sideCount} />;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      role="img"
      aria-label={title || undefined}
      preserveAspectRatio="xMidYMid meet"
    >
      {title ? <title>{title}</title> : null}
      {body}
    </svg>
  );
}
