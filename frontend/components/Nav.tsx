import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { useRouter } from 'next/router'

const Nav: React.FC = () => {
  const router = useRouter()

  const scrollToFeatures = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    
    // If we're not on the homepage, navigate there first
    if (router.pathname !== '/') {
      router.push('/#features')
      return
    }
    
    // If we're already on homepage, just scroll
    const featuresSection = document.getElementById('features')
    if (featuresSection) {
      const headerHeight = 100
      const elementPosition = featuresSection.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <header className="top-header">
      <Link href="/" legacyBehavior>
        <a className="brand" style={{textDecoration:'none'}}>
          <div style={{width:85,height:85,display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
            <Image src="/logo.svg" alt="Rendivo Logo" width={85} height={85} style={{objectFit:'contain'}} />
          </div>
        </a>
      </Link>

      <div style={{display:'flex',alignItems:'center',gap:24}}>
        <nav className="nav-links">
          <a href="#features" onClick={scrollToFeatures}>How It Works</a>
        </nav>
        <div className="actions">
          <Link href="/signup">
            <button className="btn-primary">Sign Up</button>
          </Link>
          <Link href="/login">
            <button className="btn-ghost">Log In</button>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Nav

