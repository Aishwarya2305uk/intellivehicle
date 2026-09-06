import { useMemo } from 'react'
import { JUNCTIONS } from './junctions.js'
import { getApproaches, WINDOW } from './signalLogic.js'

/* AI Vision detection engine — DEMO/SIMULATION.

   This module fakes what a Python/OpenCV/YOLO inference service would
   return for each camera: a list of detections (class, confidence,
   bounding box in a 320x180 frame), a vehicle count, a density estimate,
   and an emergency-vehicle result tied to the camera's junction.

   The emergency result reuses the SAME approach windows as signalLogic, so
   what a camera "sees" always agrees with what the Traffic Control page
   does: DETECTED → PRIORITY (request sent) → GREEN (signal switched) →
   junction back to normal after the ambulance passes.

   To go live later: replace useVisionFeed with a hook that polls the real
   inference API and returns the same { cameraId -> result } shape. */

export const FRAME = { w: 320, h: 180 }

const CLASSES = ['car', 'car', 'car', 'bike', 'truck', 'car', 'bus']
const SIZE = { car: [30, 17], bike: [15, 13], truck: [38, 23], bus: [40, 25] }

/* Pipeline stage from route-progress delta (same thresholds as the signals). */
export function stageFor(delta) {
  if (delta == null) return null
  if (delta <= WINDOW.green) return 'GREEN'
  if (delta <= WINDOW.prepare) return 'PRIORITY'
  if (delta <= WINDOW.detect) return 'DETECTED'
  return null
}

/* Pure event history: because the simulation is deterministic, the recent
   detection timeline can be recomputed from ticks alone — no stored state.
   A live system would instead stream these events from the inference API. */
export function detectionEvents(fleet, cameras, tick, epochMs, span = 240, max = 8) {
  const start = Math.max(0, tick - span)
  const prev = {}
  const events = []

  for (let t = start; t <= tick; t++) {
    const telemetry = {}
    for (const amb of fleet) {
      telemetry[amb.id] = { progress: (((t % amb.loopSeconds) + amb.loopSeconds) % amb.loopSeconds) / amb.loopSeconds }
    }
    for (const cam of cameras) {
      const junction = JUNCTIONS.find((j) => j.id === cam.junctionId)
      if (!junction) continue
      const lead = getApproaches(fleet, telemetry, junction)[0] || null
      const stage = lead ? stageFor(lead.delta) : null
      const was = prev[cam.id] ?? null
      if (t > start && stage !== was) {
        const ts = new Date(epochMs + t * 1000).toLocaleTimeString('en-GB')
        if (stage === 'DETECTED' && lead) {
          events.push({ t, ts, tone: 'amber', text: `${cam.id} · Ambulance ${lead.id} detected on ${cam.road}` })
        } else if (stage === 'PRIORITY' && lead) {
          events.push({ t, ts, tone: 'green', text: `${cam.id} → Priority request sent to ${cam.junctionId} for ${lead.id}` })
        } else if (stage === 'GREEN' && lead) {
          events.push({ t, ts, tone: 'green', text: `${cam.junctionId} switched GREEN — corridor active for ${lead.id}` })
        } else if (stage === null && was) {
          events.push({ t, ts, tone: 'dim', text: `${cam.id} · ${cam.junctionId} back to normal monitoring` })
        }
      }
      prev[cam.id] = stage
    }
  }

  return events.sort((a, b) => b.t - a.t).slice(0, max)
}

export function useVisionFeed(fleet, telemetry, tick, cameras) {
  return useMemo(() => {
    const out = {}
    for (const cam of cameras) {
      const junction = JUNCTIONS.find((j) => j.id === cam.junctionId)
      const approaches = junction ? getApproaches(fleet, telemetry, junction) : []
      const lead = approaches[0] || null
      const stage = lead ? stageFor(lead.delta) : null

      const vehicleCount = Math.max(4, cam.baseCount + Math.round(6 * Math.sin((tick + cam.seed * 5) / 9)))
      const density = vehicleCount < 16 ? 'LOW' : vehicleCount < 30 ? 'MEDIUM' : 'HIGH'

      // Ordinary traffic detections drifting through the frame.
      const n = 3 + (cam.seed % 3)
      const detections = []
      for (let i = 0; i < n; i++) {
        const seed = cam.seed * 31 + i * 37
        const cls = CLASSES[seed % CLASSES.length]
        const dir = i % 2 === 0 ? 1 : -1
        const speed = 2 + (seed % 3)
        const t = ((((tick * speed * dir + seed * 11) % 240) + 240) % 240) / 240
        const scale = 0.35 + t * 0.8
        const [bw, bh] = SIZE[cls]
        const w = bw * scale
        const h = bh * scale
        const lane = (i % 3) - 1 // -1, 0, 1
        const x = FRAME.w / 2 + lane * (16 + t * 62) - w / 2
        const y = 36 + t * 128 - h / 2
        const conf = Math.min(0.97, 0.82 + (seed % 13) / 100 + 0.01 * Math.sin(tick / 3 + i))
        detections.push({ id: `${cam.id}-${i}`, cls, conf, x, y, w, h })
      }

      // Emergency vehicle detection driven by real fleet telemetry.
      let emergency = null
      if (stage && lead) {
        const closeness = 1 - Math.min(Math.max(lead.delta, 0), WINDOW.detect) / WINDOW.detect
        const scale = 0.45 + closeness * 0.75
        const w = 34 * scale
        const h = 21 * scale
        emergency = {
          ambId: lead.id,
          level: lead.level,
          stage,
          etaSeconds: lead.etaSeconds,
          conf: Math.min(0.98, 0.93 + 0.02 * Math.sin(tick / 4 + cam.seed)),
          box: { x: FRAME.w / 2 - w / 2, y: 34 + closeness * 122 - h / 2, w, h },
        }
      }

      out[cam.id] = {
        cameraId: cam.id,
        vehicleCount,
        density,
        detections,
        emergency,
        stage,
        incident: cam.incident || null,
        junctionName: junction?.name || cam.junctionId,
      }
    }
    return out
  }, [fleet, telemetry, tick, cameras])
}
