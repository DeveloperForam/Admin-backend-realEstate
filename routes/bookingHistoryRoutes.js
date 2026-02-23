const express = require("express");
const router = express.Router();
const bookingHistoryController = require("../controllers/bookingHistoryController");

// Add Payment
router.post("/add", bookingHistoryController.addPayment);

// Get Payment History by Booking ID
router.get("/:bookingId", bookingHistoryController.getBookingHistory);

module.exports = router;