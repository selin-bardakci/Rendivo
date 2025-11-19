import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import styles from '../styles/discover.module.css'
import Link from 'next/link'

export default function DiscoverPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])

  // Mock services list - replace with real data from backend
  const availableServices = [
    'Haircut & Styling',
    'Massage Therapy',
    'Nail Treatment',
    'Facial Treatment',
    'Waxing',
    'Makeup',
    'Spa Treatment',
    'Body Treatment',
    'Skin Care',
    'Hair Coloring',
    'Manicure',
    'Pedicure'
  ]

  // Mock businesses data - replace with real API call
  const businesses = [
    {
      id: 1,
      name: 'Beauty Studio Downtown',
      location: '123 Main St, New York, NY 10001',
      services: ['Haircut & Styling', 'Hair Coloring', 'Makeup'],
      rating: 4.8,
      reviewCount: 124,
      image: '/placeholder-business.jpg'
    },
    {
      id: 2,
      name: 'Wellness Center',
      location: '456 Park Ave, New York, NY 10022',
      services: ['Massage Therapy', 'Spa Treatment', 'Body Treatment'],
      rating: 4.9,
      reviewCount: 98
    },
    {
      id: 3,
      name: 'Glamour Salon',
      location: '789 Broadway, New York, NY 10003',
      services: ['Nail Treatment', 'Manicure', 'Pedicure'],
      rating: 4.7,
      reviewCount: 156
    },
    {
      id: 4,
      name: 'Serenity Spa',
      location: '321 5th Ave, New York, NY 10016',
      services: ['Facial Treatment', 'Skin Care', 'Spa Treatment'],
      rating: 4.9,
      reviewCount: 203
    },
    {
      id: 5,
      name: 'Elite Hair Studio',
      location: '654 Madison Ave, New York, NY 10065',
      services: ['Haircut & Styling', 'Hair Coloring'],
      rating: 4.6,
      reviewCount: 87
    },
    {
      id: 6,
      name: 'Radiance Beauty Bar',
      location: '987 Lexington Ave, New York, NY 10021',
      services: ['Makeup', 'Waxing', 'Facial Treatment'],
      rating: 4.8,
      reviewCount: 142
    }
  ]

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
    // Filter logic will be handled by backend
    console.log('Applied filters:', selectedServices)
  }

  // Filter businesses based on search and selected services
  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         business.location.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesServices = selectedServices.length === 0 ||
                           selectedServices.some(service => business.services.includes(service))
    
    return matchesSearch && matchesServices
  })

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
            {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'business' : 'businesses'} found
          </div>

          {/* Business Cards Grid */}
          <div className={styles.businessGrid}>
            {filteredBusinesses.map(business => (
              <div key={business.id} className={styles.businessCard}>
                <div className={styles.cardContent}>
                  <h3 className={styles.businessName}>{business.name}</h3>
                  
                  <div className={styles.businessLocation}>
                    <svg className={styles.locationIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{business.location}</span>
                  </div>

                  <div className={styles.businessRating}>
                    <div className={styles.stars}>
                      {'★'.repeat(Math.floor(business.rating))}
                      {'☆'.repeat(5 - Math.floor(business.rating))}
                    </div>
                    <span className={styles.ratingText}>
                      {business.rating} ({business.reviewCount} reviews)
                    </span>
                  </div>

                  <div className={styles.servicesTags}>
                    {business.services.slice(0, 3).map(service => (
                      <span key={service} className={styles.serviceTag}>
                        {service}
                      </span>
                    ))}
                    {business.services.length > 3 && (
                      <span className={styles.serviceTag}>+{business.services.length - 3} more</span>
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
          {filteredBusinesses.length === 0 && (
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
                  Select one or more services to filter businesses
                </p>
                <div className={styles.servicesList}>
                  {availableServices.map(service => (
                    <label key={service} className={styles.serviceCheckbox}>
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service)}
                        onChange={() => toggleService(service)}
                      />
                      <span className={styles.checkboxLabel}>{service}</span>
                    </label>
                  ))}
                </div>
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
