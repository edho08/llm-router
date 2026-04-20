import 'reflect-metadata';
import express from 'express';
import path from 'path';
import { AppDataSource } from './database';
import providerRoutes from './routes/providerRoutes';
import proxyRoutes from './routes/proxyRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Database
AppDataSource.initialize()
  .then(() => {
    console.log('Database initialized');
  })
  .catch((error) => console.log('Database initialization failed', error));

app.use(express.json({ limit: '50mb' }));

// OpenAI Proxy Routes
app.use('/v1', proxyRoutes);

// Routes
app.use('/api', providerRoutes);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../../client/dist')));

// Catch-all route for React SPA
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/v1')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
