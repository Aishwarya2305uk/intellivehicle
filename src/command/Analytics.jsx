import { useMemo, useState } from 'react'
import { RANGES, getAnalytics, getRoutePerformance } from './analytics.js'
import { LineChart, BarChart } from './components/charts.jsx'
import { Card, Pill, Dot } from './components/ui.jsx'
import {
  IconChart, IconAlert, IconSiren, IconClock, IconRoute, IconGauge,
  IconTrafficLight, IconHospital, IconAmbulance, IconActivity, IconShield,
} from './icons.jsx'

/* Chart hues — every value validated with scripts/validate_palette.js
   (dataviz skill) against the dark card surfaces #0d1730 / #111d3a:
   the one two-series chart uses the passing pair blue #3b82f6 + amber
   #d97706; single-hue charts each passed the lone-color checks
   (#22c55e failed the lightness band, so green snapped to #16a34a). */
const HUE = { blue: '#3b82f6', amber: '#d97706', green: '#16a34a', red: '#ef4444' }

const KPI_ICONS = {
  cases: IconSiren,
  response: IconClock,
  travel: IconAmbulance,
  corridor: IconRoute,
  priority: IconTrafficLight,
  congestion: IconGauge,
  saved: IconShield,
  arrivals: IconHospital,
}

const STATUS_META = {
  OPTIMAL: { cls: 'ok', dot: 'var(--cc-green)' },
  WATCH: { cls: 'high', dot: 'var(--cc-amber)' },
  CONGESTED: { cls: 'critical', dot: 'var(--cc-red)' },
}

function KpiCard({ kpi }) {
  const KIcon = KPI_ICONS[kpi.id]
  const deltaGood = kpi.good === null ? null : (kpi.delta > 0) === kpi.good
  return (
    <article className="cc-stat">
      <div className="cc-stat-top">
        <span>{kpi.label}</span>
        <span className={`cc-stat-icon ${kpi.tone}`}><KIcon size={17} /></span>
      </div>
      <div className="cc-stat-value">{kpi.value}</div>
      <div className="cc-stat-sub">
        <span
          className={`cc-kpi-delta${deltaGood === true ? ' good' : deltaGood === false ? ' bad' : ''}`}
        >
          {kpi.delta > 0 ? '▲' : '▼'} {Math.abs(kpi.delta)}%
        </span>
        {kpi.sub} · vs prev period
      </div>
    </article>
  )
}

export default function Analytics() {
  const [range, setRange] = useState('7d')
  const data = useMemo(() => getAnalytics(range), [range])
  const routes = useMemo(() => getRoutePerformance(range), [range])
  const rangeLabel = RANGES.find((r) => r.id === range)?.label

  return (
    <main className="cc-content">
      <div className="cc-sim-note">
        <IconAlert size={13} />
        All metrics below are a generated demo dataset — the reporting backend/database is not connected yet.
      </div>

      <div className="cc-tc-summary">
        <div className="cc-chip-row" role="group" aria-label="Time range">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`cc-chip${range === r.id ? ' active' : ''}`}
              onClick={() => setRange(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>
        <span style={{ flex: 1 }} />
        <Pill tone="blue"><Dot pulse /> Demo dataset · {rangeLabel}</Pill>
      </div>

      {/* KPI cards */}
      <div className="cc-stats cc-an-kpis">
        {data.kpis.map((k) => <KpiCard key={k.id} kpi={k} />)}
      </div>

      {/* Charts */}
      <div className="cc-an-charts">
        <Card title="Emergency Cases Over Time" icon={<IconSiren size={16} />} headRight={<Pill>{rangeLabel}</Pill>}>
          <BarChart key={range} labels={data.labels} values={data.series.cases} color={HUE.red} name="Cases" />
        </Card>

        <Card title="Response vs Travel Time" icon={<IconClock size={16} />} headRight={<Pill>minutes</Pill>}>
          <LineChart
            key={range}
            labels={data.labels}
            unit=" min"
            series={[
              { name: 'Response time', color: HUE.blue, values: data.series.response },
              { name: 'Travel time', color: HUE.amber, values: data.series.travel },
            ]}
          />
        </Card>

        <Card title="Traffic Congestion Trend" icon={<IconGauge size={16} />} headRight={<Pill>city average</Pill>}>
          <LineChart
            key={range}
            labels={data.labels}
            unit="%"
            area
            series={[{ name: 'Congestion', color: HUE.amber, values: data.series.congestion }]}
          />
        </Card>

        <Card title="Green Corridor Usage" icon={<IconRoute size={16} />} headRight={<Pill>activations</Pill>}>
          <BarChart key={range} labels={data.labels} values={data.series.corridor} color={HUE.green} name="Corridors" />
        </Card>
      </div>

      <Card title="Signal Priority Activations" icon={<IconTrafficLight size={16} />} headRight={<Pill>junction green-holds</Pill>}>
        <BarChart key={range} labels={data.labels} values={data.series.priority} color={HUE.blue} name="Priority activations" height={190} w={1100} />
      </Card>

      {/* Route performance */}
      <Card
        title="Route Performance"
        icon={<IconActivity size={16} />}
        headRight={<Pill>sorted by congestion</Pill>}
      >
        <div className="cc-an-table-wrap">
          <table className="cc-an-table">
            <thead>
              <tr>
                <th>Route / Intersection</th>
                <th>Type</th>
                <th>Avg Transit</th>
                <th>Congestion</th>
                <th>Priority Activations</th>
                <th>Time Saved</th>
                <th>Trend</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => {
                const meta = STATUS_META[r.status]
                return (
                  <tr key={r.name}>
                    <td className="cc-an-td-name">{r.name}</td>
                    <td className="cc-an-td-dim">{r.kind}</td>
                    <td>{r.transit} min</td>
                    <td>
                      <span className="cc-an-congestion">
                        <span className="cc-an-cong-track">
                          <span
                            className="cc-an-cong-fill"
                            style={{
                              width: `${r.congestion}%`,
                              background: r.congestion >= 70 ? 'var(--cc-red)' : r.congestion >= 50 ? 'var(--cc-amber)' : 'var(--cc-green)',
                            }}
                          />
                        </span>
                        {r.congestion}%
                      </span>
                    </td>
                    <td>{r.activations}</td>
                    <td>{r.savedMin} min</td>
                    <td className={r.trend <= 0 ? 'cc-an-trend-good' : 'cc-an-trend-bad'}>
                      {r.trend <= 0 ? '▼' : '▲'} {Math.abs(r.trend)}%
                    </td>
                    <td>
                      <span className={`cc-badge ${meta.cls}`}>
                        <span className="cc-leg-dot" style={{ background: meta.dot }} /> {r.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="cc-an-footnote">
          <IconChart size={12} /> Corridor-managed segments trend downward in congestion; Ring Road segments remain the
          bottleneck and are candidates for additional signal coordination.
        </p>
      </Card>
    </main>
  )
}
