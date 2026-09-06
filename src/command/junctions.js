/* Intersection registry — DEMO/SIMULATION.
   Positions live on the shared city map grid (860 x 560), so junctions can be
   matched against ambulance route polylines. In a real deployment each entry
   maps to a physical signal controller (ESP32/Raspberry Pi) reachable over
   MQTT — the id is the controller address, the rest is display metadata. */

export const JUNCTIONS = [
  {
    id: 'J01',
    name: 'Junction 01',
    road: 'MG Road × Ring Road',
    pos: [300, 400],
    cycleOffset: 6,
    density: 'HIGH',
    baseWaiting: 14,
    corridor: true,
  },
  {
    id: 'J02',
    name: 'Junction 02',
    road: 'MG Road × Old Market Road',
    pos: [300, 260],
    cycleOffset: 20,
    density: 'MEDIUM',
    baseWaiting: 9,
    corridor: true,
  },
  {
    id: 'J03',
    name: 'Junction 03',
    road: 'Hospital Road × MG Road North',
    pos: [480, 120],
    cycleOffset: 34,
    density: 'MEDIUM',
    baseWaiting: 7,
    corridor: true,
  },
  {
    id: 'J04',
    name: 'Ring Road Junction',
    road: 'Ring Road × South Avenue',
    pos: [480, 400],
    cycleOffset: 12,
    density: 'HIGH',
    baseWaiting: 18,
  },
  {
    id: 'J05',
    name: 'Lakeview Junction',
    road: 'Ring Road × Lakeview Road',
    pos: [660, 400],
    cycleOffset: 27,
    density: 'MEDIUM',
    baseWaiting: 11,
  },
  {
    id: 'J06',
    name: 'Station Road Junction',
    road: 'Station Road × North Loop',
    pos: [120, 260],
    cycleOffset: 41,
    density: 'LOW',
    baseWaiting: 4,
  },
]
