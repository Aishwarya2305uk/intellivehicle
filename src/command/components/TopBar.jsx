import { Pill, Dot } from './ui.jsx'
import { IconSearch, IconBell, IconAlert, IconMenu, IconUser } from '../icons.jsx'

export default function TopBar({ title, subtitle, onMenu }) {
  return (
    <header className="cc-topbar">
      <button className="cc-icon-btn cc-menu-btn" aria-label="Open menu" onClick={onMenu}>
        <IconMenu size={18} />
      </button>

      <div>
        <h1 className="cc-page-title">{title}</h1>
        <div className="cc-page-sub">{subtitle}</div>
      </div>

      <div className="cc-topbar-right">
        <Pill tone="green" className="cc-sys-pill">
          <Dot pulse /> System Operational
        </Pill>

        <Pill tone="red" className="cc-sys-pill">
          <IconAlert size={13} /> 1 Active Emergency
        </Pill>

        <label className="cc-search">
          <IconSearch size={15} />
          <input type="search" placeholder="Search ambulance, junction, hospital…" aria-label="Search" />
        </label>

        <button className="cc-icon-btn" aria-label="Notifications">
          <IconBell size={17} />
          <span className="cc-notif-dot" />
        </button>

        <button className="cc-icon-btn" aria-label="Admin profile" title="Traffic Control Admin">
          <IconUser size={17} />
        </button>
      </div>
    </header>
  )
}
