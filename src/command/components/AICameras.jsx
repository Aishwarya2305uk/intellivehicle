import { CAMERAS } from '../data.js'
import { Card, Pill } from './ui.jsx'
import { IconAIEye, IconCamera } from '../icons.jsx'

export default function AICameras() {
  return (
    <Card
      title="AI Traffic Intelligence"
      icon={<IconAIEye size={16} />}
      headRight={<Pill tone="amber">AI Simulation</Pill>}
    >
      <div className="cc-cams">
        {CAMERAS.map((cam) => (
          <article key={cam.id} className="cc-cam">
            <div className="cc-cam-feed">
              <span className="cc-cam-tag">● REC {cam.id}</span>
              <span className="cc-cam-sim">SIMULATED FEED</span>
              <span className="cc-cam-scan" />
              {cam.boxes.map((b, i) => (
                <span
                  key={i}
                  className={`cc-cam-box${b.tone === 'blue' ? ' blue' : ''}`}
                  data-label={b.label}
                  style={{ top: b.top, left: b.left, width: b.width, height: b.height }}
                />
              ))}
            </div>
            <div className="cc-cam-body">
              <div className="cc-cam-name">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <IconCamera size={14} /> {cam.id}
                </span>
                <span className="cc-cam-road">{cam.road}</span>
              </div>
              <div className="cc-cam-stats">
                {cam.detections.map((d) => (
                  <div className="cc-meta-row" key={d.k}>
                    <span>{d.k}</span>
                    <b style={d.strong ? { color: '#4ade80' } : undefined}>{d.v}</b>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </Card>
  )
}
