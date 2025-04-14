import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './FlightCalendarSearch.css';

// FlightCalendarSearch Component
const FlightCalendarSearch = () => {
  const [departureAirport, setDepartureAirport] = useState('');
  const [arrivalAirport, setArrivalAirport] = useState('');
  const [departureDate, setDepartureDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infantsInSeat, setInfantsInSeat] = useState(0);
  const [infantsOnLap, setInfantsOnLap] = useState(0);
  const [travelClass, setTravelClass] = useState('economy');
  const [stops, setStops] = useState('0');
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('en');
  const [country, setCountry] = useState('us');
  const [deepSearch, setDeepSearch] = useState(false);
  const [sortBy, setSortBy] = useState('price');
  const [showHidden, setShowHidden] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setFlights([]);

    try {
      const params = new URLSearchParams({
        api_key: process.env.REACT_APP_SERPAPI_KEY,
        engine: 'google_flights',
        departure_id: departureAirport,
        arrival_id: arrivalAirport,
        outbound_date: departureDate ? departureDate.toISOString().split('T')[0] : '',
        return_date: returnDate ? returnDate.toISOString().split('T')[0] : '',
        adults: adults,
        children: children,
        infants_in_seat: infantsInSeat,
        infants_on_lap: infantsOnLap,
        travel_class: travelClass,
        stops: stops,
        currency: currency,
        hl: language,
        gl: country,
        deep_search: deepSearch,
        sort_by: sortBy,
        show_hidden: showHidden
      });

      const response = await fetch(`https://serpapi.com/search?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setFlights(data.flights || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const [searchParams, setSearchParams] = useState({
    departure_id: '',
    arrival_id: '',
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    adults: 1,
    children: 0,
    infants_in_seat: 0,
    infants_on_lap: 0,
    travel_class: 1,
    stops: 0,
    currency: 'USD'
  });
  
  const [calendarData, setCalendarData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [airportError, setAirportError] = useState('');
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const airportOptions = [
    { id: 'JFK', name: 'New York John F. Kennedy' },
    { id: 'LAX', name: 'Los Angeles International' },
    { id: 'LHR', name: 'London Heathrow' },
    { id: 'CDG', name: 'Paris Charles de Gaulle' },
    { id: 'SIN', name: 'Singapore Changi' },
    { id: 'DXB', name: 'Dubai International' },
    { id: 'HKG', name: 'Hong Kong International' },
    { id: 'SYD', name: 'Sydney Kingsford Smith' }
  ];
  
  const travelClassOptions = [
    { id: 1, name: 'Economy' },
    { id: 2, name: 'Premium Economy' },
    { id: 3, name: 'Business' },
    { id: 4, name: 'First' }
  ];
  
  const stopsOptions = [
    { id: 0, name: 'Any number of stops' },
    { id: 1, name: 'Nonstop only' },
    { id: 2, name: '1 stop or fewer' },
    { id: 3, name: '2 stops or fewer' }
  ];
  
  const validateAirportCode = (code) => {
    return /^[A-Z]{3}$/.test(code);
  };

  const handleAirportInput = (e) => {
    const { name, value } = e.target;
    const uppercaseValue = value.toUpperCase();
    
    if (uppercaseValue.length > 3) {
      return; // Don't allow more than 3 characters
    }
    
    if (uppercaseValue.length === 3 && !validateAirportCode(uppercaseValue)) {
      setAirportError('Please enter a valid 3-letter airport code');
      return;
    } else {
      setAirportError('');
    }
    
    setSearchParams(prev => ({ ...prev, [name]: uppercaseValue }));
  };
  
  // Generate calendar structure (without prices) when month/year changes
  useEffect(() => {
    generateCalendarStructure();
  }, [searchParams.month, searchParams.year]);

  // Fetch flight data when search parameters change
  useEffect(() => {
    if (searchParams.departure_id && searchParams.arrival_id) {
      handleSearch();
    }
  }, [searchParams.departure_id, searchParams.arrival_id, searchParams.month, searchParams.year]);

  const generateCalendarStructure = () => {
    const daysInMonth = new Date(searchParams.year, searchParams.month + 1, 0).getDate();
    const firstDayOfMonth = new Date(searchParams.year, searchParams.month, 1).getDay();
    
    let days = [];
    
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, price: null, empty: true });
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        date: new Date(searchParams.year, searchParams.month, i),
        price: null,
        empty: false,
        flightData: null
      });
    }
    
    setCalendarData(days);
  };
  
  const handlePrevMonth = () => {
    setSearchParams(prev => {
      let newMonth = prev.month - 1;
      let newYear = prev.year;
      
      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      }
      
      return { ...prev, month: newMonth, year: newYear };
    });
  };
  
  const handleNextMonth = () => {
    setSearchParams(prev => {
      let newMonth = prev.month + 1;
      let newYear = prev.year;
      
      if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }
      
      return { ...prev, month: newMonth, year: newYear };
    });
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: searchParams.currency 
    }).format(price);
  };
  
  const getCurrencySymbol = () => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: searchParams.currency 
    }).format(0).replace(/[0-9]/g, '').trim();
  };

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    },
    header: {
      textAlign: 'center',
      marginBottom: '20px'
    },
    searchForm: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      marginBottom: '20px'
    },
    formRow: {
      display: 'flex',
      gap: '10px'
    },
    select: {
      flex: 1,
      padding: '8px',
      borderRadius: '4px',
      border: '1px solid #ccc'
    },
    calendar: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '5px'
    },
    calendarHeader: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '5px',
      marginBottom: '10px',
      fontWeight: 'bold',
      textAlign: 'center'
    },
    day: {
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      textAlign: 'center',
      cursor: 'pointer',
      position: 'relative'
    },
    emptyDay: {
      backgroundColor: '#f5f5f5'
    },
    price: {
      fontSize: '14px',
      color: '#666',
      marginTop: '5px'
    },
    selectedDay: {
      backgroundColor: '#e3f2fd',
      borderColor: '#2196f3'
    },
    hoveredDay: {
      backgroundColor: '#f5f5f5'
    },
    loading: {
      textAlign: 'center',
      padding: '20px'
    },
    modal: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000,
      minWidth: '300px'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px'
    },
    modalClose: {
      cursor: 'pointer',
      fontSize: '20px'
    },
    modalFlight: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px'
    },
    modalFlightInfo: {
      fontSize: '16px',
      fontWeight: 'bold'
    },
    modalPrice: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#2196f3'
    },
    modalTimes: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px'
    },
    modalTime: {
      textAlign: 'center'
    },
    modalTimeValue: {
      fontSize: '16px',
      fontWeight: 'bold'
    },
    modalTimeLocation: {
      fontSize: '14px',
      color: '#666'
    },
    modalDuration: {
      flex: 1,
      textAlign: 'center',
      position: 'relative',
      margin: '0 20px'
    },
    modalDurationValue: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '5px'
    },
    modalDurationLine: {
      height: '1px',
      backgroundColor: '#ccc',
      margin: '5px 0'
    },
    modalStops: {
      fontSize: '12px',
      color: '#666',
      marginTop: '5px'
    },
    searchButton: {
      padding: '10px 20px',
      backgroundColor: '#2196f3',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 'bold',
      marginTop: '10px',
      width: '100%',
      transition: 'background-color 0.3s ease'
    },
    searchButtonDisabled: {
      backgroundColor: '#ccc',
      cursor: 'not-allowed'
    },
    searchButtonHover: {
      backgroundColor: '#1976d2'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Flight Search Calendar</h2>
      </div>
      
      <div style={styles.searchForm}>
        <div style={styles.formRow}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              name="departure_id"
              value={searchParams.departure_id}
              onChange={handleAirportInput}
              placeholder="Enter Departure Airport Code (e.g., JFK)"
              maxLength={3}
              style={{
                ...styles.select,
                textTransform: 'uppercase',
                fontFamily: 'monospace',
                letterSpacing: '2px'
              }}
            />
          </div>
          
          <div style={{ flex: 1 }}>
            <input
              type="text"
              name="arrival_id"
              value={searchParams.arrival_id}
              onChange={handleAirportInput}
              placeholder="Enter Arrival Airport Code (e.g., LAX)"
              maxLength={3}
              style={{
                ...styles.select,
                textTransform: 'uppercase',
                fontFamily: 'monospace',
                letterSpacing: '2px'
              }}
            />
          </div>
        </div>
        
        {airportError && (
          <div style={{ color: 'red', marginBottom: '10px' }}>
            {airportError}
          </div>
        )}
        
        <div style={styles.formRow}>
          <select
            name="travel_class"
            value={searchParams.travel_class}
            onChange={handleInputChange}
            style={styles.select}
          >
            {travelClassOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          
          <select
            name="stops"
            value={searchParams.stops}
            onChange={handleInputChange}
            style={styles.select}
          >
            {stopsOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading || !searchParams.departure_id || !searchParams.arrival_id}
          style={{
            ...styles.searchButton,
            ...(loading || !searchParams.departure_id || !searchParams.arrival_id ? styles.searchButtonDisabled : {}),
            ':hover': styles.searchButtonHover
          }}
        >
          {loading ? 'Searching...' : 'Search Flights'}
        </button>
      </div>
      
      <div style={styles.calendarHeader}>
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>
      
      {loading ? (
        <div style={styles.loading}>Loading flight data...</div>
      ) : (
        <div style={styles.calendar}>
          {calendarData.map((day, index) => (
            <div
              key={index}
              style={{
                ...styles.day,
                ...(day.empty ? styles.emptyDay : {}),
                ...(selectedDate === day.date ? styles.selectedDay : {}),
                ...(hoveredDate === day.date ? styles.hoveredDay : {})
              }}
              onClick={() => !day.empty && setSelectedDate(day.date)}
              onMouseEnter={() => !day.empty && setHoveredDate(day.date)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              {day.day}
              {day.price && (
                <div style={styles.price}>
                  {formatPrice(day.price)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {selectedDate && (
        <div style={styles.modal}>
          <div style={styles.modalHeader}>
            <h3>{selectedDate.toLocaleDateString()}</h3>
            <span style={styles.modalClose} onClick={() => setSelectedDate(null)}>×</span>
          </div>
          
          {calendarData.find(day => day.date === selectedDate)?.flightData && (
            <>
              <div style={styles.modalFlight}>
                <div style={styles.modalFlightInfo}>
                  ✈️ {calendarData.find(day => day.date === selectedDate)?.flightData?.airline}
                </div>
                <div style={styles.modalPrice}>
                  {formatPrice(calendarData.find(day => day.date === selectedDate)?.price)}
                </div>
              </div>
              
              <div style={styles.modalTimes}>
                <div style={styles.modalTime}>
                  <div style={styles.modalTimeValue}>
                    {calendarData.find(day => day.date === selectedDate)?.flightData?.departureTime}
                  </div>
                  <div style={styles.modalTimeLocation}>
                    {searchParams.departure_id || 'Origin'}
                  </div>
                </div>
                
                <div style={styles.modalDuration}>
                  <div style={styles.modalDurationValue}>
                    {calendarData.find(day => day.date === selectedDate)?.flightData?.duration}
                  </div>
                  <div style={styles.modalDurationLine}></div>
                  <div style={styles.modalStops}>
                    {calendarData.find(day => day.date === selectedDate)?.flightData?.stops === 0 
                      ? 'Nonstop' 
                      : `${calendarData.find(day => day.date === selectedDate)?.flightData?.stops} ${calendarData.find(day => day.date === selectedDate)?.flightData?.stops === 1 ? 'stop' : 'stops'}`}
                  </div>
                </div>
                
                <div style={styles.modalTime}>
                  <div style={styles.modalTimeValue}>
                    {calendarData.find(day => day.date === selectedDate)?.flightData?.arrivalTime}
                  </div>
                  <div style={styles.modalTimeLocation}>
                    {searchParams.arrival_id || 'Destination'}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FlightCalendarSearch;