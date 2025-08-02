// Global variables
let events = [];
const API_URL = 'https://www.gdacs.org/gdacsapi/api/events/geteventlist/homepagetable';

// DOM elements
const modalContainer = document.getElementById('modalContainer');
const loadingState = document.getElementById('loadingState');
const buttonAlertCount = document.getElementById('buttonAlertCount');
const detailModal = document.getElementById('detailModal');
const videoBackground = document.querySelector('.hero-video');
const logo = document.querySelector('.hero-logo');

// Touch device detection
const isTouchDevice = 'ontouchstart' in window;

// Performance monitoring
let performanceObserver;
if ('PerformanceObserver' in window) {
  performanceObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'navigation') {
        console.log('Page load time:', entry.loadEventEnd - entry.loadEventStart, 'ms');
      }
    }
  });
  performanceObserver.observe({ entryTypes: ['navigation'] });
}

// Error tracking
function logError(error, context = '') {
  console.error(`[${context}] Error:`, error);
  // In production, you might want to send this to an error tracking service
  // Example: Sentry.captureException(error);
}

// Initialize video background
function initVideoBackground() {
  if (videoBackground) {
    try {
      // Set video quality settings
      videoBackground.setAttribute('playsinline', '');
      videoBackground.setAttribute('webkit-playsinline', '');
      videoBackground.setAttribute('x-webkit-airplay', 'allow');
      
      // Quality optimization
      videoBackground.style.objectFit = 'cover';
      videoBackground.style.objectPosition = 'center';
      
      // Ensure high quality playback
      videoBackground.addEventListener('loadedmetadata', () => {
        console.log('Video metadata loaded');
        // Set video quality preferences
        if (videoBackground.videoWidth > 0) {
          console.log(`Video resolution: ${videoBackground.videoWidth}x${videoBackground.videoHeight}`);
        }
      });

      videoBackground.addEventListener('loadeddata', () => {
        console.log('Video background loaded successfully');
        // Ensure video is playing at full quality
        videoBackground.playbackRate = 1.0;
      });
      
      videoBackground.addEventListener('error', (e) => {
        logError(e, 'Video Background');
        // Fallback to a solid background if video fails
        document.body.style.background = 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)';
      });

      // Ensure video plays at high quality
      videoBackground.play().catch(e => {
        console.log('Video autoplay prevented, will play on user interaction');
      });

      // Monitor video quality
      videoBackground.addEventListener('canplay', () => {
        // Ensure we're getting the best quality
        if (videoBackground.readyState >= 4) {
          console.log('Video playing at high quality');
        }
      });

      // Quality monitoring function
      function monitorVideoQuality() {
        if (videoBackground && !videoBackground.paused) {
          // Check if video is playing at optimal quality
          if (videoBackground.readyState < 4) {
            console.log('Video quality may be degraded, attempting to improve...');
            // Force a quality refresh
            videoBackground.load();
          }
        }
      }

      // Monitor quality every 10 seconds
      setInterval(monitorVideoQuality, 10000);
    } catch (error) {
      logError(error, 'Video Background Init');
      // Fallback background
      document.body.style.background = 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)';
    }
  }
}

// Event type mapping
const eventTypeMap = {
  'TC': 'Tropical Cyclone',
  'FL': 'Flood',
  'WF': 'Wildfire',
  'DR': 'Drought'
};

// Alert level mapping
const alertLevelMap = {
  'Green': 'Informational',
  'Orange': 'Moderate Alert',
  'Red': 'High Alert'
};

/**
 * Initialize the application
 */
async function init() {
  try {
    console.log('Initializing Disaster Alerts application...');
    initVideoBackground();
    await fetchEvents();
    renderEvents();
    setupTouchSupport();
    setupKeyboardNavigation();
    console.log('Application initialized successfully');
  } catch (error) {
    logError(error, 'Application Init');
    showError('Failed to load disaster alerts. Please try again later.');
  }
}

/**
 * Setup touch device support
 */
function setupTouchSupport() {
  if (isTouchDevice) {
    modalContainer.addEventListener('click', function() {
      this.classList.toggle('touch-active');
      updateAriaExpanded(this);
    });
    
    // Close when clicking outside
    document.addEventListener('click', function(e) {
      if (!modalContainer.contains(e.target) && !detailModal.contains(e.target)) {
        modalContainer.classList.remove('touch-active');
        updateAriaExpanded(modalContainer);
      }
    });
  }
}

/**
 * Setup keyboard navigation
 */
function setupKeyboardNavigation() {
  // Logo keyboard support
  if (logo) {
    logo.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // Add logo click functionality here if needed
        console.log('Logo clicked via keyboard');
      }
    });
  }

  // Modal container keyboard support
  modalContainer.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isTouchDevice) {
        modalContainer.classList.toggle('touch-active');
        updateAriaExpanded(modalContainer);
      }
    }
  });

  // Detail modal close button
  const detailCloseBtn = document.querySelector('.detail-close-btn');
  if (detailCloseBtn) {
    detailCloseBtn.addEventListener('click', closeDetailModal);
    detailCloseBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        closeDetailModal();
      }
    });
  }
}

/**
 * Update aria-expanded attribute
 */
function updateAriaExpanded(element) {
  const isExpanded = element.classList.contains('touch-active') || 
                    (element === modalContainer && !isTouchDevice);
  element.setAttribute('aria-expanded', isExpanded.toString());
}

/**
 * Close detail modal
 */
function closeDetailModal() {
  detailModal.classList.remove('active');
  // Return focus to the modal container
  modalContainer.focus();
}

/**
 * Fetch events from GDACS API with retry logic
 */
