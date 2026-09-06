import { progressAtPoint } from './mapGeometry.js'
import { EMERGENCY_LEVELS } from './fleet.js'

/* Signal-control logic — pure functions, DEMO/SIMULATION.

   This module is the "controller brain" for the Traffic Control page.
   Everything is computed from (junction registry, fleet telemetry, tick,
   operator overrides) — there is no hidden state, so replacing simulated
   telemetry with a live MQTT/GPS feed later changes nothing here.

   Priority lifecycle for an emergency vehicle approaching a junction:
   DETECTED → PREPARING (cross traffic stopped) → PRIORITY GREEN →
   ambulance passes → junction returns to its normal cycle. */

export const CYCLE = { green: 24, yellow: 4, red: 26, total: 54 }

/* Approach windows expressed as route-progress deltas (fraction of route). */
const WINDOW = {
  detect: 0.3,    // ambulance flagged as inbound
  prepare: 0.14,  // cross traffic gets stopped
  green: 0.09,    // corridor direction forced green
  passed: -0.05,  // beyond this the ambulance has cleared the junction
}

export function normalPhase(tick, offset) {
  const t = (((tick + offset) % CYCLE.total) + CYCLE.total) % CYCLE.total
  if (t < CYCLE.green) return { signal: 'green', remaining: CYCLE.green - t }
  if (t < CYCLE.green + CYCLE.yellow) return { signal: 'amber', remaining: CYCLE.green + CYCLE.yellow - t }
  return { signal: 'red', remaining: CYCLE.total - t }
}

export function crossSignalOf(signal) {
  return signal === 'green' ? 'red' : signal === 'red' ? 'green' : 'amber'
}

/* Emergency vehicles (CRITICAL/HIGH) currently heading toward a junction,
   highest priority first. */
export function getApproaches(fleet, telemetry, junction) {
  const list = []
  for (const amb of fleet) {
    if (EMERGENCY_LEVELS[amb.level].rank > EMERGENCY_LEVELS.HIGH.rank) continue
    const at = progressAtPoint(amb.route, junction.pos)
    if (at == null) continue
    const tel = telemetry[amb.id]
    if (!tel) continue
    const delta = at - tel.progress
    if (delta < WINDOW.passed || delta > WINDOW.detect) continue
    list.push({
      id: amb.id,
      level: amb.level,
      delta,
      etaSeconds: Math.max(0, Math.round(delta * amb.loopSeconds)),
    })
  }
  return list.sort(
    (a, b) => EMERGENCY_LEVELS[a.level].rank - EMERGENCY_LEVELS[b.level].rank || a.delta - b.delta
  )
}

/* Full display state for one junction on one tick. */
export function computeJunctionState(junction, tick, approaches, override) {
  const normal = normalPhase(tick, junction.cycleOffset)
  const active = approaches[0] || null
  const queued = approaches.slice(1)

  let state
  if (override) {
    state = {
      mode: 'MANUAL',
      signal: override,
      remaining: null,
      status: `Manual override — holding ${override.toUpperCase()}`,
    }
  } else if (active && active.delta <= WINDOW.green) {
    state = {
      mode: 'PRIORITY',
      signal: 'green',
      remaining: null,
      status:
        active.delta <= 0.035
          ? `${active.id} passing through junction`
          : `Priority green — clearing path for ${active.id}`,
    }
  } else if (active && active.delta <= WINDOW.prepare) {
    state = {
      mode: 'PRIORITY',
      signal: 'amber',
      remaining: active.etaSeconds,
      status: `Preparing — stopping cross traffic for ${active.id}`,
    }
  } else if (active) {
    state = {
      mode: 'AUTO',
      detected: true,
      ...normal,
      status: `Ambulance detected — ${active.id} inbound, ~${active.etaSeconds}s out`,
    }
  } else {
    state = { mode: 'AUTO', ...normal, status: 'Normal automatic cycle' }
  }

  // Simulated queue length at the stop line.
  const wobble = Math.round(4 * Math.sin((tick + junction.cycleOffset * 3) / 6))
  const phaseLoad = state.signal === 'red' ? 5 : state.signal === 'amber' ? 2 : -4
  const waiting = Math.max(0, junction.baseWaiting + wobble + phaseLoad)

  return {
    ...state,
    cross: state.mode === 'PRIORITY' ? 'red' : crossSignalOf(state.signal),
    density: junction.density,
    waiting,
    active,
    queued,
  }
}

/* Corridor node state for the corridor strip. */
export function corridorNodeState(delta) {
  if (delta < WINDOW.passed) return 'CLEARED'
  if (delta <= WINDOW.prepare) return 'GREEN'
  if (delta <= WINDOW.detect) return 'PREPARING'
  return 'STANDBY'
}

export { WINDOW }
