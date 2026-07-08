// components/studio/design/workstation/WorkstationCanvas.js
//
// LESHEM.S OS — Clean 6D: Studio Workstation Prototype — Zone 3.
//
// Center workstation canvas with view modes owned by the shell:
//   • 'table'      — split preview: concept preview (honest schematic — NO
//                    fake photorealistic render, no render engine) side by
//                    side with a technical sketch/blueprint pane. Both panes
//                    reuse the EXISTING deterministic ConceptSketch.
//   • 'stones'     — visual board of the current Work Tray stones (roles).
//   • 'brief'      — compact read-only snapshot of the current brief state
//                    (intent summary, selected direction, output status) —
//                    derived from existing state only.
//   • 'output'     — the EXISTING DesignOutputPanel (reused, not modified)
//                    rendered on a light "document sheet" over the dark
//                    table, exactly as it mounts inside the stable Studio.
//
// Purely presentational; all data/state arrives as props from the shell.

import * as React from 'react';
import { ws } from './wsStyle';
import { WS_HE } from './wsLabels';
import { STUDIO_5D_HE, STUDIO_6A_HE, CONCEPT_HE } from '../../../../lib/studio/labels';
import ConceptSketch from '../shell/ConceptSketch';
import DesignOutputPanel from '../DesignOutputPanel';
import { buildStoneCore } from '../shell/stoneView';
import { normalizeRole } from '../../../../lib/studio/designDraft';
import { StoneFacets } from '../shell/StudioIcons';

