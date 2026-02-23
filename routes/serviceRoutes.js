const express = require("express");
const upload = require("../middleware/upload");
const controller = require("../controllers/serviceController");

const router = express.Router();

// ✅ CREATE SERVICE
router.post(
  "/",
  (req, res, next) => {
    req.uploadFolder = "services"; // uploads/services
    next();
  },
  upload.single("image"),
  controller.createService
);

// ✅ UPDATE SERVICE
router.put(
  "/:id",
  (req, res, next) => {
    req.uploadFolder = "services"; // uploads/services
    next();
  },
  upload.single("image"),
  controller.updateService
);

// ✅ GET ALL SERVICES
router.get("/", controller.getAllServices);

// ✅ DELETE SERVICE
router.delete("/:id", controller.deleteService);

// ✅ GET SINGLE SERVICE
router.get("/:id", controller.getServiceById);

module.exports = router;
