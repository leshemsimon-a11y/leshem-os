/**
 * LESHEM.S OS — v2 Taxonomy Helpers
 *
 * Pure frontend helpers for the isolated /v2 workspace.
 * App UI can be Hebrew; customer-facing/certificate helpers return English only.
 * Airtable field names remain unchanged and are read through aliases here.
 */

const HEBREW_RE = /[\u0590-\u05FF]/;

function clean(v) {
  if (v === undefined || v === null) return '';
  return String(v).trim();
}

function key(v) {
  return clean(v).toLowerCase().replace(/[\s_]+/g, ' ').replace(/[–—]/g, '-');
}

function firstNonEmpty(...values) {
  for (const v of values) {
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

function toNumber(v) {
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(String(v).replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : undefined;
}

function read(fields, aliases) {
  for (const alias of aliases) {
    if (fields?.[alias] !== undefined && fields?.[alias] !== null && fields?.[alias] !== '') return fields[alias];
  }
  return undefined;
}

const FIELD = {
  name: ['תיאור פריט', 'שם', 'title', 'Title', 'Name'],
  itemType: ['סוג פריט', 'assetType', 'type', 'Type'],
  exactProductType: ['סוג מוצר מדויק', 'Product Type', 'productType'],
  defaultReportType: ['סוג תעודה דיפולטיבית'],
  stoneType: ['סוג אבן', 'stoneType', 'Stone Type'],
  shape: ['צורה \\ ליטוש', 'צורה / ליטוש', 'צורה', 'shape', 'Shape'],
  cutForm: ['Cut / Form', 'cutForm'],
  caratWeight: ['משקל קראט סה"כ', 'Carat Weight', 'caratWeight', 'קרט'],
  stoneCount: ['מספר אבנים', 'stoneCount'],
  averageWeight: ['משקל אבן ממוצע'],
  color: ['צבע ', 'צבע', 'Color', 'color'],
  clarity: ['ניקיון', 'Clarity', 'clarity'],
  cut: ['Cut Grade', 'קאט', 'Cut', 'cut'],
  polish: ['Polish', 'פוליש'],
  symmetry: ['Symmetry', 'סימטריה'],
  fluorescenceIntensity: ['עוצמת פלורסנציה', 'Fluorescence', 'fluorescence'],
  fluorescenceColor: ['צבע פלורסנציה'],
  measurements: ['מידות', 'Measurements', 'measurements'],
  length: ['אורך מ"מ'],
  width: ['רוחב מ"מ'],
  depth: ['גובה מ"מ'],
  labName: ['מקור תעודה', 'Laboratory', 'Lab', 'labName'],
  reportNumber: ['Verification ID', 'מספר תעודה', 'Report Number', 'reportNumber'],
  laserInscription: ['חריטת לייזר'],
  inventoryLayer: ['שכבת מלאי', 'inventoryLayer', 'Inventory Layer'],
  status: ['סטטוס מלאי', 'Status', 'status'],
  intendedUse: ['מיועד לשימוש'],
  supplierName: ['שם ספק', 'ספק וירטואלי', 'supplierName', 'Supplier'],
  ownerClient: ['בעלים / לקוח'],
  physicalLocation: ['מיקום פיזי'],
  costPrice: ['עלות בדולר', 'מחיר עלות', 'costPrice', 'Cost Price'],
  askingPrice: ['מחיר מבוקש', 'askingPrice', 'Asking Price'],
  imageUrl: ['תמונה לתעודה', 'תמונות \\ וידאו מלאי', 'תמונה', 'Image', 'imageUrl'],
  certFile: ['קובץ תעודה גמולוגית', 'Verification URL', 'certificateUrl'],
  treatment: ['טיפול', 'Treatment'],
  geographicOrigin: ['ארץ מקור', 'מקור גאוגרפי', 'Geographic Origin'],
  growthMethod: ['Growth Method'],
  fancyColorIntensity: ['Fancy Color Intensity'],
  fancyColorHue: ['Fancy Color Hue'],
  fancyColorOvertone: ['Fancy Color Overtone'],
  transparency: ['שקיפות'],
  internalNotes: ['Internal Notes', 'הערות פנימיות'],
  createdAt: ['Created', 'Created At', 'תאריך יצירה'],
};

const PRODUCT_TO_CANONICAL = {
  'natural diamond': { stoneCategory: 'white_diamond', origin: 'natural', stoneType: 'diamond', assetType: 'stone' },
  'lab-grown diamond': { stoneCategory: 'white_diamond', origin: 'lab_grown', stoneType: 'diamond', assetType: 'stone' },
  'lab grown diamond': { stoneCategory: 'white_diamond', origin: 'lab_grown', stoneType: 'diamond', assetType: 'stone' },
  'laboratory-grown diamond': { stoneCategory: 'white_diamond', origin: 'lab_grown', stoneType: 'diamond', assetType: 'stone' },
  'fancy color diamond': { stoneCategory: 'fancy_color_diamond', origin: 'natural', stoneType: 'diamond', assetType: 'stone' },
  'fancy colour diamond': { stoneCategory: 'fancy_color_diamond', origin: 'natural', stoneType: 'diamond', assetType: 'stone' },
  'colored gemstone': { stoneCategory: 'colored_gemstone', origin: 'natural', assetType: 'stone' },
  'coloured gemstone': { stoneCategory: 'colored_gemstone', origin: 'natural', assetType: 'stone' },
  'stone parcel': { assetType: 'parcel' },
  'stone pair / set': { assetType: 'pair_set' },
  'jewelry part': { assetType: 'part' },
  'finished jewelry': { assetType: 'finished_jewelry' },
};

const STONE_TYPE_ALIASES = {
  diamond: 'diamond', 'lab-grown diamond': 'diamond', 'lab grown diamond': 'diamond',
  sapphire: 'sapphire', ruby: 'ruby', emerald: 'emerald', spinel: 'spinel', spinell: 'spinel', tourmaline: 'tourmaline', tanzanite: 'tanzanite', alexandrite: 'alexandrite', aquamarine: 'aquamarine',
  'יהלום': 'diamond', 'ספיר': 'sapphire', 'רובי': 'ruby', 'אודם': 'ruby', 'אמרלד': 'emerald', 'זמרד': 'emerald', 'ספינל': 'spinel', 'טורמלין': 'tourmaline', 'טנזניט': 'tanzanite',
};

const SHAPE_ALIASES = {
  round: 'round', 'round brilliant': 'round', brilliant: 'round', 'עגול': 'round', 'עגול ברליאנט': 'round',
  oval: 'oval', 'אובל': 'oval',
  emerald: 'emerald', 'emerald cut': 'emerald', 'אמרלד': 'emerald', 'אמרלד קאט': 'emerald',
  cushion: 'cushion', 'קושן': 'cushion', 'כרית': 'cushion',
  radiant: 'radiant', 'רדיאנט': 'radiant',
  pear: 'pear', 'אגס': 'pear',
  marquise: 'marquise', 'מרקיז': 'marquise', 'מרקיזה': 'marquise',
  princess: 'princess', 'פרינסס': 'princess',
  heart: 'heart', 'לב': 'heart',
  asscher: 'asscher', 'אשר': 'asscher',
  trillion: 'trillion', trilliant: 'trillion', 'טריליון': 'trillion', 'טרילאנט': 'trillion',
  baguette: 'baguette', 'באגט': 'baguette',
};

const LAYER_ALIASES = {
  'physical stock': 'physical_stock', physical_stock: 'physical_stock', 'מלאי פיזי': 'physical_stock',
  'virtual supplier stock': 'virtual_supplier_stock', 'virtual supplier': 'virtual_supplier_stock', virtual_supplier_stock: 'virtual_supplier_stock', 'מלאי וירטואלי מספק': 'virtual_supplier_stock',
  'client-owned item': 'client_owned_item', 'client owned': 'client_owned_item', client_owned_item: 'client_owned_item', 'פריט בבעלות לקוח': 'client_owned_item',
};

const STATUS_ALIASES = {
  available: 'available', 'זמין': 'available', 'במלאי': 'available',
  reserved: 'reserved', 'שמור': 'reserved',
  mounted: 'in_use', 'in use': 'in_use', in_use: 'in_use', 'בשימוש': 'in_use',
  sold: 'sold', 'נמכר': 'sold',
  returned: 'returned', 'הוחזר': 'returned',
  archived: 'archived', 'ארכיון': 'archived',
};

function canonicalFrom(map, raw, fallback = '') {
  const k = key(raw);
  return map[k] || fallback || clean(raw);
}

function deriveProduct(rawProduct, rawItemType, rawStoneType) {
  const product = PRODUCT_TO_CANONICAL[key(rawProduct)] || {};
  let assetType = product.assetType;
  const itemKey = key(rawItemType);
  if (!assetType) {
    if (itemKey.includes('parcel') || itemKey === 'חבילה') assetType = 'parcel';
    else if (itemKey.includes('pair') || itemKey.includes('set') || itemKey === 'זוג') assetType = 'pair_set';
    else if (itemKey.includes('part') || itemKey.includes('component') || itemKey === 'רכיב') assetType = 'part';
    else if (itemKey.includes('jewelry')) assetType = 'finished_jewelry';
    else assetType = 'stone';
  }

  let stoneType = product.stoneType || canonicalFrom(STONE_TYPE_ALIASES, rawStoneType, '');
  if (!stoneType && (key(rawProduct).includes('diamond') || assetType === 'parcel')) stoneType = 'diamond';

  let stoneCategory = product.stoneCategory;
  if (!stoneCategory) {
    const pk = key(rawProduct);
    if (pk.includes('fancy')) stoneCategory = 'fancy_color_diamond';
    else if (stoneType === 'diamond') stoneCategory = 'white_diamond';
    else if (stoneType) stoneCategory = 'colored_gemstone';
  }

  let origin = product.origin;
  if (!origin) {
    const pk = key(rawProduct);
    if (pk.includes('lab')) origin = 'lab_grown';
    else if (stoneType === 'diamond' || stoneCategory === 'colored_gemstone') origin = 'natural';
  }

  return { assetType, stoneCategory, origin, stoneType };
}

function normalizeImage(v) {
  if (!v) return null;
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') return v;
  return v;
}

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------
const STONE_CATEGORY_LABELS = {
  white_diamond: { he: 'יהלום לבן', en: 'White Diamond' },
  fancy_color_diamond: { he: 'יהלום פנסי', en: 'Fancy Color Diamond' },
  colored_gemstone: { he: 'אבן חן צבעונית', en: 'Colored Gemstone' },
};
export function getStoneCategoryLabel(value, lang = 'he') { return STONE_CATEGORY_LABELS[value]?.[lang] || value || ''; }

const ORIGIN_GROWTH_LABELS = {
  natural: { he: 'טבעי', en: 'Natural' },
  lab_grown: { he: 'מעבדה', en: 'Laboratory-Grown' },
};
export function getOriginGrowthLabel(value, lang = 'he') { return ORIGIN_GROWTH_LABELS[value]?.[lang] || value || ''; }

const STONE_TYPE_LABELS = {
  diamond: { he: 'יהלום', en: 'Diamond' }, sapphire: { he: 'ספיר', en: 'Sapphire' }, ruby: { he: 'רובי', en: 'Ruby' }, emerald: { he: 'אמרלד', en: 'Emerald' }, spinel: { he: 'ספינל', en: 'Spinel' }, tourmaline: { he: 'טורמלין', en: 'Tourmaline' }, tanzanite: { he: 'טנזניט', en: 'Tanzanite' }, alexandrite: { he: 'אלכסנדריט', en: 'Alexandrite' }, aquamarine: { he: 'אקוומרין', en: 'Aquamarine' }, other: { he: 'אחר', en: 'Other' },
};
export function getStoneTypeLabel(value, lang = 'he') { return STONE_TYPE_LABELS[value]?.[lang] || value || ''; }

const SHAPE_LABELS = {
  round: { he: 'עגול', en: 'Round Brilliant' }, oval: { he: 'אובל', en: 'Oval' }, emerald: { he: 'אמרלד קאט', en: 'Emerald Cut' }, cushion: { he: 'קושן', en: 'Cushion' }, radiant: { he: 'רדיאנט', en: 'Radiant' }, pear: { he: 'אגס', en: 'Pear' }, marquise: { he: 'מרקיז', en: 'Marquise' }, princess: { he: 'פרינסס', en: 'Princess' }, heart: { he: 'לב', en: 'Heart' }, asscher: { he: 'אשר', en: 'Asscher' }, trillion: { he: 'טריליון', en: 'Trillion' }, baguette: { he: 'באגט', en: 'Baguette' }, other: { he: 'אחר', en: 'Other' },
};
export function getShapeLabel(value, lang = 'he') { return SHAPE_LABELS[value]?.[lang] || value || ''; }

const CUT_FORM_LABELS = { faceted: { he: 'מלוטש', en: 'Faceted' }, cabochon: { he: 'קבושון', en: 'Cabochon' }, rough: { he: 'גולמי', en: 'Rough' }, carved: { he: 'מגולף', en: 'Carved' }, bead: { he: 'חרוז', en: 'Bead' }, other: { he: 'אחר', en: 'Other' } };
export function getCutFormLabel(value, lang = 'he') { return CUT_FORM_LABELS[value]?.[lang] || value || ''; }

const INVENTORY_LAYER_LABELS = { physical_stock: { he: 'מלאי פיזי', en: 'Physical Stock' }, virtual_supplier_stock: { he: 'מלאי וירטואלי מספק', en: 'Virtual Supplier Stock' }, client_owned_item: { he: 'פריט בבעלות לקוח', en: 'Client-Owned Item' } };
export function getInventoryLayerLabel(value, lang = 'he') { return INVENTORY_LAYER_LABELS[value]?.[lang] || value || ''; }

const STATUS_LABELS = { available: { he: 'זמין', en: 'Available' }, reserved: { he: 'שמור', en: 'Reserved' }, in_use: { he: 'בשימוש', en: 'In Use' }, sold: { he: 'נמכר', en: 'Sold' }, returned: { he: 'הוחזר', en: 'Returned' }, archived: { he: 'ארכיון', en: 'Archived' } };
export function getStatusLabel(value, lang = 'he') { return STATUS_LABELS[value]?.[lang] || value || ''; }

const GEO_ORIGIN_LABELS = { sri_lanka: 'Sri Lanka', burma: 'Burma (Myanmar)', myanmar: 'Burma (Myanmar)', colombia: 'Colombia', brazil: 'Brazil', mozambique: 'Mozambique', madagascar: 'Madagascar', kashmir: 'Kashmir', thailand: 'Thailand', zambia: 'Zambia', tanzania: 'Tanzania', other: 'Other' };
export function getGeographicOriginLabel(value) { return GEO_ORIGIN_LABELS[key(value).replace(/ /g, '_')] || clean(value); }

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------
export function getAssetDisplayTitle(asset) {
  if (!asset) return '';
  if (asset.assetType === 'finished_jewelry') return asset.title || 'תכשיט';
  if (asset.assetType === 'part') return asset.title || 'רכיב תכשיט';
  if (asset.assetType === 'parcel') {
    const stoneType = getStoneTypeLabel(asset.stoneType, 'he') || 'אבנים';
    const shape = getShapeLabel(asset.shape, 'he');
    const carat = asset.totalCaratWeight || asset.caratWeight;
    return [asset.stoneCount ? `${asset.stoneCount} יח׳` : 'חבילת', stoneType, shape, carat ? `${carat} קרט כולל` : ''].filter(Boolean).join(' · ');
  }
  const origin = getOriginGrowthLabel(asset.origin, 'he');
  const stoneType = getStoneTypeLabel(asset.stoneType, 'he');
  const shape = getShapeLabel(asset.shape, 'he');
  const carat = asset.caratWeight;
  return [origin, stoneType, shape, carat ? `${carat} קרט` : ''].filter(Boolean).join(' · ') || asset.title || 'אבן';
}

export function getCertificateTitle(asset) {
  if (!asset) return 'Gemstone Report';
  if (asset.assetType === 'finished_jewelry') return 'Jewelry Valuation Report';
  if (asset.assetType === 'parcel') return asset.stoneType === 'diamond' ? 'Diamond Parcel Report' : 'Gemstone Parcel Report';
  if (asset.stoneCategory === 'white_diamond') return asset.origin === 'lab_grown' ? 'Laboratory-Grown Diamond Report' : (asset.labName && asset.reportNumber ? 'Diamond Grading Report' : 'Diamond Report');
  if (asset.stoneCategory === 'fancy_color_diamond') return asset.origin === 'lab_grown' ? 'Fancy Color Laboratory-Grown Diamond Report' : 'Fancy Color Diamond Report';
  if (asset.stoneCategory === 'colored_gemstone') {
    const type = getStoneTypeLabel(asset.stoneType, 'en');
    return type && type !== 'Other' ? `${type} Report` : 'Colored Gemstone Report';
  }
  return 'Gemstone Report';
}

export function normalizeAsset(record) {
  if (!record) return null;
  const fields = record.fields || record;
  const airtableId = record.id || fields.id || fields._airtableId;

  const rawProduct = read(fields, FIELD.exactProductType);
  const rawItemType = read(fields, FIELD.itemType);
  const rawStoneType = read(fields, FIELD.stoneType);
  const derived = deriveProduct(rawProduct, rawItemType, rawStoneType);

  const rawShape = read(fields, FIELD.shape);
  const rawLayer = read(fields, FIELD.inventoryLayer);
  const rawStatus = read(fields, FIELD.status);
  const rawCutForm = read(fields, FIELD.cutForm);

  const length = read(fields, FIELD.length);
  const width = read(fields, FIELD.width);
  const depth = read(fields, FIELD.depth);
  const measurements = read(fields, FIELD.measurements) || [length, width, depth].filter(Boolean).join(' × ');

  const laser = read(fields, FIELD.laserInscription);
  const reportNumber = read(fields, FIELD.reportNumber) || (laser ? String(laser).replace(/^GIA\s*/i, '') : undefined);

  const caratWeight = toNumber(read(fields, FIELD.caratWeight));
  const stoneCount = toNumber(read(fields, FIELD.stoneCount));

  return {
    _airtableId: airtableId,
    _raw: record,
    title: read(fields, FIELD.name),
    assetType: derived.assetType,
    rawProductType: rawProduct,
    rawItemType,
    stoneCategory: derived.stoneCategory,
    origin: derived.origin,
    stoneType: derived.stoneType || canonicalFrom(STONE_TYPE_ALIASES, rawStoneType, clean(rawStoneType)),
    shape: canonicalFrom(SHAPE_ALIASES, rawShape, clean(rawShape)),
    cutForm: key(rawCutForm) || clean(rawCutForm),
    caratWeight,
    totalCaratWeight: caratWeight,
    stoneCount,
    averageStoneWeight: toNumber(read(fields, FIELD.averageWeight)) || (stoneCount && caratWeight ? Math.round((caratWeight / stoneCount) * 10000) / 10000 : undefined),
    color: read(fields, FIELD.color),
    clarity: read(fields, FIELD.clarity),
    cut: read(fields, FIELD.cut),
    polish: read(fields, FIELD.polish),
    symmetry: read(fields, FIELD.symmetry),
    fluorescence: [read(fields, FIELD.fluorescenceIntensity), read(fields, FIELD.fluorescenceColor)].filter(Boolean).join(' '),
    measurements,
    labName: read(fields, FIELD.labName),
    reportNumber,
    laserInscription: laser,
    inventoryLayer: canonicalFrom(LAYER_ALIASES, rawLayer, clean(rawLayer)),
    status: canonicalFrom(STATUS_ALIASES, rawStatus, clean(rawStatus)),
    intendedUse: read(fields, FIELD.intendedUse),
    supplierName: read(fields, FIELD.supplierName),
    ownerClient: read(fields, FIELD.ownerClient),
    physicalLocation: read(fields, FIELD.physicalLocation),
    costPrice: toNumber(read(fields, FIELD.costPrice)),
    askingPrice: toNumber(read(fields, FIELD.askingPrice)),
    imageUrl: normalizeImage(read(fields, FIELD.imageUrl)),
    certFile: read(fields, FIELD.certFile),
    treatment: read(fields, FIELD.treatment),
    geographicOrigin: read(fields, FIELD.geographicOrigin),
    growthMethod: read(fields, FIELD.growthMethod),
    fancyColorIntensity: read(fields, FIELD.fancyColorIntensity),
    fancyColorHue: read(fields, FIELD.fancyColorHue),
    fancyColorOvertone: read(fields, FIELD.fancyColorOvertone),
    transparency: read(fields, FIELD.transparency),
    internalNotes: read(fields, FIELD.internalNotes),
    createdAt: read(fields, FIELD.createdAt),
  };
}

export function getSearchText(asset) {
  if (!asset) return '';
  const values = [
    getAssetDisplayTitle(asset),
    asset.title,
    asset.rawProductType,
    asset.rawItemType,
    getStoneCategoryLabel(asset.stoneCategory, 'he'), getStoneCategoryLabel(asset.stoneCategory, 'en'),
    getOriginGrowthLabel(asset.origin, 'he'), getOriginGrowthLabel(asset.origin, 'en'),
    getStoneTypeLabel(asset.stoneType, 'he'), getStoneTypeLabel(asset.stoneType, 'en'),
    getShapeLabel(asset.shape, 'he'), getShapeLabel(asset.shape, 'en'),
    asset.caratWeight, asset.caratWeight ? Number(asset.caratWeight).toFixed(2) : '', asset.caratWeight ? Number(asset.caratWeight).toString() : '',
    asset.totalCaratWeight, asset.color, asset.clarity, asset.labName, asset.reportNumber, asset.laserInscription, asset.supplierName, asset.ownerClient, asset.costPrice,
  ];
  return values.filter(Boolean).join(' ').toLowerCase();
}
