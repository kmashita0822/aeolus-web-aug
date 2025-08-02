import React, { useState, useEffect, useCallback } from 'react'

interface GDACSEvent {
  eventid: string
  eventtype: string
  title: string
  subtitle?: string
  eventdate: string
  datestring: string
  alertlevel: string
}

interface DisasterAlert {
  id: string
  type: 'tc' | 'fl' | 'wf' | 'dr' | 'vo' | 'eq' | 'unknown'
  level: 'green' | 'orange' | 'red'
  title: string
  location: string
  time: string
  description: string
  eventId: string
  originalEvent: GDACSEvent
}

const DisasterAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<DisasterAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  // Touch device detection
  const isTouchDevice = 'ontouchstart' in window

  // API configuration
  const API_URL = 'https://www.gdacs.org/gdacsapi/api/events/geteventlist/homepagetable'
  const MAX_RETRIES = 3

  // Convert GDACS event type to internal type
  const convertEventType = (eventType: string): DisasterAlert['type'] => {
    const typeMap: Record<string, DisasterAlert['type']> = {
      'TC': 'tc',
      'FL': 'fl',
      'WF': 'wf',
      'DR': 'dr',
      'VO': 'vo',
      'EQ': 'eq'
    }
    return typeMap[eventType] || 'unknown'
  }

  // Convert alert level to internal format
  const convertAlertLevel = (level: string): DisasterAlert['level'] => {
    const levelMap: Record<string, DisasterAlert['level']> = {
      'Green': 'green',
      'Orange': 'orange',
      'Red': 'red'
    }
    return levelMap[level] || 'green'
  }

  // Format date string
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Unknown date'
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) + ', ' + date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } catch (error) {
      console.error('Date formatting error:', error)
      return dateString
    }
  }

  // Escape HTML to prevent XSS
  const escapeHtml = (text: string): string => {
    if (typeof text !== 'string') return ''
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  // Fetch events from GDACS API with retry logic
  const fetchEvents = useCallback(async (): Promise<GDACSEvent[]> => {
    let retryCount = 0
    
    while (retryCount < MAX_RETRIES) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
        const response = await fetch(API_URL, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'DisasterAlerts/1.0',
            'Cache-Control': 'no-cache'
          }
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        
        if (!data || !Array.isArray(data)) {
          throw new Error('Invalid data format received from API')
        }

        // Filter out events without essential data and exclude volcanoes and earthquakes
        const filteredEvents = data.filter((event: GDACSEvent) => {
          return event && event.eventtype && event.eventid && 
                 event.eventtype !== 'VO' && event.eventtype !== 'EQ'
        })

        console.log(`Loaded ${filteredEvents.length} disaster events (excluding volcanoes and earthquakes)`)
        return filteredEvents
        
      } catch (error) {
        retryCount++
        console.error(`Fetch attempt ${retryCount} failed:`, error)
        
        if (retryCount >= MAX_RETRIES) {
          // If all retries fail, return empty array instead of throwing
          console.warn('All API attempts failed, showing empty state')
          return []
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
      }
    }
    
    return []
  }, [])

  // Load alerts from API
  useEffect(() => {
    const loadAlerts = async () => {
      const startTime = performance.now()
      try {
        console.log('Loading disaster alerts from GDACS API...')
        setLoading(true)
        setError(null)
        
        const events = await fetchEvents()
        
        const loadTime = performance.now() - startTime
        console.log(`Successfully loaded ${events.length} events from API in ${loadTime.toFixed(2)}ms`)
        
        // Convert GDACS events to our internal format
        const convertedAlerts: DisasterAlert[] = events.map(event => ({
          id: event.eventid,
          type: convertEventType(event.eventtype),
          level: convertAlertLevel(event.alertlevel),
          title: event.title || 'No location available',
          location: event.title || 'Unknown location',
          time: formatDate(event.eventdate) || event.datestring || 'Unknown time',
          description: event.subtitle || 'No detailed description available.',
          eventId: event.eventid,
          originalEvent: event
        }))
        
        console.log(`Converted ${convertedAlerts.length} alerts to internal format`)
        console.log('Sample alert:', convertedAlerts[0])
        setAlerts(convertedAlerts)
        setLoading(false)
      } catch (err) {
        const errorTime = performance.now() - startTime
        console.error(`Failed to load alerts after ${errorTime.toFixed(2)}ms:`, err)
        setError('Failed to load disaster alerts. Please try again later.')
        setLoading(false)
      }
    }

    loadAlerts()
  }, [fetchEvents])

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsExpanded(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Handle click outside for touch devices
  useEffect(() => {
    if (!isTouchDevice) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element
      if (!target.closest('.modal-container')) {
        setIsExpanded(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isTouchDevice])

  // Debug logging
  useEffect(() => {
    console.log('Modal render state:', { isExpanded, isTouchDevice, alertsCount: alerts.length, loading, error })
  }, [isExpanded, isTouchDevice, alerts.length, loading, error])

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'tc': return 'TROPICAL CYCLONE'
      case 'fl': return 'FLOOD'
      case 'wf': return 'WILDFIRE'
      case 'dr': return 'DROUGHT'
      case 'vo': return 'VOLCANO'
      case 'eq': return 'EARTHQUAKE'
      default: return 'UNKNOWN'
    }
  }

  const handleModalClick = () => {
    if (isTouchDevice) {
      setIsExpanded(!isExpanded)
    }
  }

  const handleModalMouseEnter = () => {
    if (!isTouchDevice) {
      setIsExpanded(true)
    }
  }

  const handleModalMouseLeave = () => {
    if (!isTouchDevice) {
      setIsExpanded(false)
    }
  }

  const handleRetry = () => {
    setError(null)
    setLoading(true)
    // Trigger reload by updating a dependency
    window.location.reload()
  }

  return (
    <>
      <div 
        className={`modal-container ${isExpanded ? (isTouchDevice ? 'touch-active' : 'active') : ''}`} 
        onClick={handleModalClick}
        onMouseEnter={handleModalMouseEnter}
        onMouseLeave={handleModalMouseLeave}
        tabIndex={0} 
        role="button" 
        aria-label="Disaster alerts modal - hover or click to expand" 
        aria-expanded={isExpanded}
      >
        {/* PERSISTENT HEADER */}
        <div className="modal-header" tabIndex={0} role="button" aria-label="Modal header - click to expand">
          <div className="header-content">
            <div className="status-dot" aria-hidden="true"></div>
            <div className="header-title">Disaster Alerts</div>
          </div>
          <div className="event-count" aria-live="polite" aria-label="Number of active alerts">
            {alerts.length}
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="modal-content" role="region" aria-label="Disaster alerts list">
          <div className="content-area">
            {loading ? (
              <div className="loading-container" aria-live="polite" aria-label="Loading disaster alerts">
                <div className="loading-spinner" aria-hidden="true"></div>
                <div>Loading alerts...</div>
              </div>
            ) : error ? (
              <div className="error-state" aria-live="polite" aria-label="Error loading disaster alerts">
                <div className="error-icon">⚠️</div>
                <div className="error-title">Failed to Load</div>
                <div className="error-text">{error}</div>
                <button className="retry-btn" onClick={handleRetry} tabIndex={0}>
                  Try Again
                </button>
              </div>
            ) : alerts.length === 0 ? (
              <div className="empty-state" aria-live="polite" aria-label="No disaster alerts">
                <div className="empty-icon">🌤️</div>
                <div className="empty-title">No Active Disasters</div>
                <div className="empty-text">There are currently no active natural disaster alerts.</div>
              </div>
            ) : (
              <div className="events-list">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className="event-item" 
                    role="button" 
                    tabIndex={0}
                  >
                    {/* Left side - Main information */}
                    <div className="event-main-info">
                      <div className="event-name">{escapeHtml(alert.title)}</div>
                      <div className="event-disaster-type">{getTypeLabel(alert.type)}</div>
                    </div>
                    
                    {/* Right side - Timestamp */}
                    <div className="event-timestamp">
                      {alert.time}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default DisasterAlerts 