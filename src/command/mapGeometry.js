/* Pure geometry helpers for polyline routes on the city map. */

/* Interpolate a point along a polyline at t in [0, 1]. */
export function pointAt(points, t) {
  const segs = []
  let total = 0
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i]
    const [x2, y2] = points[i + 1]
    const len = Math.hypot(x2 - x1, y2 - y1)
    segs.push({ x1, y1, x2, y2, len })
    total += len
  }
  let dist = t * total
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i]
    if (dist <= s.len) {
      const k = s.len === 0 ? 0 : dist / s.len
      return { x: s.x1 + (s.x2 - s.x1) * k, y: s.y1 + (s.y2 - s.y1) * k, segIndex: i }
    }
    dist -= s.len
  }
  const last = points[points.length - 1]
  return { x: last[0], y: last[1], segIndex: points.length - 2 }
}

export function toPath(points) {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]} ${p[1]}`).join(' ')
}

/* Fraction of the way along a polyline at which it passes a given point,
   or null when the route never touches that point. Segments are
   axis-aligned (the city road grid), so a simple on-segment test suffices. */
export function progressAtPoint(points, [px, py], eps = 2) {
  const segs = []
  let total = 0
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i]
    const [x2, y2] = points[i + 1]
    const len = Math.hypot(x2 - x1, y2 - y1)
    segs.push({ x1, y1, x2, y2, len })
    total += len
  }
  let cum = 0
  for (const s of segs) {
    if (Math.abs(s.y1 - s.y2) <= eps) {
      // horizontal segment
      if (Math.abs(py - s.y1) <= eps && px >= Math.min(s.x1, s.x2) - eps && px <= Math.max(s.x1, s.x2) + eps) {
        return (cum + Math.abs(px - s.x1)) / total
      }
    } else if (Math.abs(s.x1 - s.x2) <= eps) {
      // vertical segment
      if (Math.abs(px - s.x1) <= eps && py >= Math.min(s.y1, s.y2) - eps && py <= Math.max(s.y1, s.y2) + eps) {
        return (cum + Math.abs(py - s.y1)) / total
      }
    }
    cum += s.len
  }
  return null
}
