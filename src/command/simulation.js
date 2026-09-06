import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { pointAt } from './mapGeometry.js'

/* DEMO movement simulation for the fleet.
   Deliberately isolated: it takes the static fleet records and emits, once
   per second, the same "telemetry" shape a real GPS/WebSocket feed would
   push (position, speed, ETA, distance, progress, location name).

   To go live later, replace this hook with one that subscribes to the real
   feed and returns the same map of { id -> telemetry } — the UI stays as-is. */

export function useFleetSim(fleet) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  return useMemo(() => {
    const telemetry = {}
    for (const amb of fleet) {
      const progress = (tick % amb.loopSeconds) / amb.loopSeconds
      const remaining = 1 - progress
      const pos = pointAt(amb.route, progress)
      telemetry[amb.id] = {
        id: amb.id,
        progress,
        position: pos,
        locationName: amb.segmentNames[Math.min(pos.segIndex, amb.segmentNames.length - 1)],
        speed: Math.max(8, amb.baseSpeed + Math.round(6 * Math.sin((tick + amb.route[0][0]) / 5))),
        etaSeconds: amb.etaSeconds * remaining,
        distanceKm: (amb.routeKm * remaining).toFixed(1),
        status: amb.status,
      }
    }
    return { tick, telemetry }
  }, [tick, fleet])
}

/* Corridor junction state for a given route progress:
   passed or imminent junctions are GREEN, the rest are still PREPARING. */
export function corridorJunctionState(junction, progress) {
  return junction.at <= progress + 0.3 ? 'GREEN' : 'PREPARING'
}

/* One shared simulation clock for every Command Center module.
   The shell runs useFleetSim once and provides { tick, telemetry } here, so
   Live Ambulances, Traffic Control and AI Vision all observe the same
   moment — exactly as they would with one real telemetry feed. */
export const FleetSimContext = createContext(null)

export function useSharedFleetSim() {
  const ctx = useContext(FleetSimContext)
  if (!ctx) throw new Error('useSharedFleetSim must be used inside CommandCenter')
  return ctx
}
