// pages/studio/inventory.js
//
// LESHEM.S OS — Clean Build: Inventory Studio (/studio/inventory)
//
// Clean 2. Renders the studio shell with the Inventory section active and the
// InventoryStudio experience as content. Fully isolated from "/" (MVP) and
// "/v2". Reads the EXISTING server-side Airtable route (/api/airtable/stones);
// adds no API route, no schema change, no writes, no Stability.

import StudioShell from '../../components/studio/shell/StudioShell';
import InventoryStudio from '../../components/studio/inventory/InventoryStudio';

export default function StudioInventoryPage() {
  return (
    <StudioShell
      initialSection="inventory"
      renderContent={() => <InventoryStudio />}
    />
  );
}
