import { useId } from 'react';
import styles from './atelier.module.css';
import { metalComponent } from '../../lib/atelier/componentsBank';
import { resolveStoneOptics, productNeedsChain, productNeedsBail } from '../../lib/atelier/manufacturingSpec';

const METAL_RAMP = {
  yellow: ['#fff0a9', '#b98622', '#f7d878'],
  white: ['#f8fafb', '#adb5bb', '#eef1f2'],
  rose: ['#f4cfbf', '#b97968', '#f3bca8'],
  natural: ['#fbfcfc', '#9fa8ae', '#dbe1e4'],
};

// Body colors matched to the real material, so the structural preview does
// not show every stone as the same green gem.
const GEM_RAMP = {
  diamond: ['#ffffff', '#dfeaf0', '#9fb4c2'],
  labDiamond: ['#ffffff', '#dfeaf0', '#9fb4c2'],
  moissanite: ['#ffffff', '#e4f0e8', '#a8c0b6'],
  sapphire: ['#7fa8e0', '#1c4f9c', '#0a2a5c'],
  ruby: ['#f08497', '#b1122e', '#5c0a18'],
  emerald: ['#38a97b', '#0f6b4b', '#07372a'],
  aquamarine: ['#b8e8ef', '#5aa8bb', '#28616f'],
  morganite: ['#f7d9d3', '#d79c92', '#9c6459'],
  tanzanite: ['#a79ae8', '#4f3fa0', '#241a56'],
  tourmaline: ['#7fd4c4', '#1f9a86', '#0b4a41'],
  paraiba: ['#8fe8e0', '#14b6ad', '#06615d'],
  quartz: ['#f6f7f8', '#d8dcdf', '#a9b0b5'],
  amethyst: ['#d3b8ea', '#7b4fa8', '#3d2456'],
  citrine: ['#f8e2a8', '#d09a2a', '#7a5410'],
  smokyQuartz: ['#d9cec6', '#9c8578', '#4f4239'],
  roseQuartz: ['#f7dbe0', '#dda9b4', '#a3707c'],
  topaz: ['#bfe4f2', '#63a9c9', '#2b5d75'],
  garnet: ['#e0899a', '#9c2038', '#4c0d1a'],
  peridot: ['#d9e9a0', '#8db43c', '#4a6317'],
  spinel: ['#f0a9b8', '#c04a63', '#63182a'],
  opal: ['#f4f7f2', '#cfe0dc', '#9db6b4'],
  pearl: ['#fbf8f4', '#e6ded2', '#bdb1a2'],
  onyx: ['#4a4f52', '#1c1f21', '#0a0c0d'],
  turquoise: ['#a9e4de', '#3fa79c', '#186259'],
  lapis: ['#6f8ed4', '#22409c', '#0d1c52'],
  gemstone: ['#dfe8e6', '#93a8a3', '#4b5f5a'],
};

function stonePath(shape) {
  if (/emerald|אמרלד|אזמרגד/i.test(shape || '')) return 'M114 84h72l18 18v94l-18 18h-72l-18-18v-94l18-18Z';
  if (/pear|אגס|טיפה/i.test(shape || '')) return 'M150 76c-35 38-55 70-55 100 0 34 24 58 55 58s55-24 55-58c0-30-20-62-55-100Z';
  if (/cushion|כרית|קושן/i.test(shape || '')) return 'M112 84h76c22 0 32 11 32 32v66c0 22-10 32-32 32h-76c-22 0-32-10-32-32v-66c0-21 10-32 32-32Z';
  if (/round|עגול|בריליאנט/i.test(shape || '')) return 'M150 82a66 66 0 1 1 0 132 66 66 0 0 1 0-132Z';
  return 'M150 78c39 0 62 33 62 70 0 49-30 82-62 82s-62-33-62-82c0-37 23-70 62-70Z';
}

// Prongs are drawn at their real count and evenly spaced, matching the
// setting head the studio would actually cast.
function prongPositions(count) {
  const total = Math.max(0, count || 0);
  if (!total) return [];
  const radius = 68;
  const offset = total === 4 ? -45 : -90;
  return Array.from({ length: total }, (_, index) => {
    const angle = ((offset + (360 / total) * index) * Math.PI) / 180;
    return { x: 150 + radius * Math.cos(angle), y: 156 + radius * Math.sin(angle) };
  });
}

function haloPositions(count) {
  const total = Math.max(0, Math.min(40, count || 0));
  if (!total) return [];
  const radius = 84;
  return Array.from({ length: total }, (_, index) => {
    const angle = ((-90 + (360 / total) * index) * Math.PI) / 180;
    return { x: 150 + radius * Math.cos(angle), y: 156 + radius * Math.sin(angle) };
  });
}

