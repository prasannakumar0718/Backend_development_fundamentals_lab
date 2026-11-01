// Lab 01: Native Node.js HTTP Server
// Simple HTTP server built using Node's native 'http' module

// 1. Import the built-in HTTP module
const http = require('http');

// 2. Define the port number
const PORT = 3000;

// 3. Create the HTTP server
// The callback function handles incoming requests and outgoing responses
const server = http.createServer((req, res) => {
  // Set the HTTP response status code to 200 (OK)
  res.statusCode = 200;

  // Set the response header so the client knows it is plain text
  res.setHeader('Content-Type', 'text/plain');

  // Send the response body and complete the response
  res.end('Hello');
});

// 4. Start the server and listen for connections on port 3000
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/`);
});
