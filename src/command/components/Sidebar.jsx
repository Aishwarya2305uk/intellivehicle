import { NAV_ITEMS } from '../data.js'
import {
  IconDashboard, IconAmbulance, IconTrafficLight, IconRoute, IconAIEye,
  IconHospital, IconSiren, IconChart, IconActivity, IconSettings,
  IconShield, IconLogout,
} from '../icons.jsx'

const NAV_ICONS = {
  'command-center': IconDashboard,
  'live-ambulances': IconAmbulance,
  'traffic-control': IconTrafficLight,
  'green-corridor': IconRoute,
  'ai-detection': IconAIEye,
  'hospitals': IconHospital,
  'emergency-priority': IconSiren,
  'analytics': IconChart,
  'system-status': IconActivity,
  'settings': IconSettings,
}

export default function Sidebar({ active, onNavigate, onExit, open, onClose }) {
  return (
    <>
      {open && <button className="cc-scrim" aria-label="Close menu" onClick={onClose} />}
      <aside className={`cc-sidebar${open ? ' open' : ''}`}>
        <div className="cc-brand">
          <span className="cc-brand-mark"><IconShield size={20} /></span>
          <div>
            <div className="cc-brand-name">Intelli<span>Vehicle</span></div>
            <div className="cc-brand-sub">Traffic Command</div>
          </div>
        </div>

        <nav className="cc-nav" aria-label="Command Center navigation">
          <span className="cc-nav-label">Operations</span>
          {NAV_ITEMS.map((item) => {
            const ItemIcon = NAV_ICONS[item.id]
            return (
              <button
                key={item.id}
                type="button"
                className={`cc-nav-item${active === item.id ? ' active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                <ItemIcon size={17} />
                {item.label}
                {item.badge && <span className="cc-nav-badge">{item.badge}</span>}
              </button>
            )
          })}
        </nav>

        <div className="cc-sidebar-foot">
          <span className="cc-avatar">TA</span>
          <div className="cc-who">
            <div className="cc-who-name">Admin</div>
            <div className="cc-who-role">Traffic Control Admin</div>
          </div>
          <button className="cc-exit-btn" title="Exit to website" onClick={onExit}>
            <IconLogout size={15} />
          </button>
        </div>
      </aside>
    </>
  )
}
