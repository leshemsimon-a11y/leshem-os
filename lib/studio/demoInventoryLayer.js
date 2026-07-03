// lib/studio/demoInventoryLayer.js
// LESHEM.S OS — Demo Inventory Operating Layer v3
//
// Purpose:
// Make the OS feel active without touching real inventory / Airtable / uploads.
// This layer is temporary, read-mostly, and removable.
// It stores only demo customizations in browser localStorage.

export const ENABLE_DEMO_OPERATING_LAYER = true;

export const DEMO_INVENTORY_STORAGE_KEY = 'leshems_os_demo_inventory_v3';
export const DEMO_WORK_TRAY_STORAGE_KEY = 'leshems_os_demo_work_tray_v3';

const IMAGE_BASE = '/demo-media/gemstones';
const STARTER_BASE = '/assets/leshems/starter-pack-v1/01_stones';

export const demoInventorySeed = Object.freeze([
  {
    id: 'demo-round-brilliant-diamond',
    inventoryNo: 'LSD-DIA-001',
    title: 'Round Brilliant Diamond',
    titleHe: 'יהלום עגול בריליאנט',
    stoneType: 'Diamond',
    stoneTypeHe: 'יהלום',
    species: 'Diamond',
    variety: 'White Diamond',
    shape: 'Round Brilliant',
    shapeHe: 'עגול בריליאנט',
    estimatedCarat: 1.21,
    color: 'D–F / Colorless',
    clarity: 'VS visual quality',
    cutGrade: 'Excellent visual make',
    treatment: 'None',
    measurements: '6.8 × 6.8 × 4.1 mm',
    sourceType: 'owned',
    status: 'selected',
    ownerLabel: 'LESHEM.S stock',
    location: 'Safe / loose stones',
    askingPriceUsd: 7400,
    role: 'centerStone',
    boxImage: `${IMAGE_BASE}/box-view/round-brilliant-diamond-box.webp`,
    thumbImage: `${IMAGE_BASE}/box-view/round-brilliant-diamond-box-thumb.webp`,
    inspectImage: `${IMAGE_BASE}/tweezer-view/round-brilliant-diamond-tweezer.webp`,
    selectedForTray: true,
  },
  {
    id: 'demo-oval-diamond',
    inventoryNo: 'LSD-DIA-002',
    title: 'Oval Diamond',
    titleHe: 'יהלום אובלי',
    stoneType: 'Diamond',
    stoneTypeHe: 'יהלום',
    species: 'Diamond',
    variety: 'White Diamond',
    shape: 'Oval',
    shapeHe: 'אובלי',
    estimatedCarat: 1.55,
    color: 'F–G / White',
    clarity: 'VS visual quality',
    cutGrade: 'Elegant elongated oval',
    treatment: 'None',
    measurements: '8.9 × 6.2 × 3.8 mm',
    sourceType: 'supplier',
    status: 'available',
    ownerLabel: 'Supplier memo',
    location: 'Virtual supplier stock',
    askingPriceUsd: 6800,
    role: 'centerStone',
    boxImage: `${STARTER_BASE}/diamonds/stone_diamond_oval_white_thumb_v01.png`,
    thumbImage: `${STARTER_BASE}/diamonds/stone_diamond_oval_white_thumb_v01.png`,
    inspectImage: `${IMAGE_BASE}/tweezer-view/oval-diamond-tweezer.webp`,
    selectedForTray: true,
  },
  {
    id: 'demo-pear-diamond',
    inventoryNo: 'LSD-DIA-003',
    title: 'Pear Diamond',
    titleHe: 'יהלום אגס',
    stoneType: 'Diamond',
    stoneTypeHe: 'יהלום',
    species: 'Diamond',
    variety: 'White Diamond',
    shape: 'Pear',
    shapeHe: 'אגס',
    estimatedCarat: 1.04,
    color: 'G / White',
    clarity: 'VS–SI visual quality',
    cutGrade: 'Bright pear shape',
    treatment: 'None',
    measurements: '8.1 × 5.5 × 3.4 mm',
    sourceType: 'owned',
    status: 'available',
    ownerLabel: 'LESHEM.S stock',
    location: 'Safe / loose stones',
    askingPriceUsd: 3900,
    role: 'centerStone',
    boxImage: `${IMAGE_BASE}/box-view/pear-diamond-box.webp`,
    thumbImage: `${IMAGE_BASE}/box-view/pear-diamond-box-thumb.webp`,
    inspectImage: `${IMAGE_BASE}/tweezer-view/pear-diamond-tweezer.webp`,
    selectedForTray: false,
  },
  {
    id: 'demo-emerald-cut-diamond',
    inventoryNo: 'LSD-DIA-004',
    title: 'Emerald-Cut Diamond',
    titleHe: 'יהלום אמרלד קאט',
    stoneType: 'Diamond',
    stoneTypeHe: 'יהלום',
    species: 'Diamond',
    variety: 'White Diamond',
    shape: 'Emerald Cut',
    shapeHe: 'אמרלד קאט',
    estimatedCarat: 1.72,
    color: 'E–F / Colorless',
    clarity: 'VVS–VS visual quality',
    cutGrade: 'Clean step-cut look',
    treatment: 'None',
    measurements: '7.5 × 5.6 × 3.6 mm',
    sourceType: 'client-owned',
    status: 'in-design',
    ownerLabel: 'Client stone',
    location: 'Client work envelope',
    askingPriceUsd: 9200,
    role: 'centerStone',
    boxImage: `${IMAGE_BASE}/box-view/emerald-cut-diamond-box.webp`,
    thumbImage: `${IMAGE_BASE}/box-view/emerald-cut-diamond-box-thumb.webp`,
    inspectImage: `${IMAGE_BASE}/tweezer-view/emerald-cut-diamond-tweezer.webp`,
    selectedForTray: true,
  },
  {
    id: 'demo-cushion-diamond',
    inventoryNo: 'LSD-DIA-005',
    title: 'Cushion Diamond',
    titleHe: 'יהלום כרית',
    stoneType: 'Diamond',
    stoneTypeHe: 'יהלום',
    species: 'Diamond',
    variety: 'White Diamond',
    shape: 'Cushion',
    shapeHe: 'כרית',
    estimatedCarat: 1.36,
    color: 'G–H / White',
    clarity: 'VS visual quality',
    cutGrade: 'Soft cushion brilliance',
    treatment: 'None',
    measurements: '6.4 × 6.1 × 4.0 mm',
    sourceType: 'owned',
    status: 'reserved',
    ownerLabel: 'LESHEM.S stock',
    location: 'Reserved tray',
    askingPriceUsd: 5200,
    role: 'centerStone',
    boxImage: `${IMAGE_BASE}/box-view/cushion-diamond-box.webp`,
    thumbImage: `${IMAGE_BASE}/box-view/cushion-diamond-box-thumb.webp`,
    inspectImage: `${IMAGE_BASE}/tweezer-view/cushion-diamond-tweezer.webp`,
    selectedForTray: false,
  },
  {
    id: 'demo-oval-emerald',
    inventoryNo: 'LSE-EMR-001',
    title: 'Oval Emerald',
    titleHe: 'אמרלד אובלי',
    stoneType: 'Emerald',
    stoneTypeHe: 'אמרלד',
    species: 'Beryl',
    variety: 'Emerald',
    shape: 'Oval',
    shapeHe: 'אובלי',
    estimatedCarat: 2.35,
    color: 'Vivid Green',
    clarity: 'Natural jardin visible',
    cutGrade: 'Bright commercial oval',
    treatment: 'Minor oil / demo assumption',
    measurements: '9.1 × 7.0 × 4.6 mm',
    sourceType: 'owned',
    status: 'selected',
    ownerLabel: 'LESHEM.S stock',
    location: 'Colored stones box A',
    askingPriceUsd: 4800,
    role: 'centerStone',
    boxImage: `${IMAGE_BASE}/box-view/oval-emerald-box.webp`,
    thumbImage: `${IMAGE_BASE}/box-view/oval-emerald-box-thumb.webp`,
    inspectImage: `${IMAGE_BASE}/tweezer-view/cushion-emerald-tweezer-alt.webp`,
    selectedForTray: true,
  },
  {
    id: 'demo-emerald-cut-emerald',
    inventoryNo: 'LSE-EMR-002',
    title: 'Emerald-Cut Emerald',
    titleHe: 'אמרלד קאט אמרלד',
    stoneType: 'Emerald',
    stoneTypeHe: 'אמרלד',
    species: 'Beryl',
    variety: 'Emerald',
    shape: 'Emerald Cut',
    shapeHe: 'אמרלד קאט',
    estimatedCarat: 2.92,
    color: 'Rich Green',
    clarity: 'Natural jardin visible',
    cutGrade: 'Classic rectangular step cut',
    treatment: 'Minor oil / demo assumption',
    measurements: '9.4 × 6.8 × 4.5 mm',
    sourceType: 'supplier',
    status: 'available',
    ownerLabel: 'Supplier memo',
    location: 'Virtual supplier stock',
    askingPriceUsd: 6200,
    role: 'centerStone',
    boxImage: `${IMAGE_BASE}/box-view/emerald-cut-emerald-box.webp`,
    thumbImage: `${IMAGE_BASE}/box-view/emerald-cut-emerald-box-thumb.webp`,
    inspectImage: `${IMAGE_BASE}/tweezer-view/cushion-emerald-tweezer-alt.webp`,
    selectedForTray: false,
  },
  {
    id: 'demo-cushion-ruby',
    inventoryNo: 'LSR-RUB-001',
    title: 'Cushion Ruby',
    titleHe: 'רובי כרית',
    stoneType: 'Ruby',
    stoneTypeHe: 'רובי',
    species: 'Corundum',
    variety: 'Ruby',
    shape: 'Cushion',
    shapeHe: 'כרית',
    estimatedCarat: 2.18,
    color: 'Rich Red',
    clarity: 'Included natural character',
    cutGrade: 'Bold cushion presence',
    treatment: 'Heat unknown / demo assumption',
    measurements: '7.7 × 6.6 × 4.3 mm',
    sourceType: 'owned',
    status: 'in-design',
    ownerLabel: 'LESHEM.S stock',
    location: 'Colored stones box B',
    askingPriceUsd: 3900,
    role: 'centerStone',
    boxImage: `${IMAGE_BASE}/box-view/cushion-ruby-box.webp`,
    thumbImage: `${IMAGE_BASE}/box-view/cushion-ruby-box-thumb.webp`,
    inspectImage: `${IMAGE_BASE}/tweezer-view/cushion-ruby-tweezer.webp`,
    selectedForTray: true,
  },
  {
    id: 'demo-oval-blue-sapphire',
    inventoryNo: 'LSS-SAP-001',
    title: 'Oval Blue Sapphire',
    titleHe: 'ספיר כחול אובלי',
    stoneType: 'Sapphire',
    stoneTypeHe: 'ספיר',
    species: 'Corundum',
    variety: 'Blue Sapphire',
    shape: 'Oval',
    shapeHe: 'אובלי',
    estimatedCarat: 2.64,
    color: 'Royal Blue',
    clarity: 'Eye-clean visual quality',
    cutGrade: 'Deep royal oval',
    treatment: 'Heat unknown / demo assumption',
    measurements: '8.8 × 6.9 × 4.7 mm',
    sourceType: 'supplier',
    status: 'available',
    ownerLabel: 'Supplier memo',
    location: 'Virtual supplier stock',
    askingPriceUsd: 3300,
    role: 'centerStone',
    boxImage: `${IMAGE_BASE}/box-view/oval-blue-sapphire-box.webp`,
    thumbImage: `${IMAGE_BASE}/box-view/oval-blue-sapphire-box-thumb.webp`,
    inspectImage: `${IMAGE_BASE}/tweezer-view/oval-blue-sapphire-tweezer.webp`,
    selectedForTray: false,
  },
  {
    id: 'demo-oval-paraiba-tourmaline',
    inventoryNo: 'LST-PAR-001',
    title: 'Oval Paraiba Tourmaline',
    titleHe: 'טורמלין פראיבה אובלי',
    stoneType: 'Paraiba Tourmaline',
    stoneTypeHe: 'טורמלין פראיבה',
    species: 'Tourmaline',
    variety: 'Paraiba Tourmaline',
    shape: 'Oval',
    shapeHe: 'אובלי',
    estimatedCarat: 3.08,
    color: 'Neon Blue-Green',
    clarity: 'Included natural character',
    cutGrade: 'Large vivid oval',
    treatment: 'Copper-bearing / demo assumption',
    measurements: '10.1 × 8.0 × 5.2 mm',
    sourceType: 'client-owned',
    status: 'selected',
    ownerLabel: 'Client stone',
    location: 'Client work envelope',
    askingPriceUsd: 12800,
    role: 'centerStone',
    boxImage: `${IMAGE_BASE}/box-view/oval-paraiba-tourmaline-box.webp`,
    thumbImage: `${IMAGE_BASE}/box-view/oval-paraiba-tourmaline-box-thumb.webp`,
    inspectImage: `${IMAGE_BASE}/tweezer-view/oval-paraiba-tourmaline-tweezer.webp`,
    selectedForTray: true,
  },
]);

