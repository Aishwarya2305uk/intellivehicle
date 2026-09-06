import { useMemo, useState } from 'react'
import { FLEET, EMERGENCY_LEVELS, formatEta } from './fleet.js'
import { useSharedFleetSim } from './simulation.js'
import { rankFleet, routeOptions } from './priority.js'
import { ARRIVAL_PHASES, arrivalPhaseFor, isHospitalBound } from './arrival.js'
import { JUNCTIONS } from './junctions.js'
import { getApproaches, WINDOW } from './signalLogic.js'
import { Card, Pill, Dot, Badge } from './components/ui.jsx'
import {
  IconSiren, IconAlert, IconAmbulance, IconRoute, IconTrafficLight,
  IconHospital, IconCrosshair, IconGauge, IconShield, IconAIEye, IconZap,
} from './icons.jsx'

const TRAFFIC_COLOR = { LOW: '#4ade80', MEDIUM: '#fcd34d', HIGH: '#fca5a5' }

/* Junction currently holding (or preparing) signal priority for this unit. */
function holdingJunctionFor(amb, telemetry) {
  for (const j of JUNCTIONS) {
    const lead = getApproaches(FLEET, telemetry, j)[0]
    if (lead && lead.id === amb.id && lead.delta <= WINDOW.prepare) return j.name
  }
  return null
}

function decisionFlow(amb, phase, holding) {
  const corridor = !!amb.corridor?.active
  const arrived = phase === 'ARRIVED'
  return [
    { label: 'Ambulance detected', icon: IconAIEye, state: 'done' },
    { label: 'Priority calculated', icon: IconSiren, state: 'done' },
    { label: 'Route selected', icon: IconRoute, state: 'done' },
    {
      label: 'Signals coordinated',
      icon: IconTrafficLight,
      state: holding ? 'active' : corridor ? 'done' : 'pending',
      detail: holding || (corridor ? '3 junctions' : 'not required'),
    },
    {
      label: 'Green corridor',
      icon: IconShield,
      state: corridor ? (arrived ? 'done' : 'active') : 'pending',
      detail: corridor ? 'ACTIVE' : 'not required',
    },
    { label: 'Live tracking', icon: IconCrosshair, state: arrived ? 'done' : 'active' },
    {
      label: 'Hospital arrival',
      icon: IconHospital,
      state: arrived ? 'done' : phase === 'ARRIVING' ? 'active' : 'pending',
    },
  ]
}

