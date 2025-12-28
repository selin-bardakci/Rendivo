import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import styles from '../styles/discover.module.css'
import Link from 'next/link'
import { businessApi } from '../lib/api'

const BUSINESS_CATEGORIES = [
  'Beauty & Wellness',
  'Healthcare',
  'Fitness & Sports',
  'Professional Services',
  'Education & Tutoring',
  'Pet Services',
  'Automotive',
  'Photography & Video',
  'Therapy & Counseling',
  'Other'
]

export default function DiscoverPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [availableServices, setAvailableServices] = useState<string[]>([])
  const [businesses, setBusinesses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch businesses from API
  useEffect(() => {
    fetchBusinesses()
  }, [])

  // Fetch available services when category changes
  useEffect(() => {
    fetchAvailableServices()
  }, [selectedCategory])

  const fetchAvailableServices = async () => {
    try {
      const params = selectedCategory ? { businessType: selectedCategory } : {}
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/all-unique?${new URLSearchParams(params)}`)
      const data = await response.json()
      setAvailableServices(data)
    } catch (error) {
      console.error('Error fetching available services:', error)
      setAvailableServices([])
    }
  }

  const fetchBusinesses = async () => {
    try {
      setLoading(true)
      const response = await businessApi.getAll({
        search: searchQuery || undefined,
        businessType: selectedCategory || undefined,
        services: selectedServices.length > 0 ? selectedServices.join(',') : undefined,
      })
      setBusinesses(response.data)
    } catch (error) {
      console.error('Error fetching businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  // Re-fetch when search or filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBusinesses()
    }, 500) // Debounce search
    return () => clearTimeout(timeoutId)
  }, [searchQuery, selectedCategory, selectedServices])

  const toggleService = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    )
  }

  const clearFilters = () => {
    setSelectedServices([])
    setSelectedCategory('')
  }

  const applyFilters = () => {
    setShowFilterModal(false)
  }

  if (loading) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.content}>
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <p>Loading businesses...</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.title}>Discover Local Businesses</h1>
            <p className={styles.subtitle}>Find the perfect place for your next appointment</p>
          </div>

          {/* Search and Filter Bar */}
          <div className={styles.searchBar}>
            <div className={styles.searchInputWrapper}>
              <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or location..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className={styles.filterGroup}>
              <select
                className={styles.categorySelect}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {BUSINESS_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <button 
              className={styles.filterButton}
              onClick={() => setShowFilterModal(true)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter by Service
              {selectedServices.length > 0 && (
                <span className={styles.filterBadge}>{selectedServices.length}</span>
              )}
            </button>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedServices.length > 0 || selectedCategory) && (
            <div className={styles.activeFilters}>
              <span className={styles.filterLabel}>Active filters:</span>
              {selectedCategory && (
                <span className={styles.filterTag}>
                  Category: {selectedCategory}
                  <button 
                    className={styles.removeFilter}
                    onClick={() => setSelectedCategory('')}
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedServices.map(service => (
                <span key={service} className={styles.filterTag}>
                  {service}
                  <button 
                    className={styles.removeFilter}
                    onClick={() => toggleService(service)}
                  >
                    ×
                  </button>
                </span>
              ))}
              <button className={styles.clearFilters} onClick={clearFilters}>
                Clear all
              </button>
            </div>
          )}

          {/* Results Count */}
          <div className={styles.resultsCount}>
            {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'} found
          </div>

          {/* Business Cards Grid */}
          <div className={styles.businessGrid}>
            {businesses.map(business => (
              <div key={business.id} className={styles.businessCard}>
                <div className={styles.cardContent}>
                  <h3 className={styles.businessName}>{business.businessName}</h3>
                  
                  {business.businessType && (
                    <div style={{ 
                      color: '#df84dc', 
                      fontSize: '13px', 
                      fontWeight: '500',
                      marginBottom: '8px'
                    }}>
                      {business.businessType}
                    </div>
                  )}
                  
                  <div className={styles.businessLocation}>
                    <svg className={styles.locationIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{business.address}, {business.city}, {business.state}</span>
                  </div>

                  <div className={styles.servicesTags}>
                    {business.services?.slice(0, 3).map((service: any) => (
                      <span key={service.id} className={styles.serviceTag}>
                        {service.name}
                      </span>
                    ))}
                    {business.services && business.services.length > 3 && (
                      <span className={styles.serviceTag}>+{business.services.length - 3} more</span>
                    )}
                    {(!business.services || business.services.length === 0) && (
                      <span className={styles.serviceTag} style={{ color: '#999' }}>No services yet</span>
                    )}
                  </div>
                </div>

                <button 
                  className={styles.bookButton}
                  onClick={() => router.push(`/book/${business.id}`)}
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>

          {/* No Results */}
          {businesses.length === 0 && (
            <div className={styles.noResults}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <h3>No businesses found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Filter Modal */}
        {showFilterModal && (
          <div className={styles.modalOverlay} onClick={() => setShowFilterModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Filter by Service</h3>
                <button 
                  className={styles.closeButton}
                  onClick={() => setShowFilterModal(false)}
                >
                  ×
                </button>
              </div>

              <div className={styles.modalContent}>
                {selectedCategory && (
                  <p className={styles.modalDescription} style={{ marginBottom: '16px', color: '#886385', fontSize: '14px' }}>
                    Showing services for: <strong>{selectedCategory}</strong>
                  </p>
                )}
                {availableServices.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                    {availableServices.map((service) => (
                      <label 
                        key={service} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          padding: '10px 12px',
                          border: '2px solid #e5dce4',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          backgroundColor: selectedServices.includes(service) ? '#fef5ff' : 'white',
                          borderColor: selectedServices.includes(service) ? '#df84dc' : '#e5dce4'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(service)}
                          onChange={() => toggleService(service)}
                          style={{ 
                            accentColor: '#df84dc',
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer'
                          }}
                        />
                        <span style={{ fontSize: '15px', color: '#181117' }}>{service}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className={styles.modalDescription}>
                    No services available yet. Try selecting a different category.
                  </p>
                )}
              </div>

              <div className={styles.modalActions}>
                <button 
                  className={styles.modalButtonSecondary}
                  onClick={clearFilters}
                >
                  Clear All
                </button>
                <button 
                  className={styles.modalButtonPrimary}
                  onClick={applyFilters}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
