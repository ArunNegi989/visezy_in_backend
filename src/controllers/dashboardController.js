const Blog = require("../models/Blog");
const Banner = require("../models/Banner");
const ContactInquiry = require("../models/ContactiIquiry");

exports.getDashboard = async (req, res) => {
  try {
    // =========================
    // Stats
    // =========================

    const [
      totalBlogs,
      totalBanners,
      totalContacts,
      activeBanners,
      pendingContacts,
    ] = await Promise.all([
      Blog.countDocuments(),
      Banner.countDocuments(),
      ContactInquiry.countDocuments(),
      Banner.countDocuments({ isActive: true }),
      ContactInquiry.countDocuments({
        status: "Pending",
      }),
    ]);

    // =========================
    // Last 6 Months Analytics
    // =========================

    const months = [];
    const monthMap = {};

    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      const key = `${date.getFullYear()}-${date.getMonth()}`;

      const label = date.toLocaleString("default", {
        month: "short",
      });

      monthMap[key] = {
        month: label,
        blogs: 0,
        banners: 0,
        contacts: 0,
      };

      months.push(monthMap[key]);
    }

    const blogData = await Blog.find().select(
      "createdAt"
    );

    const bannerData = await Banner.find().select(
      "createdAt"
    );

    const contactData =
      await ContactInquiry.find().select(
        "createdAt"
      );

    blogData.forEach((item) => {
      const d = new Date(item.createdAt);

      const key = `${d.getFullYear()}-${d.getMonth()}`;

      if (monthMap[key]) monthMap[key].blogs++;
    });

    bannerData.forEach((item) => {
      const d = new Date(item.createdAt);

      const key = `${d.getFullYear()}-${d.getMonth()}`;

      if (monthMap[key]) monthMap[key].banners++;
    });

    contactData.forEach((item) => {
      const d = new Date(item.createdAt);

      const key = `${d.getFullYear()}-${d.getMonth()}`;

      if (monthMap[key]) monthMap[key].contacts++;
    });

    // =========================
    // Recent Activities
    // =========================

    const latestBlogs = await Blog.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select("title createdAt");

    const latestBanners = await Banner.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select("title createdAt");

    const latestContacts =
      await ContactInquiry.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .select("name createdAt");

    const activities = [
      ...latestBlogs.map((b) => ({
        type: "blog",
        title: b.title,
        action: "New Blog Published",
        createdAt: b.createdAt,
      })),

      ...latestBanners.map((b) => ({
        type: "banner",
        title: b.title,
        action: "Hero Banner Added",
        createdAt: b.createdAt,
      })),

      ...latestContacts.map((c) => ({
        type: "contact",
        title: c.name,
        action: "New Contact Inquiry",
        createdAt: c.createdAt,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 3);

    // =========================
    // Response
    // =========================

    return res.status(200).json({
      success: true,

      stats: {
        blogs: totalBlogs,
        banners: totalBanners,
        contacts: totalContacts,
        activeBanners,
        pendingContacts,
      },

      analytics: months,

      activities,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};