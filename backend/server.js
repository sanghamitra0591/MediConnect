const app = require('./app');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const PORT = process.env.PORT || 5001;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});

// Attach io to app for access in controllers
app.set('io', io);
// Make io available globally
global.io = io;

io.on('connection', (socket) => {
  console.log(`New client connected with ID: ${socket.id}`);
  
  // Log total number of connected clients
  const connectedClients = io.sockets.sockets.size;
  console.log(`Total connected clients: ${connectedClients}`);
  
  // Test emitting a doctor status update to verify socket is working
  console.log('Emitting test doctorStatus event to verify socket functionality');
  socket.emit('doctorStatus', { 
    doctorId: 'test-doctor-id', 
    isOnline: true, 
    status: 'available',
    message: 'This is a test event to verify socket functionality'
  });
  
  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected with ID: ${socket.id}, reason: ${reason}`);
    console.log(`Remaining connected clients: ${io.sockets.sockets.size}`);
  });
  
  // Add error handling for socket
  socket.on('error', (error) => {
    console.error(`Socket error for client ${socket.id}:`, error);
  });
});

// Add a function to emit doctor status updates with logging
global.emitDoctorStatus = (doctorId, isOnline, status) => {
  console.log(`Emitting doctorStatus event: doctorId=${doctorId}, isOnline=${isOnline}, status=${status}`);
  io.emit('doctorStatus', { doctorId, isOnline, status });
  
  // Log the number of clients that should receive this event
  console.log(`Event sent to ${io.sockets.sockets.size} connected clients`);
};

// Connect to MongoDB
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
