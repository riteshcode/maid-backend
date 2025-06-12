const twilio = require("twilio");
const accountId = process.env.TWILIO_ACCOUNT_ID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_FROM_PHONE;

const client = twilio(accountId, authToken);

// send messages to users using twilio
exports.sendMessages = async (mobile, message) => {
  try {
    await client.messages.create({
      body: message,
      from: fromPhone,
      to:mobile,
    });

    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};
