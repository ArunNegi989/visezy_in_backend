const express = require("express");

const {
  createCashbackLead,
  getCashbackLeads,
  updateCashbackLeadStatus,
} = require("../controllers/cashbackLeadController");

const router = express.Router();

/*
 * Public
 */
router.post("/cashback-leads", createCashbackLead);

/*
 * Admin
 *
 * Yaha apna existing admin middleware lagana.
 */
router.get("/admin/cashback-leads", getCashbackLeads);

router.patch(
  "/admin/cashback-leads/:id/status",
  updateCashbackLeadStatus
);

module.exports = router;