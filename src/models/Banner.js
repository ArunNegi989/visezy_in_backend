const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    badgeText: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    highlightedText: {
      type: String,
      required: true,
    },

    subTitle: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    primaryButtonText: String,
    primaryButtonLink: String,

    secondaryButtonText: String,
    secondaryButtonLink: String,

    image: {
      type: String,
      required: true,
    },

    displayOrder: {
  type: Number,
  unique: true,
  index: true,
},

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Banner",
  bannerSchema
);