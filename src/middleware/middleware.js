const axios = require('axios').default;

const NodeCache = require('node-cache');
const idempotentCache = new NodeCache({ stdTTL: 1200 }); // Cache with a time-to-live of 20 minutes
const rateLimit = require('express-rate-limit');

const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const Transaction = require('../model/transaction');

const {
  PaystackReferenceSchema,
  ObjectIdSchema,
} = require('../validation/schema');
const { verifyAccessToken, sanitizeRequest } = require('../helper/index');

const allowedOrigins = [process.env?.ALLOWED_ORIGIN, 'http://localhost:7000'];

exports.allowedMethodsMiddleware = (req, res, next) => {
  const allowedMethods = ['GET', 'POST'];

  // Check if the requested method is supported
  if (!allowedMethods.includes(req.method)) {
    return res.status(405).send({
      success: false,
      message: 'Method Not Allowed',
      data: null,
    });
  }

  res.setHeader('Allow', allowedMethods.join(', '));
  next();
};

exports.corsOriginMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  next();
};

exports.generalRateLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 50, // Limit each IP to 100 requests per `window` (here, every 30 minutes)
  message: (req, res) => {
    res.status(429).header('Content-Type', 'application/json').json({
      sucess: false,
      message: 'Too Many Requests, please try again after an hour',
      data: null,
    });
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: true,
});

exports.is_required = async (req, res, next) => {
  try {
    const headers =
      req.headers['Authorization'] || req.headers['authorization'];

    if (!headers) {
      return res.status(401).header('Content-Type', 'application/json').json({
        success: false,
        message: 'Unauthorized - Missing Authorization header',
        data: null,
      });
    }

    const [bearer, token] = headers.split(' ');

    if (bearer.toLowerCase() !== 'bearer' || !token) {
      return res.status(401).header('Content-Type', 'application/json').json({
        success: false,
        message: 'Unauthorized - Invalid or Missing Bearer Token',
        data: null,
      });
    }

    const decoded = await verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).header('Content-Type', 'application/json').json({
        success: false,
        message: 'Unauthorized - Invalid or Expired Access token',
        data: null,
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);

    return res.status(500).header('Content-Type', 'application/json').json({
      success: false,
      message: 'Internal Server Error',
      data: null,
    });
  }
};

exports.idempotentMiddleware = async (req, res, next) => {
  try {
    const uniqueRequestKey = req.params.id;
    const [notValid, idempotentKey] = await sanitizeRequest(
      uniqueRequestKey,
      ObjectIdSchema,
    );

    if (notValid) {
      return res
        .status(400)
        .header('Content-Type', 'application/json')
        .json({ success: false, message: notValid, data: null });
    }

    const cachedData = idempotentCache.get(idempotentKey);

    if (cachedData !== undefined) {
      // If the idempotent key exists in the cache, reject the request
      return res.status(409).header('Content-Type', 'application/json').json({
        success: false,
        message: 'Duplicate request. This request has already been processed.',
        data: null,
      });
    }

    idempotentCache.set(idempotentKey, idempotentKey);

    // Set the x-idempotent-status header to indicate that the request has been cached
    res.setHeader('x-idempotent-status', 'cached');

    next();
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).header('Content-Type', 'application/json').json({
      success: false,
      message: 'An unexpected error occurred. Please try again later.',
      data: null,
    });
  }
};

exports.verifyPaymentReference = async (req, res, next) => {
  try {
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    const paymentReference = req.query;

    const [isInvalid, value] = await sanitizeRequest(
      paymentReference,
      PaystackReferenceSchema,
    );

    // Validate the payment reference using validator
    if (isInvalid) {
      return res.status(400).header('Content-Type', 'application/json').json({
        success: false,
        message: isInvalid,
        data: null,
      });
    }

    const options = {
      method: 'GET',
      url: `${PAYSTACK_BASE_URL}/transaction/verify/${value.payment_reference}`,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    };

    let response;
    try {
      response = await axios.request(options);
    } catch (error) {
      return res.status(500).header('Content-Type', 'application/json').json({
        success: false,
        message:
          'An error occurred while verifying payment. Please try again later.',
        data: null,
      });
    }

    const {
      status,
      reference,
      amount,
      fees,
      customer: { email },
    } = response.data.data;

    if (status !== 'success') {
      return res.status(402).header('Content-Type', 'application/json').json({
        success: false,
        message: 'Payment is required to access this resource.',
        data: null,
      });
    }

    const paymentTransaction = new Transaction({
      customer_email: email,
      payment_reference: reference,
      amount: amount / 100,
      fees: fees / 100,
    });

    await paymentTransaction.save();
    next();
  } catch (error) {
    return res.status(500).header('Content-Type', 'application/json').json({
      success: false,
      message: 'An unexpected error occurred. Please try again later.',
      data: null,
    });
  }
};

exports.isAdmin = (req, res, next) => {
  let adminRole = process.env.ADMIN_ROLE;
  let defaultRole = process.env.CLIENT_ROLE;

  // Add ADMIN_ROLE in your production env
  // Register using an api client like Insommnia using role value as ADMIN_ROLE
  // TODO add later

  if (!adminRole && adminRole !== defaultRole) {
    return res.status(401).header('Content-Type', 'application/json').json({
      success: false,
      message: 'Unauthorized',
      data: null,
    });
  }

  next();
};
