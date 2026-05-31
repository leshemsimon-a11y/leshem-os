/**
 * LESHEM.S OS — v2 Taxonomy Helpers
 * Pure functions only. No side effects. No API calls.
 * UI labels may be Hebrew. Report/certificate-facing helpers return English only.
 * Shape is customer-facing. Cut/Form is secondary/internal unless explicitly needed.
 * Natural diamond is represented by: category=white_diamond + origin=natural + type=diamond.
 * Geographic origin is separate from Natural/Lab-Grown origin.
 */

const STONE_CATEGORY_LABELS = {
  white_diamond:       { he: 'יהלום לבן', en: 'White Diamond' },
  fancy_color_diamond: { he: 'יהלום פנסי', en: 'Fancy Color Diamond' },
  colored_gemstone:    { he: 'אבן חן צבעונית', en: 'Colored Gemstone' },
};

const ORIGIN_GROWTH_LABELS = {
  natural:   { he: 'טבעי', en: 'Natural' },
  lab_grown: { he: 'מעבדה', en: 'Laboratory-Grown' },
};

const STONE_TYPE_LABELS = {
  diamond:     { he: 'יהלום', en: 'Diamond' },
  sapphire:    { he: 'ספיר', en: 'Sapphire' },
  ruby:        { he: 'רובי', en: 'Ruby' },
  emerald:     { he: 'אמרלד', en: 'Emerald' },
  spinel:      { he: 'ספינל', en: 'Spinel' },
  tourmaline:  { he: 'טורמלין', en: 'Tourmaline' },
  tanzanite:   { he: 'טנזניט', en: 'Tanzanite' },
  alexandrite: { he: 'אלכסנדריט', en: 'Alexandrite' },
  aquamarine:  { he: 'אקוומרין', en: 'Aquamarine' },
  other:       { he: 'אחר', en: 'Other' },
};

const SHAPE_LABELS = {
  round:    { he: 'עגול', en: 'Round' },
  oval:     { he: 'אובל', en: 'Oval' },
  emerald:  { he: 'אמרלד קאט', en: 'Emerald Cut' },
  cushion:  { he: 'כרית', en: 'Cushion' },
  radiant:  { he: 'רדיאנט', en: 'Radiant' },
  pear:     { he: 'אגס', en: 'Pear' },
  marquise: { he: 'מרקיז', en: 'Marquise' },
  princess: { he: 'פרינסס', en: 'Princess' },
  heart:    { he: 'לב', en: 'Heart' },
  asscher:  { he: 'אשר', en: 'Asscher' },
  trillion: { he: 'טריליון', en: 'Trillion' },
  baguette: { he: 'באגט', en: 'Baguette' },
  other:    { he: 'אחר', en: 'Other' },
};

const CUT_FORM_LABELS = {
  faceted:  { he: 'Faceted', en: 'Faceted' },
  cabochon: { he: 'קבושון', en: 'Cabochon' },
  rough:    { he: 'גולמי', en: 'Rough' },
  carved:   { he: 'מגולף', en: 'Carved' },
  bead:     { he: 'חרוז', en: 'Bead' },
  other:    { he: 'אחר', en: 'Other' },
};

const INVENTORY_LAYER_LABELS = {
  physical_stock:   { he: 'מלאי פיזי', en: 'Physical Stock' },
  virtual_supplier: { he: 'מלאי וירטואלי מספק', en: 'Virtual Supplier Stock' },
  client_owned:     { he: 'פריט של לקוח', en: 'Client-Owned Item' },
};

const STATUS_LABELS = {
  available: { he: 'זמין', en: 'Available' },
  reserved:  { he: 'שמור', en: 'Reserved' },
  in_use:    { he: 'בשימוש', en: 'In Use' },
  sold:      { he: 'נמכר', en: 'Sold' },
  returned:  { he: 'הוחזר', en: 'Returned' },
  archived:  { he: 'בארכיון', en: 'Archived' },
};

const GEO_ORIGIN_LABELS = {
  sri_lanka: 'Sri Lanka',
  burma: 'Burma (Myanmar)',
  myanmar: 'Myanmar',
  colombia: 'Colombia',
  brazil: 'Brazil',
  mozambique: 'Mozambique',
  madagascar: 'Madagascar',
  kashmir: 'Kashmir',
  thailand: 'Thailand',
  zambia: 'Zambia',
  tanzania: 'Tanzania',
  other: 'Other',
};

