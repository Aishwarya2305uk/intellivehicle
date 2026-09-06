import { useMemo, useState } from 'react'
import { FLEET, EMERGENCY_LEVELS, sortByPriority, formatEta } from './fleet.js'
import { useSharedFleetSim } from './simulation.js'
import { ARRIVAL_PHASES, arrivalPhaseFor, journeySteps, isHospitalBound, hospitalStatus } from './arrival.js'
import { Card, Pill, Dot, Badge } from './components/ui.jsx'
import {
  IconHospital, IconAmbulance, IconAlert, IconClock, IconRoute,
  IconPin, IconShield, IconGauge, IconActivity,
} from './icons.jsx'

export default function HospitalArrivals() {
  const [selectedId, setSelectedId] = useState('AMB-104')
  const { telemetry } = useSharedFleetSim()

  const inbound = useMemo(() => sortByPriority(FLEET.filter(isHospitalBound)), [])
  const phases = useMemo(() => {
    const out = {}
    for (const amb of inbound) out[amb.id] = arrivalPhaseFor(telemetry[amb.id]?.progress ?? 0)
    return out
  }, [inbound, telemetry])

  const selected = inbound.find((a) => a.id === selectedId) || inbound[0]
  const tel = telemetry[selected.id]
  const phase = phases[selected.id]
  const phaseInfo = ARRIVAL_PHASES[phase]
  const steps = journeySteps(selected, phase)
  const arrived = phase === 'ARRIVED'

  const arrivingCount = Object.values(phases).filter((p) => p === 'ARRIVING' || p === 'ARRIVED').length

  /* Arrival board grouped by destination hospital. */
  const hospitals = useMemo(() => {
    const names = [...new Set(inbound.map((a) => a.destination))]
    return names.map((name) => {
      const units = inbound.filter((a) => a.destination === name)
      return { name, units, status: hospitalStatus(units.map((u) => phases[u.id])) }
    })
  }, [inbound, phases])

  return (
    <main className="cc-content">
      <div className="cc-sim-note">
        <IconAlert size={13} />
        Arrival phases and countdowns below follow the shared demo simulation — no real hospital systems are connected yet.
      </div>

      <div className="cc-tc-summary">
        <Pill tone="blue"><IconAmbulance size={13} /> {inbound.length} hospital-bound units</Pill>
        <Pill tone={arrivingCount ? 'green' : ''}><Dot pulse /> {arrivingCount} arriving now</Pill>
        <Pill tone="green"><IconRoute size={13} /> Green corridor active — AMB-104</Pill>
        <Pill tone="blue"><Dot pulse /> LIVE SIMULATION</Pill>
      </div>

      <div className="cc-ha-layout">
        {/* Inbound list */}
        <Card
          className="cc-ha-list"
          title="Inbound Ambulances"
          icon={<IconAmbulance size={16} />}
          headRight={<Pill>{inbound.length} tracked</Pill>}
        >
          <div className="cc-queue">
            {inbound.map((amb) => {
              const t = telemetry[amb.id]
              const p = phases[amb.id]
              const info = ARRIVAL_PHASES[p]
              return (
                <button
                  key={amb.id}
                  type="button"
                  className={`cc-amb-item tone-${EMERGENCY_LEVELS[amb.level].tone}${amb.id === selected.id ? ' selected' : ''}`}
                  onClick={() => setSelectedId(amb.id)}
                >
                  <div className="cc-amb-item-top">
                    <span className="cc-amb-item-id"><IconAmbulance size={15} /> {amb.id}</span>
                    <Badge level={amb.level}>{amb.level}</Badge>
                  </div>
                  <div className="cc-amb-item-dest">→ {amb.destination}</div>
                  <div className="cc-ha-mini-progress">
                    <span className={`cc-ha-mini-fill ${info.tone}`} style={{ width: `${Math.round((t?.progress ?? 0) * 100)}%` }} />
                  </div>
                  <div className="cc-amb-item-stats">
                    <Pill tone={info.tone} className="cc-ha-phase-pill"><Dot pulse={p !== 'EN_ROUTE'} /> {info.label}</Pill>
                    <span>{p === 'ARRIVED' ? 'At hospital' : `ETA ${formatEta(t?.etaSeconds ?? 0)}`}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </Card>

        {/* Arrival coordination detail */}
        <Card
          className={`cc-emergency cc-ha-detail${selected.level === 'CRITICAL' ? '' : ' calm'}`}
          title="Arrival Coordination"
          icon={<IconHospital size={16} />}
          headRight={<Pill tone={phaseInfo.tone}><Dot pulse={!arrived} /> {phaseInfo.label}</Pill>}
        >
          <div className="cc-em-id-row">
            <span className="cc-em-id">{selected.id}</span>
            <Badge level={selected.level}>{selected.level}</Badge>
          </div>

          {/* destination + countdown */}
          <div className="cc-ha-dest">
            <div className="cc-ha-dest-left">
              <span className="cc-ha-dest-icon"><IconHospital size={18} /></span>
              <div>
                <div className="cc-ov-k">Destination</div>
                <div className="cc-ha-dest-name">{selected.destination}</div>
                <div className="cc-ha-dest-sub"><IconPin size={11} /> {tel?.locationName} · {tel?.speed} km/h</div>
              </div>
            </div>
            <div className="cc-ha-countdown">
              <div className="cc-ov-k">{arrived ? 'Arrival' : 'Arrival countdown'}</div>
              <div className={`cc-ha-count-value${arrived ? ' arrived' : ''}`}>
                {arrived ? 'ARRIVED' : formatEta(tel?.etaSeconds ?? 0)}
              </div>
              <div className="cc-ha-dest-sub">{arrived ? 'Handover in progress' : `${tel?.distanceKm} km remaining`}</div>
            </div>
          </div>

          {/* journey progress */}
          <div className="cc-progress-wrap">
            <div className="cc-progressbar">
              <span className={`cc-progress-fill ${phaseInfo.tone}`} style={{ width: `${Math.round((tel?.progress ?? 0) * 100)}%` }} />
            </div>
            <div className="cc-phasebar-label">Route progress · {Math.round((tel?.progress ?? 0) * 100)}%</div>
          </div>

          {/* journey flow */}
          <div className="cc-nav-label" style={{ padding: '4px 0 6px' }}>Journey status</div>
          <div className="cc-pipeline">
            {steps.map((s, i) => (
              <div key={s.label} className={`cc-pipe-step ${s.state}`}>
                <span className="cc-pipe-dot">
                  {i === 0 ? <IconRoute size={12} /> : i === 1 ? <IconShield size={12} /> : i === 2 ? <IconGauge size={12} /> : <IconHospital size={12} />}
                </span>
                <span>{s.label}</span>
                <b>{s.state === 'done' ? 'DONE' : s.state === 'active' ? 'ACTIVE' : '—'}</b>
              </div>
            ))}
          </div>

          <div className="cc-em-list" style={{ marginTop: 12 }}>
            <div className="cc-em-item"><span className="cc-em-k">Route Status</span><span className="cc-em-v">{arrived ? 'Completed' : 'Active — on planned route'}</span></div>
            <div className="cc-em-item">
              <span className="cc-em-k">Green Corridor</span>
              <span className="cc-em-v" style={{ color: selected.corridor?.active ? '#4ade80' : undefined }}>
                {selected.corridor?.active ? `ACTIVE · ${selected.corridor.signalsCoordinated} signals` : 'Not required'}
              </span>
            </div>
            <div className="cc-em-item"><span className="cc-em-k">Distance Remaining</span><span className="cc-em-v big">{arrived ? '0.0 km' : `${tel?.distanceKm} km`}</span></div>
            <div className="cc-em-item"><span className="cc-em-k">ETA</span><span className="cc-em-v big">{arrived ? '00:00' : formatEta(tel?.etaSeconds ?? 0)}</span></div>
            <div className="cc-em-item">
              <span className="cc-em-k">Emergency Arrival Status</span>
              <span className="cc-em-v" style={{ color: arrived ? '#4ade80' : undefined }}>{phaseInfo.label}</span>
            </div>
          </div>

          {arrived && (
            <div className="cc-em-status">
              <Dot /> {selected.id} ARRIVED AT {selected.destination.toUpperCase()}
            </div>
          )}
        </Card>

        {/* Hospital arrival board */}
        <div className="cc-ha-hosp-col">
          {hospitals.map((h) => (
            <Card
              key={h.name}
              title={h.name}
              icon={<IconHospital size={16} />}
              headRight={<Pill tone={h.status.tone}><Dot pulse={h.status.label !== 'STANDBY'} /> {h.status.label}</Pill>}
            >
              <div className="cc-ha-board">
                {h.units.map((u) => {
                  const t = telemetry[u.id]
                  const p = phases[u.id]
                  const info = ARRIVAL_PHASES[p]
                  return (
                    <div key={u.id} className="cc-cormini-row">
                      <span className="cc-cormini-icon"><IconAmbulance size={13} /></span>
                      <span>{u.id}</span>
                      <Badge level={u.level}>{u.level}</Badge>
                      <span className="cc-approach-eta">{p === 'ARRIVED' ? 'here' : formatEta(t?.etaSeconds ?? 0)}</span>
                      <b className={info.tone === 'green' ? 'is-green' : info.tone === 'blue' ? 'is-blue' : 'is-amber'}>{info.label}</b>
                    </div>
                  )
                })}
                {h.units.length === 0 && (
                  <p className="cc-empty-note"><IconActivity size={13} /> No inbound units.</p>
                )}
              </div>
              <div className="cc-ha-board-foot">
                <IconClock size={12} /> Next arrival:{' '}
                <b>
                  {(() => {
                    const pending = h.units.filter((u) => phases[u.id] !== 'ARRIVED')
                    if (!pending.length) return 'unit at hospital'
                    const next = pending.reduce((a, b) => ((telemetry[a.id]?.etaSeconds ?? 1e9) < (telemetry[b.id]?.etaSeconds ?? 1e9) ? a : b))
                    return `${next.id} in ${formatEta(telemetry[next.id]?.etaSeconds ?? 0)}`
                  })()}
                </b>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}
