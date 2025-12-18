import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

class SocketService {
  private io: Server | null = null;

  init(httpServer: HttpServer, options: any) {
    this.io = new Server(httpServer, options);
    
    this.io.on('connection', (socket: Socket) => {
      console.log('New client connected:', socket.id);

      socket.on('join:user', (userId: string) => {
        socket.join(userId);
        console.log(`Socket ${socket.id} joined room ${userId}`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  getIO(): Server {
    if (!this.io) {
      throw new Error('Socket.io not initialized!');
    }
    return this.io;
  }
}

export default new SocketService();
