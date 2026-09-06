/* Hospital arrival coordination logic — pure functions, DEMO/SIMULATION.

   Derives an ambulance's arrival phase from its route progress in the
   shared fleet simulation, so this page, Live Ambulances and the Green
   Corridor all agree on the journey state. With real GPS later, progress
   comes from the live feed and nothing here changes. */

export const ARRIVAL_PHASES = {
  EN_ROUTE:    { label: 'EN ROUTE',    tone: 'blue',   rank: 0 },
  APPROACHING: { label: 'APPROACHING', tone: 'amber',  rank: 1 },
  ARRIVING:    { label: 'ARRIVING',    tone: 'yellow', rank: 2 },
  ARRIVED:     { label: 'ARRIVED',     tone: 'green',  rank: 3 },
}

export function arrivalPhaseFor(progress) {
  if (progress >= 0.96) return 'ARRIVED'
  if (progress >= 0.88) return 'ARRIVING'
  if (progress >= 0.7) return 'APPROACHING'
  return 'EN_ROUTE'
}

/* The journey flow shown on the coordination page:
   Route Active → Green Corridor → Approaching Hospital → Hospital Arrived. */
export function journeySteps(amb, phase) {
  const rank = ARRIVAL_PHASES[phase].rank
  const hasCorridor = !!amb.corridor?.active
  // index of the currently active step for this phase
  const activeIdx = rank === 0 ? (hasCorridor ? 1 : 0) : rank === 3 ? 3 : 2
  const labels = [
    'Route Active',
    hasCorridor ? 'Green Corridor Active' : 'Standard Route (no corridor)',
    'Approaching Hospital',
    'Hospital Arrived',
  ]
  return labels.map((label, i) => ({
    label,
    state: rank === 3 ? 'done' : i < activeIdx ? 'done' : i === activeIdx ? 'active' : 'pending',
  }))
}

/* Only hospital-bound ambulances take part in arrival coordination
   (e.g. a unit returning to its base station is excluded). */
export function isHospitalBound(amb) {
  return amb.destination.toLowerCase().includes('hospital')
}

/* Receiving status for one hospital, from its most advanced inbound unit. */
export function hospitalStatus(inboundPhases) {
  const ranks = inboundPhases.map((p) => ARRIVAL_PHASES[p].rank)
  const top = Math.max(-1, ...ranks)
  if (top >= 2) return { label: 'RECEIVING', tone: 'green' }
  if (top === 1) return { label: 'ALERTED', tone: 'amber' }
  return { label: 'STANDBY', tone: '' }
}
