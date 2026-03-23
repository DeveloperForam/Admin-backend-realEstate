const express = require("express");
const router = express.Router();
const controller = require("../controllers/blogController");

router.get("/", controller.getBlogs);
router.post("/add", controller.addBlog);
router.put("/update/:id", controller.updateBlog);

module.exports = router;