/**
 * LESHEM.S OS — v2 Asset Drawer — v2.3
 *
 * Changes from v2.2:
 *
 * Calculator bridge (v2.3):
 *   "השתמש במחשבון" opens a role-selection modal (אבן מרכזית / אבני צד / רכיב).
 *   After choosing a role, navigates to MVP via URL bridge:
 *     /?v2item=<_airtableId>&role=<role>
 *   MVP detects the params and runs the existing prefill flow.
 *
 * Certificate bridge (v2.3):
 *   "צור תעודה" navigates directly to MVP via URL bridge:
 *     /?v2cert=<_airtableId>
 *   MVP detects the param and runs the existing handleCertFromItem flow.
 *
 * Basic drawer editing (v2.3):
 *   Edit mode toggle opens an inline edit form.
 *   Editable fields: status, internalNotes, certLab, certNumber/laserInscription.
 *   Media fields: read-only with "בשלב הבא" notice.
 *   Saves via PATCH /api/airtable/update-stone.
 *   On success: optimistic local update + emits onAssetUpdated.
 *   On failure: inline error, no silent failure.
 *
 * NEVER shows: Airtable Record ID, cost price, demo notes.
 * Shape is customer-facing. Cut/Form is NOT shown to customer.
 * Geographic origin is separate from Natural/Lab-Grown.
 *
 * No Airtable schema changes. No new API routes. No packages.
 */

import { useState } from 'react';
import styles from './AssetDrawer.module.css';
import {
  getStoneCategoryLabel,
  getOriginGrowthLabel,
  getStoneTypeLabel,
  getShapeLabel,
  getInventoryLayerLabel,
  getStatusLabel,
  getGeographicOriginLabel,
  getAssetDisplayTitle,
} from '../../lib/v2/taxonomyHelpers';
import { useWorkTray } from '../../lib/v2/workTrayContext';
import { buildCalcBridgeUrl, ROLE_OPTIONS } from '../../lib/v2/calculatorBridge';
import { buildCertBridgeUrl }               from '../../lib/v2/certificateBridge';

// ─── Status options for the edit form ─────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: 'available', label: 'זמין' },
  { value: 'reserved',  label: 'שמור' },
  { value: 'in_use',    label: 'בשימוש / משובץ' },
  { value: 'sold',      label: 'נמכר' },
  { value: 'returned',  label: 'הוחזר' },
  { value: 'archived',  label: 'בארכיון' },
];

const STATUS_TO_AIRTABLE = {
  available: 'Available',
  reserved:  'Reserved',
  in_use:    'Mounted',
  sold:      'Sold',
  returned:  'Returned',
  archived:  'Archived',
};

// ─── Collapsible section ───────────────────────────────────────────────────────
function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setOpen((v) => !v)}>
        <div className={styles.sectionTitle}>{title}</div>
        <span className={styles.sectionToggle}>{open ? '−' : '+'}</span>
      </div>
      <div className={open ? styles.sectionContent : styles.sectionContentCollapsed}>
        {children}
      </div>
    </div>
  );
}

// ─── Read-only field ───────────────────────────────────────────────────────────
function Field({ label, value, muted = false }) {
  if (!value && value !== 0) {
    return (
      <div className={styles.field}>
        <div className={styles.fieldLabel}>{label}</div>
        <div className={styles.fieldValueEmpty}>—</div>
      </div>
    );
  }
  return (
    <div className={styles.field}>
      <div className={styles.fieldLabel}>{label}</div>
      <div className={muted ? styles.fieldValueMuted : styles.fieldValue}>{value}</div>
    </div>
  );
}

// ─── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const label = getStatusLabel(status, 'he');
  const cls = {
    available: styles.badgeAvailable,
    reserved:  styles.badgeReserved,
    in_use:    styles.badgeInUse,
    sold:      styles.badgeSold,
  }[status] || '';
  return <span className={`${styles.badge} ${cls}`}>{label}</span>;
}

