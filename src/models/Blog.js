const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    excerpt: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      default: "",
    },

    contentBlocks: {
      type: Array,
      default: [],
    },

    category: {
      type: String,
      required: true,
    },

    author: {
      type: String,
      default: "Admin",
    },

    status: {
      type: String,
      enum: ["Published", "Draft"],
      default: "Draft",
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      required: true,
    },

    readTime: {
      type: String,
      default: "5 min read",
    },

    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Blog",
  blogSchema
);