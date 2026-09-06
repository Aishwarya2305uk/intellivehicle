/* Analytics data layer — DEMO/SIMULATION.

   getAnalytics(rangeId) returns exactly the shape a backend reporting API
   would serve: { kpis, series, routes }. Values are deterministic (seeded
   waves, not Math.random) so the dashboard is stable across re-renders.
   To go live later, replace this module's internals with fetch calls that
   return the same shape — the page and charts stay untouched. */

export const RANGES = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
]

const S = (i, f, p) => Math.sin(i * f + p)
const gauss = (x, mu, sig) => Math.exp(-((x - mu) ** 2) / (2 * sig * sig))

function wave(n, base, amp, seed, min = 0) {
  return Array.from({ length: n }, (_, i) =>
    Math.max(min, Math.round(base + amp * (0.6 * S(i, 0.9, seed) + 0.4 * S(i, 0.33, seed * 1.7))))
  )
}

function labelsFor(rangeId) {
  if (rangeId === 'today') {
    return Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`)
  }
  const days = rangeId === '7d' ? 7 : 30
  const out = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    out.push(
      days === 7
        ? d.toLocaleDateString('en-GB', { weekday: 'short' })
        : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    )
  }
  return out
}

export function getAnalytics(rangeId) {
  const labels = labelsFor(rangeId)
  const n = labels.length
  const seed = rangeId === 'today' ? 3 : rangeId === '7d' ? 11 : 29

  // Emergency cases per bucket
  const cases =
    rangeId === 'today'
      ? Array.from({ length: 24 }, (_, h) =>
          Math.max(0, Math.round(1 + 4 * (gauss(h, 9, 2.4) + gauss(h, 19, 2.8)) + 1.2 * S(h, 1.3, seed)))
        )
      : wave(n, rangeId === '7d' ? 14 : 12, 5, seed, 4)

  // Response & travel time (minutes, one decimal)
  const response = wave(n, 46, 9, seed + 2, 30).map((v) => v / 10) // 3.0–5.5 min
  const travel = wave(n, 118, 22, seed + 5, 80).map((v) => v / 10) // 8–14 min

  // Congestion % (rush-hour humps for today)
  const congestion =
    rangeId === 'today'
      ? Array.from({ length: 24 }, (_, h) =>
          Math.round(38 + 34 * (gauss(h, 9.5, 2.2) + 0.9 * gauss(h, 18.5, 2.6)) + 4 * S(h, 1.1, seed))
        )
      : wave(n, 64, 12, seed + 8, 35)

  // Corridor + signal priority activations
  const corridor = wave(n, rangeId === 'today' ? 1.6 : 6, rangeId === 'today' ? 1.6 : 3, seed + 4, 0)
  const priority = corridor.map((c, i) => c * 3 + wave(n, 3, 2, seed + 6, 0)[i])

  const sum = (a) => a.reduce((x, y) => x + y, 0)
  const avg = (a) => sum(a) / a.length

  const totalCases = sum(cases)
  const corridorTotal = sum(corridor)
  const priorityTotal = sum(priority)
  const timeSavedMin = Math.round(corridorTotal * 7.6)
  const arrivals = totalCases - Math.max(1, Math.round(totalCases * 0.02))

  const kpis = [
    { id: 'cases', label: 'Emergency Cases', value: String(totalCases), sub: 'Total in period', tone: 'red', delta: +9, good: null },
    { id: 'response', label: 'Avg Response Time', value: `${avg(response).toFixed(1)} min`, sub: 'Dispatch → on scene', tone: 'blue', delta: -8, good: true },
    { id: 'travel', label: 'Avg Travel Time', value: `${avg(travel).toFixed(1)} min`, sub: 'Scene → hospital', tone: 'blue', delta: -6, good: true },
    { id: 'corridor', label: 'Green Corridors', value: String(corridorTotal), sub: 'Activations', tone: 'green', delta: +14, good: true },
    { id: 'priority', label: 'Signal Priorities', value: String(priorityTotal), sub: 'Junction activations', tone: 'green', delta: +11, good: true },
    { id: 'congestion', label: 'Avg Congestion', value: `${Math.round(avg(congestion))}%`, sub: 'City average', tone: 'amber', delta: -4, good: true },
    { id: 'saved', label: 'Est. Time Saved', value: timeSavedMin >= 90 ? `${Math.floor(timeSavedMin / 60)}h ${timeSavedMin % 60}m` : `${timeSavedMin} min`, sub: 'Via signal priority', tone: 'green', delta: +17, good: true },
    { id: 'arrivals', label: 'Hospital Arrivals', value: String(arrivals), sub: 'Completed handovers', tone: 'green', delta: +9, good: true },
  ]

  return {
    labels,
    kpis,
    series: { cases, response, travel, congestion, corridor, priority },
  }
}

/* Route / intersection performance for the period. */
export function getRoutePerformance(rangeId) {
  const f = rangeId === 'today' ? 0.9 : rangeId === '7d' ? 1 : 1.06
  const rows = [
    { name: 'MG Road Corridor', kind: 'Green corridor', transit: 6.2 * f, congestion: 46, activations: 21, savedMin: 74, trend: -9 },
    { name: 'Hospital Road', kind: 'Route', transit: 4.1 * f, congestion: 38, activations: 14, savedMin: 41, trend: -6 },
    { name: 'Station Road Jn', kind: 'Junction', transit: 3.4 * f, congestion: 41, activations: 9, savedMin: 22, trend: -3 },
    { name: 'Old Market Road', kind: 'Route', transit: 5.0 * f, congestion: 52, activations: 6, savedMin: 15, trend: +2 },
    { name: 'Ring Road Jn', kind: 'Junction', transit: 7.8 * f, congestion: 71, activations: 12, savedMin: 33, trend: +5 },
    { name: 'Ring Road East', kind: 'Route', transit: 9.1 * f, congestion: 82, activations: 8, savedMin: 19, trend: +8 },
  ]
  return rows
    .map((r) => ({
      ...r,
      transit: r.transit.toFixed(1),
      status: r.congestion >= 70 ? 'CONGESTED' : r.congestion >= 50 ? 'WATCH' : 'OPTIMAL',
    }))
    .sort((a, b) => a.congestion - b.congestion)
}
