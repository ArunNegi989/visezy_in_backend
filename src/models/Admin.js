const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 8,
            select: false,
        },

        role: {
            type: String,
            default: "admin",
            enum: ["admin"],
        },

        verified: {
            type: Boolean,
            default: false,
        },

        active: {
            type: Boolean,
            default: true,
        },

        otp: {
            type: String,
            default: null,
        },

        otpExpiry: {
            type: Date,
            default: null,
        },

        otpResendCount: {
            type: Number,
            default: 0,
        },

        otpResendDate: {
            type: Date,
            default: null,
        },

        resetPasswordToken: {
            type: String,
            default: null,
        },

        resetPasswordExpiry: {
            type: Date,
            default: null,
        },

        lastLogin: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

adminSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(
        this.password,
        salt
    );
});
adminSchema.methods.comparePassword =
    async function (password) {
        return await bcrypt.compare(
            password,
            this.password
        );
    };

adminSchema.methods.isOTPExpired =
    function () {
        if (!this.otpExpiry) return true;

        return this.otpExpiry < new Date();
    };

adminSchema.methods.isResetTokenExpired =
    function () {
        if (!this.resetPasswordExpiry)
            return true;

        return (
            this.resetPasswordExpiry <
            new Date()
        );
    };

module.exports = mongoose.model(
    "Admin",
    adminSchema
);