const Service = require("../models/Service");
const Counter = require("../models/counter");
const fs = require("fs");
const path = require("path");

// ➕ CREATE SERVICE
exports.createService = async (req, res) => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { model: "service" },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );

    const service = new Service({
      id: counter.count,

      title: req.body.title,
      shortDescription: req.body.shortDescription,
      description: req.body.description,

      features: req.body.features
        ? req.body.features.split(",").map((f) => f.trim())
        : [],

      amenities: req.body.amenities
        ? req.body.amenities.split(",").map((a) => a.trim())
        : [],

      // ✅ Save full path
      image: req.file ? `uploads/services/${req.file.filename}` : null,
    });

    await service.save();

    res.status(201).json({ success: true, data: service });
  } catch (error) {
    console.error("CREATE ERROR:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// 📥 GET ALL SERVICES
exports.getAllServices = async (req, res) => {
  const services = await Service.find().sort({ id: 1 });
  res.json({ success: true, data: services });
};

// 📄 GET SINGLE SERVICE BY ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findOne({
      id: Number(req.params.id),
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✏ UPDATE SERVICE
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findOne({ id: req.params.id });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // ✅ Update fields
    service.title = req.body.title;
    service.shortDescription = req.body.shortDescription;
    service.description = req.body.description;

    service.features = req.body.features
      ? req.body.features.split(",").map((f) => f.trim())
      : [];

    service.amenities = req.body.amenities
      ? req.body.amenities.split(",").map((a) => a.trim())
      : [];

    // ✅ If new image uploaded
    if (req.file) {
      // Delete old image file
      if (service.image) {
        const oldPath = path.join(__dirname, "..", service.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      // Save new image
      service.image = `uploads/services/${req.file.filename}`;
    }

    await service.save();

    res.json({ success: true, data: service });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// 🗑 DELETE SERVICE
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findOne({ id: req.params.id });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // ✅ Delete image file also
    if (service.image) {
      const imgPath = path.join(__dirname, "..", service.image);

      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    await Service.findOneAndDelete({ id: req.params.id });

    res.json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