export function getStoneCategoryLabel(value, lang = 'he') {
  const key = normalizeStoneCategory(value) || value;
  const entry = STONE_CATEGORY_LABELS[key];
  return entry ? (entry[lang] || entry.en) : (value || '');
}

export function getOriginGrowthLabel(value, lang = 'he') {
  const key = normalizeOrigin(value) || value;
  const entry = ORIGIN_GROWTH_LABELS[key];
  return entry ? (entry[lang] || entry.en) : (value || '');
}

export function getStoneTypeLabel(value, lang = 'he') {
  const key = normalizeStoneType(value) || value;
  const entry = STONE_TYPE_LABELS[key];
  return entry ? (entry[lang] || entry.en) : (value || '');
}

export function getShapeLabel(value, lang = 'he') {
  const key = normalizeShape(value) || value;
  const entry = SHAPE_LABELS[key];
  return entry ? (entry[lang] || entry.en) : (value || '');
}

export function getCutFormLabel(value, lang = 'he') {
  const key = normalizeCutForm(value) || value;
  const entry = CUT_FORM_LABELS[key];
  return entry ? (entry[lang] || entry.en) : (value || '');
}

export function getInventoryLayerLabel(value, lang = 'he') {
  const key = normalizeInventoryLayer(value) || value;
  const entry = INVENTORY_LAYER_LABELS[key];
  return entry ? (entry[lang] || entry.en) : (value || '');
}

export function getStatusLabel(value, lang = 'he') {
  const key = normalizeStatus(value) || value;
  const entry = STATUS_LABELS[key];
  return entry ? (entry[lang] || entry.en) : (value || '');
}

export function getGeographicOriginLabel(value) {
  const key = normalizeKey(value);
  return GEO_ORIGIN_LABELS[key] || value || '';
}

function normalizeKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\\/_]+/g, ' ')
    .replace(/[\-–—]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function includesAny(key, terms) {
  return terms.some((term) => key.includes(term));
}

export function normalizeStoneCategory(value, productType = '') {
  const key = normalizeKey(`${value || ''} ${productType || ''}`);
  if (!key) return '';
  if (includesAny(key, ['fancy color', 'פנסי'])) return 'fancy_color_diamond';
  if (includesAny(key, ['colored gemstone', 'gemstone', 'אבן חן', 'ruby', 'sapphire', 'emerald', 'spinel', 'tourmaline', 'tanzanite'])) return 'colored_gemstone';
  if (includesAny(key, ['diamond', 'יהלום'])) return 'white_diamond';
  return value || '';
}

export function normalizeOrigin(value, productType = '') {
  const key = normalizeKey(`${value || ''} ${productType || ''}`);
  if (!key) return '';
  if (includesAny(key, ['lab grown', 'laboratory grown', 'lab', 'מעבדה'])) return 'lab_grown';
  if (includesAny(key, ['natural', 'טבעי'])) return 'natural';
  return value || '';
}

export function normalizeStoneType(value, productType = '') {
  const key = normalizeKey(`${value || ''} ${productType || ''}`);
  if (!key) return '';
  if (includesAny(key, ['diamond', 'יהלום'])) return 'diamond';
  if (includesAny(key, ['sapphire', 'ספיר'])) return 'sapphire';
  if (includesAny(key, ['ruby', 'רובי'])) return 'ruby';
  if (includesAny(key, ['emerald', 'אמרלד'])) return 'emerald';
  if (includesAny(key, ['spinel', 'ספינל'])) return 'spinel';
  if (includesAny(key, ['tourmaline', 'טורמלין'])) return 'tourmaline';
  if (includesAny(key, ['tanzanite', 'טנזניט'])) return 'tanzanite';
  if (includesAny(key, ['alexandrite', 'אלכסנדריט'])) return 'alexandrite';
  if (includesAny(key, ['aquamarine', 'אקוומרין'])) return 'aquamarine';
  return value || '';
}

export function normalizeShape(value) {
  const key = normalizeKey(value);
  if (!key) return '';
  if (includesAny(key, ['round', 'עגול'])) return 'round';
  if (includesAny(key, ['oval', 'אובל'])) return 'oval';
  if (includesAny(key, ['emerald'])) return 'emerald';
  if (includesAny(key, ['cushion', 'כרית'])) return 'cushion';
  if (includesAny(key, ['radiant', 'רדיאנט'])) return 'radiant';
  if (includesAny(key, ['pear', 'אגס'])) return 'pear';
  if (includesAny(key, ['marquise', 'מרקיז'])) return 'marquise';
  if (includesAny(key, ['princess', 'פרינסס'])) return 'princess';
  if (includesAny(key, ['heart', 'לב'])) return 'heart';
  if (includesAny(key, ['asscher', 'אשר'])) return 'asscher';
  if (includesAny(key, ['trillion', 'trilliant', 'טריליון'])) return 'trillion';
  if (includesAny(key, ['baguette', 'באגט'])) return 'baguette';
  return value || '';
}

export function normalizeCutForm(value) {
  const key = normalizeKey(value);
  if (!key) return '';
  if (includesAny(key, ['faceted', 'facet'])) return 'faceted';
  if (includesAny(key, ['cabochon', 'קבושון'])) return 'cabochon';
  if (includesAny(key, ['rough', 'גולמי'])) return 'rough';
  if (includesAny(key, ['carved', 'מגולף'])) return 'carved';
  if (includesAny(key, ['bead', 'חרוז'])) return 'bead';
  return value || '';
}

export function normalizeInventoryLayer(value) {
  const key = normalizeKey(value);
  if (!key) return '';
  if (includesAny(key, ['physical', 'owned physical', 'מלאי פיזי'])) return 'physical_stock';
  if (includesAny(key, ['virtual', 'supplier', 'ספק'])) return 'virtual_supplier';
  if (includesAny(key, ['client', 'לקוח'])) return 'client_owned';
  return value || '';
}

export function normalizeStatus(value) {
  const key = normalizeKey(value);
  if (!key) return '';
  if (includesAny(key, ['available', 'זמין'])) return 'available';
  if (includesAny(key, ['reserved', 'שמור'])) return 'reserved';
  if (includesAny(key, ['in use', 'mounted', 'בשימוש'])) return 'in_use';
  if (includesAny(key, ['sold', 'נמכר'])) return 'sold';
  if (includesAny(key, ['returned', 'הוחזר'])) return 'returned';
  if (includesAny(key, ['archived', 'ארכיון'])) return 'archived';
  return value || '';
}

export function normalizeAssetType(value, productType = '') {
  const key = normalizeKey(`${value || ''} ${productType || ''}`);
  if (includesAny(key, ['parcel', 'melee', 'חבילה'])) return 'parcel';
  if (includesAny(key, ['jewelry part', 'component', 'chain', 'setting', 'mount', 'חלק'])) return 'part';
  if (includesAny(key, ['finished jewelry', 'jewelry', 'תכשיט גמור'])) return 'finished_jewelry';
  return 'stone';
}

function parseNumber(value) {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value === 'number') return value;
  const cleaned = String(value).replace(/[$,]/g, '').trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : value;
}

