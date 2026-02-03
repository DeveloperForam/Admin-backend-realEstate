const Lily = require("../models/home");
const HouseListing = require("../models/house");
const Booking = require("../models/booking");

// ==============================
// CREATE PROJECT
// ==============================
exports.createProject = async (req, res) => {
  try {
    const data = req.body;

    // 🖼 project images
    if (req.files?.images) {
      data.images = req.files.images.map(file => ({
        url: `/uploads/projects/${file.filename}`,
      }));
    }

    // 🏢 floor plans (1–3)
    if (req.files?.floorPlans) {
      data.floorPlans = req.files.floorPlans.map((file, i) => ({
        title: `Floor Plan ${i + 1}`,
        url: `/uploads/projects/${file.filename}`,
      }));
    }

    // ⭐ amenities (comma separated from frontend)
    if (data.amenities) {
      data.amenities = Array.isArray(data.amenities)
        ? data.amenities
        : data.amenities.split(",");
    }

    const project = new Lily(data);
    await project.save();

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ==============================
// GET ALL PROJECTS
// ==============================
exports.getProjects = async (req, res) => {
  try {
    const projects = await Lily.find().select(`
      id
      projectName
      projectType
      location
      geoLocation
      images
      amenities
      totalWings
      totalFloors
      perFloorHouse
      totalPlots
    `);

    res.json({
      success: true,
      data: projects,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getNearbyProjects = async (req, res) => {
  try {
    const { lat, lng, distance = 5000 } = req.query; // meters

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude and Longitude required",
      });
    }

    const projects = await Lily.find({
      geoLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)],
          },
          $maxDistance: Number(distance),
        },
      },
    });

    res.json({
      success: true,
      data: projects,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ==============================
// GET PROJECT COUNT
// ==============================
exports.getProjectsCount = async (req, res) => {
  try {
    const total = await Lily.countDocuments();

    res.json({
      success: true,
      totalProjects: total,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==============================
// GET ONE PROJECT
// ==============================
exports.getProject = async (req, res) => {
  try {
    const project = await Lily.findOne({ id: Number(req.params.id) });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==============================
// UPDATE PROJECT
// ==============================
exports.updateProject = async (req, res) => {
  try {
    const updated = await Lily.findOneAndUpdate(
      { id: Number(req.params.id) },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json({
      success: true,
      message: "Project updated successfully",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==============================
// DELETE PROJECT
// ==============================
exports.deleteProject = async (req, res) => {
  try {
    const projectId = Number(req.params.id);

    await Lily.deleteOne({ id: projectId });
    await HouseListing.deleteMany({ projectId });

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==============================
// GET PROJECT DETAILS (Dropdown / List)
// ==============================
exports.getProjectDetails = async (req, res) => {
  try {
    const projects = await Lily.find({})
      .select("id projectName projectType location")
      .sort({ id: 1 });

    res.json({
      success: true,
      data: projects,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==============================
// GET HOUSE LIST (Availability via Booking)
// ==============================
exports.getProjectHouseList = async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);

    const project = await Lily.findOne({ id: projectId });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Booking decides availability
    const bookings = await Booking.find({ projectId });
    const bookedSet = new Set(bookings.map(b => String(b.houseNumber)));

    const houses = project.houseNumbers.map(no => ({
      projectId,
      houseNumber: no,
      status: bookedSet.has(String(no)) ? "booked" : "available",
    }));

    res.json({
      success: true,
      data: houses,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==============================
// GET HOUSE STATUS COUNTS
// ==============================
exports.getHouseStatusCounts = async (req, res) => {
  try {
    const result = await HouseListing.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const counts = { available: 0, booked: 0, sold: 0 };
    result.forEach(r => (counts[r._id] = r.count));

    res.json({
      success: true,
      data: counts,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const fs = require("fs");
const path = require("path");

exports.deleteProjectImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    const project = await Lily.findOne({ id: Number(id) });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const image = project.images.id(imageId);
    if (!image) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    // delete file
    const filePath = path.join(__dirname, "..", image.url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    image.remove();
    await project.save();

    res.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProjectImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    const project = await Lily.findOne({ id: Number(id) });
    if (!project) return res.status(404).json({ success: false });

    const image = project.images.id(imageId);
    if (!image) return res.status(404).json({ success: false });

    // remove old file
    const oldPath = path.join(__dirname, "..", image.url);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

    // save new file
    image.url = `/uploads/${req.file.filename}`;
    await project.save();

    res.json({
      success: true,
      message: "Image updated successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

