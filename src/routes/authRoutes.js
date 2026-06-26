const express = require("express");

const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  signup,
  adminExists,
  verifyOTP,
  resendOTP,
  login,
  logout,
  getCurrentAdmin,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../controllers/authController");

router.get("/admin-exists", adminExists);

router.post("/signup", signup);

router.post("/verify-otp", verifyOTP);

router.post("/resend-otp", resendOTP);

router.post("/login", login);

router.post("/logout", logout);

router.get(
  "/me",
  authMiddleware,
  getCurrentAdmin
);

router.post("/forgot-password", forgotPassword);

router.post(
    "/reset-password/:token",
    resetPassword
);

router.put(
    "/change-password",
    authMiddleware,
    changePassword
);

module.exports = router;