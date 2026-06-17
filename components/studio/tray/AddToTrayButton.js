// components/studio/tray/AddToTrayButton.js
//
// LESHEM.S OS — Add to Work Tray button (Clean 3)
//
// A REAL, working, thumb-friendly action (not a future placeholder). Lives in
// the Asset Drawer. Toggles the current asset in/out of the Work Tray and
// reflects state: "הוסף למגש עבודה" → once added → "במגש העבודה ✓" with a
// secondary "הסר מהמגש" affordance.
//
// Uses the workTray store via the React hook factory. No network, no Airtable,
// no commerce language.

import { useMemo, useState, useEffect, useRef } from 'react';
import * as React from 'react';
import { tokens } from '../shared/tokens';
import { TRAY_HE } from '../../../lib/studio/labels';
import { createUseWorkTray } from '../../../lib/studio/workTray';

const useWorkTray = createUseWorkTray(React);

export default function AddToTrayButton({ asset, block = true }) {
  const tray = useWorkTray();
  const [justAdded, setJustAdded] = useState(false);
  const timerRef = useRef(null);

  const inTray = useMemo(() => {
    if (!asset) return false;
    return tray.items.some((it) => it.id === asset.key);
  }, [asset, tray.items]);

  // Clear any pending timer on unmount or when switching asset.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    // Reset the transient confirmation if the drawer switches to another asset.
    setJustAdded(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [asset && asset.key]);

  if (!asset) return null;

  const handleAdd = () => {
    tray.add(asset);
    setJustAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setJustAdded(false), 2200);
  };
  const handleRemove = () => {
    setJustAdded(false);
    tray.remove(asset.key);
  };

  if (inTray) {
    return (
      <div style={{ ...styles.wrap, ...(block ? styles.block : null) }} dir="rtl">
        <div style={styles.inTrayBadge} aria-live="polite">
          <span style={styles.check} aria-hidden="true">
            ✓
          </span>
          <span>{justAdded ? TRAY_HE.added : TRAY_HE.inTray}</span>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          style={styles.removeBtn}
        >
          {TRAY_HE.removeFromTray}
        </button>
      </div>
    );
  }

  return (
    <div style={{ ...styles.wrap, ...(block ? styles.block : null) }} dir="rtl">
      <button
        type="button"
        onClick={handleAdd}
        style={{ ...styles.addBtn, ...(block ? styles.addBtnBlock : null) }}
      >
        <span style={styles.plus} aria-hidden="true">
          ＋
        </span>
        <span>{TRAY_HE.addToTray}</span>
      </button>
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  block: {
    width: '100%',
  },
  addBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    minHeight: '48px',
    padding: '12px 22px',
    fontFamily: tokens.font.body,
    fontSize: '15px',
    fontWeight: 600,
    color: tokens.color.ivory,
    background: tokens.color.charcoal,
    border: 'none',
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
    boxShadow: tokens.shadow.soft,
    transition: 'background 140ms ease, transform 140ms ease',
  },
  addBtnBlock: {
    width: '100%',
  },
  plus: {
    fontSize: '17px',
    lineHeight: 1,
    color: tokens.color.goldSoft,
  },
  inTrayBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    minHeight: '48px',
    padding: '12px 20px',
    fontFamily: tokens.font.body,
    fontSize: '15px',
    fontWeight: 600,
    color: tokens.color.charcoal,
    background: tokens.color.goldFaint,
    border: `1px solid ${tokens.color.goldSoft}`,
    borderRadius: tokens.radius.md,
    flex: 1,
    justifyContent: 'center',
  },
  check: {
    color: tokens.color.gold,
    fontSize: '16px',
    lineHeight: 1,
  },
  removeBtn: {
    minHeight: '48px',
    padding: '12px 18px',
    fontFamily: tokens.font.body,
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.color.inkSoft,
    background: tokens.color.canvas,
    border: `1px solid ${tokens.color.cardEdge}`,
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
};
