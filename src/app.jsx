    const { useState, useEffect, useMemo, useRef } = React;

    // ============================================
    // CONFIGURATION
    // ============================================

    const EVENTS_JSON_URL = './events.json';
    const USE_SAMPLE_DATA = false;
    const MIN_YEAR = 2026;
    const MIN_MONTH = 0;
    const KOFI_URL = 'https://ko-fi.com/kaluuja';
    const FEEDBACK_FORM_URL = 'https://forms.gle/62psP8V9JF88Kdnz8';

    const SAMPLE_EVENTS = [
      { date: '2026-01-25', title: 'The BLANK who BLANKED me', venue: 'Bristol Improv Theatre', time: '19:00-20:00', type: 'show', url: '#' },
      { date: '2026-01-28', title: 'Lily Maryon', venue: 'Bristol Improv Theatre', time: '19:30-21:30', type: 'show', url: '#' },
      { date: '2026-01-28', title: 'Biscuit Barrel', venue: 'Bristol Improv Theatre', time: '14:00-15:00', type: 'show', url: '#' },
      { date: '2026-01-28', title: 'Luke McQueen', venue: 'Bristol Improv Theatre', time: '21:00-22:00', type: 'show', url: '#' },
      { date: '2026-01-28', title: 'Open Jam Night', venue: 'Hen & Chicken', time: '19:30-21:30', type: 'jam', url: '#' },
      { date: '2026-01-30', title: 'Belltower', venue: 'Bristol Improv Theatre', time: '19:30-21:30', type: 'show', url: '#' },
      { date: '2026-01-31', title: 'Antics Joke Show', venue: 'Bristol Improv Theatre', time: '19:30-21:30', type: 'show', url: '#' },
      { date: '2026-02-05', title: 'Live in da Hive', venue: 'PRSC', time: '19:00-22:30', type: 'show', url: '#' },
      { date: '2026-02-06', title: 'The Bish Bosh Bash', venue: 'Bristol Improv Theatre', time: '19:30-21:30', type: 'show', url: '#' },
      { date: '2026-02-11', title: 'Wednesday Night Improv', venue: 'Hen & Chicken', time: '19:30-21:30', type: 'show', url: '#' },
      { date: '2026-02-14', title: 'From HELL YEAH! with love', venue: 'Bristol Improv Theatre', time: '19:30-21:30', type: 'show', url: '#' },
      { date: '2026-02-25', title: 'Tales From The Wasteland', venue: 'Hen & Chicken', time: '19:30-22:00', type: 'show', url: '#' },
    ];

    // Close an open modal when Escape is pressed
    const useEscapeToClose = (isOpen, onClose) => {
      useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
      }, [isOpen, onClose]);
    };

    // ============================================
    // ROADMAP MODAL
    // ============================================

    const RoadmapModal = ({ isOpen, onClose, colors }) => {
      useEscapeToClose(isOpen, onClose);
      if (!isOpen) return null;

      const RoadmapItem = ({ done, children }) => (
        <li style={{
          marginBottom: '0.6rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.6rem'
        }}>
          <span style={{
            flexShrink: 0,
            width: '22px',
            height: '22px',
            borderRadius: '5px',
            background: done ? colors.sage : 'transparent',
            border: done ? 'none' : `2px solid ${colors.textMuted}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            color: 'white',
            marginTop: '1px'
          }}>
            {done && '✓'}
          </span>
          <span style={{
            textDecoration: done ? 'line-through' : 'none',
            color: done ? colors.textMuted : colors.text,
            fontSize: '0.9rem',
            lineHeight: 1.4
          }}>
            {children}
          </span>
        </li>
      );

      return (
        <div className="modal-overlay" onClick={onClose}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🗺️ Roadmap</h2>
              <button className="modal-close" onClick={onClose}>✕</button>
            </div>
            <div className="modal-body">
              <p className="roadmap-intro">
                This calendar is a work in progress! Here's what's been done and what's coming next.
              </p>

              <div className="roadmap-section">
                <h3>⚡ Core Functionality</h3>
                <ul>
                  <RoadmapItem done={true}>Add filters and search</RoadmapItem>
                  <RoadmapItem done={true}>'Swipe' between months on mobile</RoadmapItem>
                  <RoadmapItem done={true}>Shows, workshops, drop-ins, jams added</RoadmapItem>
                  <RoadmapItem done={true}>Calendar feed you can subscribe to</RoadmapItem>
                  <RoadmapItem done={true}>Add to calendar and share for each event</RoadmapItem>
                  <RoadmapItem done={false}>Email newsletter for weekly updates</RoadmapItem>
                </ul>
              </div>

              <div className="roadmap-section">
                <h3>🎭 Events</h3>
                <ul>
                  <RoadmapItem done={true}>Added 15 venues</RoadmapItem>
                  <RoadmapItem done={true}>Added additional ticket websites</RoadmapItem>
                </ul>
              </div>

              <div className="roadmap-section">
                <h3>🎨 Design & Experience</h3>
                <ul>
                  <RoadmapItem done={true}>Event type colour-coding</RoadmapItem>
                  <RoadmapItem done={true}>Event type icons for colour-blind</RoadmapItem>
                  <RoadmapItem done={true}>Dark mode</RoadmapItem>
                  <RoadmapItem done={true}>List view option</RoadmapItem>
                  <RoadmapItem done={false}>Save favourite events</RoadmapItem>
                </ul>
              </div>

              <div className="roadmap-section">
                <h3>🔮 Future Ideas</h3>
                <ul>
                  <RoadmapItem done={false}>Improv type tags? (shortform, longform, musical, narrative, etc.)</RoadmapItem>
                  <RoadmapItem done={false}>Performer and group profiles/socials</RoadmapItem>
                  <RoadmapItem done={false}>User accounts and personalisation</RoadmapItem>
                  <RoadmapItem done={false}>Event reminders/New events added</RoadmapItem>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    };

    // ============================================
    // SETTINGS MODAL
    // ============================================

    const SettingsModal = ({ isOpen, onClose, colors, darkMode, setDarkMode, viewMode, setViewMode, onOpenRoadmap, lastUpdated, formatLastUpdated }) => {
      useEscapeToClose(isOpen, onClose);
      if (!isOpen) return null;

      return (
        <div className="modal-overlay" onClick={onClose}>
          <div className="modal-content settings-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚙️ Settings</h2>
              <button className="modal-close" onClick={onClose}>✕</button>
            </div>
            <div className="modal-body">

              {/* Dark Mode Toggle */}
              <div className="settings-section">
                <div className="settings-row">
                  <div className="settings-label">
                    <span className="settings-icon">{darkMode ? '🌙' : '☀️'}</span>
                    <span>{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
                  </div>
                  <button
                    className={`toggle-btn ${darkMode ? 'active' : ''}`}
                    onClick={() => setDarkMode(!darkMode)}
                    aria-label="Toggle dark mode"
                  >
                    <span className="toggle-slider"></span>
                  </button>
                </div>
              </div>

              {/* View Mode Selector */}
              <div className="settings-section">
                <div className="settings-row">
                  <div className="settings-label">
                    <span className="settings-icon">📅</span>
                    <span>View</span>
                  </div>
                  <div className="view-toggle">
                    <button
                      className={`view-toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                      onClick={() => setViewMode('calendar')}
                      data-goatcounter-click="view-toggle-calendar"
                    >
                      📅 Calendar
                    </button>
                    <button
                      className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => setViewMode('list')}
                      data-goatcounter-click="view-toggle-list"
                    >
                      📋 List
                    </button>
                  </div>
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="settings-section settings-signup">
                <div className="signup-box">
                  <div className="signup-header">📰 Get the newsletter</div>
                  <p className="signup-text">What's on in Bristol improv, straight to your inbox. No spam, unsubscribe any time.</p>
                  <form
                    action="https://buttondown.com/api/emails/embed-subscribe/Kaluuja"
                    method="post"
                    target="popupwindow"
                    onSubmit={() => { window.open('https://buttondown.com/Kaluuja', 'popupwindow'); }}
                    className="signup-form"
                  >
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="you@example.com"
                      aria-label="Email address"
                      className="signup-input"
                    />
                    <button type="submit" className="signup-btn" data-goatcounter-click="newsletter-signup">
                      Subscribe
                    </button>
                  </form>
                </div>
              </div>

              {/* Roadmap Link */}
              <div className="settings-section">
                <button
                  className="settings-link-btn"
                  onClick={() => { onClose(); onOpenRoadmap(); }}
                >
                  <span className="settings-icon">🗺️</span>
                  <span>View Roadmap</span>
                  <span className="settings-arrow">→</span>
                </button>
              </div>

              {/* Bristol Improv Hub Link */}
              <div className="settings-section">
                <a
                  href="https://www.technicallyimprov.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="settings-link-btn"
                  style={{ textDecoration: 'none' }}
                >
                  <span className="settings-icon">🎭</span>
                  <span>Bristol Improv Hub</span>
                  <span className="settings-arrow">→</span>
                </a>
              </div>

              {/* Feature Request */}
              <div className="settings-section">
                <a
                  href={FEEDBACK_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="settings-link-btn"
                  style={{ textDecoration: 'none' }}
                >
                  <span className="settings-icon">💡</span>
                  <span>Submit an idea</span>
                  <span className="settings-arrow">→</span>
                </a>
              </div>

              {/* Last Updated */}
              {lastUpdated && (
                <div className="settings-footer">
                  <span className="settings-updated">Calendar last updated: {formatLastUpdated(lastUpdated)}</span>
                </div>
              )}

            </div>
          </div>
        </div>
      );
    };

    // ============================================
    // MAIN COMPONENT
    // ============================================

    const BristolImprovCalendar = () => {
      const [selectedDate, setSelectedDate] = useState(null);
      const [venueFilter, setVenueFilter] = useState('all');
      const [typeFilter, setTypeFilter] = useState('all');
      const [searchQuery, setSearchQuery] = useState('');
      const [showSearchResults, setShowSearchResults] = useState(false);
      const [events, setEvents] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [showRoadmap, setShowRoadmap] = useState(false);
      const [showSettings, setShowSettings] = useState(false);
      const [darkMode, setDarkMode] = useState(() => {
        // Dark (Tilt navy) by default; a saved choice wins. New key from Nov 2026,
        // so earlier saved settings don't override the new default.
        try { return localStorage.getItem('bristolImprovTheme') !== 'light'; } catch { return true; }
      });
      const [viewMode, setViewModeRaw] = useState(() => {
        // A saved choice wins; otherwise the list on phones and the month on bigger screens
        try {
          const saved = localStorage.getItem('bristolImprovView');
          if (saved === 'list' || saved === 'calendar') return saved;
        } catch {}
        return (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 768px)').matches) ? 'list' : 'calendar';
      });
      const setViewMode = (v) => {
        setViewModeRaw(v);
        try { localStorage.setItem('bristolImprovView', v); } catch {}
      };
      // BIT closure notice (Oct 2026), hidden once dismissed. Bump the key's
      // version when the wording changes so it shows again.
      const BIT_NOTICE_KEY = 'bristolImprovBitNoticeHidden-v2';
      const [bitNoticeHidden, setBitNoticeHidden] = useState(() => {
        try { return localStorage.getItem(BIT_NOTICE_KEY) === 'true'; } catch { return false; }
      });
      const hideBitNotice = () => {
        setBitNoticeHidden(true);
        try { localStorage.setItem(BIT_NOTICE_KEY, 'true'); } catch {}
      };
      const [lastUpdated, setLastUpdated] = useState(null);
      const [viewYear, setViewYear] = useState(new Date().getFullYear());
      const [viewMonth, setViewMonth] = useState(new Date().getMonth());

      const controlsRef = useRef(null);
      const calendarRef = useRef(null);
      const touchStartX = useRef(null);
      const touchStartY = useRef(null);

      // Save dark mode preference
      useEffect(() => {
        try { localStorage.setItem('bristolImprovTheme', darkMode ? 'dark' : 'light'); } catch {}
      }, [darkMode]);


      // Light and dark mode color schemes
      const lightColors = {
        cream: '#FAF8F3',
        terracotta: '#F2542D',
        navy: '#0E1734',
        sage: '#1F9D74',
        sand: '#F2B705',
        bg: '#FAF8F3',
        cardBg: '#FFFFFF',
        text: '#0E1734',
        textMuted: '#4A5470',
        border: '#E1E4EC',
      };

      // Tilt navy. Dark is the default, to match tiltimprov.co.uk.
      const darkColors = {
        cream: '#18234A',
        terracotta: '#F2542D',
        navy: '#F4F1EA',
        sage: '#1F9D74',
        sand: '#F2B705',
        bg: '#0E1734',
        cardBg: '#18234A',
        text: '#F4F1EA',
        textMuted: '#AEB6CC',
        border: '#2A3560',
      };

      const colors = darkMode ? darkColors : lightColors;

      // Normalize event type to handle variations like 'drop-in', 'Drop-in', 'dropin', etc.
      const normalizeEventType = (type) => {
        if (!type) return 'show';
        const t = type.toLowerCase().replace(/[-_\s]/g, '');
        if (t === 'dropin' || t === 'dropins') return 'dropin';
        if (t === 'workshop' || t === 'workshops' || t === 'class' || t === 'classes') return 'workshop';
        if (t === 'jam' || t === 'jams') return 'jam';
        if (t === 'show' || t === 'shows') return 'show';
        return 'show'; // default
      };

      // Event type styles with colors and emoji circles for dropdown
      const eventTypeStyles = {
        'show': { color: colors.terracotta, label: 'Shows', icon: '🎭', dot: '🔴' },
        'workshop': { color: colors.sage, label: 'Workshops', icon: '📚', dot: '🟢' },
        'jam': { color: colors.sand, label: 'Jams', icon: '🎲', dot: '🟡' },
        'dropin': { color: darkMode ? '#C9D0E3' : '#0E1734', label: 'Drop-ins', icon: '🚪', dot: '🟣' },
      };

      const venueStyles = {
        'Bristol Improv Theatre': { color: colors.terracotta, bg: `${colors.terracotta}18`, group: 'Bristol Improv Theatre', order: 1 },
        'Hen & Chicken': { color: colors.sand, bg: `${colors.sand}25`, group: 'Hen & Chicken', order: 2 },
        'Hen & Chicken (Chicken Shed)': { color: colors.sand, bg: `${colors.sand}25`, group: 'Hen & Chicken', order: 2 },
        'Hen & Chicken (Studio)': { color: colors.sand, bg: `${colors.sand}25`, group: 'Hen & Chicken', order: 2 },
        'PRSC': { color: colors.sage, bg: `${colors.sage}20`, group: 'PRSC', order: 3 },
        'SPACE at PRSC': { color: colors.sage, bg: `${colors.sage}20`, group: 'PRSC', order: 3 },
        'Wardrobe Theatre': { color: '#7B68A6', bg: '#7B68A618', group: 'Wardrobe Theatre', order: 4 },
        'Bristol Old Vic': { color: '#4A6FA5', bg: '#4A6FA518', group: 'Bristol Old Vic', order: 5 },
        'Tobacco Factory': { color: '#8B6F47', bg: '#8B6F4715', group: 'Other', order: 6 },
        'Bristol Beacon': { color: '#C4A35A', bg: '#C4A35A15', group: 'Other', order: 6 },
        // Outside Bristol - worth the trip, so grouped apart rather than hidden in "Other"
        'Mission Theatre (Bath)': { color: '#5E8B7E', bg: '#5E8B7E18', group: 'Further afield', order: 7 },
      };

      // Venue groups for filter dropdown (in display order)
      const venueGroups = [
        { key: 'Bristol Improv Theatre', label: 'Bristol Improv Theatre' },
        { key: 'Hen & Chicken', label: 'Hen & Chicken' },
        { key: 'PRSC', label: 'PRSC' },
        { key: 'Wardrobe Theatre', label: 'Wardrobe Theatre' },
        { key: 'Bristol Old Vic', label: 'Bristol Old Vic' },
        { key: 'Other', label: 'Other' },
        { key: 'Further afield', label: 'Further afield' },
      ];

      const isEveningEvent = (timeStr) => {
        if (!timeStr) return true;
        const match = timeStr.match(/^(\d{1,2}):?(\d{2})?/);
        if (match) {
          const hour = parseInt(match[1], 10);
          return hour >= 17;
        }
        return true;
      };

      // Parse time string to get start and end times in minutes from midnight
      const parseEventTimes = (timeStr) => {
        if (!timeStr) return null;
        // Handle formats like "19:00-21:00" (with an en dash or a hyphen), "7pm - 9pm", "19:00"
        const timeRange = timeStr.replace(/\s/g, '').split(/[\u2013\u2014-]/);

        const parseTime = (t) => {
          if (!t) return null;
          // Handle "7pm", "19:00", "7:30pm" formats
          const pmMatch = t.toLowerCase().includes('pm');
          const amMatch = t.toLowerCase().includes('am');
          const cleaned = t.replace(/[apm]/gi, '');
          const parts = cleaned.split(':');
          let hour = parseInt(parts[0], 10);
          const mins = parts[1] ? parseInt(parts[1], 10) : 0;

          if (pmMatch && hour < 12) hour += 12;
          if (amMatch && hour === 12) hour = 0;

          return hour * 60 + mins;
        };

        const start = parseTime(timeRange[0]);
        const end = timeRange[1] ? parseTime(timeRange[1]) : (start ? start + 120 : null); // Default 2 hour duration

        return start !== null ? { start, end } : null;
      };

      // Check if two events overlap in time
      const eventsOverlap = (event1, event2) => {
        const times1 = parseEventTimes(event1.time);
        const times2 = parseEventTimes(event2.time);

        if (!times1 || !times2) return false; // Can't determine, assume no overlap

        // Events overlap if one starts before the other ends
        return times1.start < times2.end && times2.start < times1.end;
      };

      // Check if any events in a list have overlapping times
      const hasOverlappingEvents = (eventsList) => {
        if (eventsList.length < 2) return false;

        for (let i = 0; i < eventsList.length; i++) {
          for (let j = i + 1; j < eventsList.length; j++) {
            if (eventsOverlap(eventsList[i], eventsList[j])) {
              return true;
            }
          }
        }
        return false;
      };

      const fetchEvents = async () => {
        if (USE_SAMPLE_DATA) {
          setTimeout(() => { setEvents(SAMPLE_EVENTS); setLoading(false); }, 300);
          return;
        }
        try {
          setLoading(true);
          setError(null);
          const response = await fetch(EVENTS_JSON_URL + `?t=${Date.now()}`);
          if (!response.ok) throw new Error(`Failed: ${response.status}`);
          const data = await response.json();
          let eventsData = data.events || data.record?.events || data;
          setEvents(Array.isArray(eventsData) ? eventsData : []);
          setLastUpdated(data.lastUpdated || data.record?.lastUpdated);
        } catch (err) {
          setEvents([]);
          setError("Couldn't load the events just now.");
        } finally {
          setLoading(false);
        }
      };

      useEffect(() => {
        fetchEvents();
      }, []);

      useEffect(() => {
        const handleClick = (e) => {
          if (controlsRef.current && !controlsRef.current.contains(e.target)) {
            setShowSearchResults(false);
          }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
      }, []);

      const today = new Date();
      const todayYear = today.getFullYear();
      const todayMonth = today.getMonth();
      const todayDate = today.getDate();

      const maxEventDate = useMemo(() => {
        if (events.length === 0) return { year: todayYear, month: todayMonth };
        let maxY = MIN_YEAR, maxM = MIN_MONTH;
        events.forEach(e => {
          const d = new Date(e.date);
          if (d.getFullYear() > maxY || (d.getFullYear() === maxY && d.getMonth() > maxM)) {
            maxY = d.getFullYear();
            maxM = d.getMonth();
          }
        });
        return { year: maxY, month: maxM };
      }, [events]);

      // Dynamic: allow navigating back to the previous month, no further
      const prevMonthYear = todayMonth === 0 ? todayYear - 1 : todayYear;
      const prevMonthIdx = todayMonth === 0 ? 11 : todayMonth - 1;
      const canGoBack = viewYear > prevMonthYear || (viewYear === prevMonthYear && viewMonth > prevMonthIdx);
      const canGoForward = viewYear < maxEventDate.year || (viewYear === maxEventDate.year && viewMonth < maxEventDate.month);
      const isCurrentMonth = viewYear === todayYear && viewMonth === todayMonth;

      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
      const firstDay = new Date(viewYear, viewMonth, 1).getDay();
      const startDay = firstDay === 0 ? 6 : firstDay - 1;

      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

      const goToPrevMonth = () => {
        if (!canGoBack) return;
        setSelectedDate(null);
        setViewMonth(viewMonth === 0 ? 11 : viewMonth - 1);
        setViewYear(viewMonth === 0 ? viewYear - 1 : viewYear);
      };

      const goToNextMonth = () => {
        if (!canGoForward) return;
        setSelectedDate(null);
        setViewMonth(viewMonth === 11 ? 0 : viewMonth + 1);
        setViewYear(viewMonth === 11 ? viewYear + 1 : viewYear);
      };

      const goToToday = () => {
        setSelectedDate(null);
        setViewYear(todayYear);
        setViewMonth(todayMonth);
      };

      // Touch handlers for swipe navigation on mobile
      const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
      };

      const handleTouchEnd = (e) => {
        if (touchStartX.current === null || touchStartY.current === null) return;

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        const deltaX = touchEndX - touchStartX.current;
        const deltaY = touchEndY - touchStartY.current;

        // Only trigger swipe if horizontal movement is greater than vertical
        // and the swipe is at least 50px
        const minSwipeDistance = 50;
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0) {
            // Swiped right - go to previous month
            goToPrevMonth();
          } else {
            // Swiped left - go to next month
            goToNextMonth();
          }
        }

        touchStartX.current = null;
        touchStartY.current = null;
      };

      const getVenueGroup = (venue) => {
        const style = venueStyles[venue];
        if (style) return style.group;
        // Check if venue starts with known prefixes
        if (venue.startsWith('Hen & Chicken')) return 'Hen & Chicken';
        if (venue.includes('PRSC')) return 'PRSC';
        // Everything else is 'Other'
        return 'Other';
      };

      const getVenueInfo = (venue) => venueStyles[venue] ||
        { color: colors.navy, bg: `${colors.navy}15`, group: 'Other' };

      const getEventsForDate = (date) => {
        return events.filter(e => {
          const d = new Date(e.date);
          if (d.getMonth() !== viewMonth || d.getFullYear() !== viewYear || d.getDate() !== date) return false;
          const group = getVenueGroup(e.venue);
          const matchVenue = venueFilter === 'all' || group === venueFilter;

          const normalizedType = normalizeEventType(e.type);

          let matchType = true;
          if (typeFilter === 'daytime') {
            matchType = !isEveningEvent(e.time);
          } else if (typeFilter === 'evening') {
            matchType = isEveningEvent(e.time);
          } else if (typeFilter !== 'all') {
            matchType = normalizedType === typeFilter;
          }

          return matchVenue && matchType;
        });
      };

      // Get event type counts for a date (for dot display)
      const getEventTypeCounts = (date) => {
        const dateEvents = getEventsForDate(date);
        const counts = {};
        dateEvents.forEach(e => {
          const type = normalizeEventType(e.type);
          counts[type] = (counts[type] || 0) + 1;
        });
        return counts;
      };

      const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return events.filter(e =>
          e.title.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          (e.description?.toLowerCase().includes(q))
        ).slice(0, 8);
      }, [searchQuery, events]);

      // Get all events with filters applied (for list view)
      const getAllFilteredEvents = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        return events.filter(e => {
          const eventDate = new Date(e.date);
          eventDate.setHours(0, 0, 0, 0);

          // Only show future events (from today onwards)
          if (eventDate < now) return false;

          const group = getVenueGroup(e.venue);
          const matchVenue = venueFilter === 'all' || group === venueFilter;

          const normalizedType = normalizeEventType(e.type);

          let matchType = true;
          if (typeFilter === 'daytime') {
            matchType = !isEveningEvent(e.time);
          } else if (typeFilter === 'evening') {
            matchType = isEveningEvent(e.time);
          } else if (typeFilter !== 'all') {
            matchType = normalizedType === typeFilter;
          }

          return matchVenue && matchType;
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
      }, [events, venueFilter, typeFilter]);

      // Group filtered events by date for list view
      const groupedEvents = useMemo(() => {
        const groups = {};
        getAllFilteredEvents.forEach(e => {
          const dateKey = e.date;
          if (!groups[dateKey]) {
            groups[dateKey] = [];
          }
          groups[dateKey].push(e);
        });
        return groups;
      }, [getAllFilteredEvents]);

      const handleSearchSelect = (event) => {
        const d = new Date(event.date);

        // Check if selected event matches current filters
        const normalizedType = normalizeEventType(event.type);
        const venueGroup = getVenueGroup(event.venue);
        const isEvening = isEveningEvent(event.time);

        // Check if event matches type filter
        let matchesTypeFilter = typeFilter === 'all';
        if (typeFilter === 'daytime') {
          matchesTypeFilter = !isEvening;
        } else if (typeFilter === 'evening') {
          matchesTypeFilter = isEvening;
        } else if (typeFilter !== 'all') {
          matchesTypeFilter = normalizedType === typeFilter;
        }

        // Check if event matches venue filter
        const matchesVenueFilter = venueFilter === 'all' || venueGroup === venueFilter;

        // Reset filters if event doesn't match
        if (!matchesTypeFilter) {
          setTypeFilter('all');
        }
        if (!matchesVenueFilter) {
          setVenueFilter('all');
        }

        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
        setSelectedDate(d.getDate());
        setSearchQuery('');
        setShowSearchResults(false);
      };

      // Get active types using normalized types
      const activeVenueGroups = useMemo(() => {
        const s = new Set();
        events.forEach(e => s.add(getVenueGroup(e.venue)));
        return s;
      }, [events]);

      const activeTypes = useMemo(() => {
        const s = new Set();
        events.forEach(e => {
          const normalizedType = normalizeEventType(e.type);
          s.add(normalizedType);
        });
        return s;
      }, [events]);

      const hasDaytimeEvents = useMemo(() => events.some(e => !isEveningEvent(e.time)), [events]);
      const hasEveningEvents = useMemo(() => events.some(e => isEveningEvent(e.time)), [events]);

      const formatLastUpdated = (str) => {
        if (!str) return null;
        const d = new Date(str);
        const mins = Math.floor((new Date() - d) / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      };

      const formatEventDate = (str) => {
        const d = new Date(str);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      };

      const getDayName = (date) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(viewYear, viewMonth, date).getDay()];

      const getShortTitle = (title, maxLen = 16) => {
        const short = title.replace(/^The\s+/i, '').replace(/[:|].*$/, '').trim();
        return short.length > maxLen ? short.substring(0, maxLen - 1) + '…' : short;
      };

      const weeksNeeded = Math.ceil((startDay + daysInMonth) / 7);

      // Get event type counts for a specific time period (daytime or evening)
      const getEventTypeCountsByTime = (dateEvents, isEvening) => {
        const counts = {};
        dateEvents.forEach(e => {
          const eventIsEvening = isEveningEvent(e.time);
          if (eventIsEvening === isEvening) {
            const type = normalizeEventType(e.type);
            counts[type] = (counts[type] || 0) + 1;
          }
        });
        return counts;
      };

      // Render event type shapes from counts
      const renderEventShapes = (typeCounts) => {
        const typeOrder = ['show', 'workshop', 'jam', 'dropin'];
        const shapes = [];

        typeOrder.forEach(type => {
          if (typeCounts[type]) {
            const count = typeCounts[type];
            const style = eventTypeStyles[type] || { color: colors.navy };
            shapes.push({
              type,
              count,
              color: style.color
            });
          }
        });

        // Max 4 shapes
        return shapes.slice(0, 4);
      };

      // Render a single shape for mobile
      const renderMobileShape = (shape, index) => {
        const { type, count, color } = shape;

        switch (type) {
          case 'show':
            return (
              <div key={index} className="mobile-shape-wrap">
                <div className="mobile-circle" style={{ background: color }}>
                  {count > 1 && <span className="shape-count">{count}</span>}
                </div>
              </div>
            );
          case 'workshop':
            return (
              <div key={index} className="mobile-shape-wrap">
                <div className="mobile-square" style={{ background: color }}>
                  {count > 1 && <span className="shape-count">{count}</span>}
                </div>
              </div>
            );
          case 'jam':
            return (
              <div key={index} className="mobile-shape-wrap">
                <div className="mobile-diamond" style={{ background: color }}>
                  <span>{count > 1 ? <span className="shape-count">{count}</span> : ''}</span>
                </div>
              </div>
            );
          case 'dropin':
            return (
              <div key={index} className="mobile-triangle-wrap">
                <div className="mobile-triangle" style={{ background: color }}></div>
                {count > 1 && <span className="mobile-triangle-num">{count}</span>}
              </div>
            );
          default:
            return (
              <div key={index} className="mobile-shape-wrap">
                <div className="mobile-circle" style={{ background: color }}>
                  {count > 1 && <span className="shape-count">{count}</span>}
                </div>
              </div>
            );
        }
      };

      // Kept from the old stylesheet: loading, modals, settings, roadmap
      const legacyCss = `
            /* LOADING */
            .loading {
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 0.75rem;
              color: ${colors.textMuted};
            }
            .spinner {
              width: 40px;
              height: 40px;
              border: 4px solid ${colors.border};
              border-top-color: ${colors.terracotta};
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
            
            /* MODAL */
            .modal-overlay {
              position: fixed;
              inset: 0;
              background: rgba(0,0,0,0.75);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
              padding: 1rem;
            }
            .modal-content {
              background: ${colors.cardBg};
              border-radius: 14px;
              max-width: 540px;
              width: 100%;
              max-height: 90vh;
              overflow: hidden;
              display: flex;
              flex-direction: column;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            .modal-header {
              background: ${darkMode ? '#070D22' : colors.navy};
              color: ${darkMode ? '#F4F1EA' : colors.cream};
              padding: 1rem 1.25rem;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .modal-header h2 { font-size: 1.2rem; margin: 0; }
            .modal-close { background: none; border: none; color: ${darkMode ? '#F4F1EA' : colors.cream}; font-size: 1.2rem; cursor: pointer; opacity: 0.7; }
            .modal-close:hover { opacity: 1; }
            .modal-body { padding: 1.25rem; overflow-y: auto; flex: 1; }
            .roadmap-intro { font-size: 0.9rem; color: ${colors.textMuted}; margin-bottom: 1.25rem; line-height: 1.5; }
            .roadmap-section { margin-bottom: 1.5rem; }
            .roadmap-section h3 { font-size: 1rem; font-weight: 700; margin-bottom: 0.6rem; padding-bottom: 0.4rem; border-bottom: 2px solid ${colors.border}; color: ${colors.text}; }
            .roadmap-section ul { list-style: none; }
            .roadmap-cta { background: ${colors.cream}; border-radius: 10px; padding: 1rem; text-align: center; margin-top: 0.5rem; }
            .roadmap-cta p { font-size: 0.9rem; font-weight: 600; margin-bottom: 0.6rem; }
            .roadmap-cta .cta-note { font-size: 0.75rem; color: ${colors.textMuted}; margin-top: 0.5rem; margin-bottom: 0; }
            .cta-button { display: inline-block; background: ${colors.terracotta}; color: white; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.85rem; font-weight: 700; text-decoration: none; }
            .cta-button:hover { transform: scale(1.03); }
            
            /* Settings Modal */
            .settings-modal { max-width: 380px; }
            .settings-section {
              padding: 0.75rem 0;
              border-bottom: 1px solid ${colors.border};
            }
            .settings-section:last-of-type { border-bottom: none; }
            .settings-row {
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .settings-label {
              display: flex;
              align-items: center;
              gap: 0.6rem;
              font-size: 0.95rem;
              font-weight: 600;
              color: ${colors.text};
            }
            .settings-icon { font-size: 1.1rem; }
            
            /* Toggle Button */
            .toggle-btn {
              width: 52px;
              height: 28px;
              background: ${darkMode ? '#2A3560' : colors.navy + '30'};
              border: none;
              border-radius: 14px;
              cursor: pointer;
              position: relative;
              transition: background 0.2s;
            }
            .toggle-btn.active { background: ${colors.sage}; }
            .toggle-slider {
              position: absolute;
              top: 3px;
              left: 3px;
              width: 22px;
              height: 22px;
              background: white;
              border-radius: 50%;
              transition: transform 0.2s;
              box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            }
            .toggle-btn.active .toggle-slider { transform: translateX(24px); }
            
            /* View Mode Toggle */
            .view-toggle {
              display: flex;
              gap: 0.25rem;
              background: ${colors.border};
              border-radius: 8px;
              padding: 3px;
            }
            .view-toggle-btn {
              padding: 0.4rem 0.7rem;
              font-size: 0.8rem;
              font-weight: 600;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              background: transparent;
              color: ${colors.textMuted};
              transition: all 0.15s;
            }
            .view-toggle-btn.active {
              background: ${colors.cardBg};
              color: ${colors.text};
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .view-toggle-btn:hover:not(.active) {
              color: ${colors.text};
            }
            
            /* Settings Link Button */
            .settings-link-btn {
              width: 100%;
              display: flex;
              align-items: center;
              gap: 0.6rem;
              padding: 0.6rem 0.5rem;
              background: transparent;
              border: none;
              font-size: 0.95rem;
              font-weight: 600;
              color: ${colors.text};
              cursor: pointer;
              border-radius: 8px;
              transition: background 0.15s;
            }
            .settings-link-btn:hover { background: ${colors.cream}; }
            .settings-arrow { margin-left: auto; color: ${colors.textMuted}; }
            
            /* Settings Signup Box */
            .settings-signup {
              padding-top: 0.5rem !important;
            }
            .signup-box {
              background: ${colors.sage}15;
              border: 1.5px solid ${colors.sage}40;
              border-radius: 10px;
              padding: 1rem;
              text-align: center;
            }
            .signup-header {
              font-size: 0.95rem;
              font-weight: 700;
              color: ${colors.text};
              margin-bottom: 0.35rem;
            }
            .signup-text {
              font-size: 0.8rem;
              color: ${colors.textMuted};
              margin-bottom: 0.75rem;
              line-height: 1.4;
            }
            .signup-form {
              display: flex;
              gap: 0.5rem;
              justify-content: center;
              flex-wrap: wrap;
            }
            .signup-input {
              flex: 1;
              min-width: 160px;
              padding: 0.5rem 0.75rem;
              border-radius: 6px;
              border: 1.5px solid ${colors.sage}40;
              background: ${colors.cardBg};
              color: ${colors.text};
              font-size: 0.85rem;
              font-family: inherit;
            }
            .signup-btn {
              display: inline-block;
              background: ${colors.sage};
              color: white;
              padding: 0.5rem 1.2rem;
              border-radius: 6px;
              border: none;
              font-size: 0.85rem;
              font-weight: 700;
              font-family: inherit;
              text-decoration: none;
              cursor: pointer;
              transition: transform 0.15s, opacity 0.15s;
            }
            .signup-btn:hover { transform: scale(1.03); opacity: 0.9; }
            
            /* Settings Footer */
            .settings-footer {
              padding-top: 1rem;
              margin-top: 0.5rem;
              border-top: 1px solid ${colors.border};
              text-align: center;
            }
            .settings-updated {
              font-size: 0.75rem;
              color: ${colors.textMuted};
            }
            
      `;

      // ============================================
      // LAYOUT (Nov 2026): Tilt look, list first on phones,
      // event pop-up, month view that fits one screen
      // ============================================
      const [selectedEvent, setSelectedEvent] = useState(null);
      const [selectedDay, setSelectedDay] = useState(null);
      const [showFilters, setShowFilters] = useState(false);
      const [showSubscribe, setShowSubscribe] = useState(false);
      const [whenFilter, setWhenFilter] = useState('any');
      const [typeSet, setTypeSet] = useState([]); // empty means everything
      const [calOpen, setCalOpen] = useState(false);
      const [copied, setCopied] = useState('');
      const [isPhone, setIsPhone] = useState(() =>
        typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 768px)').matches);

      useEffect(() => {
        if (!window.matchMedia) return;
        const mq = window.matchMedia('(max-width: 768px)');
        const onChange = () => setIsPhone(mq.matches);
        if (mq.addEventListener) mq.addEventListener('change', onChange); else mq.addListener(onChange);
        return () => { if (mq.removeEventListener) mq.removeEventListener('change', onChange); else mq.removeListener(onChange); };
      }, []);

      // Changing month clears the picked day
      useEffect(() => { setSelectedDay(null); }, [viewYear, viewMonth]);

      const pad = (n) => String(n).padStart(2, '0');
      const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const parseKey = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
      const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
      const todayKey = keyOf(new Date());
      const tomorrowKey = keyOf(addDays(new Date(), 1));
      const startTime = (t) => (t || '').split(/[\u2013\u2014-]/)[0].trim();
      const niceTime = (t) => (t || '').replace(/\s*[\u2013\u2014-]\s*/, ' to ');
      // No long dashes in what we show: organisers' titles get a colon instead
      const cleanTitle = (s) => (s || '').replace(/\s+[\u2013\u2014]\s+/g, ': ').replace(/[\u2013\u2014]/g, '-');
      const typeOf = (e) => normalizeEventType(e.type);
      const slug = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
      const idOf = (e) => `${e.date}-${slug(e.title)}`;

      const TYPE_ORDER = ['show', 'workshop', 'jam', 'dropin'];
      const TYPE_LABEL = { show: 'Show', workshop: 'Class', jam: 'Jam', dropin: 'Drop-in' };
      const TYPE_PLURAL = { show: 'Shows', workshop: 'Classes', jam: 'Jams', dropin: 'Drop-ins' };
      const WHEN = [
        ['any', 'Any day'], ['today', 'Today'], ['tomorrow', 'Tomorrow'],
        ['weekend', 'This weekend'], ['next2', 'Next 2 weeks'],
      ];
      const whenLabel = (WHEN.find(w => w[0] === whenFilter) || WHEN[0])[1];

      const shape = (type, size = 10) => (
        <span
          className={`shape shape-${type}`}
          style={{ width: size, height: size, background: (eventTypeStyles[type] || eventTypeStyles.show).color }}
          aria-hidden="true"
        ></span>
      );

      const whenRange = useMemo(() => {
        const t0 = new Date(); t0.setHours(0, 0, 0, 0);
        if (whenFilter === 'today') return [keyOf(t0), keyOf(t0)];
        if (whenFilter === 'tomorrow') return [keyOf(addDays(t0, 1)), keyOf(addDays(t0, 1))];
        if (whenFilter === 'weekend') {
          const dow = t0.getDay(); // 0 is Sunday
          const fri = dow === 0 ? addDays(t0, -2) : dow === 6 ? addDays(t0, -1) : addDays(t0, 5 - dow);
          return [keyOf(fri < t0 ? t0 : fri), keyOf(addDays(fri, 2))];
        }
        if (whenFilter === 'next2') return [keyOf(t0), keyOf(addDays(t0, 13))];
        return null;
      }, [whenFilter]);

      const filtered = useMemo(() => events.filter(e => {
        if (venueFilter !== 'all' && getVenueGroup(e.venue) !== venueFilter) return false;
        if (typeSet.length && !typeSet.includes(typeOf(e))) return false;
        if (whenRange && (e.date < whenRange[0] || e.date > whenRange[1])) return false;
        return true;
      }).sort((a, b) => (a.date + startTime(a.time)).localeCompare(b.date + startTime(b.time))),
      [events, venueFilter, typeSet, whenRange]);

      const upcoming = useMemo(() => filtered.filter(e => e.date >= todayKey), [filtered, todayKey]);

      const byDate = useMemo(() => {
        const m = {};
        filtered.forEach(e => { (m[e.date] = m[e.date] || []).push(e); });
        return m;
      }, [filtered]);

      const filtersActive = whenFilter !== 'any' || typeSet.length > 0 || venueFilter !== 'all';
      const clearFilters = () => { setWhenFilter('any'); setTypeSet([]); setVenueFilter('all'); };
      const toggleType = (t) => setTypeSet(typeSet.includes(t) ? typeSet.filter(x => x !== t) : [...typeSet, t]);
      const typeButtonLabel = typeSet.length === 0 ? 'All types' : typeSet.length === 1 ? TYPE_PLURAL[typeSet[0]] : `${typeSet.length} types`;
      const venueButtonLabel = venueFilter === 'all' ? 'All venues' : (venueGroups.find(v => v.key === venueFilter) || {}).label || venueFilter;

      // Day labels: "Today", "Tomorrow", "Friday", then "Sat 5 Dec"
      const dayLabel = (k) => {
        if (k === todayKey) return 'Today';
        if (k === tomorrowKey) return 'Tomorrow';
        const d = parseKey(k);
        const diff = Math.round((d - parseKey(todayKey)) / 86400000);
        if (diff > 1 && diff < 7) return d.toLocaleDateString('en-GB', { weekday: 'long' });
        return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
      };
      const shortDate = (k) => parseKey(k).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
      const longDate = (k) => parseKey(k).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
      const dayNumMonth = (k) => parseKey(k).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

      const updatedText = (() => {
        if (!lastUpdated) return '';
        const d = new Date(lastUpdated);
        if (keyOf(d) === todayKey) return 'Updated today';
        if (keyOf(addDays(d, 1)) === todayKey) return 'Updated yesterday';
        return `Updated ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
      })();

      // ---------- Event pop-up, deep links, calendar and sharing ----------
      const openEvent = (e) => {
        setSelectedEvent(e); setCalOpen(false); setCopied(''); setShowSearchResults(false); setSearchQuery('');
        try { history.replaceState(null, '', '#event=' + idOf(e)); } catch {}
      };
      const closeEvent = () => {
        setSelectedEvent(null);
        try { history.replaceState(null, '', location.pathname + location.search); } catch {}
      };
      useEscapeToClose(!!selectedEvent, closeEvent);
      useEscapeToClose(showFilters, () => setShowFilters(false));
      useEscapeToClose(showSubscribe, () => setShowSubscribe(false));

      useEffect(() => {
        if (!events.length) return;
        const m = location.hash.match(/^#event=(.+)$/);
        if (!m) return;
        const e = events.find(x => idOf(x) === decodeURIComponent(m[1]));
        if (e) setSelectedEvent(e);
      }, [events]);

      const eventTimes = (e) => {
        const [s, en] = (e.time || '').split(/[\u2013\u2014-]/).map(x => x && x.trim());
        const day = e.date.replace(/-/g, '');
        const hm = (x) => (x && /^\d{1,2}:\d{2}$/.test(x) ? x.replace(':', '').padStart(4, '0') + '00' : null);
        const st = hm(s) || '190000';
        let et = hm(en);
        if (!et || et <= st) et = pad(Math.min(23, parseInt(st.slice(0, 2), 10) + 2)) + st.slice(2);
        return { start: `${day}T${st}`, end: `${day}T${et}` };
      };

      const googleUrl = (e) => {
        const t = eventTimes(e);
        const p = new URLSearchParams({
          action: 'TEMPLATE', text: cleanTitle(e.title), dates: `${t.start}/${t.end}`,
          ctz: 'Europe/London', location: e.venue, details: e.url || '',
        });
        return 'https://calendar.google.com/calendar/render?' + p.toString();
      };

      const icsEsc = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
      const downloadIcs = (e) => {
        const t = eventTimes(e);
        const lines = [
          'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bristol Improv Calendar//EN', 'CALSCALE:GREGORIAN',
          'BEGIN:VTIMEZONE', 'TZID:Europe/London',
          'BEGIN:DAYLIGHT', 'TZOFFSETFROM:+0000', 'TZOFFSETTO:+0100', 'TZNAME:BST', 'DTSTART:19700329T010000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU', 'END:DAYLIGHT',
          'BEGIN:STANDARD', 'TZOFFSETFROM:+0100', 'TZOFFSETTO:+0000', 'TZNAME:GMT', 'DTSTART:19701025T020000', 'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU', 'END:STANDARD',
          'END:VTIMEZONE',
          'BEGIN:VEVENT',
          `UID:${idOf(e)}@bristol-improv-calendar`,
          'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, ''),
          `DTSTART;TZID=Europe/London:${t.start}`,
          `DTEND;TZID=Europe/London:${t.end}`,
          'SUMMARY:' + icsEsc(cleanTitle(e.title)),
          'LOCATION:' + icsEsc(e.venue),
          ...(e.url ? ['URL:' + e.url, 'DESCRIPTION:' + icsEsc('Tickets and details: ' + e.url)] : []),
          'END:VEVENT', 'END:VCALENDAR',
        ];
        const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = idOf(e) + '.ics';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      };

      const pageBase = typeof location !== 'undefined' ? location.origin + location.pathname : '';
      const feedUrl = pageBase.replace(/[^/]*$/, '') + 'events.ics';
      const webcalUrl = feedUrl.replace(/^https?:/, 'webcal:');
      const googleSubscribeUrl = 'https://calendar.google.com/calendar/render?cid=' + encodeURIComponent(webcalUrl);

      const copyText = async (text, what) => {
        try { await navigator.clipboard.writeText(text); setCopied(what); } catch { setCopied('fail'); }
      };
      const shareEvent = async (e) => {
        const url = pageBase + '#event=' + idOf(e);
        const text = `${cleanTitle(e.title)}, ${longDate(e.date)}, ${startTime(e.time)} at ${e.venue}`;
        if (navigator.share) {
          try { await navigator.share({ title: cleanTitle(e.title), text, url }); } catch {}
          return;
        }
        copyText(url, 'event');
      };

      // ---------- Search (upcoming only; picking a result opens it) ----------
      const searchHits = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return [];
        return events.filter(e => e.date >= todayKey && (
          e.title.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q) ||
          (e.description || '').toLowerCase().includes(q)
        )).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8);
      }, [searchQuery, events, todayKey]);

      // ---------- Icons ----------
      const svg = (children, size = 18) => (
        <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
      );
      const iconCal = svg(<><rect x="3" y="4" width="18" height="17" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="16" y1="2" x2="16" y2="6"></line></>, 20);
      const iconCalPlus = svg(<><rect x="3" y="4" width="18" height="17" rx="2"></rect><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></>);
      const iconList = svg(<><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><circle cx="4" cy="6" r="1"></circle><circle cx="4" cy="12" r="1"></circle><circle cx="4" cy="18" r="1"></circle></>, 20);
      const iconMenu = svg(<><line x1="4" y1="7" x2="20" y2="7"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="17" x2="20" y2="17"></line></>, 20);
      const iconSearch = svg(<><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.5" y2="16.5"></line></>, 16);
      const iconDown = svg(<polyline points="6 9 12 15 18 9"></polyline>, 14);
      const iconLeft = svg(<polyline points="15 6 9 12 15 18"></polyline>);
      const iconRight = svg(<polyline points="9 6 15 12 9 18"></polyline>);
      const iconX = svg(<><line x1="6" y1="6" x2="18" y2="18"></line><line x1="18" y1="6" x2="6" y2="18"></line></>);
      const iconPin = svg(<><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"></path><circle cx="12" cy="9.5" r="2.5"></circle></>, 20);
      const iconShare = svg(<><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"></line><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"></line></>);
      const iconExt = svg(<><path d="M7 17L17 7"></path><polyline points="8 7 17 7 17 16"></polyline></>, 16);

      // ---------- Pieces ----------
      const searchBox = (
        <div className="search" ref={controlsRef}>
          <label className="search-field">
            {iconSearch}
            <span className="vh">Search shows, groups or venues</span>
            <input
              type="search"
              placeholder={isPhone ? 'Search shows, groups, venues' : 'Search'}
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowSearchResults(true); }}
              onFocus={() => setShowSearchResults(true)}
            />
          </label>
          {showSearchResults && searchQuery.trim() && (
            <div className="search-results">
              {searchHits.length === 0 ? (
                <div className="search-none">Nothing coming up matches that.</div>
              ) : searchHits.map((e, i) => (
                <button key={i} className="search-item" onClick={() => openEvent(e)}>
                  <span className="search-title">{cleanTitle(e.title)}</span>
                  <span className="search-meta">{shortDate(e.date)}, {startTime(e.time)} · {e.venue}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      );

      const monthNav = (
        <div className="monthnav">
          <button className="ghost-btn" onClick={goToToday} disabled={isCurrentMonth}>Today</button>
          <button className="icon-btn plain" onClick={goToPrevMonth} disabled={!canGoBack} aria-label="Previous month">{iconLeft}</button>
          <button className="icon-btn plain" onClick={goToNextMonth} disabled={!canGoForward} aria-label="Next month">{iconRight}</button>
          <span className="month-title">{monthNames[viewMonth]} {viewYear}</span>
        </div>
      );

      const bitLine = !bitNoticeHidden && (
        <div className="bit-line">
          <span>
            The Bristol Improv Theatre closed in October.{' '}
            <a href="https://buttondown.com/Kaluuja" target="_blank" rel="noopener noreferrer" data-goatcounter-click="bit-notice-roundup">Read the roundup</a>
            {' · '}
            <a href="https://improvtheatre.co.uk/" target="_blank" rel="noopener noreferrer" data-goatcounter-click="bit-notice-statement">BIT statement</a>
          </span>
          <button className="bit-x" onClick={hideBitNotice} aria-label="Dismiss notice">{iconX}</button>
        </div>
      );

      const tiltMark = <span className="tilt-mark" aria-hidden="true">tilt</span>;
      const footerLinks = (
        <>
          Missing a show? Got a correction?{' '}
          <a href={FEEDBACK_FORM_URL} target="_blank" rel="noopener noreferrer">Let us know</a>
          {' · '}
          <a href={KOFI_URL} target="_blank" rel="noopener noreferrer">Buy Ste a brew</a>
          {' · '}
          <a href="https://www.technicallyimprov.com/" target="_blank" rel="noopener noreferrer">Technically Improv</a>
        </>
      );
      const tiltCredit = (
        <span>A <a href="https://tiltimprov.co.uk/bristol/" target="_blank" rel="noopener noreferrer">Tilt Improv</a> project, for all of Bristol improv.</span>
      );
      const siteFooter = (
        <footer className="site-foot">
          <div className="foot-tilt">{tiltMark}{tiltCredit}</div>
          <div>{footerLinks}</div>
        </footer>
      );

      // One event as a row (side panel) or a card (list view)
      const eventRow = (e, i, showDay) => {
        const t = typeOf(e);
        return (
          <button key={i} className="row" onClick={() => openEvent(e)}>
            <span className="row-when">
              {showDay && <span className="row-day">{dayLabel(e.date) === 'Today' || dayLabel(e.date) === 'Tomorrow' ? dayLabel(e.date) : shortDate(e.date).replace(/ \w+$/, '')}</span>}
              <span className="row-time">{startTime(e.time)}</span>
            </span>
            <span className="row-main">
              <span className="row-title">{cleanTitle(e.title)}</span>
              <span className="row-meta">{shape(t, 9)}{TYPE_LABEL[t]} · {e.venue}</span>
            </span>
          </button>
        );
      };
      const eventCard = (e, i) => {
        const t = typeOf(e);
        return (
          <button key={i} className="card" onClick={() => openEvent(e)}>
            <span className="card-when">
              <span className="card-time">{startTime(e.time)}</span>
              <span className="card-type">{shape(t, 10)}{TYPE_LABEL[t]}</span>
            </span>
            <span className="card-main">
              <span className="card-title">{cleanTitle(e.title)}</span>
              <span className="card-venue">{e.venue}</span>
            </span>
            <span className="chev">{iconRight}</span>
          </button>
        );
      };

      const subscribeButton = (
        <button className="btn-outline wide" onClick={() => { setCopied(''); setShowSubscribe(true); }} data-goatcounter-click="subscribe-open">
          {iconCalPlus} Put all of this in your calendar
        </button>
      );

      // ---------- Views ----------
      const renderList = () => {
        const groups = [];
        upcoming.forEach(e => {
          const last = groups[groups.length - 1];
          if (last && last.key === e.date) last.items.push(e); else groups.push({ key: e.date, items: [e] });
        });
        return (
          <main className="list">
            {groups.length === 0 ? (
              <div className="empty">
                <p>Nothing coming up matches those filters.</p>
                {filtersActive && <button className="btn-outline" onClick={clearFilters}>Clear filters</button>}
              </div>
            ) : (
              <>
                {whenFilter === 'any' && groups[0].key !== todayKey && (
                  <p className="list-note">Nothing on today. Next up {dayLabel(groups[0].key).toLowerCase() === 'tomorrow' ? 'tomorrow' : dayLabel(groups[0].key)}.</p>
                )}
                {groups.map(g => {
                  const label = dayLabel(g.key);
                  const showSub = label === 'Today' || label === 'Tomorrow' || !/\d/.test(label);
                  return (
                    <section key={g.key} className="day-group">
                      <h2>{label}{showSub && <small>{label === 'Today' || label === 'Tomorrow' ? shortDate(g.key) : dayNumMonth(g.key)}</small>}</h2>
                      {g.items.map(eventCard)}
                    </section>
                  );
                })}
              </>
            )}
            {subscribeButton}
          </main>
        );
      };

      const sidePanel = () => {
        let title, items, showDay = true;
        if (selectedDay) {
          title = longDate(selectedDay);
          items = byDate[selectedDay] || [];
          showDay = false;
        } else if (whenFilter !== 'any') {
          title = whenLabel;
          items = upcoming.slice(0, 30);
        } else {
          const weekEnd = keyOf(addDays(new Date(), 6));
          items = upcoming.filter(e => e.date <= weekEnd);
          title = 'Coming up this week';
          if (items.length < 3) { items = upcoming.slice(0, 8); title = 'Coming up'; }
        }
        return (
          <aside className="side">
            <h2>{title}</h2>
            {selectedDay && <button className="linkish" onClick={() => setSelectedDay(null)}>Back to what's coming up</button>}
            <div className="side-list">
              {items.length === 0
                ? <p className="side-empty">{selectedDay ? 'Nothing listed that day.' : 'Nothing listed yet.'}</p>
                : items.map((e, i) => eventRow(e, i, showDay))}
            </div>
            {!isPhone && (
              <div className="side-foot">
                <button className="btn-light block" onClick={() => { setCopied(''); setShowSubscribe(true); }} data-goatcounter-click="subscribe-open">{iconCalPlus} Add to your calendar</button>
                <div className="foot-tilt small">{tiltMark}{tiltCredit}</div>
                <div>{footerLinks}</div>
              </div>
            )}
          </aside>
        );
      };

      const renderCalendar = () => {
        const first = new Date(viewYear, viewMonth, 1);
        const lead = (first.getDay() + 6) % 7;
        const start = addDays(first, -lead);
        const total = Math.ceil((lead + daysInMonth) / 7) * 7;
        const weeks = total / 7;
        const MAX = 3;
        const cells = [];
        for (let i = 0; i < total; i++) {
          const d = addDays(start, i);
          const k = keyOf(d);
          const list = byDate[k] || [];
          const other = d.getMonth() !== viewMonth;
          const isToday = k === todayKey;
          const past = k < todayKey;
          const shown = list.length > MAX ? list.slice(0, MAX - 1) : list;
          const typesHere = TYPE_ORDER.filter(t => list.some(e => typeOf(e) === t));
          cells.push(
            <div
              key={k}
              className={`cell${other ? ' other' : ''}${isToday ? ' today' : ''}${past ? ' past' : ''}${selectedDay === k ? ' picked' : ''}`}
              onClick={() => setSelectedDay(selectedDay === k ? null : k)}
            >
              <button
                className="num"
                aria-label={`${longDate(k)}${list.length ? `, ${list.length} listed` : ''}`}
                onClick={(ev) => { ev.stopPropagation(); setSelectedDay(selectedDay === k ? null : k); }}
              >
                {other && d.getDate() === 1 ? `1 ${monthShort[d.getMonth()]}` : d.getDate()}
              </button>
              {shown.map((e, j) => (
                <button key={j} className="evchip" onClick={(ev) => { ev.stopPropagation(); openEvent(e); }}>
                  {shape(typeOf(e), 9)}
                  <span className="txt"><strong>{startTime(e.time)}</strong> {cleanTitle(e.title)}</span>
                </button>
              ))}
              {list.length > shown.length && <span className="more">+{list.length - shown.length} more</span>}
              {list.length > 0 && (
                <span className="cell-shapes" aria-hidden="true">
                  {typesHere.map(t => <span key={t} className="cell-shape">{shape(t, 9)}</span>)}
                  {list.length > 1 && <span className="cell-count">{list.length}</span>}
                </span>
              )}
            </div>
          );
        }
        return (
          <div className="cal-main">
            <section className="cal-wrap" aria-label={`${monthNames[viewMonth]} ${viewYear}`}>
              {isPhone && <div className="phone-monthnav">{monthNav}</div>}
              <div className="dow-row">{dayNames.map(d => <div key={d} className="dow">{d}</div>)}</div>
              <div
                className="grid"
                style={{ gridTemplateRows: `repeat(${weeks}, minmax(0, 1fr))` }}
                ref={calendarRef}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {cells}
              </div>
            </section>
            {sidePanel()}
          </div>
        );
      };

      // ---------- Overlays ----------
      const eventSheet = () => {
        const e = selectedEvent;
        if (!e) return null;
        const t = typeOf(e);
        const key = cleanTitle(e.title).trim().toLowerCase();
        const also = events.filter(x => x !== e && x.date >= todayKey && cleanTitle(x.title).trim().toLowerCase() === key).slice(0, 3);
        const mapUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(e.venue + (/bath/i.test(e.venue) ? '' : ', Bristol'));
        return (
          <div className="sheet-overlay" onClick={closeEvent}>
            <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" onClick={ev => ev.stopPropagation()}>
              <div className={`sheet-hero${e.image ? ' has-img' : ''}`} style={e.image ? { backgroundImage: `url("${e.image}")` } : undefined}>
                <span className="sheet-handle" aria-hidden="true"></span>
                <button className="sheet-close" aria-label="Close" onClick={closeEvent}>{iconX}</button>
              </div>
              <div className="sheet-body">
                <span className="type-pill">{shape(t, 11)}{TYPE_LABEL[t]}</span>
                <h2 id="sheet-title">{cleanTitle(e.title)}</h2>
                <ul className="facts">
                  <li>{iconCal}<span><strong>{longDate(e.date)}</strong>{e.time ? `, ${niceTime(e.time)}` : ''}</span></li>
                  <li>{iconPin}<span>{e.venue} <a href={mapUrl} target="_blank" rel="noopener noreferrer">Map</a></span></li>
                </ul>
                {e.description && <p className="sheet-desc">{cleanTitle(e.description).slice(0, 320)}{e.description.length > 320 ? '…' : ''}</p>}
                {e.url && (
                  <a className="btn-primary" href={e.url} target="_blank" rel="noopener noreferrer" data-goatcounter-click="ticket-link">
                    Tickets and details {iconExt}
                  </a>
                )}
                <div className="sheet-actions">
                  <button className="btn-outline" onClick={() => setCalOpen(!calOpen)} aria-expanded={calOpen} data-goatcounter-click="event-add-to-calendar">
                    {iconCalPlus} Add to calendar
                  </button>
                  <button className="btn-outline" onClick={() => shareEvent(e)} data-goatcounter-click="event-share">
                    {iconShare} {copied === 'event' ? 'Link copied' : 'Send to a friend'}
                  </button>
                </div>
                {calOpen && (
                  <div className="cal-choices">
                    <a className="btn-outline" href={googleUrl(e)} target="_blank" rel="noopener noreferrer">Google Calendar</a>
                    <button className="btn-outline" onClick={() => downloadIcs(e)}>Apple, Outlook or other</button>
                  </div>
                )}
                {also.length > 0 && (
                  <div className="also">
                    <span className="also-label">Also on</span>
                    {also.map((x, i) => (
                      <button key={i} onClick={() => openEvent(x)}>{shortDate(x.date)}, {startTime(x.time)}, {x.venue}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      };

      const filterSheet = () => {
        if (!showFilters) return null;
        return (
          <div className="sheet-overlay" onClick={() => setShowFilters(false)}>
            <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="filter-title" onClick={ev => ev.stopPropagation()}>
              <div className="fsheet">
                <span className="sheet-handle static" aria-hidden="true"></span>
                <div className="fsheet-top">
                  <h2 id="filter-title">Filter</h2>
                  <button className="linkish" onClick={clearFilters}>Clear all</button>
                </div>
                <fieldset>
                  <legend>When</legend>
                  <div className="wrap-chips">
                    {WHEN.map(([k, label]) => (
                      <button key={k} className="chip" aria-pressed={whenFilter === k} onClick={() => setWhenFilter(k)}>{label}</button>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend>What</legend>
                  <div className="type-grid">
                    {TYPE_ORDER.map(t => (
                      <label key={t} className="type-check">
                        <input type="checkbox" checked={typeSet.length === 0 || typeSet.includes(t)} onChange={() => {
                          if (typeSet.length === 0) setTypeSet(TYPE_ORDER.filter(x => x !== t));
                          else {
                            const next = typeSet.includes(t) ? typeSet.filter(x => x !== t) : [...typeSet, t];
                            setTypeSet(next.length === TYPE_ORDER.length ? [] : next);
                          }
                        }} />
                        {shape(t, 11)}{TYPE_PLURAL[t]}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label className="where">
                  Where
                  <select value={venueFilter} onChange={ev => setVenueFilter(ev.target.value)}>
                    <option value="all">All venues</option>
                    {venueGroups.map(({ key, label }) => (
                      <option key={key} value={key} disabled={!activeVenueGroups.has(key)}>{label}</option>
                    ))}
                  </select>
                </label>
                <button className="btn-primary" onClick={() => setShowFilters(false)}>
                  {upcoming.length === 1 ? 'Show 1 event' : `Show ${upcoming.length} events`}
                </button>
              </div>
            </div>
          </div>
        );
      };

      const subscribeSheet = () => {
        if (!showSubscribe) return null;
        return (
          <div className="sheet-overlay" onClick={() => setShowSubscribe(false)}>
            <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sub-title" onClick={ev => ev.stopPropagation()}>
              <div className="fsheet">
                <span className="sheet-handle static" aria-hidden="true"></span>
                <div className="fsheet-top">
                  <h2 id="sub-title">Add to your calendar</h2>
                  <button className="icon-btn plain dark" aria-label="Close" onClick={() => setShowSubscribe(false)}>{iconX}</button>
                </div>
                <p className="sub-text">Every listing here, in your own calendar app. It keeps itself up to date, though some apps only check for new listings once a day or so.</p>
                <a className="btn-primary" href={googleSubscribeUrl} target="_blank" rel="noopener noreferrer" data-goatcounter-click="subscribe-google">Google Calendar</a>
                <a className="btn-outline wide" href={webcalUrl} data-goatcounter-click="subscribe-webcal">Apple Calendar or Outlook</a>
                <button className="btn-outline wide" onClick={() => copyText(feedUrl, 'feed')} data-goatcounter-click="subscribe-copy">
                  {copied === 'feed' ? 'Link copied' : 'Copy the link for another app'}
                </button>
                {copied === 'fail' && <p className="sub-text">Couldn't copy. Here's the link: {feedUrl}</p>}
              </div>
            </div>
          </div>
        );
      };

      const phoneHeader = isPhone;
      const fixedHeight = !isPhone && viewMode === 'calendar';
      const toggleView = () => setViewMode(viewMode === 'list' ? 'calendar' : 'list');

      const cssVars = darkMode ? {
        '--bg': '#0E1734', '--card': '#18234A', '--other': '#121C3D', '--text': '#F4F1EA', '--muted': '#AEB6CC',
        '--line': '#2A3560', '--chip-line': '#3A4566', '--hover': '#22305E', '--hdr': '#070D22',
        '--primary-bg': '#F4F1EA', '--primary-fg': '#0E1734', '--today-bg': '#F2B705', '--today-fg': '#0E1734',
      } : {
        '--bg': '#FAF8F3', '--card': '#FFFFFF', '--other': '#F1F2F6', '--text': '#0E1734', '--muted': '#4A5470',
        '--line': '#E1E4EC', '--chip-line': '#C5CAD8', '--hover': '#EEF0F5', '--hdr': '#0E1734',
        '--primary-bg': '#0E1734', '--primary-fg': '#FFFFFF', '--today-bg': '#0E1734', '--today-fg': '#FFFFFF',
      };

      return (
        <div className={`app${fixedHeight ? ' fixed' : ''}`} style={cssVars}>
          <style>{`
            .app { min-height: 100%; display: flex; flex-direction: column; background: var(--bg); color: var(--text); font-family: 'Open Sans', sans-serif; }
            .app.fixed { height: 100vh; min-height: 0; overflow: hidden; }
            .app a { color: inherit; }
            .app button { font-family: inherit; }
            h1, h2, h3, .month-title, .row-time, .card-time, .num { font-family: 'Bricolage Grotesque', sans-serif; }
            .vh { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

            /* HEADER */
            .hdr { background: var(--hdr); color: #FFFFFF; padding: 10px 24px; display: flex; flex-wrap: wrap; align-items: center; gap: 10px 24px; flex-shrink: 0; }
            .brand { display: flex; align-items: baseline; gap: 12px; flex: 1 1 auto; min-width: 0; }
            .brand h1 { font-size: 22px; font-weight: 800; line-height: 1.1; white-space: nowrap; }
            .updated { font-size: 12px; color: #C9D0E3; white-space: nowrap; }
            .monthnav { display: flex; align-items: center; gap: 6px; }
            .month-title { font-weight: 700; font-size: 19px; min-width: 150px; color: inherit; }
            .hdr-actions { display: flex; align-items: center; gap: 8px; }
            .icon-btn { width: 40px; height: 40px; border-radius: 10px; border: 1.5px solid #3A4566; background: transparent; color: #FFFFFF; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; flex: none; }
            .icon-btn.plain { border-color: transparent; width: 36px; height: 36px; }
            .icon-btn.dark { color: var(--text); }
            .icon-btn:disabled, .ghost-btn:disabled { opacity: 0.35; cursor: not-allowed; }
            .icon-btn:hover:not(:disabled) { background: #FFFFFF15; }
            .ghost-btn { height: 36px; padding: 0 12px; border-radius: 10px; border: 1.5px solid #3A4566; background: transparent; color: #FFFFFF; font-weight: 600; font-size: 13px; cursor: pointer; }
            .btn-light { height: 36px; padding: 0 14px; border-radius: 10px; border: 0; background: #F4F1EA; color: #0E1734; font-weight: 700; font-size: 13px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; white-space: nowrap; cursor: pointer; }
            .btn-light.block { width: 100%; height: 40px; background: var(--primary-bg); color: var(--primary-fg); }

            /* SEARCH */
            .search { position: relative; }
            .search-field { display: flex; align-items: center; gap: 8px; background: #1B2647; border-radius: 10px; padding: 0 12px; height: 36px; width: 220px; color: #C9D0E3; }
            .search-field input { flex: 1; min-width: 0; border: 0; background: transparent; color: #FFFFFF; font-family: inherit; font-size: 14px; outline: none; }
            .search-field input::placeholder { color: #AEB6CC; }
            .search-field:focus-within { box-shadow: 0 0 0 2px #F2B705; }
            .search-results { position: absolute; top: calc(100% + 6px); right: 0; width: 340px; max-width: calc(100vw - 32px); background: var(--card); color: var(--text); border: 1px solid var(--line); border-radius: 12px; box-shadow: 0 12px 32px rgba(0,0,0,0.35); z-index: 60; overflow: hidden; }
            .search-item { display: block; width: 100%; text-align: left; padding: 10px 14px; border: 0; border-top: 1px solid var(--line); background: transparent; color: var(--text); cursor: pointer; }
            .search-item:first-child { border-top: 0; }
            .search-item:hover, .search-item:focus { background: var(--hover); outline: none; }
            .search-title { display: block; font-weight: 700; font-size: 14px; }
            .search-meta { display: block; font-size: 12px; color: var(--muted); margin-top: 2px; }
            .search-none { padding: 12px 14px; font-size: 14px; color: var(--muted); }

            /* FILTER BAR (desktop) */
            .filterbar { flex-shrink: 0; padding: 10px 24px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 16px; border-bottom: 1px solid var(--line); }
            .chips, .wrap-chips { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
            .chip { height: 32px; padding: 0 13px; border-radius: 999px; border: 1.5px solid var(--chip-line); background: var(--card); color: var(--text); font-weight: 600; font-size: 13px; display: inline-flex; align-items: center; gap: 7px; cursor: pointer; }
            .chip[aria-pressed="true"] { background: var(--primary-bg); color: var(--primary-fg); border-color: var(--primary-bg); font-weight: 700; }
            select.chip { padding: 0 10px; }
            .chip-gap { width: 6px; }
            .bit-line { font-size: 13px; color: var(--muted); display: flex; align-items: center; gap: 2px; }
            .bit-line a { color: var(--text); font-weight: 600; }
            .bit-x { width: 32px; height: 32px; border: 0; background: transparent; color: var(--muted); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; flex: none; }

            /* SHAPES */
            .shape { display: inline-block; flex: none; }
            .shape-show { border-radius: 50%; }
            .shape-workshop { border-radius: 2px; }
            .shape-jam { transform: rotate(45deg) scale(0.78); border-radius: 1px; }
            .shape-dropin { clip-path: polygon(50% 0, 100% 100%, 0 100%); }

            /* MONTH VIEW */
            .cal-main { flex: 1; min-height: 0; display: flex; gap: 16px; padding: 12px 24px 14px; }
            .cal-wrap { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; }
            .dow-row, .grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; }
            .dow { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); padding: 0 6px 4px; }
            .grid { flex: 1; min-height: 0; }
            .cell { min-height: 0; overflow: hidden; border-radius: 8px; padding: 4px 4px 2px; display: flex; flex-direction: column; gap: 1px; background: var(--card); border: 1px solid var(--line); cursor: pointer; }
            .cell.other { background: var(--other); }
            .cell.past { opacity: 0.55; }
            .cell.today { border: 2px solid var(--text); }
            .cell.picked { box-shadow: inset 0 0 0 2px #F2B705; }
            .num { align-self: flex-start; border: 0; background: transparent; color: var(--text); font-weight: 700; font-size: 13px; line-height: 22px; padding: 0 7px; border-radius: 999px; cursor: pointer; }
            .cell.other .num { color: var(--muted); }
            .cell.today .num { background: var(--today-bg); color: var(--today-fg); }
            .evchip { display: flex; align-items: center; gap: 5px; width: 100%; border: 0; background: transparent; color: var(--text); font-size: 12px; line-height: 18px; border-radius: 4px; padding: 0 3px; cursor: pointer; text-align: left; min-width: 0; }
            .evchip:hover, .evchip:focus { background: var(--hover); outline: none; }
            .evchip .txt { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
            .more { font-size: 12px; font-weight: 700; padding: 0 3px; }
            .cell-shapes { display: none; }
            .phone-monthnav { display: none; }

            /* SIDE PANEL */
            .side { width: 320px; flex: none; min-height: 0; box-sizing: border-box; background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 16px 18px; display: flex; flex-direction: column; gap: 8px; }
            .side h2 { font-size: 20px; font-weight: 800; }
            .side-list { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; }
            .side-empty { font-size: 14px; color: var(--muted); padding: 8px 0; }
            .side-foot { border-top: 1px solid var(--line); padding-top: 12px; font-size: 12px; color: var(--muted); line-height: 1.5; display: flex; flex-direction: column; gap: 10px; }
            .side-foot a { color: var(--text); }
            .linkish { border: 0; background: none; color: var(--text); text-decoration: underline; font-weight: 600; font-size: 13px; cursor: pointer; padding: 0; align-self: flex-start; }
            .row { display: flex; gap: 12px; width: 100%; text-align: left; background: transparent; border: 0; border-top: 1px solid var(--line); padding: 10px 2px; cursor: pointer; color: var(--text); }
            .row:first-child { border-top: 0; }
            .row:hover .row-title { text-decoration: underline; }
            .row-when { flex: none; width: 74px; display: flex; flex-direction: column; gap: 2px; }
            .row-day { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
            .row-time { font-weight: 800; font-size: 16px; }
            .row-main { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
            .row-title { font-weight: 700; font-size: 14px; line-height: 1.3; overflow-wrap: anywhere; }
            .row-meta { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); }

            /* LIST VIEW */
            .list { flex: 1; width: 100%; max-width: 760px; margin: 0 auto; padding: 8px 20px 28px; box-sizing: border-box; }
            .list-note { padding: 14px 0 0; font-size: 14px; color: var(--muted); }
            .day-group { padding-top: 18px; display: flex; flex-direction: column; gap: 8px; }
            .day-group h2 { font-size: 18px; font-weight: 800; }
            .day-group h2 small { font-family: 'Open Sans', sans-serif; font-weight: 600; font-size: 14px; color: var(--muted); margin-left: 8px; }
            .card { display: flex; gap: 14px; align-items: flex-start; width: 100%; text-align: left; background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 14px; cursor: pointer; color: var(--text); }
            .card:hover { border-color: var(--chip-line); }
            .card-when { flex: none; width: 64px; display: flex; flex-direction: column; gap: 6px; }
            .card-time { font-weight: 800; font-size: 17px; line-height: 1; }
            .card-type { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; }
            .card-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
            .card-title { font-weight: 700; font-size: 15px; line-height: 1.35; overflow-wrap: anywhere; }
            .card-venue { font-size: 13px; color: var(--muted); }
            .chev { flex: none; color: var(--muted); margin-top: 1px; }
            .empty { padding: 40px 0 8px; text-align: center; color: var(--muted); display: flex; flex-direction: column; gap: 14px; align-items: center; }

            /* BUTTONS */
            .btn-outline { min-height: 46px; border-radius: 12px; border: 1.5px solid var(--text); background: transparent; color: var(--text); font-weight: 700; font-size: 14px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; padding: 0 14px; text-decoration: none; text-align: center; }
            .btn-outline.wide { width: 100%; margin-top: 20px; }
            .app .btn-primary { min-height: 52px; border-radius: 14px; border: 0; background: var(--primary-bg); color: var(--primary-fg); text-decoration: none; font-weight: 700; font-size: 16px; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; width: 100%; }

            /* FOOTER */
            .site-foot { background: var(--hdr); color: #C9D0E3; padding: 20px 24px 24px; display: flex; flex-direction: column; gap: 10px; font-size: 13px; line-height: 1.6; }
            .site-foot a { color: #FFFFFF; }
            .foot-tilt { display: flex; align-items: center; gap: 10px; color: #FFFFFF; }
            .foot-tilt.small { color: var(--muted); }
            .tilt-mark { flex: none; width: 36px; height: 36px; border-radius: 50%; background: #F2542D; color: #0E1734; display: inline-flex; align-items: center; justify-content: center; font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: 14px; }
            .foot-tilt.small .tilt-mark { width: 30px; height: 30px; font-size: 12px; }

            /* PHONE CONTROLS */
            .phone-controls { background: var(--hdr); padding: 0 16px 14px; display: flex; flex-direction: column; gap: 10px; flex-shrink: 0; }
            .phone-controls .search-field { width: auto; height: 44px; border-radius: 12px; }
            .phone-controls .search-field input { font-size: 16px; }
            .phone-controls .search-results { left: 0; right: 0; width: auto; max-width: none; }
            .fbtns { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
            .fbtn { height: 44px; border-radius: 12px; border: 0; background: #F4F1EA; color: #0E1734; font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 4px; min-width: 0; padding: 0 8px; cursor: pointer; }
            .fbtn.on { background: #F2B705; }
            .fbtn span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .fbtn svg { flex: none; }
            .bit-bar { padding: 10px 16px; background: var(--other); border-bottom: 1px solid var(--line); }
            .bit-bar .bit-line { justify-content: space-between; line-height: 1.45; }

            /* SHEETS (event, filters, subscribe) */
            .sheet-overlay { position: fixed; inset: 0; background: rgba(5,9,25,0.6); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 24px; }
            .sheet { width: 100%; max-width: 460px; max-height: 90vh; overflow-y: auto; background: var(--bg); color: var(--text); border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.45); position: relative; }
            .sheet-hero { position: relative; height: 96px; background: repeating-linear-gradient(135deg, #24315A 0 14px, #1B2647 14px 28px); background-size: cover; background-position: center; }
            .sheet-hero.has-img { height: 200px; }
            .sheet-hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0) 25%, var(--bg) 100%); }
            .sheet-close { position: absolute; top: 12px; right: 12px; z-index: 1; width: 44px; height: 44px; border-radius: 50%; border: 0; background: rgba(14,23,52,0.75); color: #FFFFFF; display: flex; align-items: center; justify-content: center; cursor: pointer; }
            .sheet-handle { display: none; position: absolute; top: 8px; left: 50%; margin-left: -22px; width: 44px; height: 5px; border-radius: 3px; background: rgba(255,255,255,0.8); z-index: 1; }
            .sheet-handle.static { position: static; margin: 0 auto 4px; background: var(--chip-line); }
            .sheet-body { padding: 0 22px 24px; margin-top: -30px; position: relative; display: flex; flex-direction: column; gap: 16px; }
            .type-pill { align-self: flex-start; display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 700; background: var(--card); border: 1px solid var(--line); border-radius: 999px; padding: 4px 10px; }
            .sheet-body h2 { font-size: 26px; font-weight: 800; line-height: 1.12; }
            .facts { list-style: none; display: flex; flex-direction: column; gap: 10px; font-size: 15px; }
            .facts li { display: flex; gap: 12px; align-items: center; }
            .facts a { font-size: 13px; margin-left: 4px; }
            .sheet-desc { font-size: 14px; line-height: 1.55; color: var(--muted); }
            .sheet-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
            .cal-choices { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
            .also { border-top: 1px solid var(--line); padding-top: 14px; display: flex; flex-direction: column; gap: 4px; }
            .also-label { font-size: 13px; font-weight: 700; color: var(--muted); }
            .also button { text-align: left; border: 0; background: none; color: var(--text); text-decoration: underline; font-size: 14px; padding: 6px 0; cursor: pointer; }
            .fsheet { padding: 12px 22px 24px; display: flex; flex-direction: column; gap: 18px; }
            .fsheet-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
            .fsheet-top h2 { font-size: 24px; font-weight: 800; }
            .fsheet fieldset { border: 0; padding: 0; margin: 0; }
            .fsheet legend { font-weight: 700; font-size: 15px; margin-bottom: 10px; padding: 0; }
            .fsheet .chip { height: 40px; font-size: 14px; padding: 0 14px; }
            .type-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
            .type-check { min-height: 48px; border-radius: 12px; border: 1.5px solid var(--chip-line); background: var(--card); display: flex; align-items: center; gap: 10px; padding: 0 12px; font-weight: 600; font-size: 14px; cursor: pointer; }
            .type-check input { width: 18px; height: 18px; margin: 0; accent-color: #F2B705; }
            .where { display: flex; flex-direction: column; gap: 10px; font-weight: 700; font-size: 15px; }
            .where select { height: 48px; border-radius: 12px; border: 1.5px solid var(--chip-line); background: var(--card); color: var(--text); font-family: inherit; font-size: 15px; padding: 0 12px; }
            .sub-text { font-size: 14px; line-height: 1.55; color: var(--muted); overflow-wrap: anywhere; }
            .fsheet .btn-outline.wide { margin-top: 0; }

            ${legacyCss}

            /* PHONE */
            @media (max-width: 768px) {
              .hdr { padding: 14px 16px 12px; gap: 10px; flex-wrap: nowrap; }
              .brand { flex-direction: column; align-items: flex-start; gap: 2px; }
              .brand h1 { font-size: 24px; }
              .updated { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; }
              .icon-btn { width: 44px; height: 44px; border-radius: 12px; }
              .icon-btn.plain { width: 40px; height: 40px; }
              .list { padding: 4px 16px 24px; }
              .cal-main { flex-direction: column; padding: 4px 10px 20px; gap: 12px; }
              .phone-monthnav { display: block; padding: 8px 0 8px; }
              .phone-monthnav .monthnav { justify-content: space-between; }
              .phone-monthnav .ghost-btn, .phone-monthnav .icon-btn { color: var(--text); border-color: var(--chip-line); }
              .phone-monthnav .icon-btn.plain { border-color: transparent; }
              .phone-monthnav .month-title { order: -1; flex: 1; min-width: 0; font-size: 20px; }
              .grid { gap: 3px; grid-template-rows: none !important; grid-auto-rows: minmax(58px, auto); }
              .dow-row { gap: 3px; }
              .dow { padding: 0 0 4px; text-align: center; letter-spacing: 0.04em; }
              .cell { padding: 3px; align-items: center; }
              .num { align-self: center; font-size: 13px; padding: 0 6px; }
              .evchip, .more { display: none; }
              .cell-shapes { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 3px; margin-top: auto; padding-bottom: 3px; }
              .cell-count { font-size: 10px; font-weight: 700; color: var(--muted); }
              .side { width: auto; }
              .side-list { overflow: visible; }
              .sheet-overlay { align-items: flex-end; padding: 0; }
              .sheet { max-width: none; border-radius: 24px 24px 0 0; max-height: 92vh; }
              .sheet-handle { display: block; }
              .sheet-body h2 { font-size: 26px; }
            }
          `}</style>

          <header className="hdr">
            <div className="brand">
              <h1>{phoneHeader ? 'Bristol Improv' : 'Bristol Improv Calendar'}</h1>
              <span className="updated">{phoneHeader ? `Calendar${updatedText ? ' · ' + updatedText.toLowerCase() : ''}` : updatedText}</span>
            </div>
            {!isPhone && viewMode === 'calendar' && monthNav}
            <div className="hdr-actions">
              {!isPhone && searchBox}
              {!isPhone && viewMode === 'list' && (
                <button className="btn-light" onClick={() => { setCopied(''); setShowSubscribe(true); }} data-goatcounter-click="subscribe-open">{iconCalPlus} Add to your calendar</button>
              )}
              <button
                className="icon-btn"
                onClick={toggleView}
                aria-label={viewMode === 'list' ? 'Show the month view' : 'Show the list view'}
                title={viewMode === 'list' ? 'Month view' : 'List view'}
                data-goatcounter-click={viewMode === 'list' ? 'view-toggle-calendar' : 'view-toggle-list'}
              >
                {viewMode === 'list' ? iconCal : iconList}
              </button>
              <button className="icon-btn" onClick={() => setShowSettings(true)} aria-label="Settings" title="Settings">{iconMenu}</button>
            </div>
          </header>

          {isPhone ? (
            <>
              <div className="phone-controls">
                {searchBox}
                <div className="fbtns">
                  <button className={`fbtn${whenFilter !== 'any' ? ' on' : ''}`} onClick={() => setShowFilters(true)}><span>{whenLabel}</span>{iconDown}</button>
                  <button className={`fbtn${typeSet.length ? ' on' : ''}`} onClick={() => setShowFilters(true)}><span>{typeButtonLabel}</span>{iconDown}</button>
                  <button className={`fbtn${venueFilter !== 'all' ? ' on' : ''}`} onClick={() => setShowFilters(true)}><span>{venueButtonLabel}</span>{iconDown}</button>
                </div>
              </div>
              {bitLine && <div className="bit-bar">{bitLine}</div>}
            </>
          ) : (
            <div className="filterbar">
              <nav className="chips" aria-label="Filters">
                <button className="chip" aria-pressed={!filtersActive} onClick={clearFilters}>Everything</button>
                <button className="chip" aria-pressed={whenFilter === 'today'} onClick={() => setWhenFilter(whenFilter === 'today' ? 'any' : 'today')}>Today</button>
                <button className="chip" aria-pressed={whenFilter === 'weekend'} onClick={() => setWhenFilter(whenFilter === 'weekend' ? 'any' : 'weekend')}>This weekend</button>
                <span className="chip-gap" aria-hidden="true"></span>
                {TYPE_ORDER.filter(t => activeTypes.has(t) || t !== 'dropin').map(t => (
                  <button key={t} className="chip" aria-pressed={typeSet.includes(t)} onClick={() => toggleType(t)}>{shape(t, 10)}{TYPE_PLURAL[t]}</button>
                ))}
                <label>
                  <span className="vh">Venue</span>
                  <select className="chip" value={venueFilter} onChange={ev => setVenueFilter(ev.target.value)}>
                    <option value="all">All venues</option>
                    {venueGroups.map(({ key, label }) => (
                      <option key={key} value={key} disabled={!activeVenueGroups.has(key)}>{label}</option>
                    ))}
                  </select>
                </label>
              </nav>
              {bitLine}
            </div>
          )}

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <div>Loading events...</div>
            </div>
          ) : error ? (
            <div className="loading">
              <div style={{ fontWeight: 700 }}>{error}</div>
              <div style={{ fontSize: '0.9rem', maxWidth: '320px', textAlign: 'center', lineHeight: 1.5 }}>
                It's probably temporary. Give it another go, or check back in a bit.
              </div>
              <button className="btn-outline" onClick={fetchEvents}>Try again</button>
            </div>
          ) : viewMode === 'list' ? renderList() : renderCalendar()}

          {(isPhone || viewMode === 'list') && siteFooter}

          {eventSheet()}
          {filterSheet()}
          {subscribeSheet()}
          <RoadmapModal isOpen={showRoadmap} onClose={() => setShowRoadmap(false)} colors={colors} />
          <SettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            colors={colors}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onOpenRoadmap={() => setShowRoadmap(true)}
            lastUpdated={lastUpdated}
            formatLastUpdated={formatLastUpdated}
          />
        </div>
      );
    };

    ReactDOM.createRoot(document.getElementById('root')).render(<BristolImprovCalendar />);
