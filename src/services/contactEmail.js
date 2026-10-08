const transporter = require("../config/mail");

const sendContactEmail = async (data) => {
  const submittedAt = new Date(
    data.createdAt || Date.now()
  ).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const html = `
    <div style="font-family:Arial,sans-serif;background:#f5f7fb;padding:30px;">
      <div style="max-width:650px;margin:auto;background:#ffffff;border-radius:16px;overflow:hidden;">

        <div style="background:#0f172a;padding:28px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;">
            New Contact Inquiry
          </h1>

          <div style="
            margin-top:12px;
            display:inline-block;
            background:rgba(255,255,255,0.12);
            color:#ffffff;
            padding:8px 14px;
            border-radius:999px;
            font-size:13px;
          ">
            ${submittedAt}
          </div>
        </div>

        <div style="padding:32px;">

          <table width="100%" cellpadding="12" style="border-collapse:collapse;">

            <tr>
              <td><strong>Name</strong></td>
              <td>${data.name}</td>
            </tr>

            <tr style="background:#f8fafc;">
              <td><strong>Email</strong></td>
              <td>${data.email}</td>
            </tr>

            <tr>
              <td><strong>Phone</strong></td>
              <td>${data.phone || "Not provided"}</td>
            </tr>

            <tr style="background:#f8fafc;">
              <td><strong>Submitted On</strong></td>
              <td>${submittedAt}</td>
            </tr>

            <tr>
              <td><strong>Subject</strong></td>
              <td>${data.subject || "No subject"}</td>
            </tr>

            <tr style="background:#f8fafc;">
              <td><strong>Message</strong></td>
              <td>${data.message}</td>
            </tr>

          </table>

          <div style="text-align:center;margin-top:32px;">
            <a
              href="mailto:${data.email}"
              style="
                background:#2563eb;
                color:#ffffff;
                text-decoration:none;
                padding:14px 28px;
                border-radius:10px;
                display:inline-block;
                font-weight:600;
              "
            >
              Reply to Customer
            </a>
          </div>

        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Visezy Website" <${process.env.SMTP_USER}>`,
    to: process.env.OWNER_EMAIL,
    replyTo: data.email,
    subject: `New Contact Inquiry - ${data.name}`,
    html,
  });
};

module.exports = sendContactEmail;