import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './utils/db';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';

dotenv.config();

connectDB();

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Socket.io
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join:user', (userId) => {
    socket.join(userId);
    console.log(`Socket ${socket.id} joined room ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
