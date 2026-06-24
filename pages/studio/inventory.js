// pages/studio/inventory.js
//
// LESHEM.S OS — Clean Build: Inventory Studio (/studio/inventory)
//
// Clean 2. Renders the studio shell with the Inventory section active and the
// InventoryStudio experience as content. Fully isolated from "/" (MVP) and
// "/v2". Reads the EXISTING server-side Airtable route (/api/airtable/stones);
// adds no API route, no schema change, no writes, no Stability.

import { useRouter } from 'next/router';
import StudioShell from '../../components/studio/shell/StudioShell';
import InventoryStudio from '../../components/studio/inventory/InventoryStudio';

export default function StudioInventoryPage() {
  const router = useRouter();
  // Clean 4C.2 — Dashboard guided cards may request the quick-add flow:
  //   ?add=1       → open quick-add (default source)
  //   ?add=client  → open quick-add with client-owned source preselected
  const addParam = router.query ? router.query.add : null;
  const initialAddOpen = addParam === '1' || addParam === 'client';
  const initialAddSource = addParam === 'client' ? 'clientOwned' : null;

  return (
    <StudioShell
      initialSection="inventory"
      renderContent={() => (
        <InventoryStudio
          initialAddOpen={initialAddOpen}
          initialAddSource={initialAddSource}
        />
      )}
    />
  );
}
