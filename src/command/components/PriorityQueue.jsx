import { QUEUE } from '../data.js'
import { Card, Badge } from './ui.jsx'
import { IconSiren } from '../icons.jsx'

export default function PriorityQueue() {
  return (
    <Card title="Emergency Priority Queue" icon={<IconSiren size={16} />}>
      <div className="cc-queue">
        {QUEUE.map((q) => (
          <article key={q.id} className={`cc-queue-item${q.level === 'CRITICAL' ? ' critical' : ''}`}>
            <span className="cc-queue-rank">{q.rank}</span>
            <span className="cc-queue-id">{q.id}</span>
            <Badge level={q.level}>{q.level}</Badge>
            <span className="cc-queue-dest">{q.dest}</span>
            <span className="cc-queue-eta">ETA {String(q.etaMin).padStart(2, '0')} min</span>
          </article>
        ))}
      </div>
    </Card>
  )
}
