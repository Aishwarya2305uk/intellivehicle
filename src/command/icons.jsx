/* Lightweight inline icon set (Lucide-style: 24px grid, 2px round strokes).
   Zero-dependency replacement for lucide-react. */

function Icon({ size = 18, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const IconDashboard = (p) => (
  <Icon {...p}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </Icon>
)

export const IconAmbulance = (p) => (
  <Icon {...p}>
    <path d="M3 8a2 2 0 0 1 2-2h8v11H3z" />
    <path d="M13 9h4l4 4v4h-8" />
    <circle cx="7" cy="18" r="1.8" />
    <circle cx="17" cy="18" r="1.8" />
    <path d="M8 8.5v4M6 10.5h4" />
  </Icon>
)

export const IconTrafficLight = (p) => (
  <Icon {...p}>
    <rect x="8" y="2" width="8" height="20" rx="3.5" />
    <circle cx="12" cy="6.5" r="1.4" />
    <circle cx="12" cy="12" r="1.4" />
    <circle cx="12" cy="17.5" r="1.4" />
  </Icon>
)

export const IconRoute = (p) => (
  <Icon {...p}>
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="5.5" r="2.5" />
    <path d="M8 18.5h7.5a3.5 3.5 0 0 0 0-7h-7a3.5 3.5 0 0 1 0-7H16" />
  </Icon>
)

export const IconAIEye = (p) => (
  <Icon {...p}>
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M18.5 12c-1.6 2.8-3.8 4.2-6.5 4.2S7.1 14.8 5.5 12c1.6-2.8 3.8-4.2 6.5-4.2s4.9 1.4 6.5 4.2Z" />
  </Icon>
)

export const IconHospital = (p) => (
  <Icon {...p}>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M12 8v6M9 11h6" />
    <path d="M9 21v-3h6v3" />
  </Icon>
)

export const IconSiren = (p) => (
  <Icon {...p}>
    <path d="M7 18v-6a5 5 0 0 1 10 0v6" />
    <rect x="4" y="18" width="16" height="3" rx="1.2" />
    <path d="M12 2v2M4.5 4.5 6 6M19.5 4.5 18 6" />
  </Icon>
)

export const IconChart = (p) => (
  <Icon {...p}>
    <path d="M3 3v16a2 2 0 0 0 2 2h16" />
    <path d="M8 16v-4M13 16V8M18 16v-6" />
  </Icon>
)

export const IconActivity = (p) => (
  <Icon {...p}>
    <path d="M22 12h-4l-3 8L9 4l-3 8H2" />
  </Icon>
)

export const IconSettings = (p) => (
  <Icon {...p}>
    <path d="M4 21v-6M4 9V3M12 21v-9M12 6V3M20 21v-4M20 11V3" />
    <path d="M2 15h4M10 12h4M18 17h4" />
  </Icon>
)

export const IconSearch = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </Icon>
)

export const IconBell = (p) => (
  <Icon {...p}>
    <path d="M6 8.5a6 6 0 0 1 12 0c0 6.5 2.5 8.5 2.5 8.5h-17S6 15 6 8.5" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </Icon>
)

export const IconAlert = (p) => (
  <Icon {...p}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    <path d="M12 9v4M12 17h.01" />
  </Icon>
)

export const IconCamera = (p) => (
  <Icon {...p}>
    <rect x="2" y="6" width="13" height="12" rx="2.5" />
    <path d="m15 10.5 7-3.5v10l-7-3.5" />
  </Icon>
)

export const IconCpu = (p) => (
  <Icon {...p}>
    <rect x="5" y="5" width="14" height="14" rx="2" />
    <rect x="9.5" y="9.5" width="5" height="5" />
    <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
  </Icon>
)

export const IconGps = (p) => (
  <Icon {...p}>
    <path d="m3 11 18-8-8 18-2.5-7.5z" />
  </Icon>
)

export const IconCloud = (p) => (
  <Icon {...p}>
    <path d="M17.5 19a4.5 4.5 0 1 0-.6-8.96 7 7 0 0 0-13.2 2.46A4 4 0 0 0 6 19Z" />
  </Icon>
)

export const IconWifi = (p) => (
  <Icon {...p}>
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <path d="M12 20h.01" />
  </Icon>
)

export const IconRadio = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="1.6" />
    <path d="M8.5 15.5a5 5 0 0 1 0-7M15.5 8.5a5 5 0 0 1 0 7" />
    <path d="M5.6 18.4a9 9 0 0 1 0-12.8M18.4 5.6a9 9 0 0 1 0 12.8" />
  </Icon>
)

export const IconPin = (p) => (
  <Icon {...p}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0" />
    <circle cx="12" cy="10" r="3" />
  </Icon>
)

export const IconClock = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
)

export const IconGauge = (p) => (
  <Icon {...p}>
    <path d="m12 14 3.5-3.5" />
    <path d="M3.34 19a10 10 0 1 1 17.32 0" />
  </Icon>
)

export const IconZap = (p) => (
  <Icon {...p}>
    <path d="M13 2 3 14h8l-1 8 11-13h-8z" />
  </Icon>
)

export const IconUser = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
  </Icon>
)

export const IconShield = (p) => (
  <Icon {...p}>
    <path d="M12 22s8-3.2 8-10V5.5L12 2 4 5.5V12c0 6.8 8 10 8 10Z" />
    <path d="m9 12 2 2 4-4" />
  </Icon>
)

export const IconDatabase = (p) => (
  <Icon {...p}>
    <ellipse cx="12" cy="5" rx="8" ry="3" />
    <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
    <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
  </Icon>
)

export const IconCrosshair = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4" />
  </Icon>
)

export const IconEye = (p) => (
  <Icon {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
)

export const IconMenu = (p) => (
  <Icon {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Icon>
)

export const IconX = (p) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
)

export const IconLogout = (p) => (
  <Icon {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5M21 12H9" />
  </Icon>
)

export const IconArrowRight = (p) => (
  <Icon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
)