export const FIELD_MAP = {
  airtableId: ['id', 'ID', 'Record ID'],
  productType: ['סוג מוצר מדויק', 'Product Type', 'productType'],
  assetType: ['סוג פריט', 'Asset Type', 'assetType', 'type', 'Type'],
  stoneCategory: ['קטגוריית אבן', 'Stone Category', 'stoneCategory'],
  origin: ['מקור / גידול', 'מקור גידול', 'Natural / Lab-Grown', 'Origin / Growth', 'מקור', 'origin', 'Origin'],
  stoneType: ['סוג אבן', 'Stone Type', 'stoneType'],
  shape: ['צורה \\ ליטוש', 'צורה / ליטוש', 'צורה', 'Shape', 'shape'],
  cutForm: ['Cut / Form', 'cutForm'],
  caratWeight: ['משקל קראט סה"כ', 'משקל קראט', 'קרט', 'Carat Weight', 'Carat', 'caratWeight'],
  totalCaratWeight: ['משקל קראט סה"כ', 'משקל כולל', 'Total Carat', 'totalCaratWeight'],
  stoneCount: ['מספר אבנים', 'Stone Count', 'Quantity', 'quantity'],
  color: ['צבע', 'צבע ', 'Colour', 'Color', 'color'],
  clarity: ['ניקיון', 'Clarity', 'clarity'],
  cut: ['Cut Grade', 'קאט', 'cut', 'Cut'],
  polish: ['Polish', 'פוליש', 'polish'],
  symmetry: ['Symmetry', 'סימטריה', 'symmetry'],
  fluorescence: ['Fluorescence', 'עוצמת פלורסנציה', 'פלואורסנציה', 'fluorescence'],
  measurements: ['מידות', 'Measurements', 'measurements'],
  depthPercent: ['Depth %', 'עומק אחוז', 'depthPercent'],
  tablePercent: ['Table %', 'שולחן אחוז', 'tablePercent'],
  labName: ['מקור תעודה', 'מעבדה', 'Lab', 'Lab Name', 'labName'],
  reportNumber: ['מספר תעודה', 'חריטת לייזר', 'Report Number', 'Certificate Number', 'reportNumber'],
  inventoryLayer: ['שכבת מלאי', 'Inventory Layer', 'inventoryLayer'],
  status: ['סטטוס מלאי', 'סטטוס', 'Status', 'status'],
  internalNotes: ['Internal Notes', 'הערות פנימיות', 'internalNotes'],
  costPrice: ['עלות בדולר', 'מחיר עלות', 'Cost Price', 'costPrice'],
  askingPrice: ['מחיר מבוקש', 'Asking Price', 'askingPrice'],
  supplierName: ['שם ספק', 'ספק וירטואלי', 'Supplier', 'supplierName'],
  imageUrl: ['תמונה לתעודה', 'תמונות \\ וידאו מלאי', 'תמונה', 'Image', 'Photo', 'imageUrl'],
  fancyColorIntensity: ['Fancy Color Intensity', 'עוצמת צבע פנסי', 'fancyColorIntensity'],
  fancyColorHue: ['Fancy Color Hue', 'גוון צבע פנסי', 'fancyColorHue'],
  fancyColorOvertone: ['Fancy Color Overtone', 'גוון משני פנסי', 'fancyColorOvertone'],
  geographicOrigin: ['ארץ מקור', 'מקור גאוגרפי', 'Geographic Origin', 'geographicOrigin'],
  title: ['תיאור פריט', 'שם', 'Title', 'Name', 'title'],
  createdAt: ['תאריך יצירה', 'Created', 'Created At', 'createdAt'],
};

export function getField(record, canonicalKey) {
  if (!record) return undefined;
  const aliases = FIELD_MAP[canonicalKey] || [canonicalKey];
  for (const alias of aliases) {
    if (record[alias] !== undefined && record[alias] !== null && record[alias] !== '') return record[alias];
  }
  // Airtable / CSV sometimes changes slash direction or adds trailing spaces. Try a trimmed lookup.
  const normalizedEntries = Object.entries(record).map(([k, v]) => [String(k).trim(), v]);
  for (const alias of aliases) {
    const target = String(alias).trim();
    const found = normalizedEntries.find(([k, v]) => k === target && v !== undefined && v !== null && v !== '');
    if (found) return found[1];
  }
  return undefined;
}