function canUseStorage() {
  return typeof window !== 'undefined' && window.localStorage;
}

function safeJsonParse(raw, fallback) {
  try {
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch (e) {
    return fallback;
  }
}

function normalizeNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function mergeOverrides(item, override) {
  if (!override || typeof override !== 'object') return { ...item };
  return {
    ...item,
    ...override,
    estimatedCarat: normalizeNumber(override.estimatedCarat, item.estimatedCarat),
    askingPriceUsd: normalizeNumber(override.askingPriceUsd, item.askingPriceUsd),
    id: item.id,
    boxImage: item.boxImage,
    thumbImage: item.thumbImage,
    inspectImage: item.inspectImage,
    temporaryOnly: true,
    isDemoAsset: true,
  };
}

export function getDemoInventorySnapshot() {
  const saved = canUseStorage()
    ? safeJsonParse(window.localStorage.getItem(DEMO_INVENTORY_STORAGE_KEY), {})
    : {};
  const overrides = saved && saved.overrides && typeof saved.overrides === 'object' ? saved.overrides : {};
  const selection = saved && saved.selection && typeof saved.selection === 'object' ? saved.selection : {};

  return demoInventorySeed.map((item) => {
    const merged = mergeOverrides(item, overrides[item.id]);
    const selected = Object.prototype.hasOwnProperty.call(selection, item.id)
      ? Boolean(selection[item.id])
      : Boolean(item.selectedForTray);
    return {
      ...merged,
      selectedForTray: selected,
      temporaryOnly: true,
      isDemoAsset: true,
    };
  });
}

export function saveDemoInventorySnapshot(items) {
  if (!canUseStorage()) return;
  const arr = Array.isArray(items) ? items : [];
  const seedById = new Map(demoInventorySeed.map((item) => [item.id, item]));
  const overrides = {};
  const selection = {};

  arr.forEach((item) => {
    if (!item || !item.id || !seedById.has(item.id)) return;
    const seed = seedById.get(item.id);
    selection[item.id] = Boolean(item.selectedForTray);
    overrides[item.id] = {
      titleHe: item.titleHe,
      estimatedCarat: normalizeNumber(item.estimatedCarat, seed.estimatedCarat),
      color: item.color,
      clarity: item.clarity,
      treatment: item.treatment,
      sourceType: item.sourceType,
      status: item.status,
      ownerLabel: item.ownerLabel,
      location: item.location,
      askingPriceUsd: normalizeNumber(item.askingPriceUsd, seed.askingPriceUsd),
      notes: item.notes || '',
    };
  });

  window.localStorage.setItem(
    DEMO_INVENTORY_STORAGE_KEY,
    JSON.stringify({ savedAt: new Date().toISOString(), overrides, selection })
  );
  window.localStorage.setItem(DEMO_WORK_TRAY_STORAGE_KEY, JSON.stringify(selection));
}

export function resetDemoInventorySnapshot() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(DEMO_INVENTORY_STORAGE_KEY);
  window.localStorage.removeItem(DEMO_WORK_TRAY_STORAGE_KEY);
}

