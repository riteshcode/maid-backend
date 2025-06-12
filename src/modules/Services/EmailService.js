const nodemailer = require("nodemailer"); // sendgrid node mailer
const logger = require("../../utils/logger");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// async..await is not allowed in global scope, must use a wrapper
exports.sendEmail = async (toMail, subject, htmlContent) => {
  try {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: "ritesh@braintechnosys.com", // sender address
      to: toMail, // list of receivers: "bar@example.com, baz@example.com"
      subject: subject, // Subject line
      html: htmlContent, // html body
    });
    logger.error(`Email Service Sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Email Service : sendEmail - Error: ${error.message}`);
    throw new Error(error.message);
  }
};
