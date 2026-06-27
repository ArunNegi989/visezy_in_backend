const transporter = require("../config/mail");

const sendResetPasswordEmail = async (
  email,
  name,
  token
) => {
  const resetLink =
    `${process.env.FRONTEND_URL}` +
    `/admin/reset-password/${token}`;

  await transporter.sendMail({
    from: `"Visezy Admin" <${process.env.SMTP_USER}>`,

    to: email,

    subject: "Reset Your Password",

    html: `
        <div style="font-family:Arial;padding:30px;background:#f5f7fb;">

            <div style="max-width:600px;margin:auto;background:white;padding:40px;border-radius:10px;">

                <h2>Hello ${name},</h2>

                <p>
                    We received a request to reset your password.
                </p>

                <p>
                    Click the button below.
                </p>

                <a
                    href="${resetLink}"
                    style="
                        display:inline-block;
                        padding:14px 24px;
                        background:#2563eb;
                        color:white;
                        text-decoration:none;
                        border-radius:8px;
                        margin:20px 0;
                    "
                >
                    Reset Password
                </a>

                <p>
                    This link expires in
                    <strong>15 minutes</strong>.
                </p>

                <hr>

                <p style="font-size:13px;color:#666;">
                    If you didn't request this,
                    ignore this email.
                </p>

            </div>

        </div>
        `,
  });
};

module.exports = sendResetPasswordEmail;