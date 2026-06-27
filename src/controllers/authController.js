const Admin = require("../models/Admin");
const generateToken = require("../config/jwt");
const cookieOptions = require("../utils/cookieOptions");
const generateResetToken = require("../utils/generateResetToken");
const sendResetPasswordEmail = require("../utils/sendResetPasswordEmail");
const generateOTP = require("../utils/generateOTP");
const crypto = require("crypto");
const validatePassword = require("../utils/passwordPolicy");
const sendOTPEmail = require("../utils/sendOTPEmail");


exports.adminExists = async (req, res) => {
    try {
        const exists = await Admin.exists({});

        return res.status(200).json({
            success: true,
            exists: !!exists,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.signup = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
        } = req.body;

        if (
            !name ||
            !email ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required.",
            });
        }

        const adminExists =
            await Admin.exists({});

        if (adminExists) {
            return res.status(403).json({
                success: false,
                message:
                    "Admin account already exists.",
            });
        }

        const validation =
            validatePassword(password);

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message:
                    validation.errors[0],
            });
        }

        const otp = generateOTP();

        const otpExpiry =
            new Date(
                Date.now() +
                10 * 60 * 1000
            );

        const admin =
            await Admin.create({
                name,
                email:
                    email.toLowerCase(),
                password,
                otp,
                otpExpiry,
            });

        await sendOTPEmail(
            admin.email,
            admin.name,
            otp
        );

        return res.status(201).json({
            success: true,
            message:
                "OTP sent successfully.",
            email: admin.email,
        });
    } catch (error) {
    console.error("Signup Error:", error);

    return res.status(500).json({
        success: false,
        message: error.message,
    });
}
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Required Fields
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required.",
            });
        }

        // Find Admin
        const admin = await Admin.findOne({
            email: email.toLowerCase(),
        });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found.",
            });
        }

        // Already Verified
        if (admin.verified) {
            return res.status(400).json({
                success: false,
                message: "Account is already verified.",
            });
        }

        // OTP Exists
        if (!admin.otp) {
            return res.status(400).json({
                success: false,
                message: "OTP not found. Please request a new OTP.",
            });
        }

        // OTP Expired
        if (admin.isOTPExpired()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired.",
            });
        }

        // OTP Match
        if (admin.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP.",
            });
        }

        // Verify Account
        admin.verified = true;

        admin.otp = null;
        admin.otpExpiry = null;

        admin.otpResendCount = 0;
        admin.otpResendDate = null;

        admin.lastLogin = new Date();

        await admin.save();

        return res.status(200).json({
            success: true,
            message:
                "Email verified successfully. Please login.",
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate Email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }

        const admin = await Admin.findOne({
            email: email.toLowerCase(),
        });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found.",
            });
        }

        // Already Verified
        if (admin.verified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified.",
            });
        }

        const today = new Date();

        // Reset counter if it's a new day
        if (
            !admin.otpResendDate ||
            admin.otpResendDate.toDateString() !==
            today.toDateString()
        ) {
            admin.otpResendCount = 0;
            admin.otpResendDate = today;
        }

        // Maximum 3 resends
        if (admin.otpResendCount >= 3) {
            return res.status(429).json({
                success: false,
                message:
                    "Maximum OTP resend limit reached for today.",
            });
        }

        // Generate New OTP
        const otp = generateOTP();

        admin.otp = otp;

        admin.otpExpiry = new Date(
            Date.now() + 10 * 60 * 1000
        );

        admin.otpResendCount += 1;

        admin.otpResendDate = today;

        await admin.save();

        await sendOTPEmail(
            admin.email,
            admin.name,
            otp
        );

        return res.status(200).json({
            success: true,
            message: "OTP resent successfully.",
            remainingAttempts:
                3 - admin.otpResendCount,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Required Fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }

        // Find Admin
        const admin = await Admin.findOne({
            email: email.toLowerCase(),
        }).select("+password");

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        // Check Verified
        if (!admin.verified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email first.",
            });
        }

        // Check Active
        if (!admin.active) {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated.",
            });
        }

        // Password Check
        const isMatch =
            await admin.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        // Update Login Time
        admin.lastLogin = new Date();

        await admin.save();

        // Generate JWT
        const token = generateToken(admin._id);

        // Store in Cookie
        res.cookie(
            "adminToken",
            token,
            cookieOptions
        );

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

