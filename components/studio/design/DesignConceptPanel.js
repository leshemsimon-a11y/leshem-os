// components/studio/design/DesignConceptPanel.js
//
// LESHEM.S OS — Design Core Panel (Clean 5A)
//
// The MAIN working section of the Design Studio. It turns the current inputs
// (Work Tray items + roles + brief) into clear jewelry design directions:
//
//   Part 1  "מה מעצבים?"      — product type selection (stones NOT required)
//   Part 2  "עם מה עובדים?"    — input summary of tray/inventory/asset items
//   Part 3  "כיוון עיצוב"      — a short, practical design-direction brief
//   Part 4  "צור כיווני עיצוב" — generate 3 local concepts (no AI/network)
//   Part 5  select one concept as the chosen direction (persists in the brief,
//           which already flows into Active Work / Design Projects)
//
// Local only: reads/writes the design brief store (localStorage) and reads the
// live Work Tray. NO external AI, NO image/render generation, NO pricing, NO
// PDF, NO Airtable, NO new packages, no commerce language.

import * as React from 'react';
import { tokens } from '../shared/tokens';
import { CONCEPT_HE, BRIEF_HE, FLOW_HE } from '../../../lib/studio/labels';
import {
  PRODUCT_TYPE_VALUES,
  STONE_USAGE_VALUES,
  STYLE_PREFERENCE,
  STYLE_PREFERENCE_VALUES,
  METAL_PREFERENCE_VALUES,
  DESIGN_ROLE,
  trayItemTitle,
  conceptsAreStale,
  computeInputSignature,
} from '../../../lib/studio/designDraft';
// Studio Layout Reset (Clean 5D-R4) — narrow, approved exception. Scoped,
// Design-Studio-only visual constants (NOT the shared components/studio/
// shared/tokens.js, which is imported by ~60 files across Inventory/Tray/
// etc.). Used ONLY for the two additive pieces below: the 3-card quick
// style pick and the concept carousel row. Every other style in this file
// keeps using the original `tokens` import, untouched.
import { reset } from './shell/studioResetStyle';
import { createUseWorkTray } from '../../../lib/studio/workTray';
import {
  createUseDesignBrief,
  setConcepts as persistConcepts,
  selectConcept as persistSelectedConcept,
  updateConceptNotes as persistConceptNotes,
  removeConcept as persistRemoveConcept,
  replaceConcept as persistReplaceConcept,
} from '../../../lib/studio/designBriefStore';
import { generateConcepts, describeInputs } from '../../../lib/studio/designConcepts';
import { getActiveWorkId } from '../../../lib/studio/activeWorkStore';
import { updateProject } from '../../../lib/studio/designProjects';
import { buildDesignSnapshot } from '../../../lib/studio/designDraft';

const useWorkTray = createUseWorkTray(React);
const useDesignBrief = createUseDesignBrief(React);

// --- small building blocks -------------------------------------------------

