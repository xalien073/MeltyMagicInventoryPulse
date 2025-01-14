// server.js

const WebSocketServer = require('websocket').server;
const http = require('http');

// Create HTTP Server
const server = http.createServer((request, response) => {
  if (request.method === 'POST' && request.url === '/event-handler') {
    console.log('Event from Event Grid!');
    let body = '';

    // Parse the Event Grid notification
    request.on('data', (chunk) => {
      body += chunk;
    });

    request.on('end', async () => {
      
      try {
        const events = JSON.parse(body);

        // Handle Event Grid subscription validation event
        if (events && events[0]?.eventType === 'Microsoft.EventGrid.SubscriptionValidationEvent') {
          console.log("Processing subscription validation event");
          const validationCode = events[0]?.data?.validationCode;
          response.writeHead(200, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({ validationResponse: validationCode }));
          return;
        }

        // Log Event Grid notifications
        console.log("Received Event Grid notification:", events);

        // Broadcast received events to WebSocket clients
        const message = JSON.stringify(events); // Serialize event data as a JSON string
        clients.forEach(client => {
          if (client.readyState === client.OPEN) {  // Ensure the client is open
            try {
              client.sendUTF(message);
              console.log('Message sent to client');
            } catch (error) {
              console.error("Error broadcasting to client:", error);
            }
          }
        });

        // Respond to Event Grid
        response.writeHead(200);
        response.end("Event received and broadcasted");
      } catch (error) {
        console.error("Error processing event:", error);
        response.writeHead(500, { 'Content-Type': 'text/plain' });
        response.end("Error processing event: " + error.message);
      }
    });
  } else {
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.end("Not Found");
  }
});

// server.listen(8080, () => {
//   console.log('WebSocket Server is listening on port 8080');
// });

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`WebSocket Server is listening on port ${port}`);
});

// Initialize WebSocket server
const wsServer = new WebSocketServer({ httpServer: server });
let clients = [];

// WebSocket server logic
wsServer.on('request', (request) => {
  const connection = request.accept(null, request.origin);
  clients.push(connection);
  console.log('Client connected');

  connection.on('close', () => {
    // Remove client from the list when they disconnect
    clients = clients.filter(c => c !== connection);
    console.log('Client disconnected');
  });

  connection.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});



// // products-socket-server.js

// const WebSocketServer = require('websocket').server;
// const http = require('http');

// // Create HTTP Server
// const server = http.createServer((request, response) => {
//   if (request.method === 'POST' && request.url === '/event-handler') {
//     let body = '';

//     // Parse the Event Grid notification
//     request.on('data', (chunk) => {
//       body += chunk;
//     });

//     request.on('end', async () => {
//       console.log('Working!');
//       try {
//         const events = JSON.parse(body);

//         // Handle Event Grid subscription validation event
//         if (events[0]?.eventType === 'Microsoft.EventGrid.SubscriptionValidationEvent') {
//           console.log("Processing subscription validation event");
//           const validationCode = events[0]?.data?.validationCode;
//           response.writeHead(200, { 'Content-Type': 'application/json' });
//           response.end(JSON.stringify({ validationResponse: validationCode }));
//           return;
//         }

//         // Log Event Grid notifications
//         console.log("Received Event Grid notification:", events);

//         // Broadcast received events to WebSocket clients
//         const message = JSON.stringify(events); // Serialize event data as a JSON string
//         clients.forEach(client => {
//           try {
//             client.sendUTF(message);
//             console.log('Message sent!');
//           } catch (error) {
//             console.error("Error broadcasting to client:", error);
//           }
//         });

//         // Respond to Event Grid
//         response.writeHead(200);
//         response.end("Event received and broadcasted");
//       } catch (error) {
//         console.error("Error processing event:", error);
//         response.writeHead(500);
//         response.end("Error processing event");
//       }
//     });
//   } else {
//     response.writeHead(404);
//     response.end();
//   }
// });

// server.listen(8080, () => {
//   console.log('WebSocket Server is listening on port 8080');
// });

// // Initialize WebSocket server
// const wsServer = new WebSocketServer({ httpServer: server });
// let clients = [];

// // WebSocket server logic
// wsServer.on('request', (request) => {
//   const connection = request.accept(null, request.origin);
//   clients.push(connection);
//   console.log('Client connected');

//   connection.on('close', () => {
//     clients = clients.filter(c => c !== connection);
//     console.log('Client disconnected');
//   });
// });
