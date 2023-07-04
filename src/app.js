const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { useTreblle } = require('treblle');

const compression = require('compression');
const helmet = require('helmet');
const Routes = require('./routes/route');

const { generalRateLimiter } = require('./helper');

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'example.com'],
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
    // origin: ['https://example.com'], // Replace with specific domains.
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
    exposedHeaders: ['Content-Length', 'X-Request-ID'], // Specify exposed headers
    maxAge: 86400, // Set the Access-Control-Max-Age header for caching CORS options (in seconds)
    //credentials: true, // Uncomment this line if you need to enable credentials (cookies, authorization headers, etc.)
  }),
);
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());

// useTreblle(app, {
//   apiKey: process.env.TREBLLE_API_KEY,
//   projectId: process.env.TREBLLE_PROJECT_ID,
// });

app.get('/', generalRateLimiter, (req, res) => {
  console.log(req.secure);
  res.send({ message: 'This is working' });
});

app.use('/api/v1/', Routes);

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Something went wrong.' });
});

module.exports = app;
