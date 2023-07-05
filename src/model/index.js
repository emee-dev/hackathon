const mongoose = require('mongoose');
let defaultRole = process.env.CLIENT_ROLE;

if (!defaultRole) {
  throw new Error('Default role is empty');
}

const entitySchema = new mongoose.Schema({
  firstname: {
    type: String,
    trim: true,
    lowercase: true,
  },
  lastname: {
    type: String,
    trim: true,
    lowercase: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
  },
  password: {
    type: String,
    trim: true,
    required: true,
  },
  role: {
    type: String,
    default: defaultRole,
  },
  refreshToken: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const User = mongoose.model('user', entitySchema);
module.exports = User;
