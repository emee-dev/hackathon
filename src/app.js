const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { useTreblle } = require('treblle');

const compression = require('compression');
const helmet = require('helmet');
const Routes = require('./routes/route');

const {
  corsOriginMiddleware,
  allowedMethodsMiddleware,
  generalRateLimiter,
} = require('./middleware/middleware');

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          'http://localhost:7000',
          process.env.ALLOWED_ORIGIN,
        ],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  }),
);

// Set the X-Frame-Options header to DENY to prevent all framing
app.use(helmet.frameguard({ action: 'deny' }));

app.use(compression());

app.use(
  cors({
    origin: [process.env.ALLOWED_ORIGIN, 'http://localhost:7000'],
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
    exposedHeaders: ['Content-Length', 'X-Request-ID'], // Specify exposed headers
    maxAge: 86400, // Set the Access-Control-Max-Age header for caching CORS options (in seconds)
  }),
);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(allowedMethodsMiddleware);
app.use(corsOriginMiddleware);
app.use(generalRateLimiter);

useTreblle(app, {
  apiKey: process.env.TREBLLE_API_KEY,
  projectId: process.env.TREBLLE_PROJECT_ID,
});

app.get('/', (req, res) => {
  res
    .status(200)
    .header('Content-Type', 'application/json')
    .json({ success: true, message: 'This app is live and well', data: null });
});

app.use('/api/v1/', Routes);

// Catch-all route for handling unsupported methods
app.all('*', (req, res) => {
  return res.status(405).header('Content-Type', 'application/json').send({
    success: false,
    message: 'Method Not Allowed',
    data: null,
  });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).header('Content-Type', 'application/json').json({
    success: false,
    message: 'Something went wrong.',
    data: null,
  });
});

module.exports = app;
