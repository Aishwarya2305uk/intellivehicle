/* Smart priority & route decision logic — pure functions, DEMO/SIMULATION.

   Ranks every active ambulance from live telemetry and compares its current
   route against a pre-computed alternative. Everything derives from the
   shared simulation feed; with real GPS + a routing engine (OSRM/Google
   Directions) later, only the inputs change — the scoring, ranking and
   recommendation logic stay exactly as they are. */

const LEVEL_BASE = { CRITICAL: 50, HIGH: 36, MEDIUM: 22, NORMAL: 8 }
const LEVEL_DYN = { CRITICAL: 45, HIGH: 38, MEDIUM: 30, NORMAL: 20 }
const TRAFFIC_NORM = { HIGH: 1, MEDIUM: 0.55, LOW: 0.2 }
const TRAFFIC_MULT = { HIGH: 1.25, MEDIUM: 1.0, LOW: 0.85 }

const clamp01 = (v) => Math.min(1, Math.max(0, v))

/* Composite priority score (0–100) with an explainable breakdown:
   emergency level dominates; ETA urgency, destination proximity and route
   congestion modulate within the level's dynamic band. */
export function priorityScore(amb, tel) {
  const eta = tel?.etaSeconds ?? amb.etaSeconds
  const dist = parseFloat(tel?.distanceKm ?? amb.routeKm)
  const urgency = clamp01(1 - eta / 720)
  const proximity = clamp01(1 - dist / 6)
  const traffic = TRAFFIC_NORM[amb.routeTraffic] ?? 0.5
  const dyn = LEVEL_DYN[amb.level]

  const factors = {
    level: { label: 'Emergency level', pts: LEVEL_BASE[amb.level], max: 50 },
    urgency: { label: 'ETA urgency', pts: Math.round(dyn * 0.45 * urgency), max: Math.round(dyn * 0.45) },
    proximity: { label: 'Proximity', pts: Math.round(dyn * 0.3 * proximity), max: Math.round(dyn * 0.3) },
    traffic: { label: 'Traffic density', pts: Math.round(dyn * 0.25 * traffic), max: Math.round(dyn * 0.25) },
  }
  const score = Object.values(factors).reduce((s, f) => s + f.pts, 0)
  return { score, factors }
}

/* Fleet ranked by live score, highest priority first. */
export function rankFleet(fleet, telemetry) {
  return fleet
    .map((amb) => ({ amb, tel: telemetry[amb.id], ...priorityScore(amb, telemetry[amb.id]) }))
    .sort((a, b) => b.score - a.score)
    .map((entry, i) => ({ ...entry, rank: i + 1 }))
}

/* Current vs alternative route comparison for one ambulance.
   ETAs adjust the live ETA by relative distance and congestion multipliers. */
export function routeOptions(amb, tel) {
  const eta = Math.max(1, tel?.etaSeconds ?? amb.etaSeconds)
  const dist = Math.max(0.1, parseFloat(tel?.distanceKm ?? amb.routeKm))
  const alt = amb.altRoute
  const curMult = TRAFFIC_MULT[amb.routeTraffic] ?? 1

  const altDist = dist + alt.extraKm
  const altEta = (eta / curMult) * (TRAFFIC_MULT[alt.traffic] ?? 1) * (altDist / dist)

  const current = {
    key: 'current',
    name: 'Current Route',
    via: amb.segmentNames.join(' → '),
    distanceKm: dist.toFixed(1),
    etaSeconds: eta,
    traffic: amb.routeTraffic,
    corridor: !!amb.corridor?.active,
  }
  const alternative = {
    key: 'alt',
    name: `Alternative — ${alt.name}`,
    via: alt.via,
    distanceKm: altDist.toFixed(1),
    etaSeconds: Math.round(altEta),
    traffic: alt.traffic,
    corridor: false,
    note: alt.note,
  }

  const recommended = altEta < eta * 0.97 ? 'alt' : 'current'
  const savedSec = Math.abs(Math.round(eta - altEta))
  const reason =
    recommended === 'alt'
      ? `~${Math.max(1, Math.round(savedSec / 60))} min faster — lower congestion on ${alt.name.toLowerCase()}`
      : current.corridor
        ? 'Fastest ETA and keeps the coordinated green corridor'
        : 'Fastest ETA under current traffic conditions'

  return { current, alternative, recommended, reason }
}
