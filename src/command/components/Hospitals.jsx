import { HOSPITALS } from '../data.js'
import { Card, Pill, Badge } from './ui.jsx'
import { IconHospital } from '../icons.jsx'

export default function Hospitals() {
  return (
    <Card
      title="Emergency Hospital Network"
      icon={<IconHospital size={16} />}
      headRight={<Pill>8 connected</Pill>}
    >
      <div className="cc-hosp-list">
        {HOSPITALS.map((hos) => (
          <article key={hos.name} className="cc-hosp">
            <span className={`cc-hosp-icon${hos.status === 'full' ? ' full' : ''}`}>
              <IconHospital size={17} />
            </span>
            <div className="cc-hosp-info">
              <div className="cc-hosp-name">{hos.name}</div>
              <div className="cc-hosp-meta">
                <span>ICU: <b style={{ color: hos.icu === 'Full' ? '#fca5a5' : '#86efac' }}>{hos.icu}</b></span>
                <span>ER: <b style={{ color: '#86efac' }}>{hos.er}</b></span>
              </div>
            </div>
            <div className="cc-hosp-right">
              <Badge level={hos.status === 'full' ? 'high' : 'ok'}>
                {hos.status === 'full' ? 'ICU Full' : 'Ready'}
              </Badge>
              <span className="cc-hosp-dist">{hos.distanceKm.toFixed(1)} km</span>
            </div>
          </article>
        ))}
      </div>
    </Card>
  )
}
