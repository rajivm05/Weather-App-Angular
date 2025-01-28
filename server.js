const express = require('express');
const cors = require('cors');
const app = express();
const axios = require('axios');
const { MongoClient, ServerApiVersion } = require('mongodb');

const DB_PASSWORD = 'mongousc2024' 
const GEOCODING_KEY = 'AIzaSyDjKxdklB2CVPqND2bep5I2xfmuLkUFE1E';
const WEATHER_KEY = 'RqRlSjWkYhLPg6XPPpwb28pnvOQDAVWZ';

// app.use(cors());
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization', 'authorization'], // Specify allowed headers
}));
app.use(express.json());

const uri = "mongodb+srv://rajivmur:"+DB_PASSWORD+"@cluster0.dhsdh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req, res) => {
  // res.send('Hello from App Engine!');
  console.log(req.headers);
  res.json({ message: 'Hello from App Engine!' });
});


// Middleware to check for authorization token
function verifyToken(req, res, next) {
  
  // Get the token from the headers
  const authHeader = req.headers['authorization'];
  
  // Check if the authorization header is present
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  // Extract the token from the header (e.g., "Bearer <token>")
  const token = authHeader.split(' ')[1]; 

  if (token === '123456') { 
    next(); 
  } else {
    return res.status(403).json({ message: 'Invalid token' });
  }
}

// Apply the middleware to protect routes
app.get('/getGeolocation', verifyToken, async (req, res) => {

  try {
    const { street, city, state } = req.query;

    if (!street || !city || !state) {
      return res.status(400).json({ error: "Missing required query parameters" });
    }

    // Format the address for the API request
    const formattedAddress = `${street.split(' ').join('+')}+${city.split(' ').join('+')}+${state.split(' ').join('+')}`;
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${formattedAddress}&key=${GEOCODING_KEY}`;

    // Make the API request
    const response = await axios.get(apiUrl);

    if (response.status === 200) {
      // Return the data from the Google API
      return res.json(response.data);
    } else {
      return res.status(500).json({ error: "Unable to fetch data from the API." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred while fetching data." });
  }
});
app.get('/weatherHook', async (req, res) => {
  // climacellDocs.auth('RqRlSjWkYhLPg6XPPpwb28pnvOQDAVWZ');
  const url = "https://api.tomorrow.io/v4/timelines?apikey=" + WEATHER_KEY;

  const payload = {
    location: '42.3478, -71.0466',
    fields: ["temperature", "humidity", "pressureSurfaceLevel", 
      "windSpeed", "visibility", "cloudCover", "uvIndex", 
      "weatherCode", "sunriseTime", "sunsetTime", 
      "precipitationProbability", "precipitationType","windDirection", "temperatureApparent"],
    units: 'imperial',
    timesteps: ['1d', '1h'],
    startTime: 'now',
    endTime: 'nowPlus5d',
    timezone: "US/Pacific"
  };

  // Define headers
  const headers = {
    "accept": "application/json",
    "Accept-Encoding": "gzip",
    "content-type": "application/json"
  };

  try {
    // Make the POST request with axios
    const response = await axios.post(url, payload, { headers });
    // Send the API response back to the client
    res.json(response.data);
  } 
  catch (error) {
    console.error('Error fetching weather data:', error.message);
    res.status(500).json({ error: "Unable to fetch data from the API." });
  }

});

async function insert(client, data) {
  const result = await client.db("weather-favorites").collection("weather-app").insertOne(data);
  console.log(`data added with the following id: ${result.insertedId}`);
}
async function deleteData(client, lat, lng) {
  const result = await client.db("weather-favorites").collection("weather-app").deleteOne({lat: lat, lng:lng});
  if (result.deletedCount === 1) {
    console.log(`Successfully deleted data with ${lat}, ${lng}`);
  }
  else if(result.deletedCount >1){  
    console.log(`Successfully deleted ${result.deletedCount} counts of data with ${lat}, ${lng}`);
  }
   else {
    console.log(`No data found with ${lat}, ${lng}`);
  }
}

app.post('/addData', verifyToken, async (req, res) => {
  const lat = req.body.lat;
  const lng = req.body.lng;
  const formattedAddress = req.body.formattedAddress;
  const rawData = req.body.rawData;
  const city = req.body.city;
  const state = req.body.state;

  data = {lat: lat, lng: lng, formattedAddress: formattedAddress, rawData: rawData, city:city, state:state};
  insert(client, data);
  res.json({ status:200 });
});


app.post('/removeData', verifyToken, async (req, res) => {
  const lat = req.body.lat;
  const lng = req.body.lng;
  // const formattedAddress = req.body.formattedAddress;
  // const rawData = req.body.rawData;
  // data = {lat: lat, lng: lng, formattedAddress: formattedAddress, rawData: rawData};
  deleteData(client, lat, lng);
  res.json({ status:200 });
});

app.get('/fetchData', verifyToken, async (req, res) => {
  const result = await client.db("weather-favorites").collection("weather-app").find({}).toArray();
  // console.log(result);
  res.json({result:result});
});

app.get('/weatherAPI', verifyToken, async (req, res) => {
  const url = "https://api.tomorrow.io/v4/timelines?apikey=" + WEATHER_KEY;
  const { lat, lng, formattedAddress } = req.query;
  console.log(lat, lng);
  const payload = {
    location: `${lat}, ${lng}`,
    fields: ["temperature", "humidity", "pressureSurfaceLevel", 
      "windSpeed", "visibility", "cloudCover", "uvIndex", 
      "weatherCode", "sunriseTime", "sunsetTime", 
      "precipitationProbability", "precipitationType","windDirection", "temperatureApparent"],
    units: 'imperial',
    timesteps: ['1d', '1h'],
    startTime: 'now',
    endTime: 'nowPlus5d',
    timezone: "US/Pacific"
  };
  
  // Define headers
  const headers = {
    "accept": "application/json",
    "Accept-Encoding": "gzip",
    "content-type": "application/json"
  };
  try {
    // Make the POST request with axios
    const response = await axios.post(url, payload, { headers });
    // Send the API response back to the client
    res.json({
      lat: lat,
      lng: lng,
      formattedAddress: formattedAddress,
      weatherData : response.data
    });
  } 
  catch (error) {
    console.error('Error fetching weather data:', error.message);
    res.status(500).json({ error: "Unable to fetch data from the API." });
  }
});

// Start the server
const PORT = 8080;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  run().catch(console.dir);

});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}


process.on('SIGINT', async () => {
  console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");
  await client.close();
  console.log("MongoDB connection closed");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log("\nGracefully shutting down from SIGTERM");
  await client.close();
  console.log("MongoDB connection closed");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});



