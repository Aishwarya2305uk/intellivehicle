import { MAP } from '../data.js'
import { Pill, Dot } from './ui.jsx'
import { IconPin } from '../icons.jsx'
import { pointAt, toPath } from '../mapGeometry.js'
import { Signal, HospitalMarker, AmbulanceMarker, BaseCity } from './mapShared.jsx'

export default function CityMap({ sim }) {
  const { w, h, route, routeSignals, hospitals, otherAmbulances } = MAP
  const amb = pointAt(route, sim.progress)
  const routePath = toPath(route)

  return (
    <div className="cc-map-wrap">
      <svg className="cc-map-svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" role="img"
        aria-label="Live city map with ambulance route, hospitals and traffic signals (simulation)">
        <BaseCity idPrefix="cc-ov" />

        {/* green corridor route */}
        <path d={routePath} fill="none" stroke="rgba(34,197,94,0.22)" strokeWidth="12" strokeLinejoin="round" strokeLinecap="round" />
        <path className="cc-route-dash" d={routePath} fill="none" stroke="var(--cc-green)" strokeWidth="3.5"
          strokeLinejoin="round" strokeLinecap="round" filter="url(#cc-ov-glow)" />

        {/* signals */}
        {MAP.otherSignals.map((s, i) => <Signal key={`o${i}`} {...s} />)}
        {routeSignals.map((s, i) => <Signal key={`r${i}`} {...s} />)}

        {/* hospitals */}
        {hospitals.map((hos) => <HospitalMarker key={hos.name} {...hos} />)}

        {/* other (normal) ambulances */}
        {otherAmbulances.map((a) => <AmbulanceMarker key={a.id} x={a.x} y={a.y} id={a.id} tone="blue" />)}

        {/* the emergency ambulance, moving along the corridor */}
        <AmbulanceMarker x={amb.x} y={amb.y} id="AMB-104" tone="red" pulse animated />
      </svg>

      {/* overlays */}
      <div className="cc-map-overlay-card">
        <div className="cc-ov-head">
          <span className="cc-ov-id">AMB-104</span>
          <span className="cc-badge critical">Critical</span>
        </div>
        <div className="cc-ov-grid">
          <div><div className="cc-ov-k">Speed</div><div className="cc-ov-v">{sim.speed} km/h</div></div>
          <div><div className="cc-ov-k">ETA</div><div className="cc-ov-v">{String(sim.etaMin).padStart(2, '0')} min</div></div>
          <div><div className="cc-ov-k">Distance</div><div className="cc-ov-v">{sim.distanceKm} km</div></div>
          <div><div className="cc-ov-k">Corridor</div><div className="cc-ov-v" style={{ color: '#4ade80' }}>Active</div></div>
        </div>
      </div>

      <div className="cc-map-live">
        <Pill tone="blue"><Dot pulse /> Live · Simulation</Pill>
      </div>

      <div className="cc-map-legend">
        <span><span className="cc-leg-dot" style={{ background: 'var(--cc-red)' }} /> Emergency</span>
        <span><span className="cc-leg-dot" style={{ background: 'var(--cc-primary)' }} /> Ambulance</span>
        <span><span className="cc-leg-dot" style={{ background: 'var(--cc-green)' }} /> Hospital / Green signal</span>
        <span><span className="cc-leg-dot" style={{ background: 'var(--cc-amber)' }} /> Congestion / Roadblock</span>
        <span><IconPin size={12} /> Green corridor route</span>
      </div>
    </div>
  )
}
