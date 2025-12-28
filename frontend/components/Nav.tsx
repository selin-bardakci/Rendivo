import Link from 'next/link'
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getCurrentUser, logout } from '../lib/auth'
import api from '../lib/api'
import NotificationBell from './NotificationBell'

const Nav: React.FC = () => {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null)

  useEffect(() => {
    const u = getCurrentUser()
    console.log('👤 Current user:', u)
    setUser(u)
    
    // Check approval status for business owners
    if (u?.role === 'business_owner') {
      checkApprovalStatus()
    }
  }, [router.pathname])

  const checkApprovalStatus = async () => {
    try {
      const response = await api.get('/business/dashboard')
      const status = response.data?.business?.approvalStatus
      console.log('Nav approval status:', status)
      setApprovalStatus(status)
    } catch (error) {
      console.error('Error checking approval status:', error)
    }
  }

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

  const handleLogout = async () => {
    await logout()
    setUser(null)
    router.push('/')
  }

  // Role-based navigation links
  const getNavigationLinks = () => {
    if (!user) return null

    switch (user.role) {
      case 'customer':
        return (
          <>
            <Link href="/discover" className="nav-link">
              Discover
            </Link>
            <Link href="/appointments" className="nav-link">
              My Appointments
            </Link>
          </>
        )
      
      case 'staff':
        return (
          <>
            <Link href="/staff-dashboard" className="nav-link">
              My Schedule
            </Link>
          </>
        )
      
      case 'business_owner':
        const isPending = approvalStatus === 'pending'
        
        const handleDisabledClick = (e: React.MouseEvent) => {
          if (isPending) {
            e.preventDefault()
            e.stopPropagation()
          }
        }
        
        return (
          <>
            <Link 
              href="/business/dashboard" 
              className="nav-link"
              onClick={handleDisabledClick}
              style={isPending ? { 
                pointerEvents: 'none', 
                opacity: 0.5, 
                cursor: 'not-allowed',
                textDecoration: 'none'
              } : {}}
            >
              Dashboard
            </Link>
            <Link 
              href="/business/services" 
              className="nav-link"
              onClick={handleDisabledClick}
              style={isPending ? { 
                pointerEvents: 'none', 
                opacity: 0.5, 
                cursor: 'not-allowed',
                textDecoration: 'none'
              } : {}}
            >
              Services
            </Link>
            <Link 
              href="/business/staff" 
              className="nav-link"
              onClick={handleDisabledClick}
              style={isPending ? { 
                pointerEvents: 'none', 
                opacity: 0.5, 
                cursor: 'not-allowed',
                textDecoration: 'none'
              } : {}}
            >
              Staff
            </Link>
            <Link 
              href="/business/schedule" 
              className="nav-link"
              onClick={handleDisabledClick}
              style={isPending ? { 
                pointerEvents: 'none', 
                opacity: 0.5, 
                cursor: 'not-allowed',
                textDecoration: 'none'
              } : {}}
            >
              Schedule
            </Link>
            <Link 
              href="/business/appointments" 
              className="nav-link"
              onClick={handleDisabledClick}
              style={isPending ? { 
                pointerEvents: 'none', 
                opacity: 0.5, 
                cursor: 'not-allowed',
                textDecoration: 'none'
              } : {}}
            >
              Appointments
            </Link>
          </>
        )
      
      case 'admin':
        return (
          <>
            <Link href="/admin/dashboard" className="nav-link">
              Admin Dashboard
            </Link>
          </>
        )
      
      default:
        return null
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
        <nav className="nav-links" style={{display:'flex',gap:20,alignItems:'center'}}>
          {!user && (
            <a href="#features" onClick={scrollToFeatures}>How It Works</a>
          )}
          {getNavigationLinks()}
        </nav>
        
        <div className="actions" style={{display:'flex',gap:12,alignItems:'center'}}>
          {user && <NotificationBell userId={user.userId} />}
          {user ? (
            <div style={{position:'relative'}}>
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  display:'flex',
                  alignItems:'center',
                  gap:8,
                  padding:'8px 16px',
                  background:'#f8f6f8',
                  border:'1px solid #e5dce4',
                  borderRadius:8,
                  cursor:'pointer',
                  fontWeight:600,
                  color:'#181117',
                  fontSize:14
                }}
              >
                <div style={{
                  width:32,
                  height:32,
                  borderRadius:'50%',
                  background:'linear-gradient(135deg, #df84dc, #d66dd9)',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  color:'white',
                  fontSize:14,
                  fontWeight:700
                }}>
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <span>{user.firstName}</span>
                <svg width="12" height="8" fill="none" viewBox="0 0 12 8">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="#886385" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {showDropdown && (
                <>
                  <div 
                    style={{
                      position:'fixed',
                      top:0,
                      left:0,
                      right:0,
                      bottom:0,
                      zIndex:999
                    }}
                    onClick={() => setShowDropdown(false)}
                  />
                  <div style={{
                    position:'absolute',
                    top:'100%',
                    right:0,
                    marginTop:8,
                    background:'white',
                    border:'1px solid #e5dce4',
                    borderRadius:8,
                    boxShadow:'0 4px 12px rgba(0,0,0,0.1)',
                    minWidth:200,
                    zIndex:1000,
                    overflow:'hidden'
                  }}>
                    <div style={{padding:'12px 16px',borderBottom:'1px solid #f4f0f4'}}>
                      <div style={{fontWeight:700,fontSize:14,color:'#181117'}}>
                        {user.firstName} {user.lastName}
                      </div>
                      <div style={{fontSize:12,color:'#886385',marginTop:2}}>
                        {user.email}
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      style={{
                        width:'100%',
                        padding:'12px 16px',
                        background:'transparent',
                        border:'none',
                        textAlign:'left',
                        cursor:'pointer',
                        fontSize:14,
                        fontWeight:600,
                        color:'#dc3545',
                        display:'flex',
                        alignItems:'center',
                        gap:8
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f8f6f8'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link href="/signup">
                <button className="btn-primary">Sign Up</button>
              </Link>
              <Link href="/login">
                <button className="btn-ghost">Log In</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Nav

