const express = require("express");

const router = express.Router();

const upload = require(
  "../middleware/uploadBanner"
);

const {
  getBanners,
  getBanner,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
  reorderBanner,
} = require(
  "../controllers/bannerController"
);

router.get("/", getBanners);

router.get("/:id", getBanner);

router.post(
  "/",
  upload.single("image"),
  createBanner
);

router.put(
  "/:id",
  upload.single("image"),
  updateBanner
);

router.patch(
  "/:id/status",
  toggleBannerStatus
);

router.patch(
  "/:id/reorder",
  reorderBanner
);

router.delete("/:id", deleteBanner);

module.exports = router;