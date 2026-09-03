import { MAP } from '../data.js'

/* Shared SVG map primitives used by the Command Center overview map
   and the Live Ambulances tracking map.
   Route math lives in ../mapGeometry.js (pure functions, no components). */

export function Signal({ x, y, state }) {
  const color =
    state === 'green' ? 'var(--cc-green)' :
    state === 'amber' ? 'var(--cc-amber)' :
    'var(--cc-red)'
  return (
    <g>
      <rect x={x - 6} y={y - 6} width="12" height="12" rx="3.5" fill="#0a1122" stroke="rgba(148,163,184,0.4)" strokeWidth="1" />
      <circle cx={x} cy={y} r="3.2" fill={color} />
      {state !== 'red' && <circle cx={x} cy={y} r="6" fill="none" stroke={color} strokeOpacity="0.35" strokeWidth="1.5" />}
    </g>
  )
}

export function HospitalMarker({ x, y, name, primary }) {
  return (
    <g>
      <rect x={x - 11} y={y - 11} width="22" height="22" rx="6"
        fill={primary ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.12)'}
        stroke="var(--cc-green)" strokeWidth={primary ? 1.8 : 1.2} />
      <path d={`M${x - 4.5} ${y}h9M${x} ${y - 4.5}v9`} stroke="var(--cc-green)" strokeWidth="2" strokeLinecap="round" />
      <text x={x} y={y + 24} textAnchor="middle" fontSize="10" fontWeight="700" fill="#86efac">{name}</text>
    </g>
  )
}

const MARKER_TONES = {
  red:    { stroke: 'var(--cc-red)',     fill: 'rgba(239,68,68,0.25)',  label: '#fca5a5' },
  amber:  { stroke: 'var(--cc-amber)',   fill: 'rgba(245,158,11,0.22)', label: '#fcd34d' },
  yellow: { stroke: 'var(--cc-yellow)',  fill: 'rgba(234,179,8,0.2)',   label: '#fde047' },
  blue:   { stroke: 'var(--cc-primary)', fill: 'rgba(59,130,246,0.22)', label: '#93c5fd' },
}

/* Positioned via a translated <g> so the marker can animate smoothly with a
   CSS transform transition when its coordinates update each simulation tick. */
export function AmbulanceMarker({ x, y, id, tone = 'blue', pulse = false, selected = false, animated = false, onClick, dimmed = false }) {
  const t = MARKER_TONES[tone] || MARKER_TONES.blue
  return (
    <g
      style={{
        transform: `translate(${x}px, ${y}px)`,
        transition: animated ? 'transform 1s linear' : undefined,
        cursor: onClick ? 'pointer' : undefined,
        opacity: dimmed ? 0.28 : 1,
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? `Select ambulance ${id}` : undefined}
    >
      {selected && <circle r="14" fill="none" stroke="#f8fafc" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.9" />}
      {pulse && <circle className="cc-amb-ring" r="9" fill="none" stroke={t.stroke} strokeWidth="2" />}
      <circle r="8" fill={t.fill} stroke={t.stroke} strokeWidth="2" />
      <path d="M-3 0h6M0 -3v6" stroke={t.stroke} strokeWidth="1.8" strokeLinecap="round" />
      <text y="-13" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={t.label}>{id}</text>
    </g>
  )
}

/* Static city base: grid, blocks, roads, labels, congestion, roadblock. */
export function BaseCity({ idPrefix = 'cc' }) {
  const { w, h, hRoads, vRoads, congestion, roadblock, roadLabels } = MAP
  const gridId = `${idPrefix}-grid`
  const glowId = `${idPrefix}-glow`
  return (
    <>
      <defs>
        <pattern id={gridId} width="34" height="34" patternUnits="userSpaceOnUse">
          <path d="M34 0H0v34" fill="none" stroke="rgba(148,163,184,0.055)" strokeWidth="1" />
        </pattern>
        <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" /><feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width={w} height={h} fill="#0a1122" />
      <rect width={w} height={h} fill={`url(#${gridId})`} />

      {hRoads.slice(0, -1).map((y, i) =>
        vRoads.slice(0, -1).map((x, j) => (
          <rect key={`${i}-${j}`} x={x + 18} y={y + 18}
            width={vRoads[j + 1] - x - 36} height={hRoads[i + 1] - y - 36}
            rx="8" fill="rgba(30,41,66,0.35)" stroke="rgba(148,163,184,0.06)" />
        ))
      )}

      {hRoads.map((y) => <line key={`h${y}`} x1="0" y1={y} x2={w} y2={y} stroke="#182642" strokeWidth="20" />)}
      {vRoads.map((x) => <line key={`v${x}`} x1={x} y1="0" x2={x} y2={h} stroke="#182642" strokeWidth="20" />)}
      {hRoads.map((y) => <line key={`hc${y}`} x1="0" y1={y} x2={w} y2={y} stroke="rgba(148,163,184,0.18)" strokeWidth="1" strokeDasharray="7 9" />)}
      {vRoads.map((x) => <line key={`vc${x}`} x1={x} y1="0" x2={x} y2={h} stroke="rgba(148,163,184,0.18)" strokeWidth="1" strokeDasharray="7 9" />)}

      {congestion.map((c, i) => (
        <line key={i} x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
          stroke={c.tone === 'red' ? 'rgba(239,68,68,0.5)' : 'rgba(245,158,11,0.45)'}
          strokeWidth="10" strokeLinecap="round" />
      ))}

      <g>
        <circle cx={roadblock.x} cy={roadblock.y} r="9" fill="rgba(245,158,11,0.16)" stroke="var(--cc-amber)" strokeWidth="1.6" />
        <path d={`M${roadblock.x - 4} ${roadblock.y + 3.5} L${roadblock.x} ${roadblock.y - 4.5} L${roadblock.x + 4} ${roadblock.y + 3.5} Z`}
          fill="none" stroke="var(--cc-amber)" strokeWidth="1.6" strokeLinejoin="round" />
        <text x={roadblock.x} y={roadblock.y + 22} textAnchor="middle" fontSize="9" fontWeight="700" fill="#fcd34d">Roadblock</text>
      </g>

      {roadLabels.map((l) => (
        <text key={l.text} x={l.x} y={l.y} textAnchor="middle" fontSize="10.5" fontWeight="600"
          fill="rgba(148,163,184,0.75)"
          transform={l.vertical ? `rotate(-90 ${l.x} ${l.y})` : undefined}>
          {l.text}
        </text>
      ))}
    </>
  )
}
