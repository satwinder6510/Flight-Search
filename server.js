const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const port = 3001; // Force port 3001

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Proxy endpoint for flight search
app.get('/api/flights', async (req, res) => {
  try {
    const { 
      engine = 'google_flights',
      departure_id,
      arrival_id,
      type = 1,
      outbound_date,
      return_date,
      adults = 1,
      children = 0,
      infants_in_seat = 0,
      infants_on_lap = 0,
      travel_class = 1,
      stops = 0,
      currency = 'USD',
      hl = 'en',
      gl = 'us',
      deep_search = true,
      sort_by = 2,
      show_hidden = true
    } = req.query;

    if (!process.env.SERPAPI_KEY) {
      throw new Error('SerpAPI key is not configured');
    }

    const response = await axios.get('https://serpapi.com/search', {
      params: {
        api_key: process.env.SERPAPI_KEY,
        engine,
        departure_id,
        arrival_id,
        type,
        outbound_date,
        return_date,
        adults,
        children,
        infants_in_seat,
        infants_on_lap,
        travel_class,
        stops,
        currency,
        hl,
        gl,
        deep_search,
        sort_by,
        show_hidden
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching flight data:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch flight data' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 