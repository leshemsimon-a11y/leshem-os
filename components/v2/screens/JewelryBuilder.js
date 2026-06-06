/**
 * LESHEM.S OS — v2 Jewelry Builder Screen — v2.4
 *
 * Foundation only. NOT a calculator. NOT a pricing engine.
 * A clean design board showing the current JewelryBuildDraft:
 *   • Center stones — each as a SEPARATE card (never collapsed to quantity)
 *   • Side stone groups — parcels/melee grouped; singles as quantity-1
 *   • Components — chains, settings, parts, findings
 *   • Metal selector placeholder (captures intent only — no pricing)
 *   • Notes
 *   • In-builder role change / removal
 *   • Return to Work Tray
 *
 * Calculator handoff:
 *   • Single-center-stone draft → reuses the v2.3 calculator bridge.
 *   • Any more complex draft → disabled future label. No silent first-item.
 *
 * No Airtable writes. No persistence. No quote/cert/AI/3D.
 */

import { useState } from 'react';
import styles from './JewelryBuilder.module.css';
import { useWorkTray } from '../../../lib/v2/workTrayContext';
import {
  getStoneTypeLabel,
  getShapeLabel,
} from '../../../lib/v2/taxonomyHelpers';
import {
  removeCenterStone,
  removeSideGroup,
  removeComponent,
  centerToSide,
  sideToCenter,
  setSideGroupSetting,
  setMetal,
  setNotes,
  draftEntryCount,
} from '../../../lib/v2/jewelryBuildDraft';
import {
  buildHandoffPayload,
  writeBuildHandoff,
  buildHandoffUrl,
  mapMetalToMvp,
  MVP_SIDE_ROW_LIMIT,
} from '../../../lib/v2/builderCalculatorBridge';

// Metal placeholder options (UI only — no pricing lookup)
const METAL_TYPES = [
  { value: '',           label: '— בחר מתכת —' },
  { value: 'yellow_gold', label: 'זהב צהוב' },
  { value: 'white_gold',  label: 'זהב לבן' },
  { value: 'rose_gold',   label: 'זהב אדום' },
  { value: 'platinum',    label: 'פלטינה' },
  { value: 'silver',      label: 'כסף' },
];

const KARAT_OPTIONS = [
  { value: '',    label: '— קרטים —' },
  { value: '9k',  label: '9K' },
  { value: '14k', label: '14K' },
  { value: '18k', label: '18K' },
  { value: 'pt',  label: 'Pt 950' },
];

// Setting type placeholder (UI only — uses "סוג שיבוץ" terminology, never "הגדרה")
const SETTING_TYPES = [
  { value: '',          label: '— סוג שיבוץ —' },
  { value: 'prong',     label: 'שיניים' },
  { value: 'bezel',     label: 'מסגרת' },
  { value: 'pave',      label: 'פאווה' },
  { value: 'channel',   label: 'תעלה' },
  { value: 'micro',     label: 'מיקרו' },
];

function resolveImageSrc(imageUrl) {
  if (!imageUrl) return null;
  if (Array.isArray(imageUrl) && imageUrl[0]) {
    return imageUrl[0].url || imageUrl[0].thumbnails?.large?.url || null;
  }
  if (typeof imageUrl === 'string') return imageUrl;
  return null;
}

// ─── Center stone card ─────────────────────────────────────────────────────────
function CenterStoneCard({ stone, index, onMoveToSide, onRemove }) {
  const imageSrc  = resolveImageSrc(stone.imageUrl);
  const typeLabel = getStoneTypeLabel(stone.stoneType, 'he');
  const shapeLabel = getShapeLabel(stone.shape, 'he');
  const spec = [
    stone.caratWeight ? `${stone.caratWeight} קרט` : null,
    stone.color,
    stone.clarity,
  ].filter(Boolean).join(' · ');

  return (
    <div className={styles.stoneCard}>
      <div className={styles.stoneCardImage}>
        {imageSrc
          ? <img src={imageSrc} alt={typeLabel} className={styles.stoneImg} />
          : <span className={styles.stonePlaceholder} aria-hidden="true">◇</span>}
        <div className={styles.centerBadge}>אבן מרכזית {index + 1}</div>
      </div>
      <div className={styles.stoneCardBody}>
        <div className={styles.stoneTitle}>
          {typeLabel}{shapeLabel ? ` · ${shapeLabel}` : ''}
        </div>
        {spec && <div className={styles.stoneSpec}>{spec}</div>}
        {(stone.labName || stone.reportNumber) && (
          <div className={styles.stoneLab}>
            {[stone.labName, stone.reportNumber].filter(Boolean).join(' ')}
          </div>
        )}
      </div>
      <div className={styles.stoneCardActions}>
        <button className={styles.roleChangeBtn} onClick={() => onMoveToSide(stone._ref)}>
          ↳ העבר לאבני צד
        </button>
        <button className={styles.removeBtn} onClick={() => onRemove(stone._ref)} aria-label="הסר">
          הסר
        </button>
      </div>
    </div>
  );
}

