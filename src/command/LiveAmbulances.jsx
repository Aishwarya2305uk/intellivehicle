import { useMemo, useState } from 'react'
import { FLEET, FLEET_STATUSES, FLEET_DESTINATIONS, EMERGENCY_LEVELS, sortByPriority, formatEta } from './fleet.js'
import { useFleetSim, corridorJunctionState } from './simulation.js'
import LiveMap from './components/LiveMap.jsx'
import { Card, Pill, Dot, Badge } from './components/ui.jsx'
import {
  IconSearch, IconAmbulance, IconSiren, IconEye, IconCrosshair, IconZap,
  IconRoute, IconAlert, IconClock, IconTrafficLight, IconHospital,
} from './icons.jsx'

const LEVEL_FILTERS = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'NORMAL']

export default function LiveAmbulances() {
  const [selectedId, setSelectedId] = useState('AMB-104')
  const [levelFilter, setLevelFilter] = useState('ALL')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [destFilter, setDestFilter] = useState('ALL')
  const [showRoute, setShowRoute] = useState(true)
  const [tracking, setTracking] = useState(true)

  const { telemetry } = useFleetSim(FLEET)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return FLEET.filter((a) =>
      (levelFilter === 'ALL' || a.level === levelFilter) &&
      (statusFilter === 'ALL' || a.status === statusFilter) &&
      (destFilter === 'ALL' || a.destination === destFilter) &&
      (!q || `${a.id} ${a.driver} ${a.destination}`.toLowerCase().includes(q))
    )
  }, [levelFilter, statusFilter, destFilter, query])

  const visibleIds = useMemo(() => new Set(visible.map((a) => a.id)), [visible])
  const queue = useMemo(() => sortByPriority(visible), [visible])
  const selected = FLEET.find((a) => a.id === selectedId)
  const selectedTel = telemetry[selectedId]

  return (
    <main className="cc-content">
      <div className="cc-sim-note">
        <IconAlert size={13} />
        Fleet positions, speeds and ETAs below are demo/simulation data — no GPS hardware is connected yet.
      </div>

      {/* Filters */}
      <div className="cc-card cc-filterbar">
        <label className="cc-search cc-filter-search">
          <IconSearch size={15} />
          <input
            type="search"
            placeholder="Search ambulance, driver, hospital…"
            aria-label="Search ambulances"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        <div className="cc-chip-row" role="group" aria-label="Filter by emergency level">
          {LEVEL_FILTERS.map((lv) => {
            const count = lv === 'ALL' ? FLEET.length : FLEET.filter((a) => a.level === lv).length
            return (
              <button
                key={lv}
                type="button"
                className={`cc-chip${levelFilter === lv ? ` active ${lv !== 'ALL' ? EMERGENCY_LEVELS[lv]?.tone : ''}` : ''}`}
                onClick={() => setLevelFilter(lv)}
              >
                {lv === 'ALL' ? 'All' : lv.charAt(0) + lv.slice(1).toLowerCase()}
                <span className="cc-chip-count">{count}</span>
              </button>
            )
          })}
        </div>

        <div className="cc-filter-selects">
          <select className="cc-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
            <option value="ALL">Status: All</option>
            {FLEET_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="cc-select" value={destFilter} onChange={(e) => setDestFilter(e.target.value)} aria-label="Filter by destination">
            <option value="ALL">Destination: All</option>
            {FLEET_DESTINATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="cc-live-layout">
        {/* Emergency queue / fleet list */}
        <Card
          className="cc-live-list"
          title="Emergency Queue"
          icon={<IconSiren size={16} />}
          headRight={<Pill>{queue.length} of {FLEET.length}</Pill>}
        >
          <div className="cc-queue cc-queue-live">
            {queue.length === 0 && <p className="cc-empty-note">No ambulances match the current filters.</p>}
            {queue.map((amb) => {
              const tel = telemetry[amb.id]
              const lv = EMERGENCY_LEVELS[amb.level]
              return (
                <button
                  key={amb.id}
                  type="button"
                  className={`cc-amb-item tone-${lv.tone}${amb.id === selectedId ? ' selected' : ''}`}
                  onClick={() => setSelectedId(amb.id)}
                >
                  <div className="cc-amb-item-top">
                    <span className="cc-amb-item-id"><IconAmbulance size={15} /> {amb.id}</span>
                    <Badge level={amb.level}>{amb.level}</Badge>
                  </div>
                  <div className="cc-amb-item-dest">{amb.driver} → {amb.destination}</div>
                  <div className="cc-amb-item-stats">
                    <span>{tel ? tel.speed : amb.baseSpeed} km/h</span>
                    <span>{tel ? tel.distanceKm : amb.routeKm} km</span>
                    <span>ETA {tel ? formatEta(tel.etaSeconds) : '—'}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </Card>

        {/* Map */}
        <section className="cc-card cc-map-card cc-live-map-card">
          <div className="cc-card-head">
            <h3 className="cc-card-title">Live Operations Map</h3>
            <div className="cc-head-right">
              <span className="cc-page-sub">Click a marker to select an ambulance</span>
            </div>
          </div>
          <LiveMap
            fleet={FLEET}
            telemetry={telemetry}
            selectedId={selectedId}
            onSelect={setSelectedId}
            visibleIds={visibleIds}
            showRoute={showRoute}
          />
        </section>

        {/* Selected ambulance details */}
        <Card
          className={`cc-emergency cc-live-details${selected?.level === 'CRITICAL' ? '' : ' calm'}`}
          title="Selected Ambulance"
          icon={<IconCrosshair size={16} />}
          headRight={tracking ? <Pill tone="blue"><Dot pulse /> Tracking</Pill> : <Badge level="ok">Idle</Badge>}
        >
          {selected && selectedTel ? (
            <>
              <div className="cc-em-id-row">
                <span className="cc-em-id">{selected.id}</span>
                <Badge level={selected.level}>{selected.level}</Badge>
              </div>

              <div className="cc-em-list">
                <div className="cc-em-item"><span className="cc-em-k">Status</span><span className="cc-em-v">{selected.status}</span></div>
                <div className="cc-em-item"><span className="cc-em-k">Driver</span><span className="cc-em-v">{selected.driver}</span></div>
                <div className="cc-em-item"><span className="cc-em-k">Current Location</span><span className="cc-em-v">{selectedTel.locationName}</span></div>
                <div className="cc-em-item"><span className="cc-em-k">Destination</span><span className="cc-em-v">{selected.destination}</span></div>
                <div className="cc-em-item"><span className="cc-em-k">Speed</span><span className="cc-em-v">{selectedTel.speed} km/h</span></div>
                <div className="cc-em-item"><span className="cc-em-k">Distance Remaining</span><span className="cc-em-v big">{selectedTel.distanceKm} km</span></div>
                <div className="cc-em-item"><span className="cc-em-k">ETA</span><span className="cc-em-v big">{formatEta(selectedTel.etaSeconds)}</span></div>
              </div>

              {selected.corridor?.active && (
                <div className="cc-corridor-mini">
                  <div className="cc-em-status">
                    <Dot pulse /> GREEN CORRIDOR ACTIVE
                  </div>
                  <div className="cc-cormini-list">
                    {selected.corridor.junctions.map((j) => {
                      const state = corridorJunctionState(j, selectedTel.progress)
                      return (
                        <div key={j.name} className="cc-cormini-row">
                          <span className="cc-cormini-icon"><IconTrafficLight size={13} /></span>
                          <span>{j.name}</span>
                          <b className={state === 'GREEN' ? 'is-green' : 'is-amber'}>{state}</b>
                        </div>
                      )
                    })}
                    <div className="cc-cormini-row">
                      <span className="cc-cormini-icon"><IconHospital size={13} /></span>
                      <span>{selected.destination}</span>
                      <b className="is-blue">ER READY</b>
                    </div>
                  </div>
                  <div className="cc-cormini-foot">
                    <span><IconTrafficLight size={12} /> Signals coordinated: <b>{selected.corridor.signalsCoordinated}</b></span>
                    <span><IconClock size={12} /> Est. time saved: <b>{String(selected.corridor.timeSavedMin).padStart(2, '0')} min</b></span>
                  </div>
                </div>
              )}

              <div className="cc-em-actions">
                <button
                  className={`cc-btn${tracking ? ' primary' : ''}`}
                  onClick={() => setTracking((t) => !t)}
                >
                  <IconCrosshair size={15} /> {tracking ? 'Tracking' : 'Track Ambulance'}
                </button>
                <button className="cc-btn" onClick={() => setShowRoute((r) => !r)}>
                  <IconRoute size={15} /> {showRoute ? 'Hide Route' : 'View Route'}
                </button>
                <button className="cc-btn danger"><IconZap size={15} /> Emergency Override</button>
              </div>
            </>
          ) : (
            <p className="cc-empty-note"><IconEye size={14} /> Select an ambulance on the map or in the queue.</p>
          )}
        </Card>
      </div>
    </main>
  )
}
