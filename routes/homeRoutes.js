const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload"); // ✅ added

const {
  createProject,
  getProjects,
  getNearbyProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectDetails,
  getProjectHouseList,
  getProjectsCount,
  getHouseStatusCounts,
  deleteProjectImage,
  updateProjectImage,
} = require("../controllers/homeController");

// ==============================
// CREATE PROJECT (with images)
// ==============================
router.post(
  "/",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "floorPlans", maxCount: 10 },
  ]),
  createProject
);

// COUNTS
router.get("/nearby", getNearbyProjects);
router.get("/count", getProjectsCount);

// DETAILS & HOUSES
router.get("/details/:id", getProjectDetails);
router.get("/houses/:projectId", getProjectHouseList);

// PROJECT CRUD
router.get("/", getProjects);
router.get("/:id", getProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

router.get("/status-count", getHouseStatusCounts);
router.delete("/:id/image/:imageId", deleteProjectImage);
router.put(
  "/:id/image/:imageId",
  upload.single("image"),
  updateProjectImage
);

module.exports = router;
