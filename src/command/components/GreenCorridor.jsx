import { CORRIDOR } from '../data.js'
import { Card, Pill, Dot, Badge } from './ui.jsx'
import { IconRoute, IconAmbulance, IconHospital, IconTrafficLight, IconClock } from '../icons.jsx'

export default function GreenCorridor() {
  return (
    <Card
      title="Active Green Corridor"
      icon={<IconRoute size={16} />}
      headRight={<Pill tone="green"><Dot pulse /> Corridor Active</Pill>}
    >
      <div className="cc-corridor-track">
        <div className="cc-cor-node">
          <span className="cc-cor-dot amb"><IconAmbulance size={17} /></span>
          <span className="cc-cor-name">{CORRIDOR.ambulance}</span>
          <span className="cc-cor-state neutral">EN ROUTE</span>
        </div>

        {CORRIDOR.junctions.map((j) => (
          <FragmentLink key={j} name={j} />
        ))}

        <span className="cc-cor-link" />
        <div className="cc-cor-node">
          <span className="cc-cor-dot hosp"><IconHospital size={17} /></span>
          <span className="cc-cor-name">{CORRIDOR.hospital}</span>
          <span className="cc-cor-state neutral">ER READY</span>
        </div>
      </div>

      <div className="cc-corridor-foot">
        <Badge level="ok">Green Corridor Active</Badge>
        <span>
          Signals along the corridor switch to green ahead of the ambulance and return to normal after it passes.
        </span>
        <span className="spacer" />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <IconClock size={14} /> Estimated time saved: <b>{String(CORRIDOR.timeSavedMin).padStart(2, '0')} min</b>
        </span>
      </div>
    </Card>
  )
}

function FragmentLink({ name }) {
  return (
    <>
      <span className="cc-cor-link" />
      <div className="cc-cor-node">
        <span className="cc-cor-dot"><IconTrafficLight size={17} /></span>
        <span className="cc-cor-name">{name}</span>
        <span className="cc-cor-state">GREEN</span>
      </div>
    </>
  )
}
