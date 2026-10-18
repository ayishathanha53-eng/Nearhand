const nodemailer = require("nodemailer");

async function sendInterviewEmail({
  to,
  providerName,
  interviewDate,
  interviewNotes,
}) {
  if (!process.env.ADMIN_EMAIL || !process.env.EMAIL_APP_PASSWORD) {
    throw new Error("Admin email configuration is missing in .env");
  }

  if (!to) {
    throw new Error("Provider email address is missing");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(interviewDate));

  const message = [
    `Dear ${providerName || "Provider"},`,
    "",
    "Greetings from NearHand!",
    "",
    "Your provider interview has been scheduled. Please find the details below:",
    "",
    `Interview date and time: ${formattedDate} (IST)`,
    "",
    interviewNotes
      ? `Additional details: ${interviewNotes}`
      : "Please contact the NearHand admin if you need further information.",
    "",
    "Please be available at the scheduled time.",
    "",
    "Regards,",
    "NearHand Admin",
  ].join("\n");

  await transporter.sendMail({
    from: `NearHand Admin <${process.env.ADMIN_EMAIL}>`,
    to,
    subject: "NearHand Provider Interview Invitation",
    text: message,
  });
}

module.exports = sendInterviewEmail;