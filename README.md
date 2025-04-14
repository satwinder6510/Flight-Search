# Flight Search Application

A React-based flight search application that uses the SerpAPI to fetch flight information from Google Flights.

## Features

- Search for flights between airports
- View flight prices in a calendar view
- Filter by travel class, number of stops, and more
- Real-time flight data from Google Flights

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- A SerpAPI key (get one from [serpapi.com](https://serpapi.com))

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd flight-search
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your SerpAPI key:
```
REACT_APP_SERPAPI_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm start
```

The application will run on http://localhost:3001

## Usage

1. Enter departure and arrival airport codes (e.g., JFK, LAX)
2. Select travel dates
3. Choose number of passengers and travel class
4. Click "Search" to view flight options

## Environment Variables

- `REACT_APP_SERPAPI_KEY`: Your SerpAPI key for accessing flight data

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 