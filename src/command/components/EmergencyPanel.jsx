import { ACTIVE_EMERGENCY } from '../data.js'
import { Card, Badge, Dot } from './ui.jsx'
import { IconSiren, IconEye, IconCrosshair, IconZap } from '../icons.jsx'

export default function EmergencyPanel({ sim }) {
  const em = ACTIVE_EMERGENCY
  return (
    <Card
      className="cc-emergency"
      title="Active Emergency"
      icon={<IconSiren size={16} />}
      headRight={<Badge level="critical">Live</Badge>}
    >
      <div className="cc-em-id-row">
        <span className="cc-em-id">{em.id}</span>
        <Badge level="critical">{em.level}</Badge>
      </div>

      <div className="cc-em-list">
        <div className="cc-em-item"><span className="cc-em-k">Patient</span><span className="cc-em-v">{em.patient}</span></div>
        <div className="cc-em-item"><span className="cc-em-k">Destination</span><span className="cc-em-v">{em.destination}</span></div>
        <div className="cc-em-item"><span className="cc-em-k">Distance</span><span className="cc-em-v big">{sim.distanceKm} km</span></div>
        <div className="cc-em-item"><span className="cc-em-k">ETA</span><span className="cc-em-v big">{String(sim.etaMin).padStart(2, '0')} min</span></div>
        <div className="cc-em-item"><span className="cc-em-k">Speed</span><span className="cc-em-v">{sim.speed} km/h</span></div>
      </div>

      <div className="cc-em-route">
        Route:{' '}
        {em.routeText.map((r, i) => (
          <span key={r}>
            <b>{r}</b>
            {i < em.routeText.length - 1 && ' → '}
          </span>
        ))}
      </div>

      <div className="cc-em-status">
        <Dot pulse /> GREEN CORRIDOR ACTIVE
      </div>

      <div className="cc-em-actions">
        <button className="cc-btn"><IconEye size={15} /> View Details</button>
        <button className="cc-btn primary"><IconCrosshair size={15} /> Track</button>
        <button className="cc-btn danger"><IconZap size={15} /> Emergency Override</button>
      </div>
    </Card>
  )
}
