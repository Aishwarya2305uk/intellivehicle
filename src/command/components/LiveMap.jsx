import { MAP } from '../data.js'
import { EMERGENCY_LEVELS } from '../fleet.js'
import { corridorJunctionState } from '../simulation.js'
import { Pill, Dot } from './ui.jsx'
import { pointAt, toPath } from '../mapGeometry.js'
import { Signal, HospitalMarker, AmbulanceMarker, BaseCity } from './mapShared.jsx'

/* Large tracking map for the Live Ambulances module.
   Renders the whole fleet; the selected ambulance shows its route
   (green-corridor styled when a corridor is active) and route signals. */
export default function LiveMap({ fleet, telemetry, selectedId, onSelect, visibleIds, showRoute }) {
  const { w, h, hospitals, otherSignals } = MAP
  const selected = fleet.find((a) => a.id === selectedId)
  const selectedTel = selected ? telemetry[selected.id] : null
  const corridorActive = !!selected?.corridor?.active

  return (
    <div className="cc-map-wrap cc-map-tall">
      <svg className="cc-map-svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" role="img"
        aria-label="Live ambulance tracking map (simulation)">
        <BaseCity idPrefix="cc-live" />

        {/* selected ambulance route */}
        {selected && showRoute && (
          <>
            <path d={toPath(selected.route)} fill="none"
              stroke={corridorActive ? 'rgba(34,197,94,0.22)' : 'rgba(59,130,246,0.2)'}
              strokeWidth="12" strokeLinejoin="round" strokeLinecap="round" />
            <path className="cc-route-dash" d={toPath(selected.route)} fill="none"
              stroke={corridorActive ? 'var(--cc-green)' : 'var(--cc-primary)'}
              strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" filter="url(#cc-live-glow)" />
          </>
        )}

        {/* background signals */}
        {otherSignals.map((s, i) => <Signal key={`o${i}`} {...s} />)}

        {/* corridor signals along the selected route */}
        {selected && showRoute && corridorActive && selectedTel &&
          selected.corridor.junctions.map((j) => {
            const p = pointAt(selected.route, j.at)
            const state = corridorJunctionState(j, selectedTel.progress) === 'GREEN' ? 'green' : 'amber'
            return <Signal key={j.name} x={p.x} y={p.y} state={state} />
          })}

        {/* hospitals */}
        {hospitals.map((hos) => <HospitalMarker key={hos.name} {...hos} />)}

        {/* fleet markers */}
        {fleet.map((amb) => {
          const tel = telemetry[amb.id]
          if (!tel) return null
          return (
            <AmbulanceMarker
              key={amb.id}
              x={tel.position.x}
              y={tel.position.y}
              id={amb.id}
              tone={EMERGENCY_LEVELS[amb.level].tone}
              pulse={amb.level === 'CRITICAL'}
              selected={amb.id === selectedId}
              dimmed={!visibleIds.has(amb.id)}
              animated
              onClick={() => onSelect(amb.id)}
            />
          )
        })}
      </svg>

      <div className="cc-map-live">
        <Pill tone="blue"><Dot pulse /> LIVE SIMULATION</Pill>
      </div>

      <div className="cc-map-legend">
        <span><span className="cc-leg-dot" style={{ background: 'var(--cc-red)' }} /> Critical</span>
        <span><span className="cc-leg-dot" style={{ background: 'var(--cc-amber)' }} /> High</span>
        <span><span className="cc-leg-dot" style={{ background: 'var(--cc-yellow)' }} /> Medium</span>
        <span><span className="cc-leg-dot" style={{ background: 'var(--cc-primary)' }} /> Normal</span>
        <span><span className="cc-leg-dot" style={{ background: 'var(--cc-green)' }} /> Hospital / Green signal</span>
      </div>
    </div>
  )
}
