const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderName: {
    type: String,
    required: true,
  },
  orderPrice: {
    type: Number,
    required: true,
  },
  orderCreatedAt: {
    type: Date,
    default: Date.now,
  },
  orderDeadlineAt: {
    type: Date,
    required: true,
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;