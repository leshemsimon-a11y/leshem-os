// components/studio/assets/AssetOwnershipPanel.js
//
// LESHEM.S OS — Asset Ownership / Client Context Panel (Clean 4B.3)
//
// Answers "למי הנכס הזה שייך?" for one Asset Object and stores ownership /
// client context on it. Internal by default; selecting a client/business/
// supplier/agent reveals simple name / role / tier / notes fields. This is a
// lightweight foundation — NOT a CRM, NOT billing, NOT auth. Local only.

import { tokens } from '../shared/tokens';
import { INTAKE_HE } from '../../../lib/studio/labels';
import {
  OWNER_CONTEXT,
  OWNER_CONTEXT_VALUES,
  CLIENT_TIER_VALUES,
} from '../../../lib/studio/assetsStore';

export default function AssetOwnershipPanel({ object, store }) {
  const ctx = object.ownerContextType || OWNER_CONTEXT.INTERNAL;
  const isInternal = ctx === OWNER_CONTEXT.INTERNAL;

  const setCtx = (value) => {
    const patch = { ownerContextType: value };
    if (value === OWNER_CONTEXT.INTERNAL) {
      patch.ownerDisplayName = 'LESHEM.S internal workspace';
      patch.linkedClientName = null;
    }
    store.updateObject(object.objectId, patch);
  };

  return (
    <div style={styles.wrap} dir="rtl">
      <span style={styles.question}>{INTAKE_HE.ownerQuestion}</span>
      <div style={styles.chips}>
        {OWNER_CONTEXT_VALUES.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setCtx(opt)}
            style={{ ...styles.chip, ...(ctx === opt ? styles.chipActive : null) }}
          >
            {INTAKE_HE.ownerOptions[opt]}
          </button>
        ))}
      </div>

      {!isInternal && (
        <div style={styles.fields}>
          <input
            value={object.linkedClientName || ''}
            onChange={(e) => store.updateObject(object.objectId, { linkedClientName: e.target.value, ownerDisplayName: e.target.value })}
            placeholder={INTAKE_HE.clientNameLabel}
            style={styles.input}
            dir="rtl"
          />
          <input
            value={object.clientRole || ''}
            onChange={(e) => store.updateObject(object.objectId, { clientRole: e.target.value })}
            placeholder={INTAKE_HE.clientRoleLabel}
            style={styles.input}
            dir="rtl"
          />
          <select
            value={object.clientTier || ''}
            onChange={(e) => store.updateObject(object.objectId, { clientTier: e.target.value || null })}
            style={styles.select}
            dir="rtl"
          >
            <option value="">{INTAKE_HE.clientTierLabel}</option>
            {CLIENT_TIER_VALUES.map((t) => (
              <option key={t} value={t}>
                {INTAKE_HE.clientTier[t]}
              </option>
            ))}
          </select>
          <textarea
            value={object.clientNotes || ''}
            onChange={(e) => store.updateObject(object.objectId, { clientNotes: e.target.value })}
            placeholder={INTAKE_HE.clientNotesLabel}
            style={styles.textarea}
            rows={2}
            dir="rtl"
          />
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '10px' },
  question: { fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 700, color: tokens.color.charcoal },
  chips: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  chip: {
    minHeight: '40px', padding: '8px 14px', fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 600,
    color: tokens.color.charcoal, background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: '999px', cursor: 'pointer', whiteSpace: 'nowrap',
  },
  chipActive: { background: tokens.color.goldFaint, border: `1px solid ${tokens.color.gold}` },
  fields: { display: 'flex', flexDirection: 'column', gap: '8px' },
  input: {
    boxSizing: 'border-box', fontFamily: tokens.font.body, fontSize: '14px', color: tokens.color.ink,
    background: tokens.color.ivory, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md, padding: '10px 12px', minHeight: '44px',
  },
  select: {
    fontFamily: tokens.font.body, fontSize: '14px', color: tokens.color.ink, background: tokens.color.ivory,
    border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md, padding: '10px 12px', minHeight: '44px',
  },
  textarea: {
    boxSizing: 'border-box', fontFamily: tokens.font.body, fontSize: '14px', lineHeight: 1.5, color: tokens.color.ink,
    background: tokens.color.ivory, border: `1px solid ${tokens.color.cardEdge}`, borderRadius: tokens.radius.md, padding: '10px 12px', resize: 'vertical',
  },
};
