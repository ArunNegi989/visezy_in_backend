const ContactInquiry = require("../models/ContactiIquiry");
const sendContactEmail = require("../utils/sendContactEmail");

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
    const limit = 10;

    const total = await ContactInquiry.countDocuments();

    const inquiries = await ContactInquiry.find()
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
    const inquiry = await ContactInquiry.findById(req.params.id);

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