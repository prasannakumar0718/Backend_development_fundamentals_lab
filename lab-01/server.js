// Lab 01: Express Server
// A lightweight web server built with Express.js

// 1. Import the Express framework
const express = require('express');

// 2. Initialize the Express application
const app = express();

// 3. Define the port
// Supports process.env.PORT for cloud deployment platforms (e.g., Render, Railway)
// and defaults to port 3000 for local development
const PORT = process.env.PORT || 3000;

// ==========================================
// ROUTES
// ==========================================

// Route 1: Home route (GET /)
// Returns a welcome message with status code 200
app.get('/', (req, res) => {
  res.status(200).send('Welcome to my Node.js server!');
});

// Route 2: About route (GET /about)
// Returns personal details in JSON format with status code 200
// Note: Placeholders are provided below - update with your actual details
app.get('/about', (req, res) => {
  res.status(200).json({
    name: 'Myadaboina Prasanna Kumar',
    registrationNumber: '252U1R9103',
    section: 'GENAI-2B'
  });
});

// Route 3: Time route (GET /time)
// Returns current date and time using new Date() with status code 200
app.get('/time', (req, res) => {
  res.status(200).send(new Date().toString());
});

// Route 4: Catch-all handler for unknown routes
// Placed after all valid routes so any unhandled URL receives a 404 status
app.use((req, res) => {
  res.status(404).send('404 - Page not found');
});

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/`);
});
