import { useEffect, useMemo, useState } from 'react'
import './command.css'
import { NAV_ITEMS, STATS, INTERSECTIONS } from './data.js'
import { FLEET } from './fleet.js'
import { FleetSimContext, useFleetSim } from './simulation.js'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import CityMap from './components/CityMap.jsx'
import EmergencyPanel from './components/EmergencyPanel.jsx'
import SignalControl from './components/SignalControl.jsx'
import GreenCorridor from './components/GreenCorridor.jsx'
import AICameras from './components/AICameras.jsx'
import Hospitals from './components/Hospitals.jsx'
import PriorityQueue from './components/PriorityQueue.jsx'
import SystemHealth from './components/SystemHealth.jsx'
import LiveAmbulances from './LiveAmbulances.jsx'
import TrafficControl from './TrafficControl.jsx'
import AIVision from './AIVision.jsx'
import HospitalArrivals from './HospitalArrivals.jsx'
import EmergencyPriority from './EmergencyPriority.jsx'
import Analytics from './Analytics.jsx'
import { StatCard } from './components/ui.jsx'
import {
  IconAmbulance, IconSiren, IconRoute, IconGauge, IconHospital,
  IconDashboard, IconAlert,
} from './icons.jsx'

const STAT_ICONS = {
  ambulances: IconAmbulance,
  emergencies: IconSiren,
  corridors: IconRoute,
  congestion: IconGauge,
  hospitals: IconHospital,
}

const ROUTE_LOOP_SECONDS = 180
const SIGNAL_CYCLE_SECONDS = 45

/* One shared 1-second tick drives every "live" number on screen. */
function useSimulation() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  return useMemo(() => {
    const progress = (tick % ROUTE_LOOP_SECONDS) / ROUTE_LOOP_SECONDS
    const remaining = 1 - progress
    return {
      tick,
      progress,
      distanceKm: (2.4 * remaining).toFixed(1),
      etaMin: Math.max(1, Math.ceil(4.5 * remaining)),
      speed: 58 + Math.round(6 * Math.sin(tick / 5)),
      signalTimers: INTERSECTIONS.map(
        (it) => ((it.timer - tick - 1) % SIGNAL_CYCLE_SECONDS + SIGNAL_CYCLE_SECONDS) % SIGNAL_CYCLE_SECONDS + 1
      ),
    }
  }, [tick])
}

function ModulePlaceholder({ label }) {
  return (
    <div className="cc-card cc-placeholder">
      <div className="inner">
        <span className="ph-icon"><IconDashboard size={26} /></span>
        <h3>{label}</h3>
        <p>
          This module's dedicated screen is planned next. The Command Center overview
          already summarizes its live state — full page UI coming in the next iteration.
        </p>
      </div>
    </div>
  )
}

export default function CommandCenter({ onExit }) {
  const [active, setActive] = useState('command-center')
  const [menuOpen, setMenuOpen] = useState(false)
  const sim = useSimulation()
  const fleetSim = useFleetSim(FLEET)

  const activeItem = NAV_ITEMS.find((n) => n.id === active)

  const handleNavigate = (id) => {
    setActive(id)
    setMenuOpen(false)
  }

  return (
    <FleetSimContext.Provider value={fleetSim}>
    <div className="cc-app">
      <Sidebar
        active={active}
        onNavigate={handleNavigate}
        onExit={onExit}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="cc-main">
        <TopBar
          title={activeItem?.label || 'Command Center'}
          subtitle="Smart Ambulance Traffic Management · Demo simulation"
          onMenu={() => setMenuOpen(true)}
        />

        {active === 'command-center' ? (
          <main className="cc-content">
            <div className="cc-sim-note">
              <IconAlert size={13} />
              All figures below are demo/simulation data — no live hardware, GPS or AI model is connected yet.
            </div>

            <div className="cc-stats">
              {STATS.map((s) => {
                const SIcon = STAT_ICONS[s.id]
                return (
                  <StatCard
                    key={s.id}
                    label={s.label}
                    value={s.value}
                    sub={s.sub}
                    tone={s.tone}
                    icon={<SIcon size={17} />}
                  />
                )
              })}
            </div>

            <div className="cc-row-map">
              <section className="cc-card cc-map-card">
                <div className="cc-card-head">
                  <h3 className="cc-card-title">Live City Map</h3>
                  <div className="cc-head-right">
                    <span className="cc-page-sub">Ambulances · Hospitals · Signals · Congestion</span>
                  </div>
                </div>
                <CityMap sim={sim} />
              </section>

              <EmergencyPanel sim={sim} />
            </div>

            <SignalControl timers={sim.signalTimers} />

            <GreenCorridor />

            <div className="cc-row-3">
              <AICameras />
              <Hospitals />
            </div>

            <div className="cc-row-2">
              <PriorityQueue />
              <SystemHealth />
            </div>
          </main>
        ) : active === 'live-ambulances' ? (
          <LiveAmbulances />
        ) : active === 'traffic-control' ? (
          <TrafficControl />
        ) : active === 'ai-detection' ? (
          <AIVision />
        ) : active === 'hospitals' ? (
          <HospitalArrivals />
        ) : active === 'emergency-priority' ? (
          <EmergencyPriority />
        ) : active === 'analytics' ? (
          <Analytics />
        ) : (
          <main className="cc-content">
            <ModulePlaceholder label={activeItem?.label} />
          </main>
        )}
      </div>
    </div>
    </FleetSimContext.Provider>
  )
}
