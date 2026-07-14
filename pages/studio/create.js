// pages/studio/create.js
//
// LESHEM.S OS — Clean 9A: Flagship Creation + Render Flow (/studio/create).
//
// Mounts FlagshipCreateShell — the ONE flagship journey (stone/idea/
// collection entry → intake → understanding → 3 product-type-enforced
// directions → refine → render preparation → save/present) — as the primary
// content of this page, inside the EXISTING app shell like every other
// studio page. /studio/design and /studio/workstation are untouched. No new
// packages, APIs, render engine, external AI, pricing, or persistence keys.

import StudioShell from '../../components/studio/shell/StudioShell';
import FlagshipCreateShell from '../../components/studio/create/FlagshipCreateShell';

export default function StudioCreatePage() {
  return (
    <StudioShell
      initialSection="builder"
      renderContent={() => <FlagshipCreateShell />}
      fullBleed
    />
  );
}