// ---------------------------------------------------------------------------
// 'table' — split preview: concept pane + technical sketch pane.
// ---------------------------------------------------------------------------
function SplitPreview({ selected, hasConcepts, stoneShapes, fallbackProductType, narrow }) {
  return (
    <div style={{ ...styles.split, ...(narrow ? styles.splitNarrow : null) }}>
      {/* Concept preview pane — honest schematic, "בקרוב" for real renders */}
      <div style={styles.pane}>
        <div style={styles.paneHead}>
          <span style={styles.paneTitle}>{WS_HE.canvas.previewPane}</span>
          <span style={styles.soonBadge}>{STUDIO_5D_HE.canvasPreviewBadge}</span>
        </div>
        <div style={styles.paneBody}>
          {selected ? (
            <>
              <div style={styles.previewStage}>
                <ConceptSketch
                  concept={selected}
                  fallbackProductType={fallbackProductType}
                  stoneShapes={stoneShapes}
                  size={200}
                />
              </div>
              <span style={styles.previewCaption}>
                {WS_HE.canvas.selectedPrefix}: {selected.conceptName}
              </span>
              <span style={styles.previewNote}>{STUDIO_5D_HE.canvasPreviewSoon}</span>
            </>
          ) : (
            <span style={styles.paneEmpty}>
              {hasConcepts ? WS_HE.canvas.previewEmpty : WS_HE.canvas.noDirectionsYet}
            </span>
          )}
        </div>
      </div>

      {/* Technical sketch / blueprint pane */}
      <div style={{ ...styles.pane, ...styles.blueprintPane }}>
        <div style={styles.paneHead}>
          <span style={styles.paneTitle}>{WS_HE.canvas.sketchPane}</span>
          <span style={styles.schematicTag}>{STUDIO_6A_HE.sketch.schematicNote}</span>
        </div>
        <div style={{ ...styles.paneBody, ...styles.blueprintBody }}>
          {selected || hasConcepts ? (
            <div style={styles.blueprintStage}>
              <ConceptSketch
                concept={selected || null}
                fallbackProductType={fallbackProductType}
                stoneShapes={stoneShapes}
                size={200}
              />
            </div>
          ) : (
            <span style={styles.paneEmpty}>{WS_HE.canvas.noDirectionsYet}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 'stones' — visual board of the current composition.
// ---------------------------------------------------------------------------
function StonesBoard({ trayItems, demoStoneFor }) {
  const items = Array.isArray(trayItems) ? trayItems : [];
  return (
    <div style={styles.board}>
      <span style={styles.boardTitle}>{WS_HE.canvas.stonesBoardTitle}</span>
      {items.length === 0 ? (
        <span style={styles.paneEmpty}>{WS_HE.canvas.stonesBoardEmpty}</span>
      ) : (
        <div style={styles.boardGrid}>
          {items.map((item) => {
            const core = buildStoneCore(item, demoStoneFor ? demoStoneFor(item) : null);
            if (!core) return null;
            const roleHeLabel =
              CONCEPT_HE.roleLabels[normalizeRole(item.role)] ||
              CONCEPT_HE.roleLabels.unassigned;
            return (
              <div key={item.id} style={styles.stoneCard} dir="rtl">
                <span style={styles.stoneMedia} aria-hidden="true">
                  {core.image ? (
                    <img src={core.image} alt="" style={styles.stoneImg} />
                  ) : (
                    <span style={styles.stoneGlyph}>
                      <StoneFacets size={38} stroke={1.2} />
                    </span>
                  )}
                </span>
                <span style={styles.stoneTitle}>{core.title}</span>
                <span style={styles.stoneRole}>{roleHeLabel}</span>
                <span style={styles.stoneRows}>
                  {core.rows.slice(0, 3).map((r) => (
                    <span key={r.key} style={styles.stoneRow}>
                      {r.label}: {r.value}
                    </span>
                  ))}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 'brief' — compact read-only snapshot derived from existing state.
// ---------------------------------------------------------------------------
function BriefSummary({ intentSummary, selected, output, outputStale, onOpenOutput }) {
  const rows = [
    intentSummary
      ? { key: 'intent', label: CONCEPT_HE.directionTitle, value: intentSummary }
      : null,
    selected
      ? { key: 'selected', label: WS_HE.process.selectedDirection, value: selected.conceptName }
      : null,
    output
      ? {
          key: 'output',
          label: WS_HE.rail.output,
          value: outputStale ? STUDIO_5D_HE.statusOutputStale : STUDIO_5D_HE.statusOutputReady,
        }
      : null,
  ].filter(Boolean);

  return (
    <div style={styles.board}>
      <span style={styles.boardTitle}>{WS_HE.canvas.briefSummaryTitle}</span>
      {rows.length === 0 ? (
        <span style={styles.paneEmpty}>{WS_HE.canvas.briefSummaryEmpty}</span>
      ) : (
        <div style={styles.briefRows}>
          {rows.map((r) => (
            <div key={r.key} style={styles.briefRow} dir="rtl">
              <span style={styles.briefLabel}>{r.label}</span>
              <span style={styles.briefValue}>{r.value}</span>
            </div>
          ))}
        </div>
      )}
      <button type="button" onClick={onOpenOutput} style={styles.briefOpenBtn}>
        {WS_HE.canvas.briefOpenOutput}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Canvas root.
// ---------------------------------------------------------------------------
export default function WorkstationCanvas({
  view,
  narrow,
  selected,
  hasConcepts,
  stoneShapes,
  fallbackProductType,
  trayItems,
  demoStoneFor,
  intentSummary,
  output,
  outputStale,
  onOpenOutput,
  onToast,
}) {
  let body = null;
  if (view === 'stones') {
    body = <StonesBoard trayItems={trayItems} demoStoneFor={demoStoneFor} />;
  } else if (view === 'brief') {
    body = (
      <BriefSummary
        intentSummary={intentSummary}
        selected={selected}
        output={output}
        outputStale={outputStale}
        onOpenOutput={onOpenOutput}
      />
    );
  } else if (view === 'output') {
    // Reuse the EXISTING output/render-brief panel unchanged, presented as a
    // light document sheet on the dark workstation table.
    body = (
      <div style={styles.sheetWrap}>
        <span style={styles.sheetTitle}>{WS_HE.canvas.outputSheetTitle}</span>
        <div style={styles.sheet} dir="rtl">
          <DesignOutputPanel onToast={onToast} suppressStaleBanner />
        </div>
      </div>
    );
  } else {
    body = (
      <SplitPreview
        selected={selected}
        hasConcepts={hasConcepts}
        stoneShapes={stoneShapes}
        fallbackProductType={fallbackProductType}
        narrow={narrow}
      />
    );
  }

  return <div style={styles.canvas}>{body}</div>;
}

const styles = {
  canvas: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: 0,
    flex: '1 1 auto',
    borderRadius: ws.radius.lg,
    background: ws.color.surface,
    border: `1px solid ${ws.color.border}`,
    boxShadow: ws.shadow.card,
    overflow: 'auto',
    padding: '14px',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },

  // Split preview -----------------------------------------------------------
  split: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    gap: '12px',
    flex: '1 1 auto',
    minHeight: 0,
  },
  splitNarrow: {
    gridTemplateColumns: '1fr',
    gridAutoRows: 'min-content',
  },
  pane: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: '280px',
    borderRadius: ws.radius.md,
    background: 'rgba(0,0,0,0.28)',
    border: `1px solid ${ws.color.border}`,
    overflow: 'hidden',
  },
  blueprintPane: {},
  paneHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    padding: '9px 12px',
    borderBottom: `1px solid ${ws.color.border}`,
    flexShrink: 0,
  },
  paneTitle: {
    fontFamily: ws.font.display,
    fontSize: '11.5px',
    fontWeight: 800,
    letterSpacing: '0.3px',
    color: ws.color.gold,
  },
  soonBadge: {
    padding: '2px 9px',
    borderRadius: '999px',
    border: `1px solid ${ws.color.borderStrong}`,
    color: ws.color.textMuted,
    fontFamily: ws.font.body,
    fontSize: '10px',
    fontWeight: 700,
  },
  schematicTag: {
    fontFamily: ws.font.body,
    fontSize: '10px',
    fontWeight: 700,
    color: ws.color.textFaint,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  paneBody: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '9px',
    flex: '1 1 auto',
    minHeight: 0,
    padding: '16px',
  },
  previewStage: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px',
    borderRadius: '50%',
    background:
      'radial-gradient(closest-side, #FBFAF7 72%, rgba(251,250,247,0.0) 100%)',
  },
  previewCaption: {
    fontFamily: ws.font.body,
    fontSize: '12.5px',
    fontWeight: 800,
    color: ws.color.text,
    textAlign: 'center',
  },
  previewNote: {
    fontFamily: ws.font.body,
    fontSize: '11px',
    fontWeight: 600,
    color: ws.color.textFaint,
    textAlign: 'center',
  },
  paneEmpty: {
    fontFamily: ws.font.body,
    fontSize: '12px',
    fontWeight: 600,
    color: ws.color.textFaint,
    textAlign: 'center',
    lineHeight: 1.6,
  },
  blueprintBody: {
    backgroundImage:
      'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
    backgroundSize: '22px 22px',
  },
  blueprintStage: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px',
    borderRadius: ws.radius.md,
    background: '#FBFAF7',
    boxShadow: ws.shadow.lift,
    transform: 'rotate(-1.2deg)', // studio table paper illusion — subtle
  },

  // Stones board -------------------------------------------------------------
  board: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flex: '1 1 auto',
    minHeight: 0,
  },
  boardTitle: {
    fontFamily: ws.font.display,
    fontSize: '13px',
    fontWeight: 800,
    color: ws.color.text,
  },
  boardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
    gap: '10px',
    overflowY: 'auto',
    minHeight: 0,
    padding: '2px',
  },
  stoneCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '10px',
    borderRadius: ws.radius.md,
    background: ws.color.surfaceStrong,
    border: `1px solid ${ws.color.border}`,
  },
  stoneMedia: {
    width: '100%',
    height: '92px',
    borderRadius: ws.radius.sm,
    overflow: 'hidden',
    background: 'rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stoneImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  stoneGlyph: { color: ws.color.textFaint, display: 'inline-flex' },
  stoneTitle: {
    fontFamily: ws.font.body,
    fontSize: '12.5px',
    fontWeight: 800,
    color: ws.color.text,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  stoneRole: {
    fontFamily: ws.font.body,
    fontSize: '10.5px',
    fontWeight: 700,
    color: ws.color.gold,
  },
  stoneRows: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  stoneRow: {
    fontFamily: ws.font.body,
    fontSize: '11px',
    fontWeight: 600,
    color: ws.color.textMuted,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  // Brief summary --------------------------------------------------------------
  briefRows: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxWidth: '560px',
  },
  briefRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '10px',
    padding: '10px 13px',
    borderRadius: ws.radius.md,
    background: ws.color.surfaceStrong,
    border: `1px solid ${ws.color.border}`,
  },
  briefLabel: {
    fontFamily: ws.font.body,
    fontSize: '11px',
    fontWeight: 800,
    color: ws.color.gold,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  briefValue: {
    fontFamily: ws.font.body,
    fontSize: '12.5px',
    fontWeight: 600,
    color: ws.color.text,
    minWidth: 0,
  },
  briefOpenBtn: {
    alignSelf: 'flex-start',
    minHeight: '36px',
    padding: '7px 16px',
    borderRadius: ws.radius.md,
    border: 'none',
    background: ws.color.primaryBg,
    color: ws.color.primaryText,
    fontFamily: ws.font.body,
    fontSize: '12px',
    fontWeight: 800,
    cursor: 'pointer',
  },

  // Output sheet ----------------------------------------------------------------
  sheetWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    minHeight: 0,
  },
  sheetTitle: {
    fontFamily: ws.font.display,
    fontSize: '13px',
    fontWeight: 800,
    color: ws.color.text,
  },
  sheet: {
    borderRadius: ws.radius.md,
    background: ws.color.sheet,
    padding: '14px',
    boxShadow: ws.shadow.lift,
    overflow: 'auto',
    minHeight: 0,
  },
};
