import * as React from 'react';

const C = {
  ink: '#26231F',
  inkSoft: '#6F6960',
  line: '#D8D0C3',
  gold: '#B28A46',
  goldSoft: '#F1E7D4',
  ivory: '#F7F2EA',
  emerald: '#176447',
  emerald2: '#2E8A66',
  blue: '#55769E',
  rose: '#A55E69',
};

function Gem({ x = 60, y = 56, size = 34, color = C.emerald, shape = 'oval' }) {
  if (shape === 'round') {
    return (
      <g>
        <circle cx={x} cy={y} r={size / 2} fill={color} opacity="0.96" />
        <circle cx={x} cy={y} r={size / 3.2} fill="none" stroke="#fff" strokeOpacity="0.5" />
        <path d={`M ${x - size / 2.2} ${y} H ${x + size / 2.2} M ${x} ${y - size / 2.2} V ${y + size / 2.2}`} stroke="#fff" strokeOpacity="0.32" />
      </g>
    );
  }
  return (
    <g>
      <ellipse cx={x} cy={y} rx={size * 0.36} ry={size * 0.5} fill={color} />
      <ellipse cx={x} cy={y} rx={size * 0.22} ry={size * 0.34} fill="none" stroke="#fff" strokeOpacity="0.48" />
      <path d={`M ${x} ${y - size * 0.5} L ${x - size * 0.22} ${y} L ${x} ${y + size * 0.5} L ${x + size * 0.22} ${y} Z`} fill="none" stroke="#fff" strokeOpacity="0.34" />
    </g>
  );
}

export function WelcomeArt({ mode }) {
  if (mode === 'idea') {
    return (
      <svg viewBox="0 0 160 112" width="100%" height="100%" aria-hidden="true">
        <rect width="160" height="112" rx="18" fill={C.ivory} />
        <path d="M39 82c15-36 67-39 81-5" fill="none" stroke={C.ink} strokeWidth="2" strokeLinecap="round" />
        <circle cx="80" cy="53" r="25" fill="none" stroke={C.line} strokeWidth="1.4" strokeDasharray="3 4" />
        <Gem x={80} y={48} size={31} />
        <path d="M25 24h39M25 31h25M112 23l20 20M119 18l18 18" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="132" cy="42" r="4" fill={C.goldSoft} stroke={C.gold} />
      </svg>
    );
  }
  if (mode === 'collection') {
    return (
      <svg viewBox="0 0 160 112" width="100%" height="100%" aria-hidden="true">
        <rect width="160" height="112" rx="18" fill={C.ivory} />
        <rect x="21" y="22" width="118" height="68" rx="12" fill="#fff" stroke={C.line} />
        <Gem x={53} y={55} size={31} color={C.blue} shape="round" />
        <Gem x={82} y={50} size={35} color={C.emerald2} />
        <Gem x={111} y={59} size={29} color={C.rose} shape="round" />
        <path d="M35 82h90" stroke={C.gold} strokeOpacity="0.45" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 160 112" width="100%" height="100%" aria-hidden="true">
      <rect width="160" height="112" rx="18" fill={C.ivory} />
      <path d="M38 85c12-32 72-39 84-3" fill="none" stroke={C.gold} strokeWidth="3" strokeLinecap="round" />
      <path d="M42 85c14-24 64-29 76-2" fill="none" stroke={C.gold} strokeOpacity="0.4" />
      <Gem x={80} y={48} size={40} />
      <circle cx="80" cy="48" r="24" fill="none" stroke={C.gold} strokeOpacity="0.48" strokeDasharray="2.5 3" />
    </svg>
  );
}

export function SceneThumb({ sceneKey, selected }) {
  const bg = sceneKey === 'darkLuxury' ? '#24211E' : sceneKey === 'handShot' ? '#E7D3C2' : sceneKey === 'modelLifestyle' ? '#D8D2CC' : '#F7F4EF';
  const stone = sceneKey === 'macroStone' ? C.emerald2 : C.emerald;
  return (
    <span style={{ display: 'block', width: '100%', height: '62px', borderRadius: '9px', overflow: 'hidden', border: selected ? `1px solid ${C.gold}` : `1px solid ${C.line}` }}>
      <svg viewBox="0 0 96 62" width="100%" height="100%" aria-hidden="true">
        <rect width="96" height="62" fill={bg} />
        {sceneKey === 'boxTray' ? <rect x="15" y="11" width="66" height="40" rx="8" fill="#fff" stroke={C.line} /> : null}
        {sceneKey === 'handShot' ? <path d="M12 48c14-16 24-21 43-19 15 1 20 8 29 20" fill="none" stroke="#B98E74" strokeWidth="10" strokeLinecap="round" opacity="0.7" /> : null}
        {sceneKey === 'modelLifestyle' ? (<>
          <circle cx="29" cy="18" r="8" fill="#B9AAA0" />
          <path d="M19 52c2-19 4-27 10-29 9 2 12 12 13 29" fill="#B9AAA0" opacity="0.75" />
        </>) : null}
        {sceneKey === 'macroStone' ? <Gem x={51} y={31} size={52} color={stone} /> : <Gem x={54} y={31} size={28} color={stone} />}
        {sceneKey === 'darkLuxury' ? <ellipse cx="54" cy="49" rx="26" ry="4" fill="#000" opacity="0.3" /> : null}
      </svg>
    </span>
  );
}

export function RenderPreview({ sceneKey, conceptTitle = '', selectedStone }) {
  const img = selectedStone && selectedStone.snapshot && selectedStone.snapshot.primaryImage;
  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '420px', borderRadius: '20px', overflow: 'hidden', background: sceneKey === 'darkLuxury' ? '#27231F' : '#F5F1EB', border: `1px solid ${C.line}`, display: 'grid', placeItems: 'center' }}>
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt="" style={{ width: '70%', height: '70%', objectFit: 'contain', filter: sceneKey === 'darkLuxury' ? 'drop-shadow(0 18px 30px rgba(0,0,0,.45))' : 'drop-shadow(0 18px 30px rgba(60,40,20,.13))' }} />
      ) : (
        <svg viewBox="0 0 280 360" width="72%" aria-hidden="true">
          <path d="M74 286c18-75 115-89 135-5" fill="none" stroke={sceneKey === 'darkLuxury' ? '#D2C4AF' : C.gold} strokeWidth="8" strokeLinecap="round" />
          <Gem x={141} y={151} size={110} color={C.emerald} />
          <circle cx="141" cy="151" r="70" fill="none" stroke={sceneKey === 'darkLuxury' ? '#C4AE88' : C.gold} strokeOpacity="0.5" strokeDasharray="6 8" />
        </svg>
      )}
      <div style={{ position: 'absolute', insetInlineStart: 18, bottom: 16, padding: '8px 11px', borderRadius: '999px', background: 'rgba(255,255,255,.84)', backdropFilter: 'blur(8px)', color: C.ink, fontSize: '12px', fontWeight: 700 }}>
        {conceptTitle || 'תצוגה מקדימה'}
      </div>
    </div>
  );
}
