const transporter = require("../config/mail");

const sendOTPEmail = async (
  email,
  name,
  otp
) => {
  await transporter.sendMail({
    from: `"Visezy Admin" <${process.env.SMTP_USER}>`,

    to: email,

    subject: "Verify Your Email",

    html: `
        <div style="font-family:Arial;padding:30px;background:#f5f7fb;">
            <div style="max-width:600px;margin:auto;background:#fff;padding:40px;border-radius:10px;">

                <h2>Hello ${name},</h2>

                <p>
                    Thank you for registering your Visezy Admin account.
                </p>

                <p>
                    Your One-Time Password is:
                </p>

                <h1 style="letter-spacing:8px;color:#2563eb;">
                    ${otp}
                </h1>

                <p>
                    This OTP will expire in
                    <strong>10 minutes</strong>.
                </p>

                <hr>

                <p style="font-size:13px;color:#666;">
                    If you didn't request this,
                    please ignore this email.
                </p>

            </div>
        </div>
        `,
  });
};

module.exports = sendOTPEmail;