exports.logout = async (req, res) => {
    try {

        res.clearCookie("adminToken", {
            httpOnly: true,
            secure:
                process.env.NODE_ENV === "production",
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully.",
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

exports.getCurrentAdmin = async (
    req,
    res
) => {
    try {

        const admin =
            await Admin.findById(req.user.id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found.",
            });
        }

        return res.status(200).json({
            success: true,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                verified: admin.verified,
                active: admin.active,
                lastLogin: admin.lastLogin,
            },
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

exports.forgotPassword = async (
    req,
    res
) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }

        const admin = await Admin.findOne({
            email: email.toLowerCase(),
        });

        /**
         * Security:
         * Never reveal whether
         * an email exists.
         */
        if (!admin) {
            return res.status(200).json({
                success: true,
                message:
                    "If an account exists with this email, a password reset link has been sent.",
            });
        }

        if (!admin.verified) {
            return res.status(400).json({
                success: false,
                message:
                    "Please verify your email first.",
            });
        }

        if (!admin.active) {
            return res.status(403).json({
                success: false,
                message:
                    "Account is inactive.",
            });
        }

        const {
            token,
            hashedToken,
        } = generateResetToken();

        admin.resetPasswordToken =
            hashedToken;

        admin.resetPasswordExpiry =
            new Date(
                Date.now() +
                15 * 60 * 1000
            );

        await admin.save();

        await sendResetPasswordEmail(
            admin.email,
            admin.name,
            token
        );

        return res.status(200).json({
            success: true,
            message:
                "If an account exists with this email, a password reset link has been sent.",
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

exports.resetPassword = async (
    req,
    res
) => {
    try {

        const { token } = req.params;

        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required.",
            });
        }

        // Validate Password Policy

        const validation =
            validatePassword(password);

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message:
                    validation.errors[0],
            });
        }

        // Hash Incoming Token

        const hashedToken =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");

        // Find Admin

        const admin = await Admin.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpiry: { $gt: new Date() },
        }).select("+password");

        if (!admin) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid reset link.",
            });
        }

        // Expired?

        if (
            admin.isResetTokenExpired()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Reset link has expired.",
            });
        }

        // New password same?

        const samePassword =
            await admin.comparePassword(
                password
            );

        if (samePassword) {
            return res.status(400).json({
                success: false,
                message:
                    "New password cannot be the same as the current password.",
            });
        }

        // Save New Password

        admin.password = password;

        admin.resetPasswordToken =
            null;

        admin.resetPasswordExpiry =
            null;

        await admin.save();

        return res.status(200).json({
            success: true,
            message:
                "Password reset successfully. Please login.",
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

exports.changePassword = async (
    req,
    res
) => {
    try {

        const {
            oldPassword,
            newPassword,
            confirmPassword,
        } = req.body;

        // Required Fields

        if (
            !oldPassword ||
            !newPassword ||
            !confirmPassword
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "All fields are required.",
            });
        }

        // Confirm Password

        if (
            newPassword !==
            confirmPassword
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Passwords do not match.",
            });
        }

        // Password Policy

        const validation =
            validatePassword(
                newPassword
            );

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message:
                    validation.errors[0],
            });
        }

        // Current Admin

        const admin =
            await Admin.findById(
                req.user.id
            ).select("+password");

        if (!admin) {
            return res.status(404).json({
                success: false,
                message:
                    "Admin not found.",
            });
        }

        // Old Password

        const isMatch =
            await admin.comparePassword(
                oldPassword
            );

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message:
                    "Old password is incorrect.",
            });
        }

        // Same Password

        const samePassword =
            await admin.comparePassword(
                newPassword
            );

        if (samePassword) {
            return res.status(400).json({
                success: false,
                message:
                    "New password cannot be the same as the old password.",
            });
        }

        admin.password =
            newPassword;

        await admin.save();

        return res.status(200).json({
            success: true,
            message:
                "Password changed successfully.",
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message:
                error.message,
        });

    }
};