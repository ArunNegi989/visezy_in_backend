const CashbackLead = require("../models/CashbackLead");

const createCashbackLead = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    if (!phone?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required.",
      });
    }

    /*
     * E.164 international format
     *
     * +919876543210
     * +14155552671
     * +447911123456
     */
    const phoneRegex = /^\+[1-9]\d{7,14}$/;

    if (!phoneRegex.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        message: "Invalid international mobile number.",
      });
    }

    const lead = await CashbackLead.create({
      name: name.trim(),
      phone: phone.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Cashback request submitted successfully.",
      data: lead,
    });
  } catch (error) {
    console.error("Cashback Lead Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit cashback request.",
    });
  }
};

const getCashbackLeads = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
    } = req.query;

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 100);

    const skip = (pageNumber - 1) * limitNumber;

    const query = {};

    // Status filter
    if (status) {
      query.status = status;
    }

    // Search by name or phone
    if (search.trim()) {
      query.$or = [
        {
          name: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          phone: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    const [leads, total] = await Promise.all([
      CashbackLead.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      CashbackLead.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,

      data: leads,

      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Get Cashback Leads Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch cashback leads.",
    });
  }
};
const updateCashbackLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "new",
      "contacted",
      "converted",
      "closed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status.",
      });
    }

    const lead = await CashbackLead.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Cashback lead not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Status updated successfully.",
      data: lead,
    });
  } catch (error) {
    console.error("Update Cashback Lead Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update status.",
    });
  }
};

module.exports = {
  createCashbackLead,
  getCashbackLeads,
  updateCashbackLeadStatus,
};