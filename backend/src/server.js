import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import briefingRoutes from './routes/briefing.js';
import companyRoutes from './routes/companies.js';
import trendRoutes from './routes/trends.js';
import worldRoutes from './routes/world.js';
import opportunityRoutes from './routes/opportunities.js';
import worldIntelRoutes from './routes/worldIntel.js';
import reportRoutes from './routes/reports.js';
import simulationRoutes from './routes/simulations.js';
import watchlistRoutes from './routes/watchlist.js';
import graphRoutes from './routes/knowledgeGraph.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import { setSocketIO, startPulse } from './services/realtimeService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// HTTP server (needed to attach socket.io)
const httpServer = http.createServer(app);

// Socket.io setup
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Make io accessible to services
setSocketIO(io);

// Connection tracking
let connectedClients = 0;
io.on('connection', (socket) => {
  connectedClients++;
  console.log(`⚡ Client connected. Total: ${connectedClients}`);

  socket.emit('connected', { message: 'Connected to AERTH real-time stream' });

  socket.on('disconnect', () => {
    connectedClients--;
    console.log(`⚡ Client disconnected. Total: ${connectedClients}`);
  });
});

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/briefing', briefingRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/trends', trendRoutes);
app.use('/api/world', worldRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/world-intel', worldIntelRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), connectedClients });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✓ MongoDB connected');
    httpServer.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`⚡ WebSocket ready`);
      // Start the simulated pulse (broadcasts signals for demo)
      startPulse();
    });
  })
  .catch((error) => {
    console.error('MongoDB failed:', error.message);
    httpServer.listen(PORT, () => {
      console.log(`⚠ Server running on port ${PORT} (no database)`);
    });
  });