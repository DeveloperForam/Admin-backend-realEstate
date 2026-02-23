const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
require("dotenv").config();

const lilyRoutes = require("./routes/homeRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const bookingHistoryRoutes = require("./routes/bookingHistoryRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const faqRoutes = require("./routes/faqRoutes");
const contactRoute = require("./routes/contactRoutes");

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= STATIC FILES ================= */
// VERY IMPORTANT
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ================= ROUTES ================= */
connectDB().then(() => {
  console.log("MongoDB connected");

  app.use("/api/lily", lilyRoutes);
  app.use("/api/services", serviceRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/booking-history", bookingHistoryRoutes);
  app.use("/api/testimonials", testimonialRoutes);
  app.use("/api/faqs", faqRoutes);
  app.use("/api/contact", contactRoute);

  // Add this route to test file serving
app.get("/test-uploads", (req, res) => {
  const fs = require("fs");
  const path = require("path");
  
  const uploadsPath = path.join(__dirname, "uploads");
  const projectsPath = path.join(__dirname, "uploads/projects");
  
  try {
    const filesInUploads = fs.readdirSync(uploadsPath);
    const filesInProjects = fs.readdirSync(projectsPath);
    
    res.json({
      uploadsDir: uploadsPath,
      projectsDir: projectsPath,
      filesInUploads,
      filesInProjects
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`🚀 Server running on port ${PORT}`)
  );
});
