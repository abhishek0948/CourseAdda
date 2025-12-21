import express, { Application } from 'express';
import cors from 'cors';
import config from './config';
import { errorHandler, notFoundHandler } from './middleware/error';

import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import courseRoutes from './routes/course.routes';
import studentRoutes from './routes/student.routes';
import certificateRoutes from './routes/certificate.routes';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/certificates', certificateRoutes);

app.use('/api/progress', studentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
