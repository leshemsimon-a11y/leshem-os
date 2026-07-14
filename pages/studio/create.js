// pages/studio/create.js
//
// LESHEM.S OS — Clean 8A: Create Flow MVP (/studio/create).
//
// Clean 8K-R4 QA — focused Golden Path route. Keeps the global StudioShell
// navigation, but hides duplicate Active Session / Work Tray chrome and does
// not mount the legacy attached-assets strip beneath the guided flow. The
// flow itself owns the current context and one action per stage.

import StudioShell from '../../components/studio/shell/StudioShell';
import CreateFlowShell from '../../components/studio/create/CreateFlowShell';

export default function StudioCreatePage() {
  return (
    <StudioShell
      initialSection="newCreation"
      hideContextBars
      renderContent={() => <CreateFlowShell />}
    />
  );
}
