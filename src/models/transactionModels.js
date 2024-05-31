const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  grossAmount: {
    type: Number,
    required: true
  },
  /*
    Match with response from Midtrans API
  */
  transactionTime: {
    type: String,
    default: "0000-00-00 00:00:00",
    required: true
  },
  paymentType: {
    type: String,
    default: "qris",
    required: true
  },
  transactionStatus: {
    type: String,
    default: "pending",
    required: true
  },
  transactionQr: {
    type: String,
    default: " ",
    required: true
  }
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
