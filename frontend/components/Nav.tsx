import Link from 'next/link'
import Image from 'next/image'
import React from 'react'

const Nav: React.FC = () => {
  const scrollToFeatures = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const featuresSection = document.getElementById('features')
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="top-header">
      <div className="brand">
        <div style={{width:80,height:80,display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
          <Image src="/logo.svg" alt="Rendivo Logo" width={80} height={80} style={{objectFit:'contain'}} />
        </div>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:24}}>
        <nav className="nav-links">
          <a href="#features" onClick={scrollToFeatures}>How It Works</a>
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