export function getDemoInventoryItemById(id) {
  return getDemoInventorySnapshot().find((item) => item.id === id) || null;
}

export function toStudioTrayItem(item) {
  if (!item) return null;
  return {
    id: item.id,
    role: item.role || 'centerStone',
    source: 'demo-inventory-layer',
    temporaryOnly: true,
    isDemoAsset: true,
    demoInventoryItem: item,
    snapshot: {
      name: item.titleHe || item.title,
      stoneType: item.stoneType,
      stoneTypeHe: item.stoneTypeHe,
      shape: item.shape,
      shapeHe: item.shapeHe,
      caratWeight: normalizeNumber(item.estimatedCarat, 0),
      color: item.color,
      clarity: item.clarity,
      treatment: item.treatment,
      sourceType: item.sourceType,
      status: item.status,
      inventoryNo: item.inventoryNo,
      primaryImage: item.thumbImage || item.boxImage,
    },
  };
}

export function getDemoStudioTrayItems(limit = 6) {
  const all = getDemoInventorySnapshot();
  const selected = all.filter((item) => item.selectedForTray);
  const fallback = selected.length > 0 ? selected : all.slice(0, 5);
  return fallback.slice(0, limit).map(toStudioTrayItem).filter(Boolean);
}

export function getDemoInspectStoneFromTrayItem(item) {
  if (!item) return null;
  const inv = item.demoInventoryItem || getDemoInventoryItemById(item.id);
  if (!inv) return null;
  return {
    ...inv,
    boxThumb: inv.thumbImage || inv.boxImage,
    boxImage: inv.boxImage || inv.thumbImage,
    inspectImage: inv.inspectImage || inv.boxImage || inv.thumbImage,
    caratLabel: `${inv.estimatedCarat} ct`,
  };
}

