const BookingHistory = require("../models/bookingHistory");
const Booking = require("../models/booking");

/* ================= ADD PAYMENT ================= */
exports.addPayment = async (req, res) => {
  try {
    // console.log("Request Body:", req.body);  // ✅ Print incoming data

    const {
      bookingId,
      amountReceived,
      paymentReceivedDate,
      paymentMethod,
    } = req.body;

    const booking = await Booking.findById(bookingId);
    // console.log("Booking Data:", booking);   // ✅ Print booking data

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const totalAmount = booking.totalAmount;
    const advancePayment = booking.advancePayment || 0;

    // Initial Pending
    const initialPending = totalAmount - advancePayment;

    // Get total already received
    const previousPayments = await BookingHistory.find({ bookingId });

    const totalReceivedBefore = previousPayments.reduce(
      (sum, item) => sum + item.amountReceived,
      0
    );

    const totalReceivedNow =
      totalReceivedBefore + Number(amountReceived);

    let pendingAfterAmount = initialPending - totalReceivedNow;

    if (pendingAfterAmount < 0) {
      pendingAfterAmount = 0;
    }

    const currentStatus =
      pendingAfterAmount === 0 ? "Paid" : "Pending";

    // const test = "Hello";
    // Save history
    const history = new BookingHistory({
      bookingId,
      customerName: booking.customerName,
      houseNumber: booking.houseNumber,
      totalAmount,
      advancePayment,
      amountReceived,
      pendingAmount: pendingAfterAmount,
      paymentReceivedDate,
      paymentMethod,
    });

    
    await history.save();
    // console.log("Saved History:", history);   // ✅ Print saved history

    booking.pendingAmount = pendingAfterAmount;
    booking.status = currentStatus;

    await booking.save();
    // console.log("Updated Booking:", booking); // ✅ Print updated booking

    console.log({
  bookingId,
  initialPending,
  totalReceivedBefore,
  pendingAfterAmount,
  currentStatus,
});

    res.status(201).json({
      message: "Payment added successfully",
      history,
    });

  } catch (error) {
    console.log("Add Payment Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET HISTORY ================= */
exports.getBookingHistory = async (req, res) => {
  try {
    const { bookingId } = req.params;

    console.log("Booking ID:", bookingId);  // ✅ Print ID

    const history = await BookingHistory.find({ bookingId }).sort({
      paymentReceivedDate: 1,
    });

    console.log("History Data:", history);  // ✅ Print history

    res.status(200).json(history);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};