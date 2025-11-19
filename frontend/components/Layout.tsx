import React from 'react'
import Nav from './Nav'

const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div>
      <header style={{ padding: 12, borderBottom: '1px solid #e6e6e6' }}>
        <Nav />
      </header>
      <main className="container" style={{ paddingTop: 24 }}>
        {children}
      </main>
    </div>
  )
}

export default Layout
