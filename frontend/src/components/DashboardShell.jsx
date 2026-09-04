import { useNavigate } from 'react-router-dom'
import Brand from './Brand'
import { clearAuth, getStoredUser } from '../api'

export default function DashboardShell({title,subtitle,children,navItems=[],active,onNav}){
  const navigate=useNavigate(); const user=getStoredUser()
  const logout=()=>{clearAuth();navigate('/login')}
  return <div className="app-shell">
    <aside className="sidebar">
      <Brand/>
      <div className="sidebar-profile"><div className="avatar">{user?.full_name?.slice(0,1)?.toUpperCase()||'U'}</div><div><strong>{user?.full_name}</strong><small>{user?.role}</small></div></div>
      <nav className="side-nav">{navItems.map(item=><button key={item.id} className={active===item.id?'active':''} onClick={()=>onNav(item.id)}><span>{item.icon}</span>{item.label}</button>)}</nav>
      <button className="logout-btn" onClick={logout}>↪ Sign out</button>
    </aside>
    <main className="dashboard-main">
      <header className="dashboard-header"><div><p className="eyebrow">YieldSense AI</p><h1>{title}</h1><p>{subtitle}</p></div><div className="header-chip"><span className="live-dot"/> Platform ready</div></header>
      {children}
    </main>
  </div>
}
