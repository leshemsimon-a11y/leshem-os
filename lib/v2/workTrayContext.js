/**
 * LESHEM.S OS — v2 Work Tray Context
 *
 * Session-level state for the Work Tray (מגש עבודה).
 * NOT persisted to Airtable in v2.1.
 * NOT a shopping cart. No cart/basket/checkout language.
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { getAssetDisplayTitle } from './taxonomyHelpers';

const WorkTrayContext = createContext(null);

export function WorkTrayProvider({ children }) {
  const [items, setItems] = useState([]);

  // Add asset to tray. Prevents duplicates by _airtableId or a fallback key.
  const addItem = useCallback((asset) => {
    if (!asset) return;
    const key = asset._airtableId || asset.title || getAssetDisplayTitle(asset);
    setItems((prev) => {
      const alreadyIn = prev.some(
        (i) => (i._airtableId && i._airtableId === asset._airtableId) ||
               (!i._airtableId && getAssetDisplayTitle(i) === key)
      );
      if (alreadyIn) return prev;
      return [...prev, asset];
    });
  }, []);

  // Remove a single item by _airtableId or index
  const removeItem = useCallback((assetOrId) => {
    setItems((prev) => {
      if (typeof assetOrId === 'number') {
        return prev.filter((_, idx) => idx !== assetOrId);
      }
      const id = assetOrId._airtableId || assetOrId;
      return prev.filter((i) => i._airtableId !== id);
    });
  }, []);

  // Clear entire tray
  const clearTray = useCallback(() => {
    setItems([]);
  }, []);

  // Derived values
  const itemCount = items.length;

  const totalCaratWeight = items.reduce((sum, item) => {
    const carat = parseFloat(item.caratWeight || item.totalCaratWeight || 0);
    return sum + (isNaN(carat) ? 0 : carat);
  }, 0);

  // Cost total — internal only, never rendered in customer-facing views
  const totalCostPrice = items.reduce((sum, item) => {
    const cost = parseFloat(item.costPrice || 0);
    return sum + (isNaN(cost) ? 0 : cost);
  }, 0);

  return (
    <WorkTrayContext.Provider
      value={{
        items,
        itemCount,
        totalCaratWeight: Math.round(totalCaratWeight * 100) / 100,
        totalCostPrice,
        addItem,
        removeItem,
        clearTray,
      }}
    >
      {children}
    </WorkTrayContext.Provider>
  );
}

export function useWorkTray() {
  const ctx = useContext(WorkTrayContext);
  if (!ctx) throw new Error('useWorkTray must be used within WorkTrayProvider');
  return ctx;
}
