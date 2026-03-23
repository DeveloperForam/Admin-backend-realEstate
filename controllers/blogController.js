const Blog = require("../models/blog");

// GET
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ _id: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD
exports.addBlog = async (req, res) => {
  try {
    const blog = new Blog(req.body);
    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Blog.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};