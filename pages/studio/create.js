// pages/studio/create.js
//
// LESHEM.S OS — Clean 8L: Flagship Atelier Creation Experience (/studio/create).
//
// Mounts AtelierCreateShell — the ONE flagship scenario (stone → free-text
// request → understanding gate → 3 product-type-enforced directions →
// select → refine → presentation → save) — as the primary content of this
// page, inside the EXISTING app shell like every other studio page.
// /studio/design and /studio/workstation are untouched. No new packages,
// APIs, render engine, external AI, or persistence keys.

import StudioShell from '../../components/studio/shell/StudioShell';
import AtelierCreateShell from '../../components/studio/create/AtelierCreateShell';

export default function StudioCreatePage() {
  return (
    <StudioShell
      initialSection="builder"
      renderContent={() => <AtelierCreateShell />}
    />
  );
}
