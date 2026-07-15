export default function JewelryIcon({ type, size = 30 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 32 32',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.55,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  if (type === 'pendant') {
    return (
      <svg {...common}>
        <path d="M16 2v5" />
        <path d="M12.7 4.4c0 2.4 1.2 4 3.3 5.3 2.1-1.3 3.3-2.9 3.3-5.3" />
        <path d="M16 9.5c-5.2 0-8 4-8 9 0 6.1 4.2 10.5 8 11.5 3.8-1 8-5.4 8-11.5 0-5-2.8-9-8-9Z" />
        <path d="m11.5 18.5 4.5-6 4.5 6-4.5 7-4.5-7Z" />
      </svg>
    );
  }
  if (type === 'engagementRing') {
    return (
      <svg {...common}>
        <ellipse cx="16" cy="21" rx="9.5" ry="7.5" />
        <path d="M11 14.2 16 7l5 7.2" />
        <path d="m13.2 10.8 2.8-4 2.8 4-2.8 3.4-2.8-3.4Z" />
      </svg>
    );
  }
  if (type === 'weddingBand' || type === 'ring') {
    return (
      <svg {...common}>
        <ellipse cx="16" cy="17" rx="10" ry="9" />
        <ellipse cx="16" cy="17" rx="6.3" ry="5.4" />
        {type === 'ring' ? <path d="M11.5 9.5 16 5l4.5 4.5" /> : null}
      </svg>
    );
  }
  if (type === 'earrings') {
    return (
      <svg {...common}>
        <path d="M10 3v5M22 3v5" />
        <path d="M10 8c-3.3 3.8-5 7.1-5 10.2A5 5 0 0 0 10 23a5 5 0 0 0 5-4.8C15 15.1 13.3 11.8 10 8Z" />
        <path d="M22 8c-3.3 3.8-5 7.1-5 10.2A5 5 0 0 0 22 23a5 5 0 0 0 5-4.8C27 15.1 25.3 11.8 22 8Z" />
      </svg>
    );
  }
  if (type === 'necklace') {
    return (
      <svg {...common}>
        <path d="M4 6c1.8 11 6.1 18 12 20 5.9-2 10.2-9 12-20" />
        <path d="m12.2 20 3.8-5 3.8 5-3.8 5-3.8-5Z" />
      </svg>
    );
  }
  if (type === 'bracelet') {
    return (
      <svg {...common}>
        <ellipse cx="16" cy="16" rx="11.5" ry="8" />
        <path d="M6.7 11.6 9 14m14.3-2.4L21 14M12 8.7l1.3 3m6.7-3-1.3 3" />
        <circle cx="16" cy="9.2" r="2.4" />
      </svg>
    );
  }
  if (type === 'matchingPiece') {
    return (
      <svg {...common}>
        <path d="M11 5c-4.2 0-7 3.2-7 7.3 0 5 3.5 8.8 7 9.7 3.5-.9 7-4.7 7-9.7C18 8.2 15.2 5 11 5Z" />
        <path d="M21 10c-3 0-5 2.3-5 5.2 0 3.6 2.5 6.3 5 7 2.5-.7 5-3.4 5-7C26 12.3 24 10 21 10Z" />
      </svg>
    );
  }
  if (type === 'noStones') {
    return (
      <svg {...common}>
        <path d="M7 23c5-1.5 6.8-6.5 9-14 2.3 7.5 4.2 12.5 9 14" />
        <path d="M9 24c4.3 2.4 9.7 2.4 14 0" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M16 3 20 11l9 1-6.5 6 1.8 9L16 22.5 7.7 27l1.8-9L3 12l9-1 4-8Z" />
    </svg>
  );
}
