const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoutes = require('./routes/auth');
const transactionsRoutes = require('./routes/transactions');
const categoriesRoutes = require('./routes/categories');
const analyticsRoutes = require('./routes/analytics');
const usersRoutes = require('./routes/users');
const errorHandler = require('./middlewares/errorHandler');

const openapi = YAML.load(path.join(__dirname, 'openapi.yaml'));

const app = express();

// Security + parsing
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// CORS allowlist
const FRONT = process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = [
  FRONT,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return cb(null, true);

    if (allowedOrigins.includes(origin)) {
      return cb(null, true);
    }

    console.warn(`CORS blocked origin: ${origin}`);
    cb(new Error('CORS not allowed'));
  },
  credentials: true
}));

// Rate limiters
const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 50, message: 'Too many auth requests' });
const txLimiter = rateLimit({ windowMs: 60*60*1000, max: 100, message: 'Transactions rate limit exceeded' });
const analyticsLimiter = rateLimit({ windowMs: 60*60*1000, max: 50, message: 'Analytics rate limit exceeded' });

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/transactions', txLimiter, transactionsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/analytics', analyticsLimiter, analyticsRoutes);
app.use('/api/users', usersRoutes);

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));

app.get('/health', (req, res) => res.json({ ok: true }));

// error handler
app.use(errorHandler);

module.exports = app;