export default function PendantVisualizer({
  config,
  shape,
  stoneType,
  stoneTypeHe,
  variant = 0,
  compact = false,
}) {
  const uid = useId().replace(/:/g, '');
  const cfg = config || {};
  const metalRecord = metalComponent(cfg.metalKey);
  const metal = METAL_RAMP[metalRecord ? metalRecord.swatch : 'white'] || METAL_RAMP.white;

  const optics = resolveStoneOptics(stoneType, stoneTypeHe);
  const gem = GEM_RAMP[opticsKeyOf(optics)] || GEM_RAMP.gemstone;

  const settingKey = cfg.settingKey || (variant === 1 ? 'bezel' : variant === 2 ? 'halo' : 'prong4');
  const isBezel = settingKey === 'bezel';
  const isHalo = settingKey === 'halo';
  const prongCount = settingKey === 'prong6' ? 6 : settingKey === 'prong4' || isHalo ? 4 : 0;

  const showBail = productNeedsBail(cfg.product);
  const showChain = productNeedsChain(cfg.product) && cfg.chainKey !== 'noChain';
  const isBox = cfg.chainKey === 'box';
  const isVBail = cfg.bailKey === 'vBail';

  const stone = stonePath(shape);
  const halo = isHalo ? haloPositions(cfg.meleeCount || 16) : [];
  const prongs = prongPositions(prongCount);

  return (
    <div className={`${styles.visualizerWrap} ${compact ? styles.visualizerCompact : ''}`}>
      <svg viewBox="0 0 300 320" className={styles.visualizerSvg} role="img" aria-label="תצוגת מבנה">
        <defs>
          <linearGradient id={`metal-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={metal[0]} />
            <stop offset="48%" stopColor={metal[1]} />
            <stop offset="100%" stopColor={metal[2]} />
          </linearGradient>
          <radialGradient id={`gem-${uid}`} cx="38%" cy="28%" r="78%">
            <stop offset="0%" stopColor={gem[0]} />
            <stop offset="42%" stopColor={gem[1]} />
            <stop offset="100%" stopColor={gem[2]} />
          </radialGradient>
          <filter id={`shadow-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#0b1713" floodOpacity=".18" />
          </filter>
        </defs>

        {showChain ? (
          <>
            <path d="M28 0c8 68 42 82 94 91" fill="none" stroke={`url(#metal-${uid})`} strokeWidth={isBox ? 4 : 2.2} />
            <path d="M272 0c-8 68-42 82-94 91" fill="none" stroke={`url(#metal-${uid})`} strokeWidth={isBox ? 4 : 2.2} />
          </>
        ) : null}

        {showBail && isVBail ? (
          <path d="M124 104 150 66l26 38" fill="none" stroke={`url(#metal-${uid})`} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        ) : null}
        {showBail && !isVBail ? (
          <path d="M132 96c0-15 7-25 18-25s18 10 18 25" fill="none" stroke={`url(#metal-${uid})`} strokeWidth="8" />
        ) : null}

        <g filter={`url(#shadow-${uid})`}>
          {isHalo ? (
            <g fill="#fbfdfd" stroke={metal[1]} strokeWidth="1.1">
              {halo.map((point, index) => (
                <circle key={`halo-${index}`} cx={point.x} cy={point.y} r="6.5" />
              ))}
            </g>
          ) : null}

          {isBezel ? (
            <path d={stone} fill={`url(#metal-${uid})`} stroke="rgba(255,255,255,.8)" strokeWidth="2" />
          ) : null}

          <path
            d={stone}
            transform={isBezel ? 'translate(150 156) scale(.89) translate(-150 -156)' : undefined}
            fill={`url(#gem-${uid})`}
            stroke="rgba(255,255,255,.34)"
            strokeWidth="1.6"
          />
          <path d="M117 107 183 197M108 151l78-43M113 190l70-64" fill="none" stroke="rgba(255,255,255,.17)" strokeWidth="3" />

          {prongs.length && !isBezel ? (
            <g fill={`url(#metal-${uid})`} stroke={metal[1]} strokeWidth=".8">
              {prongs.map((point, index) => (
                <circle key={`prong-${index}`} cx={point.x} cy={point.y} r="6" />
              ))}
            </g>
          ) : null}
        </g>
      </svg>
    </div>
  );
}

// The optics record does not carry its own key, so match it back by English
// name — keeps the gem ramp in sync with manufacturingSpec.js.
function opticsKeyOf(optics) {
  const name = (optics && optics.en) || '';
  const map = {
    diamond: 'diamond',
    'lab-grown diamond': 'labDiamond',
    moissanite: 'moissanite',
    sapphire: 'sapphire',
    ruby: 'ruby',
    emerald: 'emerald',
    aquamarine: 'aquamarine',
    morganite: 'morganite',
    tanzanite: 'tanzanite',
    tourmaline: 'tourmaline',
    'Paraiba tourmaline': 'paraiba',
    quartz: 'quartz',
    amethyst: 'amethyst',
    citrine: 'citrine',
    'smoky quartz': 'smokyQuartz',
    'rose quartz': 'roseQuartz',
    topaz: 'topaz',
    garnet: 'garnet',
    peridot: 'peridot',
    spinel: 'spinel',
    opal: 'opal',
    pearl: 'pearl',
    onyx: 'onyx',
    turquoise: 'turquoise',
    'lapis lazuli': 'lapis',
  };
  return map[name] || 'gemstone';
}
