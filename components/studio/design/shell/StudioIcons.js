// components/studio/design/shell/StudioIcons.js
//
// LESHEM.S OS — Clean 5D Visual Studio Shell — inline SVG icon set.
//
// A tiny, dependency-free icon helper. No external icon library (lucide-react
// is NOT installed and no new packages are added in this milestone). All icons
// share one consistent stroke style and a single <Icon> wrapper so sizing and
// color stay uniform across the workstation chrome.
//
// Presentational only — no business logic, no state.

import * as React from 'react';

// Shared wrapper: consistent viewBox, stroke width, rounded joins, currentColor.
function Icon({ size = 20, stroke = 1.6, title, children, style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      style={style}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

// ---- Workflow rail ----
export const StoneIcon = (p) => (
  <Icon {...p}>
    <path d="M6 3h12l3 6-9 12L3 9l3-6z" />
    <path d="M3 9h18M9 3l-3 6 6 12 6-12-3-6M9 9l3 12 3-12" />
  </Icon>
);

export const ProductIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="14" r="6" />
    <path d="M9 8l1.5-3h3L15 8" />
    <circle cx="12" cy="14" r="2.4" />
  </Icon>
);

export const DesignIcon = (p) => (
  <Icon {...p}>
    <path d="M3 17.5L14 6.5l3.5 3.5L6.5 21H3v-3.5z" />
    <path d="M13 7.5l3.5 3.5M15 5l1.6-1.6a1.5 1.5 0 0 1 2.1 0l.4.4a1.5 1.5 0 0 1 0 2.1L17.5 7.5" />
  </Icon>
);

export const BriefIcon = (p) => (
  <Icon {...p}>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M9 8h6M9 12h6M9 16h4" />
  </Icon>
);

export const ProductionIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
  </Icon>
);

// ---- Inspector rows ----
export const CenterStoneIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3l5 5-5 13L7 8l5-5z" />
    <circle cx="12" cy="9" r="1.5" />
  </Icon>
);

export const SideStoneIcon = (p) => (
  <Icon {...p}>
    <path d="M7 6l3 3-3 7-3-7 3-3zM17 6l3 3-3 7-3-7 3-3z" />
  </Icon>
);

export const MetalIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3.4" />
  </Icon>
);

export const SettingIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="13" r="5" />
    <path d="M12 8V4M9 5l1.5 2M15 5l-1.5 2" />
  </Icon>
);

export const StyleIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5L12 3z" />
  </Icon>
);

export const FeasibilityIcon = (p) => (
  <Icon {...p}>
    <path d="M5 12l4 4 10-10" />
  </Icon>
);

// ---- Utility ----
export const SaveIcon = (p) => (
  <Icon {...p}>
    <path d="M5 3h11l3 3v15H5V3z" />
    <path d="M8 3v6h7V3M8 21v-6h8v6" />
  </Icon>
);

export const RefreshIcon = (p) => (
  <Icon {...p}>
    <path d="M20 11a8 8 0 1 0-.6 4M20 5v6h-6" />
  </Icon>
);

export const RemoveIcon = (p) => (
  <Icon {...p}>
    <path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13" />
  </Icon>
);

export const CheckIcon = (p) => (
  <Icon {...p}>
    <path d="M5 12l5 5L20 6" />
  </Icon>
);

export const ChevronIcon = (p) => (
  <Icon {...p}>
    <path d="M9 6l6 6-6 6" />
  </Icon>
);

export const CopyIcon = (p) => (
  <Icon {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h8" />
  </Icon>
);

export const SparkIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
    <path d="M12 9l1.5 1.5L12 12l-1.5-1.5L12 9z" />
  </Icon>
);

export const AlertIcon = (p) => (
  <Icon {...p}>
    <path d="M12 4l9 16H3l9-16z" />
    <path d="M12 10v4M12 17h.01" />
  </Icon>
);

export const DotIcon = ({ size = 10, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" aria-hidden="true">
    <circle cx="5" cy="5" r="5" fill={color} />
  </svg>
);

// ---- Clean 5D-R2 — visual placeholders (decorative; no logic) ----

// An elegant ring silhouette used as the empty/preview jewelry placeholder.
export const RingSilhouette = ({ size = 140, stroke = 1.4 }) => (
  <svg width={size} height={size} viewBox="0 0 160 160" fill="none" aria-hidden="true">
    <circle cx="80" cy="96" r="46" stroke="currentColor" strokeWidth={stroke} />
    <circle cx="80" cy="96" r="34" stroke="currentColor" strokeWidth={stroke} opacity="0.5" />
    <path
      d="M80 50l9 14H71l9-14z"
      fill="currentColor"
      opacity="0.18"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinejoin="round"
    />
    <path d="M71 64h18M76 50h8" stroke="currentColor" strokeWidth={stroke} opacity="0.6" />
  </svg>
);

// A faceted stone placeholder for chips/slots.
export const StoneFacets = ({ size = 40, stroke = 1.3 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <path d="M12 8h24l8 12-20 22L4 20l8-12z" stroke="currentColor" strokeWidth={stroke} strokeLinejoin="round" />
    <path d="M4 20h40M18 8l-6 12 12 22 12-22-6-12M24 8v34" stroke="currentColor" strokeWidth={stroke} opacity="0.55" strokeLinejoin="round" />
  </svg>
);

export const PlusIcon = (p) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const HomeIcon = (p) => (
  <Icon {...p}>
    <path d="M4 11l8-7 8 7M6 10v9h12v-9" />
  </Icon>
);

// ---- Clean 5D-R3 — guided start-state icon (additive) ----

// A simple open work-tray glyph for the "פתח מגש עבודה" start choice.
export const TrayIcon = (p) => (
  <Icon {...p}>
    <path d="M4 13h4l2 3h4l2-3h4" />
    <path d="M5 13l1.6-7h10.8L19 13" />
    <path d="M4 13v5.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V13" />
  </Icon>
);

export default Icon;
