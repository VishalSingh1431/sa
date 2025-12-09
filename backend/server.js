import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import compression from 'compression';
import morgan from 'morgan';
import { initializeDatabase } from './config/database.js';
import { validateEnv } from './middleware/validateEnv.js';
import { securityMiddleware } from './middleware/security.js';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import tripsRoutes from './routes/trips.js';
import enquiriesRoutes from './routes/enquiries.js';
import certificatesRoutes from './routes/certificates.js';
import destinationsRoutes from './routes/destinations.js';
import reviewsRoutes from './routes/reviews.js';
import writtenReviewsRoutes from './routes/writtenReviews.js';

// Load .env from backend directory (works even when run from different directory)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

// Validate environment variables
validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Trust proxy - Required when behind Nginx reverse proxy
app.set('trust proxy', 1);

// Initialize PostgreSQL database (non-blocking)
initializeDatabase()
  .then(() => {
    console.log('✅ Database initialized successfully');
  })
  .catch((error) => {
    console.error('❌ Database initialization error:', error.message);
    console.warn('⚠️  Server will continue running, but database features may not work');
    console.warn('⚠️  Please check your DATABASE_URL in .env file');
  });

// Security middleware
app.use(securityMiddleware);

// Compression middleware (gzip)
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: NODE_ENV === 'production' 
    ? (process.env.FRONTEND_URL 
        ? [process.env.FRONTEND_URL] 
        : ['https://varanasihub.com', 'https://www.varanasihub.com'])
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Request logging
if (NODE_ENV === 'production') {
  app.use(morgan('combined')); // Apache combined log format
} else {
  app.use(morgan('dev')); // Colored output for development
}

// Body parsing middleware - increased limits for large file uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const pool = (await import('./config/database.js')).default;
    await pool.query('SELECT 1');
    res.json({ 
      status: 'OK', 
      message: 'VaranasiHub API is running',
      database: 'connected',
    });
  } catch (error) {
    res.json({ 
      status: 'OK', 
      message: 'VaranasiHub API is running',
      database: 'disconnected',
      error: process.env.NODE_ENV === 'development' ? {
        code: error.code,
        message: error.message,
      } : undefined,
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/enquiries', enquiriesRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/destinations', destinationsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/written-reviews', writtenReviewsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  });
});

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });
  
  const statusCode = err.statusCode || err.status || 500;
  const isDevelopment = NODE_ENV === 'development';
  
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    ...(isDevelopment && { 
      stack: err.stack,
      path: req.path,
    }),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Environment: ${NODE_ENV}`);
  console.log(`📝 Database: PostgreSQL (Aiven)`);
  const apiUrl = NODE_ENV === 'production' 
    ? `https://${process.env.BASE_DOMAIN || 'varanasihub.com'}/api`
    : `http://localhost:${PORT}/api`;
  console.log(`🌐 API Base URL: ${apiUrl}`);
  if (NODE_ENV === 'production') {
    console.log(`🔒 Security: Enabled (Helmet)`);
    console.log(`📊 Logging: Enabled (Morgan)`);
  }
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.error(`   Please stop the process using port ${PORT} or change the PORT in .env`);
    console.error(`   To find and kill the process: Get-NetTCPConnection -LocalPort ${PORT} | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
    process.exit(1);
  }
});
