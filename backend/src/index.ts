import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import connectDB from './utils/db';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import notificationRoutes from './routes/notification.routes';

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

import SocketService from './socket';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);

// Socket.io
SocketService.init(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
