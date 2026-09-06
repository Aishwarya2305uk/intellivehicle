import { FRAME } from '../vision.js'

/* Synthetic camera frame: a perspective road scene rendered in SVG with
   YOLO-style bounding boxes drawn over each "detected" vehicle. */

const VEHICLE_FILL = { car: '#243356', bike: '#2b3a5e', truck: '#1f2c4c', bus: '#2a3960' }

function BoundingBox({ x, y, w, h, label, tone = 'blue' }) {
  const stroke = tone === 'green' ? 'var(--cc-green)' : tone === 'amber' ? 'var(--cc-amber)' : 'var(--cc-primary)'
  const labelFill = tone === 'green' ? 'var(--cc-green)' : tone === 'amber' ? 'var(--cc-amber)' : 'var(--cc-primary)'
  const labelW = label.length * 4.4 + 6
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={stroke} strokeWidth="1.2" rx="1.5" />
      <rect x={x - 0.6} y={y - 9.5} width={labelW} height="8.5" rx="1.5" fill={labelFill} />
      <text x={x + 2.4} y={y - 3} fontSize="6.2" fontWeight="800" fill="#04101f" style={{ letterSpacing: 0.3 }}>
        {label}
      </text>
    </g>
  )
}

function Vehicle({ d }) {
  return (
    <g>
      <rect x={d.x} y={d.y} width={d.w} height={d.h} rx={2} fill={VEHICLE_FILL[d.cls] || '#243356'} stroke="#3a4a70" strokeWidth="0.8" />
      <rect x={d.x + d.w * 0.16} y={d.y + d.h * 0.18} width={d.w * 0.68} height={d.h * 0.3} rx={1.4} fill="rgba(148,183,230,0.28)" />
    </g>
  )
}

function EmergencyVehicle({ box }) {
  const { x, y, w, h } = box
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={2.4} fill="#dfe7f2" stroke="#94a3b8" strokeWidth="0.8" />
      <rect x={x} y={y + h * 0.42} width={w} height={h * 0.2} fill="var(--cc-red)" />
      <rect x={x + w * 0.36} y={y - h * 0.16} width={w * 0.28} height={h * 0.18} rx={1} fill="var(--cc-red)">
        <animate attributeName="opacity" values="1;0.25;1" dur="0.9s" repeatCount="indefinite" />
      </rect>
    </g>
  )
}

export default function CameraFeed({ camera, result, large = false, clock }) {
  const { w, h } = FRAME
  const em = result.emergency
  return (
    <div className={`cc-cam-feed cc-ai-feed${large ? ' large' : ''}`}>
      <svg className="cc-ai-feed-svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id={`sky-${camera.id}${large ? '-l' : ''}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0d1730" />
            <stop offset="1" stopColor="#0a1122" />
          </linearGradient>
        </defs>

        <rect width={w} height={h} fill={`url(#sky-${camera.id}${large ? '-l' : ''})`} />

        {/* buildings on the horizon */}
        <rect x="18" y="14" width="34" height="24" fill="#111d3a" />
        <rect x="60" y="8" width="26" height="30" fill="#0f1a34" />
        <rect x="236" y="12" width="30" height="26" fill="#111d3a" />
        <rect x="272" y="6" width="26" height="32" fill="#0f1a34" />

        {/* road */}
        <polygon points={`118,36 202,36 300,${h} 20,${h}`} fill="#151f3a" />
        <line x1="118" y1="36" x2="20" y2={h} stroke="#2a3a60" strokeWidth="1.4" />
        <line x1="202" y1="36" x2="300" y2={h} stroke="#2a3a60" strokeWidth="1.4" />
        <line x1="146" y1="36" x2="106" y2={h} stroke="rgba(148,163,184,0.35)" strokeWidth="1" strokeDasharray="7 8" />
        <line x1="174" y1="36" x2="214" y2={h} stroke="rgba(148,163,184,0.35)" strokeWidth="1" strokeDasharray="7 8" />

        {/* vehicles + bounding boxes */}
        {result.detections.map((d) => <Vehicle key={d.id} d={d} />)}
        {em && <EmergencyVehicle box={em.box} />}
        {result.detections.map((d) => (
          <BoundingBox key={`bb-${d.id}`} x={d.x} y={d.y} w={d.w} h={d.h}
            label={`${d.cls.toUpperCase()} ${d.conf.toFixed(2)}`} />
        ))}
        {em && (
          <BoundingBox x={em.box.x} y={em.box.y} w={em.box.w} h={em.box.h}
            label={`AMBULANCE ${em.conf.toFixed(2)}`} tone="green" />
        )}
      </svg>

      <span className="cc-cam-tag">● REC {camera.id}</span>
      <span className="cc-cam-sim">AI SIMULATION</span>
      <span className="cc-cam-scan" />
      <span className="cc-ai-clock">{clock} · {camera.road}</span>

      {em && (
        <span className="cc-ai-banner green">
          AMBULANCE DETECTED — {em.ambId} · {em.conf.toFixed(2)}
        </span>
      )}
      {!em && result.incident && (
        <span className="cc-ai-banner amber">
          {result.incident.type} — {result.incident.note} · {result.incident.conf.toFixed(2)}
        </span>
      )}
    </div>
  )
}
