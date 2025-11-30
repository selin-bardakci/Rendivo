import React from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import ProtectedRoute from '../../components/ProtectedRoute'
import { getCurrentUser, logout } from '../../lib/auth'

export default function CustomerDashboard() {
  const router = useRouter()
  const user = getCurrentUser()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '40px 20px' 
        }}>
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '32px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '32px'
            }}>
              <div>
                <h1 style={{ 
                  fontSize: '32px', 
                  fontWeight: 'bold', 
                  color: '#2d1b2e',
                  marginBottom: '8px'
                }}>
                  Welcome to Your Dashboard
                </h1>
                <p style={{ fontSize: '16px', color: '#886385' }}>
                  Hello, {user?.email || 'Customer'}! 👋
                </p>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  padding: '10px 20px',
                  background: '#df84dc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Logout
              </button>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px',
              marginTop: '32px'
            }}>
              {/* Appointments Card */}
              <div style={{
                background: '#f9f5f9',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #e5dce4'
              }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: '#2d1b2e',
                  marginBottom: '8px'
                }}>
                  My Appointments
                </h3>
                <p style={{ fontSize: '14px', color: '#886385', marginBottom: '16px' }}>
                  View and manage your bookings
                </p>
                <button
                  onClick={() => router.push('/appointments')}
                  style={{
                    padding: '8px 16px',
                    background: '#df84dc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    width: '100%'
                  }}
                >
                  View Appointments
                </button>
              </div>

              {/* Discover Businesses Card */}
              <div style={{
                background: '#f9f5f9',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #e5dce4'
              }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: '#2d1b2e',
                  marginBottom: '8px'
                }}>
                  Discover Businesses
                </h3>
                <p style={{ fontSize: '14px', color: '#886385', marginBottom: '16px' }}>
                  Find and book services near you
                </p>
                <button
                  onClick={() => router.push('/discover')}
                  style={{
                    padding: '8px 16px',
                    background: '#df84dc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    width: '100%'
                  }}
                >
                  Browse Businesses
                </button>
              </div>

              {/* Profile Card */}
              <div style={{
                background: '#f9f5f9',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #e5dce4'
              }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: '#2d1b2e',
                  marginBottom: '8px'
                }}>
                  My Profile
                </h3>
                <p style={{ fontSize: '14px', color: '#886385', marginBottom: '16px' }}>
                  Update your personal information
                </p>
                <button
                  style={{
                    padding: '8px 16px',
                    background: '#df84dc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    width: '100%'
                  }}
                >
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div style={{ 
              marginTop: '32px',
              padding: '24px',
              background: '#fef8fe',
              borderRadius: '12px',
              border: '1px solid #f5e6f4'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#2d1b2e',
                marginBottom: '16px'
              }}>
                Quick Stats
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '16px'
              }}>
                <div>
                  <p style={{ fontSize: '14px', color: '#886385' }}>Total Appointments</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#df84dc' }}>0</p>
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: '#886385' }}>Upcoming</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#df84dc' }}>0</p>
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: '#886385' }}>Completed</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#df84dc' }}>0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
