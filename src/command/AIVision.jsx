import { useMemo, useState } from 'react'
import { FLEET } from './fleet.js'
import { useSharedFleetSim } from './simulation.js'
import { CAMERAS, MODEL_INFO } from './cameras.js'
import { useVisionFeed, detectionEvents } from './vision.js'
import CameraFeed from './components/CameraFeed.jsx'
import { Card, Pill, Dot, Badge } from './components/ui.jsx'
import {
  IconAIEye, IconCamera, IconAlert, IconAmbulance, IconActivity,
  IconTrafficLight, IconRoute, IconCpu, IconEye,
} from './icons.jsx'

const DENSITY_COLOR = { LOW: '#4ade80', MEDIUM: '#fcd34d', HIGH: '#fca5a5' }

const PIPELINE_STEPS = [
  { key: 'DETECTED', label: 'Ambulance detected by camera', icon: IconEye },
  { key: 'PRIORITY', label: 'Emergency priority triggered', icon: IconAmbulance },
  { key: 'GREEN', label: 'Junction signal switched GREEN', icon: IconTrafficLight },
  { key: 'CORRIDOR', label: 'Green corridor active', icon: IconRoute },
]
const STAGE_RANK = { DETECTED: 1, PRIORITY: 2, GREEN: 3 }

export default function AIVision() {
  const [selectedId, setSelectedId] = useState('CAM-07')
  const { tick, telemetry } = useSharedFleetSim()
  const results = useVisionFeed(FLEET, telemetry, tick, CAMERAS)

  const clock = new Date().toLocaleTimeString('en-GB')

  /* Detection event log — derived purely from the deterministic simulation
     (see detectionEvents). epoch anchors the shared clock's tick 0 to wall time. */
  const [epoch] = useState(() => Date.now() - tick * 1000)
  const log = useMemo(() => {
    const events = detectionEvents(FLEET, CAMERAS, tick, epoch)
    return [
      ...events,
      { t: -1, ts: new Date(epoch).toLocaleTimeString('en-GB'), tone: 'amber', text: 'CAM-18 · ROADBLOCK reported on Lakeview Road (0.91)' },
    ]
  }, [tick, epoch])

  const selectedCam = CAMERAS.find((c) => c.id === selectedId)
  const sel = results[selectedId]
  const detectionCount = Object.values(results).filter((r) => r.emergency).length

  return (
    <main className="cc-content">
      <div className="cc-sim-note">
        <IconAlert size={13} />
        Camera frames and detections below are an AI simulation — the real OpenCV/YOLO inference service is not connected yet.
      </div>

      <div className="cc-tc-summary">
        <Pill tone="green"><Dot pulse /> {CAMERAS.length}/{CAMERAS.length} cameras online</Pill>
        <Pill tone={detectionCount ? 'red' : ''}>
          <IconAmbulance size={13} /> {detectionCount} emergency detection{detectionCount === 1 ? '' : 's'} live
        </Pill>
        <Pill><IconCpu size={13} /> {MODEL_INFO.name} · {MODEL_INFO.fps} FPS</Pill>
        <Pill tone="amber">{MODEL_INFO.endpoint}</Pill>
        <Pill tone="blue"><Dot pulse /> LIVE SIMULATION</Pill>
      </div>

      <div className="cc-ai-layout">
        {/* Camera wall */}
        <div className="cc-ai-grid">
          {CAMERAS.map((cam) => {
            const r = results[cam.id]
            return (
              <article
                key={cam.id}
                className={`cc-cam cc-ai-card${cam.id === selectedId ? ' selected' : ''}${r.emergency ? ' detecting' : ''}`}
                onClick={() => setSelectedId(cam.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedId(cam.id) }}
              >
                <CameraFeed camera={cam} result={r} clock={clock} />
                <div className="cc-cam-body">
                  <div className="cc-cam-name">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                      <IconCamera size={14} /> {cam.id}
                    </span>
                    <span className="cc-cam-road">{cam.road} · {cam.junctionId}</span>
                  </div>
                  <div className="cc-cam-stats">
                    <div className="cc-meta-row"><span>Vehicles</span><b>{r.vehicleCount}</b></div>
                    <div className="cc-meta-row"><span>Traffic Density</span><b style={{ color: DENSITY_COLOR[r.density] }}>{r.density}</b></div>
                    <div className="cc-meta-row">
                      <span>Emergency Vehicle</span>
                      <b style={{ color: r.emergency ? '#4ade80' : undefined }}>
                        {r.emergency ? `${r.emergency.ambId} · ${r.emergency.conf.toFixed(2)}` : 'None'}
                      </b>
                    </div>
                    <div className="cc-meta-row">
                      <span>Road Blockage</span>
                      <b style={{ color: r.incident ? '#fcd34d' : undefined }}>{r.incident ? r.incident.type : 'None'}</b>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {/* Analysis panel + event log */}
        <div className="cc-ai-side">
          <Card
            className="cc-ai-details"
            title="Detection Analysis"
            icon={<IconAIEye size={16} />}
            headRight={sel?.emergency
              ? <Badge level={sel.emergency.level}>{sel.emergency.level}</Badge>
              : <Badge level="ok">Monitoring</Badge>}
          >
            {selectedCam && sel && (
              <>
                <CameraFeed camera={selectedCam} result={sel} clock={clock} large />

                <div className="cc-em-list" style={{ marginTop: 12 }}>
                  <div className="cc-em-item"><span className="cc-em-k">Camera</span><span className="cc-em-v">{selectedCam.id} — {selectedCam.road}</span></div>
                  <div className="cc-em-item"><span className="cc-em-k">Linked Signal</span><span className="cc-em-v">{sel.junctionName} ({selectedCam.junctionId})</span></div>
                  <div className="cc-em-item"><span className="cc-em-k">Vehicle Count</span><span className="cc-em-v">{sel.vehicleCount}</span></div>
                  <div className="cc-em-item"><span className="cc-em-k">Traffic Density</span><span className="cc-em-v" style={{ color: DENSITY_COLOR[sel.density] }}>{sel.density}</span></div>
                  <div className="cc-em-item">
                    <span className="cc-em-k">Emergency Vehicle</span>
                    <span className="cc-em-v" style={{ color: sel.emergency ? '#4ade80' : undefined }}>
                      {sel.emergency ? `${sel.emergency.ambId} · ETA ${sel.emergency.etaSeconds}s` : 'Not detected'}
                    </span>
                  </div>
                  <div className="cc-em-item">
                    <span className="cc-em-k">Road Blockage</span>
                    <span className="cc-em-v" style={{ color: sel.incident ? '#fcd34d' : undefined }}>{sel.incident ? `${sel.incident.type} · ${sel.incident.conf.toFixed(2)}` : 'None'}</span>
                  </div>
                </div>

                {/* Per-object confidence */}
                <div className="cc-nav-label" style={{ padding: '4px 0 6px' }}>Detections in frame</div>
                <div className="cc-conf-list">
                  {sel.emergency && (
                    <ConfRow label={`AMBULANCE (${sel.emergency.ambId})`} conf={sel.emergency.conf} tone="green" />
                  )}
                  {sel.detections.slice(0, 4).map((d) => (
                    <ConfRow key={d.id} label={d.cls.toUpperCase()} conf={d.conf} />
                  ))}
                </div>

                {/* Detection → priority pipeline */}
                <div className="cc-nav-label" style={{ padding: '10px 0 6px' }}>Detection → Signal pipeline</div>
                <div className="cc-pipeline">
                  {PIPELINE_STEPS.map((step, i) => {
                    const rank = sel.stage ? (sel.stage === 'GREEN' ? 4 : STAGE_RANK[sel.stage]) : 0
                    const state = rank > i ? (rank === i + 1 ? 'active' : 'done') : 'pending'
                    const StepIcon = step.icon
                    return (
                      <div key={step.key} className={`cc-pipe-step ${state}`}>
                        <span className="cc-pipe-dot"><StepIcon size={12} /></span>
                        <span>{step.label}</span>
                        <b>{state === 'done' ? 'DONE' : state === 'active' ? 'ACTIVE' : '—'}</b>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </Card>

          <Card title="Detection Event Log" icon={<IconActivity size={16} />} headRight={<Pill>last {log.length}</Pill>}>
            <div className="cc-ai-log">
              {log.map((e, i) => (
                <div key={`${e.ts}-${i}`} className={`cc-ai-log-row ${e.tone}`}>
                  <span className="cc-ai-log-ts">{e.ts}</span>
                  <span>{e.text}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}

function ConfRow({ label, conf, tone }) {
  return (
    <div className="cc-conf-row">
      <span className="cc-conf-label" style={tone === 'green' ? { color: '#4ade80' } : undefined}>{label}</span>
      <span className="cc-conf-track">
        <span
          className={`cc-conf-fill${tone === 'green' ? ' green' : ''}`}
          style={{ width: `${Math.round(conf * 100)}%` }}
        />
      </span>
      <b className="cc-conf-val">{Math.round(conf * 100)}%</b>
    </div>
  )
}
