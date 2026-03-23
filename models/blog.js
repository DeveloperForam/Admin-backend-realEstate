const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  excerpt: { type: String, required: true },
  link: String,
  date: String,
  readTime: String,

  // ✅ Use ONLY images array
  images: [String],

  author: {
    name: String,
    role: String
  }
});

module.exports = mongoose.model("Blog", blogSchema);