const PLACEHOLDER_ICONS = {
  white_diamond:       '◇',
  fancy_color_diamond: '◈',
  colored_gemstone:    '○',
  parcel:              '⊡',
  part:                '⊟',
  finished_jewelry:    '◎',
};

// ─── Role selection modal ──────────────────────────────────────────────────────
function RoleSelectModal({ asset, onSelect, onCancel }) {
  if (!asset) return null;
  const title = getAssetDisplayTitle(asset);
  const caratStr = asset.caratWeight
    ? ` · ${parseFloat(asset.caratWeight).toFixed(2)} קרט`
    : '';

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>השתמש במחשבון</div>
          <button className={styles.modalClose} onClick={onCancel} aria-label="סגור">×</button>
        </div>
        <div className={styles.modalSubtitle} dir="rtl">
          {title}{caratStr} — בחר תפקיד האבן במוצר
        </div>

        <div className={styles.roleList}>
          {ROLE_OPTIONS.map((opt) => (
            <button
              key={opt.role}
              className={`${styles.roleOption} ${opt.primary ? styles.roleOptionPrimary : ''}`}
              onClick={() => onSelect(opt.role)}
            >
              <span className={styles.roleIcon}>{opt.icon}</span>
              <div className={styles.roleText}>
                <div className={styles.roleLabel}>
                  {opt.label}
                  {opt.primary && (
                    <span className={styles.roleDefault}> (ברירת מחדל)</span>
                  )}
                </div>
                <div className={styles.roleSub}>{opt.sub}</div>
              </div>
            </button>
          ))}
        </div>

        <button className={styles.modalCancelBtn} onClick={onCancel}>ביטול</button>
      </div>
    </div>
  );
}

// ─── Inline edit form ──────────────────────────────────────────────────────────
function EditForm({ asset, onSave, onCancel, saving, error }) {
  const [status,        setStatus]        = useState(asset.status        || '');
  const [internalNotes, setInternalNotes] = useState(asset.internalNotes || '');
  const [certLab,       setCertLab]       = useState(asset.labName       || '');
  const [certNumber,    setCertNumber]    = useState(asset.reportNumber   || '');

  function handleSubmit() {
    onSave({ status, internalNotes, certLab, certNumber });
  }

  const inputStyle = {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid var(--v2-border, #e2dcd2)',
    borderRadius: '6px',
    fontSize: '13px',
    fontFamily: 'Arial, sans-serif',
    color: 'var(--v2-text-primary, #1e1a16)',
    background: 'var(--v2-surface, #ffffff)',
    direction: 'rtl',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 140ms ease',
  };

  const labelStyle = {
    fontSize: '9px',
    letterSpacing: '0.12em',
    color: 'var(--v2-text-muted, #a09080)',
    textTransform: 'uppercase',
    fontFamily: 'Arial, sans-serif',
    display: 'block',
    marginBottom: '5px',
  };

  return (
    <div className={styles.editForm} dir="rtl">
      <div className={styles.editFormTitle}>עריכת פרטים</div>

      <div className={styles.editField}>
        <label style={labelStyle}>סטטוס מלאי</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          <option value="">— בחר —</option>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className={styles.editField}>
        <label style={labelStyle}>מקור תעודה / מעבדה</label>
        <input
          type="text"
          value={certLab}
          onChange={(e) => setCertLab(e.target.value)}
          placeholder="GIA, IGI, HRD..."
          style={inputStyle}
        />
      </div>

      <div className={styles.editField}>
        <label style={labelStyle}>מספר תעודה / חריטת לייזר</label>
        <input
          type="text"
          value={certNumber}
          onChange={(e) => setCertNumber(e.target.value)}
          placeholder="מספר תעודה"
          style={inputStyle}
        />
      </div>

      <div className={styles.editField}>
        <label style={labelStyle}>הערות פנימיות</label>
        <textarea
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          placeholder="הערות פנימיות (לא מוצג ללקוח)"
          rows={3}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
        />
      </div>

      <div className={styles.editMediaNotice}>
        <span className={styles.editMediaIcon}>⊟</span>
        <span>עריכת מדיה תתווסף בשלב הבא</span>
      </div>

      {error && (
        <div className={styles.editError}>{error}</div>
      )}

      <div className={styles.editActions}>
        <button
          className={styles.editSaveBtn}
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? 'שומר...' : 'שמור שינויים'}
        </button>
        <button
          className={styles.editCancelBtn}
          onClick={onCancel}
          disabled={saving}
        >
          ביטול
        </button>
      </div>
    </div>
  );
}

