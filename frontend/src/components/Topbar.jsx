import { Bell, Search, Menu, Command } from 'lucide-react'
export default function Topbar({ title, subtitle, onMenu }) {
  return <header className="topbar">
    <button className="mobile-menu icon-button" onClick={onMenu} aria-label="Open navigation"><Menu size={20}/></button>
    <div className="topbar-heading"><div className="eyebrow">PREDICTRA / WORKSPACE</div><h1>{title}</h1><p>{subtitle}</p></div>
    <div className="topbar-actions">
      <div className="global-search"><Search size={16}/><span>Search anything...</span><kbd><Command size={11}/> K</kbd></div>
      <button className="icon-button notification-button" aria-label="Notifications"><Bell size={18}/><i/></button>
      <div className="avatar avatar-purple top-avatar">HS</div>
    </div>
  </header>
}
