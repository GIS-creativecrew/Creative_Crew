const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // or your SMTP provider
  auth: {
    user: process.env.MAIL_USER, // set in .env
    pass: process.env.MAIL_PASS,
  },
});

async function sendCandidateRegistrationMail({ email, token }) {
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "Interview Registration Confirmation",
    html: `
      <p>Dear Candidate,</p>
      <p>You have been registered for the interview process.</p>
      <p>Your unique token is: <b>${token}</b></p>
      <p>Please mark your attendance using your Email ID, Mobile Number, and this Token on the candidate login page.</p>
      <p>Best regards,<br/>TA Team</p>
    `,
  };
  await transporter.sendMail(mailOptions);
}

module.exports = { sendCandidateRegistrationMail };
