import { LayoutDashboard, Users, BrainCircuit, ChartNoAxesCombined, HeartHandshake, Settings, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import BrandLogo from './BrandLogo'

const groups = [
  { label:'WORKSPACE', items:[
    { id:'dashboard', label:'Overview', icon:LayoutDashboard },
    { id:'customers', label:'Customers', icon:Users },
    { id:'predictions', label:'Churn predictions', icon:BrainCircuit },
    { id:'analytics', label:'Analytics', icon:ChartNoAxesCombined },
  ]},
  { label:'ENGAGEMENT', items:[
    { id:'retention', label:'Retention hub', icon:HeartHandshake },
]},
  { label:'PREFERENCES', items:[
    { id:'settings', label:'Settings', icon:Settings },
  ]},
]

export default function Sidebar({ active, onNavigate, collapsed, onToggle, mobileOpen, onClose }) {
  return (
    <>
      {mobileOpen && <button className="mobile-scrim" aria-label="Close menu" onClick={onClose}/>}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <BrandLogo size={44}/>
          {!collapsed && <div><div className="brand-name">Predictra<span className="brand-dot">.</span></div><div className="brand-caption">CUSTOMER INTELLIGENCE</div></div>}
        </div>
        <button className="collapse-button" onClick={onToggle} title="Collapse sidebar">
          {collapsed ? <PanelLeftOpen size={17}/> : <PanelLeftClose size={17}/>}
          {!collapsed && <span>Collapse menu</span>}
        </button>
        <nav className="side-nav">
          {groups.map(group => <div className="nav-group" key={group.label}>
            {!collapsed && <div className="nav-label">{group.label}</div>}
            {group.items.map(item => {
              const Icon = item.icon
              return <button key={item.id} className={`nav-item ${active === item.id ? 'active' : ''}`} onClick={() => { onNavigate(item.id); onClose() }} title={collapsed ? item.label : undefined}>
                <Icon size={18}/>{!collapsed && <span>{item.label}</span>}
                {item.id === 'predictions' && !collapsed && <span className="nav-pill">AI</span>}
              </button>
            })}
          </div>)}
        </nav>
        {!collapsed && <div className="sidebar-bottom"><div className="sidebar-status"><span className="status-dot"/> Live workspace active</div><div className="profile-mini"><div className="avatar avatar-purple">HS</div><div><strong>Workspace Admin</strong><small>Personal workspace</small></div><span className="profile-menu">•••</span></div></div>}
      </aside>
    </>
  )
}
