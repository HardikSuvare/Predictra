import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import BrandLogo from './components/BrandLogo'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Predictions from './pages/Predictions'
import Analytics from './pages/Analytics'
import Retention from './pages/Retention'
import Feedback from './pages/Feedback'
import Settings from './pages/Settings'
import './App.css'

const pageInfo = {
  dashboard:['Dashboard overview','Welcome back to your customer intelligence workspace.'],
  customers:['Customer directory','Explore customer profiles and subscription health.'],
  predictions:['Churn predictions','Identify customers who may be at risk of leaving.'],
  analytics:['Analytics & reports','Measure customer health and retention performance.'],
  retention:['Retention hub','Turn predictive insights into meaningful action.'],
  feedback:['Customer feedback','Listen, learn and improve the customer experience.'],
  settings:['Workspace settings','Manage your Predictra experience.'],
}

function SplashScreen({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 6500)
    return () => clearTimeout(timer)
  }, [onComplete])
  return <div className="splash-screen"><div className="splash-glow splash-glow-one"/><div className="splash-glow splash-glow-two"/>
    <div className="splash-content"><div className="splash-logo"><BrandLogo size={132}/></div><div className="splash-overline">CUSTOMER INTELLIGENCE PLATFORM</div><h1>PREDICTRA<span>.</span></h1><p className="splash-tagline">Predict. Understand. Retain.</p><p className="splash-description">AI-powered customer intelligence</p><div className="splash-loader"><i/></div><span className="splash-loading-text">Preparing your workspace</span></div>
  </div>
}

export default function App() {
  const [page,setPage] = useState('dashboard')
  const [splash,setSplash] = useState(true)
  const [collapsed,setCollapsed] = useState(false)
  const [mobileOpen,setMobileOpen] = useState(false)
  const [searchOpen,setSearchOpen] = useState(false)

  useEffect(() => {
    const handleKey = e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(v => !v)
      }
      if (e.key === 'Escape') { setSearchOpen(false); setMobileOpen(false) }
    }
    window.addEventListener('keydown',handleKey)
    return () => window.removeEventListener('keydown',handleKey)
  }, [])

  const navigate = id => { setPage(id); setMobileOpen(false); window.scrollTo({top:0,behavior:'smooth'}) }
  const pageComponents = { dashboard:<Dashboard navigate={navigate}/>, customers:<Customers/>, predictions:<Predictions/>, analytics:<Analytics/>, retention:<Retention/>, feedback:<Feedback/>, settings:<Settings/> }

  if (splash) return <SplashScreen onComplete={() => setSplash(false)}/>

  return <div className="app-shell">
    <Sidebar active={page} onNavigate={navigate} collapsed={collapsed} onToggle={()=>setCollapsed(v=>!v)} mobileOpen={mobileOpen} onClose={()=>setMobileOpen(false)}/>
    <main className={`main-area ${collapsed?'sidebar-collapsed':''}`}>
      <Topbar title={pageInfo[page][0]} subtitle={pageInfo[page][1]} onMenu={()=>setMobileOpen(true)}/>
      <div className="page-transition" key={page}>{pageComponents[page]}</div>
      <footer className="app-footer"><span>© 2026 Predictra</span><span>Predict. Understand. Retain.</span><span><i className="status-dot"/>Live environment</span></footer>
    </main>
    {searchOpen&&<div className="modal-backdrop search-backdrop" onClick={()=>setSearchOpen(false)}><div className="command-modal" onClick={e=>e.stopPropagation()}><div className="search-input"><span>⌕</span><input autoFocus placeholder="Search pages..." onChange={e=>window.__predictraSearch=e.target.value}/><kbd>ESC</kbd></div><div className="command-list">{Object.entries(pageInfo).map(([id,info])=><button key={id} onClick={()=>{navigate(id);setSearchOpen(false)}}><span>{info[0]}</span><span>↵</span></button>)}</div><div className="command-hint">Navigate anywhere in Predictra</div></div></div>}
  </div>
}
