// Demo inventory route for LESHEM.S OS.
// If this project already has a real inventory page, keep a backup before replacing.
//
// Command Center + Unified App Frame pass: Inventory now mounts inside the
// same app-level StudioShell every other studio screen uses (fullBleed, like
// /studio/design), instead of rendering standalone with no navigation. The
// route is unchanged; only what wraps it changed.
import * as React from 'react';
import StudioShell from '../../components/studio/shell/StudioShell';
import DemoInventoryWorkspace from '../../components/studio/demo/DemoInventoryWorkspace';

export default function StudioInventoryPage() {
  return (
    <StudioShell
      initialSection="inventory"
      fullBleed
      renderContent={() => <DemoInventoryWorkspace />}
    />
  );
}
