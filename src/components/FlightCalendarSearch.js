import React, { useState, useEffect } from 'react';
import axios from 'axios';

// FlightCalendarSearch Component
const FlightCalendarSearch = () => {
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
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);
  
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
  
  // Generate calendar days for the selected month
  useEffect(() => {
    generateCalendarData();
  }, [searchParams.month, searchParams.year]);
  
  const generateCalendarData = () => {
    const daysInMonth = new Date(searchParams.year, searchParams.month + 1, 0).getDate();
    const firstDayOfMonth = new Date(searchParams.year, searchParams.month, 1).getDay();
    
    let days = [];
    
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, price: null, empty: true });
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      // Generate random price for demonstration
      const randomPrice = Math.floor(Math.random() * 500) + 200;
      days.push({
        day: i,
        date: new Date(searchParams.year, searchParams.month, i),
        price: randomPrice,
        empty: false,
        // Random flight data for demonstration
        flightData: {
          airline: ['American Airlines', 'Delta', 'United', 'British Airways', 'Singapore Airlines'][Math.floor(Math.random() * 5)],
          departureTime: `${Math.floor(Math.random() * 12) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
          arrivalTime: `${Math.floor(Math.random() * 12) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
          duration: `${Math.floor(Math.random() * 10) + 2}h ${Math.floor(Math.random() * 50).toString().padStart(2, '0')}m`,
          stops: Math.floor(Math.random() * 3)
        }
      });
    }
    
    setCalendarData(days);
  };
  
  const handleSearch = async () => {
    setLoading(true);
    
    try {
      const response = await axios.get('https://serpapi.com/search.json', {
        params: {
          engine: 'google_flights',
          api_key: process.env.REACT_APP_SERPAPI_KEY,
          departure_id: searchParams.departure_id,
          arrival_id: searchParams.arrival_id,
          type: 1, // Round trip
          outbound_date: `${searchParams.year}-${String(searchParams.month + 1).padStart(2, '0')}-01`,
          return_date: `${searchParams.year}-${String(searchParams.month + 1).padStart(2, '0')}-${new Date(searchParams.year, searchParams.month + 1, 0).getDate()}`,
          adults: searchParams.adults,
          children: searchParams.children,
          infants_in_seat: searchParams.infants_in_seat,
          infants_on_lap: searchParams.infants_on_lap,
          travel_class: searchParams.travel_class,
          stops: searchParams.stops,
          currency: searchParams.currency,
          hl: 'en',
          gl: 'us',
          deep_search: true, // For more accurate results
          sort_by: 2, // Sort by price
          show_hidden: true // Include hidden flight results
        }
      });

      // Process the API response
      if (response.data && response.data.best_flights) {
        const flightsData = response.data.best_flights;
        const updatedCalendarData = calendarData.map(day => {
          const flightForDay = flightsData.find(flight => {
            const flightDate = new Date(flight.departure_airport.time);
            return flightDate.getDate() === day.date;
          });
          
          if (flightForDay) {
            return {
              ...day,
              price: flightForDay.price,
              flightData: {
                airline: flightForDay.airlines[0],
                departureTime: flightForDay.departure_airport.time,
                arrivalTime: flightForDay.arrival_airport.time,
                duration: flightForDay.duration,
                stops: flightForDay.stops
              }
            };
          }
          return day;
        });
        
        setCalendarData(updatedCalendarData);
      }
    } catch (error) {
      console.error('Error fetching flight data:', error);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
    }
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
    }).format(0).replace(/\d/g, '').trim();
  };
  
  // Custom styled components with plain CSS classes
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
    },
    header: {
      backgroundColor: '#20a1aa',
      color: 'white',
      padding: '1rem',
    },
    headerContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
    },
    headerTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
    },
    headerSubtitle: {
      fontSize: '0.875rem',
    },
    searchForm: {
      maxWidth: '1200px',
      margin: '1rem auto',
      padding: '1rem',
      backgroundColor: 'white',
      boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      borderRadius: '0.25rem',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '1rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
    },
    formLabel: {
      fontSize: '0.875rem',
      color: '#4b5563',
      marginBottom: '0.25rem',
    },
    formInput: {
      padding: '0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.25rem',
      width: '100%',
    },
    formSelect: {
      padding: '0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.25rem',
      width: '100%',
      backgroundColor: 'white',
    },
    formButton: {
      padding: '0.5rem 1.5rem',
      backgroundColor: '#20a1aa',
      color: 'white',
      border: 'none',
      borderRadius: '0.25rem',
      cursor: 'pointer',
      marginTop: '1rem',
    },
    formButtonDisabled: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed',
    },
    calendarContainer: {
      maxWidth: '1200px',
      margin: '1rem auto',
      padding: '1rem',
      backgroundColor: 'white',
      boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      borderRadius: '0.25rem',
      flexGrow: 1,
    },
    calendarHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
    },
    calendarTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
    },
    calendarButton: {
      padding: '0.5rem',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '9999px',
      cursor: 'pointer',
    },
    calendarDays: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '0.5rem',
    },
    dayHeader: {
      textAlign: 'center',
      fontWeight: '500',
      padding: '0.5rem',
    },
    dayCell: {
      padding: '0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.25rem',
      minHeight: '5rem',
      position: 'relative',
    },
    dayCellEmpty: {
      backgroundColor: '#f5f5f5',
    },
    dayCellSelected: {
      border: '1px solid #20a1aa',
      backgroundColor: '#ecfdf5',
    },
    dayNumber: {
      textAlign: 'right',
      fontSize: '0.875rem',
    },
    dayPrice: {
      marginTop: '0.5rem',
      textAlign: 'center',
    },
    priceText: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#20a1aa',
    },
    hoverModal: {
      position: 'absolute',
      zIndex: 10,
      width: '18rem',
      backgroundColor: 'white',
      border: '1px solid #d1d5db',
      borderRadius: '0.25rem',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
      padding: '0.75rem',
      top: '100%',
      left: 0,
    },
    modalHeader: {
      fontWeight: '600',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '0.5rem',
      marginBottom: '0.5rem',
    },
    modalDate: {
      marginBottom: '0.5rem',
      fontSize: '0.875rem',
      color: '#4b5563',
    },
    modalFlight: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.75rem',
    },
    modalFlightInfo: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '0.875rem',
    },
    modalPrice: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#20a1aa',
    },
    modalTimes: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.5rem',
    },
    modalTime: {
      textAlign: 'center',
    },
    modalTimeValue: {
      fontSize: '1.125rem',
      fontWeight: '600',
    },
    modalTimeLocation: {
      fontSize: '0.75rem',
      color: '#4b5563',
    },
    modalDuration: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    modalDurationValue: {
      fontSize: '0.75rem',
      color: '#4b5563',
    },
    modalDurationLine: {
      borderTop: '1px solid #d1d5db',
      width: '4rem',
      margin: '0.25rem 0',
    },
    modalStops: {
      fontSize: '0.75rem',
      color: '#4b5563',
    },
    modalButton: {
      width: '100%',
      backgroundColor: '#20a1aa',
      color: 'white',
      padding: '0.25rem',
      borderRadius: '0.25rem',
      marginTop: '0.5rem',
      fontSize: '0.875rem',
      border: 'none',
      cursor: 'pointer',
    },
    legend: {
      marginTop: '1.5rem',
      borderTop: '1px solid #e5e7eb',
      paddingTop: '1rem',
    },
    legendItems: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      fontSize: '0.875rem',
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
    },
    legendColor: {
      height: '0.75rem',
      width: '0.75rem',
      borderRadius: '0.125rem',
      display: 'inline-block',
      marginRight: '0.25rem',
    },
    legendText: {
      textAlign: 'center',
      fontSize: '0.875rem',
      color: '#4b5563',
      marginTop: '0.5rem',
    },
  };

  // JSX for the component
  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContainer}>
          <h1 style={styles.headerTitle}>Flight Calendar Search</h1>
          <p style={styles.headerSubtitle}>Find the best prices for an entire month</p>
        </div>
      </header>
      
      {/* Search Form */}
      <div style={styles.searchForm}>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>From</label>
            <select 
              name="departure_id"
              value={searchParams.departure_id}
              onChange={handleInputChange}
              style={styles.formSelect}
            >
              <option value="">Select departure airport</option>
              {airportOptions.map(airport => (
                <option key={airport.id} value={airport.id}>{airport.name} ({airport.id})</option>
              ))}
            </select>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>To</label>
            <select 
              name="arrival_id"
              value={searchParams.arrival_id}
              onChange={handleInputChange}
              style={styles.formSelect}
            >
              <option value="">Select arrival airport</option>
              {airportOptions.map(airport => (
                <option key={airport.id} value={airport.id}>{airport.name} ({airport.id})</option>
              ))}
            </select>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Passengers</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select 
                name="adults"
                value={searchParams.adults}
                onChange={handleInputChange}
                style={{ ...styles.formSelect, width: '50%' }}
              >
                {[...Array(9).keys()].map(num => (
                  <option key={num + 1} value={num + 1}>{num + 1} {num === 0 ? 'Adult' : 'Adults'}</option>
                ))}
              </select>
              <select 
                name="children"
                value={searchParams.children}
                onChange={handleInputChange}
                style={{ ...styles.formSelect, width: '50%' }}
              >
                {[...Array(9).keys()].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'Child' : 'Children'}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Class & Stops</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select 
                name="travel_class"
                value={searchParams.travel_class}
                onChange={handleInputChange}
                style={{ ...styles.formSelect, width: '50%' }}
              >
                {travelClassOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
              <select 
                name="stops"
                value={searchParams.stops}
                onChange={handleInputChange}
                style={{ ...styles.formSelect, width: '50%' }}
              >
                {stopsOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            style={{
              ...styles.formButton,
              ...(loading || !searchParams.departure_id || !searchParams.arrival_id ? styles.formButtonDisabled : {})
            }}
            onClick={handleSearch}
            disabled={loading || !searchParams.departure_id || !searchParams.arrival_id}
          >
            {loading ? 'Searching...' : 'Search Flights'}
          </button>
        </div>
      </div>
      
      {/* Calendar View */}
      <div style={styles.calendarContainer}>
        <div style={styles.calendarHeader}>
          <button 
            style={styles.calendarButton}
            onClick={handlePrevMonth}
          >
            ← Prev
          </button>
          
          <h2 style={styles.calendarTitle}>
            {monthNames[searchParams.month]} {searchParams.year}
          </h2>
          
          <button 
            style={styles.calendarButton}
            onClick={handleNextMonth}
          >
            Next →
          </button>
        </div>
        
        <div style={styles.calendarDays}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={styles.dayHeader}>
              {day}
            </div>
          ))}
          
          {calendarData.map((dayData, index) => (
            <div 
              key={index} 
              style={{
                ...styles.dayCell,
                ...(dayData.empty ? styles.dayCellEmpty : {}),
                ...(selectedDate === dayData.day ? styles.dayCellSelected : {}),
                cursor: dayData.empty ? 'default' : 'pointer'
              }}
              onClick={() => !dayData.empty && setSelectedDate(dayData.day)}
              onMouseEnter={() => !dayData.empty && setHoveredDate(dayData)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              {!dayData.empty && (
                <>
                  <div style={styles.dayNumber}>{dayData.day}</div>
                  {dayData.price && (
                    <div style={styles.dayPrice}>
                      <span style={styles.priceText}>{formatPrice(dayData.price)}</span>
                    </div>
                  )}
                </>
              )}
              
              {/* Hover modal */}
              {hoveredDate === dayData && (
                <div style={styles.hoverModal}>
                  <div style={styles.modalHeader}>
                    {searchParams.departure_id || 'Origin'} → {searchParams.arrival_id || 'Destination'}
                  </div>
                  <div style={styles.modalDate}>
                    {new Date(dayData.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div style={styles.modalFlight}>
                    <div style={styles.modalFlightInfo}>
                      ✈️ {dayData.flightData.airline}
                    </div>
                    <div style={styles.modalPrice}>{formatPrice(dayData.price)}</div>
                  </div>
                  <div style={styles.modalTimes}>
                    <div style={styles.modalTime}>
                      <div style={styles.modalTimeValue}>{dayData.flightData.departureTime}</div>
                      <div style={styles.modalTimeLocation}>{searchParams.departure_id || 'Origin'}</div>
                    </div>
                    <div style={styles.modalDuration}>
                      <div style={styles.modalDurationValue}>{dayData.flightData.duration}</div>
                      <div style={styles.modalDurationLine}></div>
                      <div style={styles.modalStops}>
                        {dayData.flightData.stops === 0 
                          ? 'Nonstop' 
                          : `${dayData.flightData.stops} ${dayData.flightData.stops === 1 ? 'stop' : 'stops'}`}
                      </div>
                    </div>
                    <div style={styles.modalTime}>
                      <div style={styles.modalTimeValue}>{dayData.flightData.arrivalTime}</div>
                      <div style={styles.modalTimeLocation}>{searchParams.arrival_id || 'Destination'}</div>
                    </div>
                  </div>
                  <button style={styles.modalButton}>
                    Select this flight
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div style={styles.legend}>
          <div style={styles.legendItems}>
            <span style={styles.legendItem}>
              <span style={{...styles.legendColor, backgroundColor: '#ecfdf5', border: '1px solid #20a1aa'}}></span>
              Selected Date
            </span>
            <span style={styles.legendItem}>
              <span style={{...styles.legendColor, backgroundColor: 'white', border: '1px solid #d1d5db'}}></span>
              Available Date
            </span>
            <span style={styles.legendItem}>
              <span style={{...styles.legendColor, backgroundColor: '#f5f5f5', border: '1px solid #d1d5db'}}></span>
              Unavailable
            </span>
          </div>
          <div style={styles.legendText}>
            All prices are shown in {getCurrencySymbol()}{searchParams.currency} and are subject to change
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightCalendarSearch;