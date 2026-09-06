import { useMemo, useState } from 'react'
import { FLEET, formatEta } from './fleet.js'
import { useSharedFleetSim } from './simulation.js'
import { JUNCTIONS } from './junctions.js'
import { CYCLE, getApproaches, computeJunctionState, corridorNodeState } from './signalLogic.js'
import { progressAtPoint } from './mapGeometry.js'
import { Card, Pill, Dot, Badge, SignalLight } from './components/ui.jsx'
import {
  IconTrafficLight, IconRoute, IconAlert, IconAmbulance, IconHospital,
  IconClock, IconZap, IconActivity, IconGauge,
} from './icons.jsx'

const DENSITY_COLOR = { LOW: 'var(--cc-green)', MEDIUM: 'var(--cc-amber)', HIGH: 'var(--cc-red)' }
const MODE_TONE = { AUTO: 'blue', PRIORITY: 'green', MANUAL: 'amber' }

export default function TrafficControl() {
  const [selectedId, setSelectedId] = useState('J01')
  const [overrides, setOverrides] = useState({}) // junctionId -> 'green' | 'red'

  const { tick, telemetry } = useSharedFleetSim()

  /* Per-junction controller state for this tick. */
  const states = useMemo(() => {
    const out = {}
    for (const j of JUNCTIONS) {
      const approaches = getApproaches(FLEET, telemetry, j)
      out[j.id] = computeJunctionState(j, tick, approaches, overrides[j.id])
    }
    return out
  }, [tick, telemetry, overrides])

  /* Green corridor strip for the active critical ambulance. */
  const corridorAmb = FLEET.find((a) => a.corridor?.active)
  const corridorTel = telemetry[corridorAmb?.id]
  const corridorNodes = useMemo(() => {
    if (!corridorAmb || !corridorTel) return []
    return JUNCTIONS.filter((j) => j.corridor).map((j) => {
      const at = progressAtPoint(corridorAmb.route, j.pos) ?? 1
      return { junction: j, state: corridorNodeState(at - corridorTel.progress) }
    })
  }, [corridorAmb, corridorTel])

  const priorityCount = Object.values(states).filter((s) => s.mode === 'PRIORITY').length
  const overrideCount = Object.keys(overrides).length
  const selected = JUNCTIONS.find((j) => j.id === selectedId)
  const selState = states[selectedId]

  const setOverride = (id, signal) => setOverrides((o) => ({ ...o, [id]: signal }))
  const clearOverride = (id) =>
    setOverrides((o) => Object.fromEntries(Object.entries(o).filter(([k]) => k !== id)))

  return (
    <main className="cc-content">
      <div className="cc-sim-note">
        <IconAlert size={13} />
        Signal states, timers and detections below are a frontend simulation — no ESP32/MQTT controllers are connected yet.
      </div>

      {/* Summary strip */}
      <div className="cc-tc-summary">
        <Pill tone="green"><Dot pulse /> {JUNCTIONS.length}/{JUNCTIONS.length} controllers online</Pill>
        <Pill tone={priorityCount ? 'red' : ''}>
          <IconAmbulance size={13} /> {priorityCount} priority {priorityCount === 1 ? 'junction' : 'junctions'} active
        </Pill>
        <Pill tone={overrideCount ? 'amber' : ''}>
          <IconZap size={13} /> {overrideCount} manual override{overrideCount === 1 ? '' : 's'}
        </Pill>
        <Pill tone="blue"><Dot pulse /> LIVE SIMULATION</Pill>
      </div>

      {/* Green corridor strip */}
      {corridorAmb && corridorTel && (
        <Card
          title={`Green Corridor — ${corridorAmb.id}`}
          icon={<IconRoute size={16} />}
          headRight={<Pill tone="green"><Dot pulse /> GREEN CORRIDOR ACTIVE</Pill>}
        >
          <div className="cc-corridor-track">
            <div className="cc-cor-node">
              <span className="cc-cor-dot amb"><IconAmbulance size={17} /></span>
              <span className="cc-cor-name">{corridorAmb.id}</span>
              <span className="cc-cor-state neutral">{Math.round(corridorTel.progress * 100)}% · {corridorTel.speed} km/h</span>
            </div>
            {corridorNodes.map(({ junction, state }) => (
              <CorridorNode key={junction.id} junction={junction} state={state} />
            ))}
            <span className="cc-cor-link" />
            <div className="cc-cor-node">
              <span className="cc-cor-dot hosp"><IconHospital size={17} /></span>
              <span className="cc-cor-name">{corridorAmb.destination}</span>
              <span className="cc-cor-state neutral">ETA {formatEta(corridorTel.etaSeconds)}</span>
            </div>
          </div>
          <div className="cc-corridor-foot">
            <Badge level="ok">Signals coordinated: {corridorNodes.length}</Badge>
            <span>Each junction turns green just before {corridorAmb.id} arrives, then returns to its normal cycle.</span>
            <span className="spacer" />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <IconClock size={14} /> Estimated time saved: <b>{String(corridorAmb.corridor.timeSavedMin).padStart(2, '0')} min</b>
            </span>
          </div>
        </Card>
      )}

      <div className="cc-tc-layout">
        {/* Junction grid */}
        <div className="cc-junction-grid">
          {JUNCTIONS.map((j) => {
            const s = states[j.id]
            return (
              <article
                key={j.id}
                className={`cc-signal-card cc-junction-card${s.mode === 'PRIORITY' ? ' priority' : ''}${j.id === selectedId ? ' selected' : ''}`}
                onClick={() => setSelectedId(j.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedId(j.id) }}
              >
                <div className="cc-signal-top">
                  <div>
                    <div className="cc-signal-name">{j.name}</div>
                    <div className="cc-signal-road">{j.road}</div>
                  </div>
                  <SignalLight state={s.signal} />
                </div>

                <div className="cc-signal-meta">
                  <div className="cc-meta-row">
                    <span>Signal</span>
                    <b style={{ color: s.signal === 'green' ? '#4ade80' : s.signal === 'amber' ? '#fcd34d' : '#fca5a5' }}>
                      {s.signal === 'amber' ? 'YELLOW' : s.signal.toUpperCase()}
                    </b>
                  </div>
                  <div className="cc-meta-row">
                    <span>Timer</span>
                    <b>{s.remaining != null ? `${String(s.remaining).padStart(2, '0')} sec` : 'HELD'}</b>
                  </div>
                  <div className="cc-meta-row">
                    <span>Traffic Density</span>
                    <b style={{ color: DENSITY_COLOR[s.density] }}>{s.density}</b>
                  </div>
                  <div className="cc-meta-row">
                    <span>Vehicles Waiting</span>
                    <b>{s.waiting}</b>
                  </div>
                  <div className="cc-meta-row">
                    <span>Ambulance</span>
                    <b>{s.active ? `${s.active.id} · ${s.active.etaSeconds}s` : '—'}</b>
                  </div>
                </div>

                <div className={`cc-jc-status ${s.mode === 'PRIORITY' ? 'is-priority' : s.mode === 'MANUAL' ? 'is-manual' : s.detected ? 'is-detected' : ''}`}>
                  {s.status}
                </div>

                <div className="cc-signal-foot">
                  <Pill tone={MODE_TONE[s.mode]}>
                    {s.mode === 'PRIORITY' ? <><Dot pulse /> Priority: {s.active?.id}</> : s.mode === 'MANUAL' ? 'Manual' : 'Automatic'}
                  </Pill>
                  {overrides[j.id] ? (
                    <button className="cc-btn sm" onClick={(e) => { e.stopPropagation(); clearOverride(j.id) }}>
                      Return to Automatic
                    </button>
                  ) : (
                    <button className="cc-btn sm" onClick={(e) => { e.stopPropagation(); setSelectedId(j.id); setOverride(j.id, 'green') }}>
                      Manual Override
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>

        {/* Junction details panel */}
        <Card
          className="cc-tc-details"
          title="Junction Details"
          icon={<IconTrafficLight size={16} />}
          headRight={selState && <Pill tone={MODE_TONE[selState.mode]}>{selState.mode}</Pill>}
        >
          {selected && selState && (
            <>
              <div className="cc-em-id-row">
                <span className="cc-em-id">{selected.name}</span>
                {selState.mode === 'PRIORITY' && <Badge level="critical">Priority</Badge>}
              </div>
              <div className="cc-signal-road" style={{ marginBottom: 12 }}>{selected.road} · Controller {selected.id}</div>

              <div className="cc-tc-lightrow">
                <SignalLight state={selState.signal} />
                <div>
                  <div className="cc-ov-k">This direction</div>
                  <div className="cc-ov-v" style={{ color: selState.signal === 'green' ? '#4ade80' : selState.signal === 'amber' ? '#fcd34d' : '#fca5a5' }}>
                    {selState.signal === 'amber' ? 'YELLOW' : selState.signal.toUpperCase()}
                    {selState.remaining != null ? ` · ${selState.remaining}s` : ' · held'}
                  </div>
                </div>
                <div className="cc-tc-cross">
                  <div className="cc-ov-k">Cross traffic</div>
                  <div className="cc-ov-v" style={{ color: selState.cross === 'green' ? '#4ade80' : selState.cross === 'amber' ? '#fcd34d' : '#fca5a5' }}>
                    {selState.cross === 'amber' ? 'YELLOW' : selState.cross.toUpperCase()}
                    {selState.mode === 'PRIORITY' && ' · held'}
                  </div>
                </div>
              </div>

              {/* Cycle phase bar */}
              <div className="cc-phasebar-wrap" aria-hidden={selState.mode !== 'AUTO'}>
                <div className={`cc-phasebar${selState.mode !== 'AUTO' ? ' dimmed' : ''}`}>
                  <span className="ph-green" style={{ width: `${(CYCLE.green / CYCLE.total) * 100}%` }} />
                  <span className="ph-amber" style={{ width: `${(CYCLE.yellow / CYCLE.total) * 100}%` }} />
                  <span className="ph-red" style={{ width: `${(CYCLE.red / CYCLE.total) * 100}%` }} />
                  {selState.mode === 'AUTO' && (
                    <span
                      className="ph-marker"
                      style={{ left: `${((((tick + selected.cycleOffset) % CYCLE.total) + CYCLE.total) % CYCLE.total / CYCLE.total) * 100}%` }}
                    />
                  )}
                </div>
                <div className="cc-phasebar-label">
                  {selState.mode === 'AUTO'
                    ? `Automatic cycle · ${CYCLE.total}s (${CYCLE.green}s green / ${CYCLE.yellow}s yellow / ${CYCLE.red}s red)`
                    : selState.mode === 'PRIORITY'
                      ? 'Normal cycle suspended — emergency priority in control'
                      : 'Normal cycle suspended — operator override in control'}
                </div>
              </div>

              <div className="cc-em-list">
                <div className="cc-em-item"><span className="cc-em-k">Traffic Density</span><span className="cc-em-v" style={{ color: DENSITY_COLOR[selState.density] }}>{selState.density}</span></div>
                <div className="cc-em-item"><span className="cc-em-k">Vehicles Waiting</span><span className="cc-em-v">{selState.waiting}</span></div>
                <div className="cc-em-item"><span className="cc-em-k">Status</span><span className="cc-em-v">{selState.status}</span></div>
              </div>

              {/* Emergency approaches / multi-ambulance priority */}
              <div className="cc-tc-approaches">
                <div className="cc-nav-label" style={{ padding: '0 0 6px' }}>Emergency approaches</div>
                {selState.active || selState.queued.length ? (
                  <div className="cc-cormini-list">
                    {[selState.active, ...selState.queued].filter(Boolean).map((a, i) => (
                      <div key={a.id} className="cc-cormini-row">
                        <span className="cc-cormini-icon"><IconAmbulance size={13} /></span>
                        <span>{a.id}</span>
                        <Badge level={a.level}>{a.level}</Badge>
                        <span className="cc-approach-eta">{a.etaSeconds}s</span>
                        <b className={i === 0 ? 'is-green' : 'is-amber'}>{i === 0 ? 'ACTIVE' : 'QUEUED'}</b>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="cc-empty-note"><IconActivity size={13} /> No emergency vehicles approaching this junction.</p>
                )}
              </div>

              {/* Operator controls */}
              <div className="cc-nav-label" style={{ padding: '10px 0 6px' }}>Operator control</div>
              <div className="cc-em-actions cc-tc-actions">
                <button
                  className={`cc-btn${overrides[selectedId] === 'green' ? ' primary' : ''}`}
                  onClick={() => setOverride(selectedId, 'green')}
                >
                  <IconZap size={14} /> Force Green
                </button>
                <button
                  className={`cc-btn${overrides[selectedId] === 'red' ? ' danger-solid' : ''}`}
                  onClick={() => setOverride(selectedId, 'red')}
                >
                  <IconGauge size={14} /> Force Red
                </button>
                <button
                  className="cc-btn danger"
                  disabled={!overrides[selectedId]}
                  style={!overrides[selectedId] ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}
                  onClick={() => clearOverride(selectedId)}
                >
                  Return to Automatic
                </button>
              </div>
            </>
          )}
        </Card>
      </div>
    </main>
  )
}

function CorridorNode({ junction, state }) {
  const dotClass =
    state === 'GREEN' ? '' : state === 'PREPARING' ? ' prep' : state === 'CLEARED' ? ' cleared' : ' standby'
  const stateClass =
    state === 'GREEN' ? '' : state === 'PREPARING' ? ' amber' : ' neutral'
  return (
    <>
      <span className={`cc-cor-link${state === 'CLEARED' ? ' done' : ''}`} />
      <div className="cc-cor-node">
        <span className={`cc-cor-dot${dotClass}`}><IconTrafficLight size={17} /></span>
        <span className="cc-cor-name">{junction.name}</span>
        <span className={`cc-cor-state${stateClass}`}>{state}</span>
      </div>
    </>
  )
}