function ChipSelect({ label, options, labelMap, value, onChange }) {
  return (
    <div style={styles.field} dir="rtl">
      <span style={styles.fieldLabel}>{label}</span>
      <div style={styles.chips}>
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(selected ? null : opt)}
              style={{ ...styles.chip, ...(selected ? styles.chipSelected : null) }}
              aria-pressed={selected}
            >
              {selected && (
                <span style={styles.tick} aria-hidden="true">
                  ✓
                </span>
              )}
              {labelMap[opt] || opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Clean 5D-R4 — Studio Layout Reset (narrow, approved exception).
//
// A 3-card quick style pick — Classic / Modern / Statement — shown above the
// existing (now-collapsed-by-default) direction form. It reads and writes
// the SAME `brief.styleDirection` field as the original 5-value ChipSelect
// further down (still present, unchanged, just nested under the new
// "advanced details" disclosure): both controls are two views onto one
// field, no new business vocabulary, nothing removed. Purely additive,
// visual/layout only — same onChange contract as ChipSelect's toggle
// behavior (selecting the active card clears it back to null).
const QUICK_STYLE_CARDS = [
  {
    value: STYLE_PREFERENCE.CLASSIC,
    Icon: (p) => (
      <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="7" />
        <circle cx="12" cy="12" r="2.4" />
      </svg>
    ),
  },
  {
    value: STYLE_PREFERENCE.MODERN,
    Icon: (p) => (
      <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
        <rect x="6" y="6" width="12" height="12" />
      </svg>
    ),
  },
  {
    value: STYLE_PREFERENCE.STATEMENT,
    Icon: (p) => (
      <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
        <path d="M12 3l2.6 6.2L21 12l-6.4 2.8L12 21l-2.6-6.2L3 12l6.4-2.8L12 3z" />
      </svg>
    ),
  },
];

function QuickStyleCards({ value, onChange }) {
  return (
    <div style={quickStyleStyles.wrap} dir="rtl">
      <span style={quickStyleStyles.label}>{CONCEPT_HE.quickStyleLabel}</span>
      <div style={quickStyleStyles.row}>
        {QUICK_STYLE_CARDS.map(({ value: v, Icon }) => {
          const selected = value === v;
          const label = BRIEF_HE.style[v] || v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(selected ? null : v)}
              style={{ ...quickStyleStyles.card, ...(selected ? quickStyleStyles.cardSelected : null) }}
              aria-pressed={selected}
              title={label}
            >
              {selected && (
                <span style={quickStyleStyles.checkBadge} aria-hidden="true">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12.5l5 5L20 6" />
                  </svg>
                </span>
              )}
              <span style={quickStyleStyles.cardIcon} aria-hidden="true">
                <Icon width={20} height={20} />
              </span>
              <span style={quickStyleStyles.cardLabel}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const quickStyleStyles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: {
    fontFamily: reset.font.body,
    fontSize: '10.5px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: reset.color.textFaint,
  },
  row: { display: 'flex', gap: '8px' },
  card: {
    position: 'relative',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    minHeight: '84px',
    padding: '14px 10px',
    background: reset.color.panel,
    border: `1px solid ${reset.color.border}`,
    borderRadius: reset.radius.md,
    cursor: 'pointer',
  },
  cardSelected: {
    border: `1.5px solid ${reset.color.text}`,
    background: reset.color.page,
  },
  checkBadge: {
    position: 'absolute',
    top: '6px',
    insetInlineEnd: '6px',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: reset.color.text,
    color: reset.color.panel,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '34px',
    height: '34px',
    borderRadius: reset.radius.sm,
    color: reset.color.textMuted,
    background: reset.color.page,
  },
  cardLabel: {
    fontFamily: reset.font.body,
    fontSize: '12.5px',
    fontWeight: 700,
    color: reset.color.text,
  },
};

// Clean 5B.3 — a quiet collapsible disclosure (iceberg). Secondary inputs and
// detail live here, closed by default, so the surface stays calm. All children
// remain mounted only while open, but the underlying brief fields are written
// to the same store, so nothing is lost when collapsed.
function Disclosure({ title, defaultOpen = false, children }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div style={styles.disclosure} dir="rtl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={styles.disclosureToggle}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span aria-hidden="true">{open ? '▴' : '▾'}</span>
      </button>
      {open && <div style={styles.disclosureBody}>{children}</div>}
    </div>
  );
}

// Input summary row — one tray item.
function InputItemRow({ item }) {
  const s = (item && item.snapshot) || {};
  const title = trayItemTitle(item);
  const role = item && item.role ? item.role : DESIGN_ROLE.UNASSIGNED;
  const roleHe = CONCEPT_HE.roleLabels[role] || CONCEPT_HE.roleLabels.unassigned;
  const img = s.primaryImage || null;
  const sub = [s.sku, s.shapeHe, s.caratWeight != null ? `${s.caratWeight} ct` : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <div style={styles.inputRow} dir="rtl">
      <div style={styles.thumb} aria-hidden="true">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" style={styles.thumbImg} />
        ) : (
          <span style={styles.thumbMark}>✦</span>
        )}
      </div>
      <div style={styles.inputText}>
        <span style={styles.inputTitle}>{title}</span>
        {sub ? <span style={styles.inputSub}>{sub}</span> : null}
        <span style={styles.inputSource}>{CONCEPT_HE.sourceInternal}</span>
      </div>
      <span style={styles.roleTag}>{roleHe}</span>
    </div>
  );
}

// One generated concept card. Clean 5B.3: technical detail is tucked under a
// "פרטי הכיוון" disclosure (iceberg — hidden until asked for); each card gains
// an in-place refresh and an inline (non-modal) remove confirmation.
function ConceptCard({ concept, chosen, onChoose, onNotes, onRemove, onRefresh }) {
  const F = CONCEPT_HE.field;
  const [showDetails, setShowDetails] = React.useState(false);
  const [confirmingRemove, setConfirmingRemove] = React.useState(false);

  const rows = [
    { k: 'metalSuggestion', v: concept.metalSuggestion },
    { k: 'stoneLayout', v: concept.stoneLayout },
    { k: 'designStructure', v: concept.designStructure },
    { k: 'recommendedUse', v: concept.recommendedUse },
  ].filter((r) => r.v && r.v.trim());

  return (
    <div
      style={{ ...styles.conceptCard, ...(chosen ? styles.conceptCardChosen : null) }}
      dir="rtl"
    >
      <div style={styles.conceptHead}>
        <span style={styles.conceptName} title={concept.shortDescription || undefined}>
          {concept.conceptName}
        </span>
        {chosen && (
          <span style={styles.chosenPill}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginInlineEnd: '3px', verticalAlign: '-1px' }}>
              <path d="M4 12.5l5 5L20 6" />
            </svg>
            {CONCEPT_HE.chosenBadge}
          </span>
        )}
      </div>

      {/* Clean 5D-R4 — Studio Layout Reset (approved exception): shortDescription
          moved from an always-visible paragraph into this SAME existing
          details toggle (visual-first card, no long text by default). The
          text itself is unchanged and still reachable via the toggle below
          and via the title tooltip above — nothing removed. */}
      {(rows.length > 0 || concept.shortDescription) && (
        <div style={styles.detailsWrap}>
          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            style={styles.detailsToggle}
            aria-expanded={showDetails}
          >
            {CONCEPT_HE.conceptDetails} {showDetails ? '▴' : '▾'}
          </button>
          {showDetails && (
            <>
              {concept.shortDescription ? (
                <p style={styles.conceptDesc}>{concept.shortDescription}</p>
              ) : null}
              {rows.length > 0 && (
                <dl style={styles.conceptRows}>
                  {rows.map((r) => (
                    <div key={r.k} style={styles.conceptRow}>
                      <dt style={styles.conceptRowLabel}>{F[r.k]}</dt>
                      <dd style={styles.conceptRowValue}>{r.v}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <div style={styles.placeholderRow}>
                <span style={styles.placeholderTag}>{F.productionNotes}: בקרוב</span>
                <span style={styles.placeholderTag}>{F.renderBriefText}: בקרוב</span>
              </div>
            </>
          )}
        </div>
      )}

      {chosen && (
        <div style={styles.field}>
          <span style={styles.fieldLabel}>{F.conceptNotes}</span>
          <textarea
            value={concept.conceptNotes || ''}
            onChange={(e) => onNotes(concept.conceptId, e.target.value)}
            placeholder={CONCEPT_HE.conceptNotesPlaceholder}
            style={styles.textarea}
            rows={2}
            dir="rtl"
          />
        </div>
      )}

      <div style={styles.conceptActions}>
        <button
          type="button"
          onClick={() => onChoose(concept.conceptId)}
          style={{ ...styles.chooseBtn, ...(chosen ? styles.chooseBtnChosen : null) }}
        >
          {chosen ? CONCEPT_HE.chosen : CONCEPT_HE.selectAsChosen}
        </button>

        {typeof onRefresh === 'function' && (
          <button
            type="button"
            onClick={() => onRefresh(concept.conceptId)}
            style={styles.cardGhostBtn}
          >
            {CONCEPT_HE.refreshConcept}
          </button>
        )}

        {/* Inline, calm remove — no modal. A small confirm state prevents
            accidental deletion without feeling stressful. */}
        {typeof onRemove === 'function' &&
          (confirmingRemove ? (
            <span style={styles.confirmInline}>
              <span style={styles.confirmText}>{CONCEPT_HE.removeConfirmQuestion}</span>
              <button
                type="button"
                onClick={() => {
                  setConfirmingRemove(false);
                  onRemove(concept.conceptId);
                }}
                style={styles.confirmYes}
              >
                {CONCEPT_HE.removeConfirmYes}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingRemove(false)}
                style={styles.confirmNo}
              >
                {CONCEPT_HE.removeConfirmNo}
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingRemove(true)}
              style={styles.cardRemoveBtn}
            >
              {CONCEPT_HE.removeConcept}
            </button>
          ))}
      </div>
    </div>
  );
}

// --- main panel ------------------------------------------------------------

export default function DesignConceptPanel({ view = 'all', onToast, suppressStaleBanner = false } = {}) {
  const tray = useWorkTray();
  const briefStore = useDesignBrief();

  if (!tray.hydrated || !briefStore.hydrated) {
    return <div style={styles.loading}>טוען את ליבת העיצוב…</div>;
  }

  const brief = briefStore.brief;
  const concepts = Array.isArray(brief.concepts) ? brief.concepts : [];
  const selectedId = brief.selectedConceptId || null;
  const inputs = describeInputs(tray.items, brief);
  const stale = conceptsAreStale(brief, tray.items);
  const toast = (m) => {
    if (typeof onToast === 'function') onToast(m);
  };

  const syncActiveWork = (nextBrief) => {
    try {
      const activeProjectId = getActiveWorkId();
      if (!activeProjectId) return;
      updateProject(activeProjectId, {
        trayItems: tray.items || [],
        brief: nextBrief,
        snapshot: buildDesignSnapshot(tray.items || [], nextBrief),
      });
    } catch (e) {
      console.warn('[designConcepts] active work sync skipped.', e);
    }
  };

  const handleGenerate = () => {
    const next = generateConcepts(tray.items, brief);
    // Clean 5B.1 — stamp the input signature so staleness can be detected.
    const sig = computeInputSignature(brief, tray.items);
    const nextBrief = persistConcepts(next, sig);
    syncActiveWork(nextBrief);
    toast(FLOW_HE.toast.conceptsCreated);
  };

  const handleChoose = (conceptId) => {
    const nextId = conceptId === selectedId ? null : conceptId;
    const nextBrief = persistSelectedConcept(nextId);
    syncActiveWork(nextBrief);
    toast(nextId ? FLOW_HE.toast.conceptChosen : FLOW_HE.toast.conceptCanceled);
  };

  const handleCancelSelected = () => {
    const nextBrief = persistSelectedConcept(null);
    syncActiveWork(nextBrief);
    toast(FLOW_HE.toast.conceptCanceled);
  };

  const handleNotes = (conceptId, notes) => {
    const nextBrief = persistConceptNotes(conceptId, notes);
    syncActiveWork(nextBrief);
  };

  // Clean 5B.3 — remove ONE direction (called after the card's inline confirm).
  const handleRemoveConcept = (conceptId) => {
    const nextBrief = persistRemoveConcept(conceptId);
    syncActiveWork(nextBrief);
    toast(CONCEPT_HE.toastConceptRemoved);
  };

  // Clean 5B.3 — refresh ONLY this one direction, in place, leaving the others
  // unchanged. Uses the existing local generator (no new module): regenerate
  // the set and pick a candidate whose name differs from the directions already
  // on the board; if none differs, fall back to a fresh-id copy of the matching
  // candidate so it is still an honest in-place refresh. conceptsSignature is
  // preserved by replaceConcept, so stale state is unaffected.
  const handleRefreshConcept = (conceptId) => {
    const existing = Array.isArray(brief.concepts) ? brief.concepts : [];
    const otherNames = existing
      .filter((c) => c && c.conceptId !== conceptId)
      .map((c) => c.conceptName);
    const candidates = generateConcepts(tray.items, brief) || [];
    let replacement =
      candidates.find((c) => c && !otherNames.includes(c.conceptName)) || candidates[0];
    if (!replacement) return; // nothing to refresh with — leave as-is
    // Ensure a distinct identity so React + persistence treat it as refreshed.
    replacement = { ...replacement };
    const nextBrief = persistReplaceConcept(conceptId, replacement);
    syncActiveWork(nextBrief);
    toast(CONCEPT_HE.toastConceptRefreshed);
  };

  // Status copy.
  const statusCopy = selectedId
    ? { t: CONCEPT_HE.status.chosenTitle, b: CONCEPT_HE.status.chosenBody, ready: true }
    : concepts.length
    ? { t: CONCEPT_HE.status.generatedTitle, b: CONCEPT_HE.status.generatedBody, ready: false }
    : { t: CONCEPT_HE.status.emptyTitle, b: CONCEPT_HE.status.emptyBody, ready: false };

  // ----- Stage 1: direction (product/style/metal/usage/inputs/brief) -----
  // Clean 5D-R4 — Studio Layout Reset (narrow, approved exception): a 3-card
  // quick style pick is now always visible above the form, and the full
  // existing form (Parts 1-3 below) is wrapped in ONE outer "advanced
  // details" disclosure, collapsed by default. No field, handler, or value
  // was removed — everything below is unchanged, just nested.
  const directionView = (
    <>
      <QuickStyleCards
        value={brief.styleDirection}
        onChange={(v) => briefStore.update({ styleDirection: v })}
      />

      <Disclosure title={CONCEPT_HE.advancedDirectionDetails}>
      {/* Part 1 — מה מעצבים? */}
      <ChipSelect
        label={CONCEPT_HE.productTypeLabel}
        options={PRODUCT_TYPE_VALUES}
        labelMap={CONCEPT_HE.productType}
        value={brief.productType}
        onChange={(v) => briefStore.update({ productType: v })}
      />

      {/* Part 2 — עם מה עובדים? (iceberg: collapsed by default) */}
      <Disclosure title={CONCEPT_HE.workingWith}>
        {tray.items.length === 0 ? (
          <p style={styles.inputsEmpty}>{CONCEPT_HE.inputsEmpty}</p>
        ) : (
          <>
            <div style={styles.inputList}>
              {tray.items.map((it) => (
                <InputItemRow key={it.id} item={it} />
              ))}
            </div>
            <p style={styles.inputsHint}>{CONCEPT_HE.inputsHint}</p>
          </>
        )}
      </Disclosure>

      {/* Part 3 — כיוון עיצוב. Core controls stay on the surface; secondary
          fields drop into a quiet "פרטים נוספים" disclosure (iceberg). */}
      <div style={styles.section}>
        <span style={styles.sectionTitle}>{CONCEPT_HE.directionTitle}</span>

        <div style={styles.field}>
          <span style={styles.fieldLabel}>{CONCEPT_HE.designGoalLabel}</span>
          <textarea
            value={brief.designGoal}
            onChange={(e) => briefStore.update({ designGoal: e.target.value })}
            placeholder={CONCEPT_HE.designGoalPlaceholder}
            style={styles.textarea}
            rows={2}
            dir="rtl"
          />
        </div>

        <ChipSelect
          label={CONCEPT_HE.styleDirectionLabel}
          options={STYLE_PREFERENCE_VALUES}
          labelMap={BRIEF_HE.style}
          value={brief.styleDirection}
          onChange={(v) => briefStore.update({ styleDirection: v })}
        />

        <ChipSelect
          label={CONCEPT_HE.metalLabel}
          options={METAL_PREFERENCE_VALUES}
          labelMap={BRIEF_HE.metal}
          value={brief.metalPreference}
          onChange={(v) => briefStore.update({ metalPreference: v })}
        />

        <ChipSelect
          label={CONCEPT_HE.stoneUsageLabel}
          options={STONE_USAGE_VALUES}
          labelMap={CONCEPT_HE.stoneUsage}
          value={brief.stoneUsage}
          onChange={(v) => briefStore.update({ stoneUsage: v })}
        />

        <Disclosure title={CONCEPT_HE.moreDirectionFields}>
          <div style={styles.field}>
            <span style={styles.fieldLabel}>{CONCEPT_HE.targetClientLabel}</span>
            <input
              value={brief.targetClient}
              onChange={(e) => briefStore.update({ targetClient: e.target.value })}
              placeholder={CONCEPT_HE.targetClientPlaceholder}
              style={styles.input}
              dir="rtl"
            />
          </div>

          <div style={styles.field}>
            <span style={styles.fieldLabel}>{CONCEPT_HE.budgetLevelLabel}</span>
            <input
              value={brief.budgetLevel}
              onChange={(e) => briefStore.update({ budgetLevel: e.target.value })}
              placeholder={CONCEPT_HE.budgetLevelPlaceholder}
              style={styles.input}
              dir="rtl"
            />
          </div>

          <div style={styles.field}>
            <span style={styles.fieldLabel}>{CONCEPT_HE.notesLabel}</span>
            <textarea
              value={brief.notes}
              onChange={(e) => briefStore.update({ notes: e.target.value })}
              placeholder={CONCEPT_HE.notesPlaceholder}
              style={styles.textarea}
              rows={2}
              dir="rtl"
            />
          </div>
        </Disclosure>
      </div>
      </Disclosure>
    </>
  );

  // ----- Stage 2: concepts (generate + cards + reset/replace + stale) -----
  const conceptsView = (
    <>
      {/* Stale banner — inputs changed since concepts were generated.
          Clean 5B.2: can be suppressed when the workspace shows an
          always-visible flow-level stale banner (avoids duplicate banners). */}
      {stale && !suppressStaleBanner && (
        <div style={styles.staleBanner} dir="rtl">
          <div style={styles.staleText}>
            <span style={styles.staleTitle}>{FLOW_HE.conceptsStaleTitle}</span>
            <span style={styles.staleBody}>{FLOW_HE.conceptsStaleBody}</span>
          </div>
          <button type="button" onClick={handleGenerate} style={styles.staleBtn}>
            {FLOW_HE.updateConcepts}
          </button>
        </div>
      )}

      {/* Generate / regenerate */}
      <div style={styles.generateRow}>
        <button type="button" onClick={handleGenerate} style={styles.generateBtn}>
          {concepts.length ? FLOW_HE.newConcepts : CONCEPT_HE.generate}
        </button>
        {selectedId && (
          <button type="button" onClick={handleCancelSelected} style={styles.ghostBtn}>
            {FLOW_HE.cancelSelected}
          </button>
        )}
      </div>

      {/* status strip */}
      <div
        style={{
          ...styles.statusStrip,
          ...(statusCopy.ready ? styles.statusReady : styles.statusPending),
        }}
      >
        <span
          style={{
            ...styles.statusDot,
            background: statusCopy.ready ? tokens.color.gold : tokens.color.goldSoft,
          }}
          aria-hidden="true"
        />
        <div style={styles.statusText}>
          <span style={styles.statusTitle}>{statusCopy.t}</span>
          <span style={styles.statusBody}>{statusCopy.b}</span>
        </div>
      </div>

      {/* concept cards */}
      {concepts.length > 0 && (
        <div style={styles.section}>
          <p style={styles.inputsHint}>{CONCEPT_HE.generatedHint}</p>
          <div style={styles.conceptGrid}>
            {concepts.map((c) => (
              <ConceptCard
                key={c.conceptId}
                concept={c}
                chosen={c.conceptId === selectedId}
                onChoose={handleChoose}
                onNotes={handleNotes}
                onRemove={handleRemoveConcept}
                onRefresh={handleRefreshConcept}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div style={styles.wrap} dir="rtl">
      {view !== 'concepts' && <p style={styles.localNote}>{CONCEPT_HE.localNote}</p>}
      {(view === 'all' || view === 'direction') && directionView}
      {(view === 'all' || view === 'concepts') && conceptsView}
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '20px' },
  loading: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    color: tokens.color.inkFaint,
    padding: '12px 0',
  },
  localNote: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.goldFaint}`,
    borderRadius: tokens.radius.sm,
    padding: '8px 12px',
    margin: 0,
  },
  section: { display: 'flex', flexDirection: 'column', gap: '12px' },
  staleBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '10px',
    padding: '12px 14px',
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.gold}`,
    borderRadius: tokens.radius.md,
  },
  staleText: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  staleTitle: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  staleBody: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    lineHeight: 1.55,
    color: tokens.color.inkSoft,
  },
  staleBtn: {
    minHeight: '44px',
    padding: '10px 18px',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.gold}`,
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  ghostBtn: {
    minHeight: '52px',
    padding: '12px 22px',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.color.inkSoft,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
  },
  sectionTitle: {
    fontFamily: tokens.font.display,
    fontWeight: 700,
    fontSize: '18px',
    color: tokens.color.charcoal,
  },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  fieldLabel: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    color: tokens.color.inkSoft,
  },
  chips: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    minHeight: '44px',
    padding: '10px 16px',
    fontFamily: tokens.font.body,
    fontSize: '15px',
    fontWeight: 600,
    color: tokens.color.charcoal,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: '999px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background 140ms ease, border-color 140ms ease',
  },
  chipSelected: {
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.gold}`,
  },
  tick: { fontSize: '13px', lineHeight: 1, color: tokens.color.gold },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: tokens.font.body,
    fontSize: '15px',
    color: tokens.color.ink,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    padding: '12px 14px',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: tokens.font.body,
    fontSize: '15px',
    lineHeight: 1.6,
    color: tokens.color.ink,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    padding: '12px 14px',
    resize: 'vertical',
    outline: 'none',
  },
  // input summary
  inputsEmpty: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
    background: tokens.color.pearl,
    border: `1px dashed ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    padding: '12px 14px',
    margin: 0,
  },
  inputsHint: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    color: tokens.color.inkFaint,
    margin: 0,
  },
  inputList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
  },
  thumb: {
    width: '44px',
    height: '44px',
    borderRadius: tokens.radius.sm,
    background: tokens.color.pearl,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  thumbMark: { fontSize: '18px', color: tokens.color.goldSoft },
  inputText: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 },
  inputTitle: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.color.charcoal,
  },
  inputSub: { fontFamily: tokens.font.body, fontSize: '12px', color: tokens.color.inkSoft },
  inputSource: { fontFamily: tokens.font.body, fontSize: '11px', color: tokens.color.inkFaint },
  roleTag: {
    fontFamily: tokens.font.body,
    fontSize: '12px',
    fontWeight: 600,
    color: tokens.color.charcoal,
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.goldSoft}`,
    borderRadius: '999px',
    padding: '4px 12px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // generate
  generateRow: { display: 'flex', flexWrap: 'wrap', gap: '10px', paddingTop: '2px' },
  generateBtn: {
    minHeight: '52px',
    padding: '14px 28px',
    fontFamily: tokens.font.body,
    fontSize: '16px',
    fontWeight: 700,
    color: tokens.color.ivory,
    background: tokens.color.charcoal,
    border: 'none',
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
    boxShadow: tokens.shadow.soft,
  },
  // status
  statusStrip: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: tokens.radius.md,
  },
  statusPending: { background: tokens.color.pearl, border: `1px solid ${tokens.color.goldFaint}` },
  statusReady: { background: tokens.color.sageFaint, border: `1px solid ${tokens.color.sage}` },
  statusDot: { width: '10px', height: '10px', borderRadius: '50%', marginTop: '5px', flexShrink: 0 },
  statusText: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  statusTitle: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 700,
    color: tokens.color.charcoal,
  },
  statusBody: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
  },
  // concepts
  // Clean 5D-R4 — Studio Layout Reset (approved exception): horizontal
  // scroll/carousel row instead of a vertical stacked list. Same
  // ConceptCard component, same data, same handlers — layout only.
  conceptGrid: {
    display: 'flex',
    flexDirection: 'row',
    gap: '12px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  conceptCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px',
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    boxShadow: tokens.shadow.soft,
    minWidth: '280px',
    maxWidth: '320px',
    flexShrink: 0,
  },
  conceptCardChosen: {
    border: `1px solid ${tokens.color.gold}`,
    background: tokens.color.goldFaint,
  },
  conceptHead: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  conceptName: {
    fontFamily: tokens.font.display,
    fontWeight: 700,
    fontSize: '18px',
    color: tokens.color.charcoal,
  },
  chosenPill: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 700,
    color: tokens.color.charcoal,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.gold}`,
    borderRadius: '999px',
    padding: '3px 10px',
  },
  conceptDesc: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    lineHeight: 1.6,
    color: tokens.color.inkSoft,
    margin: 0,
  },
  conceptRows: { display: 'flex', flexDirection: 'column', gap: '8px', margin: 0 },
  conceptRow: { display: 'flex', flexDirection: 'column', gap: '2px' },
  conceptRowLabel: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    color: tokens.color.inkFaint,
    margin: 0,
  },
  conceptRowValue: {
    fontFamily: tokens.font.body,
    fontSize: '14px',
    lineHeight: 1.55,
    color: tokens.color.charcoal,
    margin: 0,
  },
  placeholderRow: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  placeholderTag: {
    fontFamily: tokens.font.body,
    fontSize: '11px',
    color: tokens.color.inkFaint,
    background: tokens.color.pearl,
    border: `1px dashed ${tokens.color.cardEdge}`,
    borderRadius: '999px',
    padding: '3px 10px',
  },
  conceptActions: { display: 'flex', flexWrap: 'wrap', gap: '10px', paddingTop: '2px' },
  chooseBtn: {
    minHeight: '46px',
    padding: '11px 22px',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 700,
    color: tokens.color.ivory,
    background: tokens.color.charcoal,
    border: 'none',
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
  },
  chooseBtnChosen: {
    color: tokens.color.charcoal,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.gold}`,
  },

  // ---- Clean 5B.3 — iceberg disclosure + per-card controls ----
  disclosure: {
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    background: tokens.color.canvas,
    overflow: 'hidden',
  },
  disclosureToggle: {
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    padding: '12px 14px',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.color.charcoal,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'right',
  },
  disclosureBody: {
    padding: '4px 14px 14px',
    borderTop: `1px solid ${tokens.color.cardEdge}`,
  },
  detailsWrap: {
    borderTop: `1px solid ${tokens.color.cardEdge}`,
    paddingTop: '8px',
    marginTop: '2px',
  },
  detailsToggle: {
    padding: '6px 0',
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.color.gold,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  cardGhostBtn: {
    minHeight: '46px',
    padding: '11px 18px',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.color.charcoal,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
  },
  cardRemoveBtn: {
    minHeight: '46px',
    padding: '11px 18px',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.color.inkSoft,
    background: 'transparent',
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
  },
  confirmInline: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 10px',
    background: tokens.color.pearl,
    border: `1px solid ${tokens.color.goldFaint}`,
    borderRadius: tokens.radius.md,
  },
  confirmText: {
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.color.charcoal,
  },
  confirmYes: {
    minHeight: '38px',
    padding: '8px 16px',
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 700,
    color: tokens.color.ivory,
    background: tokens.color.charcoal,
    border: 'none',
    borderRadius: tokens.radius.sm,
    cursor: 'pointer',
  },
  confirmNo: {
    minHeight: '38px',
    padding: '8px 14px',
    fontFamily: tokens.font.body,
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.color.inkSoft,
    background: 'transparent',
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.sm,
    cursor: 'pointer',
  },
};
