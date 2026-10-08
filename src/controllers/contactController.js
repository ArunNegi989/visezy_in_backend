const ContactInquiry = require("../models/ContactiIquiry");
const sendContactEmail = require("../services/contactEmail");

exports.createInquiry = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const inquiry = await ContactInquiry.create({
      name,
      email,
      phone,
      subject,
      message,
    });

    await sendContactEmail(inquiry);

    res.status(201).json({
      success: true,
      message: "Inquiry submitted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getInquiries = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const search = req.query.search || "";
    const status = req.query.status || "";

    const query = {};

    if (search) {
      query.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          phone: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (status && status !== "All") {
      query.status = status;
    }

    const total = await ContactInquiry.countDocuments(
      query
    );

    const inquiries = await ContactInquiry.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: inquiries,
      pagination: {
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getInquiry = async (req, res) => {
  try {
    const inquiry = await ContactInquiry.findById(
      req.params.id
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      data: inquiry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateInquiryStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    const inquiry =
      await ContactInquiry.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      data: inquiry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};