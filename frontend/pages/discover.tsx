import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import styles from '../styles/discover.module.css'
import Link from 'next/link'
import { businessApi } from '../lib/api'

export default function DiscoverPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [businesses, setBusinesses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch businesses from API
  useEffect(() => {
    fetchBusinesses()
  }, [])

  const fetchBusinesses = async () => {
    try {
      setLoading(true)
      const response = await businessApi.getAll({
        search: searchQuery || undefined,
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
  }, [searchQuery, selectedServices])

  const toggleService = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    )
  }

  const clearFilters = () => {
    setSelectedServices([])
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

          {/* Active Filters */}
          {selectedServices.length > 0 && (
            <div className={styles.activeFilters}>
              <span className={styles.filterLabel}>Active filters:</span>
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
                <p className={styles.modalDescription}>
                  Service filtering coming soon!
                </p>
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
