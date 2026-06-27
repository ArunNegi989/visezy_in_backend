const express = require("express");

const router = express.Router();

const {
  createInquiry,
  getInquiries,
  getInquiry,
  updateInquiryStatus,
} = require("../controllers/contactController");

router.post("/", createInquiry);

router.get("/", getInquiries);

router.get("/:id", getInquiry);

router.patch("/:id/status", updateInquiryStatus);

module.exports = router;