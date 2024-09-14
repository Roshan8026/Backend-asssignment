const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const cors = require('cors'); // Import the cors package

require('dotenv').config();

// Enable CORS for all routes
app.use(cors());

// OR you can configure it like this if you want to specify a domain (frontend URL)
app.use(cors({
  origin: 'http://localhost:3000',  // Replace with your frontend's URL
  methods: 'GET,POST,PUT,DELETE',   // Allowed HTTP methods
  credentials: true                 // Allow credentials (cookies, etc.)
}));

app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
