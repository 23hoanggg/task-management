import 'dotenv/config';
import express, { Request, Response } from 'express';
import connectDB from './config/database';
import authRoutes from './routes/auth.route';
import cookieParser from 'cookie-parser';

connectDB();

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cookieParser());

app.get('/', (req: Request, res: Response) => {
  res.send('TaskFlow API is running!');
});

app.use('/api/v1/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://localhost:${PORT}`);
});
