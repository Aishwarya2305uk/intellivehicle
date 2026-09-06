import { useState } from 'react'

/* Lightweight SVG charts for the Analytics module — no chart library.
   Shared conventions: one y-axis per chart, thin marks, recessive grid,
   a hover crosshair + tooltip layer, text in text tokens (never series color). */

const DEFAULT_W = 540
const PAD = { l: 40, r: 14, t: 12, b: 24 }

function niceMax(v) {
  if (v <= 0) return 1
  const pow = 10 ** Math.floor(Math.log10(v))
  for (const m of [1, 2, 2.5, 5, 10]) {
    if (m * pow >= v) return m * pow
  }
  return 10 * pow
}

function tickStep(n) {
  return Math.max(1, Math.ceil(n / 6))
}

function useHoverIndex(n, plotW, w) {
  const [idx, setIdx] = useState(null)
  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * w - PAD.l
    setIdx(Math.max(0, Math.min(n - 1, Math.round((x / plotW) * (n - 1)))))
  }
  return { idx, onMove, onLeave: () => setIdx(null) }
}

function Tooltip({ idx, n, label, rows, w }) {
  if (idx == null || idx >= n) return null
  const leftPct = ((PAD.l + (idx / Math.max(1, n - 1)) * (w - PAD.l - PAD.r)) / w) * 100
  const flip = leftPct > 62
  return (
    <div className="cc-chart-tip" style={{ left: `${leftPct}%`, transform: flip ? 'translateX(-105%)' : 'translateX(8px)' }}>
      <div className="cc-chart-tip-label">{label}</div>
      {rows.map((r) => (
        <div key={r.name} className="cc-chart-tip-row">
          <span className="cc-leg-dot" style={{ background: r.color }} />
          <span>{r.name}</span>
          <b>{r.value}</b>
        </div>
      ))}
    </div>
  )
}

function Grid({ ymax, unit, h, w }) {
  const plotH = h - PAD.t - PAD.b
  return (
    <>
      {[0, 1, 2, 3, 4].map((g) => {
        const y = PAD.t + plotH - (g / 4) * plotH
        const val = (ymax * g) / 4
        return (
          <g key={g}>
            <line x1={PAD.l} y1={y} x2={w - PAD.r} y2={y} stroke="rgba(148,163,184,0.1)" strokeWidth="1" />
            <text x={PAD.l - 7} y={y + 3.5} textAnchor="end" className="cc-axis-text">
              {val % 1 === 0 ? val : val.toFixed(1)}{g === 4 && unit === '%' ? '%' : ''}
            </text>
          </g>
        )
      })}
    </>
  )
}

function XLabels({ labels, plotW, h }) {
  const step = tickStep(labels.length)
  return labels.map((lb, i) =>
    i % step === 0 ? (
      <text key={i} x={PAD.l + (i / Math.max(1, labels.length - 1)) * plotW} y={h - 7} textAnchor="middle" className="cc-axis-text">
        {lb}
      </text>
    ) : null
  )
}

export function LineChart({ labels, series, unit = '', height = 200, area = false, w = DEFAULT_W }) {
  const n = labels.length
  const plotW = w - PAD.l - PAD.r
  const plotH = height - PAD.t - PAD.b
  const ymax = niceMax(Math.max(...series.flatMap((s) => s.values)))
  const { idx, onMove, onLeave } = useHoverIndex(n, plotW, w)

  const xAt = (i) => PAD.l + (i / Math.max(1, n - 1)) * plotW
  const yAt = (v) => PAD.t + plotH - (v / ymax) * plotH

  return (
    <div className="cc-chart-wrap">
      {series.length > 1 && (
        <div className="cc-chart-legend">
          {series.map((s) => (
            <span key={s.name}><span className="cc-leg-dot" style={{ background: s.color }} /> {s.name}</span>
          ))}
        </div>
      )}
      <div className="cc-chart-hover" onMouseMove={onMove} onMouseLeave={onLeave}>
        <svg viewBox={`0 0 ${w} ${height}`} className="cc-chart-svg" role="img" aria-label="Line chart">
          <Grid ymax={ymax} unit={unit} h={height} w={w} />
          {series.map((s) => {
            const pts = s.values.map((v, i) => `${xAt(i)},${yAt(v)}`).join(' ')
            return (
              <g key={s.name}>
                {area && (
                  <polygon
                    points={`${PAD.l},${PAD.t + plotH} ${pts} ${xAt(n - 1)},${PAD.t + plotH}`}
                    fill={s.color}
                    opacity="0.14"
                  />
                )}
                <polyline points={pts} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              </g>
            )
          })}
          {idx != null && (
            <g>
              <line x1={xAt(idx)} y1={PAD.t} x2={xAt(idx)} y2={PAD.t + plotH} stroke="rgba(230,237,247,0.3)" strokeWidth="1" />
              {series.map((s) => (
                <circle key={s.name} cx={xAt(idx)} cy={yAt(s.values[idx])} r="4" fill={s.color} stroke="#0d1730" strokeWidth="2" />
              ))}
            </g>
          )}
          <XLabels labels={labels} plotW={plotW} h={height} />
        </svg>
        <Tooltip
          idx={idx}
          n={n}
          w={w}
          label={idx != null ? labels[idx] : ''}
          rows={idx != null ? series.map((s) => ({ name: s.name, color: s.color, value: `${s.values[idx]}${unit}` })) : []}
        />
      </div>
    </div>
  )
}

export function BarChart({ labels, values, color, name, unit = '', height = 200, w = DEFAULT_W }) {
  const n = labels.length
  const plotW = w - PAD.l - PAD.r
  const plotH = height - PAD.t - PAD.b
  const ymax = niceMax(Math.max(...values))
  const { idx, onMove, onLeave } = useHoverIndex(n, plotW, w)

  const slot = plotW / n
  const barW = Math.min(26, slot * 0.62)

  return (
    <div className="cc-chart-wrap">
      <div className="cc-chart-hover" onMouseMove={onMove} onMouseLeave={onLeave}>
        <svg viewBox={`0 0 ${w} ${height}`} className="cc-chart-svg" role="img" aria-label={`${name} bar chart`}>
          <Grid ymax={ymax} unit={unit} h={height} w={w} />
          {values.map((v, i) => {
            const x = PAD.l + slot * i + (slot - barW) / 2
            const y = PAD.t + plotH - (v / ymax) * plotH
            const hgt = Math.max(0, PAD.t + plotH - y)
            const r = Math.min(4, barW / 2, hgt)
            return (
              <path
                key={i}
                d={`M${x},${PAD.t + plotH} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + barW - r},${y} Q${x + barW},${y} ${x + barW},${y + r} L${x + barW},${PAD.t + plotH} Z`}
                fill={color}
                opacity={idx == null || idx === i ? 0.9 : 0.35}
              />
            )
          })}
          <XLabels labels={labels} plotW={plotW} h={height} />
        </svg>
        <Tooltip
          idx={idx}
          n={n}
          w={w}
          label={idx != null ? labels[idx] : ''}
          rows={idx != null ? [{ name, color, value: `${values[idx]}${unit}` }] : []}
        />
      </div>
    </div>
  )
}