export default function EmergencyPriority() {
  const [selectedId, setSelectedId] = useState('AMB-104')
  const [chosenRoutes, setChosenRoutes] = useState({}) // ambId -> 'current' | 'alt'
  const { telemetry } = useSharedFleetSim()

  const ranked = useMemo(() => rankFleet(FLEET, telemetry), [telemetry])
  const selectedEntry = ranked.find((e) => e.amb.id === selectedId) || ranked[0]
  const { amb: selected, tel, rank, score, factors } = selectedEntry

  const phase = isHospitalBound(selected) ? arrivalPhaseFor(tel?.progress ?? 0) : 'EN_ROUTE'
  const holding = useMemo(() => holdingJunctionFor(selected, telemetry), [selected, telemetry])
  const flow = decisionFlow(selected, phase, holding)

  const routes = routeOptions(selected, tel)
  const chosen = chosenRoutes[selected.id] || 'current'
  const p1 = ranked[0]

  return (
    <main className="cc-content">
      <div className="cc-sim-note">
        <IconAlert size={13} />
        Priority scores and route comparisons below are computed from the shared demo simulation — no live traffic API or routing engine is connected yet.
      </div>

      <div className="cc-tc-summary">
        <Pill tone="red"><IconSiren size={13} /> Priority 1: {p1.amb.id} · {p1.amb.level}</Pill>
        <Pill tone="blue"><IconAmbulance size={13} /> {ranked.length} units ranked</Pill>
        <Pill tone="green"><IconRoute size={13} /> Green corridor active — AMB-104</Pill>
        <Pill tone="blue"><Dot pulse /> LIVE SIMULATION</Pill>
      </div>

      {/* Decision pipeline for the selected unit */}
      <Card
        title={`Emergency Decision Pipeline — ${selected.id}`}
        icon={<IconZap size={16} />}
        headRight={<Pill tone={ARRIVAL_PHASES[phase].tone}><Dot pulse={phase !== 'ARRIVED'} /> {ARRIVAL_PHASES[phase].label}</Pill>}
      >
        <div className="cc-corridor-track">
          {flow.map((step, i) => {
            const StepIcon = step.icon
            const dotClass = step.state === 'active' ? '' : step.state === 'done' ? ' cleared' : ' standby'
            const stateClass = step.state === 'active' ? '' : ' neutral'
            return (
              <FlowNode key={step.label} first={i === 0} done={step.state === 'done'}>
                <span className={`cc-cor-dot${dotClass}`}><StepIcon size={16} /></span>
                <span className="cc-cor-name">{step.label}</span>
                <span className={`cc-cor-state${stateClass}`}>
                  {step.state === 'active' ? (step.detail || 'ACTIVE') : step.state === 'done' ? (step.detail || 'DONE') : (step.detail || 'PENDING')}
                </span>
              </FlowNode>
            )
          })}
        </div>
      </Card>

      <div className="cc-pr-layout">
        {/* Smart priority queue */}
        <Card
          title="Smart Priority Queue"
          icon={<IconSiren size={16} />}
          headRight={<Pill>ranked live · every second</Pill>}
        >
          <div className="cc-pr-queue">
            {ranked.map(({ amb, tel: t, rank: r, score: s, factors: f }) => (
              <button
                key={amb.id}
                type="button"
                className={`cc-pr-item tone-${EMERGENCY_LEVELS[amb.level].tone}${amb.id === selectedId ? ' selected' : ''}${r === 1 ? ' top' : ''}`}
                onClick={() => setSelectedId(amb.id)}
              >
                <span className={`cc-pr-rank${r === 1 ? ' top' : ''}`}>P{r}</span>
                <div className="cc-pr-main">
                  <div className="cc-pr-row1">
                    <span className="cc-amb-item-id"><IconAmbulance size={15} /> {amb.id}</span>
                    <Badge level={amb.level}>{amb.level}</Badge>
                    <span className="cc-pr-eta">ETA {formatEta(t?.etaSeconds ?? 0)}</span>
                  </div>
                  <div className="cc-pr-row2">
                    <span>{t?.distanceKm} km → {amb.destination}</span>
                    <span style={{ color: TRAFFIC_COLOR[amb.routeTraffic] }}>Traffic {amb.routeTraffic}</span>
                  </div>
                  <div className="cc-pr-scorebar">
                    <span className="cc-pr-scorefill" style={{ width: `${s}%` }} />
                  </div>
                  <div className="cc-pr-factors">
                    <span>Score <b>{s}</b></span>
                    {Object.values(f).map((fa) => (
                      <span key={fa.label}>{fa.label} <b>{fa.pts}</b></span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Cross-module coordination for the selected unit */}
        <Card
          className="cc-pr-coord"
          title="Coordination Status"
          icon={<IconCrosshair size={16} />}
          headRight={<Badge level={selected.level}>{selected.id}</Badge>}
        >
          <div className="cc-em-list">
            <div className="cc-em-item"><span className="cc-em-k">Priority Rank</span><span className="cc-em-v big">P{rank} · score {score}</span></div>
            <div className="cc-em-item">
              <span className="cc-em-k">Live Tracking</span>
              <span className="cc-em-v">{ARRIVAL_PHASES[phase].label} · {tel?.speed} km/h</span>
            </div>
            <div className="cc-em-item">
              <span className="cc-em-k">Traffic Control</span>
              <span className="cc-em-v" style={{ color: holding ? '#4ade80' : undefined }}>
                {holding ? `${holding} — priority green` : 'No junction hold'}
              </span>
            </div>
            <div className="cc-em-item">
              <span className="cc-em-k">Green Corridor</span>
              <span className="cc-em-v" style={{ color: selected.corridor?.active ? '#4ade80' : undefined }}>
                {selected.corridor?.active ? `ACTIVE · ${selected.corridor.signalsCoordinated} signals` : 'Not required'}
              </span>
            </div>
            <div className="cc-em-item">
              <span className="cc-em-k">Hospital Arrival</span>
              <span className="cc-em-v">
                {phase === 'ARRIVED' ? `Arrived — ${selected.destination}` : `${selected.destination} · ${formatEta(tel?.etaSeconds ?? 0)}`}
              </span>
            </div>
            <div className="cc-em-item">
              <span className="cc-em-k">Priority Factors</span>
              <span className="cc-em-v">{factors.level.pts} lvl + {factors.urgency.pts} eta + {factors.proximity.pts} prox + {factors.traffic.pts} trf</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Route comparison */}
      <Card
        title={`Smart Route Comparison — ${selected.id}`}
        icon={<IconRoute size={16} />}
        headRight={<Pill tone="green"><IconGauge size={13} /> Recommended: {routes.recommended === 'alt' ? routes.alternative.name : 'Current Route'}</Pill>}
      >
        <div className="cc-pr-reco">
          <IconAIEye size={14} /> System recommendation: <b>{routes.recommended === 'alt' ? routes.alternative.name : 'Keep current route'}</b> — {routes.reason}
        </div>
        <div className="cc-routes">
          {[routes.current, routes.alternative].map((opt) => {
            const isChosen = chosen === opt.key
            const isReco = routes.recommended === opt.key
            return (
              <article key={opt.key} className={`cc-route-card${isReco ? ' recommended' : ''}${isChosen ? ' chosen' : ''}`}>
                <div className="cc-route-head">
                  <span className="cc-route-name">{opt.name}</span>
                  <span style={{ display: 'inline-flex', gap: 6 }}>
                    {isReco && <Badge level="ok">Recommended</Badge>}
                    <Pill tone={isChosen ? 'blue' : ''}>{isChosen ? 'ACTIVE' : 'STANDBY'}</Pill>
                  </span>
                </div>
                <div className="cc-route-via">{opt.via}</div>
                <div className="cc-signal-meta">
                  <div className="cc-meta-row"><span>Distance</span><b>{opt.distanceKm} km</b></div>
                  <div className="cc-meta-row"><span>ETA</span><b>{formatEta(opt.etaSeconds)}</b></div>
                  <div className="cc-meta-row"><span>Traffic</span><b style={{ color: TRAFFIC_COLOR[opt.traffic] }}>{opt.traffic}</b></div>
                  <div className="cc-meta-row">
                    <span>Status</span>
                    <b style={{ color: isChosen ? '#93c5fd' : undefined }}>{isChosen ? 'ACTIVE — in use' : 'STANDBY'}</b>
                  </div>
                  <div className="cc-meta-row">
                    <span>Green Corridor</span>
                    <b style={{ color: opt.corridor ? '#4ade80' : undefined }}>{opt.corridor ? 'Coordinated' : '—'}</b>
                  </div>
                </div>
                {opt.note && <div className="cc-route-note">{opt.note}</div>}
                <button
                  className={`cc-btn sm${!isChosen && isReco ? ' primary' : ''}`}
                  disabled={isChosen}
                  style={isChosen ? { opacity: 0.5, cursor: 'default' } : undefined}
                  onClick={() => setChosenRoutes((c) => ({ ...c, [selected.id]: opt.key }))}
                >
                  {isChosen ? 'In use' : 'Apply route (simulated)'}
                </button>
              </article>
            )
          })}
        </div>
      </Card>
    </main>
  )
}

function FlowNode({ first, done, children }) {
  return (
    <>
      {!first && <span className={`cc-cor-link${done ? ' done' : ''}`} />}
      <div className="cc-cor-node">{children}</div>
    </>
  )
}
