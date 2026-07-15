import { useId } from 'react';
import styles from './atelier.module.css';

const METAL = {
  whiteGold: ['#f8fafb', '#adb5bb', '#eef1f2'],
  yellowGold: ['#fff0a9', '#b98622', '#f7d878'],
  roseGold: ['#f4cfbf', '#b97968', '#f3bca8'],
  platinum: ['#fbfcfc', '#9fa8ae', '#dbe1e4'],
  silver: ['#f9fbfc', '#a8b1b7', '#e4e9eb'],
};

function stonePath(shape) {
  if (shape === 'emerald') return 'M114 84h72l18 18v94l-18 18h-72l-18-18v-94l18-18Z';
  if (shape === 'pear') return 'M150 76c-35 38-55 70-55 100 0 34 24 58 55 58s55-24 55-58c0-30-20-62-55-100Z';
  if (shape === 'cushion') return 'M112 84h76c22 0 32 11 32 32v66c0 22-10 32-32 32h-76c-22 0-32-10-32-32v-66c0-21 10-32 32-32Z';
  if (shape === 'round') return 'M150 82a66 66 0 1 1 0 132 66 66 0 0 1 0-132Z';
  return 'M150 78c39 0 62 33 62 70 0 49-30 82-62 82s-62-33-62-82c0-37 23-70 62-70Z';
}

export default function PendantVisualizer({ config, shape, variant = 0, compact = false }) {
  const uid = useId().replace(/:/g, '');
  const metal = METAL[(config && config.metalPreference) || 'whiteGold'] || METAL.whiteGold;
  const setting = (config && config.setting) || (variant === 1 ? 'bezel' : variant === 2 ? 'halo' : 'prong');
  const bail = (config && config.bail) || 'hidden';
  const chain = (config && config.chain) || 'fineCable';
  const showChain = chain !== 'noChain';
  const stone = stonePath(shape);

  return (
    <div className={`${styles.visualizerWrap} ${compact ? styles.visualizerCompact : ''}`}>
      <svg viewBox="0 0 300 320" className={styles.visualizerSvg} role="img" aria-label="תצוגת מבנה תליון">
        <defs>
          <linearGradient id={`metal-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={metal[0]} />
            <stop offset="48%" stopColor={metal[1]} />
            <stop offset="100%" stopColor={metal[2]} />
          </linearGradient>
          <radialGradient id={`gem-${uid}`} cx="38%" cy="28%" r="78%">
            <stop offset="0%" stopColor="#38a97b" />
            <stop offset="42%" stopColor="#0f6b4b" />
            <stop offset="100%" stopColor="#07372a" />
          </radialGradient>
          <filter id={`shadow-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#0b1713" floodOpacity=".18" />
          </filter>
        </defs>

        {showChain ? (
          <>
            <path d="M28 0c8 68 42 82 94 91" fill="none" stroke={`url(#metal-${uid})`} strokeWidth={chain === 'box' ? 4 : 2.2} />
            <path d="M272 0c-8 68-42 82-94 91" fill="none" stroke={`url(#metal-${uid})`} strokeWidth={chain === 'box' ? 4 : 2.2} />
            {chain === 'curb' ? (
              <path d="M28 0c8 68 42 82 94 91M272 0c-8 68-42 82-94 91" fill="none" stroke="rgba(255,255,255,.65)" strokeWidth="1" strokeDasharray="4 5" />
            ) : null}
          </>
        ) : null}

        {bail === 'classic' ? <path d="M135 68h30c8 0 13 7 13 15v20h-56V83c0-8 5-15 13-15Z" fill="none" stroke={`url(#metal-${uid})`} strokeWidth="7" /> : null}
        {bail === 'integrated' ? <path d="M116 105c8-27 25-39 34-39s26 12 34 39" fill="none" stroke={`url(#metal-${uid})`} strokeWidth="9" strokeLinecap="round" /> : null}
        {bail === 'side' ? <path d="M91 114c-18-4-27-14-27-27 0-11 8-20 19-20 13 0 22 10 23 26" fill="none" stroke={`url(#metal-${uid})`} strokeWidth="7" /> : null}
        {bail === 'hidden' ? <path d="M132 96c0-15 7-25 18-25s18 10 18 25" fill="none" stroke={`url(#metal-${uid})`} strokeWidth="8" /> : null}

        <g filter={`url(#shadow-${uid})`}>
          {setting === 'halo' || setting === 'cluster' ? (
            <path d={stone} transform="translate(150 156) scale(1.18) translate(-150 -156)" fill="none" stroke={`url(#metal-${uid})`} strokeWidth="8" />
          ) : null}
          {setting === 'bezel' ? <path d={stone} fill={`url(#metal-${uid})`} stroke="rgba(255,255,255,.8)" strokeWidth="2" /> : null}
          <path d={stone} transform={setting === 'bezel' ? 'translate(150 156) scale(.89) translate(-150 -156)' : undefined} fill={`url(#gem-${uid})`} stroke={setting === 'prong' ? 'rgba(255,255,255,.38)' : 'none'} strokeWidth="2" />
          <path d="M117 107 183 197M108 151l78-43M113 190l70-64" fill="none" stroke="rgba(255,255,255,.17)" strokeWidth="3" />
          {setting === 'prong' ? (
            <g fill={`url(#metal-${uid})`}>
              <circle cx="150" cy="81" r="6" /><circle cx="150" cy="229" r="6" />
              <circle cx="91" cy="151" r="6" /><circle cx="209" cy="151" r="6" />
            </g>
          ) : null}
          {setting === 'cluster' ? (
            <g fill="#f8faf9" stroke="#a9b2b5" strokeWidth="1.2">
              <circle cx="91" cy="105" r="8" /><circle cx="76" cy="146" r="7" /><circle cx="87" cy="194" r="9" />
              <circle cx="209" cy="105" r="8" /><circle cx="224" cy="146" r="7" /><circle cx="213" cy="194" r="9" />
            </g>
          ) : null}
        </g>
      </svg>
    </div>
  );
}
