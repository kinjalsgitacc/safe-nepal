require("dotenv").config();
const nodemailer = require("nodemailer");

async function sendMail() {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let info = await transporter.sendMail({
    from: `"Kinjal Shrestha" <${process.env.EMAIL_USER}>`,
    to: "recipient@example.com",
    subject: "Test Email from Node.js",
    text: "Hello! This is a test email using Gmail SMTP.",
    html: "<b>Hello!</b> This is a test email using <i>Gmail SMTP</i>.",
  });

  console.log("Message sent: %s", info.messageId);
}

sendMail().catch(console.error);
