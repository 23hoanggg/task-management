import 'dotenv/config';
import express, { Request, Response } from 'express';
import connectDB from './config/database';
import authRoutes from './routes/auth.route';
import boardRoutes from './routes/board.route';
import taskRoutes from './routes/task.route';
import cookieParser from 'cookie-parser';
import listRoutes from './routes/list.route';
import cors from 'cors';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';

connectDB();

const app = express();
const PORT = process.env.PORT || 8080;

const corsOptions = {
  origin: 'http://localhost:5173', // Đảm bảo frontend của bạn ở đây
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Định tuyến API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/boards', boardRoutes);
app.use('/api/v1/lists', listRoutes);
app.use('/api/v1/tasks', taskRoutes);

// --- 3. TẠO HTTP SERVER VÀ GẮN EXPRESS VÀO NÓ ---
const httpServer = createServer(app);

// --- 4. KHỞI TẠO SOCKET.IO SERVER ---
const io = new Server(httpServer, {
  cors: corsOptions, // Áp dụng CORS cho Socket.IO
});

// --- 5. VIẾT LOGIC CHO SOCKET.IO ---
io.on('connection', (socket) => {
  console.log(`🔌 Một client đã kết nối: ${socket.id}`);

  // Lắng nghe sự kiện khi client muốn "tham gia" một board
  socket.on('join_board', (boardId: string) => {
    socket.join(boardId);
    console.log(`Client ${socket.id} đã tham gia vào phòng: ${boardId}`);
  });

  // Lắng nghe sự kiện khi client "rời" một board
  socket.on('leave_board', (boardId: string) => {
    socket.leave(boardId);
    console.log(`Client ${socket.id} đã rời phòng: ${boardId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client đã ngắt kết nối: ${socket.id}`);
  });
});

// 6. KHỞI ĐỘNG SERVER BẰNG httpServer THAY VÌ app
httpServer.listen(PORT, () => {
  console.log(
    `🚀 Server (Express + Socket.IO) đang lắng nghe tại http://localhost:${PORT}`,
  );
});

// Cung cấp `io` cho các phần khác của ứng dụng
// Đây là một cách đơn giản, các dự án lớn có thể dùng Dependency Injection
export { io };
