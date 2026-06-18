const Banner = require("../models/Banner");
const fs = require("fs");
const path = require("path");

// Helper: Delete image safely
const deleteImage = (imagePath) => {
  if (!imagePath) return;

  const fullPath = path.join(
  process.cwd(),
  imagePath.replace(/^\/+/, "")
);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

// Helper: Reorder banners sequentially
const normalizeDisplayOrder = async () => {
  const banners = await Banner.find()
    .sort({ displayOrder: 1 });

  const bulkOps = banners.map(
    (banner, index) => ({
      updateOne: {
        filter: { _id: banner._id },
        update: {
          displayOrder: index + 1,
        },
      },
    })
  );

  if (bulkOps.length) {
    await Banner.bulkWrite(bulkOps);
  }
};

exports.getBanners = async (req, res) => {
  try {
    const query = {};

    if (req.query.active === "true") {
      query.isActive = true;
    }

    const banners = await Banner.find(query)
      .sort({ displayOrder: 1 });

    return res.status(200).json({
      success: true,
      data: banners,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single banner
exports.getBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(
      req.params.id
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: banner,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create banner
exports.createBanner = async (req, res) => {
  try {
   if (!req.file) {
  return res.status(400).json({
    success: false,
    message: "Banner image is required",
  });
}

const existingCount =
  await Banner.countDocuments();

const image =
  `/uploads/banners/${req.file.filename}`;

    const banner = await Banner.create({
      ...req.body,
      image,
      displayOrder: existingCount + 1,
    });

    return res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: banner,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update banner
exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(
      req.params.id
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    let image = banner.image;

    if (req.file) {
  deleteImage(banner.image);

  image = `/uploads/banners/${req.file.filename}`;
}

   const updatedBanner =
  await Banner.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      image,
    },
    {
      new: true,
      runValidators: true,
    }
  );

    return res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: updatedBanner,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete banner
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(
      req.params.id
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    deleteImage(banner.image);

    await banner.deleteOne();

    await normalizeDisplayOrder();

    return res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Toggle active / inactive
exports.toggleBannerStatus = async (
  req,
  res
) => {
  try {
    const banner = await Banner.findById(
      req.params.id
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    banner.isActive = !banner.isActive;

    await banner.save();

    return res.status(200).json({
      success: true,
      data: banner,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Move banner up / down

exports.reorderBanner = async (req, res) => {
  try {
    const { direction } = req.body;

    const current = await Banner.findById(
      req.params.id
    );

    if (!current) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    const targetOrder =
      direction === "up"
        ? current.displayOrder - 1
        : current.displayOrder + 1;

    const swapBanner = await Banner.findOne({
      displayOrder: targetOrder,
    });

    if (!swapBanner) {
      return res.status(400).json({
        success: false,
        message: "Cannot move further",
      });
    }

    const currentOrder = current.displayOrder;

    // Step 1: temporary value
    current.displayOrder = -1;
    await current.save();

    // Step 2: swap banner
    swapBanner.displayOrder = currentOrder;
    await swapBanner.save();

    // Step 3: current banner
    current.displayOrder = targetOrder;
    await current.save();

    return res.status(200).json({
      success: true,
      message: "Banner reordered successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};