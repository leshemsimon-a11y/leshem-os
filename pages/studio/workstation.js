// pages/studio/workstation.js
//
// LESHEM.S OS — Clean 6D: Studio Workstation Prototype (/studio/workstation).
//
// A SAFE PARALLEL exploration of the North Star workstation direction.
// Mounts the EXISTING app shell (same as /studio/design: initialSection
// "builder", fullBleed) with the new WorkstationShell as content — so the
// app frame, navigation, and the stable /studio/design screen are untouched.
// This route does NOT replace /studio/design; it is reached by direct URL
// only (no nav change in this milestone). Functional prototype: it works
// against the same Work Tray / design brief stores through their existing
// public exports. No protected file edited, no new store, no new
// persistence key, no render engine, no Airtable, no new package.

import StudioShell from '../../components/studio/shell/StudioShell';
import WorkstationShell from '../../components/studio/design/workstation/WorkstationShell';

export default function StudioWorkstationPage() {
  return (
    <StudioShell
      initialSection="builder"
      fullBleed
      renderContent={() => <WorkstationShell />}
    />
  );
}
