const express = require("express");

const router = express.Router();

const {
  createInquiry,
  getInquiries,
  getInquiry,
} = require("../controllers/contactController");

router.post("/", createInquiry);

router.get("/", getInquiries);

router.get("/:id", getInquiry);

module.exports = router;