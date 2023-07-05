const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  customer_email: {
    type: String,
    trim: true,
    ref: 'user',
  },
  payment_reference: {
    type: String,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    trim: true,
  },
  fees: {
    type: Number,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Transaction = mongoose.model('transaction', transactionSchema);
module.exports = Transaction;
