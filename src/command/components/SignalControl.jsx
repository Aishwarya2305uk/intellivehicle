import { INTERSECTIONS } from '../data.js'
import { Card, Pill, Dot } from './ui.jsx'
import { IconTrafficLight } from '../icons.jsx'

function SignalLight({ state }) {
  return (
    <span className="cc-signal-light" aria-label={`Signal ${state}`}>
      <span className={`cc-lamp${state === 'red' ? ' on-red' : ''}`} />
      <span className={`cc-lamp${state === 'amber' ? ' on-amber' : ''}`} />
      <span className={`cc-lamp${state === 'green' ? ' on-green' : ''}`} />
    </span>
  )
}

const DENSITY_TONE = { LOW: 'green', MEDIUM: 'amber', HIGH: 'red' }

export default function SignalControl({ timers }) {
  return (
    <Card
      title="Smart Traffic Signal Control"
      icon={<IconTrafficLight size={16} />}
      headRight={<Pill>12 controllers online</Pill>}
    >
      <div className="cc-signals-grid">
        {INTERSECTIONS.map((it, idx) => (
          <article key={it.id} className={`cc-signal-card${it.priority ? ' priority' : ''}`}>
            <div className="cc-signal-top">
              <div>
                <div className="cc-signal-name">{it.name}</div>
                <div className="cc-signal-road">{it.road}</div>
              </div>
              <SignalLight state={it.signal} />
            </div>

            <div className="cc-signal-meta">
              <div className="cc-meta-row">
                <span>Signal</span>
                <b style={{ color: it.signal === 'green' ? '#4ade80' : '#fca5a5' }}>
                  {it.signal.toUpperCase()}
                </b>
              </div>
              <div className="cc-meta-row">
                <span>Timer</span>
                <b>{String(timers[idx]).padStart(2, '0')} sec</b>
              </div>
              <div className="cc-meta-row">
                <span>Traffic Density</span>
                <b style={{ color: `var(--cc-${DENSITY_TONE[it.density] === 'blue' ? 'primary' : DENSITY_TONE[it.density]})` }}>
                  {it.density}
                </b>
              </div>
              <div className="cc-meta-row">
                <span>Ambulance</span>
                <b>{it.ambulance || '—'}</b>
              </div>
            </div>

            <div className="cc-signal-foot">
              {it.priority ? (
                <Pill tone="green"><Dot pulse /> Priority: {it.priority}</Pill>
              ) : (
                <Pill>{it.normal ? 'Normal cycle' : 'Auto'}</Pill>
              )}
              <button className="cc-btn sm">Manual Override</button>
            </div>
          </article>
        ))}
      </div>
    </Card>
  )
}
