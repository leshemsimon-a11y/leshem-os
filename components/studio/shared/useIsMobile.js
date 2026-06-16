// components/studio/shared/useIsMobile.js
//
// LESHEM.S OS — Responsive hook (Clean 1)
//
// Dependency-free, SSR-safe media-query hook. Returns true below the given
// breakpoint. Used by the shell to switch between the desktop right-side nav
// rail and a compact mobile top-bar + slide-in drawer. No packages added.

import { useEffect, useState } from 'react';

export default function useIsMobile(breakpoint = 880) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;

    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setIsMobile(mq.matches);

    update();

    // addEventListener is the modern API; fall back for older Safari.
    if (mq.addEventListener) {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, [breakpoint]);

  return isMobile;
}
