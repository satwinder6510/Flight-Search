import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Users, Plane, Filter } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';
import './FlightCalendarSearch.css';

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
  
  // Generate calendar data whenever month or year changes
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
    
    // Add days of the month with demo flight data (to be replaced with real API data)
    for (let i = 1; i <= daysInMonth; i++) {
      // For demo, generate a random price; replace with API price when available.
      const randomPrice = Math.floor(Math.random() * 500) + 200;
      days.push({
        day: i,
        date: new Date(searchParams.year, searchParams.month, i),
        price: randomPrice,
        empty: false,
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
  
  // UPDATED handleSearch function to integrate the Google Flights API
  const handleSearch = async () => {
    setLoading(true);
    
    try {
      const params = new URLSearchParams({
        engine: 'google_flights',
        api_key: process.env.REACT_APP_SERPAPI_KEY,
        departure_id: searchParams.departure_id,
        arrival_id: searchParams.arrival_id,
        // For demonstration, we use the first day of the selected month as the outbound_date
        outbound_date: new Date(searchParams.year, searchParams.month, 1).toISOString().split('T')[0],
        gl: 'us',
        hl: 'en',
        currency: searchParams.currency,
        travel_class: searchParams.travel_class,
        stops: searchParams.stops,
        deep_search: true
      });
      
      const apiUrl = `https://serpapi.com/search?${params.toString()}`;
      console.log('Fetching API URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      console.log('API Response:', data);
      
      // Map API flight results to calendarData
      if (data.flights) {
        const updatedCalendar = calendarData.map(day => {
          if (!day.empty && day.date) {
            const flightsForDay = data.flights.filter(flight => {
              const flightDate = new Date(flight.departure_date); // Adjust based on actual API data property
              return day.date.toDateString() === flightDate.toDateString();
            });
            return { ...day, flightData: flightsForDay.length ? flightsForDay[0] : null };
          }
          return day;
        });
        setCalendarData(updatedCalendar);
      }
      
    } catch (error) {
      console.error('Search error:', error);
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-teal-500 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Flight Calendar Search</h1>
          <p className="text-sm">Find the best prices for an entire month</p>
        </div>
      </header>
      
      <div className="container mx-auto p-4 bg-white shadow-md rounded-md mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Departure */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">From</label>
            <div className="relative">
              <select 
                name="departure_id"
                value={searchParams.departure_id}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md pl-8"
              >
                <option value="">Select departure airport</option>
                {airportOptions.map(airport => (
                  <option key={airport.id} value={airport.id}>
                    {airport.name} ({airport.id})
                  </option>
                ))}
              </select>
              <MapPin className="absolute left-2 top-2.5 text-gray-400 h-4 w-4" />
            </div>
          </div>
          
          {/* Arrival */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">To</label>
            <div className="relative">
              <select 
                name="arrival_id"
                value={searchParams.arrival_id}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md pl-8"
              >
                <option value="">Select arrival airport</option>
                {airportOptions.map(airport => (
                  <option key={airport.id} value={airport.id}>
                    {airport.name} ({airport.id})
                  </option>
                ))}
              </select>
              <MapPin className="absolute left-2 top-2.5 text-gray-400 h-4 w-4" />
            </div>
          </div>
          
          {/* Passengers */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Passengers</label>
            <div className="flex gap-2">
              <div className="relative w-1/2">
                <select 
                  name="adults"
                  value={searchParams.adults}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md pl-8"
                >
                  {[...Array(9).keys()].map(num => (
                    <option key={num + 1} value={num + 1}>
                      {num + 1} {num === 0 ? 'Adult' : 'Adults'}
                    </option>
                  ))}
                </select>
                <Users className="absolute left-2 top-2.5 text-gray-400 h-4 w-4" />
              </div>
              <div className="relative w-1/2">
                <select 
                  name="children"
                  value={searchParams.children}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md pl-8"
                >
                  {[...Array(9).keys()].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Child' : 'Children'}
                    </option>
                  ))}
                </select>
                <Users className="absolute left-2 top-2.5 text-gray-400 h-4 w-4" />
              </div>
            </div>
          </div>
          
          {/* Class & Stops */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Class & Stops</label>
            <div className="flex gap-2">
              <div className="relative w-1/2">
                <select 
                  name="travel_class"
                  value={searchParams.travel_class}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md pl-8"
                >
                  {travelClassOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <Plane className="absolute left-2 top-2.5 text-gray-400 h-4 w-4" />
              </div>
              <div className="relative w-1/2">
                <select 
                  name="stops"
                  value={searchParams.stops}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md pl-8"
                >
                  {stopsOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <Filter className="absolute left-2 top-2.5 text-gray-400 h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button 
            className="bg-teal-500 text-white px-6 py-2 rounded-md hover:bg-teal-600 transition-colors"
            onClick={handleSearch}
            disabled={loading || !searchParams.departure_id || !searchParams.arrival_id}
          >
            {loading ? 'Searching...' : 'Search Flights'}
          </button>
        </div>
      </div>
      
      {/* Calendar View */}
      <div className="container mx-auto p-4 bg-white shadow-md rounded-md mt-4 flex-grow">
        <div className="flex justify-between items-center mb-4">
          <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <h2 className="text-xl font-semibold">
            {monthNames[searchParams.month]} {searchParams.year}
          </h2>
          
          <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-medium p-2">
              {day}
            </div>
          ))}
          
          {calendarData.map((dayData, index) => (
            <div 
              key={index} 
              className={`
                p-2 border rounded-md 
                ${dayData.empty ? 'bg-gray-50' : 'hover:border-teal-500 cursor-pointer relative'}
                ${selectedDate === dayData.day ? 'border-teal-500 bg-teal-50' : ''}
              `}
              onClick={() => !dayData.empty && setSelectedDate(dayData.day)}
              onMouseEnter={() => !dayData.empty && setHoveredDate(dayData)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              {!dayData.empty && (
                <>
                  <div className="text-right text-sm">{dayData.day}</div>
                  {dayData.price && (
                    <div className="mt-2 text-center">
                      <span className="text-sm font-medium text-teal-600">{formatPrice(dayData.price)}</span>
                    </div>
                  )}
                </>
              )}
              
              {/* Hover modal */}
              {hoveredDate === dayData && (
                <div className="absolute z-10 w-72 bg-white border rounded-md shadow-lg p-3 top-full left-0">
                  <div className="font-semibold border-b pb-2 mb-2">
                    {searchParams.departure_id || 'Origin'} → {searchParams.arrival_id || 'Destination'}
                  </div>
                  <div className="mb-2 text-sm text-gray-600">
                    {new Date(dayData.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex justify-between mb-3">
                    <div className="flex items-center">
                      <Plane className="h-4 w-4 mr-1 text-gray-500" />
                      <span className="text-sm">{dayData.flightData.airline}</span>
                    </div>
                    <div className="text-sm font-medium text-teal-600">{formatPrice(dayData.price)}</div>
                  </div>
                  <div className="flex justify-between mb-2">
                    <div>
                      <div className="text-lg font-semibold">{dayData.flightData.departureTime}</div>
                      <div className="text-xs text-gray-500">{searchParams.departure_id || 'Origin'}</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-xs text-gray-500">{dayData.flightData.duration}</div>
                      <div className="border-t border-gray-300 w-16 my-1"></div>
                      <div className="text-xs text-gray-500">
                        {dayData.flightData.stops === 0 
                          ? 'Nonstop' 
                          : `${dayData.flightData.stops} ${dayData.flightData.stops === 1 ? 'stop' : 'stops'}`}
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{dayData.flightData.arrivalTime}</div>
                      <div className="text-xs text-gray-500">{searchParams.arrival_id || 'Destination'}</div>
                    </div>
                  </div>
                  <button className="w-full bg-teal-500 text-white py-1 rounded-md mt-2 text-sm">
                    Select this flight
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="mt-6 border-t pt-4">
          <div className="flex items-center justify-center space-x-4 text-sm">
            <span className="flex items-center">
              <span className="h-3 w-3 bg-teal-50 border border-teal-500 rounded-sm inline-block mr-1"></span>
              Selected Date
            </span>
            <span className="flex items-center">
              <span className="h-3 w-3 bg-white border rounded-sm inline-block mr-1"></span>
              Available Date
            </span>
            <span className="flex items-center">
              <span className="h-3 w-3 bg-gray-50 border rounded-sm inline-block mr-1"></span>
              Unavailable
            </span>
          </div>
          <div className="text-center text-sm text-gray-500 mt-2">
            All prices are shown in {getCurrencySymbol()}{searchParams.currency} and are subject to change
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightCalendarSearch;
