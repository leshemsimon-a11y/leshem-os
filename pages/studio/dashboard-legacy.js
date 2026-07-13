// pages/studio/dashboard-legacy.js
//
// LESHEM.S OS — Clean 8K-R2: Welcome Studio + One Flow Experience.
//
// Preserves the EXACT pre-8K-R2 dashboard experience (statistics, activity,
// inventory pulse — components/studio/shell/UnifiedDashboard.js) at its own
// route, now that "/studio" itself mounts the new Welcome Studio. Nothing
// about UnifiedDashboard.js or the outer StudioShell's dashboard rendering
// path was changed — this file just gives that existing, working content a
// dedicated URL so it stays reachable via the "dashboard" nav item, per
// "do not delete working routes."

import StudioShell from '../../components/studio/shell/StudioShell';

export default function DashboardLegacyPage() {
  return <StudioShell initialSection="dashboard" />;
}
