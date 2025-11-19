import Link from 'next/link'
import React from 'react'

const Nav: React.FC = () => {
  return (
    <header className="top-header">
      <div className="brand">
        <div style={{width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:6,background:'var(--color-primary)',color:'#fff'}}>
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"/></svg>
        </div>
        <span>Rendivo</span>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:24}}>
        <nav className="nav-links">
          <a href="#">How It Works</a>
          <a href="#">For Businesses</a>
          <a href="#">Pricing</a>
        </nav>
        <div className="actions">
          <button className="btn-primary">Sign Up</button>
          <button className="btn-ghost">Log In</button>
        </div>
      </div>
    </header>
  )
}

export default Nav
