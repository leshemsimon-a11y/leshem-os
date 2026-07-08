// components/studio/design/workstation/WorkstationDirections.js
//
// LESHEM.S OS — Clean 6D: Studio Workstation Prototype — Zone 5.
//
// Bottom Design Directions palette ("כיווני עיצוב") — visible and important.
// Sketch thumbnails (EXISTING deterministic ConceptSketch — reused, not
// modified), selected state, choose-direction and return-to-all-directions.
// Purely presentational: generation/selection callbacks are wired by the
// shell to the EXISTING store exports (generateConcepts →
// persistConcepts, persistSelectedConcept) — the exact contract the
// stable DesignConceptPanel uses. No new store, no new persistence key.

import * as React from 'react';
import { ws } from './wsStyle';
import { WS_HE } from './wsLabels';
import { STUDIO_5D_HE, CONCEPT_HE, STUDIO_6A_HE } from '../../../../lib/studio/labels';
import ConceptSketch from '../shell/ConceptSketch';
import { CheckIcon, RefreshIcon, AlertIcon } from '../shell/StudioIcons';

function DirectionThumb({ concept, selected, onSelect, stoneShapes, fallbackProductType }) {
  return (
    <button
      type="button"
      onClick={() => onSelect && onSelect(concept.conceptId)}
      style={{ ...styles.card, ...(selected ? styles.cardSelected : null) }}
      dir="rtl"
      title={STUDIO_6A_HE.sketch.thumbTitle(concept.conceptName)}
    >
      <span style={styles.cardSketch} aria-hidden="true">
        <ConceptSketch
          concept={concept}
          fallbackProductType={fallbackProductType}
          stoneShapes={stoneShapes}
          size={54}
        />
        {selected ? (
          <span style={styles.selBadge}>
            <CheckIcon size={11} />
          </span>
        ) : null}
      </span>
      <span style={styles.cardName}>{concept.conceptName}</span>
    </button>
  );
}

export default function WorkstationDirections({
  concepts,
  selectedId,
  stale,
  onSelect,
  onClearSelection,
  onGenerate,
  stoneShapes,
  fallbackProductType,
}) {
  const list = Array.isArray(concepts) ? concepts : [];
  const hasConcepts = list.length > 0;

  return (
    <section style={styles.strip} dir="rtl" aria-label={STUDIO_5D_HE.variantsTitle}>
      <div style={styles.head}>
        <span style={styles.title}>{STUDIO_5D_HE.variantsTitle}</span>
        {stale && hasConcepts ? (
          <span style={styles.stale} title={WS_HE.directions.staleHint}>
            <AlertIcon size={12} />
            <span>{WS_HE.directions.staleHint}</span>
          </span>
        ) : null}
        {selectedId && typeof onClearSelection === 'function' ? (
          <button type="button" onClick={onClearSelection} style={styles.backBtn}>
            {WS_HE.directions.backToAll}
          </button>
        ) : null}
      </div>

      <div style={styles.row}>
        <div style={styles.scroller}>
          {hasConcepts ? (
            list.map((c) => (
              <DirectionThumb
                key={c.conceptId}
                concept={c}
                selected={c.conceptId === selectedId}
                onSelect={onSelect}
                stoneShapes={stoneShapes}
                fallbackProductType={fallbackProductType}
              />
            ))
          ) : (
            <span style={styles.empty}>{WS_HE.directions.empty}</span>
          )}
        </div>

        <button type="button" onClick={onGenerate} style={styles.generateBtn}>
          {hasConcepts ? <RefreshIcon size={14} /> : null}
          <span>{hasConcepts ? CONCEPT_HE.regenerate : CONCEPT_HE.generate}</span>
        </button>
      </div>
    </section>
  );
}

const styles = {
  strip: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '10px 14px 12px',
    borderRadius: ws.radius.lg,
    background: ws.color.surface,
    border: `1px solid ${ws.color.border}`,
    boxShadow: ws.shadow.card,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },
  head: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minHeight: '22px',
  },
  title: {
    fontFamily: ws.font.display,
    fontSize: '12.5px',
    fontWeight: 800,
    color: ws.color.gold,
    letterSpacing: '0.3px',
    flexShrink: 0,
  },
  stale: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontFamily: ws.font.body,
    fontSize: '11px',
    fontWeight: 700,
    color: ws.color.danger,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  backBtn: {
    marginInlineStart: 'auto',
    padding: '4px 12px',
    borderRadius: '999px',
    border: `1px solid ${ws.color.borderStrong}`,
    background: 'transparent',
    color: ws.color.text,
    fontFamily: ws.font.body,
    fontSize: '11.5px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  scroller: {
    display: 'flex',
    alignItems: 'stretch',
    gap: '8px',
    overflowX: 'auto',
    minWidth: 0,
    flex: '1 1 auto',
    padding: '2px',
  },
  empty: {
    fontFamily: ws.font.body,
    fontSize: '12px',
    fontWeight: 600,
    color: ws.color.textFaint,
    padding: '10px 4px',
    whiteSpace: 'nowrap',
  },
  card: {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
    padding: '8px 10px 7px',
    borderRadius: ws.radius.md,
    border: `1px solid ${ws.color.border}`,
    background: ws.color.surfaceStrong,
    cursor: 'pointer',
    flexShrink: 0,
    minWidth: '96px',
  },
  cardSelected: {
    border: `1px solid ${ws.color.gold}`,
    background: ws.color.goldSoft,
    boxShadow: `0 0 0 1px ${ws.color.gold}`,
  },
  cardSketch: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '62px',
    height: '62px',
    borderRadius: ws.radius.sm,
    background: '#FBFAF7',
    overflow: 'hidden',
  },
  selBadge: {
    position: 'absolute',
    top: '3px',
    insetInlineStart: '3px',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: ws.color.gold,
    color: '#14161A',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardName: {
    fontFamily: ws.font.body,
    fontSize: '11px',
    fontWeight: 700,
    color: ws.color.text,
    maxWidth: '110px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  generateBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    minHeight: '40px',
    padding: '8px 18px',
    borderRadius: ws.radius.md,
    border: 'none',
    background: ws.color.primaryBg,
    color: ws.color.primaryText,
    fontFamily: ws.font.body,
    fontSize: '12.5px',
    fontWeight: 800,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
};
