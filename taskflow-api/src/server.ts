import 'dotenv/config';
import express, { Request, Response } from 'express';
import connectDB from './config/database';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.route';
import boardRoutes from './routes/board.route';
import invitationRoutes from './routes/invitation.route';
import notificationRoutes from './routes/notification.route';

connectDB();

const app = express();
const PORT = process.env.PORT || 8080;

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// ĐỊNH TUYẾN API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/boards', boardRoutes);
app.use('/api/v1/invitations', invitationRoutes);
app.use('/api/v1/notifications', notificationRoutes);

const httpServer = createServer(app);

// KHỞI TẠO SOCKET.IO
const io = new Server(httpServer, {
  cors: corsOptions,
});

io.on('connection', (socket) => {
  console.log(`Một client đã kết nối: ${socket.id}`);

  socket.on('join_board', (boardId: string) => {
    socket.join(boardId);
    console.log(`Client ${socket.id} đã tham gia vào phòng: ${boardId}`);
  });

  socket.on('leave_board', (boardId: string) => {
    socket.leave(boardId);
    console.log(`Client ${socket.id} đã rời phòng: ${boardId}`);
  });

  socket.on('join_user', (userId: string) => {
    const userRoom = `user:${userId}`;
    socket.join(userRoom);
    console.log(
      `Client ${socket.id} đã tham gia nhận thông báo cá nhân: ${userRoom}`,
    );
  });

  socket.on('leave_user', (userId: string) => {
    const userRoom = `user:${userId}`;
    socket.leave(userRoom);
    console.log(
      `Client ${socket.id} đã rời nhận thông báo cá nhân: ${userRoom}`,
    );
  });

  socket.on('disconnect', () => {
    console.log(`Client đã ngắt kết nối: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(
    `Server (Express + Socket.IO) đang lắng nghe tại http://localhost:${PORT}`,
  );
});

export { io };
