const cors = require('cors');
const express = require('express');
const session = require('express-session');
const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');
const { migrate } = require('./db/migrate');

// Initialize express app
const app = express();

// Trust proxy (needed if running behind reverse proxy, and for secure cookies with HTTPS termination)
app.set('trust proxy', true);

// CORS: allow frontend origin and enable credentials so cookies can be sent.
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse JSON request body
app.use(express.json());

// Sessions (server-side). Uses MemoryStore by default (OK for dev). For production, use a shared store.
const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
  // Fail fast to avoid accidentally deploying with insecure sessions.
  throw new Error('SESSION_SECRET is required.');
}
app.use(session({
  name: 'sid',
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // set true when behind HTTPS; kept false for local dev
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
}));

// Swagger docs with dynamic server URL so the UI works behind different hosts/ports.
app.use('/docs', swaggerUi.serve, (req, res, next) => {
  const host = req.get('host'); // may or may not include port
  let protocol = req.protocol;

  const actualPort = req.socket.localPort;
  const hasPort = host.includes(':');

  const needsPort =
    !hasPort &&
    ((protocol === 'http' && actualPort !== 80) ||
     (protocol === 'https' && actualPort !== 443));
  const fullHost = needsPort ? `${host}:${actualPort}` : host;
  protocol = req.secure ? 'https' : protocol;

  const dynamicSpec = {
    ...swaggerSpec,
    servers: [
      {
        url: `${protocol}://${fullHost}`,
      },
    ],
  };
  swaggerUi.setup(dynamicSpec)(req, res, next);
});

// Ensure DB schema exists on first request (lazy). Avoid blocking module import in some runtimes.
let didMigrate = false;
app.use(async (req, res, next) => {
  try {
    if (!didMigrate) {
      await migrate();
      didMigrate = true;
    }
    return next();
  } catch (err) {
    return next(err);
  }
});

// Mount routes
app.use('/', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : (err.message || 'Error');

  // Log internal errors for debugging
  if (statusCode === 500) {
    console.error(err.stack || err);
  }

  res.status(statusCode).json({
    status: 'error',
    message,
  });
});

module.exports = app;
