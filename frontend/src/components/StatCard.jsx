import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
export default function StatCard({ label, value, change, positive=true, icon:Icon, note }) {
  return <article className="stat-card">
    <div className="stat-top"><span>{label}</span><div className="stat-icon"><Icon size={18}/></div></div>
    <div className="stat-value">{value}</div>
    <div className="stat-bottom"><span className={`stat-change ${positive ? 'good' : 'bad'}`}>{positive ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>} {change}</span><span className="stat-note">{note}</span></div>
  </article>
}
