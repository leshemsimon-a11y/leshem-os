// components/studio/assets/AssetIntakeRouter.js
//
// LESHEM.S OS — Asset Intake Router (Clean 4B.3)
//
// The "what is this, who owns it, where does it go" panel for one Asset
// Object. Combines the ownership panel with the destination question
// ("מה הנכס הזה אמור להיות?"). Both are changeable later. Local only.

import { tokens } from '../shared/tokens';
import { INTAKE_HE } from '../../../lib/studio/labels';
import { DESTINATION_TYPE } from '../../../lib/studio/assetsStore';
import AssetOwnershipPanel from './AssetOwnershipPanel';

// Destination options shown to the user (subset of DESTINATION_TYPE).
const DEST_OPTIONS = [
  DESTINATION_TYPE.INVENTORY,
  DESTINATION_TYPE.MODEL_LIBRARY,
  DESTINATION_TYPE.DESIGN_PROJECT,
  DESTINATION_TYPE.INSPIRATION,
  DESTINATION_TYPE.WORK_TRAY_ONLY,
  DESTINATION_TYPE.APPROVED_MEDIA,
];

export default function AssetIntakeRouter({ object, store }) {
  const dest = object.destinationType || DESTINATION_TYPE.UNDECIDED;

  return (
    <div style={styles.wrap} dir="rtl">
      <AssetOwnershipPanel object={object} store={store} />

      <div style={styles.block}>
        <span style={styles.question}>{INTAKE_HE.destinationQuestion}</span>
        <div style={styles.chips}>
          {DEST_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => store.updateObject(object.objectId, { destinationType: opt })}
              style={{ ...styles.chip, ...(dest === opt ? styles.chipActive : null) }}
            >
              {INTAKE_HE.destinationOptions[opt] || opt}
            </button>
          ))}
        </div>
        <p style={styles.note}>{INTAKE_HE.changeLater}</p>
      </div>
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '16px' },
  block: { display: 'flex', flexDirection: 'column', gap: '10px' },
  question: { fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 700, color: tokens.color.charcoal },
  chips: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  chip: {
    minHeight: '40px', padding: '8px 14px', fontFamily: tokens.font.body, fontSize: '13px', fontWeight: 600,
    color: tokens.color.charcoal, background: tokens.color.canvas, border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: '999px', cursor: 'pointer', whiteSpace: 'nowrap',
  },
  chipActive: { background: tokens.color.goldFaint, border: `1px solid ${tokens.color.gold}` },
  note: { fontFamily: tokens.font.body, fontSize: '12px', color: tokens.color.inkFaint, margin: 0 },
};
