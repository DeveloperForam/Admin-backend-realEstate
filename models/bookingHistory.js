const mongoose = require("mongoose");

const BookingHistorySchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    customerName: {
      type: String,
      required: true,
    },

    houseNumber: {
      type: String,
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    advancePayment: {
      type: Number,
      required: true,
    },

    amountReceived: {
      type: Number,
      required: true,
    },

    pendingAmount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },

    paymentReceivedDate: {
      type: Date,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "bank", "cheque", "card"],
      required: true,
    },

    transactionDetails: {
      upiId: String,
      bankName: String,
      chequeNumber: String,
      cardLast4: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BookingHistory", BookingHistorySchema);
