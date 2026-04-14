require('dotenv').config({ path: '../.env' });
const nodemailer = require('nodemailer');

const sendTestEmail = async () => {
  console.log("🚀 Testing LuxeDrive Email Service...");
  console.log("Using Email Source:", process.env.EMAIL_USER);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("❌ ERROR: EMAIL_USER or EMAIL_PASS missing in .env file!");
      return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"LuxeDrive Test" <${process.env.EMAIL_USER}>`,
    to: 'midhunshaj47@gmail.com',
    subject: 'LuxeDrive System Test: Premium Template ✅',
    html: `
      <div style="background-color: #000; padding: 40px; font-family: 'Helvetica', sans-serif; color: #fff; text-align: center; border: 2px solid #D4AF37; max-width: 600px; margin: auto;">
        <h1 style="color: #D4AF37; letter-spacing: 5px; margin-bottom: 5px;">LUXEDRIVE</h1>
        <p style="text-transform: uppercase; font-size: 10px; letter-spacing: 3px; color: #888; margin-top: 0;">Beyond First Class</p>
        <hr style="border: 0.5px solid #222; margin: 30px 0;" />
        <h2 style="font-weight: 300; color: #fff;">System Connection Successful</h2>
        <p style="font-size: 15px; line-height: 1.8; color: #ccc; margin: 20px 0;">
          This is a sample of the premium notification your clients will receive.
        </p>
        <hr style="border: 0.5px solid #222; margin: 30px 0;" />
        <p style="font-size: 10px; color: #444; letter-spacing: 1px;">© 2026 LUXEDRIVE INTERNATIONAL</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ SUCCESS: Sample email sent to midhunshaj47@gmail.com");
  } catch (error) {
    console.error("❌ FAILURE: Could not send email.");
    console.error("Error Detail:", error.message);
    console.log("\n💡 Reminder: Make sure you use a Gmail 'App Password', not your regular password.");
  }
};

sendTestEmail();