// ─── Side group card ────────────────────────────────────────────────────────────
function SideGroupCard({ group, onSettingChange, onMoveToCenter, onRemove }) {
  const imageSrc   = resolveImageSrc(group.imageUrl);
  const typeLabel  = getStoneTypeLabel(group.stoneType, 'he');
  const shapeLabel = getShapeLabel(group.shape, 'he');

  return (
    <div className={styles.stoneCard}>
      <div className={styles.stoneCardImage}>
        {imageSrc
          ? <img src={imageSrc} alt={typeLabel} className={styles.stoneImg} />
          : <span className={styles.stonePlaceholder} aria-hidden="true">○</span>}
        <div className={styles.sideBadge}>
          {group.grouped ? `קבוצה · ${group.quantity} אבנים` : 'אבן צד'}
        </div>
      </div>
      <div className={styles.stoneCardBody}>
        <div className={styles.stoneTitle}>
          {typeLabel}{shapeLabel ? ` · ${shapeLabel}` : ''}
        </div>
        <div className={styles.stoneSpec}>
          {[
            `כמות: ${group.quantity}`,
            group.totalCaratWeight ? `${group.totalCaratWeight} קרט סה״כ` : null,
            group.color,
            group.clarity,
          ].filter(Boolean).join(' · ')}
        </div>

        {/* Setting type selector — "סוג שיבוץ" (no pricing) */}
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>סוג שיבוץ</label>
          <select
            className={styles.settingSelect}
            value={group.settingType || ''}
            onChange={(e) => onSettingChange(group.groupId, e.target.value || null)}
          >
            {SETTING_TYPES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className={styles.stoneCardActions}>
        {!group.grouped && (
          <button className={styles.roleChangeBtn} onClick={() => onMoveToCenter(group.groupId)}>
            ↳ העבר לאבן מרכזית
          </button>
        )}
        <button className={styles.removeBtn} onClick={() => onRemove(group.groupId)} aria-label="הסר">
          הסר
        </button>
      </div>
    </div>
  );
}

// ─── Component card ──────────────────────────────────────────────────────────────
function ComponentCard({ component, onRemove }) {
  const imageSrc = resolveImageSrc(component.imageUrl);
  return (
    <div className={styles.stoneCard}>
      <div className={styles.stoneCardImage}>
        {imageSrc
          ? <img src={imageSrc} alt={component.title} className={styles.stoneImg} />
          : <span className={styles.stonePlaceholder} aria-hidden="true">⊟</span>}
        <div className={styles.componentBadge}>רכיב</div>
      </div>
      <div className={styles.stoneCardBody}>
        <div className={styles.stoneTitle}>{component.title || 'רכיב תכשיט'}</div>
      </div>
      <div className={styles.stoneCardActions}>
        <button className={styles.removeBtn} onClick={() => onRemove(component._ref)} aria-label="הסר">
          הסר
        </button>
      </div>
    </div>
  );
}

// ─── Empty section row ───────────────────────────────────────────────────────────
function EmptyRow({ text }) {
  return <div className={styles.emptyRow}>{text}</div>;
}

// ─── Main builder screen ───────────────────────────────────────────────────────
export default function JewelryBuilder({ onBackToInventory }) {
  const { currentDraft, setDraft, clearDraft } = useWorkTray();
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // No active draft — guidance state
  if (!currentDraft) {
    return (
      <div className={styles.builder}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>◈</div>
          <div className={styles.emptyTitle}>אין טיוטת בנייה פעילה</div>
          <div className={styles.emptyDesc}>
            הוסף פריטים למגש העבודה ולחץ "התחל בניית תכשיט"
          </div>
          <button className={styles.emptyActionBtn} onClick={onBackToInventory}>
            פתח מלאי
          </button>
        </div>
      </div>
    );
  }

  const draft = currentDraft;
  const entryCount = draftEntryCount(draft);
  const hasMappable =
    draft.centerStones.length > 0 ||
    draft.sideStoneGroups.length > 0;

  // ── Draft mutators (pure helpers → setDraft) ──
  const handleRemoveCenter   = (ref)     => setDraft(removeCenterStone(draft, ref));
  const handleRemoveSide     = (gid)     => setDraft(removeSideGroup(draft, gid));
  const handleRemoveComponent= (ref)     => setDraft(removeComponent(draft, ref));
  const handleCenterToSide   = (ref)     => setDraft(centerToSide(draft, ref));
  const handleSideToCenter   = (gid)     => setDraft(sideToCenter(draft, gid));
  const handleSettingChange  = (gid, st) => setDraft(setSideGroupSetting(draft, gid, st));
  const handleMetalType      = (v)       => setDraft(setMetal(draft, { metalType: v || null }));
  const handleKarat          = (v)       => setDraft(setMetal(draft, { karat: v || null }));
  const handleNotes          = (v)       => setDraft(setNotes(draft, v));

  // ── Calculator handoff ──
  // Step 1: open the confirmation summary (no navigation yet).
  function handleOpenCalculator() {
    if (!hasMappable) return;
    setShowSummary(true);
  }

  // Step 2: user confirmed from the summary → write payload, navigate to MVP.
  // The MVP shows the existing "Start New / Add to Current" dialog after this.
  function handleConfirmHandoff() {
    const payload = buildHandoffPayload(draft);
    writeBuildHandoff(payload);
    setShowSummary(false);
    window.location.href = buildHandoffUrl();
  }

  // Hebrew metal label for the summary (UI only).
  const metalLabel = (() => {
    const t = METAL_TYPES.find((m) => m.value === (draft.metal?.metalType || ''));
    const k = KARAT_OPTIONS.find((o) => o.value === (draft.metal?.karat || ''));
    const parts = [k?.value ? k.label : null, t?.value ? t.label : null].filter(Boolean);
    return parts.join(' ');
  })();
  const metalMapsToMvp = !!mapMetalToMvp(draft.metal);
  const sideOverflow = Math.max(0, draft.sideStoneGroups.length - MVP_SIDE_ROW_LIMIT);

  function handleDiscardConfirmed() {
    clearDraft();
    setConfirmingDiscard(false);
    if (onBackToInventory) onBackToInventory();
  }

  return (
    <div className={styles.builder}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.pageTitle}>בניית תכשיט · טיוטה</h1>
          <div className={styles.pageSubtitle}>
            {entryCount === 0 ? 'טיוטה ריקה' : `${entryCount} פריטים בטיוטה`}
          </div>
        </div>
        <button className={styles.backBtn} onClick={onBackToInventory}>
          ← חזור למלאי
        </button>
      </div>

      <div className={styles.board}>
        {/* ── Center Stones ── */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>אבני מרכז</span>
            <span className={styles.sectionCount}>{draft.centerStones.length}</span>
          </div>
          {draft.centerStones.length === 0 ? (
            <EmptyRow text="אין אבני מרכז" />
          ) : (
            <div className={styles.cardGrid}>
              {draft.centerStones.map((stone, idx) => (
                <CenterStoneCard
                  key={stone._ref || idx}
                  stone={stone}
                  index={idx}
                  onMoveToSide={handleCenterToSide}
                  onRemove={handleRemoveCenter}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Side Stones ── */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>אבני צד</span>
            <span className={styles.sectionCount}>{draft.sideStoneGroups.length}</span>
          </div>
          {draft.sideStoneGroups.length === 0 ? (
            <EmptyRow text="אין אבני צד" />
          ) : (
            <div className={styles.cardGrid}>
              {draft.sideStoneGroups.map((group, idx) => (
                <SideGroupCard
                  key={group.groupId || idx}
                  group={group}
                  onSettingChange={handleSettingChange}
                  onMoveToCenter={handleSideToCenter}
                  onRemove={handleRemoveSide}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Components ── */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>רכיבים</span>
            <span className={styles.sectionCount}>{draft.components.length}</span>
          </div>
          {draft.components.length === 0 ? (
            <EmptyRow text="אין רכיבים" />
          ) : (
            <div className={styles.cardGrid}>
              {draft.components.map((component, idx) => (
                <ComponentCard
                  key={component._ref || idx}
                  component={component}
                  onRemove={handleRemoveComponent}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Metal placeholder ── */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>מתכת</span>
            <span className={styles.sectionHint}>בחירה בלבד · ללא תמחור בשלב זה</span>
          </div>
          <div className={styles.metalRow}>
            <select
              className={styles.metalSelect}
              value={draft.metal?.metalType || ''}
              onChange={(e) => handleMetalType(e.target.value)}
            >
              {METAL_TYPES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <select
              className={styles.metalSelect}
              value={draft.metal?.karat || ''}
              onChange={(e) => handleKarat(e.target.value)}
            >
              {KARAT_OPTIONS.map((k) => (
                <option key={k.value} value={k.value}>{k.label}</option>
              ))}
            </select>
          </div>
        </section>

        {/* ── Notes ── */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>הערות</span>
          </div>
          <textarea
            className={styles.notesArea}
            value={draft.notes}
            onChange={(e) => handleNotes(e.target.value)}
            placeholder="הערות עיצוב, בקשות לקוח, הנחיות..."
            rows={3}
            dir="rtl"
          />
        </section>
      </div>

      {/* ── Footer actions ── */}
      <div className={styles.footer}>
        <button
          className={styles.calcBtnLive}
          onClick={handleOpenCalculator}
          disabled={!hasMappable}
          aria-disabled={!hasMappable}
        >
          פתח במחשבון
        </button>

        <button className={styles.saveBtnFuture} type="button" disabled aria-disabled="true">
          שמור טיוטה
          <span className={styles.futureNote}>בשלב הבא</span>
        </button>

        {confirmingDiscard ? (
          <div className={styles.discardConfirm}>
            <span>לבטל את הטיוטה?</span>
            <button className={styles.discardYes} onClick={handleDiscardConfirmed}>בטל טיוטה</button>
            <button className={styles.discardNo} onClick={() => setConfirmingDiscard(false)}>המשך</button>
          </div>
        ) : (
          <button className={styles.discardBtn} onClick={() => setConfirmingDiscard(true)}>
            בטל טיוטה
          </button>
        )}
      </div>

      {/* ── Handoff confirmation summary ── */}
      {showSummary && (
        <div
          className={styles.summaryOverlay}
          onClick={(e) => { if (e.target === e.currentTarget) setShowSummary(false); }}
        >
          <div className={styles.summaryCard} dir="rtl">
            <div className={styles.summaryTitle}>פתיחה במחשבון · סיכום</div>
            <div className={styles.summarySub}>
              כך תיטען הטיוטה למחשבון. ניתן יהיה לערוך הכול ידנית לאחר מכן.
            </div>

            {/* Center stones */}
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>אבני מרכז</span>
              <span className={styles.summaryValue}>
                {draft.centerStones.length === 0
                  ? '—'
                  : `${draft.centerStones.length} אבנים נפרדות`}
              </span>
            </div>

            {/* Side groups */}
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>אבני צד</span>
              <span className={styles.summaryValue}>
                {draft.sideStoneGroups.length === 0
                  ? '—'
                  : `${Math.min(draft.sideStoneGroups.length, MVP_SIDE_ROW_LIMIT)} קבוצות → שורות מחשבון`}
              </span>
            </div>
            {sideOverflow > 0 && (
              <div className={styles.summaryNote}>
                {sideOverflow} קבוצות אבני צד נוספות יעברו כהערה (המחשבון תומך בשתי שורות צד).
              </div>
            )}

            {/* Components */}
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>רכיבים</span>
              <span className={styles.summaryValue}>
                {draft.components.length === 0
                  ? '—'
                  : `${draft.components.length} רכיבים → הערה`}
              </span>
            </div>
            {draft.components.length > 0 && (
              <div className={styles.summaryNote}>
                רכיבים אינם מתומחרים במחשבון בשלב זה — יופיעו כהערת "רכיבים שנבחרו".
              </div>
            )}

            {/* Metal */}
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>מתכת</span>
              <span className={styles.summaryValue}>
                {metalLabel
                  ? (metalMapsToMvp ? metalLabel : `${metalLabel} · תיבחר ידנית`)
                  : 'תיבחר ידנית'}
              </span>
            </div>
            {metalLabel && !metalMapsToMvp && (
              <div className={styles.summaryNote}>
                שילוב המתכת הנבחר אינו ממופה אוטומטית — בחר מתכת ידנית במחשבון.
              </div>
            )}

            <div className={styles.summaryActions}>
              <button className={styles.summaryConfirm} onClick={handleConfirmHandoff}>
                המשך למחשבון
              </button>
              <button className={styles.summaryCancel} onClick={() => setShowSummary(false)}>
                חזרה
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
