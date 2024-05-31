const Transaction = require("../models/transactionModels");
const Order = require("../models/orderModels");
const { midtransCoreApi } = require("../config/midtrans");

/*
  DESC        : Create transaction with empty payment
  PARAMS      : orderId
  METHOD      : POST
  VISIBILITY  : Private
  PRE-REQ     : -
  RESPONSE    : -
*/
exports.createTransaction = async (req, res) => {
  const { orderId } = req.body;

  Order.findById(orderId).then((order) => {
    if (!order) {
      return res.status(404).json({
        message: "Tour not found"
      });
    }

    const newTransaction = new Transaction({
      userId: req._id,
      orderId: orderId,
      grossAmount: order.orderPrice
    });

    newTransaction
      .save()
      .then((transaction) => {
        res.status(201).json({
          message: "Transaction created successfully",
          orderId: transaction._id
        });
      })
      .catch((err) => {
        return res.status(500).json({
          message: "Failed to create transaction",
          err: err
        });
      });
  });
};

/*
  DESC        : Create payment for transaction
  PARAMS      : orderId
  METHOD      : POST
  VISIBILITY  : Private
  PRE-REQ     : -
  RESPONSE    : Payment details such as QRIS code
*/
exports.createPayment = async (req, res) => {
  const { orderId } = req.body;

  Transaction.findOne({ _id: orderId }).then((transaction) => {
    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }

    const parameter = {
      payment_type: "qris",
      transaction_details: {
        order_id: transaction._id,
        gross_amount: transaction.grossAmount
      }
    };

    midtransCoreApi
      .charge(parameter)
      .then((response) => {
        transaction.transactionTime = response.transaction_time;
        transaction.transactionStatus = response.transaction_status;
        transaction.transactionQr = response.actions[0].url;
        transaction.save().then(() => {
          return res.status(200).json({
            message: "Payment created successfully",
            response: response
          });
        });
      })
      .catch((err) => {
        return res.status(500).json({
          message: "Failed to create payment",
          err: err.message
        });
      });
  });
};

/*
  DESC        : Check payment status
  PARAMS      : orderId
  METHOD      : GET
  VISIBILITY  : Private
  PRE-REQ     : -
  RESPONSE    : Payment status
*/
exports.checkPayment = async (req, res) => {
    const { orderId } = req.query;
  
    Transaction.findOne({ _id: orderId }).then((transaction) => {
      if (!transaction) {
        return res.status(404).json({
          message: "Transaction not found"
        });
      }
  
      midtransCoreApi.transaction
        .status(orderId)
        .then((response) => {
          transaction.transactionStatus = response.transaction_status;
          transaction.transactionTime = response.settlement_time;
          transaction.save().then(() => {
            if (
              response.transaction_status === "settlement" ||
              response.transaction_status === "capture"
            ) {
              return res.status(200).json({
                message: "Payment success!",
                response: response
              });
            } else {
              return res.status(402).json({
                message: "Payment pending! Please complete payment!",
                response: response
              });
            }
          });
        })
        .catch((err) => {
          return res.status(500).json({
            message: "Failed to check payment",
            err: err.message
          });
        });
    });
  };