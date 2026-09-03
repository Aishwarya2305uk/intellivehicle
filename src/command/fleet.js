/* Fleet data model — DEMO/SIMULATION.
   This is the single source of truth for ambulance records shown in the
   Live Ambulances module. Each record mirrors the payload a real
   GPS/WebSocket feed would deliver later, so swapping in live data means
   replacing useFleetSim (simulation.js) — not redesigning the UI.

   Routes are polylines in the shared MAP coordinate space (860 x 560),
   following the road grid defined in data.js. */

export const EMERGENCY_LEVELS = {
  CRITICAL: { rank: 0, tone: 'red', label: 'CRITICAL' },
  HIGH:     { rank: 1, tone: 'amber', label: 'HIGH' },
  MEDIUM:   { rank: 2, tone: 'yellow', label: 'MEDIUM' },
  NORMAL:   { rank: 3, tone: 'blue', label: 'NORMAL' },
}

export const FLEET = [
  {
    id: 'AMB-104',
    level: 'CRITICAL',
    driver: 'R. Sharma',
    status: 'En Route',
    destination: 'City Care Hospital',
    routeKm: 2.4,
    baseSpeed: 62,
    etaSeconds: 272, // 04:32 at route start
    loopSeconds: 180,
    route: [
      [55, 500], [300, 500], [300, 260], [480, 260], [480, 120], [648, 120],
    ],
    segmentNames: ['Main Road', 'MG Road', 'Cross Street', 'MG Road North', 'Hospital Road'],
    corridor: {
      active: true,
      junctions: [
        { name: 'Junction 01', at: 0.3 },
        { name: 'Junction 02', at: 0.55 },
        { name: 'Junction 03', at: 0.82 },
      ],
      signalsCoordinated: 3,
      timeSavedMin: 8,
    },
  },
  {
    id: 'AMB-108',
    level: 'HIGH',
    driver: 'S. Iyer',
    status: 'En Route',
    destination: 'Apollo Demo Hospital',
    routeKm: 3.1,
    baseSpeed: 48,
    etaSeconds: 420,
    loopSeconds: 230,
    route: [
      [480, 545], [480, 400], [300, 400], [300, 120], [140, 120],
    ],
    segmentNames: ['South Avenue', 'Ring Road', 'MG Road', 'Station Road'],
    corridor: null,
  },
  {
    id: 'AMB-102',
    level: 'MEDIUM',
    driver: 'A. Khan',
    status: 'En Route',
    destination: 'Metro Hospital',
    routeKm: 3.8,
    baseSpeed: 34,
    etaSeconds: 660,
    loopSeconds: 300,
    route: [
      [40, 400], [480, 400], [660, 400], [660, 260], [770, 246],
    ],
    segmentNames: ['Ring Road West', 'Ring Road', 'Lakeview Road', 'Metro Approach'],
    corridor: null,
  },
  {
    id: 'AMB-110',
    level: 'NORMAL',
    driver: 'P. Nair',
    status: 'Returning',
    destination: 'Base Station 02',
    routeKm: 2.1,
    baseSpeed: 40,
    etaSeconds: 360,
    loopSeconds: 260,
    route: [
      [40, 120], [120, 120], [120, 260], [300, 260], [300, 400], [120, 400],
    ],
    segmentNames: ['North Loop', 'Station Road', 'Old Market Road', 'Cross Street', 'Ring Road'],
    corridor: null,
  },
]

export const FLEET_STATUSES = [...new Set(FLEET.map((a) => a.status))]
export const FLEET_DESTINATIONS = [...new Set(FLEET.map((a) => a.destination))]

export function sortByPriority(list) {
  return [...list].sort((a, b) => EMERGENCY_LEVELS[a.level].rank - EMERGENCY_LEVELS[b.level].rank)
}

export function formatEta(seconds) {
  const s = Math.max(0, Math.round(seconds))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}
