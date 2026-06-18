const express = require("express");

const router = express.Router();

const bannerRoutes = require("./bannerRoutes");

const blogRoutes = require("./blogRoutes");

const contactRoutes = require("./contactRoutes");

// Test Route
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Working"
  });
});


router.use("/banners", bannerRoutes);

router.use("/blogs", blogRoutes);

router.use("/contact", contactRoutes);

module.exports = router;