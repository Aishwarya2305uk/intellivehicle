import { SYSTEM_HEALTH } from '../data.js'
import { Card, Pill, Dot } from './ui.jsx'
import { IconActivity, IconGps, IconRadio, IconCamera, IconWifi, IconCloud, IconCpu } from '../icons.jsx'

const HEALTH_ICONS = {
  gps: IconGps,
  radio: IconRadio,
  camera: IconCamera,
  wifi: IconWifi,
  cloud: IconCloud,
  cpu: IconCpu,
}

export default function SystemHealth() {
  return (
    <Card
      title="System Status"
      icon={<IconActivity size={16} />}
      headRight={<Pill tone="green"><Dot pulse /> All systems nominal</Pill>}
    >
      <div className="cc-health">
        {SYSTEM_HEALTH.map((s) => {
          const HIcon = HEALTH_ICONS[s.icon]
          return (
            <div key={s.id} className="cc-health-item">
              <span className="cc-health-icon"><HIcon size={16} /></span>
              {s.label}
              <span className="cc-health-state on">● {s.state}</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
