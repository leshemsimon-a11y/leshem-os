// Command Center + Unified App Frame pass: same treatment as
// pages/studio/inventory.js — mounts inside the shared app shell instead of
// standalone. Same underlying screen (DemoInventoryWorkspace), same route.
import * as React from 'react';
import StudioShell from '../../components/studio/shell/StudioShell';
import DemoInventoryWorkspace from '../../components/studio/demo/DemoInventoryWorkspace';

export default function StudioInventoryDemoPage() {
  return (
    <StudioShell
      initialSection="inventory"
      fullBleed
      renderContent={() => <DemoInventoryWorkspace />}
    />
  );
}
