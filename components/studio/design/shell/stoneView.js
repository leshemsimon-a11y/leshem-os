// components/studio/design/shell/stoneView.js
//
// LESHEM.S OS — Design Studio Layout Reset.
//
// Shared, read-only view-model for the currently selected stone (top Work
// Tray Ribbon selection). Used by BOTH StudioStonePanel (Zone 2 — left) and
// StudioInspectorDrawer (Zone 4 — right) so the two panels describe the same
// stone consistently instead of duplicating the same mapping twice.
//
// Pure presentation: derives short display strings from data that already
// exists on the tray item / demo stone. It does NOT read or write any store,
// does not mutate anything, and does not invent data — fields that are not
// present are simply omitted (never fabricated placeholders).

import { getSourceLabelHe, getStatusLabelHe, getSourceContextBadge } from '../../../../lib/studio/demoInventoryLayer';
import { getShapeLabel, getStoneTypeLabel, getTreatmentLabel } from '../../../../lib/studio/gemLabels';

// Core fields shown on BOTH panels: title, image, 4-6 compact rows, badges.
// `item` is a real Work Tray item (shape from lib/studio/workTray.js); when
// the Demo Operating Layer is active, `demoStone` is the richer object from
// getDemoInspectStoneFromTrayItem (lib/studio/demoInventoryLayer.js).
export function buildStoneCore(item, demoStone) {
  if (demoStone) {
    const rows = [
      { key: 'stoneType', label: 'סוג אבן', value: demoStone.stoneTypeHe || getStoneTypeLabel(demoStone.stoneType) },
      { key: 'shape', label: 'צורה', value: demoStone.shapeHe || getShapeLabel(demoStone.shape) },
      { key: 'carat', label: 'משקל משוער', value: demoStone.caratLabel },
      { key: 'color', label: 'צבע', value: demoStone.color },
      { key: 'clarity', label: 'ניקיון', value: demoStone.clarity },
      { key: 'treatment', label: 'טיפול', value: getTreatmentLabel(demoStone.treatment) },
    ].filter((r) => r.value && String(r.value).trim());

    return {
      title: demoStone.titleHe || demoStone.title || '—',
      image: demoStone.inspectImage || demoStone.boxImage || null,
      rows,
      badges: [
        getSourceLabelHe(demoStone.sourceType),
        getSourceContextBadge(demoStone.sourceType),
        getStatusLabelHe(demoStone.status),
      ].filter(Boolean),
      isDemo: true,
    };
  }

  if (item) {
    const s = item.snapshot || {};
    const rows = [
      { key: 'stoneType', label: 'סוג אבן', value: s.stoneTypeHe || getStoneTypeLabel(s.stoneType) || s.productTypeHe },
      { key: 'shape', label: 'צורה', value: s.shapeHe || getShapeLabel(s.shape) },
      {
        key: 'carat',
        label: 'משקל',
        value: typeof s.caratWeight === 'number' ? `${s.caratWeight} ct` : null,
      },
      { key: 'color', label: 'צבע', value: s.color },
      { key: 'clarity', label: 'ניקיון', value: s.clarity },
    ].filter((r) => r.value && String(r.value).trim());

    return {
      title: s.name || s.shapeHe || s.stoneTypeHe || 'פריט במגש',
      image: s.primaryImage || null,
      rows,
      badges: [s.statusHe].filter(Boolean),
      isDemo: false,
    };
  }

  return null;
}

// Extra reference fields for the right inspector's collapsed "advanced"
// section. Only meaningful for the richer demo dataset today — real Work
// Tray snapshots (lib/studio/workTray.js assetToTrayItem) don't carry SKU /
// measurements / location / owner yet, so this returns an empty list rather
// than inventing placeholder values.
export function buildStoneAdvanced(demoStone) {
  if (!demoStone) return [];
  return [
    { label: 'מק"ט', value: demoStone.inventoryNo },
    { label: 'מידות', value: demoStone.measurements },
    { label: 'מיקום', value: demoStone.location },
    { label: 'בעלות', value: demoStone.ownerLabel },
  ].filter((r) => r.value && String(r.value).trim());
}