// ─── Main AssetDrawer ──────────────────────────────────────────────────────────
export default function AssetDrawer({ asset, onClose, mode = 'detail', onAssetUpdated }) {
  const { addItem, removeItem, items } = useWorkTray();

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editMode,      setEditMode]      = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [editError,     setEditError]     = useState(null);
  const [editSuccess,   setEditSuccess]   = useState(false);
  const [localOverrides, setLocalOverrides] = useState({});

  if (!asset) return null;

  const isInspect    = mode === 'inspect';
  const displayAsset = { ...asset, ...localOverrides };

  const isInTray = items.some(
    (i) => i._airtableId && i._airtableId === asset._airtableId
  );

  const title         = getAssetDisplayTitle(displayAsset);
  const categoryLabel = getStoneCategoryLabel(displayAsset.stoneCategory, 'he');
  const originLabel   = getOriginGrowthLabel(displayAsset.origin, 'he');
  const typeLabel     = getStoneTypeLabel(displayAsset.stoneType, 'he');
  const shapeLabel    = getShapeLabel(displayAsset.shape, 'he');
  const layerLabel    = getInventoryLayerLabel(displayAsset.inventoryLayer, 'he');
  const geoOriginLabel = displayAsset.geographicOrigin
    ? getGeographicOriginLabel(displayAsset.geographicOrigin)
    : null;

  let imageSrc = null;
  if (displayAsset.imageUrl) {
    if (Array.isArray(displayAsset.imageUrl) && displayAsset.imageUrl[0]) {
      imageSrc = displayAsset.imageUrl[0].url || displayAsset.imageUrl[0].thumbnails?.large?.url;
    } else if (typeof displayAsset.imageUrl === 'string') {
      imageSrc = displayAsset.imageUrl;
    }
  }

  const placeholderIcon =
    PLACEHOLDER_ICONS[displayAsset.stoneCategory] ||
    PLACEHOLDER_ICONS[displayAsset.assetType] ||
    '◇';

  const fancyColorDesc = [
    displayAsset.fancyColorIntensity,
    displayAsset.fancyColorHue,
    displayAsset.fancyColorOvertone,
  ].filter(Boolean).join(' ');

  // ── Tray toggle ──
  function handleTrayToggle() {
    if (isInTray) removeItem(asset._airtableId);
    else addItem(asset);
  }

  // ── Calculator bridge: open role modal first ──
  function handleCalcClick() {
    if (!asset._airtableId) return;
    setRoleModalOpen(true);
  }

  function handleRoleSelect(role) {
    setRoleModalOpen(false);
    window.location.href = buildCalcBridgeUrl(asset._airtableId, role);
  }

  // ── Certificate bridge: direct navigation ──
  function handleCertClick() {
    if (!asset._airtableId) return;
    window.location.href = buildCertBridgeUrl(asset._airtableId);
  }

  // ── Edit save ──
  async function handleEditSave(fields) {
    if (!asset._airtableId) return;
    setSaving(true);
    setEditError(null);
    setEditSuccess(false);

    try {
      const body = { id: asset._airtableId };
      // Map v2 field names to what update-stone body expects
      // update-stone writes directly to Airtable select fields. v2 keeps
      // canonical lowercase status keys for UI, so convert back to Airtable
      // option labels before PATCHing.
      if (fields.status)        body.inventoryStatus = STATUS_TO_AIRTABLE[fields.status] || fields.status;
      if (fields.certLab)       body.certLab          = fields.certLab;
      if (fields.certNumber)    body.laserInscription = fields.certNumber;
      if (fields.internalNotes !== undefined) body.internalNotes = fields.internalNotes;

      const res  = await fetch('/api/airtable/update-stone', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      // Optimistic update — reflect changes without full re-fetch
      const overrides = {};
      if (fields.status)        overrides.status        = fields.status;
      if (fields.certLab)       overrides.labName        = fields.certLab;
      if (fields.certNumber)    overrides.reportNumber   = fields.certNumber;
      if (fields.internalNotes !== undefined) overrides.internalNotes = fields.internalNotes;

      setLocalOverrides((prev) => ({ ...prev, ...overrides }));
      setEditSuccess(true);
      setEditMode(false);

      if (onAssetUpdated) onAssetUpdated(asset._airtableId, overrides);

    } catch (err) {
      setEditError('שגיאה בשמירה: ' + (err.message || 'נסה שנית'));
    } finally {
      setSaving(false);
    }
  }

  const keySpecsOpen      = !isInspect;
  const gemoDetailsOpen   = isInspect;
  const labInfoOpen       = isInspect;
  const inventoryInfoOpen = false;

  return (
    <>
      {roleModalOpen && (
        <RoleSelectModal
          asset={asset}
          onSelect={handleRoleSelect}
          onCancel={() => setRoleModalOpen(false)}
        />
      )}

      <div
        className={styles.drawer}
        role="dialog"
        aria-label={isInspect ? 'בדיקת פריט' : 'פרטי פריט'}
      >
        {/* Header */}
        <div className={styles.drawerHeader}>
          <div className={isInspect ? styles.drawerTitleInspect : styles.drawerTitle}>
            {isInspect ? 'בדיקה · Inspection' : 'פרטי פריט'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {!editMode && asset._airtableId && (
              <button
                className={styles.editToggleBtn}
                onClick={() => { setEditMode(true); setEditError(null); setEditSuccess(false); }}
                title="ערוך פריט"
                aria-label="ערוך פריט"
              >
                ✎
              </button>
            )}
            <button className={styles.closeBtn} onClick={onClose} aria-label="סגור">
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className={styles.drawerBody}>

          {/* Image */}
          {isInspect ? (
            <>
              <div className={styles.imageSectionInspect}>
                <div className={styles.loupeRing} aria-hidden="true" />
                {imageSrc ? (
                  <img src={imageSrc} alt={title} className={styles.drawerImage} />
                ) : (
                  <div className={styles.imagePlaceholderInspect} aria-hidden="true">
                    {placeholderIcon}
                  </div>
                )}
              </div>
              <div className={styles.inspectDivider} />
            </>
          ) : (
            <div className={styles.imageSection}>
              {imageSrc ? (
                <img src={imageSrc} alt={title} className={styles.drawerImage} />
              ) : (
                <div className={styles.imagePlaceholder} aria-hidden="true">
                  {placeholderIcon}
                </div>
              )}
            </div>
          )}

          {/* Title */}
          <div className={styles.assetTitleSection}>
            <h2 className={styles.assetMainTitle}>{title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              {displayAsset.status && <StatusBadge status={displayAsset.status} />}
              {editSuccess && (
                <span className={styles.saveSuccessBadge}>✓ נשמר</span>
              )}
            </div>
          </div>

          {/* Edit form OR read-only sections */}
          {editMode ? (
            <EditForm
              asset={displayAsset}
              onSave={handleEditSave}
              onCancel={() => { setEditMode(false); setEditError(null); }}
              saving={saving}
              error={editError}
            />
          ) : (
            <>
              <Section title="מפרט עיקרי" defaultOpen={keySpecsOpen}>
                <div className={styles.fieldGrid}>
                  <Field label="קטגוריה"   value={categoryLabel} />
                  <Field label="מקור גידול" value={originLabel} />
                  <Field label="סוג אבן"   value={typeLabel} />
                  <Field label="צורה"      value={shapeLabel} />
                  <Field
                    label="משקל קרט"
                    value={
                      displayAsset.caratWeight
                        ? `${displayAsset.caratWeight} קרט`
                        : displayAsset.totalCaratWeight
                        ? `${displayAsset.totalCaratWeight} קרט (כולל)`
                        : null
                    }
                  />
                  <Field label="צבע"   value={displayAsset.color} />
                  <Field label="ניקיון" value={displayAsset.clarity} />
                  {displayAsset.stoneCategory === 'white_diamond' && (
                    <Field label="קאט" value={displayAsset.cut} />
                  )}
                </div>
                {fancyColorDesc && (
                  <div style={{ marginTop: 12 }}>
                    <Field label="צבע פנסי" value={fancyColorDesc} />
                  </div>
                )}
              </Section>

              <Section title="פרטים גמולוגיים" defaultOpen={gemoDetailsOpen}>
                <div className={styles.fieldGrid}>
                  <Field label="פוליש"       value={displayAsset.polish}       muted />
                  <Field label="סימטריה"     value={displayAsset.symmetry}     muted />
                  <Field label="פלואורסנציה" value={displayAsset.fluorescence} muted />
                  <Field
                    label="עומק %"
                    value={displayAsset.depthPercent ? `${displayAsset.depthPercent}%` : null}
                    muted
                  />
                  <Field
                    label="שולחן %"
                    value={displayAsset.tablePercent ? `${displayAsset.tablePercent}%` : null}
                    muted
                  />
                </div>
                {displayAsset.measurements && (
                  <div style={{ marginTop: 12 }}>
                    <Field label="מידות" value={displayAsset.measurements} muted />
                  </div>
                )}
                {geoOriginLabel && (
                  <div style={{ marginTop: 12 }}>
                    <Field label="מקור גאוגרפי" value={geoOriginLabel} muted />
                  </div>
                )}
              </Section>

              <Section title="תעודה ומעבדה" defaultOpen={labInfoOpen}>
                <div className={styles.fieldGrid}>
                  <Field label="מעבדה"      value={displayAsset.labName} />
                  <Field label="מספר תעודה" value={displayAsset.reportNumber} />
                </div>
              </Section>

              <Section title="פרטי מלאי" defaultOpen={inventoryInfoOpen}>
                <div className={styles.fieldGrid}>
                  <Field label="שכבת מלאי" value={layerLabel} />
                  <Field label="ספק"        value={displayAsset.supplierName} muted />
                  {displayAsset.createdAt && (
                    <Field
                      label="נוסף בתאריך"
                      value={new Date(displayAsset.createdAt).toLocaleDateString('he-IL')}
                      muted
                    />
                  )}
                </div>
              </Section>

              {displayAsset.internalNotes && (
                <Section title="הערות פנימיות" defaultOpen={false}>
                  <div className={styles.internalBadge}>פנימי בלבד · לא מוצג ללקוח</div>
                  <div className={styles.notesText}>{displayAsset.internalNotes}</div>
                </Section>
              )}
            </>
          )}
        </div>

        {/* Footer — hidden during edit mode */}
        {!editMode && (
          <div className={styles.drawerFooter}>
            <button
              className={`${styles.primaryAction} ${isInTray ? styles.primaryActionInTray : ''}`}
              onClick={handleTrayToggle}
            >
              {isInTray ? '✓ במגש — לחץ להסרה' : 'הוסף למגש עבודה'}
            </button>

            <div className={styles.secondaryActions}>
              {asset._airtableId ? (
                <button
                  className={`${styles.secondaryAction} ${styles.secondaryActionLive}`}
                  onClick={handleCalcClick}
                  type="button"
                >
                  השתמש במחשבון
                </button>
              ) : (
                <button className={styles.secondaryAction} type="button" disabled>
                  <span>
                    השתמש במחשבון
                    <span className={styles.futureLabel}>נדרש מזהה פריט</span>
                  </span>
                </button>
              )}

              {asset._airtableId ? (
                <button
                  className={`${styles.secondaryAction} ${styles.secondaryActionLive}`}
                  onClick={handleCertClick}
                  type="button"
                >
                  צור תעודה
                </button>
              ) : (
                <button className={styles.secondaryAction} type="button" disabled>
                  <span>
                    צור תעודה
                    <span className={styles.futureLabel}>נדרש מזהה פריט</span>
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
