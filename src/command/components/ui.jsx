/* Small reusable UI primitives shared by every Command Center module. */

export function Pill({ tone = '', children, className = '', ...rest }) {
  return (
    <span className={`cc-pill ${tone} ${className}`.trim()} {...rest}>
      {children}
    </span>
  )
}

export function Dot({ pulse = false }) {
  return <span className={`cc-dot${pulse ? ' pulse' : ''}`} />
}

export function Badge({ level = 'ok', children }) {
  return <span className={`cc-badge ${level.toLowerCase()}`}>{children}</span>
}

export function Card({ title, icon, headRight, className = '', children }) {
  return (
    <section className={`cc-card ${className}`.trim()}>
      {(title || headRight) && (
        <div className="cc-card-head">
          {title && (
            <h3 className="cc-card-title">
              {icon && <span className="cc-title-icon">{icon}</span>}
              {title}
            </h3>
          )}
          {headRight && <div className="cc-head-right">{headRight}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

export function SignalLight({ state }) {
  return (
    <span className="cc-signal-light" aria-label={`Signal ${state}`}>
      <span className={`cc-lamp${state === 'red' ? ' on-red' : ''}`} />
      <span className={`cc-lamp${state === 'amber' ? ' on-amber' : ''}`} />
      <span className={`cc-lamp${state === 'green' ? ' on-green' : ''}`} />
    </span>
  )
}

export function StatCard({ label, value, sub, tone = 'blue', icon }) {
  return (
    <article className="cc-stat">
      <div className="cc-stat-top">
        <span>{label}</span>
        <span className={`cc-stat-icon ${tone}`}>{icon}</span>
      </div>
      <div className="cc-stat-value">{value}</div>
      <div className="cc-stat-sub">
        <span className={`cc-leg-dot`} style={{ background: `var(--cc-${tone === 'blue' ? 'primary' : tone})` }} />
        {sub}
      </div>
    </article>
  )
}
