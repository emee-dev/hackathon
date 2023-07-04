const bcrypt = require('bcrypt');
const User = require('../model/index');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const createError = require('http-errors');
const Joi = require('joi');

const is_required = (req, res, next) => {
  try {
    const headers =
      req.headers['Authorization'] || req.headers['authorization'];
    const cookie = req.cookies;

    if (!cookie || !headers) {
      return res.status(403).json(createError(401, 'Unauthorized'));
    }
    const token = headers.split(' ')[1];
    req.payload = token;

    next();
  } catch (error) {
    throw new Error(error);
  }
};

exports.hashpassword = async (string) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const compare = await bcrypt.hash(string, salt);
    return compare;
  } catch (error) {
    throw new Error(error);
  }
};

exports.comparePassword = async (string, encrypted) => {
  try {
    const compare = await bcrypt.compare(string, encrypted);
    return compare;
  } catch (error) {
    throw new Error(error);
  }
};

exports.generalRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hr
  max: 100, // Limit each IP to 100 requests per `window` (here, per 1 hour)
  message: 'Too many requests from this IP, please try again after an hour',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: true, // Disable the `X-RateLimit-*` headers
});

exports.signAccessToken = (payload) => {
  return new Promise((resolve, reject) => {
    const payload = {};
    const secret = process.env.ACCESS_TOKEN_SECRET;

    const options = {
      expiresIn: '15s',
      issuer: 'localhost',
    };

    jwt.sign(payload, secret, options, (err, token) => {
      if (err) {
        console.log(err.message);
        reject();
      }

      return resolve(token);
    });
  });
};

exports.verifyAccessToken = (token) => {
  return new Promise((resolve, reject) => {
    const secret = process.env.ACCESS_TOKEN_SECRET;

    jwt.sign(token, secret, (err, token) => {
      if (err) {
        console.log(err.message);
        reject();
      }

      return resolve(token);
    });
  });
};

exports.sanitizeRequest = async (payload, schema) => {
  try {
    let options = {
      abortEarly: false,
    };

    const check = await schema.validateAsync(payload, options);

    return [null, check];
  } catch (error) {
    return [error];
  }
};

exports.isAdmin = (req, res, next) => {};