export function getDemoActivityFeed() {
  const items = getDemoInventorySnapshot();
  const selected = items.filter((item) => item.selectedForTray);
  return [
    {
      id: 'activity-selected-count',
      textHe: `${selected.length || 0} אבני דמו מוכנות במגש העבודה`,
      tone: 'work-tray',
    },
    {
      id: 'activity-emerald',
      textHe: 'אמרלד אובלי נוסף למלאי הדמו',
      tone: 'inventory',
    },
    {
      id: 'activity-ruby',
      textHe: 'רובי כרית נשלח ל־Work Tray',
      tone: 'work-tray',
    },
    {
      id: 'activity-diamond',
      textHe: 'יהלום אמרלד קאט פתוח למצב Inspect',
      tone: 'inspect',
    },
    {
      id: 'activity-sapphire',
      textHe: 'ספיר כחול מסומן כ־Supplier Available',
      tone: 'supplier',
    },
  ];
}

export function getSourceLabelHe(sourceType) {
  if (sourceType === 'supplier') return 'ספק / וירטואלי';
  if (sourceType === 'client-owned') return 'אבן לקוח';
  return 'מלאי שלנו';
}

export function getStatusLabelHe(status) {
  if (status === 'selected') return 'נבחרה';
  if (status === 'in-design') return 'בעיצוב';
  if (status === 'reserved') return 'שמורה';
  return 'זמינה';
}
