import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import styles from '../../../styles/businessSignup.module.css'
import { registerBusiness } from '../../../lib/auth'

export default function BusinessSignupStep3() {
  const router = useRouter()
  const [step1Data, setStep1Data] = useState<any>(null)
  const [step2Data, setStep2Data] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [businessId, setBusinessId] = useState<string>('')
  const submittedRef = useRef(false)

  useEffect(() => {
    // Prevent double submission in React StrictMode
    if (submittedRef.current) return;
    
    // Load previous steps data
    const step1 = sessionStorage.getItem('businessSignupStep1')
    const step2 = sessionStorage.getItem('businessSignupStep2')
    
    if (!step1 || !step2) {
      router.push('/signup/business/step1')
      return
    }

    const parsedStep1 = JSON.parse(step1)
    const parsedStep2 = JSON.parse(step2)
    
    setStep1Data(parsedStep1)
    setStep2Data(parsedStep2)

    // Mark as submitted and automatically submit registration
    submittedRef.current = true;
    submitRegistration(parsedStep1, parsedStep2)
  }, [])

  const submitRegistration = async (step1: any, step2: any) => {
    if (loading) return; // Prevent duplicate submissions
    
    setLoading(true)
    setError(null)

    try {
      const registrationData = {
        email: step1.email,
        password: step1.password,
        fullName: step1.fullName,
        businessName: step2.businessName,
        businessType: step2.businessType,
        address: step2.address,
        city: step2.city,
        state: step2.state,
        zipCode: step2.zipCode,
        phone: step2.phone,
        website: ''
      }

      console.log('Submitting registration data:', JSON.stringify(registrationData, null, 2))
      const response = await registerBusiness(registrationData)
      setBusinessId(response.business.businessId)
      
      // Clear session storage
      sessionStorage.removeItem('businessSignupStep1')
      sessionStorage.removeItem('businessSignupStep2')
      
      // Redirect based on approval status
      if (response.approvalStatus === 'pending') {
        router.push('/business/pending-approval')
      } else {
        setSuccess(true)
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      console.error('Error response:', err?.response)
      console.error('Error response data:', err?.response?.data)
      setError(err?.response?.data?.message || err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoToDashboard = () => {
    router.push('/business/dashboard')
  }

  if (loading) {
    return (
      <Layout noFooterMargin>
        <div className={styles.pageContainer}>
          <main className={`${styles.mainContent} ${styles.step3Layout}`}>
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '24px' }}>⏳</div>
              <h2>Creating your business account...</h2>
              <p style={{ color: '#886385' }}>Please wait a moment</p>
            </div>
          </main>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout noFooterMargin>
        <div className={styles.pageContainer}>
          <main className={`${styles.mainContent} ${styles.step3Layout}`}>
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '24px', color: '#dc2626' }}>❌</div>
              <h2>Registration Failed</h2>
              <p style={{ color: '#dc2626', marginBottom: '24px' }}>{error}</p>
              <button 
                onClick={() => router.push('/signup/business/step1')}
                className={styles.dashboardButton}
              >
                Try Again
              </button>
            </div>
          </main>
        </div>
      </Layout>
    )
  }

  if (!step1Data || !step2Data || !success) {
    return null
  }

  return (
    <Layout noFooterMargin>
      <div className={styles.pageContainer}>
        <main className={`${styles.mainContent} ${styles.step3Layout}`}>
          {/* Progress Bar */}
          <div className={styles.progressSectionStep3}>
            <div className={styles.progressHeader}>
              <p className={styles.progressText}>Step 3 of 3: Complete</p>
            </div>
            <div className={styles.progressBarContainer}>
              <div className={styles.progressBar} style={{ width: '100%' }}></div>
            </div>
          </div>

          {/* Success Icon */}
          <div className={styles.successIcon}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="40" fill="#10b981" fillOpacity="0.1"/>
              <circle cx="40" cy="40" r="32" fill="#10b981" fillOpacity="0.2"/>
              <path d="M25 40L35 50L55 30" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Success Message */}
          <div className={styles.successHeader}>
            <h1>You're all set!</h1>
            <p>Welcome to Rendivo, {step2Data.businessName}! You're ready to start managing your appointments.</p>
          </div>

          {/* Business Summary Card */}
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>Business Details Summary</h2>
            <p className={styles.summarySubtitle}>Here's the information we have on file for your business.</p>
            
            <div className={styles.summaryDetails}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Business Name:</span>
                <span className={styles.summaryValue}>{step2Data.businessName}</span>
              </div>
              {businessId && (
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Business ID:</span>
                  <span className={styles.summaryValue} style={{ fontWeight: 600, color: '#df84dc' }}>
                    {businessId}
                  </span>
                  <p style={{ fontSize: '12px', color: '#886385', marginTop: '4px' }}>
                    Share this ID with your staff members so they can join your team
                  </p>
                </div>
              )}
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Contact Email:</span>
                <span className={styles.summaryValue}>{step2Data.publicEmail}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Phone:</span>
                <span className={styles.summaryValue}>{step2Data.phoneNumber}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Address:</span>
                <span className={styles.summaryValue}>
                  {step2Data.streetAddress}, {step2Data.city}, {step2Data.state} {step2Data.postalCode}
                </span>
              </div>
            </div>
          </div>

          {/* What's Next Section */}
          <div className={styles.nextStepsSection}>
            <h3 className={styles.nextStepsTitle}>What's next?</h3>
            
            <div className={styles.nextStepsGrid}>
              <button 
                className={styles.optionButton}
                onClick={() => router.push('/business/services')}
              >
                <div className={styles.nextStepIcon}>
                  <Image src="/ikonlar/scissors.svg" alt="Add service" width={28} height={28} />
                </div>
                <span className={styles.nextStepText}>Add Your First Service</span>
              </button>
              <button className={styles.nextStepButton}>
                <div className={styles.nextStepIcon}>
                  <Image src="/ikonlar/people.svg" alt="Invite team" width={28} height={28} />
                </div>
                <span className={styles.nextStepText}>Invite Your Team</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.finalActions}>
            <button 
              onClick={handleGoToDashboard}
              className={styles.dashboardButton}
            >
              Go to Your Dashboard
            </button>
          </div>
        </main>
      </div>
    </Layout>
  )
}