export function normalizeAsset(record) {
  if (!record) return null;
  const fields = record.fields || record;
  const airtableId = record.id || fields.id;

  const productTypeRaw = getField(fields, 'productType');
  const assetTypeRaw = getField(fields, 'assetType');
  const stoneTypeRaw = getField(fields, 'stoneType');
  const categoryRaw = getField(fields, 'stoneCategory');
  const originRaw = getField(fields, 'origin');
  const shapeRaw = getField(fields, 'shape');
  const layerRaw = getField(fields, 'inventoryLayer');
  const statusRaw = getField(fields, 'status');
  const cutFormRaw = getField(fields, 'cutForm');

  const assetType = normalizeAssetType(assetTypeRaw, productTypeRaw);
  const stoneCategory = normalizeStoneCategory(categoryRaw || productTypeRaw, productTypeRaw);
  const origin = normalizeOrigin(originRaw || productTypeRaw, productTypeRaw) || (stoneCategory === 'colored_gemstone' ? 'natural' : '');
  const stoneType = normalizeStoneType(stoneTypeRaw || productTypeRaw, productTypeRaw) || (stoneCategory === 'white_diamond' || stoneCategory === 'fancy_color_diamond' ? 'diamond' : '');
  const shape = normalizeShape(shapeRaw);

  return {
    _airtableId: airtableId,
    _raw: record,
    productType: productTypeRaw,
    assetType,
    stoneCategory,
    origin,
    stoneType,
    shape,
    cutForm: normalizeCutForm(cutFormRaw),
    caratWeight: parseNumber(getField(fields, 'caratWeight')),
    totalCaratWeight: parseNumber(getField(fields, 'totalCaratWeight') || getField(fields, 'caratWeight')),
    stoneCount: parseNumber(getField(fields, 'stoneCount')),
    color: getField(fields, 'color'),
    clarity: getField(fields, 'clarity'),
    cut: getField(fields, 'cut'),
    polish: getField(fields, 'polish'),
    symmetry: getField(fields, 'symmetry'),
    fluorescence: getField(fields, 'fluorescence'),
    measurements: getField(fields, 'measurements'),
    depthPercent: getField(fields, 'depthPercent'),
    tablePercent: getField(fields, 'tablePercent'),
    labName: getField(fields, 'labName'),
    reportNumber: getField(fields, 'reportNumber'),
    inventoryLayer: normalizeInventoryLayer(layerRaw),
    status: normalizeStatus(statusRaw),
    internalNotes: getField(fields, 'internalNotes'),
    costPrice: parseNumber(getField(fields, 'costPrice')),
    askingPrice: parseNumber(getField(fields, 'askingPrice')),
    supplierName: getField(fields, 'supplierName'),
    imageUrl: getField(fields, 'imageUrl'),
    fancyColorIntensity: getField(fields, 'fancyColorIntensity'),
    fancyColorHue: getField(fields, 'fancyColorHue'),
    fancyColorOvertone: getField(fields, 'fancyColorOvertone'),
    geographicOrigin: getField(fields, 'geographicOrigin'),
    title: getField(fields, 'title'),
    createdAt: getField(fields, 'createdAt'),
  };
}

export function getAssetDisplayTitle(asset) {
  if (!asset) return '';
  if (asset.assetType === 'finished_jewelry') return asset.title || 'תכשיט';
  if (asset.assetType === 'part') return asset.title || 'רכיב תכשיט';
  if (asset.assetType === 'parcel') {
    const stone = getStoneTypeLabel(asset.stoneType, 'he') || 'אבנים';
    const shape = getShapeLabel(asset.shape, 'he');
    const carat = asset.totalCaratWeight || asset.caratWeight;
    return [stone, shape, carat ? `${carat} קרט כולל` : ''].filter(Boolean).join(' · ') || 'חבילת אבנים';
  }
  const origin = getOriginGrowthLabel(asset.origin, 'he');
  const stone = getStoneTypeLabel(asset.stoneType, 'he');
  const shape = getShapeLabel(asset.shape, 'he');
  const carat = asset.caratWeight || asset.totalCaratWeight;
  return [origin, stone, shape, carat ? `${carat} קרט` : ''].filter(Boolean).join(' · ') || asset.title || 'אבן';
}

export function getCertificateTitle(asset) {
  if (!asset) return 'Gemstone Report';
  const category = normalizeStoneCategory(asset.stoneCategory || asset.productType);
  const origin = normalizeOrigin(asset.origin || asset.productType);
  const stoneType = normalizeStoneType(asset.stoneType || asset.productType);
  const assetType = normalizeAssetType(asset.assetType, asset.productType);
  const hasLabReport = Boolean(asset.reportNumber || asset.labName);

  if (assetType === 'finished_jewelry') return 'Jewelry Valuation Report';
  if (assetType === 'parcel') return stoneType === 'diamond' ? 'Diamond Parcel Report' : 'Gemstone Parcel Report';
  if (category === 'white_diamond') return origin === 'lab_grown' ? 'Laboratory-Grown Diamond Report' : (hasLabReport ? 'Diamond Grading Report' : 'Diamond Report');
  if (category === 'fancy_color_diamond') return origin === 'lab_grown' ? 'Fancy Color Laboratory-Grown Diamond Report' : 'Fancy Color Diamond Report';
  if (category === 'colored_gemstone') {
    const typeLabel = getStoneTypeLabel(stoneType, 'en');
    return typeLabel && typeLabel !== 'Other' ? `${typeLabel} Report` : 'Colored Gemstone Report';
  }
  return 'Gemstone Report';
}