async function fetchEvents() {
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(API_URL, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'DisasterAlerts/1.0',
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data format received from API');
      }

      events = data.filter(event => {
        // Filter out events without essential data and exclude volcanoes and earthquakes
        return event && event.eventtype && event.eventid && event.eventtype !== 'VO' && event.eventtype !== 'EQ';
      });

      console.log(`Loaded ${events.length} disaster events (excluding volcanoes and earthquakes)`);
      return; // Success, exit retry loop
      
    } catch (error) {
      retryCount++;
      logError(error, `Fetch Attempt ${retryCount}`);
      
      if (retryCount >= maxRetries) {
        throw new Error(`Failed to fetch data after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    }
  }
}

/**
 * Render the events list
 */
function renderEvents() {
  const contentArea = document.querySelector('.content-area');
  
  if (events.length === 0) {
    contentArea.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🌤️</div>
        <div class="empty-title">No Active Disasters</div>
        <div class="empty-text">There are currently no active natural disaster alerts.</div>
      </div>
    `;
    buttonAlertCount.textContent = '0';
    return;
  }

  const eventsHTML = events.map(event => createEventItem(event)).join('');
  
  contentArea.innerHTML = `
    <div class="events-list">
      ${eventsHTML}
    </div>
  `;

  // Add click event listeners to items
  document.querySelectorAll('.event-item').forEach((item, index) => {
    item.addEventListener('click', () => openDetailModal(events[index]));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openDetailModal(events[index]);
      }
    });
    // Make items focusable
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
  });

  // Update alert count
  buttonAlertCount.textContent = events.length;
}

/**
 * Create an event item HTML
 */
function createEventItem(event) {
  const eventType = event.eventtype || 'Unknown';
  const title = event.title || 'No location available';
  const time = formatDate(event.eventdate) || event.datestring || 'Unknown time';
  const location = event.title || 'Unknown location';
  const disasterType = eventTypeMap[eventType] || eventType;

  return `
    <div class="event-item" role="button" tabindex="0" aria-label="View details for ${escapeHtml(location)}">
      <div class="event-title">${escapeHtml(location)}</div>
      <div class="event-details">
        <div class="event-location-type">
          <span class="disaster-type">${disasterType}</span>
        </div>
        <div class="event-time">
          <span>${time}</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Open detail modal
 */
function openDetailModal(event) {
  try {
    const detailTitle = document.getElementById('detailTitle');
    const detailMeta = document.getElementById('detailMeta');
    const detailDescription = document.getElementById('detailDescription');
    const detailInfo = document.getElementById('detailInfo');

    // Set title
    detailTitle.textContent = event.title || 'No title available';

    // Create meta information
    const eventType = event.eventtype || 'Unknown';
    const alertLevel = event.alertlevel || 'Green';

    detailMeta.innerHTML = `
      <span class="event-type ${eventType.toLowerCase()}">${eventTypeMap[eventType] || eventType}</span>
      <span class="alert-level ${alertLevel.toLowerCase()}">${alertLevelMap[alertLevel] || alertLevel}</span>
    `;

    // Set description
    detailDescription.innerHTML = event.subtitle ? 
      `<p>${escapeHtml(event.subtitle)}</p>` : 
      '<p>No detailed description available.</p>';

    // Create info section
    const info = [];
    
    if (event.eventid) {
      info.push({ label: 'Event ID', value: event.eventid });
    }
    
    if (event.eventtype) {
      info.push({ label: 'Type', value: eventTypeMap[event.eventtype] || event.eventtype });
    }
    
    if (event.eventdate) {
      info.push({ label: 'Date', value: formatDate(event.eventdate) });
    }
    
    if (event.datestring) {
      info.push({ label: 'Time', value: event.datestring });
    }
    
    if (event.alertlevel) {
      info.push({ label: 'Alert Level', value: alertLevelMap[event.alertlevel] || event.alertlevel });
    }

    detailInfo.innerHTML = info.map(item => `
      <div class="info-item">
        <span class="info-label">${item.label}:</span>
        <span class="info-value">${item.value}</span>
      </div>
    `).join('');

    // Show detail modal
    detailModal.classList.add('active');
    
    // Focus the close button for keyboard navigation
    const detailCloseBtn = document.querySelector('.detail-close-btn');
    if (detailCloseBtn) {
      setTimeout(() => detailCloseBtn.focus(), 100);
    }
  } catch (error) {
    logError(error, 'Open Detail Modal');
    showError('Failed to open event details. Please try again.');
  }
}

/**
 * Show error message
 */
function showError(message) {
  const contentArea = document.querySelector('.content-area');
  contentArea.innerHTML = `
    <div class="error-state">
      <div class="error-icon">⚠️</div>
      <div class="error-title">Error Loading Data</div>
      <div class="error-text">${escapeHtml(message)}</div>
      <button class="retry-btn" onclick="location.reload()" tabindex="0">Try Again</button>
    </div>
  `;
  buttonAlertCount.textContent = '0';
}

/**
 * Format date string
 */
function formatDate(dateString) {
  if (!dateString) return 'Unknown date';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ', ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    logError(error, 'Date Formatting');
    return dateString;
  }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Event listeners
detailModal.addEventListener('click', (e) => {
  if (e.target === detailModal) {
    closeDetailModal();
  }
});

// Close modals on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (detailModal.classList.contains('active')) {
      closeDetailModal();
    }
    if (isTouchDevice && modalContainer.classList.contains('touch-active')) {
      modalContainer.classList.remove('touch-active');
      updateAriaExpanded(modalContainer);
    }
  }
});

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Handle page visibility changes for performance
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Page is hidden, pause video if needed
    if (videoBackground && !videoBackground.paused) {
      videoBackground.pause();
    }
  } else {
    // Page is visible, resume video if needed
    if (videoBackground && videoBackground.paused) {
      videoBackground.play().catch(e => console.log('Video resume failed'));
    }
  }
}); 