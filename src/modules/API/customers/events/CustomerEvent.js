var events = require('events');
const { sendEmail } = require('../../../Services/EmailService');
var customerEvent = new events.EventEmitter();

customerEvent.on('welcome-email-customer-event', async (user)=>{
    console.log('welcome-email-customer-event', user);
    
    let Mesage = `Dear ${user.name}, Your account successfully created with MaidHive.`;

    let toMail = "habajo7190@deusa7.com";
    let mailContent = "";
    // send email to customer
    await sendEmail(toMail, Mesage, mailContent);

    // send Mesage using twilio
//   await sendMessages(user.mobile, Mesage);


});

exports.customerEvent = customerEvent;